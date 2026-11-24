#!/usr/bin/env node
// Builds /resources from storefront/content/resources/*.md (contract in docs/resources.md).
// Same shape as build-case-studies.mjs: no dependencies, no build step on deploy. The generated
// pages are committed, and CI runs this with --check so content and pages never drift apart.
//
//   node scripts/build-resources.mjs          write the pages
//   node scripts/build-resources.mjs --check  fail if a committed page is out of date
//
// Writes: /resources/ (the list, or a friendly "coming soon" while there are no articles),
// /resources/<slug>/ (one article each, with share links and a "run the example" box),
// /resources/feed.xml (RSS), and the resources blocks in sitemap.xml and llms.txt.
// Share links are plain links to each network's own share page. No tracking script, no cookie.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = path.join(ROOT, 'storefront');
const CONTENT = path.join(SITE, 'content', 'resources');
const OUT = path.join(SITE, 'resources');
const ORIGIN = 'https://plumblinestudio.dev';
const EXAMPLES = 'https://github.com/Plumbline-Studio/clean-code-examples';
const CHECK = process.argv.includes('--check');

const VISIBILITY = ['public', 'unlisted'];
const REQUIRED = ['title', 'summary', 'date', 'visibility'];

// Coming next, shown on the empty list so a visitor knows what the page is for. Topics only:
// each becomes an article once its change is finished and measured, never before.
const COMING = [
  ['Every fix becomes a check', 'When a mistake is fixed once, a small test makes sure it never comes back.'],
  ['Green means green', 'One command says "ready" or "not ready," and it means the same thing on every machine.'],
  ['Approve from pictures, not code', 'Every screen change comes with before and after pictures, so you can say yes without reading code.'],
];

// ---------- front matter: flat `key: value` and `key: [a, b]` ----------
function parseFrontMatter(text, file) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) fail(file, 'no front matter');
  const data = {};
  for (const raw of m[1].split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const kv = /^([a-z_]+):\s*(.*)$/.exec(raw);
    if (!kv) fail(file, `front matter line not understood: "${raw}"`);
    const [, key, value] = kv;
    data[key] = /^\[.*\]$/.test(value)
      ? value.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter(Boolean)
      : unquote(value);
  }
  return { data, body: text.slice(m[0].length) };
}
const unquote = (s) => s.replace(/^(["'])(.*)\1$/, '$2');

function fail(file, msg) {
  console.error(`resources: ${path.relative(ROOT, file)}: ${msg}`);
  process.exit(1);
}

function validate(a, file) {
  for (const k of REQUIRED) if (a[k] === undefined || a[k] === '') fail(file, `missing "${k}"`);
  if (!VISIBILITY.includes(a.visibility)) fail(file, `visibility must be ${VISIBILITY.join(' or ')}; an unfinished article waits in Drive (12 Clean Code / 03 Articles)`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(a.date)) fail(file, 'date must be YYYY-MM-DD');
  if (!/^[a-z0-9-]+$/.test(a.slug)) fail(file, 'file name must be a lowercase slug');
  if (a.code && !a.code.startsWith(EXAMPLES + '/')) fail(file, `code must link into ${EXAMPLES} (the public examples repo)`);
  if (a.og && !fs.existsSync(path.join(SITE, a.og))) fail(file, `og picture ${a.og} does not exist`);
}

// ---------- a small markdown renderer ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
}
const slugify = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

// Blocks: ## / ### headings, paragraphs, "- " and "1. " lists, images on their own line
// (![alt](src "caption")), and ``` code fences (with an optional language).
function render(md, slug) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = [];
  let para = [], list = null, code = null;
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => {
    if (!list) return;
    const tag = list.ordered ? 'ol' : 'ul class="diamond"';
    out.push(`<${tag}>${list.items.map((li) => `<li>${inline(li)}</li>`).join('')}</${list.ordered ? 'ol' : 'ul'}>`);
    list = null;
  };
  const flush = () => { flushPara(); flushList(); };
  for (const line of lines) {
    if (code) {
      if (line.trim() === '```') { out.push(`<pre class="code"${code.lang ? ` data-lang="${esc(code.lang)}"` : ''}><code>${esc(code.lines.join('\n'))}</code></pre>`); code = null; }
      else code.lines.push(line);
      continue;
    }
    const t = line.trim();
    let m;
    if ((m = /^```\s*([a-z0-9+-]*)\s*$/i.exec(t))) { flush(); code = { lang: m[1], lines: [] }; continue; }
    if (!t) { flush(); continue; }
    if ((m = /^(#{2,3})\s+(.*)$/.exec(t))) {
      flush();
      const level = m[1].length;
      out.push(`<h${level}${level === 2 ? ` id="${slugify(m[2])}"` : ''}>${inline(m[2])}</h${level}>`);
      if (level === 2) out.push('<hr class="rule">');
      continue;
    }
    if ((m = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(t))) {
      flush();
      out.push(`<figure><a class="shot" href="${m[2]}"><img src="${m[2]}" alt="${esc(m[1])}" loading="lazy"></a>${m[3] ? `<figcaption>${inline(m[3])}</figcaption>` : ''}</figure>`);
      continue;
    }
    if ((m = /^(-|\d+\.)\s+(.*)$/.exec(t))) {
      flushPara();
      const ordered = m[1] !== '-';
      if (list && list.ordered !== ordered) flushList();
      (list ||= { ordered, items: [] }).items.push(m[2]);
      continue;
    }
    flushList();
    para.push(t);
  }
  if (code) throw new Error(`${slug}: unclosed code fence`);
  flush();
  return out.join('\n');
}

// ---------- share links ----------
// The link a reader shares carries where it was shared from, so the studio can see which
// network brings people back. Plain query tags on our own URL; nothing is sent anywhere by us.
const tagged = (url, source, campaign) => `${url}?utm_source=${source}&utm_medium=share&utm_campaign=${campaign}`;
const enc = encodeURIComponent;
function shareBar(a, url) {
  const t = (s) => tagged(url, s, a.slug);
  const links = [
    ['LinkedIn', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(t('linkedin'))}`],
    ['X', `https://x.com/intent/post?text=${enc(a.title)}&url=${enc(t('x'))}`],
    ['Facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(t('facebook'))}`],
    ['Email', `mailto:?subject=${enc(a.title)}&body=${enc(`${a.summary}\n\n${t('email')}`)}`],
  ];
  return `<div class="share" aria-label="Share this article">
    <span class="share-label">Share it</span>
    ${links.map(([n, h]) => `<a class="share-btn" href="${esc(h)}"${n === 'Email' ? '' : ' target="_blank" rel="noopener"'}>${n}</a>`).join('\n    ')}
    <button type="button" class="share-btn" data-copy="${esc(t('link'))}">Copy link</button>
  </div>`;
}

// ---------- page shell (the same header and footer as /case-studies) ----------
const fmtDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
const ICONS = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#2c1f33">`;
const ORG = { '@type': 'ProfessionalService', '@id': ORIGIN + '/#studio', name: 'Plumbline Studio', url: ORIGIN + '/' };
const crumbs = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })) });
const DEFAULT_OG = '/og/resources.png';

