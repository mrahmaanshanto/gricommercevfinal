// platform/mail — Business email (Module D, work package of 14 Oct 2026): name@theirshop.com mailboxes sold by
// GridCommerce per mailbox. Provider-neutral: whether GridCommerce runs its own mail servers or resells Zoho, Google
// Workspace, Titan or Mailcow is the partners' and the backend's decision (settings.provider is a placeholder); every
// screen works the same either way. Shared by the merchant's Settings › Business email and the super admin's Business
// email area, like a server would be (browser storage gc.mail, event gc:mail).
//
//   settings   plans [{ id, name, storageGB, price }] (a mailbox a month), storage add-ons [{ id, gb, price }], included
//              mailboxes per plan (starter / growth / business), yearly discount %, sending caps, provider (name, status),
//              provider cost (per seat, per GB) for the margin
//   domains    { id, shopId, shopName, domain, planId, cycle, seats (mailboxes paid), extraGB, managed (DNS hosted by
//              GridCommerce: "Add records for me"), verify { state, since }, dns { mx, spf, dkim, dmarc: { state, since } },
//              catchAll, shopSending (order emails from the own domain), state 'setup'|'active'|'suspended', suspended
//              { reason, by, at }, complaints [], quarantine [], imports [], charges [], createdAt }
//   mailboxes  { id, domainId, local, name, storageGB, usedMB, twoStep, status 'active'|'suspended'|'deleted', deletedAt,
//              forwardTo, autoReply { on, text, until }, invite (link sent), lastSignIn, staff (name) }
//   addresses  { id, domainId, local, kind 'alias'|'group'|'forward', to [mailbox ids or outside addresses] }
// DNS (demo): a check moves with the clock like domains.js — checking → ok about 6 seconds later (?dns=failed fails it).
// Deleted mailboxes can be restored for 30 days. Front end only: the provider's API does the work on the live system.

export const KEY = 'gc.mail';
export const EVENT = 'gc:mail';
export const SELF_SHOP = '0090';
export const SELF_NAME = 'Dazzle Shop';
const DAY = 864e5, MIN = 6e4, H = 3600e3;
const isBrowser = typeof window !== 'undefined';
export const RECORDS = ['mx', 'spf', 'dkim', 'dmarc'];
export const RESTORE_DAYS = 30;
export const CHECK_MS = 6000;

export function now() {
  if (!isBrowser) return 0;
  try { return Date.now() + (Number(window.localStorage.getItem('gc.clock.offset')) || 0); } catch { return Date.now(); }
}

const SETTINGS = {
  plans: [
    { id: 'basic', name: 'Basic', storageGB: 5, price: 150 },
    { id: 'business', name: 'Business', storageGB: 30, price: 300 },
    { id: 'pro', name: 'Pro', storageGB: 100, price: 600 },
  ],
  storageAddons: [{ id: 'gb10', gb: 10, price: 100 }, { id: 'gb50', gb: 50, price: 400 }],
  included: { starter: 0, growth: 1, business: 3 },
  yearlyDiscount: 15,
  caps: { perHour: 200, perDay: 1000, recipients: 100 },
  provider: { name: 'Not chosen yet', status: 'placeholder', note: 'Our own servers or a reseller account (Zoho Mail, Google Workspace, Titan, Mailcow). The backend connects it.' },
  cost: { perSeat: 90, perGB: 3 },
};

