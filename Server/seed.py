import os
from openai import OpenAI
from app import app, db
from models import FoodItem, Category
from dotenv import load_dotenv

load_dotenv()
api_key = os.environ.get("OPENAI_API_KEY")
client = OpenAI(api_key=api_key) if api_key else None

# הרשימה הסגורה המותרת (לפי כפתורי הסינון באפיון):
# "gluten", "milk", "eggs", "soy", "sesame", "nuts", "peanuts", "fish"

hospital_food_db = [
    {
        "name": "חזה עוף צלוי ברוטב", "category": "מנה עיקרית", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80",
        "iddsi": 6, "texture_notes": "חתוך לחתיכות קטנות (Bite-Sized), רך ללעיסה",
        "calories": 165.0, "protein": 31.0, "carbs": 0.0, "fat": 3.6, "sugars": 0.0, "sodium": 74.0,
        "contains": [], "may_contain": ["soy"], "properties": ["high_protein"],
        "allergy_notes": "הרוטב עלול להכיל שאריות סויה פס ייצור", "forbidden_for": "צמחונים, טבעונים"
    },
    {
        "name": "פירה תפוחי אדמה חלבי", "category": "תוספת", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1643851508930-5b583f7d1976?auto=format&fit=crop&w=800&q=80",
        "iddsi": 4, "texture_notes": "מחית חלקה לחלוטין (Pureed), ללא גושים",
        "calories": 113.0, "protein": 2.0, "carbs": 17.0, "fat": 4.2, "sugars": 1.0, "sodium": 315.0,
        "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"],
        "allergy_notes": "מכיל חמאה וחלב ניגר", "forbidden_for": "רגישים ללקטוז, טבעונים"
    },
    {
        "name": "מרק ירקות טחון", "category": "מרקים", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&w=800&q=80",
        "iddsi": 3, "texture_notes": "נוזל סמיך (Liquidised), מתאים לשתייה בכוס או כף",
        "calories": 65.0, "protein": 1.5, "carbs": 10.0, "fat": 2.0, "sugars": 3.0, "sodium": 400.0,
        "contains": [], "may_contain": ["gluten"], "properties": ["vegan"],
        "allergy_notes": "בושל בסביבה המכילה גלוטן", "forbidden_for": "חולי צליאק"
    },
    {
        "name": "יוגורט טבעי פרוביוטי 5%", "category": "מעדנים", "company": "תנובה",
        "image_url": "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=80",
        "iddsi": 3, "texture_notes": "מרקם אחיד, ללא חתיכות פרי",
        "calories": 78.0, "protein": 4.5, "carbs": 5.0, "fat": 5.0, "sugars": 4.0, "sodium": 45.0,
        "contains": ["milk"], "may_contain": [], "properties": ["probiotic", "vegetarian"],
        "allergy_notes": "חלבי לחלוטין", "forbidden_for": "אלרגיה לחלב"
    },
    {
        "name": "פילה אמנון אפוי רך", "category": "מנה עיקרית", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80",
        "iddsi": 5, "texture_notes": "נמעך בקלות במזלג (Minced & Moist), ללא עצמות כלל",
        "calories": 128.0, "protein": 26.0, "carbs": 0.0, "fat": 2.7, "sugars": 0.0, "sodium": 56.0,
        "contains": ["fish"], "may_contain": [], "properties": ["high_protein"],
        "allergy_notes": "נבדק פעמיים להוצאת עצמות", "forbidden_for": "אלרגיה לדגים"
    },
    {
        "name": "דייסת שיבולת שועל", "category": "ארוחת בוקר", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1517673400267-0251440c45dc?auto=format&fit=crop&w=800&q=80",
        "iddsi": 4, "texture_notes": "סמיך ודביק, דורש מעט מאוד לעיסה",
        "calories": 150.0, "protein": 5.0, "carbs": 27.0, "fat": 2.5, "sugars": 1.0, "sodium": 115.0,
        "contains": ["gluten", "milk"], "may_contain": ["nuts", "peanuts"], "properties": ["high_fiber"],
        "allergy_notes": "בושל בחלב, שיבולת שועל עלולה להכיל עקבות בוטנים", "forbidden_for": "צליאק, רגישות ללקטוז"
    },
    {
        "name": "קציצות בקר רכות ברוטב", "category": "מנה עיקרית", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=800&q=80",
        "iddsi": 5, "texture_notes": "בשר טחון דק, מוגש עם רוטב עשיר למניעת יובש (Minced & Moist)",
        "calories": 250.0, "protein": 20.0, "carbs": 10.0, "fat": 15.0, "sugars": 4.0, "sodium": 450.0,
        "contains": ["eggs", "gluten"], "may_contain": ["soy", "sesame"], "properties": ["high_iron"],
        "allergy_notes": "מכיל ביצים ופירורי לחם כחומר קושר", "forbidden_for": "צמחונים, צליאק"
    },
    {
        "name": "מחית תפוחי עץ (רסק)", "category": "קינוחים", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1582294101235-51fb32b9195a?auto=format&fit=crop&w=800&q=80",
        "iddsi": 4, "texture_notes": "מחית חלקה לחלוטין ללא קליפות",
        "calories": 68.0, "protein": 0.2, "carbs": 15.0, "fat": 0.1, "sugars": 11.0, "sodium": 1.0,
        "contains": [], "may_contain": [], "properties": ["vegan", "sugar_free"],
        "allergy_notes": "ללא תוספת סוכר, ללא אלרגנים ידועים", "forbidden_for": ""
    },
    {
        "name": "מעדן סויה בטעם שוקולד", "category": "קינוחים", "company": "אלפרו",
        "image_url": "https://images.unsplash.com/photo-1587314168485-3236d6710814?auto=format&fit=crop&w=800&q=80",
        "iddsi": 3, "texture_notes": "נוזל סמיך ואחיד, תחליף טבעוני",
        "calories": 85.0, "protein": 3.0, "carbs": 12.0, "fat": 1.8, "sugars": 9.0, "sodium": 50.0,
        "contains": ["soy"], "may_contain": ["nuts"], "properties": ["vegan", "dairy_free"],
        "allergy_notes": "עלול להכיל עקבות אגוזים מפס הייצור", "forbidden_for": "אלרגיה לסויה"
    },
    {
        "name": "טחינה חלקה דלילה", "category": "תוספת", "company": "מטבח פנימי",
        "image_url": "https://images.unsplash.com/photo-1596647285648-93662d04ba4e?auto=format&fit=crop&w=800&q=80",
        "iddsi": 3, "texture_notes": "טחינה מדוללת במים ולימון למרקם נוזלי סמיך",
        "calories": 180.0, "protein": 6.0, "carbs": 4.0, "fat": 16.0, "sugars": 0.0, "sodium": 120.0,
        "contains": ["sesame"], "may_contain": [], "properties": ["vegan", "high_fat"],
        "allergy_notes": "עשוי 100% שומשום", "forbidden_for": "אלרגיה לשומשום"
    },
    {"name": "לחם אחיד נטול קרום", "category": "ארוחת בוקר", "company": "שטראוס", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 6, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 155.0, "protein": 5.0, "carbs": 39.0, "fat": 15.0, "sugars": 15.0, "sodium": 269.0, "contains": ["gluten"], "may_contain": [], "properties": [], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten"},
    {"name": "חביתה רכה מקושקשת", "category": "ארוחת בוקר", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 139.0, "protein": 13.0, "carbs": 5.0, "fat": 7.0, "sugars": 10.0, "sodium": 247.0, "contains": ["eggs"], "may_contain": ["milk"], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-eggs"},
    {"name": "גבינה לבנה חלקה 5%", "category": "ארוחת בוקר", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 222.0, "protein": 21.0, "carbs": 30.0, "fat": 5.0, "sugars": 15.0, "sodium": 95.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "דייסת שיבולת שועל חלקה", "category": "ארוחת בוקר", "company": "אסם", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 183.0, "protein": 24.0, "carbs": 13.0, "fat": 10.0, "sugars": 6.0, "sodium": 223.0, "contains": ["gluten", "milk"], "may_contain": ["nuts"], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten, milk"},
    {"name": "יוגורט פרוביוטי 3%", "category": "ארוחת בוקר", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 88.0, "protein": 16.0, "carbs": 5.0, "fat": 14.0, "sugars": 8.0, "sodium": 22.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "שקשוקה ללא קליפות", "category": "ארוחת בוקר", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 185.0, "protein": 18.0, "carbs": 10.0, "fat": 15.0, "sugars": 3.0, "sodium": 111.0, "contains": ["eggs"], "may_contain": ["gluten"], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-eggs"},
    {"name": "דייסת סולת תפוחים", "category": "ארוחת בוקר", "company": "אסם", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 80.0, "protein": 24.0, "carbs": 24.0, "fat": 11.0, "sugars": 5.0, "sodium": 20.0, "contains": ["gluten", "milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten, milk"},
    {"name": "גבינת קוטג' 5% במרקם גושים קל", "category": "ארוחת בוקר", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 84.0, "protein": 8.0, "carbs": 18.0, "fat": 7.0, "sugars": 1.0, "sodium": 189.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "פנקייק רך טחון", "category": "ארוחת בוקר", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 120.0, "protein": 11.0, "carbs": 31.0, "fat": 13.0, "sugars": 10.0, "sodium": 299.0, "contains": ["gluten", "eggs", "milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten, eggs, milk"},
    {"name": "כריך גבינה בלחם רך מאוד", "category": "ארוחת בוקר", "company": "שטראוס", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 6, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 183.0, "protein": 14.0, "carbs": 24.0, "fat": 14.0, "sugars": 9.0, "sodium": 223.0, "contains": ["gluten", "milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten, milk"},
    {"name": "קציצות עוף טחונות דק", "category": "מנה עיקרית", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 148.0, "protein": 12.0, "carbs": 25.0, "fat": 4.0, "sugars": 3.0, "sodium": 145.0, "contains": ["eggs", "gluten"], "may_contain": ["soy"], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-eggs, gluten"},
    {"name": "נתחי דג אפוי רך מפורק", "category": "מנה עיקרית", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 203.0, "protein": 13.0, "carbs": 28.0, "fat": 13.0, "sugars": 5.0, "sodium": 196.0, "contains": ["fish"], "may_contain": [], "properties": [], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-fish"},
    {"name": "חזה עוף ברוטב", "category": "מנה עיקרית", "company": "אסם", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 6, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 175.0, "protein": 21.0, "carbs": 7.0, "fat": 14.0, "sugars": 7.0, "sodium": 94.0, "contains": [], "may_contain": ["soy", "sesame"], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "תבשיל בשר בקר בבישול ארוך ונמעך", "category": "מנה עיקרית", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 208.0, "protein": 11.0, "carbs": 35.0, "fat": 8.0, "sugars": 15.0, "sodium": 58.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "לזניה גבינות רכה", "category": "מנה עיקרית", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 250.0, "protein": 11.0, "carbs": 28.0, "fat": 14.0, "sugars": 11.0, "sodium": 219.0, "contains": ["gluten", "milk", "eggs"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten, milk, eggs"},
    {"name": "שווארמה הודו טחון ללא שומן", "category": "מנה עיקרית", "company": "תנובה", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 248.0, "protein": 10.0, "carbs": 39.0, "fat": 7.0, "sugars": 13.0, "sodium": 110.0, "contains": [], "may_contain": ["soy", "sesame"], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "פסטה ברוטב בולונז בשר", "category": "מנה עיקרית", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 6, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 247.0, "protein": 24.0, "carbs": 25.0, "fat": 13.0, "sugars": 8.0, "sodium": 109.0, "contains": ["gluten"], "may_contain": ["soy"], "properties": [], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten"},
    {"name": "קציצות דג ברוטב חריימה עדין", "category": "מנה עיקרית", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 193.0, "protein": 18.0, "carbs": 37.0, "fat": 3.0, "sugars": 11.0, "sodium": 87.0, "contains": ["fish", "eggs", "gluten"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-fish, eggs, gluten"},
    {"name": "שניצלון תירס רך לאפייה", "category": "מנה עיקרית", "company": "אסם", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 6, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 91.0, "protein": 10.0, "carbs": 33.0, "fat": 6.0, "sugars": 13.0, "sodium": 166.0, "contains": ["gluten", "eggs", "soy"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten, eggs, soy"},
    {"name": "תבשיל עדשים וקינואה רך", "category": "מנה עיקרית", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 66.0, "protein": 18.0, "carbs": 30.0, "fat": 4.0, "sugars": 11.0, "sodium": 245.0, "contains": [], "may_contain": ["gluten"], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "פירה תפוחי אדמה שמנתי", "category": "תוספת", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 192.0, "protein": 5.0, "carbs": 39.0, "fat": 7.0, "sugars": 5.0, "sodium": 183.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "אורז לבן בבישול ארוך רך", "category": "תוספת", "company": "תנובה", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 6, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 124.0, "protein": 11.0, "carbs": 9.0, "fat": 3.0, "sugars": 9.0, "sodium": 286.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "פתיתים אפויים ברוטב אדום", "category": "תוספת", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 6, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 156.0, "protein": 18.0, "carbs": 38.0, "fat": 9.0, "sugars": 9.0, "sodium": 150.0, "contains": ["gluten"], "may_contain": [], "properties": [], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-gluten"},
    {"name": "לקט ירקות מאודים מעוכים", "category": "תוספת", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 141.0, "protein": 3.0, "carbs": 38.0, "fat": 15.0, "sugars": 14.0, "sodium": 47.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "פירה בטטה מתקתק חלבי", "category": "תוספת", "company": "תנובה", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 146.0, "protein": 5.0, "carbs": 17.0, "fat": 5.0, "sugars": 11.0, "sodium": 223.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "מרק כתומים טחון חלק", "category": "מרקים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 195.0, "protein": 22.0, "carbs": 33.0, "fat": 15.0, "sugars": 6.0, "sodium": 183.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "מרק עוף טחון ומסונן", "category": "מרקים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 232.0, "protein": 19.0, "carbs": 21.0, "fat": 9.0, "sugars": 14.0, "sodium": 109.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "מרק אפונה דליל עשיר", "category": "מרקים", "company": "תנובה", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 169.0, "protein": 7.0, "carbs": 6.0, "fat": 10.0, "sugars": 14.0, "sodium": 153.0, "contains": [], "may_contain": ["gluten"], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "מרק פטריות קרמי טחון", "category": "מרקים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 202.0, "protein": 3.0, "carbs": 33.0, "fat": 10.0, "sugars": 11.0, "sodium": 72.0, "contains": ["milk", "gluten"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk, gluten"},
    {"name": "ציר ירקות צלול", "category": "מרקים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 1, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 165.0, "protein": 6.0, "carbs": 32.0, "fat": 15.0, "sugars": 15.0, "sodium": 196.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "פודינג שוקולד חלק", "category": "קינוחים", "company": "אסם", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 175.0, "protein": 14.0, "carbs": 37.0, "fat": 10.0, "sugars": 11.0, "sodium": 270.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "רסק תפוחי עץ ואגסים", "category": "קינוחים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 74.0, "protein": 23.0, "carbs": 25.0, "fat": 1.0, "sugars": 13.0, "sodium": 141.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "ג'לי בטעם תות נמס", "category": "קינוחים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 170.0, "protein": 14.0, "carbs": 21.0, "fat": 4.0, "sugars": 4.0, "sodium": 218.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "מעדן סויה וניל", "category": "מעדנים", "company": "אסם", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 189.0, "protein": 3.0, "carbs": 30.0, "fat": 7.0, "sugars": 6.0, "sodium": 106.0, "contains": ["soy"], "may_contain": ["nuts"], "properties": [], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-soy"},
    {"name": "שייק פירות יער מסונן", "category": "משקאות", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 197.0, "protein": 7.0, "carbs": 18.0, "fat": 8.0, "sugars": 11.0, "sodium": 138.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "מעדן חלב שוקולד קרלו", "category": "מעדנים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 200.0, "protein": 14.0, "carbs": 21.0, "fat": 3.0, "sugars": 2.0, "sodium": 176.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "בננה בשלה מעוכה מחית", "category": "קינוחים", "company": "תנובה", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 4, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 146.0, "protein": 23.0, "carbs": 31.0, "fat": 13.0, "sugars": 10.0, "sodium": 173.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "פודינג וניל חלבי", "category": "קינוחים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 103.0, "protein": 13.0, "carbs": 25.0, "fat": 11.0, "sugars": 11.0, "sodium": 80.0, "contains": ["milk"], "may_contain": [], "properties": ["vegetarian"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-milk"},
    {"name": "מרמלדה רכה ללא תוספת סוכר", "category": "קינוחים", "company": "מטבח פנימי", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 5, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 75.0, "protein": 19.0, "carbs": 19.0, "fat": 2.0, "sugars": 13.0, "sodium": 53.0, "contains": [], "may_contain": [], "properties": ["vegan"], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-אין"},
    {"name": "טחינה גולמית מדוללת מתוקה", "category": "קינוחים", "company": "אסם", "image_url": "https://images.unsplash.com/photo-1604908176997-125f25cc6f3d?auto=format&fit=crop&w=800&q=80", "iddsi": 3, "texture_notes": "מרקם הולם למנות בית חולים על פי הנחיות מרקמים.", "calories": 83.0, "protein": 22.0, "carbs": 38.0, "fat": 8.0, "sugars": 2.0, "sodium": 182.0, "contains": ["sesame"], "may_contain": [], "properties": [], "allergy_notes": "הופק אוטומטית בהתאם למאגר האפליקציה.", "forbidden_for": "אלרגיים ל-sesame"}
]


def get_embedding(text):
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


def seed_database():
    with app.app_context():
        print("Clearing out old data...")
        db.drop_all()
        db.create_all()

        print("Seeding Categories first...")
        unique_categories = set(item['category'] for item in hospital_food_db)
        category_map = {}
        
        for cat_name in unique_categories:
            cat = Category(name=cat_name)
            db.session.add(cat)
        db.session.commit()
        
        for cat in Category.query.all():
            category_map[cat.name] = cat.id

        print(f"Created {len(category_map)} categories.")

        print("Seeding medical food items (Strict Allergens)...")
        for data in hospital_food_db:
            print(f"  -> Processing: {data['name']}")

            # יצירת מחרוזת סמנטית עשירה
            contains_str = ", ".join(data["contains"]) if data["contains"] else "ללא"
            may_contain_str = ", ".join(data["may_contain"]) if data["may_contain"] else "ללא"
            props_str = ", ".join(data["properties"]) if data["properties"] else "רגיל"

            semantic_string = f"שם מנה: {data['name']}. קטגוריה: {data['category']}. מרקם IDDSI: {data['iddsi']}. הערות: {data['texture_notes']}. מכיל ודאית: {contains_str}. עלול להכיל: {may_contain_str}. תכונות: {props_str}."

            # OpenAI Vector
            big_vector = get_embedding(semantic_string)

            # Nutrition Vector (K-Means ready)
            small_vector = [data['calories'], data['protein'], data['carbs'], data['fat'], data['sugars'],
                            data['sodium']]

            # יצירת האובייקט ושמירה
            new_food = FoodItem(
                name=data['name'],
                category_id=category_map[data['category']],
                company=data['company'],
                image_url=data['image_url'],
                iddsi=data['iddsi'],
                texture_notes=data['texture_notes'],
                calories=data['calories'],
                protein=data['protein'],
                carbs=data['carbs'],
                fat=data['fat'],
                sugars=data['sugars'],
                sodium=data['sodium'],
                contains=data['contains'],
                may_contain=data['may_contain'],
                properties=data['properties'],
                allergy_notes=data['allergy_notes'],
                forbidden_for=data['forbidden_for'],
                nutrition_vector=small_vector,
                openai_embedding=big_vector
            )

            db.session.add(new_food)

        db.session.commit()
        print("\nDatabase seeded successfully! Perfectly synced with React UI.")


if __name__ == "__main__":
    seed_database()