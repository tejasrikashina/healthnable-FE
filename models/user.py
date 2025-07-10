import enum
from datetime import datetime
from flask_login import UserMixin
from werkzeug.security import generate_password_hash, check_password_hash
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class UserRole(enum.Enum):
    """Enum for user roles"""
    ADMIN = "admin"
    SUPERVISOR = "supervisor"
    CAREGIVER = "caregiver"
    DOCTOR = "doctor"

class User(UserMixin, db.Model):
    """User model"""
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, nullable=False, index=True)
    email = Column(String(100), unique=True, nullable=False, index=True)
    password_hash = Column(String(256), nullable=False)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    phone = Column(String(20), nullable=True)
    role = Column(Enum(UserRole), nullable=False, default=UserRole.CAREGIVER)
    is_active_col = Column("is_active", Boolean, default=True)
    last_login = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    settings = relationship("UserSettings", back_populates="user", uselist=False)
    caregiver_profile = relationship("CaregiverProfile", back_populates="user", uselist=False)
    notifications = relationship("Notification", back_populates="user")
    sent_messages = relationship("ChatMessage", foreign_keys="ChatMessage.sender_id", back_populates="sender")
    
    @property
    def is_active(self):
        """Return active status for Flask-Login"""
        return self.is_active_col
    
    def get_full_name(self):
        """Get user's full name"""
        return f"{self.first_name} {self.last_name}"
    
    def set_password(self, password):
        """Set password hash"""
        self.password_hash = generate_password_hash(password)
    
    def check_password(self, password):
        """Check password against hash"""
        return check_password_hash(self.password_hash, password)

class CaregiverProfile(db.Model):
    """Caregiver specific profile information"""
    __tablename__ = "caregiver_profiles"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    specialization = Column(String(100), nullable=True)
    qualifications = Column(Text, nullable=True)
    years_of_experience = Column(Integer, nullable=True)
    availability_schedule = Column(Text, nullable=True)  # JSON string representation of schedule
    max_patients = Column(Integer, default=10)
    assigned_area = Column(String(100), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="caregiver_profile")
    preferences = relationship("CaregiverPreference", back_populates="caregiver_profile")