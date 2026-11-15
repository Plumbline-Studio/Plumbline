---
title: The method behind every build
summary: Every project starts from one template. It has to earn a yes before it is built, write down what "done" means, and pass the same automated gate on every change before a person merges it.
client: Plumbline Studio (my own studio)
visibility: public
date: 2026-10-08
role: Founder and builder
stack: GitHub Actions · Node · Claude Code
reaches: Every client project the studio builds
order: 11
series: studio-operating-system
tags: [Method, Quality gates, Claude Code]
source: Facts from the plumbline-template repo, the client repos that use it, and the studio's blueprint records, checked November 15, 2026. "Unknown" means none of them shows it.
---

::: plain

## What changed

::: ba

### Before

Each project was built its own way. "Done" meant whatever the last conversation said, and a shortcut taken under deadline pressure left no trace. When I build with AI agents, that gets worse, not better: an agent can produce more change in a day than a person can read.

### After

Every project starts from one template. Before anything is built it has to earn a yes, and the client and I write down what "done" means as a short list of conditions, each true or not. Every change passes the same automated checks, then a separate reviewer, then a person who merges it. Nothing reaches a client, and no client is ever emailed or invited, without a person pressing the button.

:::

## What a client gets from it

- A written definition of "done", agreed before the build, that anyone can check.
- The important flows written as numbered steps a non-engineer can read, each ending with the one thing the system must never do.
- Shortcuts recorded where they can be seen, instead of hidden.
- No surprise emails, shares or invitations sent in anyone's name.

:::

::: technical

## What the method is made of

- **A worthiness check** before any build: 13 dimensions scored from −2 to +3, green at +18 with no −2, plus two named values and an "indicator light" that signals drift. If the numbers only work through a dark pattern, the answer is no whatever the score.
- **A blueprint:** the conditions of done, stored as rows with a met date and the evidence for each. Every case study on this site shows its own.
- **Playscripts:** critical flows as numbered steps, one actor and one action per step. The last row is always an integrity veto ("never …"). Each binds to a test file, and the gate fails a playscript without its veto.
- **The gate:** one dependency-free Node script, driven by the surfaces a project declares. Eight checks always run (manifest, typecheck, lint, tests, dependency audit, design tokens, playscripts, secret scan). Three more run only where they apply: row-level security for auth, signature checks for webhooks, and a payment playscript for payments. CI runs the same script and posts the result on the pull request.
- **Hooks:** typecheck and lint after every edit an agent makes, the gate at the end of each turn. Agents are blocked from editing the gate, the workflows or their own settings.
- **A reviewer:** a fresh-context subagent that looks only for correctness, requirement and security gaps, and hunts for changes outside the stated scope. "Finding nothing is a valid outcome."
- **Lifecycle stages:** scaffold, build, live. A stage changes only in its own one-line pull request, against a checklist. Each checklist item "enters with the failure it prevents."
- **Two human gates:** content is born internal and crosses to client-visible only by a logged human action. Creating something never notifies anyone.
- **Exceptions as issues:** a forced shortcut becomes a GitHub issue labelled `exception`, the same day. Zero is the steady state.
- **Session notes:** every working session reads the last notes at the start and writes one at every merge or decision, so the next session starts where this one stopped.

## Where the rules came from

Each rule exists because something went wrong once:

- Two broken builds shipped in one day because a check was skipped. Now typecheck and lint run after every edit, and a skipped check becomes an exception issue.
- In a client portal, a folder thought to hold design mockups was in fact public, and a customer's estimate could be downloaded. Now nothing is staged with a blanket "add all", and the folder's README says it is public.
- A formula fix was called done because existing rows looked right. New rows then came out due in the year 1773. Now a formula change is only done when a fresh test row proves it.

## By the numbers

::: facts
- 11 | checks in the gate
- 297 | blueprint conditions written across 35 blueprints
- 71 | of those met, each with its evidence
- 7 of 7 | playscripts carrying an integrity veto
- 1 of 4 | client repos born from the template (others adopted parts later)
- 2026-07-25 | first commit of the template
:::

::: note
The honest gaps. The gate's checks are pattern matches, not proofs. Only one repo was born from the template; the others adopted the gate and playscripts later, and most have not adopted the worthiness check or the reviewer. Plumb-bob, the engine meant to run playscripts against a live preview, is not running in any client's CI yet; until it is, the bar is passing playscript tests plus a recorded walkthrough.
:::

:::

## The blueprint

The method has no blueprint of its own: it is where blueprints come from. Each of the other case studies in this series, and on this site, shows the blueprint for its work.

## What it looks like

![The Core Map](/case-studies/studio-operating-system/img/core-parts.jpg "Every part of the studio's system, side by side: the gold bar is how much is built, the grey tick is how many blueprint conditions are met. Where the two sit far apart, the record is out of step with the work. Snapshot of November 10, 2026.")
