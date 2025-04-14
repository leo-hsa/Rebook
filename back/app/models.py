from sqlalchemy import Column, Integer, String, ForeignKey, Text, Date, Numeric, Enum
from sqlalchemy.orm import relationship
from core.database import Base
import enum

class BasketStatus(enum.Enum):
    active = "active"
    removed = "removed"
    purchased = "purchased"


class Book(Base):
    __tablename__ = 'books'
    
    id = Column(String(20), primary_key=True)  
    title = Column(String(200), nullable=False)
    description = Column(Text, nullable=False)
    genre_id = Column(Integer, ForeignKey('genres.id'), nullable=True)  
    author_id = Column(Integer, ForeignKey('authors.id'), nullable=False)
    release_date = Column(Date, nullable=True)
    favorites_count = Column(Integer, default = 0, nullable=False)
    img = Column(String(255), nullable=True)
    price = Column(Numeric(10, 2), nullable=False)
    
    author = relationship("Author", back_populates="books")
    genre = relationship("Genre", back_populates="books")
    favorites = relationship("Favorite", back_populates="book", cascade="all, delete-orphan")
    baskets = relationship("Basket", back_populates="book", cascade="all, delete-orphan")

class Genre(Base):
    __tablename__ = 'genres'
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(255), nullable=False, unique=True)
    img = Column(String(255), nullable=True)

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
    role_id = Column(Integer, ForeignKey('roles.id'), nullable=False, default=2)
    
    role = relationship("Role", back_populates='rolls')
    favorites = relationship("Favorite", back_populates="user", cascade="all, delete-orphan")
    baskets = relationship("Basket", back_populates="user", cascade="all, delete-orphan")


class Role(Base):
    __tablename__ = 'roles'
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(50), unique=True, nullable=False)
    
    rolls = relationship("User", back_populates="role")

    
class Favorite(Base):
    __tablename__ = "favorites"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer,ForeignKey("users.id" , ondelete="CASCADE"), nullable=False)
    book_id = Column(String(20), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    
    book = relationship("Book", back_populates="favorites")
    user = relationship("User", back_populates="favorites")


class Basket(Base):
    __tablename__ = "baskets"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    book_id = Column(String(20), ForeignKey("books.id", ondelete="CASCADE"), nullable=False)
    quantity = Column(Integer, default=1, nullable=False)
    status = Column(Enum(BasketStatus), default=BasketStatus.active, nullable=False)

    book = relationship("Book", back_populates="baskets")
    user = relationship("User", back_populates="baskets")