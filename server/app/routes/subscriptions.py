from fastapi import APIRouter, Depends, HTTPException
from bson import ObjectId
from ..db import get_db
from ..security import current_user
from ..schemas import SubscriptionIn, SubscriptionPatch
from ..utils import serialize, utcnow

router = APIRouter(prefix="/api/subscriptions", tags=["Subscriptions"])

@router.get("")
async def list_subscriptions(user=Depends(current_user)):
    cursor = get_db().subscriptions.find({"user_id": str(user["_id"])}).sort("created_at", -1)
    return [serialize(doc) async for doc in cursor]

@router.post("", status_code=201)
async def create_subscription(payload: SubscriptionIn, user=Depends(current_user)):
    doc = payload.model_dump()
    doc["next_billing_date"] = doc["next_billing_date"].isoformat()
    doc.update(user_id=str(user["_id"]), created_at=utcnow())
    result = await get_db().subscriptions.insert_one(doc)
    doc["_id"] = result.inserted_id
    return serialize(doc)

@router.patch("/{subscription_id}")
async def update_subscription(subscription_id: str, payload: SubscriptionPatch, user=Depends(current_user)):
    if not ObjectId.is_valid(subscription_id): raise HTTPException(404, "Subscription not found")
    changes = payload.model_dump(exclude_unset=True, exclude_none=True)
    if "next_billing_date" in changes: changes["next_billing_date"] = changes["next_billing_date"].isoformat()
    result = await get_db().subscriptions.find_one_and_update(
        {"_id": ObjectId(subscription_id), "user_id": str(user["_id"])},
        {"$set": changes}, return_document=True
    )
    if not result: raise HTTPException(404, "Subscription not found")
    return serialize(result)

@router.delete("/{subscription_id}", status_code=204)
async def delete_subscription(subscription_id: str, user=Depends(current_user)):
    if not ObjectId.is_valid(subscription_id): raise HTTPException(404, "Subscription not found")
    result = await get_db().subscriptions.delete_one({"_id": ObjectId(subscription_id), "user_id": str(user["_id"])})
    if not result.deleted_count: raise HTTPException(404, "Subscription not found")
