from typing import Optional, List, Any
from datetime import datetime, date
from pydantic import BaseModel, Field, validator

# Base Schemas
class ConditionBase(BaseModel):
    name: str
    description: Optional[str] = None
    icd_code: Optional[str] = None

class AllergyBase(BaseModel):
    name: str
    reaction: Optional[str] = None
    severity: Optional[str] = None

class MedicationBase(BaseModel):
    name: str
    dosage: str
    frequency: str
    start_date: date
    end_date: Optional[date] = None
    prescriber: Optional[str] = None
    notes: Optional[str] = None
    is_active: bool = True

class PatientBase(BaseModel):
    cpr_number: str = Field(..., min_length=1, max_length=20)
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    is_active: bool = True

# Create Schemas
class ConditionCreate(ConditionBase):
    pass

class AllergyCreate(AllergyBase):
    pass

class MedicationCreate(MedicationBase):
    patient_id: int

class PatientCreate(PatientBase):
    conditions: Optional[List[ConditionCreate]] = None
    allergies: Optional[List[AllergyCreate]] = None
    medications: Optional[List[MedicationCreate]] = None
    
    @validator('cpr_number')
    def validate_cpr(cls, v):
        # Add CPR validation logic here if needed
        return v

# Update Schemas
class ConditionUpdate(ConditionBase):
    pass

class AllergyUpdate(AllergyBase):
    pass

class MedicationUpdate(BaseModel):
    name: Optional[str] = None
    dosage: Optional[str] = None
    frequency: Optional[str] = None
    start_date: Optional[date] = None
    end_date: Optional[date] = None
    prescriber: Optional[str] = None
    notes: Optional[str] = None
    is_active: Optional[bool] = None

class PatientUpdate(BaseModel):
    cpr_number: Optional[str] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    date_of_birth: Optional[date] = None
    gender: Optional[str] = None
    phone_number: Optional[str] = None
    email: Optional[str] = None
    address: Optional[str] = None
    emergency_contact_name: Optional[str] = None
    emergency_contact_phone: Optional[str] = None
    blood_type: Optional[str] = None
    is_active: Optional[bool] = None

# Response Schemas
class ConditionResponse(ConditionBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class AllergyResponse(AllergyBase):
    id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class MedicationResponse(MedicationBase):
    id: int
    patient_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class PatientResponse(PatientBase):
    id: int
    created_at: datetime
    updated_at: datetime
    conditions: Optional[List[ConditionResponse]] = None
    allergies: Optional[List[AllergyResponse]] = None
    medications: Optional[List[MedicationResponse]] = None
    
    class Config:
        orm_mode = True

# Simplified Patient Response for lists
class PatientListResponse(BaseModel):
    id: int
    cpr_number: str
    first_name: str
    last_name: str
    date_of_birth: date
    gender: str
    is_active: bool
    
    class Config:
        orm_mode = True
