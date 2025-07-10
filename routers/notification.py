from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_

from database import get_db
from models.user import User
from models.notification import Notification, NotificationType
from schemas.notification import NotificationCreate, NotificationResponse, NotificationUpdate, MarkNotificationReadRequest
from utils.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=NotificationResponse, status_code=status.HTTP_201_CREATED)
async def create_notification(
    notification_data: NotificationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check permissions - only admins and supervisors can create notifications for others
    if current_user.role.value not in ["admin", "supervisor"] and notification_data.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to create notifications for other users"
        )
    
    # Verify user exists
    user = db.query(User).filter(User.id == notification_data.user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Create the notification
    notification = Notification(**notification_data.dict())
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

@router.get("/", response_model=List[NotificationResponse])
async def get_notifications(
    is_read: Optional[bool] = None,
    notification_type: Optional[str] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Users can only view their own notifications
    query = db.query(Notification).filter(Notification.user_id == current_user.id)
    
    # Apply filters
    if is_read is not None:
        query = query.filter(Notification.is_read == is_read)
    
    if notification_type:
        query = query.filter(Notification.notification_type == notification_type)
    
    # Filter out expired notifications
    query = query.filter(
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.now()
        )
    )
    
    # Order by creation date descending (newest first)
    query = query.order_by(Notification.created_at.desc())
    
    notifications = query.offset(skip).limit(limit).all()
    return notifications

@router.get("/unread-count", response_model=dict)
async def get_unread_notification_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Count unread notifications for the current user
    count = db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False,
        or_(
            Notification.expires_at.is_(None),
            Notification.expires_at > datetime.now()
        )
    ).count()
    
    return {"count": count}

@router.get("/{notification_id}", response_model=NotificationResponse)
async def get_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check if notification belongs to the current user
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this notification"
        )
    
    return notification

@router.post("/mark-read", status_code=status.HTTP_200_OK)
async def mark_notification_read(
    request: MarkNotificationReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = db.query(Notification).filter(Notification.id == request.notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check if notification belongs to the current user
    if notification.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this notification"
        )
    
    # Update read status
    notification.is_read = request.read
    if request.read:
        notification.read_at = datetime.now()
    else:
        notification.read_at = None
    
    db.commit()
    db.refresh(notification)
    
    return {"message": f"Notification marked as {'read' if request.read else 'unread'}"}

@router.post("/mark-all-read", status_code=status.HTTP_200_OK)
async def mark_all_notifications_read(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Mark all unread notifications for the current user as read
    db.query(Notification).filter(
        Notification.user_id == current_user.id,
        Notification.is_read == False
    ).update(
        {"is_read": True, "read_at": datetime.now()},
        synchronize_session=False
    )
    
    db.commit()
    
    return {"message": "All notifications marked as read"}

@router.delete("/{notification_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_notification(
    notification_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    notification = db.query(Notification).filter(Notification.id == notification_id).first()
    
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    
    # Check if notification belongs to the current user
    if notification.user_id != current_user.id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to delete this notification"
        )
    
    db.delete(notification)
    db.commit()
    
    return None
