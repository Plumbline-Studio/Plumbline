---
title: A hospitality catalog staff can run themselves
summary: The main brand's old static site became a 2,400-product catalog and 210-project portfolio on one content system, with copy and imagery the company's own staff now edit.
client: A lighting and furniture manufacturer
client_name: Renaissance Contract Lighting & Furnishings
signoff_by: Kyle Knight, studio decision (no written OK from the company)
signoff_date: 2026-11-15
visibility: public
date: 2026-08-21
role: Lead developer (in-house, as an employee)
stack: Next.js · Sanity · Vercel
reaches: Hotel, restaurant and hospitality designers
order: 21
series: renaissance
thumb: /case-studies/renaissance-hospitality/img/pendants.jpg
thumb_link: https://www.rclfinc.com/
tags: [Next.js, Sanity, Catalog]
source: Facts from the renaissance-hospitality repo (now owned by the company), its handoff notes and the live site, checked November 15, 2026. "Unknown" means none of them shows it.
---

::: plain

## What changed

::: ba

### Before

A static site with no content system and no phone layout. Every product, photo and project lived in hand-edited pages, so a change meant a developer.

### After

A catalog of about 2,400 products across lighting, furniture and fine art, a portfolio of 210 installations, and pages for finishes, process and resources. Staff edit everything in a Studio at the site's own address, and the old domain redirects to the new one.

:::

## What the company got

- Products and projects they can add and change themselves.
- A portfolio that only shows a project once it is ready: staged on purpose, with a hero image.
- Photos upscaled and cleaned up inside the Studio, with one-click undo.
- A 13-page staff handbook, and the code, hosting and content system in their own accounts.

:::

::: technical

## What I built

- **A Next.js 16 site:** home, portfolio and project pages, about 30 product category routes, finishes, process, resources, a shade replacement program and a printable share page. The live sitemap lists 2,640 URLs.
- **The shared content model** that both brands' sites read (see the content system case study).
- **Portfolio visibility as data:** a stage field (none, portfolio, showcased) and a required hero image decide what is public, instead of a person remembering to hide things.
- **AI image tools inside the Studio:** upscaling and background removal on drafts, with undo.
- **AI-written copy with rules:** anything Claude drafts must avoid specifics anyone could dispute, and its commit says it was AI-written.
- **Pages revalidate every 60 seconds,** so edits show without a rebuild.
- **An architecture review** that weighed moving off Vercel and chose to stay.

## What was left

At the August 21 handover these were still open: the intake folder watcher (built, not scheduled), a staff retest of the image button, domain registrar recovery and password rotation, and moving the image-processing account to the company.

## By the numbers

::: facts
- 323 | commits, March 30 to August 21, 2026
- 2,640 | URLs in the live sitemap
- 210 | installation pages in the live sitemap
- 9 | merged pull requests (most work went straight to main)
- 0 | automated tests in the site code
- Unknown | exact go-live date (first production deploy April 24)
:::

::: note
Claude co-authored most of these commits; the history shows it on 231 of them. The company's staff curated and reviewed the content.
:::

:::

## The blueprint

No blueprint: this work predates them. The handover notes record what was finished and what was left, above.

## What it looks like

![A product category](/case-studies/renaissance-hospitality/img/pendants.jpg "A category page: pendants, under ceiling fixtures.") -> https://www.rclfinc.com/

![Finishes](/case-studies/renaissance-hospitality/img/finishes.jpg "The finishes library: powder coats, leafing and decorative acrylics.") -> https://www.rclfinc.com/
