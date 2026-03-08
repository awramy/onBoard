# Backend Development Roadmap — onBoard

## Текущее состояние

**Реализовано (8 эндпоинтов):**

- `GET /api/health` — healthcheck
- `POST /api/auth/register`, `POST /api/auth/login` — JWT-аутентификация
- `GET /api/technologies`, `GET /api/technologies/:id` — технологии с уровнями и топиками
- `POST /api/sessions`, `GET /api/sessions`, `GET /api/sessions/:id` — базовое CRUD сессий

**Не реализовано:**

- Нет отдельных эндпоинтов для топиков, вопросов, пользователей, прогресса
- Нет механизма старта сессии и генерации вопросов
- Нет подачи ответа и оценки через AI
- Нет обновления прогресса (UserQuestionProgress, UserTopicProgress)
- Нет завершения сессии с подсчётом баллов
- Нет AI-интеграции (ни одного провайдера)
- Redis подключён в Docker, но не используется в коде

## Архитектура (целевая)

```mermaid
graph TD
  subgraph apiLayer [API Layer]
    AuthCtrl[AuthController]
    TechCtrl[TechnologiesController]
    TopicsCtrl[TopicsController]
    QuestionsCtrl[QuestionsController]
    UsersCtrl[UsersController]
    SessionsCtrl[SessionsController]
  end

  subgraph serviceLayer [Service Layer]
    AuthSvc[AuthService]
    TechSvc[TechnologiesService]
    TopicsSvc[TopicsService]
    QuestionsSvc[QuestionsService]
    UsersSvc[UsersService]
    SessionsSvc[SessionsService]
    ProgressSvc[ProgressService]
    QuestionGenSvc[QuestionGeneratorService]
    AiSvc[AiService]
  end

  subgraph aiLayer [AI Core]
    AiProvider["AiProvider (interface)"]
    OpenAiProvider[OpenAiProvider]
    GeminiProvider[GeminiProvider]
    FreeProvider["FreeProvider (TBD)"]
  end

  SessionsCtrl --> SessionsSvc
  SessionsCtrl --> QuestionGenSvc
  SessionsCtrl --> AiSvc
  SessionsSvc --> ProgressSvc
  QuestionGenSvc --> ProgressSvc
  AiSvc --> AiProvider
  AiProvider --> OpenAiProvider
  AiProvider --> GeminiProvider
  AiProvider --> FreeProvider
  UsersCtrl --> UsersSvc
  UsersCtrl --> ProgressSvc
```

---

## Фаза 1 — CRUD-эндпоинты (основа для всех следующих фаз)

Создание модулей и ручек для работы с данными, которые уже есть в БД.

### 1.1 TopicsModule

Новый модуль `backend/src/topics/`.

- `GET /api/topics?levelId=<uuid>&lang=ru` — список топиков по `technologyLevelId`. Запрос через `TechnologyLevelTopic` join-таблицу. Локализация `name`/`description` через существующий `localize()` из `backend/src/common/utils/i18n.ts`.
- `GET /api/topics/:id?lang=ru` — один топик с его вопросами (count).

### 1.2 QuestionsModule

Новый модуль `backend/src/questions/`.

- `GET /api/questions?topicId=<uuid>&lang=ru` — список вопросов по `topicId`. Поля: id, text (локализован), type, difficulty. Без explanation (он нужен только после ответа).
- `GET /api/questions/:id?lang=ru` — один вопрос с explanation.

### 1.3 UsersModule

Новый модуль `backend/src/users/`.

- `GET /api/users/me` — профиль текущего пользователя (id, email, username, fullScore, league, createdAt). Использует `@CurrentUser()` декоратор.
- `GET /api/users` — список пользователей (admin-use, позже можно закрыть ролями). Поля: id, username, fullScore, league.
- `GET /api/users/me/progress` — агрегированный прогресс: по технологиям -> топикам -> вопросам. Объединяет данные из `UserTopicProgress` и `UserQuestionProgress`.
- `GET /api/users/me/progress/topics?technologyLevelId=<uuid>` — прогресс по топикам для конкретного уровня технологии.
- `GET /api/users/me/progress/questions?topicId=<uuid>` — прогресс по вопросам конкретного топика.

### 1.4 Исправления в существующих модулях

- `TechnologiesService.findOne()` — добавить `NotFoundException` вместо возврата `null`.
- Рассмотреть добавление пагинации (`skip`/`take`) для списковых эндпоинтов.

---

## Фаза 2 — Генерация вопросов и старт сессии

### 2.1 ProgressService (переиспользуемый сервис)

Новый модуль `backend/src/progress/` — отвечает за чтение и запись прогресса.

