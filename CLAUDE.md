# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What This Repo Is

RabbiAssist is a personal automation SaaS — monorepo containing a React frontend and a TypeScript/Fastify backend that replaces an original n8n workflow system. It handles Gmail inbox classification, trip inference, bidirectional Google Calendar sync, WhatsApp document intake, iOS Notes task extraction, and Pushover reminders.

**Monorepo layout:**
- `frontend/` — React + Vite + TypeScript + Tailwind + shadcn/ui (Supabase-connected web app)
- `api/` — TypeScript/Fastify backend (all active development)
- `n8n/dev/` and `n8n/prod/` — original n8n workflow JSONs preserved as reference during migration

---

## Development Commands

```bash
cd api

npm run dev           # Start API server (tsx watch)
npm run dev:worker    # Start pg-boss worker (tsx watch)
npm run typecheck     # TypeScript type check (no emit)
npm run build         # Compile to dist/
npm run lint          # ESLint
```

**Production (Docker):**
```bash
cd api
docker compose up -d       # Starts both `api` (port 3000) and `worker` services
docker compose logs -f api
docker compose logs -f worker
```

---

## Architecture

**Backend:** Node.js + TypeScript + Fastify (ESM, `"type": "module"`)  
**Database:** Supabase (PostgreSQL) — service-role client in `api/src/db/client.ts`  
**Auth:** Supabase Auth — JWT middleware in `api/src/lib/auth.ts` applied to all `/api/*` routes; webhooks are unprotected  
**Job scheduling:** pg-boss (Postgres-backed) — long-running `worker.ts` process alongside the API server  
**AI:** OpenAI (gpt-4o-mini, chatgpt-4o-latest) + Anthropic Claude — wrappers in `api/src/services/ai/`  

### Two-process deployment

| Process | Entry point | Purpose |
|---|---|---|
| API server | `src/server.ts` | REST routes + webhook endpoints |
| Worker | `src/worker.ts` | pg-boss cron jobs (polling, sync, reminders) |

---

## Codebase Structure (`api/src/`)

```
config.ts              Zod-validated env var schema (fails fast at startup)
db/
  client.ts            Service-role Supabase singleton
  types.ts             TypeScript interfaces for all DB tables (hand-maintained; run
                       `supabase gen types typescript` to regenerate from live schema)
lib/
  auth.ts              Fastify plugin — verifies Supabase JWT, decorates req.userId
  errors.ts            HttpError class + Unauthorized/NotFound/BadRequest helpers
services/
  ai/                  All AI calls — prompts extracted verbatim from n8n workflows
    openai.ts          chatComplete / chatCompleteJson wrappers
    anthropic.ts       claudeComplete wrapper
    email-classifier.ts  Two-step: category → trip subcategory (gpt-4o-mini)
    trip-extractor.ts  Extract trip fields from email body (gpt-4o-mini)
    receipt-extractor.ts Extract receipt metadata (gpt-4o-mini)
    task-extractor.ts  Extract tasks + due dates from iOS notes (gpt-4o-mini)
    deduplicator.ts    95% semantic similarity dedup (chatgpt-4o-latest)
  gmail/
    client.ts          Per-user OAuth2 token refresh; list/get messages; add/remove labels
    inbox-agent.ts     Orchestrates: unread → classify → extract → infer → label
    labels.ts          (utility — label list management)
  calendar/
    client.ts          Per-user OAuth2; listChangedEvents, createEvent, updateEvent, deleteEvent
    pull-sync.ts       Google Calendar → Supabase upsert
    push-sync.ts       Supabase (sync_status=pending) → Google Calendar + deletion handler
  trips/
    crud.ts            DB helpers: getUserByEmail, getMatchingTrips, createTrip, createTripItem, etc.
    inference.ts       Trip Inference Agent logic (replaces 3-agent n8n flow):
                       find matching trip → create/insert/update/flag for review
  storage/
    upload.ts          Shared Supabase Storage upload helper + buildStoragePath
    receipts.ts        Receipt email → upload PDFs → insert receipts table
    trip-docs.ts       Trip email attachments → trip-documents bucket → documents table
    whatsapp-docs.ts   WhatsApp media → whatsapp-documents bucket → whatsapp_docs table
  reminders/
    notes-reminders.ts  Weekly: ios-notes reminders with due dates → Pushover
    trip-reminders.ts   Daily: upcoming trips with missing items → 30/15-day Pushover
  whatsapp/
    client.ts          getMediaUrl, downloadMedia, sendTextMessage
  notifications/
    pushover.ts        sendPushover (supports priority=1 for urgent)
api/
  webhooks/
    whatsapp.ts        POST /webhooks/whatsapp (verify GET + message POST)
    ios-notes.ts       POST /webhooks/ios-notes (user_secret auth)
  routes/
    trips.ts           CRUD /trips + /trip-items
    events.ts          CRUD /events (mutations set sync_status=pending)
    reminders.ts       CRUD /reminders
    receipts.ts        GET /receipts
    users.ts           GET /users/me
jobs/
  index.ts             Registers all pg-boss cron schedules + work handlers
  gmail-inbox-poll.job.ts   Every 1 min
  calendar-pull.job.ts      Every 1 min
  calendar-push.job.ts      Every 2 min
  event-deletions.job.ts    Every 2 min
  trip-reminders.job.ts     Daily 9am UTC
  note-reminders.job.ts     Monday 9am UTC
server.ts              Fastify app (registers plugins, routes, webhooks)
worker.ts              pg-boss startup + graceful shutdown
```

