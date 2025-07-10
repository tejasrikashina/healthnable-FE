from typing import Optional, List, Any
from datetime import datetime
from pydantic import BaseModel, Field, validator
from models.visit import VisitStatus, TaskStatus

# Base Schemas
class VisitTaskBase(BaseModel):
    task_name: str
    description: Optional[str] = None
    status: TaskStatus = TaskStatus.PENDING
    order: int = 0
    is_required: bool = True
    notes: Optional[str] = None

class VisitBase(BaseModel):
    patient_id: int
    caregiver_id: Optional[int] = None
    scheduled_start: datetime
    scheduled_end: datetime
    status: VisitStatus = VisitStatus.SCHEDULED
    visit_type: str
    summary: Optional[str] = None
    location_address: str
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    arrival_verification_method: Optional[str] = None
    arrival_verification_code: Optional[str] = None
    is_synced: bool = False
    
    @validator('scheduled_end')
    def end_after_start(cls, v, values):
        if 'scheduled_start' in values and v <= values['scheduled_start']:
            raise ValueError('Scheduled end must be after scheduled start')
        return v

# Create Schemas
class VisitTaskCreate(VisitTaskBase):
    visit_id: int

class VisitCreate(VisitBase):
    tasks: Optional[List[VisitTaskBase]] = None

# Update Schemas
class VisitTaskUpdate(BaseModel):
    task_name: Optional[str] = None
    description: Optional[str] = None
    status: Optional[TaskStatus] = None
    completed_at: Optional[datetime] = None
    completed_by: Optional[int] = None
    order: Optional[int] = None
    is_required: Optional[bool] = None
    notes: Optional[str] = None

class VisitUpdate(BaseModel):
    patient_id: Optional[int] = None
    caregiver_id: Optional[int] = None
    scheduled_start: Optional[datetime] = None
    scheduled_end: Optional[datetime] = None
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    status: Optional[VisitStatus] = None
    visit_type: Optional[str] = None
    summary: Optional[str] = None
    location_address: Optional[str] = None
    location_lat: Optional[float] = None
    location_lng: Optional[float] = None
    arrival_verification_method: Optional[str] = None
    arrival_verification_code: Optional[str] = None
    is_synced: Optional[bool] = None
    sync_timestamp: Optional[datetime] = None

# Response Schemas
class VisitTaskResponse(VisitTaskBase):
    id: int
    visit_id: int
    completed_at: Optional[datetime] = None
    completed_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class VisitResponse(VisitBase):
    id: int
    actual_start: Optional[datetime] = None
    actual_end: Optional[datetime] = None
    sync_timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    tasks: Optional[List[VisitTaskResponse]] = None
    
    class Config:
        orm_mode = True

# Request Schemas for specific operations
class MarkArrivalRequest(BaseModel):
    visit_id: int
    verification_method: str = "GPS"  # GPS, OTP, NFC
    verification_code: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None
    timestamp: datetime = Field(default_factory=datetime.now)
    
    @validator('verification_method')
    def validate_method(cls, v):
        valid_methods = ['GPS', 'OTP', 'NFC']
        if v not in valid_methods:
            raise ValueError(f'Verification method must be one of {valid_methods}')
        return v

class CompleteVisitRequest(BaseModel):
    visit_id: int
    summary: Optional[str] = None
    completed_tasks: List[int] = []  # List of task IDs that were completed
    skipped_tasks: List[int] = []  # List of task IDs that were skipped
    timestamp: datetime = Field(default_factory=datetime.now)

class VisitScheduleResponse(BaseModel):
    id: int
    patient_id: int
    patient_name: str
    scheduled_start: datetime
    scheduled_end: datetime
    status: VisitStatus
    visit_type: str
    location_address: str
    
    class Config:
        orm_mode = True
