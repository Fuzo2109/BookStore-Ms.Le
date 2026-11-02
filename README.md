# Ms. Le Bookstore – Release 1.0 (Book Catalogue)

Group 4 · HK261 Software Project Management final project · Van Lang University

Online book catalogue for Ms. Le's bookstores: customers browse, search and filter books; administrators manage
books, categories, authors and accounts. Out of scope for Release 1.0 (per the brief): shopping cart, payment,
social login.

| Layer | Tool |
|---|---|
| Framework | [Next.js 15](https://nextjs.org) (App Router, Server Actions, TypeScript) |
| Styling | Tailwind CSS v4 |
| Database / Auth / File storage | [Supabase](https://supabase.com) (PostgreSQL + Row Level Security, Supabase Auth, Supabase Storage) |
| Validation | Zod (server) + HTML constraints (client) |
| Thumbnails (CR-04) | sharp |
| Hosting | [Vercel](https://vercel.com) (Hobby/free) |
| Tests | Vitest |
| Source control / CI | GitHub + GitHub Actions |

## Features and where they live

| ID | Feature | Main files |
|---|---|---|
| F1 | Register, log in, log out; admin creates / locks accounts; roles Administrator & Customer; admin pages blocked for others | `src/app/(auth)/*`, `src/app/admin/users/*`, `src/lib/auth.ts`, RLS in the migration |
| F2 | Add / edit / soft-delete books (title, author, category, price > 0, description, cover, stock); manage categories & authors; client + server validation | `src/app/admin/books/*`, `src/app/admin/taxonomy/*`, `src/lib/validation.ts` |
| F3 | Responsive card grid (cover, title, author, price), 12 per page, newest first | `src/app/books/page.tsx`, `src/components/BookCard.tsx`, `src/components/Pagination.tsx` |
| F4 | Book detail page; unknown id → friendly message; Back returns to the same list page | `src/app/books/[id]/page.tsx` |
| F5 | Search by title or author; filter by category and price range; works with pagination | `src/components/CatalogFilters.tsx`, `src/lib/catalog.ts`, `src/lib/catalog-params.ts` |
| CR-04 | Upload JPG/PNG ≤ 2 MB cover from the computer; thumbnail for F3, original for F4; default image when missing | `src/lib/cover-rules.ts`, `src/lib/covers.ts`, `src/app/admin/books/BookForm.tsx` |

Non-functional: passwords are hashed by Supabase Auth (bcrypt); validation runs in the browser **and** on the server;
authorisation is enforced on the server (`requireAdmin()`) **and** in the database (Row Level Security);
`supabase/seed.sql` loads 36 sample books.

## 1. Set up Supabase (once per team)

1. Create a free project at <https://supabase.com/dashboard> (region: Singapore is closest to Vietnam).
2. **SQL Editor → New query**: paste and run `supabase/migrations/20261102000000_init_schema.sql`.
   This creates the tables, the `book_catalog` view, RLS policies and the `book-covers` storage bucket.
3. Run `supabase/seed.sql` the same way (36 books, 8 categories, 26 authors). It is safe to re-run.
4. **Authentication → Sign In / Providers → Email**: for the class demo, turn **off** "Confirm email" so new
   customers can log in immediately (otherwise they must click the email link first).
5. **Project Settings → API**: copy the Project URL, the `anon` public key and the `service_role` key.

## 2. Run locally

Requires Node.js 20+.

```bash
git clone https://github.com/Fuzo2109/BookStore-Ms.Le.git
cd BookStore-Ms.Le
cp .env.example .env.local      # then paste the three Supabase values
npm install
npm run dev                     # http://localhost:3000
```

### Create the first administrator

Register a normal account at `/register`, then in Supabase **SQL Editor** run:

```sql
update public.profiles set role = 'admin' where email = 'your-email@example.com';
```

After that, use **Admin → Accounts** to create more accounts (including demo accounts for the lecturer).

## 3. Deploy to Vercel

1. <https://vercel.com/new> → import `Fuzo2109/BookStore-Ms.Le` (framework is detected as Next.js).
2. Add the environment variables `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
   `SUPABASE_SERVICE_ROLE_KEY` for Production **and** Preview.
3. Deploy. Every pull request now gets its own Preview URL; merging to `main` updates production.
4. In Supabase **Authentication → URL Configuration**, set the Site URL to the Vercel production URL.

Record the production URL and the demo accounts (Administrator + Customer) in the Final Report.

### Free-tier limits to watch (CR-04 asked us to assess these)

| Limit | Value | Impact on us |
|---|---|---|
| Supabase file storage | 1 GB | 2 MB max per cover + ~20 KB thumbnail → roughly 500 books with full-size covers |
| Supabase database | 500 MB | Far above what the catalogue needs |
| Supabase egress | 5 GB / month | Thumbnails on the list page keep this low |
| Supabase inactivity pause | Paused after 7 days without activity | **Open the site at least every few days until 17/11**, or the lecturer may find it paused |
| Vercel function request body | 4.5 MB | Covers are capped at 2 MB, so uploads fit |

## Scripts

| Command | What it does |
|---|---|
| `npm run dev` | Development server |
| `npm run build` / `npm start` | Production build / run |
| `npm run lint` | ESLint (Next.js rules) |
| `npm run typecheck` | TypeScript check |
| `npm test` | Unit tests (Vitest) for validation, CR-04 rules, F3/F5 query handling |

## Project structure

```
src/
  app/
    (store)/                 Customer storefront (header + footer layout)
      page.tsx               Home (hero, new arrivals, categories)
      books/page.tsx         F3 list + F5 search/filters
      books/[id]/page.tsx    F4 detail
      (auth)/                F1 login, register
    admin/                   Admin portal: own sidebar layout, guarded by requireAdmin;
                             admins are sent here automatically after logging in
      books/                 F2 + CR-04
      categories/, authors/  F2 (shared NameManager in admin/taxonomy)
      users/                 F1 create / lock accounts
  components/                Header, footer, cards, pagination, filters, form helpers
  lib/                       Supabase clients, auth guard, validation, catalogue queries, cover handling
supabase/
  migrations/                Database schema (configuration item – version controlled)
  seed.sql                   Sample data
tests/                       Vitest unit tests
```

## Daily work plan

What each member does each day (23/10 → 17/11/2026; Sprint 1 days are a record): [`docs/plan/README.md`](docs/plan/README.md), one file per day in
[`docs/plan/daily/`](docs/plan/daily/). AI agents start from [`AGENTS.md`](AGENTS.md).

## Team workflow

See [CONTRIBUTING.md](CONTRIBUTING.md): no direct commits to `main`, one branch per backlog item, Conventional
Commits, reviewed pull requests, tag `v1.0` for the release.
