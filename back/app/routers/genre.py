from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models import Genre
from core.crud import get_all_genres
from schemas import GenreOut
from typing import List

router = APIRouter(prefix="/genres", tags=["Genre"])

@router.get("/",response_model=List[GenreOut])
def get_genres(db: Session = Depends(get_db)):
    genres = db.query(Genre).all()
    return genres