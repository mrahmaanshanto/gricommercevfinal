// alerts — rules on dictionary metrics, checked whenever a page that shows alerts opens (Nayeem's brief #14, "Alert
// rule: metric + filters + evaluation period + comparison/threshold + consecutive periods + cooldown + severity").
//
// A rule: { id, name, metric, cond, threshold, window, consecutive, cooldownHours, severity, on, event?, source? }
//   cond      'drop'    the metric fell by threshold % against the window before (sales down 30% vs last week)
//             'below' / 'above'   the metric is under / over threshold (ROAS below 2, RTO above 15%)
//             'stopped' no `event` from `source` for threshold hours (an event stopped)
//   window    'day' | 'week'; consecutive = how many windows in a row the condition must hold
//   cooldownHours  after an alert fires, the same rule stays quiet this long (no flapping around the limit)
// evaluateAlerts(now) → { alerts, rules } runs every rule and records new alerts in this browser (gc.alerts).
// An alert: { id, ruleId, title, detail, at, severity, state: 'open'|'acknowledged'|'snoozed'|'resolved', value, metric }
// acknowledge(id) · snooze(ruleId, hours) · setRule(id, patch). Open alerts are passed to Home's action items
// (lib/actionItems.js, source 'alerts', key 'alerts:<rule id>'); seen / snoozed alerts resolve their item there.
// alertItems() lists them in the same shape for pages that read alerts directly.
// Sending the alert by WhatsApp / SMS / email is Communications' job (the server); front end only.

import { metricValue, metricBy } from './reports/metrics';
import { lastSeen, syncDemoEvents, EVENT_LABEL, SOURCE_LABEL } from './events';
import { fmt } from './reports/period';
import { syncItems, resolveItem } from './actionItems';

const KEY = 'gc.alerts';
const DAY = 864e5, HOUR = 36e5;
export const ALERTS_EVENT = 'gc:alerts';
export const SEVERITY = { high: { label: 'High', tone: 'error' }, medium: { label: 'Medium', tone: 'warning' }, low: { label: 'Low', tone: 'info' } };

export const DEFAULT_RULES = [
  { id: 'sales-drop', name: 'Sales down', metric: 'net_sales', cond: 'drop', threshold: 30, window: 'week', consecutive: 1, cooldownHours: 24, severity: 'high', on: true },
  { id: 'roas-low', name: 'Delivered ROAS low', metric: 'delivered_roas', cond: 'below', threshold: 2, window: 'week', consecutive: 1, cooldownHours: 24, severity: 'high', on: true },
  { id: 'rto-high', name: 'Returns to origin high', metric: 'rto_rate', cond: 'above', threshold: 10, window: 'week', consecutive: 1, cooldownHours: 24, severity: 'medium', on: true },
  { id: 'event-stopped', name: 'Event stopped', metric: '', event: 'order_placed', source: 'browser', cond: 'stopped', threshold: 6, window: 'day', consecutive: 1, cooldownHours: 6, severity: 'high', on: true },
  { id: 'conv-low', name: 'Conversion rate low', metric: 'conversion_rate', cond: 'below', threshold: 1, window: 'day', consecutive: 2, cooldownHours: 24, severity: 'low', on: false },
];

const ssr = () => typeof window === 'undefined';
const blank = () => ({ rules: {}, custom: [], log: [], acks: {}, snooze: {}, lastFired: {} });
function load() { if (ssr()) return blank(); try { return { ...blank(), ...(JSON.parse(window.localStorage.getItem(KEY)) || {}) }; } catch { return blank(); } }
function save(st) { st.log = st.log.slice(0, 60); try { window.localStorage.setItem(KEY, JSON.stringify(st)); window.dispatchEvent(new CustomEvent(ALERTS_EVENT)); } catch { /* ignore */ } }

