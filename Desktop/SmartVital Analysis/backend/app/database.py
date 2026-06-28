from motor.motor_asyncio import AsyncIOMotorClient
from backend.app.config import settings

client = AsyncIOMotorClient(settings.MONGODB_URI, serverSelectionTimeoutMS=2000)
db = client.get_default_database()

# Define collections
users_collection = db["users"]
patient_profiles_collection = db["patient_profiles"]
doctor_profiles_collection = db["doctor_profiles"]
health_records_collection = db["health_records"]
predictions_collection = db["predictions"]
clinical_notes_collection = db["clinical_notes"]
devices_collection = db["devices"]
otp_sessions_collection = db["otp_sessions"]
refresh_tokens_collection = db["refresh_tokens"]
medications_collection = db["medications"]
lab_results_collection = db["lab_results"]
symptoms_collection = db["symptoms"]
appointments_collection = db["appointments"]
messages_collection = db["messages"]
audit_logs_collection = db["audit_logs"]
permissions_collection = db["permissions"]

async def init_db():
    """Initialize database indexes"""
    try:
        # Unique email for users
        await users_collection.create_index("email", unique=True)
        
        # TTL Index for OTPs (10 minutes)
        await otp_sessions_collection.create_index("created_at", expireAfterSeconds=600)
        
        # TTL Index for Refresh Tokens (7 days)
        await refresh_tokens_collection.create_index("expires_at", expireAfterSeconds=0)
        
        # Indexes for fast querying
        await patient_profiles_collection.create_index("user_id", unique=True)
        await doctor_profiles_collection.create_index("user_id", unique=True)
        await health_records_collection.create_index([("user_id", 1), ("date", -1)])
        await audit_logs_collection.create_index("timestamp", expireAfterSeconds=2592000) # 30 day retention
        print("Database initialized successfully.")
    except Exception as e:
        print(f"Warning: Could not connect to MongoDB. Running in fallback/mock mode. Error: {e}")
