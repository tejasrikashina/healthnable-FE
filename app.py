import os
import logging
from flask import Flask, jsonify, Blueprint
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.orm import DeclarativeBase
from werkzeug.middleware.proxy_fix import ProxyFix
from sqlalchemy import text
from flask_login import LoginManager
import secrets

# Setup logging
logging.basicConfig(level=logging.DEBUG, 
                    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

# Create Base class for SQLAlchemy models
class Base(DeclarativeBase):
    pass

# Initialize SQLAlchemy
db = SQLAlchemy(model_class=Base)
login_manager = LoginManager()

def create_app():
    """Create and configure the Flask application"""
    # Create Flask app
    app = Flask(__name__)
    app.secret_key = os.environ.get("SESSION_SECRET", secrets.token_hex(32))
    app.wsgi_app = ProxyFix(app.wsgi_app, x_proto=1, x_host=1)  # Needed for url_for to generate with https

    # Configure the database
    app.config["SQLALCHEMY_DATABASE_URI"] = os.environ.get("DATABASE_URL")
    app.config["SQLALCHEMY_ENGINE_OPTIONS"] = {
        "pool_size": 5,
        "max_overflow": 10,
        "pool_timeout": 30,
        "pool_recycle": 300,  # reconnect every 5 minutes
        "pool_pre_ping": True,  # verify connection before use
    }

    # Initialize the app with Flask-SQLAlchemy
    db.init_app(app)
    
    # Initialize login manager
    login_manager.init_app(app)
    login_manager.login_view = "login"

    # Configure file upload settings
    app.config["UPLOAD_FOLDER"] = "uploads"
    app.config["MAX_CONTENT_LENGTH"] = 10 * 1024 * 1024  # 10MB
    app.config.update(
        UPLOAD_DIR=os.path.join(app.root_path, 'uploads'),
        MAX_UPLOAD_SIZE=10 * 1024 * 1024,  # 10MB
        ALLOWED_EXTENSIONS=["jpg", "jpeg", "png", "pdf", "doc", "docx"],
        ENABLE_EMAIL_NOTIFICATIONS=False,
        ENABLE_PUSH_NOTIFICATIONS=True,
        LOG_LEVEL="INFO",
        MAX_SYNC_BATCH_SIZE=100,
        DEFAULT_TIMEZONE="Asia/Bahrain"
    )

    # Create upload directory if it doesn't exist
    upload_dir = app.config['UPLOAD_DIR']
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
        logger.info(f"Created upload directory at {upload_dir}")

    # Root endpoint
    @app.route('/')
    def root():
        """Root endpoint to verify API is running"""
        return jsonify({
            "message": "Caregiver Mobile App API is running",
            "version": "1.0.0", 
            "api_docs": "/api/docs"
        })

    # Health check endpoint
    @app.route('/health')
    def health_check():
        """Health check endpoint"""
        # Check database connection
        try:
            db.session.execute(text('SELECT 1'))
            db_status = "connected"
        except Exception as e:
            logger.error(f"Database health check failed: {str(e)}")
            db_status = "disconnected"
        
        return jsonify({
            "status": "healthy" if db_status == "connected" else "unhealthy",
            "database": db_status,
            "api": "available"
        })

    # Error handlers
    @app.errorhandler(404)
    def not_found(error):
        return jsonify({"error": "Not found", "status_code": 404}), 404

    @app.errorhandler(500)
    def server_error(error):
        logger.error(f"Server error: {str(error)}")
        return jsonify({"error": "Internal server error", "status_code": 500}), 500

    @app.errorhandler(401)
    def unauthorized(error):
        return jsonify({"error": "Unauthorized", "status_code": 401}), 401

    @app.errorhandler(403)
    def forbidden(error):
        return jsonify({"error": "Forbidden", "status_code": 403}), 403
        
    with app.app_context():
        # Import models for table creation
        from models.user import User
        from models.patient import Patient, PatientCondition, PatientAllergy, PatientMedication
        from models.visit import Visit, VisitStatus, VisitType
        from models.vital import VitalRecord, VitalType
        from models.note import Note, NoteType
        from models.document import Document, DocumentType
        from models.notification import Notification, NotificationType
        from models.chat import ChatThread, ChatThreadParticipant, ChatMessage
        from models.settings import UserSettings, CaregiverPreference
        from models.sync import SyncItem, SyncType, SyncStatus
        
        # Create database tables
        db.create_all()
        
        # User loader for login manager
        @login_manager.user_loader
        def load_user(user_id):
            return User.query.get(int(user_id))
            
        # Register API routes
        from routes import init_routes
        init_routes(app)
        
    return app
    
# Create the application instance
app = create_app()