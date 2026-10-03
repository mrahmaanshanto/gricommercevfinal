// settingsHistory — who changed which setting, when, from what to what (Nayeem's brief #16: "merchant-wide configuration
// change audit"). Every settings page writes here when it saves (SetChrome.jsx › SettingsLogic, plus the pages with
// their own save: privacy, domains, API keys, billing profile, attribution model). Secrets are never written: a key or
// password shows as "changed".
//
//   logChanges({ formId, page, href, changes: [{ field, label, from, to, secret? }], by?, at? })
//   getHistory({ formId?, limit? }) → newest first: { id, at, by, formId, page, href, field, label, from, to }
//   PAGES — formId → the settings page's name and address (for the history page's filter)
//
// Front end only: kept in this browser (gc.settings.history, last 400 changes).

import { currentUser, roleTitles } from './team';

const KEY = 'gc.settings.history';
export const HISTORY_EVENT = 'gc:settings-history';
const ssr = () => typeof window === 'undefined';

export const PAGES = {
  general: { page: 'General', href: '/set-general' },
  preference: { page: 'Preference', href: '/set-preference' },
  payments: { page: 'Payment Gateway', href: '/set-payments' },
  delivery: { page: 'Delivery Settings', href: '/set-delivery' },
  ai: { page: 'AI Auto-Reply', href: '/set-ai' },
  rules: { page: 'Auto-Reply Rules', href: '/set-rules' },
  seo: { page: 'SEO', href: '/set-seo' },
  storage: { page: 'Storage', href: '/set-storage' },
  security: { page: 'API Security', href: '/set-security' },
  media: { page: 'Media', href: '/set-media' },
  privacy: { page: 'Privacy & consent', href: '/set-privacy' },
  domains: { page: 'Domains', href: '/set-domains' },
  apikeys: { page: 'API keys', href: '/set-security#keys' },
  billing: { page: 'Billing profile', href: '/set-general#billing' },
  attribution: { page: 'Attribution model', href: '/attribution' },
  notifications: { page: 'Order notifications', href: '/set-notifications' },
  stocksetup: { page: 'Stock setup', href: '/stock-setup' },
};

/** Who is saving: "Mehedi Rahman (CEO)". */
export function whoNow() {
  try { const u = currentUser(); return `${u.name} (${roleTitles(u).join(' + ')})`; } catch { return 'You'; }
}

const SECRET = /(key|secret|token|password|pass)$/i;
/** A value as the history shows it: On / Off, short text, "—" for empty. */
export function shown(v) {
  if (v === true) return 'On';
  if (v === false) return 'Off';
  if (v == null || v === '') return '—';
  const s = String(v).replace(/\s+/g, ' ').trim();
  return s.length > 80 ? s.slice(0, 77) + '…' : s;
}

function load() { if (ssr()) return []; try { return JSON.parse(window.localStorage.getItem(KEY)) || []; } catch { return []; } }

/** Record the changes of one save. */
export function logChanges({ formId, page, href, changes, by, at }) {
  if (ssr() || !changes || !changes.length) return;
  const meta = PAGES[formId] || {};
  const t = at || Date.now();
  const who = by || whoNow();
  const rows = changes.map((c, i) => {
    const secret = c.secret || SECRET.test(c.field || '');
    return { id: `${formId}-${t.toString(36)}-${i}`, at: t, by: who, formId, page: page || meta.page || formId, href: href || meta.href || '', field: c.field, label: c.label || c.field, from: secret ? 'Hidden' : shown(c.from), to: secret ? 'Changed' : shown(c.to) };
  });
  try {
    window.localStorage.setItem(KEY, JSON.stringify([...rows, ...load()].slice(0, 400)));
    window.dispatchEvent(new CustomEvent(HISTORY_EVENT));
  } catch { /* ignore */ }
}

/** Changes, newest first; `formId` narrows to one page. */
export function getHistory({ formId, limit } = {}) {
  const list = load().filter((r) => !formId || r.formId === formId);
  return limit ? list.slice(0, limit) : list;
}
