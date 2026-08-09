# הלקוח — אפליקציית React

[חזרה לאינדקס](README.md)

---

## 1. סקירה

הלקוח הוא **SPA** (Single Page Application) — אפליקציה שנטענת פעם אחת ומנהלת ניווט פנימי ללא רענון דף. היא נבנית לקבצים סטטיים ומוגשת מ-CDN.

| פרט | ערך |
|------|-----|
| ספרייה | React 19 |
| שפה | TypeScript |
| כלי בנייה | Vite 7 |
| עיצוב | Tailwind CSS 4 |
| ניתוב | React Router 6 |
| גופן | Heebo (נטען מ-Google Fonts) |
| כיווניות | RTL — `<html lang="he" dir="rtl">` |
| שם התצוגה | NutriCheck |
| פורט מקומי | 5173 |

**HTTP:** האפליקציה משתמשת ב-`fetch` המובנה של הדפדפן. אין axios ואין שכבת API מרכזית.

---

## 2. פקודות

מתוך תיקיית `Client/`:

| פקודה | תיאור |
|--------|--------|
| `npm install` | התקנת תלויות |
| `npm run dev` | שרת פיתוח עם רענון חם, על פורט 5173 |
| `npm run build` | בדיקת טיפוסים (`tsc -b`) ואז בנייה לתיקיית `dist/` |
| `npm run preview` | תצוגה מקומית של תוצר הבנייה |
| `npm run lint` | ESLint |

מנהל החבילות הוא **npm** (קיים `package-lock.json`).

---

## 3. מבנה התיקייה

```
Client/
├── index.html              דף הבסיס — RTL, גופן Heebo, כותרת NutriCheck
├── vite.config.ts          קונפיגורציית Vite (מינימלית)
├── tsconfig*.json          קונפיגורציית TypeScript
├── eslint.config.js        כללי ESLint
├── postcss.config.js       חיבור Tailwind דרך PostCSS
├── tailwind.config.js      ⚠️ שריד מ-Tailwind 3 — אינו בשימוש בפועל
├── vercel.json             נפילה חזרה ל-index.html (SPA)
├── .env                    VITE_API_URL (לא בגיט)
├── public/                 logo.png, logo.svg
└── src/
    ├── main.tsx            נקודת כניסה — StrictMode > BrowserRouter > AuthProvider > App
    ├── App.tsx             טבלת הניתובים + תפריט הצד
    ├── types.ts            טיפוסים משותפים
    ├── index.css           Tailwind + גופן + אנימציות
    ├── pages/              מסכים (9 קבצים, 8 בשימוש)
    ├── components/         רכיבים לפי תחום
    ├── hooks/              לוגיקה משותפת (10 hooks)
    ├── context/            AuthContext
    └── utils/              עזרים
```

---

## 4. ניתוב והרשאות

מוגדר ב-`src/App.tsx`. כל המסכים למעט ההתחברות עטופים ב-`ProtectedRoute`.

| נתיב | מסך | מי מורשה |
|------|------|-----------|
| `/login` | `LoginPage` | פתוח |
| `/change-password` | `ChangePasswordPage` | כל משתמש מחובר |
| `/` | `ProductsPage` | `admin`, `dietitian` |
| `/settings` | `ProductSettingsPage` | `admin`, `dietitian` |
| `/meals` | `MealsCatalogPage` | `admin`, `dietitian`, `lineworker` |
| `/meals/create` | `CreateMealPage` | `admin`, `dietitian` — **מיושן**, הוסר מהתפריט |
| `/lineworker` | `LineWorkerProductsPage` | `admin`, `lineworker` |
| `/admin` | `AdminPage` | `admin` בלבד |

**אין נתיב `*` (404).** כתובת לא מוכרת תציג את תפריט הצד ואזור תוכן ריק.

### לוגיקת `ProtectedRoute`

בסדר הזה:

1. אין משתמש → הפניה ל-`/login`
2. `must_change_password` דלוק → הפניה ל-`/change-password`
3. התפקיד אינו ברשימת המורשים → הפניה לדף הבית של התפקיד (`lineworker` → `/lineworker`, אחרת `/`)

