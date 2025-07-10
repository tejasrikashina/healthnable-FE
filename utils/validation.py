import re
from datetime import datetime, timedelta
from typing import Optional
from geopy.distance import geodesic

def validate_cpr(cpr_number: str) -> bool:
    """
    Validate Bahrain CPR (Central Population Registry) number
    """
    # Basic validation - typically a numeric string
    if not cpr_number or not cpr_number.isdigit():
        return False
    
    # Additional validation rules can be added based on Bahrain's CPR format
    # This is a simplified example
    if len(cpr_number) != 9:  # Assuming 9 digits (adjust as needed)
        return False
    
    return True

def validate_email(email: str) -> bool:
    """
    Validate email address format
    """
    if not email:
        return False
    
    # Simple regex for email validation
    pattern = r"^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$"
    return bool(re.match(pattern, email))

def validate_phone(phone_number: str) -> bool:
    """
    Validate phone number format for Bahrain
    """
    if not phone_number:
        return False
    
    # Remove any spaces, dashes, or parentheses
    phone_number = re.sub(r'[\s\-\(\)]', '', phone_number)
    
    # Bahrain phone numbers are typically 8 digits
    # They may start with +973 (country code) or 00973
    if phone_number.startswith('+973'):
        phone_number = phone_number[4:]
    elif phone_number.startswith('00973'):
        phone_number = phone_number[5:]
    
    # Check if the remaining part is 8 digits
    return phone_number.isdigit() and len(phone_number) == 8

def validate_gps_location(lat: float, lng: float, target_lat: float, target_lng: float, max_distance_meters: float = 100) -> bool:
    """
    Validate if GPS coordinates are within a specified distance from a target location
    """
    if not all([lat, lng, target_lat, target_lng]):
        return False
    
    # Calculate distance between points
    current_location = (lat, lng)
    target_location = (target_lat, target_lng)
    
    distance = geodesic(current_location, target_location).meters
    
    return distance <= max_distance_meters

def validate_visit_time(scheduled_time: datetime, check_time: Optional[datetime] = None, allow_minutes_early: int = 15, allow_minutes_late: int = 30) -> bool:
    """
    Validate if a time is within acceptable range of a scheduled time
    """
    if not scheduled_time:
        return False
    
    check_time = check_time or datetime.now()
    
    # Calculate acceptable time range
    earliest_time = scheduled_time - timedelta(minutes=allow_minutes_early)
    latest_time = scheduled_time + timedelta(minutes=allow_minutes_late)
    
    return earliest_time <= check_time <= latest_time

def validate_password_strength(password: str) -> tuple:
    """
    Validate password strength
    Returns: (is_valid, message)
    """
    if len(password) < settings.PASSWORD_MIN_LENGTH:
        return False, f"Password must be at least {settings.PASSWORD_MIN_LENGTH} characters long"
    
    if not any(char.isdigit() for char in password):
        return False, "Password must contain at least one digit"
    
    if not any(char.isupper() for char in password):
        return False, "Password must contain at least one uppercase letter"
    
    if not any(char.islower() for char in password):
        return False, "Password must contain at least one lowercase letter"
    
    return True, "Password meets strength requirements"
