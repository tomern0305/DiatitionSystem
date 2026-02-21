"""
In order to search in natural language in the system we want to use openAI
embedding, we are going to make a string from all the parameters of the
food item and its name.
we send the string to the openAI embedding 3 small and get a 1536 long vector
for each food item in the catalog, when we search we calculate a vector
on the search query. In order to know what is the closest match we calculate
distance using cousins similarity and for the POC we print the 3 closes matches.
"""

"""
Cost Analysis
When testing we used on average 80 tokens per request. 
the initial setup will calculate all the vectors once and each time we add
a food item to the catalog we will calculate another one.
for each query we will make a request too.
text-embedding-3-small is VERY EFFICIENT costing $0.02 per 1 million tokens!
"""

import os
import numpy as np
from openai import OpenAI

client = OpenAI(api_key=os.environ.get("OPENAI_API_KEY"))


def get_embedding(text):
    response = client.embeddings.create(
        model="text-embedding-3-small",
        input=text
    )
    return response.data[0].embedding


def cosine_similarity(vec_a, vec_b):
    return np.dot(vec_a, vec_b) / (np.linalg.norm(vec_a) * np.linalg.norm(vec_b))


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
    "food_009": {"name": "טופו מוקפץ ברוטב סויה", "texture": "3 (לעיס/מוצק למחצה)",
                 "nutrition": "16 גרם חלבון צמחי, טבעוני", "allergies": ["סויה", "גלוטן"]},
    "food_010": {"name": "דג סלמון בתנור", "texture": "2 (רך מתפרק)", "nutrition": "22 גרם חלבון, עשיר באומגה 3",
                 "allergies": ["דגים"]},
    "food_014": {"name": "בשר בקר טחון רך", "texture": "2 (רך ולעיס בקלות)",
                 "nutrition": "20 גרם חלבון, עשיר בברזל וויטמין B12", "allergies": ["ללא"]}
}


def create_embedding_string(food_item):
    """ממיר שורת DB מובנית למשפט סמנטי עבור מודל השפה"""
    allergies_str = ", ".join(food_item["allergies"])
    return f"שם מנה: {food_item['name']}. רמת מרקם: {food_item['texture']}. תזונה: {food_item['nutrition']}. אלרגנים: {allergies_str}."


def main():
    print("מתחיל בבניית הווקטורים עבור הקטלוג (זה לוקח כמה שניות)...\n")

    # 2. המרת הקטלוג למחרוזות ויצירת וקטורים
    catalog_embeddings = {}
    for food_id, food_data in hospital_food_db.items():
        semantic_string = create_embedding_string(food_data)
        embedding = get_embedding(semantic_string)
        catalog_embeddings[food_id] = embedding


    user_query = "מנה עם הרבה חלבון וקצת שומן"
    print(f"שאילתת החיפוש: '{user_query}'\n")

    query_embedding = get_embedding(user_query)

    results = []
    for food_id, food_emb in catalog_embeddings.items():
        score = cosine_similarity(query_embedding, food_emb)
        results.append((food_id, score))

    results.sort(key=lambda x: x[1], reverse=True)

    print("--- התוצאות המתאימות ביותר ---")
    for rank, (food_id, score) in enumerate(results, 1):
        food_name = hospital_food_db[food_id]["name"]
        print(f"{rank}. {food_name} (ציון התאמה: {score:.4f})")
        if rank == 3:
            break


if __name__ == "__main__":
    main()