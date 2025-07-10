from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc, and_, func
from datetime import datetime, date, time, timedelta

from app import db
from models.user import User, UserRole
from models.patient import Patient
from models.visit import Visit, VisitStatus, VisitType

# Create blueprint
visit_bp = Blueprint('visit', __name__)

@visit_bp.route('/', methods=['GET'])
@login_required
def get_visits():
    """Get a list of visits with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 10, type=int)
    
    # Filtering options
    caregiver_id = request.args.get('caregiver_id', type=int)
    patient_id = request.args.get('patient_id', type=int)
    status = request.args.get('status')
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    # Base query
    query = Visit.query
    
    # Apply filters
    if caregiver_id:
        query = query.filter_by(caregiver_id=caregiver_id)
    elif current_user.role == UserRole.CAREGIVER:
        # Caregivers can only see their assigned visits
        query = query.filter_by(caregiver_id=current_user.id)
        
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    if status:
        try:
            visit_status = VisitStatus[status.upper()]
            query = query.filter_by(status=visit_status)
        except KeyError:
            pass
    
    # Date filtering
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d').date()
            query = query.filter(Visit.scheduled_date >= from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, '%Y-%m-%d').date()
            query = query.filter(Visit.scheduled_date <= to_date)
        except ValueError:
            pass
    
    # Default to today's visits if no date filter is provided
    if not date_from and not date_to:
        today = date.today()
        query = query.filter(Visit.scheduled_date == today)
    
    # Order by scheduled date and time
    query = query.order_by(Visit.scheduled_date, Visit.scheduled_start_time)
    
    # Apply pagination
    paginated_visits = query.paginate(page=page, per_page=per_page)
    
    # Format response
    visits = []
    for visit in paginated_visits.items:
        patient = visit.patient
        caregiver = visit.caregiver
        
        # Format times to strings
        scheduled_start = visit.scheduled_start_time.strftime('%H:%M') if visit.scheduled_start_time else None
        scheduled_end = visit.scheduled_end_time.strftime('%H:%M') if visit.scheduled_end_time else None
        actual_start = visit.actual_start_time.strftime('%Y-%m-%d %H:%M:%S') if visit.actual_start_time else None
        actual_end = visit.actual_end_time.strftime('%Y-%m-%d %H:%M:%S') if visit.actual_end_time else None
        
        visits.append({
            "id": visit.id,
            "patient": {
                "id": patient.id if patient else None,
                "name": patient.get_full_name() if patient else "Unknown",
                "cpr_number": patient.cpr_number if patient else None
            },
            "caregiver": {
                "id": caregiver.id if caregiver else None,
                "name": caregiver.get_full_name() if caregiver else "Unassigned"
            },
            "visit_type": visit.visit_type.value,
            "status": visit.status.value,
            "scheduled_date": visit.scheduled_date.strftime('%Y-%m-%d'),
            "scheduled_start_time": scheduled_start,
            "scheduled_end_time": scheduled_end,
            "actual_start_time": actual_start,
            "actual_end_time": actual_end,
            "location": visit.location,
            "reason_for_visit": visit.reason_for_visit,
            "arrival_verified": visit.arrival_verified
        })
    
    return jsonify({
        "visits": visits,
        "pagination": {
            "page": paginated_visits.page,
            "per_page": paginated_visits.per_page,
            "total_pages": paginated_visits.pages,
            "total_items": paginated_visits.total
        }
    }), 200

@visit_bp.route('/<int:visit_id>', methods=['GET'])
@login_required
def get_visit(visit_id):
    """Get detailed information about a specific visit"""
    visit = Visit.query.get_or_404(visit_id)
    
    # Check permissions
    if current_user.role == UserRole.CAREGIVER and visit.caregiver_id != current_user.id:
        return jsonify({"error": "You don't have permission to view this visit"}), 403
    
    patient = visit.patient
    caregiver = visit.caregiver
    
    # Format times to strings
    scheduled_start = visit.scheduled_start_time.strftime('%H:%M') if visit.scheduled_start_time else None
    scheduled_end = visit.scheduled_end_time.strftime('%H:%M') if visit.scheduled_end_time else None
    actual_start = visit.actual_start_time.strftime('%Y-%m-%d %H:%M:%S') if visit.actual_start_time else None
    actual_end = visit.actual_end_time.strftime('%Y-%m-%d %H:%M:%S') if visit.actual_end_time else None
    
    # Get notes and vital records for the visit
    notes = []
    for note in visit.notes:
        creator = note.creator
        notes.append({
            "id": note.id,
            "title": note.title,
            "content": note.content,
            "note_type": note.note_type.value,
            "is_escalated": note.is_escalated,
            "created_by": creator.get_full_name() if creator else "Unknown",
            "created_at": note.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    vitals = []
    for vital in visit.vital_records:
        vitals.append({
            "id": vital.id,
            "vital_type": vital.vital_type.value,
            "value": vital.value,
            "unit": vital.unit,
            "is_abnormal": vital.is_abnormal,
            "is_critical": vital.is_critical(),
            "notes": vital.notes,
            "device_used": vital.device_used,
            "created_at": vital.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    # Prepare response
    response = {
        "id": visit.id,
        "patient": {
            "id": patient.id if patient else None,
            "name": patient.get_full_name() if patient else "Unknown",
            "cpr_number": patient.cpr_number if patient else None,
            "date_of_birth": patient.date_of_birth.strftime('%Y-%m-%d') if patient and patient.date_of_birth else None,
            "gender": patient.gender if patient else None,
            "age": patient.get_age() if patient else None
        },
        "caregiver": {
            "id": caregiver.id if caregiver else None,
            "name": caregiver.get_full_name() if caregiver else "Unassigned",
            "role": caregiver.role.value if caregiver else None
        },
        "visit_type": visit.visit_type.value,
        "status": visit.status.value,
        "scheduled_date": visit.scheduled_date.strftime('%Y-%m-%d'),
        "scheduled_start_time": scheduled_start,
        "scheduled_end_time": scheduled_end,
        "actual_start_time": actual_start,
        "actual_end_time": actual_end,
        "duration_minutes": visit.get_duration_minutes(),
        "location": visit.location,
        "location_lat": visit.location_lat,
        "location_long": visit.location_long,
        "arrival_verification_method": visit.arrival_verification_method,
        "arrival_verified": visit.arrival_verified,
        "arrival_verification_time": visit.arrival_verification_time.strftime('%Y-%m-%d %H:%M:%S') if visit.arrival_verification_time else None,
        "reason_for_visit": visit.reason_for_visit,
        "visit_summary": visit.visit_summary,
        "is_synced": visit.is_synced,
        "sync_timestamp": visit.sync_timestamp.strftime('%Y-%m-%d %H:%M:%S') if visit.sync_timestamp else None,
        "is_overdue": visit.is_overdue(),
        "notes": notes,
        "vitals": vitals,
        "created_at": visit.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "updated_at": visit.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(response), 200

@visit_bp.route('/', methods=['POST'])
@login_required
def create_visit():
    """Create a new visit"""
    # Check if user has permission to create visits
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json
    
    # Validate required fields
    required_fields = ['patient_id', 'visit_type', 'scheduled_date', 'scheduled_start_time', 'scheduled_end_time']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate patient exists
    patient = Patient.query.get(data['patient_id'])
    if not patient:
        return jsonify({"error": f"Patient with ID {data['patient_id']} not found"}), 404
    
    # Validate caregiver exists if provided
    caregiver_id = data.get('caregiver_id')
    if caregiver_id:
        caregiver = User.query.get(caregiver_id)
        if not caregiver or caregiver.role != UserRole.CAREGIVER:
            return jsonify({"error": f"Valid caregiver with ID {caregiver_id} not found"}), 404
    
    # Parse dates and times
    try:
        scheduled_date = datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date()
        scheduled_start_time = datetime.strptime(data['scheduled_start_time'], '%H:%M').time()
        scheduled_end_time = datetime.strptime(data['scheduled_end_time'], '%H:%M').time()
    except ValueError:
        return jsonify({"error": "Invalid date or time format. Use YYYY-MM-DD for date and HH:MM for time"}), 400
    
    # Validate visit type
    try:
        visit_type = VisitType[data['visit_type'].upper()] if isinstance(data['visit_type'], str) else data['visit_type']
    except KeyError:
        return jsonify({"error": f"Invalid visit type: {data['visit_type']}. Valid types are: {', '.join([t.value for t in VisitType])}"}), 400
    
    # Create visit
    visit = Visit(
        patient_id=data['patient_id'],
        caregiver_id=caregiver_id,
        visit_type=visit_type,
        status=VisitStatus.SCHEDULED,
        scheduled_date=scheduled_date,
        scheduled_start_time=scheduled_start_time,
        scheduled_end_time=scheduled_end_time,
        location=data.get('location'),
        location_lat=data.get('location_lat'),
        location_long=data.get('location_long'),
        reason_for_visit=data.get('reason_for_visit')
    )
    
    db.session.add(visit)
    db.session.commit()
    
    return jsonify({
        "message": "Visit created successfully",
        "visit": {
            "id": visit.id,
            "patient_id": visit.patient_id,
            "caregiver_id": visit.caregiver_id,
            "scheduled_date": visit.scheduled_date.strftime('%Y-%m-%d'),
            "scheduled_start_time": visit.scheduled_start_time.strftime('%H:%M'),
            "status": visit.status.value
        }
    }), 201

@visit_bp.route('/<int:visit_id>', methods=['PUT'])
@login_required
def update_visit(visit_id):
    """Update a visit"""
    # Admin and supervisor can update any visit
    # Caregivers can only update their own visits
    visit = Visit.query.get_or_404(visit_id)
    
    if current_user.role == UserRole.CAREGIVER and visit.caregiver_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json
    
    # Update basic fields if provided
    if 'caregiver_id' in data and current_user.role in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        caregiver_id = data['caregiver_id']
        if caregiver_id:
            caregiver = User.query.get(caregiver_id)
            if not caregiver or caregiver.role != UserRole.CAREGIVER:
                return jsonify({"error": f"Valid caregiver with ID {caregiver_id} not found"}), 404
        visit.caregiver_id = caregiver_id
    
    if 'visit_type' in data:
        try:
            visit_type = VisitType[data['visit_type'].upper()] if isinstance(data['visit_type'], str) else data['visit_type']
            visit.visit_type = visit_type
        except KeyError:
            return jsonify({"error": f"Invalid visit type: {data['visit_type']}. Valid types are: {', '.join([t.value for t in VisitType])}"}), 400
    
    if 'status' in data and current_user.role in [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CAREGIVER]:
        try:
            status = VisitStatus[data['status'].upper()] if isinstance(data['status'], str) else data['status']
            visit.status = status
        except KeyError:
            return jsonify({"error": f"Invalid status: {data['status']}. Valid statuses are: {', '.join([s.value for s in VisitStatus])}"}), 400
    
    # Update date and time fields if provided
    if 'scheduled_date' in data:
        try:
            visit.scheduled_date = datetime.strptime(data['scheduled_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format. Use YYYY-MM-DD"}), 400
    
    if 'scheduled_start_time' in data:
        try:
            visit.scheduled_start_time = datetime.strptime(data['scheduled_start_time'], '%H:%M').time()
        except ValueError:
            return jsonify({"error": "Invalid time format. Use HH:MM"}), 400
    
    if 'scheduled_end_time' in data:
        try:
            visit.scheduled_end_time = datetime.strptime(data['scheduled_end_time'], '%H:%M').time()
        except ValueError:
            return jsonify({"error": "Invalid time format. Use HH:MM"}), 400
    
    # Update actual start and end times (for caregivers to mark visit progress)
    if 'actual_start_time' in data and current_user.role in [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CAREGIVER]:
        if data['actual_start_time'] is None:
            visit.actual_start_time = None
        else:
            try:
                visit.actual_start_time = datetime.strptime(data['actual_start_time'], '%Y-%m-%d %H:%M:%S')
            except ValueError:
                return jsonify({"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM:SS"}), 400
    
    if 'actual_end_time' in data and current_user.role in [UserRole.ADMIN, UserRole.SUPERVISOR, UserRole.CAREGIVER]:
        if data['actual_end_time'] is None:
            visit.actual_end_time = None
        else:
            try:
                visit.actual_end_time = datetime.strptime(data['actual_end_time'], '%Y-%m-%d %H:%M:%S')
            except ValueError:
                return jsonify({"error": "Invalid datetime format. Use YYYY-MM-DD HH:MM:SS"}), 400
    
    # Update other fields
    if 'location' in data:
        visit.location = data['location']
    
    if 'location_lat' in data:
        visit.location_lat = data['location_lat']
    
    if 'location_long' in data:
        visit.location_long = data['location_long']
    
    if 'reason_for_visit' in data:
        visit.reason_for_visit = data['reason_for_visit']
    
    if 'visit_summary' in data:
        visit.visit_summary = data['visit_summary']
    
    if 'arrival_verified' in data:
        visit.arrival_verified = data['arrival_verified']
        if visit.arrival_verified and not visit.arrival_verification_time:
            visit.arrival_verification_time = datetime.now()
    
    if 'arrival_verification_method' in data:
        visit.arrival_verification_method = data['arrival_verification_method']
    
    if 'arrival_verification_data' in data:
        visit.arrival_verification_data = data['arrival_verification_data']
    
    # Check for cancellation
    if 'cancellation_reason' in data and data.get('status') == 'CANCELLED':
        visit.cancellation_reason = data['cancellation_reason']
    
    db.session.commit()
    
    return jsonify({
        "message": "Visit updated successfully",
        "visit": {
            "id": visit.id,
            "status": visit.status.value,
            "updated_at": visit.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@visit_bp.route('/mark-arrival/<int:visit_id>', methods=['POST'])
@login_required
def mark_arrival(visit_id):
    """Mark caregiver arrival at visit location"""
    visit = Visit.query.get_or_404(visit_id)
    
    # Only assigned caregiver or admin/supervisor can mark arrival
    if current_user.role == UserRole.CAREGIVER and visit.caregiver_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json or {}
    
    # Verify the visit is not already completed or cancelled
    if visit.status in [VisitStatus.COMPLETED, VisitStatus.CANCELLED]:
        return jsonify({"error": f"Cannot mark arrival for a visit with status {visit.status.value}"}), 400
    
    # Update arrival data
    visit.arrival_verified = True
    visit.arrival_verification_time = datetime.now()
    visit.arrival_verification_method = data.get('verification_method', 'GPS')
    visit.arrival_verification_data = data.get('verification_data')
    
    # Update location if provided
    if 'location_lat' in data and 'location_long' in data:
        visit.location_lat = data['location_lat']
        visit.location_long = data['location_long']
    
    # Update visit status
    visit.status = VisitStatus.ARRIVED
    
    db.session.commit()
    
    return jsonify({
        "message": "Arrival marked successfully",
        "visit": {
            "id": visit.id,
            "status": visit.status.value,
            "arrival_verification_time": visit.arrival_verification_time.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@visit_bp.route('/start/<int:visit_id>', methods=['POST'])
@login_required
def start_visit(visit_id):
    """Start a visit"""
    visit = Visit.query.get_or_404(visit_id)
    
    # Only assigned caregiver or admin/supervisor can start visit
    if current_user.role == UserRole.CAREGIVER and visit.caregiver_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Verify the visit is not already completed, cancelled, or in progress
    if visit.status in [VisitStatus.IN_PROGRESS, VisitStatus.COMPLETED, VisitStatus.CANCELLED]:
        return jsonify({"error": f"Cannot start a visit with status {visit.status.value}"}), 400
    
    # Update visit status and start time
    visit.status = VisitStatus.IN_PROGRESS
    visit.actual_start_time = datetime.now()
    
    db.session.commit()
    
    return jsonify({
        "message": "Visit started successfully",
        "visit": {
            "id": visit.id,
            "status": visit.status.value,
            "actual_start_time": visit.actual_start_time.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@visit_bp.route('/complete/<int:visit_id>', methods=['POST'])
@login_required
def complete_visit(visit_id):
    """Complete a visit"""
    visit = Visit.query.get_or_404(visit_id)
    
    # Only assigned caregiver or admin/supervisor can complete visit
    if current_user.role == UserRole.CAREGIVER and visit.caregiver_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json or {}
    
    # Verify the visit is in progress
    if visit.status != VisitStatus.IN_PROGRESS:
        return jsonify({"error": f"Cannot complete a visit with status {visit.status.value}"}), 400
    
    # Update visit status, end time, and summary
    visit.status = VisitStatus.COMPLETED
    visit.actual_end_time = datetime.now()
    
    if 'visit_summary' in data:
        visit.visit_summary = data['visit_summary']
    
    db.session.commit()
    
    return jsonify({
        "message": "Visit completed successfully",
        "visit": {
            "id": visit.id,
            "status": visit.status.value,
            "actual_end_time": visit.actual_end_time.strftime('%Y-%m-%d %H:%M:%S'),
            "duration_minutes": visit.get_duration_minutes()
        }
    }), 200

@visit_bp.route('/cancel/<int:visit_id>', methods=['POST'])
@login_required
def cancel_visit(visit_id):
    """Cancel a visit"""
    # Only admin or supervisor can cancel visits
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        return jsonify({"error": "Permission denied"}), 403
    
    visit = Visit.query.get_or_404(visit_id)
    data = request.json or {}
    
    # Verify the visit is not already completed or cancelled
    if visit.status in [VisitStatus.COMPLETED, VisitStatus.CANCELLED]:
        return jsonify({"error": f"Cannot cancel a visit with status {visit.status.value}"}), 400
    
    # Cancellation reason is required
    if 'cancellation_reason' not in data or not data['cancellation_reason']:
        return jsonify({"error": "Cancellation reason is required"}), 400
    
    # Update visit status and reason
    visit.status = VisitStatus.CANCELLED
    visit.cancellation_reason = data['cancellation_reason']
    
    db.session.commit()
    
    return jsonify({
        "message": "Visit cancelled successfully",
        "visit": {
            "id": visit.id,
            "status": visit.status.value,
            "cancellation_reason": visit.cancellation_reason
        }
    }), 200