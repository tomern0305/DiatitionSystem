# Dietitian System

A hospital dietitian management system for managing food products, meals, and staff.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | Python + Flask |
| Database | PostgreSQL (Docker) with pgvector |
| Storage | Supabase (images) |

## System Layout

The repository is organized by concern — each top-level directory has a single goal:

```
DiatitionSystem/
├── Client/                     # Production web app — React frontend (products, meals, settings, admin)
├── Server/                     # REST API — Flask backend: business logic, DB models, and AI/ML endpoints
├── Data Base/                  # Database setup — PostgreSQL via Docker (compose file + seed backup)
├── Docs/                       # Project documentation — requirements, design docs, literature review, presentations
├── MachineLearning/            # ML exploration — notebooks and datasets for nutrition clustering & KNN similarity
├── POC-NaturalLanguageSearch/  # Early-stage proof-of-concept — where we tried natural-language (NLP) product search
└── Prototype/                  # Early-stage prototype of the app, built before the current Client/Server
```

**Active** — `Client/`, `Server/`, and `Data Base/` run the live system, with `MachineLearning/` and `Docs/` supporting it.

**Early stages** — `POC-NaturalLanguageSearch/` and `Prototype/` are from the early stages of the project and are kept for reference: the NLP search was first tried in the POC, and `Prototype/` was an earlier version of the app.

## Getting Started

### 1. Database
```bash
cd "Data Base"
docker-compose up -d
```

### 2. Backend
```bash
cd Server
pip install -r requirements.txt
python app.py        # Runs on http://localhost:5000
```

### 3. Frontend
```bash
cd Client
npm install
npm run dev          # Runs on http://localhost:5173
```

## User Roles

| Role | Access |
|------|--------|
| Admin | Full access + user management |
| Dietitian | Products, meals, settings |
| Lineworker | View meals and products |
