from fastapi import APIRouter , HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from models import Author
from schemas import AuthorBase
from core.database import get_db

router = APIRouter(prefix="/authors", tags=["Author"])

@router.get("/", response_model=List[AuthorBase])
def get_authors(db: Session = Depends(get_db)):
    authors = db.query(Author).all()
    return authors


@router.get("/{author_id}", response_model=AuthorBase)
def get_author_details(author_id: int, db: Session = Depends(get_db)):
    author = db.query(Author).filter(Author.id == author_id).first()
    if not author:
        raise HTTPException(status_code=404, detail="Author not found")
    return author