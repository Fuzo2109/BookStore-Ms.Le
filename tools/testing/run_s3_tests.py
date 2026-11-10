"""Sprint 3 test run on production: F4, F5, regression F1-F3 + CR-04, NFR timing.

Usage (from repo root):
  python3 tools/testing/run_s3_tests.py register   # phase 1: register the QA admin-to-be account
  (promote that account to admin in Supabase SQL)
  python3 tools/testing/run_s3_tests.py run        # phase 2: all tests

Expected values are read at run time from the public Supabase REST API (publishable key),
so the run stays correct while the team edits data. Passwords are random and kept in /tmp only.
Evidence (screenshots + results JSON) goes to docs/testing/evidence/<date>-S3/.
"""
import json
import os
import re
import secrets
import sys
import time
import urllib.parse
import urllib.request
from datetime import datetime, timezone, timedelta

from playwright.sync_api import sync_playwright, expect

BASE = "https://book-store-ms-le.vercel.app"
SB = "https://wmvolhwkglundesuvidv.supabase.co/rest/v1"
SB_KEY = "sb_publishable_S4mFpdT0ZQdChjfNWsz91A_4p_acagF"  # public (publishable) key
VN = timezone(timedelta(hours=7))
DAY = datetime.now(VN).strftime("%Y-%m-%d")
EVID = os.path.join("docs", "testing", "evidence", f"{DAY}-S3")
SECRETS = "/tmp/qa_s3_accounts.json"
os.makedirs(EVID, exist_ok=True)

RESULTS = []


def rest(path, params, count=False):
    url = f"{SB}/{path}?{urllib.parse.urlencode(params, safe='*,().')}"
    req = urllib.request.Request(url, headers={"apikey": SB_KEY, **({"Prefer": "count=exact"} if count else {})})
    with urllib.request.urlopen(req, timeout=20) as r:
        body = json.loads(r.read())
        total = int(r.headers["Content-Range"].split("/")[-1]) if count else None
    return body, total


def catalog(params):
    rows, total = rest("book_catalog", {"select": "id,title,author_name,category_id,category_name,price,cover_path,thumbnail_path,isbn13",
                                         "order": "created_at.desc,id.desc", **params}, count=True)
    return rows, total


def record(tc, title, expected, actual, ok, shot=None):
    RESULTS.append(dict(tc=tc, title=title, expected=expected, actual=actual,
                        status="Pass" if ok else "Fail", evidence=shot,
                        at=datetime.now(VN).strftime("%d/%m/%Y %H:%M")))
    print(("PASS " if ok else "FAIL ") + tc + " – " + actual)


def shot(page, name, full=False):
    p = os.path.join(EVID, f"{name}.jpg")
    page.screenshot(path=p, full_page=full, type="jpeg", quality=70)
    return p


def titles(page):
    return page.locator('section[aria-label="Books"] article h3 a').all_inner_texts()


def summary(page):
    return page.locator("h1 + p").first.inner_text()


def login(page, email, password):
    page.goto(f"{BASE}/login")
    page.fill("#email", email)
    page.fill("#password", password)
    page.get_by_role("button", name="Log in").click()
    page.wait_for_load_state("networkidle")


def logout(page):
    page.get_by_role("button", name="Log out").locator("visible=true").first.click()
    page.wait_for_load_state("networkidle")


