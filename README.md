# Plumbline

**Live storefront: [plumblinestudio.dev](https://plumblinestudio.dev)** — Plumbline Studio solves one bounded operations problem per engagement (intake, scheduling, tracking, reporting) for small businesses and professional practices. Fixed scope, 2–4 weeks. *Build it true.*

Source for the storefront lives in [`storefront/`](storefront/) (static files, no build step; deployed via a Git-connected Cloudflare Worker — every push to `main` redeploys). Agent-readable surface: [`storefront/llms.txt`](storefront/llms.txt), JSON-LD in `storefront/index.html`, `robots.txt` + `sitemap.xml`.

### Working on the storefront

**Preview it locally.** No install and no build. From the repo root:

```
python3 -m http.server 8000 --directory storefront
```

Then open http://localhost:8000. Any static file server pointed at `storefront/` works the same way.

**Checks.** `.github/workflows/ci.yml` (workflow `CI`, job `check`) runs on every pull request and on every push to `main`:
- every `.js` file parses (`node --check`);
- every `.json` and `.webmanifest` file parses;
- `storefront/sitemap.xml` is well-formed XML;
- every local `src`/`href` in an HTML page points at a file that exists;
- no obvious secrets are committed.

`ci-report.yml` then posts the result on the pull request as a `CI-RESULT: CI <result> on <sha>` comment. To run the same steps by hand, copy the `run:` blocks from `ci.yml` into a shell at the repo root (Node and Python 3 are all they need).

**Deploy.** Merge to `main`. The Git-connected Cloudflare Worker (config in `wrangler.toml`) redeploys on every push to `main`, serving `storefront/` as the site root for plumblinestudio.dev and www. Files outside `storefront/` (this README, `signature/`, `docs/`) are not served by it. Each pull request also gets a Cloudflare preview build; the Cloudflare bot comments its status and preview URLs on the PR.

**Roll back.** Revert the bad commit on `main` (`git revert <sha>` in a pull request, or the Revert button on the merged PR) and merge it; Cloudflare redeploys the previous files. *Not yet tried on this repo.*

---

## Retired: the old portfolio page

The repo root used to hold the original single-page portfolio ("Plumbline — Tools built true"), published by GitHub Pages at plumbline.toolwright.dev, with a digital business card at `/card/`. It was retired on Kyle's word (2026-10-06, PLU-386). What it held, the last commit that had it, and what is worth carrying over are in [`docs/archive/old-github-pages-page.md`](docs/archive/old-github-pages-page.md).

`signature/` stays: it is the source of Kyle's email signature, and it already points at plumblinestudio.dev.

---

Plumbline · Build it true.
