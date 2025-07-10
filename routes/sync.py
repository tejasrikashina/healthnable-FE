from flask import Blueprint, request, jsonify, current_app
from flask_login import login_required, current_user
from sqlalchemy import desc
from datetime import datetime, timedelta
import json

from app import db
from models.user import UserRole
from models.visit import Visit
from models.vital import VitalRecord
from models.note import Note
from models.document import Document
from models.chat import ChatMessage

# Create blueprint
sync_bp = Blueprint('sync', __name__)

@sync_bp.route('/status', methods=['GET'])
@login_required
def get_sync_status():
    """Get synchronization status for the current user"""
    # Get the last sync time from request
    last_sync = request.args.get('last_sync')
    
    try:
        if last_sync:
            last_sync_time = datetime.strptime(last_sync, '%Y-%m-%d %H:%M:%S')
        else:
            # Default to 7 days ago if no last sync time provided
            last_sync_time = datetime.now() - timedelta(days=7)
    except ValueError:
        return jsonify({"error": "Invalid last_sync format. Use YYYY-MM-DD HH:MM:SS"}), 400
    
    # Check for unsynced data
    unsynced_counts = {}
    
    # Visits
    if current_user.role == UserRole.CAREGIVER:
        unsynced_visits = Visit.query.filter(
            Visit.caregiver_id == current_user.id,
            Visit.updated_at > last_sync_time,
            Visit.is_synced == False
        ).count()
    else:
        unsynced_visits = Visit.query.filter(
            Visit.updated_at > last_sync_time,
            Visit.is_synced == False
        ).count()
    
    unsynced_counts['visits'] = unsynced_visits
    
    # Vitals
    unsynced_vitals = VitalRecord.query.filter(
        VitalRecord.caregiver_id == current_user.id,
        VitalRecord.updated_at > last_sync_time,
        VitalRecord.is_synced == False
    ).count()
    
    unsynced_counts['vitals'] = unsynced_vitals
    
    # Notes
    unsynced_notes = Note.query.filter(
        Note.created_by == current_user.id,
        Note.updated_at > last_sync_time,
        Note.is_pending == True
    ).count()
    
    unsynced_counts['notes'] = unsynced_notes
    
    # Documents
    unsynced_documents = Document.query.filter(
        Document.uploaded_by == current_user.id,
        Document.updated_at > last_sync_time,
        Document.is_synced == False
    ).count()
    
    unsynced_counts['documents'] = unsynced_documents
    
    # Chat messages
    unsynced_messages = ChatMessage.query.filter(
        ChatMessage.sender_id == current_user.id,
        ChatMessage.updated_at > last_sync_time,
        ChatMessage.is_synced == False
    ).count()
    
    unsynced_counts['chat_messages'] = unsynced_messages
    
    # Total count
    total_unsynced = sum(unsynced_counts.values())
    
    return jsonify({
        "unsynced_items": unsynced_counts,
        "total_unsynced": total_unsynced,
        "last_sync_time": last_sync_time.strftime('%Y-%m-%d %H:%M:%S'),
        "current_server_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }), 200

@sync_bp.route('/push', methods=['POST'])
@login_required
def push_changes():
    """Push local changes to the server"""
    data = request.json
    
    if not data or not isinstance(data, dict):
        return jsonify({"error": "Invalid request format"}), 400
    
    sync_results = {
        "success": True,
        "synced_counts": {},
        "errors": []
    }
    
    # Process visits
    if 'visits' in data and isinstance(data['visits'], list):
        synced_visits = 0
        for visit_data in data['visits']:
            try:
                if not isinstance(visit_data, dict) or 'id' not in visit_data:
                    continue
                
                visit_id = visit_data.get('id')
                visit = Visit.query.get(visit_id)
                
                if not visit:
                    sync_results["errors"].append(f"Visit with ID {visit_id} not found")
                    continue
                
                # Check permissions - only assigned caregiver or admin/supervisor can update
                if current_user.role == UserRole.CAREGIVER and visit.caregiver_id != current_user.id:
                    sync_results["errors"].append(f"Permission denied for visit ID {visit_id}")
                    continue
                
                # Update visit fields
                if 'status' in visit_data:
                    try:
                        from models.visit import VisitStatus
                        status = VisitStatus[visit_data['status'].upper()]
                        visit.status = status
                    except (KeyError, AttributeError):
                        pass
                
                if 'actual_start_time' in visit_data:
                    if visit_data['actual_start_time']:
                        try:
                            visit.actual_start_time = datetime.strptime(visit_data['actual_start_time'], '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            pass
                    else:
                        visit.actual_start_time = None
                
                if 'actual_end_time' in visit_data:
                    if visit_data['actual_end_time']:
                        try:
                            visit.actual_end_time = datetime.strptime(visit_data['actual_end_time'], '%Y-%m-%d %H:%M:%S')
                        except ValueError:
                            pass
                    else:
                        visit.actual_end_time = None
                
                if 'visit_summary' in visit_data:
                    visit.visit_summary = visit_data['visit_summary']
                
                if 'arrival_verified' in visit_data:
                    visit.arrival_verified = visit_data['arrival_verified']
                
                if 'arrival_verification_method' in visit_data:
                    visit.arrival_verification_method = visit_data['arrival_verification_method']
                
                if 'arrival_verification_data' in visit_data:
                    visit.arrival_verification_data = visit_data['arrival_verification_data']
                
                if 'location_lat' in visit_data and 'location_long' in visit_data:
                    visit.location_lat = visit_data['location_lat']
                    visit.location_long = visit_data['location_long']
                
                # Mark as synced
                visit.is_synced = True
                visit.sync_timestamp = datetime.now()
                
                synced_visits += 1
            except Exception as e:
                sync_results["errors"].append(f"Error syncing visit: {str(e)}")
        
        sync_results["synced_counts"]["visits"] = synced_visits
    
    # Process vitals
    if 'vitals' in data and isinstance(data['vitals'], list):
        synced_vitals = 0
        for vital_data in data['vitals']:
            try:
                if not isinstance(vital_data, dict) or 'id' not in vital_data:
                    continue
                
                vital_id = vital_data.get('id')
                vital = VitalRecord.query.get(vital_id)
                
                if not vital:
                    sync_results["errors"].append(f"Vital record with ID {vital_id} not found")
                    continue
                
                # Check permissions - only creator or admin/supervisor can update
                if current_user.role == UserRole.CAREGIVER and vital.caregiver_id != current_user.id:
                    sync_results["errors"].append(f"Permission denied for vital record ID {vital_id}")
                    continue
                
                # Mark as synced
                vital.is_synced = True
                vital.sync_timestamp = datetime.now()
                
                synced_vitals += 1
            except Exception as e:
                sync_results["errors"].append(f"Error syncing vital record: {str(e)}")
        
        sync_results["synced_counts"]["vitals"] = synced_vitals
    
    # Process notes
    if 'notes' in data and isinstance(data['notes'], list):
        synced_notes = 0
        for note_data in data['notes']:
            try:
                if not isinstance(note_data, dict) or 'id' not in note_data:
                    continue
                
                note_id = note_data.get('id')
                note = Note.query.get(note_id)
                
                if not note:
                    sync_results["errors"].append(f"Note with ID {note_id} not found")
                    continue
                
                # Check permissions - only creator or admin/supervisor can update
                if current_user.role == UserRole.CAREGIVER and note.created_by != current_user.id:
                    sync_results["errors"].append(f"Permission denied for note ID {note_id}")
                    continue
                
                # Update note data
                if 'content' in note_data:
                    note.content = note_data['content']
                
                if 'title' in note_data:
                    note.title = note_data['title']
                
                # Mark as synced
                note.is_pending = False
                note.sync_status = 'synced'
                
                synced_notes += 1
            except Exception as e:
                sync_results["errors"].append(f"Error syncing note: {str(e)}")
        
        sync_results["synced_counts"]["notes"] = synced_notes
    
    # Process documents
    if 'documents' in data and isinstance(data['documents'], list):
        synced_documents = 0
        for doc_data in data['documents']:
            try:
                if not isinstance(doc_data, dict) or 'id' not in doc_data:
                    continue
                
                doc_id = doc_data.get('id')
                document = Document.query.get(doc_id)
                
                if not document:
                    sync_results["errors"].append(f"Document with ID {doc_id} not found")
                    continue
                
                # Check permissions - only uploader or admin/supervisor can update
                if current_user.role == UserRole.CAREGIVER and document.uploaded_by != current_user.id:
                    sync_results["errors"].append(f"Permission denied for document ID {doc_id}")
                    continue
                
                # Mark as synced
                document.is_synced = True
                document.sync_timestamp = datetime.now()
                
                synced_documents += 1
            except Exception as e:
                sync_results["errors"].append(f"Error syncing document: {str(e)}")
        
        sync_results["synced_counts"]["documents"] = synced_documents
    
    # Process chat messages
    if 'chat_messages' in data and isinstance(data['chat_messages'], list):
        synced_messages = 0
        for message_data in data['chat_messages']:
            try:
                if not isinstance(message_data, dict) or 'id' not in message_data:
                    continue
                
                message_id = message_data.get('id')
                message = ChatMessage.query.get(message_id)
                
                if not message:
                    sync_results["errors"].append(f"Chat message with ID {message_id} not found")
                    continue
                
                # Check permissions - only sender can update
                if message.sender_id != current_user.id:
                    sync_results["errors"].append(f"Permission denied for message ID {message_id}")
                    continue
                
                # Mark as synced
                message.is_synced = True
                message.sync_timestamp = datetime.now()
                
                synced_messages += 1
            except Exception as e:
                sync_results["errors"].append(f"Error syncing chat message: {str(e)}")
        
        sync_results["synced_counts"]["chat_messages"] = synced_messages
    
    # Commit all changes
    db.session.commit()
    
    # Check if any errors occurred
    if sync_results["errors"]:
        sync_results["success"] = False
    
    # Calculate total synced items
    total_synced = sum(sync_results["synced_counts"].values())
    sync_results["total_synced"] = total_synced
    
    return jsonify({
        "sync_results": sync_results,
        "sync_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S')
    }), 200

@sync_bp.route('/pull', methods=['GET'])
@login_required
def pull_changes():
    """Pull remote changes to local device"""
    # Get the last sync time from request
    last_sync = request.args.get('last_sync')
    
    try:
        if last_sync:
            last_sync_time = datetime.strptime(last_sync, '%Y-%m-%d %H:%M:%S')
        else:
            # Default to 7 days ago if no last sync time provided
            last_sync_time = datetime.now() - timedelta(days=7)
    except ValueError:
        return jsonify({"error": "Invalid last_sync format. Use YYYY-MM-DD HH:MM:SS"}), 400
    
    # Get max items per entity type from config or default to 50
    max_items = current_app.config.get("MAX_SYNC_BATCH_SIZE", 50)
    
    sync_data = {}
    
    # Get visits updated since last sync
    if current_user.role == UserRole.CAREGIVER:
        # Caregivers can only see their assigned visits
        visits = Visit.query.filter(
            Visit.caregiver_id == current_user.id,
            Visit.updated_at > last_sync_time
        ).order_by(desc(Visit.updated_at)).limit(max_items).all()
    else:
        # Admins and supervisors can see all visits
        visits = Visit.query.filter(
            Visit.updated_at > last_sync_time
        ).order_by(desc(Visit.updated_at)).limit(max_items).all()
    
    # Format visits for response
    visit_list = []
    for visit in visits:
        visit_data = {
            "id": visit.id,
            "patient_id": visit.patient_id,
            "caregiver_id": visit.caregiver_id,
            "visit_type": visit.visit_type.value,
            "status": visit.status.value,
            "scheduled_date": visit.scheduled_date.strftime('%Y-%m-%d'),
            "scheduled_start_time": visit.scheduled_start_time.strftime('%H:%M') if visit.scheduled_start_time else None,
            "scheduled_end_time": visit.scheduled_end_time.strftime('%H:%M') if visit.scheduled_end_time else None,
            "actual_start_time": visit.actual_start_time.strftime('%Y-%m-%d %H:%M:%S') if visit.actual_start_time else None,
            "actual_end_time": visit.actual_end_time.strftime('%Y-%m-%d %H:%M:%S') if visit.actual_end_time else None,
            "location": visit.location,
            "location_lat": visit.location_lat,
            "location_long": visit.location_long,
            "reason_for_visit": visit.reason_for_visit,
            "visit_summary": visit.visit_summary,
            "arrival_verified": visit.arrival_verified,
            "arrival_verification_method": visit.arrival_verification_method,
            "cancellation_reason": visit.cancellation_reason,
            "is_synced": visit.is_synced,
            "updated_at": visit.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        visit_list.append(visit_data)
    
    sync_data['visits'] = visit_list
    
    # Get vitals records updated since last sync
    if current_user.role == UserRole.CAREGIVER:
        # Caregivers can see vitals they recorded and vitals for their assigned patients
        caregiver_visits = db.session.query(Visit.patient_id).filter_by(caregiver_id=current_user.id).distinct().all()
        patient_ids = [v[0] for v in caregiver_visits]
        
        vitals = VitalRecord.query.filter(
            ((VitalRecord.caregiver_id == current_user.id) | (VitalRecord.patient_id.in_(patient_ids))),
            VitalRecord.updated_at > last_sync_time
        ).order_by(desc(VitalRecord.updated_at)).limit(max_items).all()
    else:
        # Admins and supervisors can see all vitals
        vitals = VitalRecord.query.filter(
            VitalRecord.updated_at > last_sync_time
        ).order_by(desc(VitalRecord.updated_at)).limit(max_items).all()
    
    # Format vitals for response
    vitals_list = []
    for vital in vitals:
        vital_data = {
            "id": vital.id,
            "patient_id": vital.patient_id,
            "visit_id": vital.visit_id,
            "caregiver_id": vital.caregiver_id,
            "vital_type": vital.vital_type.value,
            "value": vital.value,
            "numeric_value": vital.numeric_value,
            "unit": vital.unit,
            "notes": vital.notes,
            "is_abnormal": vital.is_abnormal,
            "device_used": vital.device_used,
            "is_synced": vital.is_synced,
            "updated_at": vital.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        vitals_list.append(vital_data)
    
    sync_data['vitals'] = vitals_list
    
    # Get notes updated since last sync
    if current_user.role == UserRole.CAREGIVER:
        # Caregivers can see notes they created and notes for their assigned patients
        caregiver_visits = db.session.query(Visit.patient_id).filter_by(caregiver_id=current_user.id).distinct().all()
        patient_ids = [v[0] for v in caregiver_visits]
        
        notes = Note.query.filter(
            ((Note.created_by == current_user.id) | (Note.patient_id.in_(patient_ids))),
            Note.updated_at > last_sync_time
        ).order_by(desc(Note.updated_at)).limit(max_items).all()
    else:
        # Admins and supervisors can see all notes
        notes = Note.query.filter(
            Note.updated_at > last_sync_time
        ).order_by(desc(Note.updated_at)).limit(max_items).all()
    
    # Format notes for response
    notes_list = []
    for note in notes:
        note_data = {
            "id": note.id,
            "patient_id": note.patient_id,
            "visit_id": note.visit_id,
            "created_by": note.created_by,
            "note_type": note.note_type.value,
            "title": note.title,
            "content": note.content,
            "is_escalated": note.is_escalated,
            "escalated_to": note.escalated_to,
            "escalation_reason": note.escalation_reason,
            "is_pending": note.is_pending,
            "sync_status": note.sync_status,
            "updated_at": note.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        notes_list.append(note_data)
    
    sync_data['notes'] = notes_list
    
    # Get chat messages updated since last sync
    # First get all threads the user participates in
    from models.chat import ChatThreadParticipant
    participant_thread_ids = db.session.query(ChatThreadParticipant.thread_id)\
        .filter_by(user_id=current_user.id).all()
    thread_ids = [t[0] for t in participant_thread_ids]
    
    messages = ChatMessage.query.filter(
        ChatMessage.thread_id.in_(thread_ids),
        ChatMessage.updated_at > last_sync_time
    ).order_by(desc(ChatMessage.updated_at)).limit(max_items).all()
    
    # Format messages for response
    messages_list = []
    for message in messages:
        message_data = {
            "id": message.id,
            "thread_id": message.thread_id,
            "sender_id": message.sender_id,
            "content": message.content,
            "is_read": message.is_read,
            "is_synced": message.is_synced,
            "created_at": message.created_at.strftime('%Y-%m-%d %H:%M:%S'),
            "updated_at": message.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
        messages_list.append(message_data)
    
    sync_data['chat_messages'] = messages_list
    
    # Count total items synced
    total_items = len(visit_list) + len(vitals_list) + len(notes_list) + len(messages_list)
    
    return jsonify({
        "sync_data": sync_data,
        "total_items": total_items,
        "sync_time": datetime.now().strftime('%Y-%m-%d %H:%M:%S'),
        "next_sync_recommended": (datetime.now() + timedelta(hours=1)).strftime('%Y-%m-%d %H:%M:%S')
    }), 200