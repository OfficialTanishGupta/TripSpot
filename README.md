# ✈️ TripSpot

### AI-Powered Multi-Modal Travel Search & Fare Comparison Platform

TripSpot is a full-stack travel transportation platform designed to help users **search, compare, personalize, and manage travel options across India**.

Instead of checking cabs, buses, trains, and flights separately, TripSpot brings multiple transportation modes into a single platform and compares options based on **price, duration, comfort, availability, and user preferences**.

The platform also includes an **AI-powered personalization layer** that analyzes user behavior and inferred travel preferences to intelligently re-rank available routes.

---

## 🚀 Key Highlights

- 🔎 Multi-modal transportation search
- 🚕 Cab, 🚌 bus, 🚆 train, and ✈️ flight comparison
- 🤖 AI-powered personalized route ranking
- 🧠 KMeans-based user persona clustering
- 📊 XGBoost-based preference ranking
- 🔐 JWT-based authentication
- 🔑 WebAuthn / Passkey authentication support
- 💳 Detailed checkout and fare breakdown
- ❤️ Wishlist and saved trips
- 🔔 Price tracking and alerts
- 🏙️ Dynamic city autocomplete
- 💬 AI travel assistant
- 🎙️ Voice-enabled AI interaction
- 📈 Personalized travel insights
- 🔌 Pluggable transport provider architecture
- ⚡ React + Spring Boot + FastAPI microservice architecture

---

# 🏗️ System Architecture

```text
                         ┌─────────────────────────┐
                         │      React Frontend      │
                         │   Vite + Tailwind CSS    │
                         │                         │
                         │    localhost:5173       │
                         └────────────┬────────────┘
                                      │
                                      │ REST API / JWT
                                      ▼
                         ┌─────────────────────────┐
                         │    Spring Boot API      │
                         │       Java 21           │
                         │ Spring Security + JWT   │
                         │                         │
                         │    localhost:8080       │
                         └──────┬─────────┬────────┘
                                │         │
                       JPA/H2   │         │ ML Requests
                                ▼         ▼
                     ┌──────────────┐  ┌─────────────────────┐
                     │  H2 Database │  │   FastAPI ML        │
                     │    + JPA     │  │     Service         │
                     └──────────────┘  │                     │
                                       │ KMeans + XGBoost   │
                                       │                     │
                                       │ localhost:8000      │
                                       └─────────────────────┘
```

---

# 🧠 How AI Personalization Works

TripSpot doesn't simply return the cheapest or fastest route.

The platform attempts to understand **what matters most to each user**.

For example:

### User A — Budget Traveler

```text
Price        → High importance
Duration     → Medium importance
Comfort      → Low importance
```

TripSpot may rank:

```text
₹450 Bus
₹700 Train
₹1,800 Flight
```

higher than more expensive alternatives.

### User B — Time-Conscious Traveler

```text
Price        → Low importance
Duration     → High importance
Comfort      → Medium importance
```

The same search could instead rank:

```text
₹3,500 Flight
₹1,800 Train
₹700 Bus
```

higher.

---

# 🤖 ML Pipeline

TripSpot uses two major machine-learning components.

## 1. KMeans Persona Clustering

KMeans is used to group users into behavioral personas based on travel preferences and historical interactions.

Example personas:

```text
                    Users
                      │
                      ▼
                Feature Engineering
                      │
                      ▼
                 KMeans Clustering
                      │
          ┌───────────┼───────────┐
          ▼           ▼           ▼
      Budget       Balanced     Premium
      Traveler     Traveler     Traveler
```

Possible user features include:

- Average travel budget
- Preferred transportation mode
- Average trip duration
- Booking frequency
- Price sensitivity
- Preference for faster routes
- Preference for comfort
- Historical interaction behavior

---

## 2. XGBoost Preference Ranking

After determining the user's behavioral characteristics, XGBoost predicts the relative preference for available travel options.

Conceptually:

```text
User Profile
     +
Travel Option
     +
Route Features
     │
     ▼
 Feature Engineering
     │
     ▼
 XGBoost Ranking Model
     │
     ▼
 Personalized Score
     +
 Personalized Reason
```

Example response:

```json
{
  "personalizedScore": 0.91,
  "personalizedReason": "Recommended because it is faster while remaining within your usual travel budget."
}
```

