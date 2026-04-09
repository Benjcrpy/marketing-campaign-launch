"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";

type Agent = { id: string; name: string; file: string; sessionKey?: string; soulPath?: string };
type Msg = { role: "user" | "assistant"; content: string };

const card: React.CSSProperties = { background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 };

export default function ChatPage() {
  const [agents, setAgents] = useState<Agent[]>([]);
  const [missing, setMissing] = useState<string[]>([]);
  const [agentFile, setAgentFile] = useState<string>("marketing-content-creator.md");
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      const res = await fetch("/api/agents", { cache: "no-store" });
      const json = await res.json();
      setAgents(json.agents ?? []);
      setMissing(json.missing ?? []);
      if (json.agents?.[0]?.file) setAgentFile(json.agents[0].file);
    })();
  }, []);

  const selected = useMemo(() => agents.find((a) => a.file === agentFile), [agents, agentFile]);
  const selectedName = selected?.name ?? "Agent";

  async function send() {
    const text = input.trim();
    if (!text) return;
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

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, color: "#475569" }}>Agent chat</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26, color: "#0f172a" }}>{selectedName}</h1>
            {selected?.sessionKey ? (
              <div style={{ marginTop: 6, fontSize: 12, color: "#64748b", fontFamily: "ui-monospace, monospace" }}>
                Hermes session: {selected.sessionKey}
              </div>
            ) : null}
          </div>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/">Home</Link>
            <Link href="/setup">Setup</Link>
          </nav>
        </header>

        {missing.length ? (
          <div style={{ ...card, marginTop: 16, borderColor: "#fecaca", background: "#fff1f2" }}>
            <strong>Missing agent files:</strong> {missing.join(", ")}
          </div>
        ) : null}

        <section style={{ ...card, marginTop: 16 }}>
          <div style={{ display: "flex", gap: 10, alignItems: "center", flexWrap: "wrap" }}>
            <label style={{ fontSize: 13, color: "#334155" }}>Agent</label>
            <select
              value={agentFile}
              onChange={(e) => {
                setAgentFile(e.target.value);
                setMessages([]);
                setError(null);
              }}
              style={{ padding: "10px 12px", borderRadius: 10, border: "1px solid #e2e8f0" }}
            >
              {agents.map((a) => (
                <option key={a.id} value={a.file}>
                  {a.name}
                </option>
              ))}
            </select>
          </div>

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
      </div>
    </main>
  );
}

