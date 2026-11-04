# F3 – Book list and CR-04 AC4 (performance): test cases

Owner: Vo Ngoc Phu (S2-09/10, CR04-06) · Prepared 04/11/2026 · Environment: https://book-store-ms-le.vercel.app

F3 scope (brief §2.2): grid/card layout showing cover, title, author, price; 12 books per page; newest first;
responsive on desktop, phone and tablet. CR-04 AC4: *Given 30 books with images, When the list page is opened,
Then thumbnails are used and the page loads in < 2 seconds.*

Expected values below were computed from the production database on **04/11/2026 (37 visible books)**.
If books are added or deleted, recompute them (SQL at the end). Map each TC to your Product Backlog AC IDs.

| TC | AC | Given | When | Then (expected) | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-F3-01 | | 37 visible books | Open `/books` | 12 cards; each shows cover, title, author, price (VND); heading "All books", text "37 books · page 1 of 4" | 12 cards; every card has cover, title, author and price in VND (e.g. "150.000 ₫"); heading "All books", text "37 books · page 1 of 4". [screenshot](evidence/2026-11-04-F3-CR04/TC-F3-01-02_desktop_page1.jpg) | Pass |
| TC-F3-02 | | Same data | Look at the order on page 1 | Newest first: 1st card *The Spooky Wheels on the Bus…*, 12th card *I, Robot* | 1st card *The Spooky Wheels on the Bus…*, 12th card *I, Robot*; full page-1 order matches the SQL below. [screenshot](evidence/2026-11-04-F3-CR04/TC-F3-01-02_desktop_page1.jpg) | Pass |
| TC-F3-03 | | Same data | Click page 2, 3, 4 | Page 2: *A Wizard of Earthsea* … *War and Peace*; page 3: *Sapiens…* … *Charlie and the Chocolate Factory*; page 4: only *The BFG* | Page 2: 12 cards, *A Wizard of Earthsea* … *War and Peace*; page 3: 12 cards, *Sapiens…* … *Charlie and the Chocolate Factory*; page 4: 1 card, *The BFG*. Screenshots [p2](evidence/2026-11-04-F3-CR04/TC-F3-03_page2.jpg) · [p3](evidence/2026-11-04-F3-CR04/TC-F3-03_page3.jpg) · [p4](evidence/2026-11-04-F3-CR04/TC-F3-03_page4.jpg) | Pass |
| TC-F3-04 | | Same data | Open `/books?page=99` | "This page does not exist." with a button to page 1; no crash | "This page does not exist." with a "Go to the first page" button; no crash. Note: the subtitle reads "page 4 of 4" while showing page 99 (cosmetic, see Observations). [screenshot](evidence/2026-11-04-F3-CR04/TC-F3-04_page99.jpg) | Pass |
| TC-F3-05 | | Same data | Open `/books?page=abc` and `/books?page=-1` | Page 1 is shown (invalid values ignored) | UI: `?page=abc` and `?page=-1` both show page 1 (12 cards, first *The Spooky Wheels…*, "page 1 of 4"). Unit test `tests/catalog-params.test.ts` passes in CI. [screenshot](evidence/2026-11-04-F3-CR04/TC-F3-05_page_minus1.jpg) | Pass |
| TC-F3-06 | | Desktop 1440 px | Open `/books` | Filter panel on the left, 6 cards per row (≥ 1280 px) | 1440×900: filter panel left of the grid, 6 cards per row, no horizontal scroll (scrollWidth 1440 = viewport). [viewport](evidence/2026-11-04-F3-CR04/TC-F3-06_desktop_1440_viewport.jpg) · [full page](evidence/2026-11-04-F3-CR04/TC-F3-06_desktop_1440_full.jpg) | Pass |
| TC-F3-07 | | Tablet 768 px (DevTools → iPad Mini) | Open `/books` | Filters above the grid, 3 cards per row, no horizontal scrolling | 768×1024 (iPad Mini, mobile emulation): filters above the grid, 3 cards per row, no horizontal scroll (scrollWidth 768). [viewport](evidence/2026-11-04-F3-CR04/TC-F3-07_tablet_768_iPadMini_viewport.jpg) · [full page](evidence/2026-11-04-F3-CR04/TC-F3-07_tablet_768_iPadMini_full.jpg) | Pass |
| TC-F3-08 | | Phone 375 px (DevTools → iPhone SE) | Open `/books` | 2 cards per row, search box full width, no horizontal scrolling | 375×667 (iPhone SE, mobile emulation): 2 cards per row, header search box on its own full-width row, no horizontal scroll (scrollWidth 375). [viewport](evidence/2026-11-04-F3-CR04/TC-F3-08_phone_375_iPhoneSE_viewport.jpg) · [full page](evidence/2026-11-04-F3-CR04/TC-F3-08_phone_375_iPhoneSE_full.jpg) | Pass |
| TC-F3-09 | | A book without a cover | Open the list | Default "No cover available" image is shown (CR-04 AC5) | *Cho Toi Xin Mot Ve Di Tuoi Tho* (no cover on Open Library) shows `/images/default-cover.svg` "No cover available" on page 2. [screenshot](evidence/2026-11-04-F3-CR04/TC-F3-09_default_cover_card.jpg) | Pass |
| TC-F3-10 | | A book with `stock = 0` (*The Da Vinci Code*, *The BFG*) | Open the list | Card shows an "Out of stock" label | *The Da Vinci Code* and *The BFG* cards show "Out of stock"; no other card does. Label wraps to 2 lines at 1440 px (cosmetic). [Da Vinci](evidence/2026-11-04-F3-CR04/TC-F3-10_out_of_stock_The_Da_Vinci_Code.jpg) · [BFG](evidence/2026-11-04-F3-CR04/TC-F3-10_out_of_stock_The_BFG.jpg) | Pass |
| TC-CR04-AC4 | | ≥ 30 books with covers | Open `/books` 3 times with cache disabled | Every card image URL contains `/thumb-` and ends in `.webp`; **Load** time < 2 s each time | 36 of 37 books have covers. 3 cold loads (cache disabled, Fast 4G): Load **1333 / 1255 / 1273 ms**; all 12 cover requests are `thumb-*.webp` (11–24 kB each). See table below. | Pass |