---

# ✨ Features

## 🔎 Multi-Modal Search

Search multiple transportation modes from one interface:

- 🚕 Cabs
- 🚌 Buses
- 🚆 Trains
- ✈️ Flights

Results can be compared based on:

- Price
- Duration
- Departure
- Arrival
- Transportation type
- Availability
- Comfort
- Personalized score

---

## 🏙️ Dynamic City Autocomplete

TripSpot provides dynamic city suggestions while users type their origin and destination.

Example:

```text
From:
Luckn...
      ↓
Lucknow
Lucknow Airport
Lucknow Railway Station

To:
Del...
      ↓
Delhi
New Delhi
Delhi Airport
```

The search interface is designed to support multi-city travel configuration.

---

# 🤖 AI Travel Assistant

TripSpot includes a floating conversational assistant that can help users with travel-related queries.

Example:

```text
User:
What's the cheapest way to travel from Lucknow to Delhi?

AI:
Based on current available options, the bus is the
lowest-cost option, while the train provides a better
balance between price and travel time.
```

The interface also supports voice input.

---

# 💳 Checkout & Payment Flow

TripSpot provides a detailed checkout experience before booking.

The checkout page can display:

```text
Base Fare             ₹2,500
Taxes                  ₹300
Service Fee             ₹99
Convenience Fee         ₹50
────────────────────────────
Total                 ₹2,949
```

This provides transparent pricing before the user confirms a booking.

---

# 🔐 Authentication & Security

TripSpot uses Spring Security for backend authentication.

### Authentication mechanisms

- JWT authentication
- Stateless sessions
- Password-based authentication
- WebAuthn / Passkey support
- Browser biometric authentication where supported

### Request flow

```text
Login
  │
  ▼
Spring Security
  │
  ▼
JWT Generated
  │
  ▼
Frontend Stores Token
  │
  ▼
Authorization Header
  │
  ▼
JwtAuthFilter
  │
  ▼
Authenticated Request
```

Protected endpoints require a valid JWT.

---

# 🧩 Provider Architecture

TripSpot is designed around a pluggable transportation-provider architecture.

Conceptually:

```text
                 Transport Aggregator
                         │
          ┌──────────────┼──────────────┐
          ▼              ▼              ▼
      CabProvider    BusProvider    TrainProvider
          │              │              │
          └──────────────┼──────────────┘
                         ▼
                  FlightProvider
                         │
                         ▼
                  Normalized Results
```

Each provider can implement a common interface so that additional transportation services can be integrated without rewriting the core search system.

---

# 🛠️ Technology Stack

| Layer             | Technology          |
| ----------------- | ------------------- |
| Frontend          | React               |
| Build Tool        | Vite                |
| Styling           | Tailwind CSS v4     |
| Backend           | Spring Boot 3       |
| Language          | Java 21             |
| Security          | Spring Security     |
| Authentication    | JWT + WebAuthn      |
| ORM               | Spring Data JPA     |
| Database          | H2                  |
| ML Service        | FastAPI             |
| ML Language       | Python 3.12+        |
| Clustering        | scikit-learn KMeans |
| Ranking           | XGBoost             |
| Validation        | Pydantic            |
| API Communication | REST                |
| Architecture      | Microservice-based  |

---

# 📂 Project Structure

