from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from models.document import DocumentType

# Base Schemas
class DocumentBase(BaseModel):
    filename: str
    file_path: str
    file_type: str
    file_size: int
    document_type: DocumentType
    title: str
    description: Optional[str] = None
    patient_id: Optional[int] = None
    visit_id: Optional[int] = None
    note_id: Optional[int] = None
    is_synced: bool = False

# Create Schemas
class DocumentCreate(DocumentBase):
    uploaded_by: Optional[int] = None

# Update Schemas
class DocumentUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    patient_id: Optional[int] = None
    visit_id: Optional[int] = None
    note_id: Optional[int] = None
    is_synced: Optional[bool] = None
    sync_timestamp: Optional[datetime] = None

# Response Schemas
class DocumentResponse(DocumentBase):
    id: int
    uploaded_by: Optional[int] = None
    sync_timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True
