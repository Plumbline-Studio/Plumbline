/* Plumbline client portal — shared runtime.
   Supabase: plumbline-platform. The publishable key is safe in the page; every
   read and write goes through RLS or a security-definer function. */
window.PORTAL = (() => {
  const URL = 'https://ghddsckqbwrjsjvbjwya.supabase.co';
  const KEY = 'sb_publishable_9yqJnbBguKbA9zbHIztyPw_-B2XDYCR';
  const sb = window.supabase.createClient(URL, KEY, { auth: { persistSession: true, detectSessionInUrl: true, flowType: 'pkce' } });
  const esc = s => String(s ?? '').replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]);
  const guestToken = () => new URLSearchParams(location.search).get('g') || sessionStorage.getItem('pl-guest') || '';
  async function session() { const { data } = await sb.auth.getSession(); return data.session; }
  async function sendLink(email, next) {
    const redirect = location.origin + '/' + (next ? '?next=' + encodeURIComponent(next) : '');
    return sb.auth.signInWithOtp({ email, options: { emailRedirectTo: redirect } });
  }
  async function claim() { try { await sb.rpc('portal_claim'); } catch (e) {} }
  async function mine() { const { data, error } = await sb.rpc('portal_mine'); if (error) throw error; return data || []; }
  async function guest(token) { const { data, error } = await sb.rpc('portal_guest', { p_token: token }); if (error) throw error; return data; }
  // Answers go through access-checked functions: a signed-in member or a live guest link for this project.
  async function answers(project) {
    const { data, error } = await sb.rpc('portal_answers', { p_project: project, p_token: guestToken() || null });
    return error ? [] : (data || []);
  }
  async function saveAnswer(body) {
    const { data, error } = await sb.rpc('portal_answer_save', {
      p_project: body.project, p_token: guestToken() || null, p_step: body.step ?? null, p_kind: body.kind,
      p_item_key: body.item_key, p_item: body.item, p_answer: body.answer, p_by: body.answered_by });
    if (error) throw new Error(error.message); return data;
  }
  async function signOut() { await sb.auth.signOut(); sessionStorage.removeItem('pl-guest'); location.href = '/'; }
  return { sb, esc, guestToken, session, sendLink, claim, mine, guest, answers, saveAnswer, signOut };
})();
