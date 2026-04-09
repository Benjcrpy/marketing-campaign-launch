from __future__ import annotations

import os
import sys
from pathlib import Path

import yaml
from rich.console import Console
from rich.prompt import Prompt


ROOT = Path("/work")
CONFIG_DIR = ROOT / "config"
OUTPUT_DIR = ROOT / "output"
ENV_PATH = ROOT / ".env"

console = Console()


def _ensure_dirs() -> None:
    CONFIG_DIR.mkdir(parents=True, exist_ok=True)
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def _write_yaml(path: Path, data: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(yaml.safe_dump(data, sort_keys=False), encoding="utf-8")


def _load_existing_yaml(path: Path) -> dict | None:
    if not path.exists():
        return None
    return yaml.safe_load(path.read_text(encoding="utf-8")) or {}


def _update_env_file(pairs: dict[str, str]) -> None:
    existing: dict[str, str] = {}
    if ENV_PATH.exists():
        for line in ENV_PATH.read_text(encoding="utf-8").splitlines():
            if not line or line.strip().startswith("#") or "=" not in line:
                continue
            k, v = line.split("=", 1)
            existing[k.strip()] = v.strip()

    existing.update({k: v for k, v in pairs.items() if v != ""})

    lines = []
    for k in sorted(existing.keys()):
        lines.append(f"{k}={existing[k]}")
    ENV_PATH.write_text("\n".join(lines) + "\n", encoding="utf-8")


def main() -> None:
    _ensure_dirs()

    console.print("[bold]Scenario 2 setup[/bold] (Marketing Campaign Launch)")
    console.print("This will write config files + a local .env for tokens.\n")

    user_profile_path = CONFIG_DIR / "user_profile.yaml"
    campaign_path = CONFIG_DIR / "campaign.yaml"

    user_profile_existing = _load_existing_yaml(user_profile_path) or {}
    campaign_existing = _load_existing_yaml(campaign_path) or {}

    your_name = Prompt.ask("Your name", default=user_profile_existing.get("name", ""))
    role = Prompt.ask("Your role/title", default=user_profile_existing.get("role", "Founder"))
    company = Prompt.ask("Company name", default=user_profile_existing.get("company", ""))
    website = Prompt.ask("Company website", default=user_profile_existing.get("website", ""))

    campaign_name = Prompt.ask("Campaign name", default=campaign_existing.get("campaign_name", "Launch Campaign"))
    product = Prompt.ask("Product/service", default=campaign_existing.get("product", ""))
    target_audience = Prompt.ask(
        "Target audience (1 sentence)",
        default=campaign_existing.get("target_audience", ""),
    )
    primary_goal = Prompt.ask(
        "Primary goal (e.g. signups, sales, leads)",
        default=campaign_existing.get("primary_goal", "Signups"),
    )
    channels = Prompt.ask(
        "Channels (comma-separated: X, Instagram, Reddit, Email, Blog)",
        default=",".join(campaign_existing.get("channels", ["X", "Instagram", "Reddit"])),
    )
    start_date = Prompt.ask("Start date (YYYY-MM-DD)", default=campaign_existing.get("start_date", ""))
    end_date = Prompt.ask("End date (YYYY-MM-DD)", default=campaign_existing.get("end_date", ""))
    brand_voice = Prompt.ask(
        "Brand voice (3-6 words)",
        default=campaign_existing.get("brand_voice", "clear, confident, helpful"),
    )
    offer = Prompt.ask(
        "Offer (what are we promoting?)",
        default=campaign_existing.get("offer", ""),
    )

    user_profile = {
        "name": your_name,
        "role": role,
        "company": company,
        "website": website,
    }

    campaign = {
        "campaign_name": campaign_name,
        "product": product,
        "target_audience": target_audience,
        "primary_goal": primary_goal,
        "channels": [c.strip() for c in channels.split(",") if c.strip()],
        "start_date": start_date,
        "end_date": end_date,
        "brand_voice": brand_voice,
        "offer": offer,
    }

    _write_yaml(user_profile_path, user_profile)
    _write_yaml(campaign_path, campaign)

    console.print("\n[bold]Credentials (optional now; you can add later)[/bold]")
    console.print("Press Enter to skip any field.\n")

    # When setup is run non-interactively (e.g. piping answers), hidden password prompts
    # can fail because stdin isn't a TTY. In that case, fall back to normal input.
    allow_hidden = sys.stdin.isatty()

    env_updates = {
        "OPENAI_API_KEY": Prompt.ask(
            "OPENAI_API_KEY", default=os.getenv("OPENAI_API_KEY", ""), password=allow_hidden
        ),
        "X_API_KEY": Prompt.ask("X_API_KEY", default="", password=allow_hidden),
        "X_API_SECRET": Prompt.ask("X_API_SECRET", default="", password=allow_hidden),
        "X_ACCESS_TOKEN": Prompt.ask("X_ACCESS_TOKEN", default="", password=allow_hidden),
        "X_ACCESS_TOKEN_SECRET": Prompt.ask("X_ACCESS_TOKEN_SECRET", default="", password=allow_hidden),
        "INSTAGRAM_ACCESS_TOKEN": Prompt.ask("INSTAGRAM_ACCESS_TOKEN", default="", password=allow_hidden),
        "REDDIT_CLIENT_ID": Prompt.ask("REDDIT_CLIENT_ID", default="", password=allow_hidden),
        "REDDIT_CLIENT_SECRET": Prompt.ask("REDDIT_CLIENT_SECRET", default="", password=allow_hidden),
        "REDDIT_REFRESH_TOKEN": Prompt.ask("REDDIT_REFRESH_TOKEN", default="", password=allow_hidden),
        "SMTP_HOST": Prompt.ask("SMTP_HOST", default=""),
        "SMTP_PORT": Prompt.ask("SMTP_PORT", default="587"),
        "SMTP_USER": Prompt.ask("SMTP_USER", default=""),
        "SMTP_PASS": Prompt.ask("SMTP_PASS", default="", password=allow_hidden),
    }
    _update_env_file(env_updates)

    console.print("\n[green]Done.[/green]")
    console.print(f"- Wrote {user_profile_path}")
    console.print(f"- Wrote {campaign_path}")
    console.print(f"- Updated {ENV_PATH}")
    console.print("\nNext: run [bold]docker compose up --build orchestrator[/bold]")


if __name__ == "__main__":
    main()

