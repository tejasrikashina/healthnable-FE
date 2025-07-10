import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class NotificationType(enum.Enum):
    VISIT_REMINDER = "visit_reminder"
    VISIT_ASSIGNED = "visit_assigned"
    VISIT_MODIFIED = "visit_modified"
    VISIT_CANCELLED = "visit_cancelled"
    MESSAGE_RECEIVED = "message_received"
    ESCALATION = "escalation"
    SYSTEM = "system"
    DOCUMENT_UPLOADED = "document_uploaded"
    SYNC_FAILED = "sync_failed"
    SYNC_COMPLETED = "sync_completed"

class Notification(db.Model):
    __tablename__ = "notifications"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    notification_type = Column(Enum(NotificationType), nullable=False)
    title = Column(String(100), nullable=False)
    message = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    priority = Column(String(10), default="normal")  # high, normal, low
    action_url = Column(String(255), nullable=True)
    reference_id = Column(Integer, nullable=True)  # Generic ID reference (like visit_id, chat_id)
    reference_type = Column(String(50), nullable=True)  # For what the reference_id refers to
    expires_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    user = relationship("User", back_populates="notifications")