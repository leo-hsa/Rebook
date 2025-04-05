from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from models import Book, Author, Genre
from schemas import BookCreate
from core.database import get_db

router = APIRouter(prefix="/admin", tags=["Admin"])

@router.post("/books/", response_model=dict)
def create_book(book: BookCreate, db: Session = Depends(get_db)):
    db_author = db.query(Author).filter(Author.id == book.author_id).first()
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")
    
    if book.genre_id:
        db_genre = db.query(Genre).filter(Genre.id == book.genre_id).first()

        if not db_genre:
            raise HTTPException(status_code=404, detail="Genre not found")
        
    if db.query(Book).filter(Book.id == book.id).first():
        raise HTTPException(status_code=400, detail="Book with this ID already exists")
    
    db_book = Book(
        id=book.id,
        title=book.title,
        description=book.description,
        genre_id=book.genre_id,
        author_id=book.author_id,
        release_date=book.release_date,
        favorites_count=0
    )

    db.add(db_book)
    db.commit()
    db.refresh(db_book)

    return {"message": "hello"}

    

