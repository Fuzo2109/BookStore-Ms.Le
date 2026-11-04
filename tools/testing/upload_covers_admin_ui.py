"""Upload Open Library covers through the real Admin UI (Admin -> Books -> Edit -> Replace cover -> Save).
Usage: ADMIN_EMAIL=... ADMIN_PASSWORD=... python3 upload_covers_admin_ui.py DATA_DIR EVIDENCE_DIR
DATA_DIR = output of ol_collect.py (editions.json + covers/<id>.jpg). Needs: pip install playwright.
"""
import json, os, sys, time
from playwright.sync_api import sync_playwright

BASE = "https://book-store-ms-le.vercel.app"
EMAIL = os.environ["ADMIN_EMAIL"]  # temporary admin account, locked after use
final, ev = sys.argv[1], sys.argv[2]
pw = os.environ["ADMIN_PASSWORD"]  # never commit passwords
recs = [r for r in json.load(open(f"{final}/editions.json")) if r["status"] == "ok"][int(os.environ.get("START", 0)):int(os.environ.get("END", 999))]
log = []
with sync_playwright() as p:
    b = p.chromium.launch(
                          args=["--disable-background-networking", "--disable-component-update"])
    pg = b.new_page(viewport={"width": 1440, "height": 900})
    pg.goto(f"{BASE}/login?next=/admin")
    pg.fill("#email", EMAIL); pg.fill("#password", pw)
    pg.get_by_role("button", name="Log in").click()
    pg.wait_for_url(lambda u: u.split("?")[0].endswith("/admin"), timeout=30000)
    for i, r in enumerate(recs):
        path = f"{final}/covers/{r['id']}.jpg"
        for attempt in range(3):
            try:
                pg.goto(f"{BASE}/admin/books/{r['id']}/edit", wait_until="load")
                pg.wait_for_selector("#cover", state="attached", timeout=20000)
                pg.set_input_files("#cover", path)
                if i == 0:
                    pg.screenshot(path=f"{ev}/upload-01-admin-edit-cover-selected.png", full_page=True)
                with pg.expect_navigation(timeout=60000):
                    pg.get_by_role("button", name="Save changes").click()
                pg.wait_for_load_state("load")
                err = pg.locator("[role=alert]").all_inner_texts()
                if i == 0:
                    pg.screenshot(path=f"{ev}/upload-02-after-save.png", full_page=True)
                log.append({"id": r["id"], "url": pg.url, "alerts": err, "bytes": os.path.getsize(path)})
                print(r["id"], pg.url, err, flush=True)
                break
            except Exception as e:
                print(r["id"], "retry", attempt, pg.url, str(e)[:200], flush=True)
                pg.screenshot(path=f"{ev}/fail-{r['id']}.png")
                time.sleep(3)
        else:
            log.append({"id": r["id"], "error": "failed after 3 attempts"})
    b.close()
json.dump(log, open(f"{ev}/upload-log.json", "w"), indent=1)
