from flask_sqlalchemy import SQLAlchemy
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

# Initialize the SQLAlchemy translator
db = SQLAlchemy()


class FoodItem(db.Model):
    __tablename__ = 'food_items'

    id = db.Column(db.Integer, primary_key=True)
    category = db.Column(db.String(100), nullable=False)
    name = db.Column(db.String(200), nullable=False)
    company = db.Column(db.String(100))
    image_url = db.Column(db.String(500))

    texture_level = db.Column(db.String(50))
    texture_notes = db.Column(db.Text)

    allergens_contains = db.Column(JSONB, default={})
    allergens_may_contain = db.Column(JSONB, default={})
    allergy_notes = db.Column(db.Text)
    forbidden_for = db.Column(db.String(200))

    nutrition_data = db.Column(JSONB, default={})
    nutrition_vector = db.Column(Vector(3)) # we need to decide how many nutritional values we have we set it to 3 for now
    openai_embedding = db.Column(Vector(1536))
    updated_at = db.Column(db.DateTime, default=datetime.utcnow)