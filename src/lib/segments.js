// segments — the one segment engine (brief #7 Customers & CRM, used by #13 Recovery and Marketing).
// A segment is a set of rules joined by AND or OR (groups can nest one level): orders, spent, average order, last
// order, signed up, area, tags, consent per channel, level, status, type, buying channel, came from, restrictions,
// due, returns, signals (churn risk, VIP likelihood) and the shop's own custom fields. Membership is worked out
// from the live customer list every time (plus anyone added to the segment by hand or by a bulk job).
// Recovery publishes its ready-made segments here as templates (SEGMENT_TEMPLATES): they use the same engine and
// keep no list of their own.
// For campaigns (Marketing / Communications):
//   segmentsForCampaign(channel) → [{ id, name, count, eligible }]   pick a segment, see who can get it
//   campaignAudience(segmentId, channel) → { members, eligible, excluded }
//   segmentMembers(idOrDef), segmentCount(idOrDef), previewSegment(def), getSegment(id)
// Front end only: saved segments are kept in this browser (gc.crm.segments).

import { getCrmRows, daysSince } from './crm';
import { getConsent, isAllowed, CONSENT_STATES, channelKey } from './consent';
import { RESTRICTION_TYPES } from './restrictions';
import { getFieldDefs } from './customFields';
import { quickSignals } from './customerSignals';
import { CUSTOMER_STATUSES, CUSTOMER_TYPES } from './customers';

export const SEGMENTS_KEY = 'gc.crm.segments';
export const SEGMENTS_EVENT = 'gc:crm-segments';
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

// ---- fields --------------------------------------------------------------------------------------------------
// type: number | money | days | text | choice | tags | bool. `get` reads the value from a customer row.
const sig = (k) => (c) => { const s = quickSignals(c)[k]; return s ? s.value : ''; };
const BASE_FIELDS = [
  { key: 'orders', label: 'Number of orders', group: 'Orders', type: 'number', get: (c) => c.orders },
  { key: 'spent', label: 'Total spent', group: 'Orders', type: 'money', get: (c) => c.spent },
  { key: 'aov', label: 'Average order', group: 'Orders', type: 'money', get: (c) => c.aov },
  { key: 'lastOrder', label: 'Last order', group: 'Orders', type: 'days', get: (c) => daysSince(c.lastAt) },
  { key: 'returns', label: 'Returned orders', group: 'Orders', type: 'number', get: (c) => c.returns || 0 },
  { key: 'due', label: 'Due', group: 'Orders', type: 'money', get: (c) => c.due },
  { key: 'signup', label: 'Signed up', group: 'Customer', type: 'days', get: (c) => daysSince(c.signupAt) },
  { key: 'city', label: 'Area', group: 'Customer', type: 'text', get: (c) => [c.city, c.address].join(' ') },
  { key: 'kind', label: 'Customer type', group: 'Customer', type: 'choice', options: [['person', 'Person'], ['company', 'Company']], get: (c) => c.kind },
  { key: 'buys', label: 'Buys', group: 'Customer', type: 'tags', options: CUSTOMER_TYPES.map((t) => [t, t]), get: (c) => c.types || [] },
  { key: 'status', label: 'Status', group: 'Customer', type: 'choice', options: CUSTOMER_STATUSES.map((s) => [s, s]), get: (c) => c.status },
  { key: 'level', label: 'Level', group: 'Customer', type: 'choice', options: ['Member', 'Silver', 'Gold', 'Platinum'].map((s) => [s, s]), get: (c) => c.level },
  { key: 'src', label: 'Came from', group: 'Customer', type: 'text', get: (c) => c.src },
  { key: 'tags', label: 'Tag', group: 'Customer', type: 'tags', options: null, get: (c) => c.tags || [] },
  { key: 'owner', label: 'Looked after by', group: 'Customer', type: 'text', get: (c) => c.owner },
  { key: 'birthday', label: 'Birthday', group: 'Customer', type: 'choice', options: [['thisMonth', 'This month'], ['nextMonth', 'Next month']], get: (c) => birthdayWhen(c.birthday) },
  { key: 'restriction', label: 'Restriction', group: 'Controls', type: 'tags', options: Object.keys(RESTRICTION_TYPES).map((k) => [k, RESTRICTION_TYPES[k].label]), get: (c) => (c.restrictions || []).map((r) => r.type) },
  ...['sms', 'whatsapp', 'email', 'call'].map((ch) => ({ key: 'consent.' + ch, label: { sms: 'SMS', whatsapp: 'WhatsApp', email: 'Email', call: 'Calls' }[ch] + ' consent', group: 'Consent', type: 'choice', options: Object.keys(CONSENT_STATES).map((k) => [k, CONSENT_STATES[k]]), get: (c) => getConsent(c)[ch].state })),
  { key: 'signal.churn', label: 'Churn risk', group: 'Signals', type: 'choice', options: [['Normal', 'Normal'], ['Watch', 'Watch'], ['At risk', 'At risk'], ['Not enough data', 'Not enough data']], get: sig('churn') },
  { key: 'signal.vip', label: 'VIP likelihood', group: 'Signals', type: 'choice', options: [['High', 'High'], ['Medium', 'Medium'], ['Low', 'Low'], ['Not enough data', 'Not enough data']], get: sig('vip') },
  { key: 'signal.history', label: 'Order history', group: 'Signals', type: 'choice', options: [['Normal history', 'Normal history'], ['Review recommended', 'Review recommended'], ['Not enough data', 'Not enough data']], get: sig('history') },
];
function birthdayWhen(b) {
  const m = /^(\d{1,2}) ([A-Z][a-z]{2})/.exec(String(b || '')); if (!m) return '';
  const mi = MONTHS.indexOf(m[2]), now = new Date().getMonth();
  return mi === now ? 'thisMonth' : mi === (now + 1) % 12 ? 'nextMonth' : '';
}
const CF_TYPE = { text: 'text', number: 'number', date: 'text', select: 'choice', bool: 'bool' };
/** Every field a rule can use, the shop's segmentable custom fields last. */
export function segmentFields() {
  const cf = getFieldDefs().filter((d) => d.segmentable).map((d) => ({ key: 'cf.' + d.key, label: d.label, group: 'Custom fields', type: CF_TYPE[d.type] || 'text', options: d.type === 'select' ? d.options.map((o) => [o, o]) : null, get: (c) => (c.cf || {})[d.key] }));
  return [...BASE_FIELDS, ...cf];
}
export const fieldBy = (key) => segmentFields().find((f) => f.key === key) || null;

