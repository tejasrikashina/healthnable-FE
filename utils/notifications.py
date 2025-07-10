from datetime import datetime
from typing import Optional, List
from sqlalchemy.orm import Session

from models.user import User
from models.note import Note
from models.chat import ChatMessage
from models.notification import Notification, NotificationType
from models.visit import Visit
from models.patient import Patient

async def create_notification(
    db: Session,
    user_id: int,
    notification_type: NotificationType,
    title: str,
    message: str,
    priority: str = "normal",
    action_url: Optional[str] = None,
    reference_id: Optional[int] = None,
    reference_type: Optional[str] = None,
    expires_at: Optional[datetime] = None
) -> Notification:
    """
    Create a new notification
    """
    notification = Notification(
        user_id=user_id,
        notification_type=notification_type,
        title=title,
        message=message,
        priority=priority,
        action_url=action_url,
        reference_id=reference_id,
        reference_type=reference_type,
        expires_at=expires_at
    )
    
    db.add(notification)
    db.commit()
    db.refresh(notification)
    
    return notification

async def send_escalation_notification(db: Session, note: Note) -> Optional[Notification]:
    """
    Send a notification when a note is escalated
    """
    if not note.is_escalated or not note.escalated_to:
        return None
    
    # Get the patient name
    patient = db.query(Patient).filter(Patient.id == note.patient_id).first()
    if not patient:
        patient_name = "Unknown Patient"
    else:
        patient_name = f"{patient.first_name} {patient.last_name}"
    
    # Get the creator name
    creator = db.query(User).filter(User.id == note.created_by).first()
    if not creator:
        creator_name = "A caregiver"
    else:
        creator_name = f"{creator.first_name} {creator.last_name}"
    
    # Create notification for the escalated user
    notification = await create_notification(
        db=db,
        user_id=note.escalated_to,
        notification_type=NotificationType.ESCALATION,
        title="Note Escalated to You",
        message=f"{creator_name} has escalated a note regarding {patient_name}. Reason: {note.escalation_reason}",
        priority="high",
        reference_id=note.id,
        reference_type="note"
    )
    
    return notification

async def send_chat_notification(db: Session, message: ChatMessage, recipient_id: int) -> Optional[Notification]:
    """
    Send a notification for a new chat message
    """
    # Get the sender name
    sender = db.query(User).filter(User.id == message.sender_id).first()
    if not sender:
        sender_name = "Someone"
    else:
        sender_name = f"{sender.first_name} {sender.last_name}"
    
    # Create notification
    notification = await create_notification(
        db=db,
        user_id=recipient_id,
        notification_type=NotificationType.MESSAGE_RECEIVED,
        title="New Message",
        message=f"{sender_name}: {message.content[:50]}{'...' if len(message.content) > 50 else ''}",
        reference_id=message.thread_id,
        reference_type="chat_thread"
    )
    
    return notification

async def send_visit_notifications(db: Session, visit: Visit, action: str) -> List[Notification]:
    """
    Send notifications for visit events (assigned, modified, cancelled)
    """
    notifications = []
    
    if action not in ["assigned", "modified", "cancelled"]:
        return notifications
    
    # Only send notifications to the assigned caregiver
    if not visit.caregiver_id:
        return notifications
    
    # Get the patient name
    patient = db.query(Patient).filter(Patient.id == visit.patient_id).first()
    if not patient:
        patient_name = "Unknown Patient"
    else:
        patient_name = f"{patient.first_name} {patient.last_name}"
    
    # Determine notification type and message
    notification_type = None
    title = ""
    message = ""
    
    if action == "assigned":
        notification_type = NotificationType.VISIT_ASSIGNED
        title = "New Visit Assigned"
        message = f"You have been assigned a visit with {patient_name} on {visit.scheduled_start.strftime('%d %b, %Y')} at {visit.scheduled_start.strftime('%H:%M')}"
    
    elif action == "modified":
        notification_type = NotificationType.VISIT_MODIFIED
        title = "Visit Modified"
        message = f"Your visit with {patient_name} on {visit.scheduled_start.strftime('%d %b, %Y')} has been modified"
    
    elif action == "cancelled":
        notification_type = NotificationType.VISIT_CANCELLED
        title = "Visit Cancelled"
        message = f"Your visit with {patient_name} on {visit.scheduled_start.strftime('%d %b, %Y')} has been cancelled"
    
    # Create notification
    if notification_type:
        notification = await create_notification(
            db=db,
            user_id=visit.caregiver_id,
            notification_type=notification_type,
            title=title,
            message=message,
            reference_id=visit.id,
            reference_type="visit"
        )
        notifications.append(notification)
    
    return notifications

async def send_visit_reminder(db: Session, visit: Visit) -> Optional[Notification]:
    """
    Send a reminder notification for an upcoming visit
    """
    if not visit.caregiver_id or visit.status != "scheduled":
        return None
    
    # Get the patient name
    patient = db.query(Patient).filter(Patient.id == visit.patient_id).first()
    if not patient:
        patient_name = "a patient"
    else:
        patient_name = f"{patient.first_name} {patient.last_name}"
    
    # Create notification
    notification = await create_notification(
        db=db,
        user_id=visit.caregiver_id,
        notification_type=NotificationType.VISIT_REMINDER,
        title="Upcoming Visit Reminder",
        message=f"Reminder: You have a visit with {patient_name} in 1 hour at {visit.scheduled_start.strftime('%H:%M')}",
        priority="high",
        reference_id=visit.id,
        reference_type="visit",
        expires_at=visit.scheduled_start
    )
    
    return notification