// ---- seed: other stores' mail, so the super admin's directory has a world -------------------------------------------------
function seed(t) {
  const domains = [], mailboxes = [], addresses = [];
  let n = 1;
  const dns = (state, ago) => ({ state, since: t - ago });
  const dom = (shopId, shopName, domain, planId, seats, opts = {}) => {
    const id = 'MD-' + String(n++).padStart(3, '0');
    const okAll = { mx: dns('ok', 40 * DAY), spf: dns('ok', 40 * DAY), dkim: dns('ok', 40 * DAY), dmarc: dns('ok', 40 * DAY) };
    domains.push({ id, shopId, shopName, domain, planId, cycle: opts.cycle || 'monthly', seats, extraGB: opts.extraGB || 0, managed: !!opts.managed,
      verify: { state: 'ok', since: t - 41 * DAY }, dns: { ...okAll, ...(opts.dns || {}) }, catchAll: opts.catchAll || '', shopSending: true,
      state: opts.state || 'active', suspended: opts.suspended || null, complaints: opts.complaints || [], quarantine: [], imports: [], charges: [], createdAt: t - (opts.age || 60) * DAY });
    (opts.boxes || []).forEach(([local, name, usedMB, signedDaysAgo, extra], i) => {
      const p = SETTINGS.plans.find((x) => x.id === planId);
      mailboxes.push({ id: id + '-B' + (i + 1), domainId: id, local, name, storageGB: p.storageGB, usedMB, twoStep: i === 0, status: 'active', deletedAt: null, forwardTo: '', autoReply: { on: false, text: '', until: '' }, invite: false, lastSignIn: t - signedDaysAgo * DAY, staff: name, ...(extra || {}) });
    });
    return id;
  };
  dom('0012', 'Mohona Traders', 'mohonatraders.com', 'business', 5, { managed: true, age: 120, boxes: [['owner', 'Kamrul Islam', 21400, 0.2], ['sales', 'Sales desk', 9800, 0.5], ['accounts', 'Nasima Begum', 27900, 1, {}], ['warehouse', 'Jahid Hasan', 1200, 6]] });
  dom('0017', 'Shonali Crafts', 'shonalicrafts.com', 'basic', 2, { age: 80, boxes: [['hello', 'Shirin Sultana', 4700, 0.3], ['orders', 'Orders', 2100, 0.1]] });
  dom('0007', 'Rongdhonu Fashion', 'rongdhonufashion.com', 'business', 3, { age: 30, dns: { dkim: dns('failed', 4 * DAY + 2 * H), dmarc: dns('pending', 4 * DAY) }, boxes: [['info', 'Lipi Akter', 3400, 0.4], ['support', 'Support', 800, 2]] });
  dom('0044', 'Bindu Beauty', 'bindubeauty.com.bd', 'basic', 2, { age: 50, state: 'suspended', suspended: { reason: 'Spam complaints: 46 in a day (bulk offer mail to bought lists)', by: 'Rakib Hasan', at: t - 3 * DAY },
    complaints: [{ at: t - 3 * DAY - 2 * H, count: 46, note: 'Offer blast to 4,000 addresses' }, { at: t - 9 * DAY, count: 7, note: '' }], boxes: [['offers', 'Offers', 1900, 3]] });
  dom('0066', 'Mehedi Traders', 'meheditraders.com.bd', 'basic', 1, { age: 200, cycle: 'yearly', boxes: [['owner', 'Faruk Ahmed', 4850, 0.8]] });
  addresses.push({ id: 'AD-1', domainId: 'MD-001', local: 'info', kind: 'alias', to: ['MD-001-B1'] }, { id: 'AD-2', domainId: 'MD-001', local: 'team', kind: 'group', to: ['MD-001-B1', 'MD-001-B2', 'MD-001-B3'] });
  return { v: 1, settings: JSON.parse(JSON.stringify(SETTINGS)), domains, mailboxes, addresses, seq: { dom: n, ad: 3 }, log: [] };
}

