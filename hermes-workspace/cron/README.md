# Hermes cron (staggered heartbeats)

Hermes schedules jobs via its **cron** system inside the gateway (see [Hermes cron docs](https://hermes-agent.nousresearch.com/docs/user-guide/features/cron)).

## Pattern (match OpenClaw guide)

Avoid waking every agent at the same minute — offset by 2–5 minutes.

Example (run inside Hermes environment or via CLI):

```text
# Illustrative only — use `hermes cron` / gateway UI to register real jobs
# PM-style check every 30 min
# Content creator every 15 min at :05, :20, :35, :50
# Analytics every hour at :12
```

## Docker

Use the Hermes container:

```bash
docker compose exec hermes hermes --help
```

Register cron jobs that send a message to the API server or use built-in `hermes` cron storage under `/opt/data/cron/` (Hermes creates this when configured).

## Scenario 2 template

| Agent | Suggested cadence |
|-------|-------------------|
| Content Creator | every 15–30 min |
| Twitter Engager | every 15 min |
| Instagram Curator | every 30–60 min |
| Reddit Community Builder | 1–2x daily |
| Analytics Reporter | hourly + end-of-week |

This folder is documentation; your real cron definitions live in Hermes data (`hermes-data/cron/`) after you run `hermes` cron setup.
