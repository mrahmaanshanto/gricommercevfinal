// customerRef — one way for Loyalty, Promotions and Communications to name a customer.
// Nayeem's briefs #7 / #9 / #11: a member, a coupon's "one use per customer" and a send's consent all hang on the CRM
// customer ID, not on a phone string. customers.js (Customers & CRM) owns that ID; when it exposes a resolver
// (resolveCustomer / customerIdOf / idOf) this file uses it, otherwise the key is the phone number ("P:017…"), which is
// what every list was keyed by before. Front end only.
//
//   customerKey(x)    x = a customer, a member, { id, phone } or a phone string → 'C-…' (CRM ID) or 'P:01…' (phone)
//   phoneOfKey(key)   the phone digits inside a phone key ('' for a CRM ID)

import * as CRM from './customers';

const digits = (p) => String(p || '').replace(/[^0-9]/g, '').replace(/^88/, '');

// the CRM directory is read once a second at most (a campaign asks for hundreds of keys in a row)
let memo = { at: 0, list: null };
function directory() {
  if (typeof CRM.getDirectory !== 'function' || typeof window === 'undefined') return undefined;
  const now = Date.now();
  if (!memo.list || now - memo.at > 1000) { try { memo = { at: now, list: CRM.getDirectory() }; } catch { return undefined; } }
  return memo.list;
}
function crmIdFor(x) {
  // the resolver names Customers & CRM may export; any of them returning an id (or an object with id) wins
  const fns = [CRM.resolveCustomer, CRM.customerIdOf].filter((f) => typeof f === 'function');
  for (const f of fns) {
    try {
      const r = f(x, directory());
      const id = r && typeof r === 'object' ? r.id : r;
      if (id) return String(id);
    } catch { /* not this one */ }
  }
  return '';
}

/** The key a customer is counted by: the CRM customer ID when Customers & CRM knows it, else the phone. */
export function customerKey(x) {
  if (!x) return '';
  if (typeof x === 'object') {
    if (x.customerId) return String(x.customerId);
    if (x.id && /^C[-_]/.test(String(x.id))) return String(x.id);
  }
  const phone = digits(typeof x === 'object' ? x.phone : x);
  const crm = crmIdFor(typeof x === 'object' ? x : phone) || (phone ? crmIdFor(phone) : '');
  if (crm) return crm;
  return phone ? 'P:' + phone : '';
}
export const phoneOfKey = (key) => (String(key || '').startsWith('P:') ? String(key).slice(2) : '');
