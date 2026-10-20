# IELTIX Telegram Bot and Live Call Design

## Objective

Turn IELTIX into a Telegram-first IELTS learning product while retaining the existing React application for long-form exam experiences. The Telegram bot, web application, admin tools, and live voice examiner share one PostgreSQL-backed domain model.

## Product Shape

The Telegram bot is the primary daily interface. It owns onboarding, language selection, short practice sessions, voice-message practice, progress, reminders, subscriptions, and entry into Live Call. The existing React application remains the best interface for full Reading, Listening, Writing, and 2h45m mock exams.

The first production slice must work without paid AI credentials by using deterministic local adapters. Premium realtime, STT, LLM, and TTS providers are optional adapters enabled through environment variables. Missing providers must degrade to typed chat and deterministic IELTS feedback instead of breaking the bot.

## Architecture

```text
Telegram user
  -> aiogram handlers
  -> application use cases
  -> domain modules
  -> repositories
  -> PostgreSQL (SQLite in local/test mode)

Telegram Mini App / browser
  -> FastAPI voice gateway
  -> signed session token
  -> conversation orchestrator
  -> STT / LLM / TTS adapters
  -> persisted transcript and evaluation

Existing React app
  -> FastAPI REST interface
  -> same application use cases and repositories
```

### Module Depth and Seams

- `core`: domain entities, scoring, language policy, and use cases. It has no Telegram, HTTP, database, or AI SDK imports.
- `adapters`: concrete database, Telegram, payment, and AI implementations. Each sits behind a small protocol owned by the core.
- `telegram_bot`: maps updates and callback queries to core use cases. Handlers contain no scoring or persistence rules.
- `voice_gateway`: validates a Live Call session, accepts text or audio turns, and streams/returns examiner responses.
- `admin`: exposes health, user, attempt, and usage summaries without direct table mutation from templates.

## User Journey

1. `/start` creates or loads the Telegram identity.
2. The user selects Uzbek or English interface language.
3. Onboarding collects target band, current level, exam type, weak skills, exam date, and daily study time.
4. The bot creates a study profile and shows the main menu.
5. The user can start daily practice, submit a Writing response, send a Speaking voice message, view progress, manage subscription, or open Live Call.
6. Each completed attempt is persisted and contributes to skill progress.
7. Live Call runs IELTS Speaking Part 1, Part 2, and Part 3, stores the transcript, and returns a four-criterion report.

## Bot Modules

- `start`: identity bootstrap, language selection, terms, and main menu.
- `onboarding`: finite-state questionnaire and profile creation.
- `practice`: skill and difficulty selection plus short exercise delivery.
- `writing`: prompt delivery, response collection, evaluation, and feedback.
- `speaking`: voice or text answer collection, transcription, evaluation, and feedback.
- `progress`: recent attempts, band trend, streak, and recommended next action.
- `subscription`: plan display, Telegram Stars invoice, pre-checkout validation, and idempotent successful-payment handling.
- `live_call`: creates a short-lived signed call session and opens the Mini App.
- `admin`: Telegram-only operational commands restricted by configured Telegram IDs.

## Live Call Design

### Transport

The initial reliable transport is turn-streaming: browser voice activity detection records one utterance, uploads it, and receives transcript, examiner text, and speech. The interface is designed so a WebSocket/WebRTC streaming adapter can replace transport without changing the conversation module.

### Conversation Behavior

- The selected interface language controls explanations; IELTS questions default to English.
- Automatic language detection may switch between `uz` and `en` per turn.
- The examiner asks one question at a time and never fabricates official IELTS certification.
- A session progresses through Part 1, Part 2, and Part 3 with configurable question counts.
- The user may interrupt playback; the client stops current audio before recording the next turn.
- Every accepted turn is persisted before the next question is returned.

### Provider Interfaces

- `SpeechToText.transcribe(audio, language_hint) -> Transcript`
- `Examiner.respond(session, transcript) -> ExaminerTurn`
- `TextToSpeech.synthesize(text, language) -> SpeechAudio`
- `SpeakingEvaluator.evaluate(transcript, metadata) -> SpeakingReport`

Local deterministic adapters support tests and credential-free development. Remote adapters are configured by environment variables and must enforce timeouts, retry limits, and circuit breaking.

## Data Model

- `users`: Telegram identity, role, locale, status, timestamps.
- `learner_profiles`: target band, current band, exam type/date, weak skills, daily minutes.
- `learning_sessions`: practice or live-call session lifecycle.
- `exercises`: skill, prompt, content, answer rubric, difficulty, active status.
- `attempts`: user, exercise/session, answer, score, feedback, timing.
- `speaking_turns`: session, speaker, transcript, detected language, audio metadata.
- `speaking_reports`: four IELTS criteria, overall band, strengths, improvements.
- `subscriptions`: plan, status, validity window.
- `payments`: Telegram charge IDs, payload, amount, currency, status, idempotency key.
- `usage_events`: provider, operation, latency, success, cost metadata.

## Security

- Telegram Mini App `initData` is verified server-side before issuing a call session.
- Live Call tokens are signed, user-bound, purpose-bound, and expire within 15 minutes.
- Bot tokens and provider keys exist only in environment variables.
- Payment completion is accepted only from Telegram successful-payment updates and is idempotent by charge ID.
- Input length, audio size, MIME type, rate, and session ownership are validated.
- Admin operations require configured Telegram IDs or authenticated admin sessions.
- Logs exclude raw tokens, provider keys, and full audio payloads.

## Reliability and Fallbacks

- PostgreSQL is authoritative in production; SQLite is supported only for local development and tests.
- Redis stores FSM state and rate-limit counters in production; memory storage is allowed locally.
- If STT is unavailable, Live Call offers typed input.
- If TTS is unavailable, examiner text remains usable.
- If the premium examiner is unavailable, a deterministic IELTS question engine continues the session and marks feedback as local estimation.
- Provider calls have bounded timeouts and return user-readable Uzbek or English errors.

## Testing

- Unit tests cover band rounding, language policy, token expiry, state transitions, and payment idempotency.
- Repository tests use isolated SQLite databases.
- FastAPI tests cover health, call-session authorization, turn processing, and invalid uploads.
- Bot tests cover `/start`, language selection, onboarding, menu navigation, and subscription callbacks without contacting Telegram.
- Contract tests verify response types shared by the bot, voice gateway, and React client.

## Delivery Slices

1. Core domain, configuration, database, migrations, and health interface.
2. Telegram bot bootstrap, bilingual onboarding, and menu.
3. Practice, attempts, progress, and local deterministic evaluation.
4. Live Call Mini App with bilingual examiner and provider adapters.
5. Telegram Stars subscription and admin operations.
6. Existing React integration, production deployment, monitoring, and backups.

## Acceptance Criteria

- The project starts locally with one documented command and no paid credentials.
- A Telegram user can complete onboarding in Uzbek or English and resume after restart.
- A learner can complete at least one Reading, Writing, and Speaking practice flow and see persisted progress.
- A signed Live Call session supports a complete bilingual IELTS Speaking conversation and produces a persisted report.
- Text fallback works when STT or TTS is unavailable.
- Duplicate Telegram successful-payment updates do not extend a subscription twice.
- Automated tests pass without external network access.
- Existing IELTIX frontend production build remains successful.

## Explicit Non-Goals for the First Production Slice

- Claiming that local heuristic scores are official IELTS results.
- Reproducing the entire long-form web exam UI inside Telegram messages.
- Storing raw call audio indefinitely.
- Building multiple payment providers before Telegram Stars is reliable.
