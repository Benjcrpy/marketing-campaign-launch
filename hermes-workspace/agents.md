# Scenario 2: Marketing Campaign Launch — Hermes workspace

Multi-agent layout follows the same principles as **[OpenClaw / OpenClaw-style setups](https://www.crewclaw.com/blog/openclaw-multi-agent-setup-guide)** (CrewClaw): **one gateway**, **many sessions**, **SOUL per agent**, **staggered crons**, **shared files + @mentions** for notifications.

## Configure session keys

Each agent has a **unique** session key. It is the Hermes `conversation` id: memory and history are **isolated** per key. **Never reuse** one key for two agents.

| Agent | Session key | SOUL |
|-------|-------------|------|
| Content Creator | `agent:scenario2-content-creator:main` | [agents/content-creator/SOUL.md](agents/content-creator/SOUL.md) |
| Twitter Engager | `agent:scenario2-twitter-engager:main` | [agents/twitter-engager/SOUL.md](agents/twitter-engager/SOUL.md) |
| Instagram Curator | `agent:scenario2-instagram-curator:main` | [agents/instagram-curator/SOUL.md](agents/instagram-curator/SOUL.md) |
| Reddit Community Builder | `agent:scenario2-reddit-community-builder:main` | [agents/reddit-community-builder/SOUL.md](agents/reddit-community-builder/SOUL.md) |
| Analytics Reporter | `agent:scenario2-analytics-reporter:main` | [agents/analytics-reporter/SOUL.md](agents/analytics-reporter/SOUL.md) |

Convention: `agent:<team>-<agent-id>:main` with team `scenario2`. The web app maps each chat to these keys via `lib/scenario2-agents.ts`.

## SOUL.md for each agent

Every agent directory under `hermes-workspace/agents/<id>/SOUL.md` defines **role**, **rules**, **heartbeat behavior**, **@mention teammates**, and **handoffs**. Keep each SOUL focused (roughly &lt; ~80 lines).

## Staggered heartbeat crons

Do **not** schedule every agent at `:00`. Use **offset minutes** so wakes are spread—see [cron/staggered-heartbeats.md](cron/staggered-heartbeats.md) and [cron/README.md](cron/README.md).

## Notification system

- **@mentions** in messages (handles below)  
- **`shared/tasks.json`** for queued / durable handoffs  
- **`shared/standup.md`** for daily human-readable digest  
- Optional **Telegram / Slack / webhook** after standup — [shared/NOTIFICATIONS.md](shared/NOTIFICATIONS.md)

## Teammates (@mentions)

Use these in prompts and in `tasks.json` payloads:

- `@ContentCreator` — copy, email sequences, landing copy  
- `@TwitterEngager` — X/Twitter threads and engagement  
- `@InstagramCurator` — feed, stories, reels concepts  
- `@RedditCommunityBuilder` — subreddit strategy, value-first posts  
- `@AnalyticsReporter` — KPIs, dashboards, measurement  

## Shared workspace

| Path | Purpose |
|------|---------|
| `shared/tasks.json` | Task queue / handoffs (all agents) |
| `shared/standup.md` | Daily summary |
| `shared/drafts/` | Optional long-form drafts (create when needed) |
| `shared/NOTIFICATIONS.md` | How routing + optional webhooks work |

Upstream agent markdown (agency-agents): https://github.com/msitarzewski/agency-agents
