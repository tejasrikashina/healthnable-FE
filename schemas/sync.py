from typing import Optional, List, Dict, Any, Union
from datetime import datetime
from pydantic import BaseModel
from models.sync import SyncType, SyncStatus

# Base Schemas
class SyncItemBase(BaseModel):
    user_id: int
    sync_type: SyncType
    record_id: int
    status: SyncStatus = SyncStatus.PENDING
    data: Optional[str] = None
    device_id: Optional[str] = None
    is_upload: bool = True

# Create Schemas
class SyncItemCreate(SyncItemBase):
    pass

# Update Schemas
class SyncItemUpdate(BaseModel):
    status: Optional[SyncStatus] = None
    data: Optional[str] = None
    error_message: Optional[str] = None
    retry_count: Optional[int] = None
    last_retry_at: Optional[datetime] = None

# Response Schemas
class SyncItemResponse(SyncItemBase):
    id: int
    error_message: Optional[str] = None
    retry_count: int
    last_retry_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Batch Sync Schemas
class SyncBatchItem(BaseModel):
    sync_type: SyncType
    record_id: int
    data: Optional[Dict[str, Any]] = None
    timestamp: datetime = None

class SyncBatchRequest(BaseModel):
    user_id: int
    device_id: Optional[str] = None
    items: List[SyncBatchItem]

class SyncConflict(BaseModel):
    sync_type: SyncType
    record_id: int
    server_data: Dict[str, Any]
    client_data: Dict[str, Any]
    resolution: str = "server_wins"  # server_wins, client_wins, manual_resolution_needed

class SyncBatchResponse(BaseModel):
    successful_items: List[int]  # List of record_ids that were synced successfully
    failed_items: List[Dict[str, Any]]  # List of records that failed with error message
    conflicts: List[SyncConflict] = []  # List of conflicts that need resolution
    server_updates: List[Dict[str, Any]] = []  # Updates from server that client needs
