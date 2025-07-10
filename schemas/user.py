from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel, EmailStr, Field, validator
from models.user import UserRole

# Base Schemas
class CaregiverPreferenceBase(BaseModel):
    preference_key: str
    preference_value: Optional[str] = None

class CaregiverProfileBase(BaseModel):
    license_number: Optional[str] = None
    license_expiry: Optional[datetime] = None
    specialization: Optional[str] = None
    qualification: Optional[str] = None
    bio: Optional[str] = None
    years_of_experience: Optional[int] = None
    profile_image_url: Optional[str] = None

class UserBase(BaseModel):
    username: str
    email: EmailStr
    first_name: str
    last_name: str
    phone_number: Optional[str] = None
    role: UserRole

# Create Schemas
class CaregiverPreferenceCreate(CaregiverPreferenceBase):
    pass

class CaregiverProfileCreate(CaregiverProfileBase):
    preferences: Optional[List[CaregiverPreferenceCreate]] = None

class UserCreate(UserBase):
    password: str = Field(..., min_length=8)
    caregiver_profile: Optional[CaregiverProfileCreate] = None
    
    @validator('password')
    def password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        return v

# Update Schemas
class CaregiverPreferenceUpdate(CaregiverPreferenceBase):
    pass

class CaregiverProfileUpdate(CaregiverProfileBase):
    preferences: Optional[List[CaregiverPreferenceUpdate]] = None

class UserUpdate(BaseModel):
    username: Optional[str] = None
    email: Optional[EmailStr] = None
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone_number: Optional[str] = None
    role: Optional[UserRole] = None
    is_active: Optional[bool] = None
    caregiver_profile: Optional[CaregiverProfileUpdate] = None

# Response Schemas
class CaregiverPreferenceResponse(CaregiverPreferenceBase):
    id: int
    caregiver_profile_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class CaregiverProfileResponse(CaregiverProfileBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    preferences: Optional[List[CaregiverPreferenceResponse]] = None
    
    class Config:
        orm_mode = True

class UserResponse(UserBase):
    id: int
    is_active: bool
    last_login: Optional[datetime]
    created_at: datetime
    updated_at: datetime
    caregiver_profile: Optional[CaregiverProfileResponse] = None
    
    class Config:
        orm_mode = True
