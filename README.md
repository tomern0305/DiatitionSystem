# Dietitian System

A hospital dietitian management system for managing food products, meals, and staff.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React + TypeScript + Tailwind CSS + Vite |
| Backend | Python + Flask |
| Database | PostgreSQL (Docker) with pgvector |
| Storage | Supabase (images) |

## Project Structure

```
DiatitionSystem/
├── Client/        # React frontend
│   └── src/
│       ├── pages/
│       ├── components/
│       └── context/
└── Server/        # Flask backend
    ├── routes/
    ├── models.py
    └── scripts/
```

## Getting Started

### 1. Database
```bash
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
