// storefront/kitStore — the store kit inside the app (Online Store › Theme: export, import; super admin themes and the
// design service deliver kits through it). The format and its checks are kit.js; this file reads and writes the shop.
//
//   shopContext() → what the shop has (categories, pages, products, blocks, menus), for checkKit's link warnings
//   shopDetails() → { name, phone, email, address, hours, whatsapp } for the {{shop_…}} tokens
//   exportKit({ meta, parts }) → kit (the design customers see now; parts not yet published come with draft: true)
//   checkForShop(input) → checkKit(input, shopContext())
//   kitWillChange(kit, parts) → [{ part, label, replaces[], adds[], note? }] — shown before an import
//   applyKit(input, parts, { label }) → { ok, errors, warnings, point, parts: [labels] } — a restore point first, then the
//       chosen parts replace the shop's; products, customers and orders are never touched
//   kitFileName(kit) · downloadKit(kit) — the file a person saves
// Front end only: kept in this browser like the rest of the storefront (store.js).

import { read, update, makeRestorePoint } from './store';
import { checkKit, kitToStore, storeToKit, fillTokens, KIT_PARTS, KIT_EXT } from './kit.js';
import { getMenus, setMenus, categoryPaths, STORE_MENUS_EVENT } from '../storeMenus';
import { getPages, savePage } from '../storePages';
import { allProducts } from '../products';
import { businessProfile } from '../businessProfile';
import { themeValues, brandDefaults } from './theme';
import { themeNotices } from './notices';
import { codeLock } from './customs';

const safe = (fn, d) => { try { return fn(); } catch { return d; } };

export function shopContext() {
  const d = read();
  return {
    categories: safe(categoryPaths, []),
    pages: safe(() => getPages().map((p) => ({ id: p.id, handle: p.handle })), []),
    products: safe(() => allProducts().map((p) => p.id), []),
    blocks: (d.blocks || []).map((b) => b.id),
    menus: safe(() => getMenus().map((m) => m.id), []),
    customs: (d.customs || []).map((c) => c.id),
  };
}

const waNumber = (s) => { const dg = String(s || '').replace(/\D/g, ''); if (!dg) return ''; return dg.startsWith('880') ? dg : dg.startsWith('0') ? '88' + dg : dg.length === 10 ? '880' + dg : dg; };
export function shopDetails() {
  const p = safe(businessProfile, null) || { brand: {}, contact: {} };
  const chatTo = safe(() => themeValues().chatTo, '');
  const brand = safe(brandDefaults, { primary: '#003087', accent: '#009cde' });
  return { name: p.brand.name || '', phone: p.contact.phone || '', email: p.contact.email || '', address: p.contact.address || '', hours: p.contact.hours || '', whatsapp: /^\d{10,}$/.test(String(chatTo)) ? chatTo : waNumber(p.contact.phone), brandPrimary: brand.primary, brandAccent: brand.accent };
}

export const checkForShop = (input) => checkKit(input, shopContext());

export function exportKit({ meta = {}, parts = null } = {}) {
  const d = read();
  const shop = shopDetails();
  return storeToKit({ data: d, menus: safe(getMenus, []), pages: safe(getPages, []), parts, meta: { name: meta.name || ((shop.name || 'My shop') + ' design'), made: new Date().toISOString().slice(0, 10), author: shop.name, ...meta } });
}

export const kitFileName = (kit) => String(((kit && kit.meta && (kit.meta.id || kit.meta.name)) || 'store-design')).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') + KIT_EXT;
export function downloadKit(kit) {
  const blob = new Blob([JSON.stringify(kit, null, 2)], { type: 'application/json' });
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = kitFileName(kit);
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 0);
}