## How to run TC-CR04-AC4 (CR04-06)

1. Make sure ≥ 30 books have covers: Admin → Dashboard → "Missing cover" card should show ≤ 7.
   Bulk option: `node --env-file=.env.local tools/import-covers.mjs` (uses Open Library; see the script header).
2. Chrome → open `/books` → F12 → **Network** tab → tick **Disable cache** → throttling **Fast 4G**.
3. Reload (Ctrl+Shift+R). Record the **Load** value shown at the bottom of the Network tab. Repeat 3 times.
4. Filter the Network list by `thumb-` and check the image sizes (≈ 10–30 kB each). Screenshot.
5. Fill the table:

| Run | DOMContentLoaded | Load | Images use `thumb-*.webp`? | Pass (< 2 s)? |
|---|---|---|---|---|
| 1 | 952 ms | 1333 ms | Yes – 12/12 cover requests, 11.4–24.1 kB | Yes |
| 2 | 855 ms | 1255 ms | Yes – 12/12 cover requests, 11.7–24.1 kB | Yes |
| 3 | 896 ms | 1273 ms | Yes – 12/12 cover requests, 11.4–24.1 kB | Yes |

Screenshots: [run 1](evidence/2026-11-04-F3-CR04/TC-CR04-AC4_run1.jpg) · [run 2](evidence/2026-11-04-F3-CR04/TC-CR04-AC4_run2.jpg) ·
[run 3](evidence/2026-11-04-F3-CR04/TC-CR04-AC4_run3.jpg) · raw numbers: [`f3-ac4-results.json`](evidence/2026-11-04-F3-CR04/f3-ac4-results.json)
(per-request sizes, TTFB ≈ 300 ms, 41 requests / ≈ 653 kB transferred per load).

