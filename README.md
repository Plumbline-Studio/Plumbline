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

**Deploy.** Merge to `main`. The Cloudflare Worker `plumbline-storefront` (see `wrangler.toml`) is Git-connected and redeploys on every push to `main`, serving `storefront/` as the site root for plumblinestudio.dev and www. Files outside `storefront/` (this README, the portfolio PWA) are not served by it. There are no preview deploys for pull requests yet.

**Roll back.** Revert the bad commit on `main` (`git revert <sha>` in a pull request, or the Revert button on the merged PR) and merge it; Cloudflare redeploys the previous files. *Not yet tried on this repo.*

---

## Portfolio (PWA)

The repo also contains the original single-page, installable portfolio for Plumbline. Static files only — no build step.

### Files (keep this structure)

```
.
├── index.html
├── manifest.webmanifest
├── sw.js
├── .nojekyll
└── icons/
    ├── icon-192.png
    ├── icon-512.png
    ├── icon-192-maskable.png
    ├── icon-512-maskable.png
    ├── apple-touch-icon.png
    └── favicon.png
```

All paths in the site are relative, so it works at a project URL
(`https://<user>.github.io/<repo>/`) without any edits.

### Updating later

The service worker caches the site for offline use. When you change any file,
bump the cache name in `sw.js` (`const CACHE = 'plumbline-v1'` → `'plumbline-v2'`)
so returning visitors get the new version instead of the cached one.

### Historical notes

The original GitHub Pages deploy instructions and the `plumbline.studio` custom-domain
DNS records that used to live here are superseded: the studio's domain is
**plumblinestudio.dev**, DNS is on Cloudflare, and the storefront deploys from this
repo automatically. See the git history of this file if you ever need the old steps.

---

Plumbline · Build it true.
