# onBoard

Сервис на основе AI для подготовки к собеседованиям через сессии тестовых интервью с сохранением прогресса и отслеживанием изученных тем.

Пользователь настраивает параметры сессии:

- Выбор технологии (JS, TS, Go, DevOps и т.д.)
- Выбор сложности (junior / middle / senior)
- Выбор AI-модели (Gemini, OpenAI, auto)
- Количество вопросов в сессии

Сессия — чат, в котором AI-интервьюер задаёт вопросы, пользователь отвечает, система возвращает оценку и рекомендации. После каждой сессии пересчитывается mastery по вопросам и темам, обновляется `full_score` и лига пользователя.

# Документация базы данных сервиса «onBoard»

## 1. Сущности базы данных

### 1.1. `user` – пользователи

| Поле          | Тип          | Ограничения      | Описание                                                        |
| ------------- | ------------ | ---------------- | --------------------------------------------------------------- |
| id            | UUID         | PRIMARY KEY      | Уникальный идентификатор                                        |
| email         | VARCHAR(255) | UNIQUE, NOT NULL | Email                                                           |
| password_hash | VARCHAR(255) | NOT NULL         | Хеш пароля                                                      |
| username      | VARCHAR(100) | NOT NULL         | Никнейм                                                         |
| full_score    | INTEGER      | DEFAULT 0        | Накопленный балл за все сессии; база для расчёта лиги           |
| league        | VARCHAR(50)  | DEFAULT 'bronze' | Лига: bronze (<100) / silver (≥100) / gold (≥500) / platinum (≥1000) |
| created_at    | TIMESTAMP    | DEFAULT NOW()    | Дата регистрации                                                |
| updated_at    | TIMESTAMP    | DEFAULT NOW()    | Дата последнего обновления                                      |


### 1.2. `technology` – технологии

| Поле        | Тип          | Ограничения      | Описание                   |
| ----------- | ------------ | ---------------- | -------------------------- |
| id          | UUID         | PRIMARY KEY      | Уникальный идентификатор   |
| name        | VARCHAR(100) | UNIQUE, NOT NULL | Название (plain text)      |
| description | JSONB        |                  | Описание (i18n: {en, ru})  |
| created_at  | TIMESTAMP    | DEFAULT NOW()    | Дата добавления            |


### 1.3. `technology_level` – уровни технологии

| Поле          | Тип                         | Ограничения                      | Описание                                          |
| ------------- | --------------------------- | -------------------------------- | ------------------------------------------------- |
| id            | UUID                        | PRIMARY KEY                      | Уникальный идентификатор                          |
| technology_id | UUID                        | FK → technology(id) ON DELETE CASCADE | Ссылка на технологию                         |
| difficulty    | ENUM(Difficulty)            | NOT NULL                         | junior / middle / senior                          |
| created_at    | TIMESTAMP                   | DEFAULT NOW()                    | Дата создания                                     |
| *UNIQUE*      | (technology_id, difficulty) |                                  | Уникальность пары технология–уровень              |


### 1.4. `topic` – темы

| Поле        | Тип       | Ограничения | Описание                     |
| ----------- | --------- | ----------- | ---------------------------- |
| id          | UUID      | PRIMARY KEY | Уникальный идентификатор     |
| name        | JSONB     | NOT NULL    | Название (i18n: {en, ru})    |
| description | JSONB     |             | Описание (i18n: {en, ru})    |
| created_at  | TIMESTAMP | DEFAULT NOW()| Дата создания               |


### 1.5. `technology_level_topic` – связь уровня с темами

| Поле                | Тип  | Ограничения                              | Описание               |
| ------------------- | ---- | ---------------------------------------- | ---------------------- |
| technology_level_id | UUID | FK → technology_level(id) ON DELETE CASCADE | Ссылка на уровень   |
| topic_id            | UUID | FK → topic(id) ON DELETE CASCADE         | Ссылка на тему         |
| *PRIMARY KEY*       | (technology_level_id, topic_id) |                     | Составной PK           |


