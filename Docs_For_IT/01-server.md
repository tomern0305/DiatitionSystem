# השרת — Flask API

[חזרה לאינדקס](README.md)

---

## 1. סקירה

השרת הוא **REST API בלבד**. הוא לא מרנדר דפי HTML ולא מגיש את הלקוח — הלקוח הוא אפליקציה נפרדת שרצה בדפדפן ופונה לשרת ב-JSON.

| פרט | ערך |
|------|-----|
| שפה | Python |
| מסגרת עבודה | Flask |
| ORM | Flask-SQLAlchemy |
| בסיס נתונים | PostgreSQL + תוסף pgvector |
| אימות | JWT (ספריית PyJWT), אלגוריתם HS256 |
| הצפנת סיסמאות | bcrypt |
| פורט מקומי | 5000 |
| נקודת כניסה | `Server/app.py` |

---

## 2. מבנה התיקייה

```
Server/
├── app.py                  נקודת הכניסה — יצירת האפליקציה, רישום Blueprints, מיגרציות הפעלה
├── models.py               כל מודלי בסיס הנתונים (SQLAlchemy)
├── nutrition_scaler.py     חישוב דמיון בין מוצרים לפי ערכים תזונתיים
├── requirements.txt        תלויות Python
├── vercel.json             הגדרות פריסה ל-Vercel
├── .env                    מפתחות וסודות (לא בגיט)
├── routes/
│   ├── __init__.py         ריק
│   ├── auth.py             התחברות, החלפת סיסמה, פרטי המשתמש הנוכחי
│   ├── users.py            ניהול משתמשים (מנהל בלבד)
│   ├── products.py         מוצרים, העלאת תמונות, חיפוש סמנטי, בדיקת חריגים
│   ├── meals.py            ארוחות
│   ├── categories.py       קטגוריות
│   ├── sensitivities.py    רגישויות ואלרגנים
│   ├── textures.py         מרקמים
│   ├── diets.py            דיאטות
│   ├── system.py           בריאות, הגדרות מערכת, ייצוא/ייבוא, מיגרציות
│   └── variable_usage.py   מודול עזר — ספירת שימוש ומחיקה מוגנת (לא Blueprint)
└── scripts/
    ├── seed.py             איפוס וזריעת נתוני דמו (הרסני!)
    └── alter_db.py         הוספת עמודות חסרות (לא הרסני)
```

### Blueprints רשומים

כל ה-Blueprints נרשמים ב-`app.py` **ללא `url_prefix`** — הנתיבים כתובים במלואם בכל דקורטור.

| Blueprint | מודול |
|-----------|-------|
| `products_bp` | `routes/products.py` |
| `meals_bp` | `routes/meals.py` |
| `categories_bp` | `routes/categories.py` |
| `sensitivities_bp` | `routes/sensitivities.py` |
| `textures_bp` | `routes/textures.py` |
| `diets_bp` | `routes/diets.py` |
| `system_bp` | `routes/system.py` |
| `auth_bp` | `routes/auth.py` |
| `users_bp` | `routes/users.py` |

`routes/variable_usage.py` אינו Blueprint — זהו מודול עזר שמיובא על ידי ארבעת מודולי המשתנים.

---

## 3. מה קורה בעליית השרת

`app.py` מריץ את הרצף הבא בתוך `with app.app_context():` — **בכל הפעלה של התהליך**:

1. `CREATE EXTENSION IF NOT EXISTS vector` — הפעלת pgvector.
2. `db.create_all()` — יצירת טבלאות חסרות. **לא משנה טבלאות קיימות.**
3. שלוש פקודות `ALTER TABLE ... ADD COLUMN IF NOT EXISTS`:
   - `food_items.texture_id`
   - `meals.created_by`
   - `meals.is_global`
4. אם טבלת `users` ריקה — יצירת משתמש `admin` עם סיסמה `admin`, תפקיד `admin` ודגל `must_change_password=True`.

> **חשוב לפריסה ב-Vercel:** מכיוון ש-`app.run()` נמצא מאחורי `if __name__ == '__main__':`, ב-Vercel נטען רק אובייקט ה-`app`. המשמעות היא שכל הרצף למעלה מורץ **בכל cold start** של הפונקציה — כולל הניסיון ליצור את התוסף ואת הטבלאות. זה איטי ומצריך שלמשתמש בבסיס הנתונים יהיו הרשאות DDL.

