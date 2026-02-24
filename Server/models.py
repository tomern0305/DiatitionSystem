from flask_sqlalchemy import SQLAlchemy
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

db = SQLAlchemy()

class Category(db.Model):
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to food items
    food_items = db.relationship('FoodItem', backref='category_rel', lazy=True)

class FoodItem(db.Model):
    __tablename__ = 'food_items'

    # --- מידע בסיסי ---
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # React: name | Excel: שם המזון
    image_url = db.Column(db.String(500))  # React: image
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)  # References categories.id
    company = db.Column(db.String(100))  # Excel: חברה

    # --- מרקם (IDDSI) ---
    iddsi = db.Column(db.Integer)  # React: iddsi | תקן עולמי למרקם
    texture_notes = db.Column(db.Text)  # Excel: הערות מרקם

    # --- ערכים תזונתיים לחישובים ול-Machine Learning ---
    calories = db.Column(db.Float, default=0.0)  # React: calories
    protein = db.Column(db.Float, default=0.0)  # React: protein
    carbs = db.Column(db.Float, default=0.0)  # React: carbs
    fat = db.Column(db.Float, default=0.0)  # React: fat
    sugars = db.Column(db.Float, default=0.0)  # React: sugars
    sodium = db.Column(db.Float, default=0.0)  # React: sodium

    # --- אלרגנים ומאפיינים (מערכים של מחרוזות) ---
    contains = db.Column(JSONB, default=[])  # React: contains (e.g., ["milk", "nuts"])
    may_contain = db.Column(JSONB, default=[])  # React: mayContain
    properties = db.Column(JSONB, default=[])  # React: properties (e.g., ["vegan", "kosher"])

    # --- הערות צוות רפואי ---
    allergy_notes = db.Column(db.Text)  # Excel: הערות אלרגיה
    forbidden_for = db.Column(db.String(200))  # Excel: למי אסור

    # --- וקטורים לבינה מלאכותית (AI / ML) ---
    # וקטור קטן בגודל 6 המייצג את הערכים התזונתיים עבור אלגוריתמים כמו K-Means
    nutrition_vector = db.Column(Vector(6))

    # וקטור גדול בגודל 1536 עבור חיפוש סמנטי בשפה טבעית (OpenAI)
    openai_embedding = db.Column(Vector(1536))

    # --- בקרה ומעקב (Audit) ---
    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)