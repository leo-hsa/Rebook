from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import desc, extract
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models import Book, Favorite, User
from schemas import BookResponse
from utils.deps import get_current_user_optional, get_current_user_required

router = APIRouter(prefix="/shop", tags=["Shop"])

@router.get("/", response_model=list[BookResponse])
def get_books(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
    genre_id: Optional[int] = Query(None, description="Filter by genre ID"),
    author_id: Optional[int] = Query(None, description="Filter by author ID"),
    year: Optional[int] = Query(None, description="Filter by release year"),
    title: Optional[str] = Query(None, description="Search by book title"),
    sort_by: Optional[str] = Query("date", description="Sort by 'date' or 'popularity'")
):
    query = db.query(Book)
    if genre_id:
        query = query.filter(Book.genre_id == genre_id)
    if author_id:
        query = query.filter(Book.author_id == author_id)
    if year:
        query = query.filter(extract('year', Book.release_date) == year)
    if title:
        query = query.filter(Book.title.ilike(f"%{title}%"))

    if sort_by == "popularity":
        query = query.order_by(desc(Book.favorites_count))
    else:
        query = query.order_by(desc(Book.release_date))

    books = query.all()
    favorite_books = set()
    if user:
        favorite_books = {fav.book_id for fav in db.query(Favorite).filter(Favorite.user_id == user.id).all()}

    return [
        BookResponse(
            id=book.id,
            title=book.title,
            description=book.description,
            genre_id=book.genre_id,
            author_id=book.author_id,
            release_date=str(book.release_date),
            favorites_count=book.favorites_count,
            is_favorite=book.id in favorite_books
        )
        for book in books
    ]

@router.post("/favorites/{book_id}", response_model=dict)
def add_to_favorites(
    book_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    existing_favorite = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.book_id == book_id
    ).first()
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Book already in favorites")

    favorite = Favorite(user_id=user.id, book_id=book_id)
    db.add(favorite)
    book.favorites_count += 1
    db.commit()
    db.refresh(favorite)
    return {"message": f"Book {book_id} added to favorites"}

@router.delete("/favorites/{book_id}", response_model=dict)
def remove_from_favorites(
    book_id: int,
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    favorite = db.query(Favorite).filter(
        Favorite.user_id == user.id,
        Favorite.book_id == book_id
    ).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Book not in favorites")

    db.delete(favorite)
    book.favorites_count -= 1
    db.commit()
    return {"message": f"Book {book_id} removed from favorites"}

@router.get("/favorites/", response_model=List[BookResponse])
def get_favorites(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    favorites = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    favorite_book_ids = {fav.book_id for fav in favorites}
    books = db.query(Book).filter(Book.id.in_(favorite_book_ids)).all()
    return [
        BookResponse(
            id=book.id,
            title=book.title,
            description=book.description,
            genre_id=book.genre_id,
            author_id=book.author_id,
            release_date=str(book.release_date),
            favorites_count=book.favorites_count,
            is_favorite=True
        )
        for book in books
    ]