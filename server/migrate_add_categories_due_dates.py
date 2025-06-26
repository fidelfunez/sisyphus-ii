#!/usr/bin/env python3
"""
Migration script to add category and due_date columns to tasks table
"""

import sys
import os
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

from sqlalchemy import create_engine, text
from utils.database import DATABASE_URL

def migrate():
    """Add category and due_date columns to tasks table"""
    engine = create_engine(DATABASE_URL)
    
    with engine.connect() as conn:
        # Check if columns already exist
        result = conn.execute(text("""
            SELECT column_name 
            FROM information_schema.columns 
            WHERE table_name = 'tasks' 
            AND column_name IN ('category', 'due_date')
        """))
        existing_columns = [row[0] for row in result]
        
        # Add category column if it doesn't exist
        if 'category' not in existing_columns:
            print("Adding category column...")
            conn.execute(text("ALTER TABLE tasks ADD COLUMN category VARCHAR(100)"))
            print("✓ Added category column")
        
        # Add due_date column if it doesn't exist
        if 'due_date' not in existing_columns:
            print("Adding due_date column...")
            conn.execute(text("ALTER TABLE tasks ADD COLUMN due_date DATE"))
            print("✓ Added due_date column")
        
        conn.commit()
        print("Migration completed successfully!")

if __name__ == "__main__":
    migrate() 