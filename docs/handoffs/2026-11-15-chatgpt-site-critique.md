# Handoff: design and conversion critique of plumblinestudio.dev

Paste everything below the line into ChatGPT. It works best with browsing on, so it can open the pages itself.

---

You are a senior web designer and conversion strategist. Please critique **https://plumblinestudio.dev**, a one-person software studio's website, and give me a prioritized list of improvements. I'll hand your list to the developer who builds the site. Be specific, be blunt, and skip generic advice.

## Who this is

Kyle Knight runs **Plumbline Studio** from Roanoke, Virginia. He builds working tools for small businesses: intake, scheduling and tracking, reporting, customer portals. He uses AI heavily in his process, but a person makes every decision. His tagline is "Build it true."

## Who the site is for (in priority order)

1. **Owner-operators of small businesses.** They have one workflow eating their week. They are not technical and are skeptical of "AI agencies". This is the main door.
2. **Partners** who bring Kyle in to build for their own clients:
   - AI consultants and advisors
   - managed IT providers
   - marketing agencies

   This is the second door, at `/partners/`.

## The offer (current, don't redesign the pricing)

- **Diagnostic:** $500–$2,000, credited toward the build.
- **Fixed-scope build:** $2,500–$15,000. One page defines "done" before work starts. Most builds take 2–4 weeks.
- **Care plan:** $300–$2,000 a month, with named deliverables.
- **Partners:** a 15% trade rate on fixed builds, or $100/hr "alongside you" with a 5 hr/week minimum. Everything is billed in advance.

## Pages to review (desktop and phone, about 390px wide)

- `/` home
- `/how-a-build-runs/`: the nine steps, from the first call to the care plan, with real (blurred) workflow boards
- `/partners/`
- `/case-studies/`: 5 cards. Three of them open a series.
- At least two case-study pages, for example `/case-studies/fabricator-order-portal/` (a long single study) and `/case-studies/renaissance/` (the umbrella page of a series). Each case study has a "Plain-language" / "Technical" toggle.

## What was just done (don't re-suggest these; judge whether they worked)

- One shared header on every page, with the current page highlighted.
- Clickable cards now look clickable: filled, ending in "→", lifting on hover. Read-only information has no box, just a thin rule above it. Before this, the two looked identical.
- Full-width darker bands for the offer and the closing call to action, to break up a "one-note" rhythm.
- Small gold mono labels above white headings, instead of gold headings everywhere.

## Constraints (please respect these)

- **Brand stays:**
  - Colours: dark navy (#1b2433), surface (#292d36), gold (#c8a878), slate text (#9ba5b4).
  - Fonts: Playfair Display for headings, Inter for body, JetBrains Mono for labels.
  - You can suggest how to use them better, and you can suggest a light section or two. Don't propose a new palette.
- **Honesty is a hard rule.** Never suggest invented testimonials, logos, metrics, "trusted by" bars, urgency or scarcity tricks, or stock photos of people.
  - Everything on the site has to be provable.
  - Some clients are deliberately anonymized until they sign off.
  - "Unknown" appears on purpose wherever a fact can't be shown.
- **Avoid the AI-generated look:**
  - no purple-blue gradients
  - no glassmorphism or glowing blobs
  - no icon-on-top three-card feature grids
  - no coloured left-border accent cards
  - no emoji navigation
  - no decorative animation
- **It's a static site** (HTML and CSS, with a little JavaScript, on Cloudflare). Suggestions should be buildable without a CMS or framework.
- **Don't lead with "AI".** The positioning sells outcomes, like time back and fewer dropped leads, not the technology.

## What I want from you

1. **A first impression in 5 seconds** for each audience: an owner, then an AI consultant. What do they think this is, and would they keep scrolling?
2. **The top 5 changes with the most impact**, in priority order. For each, give:
   - the page and section
   - what's wrong
   - why it matters, and for which audience
   - the exact fix (layout, hierarchy, copy, or component)
   - effort: small, medium or large
3. **A full findings table** with these columns: page · section · issue · severity (high/med/low) · fix. Cover:
   - visual hierarchy, typography, spacing and rhythm
   - whether the calls to action are clear
   - navigation and wayfinding
   - mobile layout
   - accessibility: contrast on the dark background, focus states, link affordance
   - how the case-study pages read: are they too long, and is the Plain/Technical toggle discoverable?
   - whether `/how-a-build-runs/` builds trust
   - whether `/partners/` would convince a managed IT provider
4. **Copy suggestions.** Quote the current line, then give your rewrite. Only where it clearly improves clarity or conversion. Keep Kyle's plain, direct voice. No hype words: "game-changer", "seamless", "unlock", "supercharge".
5. **What's missing** that a buyer would expect. Examples: an FAQ on the home page, a security page for managed IT providers, a demos area (one is planned).

Keep it practical. If something already works, say so in one line and move on.