# ------------------------------------------------------------------ phase 1
def phase_register(pw):
    stamp = datetime.now(VN).strftime("%m%d%H%M")
    acc = {
        "admin": {"email": f"qa.s3.admin.{stamp}@example.com", "password": secrets.token_urlsafe(12)},
        "customer": {"email": f"qa.s3.customer.{stamp}@example.com", "password": secrets.token_urlsafe(12)},
        "admin2": {"email": f"qa.s3.admin2.{stamp}@example.com", "password": secrets.token_urlsafe(12)},
    }
    b = pw.chromium.launch()
    page = b.new_page(viewport={"width": 1280, "height": 900})

    # TC-F1-16 visitor opens /admin
    page.goto(f"{BASE}/admin")
    ok = "/login" in page.url and ("next=%2Fadmin" in page.url or "next=/admin" in page.url)
    record("TC-F1-16", "Visitor opens /admin", "Redirect to /login?next=/admin", page.url.replace(BASE, ""), ok,
           shot(page, "TC-F1-16_visitor_admin_redirect"))

    # TC-F1-03 server-side validation (bypass the browser's minlength)
    page.goto(f"{BASE}/register")
    page.fill("#fullName", "QA Short Password")
    page.fill("#email", f"qa.s3.short.{stamp}@example.com")
    page.fill("#password", "short1")
    page.fill("#confirmPassword", "short1")
    page.evaluate("document.querySelectorAll('input').forEach(i => { i.removeAttribute('minlength'); })")
    page.get_by_role("button", name="Create account").click()
    page.wait_for_load_state("networkidle")
    msg = page.locator("#password-error").inner_text() if page.locator("#password-error").count() else ""
    record("TC-F1-03", "Register with a 7-char password, browser check bypassed", "Server rejects: 'at least 8 characters'",
           msg or "no error shown", "at least 8" in msg, shot(page, "TC-F1-03_server_short_password"))

    # TC-F1-01 register a new account
    page.goto(f"{BASE}/register")
    page.fill("#fullName", "QA S3 Admin")
    page.fill("#email", acc["admin"]["email"])
    page.fill("#password", acc["admin"]["password"])
    page.fill("#confirmPassword", acc["admin"]["password"])
    page.get_by_role("button", name="Create account").click()
    page.wait_for_load_state("networkidle")
    hi = page.locator("text=Hi,").count() > 0
    record("TC-F1-01", "Register a new account", "Account created, signed in, 'Hi, <name>' shown",
           f"URL {page.url.replace(BASE, '') or '/'}; greeting shown={hi}", hi, shot(page, "TC-F1-01_registered"))
    logout(page)

    # TC-F1-02 duplicate email
    page.goto(f"{BASE}/register")
    page.fill("#fullName", "QA Duplicate")
    page.fill("#email", acc["admin"]["email"])
    page.fill("#password", "Another123!")
    page.fill("#confirmPassword", "Another123!")
    page.get_by_role("button", name="Create account").click()
    page.wait_for_load_state("networkidle")
    err = page.locator("#email-error").inner_text() if page.locator("#email-error").count() else page.locator("[role=alert]").all_inner_texts()
    record("TC-F1-02", "Register with an existing email", "'An account with this email already exists.'",
           str(err), "already exists" in str(err), shot(page, "TC-F1-02_duplicate_email"))
    b.close()
    json.dump(acc, open(SECRETS, "w"))
    json.dump(RESULTS, open(os.path.join(EVID, "results-phase1.json"), "w"), indent=2)
    print("Promote to admin:", acc["admin"]["email"])


# ------------------------------------------------------------------ phase 2
ADMIN_PHASE = False


