"""Usage counting and guarded deletion for the four 'variable' tables
(sensitivities, textures, diets, categories).

Policy: a variable that is still referenced by any product or saved meal
cannot be deleted. Nothing is ever detached, nulled, or cascaded — the caller
must clear the references from the products/meals themselves first. This keeps
deletion non-destructive and avoids leaving orphaned names or dangling IDs.
"""

from sqlalchemy import or_
from models import db, FoodItem, Meal


# ── Sensitivities ────────────────────────────────────────────────────────────
# Stored denormalized as name strings inside JSONB arrays on FoodItem,
# and as raw IDs inside Meal.filter_restriction_ids.
# FoodItem.properties is deliberately excluded: it uses a separate vocabulary
# ("vegan", "sugar_free") that no UI populates from the sensitivities list.

_SENS_FIELDS = ('contains', 'may_contain')


def count_sensitivity_usage(sens):
    """Counts products tagged with this sensitivity and meals filtered by its ID."""
    products = FoodItem.query.filter(or_(*[
        getattr(FoodItem, field).contains([sens.name]) for field in _SENS_FIELDS
    ])).count()
    meals = Meal.query.filter(Meal.filter_restriction_ids.contains([sens.id])).count()
    return {"products": products, "meals": meals}


# ── Textures ─────────────────────────────────────────────────────────────────
# Real FK on FoodItem; raw IDs inside Meal.filter_texture_ids.

def count_texture_usage(texture):
    """Counts products using this texture and meals filtered by its ID."""
    products = FoodItem.query.filter_by(texture_id=texture.id).count()
    meals = Meal.query.filter(Meal.filter_texture_ids.contains([texture.id])).count()
    return {"products": products, "meals": meals}


# ── Categories ───────────────────────────────────────────────────────────────
# Real FK on FoodItem; not referenced by meals.

def count_category_usage(category):
    """Counts products belonging to this category."""
    return {
        "products": FoodItem.query.filter_by(category_id=category.id).count(),
        "meals": 0,
    }


# ── Diets ────────────────────────────────────────────────────────────────────
# Only referenced by meals, via a real FK.

def count_diet_usage(diet):
    """Counts meals assigned to this diet."""
    return {"products": 0, "meals": Meal.query.filter_by(diet_id=diet.id).count()}


# ── Registry ─────────────────────────────────────────────────────────────────

USAGE_COUNTERS = {
    'sensitivity': count_sensitivity_usage,
    'texture': count_texture_usage,
    'category': count_category_usage,
    'diet': count_diet_usage,
}


def get_usage(kind, entity):
    """Returns {"products": n, "meals": n} for a single variable entity."""
    return USAGE_COUNTERS[kind](entity)


def get_usage_map(kind, entities):
    """Returns {id: {"products": n, "meals": n}} for a list of variable entities."""
    return {e.id: get_usage(kind, e) for e in entities}


def _blocked_message(usage):
    """Builds the Hebrew explanation of what is still holding this variable."""
    parts = []
    if usage["products"] > 0:
        parts.append(f"{usage['products']} מוצרים")
    if usage["meals"] > 0:
        parts.append(f"{usage['meals']} ארוחות שמורות")
    return "לא ניתן למחוק: הפריט משויך ל-" + " ול-".join(parts) + "."


def safe_delete(kind, entity):
    """Deletes a variable only if nothing references it.

    Returns (response_body, status_code). Never modifies products or meals.
    """
    usage = get_usage(kind, entity)

    if usage["products"] > 0 or usage["meals"] > 0:
        return {
            "error": "in_use",
            "usage": usage,
            "message": _blocked_message(usage),
        }, 409

    try:
        db.session.delete(entity)
        db.session.commit()
    except Exception as e:
        db.session.rollback()
        return {"error": "delete_failed", "message": str(e)}, 500

    return {"message": "Deleted"}, 200
