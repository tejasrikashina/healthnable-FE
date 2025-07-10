from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.vital import VitalRecord, VitalType, DeviceSync
from models.patient import Patient
from models.visit import Visit
from schemas.vital import (
    VitalRecordCreate, VitalRecordUpdate, VitalRecordResponse,
    DeviceSyncCreate, DeviceSyncResponse, BatchVitalRecordCreate
)
from utils.auth import get_current_active_user

router = APIRouter()

@router.post("/", response_model=VitalRecordResponse, status_code=status.HTTP_201_CREATED)
async def create_vital_record(
    vital_data: VitalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == vital_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify visit exists if provided
    if vital_data.visit_id:
        visit = db.query(Visit).filter(Visit.id == vital_data.visit_id).first()
        if not visit:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Visit not found"
            )
        
        # Check if caregiver is assigned to this visit
        if current_user.role.value == "caregiver" and visit.caregiver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You are not assigned to this visit"
            )
    
    # Create the vital record
    new_vital = VitalRecord(
        patient_id=vital_data.patient_id,
        visit_id=vital_data.visit_id,
        recorded_by=current_user.id if vital_data.recorded_by is None else vital_data.recorded_by,
        vital_type=vital_data.vital_type,
        value=vital_data.value,
        unit=vital_data.unit,
        is_abnormal=vital_data.is_abnormal,
        comments=vital_data.comments,
        device_sync_id=vital_data.device_sync_id,
        is_synced=vital_data.is_synced
    )
    
    db.add(new_vital)
    db.commit()
    db.refresh(new_vital)
    return new_vital

@router.post("/batch", response_model=List[VitalRecordResponse])
async def create_batch_vital_records(
    batch_data: BatchVitalRecordCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    result = []
    
    # Create device sync if provided
    device_sync_id = None
    if batch_data.device_sync:
        device_sync = DeviceSync(
            device_type=batch_data.device_sync.device_type,
            device_id=batch_data.device_sync.device_id,
            device_name=batch_data.device_sync.device_name,
            sync_time=batch_data.device_sync.sync_time or datetime.now(),
            raw_data=batch_data.device_sync.raw_data,
            sync_status=batch_data.device_sync.sync_status,
            error_message=batch_data.device_sync.error_message,
            created_by=current_user.id if batch_data.device_sync.created_by is None else batch_data.device_sync.created_by
        )
        db.add(device_sync)
        db.flush()  # Get ID without committing yet
        device_sync_id = device_sync.id
    
    # Create all vital records
    for vital_data in batch_data.records:
        # Set the device_sync_id if we created one
        if device_sync_id and not vital_data.device_sync_id:
            vital_data.device_sync_id = device_sync_id
        
        # Set the recorder if not provided
        if not vital_data.recorded_by:
            vital_data.recorded_by = current_user.id
        
        # Create the vital record
        new_vital = VitalRecord(**vital_data.dict())
        db.add(new_vital)
        db.flush()  # Get ID but don't commit yet
        result.append(new_vital)
    
    db.commit()
    # Refresh all records to get updated values
    for vital in result:
        db.refresh(vital)
    
    return result

@router.get("/", response_model=List[VitalRecordResponse])
async def get_vital_records(
    patient_id: Optional[int] = None,
    visit_id: Optional[int] = None,
    vital_type: Optional[str] = None,
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(VitalRecord)
    
    # Apply filters
    if patient_id:
        query = query.filter(VitalRecord.patient_id == patient_id)
    if visit_id:
        query = query.filter(VitalRecord.visit_id == visit_id)
    if vital_type:
        query = query.filter(VitalRecord.vital_type == vital_type)
    if start_date:
        query = query.filter(VitalRecord.created_at >= start_date)
    if end_date:
        query = query.filter(VitalRecord.created_at <= end_date)
    
    # Caregiver-specific filtering
    if current_user.role.value == "caregiver":
        # Caregivers can only see vitals they recorded or for visits they are assigned to
        query = query.filter(
            (VitalRecord.recorded_by == current_user.id) | 
            (VitalRecord.visit_id.in_(
                db.query(Visit.id).filter(Visit.caregiver_id == current_user.id)
            ))
        )
    
    # Order by most recent first
    query = query.order_by(VitalRecord.created_at.desc())
    
    vitals = query.offset(skip).limit(limit).all()
    return vitals

@router.get("/{vital_id}", response_model=VitalRecordResponse)
async def get_vital_record(
    vital_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    vital = db.query(VitalRecord).filter(VitalRecord.id == vital_id).first()
    
    if not vital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vital record not found"
        )
    
    # Check permissions for caregivers
    if current_user.role.value == "caregiver":
        # Verify if the caregiver recorded this vital or is assigned to the visit
        is_recorder = vital.recorded_by == current_user.id
        is_visit_caregiver = False
        
        if vital.visit_id:
            visit = db.query(Visit).filter(Visit.id == vital.visit_id).first()
            is_visit_caregiver = visit and visit.caregiver_id == current_user.id
        
        if not (is_recorder or is_visit_caregiver):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this vital record"
            )
    
    return vital

@router.put("/{vital_id}", response_model=VitalRecordResponse)
async def update_vital_record(
    vital_id: int,
    vital_data: VitalRecordUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    vital = db.query(VitalRecord).filter(VitalRecord.id == vital_id).first()
    
    if not vital:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Vital record not found"
        )
    
    # Check permissions for caregivers
    if current_user.role.value == "caregiver":
        # Only allow caregivers to update records they created
        if vital.recorded_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this vital record"
            )
    
    # Update fields
    for field, value in vital_data.dict(exclude_unset=True).items():
        setattr(vital, field, value)
    
    db.commit()
    db.refresh(vital)
    return vital

