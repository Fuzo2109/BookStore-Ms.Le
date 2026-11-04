"""Collect one Open Library edition per book (cover + product details from the SAME edition).

Usage: python3 -I ol_collect.py books.json outdir
books.json: [{"id":1,"title":"...","author":"..."}]
Writes outdir/editions.json and outdir/covers/<id>.jpg (raw bytes as served by covers.openlibrary.org).
No value is guessed: fields missing on the chosen edition stay null.
"""
import json, re, sys, time, unicodedata, urllib.parse, urllib.request

UA = {"User-Agent": "Group4-Bookstore-ClassProject/1.0"}
MAX = 2 * 1024 * 1024
LANG = {"eng": "English", "vie": "Vietnamese", "fre": "French", "jpn": "Japanese", "ger": "German",
        "spa": "Spanish", "rus": "Russian", "por": "Portuguese", "ita": "Italian"}


def get(url, binary=False, tries=5):
    for i in range(tries):
        try:
            with urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60) as r:
                data = r.read()
                return data if binary else json.loads(data)
        except urllib.error.HTTPError as e:
            if e.code == 404:
                return None
            err = e
        except Exception as e:  # flaky proxy tunnel
            err = e
        time.sleep(2 + 2 * i)
    raise RuntimeError(f"{url}: {err}")


def norm(s):
    s = unicodedata.normalize("NFKD", s or "").encode("ascii", "ignore").decode().lower()
    return re.sub(r"[^a-z0-9]+", " ", s).strip()


def isbn13_ok(v):
    return bool(re.fullmatch(r"\d{13}", v)) and sum(int(c) * (1 if i % 2 == 0 else 3) for i, c in enumerate(v)) % 10 == 0


def isbn10_ok(v):
    return bool(re.fullmatch(r"\d{9}[\dX]", v)) and sum((10 if c == "X" else int(c)) * (10 - i) for i, c in enumerate(v)) % 11 == 0


MONTHS = {m: i for i, m in enumerate(["january", "february", "march", "april", "may", "june", "july", "august",
                                       "september", "october", "november", "december"], 1)}


def full_date(s):
    """Only an exact day is stored (column type is date); year-only / month-year -> None (no guessing)."""
    if not s:
        return None
    s = s.strip().replace(",", "")
    m = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", s)
    if m:
        return s
    m = re.fullmatch(r"([A-Za-z]+)\.? (\d{1,2}) (\d{4})", s)
    if m and m.group(1).lower() in MONTHS:
        return f"{m.group(3)}-{MONTHS[m.group(1).lower()]:02d}-{int(m.group(2)):02d}"
    m = re.fullmatch(r"(\d{1,2}) ([A-Za-z]+)\.? (\d{4})", s)
    if m and m.group(2).lower() in MONTHS:
        return f"{m.group(3)}-{MONTHS[m.group(2).lower()]:02d}-{int(m.group(1)):02d}"
    return None


def weight_lbs(s):
    """Unit conversion only (exact factors); unknown unit -> None."""
    if not s:
        return None
    m = re.fullmatch(r"\s*([\d.]+)\s*(pounds?|lbs?|ounces?|oz|grams?|g|kilograms?|kg)\.?\s*", s.lower())
    if not m:
        return None
    v, u = float(m.group(1)), m.group(2)
    f = 1 if u.startswith(("pound", "lb")) else 1 / 16 if u.startswith(("ounce", "oz")) else \
        1 / 453.59237 if u in ("g", "gram", "grams") else 1 / 0.45359237
    r = round(v * f, 2)
    return r if r > 0 else None


def dims(s):
    if not s:
        return None
    m = re.fullmatch(r"\s*([\d.]+)\s*[xX×]\s*([\d.]+)\s*(?:[xX×]\s*([\d.]+)\s*)?(inches|inch|cm|mm)\s*", s)
    if not m:
        return None  # malformed (e.g. a missing number) -> leave empty
    nums = [g for g in m.groups()[:3] if g]
    return " × ".join(nums) + " " + m.group(4)


def details(ed):
    i13 = next((x.replace("-", "") for x in ed.get("isbn_13", []) if isbn13_ok(x.replace("-", ""))), None)
    i10 = next((x.replace("-", "").upper() for x in ed.get("isbn_10", []) if isbn10_ok(x.replace("-", "").upper())), None)
    langs = [LANG.get(l["key"].split("/")[-1]) for l in ed.get("languages", [])]
    pub = (ed.get("publishers") or [None])[0]
    fmt = ed.get("physical_format")
    return {
        "format": fmt.strip().title() if fmt and len(fmt) <= 50 else None,
        "language": langs[0] if len(langs) == 1 and langs[0] else None,
        "publisher": pub.strip() if pub and len(pub) <= 150 else None,
        "publication_date": full_date(ed.get("publish_date")),
        "publish_date_raw": ed.get("publish_date"),
        "isbn13": i13,
        "isbn10": i10,
        "dimensions": dims(ed.get("physical_dimensions")),
        "shipping_weight_lbs": weight_lbs(ed.get("weight")),
        "weight_raw": ed.get("weight"),
    }


