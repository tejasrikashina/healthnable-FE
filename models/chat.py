from datetime import datetime
from sqlalchemy import Column, Integer, String, Boolean, DateTime, Text, ForeignKey
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func

from app import db

class ChatThread(db.Model):
    __tablename__ = "chat_threads"
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(100), nullable=True)
    created_by = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    is_active = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    creator = relationship("User")
    messages = relationship("ChatMessage", back_populates="thread", order_by="ChatMessage.created_at")
    participants = relationship("ChatThreadParticipant", back_populates="thread")

class ChatThreadParticipant(db.Model):
    __tablename__ = "chat_thread_participants"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("chat_threads.id", ondelete="CASCADE"))
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"))
    is_muted = Column(Boolean, default=False)
    last_read_message_id = Column(Integer, ForeignKey("chat_messages.id", ondelete="SET NULL"), nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    thread = relationship("ChatThread", back_populates="participants")
    user = relationship("User")
    last_read_message = relationship("ChatMessage")

class ChatMessage(db.Model):
    __tablename__ = "chat_messages"
    
    id = Column(Integer, primary_key=True, index=True)
    thread_id = Column(Integer, ForeignKey("chat_threads.id", ondelete="CASCADE"))
    sender_id = Column(Integer, ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    content = Column(Text, nullable=False)
    is_read = Column(Boolean, default=False)
    read_at = Column(DateTime, nullable=True)
    is_synced = Column(Boolean, default=False)
    sync_timestamp = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    
    # Relationships
    thread = relationship("ChatThread", back_populates="messages")
    sender = relationship("User", foreign_keys=[sender_id], back_populates="sent_messages")