If any run is ≥ 2 s: check Vercel → Settings → Functions → Function Region = **Mumbai (bom1)** (the database is in
ap-south-1), redeploy and measure again; if it still fails, log an issue with the measurements.

## Execution record – 04/11/2026 (Vo Ngoc Phu, AI-assisted)

**When / where:** 04/11/2026 08:56–08:57 (UTC+7) on production https://book-store-ms-le.vercel.app, 37 visible books.

**How:** automated with headless Google Chrome driven by Playwright (`tools/testing/run_f3_cr04.py`); results in
[`f3-ac4-results.json`](evidence/2026-11-04-F3-CR04/f3-ac4-results.json). Viewports: 1440×900 (desktop),
768×1024 (iPad Mini, touch + mobile emulation), 375×667 (iPhone SE, touch + mobile emulation).
AC4: a fresh browser context per run, `Network.setCacheDisabled`, and Chrome DevTools' **Fast 4G** preset applied
through the DevTools protocol (165 ms latency, 8.1 Mbps down, 1.35 Mbps up); Load / DOMContentLoaded taken from the
Navigation Timing API (`loadEventEnd`, `domContentLoadedEventEnd`), which are the values DevTools shows.

**Limitations (be honest in the report):** the measurement ran from a cloud test machine, not from a phone or a
laptop in Vietnam, so the real network path differs; Fast 4G is emulated. Cards use `loading="lazy"`, so the Load
event includes only the covers near the first screen (12 on desktop). A manual DevTools re-run from a team laptop
is recommended as a second piece of evidence.

**Test data prepared before the run (CR04-06):**
- 34 covers were taken from Open Library (one print edition per book, same language as the book, title checked;
  covers checked visually – [contact sheet](evidence/2026-11-04-F3-CR04/CR04-06_covers-contact-sheet.jpg)) and
  uploaded **through the Admin UI** (Admin → Books → Edit → Upload cover → Save), so the CR-04 rules (JPG/PNG,
  ≤ 2 MB, server-side thumbnail) were applied by the application itself. All files were JPG, 7–76 kB.
  Evidence: [cover selected](evidence/2026-11-04-F3-CR04/CR04-06_upload-01-admin-edit-cover-selected.jpg),
  [after save](evidence/2026-11-04-F3-CR04/CR04-06_upload-02-after-save.jpg). Storage now holds 36 `original-*`
  and 36 `thumb-*.webp` objects (average thumbnail 18.3 kB, largest 35 kB).
- A temporary administrator account was created for the upload (registered on `/register`, promoted with SQL)
  and **locked afterwards** (`is_locked = true`, role back to `customer`, Supabase Auth ban, sessions revoked);
  a login attempt now shows "This account has been locked."
- *Cho Toi Xin Mot Ve Di Tuoi Tho* has no cover on Open Library and keeps the default image (used for TC-F3-09).
- Product details (format, language, publisher, publication date, ISBN-13, ISBN-10, dimensions, shipping weight)
  were filled for the same 34 books from the **same Open Library edition** as the cover
  ([`open-library-editions.json`](evidence/2026-11-04-F3-CR04/open-library-editions.json)). Nothing was guessed:
  a field missing on Open Library is empty; a publication date with only a year or month is left empty (the column
  is a full date); ISBNs are stored only with a valid check digit; malformed dimensions are left empty; weights were
  only unit-converted to lbs. Open Library gives the **item** weight, stored as "shipping weight". The Vietnamese
  publisher value had a corrupted character on Open Library and was left empty. These fields are shown on F4 only
  after PR #9 is merged.

**Observations (not defects against an AC, logged for the team):**
1. `/books?page=99` shows "page 4 of 4" in the subtitle and highlights page 4 in the pagination above the "This page does not exist." message.
2. The "Out of stock" label wraps to two lines next to the price on 6-per-row desktop cards.

## Recompute the expected order

```sql
with o as (select title, row_number() over (order by created_at desc, id desc) rn from book_catalog)
select rn, title from o order by rn;
```
