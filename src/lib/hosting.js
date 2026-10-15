// hosting — the store's hosting on GridCommerce (Settings › Hosting, /set-hosting): everything a merchant would set at a
// web host, in one place. Domains themselves are lib/domains.js (connect, verify, primary); mailboxes are Business email
// (lib/platform/mail.js). This lib adds:
//   DNS        a zone per custom domain. mode 'gc' = GridCommerce DNS (the domain's nameservers point at us; we keep
//              every record) or 'registrar' (the registrar keeps DNS; we list the records it must hold and check them).
//              Records A, AAAA, CNAME, MX, TXT, SRV, CAA, NS with TTL; the store's own records are `sys` (locked); email
//              records are `managed: 'email'` (kept by the Email tab). Changes go live after LIVE_MS (like propagation).
//              DNSSEC (DS record at the registrar), zone import (BIND text) and export.
//   Email      per domain: who hosts the mailboxes (Business email, Google Workspace, Microsoft 365, Zoho, another, none),
//              whether order emails are sent from the shop's own domain through GridCommerce, and the records that makes:
//              MX, SPF (one record, built from every sender; 10-lookup check), DKIM (GridCommerce `gc1` + the provider's
//              selector), bounce CNAME, DMARC (policy builder), MTA-STS + TLS reports. `emailRecords`, `emailStatus`,
//              `applyEmailRecords` (GridCommerce DNS) or `checkEmail` (registrar), `testEmail`.
//   SSL & security   certificates per domain (auto, 90 days, renew), a custom certificate (Business plan), Force HTTPS,
//              HSTS, minimum TLS, www or bare domain, security headers, request limits, challenge mode, blocked
//              countries and IPs, a password on the store before launch.
//   Speed      CDN cache times, purge, image formats and size, compression, HTTP/3, a speed test (3G phone).
//   Files      site-verification meta tags (read by the storefront head, components/seo/SeoHead.jsx) and files served
//              from the domain's root (ads.txt, security.txt, Apple Pay …); robots.txt and sitemap stay in SEO.
//   Backups    snapshots of the website and settings data kept in this browser (back up, download, upload, restore;
//              a snapshot is taken before every restore) and the daily backups GridCommerce keeps (restoring one is a
//              request: the server does it).
//   Usage      bandwidth, requests and storage this month against the plan.
// Front end only (gc.hosting, gc.hosting.backups; event gc:hosting). On the live platform the DNS servers, the CDN and
// the certificate service do this work; the demo moves states on with the clock.

import { getDomains, subdomainOf, recordsFor, SUBDOMAIN_BASE, DOMAINS_EVENT } from './domains';
import { domainOf as mailDomainOf, recordsOf as mailRecordsOf } from './platform/mail';
import { logChanges } from './settingsHistory';
import { currentPlanId } from './plans';
import { storageBytes } from './files';

const KEY = 'gc.hosting';
const BACKUP_KEY = 'gc.hosting.backups';
export const HOSTING_EVENT = 'gc:hosting';
export { DOMAINS_EVENT };
export const LIVE_MS = 20000;
export const NS_MS = 30000;
const DAY = 864e5;
const ssr = () => typeof window === 'undefined';

export const NAMESERVERS = ['ns1.gridcommerce.com.bd', 'ns2.gridcommerce.com.bd'];
export const TYPES = ['A', 'AAAA', 'CNAME', 'MX', 'TXT', 'SRV', 'CAA', 'NS'];
export const TYPE_HELP = {
  A: 'Points a name to an IPv4 address', AAAA: 'Points a name to an IPv6 address', CNAME: 'Makes a name an alias of another name',
  MX: 'Where email for the domain is delivered', TXT: 'Text, for verification, SPF, DKIM or DMARC', SRV: 'A service and its port (calls, chat)',
  CAA: 'Which certificate authorities may issue certificates', NS: 'Hands a subdomain to other nameservers',
};
export const TTLS = [[0, 'Auto'], [60, '1 minute'], [300, '5 minutes'], [1800, '30 minutes'], [3600, '1 hour'], [43200, '12 hours'], [86400, '1 day']];
export const ttlLabel = (s) => (TTLS.find((t) => t[0] === Number(s)) || [0, s + ' s'])[1];

const GC_SEND = { spf: '_spf.mail.gridcommerce.net', dkim: 'gc1.dkim.gridcommerce.net', bounce: 'bounce.mail.gridcommerce.net', mtasts: 'mta-sts.gridcommerce.net' };
const dashed = (host) => host.replace(/\./g, '-');
/** Mailbox providers and what each needs. `paste`: the provider gives the DKIM key, the merchant pastes it. */
export const PROVIDERS = {
  none: { label: 'No mailboxes on this domain', short: 'None' },
  gc: { label: 'GridCommerce Business email', short: 'Business email', mx: () => [[10, 'mx1.mail.gridcommerce.net'], [20, 'mx2.mail.gridcommerce.net']], spf: GC_SEND.spf },
  google: { label: 'Google Workspace', short: 'Google', mx: () => [[1, 'smtp.google.com']], spf: '_spf.google.com', dkim: { selector: 'google', type: 'TXT', paste: true, where: 'Google Admin › Apps › Gmail › Authenticate email' } },
  microsoft: { label: 'Microsoft 365', short: 'Microsoft', mx: (h) => [[0, dashed(h) + '.mail.protection.outlook.com']], spf: 'spf.protection.outlook.com', dkim: { selector: 'selector1', type: 'CNAME', value: (h) => 'selector1-' + dashed(h) + '._domainkey.dazzleshop.onmicrosoft.com', where: 'Microsoft Defender › Email authentication › DKIM' } },
  zoho: { label: 'Zoho Mail', short: 'Zoho', mx: () => [[10, 'mx.zoho.com'], [20, 'mx2.zoho.com'], [50, 'mx3.zoho.com']], spf: 'zoho.com', dkim: { selector: 'zmail', type: 'TXT', paste: true, where: 'Zoho Mail Admin › Domains › Email configuration › DKIM' } },
  other: { label: 'Another provider', short: 'Other', custom: true },
};
/** Lookups each include costs (SPF allows 10 in all). */
const SPF_COST = { '_spf.google.com': 4, 'spf.protection.outlook.com': 2, 'zoho.com': 2, [GC_SEND.spf]: 1 };