### 1.6. `question` – справочник вопросов

| Поле        | Тип          | Ограничения                        | Описание                                                                                                       |
| ----------- | ------------ | ---------------------------------- | -------------------------------------------------------------------------------------------------------------- |
| id          | UUID         | PRIMARY KEY                        | Уникальный идентификатор                                                                                       |
| topic_id    | UUID         | FK → topic(id) ON DELETE RESTRICT  | Тема; нельзя удалить тему с вопросами                                                                          |
| text        | JSONB        | NOT NULL                           | Текст вопроса (i18n: {en, ru})                                                                                 |
| type        | VARCHAR(20)  | DEFAULT 'theory'                   | Тип: theory / practice                                                                                         |
| difficulty  | INTEGER      | NOT NULL                           | Сложность вопроса (1–50)                                                                                       |
| explanation | JSONB        |                                    | Эталонный ответ (i18n: {en, ru}); передаётся AI при оценке и генерации уточняющего вопроса                     |
| is_divide   | BOOLEAN      | nullable                           | Признак «делимого прогресса»: вопрос допускает частичное освоение и генерацию уточняющих сессионных вопросов   |
| created_at  | TIMESTAMP    | DEFAULT NOW()                      | Дата создания                                                                                                  |
| updated_at  | TIMESTAMP    | DEFAULT NOW()                      | Дата последнего обновления                                                                                     |

> `is_divide` — характеристика справочного вопроса, не сессионного. Не отражает, является ли конкретный экземпляр в сессии уточняющим — для этого используется `interview_session_question.is_clarifying`.


### 1.7. `interview_session` – сессии интервью

| Поле                | Тип          | Ограничения                                | Описание                                                           |
| ------------------- | ------------ | ------------------------------------------ | ------------------------------------------------------------------ |
| id                  | UUID         | PRIMARY KEY                                | Уникальный идентификатор                                           |
| user_id             | UUID         | FK → user(id) ON DELETE CASCADE            | Владелец сессии                                                    |
| technology_level_id | UUID         | FK → technology_level(id) ON DELETE RESTRICT | Уровень технологии                                               |
| config              | JSONB        | DEFAULT '{}'                               | Настройки: `{questionsCount, model, ...}`                          |
| status              | VARCHAR(20)  | DEFAULT 'planned'                          | planned → in_progress → completed / abandoned                      |
| total_questions     | INTEGER      | nullable                                   | Запланированное количество вопросов; заполняется при старте        |
| current_order       | INTEGER      | DEFAULT 0                                  | Порядковый номер текущего вопроса                                  |
| started_at          | TIMESTAMP    | nullable                                   | Время начала                                                       |
| finished_at         | TIMESTAMP    | nullable                                   | Время завершения                                                   |
| created_at          | TIMESTAMP    | DEFAULT NOW()                              | Дата создания                                                      |


### 1.8. `interview_session_question` – вопросы сессии

| Поле          | Тип      | Ограничения                                   | Описание                                                                                 |
| ------------- | -------- | --------------------------------------------- | ---------------------------------------------------------------------------------------- |
| id            | UUID     | PRIMARY KEY                                   | Уникальный идентификатор                                                                 |
| session_id    | UUID     | FK → interview_session(id) ON DELETE CASCADE  | Сессия                                                                                   |
| question_id   | UUID     | FK → question(id) ON DELETE SET NULL, nullable | Оригинальный вопрос; NULL если вопрос удалён (текст сохраняется в question_text)        |
| question_text | TEXT     | NOT NULL                                      | Финальный текст, показанный пользователю; может отличаться от `question.text` (AI-переформулировка) |
| difficulty    | INTEGER  | NOT NULL                                      | Сложность на момент генерации сессии                                                     |
| order         | INTEGER  | NOT NULL                                      | Порядковый номер в сессии                                                                |
| is_clarifying | BOOLEAN  | DEFAULT false                                 | true — вопрос сгенерирован AI как уточняющий (follow-up) на основе предыдущих попыток пользователя |
| created_at    | TIMESTAMP| DEFAULT NOW()                                 | Дата создания                                                                            |
| *UNIQUE*      | (session_id, order) |                                    | Уникальность порядка вопросов в сессии                                                   |


