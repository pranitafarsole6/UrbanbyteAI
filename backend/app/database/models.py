from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
import datetime

Base = declarative_base()

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255))
    points = Column(Integer, default=0)
    eco_score = Column(Float, default=100.0)
    created_at = Column(DateTime, default=datetime.datetime.utcnow)
    google_drive_token = Column(String(2048), nullable=True) # Store JSON token
    google_drive_connected = Column(Boolean, default=False)

    scans = relationship("Scan", back_populates="owner")
    milestones = relationship("Milestone", back_populates="user")

class Scan(Base):
    __tablename__ = "scans"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    total_size = Column(Float)  # in bytes
    files_count = Column(Integer)
    potential_savings = Column(Float) # in bytes
    co2_saved = Column(Float)
    timestamp = Column(DateTime, default=datetime.datetime.utcnow)

    owner = relationship("User", back_populates="scans")
    files = relationship("FileItem", back_populates="scan")

class FileItem(Base):
    __tablename__ = "files"

    id = Column(Integer, primary_key=True, index=True)
    scan_id = Column(Integer, ForeignKey("scans.id"))
    path = Column(String(1024))
    size = Column(Float)
    category = Column(String(50))
    file_hash = Column(String(64), index=True) # Change name to avoid keyword conflicts
    is_duplicate = Column(Boolean, default=False)
    is_junk = Column(Boolean, default=False)
    is_low_quality = Column(Boolean, default=False)
    is_trashed = Column(Boolean, default=False)
    trashed_at = Column(DateTime)

    scan = relationship("Scan", back_populates="files")

class Milestone(Base):
    __tablename__ = "milestones"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"))
    title = Column(String(255))
    description = Column(String(512))
    achieved_at = Column(DateTime, default=datetime.datetime.utcnow)
    points_awarded = Column(Integer)

    user = relationship("User", back_populates="milestones")
