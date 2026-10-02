'use client';
// Generated from design/templates/tracking-analytics/ReportsAlerts.dc.html by scripts/convert-design.mjs.
// Reports & alerts — alert rules on the numbers that matter and a report builder, laid out like a Shopify report: the
// title row (back to Reports), the key figures, the alert rules beside this week's alerts, then Build a report. Reports
// sent on a schedule live on the Scheduled reports page.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { InfoTip as __InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function pct(n) { return (Math.round(n * 10) / 10) + '%'; }
function x2(n) { return (Math.round(n * 100) / 100).toFixed(2) + '×'; }
// 30-day figures per platform: spend, platform-claimed revenue, claimed purchases, GC placed, confirmed, delivered, delivered revenue, returned, new customers, clicks, impressions
var PF = { meta: [124500, 940000, 1190, 952, 790, 676, 672000, 64, 410, 38400, 1920000], google: [38200, 310000, 360, 318, 272, 238, 248000, 18, 142, 9100, 212000], tiktok: [22300, 185000, 240, 150, 118, 98, 96000, 14, 71, 11800, 1340000] };
var COST = { courier: 70, ret: 120, pack: 15 };
function agg(keys) { var t = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]; keys.forEach(function (k) { PF[k].forEach(function (x, i) { t[i] += x; }); }); return t; }
function netRev(a) { return a[6] - a[5] * COST.courier - a[7] * COST.ret - a[4] * COST.pack; }
var PC = { meta: '#2563eb', google: '#059669', tiktok: '#db2777' };
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }
function delta(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { up: up, ok: ok, dir: (up ? 'Up ' : 'Down ') + Math.abs(p) + '%' + (ok ? ', good' : ', worse'), d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', df: ok ? 'var(--text-success)' : 'var(--text-danger)' }; }
function tile(l, v, s, c, vals, dp, good) { var dl = delta(dp, good); return { l: l, v: v, s: s, c: c, vals: vals.map(function (x) { return Math.round(x * 100) / 100; }), d: dl.d, up: dl.up, ok: dl.ok, dir: dl.dir, db: dl.db, df: dl.df }; }
var MET = [['sp', 'Spend'], ['rev', 'Delivered revenue'], ['roas', 'Real return'], ['cpd', 'Cost / delivered'], ['ord', 'Orders placed'], ['conf', 'Confirmed'], ['del', 'Delivered'], ['ret', 'Return rate'], ['new', 'New customers'], ['clk', 'Clicks']];
var DIM = { platform: ['Platform', [['Meta', 'meta'], ['Google', 'google'], ['TikTok', 'tiktok']]], city: ['City', [['Dhaka', .58], ['Chattogram', .14], ['Sylhet', .07]]], week: ['Week', [['1 – 7 Sep', .22], ['8 – 14 Sep', .25], ['15 – 19 Sep', .18]]] };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var on = s.on || {}, mets = s.mets || ['sp', 'rev', 'roas', 'ret'], dim = DIM[s.dim] ? s.dim : 'platform';
    var R = [['sp', 'Daily spend limit crossed', 'Meta over ৳4,000 a day', 'today 9:12 AM', true], ['roas', 'Real return dropped', 'Below 3.0× for 2 days', '11 Sep', true], ['dis', 'Ad account disabled', 'Any platform', 'never', true], ['rej', 'Ad rejected', 'Any campaign', '18 Sep', true], ['px', 'Pixel stopped', 'No purchase event for 2 hours in shop hours', '17 Sep', true], ['tr', 'Traffic drop', 'Sessions 40% below the same day last week', '2 Sep', false]];
    var calc = function (k, a) { var n = netRev(a); return { sp: bdt(a[0]), rev: bdt(a[6]), roas: x2(n / a[0]), cpd: bdt(a[0] / a[5]), ord: a[3], conf: a[4], del: a[5], ret: pct(a[7] / a[5] * 100), 'new': a[8], clk: a[9].toLocaleString('en-IN') }[k]; };
    var all = agg(['meta', 'google', 'tiktok']);
    var SEV = { sp: '#f59e0b', roas: '#e11d48', dis: '#e11d48', rej: '#f59e0b', px: '#e11d48', tr: '#7c3aed' };
    var FIRED = { sp: 'Fired today', roas: '11 Sep', dis: 'Never', rej: '18 Sep', px: '17 Sep', tr: '2 Sep' };
    var v = {
      tiles: [tile('Alerts on', String(R.filter(function (r) { return on[r[0]] != null ? on[r[0]] : r[4]; }).length) + ' of 6', 'rules watching', '#34d399', series(14, 5, .4, 2), 0), tile('Fired this week', '4', 'all handled', '#fbbf24', series(14, 1, .8, 4), 33, 'down'), tile('Reports scheduled', '3', 'next: tomorrow 9:00 AM', '#60a5fa', series(14, 3, .2, 6), 0), tile('Reports opened', '92%', 'last 30 days', '#a78bfa', series(14, 88, 4, 8, .2), 6)],
      rules: R.map(function (r, k) { var o = on[r[0]] != null ? on[r[0]] : r[4]; var sp = sparkP(series(14, 50, 14, k * 3 + 1, k % 2 ? .4 : -.4)); var fired = FIRED[r[0]]; var today = fired === 'Fired today'; return { t: r[1], s: r[2], fired: fired, fb: today ? '#fff4e0' : '#f1f4f9', ff: today ? '#a14f06' : '#64748b', sev: o ? SEV[r[0]] : '#cbd5e1', line: sp.line, area: sp.area, on: o, cls: o ? 'sw on' : 'sw', tog: function () { var n = assign({}, on); n[r[0]] = !o; self.setState({ on: n }); toast(self, o ? r[1] + ' turned off.' : r[1] + ' is watching again.'); } }; }),
      feed: [['Meta spend passed ৳4,000', 'Today 9:12 AM', 'WhatsApp to owner', '#f59e0b'], ['Ad rejected · TikTok Shop live Friday', '18 Sep, 3:40 PM', 'fixed and resubmitted', '#f59e0b'], ['Wishlist event stopped on Meta', '17 Sep, 4:12 PM', 'fixed next morning', '#e11d48'], ['Weekly marketing report sent', '15 Sep, 10:00 AM', 'opened by 2 of 2', '#10b981'], ['Real return below 3.0×', '11 Sep', 'recovered on 13 Sep', '#e11d48']].map(function (f) { return { t: f[0], w: f[1], s: f[2], c: f[3] }; }),
      addRule: function () { toast(self, 'Pick a number, a limit and who to tell.'); },
      mets: MET.map(function (m) { var o = mets.indexOf(m[0]) >= 0; return { l: m[1], on: o, bd: o ? '#0b1733' : '#e2e8f0', bg: o ? '#0b1733' : '#fff', fg: o ? '#fff' : '#334155', tog: function () { var n = o ? mets.filter(function (x) { return x !== m[0]; }) : mets.concat([m[0]]); if (n.length) self.setState({ mets: n.slice(-6) }); } }; }),
      dim: dim, setDim: function (e) { self.setState({ dim: e.target.value }); }, dimL: DIM[dim][0],
      cols: mets.map(function (k) { return { l: MET.filter(function (m) { return m[0] === k; })[0][1] }; }),
      prev: DIM[dim][1].map(function (r, i) { var a = dim === 'platform' ? PF[r[1]] : all.map(function (x) { return Math.round(x * r[1]); }); return { lg: dim === 'platform' ? LOGO[r[1]] : '', hasLg: dim === 'platform', noLg: dim !== 'platform', n: r[0], c: dim === 'platform' ? PC[r[1]] : ['#1e3a8a', '#2563eb', '#93c5fd'][i], v: mets.map(function (k, j) { var up = (i + j) % 3 !== 1; return { t: calc(k, a), d: (up ? '▲ ' : '▼ ') + (3 + (i * 7 + j * 5) % 14) + '%', c: up ? '#047857' : '#be123c' }; }) }; }),
      xls: function () { toast(self, 'Spreadsheet downloaded.'); }, pdf: function () { toast(self, 'PDF with your logo is ready.'); }, saveRep: function () { toast(self, 'Report saved — schedule it from Scheduled reports.'); }
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
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, spark: t.vals, href: t.l === 'Reports scheduled' ? '/scheduled-reports' : undefined, sub: <span className="dl" title={t.s} style={{ background: t.db, color: t.df }}>{t.d}</span> }))} />
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
                              <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{ru?.t}</span>
                              <span className="dl" style={__sx(`background: ${ru?.fb ?? ""}; color: ${ru?.ff ?? ""};`)}>{ru?.fired}</span>
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
                      <h2 className="ta-h2">This week</h2>
                    </div>
                  </div>
                  <div style={{ position: "relative", display: "flex", flexDirection: "column", gap: "14px", paddingLeft: "18px" }}>
                    <span style={{ position: "absolute", left: "5px", top: "6px", bottom: "6px", width: "2px", background: "#eef1f6" }} />
                    {__list(v.feed).map((fe, $index) => (<React.Fragment key={$index}>
                        <div style={{ position: "relative" }}>
                          <span style={__sx(`position: absolute; left: -18px; top: 4px; width: 12px; height: 12px; border-radius: var(--radius-full); background: ${fe?.c ?? ""}; box-shadow: 0 0 0 3px #fff;`)} />
                          <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{fe?.t}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fe?.w} · {fe?.s}</div>
                        </div>
                      </React.Fragment>))}
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
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                    {__list(v.mets).map((mt, $index) => (<React.Fragment key={$index}>
                        <button type="button" onClick={mt?.tog} aria-pressed={mt?.on} style={__sx(`height: 34px; padding: 0 13px; border-radius: var(--radius-full); border: 1px solid ${mt?.bd ?? ""}; background: ${mt?.bg ?? ""}; color: ${mt?.fg ?? ""}; font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; transition: transform 160ms cubic-bezier(.23,1,.32,1), background-color 150ms ease;`)}>{mt?.l}</button>
                      </React.Fragment>))}
                  </div>
                </div>
                <div className="ra-build" style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "12px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Split by</span>
                    <select className="inp gc-select" value={v.dim} onChange={v.setDim} aria-label="Split by">
                      <option value="platform">Platform</option>
                      <option value="city">City</option>
                      <option value="week">Week</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Period</span>
                    <select className="inp gc-select" aria-label="Period" style={{ width: "100%" }}>
                      <option>Last 30 days</option>
                      <option>This month</option>
                      <option>Last 90 days</option>
                      <option>Custom</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Compare with</span>
                    <select className="inp gc-select" aria-label="Compare" style={{ width: "100%" }}>
                      <option>Previous period</option>
                      <option>Same period last year</option>
                      <option>No comparison</option>
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
                              <th className="r">{co?.l}</th>
                            </React.Fragment>))}
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.prev).map((pr, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td>
                                <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                                  {pr?.hasLg ? (<>
                                    <img src={pr?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                                  </>) : null}
                                  {pr?.noLg ? (<>
                                    <span style={__sx(`width: 8px; height: 8px; border-radius: var(--radius-full); background: ${pr?.c ?? ""};`)} />
                                  </>) : null}
                                  <span style={{ fontWeight: "var(--weight-medium)" }}>{pr?.n}</span>
                                </div>
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
      </div>
    );
  }
}
