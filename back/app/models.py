from sqlalchemy import Column, Integer , String , DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.database import Base


class Book(Base):
    __tablename__='books'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String)
    author = Column(String)
    


class User(Base):
    __tablename__='users'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    email = Column(String, unique=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    