export const OPS = {
  number: [['gte', 'at least'], ['lte', 'at most'], ['eq', 'exactly']],
  money: [['gte', 'at least'], ['lte', 'at most']],
  days: [['gte', 'more than … days ago'], ['lte', 'within the last … days'], ['never', 'never']],
  text: [['has', 'contains'], ['is', 'is'], ['empty', 'is empty']],
  choice: [['is', 'is'], ['not', 'is not']],
  tags: [['has', 'includes'], ['hasNot', 'does not include']],
  bool: [['yes', 'is yes'], ['no', 'is no']],
};
export const opsFor = (field) => OPS[(field || {}).type] || OPS.text;
const lc = (v) => String(v == null ? '' : v).toLowerCase();

/** Does one rule hold for this customer? */
export function ruleHolds(rule, c, fields) {
  const f = (fields || segmentFields()).find((x) => x.key === rule.field);
  if (!f) return false;
  const v = f.get(c), want = rule.value;
  switch (rule.op) {
    case 'gte': return v != null && v !== '' && Number(v) >= Number(want);
    case 'lte': return v != null && v !== '' && Number(v) <= Number(want);
    case 'eq': return v != null && Number(v) === Number(want);
    case 'never': return v == null;
    case 'has': return Array.isArray(v) ? v.map(lc).includes(lc(want)) : lc(v).indexOf(lc(want)) >= 0;
    case 'hasNot': return Array.isArray(v) ? !v.map(lc).includes(lc(want)) : lc(v).indexOf(lc(want)) < 0;
    case 'is': return lc(v) === lc(want);
    case 'not': return lc(v) !== lc(want);
    case 'empty': return v == null || v === '';
    case 'yes': return v === true;
    case 'no': return v !== true;
    default: return false;
  }
}
/** Does a segment definition { join: 'and' | 'or', rules: [rule | group] } hold for this customer? */
export function evaluate(def, c, fields) {
  const rules = (def && def.rules) || [];
  if (!rules.length) return true;
  const one = (r) => (r.rules ? evaluate(r, c, fields) : ruleHolds(r, c, fields));
  return def.join === 'or' ? rules.some(one) : rules.every(one);
}
/** A rule in words: "Total spent at least ৳20,000". */
export function ruleText(rule) {
  const f = fieldBy(rule.field); if (!f) return rule.field;
  const op = (opsFor(f).find((o) => o[0] === rule.op) || [rule.op, rule.op])[1];
  const opt = f.options ? (f.options.find((o) => o[0] === rule.value) || [0, rule.value])[1] : rule.value;
  if (rule.op === 'never' || rule.op === 'empty' || rule.op === 'yes' || rule.op === 'no') return f.label + ' ' + op;
  if (f.type === 'days') return f.label + ' ' + op.replace('…', rule.value);
  return f.label + ' ' + op + ' ' + (f.type === 'money' ? '৳' + Number(rule.value || 0).toLocaleString('en-IN') : opt);
}
export const defText = (def) => ((def && def.rules) || []).map((r) => (r.rules ? '(' + defText(r) + ')' : ruleText(r))).join(def && def.join === 'or' ? ' OR ' : ' AND ');