- `getQuestionProgress(userId, questionId)` — прогресс по одному вопросу
- `getTopicProgress(userId, topicId)` — прогресс по одному топику
- `getUnansweredQuestions(userId, technologyLevelId)` — вопросы без прогресса для данного уровня
- `updateQuestionProgress(userId, questionId, score)` — upsert прогресса
- `recalcTopicProgress(userId, topicId)` — пересчёт агрегата по топику

Этот сервис будет использоваться и в UsersModule (фаза 1), и в SessionsModule (фаза 2), и в AI-оценке (фаза 4).

### 2.2 QuestionGeneratorService

Сервис в `backend/src/sessions/question-generator.service.ts`.

**Алгоритм v1 (простой, без AI):**

```
1. Получить все topicIds для данного technologyLevelId (через TechnologyLevelTopic)
2. Для каждого topic:
   a. Получить вопросы без прогресса (UserQuestionProgress не существует для userId+questionId)
   b. Взять первый такой вопрос
3. Если вопросов набралось < totalQuestions:
   a. Повторить цикл по топикам, беря следующий вопрос без прогресса
   b. Если все вопросы с прогрессом — брать вопросы с наименьшим mastery
4. Для каждого выбранного вопроса:
   - Создать InterviewSessionQuestion с questionText = localize(question.text, locale), difficulty, order
5. Вернуть список InterviewSessionQuestion
```

### 2.3 Новые эндпоинты в SessionsController

- `POST /api/sessions/:id/start` — запуск сессии:
  1. Проверить status === 'planned', принадлежность userId
  2. Вызвать QuestionGeneratorService для генерации вопросов
  3. Обновить session: status = 'in_progress', startedAt = now(), currentOrder = 1
  4. Вернуть сессию с первым вопросом
- `GET /api/sessions/:id/current-question` — получить текущий вопрос сессии:
  1. Найти InterviewSessionQuestion по sessionId и order === session.currentOrder
  2. Вернуть questionText, difficulty, order, totalQuestions
- `POST /api/sessions/:id/skip` — пропуск вопроса (currentOrder++, score = 0)

---

## Фаза 3 — AI Core API

### 3.1 AiModule

Новый модуль `backend/src/ai/`.

**Структура:**

```
ai/
  ai.module.ts
  ai.service.ts          — фасад, выбирает провайдер по конфигу
  ai.interfaces.ts       — AiProvider interface, типы запросов/ответов
  providers/
    openai.provider.ts   — OpenAI (GPT-4o, GPT-4o-mini)
    gemini.provider.ts   — Google Gemini (2.0 Flash — бесплатный tier)
    anthropic.provider.ts — Claude (опционально)
```

**Интерфейс провайдера:**

```typescript
interface AiProvider {
  readonly name: string;
  evaluateAnswer(ctx: EvaluateAnswerContext): Promise<EvaluationResult>;
  generateQuestionText(ctx: GenerateQuestionContext): Promise<string>;
}

interface EvaluateAnswerContext {
  questionText: string;
  questionExplanation: string;
  answerText: string;
  previousAnswers?: { text: string; feedback: string; score: number }[];
  isDivide: boolean;
  currentMastery: number;
}

interface EvaluationResult {
  score: number;          // 0-100
  feedback: string;       // текстовый разбор
  isFullyClosed: boolean; // вопрос закрыт полностью
  recommendations: string[];
}
```

### 3.2 Динамическая смена модели

- Конфиг модели хранится в `session.config.model` (например `"gemini-2.0-flash"`, `"gpt-4o-mini"`, `"auto"`)
- `AiService.getProvider(modelName)` — возвращает нужный провайдер по имени
- Режим `"auto"` — выбирает бесплатную модель по умолчанию

### 3.3 Бесплатные модели — шаги подключения

Исследование рынка (на момент 2026):

- **Google Gemini 2.0 Flash** — бесплатный tier через AI Studio API (15 RPM, 1M tokens/day). Лучший кандидат для MVP.
  - Шаги: получить API key в Google AI Studio -> установить `@google/genai` -> реализовать `GeminiProvider`
- **Groq** — бесплатный tier для open-source моделей (Llama 3, Mixtral). Высокая скорость.
  - Шаги: регистрация на groq.com -> API key -> REST API (OpenAI-compatible)
- **OpenRouter** — агрегатор, некоторые модели бесплатны
  - Шаги: регистрация -> API key -> OpenAI-compatible API

**Рекомендация для MVP**: начать с Gemini 2.0 Flash (бесплатно, достаточное качество для оценки ответов).

---

## Фаза 4 — Процесс ответа на вопрос (ядро продукта)

### 4.1 Подача ответа

`POST /api/sessions/:id/answer`

