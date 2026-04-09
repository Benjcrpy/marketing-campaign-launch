# Notification system (inter-agent)

Same ideas as the [OpenClaw multi-agent guide](https://www.crewclaw.com/blog/openclaw-multi-agent-setup-guide): isolated **sessions**, explicit **handoffs**, and three practical patterns—**@mentions**, **shared files**, and (optionally) **webhooks**.

## 1. @mentions (gateway / chat)

When an agent (or you in `/chat`) finishes a slice of work and needs another role:

- Put the handle in the message body, e.g. `@TwitterEngager`, `@ContentCreator`.
- Hermes routes follow your gateway rules; this app injects `shared/tasks.json` into instructions so agents see queued work.

Handles for Scenario 2:

| Handle | Role |
|--------|------|
| `@ContentCreator` | Copy, sequences, landing drafts |
| `@TwitterEngager` | X/Twitter |
| `@InstagramCurator` | Instagram |
| `@RedditCommunityBuilder` | Reddit |
| `@AnalyticsReporter` | KPIs, measurement |

## 2. File-based queue — `tasks.json`

Structured handoffs survive across heartbeats. On each wake, agents should skim `tasks.json` for rows where they are `owner` or mentioned in `payload`.

**Example shape** (add real tasks as needed):

```json
{
  "version": 1,
  "updated": "2026-04-09T12:00:00Z",
  "tasks": [
    {
      "id": "task-001",
      "title": "Draft launch thread from brief",
      "owner": "twitter-engager",
      "status": "pending",
      "from": "content-creator",
      "payload": "Brief in shared/drafts/launch-brief.md — @TwitterEngager please thread this."
    }
  ]
}
```

Statuses: `pending`, `in_progress`, `done`, `blocked`.

## 3. Human-readable digest — `standup.md`

Any agent (or a single daily cron) can append to `shared/standup.md`:

- What shipped yesterday  
- In progress  
- Blocked  

Optional: pipe the file to **Telegram**, **Slack**, or email from a small script **outside** Hermes (keep tokens in env, never commit).

**Example (Telegram)** — run from cron after standup is written:

```bash
# TELEGRAM_BOT_TOKEN and TELEGRAM_CHAT_ID in environment
curl -s -X POST "https://api.telegram.org/bot${TELEGRAM_BOT_TOKEN}/sendMessage" \
  -d chat_id="${TELEGRAM_CHAT_ID}" \
  --data-urlencode text="$(cat hermes-workspace/shared/standup.md)"
```

## 4. Urgent handoffs

If something cannot wait for the next heartbeat:

- Mark the task title or payload with `URGENT`, and  
- Send a direct chat via this app’s `/chat` to that agent’s session so the gateway processes immediately.

## Related

- [agents.md](../agents.md) — session keys + roster  
- [../cron/staggered-heartbeats.md](../cron/staggered-heartbeats.md) — cron offsets  