// ---- storage ------------------------------------------------------------------------------------------------------------------
let cache = { raw: undefined, db: null };
const EMPTY = { v: 1, settings: SETTINGS, domains: [], mailboxes: [], addresses: [], seq: { dom: 1, ad: 1 }, log: [] };
export function read() {
  if (!isBrowser) return EMPTY;
  let raw = null;
  try { raw = window.localStorage.getItem(KEY); } catch { /* ignore */ }
  if (raw && raw === cache.raw && cache.db) return cache.db;
  let db = null;
  try { db = raw ? JSON.parse(raw) : null; } catch { db = null; }
  if (!db || db.v !== 1) { db = seed(now()); write(db, true); return db; }
  cache = { raw, db };
  return db;
}
function write(db, quiet) {
  try { const raw = JSON.stringify(db); window.localStorage.setItem(KEY, raw); cache = { raw, db }; if (!quiet) window.dispatchEvent(new CustomEvent(EVENT)); } catch { /* ignore */ }
}
const fail = (error, field) => ({ ok: false, error, field });
export function commit(fn) {
  const db = JSON.parse(JSON.stringify(read()));
  const res = fn(db, now());
  if (res && res.ok === false) return res;
  write(db);
  return res || { ok: true };
}
const log = (db, t, shopId, text, by) => db.log.unshift({ at: t, shopId, text, by: by || 'Owner' });

// ---- reads -------------------------------------------------------------------------------------------------------------------
export const settings = () => read().settings;
export const planBy = (id) => read().settings.plans.find((p) => p.id === id) || read().settings.plans[0];
export const domainOf = (shopId = SELF_SHOP) => read().domains.find((d) => d.shopId === shopId && d.state !== 'removed') || null;
export const domainById = (id) => read().domains.find((d) => d.id === id) || null;
export const mailboxesOf = (domainId, withDeleted = false) => read().mailboxes.filter((m) => m.domainId === domainId && (withDeleted || m.status !== 'deleted'));
export const addressesOf = (domainId) => read().addresses.filter((a) => a.domainId === domainId);
export const address = (d, local) => local + '@' + d.domain;
/** A DNS record or the verification as it stands: 'ok' | 'checking' | 'pending' | 'failed'. */
export function recState(r, t = now()) {
  if (!r) return 'pending';
  if (r.state === 'checking') return t - r.since >= CHECK_MS ? (r.fail ? 'failed' : 'ok') : 'checking';
  return r.state;
}
/** The DNS records the domain needs (provider-neutral values; the live provider supplies its own). */
export function recordsOf(d) {
  const key = 'v=DKIM1; k=rsa; p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQC' + (d.id || 'x').replace(/\W/g, '') + '…';
  return [
    { id: 'mx', type: 'MX', host: '@', value: 'mx1.mail.gridcommerce.net (priority 10) · mx2.mail.gridcommerce.net (priority 20)', why: 'Brings mail to your mailboxes' },
    { id: 'spf', type: 'TXT', host: '@', value: 'v=spf1 include:_spf.mail.gridcommerce.net ~all', why: 'Says GridCommerce may send for your domain' },
    { id: 'dkim', type: 'TXT', host: 'gc._domainkey', value: key, why: 'Signs your mail so it is not marked as spam' },
    { id: 'dmarc', type: 'TXT', host: '_dmarc', value: `v=DMARC1; p=quarantine; rua=mailto:dmarc@${d.domain}`, why: 'Tells other servers what to do with fake mail' },
  ];
}
export const verifyRecord = (d) => ({ type: 'TXT', host: '@', value: 'gc-mail-verify=' + (d.id || '').toLowerCase().replace(/\W/g, '') + d.domain.length });
/** Everything about a domain now: { verified, dns: {mx:..}, dnsOk, problems[], used, seatsUsed, storageUsedMB, storageGB, monthly, shopSending } */
export function stateOf(d, t = now()) {
  if (!d) return null;
  const boxes = mailboxesOf(d.id);
  const live = boxes.filter((m) => m.status !== 'deleted');
  const dnsState = Object.fromEntries(RECORDS.map((k) => [k, recState(d.dns[k], t)]));
  const dnsOk = RECORDS.every((k) => dnsState[k] === 'ok');
  const plan = planBy(d.planId);
  const storageGB = live.reduce((a, m) => a + m.storageGB, 0) + (d.extraGB || 0);
  const usedMB = live.reduce((a, m) => a + (m.usedMB || 0), 0);
  const failingSince = RECORDS.map((k) => d.dns[k]).filter((r) => r && recState(r, t) === 'failed').map((r) => r.since);
  const s = settings();
  const seatPrice = plan.price, gbPrice = (s.storageAddons[0] || { gb: 10, price: 100 });
  // mailboxes the shop's GridCommerce plan includes are free (settings.included, kept on the domain at setup)
  const monthly = Math.max(0, d.seats - (d.included || 0)) * seatPrice + Math.round(((d.extraGB || 0) / gbPrice.gb) * gbPrice.price);
  return {
    verified: recState(d.verify, t) === 'ok', verifyState: recState(d.verify, t), dns: dnsState, dnsOk, plan, seatsUsed: live.length, seatsLeft: d.seats - live.length,
    storageGB, usedMB, nearQuota: live.filter((m) => m.usedMB > m.storageGB * 1024 * 0.9), dnsFailingDays: failingSince.length ? Math.floor((t - Math.min(...failingSince)) / DAY) : 0,
    monthly: d.cycle === 'yearly' ? Math.round(monthly * (1 - s.yearlyDiscount / 100)) : monthly, shopSending: d.shopSending && dnsState.spf === 'ok' && dnsState.dkim === 'ok',
    cost: live.length * s.cost.perSeat + Math.round((storageGB) * s.cost.perGB),
  };
}
/** The address the shop's order and notification emails come from (its own domain once SPF and DKIM are green). */
export function shopSender(shopId = SELF_SHOP) {
  const d = domainOf(shopId);
  const st = d && d.state === 'active' ? stateOf(d) : null;
  return st && st.shopSending ? { from: 'orders@' + d.domain, own: true } : { from: 'no-reply@mail.gridcommerce.net', own: false, why: d ? 'Turns to your own domain once SPF and DKIM are green' : 'Set up Business email to send from your own domain' };
}
/** Mail-server settings to set up a phone or desktop app. */
export function clientSettings(d, m) {
  return {
    imap: { host: 'imap.mail.gridcommerce.net', port: 993, security: 'SSL/TLS' },
    pop: { host: 'pop.mail.gridcommerce.net', port: 995, security: 'SSL/TLS' },
    smtp: { host: 'smtp.mail.gridcommerce.net', port: 465, security: 'SSL/TLS' },
    user: m ? address(d, m.local) : '',
  };
}
/** Import from the old host: progress moves with the clock (demo). */
export function importState(imp, t = now()) {
  const pct = Math.min(100, Math.round(((t - imp.startedAt) / (imp.total / 40 * 1000)) * 100));
  return { pct, done: pct >= 100, copied: Math.round((imp.total * pct) / 100) };
}

