# OrderHub

> A full-stack Inventory & Order Management System — manage products, customers, and orders with live stock tracking, an analytics dashboard, and a responsive React interface.

Built with FastAPI, PostgreSQL, and React, fully containerized with Docker Compose and deployed to the cloud.

## Live Demo

| Service | URL |
|---------|-----|
| **Frontend** (Vercel) | https://inventory-and-order-management-syst-seven.vercel.app |
| **Backend API** (Render) | https://inventory-backend-kqnf.onrender.com |
| **Interactive API docs** | https://inventory-backend-kqnf.onrender.com/docs |
| **Backend image** (Docker Hub) | https://hub.docker.com/r/mgomniscientecho28/inventory-backend |

> The backend runs on a free tier that sleeps after inactivity, so the first request after an idle period may take ~50 seconds to wake up. Subsequent requests are fast.

## Tech Stack

**Backend** — Python · FastAPI · async SQLAlchemy 2.0 · Alembic · Pydantic v2 · PostgreSQL
**Frontend** — React (Vite) · React Router · Axios · Recharts · TailwindCSS
**Infrastructure** — Docker · Docker Compose · Render (backend) · Vercel (frontend)

## Features

### Products
Full CRUD with unique SKU enforcement, price and stock validation, and an optional description. List endpoints support pagination and search by name or SKU.

### Customers
Create, view, edit, and delete customers with unique-email enforcement. Email is immutable after creation; name and phone remain editable. Phone numbers are captured with a country-code selector and validated for length and format.

### Orders
Multi-product orders with server-side total calculation. Stock availability is checked before an order is accepted, and confirmed stock is deducted atomically. Orders move through a tracked lifecycle — `pending → confirmed → shipped → delivered`, or `cancelled` at any point — with only valid transitions allowed. Cancelling or deleting an order restores the reserved stock.

### Inventory
A live view of stock levels with manual adjustments (e.g. receiving a shipment), each requiring a reason. Every stock movement — whether from an order, a cancellation, or a manual change — is recorded in an audit log, with the most recent entries shown per product.

### Dashboard & Analytics
A summary dashboard (total products, customers, orders, low-stock count, revenue) plus an analytics page with daily revenue over the last 30 days, order distribution by status, and the top-selling products, visualized with Recharts.

### Interface
Responsive layout with a collapsible sidebar, light/dark theme (persisted across sessions), toast notifications for every action, currency formatted in Indian Rupees, and considered empty/loading states throughout.

## Business Rules

All of the assignment's core rules are enforced both in application logic and at the database level:

- Product SKU and customer email are unique.
- Stock can never go negative (enforced by a database `CHECK` constraint).
- Orders are rejected when stock is insufficient.
- Creating an order automatically reduces stock; cancelling restores it.
- Order totals are always computed by the backend, never trusted from the client.
- All endpoints validate input and return meaningful HTTP status codes.

## Project Structure

```
inventory_and_order_management_system/
├── backend/
│   ├── app/
│   │   ├── api/routes/      # one file per resource (+ health, analytics)
│   │   ├── core/            # env-driven settings (pydantic-settings)
│   │   ├── db/              # async engine + session
│   │   ├── models/          # SQLAlchemy models
│   │   ├── schemas/         # Pydantic request/response schemas
│   │   └── main.py
│   ├── alembic/             # database migrations
│   ├── Dockerfile
│   └── requirements.txt
├── frontend/
│   ├── src/
│   │   ├── api/             # one Axios module per resource
│   │   ├── components/
│   │   ├── context/         # theme, toast, sidebar
│   │   ├── hooks/
│   │   ├── pages/
│   │   └── utils/           # currency + validation helpers
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── .env.example
└── README.md
```

## Implementation Notes

A few choices worth calling out for anyone reading the code:

- **Schema is managed with Alembic migrations** rather than `create_all`, so the database can evolve predictably. Migrations run automatically on backend startup.
- **Database integrity is enforced at the schema level** — unique constraints on SKU and email, a non-negative check on stock, and indexes on the most frequently queried columns.
- **Inventory changes are auditable** — a dedicated log table captures every stock movement with its reason and timestamp.
- **Configuration is entirely environment-driven** via pydantic-settings; there are no hardcoded URLs, ports, or credentials anywhere in the codebase.
- **A `/health` endpoint** supports deployment health checks.

## Running Locally

The entire stack runs with Docker Compose. You'll need Docker installed.

```bash
# 1. Clone
git clone https://github.com/MGCinder04/inventory-and-order-management-system.git
cd inventory-and-order-management-system

# 2. Create your environment file from the template
cp .env.example .env

# 3. Start everything (database, backend, frontend)
docker compose up --build
```

Then open:

- Frontend → http://localhost:3000
- Backend API docs → http://localhost:8000/docs

The backend waits for the database to be healthy, runs migrations, and then starts serving. PostgreSQL data persists in a named Docker volume across restarts.

## Configuration

All configuration comes from environment variables. See `.env.example` for the full list with placeholder values.

| Variable | Description |
|----------|-------------|
| `POSTGRES_USER` / `POSTGRES_PASSWORD` / `POSTGRES_DB` | Database credentials (Compose) |
| `DATABASE_URL` | Async PostgreSQL DSN (`postgresql+asyncpg://…`) |
| `BACKEND_CORS_ORIGINS` | JSON array of allowed frontend origins |
| `LOW_STOCK_THRESHOLD` | Units at or below which a product is flagged low-stock (default `10`) |
| `ANALYTICS_DEFAULT_DAYS` | Look-back window for analytics (default `30`) |
| `VITE_API_BASE_URL` | Backend URL the frontend calls (build-time) |

## API Overview

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/health` | Health check |
| `GET/POST` | `/products` | List (paginated, searchable) / create |
| `GET/PUT/DELETE` | `/products/{id}` | Retrieve / update / delete |
| `GET/POST` | `/customers` | List (paginated, searchable) / create |
| `GET/PUT/DELETE` | `/customers/{id}` | Retrieve / update / delete |
| `GET/POST` | `/orders` | List / create (multi-product) |
| `GET/DELETE` | `/orders/{id}` | Retrieve / cancel (restores stock) |
| `PATCH` | `/orders/{id}/status` | Advance or cancel order status |
| `GET` | `/inventory` | Stock levels with recent activity |
| `PATCH` | `/inventory/{product_id}` | Manual stock adjustment |
| `GET` | `/analytics/summary` | Dashboard & analytics metrics |

Full interactive documentation is available at `/docs` on the running backend.

## Deployment

- **Backend** is deployed on Render from this repository's Docker image, backed by a managed PostgreSQL instance. The backend image is also published to Docker Hub.
- **Frontend** is deployed on Vercel, built from the `frontend/` directory with `VITE_API_BASE_URL` pointing at the live backend.
