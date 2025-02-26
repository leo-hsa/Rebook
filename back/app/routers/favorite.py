from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models import Favorite, Book
from auth import get_current_user

router = APIRouter(prefix="/favorites", tags=["Favorites"])

@router.post("/{books_id}")
def add_to_favorites(book_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    book = db.query(book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")
    favorite = db.query(Favorite).filter_by(user_id=user.id, book_id = book_id).first()
    if favorite:
        raise HTTPException(status_code=400, detail="Book already in favorites")
    
    new_favorite = Favorite(user_id=user.id , book_id = book_id)
    db.add(new_favorite)
    book.favorites_count += 1
    db.commit()
    return {"message": "Book added to favorites"}

@router.delete("/{book_id}")
def remove_from_favorites(book_id: str, db: Session = Depends(get_db), user=Depends(get_current_user)):
    favorite = db.query(Favorite).filter_by(user_id=user.id, book_id=book_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Book not in favorites")
    
    db.delete(favorite)
    book = db.query(Book).filter(Book.id == book_id).first()
    if book:
        book.favorite_count -= 1
    db.commit()
    return {"message": "Book removed from favorites"}

@router.get("/", response_model=list[FavoritesResponse])
def get_favorites(db: Session = Depends(get_db), user=Depends(get_current_user)):
    favorites = db.query(Favorite).filter(Favorite.user_id == user.id).all()
    return favorites 