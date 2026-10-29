from motor.motor_asyncio import AsyncIOMotorClient
from .config import settings

client: AsyncIOMotorClient | None = None
db = None

async def connect_db():
    global client, db
    client = AsyncIOMotorClient(settings.mongodb_url)
    db = client[settings.mongodb_database]
    await client.admin.command("ping")
    await db.users.create_index("email", unique=True)
    await db.transactions.create_index([("user_id", 1), ("date", -1)])
    await db.subscriptions.create_index([("user_id", 1), ("created_at", -1)])

async def close_db():
    global client
    if client:
        client.close()

def get_db():
    if db is None:
        raise RuntimeError("Database is not initialized")
    return db
