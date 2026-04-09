import path from "node:path";
import { NextResponse } from "next/server";

import { AGENT_BY_FILE } from "@/lib/scenario2-agents";
import { AGENTS_DIR, HERMES_WORKSPACE_DIR } from "@/lib/storage";

const AGENTS = [
  { id: "content-creator", name: "Content Creator", file: "marketing-content-creator.md" },
  { id: "twitter-engager", name: "Twitter Engager", file: "marketing-twitter-engager.md" },
  { id: "instagram-curator", name: "Instagram Curator", file: "marketing-instagram-curator.md" },
  { id: "reddit-community-builder", name: "Reddit Community Builder", file: "marketing-reddit-community-builder.md" },
  { id: "analytics-reporter", name: "Analytics Reporter", file: "support-analytics-reporter.md" }
];

export async function GET() {
  // Only return the catalog (don’t send the whole agent markdown to the browser by default)
  // The chat endpoint will load the actual file server-side.
  const missing: string[] = [];
  const agents = AGENTS.map((a) => {
    const meta = AGENT_BY_FILE[a.file];
    const soulRelative = meta
      ? path.join("hermes-workspace", "agents", meta.id, "SOUL.md")
      : "";
    return {
      ...a,
      sessionKey: meta?.sessionKey ?? "",
      soulPath: soulRelative
    };
  });

  for (const a of agents) {
    // eslint-disable-next-line no-await-in-loop
    const exists = await import("node:fs/promises").then((fs) =>
      fs
        .access(path.join(AGENTS_DIR, a.file))
        .then(() => true)
        .catch(() => false)
    );
    if (!exists) missing.push(a.file);
  }

  return NextResponse.json({
    agents,
    agentsDir: AGENTS_DIR,
    hermesWorkspaceDir: HERMES_WORKSPACE_DIR,
    missing
  });
}

