import os
import uuid
from flask import Blueprint, jsonify, request
from werkzeug.utils import secure_filename
from sqlalchemy import text as sa_text
from models import db, FoodItem
from supabase import create_client, Client

from openai import OpenAI
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None


products_bp = Blueprint('products_bp', __name__)

supabase_url = os.environ.get("SUPABASE_URL")
supabase_key = os.environ.get("SUPABASE_ANON_KEY") or os.environ.get("SUPABASE_SERVICE_KEY")
supabase: Client = create_client(supabase_url, supabase_key)

def get_embedding(text):
    """Helper function to generate OpenAI embedding for a given text,
    if there is no key will fill zeroes""" 
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        return [0.0] * 1536
    try:
        response = client.embeddings.create(
            model="text-embedding-3-small",
            input=text
        )
        return response.data[0].embedding
    except Exception as e:
        print(f"Embedding failed: {e}")
        return [0.0] * 1536

def make_semantic_search_text_for_embedding(data: dict) -> str:
    """
    Builds a human-readable semantic sentence from product data
    for use as OpenAI embedding input.
    """
    name        = data.get('name', '')
    company     = data.get('company', '')
    iddsi       = data.get('iddsi', 0)
    calories    = data.get('calories', 0.0)
    protein     = data.get('protein', 0.0)
    carbs       = data.get('carbs', 0.0)
    fat         = data.get('fat', 0.0)
    sugars      = data.get('sugares', 0.0)
    sodium      = data.get('sodium', 0.0)

    contains    = data.get('contains', [])
    may_contain = data.get('mayContain', [])
    properties  = data.get('properties', [])

    texture_notes = data.get('textureNotes', '')
    allergy_notes = data.get('allergyNotes', '')
    forbidden_for = data.get('forbiddenFor', '')

    category_name = data.get('category', '')
    if not category_name:
        from models import Category
        cat_id = data.get('category_id')
        if cat_id:
            cat = Category.query.get(cat_id)
            category_name = cat.name if cat else ''

    # Format list fields — fall back to readable "none" strings
    contains_str    = ", ".join(contains)    if contains    else "ללא"
    may_contain_str = ", ".join(may_contain) if may_contain else "ללא"
    props_str       = ", ".join(properties)  if properties  else "רגיל"

    parts = [
        f"שם מוצר: {name}.",
        f"קטגוריה: {category_name}." if category_name else None,
        f"חברה: {company}." if company else None,
        f"מרקם IDDSI: {iddsi}.",
        f"קלוריות: {calories} קק״ל, חלבון: {protein}g, פחמימות: {carbs}g, שומן: {fat}g, סוכר: {sugars}g, נתרן: {sodium}mg.",
        f"מכיל ודאית: {contains_str}.",
        f"עלול להכיל: {may_contain_str}.",
        f"תכונות: {props_str}.",
        f"הערות מרקם: {texture_notes}."  if texture_notes else None,
        f"הערות אלרגיה: {allergy_notes}." if allergy_notes else None,
        f"אסור עבור: {forbidden_for}."    if forbidden_for else None,
    ]

    return " ".join(p for p in parts if p)

def build_product_embedding_pipeline(data: dict) -> list[float]:
    """
    Full pipeline: data dict → semantic sentence → OpenAI embedding vector.
    """
    # if there is no flag "AI_ENABLED" it will be false by default, so we won't generate embeddings.
    ai_enabled = os.environ.get("AI_ENABLED", "false").lower() == "true"

    if not ai_enabled:
        return [0.0] * 1536


    semantic_text = make_semantic_search_text_for_embedding(data)
    print(f"[Embedding] Semantic text: {semantic_text}")   # helpful during dev
    embedding = get_embedding(semantic_text)
    return embedding

def format_product(p) -> dict:
    """Serialize a FoodItem ORM object to the standard API response dict."""
    return {
        "id": str(p.id),
        "category": p.category_rel.name if p.category_rel else 'כללי',
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
        "lastEditDate": p.updated_at.strftime('%Y-%m-%d %H:%M:%S') if p.updated_at else None,
    }

@products_bp.route('/api/products/<int:product_id>/similar', methods=['GET'])
def similar_products(product_id):
    """Return foods most similar to product_id by cosine distance on the 6D nutrition_vector."""
    limit = min(int(request.args.get('limit', 6)), 20)
    product = FoodItem.query.get_or_404(product_id)

    if product.nutrition_vector is None:
        return jsonify([])

    vec_str = "[" + ",".join(str(v) for v in product.nutrition_vector) + "]"
    rows = db.session.execute(
        sa_text("""
            SELECT id
            FROM food_items
            WHERE nutrition_vector IS NOT NULL
              AND id != :exclude_id
            ORDER BY nutrition_vector <=> CAST(:vec AS vector)
            LIMIT :limit
        """),
        {"vec": vec_str, "exclude_id": product_id, "limit": limit}
    ).fetchall()

    ids = [row[0] for row in rows]
    if not ids:
        return jsonify([])

    items = FoodItem.query.filter(FoodItem.id.in_(ids)).all()
    by_id = {p.id: p for p in items}
    ordered = [by_id[i] for i in ids if i in by_id]
    return jsonify([format_product(p) for p in ordered])

