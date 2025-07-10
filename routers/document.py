import os
from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query, UploadFile, File, Form
from sqlalchemy.orm import Session
import shutil
from pathlib import Path

from database import get_db
from models.user import User
from models.document import Document, DocumentType
from models.patient import Patient
from models.visit import Visit
from models.note import Note
from schemas.document import DocumentCreate, DocumentResponse, DocumentUpdate
from utils.auth import get_current_active_user
from utils.file_handler import save_upload_file, validate_file_type, get_file_path, delete_file
from config import settings

router = APIRouter()

@router.post("/upload", response_model=DocumentResponse, status_code=status.HTTP_201_CREATED)
async def upload_document(
    file: UploadFile = File(...),
    document_type: DocumentType = Form(...),
    title: str = Form(...),
    description: Optional[str] = Form(None),
    patient_id: Optional[int] = Form(None),
    visit_id: Optional[int] = Form(None),
    note_id: Optional[int] = Form(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Validate file type
    if not validate_file_type(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="File type not allowed"
        )
    
    # Check file size
    file_size = 0
    file.file.seek(0, 2)  # Seek to end of file
    file_size = file.file.tell()  # Get file size
    file.file.seek(0)  # Reset file pointer
    
    if file_size > settings.MAX_UPLOAD_SIZE:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File too large. Maximum size is {settings.MAX_UPLOAD_SIZE / (1024 * 1024)}MB"
        )
    
    # Validate references if provided
    if patient_id:
        patient = db.query(Patient).filter(Patient.id == patient_id).first()
        if not patient:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Patient not found"
            )
    
    if visit_id:
        visit = db.query(Visit).filter(Visit.id == visit_id).first()
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
    
    if note_id:
        note = db.query(Note).filter(Note.id == note_id).first()
        if not note:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Note not found"
            )
    
    # Save the file
    file_path, filename, file_type = await save_upload_file(file)
    
    # Create document record
    document = Document(
        filename=filename,
        file_path=file_path,
        file_type=file_type,
        file_size=file_size,
        document_type=document_type,
        title=title,
        description=description,
        uploaded_by=current_user.id,
        patient_id=patient_id,
        visit_id=visit_id,
        note_id=note_id,
        is_synced=False
    )
    
    db.add(document)
    db.commit()
    db.refresh(document)
    
    return document

@router.get("/", response_model=List[DocumentResponse])
async def get_documents(
    patient_id: Optional[int] = None,
    visit_id: Optional[int] = None,
    note_id: Optional[int] = None,
    document_type: Optional[str] = None,
    uploaded_by: Optional[int] = None,
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Document)
    
    # Apply filters
    if patient_id:
        query = query.filter(Document.patient_id == patient_id)
    if visit_id:
        query = query.filter(Document.visit_id == visit_id)
    if note_id:
        query = query.filter(Document.note_id == note_id)
    if document_type:
        query = query.filter(Document.document_type == document_type)
    if uploaded_by:
        query = query.filter(Document.uploaded_by == uploaded_by)
    
    # For caregivers, limit to documents they've uploaded or for their visits
    if current_user.role.value == "caregiver":
        query = query.filter(
            (Document.uploaded_by == current_user.id) | 
            (Document.visit_id.in_(
                db.query(Visit.id).filter(Visit.caregiver_id == current_user.id)
            ))
        )
    
    # Order by upload date (newest first)
    query = query.order_by(Document.created_at.desc())
    
    documents = query.offset(skip).limit(limit).all()
    return documents

@router.get("/{document_id}", response_model=DocumentResponse)
async def get_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver":
        # Caregivers can only access documents they uploaded or for their visits
        is_uploader = document.uploaded_by == current_user.id
        is_visit_caregiver = False
        
        if document.visit_id:
            visit = db.query(Visit).filter(Visit.id == document.visit_id).first()
            is_visit_caregiver = visit and visit.caregiver_id == current_user.id
        
        if not (is_uploader or is_visit_caregiver):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not have permission to access this document"
            )
    
    return document

@router.delete("/{document_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_document(
    document_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver" and document.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to delete this document"
        )
    
    # Delete the file from storage
    await delete_file(document.file_path)
    
    # Delete record from database
    db.delete(document)
    db.commit()
    
    return None

@router.put("/{document_id}", response_model=DocumentResponse)
async def update_document(
    document_id: int,
    document_data: DocumentUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    document = db.query(Document).filter(Document.id == document_id).first()
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check permissions
    if current_user.role.value == "caregiver" and document.uploaded_by != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to update this document"
        )
    
    # Update fields
    for field, value in document_data.dict(exclude_unset=True).items():
        setattr(document, field, value)
    
    db.commit()
    db.refresh(document)
    return document

@router.get("/patient/{patient_id}/profile-documents", response_model=List[DocumentResponse])
async def get_patient_profile_documents(
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
    
    # Get documents associated with the patient but not tied to any specific visit
    documents = db.query(Document).filter(
        Document.patient_id == patient_id,
        Document.visit_id.is_(None)
    ).order_by(Document.created_at.desc()).all()
    
    return documents
