# Handoff: design and conversion critique of plumblinestudio.dev, round 2

Paste everything below the line into ChatGPT. Turn on browsing so it can open the pages itself.

Round 1 produced the "Website improvement brief" (P1–P5). Round 2 checks whether those changes worked and asks what to do next.

---

You are a senior web designer and conversion strategist. Earlier today you critiqued **https://plumblinestudio.dev** and wrote an improvement brief (P1–P5). The developer has now built it, and it's live. Please review the site again.

Be specific and blunt. Don't repeat advice that has already been acted on.

## Who this is

Kyle Knight runs **Plumbline Studio** in Roanoke, Virginia, as a one-person studio. He builds working tools for small businesses: intake, scheduling and tracking, reporting, and customer portals. He uses AI heavily in his process, but a person makes every decision. Tagline: "Build it true."

## Who the site is for (in priority order)

1. **Owner-operators of small businesses.** Not technical. Wary of "AI agencies". This is the main door.
2. **Partners who bring Kyle in to build for their own clients:** AI consultants and advisors, managed IT providers, and marketing agencies. Their page is `/partners/`.

## The offer (current; don't redesign the pricing)

- **Diagnostic:** $500–$2,000, credited toward the build.
- **Fixed-scope build:** $2,500–$15,000. One page defines "done" before work starts. Most builds take 2–4 weeks.
- **Care plan (optional):** $300–$2,000 a month, with named deliverables.
- **Partners:** a 15% trade rate on fixed builds, or $100/hr "alongside you" with a 5 hr/week minimum. Everything is billed in advance.

## What was built from your brief

- **P1 · Home hero.**
  - A kicker reads "Custom software for small businesses".
  - The lede names concrete uses: customer portals, intake forms, job tracking, reports.
  - A "See a real build first ↓" link was added.
  - The particle animation was removed.
  - The care plan is labelled optional.
- **P2 · Home proof.**
  - The fabricator build sits right after the hero, with before and after, a screenshot, and "39 of 39 open jobs kept their due date to the day".
  - The three cards below show client work only.
  - A short FAQ appears before the closing call to action.
- **P3 · Partners.**
  - The page opens with the nonprofit build Kyle did inside another developer's platform and handed back.
  - A new `/security-and-handover/` page covers what every scope fixes in writing: hosting, data, access, AI use, the client's standards, and handover. It also lists the standing rules, and says plainly that there is no SOC 2.
- **P4 · `/how-a-build-runs/`.**
  - Quote and payment now come before the build (step 04).
  - Demos are offered only "when it's useful and we've agreed it".
- **P5 · Case studies (all 15).**
  - The Plain-language/Technical switch now sits under the summary.
  - Each has three at-a-glance figures, taken from facts already on the page.
  - A lead screenshot and an "On this page" index were added.
  - The details row shows "Naming", meaning whether the client is named and who signed off.
  - Headings are now white, with gold kept for labels.
- **QA.**
  - Nav pills, the version switch and buttons are at least 44px tall.
  - No horizontal overflow at 1280, 390 or 320 px.
  - All internal links and anchors resolve.
  - The text palette passes WCAG AA.

**Deliberately not done:**
- **No demos area.** None of the demos is both fully working and cleared for public view yet.
- **Case studies don't show separate review or deployment statuses.** Only sign-off status is recorded. Showing the others would mean adding facts that aren't documented.

## Pages to review (desktop and phone, about 390px)

- `/`
- `/partners/`
- `/security-and-handover/` (new)
- `/how-a-build-runs/`
- `/case-studies/`
- At least two case studies: `/case-studies/fabricator-order-portal/` and `/case-studies/staff-platform-tools/`

## Constraints (unchanged; please respect them)

- **Brand.** Dark navy ground (#1b2433), surface (#292d36), gold (#c8a878), slate text (#9ba5b4). Playfair Display for headings, Inter for body, JetBrains Mono for labels.
  - One open question: Kyle's brand file moved the ground colour from navy to **plum (#2c1f33, panels #3a2a42)** in September, but the site was never switched.
  - You may give an opinion on whether plum would serve these audiences better. Don't redesign beyond the ground and panel colours.
- **Honesty is a hard rule.**
  - No invented testimonials, logos, metrics, "trusted by" bars, urgency, scarcity, or stock photos of people.
  - Every claim must be provable. Some clients stay anonymized until they sign off. "Unknown" appears on purpose.
- **No AI-slop tells.** No purple-blue gradients, glassmorphism, glowing blobs, icon-on-top three-card grids, coloured left-border accent cards, emoji navigation, or decorative animation.
- **Static HTML and CSS** with a little JavaScript, on Cloudflare. No CMS or framework.
- **Don't lead with "AI".** Sell outcomes, not technology.
- **Copy tone.** Direct and plain. No hype words: "game-changer", "seamless", "unlock", "supercharge".

## What I want from you

1. **Did P1–P5 land?** For each item: landed, partly, or missed, with one line on why. Name anything that got worse.
2. **First impression in 5 seconds**, again, for two readers: an owner, and a managed IT provider evaluating Kyle for a client.
3. **The next 5 changes with the most impact**, in priority order. For each:
   - page and section
   - what's wrong
   - why it matters, and for which audience
   - the exact fix
   - effort: small, medium or large
4. **Findings table**, only for new or remaining issues: page · section · issue · severity · fix.
5. **Copy:** quote the current line, then give your rewrite. Only where it clearly improves clarity or conversion.
6. **Plum versus navy:** a short recommendation with your reasoning.
7. **What's still missing** that a buyer or partner would expect.

Return it as a brief in the same format as round 1, so it can go straight to the developer.