```
Body: { answerText: string }

Алгоритм:
1. Валидация: session.status === 'in_progress', userId совпадает
2. Получить текущий InterviewSessionQuestion (по currentOrder)
3. Получить оригинальный Question (для explanation, isDivide)
4. Получить предыдущие InterviewAnswer для этого sessionQuestion (если isDivide)
5. Получить UserQuestionProgress (текущий mastery)
6. Вызвать AiService.evaluateAnswer() с полным контекстом
7. Создать InterviewAnswer (answerText, aiFeedback, score)
8. Обновить UserQuestionProgress:
   - attemptsCount++
   - totalScore += score
   - lastScore = score
   - mastery = пересчёт (формула: weightedAverage или AI-решение)
   - lastAnsweredAt = now()
9. Если AI определил isFullyClosed — mastery = 1.0
10. Обновить UserTopicProgress (пересчёт по всем вопросам топика)
11. Увеличить session.currentOrder++
12. Если currentOrder > totalQuestions — вызвать логику завершения
13. Вернуть: { score, feedback, isFullyClosed, nextQuestion? }
```

### 4.2 Логика isDivide

Для вопросов с `isDivide = true`:

- Вопрос может быть частично закрыт (mastery между 0 и 1)
- При выборе такого вопроса для сессии (если он in_progress), AI генерирует уточняющий текст
- Предыдущие ответы передаются в контекст AI для формирования оценки
- Цель — каждый уточняющий вопрос охватывает незакрытые аспекты

### 4.3 Статус вопроса (расширение схемы)

Рассмотреть добавление поля `status` в `UserQuestionProgress`:

- `open` — вопрос ещё не задавался
- `in_progress` — частично закрыт (mastery > 0 и < threshold)
- `closed` — полностью закрыт (mastery >= threshold или AI решил)

Это потребует миграцию Prisma. Альтернатива — вычислять статус на лету из mastery.

---

## Фаза 5 — Завершение сессии и скоринг

### 5.1 Завершение сессии

`POST /api/sessions/:id/finish`

```
1. Обновить session: status = 'completed', finishedAt = now()
2. Подсчитать суммарный балл за сессию (avg score по всем answers)
3. Обновить User.fullScore += sessionScore
4. Пересчитать league:
   - bronze: 0-99
   - silver: 100-499
   - gold: 500-999
   - platinum: 1000+
   (конкретные пороги — конфигурируемые)
5. Вернуть: summary { totalScore, questionsAnswered, avgScore, newLeague? }
```

### 5.2 Досрочное завершение

`POST /api/sessions/:id/abandon` — статус `abandoned`, finishedAt = now(), прогресс по отвеченным вопросам сохраняется.

---

## Фаза 6 — AI-генерация текста вопроса

### 6.1 Генерация уточняющего текста

При старте сессии (фаза 2), если вопрос имеет статус `in_progress`:

```
1. Получить историю InterviewAnswer для этого userId + questionId
2. Получить ai_feedback из предыдущих ответов
3. Вызвать AiService.generateQuestionText():
   - Контекст: оригинальный текст вопроса, explanation, история ответов с feedback
   - Цель: сформулировать вопрос так, чтобы он охватил незакрытые моменты
   - Ожидание: один полный ответ должен закрыть вопрос
4. Использовать сгенерированный текст как questionText в InterviewSessionQuestion
```

### 6.2 Обновление QuestionGeneratorService

Расширить алгоритм из фазы 2:

```
Для каждого выбранного вопроса:
  if (вопрос.status === 'in_progress'):
    questionText = await aiService.generateQuestionText(контекст)
  else:
    questionText = localize(question.text, locale)
```

---

## Порядок реализации и зависимости

```mermaid
graph LR
  P1["Фаза 1: CRUD endpoints"]
  P2["Фаза 2: Генерация вопросов"]
  P3["Фаза 3: AI Core API"]
  P4["Фаза 4: Ответ + AI оценка"]
  P5["Фаза 5: Завершение сессии"]
  P6["Фаза 6: AI текст вопроса"]

  P1 --> P2
  P2 --> P4
  P3 --> P4
  P4 --> P5
  P3 --> P6
  P2 --> P6
  P5 --> P6
```

Фазы 1 и 3 можно начинать параллельно. Фазы 4-6 зависят от предыдущих.

---

## Ключевые файлы для изменения/создания

**Новые модули:**

- `backend/src/topics/` — TopicsModule, TopicsController, TopicsService
- `backend/src/questions/` — QuestionsModule, QuestionsController, QuestionsService
- `backend/src/users/` — UsersModule, UsersController, UsersService
- `backend/src/progress/` — ProgressModule, ProgressService
- `backend/src/ai/` — AiModule, AiService, провайдеры

**Модификация существующих:**

- `backend/src/sessions/sessions.service.ts` — добавить start, answer, finish
- `backend/src/sessions/sessions.controller.ts` — новые эндпоинты
- `backend/src/app.module.ts` — импорт новых модулей
- `backend/prisma/schema.prisma` — возможно добавление status в UserQuestionProgress
- `backend/src/technologies/technologies.service.ts` — fix NotFoundException
