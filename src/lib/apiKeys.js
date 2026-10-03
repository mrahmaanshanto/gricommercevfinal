// apiKeys — named API keys with limited access (Nayeem's brief #16: "Multiple named credentials so one leaked
// integration does not force every client to break"). Settings › API Security lists them.
//
//   SCOPES · listKeys() → [{ id, name, scopes, prefix, last4, createdAt, createdBy, expiresAt, lastUsedAt, revokedAt, status }]
//   createKey({ name, scopes, days }) → { key, secret }   the secret is returned once and never stored (only a hash)
//   revokeKey(id) · maskOf(key) → "gck_live_7Hq2…9c2e"
//
// Front end only: kept in this browser (gc.apikeys). A real shop issues and checks keys on the server, which also
// records when each key was last used.

import { logChanges, whoNow } from './settingsHistory';

const KEY = 'gc.apikeys';
export const APIKEYS_EVENT = 'gc:apikeys';
const DAY = 864e5;

export const SCOPES = [
  { id: 'read_orders', label: 'Read orders', group: 'Orders' }, { id: 'write_orders', label: 'Change orders', group: 'Orders' },
  { id: 'read_products', label: 'Read products', group: 'Products' }, { id: 'write_products', label: 'Change products', group: 'Products' },
  { id: 'read_stock', label: 'Read stock', group: 'Stock' }, { id: 'write_stock', label: 'Change stock', group: 'Stock' },
  { id: 'read_customers', label: 'Read customers', group: 'Customers' }, { id: 'write_customers', label: 'Change customers', group: 'Customers' },
  { id: 'read_reports', label: 'Read reports', group: 'Reports' },
];
export const scopeLabel = (id) => (SCOPES.find((s) => s.id === id) || { label: id }).label;
export const EXPIRY = [[30, '30 days'], [90, '90 days'], [365, '1 year'], [0, 'No expiry']];

const at = (m, d, h = 10) => new Date(2026, m, d, h).getTime();
const SEED = [
  { id: 'key-woo', name: 'WooCommerce sync', scopes: ['read_products', 'write_products', 'read_stock', 'write_orders'], prefix: 'gck_live_7Hq2', last4: '9c2e', createdAt: at(7, 12), createdBy: 'Tanvir Hossain (CTO)', expiresAt: at(1, 12) + 365 * DAY * 1, lastUsed: -2 * 36e5, revokedAt: 0 },
  { id: 'key-acc', name: 'Accounting export', scopes: ['read_orders', 'read_reports'], prefix: 'gck_live_Pm4x', last4: '41d0', createdAt: at(8, 1), createdBy: 'Mehedi Rahman (CEO)', expiresAt: 0, lastUsed: -26 * 36e5, revokedAt: 0 },
  { id: 'key-pos', name: 'Old POS tablet', scopes: ['read_products', 'read_stock', 'write_orders'], prefix: 'gck_live_Zt8b', last4: '07aa', createdAt: at(4, 20), createdBy: 'Tanvir Hossain (CTO)', expiresAt: 0, lastUsed: 0, lastUsedAt: at(8, 19, 18), revokedAt: at(8, 20, 11) },
];

const ssr = () => typeof window === 'undefined';
function load() { if (ssr()) return SEED; try { return JSON.parse(window.localStorage.getItem(KEY)) || SEED; } catch { return SEED; } }
function save(list) { try { window.localStorage.setItem(KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(APIKEYS_EVENT)); } catch { /* ignore */ } }

/** Keys, newest first, with their status: active · expired · revoked. */
export function listKeys(now = Date.now()) {
  // seeded keys were last used a moment ago relative to now (the demo keeps them "in use")
  if (!ssr() && !window.localStorage.getItem(KEY)) save(SEED.map((k) => ({ ...k, lastUsedAt: k.lastUsed ? now + k.lastUsed : k.lastUsedAt || 0 })));
  return load().map((k) => ({ ...k, status: k.revokedAt ? 'revoked' : k.expiresAt && k.expiresAt < now ? 'expired' : 'active' })).sort((a, b) => b.createdAt - a.createdAt);
}

const B62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
function randomText(n) {
  const out = [];
  const bytes = new Uint8Array(n);
  try { window.crypto.getRandomValues(bytes); } catch { for (let i = 0; i < n; i++) bytes[i] = Math.floor(Math.random() * 256); }
  bytes.forEach((b) => out.push(B62[b % 62]));
  return out.join('');
}
function hashOf(s) { let h = 2166136261; for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0).toString(16); }

/** Issue a key. → { key, secret } or { error }. The secret is shown once. */
export function createKey({ name, scopes, days }) {
  const n = String(name || '').trim();
  if (!n) return { error: 'Give the key a name, like “Accounting export”.' };
  const list = load();
  if (list.some((k) => !k.revokedAt && k.name.toLowerCase() === n.toLowerCase())) return { error: 'A key with this name exists. Use another name.' };
  const sc = (scopes || []).filter((s) => SCOPES.some((x) => x.id === s));
  if (!sc.length) return { error: 'Choose at least one thing the key may do.' };
  const secret = 'gck_live_' + randomText(32);
  const now = Date.now();
  const key = { id: 'key-' + now.toString(36), name: n, scopes: sc, prefix: secret.slice(0, 13), last4: secret.slice(-4), hash: hashOf(secret), createdAt: now, createdBy: whoNow(), expiresAt: Number(days) > 0 ? now + Number(days) * DAY : 0, lastUsedAt: 0, revokedAt: 0 };
  save([key, ...list]);
  logChanges({ formId: 'apikeys', changes: [{ field: 'key:' + key.id, label: 'API key “' + n + '”', from: '', to: 'Created · ' + sc.map(scopeLabel).join(', ') }] });
  return { key, secret };
}

/** Stop a key working at once. */
export function revokeKey(id) {
  const list = load();
  const k = list.find((x) => x.id === id);
  if (!k || k.revokedAt) return false;
  save(list.map((x) => (x.id === id ? { ...x, revokedAt: Date.now() } : x)));
  logChanges({ formId: 'apikeys', changes: [{ field: 'key:' + id, label: 'API key “' + k.name + '”', from: 'Active', to: 'Revoked' }] });
  return true;
}

export const maskOf = (k) => `${k.prefix}…${k.last4}`;
