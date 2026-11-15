---
title: A stipend check that runs itself
summary: Employees with a phone and internet stipend confirm a few times a year that they still qualify. The forms, reminders and escalation now go out on their own.
client: A nonprofit staff platform
visibility: public
date: 2026-10-22
role: Outside developer
stack: Django · ADP · AWS S3
reaches: Every employee with the stipend
order: 1
thumb: /case-studies/stipend-automation/img/form.jpg
tags: [Django, ADP, Scheduled job]
source: Facts from the client repo's git history and pull requests, checked November 15, 2026. "Unknown" means the repo doesn't show it. Screenshots use fake demo data, with the client's name and logo blurred.
---

::: plain

## What changed

::: ba

### Before

Some employees get a monthly stipend for their phone and home internet. A few times a year, each of them has to confirm they still qualify, with their bills and a signed statement. Someone on staff had to send every request and chase every reply.

### After

On each send date, every eligible employee gets an email with a private link. They upload two bills and type their name. A reminder goes out every week until they finish, and their supervisor hears about it once at two weeks. HR and Finance get a note the moment someone submits.

:::

## What the client got

- A form employees can finish in a few minutes, with no login.
- A staff page showing who is done and who is still waiting, with one-click reminders.
- A spreadsheet for each year and a zip of every bill for each round, ready for the auditors.
- Nothing to remember: each round starts on its own on the date staff set.

:::

::: technical

## What I built

- A written spec first: the data model, the eligibility rule, the daily flow, the test plan, and the open questions for the client, each with the default I'd use.
- Two models: a send window, and one form per employee per window. The employee's name, title, email and supervisor are saved when the form is created, so later payroll changes don't rewrite history.
- Eligibility read live from ADP: an active worker with an active `PH` payroll deduction, plus their supervisor from the worker record. Read only; nothing is ever written back to ADP.
- A public form behind a long random token, no sign-in. Uploads are checked by extension and by file content, with a size cap, and the link closes once submitted.
- Four emails, each with a staff preview: the request, a weekly reminder, a one-time supervisor email that never includes the employee's link, and a notice to HR and Finance that carries a link, never the files.
- A daily job that starts due windows, reminds, escalates and retries failures. Each window and each email is claimed under a database lock, so the cron, a "Send now" click and a double-click can never double-send.
- A staff page locked to its own role (superusers without the role are refused), a CSV per year, a receipts zip per window, and a read-only Django admin with tokens and receipts hidden.
- Fake ADP data for ten employees and a one-step demo command that refuses to run in production.

## Connects to

- ADP (read only)
- Email (SMTP)
- AWS S3, private, with 60-second download links
- A cron job on Elastic Beanstalk

## By the numbers

::: facts
- ~94 | tests from my commits
- 95% | coverage at handoff
- 14 | review findings fixed before handoff
- 29/29 | browser walkthrough checks passing
- Unknown | go-live date
- Unknown | how many employees it reaches
:::

::: note
The client's in-house developer reviewed and merged the build, then extended it: a recipient preview, PDF-only receipts with an in-app viewer and a "reviewed" sign-off, rate-limit retries for ADP, a "send to one person" button, and the reimbursement wording Finance asked for. The test count for the app today, with their work, is 184.
:::

:::

## The blueprint

Before the build, the client and I agreed in writing what "done" would mean: a short list of conditions, each one either true or not. This is that list as of November 15, 2026, with what is still open shown as open. Agreed October 13, 2026. It was a short one: the whole scope sat in the first condition.

::: blueprint
- met | Oct 23, 2026 | The app is built to the scope and passes a final test pass: names and titles filled from payroll, a cell receipt required and internet optional, one box for a combined bill, a typed statement, routing to HR and Finance, a yearly export, a reminder after one week and a supervisor notice after two. |
- met | Oct 23, 2026 | The client's developer merges it to main. |
:::

Ruled out before the build:

- Writing anything back to payroll. It is read only.
- Changes after the merge without a new request from the client.

## What it looks like

![The employee's form, opened from a private link](/case-studies/stipend-automation/img/form.jpg "The employee's form, opened from a private link with no sign-in.")

![The staff page with each round and every form's status](/case-studies/stipend-automation/img/staff.jpg "The staff page: each round, and every form's status. It includes the client developer's later additions (the Reviewed column).")

## The paperwork

This case study as a branded summary, to keep or pass along.

::: docs
- Case study summary | stipend-automation-summary.pdf | Both versions of this page, plus the screenshots, as one document to share. | Nov 2026 · 5 pages
:::
