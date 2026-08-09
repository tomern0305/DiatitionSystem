# בסיס הנתונים — PostgreSQL + pgvector

[חזרה לאינדקס](README.md)

---

## 1. סקירה

| פרט | ערך |
|------|-----|
| מנוע | PostgreSQL |
| תוסף נדרש | `vector` (pgvector) — לחיפוש סמנטי |
| ORM | Flask-SQLAlchemy (`Server/models.py`) |
| תמונת Docker מקומית | `ankane/pgvector:latest` |
| שם בסיס הנתונים | `hospital_system` |
| מנגנון מיגרציות | **אין** — ראו פרק 6 |

בסיס הנתונים מכיל **7 טבלאות**: `categories`, `sensitivities`, `textures`, `diets`, `food_items`, `users`, `meals`, ובנוסף טבלת `system_settings` שנוצרת בגישה ישירה ב-SQL ואינה מוגדרת כמודל ORM.

---

## 2. תרשים קשרים

```
categories ──┐
             ├──< food_items >── (JSONB: contains, may_contain, properties)
textures ────┘         │
                       │ (product_ids — JSONB, ללא FK)
sensitivities          │
   (ללא FK כלל)        │
                       ▼
diets ──────────────< meals >──── users (created_by)
                       │
                       └── filter_restriction_ids, filter_texture_ids (JSONB, ללא FK)
```

**נקודה מהותית להבנת המערכת:** רק חלק מהקשרים הם מפתחות זרים אמיתיים. השאר נשמרים כמערכי JSONB ללא שלמות רפרנציאלית:

| קשר | סוג | אכיפה במסד |
|------|------|-------------|
| `food_items.category_id` → `categories.id` | FK | ✅ |
| `food_items.texture_id` → `textures.id` | FK | ✅ |
| `meals.diet_id` → `diets.id` | FK | ✅ |
| `meals.created_by` → `users.id` | FK | ✅ |
| רגישויות במוצר | **שמות** במערך JSONB | ❌ |
| מוצרים בארוחה | **מזהים** במערך JSONB | ❌ |
| פילטרים שנשמרו בארוחה | **מזהים** במערך JSONB | ❌ |

