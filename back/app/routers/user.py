from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from core.database import get_db
from models import User
from schemas import UserOut
from utils.deps import get_current_user_required
import logging

# Настройка логирования
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

router = APIRouter(prefix="/users", tags=["User"])

@router.get(
    "/me",
    response_model=UserOut,
    description="Get information about the currently authenticated user",
    responses={
        200: {"description": "User data retrieved successfully"},
        401: {"description": "Unauthorized - Invalid or missing token"},
        500: {"description": "Internal server error"}
    }
)
def get_current_user(
    current_user: User = Depends(get_current_user_required),
    db: Session = Depends(get_db)  # Оставляем для консистентности, хотя не используется
):
    """
    Retrieve the authenticated user's information.
    """
    try:
        # Поскольку current_user уже проверен в get_current_user_required,
        # повторный запрос к базе не нужен
        logger.info(f"User {current_user.id} retrieved their profile")
        return current_user
    except Exception as e:
        logger.error(f"Error retrieving user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")

@router.post(
    "/logout",
    response_model=None,  # Нет тела ответа
    status_code=204,  # No Content
    description="Log out the current user by invalidating the client-side token",
    responses={
        204: {"description": "Logout successful"},
        401: {"description": "Unauthorized - Invalid or missing token"}
    }
)
def logout(
    current_user: User = Depends(get_current_user_required)
):
    """
    Log out the current user. The client should remove the token.
    """
    logger.info(f"User {current_user.id} logged out")
    # FastAPI stateless, поэтому просто возвращаем 204
    return None

@router.get(
    "/admin",
    response_model=dict,
    description="Get admin dashboard data (accessible only to administrators)",
    responses={
        200: {"description": "Admin data retrieved successfully"},
        403: {"description": "Forbidden - Admin access required"},
        401: {"description": "Unauthorized - Invalid or missing token"},
        500: {"description": "Internal server error"}
    }
)
def get_admin_data(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user_required)
):
    """
    Retrieve admin dashboard data, such as the total number of users.
    Only accessible to users with role_id=1 (admin).
    """
    if current_user.role_id != 1:
        logger.warning(f"User {current_user.id} attempted admin access without permission")
        raise HTTPException(status_code=403, detail="Admin access required")

    try:
        users_count = db.query(User).count()
        logger.info(f"Admin {current_user.id} accessed admin panel")
        return {
            "message": "Welcome to admin panel",
            "users_count": users_count
        }
    except Exception as e:
        logger.error(f"Error retrieving admin data for user {current_user.id}: {str(e)}")
        raise HTTPException(status_code=500, detail="Database error occurred")