---

## 4. אימות והרשאות

### מנגנון הטוקן

| פרט | ערך | מוגדר ב |
|------|-----|---------|
| סוג | JWT | `routes/auth.py` |
| אלגוריתם | HS256 | `routes/auth.py` |
| תוקף | 720 שעות = **30 יום** | קבוע `JWT_EXPIRY_HOURS` |
| מפתח חתימה | משתנה סביבה `JWT_SECRET` | ראו אזהרה למטה |
| כותרת HTTP | `Authorization: Bearer <token>` | — |

תוכן הטוקן (claims): `id`, `username`, `role`, `must_change_password`, `exp`.

**אין מנגנון רענון טוקן ואין רשימת ביטול.** טוקן שדלף תקף 30 יום עד לפקיעתו, ואין דרך לבטלו למעט החלפת `JWT_SECRET` (שתנתק את כל המשתמשים).

> ⚠️ **`JWT_SECRET` אינו מוגדר בקובץ ה-`.env` הקיים.** בהיעדרו הקוד משתמש בערך ברירת מחדל קבוע שכתוב בקוד המקור הפומבי. מי שמכיר את הקוד יכול לזייף טוקן של מנהל. **חובה להגדיר `JWT_SECRET` אקראי בכל סביבה.**

### שלושה מנגנוני הגנה שונים בקוד

| מנגנון | היכן | תגובה ללא טוקן | תגובה לתפקיד שגוי |
|--------|------|------------------|---------------------|
| `verify_token(request)` | `auth.py` — פונקציה, לא דקורטור | מחזירה `None`, כל נתיב מחליט לבד | — |
| `@require_admin` | `users.py` | 401 | 403 |
| `_require_admin()` | `system.py` | **403** (ולא 401) | 403 |

### מפת הגנה לפי משאב

| קבוצת נתיבים | מוגן? |
|--------------|-------|
| `/api/users/*` | ✅ מנהל בלבד (כל הפעולות) |
| `/api/system/export`, `/import`, `/settings` (PATCH), `/backfill-embeddings` | ✅ מנהל בלבד |
| `/api/meals` (GET/POST), `/api/meals/<id>` (PUT/DELETE) | ✅ נדרש טוקן + בדיקת בעלות |
| `/api/auth/change-password`, `/api/auth/me` | ✅ נדרש טוקן |
| `/api/products/*` — כולל POST, PUT, DELETE | ❌ **פתוח לחלוטין** |
| `/api/upload` (העלאת תמונות) | ❌ **פתוח לחלוטין** |
| `/api/categories`, `/sensitivities`, `/texture`, `/diets` — כולל POST/PUT/DELETE ו-CSV | ❌ **פתוח לחלוטין** |
| `/api/meals/<id>` (GET) | ❌ פתוח |
| `/api/run-migrations` | ❌ **פתוח — מריץ DDL על בסיס הנתונים** |
| `/api/status`, `/api/system/settings` (GET) | ❌ פתוח (סביר) |

> ⚠️ **זו נקודת התורפה המרכזית.** כל מי שמכיר את כתובת ה-API יכול למחוק מוצרים, לשנות קטגוריות, להעלות קבצים ולהריץ מיגרציות — ללא כל אימות. ההרשאות בפועל נאכפות רק בצד הלקוח (הפניות ב-React), וזו הגנה חזותית בלבד.
>
> **המלצה:** לפני חשיפה לאינטרנט הפתוח, להוסיף `verify_token` לכל נתיב שמשנה נתונים, או לחסום את השרת ברמת הרשת (VPN / רשימת IP מורשים).

### CORS

```python
CORS(app)
```

ללא פרמטרים — **כל מקור (origin) מורשה, בכל נתיב ובכל מתודה.** בסביבת ייצור מומלץ להגביל:

```python
CORS(app, origins=["https://your-client.vercel.app"])
```

---

## 5. רשימת ה-API המלאה

סה"כ **59 נקודות קצה**. כל הנתיבים מוחלטים (ללא prefix).

### 5.1 אימות — `routes/auth.py`

| מתודה | נתיב | תיאור |
|--------|------|--------|
| POST | `/api/auth/login` | התחברות. מחזיר `{token, user}` או 401 |
| POST | `/api/auth/change-password` | החלפת סיסמה. נדרש טוקן. מחזיר טוקן חדש |
| GET | `/api/auth/me` | פרטי המשתמש המחובר |

