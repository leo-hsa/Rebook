# routers/author.py

from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session, joinedload 
from typing import List
from models import Author, Book 

from schemas import AuthorListItem, Author as AuthorSchema, BookSummaryForAuthor
from core.database import get_db 

router = APIRouter(
    prefix="/authors", 
    tags=["Author"]    
)

@router.get("/", response_model=List[AuthorListItem])
def get_authors(db: Session = Depends(get_db)):
    
    authors = db.query(Author.id, Author.name).order_by(Author.name).all()
    
    return authors 

@router.get("/{author_id}", response_model=AuthorSchema)
def get_author_details(author_id: int, db: Session = Depends(get_db)):
    
    author = db.query(Author).options(
       
        joinedload(Author.books)
    ).filter(Author.id == author_id).first()

    
    if not author:
        raise HTTPException(status_code=404, detail=f"Author with id {author_id} not found")

   
    return author