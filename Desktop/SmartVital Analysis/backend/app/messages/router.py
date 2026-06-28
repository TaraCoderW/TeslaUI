from fastapi import APIRouter, Depends, HTTPException, status
from typing import List
from pydantic import BaseModel
from datetime import datetime
from bson import ObjectId

from backend.app.database import messages_collection
from backend.app.auth.dependencies import get_current_user, require_role

router = APIRouter()

class MessageCreate(BaseModel):
    receiver_id: str
    text: str

class MessageResponse(BaseModel):
    id: str
    sender_id: str
    sender_role: str
    receiver_id: str
    text: str
    timestamp: str

@router.post("/", response_model=MessageResponse, status_code=status.HTTP_201_CREATED)
async def send_message(
    msg: MessageCreate,
    current_user: dict = Depends(get_current_user)
):
    new_message = {
        "sender_id": current_user["id"],
        "sender_role": current_user["role"],
        "receiver_id": msg.receiver_id,
        "text": msg.text,
        "timestamp": datetime.utcnow().isoformat()
    }
    result = await messages_collection.insert_one(new_message)
    new_message["id"] = str(result.inserted_id)
    return new_message

@router.get("/{other_user_id}", response_model=List[MessageResponse])
async def get_messages(
    other_user_id: str,
    current_user: dict = Depends(get_current_user)
):
    my_id = current_user["id"]
    
    # Fetch messages where I am sender and other is receiver, OR vice versa
    query = {
        "$or": [
            {"sender_id": my_id, "receiver_id": other_user_id},
            {"sender_id": other_user_id, "receiver_id": my_id}
        ]
    }
    
    cursor = messages_collection.find(query).sort("timestamp", 1)
    messages = await cursor.to_list(length=100)
    
    formatted_messages = []
    for m in messages:
        formatted_messages.append({
            "id": str(m["_id"]),
            "sender_id": m["sender_id"],
            "sender_role": m["sender_role"],
            "receiver_id": m["receiver_id"],
            "text": m["text"],
            "timestamp": m["timestamp"]
        })
        
    return formatted_messages
