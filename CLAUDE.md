# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

### Frontend
```bash
npm install           # Install frontend dependencies
npm run dev           # Start Vite dev server at http://localhost:3000
npm run build         # Production build → ./build/
npm run dev:all       # Start both frontend and backend concurrently
```

### Backend
```bash
cd server && npm install   # Install backend dependencies (first time only)
npm run dev:server         # Start Express API server at http://localhost:3001
```

### Testing
```bash
npx playwright test                          # Run all Playwright tests
npx playwright test tests/auth.spec.ts       # Run auth tests only
npx playwright test -g "成功註冊新帳號"       # Run a single test by name
npx playwright test --reporter=list          # Run with detailed output
```

> **Important**: Both frontend (port 3000) and backend (port 3001) must be running before executing Playwright tests. The `playwright.config.ts` uses `webServer` to auto-start them if not already running.

## Architecture

This is a two-process application: a React frontend and a Node.js Express backend, communicating via a Vite dev proxy.

### Frontend (`src/`)

- **`App.tsx`** — wraps `<AuthProvider>` around `<Game>`. The `Game` component holds all game state (`boxes`, `score`, `gameEnded`) and calls `POST /api/scores` on game end if the user is logged in.
- **`context/AuthContext.tsx`** — global auth state (`username`, `token`). Persists to `localStorage`. Wrap components with `<AuthProvider>` to access via `useAuth()`.
- **`hooks/useApi.ts`** — `post()` and `get()` fetch wrappers that auto-attach the `Authorization: Bearer <token>` header from `AuthContext`.
- **`components/AuthModal.tsx`** — login/register Dialog with two independent sub-components (`LoginForm`, `RegisterForm`), each with its own `useForm` instance. IDs are prefixed (`login-username`, `register-username`, etc.) to avoid DOM conflicts when both tab contents are mounted.
- **`components/AuthHeader.tsx`** — top bar showing username + Logout when authenticated, or "Sign In / Register" button that opens `AuthModal`.
- **`components/ui/`** — shadcn/ui components (Radix UI primitives). Do not modify these.

### Backend (`server/src/`)

- **`index.ts`** — Express entry point, port 3001. Reads `server/.env` via `--env-file=.env` flag (Node.js 20.6+ built-in, no dotenv package needed).
- **`database.ts`** — opens/creates `server/database.db` using Node.js built-in `node:sqlite` (requires Node.js 22.5+). Creates `users` and `scores` tables on startup.
- **`middleware/auth.ts`** — `requireAuth` middleware that reads the JWT from the `Authorization` header and attaches `req.user = { id, username }`.
- **`routes/auth.ts`** — `POST /api/auth/register` and `POST /api/auth/login`. Returns `{ token, username }`.
- **`routes/scores.ts`** — `POST /api/scores` (save game result) and `GET /api/scores/me` (history). Both require `requireAuth`.

### Request flow

Browser → `http://localhost:3000/api/*` → Vite proxy → `http://localhost:3001/api/*`

CORS is set to `http://localhost:3000` only. The proxy means the browser never directly contacts port 3001.

### Database schema

```sql
users:  id, username (UNIQUE), password (bcrypt hash), created_at
scores: id, user_id (FK → users.id), score, played_at
```

### Environment

`server/.env` must contain `JWT_SECRET`. This file is git-ignored. The backend startup command (`node --env-file=.env`) loads it without any additional packages.

## Known issues / gotchas

- **Playwright + react-hook-form**: Use `pressSequentially()` instead of `fill()` when interacting with react-hook-form inputs in tests. `fill()` sets the DOM value directly and does not trigger React's synthetic `onChange`, so validation and state updates are skipped. See `tests/auth.spec.ts` for the `fillInput()` helper.
- **`node:sqlite` warning**: Node.js prints `ExperimentalWarning: SQLite is an experimental feature` on startup. This is expected and harmless.
- **Port conflicts**: If port 3000 is taken, Vite auto-increments (3001, 3002…). Update `playwright.config.ts` `baseURL` to match if tests fail with connection refused.
