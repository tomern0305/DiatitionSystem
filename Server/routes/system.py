import os
import io
import zipfile
import uuid
import requests
import json
import pandas as pd
from flask import Blueprint, jsonify, send_from_directory, current_app, request, Response
from werkzeug.utils import secure_filename
from sqlalchemy import text
from supabase import create_client, Client

from models import db, FoodItem, Category, Sensitivity, Texture, Diet

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
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS company VARCHAR(100);"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP;"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS texture_notes TEXT;"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS allergy_notes TEXT;"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS forbidden_for VARCHAR(200);"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS texture_id INTEGER REFERENCES textures(id);"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS nutrition_vector vector(6);"))
        db.session.execute(text("ALTER TABLE food_items ADD COLUMN IF NOT EXISTS openai_embedding vector(1536);"))
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

# ================= Backup and Restore (ZIP) =================

@system_bp.route('/api/system/export', methods=['GET'])
def export_database():
    """Exports all entities into CSVs and packages all Supabase images into an 'images' folder inside the ZIP."""
    try:
        memory_file = io.BytesIO()
        
        with zipfile.ZipFile(memory_file, 'w', zipfile.ZIP_DEFLATED) as zf:
            
            # 1. Categories
            categories = Category.query.all()
            df_cat = pd.DataFrame([{"id": c.id, "name": c.name} for c in categories])
            zf.writestr('categories.csv', df_cat.to_csv(index=False).encode('utf-8-sig'))
            
            # 2. Sensitivities
            sensitivities = Sensitivity.query.all()
            df_sen = pd.DataFrame([{"id": s.id, "name": s.name} for s in sensitivities])
            zf.writestr('sensitivities.csv', df_sen.to_csv(index=False).encode('utf-8-sig'))
            
            # 3. Textures
            textures = Texture.query.all()
            df_tex = pd.DataFrame([{"id": t.id, "name": t.name} for t in textures])
            zf.writestr('textures.csv', df_tex.to_csv(index=False).encode('utf-8-sig'))
            
            # 4. Diets
            diets = Diet.query.all()
            df_diet = pd.DataFrame([{"id": d.id, "name": d.name} for d in diets])
            zf.writestr('diets.csv', df_diet.to_csv(index=False).encode('utf-8-sig'))
            
            # 5. FoodItems
            products = FoodItem.query.all()
            prod_data = []

            for p in products:
                # Handle Image download into ZIP
                local_image_path = ""
                if p.image_url and p.image_url.startswith("http"):
                    try:
                        resp = requests.get(p.image_url, stream=True, timeout=5)
                        if resp.status_code == 200:
                            ext = p.image_url.split('.')[-1]
                            if len(ext) > 4 or '?' in ext: ext = 'jpg'
                            local_image_path = f"images/{p.id}_{uuid.uuid4().hex[:6]}.{ext}"
                            # Write raw image bytes directly into the zip file
                            zf.writestr(local_image_path, resp.content)
                    except Exception as e:
                        print(f"Failed to fetch image for export: {p.image_url} -> {e}")

                prod_data.append({
                    "id": p.id,
                    "name": p.name,
                    "category_id": p.category_id,
                    "image_url": local_image_path if local_image_path else p.image_url,
                    "iddsi": p.iddsi,
                    "calories": p.calories,
                    "protein": p.protein,
                    "carbs": p.carbs,
                    "fat": p.fat,
                    "sugars": p.sugars,
                    "sodium": p.sodium,
                    "contains": json.dumps(p.contains, ensure_ascii=False) if p.contains else "[]",
                    "may_contain": json.dumps(p.may_contain, ensure_ascii=False) if p.may_contain else "[]",
                    "texture_id": p.texture_id,
                    "properties": json.dumps(p.properties, ensure_ascii=False) if p.properties else "[]",
                    "company": p.company,
                    "texture_notes": p.texture_notes,
                    "allergy_notes": p.allergy_notes,
                    "forbidden_for": p.forbidden_for
                })
            df_prod = pd.DataFrame(prod_data)
            zf.writestr('products.csv', df_prod.to_csv(index=False).encode('utf-8-sig'))

        memory_file.seek(0)
        
        return Response(
            memory_file,
            mimetype="application/zip",
            headers={"Content-Disposition": "attachment;filename=database_backup.zip"}
        )
    except Exception as e:
        return jsonify({"error": f"Export failed: {str(e)}"}), 500

