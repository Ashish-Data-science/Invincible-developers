import os
import pandas as pd
import numpy as np
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Adjust in production
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Global variables to cache data
players_data = []
team_spend_data = []
role_distribution_data = []
auction_summary_data = {}
price_vs_performance_data = []

def process_data():
    global players_data, team_spend_data, role_distribution_data, auction_summary_data, price_vs_performance_data

    # Load datasets
    base_dir = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
    bbb_path = os.path.join(base_dir, "data_pipeline", "raw_data", "all_matches_ball_by_ball1.csv")
    auction_path = r"c:\PDF\IDP\dATASET\ipl_auction_2025_sold_players.xlsx"

    print("Loading datasets...")
    bbb_df = pd.read_csv(bbb_path)
    auction_df = pd.read_excel(auction_path)

    print("Processing Batting Stats...")
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

    print("Processing Bowling Stats...")
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

    player_stats = pd.merge(batting_stats, bowling_stats, left_on='batter', right_on='bowler', how='outer')
    player_stats['Player_Name'] = player_stats['batter'].fillna(player_stats['bowler'])

    # Clean Auction Data
    if 'players_name' in auction_df.columns:
        auction_df.rename(columns={'players_name': 'Player Name', 'team_name': 'Team'}, inplace=True)
        
    if 'winning_bid' in auction_df.columns:
        auction_df['Sold_Price_Cr'] = pd.to_numeric(auction_df['winning_bid'], errors='coerce') / 10000000
    else:
        auction_df['Sold_Price_Cr'] = pd.to_numeric(
            auction_df['Winning Bid'].astype(str).str.replace(r'\D', '', regex=True)
        ) / 10000000

    if 'Nationality' not in auction_df.columns:
        auction_df['Nationality'] = 'India'

    master_df = pd.merge(player_stats, auction_df, left_on='Player_Name', right_on='Player Name', how='inner')

    if 'Role' not in master_df.columns:
        def infer_role(row):
            w = row.get('Wickets', 0)
            r = row.get('Total_Runs', 0)
            if pd.isna(w) or w < 5: return 'Batter'
            if pd.isna(r) or r < 100: return 'Bowler'
            return 'All-Rounder'
        master_df['Role'] = master_df.apply(infer_role, axis=1)
        
    role_map_dict = dict(zip(master_df['Player Name'], master_df['Role']))
    auction_df['Role'] = auction_df['Player Name'].map(role_map_dict).fillna('Batter')

    if 'Age' not in master_df.columns:
        master_df['Age'] = 25

    final_dataset = master_df[['Player_Name', 'Role', 'Age', 'Total_Runs', 'Strike_Rate',
                               'Batting_Avg', 'Wickets', 'Economy', 'Sold_Price_Cr']].copy()
    final_dataset.fillna(0, inplace=True)

    for col in ['Strike_Rate', 'Batting_Avg', 'Economy', 'Sold_Price_Cr']:
        final_dataset[col] = final_dataset[col].round(2)

    print("Generating API payloads...")

    # 1. Players Pool
    players_data = []
    for _, row in final_dataset.iterrows():
        role_map = {
            "Batter": "Batter", "WK-Batter": "Wicket-keeper",
            "Bowler": "Bowler", "All-Rounder": "All-rounder"
        }
        base_price = max(0.5, round(row['Sold_Price_Cr'] * 0.3, 2))

        # Compute rating
        if row['Role'] in ['Batter', 'WK-Batter']:
            rating = min(99, int(50 + row['Batting_Avg'] * 0.5 + row['Strike_Rate'] * 0.15))
        elif row['Role'] == 'Bowler':
            econ_score = max(0, 30 - row['Economy'] * 2) if row['Economy'] > 0 else 10
            rating = min(99, int(50 + econ_score + row['Wickets'] * 0.12))
        else:
            rating = min(99, int(50 + row['Batting_Avg'] * 0.3 + row['Strike_Rate'] * 0.1 + row['Wickets'] * 0.1))

        # Nationality mapping
        nat_match = auction_df[auction_df['Player Name'] == row['Player_Name']]
        nationality = nat_match['Nationality'].values[0] if len(nat_match) > 0 else "India"

        specialty_map = {
            "Batter": "Top Order", "WK-Batter": "Wicket-keeper",
            "Bowler": "Specialist", "All-Rounder": "Utility"
        }

        # Handling balls faced and bowled calculation via rough estimates, 
        # since we didn't keep them in final_dataset
        total_runs = int(row['Total_Runs'])
        wickets = int(row['Wickets'])
        matches = max(1, int((total_runs / 25) + (wickets / 1.5)))

        players_data.append({
            "id": int(_ + 1),
            "name": row['Player_Name'],
            "role": role_map.get(row['Role'], row['Role']),
            "nationality": nationality,
            "basePrice": round(base_price, 1),
            "rating": rating,
            "battingAvg": round(row['Batting_Avg'], 1),
            "strikeRate": round(row['Strike_Rate'], 1),
            "matches": matches,
            "specialty": specialty_map.get(row['Role'], 'Utility'),
            "totalRuns": total_runs,
            "wickets": wickets,
            "economy": round(row['Economy'], 2),
            "soldPrice": round(row['Sold_Price_Cr'], 2),
        })

    # 2. Team Spend
    team_spend_data = []
    for team, group in auction_df.groupby('Team'):
        batters = group[group['Role'].isin(['Batter', 'WK-Batter'])]['Sold_Price_Cr'].sum()
        bowlers = group[group['Role'] == 'Bowler']['Sold_Price_Cr'].sum()
        allround = group[group['Role'] == 'All-Rounder']['Sold_Price_Cr'].sum()
        team_spend_data.append({
            "team": team,
            "batters": round(batters, 1),
            "bowlers": round(bowlers, 1),
            "allrounders": round(allround, 1),
            "total": round(batters + bowlers + allround, 1),
            "playerCount": len(group),
        })

    # 3. Role Distribution
    role_dist = final_dataset.groupby('Role').agg(
        count=('Player_Name', 'count'),
        avg_price=('Sold_Price_Cr', 'mean'),
        max_price=('Sold_Price_Cr', 'max'),
        avg_sr=('Strike_Rate', 'mean'),
        total_wickets=('Wickets', 'sum'),
    ).reset_index()

    role_distribution_data = []
    for _, row in role_dist.iterrows():
        role_distribution_data.append({
            "role": row['Role'],
            "count": int(row['count']),
            "avgPrice": round(row['avg_price'], 2),
            "maxPrice": round(row['max_price'], 2),
            "avgStrikeRate": round(row['avg_sr'], 1),
            "totalWickets": int(row['total_wickets']),
        })

    # 4. Auction Summary
    auction_summary_data = {
        "totalPlayers": len(final_dataset),
        "totalTeams": len(auction_df['Team'].unique()),
        "totalSpend": round(auction_df['Sold_Price_Cr'].sum(), 2),
        "avgPrice": round(auction_df['Sold_Price_Cr'].mean(), 2),
        "maxPrice": round(auction_df['Sold_Price_Cr'].max(), 2),
        "topBatter": final_dataset.loc[final_dataset['Total_Runs'].idxmax()]['Player_Name'] if len(final_dataset) > 0 else "",
        "topBowler": final_dataset.loc[final_dataset['Wickets'].idxmax()]['Player_Name'] if len(final_dataset) > 0 else "",
        "seasons": 6,
    }

    # 5. Price vs Performance
    price_vs_performance_data = []
    for _, row in final_dataset.iterrows():
        perf_score = row['Total_Runs'] * 0.3 + row['Wickets'] * 8 + row['Strike_Rate'] * 0.5
        price_vs_performance_data.append({
            "name": row['Player_Name'],
            "role": row['Role'],
            "price": round(row['Sold_Price_Cr'], 2),
            "performance": round(perf_score, 1),
        })

    print("Data processing complete!")


@app.on_event("startup")
async def startup_event():
    process_data()

@app.get("/api/players")
def get_players():
    return players_data

@app.get("/api/team_spend")
def get_team_spend():
    return team_spend_data

@app.get("/api/role_distribution")
def get_role_distribution():
    return role_distribution_data

@app.get("/api/auction_summary")
def get_auction_summary():
    return auction_summary_data

@app.get("/api/price_vs_performance")
def get_price_vs_performance():
    return price_vs_performance_data

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
