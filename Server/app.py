import os
import uuid
from flask import Flask, jsonify, request, send_from_directory
from flask_cors import CORS
from werkzeug.utils import secure_filename
from models import db, FoodItem, Category, Sensitivity
from sqlalchemy import text
from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))
app = Flask(__name__)
CORS(app)

# The Connection String: Tells SQLAlchemy exactly where the Docker DB is
# Format: postgresql://username:password@host:port/database_name
app.config['SQLALCHEMY_DATABASE_URI'] = os.environ.get(
    'DATABASE_URL',
    'postgresql://admin:secretpassword@localhost:5432/hospital_system'
)
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False

# Setup Upload Folder
UPLOAD_FOLDER = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'uploads')
os.makedirs(UPLOAD_FOLDER, exist_ok=True)
app.config['UPLOAD_FOLDER'] = UPLOAD_FOLDER

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

@app.route('/api/products', methods=['GET'])
def get_products():
    products = FoodItem.query.all()
    result = []
    for p in products:
        category_name = p.category_rel.name if p.category_rel else 'כללי'
        result.append({
            "id": str(p.id),
            "category": category_name,
            "category_id": p.category_id,
            "image": p.image_url,
            "name": p.name,
            "iddsi": p.iddsi,
            "calories": p.calories,
            "protein": p.protein,
            "carbs": p.carbs,
            "fat": p.fat,
            "sugares": p.sugars,
            "sodium": p.sodium,
            "contains": p.contains,
            "mayContain": p.may_contain,
            "properties": p.properties,
            "lastEditDate": p.updated_at.strftime('%Y-%m-%d %H:%M:%S')
        })
    return jsonify(result)

# ================= Image Upload API =================

@app.route('/uploads/<filename>')
def uploaded_file(filename):
    return send_from_directory(app.config['UPLOAD_FOLDER'], filename)

@app.route('/api/upload', methods=['POST'])
def upload_image():
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        # Use UUID to prevent name collisions
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        file_path = os.path.join(app.config['UPLOAD_FOLDER'], unique_filename)
        file.save(file_path)
        
        # Return the absolute URL pointing to this Flask server
        image_url = f"{request.host_url}uploads/{unique_filename}"
        return jsonify({"imageUrl": image_url}), 200

# ================= Products API =================

@app.route('/api/products', methods=['POST'])
def add_product():
    data = request.json
    
    new_product = FoodItem(
        name=data.get('name', ''),
        category_id=data.get('category_id', None),
        image_url=data.get('image', ''),
        iddsi=data.get('iddsi', 0),
        calories=data.get('calories', 0.0),
        protein=data.get('protein', 0.0),
        carbs=data.get('carbs', 0.0),
        fat=data.get('fat', 0.0),
        sugars=data.get('sugares', 0.0), # Note: React uses sugares
        sodium=data.get('sodium', 0.0),
        contains=data.get('contains', []),
        may_contain=data.get('mayContain', []),
        properties=data.get('properties', [])
    )
    
    try:
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully", "id": new_product.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/products/<int:prod_id>', methods=['PUT'])
def update_product(prod_id):
    product = FoodItem.query.get(prod_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    data = request.json
    try:
        if 'name' in data: product.name = data['name']
        if 'category_id' in data: product.category_id = data['category_id']
        if 'image' in data: product.image_url = data['image']
        if 'iddsi' in data: product.iddsi = data['iddsi']
        if 'calories' in data: product.calories = data['calories']
        if 'protein' in data: product.protein = data['protein']
        if 'carbs' in data: product.carbs = data['carbs']
        if 'fat' in data: product.fat = data['fat']
        if 'sugares' in data: product.sugars = data['sugares']
        if 'sodium' in data: product.sodium = data['sodium']
        if 'contains' in data: product.contains = data['contains']
        if 'mayContain' in data: product.may_contain = data['mayContain']
        if 'properties' in data: product.properties = data['properties']
        
        db.session.commit()
        return jsonify({"message": "Product updated successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@app.route('/api/products/<int:prod_id>', methods=['DELETE'])
def delete_product(prod_id):
    product = FoodItem.query.get(prod_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    try:
        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

# ================= Categories API =================

@app.route('/api/categories', methods=['GET'])
def get_categories():
    categories = Category.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in categories])

@app.route('/api/categories', methods=['POST'])
def add_category():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"error": "Category name is required"}), 400
        
    if Category.query.filter_by(name=name).first():
        return jsonify({"error": "Category already exists"}), 400
        
    new_cat = Category(name=name)
    db.session.add(new_cat)
    db.session.commit()
    return jsonify({"message": "Category created", "id": new_cat.id}), 201

@app.route('/api/categories/<int:cat_id>', methods=['PUT'])
def update_category(cat_id):
    cat = Category.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Category not found"}), 404
        
    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({"error": "New name is required"}), 400
        
    # Check if name already taken by another category
    existing = Category.query.filter_by(name=new_name).first()
    if existing and existing.id != cat_id:
        return jsonify({"error": "Category name already exists"}), 400
        
    cat.name = new_name
    db.session.commit()
    return jsonify({"message": "Category updated"})

@app.route('/api/categories/<int:cat_id>', methods=['DELETE'])
def delete_category(cat_id):
    cat = Category.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Category not found"}), 404
        
    if FoodItem.query.filter_by(category_id=cat_id).first():
        return jsonify({"error": "Cannot delete category that contains products"}), 400
        
    db.session.delete(cat)
    db.session.commit()
    return jsonify({"message": "Category deleted"})

# ================= Sensitivities API =================

@app.route('/api/sensitivities', methods=['GET'])
def get_sensitivities():
    sensitivities = Sensitivity.query.all()
    return jsonify([{"id": s.id, "name": s.name} for s in sensitivities])

@app.route('/api/sensitivities', methods=['POST'])
def add_sensitivity():
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"error": "Sensitivity name is required"}), 400
        
    if Sensitivity.query.filter_by(name=name).first():
        return jsonify({"error": "Sensitivity already exists"}), 400
        
    new_sens = Sensitivity(name=name)
    db.session.add(new_sens)
    db.session.commit()
    return jsonify({"message": "Sensitivity created", "id": new_sens.id}), 201

@app.route('/api/sensitivities/<int:sens_id>', methods=['PUT'])
def update_sensitivity(sens_id):
    sens = Sensitivity.query.get(sens_id)
    if not sens:
        return jsonify({"error": "Sensitivity not found"}), 404
        
    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({"error": "New name is required"}), 400
        
    # Check if name already taken by another sensitivity
    existing = Sensitivity.query.filter_by(name=new_name).first()
    if existing and existing.id != sens_id:
        return jsonify({"error": "Sensitivity name already exists"}), 400
        
    sens.name = new_name
    db.session.commit()
    return jsonify({"message": "Sensitivity updated"})

@app.route('/api/sensitivities/<int:sens_id>', methods=['DELETE'])
def delete_sensitivity(sens_id):
    sens = Sensitivity.query.get(sens_id)
    if not sens:
        return jsonify({"error": "Sensitivity not found"}), 404
        
    db.session.delete(sens)
    db.session.commit()
    return jsonify({"message": "Sensitivity deleted"})

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)