```text
TripSpot/
│
├── backend/
│   ├── src/
│   │   └── main/
│   │       └── java/
│   │           └── com/
│   │               └── tripspot/
│   │                   │
│   │                   ├── config/
│   │                   │   └── Security & JWT configuration
│   │                   │
│   │                   ├── controller/
│   │                   │   ├── AuthController
│   │                   │   ├── SearchController
│   │                   │   ├── BookingController
│   │                   │   └── UserController
│   │                   │
│   │                   ├── dto/
│   │                   │   └── Request/Response DTOs
│   │                   │
│   │                   ├── model/
│   │                   │   └── JPA entities
│   │                   │
│   │                   ├── provider/
│   │                   │   └── Transport provider integrations
│   │                   │
│   │                   ├── repository/
│   │                   │   └── Spring Data repositories
│   │                   │
│   │                   └── service/
│   │                       ├── Authentication
│   │                       ├── JWT
│   │                       ├── Aggregator
│   │                       └── WebAuthn
│   │
│   └── pom.xml
│
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   │   └── Axios & API clients
│   │   │
│   │   ├── components/
│   │   │   └── Reusable UI components
│   │   │
│   │   ├── context/
│   │   │   ├── Authentication
│   │   │   └── Theme
│   │   │
│   │   ├── layouts/
│   │   │   └── Application layouts
│   │   │
│   │   ├── lib/
│   │   │   └── WebAuthn & utilities
│   │   │
│   │   └── pages/
│   │       ├── Dashboard
│   │       ├── Explore
│   │       ├── Wishlist
│   │       └── PaymentPage
│   │
│   ├── package.json
│   └── vite.config.js
│
├── ml-service/
│   ├── app/
│   │   ├── main.py
│   │   ├── features.py
│   │   ├── schemas.py
│   │   ├── train_persona_model.py
│   │   └── train_ranking_model.py
│   │
│   ├── data/
│   │   └── Training datasets
│   │
│   ├── models/
│   │   └── Serialized ML models
│   │
│   └── requirements.txt
│
└── README.md
```

---

# ⚙️ Prerequisites

Make sure the following are installed:

### Node.js

Recommended:

```text
Node.js 18+
```

### Java

```text
Java 21
```

### Maven

Maven 3.9+ recommended.

### Python

```text
Python 3.12+
```

---

# 🚀 Getting Started

## 1. Clone the Repository

```bash
git clone https://github.com/OfficialTanishGupta/TripSpot.git

cd TripSpot
```

Replace the repository URL with the actual TripSpot repository URL if the project uses a different repository name.

---

# ☕ 2. Start the Spring Boot Backend

Open a terminal:

```bash
cd backend
```

### Windows

```bash
.\mvnw.cmd spring-boot:run
```

### Linux / macOS

```bash
./mvnw spring-boot:run
```

Backend:

```text
http://localhost:8080
```

Health endpoint:

```text
http://localhost:8080/actuator/health
```

---

# 🐍 3. Start the ML Service

Open another terminal:

```bash
cd ml-service
```

Create a virtual environment:

```bash
python -m venv venv
```

### Windows PowerShell

```powershell
.\venv\Scripts\Activate.ps1
```

### Linux / macOS

```bash
source venv/bin/activate
```

Install dependencies:

```bash
pip install -r requirements.txt
```

Start FastAPI:

```bash
python -m uvicorn app.main:app --reload --port 8000
```

ML service:

```text
http://localhost:8000
```

FastAPI documentation:

```text
http://localhost:8000/docs
```

---

# ⚛️ 4. Start the React Frontend

Open another terminal:

```bash
cd frontend
```

Install dependencies:

```bash
npm install
```

Start development server:

```bash
npm run dev
```

Frontend:

```text
http://localhost:5173
```

---

# 🔧 Environment Configuration

Create:

```text
frontend/.env
```

Add:

```env
VITE_API_BASE_URL=http://localhost:8080
```

For production, use the deployed backend URL instead.

---

# 🔗 Service URLs

During local development:

| Service       | URL                                     |
| ------------- | --------------------------------------- |
| Frontend      | `http://localhost:5173`                 |
| Spring Boot   | `http://localhost:8080`                 |
| FastAPI ML    | `http://localhost:8000`                 |
| FastAPI Docs  | `http://localhost:8000/docs`            |
| Spring Health | `http://localhost:8080/actuator/health` |
| H2 Console    | Configurable through Spring Boot        |

---

# 🔌 API Overview

## Authentication

```http
POST /api/auth/**
```

Public endpoints for:

- Registration
- Login
- Authentication challenges
- WebAuthn / Passkey operations

---

## Search

```http
GET /api/search/**
```

Public endpoint for:

- Route search
- Transportation comparison
- Fare information
- Aggregated provider results

---

## Health

```http
GET /actuator/health
```

Used for service health monitoring.

---

## Protected APIs

```text
/api/**
```

Most account-specific APIs require JWT authentication.

Examples include:

- User profile
- Bookings
- Wishlist
- Personalized recommendations
- Account settings
- Travel history

---

# 🔄 End-to-End Search Flow

A typical personalized search follows this pipeline:

