# Client

## Setup & Installation

If you are pulling this project from Git for the first time, you need to install the dependencies:

```bash
npm install
```

### Styling (Tailwind CSS)

This project uses **Tailwind CSS v4** for styling instead of Bootstrap.

The installation process for Tailwind was:

1. Installed dependencies: `npm install tailwindcss @tailwindcss/postcss postcss autoprefixer`
2. Configured `postcss.config.js` to use `@tailwindcss/postcss`.
3. Configured `tailwind.config.js` with the correct content paths (`./index.html` and `./src/**/*.{js,ts,jsx,tsx}`).
4. Imported Tailwind in `src/index.css` using `@import "tailwindcss";`.

**Note:** If you encounter a PostCSS error when running `npm run dev` after pulling, ensure your packages are up to date with `npm install`, or restart the Vite dev server.

## Font

This project uses the **Heebo** font from Google Fonts.
