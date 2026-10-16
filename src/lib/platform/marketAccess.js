// platform/marketAccess — who may use GridCommerce's offers to merchants (Batch D step 2): Services (expert help) and
// Grid Shop (business supplies). Shared by both sides like services.js: the super admin sets it (Services › Access and
// a merchant's Modules tab), the merchant panel reads it (browser storage gc.platform.market, event gc:market).
//
// For each module: on (the whole module, every store), mode 'all' | 'chosen' (open to chosen stores only, `allow`),
// blocked stores (each with a reason the store sees) and the message closed stores see.
//   accessOf(db?) · moduleAccess(module) · canUse(module, shopId) → { ok, why, code } · setModule(module, patch, by)
//   allowShop / disallowShop(module, shopId, by) · blockShop(module, shopId, reason, by) · unblockShop(module, shopId, by)
//   MARKET_MODULES · MARKET_EVENT
// Front end only. The server must check the same rules on every page and order.

export const MARKET_KEY = 'gc.platform.market';
export const MARKET_EVENT = 'gc:market';
export const MARKET_MODULES = [
  ['services', 'Services', 'Expert help merchants buy: SEO, ads, design, setup, content and custom work'],
  ['shop', 'Grid Shop', 'Business supplies merchants buy: packaging, POS machines and more'],
  // Batch E · Grid Partners (lib/platform/partners.js): stores find models, influencers and video creators
  ['partners', 'Grid Partners', 'Find models, influencers and video creators'],
  // Batch F · Grid Career (lib/platform/career.js): open to chosen stores only by default (CAREER_SEED below)
  ['career', 'Grid Career', 'Hiring: job posts, a careers page and applicants'],
];
const isBrowser = typeof window !== 'undefined';
const blank = () => ({ on: true, mode: 'all', allow: [], blocked: [], closedText: 'Not open for your store yet. Ask GridCommerce support to open it.', history: [] });
const SEED = { v: 1, services: blank(), shop: blank() };
// Batch F · Grid Career: only for the stores GridCommerce opens it for (Dazzle Shop 0090 to start)
SEED.career = { ...blank(), mode: 'chosen', allow: ['0090'], closedText: 'Grid Career is not open for your store yet. Ask GridCommerce support to open it.' };

export function accessOf() {
  if (!isBrowser) return SEED;
  try { const v = JSON.parse(window.localStorage.getItem(MARKET_KEY)); return v && v.v === 1 ? { ...SEED, ...v } : SEED; } catch { return SEED; }
}
function write(db) {
  try { window.localStorage.setItem(MARKET_KEY, JSON.stringify(db)); window.dispatchEvent(new CustomEvent(MARKET_EVENT)); } catch { /* ignore */ }
}
function commit(module, fn, by, text) {
  const db = JSON.parse(JSON.stringify(accessOf()));
  const m = { ...blank(), ...(db[module] || {}) };
  fn(m);
  m.history = [{ at: Date.now(), by: by || 'Staff', text }, ...(m.history || [])].slice(0, 40);
  db[module] = m;
  write(db);
  return m;
}
export const moduleAccess = (module) => ({ ...blank(), ...(accessOf()[module] || {}) });

/** May this store use the module? { ok, why, code: 'off' | 'blocked' | 'not-chosen' | '' } */
export function canUse(module, shopId) {
  const m = moduleAccess(module);
  const b = (m.blocked || []).find((x) => x.shopId === shopId);
  if (b) return { ok: false, code: 'blocked', why: b.reason ? `GridCommerce has paused this for your store: ${b.reason}` : 'GridCommerce has paused this for your store.' };
  if (!m.on) return { ok: false, code: 'off', why: m.closedText || blank().closedText };
  if (m.mode === 'chosen' && !(m.allow || []).includes(shopId)) return { ok: false, code: 'not-chosen', why: m.closedText || blank().closedText };
  return { ok: true, code: '', why: '' };
}

export const setModule = (module, patch, by) => commit(module, (m) => Object.assign(m, patch), by, 'Changed: ' + Object.keys(patch).join(', '));
export const allowShop = (module, shopId, by) => commit(module, (m) => { m.allow = [...new Set([...(m.allow || []), shopId])]; }, by, `Opened for store ${shopId}`);
export const disallowShop = (module, shopId, by) => commit(module, (m) => { m.allow = (m.allow || []).filter((x) => x !== shopId); }, by, `Closed for store ${shopId}`);
export function blockShop(module, shopId, reason, by) {
  const why = String(reason || '').trim();
  if (!why) return null;
  return commit(module, (m) => { m.blocked = [...(m.blocked || []).filter((x) => x.shopId !== shopId), { shopId, reason: why, by: by || 'Staff', at: Date.now() }]; }, by, `Blocked store ${shopId}: ${why}`);
}
export const unblockShop = (module, shopId, by) => commit(module, (m) => { m.blocked = (m.blocked || []).filter((x) => x.shopId !== shopId); }, by, `Unblocked store ${shopId}`);
