# Plumbline — portfolio (PWA)

A single-page, installable portfolio for Plumbline. Static files only — no build step.

## Files (keep this structure)

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

## Deploy to GitHub Pages

1. Create a new **public** repository (e.g. `plumbline`).
   *Pages is free on public repos; Pages from a private repo needs a paid GitHub plan.
   The published page is public either way, and there are no secrets in these files.*
2. Add all files above, keeping the folder structure (web upload or `git push`).
3. **Settings → Pages → Build and deployment → Source: "Deploy from a branch"**,
   branch `main`, folder `/ (root)`, then **Save**.
4. After ~1 minute the site is live at `https://<user>.github.io/<repo>/` over HTTPS.
5. Open it on a phone — "Add to Home Screen" installs it as an app.

`.nojekyll` is included so GitHub doesn't run Jekyll over the files.

## Updating later

The service worker caches the site for offline use. When you change any file,
bump the cache name in `sw.js` (`const CACHE = 'plumbline-v1'` → `'plumbline-v2'`)
so returning visitors get the new version instead of the cached one.

## Custom domain — plumbline.studio (when you're ready)

Launch on the `github.io` URL first; add the domain once it's registered and you can set DNS.

1. **GitHub:** Settings → Pages → Custom domain → enter `plumbline.studio` → Save.
   (This creates a `CNAME` file in the repo for you — no need to add it by hand.)
2. **DNS provider:** create the records below.
3. Allow up to 24 h for DNS to propagate, then tick **Enforce HTTPS**.

**Apex `plumbline.studio` — A records (IPv4):**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```
**Optional — AAAA records (IPv6):**
```
2606:50c0:8000::153
2606:50c0:8001::153
2606:50c0:8002::153
2606:50c0:8003::153
```
**`www` subdomain — CNAME:** `www` → `<user>.github.io`

> Don't add the custom domain in GitHub before the DNS records exist — until DNS
> resolves, the `github.io` URL will redirect to a domain that isn't live yet.
> Records verified against GitHub Pages documentation, May 2026.

---

Plumbline · Build it true.
