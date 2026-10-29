from collections import defaultdict
from datetime import date, timedelta
from fastapi import APIRouter, Depends
from ..db import get_db
from ..security import current_user

router = APIRouter(prefix="/api/dashboard", tags=["Dashboard"])

def monthly_amount(amount: float, frequency: str) -> float:
    return amount * {"weekly": 52 / 12, "monthly": 1, "quarterly": 1 / 3, "yearly": 1 / 12}.get(frequency, 1)

@router.get("/summary")
async def summary(user=Depends(current_user)):
    uid = str(user["_id"])
    transactions = [doc async for doc in get_db().transactions.find({"user_id": uid})]
    subscriptions = [doc async for doc in get_db().subscriptions.find({"user_id": uid, "active": True})]
    now = date.today()
    this_month = [t for t in transactions if str(t.get("date", ""))[:7] == now.strftime("%Y-%m")]
    income = sum(float(t["amount"]) for t in this_month if t["type"] == "income")
    expenses = sum(float(t["amount"]) for t in this_month if t["type"] == "expense")
    prev = date(now.year - (now.month == 1), now.month - 1 or 12, 1).strftime("%Y-%m")
    prev_expenses = sum(float(t["amount"]) for t in transactions if t["type"] == "expense" and str(t.get("date", ""))[:7] == prev)
    horizon = (now + timedelta(days=30)).isoformat()
    upcoming = sorted(
        [{"id": str(s["_id"]), "name": s["name"], "amount": s["amount"], "frequency": s["frequency"], "next_billing_date": s["next_billing_date"]}
         for s in subscriptions if s["next_billing_date"] <= horizon],
        key=lambda s: s["next_billing_date"])
    categories = defaultdict(float)
    for t in this_month:
        if t["type"] == "expense": categories[t.get("category", "Other")] += float(t["amount"])
    monthly = defaultdict(lambda: {"income": 0.0, "expense": 0.0})
    for t in transactions:
        month = str(t.get("date", ""))[:7]
        if len(month) == 7:
            monthly[month][t["type"]] += float(t["amount"])
    trend = [{"month": month, **values} for month, values in sorted(monthly.items())[-6:]]
    sub_cost = sum(monthly_amount(float(s["amount"]), s["frequency"]) for s in subscriptions)
    return {
        "currency": "INR",
        "month": now.strftime("%Y-%m"),
        "income": round(income, 2),
        "expenses": round(expenses, 2),
        "balance": round(income - expenses, 2),
        "subscription_monthly_cost": round(sub_cost, 2),
        "category_breakdown": [{"category": k, "amount": round(v, 2)} for k, v in sorted(categories.items(), key=lambda x: -x[1])],
        "monthly_trend": trend,
        "prev_expenses": round(prev_expenses, 2),
        "savings_rate": round((income - expenses) / income * 100, 1) if income else None,
        "upcoming": upcoming,
        "transaction_count": len(transactions),
    }
