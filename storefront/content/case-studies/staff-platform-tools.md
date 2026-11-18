---
title: Three tools inside a nonprofit's own staff platform
summary: A stipend check that runs itself, a hiring handoff from HR to Communications, and a safe inbox for vendor bank details. All three were built inside a platform the client's own developer runs, and handed back to that developer.
client: A nonprofit staff platform
visibility: public
date: 2026-11-05
role: Outside developer
stack: Django · ADP · AWS S3 + KMS
reaches: Employees, ministry leaders, HR, Finance and new vendors
order: -1
thumb: /case-studies/vendor-enrollment/img/dashboard.jpg
tags: [Django, Workflow, Security]
source: Facts from the client repo's git history and pull requests, checked November 15, 2026. "Unknown" means the repo doesn't show it. Screenshots use fake demo data, with the client's name and logo blurred.
---

::: plain

## What this is

A nonprofit runs its staff work on one internal web app: 33 parts under one sign-in, covering everything from staff directories to budgets to board materials. The client's own developer built it and owns it.

Between October and November 2026 I built three tools inside it, each one replacing a job that people had been doing by hand:

- **A stipend check that runs itself.** Employees with a phone and internet stipend confirm a few times a year that they still qualify. The forms, reminders and escalation now go out on their own.
- **From approved request to job posting.** Once a new position is approved, HR finalizes it and sends a ready job description to Communications without leaving the app.
- **A safe inbox for vendor bank details.** New vendors send their W-9 and bank documents through a link that works once, and the files delete themselves after Accounts Payable has the vendor set up.

## Why it's one story

Each tool works the way the rest of the platform already did: the same sign-in, the same staff roles, the same look and conventions. Each was also handed to the client's developer with tests they could keep running without me. That fit is the point. Outside work that the in-house person has to rewrite or babysit is a cost, not a help.

:::

::: technical

## How the work fit in

The platform is one Django project with a shared email-based user model and staff roles. Each tool is its own app in that project and uses what was already there: the existing sign-in and roles, the existing ADP connection for employee data, and the deploy and scheduled-job setup already on the server. Each one came in as a pull request with its own tests.

## By the numbers

::: facts
- 3 | tools built, October 20 to November 4, 2026
- 33 | apps in the client's platform
- 19 of 458 | commits on the platform's main branch are mine
- 1 | in-house developer who owns and runs the platform
- 2 of 3 | tools with a written blueprint (each is on its page)
- Unknown | how many people each tool reaches today
:::

::: note
The commit count is small on purpose. The rest of the platform is the client developer's work. They also merged, adjusted and kept each tool after handover; each part's page says what they changed.
:::

:::

## The blueprint

Each tool has its own. The stipend check and the hiring handoff were each agreed in writing before the build and are shown on their pages. The vendor inbox has none.

## What it looks like

![The stipend form](/case-studies/stipend-automation/img/form.jpg "The stipend check: the form an employee gets.")

![The HR queue](/case-studies/hr-position-finalization/img/hr-queue.jpg "The hiring handoff: HR's queue of approved positions.")

![The vendor dashboard](/case-studies/vendor-enrollment/img/dashboard.jpg "The vendor inbox: what Accounts Payable sees.")
