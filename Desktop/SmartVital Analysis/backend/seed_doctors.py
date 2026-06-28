import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import sys
import os

# Add root to python path to import config
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from app.config import settings

async def seed_doctors():
    client = AsyncIOMotorClient(settings.MONGODB_URI)
    db = client.get_default_database()
    
    doctors = db["doctor_profiles"]
    users = db["users"]
    
    print("Clearing existing doctors...")
    await doctors.delete_many({})
    print("Seeding dummy doctors...")
        
    print("Seeding dummy doctors...")
    
    dummy_doctors = [
        {
            "user_id": "seed_doc_1",
            "full_name": "Dr. Sarah Jenkins",
            "specialty": "Cardiologist",
            "license_number": "MED123456",
            "phone": "+1 (555) 123-4567",
            "clinic_address": "1240 Wellness Blvd, Suite 200, San Francisco, CA 94103",
            "experience_years": 12,
            "bio": "Dr. Jenkins specializes in preventative cardiology and manages high-risk patients utilizing continuous AI-driven monitoring."
        },
        {
            "user_id": "seed_doc_2",
            "full_name": "Dr. Michael Chen",
            "specialty": "Endocrinologist",
            "license_number": "MED789012",
            "phone": "+1 (555) 987-6543",
            "clinic_address": "880 Medical Center Dr, Clinic B, New York, NY 10016",
            "experience_years": 8,
            "bio": "Dr. Chen focuses on metabolic disorders and diabetes management with a holistic approach."
        },
        {
            "user_id": "seed_doc_3",
            "full_name": "Dr. Emily Rodriguez",
            "specialty": "General Practitioner",
            "license_number": "MED345678",
            "phone": "+1 (555) 456-7890",
            "clinic_address": "450 Family Health Ave, Austin, TX 78701",
            "experience_years": 15,
            "bio": "Dr. Rodriguez provides comprehensive primary care for families and individuals."
        }
    ]
    
    await doctors.insert_many(dummy_doctors)
    print("Seeded 3 doctors successfully!")

if __name__ == "__main__":
    asyncio.run(seed_doctors())
