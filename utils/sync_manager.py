import json
from datetime import datetime
from typing import Dict, Any, List, Optional
from sqlalchemy.orm import Session

from models.sync import SyncItem, SyncStatus, SyncType
from models.visit import Visit, VisitStatus, VisitTask, TaskStatus
from models.vital import VitalRecord, DeviceSync
from models.note import Note, NoteType
from models.document import Document
from models.chat import ChatMessage
from schemas.sync import SyncBatchRequest, SyncBatchResponse, SyncConflict

async def process_sync_item(db: Session, sync_item: SyncItem) -> SyncItem:
    """Process a single sync item and update its status"""
    try:
        # Set status to in progress
        sync_item.status = SyncStatus.IN_PROGRESS
        db.commit()
        
        # Process based on sync type
        if sync_item.sync_type == SyncType.VISIT:
            await sync_visit(db, sync_item)
        elif sync_item.sync_type == SyncType.VITAL:
            await sync_vital(db, sync_item)
        elif sync_item.sync_type == SyncType.NOTE:
            await sync_note(db, sync_item)
        elif sync_item.sync_type == SyncType.DOCUMENT:
            await sync_document(db, sync_item)
        elif sync_item.sync_type == SyncType.CHAT:
            await sync_chat_message(db, sync_item)
        elif sync_item.sync_type == SyncType.USER_SETTINGS:
            await sync_user_settings(db, sync_item)
        
        # Mark as completed
        sync_item.status = SyncStatus.COMPLETED
        sync_item.error_message = None
        
    except Exception as e:
        # Mark as failed
        sync_item.status = SyncStatus.FAILED
        sync_item.error_message = str(e)
    
    # Update sync item
    sync_item.updated_at = datetime.now()
    db.commit()
    db.refresh(sync_item)
    
    return sync_item

async def sync_visit(db: Session, sync_item: SyncItem) -> None:
    """Sync a visit record"""
    data = json.loads(sync_item.data) if sync_item.data else {}
    
    if not data:
        raise ValueError("No data provided for sync")
    
    # Check if visit exists
    visit = db.query(Visit).filter(Visit.id == sync_item.record_id).first()
    
    if sync_item.is_upload:
        # Upload from client to server
        if visit:
            # Update existing visit
            allowed_fields = [
                "status", "actual_start", "actual_end", "summary", 
                "sync_timestamp", "is_synced"
            ]
            
            for field in allowed_fields:
                if field in data:
                    setattr(visit, field, data[field])
            
            # Update tasks if provided
            if "tasks" in data:
                for task_data in data["tasks"]:
                    task_id = task_data.get("id")
                    if task_id:
                        task = db.query(VisitTask).filter(
                            VisitTask.id == task_id,
                            VisitTask.visit_id == visit.id
                        ).first()
                        
                        if task:
                            task.status = task_data.get("status", task.status)
                            task.completed_at = task_data.get("completed_at", task.completed_at)
                            task.completed_by = task_data.get("completed_by", task.completed_by)
                            task.notes = task_data.get("notes", task.notes)
        else:
            # Visit not found, cannot sync
            raise ValueError(f"Visit with ID {sync_item.record_id} not found")
    else:
        # Download from server to client
        if not visit:
            raise ValueError(f"Visit with ID {sync_item.record_id} not found")
        
        # No action needed for download - data is in the response
    
    db.commit()

async def sync_vital(db: Session, sync_item: SyncItem) -> None:
    """Sync a vital record"""
    data = json.loads(sync_item.data) if sync_item.data else {}
    
    if not data:
        raise ValueError("No data provided for sync")
    
    # Check if vital record exists
    vital = db.query(VitalRecord).filter(VitalRecord.id == sync_item.record_id).first()
    
    if sync_item.is_upload:
        # Upload from client to server
        if vital:
            # Update existing vital
            allowed_fields = [
                "value", "unit", "is_abnormal", "comments", 
                "sync_timestamp", "is_synced"
            ]
            
            for field in allowed_fields:
                if field in data:
                    setattr(vital, field, data[field])
        else:
            # Create new vital record
            new_vital = VitalRecord(**data)
            db.add(new_vital)
    else:
        # Download from server to client
        if not vital:
            raise ValueError(f"Vital record with ID {sync_item.record_id} not found")
        
        # No action needed for download - data is in the response
    
    db.commit()

async def sync_note(db: Session, sync_item: SyncItem) -> None:
    """Sync a note record"""
    data = json.loads(sync_item.data) if sync_item.data else {}
    
    if not data:
        raise ValueError("No data provided for sync")
    
    # Check if note exists
    note = db.query(Note).filter(Note.id == sync_item.record_id).first()
    
    if sync_item.is_upload:
        # Upload from client to server
        if note:
            # Update existing note
            allowed_fields = [
                "title", "content", "is_pending", "sync_status", 
                "is_escalated", "escalated_to", "escalation_reason", "escalation_time"
            ]
            
            for field in allowed_fields:
                if field in data:
                    setattr(note, field, data[field])
        else:
            # Create new note
            new_note = Note(**data)
            db.add(new_note)
    else:
        # Download from server to client
        if not note:
            raise ValueError(f"Note with ID {sync_item.record_id} not found")
        
        # No action needed for download - data is in the response
    
    db.commit()

