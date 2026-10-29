import re
from datetime import date
from fastapi import APIRouter, Depends, HTTPException, Query
from bson import ObjectId
from ..db import get_db
from ..security import current_user
from ..schemas import TransactionIn, TransactionPatch
from ..utils import serialize, utcnow

router = APIRouter(prefix="/api/transactions", tags=["Transactions"])

@router.get("")
async def list_transactions(
    type: str | None = None,
    category: str | None = None,
    q: str | None = None,
    from_date: date | None = None,
    to_date: date | None = None,
    page: int = Query(1, ge=1),
    page_size: int = Query(10, ge=1, le=100),
    user=Depends(current_user),
):
    query = {"user_id": str(user["_id"])}
    if type in ("expense", "income"): query["type"] = type
    if category: query["category"] = category
    if q:
        rx = {"$regex": re.escape(q.strip()), "$options": "i"}
        query["$or"] = [{"title": rx}, {"note": rx}, {"category": rx}]
    date_filter = {}
    if from_date: date_filter["$gte"] = from_date.isoformat()
    if to_date: date_filter["$lte"] = to_date.isoformat()
    if date_filter: query["date"] = date_filter
    collection = get_db().transactions
    total = await collection.count_documents(query)
    cursor = collection.find(query).sort("date", -1).skip((page - 1) * page_size).limit(page_size)
    items = [serialize(doc) async for doc in cursor]
    return {"items": items, "page": page, "page_size": page_size, "total": total, "pages": (total + page_size - 1) // page_size}

@router.post("", status_code=201)
async def create_transaction(payload: TransactionIn, user=Depends(current_user)):
    doc = payload.model_dump()
    doc["date"] = doc["date"].isoformat()
    doc.update(user_id=str(user["_id"]), created_at=utcnow())
    result = await get_db().transactions.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)

@router.patch("/{transaction_id}")
async def update_transaction(transaction_id: str, payload: TransactionPatch, user=Depends(current_user)):
    if not ObjectId.is_valid(transaction_id): raise HTTPException(404, "Transaction not found")
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if "date" in changes: changes["date"] = changes["date"].isoformat()
    if not changes: raise HTTPException(400, "No changes supplied")
    result = await get_db().transactions.find_one_and_update(
        {"_id": ObjectId(transaction_id), "user_id": str(user["_id"])},
        {"$set": changes}, return_document=True
    )
    if not result: raise HTTPException(404, "Transaction not found")
    return serialize(result)

@router.delete("/{transaction_id}", status_code=204)
async def delete_transaction(transaction_id: str, user=Depends(current_user)):
    if not ObjectId.is_valid(transaction_id): raise HTTPException(404, "Transaction not found")
    result = await get_db().transactions.delete_one({"_id": ObjectId(transaction_id), "user_id": str(user["_id"])})
    if not result.deleted_count: raise HTTPException(404, "Transaction not found")
