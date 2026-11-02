# Instructions for AI agents (Claude Code, Codex, Cursor, Copilot…)

This repository is **Group 4's Bookstore E-commerce final project** (HK261 Software Project Management,
Van Lang University). Team: **Le Tan Nguyen** (Product Owner), **Tran Minh Khoa**, **Vo Ngoc Phu**.

## 1. Find today's work first

1. Get today's date in **Asia/Ho_Chi_Minh (UTC+7)**.
2. Open `docs/plan/daily/YYYY-MM-DD.md` for that date (e.g. `docs/plan/daily/2026-11-03.md`).
3. Ask the user which member they are (or infer it from `git config user.name` / the GitHub login), then show:
   - the **Everyone** item,
   - that member's section: each task's steps, **Output** and **Done when**,
   - the **Next deadline** line.
4. Also check the previous day's file for unticked items owned by the same member – they carry over.
5. `docs/plan/README.md` has the overview: roles, key dates, the full task table.

If today's date has no file (before 03/11 or after 17/11/2026), say so and show `docs/plan/README.md`.

## 2. Rules that are graded – follow them exactly

- **Never commit to `main`.** Create a branch: `feature/<pbi>-<name>`, `fix/<name>` or `docs/<name>`.
- **Conventional Commits:** `feat(f2): ...`, `fix(cr04): ...`, `test(f5): ...`, `docs(plan): ...`.
- Open a **pull request** using the template; another member reviews before merging.
  Commits must be made under the member's **own** git identity (individual scores use commit history).
- Database changes: add a new file in `supabase/migrations/` (`YYYYMMDDHHMMSS_name.sql`); never change the schema only in the dashboard.
- **Never fabricate** test results, hours, dates, approvals or evidence. If something was not run, write "not executed".
- Never put secrets (`SUPABASE_SERVICE_ROLE_KEY`, passwords) in commits, issues, PRs or chat.
- AI use is allowed but must be declared in the Final Report appendix (tool, purpose, affected content).

## 3. Updating the plan

- Tick a checkbox (`- [ ]` → `- [x]`) in the daily file **only when its "Done when" condition is met**, in a PR
  titled `docs(plan): update DD/MM progress`.
- Unfinished task: copy it into the next day's file under the same member, with a one-line reason.
- Changed dates or owners must also be reflected in `docs/plan/README.md` and the Trello/PM board.

## 4. Project facts

| Item | Value |
|---|---|
| Live site | https://book-store-ms-le.vercel.app (admin portal at `/admin`) |
| Stack | Next.js 15 (App Router, Server Actions), Supabase (Postgres + RLS, Auth, Storage), Tailwind v4, Vercel |
| Scope | F1 accounts/roles · F2 book management · F3 list (12/page, newest first) · F4 detail · F5 search/filter · CR-04 cover upload + thumbnail. Out of scope: cart, payment, social login |
| Setup / structure | `README.md` |
| Workflow rules | `CONTRIBUTING.md` |
| Commands | `npm run dev`, `npm run lint`, `npm run typecheck`, `npm test`, `npm run build` (CI runs all on every PR) |
| File-name prefix for submissions | `HK261_SPM_FP_Team4_` |