function head({ title, description, canonical, noindex, image, type, jsonld }) {
  const img = ORIGIN + (image || DEFAULT_OG);
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<link rel="alternate" type="application/rss+xml" title="Plumbline Studio resources" href="${ORIGIN}/resources/feed.xml">
<meta property="og:site_name" content="Plumbline Studio">
<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="${type}">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${img}">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<meta name="twitter:title" content="${esc(title)}">
<meta name="twitter:description" content="${esc(description)}">
<meta name="twitter:image" content="${img}">
${ICONS}
<script type="application/ld+json">
${JSON.stringify(jsonld, null, 1)}
</script>
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/case-studies.css">
<link rel="stylesheet" href="/css/resources.css">
</head>
<body>
<header class="top wide">
  <a class="brand" href="/">Plumbline <b>Studio</b></a>
  <a class="book" href="https://calendly.com/plumblinestudio/30min">Book a call</a><nav class="links" aria-label="Site"><a href="https://orchestrator.plumblinestudio.dev/?eos=on">Orchestrator</a><a href="/about/">About</a><a href="/partners/">How we work</a><a href="/case-studies/">Proof</a><a href="/resources/" aria-current="page">Resources</a><a href="https://clients.plumblinestudio.dev/">Sign in</a></nav>
</header>`;
}

const FOOT = `<footer>
  <span class="bob" aria-hidden="true"></span>
  <p class="tag">Build it true.</p>
  <p>Plumbline Studio LLC · Roanoke, Virginia · <a href="mailto:kyle@plumblinestudio.dev">kyle@plumblinestudio.dev</a> · <a href="/resources/feed.xml">RSS</a> · <a href="/trust/">Trust</a></p>
</footer>`;

const CTA = `<section class="ctaband">
  <h2>Want this in your own shop?</h2>
  <a class="cta" href="https://calendly.com/plumblinestudio/30min">Book the free 30-minute scoping call</a>
</section>`;

function articlePage(a) {
  const url = `${ORIGIN}/resources/${a.slug}/`;
  const html = render(a.body, a.slug);
  const tags = (a.tags || []).map((t) => `<span class="pill">${esc(t)}</span>`).join('');
  const run = a.code ? `  <aside class="runbox" aria-label="Run the example">
    <p class="eyebrow">Try it yourself</p>
    <p>The example for this article is small and runs on your own computer. No account needed.</p>
${a.run ? `    <pre class="code"><code>${esc(a.run)}</code></pre>\n` : ''}    <a class="cta" href="${a.code}" target="_blank" rel="noopener">See the code on GitHub</a>
  </aside>` : '';
  return `${head({ title: `${a.title} — Plumbline Studio`, description: a.summary, canonical: url, noindex: a.visibility === 'unlisted', image: a.og, type: 'article', jsonld: { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: a.title, description: a.summary, url, datePublished: a.date, image: ORIGIN + (a.og || DEFAULT_OG),
      author: { '@type': 'Person', name: 'Kyle Knight', url: ORIGIN + '/#kyle' }, publisher: ORG },
    crumbs([['Home', ORIGIN + '/'], ['Resources', ORIGIN + '/resources/'], [a.title, url]]),
  ] } })}
