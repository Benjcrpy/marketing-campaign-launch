from __future__ import annotations

from pathlib import Path

import yaml
from rich.console import Console


ROOT = Path("/work")
CONFIG_DIR = ROOT / "config"
AGENTS_DIR = ROOT / "agents"
OUTPUT_DIR = ROOT / "output"

console = Console()


AGENTS = [
    ("Content Creator", "marketing-content-creator.md"),
    ("Twitter Engager", "marketing-twitter-engager.md"),
    ("Instagram Curator", "marketing-instagram-curator.md"),
    ("Reddit Community Builder", "marketing-reddit-community-builder.md"),
    ("Analytics Reporter", "support-analytics-reporter.md"),
]


def _load_yaml(path: Path) -> dict:
    if not path.exists():
        raise SystemExit(f"Missing required config file: {path}. Run: docker compose run --rm setup")
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def _read_agent_md(filename: str) -> str:
    p = AGENTS_DIR / filename
    if not p.exists():
        raise SystemExit(f"Missing agent file: {p}. (Did you copy agents into ./agents ?)")
    return p.read_text(encoding="utf-8")


def _agent_prompt(role: str, agent_md: str, user_profile: dict, campaign: dict) -> str:
    context = yaml.safe_dump({"user_profile": user_profile, "campaign": campaign}, sort_keys=False).strip()
    return (
        f"## {role}\n\n"
        f"### Context\n\n"
        f"```yaml\n{context}\n```\n\n"
        f"### Agent definition (from agency-agents)\n\n"
        f"```markdown\n{agent_md.strip()}\n```\n\n"
        f"### Task\n\n"
        f"Using the context above, produce your first-day deliverables for the campaign.\n"
        f"- Be specific and platform-native.\n"
        f"- Propose a 7-day plan.\n"
        f"- List questions/blockers last.\n"
    )


def main() -> None:
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    user_profile = _load_yaml(CONFIG_DIR / "user_profile.yaml")
    campaign = _load_yaml(CONFIG_DIR / "campaign.yaml")

    console.print("[bold]Scenario 2 orchestrator[/bold]")
    console.print("Generating ready-to-use prompts for the Scenario 2 team.\n")

    out = []
    out.append("# Scenario 2: Marketing Campaign Launch — Agent Prompts\n")
    out.append(
        "This file is generated from your `config/*.yaml` plus the agent definitions vendored from `agency-agents`.\n"
    )

    for role, md in AGENTS:
        out.append(_agent_prompt(role, _read_agent_md(md), user_profile, campaign))

    output_path = OUTPUT_DIR / "agent_prompts.md"
    output_path.write_text("\n\n---\n\n".join(out) + "\n", encoding="utf-8")

    console.print("[green]Ready.[/green]")
    console.print(f"- Wrote {output_path}")
    console.print("\nNext: open `output/agent_prompts.md` and paste each section into your agent runner.")


if __name__ == "__main__":
    main()

