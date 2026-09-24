# 🚀 DeployHub — Modern Developer Cloud Deployment Platform

DeployHub is a full-stack developer platform where engineering teams can connect GitHub repositories, configure build environments, trigger automated multi-stage deployments, monitor live streaming terminal logs, and diagnose build failures using **Google Gemini AI**.
---

## ✨ Key Features

- 🎨 **State-of-the-Art Visual Identity**: Deep black background, vibrant neon pink accents, glassmorphism, animated glow pulses, and smooth Framer Motion micro-animations.
- ⚡ **Interactive Landing Page**: Hero with live-streaming simulated terminal card, architecture workflow timeline, interactive AI Doctor comparison, and platform metrics.
- 📊 **Developer Dashboard**: Time-aware greeting (`Good evening, Developer`), metric cards (Projects, Deployments, Success Rate, Average Build Speed), active projects carousel, and recent deployments table.
- 🧙‍♂️ **4-Step Deployment Wizard**:
  1. **Connect Repository**: Search GitHub, paste any Git URL, or choose 1-click starter templates (Vite React, Next.js, Node.js API, Python FastAPI, Vue, Astro).
  2. **Configure Project**: Framework auto-detection, customizable build command (`npm run build`), start command, branch, root directory, and Node version.
  3. **Environment Variables**: Key-Value secrets manager with AES-256 client masking.
  4. **Ready to Deploy**: Summary preview card with celebratory confetti trigger.
- 💻 **Live Deployment Pipeline Screen**:
  - Multi-stage visual stepper: `✓ Cloned` ➔ `✓ Installed` ➔ `● Building` ➔ `○ Containerized` ➔ `○ Health Check` ➔ `🟢 LIVE`.
  - Real-time Server-Sent Events (SSE) streaming terminal with auto-scroll, log-level highlighting, filter search, and copy/download logs.
  - Celebratory success state with live preview link.
- 🧠 **Gemini AI Error Doctor**:
  - Automatically diagnoses build stack traces when a deployment fails.
  - Breaks down:
    - **What happened** (Plain-English explanation)
    - **Technical root cause**
    - **Actionable 1-Click Fix** (e.g. `npm install @radix-ui/react-tooltip`)
    - **Proactive prevention advice**
  - Disclaimer: Explains real logs with zero hallucination.
- 📜 **Dedicated Logs Explorer**: Global console viewer with regex filtering, log levels (`info`, `command`, `system`, `error`), and raw log downloads.
- ⏱️ **Deployment History & Rollbacks**: Full audit trail with 1-click rollback to any previous successful commit SHA.
- 🔐 **Security & Vault**: Encrypted secrets management and safe backend-only API key handling.

---

## 🛠️ Technology Stack

| Layer | Technologies |
|---|---|
| **Frontend** | React 19, Vite, Tailwind CSS, Framer Motion, Lucide Icons, Canvas Confetti, React Router |
| **Backend** | Node.js, Express.js, REST APIs, Server-Sent Events (SSE), Child Process Sandbox |
| **Database** | PostgreSQL with dual-mode persistent fallback store (runs out of the box) |
| **AI Integration** | Google Gemini 1.5 / 2.0 Flash (`@google/genai` & REST API) |
| **Containerization** | Docker, Docker Compose, Multi-stage builds |

---

## 📁 Project Structure

