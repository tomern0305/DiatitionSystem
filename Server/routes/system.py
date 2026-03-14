from flask import Blueprint, jsonify, send_from_directory, current_app
from models import db
from sqlalchemy import text

system_bp = Blueprint('system_bp', __name__)

@system_bp.route('/api/status', methods=['GET'])
def status():
    """Simple health check route to verify server status."""
    return jsonify({"status": "Flask is running and connected to PostgreSQL!"})

@system_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serves locally uploaded files (legacy use-case)."""
    return send_from_directory(current_app.config.get('UPLOAD_FOLDER', 'uploads'), filename)

@system_bp.route('/api/run-migrations', methods=['GET'])
def run_migrations():
    """
    Run database migrations manually to add missing columns in production
    without dropping the tables.
    """
    try:
        # Add company column if it doesn't exist
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS company VARCHAR(100);"))
        
        # Add created_at column if it doesn't exist
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        
        # Add updated_at column if it doesn't exist
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))

        # Add texture_notes and forbidden_for if they don't exist
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS texture_notes TEXT;"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS allergy_notes TEXT;"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS forbidden_for VARCHAR(200);"))

        # Add texture_id column if it doesn't exist
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS texture_id INTEGER REFERENCES textures(id);"))

        # Nutrition vector and openai embedding
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS nutrition_vector vector(6);"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS openai_embedding vector(1536);"))

        # Create meals table if it doesn't exist
        db.session.execute(text("""
            CREATE TABLE IF NOT EXISTS meals (
                id SERIAL PRIMARY KEY,
                name VARCHAR(200) NOT NULL,
                description TEXT,
                diet_id INTEGER REFERENCES diets(id) ON DELETE SET NULL,
                product_ids JSONB DEFAULT '[]',
                total_calories FLOAT DEFAULT 0,
                total_protein  FLOAT DEFAULT 0,
                total_carbs    FLOAT DEFAULT 0,
                total_fat      FLOAT DEFAULT 0,
                total_sugars   FLOAT DEFAULT 0,
                total_sodium   FLOAT DEFAULT 0,
                filter_restriction_ids  JSONB DEFAULT '[]',
                filter_texture_ids      JSONB DEFAULT '[]',
                filter_show_may_contain BOOLEAN DEFAULT FALSE,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );
        """))

        db.session.commit()
        return jsonify({"message": "Database migrations completed successfully!"}), 200
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Migration failed: {str(e)}"}), 500
