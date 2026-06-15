# AI Interview Copilot — Full Implementation Explanation

## Overview

AI Interview Copilot is an AI-powered mock interview preparation platform. Candidates upload resumes, paste job descriptions, get skill gap analysis, and practice interviews with real-time AI coaching. The project is in active development — auth, resume parsing, and JD analysis are implemented; interview rooms, real-time sockets, and the AI engine remain as placeholders.

---

## Tech Stack

| Layer           | Technology                                                  |
| --------------- | ----------------------------------------------------------- |
| **Runtime**     | Node.js 20+, TypeScript 5 (ES2022)                          |
| **Framework**   | Express 5                                                   |
| **Database**    | PostgreSQL via Prisma 7 (with `@prisma/adapter-pg`)         |
| **Validation**  | Zod 4                                                       |
| **Auth**        | JWT (`jsonwebtoken`) + bcrypt                               |
| **AI**          | Groq SDK (LLaMA 3.1 8B), OpenAI SDK included for future use |
| **File Upload** | multer (in-memory)                                          |
| **Real-time**   | Socket.IO (placeholder dependency)                          |
| **Testing**     | Node.js built-in (`node:test` + `node:assert/strict`)       |
| **Monorepo**    | npm workspaces                                              |

---

## Directory Structure

```
ai-interview-copilot/
├── backend/          # Express API server (the main codebase)
├── frontend/         # React 18 + MUI 5 + Vite (mostly implemented)
├── ai-engine/        # Empty workspace (AI engine placeholder)
├── shared/           # Empty workspace (contracts/types placeholder)
├── docs/             # architecture.md, api.md, deployment.md, risks.md
└── docker/           # Placeholder README
```

---

## Backend Architecture

### Entry Point: `backend/src/server.ts`

- Loads env vars, creates the Express app via `createApp()`, starts listening on `BACKEND_PORT` (default 4000).
- Registers graceful shutdown: on `SIGINT`/`SIGTERM`, closes the HTTP server then disconnects Prisma.

### App Factory: `backend/src/app/app.ts`

`createApp()` assembles the Express app in this order:

1. **Security & parsing** — `helmet()`, `cors()`, `express.json()`, `morgan('dev')`
2. **Health check** — `GET /health` returns `{ success: true, data: { status: 'ok' } }`
3. **API routes** — mounts `apiRouter` at `/api`
4. **404 handler** — catches unmatched routes
5. **Global error handler** — catches `HttpError` (with `statusCode` + `details`) and returns structured JSON errors

### Configuration

- **`backend/src/config/env.ts`** — Loads `BACKEND_PORT`, `DATABASE_URL`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `GROQ_API_KEY`, `GROQ_MODEL` from `process.env`. `validateEnv()` throws if `DATABASE_URL` or `JWT_SECRET` are missing.
- **`backend/src/config/prisma.ts`** — Creates a PrismaClient singleton using `@prisma/adapter-pg` (the new adapter-based Prisma), pointing to `src/generated/prisma/client.js`.

### Middleware

- **`auth.middleware.ts`** (`requireAuth`):
  1. Extracts `Bearer <token>` from `Authorization` header
  2. Verifies JWT with `env.jwtSecret`
  3. Extracts `sub` as user ID
  4. Looks up the user via `prisma.user.findUnique`
  5. Attaches the user to `req.user`
  6. Throws 401 if token missing, invalid, expired, or user deleted

- **`validate.middleware.ts`** (`validate(schema)`):
  1. Takes a Zod schema
  2. Parses `{ body, params, query }` from the request
  3. On success, attaches parsed data to `req.validated`
  4. On failure, throws 400 with flattened Zod errors

### Utilities

- **`asyncHandler.ts`** — Wraps async route handlers so rejected promises are forwarded to Express error handler via `.catch(next)`.
- **`httpError.ts`** — Custom `HttpError` class with `statusCode` and optional `details` property.

### Type Augmentation: `backend/src/types/express.d.ts`

Extends Express's `Request` interface with:

- `user?: User` — set by `requireAuth`
- `validated?: { body?, params?, query? }` — set by `validate()`

---

## Database Schema

9 models in `prisma/schema.prisma`:

### User

Core identity. Hashed password, email unique. Related to everything.

### Resume

Uploaded resume with extracted intelligence. Stores raw text, parsed data (JSONB), and flat columns for skills (string array), experience years, domain, education, certifications. Also has JSONB columns for strengths, growth areas, recommended roles, companies, and roles.

### JobDescription

Saved job listings with a title, company, description, and requirements text.

### Interview

Session linking a user, a resume, and optionally a job description. Has a status (default "draft"), and timestamps for started/completed.

### Question

Interview questions, ordered per interview. Unique on `(interviewId, order)`.

### Answer

User's recorded answer per question. Unique on `(interviewId, questionId)`.

### Score

