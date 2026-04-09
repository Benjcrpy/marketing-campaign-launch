# Shared workspace

File-based handoffs between Scenario 2 agents (OpenClaw-style).

- **`tasks.json`** — append tasks with `owner` (agent id), `status`, `payload`.
- **`standup.md`** — human-readable daily summary.
- **`drafts/`** — optional folder for long-form copy (create when needed).

When you mention another agent (e.g. `@TwitterEngager`), add a row to `tasks.json` so the next heartbeat or chat picks it up.
