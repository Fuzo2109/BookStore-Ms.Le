# F4 – Book details: test cases and results (S3-02/03)

Owner: Tran Minh Khoa (review and sign off these results) · Scope (brief §2.2): selecting a book in F3 opens its full detail page; a non-existent ID shows a friendly message; going back returns to the same list page. Also covers CR-04 (original image on detail, default image) and the 04/11 product-details change.

Executed on **11/11/2026** against https://book-store-ms-le.vercel.app by an automated browser run (`tools/testing/run_s3_tests.py`, Playwright/Chromium) started by Vo Ngoc Phu with Claude. Expected values were read from the live database at run time, so they match the data on that day (36 visible books). Map each TC to your Product Backlog AC IDs. Screenshots: `docs/testing/evidence/2026-11-11-S3/`.

| TC | Test | Expected | Actual (11/11/2026, production) | Status · evidence |
|---|---|---|---|---|
| TC-F4-01 | Open a book from list page 2 | Detail page of the same book: title, author, price, stock, description, product details | clicked 'Frankenstein', detail h1 'Frankenstein', sections present=True | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-01_detail_from_page2.jpg) |
| TC-F4-02 | Click Back on the detail page | Returns to /books?page=2 with the same books | /books?page=2 – same first card (re-test with navigation wait). First automated run read the URL before client navigation finished. | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-02_back_retest.jpg) |
| TC-F4-03 | Open a book from a filtered page 2 (maxPrice=250000) and go back | Back keeps the filter and the page | /books?maxPrice=250000&page=2 – same first card (re-test with navigation wait). First automated run read the URL before client navigation finished. | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-03_back_retest.jpg) |
| TC-F4-04 | Non-existent book ID (/books/999999) | Friendly 'We couldn't find that book' message, no crash, Back link | HTTP 200; friendly=True; back=/books | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-04_not_found.jpg) |
| TC-F4-05 | Invalid book ID (text) (/books/abc) | Friendly 'We couldn't find that book' message, no crash, Back link | HTTP 200; friendly=True; back=/books | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-05_not_found.jpg) |
| TC-F4-06 | Soft-deleted book IDs (/books/37, /books/39) | Friendly 'We couldn't find that book' message, no crash, Back link | /books/37: HTTP 200, 'We couldn't find that book'; /books/39: HTTP 200, 'We couldn't find that book' | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-06_not_found.jpg) |
| TC-F4-07 | Detail uses the original image, list uses thumbnails (CR-04) | Detail img = original-*; list cards = thumb-*.webp (or default) | detail: …vers/books/22/original-1793678791819.jpg; list thumbs: 12/12 | **Pass** · results.json |
| TC-F4-08 | Book without a cover (Cho Toi Xin Mot Ve Di Tuoi Tho) | Default cover image (CR-04 AC5) | /images/default-cover.svg | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-08_default_cover.jpg) |
| TC-F4-09 | Product details + disabled Add to cart (To Kill a Mockingbird) | ISBN-13 and other details listed; Add to cart disabled with note (cart out of scope) | button disabled=True; ISBN shown=True | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-09_product_details.jpg) |
| TC-F4-10 | Detail page on a phone (iPhone SE) | Readable, no horizontal scrolling | scrollWidth=320, viewport=320 | **Pass** · [img](evidence/2026-11-11-S3/TC-F4-10_detail_phone.jpg) |

**Result: 10 / 10 Pass.** TC-F4-02/03 first failed in the automated run because the script read the URL before client-side navigation finished; re-tested with a navigation wait and passed (no product defect).
