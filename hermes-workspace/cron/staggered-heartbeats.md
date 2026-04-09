# Staggered heartbeat crons (Scenario 2)

Inspired by the [OpenClaw multi-agent setup pattern](https://www.crewclaw.com/blog/openclaw-multi-agent-setup-guide): **never wake every agent at the same minute**. Offset by 2–7 minutes so at most one or two agents “tick” together—reduces API rate spikes and memory churn.

These are **templates**. Register the real jobs in **Hermes** (`hermes-data/cron/` after the gateway creates them) or your host `crontab` calling the Hermes HTTP API with the right `conversation` / session key.

## Session keys (for API calls)

| Agent | Session key |
|-------|-------------|
| Content Creator | `agent:scenario2-content-creator:main` |
| Twitter Engager | `agent:scenario2-twitter-engager:main` |
| Instagram Curator | `agent:scenario2-instagram-curator:main` |
| Reddit Community Builder | `agent:scenario2-reddit-community-builder:main` |
| Analytics Reporter | `agent:scenario2-analytics-reporter:main` |

## Suggested stagger (unique minutes)

| Agent | Cadence | Example minute marks (each hour) | Notes |
|-------|---------|----------------------------------|--------|
| Content Creator | every 15 min | `:03`, `:18`, `:33`, `:48` | High churn; frequent check of `shared/tasks.json` |
| Twitter Engager | every 15 min | `:08`, `:23`, `:38`, `:53` | Offset +5 from Content Creator |
| Instagram Curator | every 30 min | `:13`, `:43` | Visual batching |
| Reddit Community Builder | 2× daily | `:18` past 10:00 and 16:00 local | Avoids peak API with short bursts |
| Analytics Reporter | hourly | `:28` | Heavy read; after other agents had time to write |

**Rule:** if you add more agents, assign **new minute slots** that do not collide with the table above.

## Illustrative crontab (host → Hermes API)

Replace `BASE` and `KEY` with your gateway base URL and API key; use POST body text like `heartbeat — read shared/tasks.json and shared/standup.md, one concrete next step`.

```cron
# Offsets: 03, 08, 13, 18, 23, 28, 33, 38, 43, 48, 53 — no two agents share a slot in the same 15m window.

# Content Creator — every 15 min at :03, :18, :33, :48
3,18,33,48 * * * * /path/to/hermes-heartbeat.sh content-creator

# Twitter Engager — every 15 min at :08, :23, :38, :53
8,23,38,53 * * * * /path/to/hermes-heartbeat.sh twitter-engager

# Instagram Curator — :13 and :43
13,43 * * * * /path/to/hermes-heartbeat.sh instagram-curator

# Reddit — 10:18 and 16:18 (example)
18 10,16 * * * /path/to/hermes-heartbeat.sh reddit-community-builder

# Analytics — minute :28 each hour
28 * * * * /path/to/hermes-heartbeat.sh analytics-reporter

# Optional: daily standup digest (pick one agent, e.g. Analytics, to summarize shared/)
0 9 * * * /path/to/hermes-standup.sh
```

Shell scripts are **not** vendored here—implement against your Hermes deployment (see `cron/README.md`).

## Daily standup

Prefer **one** scheduled message per day (e.g. 9:00) that asks the chosen agent to read `shared/tasks.json`, `shared/drafts/` if present, and append a short summary to `shared/standup.md` (see `shared/NOTIFICATIONS.md`).