/** Every rule with the shop's changes applied. */
export function getRules() {
  const st = load();
  return [...DEFAULT_RULES, ...st.custom].map((r) => ({ ...r, ...(st.rules[r.id] || {}) }));
}
/** Change a rule (on/off, threshold …). */
export function setRule(id, patch) {
  const st = load();
  if (st.custom.some((r) => r.id === id)) st.custom = st.custom.map((r) => (r.id === id ? { ...r, ...patch } : r));
  else st.rules[id] = { ...(st.rules[id] || {}), ...patch };
  save(st);
}
/** Add a rule: { metric, cond, threshold, window, severity }. */
export function addRule(rule) {
  const st = load();
  const m = metricBy(rule.metric);
  const id = 'r-' + Date.now().toString(36);
  st.custom.push({ id, name: rule.name || (m ? m.name : 'Alert'), consecutive: 1, cooldownHours: 24, severity: 'medium', window: 'week', on: true, ...rule, id });
  save(st);
  return id;
}

const winLen = (w) => (w === 'day' ? DAY : 7 * DAY);
/** Plain description of a rule: "Net sales down 30% against the week before". */
export function ruleText(r) {
  const m = metricBy(r.metric);
  const per = r.window === 'day' ? 'day' : 'week';
  const n = r.consecutive > 1 ? ` for ${r.consecutive} ${per}s in a row` : '';
  if (r.cond === 'stopped') return `No ${EVENT_LABEL[r.event] || r.event} event from ${(SOURCE_LABEL[r.source] || 'any source').toLowerCase()} for ${r.threshold} hours`;
  if (!m) return '';
  const val = (x) => (m.format === 'pct' ? x + '%' : m.format === 'x' ? x + '×' : m.format === 'money' ? fmt(x, 'money0') : String(x));
  if (r.cond === 'drop') return `${m.name} down ${r.threshold}% against the ${per} before${n}`;
  return `${m.name} ${r.cond === 'below' ? 'below' : 'above'} ${val(r.threshold)} over the last ${per}${n}`;
}

/** Does the rule's condition hold for the window ending at `end`? → { hit, value, base } (value null = no data). */
function check(r, end) {
  const len = winLen(r.window);
  const ctx = { from: end - len, to: end };
  const value = metricValue(r.metric, ctx);
  if (value == null) return { hit: false, value: null };
  const m = metricBy(r.metric);
  const scaled = m && m.format === 'pct' ? value * 100 : value;
  if (r.cond === 'drop') {
    const base = metricValue(r.metric, { from: end - 2 * len, to: end - len });
    if (!base) return { hit: false, value, base };
    const drop = (1 - value / base) * 100;
    return { hit: drop >= r.threshold, value, base, drop };
  }
  if (r.cond === 'below') return { hit: scaled < r.threshold, value };
  if (r.cond === 'above') return { hit: scaled > r.threshold, value };
  return { hit: false, value };
}

function evaluateRule(r, now) {
  if (r.cond === 'stopped') {
    const last = lastSeen(r.event, r.source);
    const hours = last ? (now - last) / HOUR : Infinity;
    return { hit: hours >= r.threshold, value: last, detail: last ? `Last one ${fmt(last, 'datetime')}` : 'None received yet' };
  }
  let hit = true, first = null;
  for (let i = 0; i < Math.max(1, r.consecutive || 1); i++) {
    const c = check(r, now - i * winLen(r.window));
    if (i === 0) first = c;
    if (!c.hit) { hit = false; break; }
  }
  const m = metricBy(r.metric);
  if (!first || first.value == null) return { hit: false, value: null, detail: 'No data in this period' };
  const shown = m.format === 'pct' ? fmt(first.value, 'pct') : m.format === 'x' ? (Math.round(first.value * 100) / 100) + '×' : m.format === 'money' ? fmt(first.value, 'money0') : fmt(first.value, 'int');
  const detail = r.cond === 'drop' && first.base ? `${shown} against ${fmt(first.base, 'money0')} the ${r.window === 'day' ? 'day' : 'week'} before` : `${shown} over the last ${r.window === 'day' ? 'day' : '7 days'}`;
  return { hit, value: first.value, detail };
}

