from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Base Schemas
class UserSettingsBase(BaseModel):
    language: Optional[str] = "en"
    theme: Optional[str] = "light"
    enable_notifications: Optional[bool] = True
    enable_email_notifications: Optional[bool] = True
    enable_push_notifications: Optional[bool] = True
    offline_data_retention_days: Optional[int] = 7
    auto_sync_enabled: Optional[bool] = True
    auto_sync_on_wifi_only: Optional[bool] = False

# Update Schemas
class UserSettingsUpdate(UserSettingsBase):
    pass

# Response Schemas
class UserSettingsResponse(UserSettingsBase):
    id: int
    user_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Caregiver Preference Schemas
class CaregiverPreferenceBase(BaseModel):
    preference_key: str
    preference_value: Optional[str] = None

class CaregiverPreferenceCreate(CaregiverPreferenceBase):
    caregiver_profile_id: int

class CaregiverPreferenceUpdate(BaseModel):
    preference_value: Optional[str] = None

class CaregiverPreferenceResponse(CaregiverPreferenceBase):
    id: int
    caregiver_profile_id: int
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
