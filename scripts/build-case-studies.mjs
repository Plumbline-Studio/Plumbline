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
// A screenshot figure. With a live URL it opens the real site in a new tab, and the caption says so.
function shot(src, alt, cap, live, cls) {
  const host = live ? new URL(live).hostname.replace(/^www\./, '') : '';
  const href = live || src;
  const ext = live ? ' target="_blank" rel="noopener"' : '';
  const note = live ? `<a href="${live}"${ext}>Visit ${host} ↗</a>` : '';
  const caption = [cap ? inline(cap) : '', note].filter(Boolean).join(' ');
  return `<figure${cls ? ` class="${cls}"` : ''}><a class="shot" href="${href}"${ext}><img src="${src}" alt="${esc(alt)}" loading="lazy"></a>${caption ? `<figcaption>${caption}</figcaption>` : ''}</figure>`;
}

function inline(s) {
  return esc(s)
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\[([^\]]+)\]\(([^)\s]+)\)/g, (_, t, u) => `<a href="${u}">${t}</a>`);
}

// Blocks: ## / ### headings, paragraphs, "- " lists, images on their own line
// (![alt](src "caption")), and ::: fences (plain, technical, ba, facts, note, docs, blueprint).
// A ::: docs list item is "title | file.pdf | purpose | meta"; the PDF and its cover
// (same name, .jpg) live in storefront/case-studies/<slug>/docs/ and must exist.
function render(md, slug, lead) {
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
    } else if (fence[fence.length - 1] === 'blueprint') {
      // "met|open|parked | date | condition | note": one agreed condition of done. Parked = set aside on purpose by the owner of the work, not failed.
      out.push('<ol class="conds">' + list.map((li) => {
        const [state, date, cond, note] = li.split('|').map((x) => (x || '').trim());
        if (!/^(met|open|parked)$/i.test(state)) throw new Error(`${slug}: blueprint item must start with met, open or parked: "${li}"`);
        const st = state.toLowerCase(), met = st === 'met';
        const label = { met: 'Met', open: 'Open', parked: 'Parked' }[st];
        return `<li class="${st}"><span class="state">${label}${date ? ' · ' + inline(date) : ''}</span>`
          + `<span class="cond">${inline(cond)}</span>${note ? `<span class="cnote">${inline(note)}</span>` : ''}</li>`;
      }).join('') + '</ol>');
    } else if (fence[fence.length - 1] === 'docs') {
      out.push(list.map((li) => {
        const [title, file, purpose, meta] = li.split('|').map((x) => (x || '').trim());
        if (!/^[a-z0-9-]+\.pdf$/.test(file)) throw new Error(`${slug}: docs item "${title}" needs a file like name.pdf`);
        const base = `/case-studies/${slug}/docs/`;
        for (const f of [file, file.replace(/\.pdf$/, '.jpg')]) {
          if (!fs.existsSync(path.join(ROOT, 'storefront', base, f))) throw new Error(`${slug}: missing ${base}${f}`);
        }
        return `<a class="doc" href="${base}${file}"><span class="cover"><img src="${base}${file.replace(/\.pdf$/, '.jpg')}" alt="" loading="lazy"></span>`
          + `<span class="dbody"><b>${inline(title)}</b><span>${inline(purpose)}</span><span class="dmeta">${inline(meta)} · Open PDF</span></span></a>`;
      }).join(''));
    } else {
      out.push('<ul class="diamond">' + list.map((li) => `<li>${inline(li)}</li>`).join('') + '</ul>');
    }
    list = null;
  };
  const flush = () => { flushPara(); flushList(); };
  for (const line of lines) {
    const t = line.trim();
    const open = /^:::\s*(plain|technical|ba|facts|note|docs|blueprint)\s*$/.exec(t);
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
      // Headings outside the plain/technical versions get an id, so the page can list and link them.
      const inVersion = fence.includes('plain') || fence.includes('technical');
      const id = level === 2 && !inVersion ? ` id="${m[2].toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')}"` : '';
      out.push(`<h${level}${id}>${inline(m[2])}</h${level}>`);
      if (level === 2) out.push('<hr class="rule">');
      continue;
    }
    // ![alt](src "caption") -> https://live.site   The optional "-> url" makes the image open the live site instead of the screenshot.
    if ((m = /^!\[([^\]]*)\]\(([^)\s]+)(?:\s+"([^"]*)")?\)(?:\s*->\s*(https:\/\/\S+))?$/.exec(t))) {
      flush();
      // The lead screenshot already shows this image at the top: hand it the caption and link, and don't repeat it here.
      if (lead && lead.show && m[2] === lead.src) { lead.cap = m[3] || ''; lead.live = m[4] || lead.live; continue; }
      out.push(shot(m[2], m[1], m[3] || '', m[4]));
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

