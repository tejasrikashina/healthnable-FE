from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel
from models.note import NoteType

# Base Schemas
class NoteBase(BaseModel):
    patient_id: int
    visit_id: Optional[int] = None
    note_type: NoteType
    title: str
    content: str
    is_pending: bool = False
    sync_status: str = "synced"
    is_escalated: bool = False
    escalated_to: Optional[int] = None
    escalation_reason: Optional[str] = None
    escalation_time: Optional[datetime] = None

# Create Schemas
class NoteCreate(NoteBase):
    created_by: Optional[int] = None

# Update Schemas
class NoteUpdate(BaseModel):
    patient_id: Optional[int] = None
    visit_id: Optional[int] = None
    note_type: Optional[NoteType] = None
    title: Optional[str] = None
    content: Optional[str] = None
    is_pending: Optional[bool] = None
    sync_status: Optional[str] = None
    is_escalated: Optional[bool] = None
    escalated_to: Optional[int] = None
    escalation_reason: Optional[str] = None
    escalation_time: Optional[datetime] = None

# Response Schemas
class NoteResponse(NoteBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Request Schema for escalating a note to a doctor
class EscalateNoteRequest(BaseModel):
    note_id: int
    escalated_to: int
    escalation_reason: str
    escalation_time: datetime = None
