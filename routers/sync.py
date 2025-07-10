import json
from typing import List, Optional, Dict, Any
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, Body
from sqlalchemy.orm import Session
from sqlalchemy import and_, or_, func

from database import get_db
from models.user import User
from models.sync import SyncItem, SyncStatus, SyncType
from schemas.sync import (
    SyncItemCreate, SyncItemResponse, SyncItemUpdate,
    SyncBatchRequest, SyncBatchResponse, SyncConflict
)
from utils.auth import get_current_active_user
from utils.sync_manager import process_sync_item, handle_batch_sync, resolve_conflicts

router = APIRouter()

@router.post("/items", response_model=SyncItemResponse, status_code=status.HTTP_201_CREATED)
async def create_sync_item(
    sync_data: SyncItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify user matches
    if sync_data.user_id != current_user.id and current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create sync items for yourself"
        )
    
    # Create the sync item
    sync_item = SyncItem(**sync_data.dict())
    db.add(sync_item)
    db.commit()
    db.refresh(sync_item)
    
    return sync_item

@router.get("/items", response_model=List[SyncItemResponse])
async def get_sync_items(
    status: Optional[str] = None,
    sync_type: Optional[str] = None,
    is_upload: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Users can only view their own sync items
    query = db.query(SyncItem).filter(SyncItem.user_id == current_user.id)
    
    # Apply filters
    if status:
        query = query.filter(SyncItem.status == status)
    if sync_type:
        query = query.filter(SyncItem.sync_type == sync_type)
    if is_upload is not None:
        query = query.filter(SyncItem.is_upload == is_upload)
    
    # Order by creation date descending (newest first)
    query = query.order_by(SyncItem.created_at.desc())
    
    sync_items = query.offset(skip).limit(limit).all()
    return sync_items

@router.get("/items/{sync_id}", response_model=SyncItemResponse)
async def get_sync_item(
    sync_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sync_item = db.query(SyncItem).filter(SyncItem.id == sync_id).first()
    
    if not sync_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sync item not found"
        )
    
    # Check if sync item belongs to the current user
    if sync_item.user_id != current_user.id and current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to view this sync item"
        )
    
    return sync_item

@router.put("/items/{sync_id}", response_model=SyncItemResponse)
async def update_sync_item(
    sync_id: int,
    sync_data: SyncItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sync_item = db.query(SyncItem).filter(SyncItem.id == sync_id).first()
    
    if not sync_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sync item not found"
        )
    
    # Check if sync item belongs to the current user
    if sync_item.user_id != current_user.id and current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to update this sync item"
        )
    
    # Update fields
    for field, value in sync_data.dict(exclude_unset=True).items():
        setattr(sync_item, field, value)
    
    db.commit()
    db.refresh(sync_item)
    return sync_item

@router.post("/batch", response_model=SyncBatchResponse)
async def sync_batch(
    batch_data: SyncBatchRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify user matches
    if batch_data.user_id != current_user.id and current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only sync data for yourself"
        )
    
    # Process the batch sync
    result = await handle_batch_sync(db, batch_data)
    return result

@router.post("/retry/{sync_id}", response_model=SyncItemResponse)
async def retry_sync_item(
    sync_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sync_item = db.query(SyncItem).filter(SyncItem.id == sync_id).first()
    
    if not sync_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sync item not found"
        )
    
    # Check if sync item belongs to the current user
    if sync_item.user_id != current_user.id and current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to retry this sync item"
        )
    
    # Check if item can be retried
    if sync_item.status not in [SyncStatus.FAILED, SyncStatus.CONFLICT]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot retry sync item with status {sync_item.status.value}"
        )
    
    # Update sync item for retry
    sync_item.status = SyncStatus.PENDING
    sync_item.retry_count += 1
    sync_item.last_retry_at = datetime.now()
    sync_item.error_message = None
    
    db.commit()
    db.refresh(sync_item)
    
    # Process the sync item
    result = await process_sync_item(db, sync_item)
    
    return result

@router.post("/resolve-conflict/{sync_id}", response_model=SyncItemResponse)
async def resolve_sync_conflict(
    sync_id: int,
    resolution: str = Body(..., embed=True),  # server_wins or client_wins
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sync_item = db.query(SyncItem).filter(SyncItem.id == sync_id).first()
    
    if not sync_item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Sync item not found"
        )
    
    # Check if sync item belongs to the current user
    if sync_item.user_id != current_user.id and current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You don't have permission to resolve this conflict"
        )
    
    # Check if item is in conflict state
    if sync_item.status != SyncStatus.CONFLICT:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="This sync item is not in a conflict state"
        )
    
    # Validate resolution
    if resolution not in ["server_wins", "client_wins"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Resolution must be either 'server_wins' or 'client_wins'"
        )
    
    # Resolve the conflict
    resolved_item = await resolve_conflicts(db, sync_item, resolution)
    
    return resolved_item

@router.get("/status", response_model=Dict[str, Any])
async def get_sync_status(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get sync status summary for the current user"""
    
    # Count items by status
    status_counts = {}
    for status in SyncStatus:
        count = db.query(func.count(SyncItem.id)).filter(
            SyncItem.user_id == current_user.id,
            SyncItem.status == status
        ).scalar()
        status_counts[status.value] = count
    
    # Count items by type
    type_counts = {}
    for sync_type in SyncType:
        count = db.query(func.count(SyncItem.id)).filter(
            SyncItem.user_id == current_user.id,
            SyncItem.sync_type == sync_type
        ).scalar()
        type_counts[sync_type.value] = count
    
    # Get last successful sync timestamp
    last_success = db.query(func.max(SyncItem.updated_at)).filter(
        SyncItem.user_id == current_user.id,
        SyncItem.status == SyncStatus.COMPLETED
    ).scalar()
    
    return {
        "by_status": status_counts,
        "by_type": type_counts,
        "total_items": sum(status_counts.values()),
        "last_successful_sync": last_success,
        "has_pending_items": status_counts.get("pending", 0) > 0,
        "has_failed_items": status_counts.get("failed", 0) > 0,
        "has_conflicts": status_counts.get("conflict", 0) > 0
    }
