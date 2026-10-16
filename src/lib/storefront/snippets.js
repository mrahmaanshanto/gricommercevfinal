// storefront/snippets — Online Store › Snippets (Batch C step 8): the shop's own small additions to the online store,
// SAFE ONLY, on every plan, and never JavaScript written by the shop. Three kinds:
//   tracking  an ID only (Meta Pixel, GA4, Google Tag Manager, TikTok Pixel) or a site-verification token (Google,
//             Bing). The code is made by GridCommerce from a fixed template (trackingCode): the shop can't change it.
//             Verification tags are added to the store's head here; the tracking scripts are added by the live store's
//             server from the same template (this demo shows the exact code and does not load other sites).
//   css       CSS checked strictly (customCode.js › checkCss: no @import, no url() to other sites, no expression(),
//             no attribute selectors that can read what is typed …) and scoped to the storefront (.sf-theme). Never put
//             on checkout, account or payment pages (NO_CODE_PAGES).
//   html      text or HTML through the custom-section allow-list (customCode.js › sanitizeHtml), shown below the header
//             or above the footer; also kept off checkout, account and payment pages.
// A snippet that fails its check is not saved. Each snippet has its own on / off. GridCommerce can turn every snippet
// off for a shop (super admin › merchant › Modules › Code snippets: gc.admin.snippets, read-only here).
//
//   getSnippets() · snippetBy(id) · saveSnippet(s) → { ok, snippet } | { ok: false, problems } · setSnippetOn(id, on)
//   removeSnippet(id) · checkSnippet(s) → { ok, problems, out } · TRACKERS · trackingCode(provider, id) · SNIPPET_SPOTS
//   killOf(shopId) → null | { reason, by, at } · liveSnippets(path) → { css, metas, html: { spot: [html] } }
//   codeAllowedOn(path) · SNIPPETS_EVENT
// Front end only (browser storage gc.store.snippets). The server must run the same checks again when it saves.

import { checkCss, sanitizeHtml } from './customCode';

export const SNIPPETS_EVENT = 'gc:snippets';
const KEY = 'gc.store.snippets';
const KILL_KEY = 'gc.admin.snippets';
export const SNIPPET_SHOP = '0090';
export const SNIPPET_LIMITS = { count: 20, css: 20000, html: 20000 };
const ssr = () => typeof window === 'undefined';
const read = (k, d) => { if (ssr()) return d; try { const v = JSON.parse(window.localStorage.getItem(k)); return v == null ? d : v; } catch { return d; } };
const write = (v) => { try { window.localStorage.setItem(KEY, JSON.stringify(v)); window.dispatchEvent(new CustomEvent(SNIPPETS_EVENT)); } catch { /* ignore */ } };
const esc = (s) => String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

export const SNIPPET_KINDS = [['tracking', 'Tracking & verification', 'An ID from Meta, Google, TikTok or Bing'], ['css', 'CSS', 'Change how the store looks'], ['html', 'Text or HTML', 'A line or block of text on every page']];
export const SNIPPET_SPOTS = [['below-header', 'Below the header'], ['before-footer', 'Above the footer']];

// [id, name, what the ID looks like, check, example, meta name (verification only)]
export const TRACKERS = [
  ['meta-pixel', 'Meta Pixel', 'Pixel ID: 15–16 digits', /^\d{15,16}$/, '1234567890123456'],
  ['ga4', 'Google Analytics 4', 'Measurement ID: G-XXXXXXXXXX', /^G-[A-Z0-9]{6,12}$/, 'G-8KXQ2Y7PLM'],
  ['gtm', 'Google Tag Manager', 'Container ID: GTM-XXXXXXX', /^GTM-[A-Z0-9]{6,8}$/, 'GTM-5T7LQ2N'],
  ['tiktok', 'TikTok Pixel', 'Pixel ID: 20 letters and numbers', /^[A-Z0-9]{20}$/, 'C4ABCD1234EFGH5678IJ'],
  ['google-verify', 'Google site verification', 'The content="…" value Google gives you', /^[A-Za-z0-9_-]{20,64}$/, 'k3Q9xY_7bLmN2pR4sT6vW8zA1cE5gH0jK', 'google-site-verification'],
  ['bing-verify', 'Bing site verification', 'The content="…" value Bing gives you (32 letters and numbers)', /^[A-F0-9]{32}$/, '0A1B2C3D4E5F60718293A4B5C6D7E8F9', 'msvalidate.01'],
];
export const trackerBy = (id) => TRACKERS.find((t) => t[0] === id) || null;

