"""
TripSpot ML Service.

Loads the trained persona-clustering model and ranking model once at startup,
then serves two endpoints the Spring Boot backend calls:

  POST /persona  - classify a user's trip history into a traveler persona
  POST /rerank   - re-score a fare board's options for a specific user

Run locally: uvicorn app.main:app --reload --port 8000
"""
import sys
from pathlib import Path

import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

sys.path.append(str(Path(__file__).parent))
from features import compute_user_features, apply_current_party_override, FEATURE_COLUMNS
from insight import generate_insight
from schemas import PersonaRequest, PersonaResponse, RerankRequest, RerankResponse, RankedOption

BASE = Path(__file__).parent.parent
MODELS_DIR = BASE / "models"

app = FastAPI(title="TripSpot ML Service", version="0.1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # this service is only ever called server-to-server by the backend
    allow_methods=["*"],
    allow_headers=["*"],
)

_state = {}


@app.on_event("startup")
def load_models():
    import json
    _state["kmeans"] = joblib.load(MODELS_DIR / "kmeans.joblib")
    _state["scaler"] = joblib.load(MODELS_DIR / "scaler.joblib")
    with open(MODELS_DIR / "persona_labels.json") as f:
        _state["persona_labels"] = json.load(f)["cluster_to_persona"]

    ranker_bundle = joblib.load(MODELS_DIR / "ranker.joblib")
    _state["ranker"] = ranker_bundle["model"]
    _state["ranker_features"] = ranker_bundle["feature_columns"]


@app.get("/health")
def health():
    return {"status": "ok", "models_loaded": list(_state.keys())}


def _classify_persona(user_features: dict):
    X = np.array([[user_features[c] for c in FEATURE_COLUMNS]])
    X_scaled = _state["scaler"].transform(X)
    cluster = int(_state["kmeans"].predict(X_scaled)[0])

    # distance to the assigned centroid vs the average distance to all
    # centroids gives a simple, cheap confidence proxy (closer = more typical)
    distances = _state["kmeans"].transform(X_scaled)[0]
    confidence = float(1 - (distances[cluster] / (distances.sum() + 1e-9)))

    persona = _state["persona_labels"][str(cluster)]
    return persona, round(min(max(confidence, 0.0), 1.0), 3)


@app.post("/persona", response_model=PersonaResponse)
def persona(req: PersonaRequest):
    trips = [t.model_dump() for t in req.trips]
    is_new = len(trips) == 0
    features = compute_user_features(trips)
    persona_label, confidence = _classify_persona(features)
    insight_text = generate_insight(persona_label, features, is_new)

    return PersonaResponse(
        persona=persona_label,
        confidence=confidence,
        isNewTraveler=is_new,
        features=features,
        insight=insight_text,
    )


@app.post("/rerank", response_model=RerankResponse)
def rerank(req: RerankRequest):
    trips = [t.model_dump() for t in req.trips]
    base_features = compute_user_features(trips)
    current_party = req.currentParty.model_dump() if req.currentParty else None
    user_features = apply_current_party_override(base_features, current_party)

    persona_label, _ = _classify_persona(base_features)

    if not req.options:
        return RerankResponse(persona=persona_label, rankedOptionIds=[], scored=[])

    cheapest = min(o.price for o in req.options)

    rows = []
    for opt in req.options:
        row = dict(user_features)
        row["price_rel_to_cheapest"] = opt.price / cheapest if cheapest > 0 else 1.0
        row["rating"] = opt.rating
        row["duration_rank"] = opt.durationRank
        for m in ["CAB", "TRAIN", "BUS", "FLIGHT"]:
            row[f"mode_{m}"] = 1 if opt.mode == m else 0
        row["_id"] = opt.id
        rows.append(row)

    df = pd.DataFrame(rows)
    X = df[_state["ranker_features"]]
    scores = _state["ranker"].predict_proba(X)[:, 1]

    scored = []
    for opt, score in zip(req.options, scores):
        mode_share_key = f"mode_share_{opt.mode.lower()}"
        reason = "matches how you usually travel" if user_features.get(mode_share_key, 0) > 0.3 else \
                 "best price for this route" if opt.price == cheapest else \
                 "highly rated by other travelers" if opt.rating >= 4.5 else "solid overall option"
        scored.append(RankedOption(id=opt.id, personalizedScore=round(float(score), 4), reason=reason))

    scored.sort(key=lambda s: -s.personalizedScore)
    ranked_ids = [s.id for s in scored]

    return RerankResponse(persona=persona_label, rankedOptionIds=ranked_ids, scored=scored)
