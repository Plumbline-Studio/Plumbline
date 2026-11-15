---
title: A storefront that sorts the work first
summary: A one-person metal and wood shop gets three clear doors for the work it wants, one intake that asks the right questions, and a portfolio of every finished piece.
client: A custom metal and wood shop
visibility: public
date: 2026-10-02
role: Builder and studio partner
stack: Next.js · Supabase · Google Drive
reaches: The owner, and buyers looking for custom work
order: 1
thumb: /case-studies/maker-storefront/img/home.jpg
tags: [Next.js, Storefront, Intake]
source: Facts from the project repo, its pull requests, the Linear project and the blueprint, checked November 15, 2026. "Unknown" means none of them shows it. Screenshots are of the live site, with the owner's name, the shop's name and logo, and the town blurred.
---

::: plain

## What changed

::: ba

### Before

A skilled maker with a body of finished work, and no clear way for the right buyers to find it or to ask for a job. A review in August named the problem: the people who needed his work could not see it.

### After

The site has three doors, one for each kind of work the shop wants: trade fabrication, hearth and architectural metalwork, and outdoor cooking. Each door says plainly what comes through it and what doesn't. One intake asks what a buyer wants made and how to reach them, nothing more required. A portfolio shows 43 finished pieces, each with its own page, and any piece can start a project.

:::

## What the client got

- A site that turns away the wrong work before it costs him an hour.
- No published prices or lead times, on purpose. Every job is quoted after a design review.
- A structured record of every inquiry, with photos and files filed for him.
- One referral ask after each inquiry, and nothing pushy.

:::

::: technical

## What I built

- A Next.js storefront with three offer doors over one qualifying intake. Every screen has to answer one of three questions: what work belongs here, what proof makes this buyer trust the maker, and what lets us decide quickly whether the job is worth his time. That is why there is no About page and no services grid.
- An intake that writes a structured project record to the shop's own database. Every table has row-level security forced on with no public policies; all reads go through the server.
- File uploads relayed through the app into the shop's Google Drive, so a buyer's photos never sit in a public bucket.
- Passwordless email sign-in, so a buyer and the maker can both see the same project. Customer emails go out only when the maker chooses to send one.
- A 43-piece portfolio with a page per piece, and a "start a project from this piece" path.
- Structured business data and an `llms.txt`, so search engines and AI assistants can read what the shop does and doesn't do.
- Guards that fail the build rather than ship a mistake, like a placeholder contact address on an indexable site.
- A pull-request gate that runs typecheck, lint, tests and build, plus weekly dependency updates.

## Connects to

- Supabase (the shop's own project)
- Google Drive (buyer uploads)
- Resend (email from the shop's own domain)
- Vercel (hosting)

## By the numbers

::: facts
- 43 | finished pieces, one page each
- 3 | offer doors over one intake
- 163 | tests in the repo
- 48 | pull requests
- 0 | published prices or lead times, by design
- Unknown | inquiries since launch
:::

::: note
This is a pilot, and the blueprint below says so honestly: the site is live, but the proof that it brings in work week after week is still open. The brand work was parked by choice so the site could carry the engagement first.
:::

:::

## The blueprint

After the first version went up, the owner and I agreed in writing what "done" would mean: a short list of conditions, each one either true or not. This is that list as of November 15, 2026. What is still open is shown as open, and what was set aside on purpose is shown as parked. Agreed October 12, 2026.

::: blueprint
- met | Nov 1, 2026 | The site carries one intake path and one referral ask. |
- met | Oct 6, 2026 | A portfolio of the owner's work is live, one page per piece. | 43 pieces.
- met | Oct 26, 2026 | One buyer type is chosen for the first outreach push. | Interior designers and custom home builders nearby.
- met | Oct 26, 2026 | A first list of 10 named targets for that buyer type. | Drafts only. Nothing has been sent.
- met | Oct 6, 2026 | An architecture note lists every layer and connection, who owns it, and where its secret is kept. |
- met | Oct 8, 2026 | A README a newcomer can run from, and a handoff note kept current. |
- met | Nov 1, 2026 | Every pull request runs typecheck, lint, tests and build, and posts the result. |
- open | | A site in the chosen brand is live on a domain the owner controls. | The site is live on his domain; the brand it waits for is parked.
- open | | The pilot's terms are written down: what I earn, and when. |
- open | | A test inquiry reaches the owner the same day and lands in the shared record, with no one relaying it. |
- open | | Local and AI-search discoverability is verified, ending with a cold search that finds the shop. | The structured data is live. A cold search on November 5 did not find the shop yet.
- open | | Four weeks in a row each bring at least one new inquiry through the site. |
- open | | A preview for every pull request, production changes only by merge, and a rollback tried once. |
- open | | Uptime checks, error tracking and automated dependency updates. | Dependency updates run weekly. The rest is open.
- open | | Clean: no dead branches, no stray TODOs, no secrets in code. |
- parked | Oct 13, 2026 | At least 15 hand-drawn marks are photographed and filed. | The brand track was parked so the site could carry the engagement.
- parked | Oct 13, 2026 | Three brand systems are assembled from those sketches. |
- parked | Oct 13, 2026 | The owner picks one in a sit-down and gets the final files. |
- parked | Oct 13, 2026 | The brand is locked as a versioned brand file with a guide. |
- parked | Nov 4, 2026 | A per-inquiry Trade Sheet with a PDF export, styled the way the owner chooses. | Parked to put leads first.
:::

Ruled out before the build:

- An online shop, inventory or a fixed pricing engine.
- A public lead-time calculator.
- Large CRM automation.
- A finished brand system as a dependency for the site.
- Marketing one product line the owner asked never to market.

## What it looks like

![The home page](/case-studies/maker-storefront/img/home.jpg "The home page: the work first, and two ways in.")

![One of the three offer doors](/case-studies/maker-storefront/img/trade.jpg "An offer door says what comes through it, and what doesn't.")

![The portfolio](/case-studies/maker-storefront/img/work.jpg "The portfolio: 43 finished pieces, filtered by kind.")

![One piece's page](/case-studies/maker-storefront/img/piece.jpg "Each piece has its own page and can start a project.")

![The intake](/case-studies/maker-storefront/img/inquire.jpg "The intake: two things required, the rest helpful if you have it.")

![The home page on a phone](/case-studies/maker-storefront/img/phone-home.jpg "The same page on a phone.")

## The paperwork

This case study as a branded summary, to keep or pass along.

::: docs
- Case study summary | maker-storefront-summary.pdf | Both versions of this page, the blueprint and the screenshots, as one document to share. | Nov 2026 · 8 pages
:::
