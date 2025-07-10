import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class DocumentType(enum.Enum):
    PATIENT_PHOTO = "patient_photo"
    WOUND_PHOTO = "wound_photo"
    PRESCRIPTION = "prescription"
    LAB_RESULT = "lab_result"
    CONSENT_FORM = "consent_form"
    CARE_PLAN = "care_plan"
    MEDICAL_REPORT = "medical_report"
    OTHER = "other"

class Document(db.Model):
    __tablename__ = "documents"
    
    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String(255), nullable=False)
    file_path = Column(String(255), nullable=False)
    file_type = Column(String(50), nullable=False)  # mime type
    file_size = Column(Integer, nullable=False)  # in bytes
    document_type = Column(Enum(DocumentType), nullable=False)
    title = Column(String(100), nullable=False)
    description = Column(Text, nullable=True)
    uploaded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"), nullable=True)
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="SET NULL"), nullable=True)
    note_id = Column(Integer, ForeignKey("notes.id", ondelete="SET NULL"), nullable=True)
    is_synced = Column(Boolean, default=False)
    sync_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    uploader = relationship("User", foreign_keys=[uploaded_by])
    patient = relationship("Patient", back_populates="documents")
    visit = relationship("Visit", back_populates="documents")
    note = relationship("Note", back_populates="documents")