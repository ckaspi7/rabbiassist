# RabbiAssist

Personal automation SaaS — monorepo containing the React frontend, TypeScript/Fastify backend, and legacy n8n workflows.

## Structure

- `frontend/` — React + Vite + TypeScript + Tailwind + shadcn/ui web app (Supabase-connected)
- `api/` — TypeScript/Fastify backend (Gmail, Google Calendar, WhatsApp, AI, reminders)
- `n8n/dev/` — development n8n workflow JSONs (legacy reference)
- `n8n/prod/` — production n8n workflow JSONs (legacy reference)

## Getting Started

**Frontend:**
```bash
cd frontend
npm install
cp .env.example .env   # fill in Supabase credentials
npm run dev
```

**Backend:**
```bash
cd api
npm install
cp .env.example .env   # fill in all required vars
npm run dev            # API server
npm run dev:worker     # pg-boss worker (separate terminal)
```

**n8n workflows:** Import individual JSON files from `n8n/dev/` or `n8n/prod/` via n8n → Import from file.
