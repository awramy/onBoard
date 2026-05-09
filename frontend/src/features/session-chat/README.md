# session-chat

Фича отвечает за две страницы: `/sessions/:id/chat` (live-прохождение) и `/sessions/:id/history` (read-only просмотр).

## Связка

```
SessionChatPage
  └── useChatRuntime          # состояние + мутации + runtime
        ├── useAnswerQuestion  # POST /answer → invalidate
        ├── useSkipQuestion    # POST /skip  → invalidate
        ├── useFinishSession   # POST /finish → invalidate + профиль
        └── useDraftAnswer     # localStorage черновик
  └── ChatThread (mode="live")
        ├── ChatAssistantMessage → QuestionBubble | EvaluationBubble | ErrorBubble
        ├── ChatUserMessage
        ├── TypingIndicator
        └── ChatComposer       # textarea + Send + Skip
  └── SessionControlPanel
        └── QuestionsChecklist
  └── SummaryDialog            # открывается при isFinished
  └── ConfirmAbandonDialog

SessionHistoryPage
  └── useReadOnlyChatRuntime   # messages из session.questions[].answers[]
  └── ChatThread (mode="history")  # без composer
  └── HistoryHeader
```

---

## Утилиты и типы

### `types.ts`
`ChatMeta` — дополнительные данные сообщения, хранятся в `message.metadata.custom`.  
`kind: 'question' | 'evaluation' | 'error'` управляет тем, какой пузырь рендерится в `ChatAssistantMessage`.

### `context.ts`
`ChatCallbacksContext` — пробрасывает `onSend`, `onSkip`, `onRetry`, `isRunning` вглубь дерева.  
`ChatComposer` и `ErrorBubble` читают из него — не получают props напрямую.

### `lib/messageBuilders.ts`
Чистые функции, собирающие `ThreadMessageLike` объекты для assistant-ui runtime:

| Функция | Что создаёт |
|---|---|
| `makeQuestionMessage` | Сообщение-вопрос (role: assistant) |
| `makeUserMessage` | Ответ пользователя (role: user) |
| `makeEvaluationMessage` | Оценка AI из `AnswerResultDto` |
| `makeSkipEvaluationMessage` | Оценка 0 при пропуске |
| `makeHistoryEvaluationMessage` | Оценка из `SessionAnswerDto` (история) |
| `makeErrorMessage` | Ошибка с `retryAnswerText` для Retry |
| `hydrateFromSession` | Весь тред из `SessionDetailDto` (для history и первичной гидрации live) |

---

## Хуки

### `useChatRuntime(sessionId)`
Главный хук live-режима. Управляет локальным `messages: ThreadMessageLike[]` и `isRunning`.

- **Гидрация** — один раз при маунте через `useRef` флаг; повторные ре-фетчи `findOne` тред не перезатирают.
- **Текущий вопрос** — `useSessionsControllerCurrentQuestion`, добавляет вопрос в тред если его ещё нет (`id`-дедупликация).
- **`handleSend(text)`** — пушит user message → `answer.mutateAsync` → пушит evaluation + nextQuestion; при ошибке пушит `ErrorBubble`.
- **`handleSkip()`** — `skip.mutateAsync` → локально пушит skip evaluation.
- **`handleRetry(text)`** — убирает последний `ErrorBubble`, вызывает `handleSend`.
- **`handleFinishEarly()`** — `finish.mutateAsync` → открывает `SummaryDialog` с серверным payload.
- **`summaryResult`** — устанавливается при `isFinished: true` в ответе answer/skip/finish.
- 403 → toast + redirect `/sessions`; 404 → redirect `/404`.

### `useReadOnlyChatRuntime(sessionId)`
История: `messages` вычисляются через `useMemo` из `hydrateFromSession`. Runtime с `isDisabled: true`.

### `useAnswerQuestion(sessionId)`
Тонкий wrapper над `useSessionsControllerAnswer` с `onSuccess` invalidation: `findOne`, `currentQuestion`, `findAll`.

### `useSkipQuestion(sessionId)`
То же самое для `useSessionsControllerSkip`.

### `useFinishSession(sessionId)`
Wrapper над `useSessionsControllerFinish`. Дополнительно инвалидирует `getUsersControllerGetProfileQueryKey()` — обновляет `fullScore`/`league` в сайдбаре.

### `useAbandonSession()`
Wrapper над `useSessionsControllerAbandon`. После успеха: toast + navigate `/sessions`.

### `useDraftAnswer(sessionId)`
localStorage по ключу `onboard:chat-draft:<sessionId>`. Возвращает `{ getDraft, saveDraft, clearDraft }`. Очищается при успешном answer/skip.

---

## Компоненты

### `ChatThread`
Корневой компонент. Оборачивает `AssistantRuntimeProvider` + `ThreadPrimitive.Root/Viewport/Messages`.  
Принимает `mode: 'live' | 'history'` — в live рендерит `ChatComposer`, в history нет.  
Прокидывает коллбэки через `ChatCallbacksContext`.

### `ChatAssistantMessage`
Диспатчер: читает `metadata.custom.kind` через `useMessage` и рендерит нужный пузырь.

### `ChatUserMessage`
Текст ответа пользователя, выровнен вправо.

### `QuestionBubble`
Текст вопроса + badges: `Вопрос N/M`, сложность `1-5`, метка "Доразбор" если `isDivide`.

### `EvaluationBubble`
`ScoreBadge` + Markdown-feedback + `Accordion` с recommendations + badge "Тема закрыта" если `isFullyClosed`.

### `ErrorBubble`
Текст ошибки + кнопка «Повторить» — вызывает `onRetry(retryAnswerText)` из контекста.

### `TypingIndicator`
Три прыгающих точки + текст «AI оценивает...». Рендерится через `<ThreadPrimitive.If running>`.

### `ChatComposer`
Textarea с Cmd+Enter для отправки. Сохраняет черновик через `useDraftAnswer`. Читает `onSend`/`onSkip`/`isRunning` из контекста.

### `SessionControlPanel`
Шапка (технология + уровень) + прогресс-бар + `QuestionsChecklist` + кнопки Finish early / Abandon.

### `QuestionsChecklist`
Список вопросов по статусу: answered (галка + score), skipped (кружок), current (стрелка), pending (часы).

### `SummaryDialog`
Открывается при `isFinished`. Показывает avgScore, questionsAnswered, league. Нельзя закрыть кликом вне — только через CTA кнопки.

### `ConfirmAbandonDialog`
Confirm-диалог перед abandon.

### `HistoryHeader`
Шапка страницы истории: технология/уровень, avgScore, кнопка «Новая сессия».

### `PlannedSessionPlaceholder`
Inline-карточка для `planned`-сессий с кнопкой Start. Не делает авто-старт.
