from sqlalchemy import Column, Integer, String, ForeignKey, Text, Date
from sqlalchemy.orm import relationship
from core.database import Base

class Book(Base):
    __tablename__ = 'books'
    
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    genre_id = Column(Integer, ForeignKey('genres.id'), nullable=True)  # Делаем nullable=True, чтобы соответствовало Pydantic
    author_id = Column(Integer, ForeignKey('authors.id'), nullable=False)
    release_date = Column(Date, nullable=True)
    
    author = relationship("Author", back_populates="books")
    genre = relationship("Genre", back_populates="books")

class Genre(Base):
    __tablename__ = 'genres'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    books = relationship("Book", back_populates="genre")

class Author(Base):
    __tablename__ = 'authors'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    info = Column(Text, nullable=True)
    books = relationship("Book", back_populates="author")

class User(Base):
    __tablename__ = 'users'
    
    id = Column(Integer, primary_key=True, index=True)
    nickname = Column(String(255), nullable=False, unique=True)
    email = Column(String(255), unique=True, index=True, nullable=False)
    hashed_password = Column(String(255), nullable=False)
