from flask import Blueprint, jsonify, request, Response
import pandas as pd
from models import db, Category, FoodItem

categories_bp = Blueprint('categories_bp', __name__)

@categories_bp.route('/api/categories', methods=['GET'])
def get_categories():
    """Retrieves all product categories."""
    categories = Category.query.all()
    return jsonify([{"id": c.id, "name": c.name} for c in categories])

@categories_bp.route('/api/categories/table', methods=['GET'])
def get_categories_table():
    """Retrieves categories table as csv file."""
    categories = Category.query.all()
    data = [{"Category": c.name} for c in categories]
    df = pd.DataFrame(data)

    csv_data = df.to_csv(index=False, encoding='utf-8-sig')
    
    response = Response(
        csv_data, 
        mimetype="text/csv; charset=utf-8-sig",  
        headers={"Content-Disposition": "attachment;filename=categories_table.csv"}
    )
    return response

@categories_bp.route('/api/categories/upload', methods=['POST'])
def upload_categories():
    """Uploads a CSV file of categories, ignoring duplicates."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        df = pd.read_csv(file)
        
        if "Category" not in df.columns:
            return jsonify({"error": "CSV must contain a 'Category' column"}), 400
            
        added_count = 0
        existing_categories = {c.name.strip().lower() for c in Category.query.all()}
        
        for index, row in df.iterrows():
            cat_name = str(row["Category"]).strip()
            if not cat_name or cat_name.lower() == 'nan':
                continue
                
            cat_name_lower = cat_name.lower()
            if cat_name_lower not in existing_categories:
                new_category = Category(name=cat_name)
                db.session.add(new_category)
                existing_categories.add(cat_name_lower)
                added_count += 1
                
        db.session.commit()
        return jsonify({"message": f"הועלו בהצלחה {added_count} קטגוריות חדשות.", "added": added_count}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@categories_bp.route('/api/categories', methods=['POST'])
def add_category():
    """Creates a new product category."""
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

@categories_bp.route('/api/categories/<int:cat_id>', methods=['PUT'])
def update_category(cat_id):
    """Updates the name of an existing product category."""
    cat = Category.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Category not found"}), 404
        
    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({"error": "New name is required"}), 400
        
    existing = Category.query.filter_by(name=new_name).first()
    if existing and existing.id != cat_id:
        return jsonify({"error": "Category name already exists"}), 400
        
    cat.name = new_name
    db.session.commit()
    return jsonify({"message": "Category updated"})

@categories_bp.route('/api/categories/<int:cat_id>', methods=['DELETE'])
def delete_category(cat_id):
    """Deletes a product category, but only if it contains no products."""
    cat = Category.query.get(cat_id)
    if not cat:
        return jsonify({"error": "Category not found"}), 404
        
    if FoodItem.query.filter_by(category_id=cat_id).first():
        return jsonify({"error": "Cannot delete category that contains products"}), 400
        
    db.session.delete(cat)
    db.session.commit()
    return jsonify({"message": "Category deleted"})