/** The fixed code GridCommerce adds for a tracker. Only the checked ID goes into it. */
export function trackingCode(provider, raw) {
  const t = trackerBy(provider);
  const id = String(raw || '').trim();
  if (!t || !t[3].test(id)) return '';
  const e = esc(id);
  if (t[5]) return `<meta name="${t[5]}" content="${e}">`;
  if (provider === 'meta-pixel') return `<script>!function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,document,'script','https://connect.facebook.net/en_US/fbevents.js');fbq('init','${e}');fbq('track','PageView');</script>\n<noscript><img height="1" width="1" style="display:none" src="https://www.facebook.com/tr?id=${e}&ev=PageView&noscript=1"></noscript>`;
  if (provider === 'ga4') return `<script async src="https://www.googletagmanager.com/gtag/js?id=${e}"></script>\n<script>window.dataLayer=window.dataLayer||[];function gtag(){dataLayer.push(arguments);}gtag('js',new Date());gtag('config','${e}');</script>`;
  if (provider === 'gtm') return `<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src='https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);})(window,document,'script','dataLayer','${e}');</script>`;
  if (provider === 'tiktok') return `<script>!function(w,d,t){w.TiktokAnalyticsObject=t;var ttq=w[t]=w[t]||[];ttq.methods=["page","track","identify"];ttq.setAndDefer=function(t,e){t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}};for(var i=0;i<ttq.methods.length;i++)ttq.setAndDefer(ttq,ttq.methods[i]);ttq.load=function(e){var n=d.createElement("script");n.async=!0;n.src="https://analytics.tiktok.com/i18n/pixel/events.js?sdkid="+e;var a=d.getElementsByTagName("script")[0];a.parentNode.insertBefore(n,a)};ttq.load('${e}');ttq.page();}(window,document,'ttq');</script>`;
  return '';
}

/** The pages where the shop's CSS and HTML never go: checkout, account and payment pages. */
export const NO_CODE_PAGES = ['/checkout', '/account', '/order-link', '/track', '/pay'];
export const codeAllowedOn = (path) => !NO_CODE_PAGES.some((p) => String(path || '').split('?')[0] === p || String(path || '').startsWith(p + '/'));

