# Incident Logger

## Overview
Lightweight incident logging and summarization tool.

## Tech Stack
- Backend: Node.js + Express (TypeScript)
- Database: PostgreSQL + Sequelize
- Auth: Firebase Authentication
- Summaries: OpenAI GPT-3.5
- Frontend: Next.js + React + TypeScript + Tailwind
- Testing: Jest

## Setup

### 1. Clone Repo
```bash
git clone <repo-url>
cd incident-logger
```

### 2. Backend
```bash
cd backend
cp .env.example .env
npm install
npm run dev
```

### 3. Frontend
```bash
cd ../frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### 4. Tests
```bash
cd backend
npm test
```

## Firebase Setup
1. Create a Firebase project
2. Enable Authentication (Google)
3. Download service account JSON and fill in `.env`

## Notes
- Ensure PostgreSQL is running and DATABASE_URL is correct.
- For Docker bonus, you can add Dockerfiles separately.
