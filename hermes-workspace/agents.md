# Scenario 2: Marketing Campaign Launch — Hermes workspace

Session keys isolate memory per agent (Hermes `conversation` id).  
Upstream agent markdown (agency-agents): https://github.com/msitarzewski/agency-agents

| Agent | Session key | SOUL |
|-------|-------------|------|
| Content Creator | `agent:scenario2-content-creator:main` | [agents/content-creator/SOUL.md](agents/content-creator/SOUL.md) |
| Twitter Engager | `agent:scenario2-twitter-engager:main` | [agents/twitter-engager/SOUL.md](agents/twitter-engager/SOUL.md) |
| Instagram Curator | `agent:scenario2-instagram-curator:main` | [agents/instagram-curator/SOUL.md](agents/instagram-curator/SOUL.md) |
| Reddit Community Builder | `agent:scenario2-reddit-community-builder:main` | [agents/reddit-community-builder/SOUL.md](agents/reddit-community-builder/SOUL.md) |
| Analytics Reporter | `agent:scenario2-analytics-reporter:main` | [agents/analytics-reporter/SOUL.md](agents/analytics-reporter/SOUL.md) |

## Teammates (@mentions)

Use these handles in messages to route work (also update `shared/tasks.json`):

- `@ContentCreator` — copy, email sequences, landing copy
- `@TwitterEngager` — X/Twitter threads and engagement
- `@InstagramCurator` — feed, stories, reels concepts
- `@RedditCommunityBuilder` — subreddit strategy, value-first posts
- `@AnalyticsReporter` — KPIs, dashboards, measurement

## Shared workspace

- `shared/tasks.json` — task queue / handoffs
- `shared/standup.md` — optional daily summary
- `shared/drafts/` — drop campaign drafts here (create as needed)
