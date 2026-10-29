from datetime import datetime, date, timezone
from bson import ObjectId

def serialize(doc: dict) -> dict:
    result = dict(doc)
    result["id"] = str(result.pop("_id"))
    result.pop("user_id", None)
    for key, value in list(result.items()):
        if isinstance(value, (datetime, date)):
            result[key] = value.isoformat()
    return result

def utcnow():
    return datetime.now(timezone.utc)

def object_id(value: str) -> ObjectId | None:
    return ObjectId(value) if ObjectId.is_valid(value) else None
