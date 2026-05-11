"""Database models for the Dietitian System using SQLAlchemy."""

from flask_sqlalchemy import SQLAlchemy
from pgvector.sqlalchemy import Vector
from sqlalchemy.dialects.postgresql import JSONB
from datetime import datetime

db = SQLAlchemy()

class Category(db.Model):
    """Represents a product category (e.g., Dairy, Meat)."""
    __tablename__ = 'categories'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to food items
    food_items = db.relationship('FoodItem', backref='category_rel', lazy=True)

class Sensitivity(db.Model):
    """Represents a dietary sensitivity, allergen, or property (e.g., Gluten, Vegan)."""
    __tablename__ = 'sensitivities'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class Texture(db.Model):
    """Represents a food texture type (e.g., IDDSI standards)."""
    __tablename__ = 'textures'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

    # Relationship to food items
    food_items = db.relationship('FoodItem', backref='texture_rel', lazy=True)

class Diet(db.Model):
    """Represents a food diet type (e.g., IDDSI standards)."""
    __tablename__ = 'diets'

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(100), nullable=False, unique=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)

class FoodItem(db.Model):
    """Represents a food product with nutritional values, properties, and AI vectors."""
    __tablename__ = 'food_items'

    # --- מידע בסיסי ---
    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(200), nullable=False)  # React: name | Excel: שם המזון
    image_url = db.Column(db.String(500))  # React: image
    category_id = db.Column(db.Integer, db.ForeignKey('categories.id'), nullable=True)  # References categories.id
    texture_id = db.Column(db.Integer, db.ForeignKey('textures.id'), nullable=True)  # References textures.id
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


class User(db.Model):
    """System user with role-based access (admin, dietitian, lineworker)."""
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(100), nullable=False, unique=True)
    password_hash = db.Column(db.String(200), nullable=False)
    # Role: 'admin' | 'dietitian' | 'lineworker'
    role = db.Column(db.String(50), nullable=False, default='lineworker')
    must_change_password = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=datetime.utcnow)


class Meal(db.Model):
    """Represents a composed meal built from food items, including its nutritional summary and the filter state used at creation."""
    __tablename__ = 'meals'

    id          = db.Column(db.Integer, primary_key=True)
    name        = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, nullable=True)

    # FK to Diet — optional; a meal may not belong to any diet
    diet_id = db.Column(db.Integer, db.ForeignKey('diets.id'), nullable=True)
    diet    = db.relationship('Diet', backref='meals', lazy=True)

    # Ordered list of food_item IDs that make up this meal (JSONB preserves order)
    product_ids = db.Column(JSONB, default=[])

    # ── Pre-computed nutrition totals (snapshot at save time) ────────────────
    total_calories = db.Column(db.Float, default=0.0)
    total_protein  = db.Column(db.Float, default=0.0)
    total_carbs    = db.Column(db.Float, default=0.0)
    total_fat      = db.Column(db.Float, default=0.0)
    total_sugars   = db.Column(db.Float, default=0.0)
    total_sodium   = db.Column(db.Float, default=0.0)

    # ── Filter state that was active when the meal was created ───────────────
    # IDs of the sensitivity (allergy) filters that were selected
    filter_restriction_ids = db.Column(JSONB, default=[])
    # ID(s) of the texture filters that were selected (usually 0 or 1 item)
    filter_texture_ids     = db.Column(JSONB, default=[])
    # Whether "may contain" products were included in the library at save time
    filter_show_may_contain = db.Column(db.Boolean, default=False)

    # Ownership & visibility
    created_by = db.Column(db.Integer, db.ForeignKey('users.id'), nullable=True)
    is_global  = db.Column(db.Boolean, nullable=False, default=True)

    created_at = db.Column(db.DateTime, default=datetime.utcnow)
    updated_at = db.Column(db.DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)