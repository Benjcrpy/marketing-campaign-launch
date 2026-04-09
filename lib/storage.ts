import fs from "node:fs/promises";
import path from "node:path";

export const WORKDIR = process.env.WORKDIR ?? process.cwd();
export const CONFIG_DIR = path.join(WORKDIR, "config");
export const AGENTS_DIR = path.join(WORKDIR, "agents");
/** Hermes/OpenClaw-style workspace: SOUL.md per agent, shared/, crons (see README). */
export const HERMES_WORKSPACE_DIR =
  process.env.HERMES_WORKSPACE_DIR ?? path.join(WORKDIR, "hermes-workspace");

async function ensureDir(dir: string) {
  await fs.mkdir(dir, { recursive: true });
}

export async function readJson<T>(filePath: string, fallback: T): Promise<T> {
  try {
    const raw = await fs.readFile(filePath, "utf-8");
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export async function writeJson(filePath: string, data: unknown): Promise<void> {
  await ensureDir(path.dirname(filePath));
  await fs.writeFile(filePath, JSON.stringify(data, null, 2) + "\n", "utf-8");
}

export async function readText(filePath: string): Promise<string> {
  return fs.readFile(filePath, "utf-8");
}
