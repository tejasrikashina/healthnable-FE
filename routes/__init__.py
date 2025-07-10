"""
Routes for the caregiver mobile application API.
This module registers all blueprint routes with the application.
"""
from flask import Blueprint

# Create API blueprint
api_bp = Blueprint('api', __name__, url_prefix='/api')

# Define function to register the routes
def init_routes(app):
    """Initialize and register all routes with the application"""
    # Import route blueprints (do this here to avoid circular import issues)
    from routes.auth import auth_bp
    from routes.patient import patient_bp
    from routes.visit import visit_bp
    from routes.note import note_bp
    from routes.vital import vital_bp
    from routes.chat import chat_bp
    from routes.notification import notification_bp
    from routes.document import document_bp
    from routes.settings import settings_bp
    from routes.sync import sync_bp
    
    # Register API blueprint
    app.register_blueprint(api_bp)
    
    # Register individual route blueprints with API blueprint
    api_bp.register_blueprint(auth_bp, url_prefix='/auth')
    api_bp.register_blueprint(patient_bp, url_prefix='/patients')
    api_bp.register_blueprint(visit_bp, url_prefix='/visits')
    api_bp.register_blueprint(note_bp, url_prefix='/notes')
    api_bp.register_blueprint(vital_bp, url_prefix='/vitals')
    api_bp.register_blueprint(chat_bp, url_prefix='/chat')
    api_bp.register_blueprint(notification_bp, url_prefix='/notifications')
    api_bp.register_blueprint(document_bp, url_prefix='/documents')
    api_bp.register_blueprint(settings_bp, url_prefix='/settings')
    api_bp.register_blueprint(sync_bp, url_prefix='/sync')
    
    return app