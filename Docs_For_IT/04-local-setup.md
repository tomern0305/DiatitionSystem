# הרצה בסביבה מקומית + משתני סביבה

[חזרה לאינדקס](README.md)

---

## 1. דרישות מוקדמות

| כלי | גרסה מומלצת | בדיקה |
|------|--------------|--------|
| Python | 3.10 ומעלה | `python3 --version` |
| Node.js | 18 ומעלה | `node --version` |
| npm | מגיע עם Node | `npm --version` |
| Docker Desktop | עדכני | `docker --version` |
| Git | עדכני | `git --version` |

**בנוסף נדרשים שני חשבונות בשירותים חיצוניים:**

| שירות | לשם מה | חובה? |
|--------|---------|--------|
| Supabase | אחסון תמונות המוצרים | **כן** — השרת לא עולה בלי המפתחות |
| OpenAI | חיפוש בשפה חופשית | לא — ניתן להריץ עם `AI_ENABLED=false` |

---

## 2. התקנה — שלב אחר שלב

### שלב 1 — שכפול הריפו

```bash
git clone <כתובת-הריפו>
cd DiatitionSystem
```

### שלב 2 — הפעלת בסיס הנתונים

```bash
cd "Data Base"
docker-compose up -d
```

בדיקה שהקונטיינר עלה:

```bash
docker ps
# אמור להופיע קונטיינר בשם dietitian_db
```

בסיס הנתונים זמין כעת ב-`localhost:5432` עם המשתמש `admin` והסיסמה `secretpassword`.

### שלב 3 — הגדרת קובץ הסביבה של השרת

צרו קובץ `Server/.env`:

```ini
# בסיס נתונים
DATABASE_URL=postgresql://admin:secretpassword@localhost:5432/hospital_system

# מפתח חתימת טוקנים — חובה! ראו הוראות ייצור בהמשך
JWT_SECRET=<הדביקו-כאן-מחרוזת-אקראית-ארוכה>

# Supabase — חובה, אחרת השרת לא יעלה
SUPABASE_URL=https://<project-ref>.supabase.co
SUPABASE_SERVICE_KEY=<המפתח-מלוח-הבקרה-של-Supabase>

# בינה מלאכותית
AI_ENABLED=false
OPENAI_API_KEY=<מפתח-OpenAI-אם-AI_ENABLED=true>
```

**ייצור מפתח `JWT_SECRET` אקראי:**

```bash
python3 -c "import secrets; print(secrets.token_urlsafe(48))"
```

### שלב 4 — הרצת השרת

```bash
cd Server
python3 -m venv venv
source venv/bin/activate          # ב-Windows:  venv\Scripts\activate
pip install -r requirements.txt
python app.py
```

בהרצה ראשונה תראו בטרמינל:

```
Database tables created successfully!
Default admin user created (username: admin, password: admin).
```

השרת מאזין על `http://localhost:5000`. בדיקה מהירה:

```bash
curl http://localhost:5000/api/status
# {"status":"Flask is running and connected to PostgreSQL!"}
```

### שלב 5 — הגדרת קובץ הסביבה של הלקוח

צרו קובץ `Client/.env`:

```ini
VITE_API_URL=http://localhost:5000
```

⚠️ ללא סלאש בסוף.

### שלב 6 — הרצת הלקוח

```bash
cd Client
npm install
npm run dev
```

האפליקציה תיפתח ב-`http://localhost:5173`.

### שלב 7 — כניסה ראשונה

| שדה | ערך |
|------|-----|
| שם משתמש | `admin` |
| סיסמה | `admin` |

המערכת תכריח החלפת סיסמה מיד. **החליפו לסיסמה חזקה גם בסביבה מקומית** — קל לשכוח ולהעתיק את ההרגל לייצור.

---

## 3. טבלת משתני הסביבה המלאה

### 3.1 שרת — `Server/.env`

| משתנה | חובה? | תיאור | ברירת מחדל בקוד | מאיפה משיגים |
|--------|--------|--------|------------------|---------------|
| `DATABASE_URL` | מומלץ | מחרוזת חיבור ל-PostgreSQL | `postgresql://admin:secretpassword@localhost:5432/hospital_system` | Docker מקומי, או לוח הבקרה של Supabase |
| `JWT_SECRET` | 🔴 **כן** | מפתח חתימת טוקנים (HS256) | ערך קבוע שכתוב בקוד המקור | לייצר בעצמכם — ראו למעלה |
| `SUPABASE_URL` | 🔴 **כן** | כתובת פרויקט ה-Supabase | אין | Supabase → Project Settings → API |
| `SUPABASE_SERVICE_KEY` | 🔴 **כן**\* | מפתח גישה לאחסון | אין | Supabase → Project Settings → API Keys |
| `SUPABASE_ANON_KEY` | לא | חלופה ל-service key. **נבדק ראשון** | אין | אותו מקום |
| `AI_ENABLED` | לא | מתג ראשי ל-embeddings ולחיפוש סמנטי | `false` | ערך ידני: `true` / `false` |
| `OPENAI_API_KEY` | רק אם `AI_ENABLED=true` | מפתח OpenAI | אין | platform.openai.com → API keys |