```text
User
 │
 │ Search Request
 ▼
React Frontend
 │
 │ GET /api/search
 ▼
Spring Boot API
 │
 ▼
Transport Aggregator
 │
 ├──── Cab Provider
 ├──── Bus Provider
 ├──── Train Provider
 └──── Flight Provider
 │
 ▼
Normalized Transport Results
 │
 ▼
User Context / Preferences
 │
 ▼
FastAPI ML Service
 │
 ├── Feature Engineering
 │
 ├── KMeans Persona
 │
 └── XGBoost Ranking
 │
 ▼
Personalized Results
 │
 ▼
Spring Boot
 │
 ▼
React Frontend
 │
 ▼
Sorted Travel Options
```

---

# 📊 Example Personalized Result

```json
{
  "provider": "Example Transport Provider",
  "mode": "TRAIN",
  "origin": "Lucknow",
  "destination": "Delhi",
  "price": 1450,
  "durationMinutes": 510,
  "personalizedScore": 0.87,
  "personalizedReason": "Good balance between travel time and price based on your previous choices."
}
```

The frontend can use `personalizedScore` to rank the available options.

---

# 🧪 Machine Learning Pipeline

## Persona Model

Training script:

```bash
python app/train_persona_model.py
```

The model:

```text
Synthetic / Historical User Data
             │
             ▼
      Feature Engineering
             │
             ▼
          KMeans
             │
             ▼
      User Persona Cluster
             │
             ▼
       Serialized Model
```

---

## Ranking Model

Training script:

```bash
python app/train_ranking_model.py
```

Pipeline:

```text
User Features
     +
Route Features
     +
Persona Features
     │
     ▼
Feature Engineering
     │
     ▼
XGBoost
     │
     ▼
Preference Score
```

Serialized models are stored inside:

```text
ml-service/models/
```

---

# 🧪 Testing Strategy

TripSpot uses multiple levels of testing.

### Backend

Test:

- Authentication
- JWT validation
- Search APIs
- Booking APIs
- Provider aggregation
- Error handling

### ML Service

Test:

- Feature validation
- Persona prediction
- Ranking prediction
- Invalid request handling
- Model loading

### Integration

The primary integration pipeline is:

```text
Frontend
   ↓
Spring Boot
   ↓
Aggregator
   ↓
FastAPI
   ↓
Ranking
   ↓
Spring Boot
   ↓
Frontend
```

Integration tests should verify that data is preserved correctly throughout this pipeline.

---

# 🐛 Current Development Roadmap

## 🔴 Priority 1 — End-to-End Persona Verification

Validate that the following values successfully travel through the complete authenticated flow:

```text
User
 ↓
Spring Boot
 ↓
ML Service
 ↓
Spring Boot
 ↓
Frontend
```

Required fields:

```text
personalizedScore
personalizedReason
persona
```

---

## 🔴 Priority 2 — JWT Exception Handling

Improve:

```text
JwtAuthFilter#extractUserId
```

Invalid JWTs should not result in:

```text
HTTP 500
```

Instead, malformed, expired, or invalid tokens should be handled gracefully and return an appropriate authentication response such as:

```text
HTTP 401 Unauthorized
```

---

## 🟠 Priority 3 — Pipeline Integration Testing

Add automated tests covering:

```text
Aggregator
    ↓
ML Request
    ↓
FastAPI
    ↓
ML Response
    ↓
Aggregator
    ↓
API Response
```

---

# 🗺️ Future Roadmap

### Phase 1 — Core Platform

- [x] React frontend
- [x] Spring Boot backend
- [x] REST API architecture
- [x] Authentication
- [x] Search interface
- [x] Transportation comparison

### Phase 2 — AI Personalization

- [x] ML microservice
- [x] KMeans persona clustering
- [x] XGBoost ranking
- [x] Personalized score
- [x] Personalized recommendation reason

### Phase 3 — Reliability

- [ ] End-to-end persona verification
- [ ] JWT exception handling
- [ ] Integration test suite
- [ ] Provider failure handling
- [ ] Request timeout handling
- [ ] ML-service fallback strategy

### Phase 4 — Production Data

- [ ] Replace synthetic transportation data with real provider integrations
- [ ] Provider API authentication
- [ ] Real-time availability
- [ ] Dynamic pricing
- [ ] Caching
- [ ] Rate-limit management

### Phase 5 — Production Infrastructure

