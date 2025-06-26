from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.orm import Session
from typing import List, Optional
from datetime import datetime, date

from utils.database import get_db
from utils.auth import get_current_user
from models.user import User
from models.task import Task
from schemas import (
    TaskCreate, 
    TaskUpdate, 
    TaskResponse, 
    TaskListResponse,
    MessageResponse
)

router = APIRouter()

@router.get("/", response_model=TaskListResponse)
def get_tasks(
    completed: Optional[bool] = Query(None, description="Filter by completion status"),
    priority: Optional[int] = Query(None, description="Filter by priority (1-3)"),
    category: Optional[str] = Query(None, description="Filter by category"),
    due_date: Optional[date] = Query(None, description="Filter by due date"),
    overdue: Optional[bool] = Query(None, description="Filter overdue tasks"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=1000),
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all tasks for the current user with optional filtering"""
    query = db.query(Task).filter(Task.user_id == current_user.id)
    
    if completed is not None:
        query = query.filter(Task.is_completed == completed)
    
    if priority is not None:
        if priority not in [1, 2, 3]:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Priority must be 1, 2, or 3"
            )
        query = query.filter(Task.priority == priority)
    
    if category is not None:
        query = query.filter(Task.category == category)
    
    if due_date is not None:
        query = query.filter(Task.due_date == due_date)
    
    if overdue is not None:
        if overdue:
            # Filter for overdue tasks (due_date < today and not completed)
            today = date.today()
            query = query.filter(
                Task.due_date < today,
                Task.is_completed == False
            )
        else:
            # Filter for non-overdue tasks
            today = date.today()
            query = query.filter(
                (Task.due_date >= today) | (Task.due_date.is_(None)) | (Task.is_completed == True)
            )
    
    # Get total counts
    total_tasks = query.count()
    completed_tasks = query.filter(Task.is_completed == True).count()
    pending_tasks = total_tasks - completed_tasks
    
    # Apply pagination
    tasks = query.offset(skip).limit(limit).all()
    
    return TaskListResponse(
        tasks=tasks,
        total=total_tasks,
        completed=completed_tasks,
        pending=pending_tasks
    )

@router.get("/categories", response_model=List[str])
def get_task_categories(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all unique categories for the current user's tasks"""
    categories = db.query(Task.category).filter(
        Task.user_id == current_user.id,
        Task.category.isnot(None)
    ).distinct().all()
    
    return [cat[0] for cat in categories if cat[0]]

@router.get("/overdue", response_model=TaskListResponse)
def get_overdue_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get all overdue tasks for the current user"""
    today = date.today()
    tasks = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.due_date < today,
        Task.is_completed == False
    ).all()
    
    return TaskListResponse(
        tasks=tasks,
        total=len(tasks),
        completed=0,
        pending=len(tasks)
    )

@router.post("/", response_model=TaskResponse)
def create_task(
    task_data: TaskCreate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Create a new task for the current user"""
    db_task = Task(
        **task_data.dict(),
        user_id=current_user.id
    )
    
    db.add(db_task)
    db.commit()
    db.refresh(db_task)
    return db_task

@router.get("/{task_id}", response_model=TaskResponse)
def get_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Get a specific task by ID"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    return task

@router.put("/{task_id}", response_model=TaskResponse)
def update_task(
    task_id: int,
    task_data: TaskUpdate,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update a specific task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    # Update task fields
    update_data = task_data.dict(exclude_unset=True)
    
    # Handle completion status
    if "is_completed" in update_data:
        if update_data["is_completed"] and not task.is_completed:
            # Mark as completed
            update_data["completed_at"] = datetime.utcnow()
        elif not update_data["is_completed"]:
            # Mark as incomplete
            update_data["completed_at"] = None
    
    for field, value in update_data.items():
        setattr(task, field, value)
    
    db.commit()
    db.refresh(task)
    return task

@router.delete("/{task_id}", response_model=MessageResponse)
def delete_task(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete a specific task"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    db.delete(task)
    db.commit()
    
    return {"message": "Task deleted successfully"}

@router.post("/{task_id}/toggle", response_model=TaskResponse)
def toggle_task_completion(
    task_id: int,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Toggle task completion status"""
    task = db.query(Task).filter(
        Task.id == task_id,
        Task.user_id == current_user.id
    ).first()
    
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Task not found"
        )
    
    task.is_completed = not task.is_completed
    if task.is_completed:
        task.completed_at = datetime.utcnow()
    else:
        task.completed_at = None
    
    db.commit()
    db.refresh(task)
    return task

@router.post("/purge-completed", response_model=MessageResponse)
def purge_completed_tasks(
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Delete all completed tasks for the current user"""
    deleted_count = db.query(Task).filter(
        Task.user_id == current_user.id,
        Task.is_completed == True
    ).delete()
    
    db.commit()
    
    return {"message": f"Deleted {deleted_count} completed tasks"}

# Bulk Operations Endpoints
@router.delete("/bulk/delete")
def bulk_delete_tasks(
    task_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Delete multiple tasks"""
    if not task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")
    
    # Verify all tasks belong to the current user
    tasks = db.query(Task).filter(
        Task.id.in_(task_ids),
        Task.user_id == current_user.id
    ).all()
    
    if len(tasks) != len(task_ids):
        raise HTTPException(status_code=404, detail="Some tasks not found or not accessible")
    
    # Delete all tasks
    for task in tasks:
        db.delete(task)
    
    db.commit()
    return {"message": f"Successfully deleted {len(tasks)} tasks"}

@router.post("/bulk/complete")
def bulk_complete_tasks(
    task_ids: List[int],
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Mark multiple tasks as completed"""
    if not task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")
    
    # Get all tasks that belong to the current user
    tasks = db.query(Task).filter(
        Task.id.in_(task_ids),
        Task.user_id == current_user.id
    ).all()
    
    if len(tasks) != len(task_ids):
        raise HTTPException(status_code=404, detail="Some tasks not found or not accessible")
    
    # Mark all tasks as completed
    completed_count = 0
    for task in tasks:
        if not task.is_completed:
            task.is_completed = True
            task.completed_at = datetime.utcnow()
            task.updated_at = datetime.utcnow()
            completed_count += 1
    
    db.commit()
    return {"message": f"Successfully completed {completed_count} tasks"}

@router.put("/bulk/priority")
def bulk_update_priority(
    task_ids: List[int],
    priority: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user)
):
    """Update priority for multiple tasks"""
    if not task_ids:
        raise HTTPException(status_code=400, detail="No task IDs provided")
    
    if priority not in [1, 2, 3]:
        raise HTTPException(status_code=400, detail="Priority must be 1, 2, or 3")
    
    # Get all tasks that belong to the current user
    tasks = db.query(Task).filter(
        Task.id.in_(task_ids),
        Task.user_id == current_user.id
    ).all()
    
    if len(tasks) != len(task_ids):
        raise HTTPException(status_code=404, detail="Some tasks not found or not accessible")
    
    # Update priority for all tasks
    updated_count = 0
    for task in tasks:
        if task.priority != priority:
            task.priority = priority
            task.updated_at = datetime.utcnow()
            updated_count += 1
    
    db.commit()
    return {"message": f"Successfully updated priority for {updated_count} tasks"} 