async def sync_document(db: Session, sync_item: SyncItem) -> None:
    """Sync a document record (metadata only)"""
    data = json.loads(sync_item.data) if sync_item.data else {}
    
    if not data:
        raise ValueError("No data provided for sync")
    
    # Check if document exists
    document = db.query(Document).filter(Document.id == sync_item.record_id).first()
    
    if sync_item.is_upload:
        # Upload from client to server
        if document:
            # Update existing document
            allowed_fields = [
                "title", "description", "sync_timestamp", "is_synced"
            ]
            
            for field in allowed_fields:
                if field in data:
                    setattr(document, field, data[field])
        else:
            # Document not found, cannot sync
            raise ValueError(f"Document with ID {sync_item.record_id} not found")
    else:
        # Download from server to client
        if not document:
            raise ValueError(f"Document with ID {sync_item.record_id} not found")
        
        # No action needed for download - data is in the response
    
    db.commit()

async def sync_chat_message(db: Session, sync_item: SyncItem) -> None:
    """Sync a chat message"""
    data = json.loads(sync_item.data) if sync_item.data else {}
    
    if not data:
        raise ValueError("No data provided for sync")
    
    # Check if message exists
    message = db.query(ChatMessage).filter(ChatMessage.id == sync_item.record_id).first()
    
    if sync_item.is_upload:
        # Upload from client to server
        if message:
            # Update existing message
            allowed_fields = [
                "is_read", "read_at", "sync_timestamp", "is_synced"
            ]
            
            for field in allowed_fields:
                if field in data:
                    setattr(message, field, data[field])
        else:
            # Create new message
            new_message = ChatMessage(**data)
            db.add(new_message)
    else:
        # Download from server to client
        if not message:
            raise ValueError(f"Chat message with ID {sync_item.record_id} not found")
        
        # No action needed for download - data is in the response
    
    db.commit()

async def sync_user_settings(db: Session, sync_item: SyncItem) -> None:
    """Sync user settings"""
    data = json.loads(sync_item.data) if sync_item.data else {}
    
    if not data:
        raise ValueError("No data provided for sync")
    
    # Check if user_id matches
    if data.get("user_id") != sync_item.user_id:
        raise ValueError("User ID mismatch in settings sync")
    
    # Get or create user settings
    settings = db.query(UserSettings).filter(UserSettings.user_id == sync_item.user_id).first()
    
    if not settings:
        settings = UserSettings(user_id=sync_item.user_id)
        db.add(settings)
        db.flush()
    
    # Update settings
    allowed_fields = [
        "language", "theme", "enable_notifications", "enable_email_notifications",
        "enable_push_notifications", "offline_data_retention_days", 
        "auto_sync_enabled", "auto_sync_on_wifi_only"
    ]
    
    for field in allowed_fields:
        if field in data:
            setattr(settings, field, data[field])
    
    db.commit()

async def handle_batch_sync(db: Session, batch_request: SyncBatchRequest) -> SyncBatchResponse:
    """Handle a batch sync request"""
    successful_items = []
    failed_items = []
    conflicts = []
    server_updates = []
    
    # Process each item in the batch
    for item in batch_request.items:
        try:
            # Check if item exists on server
            if item.sync_type == SyncType.VISIT:
                result = await handle_visit_sync(db, item, batch_request.user_id, batch_request.device_id)
            elif item.sync_type == SyncType.VITAL:
                result = await handle_vital_sync(db, item, batch_request.user_id, batch_request.device_id)
            elif item.sync_type == SyncType.NOTE:
                result = await handle_note_sync(db, item, batch_request.user_id, batch_request.device_id)
            elif item.sync_type == SyncType.DOCUMENT:
                result = await handle_document_sync(db, item, batch_request.user_id, batch_request.device_id)
            elif item.sync_type == SyncType.CHAT:
                result = await handle_chat_sync(db, item, batch_request.user_id, batch_request.device_id)
            elif item.sync_type == SyncType.USER_SETTINGS:
                result = await handle_settings_sync(db, item, batch_request.user_id, batch_request.device_id)
            else:
                raise ValueError(f"Unsupported sync type: {item.sync_type}")
            
            # Process result
            if result["status"] == "success":
                successful_items.append(item.record_id)
            elif result["status"] == "conflict":
                conflicts.append(result["conflict"])
            else:
                failed_items.append({
                    "record_id": item.record_id,
                    "sync_type": item.sync_type.value,
                    "error": result["error"]
                })
            
            # Add server updates if any
            if result.get("server_updates"):
                server_updates.extend(result["server_updates"])
            
        except Exception as e:
            failed_items.append({
                "record_id": item.record_id,
                "sync_type": item.sync_type.value,
                "error": str(e)
            })
    
    return SyncBatchResponse(
        successful_items=successful_items,
        failed_items=failed_items,
        conflicts=conflicts,
        server_updates=server_updates
    )

