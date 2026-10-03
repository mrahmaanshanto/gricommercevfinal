// commsConsent — the one place Communications asks "may we send this customer this kind of message on this channel?".
// Consent is a CRM fact (Nayeem's brief #7, Customers & CRM owns it): for a customer the CRM knows (customers.js ›
// resolveCustomer by customer ID, phone or email) the answer is consent.js › whyNotAllowed(customer, channel, class).
// For someone the CRM doesn't know yet (a guest, a staff number) it reads a `consent` field on the record and, for
// the demo, a fixed answer per phone number.
// Transactional and Security messages need no marketing consent; Service messages are allowed unless the customer
// said no. Suppression (bounces, blocks, unsubscribes) is a different list: suppression.js.
//
//   consentOf(person, channel, cls) → { ok, state: 'yes' | 'no' | 'unknown', reason }
//   registerConsent(fn)            the CRM's isAllowed can be plugged in here at start-up instead of an import

import { resolveCustomer } from './customers';
import { whyNotAllowed } from './consent';

const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');
const hash = (s) => { let h = 11; for (const c of String(s)) h = (h * 31 + c.charCodeAt(0)) % 1000003; return h; };
let crm = null;
/** Use the CRM's consent check: fn(person, channel, cls) → boolean | { ok, state, reason }. */
export function registerConsent(fn) { crm = typeof fn === 'function' ? fn : null; }

function factOf(person, channel) {
  const c = person && person.consent;
  if (c) {
    const v = typeof c === 'object' ? c[channel] ?? c.marketing ?? c.all : c;
    if (v === true || v === 'yes' || v === 'opted-in') return 'yes';
    if (v === false || v === 'no' || v === 'opted-out') return 'no';
  }
  const p = digits(person && person.phone) || String((person && person.email) || '');
  if (!p) return 'unknown';
  const n = hash(p + channel) % 20;   // demo: most opted in, some said no, a few never asked
  return n < 15 ? 'yes' : n < 18 ? 'no' : 'unknown';
}

function crmCustomer(person) {
  if (!person || typeof window === 'undefined') return null;
  try {
    const ref = person.customerId || (/^C-/.test(String(person.id || '')) ? person.id : '') || digits(person.phone) || person.email;
    if (!ref) return null;
    if (person.phones && person.id) return person;              // already a CRM row
    return resolveCustomer(ref);
  } catch { return null; }
}

export function consentOf(person, channel, cls = 'Marketing') {
  const k = String(cls || '').toLowerCase();
  if (crm) {
    try {
      const r = crm(person, channel, cls);
      if (typeof r === 'boolean') return { ok: r, state: r ? 'yes' : 'no', reason: r ? '' : 'No consent' };
      if (r && typeof r === 'object') return { ok: !!r.ok, state: r.state || (r.ok ? 'yes' : 'no'), reason: r.reason || (r.ok ? '' : 'No consent') };
    } catch { /* fall back below */ }
  }
  if (k === 'transactional' || k === 'security') return { ok: true, state: 'yes', reason: '' };
  // the CRM's answer for a customer it knows
  const known = crmCustomer(person);
  if (known) {
    const why = whyNotAllowed(known, channel === 'voice' ? 'call' : channel, k === 'service' ? 'service' : 'marketing');
    if (!why) return { ok: true, state: 'yes', reason: '' };
    return { ok: false, state: /opted out/i.test(why) ? 'no' : 'unknown', reason: why.replace(/\.$/, '') };
  }
  if (k === 'service') {
    // service messages need no marketing consent; only an explicit "no messages at all" on the record stops them
    const c = person && person.consent;
    const no = c && typeof c === 'object' && (c.service === false || c.service === 'no' || c.all === false);
    return { ok: !no, state: no ? 'no' : 'yes', reason: no ? 'Said no to messages' : '' };
  }
  const state = factOf(person, channel);
  return { ok: state === 'yes', state, reason: state === 'no' ? 'Said no to offers' : state === 'unknown' ? 'Never asked for consent' : '' };
}
