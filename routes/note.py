from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc
from datetime import datetime

from app import db
from models.user import UserRole
from models.note import Note, NoteType
from models.notification import Notification, NotificationType

# Create blueprint
note_bp = Blueprint('note', __name__)

@note_bp.route('/', methods=['GET'])
@login_required
def get_notes():
    """Get a list of notes with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filtering options
    patient_id = request.args.get('patient_id', type=int)
    visit_id = request.args.get('visit_id', type=int)
    note_type = request.args.get('note_type')
    is_escalated = request.args.get('is_escalated', '').lower() == 'true'
    is_pending = request.args.get('is_pending', '').lower() == 'true'
    created_by = request.args.get('created_by', type=int)
    
    # Base query
    query = Note.query
    
    # Apply filters
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    if visit_id:
        query = query.filter_by(visit_id=visit_id)
    
    if note_type:
        try:
            nt = NoteType[note_type.upper()]
            query = query.filter_by(note_type=nt)
        except KeyError:
            pass
    
    if is_escalated:
        query = query.filter_by(is_escalated=True)
    
    if is_pending:
        query = query.filter_by(is_pending=True)
    
    if created_by:
        query = query.filter_by(created_by=created_by)
    elif current_user.role == UserRole.CAREGIVER:
        # Caregivers can see their own notes and those escalated to them
        query = query.filter((Note.created_by == current_user.id) | (Note.escalated_to == current_user.id))
    
    # Order by most recent first
    query = query.order_by(desc(Note.created_at))
    
    # Apply pagination
    paginated_notes = query.paginate(page=page, per_page=per_page)
    
    # Format response
    notes = []
    for note in paginated_notes.items:
        creator = note.creator
        escalated_to = note.escalated_user
        
        notes.append({
            "id": note.id,
            "patient_id": note.patient_id,
            "visit_id": note.visit_id,
            "note_type": note.note_type.value,
            "title": note.title,
            "content": note.content,
            "is_escalated": note.is_escalated,
            "is_pending": note.is_pending,
            "sync_status": note.sync_status,
            "created_by": {
                "id": creator.id if creator else None,
                "name": creator.get_full_name() if creator else "Unknown"
            },
            "escalated_to": {
                "id": escalated_to.id if escalated_to else None,
                "name": escalated_to.get_full_name() if escalated_to else None
            } if note.is_escalated else None,
            "created_at": note.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify({
        "notes": notes,
        "pagination": {
            "page": paginated_notes.page,
            "per_page": paginated_notes.per_page,
            "total_pages": paginated_notes.pages,
            "total_items": paginated_notes.total
        }
    }), 200

@note_bp.route('/<int:note_id>', methods=['GET'])
@login_required
def get_note(note_id):
    """Get detailed information about a specific note"""
    note = Note.query.get_or_404(note_id)
    
    # Check permissions - caregivers can only see their own notes or ones escalated to them
    if current_user.role == UserRole.CAREGIVER and note.created_by != current_user.id and note.escalated_to != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    creator = note.creator
    escalated_to = note.escalated_user
    
    # Format response
    response = {
        "id": note.id,
        "patient_id": note.patient_id,
        "patient_name": note.patient.get_full_name() if note.patient else "Unknown",
        "visit_id": note.visit_id,
        "note_type": note.note_type.value,
        "title": note.title,
        "content": note.content,
        "is_escalated": note.is_escalated,
        "escalation_reason": note.escalation_reason,
        "escalation_time": note.escalation_time.strftime('%Y-%m-%d %H:%M:%S') if note.escalation_time else None,
        "is_pending": note.is_pending,
        "sync_status": note.sync_status,
        "created_by": {
            "id": creator.id if creator else None,
            "name": creator.get_full_name() if creator else "Unknown",
            "role": creator.role.value if creator else None
        },
        "escalated_to": {
            "id": escalated_to.id if escalated_to else None,
            "name": escalated_to.get_full_name() if escalated_to else None,
            "role": escalated_to.role.value if escalated_to else None
        } if note.is_escalated else None,
        "created_at": note.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "updated_at": note.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Include associated documents if any
    if note.documents:
        documents = []
        for doc in note.documents:
            documents.append({
                "id": doc.id,
                "filename": doc.filename,
                "document_type": doc.document_type.value,
                "title": doc.title,
                "created_at": doc.created_at.strftime('%Y-%m-%d %H:%M:%S')
            })
        response["documents"] = documents
    
    return jsonify(response), 200

@note_bp.route('/', methods=['POST'])
@login_required
def create_note():
    """Create a new note"""
    data = request.json
    
    # Validate required fields
    required_fields = ['patient_id', 'note_type', 'title', 'content']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate note type
    try:
        note_type = NoteType[data['note_type'].upper()] if isinstance(data['note_type'], str) else data['note_type']
    except KeyError:
        return jsonify({"error": f"Invalid note type: {data['note_type']}. Valid types are: {', '.join([t.value for t in NoteType])}"}), 400
    
    # Create new note
    note = Note(
        patient_id=data['patient_id'],
        visit_id=data.get('visit_id'),
        created_by=current_user.id,
        note_type=note_type,
        title=data['title'],
        content=data['content'],
        is_pending=data.get('is_pending', False),
        sync_status=data.get('sync_status', 'synced')
    )
    
    # Handle escalation if requested
    if data.get('is_escalated'):
        escalated_to = data.get('escalated_to')
        if not escalated_to:
            return jsonify({"error": "Escalated notes must specify a user to escalate to"}), 400
        
        note.is_escalated = True
        note.escalated_to = escalated_to
        note.escalation_reason = data.get('escalation_reason', 'Escalation requested by caregiver')
        note.escalation_time = datetime.now()
        
        # Create a notification for the escalated user
        notification = Notification(
            user_id=escalated_to,
            notification_type=NotificationType.ESCALATION,
            title=f"Note Escalation: {note.title}",
            message=f"A note has been escalated to you by {current_user.get_full_name()}. Reason: {note.escalation_reason}",
            priority="high",
            reference_id=note.id,
            reference_type="note"
        )
        db.session.add(notification)
    
    db.session.add(note)
    db.session.commit()
    
    return jsonify({
        "message": "Note created successfully",
        "note": {
            "id": note.id,
            "patient_id": note.patient_id,
            "visit_id": note.visit_id,
            "title": note.title,
            "note_type": note.note_type.value,
            "is_escalated": note.is_escalated
        }
    }), 201

@note_bp.route('/<int:note_id>', methods=['PUT'])
@login_required
def update_note(note_id):
    """Update a note"""
    note = Note.query.get_or_404(note_id)
    
    # Check permissions - only creator or admin/supervisor can update notes
    if current_user.role == UserRole.CAREGIVER and note.created_by != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json
    
    # Update fields if provided
    if 'title' in data:
        note.title = data['title']
        
    if 'content' in data:
        note.content = data['content']
        
    if 'note_type' in data:
        try:
            note_type = NoteType[data['note_type'].upper()] if isinstance(data['note_type'], str) else data['note_type']
            note.note_type = note_type
        except KeyError:
            return jsonify({"error": f"Invalid note type: {data['note_type']}. Valid types are: {', '.join([t.value for t in NoteType])}"}), 400
    
    # Handle escalation updates
    if 'is_escalated' in data:
        old_escalated = note.is_escalated
        note.is_escalated = data['is_escalated']
        
        # If newly escalated, require escalated_to
        if note.is_escalated and not old_escalated:
            escalated_to = data.get('escalated_to')
            if not escalated_to:
                return jsonify({"error": "Escalated notes must specify a user to escalate to"}), 400
            
            note.escalated_to = escalated_to
            note.escalation_reason = data.get('escalation_reason', 'Escalation requested by caregiver')
            note.escalation_time = datetime.now()
            
            # Create a notification for the escalated user
            notification = Notification(
                user_id=escalated_to,
                notification_type=NotificationType.ESCALATION,
                title=f"Note Escalation: {note.title}",
                message=f"A note has been escalated to you by {current_user.get_full_name()}. Reason: {note.escalation_reason}",
                priority="high",
                reference_id=note.id,
                reference_type="note"
            )
            db.session.add(notification)
    
    # Update sync status
    if 'is_pending' in data:
        note.is_pending = data['is_pending']
        
    if 'sync_status' in data:
        note.sync_status = data['sync_status']
    
    db.session.commit()
    
    return jsonify({
        "message": "Note updated successfully",
        "note": {
            "id": note.id,
            "title": note.title,
            "is_escalated": note.is_escalated,
            "updated_at": note.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@note_bp.route('/pending', methods=['GET'])
@login_required
def get_pending_notes():
    """Get all pending notes for syncing"""
    # Only caregiver can see their own pending notes
    query = Note.query.filter_by(created_by=current_user.id, is_pending=True)
    
    # Order by created_at
    query = query.order_by(desc(Note.created_at))
    
    # Get all pending notes (no pagination)
    pending_notes = query.all()
    
    # Format response
    notes = []
    for note in pending_notes:
        notes.append({
            "id": note.id,
            "patient_id": note.patient_id,
            "patient_name": note.patient.get_full_name() if note.patient else "Unknown",
            "visit_id": note.visit_id,
            "note_type": note.note_type.value,
            "title": note.title,
            "content": note.content,
            "sync_status": note.sync_status,
            "created_at": note.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify({
        "pending_notes": notes,
        "count": len(notes)
    }), 200

@note_bp.route('/<int:note_id>/escalate', methods=['POST'])
@login_required
def escalate_note(note_id):
    """Escalate a note to a supervisor or doctor"""
    note = Note.query.get_or_404(note_id)
    
    # Check permissions - only creator, supervisor, or admin can escalate notes
    if current_user.role == UserRole.CAREGIVER and note.created_by != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json
    
    # Validate escalation data
    if not data or 'escalated_to' not in data:
        return jsonify({"error": "Missing required field: escalated_to"}), 400
    
    # Check if note is already escalated
    if note.is_escalated:
        return jsonify({"error": "Note is already escalated"}), 400
    
    # Update note
    note.is_escalated = True
    note.escalated_to = data['escalated_to']
    note.escalation_reason = data.get('escalation_reason', 'Escalation requested by caregiver')
    note.escalation_time = datetime.now()
    
    # Create a notification for the escalated user
    notification = Notification(
        user_id=note.escalated_to,
        notification_type=NotificationType.ESCALATION,
        title=f"Note Escalation: {note.title}",
        message=f"A note has been escalated to you by {current_user.get_full_name()}. Reason: {note.escalation_reason}",
        priority="high",
        reference_id=note.id,
        reference_type="note"
    )
    
    db.session.add(notification)
    db.session.commit()
    
    return jsonify({
        "message": "Note escalated successfully",
        "note": {
            "id": note.id,
            "title": note.title,
            "is_escalated": note.is_escalated,
            "escalated_to": note.escalated_to,
            "escalation_time": note.escalation_time.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@note_bp.route('/patient/<int:patient_id>/summary', methods=['GET'])
@login_required
def get_patient_notes_summary(patient_id):
    """Get a summary of notes for a specific patient"""
    # Get latest notes for each type
    summary = {}
    
    for note_type in NoteType:
        # Get the most recent note of this type
        latest = Note.query.filter_by(patient_id=patient_id, note_type=note_type).order_by(desc(Note.created_at)).first()
        
        if latest:
            creator = latest.creator
            
            summary[note_type.value] = {
                "id": latest.id,
                "title": latest.title,
                "content": latest.content[:100] + "..." if len(latest.content) > 100 else latest.content,
                "created_by": creator.get_full_name() if creator else "Unknown",
                "is_escalated": latest.is_escalated,
                "created_at": latest.created_at.strftime('%Y-%m-%d %H:%M:%S')
            }
    
    # Get count of escalated notes
    escalated_count = Note.query.filter_by(patient_id=patient_id, is_escalated=True).count()
    
    return jsonify({
        "patient_id": patient_id,
        "note_summary": summary,
        "escalated_count": escalated_count,
        "total_notes": Note.query.filter_by(patient_id=patient_id).count()
    }), 200