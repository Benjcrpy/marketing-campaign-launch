## Multi-agent Marketing Campaign Launch (Hermes-powered)

This is a **standalone, containerized, multi-agent** marketing campaign launcher derived from the upstream [`agency-agents`](https://github.com/msitarzewski/agency-agents) repository.

Runtime notes:

- **Hermes Agent** runs as the agent runtime (OpenAI-compatible API server).
- The web app provides a **setup wizard** + **agent chat UI** for the Scenario 2 team.

**Multi-agent workspace (OpenClaw-style):** each agent has `hermes-workspace/agents/<role>/SOUL.md`, unique **session keys**, **staggered heartbeat crons** (`hermes-workspace/cron/`), and a **notification** pattern (`shared/tasks.json`, @mentions, optional Telegram) — see [`hermes-workspace/agents.md`](hermes-workspace/agents.md).

### Quick start

1) Create `marketing-campaign-launch/.env` and add your OpenRouter key (used by Hermes for inference):

```bash
OPENROUTER_API_KEY=or-xxxxx
```

2) Start everything:

```bash
docker compose up -d --build
```

3) Open the site:

 - `http://localhost:3000/setup` (answer questions about you/company/campaign)
 - `http://localhost:3000/chat` (chat with any Scenario 2 agent)

### Local dev with npm (`npm run dev`)

Use this when you are editing the Next.js app locally but still want the chat API to talk to Hermes on `127.0.0.1:8642`.

1) Same `.env` as above (`OPENROUTER_API_KEY=...`). Docker must be running (Docker Desktop, etc.).

2) From the project root:

```bash
npm install
npm run dev
```

What `npm run dev` does:

- Runs `docker compose up -d hermes` so the Hermes container starts and listens on port **8642**.
- Waits until that port accepts connections, then starts **Next.js** on **http://localhost:3000** with **`next dev --turbo`** (Turbopack). Avoids webpack dev chunk corruption (`./331.js`). Fallback: `npm run dev:webpack` / `npm run dev:next:webpack`.

If you only want the web server without starting Hermes (for example, no Docker available), use:

```bash
npm run dev:next
```

If dev mode still misbehaves after `npm run clean`, run a production build locally (no HMR): **`npm run dev:stable`** (`next build` + `next start` on port 3000).

If the dev server shows weird module errors, stop it, run **`npm run clean`** (clears `.next` and `node_modules/.cache`), then start again. Make sure your `package.json` `dev` script includes **`--turbo`** — if you still see “Webpack” in the terminal banner, you are not on Turbopack.

Note: pressing **Ctrl+C** stops Next.js only; the Hermes container keeps running in the background. To stop it: `docker compose stop hermes`.

### What this stores (local-first)

- `config/user_profile.json`: you + company details
- `config/campaign.json`: campaign details (channels, goals, dates, etc.)
- `config/credentials.json`: optional auth info (social/email/etc) you enter in Setup
- `hermes-data/`: Hermes state (skills, memory, sessions, logs, sqlite stores)

### Security

- Treat `config/credentials.json` like a secret file.
- Prefer least-privilege / disposable tokens.

---

## Scenario 2: Marketing Campaign Launch team (from `agency-agents`)

Upstream scenario reference: see `### Scenario 2: Marketing Campaign Launch` in [`agency-agents/README.md`](https://github.com/msitarzewski/agency-agents#-real-world-use-cases).

**Your Team** (linked to upstream agent definitions):

1. 📝 **Content Creator** — `marketing/marketing-content-creator.md`  
   - https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-content-creator.md
2. 🐦 **Twitter Engager** — `marketing/marketing-twitter-engager.md`  
   - https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-twitter-engager.md
3. 📸 **Instagram Curator** — `marketing/marketing-instagram-curator.md`  
   - https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-instagram-curator.md
4. 🤝 **Reddit Community Builder** — `marketing/marketing-reddit-community-builder.md`  
   - https://github.com/msitarzewski/agency-agents/blob/main/marketing/marketing-reddit-community-builder.md
5. 📊 **Analytics Reporter** — `support/support-analytics-reporter.md`  
   - https://github.com/msitarzewski/agency-agents/blob/main/support/support-analytics-reporter.md

### Vendored files

For offline/standalone operation, this project vendors the same agent markdown files into `./agents/`.

