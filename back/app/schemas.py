from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import date


class AuthorBase(BaseModel):
    name: str
    info: Optional[str] = None

class Author(AuthorBase):
    id: int
    books: List["Book"] = []  
    class Config:
        from_attributes = True
        
class AuthorCreate(AuthorBase):
    pass


class GenreBase(BaseModel):
    name: str
    img: Optional[str] = None  

class Genre(GenreBase):
    id: int
    books: List["Book"] = []
    class Config:
        from_attributes = True
        
class GenreCreate(GenreBase):
    pass


class BookBase(BaseModel):
    title: str
    description: str
    genre_id: Optional[int]  
    author_id: int
    release_date: Optional[date]  
    img: Optional[str] = None  


class BookShopMainResponse(BaseModel):
    title: str
    img: Optional[str] = None
    author_name: str
    class Config:
        from_attributes = True

class BookResponse(BaseModel):
    id: str  
    title: str
    description: str
    genre_name: str
    author_name: str
    release_date: Optional[str] = None
    favorites_count: int
    is_favorite: bool
    img: Optional[str] = None  
    price: float
    quantity: Optional[int] = None

    class Config:
        from_attributes = True

    @classmethod
    def from_orm(cls, book):
        return cls(
            id=book.id,
            title=book.title,
            description=book.description,
            genre_name=book.genre.name if book.genre else None,
            author_name=book.author.name,
            release_date=book.release_date.strftime("%Y-%m-%d") if book.release_date else None,
            favorites_count=book.favorites_count,
            is_favorite=bool(book.favorites),  
            img=book.img
        )
        
class Book(BookBase):
    id: str
    class Config:
        from_attributes = True

class BookCreate(BaseModel):
    id: str
    title: str
    description: str
    genre_id: Optional[int] = None
    author_id: int
    release_date: Optional[date] = None
    img: Optional[str] = None 
    favorites_count: Optional[int] = 0
    


class UserCreate(BaseModel):
    nickname: str
    email: EmailStr
    password: str  

class UserLogin(BaseModel):
    nickname: str
    password: str
    
class UserOut(BaseModel):
    id: int
    nickname: str
    email: EmailStr
    role_id: int
    
    class Config:
        from_attributes = True

class RoleOut(BaseModel):
    id: int
    name: str
    
    class Config:
        from_attributes = True

class Token(BaseModel):
    access_token: str
    token_type: str

class GenreOut(BaseModel):
    id: int
    name: str
    img: Optional[str] = None  
    class Config:
        from_attributes = True


class BasketCreate(BaseModel):
    book_id: str
    quantity: Optional[int] = 1

    class Config:
        from_attributes = True
