# Product Launch Checklist

## Goal

This checklist is for moving `lianyu_ai` from a feature demo into a product that can be released to real users with acceptable stability, clarity, and operational safety.

Priority levels:

- `P0`: must finish before public launch
- `P1`: should finish before paid growth or broader rollout
- `P2`: improve polish, retention, and scale after launch

---

## Current Assessment

The project already has a usable product core:

- user auth and profile basics
- AI chat and session management
- frontend multi-page mobile-style app shell
- backend API and deployment path
- AI helper flows in the chat page

It is not yet production-ready because these areas are still weak:

- secrets and environment hygiene
- runtime stability and monitoring
- frontend structure consistency
- Discover/content module maturity
- backend deployment consistency
- real product operations and support flows

---

## P0: Must Do Before Launch

### 1. Secrets and Access Control

- Remove all plaintext passwords, API keys, and sensitive tokens from the repo and local helper scripts.
- Rotate the following immediately:
  - server SSH password
  - database password
  - OpenAI/Gemini/Qwen/Minimax keys
  - any OAuth client secret already exposed
- Move secrets to server env files or a secret manager.
- Stop relying on `sshpass` for long-term deployment.
- Standardize on SSH key auth for GitHub and server access.

Definition of done:

- No real secret remains in tracked files.
- Deployment and Git push both work without hardcoded passwords.

### 2. Deployment Consistency

- Pick one real production topology and remove ambiguity:
  - frontend static server on `80`
  - backend API on `3000` or `3001`
  - optional reverse proxy in front
- Fix mismatch between current scripts and live server behavior.
- Document the actual production process in one place.
- Make backend startup deterministic:
  - one process manager
  - one port
  - one env file

Definition of done:

- `frontend`, `backend`, and `health check` each have one canonical URL.
- One command deploys to the correct runtime shape every time.

### 3. Logging, Monitoring, and Disk Safety

- Add log rotation for PM2 or Node logs.
- Add disk usage monitoring and alert threshold.
- Add basic uptime monitoring for:
  - homepage
  - `/api/health`
  - AI config route
- Add structured error logging for backend failures.
- Add frontend error monitoring if possible.

Definition of done:

- Logs cannot silently fill the server disk again.
- Service failures are visible within minutes.

### 4. Core User Path Stability

The following path must work reliably end-to-end:

1. open app
2. register or login
3. enter chat
4. send message
5. receive AI reply
6. create/switch/delete session
7. reopen app and recover recent state

Required work:

- verify auth flow
- verify session persistence
- verify chat send/reply behavior
- verify upload path if marketed
- verify mobile keyboard behavior on iOS
- verify empty states and error states

Definition of done:

- This path passes on real device and mobile browser repeatedly.

### 5. Frontend Structural Cleanup

- Remove mixed interaction styles:
  - inline `onclick`
  - global `window.*`
  - duplicate event binding paths
- Standardize page lifecycle and navigation behavior.
- Standardize API response handling in frontend services.
- Reduce hidden coupling between HTML and JS.

Definition of done:

- Main pages no longer depend on fragile DOM/event duplication.

### 6. Discover Module Minimum Product Version

Do not ship fake social features.

Keep only:

- search
- category filter
- content list
- content detail
- “practice in chat” entry

Remove or hide until real backend exists:

- fake comments
- fake likes
- fake ratings
- fake share/bookmark flows

Definition of done:

- Every visible Discover action is real and user-meaningful.

### 7. Legal and User-Facing Basics

- Add privacy policy page.
- Add terms of service page.
- Add AI disclaimer for advice limitations.
- Add account deletion or data deletion request path.
- Add support contact path.

Definition of done:

- A user can understand what data is stored and how to contact you.

---

## P1: Strongly Recommended Before Scale

### 1. Product Analytics

- Add analytics for:
  - activation
  - first chat sent
  - session creation
  - AI helper usage
  - Discover content open
  - retention events
- Define one north-star metric.
- Track funnel drop-off.

### 2. AI Quality Control

- Build prompt/version management.
- Add fallback behavior when provider fails.
- Add provider-specific timeout and retry policy.
- Add a small internal evaluation set for:
  - opener generation
  - reply suggestions
  - emotion analysis
  - topic generation

### 3. Content System

- Replace Discover mock data with real content JSON or CMS-backed API.
- Add content model:
  - title
  - summary
  - body
  - category
  - publish state
  - read time
  - prompts
- Add admin workflow or at least file-based content publishing.

### 4. Payment Hardening

- Replace stubbed or placeholder payment flow with real provider integration.
- Add order reconciliation.
- Add failure and refund handling.
- Add membership entitlement checks.

### 5. Test Coverage

Minimum test targets:

- backend route smoke tests
- service layer contract tests
- auth flow regression tests
- session CRUD tests
- AI extension route tests

### 6. UI/UX Consistency Pass

- unify spacing, typography, and color tokens
- fix mixed Chinese/English copy
- clean outdated pages and hidden dead UI
- validate dark mode on all primary screens
- validate iPhone viewport behavior and safe areas

---

## P2: After Launch Optimization

### 1. Growth and Retention

- onboarding improvements
- push reminders
- saved practice prompts
- personalized Discover recommendations
- content collections and topic hubs

### 2. Operational Back Office

- admin dashboard
- user feedback triage
- moderation tooling
- support workflow
- release notes system

### 3. Architecture Evolution

- modularize frontend further
- reduce global state
- migrate repeated config logic into one source
- unify database strategy
- standardize backend environment loading and startup

---

## Recommended Execution Order

### Phase 1: Safe Launch Base

- secrets cleanup and rotation
- deployment unification
- log rotation and monitoring
- core chat path manual QA

### Phase 2: Product Surface Cleanup

- Discover simplification
- frontend structure cleanup
- UX consistency pass
- legal/support pages

### Phase 3: Real Product Systems

- analytics
- real content backend
- payment hardening
- test coverage

---

## Immediate Next Sprint

If only one short sprint is available, do these first:

1. remove and rotate exposed secrets
2. unify server topology and deployment docs
3. add PM2 log rotation and disk protection
4. run a real-device regression pass on login + chat + sessions
5. finish Discover simplification and remove remaining fake actions

---

## Release Gate

Do not publicly launch until all of the following are true:

- no exposed secrets in repo
- backend health check stable
- frontend and backend deployment path consistent
- logs cannot fill disk unchecked
- auth + chat + session flow verified on real device
- Discover contains only real features
- support/legal basics exist