### 1.9. `interview_answer` – ответы пользователя

| Поле                | Тип      | Ограничения                                                  | Описание                                      |
| ------------------- | -------- | ------------------------------------------------------------ | --------------------------------------------- |
| id                  | UUID     | PRIMARY KEY                                                  | Уникальный идентификатор                      |
| session_question_id | UUID     | FK → interview_session_question(id) ON DELETE CASCADE        | Вопрос сессии                                 |
| answer_text         | TEXT     | NOT NULL                                                     | Текст ответа пользователя                     |
| ai_feedback         | TEXT     | NOT NULL                                                     | Текстовое объяснение оценки от AI             |
| recommendations     | JSONB    | nullable                                                     | Список конкретных рекомендаций от AI (string[]) |
| score               | INTEGER  | NOT NULL, 0–100                                              | Балл за ответ                                 |
| created_at          | TIMESTAMP| DEFAULT NOW()                                                | Время ответа                                  |


### 1.10. `user_question_progress` – прогресс по вопросам

| Поле             | Тип       | Ограничения                                              | Описание                                                                          |
| ---------------- | --------- | -------------------------------------------------------- | --------------------------------------------------------------------------------- |
| id               | UUID      | PRIMARY KEY                                              | Уникальный идентификатор                                                          |
| user_id          | UUID      | FK → user(id) ON DELETE CASCADE                          | Пользователь                                                                      |
| question_id      | UUID      | FK → question(id) ON DELETE CASCADE                      | Вопрос                                                                            |
| attempts_count   | INTEGER   | DEFAULT 0                                                | Количество попыток                                                                |
| total_score      | INTEGER   | DEFAULT 0                                                | Сумма баллов по всем попыткам                                                     |
| last_score       | INTEGER   | nullable                                                 | Балл последней попытки                                                            |
| last_answered_at | TIMESTAMP | nullable                                                 | Время последнего ответа                                                           |
| mastery          | FLOAT     | DEFAULT 0.0                                              | Уровень освоения: `min(total_score / (attempts_count × 100), 1.0)`. Принудительно 1.0, если AI вернул `isFullyClosed=true` |
| updated_at       | TIMESTAMP | DEFAULT NOW()                                            | Дата последнего обновления                                                        |
| *UNIQUE*         | (user_id, question_id) |                                             | Уникальность пары пользователь–вопрос                                             |


### 1.11. `user_topic_progress` – прогресс по темам

| Поле         | Тип       | Ограничения                              | Описание                                                                  |
| ------------ | --------- | ---------------------------------------- | ------------------------------------------------------------------------- |
| id           | UUID      | PRIMARY KEY                              | Уникальный идентификатор                                                  |
| user_id      | UUID      | FK → user(id) ON DELETE CASCADE          | Пользователь                                                              |
| topic_id     | UUID      | FK → topic(id) ON DELETE CASCADE         | Тема                                                                      |
| score        | INTEGER   | DEFAULT 0                                | Агрегированный балл: среднее `mastery` всех вопросов темы × 100           |
| last_updated | TIMESTAMP | DEFAULT NOW()                            | Время последнего обновления                                               |
| *UNIQUE*     | (user_id, topic_id) |                                 | Уникальность пары пользователь–тема                                       |

---

## 2. Связи между сущностями

### 2.1. `technology` – `technology_level` (1:N)
Одна технология имеет несколько уровней сложности. `ON DELETE CASCADE`.

### 2.2. `technology_level` – `technology_level_topic` (1:N)
Уровень привязан к темам через связующую таблицу. `ON DELETE CASCADE`.

