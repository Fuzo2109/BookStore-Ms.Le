# F1 – System administration (accounts and roles): test cases

Feature scope (brief §2.2): register, log in, log out; administrator creates/locks accounts; at least two roles
(Administrator, Customer); admin functions blocked for unauthorised users. NFR: passwords stored as hashes.

- Environment: production https://book-store-ms-le.vercel.app · Supabase project `bookstore-ms-le`
- Implementation: `src/lib/auth-actions.ts` (register/login/logout), `src/lib/auth.ts` (`requireAdmin`),
  `src/app/admin/users/*` (create/lock), RLS policies in `supabase/migrations/20261102000000_init_schema.sql`
- Prepared 04/11/2026. **Map each TC to your Product Backlog AC IDs** (column "AC") – the backlog file is not in the repository.

Status legend: **Pass (DB)** = verified directly in the database on 04/11/2026 (evidence below);
**Pass (unit)** = covered by automated tests that run in CI; **Not executed** = must be run in a browser and the
Actual Result filled in with a screenshot. Never mark a browser test Pass without running it.

| TC | AC | Given | When | Then (expected) | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-F1-01 | | A visitor on `/register` | Enters full name, a new email, password ≥ 8 chars twice, submits | Account created with role Customer; user is signed in and sees "Hi, <name>" | 02/11 17:08 UTC: `tdat2005@gmail.com` created with role `customer`, `last_sign_in_at` = creation time (signed in on registration). UI screenshot not taken. | Pass (DB) – add screenshot |
| TC-F1-02 | | An account with email X exists | Registers again with email X | "An account with this email already exists."; no second account | | Not executed |
| TC-F1-03 | | A visitor on `/register` | Password of 7 chars / passwords not matching / invalid email | Field error shown; nothing saved (browser blocks first; server re-checks) | `tests/validation.test.ts` (short password, mismatch, invalid email) passes in CI | Pass (unit) – run UI too |
| TC-F1-04 | | An active Administrator account | Logs in at `/login` | Lands on `/admin` dashboard | `tannguyenle123@gmail.com` (admin) signed in 03/11 04:03 UTC. Redirect to `/admin` not yet observed. | Not executed |
| TC-F1-05 | | An active Customer account | Logs in at `/login` | Lands on home page `/`; no "Admin" button | | Not executed |
| TC-F1-06 | | Any account | Logs in with a wrong password | "Incorrect email or password."; stays signed out | | Not executed |
| TC-F1-07 | | A signed-in user | Clicks "Log out" | Returned to `/`; opening `/admin` now asks to log in | | Not executed |
| TC-F1-08 | | Admin on Admin → Accounts | Creates a Customer account (name, email, temporary password ≥ 8) | Account listed as Customer/Active; can log in with that password | No admin-created account exists yet on production | Not executed |
| TC-F1-09 | | Admin on Admin → Accounts | Creates an Administrator account | Listed as Administrator; logging in with it opens `/admin` | | Not executed |
| TC-F1-10 | | Admin on Admin → Accounts | Creates an account with an email that already exists | "An account with this email already exists." | | Not executed |
| TC-F1-11 | | An active account U | Admin clicks "Lock" on U and confirms; U tries to log in | U shown "Locked"; U's login fails with "This account has been locked. Please contact the administrator." | DB rule verified: a locked admin's `is_admin()` returns **false** (loses admin rights immediately). Login-blocking via Supabase ban not yet run on production. | Partly verified – run UI |
| TC-F1-12 | | A locked account U | Admin clicks "Unlock"; U logs in | Login succeeds | | Not executed |
| TC-F1-13 | | Admin on Admin → Accounts | Looks at their own row | No Lock button ("You") – an admin cannot lock themself | | Not executed |
| TC-F1-14 | | A signed-in Customer | Opens `/admin`, `/admin/books`, `/admin/users` | "Access denied" page each time | | Not executed |
| TC-F1-15 | | A signed-in Customer | Calls the database directly (bypassing the UI) to add a category/book, change a price, or promote themself to admin | All refused (server-side authorisation) | See evidence E1: inserts blocked (`42501`), price update and self-promotion changed **0 rows**, sees only own profile | Pass (DB) |
| TC-F1-16 | | A visitor (not logged in) | Opens `/admin` | Redirected to `/login?next=/admin`; after admin login returns to `/admin` | | Not executed |
| TC-F1-17 | | A visitor (not logged in) | Reads data directly | Can read the book catalogue; cannot read any account data | Evidence E1: catalogue 37 rows visible; profiles **0** rows | Pass (DB) |
| TC-F1-18 | | Any registered account | Inspect stored password | Stored only as a hash, never plain text | Evidence E2: every `auth.users.encrypted_password` starts with `$2a$` and is 60 chars (bcrypt) | Pass (DB) |

## Evidence

**E1 – Row Level Security test, 04/11/2026** (run in Supabase SQL as the real roles, inside a transaction that was rolled back – no data changed)

| Check | Result |
|---|---|
| customer: `is_admin()` | false |
| customer: profiles visible | 1 (own row only) |
| customer: insert category | blocked: 42501 (RLS) |
| customer: insert book | blocked: 42501 (RLS) |
| customer: promote self to admin | 0 rows changed |
| customer: change a book price | 0 rows changed |
| anon: catalogue rows visible | 37 |
| anon: profiles visible | 0 |
| admin: `is_admin()` | true |
| admin: profiles visible | 2 |
| locked admin: `is_admin()` | false |

**E2 – Password storage, 04/11/2026:** 2 of 2 accounts have a 60-character `$2a$` bcrypt hash in `auth.users`
(Supabase Auth). The application never stores passwords in `public` tables.

## Still to do (owner: test owner for F1)

1. Run every "Not executed" case on production; fill **Actual result** and attach a screenshot.
2. TC-F1-08 and TC-F1-11 also prove that `SUPABASE_SERVICE_ROLE_KEY` is set correctly on Vercel – if creating
   or locking fails with an error, check that variable first.
3. Copy the final table into the Sprint report and link it from the S1-06 Evidence field in `docs/plan/`.
