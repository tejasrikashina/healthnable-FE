from flask import Blueprint, request, jsonify, current_app
from flask_login import login_user, logout_user, login_required, current_user
from werkzeug.security import generate_password_hash, check_password_hash
from datetime import datetime, timedelta
import jwt

from app import db
from models.user import User, UserRole
from models.settings import UserSettings

# Create blueprint
auth_bp = Blueprint('auth', __name__)

@auth_bp.route('/register', methods=['POST'])
def register():
    """Register a new user"""
    data = request.json
    
    # Validate required fields
    required_fields = ['username', 'email', 'password', 'first_name', 'last_name']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if username or email already exists
    if User.query.filter_by(username=data['username']).first():
        return jsonify({"error": "Username already exists"}), 400
    
    if User.query.filter_by(email=data['email']).first():
        return jsonify({"error": "Email already exists"}), 400
    
    # Create new user (default to CAREGIVER role unless specified)
    role = UserRole.CAREGIVER
    if 'role' in data and data['role'] in [r.value for r in UserRole]:
        role = UserRole[data['role'].upper()]
    
    # Create user
    user = User(
        username=data['username'],
        email=data['email'],
        password_hash=generate_password_hash(data['password']),
        first_name=data['first_name'],
        last_name=data['last_name'],
        phone=data.get('phone'),
        role=role,
        is_active=True
    )
    
    db.session.add(user)
    db.session.commit()
    
    # Create default settings for the user
    settings = UserSettings(
        user_id=user.id,
        language="en",
        theme="light"
    )
    db.session.add(settings)
    db.session.commit()
    
    return jsonify({
        "message": "User registered successfully",
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "role": user.role.value
        }
    }), 201

@auth_bp.route('/login', methods=['POST'])
def login():
    """Login a user and return JWT token"""
    data = request.json
    
    # Validate required fields
    if 'username' not in data or 'password' not in data:
        return jsonify({"error": "Username and password are required"}), 400
    
    # Find user by username
    user = User.query.filter_by(username=data['username']).first()
    
    # Check if user exists and password is correct
    if not user or not check_password_hash(user.password_hash, data['password']):
        return jsonify({"error": "Invalid username or password"}), 401
    
    # Check if user is active
    if not user.is_active:
        return jsonify({"error": "User account is inactive"}), 403
    
    # Login user for session
    login_user(user)
    
    # Generate JWT token
    token_expiry = datetime.utcnow() + timedelta(minutes=current_app.config.get('ACCESS_TOKEN_EXPIRE_MINUTES', 10080))  # Default 7 days
    
    token_data = {
        "sub": user.username,
        "id": user.id,
        "role": user.role.value,
        "exp": token_expiry
    }
    
    token = jwt.encode(
        token_data,
        current_app.config.get('SECRET_KEY'),
        algorithm=current_app.config.get('ALGORITHM', 'HS256')
    )
    
    return jsonify({
        "message": "Login successful",
        "access_token": token,
        "token_type": "bearer",
        "expires_at": token_expiry.strftime('%Y-%m-%d %H:%M:%S'),
        "user": {
            "id": user.id,
            "username": user.username,
            "email": user.email,
            "name": user.get_full_name(),
            "role": user.role.value
        }
    }), 200

@auth_bp.route('/logout', methods=['POST'])
@login_required
def logout():
    """Logout a user"""
    logout_user()
    return jsonify({"message": "Successfully logged out"}), 200

@auth_bp.route('/me', methods=['GET'])
@login_required
def get_current_user():
    """Get current user information"""
    return jsonify({
        "user": {
            "id": current_user.id,
            "username": current_user.username,
            "email": current_user.email,
            "first_name": current_user.first_name,
            "last_name": current_user.last_name,
            "name": current_user.get_full_name(),
            "phone": current_user.phone,
            "role": current_user.role.value,
            "is_active": current_user.is_active,
            "created_at": current_user.created_at.strftime('%Y-%m-%d %H:%M:%S') if current_user.created_at else None
        }
    }), 200

@auth_bp.route('/change-password', methods=['POST'])
@login_required
def change_password():
    """Change user password"""
    data = request.json
    
    # Validate required fields
    if 'current_password' not in data or 'new_password' not in data:
        return jsonify({"error": "Current password and new password are required"}), 400
    
    # Check if current password is correct
    if not check_password_hash(current_user.password_hash, data['current_password']):
        return jsonify({"error": "Current password is incorrect"}), 401
    
    # Update password
    current_user.password_hash = generate_password_hash(data['new_password'])
    db.session.commit()
    
    return jsonify({"message": "Password changed successfully"}), 200