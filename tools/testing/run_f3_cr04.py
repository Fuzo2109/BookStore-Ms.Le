"""Execute docs/testing/F3-CR04-test-cases.md against production with headless Chrome (Playwright + CDP).
Usage: python3 run_f3.py OUTDIR
"""
import json, sys, datetime
from playwright.sync_api import sync_playwright

BASE = "https://book-store-ms-le.vercel.app"
OUT = sys.argv[1]
ARGS = ["--disable-background-networking", "--disable-component-update"]
# Chrome DevTools "Fast 4G" preset (NetworkManager.ts): 9 Mbps x0.9 down, 1.5 Mbps x0.9 up, 60 ms x2.75 latency
FAST4G = dict(offline=False, latency=165, downloadThroughput=9_000_000 / 8 * 0.9, uploadThroughput=1_500_000 / 8 * 0.9)
R = {"started": datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).isoformat(timespec="seconds")}


def cards(pg):
    return pg.eval_on_selector_all("article", """els => els.map(a => ({
        title: a.querySelector('h3')?.innerText.trim(),
        author: a.querySelector('h3 + p')?.innerText.trim(),
        price: a.querySelector('p.font-bold')?.innerText.trim(),
        img: a.querySelector('img')?.getAttribute('src'),
        oos: !!Array.from(a.querySelectorAll('span')).find(s => s.innerText.trim() === 'Out of stock')}))""")


def layout(pg):
    return pg.evaluate("""() => {
        const arts = [...document.querySelectorAll('article')];
        const tops = arts.map(a => Math.round(a.getBoundingClientRect().top));
        const perRow = tops.filter(t => t === tops[0]).length;
        const aside = document.querySelector('aside')?.getBoundingClientRect();
        const grid = arts[0]?.parentElement.getBoundingClientRect();
        const search = document.querySelector('input[type=search], input[name=q]')?.getBoundingClientRect();
        return { perRow, scrollW: document.documentElement.scrollWidth, clientW: document.documentElement.clientWidth,
                 asideLeftOfGrid: aside && grid ? aside.right <= grid.left : null,
                 asideAboveGrid: aside && grid ? aside.bottom <= grid.top : null,
                 searchWidth: search ? Math.round(search.width) : null };
    }""")


