from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc
from datetime import datetime

from app import db
from models.notification import Notification, NotificationType

# Create blueprint
notification_bp = Blueprint('notification', __name__)

@notification_bp.route('/', methods=['GET'])
@login_required
def get_notifications():
    """Get list of notifications for the current user with pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filtering options
    is_read = request.args.get('is_read')
    notification_type = request.args.get('notification_type')
    priority = request.args.get('priority')
    
    # Base query
    query = Notification.query.filter_by(user_id=current_user.id)
    
    # Apply filters
    if is_read is not None:
        is_read = is_read.lower() == 'true'
        query = query.filter_by(is_read=is_read)
    
    if notification_type:
        try:
            nt = NotificationType[notification_type.upper()] if isinstance(notification_type, str) else notification_type
            query = query.filter_by(notification_type=nt)
        except KeyError:
            pass
    
    if priority:
        query = query.filter_by(priority=priority.lower())
    
    # Handle expired notifications
    show_expired = request.args.get('show_expired', '').lower() == 'true'
    if not show_expired:
        query = query.filter((Notification.expires_at.is_(None)) | (Notification.expires_at > datetime.now()))
    
    # Order by most recent first
    query = query.order_by(desc(Notification.created_at))
    
    # Apply pagination
    paginated_notifications = query.paginate(page=page, per_page=per_page)
    
    # Format response
    notifications = []
    for notification in paginated_notifications.items:
        notifications.append({
            "id": notification.id,
            "notification_type": notification.notification_type.value,
            "title": notification.title,
            "message": notification.message,
            "is_read": notification.is_read,
            "read_at": notification.read_at.strftime('%Y-%m-%d %H:%M:%S') if notification.read_at else None,
            "priority": notification.priority,
            "action_url": notification.action_url,
            "reference_id": notification.reference_id,
            "reference_type": notification.reference_type,
            "expires_at": notification.expires_at.strftime('%Y-%m-%d %H:%M:%S') if notification.expires_at else None,
            "created_at": notification.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Get unread count
    unread_count = Notification.query.filter_by(
        user_id=current_user.id, 
        is_read=False
    ).filter(
        (Notification.expires_at.is_(None)) | (Notification.expires_at > datetime.now())
    ).count()
    
    return jsonify({
        "notifications": notifications,
        "unread_count": unread_count,
        "pagination": {
            "page": paginated_notifications.page,
            "per_page": paginated_notifications.per_page,
            "total_pages": paginated_notifications.pages,
            "total_items": paginated_notifications.total
        }
    }), 200

@notification_bp.route('/<int:notification_id>', methods=['GET'])
@login_required
def get_notification(notification_id):
    """Get detailed information about a specific notification"""
    notification = Notification.query.get_or_404(notification_id)
    
    # Check permissions
    if notification.user_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    response = {
        "id": notification.id,
        "notification_type": notification.notification_type.value,
        "title": notification.title,
        "message": notification.message,
        "is_read": notification.is_read,
        "read_at": notification.read_at.strftime('%Y-%m-%d %H:%M:%S') if notification.read_at else None,
        "priority": notification.priority,
        "action_url": notification.action_url,
        "reference_id": notification.reference_id,
        "reference_type": notification.reference_type,
        "expires_at": notification.expires_at.strftime('%Y-%m-%d %H:%M:%S') if notification.expires_at else None,
        "created_at": notification.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "updated_at": notification.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(response), 200

@notification_bp.route('/<int:notification_id>/mark-read', methods=['POST'])
@login_required
def mark_notification_read(notification_id):
    """Mark a notification as read"""
    notification = Notification.query.get_or_404(notification_id)
    
    # Check permissions
    if notification.user_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Mark as read
    if not notification.is_read:
        notification.is_read = True
        notification.read_at = datetime.now()
        db.session.commit()
    
    return jsonify({
        "message": "Notification marked as read",
        "notification_id": notification.id
    }), 200

@notification_bp.route('/mark-all-read', methods=['POST'])
@login_required
def mark_all_notifications_read():
    """Mark all notifications as read"""
    # Find all unread notifications for the user
    unread_notifications = Notification.query.filter_by(
        user_id=current_user.id,
        is_read=False
    ).all()
    
    # Mark all as read
    current_time = datetime.now()
    for notification in unread_notifications:
        notification.is_read = True
        notification.read_at = current_time
    
    db.session.commit()
    
    return jsonify({
        "message": f"Marked {len(unread_notifications)} notifications as read"
    }), 200

@notification_bp.route('/<int:notification_id>', methods=['DELETE'])
@login_required
def delete_notification(notification_id):
    """Delete a notification"""
    notification = Notification.query.get_or_404(notification_id)
    
    # Check permissions
    if notification.user_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Delete notification
    db.session.delete(notification)
    db.session.commit()
    
    return jsonify({
        "message": "Notification deleted successfully"
    }), 200

@notification_bp.route('/unread-count', methods=['GET'])
@login_required
def get_unread_count():
    """Get count of unread notifications"""
    unread_count = Notification.query.filter_by(
        user_id=current_user.id, 
        is_read=False
    ).filter(
        (Notification.expires_at.is_(None)) | (Notification.expires_at > datetime.now())
    ).count()
    
    return jsonify({
        "unread_count": unread_count
    }), 200