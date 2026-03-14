from flask import Blueprint, jsonify, request, Response
import pandas as pd
from models import db, Sensitivity

sensitivities_bp = Blueprint('sensitivities_bp', __name__)

@sensitivities_bp.route('/api/sensitivities', methods=['GET'])
def get_sensitivities():
    """Retrieves all dietary sensitivities and allergies."""
    sensitivities = Sensitivity.query.all()
    return jsonify([{"id": s.id, "name": s.name} for s in sensitivities])

@sensitivities_bp.route('/api/sensitivities/table', methods=['GET'])
def get_sensitivities_table():
    """Retrieves sensitivities table as csv file."""
    sensitivities = Sensitivity.query.all()
    data = [{"Sensitivity": s.name} for s in sensitivities]
    df = pd.DataFrame(data)

    csv_data = df.to_csv(index=False, encoding='utf-8-sig')
    
    response = Response(
        csv_data, 
        mimetype="text/csv; charset=utf-8-sig",  
        headers={"Content-Disposition": "attachment;filename=sensitivities_table.csv"}
    )
    return response

@sensitivities_bp.route('/api/sensitivities/upload', methods=['POST'])
def upload_sensitivities():
    """Uploads a CSV file of sensitivities, ignoring duplicates."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        df = pd.read_csv(file)
        if "Sensitivity" not in df.columns:
            return jsonify({"error": "CSV must contain a 'Sensitivity' column"}), 400
            
        added_count = 0
        existing_sensitivities = {s.name.strip().lower() for s in Sensitivity.query.all()}
        
        for index, row in df.iterrows():
            sens_name = str(row["Sensitivity"]).strip()
            if not sens_name or sens_name.lower() == 'nan':
                continue
                
            sens_name_lower = sens_name.lower()
            if sens_name_lower not in existing_sensitivities:
                new_sens = Sensitivity(name=sens_name)
                db.session.add(new_sens)
                existing_sensitivities.add(sens_name_lower)
                added_count += 1
                
        db.session.commit()
        return jsonify({"message": f"הועלו בהצלחה {added_count} רגישויות חדשות.", "added": added_count}), 200
        
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

@sensitivities_bp.route('/api/sensitivities', methods=['POST'])
def add_sensitivity():
    """Creates a new dietary sensitivity or allergy property."""
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

@sensitivities_bp.route('/api/sensitivities/<int:sens_id>', methods=['PUT'])
def update_sensitivity(sens_id):
    """Updates the name of an existing sensitivity."""
    sens = Sensitivity.query.get(sens_id)
    if not sens:
        return jsonify({"error": "Sensitivity not found"}), 404
        
    data = request.json
    new_name = data.get('name')
    if not new_name:
        return jsonify({"error": "New name is required"}), 400
        
    existing = Sensitivity.query.filter_by(name=new_name).first()
    if existing and existing.id != sens_id:
        return jsonify({"error": "Sensitivity name already exists"}), 400
        
    sens.name = new_name
    db.session.commit()
    return jsonify({"message": "Sensitivity updated"})

@sensitivities_bp.route('/api/sensitivities/<int:sens_id>', methods=['DELETE'])
def delete_sensitivity(sens_id):
    """Deletes an existing sensitivity from the database."""
    sens = Sensitivity.query.get(sens_id)
    if not sens:
        return jsonify({"error": "Sensitivity not found"}), 404
        
    db.session.delete(sens)
    db.session.commit()
    return jsonify({"message": "Sensitivity deleted"})
