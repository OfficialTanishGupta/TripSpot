# TripSpot

An all-in-one travel platform designed to compare fares across cabs, trains, buses, and flights, delivering highly personalized route recommendations tailored to user travel habits.

## 📁 Project Architecture & Directory Structure

TripSpot is built as a containerized, multi-service application:

```text
TripSpot/
├── backend/            # Primary API architecture and business logic
├── frontend/           # Modern, responsive, and installable PWA UI
├── ml-service/         # Intelligent ML microservice for profile clustering & ranking
├── .github/            # GitHub Actions CI/CD workflows and issue templates
├── .vscode/            # Visual Studio Code workspace settings
├── venv/               # Python local virtual environment (ignored in git)
├── .gitignore          # Git ignore rules
├── docker-compose.yml  # Docker multi-container orchestration
└── tripspot-postman-collection.json  # Pre-configured API testing endpoints
```

## 🚀 Key Features

- **Multi-Modal Comparison:** Compare prices and durations across four transit types in one place.
- **Smart Personalization:** Learns travel preferences to rank the best options for each user.
- **Mobile-First Experience:** Fully installable on your phone for quick, on-the-go access.

## ⚙️ Tech Stack

- **Backend:** Robust and scalable multi-service API architecture.
- **Data & AI:** Intelligent machine learning microservice for user personalization.
- **Frontend:** Responsive, installable Progressive Web Application (PWA).
- **DevOps & Testing:** Fully containerized setup via Docker and API-tested via Postman.

## 🚧 Project Status

- **Status:** 🛠️ **Development & Implementation Phase.**
- **Current Focus:** Integrating backend APIs, connecting the machine learning microservice, and styling the frontend components.

## 🛠️ Roadmap & Progress

- [x] Initialize git repository and unified directory structure.
- [x] Configure core project settings (`.vscode`, `.gitignore`).
- [x] Draft unified Postman collection for API schemas.
- [x] Set up Docker configurations for multi-container local orchestration.
- [ ] Scaffold functional code blocks inside `frontend`, `backend`, and `ml-service`.
- [ ] Establish communication pipelines between services.