// ---- merchant: set up ------------------------------------------------------------------------------------------------------
const LOCAL = /^[a-z0-9]([a-z0-9._-]{0,40}[a-z0-9])?$/;
/** Start Business email on a connected domain: plan, billing cycle and how many mailboxes. */
export function startSetup({ shopId = SELF_SHOP, shopName = SELF_NAME, domain, planId, cycle = 'monthly', seats, managed = false, included = 0 }) {
  const h = String(domain || '').trim().toLowerCase();
  if (!h) return fail('Pick a domain.', 'domain');
  if (!(Number(seats) >= 1 && Number(seats) <= 200)) return fail('Enter how many mailboxes (1 to 200).', 'seats');
  if (!read().settings.plans.some((p) => p.id === planId)) return fail('Pick a plan.', 'plan');
  return commit((db, t) => {
    const other = db.domains.find((d) => d.domain === h && d.shopId !== shopId && d.state !== 'removed');
    if (other) return fail(h + ' already has Business email on another store.', 'domain');
    let d = db.domains.find((x) => x.shopId === shopId && x.state !== 'removed');
    if (d && d.state === 'active') return fail('Business email is already set up on ' + d.domain + '.');
    if (!d) { d = { id: 'MD-' + String(db.seq.dom++).padStart(3, '0'), shopId, shopName, createdAt: t, complaints: [], quarantine: [], imports: [], charges: [], extraGB: 0, catchAll: '', shopSending: true, suspended: null }; db.domains.push(d); }
    Object.assign(d, { included: Number(included) || 0, domain: h, planId, cycle: cycle === 'yearly' ? 'yearly' : 'monthly', seats: Number(seats), managed: !!managed, state: 'setup', verify: { state: 'pending', since: t }, dns: Object.fromEntries(RECORDS.map((k) => [k, { state: 'pending', since: t }])) });
    log(db, t, shopId, `Started Business email on ${h} · ${planBy(planId).name} · ${seats} mailboxes`);
    return { ok: true, domain: d };
  });
}
const failing = () => { try { return new URLSearchParams(window.location.search).get('dns') === 'failed'; } catch { return false; } };
export function checkVerify(id) {
  return commit((db, t) => { const d = db.domains.find((x) => x.id === id); if (!d) return fail('gone'); if (recState(d.verify, t) !== 'ok') d.verify = { state: 'checking', since: t, fail: failing() }; return { ok: true }; });
}
/** Check the DNS records (all, or one). "Add records for me" on a domain GridCommerce hosts adds them first. */
export function checkDns(id, which = RECORDS, { addForMe = false } = {}) {
  return commit((db, t) => {
    const d = db.domains.find((x) => x.id === id);
    if (!d) return fail('gone');
    if (addForMe && !d.managed) return fail('This domain’s DNS is not with GridCommerce. Add the records at your registrar.');
    [].concat(which).forEach((k) => { if (recState(d.dns[k], t) !== 'ok') d.dns[k] = { state: 'checking', since: t, fail: !addForMe && failing() && k === 'dkim' }; });
    if (addForMe) log(db, t, d.shopId, 'Added the mail DNS records for the owner (GridCommerce DNS)');
    return { ok: true };
  });
}
/** Finish setup once the domain is verified (DNS can still be going green). */
export function activate(id) {
  return commit((db, t) => {
    const d = db.domains.find((x) => x.id === id);
    if (!d) return fail('gone');
    if (recState(d.verify, t) !== 'ok') return fail('Verify the domain first.');
    d.state = 'active';
    d.charges.push({ at: t, kind: 'plan', text: `${planBy(d.planId).name} · ${d.seats} mailboxes · ${d.cycle}`, amount: stateOf(d, t).monthly * (d.cycle === 'yearly' ? 12 : 1) });
    log(db, t, d.shopId, 'Business email is on');
    return { ok: true };
  });
}

