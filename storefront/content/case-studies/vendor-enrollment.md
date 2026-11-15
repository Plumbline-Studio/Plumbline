---
title: A safe inbox for vendor bank details
summary: New vendors send their W-9 and bank documents through a link that works once. The files delete themselves after Accounts Payable has the vendor set up.
client: A nonprofit finance team
visibility: public
date: 2026-11-05
role: Outside developer
stack: Django · AWS S3 + KMS
reaches: New vendors and Accounts Payable
order: 4
thumb: /case-studies/vendor-enrollment/img/dashboard.jpg
tags: [Django, Security, AWS KMS]
source: Facts from the client repo's git history and pull requests, checked November 15, 2026. "Unknown" means the repo doesn't show it. Screenshots use fake demo data, with the client's name, logo and contact details blurred.
---

::: plain

## What changed

::: ba

### Before

Vendors got a PDF and uploaded their tax form and a voided check to a file portal protected by one shared password, printed on the form. Nothing was ever deleted. Then the portal's contract ended, and Accounts Payable had nowhere to send vendors at all.

### After

Accounts Payable types a vendor's name and email, and the vendor gets a link that works once. They fill in the form and upload their documents. Accounts Payable reviews them, sets the vendor up in the finance system, and the documents are deleted a week later on their own.

:::

## What the client got

- No shared password, and every view and download is logged.
- Bank and tax documents that don't pile up forever.
- A dashboard showing who is waiting and for how long.
- A warning before anything unhandled is deleted.

:::

::: technical

## What I built

- A plan and mockups first, including what the finance system's API can and can't do (it can create vendors but has no bank fields, so that step stays manual).
- Three models: the enrollment, its documents (stored under random names, the vendor's file name never kept), and an access log.
- A vendor form from a one-time link that expires in 14 days and closes on submit. It mirrors the old PDF but asks for no typed bank or tax numbers; that data lives only inside the uploaded files.
- Encryption with the app's own AWS KMS key. Every upload is checked against it, a mismatch is deleted and refused, and the app refuses to start if the key is missing.
- A daily job that expires invites, retries notices, warns Accounts Payable seven days ahead, and deletes due documents, including every stored version.
- A role-locked dashboard and review page, a read-only admin, and a test that logs never hold names, file names or tokens.

## Connects to

- AWS S3 with KMS encryption
- Email (SMTP)
- Financial Edge NXT (entered by hand for now; the hand-off point is ready for an API)
- A cron job on Elastic Beanstalk

## By the numbers

::: facts
- 73 | tests from my work
- 0 | typed bank or tax numbers stored
- 7 days | until documents are deleted after setup
- 30 days | until an unhandled submission is deleted
- Unknown | go-live date
- Unknown | how many vendors it reaches
:::

::: note
My first pull request was merged before the AWS key existed, which would have broken the next deploy. I reverted it the same day and reopened it with a setup checklist. The version that shipped carries my code and tests unchanged. The client's in-house developer added one upload fix and, after feedback from Accounts Payable, made one confirmation checkbox optional.
:::

:::

## The blueprint

This project had no blueprint. A plan and mockups came first, but no written list of what "done" meant was agreed with the client before the build.

## What it looks like

![The vendor's enrollment form](/case-studies/vendor-enrollment/img/form.jpg "The vendor's form, from a one-time link.")

![The Accounts Payable dashboard](/case-studies/vendor-enrollment/img/dashboard.jpg "The Accounts Payable dashboard: who is waiting, and for how long.")

![The review page](/case-studies/vendor-enrollment/img/review.jpg "The review page. Every view and download is logged.")

## The paperwork

This case study as a branded summary, to keep or pass along.

::: docs
- Case study summary | vendor-enrollment-summary.pdf | Both versions of this page, plus the screenshots, as one document to share. | Nov 2026 · 5 pages
:::