// ---- seed ----------------------------------------------------------------------------------------------------------------
const rid = () => 'r' + Math.random().toString(36).slice(2, 9);
function sysRecords(host, since) {
  return recordsFor(host).map((r) => ({ id: rid(), type: r.type, name: r.name, value: r.value, ttl: 0, sys: true, since }));
}
function demoZone(host, t) {
  const old = t - 40 * DAY;
  const rec = (type, name, value, extra = {}) => ({ id: rid(), type, name, value, ttl: 0, since: old, ...extra });
  return {
    mode: 'gc', nsSince: old, nsChecked: old, dnssec: { on: false, since: 0, checked: 0 },
    records: [
      ...sysRecords(host, old),
      rec('MX', '@', 'smtp.google.com', { priority: 1, managed: 'email' }),
      rec('TXT', '@', `v=spf1 include:_spf.google.com include:${GC_SEND.spf} ~all`, { managed: 'email' }),
      rec('TXT', 'google._domainkey', 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtq3XbB1vVY2…QIDAQAB', { managed: 'email' }),
      rec('CNAME', 'gc1._domainkey', GC_SEND.dkim, { managed: 'email' }),
      rec('CNAME', 'bounce', GC_SEND.bounce, { managed: 'email' }),
      rec('TXT', '_dmarc', `v=DMARC1; p=none; rua=mailto:dmarc@${host}; adkim=r; aspf=r; pct=100`, { managed: 'email' }),
      rec('TXT', '@', 'google-site-verification=Q7pXr2Kc9mWv4hT1sYdLzE8uNfB3aJ0oGiR5xC6eHkM'),
      rec('TXT', '@', 'facebook-domain-verification=k2m9x7q4w1z8c5v3b6n0p'),
      rec('CAA', '@', 'letsencrypt.org', { flags: 0, tag: 'issue' }),
      rec('A', 'cctv', '103.112.54.20', { ttl: 3600 }),
    ],
  };
}
function blankEmail(host, provider = 'none') {
  return { provider, gcSending: true, dkimValue: '', otherMx: '', spfExtra: '', spfAll: '~all', dmarc: { policy: 'none', pct: 100, rua: 'dmarc@' + host, adkim: 'r', aspf: 'r', sp: '' }, mtasts: false, checks: {} };
}
function seed(t) {
  const host = 'dazzleshop.com.bd';
  const email = blankEmail(host, 'google');
  email.dkimValue = 'v=DKIM1; k=rsa; p=MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAtq3XbB1vVY2…QIDAQAB';
  return {
    v: 1,
    zones: { [host]: demoZone(host, t) },
    email: { [host]: email },
    ssl: { issued: { [host]: t - 41 * DAY, [subdomainOf() + '.' + SUBDOMAIN_BASE]: t - 12 * DAY }, renewing: {}, custom: {} },
    security: {
      forceHttps: true, hsts: { on: false, maxAge: 15552000, sub: false, preload: false }, tls: '1.2', canonical: 'apex',
      headers: { frame: true, sniff: true, referrer: 'strict-origin-when-cross-origin' },
      rate: { on: true, perMin: 60 }, challenge: false, countries: [], ips: ['185.220.101.0/24'], password: { on: false, value: '' },
    },
    speed: { pageTtl: 300, assetTtl: 2592000, webp: true, avif: false, maxWidth: 1600, quality: 80, brotli: true, http3: true, purges: [], tests: [] },
    files: {
      meta: { google: 'Q7pXr2Kc9mWv4hT1sYdLzE8uNfB3aJ0oGiR5xC6eHkM', bing: '', meta: 'k2m9x7q4w1z8c5v3b6n0p', pinterest: '', yandex: '' },
      list: [
        { path: '/ads.txt', body: 'google.com, pub-4827361950284716, DIRECT, f08c47fec0942fa0', at: t - 20 * DAY },
        { path: '/.well-known/security.txt', body: `Contact: mailto:security@${host}\nExpires: 2027-10-01T00:00:00.000Z\nPreferred-Languages: en, bn`, at: t - 20 * DAY },
      ],
    },
    requests: [],
  };
}

// ---- storage -------------------------------------------------------------------------------------------------------------
let cache = { raw: undefined, db: null };
export function read() {
  if (ssr()) return seed(0);
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== 1) { db = seed(Date.now()); write(db, true); return db; }
  cache = { raw, db };
  return db;
}
function write(db, quiet) {
  try { const raw = JSON.stringify(db); window.localStorage.setItem(KEY, raw); cache = { raw, db }; if (!quiet) window.dispatchEvent(new CustomEvent(HOSTING_EVENT)); } catch { /* storage full */ }
}
const fail = (error, field) => ({ ok: false, error, field });
function change(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, Date.now());
  if (res && res.ok === false) return res;
  write(db);
  return res || { ok: true };
}
const log = (changes) => logChanges({ formId: 'hosting', changes });

// ---- domains with a zone ---------------------------------------------------------------------------------------------
/** The custom domains (from Domains) with their zone; a domain without a zone yet gets a registrar-mode one. */
export function hostedDomains(t = Date.now()) {
  const db = read();
  return getDomains(t).map((d) => ({ ...d, zone: db.zones[d.host] || { mode: 'registrar', records: sysRecords(d.host, 0), dnssec: { on: false } } }));
}
export function zoneOf(host) {
  const z = read().zones[host];
  return z || { mode: 'registrar', nsSince: 0, nsChecked: 0, dnssec: { on: false, since: 0, checked: 0 }, records: sysRecords(host, 0) };
}
const ensureZone = (db, host) => { if (!db.zones[host]) db.zones[host] = { mode: 'registrar', nsSince: 0, nsChecked: 0, dnssec: { on: false, since: 0, checked: 0 }, records: sysRecords(host, 0) }; return db.zones[host]; };
/** 'active' | 'checking' | 'pending' — are the domain's nameservers ours yet? */
export function nsState(z, t = Date.now()) {
  if (z.mode !== 'gc') return 'off';
  if (!z.nsChecked) return 'pending';
  return t - z.nsChecked >= NS_MS ? 'active' : 'checking';
}
/** A record's state: live, or still spreading to the world's DNS. */
export const recState = (r, t = Date.now()) => (!r.since || t - r.since >= LIVE_MS ? 'live' : 'updating');

export function setDnsMode(host, mode) {
  if (!['gc', 'registrar'].includes(mode)) return fail('Choose how DNS is kept.');
  return change((db, t) => {
    const z = ensureZone(db, host);
    if (z.mode === mode) return { ok: true };
    z.mode = mode; z.nsChecked = 0; z.nsSince = t;
    // every record the store needs is kept either way
    if (!z.records.some((r) => r.sys)) z.records = [...sysRecords(host, t), ...z.records];
    log([{ field: 'dns:' + host, label: 'DNS for ' + host, from: mode === 'gc' ? 'At the registrar' : 'GridCommerce DNS', to: mode === 'gc' ? 'GridCommerce DNS' : 'At the registrar' }]);
    return { ok: true };
  });
}
export const checkNameservers = (host) => change((db, t) => { const z = ensureZone(db, host); z.nsChecked = t; return { ok: true }; });

// ---- record checks -----------------------------------------------------------------------------------------------------
const IPV4 = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}$/;
const IPV6 = /^[0-9a-f:]+$/i;
const HOSTNAME = /^(?=.{1,253}$)([a-z0-9_]([a-z0-9_-]{0,61}[a-z0-9])?\.)*[a-z0-9]([a-z0-9-]{0,61}[a-z0-9])?\.?$/i;
const NAME = /^(@|\*|(\*\.)?[a-z0-9_]([a-z0-9_.-]{0,62})?)$/i;
const same = (a, b) => String(a || '').trim().replace(/\.$/, '').toLowerCase() === String(b || '').trim().replace(/\.$/, '').toLowerCase();

