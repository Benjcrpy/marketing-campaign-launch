# Hermes cron (staggered heartbeats)

Hermes runs scheduled jobs via its **cron** system inside the gateway (see [Hermes cron docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)).

## Read this first

**[staggered-heartbeats.md](./staggered-heartbeats.md)** — full Scenario 2 schedule table, session keys, and example crontab **with unique minute offsets** so agents do not all wake at once (matches OpenClaw/CrewClaw guidance).

## Rules

1. **Stagger** — never fire every agent at `:00`. Use offsets like `:03`, `:08`, `:13`, …  
2. **Match session** — each job must target the correct Hermes conversation / session key (see `agents.md`).  
3. **Heartbeat message** — short system prompt, e.g. “Read `shared/tasks.json` and `shared/standup.md`; take one concrete next step or log a blocker.”

## Docker

```bash
docker compose exec hermes hermes --help
```

Persisted cron state typically lives under `hermes-data/cron/` once the gateway creates it.

## Suggested cadence (summary)

| Agent | Suggested cadence |
|-------|-------------------|
| Content Creator | every 15–30 min |
| Twitter Engager | every 15 min |
| Instagram Curator | every 30–60 min |
| Reddit Community Builder | 1–2× daily |
| Analytics Reporter | hourly + weekly rollup |

Details and non-colliding minute marks: **[staggered-heartbeats.md](./staggered-heartbeats.md)**.