\* נדרש אחד מהשניים — `SUPABASE_ANON_KEY` **או** `SUPABASE_SERVICE_KEY`. הקוד בודק קודם את ה-anon.

> 🔴 **`JWT_SECRET` אינו קיים בקובץ ה-`.env` הנוכחי של הפרויקט.** בהיעדרו הקוד משתמש בערך ברירת מחדל קבוע וידוע. מי שקרא את קוד המקור יכול לחתום טוקן של מנהל ולקבל גישה מלאה. **זהו הפריט הדחוף ביותר לתיקון.**

> ⚠️ **`SUPABASE_URL` ומפתח Supabase הם חובה קשיחה.** הקוד ב-`Server/routes/products.py` יוצר את לקוח ה-Supabase ברמת המודול ללא בדיקת תקינות. אם הם חסרים — ייבוא המודול נכשל והשרת כולו לא עולה, עם שגיאה שלא מסבירה את הסיבה.

### 3.2 לקוח — `Client/.env`

| משתנה | חובה? | תיאור | ברירת מחדל |
|--------|--------|--------|-------------|
| `VITE_API_URL` | 🔴 **כן** | כתובת הבסיס של ה-API | אין |

> 🔴 **המשתנה נצרב לקבצי ה-JS בזמן הבנייה.** הוא אינו נקרא בזמן ריצה. שינוי כתובת השרת מחייב `npm run build` ופריסה מחדש.
>
> ⚠️ אין ערך ברירת מחדל. אם המשתנה חסר, כל הקריאות ילכו ל-`undefined/api/...` והאפליקציה תיראה תקינה אך ריקה מנתונים.
>
> ⚠️ ב-Vite כל משתנה שמתחיל ב-`VITE_` **גלוי לכל מי שפותח את קוד המקור בדפדפן**. לעולם אל תשימו כאן סודות.

### 3.3 MachineLearning (אופציונלי, לא חלק מהמערכת הרצה)

| משתנה | תיאור |
|--------|--------|
| `PIXABAY_KEY` | מפתח Pixabay לשליפת תמונות מזון בסקריפט `csv_to_backup.py` |

---

## 4. מדיניות טיפול בסודות

- כל קבצי ה-`.env` **מוחרגים מגיט** ואינם נמצאים בהיסטוריה. זה נבדק ואומת.
- **אין בריפו קובץ `.env.example`.** לכן המסמך הזה הוא המקור היחיד לרשימת המשתנים הנדרשים — כדאי ליצור `.env.example` עם שמות המשתנים בלבד (ללא ערכים) כדי להקל על קליטת מפתחים חדשים.
- **סיסמת בסיס הנתונים המקומי כתובה בגלוי** בקובץ `Data Base/docker-compose.yml` שנמצא בגיט. זה מקובל לפיתוח מקומי בלבד. אין להשתמש בהגדרות האלה בשום סביבה נגישה מהרשת.
- **בייצור אין להשתמש בקבצי `.env` כלל.** יש להשתמש במנגנון משתני הסביבה של פלטפורמת האירוח (ב-Vercel: Environment Variables). ראו [05-deployment.md](05-deployment.md).
- אם מפתח דלף: החליפו אותו בשירות המקור **וגם** בכל הסביבות. החלפת `JWT_SECRET` תנתק את כל המשתמשים המחוברים — זו התנהגות רצויה במקרה של דליפה.

---

## 5. זריעת נתונים

### אפשרות א' — התחלה נקייה

לא לעשות כלום. השרת יוצר את הטבלאות ומשתמש מנהל אחד בעלייה הראשונה.

### אפשרות ב' — נתוני דמו

```bash
cd Server
python -m scripts.seed
```

טוען 50 פריטי מזון בעברית עם ערכים תזונתיים ותיוגי אלרגנים.

> 🔴 **הסקריפט הרסני.** הוא מריץ `drop_all()` לפני הזריעה — **כל הנתונים נמחקים, כולל כל המשתמשים.** אל תריצו אותו על בסיס נתונים עם נתונים אמיתיים.
>
> יש להריץ עם `python -m scripts.seed` מתוך תיקיית `Server/`, ולא `python scripts/seed.py` — אחרת הייבוא ייכשל.

### אפשרות ג' — טעינת הגיבוי שבריפו

```bash
docker exec -i dietitian_db psql -U admin -d hospital_system < "Data Base/hospital_backup.sql"
```