Scored evaluation per category (e.g., "communication", "technical"). Each answer can have multiple scores. Optional `answerId` allows per-interview aggregate scores.

### Feedback

AI-generated feedback per answer or per interview. Has summary, strengths, and improvements.

### WeakArea

Identified weaknesses per interview. Unique on `(interviewId, category)`.

3 migrations exist: initial schema creation, adding resume parsed fields (skills array, etc.), and adding intelligence fields (strengths, growth areas, etc.).

---

## API Endpoints

### Implemented

| Method | Path                 | Auth | What It Does                                             |
| ------ | -------------------- | ---- | -------------------------------------------------------- |
| `GET`  | `/health`            | No   | Health check                                             |
| `POST` | `/api/auth/register` | No   | Register user, return user + JWT                         |
| `POST` | `/api/auth/login`    | No   | Login, return user + JWT                                 |
| `GET`  | `/api/auth/profile`  | Yes  | Get current user                                         |
| `POST` | `/api/resume/upload` | Yes  | Upload PDF/DOCX, parse it, return intelligence profile   |
| `GET`  | `/api/resume/me`     | Yes  | List user's resumes                                      |
| `POST` | `/api/job/analyze`   | Yes  | Analyze JD against a resume, return skill match analysis |

### Auth Module (`backend/src/modules/auth/`)

**Routes:**

- `POST /register` — Zod-validates `{ name?, email, password }`, checks for duplicate email (409), bcrypt-hashes password (12 rounds), creates user, signs JWT (7d expiry by default), returns `{ user, token }`.
- `POST /login` — Zod-validates `{ email, password }`, looks up user (401 if not found), compares password hash (401 if mismatch), returns `{ user, token }`.
- `GET /profile` — Protected. Returns `{ user }` from `req.user`.

### Resume Module (`backend/src/modules/resume/`)

**Upload flow (`POST /api/resume/upload`):**

1. **multer middleware** (`resume.storage.ts`) — Accepts a single file via `multipart/form-data`, field name `file`. Validates MIME type (PDF or DOCX), file size (max 5MB). Stores in memory buffer.
2. **Zod validation** (`resume.schema.ts`) — Validates optional `title` field.
3. **Text extraction** (`resume.parser.ts`) — For PDF, uses `pdf-parse` (new `PDFParse` API). For DOCX, uses `mammoth`. Cleans text (normalizes whitespace, removes zero-width chars). Falls back to deterministic parsing if AI fails.
4. **AI extraction** (`resume-ai-extractor.service.ts`) — Sends raw text to Groq (LLaMA 3.1 8B) via a strict JSON prompt (`resume-extraction.prompt.ts`). Extracts: `candidateSummary`, `experienceYears`, `domain`, `skills`, `strengths`, `growthAreas`, `companies`, `roles`, `education`, `certifications`, `recommendedRoles`. On failure (no API key, network error, parse error), falls back to deterministic parsing.
5. **Deterministic parsing** (`resume.parser.ts` `parseResumeText()`) — Regex-based skill detection (35+ skill definitions), experience year extraction, education parsing (degree + college + year, up to 5 entries), certification extraction, domain inference (Full Stack, AI Engineer, etc.).
6. **Normalization** (`resume-normalizer.ts`) — Deduplicates, sorts, aliases skill names (e.g., "Node.js" → "Node.js", "js" → "JavaScript"), trims all strings.
7. **Persistence** — Creates a Resume record in PostgreSQL with all parsed fields.
8. **Response** — `{ resumeId, candidateSummary, skills, experienceYears, domain, strengths, growthAreas, recommendedRoles }`

**List flow (`GET /api/resume/me`):**

- Simple `findMany` ordered by `createdAt: 'desc'`, returns `{ id, title, fileName, createdAt }`.

### Job Module (`backend/src/modules/job/`)

**Analyze flow (`POST /api/job/analyze`):**

1. **Zod validation** (`job.schema.ts`) — Validates `{ resumeId, jobDescription (min 20 chars) }`.
2. **Resume lookup** (`job.service.ts`) — Finds the resume by ID and user ID (404 if not found), selects `skills` and `experienceYears`.
3. **Skill matching** (`job.analyzer.ts`):
   - Extracts required skills from the job description using regex (34 skill definitions).
   - Normalizes both JD skills and resume skills into canonical keys (aliases like "JavaScript" → "js", "CI/CD pipelines" → "cicd", punctuation removal, singularization).
   - Computes matched/missing skills, match percentage (`round(matched / required * 100)`), and experience gap.
   - Generates plain-English recommendations for missing skills and experience gaps.
4. **Response** — `{ requiredSkills, matchedSkills, missingSkills, matchPercentage, experienceGap, recommendations }`.

---

## Frontend Architecture

**Entry:** `main.jsx` — mounts `AppThemeProvider` (MUI ThemeProvider + Zustand dark mode toggle) and `RouterProvider`.