const names = (list) => (list || []).map((x) => x.name || x.title || x.text || x.id);
/** What an import would change, part by part (only parts the kit has). */
export function kitWillChange(kit, parts = {}) {
  const d = read();
  const out = [];
  if (parts.theme && kit.theme) out.push({ part: 'theme', label: 'Theme settings', replaces: ['Your colours, fonts and page options'], adds: [] });
  if (parts.headers && kit.headers) {
    const ids = new Set(kit.headers.map((h) => h.id));
    const def = kit.headers.find((h) => h.default) || kit.headers[0];
    out.push({ part: 'headers', label: 'Headers', replaces: (d.headers || []).filter((h) => ids.has(h.id)).map((h) => h.name), adds: kit.headers.filter((h) => !(d.headers || []).some((x) => x.id === h.id)).map((h) => h.name), note: def ? `${def.name} becomes the default header` : '' });
  }
  if (parts.layouts && kit.layouts) out.push({ part: 'layouts', label: 'Page layouts', replaces: names(d.layouts), adds: names(kit.layouts) });
  if (parts.blocks && kit.blocks) out.push({ part: 'blocks', label: 'HTML blocks', replaces: (d.blocks || []).filter((b) => kit.blocks.some((x) => x.id === b.id)).map((b) => b.name), adds: kit.blocks.filter((x) => !(d.blocks || []).some((b) => b.id === x.id)).map((b) => b.name) });
  if (parts.menus && kit.menus) { const ms = safe(getMenus, []); out.push({ part: 'menus', label: 'Menus', replaces: ms.filter((m) => kit.menus.some((x) => x.id === m.id)).map((m) => m.name), adds: kit.menus.filter((x) => !ms.some((m) => m.id === x.id)).map((m) => m.name) }); }
  if (parts.pages && kit.pages) { const pg = safe(getPages, []); out.push({ part: 'pages', label: 'Pages', replaces: kit.pages.filter((x) => pg.some((p) => p.handle === x.handle)).map((x) => x.title), adds: kit.pages.filter((x) => !pg.some((p) => p.handle === x.handle)).map((x) => x.title) }); }
  if (parts.notices && kit.notices) out.push({ part: 'notices', label: 'Store notices', replaces: names(d.notices), adds: names(kit.notices) });
  if (parts.customs && kit.customs) out.push({ part: 'customs', label: 'Custom sections', replaces: (d.customs || []).filter((c) => kit.customs.some((x) => x.id === c.id)).map((c) => c.name), adds: kit.customs.filter((x) => !(d.customs || []).some((c) => c.id === x.id)).map((c) => c.name) });
  if (parts.placements && kit.placements) out.push({ part: 'placements', label: 'Block placements', replaces: (d.placements || []).map((p) => p.id), adds: kit.placements.map((p) => p.id) });
  return out;
}

/**
 * Import a kit's chosen parts. parts: { theme, headers, layouts, blocks, menus, pages, notices, placements } (missing =
 * every part the kit has). A restore point is made first. Returns { ok, errors, warnings, point, parts }.
 */
