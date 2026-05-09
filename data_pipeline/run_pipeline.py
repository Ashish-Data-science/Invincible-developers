"""
IPL Auction Strategy Decoder — Master Pipeline
================================================
Runs all data processing steps and generates static JSON files
consumed by the React frontend.

Usage:
    cd data_pipeline
    pip install -r requirements.txt
    python run_pipeline.py

Pipeline steps:
  1. Generate sample data (if raw CSVs don't exist)
  2. Run filter/processing script (user's Python code)
  3. Convert cleaned CSV → multiple JSON files for frontend
"""

import os
import sys
import json
import pathlib
import pandas as pd
import numpy as np

# Add scripts dir to path
SCRIPTS_DIR = pathlib.Path(__file__).parent / "scripts"
RAW_DIR     = pathlib.Path(__file__).parent / "raw_data"
OUTPUT_DIR  = pathlib.Path(__file__).parent.parent / "frontend" / "public" / "data"
OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

sys.path.insert(0, str(SCRIPTS_DIR))


def step1_ensure_raw_data():
    """Generate sample data if raw CSVs don't exist."""
    bbb_path = RAW_DIR / "ipl_ball_by_ball_2020_2025.csv"
    auction_path = RAW_DIR / "ipl_auction_2025.csv"

    if not bbb_path.exists() or not auction_path.exists():
        print("\n📦 Step 1: Generating sample IPL data...")
        from generate_sample_data import generate_ball_by_ball, generate_auction_data
        generate_ball_by_ball()
        generate_auction_data()
    else:
        print("\n📦 Step 1: Raw data already exists, skipping generation.")


def step2_filter_data():
    """Run the user's filtering/processing script."""
    print("\n🔧 Step 2: Running data filter pipeline...")
    from filter_data import run
    df = run()
    return df


