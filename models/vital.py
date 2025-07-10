import enum
from datetime import datetime
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey, Float
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class VitalType(enum.Enum):
    BLOOD_PRESSURE = "blood_pressure"
    HEART_RATE = "heart_rate"
    RESPIRATORY_RATE = "respiratory_rate"
    TEMPERATURE = "temperature"
    OXYGEN_SATURATION = "oxygen_saturation"
    BLOOD_GLUCOSE = "blood_glucose"
    WEIGHT = "weight"
    PAIN_LEVEL = "pain_level"
    OTHER = "other"

class VitalRecord(db.Model):
    """Vital record model for patient vitals"""
    __tablename__ = "vital_records"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    visit_id = Column(Integer, ForeignKey("visits.id", ondelete="SET NULL"), nullable=True)
    recorded_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    vital_type = Column(Enum(VitalType), nullable=False)
    value = Column(String(50), nullable=False)  # Could be a range (e.g., 120/80 for BP) or single value
    unit = Column(String(20), nullable=True)  # e.g., mmHg, bpm, etc.
    timestamp = Column(DateTime, nullable=False, default=datetime.utcnow)
    notes = Column(Text, nullable=True)
    is_abnormal = Column(Boolean, default=False)
    is_synced = Column(Boolean, default=False)
    sync_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="vitals")
    visit = relationship("Visit", back_populates="vitals")
    recorder = relationship("User", foreign_keys=[recorded_by])
    
    def is_critical(self):
        """Determine if vital is in critical range"""
        if self.vital_type == VitalType.BLOOD_PRESSURE:
            # Parse systolic/diastolic
            try:
                systolic, diastolic = map(int, self.value.split('/'))
                return systolic > 180 or systolic < 90 or diastolic > 120 or diastolic < 60
            except:
                return False
        elif self.vital_type == VitalType.HEART_RATE:
            try:
                hr = float(self.value)
                return hr > 120 or hr < 50
            except:
                return False
        elif self.vital_type == VitalType.RESPIRATORY_RATE:
            try:
                rr = float(self.value)
                return rr > 30 or rr < 10
            except:
                return False
        elif self.vital_type == VitalType.TEMPERATURE:
            try:
                temp = float(self.value)
                # Check if Celsius or Fahrenheit based on unit
                if self.unit and self.unit.lower() == 'f':
                    return temp > 103 or temp < 95
                else:  # Assume Celsius
                    return temp > 39.5 or temp < 35
            except:
                return False
        elif self.vital_type == VitalType.OXYGEN_SATURATION:
            try:
                o2 = float(self.value)
                return o2 < 90
            except:
                return False
        elif self.vital_type == VitalType.BLOOD_GLUCOSE:
            try:
                glucose = float(self.value)
                # Check unit (mg/dL or mmol/L)
                if self.unit and self.unit.lower() == 'mmol/l':
                    return glucose > 15 or glucose < 3
                else:  # Assume mg/dL
                    return glucose > 270 or glucose < 54
            except:
                return False
        elif self.vital_type == VitalType.PAIN_LEVEL:
            try:
                pain = int(self.value)
                return pain >= 8  # Severe pain
            except:
                return False
        
        return self.is_abnormal  # Default to the flag