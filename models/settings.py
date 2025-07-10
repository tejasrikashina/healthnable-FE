from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class UserSettings(db.Model):
    """User settings and preferences"""
    __tablename__ = "user_settings"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True)
    language = Column(String(10), default="en")  # en, ar, etc.
    theme = Column(String(10), default="light")  # light, dark
    enable_notifications = Column(Boolean, default=True)
    enable_email_notifications = Column(Boolean, default=True)
    enable_push_notifications = Column(Boolean, default=True)
    offline_data_retention_days = Column(Integer, default=7)
    auto_sync_enabled = Column(Boolean, default=True)
    auto_sync_on_wifi_only = Column(Boolean, default=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="settings")

class CaregiverPreference(db.Model):
    """Caregiver specific preferences"""
    __tablename__ = "caregiver_preferences"
    
    id = Column(Integer, primary_key=True, index=True)
    caregiver_profile_id = Column(Integer, ForeignKey("caregiver_profiles.id", ondelete="CASCADE"))
    preference_key = Column(String(50), nullable=False)
    preference_value = Column(String(255), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    caregiver_profile = relationship("CaregiverProfile", back_populates="preferences")