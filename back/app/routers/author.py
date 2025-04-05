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