<main class="wrap case article">
  <div class="plumb" aria-hidden="true"><div class="line"></div><div class="bob"></div></div>
  <a class="back" href="/resources/">← All resources</a>
  <header class="case-head">
    <p class="eyebrow">Resources · ${fmtDate(a.date)}</p>
    <h1>${esc(a.title)}</h1>
    <p class="lede">${esc(a.summary)}</p>
    ${tags ? `<span class="pills">${tags}</span>` : ''}
  </header>
  ${shareBar(a, url)}
  <article class="body">
${html}
  </article>
${run}
  ${shareBar(a, url)}
  <p class="source"><a href="/content/resources/${a.slug}.md">Get this article as Markdown</a>.</p>
${CTA}
</main>
${FOOT}
<script src="/resources/share.js" defer></script>
</body>
</html>
`;
}

function indexPage(list) {
  const cards = list.map((a) => `  <a class="card" href="/resources/${a.slug}/">
    <span class="cbody">
      <span class="client">${fmtDate(a.date)}</span>
      <h2>${esc(a.title)}</h2>
      <p>${esc(a.summary)}</p>
      <span class="pills">${a.code ? '<span class="pill k">Runnable example</span>' : ''}${(a.tags || []).map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</span>
    </span>
  </a>`).join('\n');
  const empty = `  <section class="soon" aria-label="Coming soon">
    <p class="eyebrow">Coming soon</p>
    <h2>The first articles are being written now</h2>
    <p>Each one tells a real change to how we build: what went wrong, what we changed, and what the numbers said after. Every article links to a small example you can run.</p>
    <ol class="next">
${COMING.map(([t, s]) => `      <li><b>${esc(t)}</b><span>${esc(s)}</span></li>`).join('\n')}
    </ol>
    <p class="muted-note">Want to know when the first one is out? <a href="/resources/feed.xml">Follow the RSS feed</a>, or watch the <a href="${EXAMPLES}">examples on GitHub</a>.</p>
  </section>`;
  return `${head({ title: 'Resources — Plumbline Studio', description: 'How we build software you can trust: short articles, each with a small example you can run and a link to the code.', canonical: `${ORIGIN}/resources/`, type: 'website', jsonld: { '@context': 'https://schema.org', '@graph': [{ '@type': 'CollectionPage', name: 'Resources', url: `${ORIGIN}/resources/`, publisher: ORG }, crumbs([['Home', ORIGIN + '/'], ['Resources', `${ORIGIN}/resources/`]])] } })}
<main class="wide index">
  <div class="plumb" aria-hidden="true"><div class="line"></div><div class="bob"></div></div>
  <header class="index-head">
    <p class="eyebrow">Resources</p>
    <h1>How we build it true</h1>
    <p class="lede">Short articles on making software you can trust. Each one comes with a small example you can run yourself, and a link to the code.</p>
  </header>
${list.length ? `  <div class="grid">\n${cards}\n  </div>` : empty}
${CTA}
</main>
${FOOT}
</body>
</html>
`;
}

function feed(list) {
  const items = list.map((a) => `  <item>
    <title>${esc(a.title)}</title>
    <link>${ORIGIN}/resources/${a.slug}/</link>
    <guid isPermaLink="true">${ORIGIN}/resources/${a.slug}/</guid>
    <pubDate>${new Date(a.date + 'T12:00:00Z').toUTCString()}</pubDate>
    <description>${esc(a.summary)}</description>
  </item>`).join('\n');
  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>Plumbline Studio resources</title>
  <link>${ORIGIN}/resources/</link>
  <atom:link href="${ORIGIN}/resources/feed.xml" rel="self" type="application/rss+xml"/>
  <description>How we build software you can trust, with examples you can run.</description>
  <language>en-us</language>
${items}
</channel>
</rss>
`;
}

