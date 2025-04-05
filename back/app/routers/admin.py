from fastapi import APIRouter, HTTPException, Depends, UploadFile, File, Form
from sqlalchemy.orm import Session
from typing import Optional
from models import Book, Author, Genre  
from schemas import BookResponse, Genre as GenreSchema, Author as AuthorSchema  
from core.database import get_db
import os
from pathlib import Path

router = APIRouter(prefix="/admin", tags=["Admin"])

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
        images_dir = "images"
        os.makedirs(images_dir, exist_ok=True)
        img_filename = f"{id}_{img.filename}"
        img_path = f"/images/{img_filename}"
        with open(os.path.join(images_dir, img_filename), "wb") as f:
            f.write(img.file.read())
    
    
    db_book = Book(
        id=id,
        title=title,
        description=description,
        genre_id=genre_id,
        author_id=db_author.id,
        release_date=release_date,
        favorites_count=0,
        img=img_path
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
        images_dir = "images"
        os.makedirs(images_dir, exist_ok=True)
        img_filename = f"genre_{name}_{img.filename}"
        img_path = f"/images/{img_filename}"
        with open(os.path.join(images_dir, img_filename), "wb") as f:
            f.write(img.file.read())
    
 
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