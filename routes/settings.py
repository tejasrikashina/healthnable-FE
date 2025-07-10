from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from datetime import datetime

from app import db
from models.user import User, UserRole
from models.settings import UserSettings, CaregiverPreference

# Create blueprint
settings_bp = Blueprint('settings', __name__)

@settings_bp.route('/user', methods=['GET'])
@login_required
def get_user_settings():
    """Get current user settings"""
    # Find or create settings for the user
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    
    if not settings:
        # Create default settings
        settings = UserSettings(
            user_id=current_user.id,
            language="en",
            theme="light",
            enable_notifications=True,
            enable_email_notifications=True,
            enable_push_notifications=True,
            offline_data_retention_days=7,
            auto_sync_enabled=True,
            auto_sync_on_wifi_only=False
        )
        db.session.add(settings)
        db.session.commit()
    
    response = {
        "id": settings.id,
        "user_id": settings.user_id,
        "language": settings.language,
        "theme": settings.theme,
        "enable_notifications": settings.enable_notifications,
        "enable_email_notifications": settings.enable_email_notifications,
        "enable_push_notifications": settings.enable_push_notifications,
        "offline_data_retention_days": settings.offline_data_retention_days,
        "auto_sync_enabled": settings.auto_sync_enabled,
        "auto_sync_on_wifi_only": settings.auto_sync_on_wifi_only,
        "created_at": settings.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "updated_at": settings.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(response), 200

@settings_bp.route('/user', methods=['PUT'])
@login_required
def update_user_settings():
    """Update user settings"""
    # Find or create settings for the user
    settings = UserSettings.query.filter_by(user_id=current_user.id).first()
    
    if not settings:
        # Create default settings
        settings = UserSettings(
            user_id=current_user.id,
            language="en",
            theme="light",
            enable_notifications=True,
            enable_email_notifications=True,
            enable_push_notifications=True,
            offline_data_retention_days=7,
            auto_sync_enabled=True,
            auto_sync_on_wifi_only=False
        )
        db.session.add(settings)
    
    data = request.json
    
    # Update settings with provided values
    if 'language' in data:
        settings.language = data['language']
    
    if 'theme' in data:
        settings.theme = data['theme']
    
    if 'enable_notifications' in data:
        settings.enable_notifications = data['enable_notifications']
    
    if 'enable_email_notifications' in data:
        settings.enable_email_notifications = data['enable_email_notifications']
    
    if 'enable_push_notifications' in data:
        settings.enable_push_notifications = data['enable_push_notifications']
    
    if 'offline_data_retention_days' in data:
        settings.offline_data_retention_days = data['offline_data_retention_days']
    
    if 'auto_sync_enabled' in data:
        settings.auto_sync_enabled = data['auto_sync_enabled']
    
    if 'auto_sync_on_wifi_only' in data:
        settings.auto_sync_on_wifi_only = data['auto_sync_on_wifi_only']
    
    db.session.commit()
    
    return jsonify({
        "message": "Settings updated successfully",
        "settings": {
            "id": settings.id,
            "language": settings.language,
            "theme": settings.theme,
            "enable_notifications": settings.enable_notifications,
            "enable_email_notifications": settings.enable_email_notifications,
            "enable_push_notifications": settings.enable_push_notifications,
            "offline_data_retention_days": settings.offline_data_retention_days,
            "auto_sync_enabled": settings.auto_sync_enabled,
            "auto_sync_on_wifi_only": settings.auto_sync_on_wifi_only,
            "updated_at": settings.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@settings_bp.route('/caregiver-preferences', methods=['GET'])
@login_required
def get_caregiver_preferences():
    """Get caregiver preferences"""
    # Check if user has a caregiver profile
    if current_user.role != UserRole.CAREGIVER:
        return jsonify({"error": "Only caregivers can access caregiver preferences"}), 403
    
    # Get caregiver profile ID
    from models.user import CaregiverProfile
    profile = CaregiverProfile.query.filter_by(user_id=current_user.id).first()
    
    if not profile:
        return jsonify({"error": "Caregiver profile not found"}), 404
    
    # Get preferences
    preferences = CaregiverPreference.query.filter_by(caregiver_profile_id=profile.id).all()
    
    # Format response
    preference_dict = {}
    for pref in preferences:
        preference_dict[pref.preference_key] = pref.preference_value
    
    return jsonify({
        "caregiver_profile_id": profile.id,
        "preferences": preference_dict
    }), 200

@settings_bp.route('/caregiver-preferences', methods=['PUT'])
@login_required
def update_caregiver_preferences():
    """Update caregiver preferences"""
    # Check if user has a caregiver profile
    if current_user.role != UserRole.CAREGIVER:
        return jsonify({"error": "Only caregivers can update caregiver preferences"}), 403
    
    # Get caregiver profile ID
    from models.user import CaregiverProfile
    profile = CaregiverProfile.query.filter_by(user_id=current_user.id).first()
    
    if not profile:
        return jsonify({"error": "Caregiver profile not found"}), 404
    
    data = request.json
    
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request format"}), 400
    
    # Update or create preferences
    for key, value in data.items():
        # Skip invalid keys
        if not key or not isinstance(key, str):
            continue
        
        # Find existing preference
        pref = CaregiverPreference.query.filter_by(
            caregiver_profile_id=profile.id,
            preference_key=key
        ).first()
        
        if pref:
            # Update existing preference
            pref.preference_value = value
        else:
            # Create new preference
            pref = CaregiverPreference(
                caregiver_profile_id=profile.id,
                preference_key=key,
                preference_value=value
            )
            db.session.add(pref)
    
    db.session.commit()
    
    return jsonify({
        "message": "Caregiver preferences updated successfully"
    }), 200

@settings_bp.route('/system', methods=['GET'])
@login_required
def get_system_settings():
    """Get system settings"""
    # Only admins can view system settings
    if current_user.role != UserRole.ADMIN:
        return jsonify({"error": "Permission denied"}), 403
    
    # Get system settings from app config
    settings = {
        "app_version": current_app.config.get("VERSION", "1.0.0"),
        "environment": current_app.config.get("ENV", "production"),
        "log_level": current_app.config.get("LOG_LEVEL", "INFO"),
        "enable_email_notifications": current_app.config.get("ENABLE_EMAIL_NOTIFICATIONS", False),
        "enable_push_notifications": current_app.config.get("ENABLE_PUSH_NOTIFICATIONS", True),
        "max_upload_size": current_app.config.get("MAX_UPLOAD_SIZE", 10 * 1024 * 1024),  # 10MB
        "allowed_extensions": current_app.config.get("ALLOWED_EXTENSIONS", ["jpg", "jpeg", "png", "pdf", "doc", "docx"]),
        "max_sync_batch_size": current_app.config.get("MAX_SYNC_BATCH_SIZE", 100),
        "default_timezone": current_app.config.get("DEFAULT_TIMEZONE", "Asia/Bahrain")
    }
    
    return jsonify(settings), 200