# onBoard Backend

Бэкенд сервиса **onBoard** — AI-powered подготовка к собеседованиям. REST API на NestJS 11, база данных PostgreSQL через Prisma 7, аутентификация по JWT.

---

## Стек

| Категория   | Технология |
|------------|------------|
| Runtime    | Node.js, ESM (`"type": "module"`) |
| Framework  | NestJS 11 |
| ORM / DB   | Prisma 7, PostgreSQL 16, драйвер `@prisma/adapter-pg` |
| Auth       | JWT (passport-jwt), bcrypt |
| Документация API | Swagger (OpenAPI) |
| Валидация  | class-validator, class-transformer |
| Безопасность | Helmet, Throttler (rate limit) |

---

## Структура проекта

```
backend/
├── prisma/
│   ├── schema.prisma    # Модели БД и миграции
│   └── seed.ts          # Сиды: технологии, темы, вопросы
├── src/
│   ├── main.ts          # Точка входа, CORS, Helmet, Swagger, ValidationPipe
│   ├── app.module.ts    # Корневой модуль
│   ├── app.controller.ts # Health check
│   ├── auth/            # Регистрация и вход, JWT
│   ├── technologies/    # Каталог технологий и уровней
│   ├── sessions/        # Сессии собеседований
│   ├── prisma/          # Глобальный PrismaService (подключение к БД)
│   └── common/          # Guards (JWT), декораторы (CurrentUser)
└── test/                # E2E-тесты
```

**Модули:**

- **AuthModule** — регистрация, логин, выдача JWT.
- **TechnologiesModule** — чтение технологий и уровней (с темами и вопросами).
- **SessionsModule** — создание и просмотр сессий собеседований (по пользователю).
- **PrismaModule** — глобальный провайдер доступа к БД.

---

## Функциональность

### 1. Аутентификация

- **POST `/api/auth/register`** — регистрация (email, password, username). Пароль хэшируется (bcrypt), возвращается JWT и данные пользователя.
- **POST `/api/auth/login`** — вход по email и паролю; в ответе — JWT и профиль.

Защищённые маршруты требуют заголовок `Authorization: Bearer <token>`.

### 2. Технологии

- **GET `/api/technologies`** — список технологий с уровнями сложности (только для авторизованных).
- **GET `/api/technologies/:id`** — одна технология с уровнями, темами и связями (только для авторизованных).

Используется для выбора направления подготовки (например, JavaScript, React) и уровня (junior/middle/senior).

### 3. Сессии собеседований

- **POST `/api/sessions`** — создать сессию: привязка к пользователю, к уровню технологии (`technologyLevelId`) и опциональному `config` (формат, количество вопросов и т.п.).
- **GET `/api/sessions`** — список сессий текущего пользователя.
- **GET `/api/sessions/:id`** — детали сессии (вопросы, ответы, уровень, технология).

Все маршруты сессий доступны только авторизованному пользователю; выборка по `userId` из JWT.

### 4. AI Core

- **GET `/api/ai/providers`** — список зарегистрированных AI-провайдеров, активных моделей и routing aliases (только для авторизованных).
- **GET `/api/ai/egress`** — диагностика Gemini egress path: proxy mode, public IP/country, DNS lookup, локальные интерфейсы и подсказки по split tunneling / IPv6 leakage (только для авторизованных).
- **POST `/api/ai/test`** — lightweight-проверка одной модели или всех доступных моделей. Принимает опциональные поля `model` и `operation` (`evaluate` или `generate`) и возвращает `success`, `latencyMs`, результат вызова или текст ошибки (только для авторизованных).

Ручки нужны для быстрой проверки, что модель действительно доступна по API-ключу, через какой egress выходит Node runtime и корректно ли вызывается `AiService`.

### 5. Служебные

- **GET `/api/health`** — проверка живости сервиса (`status`, `timestamp`).
- **GET `/api/docs`** — интерактивная Swagger-документация.

---

## Модель данных (кратко)

- **User** — пользователь (email, username, passwordHash, league, fullScore).
- **Technology** — технология (name, description).
- **TechnologyLevel** — уровень сложности у технологии (например, junior/middle/senior).
- **Topic** — тема (привязана к уровням через **TechnologyLevelTopic**).
- **Question** — вопрос по теме (text, type, difficulty, explanation).
- **InterviewSession** — сессия собеседования (user, technologyLevel, config, status, totalQuestions, даты).
- **InterviewSessionQuestion** — вопрос в рамках сессии (порядок, текст, сложность).
- **InterviewAnswer** — ответ пользователя (текст, AI feedback, score).
- **UserQuestionProgress** / **UserTopicProgress** — прогресс по вопросам и темам (для будущего расширения).

