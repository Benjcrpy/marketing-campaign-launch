# Shared workspace

File-based handoffs between Scenario 2 agents (OpenClaw-style): **tasks**, **standup**, optional **drafts**.

| File / folder | Purpose |
|----------------|---------|
| **`tasks.json`** | Append tasks with `owner`, `status`, `payload` — durable across heartbeats |
| **`standup.md`** | Daily yesterday / today / blockers |
| **`drafts/`** | Optional long-form copy (create when needed) |

**Notification patterns** (@mentions, URGENT, optional Telegram): see **[NOTIFICATIONS.md](./NOTIFICATIONS.md)**.

When you mention another agent (e.g. `@TwitterEngager`), add or update a row in `tasks.json` so the next heartbeat or chat picks it up reliably.
