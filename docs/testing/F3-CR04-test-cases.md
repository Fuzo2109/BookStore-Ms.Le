# F3 – Book list and CR-04 AC4 (performance): test cases

Owner: Vo Ngoc Phu (S2-09/10, CR04-06) · Prepared 04/11/2026 · Environment: https://book-store-ms-le.vercel.app

F3 scope (brief §2.2): grid/card layout showing cover, title, author, price; 12 books per page; newest first;
responsive on desktop, phone and tablet. CR-04 AC4: *Given 30 books with images, When the list page is opened,
Then thumbnails are used and the page loads in < 2 seconds.*

Expected values below were computed from the production database on **04/11/2026 (37 visible books)**.
If books are added or deleted, recompute them (SQL at the end). Map each TC to your Product Backlog AC IDs.

| TC | AC | Given | When | Then (expected) | Actual result | Status |
|---|---|---|---|---|---|---|
| TC-F3-01 | | 37 visible books | Open `/books` | 12 cards; each shows cover, title, author, price (VND); heading "All books", text "37 books · page 1 of 4" | | Not executed |
| TC-F3-02 | | Same data | Look at the order on page 1 | Newest first: 1st card *The Spooky Wheels on the Bus…*, 12th card *I, Robot* | | Not executed |
| TC-F3-03 | | Same data | Click page 2, 3, 4 | Page 2: *A Wizard of Earthsea* … *War and Peace*; page 3: *Sapiens…* … *Charlie and the Chocolate Factory*; page 4: only *The BFG* | | Not executed |
| TC-F3-04 | | Same data | Open `/books?page=99` | "This page does not exist." with a button to page 1; no crash | | Not executed |
| TC-F3-05 | | Same data | Open `/books?page=abc` and `/books?page=-1` | Page 1 is shown (invalid values ignored) | Unit test `tests/catalog-params.test.ts` passes in CI | Pass (unit) – run UI too |
| TC-F3-06 | | Desktop 1440 px | Open `/books` | Filter panel on the left, 6 cards per row (≥ 1280 px) | | Not executed |
| TC-F3-07 | | Tablet 768 px (DevTools → iPad Mini) | Open `/books` | Filters above the grid, 3 cards per row, no horizontal scrolling | | Not executed |
| TC-F3-08 | | Phone 375 px (DevTools → iPhone SE) | Open `/books` | 2 cards per row, search box full width, no horizontal scrolling | | Not executed |
| TC-F3-09 | | A book without a cover | Open the list | Default "No cover available" image is shown (CR-04 AC5) | | Not executed |
| TC-F3-10 | | A book with `stock = 0` (*The Da Vinci Code*, *The BFG*) | Open the list | Card shows an "Out of stock" label | | Not executed |
| TC-CR04-AC4 | | ≥ 30 books with covers | Open `/books` 3 times with cache disabled | Every card image URL contains `/thumb-` and ends in `.webp`; **Load** time < 2 s each time | | Not executed |

## How to run TC-CR04-AC4 (CR04-06)

1. Make sure ≥ 30 books have covers: Admin → Dashboard → "Missing cover" card should show ≤ 7.
   Bulk option: `node --env-file=.env.local tools/import-covers.mjs` (uses Open Library; see the script header).
2. Chrome → open `/books` → F12 → **Network** tab → tick **Disable cache** → throttling **Fast 4G**.
3. Reload (Ctrl+Shift+R). Record the **Load** value shown at the bottom of the Network tab. Repeat 3 times.
4. Filter the Network list by `thumb-` and check the image sizes (≈ 10–30 kB each). Screenshot.
5. Fill the table:

| Run | DOMContentLoaded | Load | Images use `thumb-*.webp`? | Pass (< 2 s)? |
|---|---|---|---|---|
| 1 | | | | |
| 2 | | | | |
| 3 | | | | |

If any run is ≥ 2 s: check Vercel → Settings → Functions → Function Region = **Mumbai (bom1)** (the database is in
ap-south-1), redeploy and measure again; if it still fails, log an issue with the measurements.

## Recompute the expected order

```sql
with o as (select title, row_number() over (order by created_at desc, id desc) rn from book_catalog)
select rn, title from o order by rn;
```
