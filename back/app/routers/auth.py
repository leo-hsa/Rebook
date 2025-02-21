from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from fastapi.security import OAuth2PasswordRequestForm
from datetime import timedelta

from models import User, Role
from schemas import UserCreate, UserOut, Token
from utils.deps import hash_password, verify_password, get_current_user
from utils.jwt import create_access_token
from core.database import get_db

router = APIRouter(prefix="/auth", tags=["Authentication"])

@router.post("/register", response_model=UserOut)
def register(user_data: UserCreate, db: Session = Depends(get_db)):
    if db.query(User).filter(User.email == user_data.email).first():
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(
        nickname=user_data.nickname,
        email=user_data.email,
        hashed_password=hash_password(user_data.password),
        role_id=2 
    )
    
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


@router.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends(), db: Session = Depends(get_db)):
    print(f"Received login request: username={form_data.username}, password={form_data.password}")

    if not form_data.username or not form_data.password:
        raise HTTPException(status_code=400, detail="Username and password required")

    user = db.query(User).filter(User.email == form_data.username).first()
    
    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    access_token = create_access_token({"sub": user.email}, timedelta(hours=1))
    return {"access_token": access_token, "token_type": "bearer", "nickname": user.nickname}



@router.get("/me", response_model=UserOut)
def get_me(current_user: User = Depends(get_current_user)):
    return current_user
