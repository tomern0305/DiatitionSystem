from flask import Blueprint, jsonify, request
from models import db, Meal, FoodItem

meals_bp = Blueprint('meals_bp', __name__)

def _meal_to_dict(meal: Meal) -> dict:
    """Serializes a Meal object to a JSON-compatible dictionary."""
    return {
        "id":          meal.id,
        "name":        meal.name,
        "description": meal.description,
        "diet_id":     meal.diet_id,
        "diet_name":   meal.diet.name if meal.diet else None,
        "product_ids": meal.product_ids,
        "nutrition": {
            "calories": meal.total_calories,
            "protein":  meal.total_protein,
            "carbs":    meal.total_carbs,
            "fat":      meal.total_fat,
            "sugares":  meal.total_sugars,
            "sodium":   meal.total_sodium,
        },
        "filters": {
            "restriction_ids":  meal.filter_restriction_ids,
            "texture_ids":      meal.filter_texture_ids,
            "show_may_contain": meal.filter_show_may_contain,
        },
        "created_at": meal.created_at.strftime('%Y-%m-%d %H:%M:%S') if meal.created_at else None,
        "updated_at": meal.updated_at.strftime('%Y-%m-%d %H:%M:%S') if meal.updated_at else None,
    }

@meals_bp.route('/api/meals', methods=['GET'])
def get_meals():
    """Retrieves all meals ordered by most recent first."""
    meals = Meal.query.order_by(Meal.created_at.desc()).all()
    return jsonify([_meal_to_dict(m) for m in meals])

@meals_bp.route('/api/meals/<int:meal_id>', methods=['GET'])
def get_meal(meal_id):
    """Retrieves a single meal by its ID, including full product details."""
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404

    data = _meal_to_dict(meal)

    # Also resolve the product_ids to full product objects so the viewer has all the data.
    products = FoodItem.query.filter(FoodItem.id.in_(meal.product_ids)).all()
    product_map = {p.id: p for p in products}
    data["products"] = [
        {
            "id":       str(pid),
            "name":     product_map[pid].name if pid in product_map else None,
            "image":    product_map[pid].image_url if pid in product_map else None,
            "calories": product_map[pid].calories if pid in product_map else 0,
            "protein":  product_map[pid].protein  if pid in product_map else 0,
            "carbs":    product_map[pid].carbs     if pid in product_map else 0,
            "fat":      product_map[pid].fat       if pid in product_map else 0,
            "sugares":  product_map[pid].sugars    if pid in product_map else 0,
            "sodium":   product_map[pid].sodium    if pid in product_map else 0,
        }
        for pid in meal.product_ids
    ]
    return jsonify(data)

@meals_bp.route('/api/meals', methods=['POST'])
def create_meal():
    """
    Creates and persists a new meal.

    Expected JSON body:
    {
        "name":        str  (required),
        "description": str  (optional),
        "diet_id":     int  (optional),
        "product_ids": [int, ...],       # ordered list of food_item IDs
        "nutrition":   {calories, protein, carbs, fat, sugares, sodium},
        "filters":     {restriction_ids, texture_ids, show_may_contain}
    }
    """
    data = request.json

    name = data.get('name', '').strip()
    if not name:
        return jsonify({"error": "Meal name is required"}), 400

    nutrition = data.get('nutrition', {})
    filters   = data.get('filters',   {})

    new_meal = Meal(
        name        = name,
        description = data.get('description', ''),
        diet_id     = data.get('diet_id') or None,
        product_ids = data.get('product_ids', []),
        total_calories = nutrition.get('calories', 0.0),
        total_protein  = nutrition.get('protein',  0.0),
        total_carbs    = nutrition.get('carbs',    0.0),
        total_fat      = nutrition.get('fat',      0.0),
        total_sugars   = nutrition.get('sugares',  0.0),
        total_sodium   = nutrition.get('sodium',   0.0),
        filter_restriction_ids  = filters.get('restriction_ids',  []),
        filter_texture_ids      = filters.get('texture_ids',      []),
        filter_show_may_contain = filters.get('show_may_contain', False),
    )

    try:
        db.session.add(new_meal)
        db.session.commit()
        return jsonify({"message": "Meal created successfully", "id": new_meal.id}), 201
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@meals_bp.route('/api/meals/<int:meal_id>', methods=['DELETE'])
def delete_meal(meal_id):
    """Deletes a meal by its ID."""
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404

    try:
        db.session.delete(meal)
        db.session.commit()
        return jsonify({"message": "Meal deleted successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400

@meals_bp.route('/api/meals/<int:meal_id>', methods=['PUT'])
def update_meal(meal_id):
    """
    Updates an existing meal's details, products, nutrition snapshot, and filter state.

    Accepts the same JSON body as POST /api/meals.
    """
    meal = Meal.query.get(meal_id)
    if not meal:
        return jsonify({"error": "Meal not found"}), 404

    data = request.json
    nutrition = data.get('nutrition', {})
    filters   = data.get('filters',   {})

    try:
        if 'name'        in data: meal.name        = data['name'].strip()
        if 'description' in data: meal.description = data['description']
        if 'diet_id'     in data: meal.diet_id     = data['diet_id'] or None
        if 'product_ids' in data: meal.product_ids = data['product_ids']

        if nutrition:
            meal.total_calories = nutrition.get('calories', meal.total_calories)
            meal.total_protein  = nutrition.get('protein',  meal.total_protein)
            meal.total_carbs    = nutrition.get('carbs',    meal.total_carbs)
            meal.total_fat      = nutrition.get('fat',      meal.total_fat)
            meal.total_sugars   = nutrition.get('sugares',  meal.total_sugars)
            meal.total_sodium   = nutrition.get('sodium',   meal.total_sodium)

        if filters:
            meal.filter_restriction_ids  = filters.get('restriction_ids',  meal.filter_restriction_ids)
            meal.filter_texture_ids      = filters.get('texture_ids',      meal.filter_texture_ids)
            meal.filter_show_may_contain = filters.get('show_may_contain', meal.filter_show_may_contain)

        db.session.commit()
        return jsonify({"message": "Meal updated successfully"})
    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 400
