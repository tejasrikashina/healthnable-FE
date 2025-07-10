from typing import Optional, List
from datetime import datetime
from pydantic import BaseModel

# Base Schemas
class ChatMessageBase(BaseModel):
    thread_id: int
    content: str
    is_read: bool = False
    is_synced: bool = False

class ChatThreadBase(BaseModel):
    title: Optional[str] = None
    is_active: bool = True

# Create Schemas
class ChatMessageCreate(ChatMessageBase):
    sender_id: Optional[int] = None

class ChatThreadCreate(ChatThreadBase):
    created_by: Optional[int] = None
    participants: List[int]  # List of user IDs
    initial_message: Optional[str] = None

# Update Schemas
class ChatMessageUpdate(BaseModel):
    content: Optional[str] = None
    is_read: Optional[bool] = None
    read_at: Optional[datetime] = None
    is_synced: Optional[bool] = None
    sync_timestamp: Optional[datetime] = None

class ChatThreadUpdate(BaseModel):
    title: Optional[str] = None
    is_active: Optional[bool] = None

# Response Schemas
class ChatMessageResponse(ChatMessageBase):
    id: int
    sender_id: Optional[int] = None
    read_at: Optional[datetime] = None
    sync_timestamp: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class ChatThreadParticipantResponse(BaseModel):
    id: int
    thread_id: int
    user_id: int
    is_muted: bool
    last_read_message_id: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

class ChatThreadResponse(ChatThreadBase):
    id: int
    created_by: Optional[int] = None
    created_at: datetime
    updated_at: datetime
    participants: List[ChatThreadParticipantResponse] = []
    latest_message: Optional[ChatMessageResponse] = None
    unread_count: int = 0
    
    class Config:
        orm_mode = True

# Request schemas for specific operations
class MarkMessagesReadRequest(BaseModel):
    thread_id: int
    message_ids: List[int] = []
    read_until_message_id: Optional[int] = None  # Mark all messages up to this ID as read