### 5.2 משתמשים — `routes/users.py` — **כולם מנהל בלבד**

| מתודה | נתיב | תיאור |
|--------|------|--------|
| GET | `/api/users` | רשימת כל המשתמשים (ללא hash הסיסמה) |
| POST | `/api/users` | יצירת משתמש. תפקיד ברירת מחדל `lineworker`. 409 אם השם תפוס |
| PATCH | `/api/users/<id>/role` | שינוי תפקיד. **אין ולידציה על ערך התפקיד** |
| POST | `/api/users/<id>/reset-password` | איפוס לסיסמה זמנית |
| DELETE | `/api/users/<id>` | מחיקת משתמש |

### 5.3 מוצרים — `routes/products.py`

| מתודה | נתיב | תיאור |
|--------|------|--------|
| GET | `/api/products` | כל המוצרים |
| POST | `/api/products` | יצירת מוצר. מחשב `nutrition_vector` ו-`openai_embedding` |
| PUT | `/api/products/<id>` | עדכון מוצר. ⚠️ **לא מחשב מחדש את ה-embedding** |
| DELETE | `/api/products/<id>` | מחיקת מוצר + התמונה שלו מ-Supabase |
| POST | `/api/upload` | העלאת תמונה ל-Supabase. מחזיר `{imageUrl}` |
| GET | `/api/products/<id>/similar` | מוצרים דומים (KNN). `?limit=` ברירת מחדל 6, מקסימום 20 |
| POST | `/api/products/semantic-search` | חיפוש בשפה חופשית. 503 אם `AI_ENABLED != true` |
| GET | `/api/products/ai-status` | `{"ai_enabled": bool}` |
| POST | `/api/products/balance-suggest` | הצעות מוצרים לאיזון ארוחה מול יעדים |
| POST | `/api/products/check-outlier` | זיהוי ערך תזונתי חריג (Z-score) |

> **הערה על שמות שדות:** ה-API משתמש בשם השגוי `sugares` (במקום `sugars`) בגוף הבקשה והתשובה, בעוד שבבסיס הנתונים העמודה נקראת `sugars`. ההמרה מתבצעת בשרת. הלקוח משתמש ב-`sugares` גם כן — אל תתקנו רק צד אחד.

### 5.4 ארוחות — `routes/meals.py`

| מתודה | נתיב | הגנה | תיאור |
|--------|------|-------|--------|
| GET | `/api/meals` | טוקן | רשימה מסוננת לפי תפקיד (ראו למטה) |
| GET | `/api/meals/<id>` | ❌ אין | ארוחה בודדת + פירוט המוצרים שבה |
| POST | `/api/meals` | טוקן | יצירה. `is_global = (תפקיד == admin)` |
| PUT | `/api/meals/<id>` | טוקן + בעלות | עדכון. 403 אם לא יוצר הארוחה ולא מנהל |
| DELETE | `/api/meals/<id>` | טוקן + בעלות | מחיקה. 403 אם לא יוצר הארוחה ולא מנהל |

**סינון לפי תפקיד ב-GET `/api/meals`:**

| תפקיד | מה רואה |
|-------|----------|
| `admin` | הכול |
| `dietitian` | ארוחות גלובליות + ארוחות שהוא יצר |
| `lineworker` (וכל תפקיד אחר) | ארוחות גלובליות בלבד |

### 5.5 משתני הגדרות — קטגוריות, רגישויות, מרקמים, דיאטות

ארבעת המשאבים חולקים מבנה זהה. **שימו לב לחריגה:** נתיב המרקמים הוא **יחיד** — `/api/texture` ולא `/api/textures`.

| מתודה | תבנית הנתיב | תיאור |
|--------|--------------|--------|
| GET | `/api/<משאב>` | רשימה `[{id, name}]` |
| POST | `/api/<משאב>` | יצירה. 400 אם השם קיים |
| PUT | `/api/<משאב>/<id>` | שינוי שם |
| DELETE | `/api/<משאב>/<id>` | מחיקה — **נחסמת ב-409 אם המשתנה בשימוש** |
| GET | `/api/<משאב>/usage` | `{id: {products, meals}}` — ספירת שימוש |
| GET | `/api/<משאב>/table` | הורדת CSV |
| POST | `/api/<משאב>/upload` | ייבוא CSV בכמות |

