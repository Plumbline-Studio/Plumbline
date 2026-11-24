# Resources: the contract

`/resources/` holds short articles on how Plumbline builds software you can trust. Each article
tells one real change to how we build: what went wrong, what we changed, and what the numbers
said after. Each one links to a small example anyone can run, in the public repo
[Plumbline-Studio/clean-code-examples](https://github.com/Plumbline-Studio/clean-code-examples).
Kyle picked the Resources page as their home on 2026-11-24.

## Writing one

1. Write `storefront/content/resources/<slug>.md`. The file name is the slug (lowercase, dashes).
2. Optional: `python3 scripts/resources-og.py` makes its share picture at
   `storefront/og/resources/<slug>.png`. Add `og:` to the front matter.
3. Run `node scripts/build-resources.mjs` and commit everything it writes.
4. Open a pull request. Cloudflare posts a preview link. Nothing goes live until it merges.

```
---
title: Every fix becomes a check
summary: One or two plain sentences. Shown on the list, in share cards and in the feed.
date: 2026-12-01
visibility: public
tags: [Testing, Process]
code: https://github.com/Plumbline-Studio/clean-code-examples/tree/main/01-every-fix-becomes-a-check
run: cd 01-every-fix-becomes-a-check && python3 -m unittest
og: /og/resources/every-fix-becomes-a-check.png
---
```

- `visibility`: `public` (listed, in the feed and sitemap) or `unlisted` (a page with
  `noindex`, reachable by its link, for a preview). There is no hidden state: an unfinished
  article waits in Drive (18 Plumbline / 12 Clean Code / 03 Articles).
- `code`: must point into the public examples repo. Nothing from a private repo, no client data.
- `run`: the command shown in the "Try it yourself" box.
- An article ships only after the change it describes is finished and measured. No made-up
  numbers. While there are none, the list shows a "coming soon" note with the next topics.

Body: `##` and `###` headings, paragraphs, `- ` and `1. ` lists, images on their own line
(`![alt](src "caption")`), and fenced code blocks with a language.

## Sharing

Every article has a share bar at the top and bottom: LinkedIn, X, Facebook, Email and Copy link
(plus the phone's own Share sheet where the phone has one). They are plain links to each network's
share page, so they work with no script. Each link carries
`?utm_source=<network>&utm_medium=share&utm_campaign=<slug>`, so the studio can see which network
brings readers back. No tracking script, no cookie.

The studio's own posts about an article are made in the Factory: Marketing > Make and post,
"Share an article". It drafts a post per network, each with its own tagged link
(`utm_medium=social`), and they wait on Kyle's Approve before anything goes out.

## What the build writes

- `storefront/resources/index.html`, the list (or "coming soon").
- `storefront/resources/<slug>/index.html`, one per article.
- `storefront/resources/feed.xml`, RSS for public articles.
- The `resources` blocks in `storefront/sitemap.xml` and `storefront/llms.txt`.

`node scripts/build-resources.mjs --check` runs in CI and fails if any of these are out of date.
