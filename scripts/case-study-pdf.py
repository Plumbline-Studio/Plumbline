"""Branded summary PDF for a case study, made from its Markdown (the page and the PDF never drift).

usage (from the plumbline-pdf-toolkit repo root, its requirements installed):
  python ../plumbline/scripts/case-study-pdf.py <slug> [<slug> ...]

Writes storefront/case-studies/<slug>/docs/<slug>-summary.pdf, its cover image (.jpg), and a
contact sheet in /tmp for review. Only for case studies whose paperwork is ours to make (the
client's own documents are redacted copies, not rebuilt). Uses the same anonymized text and
blurred screenshots as the page, so it is as safe to publish as the page is.
"""
import re
import sys
from pathlib import Path

from plumbline_pdf import BrandedDocument, Cover
from reportlab.lib.units import inch
from reportlab.platypus import Image, KeepTogether, Spacer

ROOT = Path(__file__).resolve().parents[1]
CONTENT = ROOT / "storefront/content/case-studies"
SITE = ROOT / "storefront"


def front_matter(md):
    m = re.match(r"^---\n(.*?)\n---\n(.*)$", md, re.S)
    fm = {}
    for line in m.group(1).splitlines():
        k, _, v = line.partition(":")
        fm[k.strip()] = v.strip()
    return fm, m.group(2)


def inline(s):
    s = s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")
    s = re.sub(r"\*\*([^*]+)\*\*", r"<b>\1</b>", s)
    s = re.sub(r"`([^`]+)`", r"\1", s)
    return re.sub(r"\[([^\]]+)\]\([^)]+\)", r"\1", s)


def sections(body):
    """Split into the plain version, the technical version, and what follows them (screenshots)."""
    blocks = {"plain": [], "technical": [], "after": []}
    cur, depth = "after", 0
    for line in body.splitlines():
        t = line.strip()
        if t == "## The paperwork":  # the documents list itself is not repeated inside a document
            break
        m = re.match(r"^:::\s*(\w+)$", t)
        if m:
            depth += 1
            if m.group(1) in ("plain", "technical"):
                cur = m.group(1)
                continue
        elif t == ":::":
            depth -= 1
            if depth == 0:
                cur = "after"
                continue
        blocks[cur].append(line)
    return blocks


def emit(doc, lines, slug):
    para, items, fence, ba = [], [], [], []

    def flush():
        nonlocal para, items
        if para:
            doc.p(inline(" ".join(para)))
            para = []
        if items:
            if fence and fence[-1] == "facts":
                rows = [["", ""]] + [[inline(i.split("|")[0].strip()), inline(i.split("|", 1)[1].strip())] for i in items]
                doc.table(rows[1:], [0.28, 0.72], header=False)
            else:
                doc.bullets([inline(i) for i in items])
            items = []

    for line in lines:
        t = line.strip()
        m = re.match(r"^:::\s*(\w+)$", t)
        if m:
            flush(); fence.append(m.group(1))
            if m.group(1) == "note": doc.keep_space(1.3 * inch)  # never split the credit note across pages
            continue
        if t == ":::":
            flush()
            kind = fence.pop()
            if kind == "ba":
                doc.labeled([(k.upper(), " ".join(v)) for k, v in ba]); ba.clear()
            continue
        if not t:
            if fence and fence[-1] == "ba": continue
            flush(); continue
        if fence and fence[-1] == "ba":
            if t.startswith("### "): ba.append((t[4:], []))
            else: ba[-1][1].append(inline(t))
            continue
        if fence and fence[-1] == "note" and not t.startswith("-"):
            doc.callout(inline(t)); continue
        if t.startswith("## "):
            flush(); doc.h2(inline(t[3:])); continue
        if t.startswith("### "):
            flush(); doc.h3(inline(t[4:])); continue
        img = re.match(r'^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$', t)
        if img:
            flush()
            path = SITE / img.group(2).lstrip("/")
            pic = Image(str(path)); w = 6.0 * inch; h = w * pic.imageHeight / pic.imageWidth
            if h > 3.6 * inch: h = 3.6 * inch; w = h * pic.imageWidth / pic.imageHeight
            pic.drawWidth, pic.drawHeight = w, h
            parts = [pic]
            if img.group(3):
                doc.p(inline(img.group(3)), small=True); parts.append(doc._story.pop())
            doc._story.append(KeepTogether(parts + [Spacer(1, 10)]))
            continue
        if t.startswith("- "):
            if para: doc.p(inline(" ".join(para))); para = []
            items.append(t[2:]); continue
        para.append(t)
    flush()


def build(slug):
    fm, body = front_matter((CONTENT / f"{slug}.md").read_text())
    out_dir = SITE / "case-studies" / slug / "docs"
    out_dir.mkdir(parents=True, exist_ok=True)
    out = out_dir / f"{slug}-summary.pdf"
    when = fm["date"]
    doc = BrandedDocument(out, brand="plumbline", title=fm["title"], running_head=f"Case study · {fm['client']}")
    doc.cover(Cover(kicker="CASE STUDY", title=fm["title"], subtitle=fm["summary"],
                    lede=f"{fm['client']} · {fm['role']} · {fm['stack']}",
                    byline=f"Kyle Knight · Plumbline Studio · landed {when}"))
    b = sections(body)
    doc.h1("The short version", kicker="FOR OWNERS")
    emit(doc, b["plain"], slug)
    doc.page_break()
    doc.h1("How it was built", kicker="FOR TECHNICAL READERS")
    emit(doc, b["technical"], slug)
    if any(l.strip() for l in b["after"]):
        doc.keep_space(4.5 * inch)
        emit(doc, b["after"], slug)
    doc.p(inline(fm.get("source", "")), small=True)
    report = doc.build(contact_sheet=f"/tmp/{slug}-summary-sheet.png")
    import pymupdf as fitz
    fitz.open(out)[0].get_pixmap(dpi=60).save(out_dir / f"{slug}-summary.jpg", jpg_quality=78)
    print(slug, report.pages, "pages;", report.warnings or "no warnings")


if __name__ == "__main__":
    for s in sys.argv[1:]:
        build(s)
