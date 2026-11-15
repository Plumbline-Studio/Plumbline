---
title: An outdoor furniture catalog built for specifiers
summary: A FrontPage-era site became a 262-model catalog for landscape architects and public agencies, with a spec sheet for every product built on request.
client: A lighting and furniture manufacturer
client_name: Renaissance Contract Lighting & Furnishings
signoff_by: Kyle Knight, studio decision (no written OK from the company)
signoff_date: 2026-11-15
visibility: public
date: 2026-06-25
role: Lead developer (in-house, as an employee)
stack: Next.js · Sanity · pdf-lib
reaches: Landscape architects, public agencies and dealers
order: 22
series: renaissance
thumb: /case-studies/renaissance-site-furnishings/img/products.jpg
tags: [Next.js, Sanity, PDF]
source: Facts from the renaissance-site-furnishings repo (now owned by the company), the shared content schemas and the live site, checked November 15, 2026. "Unknown" means none of them shows it.
---

::: plain

## What changed

::: ba

### Before

An old FrontPage site of flat pages. Products had no data behind them, and every installation was its own hand-made page.

### After

A catalog of 262 models in 13 categories, 34 standard finishes, a compliance page for public buyers, a path for dealers, and a quote form. Every product page offers a spec sheet that combines a generated summary with the product's drawings into one PDF. Old links redirect to their new pages.

:::

## What the company got

- A catalog a landscape architect can specify from without a phone call.
- One spec-sheet PDF per product, always current.
- Products shared with the hospitality brand edited once, in one place.

:::

::: technical

## What I built

- **A Next.js 16 catalog** reading the shared Sanity project by brand, with category pages, product pages, finishes, compliance, dealers, contact and header search.
- **The migration:** all 219 legacy products, plus categories, collections, 34 finishes, 289 PDFs and 224 images, moved in with zero hard errors. Today 262 models are live.
- **Spec sheets on request:** an API route builds one PDF from a generated spec page and the product's drawing PDFs.
- **AI-written descriptions, then audited:** Claude drafted product descriptions; an audit of 216 of them flagged 146 sentences, 23 high risk, and unsupported "recycled content" claims were removed.
- **Pages revalidate every 60 seconds,** because without it the catalog counts went stale after publishing.
- **Legacy URLs redirect** to their new pages.

## What was left

- No analytics, error tracking or spam challenge on the live site.
- The quote form sends email only if two settings are configured in production; whether they are is unknown.
- A resources page and a public-agencies page were deferred, and a few dozen products launched without drawings.
- The designs for an AI spec parser, an architect portal and a 3D configurator were never built. Drawing PDFs shipped instead.

## By the numbers

::: facts
- 262 | models live, in 13 categories
- 219 of 219 | legacy products carried over
- 34 | powder-coat finishes
- 28 | commits, May 8 to August 19, 2026
- June 25, 2026 | live on the company's domain
- 0 | automated tests
:::

:::

## The blueprint

No blueprint: this work predates them. A June 17 audit and its launch plan set the remaining work, and the list above is what was still open at handover.

## What it looks like

![The catalog](/case-studies/renaissance-site-furnishings/img/products.jpg "The catalog: 13 categories, each with its model count.")

![A product page](/case-studies/renaissance-site-furnishings/img/bench.jpg "A product page, with its spec sheet and a quote request.")

![A generated spec sheet](/case-studies/renaissance-site-furnishings/img/spec-sheet.jpg "The spec sheet, built on request from the product's record.")

![Finishes](/case-studies/renaissance-site-furnishings/img/finishes.jpg "The standard powder-coat palette.")

![On a phone](/case-studies/renaissance-site-furnishings/img/phone.jpg "The product page on a phone.")
