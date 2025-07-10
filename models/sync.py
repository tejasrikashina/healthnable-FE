import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey, JSON
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class SyncType(enum.Enum):
    PATIENT = "patient"
    VISIT = "visit"
    VITAL = "vital"
    NOTE = "note"
    DOCUMENT = "document"
    CHAT = "chat"
    SETTING = "setting"
    OTHER = "other"

class SyncStatus(enum.Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CONFLICT = "conflict"

class SyncItem(db.Model):
    """Model for tracking offline data that needs to be synced"""
    __tablename__ = "sync_items"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    item_id = Column(Integer, nullable=False)  # ID of the item to be synced (e.g., visit_id, vital_id)
    item_type = Column(Enum(SyncType), nullable=False)
    status = Column(Enum(SyncStatus), default=SyncStatus.PENDING)
    sync_data = Column(JSON, nullable=True)  # Data to be synced if not already in the database
    last_attempt = Column(DateTime, nullable=True)
    attempt_count = Column(Integer, default=0)
    error_message = Column(Text, nullable=True)
    local_timestamp = Column(DateTime, nullable=False)  # When the change was made locally
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User")