- [ ] PostgreSQL migration
- [ ] Redis caching
- [ ] Docker containers
- [ ] CI/CD pipeline
- [ ] Centralized logging
- [ ] Monitoring
- [ ] Production deployment

### Phase 6 — Advanced AI

- [ ] Online preference learning
- [ ] Recommendation feedback loop
- [ ] Context-aware recommendations
- [ ] Personalized travel planning
- [ ] LLM-powered travel assistant
- [ ] Natural-language trip search

---

# 🔒 Security Considerations

TripSpot follows a security-first backend architecture.

Important practices include:

- Stateless JWT authentication
- Spring Security filters
- Protected API routes
- Credential validation
- WebAuthn / Passkeys
- Server-side authorization
- Environment-based configuration
- No hardcoded secrets
- Input validation
- Exception handling
- Secure authentication failure responses

Production deployments should additionally use:

- HTTPS
- Secure cookies where applicable
- Secret management
- Database encryption
- API rate limiting
- CORS restrictions
- Request logging and monitoring

---

# 📈 Scalability

The architecture separates the application into independent services:

```text
React
  │
  ▼
Spring Boot
  │
  ├───────────────► Database
  │
  └───────────────► ML Service
```

This allows the ML service to scale independently from the main application.

For example:

```text
                    Load Balancer
                         │
             ┌───────────┴───────────┐
             ▼                       ▼
       Spring Boot #1          Spring Boot #2
             │                       │
             └───────────┬───────────┘
                         ▼
                     ML Service
                  ┌──────┴──────┐
                  ▼             ▼
               ML #1          ML #2
```

Future production infrastructure can introduce:

- Docker
- Kubernetes
- Redis
- PostgreSQL
- Message queues
- Horizontal scaling

---

# 🎨 UI/UX Philosophy

TripSpot follows a modern, minimalist design approach inspired by contemporary travel and technology platforms.

Design principles:

- Clean layouts
- Minimal visual clutter
- Responsive design
- Clear pricing
- Strong typography
- Smooth interactions
- Accessible controls
- Mobile-friendly interfaces
- Consistent component system

The frontend is built using:

```text
React
+
Vite
+
Tailwind CSS v4
```

---

# 💡 Why TripSpot?

Traditional travel platforms often focus on a single transportation category.

TripSpot aims to solve a broader problem:

> **"What is the best way for me to travel from A to B?"**

Instead of simply asking:

```text
What is the cheapest option?
```

TripSpot asks:

```text
What is the best option for THIS user?
```

That distinction enables personalized travel recommendations based on individual priorities.

---

# 🏆 Project Highlights

TripSpot demonstrates practical experience across multiple engineering domains:

### Frontend Engineering

- React
- Vite
- Tailwind CSS
- State management
- API integration
- Responsive UI

### Backend Engineering

- Java 21
- Spring Boot
- REST APIs
- Spring Security
- JWT
- JPA
- Database design
- Service architecture

### Machine Learning

- Python
- scikit-learn
- KMeans
- XGBoost
- Feature engineering
- Model serialization
- ML inference APIs

### System Design

- Microservices
- Service-to-service communication
- API aggregation
- Authentication architecture
- Provider abstraction
- Fault handling
- Scalable service boundaries

---

# 📌 Development Status

```text
Frontend             ████████████████████  Advanced
Backend              ███████████████████░  Advanced
Authentication      ██████████████████░░  In Progress
Transport Aggregator ████████████████░░░░  In Progress
ML Personalization  █████████████████░░░  In Progress
Integration Testing  ████████░░░░░░░░░░░░  Planned
Production Providers ██████░░░░░░░░░░░░░░  Planned
Production Infra    ████░░░░░░░░░░░░░░░░  Planned
```

TripSpot is currently under active development.

---

# 📄 License

This project is currently unlicensed.

A suitable open-source license such as MIT may be added in the future.

---

# 👨‍💻 Author

**Tanish Gupta**

AI/ML Engineer | Full-Stack Developer

GitHub: `OfficialTanishGupta`

Portfolio: `tanishgupta.site`

---

## ⭐ If You Like This Project

If TripSpot is useful or interesting, consider giving the repository a ⭐ and following the development of the project.

---

> **TripSpot — Search less. Compare smarter. Travel better.**