/** Can this snippet be saved? { ok, problems: [plain words], out } (out: the code that will run). */
export function checkSnippet(s = {}) {
  const problems = [];
  if (!String(s.name || '').trim()) problems.push('Give it a name you will recognise.');
  if (s.kind === 'tracking') {
    const t = trackerBy(s.provider);
    if (!t) problems.push('Choose what it is for.');
    else if (!t[3].test(String(s.value || '').trim())) problems.push(`That doesn’t look like a ${t[1]} ID. ${t[2]}, e.g. ${t[4]}.`);
    else if (/[<>"'`;(){}]/.test(String(s.value))) problems.push('Paste the ID only, not the code.');
    return { ok: !problems.length, problems, out: problems.length ? '' : trackingCode(s.provider, s.value) };
  }
  if (s.kind === 'css') {
    if (!String(s.css || '').trim()) problems.push('Write the CSS.');
    const r = checkCss(s.css, { max: SNIPPET_LIMITS.css });
    if (String(s.css || '').trim() && !r.ok) problems.push(...r.problems);
    return { ok: !problems.length, problems, out: problems.length ? '' : r.css };
  }
  if (s.kind === 'html') {
    const raw = String(s.html || '');
    if (!raw.trim()) problems.push('Write the text or HTML.');
    if (raw.length > SNIPPET_LIMITS.html) problems.push(`It is over ${SNIPPET_LIMITS.html.toLocaleString('en-US')} characters.`);
    const r = sanitizeHtml(raw);
    if (r.removed.length) problems.push(`Take out ${r.removed.join(', ')}: they can’t go on the store.`);
    if (!SNIPPET_SPOTS.some(([k]) => k === s.spot)) problems.push('Choose where it shows.');
    return { ok: !problems.length, problems, out: problems.length ? '' : r.html };
  }
  return { ok: false, problems: ['Choose a kind of snippet.'], out: '' };
}

export const getSnippets = () => read(KEY, []);
export const snippetBy = (id) => getSnippets().find((x) => x.id === id) || null;
/** Save (new or changed). A snippet that fails its check is not saved. */
export function saveSnippet(s, by = 'Staff') {
  const list = getSnippets();
  if (!s.id && list.length >= SNIPPET_LIMITS.count) return { ok: false, problems: [`At most ${SNIPPET_LIMITS.count} snippets.`] };
  const r = checkSnippet(s);
  if (!r.ok) return { ok: false, problems: r.problems };
  const clean = { kind: s.kind, name: String(s.name).trim().slice(0, 60), on: s.on !== false, provider: s.kind === 'tracking' ? s.provider : undefined, value: s.kind === 'tracking' ? String(s.value).trim() : undefined, css: s.kind === 'css' ? String(s.css) : undefined, html: s.kind === 'html' ? String(s.html) : undefined, spot: s.kind === 'html' ? s.spot : undefined, at: Date.now(), by };
  if (s.kind === 'tracking' && list.some((x) => x.id !== s.id && x.kind === 'tracking' && x.provider === s.provider && x.value === clean.value)) return { ok: false, problems: ['This ID is already added.'] };
  let next;
  let saved;
  if (s.id && list.some((x) => x.id === s.id)) { next = list.map((x) => (x.id === s.id ? (saved = { ...x, ...clean }) : x)); }
  else { const n = list.reduce((m, x) => Math.max(m, Number(String(x.id).replace(/\D/g, '')) || 0), 0) + 1; saved = { id: 'SN-' + String(n).padStart(3, '0'), ...clean }; next = [...list, saved]; }
  write(next);
  return { ok: true, snippet: saved };
}
export function setSnippetOn(id, on) { write(getSnippets().map((x) => (x.id === id ? { ...x, on: !!on } : x))); }
export function removeSnippet(id) { write(getSnippets().filter((x) => x.id !== id)); }

/** GridCommerce's kill switch for this shop (super admin), or null. */
export function killOf(shopId = SNIPPET_SHOP) { const m = read(KILL_KEY, {}); const k = m && m[shopId]; return k && k.off ? k : null; }

/** What the store adds on this page: { css, metas: [{ name, content }], html: { spot: [html] } }. */
export function liveSnippets(path = '') {
  const out = { css: '', metas: [], html: {} };
  if (ssr() || killOf()) return out;
  const code = codeAllowedOn(path);
  getSnippets().filter((s) => s.on !== false).forEach((s) => {
    const r = checkSnippet(s);       // checked again when drawn: a stored snippet edited by hand still can't pass
    if (!r.ok) return;
    if (s.kind === 'tracking') { const t = trackerBy(s.provider); if (t && t[5]) out.metas.push({ name: t[5], content: String(s.value).trim() }); }
    else if (s.kind === 'css' && code) out.css += r.out;
    else if (s.kind === 'html' && code) (out.html[s.spot] = out.html[s.spot] || []).push(r.out);
  });
  return out;
}
