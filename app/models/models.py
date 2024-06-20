from sqlalchemy import Column, String, Integer, Text, ForeignKey, Boolean, DECIMAL, TIMESTAMP, func
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
from app.database.database import Base

from sqlalchemy import Column, String, Boolean, ForeignKey, DateTime
from sqlalchemy.orm import relationship
from datetime import datetime
import uuid
from app.database.database import Base

class User(Base):
    __tablename__ = 'users'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    nickname = Column(String, unique=True, index=True, nullable=False)
    password = Column(String, nullable=False)
    sessions = relationship("Session", back_populates="user")

class Session(Base):
    __tablename__ = 'sessions'

    id = Column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id = Column(String, ForeignKey('users.id'), nullable=False)
    token = Column(String, unique=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    user = relationship("User", back_populates="sessions")


class Destination(Base):
    __tablename__ = 'destinations'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, index=True)

class Request(Base):
    __tablename__ = "requests"
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"))
    title = Column(String, nullable=False)
    destination_id = Column(Integer, ForeignKey("destinations.id"))
    description = Column(Text, nullable=False)
    goals = Column(Text)
    social_meaning = Column(Text, nullable=False)
    target_audience = Column(Text, nullable=False)
    tasks = Column(Text, nullable=False)
    created_at = Column(TIMESTAMP, server_default=func.now())

    user = relationship("User")
    destination = relationship("Destination")

class Project(Base):
    __tablename__ = "projects"
    id = Column(UUID(as_uuid=True), primary_key=True, server_default=func.gen_random_uuid())
    request_id = Column(UUID(as_uuid=True), ForeignKey("requests.id", ondelete="CASCADE"))
    estimated_chance = Column(DECIMAL(5, 2), nullable=False)
    is_bookmarked = Column(Boolean, nullable=False, default=False)  # Убедитесь, что это поле существует
    created_at = Column(TIMESTAMP, server_default=func.now())

    request = relationship("Request")

