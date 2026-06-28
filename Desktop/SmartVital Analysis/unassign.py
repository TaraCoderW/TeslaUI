import asyncio, sys
sys.path.append('.')
from backend.app.config import settings
from motor.motor_asyncio import AsyncIOMotorClient

async def check():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_default_database()
    await db['patient_profiles'].update_many({}, {"$unset": {"assigned_doctor_id": ""}})
    print('Unassigned patient.')

asyncio.run(check())