export function applyKit(input, parts = null, { label = '', from = '', trusted = false } = {}) {
  const r = checkForShop(input);
  if (!r.ok) return { ok: false, errors: r.errors, warnings: r.warnings, point: null, parts: [] };
  const kit = fillTokens(r.kit, shopDetails());
  const want = { ...(parts || Object.fromEntries(KIT_PARTS.map((p) => [p.key, true]))) };
  // custom sections hold code: they come in from GridCommerce (design service, library, built-in designs) or when this
  // shop may write code itself (Business plan); a file from anywhere else brings everything but them
  const codeWhy = trusted ? '' : codeLock();
  if (codeWhy && want.customs && (kit.customs || []).length) { want.customs = false; r.warnings.push({ path: 'customs', text: `Custom sections were left out: ${codeWhy}` }); }
  const picked = KIT_PARTS.filter((p) => want[p.key] && (p.key === 'theme' ? !!kit.theme : (kit[p.key] || []).length));
  if (!picked.length) return { ok: false, errors: [{ path: '', text: 'Choose at least one part the file has.' }], warnings: r.warnings, point: null, parts: [] };
  const name = (kit.meta && kit.meta.name) || 'a store design';
  const point = makeRestorePoint(label || `Before importing ${name}`, { content: !!(want.menus || want.pages), kind: 'import' });
  const S = kitToStore(kit);
  const on = (k) => picked.some((p) => p.key === k);

  // pages first, so menu links can find them
  if (on('pages')) {
    const have = safe(getPages, []);
    S.pages.forEach((sp) => {
      const old = have.find((x) => x.handle === sp.handle);
      const nowIso = new Date().toISOString();
      savePage({ ...(old || { id: 'pg-' + sp.handle, template: 'blank', createdAt: nowIso, noindex: false, seo: { title: '', description: '' } }), handle: sp.handle, title: sp.title, blocks: sp.blocks, status: sp.status });
    });
  }
  update((d, now) => {
    if (on('theme')) d.theme = { draft: S.theme, live: S.theme, draftAt: now, liveAt: now };
    if (on('headers')) {
      d.headers = [...S.headers, ...(d.headers || []).filter((h) => !S.headers.some((x) => x.id === h.id))];
      if (S.defaultHeader) d.defaultHeader = S.defaultHeader;
    }
    if (on('layouts')) d.layouts = S.layouts;
    if (on('blocks')) d.blocks = [...S.blocks, ...(d.blocks || []).filter((b) => !S.blocks.some((x) => x.id === b.id))];
    if (on('notices')) d.notices = S.notices;
    // a kit's theme may carry the old one-line announcement: it becomes (or replaces) the matching store notice
    else if (on('theme') && Array.isArray(d.notices)) d.notices = [...themeNotices(S.theme), ...d.notices.filter((n) => n.id !== 'theme-announce')];
    if (on('placements')) d.placements = S.placements;
    if (on('customs')) d.customs = [...S.customs, ...(d.customs || []).filter((c) => !S.customs.some((x) => x.id === c.id))];
    if (kit.meta && kit.meta.id) d.preset = kit.meta.id;
    d.kit = { id: (kit.meta && kit.meta.id) || '', name, version: (kit.meta && kit.meta.version) || '', appliedAt: now, parts: picked.map((p) => p.key), ...(from ? { from } : {}) };
  });
  if (on('menus')) {
    const pg = safe(getPages, []);
    const fix = (it) => ({ ...it, link: it.link && it.link.type === 'page' ? { ...it.link, ref: ((pg.find((p) => p.handle === it.link.ref || p.id === it.link.ref)) || {}).id || it.link.ref } : it.link, children: (it.children || []).map(fix) });
    const menus = S.menus.map((m) => ({ ...m, items: m.items.map(fix) }));
    const keep = safe(getMenus, []).filter((m) => !menus.some((x) => x.id === m.id));
    setMenus([...menus, ...keep]);
    try { window.dispatchEvent(new CustomEvent(STORE_MENUS_EVENT)); } catch { /* ignore */ }
  }
  return { ok: true, errors: [], warnings: r.warnings, point, parts: picked.map((p) => p.label), left: codeWhy && (kit.customs || []).length ? 'customs' : '' };
}

/**
 * A kit as a whole store, for a preview frame: [['store', data], ['menus', menus]] (PreviewFrame parts). Parts the kit
 * doesn't have come from the shop as it is now. The frame needs ?preview=1.
 */
export function kitPreviewParts(input) {
  const r = checkForShop(input);
  if (!r.kit) return [];
  const S = kitToStore(fillTokens(r.kit, shopDetails()));
  const d = read();
  const now = Date.now();
  const doc = (v) => ({ draft: v, live: v, draftAt: now, liveAt: now });
  const store = {
    ...d, restore: [],
    theme: S.theme ? doc(S.theme) : d.theme,
    headers: S.headers ? [...S.headers, ...(d.headers || []).filter((h) => !S.headers.some((x) => x.id === h.id))] : d.headers,
    defaultHeader: S.headers ? S.defaultHeader : d.defaultHeader,
    layouts: S.layouts || d.layouts,
    blocks: S.blocks ? [...S.blocks, ...(d.blocks || []).filter((b) => !S.blocks.some((x) => x.id === b.id))] : d.blocks,
    notices: S.notices || d.notices,
    placements: S.placements || d.placements,
    customs: S.customs ? [...S.customs, ...(d.customs || []).filter((c) => !S.customs.some((x) => x.id === c.id))] : d.customs,
  };
  const out = [['store', store]];
  if (S.menus) { const keep = safe(getMenus, []).filter((m) => !S.menus.some((x) => x.id === m.id)); out.push(['menus', [...S.menus, ...keep]]); }
  return out;
}

/** The kit last applied to this shop (name, version, when), if any. */
export const appliedKit = () => read().kit || null;
