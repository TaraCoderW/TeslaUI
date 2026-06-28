from pydantic_settings import BaseSettings, SettingsConfigDict
import os

class Settings(BaseSettings):
    MONGODB_URI: str = "mongodb://localhost:27017/smartvital"
    JWT_SECRET: str = "your-super-secret-key-that-is-at-least-32-chars-long"
    JWT_ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 15
    REFRESH_TOKEN_EXPIRE_DAYS: int = 7
    MAIL_USERNAME: str = "your@email.com"
    MAIL_PASSWORD: str = "yourpassword"
    MAIL_FROM: str = "noreply@smartvital.health"
    ENVIRONMENT: str = "development"
    BREVO_API_KEY: str = ""
    RECAPTCHA_SECRET_KEY: str = ""
    GOOGLE_CLIENT_ID: str = ""

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )

settings = Settings()
