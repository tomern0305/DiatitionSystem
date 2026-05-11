import os
import io
import zipfile
import uuid
import requests
import json
import pandas as pd
from flask import Blueprint, jsonify, send_from_directory, current_app, request, Response
from sqlalchemy import text
from supabase import create_client, Client

from models import db, FoodItem, Category, Sensitivity, Texture, Diet, Meal
from routes.products import build_product_embedding_pipeline
from routes.auth import verify_token

system_bp = Blueprint('system_bp', __name__)


@system_bp.route('/api/status', methods=['GET'])
def status():
    """Simple health check route to verify server status."""
    return jsonify({"status": "Flask is running and connected to PostgreSQL!"})


@system_bp.route('/api/system/backfill-embeddings', methods=['POST'])
def backfill_embeddings():
    """Recalculates openai_embedding for products with all-zero vectors; skips if AI_ENABLED is false."""
    if (err := _require_admin()): return err

    ai_enabled = os.environ.get("AI_ENABLED", "false").lower() == "true"
    if not ai_enabled:
        return jsonify({"message": "AI is disabled — skipping embedding backfill.", "updated": 0}), 200

    products = FoodItem.query.all()
    updated = 0
    errors = []
    for p in products:
        if p.openai_embedding is not None and not all(v == 0.0 for v in p.openai_embedding):
            continue
        data = {
            "name": p.name, "company": p.company, "iddsi": p.iddsi,
            "calories": p.calories, "protein": p.protein, "carbs": p.carbs,
            "fat": p.fat, "sugares": p.sugars, "sodium": p.sodium,
            "contains": p.contains, "mayContain": p.may_contain,
            "properties": p.properties, "textureNotes": p.texture_notes,
            "allergyNotes": p.allergy_notes, "forbiddenFor": p.forbidden_for,
        }
        try:
            embedding = build_product_embedding_pipeline(data)
            if embedding:
                p.openai_embedding = embedding
                updated += 1
        except Exception as e:
            errors.append({"id": p.id, "name": p.name, "error": str(e)})

    if updated:
        db.session.commit()

    return jsonify({"message": f"Backfill complete.", "updated": updated, "errors": errors}), 200


@system_bp.route('/uploads/<filename>')
def uploaded_file(filename):
    """Serves locally uploaded files (legacy use-case)."""
    return send_from_directory(current_app.config.get('UPLOAD_FOLDER', 'uploads'), filename)


