from app import app
from models import db
from sqlalchemy import text

with app.app_context():
    print("Creating all tables (including textures if not exists...)")
    db.create_all()
    print("Altering food_items to add texture_id column...")
    try:
        db.session.execute(text('ALTER TABLE food_items ADD COLUMN texture_id INTEGER REFERENCES textures(id);'))
        db.session.commit()
        print("Success: Added texture_id to food_items.")
    except Exception as e:
        db.session.rollback()
        print(f"Notice (might already exist): {e}")
