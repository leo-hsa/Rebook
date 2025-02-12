from fastapi import APIRouter , HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from models import Author
from core.database import get_db

router = APIRouter()