**Router** (`app/router.jsx`) — `createBrowserRouter` with:

- **Public routes** — `/login`, `/register` (wrapped in `AuthLayout`)
- **Protected routes** — `/dashboard`, `/resume-upload`, `/jd-upload`, `/interview-room`, `/analytics`, `/history` (wrapped in `AppLayout` + `ProtectedRoute`)
- `ProtectedRoute` checks `useAuthStore.isAuthenticated`, redirects to `/login` with `location.state.from` for return after login.

**State management:** Two Zustand stores:

- `useAuthStore` — token, user, login(), logout() (persisted to localStorage)
- `useThemeModeStore` — light/dark toggle

**Layouts:**

- `AuthLayout` — centered card with a gradient hero
- `AppLayout` — MUI `Sidebar` (expandable nav with readiness status) + `Topbar` (theme toggle, logout) + `<Outlet />`

**Implemented pages:**

- **Login / Register** — Form with MUI `TextField`, validation, API calls, redirect on success
- **Dashboard** — Full UI with greeting, stat cards (interviews, score, skill match), MUI `RadialBarChart`, skills list with chips, recent interviews table
- **ResumeUploadPage** — File picker (drag-and-drop zone), upload button, parsed result display (skills chips, experience, domain badge, strengths/growth areas using MUI `Paper` + `Chip`)
- **JobAnalysisPage** — Resume selector, JD text area, analyze button, results display (match percentage as `LinearProgress`, matched/missing skills, experience gap, recommendations)
- **Placeholder pages** — InterviewRoomPage, JDUploadPage, AnalyticsPage, HistoryPage — all use `PagePlaceholder` (gradient hero + card grid)

---

## Testing

Uses Node.js built-in test runner (`node:test` + `node:assert/strict`). Run via:

```
npm run test   # backend workspace
```

Actual test files:

- **`job.analyzer.test.ts`** — Tests skill normalization (aliases, punctuation, singular/plural) and end-to-end `analyzeJobDescription` with known inputs/outputs (match percentage, matched/missing skills).

Placeholder test files exist for resume upload, resume AI extractor, and job analyze, documenting scenarios to implement.

---

## AI Integration

**Groq SDK** (`groq-sdk`) is the primary AI provider. Used for resume intelligence extraction:

- Endpoint: [`llama-3.1-8b-instant`](https://console.groq.com) via chat completions
- `temperature: 0`, `response_format: { type: 'json_object' }`
- Prompt instructs the model to return a strict JSON shape with 11 fields
- Fallback: if Groq fails (no API key, network error, parse error), deterministic regex-based parsing is used

OpenAI SDK (`openai` v6) is a dependency but not yet used.

---

## Security

- **Passwords** — bcrypt with 12 salt rounds
- **JWT** — Signed tokens with configurable expiry (default 7d). `sub` claim holds user ID.
- **Headers** — `helmet()` sets security-related HTTP headers (CSP, XSS, etc.)
- **CORS** — Enabled openly (no origin restriction in current config)
- **Validation** — Zod sanitizes and validates all inputs server-side
- **Error handling** — Stack traces never leaked; consistent `{ success: false, error: { message } }` responses

---

## Implementation Status

| Feature                                                 | Status          |
| ------------------------------------------------------- | --------------- |
| Monorepo scaffold                                       | Complete        |
| Database schema + 3 migrations                          | Complete        |
| Auth (register, login, JWT, bcrypt)                     | **Implemented** |
| Resume upload + text extraction (PDF/DOCX)              | **Implemented** |
| Resume AI extraction (Groq) with fallback               | **Implemented** |
| Resume deterministic parsing (regex-based)              | **Implemented** |
| Resume skill normalization (dedup, aliases)             | **Implemented** |
| Job description analysis (skill matching, gap analysis) | **Implemented** |
| Express app factory (helmet, CORS, error handling)      | **Implemented** |
| Zod request validation middleware                       | **Implemented** |
| JWT auth middleware                                     | **Implemented** |
| Async handler wrapper                                   | **Implemented** |
| Unit tests for job analyzer                             | **Implemented** |
| Frontend auth pages (login, register)                   | **Implemented** |
| Frontend app shell (sidebar, topbar, dark mode)         | **Implemented** |
| Frontend dashboard (stats, skills, charts)              | **Implemented** |
| Frontend resume upload page                             | **Implemented** |
| Frontend JD analysis page                               | **Implemented** |
| Frontend interview room                                 | Placeholder     |
| Frontend analytics / history                            | Placeholder     |
| Interview lifecycle (questions, answers, scoring)       | Not started     |
| Real-time Socket.IO                                     | Not started     |
| AI engine workspace                                     | Empty           |
| Shared types workspace                                  | Empty           |
| Docker configuration                                    | Empty           |
| Comprehensive test suite                                | Minimal         |
| Billing / Stripe integration                            | Planned only    |
