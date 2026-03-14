from flask import Blueprint, jsonify, request, Response
import pandas as pd
from models import db, Texture

textures_bp = Blueprint('textures_bp', __name__)

@textures_bp.route('/api/texture', methods=['GET'])
def get_textures():
    """Retrieves all food texture definitions."""
    textures = Texture.query.all()
    return jsonify([{"id": s.id, "name": s.name} for s in textures])

@textures_bp.route('/api/texture/table', methods=['GET'])
def get_textures_table():
    """Retrieves textures table as csv file."""
    textures = Texture.query.all()
    data = [{"Texture": t.name} for t in textures]
    df = pd.DataFrame(data)

    csv_data = df.to_csv(index=False, encoding='utf-8-sig')
    
    response = Response(
        csv_data, 
        mimetype="text/csv; charset=utf-8-sig",  
        headers={"Content-Disposition": "attachment;filename=textures_table.csv"}
    )
    return response

@textures_bp.route('/api/texture/upload', methods=['POST'])
def upload_textures():
    """Uploads a CSV file of textures, ignoring duplicates."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        df = pd.read_csv(file)
        if "Texture" not in df.columns:
            return jsonify({"error": "CSV must contain a 'Texture' column"}), 400
            
        added_count = 0
        existing_textures = {t.name.strip().lower() for t in Texture.query.all()}
        
        for index, row in df.iterrows():
            texture_name = str(row["Texture"]).strip()
            if not texture_name or texture_name.lower() == 'nan':
                continue
                
            texture_name_lower = texture_name.lower()
            if texture_name_lower not in existing_textures:
                new_texture = Texture(name=texture_name)
                db.session.add(new_texture)
                existing_textures.add(texture_name_lower)
                added_count += 1
                
        db.session.commit()
        return jsonify({"message": f"הועלו בהצלחה {added_count} מרקמים חדשים.", "added": added_count}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@textures_bp.route('/api/texture', methods=['POST'])
def add_texture():
    """Creates a new food texture definition."""
    data = request.json
    name = data.get('name')
    if not name:
        return jsonify({"error": "Texture name is required"}), 400
        
    if Texture.query.filter_by(name=name).first():
        return jsonify({"error": "Texture already exists"}), 400
        
    new_texture = Texture(name=name)
    db.session.add(new_texture)
    db.session.commit()
    return jsonify({"message": "Texture created", "id": new_texture.id}), 201

@textures_bp.route('/api/texture/<int:texture_id>', methods=['PUT'])
def update_texture(texture_id):
    """Updates the name of an existing texture."""
    texture = Texture.query.get(texture_id)
    if not texture:
        return jsonify({"error": "Texture not found"}), 404
        
    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({"error": "New name is required"}), 400
        
    existing = Texture.query.filter_by(name=new_name).first()
    if existing and existing.id != texture_id:
        return jsonify({"error": "Texture name already exists"}), 400
        
    texture.name = new_name
    db.session.commit()
    return jsonify({"message": "Texture updated"})

@textures_bp.route('/api/texture/<int:texture_id>', methods=['DELETE'])
def delete_texture(texture_id):
    """Deletes an existing texture from the database."""
    texture = Texture.query.get(texture_id)
    if not texture:
        return jsonify({"error": "Texture not found"}), 404
        
    db.session.delete(texture)
    db.session.commit()
    return jsonify({"message": "Texture deleted"})
