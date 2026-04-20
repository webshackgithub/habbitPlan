# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

@AGENTS.md

## Commands

```bash
# Development
npm run dev         # Start dev server at http://localhost:3000

# Build & lint
npm run build
npm run lint        # Runs eslint

# Prisma
npx prisma generate              # Regenerate client after schema changes (output: generated/prisma/)
npx prisma migrate dev           # Apply migrations (local SQLite)
npx prisma studio                # Open Prisma Studio GUI
```

No test suite is configured.

## Architecture

### Tech Stack
- **Next.js 16** (App Router) — React 19, TypeScript
- **Prisma 7** with driver adapters (`driverAdapters` preview feature enabled)
- **SQLite** locally via `better-sqlite3`, **Turso (libsql)** in production
- **Tailwind CSS v4** + **shadcn/ui** for UI components
- **Recharts** for data visualization

### Database / Prisma
- Schema: `prisma/schema.prisma` — two models: `Habit` (id, name, targetMonth `yyyy-MM`, createdAt) and `Completion` (habitId + checkDate composite PK, isCompleted).
- Generated client lives in `generated/prisma/` (not the default `node_modules/.prisma`).
- `src/lib/prisma.ts` selects the adapter at runtime: if `TURSO_AUTH_TOKEN` is set → uses `@prisma/adapter-libsql`; otherwise → dynamically imports `@prisma/adapter-better-sqlite3` with `dev.db` in the project root. The singleton is stored on `global` to survive Next.js hot-reload.

### Data Flow
- All DB access goes through **Server Actions** in `src/lib/actions.ts` (`"use server"`). No API routes.
- Actions call `revalidatePath("/")` after mutations so the root page re-fetches fresh data.
- The root page (`src/app/page.tsx`) is an **async Server Component** that reads the `?month=yyyy-MM` search param and fetches habits + 6-month trend in parallel before rendering.

### Component Structure
- `src/components/habits/` — domain components (all habits-related UI)
  - `MonthlyBoard` — Client Component; owns the horizontally scrollable date grid, auto-scrolls to today, orchestrates `HabitRow`, `AddHabitModal`, `ManageHabitsSheet`
  - `HabitRow` — Client Component; renders one habit's row of `CheckButton`s, calls `toggleCompletion` action directly
  - `AnalyticsView` — hosts `AchievementLineChart`, `HabitRankingBarChart`, `LongTermTrendChart`
- `src/components/ui/` — shadcn/ui primitives (button, card, dialog, sheet, etc.)
- `src/lib/utils.ts` — `cn()` helper (clsx + tailwind-merge)

### Environment Variables
| Variable | Purpose |
|---|---|
| `DATABASE_URL` | SQLite file path (`file:./dev.db`) or Turso libsql URL |
| `TURSO_AUTH_TOKEN` | If present, switches to Turso production mode |

### Key Design Decisions
- **Month-scoped habits**: each `Habit` row belongs to one `targetMonth`. "Copy from previous month" duplicates names only (no completions).
- **Optimistic-friendly**: `CheckButton` toggles call Server Actions directly; optimistic UI is noted as recommended but not yet implemented.
- **Mobile layout**: habit name column is sticky (`sticky left-0 z-20`); date columns use `overflow-x: auto` with smooth scroll to today on mount.
- **No `DATABASE_URL` in `schema.prisma`**: datasource has no `url` field — the adapter injects the connection at runtime.
