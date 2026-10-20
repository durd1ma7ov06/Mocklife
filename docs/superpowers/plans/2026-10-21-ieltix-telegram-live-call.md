# IELTIX Telegram Bot and Live Call Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Deliver a tested Telegram-first IELTIX application with bilingual onboarding, practice and progress flows, secure subscriptions, and a bilingual Live Call examiner.

**Architecture:** A new Python workspace contains a framework-independent core, aiogram Telegram adapter, FastAPI voice gateway, and SQLAlchemy repositories. The current React app remains intact and later consumes the same FastAPI interface; local deterministic AI adapters guarantee offline development while remote providers plug into narrow protocols.

**Tech Stack:** Python 3.11+, FastAPI, aiogram 3, SQLAlchemy 2 async, Alembic, Pydantic Settings, PyJWT, pytest, httpx, PostgreSQL, Redis, browser MediaRecorder/VAD.

**Spec:** `docs/superpowers/specs/2026-10-21-ieltix-telegram-live-call-design.md`

## Global Constraints

- Production persistence is PostgreSQL; SQLite is limited to local development and tests.
- The bot and Live Call support Uzbek and English from the first slice.
- Paid AI credentials are optional; deterministic local adapters keep all tests and core flows functional offline.
- Live Call tokens expire within 15 minutes and are bound to one Telegram user and the `live_call` purpose.
- Raw provider keys, bot tokens, and full audio payloads are never logged.
- New production behavior is written test-first.
- Existing IELTIX frontend files are not rewritten during the bot foundation tasks.

---

### Task 1: Python Workspace, Configuration, and Health

**Files:**
- Create: `pyproject.toml`
- Create: `.env.bot.example`
- Create: `apps/core_api/main.py`
- Create: `packages/ieltix_core/config.py`
- Create: `tests/api/test_health.py`

**Interfaces:**
- Produces: `Settings`, `get_settings()`, and FastAPI `app` with `GET /health`.

- [ ] Write a failing FastAPI test asserting `/health` returns `{"status": "ok", "service": "ieltix-core"}`.
- [ ] Run `python -m pytest tests/api/test_health.py -q` and confirm collection or assertion failure because the app does not exist.
- [ ] Add the minimal package layout, settings, and health route.
- [ ] Run the health test and confirm it passes.
- [ ] Commit only Task 1 files with `feat: add IELTIX Python core health service`.

### Task 2: Domain Models and Persistence

**Files:**
- Create: `packages/ieltix_core/domain/models.py`
- Create: `packages/ieltix_core/domain/scoring.py`
- Create: `packages/ieltix_core/ports/repositories.py`
- Create: `packages/ieltix_core/adapters/database.py`
- Create: `packages/ieltix_core/adapters/repositories.py`
- Create: `tests/core/test_scoring.py`
- Create: `tests/core/test_repositories.py`

**Interfaces:**
- Produces: `round_band(float) -> float`, `UserRepository`, `AttemptRepository`, `Database`, and SQLAlchemy tables for users, profiles, attempts, speaking sessions, subscriptions, and payments.

- [ ] Write failing tests for IELTS half-band rounding and persistent retrieval of a Telegram user.
- [ ] Run both test files and verify failures are caused by missing domain and repository modules.
- [ ] Implement domain dataclasses/protocols and the smallest async SQLAlchemy persistence adapter.
- [ ] Run both test files and confirm they pass against isolated SQLite.
- [ ] Commit Task 2 files with `feat: add persistent IELTIX domain foundation`.

### Task 3: Bilingual Onboarding Use Case

**Files:**
- Create: `packages/ieltix_core/application/onboarding.py`
- Create: `packages/ieltix_core/i18n/catalog.py`
- Create: `tests/core/test_onboarding.py`

**Interfaces:**
- Consumes: `UserRepository` from Task 2.
- Produces: `OnboardingService.begin(telegram_id, locale)` and `OnboardingService.answer(telegram_id, field, value)` returning `OnboardingResult`.

