from passlib.context import CryptContext
from fastapi.security import OAuth2PasswordBearer
from fastapi import Depends, HTTPException, status
from sqlalchemy.orm import Session
from jose import jwt
from core.database import get_db
from models import User
from .jwt import decode_access_token, SECRET_KEY, ALGORITHM
from typing import Optional

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login", auto_error=False)

def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain_password: str, hashed_password: str) -> bool:
    return pwd_context.verify(plain_password, hashed_password)


def get_current_user_required(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Invalid authentication credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    
    if not token:
        
        raise credentials_exception

    payload = decode_access_token(token)
    if not payload:
        raise credentials_exception

    email = payload.get("sub")
    
    user = db.query(User).filter(User.email == email).first()
    if not user:
        
        raise credentials_exception

    return user


def get_current_user_optional(token: Optional[str] = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> Optional[User]:
    if not token:
        return None
    
    payload = decode_access_token(token)
    if not payload:
        return None

    user = db.query(User).filter(User.email == payload.get("sub")).first()
    if not user:
        return None

    return user


def get_current_admin(user: User = Depends(get_current_user_required)):
    if user.role_id != 1:
        raise HTTPException(
            status_code=403,
            detail="Not enough permission - admin access required"
        )
    return user



