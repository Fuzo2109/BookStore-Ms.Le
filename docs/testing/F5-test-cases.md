# F5 – Book search / filter: test cases and results (S3-04/05)

Owner: Vo Ngoc Phu · Scope (brief §2.2): search by title or author; filter by category and price range; works together with F3 pagination.

Executed on **11/11/2026** against https://book-store-ms-le.vercel.app by an automated browser run (`tools/testing/run_s3_tests.py`, Playwright/Chromium) started by Vo Ngoc Phu with Claude. Expected values were read from the live database at run time, so they match the data on that day (36 visible books). Map each TC to your Product Backlog AC IDs. Screenshots: `docs/testing/evidence/2026-11-11-S3/`.

| TC | Test | Expected | Actual (11/11/2026, production) | Status · evidence |
|---|---|---|---|---|
| TC-F5-01 | Search by author 'orwell' | 2 result(s): ['Nineteen Eighty-Four', 'Animal Farm'] | '2 books matching “orwell”' → ['Nineteen Eighty-Four', 'Animal Farm'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-01.jpg) |
| TC-F5-02 | Search is case-insensitive 'ORWELL' | 2 result(s): ['Nineteen Eighty-Four', 'Animal Farm'] | '2 books matching “ORWELL”' → ['Nineteen Eighty-Four', 'Animal Farm'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-02.jpg) |
| TC-F5-03 | Search by title 'gatsby' | 1 result(s): ['The Great Gatsby'] | '1 book matching “gatsby”' → ['The Great Gatsby'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-03.jpg) |
| TC-F5-04 | Search Vietnamese title 'hoa vang' | 1 result(s): ['Toi Thay Hoa Vang Tren Co Xanh'] | '1 book matching “hoa vang”' → ['Toi Thay Hoa Vang Tren Co Xanh'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-04.jpg) |
| TC-F5-05 | Search with no match 'zzzzqq' | 'No books match your search.' + 'Show all books' | message shown=True | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-05_no_match.jpg) |
| TC-F5-06 | Empty search | All 36 books | 36 books · page 1 of 3 | **Pass** · results.json |
| TC-F5-07 | Search with special characters '100%_off,(x)*' | Treated as text, no error page | HTTP 200; '0 books matching “100%_off,(x)*”' | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-07_special_chars.jpg) |
| TC-F5-08 | Filter by category 2 (Classics) | 7 result(s): ['To Kill a Mockingbird', 'Nineteen Eighty-Four', 'Animal Farm', 'Pride and Prejudice', 'Emma'] | '7 books' → ['To Kill a Mockingbird', 'Nineteen Eighty-Four', 'Animal Farm', 'Pride and Prejudice', 'Emma'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-08.jpg) |
| TC-F5-09 | Category 1 + price 100,000–150,000 | 2 result(s): ['Norwegian Wood', 'Toi Thay Hoa Vang Tren Co Xanh'] | '2 books · from 100.000 ₫ · up to 150.000 ₫' → ['Norwegian Wood', 'Toi Thay Hoa Vang Tren Co Xanh'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-09.jpg) |
| TC-F5-10 | Boundary: min = max = 69000 | 1 result(s): ['The Little Prince'] | '1 book · from 69.000 ₫ · up to 69.000 ₫' → ['The Little Prince'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-10.jpg) |
| TC-F5-11 | Reversed range min 150,000 > max 100,000 (swapped) | 13 result(s): ['To Kill a Mockingbird', 'Nineteen Eighty-Four', 'Emma', 'The Hobbit', 'Foundation'] | '13 books · from 100.000 ₫ · up to 150.000 ₫ · page 1 of 2' → ['To Kill a Mockingbird', 'Nineteen Eighty-Four', 'Emma', 'The Hobbit', 'Foundation'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-11.jpg) |
| TC-F5-12 | Search + category: 'orwell' in Classics | 2 result(s): ['Nineteen Eighty-Four', 'Animal Farm'] | '2 books matching “orwell”' → ['Nineteen Eighty-Four', 'Animal Farm'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-12.jpg) |
| TC-F5-13 | Search + category with no match: 'orwell' in Fiction | 0 result(s): [] | '0 books matching “orwell”' → [] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-13.jpg) |
| TC-F5-14 | Pagination keeps filters (maxPrice=100000, 12 books) | Next link keeps maxPrice; page 2 shows the rest | next href=None; page2 titles=['Animal Farm', 'Pride and Prejudice', 'The Great Gatsby', 'Frankenstein', 'The Hound of the Baskervilles', 'The Alchemist', 'Cho Toi Xin Mot Ve Di Tuoi Tho', 'How to Win Friends and Influence People', 'The Little Prince', 'Matilda', 'Charlie and the Chocolate Factory', 'The BFG'] | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-14_pagination_with_filter.jpg) |
| TC-F5-15 | Invalid filter values (category=x, minPrice=-5, page=abc) | Ignored → all 36 books, page 1 | 36 books · page 1 of 3 | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-15_invalid_filters.jpg) |
| TC-F5-16 | Use the filter panel: 'tolkien' + max 200,000 → Apply | URL has both filters; 2 result(s) | /books?q=tolkien&category=&minPrice=&maxPrice=200000 → '2 books matching “tolkien” · up to 200.000 ₫' | **Pass** · [img](evidence/2026-11-11-S3/TC-F5-16_filter_panel.jpg) |
| TC-F5-17 | Clear filters | Back to /books with all books | /books – "36 books · page 1 of 3" (re-test with navigation wait). First automated run read the URL before client navigation finished. | **Pass** · results.json |

**Result: 17 / 17 Pass.** Defined behaviour worth stating in the AC: search is case-insensitive and matches part of the title or author; a reversed price range is swapped; invalid filter values are ignored; special characters are treated as plain text.
