/**
 * Session keys (Hermes `conversation` id) follow OpenClaw-style isolation:
 * `agent:<team>-<agent-id>:main`. See `hermes-workspace/agents.md` and
 * https://www.crewclaw.com/blog/openclaw-multi-agent-setup-guide
 */
export const SCENARIO2_TEAM = "scenario2";

export function sessionKeyForAgent(agentId: string): string {
  return `agent:${SCENARIO2_TEAM}-${agentId}:main`;
}

export const AGENT_BY_FILE: Record<
  string,
  { id: string; sessionKey: string }
> = {
  "marketing-content-creator.md": {
    id: "content-creator",
    sessionKey: sessionKeyForAgent("content-creator")
  },
  "marketing-twitter-engager.md": {
    id: "twitter-engager",
    sessionKey: sessionKeyForAgent("twitter-engager")
  },
  "marketing-instagram-curator.md": {
    id: "instagram-curator",
    sessionKey: sessionKeyForAgent("instagram-curator")
  },
  "marketing-reddit-community-builder.md": {
    id: "reddit-community-builder",
    sessionKey: sessionKeyForAgent("reddit-community-builder")
  },
  "support-analytics-reporter.md": {
    id: "analytics-reporter",
    sessionKey: sessionKeyForAgent("analytics-reporter")
  }
};
