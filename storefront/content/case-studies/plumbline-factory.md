---
title: The Factory, one container for the whole studio
summary: The studio's tools, client work and AI workers folded into one Docker container and one Django app, with one gate and one set of rules. Five of nine build phases are done.
client: Plumbline Studio (my own studio)
visibility: public
date: 2026-11-11
role: Founder and builder, with a swarm of AI agents
stack: Python · Django · Postgres · Docker
reaches: The studio today; AI consultants later
order: 12
series: studio-operating-system
thumb: /case-studies/plumbline-factory/img/desk.jpg
tags: [Django, Docker, AI agents]
source: Facts from the plumbline-factory repo, its Linear project and the studio's blueprint and worker records, checked November 15, 2026. "Unknown" means none of them shows it. Screenshots use the app's test data, not real clients.
---

::: plain

## What changed

::: ba

### Before

The studio ran on a dozen separate tools: a dashboard, a client portal, a CRM, a document sorter, a set of AI workers on their own schedules. Each lived in its own repo with its own rules, and each drifted on its own.

### After

One container runs one app with five places: a Desk for what needs me today, a Board, Clients, the Factory itself, and Staff for the AI workers. Every older tool is being folded in as a module with the same shape. A Control Room holds the switches, the worker roster and the audit log. The plan is to sell it later as one container per AI consultant.

:::

## What it gives the studio

- One place to work instead of a dozen tabs.
- AI workers that log what they would do, and do nothing in my name until I switch them on one by one.
- New client projects stamped from one module shape, so every one starts with the same safeguards.
- One gate for everything, instead of one per repo.

:::

::: technical

## What I built

- **Phases 0 to 4, done:** the container, the shared core (accounts, audit, files, documents, integrations, jobs, a gate runner), the five-place shell, and eight modules (blueprints, board, CRM, desk, a factory atlas, funnels, QA runs, working maps). Each phase closed with a recorded passing gate run.
- **Phases 5 and 6, in progress:** the knowledge index and the staff runtime. Their work items are closed; the phases are not, yet.
- **A build swarm:** nine AI agent roles, each with a written contract of what it may write. A lead dispatches work, an inspector reviews every pull request without editing code, and a scribe writes the READMEs and decision records after each merge.

## The design choices

- **Deep modules.** Other code reaches a module only through its `api.py` or the shared core. Import-linter fails the gate otherwise: core never imports modules, and worker modules never touch the database driver directly.
- **Adopt, don't copy.** The studio's live database is adopted as-is, with tables marked unmanaged. Migrations may only add; anything destructive stops and waits for me.
- **The integrity veto.** "The container never does in Kyle's name what Kyle has not done": no worker sends, posts, pays or publishes. Every playscript ends with a veto row and the gate checks for it.
- **Dry run by default.** Workers log the writes they would make and stop. Each worker's allowed writes are enforced as an allow-list.
- **A module skeleton.** `stamp_module` makes new modules in four kinds (client intake, client portal, internal tool, quiz product). A stamped module starts switched off, and switching it on needs a passing QA run.
- **One gate.** Ruff, mypy, pytest, import-linter, a migrations check, playscript format with its veto, and conflict markers. CI runs exactly the same command.

## Connects to

- Postgres with pgvector
- Django-Q2 for scheduled work, on the database as its broker
- The Anthropic API, behind one integration module
- Images published to GitHub's container registry

## By the numbers

::: facts
- 5 of 9 | build phases closed
- 942 | test functions
- 8 | modules
- 9 | AI agent roles in the build swarm
- 80 | recorded decisions, plus 21 architecture records
- 9 days | first commit to the latest (Nov 3 to Nov 11)
:::

:::

## The blueprint

The Factory's blueprint covers the remaining phases, 5 to 8, and was agreed on November 11, 2026. None of its conditions is met yet. Phases 0 to 4 closed before it was written, each with a passing gate run.

::: blueprint
- open | | Phase 5 closed: a knowledge index answers search over the studio's notes and recordings; brand kit and document tools ported. | Its work items are closed; the phase is not.
- open | | Phase 6 closed: every live worker runs through the Factory's runner, writes only what it is allowed to, and leaves a receipt. | Its work items are closed; the phase is not.
- open | | The workers run inside the Factory for real, switched from dry run one by one, with the old scheduled tasks retired.
- open | | Phase 7 closed: every active client engagement and product is a module stamped from the skeleton.
- open | | Phase 8 closed: each old tool retired after 30 quiet days, with a recorded decision for each.
- open | | Every table is managed by the Factory, and the image boots on an empty database from the README alone.
- open | | One "needs you" queue on the Desk for every worker's questions.
- open | | An autonomy dial: how much the workers may decide alone, with a hard floor.
- open | | A contractor seat that can work one module and see nothing else.
- open | | One login on the studio's site that routes clients, me and contractors in by role.
- open | | Architecture note, a README a newcomer can run from, and a current handoff note.
- open | | The gate is a required check on every pull request, with its result posted.
- open | | Tagged releases, production only by merge, one rollback tried.
- open | | Uptime check, error tracking and automated dependency updates.
- open | | No dead branches, no unticketed TODOs, no secrets in code.
:::

Ruled out:

- Selling it, pricing it or onboarding other operators. That is a separate blueprint.
- A multi-tenant service. It is one container per operator.
- New paid services, or deleting any old tool or data without my approval at that step.

## What it looks like

![The Desk](/case-studies/plumbline-factory/img/desk.jpg "The Desk: one queue of what needs me. Here a worker suggested filing a document, and the Factory refused to move it because Drive is connected read-only. Test data.")

![A blueprint in the Factory](/case-studies/plumbline-factory/img/blueprint.jpg "A blueprint inside the Factory: its terms, its conditions with evidence, and the worthiness check beside it. Test data.")

![The Control Room](/case-studies/plumbline-factory/img/control.jpg "The Control Room: switches, the worker roster, integrations and the audit log. Secret values are never shown here.")