// ---- merchant: mailboxes ----------------------------------------------------------------------------------------------------
export function createMailbox(domainId, { local, name, invite = true, storageGB, staff }) {
  const l = String(local || '').trim().toLowerCase();
  if (!LOCAL.test(l)) return fail('Use letters, numbers, dots or dashes, like rahim or sales.', 'local');
  if (!String(name || '').trim()) return fail('Enter the person’s or the team’s name.', 'name');
  return commit((db, t) => {
    const d = db.domains.find((x) => x.id === domainId);
    if (!d || d.state === 'suspended') return fail(d ? 'This domain is suspended.' : 'Set up Business email first.');
    const live = db.mailboxes.filter((m) => m.domainId === domainId && m.status !== 'deleted');
    if (live.length >= d.seats) return fail(`All ${d.seats} mailboxes are in use. Buy more under Plan & usage.`);
    if (live.some((m) => m.local === l) || db.addresses.some((a) => a.domainId === domainId && a.local === l)) return fail(address(d, l) + ' is already used.', 'local');
    const plan = db.settings.plans.find((p) => p.id === d.planId);
    const m = { id: domainId + '-B' + (db.mailboxes.filter((x) => x.domainId === domainId).length + 1) + Date.now().toString(36).slice(-2), domainId, local: l, name: String(name).trim(), storageGB: Number(storageGB) || plan.storageGB, usedMB: 0, twoStep: false, status: 'active', deletedAt: null, forwardTo: '', autoReply: { on: false, text: '', until: '' }, invite: !!invite, lastSignIn: null, staff: staff || String(name).trim() };
    db.mailboxes.push(m);
    log(db, t, d.shopId, `Created ${address(d, l)}${invite ? ' (invite link sent)' : ''}`);
    return { ok: true, mailbox: m };
  });
}
export function updateMailbox(id, patch, what) {
  return commit((db, t) => {
    const m = db.mailboxes.find((x) => x.id === id);
    if (!m) return fail('This mailbox is gone.');
    if (patch.forwardTo && !/^\S+@\S+\.\S+$/.test(patch.forwardTo)) return fail('Enter an email address to forward to.', 'forwardTo');
    Object.assign(m, patch);
    const d = db.domains.find((x) => x.id === m.domainId);
    if (what) log(db, t, d.shopId, `${what} · ${address(d, m.local)}`);
    return { ok: true };
  });
}
export const resetPassword = (id) => updateMailbox(id, { invite: true, passwordResetAt: now() }, 'Password reset link sent');
export function deleteMailbox(id) { return updateMailbox(id, { status: 'deleted', deletedAt: now() }, 'Deleted (restore within 30 days)'); }
export function restoreMailbox(id) {
  const m = read().mailboxes.find((x) => x.id === id);
  if (!m || m.status !== 'deleted') return fail('Nothing to restore.');
  if (now() - m.deletedAt > RESTORE_DAYS * DAY) return fail('More than 30 days have passed: it can’t be restored.');
  const d = domainById(m.domainId);
  if (mailboxesOf(m.domainId).length >= d.seats) return fail('All mailboxes are in use. Buy one more first.');
  return updateMailbox(id, { status: 'active', deletedAt: null }, 'Restored');
}
/** Someone leaves (HR): their mailbox is suspended and its mail forwarded to the manager. Matches by name or address. */
export function offboard({ name, email }, forwardTo, shopId = SELF_SHOP) {
  const d = domainOf(shopId);
  if (!d) return { ok: false };
  const n = String(name || '').trim().toLowerCase();
  const e = String(email || '').trim().toLowerCase();
  const m = mailboxesOf(d.id).find((x) => x.status === 'active' && ((n && String(x.staff || x.name).toLowerCase() === n) || (e && address(d, x.local) === e)));
  if (!m) return { ok: false };
  const fwd = forwardTo || (mailboxesOf(d.id).find((x) => x.status === 'active' && x.id !== m.id) ? address(d, mailboxesOf(d.id).find((x) => x.status === 'active' && x.id !== m.id).local) : '');
  return updateMailbox(m.id, { status: 'suspended', forwardTo: fwd, offboardedAt: now() }, `Suspended when ${m.name} left (HR) · mail forwarded to ${fwd || 'nobody'}`);
}

