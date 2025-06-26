from sqlalchemy import Column, Integer, String, Text, DateTime, Boolean, ForeignKey, Date
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship
from utils.database import Base

class Task(Base):
    __tablename__ = "tasks"

    id = Column(Integer, primary_key=True, index=True)
    title = Column(String(255), nullable=False)
    description = Column(Text, nullable=True)
    is_completed = Column(Boolean, default=False)
    priority = Column(Integer, default=1)  # 1=Low, 2=Medium, 3=High
    category = Column(String(100), nullable=True)  # Task category (e.g., "Work", "Personal", "Health")
    due_date = Column(Date, nullable=True)  # Due date for the task
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    completed_at = Column(DateTime(timezone=True), nullable=True)

    # Relationship with user
    user = relationship("User", back_populates="tasks")

    def __repr__(self):
        return f"<Task(id={self.id}, title='{self.title}', user_id={self.user_id})>"

    def is_overdue(self):
        """Check if task is overdue based on due date"""
        from datetime import date
        if not self.due_date:
            return False
        
        today = date.today()
        return today > self.due_date and not self.is_completed

    def days_until_due(self):
        """Calculate days until due date"""
        from datetime import date
        if not self.due_date:
            return None
        
        today = date.today()
        delta = self.due_date - today
        return delta.days

    def due_status(self):
        """Get the due status of the task"""
        if not self.due_date:
            return "no_due_date"
        
        days = self.days_until_due()
        
        if days is None:
            return "no_due_date"
        elif days < 0:
            return "overdue"
        elif days == 0:
            return "due_today"
        elif days == 1:
            return "due_tomorrow"
        elif days <= 7:
            return "due_soon"
        else:
            return "due_later" 