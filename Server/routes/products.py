import os
import uuid
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from models import db, FoodItem
from supabase import create_client, Client

products_bp = Blueprint('products_bp', __name__)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

@products_bp.route('/api/products', methods=['GET'])
def get_products():
    """Retrieves all food items and formats them for the frontend."""
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
            "texture": p.texture_rel.name if p.texture_rel else None,
            "texture_id": p.texture_id,
            "properties": p.properties,
            "company": p.company,
            "textureNotes": p.texture_notes,
            "allergyNotes": p.allergy_notes,
            "forbiddenFor": p.forbidden_for,
            "lastEditDate": p.updated_at.strftime('%Y-%m-%d %H:%M:%S') if p.updated_at else None
        })
    return jsonify(result)

@products_bp.route('/api/upload', methods=['POST'])
def upload_image():
    """Uploads a product image directly to the Supabase Storage 'products' bucket and returns its public URL."""
    if 'image' not in request.files:
        return jsonify({"error": "No file part"}), 400
    
    file = request.files['image']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    if file:
        filename = secure_filename(file.filename)
        # Use UUID to prevent name collisions
        unique_filename = f"{uuid.uuid4().hex}_{filename}"
        
        try:
            # Read file from memory buffer
            file_bytes = file.read()
            content_type = file.content_type
            
            # Upload to Supabase Storage bucket named 'products'
            supabase.storage.from_("products").upload(
                path=unique_filename,
                file=file_bytes,
                file_options={"content-type": content_type}
            )
            
            # Get the public URL
            public_url = supabase.storage.from_("products").get_public_url(unique_filename)
            
            return jsonify({"imageUrl": public_url}), 200
        except Exception as e:
            return jsonify({"error": f"Failed to upload image: {str(e)}"}), 500

@products_bp.route('/api/products', methods=['POST'])
def add_product():
    """Creates a new food product in the database."""
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
        texture_id=data.get('texture_id', None),
        properties=data.get('properties', []),
        company=data.get('company', ''),
        texture_notes=data.get('textureNotes', ''),
        allergy_notes=data.get('allergyNotes', ''),
        forbidden_for=data.get('forbiddenFor', '')
    )
    
    try:
        db.session.add(new_product)
        db.session.commit()
        return jsonify({"message": "Product added successfully", "id": new_product.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@products_bp.route('/api/products/<int:prod_id>', methods=['PUT'])
def update_product(prod_id):
    """Updates an existing food product's details."""
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
        if 'texture_id' in data: product.texture_id = data['texture_id']
        if 'properties' in data: product.properties = data['properties']
        if 'company' in data: product.company = data['company']
        if 'textureNotes' in data: product.texture_notes = data['textureNotes']
        if 'allergyNotes' in data: product.allergy_notes = data['allergyNotes']
        if 'forbiddenFor' in data: product.forbidden_for = data['forbiddenFor']
        
        db.session.commit()
        return jsonify({"message": "Product updated successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@products_bp.route('/api/products/<int:prod_id>', methods=['DELETE'])
def delete_product(prod_id):
    """Deletes a food product from the database and its associated image from Supabase Storage."""
    product = FoodItem.query.get(prod_id)
    if not product:
        return jsonify({"error": "Product not found"}), 404
        
    try:
        # Delete image from Supabase if it exists
        if product.image_url and "supabase.co/storage/v1/object/public/products/" in product.image_url:
            filename = product.image_url.split("/")[-1]
            try:
                supabase.storage.from_("products").remove([filename])
            except Exception as e:
                print(f"Failed to delete image from Supabase: {e}")

        db.session.delete(product)
        db.session.commit()
        return jsonify({"message": "Product and associated image deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