- [ ] Write failing tests for Uzbek and English onboarding, invalid target bands, and resuming an incomplete profile.
- [ ] Run the onboarding tests and confirm expected failures.
- [ ] Implement validation, prompts, and persisted onboarding state.
- [ ] Run onboarding and repository tests and confirm all pass.
- [ ] Commit Task 3 files with `feat: add bilingual learner onboarding`.

### Task 4: Telegram Bot Adapter

**Files:**
- Create: `apps/telegram_bot/main.py`
- Create: `apps/telegram_bot/handlers/start.py`
- Create: `apps/telegram_bot/handlers/onboarding.py`
- Create: `apps/telegram_bot/keyboards/main.py`
- Create: `apps/telegram_bot/middlewares/rate_limit.py`
- Create: `tests/bot/test_start_flow.py`

**Interfaces:**
- Consumes: `OnboardingService` from Task 3.
- Produces: `create_dispatcher(container) -> Dispatcher` and bilingual `/start` plus onboarding callback flows.

- [ ] Write failing tests that feed synthetic aiogram updates through the dispatcher and assert language/menu responses.
- [ ] Run bot tests and verify failure because the adapter is absent.
- [ ] Implement dependency-injected handlers, keyboards, FSM states, and rate limiting.
- [ ] Run bot and core tests and confirm all pass without Telegram network calls.
- [ ] Commit Task 4 files with `feat: add bilingual Telegram onboarding bot`.

### Task 5: Practice, Evaluation, and Progress

**Files:**
- Create: `packages/ieltix_core/application/practice.py`
- Create: `packages/ieltix_core/application/evaluation.py`
- Create: `apps/telegram_bot/handlers/practice.py`
- Create: `apps/telegram_bot/handlers/progress.py`
- Create: `packages/ieltix_core/content/sample_exercises.py`
- Create: `tests/core/test_practice.py`
- Create: `tests/bot/test_practice_flow.py`

**Interfaces:**
- Produces: `PracticeService.start`, `PracticeService.submit`, `EvaluationService.evaluate`, and `ProgressSummary`.

- [ ] Write failing tests for Reading answer scoring, Writing feedback, Speaking transcript feedback, and aggregated progress.
- [ ] Run tests and verify behavior failures.
- [ ] Implement deterministic offline evaluation and persisted attempts.
- [ ] Add Telegram handlers for skill selection, submission, feedback, and progress.
- [ ] Run all core and bot tests and confirm they pass.
- [ ] Commit Task 5 files with `feat: add IELTS practice and progress flows`.

### Task 6: Signed Live Call Sessions

**Files:**
- Create: `packages/ieltix_core/application/live_call.py`
- Create: `packages/ieltix_core/security/tokens.py`
- Create: `apps/core_api/routes/live_call.py`
- Create: `tests/core/test_call_tokens.py`
- Create: `tests/api/test_live_call_sessions.py`

**Interfaces:**
- Produces: `CallTokenService.issue`, `CallTokenService.verify`, `POST /api/live-call/sessions`, and `GET /api/live-call/sessions/{id}`.

- [ ] Write failing tests for valid, expired, wrong-user, and wrong-purpose tokens.
- [ ] Run token tests and confirm expected failures.
- [ ] Implement signed 15-minute call tokens and persisted session creation.
- [ ] Add authenticated FastAPI routes and ownership validation.
- [ ] Run core and API tests and confirm they pass.
- [ ] Commit Task 6 files with `feat: add secure live call sessions`.

### Task 7: Bilingual Examiner and Voice Provider Ports

**Files:**
- Create: `packages/ieltix_core/ports/voice.py`
- Create: `packages/ieltix_core/application/examiner.py`
- Create: `packages/ieltix_core/adapters/local_voice.py`
- Create: `packages/ieltix_core/adapters/remote_voice.py`
- Create: `tests/core/test_examiner.py`

