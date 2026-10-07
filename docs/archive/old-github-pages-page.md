# The old GitHub Pages page (retired)

Kyle, 2026-10-06, on the Blueprint Board: "Retire it. Save anything that you think should be incorporated." Tracked in PLU-386.

## What it was

GitHub Pages published the repo root at **plumbline.toolwright.dev** (`CNAME`). It was the first Plumbline page, "Plumbline — Tools built true", written before the storefront at plumblinestudio.dev existed. Nothing linked to it from the storefront, and nothing watched it.

The last commit that held every file is **08e4cffdaa094fdae22367d44961b17d3e4c79e8**. To get any of it back: `git show 08e4cff:<path>` (for example `git show 08e4cff:card/index.html`).

| Path | What it was |
| -- | -- |
| `index.html` | The portfolio page: "An evergreen studio building tools that rebalance unfair equations", four delivery models, and a project grid that named client and venture projects, each opening a preview deploy. |
| `card/` | A digital business card: photo, "Book a call", "Save contact", phone, kyle@toolwright.dev, LinkedIn, the Toolwright free-logo offer, a QR code to itself, and `regen_qr.py` to redraw that QR for a new URL. |
| `sw.js`, `manifest.webmanifest`, `icons/`, `.nojekyll` | Made the page an installable, offline-capable PWA on GitHub Pages. |
| `shots/` | Screenshots for the project grid. |
| `CNAME` | Bound Pages to plumbline.toolwright.dev. |

`signature/` (Kyle's email signature source) was in the root too. It is not part of the page and stays.

## Worth carrying over (proposals for Kyle; nothing here is on the live site)

1. **The business card.** It is the one piece with a job the storefront does not do: a page to hand over in person, with Save contact. If any printed card, slide or QR points at plumbline.toolwright.dev/card/, those links break once Pages is off. Proposal: rebuild it at plumblinestudio.dev/card/ from the brand 1.1.0 tokens (the old card uses the retired Fraunces / IBM Plex type and navy palette), with the storefront's booking link and kyle@plumblinestudio.dev. That is a visitor-visible page, so it is Kyle's call.
2. **The "capable but constrained" line.** "Software for the capable but constrained: people who are good at what they do and held back by something they didn't choose." It is the clearest statement of who Plumbline is for in either page. The storefront's voice is now "the heavy lifting"; whether this line belongs anywhere (the About block, llms.txt) is a copy decision for Kyle.
3. **The project grid.** Do not carry it over as it was. It named clients, and the storefront deliberately keeps case studies anonymous until each client signs off (Inbound Engine condition 5 covers the published proof pieces).

Not carried over: the four delivery models (commissioned, owned, operated, stewardship), which predate the one-offer storefront, and the PWA plumbing.

## After the page is off

Browsers that visited the old page may still hold its service worker. The next time such a browser checks `sw.js` and gets a 404, it unregisters the worker, so the cached copy stops being served without anyone doing anything.