// ---- templates from Recovery & customer intelligence ------------------------------------------------------
export const SEGMENT_TEMPLATES = [
  { id: 'TPL-at-risk-vip', name: 'At-risk VIPs', kind: 'Predictive', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'signal.vip', op: 'is', value: 'High' }, { join: 'or', rules: [{ field: 'signal.churn', op: 'is', value: 'Watch' }, { field: 'signal.churn', op: 'is', value: 'At risk' }] }] } },
  { id: 'TPL-one-time', name: 'One-time buyers', kind: 'Rule', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'orders', op: 'eq', value: 1 }] } },
  { id: 'TPL-lapsed-90', name: 'Lapsed 90 days', kind: 'Lifecycle', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'lastOrder', op: 'gte', value: 90 }] } },
  { id: 'TPL-big-spenders', name: 'Big spenders', kind: 'Rule', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'spent', op: 'gte', value: 50000 }] } },
  { id: 'TPL-new-30', name: 'New in the last 30 days', kind: 'Lifecycle', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'signup', op: 'lte', value: 30 }] } },
  { id: 'TPL-never-ordered', name: 'Signed up, never ordered', kind: 'Rule', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'orders', op: 'eq', value: 0 }] } },
  { id: 'TPL-high-returns', name: 'Many returns', kind: 'Rule', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'signal.history', op: 'is', value: 'Review recommended' }] } },
  { id: 'TPL-birthday', name: 'Birthday this month', kind: 'Date', owner: 'Recovery', def: { join: 'and', rules: [{ field: 'birthday', op: 'is', value: 'thisMonth' }] } },
];

// ---- saved segments ---------------------------------------------------------------------------------------------
const ssr = () => typeof window === 'undefined';
const SEED = [
  { id: 'SEG-1001', name: 'High-value lapsed skin care buyers', def: { join: 'and', rules: [{ field: 'spent', op: 'gte', value: 20000 }, { field: 'lastOrder', op: 'gte', value: 14 }, { field: 'consent.whatsapp', op: 'is', value: 'in' }, { field: 'status', op: 'is', value: 'Active' }] }, members: [], by: 'Tania', createdAt: new Date(2026, 8, 2).getTime() },
  { id: 'SEG-1002', name: 'Dhaka repeat buyers', def: { join: 'and', rules: [{ field: 'city', op: 'has', value: 'Dhaka' }, { field: 'orders', op: 'gte', value: 2 }] }, members: [], by: 'Karim', createdAt: new Date(2026, 8, 10).getTime() },
];
function read() { if (ssr()) return SEED; try { const v = JSON.parse(window.localStorage.getItem(SEGMENTS_KEY)); return Array.isArray(v) ? v : SEED; } catch { return SEED; } }
function write(list) { try { window.localStorage.setItem(SEGMENTS_KEY, JSON.stringify(list)); window.dispatchEvent(new CustomEvent(SEGMENTS_EVENT)); } catch { /* storage blocked */ } }

