# Sprint 3 – Regression (S3-06) and non-functional evidence (S3-07)

Executed on **11/11/2026** against https://book-store-ms-le.vercel.app by an automated browser run (`tools/testing/run_s3_tests.py`, Playwright/Chromium) started by Vo Ngoc Phu with Claude. Expected values were read from the live database at run time, so they match the data on that day (36 visible books). Map each TC to your Product Backlog AC IDs. Screenshots: `docs/testing/evidence/2026-11-11-S3/`.

## Regression F1 (accounts and roles)

| TC | Test | Expected | Actual (11/11/2026, production) | Status · evidence |
|---|---|---|---|---|
| TC-F1-01 | Register a new account | Account created, signed in, 'Hi, <name>' shown | URL /; greeting shown=True | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-01_registered.jpg) |
| TC-F1-02 | Register with an existing email | 'An account with this email already exists.' | An account with this email already exists. | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-02_duplicate_email.jpg) |
| TC-F1-03 | Register with a 7-char password, browser check bypassed | Server rejects: 'at least 8 characters' | Password must be at least 8 characters. | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-03_server_short_password.jpg) |
| TC-F1-05 | Customer logs in | Lands on /, no Admin button | / | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-05_customer_home.jpg) |
| TC-F1-06 | Login with a wrong password | 'Incorrect email or password.' | Incorrect email or password.  | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-06_wrong_password.jpg) |
| TC-F1-07 | Log out, then open /admin | Back on /, /admin asks to log in | /login?next=/admin | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-07_after_logout.jpg) |
| TC-F1-14 | Customer opens /admin, /admin/books, /admin/users | 'Access denied' each time | Access denied shown: [True, True, True] | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-14_customer_forbidden.jpg) |
| TC-F1-16 | Visitor opens /admin | Redirect to /login?next=/admin | /login?next=/admin (redirect correct; first automated check compared against the URL-encoded form) | **Pass** · [img](evidence/2026-11-11-S3/TC-F1-16_visitor_admin_redirect.jpg) |
| TC-F1-04 |  | | | Not executed – needs an admin test account (see below) |
| TC-F1-08 |  | | | Not executed – needs an admin test account (see below) |
| TC-F1-09 |  | | | Not executed – needs an admin test account (see below) |
| TC-F1-10 |  | | | Not executed – needs an admin test account (see below) |
| TC-F1-11 |  | | | Not executed – needs an admin test account (see below) |
| TC-F1-12 |  | | | Not executed – needs an admin test account (see below) |
| TC-F1-13 |  | | | Not executed – needs an admin test account (see below) |

## Regression F2 + CR-04 (admin side)

**Not executed yet.** These run with an administrator test account; promoting the QA account to admin needs the team's approval (an admin must do it). Prepared cases: TC-F2-R1 (price 0, server), TC-F2-R2 (ISBN check digit), TC-F2-R3 (add book), TC-F2-R4 (soft delete hides book), TC-F2-R5 (restore), TC-F2-R6 (category in use), TC-CR04-AC2/AC3 (2.5 MB / .gif / .pdf / renamed .pdf). Previous evidence: F2/CR-04 AC1 upload via the admin UI on 04/11 (`evidence/2026-11-04-F3-CR04/`), unit tests in CI.

## Regression F3 (book list)

| TC | Test | Expected | Actual (11/11/2026, production) | Status · evidence |
|---|---|---|---|---|
| TC-F3-R1 | Book list page 1 | 12 cards newest first ('To Kill a Mockingbird'), '36 books · page 1 of 3' | 12 cards, first 'To Kill a Mockingbird', '36 books · page 1 of 3' | **Pass** · [img](evidence/2026-11-11-S3/TC-F3-R1_list_page1.jpg) |

Full F3 suite: 11/11 Pass on 04/11 (`F3-CR04-test-cases.md`).

## Non-functional requirements (brief §2.2)

| NFR | Evidence | Status |
|---|---|---|
| Responsive UI (desktop, tablet, phone) | F3: TC-F3-06/07/08 (04/11); F4: TC-F4-10 phone 320 px, no horizontal scroll (11/11) | Pass |
| ≥ 30 sample books | 36 visible books on 11/11 (catalogue count in TC-F5-06) | Pass |
| List page < 2 s | load ms: [2074, 2136, 2328] – measured from a US test machine (x-vercel-id iad1::bom1: edge in Washington, function in Mumbai). Server TTFB 0.45–0.86 s. Must be re-measured from Vietnam (Chrome DevTools, Fast 4G) for the NFR evidence. | **Inconclusive – re-measure from Vietnam** |
| Client- and server-side validation | Server rejects 7-char password with the browser check removed (TC-F1-03); unit tests for book/ISBN rules; F2 server checks pending admin run | Partly evidenced |
| Passwords stored as hashes | bcrypt `$2a$`, 60 chars (F1 evidence E2, 04/11) | Pass |
| Server-side authorisation | Customer gets 'Access denied' on 3 admin URLs (TC-F1-14); RLS evidence E1 (04/11) | Pass |

### How to finish the < 2 s measurement (from Vietnam)

Chrome → `/books` → F12 → Network → Disable cache, Fast 4G → Ctrl+Shift+R three times → record **Load**. Vercel functions already run in Mumbai (`bom1`), next to the database.

## Test accounts created on production (11/11)

`qa.s3.admin.11110018@example.com` (customer role – to be promoted for the admin run) and `qa.s3.customer.11110018@example.com` (customer). Lock or delete both after the admin regression run.
