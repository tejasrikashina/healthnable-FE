import os
from flask import Blueprint, request, jsonify, current_app, send_file
from flask_login import login_required, current_user
from sqlalchemy import desc
from datetime import datetime
from werkzeug.utils import secure_filename
import uuid

from app import db
from models.user import UserRole
from models.document import Document, DocumentType
from models.notification import Notification, NotificationType

# Create blueprint
document_bp = Blueprint('document', __name__)

def allowed_file(filename):
    """Check if file extension is allowed"""
    return '.' in filename and \
           filename.rsplit('.', 1)[1].lower() in ['jpg', 'jpeg', 'png', 'pdf', 'doc', 'docx']

@document_bp.route('/', methods=['GET'])
@login_required
def get_documents():
    """Get a list of documents with filtering and pagination"""
    page = request.args.get('page', 1, type=int)
    per_page = request.args.get('per_page', 20, type=int)
    
    # Filtering options
    patient_id = request.args.get('patient_id', type=int)
    visit_id = request.args.get('visit_id', type=int)
    note_id = request.args.get('note_id', type=int)
    document_type = request.args.get('document_type')
    uploaded_by = request.args.get('uploaded_by', type=int)
    
    # Base query
    query = Document.query
    
    # Apply filters
    if patient_id:
        query = query.filter_by(patient_id=patient_id)
    
    if visit_id:
        query = query.filter_by(visit_id=visit_id)
    
    if note_id:
        query = query.filter_by(note_id=note_id)
    
    if document_type:
        try:
            doc_type = DocumentType[document_type.upper()]
            query = query.filter_by(document_type=doc_type)
        except KeyError:
            pass
    
    if uploaded_by:
        query = query.filter_by(uploaded_by=uploaded_by)
    elif current_user.role == UserRole.CAREGIVER:
        # Caregivers can only see documents they uploaded
        query = query.filter_by(uploaded_by=current_user.id)
    
    # Order by most recent first
    query = query.order_by(desc(Document.created_at))
    
    # Apply pagination
    paginated_docs = query.paginate(page=page, per_page=per_page)
    
    # Format response
    documents = []
    for doc in paginated_docs.items:
        uploader = doc.uploader
        
        documents.append({
            "id": doc.id,
            "filename": doc.filename,
            "file_type": doc.file_type,
            "file_size": doc.file_size,
            "document_type": doc.document_type.value,
            "title": doc.title,
            "description": doc.description,
            "uploaded_by": {
                "id": uploader.id if uploader else None,
                "name": uploader.get_full_name() if uploader else "Unknown"
            },
            "patient_id": doc.patient_id,
            "visit_id": doc.visit_id,
            "note_id": doc.note_id,
            "is_synced": doc.is_synced,
            "created_at": doc.created_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    
    return jsonify({
        "documents": documents,
        "pagination": {
            "page": paginated_docs.page,
            "per_page": paginated_docs.per_page,
            "total_pages": paginated_docs.pages,
            "total_items": paginated_docs.total
        }
    }), 200

@document_bp.route('/<int:document_id>', methods=['GET'])
@login_required
def get_document(document_id):
    """Get detailed information about a specific document"""
    document = Document.query.get_or_404(document_id)
    
    # Check permissions
    if current_user.role == UserRole.CAREGIVER and document.uploaded_by != current_user.id:
        # Check if document is associated with a visit assigned to this caregiver
        if document.visit and document.visit.caregiver_id != current_user.id:
            return jsonify({"error": "Permission denied"}), 403
    
    uploader = document.uploader
    
    response = {
        "id": document.id,
        "filename": document.filename,
        "file_path": document.file_path,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "document_type": document.document_type.value,
        "title": document.title,
        "description": document.description,
        "uploaded_by": {
            "id": uploader.id if uploader else None,
            "name": uploader.get_full_name() if uploader else "Unknown",
            "role": uploader.role.value if uploader else None
        },
        "patient_id": document.patient_id,
        "patient_name": document.patient.get_full_name() if document.patient else None,
        "visit_id": document.visit_id,
        "note_id": document.note_id,
        "is_synced": document.is_synced,
        "sync_timestamp": document.sync_timestamp.strftime('%Y-%m-%d %H:%M:%S') if document.sync_timestamp else None,
        "created_at": document.created_at.strftime('%Y-%m-%d %H:%M:%S'),
        "updated_at": document.updated_at.strftime('%Y-%m-%d %H:%M:%S')
    }
    
    return jsonify(response), 200

@document_bp.route('/download/<int:document_id>', methods=['GET'])
@login_required
def download_document(document_id):
    """Download a document file"""
    document = Document.query.get_or_404(document_id)
    
    # Check permissions
    if current_user.role == UserRole.CAREGIVER and document.uploaded_by != current_user.id:
        # Check if document is associated with a visit assigned to this caregiver
        if document.visit and document.visit.caregiver_id != current_user.id:
            return jsonify({"error": "Permission denied"}), 403
    
    # Check if file exists
    if not os.path.exists(document.file_path):
        return jsonify({"error": "File not found"}), 404
    
    return send_file(document.file_path, as_attachment=True, download_name=document.filename)

@document_bp.route('/', methods=['POST'])
@login_required
def upload_document():
    """Upload a new document"""
    # Check if file part exists
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
        
    file = request.files['file']
    
    # If user does not select file, browser may submit an empty part without filename
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if not file or not allowed_file(file.filename):
        return jsonify({"error": "File type not allowed"}), 400
    
    # Get metadata from form
    form_data = request.form
    
    # Validate required fields
    required_fields = ['document_type', 'title', 'patient_id']
    for field in required_fields:
        if field not in form_data:
            return jsonify({"error": f"Missing required field: {field}"}), 400
    
    # Validate document type
    try:
        doc_type = DocumentType[form_data['document_type'].upper()] if isinstance(form_data['document_type'], str) else form_data['document_type']
    except KeyError:
        return jsonify({"error": f"Invalid document type: {form_data['document_type']}. Valid types are: {', '.join([t.value for t in DocumentType])}"}), 400
    
    # Secure the filename
    original_filename = secure_filename(file.filename)
    file_extension = original_filename.rsplit('.', 1)[1].lower() if '.' in original_filename else ''
    unique_filename = f"{uuid.uuid4().hex}.{file_extension}"
    
    # Ensure upload directory exists
    upload_dir = os.path.join(current_app.root_path, 'uploads')
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    
    # Save the file
    file_path = os.path.join(upload_dir, unique_filename)
    file.save(file_path)
    
    # Create document record
    document = Document(
        filename=original_filename,
        file_path=file_path,
        file_type=file.content_type,
        file_size=os.path.getsize(file_path),
        document_type=doc_type,
        title=form_data['title'],
        description=form_data.get('description'),
        uploaded_by=current_user.id,
        patient_id=form_data['patient_id'],
        visit_id=form_data.get('visit_id'),
        note_id=form_data.get('note_id'),
        is_synced=False
    )
    
    db.session.add(document)
    
    # Notify relevant users (e.g., supervisors) about new document, if applicable
    if current_user.role == UserRole.CAREGIVER:
        # Find supervisors to notify
        from models.user import User
        supervisors = User.query.filter_by(role=UserRole.SUPERVISOR).all()
        
        for supervisor in supervisors:
            notification = Notification(
                user_id=supervisor.id,
                notification_type=NotificationType.DOCUMENT_UPLOADED,
                title=f"New Document: {document.title}",
                message=f"New {doc_type.value} document uploaded by {current_user.get_full_name()} for patient ID {document.patient_id}",
                priority="normal",
                reference_id=document.id,
                reference_type="document"
            )
            db.session.add(notification)
    
    db.session.commit()
    
    return jsonify({
        "message": "Document uploaded successfully",
        "document": {
            "id": document.id,
            "filename": document.filename,
            "document_type": document.document_type.value,
            "title": document.title
        }
    }), 201

@document_bp.route('/<int:document_id>', methods=['PUT'])
@login_required
def update_document(document_id):
    """Update document information (not the file itself)"""
    document = Document.query.get_or_404(document_id)
    
    # Check permissions
    if current_user.role == UserRole.CAREGIVER and document.uploaded_by != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    data = request.json
    
    # Update fields if provided
    if 'title' in data:
        document.title = data['title']
        
    if 'description' in data:
        document.description = data['description']
        
    if 'document_type' in data:
        try:
            doc_type = DocumentType[data['document_type'].upper()] if isinstance(data['document_type'], str) else data['document_type']
            document.document_type = doc_type
        except KeyError:
            return jsonify({"error": f"Invalid document type: {data['document_type']}. Valid types are: {', '.join([t.value for t in DocumentType])}"}), 400
    
    if 'patient_id' in data and current_user.role != UserRole.CAREGIVER:
        document.patient_id = data['patient_id']
        
    if 'visit_id' in data:
        document.visit_id = data['visit_id']
        
    if 'note_id' in data:
        document.note_id = data['note_id']
        
    if 'is_synced' in data:
        document.is_synced = data['is_synced']
        if document.is_synced and not document.sync_timestamp:
            document.sync_timestamp = datetime.now()
    
    db.session.commit()
    
    return jsonify({
        "message": "Document updated successfully",
        "document": {
            "id": document.id,
            "title": document.title,
            "document_type": document.document_type.value,
            "updated_at": document.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        }
    }), 200

@document_bp.route('/<int:document_id>', methods=['DELETE'])
@login_required
def delete_document(document_id):
    """Delete a document"""
    document = Document.query.get_or_404(document_id)
    
    # Only admin, supervisor or document uploader can delete
    if current_user.role == UserRole.CAREGIVER and document.uploaded_by != current_user.id:
        return jsonify({"error": "Permission denied"}), 403
    
    # Store file path before deleting from database
    file_path = document.file_path
    
    # Delete from database
    db.session.delete(document)
    db.session.commit()
    
    # Delete file from filesystem
    if os.path.exists(file_path):
        try:
            os.remove(file_path)
        except Exception as e:
            # Log the error but don't fail the request
            current_app.logger.error(f"Error deleting file: {e}")
    
    return jsonify({
        "message": "Document deleted successfully"
    }), 200