from fastapi import APIRouter, Depends, HTTPException
from ._deps import db
from ..schemas import RegisterIn, LoginIn
from ..security import hash_password, verify_password, create_access_token, current_user
from ..utils import serialize, utcnow

router = APIRouter(prefix="/api/auth", tags=["Authentication"])

@router.post("/register", status_code=201)
async def register(payload: RegisterIn):
    email = payload.email.lower()
    if await db().users.find_one({"email": email}):
        raise HTTPException(409, "An account with this email already exists")
    user = {"name": payload.name.strip(), "email": email, "password_hash": hash_password(payload.password), "created_at": utcnow()}
    result = await db().users.insert_one(user)
    user["_id"] = result.inserted_id
    return {"access_token": create_access_token(str(result.inserted_id)), "token_type": "bearer", "user": {"id": str(result.inserted_id), "name": user["name"], "email": email}}

@router.post("/login")
async def login(payload: LoginIn):
    user = await db().users.find_one({"email": payload.email.lower()})
    if not user or not verify_password(payload.password, user["password_hash"]):
        raise HTTPException(401, "Incorrect email or password")
    return {"access_token": create_access_token(str(user["_id"])), "token_type": "bearer", "user": {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}}

@router.get("/me")
async def me(user=Depends(current_user)):
    return {"id": str(user["_id"]), "name": user["name"], "email": user["email"]}