> ⚠️ הקובץ הזה חלקי — הוא מכיל רק `categories` ו-`food_items`. **הריצו קודם את השרת פעם אחת** כדי שכל הטבלאות ייווצרו, ורק אז טענו אותו. פירוט ב-[03-database.md](03-database.md#53-קובץ-הגיבוי-הקיים-בריפו).

### אפשרות ד' — ייבוא מגיבוי מערכת

היכנסו כמנהל → מסך הניהול → ייבוא. מקבל ZIP שנוצר על ידי `GET /api/system/export`. זו הדרך הנוחה להעביר תוכן בין סביבות, כי היא כוללת גם את התמונות.

---

## 6. סדר הפעלה יומיומי

```bash
# 1. בסיס נתונים
cd "Data Base" && docker-compose up -d

# 2. שרת (טרמינל נפרד)
cd Server && source venv/bin/activate && python app.py

# 3. לקוח (טרמינל שלישי)
cd Client && npm run dev
```

| רכיב | כתובת |
|-------|--------|
| לקוח | http://localhost:5173 |
| שרת | http://localhost:5000 |
| בסיס נתונים | localhost:5432 |

---

## 7. פתרון תקלות נפוצות

### השרת לא עולה, שגיאה בייבוא `supabase`

הסיבה כמעט תמיד: `SUPABASE_URL` או המפתח חסרים או שגויים. הקוד יוצר את הלקוח בזמן ייבוא המודול, כך שכשל שם מפיל את כל השרת.

**בדיקה:**
```bash
cd Server && python3 -c "import os; from dotenv import load_dotenv; load_dotenv(); print('URL:', bool(os.environ.get('SUPABASE_URL')), '| KEY:', bool(os.environ.get('SUPABASE_SERVICE_KEY') or os.environ.get('SUPABASE_ANON_KEY')))"
```
שני הערכים חייבים להיות `True`.

### `psycopg2.OperationalError: could not connect to server`

בסיס הנתונים לא רץ, או ש-`DATABASE_URL` שגוי.

```bash
docker ps                          # האם dietitian_db מופיע?
cd "Data Base" && docker-compose up -d
```

### `type "vector" does not exist`

תוסף pgvector לא מותקן. השרת אמור להתקין אותו בעלייה. אם לא:

```bash
docker exec -it dietitian_db psql -U admin -d hospital_system -c "CREATE EXTENSION IF NOT EXISTS vector;"
```

בדקו גם שהתמונה היא `ankane/pgvector` ולא `postgres` רגיל.

### הלקוח עולה אך כל המסכים ריקים

`VITE_API_URL` חסר או שגוי. בדקו בקונסולת הדפדפן (F12 → Network) — אם הכתובות מתחילות ב-`undefined/api/`, זו הבעיה. אחרי תיקון הקובץ יש **להפעיל מחדש** את `npm run dev`; שינוי ב-`.env` לא נקלט בריצה חמה.

### שגיאת CORS בדפדפן

אמורה להיות נדירה כי `CORS(app)` פתוח לכול. אם היא בכל זאת מופיעה, כמעט תמיד השרת לא רץ בכלל, או שיש סלאש כפול בכתובת (`http://localhost:5000//api/...`).

### 401 בכל בקשה, או ניתוק מיידי אחרי כניסה

הטוקן פג או ש-`JWT_SECRET` השתנה. התנתקו והתחברו מחדש. אם זה חוזר, ודאו שהערך זהה בכל המקומות — אין להריץ מספר מופעי שרת עם מפתחות שונים.

### החיפוש הסמנטי מחזיר 503

`AI_ENABLED` אינו `true`. שימו לב שההשוואה מדויקת — `True`, `1` או `yes` לא יעבדו.

### החיפוש הסמנטי פעיל אך התוצאות אקראיות

למוצרים אין embeddings. שתי סיבות אפשריות:

1. `OPENAI_API_KEY` היה חסר בזמן יצירתם — הקוד שמר וקטור אפסים בשקט.
2. המוצרים נוצרו לפני שהפיצ'ר הופעל.

**פתרון:** התחברו כמנהל והריצו `POST /api/system/backfill-embeddings`.

> ⚠️ שימו לב גם ש-`PUT /api/products/<id>` **אינו** מחשב embedding מחדש. מוצר שנערך שומר על ה-embedding הישן. הרצה תקופתית של backfill פותרת גם את זה.

### שינוי בסכימה לא מופיע

`db.create_all()` לא משנה טבלאות קיימות. הוסיפו `ALTER TABLE ... ADD COLUMN IF NOT EXISTS` ב-`Server/routes/system.py` והריצו `GET /api/run-migrations`. פירוט ב-[03-database.md](03-database.md#6-מיגרציות--איך-סכימה-משתנה-כאן).

---

[→ הקודם: בסיס הנתונים](03-database.md) | [חזרה לאינדקס](README.md) | [הבא: פריסה ←](05-deployment.md)