// ---- merchant: addresses ----------------------------------------------------------------------------------------------------
export function saveAddress(domainId, { id, local, kind, to }) {
  const l = String(local || '').trim().toLowerCase();
  if (!LOCAL.test(l)) return fail('Use letters, numbers, dots or dashes, like info or sales.', 'local');
  const list = (to || []).map((x) => String(x).trim()).filter(Boolean);
  if (!list.length) return fail(kind === 'group' ? 'Pick who gets it.' : 'Pick where it goes.', 'to');
  if (kind === 'group' && list.length < 2) return fail('A group sends to 2 or more people.', 'to');
  if (list.some((x) => x.includes('@') && !/^\S+@\S+\.\S+$/.test(x))) return fail('One of the addresses is not right.', 'to');
  return commit((db, t) => {
    const d = db.domains.find((x) => x.id === domainId);
    if (!d) return fail('Set up Business email first.');
    if (db.mailboxes.some((m) => m.domainId === domainId && m.status !== 'deleted' && m.local === l) || db.addresses.some((a) => a.domainId === domainId && a.local === l && a.id !== id)) return fail(address(d, l) + ' is already used.', 'local');
    const rec = { id: id || 'AD-' + db.seq.ad++, domainId, local: l, kind, to: list };
    const i = db.addresses.findIndex((a) => a.id === rec.id);
    if (i >= 0) db.addresses[i] = rec; else db.addresses.push(rec);
    log(db, t, d.shopId, `${kind === 'group' ? 'Group' : kind === 'forward' ? 'Forwarder' : 'Alias'} ${address(d, l)} → ${list.length} ${list.length === 1 ? 'address' : 'addresses'}`);
    return { ok: true, address: rec };
  });
}
export function removeAddress(id) { return commit((db) => { db.addresses = db.addresses.filter((a) => a.id !== id); return { ok: true }; }); }
export function setCatchAll(domainId, to) {
  if (to && !/^\S+@\S+\.\S+$/.test(to) && !read().mailboxes.some((m) => m.id === to)) return fail('Pick a mailbox or enter an address.');
  return commit((db, t) => { const d = db.domains.find((x) => x.id === domainId); if (!d) return fail('gone'); d.catchAll = to || ''; log(db, t, d.shopId, to ? 'Catch-all on' : 'Catch-all off'); return { ok: true }; });
}
export function setShopSending(domainId, on) { return commit((db) => { const d = db.domains.find((x) => x.id === domainId); if (!d) return fail('gone'); d.shopSending = !!on; return { ok: true }; }); }

