from sqlalchemy import create_engine, Column, Integer, String, Float, DateTime
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker
import datetime
import os

# SQLite database file will be stored in the root of the project
SQLALCHEMY_DATABASE_URL = "sqlite:///./smartvital_timeline.db"

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False}
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

class HealthAssessment(Base):
    __tablename__ = "assessments"

    id = Column(Integer, primary_key=True, index=True)
    disease = Column(String, index=True)
    risk_score = Column(Float)
    insight = Column(String)
    raw_inputs = Column(String) # JSON string of inputs
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

Base.metadata.create_all(bind=engine)

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
