from flask import Blueprint, jsonify, request, Response
import pandas as pd
from models import db, Diet

diets_bp = Blueprint('diets_bp', __name__)

@diets_bp.route('/api/diets', methods=['GET'])
def get_diets():
    """Retrieves all food diets definitions."""
    diets = Diet.query.all()
    return jsonify([{"id": s.id, "name": s.name} for s in diets])

@diets_bp.route('/api/diets/table', methods=['GET'])
def get_diets_table():
    """Retrieves diets table as csv file."""
    diets = Diet.query.all()
    data = [{"Diet": d.name} for d in diets]
    df = pd.DataFrame(data)

    csv_data = df.to_csv(index=False, encoding='utf-8-sig')
    
    response = Response(
        csv_data, 
        mimetype="text/csv; charset=utf-8-sig",  
        headers={"Content-Disposition": "attachment;filename=diets_table.csv"}
    )
    return response

@diets_bp.route('/api/diets/upload', methods=['POST'])
def upload_diets():
    """Uploads a CSV file of diets, ignoring duplicates."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        df = pd.read_csv(file)
        if "Diet" not in df.columns:
            return jsonify({"error": "CSV must contain a 'Diet' column"}), 400
            
        added_count = 0
        existing_diets = {d.name.strip().lower() for d in Diet.query.all()}
        
        for index, row in df.iterrows():
            diet_name = str(row["Diet"]).strip()
            if not diet_name or diet_name.lower() == 'nan':
                continue
                
            diet_name_lower = diet_name.lower()
            if diet_name_lower not in existing_diets:
                new_diet = Diet(name=diet_name)
                db.session.add(new_diet)
                existing_diets.add(diet_name_lower)
                added_count += 1
                
        db.session.commit()
        return jsonify({"message": f"הועלו בהצלחה {added_count} דיאטות חדשות.", "added": added_count}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@diets_bp.route('/api/diets', methods=['POST'])
def add_diet():
    """Creates a new food diet definition."""
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"error": "Diet name is required"}), 400
        
    if Diet.query.filter_by(name=name).first():
        return jsonify({"error": "Diet already exists"}), 400
        
    new_diet = Diet(name=name)
    db.session.add(new_diet)
    db.session.commit()
    return jsonify({"message": "Diet created", "id": new_diet.id}), 201

@diets_bp.route('/api/diets/<int:diet_id>', methods=['PUT'])
def update_diet(diet_id):
    """Updates the name of an existing diet."""
    diet = Diet.query.get(diet_id)
    if not diet:
        return jsonify({"error": "Diet not found"}), 404
        
    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({"error": "New name is required"}), 400
        
    existing = Diet.query.filter_by(name=new_name).first()
    if existing and existing.id != diet_id:
        return jsonify({"error": "Diet name already exists"}), 400
        
    diet.name = new_name
    db.session.commit()
    return jsonify({"message": "Diet updated"})

@diets_bp.route('/api/diets/<int:diet_id>', methods=['DELETE'])
def delete_diet(diet_id):
    """Deletes an existing diet from the database."""
    diet = Diet.query.get(diet_id)
    if not diet:
        return jsonify({"error": "Diet not found"}), 404
        
    db.session.delete(diet)
    db.session.commit()
    return jsonify({"message": "Diet deleted"})
