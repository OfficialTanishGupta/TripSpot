"""
Turns a raw trip history (what the Spring Boot backend logs per booking) into
the same aggregate feature vector the models were trained on. Keeping this in
one place means training and serving can never silently drift apart.
"""
from typing import List
import numpy as np

FEATURE_COLUMNS = [
    "total_trips", "trips_last_90d", "avg_group_size", "solo_trip_ratio",
    "avg_children", "child_trip_ratio", "mode_share_cab", "mode_share_train",
    "mode_share_bus", "mode_share_flight", "avg_price_ratio",
    "avg_advance_days", "weekend_ratio",
]

DEFAULT_NEW_USER_FEATURES = {
    # A brand-new user with no history yet - neutral, population-average-ish
    # defaults so /rerank and /persona still return something sensible on
    # someone's very first search.
    "total_trips": 0, "trips_last_90d": 0, "avg_group_size": 1.0,
    "solo_trip_ratio": 1.0, "avg_children": 0.0, "child_trip_ratio": 0.0,
    "mode_share_cab": 0.25, "mode_share_train": 0.25, "mode_share_bus": 0.25,
    "mode_share_flight": 0.25, "avg_price_ratio": 1.0, "avg_advance_days": 5.0,
    "weekend_ratio": 0.3,
}


def compute_user_features(trips: List[dict]) -> dict:
    if not trips:
        return dict(DEFAULT_NEW_USER_FEATURES)

    total = len(trips)
    group_sizes = [t["adults"] + t.get("children", 0) for t in trips]
    children = [t.get("children", 0) for t in trips]
    modes = [t["mode"] for t in trips]
    days_ago = [t.get("daysAgo", 0) for t in trips]
    advance = [t.get("advanceDays", 0) for t in trips]
    weekend = [1 if t.get("isWeekend") else 0 for t in trips]
    price_ratios = [
        (t["price"] / t["cheapestAvailablePrice"]) if t.get("cheapestAvailablePrice") else 1.0
        for t in trips
    ]

    mode_counts = {m: modes.count(m) for m in ["CAB", "TRAIN", "BUS", "FLIGHT"]}

    return {
        "total_trips": total,
        "trips_last_90d": sum(1 for d in days_ago if d <= 90),
        "avg_group_size": float(np.mean(group_sizes)),
        "solo_trip_ratio": float(np.mean([1 if g == 1 else 0 for g in group_sizes])),
        "avg_children": float(np.mean(children)),
        "child_trip_ratio": float(np.mean([1 if c > 0 else 0 for c in children])),
        "mode_share_cab": mode_counts["CAB"] / total,
        "mode_share_train": mode_counts["TRAIN"] / total,
        "mode_share_bus": mode_counts["BUS"] / total,
        "mode_share_flight": mode_counts["FLIGHT"] / total,
        "avg_price_ratio": float(np.mean(price_ratios)),
        "avg_advance_days": float(np.mean(advance)),
        "weekend_ratio": float(np.mean(weekend)),
    }


def apply_current_party_override(features: dict, current_party: dict | None) -> dict:
    """
    If the user just told us who's traveling *this* time (solo/group, adults,
    children), blend that signal into the feature vector so the ranking for
    *this* search reflects who's actually going - not just historical average.
    """
    if not current_party:
        return features

    f = dict(features)
    adults = current_party.get("adults", 1)
    children = current_party.get("children", 0)
    group_size = adults + children

    # Blend 60% current trip / 40% history - current context should dominate,
    # but a single trip shouldn't erase a long history overnight.
    f["avg_group_size"] = 0.6 * group_size + 0.4 * f["avg_group_size"]
    f["solo_trip_ratio"] = 0.6 * (1.0 if group_size == 1 else 0.0) + 0.4 * f["solo_trip_ratio"]
    f["avg_children"] = 0.6 * children + 0.4 * f["avg_children"]
    f["child_trip_ratio"] = 0.6 * (1.0 if children > 0 else 0.0) + 0.4 * f["child_trip_ratio"]
    if "isWeekend" in current_party:
        f["weekend_ratio"] = 0.6 * (1.0 if current_party["isWeekend"] else 0.0) + 0.4 * f["weekend_ratio"]
    if "advanceDays" in current_party:
        f["avg_advance_days"] = 0.6 * current_party["advanceDays"] + 0.4 * f["avg_advance_days"]
    return f
