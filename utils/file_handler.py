import os
import uuid
import shutil
from datetime import datetime
from pathlib import Path
from typing import Tuple, Optional
from fastapi import UploadFile, HTTPException, status

from config import settings

def validate_file_type(filename: str) -> bool:
    """Validate that file has an allowed extension"""
    allowed_extensions = settings.ALLOWED_EXTENSIONS
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    return extension in allowed_extensions

def get_file_path(filename: str, user_id: Optional[int] = None, timestamp: Optional[datetime] = None) -> str:
    """Generate a filepath for a new upload"""
    timestamp = timestamp or datetime.now()
    date_path = timestamp.strftime("%Y/%m/%d")
    
    # Create a unique filename
    extension = filename.split(".")[-1].lower() if "." in filename else ""
    unique_filename = f"{uuid.uuid4().hex}.{extension}"
    
    # Create directory path
    base_dir = settings.UPLOAD_DIR
    user_part = f"user_{user_id}/" if user_id else ""
    full_path = f"{base_dir}/{user_part}{date_path}"
    
    # Ensure directory exists
    Path(full_path).mkdir(parents=True, exist_ok=True)
    
    return f"{full_path}/{unique_filename}"

async def save_upload_file(file: UploadFile, user_id: Optional[int] = None) -> Tuple[str, str, str]:
    """
    Save an uploaded file and return the filepath, filename, and file type
    Returns: (filepath, filename, file_type)
    """
    if not validate_file_type(file.filename):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=f"File type not allowed. Allowed types: {', '.join(settings.ALLOWED_EXTENSIONS)}"
        )
    
    # Generate a file path
    filepath = get_file_path(file.filename, user_id)
    
    # Create a temporary file to hold the data
    temp_file = Path(f"{filepath}.temp")
    
    try:
        with open(temp_file, "wb") as buffer:
            # Copy content from the uploaded file to the temp file
            shutil.copyfileobj(file.file, buffer)
        
        # Rename the temp file to the actual file
        os.rename(temp_file, filepath)
        
        return filepath, os.path.basename(filepath), file.content_type
    
    except Exception as e:
        # Clean up temp file if it exists
        if temp_file.exists():
            os.remove(temp_file)
        
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error saving file: {str(e)}"
        )

async def delete_file(filepath: str) -> bool:
    """Delete a file from the filesystem"""
    try:
        if os.path.exists(filepath):
            os.remove(filepath)
            return True
        return False
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error deleting file: {str(e)}"
        )
