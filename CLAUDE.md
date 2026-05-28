# Project: Inventory & Order Management System

## Tech Stack
- Backend: Python, FastAPI, SQLAlchemy (async), Alembic, PostgreSQL, Pydantic v2
- Frontend: React (Vite), React Router, Axios, Recharts, TailwindCSS
- Containerization: Docker, Docker Compose
- Deployment: Backend on Render, Frontend on Vercel

## Project Structure
inventory_and_order_management_system/
├── backend/
│   ├── app/
│   │   ├── api/routes/
│   │   ├── core/
│   │   ├── db/
│   │   ├── models/
│   │   ├── schemas/
│   │   └── main.py
│   ├── alembic/
│   ├── Dockerfile
│   ├── .dockerignore
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── hooks/
│   │   └── main.jsx
│   ├── Dockerfile
│   ├── .dockerignore
│   └── package.json
├── .env.example
├── docker-compose.yml
└── README.md

## Coding Style Rules (MUST follow always)
- Never hardcode values — always use named variables or constants with self-explanatory names
- Environment-sensitive values (DB URLs, ports, secrets) always come from environment variables
- No magic numbers or strings inline in logic
- Comments only when something genuinely complex needs explaining — not for obvious code
- Use descriptive names that make the code self-documenting

## Backend Conventions
- All routes go in app/api/routes/ — one file per resource (products.py, customers.py, orders.py, inventory.py)
- All SQLAlchemy models go in app/models/ — one file per model
- All Pydantic schemas go in app/schemas/ — one file per resource
- Database session and engine config go in app/db/
- App-wide config (env vars loaded via pydantic-settings) goes in app/core/config.py
- Use async SQLAlchemy throughout
- Return meaningful HTTP status codes and error messages always

## Frontend Conventions
- One component per file in src/components/
- One page per file in src/pages/
- All API calls go through src/api/ — one file per resource
- Use environment variable VITE_API_BASE_URL for all API base URLs — never hardcode the URL