NONPRINT = re.compile(r"audio|cd|cassette|digital|e-?book|kindle|playaway|mp3|braille|graphic|\bvol(ume)?\b|\bpart\b", re.I)


def title_ok(ed, book_title):
    et, bt = norm(ed.get("title")), norm(book_title)
    bt2 = bt.replace(" and ", " ")
    et2 = et.replace(" and ", " ")
    return et == bt or et2 == bt2 or et.startswith(bt + " ") and len(et) - len(bt) < 45 or bt.startswith(et + " ")


def eligible(ed, want_lang, book_title):
    langs = [l["key"].split("/")[-1] for l in ed.get("languages", [])]
    fmt = (ed.get("physical_format") or "") + " " + (ed.get("title") or "")
    return langs == [want_lang] and not NONPRINT.search(fmt) and title_ok(ed, book_title)


def score(ed, want_lang):
    d = details(ed)
    langs = [l["key"].split("/")[-1] for l in ed.get("languages", [])]
    return (want_lang in langs,
            sum(1 for k in ("format", "publisher", "publication_date", "isbn13", "isbn10", "dimensions",
                            "shipping_weight_lbs") if d[k]),
            bool(d["isbn13"]))


def main(books_path, out):
    import os
    os.makedirs(f"{out}/covers", exist_ok=True)
    books = json.load(open(books_path))
    result = []
    for b in books:
        rec = {"id": b["id"], "title": b["title"], "author": b["author"], "status": None}
        try:
            q = urllib.parse.urlencode({"title": b["title"], "author": b["author"], "limit": 5,
                                        "fields": "key,title,author_name,cover_i,edition_count"})
            docs = (get(f"https://openlibrary.org/search.json?{q}") or {}).get("docs", [])
            q2 = urllib.parse.urlencode({"q": f"{b['title']} {b['author']}", "limit": 5,
                                         "fields": "key,title,author_name,cover_i,edition_count"})
            docs += (get(f"https://openlibrary.org/search.json?{q2}") or {}).get("docs", [])
            nt = norm(b["title"])
            work = next((d for d in docs if norm(d["title"]) == nt or nt.startswith(norm(d["title"]) + " ")
                         or norm(d["title"]).startswith(nt + " ")), None)
            if b.get("work"):  # work key looked up by hand (title on OL is in the original language)
                work = {"key": b["work"], "title": b["title"]}
            if not work:
                rec["status"] = "no matching work on Open Library"
                result.append(rec); continue
            rec["work"] = work["key"]; rec["work_title"] = work["title"]
            want = "vie" if b.get("vietnamese") else "eng"
            eds = []
            for off in range(0, 800, 200):  # big works (e.g. The Little Prince) have hundreds of editions
                page = (get(f"https://openlibrary.org{work['key']}/editions.json?limit=200&offset={off}") or {}).get("entries", [])
                eds += page
                if len(page) < 200:
                    break
            eds = [e for e in eds if any(c and c > 0 for c in e.get("covers", [])) and eligible(e, want, b["title"])
                   and e["key"] not in b.get("exclude", [])]  # editions rejected after visual check
            if not eds:
                rec["status"] = "work found but no eligible edition (same language, print, same title) with a cover"
                result.append(rec); continue
            eds.sort(key=lambda e: score(e, want), reverse=True)
            img = None
            for ed in eds[:8]:  # best-scored edition whose large cover is a real, reasonably sized image
                cover_id = next(c for c in ed["covers"] if c and c > 0)
                img = get(f"https://covers.openlibrary.org/b/id/{cover_id}-L.jpg?default=false", binary=True)
                if img and len(img) > 15000:
                    break
                img = None
            if not img:
                rec["status"] = "no usable cover image (eligible editions only)"
                result.append(rec); continue
            open(f"{out}/covers/{b['id']}.jpg", "wb").write(img)
            rec.update(edition=ed["key"], edition_title=ed.get("title"), cover_id=cover_id,
                       cover_bytes=len(img), details=details(ed), status="ok")
            print(f"✔ {b['id']:>2} {b['title'][:40]:40} {ed['key']} cover {len(img)//1024} KB", flush=True)
        except Exception as e:
            rec["status"] = f"error: {e}"
            print(f"✘ {b['id']} {b['title']}: {e}", flush=True)
        result.append(rec)
        time.sleep(0.5)
    json.dump(result, open(f"{out}/editions.json", "w"), indent=1, ensure_ascii=False)


if __name__ == "__main__":
    main(*sys.argv[1:3])