---

## Supabase Tables

| Table | Purpose |
|---|---|
| `users` | id, email, user_secret, phone_number, google_access_token, google_refresh_token |
| `trips` | Trip records inferred from emails |
| `trip_items` | Line items per trip (flight/hotel/car/travel_insurance/other) |
| `trip_items_to_review` | Items that couldn't be matched to a trip — requires manual review |
| `events` | Calendar events; sync_status=pending triggers push to Google Calendar |
| `documents` | Trip document files stored in Supabase Storage |
| `receipts` | Receipt files + AI-extracted metadata |
| `reminders` | Tasks from iOS Notes + trip reminder tracking |
| `whatsapp_docs` | Files received via WhatsApp |

**Storage buckets:** `receipts`, `trip-documents`, `whatsapp-documents`

---

## Key Patterns

**Per-user Google OAuth:** Tokens stored in `users.google_access_token / google_refresh_token`. Both Gmail and Calendar clients refresh automatically via `auth.on('tokens', ...)` and persist back to Supabase.

**Calendar sync direction:** 
- Google → Supabase: `calendar-pull` job polls every minute using `updatedMin = now - 5min`
- Supabase → Google: `calendar-push` job picks up rows where `sync_status = 'pending'` (set by API mutations)
- Deletions: soft-delete via `events.deleted = true` → `event-deletions` job removes from Google Calendar

**Trip inference flow:** Email → `email-classifier` → `trip-extractor` → `inference.ts` (find matching trip by destination + date overlap ±0 days → create/insert/update/flag)

**AI prompt source:** All prompts are extracted verbatim from `n8n/prod/Prod - *.json` — check those files if you need to understand the original intent of any AI call.

---

## Environment Variables

Copy `api/.env.example` to `api/.env`. Required vars: `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `SUPABASE_JWT_SECRET`, `DATABASE_URL` (pg-boss Postgres connection), `OPENAI_API_KEY`, `ANTHROPIC_API_KEY`, `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET`, `WHATSAPP_PHONE_NUMBER_ID`, `WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_VERIFY_TOKEN`, `PUSHOVER_APP_TOKEN`, `PUSHOVER_USER_KEY`.

## Gmail Label IDs

The `LABEL_MAP` in `api/src/services/gmail/inbox-agent.ts` maps category names to Gmail label IDs. Run the `Gmail Label Creation` utility (see `src/prod/Prod - Gmail Label Creation.json`) to create the labels, then update the map with the real label IDs from the Gmail API.
