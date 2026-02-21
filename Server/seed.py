# THIS IS FOR TESTING ONLY, THIS IS NOT THE WAY TO GET PRODUCTS INTO THE DB!!!!

import os
from openai import OpenAI
from app import app, db
from models import FoodItem

# Initialize OpenAI
client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))

# 1. Our Hebrew Mock Data
hospital_food_db = {
    "food_001": {"name": "חזה עוף צלוי", "texture": "4 (מוצק)", "nutrition": "31 גרם חלבון, דל שומן",
                 "allergies": ["ללא"]},
    "food_002": {"name": "פירה תפוחי אדמה", "texture": "1 (מחית רכה)", "nutrition": "20 גרם פחמימות, קל לעיכול",
                 "allergies": ["ללא"]},
    "food_003": {"name": "פילה אמנון אפוי", "texture": "2 (רך מתפרק)", "nutrition": "21 גרם חלבון, דל קלוריות",
                 "allergies": ["דגים"]},
    "food_004": {"name": "קציצות בקר ברוטב עגבניות", "texture": "3 (לעיס/בינוני)",
                 "nutrition": "24 גרם חלבון, עשיר בברזל", "allergies": ["גלוטן", "ביצים"]},
    "food_005": {"name": "יוגורט טבעי 5%", "texture": "1 (נוזלי/רך מאוד)",
                 "nutrition": "10 גרם חלבון, עשיר בסידן, פרוביוטי", "allergies": ["חלב"]},
}


def get_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def seed_database():
    # We must run DB operations inside the Flask app context
    with app.app_context():
        print("Clearing out old data to prevent duplicates...")
        db.session.query(FoodItem).delete()
        db.session.commit()

        print("Seeding new food catalog...")
        for food_id, data in hospital_food_db.items():
            print(f"  -> Processing: {data['name']}")

            # 1. Synthesize the string for OpenAI
            allergies_str = ", ".join(data["allergies"])
            semantic_string = f"שם מנה: {data['name']}. רמת מרקם: {data['texture']}. תזונה: {data['nutrition']}. אלרגנים: {allergies_str}."

            # 2. Get the Big Vector (1536 dimensions)
            big_vector = get_embedding(semantic_string)

            # 3. Create a mock Small Vector (3 dimensions) for your K-Means models later
            # (In production, you will calculate this from actual protein/fat/carb numbers)
            mock_small_vector = [1.0, 0.5, 0.0]

            # 4. Create the SQLAlchemy Object
            new_food = FoodItem(
                category="כללי",  # Default category for the PoC
                name=data['name'],
                texture_level=data['texture'],
                allergens_contains={"known_allergies": data["allergies"]},  # Saved as JSONB!
                nutrition_data={"description": data["nutrition"]},
                nutrition_vector=mock_small_vector,
                openai_embedding=big_vector
            )

            # 5. Add to the session
            db.session.add(new_food)

        # 6. Save all additions to PostgreSQL
        db.session.commit()
        print("\nDatabase seeded successfully! Your vector search is ready.")


if __name__ == "__main__":
    seed_database()