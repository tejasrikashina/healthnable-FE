from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from database import get_db
from models.user import User, CaregiverProfile
from models.settings import UserSettings, CaregiverPreference
from schemas.settings import (
    UserSettingsUpdate, UserSettingsResponse,
    CaregiverPreferenceCreate, CaregiverPreferenceResponse, CaregiverPreferenceUpdate
)
from utils.auth import get_current_active_user

router = APIRouter()

@router.get("/user", response_model=UserSettingsResponse)
async def get_user_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get or create settings for the current user
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        # Create default settings
        settings = UserSettings(user_id=current_user.id)
        db.add(settings)
        db.commit()
        db.refresh(settings)
    
    return settings

@router.put("/user", response_model=UserSettingsResponse)
async def update_user_settings(
    settings_data: UserSettingsUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get or create settings for the current user
    settings = db.query(UserSettings).filter(UserSettings.user_id == current_user.id).first()
    
    if not settings:
        # Create settings with provided data
        settings = UserSettings(user_id=current_user.id, **settings_data.dict())
        db.add(settings)
    else:
        # Update existing settings
        for field, value in settings_data.dict(exclude_unset=True).items():
            setattr(settings, field, value)
    
    db.commit()
    db.refresh(settings)
    return settings

@router.get("/caregiver/preferences", response_model=List[CaregiverPreferenceResponse])
async def get_caregiver_preferences(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify user is a caregiver
    if current_user.role.value != "caregiver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can access these preferences"
        )
    
    # Get caregiver profile
    profile = db.query(CaregiverProfile).filter(CaregiverProfile.user_id == current_user.id).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Caregiver profile not found"
        )
    
    # Get preferences
    preferences = db.query(CaregiverPreference).filter(
        CaregiverPreference.caregiver_profile_id == profile.id
    ).all()
    
    return preferences

@router.post("/caregiver/preferences", response_model=CaregiverPreferenceResponse, status_code=status.HTTP_201_CREATED)
async def create_caregiver_preference(
    preference_data: CaregiverPreferenceCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify user is a caregiver
    if current_user.role.value != "caregiver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can create these preferences"
        )
    
    # Check if the caregiver profile belongs to current user
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.id == preference_data.caregiver_profile_id,
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only create preferences for your own profile"
        )
    
    # Check if preference key already exists
    existing_pref = db.query(CaregiverPreference).filter(
        CaregiverPreference.caregiver_profile_id == preference_data.caregiver_profile_id,
        CaregiverPreference.preference_key == preference_data.preference_key
    ).first()
    
    if existing_pref:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"Preference with key '{preference_data.preference_key}' already exists"
        )
    
    # Create preference
    preference = CaregiverPreference(**preference_data.dict())
    db.add(preference)
    db.commit()
    db.refresh(preference)
    
    return preference

@router.put("/caregiver/preferences/{preference_id}", response_model=CaregiverPreferenceResponse)
async def update_caregiver_preference(
    preference_id: int,
    preference_data: CaregiverPreferenceUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify user is a caregiver
    if current_user.role.value != "caregiver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can update these preferences"
        )
    
    # Get the preference
    preference = db.query(CaregiverPreference).filter(CaregiverPreference.id == preference_id).first()
    
    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preference not found"
        )
    
    # Check if preference belongs to current user
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.id == preference.caregiver_profile_id,
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own preferences"
        )
    
    # Update preference
    if preference_data.preference_value is not None:
        preference.preference_value = preference_data.preference_value
    
    db.commit()
    db.refresh(preference)
    
    return preference

@router.delete("/caregiver/preferences/{preference_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_caregiver_preference(
    preference_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify user is a caregiver
    if current_user.role.value != "caregiver":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only caregivers can delete these preferences"
        )
    
    # Get the preference
    preference = db.query(CaregiverPreference).filter(CaregiverPreference.id == preference_id).first()
    
    if not preference:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Preference not found"
        )
    
    # Check if preference belongs to current user
    profile = db.query(CaregiverProfile).filter(
        CaregiverProfile.id == preference.caregiver_profile_id,
        CaregiverProfile.user_id == current_user.id
    ).first()
    
    if not profile:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own preferences"
        )
    
    # Delete preference
    db.delete(preference)
    db.commit()
    
    return None

@router.get("/system-defaults", response_model=dict)
async def get_system_defaults(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get system-wide default settings"""
    return {
        "languages": [
            {"code": "en", "name": "English"},
            {"code": "ar", "name": "Arabic"}
        ],
        "themes": [
            {"code": "light", "name": "Light"},
            {"code": "dark", "name": "Dark"}
        ],
        "default_offline_retention_days": 7,
        "max_offline_retention_days": 30,
        "app_version": "1.0.0",
        "min_required_version": "1.0.0",
        "support_email": "support@homecare.com",
        "help_center_url": "https://homecare.com/help"
    }