/** Problems with a record before it is saved ('' when fine). */
export function recordProblem(r, records = []) {
  const name = String(r.name || '').trim().toLowerCase() || '@';
  const value = String(r.value || '').trim();
  if (!TYPES.includes(r.type)) return 'Choose a record type.';
  if (!NAME.test(name)) return 'The name can use letters, numbers, dashes, dots and underscores, or @ for the domain itself.';
  if (!value) return 'Enter a value.';
  const others = records.filter((x) => x.id !== r.id && (x.name || '@').toLowerCase() === name);
  if (r.type === 'CNAME' && name === '@') return 'The domain itself can’t be a CNAME. Use an A record.';
  if (r.type === 'CNAME' && others.length) return `“${name}” already has other records. A CNAME must be the only record on its name.`;
  if (r.type !== 'CNAME' && others.some((x) => x.type === 'CNAME')) return `“${name}” is a CNAME. Remove it first, or use another name.`;
  if (r.type === 'A' && !IPV4.test(value)) return 'An A record needs an IPv4 address, like 103.112.54.20.';
  if (r.type === 'AAAA' && !(IPV6.test(value) && value.includes(':'))) return 'An AAAA record needs an IPv6 address, like 2001:db8::1.';
  if (['CNAME', 'MX', 'NS'].includes(r.type) && !HOSTNAME.test(value)) return 'Enter a host name, like mail.example.com.';
  if (r.type === 'NS' && name === '@') return 'The domain’s own nameservers are set at the registrar.';
  if (r.type === 'MX' || r.type === 'SRV') { const p = Number(r.priority); if (!Number.isInteger(p) || p < 0 || p > 65535) return 'Priority is a number from 0 to 65535.'; }
  if (r.type === 'SRV') {
    if (!/^_[a-z0-9-]+\._(tcp|udp|tls)(\.|$)/i.test(name)) return 'An SRV name looks like _sip._tcp.';
    const port = Number(r.port); if (!Number.isInteger(port) || port < 1 || port > 65535) return 'Enter the port (1–65535).';
    const w = Number(r.weight); if (!Number.isInteger(w) || w < 0 || w > 65535) return 'Weight is a number from 0 to 65535.';
    if (!HOSTNAME.test(value)) return 'The target is a host name.';
  }
  if (r.type === 'CAA') {
    if (!['issue', 'issuewild', 'iodef'].includes(r.tag)) return 'Choose what the CAA record allows.';
    if (r.tag !== 'iodef' && !HOSTNAME.test(value)) return 'Enter the authority’s domain, like letsencrypt.org.';
  }
  if (r.type === 'TXT' && value.length > 2048) return 'TXT text can be 2,048 characters at most.';
  if (r.type === 'TXT' && /^v=spf1/i.test(value) && records.some((x) => x.id !== r.id && x.type === 'TXT' && (x.name || '@').toLowerCase() === name && /^v=spf1/i.test(x.value))) return 'A name can have only one SPF record. Edit the one you have (Email tab).';
  if (records.some((x) => x.id !== r.id && x.type === r.type && (x.name || '@').toLowerCase() === name && same(x.value, value))) return 'This record is already there.';
  return '';
}

/** Add or change a record (GridCommerce DNS only). The store's own records can't be changed here. */
export function saveRecord(host, rec) {
  return change((db, t) => {
    const z = ensureZone(db, host);
    if (z.mode !== 'gc') return fail('Your registrar keeps this domain’s DNS. Change records there, or switch to GridCommerce DNS.');
    const old = rec.id ? z.records.find((x) => x.id === rec.id) : null;
    if (old && old.sys) return fail('The store needs this record, so it can’t be changed.');
    const r = { ...(old || {}), ...rec, name: String(rec.name || '').trim().toLowerCase() || '@', value: String(rec.value || '').trim(), ttl: Number(rec.ttl) || 0, since: t };
    const why = recordProblem(r, z.records);
    if (why) return fail(why, 'value');
    if (!['MX', 'SRV'].includes(r.type)) delete r.priority;
    if (r.type !== 'SRV') { delete r.weight; delete r.port; }
    if (r.type !== 'CAA') { delete r.flags; delete r.tag; }
    if (old) { z.records = z.records.map((x) => (x.id === old.id ? r : x)); log([{ field: 'dns:' + host + ':' + r.type + ':' + r.name, label: `${host} · ${r.type} ${r.name}`, from: old.value, to: r.value }]); } else {
      r.id = rid(); z.records.push(r); log([{ field: 'dns:' + host + ':' + r.type + ':' + r.name, label: `${host} · ${r.type} ${r.name}`, from: '', to: r.value + ' (added)' }]);
    }
    return { ok: true, id: r.id };
  });
}
export function deleteRecord(host, id) {
  return change((db) => {
    const z = ensureZone(db, host);
    const r = z.records.find((x) => x.id === id);
    if (!r) return fail('That record is gone.');
    if (r.sys) return fail('The store needs this record, so it can’t be deleted.');
    z.records = z.records.filter((x) => x.id !== id);
    log([{ field: 'dns:' + host + ':' + r.type + ':' + r.name, label: `${host} · ${r.type} ${r.name}`, from: r.value, to: 'Deleted' }]);
    return { ok: true };
  });
}

/** Ready-made records for common services. `ask` = what the merchant must paste. */
export const TEMPLATES = [
  { id: 'gsc', label: 'Google Search Console', ask: 'The google-site-verification code', make: (v) => [{ type: 'TXT', name: '@', value: 'google-site-verification=' + v.replace(/^google-site-verification=/, '') }] },
  { id: 'meta', label: 'Meta (Facebook) domain verification', ask: 'The facebook-domain-verification code', make: (v) => [{ type: 'TXT', name: '@', value: 'facebook-domain-verification=' + v.replace(/^facebook-domain-verification=/, '') }] },
  { id: 'bing', label: 'Bing Webmaster Tools', ask: 'The CNAME code Bing shows (the part before .verify)', make: (v) => [{ type: 'CNAME', name: v.trim().toLowerCase(), value: 'verify.bing.com' }] },
  { id: 'caa', label: 'Only Let’s Encrypt may issue certificates', make: () => [{ type: 'CAA', name: '@', value: 'letsencrypt.org', flags: 0, tag: 'issue' }] },
  { id: 'zoom', label: 'Zoom domain verification', ask: 'The ZOOM_verify code', make: (v) => [{ type: 'TXT', name: '@', value: 'ZOOM_verify_' + v.replace(/^ZOOM_verify_/, '') }] },
  { id: 'sip', label: 'Phone system (SIP)', ask: 'The SIP server’s host name', make: (v) => [{ type: 'SRV', name: '_sip._tls', value: v.trim(), priority: 10, weight: 5, port: 5061 }] },
];
export function addTemplate(host, id, answer) {
  const tpl = TEMPLATES.find((x) => x.id === id);
  if (!tpl) return fail('Choose a service.');
  if (tpl.ask && !String(answer || '').trim()) return fail('Paste ' + tpl.ask.toLowerCase() + '.', 'answer');
  const recs = tpl.make(String(answer || '').trim());
  for (const r of recs) { const res = saveRecord(host, { ...r, ttl: 0 }); if (!res.ok) return res; }
  return { ok: true, count: recs.length };
}