with sync_playwright() as p:
    b = p.chromium.launch(args=ARGS)

    # ---------- TC-F3-01..05, 09, 10 at desktop width ----------
    ctx = b.new_context(viewport={"width": 1440, "height": 900})
    pg = ctx.new_page()
    pg.goto(f"{BASE}/books", wait_until="load")
    main = pg.inner_text("main")
    c1 = cards(pg)
    R["tc01"] = {"heading": pg.inner_text("h1"), "count_text": next((l for l in main.splitlines() if "books ·" in l), None),
                 "cards": len(c1), "all_have_fields": all(c["title"] and c["author"] and c["price"] and c["img"] for c in c1),
                 "price_sample": c1[0]["price"] if c1 else None}
    R["tc02"] = {"first": c1[0]["title"], "twelfth": c1[11]["title"] if len(c1) > 11 else None,
                 "page1": [c["title"] for c in c1]}
    pg.screenshot(path=f"{OUT}/TC-F3-01-02_desktop_page1.png", full_page=True)
    pages = {1: c1}
    for n in (2, 3, 4):
        pg.goto(f"{BASE}/books?page={n}", wait_until="load")
        pages[n] = cards(pg)
        pg.screenshot(path=f"{OUT}/TC-F3-03_page{n}.png", full_page=True)
    R["tc03"] = {n: {"count": len(v), "first": v[0]["title"] if v else None, "last": v[-1]["title"] if v else None}
                 for n, v in pages.items() if n > 1}
    pg.goto(f"{BASE}/books?page=99", wait_until="load")
    m99 = pg.inner_text("main")
    R["tc04"] = {"has_message": "This page does not exist." in m99,
                 "button_to_page1": pg.locator("main a", has_text="1").count() > 0 or "page 1" in m99.lower(),
                 "text": m99[:300]}
    pg.screenshot(path=f"{OUT}/TC-F3-04_page99.png", full_page=True)
    R["tc05"] = {}
    for q in ("abc", "-1"):
        pg.goto(f"{BASE}/books?page={q}", wait_until="load")
        cc = cards(pg)
        R["tc05"][q] = {"first": cc[0]["title"] if cc else None, "count": len(cc),
                        "count_text": next((l for l in pg.inner_text("main").splitlines() if "books ·" in l), None)}
    pg.screenshot(path=f"{OUT}/TC-F3-05_page_minus1.png")
    allc = [c for v in pages.values() for c in v]
    nocover = [c for c in allc if "default-cover" in (c["img"] or "") or not c["img"] or "/thumb-" not in c["img"]]
    R["tc09"] = {"cards_without_thumb": [(c["title"], c["img"]) for c in nocover]}
    if nocover:
        for n, v in pages.items():
            if any(c["title"] == nocover[0]["title"] for c in v):
                pg.goto(f"{BASE}/books?page={n}", wait_until="load")
                el = pg.locator("article", has_text=nocover[0]["title"]).first
                el.scroll_into_view_if_needed(); pg.wait_for_timeout(1500)
                el.screenshot(path=f"{OUT}/TC-F3-09_default_cover_card.png")
                R["tc09"]["img_natural_width"] = el.locator("img").evaluate("i => i.naturalWidth")
    R["tc10"] = {"out_of_stock_cards": [c["title"] for c in allc if c["oos"]]}
    for t in R["tc10"]["out_of_stock_cards"]:
        for n, v in pages.items():
            if any(c["title"] == t for c in v):
                pg.goto(f"{BASE}/books?page={n}", wait_until="load")
                el = pg.locator("article", has_text=t).first
                el.scroll_into_view_if_needed(); pg.wait_for_timeout(1500)
                el.screenshot(path=f"{OUT}/TC-F3-10_out_of_stock_{t.replace(' ', '_')}.png")
    ctx.close()

    # ---------- TC-F3-06..08 responsive ----------
    for tc, name, vp, mobile in [("tc06", "desktop_1440", {"width": 1440, "height": 900}, False),
                                 ("tc07", "tablet_768_iPadMini", {"width": 768, "height": 1024}, True),
                                 ("tc08", "phone_375_iPhoneSE", {"width": 375, "height": 667}, True)]:
        ctx = b.new_context(viewport=vp, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile)
        pg = ctx.new_page()
        pg.goto(f"{BASE}/books", wait_until="load")
        pg.evaluate("window.scrollTo(0, document.body.scrollHeight)"); pg.wait_for_timeout(2500)
        pg.evaluate("window.scrollTo(0, 0)"); pg.wait_for_timeout(500)
        R[tc] = {"viewport": vp, **layout(pg)}
        pg.screenshot(path=f"{OUT}/TC-F3-0{tc[-1]}_{name}_full.png", full_page=True)
        pg.screenshot(path=f"{OUT}/TC-F3-0{tc[-1]}_{name}_viewport.png")
        ctx.close()

    # ---------- TC-CR04-AC4: 3 cold loads, cache disabled, Fast 4G ----------
    R["ac4"] = []
    for run in (1, 2, 3):
        ctx = b.new_context(viewport={"width": 1440, "height": 900})
        pg = ctx.new_page()
        cdp = ctx.new_cdp_session(pg)
        cdp.send("Network.enable")
        cdp.send("Network.setCacheDisabled", {"cacheDisabled": True})
        cdp.send("Network.emulateNetworkConditions", FAST4G)
        reqs, sizes = {}, {}
        cdp.on("Network.responseReceived", lambda e: reqs.__setitem__(e["requestId"], (e["response"]["url"], e["type"])))
        cdp.on("Network.loadingFinished", lambda e: sizes.__setitem__(e["requestId"], e["encodedDataLength"]))
        pg.goto(f"{BASE}/books", wait_until="load")
        pg.wait_for_timeout(1000)
        nav = pg.evaluate("""() => { const n = performance.getEntriesByType('navigation')[0];
            return { dcl: Math.round(n.domContentLoadedEventEnd), load: Math.round(n.loadEventEnd),
                     ttfb: Math.round(n.responseStart) }; }""")
        imgs = [(u, sizes.get(rid, 0)) for rid, (u, t) in reqs.items() if t == "Image" and "book-covers" in u]
        card_srcs = pg.eval_on_selector_all("article img", "els => els.map(e => e.currentSrc || e.src)")
        R["ac4"].append({"run": run, **nav,
                         "requests": len(reqs), "total_kb": round(sum(sizes.values()) / 1024, 1),
                         "cover_images_loaded": len(imgs),
                         "cover_images_all_thumb_webp": all("/thumb-" in u and u.split("?")[0].endswith(".webp") for u, _ in imgs),
                         "cover_image_kb": [round(s / 1024, 1) for _, s in imgs],
                         "card_srcs_all_thumb_webp": all(("/thumb-" in s and s.split("?")[0].endswith(".webp"))
                                                         or "default-cover" in s for s in card_srcs),
                         "cards": len(card_srcs)})
        pg.screenshot(path=f"{OUT}/TC-CR04-AC4_run{run}.png")
        ctx.close()
    b.close()

R["finished"] = datetime.datetime.now(datetime.timezone(datetime.timedelta(hours=7))).isoformat(timespec="seconds")
json.dump(R, open(f"{OUT}/results.json", "w"), indent=1, ensure_ascii=False)
print(json.dumps(R, indent=1, ensure_ascii=False))
