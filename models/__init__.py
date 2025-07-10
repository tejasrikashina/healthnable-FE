"""
Models module for the Caregiver Mobile App API.
Import all models here to ensure proper database table creation.
"""

from models.user import User, UserRole, CaregiverProfile
from models.settings import UserSettings, CaregiverPreference
from models.patient import Patient, PatientCondition, PatientMedication, PatientAllergy
from models.visit import Visit, VisitStatus, VisitType
from models.vital import VitalRecord, VitalType
from models.note import Note, NoteType
from models.document import Document, DocumentType
from models.chat import ChatThread, ChatMessage, ChatThreadParticipant
from models.notification import Notification, NotificationType