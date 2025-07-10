from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload

from database import get_db
from models.user import User
from models.patient import Patient, PatientCondition, PatientAllergy, PatientMedication
from schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse, PatientListResponse,
    ConditionCreate, ConditionResponse,
    AllergyCreate, AllergyResponse,
    MedicationCreate, MedicationUpdate, MedicationResponse
)
from utils.auth import get_current_active_user

router = APIRouter()

# Patient endpoints
@router.post("/", response_model=PatientResponse, status_code=status.HTTP_201_CREATED)
async def create_patient(
    patient_data: PatientCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if user can create patients (admin or supervisor)
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create patients"
        )
    
    # Check if CPR number already exists
    existing_patient = db.query(Patient).filter(Patient.cpr_number == patient_data.cpr_number).first()
    if existing_patient:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Patient with this CPR number already exists"
        )
    
    # Create the patient
    new_patient = Patient(
        cpr_number=patient_data.cpr_number,
        first_name=patient_data.first_name,
        last_name=patient_data.last_name,
        date_of_birth=patient_data.date_of_birth,
        gender=patient_data.gender,
        phone_number=patient_data.phone_number,
        email=patient_data.email,
        address=patient_data.address,
        emergency_contact_name=patient_data.emergency_contact_name,
        emergency_contact_phone=patient_data.emergency_contact_phone,
        blood_type=patient_data.blood_type,
        is_active=patient_data.is_active
    )
    db.add(new_patient)
    db.flush()  # Flush to get the ID but don't commit yet
    
    # Add conditions if provided
    if patient_data.conditions:
        for condition_data in patient_data.conditions:
            # Check if condition already exists
            condition = db.query(PatientCondition).filter(
                PatientCondition.name == condition_data.name
            ).first()
            
            if not condition:
                condition = PatientCondition(**condition_data.dict())
                db.add(condition)
                db.flush()
            
            new_patient.conditions.append(condition)
    
    # Add allergies if provided
    if patient_data.allergies:
        for allergy_data in patient_data.allergies:
            # Check if allergy already exists
            allergy = db.query(PatientAllergy).filter(
                PatientAllergy.name == allergy_data.name
            ).first()
            
            if not allergy:
                allergy = PatientAllergy(**allergy_data.dict())
                db.add(allergy)
                db.flush()
            
            new_patient.allergies.append(allergy)
    
    # Add medications if provided
    if patient_data.medications:
        for med_data in patient_data.medications:
            # Create with the patient ID
            medication = PatientMedication(
                patient_id=new_patient.id,
                **med_data.dict(exclude={"patient_id"})
            )
            db.add(medication)
    
    db.commit()
    db.refresh(new_patient)
    return new_patient

@router.get("/", response_model=List[PatientListResponse])
async def get_patients(
    skip: int = 0,
    limit: int = 100,
    search: Optional[str] = None,
    is_active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    query = db.query(Patient)
    
    # Apply filters
    if search:
        search_term = f"%{search}%"
        query = query.filter(
            (Patient.first_name.ilike(search_term)) | 
            (Patient.last_name.ilike(search_term)) |
            (Patient.cpr_number.ilike(search_term))
        )
    
    if is_active is not None:
        query = query.filter(Patient.is_active == is_active)
    
    patients = query.order_by(Patient.last_name, Patient.first_name).offset(skip).limit(limit).all()
    return patients

@router.get("/{patient_id}", response_model=PatientResponse)
async def get_patient(
    patient_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    return patient

@router.put("/{patient_id}", response_model=PatientResponse)
async def update_patient(
    patient_id: int,
    patient_data: PatientUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if user can update patients (admin or supervisor)
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update patients"
        )
    
    patient = db.query(Patient).filter(Patient.id == patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    # Check CPR number uniqueness if changing it
    if patient_data.cpr_number and patient_data.cpr_number != patient.cpr_number:
        existing = db.query(Patient).filter(
            Patient.cpr_number == patient_data.cpr_number,
            Patient.id != patient_id
        ).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Patient with this CPR number already exists"
            )
    
    # Update fields if provided
    for field, value in patient_data.dict(exclude_unset=True).items():
        setattr(patient, field, value)
    
    db.commit()
    db.refresh(patient)
    return patient

# Conditions endpoints
@router.post("/conditions/", response_model=ConditionResponse)
async def create_condition(
    condition_data: ConditionCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Check if condition already exists
    existing = db.query(PatientCondition).filter(PatientCondition.name == condition_data.name).first()
    if existing:
        return existing
    
    condition = PatientCondition(**condition_data.dict())
    db.add(condition)
    db.commit()
    db.refresh(condition)
    return condition

@router.get("/conditions/", response_model=List[ConditionResponse])
async def get_conditions(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    conditions = db.query(PatientCondition).all()
    return conditions

# Allergies endpoints
@router.post("/allergies/", response_model=AllergyResponse)
async def create_allergy(
    allergy_data: AllergyCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    # Check if allergy already exists
    existing = db.query(PatientAllergy).filter(PatientAllergy.name == allergy_data.name).first()
    if existing:
        return existing
    
    allergy = PatientAllergy(**allergy_data.dict())
    db.add(allergy)
    db.commit()
    db.refresh(allergy)
    return allergy

@router.get("/allergies/", response_model=List[AllergyResponse])
async def get_allergies(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    allergies = db.query(PatientAllergy).all()
    return allergies

# Medications endpoints
@router.post("/medications/", response_model=MedicationResponse)
async def create_medication(
    medication_data: MedicationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify patient exists
    patient = db.query(Patient).filter(Patient.id == medication_data.patient_id).first()
    if not patient:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Patient not found"
        )
    
    medication = PatientMedication(**medication_data.dict())
    db.add(medication)
    db.commit()
    db.refresh(medication)
    return medication

@router.get("/medications/{patient_id}", response_model=List[MedicationResponse])
async def get_patient_medications(
    patient_id: int,
    active_only: bool = True,
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
    
    query = db.query(PatientMedication).filter(PatientMedication.patient_id == patient_id)
    
    if active_only:
        query = query.filter(PatientMedication.is_active == True)
    
    medications = query.all()
    return medications

@router.put("/medications/{medication_id}", response_model=MedicationResponse)
async def update_medication(
    medication_id: int,
    medication_data: MedicationUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    medication = db.query(PatientMedication).filter(PatientMedication.id == medication_id).first()
    if not medication:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Medication not found"
        )
    
    # Update fields if provided
    for field, value in medication_data.dict(exclude_unset=True).items():
        setattr(medication, field, value)
    
    db.commit()
    db.refresh(medication)
    return medication
