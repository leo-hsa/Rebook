from fastapi import APIRouter, Depends,  HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models import User
from schemas import UserOut

router = APIRouter()

@router.get("/users/{user_id}", response_model=UserOut)
def get_user(user_id: int, db: Session = Depends(get_db)):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    return user
