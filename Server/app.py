from flask import Flask, jsonify
from models import db, FoodItem
from sqlalchemy import text

app = Flask(__name__)

# The Connection String: Tells SQLAlchemy exactly where the Docker DB is
# Format: postgresql://username:password@host:port/database_name
app.config['SQLALCHEMY_DATABASE_URI'] = 'postgresql://admin:secretpassword@localhost:5432/hospital_system'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Connect the database to this Flask app
db.init_app(app)

# Create the tables when the server starts
with app.app_context():
    # First, ensure the pgvector extension is activated in the database
    db.session.execute(text('CREATE EXTENSION IF NOT EXISTS vector'))
    db.session.commit()
    # Then, create the food_items table based on your models.py
    db.create_all()
    print("Database tables created successfully!")

# A simple test route
@app.route('/api/status', methods=['GET'])
def status():
    return jsonify({"status": "Flask is running and connected to PostgreSQL!"})

if __name__ == '__main__':
    app.run(debug=True, port=5000)