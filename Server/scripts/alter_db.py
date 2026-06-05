import sys, os
sys.path.insert(0, os.path.join(os.path.dirname(__file__), '..'))

from app import app
from models import db
from sqlalchemy import text

with app.app_context():
    print("Creating all tables (including textures if not exists...)")
    db.create_all()

    migrations = [
        ('food_items', 'texture_id', 'ALTER TABLE food_items ADD COLUMN IF NOT EXISTS texture_id INTEGER REFERENCES textures(id)'),
        ('meals', 'created_by', 'ALTER TABLE meals ADD COLUMN IF NOT EXISTS created_by INTEGER REFERENCES users(id)'),
        ('meals', 'is_global', 'ALTER TABLE meals ADD COLUMN IF NOT EXISTS is_global BOOLEAN NOT NULL DEFAULT TRUE'),
    ]

    for table, column, sql in migrations:
        try:
            db.session.execute(text(sql))
            db.session.commit()
            print(f"Success: Added {column} to {table}.")
        except Exception as e:
            db.session.rollback()
            print(f"Notice (might already exist): {e}")
