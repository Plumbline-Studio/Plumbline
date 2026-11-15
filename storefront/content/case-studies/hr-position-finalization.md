---
title: From approved request to job posting
summary: Once a new position is approved, HR finalizes it and sends a ready job description to Communications without leaving the app.
client: A nonprofit staff platform
visibility: public
date: 2026-10-28
role: Outside developer
stack: Django · email
reaches: Ministry leaders, coordinators and HR
order: 2
thumb: /case-studies/hr-position-finalization/img/hr-queue.jpg
tags: [Django, Workflow, Roles]
source: Facts from the client repo's git history and pull requests, checked November 15, 2026. "Unknown" means the repo doesn't show it. Screenshots use fake demo data, with the client's name and logo blurred; pay shows "[sample]" on purpose.
---

::: plain

## What changed

::: ba

### Before

Leaders could already request a new position online, and a coordinator could approve it. After that, HR got an email and did the rest by hand: the final title, pay, benefits, duties and the job description.

### After

HR has a queue of approved positions. They confirm the final details, and the app drafts the job description from them. HR edits it and sends it to Communications with one click. The leader's original request is kept, so everyone can see what HR changed.

:::

## What the client got

- One place for HR to see every approved position and where it stands.
- A job description drafted from the request, not retyped.
- A record of who sent what to Communications, and when.
- Only the right people can submit, approve or finalize.

:::

::: technical

## What I built

- A new HR Coordinator role, enforced even for superusers who don't hold it.
- An HR queue, split into "waiting for HR" and "sent to Communications".
- A finalize page with every field the leader filled in plus HR's own: final title, pay, benefits, duties and qualifications. Title and pay are required.
- A frozen copy of the leader's original answers, taken on HR's first save and never overwritten, with a table on the request page of what HR changed.
- A job description built from the request and a plain-text template. No AI. If HR changes the details later, an untouched description is rebuilt; a hand-edited one is kept, with a warning.
- Send to Communications by email, with a copy to the sender. It records who sent it and when. A failed send records nothing, and the button can't be double-clicked.
- Submitting is now limited to leaders with the role.

## Connects to

- Email (SMTP)

## By the numbers

::: facts
- 31 | tests added
- 93% | coverage at handoff
- 16/16 | browser walkthrough checks passing
- 12 | new fields, no new tables
- Unknown | go-live date
- Unknown | how many people hold the roles
:::

::: note
This built on a first version the client's in-house developer wrote in August, which handled submitting and approving. They also wrote the plan for the rest of the hiring process, from job postings to onboarding.
:::

:::

## The blueprint

Before the build, the client and I agreed in writing what "done" would mean: a short list of conditions, each one either true or not. This is that list as of November 15, 2026, with what is still open shown as open. Agreed October 22, 2026.

::: blueprint
- met | Oct 23, 2026 | Only ministry leaders can open or submit the request form. Everyone else, superusers included, is refused and sees no link. |
- met | Oct 23, 2026 | An HR Coordinator role exists, and HR has a queue of approved requests that no one else can open. |
- met | Oct 23, 2026 | HR can correct the leader's details and add the final title, pay, benefits, duties and qualifications. The leader's original answers are kept beside HR's version. |
- met | Oct 23, 2026 | One click builds a job description from the request, HR's fields and standard text, with no AI. HR can edit it before sending. |
- met | Oct 23, 2026 | HR emails it to Communications. The app records who sent it and when, and says so if the send failed. |
- met | Oct 23, 2026 | Tests pass on the real database, migrations are clean, and the pull request shows a screenshot of every screen. |
- met | Oct 28, 2026 | The client's developer reviews it and merges it. |
:::

Ruled out before the build:

- The rest of hiring: careers pages, applications, the candidate board, reminders and close-out. That is a later phase.
- AI-written text inside the app.
- Posting to the website, social media or job boards. The app only emails Communications.
- Payroll and onboarding work.
- Changes to the in-house developer's code outside this feature.
- Real employee or applicant data in tests or screenshots.

## What it looks like

![HR's queue of approved positions](/case-studies/hr-position-finalization/img/hr-queue.jpg "HR's queue: approved positions waiting for HR on top, ones sent to Communications below.")

![The finalize page](/case-studies/hr-position-finalization/img/hr-edit.jpg "Finalize Position: the details that go into the job description.")

![The drafted job description](/case-studies/hr-position-finalization/img/job-description.jpg "The drafted job description, ready to edit and send.")

## How it was designed

The whole hiring process was mapped on one Figma board before the build: who acts at each step, what was already built, and which phase each later step belongs to. The client's name is blurred.

![The hiring workflow map](/case-studies/hr-position-finalization/img/design-workflow-map.jpg "Yellow: the request and approval that already existed. Phase 1 is the part this project built: the HR role, the queue, and finalizing title, pay and benefits. Phases 2 to 7 follow the in-house developer's plan for the rest of hiring.")

## The paperwork

This case study as a branded summary, to keep or pass along.

::: docs
- Case study summary | hr-position-finalization-summary.pdf | Both versions of this page, plus the screenshots, as one document to share. | Nov 2026 · 5 pages
:::
