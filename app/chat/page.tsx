"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Agent = { id: string; name: string; file: string; sessionKey?: string; soulPath?: string };
type Msg = { role: "user" | "assistant"; content: string };

/** Use longhand border* only — mixing `border` shorthand with `borderColor` breaks React style reconciliation on hover. */
const card: React.CSSProperties = {
  background: "white",
  borderWidth: "1px",
  borderStyle: "solid",
  borderColor: "#e5e7eb",
  borderRadius: 12,
  padding: 16
};

const cardIdle: React.CSSProperties = {
  ...card,
  textAlign: "left",
  cursor: "pointer",
  transition: "border-color 0.15s, box-shadow 0.15s",
  borderColor: "#e2e8f0",
  boxShadow: "0 1px 2px rgba(15, 23, 42, 0.04)"
};

const cardHover: React.CSSProperties = {
  ...cardIdle,
  borderColor: "#94a3b8",
  boxShadow: "0 4px 14px rgba(15, 23, 42, 0.08)"
};

/** Short blurbs for the agent picker (skills / roles). */
const AGENT_TAGLINES: Record<string, string> = {
  "marketing-content-creator.md": "Campaign copy, threads, and launch content.",
  "marketing-twitter-engager.md": "X/Twitter replies, engagement, and tone.",
  "marketing-instagram-curator.md": "Carousels, captions, and visual story beats.",
  "marketing-reddit-community-builder.md": "Subreddit tone, posts, and community voice.",
  "support-analytics-reporter.md": "Metrics summaries and reporting angles."
};

const AGENT_ICONS: Record<string, string> = {
  "marketing-content-creator.md": "📝",
  "marketing-twitter-engager.md": "🐦",
  "marketing-instagram-curator.md": "📸",
  "marketing-reddit-community-builder.md": "🤝",
  "support-analytics-reporter.md": "📊"
};

