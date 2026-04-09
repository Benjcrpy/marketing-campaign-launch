/* eslint-disable @next/next/no-html-link-for-pages */
"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";

type Config = {
  userProfile: {
    name: string;
    role: string;
    company: string;
    website: string;
  };
  campaign: {
    campaignName: string;
    productOrService: string;
    targetAudience: string;
    primaryGoal: string;
    channels: string[];
    startDate?: string;
    endDate?: string;
    brandVoice: string;
    offer?: string;
  };
  credentials: {
    openrouterApiKey?: string;
    x?: { apiKey?: string; apiSecret?: string; accessToken?: string; accessTokenSecret?: string };
    instagram?: { accessToken?: string };
    reddit?: { clientId?: string; clientSecret?: string; refreshToken?: string };
    smtp?: { host?: string; port?: string; user?: string; pass?: string };
  };
};

const inputStyle: React.CSSProperties = {
  width: "100%",
  padding: "10px 12px",
  borderRadius: 10,
  border: "1px solid #e2e8f0",
  background: "white"
};

const labelStyle: React.CSSProperties = { fontSize: 13, color: "#334155", marginBottom: 6 };

export default function SetupPage() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [showAdvancedCreds, setShowAdvancedCreds] = useState(true);

  const [config, setConfig] = useState<Config>({
    userProfile: { name: "", role: "Founder", company: "", website: "" },
    campaign: {
      campaignName: "Launch Campaign",
      productOrService: "",
      targetAudience: "",
      primaryGoal: "Signups",
      channels: ["X", "Instagram", "Reddit", "Email"],
      startDate: "",
      endDate: "",
      brandVoice: "clear, confident, helpful",
      offer: ""
    },
    credentials: { openrouterApiKey: "", x: {}, instagram: {}, reddit: {}, smtp: { port: "587" } }
  });

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch("/api/config", { cache: "no-store" });
        const json = await res.json();
        if (json.userProfile) setConfig((c) => ({ ...c, userProfile: json.userProfile }));
        if (json.campaign) setConfig((c) => ({ ...c, campaign: json.campaign }));
        if (json.credentials) setConfig((c) => ({ ...c, credentials: json.credentials }));
      } catch (e) {
        setError(String(e));
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const channelsCsv = useMemo(() => config.campaign.channels.join(", "), [config.campaign.channels]);

  async function save() {
    setSaving(true);
    setError(null);
    setOk(null);
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(config)
      });
      if (!res.ok) {
        const maybeJson = await res
          .json()
          .catch(async () => ({ error: await res.text().catch(() => "Save failed") }));
        const msg =
          typeof maybeJson?.error === "string"
            ? maybeJson.error
            : "Save failed";
        const issues = Array.isArray(maybeJson?.issues)
          ? maybeJson.issues
              .map((i: any) => `${i.scope ?? "config"}:${(i.path ?? []).join(".")} ${i.message ?? ""}`.trim())
              .join("\n")
          : "";
        throw new Error(issues ? `${msg}\n${issues}` : msg);
      }
      setOk("Saved. You can now open Agent chat.");
    } catch (e) {
      setError(String(e));
    } finally {
      setSaving(false);
    }
  }

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc" }}>
      <div style={{ maxWidth: 960, margin: "0 auto", padding: 24 }}>
        <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 16 }}>
          <div>
            <div style={{ fontSize: 14, color: "#475569" }}>Setup wizard</div>
            <h1 style={{ margin: "6px 0 0", fontSize: 26, color: "#0f172a" }}>Campaign + credentials</h1>
          </div>
          <nav style={{ display: "flex", gap: 12 }}>
            <Link href="/">Home</Link>
            <Link href="/chat">Agent chat</Link>
          </nav>
        </header>

        {loading ? (
          <p style={{ color: "#334155" }}>Loading…</p>
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14, marginTop: 16 }}>
            <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>You + company</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
                <div>
                  <div style={labelStyle}>Your name</div>
                  <input
                    style={inputStyle}
                    value={config.userProfile.name}
                    onChange={(e) => setConfig((c) => ({ ...c, userProfile: { ...c.userProfile, name: e.target.value } }))}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Role/title</div>
                  <input
                    style={inputStyle}
                    value={config.userProfile.role}
                    onChange={(e) => setConfig((c) => ({ ...c, userProfile: { ...c.userProfile, role: e.target.value } }))}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Company</div>
                  <input
                    style={inputStyle}
                    value={config.userProfile.company}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, userProfile: { ...c.userProfile, company: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>Website</div>
                  <input
                    style={inputStyle}
                    placeholder="https://… (optional)"
                    value={config.userProfile.website}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, userProfile: { ...c.userProfile, website: e.target.value } }))
                    }
                  />
                </div>
              </div>
            </section>

            <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>Campaign</h2>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
                <div>
                  <div style={labelStyle}>Campaign name</div>
                  <input
                    style={inputStyle}
                    value={config.campaign.campaignName}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, campaign: { ...c.campaign, campaignName: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>Product/service</div>
                  <input
                    style={inputStyle}
                    value={config.campaign.productOrService}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, campaign: { ...c.campaign, productOrService: e.target.value } }))
                    }
                  />
                </div>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={labelStyle}>Target audience</div>
                  <input
                    style={inputStyle}
                    value={config.campaign.targetAudience}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, campaign: { ...c.campaign, targetAudience: e.target.value } }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>Primary goal</div>
                  <input
                    style={inputStyle}
                    value={config.campaign.primaryGoal}
                    onChange={(e) => setConfig((c) => ({ ...c, campaign: { ...c.campaign, primaryGoal: e.target.value } }))}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Channels (comma-separated)</div>
                  <input
                    style={inputStyle}
                    value={channelsCsv}
                    onChange={(e) =>
                      setConfig((c) => ({
                        ...c,
                        campaign: {
                          ...c.campaign,
                          channels: e.target.value
                            .split(",")
                            .map((s) => s.trim())
                            .filter(Boolean)
                        }
                      }))
                    }
                  />
                </div>
                <div>
                  <div style={labelStyle}>Start date</div>
                  <input
                    style={inputStyle}
                    placeholder="YYYY-MM-DD"
                    value={config.campaign.startDate ?? ""}
                    onChange={(e) => setConfig((c) => ({ ...c, campaign: { ...c.campaign, startDate: e.target.value } }))}
                  />
                </div>
                <div>
                  <div style={labelStyle}>End date</div>
                  <input
                    style={inputStyle}
                    placeholder="YYYY-MM-DD"
                    value={config.campaign.endDate ?? ""}
                    onChange={(e) => setConfig((c) => ({ ...c, campaign: { ...c.campaign, endDate: e.target.value } }))}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Brand voice</div>
                  <input
                    style={inputStyle}
                    value={config.campaign.brandVoice}
                    onChange={(e) => setConfig((c) => ({ ...c, campaign: { ...c.campaign, brandVoice: e.target.value } }))}
                  />
                </div>
                <div>
                  <div style={labelStyle}>Offer</div>
                  <input
                    style={inputStyle}
                    value={config.campaign.offer ?? ""}
                    onChange={(e) => setConfig((c) => ({ ...c, campaign: { ...c.campaign, offer: e.target.value } }))}
                  />
                </div>
              </div>
            </section>

            <section style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 12, padding: 16 }}>
              <h2 style={{ margin: 0, fontSize: 16 }}>Credentials (optional)</h2>
              <p style={{ margin: "8px 0 0", color: "#64748b" }}>
                Stored locally in <code>config/credentials.json</code>. If you run in production, we should move these to secrets.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 12, marginTop: 12 }}>
                <div style={{ gridColumn: "1 / -1" }}>
                  <div style={labelStyle}>OpenRouter API key (required for chat)</div>
                  <input
                    style={inputStyle}
                    placeholder="or-…"
                    value={config.credentials.openrouterApiKey ?? ""}
                    onChange={(e) =>
                      setConfig((c) => ({ ...c, credentials: { ...c.credentials, openrouterApiKey: e.target.value } }))
                    }
                  />
                </div>
              </div>

              <div style={{ marginTop: 12 }}>
                <button
                  type="button"
                  onClick={() => setShowAdvancedCreds((v) => !v)}
                  style={{
                    padding: "10px 12px",
                    borderRadius: 10,
                    border: "1px solid #e2e8f0",
                    background: showAdvancedCreds ? "#0f172a" : "white",
                    color: showAdvancedCreds ? "white" : "#0f172a",
                    cursor: "pointer"
                  }}
                >
                  {showAdvancedCreds ? "Hide" : "Show"} social + email credentials
                </button>

                {showAdvancedCreds ? (
                  <div
                    style={{
                      marginTop: 12,
                      display: "grid",
                      gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))",
                      gap: 12,
                      padding: 12,
                      borderRadius: 12,
                      border: "1px dashed #cbd5e1",
                      background: "#f8fafc"
                    }}
                  >
                  <div style={{ gridColumn: "1 / -1", color: "#64748b", fontSize: 13, lineHeight: 1.4 }}>
                    These are stored locally and are not required to chat. They’re used when you later enable posting/sending tools.
                  </div>

                  <div style={{ gridColumn: "1 / -1" }}>
                    <strong>X (Twitter)</strong>
                  </div>
                  <div>
                    <div style={labelStyle}>X API key</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.x?.apiKey ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: { ...c.credentials, x: { ...(c.credentials.x ?? {}), apiKey: e.target.value } }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>X API secret</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.x?.apiSecret ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: { ...c.credentials, x: { ...(c.credentials.x ?? {}), apiSecret: e.target.value } }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>X access token</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.x?.accessToken ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: {
                            ...c.credentials,
                            x: { ...(c.credentials.x ?? {}), accessToken: e.target.value }
                          }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>X access token secret</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.x?.accessTokenSecret ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: {
                            ...c.credentials,
                            x: { ...(c.credentials.x ?? {}), accessTokenSecret: e.target.value }
                          }
                        }))
                      }
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                    <strong>Instagram</strong>
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={labelStyle}>Instagram access token</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.instagram?.accessToken ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: {
                            ...c.credentials,
                            instagram: { ...(c.credentials.instagram ?? {}), accessToken: e.target.value }
                          }
                        }))
                      }
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                    <strong>Reddit</strong>
                  </div>
                  <div>
                    <div style={labelStyle}>Reddit client ID</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.reddit?.clientId ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: {
                            ...c.credentials,
                            reddit: { ...(c.credentials.reddit ?? {}), clientId: e.target.value }
                          }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>Reddit client secret</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.reddit?.clientSecret ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: {
                            ...c.credentials,
                            reddit: { ...(c.credentials.reddit ?? {}), clientSecret: e.target.value }
                          }
                        }))
                      }
                    />
                  </div>
                  <div style={{ gridColumn: "1 / -1" }}>
                    <div style={labelStyle}>Reddit refresh token</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.reddit?.refreshToken ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: {
                            ...c.credentials,
                            reddit: { ...(c.credentials.reddit ?? {}), refreshToken: e.target.value }
                          }
                        }))
                      }
                    />
                  </div>

                  <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
                    <strong>Email (SMTP)</strong>
                  </div>
                  <div>
                    <div style={labelStyle}>SMTP host</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.smtp?.host ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: { ...c.credentials, smtp: { ...(c.credentials.smtp ?? {}), host: e.target.value } }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>SMTP port</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.smtp?.port ?? "587"}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: { ...c.credentials, smtp: { ...(c.credentials.smtp ?? {}), port: e.target.value } }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>SMTP user</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.smtp?.user ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: { ...c.credentials, smtp: { ...(c.credentials.smtp ?? {}), user: e.target.value } }
                        }))
                      }
                    />
                  </div>
                  <div>
                    <div style={labelStyle}>SMTP password</div>
                    <input
                      style={inputStyle}
                      value={config.credentials.smtp?.pass ?? ""}
                      onChange={(e) =>
                        setConfig((c) => ({
                          ...c,
                          credentials: { ...c.credentials, smtp: { ...(c.credentials.smtp ?? {}), pass: e.target.value } }
                        }))
                      }
                    />
                  </div>
                  </div>
                ) : null}
              </div>
            </section>

            <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
              <button
                onClick={save}
                disabled={saving}
                style={{
                  padding: "10px 14px",
                  borderRadius: 10,
                  border: "1px solid #0f172a",
                  background: saving ? "#334155" : "#0f172a",
                  color: "white",
                  cursor: saving ? "not-allowed" : "pointer"
                }}
              >
                {saving ? "Saving…" : "Save setup"}
              </button>
              {ok ? <span style={{ color: "#16a34a" }}>{ok}</span> : null}
              {error ? <span style={{ color: "#dc2626" }}>{error}</span> : null}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}