async def handle_visit_sync(db: Session, item, user_id: int, device_id: Optional[str]) -> Dict[str, Any]:
    """Handle sync for a visit"""
    # Implementation details for visit sync
    # This would involve checking for conflicts and updating the database
    
    # Placeholder for now - in a real implementation, this would contain the business logic
    return {"status": "success"}

async def handle_vital_sync(db: Session, item, user_id: int, device_id: Optional[str]) -> Dict[str, Any]:
    """Handle sync for a vital record"""
    # Placeholder for now - in a real implementation, this would contain the business logic
    return {"status": "success"}

async def handle_note_sync(db: Session, item, user_id: int, device_id: Optional[str]) -> Dict[str, Any]:
    """Handle sync for a note"""
    # Placeholder for now - in a real implementation, this would contain the business logic
    return {"status": "success"}

async def handle_document_sync(db: Session, item, user_id: int, device_id: Optional[str]) -> Dict[str, Any]:
    """Handle sync for a document"""
    # Placeholder for now - in a real implementation, this would contain the business logic
    return {"status": "success"}

async def handle_chat_sync(db: Session, item, user_id: int, device_id: Optional[str]) -> Dict[str, Any]:
    """Handle sync for a chat message"""
    # Placeholder for now - in a real implementation, this would contain the business logic
    return {"status": "success"}

async def handle_settings_sync(db: Session, item, user_id: int, device_id: Optional[str]) -> Dict[str, Any]:
    """Handle sync for user settings"""
    # Placeholder for now - in a real implementation, this would contain the business logic
    return {"status": "success"}

async def resolve_conflicts(db: Session, sync_item: SyncItem, resolution: str) -> SyncItem:
    """Resolve sync conflicts"""
    if sync_item.status != SyncStatus.CONFLICT:
        return sync_item
    
    data = json.loads(sync_item.data) if sync_item.data else {}
    if not data or "client_data" not in data or "server_data" not in data:
        raise ValueError("Invalid conflict data")
    
    try:
        if resolution == "client_wins":
            # Apply client data to server
            if sync_item.sync_type == SyncType.VISIT:
                await apply_client_visit_data(db, sync_item.record_id, data["client_data"])
            elif sync_item.sync_type == SyncType.VITAL:
                await apply_client_vital_data(db, sync_item.record_id, data["client_data"])
            elif sync_item.sync_type == SyncType.NOTE:
                await apply_client_note_data(db, sync_item.record_id, data["client_data"])
            elif sync_item.sync_type == SyncType.DOCUMENT:
                await apply_client_document_data(db, sync_item.record_id, data["client_data"])
            elif sync_item.sync_type == SyncType.CHAT:
                await apply_client_chat_data(db, sync_item.record_id, data["client_data"])
            elif sync_item.sync_type == SyncType.USER_SETTINGS:
                await apply_client_settings_data(db, sync_item.record_id, data["client_data"])
        
        # Mark as resolved
        sync_item.status = SyncStatus.COMPLETED
        sync_item.error_message = None
        sync_item.updated_at = datetime.now()
        db.commit()
        db.refresh(sync_item)
        
        return sync_item
        
    except Exception as e:
        sync_item.error_message = f"Conflict resolution failed: {str(e)}"
        db.commit()
        raise

async def apply_client_visit_data(db: Session, record_id: int, client_data: Dict[str, Any]) -> None:
    """Apply client data to a visit record to resolve conflict"""
    # Implementation would update the visit with client data
    # Placeholder for now
    pass

async def apply_client_vital_data(db: Session, record_id: int, client_data: Dict[str, Any]) -> None:
    """Apply client data to a vital record to resolve conflict"""
    # Placeholder for now
    pass

async def apply_client_note_data(db: Session, record_id: int, client_data: Dict[str, Any]) -> None:
    """Apply client data to a note to resolve conflict"""
    # Placeholder for now
    pass

async def apply_client_document_data(db: Session, record_id: int, client_data: Dict[str, Any]) -> None:
    """Apply client data to a document to resolve conflict"""
    # Placeholder for now
    pass

async def apply_client_chat_data(db: Session, record_id: int, client_data: Dict[str, Any]) -> None:
    """Apply client data to a chat message to resolve conflict"""
    # Placeholder for now
    pass

async def apply_client_settings_data(db: Session, record_id: int, client_data: Dict[str, Any]) -> None:
    """Apply client data to user settings to resolve conflict"""
    # Placeholder for now
    pass
