---
title: Two websites and one content system for a lighting and furniture maker
summary: A Roanoke manufacturer with two brands, hotel lighting and outdoor site furniture, moved from old static sites to two catalogs fed by one content system its own staff run.
client: A lighting and furniture manufacturer
client_name: Renaissance Contract Lighting & Furnishings
signoff_by: Kyle Knight, studio decision (no written OK from the company)
signoff_date: 2026-11-15
visibility: public
date: 2026-08-21
role: Lead developer (in-house, as an employee)
stack: Next.js · Sanity · Vercel
reaches: Hotel and restaurant designers, landscape architects, public agencies, and the company's own staff
order: 0.8
thumb: /case-studies/renaissance/img/hospitality-home.jpg
thumb_link: https://www.rclfinc.com/
tags: [Next.js, Sanity, Catalog, Content system]
source: Facts from the two website repos (now owned by the company), their live sites and my design notes, checked November 15, 2026. "Unknown" means none of them shows it. Product pages shown; pages naming the client's customers are left out.
---

::: plain

## What this is

Renaissance makes lighting, furniture and finishes for hotels, restaurants and public spaces, all in its own shop in Roanoke, Virginia, and sells outdoor site furniture under a second brand. Both brands ran on old static websites with no way for staff to change a product without a developer.

I did this work as a Renaissance employee, not as a Plumbline client engagement. Between March and August 2026 I rebuilt both sites and the system behind them. Then I handed the whole thing over: the code, the hosting and the content system now belong to the company, with a staff handbook.

## The three parts in this series

- **The hospitality site:** the main brand's catalog and portfolio, about 2,400 product pages.
- **The site furnishings site:** 262 outdoor models in 13 categories, each with a spec sheet built on request.
- **The content system:** one Studio that feeds both sites, with the tools staff use to bring products and photos in.

:::

::: technical

## How the parts connect

Both sites are Next.js apps on Vercel. They read from one Sanity project. The schemas, the Studio and every migration script live in the hospitality repo; the site furnishings repo only reads. A product is one record tagged with the brand or brands it belongs to, so a bench sold under both brands is edited once.

## By the numbers

::: facts
- 2 | websites live on the company's own domains
- 351 | commits across both repos, March to August 2026
- 25 | content types in one shared Studio
- ~2,400 | hospitality product pages
- 262 | outdoor models, all 219 legacy products carried over
- 0 | tests in the website code (one offline script)
:::

::: note
These sites were built before I wrote blueprints for my work, so there is no agreed list of done conditions to show. The handover on August 21 recorded what was finished and what was left; each part lists what was left.
:::

:::

## The blueprint

No blueprint. This work predates them: my first blueprint was written on August 27, 2026, a week after this handover.

## What it looks like

![The hospitality site](/case-studies/renaissance/img/hospitality-home.jpg "The hospitality site's home page.") -> https://www.rclfinc.com/

![The site furnishings site](/case-studies/renaissance/img/site-furnishings-home.jpg "The site furnishings site's home page.") -> https://www.rclfsitefurnishings.com/
