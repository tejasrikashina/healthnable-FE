from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, validator
from models.vital import VitalType

# Base Schemas
class VitalRecordBase(BaseModel):
    patient_id: int
    visit_id: Optional[int] = None
    vital_type: VitalType
    value: str
    unit: Optional[str] = None
    is_abnormal: bool = False
    comments: Optional[str] = None
    is_synced: bool = False

# Create Schemas
class VitalRecordCreate(VitalRecordBase):
    recorded_by: Optional[int] = None
    device_sync_id: Optional[int] = None

class DeviceSyncBase(BaseModel):
    device_type: str
    device_id: Optional[str] = None
    device_name: Optional[str] = None
    sync_time: datetime
    raw_data: Optional[str] = None
    sync_status: str = "success"
    error_message: Optional[str] = None

class DeviceSyncCreate(DeviceSyncBase):
    created_by: Optional[int] = None
    vital_records: Optional[List[VitalRecordCreate]] = None

# Update Schemas
class VitalRecordUpdate(BaseModel):
    patient_id: Optional[int] = None
    visit_id: Optional[int] = None
    recorded_by: Optional[int] = None
    vital_type: Optional[VitalType] = None
    value: Optional[str] = None
    unit: Optional[str] = None
    is_abnormal: Optional[bool] = None
    comments: Optional[str] = None
    device_sync_id: Optional[int] = None
    is_synced: Optional[bool] = None
    sync_timestamp: Optional[datetime] = None

# Response Schemas
class VitalRecordResponse(VitalRecordBase):
    id: int
    recorded_by: Optional[int] = None
    device_sync_id: Optional[int] = None
    sync_timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class DeviceSyncResponse(DeviceSyncBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    vital_records: Optional[List[VitalRecordResponse]] = None
    
    class Config:
        orm_mode = True

# Special schemas for batch vital record creation from device sync
class BatchVitalRecordCreate(BaseModel):
    records: List[VitalRecordCreate]
    device_sync: Optional[DeviceSyncCreate] = None
