from flask import Blueprint, request, jsonify
from flask_login import login_required, current_user
from sqlalchemy import desc, and_, or_
from datetime import datetime

from app import db
from models.user import UserRole
from models.patient import Patient, PatientCondition, PatientMedication, PatientAllergy

# Create blueprint
patient_bp = Blueprint('patient', __name__)

@patient_bp.route('/', methods=['GET'])
@login_required
def get_patients():
    """Get a list of patients with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filtering options
    search = request.args.get('search')
    is_active = request.args.get('is_active')
    
    # Base query
    query = Patient.query
    
    # Apply filters
    if search:
        # Search in name, cpr_number, etc.
        query = query.filter(
            or_(
                Patient.first_name.ilike(f"%{search}%"),
                Patient.last_name.ilike(f"%{search}%"),
                Patient.cpr_number.ilike(f"%{search}%"),
                Patient.email.ilike(f"%{search}%"),
                Patient.phone_number.ilike(f"%{search}%")
            )
        )
    
    if is_active is not None:
        is_active = is_active.lower() == 'true'
        query = query.filter_by(is_active=is_active)
    
    # Default to alphabetical order by last name
    query = query.order_by(Patient.last_name, Patient.first_name)
    
    # Apply pagination
    paginated_patients = query.paginate(page=page, per_page=per_page)
    
    # Format response
    patients = []
    for patient in paginated_patients.items:
        patients.append({
            "id": patient.id,
            "cpr_number": patient.cpr_number,
            "first_name": patient.first_name,
            "last_name": patient.last_name,
            "full_name": patient.get_full_name(),
            "date_of_birth": patient.date_of_birth.strftime('%Y-%m-%d') if patient.date_of_birth else None,
            "age": patient.get_age(),
            "gender": patient.gender,
            "phone_number": patient.phone_number,
            "email": patient.email,
            "is_active": patient.is_active
        })
    
    return jsonify({
        "patients": patients,
        "pagination": {
            "page": paginated_patients.page,
            "per_page": paginated_patients.per_page,
            "total_pages": paginated_patients.pages,
            "total_items": paginated_patients.total
        }
    }), 200

@patient_bp.route('/<int:patient_id>', methods=['GET'])
@login_required
def get_patient(patient_id):
    """Get detailed information about a specific patient"""
    patient = Patient.query.get_or_404(patient_id)
    
    # Format patient data
    patient_data = {
        "id": patient.id,
        "cpr_number": patient.cpr_number,
        "first_name": patient.first_name,
        "last_name": patient.last_name,
        "full_name": patient.get_full_name(),
        "date_of_birth": patient.date_of_birth.strftime('%Y-%m-%d') if patient.date_of_birth else None,
        "age": patient.get_age(),
        "gender": patient.gender,
        "phone_number": patient.phone_number,
        "email": patient.email,
        "address": patient.address,
        "emergency_contact_name": patient.emergency_contact_name,
        "emergency_contact_phone": patient.emergency_contact_phone,
        "blood_type": patient.blood_type,
        "is_active": patient.is_active,
        "created_at": patient.created_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    # Get conditions
    conditions = []
    for condition in patient.conditions:
        conditions.append({
            "id": condition.id,
            "name": condition.name,
            "description": condition.description,
            "icd_code": condition.icd_code
        })
    
    # Get allergies
    allergies = []
    for allergy in patient.allergies:
        allergies.append({
            "id": allergy.id,
            "name": allergy.name,
            "reaction": allergy.reaction,
            "severity": allergy.severity
        })
    
    # Get medications
    medications = []
    for medication in patient.medications:
        medications.append({
            "id": medication.id,
            "name": medication.name,
            "dosage": medication.dosage,
            "frequency": medication.frequency,
            "start_date": medication.start_date.strftime('%Y-%m-%d') if medication.start_date else None,
            "end_date": medication.end_date.strftime('%Y-%m-%d') if medication.end_date else None,
            "prescriber": medication.prescriber,
            "notes": medication.notes,
            "is_active": medication.is_active
        })
    
    # Add to patient data
    patient_data["conditions"] = conditions
    patient_data["allergies"] = allergies
    patient_data["medications"] = medications
    
    return jsonify(patient_data), 200

@patient_bp.route('/', methods=['POST'])
@login_required
def create_patient():
    """Create a new patient"""
    # Only admin or supervisor can create patients
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json
    
    # Validate required fields
    required_fields = ['cpr_number', 'first_name', 'last_name', 'date_of_birth', 'gender']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Check if CPR number is already taken
    existing_patient = Patient.query.filter_by(cpr_number=data['cpr_number']).first()
    if existing_patient:
        return jsonify({"error": f"Patient with CPR number {data['cpr_number']} already exists"}), 400
    
    # Parse date of birth
    try:
        date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format for date_of_birth. Use YYYY-MM-DD"}), 400
    
    # Create patient
    patient = Patient(
        cpr_number=data['cpr_number'],
        first_name=data['first_name'],
        last_name=data['last_name'],
        date_of_birth=date_of_birth,
        gender=data['gender'],
        phone_number=data.get('phone_number'),
        email=data.get('email'),
        address=data.get('address'),
        emergency_contact_name=data.get('emergency_contact_name'),
        emergency_contact_phone=data.get('emergency_contact_phone'),
        blood_type=data.get('blood_type'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(patient)
    db.session.commit()
    
    return jsonify({
        "message": "Patient created successfully",
        "patient": {
            "id": patient.id,
            "cpr_number": patient.cpr_number,
            "full_name": patient.get_full_name()
        }
    }), 201

@patient_bp.route('/<int:patient_id>', methods=['PUT'])
@login_required
def update_patient(patient_id):
    """Update a patient"""
    # Only admin or supervisor can update patients
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        return jsonify({"error": "Permission denied"}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    # Update fields if provided
    if 'first_name' in data:
        patient.first_name = data['first_name']
    
    if 'last_name' in data:
        patient.last_name = data['last_name']
    
    if 'date_of_birth' in data:
        try:
            patient.date_of_birth = datetime.strptime(data['date_of_birth'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format for date_of_birth. Use YYYY-MM-DD"}), 400
    
    if 'gender' in data:
        patient.gender = data['gender']
    
    if 'phone_number' in data:
        patient.phone_number = data['phone_number']
    
    if 'email' in data:
        patient.email = data['email']
    
    if 'address' in data:
        patient.address = data['address']
    
    if 'emergency_contact_name' in data:
        patient.emergency_contact_name = data['emergency_contact_name']
    
    if 'emergency_contact_phone' in data:
        patient.emergency_contact_phone = data['emergency_contact_phone']
    
    if 'blood_type' in data:
        patient.blood_type = data['blood_type']
    
    if 'is_active' in data:
        patient.is_active = data['is_active']
    
    db.session.commit()
    
    return jsonify({
        "message": "Patient updated successfully",
        "patient": {
            "id": patient.id,
            "cpr_number": patient.cpr_number,
            "full_name": patient.get_full_name()
        }
    }), 200

@patient_bp.route('/<int:patient_id>/conditions', methods=['POST'])
@login_required
def add_condition(patient_id):
    """Add a medical condition to a patient"""
    # Only admin or supervisor can add conditions
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        return jsonify({"error": "Permission denied"}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    if 'name' not in data:
        return jsonify({"error": "Missing required field: name"}), 400
    
    # Check if condition exists
    condition = PatientCondition.query.filter_by(name=data['name']).first()
    
    if not condition:
        # Create new condition
        condition = PatientCondition(
            name=data['name'],
            description=data.get('description'),
            icd_code=data.get('icd_code')
        )
        db.session.add(condition)
        db.session.commit()
    
    # Add to patient if not already added
    if condition not in patient.conditions:
        patient.conditions.append(condition)
        db.session.commit()
    
    return jsonify({
        "message": "Condition added to patient",
        "condition": {
            "id": condition.id,
            "name": condition.name
        }
    }), 201

@patient_bp.route('/<int:patient_id>/medications', methods=['POST'])
@login_required
def add_medication(patient_id):
    """Add a medication to a patient"""
    # Only admin or supervisor can add medications
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        return jsonify({"error": "Permission denied"}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    # Validate required fields
    required_fields = ['name', 'dosage', 'frequency', 'start_date']
    for field in required_fields:
        if field not in data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Parse dates
    try:
        start_date = datetime.strptime(data['start_date'], '%Y-%m-%d').date()
    except ValueError:
        return jsonify({"error": "Invalid date format for start_date. Use YYYY-MM-DD"}), 400
    
    end_date = None
    if 'end_date' in data and data['end_date']:
        try:
            end_date = datetime.strptime(data['end_date'], '%Y-%m-%d').date()
        except ValueError:
            return jsonify({"error": "Invalid date format for end_date. Use YYYY-MM-DD"}), 400
    
    # Create medication
    medication = PatientMedication(
        patient_id=patient_id,
        name=data['name'],
        dosage=data['dosage'],
        frequency=data['frequency'],
        start_date=start_date,
        end_date=end_date,
        prescriber=data.get('prescriber'),
        notes=data.get('notes'),
        is_active=data.get('is_active', True)
    )
    
    db.session.add(medication)
    db.session.commit()
    
    return jsonify({
        "message": "Medication added to patient",
        "medication": {
            "id": medication.id,
            "name": medication.name
        }
    }), 201

@patient_bp.route('/<int:patient_id>/allergies', methods=['POST'])
@login_required
def add_allergy(patient_id):
    """Add an allergy to a patient"""
    # Only admin or supervisor can add allergies
    if current_user.role not in [UserRole.ADMIN, UserRole.SUPERVISOR]:
        return jsonify({"error": "Permission denied"}), 403
    
    patient = Patient.query.get_or_404(patient_id)
    data = request.json
    
    if 'name' not in data:
        return jsonify({"error": "Missing required field: name"}), 400
    
    # Check if allergy exists
    allergy = PatientAllergy.query.filter_by(name=data['name']).first()
    
    if not allergy:
        # Create new allergy
        allergy = PatientAllergy(
            name=data['name'],
            reaction=data.get('reaction'),
            severity=data.get('severity')
        )
        db.session.add(allergy)
        db.session.commit()
    
    # Add to patient if not already added
    if allergy not in patient.allergies:
        patient.allergies.append(allergy)
        db.session.commit()
    
    return jsonify({
        "message": "Allergy added to patient",
        "allergy": {
            "id": allergy.id,
            "name": allergy.name
        }
    }), 201