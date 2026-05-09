"""
IPL Auction Strategy Decoder — Data Pipeline
=============================================
Entry point to run all data processing scripts and generate
static JSON files consumed by the React frontend.

Usage:
    python run_pipeline.py

Output JSON files are written to ../frontend/public/data/
"""

import os
import json
import pathlib

OUTPUT_DIR = pathlib.Path(__file__).parent.parent / "frontend" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)


def run_all():
    print("📦 IPL Auction Strategy Decoder — Running pipeline...")

    # ── Add calls to individual scripts here ──────────────────
    # from scripts import process_auction_data, compute_team_spend
    # process_auction_data.run(OUTPUT_DIR)
    # compute_team_spend.run(OUTPUT_DIR)
    # ──────────────────────────────────────────────────────────

    # Placeholder: write a sample JSON so the frontend works immediately
    sample = {
        "meta": {"seasons": 16, "teams": 10},
        "teams": [
            {"team": "MI",  "batters": 12.5, "bowlers": 8.2, "allrounders": 5.3},
            {"team": "CSK", "batters": 11.0, "bowlers": 9.5, "allrounders": 6.0},
            {"team": "RCB", "batters": 14.0, "bowlers": 7.0, "allrounders": 4.5},
            {"team": "KKR", "batters": 10.0, "bowlers": 10.0,"allrounders": 7.0},
            {"team": "DC",  "batters": 9.5,  "bowlers": 8.8, "allrounders": 5.5},
        ],
    }
    out_path = OUTPUT_DIR / "auction_summary.json"
    with open(out_path, "w") as f:
        json.dump(sample, f, indent=2)

    print(f"✅ Written: {out_path}")
    print("🎉 Pipeline complete.")


if __name__ == "__main__":
    run_all()