**Interfaces:**
- Produces: `SpeechToText`, `TextToSpeech`, `Examiner`, `SpeakingEvaluator`, and `ExaminerService.process_turn`.

- [ ] Write failing tests for English questions, Uzbek explanations, language switching, Part transitions, and four-criterion reports.
- [ ] Run examiner tests and confirm failures are caused by absent interfaces.
- [ ] Implement the deterministic examiner and dependency-injected provider ports.
- [ ] Add bounded remote-provider adapters configured only through environment variables.
- [ ] Run examiner tests and confirm offline tests pass.
- [ ] Commit Task 7 files with `feat: add bilingual IELTS voice examiner`.

### Task 8: Live Call HTTP Interface and Mini App

**Files:**
- Create: `apps/core_api/routes/voice.py`
- Create: `apps/live_call/index.html`
- Create: `apps/live_call/app.js`
- Create: `apps/live_call/styles.css`
- Create: `tests/api/test_voice_turns.py`

**Interfaces:**
- Consumes: `ExaminerService.process_turn` and signed call tokens.
- Produces: `POST /api/live-call/turns/text`, `POST /api/live-call/turns/audio`, and a browser VAD/MediaRecorder client.

- [ ] Write failing API tests for text turns, invalid tokens, unsupported MIME types, oversize uploads, and TTS fallback.
- [ ] Run voice API tests and confirm expected failures.
- [ ] Implement validated text/audio turn endpoints and persistence-before-response behavior.
- [ ] Implement the Mini App call controls, transcript, language indicator, interruption, reconnect, and typed fallback.
- [ ] Run API tests and a static-asset smoke test.
- [ ] Commit Task 8 files with `feat: add bilingual Live Call Mini App`.

### Task 9: Telegram Stars Subscription

**Files:**
- Create: `packages/ieltix_core/application/subscriptions.py`
- Create: `apps/telegram_bot/handlers/subscription.py`
- Create: `tests/core/test_subscriptions.py`
- Create: `tests/bot/test_payment_flow.py`

**Interfaces:**
- Produces: `SubscriptionService.create_invoice_payload`, `validate_pre_checkout`, and `complete_payment` with charge-ID idempotency.

- [ ] Write failing tests proving duplicate charge IDs cannot extend access twice and malformed payloads are rejected.
- [ ] Run subscription tests and confirm expected failures.
- [ ] Implement subscription records, payment records, payload validation, and idempotency.
- [ ] Add Telegram invoice, pre-checkout, and successful-payment handlers.
- [ ] Run subscription and bot tests and confirm all pass.
- [ ] Commit Task 9 files with `feat: add secure Telegram Stars subscriptions`.

### Task 10: Operations, Deployment, and Existing Frontend Verification

**Files:**
- Create: `Dockerfile.bot`
- Create: `Dockerfile.core-api`
- Create: `docker-compose.bot.yml`
- Create: `docs/bot-operations.md`
- Modify: `.gitignore`
- Modify: `README.md`

**Interfaces:**
- Produces: documented local and production startup commands, health checks, and environment contract.

- [ ] Add configuration tests ensuring example environment keys match `Settings` aliases.
- [ ] Run the configuration test and confirm it fails before documentation/config artifacts exist.
- [ ] Add Docker services for PostgreSQL, Redis, core API, and bot with health checks and persistent volumes.
- [ ] Document BotFather setup, Mini App URL, migrations, backup, provider selection, and troubleshooting.
- [ ] Run `python -m pytest -q`, backend TypeScript build, and frontend production build.
- [ ] Commit Task 10 files with `chore: add IELTIX bot deployment and operations`.

## Plan Self-Review

- Every acceptance criterion in the design maps to Tasks 1–10.
- Core interfaces are introduced before their adapters and consumers.
- Paid providers are optional and network-free tests remain possible.
- Security-critical call tokens and payments have explicit negative tests.
- The existing React application is verified but not rewritten during foundation work.
