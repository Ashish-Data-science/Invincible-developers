"""
Generate realistic sample IPL datasets matching the exact schema
that the user's filtering code expects:
  - ipl_ball_by_ball_2020_2025.csv
  - ipl_auction_2025.csv
"""

import pandas as pd
import numpy as np
import os
import random

np.random.seed(42)
random.seed(42)

RAW_DIR = os.path.join(os.path.dirname(__file__), '..', 'raw_data')
os.makedirs(RAW_DIR, exist_ok=True)

# ─── IPL Player Pool ───────────────────────────────────────────
PLAYERS = {
    # name: (role, age, batting_ability, bowling_ability, nationality)
    "Virat Kohli":       ("Batter", 36, 95, 5, "India"),
    "Rohit Sharma":      ("Batter", 38, 90, 5, "India"),
    "KL Rahul":          ("Batter", 32, 87, 5, "India"),
    "Shubman Gill":      ("Batter", 25, 85, 5, "India"),
    "Yashasvi Jaiswal":  ("Batter", 23, 84, 5, "India"),
    "Suryakumar Yadav":  ("Batter", 34, 88, 5, "India"),
    "Sanju Samson":      ("WK-Batter", 30, 82, 5, "India"),
    "Jos Buttler":       ("Batter", 34, 89, 5, "England"),
    "David Warner":      ("Batter", 38, 86, 5, "Australia"),
    "Faf du Plessis":    ("Batter", 40, 80, 5, "South Africa"),
    "Travis Head":       ("Batter", 30, 83, 10, "Australia"),
    "Phil Salt":         ("Batter", 28, 81, 5, "England"),
    "Rishabh Pant":      ("WK-Batter", 27, 86, 5, "India"),
    "Abhishek Sharma":   ("Batter", 24, 78, 20, "India"),
    "Ruturaj Gaikwad":   ("Batter", 27, 82, 5, "India"),

    "Hardik Pandya":     ("All-Rounder", 31, 75, 65, "India"),
    "Ravindra Jadeja":   ("All-Rounder", 36, 70, 80, "India"),
    "Axar Patel":        ("All-Rounder", 31, 60, 75, "India"),
    "Glenn Maxwell":     ("All-Rounder", 36, 78, 45, "Australia"),
    "Mitchell Marsh":    ("All-Rounder", 33, 72, 50, "Australia"),
    "Sam Curran":        ("All-Rounder", 26, 55, 70, "England"),
    "Washington Sundar": ("All-Rounder", 25, 50, 72, "India"),
    "Venkatesh Iyer":    ("All-Rounder", 29, 65, 40, "India"),
    "Liam Livingstone":  ("All-Rounder", 31, 76, 35, "England"),
    "Cameron Green":     ("All-Rounder", 25, 68, 58, "Australia"),
    "Marcus Stoinis":    ("All-Rounder", 35, 74, 45, "Australia"),
    "Nitish Kumar Reddy":("All-Rounder", 21, 62, 55, "India"),

    "Jasprit Bumrah":    ("Bowler", 31, 5, 97, "India"),
    "Mohammed Siraj":    ("Bowler", 30, 5, 82, "India"),
    "Yuzvendra Chahal":  ("Bowler", 34, 5, 85, "India"),
    "Rashid Khan":       ("Bowler", 26, 20, 93, "Afghanistan"),
    "Pat Cummins":       ("Bowler", 31, 15, 88, "Australia"),
    "Trent Boult":       ("Bowler", 35, 5, 84, "New Zealand"),
    "Arshdeep Singh":    ("Bowler", 25, 5, 80, "India"),
    "Kuldeep Yadav":     ("Bowler", 30, 5, 83, "India"),
    "R Ashwin":          ("Bowler", 38, 15, 85, "India"),
    "Kagiso Rabada":     ("Bowler", 29, 5, 87, "South Africa"),
    "Mitchell Starc":    ("Bowler", 34, 5, 86, "Australia"),
    "Bhuvneshwar Kumar": ("Bowler", 34, 10, 78, "India"),
    "Varun Chakaravarthy":("Bowler", 33, 5, 81, "India"),
    "Noor Ahmad":        ("Bowler", 19, 5, 75, "Afghanistan"),
    "Mayank Yadav":      ("Bowler", 22, 5, 77, "India"),
    "Alzarri Joseph":    ("Bowler", 28, 5, 74, "West Indies"),
    "Lockie Ferguson":   ("Bowler", 33, 5, 82, "New Zealand"),
    "Mohammed Shami":    ("Bowler", 34, 5, 83, "India"),
    "Harshal Patel":     ("Bowler", 33, 15, 79, "India"),
}

