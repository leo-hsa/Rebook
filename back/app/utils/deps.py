from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from utils.jwt import SECRET_KEY, ALGORITHM
from models import User
from sqlalchemy.orm import Session
from core.database import get_db

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/auth/login") 
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        email: str = payload.get("sub")
        token_type: str = payload.get("token_type")

        if email is None or token_type != "access":
            raise credentials_exception
    except JWTError as e:
        print(f"JWT decode error: {str(e)}")  # Логирование ошибки
        raise credentials_exception

    user = db.query(User).filter(User.email == email).first()
    if user is None:
        raise credentials_exception
    return user
