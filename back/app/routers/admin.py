from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from models import Book, Author, Genre  
from schemas import BookResponse, Genre as GenreSchema, Author as AuthorSchema  
from core.database import get_db
from utils.deps import get_current_user_optional, get_current_user_required, get_current_admin
import os
from pathlib import Path
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/admin", tags=["Admin"], dependencies=[Depends(get_current_admin)])

@router.post("/books/", response_model=BookResponse)
def create_book(
    id: str = Form(...),
    title: str = Form(...),
    description: str = Form(...),
    author_name: str = Form(...),
    genre_name: Optional[str] = Form(None),
    release_date: Optional[str] = Form(None),
    img: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_author = db.query(Author).filter(Author.name == author_name).first()  
    if not db_author:
        db_author = Author(name=author_name) 
        db.add(db_author)
        db.commit()
        db.refresh(db_author)
    
    genre_id = None
    if genre_name:
        db_genre = db.query(Genre).filter(Genre.name == genre_name).first()  
        if not db_genre:
            db_genre = Genre(name=genre_name)  
            db.add(db_genre)
            db.commit()
            db.refresh(db_genre)
        genre_id = db_genre.id
    
    if db.query(Book).filter(Book.id == id).first():  
        raise HTTPException(status_code=400, detail="Book with this ID already exists")
    
    img_path = None
    if img:
        images_dir = Path(__file__).parent.parent / "static/images/books"
        os.makedirs(images_dir, exist_ok=True)
        img_filename = f"{id}_{img.filename}"
        img_full_path = images_dir / img_filename
        logger.info(f"Saving image to: {img_full_path}")
        with open(img_full_path, "wb") as f:
            f.write(img.file.read())
        if img_full_path.exists():
            logger.info(f"File saved successfully: {img_full_path}")
        else:
            logger.error(f"File not saved: {img_full_path}")
        img_path = img_filename  
    
    db_book = Book(
        id=id,
        title=title,
        description=description,
        genre_id=genre_id,
        author_id=db_author.id,
        release_date=release_date,
        favorites_count=0,
        img=img_path, 
        price=0
    )
    
    db.add(db_book)
    db.commit()
    db.refresh(db_book)
    
    return BookResponse.from_orm(db_book)

@router.post("/genres/", response_model=GenreSchema) 
def create_genre(
    name: str = Form(...),
    img: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    if db.query(Genre).filter(Genre.name == name).first(): 
        raise HTTPException(status_code=400, detail="Genre with this name already exists")
    
    img_path = None
    if img:
        images_dir = Path(__file__).parent.parent / "static/images/genres"  
        os.makedirs(images_dir, exist_ok=True)
        img_filename = f"genre_{name}_{img.filename}"
        img_full_path = images_dir / img_filename
        logger.info(f"Saving image to: {img_full_path}")  
        with open(img_full_path, "wb") as f:
            f.write(img.file.read())
        if img_full_path.exists():  
            logger.info(f"File saved successfully: {img_full_path}")
        else:
            logger.error(f"File not saved: {img_full_path}")
        img_path = img_filename 
    
    db_genre = Genre(name=name, img=img_path) 
    db.add(db_genre)
    db.commit()
    db.refresh(db_genre)
    
    return GenreSchema.from_orm(db_genre)

@router.post("/authors/", response_model=AuthorSchema)  
def create_author(
    name: str = Form(...),
    info: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    if db.query(Author).filter(Author.name == name).first():  
        raise HTTPException(status_code=400, detail="Author with this name already exists")

    db_author = Author(name=name, info=info)  
    db.add(db_author)
    db.commit()
    db.refresh(db_author)
    
    return AuthorSchema.from_orm(db_author)


@router.put("/books/{book_id}", response_model=BookResponse)
def update_book(
    book_id: str,
    title: Optional[str] = Form(None),
    description: Optional[str] = Form(None),
    author_name: Optional[str] = Form(None),
    genre_name: Optional[str] = Form(None),
    release_date: Optional[str] = Form(None),
    img: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Update author if provided
    if author_name:
        db_author = db.query(Author).filter(Author.name == author_name).first()
        if not db_author:
            db_author = Author(name=author_name)
            db.add(db_author)
            db.commit()
            db.refresh(db_author)
        db_book.author_id = db_author.id

    # Update genre if provided
    if genre_name:
        db_genre = db.query(Genre).filter(Genre.name == genre_name).first()
        if not db_genre:
            db_genre = Genre(name=genre_name)
            db.add(db_genre)
            db.commit()
            db.refresh(db_genre)
        db_book.genre_id = db_genre.id
    elif genre_name == "":  # Allow clearing genre
        db_book.genre_id = None

    # Update simple fields if provided
    if title:
        db_book.title = title
    if description:
        db_book.description = description
    if release_date:
        db_book.release_date = release_date

    # Update image if provided
    if img:
        images_dir = Path(__file__).parent.parent / "static/images/books"
        os.makedirs(images_dir, exist_ok=True)
        img_filename = f"{book_id}_{img.filename}"
        img_full_path = images_dir / img_filename
        
        # Delete old image if it exists
        if db_book.img:
            old_img_path = images_dir / db_book.img
            if old_img_path.exists():
                os.remove(old_img_path)
                logger.info(f"Deleted old image: {old_img_path}")

        # Save new image
        with open(img_full_path, "wb") as f:
            f.write(img.file.read())
        db_book.img = img_filename
        logger.info(f"Updated image to: {img_full_path}")

    db.commit()
    db.refresh(db_book)
    return BookResponse.from_orm(db_book)


@router.delete("/books/{book_id}", status_code=204)
def delete_book(
    book_id: str,
    db: Session = Depends(get_db)
):
    db_book = db.query(Book).filter(Book.id == book_id).first()
    if not db_book:
        raise HTTPException(status_code=404, detail="Book not found")

    # Delete associated image
    if db_book.img:
        images_dir = Path(__file__).parent.parent / "static/images/books"
        img_path = images_dir / db_book.img
        if img_path.exists():
            os.remove(img_path)
            logger.info(f"Deleted image: {img_path}")

    db.delete(db_book)
    db.commit()
    return None  # 204 No Content


@router.put("/genres/{genre_name}", response_model=GenreSchema)
def update_genre(
    genre_name: str,
    new_name: Optional[str] = Form(None),
    img: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    db_genre = db.query(Genre).filter(Genre.name == genre_name).first()
    if not db_genre:
        raise HTTPException(status_code=404, detail="Genre not found")

    # Update name if provided
    if new_name and new_name != genre_name:
        if db.query(Genre).filter(Genre.name == new_name).first():
            raise HTTPException(status_code=400, detail="Genre with this new name already exists")
        db_genre.name = new_name

    # Update image if provided
    if img:
        images_dir = Path(__file__).parent.parent / "static/images/genres"
        os.makedirs(images_dir, exist_ok=True)
        img_filename = f"genre_{db_genre.name}_{img.filename}"
        img_full_path = images_dir / img_filename

        # Delete old image
        if db_genre.img:
            old_img_path = images_dir / db_genre.img
            if old_img_path.exists():
                os.remove(old_img_path)
                logger.info(f"Deleted old image: {old_img_path}")

        # Save new image
        with open(img_full_path, "wb") as f:
            f.write(img.file.read())
        db_genre.img = img_filename
        logger.info(f"Updated image to: {img_full_path}")

    db.commit()
    db.refresh(db_genre)
    return GenreSchema.from_orm(db_genre)


@router.delete("/genres/{genre_name}", status_code=204)
def delete_genre(
    genre_name: str,
    db: Session = Depends(get_db)
):
    db_genre = db.query(Genre).filter(Genre.name == genre_name).first()
    if not db_genre:
        raise HTTPException(status_code=404, detail="Genre not found")

    # Check if genre is used by any books
    if db.query(Book).filter(Book.genre_id == db_genre.id).first():
        raise HTTPException(status_code=400, detail="Cannot delete genre with associated books")

    # Delete image
    if db_genre.img:
        images_dir = Path(__file__).parent.parent / "static/images/genres"
        img_path = images_dir / db_genre.img
        if img_path.exists():
            os.remove(img_path)
            logger.info(f"Deleted image: {img_path}")

    db.delete(db_genre)
    db.commit()
    return None


@router.put("/authors/{author_name}", response_model=AuthorSchema)
def update_author(
    author_name: str,
    new_name: Optional[str] = Form(None),
    info: Optional[str] = Form(None),
    db: Session = Depends(get_db)
):
    db_author = db.query(Author).filter(Author.name == author_name).first()
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")

    # Update name if provided
    if new_name and new_name != author_name:
        if db.query(Author).filter(Author.name == new_name).first():
            raise HTTPException(status_code=400, detail="Author with this new name already exists")
        db_author.name = new_name

    # Update info if provided
    if info is not None:  # Allow clearing info with empty string
        db_author.info = info

    db.commit()
    db.refresh(db_author)
    return AuthorSchema.from_orm(db_author)


@router.delete("/authors/{author_name}", status_code=204)
def delete_author(
    author_name: str,
    db: Session = Depends(get_db)
):
    db_author = db.query(Author).filter(Author.name == author_name).first()
    if not db_author:
        raise HTTPException(status_code=404, detail="Author not found")

    # Check if author is used by any books
    if db.query(Book).filter(Book.author_id == db_author.id).first():
        raise HTTPException(status_code=400, detail="Cannot delete author with associated books")

    db.delete(db_author)
    db.commit()
    return None