> ⚠️ **זו הגנה חזותית בלבד.** כל הבדיקות רצות בדפדפן ומיושמות כהפניות. הן מונעות בלבול, לא גישה. האכיפה האמיתית חייבת להיות בשרת — ראו את מפת ההגנה ב-[01-server.md](01-server.md#4-אימות-והרשאות).

---

## 5. ניהול הזדהות — `context/AuthContext.tsx`

מספק לכל האפליקציה: `user`, `token`, `login()`, `logout()`, `updateUser()`, `authFetch()`.

### אחסון הטוקן

הטוקן והמשתמש נשמרים ב-**`localStorage`** בשני מפתחות:

| מפתח | תוכן |
|------|------|
| `auth_token` | ה-JWT כמחרוזת גולמית |
| `auth_user` | אובייקט המשתמש כ-JSON |

המצב נטען מ-`localStorage` בעלייה, ולכן הסשן שורד רענון דף וסגירת דפדפן — עד לפקיעת הטוקן (30 יום).

> ⚠️ `localStorage` נגיש לכל סקריפט שרץ בדף. במקרה של פרצת XSS הטוקן ניתן לגניבה. חלופה בטוחה יותר היא עוגייה מסוג `HttpOnly` — שינוי שדורש עבודה גם בשרת.

### `authFetch`

עוטף את `fetch` ומוסיף אוטומטית:

```
Content-Type: application/json
Authorization: Bearer <token>
```

בתגובת **401** הוא מבצע `logout()` אוטומטי. זהו מנגנון פקיעת הסשן היחיד — אין בדיקת תוקף יזומה ואין סנכרון בין טאבים.

> קריאות להעלאת תמונות משתמשות ב-`fetch` רגיל ולא ב-`authFetch`, כי הכותרת `Content-Type` חייבת להיות `multipart/form-data`.

---

## 6. חיבור לשרת

**משתנה סביבה יחיד: `VITE_API_URL`.**

```
VITE_API_URL=http://localhost:5000
```

> 🔴 **קריטי לפריסה:** ב-Vite משתני `VITE_*` **נצרבים לתוך קבצי ה-JavaScript בזמן הבנייה** — הם אינם נקראים בזמן ריצה. שינוי כתובת השרת מחייב **בנייה מחדש ופריסה מחדש** של הלקוח. אי אפשר לשנות את זה דרך הגדרות הסביבה בלבד.

**אין ערך ברירת מחדל.** אם המשתנה חסר, כל הקריאות ילכו לכתובת `undefined/api/...` ויכשלו.

הכתובת נקראת ב-18 קבצים שונים, בשתי צורות (`const API = import.meta.env.VITE_API_URL` או שרשור ישיר). **אין מודול API מרכזי** — אם תרצו להוסיף לוגיקה גלובלית (ניסיונות חוזרים, לוגים, כותרות), זה ידרוש ריפקטור.

---

## 7. מפת המסכים

| מסך | קובץ | תיאור |
|------|-------|--------|
| התחברות | `pages/LoginPage.tsx` | טופס שם משתמש/סיסמה |
| החלפת סיסמה | `pages/ChangePasswordPage.tsx` | כפוי בכניסה ראשונה. מינימום 4 תווים |
| קטלוג מוצרים | `pages/ProductsPage.tsx` | תצוגת הדיאטנים — כרטיסים גדולים, סינון, חיפוש סמנטי, מוצרים דומים |
| קטלוג עובד פס | `pages/LineWorkerProductsPage.tsx` | תצוגה מצומצמת — כרטיסים קטנים |
| הגדרות | `pages/ProductSettingsPage.tsx` | ניהול מוצרים + ארבע טבלאות המשתנים |
| קטלוג ארוחות | `pages/MealsCatalogPage.tsx` | רשימת ארוחות, יצירה ועריכה במגירות |
| בניית ארוחה | `pages/CreateMealPage.tsx` | **מיושן** — הוחלף במגירות שבקטלוג |
| ניהול משתמשים | `pages/AdminPage.tsx` | יצירה, שינוי תפקיד, איפוס סיסמה, מחיקה |

> `pages/CategorySettingsPage.tsx` קיים בקוד אך **אינו מיובא בשום מקום ואין לו ניתוב** — קוד מת שניתן למחוק.

---

## 8. רכיבים לפי תחום

| תיקייה | תוכן עיקרי |
|---------|-------------|
| `components/layout/` | `SideMenu` (תפריט צד עם סינון לפי תפקיד), `ProtectedRoute`, `TopBar`, `Loader`, `LoadingGuard`, `Toast` |
| `components/products/` | `ProductBig`, `ProductSmall`, `FilterBar`, `SimilarFoodsPopup`, `OutlierWarningPopup` |
| `components/meal/` | `MealCard`, `MealCreateDrawer`, `MealEditDrawer`, `ProductLibrary`, `MealIngredientsList`, `MealNutritionSummary`, ועוד |
| `components/settings/` | `AddProductForm`, `ProductExpandedRow`, ארבע טבלאות המשתנים, `DeleteVariableDialog`, `UsageBadge` |
| `components/admin/` | `UserTable`, `AddUserModal`, `ResetPasswordModal`, `RoleSelect` |
| `components/login/` | `PasswordInput` |

### תפריט הצד

`SideMenu.tsx` מכיל מערך `NAV_ITEMS` שבו לכל פריט יש רשימת `roles`. פריט שלא מתאים לתפקיד המשתמש כלל לא מוצג. זהו המקום היחיד שצריך לעדכן כדי להוסיף או להסתיר מסך מהתפריט.

---

## 9. Hooks

| Hook | תפקיד |
|------|--------|
| `useProductCatalog` | טעינת המוצרים, הקטגוריות, הרגישויות והמרקמים; קיבוץ לקטלוג |
| `useProductFilters` | מצב הסינון; מסווג כל מוצר ל-`regular` / `warning` / `hidden` |
| `useFilteredProducts` | החלת הסינון בפועל + סימון אלרגנים |
| `useVariableUsage` | זרימת המחיקה המוגנת של משתני ההגדרות |
| `useSemanticSearch` | חיפוש בשפה חופשית עם השהיה (debounce) |
| `useSimilarProducts` | שליפת מוצרים דומים |
| `useAiEnabled` | בדיקה חד-פעמית האם ה-AI פעיל בשרת |
| `useAllergenNames` | תרגום מזהי רגישויות לשמות |
| `useMealNutritionTotals` | סיכום ערכים תזונתיים של ארוחה |
| `useToast` | ניהול הודעות קופצות |

---

## 10. עיצוב — Tailwind CSS 4

ההגדרה מבוססת PostCSS:

- `postcss.config.js` טוען את `@tailwindcss/postcss`
- `src/index.css` מתחיל ב-`@import "tailwindcss";` — נקודת הכניסה של גרסה 4
- סריקת הקבצים בגרסה 4 היא אוטומטית

> ⚠️ הקובץ `tailwind.config.js` הוא **שריד מגרסה 3 ואינו נטען**. שינויים בו לא ישפיעו על שום דבר. אם תרצו התאמות עיצוב, השתמשו בבלוק `@theme` בתוך `index.css`.

`autoprefixer` מותקן אך אינו רשום כתוסף PostCSS — כלומר אינו פועל.

---

## 11. ניקיון קוד — פריטים לתשומת לב

| ממצא | השפעה |
|-------|--------|
| `recharts` מותקן אך לא מיובא בשום מקום | מנפח את חבילת ה-node_modules; ניתן להסיר |
| `autoprefixer` מותקן אך לא מחובר | ללא השפעה; ניתן להסיר |
| `tailwind.config.js` אינו נטען | מבלבל מפתחים חדשים |
| `pages/CategorySettingsPage.tsx` — קוד מת | ניתן למחוק |
| `public/vite.svg`, `src/react.svg` — שרידי תבנית | ניתן למחוק |
| `MealCard.tsx` משתמש בטיפוס מקומי עם התפקיד `'line'` | לא תואם למחרוזת `'lineworker'` שבשימוש בכל שאר המערכת |
| אין בדיקות אוטומטיות כלל | אין רשת ביטחון לשינויים |

---

## 12. תוצר הבנייה

`npm run build` מייצר תיקיית `dist/` עם קבצים סטטיים בלבד — HTML, JS, CSS ותמונות. אין צד שרת בלקוח, ולכן ניתן להגיש אותו מכל CDN או שרת קבצים.

**חובה להגדיר "SPA fallback"** — כל נתיב שאינו קובץ קיים חייב להחזיר את `index.html`, אחרת רענון בכתובת כמו `/settings` יחזיר 404. הקובץ `Client/vercel.json` כבר עושה זאת:

```json
{ "rewrites": [ { "source": "/(.*)", "destination": "/index.html" } ] }
```

---

[→ הקודם: השרת](01-server.md) | [חזרה לאינדקס](README.md) | [הבא: בסיס הנתונים ←](03-database.md)