### 2.3. `topic` – `technology_level_topic` (1:N)
Тема может входить в несколько уровней разных технологий. `ON DELETE CASCADE`.

### 2.4. `topic` – `question` (1:N)
Тема содержит вопросы. `ON DELETE RESTRICT` — нельзя удалить тему с вопросами.

### 2.5. `user` – `interview_session` (1:N)
Пользователь проходит много сессий. `ON DELETE CASCADE`.

### 2.6. `technology_level` – `interview_session` (1:N)
Уровень привязан к сессиям. `ON DELETE RESTRICT` — история сохраняется.

### 2.7. `interview_session` – `interview_session_question` (1:N)
Сессия содержит N вопросов. `ON DELETE CASCADE`.

### 2.8. `question` – `interview_session_question` (1:N)
Один вопрос может быть задан во многих сессиях. `ON DELETE SET NULL` — при удалении вопроса текст в истории сохраняется, `question_id` становится NULL.

### 2.9. `interview_session_question` – `interview_answer` (1:N)
На один вопрос сессии может быть несколько ответов. `ON DELETE CASCADE`.

### 2.10–2.13. Прогресс
`user` ↔ `user_question_progress` ↔ `question` и `user` ↔ `user_topic_progress` ↔ `topic`. Все `ON DELETE CASCADE`.

---

## 3. Алгоритм генерации вопросов для сессии

При старте сессии (`POST /sessions/:id/start`) сервис формирует список из N вопросов в следующем порядке.

### 3.1. Отбор вопросов

**Шаг 1 — Неотвеченные вопросы (приоритет).**
Запрашиваются все вопросы тем, входящих в `technology_level_id`, для которых у пользователя нет записи в `user_question_progress` (не отвечался ни разу). Внутри темы вопросы отсортированы по сложности по возрастанию.

**Шаг 2 — Round-robin по темам.**
Неотвеченные вопросы распределяются по темам. Алгоритм делает обходы: на каждом проходе берёт по одному вопросу из каждой темы, пока не набирается нужное количество. Это обеспечивает равномерное покрытие тем, а не перекос в одну область.

**Шаг 3 — Заполнение из low-mastery (если нужно).**
Если неотвеченных вопросов не хватает (пользователь уже отвечал на все вопросы уровня), недостающий остаток берётся из `user_question_progress`, отсортированного по `mastery ASC` — то есть сначала идут самые слабо освоенные вопросы.

### 3.2. Сценарии в зависимости от состояния прогресса

| Состояние | Что происходит при отборе | Что происходит с текстом вопроса |
|---|---|---|
| Нет записи в `user_question_progress` | Вопрос попадает в шаг 1 (приоритет) | Оригинальный локализованный текст |
| `mastery = 0` (отвечал, но всегда 0 баллов) | Попадает в шаг 3 (low-mastery) | Оригинальный текст; AI-переформулировка не нужна — пробел слишком большой |
| `0 < mastery < 1` (частично освоен) | Попадает в шаг 3; будет выбран раньше хорошо освоенных | **Попытка сгенерировать уточняющий вопрос через AI** (см. 3.3) |
| `mastery = 1` (полностью закрыт) | Попадает в шаг 3 последним | Оригинальный текст (AI не вызывается, `mastery < 1` не выполнено) |

### 3.3. Как формируется текст вопроса (`resolveQuestionText`)

Для каждого из N отобранных вопросов сервис определяет финальный текст и флаг `is_clarifying` по следующей логике:

**Условие запуска AI-переформулировки** (все должны выполняться одновременно):
- В `user_question_progress` есть запись (вопрос уже отвечался)
- `0 < mastery < 1` — вопрос частично освоен
- Хотя бы один AI-провайдер доступен (Gemini или OpenAI с настроенным API-ключом)

Если условие не выполнено — используется оригинальный текст, `is_clarifying = false`.

