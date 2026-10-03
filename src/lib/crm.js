// crm — the customer list as the Customers pages, segments, signals and bulk jobs read it (brief #7).
// One row per customer or company: identity from customers.js (getDirectory), money from the invoices (book
// customers) or the demo figures, merged-away records carried into the one that was kept (customerEdits.js),
// active restrictions, tags, custom field values and open recovery carts.
// `f` lists the ready views a row belongs to (repeat, big, cart, codBlock, suspended, company, restricted,
// cleanup …). Rows keep the key the Customers page uses for edits and merges: b:<phone>, d:<demo id>, p:<id>.

import { getDirectory, DEMO_LIST, tierOf, PRICE_TIERS } from './customers';
import { getInvoices } from './invoices';
import { getMerges } from './customerEdits';
import { activeRestrictions, RESTRICTION_TYPES } from './restrictions';
import { getFieldValues } from './customFields';

export const DEMO_TODAY = '19 Sep 2026';   // "today" in the demo customer data
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
export function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
/** '12 Sep 2026' → ms (null for '—'). */
export function parseDay(text) {
  const m = /^(\d{1,2}) ([A-Z][a-z]{2}) (\d{4})$/.exec(String(text || '').trim());
  return m ? new Date(Number(m[3]), MONTHS.indexOf(m[2]), Number(m[1]), 12, 0).getTime() : null;
}
const typesText = (types) => ((types || []).length ? types.join(', ') : '—');

function statsOfPhone(inv, digits) {
  const own = inv.filter((r) => r.customer.phone === digits);
  return { own, orders: own.length, spent: Math.round(own.reduce((a, r) => a + r.totals.total, 0)), due: Math.round(own.reduce((a, r) => a + Math.max(0, r.due), 0)) };
}

/** Every customer row. justAdded = phone digits of a row to flash as new. */
export function getCrmRows({ justAdded } = {}) {
  const dir = getDirectory();
  const inv = typeof window === 'undefined' ? [] : getInvoices();
  const merges = getMerges();
  const rows = dir.map((c) => {
    const restr = activeRestrictions(c);
    const shorts = restr.map((r) => (RESTRICTION_TYPES[r.type] || {}).short || r.type);
    let base;
    if (c.origin === 'book') {
      const st = statsOfPhone(inv, c.bookPhone), tier = tierOf(c);
      const lastAt = st.own[0] ? st.own[0].at : null;
      const f = (tier ? ['wholesale'] : []).concat(st.orders > 1 ? ['repeat'] : st.orders ? [] : ['noOrder']).concat(c.signup === DEMO_TODAY ? ['signToday', 'week'] : []);
      base = { orders: st.orders, spent: st.spent, due: st.due, last: lastAt ? fmtDate(new Date(lastAt)) : '—', lastAt, pts: 0, level: 'Member', returns: 0,
        city: (c.address || '').split(',').slice(-2).join(',').trim() || '—', src: c.src || (tier ? tier.label.split(' · ')[0] : typesText(c.types)), f, baseF: null, wholesale: !!tier };
    } else {
      const orig = c.origin === 'demo' ? DEMO_LIST.find((d) => d.id === c.demoId) : null;
      const whole = (c.types || []).indexOf('Wholesale') >= 0 && !c.companyId;   // a company's contacts buy through the company
      const f = (c.f || []).filter((x) => x !== 'wholesale').concat(whole ? ['wholesale'] : []);
      base = { orders: c.orders || 0, spent: c.spent || 0, due: c.due || 0, last: c.last || '—', lastAt: parseDay(c.last), pts: c.pts || 0, level: c.level || 'Member', returns: c.returns || 0, city: c.city || '—',
        src: whole && orig && orig.types.indexOf('Wholesale') < 0 ? (PRICE_TIERS[c.tier] || PRICE_TIERS.A).label.split(' · ')[0] + ' · was ' + orig.src : c.src || '—', f, baseF: orig ? orig.f : null, wholesale: whole };
    }
    // views that follow live facts, not the demo flags
    const live = base.f.filter((x) => ['codBlock', 'suspended', 'company', 'restricted', 'cleanup'].indexOf(x) < 0);
    if (shorts.indexOf('COD blocked') >= 0) live.push('codBlock');
    if (c.status === 'Suspended') live.push('suspended');
    if (c.kind === 'company') live.push('company');
    if (restr.length) live.push('restricted');
    const unverified = !c.phones.some((p) => p.verified);
    if (/^Guest/.test(c.name) || !c.address || unverified) live.push('cleanup');
    return { ...c, ...base, f: live, restrictions: restr, restrictionShort: shorts, signupAt: parseDay(c.signup), cf: getFieldValues(c.id), isNew: c.bookPhone && c.bookPhone === justAdded,
      aov: base.orders ? Math.round(base.spent / base.orders) : 0, returnRate: base.orders ? base.returns / base.orders : 0 };
  });
  // merged rows: the kept row carries the orders, spend and due of what was merged into it
  const byKey = {};
  rows.forEach((r) => { byKey[r.key] = r; });
  const baseOf = (m) => {
    if (m.drop.indexOf('b:') === 0) return statsOfPhone(inv, m.drop.slice(2));
    const d = DEMO_LIST.find((c) => 'd:' + c.id === m.drop);
    return d ? { orders: d.orders, spent: d.spent, due: d.due } : { orders: 0, spent: 0, due: 0 };
  };
  const carried = (key, seen) => {
    const sum = { orders: 0, spent: 0, due: 0, names: [] };
    merges.forEach((m) => {
      if (m.keep !== key || seen[m.drop]) return;
      seen[m.drop] = true;
      const b = baseOf(m), deeper = carried(m.drop, seen);
      sum.orders += b.orders + deeper.orders; sum.spent += b.spent + deeper.spent; sum.due += b.due + deeper.due; sum.names = sum.names.concat([m.dropName], deeper.names);
    });
    return sum;
  };
  rows.forEach((r) => {
    const x = carried(r.key, {});
    if (x.names.length) { r.orders += x.orders; r.spent += x.spent; r.due += x.due; r.mergedFrom = x.names; r.aov = r.orders ? Math.round(r.spent / r.orders) : 0; }
  });
  // company rows show their contacts and locations; contacts show their company
  rows.forEach((r) => {
    if (r.kind === 'company') { r.contactsCount = rows.filter((x) => x.companyId === r.id).length; r.locationsCount = (r.locations || []).length; }
    else if (r.companyId) { const co = rows.find((x) => x.id === r.companyId); r.companyName = co ? co.name : ''; }
  });
  rows.aliases = dir.aliases;
  return rows;
}
/** One row by customer ID (follows merges). */
export function crmRow(id, rows) {
  const all = rows || getCrmRows();
  let cur = id, n = 0;
  while (all.aliases && all.aliases[cur] && n++ < 10) cur = all.aliases[cur];
  return all.find((r) => r.id === cur) || null;
}
/** Days since a time (null when there is none). */
export const daysSince = (t, now = Date.now()) => (t ? Math.floor((now - t) / (24 * 60 * 60 * 1000)) : null);
