#!/usr/bin/env node
// Builds /case-studies from storefront/content/case-studies/*.md (PLU-720, contract in
// docs/case-studies.md). No dependencies and no build step on deploy: the generated HTML is
// committed, and CI runs this with --check so content and pages can never drift apart.
//
//   node scripts/build-case-studies.mjs          write the pages
//   node scripts/build-case-studies.mjs --check  fail if a committed page is out of date
//
// It refuses content that breaks the contract: a visibility other than public or unlisted
// (there is no hidden state; an unfinished draft waits in Drive), or a client name without
// recorded sign-off.

import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(path.dirname(new URL(import.meta.url).pathname), '..');
const SITE = path.join(ROOT, 'storefront');
const CONTENT = path.join(SITE, 'content', 'case-studies');
const OUT = path.join(SITE, 'case-studies');
const ORIGIN = 'https://plumblinestudio.dev';
const CHECK = process.argv.includes('--check');

const VISIBILITY = ['public', 'unlisted'];
const REQUIRED = ['title', 'summary', 'client', 'visibility', 'date', 'role', 'stack', 'order'];

// ---------- front matter: flat `key: value`, `key: [a, b]` and `- item` lists ----------
function parseFrontMatter(text, file) {
  const m = /^---\n([\s\S]*?)\n---\n?/.exec(text);
  if (!m) fail(file, 'no front matter');
  const data = {};
  let listKey = null;
  for (const raw of m[1].split('\n')) {
    if (!raw.trim() || raw.trim().startsWith('#')) continue;
    const item = /^\s+-\s+(.*)$/.exec(raw);
    if (item && listKey) { data[listKey].push(unquote(item[1])); continue; }
    const kv = /^([a-z_]+):\s*(.*)$/.exec(raw);
    if (!kv) fail(file, `front matter line not understood: "${raw}"`);
    const [, key, value] = kv;
    if (value === '') { data[key] = []; listKey = key; continue; }
    listKey = null;
    if (/^\[.*\]$/.test(value)) data[key] = value.slice(1, -1).split(',').map((s) => unquote(s.trim())).filter(Boolean);
    else data[key] = unquote(value);
  }
  return { data, body: text.slice(m[0].length) };
}
const unquote = (s) => s.replace(/^(["'])(.*)\1$/, '$2');

function fail(file, msg) {
  console.error(`case studies: ${path.relative(ROOT, file)}: ${msg}`);
  process.exit(1);
}

function validate(cs, file) {
  for (const k of REQUIRED) if (cs[k] === undefined || cs[k] === '') fail(file, `missing "${k}"`);
  if (!VISIBILITY.includes(cs.visibility)) {
    fail(file, `visibility must be ${VISIBILITY.join(' or ')}; there is no hidden state; an unfinished draft waits in Drive (18 Plumbline / 07 Case Studies) until it is ready`);
  }
  if (cs.client_name && !(cs.signoff_by && cs.signoff_date)) {
    fail(file, 'client_name needs signoff_by and signoff_date (no client is named without recorded sign-off)');
  }
  if (!/^\d{4}-\d{2}-\d{2}$/.test(cs.date)) fail(file, 'date must be YYYY-MM-DD');
  if (!/^[a-z0-9-]+$/.test(cs.slug)) fail(file, 'file name must be a lowercase slug');
}

// ---------- a small markdown renderer: the subset the contract allows ----------
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
}

// Blocks: ## / ### headings, paragraphs, "- " lists, images on their own line
// (![alt](src "caption")), and ::: fences (plain, technical, ba, facts, note).
function render(md, slug) {
  const lines = md.replace(/\r/g, '').split('\n');
  const out = [];
  let para = [], list = null, fence = [];
  const flushPara = () => { if (para.length) { out.push(`<p>${inline(para.join(' '))}</p>`); para = []; } };
  const flushList = () => {
    if (!list) return;
    if (fence[fence.length - 1] === 'facts') {
      // The ::: facts fence is the wrapper; the list becomes its tiles.
      out.push(list.map((li) => {
        const [v, ...rest] = li.split('|');
        const val = v.trim();
        return `<div class="fact"><b${/^unknown$/i.test(val) ? ' class="u"' : ''}>${inline(val)}</b><span>${inline(rest.join('|').trim())}</span></div>`;
      }).join(''));
    } else {
      out.push('<ul class="diamond">' + list.map((li) => `<li>${inline(li)}</li>`).join('') + '</ul>');
    }
    list = null;
  };
  const flush = () => { flushPara(); flushList(); };
  for (const line of lines) {
    const t = line.trim();
    const open = /^:::\s*(plain|technical|ba|facts|note)\s*$/.exec(t);
    if (open) {
      flush();
      const kind = open[1];
      fence.push(kind);
      if (kind === 'plain' || kind === 'technical') out.push(`<div class="version" data-version="${kind}">`);
      else out.push(`<div class="${kind}">`);
      continue;
    }
    if (t === ':::') {
      flush();
      if (!fence.length) throw new Error(`${slug}: closing ::: without an opening fence`);
      // A "ba" fence also closes its last open side (Before or After).
      if (fence.pop() === 'ba' && out[out.length - 1] !== '<div class="ba">') out.push('</div>');
      out.push('</div>');
      continue;
    }
    if (!t) { flush(); continue; }
    let m;
    if ((m = /^(#{2,3})\s+(.*)$/.exec(t))) {
      flush();
      const level = m[1].length;
      const inBA = fence[fence.length - 1] === 'ba';
      if (inBA && level === 3) {
        if (out[out.length - 1] !== '<div class="ba">') out.push('</div>');
        const side = /before/i.test(m[2]) ? 'before' : 'after';
        out.push(`<div class="${side}"><span class="lab">${inline(m[2])}</span>`);
        continue;
      }
      out.push(`<h${level}>${inline(m[2])}</h${level}>`);
      if (level === 2) out.push('<hr class="rule">');
      continue;
    }
    if ((m = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)$/.exec(t))) {
      flush();
      const cap = m[3] || '';
      out.push(`<figure><a class="shot" href="${m[2]}"><img src="${m[2]}" alt="${esc(m[1])}" loading="lazy"></a>${cap ? `<figcaption>${inline(cap)}</figcaption>` : ''}</figure>`);
      continue;
    }
    if ((m = /^-\s+(.*)$/.exec(t))) { flushPara(); (list ||= []).push(m[1]); continue; }
    flushList();
    para.push(t);
  }
  flush();
  if (fence.length) throw new Error(`${slug}: unclosed ::: ${fence.join(', ')}`);
  return out.join('\n');
}

// ---------- page shell ----------
const fmtDate = (d) => new Date(d + 'T12:00:00Z').toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });

function head({ title, description, canonical, noindex, image }) {
  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(title)}</title>
<meta name="description" content="${esc(description)}">
<link rel="canonical" href="${canonical}">
${noindex ? '<meta name="robots" content="noindex">\n' : ''}<meta property="og:title" content="${esc(title)}">
<meta property="og:description" content="${esc(description)}">
<meta property="og:type" content="article">
<meta property="og:url" content="${canonical}">
<meta property="og:image" content="${image || ORIGIN + '/og/plumbline-studio.png'}">
<meta name="twitter:card" content="summary_large_image">
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:wght@500;600&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/case-studies.css">
</head>
<body>
<header class="top wide">
  <a class="brand" href="/">Plumbline <b>Studio</b></a>
  <nav class="links" aria-label="Site"><a href="/case-studies/">Case studies</a><a href="https://clients.plumblinestudio.dev/">Client login →</a></nav>
</header>`;
}

const FOOT = `<footer>
  <span class="bob" aria-hidden="true"></span>
  <p class="tag">Build it true.</p>
  <p>Plumbline Studio · Roanoke, Virginia · <a href="mailto:kyle@plumblinestudio.dev">kyle@plumblinestudio.dev</a></p>
</footer>`;

const CTA = `<section class="ctaband">
  <h2>Got a workflow like this?</h2>
  <a class="cta" href="https://calendly.com/plumblinestudio/30min">Book the free 30-minute scoping call</a>
</section>`;

const clientLabel = (cs) => cs.client_name || cs.client;

function casePage(cs) {
  const url = `${ORIGIN}/case-studies/${cs.slug}/`;
  const html = render(cs.body, cs.slug);
  const hasPlain = html.includes('data-version="plain"');
  const hasTech = html.includes('data-version="technical"');
  const meta = [['Client', clientLabel(cs)], ['Role', cs.role], ['Landed', fmtDate(cs.date)], ['Stack', cs.stack]]
    .concat(cs.reaches ? [['Reaches', cs.reaches]] : []);
  return `${head({ title: `${cs.title} — Plumbline Studio`, description: cs.summary, canonical: url, noindex: cs.visibility === 'unlisted', image: cs.thumb ? ORIGIN + cs.thumb : null })}
<main class="wrap case">
  <a class="back" href="/case-studies/">← All case studies</a>
  <header class="case-head">
    <p class="eyebrow">${esc(clientLabel(cs))}</p>
    <h1>${esc(cs.title)}</h1>
    <p class="lede">${esc(cs.summary)}</p>
  </header>
  <dl class="meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
${hasPlain && hasTech ? `  <div class="switch" role="group" aria-label="Choose a version">
    <button type="button" data-show="plain" aria-pressed="true">Plain-language</button>
    <button type="button" data-show="technical" aria-pressed="false">Technical</button>
  </div>` : ''}
  <article class="body" data-current="plain">
${html}
  </article>
  <p class="source">${esc(cs.source || '')} <a href="/content/case-studies/${cs.slug}.md">Get this case study as Markdown</a>.</p>
${CTA}
</main>
${FOOT}
<script src="/case-studies/switch.js" defer></script>
</body>
</html>
`;
}

function indexPage(list) {
  const cards = list.map((cs) => `  <a class="card" href="/case-studies/${cs.slug}/">
    ${cs.thumb ? `<span class="thumb"><img src="${cs.thumb}" alt="" loading="lazy"></span>` : '<span class="thumb blank"><span></span></span>'}
    <span class="cbody">
      <span class="client">${esc(clientLabel(cs))}</span>
      <h2>${esc(cs.title)}</h2>
      <p>${esc(cs.summary)}</p>
      <span class="pills"><span class="pill k">For owners</span><span class="pill k">Technical</span>${(cs.tags || []).map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</span>
    </span>
  </a>`).join('\n');
  return `${head({ title: 'Case studies — Plumbline Studio', description: 'What Plumbline has built, told twice: plainly for owners, technically for the people who maintain it.', canonical: `${ORIGIN}/case-studies/` })}
<main class="wide index">
  <header class="index-head">
    <p class="eyebrow">Case studies</p>
    <h1>Real problems, taken off real desks</h1>
    <p class="lede">Each one is told twice on the same page: a plain-language version for owners, and a technical version for the people who'll maintain it.</p>
  </header>
  <div class="grid">
${cards}
  </div>
${CTA}
</main>
${FOOT}
</body>
</html>
`;
}

// Generated blocks in hand-written files sit between these markers and nothing else is touched.
function replaceBlock(text, name, block, file) {
  const re = new RegExp(`(<!-- ${name}:start[^>]*-->)[\\s\\S]*?([ \\t]*<!-- ${name}:end -->)`);
  const reTxt = new RegExp(`(# ${name}:start[^\\n]*\\n)[\\s\\S]*?(# ${name}:end)`);
  if (re.test(text)) return text.replace(re, `$1\n${block}\n$2`);
  if (reTxt.test(text)) return text.replace(reTxt, `$1${block}\n$2`);
  fail(file, `missing the ${name}:start / ${name}:end markers`);
}

// ---------- build ----------
const files = fs.readdirSync(CONTENT).filter((f) => f.endsWith('.md')).sort();
const all = files.map((f) => {
  const file = path.join(CONTENT, f);
  const { data, body } = parseFrontMatter(fs.readFileSync(file, 'utf8'), file);
  const cs = { ...data, slug: f.replace(/\.md$/, ''), body, order: Number(data.order) };
  validate(cs, file);
  return cs;
});
const pub = all.filter((cs) => cs.visibility === 'public').sort((a, b) => a.order - b.order || a.slug.localeCompare(b.slug));

const outputs = new Map();
outputs.set(path.join(OUT, 'index.html'), indexPage(pub));
for (const cs of all) outputs.set(path.join(OUT, cs.slug, 'index.html'), casePage(cs));

const sitemapFile = path.join(SITE, 'sitemap.xml');
outputs.set(sitemapFile, replaceBlock(fs.readFileSync(sitemapFile, 'utf8'), 'case-studies',
  [`  <url><loc>${ORIGIN}/case-studies/</loc></url>`].concat(pub.map((cs) => `  <url><loc>${ORIGIN}/case-studies/${cs.slug}/</loc><lastmod>${cs.date}</lastmod></url>`)).join('\n'), sitemapFile));

const llmsFile = path.join(SITE, 'llms.txt');
outputs.set(llmsFile, replaceBlock(fs.readFileSync(llmsFile, 'utf8'), 'case-studies',
  ['## Case studies', '', `All case studies: ${ORIGIN}/case-studies/`].concat(pub.map((cs) => `- ${cs.title} (${clientLabel(cs)}): ${cs.summary} ${ORIGIN}/case-studies/${cs.slug}/ — Markdown: ${ORIGIN}/content/case-studies/${cs.slug}.md`)).join('\n'), llmsFile));

const homeFile = path.join(SITE, 'index.html');
outputs.set(homeFile, replaceBlock(fs.readFileSync(homeFile, 'utf8'), 'case-studies',
  `  <div class="proof cs-proof">\n${pub.slice(0, 3).map((cs) => `    <a class="case" href="/case-studies/${cs.slug}/"><b>${esc(cs.title)}</b><p>${esc(cs.summary)}</p><span class="more">Read the case study →</span></a>`).join('\n')}\n  </div>\n  <p class="muted" style="font-size:.9rem; margin-top:14px;"><a href="/case-studies/">All case studies →</a></p>`, homeFile));

// A folder for a case study that no longer exists in content is stale, screenshots included:
// --check flags it, a build removes it, so nothing of a withdrawn case stays in this public repo.
const keep = new Set(all.map((cs) => cs.slug));
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
  if (CHECK) console.error(`stale case-study folder with no content: ${path.relative(ROOT, file)}`);
  else fs.rmSync(file, { recursive: true });
}
if (CHECK && drift) { console.error('Run: node scripts/build-case-studies.mjs'); process.exit(1); }
console.log(`case studies: ${all.length} built (${pub.length} public, ${all.length - pub.length} unlisted)${CHECK ? ', all up to date' : `, ${drift} file(s) written`}`);
