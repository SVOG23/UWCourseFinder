#!/usr/bin/env python3
"""Build the course dataset consumed by the UW Course Finder web app.

Source
------
University of Washington course catalog, scraped into a CSV by the open-source
project `kjiwa/uw-course-catalog` (columns: Campus, Department, Code, Name,
Credits, Areas of Knowledge, Prerequisites, Offered). The catalog itself is the
official UW Course Descriptions site (https://www.washington.edu/students/crscat/).

This script normalizes that CSV into `public/data/courses.json`, the file the
front end loads at runtime. Re-run it to refresh the catalog:

    python3 scripts/build_data.py            # download fresh + build
    python3 scripts/build_data.py --csv x.csv  # build from a local CSV

Note on prerequisites: the upstream CSV stores prerequisites as a flat,
comma-separated list of course codes and does not preserve UW's "one of / all
of" logic. We keep the flat list (good enough for a dependency map) and surface
a caveat in the UI. Always confirm real requirements in MyPlan / an official
DARS audit.
"""
from __future__ import annotations

import argparse
import csv
import json
import os
import re
import sys
import urllib.request
from datetime import datetime, timezone

CSV_URL = "https://raw.githubusercontent.com/kjiwa/uw-course-catalog/master/uwcourses.csv"
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
OUT = os.path.join(ROOT, "public", "data", "courses.json")
CAMPUS = "Seattle"


def parse_offered(raw: str) -> list[str]:
    """Turn an 'Offered' string (e.g. 'AWSp') into ['A','W','Sp']."""
    if not raw:
        return []
    out: list[str] = []
    s = raw
    if re.search(r"Sp", s):
        out.append("Sp")
        s = s.replace("Sp", "")
    for letter, code in (("A", "A"), ("W", "W"), ("S", "S")):
        if letter in s and code not in out:
            out.append(code)
    order = {"A": 0, "W": 1, "Sp": 2, "S": 3}
    return sorted(out, key=lambda q: order.get(q, 9))


def level_of(num: str) -> int:
    m = re.match(r"(\d+)", num)
    if not m:
        return 0
    return (int(m.group(1)) // 100) * 100


def normalize_code(code: str) -> str:
    return re.sub(r"\s+", " ", code).strip().upper()


def load_csv(path: str) -> list[dict]:
    with open(path, newline="", encoding="utf-8") as f:
        return list(csv.DictReader(f))


def download(path: str) -> None:
    print(f"Downloading catalog CSV from {CSV_URL} ...", file=sys.stderr)
    req = urllib.request.Request(CSV_URL, headers={"User-Agent": "uw-course-finder"})
    with urllib.request.urlopen(req, timeout=120) as r, open(path, "wb") as out:
        out.write(r.read())


def main() -> int:
    ap = argparse.ArgumentParser()
    ap.add_argument("--csv", help="Path to a local uwcourses.csv (skips download)")
    args = ap.parse_args()

    csv_path = args.csv
    if not csv_path:
        csv_path = os.path.join(HERE, "uwcourses.csv")
        if not os.path.exists(csv_path):
            download(csv_path)

    rows = [r for r in load_csv(csv_path) if (r.get("Campus") or "").strip() == CAMPUS]

    # First pass: collect every valid course id so we can keep only prereq edges
    # that point at courses we actually know about.
    by_id: dict[str, dict] = {}
    for r in rows:
        dept = (r.get("Department") or "").strip()
        num = (r.get("Code") or "").strip()
        title = (r.get("Name") or "").strip()
        if not dept or not num or not title:
            continue
        cid = normalize_code(f"{dept} {num}")
        prereqs = [
            normalize_code(p)
            for p in (r.get("Prerequisites") or "").split(",")
            if p.strip()
        ]
        by_id[cid] = {
            "id": cid,
            "dept": dept,
            "num": num,
            "title": title,
            "credits": (r.get("Credits") or "").strip(),
            "prereqs": prereqs,
            "offered": parse_offered((r.get("Offered") or "").strip()),
            "areas": (r.get("Areas of Knowledge") or "").strip(),
            "level": level_of(num),
        }

    known = set(by_id)
    courses = []
    for c in by_id.values():
        c["prereqs"] = [p for p in c["prereqs"] if p in known and p != c["id"]]
        courses.append(c)

    courses.sort(key=lambda c: (c["dept"], c["num"]))

    payload = {
        "generatedAt": datetime.now(timezone.utc).strftime("%Y-%m-%dT%H:%M:%SZ"),
        "campus": CAMPUS,
        "source": CSV_URL,
        "count": len(courses),
        "courses": courses,
    }

    os.makedirs(os.path.dirname(OUT), exist_ok=True)
    with open(OUT, "w", encoding="utf-8") as f:
        json.dump(payload, f, separators=(",", ":"), ensure_ascii=False)

    with_pre = sum(1 for c in courses if c["prereqs"])
    size_kb = os.path.getsize(OUT) / 1024
    print(
        f"Wrote {len(courses)} {CAMPUS} courses ({with_pre} with prerequisites) "
        f"to {os.path.relpath(OUT, ROOT)} ({size_kb:.0f} KB)",
        file=sys.stderr,
    )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
