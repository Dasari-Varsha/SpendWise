from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .config import settings
from .db import connect_db, close_db
from .routes import auth, transactions, subscriptions, dashboard

@asynccontextmanager
async def lifespan(app: FastAPI):
    await connect_db()
    yield
    await close_db()

app = FastAPI(title="SpendWise API", version="1.0.0", description="Expense and subscription management REST API", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=[settings.frontend_origin], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
app.include_router(auth.router)
app.include_router(transactions.router)
app.include_router(subscriptions.router)
app.include_router(dashboard.router)

@app.get("/health")
async def health():
    return {"status": "ok"}
