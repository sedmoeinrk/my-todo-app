# My Todo App — Step-by-Step Walkthrough

This document explains how the app was built, one step at a time, and why each decision was made.
Every step was reviewed and approved before moving on to the next.

**Stack:** Vite 8 · React 19 · TypeScript 6 · Redux Toolkit · React Router 7 · Tailwind CSS 4 · i18next · lucide-react

---

## Table of contents

1. [Scaffolding the project](#step-1--scaffolding-the-project)
2. [State management & data model](#step-2--state-management--data-model)
3. [Authentication](#step-3--authentication)
4. [Todos & categories](#step-4--todos--categories)
5. [Dashboard](#step-5--dashboard)
6. [Routing & responsive layout](#step-6--routing--responsive-layout)
7. [Theme & language (English / Persian)](#step-7--theme--language-english--persian)
8. [Polish & browser testing](#step-8--polish--browser-testing)
9. [Documentation & GitHub](#step-9--documentation--github)
- [Addition — Persian date picker](#addition--persian-date-picker)
- [Project structure](#project-structure)
- [Moving to a real database later](#moving-to-a-real-database-later)
- [Known limitations](#known-limitations)

---

## Step 1 — Scaffolding the project

**Goal:** a clean, modern React + TypeScript project.

1. Created the project with Vite's React + TypeScript template:
   ```bash
   npx create-vite@latest . --template react-ts
   ```
2. Installed the libraries the app needs:
   ```bash
   npm install @reduxjs/toolkit react-redux react-router-dom i18next react-i18next
   npm install -D tailwindcss @tailwindcss/vite
   ```
3. Registered Tailwind as a Vite plugin in `vite.config.ts` (Tailwind v4 needs no `tailwind.config.js`).
4. Removed the Vite demo content and created the folder layout (`app/`, `features/`, `components/`, `pages/`, `i18n/`, `lib/`).
5. Set up `src/index.css`:
   - a custom **brand color palette** (`brand-50` … `brand-900`),
   - **class-based dark mode** (`@custom-variant dark`) so the in-app toggle — not only the OS setting — controls the theme,
   - the **Vazirmatn** font for Persian and **Inter** for English.

> **Why Vite?** Instant dev server start, fast hot reload, and a tiny production build.

---

## Step 2 — State management & data model

**Goal:** all app data lives in Redux and is saved to `localStorage`, in a way that can later be swapped for a real database.

### Data model (`src/types.ts`)

| Type | Main fields |
|---|---|
| `User` | `id`, `username`, `passwordHash`, `salt`, `createdAt` |
| `Category` | `id`, `userId`, `name`, `nameKey?` (for translated defaults), `color` |
| `Todo` | `id`, `userId`, `categoryId`, `title`, `description`, `priority`, `starred`, `completed`, `archived`, `dueDate`, timestamps |

Every category and todo stores its `userId`, so several accounts on the same device never see each other's data.

### Redux slices (`src/features/*/…Slice.ts`)

| Slice | Responsibility |
|---|---|
| `auth` | users list, currently logged-in user |
| `categories` | add / rename / recolor / delete categories; seeds *Personal, Work, Shopping* for new users |
| `todos` | add / edit / complete / star / archive / delete todos; deleting a category also deletes its todos |
| `settings` | theme (`light`/`dark`) and language (`en`/`fa`) |

Selectors (built with `createSelector`, so they're memoized) answer questions like *"todos in this category"*, *"archived todos"*, and *"top 5 starred"*.

**"Most important" ordering** (`compareByImportance`): priority (High → Low), then nearest due date (no date last), then newest.

### Persistence (`src/lib/storage.ts` + `src/app/store.ts`)

- All reads/writes go through a small `StorageAdapter` interface (`load`, `save`, `remove`).
- `localStorageAdapter` implements it, wrapping each value as `{ version, data }` so the format can be migrated later.
- The store loads saved data on startup and **saves only the slices that changed** after each action.

### Typed hooks (`src/app/hooks.ts`)

`useAppSelector` and `useAppDispatch` are typed versions of the Redux hooks, used everywhere instead of the plain ones.

---

## Step 3 — Authentication

**Goal:** register / log in / log out, plus changing username and password.

- **Password hashing** (`src/lib/crypto.ts`): PBKDF2 with SHA-256, 100,000 iterations and a random per-user salt, using the browser's built-in Web Crypto API. Plain passwords are never stored.
- **Auth logic** (`src/features/auth/authThunks.ts`) — async thunks that validate input and return translatable error keys:
  - `register` — username 3–24 characters (Persian letters allowed), unique (case-insensitive); password ≥ 6 characters.
  - `login` — the same error for "unknown user" and "wrong password", so usernames can't be probed.
  - `changeUsername` — cannot take a name another user already has.
  - `changePassword` — requires the current password.
- **Route guards** (`RouteGuards.tsx`): `RequireAuth` sends visitors to `/login` (and back to where they were after logging in); `RequireGuest` keeps logged-in users away from login/register.
- **Pages:** `LoginPage`, `RegisterPage`, and the *Account* section of `SettingsPage`.

> ⚠️ This protects data only *on this device*. Real security needs a backend (see [Moving to a real database later](#moving-to-a-real-database-later)).

---

## Step 4 — Todos & categories

**Goal:** full todo management with categories.

- **Add / edit form** (`TodoFormDialog.tsx`): title, description, category, priority, due date, and a "star" toggle.
- **Todo card** (`TodoItem.tsx`):
  - round checkbox to **complete** (completed items are struck through),
  - ⭐ **star**, ✏️ **edit**, 🗄️ **archive**, 🗑️ **delete** (with confirmation),
  - badges for priority, category and due date ("Today" / red "Overdue").
- **Category filter** (`CategoryFilterBar.tsx`): chips for *All* and each category. Selecting one navigates to `/todos/:categoryId` and **shows only that category's todos**.
- **Status tabs** on the Todos page: All / Open / Completed / Starred, kept in the URL (`?status=open`).
- **Manage categories** (`ManageCategoriesDialog.tsx`): add, rename, recolor (8 colors), delete (the confirmation shows how many todos will be removed).
- **Archive page** (`/archive`): archived todos are hidden everywhere else and can be restored or deleted.
- **Reusable UI** in `src/components/ui/`: `Modal` (bottom sheet on mobile), `ConfirmDialog`, `IconButton`, `EmptyState`, `Field`, `TextField`, `Button`, `Alert`.

---

## Step 5 — Dashboard

**Goal:** the main page shows the 5 most important starred todos.

`DashboardPage.tsx` contains:

1. **Hero card** — the date, a greeting for the time of day, the number of open todos, an overall progress bar and a *New todo* button.
2. **Stat cards** — Open, Completed, Starred, Archived; each links to the matching filtered list.
3. **Top 5 starred** — starred, not completed, not archived, sorted by importance. Completing or un-starring one moves the next one up. Shows "+N more" and an *All starred* link when there are more than five.
4. **Category progress** — a completion bar per category, each linking to that category.

### Time-of-day greeting

`getDayPeriod()` in `src/lib/date.ts` picks the greeting from the local hour, and `useNow()` refreshes it every minute:

| Hours | English | Persian |
|---|---|---|
| 05:00–11:59 | Good morning | صبح بخیر |
| 12:00–13:59 | Good afternoon | ظهر بخیر |
| 14:00–17:59 | Good afternoon | عصر بخیر |
| 18:00–04:59 | Good evening | شب بخیر |

---

## Step 6 — Routing & responsive layout

**Goal:** single-page routing and a layout that works on phones and desktops.

### Routes (`src/app/router.tsx`)

| Path | Page | Access |
|---|---|---|
| `/login`, `/register` | Auth pages | logged-out only |
| `/` | Dashboard | logged-in |
| `/todos` | All todos | logged-in |
| `/todos/:categoryId` | One category's todos | logged-in |
| `/archive` | Archived todos | logged-in |
| `/settings` | Appearance & account | logged-in |
| `*` | 404 page | everyone |

### Layout (`src/components/layout/`)

- **Desktop (≥ 1024px):** fixed **sidebar** with navigation, the category list with counts, theme/language toggles, and the user card with logout.
- **Mobile:** sticky **top bar**, a **slide-in drawer** (same sidebar), and a **bottom tab bar** with a raised **+** button.
- One shared "New todo" dialog; when viewing a category, that category is preselected.
- Browser tab titles per page (`useDocumentTitle`) and scroll-to-top on navigation.

---

## Step 7 — Theme & language (English / Persian)

**Goal:** light/dark themes and English/Persian with a language switch.

- **Translations:** `src/i18n/locales/en.ts` and `fa.ts`. The Persian file is *typed against* the English one, so a missing key fails the build.
- **Sync** (`src/app/useSyncSettings.ts`): mirrors the Redux settings onto `<html>` — the `dark` class, `lang`, and `dir` (`rtl` for Persian) — and into i18next.
- **No flash on load:** a small script in `index.html` applies the saved theme and direction *before* React starts.
- **Right-to-left:** layout uses logical properties (`ms-*`, `pe-*`, `start-*`, `end-*`) so it mirrors automatically; directional icons flip with `rtl:rotate-180`.
- **Persian formatting:** numbers use Persian digits (`useFormatNumber`, `{{count, number}}`), and dates use the Solar Hijri calendar (`fa-IR`).
- **Controls:** ☀/🌙 and **فا / EN** buttons in the sidebar, mobile top bar and auth pages; plus an *Appearance* section in Settings.

---

## Step 8 — Polish & browser testing

The app was tested in Chrome at desktop width and at 390px phone width, in both themes and both languages:
dashboard, category filtering, add / complete / archive / delete, the mobile drawer and bottom bar, Settings, and the login page. No console errors.

**Bugs found and fixed:**

1. Dev server only listened on IPv6 → set `server.host: '127.0.0.1'` in `vite.config.ts`.
2. Starred todos showed a grey star → `IconButton` now applies exactly one text color.
3. English text inside the Persian layout had misplaced punctuation → titles/descriptions use `dir="auto"`.
4. Duplicate **+** button on mobile → the Todos header button is hidden below 1024px.
5. Greeting said "Good morning" after midnight → five time-of-day periods (see Step 5).

---

## Step 9 — Documentation & GitHub

1. Wrote this `WALKTHROUGH.md` and a `README.md`.
2. Installed Git and GitHub CLI (`winget install Git.Git GitHub.cli`).
3. Logged in to GitHub (`gh auth login`).
4. Created the repository and pushed:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: todo app"
   gh repo create my-todo-app --public --source . --push
   ```

---

## Addition — Persian date picker

The browser's native date input always shows the Gregorian calendar, so it was replaced with a custom picker (`src/components/ui/DatePicker.tsx`) that follows the UI language:

| | Persian (فارسی) | English |
|---|---|---|
| Calendar | Solar Hijri (فروردین … اسفند) | Gregorian |
| Week starts | Saturday (ش) | Sunday |
| Digits | ۰–۹ | 0–9 |

- **Calendar logic** lives in `src/lib/calendar.ts`: one `CalendarSystem` interface with a Gregorian and a Persian implementation. Persian ↔ Gregorian conversion uses the small [`jalaali-js`](https://github.com/jalaali/jalaali-js) library (`npm install jalaali-js`).
- **Storage is unchanged:** the picker reads and writes Gregorian ISO dates (`yyyy-mm-dd`), so existing todos, sorting and "overdue" logic keep working.
- **UX:** the calendar opens *inline* below the field (so it is never clipped inside the scrollable dialog), highlights today, has **Today** and **Clear** shortcuts, and **Escape** closes the calendar before the dialog.
- **Verified** with a script: every day 2025–2027 converts to the calendar and back correctly, leap years (Esfand 30 in 1403, Feb 29 in 2028) and month navigation across year boundaries work; then checked visually in both languages.

---

## Project structure

```
src/
├── app/            store, typed hooks, router, settings sync
├── components/
│   ├── layout/     AppLayout, Sidebar, BottomNav
│   └── ui/         Button, Modal, ConfirmDialog, TextField, …
├── features/
│   ├── auth/       slice, thunks, route guards, forms
│   ├── categories/ slice, filter bar, dialogs, colors
│   ├── dashboard/  stat cards, category progress
│   ├── settings/   slice, theme/language toggles
│   └── todos/      slice + selectors, form, item, list
├── i18n/           i18next setup + en / fa translations
├── lib/            storage, crypto, dates, small hooks
├── pages/          one component per route
└── types.ts        shared data types
```

---

## Moving to a real database later

The app was built so this is a contained change:

1. **Storage:** write an API-backed adapter that implements `StorageAdapter` (or replace the load/save logic in `store.ts` with RTK Query / async thunks calling your API).
2. **Auth:** move password hashing and checking to the server; `authThunks.ts` would call `/register`, `/login`, etc. and store a session token instead of password hashes.
3. **Data:** the `User`, `Category` and `Todo` types in `src/types.ts` map directly to database tables; `userId` is already on every record.
4. **Migration:** existing local data can be read once from `localStorage` (`my-todo-app:*` keys) and uploaded.

---

## Known limitations

- Data and accounts live in this browser only (by design for now).
- Dialogs close with Escape, but keyboard focus is not trapped inside an open dialog.
