# My Todo App

A modern, responsive todo app built with **Vite + React + TypeScript**, **Redux Toolkit**, **React Router** and **Tailwind CSS** — in **English and Persian (فارسی)**, with light and dark themes.

## Features

- 🔐 **Accounts** — register, log in, change username and password (passwords are salted and hashed)
- ✅ **Todos** — complete, star, edit, archive and delete; priority, due date and description
- 🗂️ **Categories** — color-coded; selecting one shows only that category's todos
- ⭐ **Dashboard** — your 5 most important starred todos, stats and per-category progress
- 🌗 **Light / dark theme**
- 🌍 **English / Persian** — full right-to-left layout, Persian digits and calendar
- 📱 **Responsive** — sidebar on desktop; drawer and bottom tab bar on mobile
- 💾 **Saved in localStorage** — behind a storage interface, ready to swap for a database

## Getting started

Requires [Node.js](https://nodejs.org/) 20 or newer.

```bash
npm install
npm run dev
```

Then open http://localhost:5173 and create an account.

| Command | What it does |
|---|---|
| `npm run dev` | Start the dev server |
| `npm run build` | Type-check and build for production into `dist/` |
| `npm run preview` | Serve the production build locally |
| `npm run lint` | Lint with oxlint |

## Documentation

See **[WALKTHROUGH.md](./WALKTHROUGH.md)** for a step-by-step explanation of how the app was built, the project structure, and how to move to a real database later.

## Tech stack

Vite 8 · React 19 · TypeScript 6 · Redux Toolkit · React Router 7 · Tailwind CSS 4 · i18next · lucide-react
