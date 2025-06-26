from pydantic import BaseModel, EmailStr, validator
from typing import Optional, List
from datetime import datetime, date

# User Schemas
class UserBase(BaseModel):
    email: EmailStr
    username: str
    full_name: Optional[str] = None

class UserCreate(UserBase):
    password: str
    
    @validator('password')
    def validate_password(cls, v):
        v = v.strip()
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        return v

class UserUpdate(BaseModel):
    email: Optional[EmailStr] = None
    username: Optional[str] = None
    full_name: Optional[str] = None
    reset_hour: Optional[int] = None
    reset_minute: Optional[int] = None
    
    @validator('reset_hour')
    def validate_reset_hour(cls, v):
        if v is not None and (v < 0 or v > 23):
            raise ValueError('Reset hour must be between 0 and 23')
        return v
    
    @validator('reset_minute')
    def validate_reset_minute(cls, v):
        if v is not None and (v < 0 or v > 59):
            raise ValueError('Reset minute must be between 0 and 59')
        return v

class UserResponse(UserBase):
    id: int
    is_active: bool
    is_verified: bool
    reset_hour: int
    reset_minute: int
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Task Schemas
class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    priority: Optional[int] = 1
    category: Optional[str] = None
    due_date: Optional[date] = None
    
    @validator('priority')
    def validate_priority(cls, v):
        if v not in [1, 2, 3]:
            raise ValueError('Priority must be 1 (Low), 2 (Medium), or 3 (High)')
        return v
    
    @validator('category')
    def validate_category(cls, v):
        if v is not None and len(v.strip()) == 0:
            return None
        return v

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    is_completed: Optional[bool] = None
    priority: Optional[int] = None
    category: Optional[str] = None
    due_date: Optional[date] = None
    
    @validator('priority')
    def validate_priority(cls, v):
        if v is not None and v not in [1, 2, 3]:
            raise ValueError('Priority must be 1 (Low), 2 (Medium), or 3 (High)')
        return v
    
    @validator('category')
    def validate_category(cls, v):
        if v is not None and len(v.strip()) == 0:
            return None
        return v

class TaskResponse(TaskBase):
    id: int
    is_completed: bool
    user_id: int
    created_at: datetime
    updated_at: Optional[datetime] = None
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

# Authentication Schemas
class Token(BaseModel):
    access_token: str
    token_type: str
    refresh_token: str

class TokenData(BaseModel):
    username: Optional[str] = None

class LoginRequest(BaseModel):
    username: str
    password: str

# Response Schemas
class MessageResponse(BaseModel):
    message: str

class TaskListResponse(BaseModel):
    tasks: List[TaskResponse]
    total: int
    completed: int
    pending: int 