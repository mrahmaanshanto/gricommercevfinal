'use client';
// Generated from design/templates/tracking-analytics/ReportsAlerts.dc.html by scripts/convert-design.mjs.
// Reports & alerts — alert rules on the numbers that matter and a report builder, laid out like a Shopify report: the
// title row (back to Reports), the key figures, the alert rules beside this week's alerts, then Build a report. Reports
// sent on a schedule live on the Scheduled reports page.
// Alerts run on lib/alerts.js (rules on dictionary metrics, checked when this page opens): the rules can be turned on
// and off and added; fired alerts can be acknowledged or snoozed, and open ones go to Home as action items. The report
// builder takes its numbers from the metric dictionary (lib/reports/metrics.js) and the shared books.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { wholesaleOn } from '@/lib/edition';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { InfoTip as __InfoTip, Dialog as __Dialog, StatusBadge as __StatusBadge } from '@/components/ui';
import { evaluateAlerts, setRule, addRule, acknowledge, snooze, unsnooze, SEVERITY } from '@/lib/alerts';
import { METRICS, metricBy, metricValue, metricDays, explain } from '@/lib/reports/metrics';
import { getPrefs } from '@/lib/reports/prefs';
import { fmt, downloadCsv, addDays, startOfDay, weekStart } from '@/lib/reports/period';
import { RecordHeader, MetricStrip, Menu as __Menu } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
// the builder's numbers come from the metric dictionary
var BUILD_METRICS = ['net_sales', 'orders', 'aov', 'gross_profit', 'online_orders', 'delivered_orders', 'delivered_sales', 'rto_rate', 'ad_spend', 'delivered_roas', 'cost_per_delivered', 'contribution_after_ads', 'visitors', 'conversion_rate', 'new_customers'];
var DAY = 864e5;
function mval(id, v) { var m = metricBy(id); if (v == null) return '—'; if (!m) return String(v); return m.format === 'pct' ? fmt(v, 'pct') : m.format === 'x' ? (Math.round(v * 100) / 100).toFixed(2) + '×' : m.format === 'int' ? fmt(v, 'int') : fmt(v, 'money0'); }
function periodRange(p, now) { var end = startOfDay(now) + DAY; if (p === 'month') { var d = new Date(now); return { from: new Date(d.getFullYear(), d.getMonth(), 1).getTime(), to: end }; } var n = p === '90' ? 90 : p === '7' ? 7 : 30; return { from: end - n * DAY, to: end }; }
function ago(t, now) { var m = Math.round((now - t) / 60000); if (m < 60) return Math.max(1, m) + ' min ago'; var h = Math.round(m / 60); if (h < 24) return h + ' h ago'; return fmt(t, 'datetime'); }
var SEV_COLOR = { high: 'var(--text-danger)', medium: 'var(--text-warning)', low: 'var(--text-info)' };
class Component extends DCLogic {
  componentDidMount() {
    this.run = () => { try { var r = evaluateAlerts(); this.setState({ ev: r, now: Date.now(), prefs: getPrefs() }); } catch (e) { this.setState({ ev: { rules: [], alerts: [] }, now: Date.now() }); } };
    this.run();
  }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var ev = s.ev || { rules: [], alerts: [] }, now = s.now || 0;
    var mets = s.mets || ['net_sales', 'orders', 'delivered_roas', 'rto_rate'], dim = s.dim || 'week', per = s.per || '30', cmp = s.cmp || 'previous';
    var weekAgo = now - 7 * DAY;
    var recent = ev.alerts.filter(function (a) { return a.at >= weekAgo; });
    var open = ev.alerts.filter(function (a) { return a.state === 'open'; });
    var scheduled = ((s.prefs || {}).schedules || []).filter(function (x) { return x.active !== false; }).length;
    // builder rows: weeks, days or channels
    var rows = [];
    if (now) {
      if (dim === 'week') { var ws = weekStart(now); for (var i = 3; i >= 0; i--) { var f = addDays(ws, -7 * i); rows.push({ n: fmt(f, 'date').replace(/ \d{4}$/, '') + ' week', ctx: { from: f, to: addDays(f, 7) }, prev: { from: addDays(f, -7), to: f } }); } }
      else if (dim === 'day') { var d0 = startOfDay(now); for (var j = 6; j >= 0; j--) { var fd = addDays(d0, -j); rows.push({ n: fmt(fd, 'date').replace(/ \d{4}$/, ''), ctx: { from: fd, to: addDays(fd, 1) }, prev: { from: addDays(fd, -7), to: addDays(fd, -6) } }); } }
      else { var pr = periodRange(per, now), len = pr.to - pr.from; ['', 'Online', 'Retail'].concat(wholesaleOn() ? ['Wholesale'] : []).forEach(function (c) { rows.push({ n: c || 'All channels', ch: c, ctx: { from: pr.from, to: pr.to, channel: c }, prev: { from: cmp === 'year' ? addDays(pr.from, -364) : pr.from - len, to: cmp === 'year' ? addDays(pr.to, -364) : pr.from, channel: c } }); }); }
    }
    var cellOf = function (id, r) {
      var m = metricBy(id);
      var onlineOnly = m && /^Online/.test(m.scope) && r.ch && r.ch !== 'Online';
      if (onlineOnly) return { t: '—', d: '', c: 'var(--text-muted)', v: null };
      var v = metricValue(id, r.ctx), b = cmp === 'none' ? null : metricValue(id, r.prev);
      if (v == null || b == null || !b) return { t: mval(id, v), d: '', c: 'var(--text-muted)', v: v };
      var ch = (v - b) / Math.abs(b), up = ch >= 0, good = m && m.good === 'down' ? !up : up;
      return { t: mval(id, v), d: (up ? '▲ ' : '▼ ') + Math.abs(Math.round(ch * 100)) + '%', c: good ? 'var(--text-success)' : 'var(--text-danger)', v: v };
    };
    var prev = rows.map(function (r) { return { n: r.n, v: mets.map(function (id) { return cellOf(id, r); }) }; });
    var v = {
      tiles: [
        { l: 'Alerts on', v: ev.rules.filter(function (r) { return r.on; }).length + ' of ' + ev.rules.length, s: 'rules watching' },
        { l: 'Open alerts', v: String(open.length), s: open.length ? 'need a look' : 'all handled' },
        { l: 'Fired this week', v: String(recent.length), s: 'last 7 days' },
        { l: 'Reports scheduled', v: String(scheduled), s: 'on a schedule' },
      ],
      rules: ev.rules.map(function (r) {
        var days = r.metric && now ? metricDays(r.metric, startOfDay(now) - 13 * DAY, startOfDay(now) + DAY).map(function (x) { return x.value == null ? 0 : x.value; }) : [];
        var sp = days.length > 1 && Math.max.apply(null, days) !== Math.min.apply(null, days) ? sparkP(days) : { line: 'M0 15 H160', area: '' };
        var st = r.status === 'firing' ? ['Firing', 'var(--fill-error-soft)', 'var(--text-danger)'] : r.status === 'snoozed' ? ['Snoozed', 'var(--fill-warning-soft)', 'var(--text-warning)'] : r.status === 'nodata' ? ['No data', 'var(--surface-subtle)', 'var(--text-muted)'] : r.status === 'off' ? ['Off', 'var(--surface-subtle)', 'var(--text-muted)'] : ['OK', 'var(--fill-success-soft)', 'var(--text-success)'];
        return { id: r.id, t: r.name, s: r.text + (r.detail ? ' · ' + r.detail : ''), fired: st[0], fb: st[1], ff: st[2], sev: r.on ? SEV_COLOR[r.severity] || SEV_COLOR.medium : 'var(--border-subtle)', line: sp.line, area: sp.area, on: !!r.on, cls: r.on ? 'sw on' : 'sw', how: r.metric ? explain(r.metric) : '',
          snoozed: r.status === 'snoozed', unsnooze: function () { unsnooze(r.id); self.run(); toast(self, r.name + ' is watching again.'); },
          tog: function () { setRule(r.id, { on: !r.on }); self.run(); toast(self, r.on ? r.name + ' turned off.' : r.name + ' is watching again.'); } };
      }),
      feed: ev.alerts.slice(0, 8).map(function (a) {
        var sev = SEVERITY[a.severity] || SEVERITY.medium;
        return { id: a.id, t: a.title, w: now ? ago(a.at, now) : '', s: a.detail, c: a.state === 'resolved' ? 'var(--text-success)' : SEV_COLOR[a.severity] || SEV_COLOR.medium, state: a.state, tone: a.state === 'open' ? sev.tone : a.state === 'resolved' ? 'success' : 'neutral',
          stateL: a.state === 'open' ? 'Open' : a.state === 'acknowledged' ? 'Seen by ' + ((a.ack && a.ack.by) || 'you').split(' (')[0] : a.state === 'snoozed' ? 'Snoozed' : 'Resolved',
          ack: function () { acknowledge(a.id); self.run(); toast(self, 'Alert marked as seen'); },
          snoozeDay: function () { snooze(a.ruleId, 24); self.run(); toast(self, 'Snoozed for a day'); },
          snoozeWeek: function () { snooze(a.ruleId, 24 * 7); self.run(); toast(self, 'Snoozed for a week'); } };
      }),
      addRule: function () { self.setState({ nr: { metric: 'net_sales', cond: 'drop', threshold: '30', window: 'week', severity: 'medium' } }); },
      nr: s.nr || null, setNr: function (k) { return function (e) { var n = assign({}, s.nr); n[k] = e.target.value; self.setState({ nr: n }); }; }, closeNr: function () { self.setState({ nr: null }); },
      saveNr: function () { var n = s.nr; var th = Number(n.threshold); if (!(th > 0)) { toast(self, 'Enter a limit above 0.', true); return; } addRule({ metric: n.metric, cond: n.cond, threshold: th, window: n.window, severity: n.severity }); self.setState({ nr: null }); self.run(); toast(self, 'Alert added'); },
      ruleMetrics: METRICS.map(function (m) { return { id: m.id, l: m.name }; }),
      mets: BUILD_METRICS.map(function (id) { var o = mets.indexOf(id) >= 0; var m = metricBy(id); return { l: m ? m.name : id, on: o, tog: function () { var n = o ? mets.filter(function (x) { return x !== id; }) : mets.concat([id]); if (n.length) self.setState({ mets: n.slice(-6) }); } }; }),
      dim: dim, setDim: function (e) { self.setState({ dim: e.target.value }); }, dimL: dim === 'week' ? 'Week' : dim === 'day' ? 'Day' : 'Channel',
      per: per, setPer: function (e) { self.setState({ per: e.target.value }); }, cmp: cmp, setCmp: function (e) { self.setState({ cmp: e.target.value }); },
      cols: mets.map(function (id) { var m = metricBy(id); return { l: m ? m.name : id, how: explain(id) }; }),
      prev: prev,
      xls: function () {
        var head = [v.dimL].concat(mets.map(function (id) { var m = metricBy(id); return m ? m.name + ' (v' + m.version + ')' : id; }));
        var out = [head].concat(prev.map(function (r) { return [r.n].concat(r.v.map(function (c) { return c.v == null ? '' : Math.round(c.v * 100) / 100; })); }));
        downloadCsv('report-' + dim + '.csv', out); toast(self, 'Spreadsheet downloaded.');
      },
      pdf: function () { window.print(); }, saveRep: function () { toast(self, 'Report saved — schedule it from Scheduled reports.'); }
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
@media (max-width:640px){
  /* alert rule: title + badge, toggle on the right; the sparkline gets the full width below */
  .ra-rule{display:grid!important;grid-template-columns:4px minmax(0,1fr) auto;column-gap:10px!important;row-gap:8px;align-items:start!important}
  .ra-rule>span:first-child{grid-row:1 / span 2;grid-column:1;align-self:stretch}
  .ra-rule>div:nth-child(2){grid-column:2;grid-row:1}
  .ra-rule>div:nth-child(2)>div:first-child{flex-wrap:wrap;row-gap:4px}
  .ra-rule>div:nth-child(3){grid-column:2 / -1;grid-row:2;width:100%!important}
  .ra-rule>div:nth-child(3)>svg{width:100%}
  .ra-rule>button{grid-column:3;grid-row:1}
  .ra-to{flex-wrap:wrap;row-gap:8px!important}
  .ra-to>select{width:100%!important}
  .ra-build{grid-template-columns:minmax(0,1fr)!important}
  .ra-acts{flex-wrap:wrap}
  .ra-acts>.btn{flex:1 1 auto}
}
/* selects use the shared chevron (gc-select); .inp's background shorthand would wipe it, so it is restated here */
.ra-fld{display:flex;flex-direction:column;gap:6px}
.inp.gc-select{padding-right:var(--space-8);background-image:linear-gradient(45deg,transparent 50%,var(--text-muted) 50%),linear-gradient(135deg,var(--text-muted) 50%,transparent 50%);background-position:calc(100% - 18px) 20px,calc(100% - 13px) 20px;background-size:5px 5px,5px 5px;background-repeat:no-repeat}
` + TA_PHONE_CSS;

// ---- markup ----

export default class ReportsAlertsScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="ReportsAlerts">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="rep-marketing" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page={"Reports & alerts"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/reports-centre?group=marketing" title="Reports & alerts"
                about="Know first: alerts watch a number (ad spend, returns, stock, payouts) and tell you when it crosses a limit; build a report from any figures and download it as a spreadsheet or PDF. Reports sent on a schedule are set up in Scheduled reports."
                secondary={[{ label: 'Scheduled reports', href: '/scheduled-reports' }]}
                more={[{ label: 'Analytics hub', href: '/analytics-hub' }, { label: 'All reports', href: '/reports-centre' }]} />
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, href: t.l === 'Reports scheduled' ? '/scheduled-reports' : undefined, sub: t.s }))} />
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.6fr) minmax(0, 1fr)", gap: "16px", alignItems: "start" }}>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">Alert rules <__InfoTip text="Sparkline shows the watched number over the last 14 days." /></h2>
                    </div>
                    <button type="button" className="abtn" onClick={v.addRule}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>New alert</button>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                    {__list(v.rules).map((ru, $index) => (<React.Fragment key={$index}>
                        <div className="row ra-rule" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px", borderRadius: "var(--radius-xl)", border: "1px solid #eef1f6" }}>
                          <span style={__sx(`width: 4px; align-self: stretch; border-radius: var(--radius-sm); background: ${ru?.sev ?? ""};`)} />
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--text-heading)" }}>{ru?.t}</span>
                              <span className="dl" style={__sx(`background: ${ru?.fb ?? ""}; color: ${ru?.ff ?? ""};`)}>{ru?.fired}</span>
                              {ru?.how ? <__InfoTip text={ru.how} label="How is this calculated?" /> : null}
                              {ru?.snoozed ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={ru.unsnooze}>Wake</button> : null}
                            </div>
                            <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", marginTop: "2px" }}>{ru?.s}</div>
                          </div>
                          <div style={{ width: "90px" }}>
                            <svg width="90" height="24" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
                              <path d={ru?.area} fill={ru?.sev} fillOpacity=".12" />
                              <path d={ru?.line} fill="none" stroke={ru?.sev} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                            </svg>
                          </div>
                          <button type="button" role="switch" aria-checked={ru?.on} aria-label="Alert on or off" className={ru?.cls} onClick={ru?.tog} />
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="ra-to" style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Send alerts to</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Who hears about it</div>
                    </div>
                    <select className="inp gc-select" aria-label="Alert to" style={{ width: "230px" }}>
                      <option>WhatsApp + app · owner</option>
                      <option>SMS · owner and marketer</option>
                      <option>Email only</option>
                    </select>
                  </div>
                </section>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">Alerts</h2>
                    </div>
                  </div>
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "14px", paddingLeft: "18px" }}>
                    <span style={{ position: "absolute", left: "5px", top: "6px", bottom: "6px", width: "2px", background: "#eef1f6" }} />
                    {__list(v.feed).length ? null : <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>No alerts yet. Rules are checked each time this page opens.</div>}
                    {__list(v.feed).map((fe) => (
                        <div key={fe.id} style={{ position: "relative" }}>
                          <span style={__sx(`position: absolute; left: -18px; top: 4px; width: 12px; height: 12px; border-radius: var(--radius-full); background: ${fe?.c ?? ""}; box-shadow: 0 0 0 3px var(--surface-card);`)} />
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", flexWrap: "wrap" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-heading)" }}>{fe?.t}</span>
                            <__StatusBadge tone={fe.tone}>{fe.stateL}</__StatusBadge>
                          </div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fe?.w} · {fe?.s}</div>
                          {fe.state === 'open' ? (
                            <div style={{ display: "flex", gap: "6px", marginTop: "6px" }}>
                              <button type="button" className="ix-btn ix-btn--sm" onClick={fe.ack}>Mark as seen</button>
                              <__Menu label="Snooze" items={[{ label: 'Snooze for a day', onClick: fe.snoozeDay }, { label: 'Snooze for a week', onClick: fe.snoozeWeek }]} cls="ix-btn ix-btn--sm" />
                            </div>
                          ) : null}
                        </div>
                      ))}
                  </div>
                </section>
              </div>
              <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 className="ta-h2">Build a report</h2>
                  </div>
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                  <span className="ey">Numbers to show · up to 6</span>
                  <div className="ix-chips" style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {__list(v.mets).map((mt, $index) => (<React.Fragment key={$index}>
                        <button type="button" className="ix-chip" onClick={mt?.tog} aria-pressed={mt?.on}>{mt?.l}</button>
                      </React.Fragment>))}
                  </div>
                </div>
                <div className="ra-build" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Split by</span>
                    <select className="inp gc-select" value={v.dim} onChange={v.setDim} aria-label="Split by">
                      <option value="week">Week</option>
                      <option value="day">Day</option>
                      <option value="channel">Channel</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Period</span>
                    <select className="inp gc-select" aria-label="Period" style={{ width: "100%" }} value={v.dim === 'channel' ? v.per : 'split'} onChange={v.setPer} disabled={v.dim !== 'channel'}>
                      {v.dim !== 'channel' ? <option value="split">{v.dim === 'week' ? 'Last 4 weeks' : 'Last 7 days'}</option> : null}
                      <option value="7">Last 7 days</option>
                      <option value="30">Last 30 days</option>
                      <option value="month">This month</option>
                      <option value="90">Last 90 days</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Compare with</span>
                    <select className="inp gc-select" aria-label="Compare" style={{ width: "100%" }} value={v.cmp} onChange={v.setCmp}>
                      <option value="previous">Previous period</option>
                      <option value="year">Same period last year</option>
                      <option value="none">No comparison</option>
                    </select>
                  </label>
                </div>
                <div style={{ border: "1px solid #e7ebf2", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>{v.dimL}</th>
                          {__list(v.cols).map((co, $index) => (<React.Fragment key={$index}>
                              <th className="r"><span style={{ display: "inline-flex", alignItems: "center", gap: "4px" }}>{co?.l}<__InfoTip text={co.how} label="How is this calculated?" /></span></th>
                            </React.Fragment>))}
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.prev).map((pr, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td>
                                <span style={{ fontWeight: "var(--weight-medium)", whiteSpace: "nowrap" }}>{pr?.n}</span>
                              </td>
                              {__list(pr?.v).map((pv, $index) => (<React.Fragment key={$index}>
                                  <td className="r">
                                    <div className="tn" style={{ fontWeight: "var(--weight-medium)" }}>{pv?.t}</div>
                                    <div className="tn" style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${pv?.c ?? ""};`)}>{pv?.d}</div>
                                  </td>
                                </React.Fragment>))}
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="ra-acts" style={{ display: "flex", gap: "10px", justifyContent: "flex-end" }}>
                  <button type="button" className="btn line" onClick={v.xls}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                      <path d="m7 10 5 5 5-5" />
                      <path d="M12 15V3" />
                    </svg>
                    <span>Spreadsheet</span>
                  </button>
                  <button type="button" className="btn line" onClick={v.pdf}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                      <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                      <path d="M10 9H8" />
                      <path d="M16 13H8" />
                      <path d="M16 17H8" />
                    </svg>
                    <span>Branded PDF</span>
                  </button>
                  <button type="button" className="btn solid" onClick={v.saveRep}>Save report</button>
                </div>
              </section>
              </div>
            </div>
          </main>
        </div>
        <__Dialog open={!!v.nr} title="New alert" onClose={v.closeNr}
          footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeNr}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={v.saveNr}>Add alert</button></>}>
          {v.nr ? (
            <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
              <label className="ra-fld"><span className="lbl">Number</span>
                <select className="inp gc-select" value={v.nr.metric} onChange={v.setNr('metric')}>{v.ruleMetrics.map((m) => <option key={m.id} value={m.id}>{m.l}</option>)}</select></label>
              <div className="ra-build" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                <label className="ra-fld"><span className="lbl">When it</span>
                  <select className="inp gc-select" value={v.nr.cond} onChange={v.setNr('cond')}><option value="drop">Drops by (%)</option><option value="below">Goes below</option><option value="above">Goes above</option></select></label>
                <label className="ra-fld"><span className="lbl">{v.nr.cond === 'drop' ? 'Drop (%)' : 'Limit'}</span>
                  <input className="inp" inputMode="decimal" value={v.nr.threshold} onChange={v.setNr('threshold')} /></label>
                <label className="ra-fld"><span className="lbl">Over the last</span>
                  <select className="inp gc-select" value={v.nr.window} onChange={v.setNr('window')}><option value="day">Day</option><option value="week">Week</option></select></label>
                <label className="ra-fld"><span className="lbl">Importance</span>
                  <select className="inp gc-select" value={v.nr.severity} onChange={v.setNr('severity')}><option value="high">High</option><option value="medium">Medium</option><option value="low">Low</option></select></label>
              </div>
              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Percent limits are in %, like 15 for 15%. After an alert, the rule stays quiet for a day.</div>
            </div>
          ) : null}
        </__Dialog>
      </div>
    );
  }
}
