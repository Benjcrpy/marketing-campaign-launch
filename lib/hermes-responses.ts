/**
 * Parse Hermes / OpenAI Responses API shape for assistant text.
 */
export function extractHermesResponseText(json: unknown): string {
  if (typeof json !== "object" || json === null) return "";
  const j = json as Record<string, unknown>;

  // Some gateways return a simple message string
  const msg = j.message;
  if (typeof msg === "string") return msg;

  const output = j.output;
  if (!Array.isArray(output)) return "";

  const parts: string[] = [];
  for (const item of output) {
    if (typeof item !== "object" || item === null) continue;
    const o = item as Record<string, unknown>;
    if (o.type === "message" && o.role === "assistant") {
      const content = o.content;
      if (Array.isArray(content)) {
        for (const c of content) {
          if (typeof c === "object" && c !== null) {
            const block = c as Record<string, unknown>;
            if (block.type === "output_text" && typeof block.text === "string") {
              parts.push(block.text);
            }
          }
        }
      }
    }
  }
  return parts.join("\n").trim();
}
