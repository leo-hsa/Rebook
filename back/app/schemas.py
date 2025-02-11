from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date

class AuthorBase(BaseModel):
    name: str

class Author(AuthorBase):
    id: int
    books: List["Book"] = []  # Используем строковую аннотацию для избежания циклического импорта
    class Config:
        orm_mode = True
        
class AuthorCreate(AuthorBase):
    pass

class GenreBase(BaseModel):
    name: str

class Genre(GenreBase):
    id: int
    books: List["Book"] = []
    class Config:
        orm_mode = True
        
class GenreCreate(GenreBase):
    pass

class BookBase(BaseModel):
    title: str
    description: str
    genre_id: Optional[int]  # В БД нельзя null, нужно либо nullable=True, либо убрать Optional
    author_id: int
    release_date: Optional[date]  # Добавляем, чтобы соответствовало SQLAlchemy

class Book(BookBase):
    id: int
    author: Optional[Author]  # Избегаем циклического импорта
    genre: Optional[Genre]
    class Config:
        orm_mode = True

class BookCreate(BookBase):
    pass

class UserCreate(BaseModel):
    nickname: str
    email: EmailStr
    password: str  

class UserLogin(BaseModel):
    email: EmailStr
    password: str
    
class UserOut(BaseModel):
    id: int
    nickname: str
    email: EmailStr
    
    class Config:
        orm_mode = True