def step3_generate_json(df):
    """Convert the processed dataframe into frontend JSON files."""
    print("\n🎨 Step 3: Generating frontend JSON files...")

    # ── 1. Full player pool for Strategy Maker ──────────────
    players = []
    for _, row in df.iterrows():
        role_map = {
            "Batter": "Batter", "WK-Batter": "Wicket-keeper",
            "Bowler": "Bowler", "All-Rounder": "All-rounder"
        }
        base_price = max(0.5, round(row['Sold_Price_Cr'] * 0.3, 2))

        # Compute a rating from stats
        if row['Role'] in ['Batter', 'WK-Batter']:
            rating = min(99, int(50 + row['Batting_Avg'] * 0.5 + row['Strike_Rate'] * 0.15))
        elif row['Role'] == 'Bowler':
            econ_score = max(0, 30 - row['Economy'] * 2) if row['Economy'] > 0 else 10
            rating = min(99, int(50 + econ_score + row['Wickets'] * 0.12))
        else:
            rating = min(99, int(50 + row['Batting_Avg'] * 0.3 + row['Strike_Rate'] * 0.1 + row['Wickets'] * 0.1))

        # Determine nationality from auction data
        auction_path = RAW_DIR / "ipl_auction_2025.csv"
        auction_df = pd.read_csv(auction_path)
        nat_match = auction_df[auction_df['Player Name'] == row['Player_Name']]
        nationality = nat_match['Nationality'].values[0] if len(nat_match) > 0 else "India"

        specialty_map = {
            "Batter": "Top Order", "WK-Batter": "Wicket-keeper",
            "Bowler": "Specialist", "All-Rounder": "Utility"
        }

        players.append({
            "id": int(_ + 1),
            "name": row['Player_Name'],
            "role": role_map.get(row['Role'], row['Role']),
            "nationality": nationality,
            "basePrice": round(base_price, 1),
            "rating": rating,
            "battingAvg": round(row['Batting_Avg'], 1),
            "strikeRate": round(row['Strike_Rate'], 1),
            "matches": int(row.get('Balls_Faced', 100) // 25) if row['Total_Runs'] > 0 else int(row.get('Balls_Bowled', 100) // 24),
            "specialty": specialty_map.get(row['Role'], 'Utility'),
            "totalRuns": int(row['Total_Runs']),
            "wickets": int(row['Wickets']),
            "economy": round(row['Economy'], 2),
            "soldPrice": round(row['Sold_Price_Cr'], 2),
        })

    write_json("players.json", players)

    # ── 2. Team spend summary for Admin Dashboard ───────────
    auction_df = pd.read_csv(RAW_DIR / "ipl_auction_2025.csv")
    auction_df['Sold_Price_Cr'] = pd.to_numeric(
        auction_df['Winning Bid'].astype(str).str.replace(r'\D', '', regex=True)
    ) / 10000000

    team_spend = []
    for team, group in auction_df.groupby('Team'):
        batters  = group[group['Role'].isin(['Batter', 'WK-Batter'])]['Sold_Price_Cr'].sum()
        bowlers  = group[group['Role'] == 'Bowler']['Sold_Price_Cr'].sum()
        allround = group[group['Role'] == 'All-Rounder']['Sold_Price_Cr'].sum()
        team_spend.append({
            "team": team,
            "batters": round(batters, 1),
            "bowlers": round(bowlers, 1),
            "allrounders": round(allround, 1),
            "total": round(batters + bowlers + allround, 1),
            "playerCount": len(group),
        })

    write_json("team_spend.json", team_spend)

    # ── 3. Role distribution summary ────────────────────────
    role_dist = df.groupby('Role').agg(
        count=('Player_Name', 'count'),
        avg_price=('Sold_Price_Cr', 'mean'),
        max_price=('Sold_Price_Cr', 'max'),
        avg_sr=('Strike_Rate', 'mean'),
        total_wickets=('Wickets', 'sum'),
    ).reset_index()

    role_data = []
    for _, row in role_dist.iterrows():
        role_data.append({
            "role": row['Role'],
            "count": int(row['count']),
            "avgPrice": round(row['avg_price'], 2),
            "maxPrice": round(row['max_price'], 2),
            "avgStrikeRate": round(row['avg_sr'], 1),
            "totalWickets": int(row['total_wickets']),
        })

    write_json("role_distribution.json", role_data)

    # ── 4. Auction summary metadata ─────────────────────────
    summary = {
        "totalPlayers": len(df),
        "totalTeams": len(auction_df['Team'].unique()),
        "totalSpend": round(auction_df['Sold_Price_Cr'].sum(), 2),
        "avgPrice": round(auction_df['Sold_Price_Cr'].mean(), 2),
        "maxPrice": round(auction_df['Sold_Price_Cr'].max(), 2),
        "topBatter": df.loc[df['Total_Runs'].idxmax()]['Player_Name'] if len(df) > 0 else "",
        "topBowler": df.loc[df['Wickets'].idxmax()]['Player_Name'] if len(df) > 0 else "",
        "seasons": 6,
    }
    write_json("auction_summary.json", summary)

    # ── 5. Price vs Performance scatter data ────────────────
    scatter = []
    for _, row in df.iterrows():
        perf_score = row['Total_Runs'] * 0.3 + row['Wickets'] * 8 + row['Strike_Rate'] * 0.5
        scatter.append({
            "name": row['Player_Name'],
            "role": row['Role'],
            "price": round(row['Sold_Price_Cr'], 2),
            "performance": round(perf_score, 1),
        })
    write_json("price_vs_performance.json", scatter)

    print(f"\n🎉 Generated 5 JSON files → {OUTPUT_DIR}")


def write_json(filename, data):
    """Helper to write JSON to the output directory."""
    path = OUTPUT_DIR / filename
    with open(path, "w") as f:
        json.dump(data, f, indent=2)
    print(f"  📄 {filename} ({len(data) if isinstance(data, list) else 'object'})")


def run_all():
    print("=" * 60)
    print("🏏 IPL Auction Strategy Decoder — Data Pipeline")
    print("=" * 60)

    step1_ensure_raw_data()
    df = step2_filter_data()
    step3_generate_json(df)

    print("\n" + "=" * 60)
    print("✅ Pipeline complete! Frontend data is ready.")
    print("=" * 60)


if __name__ == "__main__":
    run_all()
