from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User
from models.note import Note, NoteType
from models.patient import Patient
from models.visit import Visit
from schemas.note import NoteCreate, NoteUpdate, NoteResponse, EscalateNoteRequest
from utils.auth import get_current_active_user
from utils.notifications import send_escalation_notification

router = APIRouter()

@router.post("/", response_model=NoteResponse, status_code=status.HTTP_201_CREATED)
async def create_note(
    note_data: NoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == note_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Verify visit exists if provided
    if note_data.visit_id:
        visit = db.query(Visit).filter(Visit.id == note_data.visit_id).first()
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
    
    # Create the note
    new_note = Note(
        patient_id=note_data.patient_id,
        visit_id=note_data.visit_id,
        created_by=current_user.id if note_data.created_by is None else note_data.created_by,
        note_type=note_data.note_type,
        title=note_data.title,
        content=note_data.content,
        is_pending=note_data.is_pending,
        sync_status=note_data.sync_status,
        is_escalated=note_data.is_escalated,
        escalated_to=note_data.escalated_to,
        escalation_reason=note_data.escalation_reason,
        escalation_time=note_data.escalation_time
    )
    
    db.add(new_note)
    db.commit()
    db.refresh(new_note)
    
    # Handle escalation if needed
    if new_note.is_escalated and new_note.escalated_to:
        await send_escalation_notification(db, new_note)
    
    return new_note

@router.get("/", response_model=List[NoteResponse])
async def get_notes(
    patient_id: Optional[int] = None,
    visit_id: Optional[int] = None,
    note_type: Optional[str] = None,
    is_pending: Optional[bool] = None,
    created_by: Optional[int] = None,
    is_escalated: Optional[bool] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Note)
    
    # Apply filters
    if patient_id:
        query = query.filter(Note.patient_id == patient_id)
    if visit_id:
        query = query.filter(Note.visit_id == visit_id)
    if note_type:
        query = query.filter(Note.note_type == note_type)
    if is_pending is not None:
        query = query.filter(Note.is_pending == is_pending)
    if created_by:
        query = query.filter(Note.created_by == created_by)
    if is_escalated is not None:
        query = query.filter(Note.is_escalated == is_escalated)
    
    # If caregiver, only show their own notes or notes for their visits
    if current_user.role.value == "caregiver":
        query = query.filter(
            (Note.created_by == current_user.id) | 
            (Note.visit_id.in_(
                db.query(Visit.id).filter(Visit.caregiver_id == current_user.id)
            ))
        )
    
    # Order by most recent first
    query = query.order_by(Note.created_at.desc())
    
    notes = query.offset(skip).limit(limit).all()
    return notes

@router.get("/pending", response_model=List[NoteResponse])
async def get_pending_notes(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get pending notes created by this user
    query = db.query(Note).filter(
        Note.created_by == current_user.id,
        Note.is_pending == True
    ).order_by(Note.created_at.desc())
    
    notes = query.all()
    return notes

@router.get("/{note_id}", response_model=NoteResponse)
async def get_note(
    note_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check permissions for caregivers
    if current_user.role.value == "caregiver":
        # Caregivers can view notes they created or for visits they are assigned to
        is_creator = note.created_by == current_user.id
        is_visit_caregiver = False
        
        if note.visit_id:
            visit = db.query(Visit).filter(Visit.id == note.visit_id).first()
            is_visit_caregiver = visit and visit.caregiver_id == current_user.id
        
        if not (is_creator or is_visit_caregiver):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to view this note"
            )
    
    return note

@router.put("/{note_id}", response_model=NoteResponse)
async def update_note(
    note_id: int,
    note_data: NoteUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    note = db.query(Note).filter(Note.id == note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver":
        # Caregivers can only update notes they created
        if note.created_by != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to update this note"
            )
    
    # Update fields
    was_escalated = note.is_escalated
    
    for field, value in note_data.dict(exclude_unset=True).items():
        setattr(note, field, value)
    
    db.commit()
    db.refresh(note)
    
    # If note was escalated and wasn't before, send notification
    if note.is_escalated and not was_escalated and note.escalated_to:
        await send_escalation_notification(db, note)
    
    return note

@router.post("/escalate", response_model=NoteResponse)
async def escalate_note(
    escalation_data: EscalateNoteRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    note = db.query(Note).filter(Note.id == escalation_data.note_id).first()
    
    if not note:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Note not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver":
        # Verify the caregiver created this note or is assigned to the visit
        is_creator = note.created_by == current_user.id
        is_visit_caregiver = False
        
        if note.visit_id:
            visit = db.query(Visit).filter(Visit.id == note.visit_id).first()
            is_visit_caregiver = visit and visit.caregiver_id == current_user.id
        
        if not (is_creator or is_visit_caregiver):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to escalate this note"
            )
    
    # Verify escalated_to user exists and is a doctor or supervisor
    escalated_to_user = db.query(User).filter(User.id == escalation_data.escalated_to).first()
    if not escalated_to_user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Escalation recipient not found"
        )
    
    if escalated_to_user.role.value not in ["doctor", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Notes can only be escalated to doctors or supervisors"
        )
    
    # Update the note
    note.is_escalated = True
    note.escalated_to = escalation_data.escalated_to
    note.escalation_reason = escalation_data.escalation_reason
    note.escalation_time = escalation_data.escalation_time or datetime.now()
    
    db.commit()
    db.refresh(note)
    
    # Send notification to the escalated user
    await send_escalation_notification(db, note)
    
    return note
