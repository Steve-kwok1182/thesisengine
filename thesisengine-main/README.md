# ThesisEngine

> AI-powered investment memo generator for Hong Kong stocks — turn a ticker into a structured Bull / Bear thesis in seconds.

![Status](https://img.shields.io/badge/status-Sprint%201-yellow)
![Stack](https://img.shields.io/badge/stack-React%20%2B%20Vite%20%2B%20Vercel-blue)
![License](https://img.shields.io/badge/license-MIT-green)

---

## What it does

ThesisEngine takes a Hong Kong-listed stock, pulls cached financial data, and streams a structured investment memo — presenting both the **Bull case** and **Bear case** side by side so retail investors can see both sides of the argument before making a decision.

**Problem we're solving:** Retail investors in HK stocks either get one-sided analyst reports or generic news summaries. Nobody sees the bear case and bull case at the same time with equal weight.

**Sprint 1 scope:** 5 pre-cached HK tickers (Tencent 0700, Xiaomi 1810, Meituan 3690, Baidu 9888, JD.com 9618), streaming Bull/Bear memo generation via Claude API, deployed on Vercel.

---

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌──────────────┐
│  React + Vite   │ ───▶ │  Vercel /api/*   │ ───▶ │  Claude API  │
│  (frontend UI)  │      │ (serverless edge)│      │  (streaming) │
└─────────────────┘      └──────────────────┘      └──────────────┘
        │                         │
        │                         └─▶ Cached JSON data (5 HK stocks)
        │
        └─▶ Streaming memo rendered live in browser
```

- **Frontend:** React 18 + Vite 5 + Tailwind CSS
- **API layer:** Vercel Serverless Functions (proxies Claude API, handles CORS)
- **AI:** Claude API with streaming responses
- **Deployment:** Vercel (auto-deploy on push to `main`, PR previews enabled)
- **Data:** Static JSON for Sprint 1 (real-time data in Sprint 2)

---

## Team

**Team Expedition 33** — Session D/2, Group 33, ENT208TC Industry Readiness, XJTLU 2025-26
**Pathfinder:** Viren Vul

| Role                         | Member         | Focus                                             |
| ---------------------------- | -------------- | ------------------------------------------------- |
| Product Manager              | Xingyi Yao     | Roadmap, sprint planning, stakeholder comms       |
| Tech Lead                    | Jiapeng Xuan   | Architecture, PRD, technical documentation        |
| User Researcher              | Chunyu Wang    | User interviews, requirements, validation         |
| Backend Developer            | Mingxuan Guo   | Vercel API proxy, Claude integration              |
| Frontend Developer           | Qiqing Wu      | React + Vite scaffold, component library          |
| Frontend Developer           | Yuxuan Wang    | Streaming renderer, memo display                  |
| Frontend Developer           | Zhihao Yang    | Stock search component, revenue breakdown widget  |
| UI/UX Designer               | Yunfei Gao     | Visual spec, UI mockups                           |

---

## Getting started

### Prerequisites

- Node.js 18+ and npm
- Git
- A code editor (VS Code recommended)

### Local development

```bash
# Clone the repo
git clone https://github.com/thesisengine/thesis-engine.git
cd thesis-engine

# Install dependencies
npm install

# Run the dev server
npm run dev
```

The app will be available at `http://localhost:5173`.

### Environment variables

Create a `.env.local` file in the project root (never commit this file):

```
ANTHROPIC_API_KEY=your_key_here
```

The Claude API key is only used by the Vercel serverless function, never exposed to the browser.

---

## Project structure

```
thesis-engine/
├── api/                    # Vercel serverless functions
│   └── generate-memo.js    # Claude API proxy
├── src/
│   ├── components/         # React components
│   ├── data/               # Cached stock JSON
│   ├── hooks/              # Custom React hooks
│   ├── App.jsx
│   └── main.jsx
├── public/                 # Static assets
├── .env.local              # Local env vars (gitignored)
├── package.json
├── vite.config.js
└── README.md
```

---

## Contributing

We use a PR-based workflow. Even for solo changes, please open a PR — it gives us Vercel previews and a clean history.

### Workflow

1. Pull the latest `main`:
   ```bash
   git checkout main && git pull
   ```
2. Create a feature branch:
   ```bash
   git checkout -b feat/your-feature-name
   ```
3. Make your changes and commit:
   ```bash
   git add .
   git commit -m "feat: describe what you changed"
   ```
4. Push and open a PR:
   ```bash
   git push origin feat/your-feature-name
   ```
   Then open GitHub and click **Create pull request**.
5. Wait for the Vercel Preview URL to appear in the PR comments, verify your changes work, then merge.

### Branch naming

- `feat/xxx` — new features
- `fix/xxx` — bug fixes
- `docs/xxx` — documentation only
- `refactor/xxx` — code restructuring
- `chore/xxx` — tooling, deps, config

### Commit messages

Use [Conventional Commits](https://www.conventionalcommits.org/):

```
feat: add stock selector component
fix: handle empty memo response
docs: update setup instructions
chore: bump vite to 5.2
```

### Rules

- Never push directly to `main` — always go through a PR
- Keep PRs small (one feature per PR)
- Write a clear PR title and description
- Check the Vercel Preview URL before asking for review

---

## Sprint 1 roadmap

- [x] Repo + CI/CD infrastructure
- [x] Vercel serverless API proxy for Claude
- [ ] React + Vite scaffold
- [ ] Stock selector UI (5 tickers)
- [ ] Streaming Bull/Bear memo renderer
- [ ] End-to-end integration
- [ ] Deploy first working version to production

---

## License

MIT — see [LICENSE](./LICENSE) for details.

---

## Acknowledgements

Built as part of ENT208TC Industry Readiness at Xi'an Jiaotong-Liverpool University. Thanks to our course instructors for the Pathfinder framework and to Anthropic for the Claude API that powers the memo engine.