function replaceBlock(text, name, block, file) {
  const re = new RegExp(`(<!-- ${name}:start[^>]*-->)[\\s\\S]*?([ \\t]*<!-- ${name}:end -->)`);
  if (!re.test(text)) fail(file, `missing the ${name}:start / ${name}:end markers`);
  return text.replace(re, `$1\n${block}\n$2`);
}

// ---------- build ----------
const files = fs.existsSync(CONTENT) ? fs.readdirSync(CONTENT).filter((f) => f.endsWith('.md')).sort() : [];
const all = files.map((f) => {
  const file = path.join(CONTENT, f);
  const { data, body } = parseFrontMatter(fs.readFileSync(file, 'utf8'), file);
  const a = { ...data, slug: f.replace(/\.md$/, ''), body };
  validate(a, file);
  return a;
});
const newest = (x, y) => y.date.localeCompare(x.date) || x.slug.localeCompare(y.slug);
const pub = all.filter((a) => a.visibility === 'public').sort(newest);

const outputs = new Map();
outputs.set(path.join(OUT, 'index.html'), indexPage(pub));
outputs.set(path.join(OUT, 'feed.xml'), feed(pub));
for (const a of all) outputs.set(path.join(OUT, a.slug, 'index.html'), articlePage(a));

const sitemapFile = path.join(SITE, 'sitemap.xml');
outputs.set(sitemapFile, replaceBlock(fs.readFileSync(sitemapFile, 'utf8'), 'resources',
  [`  <url><loc>${ORIGIN}/resources/</loc></url>`].concat(pub.map((a) => `  <url><loc>${ORIGIN}/resources/${a.slug}/</loc><lastmod>${a.date}</lastmod></url>`)).join('\n'), sitemapFile));

const llmsFile = path.join(SITE, 'llms.txt');
outputs.set(llmsFile, replaceBlock(fs.readFileSync(llmsFile, 'utf8'), 'resources',
  ['## Resources', '', `How we build, with runnable examples: ${ORIGIN}/resources/ (RSS: ${ORIGIN}/resources/feed.xml). Example code: ${EXAMPLES}`]
    .concat(pub.length ? pub.map((a) => `- ${a.title}: ${a.summary} ${ORIGIN}/resources/${a.slug}/ — Markdown: ${ORIGIN}/content/resources/${a.slug}.md`) : ['- No articles yet. The first is on the way.']).join('\n'), llmsFile));

// A folder for an article that no longer exists in content is stale: --check flags it, a build removes it.
const keep = new Set(all.map((a) => a.slug));
const stale = fs.existsSync(OUT) ? fs.readdirSync(OUT, { withFileTypes: true })
  .filter((d) => d.isDirectory() && !keep.has(d.name) && fs.existsSync(path.join(OUT, d.name, 'index.html')))
  .map((d) => path.join(OUT, d.name)) : [];

let drift = 0;
for (const [file, text] of outputs) {
  const now = fs.existsSync(file) ? fs.readFileSync(file, 'utf8') : null;
  if (now === text) continue;
  drift++;
  if (CHECK) console.error(`out of date: ${path.relative(ROOT, file)}`);
  else { fs.mkdirSync(path.dirname(file), { recursive: true }); fs.writeFileSync(file, text); }
}
for (const file of stale) {
  drift++;
  if (CHECK) console.error(`stale resources folder with no content: ${path.relative(ROOT, file)}`);
  else fs.rmSync(file, { recursive: true });
}
if (CHECK && drift) { console.error('Run: node scripts/build-resources.mjs'); process.exit(1); }
console.log(`resources: ${all.length} built (${pub.length} public, ${all.length - pub.length} unlisted)${CHECK ? ', all up to date' : `, ${drift} file(s) written`}`);
