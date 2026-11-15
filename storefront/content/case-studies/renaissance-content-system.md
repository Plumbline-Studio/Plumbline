---
title: One content Studio for two brands
summary: One Sanity Studio feeds both websites. Each product is one record tagged with its brands, and staff bring photos and drawings in through a queue that a person files.
client: A lighting and furniture manufacturer
client_name: Renaissance Contract Lighting & Furnishings
signoff_by: Kyle Knight, studio decision (no written OK from the client)
signoff_date: 2026-11-15
visibility: public
date: 2026-08-21
role: Lead developer
stack: Sanity · TypeScript · Node scripts
reaches: The company's own staff
order: 23
series: renaissance
thumb: /case-studies/renaissance-content-system/img/content-model.jpg
tags: [Sanity, Content modeling, Migration]
source: Facts from the content schemas, migration scripts and design notes in the renaissance-hospitality repo (now owned by the client), checked November 15, 2026. The diagram is drawn from the schema files. Screenshots of the Studio itself are to come; it sits behind the client's login.
---

::: plain

## What changed

::: ba

### Before

Two brands, two old sites, and the same products typed into both. Photos lived in folders, matched to projects by memory.

### After

One Studio holds every product, finish, project and page for both brands. A product sold under both is edited once. Staff drop new photos and drawings into a queue that matches them to products by number, and nothing goes live until a person files it.

:::

## What the client got

- One place to edit both websites.
- Photos and drawings that arrive matched, and wait for a person.
- Old content moved in by scripts they can rerun safely.

:::

::: technical

## What I built

- **A content model of 25 document types and 6 object types,** with a single shared `item` type tagged by brand and fields shown per brand.
- **Schemas, the Studio and migrations in one repo;** the second site only reads, with types generated from the same schema.
- **A decision about roles:** Sanity is the websites' read layer, and editors own copy and imagery fields. Operational data does not live in it.
- **Migration scripts** that dry-run by default, are safe to run twice (fixed record IDs) and are rate-limited, with about 90 dated scripts for later fixes.
- **An intake queue** for images, drawing PDFs and sales-order PDFs, matched by product number and filed by a person.
- **Photo matching against the old site's image list:** 99.7% matched, against 21% by filename; 536 photos were assigned through a review tool.

## By the numbers

::: facts
- 25 | document types
- 1 | product record for an item sold under both brands
- 99.7% | old photos matched to the right project
- 536 | photos assigned through the review tool
- ~90 | dated migration scripts
- Unknown | how often staff use the intake queue today
:::

:::

## The blueprint

No blueprint: this work predates them.

## What it looks like

![The content model](/case-studies/renaissance-content-system/img/content-model.jpg "One Studio, two websites: what each site reads, and how content gets in. Drawn from the schema files.")
