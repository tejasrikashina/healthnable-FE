import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class NoteType(enum.Enum):
    PROGRESS = "progress"
    CARE_PLAN = "care_plan"
    OBSERVATION = "observation"
    ESCALATION = "escalation"
    GENERAL = "general"

class Note(db.Model):
    __tablename__ = "notes"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="SET NULL"), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    note_type = Column(Enum(NoteType), nullable=False)
    title = Column(String(100), nullable=False)
    content = Column(Text, nullable=False)
    is_pending = Column(Boolean, default=False)  # For pending notes that need to be synced
    sync_status = Column(String(20), default="synced")  # synced, pending, failed
    is_escalated = Column(Boolean, default=False)
    escalated_to = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    escalation_reason = Column(Text, nullable=True)
    escalation_time = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="notes")
    visit = relationship("Visit", back_populates="notes_rel")
    creator = relationship("User", foreign_keys=[created_by])
    escalated_user = relationship("User", foreign_keys=[escalated_to])
    documents = relationship("Document", back_populates="note")