@router.post("/device-sync", response_model=DeviceSyncResponse)
async def create_device_sync(
    sync_data: DeviceSyncCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Create the device sync record
    new_sync = DeviceSync(
        device_type=sync_data.device_type,
        device_id=sync_data.device_id,
        device_name=sync_data.device_name,
        sync_time=sync_data.sync_time or datetime.now(),
        raw_data=sync_data.raw_data,
        sync_status=sync_data.sync_status,
        error_message=sync_data.error_message,
        created_by=current_user.id if sync_data.created_by is None else sync_data.created_by
    )
    
    db.add(new_sync)
    db.commit()
    db.refresh(new_sync)
    
    # Create vital records if provided
    if sync_data.vital_records:
        for vital_data in sync_data.vital_records:
            # Set the device_sync_id
            vital_data.device_sync_id = new_sync.id
            
            # Set the recorder if not provided
            if not vital_data.recorded_by:
                vital_data.recorded_by = current_user.id
            
            # Create the vital record
            new_vital = VitalRecord(**vital_data.dict())
            db.add(new_vital)
        
        db.commit()
        db.refresh(new_sync)  # Refresh to get the related vitals
    
    return new_sync

@router.get("/device-sync/{sync_id}", response_model=DeviceSyncResponse)
async def get_device_sync(
    sync_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    sync = db.query(DeviceSync).filter(DeviceSync.id == sync_id).first()
    
    if not sync:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Device sync record not found"
        )
    
    # Check permissions for caregivers
    if current_user.role.value == "caregiver" and sync.created_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this device sync record"
        )
    
    return sync

@router.get("/patient/{patient_id}/latest", response_model=List[VitalRecordResponse])
async def get_latest_patient_vitals(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Get the latest record for each vital type
    latest_vitals = []
    
    for vital_type in VitalType:
        latest = db.query(VitalRecord).filter(
            VitalRecord.patient_id == patient_id,
            VitalRecord.vital_type == vital_type
        ).order_by(VitalRecord.created_at.desc()).first()
        
        if latest:
            latest_vitals.append(latest)
    
    return latest_vitals