| משאב | הנתיב בפועל | עמודת ה-CSV |
|-------|--------------|--------------|
| קטגוריות | `/api/categories` | `Category` |
| רגישויות | `/api/sensitivities` | `Sensitivity` |
| מרקמים | `/api/texture` ⚠️ | `Texture` |
| דיאטות | `/api/diets` | `Diet` |

#### מדיניות מחיקה מוגנת

מיושמת ב-`routes/variable_usage.py` וחלה על ארבעת המשאבים באופן אחיד:

- מחיקה מצליחה **רק** אם אף מוצר ואף ארוחה אינם מפנים למשתנה.
- אחרת מוחזר **409** עם גוף `{error: "in_use", usage: {products, meals}, message}`.
- **המחיקה לעולם אינה משנה מוצרים או ארוחות.** אין ניתוק, אין איפוס שדות ואין מחיקה מדורגת. המשתמש חייב להסיר את השיוך בעצמו קודם.
- `FoodItem.properties` **אינו** נספר כשימוש ברגישות — הוא משתמש באוצר מילים נפרד (`vegan`, `sugar_free`) ששום מסך לא ממלא מרשימת הרגישויות.

### 5.6 מערכת — `routes/system.py`

| מתודה | נתיב | הגנה | תיאור |
|--------|------|-------|--------|
| GET | `/api/status` | ❌ | בדיקת בריאות |
| GET | `/api/system/settings` | ❌ | הגדרות מערכת כמילון שטוח |
| PATCH | `/api/system/settings` | מנהל | עדכון הגדרות. **מקבל כל מפתח, ללא רשימה לבנה** |
| GET | `/api/system/export` | מנהל | גיבוי מלא — ZIP עם `backup.xlsx` ותיקיית `images/` |
| POST | `/api/system/import` | מנהל | שחזור מ-ZIP בפורמט הנ"ל |
| POST | `/api/system/backfill-embeddings` | מנהל | חישוב embeddings חסרים |
| GET | `/api/run-migrations` | ❌ | **מריץ DDL. פתוח לחלוטין** |
| GET | `/uploads/<filename>` | ❌ | הגשת קבצים מקומית — שריד ישן, `UPLOAD_FOLDER` אינו מוגדר |

**פורמט הייצוא (`/api/system/export`):** קובץ ZIP שמכיל `backup.xlsx` עם שישה גיליונות — `Categories`, `Sensitivities`, `Textures`, `Diets`, `Products`, `Meals` — ותיקיית `images/` עם התמונות שהורדו. הייבוא מבצע את הפעולה ההפוכה בסדר תלויות נכון, עם מיפוי מזהים ישנים לחדשים.

---

## 6. שירותים חיצוניים

### 6.1 Supabase Storage — תמונות מוצרים

| פרט | ערך |
|------|-----|
| שם ה-bucket | `products` (קבוע בקוד) |
| משתני סביבה | `SUPABASE_URL` + (`SUPABASE_ANON_KEY` **או** `SUPABASE_SERVICE_KEY`) |
| שם הקובץ | `<uuid4-hex>_<שם-מקורי-מנוקה>` |

**זרימת ההעלאה** (`POST /api/upload`): קבלת הקובץ בשדה `image` → ניקוי שם → הוספת קידומת UUID → העלאה ל-bucket → החזרת ה-URL הציבורי.

> ⚠️ **אין הגבלת סוג קובץ ואין הגבלת גודל.** ה-`Content-Type` נלקח כפי שהלקוח שלח אותו, ו-`MAX_CONTENT_LENGTH` אינו מוגדר באפליקציה. בשילוב עם העובדה שהנתיב אינו מוגן באימות, זהו וקטור להעלאת קבצים זדוניים ולמילוי מכסת האחסון.

> ⚠️ **השרת לא יעלה כלל אם `SUPABASE_URL` או המפתח חסרים.** הקוד ב-`routes/products.py` יוצר את הלקוח ברמת המודול ללא בדיקה, ולכן ייבוא המודול ייכשל — והשרת כולו לא יתחיל.

**מחיקה:** בעת מחיקת מוצר, אם ה-URL מצביע ל-bucket `products`, הקובץ נמחק גם הוא. כישלון במחיקת הקובץ **נבלע בשקט** — שורת הנתונים תימחק והתמונה תישאר יתומה ב-bucket.

