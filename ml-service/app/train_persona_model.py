"""
Trains the traveler-persona segmentation model.

Unsupervised on purpose: in production we won't have a "true archetype" label
for real users, only their behavior. KMeans groups users by behavior, then we
derive a human-readable persona name per cluster by inspecting the cluster's
centroid (rule-based labeling) - not by cheating with the synthetic ground
truth. The ground truth is only used afterwards, to *validate* that clustering
recovered something sensible (adjusted Rand index), which is reported in
metrics.json for the README/portfolio writeup.

Run: python app/train_persona_model.py
Outputs: models/kmeans.joblib, models/scaler.joblib, models/persona_labels.json,
         models/persona_metrics.json
"""
import json
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from sklearn.cluster import KMeans
from sklearn.metrics import adjusted_rand_score, silhouette_score
from sklearn.preprocessing import StandardScaler

BASE = Path(__file__).parent.parent
DATA_DIR = BASE / "data"
MODELS_DIR = BASE / "models"
MODELS_DIR.mkdir(exist_ok=True)

FEATURE_COLUMNS = [
    "total_trips", "trips_last_90d", "avg_group_size", "solo_trip_ratio",
    "avg_children", "child_trip_ratio", "mode_share_cab", "mode_share_train",
    "mode_share_bus", "mode_share_flight", "avg_price_ratio",
    "avg_advance_days", "weekend_ratio",
]

N_CLUSTERS = 5


def label_cluster(centroid: dict) -> str:
    """Rule-based persona naming from a cluster's centroid feature values."""
    if centroid["avg_group_size"] > 2.4 and centroid["child_trip_ratio"] > 0.35:
        return "Family Group Traveler"
    if centroid["mode_share_flight"] > 0.35 and centroid["avg_price_ratio"] > 1.25:
        if centroid["trips_last_90d"] > centroid.get("_median_trips_90d", 0):
            return "Frequent Business Flyer"
        return "Luxury Solo Traveler"
    if centroid["weekend_ratio"] > 0.55 and centroid["avg_group_size"] <= 2.6:
        return "Weekend Explorer"
    if centroid["solo_trip_ratio"] > 0.55 and centroid["avg_price_ratio"] < 1.0:
        return "Solo Budget Traveler"
    return "Balanced Traveler"


def main():
    users = pd.read_csv(DATA_DIR / "users.csv")
    X = users[FEATURE_COLUMNS].fillna(0).values

    scaler = StandardScaler()
    X_scaled = scaler.fit_transform(X)

    kmeans = KMeans(n_clusters=N_CLUSTERS, random_state=42, n_init=10)
    cluster_ids = kmeans.fit_predict(X_scaled)

    sil_score = silhouette_score(X_scaled, cluster_ids)
    ari_score = adjusted_rand_score(users["true_archetype"], cluster_ids)

    # Build human-readable labels per cluster from the (unscaled) centroids
    users_labeled = users.copy()
    users_labeled["cluster"] = cluster_ids
    median_trips_90d = users_labeled["trips_last_90d"].median()

    persona_labels = {}
    for c in range(N_CLUSTERS):
        centroid = users_labeled[users_labeled["cluster"] == c][FEATURE_COLUMNS].mean().to_dict()
        centroid["_median_trips_90d"] = median_trips_90d
        persona_labels[str(c)] = label_cluster(centroid)

    joblib.dump(kmeans, MODELS_DIR / "kmeans.joblib")
    joblib.dump(scaler, MODELS_DIR / "scaler.joblib")
    with open(MODELS_DIR / "persona_labels.json", "w") as f:
        json.dump({"feature_columns": FEATURE_COLUMNS, "cluster_to_persona": persona_labels}, f, indent=2)

    metrics = {
        "n_clusters": N_CLUSTERS,
        "silhouette_score": round(float(sil_score), 4),
        "adjusted_rand_index_vs_synthetic_ground_truth": round(float(ari_score), 4),
        "cluster_sizes": users_labeled["cluster"].value_counts().sort_index().to_dict(),
        "cluster_to_persona": persona_labels,
    }
    with open(MODELS_DIR / "persona_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2, default=int)

    print(json.dumps(metrics, indent=2, default=int))


if __name__ == "__main__":
    main()
