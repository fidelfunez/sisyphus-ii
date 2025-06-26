import os
import redis
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from utils.database import SessionLocal
from models.task import Task
from models.user import User
from dotenv import load_dotenv

load_dotenv()

class TaskScheduler:
    def __init__(self):
        self.redis_enabled = os.getenv("REDIS_ENABLED", "False").lower() == "true"
        self.redis_client = None
        
        if self.redis_enabled:
            redis_url = os.getenv("REDIS_URL", "redis://localhost:6379")
            self.redis_client = redis.from_url(redis_url)
    
    def purge_expired_tasks(self):
        """Purge tasks that have passed their reset time"""
        db = SessionLocal()
        try:
            # Get all users with their reset times
            users = db.query(User).all()
            
            for user in users:
                self._purge_user_tasks(db, user)
                
        finally:
            db.close()
    
    def _purge_user_tasks(self, db: Session, user: User):
        """Purge tasks for a specific user based on their reset time"""
        now = datetime.utcnow()
        
        # Calculate the user's reset time for today
        reset_time = now.replace(
            hour=user.reset_hour,
            minute=user.reset_minute,
            second=0,
            microsecond=0
        )
        
        # If reset time hasn't passed today, don't purge
        if now < reset_time:
            return
        
        # Delete all tasks for this user that were created before the reset time
        deleted_count = db.query(Task).filter(
            Task.user_id == user.id,
            Task.created_at < reset_time
        ).delete()
        
        if deleted_count > 0:
            db.commit()
            print(f"Purged {deleted_count} tasks for user {user.username}")
    
    def schedule_daily_purge(self):
        """Schedule daily task purge (if Redis is available)"""
        if not self.redis_enabled:
            print("Redis not enabled, skipping scheduled purge")
            return
        
        # This is a simple implementation
        # In production, you might want to use Celery or APScheduler
        try:
            # Set a flag to indicate purge is scheduled
            self.redis_client.set("task_purge_scheduled", "true", ex=86400)  # 24 hours
            print("Daily task purge scheduled")
        except Exception as e:
            print(f"Failed to schedule purge: {e}")
    
    def check_and_purge(self):
        """Check if purge is needed and execute it"""
        if not self.redis_enabled:
            # Without Redis, just purge directly
            self.purge_expired_tasks()
            return
        
        try:
            # Check if purge was scheduled
            if self.redis_client.get("task_purge_scheduled"):
                self.purge_expired_tasks()
                # Remove the flag
                self.redis_client.delete("task_purge_scheduled")
                print("Scheduled task purge completed")
        except Exception as e:
            print(f"Failed to check purge status: {e}")

# Global scheduler instance
scheduler = TaskScheduler()

def purge_tasks_command():
    """Command-line function to purge tasks"""
    print("Starting task purge...")
    scheduler.purge_expired_tasks()
    print("Task purge completed")

if __name__ == "__main__":
    purge_tasks_command() 