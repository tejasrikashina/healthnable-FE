# Export all pydantic models for easy imports
from schemas.user import (
    UserCreate, UserUpdate, UserResponse, 
    CaregiverProfileCreate, CaregiverProfileUpdate, CaregiverProfileResponse
)
from schemas.patient import (
    PatientCreate, PatientUpdate, PatientResponse,
    ConditionCreate, ConditionResponse,
    AllergyCreate, AllergyResponse,
    MedicationCreate, MedicationUpdate, MedicationResponse
)
from schemas.visit import (
    VisitCreate, VisitUpdate, VisitResponse,
    VisitTaskCreate, VisitTaskUpdate, VisitTaskResponse,
    MarkArrivalRequest, CompleteVisitRequest
)
from schemas.note import (
    NoteCreate, NoteUpdate, NoteResponse,
    EscalateNoteRequest
)
from schemas.vital import (
    VitalRecordCreate, VitalRecordUpdate, VitalRecordResponse,
    DeviceSyncCreate, DeviceSyncResponse
)
from schemas.chat import (
    ChatThreadCreate, ChatThreadResponse,
    ChatMessageCreate, ChatMessageResponse
)
from schemas.notification import (
    NotificationCreate, NotificationResponse, MarkNotificationReadRequest
)
from schemas.document import (
    DocumentCreate, DocumentResponse
)
from schemas.settings import (
    UserSettingsUpdate, UserSettingsResponse,
    CaregiverPreferenceCreate, CaregiverPreferenceResponse
)
from schemas.sync import (
    SyncItemCreate, SyncItemResponse, SyncBatchRequest, SyncBatchResponse
)
from schemas.auth import (
    Token, TokenData, LoginRequest, PasswordChangeRequest
)
