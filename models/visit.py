import enum
from datetime import datetime, time
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey, Date, Time
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class VisitStatus(enum.Enum):
    SCHEDULED = "scheduled"
    IN_PROGRESS = "in_progress"
    COMPLETED = "completed"
    CANCELLED = "cancelled"
    MISSED = "missed"
    RESCHEDULED = "rescheduled"

class VisitType(enum.Enum):
    ROUTINE = "routine"
    EMERGENCY = "emergency"
    FOLLOW_UP = "follow_up"
    ASSESSMENT = "assessment"
    SPECIALIZED = "specialized"

class Visit(db.Model):
    """Visit model for patient visits"""
    __tablename__ = "visits"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    caregiver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    visit_type = Column(Enum(VisitType), nullable=False)
    status = Column(Enum(VisitStatus), default=VisitStatus.SCHEDULED)
    date = Column(Date, nullable=False)
    start_time = Column(Time, nullable=False)
    end_time = Column(Time, nullable=False)
    notes = Column(Text, nullable=True)
    reason = Column(String(255), nullable=True)
    location = Column(String(255), nullable=True)  # Could be patient's home, facility, etc.
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_recurring = Column(Boolean, default=False)
    recurrence_pattern = Column(String(50), nullable=True)  # daily, weekly, monthly
    is_synced = Column(Boolean, default=False)
    sync_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="visits")
    caregiver = relationship("User", foreign_keys=[caregiver_id])
    creator = relationship("User", foreign_keys=[created_by])
    vitals = relationship("VitalRecord", back_populates="visit")
    notes_rel = relationship("Note", back_populates="visit")
    documents = relationship("Document", back_populates="visit")
    
    def format_time(self):
        """Format visit times for display"""
        formatted_start = self.start_time.strftime("%I:%M %p") if self.start_time else "N/A"
        formatted_end = self.end_time.strftime("%I:%M %p") if self.end_time else "N/A"
        return f"{formatted_start} - {formatted_end}"
    
    def get_duration_minutes(self):
        """Get visit duration in minutes"""
        if not self.start_time or not self.end_time:
            return 0
            
        start_minutes = self.start_time.hour * 60 + self.start_time.minute
        end_minutes = self.end_time.hour * 60 + self.end_time.minute
        
        # Handle end time on next day
        if end_minutes < start_minutes:
            end_minutes += 24 * 60
            
        return end_minutes - start_minutes
    
    def is_upcoming(self):
        """Check if visit is upcoming"""
        today = datetime.now().date()
        now = datetime.now().time()
        
        if self.date > today:
            return True
        elif self.date == today and self.start_time > now:
            return True
        return False