/**
 * Run every rule now (on open). New alerts are kept; a rule inside its cooldown or snoozed does not fire again.
 * → { alerts (newest first, with state), rules: [{ …rule, text, status: 'ok'|'firing'|'snoozed'|'off'|'nodata', detail, value }] }
 */
export function evaluateAlerts(now = Date.now()) {
  try { syncDemoEvents(now); } catch { /* the event feed is optional */ }
  const st = load();
  const rules = getRules().map((r) => {
    const text = ruleText(r);
    if (!r.on) return { ...r, text, status: 'off' };
    const res = evaluateRule(r, now);
    const snoozedUntil = st.snooze[r.id] && st.snooze[r.id] > now ? st.snooze[r.id] : 0;
    let status = res.value == null && r.cond !== 'stopped' ? 'nodata' : res.hit ? 'firing' : 'ok';
    if (res.hit && !snoozedUntil) {
      const last = st.lastFired[r.id] || 0;
      const open = st.log.find((a) => a.ruleId === r.id && !a.resolvedAt);
      if (!open && now - last >= (r.cooldownHours || 0) * HOUR) {
        const a = { id: r.id + ':' + now.toString(36), ruleId: r.id, title: r.name, detail: res.detail, text, at: now, severity: r.severity, metric: r.metric, value: res.value };
        st.log.unshift(a);
        st.lastFired[r.id] = now;
      } else if (open) { open.detail = res.detail; open.value = res.value; }
    }
    // the condition cleared: the open alert is resolved
    if (!res.hit) st.log.forEach((a) => { if (a.ruleId === r.id && !a.resolvedAt) a.resolvedAt = now; });
    if (snoozedUntil) status = 'snoozed';
    return { ...r, text, status, detail: res.detail, value: res.value, snoozedUntil };
  });
  save(st);
  const alerts = listAlerts(st, now);
  try {
    syncItems('alerts', alerts.filter((a) => a.state === 'open').map((a) => ({
      key: 'alerts:' + a.ruleId, label: a.title, n: '', detail: a.detail, href: '/reports-alerts', area: 'area-analytics', owner: ['ceo', 'ads'],
      severity: a.severity === 'high' ? 'high' : a.severity === 'low' ? 'low' : 'normal', since: a.at,
    })));
  } catch { /* the action list is optional */ }
  return { alerts, rules };
}

function listAlerts(st = load(), now = Date.now()) {
  return st.log.map((a) => {
    const ack = st.acks[a.id];
    const snoozed = st.snooze[a.ruleId] && st.snooze[a.ruleId] > now;
    const state = a.resolvedAt ? 'resolved' : ack ? 'acknowledged' : snoozed ? 'snoozed' : 'open';
    return { ...a, state, ack: ack || null, snoozedUntil: snoozed ? st.snooze[a.ruleId] : 0 };
  });
}
/** Alerts kept in this browser, newest first (without running the rules). */
export const getAlerts = () => listAlerts();

export function acknowledge(id, by = 'You') {
  const st = load(); st.acks[id] = { at: Date.now(), by }; save(st);
  try { resolveItem('alerts:' + String(id).split(':')[0], 'done'); } catch { /* ignore */ }
}
/** Quiet a rule for `hours` (its open alert leaves the to-do list until then). */
export function snooze(ruleId, hours) {
  const st = load(); const until = Date.now() + hours * HOUR; st.snooze[ruleId] = until; save(st);
  try { resolveItem('alerts:' + ruleId, 'snoozed', { until }); } catch { /* ignore */ }
}
export function unsnooze(ruleId) { const st = load(); delete st.snooze[ruleId]; save(st); }

/** Open alerts as Home action items: [{ id, title, detail, href, tone, at }]. */
export function alertItems(now = Date.now()) {
  return listAlerts(load(), now).filter((a) => a.state === 'open').map((a) => ({ id: 'alert:' + a.id, kind: 'alert', title: a.title, detail: a.detail, href: '/reports-alerts', tone: (SEVERITY[a.severity] || SEVERITY.medium).tone, at: a.at }));
}
