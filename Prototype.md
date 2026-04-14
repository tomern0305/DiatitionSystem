# Dietitian System - Prototype Overview

## What We Have Built So Far

### Authentication & User Management
- JWT-based login/logout with token refresh
- Role-based access control: **Admin**, **Dietitian**, **Line Worker**
- Admin panel for creating users, resetting passwords, and changing roles
- Change-password page for users

### Product Management
- Full CRUD for food products (add, edit, delete)
- Each product has: name, category, texture, sensitivities (allergens), diets, nutritional values (calories, protein, carbs, fat, fiber, sodium), embedding(hidden) and a free-form properties field
- Product images uploaded to **Supabase** cloud storage
- Line Worker view — a simplified read-only product browser

### Category & Metadata Settings
- Manage **Categories**, **Textures**, **Sensitivities**, and **Diets** from a dedicated settings area
- All are stored in the database and referenced by products

### Meal Builder
- Create meals by picking products from a searchable library
- Auto-calculated nutritional totals (snapshot saved at creation)
- Meals catalog page listing all saved meals

### AI / Vector Features (Infrastructure Only)
- Each product stores a **6-dimensional nutrition vector** and a **1536-dimensional OpenAI embedding** (pgvector)
- Embeddings are generated automatically when a product is added or updated (controlled by AI_ENABLED .env flag)
- **Note:** The AI/ML infrastructure is in place but no AI features are exposed to users yet. The plan is to first complete all dietitian-requested features, and only then decide how and what AI/ML capabilities to add.

### Import / Export
- Export the full product database + images as a ZIP file (CSV + `images/` folder) (This part is missing the Meals data and will be added soon)
- Import from a ZIP to restore or migrate data to another environment

---

## Folder Structure & Technology

### `Client/` - Frontend
**Technology:** React 18 · TypeScript · Vite · Tailwind CSS · React Router v6


### `Server/` - Backend
**Technology:** Python · Flask · SQLAlchemy · PostgreSQL + pgvector · Docker · Supabase (images)


**Database** runs in Docker (we do have production DB in SuperBase for the app that the Hospital runs)

---

## Planned Features


### Meal Builder
- We are wating on the feedback of the diatiton and we will probably make changes to the meal building page


### Import / Export
- currently the import / export only does the products and the params for the products, we plane to include the meals and diets for easy backup

### AI-Powered Features (Future - Scope TBD)
- The AI/ML direction is not yet decided. We will first complete all dietitian-requested features and gather feedback before committing to any AI roadmap.
- Possible directions include: natural language product search, AI-suggested meals, or patient-profile-based recommendations — but none of these are confirmed or scheduled