// ---- merchant: plan, storage, import, quarantine ---------------------------------------------------------------------------
export function buySeats(domainId, n) {
  const k = Number(n);
  if (!(k >= 1 && k <= 100)) return fail('Enter 1 to 100.');
  return commit((db, t) => { const d = db.domains.find((x) => x.id === domainId); if (!d) return fail('gone'); d.seats += k; const p = db.settings.plans.find((x) => x.id === d.planId); d.charges.push({ at: t, kind: 'seats', text: `${k} more mailbox${k === 1 ? '' : 'es'}`, amount: k * p.price }); log(db, t, d.shopId, `Bought ${k} more mailbox${k === 1 ? '' : 'es'}`); return { ok: true }; });
}
export function buyStorage(domainId, addonId, mailboxId) {
  return commit((db, t) => {
    const d = db.domains.find((x) => x.id === domainId);
    const a = db.settings.storageAddons.find((x) => x.id === addonId);
    if (!d || !a) return fail('Pick how much storage.');
    const m = mailboxId ? db.mailboxes.find((x) => x.id === mailboxId) : null;
    if (m) m.storageGB += a.gb; else d.extraGB = (d.extraGB || 0) + a.gb;
    d.charges.push({ at: t, kind: 'storage', text: `${a.gb} GB more${m ? ' for ' + address(d, m.local) : ''}`, amount: a.price });
    log(db, t, d.shopId, `Bought ${a.gb} GB more storage${m ? ' for ' + address(d, m.local) : ''}`);
    return { ok: true };
  });
}
export function changePlan(domainId, planId, cycle) {
  return commit((db, t) => { const d = db.domains.find((x) => x.id === domainId); const p = db.settings.plans.find((x) => x.id === planId); if (!d || !p) return fail('Pick a plan.'); d.planId = p.id; if (cycle) d.cycle = cycle; db.mailboxes.filter((m) => m.domainId === domainId).forEach((m) => { m.storageGB = Math.max(m.storageGB, p.storageGB); }); log(db, t, d.shopId, `Plan changed to ${p.name} (${d.cycle})`); return { ok: true }; });
}
export function startImport(domainId, { mailboxId, host, user }) {
  if (!String(host || '').trim()) return fail('Enter the old mail server (like mail.oldhost.com).', 'host');
  if (!String(user || '').trim()) return fail('Enter the old address.', 'user');
  return commit((db, t) => { const d = db.domains.find((x) => x.id === domainId); if (!d) return fail('gone'); d.imports.unshift({ id: 'IM-' + t.toString(36), mailboxId, host: String(host).trim(), user: String(user).trim(), startedAt: t, total: 1200 + Math.round(Math.random() * 3000) }); log(db, t, d.shopId, 'Started importing old mail from ' + host); return { ok: true }; });
}
export function quarantineOf(d, t = now()) {
  if (!d) return [];
  const base = [
    { id: 'Q1', from: 'promo@deals-bd-offer.top', subject: 'You won ৳50,000 bKash cashback!!!', at: t - 3 * H, why: 'Phishing' },
    { id: 'Q2', from: 'invoice@acc0unts-paypal.co', subject: 'Payment failed: update your card', at: t - 20 * H, why: 'Fake sender' },
    { id: 'Q3', from: 'news@gadget-weekly.com', subject: 'This week in phones', at: t - 30 * H, why: 'Bulk mail' },
  ];
  const done = new Set((d.quarantine || []).map((x) => x.id));
  return base.filter((x) => !done.has(x.id));
}
export function decideQuarantine(domainId, qid, release) {
  return commit((db, t) => { const d = db.domains.find((x) => x.id === domainId); if (!d) return fail('gone'); d.quarantine = [...(d.quarantine || []), { id: qid, release: !!release, at: t }]; return { ok: true }; });
}