**Если условие выполнено — порядок действий:**

1. Запрашивается история последних 5 ответов пользователя по этому вопросу из всех сессий (`MAX_HISTORY_FOR_AI = 5`), отсортированная по времени.
2. Если история пуста — оригинальный текст, `is_clarifying = false`.
3. AI (`generateQuestionText`) получает: оригинальный текст, эталонный ответ (`explanation`), историю попыток (тексты ответов, оценки, рекомендации), текущий `mastery` и локаль. Задача AI — переформулировать вопрос так, чтобы он точечно проработал пробелы из прошлых попыток.
4. Если AI вернул пустую строку — оригинальный текст, `is_clarifying = false`.
5. Если AI вернул текст, идентичный оригинальному (после trim) — тот же текст, `is_clarifying = false`.
6. Если AI вернул отличный от оригинала текст — используется новый текст, **`is_clarifying = true`**.
7. Любое исключение при обращении к AI — fallback на оригинальный текст, `is_clarifying = false`.

Флаг `is_clarifying` записывается в `interview_session_question` и используется:
- На фронте — отображение amber-бейджа «Доразбор предыдущего ответа» на пузырьке вопроса и выпадающего блока с историей прошлых попыток
- На бэке — при оценке ответа: предыдущие попытки передаются AI-оценщику в контексте только для уточняющих вопросов

---

## 4. Основные сценарии использования

### 4.1. Регистрация нового пользователя

1. Проверка уникальности email.
2. Хеширование пароля.
3. Создание записи `user` с `full_score = 0`, `league = 'bronze'`.

### 4.2. Создание и настройка сессии

1. Получение `technology_level_id` по технологии и сложности.
2. Создание записи `interview_session` со `status = 'planned'`, `config = {questionsCount, model, ...}`.

### 4.3. Генерация вопросов при старте сессии

Подробно описано в разделе 3.

### 4.4. Процесс ответа на вопрос

1. Получить текущий `interview_session_question` по `session_id` и `current_order`.
2. Если `is_clarifying = true` — в контекст AI-оценки добавляются предыдущие ответы по этому сессионному вопросу.
3. AI оценивает ответ: возвращает `score` (0–100), `feedback` (TEXT), `recommendations` (string[]), `isFullyClosed` (bool).
4. Сохранить `interview_answer`.
5. Обновить `user_question_progress`:
   - `mastery = min(total_score / (attempts_count × 100), 1.0)`
   - Если `isFullyClosed = true` → принудительно `mastery = 1.0`
6. Пересчитать `user_topic_progress` (среднее mastery всех вопросов темы × 100).
7. Увеличить `current_order`; если `current_order > total_questions` → сессия автоматически завершается.

### 4.5. Завершение сессии

**Автоматическое** — после последнего ответа.  
**Ручное** — `POST /sessions/:id/finish` (принудительное завершение в любой момент).

1. Подсчёт `avgScore` по всем ответам сессии.
2. `session_score = avgScore` добавляется к `user.full_score`.
3. Пересчёт лиги: bronze (<100) → silver (≥100) → gold (≥500) → platinum (≥1000).
4. `status = 'completed'`, `finished_at = NOW()`.

### 4.6. Просмотр прогресса

- **Дашборд**: `full_score`, лига, общая статистика.
- **По технологии**: список тем с `score` из `user_topic_progress`.
- **По теме**: список вопросов с `mastery` из `user_question_progress`.
- **История сессий**: список `interview_session` с вопросами и ответами.
- **История попыток по вопросу** (`GET /sessions/:id/questions/:sessionQuestionId/history`): последние 5 попыток пользователя по тому же `question_id` из всех сессий — используется в UI для блока «Прошлые попытки» при уточняющих вопросах.

### 4.7. Администрирование контента

Управление технологиями, уровнями, темами и вопросами через REST API. Вопросы содержат i18n-поля (`text`, `explanation`) в формате `{"en": "...", "ru": "..."}`.
