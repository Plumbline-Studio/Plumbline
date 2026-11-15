# Case studies — the content contract

**Work:** PLU-720 (under Site B, PLU-661). **Blueprint:** Case Studies — plumblinestudio.dev/case-studies
(`29a55ebb-183b-422c-8480-54fc6f158602`, condition 7 is this file).

This is the shape a case study takes in this repo. Today Kyle writes these files by hand. Later the Factory's
portfolio module writes the same files and opens a pull request when Kyle taps Publish. Anything that produces
this shape can drive `/case-studies`.

## Where things live

| Path | What |
|---|---|
| `storefront/content/case-studies/<slug>.md` | One case study. The file name is the slug and the URL: `/case-studies/<slug>/`. Served as-is, so the Markdown is also the "get the file" download. |
| `storefront/case-studies/<slug>/img/` | Its screenshots. |
| `storefront/case-studies/` (generated) | The list page and one page per case study, written by the build. Never edit these by hand. |
| `storefront/css/tokens.css` | Every colour and font the pages use. Site A swaps these for the plum tokens from `plumbline-template`. |
| `scripts/build-case-studies.mjs` | The build. `node scripts/build-case-studies.mjs` writes; `--check` fails if anything is out of date. CI runs `--check`. |

The build also fills the blocks between `case-studies:start` and `case-studies:end` markers in `index.html`
(the home page's case-study row), `sitemap.xml` and `llms.txt`. Nothing outside the markers is touched.

## Working files (Drive)

Originals, sources and sign-off live in Google Drive, never in this public repo:
**10-19 Plumbline Studio / 18 Plumbline / 07 Case Studies / `<slug>`**, one folder per case study, named by the slug.

| Folder | What |
|---|---|
| `00 Published` | The blurred, full-size screenshots as they went live. The site serves resized copies. |
| `01 Originals` | The same screens unblurred. Never published without sign-off. |
| `02 Sources` | Every fact on the page and where it came from. |
| `03 Sign-off` | The client's written OK to be named, and the steps to name them. |

`_tools` beside them holds the scripts that re-take both screenshot sets. Each case folder is registered in
Supabase `documents` (`source = drive`, `doc_type = folder`, tag `case-study:<slug>`), so the Factory module
finds it by slug. A new case study gets its Drive folder before its Markdown lands here.

## Front matter

Flat `key: value` lines between `---` fences. Lists are `[a, b]`.

| Field | Required | Meaning |
|---|---|---|
| `title` | yes | The case study's name, in plain words. |
| `summary` | yes | One or two sentences. Used on cards, in `llms.txt` and as the page description. |
| `client` | yes | The public label for the client, anonymized: "A nonprofit staff platform". |
| `visibility` | yes | `public` or `unlisted`. See below. |
| `date` | yes | `YYYY-MM-DD`: when the work landed (merged or delivered). Shown as "Landed". |
| `role` | yes | Kyle's role: "Outside developer". |
| `stack` | yes | Short, for the meta strip: "Django · ADP · AWS S3". |
| `order` | yes | Position on the list, lowest first. |
| `reaches` | no | Who the tool reaches, in words. Never a number the source doesn't show. |
| `thumb` | no | Card image path. |
| `tags` | no | A few short tags. |
| `source` | no | Where the facts come from and when they were checked. Shown at the foot of the page. |
| `client_name` | no | The client's real name. **Only with `signoff_by` and `signoff_date`**; the build refuses it otherwise. |
| `signoff_by`, `signoff_date` | with `client_name` | Who at the client agreed to be named, and when. |

## Visibility

| State | On the site | In this repo |
|---|---|---|
| `public` | On `/case-studies`, the home page row, `sitemap.xml` and `llms.txt`. | Yes. |
| `unlisted` | Its page answers by link, with `noindex`. Listed nowhere. | Yes, so it is findable on GitHub. |

There is **no hidden state** (Kyle, 2026-11-15). A case study is anonymized until the client signs off (no name,
logo, domain or phone, in text or screenshots), so it is always safe to show. Anything committed here is on the
site, public or unlisted. A case study that isn't finished yet waits in its Drive folder, not here, and the build
refuses any other `visibility` value. A slug with no Markdown file answers 404.

Removing a case study's Markdown file withdraws it: the build deletes its generated folder, screenshots included.

## The body

Markdown with a small, fixed set of blocks: `##` and `###` headings, paragraphs, `- ` lists, `**bold**`,
`` `code` ``, `[links](url)`, and images on their own line: `![alt](path "caption")`.

Fenced blocks open with `::: name` and close with `:::`:

| Fence | Use |
|---|---|
| `::: plain` | The plain-language version, for owners. |
| `::: technical` | The technical version, for builders. |
| `::: ba` | Inside a version: a `### Before` and a `### After`, shown side by side. |
| `::: facts` | A list of `- value | label` lines, shown as tiles. A value of `Unknown` is shown as unknown, not hidden. |
| `::: note` | A quiet aside. Used to credit other people's work. |
| `::: blueprint` | "The blueprint". A list of `- met | date | condition | note` or `- open | | condition | note` lines (or `parked`, for a condition set aside on purpose, with the date it was parked): the conditions of done agreed with the client before the build. Written in plain words from the Supabase blueprint, never copied: blueprints carry names, prices and addresses. Open conditions stay open on the page. A project with no blueprint says so. |
| `::: docs` | "The paperwork". A list of `- title | file.pdf | purpose | date · pages` lines, shown as cover cards that open the PDF. The PDF and its cover (`file.jpg`, same name) live in `storefront/case-studies/<slug>/docs/`; the build fails if either is missing. |

Every case study has both a `plain` and a `technical` version; the page shows one at a time with a switch.
Anything outside the two versions (usually the screenshots) shows under both.

## The paperwork (documents)

A case study shows documents in one of two ways (Kyle, 2026-11-15):

- **The client's own documents, redacted.** Proposals, addenda and reports the client received, as sent,
  with the client's name, people, places, contact details, order numbers and prices removed. Redaction is
  real: the words are deleted from the PDF, not covered, the client's logo image is removed, metadata is
  cleared, and every page carries a "Redacted copy" line. Each page is checked by eye before it ships.
  Made with `redact_pdf.py` in Drive "07 Case Studies / _tools". **The list of redacted words names the client,
  so it lives only in that case's Drive folder (`04 Documents`), never in this repo.** The unredacted
  originals stay there too.
- **A branded summary**, where the client's documents aren't ours to show. Made from the case study's own
  Markdown with `scripts/case-study-pdf.py` and the Plumbline PDF toolkit, so it can't say anything the page
  doesn't. Rebuild it whenever the page's text changes:
  `cd ../plumbline-pdf-toolkit && PYTHONPATH=. python ../plumbline/scripts/case-study-pdf.py <slug>`.

The cover image is a small JPG of the first page that says something (for redacted documents, page 2,
since page 1 is a near-empty cover).

## Rules the content keeps

- Only what the source shows. If the source doesn't show it, the page says "Unknown".
- Work by others is credited to them, in a `note`.
- No real personal data in screenshots: fake demo data only. Without sign-off, the client's name, logo,
  domain and phone are blurred in every screenshot and absent from the text.
- Nothing is published in Kyle's name without his tap: a change to `visibility` or `client_name` is a commit
  Kyle makes or approves.
