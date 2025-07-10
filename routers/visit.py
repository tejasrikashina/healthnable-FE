from typing import List, Optional
from datetime import datetime, timedelta
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import and_, or_, func

from database import get_db
from models.user import User
from models.visit import Visit, VisitTask, VisitStatus, TaskStatus
from models.patient import Patient
from schemas.visit import (
    VisitCreate, VisitUpdate, VisitResponse, VisitScheduleResponse,
    VisitTaskCreate, VisitTaskUpdate, VisitTaskResponse,
    MarkArrivalRequest, CompleteVisitRequest
)
from utils.auth import get_current_active_user

router = APIRouter()

# Visit endpoints
@router.post("/", response_model=VisitResponse, status_code=status.HTTP_201_CREATED)
async def create_visit(
    visit_data: VisitCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if user can create visits (admin or supervisor)
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create visits"
        )
    
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == visit_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify caregiver exists if provided
    if visit_data.caregiver_id:
        caregiver = db.query(User).filter(
            User.id == visit_data.caregiver_id,
            User.role == "caregiver"
        ).first()
        if not caregiver:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Caregiver not found"
            )
    
    # Create the visit
    new_visit = Visit(**visit_data.dict(exclude={"tasks"}))
    db.add(new_visit)
    db.flush()  # Get ID but don't commit yet
    
    # Add tasks if provided
    if visit_data.tasks:
        for i, task_data in enumerate(visit_data.tasks):
            task = VisitTask(
                visit_id=new_visit.id,
                task_name=task_data.task_name,
                description=task_data.description,
                status=task_data.status,
                order=task_data.order or i,
                is_required=task_data.is_required,
                notes=task_data.notes
            )
            db.add(task)
    
    db.commit()
    db.refresh(new_visit)
    return new_visit

@router.get("/", response_model=List[VisitScheduleResponse])
async def get_visits(
    start_date: Optional[datetime] = None,
    end_date: Optional[datetime] = None,
    status: Optional[str] = None,
    caregiver_id: Optional[int] = None,
    patient_id: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(
        Visit.id,
        Visit.patient_id,
        func.concat(Patient.first_name, ' ', Patient.last_name).label('patient_name'),
        Visit.scheduled_start,
        Visit.scheduled_end,
        Visit.status,
        Visit.visit_type,
        Visit.location_address
    ).join(Patient)
    
    # Add filters
    if start_date:
        query = query.filter(Visit.scheduled_start >= start_date)
    if end_date:
        query = query.filter(Visit.scheduled_start <= end_date)
    if status:
        query = query.filter(Visit.status == status)
    if patient_id:
        query = query.filter(Visit.patient_id == patient_id)
    
    # Handle caregiver-specific permissions
    if current_user.role.value == "caregiver":
        # Caregivers can only see their own visits
        query = query.filter(Visit.caregiver_id == current_user.id)
    elif caregiver_id and current_user.role.value in ["admin", "supervisor"]:
        # Admin/supervisors can filter by specific caregiver
        query = query.filter(Visit.caregiver_id == caregiver_id)
    
    # Order by scheduled start time
    query = query.order_by(Visit.scheduled_start)
    
    # Paginate
    visits = query.offset(skip).limit(limit).all()
    
    # Convert to response model
    result = []
    for visit in visits:
        result.append({
            "id": visit.id,
            "patient_id": visit.patient_id,
            "patient_name": visit.patient_name,
            "scheduled_start": visit.scheduled_start,
            "scheduled_end": visit.scheduled_end,
            "status": visit.status,
            "visit_type": visit.visit_type,
            "location_address": visit.location_address
        })
    
    return result

@router.get("/today", response_model=List[VisitScheduleResponse])
async def get_today_visits(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Calculate today's date range in user's timezone
    today = datetime.now().date()
    start_of_day = datetime.combine(today, datetime.min.time())
    end_of_day = datetime.combine(today, datetime.max.time())
    
    query = db.query(
        Visit.id,
        Visit.patient_id,
        func.concat(Patient.first_name, ' ', Patient.last_name).label('patient_name'),
        Visit.scheduled_start,
        Visit.scheduled_end,
        Visit.status,
        Visit.visit_type,
        Visit.location_address
    ).join(Patient).filter(
        Visit.scheduled_start >= start_of_day,
        Visit.scheduled_start <= end_of_day
    )
    
    # Handle caregiver-specific permissions
    if current_user.role.value == "caregiver":
        query = query.filter(Visit.caregiver_id == current_user.id)
    
    # Order by scheduled start time
    query = query.order_by(Visit.scheduled_start)
    
    visits = query.all()
    
    # Convert to response model
    result = []
    for visit in visits:
        result.append({
            "id": visit.id,
            "patient_id": visit.patient_id,
            "patient_name": visit.patient_name,
            "scheduled_start": visit.scheduled_start,
            "scheduled_end": visit.scheduled_end,
            "status": visit.status,
            "visit_type": visit.visit_type,
            "location_address": visit.location_address
        })
    
    return result

@router.get("/{visit_id}", response_model=VisitResponse)
async def get_visit(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver" and visit.caregiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view this visit"
        )
    
    return visit

@router.put("/{visit_id}", response_model=VisitResponse)
async def update_visit(
    visit_id: int,
    visit_data: VisitUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    # Check permissions - supervisors/admins can edit any visit
    # Caregivers can only update certain fields of their own visits
    if current_user.role.value == "caregiver":
        if visit.caregiver_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this visit"
            )
        
        # Caregivers can only update status, actual_start, actual_end, summary
        allowed_fields = ["status", "actual_start", "actual_end", "summary", "is_synced", "sync_timestamp"]
        for field in visit_data.dict(exclude_unset=True).keys():
            if field not in allowed_fields:
                raise HTTPException(
                    status_code=status.HTTP_403_FORBIDDEN,
                    detail=f"Caregivers cannot update the {field} field"
                )
    
    # Update fields
    for field, value in visit_data.dict(exclude_unset=True).items():
        setattr(visit, field, value)
    
    db.commit()
    db.refresh(visit)
    return visit

@router.post("/mark-arrival", response_model=VisitResponse)
async def mark_arrival(
    arrival_data: MarkArrivalRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    visit = db.query(Visit).filter(Visit.id == arrival_data.visit_id).first()
    
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
    
    # Check if visit can be marked as arrived
    if visit.status not in [VisitStatus.SCHEDULED, VisitStatus.STARTED]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot mark arrival for visit with status {visit.status.value}"
        )
    
    # Verify arrival based on method
    if arrival_data.verification_method == "GPS":
        # Implement GPS verification logic here
        # For example, check if the provided coordinates are within X meters of the visit location
        pass
    elif arrival_data.verification_method == "OTP":
        # Verify OTP code
        if not arrival_data.verification_code or arrival_data.verification_code != visit.arrival_verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid verification code"
            )
    elif arrival_data.verification_method == "NFC":
        # NFC verification would typically be handled in the mobile app
        # We just check that a verification code was sent
        if not arrival_data.verification_code:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="NFC verification code required"
            )
    
    # Update visit status and actual start time
    visit.status = VisitStatus.ARRIVED
    visit.actual_start = arrival_data.timestamp
    visit.arrival_verification_method = arrival_data.verification_method
    
    # Update location if provided
    if arrival_data.latitude and arrival_data.longitude:
        visit.location_lat = arrival_data.latitude
        visit.location_lng = arrival_data.longitude
    
    db.commit()
    db.refresh(visit)
    return visit

