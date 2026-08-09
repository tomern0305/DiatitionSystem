# פריסה — Vercel + Supabase

[חזרה לאינדקס](README.md)

---

## 1. ארכיטקטורת הפריסה

המערכת נפרסת כשלושה רכיבים **נפרדים**:

```
┌─────────────────────────┐
│ פרויקט Vercel #1        │  הלקוח — קבצים סטטיים על CDN
│ Root Directory: Client  │
└───────────┬─────────────┘
            │ HTTPS
┌───────────▼─────────────┐
│ פרויקט Vercel #2        │  השרת — פונקציית Python
│ Root Directory: Server  │
└───────────┬─────────────┘
            │ PostgreSQL
┌───────────▼─────────────┐
│ Supabase                │  בסיס נתונים + אחסון תמונות
└─────────────────────────┘
```

> **חשוב:** `Client` ו-`Server` חייבים להיות **שני פרויקטים נפרדים ב-Vercel** מאותו ריפו, כל אחד עם `Root Directory` משלו. אי אפשר לפרוס את שניהם כפרויקט אחד.

**סדר ההקמה המומלץ:** Supabase → שרת → לקוח. הלקוח צריך לדעת את כתובת השרת בזמן הבנייה.

---

## 2. שלב א' — הקמת Supabase

### 2.1 יצירת הפרויקט

