"""
Generates a synthetic but behaviorally realistic dataset of travelers and their
trip history, since TripSpot doesn't have real user data yet.

Each synthetic user is assigned a hidden ground-truth persona archetype, which
drives how they behave (group size, mode choice, price sensitivity, booking
lead time). This lets us:
  1. Train the persona-clustering model and check it recovers sensible groups
  2. Train the ranking model on realistic "what did the user actually pick" data

Run: python data/generate_synthetic_data.py
Outputs: data/users.csv, data/choices.csv
"""
import numpy as np
import pandas as pd
from pathlib import Path

RNG = np.random.default_rng(42)
N_USERS = 3000
OUT_DIR = Path(__file__).parent

MODES = ["CAB", "TRAIN", "BUS", "FLIGHT"]

# Each archetype defines the *behavioral* distributions used to simulate trips.
ARCHETYPES = {
    "SOLO_BUDGET": {
        "trips_per_month": (1.0, 0.4),
        "group_size_choices": [1, 1, 1, 2],
        "children_prob": 0.03,
        "mode_weights": {"CAB": 0.10, "TRAIN": 0.45, "BUS": 0.40, "FLIGHT": 0.05},
        "price_sensitivity": (0.90, 0.06),   # chosen_price / cheapest_available, near 1 = very sensitive
        "advance_days": (2, 2),
        "weekend_ratio": 0.35,
    },
    "FAMILY_GROUP": {
        "trips_per_month": (0.5, 0.2),
        "group_size_choices": [3, 4, 4, 5, 6],
        "children_prob": 0.75,
        "mode_weights": {"CAB": 0.15, "TRAIN": 0.35, "BUS": 0.25, "FLIGHT": 0.25},
        "price_sensitivity": (1.10, 0.10),
        "advance_days": (14, 7),
        "weekend_ratio": 0.65,
    },
    "BUSINESS_FREQUENT": {
        "trips_per_month": (3.2, 0.8),
        "group_size_choices": [1, 1, 2],
        "children_prob": 0.02,
        "mode_weights": {"CAB": 0.30, "TRAIN": 0.15, "BUS": 0.05, "FLIGHT": 0.50},
        "price_sensitivity": (1.35, 0.15),   # pays a premium, low sensitivity
        "advance_days": (3, 2),
        "weekend_ratio": 0.15,
    },
    "WEEKEND_EXPLORER": {
        "trips_per_month": (1.3, 0.5),
        "group_size_choices": [2, 2, 3],
        "children_prob": 0.10,
        "mode_weights": {"CAB": 0.15, "TRAIN": 0.30, "BUS": 0.35, "FLIGHT": 0.20},
        "price_sensitivity": (1.05, 0.08),
        "advance_days": (7, 4),
        "weekend_ratio": 0.85,
    },
    "LUXURY_SOLO": {
        "trips_per_month": (1.1, 0.5),
        "group_size_choices": [1, 1, 2],
        "children_prob": 0.02,
        "mode_weights": {"CAB": 0.25, "TRAIN": 0.10, "BUS": 0.02, "FLIGHT": 0.63},
        "price_sensitivity": (1.55, 0.20),
        "advance_days": (5, 3),
        "weekend_ratio": 0.40,
    },
}

ARCHETYPE_NAMES = list(ARCHETYPES.keys())


def sample_group(archetype):
    group_size = RNG.choice(archetype["group_size_choices"])
    has_children = RNG.random() < archetype["children_prob"]
    children = 0
    if has_children and group_size > 1:
        children = int(RNG.integers(1, max(2, group_size - 1)))
    adults = max(1, group_size - children)
    return adults, children


