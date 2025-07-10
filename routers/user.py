from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, CaregiverProfile
from schemas.user import UserCreate, UserUpdate, UserResponse, CaregiverProfileCreate, CaregiverProfileUpdate, CaregiverProfileResponse
from utils.auth import get_current_user, get_current_active_user, is_admin
from utils.auth import get_password_hash

router = APIRouter()

@router.post("/", response_model=UserResponse, status_code=status.HTTP_201_CREATED)
async def create_user(
    user_data: UserCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Check if admin or supervisor (only they can create users)
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to create users"
        )
    
    # Check if username or email already exists
    db_user = db.query(User).filter(User.username == user_data.username).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Username already registered"
        )
    
    db_user = db.query(User).filter(User.email == user_data.email).first()
    if db_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    # Create user
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed_password,
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        phone_number=user_data.phone_number,
        role=user_data.role
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    
    # Create caregiver profile if role is caregiver
    if user_data.role.value == "caregiver" and user_data.caregiver_profile:
        caregiver_profile = CaregiverProfile(
            user_id=db_user.id,
            license_number=user_data.caregiver_profile.license_number,
            license_expiry=user_data.caregiver_profile.license_expiry,
            specialization=user_data.caregiver_profile.specialization,
            qualification=user_data.caregiver_profile.qualification,
            bio=user_data.caregiver_profile.bio,
            years_of_experience=user_data.caregiver_profile.years_of_experience,
            profile_image_url=user_data.caregiver_profile.profile_image_url
        )
        db.add(caregiver_profile)
        db.commit()
        db.refresh(caregiver_profile)
    
    return db_user

@router.get("/", response_model=List[UserResponse])
async def get_users(
    skip: int = 0,
    limit: int = 100,
    role: Optional[str] = None,
    active: Optional[bool] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Only admins and supervisors can list all users
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to list users"
        )
    
    query = db.query(User)
    
    # Apply filters if provided
    if role:
        query = query.filter(User.role == role)
    if active is not None:
        query = query.filter(User.is_active == active)
        
    users = query.offset(skip).limit(limit).all()
    return users

@router.get("/me", response_model=UserResponse)
async def get_current_user_info(current_user: User = Depends(get_current_active_user)):
    return current_user

@router.get("/{user_id}", response_model=UserResponse)
async def get_user(
    user_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can view their own profile or admins/supervisors can view any profile
    if current_user.id != user_id and current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to view this user"
        )
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return db_user

@router.put("/{user_id}", response_model=UserResponse)
async def update_user(
    user_id: int,
    user_data: UserUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    # Users can update their own profile or admins can update any profile
    if current_user.id != user_id and current_user.role.value != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions to update this user"
        )
    
    db_user = db.query(User).filter(User.id == user_id).first()
    if db_user is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    
    # Update user fields if provided
    if user_data.username is not None:
        # Check if username is already taken
        existing = db.query(User).filter(User.username == user_data.username, User.id != user_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already registered"
            )
        db_user.username = user_data.username
        
    if user_data.email is not None:
        # Check if email is already taken
        existing = db.query(User).filter(User.email == user_data.email, User.id != user_id).first()
        if existing:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
        db_user.email = user_data.email
        
    if user_data.first_name is not None:
        db_user.first_name = user_data.first_name
    if user_data.last_name is not None:
        db_user.last_name = user_data.last_name
    if user_data.phone_number is not None:
        db_user.phone_number = user_data.phone_number
        
    # Only admins can change roles or active status
    if current_user.role.value == "admin":
        if user_data.role is not None:
            db_user.role = user_data.role
        if user_data.is_active is not None:
            db_user.is_active = user_data.is_active
    
    # Update caregiver profile if exists and user is a caregiver
    if user_data.caregiver_profile is not None and db_user.role.value == "caregiver":
        profile = db_user.caregiver_profile
        
        # Create profile if it doesn't exist
        if profile is None:
            profile = CaregiverProfile(user_id=db_user.id)
            db.add(profile)
            db.flush()
        
        profile_data = user_data.caregiver_profile
        if profile_data.license_number is not None:
            profile.license_number = profile_data.license_number
        if profile_data.license_expiry is not None:
            profile.license_expiry = profile_data.license_expiry
        if profile_data.specialization is not None:
            profile.specialization = profile_data.specialization
        if profile_data.qualification is not None:
            profile.qualification = profile_data.qualification
        if profile_data.bio is not None:
            profile.bio = profile_data.bio
        if profile_data.years_of_experience is not None:
            profile.years_of_experience = profile_data.years_of_experience
        if profile_data.profile_image_url is not None:
            profile.profile_image_url = profile_data.profile_image_url
    
    db.commit()
    db.refresh(db_user)
    return db_user

@router.get("/caregivers/available", response_model=List[UserResponse])
async def get_available_caregivers(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Get all active caregivers for assignment to visits"""
    if current_user.role.value not in ["admin", "supervisor"]:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Insufficient permissions"
        )
    
    caregivers = db.query(User).filter(
        User.role == "caregiver",
        User.is_active == True
    ).all()
    
    return caregivers
