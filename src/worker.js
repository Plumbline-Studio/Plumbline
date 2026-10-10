// plumbline-storefront Worker.
// Serves the static storefront, plus three outreach tracking routes:
//   /o/<token>.gif  open pixel (1x1 gif)
//   /book/<token>   tracked booking link -> 302 to Calendly with UTM tags
//   /u/<token>      unsubscribe (GET shows a confirm button; POST = one-click, RFC 8058)
// Hits are logged to Supabase (plumbline-platform) through outreach_track_hit().
// Tokens are random per message; no personal data is in the URL.

const GIF = Uint8Array.from(atob('R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'), c => c.charCodeAt(0));
const FALLBACK_BOOKING = 'https://calendly.com/plumblinestudio/30min';
const TOKEN_RE = /^[A-Za-z0-9_-]{6,40}$/;

async function hit(env, request, token, kind) {
  const cf = request.cf || {};
  const res = await fetch(env.SUPABASE_URL + '/rest/v1/rpc/outreach_track_hit', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      apikey: env.SUPABASE_PUBLISHABLE_KEY,
      authorization: 'Bearer ' + env.SUPABASE_PUBLISHABLE_KEY,
    },
    body: JSON.stringify({
      p_token: token,
      p_kind: kind,
      p_ua: request.headers.get('user-agent') || '',
      p_org: cf.asOrganization || '',
      p_country: cf.country || '',
    }),
  });
  if (!res.ok) return null;
  return res.json().catch(() => null);
}

function page(title, body) {
  return new Response(
    `<!doctype html><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>${title}</title>
<body style="font-family:Arial,Helvetica,sans-serif;max-width:480px;margin:15vh auto;padding:0 16px;color:#1b2433;line-height:1.5">
${body}
<p style="color:#777;font-size:13px;margin-top:32px">Plumbline Studio · Roanoke, VA</p></body>`,
    { headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } }
  );
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);
    const parts = url.pathname.split('/').filter(Boolean);

    // Open pixel
    if (parts[0] === 'o' && parts.length === 2) {
      const token = parts[1].replace(/\.gif$/, '');
      if (TOKEN_RE.test(token)) ctx.waitUntil(hit(env, request, token, 'open').catch(() => {}));
      return new Response(GIF, {
        headers: { 'content-type': 'image/gif', 'cache-control': 'no-store, no-cache, must-revalidate, max-age=0', 'x-robots-tag': 'noindex' },
      });
    }

    // Tracked booking link
    if (parts[0] === 'book' && parts.length === 2) {
      let target = FALLBACK_BOOKING;
      if (TOKEN_RE.test(parts[1])) {
        const r = await hit(env, request, parts[1], 'click').catch(() => null);
        if (r && typeof r.redirect === 'string' && r.redirect.startsWith('https://calendly.com/')) target = r.redirect;
      }
      return new Response(null, { status: 302, headers: { location: target, 'cache-control': 'no-store', 'x-robots-tag': 'noindex' } });
    }

    // Unsubscribe
    if (parts[0] === 'u' && parts.length === 2 && TOKEN_RE.test(parts[1])) {
      if (request.method === 'POST') {
        await hit(env, request, parts[1], 'unsub').catch(() => null);
        return page('Unsubscribed', '<h1 style="font-size:22px">You are unsubscribed.</h1><p>You will not get any more email from Plumbline Studio.</p>');
      }
      return page('Unsubscribe',
        `<h1 style="font-size:22px">Stop emails from Plumbline Studio?</h1>
<form method="post"><button style="font-size:16px;padding:10px 18px;border:0;border-radius:6px;background:#1b2433;color:#fff">Unsubscribe</button></form>`);
    }

    return env.ASSETS.fetch(request);
  },
};
