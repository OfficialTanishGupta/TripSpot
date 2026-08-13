# TripSpot

TripSpot is a full-stack transport fare comparison platform for India, letting users compare cabs, trains, buses, and flights in one place — with AI-driven personalization that ranks options based on user behavior and preferences.

## Overview

TripSpot pulls fare and route data from multiple transport providers and presents them side by side, then uses a machine learning layer to re-rank and personalize results per user (e.g. prioritizing speed vs. cost vs. comfort based on inferred persona).

## Architecture

```
┌─────────────────┐      ┌──────────────────┐      ┌───────────────────┐
│  React Frontend │─────▶│  Spring Boot API │─────▶│  FastAPI ML Service│
│  (Vite + Tailwind)│    │  (Java 21, JWT)   │      │  (KMeans + XGBoost)│
│  localhost:5173  │     │  localhost:8080   │      │  localhost:8000    │
└─────────────────┘      └──────────────────┘      └───────────────────┘
                                   │
                                   ▼
                            ┌────────────┐
                            │  H2 / JPA  │
                            └────────────┘
```

- **Frontend** calls the Spring Boot backend for auth, search, and booking data.
- **Backend** aggregates results from pluggable transport providers and calls the ML service to re-rank options for the logged-in user's persona.
- **ML service** clusters synthetic user personas via KMeans and ranks transport options via XGBoost, returning a `personalizedScore` and `personalizedReason` per option.

## Tech Stack

| Layer      | Technology                                            |
| ---------- | ----------------------------------------------------- |
| Frontend   | React, Vite, Tailwind CSS v4                          |
| Backend    | Spring Boot 3, Java 21, Spring Security (JWT), JPA/H2 |
| ML Service | Python, FastAPI, scikit-learn (KMeans), XGBoost       |
| Auth       | JWT (stateless), WebAuthn support                     |

## Features

- Multi-modal fare comparison (cab, train, bus, flight)
- JWT-based authentication with WebAuthn credential support
- AI-personalized ranking of transport options
- Price alerts, trip insights, wishlist, and offers pages
- Floating chat widget with voice input
- Light, Apple-inspired UI theme

## Project Structure

```
TripSpot/
├── backend/                  # Spring Boot API
│   └── src/main/java/com/tripspot/
│       ├── config/            # Security, JWT filter config
│       ├── controller/        # REST controllers (auth, search, booking, user)
│       ├── dto/                # Request/response DTOs
│       ├── model/              # JPA entities
│       ├── provider/           # Transport provider integrations
│       ├── repository/         # Spring Data repositories
│       └── service/            # Business logic (JWT, aggregator, WebAuthn)
├── frontend/                  # React + Vite app
│   └── src/
│       ├── api/                 # Axios client
│       ├── components/          # Reusable UI components
│       ├── context/              # Auth context
│       ├── layouts/              # Page layouts
│       ├── lib/                   # Utilities, WebAuthn helpers
│       └── pages/                  # Route pages (Dashboard, Explore, Wishlist, etc.)
└── ml-service/                # FastAPI ML microservice
    ├── app/
    │   ├── main.py               # FastAPI entrypoint
    │   ├── features.py            # Feature engineering
    │   ├── schemas.py              # Pydantic models
    │   ├── train_persona_model.py  # KMeans persona clustering
    │   └── train_ranking_model.py  # XGBoost ranking model
    ├── data/                    # Synthetic training data
    └── models/                  # Trained model artifacts (.joblib)
```

## Getting Started

### Prerequisites

- Node.js (for frontend)
- Java 21 + Maven (for backend)
- Python 3.12 (for ML service)

### 1. Backend (Spring Boot)

```bash
cd backend
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`.

### 2. ML Service (FastAPI)

```bash
cd ml-service
python -m venv venv
.\venv\Scripts\Activate.ps1      # Windows
pip install -r requirements.txt
python -m uvicorn app.main:app --reload --port 8000
```

Runs on `http://localhost:8000`.

### 3. Frontend (React + Vite)

```bash
cd frontend
npm install
npm run dev
```

Runs on `http://localhost:5173`.

### Environment Variables

Copy `.env.example` in `frontend/` to `.env` and set:

```
VITE_API_BASE_URL=http://localhost:8080
```

## API Overview

| Endpoint             | Auth         | Description                         |
| -------------------- | ------------ | ----------------------------------- |
| `POST /api/auth/**`  | Public       | Login, register, WebAuthn           |
| `GET /api/search/**` | Public       | Transport search/comparison         |
| `/actuator/health`   | Public       | Health check                        |
| All other `/api/**`  | JWT required | User, booking, personalization data |

## Known Issues / Roadmap

- [ ] Confirm ML personalization layer (`personalizedScore` / `personalizedReason`) returns consistently once auth flow is fully verified end-to-end.
- [ ] Wrap `JwtAuthFilter#extractUserId` in try/catch to avoid 500s on malformed tokens.
- [ ] Add integration tests for the aggregator → ML re-rank pipeline.

## License

TBD