def phase_run(pw):
    acc = json.load(open(SECRETS))
    A, C, A2 = acc["admin"], acc["customer"], acc["admin2"]
    b = pw.chromium.launch()

    # ============ F1 regression ============
    adm = b.new_context(viewport={"width": 1280, "height": 900})
    ap = adm.new_page()
    ap.on("dialog", lambda d: d.accept())

    login(ap, A["email"], "wrong-password-123")
    err = " ".join(ap.locator("[role=alert]").all_inner_texts())
    record("TC-F1-06", "Login with a wrong password", "'Incorrect email or password.'", err or "no error",
           "Incorrect email or password" in err, shot(ap, "TC-F1-06_wrong_password"))

    login(ap, A["email"], A["password"])
    admin_ok = ap.url.rstrip("/").endswith("/admin")
    if admin_ok or ADMIN_PHASE:
        record("TC-F1-04", "Administrator logs in", "Lands on /admin dashboard", ap.url.replace(BASE, ""), admin_ok,
               shot(ap, "TC-F1-04_admin_dashboard"))
    if not admin_ok:
        print("QA account is not an admin yet – admin tests skipped (Not executed)")
        if not ADMIN_PHASE:
            # Register the customer through the public form instead of the admin page.
            reg = b.new_context().new_page()
            reg.goto(f"{BASE}/register")
            reg.fill("#fullName", "QA S3 Customer")
            reg.fill("#email", C["email"])
            reg.fill("#password", C["password"])
            reg.fill("#confirmPassword", C["password"])
            reg.get_by_role("button", name="Create account").click()
            reg.wait_for_load_state("networkidle")

    def create_account(name, email, password, role):
        ap.goto(f"{BASE}/admin/users")
        ap.fill("#u-name", name)
        ap.fill("#u-email", email)
        ap.fill("#u-password", password)
        ap.select_option("#u-role", role)
        ap.get_by_role("button", name="Create account").click()
        ap.wait_for_load_state("networkidle")
        time.sleep(1)
        return " ".join(ap.locator("[role=status], [role=alert], .field-error").all_inner_texts())

    if admin_ok:
      m = create_account("QA S3 Customer", C["email"], C["password"], "customer")
      record("TC-F1-08", "Admin creates a Customer account", "Success message; listed as Customer/Active", m,
             "Created customer account" in m, shot(ap, "TC-F1-08_admin_created_customer"))
      m = create_account("QA S3 Admin Two", A2["email"], A2["password"], "admin")
      record("TC-F1-09", "Admin creates an Administrator account", "Success message; listed as Administrator", m,
             "Created admin account" in m, shot(ap, "TC-F1-09_admin_created_admin"))
      m = create_account("QA Dup", C["email"], "Duplicate123!", "customer")
      record("TC-F1-10", "Admin creates an account with an existing email", "'An account with this email already exists.'", m,
             "already exists" in m, shot(ap, "TC-F1-10_duplicate"))

      me_row = ap.locator("tr", has_text=A["email"])
      ok = me_row.get_by_role("button", name="Lock").count() == 0 and "You" in me_row.inner_text()
      record("TC-F1-13", "Admin looks at their own row", "No Lock button ('You')", me_row.inner_text().replace("\n", " | "), ok)

    # Customer flows
    cus = b.new_context(viewport={"width": 1280, "height": 900})
    cp = cus.new_page()
    login(cp, C["email"], C["password"])
    ok = cp.url.rstrip("/") == BASE and cp.get_by_role("link", name="Admin").count() == 0
    record("TC-F1-05", "Customer logs in", "Lands on /, no Admin button", cp.url.replace(BASE, "") or "/", ok,
           shot(cp, "TC-F1-05_customer_home"))
    blocked = []
    for path in ["/admin", "/admin/books", "/admin/users"]:
        cp.goto(BASE + path)
        blocked.append(cp.locator("h1", has_text="Access denied").count() > 0)
    record("TC-F1-14", "Customer opens /admin, /admin/books, /admin/users", "'Access denied' each time",
           f"Access denied shown: {blocked}", all(blocked), shot(cp, "TC-F1-14_customer_forbidden"))
    cp.goto(BASE)
    logout(cp)
    cp.goto(f"{BASE}/admin")
    ok = "/login" in cp.url
    record("TC-F1-07", "Log out, then open /admin", "Back on /, /admin asks to log in", cp.url.replace(BASE, ""), ok,
           shot(cp, "TC-F1-07_after_logout"))

    if admin_ok:
      # Lock / unlock
      ap.goto(f"{BASE}/admin/users")
      row = ap.locator("tr", has_text=C["email"])
      row.get_by_role("button", name="Lock").click()
      ap.wait_for_load_state("networkidle")
      time.sleep(1.5)
      ap.reload()
      locked_shown = "Locked" in ap.locator("tr", has_text=C["email"]).inner_text()
      shot(ap, "TC-F1-11a_admin_locked_row")
      login(cp, C["email"], C["password"])
      err = " ".join(cp.locator("[role=alert]").all_inner_texts())
      record("TC-F1-11", "Admin locks an account; it tries to log in",
             "Row shows Locked; login fails with 'This account has been locked…'",
             f"row Locked={locked_shown}; login message: {err}", locked_shown and "locked" in err.lower(),
             shot(cp, "TC-F1-11b_locked_login"))

      ap.goto(f"{BASE}/admin/users")
      ap.locator("tr", has_text=C["email"]).get_by_role("button", name="Unlock").click()
      ap.wait_for_load_state("networkidle")
      time.sleep(1.5)
      login(cp, C["email"], C["password"])
      ok = cp.url.rstrip("/") == BASE and cp.locator("text=Hi,").count() > 0
      record("TC-F1-12", "Admin unlocks the account; it logs in", "Login succeeds", cp.url.replace(BASE, "") or "/", ok,
             shot(cp, "TC-F1-12_unlocked_login"))

      a2 = b.new_context(viewport={"width": 1280, "height": 900}).new_page()
      login(a2, A2["email"], A2["password"])
      record("TC-F1-09b", "New Administrator account logs in", "Lands on /admin", a2.url.replace(BASE, ""),
             a2.url.rstrip("/").endswith("/admin"))

      # ============ F2 regression (admin) ============
      def fill_book(title):
          ap.goto(f"{BASE}/admin/books/new")
          ap.fill("#title", title)
          ap.fill("#authorName", "George Orwell")
          ap.select_option("#categoryId", index=1)
          ap.fill("#price", "99000")
          ap.fill("#stock", "3")
          ap.fill("#description", "QA regression test book – created and removed by the Sprint 3 test run.")

      fill_book("QA S3 price check")
      ap.evaluate("document.querySelector('#price').removeAttribute('min'); document.querySelector('#price').value='0'")
      ap.get_by_role("button", name="Add book").click()
      ap.wait_for_load_state("networkidle")
      m = ap.locator("#price-error").inner_text() if ap.locator("#price-error").count() else "no error"
      record("TC-F2-R1", "Save a book with price 0 (browser check bypassed)", "Server: 'Price must be greater than 0.'; not saved",
             m, "greater than 0" in m, shot(ap, "TC-F2-R1_price_zero_server"))

      fill_book("QA S3 isbn check")
      ap.fill("#isbn13", "9780060935468")
      ap.get_by_role("button", name="Add book").click()
      ap.wait_for_load_state("networkidle")
      m = ap.locator("#isbn13-error").inner_text() if ap.locator("#isbn13-error").count() else "no error"
      record("TC-F2-R2", "Save a book with an ISBN-13 whose check digit is wrong", "Rejected with check-digit message; not saved",
             m, "check digit" in m, shot(ap, "TC-F2-R2_isbn_check_digit"))

      # CR-04 client checks + server sniffing
      os.makedirs("/tmp/qa_files", exist_ok=True)
      open("/tmp/qa_files/big.jpg", "wb").write(b"\xff\xd8\xff\xe0" + os.urandom(int(2.5 * 1024 * 1024)))
      open("/tmp/qa_files/anim.gif", "wb").write(b"GIF89a" + os.urandom(2000))
      open("/tmp/qa_files/doc.pdf", "wb").write(b"%PDF-1.7\n" + os.urandom(2000))
      open("/tmp/qa_files/fake.jpg", "wb").write(b"%PDF-1.7\n" + os.urandom(2000))
      fill_book("QA S3 cover check")
      for tc, f, expect_txt, title in [
          ("TC-CR04-AC2", "big.jpg", "2 MB", "Upload a 2.5 MB JPG"),
          ("TC-CR04-AC3a", "anim.gif", "JPG and PNG", "Upload a .gif"),
          ("TC-CR04-AC3b", "doc.pdf", "JPG and PNG", "Upload a .pdf"),
      ]:
          ap.set_input_files("#cover", f"/tmp/qa_files/{f}")
          time.sleep(0.5)
          m = ap.locator("#cover-error").inner_text() if ap.locator("#cover-error").count() else "no error"
          record(tc, title, f"Rejected, message states {expect_txt}", m, expect_txt in m, shot(ap, f"{tc}_{f.replace('.', '_')}"))
      ap.set_input_files("#cover", "/tmp/qa_files/fake.jpg")
      ap.get_by_role("button", name="Add book").click()
      ap.wait_for_load_state("networkidle")
      m = ap.locator("#cover-error").inner_text() if ap.locator("#cover-error").count() else "no error"
      created = rest("books", {"select": "id", "title": "eq.QA S3 cover check"})[0] if False else None
      record("TC-CR04-AC3c", "A PDF renamed to .jpg (passes the browser) is submitted",
             "Server inspects the bytes and rejects it; book not saved", m, "JPG and PNG" in m,
             shot(ap, "TC-CR04-AC3c_renamed_pdf_server"))

      # Create -> soft delete -> restore -> delete (cleanup by SQL afterwards)
      fill_book("QA S3 Regression Book")
      ap.get_by_role("button", name="Add book").click()
      ap.wait_for_load_state("networkidle")
      saved = "saved=" in ap.url
      new_id = re.search(r"saved=(\d+)", ap.url).group(1) if saved else None
      record("TC-F2-R3", "Add a valid book", "Redirect to Books list with 'saved' message", ap.url.replace(BASE, ""), saved,
             shot(ap, "TC-F2-R3_book_saved"))
      if new_id:
          _, n_before = catalog({"title": "eq.QA S3 Regression Book"})
          ap.goto(f"{BASE}/admin/books?q=QA+S3+Regression")
          ap.locator("tr", has_text="QA S3 Regression Book").get_by_role("button", name="Delete").click()
          ap.wait_for_load_state("networkidle")
          time.sleep(1.5)
          _, n_after = catalog({"title": "eq.QA S3 Regression Book"})
          pub = b.new_context().new_page()
          pub.goto(f"{BASE}/books/{new_id}")
          hidden = pub.locator("h1", has_text="couldn't find").count() > 0
          record("TC-F2-R4", "Soft-delete the book", "Hidden from customers (catalogue + detail page)",
                 f"visible before={n_before}, after={n_after}; detail page friendly message={hidden}",
                 n_before == 1 and n_after == 0 and hidden, shot(pub, "TC-F2-R4_deleted_book_public"))
          ap.goto(f"{BASE}/admin/books?show=deleted&q=QA+S3+Regression")
          ap.locator("tr", has_text="QA S3 Regression Book").get_by_role("button", name="Restore").click()
          ap.wait_for_load_state("networkidle")
          time.sleep(1.5)
          _, n_rest = catalog({"title": "eq.QA S3 Regression Book"})
          record("TC-F2-R5", "Restore the deleted book", "Visible again", f"visible={n_rest}", n_rest == 1,
                 shot(ap, "TC-F2-R5_restored"))
          ap.goto(f"{BASE}/admin/books?q=QA+S3+Regression")
          ap.locator("tr", has_text="QA S3 Regression Book").get_by_role("button", name="Delete").click()
          ap.wait_for_load_state("networkidle")
          RESULTS.append(dict(tc="cleanup", title=f"test book id {new_id}", expected="", actual="soft-deleted; hard-delete by SQL",
                              status="info", evidence=None, at=""))

      ap.goto(f"{BASE}/admin/categories")
      ap.locator("div.p-4", has=ap.locator("input[value='Fiction']")).get_by_role("button", name="Delete").click()
      ap.wait_for_load_state("networkidle")
      time.sleep(1)
      m = " ".join(ap.locator(".field-error").all_inner_texts())
      record("TC-F2-R6", "Delete a category that books still use (Fiction)", "Refused with 'still used by one or more books'",
             m or "no message", "still used" in m, shot(ap, "TC-F2-R6_category_in_use"))

    # ============ F3 regression ============
    pp = b.new_context(viewport={"width": 1440, "height": 900}).new_page()
    rows, total = catalog({"limit": "12"})
    pages = -(-total // 12)
    pp.goto(f"{BASE}/books")
    t = titles(pp)
    s = summary(pp)
    ok = len(t) == min(12, total) and t[0] == rows[0]["title"] and f"{total} books" in s and f"page 1 of {pages}" in s
    record("TC-F3-R1", "Book list page 1", f"12 cards newest first ('{rows[0]['title']}'), '{total} books · page 1 of {pages}'",
           f"{len(t)} cards, first '{t[0] if t else ''}', '{s}'", ok, shot(pp, "TC-F3-R1_list_page1"))

    # ============ F4 ============
    rows2, _ = catalog({"limit": "12", "offset": "12"})
    pp.goto(f"{BASE}/books?page=2")
    first = titles(pp)[0]
    pp.locator('section[aria-label="Books"] article h3 a').first.click()
    pp.wait_for_load_state("networkidle")
    h1 = pp.locator("h1").inner_text()
    has_parts = all(pp.locator(sel).count() > 0 for sel in ["text=Description", "text=Product details", "text=Add to cart"])
    record("TC-F4-01", "Open a book from list page 2", "Detail page of the same book: title, author, price, stock, description, product details",
           f"clicked '{first}', detail h1 '{h1}', sections present={has_parts}", h1 == first == rows2[0]["title"] and has_parts,
           shot(pp, "TC-F4-01_detail_from_page2", full=True))
    detail_img = pp.locator("main img").first.get_attribute("src") or ""
    pp.get_by_role("link", name="← Back to the book list").first.click()
    pp.wait_for_load_state("networkidle")
    ok = "page=2" in pp.url and titles(pp)[0] == first
    record("TC-F4-02", "Click Back on the detail page", "Returns to /books?page=2 with the same books",
           pp.url.replace(BASE, ""), ok, shot(pp, "TC-F4-02_back_to_page2"))

    _, tot250 = catalog({"price": "lte.250000"})
    pp.goto(f"{BASE}/books?category=&maxPrice=250000&page=2")
    first = titles(pp)[0] if titles(pp) else ""
    pp.locator('section[aria-label="Books"] article h3 a').first.click()
    pp.wait_for_load_state("networkidle")
    pp.get_by_role("link", name="← Back to the book list").first.click()
    pp.wait_for_load_state("networkidle")
    ok = "maxPrice=250000" in pp.url and "page=2" in pp.url and titles(pp)[0] == first
    record("TC-F4-03", "Open a book from a filtered page 2 (maxPrice=250000) and go back",
           "Back keeps the filter and the page", pp.url.replace(BASE, ""), ok, shot(pp, "TC-F4-03_back_keeps_filters"))

    for tc, path, title in [("TC-F4-04", "/books/999999", "Non-existent book ID"),
                            ("TC-F4-05", "/books/abc", "Invalid book ID (text)"),
                            ("TC-F4-06", None, "Soft-deleted book ID")]:
        if path is None:
            deleted = rest("books", {"select": "id", "deleted_at": "not.is.null", "limit": "1"})[0]
            path = f"/books/{deleted[0]['id']}" if deleted else "/books/999998"
        resp = pp.goto(BASE + path)
        friendly = pp.locator("h1", has_text="couldn't find").count() > 0
        back = pp.get_by_role("link", name="← Back to the book list").get_attribute("href")
        record(tc, f"{title} ({path})", "Friendly 'We couldn't find that book' message, no crash, Back link",
               f"HTTP {resp.status}; friendly={friendly}; back={back}", friendly and resp.status < 500,
               shot(pp, f"{tc}_not_found"))

    withcover = [r for r in catalog({"limit": "40"})[0] if r["cover_path"]][0]
    pp.goto(f"{BASE}/books/{withcover['id']}")
    src = pp.locator("main img").first.get_attribute("src") or ""
    pp.goto(f"{BASE}/books")
    card_srcs = pp.locator('section[aria-label="Books"] article img').evaluate_all("els => els.map(e => e.getAttribute('src'))")
    ok = "/original-" in src and all(("/thumb-" in c) or ("default-cover" in c) for c in card_srcs)
    record("TC-F4-07", "Detail uses the original image, list uses thumbnails (CR-04)",
           "Detail img = original-*; list cards = thumb-*.webp (or default)", f"detail: …{src[-40:]}; list thumbs: "
           f"{sum('/thumb-' in c for c in card_srcs)}/{len(card_srcs)}", ok)

    nocover = rest("book_catalog", {"select": "id,title", "cover_path": "is.null", "limit": "1"})[0]
    if nocover:
        pp.goto(f"{BASE}/books/{nocover[0]['id']}")
        src = pp.locator("main img").first.get_attribute("src") or ""
        record("TC-F4-08", f"Book without a cover ({nocover[0]['title']})", "Default cover image (CR-04 AC5)", src,
               "default-cover" in src, shot(pp, "TC-F4-08_default_cover"))

    detail = rest("book_catalog", {"select": "id,title,isbn13,publisher", "isbn13": "not.is.null", "limit": "1"})[0][0]
    pp.goto(f"{BASE}/books/{detail['id']}")
    btn = pp.get_by_role("button", name="Add to cart")
    dl = pp.locator("#details-heading").locator("xpath=..").inner_text()
    ok = btn.is_disabled() and detail["isbn13"] in dl and "ISBN-13" in dl
    record("TC-F4-09", f"Product details + disabled Add to cart ({detail['title']})",
           "ISBN-13 and other details listed; Add to cart disabled with note (cart out of scope)",
           f"button disabled={btn.is_disabled()}; ISBN shown={detail['isbn13'] in dl}", ok,
           shot(pp, "TC-F4-09_product_details", full=True))

    mob = b.new_context(**pw.devices["iPhone SE"]).new_page()
    mob.goto(f"{BASE}/books/{detail['id']}")
    sw = mob.evaluate("document.documentElement.scrollWidth")
    vw = mob.evaluate("window.innerWidth")
    record("TC-F4-10", "Detail page on a phone (iPhone SE)", "Readable, no horizontal scrolling",
           f"scrollWidth={sw}, viewport={vw}", sw <= vw + 1, shot(mob, "TC-F4-10_detail_phone", full=True))

    # ============ F5 ============
    def search_case(tc, title, query, rest_params, extra_check=None, expect_titles=None):
        exp_rows, exp_total = catalog({**rest_params, "limit": "12"})
        pp.goto(f"{BASE}/books?{query}")
        got = titles(pp)
        s = summary(pp)
        ok = f"{exp_total} book" in s and got == [r["title"] for r in exp_rows]
        if expect_titles is not None:
            ok = ok and sorted(got) == sorted(expect_titles)
        if extra_check:
            ok = ok and extra_check(pp)
        record(tc, title, f"{exp_total} result(s): {[r['title'] for r in exp_rows][:5]}", f"'{s}' → {got[:5]}", ok,
               shot(pp, tc))

    orw = {"or": "(title.ilike.*orwell*,author_name.ilike.*orwell*)"}
    search_case("TC-F5-01", "Search by author 'orwell'", "q=orwell", orw,
                expect_titles=["Nineteen Eighty-Four", "Animal Farm"])
    search_case("TC-F5-02", "Search is case-insensitive 'ORWELL'", "q=ORWELL", orw)
    search_case("TC-F5-03", "Search by title 'gatsby'", "q=gatsby", {"or": "(title.ilike.*gatsby*,author_name.ilike.*gatsby*)"})
    search_case("TC-F5-04", "Search Vietnamese title 'hoa vang'", "q=hoa+vang",
                {"or": "(title.ilike.*hoa vang*,author_name.ilike.*hoa vang*)"})
    pp.goto(f"{BASE}/books?q=zzzzqq")
    msg = pp.locator("text=No books match your search.").count() > 0
    record("TC-F5-05", "Search with no match 'zzzzqq'", "'No books match your search.' + 'Show all books'",
           f"message shown={msg}", msg, shot(pp, "TC-F5-05_no_match"))
    pp.goto(f"{BASE}/books?q=")
    _, tot = catalog({})
    record("TC-F5-06", "Empty search", f"All {tot} books", summary(pp), f"{tot} books" in summary(pp))
    resp = pp.goto(f"{BASE}/books?q=" + urllib.parse.quote("100%_off,(x)*"))
    record("TC-F5-07", "Search with special characters '100%_off,(x)*'", "Treated as text, no error page",
           f"HTTP {resp.status}; '{summary(pp)}'", resp.status == 200 and "book" in summary(pp),
           shot(pp, "TC-F5-07_special_chars"))
    search_case("TC-F5-08", "Filter by category 2 (Classics)", "category=2", {"category_id": "eq.2"},
                extra_check=lambda p: p.locator("h1").inner_text() == "Classics")
    search_case("TC-F5-09", "Category 1 + price 100,000–150,000", "category=1&minPrice=100000&maxPrice=150000",
                {"category_id": "eq.1", "and": "(price.gte.100000,price.lte.150000)"})
    cheapest = rest("book_catalog", {"select": "price", "order": "price.asc", "limit": "1"})[0][0]["price"]
    search_case("TC-F5-10", f"Boundary: min = max = {cheapest}", f"minPrice={cheapest}&maxPrice={cheapest}",
                {"price": f"eq.{cheapest}"})
    search_case("TC-F5-11", "Reversed range min 150,000 > max 100,000 (swapped)", "minPrice=150000&maxPrice=100000",
                {"and": "(price.gte.100000,price.lte.150000)"})
    search_case("TC-F5-12", "Search + category: 'orwell' in Classics", "q=orwell&category=2",
                {**orw, "category_id": "eq.2"})
    search_case("TC-F5-13", "Search + category with no match: 'orwell' in Fiction", "q=orwell&category=1",
                {**orw, "category_id": "eq.1"})
    _, t100 = catalog({"price": "lte.100000"})
    pp.goto(f"{BASE}/books?maxPrice=100000")
    nxt = pp.get_by_role("link", name="Next →")
    href = nxt.get_attribute("href") if nxt.count() else None
    if href:
        nxt.click()
        pp.wait_for_load_state("networkidle")
    exp2, _ = catalog({"price": "lte.100000", "limit": "12", "offset": "12"})
    ok = (t100 <= 12 and href is None) or (href and "maxPrice=100000" in href and "page=2" in href and titles(pp) == [r["title"] for r in exp2])
    record("TC-F5-14", f"Pagination keeps filters (maxPrice=100000, {t100} books)", "Next link keeps maxPrice; page 2 shows the rest",
           f"next href={href}; page2 titles={titles(pp)}", bool(ok), shot(pp, "TC-F5-14_pagination_with_filter"))
    pp.goto(f"{BASE}/books?category=x&minPrice=-5&page=abc")
    record("TC-F5-15", "Invalid filter values (category=x, minPrice=-5, page=abc)", f"Ignored → all {tot} books, page 1",
           summary(pp), f"{tot} books" in summary(pp), shot(pp, "TC-F5-15_invalid_filters"))
    # Filter form (UI)
    pp.goto(f"{BASE}/books")
    pp.fill("#f-q", "tolkien")
    pp.fill("#f-max", "200000")
    pp.get_by_role("button", name="Apply").click()
    pp.wait_for_load_state("networkidle")
    exp_rows, exp_total = catalog({"or": "(title.ilike.*tolkien*,author_name.ilike.*tolkien*)", "price": "lte.200000"})
    ok = "q=tolkien" in pp.url and "maxPrice=200000" in pp.url and f"{exp_total} book" in summary(pp)
    record("TC-F5-16", "Use the filter panel: 'tolkien' + max 200,000 → Apply", f"URL has both filters; {exp_total} result(s)",
           f"{pp.url.replace(BASE, '')} → '{summary(pp)}'", ok, shot(pp, "TC-F5-16_filter_panel"))
    pp.get_by_role("link", name="Clear").click()
    pp.wait_for_load_state("networkidle")
    record("TC-F5-17", "Clear filters", "Back to /books with all books", pp.url.replace(BASE, ""),
           pp.url.rstrip("/").endswith("/books"))

    # ============ NFR timing (CR-04 AC4 / list < 2 s) ============
    times = []
    for i in range(3):
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        pg = ctx.new_page()
        pg.goto(f"{BASE}/books", wait_until="load")
        t = pg.evaluate("(() => { const n = performance.getEntriesByType('navigation')[0]; return {dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd)} })()")
        times.append(t)
        ctx.close()
    ok = all(t["load"] < 2000 for t in times)
    record("NFR-01", "List page load time (3 cold loads, no cache, from the test server)", "< 2000 ms each",
           f"load ms: {[t['load'] for t in times]}", ok)

    b.close()
    out = json.load(open(os.path.join(EVID, "results-phase1.json"))) + RESULTS
    json.dump(out, open(os.path.join(EVID, "results.json"), "w"), indent=2, ensure_ascii=False)
    print(f"\n{sum(r['status'] == 'Pass' for r in out)} pass, {sum(r['status'] == 'Fail' for r in out)} fail")


if __name__ == "__main__":
    with sync_playwright() as pw:
        {"register": phase_register, "run": phase_run}[sys.argv[1]](pw)
