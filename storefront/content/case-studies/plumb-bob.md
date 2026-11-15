---
title: Plumb-bob, a checker that asks whether it should exist
summary: A GitHub Action that checks a change in three layers, from "does it work?" to "should it exist this way?". It is built and released, and honestly not yet reliable enough to gate client work.
client: Plumbline Studio (my own studio)
visibility: public
date: 2026-10-01
role: Founder and builder
stack: TypeScript · Playwright · Claude · GitHub Actions
reaches: Open source; not yet in any client's CI
order: 13
series: studio-operating-system
tags: [TypeScript, Testing, AI agents, Open source]
source: Facts from the public Plumb-bob repo, its evaluation history and the client repos' CI settings, checked November 15, 2026. "Unknown" means none of them shows it.
---

::: plain

## What changed

::: ba

### Before

Automated tests answer one question: does the code do what the test says? They can't tell you if the product still matches what the client agreed to, or if a change does something it never should, like emailing a customer without being asked.

### After

Plumb-bob checks a change three ways. **Plumb:** an AI agent drives a real browser through the preview and asks "does it work?". **Level:** it walks the flow's playscript, the numbered steps the client can read, and flags where the build has wandered from it. When it has, it asks a person: is the script wrong, or the build? **True:** it scores the change against a written set of principles. An integrity veto blocks the merge even when everything works.

:::

## Where it stands

- Built and released as a GitHub Action, version 1.
- Measured honestly: a test harness with four small practice sites runs it every week and records how often it gets the right answer.
- Not yet trusted with client work. Its latest live score is 67% accurate, so no client project runs it in CI yet. The method's interim bar is playscript tests plus a recorded walkthrough.

:::

::: technical

## What I built

- **The engine:** about 2,800 lines of TypeScript: one module per layer, an agent loop that drives Playwright, a report writer, and a model layer with a real Anthropic client and an offline mock.
- **A composite GitHub Action** (`action.yml`), tagged `v1`.
- **A report contract** (a JSON schema for every run) and a written playscript spec.
- **An evaluation harness:** four fixture sites (green, broken, diverged, and one that should trip the veto) with expected results. The mock tier runs offline in CI on every change. The live tier runs the real model weekly and records two numbers, accuracy and consistency, to a history file.
- The repo's own CI, plus a weekly live evaluation.

## What isn't built

- The "Bob" steps in a playscript (checks against the database, analytics or payments) are skipped in v1; no integrations are wired.
- No client repo runs it. One client repo has its workflow file waiting to be installed.
- In the Factory, the inspector agent is meant to run it on every pull request; its recorded runs all say it was not run, because that run had no checkout or API key.

## By the numbers

::: facts
- 3 | layers: works, matches, should exist
- 93 | test cases
- 14 | weekly live evaluations recorded
- 67% | latest live accuracy (it started at 0%)
- 58% | latest live consistency
- 0 | client repos running it in CI
:::

::: note
I'm showing the weak number on purpose. The harness exists so the engine can't claim more than it does. Until accuracy and consistency hold up week after week, Plumb-bob stays out of client CI.
:::

:::

## The blueprint

Plumb-bob has no blueprint of its own yet. On the studio's Core Map it shows as 35% built, a figure set by hand in a review, not from a ledger.
