from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import desc, extract
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models import Book, Favorite, User, Genre, Author
from schemas import BookResponse
from utils.deps import get_current_user_optional, get_current_user_required

router = APIRouter(prefix="/shop", tags=["Shop"])

@router.get("/", response_model=list[BookResponse])
def get_books(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
    genre_name: Optional[str] = Query(None, description="Filter by genre name"),
    author_name: Optional[str] = Query(None, description="Filter by author name"),
    year: Optional[int] = Query(None, description="Filter by release year"),
    title: Optional[str] = Query(None, description="Search by book title"),
    sort_by: Optional[str] = Query("date", description="Sort by 'date' or 'popularity'")
):
    query = db.query(Book).join(Genre, Book.genre_id == Genre.id).join(Author, Book.author_id == Author.id)

  
    if genre_name:
        query = query.filter(Genre.name.ilike(f"%{genre_name}%"))


    if author_name:
        query = query.filter(Author.name.ilike(f"%{author_name}%"))

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
            id=str(book.id),  
            title=book.title,
            description=book.description,
            genre_name=book.genre.name if book.genre else "No genre",
            author_name=book.author.name,
            release_date=str(book.release_date) if book.release_date else None,
            favorites_count=book.favorites_count,
            is_favorite=book.id in favorite_books
        )
        for book in books
    ]



@router.get("/favorites/", response_model=List[BookResponse])
def get_favorites(
    db: Session = Depends(get_db),
    user: User = Depends(get_current_user_required)
):
    favorite_books = db.query(Book).join(Favorite, Favorite.book_id == Book.id).join(Genre, Book.genre_id == Genre.id).join(Author, Book.author_id == Author.id).filter(Favorite.user_id == user.id).all()

    return [
        BookResponse(
            id=str(book.id),
            title=book.title,
            description=book.description,
            genre_name=book.genre.name if book.genre else "No genre",
            author_name=book.author.name,
            release_date=str(book.release_date) if book.release_date else None,
            favorites_count=book.favorites_count,
            is_favorite=True
        )
        for book in favorite_books
    ]




@router.post("/favorites/{book_id}", response_model=dict)
def add_to_favorites(
    book_id: str, 
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
    book_id: str, 
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