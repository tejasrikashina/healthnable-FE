from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc, and_, or_
from datetime import datetime

from app import db
from models.user import User, UserRole
from models.chat import ChatThread, ChatThreadParticipant, ChatMessage
from models.notification import Notification, NotificationType

# Create blueprint
chat_bp = Blueprint('chat', __name__)

@chat_bp.route('/threads', methods=['GET'])
@login_required
def get_chat_threads():
    """Get all chat threads the current user participates in"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Find all threads where user is a participant
    participant_thread_ids = db.session.query(ChatThreadParticipant.thread_id)\
        .filter_by(user_id=current_user.id).all()
    thread_ids = [t[0] for t in participant_thread_ids]
    
    # Find threads
    query = ChatThread.query.filter(ChatThread.id.in_(thread_ids))
    
    # Apply filters
    is_active = request.args.get('is_active')
    if is_active is not None:
        is_active = is_active.lower() == 'true'
        query = query.filter_by(is_active=is_active)
    
    # Order by most recent activity (based on most recent message)
    query = query.order_by(desc(ChatThread.updated_at))
    
    # Apply pagination
    paginated_threads = query.paginate(page=page, per_page=per_page)
    
    # Format response
    threads = []
    for thread in paginated_threads.items:
        # Get participants
        participants = []
        for participant in thread.participants:
            user = participant.user
            participants.append({
                "id": user.id,
                "name": user.get_full_name(),
                "role": user.role.value
            })
        
        # Get last message
        last_message = ChatMessage.query.filter_by(thread_id=thread.id).order_by(desc(ChatMessage.created_at)).first()
        
        # Get unread count for this user
        participant = ChatThreadParticipant.query.filter_by(thread_id=thread.id, user_id=current_user.id).first()
        unread_count = 0
        
        if participant and participant.last_read_message_id:
            unread_count = ChatMessage.query.filter(
                ChatMessage.thread_id == thread.id,
                ChatMessage.id > participant.last_read_message_id,
                ChatMessage.sender_id != current_user.id
            ).count()
        elif participant:
            unread_count = ChatMessage.query.filter(
                ChatMessage.thread_id == thread.id,
                ChatMessage.sender_id != current_user.id
            ).count()
        
        threads.append({
            "id": thread.id,
            "title": thread.title,
            "participants": participants,
            "created_by": thread.created_by,
            "is_active": thread.is_active,
            "unread_count": unread_count,
            "last_message": {
                "id": last_message.id,
                "sender_id": last_message.sender_id,
                "sender_name": last_message.sender.get_full_name() if last_message.sender else "Unknown",
                "content": last_message.content[:50] + "..." if len(last_message.content) > 50 else last_message.content,
                "created_at": last_message.created_at.strftime('%Y-%m-%d %H:%M:%S')
            } if last_message else None,
            "created_at": thread.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_at": thread.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify({
        "threads": threads,
        "pagination": {
            "page": paginated_threads.page,
            "per_page": paginated_threads.per_page,
            "total_pages": paginated_threads.pages,
            "total_items": paginated_threads.total
        }
    }), 200

@chat_bp.route('/threads/<int:thread_id>', methods=['GET'])
@login_required
def get_chat_thread(thread_id):
    """Get a specific chat thread with messages"""
    thread = ChatThread.query.get_or_404(thread_id)
    
    # Check if user is participant
    participant = ChatThreadParticipant.query.filter_by(thread_id=thread.id, user_id=current_user.id).first()
    if not participant and current_user.role != UserRole.ADMIN:
        return jsonify({"error": "Permission denied"}), 403
    
    # Get pagination params for messages
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 50, type=int)
    
    # Get messages with pagination, newest first
    query = ChatMessage.query.filter_by(thread_id=thread.id).order_by(desc(ChatMessage.created_at))
    paginated_messages = query.paginate(page=page, per_page=per_page)
    
    # Format participants
    participants = []
    for p in thread.participants:
        user = p.user
        participants.append({
            "id": user.id,
            "name": user.get_full_name(),
            "role": user.role.value,
            "is_muted": p.is_muted,
            "last_read_message_id": p.last_read_message_id
        })
    
    # Format messages (reverse to get oldest first)
    messages = []
    for message in reversed(paginated_messages.items):
        messages.append({
            "id": message.id,
            "sender_id": message.sender_id,
            "sender_name": message.sender.get_full_name() if message.sender else "Unknown",
            "content": message.content,
            "is_read": message.is_read,
            "read_at": message.read_at.strftime('%Y-%m-%d %H:%M:%S') if message.read_at else None,
            "is_synced": message.is_synced,
            "created_at": message.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Mark as read and update last read message
    if participant and messages:
        latest_message = ChatMessage.query.filter_by(thread_id=thread.id).order_by(desc(ChatMessage.created_at)).first()
        if latest_message:
            participant.last_read_message_id = latest_message.id
            db.session.commit()
    
    return jsonify({
        "thread": {
            "id": thread.id,
            "title": thread.title,
            "created_by": thread.created_by,
            "is_active": thread.is_active,
            "created_at": thread.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_at": thread.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        },
        "participants": participants,
        "messages": messages,
        "pagination": {
            "page": paginated_messages.page,
            "per_page": paginated_messages.per_page,
            "total_pages": paginated_messages.pages,
            "total_items": paginated_messages.total
        }
    }), 200

@chat_bp.route('/threads', methods=['POST'])
@login_required
def create_chat_thread():
    """Create a new chat thread"""
    data = request.json
    
    # Validate required fields
    if not data or 'participants' not in data or not data['participants']:
        return jsonify({"error": "Missing participants"}), 400
    
    # Create new thread
    thread = ChatThread(
        title=data.get('title'),
        created_by=current_user.id,
        is_active=True
    )
    
    db.session.add(thread)
    db.session.flush()  # Get thread ID without committing
    
    # Add creator as participant
    creator_participant = ChatThreadParticipant(
        thread_id=thread.id,
        user_id=current_user.id
    )
    db.session.add(creator_participant)
    
    # Add other participants
    participant_ids = set(data['participants'])
    if current_user.id in participant_ids:
        participant_ids.remove(current_user.id)  # Remove creator if included
    
    for user_id in participant_ids:
        participant = ChatThreadParticipant(
            thread_id=thread.id,
            user_id=user_id
        )
        db.session.add(participant)
        
        # Notify participant
        notification = Notification(
            user_id=user_id,
            notification_type=NotificationType.MESSAGE_RECEIVED,
            title="New Chat Thread",
            message=f"{current_user.get_full_name()} added you to a chat thread",
            priority="normal",
            reference_id=thread.id,
            reference_type="chat_thread"
        )
        db.session.add(notification)
    
    # Add initial message if provided
    if 'initial_message' in data and data['initial_message'].strip():
        message = ChatMessage(
            thread_id=thread.id,
            sender_id=current_user.id,
            content=data['initial_message'].strip()
        )
        db.session.add(message)
    
    db.session.commit()
    
    return jsonify({
        "message": "Chat thread created successfully",
        "thread": {
            "id": thread.id,
            "title": thread.title,
            "created_by": thread.created_by,
            "participant_count": len(participant_ids) + 1
        }
    }), 201

@chat_bp.route('/threads/<int:thread_id>/messages', methods=['POST'])
@login_required
def send_message(thread_id):
    """Send a message to a chat thread"""
    thread = ChatThread.query.get_or_404(thread_id)
    
    # Check if user is participant
    participant = ChatThreadParticipant.query.filter_by(thread_id=thread.id, user_id=current_user.id).first()
    if not participant:
        return jsonify({"error": "Permission denied"}), 403
    
    # Check if thread is active
    if not thread.is_active:
        return jsonify({"error": "Thread is inactive"}), 400
    
    data = request.json
    
    # Validate message content
    if not data or 'content' not in data or not data['content'].strip():
        return jsonify({"error": "Message content is required"}), 400
    
    # Create new message
    message = ChatMessage(
        thread_id=thread.id,
        sender_id=current_user.id,
        content=data['content'].strip(),
        is_synced=data.get('is_synced', False)
    )
    
    db.session.add(message)
    
    # Update thread updated_at timestamp
    thread.updated_at = datetime.now()
    
    # Send notifications to other participants
    for p in thread.participants:
        if p.user_id != current_user.id and not p.is_muted:
            notification = Notification(
                user_id=p.user_id,
                notification_type=NotificationType.MESSAGE_RECEIVED,
                title="New Message",
                message=f"New message from {current_user.get_full_name()}",
                priority="normal",
                reference_id=thread.id,
                reference_type="chat_thread"
            )
            db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        "message": "Message sent successfully",
        "chat_message": {
            "id": message.id,
            "thread_id": message.thread_id,
            "sender_id": message.sender_id,
            "sender_name": current_user.get_full_name(),
            "content": message.content,
            "created_at": message.created_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 201

@chat_bp.route('/threads/<int:thread_id>/participants', methods=['POST'])
@login_required
def add_thread_participant(thread_id):
    """Add participant to a chat thread"""
    thread = ChatThread.query.get_or_404(thread_id)
    
    # Check if user is thread creator or admin
    if thread.created_by != current_user.id and current_user.role != UserRole.ADMIN:
        return jsonify({"error": "Only thread creator or admin can add participants"}), 403
    
    data = request.json
    
    # Validate user_id
    if not data or 'user_id' not in data:
        return jsonify({"error": "User ID is required"}), 400
    
    user_id = data['user_id']
    
    # Check if user exists
    user = User.query.get(user_id)
    if not user:
        return jsonify({"error": "User not found"}), 404
    
    # Check if user is already participant
    existing = ChatThreadParticipant.query.filter_by(thread_id=thread.id, user_id=user_id).first()
    if existing:
        return jsonify({"error": "User is already a participant"}), 400
    
    # Add participant
    participant = ChatThreadParticipant(
        thread_id=thread.id,
        user_id=user_id
    )
    
    db.session.add(participant)
    
    # Notify participant
    notification = Notification(
        user_id=user_id,
        notification_type=NotificationType.MESSAGE_RECEIVED,
        title="Added to Chat Thread",
        message=f"{current_user.get_full_name()} added you to a chat thread",
        priority="normal",
        reference_id=thread.id,
        reference_type="chat_thread"
    )
    db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        "message": "Participant added successfully",
        "participant": {
            "user_id": user_id,
            "thread_id": thread.id,
            "name": user.get_full_name(),
            "role": user.role.value
        }
    }), 201

@chat_bp.route('/threads/<int:thread_id>/participants/<int:user_id>', methods=['DELETE'])
@login_required
def remove_thread_participant(thread_id, user_id):
    """Remove participant from a chat thread"""
    thread = ChatThread.query.get_or_404(thread_id)
    
    # Check if user is thread creator or admin, or removing self
    if thread.created_by != current_user.id and current_user.role != UserRole.ADMIN and user_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Check if user is participant
    participant = ChatThreadParticipant.query.filter_by(thread_id=thread.id, user_id=user_id).first()
    if not participant:
        return jsonify({"error": "User is not a participant"}), 404
    
    # Remove participant
    db.session.delete(participant)
    db.session.commit()
    
    return jsonify({
        "message": "Participant removed successfully"
    }), 200

@chat_bp.route('/threads/<int:thread_id>/mute', methods=['POST'])
@login_required
def mute_thread(thread_id):
    """Mute notifications for a chat thread"""
    # Check if user is participant
    participant = ChatThreadParticipant.query.filter_by(thread_id=thread_id, user_id=current_user.id).first()
    if not participant:
        return jsonify({"error": "Not a participant in this thread"}), 403
    
    # Mute thread
    participant.is_muted = True
    db.session.commit()
    
    return jsonify({
        "message": "Thread muted successfully",
        "thread_id": thread_id
    }), 200

@chat_bp.route('/threads/<int:thread_id>/unmute', methods=['POST'])
@login_required
def unmute_thread(thread_id):
    """Unmute notifications for a chat thread"""
    # Check if user is participant
    participant = ChatThreadParticipant.query.filter_by(thread_id=thread_id, user_id=current_user.id).first()
    if not participant:
        return jsonify({"error": "Not a participant in this thread"}), 403
    
    # Unmute thread
    participant.is_muted = False
    db.session.commit()
    
    return jsonify({
        "message": "Thread unmuted successfully",
        "thread_id": thread_id
    }), 200

@chat_bp.route('/threads/<int:thread_id>', methods=['PUT'])
@login_required
def update_thread(thread_id):
    """Update chat thread details (title, active status)"""
    thread = ChatThread.query.get_or_404(thread_id)
    
    # Check if user is thread creator or admin
    if thread.created_by != current_user.id and current_user.role != UserRole.ADMIN:
        return jsonify({"error": "Only thread creator or admin can update thread"}), 403
    
    data = request.json
    
    # Update title if provided
    if 'title' in data:
        thread.title = data['title']
    
    # Update active status if provided
    if 'is_active' in data:
        thread.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        "message": "Thread updated successfully",
        "thread": {
            "id": thread.id,
            "title": thread.title,
            "is_active": thread.is_active,
            "updated_at": thread.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@chat_bp.route('/threads/<int:thread_id>/mark-read', methods=['POST'])
@login_required
def mark_thread_read(thread_id):
    """Mark all messages in thread as read"""
    thread = ChatThread.query.get_or_404(thread_id)
    
    # Check if user is participant
    participant = ChatThreadParticipant.query.filter_by(thread_id=thread.id, user_id=current_user.id).first()
    if not participant:
        return jsonify({"error": "Not a participant in this thread"}), 403
    
    # Get latest message
    latest_message = ChatMessage.query.filter_by(thread_id=thread.id).order_by(desc(ChatMessage.created_at)).first()
    
    if latest_message:
        participant.last_read_message_id = latest_message.id
        db.session.commit()
    
    return jsonify({
        "message": "Thread marked as read",
        "thread_id": thread_id
    }), 200