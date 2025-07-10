import enum
from datetime import datetime, date
from sqlalchemy import Column, Integer, String, Enum, Boolean, DateTime, Text, ForeignKey, Date
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class Gender(enum.Enum):
    MALE = "male"
    FEMALE = "female"
    OTHER = "other"
    PREFER_NOT_TO_SAY = "prefer_not_to_say"

class Patient(db.Model):
    """Patient model"""
    __tablename__ = "patients"
    
    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String(50), nullable=False)
    last_name = Column(String(50), nullable=False)
    date_of_birth = Column(Date, nullable=False)
    gender = Column(Enum(Gender), nullable=False)
    phone_number = Column(String(20), nullable=True)
    email = Column(String(100), nullable=True)
    address = Column(Text, nullable=True)
    emergency_contact_name = Column(String(100), nullable=True)
    emergency_contact_phone = Column(String(20), nullable=True)
    emergency_contact_relationship = Column(String(50), nullable=True)
    primary_caregiver_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    primary_caregiver = relationship("User", foreign_keys=[primary_caregiver_id])
    conditions = relationship("PatientCondition", back_populates="patient", cascade="all, delete-orphan")
    medications = relationship("PatientMedication", back_populates="patient", cascade="all, delete-orphan")
    allergies = relationship("PatientAllergy", back_populates="patient", cascade="all, delete-orphan")
    vitals = relationship("VitalRecord", back_populates="patient")
    visits = relationship("Visit", back_populates="patient")
    notes = relationship("Note", back_populates="patient")
    documents = relationship("Document", back_populates="patient")
    
    def get_age(self):
        """Calculate patient's age"""
        today = date.today()
        return today.year - self.date_of_birth.year - ((today.month, today.day) < (self.date_of_birth.month, self.date_of_birth.day))
    
    def get_full_name(self):
        """Get patient's full name"""
        return f"{self.first_name} {self.last_name}"

class PatientCondition(db.Model):
    """Patient medical conditions"""
    __tablename__ = "patient_conditions"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    condition_name = Column(String(100), nullable=False)
    diagnosis_date = Column(Date, nullable=True)
    notes = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="conditions")

class PatientMedication(db.Model):
    """Patient medications"""
    __tablename__ = "patient_medications"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    medication_name = Column(String(100), nullable=False)
    dosage = Column(String(50), nullable=True)
    frequency = Column(String(50), nullable=True)
    start_date = Column(Date, nullable=True)
    end_date = Column(Date, nullable=True)
    instructions = Column(Text, nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="medications")

class PatientAllergy(db.Model):
    """Patient allergies"""
    __tablename__ = "patient_allergies"
    
    id = Column(Integer, primary_key=True, index=True)
    patient_id = Column(Integer, ForeignKey("patients.id", ondelete="CASCADE"))
    allergy_name = Column(String(100), nullable=False)
    severity = Column(String(20), nullable=True)  # mild, moderate, severe
    reaction = Column(Text, nullable=True)
    notes = Column(Text, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    patient = relationship("Patient", back_populates="allergies")