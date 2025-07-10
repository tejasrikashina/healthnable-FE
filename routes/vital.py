from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc
from datetime import datetime

from app import db
from models.user import UserRole
from models.vital import VitalRecord, VitalType

# Create blueprint
vital_bp = Blueprint('vital', __name__)

@vital_bp.route('/', methods=['GET'])
@login_required
def get_vitals():
    """Get a list of vital records with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filtering options
    patient_id = request.args.get('patient_id', type=int)
    visit_id = request.args.get('visit_id', type=int)
    vital_type = request.args.get('vital_type')
    is_abnormal = request.args.get('is_abnormal', '').lower() == 'true'
    date_from = request.args.get('date_from')
    date_to = request.args.get('date_to')
    
    # Base query
    query = VitalRecord.query
    
    # Apply filters
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    if visit_id:
        query = query.filter_by(visit_id=visit_id)
    
    if vital_type:
        try:
            vt = VitalType[vital_type.upper()]
            query = query.filter_by(vital_type=vt)
        except KeyError:
            pass
    
    if is_abnormal:
        query = query.filter_by(is_abnormal=True)
    
    # Date filtering
    if date_from:
        try:
            from_date = datetime.strptime(date_from, '%Y-%m-%d')
            query = query.filter(VitalRecord.created_at >= from_date)
        except ValueError:
            pass
    
    if date_to:
        try:
            to_date = datetime.strptime(date_to, '%Y-%m-%d 23:59:59')
            query = query.filter(VitalRecord.created_at <= to_date)
        except ValueError:
            pass
    
    # Order by most recent first
    query = query.order_by(desc(VitalRecord.created_at))
    
    # Apply pagination
    paginated_vitals = query.paginate(page=page, per_page=per_page)
    
    # Format response
    vitals = []
    for vital in paginated_vitals.items:
        vitals.append({
            "id": vital.id,
            "patient_id": vital.patient_id,
            "visit_id": vital.visit_id,
            "caregiver_id": vital.caregiver_id,
            "vital_type": vital.vital_type.value,
            "value": vital.value,
            "numeric_value": vital.numeric_value,
            "unit": vital.unit,
            "is_abnormal": vital.is_abnormal,
            "is_critical": vital.is_critical(),
            "device_used": vital.device_used,
            "is_device_synced": vital.is_device_synced,
            "created_at": vital.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify({
        "vitals": vitals,
        "pagination": {
            "page": paginated_vitals.page,
            "per_page": paginated_vitals.per_page,
            "total_pages": paginated_vitals.pages,
            "total_items": paginated_vitals.total
        }
    }), 200

@vital_bp.route('/<int:vital_id>', methods=['GET'])
@login_required
def get_vital(vital_id):
    """Get detailed information about a specific vital record"""
    vital = VitalRecord.query.get_or_404(vital_id)
    
    # Check if caregiver is authorized to view this patient's data
    if current_user.role == UserRole.CAREGIVER:
        # For now, any caregiver can access, but could be restricted to assigned caregivers
        pass
    
    response = {
        "id": vital.id,
        "patient_id": vital.patient_id,
        "patient_name": vital.patient.get_full_name() if vital.patient else "Unknown",
        "visit_id": vital.visit_id,
        "caregiver_id": vital.caregiver_id,
        "caregiver_name": vital.caregiver.get_full_name() if vital.caregiver else "Unknown",
        "vital_type": vital.vital_type.value,
        "value": vital.value,
        "numeric_value": vital.numeric_value,
        "unit": vital.unit,
        "notes": vital.notes,
        "device_used": vital.device_used,
        "is_abnormal": vital.is_abnormal,
        "is_critical": vital.is_critical(),
        "is_device_synced": vital.is_device_synced,
        "device_sync_timestamp": vital.device_sync_timestamp.strftime('%Y-%m-%d %H:%M:%S') if vital.device_sync_timestamp else None,
        "is_synced": vital.is_synced,
        "sync_timestamp": vital.sync_timestamp.strftime('%Y-%m-%d %H:%M:%S') if vital.sync_timestamp else None,
        "created_at": vital.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "updated_at": vital.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(response), 200

@vital_bp.route('/', methods=['POST'])
@login_required
def create_vital():
    """Record a new vital sign"""
    data = request.json
    
    # Validate required fields
    required_fields = ['patient_id', 'vital_type', 'value']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate vital type
    try:
        vital_type = VitalType[data['vital_type'].upper()] if isinstance(data['vital_type'], str) else data['vital_type']
    except KeyError:
        return jsonify({"error": f"Invalid vital type: {data['vital_type']}. Valid types are: {', '.join([t.value for t in VitalType])}"}), 400
    
    # Extract numeric value if possible
    numeric_value = None
    if data.get('numeric_value') is not None:
        numeric_value = data['numeric_value']
    else:
        # Try to parse numeric value from string value
        try:
            if vital_type == VitalType.BLOOD_PRESSURE:
                # For BP, extract systolic (first number)
                parts = data['value'].split('/')
                if len(parts) > 0:
                    numeric_value = float(parts[0])
            else:
                # For other vitals, just convert to float
                numeric_value = float(data['value'])
        except (ValueError, TypeError):
            pass
    
    # Create new vital record
    vital = VitalRecord(
        patient_id=data['patient_id'],
        visit_id=data.get('visit_id'),
        caregiver_id=current_user.id,
        vital_type=vital_type,
        value=data['value'],
        numeric_value=numeric_value,
        unit=data.get('unit'),
        notes=data.get('notes'),
        device_used=data.get('device_used'),
        is_abnormal=data.get('is_abnormal', False),
        is_device_synced=data.get('is_device_synced', False)
    )
    
    # If synced from device, set timestamp
    if vital.is_device_synced:
        vital.device_sync_timestamp = datetime.now()
    
    db.session.add(vital)
    db.session.commit()
    
    # Check if vital is critical
    is_critical = vital.is_critical()
    
    return jsonify({
        "message": "Vital record created successfully",
        "vital": {
            "id": vital.id,
            "vital_type": vital.vital_type.value,
            "value": vital.value,
            "unit": vital.unit,
            "is_abnormal": vital.is_abnormal,
            "is_critical": is_critical
        },
        "warning": "This vital reading is critical and may require immediate attention!" if is_critical else None
    }), 201

@vital_bp.route('/<int:vital_id>', methods=['PUT'])
@login_required
def update_vital(vital_id):
    """Update a vital record"""
    vital = VitalRecord.query.get_or_404(vital_id)
    
    # Only allow updates to vitals recorded by the user, or by admins/supervisors
    if current_user.role == UserRole.CAREGIVER and vital.caregiver_id != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json
    
    # Update fields if provided
    if 'value' in data:
        vital.value = data['value']
        
        # Update numeric value if possible
        if 'numeric_value' in data:
            vital.numeric_value = data['numeric_value']
        else:
            # Try to extract numeric value from string value
            try:
                if vital.vital_type == VitalType.BLOOD_PRESSURE:
                    # For BP, extract systolic (first number)
                    parts = data['value'].split('/')
                    if len(parts) > 0:
                        vital.numeric_value = float(parts[0])
                else:
                    # For other vitals, just convert to float
                    vital.numeric_value = float(data['value'])
            except (ValueError, TypeError):
                pass
    
    if 'unit' in data:
        vital.unit = data['unit']
        
    if 'notes' in data:
        vital.notes = data['notes']
        
    if 'device_used' in data:
        vital.device_used = data['device_used']
        
    if 'is_abnormal' in data:
        vital.is_abnormal = data['is_abnormal']
        
    if 'is_device_synced' in data:
        old_sync = vital.is_device_synced
        vital.is_device_synced = data['is_device_synced']
        
        # If newly synced from device, set timestamp
        if not old_sync and vital.is_device_synced:
            vital.device_sync_timestamp = datetime.now()
    
    db.session.commit()
    
    # Check if vital is critical
    is_critical = vital.is_critical()
    
    return jsonify({
        "message": "Vital record updated successfully",
        "vital": {
            "id": vital.id,
            "value": vital.value,
            "is_abnormal": vital.is_abnormal,
            "is_critical": is_critical,
            "updated_at": vital.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        },
        "warning": "This vital reading is critical and may require immediate attention!" if is_critical else None
    }), 200

@vital_bp.route('/batch', methods=['POST'])
@login_required
def create_batch_vitals():
    """Record multiple vital signs in a single request (e.g., from device sync)"""
    data = request.json
    
    # Validate batch data
    if not isinstance(data, dict) or 'vitals' not in data or not isinstance(data['vitals'], list):
        return jsonify({"error": "Invalid request format. Expected 'vitals' array"}), 400
    
    if not data['vitals']:
        return jsonify({"error": "No vital records provided"}), 400
    
    # Common fields for all vitals in batch
    patient_id = data.get('patient_id')
    visit_id = data.get('visit_id')
    device_used = data.get('device_used')
    
    created_vitals = []
    critical_vitals = []
    
    for vital_data in data['vitals']:
        # Skip invalid entries
        if not isinstance(vital_data, dict) or 'vital_type' not in vital_data or 'value' not in vital_data:
            continue
        
        # Use common fields if not specified in individual record
        v_patient_id = vital_data.get('patient_id', patient_id)
        v_visit_id = vital_data.get('visit_id', visit_id)
        v_device_used = vital_data.get('device_used', device_used)
        
        # Skip if no patient ID
        if not v_patient_id:
            continue
        
        # Validate vital type
        try:
            vital_type = VitalType[vital_data['vital_type'].upper()] if isinstance(vital_data['vital_type'], str) else vital_data['vital_type']
        except KeyError:
            continue
        
        # Extract numeric value if possible
        numeric_value = None
        if vital_data.get('numeric_value') is not None:
            numeric_value = vital_data['numeric_value']
        else:
            # Try to parse numeric value from string value
            try:
                if vital_type == VitalType.BLOOD_PRESSURE:
                    # For BP, extract systolic (first number)
                    parts = vital_data['value'].split('/')
                    if len(parts) > 0:
                        numeric_value = float(parts[0])
                else:
                    # For other vitals, just convert to float
                    numeric_value = float(vital_data['value'])
            except (ValueError, TypeError):
                pass
        
        # Create vital record
        vital = VitalRecord(
            patient_id=v_patient_id,
            visit_id=v_visit_id,
            caregiver_id=current_user.id,
            vital_type=vital_type,
            value=vital_data['value'],
            numeric_value=numeric_value,
            unit=vital_data.get('unit'),
            notes=vital_data.get('notes'),
            device_used=v_device_used,
            is_abnormal=vital_data.get('is_abnormal', False),
            is_device_synced=vital_data.get('is_device_synced', True)
        )
        
        # If synced from device, set timestamp
        if vital.is_device_synced:
            vital.device_sync_timestamp = datetime.now()
        
        db.session.add(vital)
        created_vitals.append(vital)
    
    # Save all records
    if created_vitals:
        db.session.commit()
        
        # Check for critical vitals
        for vital in created_vitals:
            if vital.is_critical():
                critical_vitals.append({
                    "id": vital.id,
                    "vital_type": vital.vital_type.value,
                    "value": vital.value,
                    "unit": vital.unit
                })
    
    return jsonify({
        "message": f"Successfully recorded {len(created_vitals)} vital records",
        "vital_count": len(created_vitals),
        "critical_vitals": critical_vitals
    }), 201

@vital_bp.route('/patient/<int:patient_id>/history', methods=['GET'])
@login_required
def get_patient_vital_history(patient_id):
    """Get historical vital records for a specific patient"""
    vital_type = request.args.get('vital_type')
    limit = request.args.get('limit', 10, type=int)
    
    # Validate vital type if provided
    if vital_type:
        try:
            vital_type = VitalType[vital_type.upper()]
        except KeyError:
            return jsonify({"error": f"Invalid vital type: {vital_type}"}), 400
    
    # Base query
    query = VitalRecord.query.filter_by(patient_id=patient_id)
    
    # Filter by vital type if provided
    if vital_type:
        query = query.filter_by(vital_type=vital_type)
    
    # Get the most recent records
    recent_vitals = query.order_by(desc(VitalRecord.created_at)).limit(limit).all()
    
    # Format response based on vital type
    if vital_type:
        # Single vital type history (for charting)
        history = []
        for vital in recent_vitals:
            history.append({
                "id": vital.id,
                "value": vital.value,
                "numeric_value": vital.numeric_value,
                "timestamp": vital.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "is_abnormal": vital.is_abnormal,
                "is_critical": vital.is_critical()
            })
        
        return jsonify({
            "patient_id": patient_id,
            "vital_type": vital_type.value,
            "unit": recent_vitals[0].unit if recent_vitals else None,
            "history": history
        }), 200
    else:
        # Group by vital type (summary)
        grouped_vitals = {}
        
        for vital in recent_vitals:
            vt = vital.vital_type.value
            if vt not in grouped_vitals:
                grouped_vitals[vt] = []
            
            grouped_vitals[vt].append({
                "id": vital.id,
                "value": vital.value,
                "unit": vital.unit,
                "timestamp": vital.created_at.strftime('%Y-%m-%d %H:%M:%S'),
                "is_abnormal": vital.is_abnormal,
                "is_critical": vital.is_critical()
            })
        
        return jsonify({
            "patient_id": patient_id,
            "vital_history": grouped_vitals
        }), 200