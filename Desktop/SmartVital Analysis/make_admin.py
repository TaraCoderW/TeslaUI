import asyncio
import sys
from motor.motor_asyncio import AsyncIOMotorClient

# Adjust this if your MongoDB URI is different
MONGO_URI = "mongodb://localhost:27017"
DB_NAME = "test" # Change to your actual DB name if different, default from fastAPI is usually test or smartvital

async def make_admin(email: str):
    client = AsyncIOMotorClient(MONGO_URI)
    
    # We will try a few common db names if it's not specified
    dbs_to_try = ["test", "smartvital", "smartvital_db"]
    
    user = None
    db_used = None
    
    for db_name in dbs_to_try:
        db = client[db_name]
        users_collection = db["users"]
        user = await users_collection.find_one({"email": email})
        if user:
            db_used = db_name
            break
            
    if not user:
        print(f"[Error] Could not find any user with email '{email}' in the database.")
        print("Please sign up as a patient first using this email, then run this script again.")
        return

    users_collection = client[db_used]["users"]
    
    # Update the user's role to admin
    result = await users_collection.update_one(
        {"email": email},
        {"$set": {"role": "admin"}}
    )
    
    if result.modified_count > 0:
        print(f"[Success] The account '{email}' has been promoted to Admin.")
        print("You can now log in and access the Admin Dashboard.")
    else:
        print(f"[Warning] The account '{email}' is already an admin or no changes were made.")

if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python make_admin.py <your_email>")
        sys.exit(1)
        
    target_email = sys.argv[1]
    asyncio.run(make_admin(target_email))
