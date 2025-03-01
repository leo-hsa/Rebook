from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from core.database import get_db
from models import User
from schemas import BookCreate
from utils.deps import get_current_user_required

router = APIRouter()

