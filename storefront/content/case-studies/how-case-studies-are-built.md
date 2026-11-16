---
title: How these case studies are built
summary: The section you are reading, as a case study of its own. Each case study is one Markdown file, a small build turns it into a page, and the build refuses anything that would name a client without sign-off.
client: Plumbline Studio (my own studio)
visibility: unlisted
date: 2026-11-15
role: Founder and builder, with AI agents
stack: Node.js · Markdown · GitHub Actions
reaches: Anyone with the link; this page is unlisted
order: 99
tags: [Node.js, Static site, Content model]
source: Facts from the public Plumbline site repo (docs/case-studies.md, scripts/build-case-studies.mjs and its commit history) and this section's blueprint, checked November 16, 2026. "Unknown" means none of them shows it.
---

::: plain

## What changed

::: ba

### Before

The site had no place to show finished work. Real client work can't simply be put online: the client hasn't agreed to be named, and screenshots carry their logo, their people and their data.

### After

Each case study is one plain text file. A small program turns it into a page with two versions: one for owners, one for builders. It refuses to build a page that names a client unless the file records who at the client agreed, and when. A case study is either public (listed everywhere) or unlisted (it opens by link, like this one, and is listed nowhere). There is no third, hidden state: anything not ready stays in a private folder, off the site.

:::

## What it gives the studio

- Proof of work that is safe to show from day one, because every case study is anonymized until the client signs off.
- Every fact traced to a source, and "Unknown" shown where the source is silent.
- One file to change, not a page to rebuild by hand.
- Publishing stays a person's decision. A change that makes a case study public, or names a client, is a change I make or approve.

:::

::: technical

## What I built

- **A content contract** (`docs/case-studies.md`): flat front matter, two visibility states, the sign-off fields, and a fixed set of fenced blocks: `plain`, `technical`, before/after, facts, notes, the blueprint and the paperwork.
- **A build with no dependencies** (`scripts/build-case-studies.mjs`, about 420 lines of Node). It writes the list page, one page per case study, and the generated blocks in the home page, `sitemap.xml` and `llms.txt`, between markers, touching nothing else.
- **Committed output, checked in CI.** The generated HTML is committed, so the deploy has no build step. CI runs the build with `--check` and fails if any page is out of date.
- **Shared tokens.** Every colour and font on these pages comes from one stylesheet, so a palette change reaches them without editing a case study.

## What the build refuses

- A visibility other than `public` or `unlisted`.
- A `client_name` without `signoff_by` and `signoff_date`.
- A blueprint line that isn't met, open or parked.
- A document card whose PDF or cover image is missing.
- A series that chains, names a case study that doesn't exist, or puts a public part under an unlisted umbrella.
- A generated folder left behind after its case study's file is removed. Removing the file withdraws the case study, screenshots included.

An unlisted page gets `noindex` and is left out of the list, the home page, the sitemap and `llms.txt`. A slug with no file answers 404.

## Working files

Each case study has a private Drive folder named by its slug, with the published and original screenshots, its sources and a sign-off folder. Each folder is registered in the studio's documents table, so a future Factory module can find it by slug.

## By the numbers

::: facts
- 2 | visibility states, and no hidden one
- 15 | public case studies when this was written
- 0 | dependencies in the build
- 8 of 10 | blueprint conditions met
:::

::: note
This page exists to prove one of those conditions: that an unlisted case study answers by link and is listed nowhere. The site's code and pages were written with AI coding agents working under my review.
:::

:::

## The blueprint

This section's blueprint was written on November 15, 2026 and agreed on November 16. Eight of its ten conditions are met.

::: blueprint
- met | Nov 15, 2026 | The list shows every public case study and nothing else, and the home page draws from the same list.
- open | | An unlisted case study opens by link and is listed nowhere; a slug with no case study answers 404. | This page is the proof. It is met once this page is live and checked.
- met | Nov 15, 2026 | Every page has a plain-language and a technical version with a switch, and works at phone width.
- met | Nov 15, 2026 | A client is named only when sign-off is recorded; CI fails otherwise.
- met | Nov 15, 2026 | The first three case studies are live, anonymized, with every fact traced or marked unknown.
- met | Nov 16, 2026 | Every colour and font comes from one shared stylesheet. | Only the browser's theme colour stays fixed, set aside on purpose.
- met | Nov 15, 2026 | The content contract is written down in the site repo.
- open | | A Factory module sets visibility and sign-off, and my Publish tap opens the change for review; no AI worker can publish. | Not built yet.
- met | Nov 15, 2026 | Every case study has its own private working folder, registered by slug.
- met | Nov 15, 2026 | Each case study shows its paperwork: the client's documents truly redacted, or a branded summary made from the page.
:::
