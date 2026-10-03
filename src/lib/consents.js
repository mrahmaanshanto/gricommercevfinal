// consents — the three kinds of customer consent the store asks for, kept apart (Nayeem's brief #16, "Do not merge three
// different customer-consent concepts into one Settings toggle"):
//   marketing   may we send offers by SMS, WhatsApp or email (CRM keeps each customer's answer; Communications checks it)
//   legal       the customer accepts the terms of service and privacy policy at checkout
//   cookies     the cookie banner: necessary cookies, plus analytics and ads cookies only if the visitor allows them
// Each has a text and a version. Saving a new text (Settings › Privacy & consent) makes a new version; a customer's
// acceptance records the version they saw, so it is clear what each person agreed to.
//
//   CONSENT_TYPES · versionsOf(type) → [{ v, text, at, by }] newest first · currentVersion(type)
//   bumpVersion(type, text, by) · acceptedCounts(type) → [{ v, count }] (demo)
//
// Front end only: kept in this browser (gc.consents).

const KEY = 'gc.consents';
const at = (m, d) => new Date(2026, m, d, 11).getTime();

export const CONSENT_TYPES = {
  marketing: { name: 'Marketing', field: 'mkt_text', text: 'Send me offers and news by SMS, WhatsApp or email. I can stop any time.' },
  legal: { name: 'Terms & privacy', field: 'legal_text', text: 'I agree to the Terms of service and the Privacy policy.' },
  cookies: { name: 'Cookies', field: 'cookie_text', text: 'We use cookies to run the store. With your OK we also use them to count visits and show you relevant ads.' },
};
const SEED = {
  marketing: [{ v: 2, text: CONSENT_TYPES.marketing.text, at: at(8, 2), by: 'Mehedi Rahman (CEO)' }, { v: 1, text: 'Send me offers by SMS.', at: at(2, 12), by: 'Mehedi Rahman (CEO)' }],
  legal: [{ v: 3, text: CONSENT_TYPES.legal.text, at: at(8, 15), by: 'Tanvir Hossain (CTO)' }, { v: 2, text: 'I agree to the Terms of service.', at: at(5, 1), by: 'Tanvir Hossain (CTO)' }, { v: 1, text: 'I agree to the terms.', at: at(2, 12), by: 'Mehedi Rahman (CEO)' }],
  cookies: [{ v: 1, text: CONSENT_TYPES.cookies.text, at: at(6, 18), by: 'Shakil Ahmed (Ads & tracking)' }],
};
// demo: how many customers accepted each version
const COUNTS = { marketing: { 2: 412, 1: 286 }, legal: { 3: 538, 2: 401, 1: 222 }, cookies: { 1: 6412 } };

const ssr = () => typeof window === 'undefined';
function load() { if (ssr()) return SEED; try { return { ...SEED, ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return SEED; } }

export const versionsOf = (type) => load()[type] || [];
export const currentVersion = (type) => (versionsOf(type)[0] || { v: 1, text: (CONSENT_TYPES[type] || {}).text || '' });

/** A new text for a consent: a new version (nothing happens when the text is the same). */
export function bumpVersion(type, text, by = 'You') {
  const all = load();
  const list = all[type] || [];
  const t = String(text || '').trim();
  if (!t || (list[0] && list[0].text === t)) return list[0] || null;
  const next = { v: (list[0] ? list[0].v : 0) + 1, text: t, at: Date.now(), by };
  all[type] = [next, ...list];
  try { window.localStorage.setItem(KEY, JSON.stringify(all)); } catch { /* ignore */ }
  return next;
}

/** Customers who accepted each version (demo figures; new versions start at 0). */
export const acceptedCounts = (type) => versionsOf(type).map((x) => ({ v: x.v, count: (COUNTS[type] || {})[x.v] || 0 }));
