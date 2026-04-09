import path from "node:path";
import { NextResponse } from "next/server";

import { extractHermesResponseText } from "@/lib/hermes-responses";
import { AGENT_BY_FILE } from "@/lib/scenario2-agents";
import { CampaignSchema, CredentialsSchema, UserProfileSchema } from "@/lib/schema";
import { AGENTS_DIR, CONFIG_DIR, HERMES_WORKSPACE_DIR, readJson, readText } from "@/lib/storage";

type ChatReq = {
  agentFile: string;
  messages: Array<{ role: "user" | "assistant"; content: string }>;
};

function hermesConfig() {
  const baseUrl = process.env.HERMES_API_BASE_URL ?? "http://127.0.0.1:8642/v1";
  const apiKey = process.env.HERMES_API_KEY ?? "change-me-local-dev";
  return { baseUrl, apiKey };
}

function hermesFromCredentials(credentials: unknown) {
  const parsed = CredentialsSchema.safeParse(credentials);
  const baseUrl = parsed.success ? parsed.data.hermesBaseUrl : "";
  const apiKey = parsed.success ? parsed.data.hermesApiKey : "";
  return { baseUrl, apiKey };
}

function mustGetOpenRouterKey(credentials: unknown): string {
  const parsed = CredentialsSchema.safeParse(credentials);
  const fromConfig = parsed.success ? parsed.data.openrouterApiKey : "";
  const fromEnv = process.env.OPENROUTER_API_KEY ?? "";
  const key = fromEnv || fromConfig || "";
  if (!key) {
    throw new Error("Missing OPENROUTER_API_KEY (set env or fill it in Setup).");
  }
  return key;
}

async function loadSoulMd(agentFile: string): Promise<{ soul: string; sessionKey: string }> {
  const meta = AGENT_BY_FILE[agentFile];
  if (!meta) {
    return { soul: "", sessionKey: "" };
  }
  const soulPath = path.join(HERMES_WORKSPACE_DIR, "agents", meta.id, "SOUL.md");
  try {
    const soul = await readText(soulPath);
    return { soul, sessionKey: meta.sessionKey };
  } catch {
    return { soul: "", sessionKey: meta.sessionKey };
  }
}

async function loadSharedTasksSnippet(): Promise<string> {
  const p = path.join(HERMES_WORKSPACE_DIR, "shared", "tasks.json");
  try {
    const raw = await readText(p);
    return raw.length > 8000 ? raw.slice(0, 8000) + "\n…" : raw;
  } catch {
    return "{}";
  }
}

function useHermesResponsesApi(): boolean {
  return (process.env.HERMES_USE_RESPONSES_API ?? "true") !== "false";
}

export async function POST(req: Request) {
  const body = (await req.json()) as ChatReq;
  if (!body.agentFile) return NextResponse.json({ error: "agentFile required" }, { status: 400 });
  if (!body.messages?.length) return NextResponse.json({ error: "messages required" }, { status: 400 });

  const [userProfileRaw, campaignRaw, credentialsRaw] = await Promise.all([
    readJson(path.join(CONFIG_DIR, "user_profile.json"), null),
    readJson(path.join(CONFIG_DIR, "campaign.json"), null),
    readJson(path.join(CONFIG_DIR, "credentials.json"), null)
  ]);

  const userProfile = UserProfileSchema.parse(userProfileRaw);
  const campaign = CampaignSchema.parse(campaignRaw);
  const agentMd = await readText(path.join(AGENTS_DIR, body.agentFile));

  const { soul, sessionKey } = await loadSoulMd(body.agentFile);
  const sharedTasks = await loadSharedTasksSnippet();

  const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
  const lastUserText = lastUser?.content ?? "";

  const instructions = [
    soul ? "# SOUL.md (this agent)\n\n" + soul : "",
    "",
    "## User profile",
    JSON.stringify(userProfile, null, 2),
    "",
    "## Campaign",
    JSON.stringify(campaign, null, 2),
    "",
    "## Shared tasks.json (file handoffs / @mentions)",
    sharedTasks,
    "",
    "## Agency agent definition (agency-agents)",
    agentMd
  ]
    .filter(Boolean)
    .join("\n");

  const hermesEnv = hermesConfig();
  const hermesCreds = hermesFromCredentials(credentialsRaw);
  const hermes = {
    baseUrl: hermesEnv.baseUrl || hermesCreds.baseUrl || "http://127.0.0.1:8642/v1",
    apiKey: hermesEnv.apiKey || hermesCreds.apiKey || ""
  };
  const useHermes = Boolean(hermes.apiKey);

  if (useHermes && useHermesResponsesApi() && sessionKey) {
    const res = await fetch(`${hermes.baseUrl}/responses`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${hermes.apiKey}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: "hermes-agent",
        input: lastUserText,
        instructions,
        conversation: sessionKey,
        store: true
      })
    });

    if (res.ok) {
      const json = await res.json();
      const content = extractHermesResponseText(json);
      if (content) {
        return NextResponse.json({
          content,
          backend: "hermes",
          mode: "responses",
          sessionKey
        });
      }
    }
    // fall through to chat/completions if responses failed or empty
  }

  const system = [
    soul ? "# SOUL.md\n\n" + soul : "",
    "## User profile",
    JSON.stringify(userProfile, null, 2),
    "## Campaign",
    JSON.stringify(campaign, null, 2),
    "## Agent definition",
    agentMd
  ].join("\n\n");

  const res = useHermes
    ? await fetch(`${hermes.baseUrl}/chat/completions`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${hermes.apiKey}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify({
          model: "hermes-agent",
          stream: false,
          messages: [{ role: "system", content: system }, ...body.messages]
        })
      })
    : await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${mustGetOpenRouterKey(credentialsRaw)}`,
          "Content-Type": "application/json",
          ...(process.env.OPENROUTER_SITE_URL ? { "HTTP-Referer": process.env.OPENROUTER_SITE_URL } : {}),
          ...(process.env.OPENROUTER_APP_NAME ? { "X-Title": process.env.OPENROUTER_APP_NAME } : {})
        },
        body: JSON.stringify({
          model: process.env.OPENROUTER_MODEL ?? "arcee-ai/trinity-large-preview:free",
          temperature: 0.6,
          messages: [{ role: "system", content: system }, ...body.messages]
        })
      });

  if (!res.ok) {
    const errText = await res.text();
    return NextResponse.json({ error: errText }, { status: 502 });
  }
  const json = await res.json();
  const content = json.choices?.[0]?.message?.content ?? "";
  return NextResponse.json({
    content,
    backend: useHermes ? "hermes" : "openrouter",
    mode: "chat.completions",
    sessionKey: sessionKey || undefined
  });
}
