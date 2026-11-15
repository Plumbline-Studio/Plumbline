---
title: AI staff that never act in my name
summary: A roster of AI workers, each with a written contract of what it may read, write and must stop before, plus a memory that carries every session into the next.
client: Plumbline Studio (my own studio)
visibility: public
date: 2026-11-15
role: Founder and builder
stack: Supabase · Python · Claude · Linear
reaches: The studio's daily operations
order: 14
series: studio-operating-system
tags: [AI agents, Python, Knowledge management]
source: Facts from the studio's worker registry, session notes, Linear run logs, the drive-sorter repo and the knowledge vault, checked November 15, 2026. "Unknown" means none of them shows it. No client or personal content is shown.
---

::: plain

## What changed

::: ba

### Before

A one-person studio forgets. The morning brief, the inbox, filing documents, keeping each project's record of "done" current: all of it depended on me remembering, and each AI session started from nothing.

### After

AI workers do the routine parts on a schedule: a daily brief, a night shift, an inbox pass, a library of saved reading, and a keeper that keeps each blueprint's record current. Each has a written contract. None of them sends, posts, pays or publishes anything in my name; the ones that would face outward are switched off. Every working session, mine or an agent's, ends by writing a short note, and the next one starts by reading it.

:::

## What it gives the studio

- Routine work done without being asked, and nothing done in my name without me.
- A memory that survives between sessions, devices and tools.
- Documents filed into one numbered system, with nothing deleted and every move logged.

:::

::: technical

## What I built

- **A worker registry:** one row per worker, stating what it may write and read, what starts it, where it must stop, and its mode (autonomous, prepare, or review). One writer per artifact.
- **The rule, written into the system:** "No worker sends, posts, pays, publishes, enables another worker, or writes outside its writes list." Dry run is the default. Outward-facing workers (client liaison, outreach drafting, publishing) are disabled.
- **Run logs in Linear,** so it is visible which workers actually ran today.
- **The memory spine:** a `session_notes` table every session reads at the start and writes to at every merge, decision or pivot. A JSON journal in the repo is the fallback when the database is out of reach.
- **Drive Sorter:** a four-step command-line tool (inventory, dedupe, propose, apply) for filing into a numbered Johnny.Decimal Drive. Its rules live in code: never delete (only byte-identical duplicates go to the trash), never rename a numbered folder, nothing moves without an explicit apply, every move logged, each filing question asked once.
- **A capture pipeline:** recordings become transcripts, then briefs, then filed notes, on a daily schedule.
- **A knowledge vault** in the same numbering: every note dated and sourced, nothing deleted, decisions append-only, and a link checker that must report zero broken links.

## What isn't built

- Drive Sorter's daily agent isn't built yet, and its one-time migration of my old files hasn't been run.
- Fifteen of the enabled workers were registered on November 3 and have no run log yet. Whether they do useful work is unknown.
- The workers move inside the Factory in its Phase 6, still in progress.

## By the numbers

::: facts
- 37 | workers registered (30 on, 7 off)
- 5 | with a run log updated November 15
- 697 | session notes, April to November 2026, across 12 repos
- 134 | Drive Sorter tests
- 1,115 | notes in the vault
- 7 | workers switched off, including every one that would face outward
:::

:::

## The blueprint

The workers have no blueprint of their own. They are tracked on the Factory's: its Phase 6 condition is the one that brings every live worker inside the container, running through a runner that enforces its contract.
