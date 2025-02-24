from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models import Genre
from core.crud import get_all_genres
from schemas import GenreOut
from typing import List

router = APIRouter(prefix="/genres", tags=["Genre"])

@router.get("/",response_model=List[GenreOut])
def read_genres(db: Session = Depends(get_db)):
    return get_all_genres(db)