export default function ChatPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  /** `null` = user must pick an agent (skill) before chat. */
  const [agentFile, setAgentFile] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hoverAgentId, setHoverAgentId] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = await res.json();
      setAgents(json.agents ?? []);
      setMissing(json.missing ?? []);
    })();
  }, []);

  /** Deep link + refresh: /chat?agent=marketing-content-creator.md */
  useEffect(() => {
    if (typeof window === "undefined" || agents.length === 0) return;
    const raw = new URLSearchParams(window.location.search).get("agent");
    if (!raw) return;
    const decoded = decodeURIComponent(raw);
    if (agents.some((x) => x.file === decoded)) {
      setAgentFile(decoded);
      setMessages([]);
      setError(null);
    }
  }, [agents]);

  const selected = useMemo(() => (agentFile ? agents.find((a) => a.file === agentFile) : undefined), [agents, agentFile]);
  const selectedName = selected?.name ?? "Agent";
  const pickerMode = agentFile === null;

  function pickAgent(file: string) {
    setAgentFile(file);
    setMessages([]);
    setError(null);
    setInput("");
    if (typeof window !== "undefined") {
      const u = new URL(window.location.href);
      u.searchParams.set("agent", file);
      window.history.replaceState({}, "", `${u.pathname}?${u.searchParams.toString()}`);
    }
  }

  function backToPicker() {
    setAgentFile(null);
    setMessages([]);
    setError(null);
    setInput("");
    if (typeof window !== "undefined") {
      window.history.replaceState({}, "", "/chat");
    }
  }

  async function send() {
    const text = input.trim();
    if (!text || !agentFile) return;
    setError(null);
    setSending(true);
    setInput("");

    const nextMessages: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(nextMessages);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ agentFile, messages: nextMessages })
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Chat failed");
      setMessages((m) => [...m, { role: "assistant", content: json.content ?? "" }]);
    } catch (e) {
      setError(String(e));
    } finally {
      setSending(false);
    }
  }

  const navLinks = (
    <nav style={{ display: "flex", gap: 12, alignItems: "center" }}>
      <Link href="/">Home</Link>
      <Link href="/setup">Setup</Link>
    </nav>
  );

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: pickerMode ? 1040 : 960, margin: "0 auto", padding: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, color: "#475569" }}>{pickerMode ? "Campaign team" : "Agent chat"}</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26, color: "#0f172a" }}>
              {pickerMode ? "Choose a Role to start" : selectedName}
            </h1>
            {!pickerMode && selected?.sessionKey ? (
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", fontFamily: "ui-monospace, monospace" }}>
                Hermes session: {selected.sessionKey}
              </div>
            ) : null}
            {pickerMode ? (
              <p style={{ margin: "10px 0 0", fontSize: 15, color: "#64748b", maxWidth: 520, lineHeight: 1.5 }}>
                Select a role to start the chat with the agent.
              </p>
            ) : null}
          </div>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {!pickerMode ? (
              <button
                type="button"
                onClick={backToPicker}
                style={{
                  padding: "8px 14px",
                  borderRadius: 10,
                  border: "1px solid #cbd5e1",
                  background: "white",
                  color: "#334155",
                  cursor: "pointer",
                  fontSize: 14
                }}
              >
                ← Change agent
              </button>
            ) : null}
            {navLinks}
          </div>
        </header>

        {missing.length ? (
          <div style={{ ...card, marginTop: 16, borderColor: "#fecaca", background: "#fff1f2" }}>
            <strong>Missing agent files:</strong> {missing.join(", ")}
          </div>
        ) : null}

        {pickerMode ? (
          <section style={{ marginTop: 24 }}>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fill, minmax(260px, 1fr))",
                gap: 16
              }}
            >
              {agents.map((a) => (
                <button
                  key={a.id}
                  type="button"
                  onClick={() => pickAgent(a.file)}
                  onMouseEnter={() => setHoverAgentId(a.id)}
                  onMouseLeave={() => setHoverAgentId(null)}
                  style={hoverAgentId === a.id ? cardHover : cardIdle}
                >
                  <div style={{ fontSize: 28, marginBottom: 8 }}>{AGENT_ICONS[a.file] ?? "✨"}</div>
                  <div style={{ fontWeight: 600, fontSize: 17, color: "#0f172a", marginBottom: 6 }}>{a.name}</div>
                  <div style={{ fontSize: 14, color: "#64748b", lineHeight: 1.45 }}>
                    {AGENT_TAGLINES[a.file] ?? "Chat with this agent."}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 13, fontWeight: 600, color: "#2563eb" }}>Start chat →</div>
                </button>
              ))}
            </div>
            {agents.length === 0 && !missing.length ? (
              <div style={{ ...card, color: "#64748b" }}>Loading agents…</div>
            ) : null}
          </section>
        ) : (
          <section style={{ ...card, marginTop: 16 }}>
            <div style={{ marginTop: 12, height: 420, overflow: "auto", border: "1px solid #e2e8f0", borderRadius: 12, padding: 12, background: "#0b1220" }}>
              {messages.length === 0 ? (
                <div style={{ color: "#94a3b8" }}>
                  Tip: use @ContentCreator, @TwitterEngager, etc. in prompts for handoffs; ask for a 7-day plan, launch
                  thread, IG carousel outline, Reddit drafts, etc.
                </div>
              ) : null}
              {messages.map((m, idx) => (
                <div key={idx} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 12, color: m.role === "user" ? "#38bdf8" : "#a78bfa" }}>
                    {m.role === "user" ? "You" : selectedName}
                  </div>
                  <div style={{ whiteSpace: "pre-wrap", color: "#e2e8f0", lineHeight: 1.5 }}>{m.content}</div>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", gap: 10, marginTop: 12 }}>
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    if (!sending) void send();
                  }
                }}
                placeholder="Type a message…"
                style={{ flex: 1, padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0" }}
              />
              <button
                onClick={send}
                disabled={sending}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #0f172a",
                  background: sending ? "#334155" : "#0f172a",
                  color: "white",
                  cursor: sending ? "not-allowed" : "pointer"
                }}
              >
                {sending ? "Sending…" : "Send"}
              </button>
            </div>
            {error ? <div style={{ marginTop: 10, color: "#dc2626" }}>{error}</div> : null}
          </section>
        )}
      </div>
    </main>
  );
}