### 6.2 OpenAI — חיפוש סמנטי

| פרט | ערך |
|------|-----|
| מודל | `text-embedding-3-small` |
| ממדים | 1536 |
| משתנה סביבה | `OPENAI_API_KEY` |
| מתג ראשי | `AI_ENABLED` — חייב להיות בדיוק `true` |

הפיצ'ר נכשל "ברכות": אם המפתח חסר או ש-`AI_ENABLED` כבוי, הפונקציה מחזירה וקטור אפסים במקום לזרוק שגיאה. המשמעות — המערכת ממשיכה לעבוד, אך החיפוש הסמנטי לא יחזיר תוצאות משמעותיות.

**אופן החיפוש:** שילוב (Hybrid Search) של שני מסלולים שמאוחדים בשיטת RRF:

1. **וקטורי** — מרחק קוסינוס ב-pgvector (`<=>`), סף מקסימלי 0.7, עד 40 תוצאות.
2. **טקסטואלי** — חיפוש טקסט מלא של PostgreSQL על העמודה המחושבת `search_vector`, עד 40 תוצאות.

הציון המשולב: `1/(60+דירוג_וקטורי) + 1/(60+דירוג_טקסטואלי)`.

### 6.3 מוצרים דומים — `nutrition_scaler.py`

מודול Python טהור (ללא numpy/sklearn) שמחשב דמיון קוסינוס על שישה ערכים תזונתיים בסדר קבוע:
`["calories", "protein", "carbs", "fat", "sugars", "sodium"]`.

לפני החישוב מבוצע תקנון (StandardScaler) — בלעדיו הנתרן והקלוריות משתלטים על התוצאה בגלל סדרי הגודל שלהם.

> **הערה לתכנון קיבולת:** בכל קריאה ל-`/similar` הקוד טוען את **כל** טבלת המוצרים לזיכרון ומחשב מחדש את פרמטרי התקנון. זה תקין לאלפי מוצרים בודדים; בקנה מידה גדול יידרש שינוי.

---

## 7. תלויות

`requirements.txt` — **אף תלות אינה נעולה לגרסה.** זה סיכון: התקנה מחדש בעוד חצי שנה עלולה למשוך גרסאות לא תואמות.

```
Flask
flask-cors
gunicorn
psycopg2-binary
Flask-SQLAlchemy
openai
python-dotenv
pgvector
supabase
pandas
requests
PyJWT
bcrypt
openpyxl
numpy
```

**המלצה:** להריץ `pip freeze > requirements.lock.txt` ולשמור בגיט, או לנעול גרסאות ישירות בקובץ.

`gunicorn` מופיע ברשימה אך אין בריפו `Procfile`, `Dockerfile` או `wsgi.py` שמשתמשים בו.

---

## 8. טיפול בשגיאות ולוגים

- **אין** `errorhandler`, `before_request` או `after_request` גלובליים. כל נתיב מטפל בשגיאות בעצמו בבלוק `try/except` ומחזיר `jsonify(...)` עם קוד סטטוס.
- **אין תשתית לוגים.** הקוד משתמש ב-`print()` בלבד. ב-Vercel הפלט מגיע ל-Runtime Logs; בהרצה מקומית לטרמינל.
- `debug=True` **קבוע בקוד** ב-`app.run()`. הוא לא משפיע על Vercel (שלא מריץ את השורה הזו), אך אין להריץ כך שרת חשוף לאינטרנט — מצב debug חושף stack traces ומאפשר הרצת קוד דרך ה-debugger.

---

## 9. סקריפטים

| סקריפט | הרצה | מה עושה |
|---------|-------|----------|
| `scripts/seed.py` | `cd Server && python -m scripts.seed` | ⚠️ **הרסני** — `drop_all()` ואז `create_all()`, ואז זריעת 50 פריטי מזון לדוגמה. **מוחק גם את כל המשתמשים.** |
| `scripts/alter_db.py` | `python Server/scripts/alter_db.py` | לא הרסני — מוסיף שלוש עמודות חסרות אם אינן קיימות |

> `seed.py` חייב לרוץ עם `python -m scripts.seed` מתוך תיקיית `Server/` (הוא מייבא `from app import app` ללא התאמת `sys.path`). `alter_db.py` ניתן להרצה ישירה מכל מקום.

---

[חזרה לאינדקס](README.md) | [הבא: הלקוח ←](02-client.md)
