# 🚀 Incident Logger App

This is a full-stack application to log, view, and summarize incidents using AI. It uses:

- **Frontend:** Next.js + TypeScript  
- **Backend:** Express.js + TypeScript  
- **Database:** PostgreSQL  
- **AI Integration:** OpenAI API for summaries  

---

## 🐳 Getting Started with Docker (Recommended)

### ✅ Prerequisites

- Install [Docker Desktop](https://www.docker.com/products/docker-desktop/) for your OS.

---

### 📦 1. Clone the Repo

```bash
git clone https://github.com/arshita1625/Incident-logger.git
cd incident-logger
```

---

### ⚙️ 2. Environment Setup

Ensure these environment files exist and are filled:

#### `frontend/.env.local`

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api
NEXT_PUBLIC_FIREBASE_API_KEY=your-firebase-api-key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-app.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-firebase-project-id

```

#### `backend/.env`

```env
PORT=4000
DB_HOST=db
DB_PORT=5432
DB_USER=postgres
DB_PASSWORD=postgres
DB_NAME=incidentdb
OPENAI_API_KEY=your-openai-key-here

FIREBASE_PROJECT_ID=your-firebase-id
FIREBASE_CLIENT_EMAIL=your-client-email
FIREBASE_PRIVATE_KEY=-----BEGIN PRIVATE KEY-----\nABC...\n-----END PRIVATE KEY-----\n
```

---

### 🐋 3. Run the Full App

```bash
docker compose up --build
```

Wait for:

- Frontend → `http://localhost:3000`
- Backend → `http://localhost:4000`

To stop everything:

```bash
docker compose down -v --remove-orphans
```

---

## 🧪 Running Tests
![backend](./assets/backend.png)
![frontend](./assets/frontend.png)
![UI](./assets/Login.png)
![UI](./assets/Logger.png)
![UI](./assets/List.png)
### 📁 Backend & Frontend Tests

```bash
cd incident-logger
npm run docker:test

> 📈 Generates code coverage reports too.

---
## 💬 Common Issues

### 🐘 Postgres Connection Refused?

Run:

```bash
docker compose down -v --remove-orphans
docker compose up --build
```

---

## 🛠 Troubleshooting

If you get stuck, try:

- `npm install` inside `frontend/` and `backend/`
- Check `.env` files are correctly configured
- Make sure Docker Desktop is **running**

---
