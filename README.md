# SpendWise – Expense Manager

A full-stack portfolio starter built with React, TypeScript, FastAPI, and MongoDB.

## Features

- JWT-based registration and login
- Add, edit, delete, filter, and paginate transactions
- Track recurring subscriptions and monthly subscription costs
- Dashboard cards for income, expenses, and net balance
- Category-wise spending breakdown and monthly trends
- FastAPI request validation with Pydantic
- MongoDB persistence using Motor
- Responsive interface

> Portfolio starter: run it locally, test the flows, and customize it before presenting it as production-ready. It does not connect to banks or process payments.

## Requirements

- Python 3.11+
- Node.js 20+
- MongoDB local instance or MongoDB Atlas connection string

## 1. Configure the backend

Open a terminal in `server/`:

```powershell
python -m venv .venv
.\.venv\Scripts\Activate.ps1
pip install -r requirements.txt
Copy-Item .env.example .env
```

Edit `server/.env` and set `MONGODB_URL` and a long random `JWT_SECRET`.

Start the API:

```powershell
uvicorn app.main:app --reload
```

API: http://localhost:8000  
Swagger docs: http://localhost:8000/docs

## 2. Configure the frontend

Open another terminal in `client/`:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

Open the URL printed by Vite, usually http://localhost:5173.

## API overview

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`
- `GET /api/transactions` — filters: `type`, `category`, `from_date`, `to_date`, `page`, `page_size`
- `POST /api/transactions`
- `PATCH /api/transactions/{id}`
- `DELETE /api/transactions/{id}`
- `GET /api/dashboard/summary`
- `GET /api/subscriptions`
- `POST /api/subscriptions`
- `PATCH /api/subscriptions/{id}`
- `DELETE /api/subscriptions/{id}`

## Notes

- Each user's data is scoped to their authenticated user ID.
- Subscription monthly cost is an estimate normalized from billing frequency.
- For production, add automated tests, stronger rate limiting, refresh-token strategy, deployment secrets management, backups, and security review.