def simulate_user(user_id):
    archetype_name = RNG.choice(ARCHETYPE_NAMES)
    a = ARCHETYPES[archetype_name]

    tenure_months = RNG.integers(2, 24)
    trips_per_month = max(0.1, RNG.normal(*a["trips_per_month"]))
    n_trips = max(1, int(RNG.poisson(trips_per_month * tenure_months)))

    trips = []
    for _ in range(n_trips):
        mode = RNG.choice(MODES, p=list(a["mode_weights"].values()))
        adults, children = sample_group(a)
        group_size = adults + children
        is_weekend = RNG.random() < a["weekend_ratio"]
        advance_days = max(0, int(RNG.normal(*a["advance_days"])))
        price_ratio = max(0.55, RNG.normal(*a["price_sensitivity"]))
        days_ago = int(RNG.integers(0, tenure_months * 30))

        trips.append({
            "user_id": user_id,
            "true_archetype": archetype_name,
            "mode": mode,
            "group_size": group_size,
            "adults": adults,
            "children": children,
            "is_weekend": is_weekend,
            "advance_days": advance_days,
            "price_ratio": price_ratio,
            "days_ago": days_ago,
        })
    return trips


def build_user_features(trips_df):
    rows = []
    for user_id, g in trips_df.groupby("user_id"):
        total = len(g)
        mode_share = g["mode"].value_counts(normalize=True).to_dict()
        rows.append({
            "user_id": user_id,
            "true_archetype": g["true_archetype"].iloc[0],
            "total_trips": total,
            "trips_last_90d": int((g["days_ago"] <= 90).sum()),
            "avg_group_size": g["group_size"].mean(),
            "solo_trip_ratio": (g["group_size"] == 1).mean(),
            "avg_children": g["children"].mean(),
            "child_trip_ratio": (g["children"] > 0).mean(),
            "mode_share_cab": mode_share.get("CAB", 0.0),
            "mode_share_train": mode_share.get("TRAIN", 0.0),
            "mode_share_bus": mode_share.get("BUS", 0.0),
            "mode_share_flight": mode_share.get("FLIGHT", 0.0),
            "avg_price_ratio": g["price_ratio"].mean(),
            "avg_advance_days": g["advance_days"].mean(),
            "weekend_ratio": g["is_weekend"].mean(),
        })
    return pd.DataFrame(rows)


def build_choice_rows(trips_df):
    """
    For each real trip (the "chosen" option), simulate 2-3 sibling options that
    were on the fare board but NOT chosen, so the ranking model learns from
    genuine positive/negative examples, not just positives.
    """
    rows = []
    for _, trip in trips_df.iterrows():
        cheapest = 1.0  # normalized; chosen price relative to this
        chosen_price_rel = trip["price_ratio"]
        rows.append({
            "user_id": trip["user_id"],
            "mode": trip["mode"],
            "price_rel_to_cheapest": chosen_price_rel,
            "rating": RNG.uniform(3.6, 4.8),
            "duration_rank": RNG.integers(1, 4),
            "chosen": 1,
        })
        n_alts = RNG.integers(2, 4)
        for _ in range(n_alts):
            alt_mode = RNG.choice(MODES)
            rows.append({
                "user_id": trip["user_id"],
                "mode": alt_mode,
                "price_rel_to_cheapest": max(1.0, RNG.normal(1.15, 0.25)),
                "rating": RNG.uniform(3.2, 4.9),
                "duration_rank": RNG.integers(1, 4),
                "chosen": 0,
            })
    return pd.DataFrame(rows)


def main():
    all_trips = []
    for uid in range(1, N_USERS + 1):
        all_trips.extend(simulate_user(uid))
    trips_df = pd.DataFrame(all_trips)

    users_df = build_user_features(trips_df)
    choices_df = build_choice_rows(trips_df)

    # one-hot the mode for the choice dataset (ranking model needs numeric features)
    choices_df = pd.get_dummies(choices_df, columns=["mode"], prefix="mode")

    users_path = OUT_DIR / "users.csv"
    choices_path = OUT_DIR / "choices.csv"
    users_df.to_csv(users_path, index=False)
    choices_df.to_csv(choices_path, index=False)

    print(f"Generated {len(users_df)} users -> {users_path}")
    print(f"Generated {len(choices_df)} trip-choice rows -> {choices_path}")
    print(users_df["true_archetype"].value_counts())


if __name__ == "__main__":
    main()
