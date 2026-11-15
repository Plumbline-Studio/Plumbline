---
title: A lead-time clock that waits for the customer
summary: A fabricator's due dates started the day a deposit cleared, before anyone knew what was ordered or where it shipped. Now customers confirm their order through a private link, and the clock starts then.
client: A commercial fabricator
visibility: public
date: 2026-09-09
role: Builder (sole developer)
stack: Static site · Vercel functions · Google Sheets + Drive · SendGrid
reaches: The fabricator's customers and production team
order: 0
thumb: /case-studies/fabricator-order-portal/img/waiting.jpg
tags: [Customer portal, Google Sheets, AppSheet]
source: Facts from the project repo, its pull requests, the Linear project and the blueprint, checked November 15, 2026. "Unknown" means none of them shows it. Screenshots show the real portal page with a fake order, with the client's name, logo and contact details blurred.
---

::: plain

## What changed

::: ba

### Before

The fabricator's tracker gave every job a due date the moment the deposit cleared: deposit date plus the quoted lead time. At that point nobody yet knew where the order shipped, who would sign for it, or whether drawings needed approval. The shop planned against a date that was going to slip, and no one could point at why. Customers confirmed their details on a PDF form.

### After

Each customer gets a private link to their own order. They see where it stands, open their estimate, and confirm the details the PDF used to collect. The lead time starts the day they confirm. Until then the due date reads "Set on confirmation", on the customer's screen and in the shop's tracker alike, so a blank date means one thing everyone understands: waiting on the customer.

:::

## What the client got

- A due date that means something, because it starts when the order is actually ready to build.
- No new system for the team. They keep working in the tracker they already use; the portal reads from it and writes back to it.
- One link per order, no passwords, and no customer ever sees another customer's order.
- Reminders that go out on their own, and every customer change logged where the team can see it.
- The switch made safely: every job's existing due date stayed exactly where it was.

:::

::: technical

## What I built

- **The re-anchor.** The tracker's `Due` formula moved from the deposit date to a new `Confirmation Complete` anchor. 171 cells were rewritten on the live tracker by script, after a backup, and checked against it: 39 of 39 open jobs kept their due date to the day. A dry-run tool now catches any new row that arrives on the old formula.
- **A portal with no database of its own.** A static page plus Vercel serverless functions in Node. The client's Google Sheet, behind their AppSheet app, stays the system of record. The portal reads it and writes single cells back through the Sheets API.
- **Private links without accounts.** Each order link carries an HMAC token. A wrong token gets a bare 404, so a probe can't tell "no such order" from "wrong link".
- **An allow-list, not a copy.** The order response is built field by field from an allow-list, so a new internal column on the tracker can never reach a customer by default.
- **Documents without exposing Drive.** Estimates and drawings stream through the server after the token and ownership checks, so the Drive link never reaches the browser.
- **Mail and reminders.** SendGrid from the client's own domain, a daily cron for invites, confirmation nudges and shipping reminders, and a review mode that sends every message to the client's reviewers instead of customers.
- **Estimate auto-fill.** A tool that reads the estimate and fills only empty tracker cells, never overwriting what a person typed, and flags disagreements instead of picking a winner.
- **Safety rails.** A health endpoint that turns red on missing settings, tabs or columns, an audit log of every portal change, and tests that keep customer documents out of the public site.

## Connects to

- Google Sheets and Google Drive (the client's own)
- AppSheet (the client's app, via its webhook)
- SendGrid
- Vercel hosting and cron

## By the numbers

::: facts
- 171 | tracker cells re-anchored on the live sheet
- 39 / 39 | open jobs kept their due date to the day
- ~326 | automated tests
- 99 | pull requests merged
- ~50 | open orders on the tracker when measured (Sept 21, 2026)
- Unknown | date the portal opened to every customer
:::

::: note
The client's team made the app-side changes in their own AppSheet app and granted read-only access to their Drive. Rollout is careful by design: the portal went live against the real tracker in a review period, with mail going to the client's own reviewers before customers. The client's final sign-off is still open.
:::

:::

## What it looks like

![The customer's portal before they confirm](/case-studies/fabricator-order-portal/img/waiting.jpg "Before confirming: the lead time hasn't started, and the ship date reads Set on confirmation. Fake order.")

![The same order after the customer confirms](/case-studies/fabricator-order-portal/img/confirmed.jpg "After confirming: the clock is running and the due date is set. Fake order.")

![The portal on a phone](/case-studies/fabricator-order-portal/img/phone.jpg "The same page on a phone.")

## How it was designed

Before the build, the whole plan lived on one shared Figma board the client could read: what the customer sees, what changes on their tracker, and what was left out on purpose. The working map underneath it is where the rules were worked out first. Client details are blurred.

![The customer's path, start to finish](/case-studies/fabricator-order-portal/img/design-flow.jpg "The customer's path, colour-coded by who acts at each step, and how files come back to the shop.")

![What changes on the tracker](/case-studies/fabricator-order-portal/img/design-tracker.jpg "The tracker gains columns and loses none. The job screen and documents list use example values.")

![What the project is not](/case-studies/fabricator-order-portal/img/design-edges.jpg "The edges, agreed before the build started.")

![The working map](/case-studies/fabricator-order-portal/img/design-working-map.jpg "The working map: gates that hold the clock, reminders that stop themselves, and one update button. Superseded by the plan above, kept because it shows the thinking.")

## The paperwork

These are the documents the client received, as sent, with the client's name, people, places, contact details and prices taken out.

::: docs
- Scope Addendum II | 2026-09-scope-addendum-ii.pdf | What was in scope, how it was paid, and the date the work was judged against. | Sept 2026 · 3 pages
- Where we are | 2026-09-18-where-we-are.pdf | A progress report at the scope freeze: eight plain statements of done, and where each stood. | Sept 18, 2026 · 4 pages
:::
