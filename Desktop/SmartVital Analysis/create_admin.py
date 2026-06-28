import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add backend to path so we can import auth utils
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
from app.auth.utils import get_password_hash
from app.database import get_db

MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "smartvital_db" # Or test

async def add_admin(email, password):
    client = AsyncIOMotorClient(MONGO_URI)
    dbs_to_try = ["test", "smartvital", "smartvital_db"]
    
    # Check if user already exists
    user = None
    db_used = "test"
    for db_name in dbs_to_try:
        db = client[db_name]
        users_collection = db["users"]
        user = await users_collection.find_one({"email": email})
        if user:
            db_used = db_name
            break
            
    if user:
        print(f"User {email} already exists. Updating to admin and setting password.")
        hashed_password = get_password_hash(password)
        await client[db_used]["users"].update_one(
            {"email": email},
            {"$set": {"role": "admin", "hashed_password": hashed_password}}
        )
        print("Updated successfully.")
    else:
        # Find which db has users
        for db_name in dbs_to_try:
            if await client[db_name]["users"].count_documents({}) > 0:
                db_used = db_name
                break
                
        print(f"Creating new admin user {email} in database '{db_used}'.")
        hashed_password = get_password_hash(password)
        new_user = {
            "email": email,
            "hashed_password": hashed_password,
            "role": "admin",
            "full_name": "Rahul Agarwal",
            "is_active": True,
            "is_verified": True,
            "is_onboarded": True
        }
        await client[db_used]["users"].insert_one(new_user)
        print("Admin user created successfully.")

if __name__ == "__main__":
    asyncio.run(add_admin("rahulagarwal40046@gmail.com", "21042008"))
