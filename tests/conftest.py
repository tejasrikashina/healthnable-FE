import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from database import Base, get_db
from main import app
from models.user import User, UserRole
from utils.auth import get_password_hash

# Create test database
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(
    SQLALCHEMY_DATABASE_URL,
    connect_args={"check_same_thread": False},
    poolclass=StaticPool
)
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Override dependencies
@pytest.fixture
def db_session():
    """Create a clean database session for a test"""
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture
def client(db_session):
    """Get test client with database override"""
    def override_get_db():
        try:
            yield db_session
        finally:
            pass
    
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as test_client:
        yield test_client
    
    app.dependency_overrides.clear()

@pytest.fixture
def test_admin(db_session):
    """Create a test admin user"""
    admin = User(
        username="admin",
        email="admin@example.com",
        hashed_password=get_password_hash("Admin123!"),
        first_name="Admin",
        last_name="User",
        role=UserRole.ADMIN,
        is_active=True
    )
    db_session.add(admin)
    db_session.commit()
    db_session.refresh(admin)
    return admin

@pytest.fixture
def test_supervisor(db_session):
    """Create a test supervisor user"""
    supervisor = User(
        username="supervisor",
        email="supervisor@example.com",
        hashed_password=get_password_hash("Supervisor123!"),
        first_name="Supervisor",
        last_name="User",
        role=UserRole.SUPERVISOR,
        is_active=True
    )
    db_session.add(supervisor)
    db_session.commit()
    db_session.refresh(supervisor)
    return supervisor

@pytest.fixture
def test_caregiver(db_session):
    """Create a test caregiver user"""
    caregiver = User(
        username="caregiver",
        email="caregiver@example.com",
        hashed_password=get_password_hash("Caregiver123!"),
        first_name="Caregiver",
        last_name="User",
        role=UserRole.CAREGIVER,
        is_active=True
    )
    db_session.add(caregiver)
    db_session.commit()
    db_session.refresh(caregiver)
    return caregiver

@pytest.fixture
def admin_token(client, test_admin):
    """Get admin authentication token"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": "admin",
            "password": "Admin123!"
        }
    )
    return response.json()["access_token"]

@pytest.fixture
def supervisor_token(client, test_supervisor):
    """Get supervisor authentication token"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": "supervisor",
            "password": "Supervisor123!"
        }
    )
    return response.json()["access_token"]

@pytest.fixture
def caregiver_token(client, test_caregiver):
    """Get caregiver authentication token"""
    response = client.post(
        "/api/auth/token",
        data={
            "username": "caregiver",
            "password": "Caregiver123!"
        }
    )
    return response.json()["access_token"]
