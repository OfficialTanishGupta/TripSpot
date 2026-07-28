"""
Trains the personalized ranking model: given a user's behavioral profile plus
a candidate fare option's attributes, predict the probability this user would
actually book it. At serving time, every option on the fare board gets scored
and re-sorted by this probability instead of pure price - this is what turns
"AI enabled" from a slogan into an actual mechanism.

Run: python app/train_ranking_model.py
Outputs: models/ranker.joblib, models/ranking_metrics.json
"""
import json
from pathlib import Path

import joblib
import pandas as pd
from sklearn.metrics import accuracy_score, roc_auc_score
from sklearn.model_selection import train_test_split
from xgboost import XGBClassifier

BASE = Path(__file__).parent.parent
DATA_DIR = BASE / "data"
MODELS_DIR = BASE / "models"
MODELS_DIR.mkdir(exist_ok=True)

USER_FEATURE_COLUMNS = [
    "total_trips", "trips_last_90d", "avg_group_size", "solo_trip_ratio",
    "avg_children", "child_trip_ratio", "mode_share_cab", "mode_share_train",
    "mode_share_bus", "mode_share_flight", "avg_price_ratio",
    "avg_advance_days", "weekend_ratio",
]

OPTION_FEATURE_COLUMNS = [
    "price_rel_to_cheapest", "rating", "duration_rank",
    "mode_CAB", "mode_TRAIN", "mode_BUS", "mode_FLIGHT",
]

ALL_FEATURE_COLUMNS = USER_FEATURE_COLUMNS + OPTION_FEATURE_COLUMNS


def main():
    users = pd.read_csv(DATA_DIR / "users.csv")
    choices = pd.read_csv(DATA_DIR / "choices.csv")

    # ensure all one-hot mode columns exist even if a mode never appeared
    for col in ["mode_CAB", "mode_TRAIN", "mode_BUS", "mode_FLIGHT"]:
        if col not in choices.columns:
            choices[col] = 0

    df = choices.merge(users[["user_id"] + USER_FEATURE_COLUMNS], on="user_id", how="left")
    df = df.dropna(subset=ALL_FEATURE_COLUMNS)

    X = df[ALL_FEATURE_COLUMNS]
    y = df["chosen"]

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    model = XGBClassifier(
        n_estimators=200,
        max_depth=4,
        learning_rate=0.08,
        subsample=0.85,
        colsample_bytree=0.85,
        eval_metric="logloss",
        random_state=42,
    )
    model.fit(X_train, y_train)

    y_pred = model.predict(X_test)
    y_proba = model.predict_proba(X_test)[:, 1]

    metrics = {
        "n_train_rows": len(X_train),
        "n_test_rows": len(X_test),
        "accuracy": round(float(accuracy_score(y_test, y_pred)), 4),
        "roc_auc": round(float(roc_auc_score(y_test, y_proba)), 4),
        "feature_importance": {
            col: round(float(imp), 4)
            for col, imp in sorted(
                zip(ALL_FEATURE_COLUMNS, model.feature_importances_),
                key=lambda t: -t[1]
            )
        },
    }

    joblib.dump({"model": model, "feature_columns": ALL_FEATURE_COLUMNS}, MODELS_DIR / "ranker.joblib")
    with open(MODELS_DIR / "ranking_metrics.json", "w") as f:
        json.dump(metrics, f, indent=2)

    print(json.dumps(metrics, indent=2))


if __name__ == "__main__":
    main()
