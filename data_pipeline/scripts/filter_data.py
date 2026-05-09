"""
IPL Data Filter & Processing Script
Processes raw ball-by-ball and auction CSVs into a clean master dataset.

Inputs:
  - raw_data/ipl_ball_by_ball_2020_2025.csv
  - raw_data/ipl_auction_2025.csv

Output:
  - cleaned_ipl_master_data.csv (written to raw_data/ folder)
"""

import pandas as pd
import numpy as np
import os

RAW_DIR = os.path.join(os.path.dirname(__file__), '..', 'raw_data')

def run():
    print("📊 Running IPL data filter pipeline...")

    # 1. Load the raw datasets
    bbb_path = os.path.join(RAW_DIR, 'ipl_ball_by_ball_2020_2025.csv')
    auction_path = os.path.join(RAW_DIR, 'ipl_auction_2025.csv')

    bbb_df = pd.read_csv(bbb_path)
    auction_df = pd.read_csv(auction_path)
    print(f"  Loaded {len(bbb_df):,} ball-by-ball rows, {len(auction_df)} auction records")

    # 2. Process Batting Stats
    batting_stats = bbb_df.groupby('batter').agg(
        Total_Runs=('runs_batter', 'sum'),
        Balls_Faced=('runs_batter', 'count'),
        Outs=('player_out', 'count')
    ).reset_index()

    batting_stats['Strike_Rate'] = (batting_stats['Total_Runs'] / batting_stats['Balls_Faced']) * 100
    batting_stats['Batting_Avg'] = np.where(
        batting_stats['Outs'] > 0,
        batting_stats['Total_Runs'] / batting_stats['Outs'],
        batting_stats['Total_Runs']
    )

    # 3. Process Bowling Stats
    bowling_stats = bbb_df.groupby('bowler').agg(
        Runs_Conceded=('runs_batter', 'sum'),
        Balls_Bowled=('runs_batter', 'count'),
        Wickets=('wicket_taken', 'sum')
    ).reset_index()

    bowling_stats['Overs'] = bowling_stats['Balls_Bowled'] / 6
    bowling_stats['Economy'] = np.where(
        bowling_stats['Overs'] > 0,
        bowling_stats['Runs_Conceded'] / bowling_stats['Overs'],
        0
    )

    # 4. Merge Stats Together
    player_stats = pd.merge(batting_stats, bowling_stats, left_on='batter', right_on='bowler', how='outer')
    player_stats['Player_Name'] = player_stats['batter'].fillna(player_stats['bowler'])

    # 5. Clean Auction Data (Convert Prices to Crores)
    auction_df['Sold_Price_Cr'] = pd.to_numeric(
        auction_df['Winning Bid'].astype(str).str.replace(r'\D', '', regex=True)
    ) / 10000000

    # 6. Final Merge: Stats + Auction Data
    master_df = pd.merge(player_stats, auction_df, left_on='Player_Name', right_on='Player Name', how='inner')

    # Keep only the essential columns
    final_dataset = master_df[['Player_Name', 'Role', 'Age', 'Total_Runs', 'Strike_Rate',
                                'Batting_Avg', 'Wickets', 'Economy', 'Sold_Price_Cr']].copy()

    # Handle NaNs (e.g., pure bowlers have no batting stats)
    final_dataset.fillna(0, inplace=True)

    # Round numeric columns
    for col in ['Strike_Rate', 'Batting_Avg', 'Economy', 'Sold_Price_Cr']:
        final_dataset[col] = final_dataset[col].round(2)

    # Export to a clean CSV
    out_path = os.path.join(RAW_DIR, 'cleaned_ipl_master_data.csv')
    final_dataset.to_csv(out_path, index=False)
    print(f"  ✅ Written {len(final_dataset)} player records → {out_path}")

    return final_dataset


if __name__ == "__main__":
    run()