TEAMS = ["MI", "CSK", "RCB", "KKR", "DC", "SRH", "PBKS", "RR", "GT", "LSG"]
SEASONS = [2020, 2021, 2022, 2023, 2024, 2025]


def generate_ball_by_ball():
    """Generate ball-by-ball data for IPL 2020-2025."""
    rows = []
    match_id = 1000

    batters = [p for p, v in PLAYERS.items()]
    bowlers_pool = [p for p, v in PLAYERS.items() if v[3] > 30]

    for season in SEASONS:
        num_matches = random.randint(60, 74)
        for _ in range(num_matches):
            match_id += 1
            team1, team2 = random.sample(TEAMS, 2)

            for inning in [1, 2]:
                batting_team = team1 if inning == 1 else team2
                bowling_team = team2 if inning == 1 else team1

                # Pick 6 batters and 5 bowlers for this innings
                match_batters = random.sample(batters, 6)
                match_bowlers = random.sample(bowlers_pool, 5)

                balls_in_innings = random.randint(90, 120)
                wickets = 0

                for ball_num in range(balls_in_innings):
                    over = ball_num // 6
                    ball = (ball_num % 6) + 1
                    batter = match_batters[min(wickets, len(match_batters) - 1)]
                    bowler = match_bowlers[over % len(match_bowlers)]

                    bat_ability = PLAYERS[batter][2]
                    bowl_ability = PLAYERS[bowler][3]

                    # Runs scored
                    r = random.random()
                    if r < 0.35:
                        runs = 0
                    elif r < 0.55:
                        runs = 1
                    elif r < 0.70:
                        runs = 2
                    elif r < 0.82:
                        runs = 4
                    elif r < 0.88:
                        runs = 6
                    else:
                        runs = random.choice([0, 1, 2, 3])

                    # Boost runs based on batting ability
                    if bat_ability > 85 and random.random() < 0.15:
                        runs = random.choice([4, 6])

                    # Wicket logic
                    wicket_taken = 0
                    player_out = ""
                    if random.random() < (bowl_ability / 1200) and wickets < 10:
                        wicket_taken = 1
                        player_out = batter
                        wickets += 1

                    extras = 1 if random.random() < 0.06 else 0

                    rows.append({
                        "match_id": match_id,
                        "season": season,
                        "batting_team": batting_team,
                        "bowling_team": bowling_team,
                        "inning": inning,
                        "over": over,
                        "ball": ball,
                        "batter": batter,
                        "bowler": bowler,
                        "runs_batter": runs,
                        "extras": extras,
                        "total_runs": runs + extras,
                        "wicket_taken": wicket_taken,
                        "player_out": player_out,
                    })

    df = pd.DataFrame(rows)
    path = os.path.join(RAW_DIR, 'ipl_ball_by_ball_2020_2025.csv')
    df.to_csv(path, index=False)
    print(f"✅ Generated {len(df):,} ball-by-ball rows → {path}")
    return df


def generate_auction_data():
    """Generate IPL 2025 auction data."""
    rows = []
    for name, (role, age, bat, bowl, nat) in PLAYERS.items():
        base_price = random.choice([20, 50, 75, 100, 150, 200])  # in lakhs

        # Simulate sold price based on ability
        max_ability = max(bat, bowl)
        multiplier = random.uniform(1.5, 4.0) if max_ability > 80 else random.uniform(1.0, 2.5)
        sold_price_lakhs = int(base_price * multiplier * (max_ability / 50))
        # Cap at reasonable values
        sold_price_lakhs = min(sold_price_lakhs, 2700)

        team = random.choice(TEAMS)

        rows.append({
            "Player Name": name,
            "Role": role,
            "Age": age,
            "Nationality": nat,
            "Team": team,
            "Base Price": f"{base_price * 100000}",
            "Winning Bid": f"{sold_price_lakhs * 100000}",
            "Status": "Capped" if max_ability > 70 else "Uncapped",
        })

    df = pd.DataFrame(rows)
    path = os.path.join(RAW_DIR, 'ipl_auction_2025.csv')
    df.to_csv(path, index=False)
    print(f"✅ Generated {len(df)} auction records → {path}")
    return df


if __name__ == "__main__":
    print("🏏 Generating sample IPL data...")
    generate_ball_by_ball()
    generate_auction_data()
    print("🎉 Done! Raw data files created in data_pipeline/raw_data/")
