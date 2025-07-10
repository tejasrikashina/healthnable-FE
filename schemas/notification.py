from typing import Optional
from datetime import datetime
from pydantic import BaseModel
from models.notification import NotificationType

# Base Schemas
class NotificationBase(BaseModel):
    user_id: int
    notification_type: NotificationType
    title: str
    message: str
    is_read: bool = False
    priority: str = "normal"
    action_url: Optional[str] = None
    reference_id: Optional[int] = None
    reference_type: Optional[str] = None
    expires_at: Optional[datetime] = None

# Create Schemas
class NotificationCreate(NotificationBase):
    pass

# Update Schemas
class NotificationUpdate(BaseModel):
    is_read: Optional[bool] = None
    read_at: Optional[datetime] = None

# Response Schemas
class NotificationResponse(NotificationBase):
    id: int
    read_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime
    
    class Config:
        orm_mode = True

# Request schemas for specific operations
class MarkNotificationReadRequest(BaseModel):
    notification_id: int
    read: bool = True
