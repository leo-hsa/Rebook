from fastapi import APIRouter , Depends
from fastapi import Query
from sqlalchemy.orm import Session
from core.database import get_db
from models import Book
from schemas import BookResponse
from typing import Optional

router = APIRouter(prefix="/shop", tags=["Shop"])

@router.get("/", response_model=list[BookResponse])
def get_books(
    db: Session = Depends(get_db),
    genre_id: Optional[int] = Query(None, description="Filter by genre ID"),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    year: Optional[int] = Query(None, descriptioin="Finter by release year"),
    title: Optional[str] = Query(None, description="Search by book title")
):
    query = db.query(Book)
    
    if genre_id:
        query = query.filter(Book.genre_id == genre_id)
    if author_id:
        query = query.filter(Book.author_id == author_id)
    if year:
        query = query.filter(Book.release_date.like(f"%{year}-%"))
    if title:
        query = query.filter(Book.title.ilike(f"%{title}%"))
        
    books = query.all()
    return [BookResponse.from_orm(book) for book in books]