---

## Запуск и окружение

### Требования

- Node.js (рекомендуется LTS)
- PostgreSQL 16 (например, через `docker compose up -d postgres` из корня репозитория)
- Файл `backend/.env` (образец: `backend/.env.example`)

### Переменные окружения

| Переменная | Обязательная | Описание | Пример (локальная разработка) |
|------------|---------------|----------|--------------------------------|
| `DATABASE_URL` | да | Строка подключения PostgreSQL для Prisma (миграции, seed, runtime) | `postgresql://onboard:onboard_secret@localhost:5432/onboard` |
| `JWT_SECRET` | да | Секрет для подписи JWT | длинная случайная строка |
| `JWT_EXPIRATION` | нет | Срок жизни access token (секунды), по умолчанию 3600 | `3600` |
| `PORT` | нет | Порт HTTP-сервера, по умолчанию 3000 | `3000` |
| `GEMINI_API_KEY` | нет | API key для Gemini provider | `AIza...` |
| `GEMINI_MODEL` | нет | Явное имя Gemini-модели, по умолчанию `gemini-2.0-flash` | `gemini-2.5-pro` |
| `GEMINI_BASE_URL` | нет | Override Gemini base URL для relay / совместимого upstream | `https://relay.example.com` |
| `GEMINI_PROXY_URL` | нет | Явный HTTP CONNECT proxy для Gemini через undici dispatcher | `http://user:pass@proxy.example.com:8888` |
| `GEMINI_FORCE_IPV4` | нет | Включает `ipv4first`, чтобы снизить риск IPv6 leakage | `true` |
| `OPENAI_API_KEY` | нет | API key для OpenAI provider | `sk-...` |
| `OPENAI_MODEL` | нет | Явное имя OpenAI-модели, по умолчанию `gpt-4o-mini` | `gpt-4.1-mini` |

Для локальной разработки при запущенном `docker compose` из корня репо используйте `DATABASE_URL` как в таблице (логин/пароль/БД из `docker-compose.yml`).

### Команды (из каталога `backend/`)

| Команда | Описание |
|--------|----------|
| `pnpm install` | Установка зависимостей |
| `npx prisma generate` | Генерация Prisma Client |
| `npx prisma migrate deploy` | Применение миграций (БД должна быть запущена) |
| `npx tsx prisma/seed.ts` | Заполнение технологий, тем и вопросов |
| `pnpm run start:dev` | Запуск в режиме разработки (watch) |
| `pnpm run build` | Сборка в `dist/` |
| `pnpm run start:prod` | Запуск продакшн-сборки (`node dist/main.js`) |
| `pnpm run test` | Unit-тесты (Jest) |
| `pnpm run test:e2e` | E2E-тесты |
| `pnpm run lint` | Линт (ESLint) |

### Документация API

После запуска сервера: **http://localhost:3000/api/docs** (Swagger UI).

### Диагностика Gemini egress

Если Gemini отвечает `User location is not supported for the API use`, сначала
проверьте runtime path:

1. `GET /api/ai/egress` — какой public IP / country видит процесс Node и в каком режиме работает transport (`direct` или `proxy`).
2. `POST /api/ai/test` — проходит ли реальный вызов в модель.

Практические замечания:

- Браузерный VPN не гарантирует, что `pnpm start:dev` и Node runtime идут через тот же egress.
- `GEMINI_PROXY_URL` включает upstream через `undici` global dispatcher, то есть fetch-based traffic процесса будет использовать тот же proxy.
- `GEMINI_FORCE_IPV4=true` полезен, если подозреваете IPv6 leakage мимо VPN/proxy.
- Для смены egress нужен внешний proxy с IP в поддерживаемой стране; достаточно прописать его URL с кредами в `GEMINI_PROXY_URL`.

---

## Безопасность и лимиты

- Глобальная валидация входящих тел запросов (`ValidationPipe`, whitelist).
- Helmet для заголовков HTTP.
- Throttler: лимит запросов (например, 100 запросов за 60 секунд на приложение).
- Защищённые маршруты проверяют JWT через `JwtAuthGuard` и стратегию passport-jwt.