@router.post("/complete", response_model=VisitResponse)
async def complete_visit(
    completion_data: CompleteVisitRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    visit = db.query(Visit).filter(Visit.id == completion_data.visit_id).first()
    
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
    
    # Check if visit can be completed
    valid_statuses = [VisitStatus.STARTED, VisitStatus.ARRIVED, VisitStatus.IN_PROGRESS]
    if visit.status not in valid_statuses:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Cannot complete visit with status {visit.status.value}"
        )
    
    # Update visit status and end time
    visit.status = VisitStatus.COMPLETED
    visit.actual_end = completion_data.timestamp
    if completion_data.summary:
        visit.summary = completion_data.summary
    
    # Update tasks
    if completion_data.completed_tasks:
        for task_id in completion_data.completed_tasks:
            task = db.query(VisitTask).filter(
                VisitTask.id == task_id, 
                VisitTask.visit_id == visit.id
            ).first()
            
            if task:
                task.status = TaskStatus.COMPLETED
                task.completed_at = completion_data.timestamp
                task.completed_by = current_user.id
    
    if completion_data.skipped_tasks:
        for task_id in completion_data.skipped_tasks:
            task = db.query(VisitTask).filter(
                VisitTask.id == task_id, 
                VisitTask.visit_id == visit.id
            ).first()
            
            if task:
                task.status = TaskStatus.SKIPPED
    
    db.commit()
    db.refresh(visit)
    return visit

# Visit Task endpoints
@router.post("/tasks/", response_model=VisitTaskResponse)
async def create_visit_task(
    task_data: VisitTaskCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify visit exists
    visit = db.query(Visit).filter(Visit.id == task_data.visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver" and visit.caregiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to add tasks to this visit"
        )
    
    # Create task
    task = VisitTask(**task_data.dict())
    db.add(task)
    db.commit()
    db.refresh(task)
    return task

@router.put("/tasks/{task_id}", response_model=VisitTaskResponse)
async def update_visit_task(
    task_id: int,
    task_data: VisitTaskUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    task = db.query(VisitTask).filter(VisitTask.id == task_id).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Check permissions
    visit = db.query(Visit).filter(Visit.id == task.visit_id).first()
    if current_user.role.value == "caregiver" and visit.caregiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update tasks for this visit"
        )
    
    # Update fields
    for field, value in task_data.dict(exclude_unset=True).items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.get("/tasks/{visit_id}", response_model=List[VisitTaskResponse])
async def get_visit_tasks(
    visit_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify visit exists
    visit = db.query(Visit).filter(Visit.id == visit_id).first()
    if not visit:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Visit not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver" and visit.caregiver_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to view tasks for this visit"
        )
    
    tasks = db.query(VisitTask).filter(VisitTask.visit_id == visit_id).order_by(VisitTask.order).all()
    return tasks
