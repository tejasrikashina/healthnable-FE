from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session, joinedload
from sqlalchemy import func, desc

from database import get_db
from models.user import User
from models.chat import ChatThread, ChatMessage, ChatThreadParticipant
from schemas.chat import (
    ChatThreadCreate, ChatThreadResponse, 
    ChatMessageCreate, ChatMessageResponse,
    ChatMessageUpdate, MarkMessagesReadRequest
)
from utils.auth import get_current_active_user
from utils.notifications import send_chat_notification

router = APIRouter()

@router.post("/threads", response_model=ChatThreadResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_thread(
    thread_data: ChatThreadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify all participants exist
    if not thread_data.participants or current_user.id not in thread_data.participants:
        # Add current user if not in participants
        if not thread_data.participants:
            thread_data.participants = [current_user.id]
        else:
            thread_data.participants.append(current_user.id)
    
    for participant_id in thread_data.participants:
        user = db.query(User).filter(User.id == participant_id).first()
        if not user:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=f"User with id {participant_id} not found"
            )
    
    # Create the thread
    thread = ChatThread(
        title=thread_data.title,
        created_by=current_user.id if thread_data.created_by is None else thread_data.created_by,
        is_active=thread_data.is_active
    )
    db.add(thread)
    db.flush()  # Get ID but don't commit yet
    
    # Add participants
    for participant_id in thread_data.participants:
        participant = ChatThreadParticipant(
            thread_id=thread.id,
            user_id=participant_id
        )
        db.add(participant)
    
    # Add initial message if provided
    if thread_data.initial_message:
        message = ChatMessage(
            thread_id=thread.id,
            sender_id=current_user.id,
            content=thread_data.initial_message
        )
        db.add(message)
    
    db.commit()
    db.refresh(thread)
    
    # Get the latest message and unread count for response
    latest_message = db.query(ChatMessage).filter(
        ChatMessage.thread_id == thread.id
    ).order_by(ChatMessage.created_at.desc()).first()
    
    unread_count = db.query(func.count(ChatMessage.id)).filter(
        ChatMessage.thread_id == thread.id,
        ChatMessage.is_read == False,
        ChatMessage.sender_id != current_user.id
    ).scalar()
    
    # Format response
    response = ChatThreadResponse(
        id=thread.id,
        title=thread.title,
        created_by=thread.created_by,
        is_active=thread.is_active,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        participants=thread.participants,
        latest_message=latest_message,
        unread_count=unread_count
    )
    
    return response

@router.get("/threads", response_model=List[ChatThreadResponse])
async def get_chat_threads(
    skip: int = 0,
    limit: int = 100,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Get all threads where the current user is a participant
    participant_threads = db.query(ChatThreadParticipant.thread_id).filter(
        ChatThreadParticipant.user_id == current_user.id
    ).subquery()
    
    threads = db.query(ChatThread).filter(
        ChatThread.id.in_(participant_threads)
    ).options(
        joinedload(ChatThread.participants)
    ).order_by(ChatThread.updated_at.desc()).offset(skip).limit(limit).all()
    
    # Get latest message and unread count for each thread
    result = []
    for thread in threads:
        latest_message = db.query(ChatMessage).filter(
            ChatMessage.thread_id == thread.id
        ).order_by(ChatMessage.created_at.desc()).first()
        
        unread_count = db.query(func.count(ChatMessage.id)).filter(
            ChatMessage.thread_id == thread.id,
            ChatMessage.is_read == False,
            ChatMessage.sender_id != current_user.id
        ).scalar()
        
        result.append(ChatThreadResponse(
            id=thread.id,
            title=thread.title,
            created_by=thread.created_by,
            is_active=thread.is_active,
            created_at=thread.created_at,
            updated_at=thread.updated_at,
            participants=thread.participants,
            latest_message=latest_message,
            unread_count=unread_count
        ))
    
    return result

@router.get("/threads/{thread_id}", response_model=ChatThreadResponse)
async def get_chat_thread(
    thread_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Check if thread exists and user is a participant
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat thread not found"
        )
    
    # Check if user is a participant
    participant = db.query(ChatThreadParticipant).filter(
        ChatThreadParticipant.thread_id == thread_id,
        ChatThreadParticipant.user_id == current_user.id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this chat thread"
        )
    
    # Get latest message and unread count
    latest_message = db.query(ChatMessage).filter(
        ChatMessage.thread_id == thread_id
    ).order_by(ChatMessage.created_at.desc()).first()
    
    unread_count = db.query(func.count(ChatMessage.id)).filter(
        ChatMessage.thread_id == thread_id,
        ChatMessage.is_read == False,
        ChatMessage.sender_id != current_user.id
    ).scalar()
    
    return ChatThreadResponse(
        id=thread.id,
        title=thread.title,
        created_by=thread.created_by,
        is_active=thread.is_active,
        created_at=thread.created_at,
        updated_at=thread.updated_at,
        participants=thread.participants,
        latest_message=latest_message,
        unread_count=unread_count
    )

@router.post("/messages", response_model=ChatMessageResponse, status_code=status.HTTP_201_CREATED)
async def create_chat_message(
    message_data: ChatMessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify thread exists and user is a participant
    thread = db.query(ChatThread).filter(ChatThread.id == message_data.thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat thread not found"
        )
    
    # Check if user is a participant
    participant = db.query(ChatThreadParticipant).filter(
        ChatThreadParticipant.thread_id == message_data.thread_id,
        ChatThreadParticipant.user_id == current_user.id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this chat thread"
        )
    
    # Create the message
    message = ChatMessage(
        thread_id=message_data.thread_id,
        sender_id=current_user.id if message_data.sender_id is None else message_data.sender_id,
        content=message_data.content,
        is_read=message_data.is_read,
        is_synced=message_data.is_synced
    )
    
    db.add(message)
    
    # Update thread's updated_at timestamp
    thread.updated_at = datetime.now()
    
    db.commit()
    db.refresh(message)
    
    # Send notifications to other participants
    other_participants = db.query(ChatThreadParticipant).filter(
        ChatThreadParticipant.thread_id == message_data.thread_id,
        ChatThreadParticipant.user_id != current_user.id
    ).all()
    
    for participant in other_participants:
        if not participant.is_muted:
            await send_chat_notification(db, message, participant.user_id)
    
    return message

@router.get("/messages/{thread_id}", response_model=List[ChatMessageResponse])
async def get_thread_messages(
    thread_id: int,
    skip: int = 0,
    limit: int = 50,
    before_id: Optional[int] = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify thread exists and user is a participant
    thread = db.query(ChatThread).filter(ChatThread.id == thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat thread not found"
        )
    
    # Check if user is a participant
    participant = db.query(ChatThreadParticipant).filter(
        ChatThreadParticipant.thread_id == thread_id,
        ChatThreadParticipant.user_id == current_user.id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this chat thread"
        )
    
    # Query messages
    query = db.query(ChatMessage).filter(ChatMessage.thread_id == thread_id)
    
    # If before_id provided, get messages before that ID (for pagination)
    if before_id:
        before_message = db.query(ChatMessage).filter(ChatMessage.id == before_id).first()
        if before_message:
            query = query.filter(ChatMessage.created_at < before_message.created_at)
    
    # Get messages in descending order (newest first)
    messages = query.order_by(ChatMessage.created_at.desc()).offset(skip).limit(limit).all()
    
    # Update last read message for current user
    if messages and len(messages) > 0:
        newest_msg_id = max(msg.id for msg in messages)
        participant.last_read_message_id = max(participant.last_read_message_id or 0, newest_msg_id)
        db.commit()
    
    return messages

@router.post("/messages/read", status_code=status.HTTP_200_OK)
async def mark_messages_read(
    read_request: MarkMessagesReadRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify thread exists and user is a participant
    thread = db.query(ChatThread).filter(ChatThread.id == read_request.thread_id).first()
    if not thread:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat thread not found"
        )
    
    # Check if user is a participant
    participant = db.query(ChatThreadParticipant).filter(
        ChatThreadParticipant.thread_id == read_request.thread_id,
        ChatThreadParticipant.user_id == current_user.id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not a participant in this chat thread"
        )
    
    # Mark specific messages as read
    if read_request.message_ids:
        messages = db.query(ChatMessage).filter(
            ChatMessage.id.in_(read_request.message_ids),
            ChatMessage.thread_id == read_request.thread_id,
            ChatMessage.is_read == False,
            ChatMessage.sender_id != current_user.id
        ).all()
        
        for message in messages:
            message.is_read = True
            message.read_at = datetime.now()
    
    # Mark all messages up to a certain ID as read
    elif read_request.read_until_message_id:
        messages = db.query(ChatMessage).filter(
            ChatMessage.thread_id == read_request.thread_id,
            ChatMessage.id <= read_request.read_until_message_id,
            ChatMessage.is_read == False,
            ChatMessage.sender_id != current_user.id
        ).all()
        
        for message in messages:
            message.is_read = True
            message.read_at = datetime.now()
        
        # Update last read message for current user
        participant.last_read_message_id = read_request.read_until_message_id
    
    db.commit()
    
    return {"message": "Messages marked as read"}

@router.put("/threads/{thread_id}/mute", status_code=status.HTTP_200_OK)
async def toggle_thread_mute(
    thread_id: int,
    mute: bool = True,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    # Verify thread exists and user is a participant
    participant = db.query(ChatThreadParticipant).filter(
        ChatThreadParticipant.thread_id == thread_id,
        ChatThreadParticipant.user_id == current_user.id
    ).first()
    
    if not participant:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Thread not found or you are not a participant"
        )
    
    # Update mute status
    participant.is_muted = mute
    db.commit()
    
    return {"message": f"Thread {'muted' if mute else 'unmuted'} successfully"}

@router.get("/supervisors", response_model=List[dict])
async def get_available_supervisors(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
):
    """Get all supervisors for starting new chats"""
    supervisors = db.query(
        User.id,
        User.username,
        User.first_name,
        User.last_name
    ).filter(
        User.role == "supervisor",
        User.is_active == True
    ).all()
    
    # Convert to list of dicts
    result = []
    for supervisor in supervisors:
        result.append({
            "id": supervisor.id,
            "username": supervisor.username,
            "name": f"{supervisor.first_name} {supervisor.last_name}"
        })
    
    return result