@products_bp.route('/api/products/balance-suggest', methods=['POST'])
def balance_suggest():
    """Given current meal totals and targets, return foods that best close the nutrient gap."""
    body    = request.json or {}
    totals  = body.get('current_totals', {})
    targets = body.get('targets', {})
    limit   = min(int(body.get('limit', 3)), 10)

    # 'sugares' is the misspelled frontend field name; map to DB column 'sugars'
    fields = ['calories', 'protein', 'carbs', 'fat', 'sugares', 'sodium']
    target_arr  = [float(targets.get(f, 0)) for f in fields]
    current_arr = [float(totals.get(f, 0))  for f in fields]

    gap_norm = [
        max(0.0, (t - c) / t) if t > 0 else 0.0
        for t, c in zip(target_arr, current_arr)
    ]
    if sum(gap_norm) == 0:
        return jsonify([])

    all_products = FoodItem.query.all()
    scored = []
    for p in all_products:
        vals = [p.calories or 0, p.protein or 0, p.carbs or 0,
                p.fat or 0, p.sugars or 0, p.sodium or 0]
        new_gap = [
            max(0.0, gap_norm[i] - (vals[i] / target_arr[i])) if target_arr[i] > 0 else 0.0
            for i in range(6)
        ]
        improvement = sum(gap_norm) - sum(new_gap)
        if improvement > 0:
            scored.append((improvement, p))

    scored.sort(key=lambda x: -x[0])
    return jsonify([format_product(p) for _, p in scored[:limit]])

@products_bp.route('/api/products/ai-status', methods=['GET'])
def ai_status():
    """Returns whether AI/semantic search features are enabled on this server."""
    enabled = os.environ.get("AI_ENABLED", "false").lower() == "true"
    return jsonify({"ai_enabled": enabled})

@products_bp.route('/api/products/semantic-search', methods=['POST'])
def semantic_search():
    """Natural language semantic search: embeds the query and ranks products by cosine distance."""
    if os.environ.get("AI_ENABLED", "false").lower() != "true":
        return jsonify({"error": "AI features are not enabled"}), 503

    body = request.json or {}
    query = (body.get("query") or "").strip()
    limit = min(int(body.get("limit", 20)), 50)

    if not query:
        return jsonify([])

    query_embedding = get_embedding(query)
    vec_str = "[" + ",".join(str(v) for v in query_embedding) + "]"

    rows = db.session.execute(
        sa_text("""
            WITH vector_search AS (
                SELECT id,
                       ROW_NUMBER() OVER (ORDER BY openai_embedding <=> CAST(:vec AS vector)) AS rank,
                       (openai_embedding <=> CAST(:vec AS vector)) AS distance
                FROM food_items
                WHERE openai_embedding IS NOT NULL
                  AND (openai_embedding <=> CAST(:vec AS vector)) < 0.7
                LIMIT 40
            ),
            text_search AS (
                SELECT id,
                       ROW_NUMBER() OVER (ORDER BY ts_rank(search_vector, query) DESC) AS rank
                FROM food_items,
                     plainto_tsquery('simple', :text_query) AS query
                WHERE search_vector @@ query
                LIMIT 40
            ),
            rrf AS (
                SELECT
                    COALESCE(v.id, t.id) AS id,
                    COALESCE(1.0 / (60 + v.rank), 0) + COALESCE(1.0 / (60 + t.rank), 0) AS rrf_score,
                    v.distance
                FROM vector_search v
                FULL OUTER JOIN text_search t ON v.id = t.id
            )
            SELECT id, rrf_score, distance
            FROM rrf
            ORDER BY rrf_score DESC
            LIMIT :limit
        """),
        {"vec": vec_str, "text_query": query, "limit": limit}
    ).fetchall()

    if not rows:
        return jsonify([])

    id_to_distance = {row[0]: float(row[2]) if row[2] is not None else None for row in rows}
    ordered_ids = [row[0] for row in rows]

    products = FoodItem.query.filter(FoodItem.id.in_(ordered_ids)).all()
    product_map = {p.id: p for p in products}

    result = []
    for pid in ordered_ids:
        p = product_map.get(pid)
        if not p:
            continue
        item = format_product(p)
        item["distance"] = id_to_distance[pid]
        result.append(item)

    return jsonify(result)

@products_bp.route('/api/products', methods=['GET'])
def get_products():
    """Retrieves all food items and formats them for the frontend."""
    products = FoodItem.query.all()
    return jsonify([format_product(p) for p in products])

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
        forbidden_for=data.get('forbiddenFor', ''),
        nutrition_vector=[
            data.get('calories', 0.0),
            data.get('protein', 0.0),
            data.get('carbs', 0.0),
            data.get('fat', 0.0),
            data.get('sugares', 0.0),
            data.get('sodium', 0.0)
        ],
        openai_embedding=build_product_embedding_pipeline(data)
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