// ---- super admin -----------------------------------------------------------------------------------------------------------
export function suspendDomain(id, reason, by) {
  if (!String(reason || '').trim()) return fail('Say why (the store owner sees it).');
  return commit((db, t) => { const d = db.domains.find((x) => x.id === id); if (!d) return fail('gone'); d.state = 'suspended'; d.suspended = { reason: String(reason).trim(), by, at: t }; log(db, t, d.shopId, 'Domain suspended: ' + String(reason).trim(), by); return { ok: true }; });
}
export function restoreDomain(id, by) {
  return commit((db, t) => { const d = db.domains.find((x) => x.id === id); if (!d || d.state !== 'suspended') return fail('It is not suspended.'); d.state = 'active'; d.suspended = null; log(db, t, d.shopId, 'Domain restored', by); return { ok: true }; });
}
export function suspendMailbox(id, reason, by) {
  if (!String(reason || '').trim()) return fail('Say why (the store owner sees it).');
  return updateMailbox(id, { status: 'suspended', suspendReason: String(reason).trim(), suspendedBy: by }, 'Mailbox suspended by GridCommerce: ' + String(reason).trim());
}
export function saveMailSettings(patch) {
  return commit((db) => {
    const s = { ...db.settings, ...patch };
    if (s.plans.some((p) => !String(p.name || '').trim() || !(Number(p.price) > 0) || !(Number(p.storageGB) > 0))) return fail('Every plan needs a name, a price and storage.');
    s.plans = s.plans.map((p) => ({ ...p, price: Number(p.price), storageGB: Number(p.storageGB) }));
    s.storageAddons = s.storageAddons.map((a) => ({ ...a, gb: Number(a.gb), price: Number(a.price) }));
    s.yearlyDiscount = Math.max(0, Math.min(50, Number(s.yearlyDiscount) || 0));
    db.settings = s;
    return { ok: true };
  });
}
/** Alerts for the super admin: near quota, DNS failing 3+ days, complaints, suspended. */
export function alerts(t = now()) {
  const out = [];
  read().domains.forEach((d) => {
    const st = stateOf(d, t);
    if (st.dnsFailingDays >= 3) out.push({ domainId: d.id, tone: 'error', text: `${d.domain}: DNS failing for ${st.dnsFailingDays} days (${RECORDS.filter((k) => st.dns[k] === 'failed').map((k) => k.toUpperCase()).join(', ')})` });
    st.nearQuota.forEach((m) => out.push({ domainId: d.id, tone: 'warning', text: `${address(d, m.local)} is ${Math.round((m.usedMB / (m.storageGB * 1024)) * 100)}% full` }));
    if (d.state === 'suspended') out.push({ domainId: d.id, tone: 'neutral', text: `${d.domain} suspended: ${d.suspended ? d.suspended.reason : ''}` });
  });
  return out;
}
export const logOf = (shopId) => read().log.filter((x) => !shopId || x.shopId === shopId);