@system_bp.route('/api/system/import', methods=['POST'])
def import_database():
    """Imports CSV data and pushes bundled images directly from the ZIP into Supabase."""
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No selected file"}), 400
        
    try:
        supabase_url = os.environ.get("SUPABASE_URL", "")
        supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
        supabase: Client = None
        if supabase_url and supabase_key:
            supabase = create_client(supabase_url, supabase_key)
            
        with zipfile.ZipFile(file, 'r') as zf:
            file_names = zf.namelist()
            
            def read_csv_from_zip(filename):
                if filename in file_names:
                    with zf.open(filename) as f:
                        return pd.read_csv(f)
                return None

            cat_id_map = {}
            tex_id_map = {}
            
            # --- 1. Categories ---
            df_cat = read_csv_from_zip('categories.csv')
            cat_added = 0
            if df_cat is not None and not df_cat.empty:
                existing_cats = {c.name.strip().lower(): c for c in Category.query.all()}
                for _, row in df_cat.iterrows():
                    old_id = row.get("id")
                    name = str(row["name"]).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() in existing_cats:
                        cat_id_map[old_id] = existing_cats[name.lower()].id
                    else:
                        new_cat = Category(name=name)
                        db.session.add(new_cat)
                        db.session.flush()
                        cat_id_map[old_id] = new_cat.id
                        existing_cats[name.lower()] = new_cat
                        cat_added += 1

            # --- 2. Sensitivities ---
            df_sen = read_csv_from_zip('sensitivities.csv')
            sen_added = 0
            if df_sen is not None and not df_sen.empty:
                existing_sens = {s.name.strip().lower() for s in Sensitivity.query.all()}
                for _, row in df_sen.iterrows():
                    name = str(row["name"]).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() not in existing_sens:
                        db.session.add(Sensitivity(name=name))
                        existing_sens.add(name.lower())
                        sen_added += 1

            # --- 3. Textures ---
            df_tex = read_csv_from_zip('textures.csv')
            tex_added = 0
            if df_tex is not None and not df_tex.empty:
                existing_tex = {t.name.strip().lower(): t for t in Texture.query.all()}
                for _, row in df_tex.iterrows():
                    old_id = row.get("id")
                    name = str(row["name"]).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() in existing_tex:
                        tex_id_map[old_id] = existing_tex[name.lower()].id
                    else:
                        new_tex = Texture(name=name)
                        db.session.add(new_tex)
                        db.session.flush()
                        tex_id_map[old_id] = new_tex.id
                        existing_tex[name.lower()] = new_tex
                        tex_added += 1

            # --- 4. Diets ---
            df_diet = read_csv_from_zip('diets.csv')
            diet_added = 0
            if df_diet is not None and not df_diet.empty:
                existing_diets = {d.name.strip().lower() for d in Diet.query.all()}
                for _, row in df_diet.iterrows():
                    name = str(row["name"]).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() not in existing_diets:
                        db.session.add(Diet(name=name))
                        existing_diets.add(name.lower())
                        diet_added += 1

            db.session.commit()

            # --- 5. FoodItems ---
            df_prod = read_csv_from_zip('products.csv')
            prod_added = 0
            if df_prod is not None and not df_prod.empty:
                existing_prods_names = {p.name.strip().lower() for p in FoodItem.query.all()}
                
                for _, row in df_prod.iterrows():
                    name = str(row.get("name", "")).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() in existing_prods_names: continue
                    
                    old_cat_id = row.get("category_id")
                    old_tex_id = row.get("texture_id")
                    
                    new_cat_id = cat_id_map.get(old_cat_id) if pd.notna(old_cat_id) else None
                    new_tex_id = tex_id_map.get(old_tex_id) if pd.notna(old_tex_id) else None

                    # Handle image uploading if we have a locally zipped image or URL
                    image_url = str(row.get("image_url", ""))
                    final_image_url = ""
                    
                    if image_url and image_url.lower() != 'nan':
                        if image_url.startswith("images/") and image_url in file_names and supabase:
                            # Read raw byte data directly from the uploaded zip
                            img_data = zf.read(image_url)
                            ext = image_url.split('.')[-1]
                            unique_filename = f"{uuid.uuid4().hex}_imported.{ext}"
                            mime_type = f"image/{ext}" if ext != 'jpg' else 'image/jpeg'
                            
                            try:
                                supabase.storage.from_("products").upload(
                                    path=unique_filename,
                                    file=img_data,
                                    file_options={"content-type": mime_type}
                                )
                                final_image_url = supabase.storage.from_("products").get_public_url(unique_filename)
                            except Exception as e:
                                print(f"Failed to upload packaged image {image_url} to supabase: {e}")
                        elif image_url.startswith("http"):
                            # Fallback if the user uploaded an older zip that relies on external URLs
                            final_image_url = image_url

                    def parse_json_col(val):
                        if pd.isna(val): return []
                        try: return json.loads(val)
                        except: return []

                    new_prod = FoodItem(
                        name=name,
                        category_id=new_cat_id,
                        image_url=final_image_url,
                        iddsi=row.get("iddsi", 0) if pd.notna(row.get("iddsi")) else 0,
                        calories=row.get("calories", 0) if pd.notna(row.get("calories")) else 0,
                        protein=row.get("protein", 0) if pd.notna(row.get("protein")) else 0,
                        carbs=row.get("carbs", 0) if pd.notna(row.get("carbs")) else 0,
                        fat=row.get("fat", 0) if pd.notna(row.get("fat")) else 0,
                        sugars=row.get("sugars", 0) if pd.notna(row.get("sugars")) else 0,
                        sodium=row.get("sodium", 0) if pd.notna(row.get("sodium")) else 0,
                        contains=parse_json_col(row.get("contains")),
                        may_contain=parse_json_col(row.get("may_contain")),
                        texture_id=new_tex_id,
                        properties=parse_json_col(row.get("properties")),
                        company=row.get("company", "") if pd.notna(row.get("company")) else "",
                        texture_notes=row.get("texture_notes", "") if pd.notna(row.get("texture_notes")) else "",
                        allergy_notes=row.get("allergy_notes", "") if pd.notna(row.get("allergy_notes")) else "",
                        forbidden_for=row.get("forbidden_for", "") if pd.notna(row.get("forbidden_for")) else "",
                    )
                    db.session.add(new_prod)
                    existing_prods_names.add(name.lower())
                    prod_added += 1
                
                db.session.commit()

        return jsonify({
            "message": "ייבוא הושלם בהצלחה!",
            "details": {
                "categories_added": cat_added,
                "sensitivities_added": sen_added,
                "textures_added": tex_added,
                "diets_added": diet_added,
                "products_added": prod_added
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Import failed: {str(e)}"}), 500
