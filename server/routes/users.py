from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

from utils.database import get_db
from utils.auth import get_current_user, get_password_hash
from models.user import User
from schemas import UserUpdate, UserResponse, MessageResponse

router = APIRouter()

@router.get("/profile", response_model=UserResponse)
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Get current user's profile"""
    return current_user

@router.put("/profile", response_model=UserResponse)
def update_user_profile(
    user_data: UserUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update current user's profile"""
    update_data = user_data.dict(exclude_unset=True)
    
    # Check if email or username is being changed and if it's already taken
    if "email" in update_data:
        existing_user = db.query(User).filter(
            User.email == update_data["email"],
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already registered"
            )
    
    if "username" in update_data:
        existing_user = db.query(User).filter(
            User.username == update_data["username"],
            User.id != current_user.id
        ).first()
        if existing_user:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username already taken"
            )
    
    # Update user fields
    for field, value in update_data.items():
        setattr(current_user, field, value)
    
    try:
        db.commit()
        db.refresh(current_user)
        return current_user
    except IntegrityError:
        db.rollback()
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Profile update failed"
        )

@router.put("/reset-time", response_model=UserResponse)
def update_reset_time(
    reset_hour: int,
    reset_minute: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update user's daily task reset time"""
    if not (0 <= reset_hour <= 23):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset hour must be between 0 and 23"
        )
    
    if not (0 <= reset_minute <= 59):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Reset minute must be between 0 and 59"
        )
    
    current_user.reset_hour = reset_hour
    current_user.reset_minute = reset_minute
    
    db.commit()
    db.refresh(current_user)
    return current_user

@router.delete("/account", response_model=MessageResponse)
def delete_account(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete current user's account and all associated data"""
    # This will cascade delete all tasks due to the relationship
    db.delete(current_user)
    db.commit()
    
    return {"message": "Account deleted successfully"} 