import Link from "next/link";

const card: React.CSSProperties = {
  border: "1px solid #e5e7eb",
  borderRadius: 12,
  padding: 16,
  background: "white"
};

export default function HomePage() {
  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, color: "#475569" }}>Scenario 2</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 28, color: "#0f172a" }}>Marketing Campaign Launch</h1>
          </div>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/setup">Setup</Link>
            <Link href="/chat">Agent chat</Link>
          </nav>
        </header>

        <section style={{ marginTop: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 12 }}>
          <div style={card}>
            <h2 style={{ margin: 0, fontSize: 16 }}>1) Setup wizard</h2>
            <p style={{ margin: "8px 0 0", color: "#334155", lineHeight: 1.5 }}>
              Answer a few questions about you, your company, and the campaign. Add account credentials (optional).
            </p>
            <div style={{ marginTop: 10 }}>
              <Link href="/setup">Open setup →</Link>
            </div>
          </div>
          <div style={card}>
            <h2 style={{ margin: 0, fontSize: 16 }}>2) Chat with the team</h2>
            <p style={{ margin: "8px 0 0", color: "#334155", lineHeight: 1.5 }}>
              Pick an agent from the Scenario 2 team and chat. The agent gets your config + the upstream agent definition.
            </p>
            <div style={{ marginTop: 10 }}>
              <Link href="/chat">Open chat →</Link>
            </div>
          </div>
        </section>

        <section style={{ marginTop: 16, ...card }}>
          <h2 style={{ margin: 0, fontSize: 16 }}>What this stores</h2>
          <ul style={{ margin: "8px 0 0", color: "#334155", lineHeight: 1.6 }}>
            <li>
              <code>config/user_profile.json</code> and <code>config/campaign.json</code>
            </li>
            <li>
              <code>config/credentials.json</code> (only if you enter anything)
            </li>
          </ul>
          <p style={{ margin: "10px 0 0", color: "#64748b" }}>
            Local-first: these files are written to your mounted folder so they persist across container restarts.
          </p>
        </section>
      </div>
    </main>
  );
}

