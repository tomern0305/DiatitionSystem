# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Working Principles

- **Neat code**: Keep code clean, consistent, and readable at all times.
- **Component-based**: Break UI and logic into focused, reusable components. Prefer many small files over few large ones.
- **File length**: Keep files under 300 lines. If a file grows beyond this, extract components or helpers into separate files.
- **Documentation**: Add up to 2 lines of comments per function or logical section — enough to explain intent, not implementation details.
- **Update this file**: When making significant architectural changes, adding new routes/components, or changing conventions — update CLAUDE.md to reflect the new state.

## Commands

### Frontend (Client/Client/)
```bash
npm run dev       # Start Vite dev server with HMR
npm run build     # Type-check + build production bundle (tsc -b && vite build)
npm run lint      # Run ESLint
npm run preview   # Preview production build
```

### Backend (Server/)
```bash
python app.py     # Start Flask API on 0.0.0.0:5000
```

### Database (Docker)
```bash
docker-compose up -d                                                                          # Start PostgreSQL container
docker-compose down                                                                           # Stop container
docker exec -i dietitian_db psql -U admin -d hospital_system < hospital_backup.sql           # Restore backup
docker exec -t dietitian_db pg_dump -U admin -d hospital_system > hospital_backup.sql        # Create backup
```

## Architecture

Three-tier system: React SPA → Flask REST API → PostgreSQL (with pgvector).

### Frontend (`Client/Client/src/`)
- **TypeScript + Tailwind CSS + React Router v6**
- **App.tsx** is the root — defines all `<Route>` entries; `SideMenu` is rendered globally
- Pages live in `assets/pages/`, reusable components in `assets/components/` (sub-folders: `ui/`, `products/`, `settings/`, `meal/`, `login/`)
- API base URL set via `VITE_API_URL` env variable; called as `` `${import.meta.env.VITE_API_URL}/api/...` ``

**Routes:**
| Path | Page |
|------|------|
| `/` | ProductsPage |
| `/settings` | ProductSettingsPage |
| `/settings/categories` | CategorySettingsPage |
| `/lineworker` | LineWorkerProductsPage |
| `/meals` | MealsCatalogPage |
| `/meals/create` | CreateMealPage |
| `/login` | LoginPage |

### Backend (`Server/`)
- **app.py** — Flask entry point; registers Blueprints and enables CORS
- **models.py** — SQLAlchemy models: `FoodItem`, `Meal`, `Category`, `Texture`, `Sensitivity`, `Diet`
- **routes/** — One Blueprint module per resource: `products`, `meals`, `categories`, `sensitivities`, `textures`, `diets`, `system`
- Database migrations run via `GET /api/run-migrations`
- Images are stored in **Supabase** cloud storage; `image_url` in `FoodItem` points there
- `FoodItem` has `nutrition_vector` (6D) and `openai_embedding` (1536D pgvector columns) for AI/ML features

### Key API Endpoints
| Resource | Prefix |
|----------|--------|
| Products / images | `/api/products`, `/api/upload` |
| Meals | `/api/meals` |
| Categories | `/api/categories` |
| Sensitivities | `/api/sensitivities` |
| Textures | `/api/texture` |
| Diets | `/api/diets` |
| Export / Import | `/api/system/export`, `/api/system/import` |
| Health | `/api/status` |

Export (`/api/system/export`) produces a ZIP with CSV files and an `images/` folder; import reverses this.

### Data Notes
- `Meal` saves a JSON array of `product_ids` and a nutritional snapshot (totals) at creation time
- `FoodItem.contains` and `may_contain` are stored as JSONB arrays of sensitivity names
- `FoodItem.properties` is a freeform JSONB field