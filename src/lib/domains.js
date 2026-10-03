// domains — the store's web addresses (Nayeem's brief #16, "Storefront domain configuration"): the free GridCommerce
// address (<name>.gridcommerce.com.bd) and custom domains the shop connects. A custom domain needs DNS records added at
// the registrar; it is then verified and gets an SSL certificate. One domain is primary (customers are sent there).
//
//   SUBDOMAIN_BASE · subdomainOf() · setSubdomain(name)
//   getDomains() → [{ host, addedAt, primary, state: 'pending'|'verifying'|'verified'|'failed', ssl: 'none'|'provisioning'|'active'|'error', checkedAt, records }]
//   addDomain(host) · checkDomain(host) · makePrimary(host) · removeDomain(host) · recordsFor(host)
//
// Demo: checking moves with the clock (like a real DNS check): pending → verifying (on the first check) → verified about a
// minute later, then SSL provisioning → active a minute after that. ?dns=failed makes the next check fail.
// Front end only (gc.domains); a real shop's platform checks DNS and issues certificates.

import { logChanges } from './settingsHistory';

const KEY = 'gc.domains';
export const DOMAINS_EVENT = 'gc:domains';
export const SUBDOMAIN_BASE = 'gridcommerce.com.bd';
export const TARGET_IP = '76.76.21.21';
export const TARGET_HOST = 'shops.gridcommerce.com.bd';
const MIN = 60 * 1000;

const SEED = { sub: 'gridshop', list: [] };
const ssr = () => typeof window === 'undefined';
function load() { if (ssr()) return SEED; try { return { ...SEED, ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return SEED; } }
function save(st) { try { window.localStorage.setItem(KEY, JSON.stringify(st)); window.dispatchEvent(new CustomEvent(DOMAINS_EVENT)); } catch { /* ignore */ } }

export const subdomainOf = () => load().sub;
/** Change the free address. → '' or the reason it can't be used. */
export function setSubdomain(name) {
  const n = String(name || '').trim().toLowerCase();
  if (!/^[a-z0-9]([a-z0-9-]{1,30}[a-z0-9])$/.test(n)) return 'Use 3–32 letters, numbers or dashes, not starting or ending with a dash.';
  if (['www', 'shop', 'admin', 'api', 'mail'].includes(n)) return 'That name is taken. Try another.';
  const st = load();
  if (st.sub === n) return '';
  logChanges({ formId: 'domains', changes: [{ field: 'subdomain', label: 'GridCommerce address', from: st.sub + '.' + SUBDOMAIN_BASE, to: n + '.' + SUBDOMAIN_BASE }] });
  save({ ...st, sub: n });
  return '';
}

const token = (host) => { let h = 7; for (const c of host) h = (h * 31 + c.charCodeAt(0)) % 99991; return 'gc-verify-' + h.toString(36) + host.length; };
const apex = (host) => host.split('.').length <= 2 || /\.(com|net|org|gov|edu|ac)\.bd$/.test(host) && host.split('.').length === 3;
/** DNS records to add at the registrar. */
export function recordsFor(host) {
  const root = apex(host);
  return [
    root ? { type: 'A', name: '@', value: TARGET_IP } : { type: 'CNAME', name: host.split('.')[0], value: TARGET_HOST },
    ...(root ? [{ type: 'CNAME', name: 'www', value: TARGET_HOST }] : []),
    { type: 'TXT', name: '_gridcommerce', value: token(host) },
  ];
}

/** The state of each domain now (it moves on with the clock after a check). */
export function getDomains(now = Date.now()) {
  return load().list.map((d) => {
    let { state, ssl } = d;
    if (state === 'verifying' && d.checkedAt && now - d.checkedAt > MIN) { state = d.fail ? 'failed' : 'verified'; }
    if (state === 'verified') ssl = d.checkedAt && now - d.checkedAt > 2 * MIN ? 'active' : 'provisioning';
    if (state === 'failed') ssl = 'none';
    return { ...d, state, ssl, records: recordsFor(d.host) };
  });
}

/** Add a custom domain. → '' or why it can't be added. */
export function addDomain(input) {
  const host = String(input || '').trim().toLowerCase().replace(/^https?:\/\//, '').replace(/\/.*$/, '').replace(/^www\./, '');
  if (!/^([a-z0-9-]+\.)+[a-z]{2,}$/.test(host)) return 'Enter a domain like gridshop.com.bd.';
  if (host.endsWith('.' + SUBDOMAIN_BASE)) return 'That is a GridCommerce address. Change it above.';
  const st = load();
  if (st.list.some((d) => d.host === host)) return 'This domain is already added.';
  st.list = [...st.list, { host, addedAt: Date.now(), primary: false, state: 'pending', ssl: 'none', checkedAt: 0 }];
  logChanges({ formId: 'domains', changes: [{ field: 'domain:' + host, label: 'Custom domain', from: '', to: host + ' (added)' }] });
  save(st);
  return '';
}

/** Check the DNS records now. */
export function checkDomain(host, now = Date.now()) {
  const st = load();
  let fail = false;
  try { fail = new URLSearchParams(window.location.search).get('dns') === 'failed'; } catch { /* ignore */ }
  st.list = st.list.map((d) => (d.host === host ? { ...d, state: 'verifying', ssl: 'none', checkedAt: now, fail } : d));
  save(st);
}

/** Send customers to this domain. Only a verified domain with SSL can be primary. */
export function makePrimary(host) {
  const d = getDomains().find((x) => x.host === host);
  if (!d || d.state !== 'verified' || d.ssl !== 'active') return 'Verify the domain and wait for SSL first.';
  const st = load();
  const before = (st.list.find((x) => x.primary) || {}).host || st.sub + '.' + SUBDOMAIN_BASE;
  st.list = st.list.map((x) => ({ ...x, primary: x.host === host }));
  logChanges({ formId: 'domains', changes: [{ field: 'primary', label: 'Primary domain', from: before, to: host }] });
  save(st);
  return '';
}
/** Make the GridCommerce address primary again. */
export function primaryToSub() {
  const st = load();
  const before = (st.list.find((x) => x.primary) || {}).host;
  if (!before) return;
  st.list = st.list.map((x) => ({ ...x, primary: false }));
  logChanges({ formId: 'domains', changes: [{ field: 'primary', label: 'Primary domain', from: before, to: st.sub + '.' + SUBDOMAIN_BASE }] });
  save(st);
}

export function removeDomain(host) {
  const st = load();
  const d = st.list.find((x) => x.host === host);
  if (!d) return;
  st.list = st.list.filter((x) => x.host !== host);
  logChanges({ formId: 'domains', changes: [{ field: 'domain:' + host, label: 'Custom domain', from: host, to: 'Removed' + (d.primary ? ' (customers now go to ' + st.sub + '.' + SUBDOMAIN_BASE + ')' : '') }] });
  save(st);
}