> ⚠️ בגלל היעדר האכיפה, מחיקה של רשומה עלולה להשאיר "יתומים" — שם או מזהה שמצביע לשומקום. בשכבת האפליקציה נוסף מנגנון הגנה: מחיקת קטגוריה, רגישות, מרקם או דיאטה **נחסמת** כל עוד משהו מפנה אליהן. ראו [01-server.md](01-server.md#מדיניות-מחיקה-מוגנת).
>
> **מה שעדיין לא מוגן:** מחיקת **מוצר** משאירה את המזהה שלו בתוך `meals.product_ids`. מחיקת **משתמש** משאירה `meals.created_by` שמצביע למשתמש שאינו קיים.

---

## 3. מילון נתונים

### 3.1 טבלאות המשתנים — `categories`, `sensitivities`, `textures`, `diets`

ארבע הטבלאות זהות במבנה:

| עמודה | טיפוס | Null | ברירת מחדל | מפתח |
|--------|--------|------|-------------|-------|
| `id` | `INTEGER` | לא | serial | PK |
| `name` | `VARCHAR(100)` | לא | — | UNIQUE |
| `created_at` | `TIMESTAMP` | כן | זמן היצירה | — |

### 3.2 `food_items` — מוצרי מזון

הטבלה המרכזית.

| עמודה | טיפוס | Null | ברירת מחדל | הערות |
|--------|--------|------|-------------|--------|
| `id` | `INTEGER` | לא | serial | PK |
| `name` | `VARCHAR(200)` | **לא** | — | שם המזון |
| `image_url` | `VARCHAR(500)` | כן | — | כתובת ציבורית ב-Supabase |
| `category_id` | `INTEGER` | כן | — | FK → `categories.id` |
| `texture_id` | `INTEGER` | כן | — | FK → `textures.id` |
| `company` | `VARCHAR(100)` | כן | — | יצרן |
| `iddsi` | `INTEGER` | כן | — | תקן מרקם בינלאומי |
| `texture_notes` | `TEXT` | כן | — | הערות מרקם |
| `calories` | `FLOAT` | כן | `0.0` | קלוריות |
| `protein` | `FLOAT` | כן | `0.0` | חלבון |
| `carbs` | `FLOAT` | כן | `0.0` | פחמימות |
| `fat` | `FLOAT` | כן | `0.0` | שומן |
| `sugars` | `FLOAT` | כן | `0.0` | סוכרים — ב-API נקרא `sugares` ⚠️ |
| `sodium` | `FLOAT` | כן | `0.0` | נתרן |
| `contains` | `JSONB` | כן | `[]` | **שמות** רגישויות שהמוצר מכיל |
| `may_contain` | `JSONB` | כן | `[]` | **שמות** רגישויות אפשריות ("עלול להכיל") |
| `properties` | `JSONB` | כן | `[]` | תכונות חופשיות — `vegan`, `sugar_free` וכד' |
| `allergy_notes` | `TEXT` | כן | — | הערות אלרגיה |
| `forbidden_for` | `VARCHAR(200)` | כן | — | למי אסור |
| `nutrition_vector` | `vector(6)` | כן | — | pgvector — 6 הערכים התזונתיים |
| `openai_embedding` | `vector(1536)` | כן | — | pgvector — embedding לחיפוש סמנטי |
| `search_vector` | `TSVECTOR` | — | **מחושב אוטומטית** | ראו למטה |
| `created_at` | `TIMESTAMP` | כן | זמן היצירה | — |
| `updated_at` | `TIMESTAMP` | כן | מתעדכן בכל שינוי | — |

**`search_vector`** היא עמודה מחושבת (`GENERATED ALWAYS ... STORED`) שמאגדת חמישה שדות טקסט לחיפוש טקסט מלא:

```sql
to_tsvector('simple',
  coalesce(name,'')       || ' ' ||
  coalesce(company,'')    || ' ' ||
  coalesce(texture_notes,'') || ' ' ||
  coalesce(allergy_notes,'')  || ' ' ||
  coalesce(forbidden_for,''))
```

הקונפיגורציה `'simple'` נבחרה במכוון — היא לא מבצעת גזירת שורשים, מה שמתאים לעברית שאין לה תמיכת stemming ב-PostgreSQL.

**אינדקס:** `food_items_search_vector_gin` — אינדקס GIN על `search_vector`.

> ⚠️ **`properties` מול `contains`:** שני השדות מכילים מערכי מחרוזות אך משתמשים באוצר מילים שונה לגמרי. `contains`/`may_contain` מתמלאים מרשימת הרגישויות שבמסך ההגדרות; `properties` מכיל ערכים חופשיים ששום מסך לא מנהל. אל תערבבו ביניהם.

### 3.3 `users` — משתמשים

| עמודה | טיפוס | Null | ברירת מחדל | הערות |
|--------|--------|------|-------------|--------|
| `id` | `INTEGER` | לא | serial | PK |
| `username` | `VARCHAR(100)` | **לא** | — | UNIQUE |
| `password_hash` | `VARCHAR(200)` | **לא** | — | bcrypt |
| `role` | `VARCHAR(50)` | **לא** | `'lineworker'` | `admin` \| `dietitian` \| `lineworker` |
| `must_change_password` | `BOOLEAN` | כן | `TRUE` | כופה החלפה בכניסה הבאה |
| `created_at` | `TIMESTAMP` | כן | זמן היצירה | — |

> ⚠️ **אין אילוץ (CHECK) על ערכי `role`.** נקודת הקצה `PATCH /api/users/<id>/role` תקבל כל מחרוזת. תפקיד לא מוכר יתנהג כמו `lineworker` (ההרשאה הנמוכה ביותר) — כלומר נכשל באופן בטוח, אך בשקט.

### 3.4 `meals` — ארוחות

| עמודה | טיפוס | Null | ברירת מחדל | הערות |
|--------|--------|------|-------------|--------|
| `id` | `INTEGER` | לא | serial | PK |
| `name` | `VARCHAR(200)` | **לא** | — | — |
| `description` | `TEXT` | כן | — | — |
| `diet_id` | `INTEGER` | כן | — | FK → `diets.id` |
| `product_ids` | `JSONB` | כן | `[]` | מערך **מסודר** של `food_items.id` — ללא FK |
| `total_calories` | `FLOAT` | כן | `0.0` | תצלום ערכים בזמן השמירה |
| `total_protein` | `FLOAT` | כן | `0.0` | ״ |
| `total_carbs` | `FLOAT` | כן | `0.0` | ״ |
| `total_fat` | `FLOAT` | כן | `0.0` | ״ |
| `total_sugars` | `FLOAT` | כן | `0.0` | ״ |
| `total_sodium` | `FLOAT` | כן | `0.0` | ״ |
| `filter_restriction_ids` | `JSONB` | כן | `[]` | מזהי רגישויות שהיו מסומנות — ללא FK |
| `filter_texture_ids` | `JSONB` | כן | `[]` | מזהי מרקמים שהיו מסומנים — ללא FK |
| `filter_show_may_contain` | `BOOLEAN` | כן | `FALSE` | — |
| `created_by` | `INTEGER` | כן | — | FK → `users.id` |
| `is_global` | `BOOLEAN` | **לא** | `TRUE` | גלויה לכולם או רק ליוצר |
| `created_at` | `TIMESTAMP` | כן | זמן היצירה | — |
| `updated_at` | `TIMESTAMP` | כן | מתעדכן בכל שינוי | — |

**חשוב:** עמודות ה-`total_*` הן **תצלום מצב** שנשמר בזמן יצירת הארוחה. אם ערכי מוצר משתנים אחר כך, הסיכום בארוחה **לא** יתעדכן. זו בחירת תכנון (שמירת ההיסטוריה כפי שהייתה), לא באג.

### 3.5 `system_settings` — הגדרות מערכת

טבלה פשוטה של מפתח-ערך. **אינה מודל ORM** — נוצרת ב-SQL גולמי לפי הצורך.

| עמודה | טיפוס | Null | ברירת מחדל | מפתח |
|--------|--------|------|-------------|-------|
| `key` | `VARCHAR(100)` | לא | — | PK |
| `value` | `TEXT` | לא | `''` | — |

**מפתחות מוכרים:**

| מפתח | ערכים | תפקיד |
|-------|--------|--------|
| `z_score_check_enabled` | `'true'` / `'false'` | הפעלת אזהרה על ערך תזונתי חריג בעת הוספת מוצר |

הערכים נשמרים תמיד כמחרוזות באותיות קטנות. נקודת הקצה `PATCH /api/system/settings` מקבלת **כל מפתח** ללא רשימה לבנה.

> שימו לב: `AI_ENABLED` הוא **משתנה סביבה** ולא הגדרה בטבלה הזו. הוא נקרא רק בעליית התהליך.

---

## 4. הרצה מקומית עם Docker

הקובץ נמצא ב-`Data Base/docker-compose.yml` (תוכן מלא):

```yaml
version: '3.8'
services:
  db:
    image: ankane/pgvector:latest
    container_name: dietitian_db
    environment:
      POSTGRES_USER: admin
      POSTGRES_PASSWORD: secretpassword
      POSTGRES_DB: hospital_system
    ports:
      - "5432:5432"
    volumes:
      - pgdata:/var/lib/postgresql/data

volumes:
  pgdata:
```

| פקודה | פעולה |
|--------|--------|
| `cd "Data Base" && docker-compose up -d` | הפעלה ברקע |
| `docker-compose down` | עצירה (הנתונים נשמרים ב-volume) |
| `docker-compose down -v` | עצירה + **מחיקת כל הנתונים** |
| `docker exec -it dietitian_db psql -U admin -d hospital_system` | פתיחת מסוף SQL |

מחרוזת החיבור המקומית:

```
postgresql://admin:secretpassword@localhost:5432/hospital_system
```

> ⚠️ **הסיסמה כתובה בגלוי בקובץ שנמצא בגיט.** זה מקובל לפיתוח מקומי בלבד. אין להשתמש בהגדרות האלה בשום סביבה נגישה מהרשת.
>
> ⚠️ הפורט נחשף על **כל ממשקי הרשת** (`"5432:5432"`). במחשב ברשת משותפת עדיף `"127.0.0.1:5432:5432"`.
>
> ⚠️ התמונה נעולה ל-`latest` — עדכון עתידי עלול לשבור תאימות. מומלץ לנעול לגרסה מפורשת.

---

## 5. גיבוי ושחזור

### 5.1 דרך PostgreSQL (מומלץ — גיבוי מלא)

```bash
# גיבוי
docker exec -t dietitian_db pg_dump -U admin -d hospital_system > hospital_backup.sql

# שחזור
docker exec -i dietitian_db psql -U admin -d hospital_system < hospital_backup.sql
```

### 5.2 דרך המערכת (ייצוא לוגי, כולל תמונות)

- `GET /api/system/export` — מנהל בלבד. מחזיר ZIP עם `backup.xlsx` (שישה גיליונות) ותיקיית `images/`.
- `POST /api/system/import` — מנהל בלבד. משחזר מ-ZIP באותו פורמט, בסדר תלויות נכון ועם מיפוי מזהים.

**היתרון:** כולל את התמונות מ-Supabase, וקריא לבני אדם.
**החיסרון:** לא כולל את טבלת המשתמשים, ו-`created_by` של ארוחות מיובאות מאופס ל-null.

> **מסקנה:** לגיבוי תפעולי אמיתי השתמשו ב-`pg_dump`. הייצוא של המערכת מיועד להעברת תוכן בין סביבות, לא לשחזור מאסון.

### 5.3 קובץ הגיבוי הקיים בריפו

`Data Base/hospital_backup.sql` (~966KB) הוא dump ישן וחלקי — הוא מכיל **רק** את `categories` (7 שורות) ו-`food_items` (51 שורות).

> ⚠️ **הקובץ אינו מספיק להקמת מערכת עובדת.** חסרים בו: `textures`, `diets`, `sensitivities`, `users`, `meals`, `system_settings`, העמודה `texture_id`, העמודה `search_vector` והאינדקס שלה.
>
> **סדר נכון לשימוש בו:** להריץ את השרת פעם אחת (כדי ש-`db.create_all()` ייצור את כל הטבלאות), ורק אז לטעון ממנו את נתוני המוצרים בלבד.

---

## 6. מיגרציות — איך סכימה משתנה כאן

> 🔴 **אין Alembic ואין Flask-Migrate.** אין היסטוריית גרסאות, אין rollback, ואין תיעוד של אילו שינויים הוחלו על אילו סביבות.

שינויי סכימה מבוצעים בשלושה מנגנונים אד-הוק **שחופפים חלקית**:

| # | מנגנון | מתי רץ | מה מריץ |
|---|---------|---------|----------|
| 1 | `Server/app.py` בעלייה | בכל הפעלת תהליך | `CREATE EXTENSION vector`, `db.create_all()`, 3 פקודות `ADD COLUMN IF NOT EXISTS` |
| 2 | `GET /api/run-migrations` | הפעלה ידנית | 14 פקודות DDL (ראו למטה) |
| 3 | `Server/scripts/alter_db.py` | הפעלה ידנית | אותן 3 פקודות כמו במנגנון 1 |

### מה מריץ `/api/run-migrations`

בסדר הזה:

1–6. הוספת עמודות ל-`food_items`: `company`, `created_at`, `updated_at`, `texture_notes`, `allergy_notes`, `forbidden_for`
7. `texture_id INTEGER REFERENCES textures(id)`
8. `nutrition_vector vector(6)`
9. `openai_embedding vector(1536)`
10. `search_vector` — העמודה המחושבת
11. `CREATE INDEX food_items_search_vector_gin`
12. `CREATE TABLE IF NOT EXISTS meals (...)`
13. `CREATE TABLE IF NOT EXISTS system_settings (...)`
14. זריעת `z_score_check_enabled = 'false'`

> ⚠️ **הנתיב אינו מוגן באימות.** כל מי שמכיר את הכתובת יכול להריץ DDL על בסיס הנתונים.
>
> ⚠️ ה-DDL של `meals` בשלב 12 **חסר** את העמודות `created_by` ו-`is_global` — הן נוספות רק דרך מנגנון 1. בסביבה שהוקמה רק דרך הנתיב הזה, טבלת הארוחות תהיה חסרה.

### להוספת עמודה בעתיד

1. הוסיפו את העמודה ב-`Server/models.py`.
2. הוסיפו `ALTER TABLE ... ADD COLUMN IF NOT EXISTS ...` לרשימה ב-`Server/routes/system.py`.
3. פרסו והריצו `GET /api/run-migrations` פעם אחת.

`db.create_all()` **לעולם לא משנה טבלה קיימת** — הוא רק יוצר טבלאות חסרות. בלי שלב 2 העמודה החדשה פשוט לא תיווצר בסביבות קיימות.

> **המלצה לטווח בינוני:** להכניס Flask-Migrate. ההשקעה חד-פעמית והיא פותרת את כל הבעיות שלמעלה.

---

## 7. אינדקסים

| אינדקס | טבלה | עמודה | סוג |
|---------|-------|--------|------|
| מפתחות ראשיים | כל הטבלאות | `id` | B-tree |
| אילוצי UNIQUE | `categories`, `sensitivities`, `textures`, `diets` | `name` | B-tree |
| אילוץ UNIQUE | `users` | `username` | B-tree |
| `food_items_search_vector_gin` | `food_items` | `search_vector` | GIN |

> **אין אינדקס וקטורי** (IVFFlat או HNSW) על `openai_embedding`. חיפוש סמנטי מבצע סריקה מלאה של הטבלה. עד כמה אלפי מוצרים זה מהיר מספיק; מעבר לכך שקלו:
>
> ```sql
> CREATE INDEX ON food_items USING hnsw (openai_embedding vector_cosine_ops);
> ```
>
> **אין אינדקסים על מפתחות זרים** (`food_items.category_id`, `food_items.texture_id`, `meals.diet_id`). PostgreSQL אינו יוצר אותם אוטומטית. הם ישפרו את ביצועי ספירת השימוש במסך ההגדרות.

---

## 8. שאילתות שימושיות לתחזוקה

```sql
-- כמה מוצרים בכל קטגוריה
SELECT c.name, COUNT(f.id) AS products
FROM categories c LEFT JOIN food_items f ON f.category_id = c.id
GROUP BY c.name ORDER BY products DESC;

-- מוצרים ללא embedding (או עם וקטור אפסים)
SELECT id, name FROM food_items WHERE openai_embedding IS NULL;

-- ארוחות שמצביעות למוצר שאינו קיים (מזהים יתומים)
SELECT m.id, m.name, elem::int AS missing_product_id
FROM meals m, jsonb_array_elements_text(m.product_ids) AS elem
WHERE NOT EXISTS (SELECT 1 FROM food_items f WHERE f.id = elem::int);

-- רגישויות שמופיעות על מוצרים אך אינן קיימות בטבלת הרגישויות
SELECT DISTINCT elem AS orphan_name
FROM food_items f, jsonb_array_elements_text(f.contains) AS elem
WHERE NOT EXISTS (SELECT 1 FROM sensitivities s WHERE s.name = elem);

-- גודל הטבלאות
SELECT relname AS table_name, pg_size_pretty(pg_total_relation_size(relid)) AS size
FROM pg_catalog.pg_statio_user_tables ORDER BY pg_total_relation_size(relid) DESC;
```

השאילתות השלישית והרביעית מאתרות בדיוק את סוג היתומים שתואר בפרק 2. כדאי להריץ אותן מדי פעם כבדיקת תקינות.

---

[→ הקודם: הלקוח](02-client.md) | [חזרה לאינדקס](README.md) | [הבא: הרצה מקומית ←](04-local-setup.md)
