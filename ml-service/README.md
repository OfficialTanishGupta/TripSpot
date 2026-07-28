# TripSpot ML Service

The personalization engine behind TripSpot. Two trained models decide *who a
traveler is* and *which fare they're likely to actually pick* — not a chatbot
bolted on top, an actual mechanism the fare board is re-ranked by.

## Pipeline

```
data/generate_synthetic_data.py   → data/users.csv, data/choices.csv
app/train_persona_model.py        → models/kmeans.joblib, scaler.joblib, persona_labels.json
app/train_ranking_model.py        → models/ranker.joblib
app/main.py (FastAPI)             → serves /persona and /rerank using the above
```

### Why synthetic data
TripSpot has no real user base yet. Rather than train on nothing, I built a
simulator that generates thousands of synthetic travelers, each secretly
assigned one of 5 behavioral archetypes (solo budget, family group, frequent
business flyer, weekend explorer, luxury solo), each with realistic
distributions for group size, price sensitivity, booking lead time, and mode
preference. Real trip data the app logs going forward can retrain these same
scripts with zero code changes — swap `users.csv`/`choices.csv` for real
exports and re-run.

## Model 1 — Traveler Persona (KMeans, unsupervised)

13 behavioral features (trip frequency, group size, child ratio, mode-share
across cab/train/bus/flight, price sensitivity, booking lead time, weekend
ratio) → 5 clusters → each cluster labeled by inspecting its centroid
(rule-based, not hand-picked from the synthetic ground truth).

**Results:**
- Silhouette score: **0.34** (solid separation for 13-dim behavioral data)
- Adjusted Rand Index vs. the synthetic ground-truth archetype: **0.84**
  (i.e. unsupervised clustering independently recovered the true traveler
  types with high fidelity — this is the number that actually validates the
  approach)

## Model 2 — Personalized Ranking (XGBoost, supervised)

Given a user's behavioral profile + a candidate fare option (price relative
to the cheapest on the board, rating, duration rank, mode), predicts P(this
user books this option). At serving time every option on the board gets
scored and re-sorted by this probability, blending personal fit with price —
this is what "AI-enabled ranking" concretely means here.

**Results (held-out test set, 36k rows):**
- Accuracy: **86.1%**
- ROC AUC: **0.939**
- Top predictive features: price-relative-to-cheapest, rating, whether the
  option is a flight, and the user's own historical price sensitivity —
  matches domain intuition, which is worth calling out explicitly in an
  interview.

## API

### `POST /persona`
```json
{ "trips": [ { "mode": "FLIGHT", "adults": 1, "children": 0, "isWeekend": false,
               "advanceDays": 3, "price": 4200, "cheapestAvailablePrice": 3100,
               "daysAgo": 10 } ] }
```
→ `{ "persona": "Frequent Business Flyer", "confidence": 0.91, "insight": "..." }`

### `POST /rerank`
```json
{ "trips": [...], "currentParty": { "adults": 2, "children": 2 },
  "options": [ { "id": "opt1", "mode": "TRAIN", "providerName": "AC 3-Tier",
                 "price": 890, "rating": 4.1, "durationRank": 2 }, ... ] }
```
→ ranked option IDs + per-option scores and a short human-readable reason.

`currentParty` lets *this specific search* (who's actually traveling right
now — solo, or with 2 adults and 2 children) blend into the ranking even
before that shows up in long-run history — a new user's very first "family
trip" search still gets sensibly personalized results.

## Running it

```bash
pip install -r requirements.txt --break-system-packages   # or use a venv
python data/generate_synthetic_data.py
python app/train_persona_model.py
python app/train_ranking_model.py
uvicorn app.main:app --reload --port 8000
```
Or just `docker compose up` from the repo root — this service trains its
models at image build time and is ready on `:8000`.

## Honest limitations (worth stating up front, not hiding)

- Trained on synthetic, not real, behavioral data — the *pipeline* and
  *evaluation methodology* are the real deliverable here, not the specific
  numbers, until real usage data accumulates.
- Two of the five KMeans clusters both mapped to "Frequent Business Flyer" —
  business and luxury-solo travelers overlap heavily on these particular
  features (both fly often, both pay a premium). A refinement worth doing
  with more data: add a feature that separates "flies for work" from "flies
  for comfort" more directly (e.g. weekday concentration).
- The ranking model's raw probabilities aren't calibrated to a "true" booking
  rate (the synthetic negative-sampling ratio is somewhat arbitrary) — what's
  meaningful is the *relative order* it produces, which is exactly how it's
  used (re-sorting), not the absolute score.