1. היכנסו ל-[supabase.com](https://supabase.com) → **New Project**.
2. מלאו שם פרויקט וסיסמה חזקה לבסיס הנתונים.
   > 🔴 **שמרו את הסיסמה במקום בטוח מיד.** Supabase לא מציגה אותה שוב, ואיפוס מחייב שינוי בכל הסביבות.
3. בחרו אזור (Region) **קרוב לאזור שבו תפרסו את השרת ב-Vercel** — זה משפיע ישירות על זמני התגובה.
4. המתינו לסיום ההקמה (1–2 דקות).

### 2.2 הפעלת תוסף pgvector

**שלב חובה.** בלעדיו השרת ייכשל בעלייה.

**Database** → **Extensions** → חפשו `vector` → הפעילו.

לחלופין, דרך **SQL Editor**:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

### 2.3 השגת מחרוזת החיבור

**Project Settings** → **Database** → **Connection string**.

Supabase מציעה שתי אפשרויות, וההבדל ביניהן מהותי בסביבה חסרת שרת:

| סוג | פורט | מתי להשתמש |
|------|------|-------------|
| **Transaction pooler** (Supavisor) | `6543` | ✅ **זו הבחירה הנכונה כאן** — פונקציות Vercel הן קצרות-חיים ופותחות המון חיבורים |
| Direct connection | `5432` | להרצת מיגרציות ידניות, כלי ניהול, גיבויים |

מבנה מחרוזת ה-pooler:

```
postgresql://postgres.<project-ref>:<PASSWORD>@aws-0-<region>.pooler.supabase.com:6543/postgres
```

> **למה pooler?** כל קריאה לפונקציה חסרת שרת עלולה לפתוח חיבור חדש. PostgreSQL קורס תחת מאות חיבורים בו-זמנית; ה-pooler מרבב אלפי לקוחות על מספר קטן של חיבורים אמיתיים.
>
> **מגבלת ה-pooler:** מצב transaction לא תומך במאפיינים שתלויים בסשן (טבלאות זמניות, `SET` גלובלי). הקוד כאן לא משתמש בהם, אז זה בסדר.

**המרה ל-SQLAlchemy:** אם המחרוזת מתחילה ב-`postgres://`, שנו ל-`postgresql://` — SQLAlchemy דורש את הצורה המלאה.

### 2.4 יצירת ה-bucket לתמונות

1. **Storage** → **New bucket**.
2. שם: **`products`** — בדיוק כך, באותיות קטנות. השם קבוע בקוד ואינו ניתן להגדרה.
3. סמנו **Public bucket**. הלקוח טוען את התמונות ישירות מה-URL הציבורי; bucket פרטי ישבור את כל התמונות באפליקציה.

### 2.5 השגת מפתחות ה-API

**Project Settings** → **API**:

| מה לקחת | לאיזה משתנה |
|----------|--------------|
| Project URL | `SUPABASE_URL` |
| Service role key | `SUPABASE_SERVICE_KEY` |

> ⚠️ **מפתח ה-service role עוקף את כל מדיניות ההרשאות (RLS).** הוא מיועד לשרת בלבד. לעולם אל תכניסו אותו ללקוח, לריפו או לכל מקום שנחשף לדפדפן.

### 2.6 הקמת הסכימה

לאחר שהשרת יעלה בפעם הראשונה הוא ייצור את הטבלאות בעצמו. אם משהו חסר, קראו פעם אחת ל:

```
GET https://<כתובת-השרת>/api/run-migrations
```

> ⚠️ הנתיב הזה **אינו מוגן באימות** ומריץ DDL. שקלו להסיר אותו או להוסיף לו הגנה לפני שהשרת נחשף לאינטרנט הפתוח.

---

## 3. שלב ב' — פריסת השרת ל-Vercel

### 3.1 יצירת הפרויקט

1. Vercel → **Add New** → **Project** → בחרו את הריפו.
2. **Root Directory**: `Server` ← קריטי.
3. Framework Preset: Vercel מזהה Flask אוטומטית. אם לא, בחרו **Other**.
4. **אל תפרסו עדיין** — קודם הגדירו את משתני הסביבה.

### 3.2 משתני סביבה

**Settings** → **Environment Variables**. הוסיפו לכל הסביבות (Production, Preview, Development):

| משתנה | ערך |
|--------|-----|
| `DATABASE_URL` | מחרוזת ה-pooler מ-Supabase (פורט 6543) |
| `JWT_SECRET` | מחרוזת אקראית — ראו למטה |
| `SUPABASE_URL` | כתובת פרויקט ה-Supabase |
| `SUPABASE_SERVICE_KEY` | מפתח ה-service role |
| `AI_ENABLED` | `true` או `false` |
| `OPENAI_API_KEY` | רק אם `AI_ENABLED=true` |

ייצור `JWT_SECRET`:

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

> 🔴 **אל תשאירו את `JWT_SECRET` ריק.** בהיעדרו הקוד נופל לערך קבוע שכתוב בקוד המקור, וכל מי שקרא אותו יכול לזייף טוקן של מנהל.
>
> 💡 **טיפ:** השתמשו במפתח **שונה** לסביבת Preview ולסביבת Production. כך טוקן מסביבת בדיקות לא יעבוד בייצור.

### 3.3 קובץ ההגדרות

הקובץ `Server/vercel.json` הקיים משתמש בסכימה הישנה של Vercel:

```json
{
  "builds": [{ "src": "app.py", "use": "@vercel/python" }],
  "routes": [{ "src": "/(.*)", "dest": "app.py" }]
}
```

הוא עדיין עובד. **נכון לגרסת Vercel הנוכחית, אפליקציית Flask עם `app.py` בשורש נפרסת ללא קונפיגורציה כלל** — Vercel מזהה את מופע ה-`app` אוטומטית. אם תיתקלו בבעיות, נסו למחוק את הקובץ ולתת ל-Vercel לזהות לבד.

### 3.4 פריסה ובדיקה

לחצו **Deploy**, ואז:

```bash
curl https://<כתובת-השרת>/api/status
# {"status":"Flask is running and connected to PostgreSQL!"}
```

### 3.5 ⚠️ שתי בעיות ידועות בפריסה חסרת שרת

**א. קוד ההפעלה רץ בכל cold start.**

`Server/app.py` מריץ בזמן הייבוא: `CREATE EXTENSION`, `db.create_all()`, שלוש פקודות `ALTER TABLE` ובדיקת משתמש מנהל. ב-Vercel זה קורה **בכל הפעלה קרה של הפונקציה**, לא פעם אחת.

ההשלכות:

- כל cold start איטי יותר (מספר שאילתות DDL לפני התגובה הראשונה).
- למשתמש בבסיס הנתונים חייבות להיות הרשאות DDL בכל עת.
- עומס מיותר על בסיס הנתונים.

**שיפור מומלץ:** להעביר את הבלוק הזה לסקריפט חד-פעמי או להגן עליו במשתנה סביבה:

```python
if os.environ.get('RUN_STARTUP_MIGRATIONS', 'false').lower() == 'true':
    with app.app_context():
        ...
```

ואז להדליק אותו רק כשצריך.

**ב. מגבלת זמן ריצה.**

לפונקציות Vercel יש תקרת זמן ריצה. שתי נקודות קצה עלולות לחרוג ממנה על מסד נתונים גדול:

| נקודת קצה | למה איטית |
|------------|------------|
| `GET /api/system/export` | מורידה כל תמונה ב-HTTP בנפרד ובונה קובץ Excel |
| `POST /api/system/backfill-embeddings` | קריאה ל-OpenAI לכל מוצר |

אם הן נכשלות ב-timeout: הריצו אותן מול שרת מקומי שמחובר לאותו בסיס נתונים, או הגדילו את מגבלת הזמן בהגדרות הפרויקט.

---

## 4. שלב ג' — פריסת הלקוח ל-Vercel

### 4.1 יצירת הפרויקט

1. Vercel → **Add New** → **Project** → אותו ריפו.
2. **Root Directory**: `Client`
3. Framework Preset: **Vite** (זיהוי אוטומטי)
4. Build Command: `npm run build` · Output Directory: `dist`

### 4.2 משתנה הסביבה

| משתנה | ערך |
|--------|-----|
| `VITE_API_URL` | `https://<כתובת-השרת-מסעיף-3>` |

⚠️ ללא סלאש בסוף.

> 🔴 **הערך נצרב לתוך קבצי ה-JavaScript בזמן הבנייה.** אם תשנו אותו מאוחר יותר, **חייבים לבנות ולפרוס מחדש** (Deployments → ⋯ → Redeploy). שינוי המשתנה לבדו לא ישפיע על פריסה קיימת.
>
> ⚠️ כל משתנה `VITE_*` **גלוי לכל מי שפותח את קוד המקור בדפדפן**. אל תשימו כאן סודות.

### 4.3 ניתוב SPA

הקובץ `Client/vercel.json` כבר מטפל בזה:

```json
{ "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
```

בלעדיו, רענון בכתובת כמו `/settings` יחזיר 404. **אל תמחקו את הקובץ.**

---

## 5. שלב ד' — חיבור סופי ואבטחה

### 5.1 הגבלת CORS

כרגע השרת מגדיר `CORS(app)` — כל מקור מורשה. אחרי שכתובת הלקוח ידועה, עדכנו ב-`Server/app.py`:

```python
CORS(app, origins=[
    "https://your-client.vercel.app",
    "http://localhost:5173",           # פיתוח מקומי
])
```

> שימו לב שכתובות ה-Preview של Vercel דינמיות. אם אתם משתמשים בהן, תצטרכו תבנית regex או להשאיר את הפיתוח פתוח.

### 5.2 החלפת סיסמת המנהל

היכנסו עם `admin` / `admin` והחליפו מיד. המערכת כופה זאת בכניסה הראשונה, אך ודאו שזה אכן בוצע.

### 5.3 בדיקת קבלה

| # | בדיקה | תוצאה מצופה |
|---|--------|--------------|
| 1 | `GET /api/status` | הודעת חיבור מוצלח |
| 2 | כניסה עם משתמש מנהל | הפניה למסך החלפת סיסמה |
| 3 | טעינת קטלוג המוצרים | הרשימה נטענת, ללא שגיאות בקונסולה |
| 4 | הוספת מוצר עם תמונה | התמונה נשמרת ומוצגת מ-Supabase |
| 5 | יצירת ארוחה | נשמרת ומופיעה בקטלוג |
| 6 | ניסיון מחיקת קטגוריה בשימוש | נחסם עם הודעה בעברית (409) |
| 7 | חיפוש סמנטי (אם `AI_ENABLED=true`) | תוצאות רלוונטיות |
| 8 | רענון דף בכתובת `/settings` | הדף נטען, לא 404 |
| 9 | כניסה כ-`lineworker` | רואה רק את מסך הארוחות ואת מסך עובד הפס |

---

## 6. סיכום משתני הסביבה לפי סביבה

### פרויקט השרת

| משתנה | Production | Preview | מקומי |
|--------|------------|---------|--------|
| `DATABASE_URL` | Supabase pooler (6543) | Supabase pooler (עדיף מסד נפרד) | Docker מקומי |
| `JWT_SECRET` | ייחודי | ייחודי (שונה) | כל ערך |
| `SUPABASE_URL` | ✅ | ✅ | ✅ |
| `SUPABASE_SERVICE_KEY` | ✅ | ✅ | ✅ |
| `AI_ENABLED` | לפי החלטה | מומלץ `false` (חיסכון) | `false` |
| `OPENAI_API_KEY` | אם רלוונטי | אם רלוונטי | אופציונלי |

### פרויקט הלקוח

| משתנה | Production | Preview | מקומי |
|--------|------------|---------|--------|
| `VITE_API_URL` | כתובת השרת בייצור | כתובת השרת ב-Preview | `http://localhost:5000` |

> **המלצה חזקה:** הקימו **פרויקט Supabase נפרד** ל-Preview/Staging. פריסת Preview שמחוברת לבסיס הייצור תריץ עליו DDL בכל cold start ותאפשר מחיקת נתונים אמיתיים מסביבת בדיקות.

---

## 7. פתרון תקלות בפריסה

### השרת מחזיר 500 בכל בקשה

בדקו ב-Vercel → **Logs**. הגורמים השכיחים:

| שגיאה בלוג | סיבה |
|-------------|-------|
| שגיאה בייבוא `supabase` / `create_client` | `SUPABASE_URL` או המפתח חסרים. השרת קורס בזמן הייבוא |
| `could not translate host name` | `DATABASE_URL` שגוי, או שחסר `postgresql://` בהתחלה |
| `type "vector" does not exist` | pgvector לא הופעל ב-Supabase — ראו 2.2 |
| `password authentication failed` | סיסמת בסיס הנתונים שגויה במחרוזת החיבור |

### `remaining connection slots are reserved` / חיבורים אוזלים

אתם משתמשים בחיבור ישיר (פורט 5432) במקום ב-pooler. החליפו ל-**Transaction pooler בפורט 6543**.

### הלקוח עולה אך ריק לגמרי

`VITE_API_URL` לא נצרב. פתחו F12 → Network — אם הכתובות מתחילות ב-`undefined/api/`, הגדירו את המשתנה **ובצעו Redeploy**. שינוי המשתנה בלבד לא מספיק.

### שגיאות CORS

ודאו שהשרת רץ ושהכתובת ב-`VITE_API_URL` מדויקת (כולל `https://`, ללא סלאש בסוף). אם הגבלתם CORS בסעיף 5.1, ודאו שכתובת הלקוח מופיעה ברשימה.

### תמונות לא נטענות

ה-bucket אינו ציבורי. **Storage** → `products` → הגדרות → סמנו Public.

### 404 ברענון דף פנימי

`Client/vercel.json` נמחק או שהפרויקט לא נבנה מחדש. ראו 4.3.

### הפריסה נופלת בשלב הבנייה

- **לקוח:** `npm run build` מריץ `tsc -b` — שגיאת טיפוסים תפיל את הבנייה. הריצו מקומית קודם.
- **שרת:** אין נעילת גרסאות ב-`requirements.txt`. גרסה חדשה של תלות עלולה לשבור את הבנייה בלי ששיניתם דבר. אם פריסה שעבדה בעבר נכשלת פתאום — זה החשוד המיידי. פתרון: נעלו גרסאות בקובץ.

---

## 8. הערה על ה-CI הקיים

הקובץ `.github/workflows/deploy.yml` בונה ופורס את תיקיית **`Prototype/`** ל-GitHub Pages — כלומר את הגרסה הישנה, **לא** את `Client/` הנוכחית.

**המלצה:** למחוק או לעדכן את ה-workflow הזה כדי למנוע בלבול. אין כרגע שום CI שבודק, בונה או פורס את הקוד הפעיל — הפריסה מתבצעת דרך אינטגרציית Git של Vercel.

---

## מקורות

- [Deploy a Flask app on Vercel](https://vercel.com/docs/frameworks/backend/flask)
- [Using the Python Runtime with Vercel Functions](https://vercel.com/docs/functions/runtimes/python)
- [Connect to your database — Supabase Docs](https://supabase.com/docs/guides/database/connecting-to-postgres)
- [Supavisor and Connection Terminology Explained — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/supavisor-and-connection-terminology-explained-9pr_ZO)
- [Using SQLAlchemy with Supabase — Supabase Docs](https://supabase.com/docs/guides/troubleshooting/using-sqlalchemy-with-supabase-FUqebT)

---

[→ הקודם: הרצה מקומית](04-local-setup.md) | [חזרה לאינדקס](README.md)
