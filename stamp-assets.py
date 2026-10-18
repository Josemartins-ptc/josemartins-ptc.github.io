#!/usr/bin/env python3
"""Add a content fingerprint (?v=...) to every local CSS and JS link in the site's pages.

Browsers keep GitHub Pages files for 10 minutes; a changed file gets a new link, so visitors
never mix a new page with an old stylesheet or script. Run before every commit that changes
CSS or JS.
"""
import hashlib
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent
LINK = re.compile(r'((?:href|src)=")([^":?#]+\.(?:css|js))(?:\?v=[0-9a-f]+)?(")')


def stamp(page):
    def fingerprint(match):
        asset = (page.parent / match.group(2)).resolve()
        if not asset.is_file():
            return match.group(0)
        digest = hashlib.sha256(asset.read_bytes()).hexdigest()[:10]
        return f"{match.group(1)}{match.group(2)}?v={digest}{match.group(3)}"

    text = page.read_text()
    page.write_text(LINK.sub(fingerprint, text))


for page in sorted(ROOT.rglob("*.html")):
    if ".git" not in page.parts:
        stamp(page)