export const getSegments = () => read();
/** A saved segment or a template, by ID. */
export const getSegment = (id) => read().find((s) => s.id === id) || SEGMENT_TEMPLATES.find((t) => t.id === id) || null;
/** Save (create or change) a segment. → { ok, segment } or { ok: false, error } */
export function saveSegment({ id, name, def, members, templateId, by = 'Staff' }) {
  const n = String(name || '').trim();
  if (!n) return { ok: false, error: 'Give the segment a name.' };
  const list = read();
  if (list.some((s) => s.id !== id && s.name.toLowerCase() === n.toLowerCase())) return { ok: false, error: 'There is already a segment with this name.' };
  const now = Date.now();
  const prev = id ? list.find((s) => s.id === id) : null;
  const seg = { ...(prev || {}), id: prev ? prev.id : 'SEG-' + (1000 + list.length + 1) + '-' + (now % 1000), name: n, def: def || { join: 'and', rules: [] }, members: members || (prev ? prev.members : []), templateId: templateId || (prev || {}).templateId || '', by: prev ? prev.by : by, createdAt: prev ? prev.createdAt : now, updatedAt: now };
  write(prev ? list.map((s) => (s.id === seg.id ? seg : s)) : [seg, ...list]);
  return { ok: true, segment: seg };
}
export function deleteSegment(id) { write(read().filter((s) => s.id !== id)); }
/** Add customers to a segment by hand (bulk jobs). → how many were new. */
export function addMembers(id, ids) {
  const list = read(); const s = list.find((x) => x.id === id); if (!s) return 0;
  const cur = new Set(s.members || []); let n = 0;
  ids.forEach((x) => { if (!cur.has(x)) { cur.add(x); n += 1; } });
  write(list.map((x) => (x.id === id ? { ...x, members: [...cur], updatedAt: Date.now() } : x)));
  return n;
}
export function removeMember(id, customerId) { write(read().map((x) => (x.id === id ? { ...x, members: (x.members || []).filter((m) => m !== customerId) } : x))); }

/** The customers in a segment (id, or a definition). */
export function segmentMembers(ref, rows) {
  const all = rows || getCrmRows();
  const seg = typeof ref === 'string' ? getSegment(ref) : ref && ref.rules ? { def: ref, members: [] } : ref;
  if (!seg) return [];
  const fields = segmentFields();
  const hand = new Set(seg.members || []);
  const hasRules = ((seg.def || {}).rules || []).length > 0;
  return all.filter((c) => hand.has(c.id) || (hasRules && evaluate(seg.def, c, fields)));
}
export const segmentCount = (ref, rows) => segmentMembers(ref, rows).length;
/** Count and a few names for the builder's preview. */
export function previewSegment(def, rows) {
  const m = segmentMembers({ def, members: [] }, rows);
  return { count: m.length, sample: m.slice(0, 5).map((c) => c.name), at: Date.now() };
}
/** Which saved segments (and templates) this customer is in. */
export function segmentsOf(customer, rows) {
  const all = rows || getCrmRows();
  return [...read(), ...SEGMENT_TEMPLATES].filter((s) => segmentMembers(s, all).some((c) => c.id === customer.id));
}

// ---- for campaigns (Marketing / Communications) --------------------------------------------------------------------
/** Segments to pick for a campaign on this channel, with how many people can get it. */
export function segmentsForCampaign(channel = 'sms', rows) {
  const all = rows || getCrmRows();
  return [...read(), ...SEGMENT_TEMPLATES].map((s) => {
    const m = segmentMembers(s, all);
    return { id: s.id, name: s.name, template: !!s.owner, count: m.length, eligible: m.filter((c) => isAllowed(c, channelKey(channel), 'marketing')).length };
  });
}
/** Who in a segment can get a marketing message on this channel. → { members, eligible, excluded } */
export function campaignAudience(segmentId, channel = 'sms', rows) {
  const m = segmentMembers(segmentId, rows);
  const eligible = m.filter((c) => isAllowed(c, channelKey(channel), 'marketing'));
  return { members: m, eligible, excluded: m.length - eligible.length };
}