```text
DeployHub/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   │   └── db.js               # PostgreSQL & persistent database adapter
│   │   ├── models/
│   │   │   └── schema.sql          # PostgreSQL DDL table schemas
│   │   ├── routes/
│   │   │   ├── projects.js         # Projects CRUD & environment variables
│   │   │   ├── deployments.js      # Deployments, redeploy, rollback, SSE stream
│   │   │   ├── github.js           # GitHub repo search & branch inspector
│   │   │   ├── ai.js               # Gemini AI error explanation route
│   │   │   └── metrics.js          # Platform telemetry & analytics
│   │   ├── services/
│   │   │   ├── deploymentEngine.js # Multi-stage pipeline & live SSE broadcaster
│   │   │   ├── githubService.js    # GitHub API client & template catalog
│   │   │   └── aiService.js        # Gemini AI diagnostic assistant & fallback
│   │   └── server.js               # Express application entry point
│   ├── package.json
│   └── data/                       # Local persistent JSON data store
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Navbar.jsx          # Top navigation with live edge indicator
│   │   │   ├── Sidebar.jsx         # Dashboard navigation sidebar
│   │   │   ├── TerminalCard.jsx    # Glowing floating terminal with live typing
│   │   │   ├── StatusBadge.jsx     # LIVE / BUILDING / FAILED animated pills
│   │   │   ├── AIDiagnosisModal.jsx# Gemini AI error breakdown modal
│   │   │   ├── SettingsModal.jsx   # Gemini & GitHub API key configuration
│   │   │   ├── ToastNotification.jsx# Toast notification stack
│   │   │   └── GithubIcon.jsx      # Crisp vector GitHub brand icon
│   │   ├── context/
│   │   │   └── AppContext.jsx      # Global context for tokens, toasts, greeting
│   │   ├── layouts/
│   │   │   └── DashboardLayout.jsx # Master layout wrapper
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx     # High-converting visual hero & features
│   │   │   ├── DashboardOverview.jsx# Metric cards & recent deployments table
│   │   │   ├── ProjectsPage.jsx    # Projects grid & env drawer
│   │   │   ├── NewProjectWizard.jsx# 4-step interactive deployment wizard
│   │   │   ├── DeploymentDetail.jsx# Live stage stepper & SSE terminal logs
│   │   │   ├── LogsPage.jsx        # Dedicated developer log explorer
│   │   │   └── DeploymentHistoryPage.jsx # Audit timeline & 1-click rollback
│   │   ├── services/
│   │   │   └── api.js              # Axios REST & SSE stream client
│   │   ├── App.jsx
│   │   ├── main.jsx
│   │   └── index.css               # Pink + Black design system & tokens
│   ├── index.html
│   ├── tailwind.config.js
│   └── vite.config.js
│
├── docker/
│   ├── Dockerfile                  # Multi-stage production build
│   └── docker-compose.yml          # App + PostgreSQL stack
├── dev-runner.js                   # Single-command full-stack development runner
├── package.json
└── README.md
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js v18+ (tested on Node v20 & v24)
- npm v9+

### 2. Quick Start (Development Mode)

From the project root:

```bash
# Install dependencies
npm run install-all

# Start both Backend (Port 5000) and Frontend (Port 5173) with one command:
npm run dev
```

Open your browser at **`http://localhost:5173`**.

---

## 🌐 API Reference

### Projects
- `GET /api/projects` — List all projects
- `GET /api/projects/:id` — Get project details with deployments & env vars
- `POST /api/projects` — Create new project and trigger initial deployment
- `PUT /api/projects/:id` — Update project build settings
- `DELETE /api/projects/:id` — Delete project
- `POST /api/projects/:id/deploy` — Trigger fresh deployment

### Deployments
- `GET /api/deployments` — List recent deployments with filters
- `GET /api/deployments/:id` — Get deployment details & stage status
- `GET /api/deployments/:id/logs` — Get full logs array
- `GET /api/deployments/:id/stream` — **Server-Sent Events (SSE)** live log & status stream
- `POST /api/deployments/:id/redeploy` — Redeploy specific revision
- `POST /api/deployments/:id/rollback` — Instant rollback to previous LIVE release

### AI Error Diagnosis
- `POST /api/ai/explain-error` — Send error logs & stack trace to Google Gemini AI for structured diagnosis.

### GitHub
- `GET /api/github/search?q=term` — Search public repositories or curated starter templates
- `GET /api/github/repo?url=owner/repo` — Inspect repository metadata and branches

---

## 🧠 Testing the AI Error Doctor

DeployHub comes pre-configured with a failed deployment demo (`#9 - Vortex Design System` or by triggering a deployment with simulated failure).

1. Go to **Dashboard** or **Deployments**.
2. Click on the failed deployment (`#9 - develop - e92bc41`).
3. Click the bright **`Explain Error with AI`** button.
4. Gemini will parse the missing `@radix-ui/react-tooltip` package error and provide:
   - What happened
   - Technical root cause
   - 1-click terminal command: `npm install @radix-ui/react-tooltip`
   - Direct button to **Redeploy Project**.

---

## 🐳 Docker Deployment

To run with Docker and PostgreSQL:

```bash
cd docker
docker-compose up --build
```

Access the application at `http://localhost:5000`.

---

## 📄 License
MIT © DeployHub Platform