@system_bp.route('/api/run-migrations', methods=['GET'])
def run_migrations():
    """Run database migrations manually to add missing columns in production."""
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
            ALTER TABLE food_items
              ADD COLUMN IF NOT EXISTS search_vector tsvector
              GENERATED ALWAYS AS (
                to_tsvector('simple',
                  coalesce(name, '') || ' ' ||
                  coalesce(company, '') || ' ' ||
                  coalesce(texture_notes, '') || ' ' ||
                  coalesce(allergy_notes, '') || ' ' ||
                  coalesce(forbidden_for, '')
                )
              ) STORED;
        """))
        db.session.execute(text(
            "CREATE INDEX IF NOT EXISTS food_items_search_vector_gin ON food_items USING GIN (search_vector);"
        ))
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


# ── Helpers ────────────────────────────────────────────────────────────────────

def _require_admin():
    """Returns a 403 response tuple when the caller is not an admin, else None."""
    payload = verify_token(request)
    if not payload or payload.get('role') != 'admin':
        return jsonify({"error": "גישה אסורה — נדרשות הרשאות מנהל"}), 403
    return None


def _parse_json_col(val):
    if pd.isna(val): return []
    try: return json.loads(val)
    except: return []


def _parse_vector_col(val):
    if pd.isna(val) or str(val).strip() == "": return None
    try: return json.loads(val)
    except: return None


# ── Export ─────────────────────────────────────────────────────────────────────

@system_bp.route('/api/system/export', methods=['GET'])
def export_database():
    """Exports all tables into a single multi-sheet Excel file bundled with images in a ZIP."""
    if (err := _require_admin()): return err
    try:
        products = FoodItem.query.all()
        meals    = Meal.query.all()

        # Backfill missing OpenAI embeddings before export
        needs_commit = False
        for p in products:
            if p.openai_embedding is None or all(v == 0.0 for v in p.openai_embedding):
                data = {
                    "name": p.name, "company": p.company, "iddsi": p.iddsi,
                    "calories": p.calories, "protein": p.protein, "carbs": p.carbs,
                    "fat": p.fat, "sugares": p.sugars, "sodium": p.sodium,
                    "contains": p.contains, "mayContain": p.may_contain,
                    "properties": p.properties, "textureNotes": p.texture_notes,
                    "allergyNotes": p.allergy_notes, "forbiddenFor": p.forbidden_for,
                }
                p.openai_embedding = build_product_embedding_pipeline(data)
                needs_commit = True
        if needs_commit:
            db.session.commit()

        # ── Build product rows + collect images ────────────────────────────
        prod_rows, image_downloads = [], []
        for p in products:
            local_path = ""
            if p.image_url and p.image_url.startswith("http"):
                try:
                    resp = requests.get(p.image_url, stream=True, timeout=5)
                    if resp.status_code == 200:
                        ext = p.image_url.split('.')[-1]
                        if len(ext) > 4 or '?' in ext: ext = 'jpg'
                        local_path = f"images/{p.id}_{uuid.uuid4().hex[:6]}.{ext}"
                        image_downloads.append((local_path, resp.content))
                except Exception as e:
                    print(f"Image fetch failed: {p.image_url} -> {e}")

            prod_rows.append({
                "id": p.id, "name": p.name, "category_id": p.category_id,
                "image_url": local_path or p.image_url or "",
                "iddsi": p.iddsi, "calories": p.calories, "protein": p.protein,
                "carbs": p.carbs, "fat": p.fat, "sugars": p.sugars, "sodium": p.sodium,
                "contains": json.dumps(p.contains or [], ensure_ascii=False),
                "may_contain": json.dumps(p.may_contain or [], ensure_ascii=False),
                "texture_id": p.texture_id,
                "properties": json.dumps(p.properties or [], ensure_ascii=False),
                "company": p.company or "", "texture_notes": p.texture_notes or "",
                "allergy_notes": p.allergy_notes or "", "forbidden_for": p.forbidden_for or "",
                "nutrition_vector": json.dumps([float(v) for v in p.nutrition_vector]) if p.nutrition_vector is not None else "",
                "openai_embedding": json.dumps([float(v) for v in p.openai_embedding]) if p.openai_embedding is not None else "",
            })

        meal_rows = [{
            "id": m.id, "name": m.name, "description": m.description or "",
            "diet_id": m.diet_id,
            "product_ids": json.dumps(m.product_ids or [], ensure_ascii=False),
            "total_calories": m.total_calories, "total_protein": m.total_protein,
            "total_carbs": m.total_carbs, "total_fat": m.total_fat,
            "total_sugars": m.total_sugars, "total_sodium": m.total_sodium,
            "filter_restriction_ids": json.dumps(m.filter_restriction_ids or [], ensure_ascii=False),
            "filter_texture_ids": json.dumps(m.filter_texture_ids or [], ensure_ascii=False),
            "filter_show_may_contain": m.filter_show_may_contain,
            "is_global": m.is_global,
            "created_by": m.created_by,
        } for m in meals]

        # ── Write all sheets into one xlsx ─────────────────────────────────
        xlsx_buf = io.BytesIO()
        with pd.ExcelWriter(xlsx_buf, engine='openpyxl') as writer:
            pd.DataFrame([{"id": c.id, "name": c.name} for c in Category.query.all()]).to_excel(writer, sheet_name='Categories', index=False)
            pd.DataFrame([{"id": s.id, "name": s.name} for s in Sensitivity.query.all()]).to_excel(writer, sheet_name='Sensitivities', index=False)
            pd.DataFrame([{"id": t.id, "name": t.name} for t in Texture.query.all()]).to_excel(writer, sheet_name='Textures', index=False)
            pd.DataFrame([{"id": d.id, "name": d.name} for d in Diet.query.all()]).to_excel(writer, sheet_name='Diets', index=False)
            pd.DataFrame(prod_rows).to_excel(writer, sheet_name='Products', index=False)
            pd.DataFrame(meal_rows).to_excel(writer, sheet_name='Meals', index=False)
        xlsx_buf.seek(0)

        # ── Bundle xlsx + images into a ZIP ────────────────────────────────
        zip_buf = io.BytesIO()
        with zipfile.ZipFile(zip_buf, 'w', zipfile.ZIP_DEFLATED) as zf:
            zf.writestr('backup.xlsx', xlsx_buf.read())
            for path, data in image_downloads:
                zf.writestr(path, data)
        zip_buf.seek(0)

        return Response(
            zip_buf,
            mimetype="application/zip",
            headers={"Content-Disposition": "attachment;filename=database_backup.zip"}
        )
    except Exception as e:
        return jsonify({"error": f"Export failed: {str(e)}"}), 500


# ── Import ─────────────────────────────────────────────────────────────────────

@system_bp.route('/api/system/import', methods=['POST'])
def import_database():
    """Imports from a backup ZIP containing backup.xlsx and an images/ folder."""
    if (err := _require_admin()): return err
    if 'file' not in request.files:
        return jsonify({"error": "No file part"}), 400
    file = request.files['file']
    if not file.filename:
        return jsonify({"error": "No selected file"}), 400

    try:
        supabase_url = os.environ.get("SUPABASE_URL", "")
        supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
        supabase: Client = None
        if supabase_url and supabase_key:
            supabase = create_client(supabase_url, supabase_key)

        with zipfile.ZipFile(file, 'r') as zf:
            zip_names = zf.namelist()
            sheets = pd.read_excel(io.BytesIO(zf.read('backup.xlsx')), sheet_name=None)

            def get_sheet(name):
                df = sheets.get(name)
                return df if df is not None and not df.empty else None

            cat_id_map, tex_id_map, diet_id_map = {}, {}, {}

            # ── 1. Categories ──────────────────────────────────────────────
            cat_added = 0
            if (df := get_sheet('Categories')) is not None:
                existing = {c.name.strip().lower(): c for c in Category.query.all()}
                for _, row in df.iterrows():
                    name = str(row.get("name", "")).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() in existing:
                        cat_id_map[row.get("id")] = existing[name.lower()].id
                    else:
                        obj = Category(name=name)
                        db.session.add(obj); db.session.flush()
                        cat_id_map[row.get("id")] = obj.id
                        existing[name.lower()] = obj
                        cat_added += 1

            # ── 2. Sensitivities ───────────────────────────────────────────
            sen_added = 0
            if (df := get_sheet('Sensitivities')) is not None:
                existing_set = {s.name.strip().lower() for s in Sensitivity.query.all()}
                for _, row in df.iterrows():
                    name = str(row.get("name", "")).strip()
                    if not name or name.lower() == 'nan' or name.lower() in existing_set: continue
                    db.session.add(Sensitivity(name=name))
                    existing_set.add(name.lower())
                    sen_added += 1

            # ── 3. Textures ────────────────────────────────────────────────
            tex_added = 0
            if (df := get_sheet('Textures')) is not None:
                existing = {t.name.strip().lower(): t for t in Texture.query.all()}
                for _, row in df.iterrows():
                    name = str(row.get("name", "")).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() in existing:
                        tex_id_map[row.get("id")] = existing[name.lower()].id
                    else:
                        obj = Texture(name=name)
                        db.session.add(obj); db.session.flush()
                        tex_id_map[row.get("id")] = obj.id
                        existing[name.lower()] = obj
                        tex_added += 1

            # ── 4. Diets ───────────────────────────────────────────────────
            diet_added = 0
            if (df := get_sheet('Diets')) is not None:
                existing = {d.name.strip().lower(): d for d in Diet.query.all()}
                for _, row in df.iterrows():
                    name = str(row.get("name", "")).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() in existing:
                        diet_id_map[row.get("id")] = existing[name.lower()].id
                    else:
                        obj = Diet(name=name)
                        db.session.add(obj); db.session.flush()
                        diet_id_map[row.get("id")] = obj.id
                        existing[name.lower()] = obj
                        diet_added += 1

            db.session.commit()

            # ── 5. Products ────────────────────────────────────────────────
            prod_added, prod_id_map = 0, {}
            if (df := get_sheet('Products')) is not None:
                existing_names = {p.name.strip().lower(): p for p in FoodItem.query.all()}
                for _, row in df.iterrows():
                    name = str(row.get("name", "")).strip()
                    if not name or name.lower() == 'nan': continue
                    if name.lower() in existing_names:
                        prod_id_map[row.get("id")] = existing_names[name.lower()].id
                        continue

                    # Upload bundled image to Supabase if present
                    img_val = str(row.get("image_url", ""))
                    final_url = ""
                    if img_val and img_val.lower() != 'nan':
                        if img_val.startswith("images/") and img_val in zip_names and supabase:
                            ext = img_val.split('.')[-1]
                            fname = f"{uuid.uuid4().hex}_imported.{ext}"
                            mime = f"image/{ext}" if ext != 'jpg' else 'image/jpeg'
                            try:
                                supabase.storage.from_("products").upload(path=fname, file=zf.read(img_val), file_options={"content-type": mime})
                                final_url = supabase.storage.from_("products").get_public_url(fname)
                            except Exception as e:
                                print(f"Image upload failed: {e}")
                        elif img_val.startswith("http"):
                            final_url = img_val

                    def _n(col, default=0):
                        v = row.get(col, default)
                        return v if pd.notna(v) else default

                    obj = FoodItem(
                        name=name, category_id=cat_id_map.get(_n("category_id")) if pd.notna(row.get("category_id")) else None,
                        image_url=final_url, iddsi=_n("iddsi"),
                        calories=_n("calories"), protein=_n("protein"), carbs=_n("carbs"),
                        fat=_n("fat"), sugars=_n("sugars"), sodium=_n("sodium"),
                        contains=_parse_json_col(row.get("contains")),
                        may_contain=_parse_json_col(row.get("may_contain")),
                        texture_id=tex_id_map.get(row.get("texture_id")) if pd.notna(row.get("texture_id")) else None,
                        properties=_parse_json_col(row.get("properties")),
                        company=str(_n("company", "")), texture_notes=str(_n("texture_notes", "")),
                        allergy_notes=str(_n("allergy_notes", "")), forbidden_for=str(_n("forbidden_for", "")),
                        nutrition_vector=_parse_vector_col(row.get("nutrition_vector")),
                        openai_embedding=_parse_vector_col(row.get("openai_embedding")),
                    )
                    db.session.add(obj); db.session.flush()
                    prod_id_map[row.get("id")] = obj.id
                    existing_names[name.lower()] = obj
                    prod_added += 1
                db.session.commit()

            # ── 6. Meals ───────────────────────────────────────────────────
            meal_added = 0
            if (df := get_sheet('Meals')) is not None:
                existing_names_set = {m.name.strip().lower() for m in Meal.query.all()}
                for _, row in df.iterrows():
                    name = str(row.get("name", "")).strip()
                    if not name or name.lower() == 'nan' or name.lower() in existing_names_set: continue

                    old_diet = row.get("diet_id")
                    new_diet = diet_id_map.get(old_diet) if pd.notna(old_diet) else None

                    raw_pids = _parse_json_col(row.get("product_ids"))
                    new_pids = [prod_id_map.get(pid, pid) for pid in raw_pids]

                    raw_global = row.get("is_global", True)
                    obj = Meal(
                        name=name,
                        description=str(row.get("description", "")) if pd.notna(row.get("description")) else "",
                        diet_id=new_diet, product_ids=new_pids,
                        total_calories=row.get("total_calories", 0) if pd.notna(row.get("total_calories")) else 0,
                        total_protein=row.get("total_protein", 0) if pd.notna(row.get("total_protein")) else 0,
                        total_carbs=row.get("total_carbs", 0) if pd.notna(row.get("total_carbs")) else 0,
                        total_fat=row.get("total_fat", 0) if pd.notna(row.get("total_fat")) else 0,
                        total_sugars=row.get("total_sugars", 0) if pd.notna(row.get("total_sugars")) else 0,
                        total_sodium=row.get("total_sodium", 0) if pd.notna(row.get("total_sodium")) else 0,
                        filter_restriction_ids=_parse_json_col(row.get("filter_restriction_ids")),
                        filter_texture_ids=_parse_json_col(row.get("filter_texture_ids")),
                        filter_show_may_contain=bool(row.get("filter_show_may_contain", False)),
                        is_global=bool(raw_global) if pd.notna(raw_global) else True,
                        created_by=None,
                    )
                    db.session.add(obj)
                    existing_names_set.add(name.lower())
                    meal_added += 1
                db.session.commit()

        return jsonify({
            "message": "ייבוא הושלם בהצלחה!",
            "details": {
                "categories_added": cat_added, "sensitivities_added": sen_added,
                "textures_added": tex_added, "diets_added": diet_added,
                "products_added": prod_added, "meals_added": meal_added,
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": f"Import failed: {str(e)}"}), 500
