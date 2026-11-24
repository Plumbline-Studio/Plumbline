#!/usr/bin/env python3
"""Share pictures (1200x630) for /resources: the list page, and one per article.

    python3 scripts/resources-og.py

Needs Pillow. Fonts (Playfair Display, Inter, JetBrains Mono, the site's own) are fetched once
from Google Fonts into ~/.cache/plumbline-fonts. Writes:
  storefront/og/resources.png              the list page's picture
  storefront/og/resources/<slug>.png       one per article in storefront/content/resources
Then set `og: /og/resources/<slug>.png` in the article's front matter and run
`node scripts/build-resources.mjs`. Same look as og/plumbline-studio-eos.png: plum ground,
brass plumb line, the title in Playfair. Run by hand when an article is added; CI does not run it.
"""

from __future__ import annotations

import re
import sys
import urllib.request
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
SITE = ROOT / "storefront"
CACHE = Path.home() / ".cache" / "plumbline-fonts"
CSS = (
    "https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500"
    "&family=JetBrains+Mono:wght@400&family=Inter:wght@400;500"
)

PLUM, PLUM_DEEP, INK, MUTED, BRASS, LINE, PAPER = (
    "#2c1f33", "#241a2a", "#f2ece2", "#9ba5b4", "#c8a878", "#54435d", "#f4e3da",
)
W, H = 1200, 630


def fonts() -> dict[str, Path]:
    CACHE.mkdir(parents=True, exist_ok=True)
    # name -> (folder in the Google Fonts URL, style, weight)
    want = {"display": ("playfairdisplay", "normal", "500"), "body": ("inter", "normal", "400"),
            "body500": ("inter", "normal", "500"), "mono": ("jetbrainsmono", "normal", "400")}
    found = {k: CACHE / f"{k}.ttf" for k in want}
    if all(p.exists() for p in found.values()):
        return found
    css = urllib.request.urlopen(CSS).read().decode()
    for block in re.findall(r"@font-face\s*{([^}]*)}", css):
        url = re.search(r"url\((https://fonts\.gstatic\.com/s/(\w+)/[^)]+\.ttf)\)", block)
        style = re.search(r"font-style:\s*(\w+)", block)
        weight = re.search(r"font-weight:\s*(\d+)", block)
        if not (url and style and weight):
            continue
        got = (url.group(2), style.group(1), weight.group(1))
        for name, spec in want.items():
            if spec == got and not found[name].exists():
                found[name].write_bytes(urllib.request.urlopen(url.group(1)).read())
    missing = [k for k, p in found.items() if not p.exists()]
    if missing:
        sys.exit(f"resources-og: could not fetch fonts: {', '.join(missing)}")
    return found


def front_matter(text: str) -> dict[str, str]:
    m = re.match(r"^---\n(.*?)\n---", text, re.S)
    out: dict[str, str] = {}
    for line in (m.group(1).splitlines() if m else []):
        kv = re.match(r"^([a-z_]+):\s*(.*)$", line)
        if kv:
            out[kv.group(1)] = kv.group(2).strip().strip("'\"")
    return out


def wrap(d: ImageDraw.ImageDraw, text: str, font: ImageFont.FreeTypeFont, width: int) -> list[str]:
    """Words onto lines no wider than `width` pixels."""
    lines: list[str] = []
    for word in text.split():
        if lines and d.textlength(f"{lines[-1]} {word}", font=font) <= width:
            lines[-1] = f"{lines[-1]} {word}"
        else:
            lines.append(word)
    return lines


def card(path: Path, eyebrow: str, title: str, sub: str, f: dict[str, Path]) -> None:
    img = Image.new("RGB", (W, H), PLUM)
    d = ImageDraw.Draw(img)
    # paper band on the right, like the site's main share picture
    d.rectangle([900, 0, W, H], fill=PAPER)
    d.rectangle([940, 70, 1140, 560], outline="#e0cbbf", width=2, fill="#fff6ef")
    # a plumb line and bob inside the paper card
    d.line([1040, 110, 1040, 430], fill=BRASS, width=3)
    d.polygon([(1040, 430), (1062, 462), (1040, 494), (1018, 462)], fill=BRASS)
    small = ImageFont.truetype(str(f["mono"]), 20)
    d.text((955, 520), "BUILD IT TRUE", font=small, fill="#7d6334")

    d.text((80, 58), "PLUMBLINE", font=ImageFont.truetype(str(f["body500"]), 22), fill=INK, spacing=4)
    d.text((222, 58), "STUDIO", font=ImageFont.truetype(str(f["body500"]), 22), fill=BRASS)
    d.line([80, 100, 900, 100], fill=LINE, width=2)
    d.line([88, 100, 88, 250], fill=BRASS, width=2)
    d.polygon([(88, 252), (100, 264), (88, 276), (76, 264)], fill=BRASS)

    d.text((125, 160), eyebrow.upper(), font=ImageFont.truetype(str(f["mono"]), 22), fill=BRASS)
    size = 76 if len(title) <= 28 else 62 if len(title) <= 44 else 52
    tf = ImageFont.truetype(str(f["display"]), size)
    lines = wrap(d, title, tf, 740)[:3]
    y = 205
    for ln in lines:
        d.text((125, y), ln, font=tf, fill=INK)
        y += int(size * 1.18)
    sf = ImageFont.truetype(str(f["body"]), 27)
    y += 14
    for ln in wrap(d, sub, sf, 700)[:2]:
        d.text((125, y), ln, font=sf, fill=MUTED)
        y += 38
    d.text((80, 552), "plumblinestudio.dev/resources", font=ImageFont.truetype(str(f["mono"]), 20), fill=MUTED)
    path.parent.mkdir(parents=True, exist_ok=True)
    img.save(path, optimize=True)
    print(f"wrote {path.relative_to(ROOT)}")


def main() -> None:
    f = fonts()
    card(SITE / "og" / "resources.png", "Resources", "How we build it true",
         "Short articles, each with an example you can run.", f)
    for md in sorted((SITE / "content" / "resources").glob("*.md")):
        fm = front_matter(md.read_text())
        card(SITE / "og" / "resources" / f"{md.stem}.png", "Resources", fm.get("title", md.stem),
             fm.get("summary", "")[:110], f)


if __name__ == "__main__":
    main()