// Icons and theme colour, the same on every page (favicon.svg is the plumb bob on plum).
const ICONS = `<link rel="icon" href="/favicon.ico" sizes="48x48">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="apple-touch-icon" href="/apple-touch-icon.png">
<link rel="manifest" href="/site.webmanifest">
<meta name="theme-color" content="#2c1f33">`;

// Structured data: who publishes these pages, and where each one sits.
const ORG = { '@type': 'ProfessionalService', '@id': ORIGIN + '/#studio', name: 'Plumbline Studio', url: ORIGIN + '/' };
const crumbs = (items) => ({ '@type': 'BreadcrumbList', itemListElement: items.map(([name, url], i) => ({ '@type': 'ListItem', position: i + 1, name, item: url })) });

function head({ title, description, canonical, noindex, image, jsonld }) {
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
<meta name="twitter:image" content="${image || ORIGIN + '/og/plumbline-studio.png'}">
${ICONS}
${jsonld ? `<script type="application/ld+json">\n${JSON.stringify(jsonld, null, 1)}\n</script>\n` : ''}<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,500;0,600;1,500&family=Inter:wght@400;500;600&family=JetBrains+Mono:wght@400&display=swap" rel="stylesheet">
<link rel="stylesheet" href="/css/tokens.css">
<link rel="stylesheet" href="/css/site.css">
<link rel="stylesheet" href="/css/case-studies.css">
</head>
<body>
<header class="top wide">
  <a class="brand" href="/">Plumbline <b>Studio</b></a>
  <a class="book" href="https://calendly.com/plumblinestudio/30min">Book a call</a><nav class="links" aria-label="Site"><a href="/about/">About</a><a href="/partners/">How we work</a><a href="/trust/">Trust</a><a href="/case-studies/" aria-current="page">Proof</a><a href="https://clients.plumblinestudio.dev/">Sign in</a></nav>
</header>`;
}

const FOOT = `<footer>
  <span class="bob" aria-hidden="true"></span>
  <p class="tag">Build it true.</p>
  <p>Plumbline Studio LLC · Roanoke, Virginia · <a href="mailto:kyle@plumblinestudio.dev">kyle@plumblinestudio.dev</a></p>
</footer>`;

const CTA = `<section class="ctaband">
  <h2>Got a workflow like this?</h2>
  <a class="cta" href="https://calendly.com/plumblinestudio/30min">Book the free 30-minute scoping call</a>
</section>`;

const clientLabel = (cs) => cs.client_name || cs.client;

// A series is an umbrella case study plus the case studies whose `series:` names it. The umbrella
// tells how the parts fit; each part stays a whole case study and links back to its siblings.
function seriesCard(cs) {
  return `<a class="part" href="/case-studies/${cs.slug}/"><b>${esc(cs.title)}</b><span>${esc(cs.summary)}</span></a>`;
}

function seriesBlock(cs) {
  if (cs.members && cs.members.length) {
    return `  <section class="series"><h2>In this series</h2><hr class="rule"><div class="parts">${cs.members.map(seriesCard).join('')}</div></section>`;
  }
  if (cs.parent) {
    const others = cs.parent.members.filter((m) => m.slug !== cs.slug);
    return `  <section class="series"><h2>The rest of the series</h2><hr class="rule"><p>Part of <a href="/case-studies/${cs.parent.slug}/">${esc(cs.parent.title)}</a>.</p>${others.length ? `<div class="parts">${others.map(seriesCard).join('')}</div>` : ''}</section>`;
  }
  return '';
}

// The first facts on the page, shown up top as a quick read. Nothing new is claimed: these are the
// same tiles the technical version shows further down. "Unknown" tiles are skipped here, not hidden there.
function glance(cs) {
  const m = /^:::\s*facts\s*\n([\s\S]*?)\n:::/m.exec(cs.body);
  if (!m) return '';
  const tiles = m[1].split('\n').map((l) => /^-\s+(.*)$/.exec(l.trim())).filter(Boolean).map((x) => x[1].split('|'))
    .filter(([v]) => !/^unknown$/i.test(v.trim())).slice(0, 3);
  if (!tiles.length) return '';
  return `  <div class="glance" aria-label="At a glance">${tiles.map(([v, ...r]) => `<div class="fact"><b>${inline(v.trim())}</b><span>${inline(r.join('|').trim())}</span></div>`).join('')}</div>`;
}

function casePage(cs) {
  const url = `${ORIGIN}/case-studies/${cs.slug}/`;
  // One picture, shown once. If the lead image is also the only image in the story, it stays in the story and the top goes without.
  const bodyImgs = [...cs.body.matchAll(/^!\[[^\]]*\]\(([^)\s]+)/gm)].map((x) => x[1]);
  const lead = { src: cs.thumb, live: cs.thumb_link, cap: '', show: !!cs.thumb && !(bodyImgs.length === 1 && bodyImgs[0] === cs.thumb) };
  const html = render(cs.body, cs.slug, lead);
  const hasPlain = html.includes('data-version="plain"');
  const hasTech = html.includes('data-version="technical"');
  const signoff = cs.client_name ? `Named. Sign-off: ${cs.signoff_by}, ${fmtDate(cs.signoff_date)}` : 'Anonymized until the client signs off';
  const meta = [['Client', clientLabel(cs)], ['Role', cs.role], ['Landed', fmtDate(cs.date)], ['Stack', cs.stack]]
    .concat(cs.reaches ? [['Reaches', cs.reaches]] : []).concat([['Naming', signoff]]);
  const toc = [['the-story', 'The story']].concat([...html.matchAll(/<h2 id="([^"]+)">(.*?)<\/h2>/g)].map((x) => [x[1], x[2].replace(/<[^>]+>/g, '')]));
  return `${head({ title: `${cs.title} — Plumbline Studio`, description: cs.summary, canonical: url, noindex: cs.visibility === 'unlisted', image: (cs.og || cs.thumb) ? ORIGIN + (cs.og || cs.thumb) : null, jsonld: { '@context': 'https://schema.org', '@graph': [
    { '@type': 'Article', headline: cs.title, description: cs.summary, url, datePublished: cs.date, image: cs.thumb ? ORIGIN + cs.thumb : undefined,
      author: { '@type': 'Person', name: 'Kyle Knight', url: ORIGIN + '/#kyle' }, publisher: ORG, about: clientLabel(cs) },
    crumbs([['Home', ORIGIN + '/'], ['Case studies', ORIGIN + '/case-studies/']].concat(cs.parent ? [[cs.parent.title, `${ORIGIN}/case-studies/${cs.parent.slug}/`]] : []).concat([[cs.title, url]])),
  ] } })}
<main class="wrap case">
  <div class="plumb" aria-hidden="true"><div class="line"></div><div class="bob"></div></div>
  <a class="back" href="/case-studies/">← All case studies</a>${cs.parent ? `
  <p class="back">Part of the series <a href="/case-studies/${cs.parent.slug}/">${esc(cs.parent.title)}</a></p>` : ''}
  <header class="case-head">
    <p class="eyebrow">${esc(clientLabel(cs))}</p>
    <h1>${esc(cs.title)}</h1>
    <p class="lede">${esc(cs.summary)}</p>
  </header>
${hasPlain && hasTech ? `  <div class="switch" role="group" aria-label="Choose a version">
    <span class="switch-label">Read it as</span>
    <button type="button" data-show="plain" aria-pressed="true">Plain-language</button>
    <button type="button" data-show="technical" aria-pressed="false">Technical</button>
  </div>` : ''}
${glance(cs)}
${lead.show ? '  ' + shot(lead.src, '', lead.cap, lead.live, 'lead-shot') : ''}
  <dl class="meta">${meta.map(([k, v]) => `<div><dt>${k}</dt><dd>${esc(v)}</dd></div>`).join('')}</dl>
  ${toc.length > 1 ? `<nav class="toc" aria-label="On this page"><span>On this page</span>${toc.map(([id, t]) => `<a href="#${id}">${esc(t)}</a>`).join('')}</nav>` : ''}
  <article class="body" id="the-story" data-current="plain">
${html}
  </article>
${seriesBlock(cs) ? seriesBlock(cs) + '\n' : ''}  <p class="source">${esc(cs.source || '')} <a href="/content/case-studies/${cs.slug}.md">Get this case study as Markdown</a>.</p>
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
      <span class="pills">${cs.members && cs.members.length ? `<span class="pill">Series · ${cs.members.length} case studies</span>` : ''}${(cs.tags || []).map((t) => `<span class="pill">${esc(t)}</span>`).join('')}</span>
    </span>
  </a>`).join('\n');
  return `${head({ title: 'Case studies — Plumbline Studio', description: 'What Plumbline has built, told twice: plainly for owners, technically for the people who maintain it.', canonical: `${ORIGIN}/case-studies/`, jsonld: { '@context': 'https://schema.org', '@graph': [{ '@type': 'CollectionPage', name: 'Case studies', url: `${ORIGIN}/case-studies/`, publisher: ORG }, crumbs([['Home', ORIGIN + '/'], ['Case studies', `${ORIGIN}/case-studies/`]])] } })}
<main class="wide index">
  <div class="plumb" aria-hidden="true"><div class="line"></div><div class="bob"></div></div>
  <header class="index-head">
    <p class="eyebrow">Case studies</p>
    <h1>Real problems, taken off real desks</h1>
    <p class="lede">Each one is told twice on the same page: a plain-language version for owners, and a technical version for the people who'll maintain it. Switch between them at the top of any case study.</p>
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
const bySlug = new Map(all.map((cs) => [cs.slug, cs]));
for (const cs of all) {
  if (!cs.series) continue;
  const file = path.join(CONTENT, `${cs.slug}.md`);
  const parent = bySlug.get(cs.series);
  if (!parent) fail(file, `series "${cs.series}" is not a case study`);
  if (parent.series) fail(file, `series "${cs.series}" is itself part of a series; series are one level deep`);
  if (cs.visibility === 'public' && parent.visibility !== 'public') fail(file, `a public part needs a public umbrella ("${cs.series}" is ${parent.visibility})`);
  cs.parent = parent;
}
const byOrder = (a, b) => a.order - b.order || a.slug.localeCompare(b.slug);
for (const cs of all) cs.members = all.filter((m) => m.parent === cs && m.visibility === 'public').sort(byOrder);
const pub = all.filter((cs) => cs.visibility === 'public').sort(byOrder);
// The index and the home page list whole stories: an umbrella stands for its parts.
const listed = pub.filter((cs) => !cs.parent);

const outputs = new Map();
outputs.set(path.join(OUT, 'index.html'), indexPage(listed));
for (const cs of all) outputs.set(path.join(OUT, cs.slug, 'index.html'), casePage(cs));

const sitemapFile = path.join(SITE, 'sitemap.xml');
outputs.set(sitemapFile, replaceBlock(fs.readFileSync(sitemapFile, 'utf8'), 'case-studies',
  [`  <url><loc>${ORIGIN}/case-studies/</loc></url>`].concat(pub.map((cs) => `  <url><loc>${ORIGIN}/case-studies/${cs.slug}/</loc><lastmod>${cs.date}</lastmod></url>`)).join('\n'), sitemapFile));

const llmsFile = path.join(SITE, 'llms.txt');
outputs.set(llmsFile, replaceBlock(fs.readFileSync(llmsFile, 'utf8'), 'case-studies',
  ['## Case studies', '', `All case studies: ${ORIGIN}/case-studies/`].concat(pub.map((cs) => `- ${cs.title} (${clientLabel(cs)}): ${cs.summary} ${ORIGIN}/case-studies/${cs.slug}/ — Markdown: ${ORIGIN}/content/case-studies/${cs.slug}.md`)).join('\n'), llmsFile));

// The home page shows this case study in full above the fold, and its row of three shows client work only.
const HOME_FEATURE = 'staff-platform-tools';
const homeFile = path.join(SITE, 'index.html');
outputs.set(homeFile, replaceBlock(fs.readFileSync(homeFile, 'utf8'), 'case-studies',
  `  <div class="cards">\n${listed.filter((cs) => cs.slug !== HOME_FEATURE && !/^Plumbline Studio/.test(cs.client)).slice(0, 3).map((cs) => `    <a class="link-card" href="/case-studies/${cs.slug}/">${cs.thumb ? `<span class="thumb"><img src="${cs.thumb}" alt="" loading="lazy"></span>` : ''}<span class="body"><span class="label">${esc(clientLabel(cs))}</span><b>${esc(cs.title)}</b><p>${esc(cs.summary)}</p><span class="go">Read the case study</span></span></a>`).join('\n')}\n  </div>\n  <p style="margin-top:var(--s4)"><a href="/case-studies/">All case studies →</a></p>`, homeFile));

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