/** BIND zone text → records (SOA and the domain's own NS are skipped). */
export function parseZone(text, host) {
  const out = [], skipped = [];
  String(text || '').split(/\r?\n/).forEach((line0) => {
    const line = line0.replace(/;.*$/, '').trim();
    if (!line || line.startsWith('$')) return;
    const parts = line.match(/"[^"]*"|\S+/g) || [];
    let i = 0;
    let name = parts[i++];
    if (/^\d+$/.test(parts[i])) i++;                // TTL
    if (/^IN$/i.test(parts[i])) i++;
    const type = String(parts[i++] || '').toUpperCase();
    if (!TYPES.includes(type) || (type === 'NS' && (name === '@' || same(name, host + '.')))) { if (type !== 'SOA') skipped.push(line); return; }
    name = name.replace(new RegExp('\\.?' + host.replace(/\./g, '\\.') + '\\.?$', 'i'), '') || '@';
    const rest = parts.slice(i);
    const r = { type, name, ttl: 0 };
    if (type === 'MX') { r.priority = Number(rest[0]); r.value = String(rest[1] || '').replace(/\.$/, ''); }
    else if (type === 'SRV') { r.priority = Number(rest[0]); r.weight = Number(rest[1]); r.port = Number(rest[2]); r.value = String(rest[3] || '').replace(/\.$/, ''); }
    else if (type === 'CAA') { r.flags = Number(rest[0]); r.tag = rest[1]; r.value = String(rest[2] || '').replace(/"/g, ''); }
    else if (type === 'TXT') r.value = rest.join('').replace(/"/g, '');
    else r.value = String(rest[0] || '').replace(/\.$/, '');
    out.push(r);
  });
  return { records: out, skipped };
}
export function importZone(host, text) {
  const { records, skipped } = parseZone(text, host);
  if (!records.length) return fail('No records found. Paste lines like: www 3600 IN CNAME example.com.');
  let added = 0; const problems = [];
  records.forEach((r) => { const res = saveRecord(host, r); if (res.ok) added++; else problems.push(`${r.type} ${r.name}: ${res.error}`); });
  return { ok: true, added, skipped: skipped.length, problems };
}
/** The zone as a BIND file. */
export function exportZone(host) {
  const z = zoneOf(host);
  const q = (s) => '"' + String(s).replace(/"/g, '\\"') + '"';
  const lines = [`$ORIGIN ${host}.`, '$TTL 300', ...NAMESERVERS.map((n) => `@\t300\tIN\tNS\t${n}.`)];
  z.records.forEach((r) => {
    const ttl = r.ttl || 300;
    const v = r.type === 'MX' ? `${r.priority} ${r.value}.` : r.type === 'SRV' ? `${r.priority} ${r.weight} ${r.port} ${r.value}.` : r.type === 'CAA' ? `${r.flags || 0} ${r.tag} ${q(r.value)}` : r.type === 'TXT' ? (r.value.match(/.{1,255}/g) || ['']).map(q).join(' ') : ['CNAME', 'NS'].includes(r.type) ? r.value + '.' : r.value;
    lines.push(`${r.name}\t${ttl}\tIN\t${r.type}\t${v}`);
  });
  return lines.join('\n') + '\n';
}
/** DNSSEC: the DS record the registrar must hold. */
export const dsRecord = (host) => { let h = 11; for (const c of host) h = (h * 33 + c.charCodeAt(0)) % 65000; return { keyTag: 10000 + (h % 50000), algorithm: 13, digestType: 2, digest: (host + 'gcdnssec').split('').map((c) => c.charCodeAt(0).toString(16)).join('').slice(0, 64).toUpperCase().padEnd(64, '0') }; };
export function dnssecState(z, t = Date.now()) {
  const d = z.dnssec || {};
  if (!d.on) return 'off';
  if (!d.checked) return 'waiting';
  return t - d.checked >= LIVE_MS ? 'active' : 'checking';
}
export const setDnssec = (host, on) => change((db, t) => { const z = ensureZone(db, host); if (z.mode !== 'gc') return fail('DNSSEC needs GridCommerce DNS.'); z.dnssec = { on: !!on, since: t, checked: 0 }; log([{ field: 'dnssec:' + host, label: 'DNSSEC for ' + host, from: on ? 'Off' : 'On', to: on ? 'On' : 'Off' }]); return { ok: true }; });
export const checkDnssec = (host) => change((db, t) => { const z = ensureZone(db, host); z.dnssec = { ...(z.dnssec || {}), checked: t }; return { ok: true }; });

// ---- email -------------------------------------------------------------------------------------------------------------
/** Business email that runs on this domain (it then decides the mailbox records). */
function bizMail(host) { try { const d = mailDomainOf(); return d && d.domain === host && d.state !== 'removed' ? d : null; } catch { return null; } }
export function emailOf(host) {
  const e = read().email[host] || blankEmail(host);
  return bizMail(host) ? { ...e, provider: 'gc', biz: true } : e;
}
export function saveEmail(host, patch) {
  return change((db) => {
    const cur = db.email[host] || blankEmail(host);
    const next = { ...cur, ...patch, dmarc: { ...cur.dmarc, ...(patch.dmarc || {}) } };
    if (!PROVIDERS[next.provider]) return fail('Choose who hosts your mailboxes.');
    if (next.dmarc.rua && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(next.dmarc.rua)) return fail('The report address must be an email address.', 'rua');
    const pct = Number(next.dmarc.pct); if (!Number.isInteger(pct) || pct < 1 || pct > 100) return fail('Apply the policy to 1–100% of mail.', 'pct');
    if (next.provider === 'other' && next.otherMx && next.otherMx.split(/[\n,]+/).some((l) => l.trim() && !HOSTNAME.test(l.trim().split(/\s+/).pop()))) return fail('Write each mail server as “priority host”, like 10 mail.example.com.', 'otherMx');
    if (next.spfExtra && next.spfExtra.split(/[\s,]+/).some((x) => x && !HOSTNAME.test(x.replace(/^include:/, '')))) return fail('Other senders are domains, like sendgrid.net.', 'spfExtra');
    const changes = [];
    Object.keys(patch).forEach((k) => { if (k !== 'dmarc' && JSON.stringify(cur[k]) !== JSON.stringify(next[k])) changes.push({ field: 'email:' + host + ':' + k, label: `${host} · email ${k}`, from: String(cur[k] ?? ''), to: String(next[k] ?? '') }); });
    if (patch.dmarc) changes.push({ field: 'email:' + host + ':dmarc', label: `${host} · DMARC`, from: dmarcValue(host, cur), to: dmarcValue(host, next) });
    next.checks = {};
    db.email[host] = next;
    log(changes);
    return { ok: true };
  });
}
function spfIncludes(host, e) {
  const list = [];
  const p = PROVIDERS[e.provider];
  if (p && p.spf) list.push(p.spf);
  if (e.gcSending && !list.includes(GC_SEND.spf)) list.push(GC_SEND.spf);
  String(e.spfExtra || '').split(/[\s,]+/).map((x) => x.replace(/^include:/, '').trim()).filter(Boolean).forEach((x) => { if (!list.includes(x)) list.push(x); });
  return list;
}
export const spfValue = (host, e) => `v=spf1 ${spfIncludes(host, e).map((x) => 'include:' + x).join(' ')} ${e.spfAll || '~all'}`.replace(/\s+/g, ' ');
export const spfLookups = (host, e) => spfIncludes(host, e).reduce((a, x) => a + (SPF_COST[x] || 2), 0);
export function dmarcValue(host, e) {
  const d = e.dmarc || {};
  return ['v=DMARC1', 'p=' + (d.policy || 'none'), d.sp ? 'sp=' + d.sp : '', d.rua ? 'rua=mailto:' + d.rua : '', 'adkim=' + (d.adkim || 'r'), 'aspf=' + (d.aspf || 'r'), 'pct=' + (d.pct || 100)].filter(Boolean).join('; ');
}
/** The records email needs on this domain, each with why. */
export function emailRecords(host, e = emailOf(host)) {
  const out = [];
  const p = PROVIDERS[e.provider] || PROVIDERS.none;
  const biz = bizMail(host);
  if (biz) {
    mailRecordsOf(biz).forEach((r) => {
      if (r.id === 'mx') [[10, 'mx1.mail.gridcommerce.net'], [20, 'mx2.mail.gridcommerce.net']].forEach(([pr, v]) => out.push({ key: 'mx-' + pr, type: 'MX', name: '@', value: v, priority: pr, why: 'Brings mail to your Business email mailboxes' }));
      if (r.id === 'dkim') out.push({ key: 'dkim-provider', type: 'TXT', name: r.host, value: r.value, why: 'Signs mail from your mailboxes' });
    });
  } else if (p.mx) p.mx(host).forEach(([pr, v]) => out.push({ key: 'mx-' + pr, type: 'MX', name: '@', value: v, priority: pr, why: 'Brings mail to your ' + p.short + ' mailboxes' }));
  else if (e.provider === 'other') String(e.otherMx || '').split(/[\n,]+/).map((l) => l.trim()).filter(Boolean).forEach((l, i) => { const [a, b] = l.split(/\s+/); out.push({ key: 'mx-o' + i, type: 'MX', name: '@', value: b || a, priority: b ? Number(a) || 10 : 10, why: 'Brings mail to your mailboxes' }); });
  if (spfIncludes(host, e).length) out.push({ key: 'spf', type: 'TXT', name: '@', value: spfValue(host, e), why: 'Lists who may send mail as your domain' });
  if (!biz && p.dkim) {
    const v = p.dkim.paste ? e.dkimValue : p.dkim.value(host);
    out.push({ key: 'dkim-provider', type: p.dkim.type, name: p.dkim.selector + '._domainkey', value: v || '', missingValue: !v, why: 'Signs mail from your ' + p.short + ' mailboxes', where: p.dkim.where });
  }
  if (e.gcSending) {
    out.push({ key: 'dkim-gc', type: 'CNAME', name: 'gc1._domainkey', value: GC_SEND.dkim, why: 'Signs order emails GridCommerce sends for you' });
    out.push({ key: 'bounce', type: 'CNAME', name: 'bounce', value: GC_SEND.bounce, why: 'Bounced order emails come back to GridCommerce, not to you' });
  }
  if (e.provider !== 'none' || e.gcSending) out.push({ key: 'dmarc', type: 'TXT', name: '_dmarc', value: dmarcValue(host, e), why: 'Tells other servers what to do with mail that fails the checks' });
  if (e.mtasts && e.provider !== 'none') {
    out.push({ key: 'mtasts-txt', type: 'TXT', name: '_mta-sts', value: 'v=STSv1; id=' + host.length + '2026', why: 'Asks senders to deliver your mail only over encryption' });
    out.push({ key: 'mtasts-cname', type: 'CNAME', name: 'mta-sts', value: GC_SEND.mtasts, why: 'Serves the MTA-STS policy file' });
    out.push({ key: 'tlsrpt', type: 'TXT', name: '_smtp._tls', value: 'v=TLSRPTv1; rua=mailto:' + (e.dmarc.rua || 'dmarc@' + host), why: 'Sends reports when encrypted delivery fails' });
  }
  return out;
}
/** Each email record's state: ok · updating · missing · wrong (another value is there) · unknown (registrar, not checked) · checking. */
export function emailStatus(host, t = Date.now()) {
  const z = zoneOf(host), e = emailOf(host);
  return emailRecords(host, e).map((need) => {
    if (need.missingValue) return { ...need, state: 'needs-value' };
    if (z.mode === 'gc') {
      const there = z.records.filter((r) => r.type === need.type && (r.name || '@') === need.name);
      const hit = there.find((r) => same(r.value, need.value) && (need.type !== 'MX' || Number(r.priority) === need.priority));
      if (hit) return { ...need, state: recState(hit, t) === 'live' ? 'ok' : 'updating', record: hit };
      const wrong = need.key === 'spf' ? there.find((r) => /^v=spf1/i.test(r.value)) : need.key === 'dmarc' ? there.find((r) => /^v=DMARC1/i.test(r.value)) : null;
      return { ...need, state: wrong ? 'wrong' : 'missing', record: wrong || null };
    }
    const c = (e.checks || {})[need.key];
    if (!c) return { ...need, state: 'unknown' };
    return { ...need, state: t - c.at >= LIVE_MS ? (c.fail ? 'missing' : 'ok') : 'checking' };
  });
}
/** GridCommerce DNS: write every email record into the zone (old SPF / DMARC / MX replaced). */
export function applyEmailRecords(host) {
  const needs = emailRecords(host);
  if (needs.some((n) => n.missingValue)) return fail('Paste the DKIM key from your mail provider first.');
  return change((db, t) => {
    const z = ensureZone(db, host);
    if (z.mode !== 'gc') return fail('Your registrar keeps this domain’s DNS. Add the records there.');
    const e = db.email[host] || blankEmail(host);
    // what email used to own goes: every MX on the domain, the SPF, DMARC and the records this tab adds
    const ours = (r) => r.managed === 'email' || (r.type === 'MX' && r.name === '@') || (r.type === 'TXT' && r.name === '@' && /^v=spf1/i.test(r.value)) || (r.type === 'TXT' && r.name === '_dmarc');
    // a record that already says the right thing stays as it is (and stays live); the rest is replaced
    const fits = (r, n) => r.type === n.type && (r.name || '@') === n.name && same(r.value, n.value) && (n.type !== 'MX' || Number(r.priority) === n.priority);
    const keep = z.records.filter((r) => ours(r) && needs.some((n) => fits(r, n)));
    const gone = z.records.filter((r) => ours(r) && !keep.includes(r));
    z.records = z.records.filter((r) => !ours(r) || keep.includes(r)).map((r) => (keep.includes(r) ? { ...r, managed: 'email' } : r));
    const fresh = needs.filter((n) => !keep.some((r) => fits(r, n)));
    fresh.forEach((n) => z.records.push({ id: rid(), type: n.type, name: n.name, value: n.value, ttl: 0, ...(n.type === 'MX' ? { priority: n.priority } : {}), managed: 'email', since: t }));
    db.email[host] = { ...e, checks: {} };
    if (fresh.length || gone.length) log([{ field: 'email-records:' + host, label: `${host} · email records`, from: gone.map((r) => r.type + ' ' + r.name).join(', ') || '—', to: fresh.map((n) => n.type + ' ' + n.name).join(', ') || 'removed' }]);
    return { ok: true, count: fresh.length };
  });
}
/** Registrar DNS: check the records now (the demo finds them a moment later; ?dns=failed fails the DKIM one). */
export function checkEmail(host) {
  let failing = false;
  try { failing = new URLSearchParams(window.location.search).get('dns') === 'failed'; } catch { /* ignore */ }
  return change((db, t) => {
    const e = db.email[host] || blankEmail(host);
    e.checks = Object.fromEntries(emailRecords(host).map((n) => [n.key, { at: t, fail: failing && n.key.startsWith('dkim') }]));
    db.email[host] = e;
    return { ok: true };
  });
}
/** A test message from orders@<host>: how SPF, DKIM and DMARC come out. */
export function testEmail(host) {
  const st = emailStatus(host);
  const ok = (k) => st.some((s) => s.key === k && s.state === 'ok');
  const e = emailOf(host);
  const spf = ok('spf') && e.gcSending ? 'pass' : st.some((s) => s.key === 'spf') ? 'fail' : 'none';
  const dkim = ok('dkim-gc') ? 'pass' : e.gcSending ? 'fail' : 'none';
  const dmarc = !st.some((s) => s.key === 'dmarc' && s.state === 'ok') ? 'none' : spf === 'pass' || dkim === 'pass' ? 'pass' : 'fail';
  return { from: 'orders@' + host, spf, dkim, dmarc, inbox: dmarc === 'pass' ? 'Inbox' : dmarc === 'fail' ? 'Spam (fails DMARC)' : 'Likely spam (no DMARC)' };
}
/** DMARC reports, last 7 days (demo figures from the policy and the records). */
export function dmarcReport(host) {
  const st = emailStatus(host);
  if (!st.some((s) => s.key === 'dmarc' && s.state === 'ok')) return null;
  const allOk = st.filter((s) => s.key !== 'dmarc').every((s) => s.state === 'ok');
  const total = 1180 + host.length * 7;
  const pass = allOk ? 0.986 : 0.91;
  return { total, passed: Math.round(total * pass), sources: [['Google Workspace', allOk ? 'pass' : 'pass'], ['GridCommerce order emails', allOk ? 'pass' : 'fail'], ['Unknown (185.220.101.33)', 'fail']] };
}

// ---- SSL & security ------------------------------------------------------------------------------------------------------
export const SSL_DAYS = 90;
/** Certificates: the GridCommerce address and every verified custom domain. */
export function certificates(t = Date.now()) {
  const db = read();
  const sub = subdomainOf() + '.' + SUBDOMAIN_BASE;
  const list = [{ host: sub, free: true }, ...getDomains(t).filter((d) => d.state === 'verified').map((d) => ({ host: d.host, ssl: d.ssl, primary: d.primary }))];
  return list.map((c) => {
    const custom = db.ssl.custom[c.host];
    const renew = db.ssl.renewing[c.host];
    const renewing = renew && t - renew < LIVE_MS;
    const issued = renew && !renewing ? renew : db.ssl.issued[c.host] || t;
    const expires = custom ? custom.expires : issued + SSL_DAYS * DAY;
    const daysLeft = Math.floor((expires - t) / DAY);
    const state = c.ssl === 'provisioning' || renewing ? 'issuing' : daysLeft < 0 ? 'expired' : daysLeft <= 14 ? 'soon' : 'active';
    return { ...c, covers: c.free ? [c.host] : [c.host, 'www.' + c.host], issuer: custom ? custom.issuer : 'Let’s Encrypt (R11)', issued, expires, daysLeft, state, custom: !!custom, auto: !custom };
  });
}
export const renewCertificate = (host) => change((db, t) => { db.ssl.renewing[host] = t; db.ssl.issued[host] = t; log([{ field: 'ssl:' + host, label: 'Certificate for ' + host, from: '', to: 'Renewed' }]); return { ok: true }; });
export const canUploadCertificate = () => currentPlanId() === 'business';
export function uploadCertificate(host, cert, key) {
  if (!canUploadCertificate()) return fail('Your own certificate needs the Business plan.');
  if (!/-----BEGIN CERTIFICATE-----[\s\S]+-----END CERTIFICATE-----/.test(cert || '')) return fail('Paste the certificate, from -----BEGIN CERTIFICATE----- to -----END CERTIFICATE-----.', 'cert');
  if (!/-----BEGIN (RSA |EC )?PRIVATE KEY-----[\s\S]+-----END (RSA |EC )?PRIVATE KEY-----/.test(key || '')) return fail('Paste the private key, from -----BEGIN PRIVATE KEY----- to -----END PRIVATE KEY-----.', 'key');
  // the server reads the real dates and issuer from the certificate; the demo assumes a one-year certificate
  return change((db, t) => { db.ssl.custom[host] = { issuer: 'Your certificate', uploadedAt: t, expires: t + 365 * DAY }; log([{ field: 'ssl:' + host, label: 'Certificate for ' + host, from: 'Automatic', to: 'Uploaded' }]); return { ok: true }; });
}
export const removeCustomCertificate = (host) => change((db, t) => { delete db.ssl.custom[host]; db.ssl.issued[host] = t; db.ssl.renewing[host] = t; log([{ field: 'ssl:' + host, label: 'Certificate for ' + host, from: 'Uploaded', to: 'Automatic' }]); return { ok: true }; });

export const COUNTRIES = [['CN', 'China'], ['RU', 'Russia'], ['KP', 'North Korea'], ['IR', 'Iran'], ['NG', 'Nigeria'], ['VN', 'Vietnam'], ['BR', 'Brazil'], ['US', 'United States'], ['IN', 'India'], ['PK', 'Pakistan']];
const CIDR = /^(25[0-5]|2[0-4]\d|1?\d?\d)(\.(25[0-5]|2[0-4]\d|1?\d?\d)){3}(\/(3[0-2]|[12]?\d))?$/;
export const ipProblem = (ip) => (CIDR.test(String(ip || '').trim()) ? '' : 'Enter an IPv4 address or range, like 185.220.101.0/24.');
export const securityOf = () => read().security;
export function saveSecurity(patch) {
  return change((db) => {
    const cur = db.security;
    const next = { ...cur, ...patch, hsts: { ...cur.hsts, ...(patch.hsts || {}) }, headers: { ...cur.headers, ...(patch.headers || {}) }, rate: { ...cur.rate, ...(patch.rate || {}) }, password: { ...cur.password, ...(patch.password || {}) } };
    if (next.hsts.on && !next.forceHttps) return fail('HSTS needs Force HTTPS on.');
    if (next.hsts.preload && (!next.hsts.sub || next.hsts.maxAge < 31536000)) return fail('Preload needs subdomains included and at least one year.');
    if (next.rate.on && !(Number(next.rate.perMin) >= 10 && Number(next.rate.perMin) <= 600)) return fail('Allow 10 to 600 requests a minute.', 'perMin');
    if (next.password.on && String(next.password.value || '').length < 4) return fail('Use a password of at least 4 characters.', 'password');
    const bad = (next.ips || []).find((ip) => ipProblem(ip));
    if (bad) return fail(ipProblem(bad), 'ips');
    const flat = (o, p = '') => Object.entries(o).flatMap(([k, v]) => (v && typeof v === 'object' && !Array.isArray(v) ? flat(v, p + k + '.') : [[p + k, Array.isArray(v) ? v.join(', ') : String(v)]]));
    const was = Object.fromEntries(flat(cur));
    log(flat(next).filter(([k, v]) => was[k] !== v).map(([k, v]) => ({ field: 'security.' + k, label: 'Security · ' + k, from: k === 'password.value' ? '' : was[k], to: v, secret: k === 'password.value' })));
    db.security = next;
    return { ok: true };
  });
}

// ---- speed ---------------------------------------------------------------------------------------------------------------
export const speedOf = () => read().speed;
export function saveSpeed(patch) {
  return change((db) => {
    const next = { ...db.speed, ...patch };
    if (!(next.maxWidth >= 600 && next.maxWidth <= 4000)) return fail('Largest image width: 600 to 4,000 px.', 'maxWidth');
    if (!(next.quality >= 40 && next.quality <= 100)) return fail('Image quality: 40 to 100.', 'quality');
    const changes = Object.keys(patch).filter((k) => db.speed[k] !== next[k]).map((k) => ({ field: 'speed.' + k, label: 'Speed · ' + k, from: String(db.speed[k]), to: String(next[k]) }));
    log(changes);
    db.speed = next;
    return { ok: true };
  });
}
export function purgeCache(what) {
  const list = what === 'all' ? ['Everything'] : String(what || '').split(/[\n,]+/).map((x) => x.trim()).filter(Boolean);
  if (!list.length) return fail('Enter the addresses to clear, like /store or /product?handle=…', 'purge');
  if (list.some((x) => x !== 'Everything' && !/^\/\S*$/.test(x))) return fail('Addresses start with /, like /store.', 'purge');
  return change((db, t) => { db.speed.purges = [{ at: t, what: list }, ...db.speed.purges].slice(0, 10); return { ok: true }; });
}
const TEST_MS = 4000;
/** Run a speed test of the store home on a 3G phone. The figures follow the speed settings. */
export function runSpeedTest() {
  return change((db, t) => {
    const s = db.speed;
    let lcp = 3.4 - (s.webp ? 0.35 : 0) - (s.avif ? 0.3 : 0) - (s.http3 ? 0.2 : 0) - (s.brotli ? 0.15 : 0) + (s.quality - 75) * 0.02 + (s.maxWidth > 2000 ? 0.4 : 0);
    lcp = Math.max(1.3, Math.round(lcp * 10) / 10);
    const ttfb = 0.32, cls = 0.03;
    const score = Math.max(30, Math.min(99, Math.round(100 - (lcp - 1.2) * 18 - ttfb * 10)));
    db.speed.tests = [{ at: t, lcp, ttfb, cls, score }, ...db.speed.tests].slice(0, 6);
    return { ok: true };
  });
}
export const testRunning = (tst, t = Date.now()) => !!tst && t - tst.at < TEST_MS;

// ---- files & verification -------------------------------------------------------------------------------------------------
export const META_TAGS = [['google', 'Google Search Console', 'google-site-verification'], ['bing', 'Bing Webmaster Tools', 'msvalidate.01'], ['meta', 'Meta (Facebook)', 'facebook-domain-verification'], ['pinterest', 'Pinterest', 'p:domain_verify'], ['yandex', 'Yandex', 'yandex-verification']];
export const filesOf = () => read().files;
/** The verification meta tags the storefront head carries. */
export function verificationMeta() {
  const m = read().files.meta || {};
  return META_TAGS.filter(([k]) => m[k]).map(([k, , name]) => ({ name, content: m[k] }));
}
export function saveMeta(meta) {
  if (Object.values(meta).some((v) => v && !/^[\w\-=.:]{4,120}$/.test(String(v).trim()))) return fail('Paste only the code (the content="…" part), not the whole tag.', 'meta');
  return change((db) => { const was = db.files.meta; db.files.meta = Object.fromEntries(Object.entries(meta).map(([k, v]) => [k, String(v || '').trim()])); log(META_TAGS.filter(([k]) => (was[k] || '') !== db.files.meta[k]).map(([k, label]) => ({ field: 'meta.' + k, label: 'Verification · ' + label, from: was[k] || '', to: db.files.meta[k] }))); return { ok: true }; });
}
const RESERVED = ['/robots.txt', '/sitemap.xml', '/favicon.ico'];
export const FILE_TEMPLATES = [
  { path: '/ads.txt', body: 'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0', help: 'Google AdSense or other ad networks' },
  { path: '/app-ads.txt', body: 'google.com, pub-0000000000000000, DIRECT, f08c47fec0942fa0', help: 'Ads in your phone app' },
  { path: '/.well-known/security.txt', body: 'Contact: mailto:security@example.com\nExpires: 2027-12-31T00:00:00.000Z', help: 'How to report a security problem' },
  { path: '/.well-known/apple-developer-merchantid-domain-association', body: '', help: 'Apple Pay on the website' },
  { path: '/.well-known/assetlinks.json', body: '[]', help: 'Opens links in your Android app' },
];
export function saveFile(file, oldPath) {
  const path = String(file.path || '').trim();
  if (!/^\/[a-z0-9._\-/]+[^/]$/i.test(path) || path.length > 120) return fail('A file address starts with / and ends with the file name, like /ads.txt.', 'path');
  if (RESERVED.includes(path.toLowerCase())) return fail(path === '/robots.txt' || path === '/sitemap.xml' ? 'robots.txt and the sitemap are made in Online Store › SEO.' : 'The favicon is set in Settings › Media.', 'path');
  if (String(file.body || '').length > 50000) return fail('A file can be 50,000 characters at most.', 'body');
  return change((db, t) => {
    if (db.files.list.some((f) => f.path === path && f.path !== oldPath)) return fail('There is already a file at that address.', 'path');
    const was = db.files.list.find((f) => f.path === oldPath);
    db.files.list = [...db.files.list.filter((f) => f.path !== oldPath && f.path !== path), { path, body: String(file.body || ''), at: t }].sort((a, b) => a.path.localeCompare(b.path));
    log([{ field: 'file:' + path, label: 'Root file ' + path, from: was ? 'Saved' : '', to: was ? 'Changed' : 'Added' }]);
    return { ok: true };
  });
}
export const deleteFile = (path) => change((db) => { db.files.list = db.files.list.filter((f) => f.path !== path); log([{ field: 'file:' + path, label: 'Root file ' + path, from: 'Saved', to: 'Deleted' }]); return { ok: true }; });

// ---- backups ---------------------------------------------------------------------------------------------------------------
/** What a backup of the website and settings holds (this browser's data). Products, orders and customers live in the
 *  shop's database on the server and are in GridCommerce's daily backups. */
export const BACKUP_PARTS = [
  ['gc.storefront', 'Theme, headers, layouts and blocks'], ['gc.storePages', 'Store pages'], ['gc.storeMenus', 'Menus'],
  ['gc.landingPages', 'Landing pages'], ['gc.blog.v1', 'Blog'], ['gc.seo.redirects', 'Redirects'], ['gc.settings', 'Settings'],
  ['gc.domains', 'Domains'], [KEY, 'Hosting (DNS, email, security)'],
];
const KEEP = 4;
export function getBackups() { if (ssr()) return []; try { return JSON.parse(window.localStorage.getItem(BACKUP_KEY)) || []; } catch { return []; } }
function putBackups(list) {
  try { window.localStorage.setItem(BACKUP_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(HOSTING_EVENT)); return true; } catch { return false; }
}
function snapshot(label, by) {
  const keys = {};
  BACKUP_PARTS.forEach(([k]) => { try { const v = window.localStorage.getItem(k); if (v != null) keys[k] = v; } catch { /* ignore */ } });
  const size = Object.values(keys).reduce((a, v) => a + v.length, 0);
  return { id: 'BK-' + Date.now().toString(36), at: Date.now(), label, by: by || 'You', size, keys };
}
export function backUpNow(by, label = 'Backup') {
  const b = snapshot(label, by);
  const ok = putBackups([b, ...getBackups()].slice(0, KEEP));
  if (!ok) return fail('This browser is out of room for another backup. Download one and delete an old one.');
  return { ok: true, id: b.id };
}
export const deleteBackup = (id) => { putBackups(getBackups().filter((b) => b.id !== id)); return { ok: true }; };
/** Put a backup back (a backup of the current state is taken first, so this can be undone). */
export function restoreBackup(id, by) {
  const b = getBackups().find((x) => x.id === id);
  if (!b) return fail('That backup is gone.');
  const before = snapshot('Before restoring ' + new Date(b.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit', hour12: true }), by);
  putBackups([before, ...getBackups()].slice(0, KEEP));
  try { Object.entries(b.keys).forEach(([k, v]) => window.localStorage.setItem(k, v)); } catch { return fail('This browser is out of room.'); }
  cache = { raw: undefined, db: null };
  window.dispatchEvent(new CustomEvent(HOSTING_EVENT));
  return { ok: true };
}
export const backupFile = (b) => JSON.stringify({ gridcommerceBackup: 1, shop: 'Dazzle Shop', at: b.at, label: b.label, keys: b.keys });
export function addBackupFile(text, by) {
  let data = null;
  try { data = JSON.parse(text); } catch { data = null; }
  if (!data || data.gridcommerceBackup !== 1 || !data.keys) return fail('That isn’t a GridCommerce backup file.');
  const keys = Object.fromEntries(Object.entries(data.keys).filter(([k]) => BACKUP_PARTS.some(([p]) => p === k)));
  const b = { id: 'BK-' + Date.now().toString(36), at: data.at || Date.now(), label: 'Uploaded · ' + (data.label || 'Backup'), by, size: Object.values(keys).reduce((a, v) => a + String(v).length, 0), keys };
  if (!putBackups([b, ...getBackups()].slice(0, KEEP))) return fail('This browser is out of room for it. Delete an old backup first.');
  return { ok: true, id: b.id };
}
/** GridCommerce's own daily backups of the whole shop (kept 30 days on the server; the last 7 shown). */
export function dailyBackups(t = Date.now()) {
  const d0 = new Date(t); d0.setHours(3, 0, 0, 0);
  const start = d0.getTime() > t ? d0.getTime() - DAY : d0.getTime();
  return Array.from({ length: 7 }, (_, i) => ({ id: 'D' + i, at: start - i * DAY, sizeMB: 412 - i * 3 }));
}
export const restoreRequests = () => read().requests || [];
/** Ask GridCommerce to put a daily backup back (the server does it; support confirms first). */
export const requestRestore = (at, by) => change((db, t) => { db.requests = [{ at: t, backupAt: at, by, state: 'requested' }, ...(db.requests || [])].slice(0, 5); log([{ field: 'restore', label: 'Restore request', from: '', to: new Date(at).toISOString() }]); return { ok: true }; });

// ---- usage ---------------------------------------------------------------------------------------------------------------
export const PLAN_LIMITS = { starter: { bw: 50, storage: 2, requests: 2e6 }, growth: { bw: 250, storage: 10, requests: 10e6 }, business: { bw: 1000, storage: 50, requests: 50e6 } };   // storage follows planLimits.js
export const OVERAGE = { bw: 8, storage: 25 };   // ৳ per extra GB
/** This month so far: bandwidth by day (GB), requests, storage (GB), top pages. */
export function usage(t = Date.now()) {
  const d = new Date(t);
  const days = d.getDate();
  const byDay = Array.from({ length: days }, (_, i) => {
    const day = new Date(d.getFullYear(), d.getMonth(), i + 1);
    const wk = day.getDay();
    const visits = 820 + ((i * 37 + d.getMonth() * 11) % 260) + (wk === 5 ? 220 : 0);
    return { day: day.getTime(), gb: Math.round(visits * 3.6) / 1000, requests: visits * 64 };
  });
  const gb = Math.round(byDay.reduce((a, x) => a + x.gb, 0) * 10) / 10;
  const requests = byDay.reduce((a, x) => a + x.requests, 0);
  const backupsMB = getBackups().reduce((a, b) => a + b.size, 0) / 1e6;
  let filesGB = 0;
  try { filesGB = storageBytes() / 1e9; } catch { filesGB = 0; }   // Settings › Files
  const storage = Math.round((6.4 + backupsMB + filesGB) * 10) / 10;
  const limits = PLAN_LIMITS[currentPlanId()] || PLAN_LIMITS.business;
  const monthDays = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return {
    byDay, gb, requests, storage, limits, monthDays, forecastGb: Math.round((gb / days) * monthDays),
    pages: [['Product pages', 0.44], ['Images (CDN)', 0.27], ['Store home', 0.12], ['Category pages', 0.1], ['Checkout and cart', 0.04], ['Other', 0.03]].map(([n, s]) => [n, Math.round(gb * s * 10) / 10]),
  };
}
export const UPTIME = { days30: 99.98, incidents: [{ at: '12 Oct', mins: 4, what: 'Checkout slow while a courier service was down' }] };

// ---- overview -----------------------------------------------------------------------------------------------------------
/** What needs doing, most important first: [{ tone 'error'|'warning'|'info', text, tab }]. */
export function healthItems(t = Date.now()) {
  const out = [];
  const domains = getDomains(t);
  const primary = domains.find((d) => d.primary);
  if (!domains.length) out.push({ tone: 'info', text: 'Connect your own domain, like yourshop.com.bd', tab: 'domains' });
  else if (!primary) out.push({ tone: 'info', text: 'Make your domain primary, so customers see it', tab: 'domains' });
  domains.forEach((d) => {
    if (d.state === 'failed') out.push({ tone: 'error', text: `${d.host}: the DNS records weren’t found`, tab: 'domains' });
    const z = zoneOf(d.host);
    if (z.mode === 'gc' && nsState(z, t) === 'pending') out.push({ tone: 'warning', text: `${d.host}: change the nameservers at your registrar`, tab: 'dns' });
    if (d.state !== 'verified') return;
    const st = emailStatus(d.host, t);
    const bad = st.filter((s) => ['missing', 'wrong', 'needs-value'].includes(s.state));
    if (bad.length) out.push({ tone: 'warning', text: `${d.host}: ${bad.length === 1 ? '1 email record is' : bad.length + ' email records are'} missing or wrong`, tab: 'email' });
    const e = emailOf(d.host);
    if (!st.some((s) => s.key === 'dmarc') && (e.provider !== 'none' || e.gcSending)) out.push({ tone: 'warning', text: `${d.host}: add DMARC so fake mail in your name is stopped`, tab: 'email' });
    else if (e.dmarc && e.dmarc.policy === 'none' && st.some((s) => s.key === 'dmarc' && s.state === 'ok')) out.push({ tone: 'info', text: `${d.host}: DMARC only watches. When reports look clean, set it to Quarantine`, tab: 'email' });
  });
  certificates(t).forEach((c) => { if (c.state === 'expired') out.push({ tone: 'error', text: `${c.host}: the certificate has expired`, tab: 'security' }); else if (c.state === 'soon' && c.custom) out.push({ tone: 'warning', text: `${c.host}: your certificate ends in ${c.daysLeft} days`, tab: 'security' }); });
  const sec = read().security;
  if (!sec.forceHttps) out.push({ tone: 'warning', text: 'Turn on Force HTTPS so every visit is encrypted', tab: 'security' });
  else if (!sec.hsts.on) out.push({ tone: 'info', text: 'Turn on HSTS so browsers always use HTTPS', tab: 'security' });
  const last = getBackups()[0];
  if (!last || t - last.at > 30 * DAY) out.push({ tone: 'info', text: 'Back up the website before big changes', tab: 'backups' });
  const u = usage(t);
  if (u.forecastGb > u.limits.bw * 0.8) out.push({ tone: 'warning', text: `Bandwidth may reach ${u.forecastGb} of ${u.limits.bw} GB this month`, tab: 'usage' });
  const order = { error: 0, warning: 1, info: 2 };
  return out.sort((a, b) => order[a.tone] - order[b.tone]);
}
