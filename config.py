import os
import secrets
from datetime import timedelta
from pydantic import BaseSettings

class Settings(BaseSettings):
    # Database
    DATABASE_URL: str = os.getenv("DATABASE_URL")
    
    # JWT settings
    SECRET_KEY: str = os.getenv("SECRET_KEY", secrets.token_hex(32))
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7  # 7 days
    
    # File upload
    UPLOAD_DIR: str = "uploads"
    MAX_UPLOAD_SIZE: int = 10 * 1024 * 1024  # 10MB
    ALLOWED_EXTENSIONS: list = ["jpg", "jpeg", "png", "pdf", "doc", "docx"]
    
    # Security
    PASSWORD_MIN_LENGTH: int = 8
    
    # Notification settings
    ENABLE_EMAIL_NOTIFICATIONS: bool = False
    ENABLE_PUSH_NOTIFICATIONS: bool = True
    
    # Logging
    LOG_LEVEL: str = "INFO"
    
    # Sync settings
    MAX_SYNC_BATCH_SIZE: int = 100
    
    # Geographic settings
    DEFAULT_TIMEZONE: str = "Asia/Bahrain"

    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
