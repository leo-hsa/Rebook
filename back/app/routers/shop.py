from fastapi import APIRouter, Depends, Query, HTTPException
from sqlalchemy import desc, extract
from sqlalchemy.orm import Session
from typing import List, Optional
from core.database import get_db
from models import Book, Favorite, User, Genre, Author, Basket, BasketStatus
from schemas import BookResponse, BookShopMainResponse, BasketCreate
from utils.deps import get_current_user_optional, get_current_user_required

router = APIRouter(prefix="/shop", tags=["Shop"])

@router.get("/", response_model=List[BookShopMainResponse])
def get_books(
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional),
    genre_name: Optional[str] = Query(None, description="Filter by genre name"),
    author_name: Optional[str] = Query(None, description="Filter by author name"),
    year: Optional[int] = Query(None, description="Filter by release year"),
    title: Optional[str] = Query(None, description="Search by book title"),
    sort_by: Optional[str] = Query("date", description="Sort by 'date' or 'popularity'"),
    limit: int = Query(10, ge=1, le=100, description="Limit of records"),  
    offset: int = Query(0, ge=0, description="Offset for pagination")
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

    query = query.limit(limit).offset(offset)  
    books = query.all()
    favorite_books = set()
    if user:
        favorite_books = {fav.book_id for fav in db.query(Favorite).filter(Favorite.user_id == user.id).all()}

    return [
        BookShopMainResponse(
            title=book.title,
            img=f"/static/images/books/{book.img}" if book.img else "/static/images/books/default.jpg",
            author_name=book.author.name if book.author else "Unknown author"
        )
        for book in books
    ]

@router.get("/book/{book_id}", response_model=BookResponse)
def get_book_info(
    book_id: str,
    db: Session = Depends(get_db),
    user: Optional[User] = Depends(get_current_user_optional)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    is_favorite = False
    if user:
        is_favorite = db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.book_id == book_id).first() is not None

    return BookResponse(
        id=str(book.id),
        title=book.title,
        description=book.description,
        genre_name=book.genre.name if book.genre else "No genre",
        author_name=book.author.name if book.author else "Unknown author",
        release_date=str(book.release_date) if book.release_date else None,
        favorites_count=book.favorites_count,
        is_favorite=is_favorite,
        img=f"/static/images/books/{book.img}" if book.img else "/static/images/books/default.jpg",
        price=float(book.price)
    )

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
            author_name=book.author.name if book.author else "Unknown author",
            release_date=str(book.release_date) if book.release_date else None,
            favorites_count=book.favorites_count,
            is_favorite=True,
            img=f"/static/images/books/{book.img}" if book.img else "/static/images/books/default.jpg",
            price=float(book.price)
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

    existing_favorite = db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.book_id == book_id).first()
    if existing_favorite:
        raise HTTPException(status_code=400, detail="Book already in favorites")

    favorite = Favorite(user_id=user.id, book_id=book_id)
    db.add(favorite)
    book.favorites_count += 1
    try:
        db.commit()
        db.refresh(favorite)
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to add book to favorites")
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

    favorite = db.query(Favorite).filter(Favorite.user_id == user.id, Favorite.book_id == book_id).first()
    if not favorite:
        raise HTTPException(status_code=404, detail="Book not in favorites")

    db.delete(favorite)
    book.favorites_count -= 1
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to remove book from favorites")
    return {"message": f"Book {book_id} removed from favorites"}

@router.post("/basket/{book_id}", response_model=dict)
def add_to_basket(
    book_id: str,
    basket_data: BasketCreate = Depends(), 
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    book = db.query(Book).filter(Book.id == book_id).first()
    if not book:
        raise HTTPException(status_code=404, detail="Book not found")

    basket_item = db.query(Basket).filter_by(user_id=current_user.id, book_id=book_id).first()

    if basket_item:
        if basket_item.status == BasketStatus.removed:
            basket_item.status = BasketStatus.active
            basket_item.quantity = basket_data.quantity
            try:
                db.commit()
            except Exception:
                db.rollback()
                raise HTTPException(status_code=500, detail="Failed to restore book to basket")
            return {"message": f"Book {book_id} restored to basket"}
        raise HTTPException(status_code=400, detail="Book already in basket")
    else:
        basket_item = Basket(
            user_id=current_user.id,
            book_id=book_id,
            status=BasketStatus.active,
            quantity=basket_data.quantity
        )
        db.add(basket_item)
        try:
            db.commit()
            db.refresh(basket_item)
        except Exception:
            db.rollback()
            raise HTTPException(status_code=500, detail="Failed to add book to basket")
    return {"message": f"Book {book_id} added to basket"}

@router.delete("/basket/{book_id}", response_model=dict)
def remove_from_basket(
    book_id: str,
    hard_delete: bool = Query(False, description="Permanently delete from basket"),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    basket_item = db.query(Basket).filter_by(user_id=current_user.id, book_id=book_id).first()
    if not basket_item or basket_item.status == BasketStatus.removed:
        raise HTTPException(status_code=404, detail="Book not found in basket")

    if hard_delete:
        db.delete(basket_item)
    else:
        basket_item.status = BasketStatus.removed
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to remove book from basket")
    return {"message": f"Book {book_id} removed from basket"}

@router.get("/basket/", response_model=List[BookResponse])
def get_basket(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    basket_items = db.query(Basket).join(Book, Basket.book_id == Book.id).filter(
        Basket.user_id == current_user.id,
        Basket.status == BasketStatus.active
    ).all()

    return [
        BookResponse(
            id=str(item.book.id),
            title=item.book.title,
            description=item.book.description,
            genre_name=item.book.genre.name if item.book.genre else "No genre",
            author_name=item.book.author.name if item.book.author else "Unknown author",
            release_date=str(item.book.release_date) if item.book.release_date else None,
            favorites_count=item.book.favorites_count,
            is_favorite=db.query(Favorite).filter(Favorite.user_id == current_user.id, Favorite.book_id == item.book.id).first() is not None,
            img=f"/static/images/books/{item.book.img}" if item.book.img else "/static/images/books/default.jpg",
            price=float(item.book.price),
            quantity=item.quantity  
        )
        for item in basket_items
    ]

@router.post("/basket/purchase", response_model=dict)
def purchase_basket(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    basket_items = db.query(Basket).filter(
        Basket.user_id == current_user.id,
        Basket.status == BasketStatus.active
    ).all()

    if not basket_items:
        raise HTTPException(status_code=400, detail="Basket is empty")

    for item in basket_items:
        item.status = BasketStatus.purchased
    
    try:
        db.commit()
    except Exception:
        db.rollback()
        raise HTTPException(status_code=500, detail="Failed to update basket status")

    return {"message": "Purchase completed successfully"}