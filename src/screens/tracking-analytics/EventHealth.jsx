'use client';
// Generated from design/templates/tracking-analytics/EventHealth.dc.html by scripts/convert-design.mjs.
// Event health — whether the order events reach the ad platforms once and complete, laid out the Shopify way: the title
// row, four key figures, the views (health, consent and privacy, what was sent where), then the issues to fix and the
// cards of the chosen view. The Health view starts with the shop's own event intake (EventIntakeCard, lib/events.js):
// one event shape, duplicates dropped by event ID, counts of received / de-duplicated / rejected.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { ShopHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';
import { clockNow } from '@/lib/settlements';
import __EventIntakeCard from './EventIntakeCard';
import { eventHealth, syncDemoEvents } from '@/lib/events';

// ---- logic (from the design's <script type="text/x-dc">) ----

var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
var PL = { meta: ['Meta', '#e7efff', '#1d4ed8'], google: ['Google', '#e7f8f1', '#047857'], tiktok: ['TikTok', '#f1f5f9', '#0f172a'], gc: ['GridCommerce', '#fff4e0', '#a14f06'] };
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function plv(k) { var p = PL[k]; return { pl: p[0], pb: p[1], pf: p[2], lg: LOGO[k] || '' }; }
// 30-day figures per platform: spend, platform-claimed revenue, claimed purchases, GC placed, confirmed, delivered, delivered revenue, returned, new customers, clicks, impressions
var PC = { meta: '#2563eb', google: '#059669', tiktok: '#db2777' };
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }
function lseg(self, opts, cur, key) { return opts.map(function (o) { return { l: o[1], on: o[0] === cur, pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
var FEED = [['10:42:18', 'Purchase', 'meta', 1, 1, 'ev_GC-24817_pur', 'dedup'], ['10:42:18', 'Purchase', 'google', 1, 1, 'GC-24817', 'ok'], ['10:41:55', 'Order delivered', 'meta', 0, 1, 'ev_GC-24790_del', 'ok'], ['10:41:55', 'Order delivered', 'tiktok', 0, 1, 'ev_GC-24790_del', 'ok'], ['10:41:30', 'Add to cart', 'tiktok', 1, 1, 'ev_c8f2_atc', 'dedup'], ['10:41:12', 'Checkout started', 'meta', 1, 0, 'ev_c8e1_ic', 'browser'], ['10:40:47', 'View content', 'google', 1, 1, 'ev_c8d0_vc', 'ok'], ['10:40:20', 'Order returned', 'meta', 0, 1, 'ev_GC-24611_ret', 'ok'], ['10:39:58', 'Contact', 'meta', 1, 1, 'ev_c8b7_wa', 'dedup'], ['10:39:31', 'Purchase', 'tiktok', 1, 1, 'ev_GC-24816_pur', 'missing']];
var FS = { ok: ['Received', 'var(--fill-success-soft)', 'var(--text-success)'], dedup: ['Counted once', 'var(--fill-info-soft)', 'var(--text-info)'], browser: ['Browser only', 'var(--fill-warning-soft)', 'var(--text-warning)'], missing: ['Missing phone', 'var(--fill-error-soft)', 'var(--text-danger)'] };
var MODES = { opt: ['Ask first', 'Nothing is tracked until the shopper says yes. Safest; fewer events.'], notice: ['Notice only', 'A small note; tracking starts right away. Most shops in Bangladesh use this.'], off: ['No banner', 'Only use this if you do not run ads.'] };
class Component extends DCLogic {
  componentDidMount() { try { syncDemoEvents(); var now = Date.now(); this.setState({ ev: eventHealth({ from: now - 7 * 864e5, to: now + 1 }), evToday: eventHealth({ from: new Date(new Date(now).setHours(0, 0, 0, 0)).getTime(), to: now + 1 }) }); } catch (e) { /* ignore */ } }
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'health', ff = s.ff || 'all', mode = s.mode || 'notice', share = s.share || {}, fixed = s.fixed || {};
    // demo dates follow today (the token runs out in 6 days; the wishlist event went quiet 2 days ago)
    var dayAt = function (n) { var d = new Date(clockNow() + n * 864e5); return d.getDate() + ' ' + MONTHS[d.getMonth()]; };
    var A = [['tok', 'TikTok token expires in 6 days', 'Events will stop on ' + dayAt(6) + ' if it is not renewed.', 'Reconnect', '#fff4e0', '#7a3b04'], ['stop', '“Add to wishlist” stopped firing on Meta', 'Nothing since ' + dayAt(-2) + ', 4:12 PM — the heart button may have changed.', 'Check', '#ffece6', '#9f1239'], ['dup', 'Double counting risk on Google', '14% of purchases arrive twice without the same event ID.', 'Fix', '#fff4e0', '#7a3b04']];
    var srv = series(24, 330, 70, 2, .1), brw = srv.map(function (x, i) { return x * (.72 + .06 * Math.sin(i)); }); var mxv = Math.max.apply(null, srv) * 1.15; var sl = curve(pts(srv, 900, 160, mxv, 0, 15, 2));
    var nOpen = A.filter(function (a) { return !fixed[a[0]]; }).length;
    var v = {
      headline: nOpen ? nOpen + ' issues need a look · 95% of events counted once' : 'All events healthy · 97% counted once',
      tiles: [
        { l: 'Events today', v: s.evToday ? s.evToday.received.toLocaleString('en-IN') : '—', s: s.evToday ? s.evToday.accepted.toLocaleString('en-IN') + ' accepted' : '', vals: s.ev ? s.ev.days.map(function (d) { return d.received; }) : undefined },
        { l: 'Average match', v: '8.2 / 10', s: 'Meta 9.1 · Google 8.4 · TikTok 7.2' },
        { l: 'Duplicates dropped', v: s.ev ? Math.round(s.ev.dedupRate * 100) + '%' : '—', s: s.ev ? s.ev.deduped.toLocaleString('en-IN') + ' in 7 days' : '' },
        { l: 'Open issues', v: String(nOpen), s: 'alerts to fix' },
      ],
      srvLine: sl, srvArea: sl + ' L900 160 L0 160 Z', brwLine: curve(pts(brw, 900, 160, mxv, 0, 15, 2)),
      tabs: pTabs(self, [{ k: 'health', label: 'Health' }, { k: 'priv', label: 'Consent & privacy' }, { k: 'log', label: 'What was sent where' }], tab, 'tab', { health: A.filter(function (a) { return !fixed[a[0]]; }).length }),
      is_health: tab === 'health', is_priv: tab === 'priv', is_log: tab === 'log',
      alerts: A.filter(function (a) { return !fixed[a[0]]; }).map(function (a) { return { t: a[1], s: a[2], btn: a[3], b: a[4], f: a[5], bd: a[5] === '#9f1239' ? '#fecdd3' : '#fde7c4', go: function () { var n = assign({}, fixed); n[a[0]] = 1; self.setState({ fixed: n }); toast(self, a[0] === 'tok' ? 'TikTok reconnected — token valid for 60 days.' : a[0] === 'stop' ? 'Wishlist event re-linked to the new heart button.' : 'Google now uses the order number as event ID.'); } }; }),
      scores: [['meta', 9.1, 'Great', '96%', '3,420', 'Phone, email, city and click ID sent'], ['google', 8.4, 'Good', fixed.dup ? '99%' : '86%', '2,980', 'Enhanced Conversions on'], ['tiktok', 7.2, 'OK', '91%', '1,610', 'Add email at checkout to raise it']].map(function (x) { var gc = x[1] >= 8 ? 'var(--fill-success)' : 'var(--fill-warning)'; var C = 2 * Math.PI * 42; return assign(plv(x[0]), { q: x[1], ql: x[2], c: PC[x[0]], gc: gc, da: (C * x[1] / 10).toFixed(1) + ' ' + C.toFixed(1), dd: x[3], dc: parseInt(x[3]) < 90 ? 'var(--text-warning)' : 'var(--text-success)', di: parseInt(x[3]) < 90 ? 'triangle-alert' : 'check', dl: parseInt(x[3]) < 90 ? 'below target' : 'on target', sent: x[4], tip: x[5] }); }),
      fOpts: lseg(self, [['all', 'All'], ['meta', 'Meta'], ['google', 'Google'], ['tiktok', 'TikTok']], ff, 'ff'),
      feed: FEED.filter(function (f) { return ff === 'all' || f[2] === ff; }).map(function (f) { var st = FS[f[6]]; return assign(plv(f[2]), { c: PC[f[2]], t: f[0], e: f[1], b: f[3] ? 'check' : 'minus', bl: f[3] ? 'Sent from the browser' : 'Not a browser event', bb: f[3] ? 'var(--fill-success-soft)' : 'var(--slate-100)', bc: f[3] ? 'var(--text-success)' : 'var(--text-muted)', s: f[4] ? 'check' : 'x', sl: f[4] ? 'Sent from the server' : 'Not sent from the server', sb2: f[4] ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', sc: f[4] ? 'var(--text-success)' : 'var(--text-danger)', pi: { ok: 'check', dedup: 'copy-check', browser: 'triangle-alert', missing: 'triangle-alert' }[f[6]], id: f[5], pt: st[0], pb: st[1], pf: st[2] }); }),
      miss: [['Purchase to TikTok · 38 today', 'No phone number — guest checkout skipped it'], ['View content to Google · 4%', 'Missing item price on 6 products'], ['Delivered to Meta · 2 orders', 'Order is older than 7 days — sent as offline event']].map(function (m) { return { t: m[0], s: m[1] }; }),
      queues: [['Delivery events', 'Wait for courier status', '184', '#0f172a'], ['Retry queue', 'Platform did not answer', '3', 'var(--text-warning)'], ['Offline events', 'Late deliveries, sent tonight', '12', '#0f172a']].map(function (q) { return { l: q[0], s: q[1], n: q[2], c: q[3] }; }),
      retry: function () { toast(self, '3 events sent again — all received.'); },
      modes: lseg(self, [['opt', 'Ask first'], ['notice', 'Notice only'], ['off', 'No banner']], mode, 'mode'), modeHelp: MODES[mode][1],
      bText: mode === 'opt' ? 'We use cookies to show you relevant offers and measure our ads. Choose what you allow.' : 'We use cookies to improve the shop and measure our ads. By browsing you agree.', bReject: mode === 'opt',
      gcm: mkSw(this, 'gcm', true), bn: mkSw(this, 'bn', true),
      sharing: [['meta', 'Pixel, Conversions API and catalogue'], ['google', 'Analytics 4, Ads conversions, Merchant Center'], ['tiktok', 'Pixel and Events API']].map(function (x) { var on = share[x[0]] !== false; return assign(plv(x[0]), { s: x[1], aria: 'Share data with ' + PL[x[0]][0], on: on, cls: on ? 'sw on' : 'sw', tog: function () { var n = assign({}, share); n[x[0]] = !on; self.setState({ share: n }); toast(self, on ? 'Nothing goes to ' + PL[x[0]][0] + ' now.' : 'Sharing with ' + PL[x[0]][0] + ' again.', on); } }); }),
      logs: [['10:42:18', 'GC-24817', 'Purchase', 'meta', 'ph: 5e88…a91c · em: 0b4f…77e2 · ct: dhaka', 'Received'], ['10:41:55', 'GC-24790', 'Delivered', 'meta', 'ph: 91c2…04ab · fbc: fb.1.17…', 'Received'], ['10:41:55', 'GC-24790', 'Delivered', 'google', 'ph: 91c2…04ab · gclid: Cj0K…', 'Received'], ['10:40:20', 'GC-24611', 'Returned', 'tiktok', 'ph: 7da1…c3f0 · ttclid: E.C.P…', 'Received'], ['10:39:31', 'GC-24816', 'Purchase', 'tiktok', 'em: — · ph: —', 'Low match'], ['10:31:02', 'GC-24812', 'Confirmed', 'meta', 'ph: 44b0…e11d', 'Retry 1 · received']].map(function (l) { return assign(plv(l[3]), { pc: PC[l[3]], t: l[0], o: l[1], e: l[2], d: l[4], r: l[5], ri: l[5] === 'Received' ? 'check' : 'triangle-alert', c: l[5] === 'Received' ? 'var(--text-success)' : 'var(--text-warning)' }); }),
      csv: function () { toast(self, 'Log for the last 30 days downloaded.'); }
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
@media (max-width:640px){
  /* chart head: the legend gets its own row under the title */
  .eh-bvs{flex-wrap:wrap;row-gap:8px!important}
  .eh-bvs>div:last-child{flex:1 1 100%;flex-wrap:wrap;row-gap:4px}
  .eh-live{flex-wrap:wrap;row-gap:10px!important}
  .eh-live>.lseg{flex:1 1 100%;overflow-x:auto;scrollbar-width:none}
  .eh-live>.lseg::-webkit-scrollbar{display:none}
  .eh-live>.lseg button{flex:none;white-space:nowrap}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class EventHealthScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="EventHealth">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="ta-health" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page={"Event health & privacy"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <ShopHeader icon="activity" title="Event health"
                about="Whether every order event reaches Meta, Google and TikTok once and with enough detail: issues to fix, match quality, browser against server events, live events, cookie consent and privacy, and a log of what was sent where."
                secondary={[{ label: 'Pixels & events', href: '/pixels-events' }]}
                more={[{ label: 'Setup guides', href: '/setup-guide' }]} />
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, spark: t.vals, sub: t.s }))} />
              <section className="ix-card" aria-label="Views">
                <div className="ix-bar"><IndexTabs label="Event health views" tabs={__list(v.tabs).map((tb) => ({ key: tb.label, label: tb.label, count: tb.hasCount ? tb.count : null, on: tb.on, onClick: tb.pick }))} /></div>
              </section>
              {v.is_health ? (<>
                <__EventIntakeCard />
                <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                  <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "12px" }}>
                    {__list(v.alerts).map((al, $index) => (<React.Fragment key={$index}>
                        <div className="tc" style={{ display: "flex", alignItems: "flex-start", gap: "10px", padding: "12px 16px" }}>
                          <span style={__sx(`display: flex; flex-shrink: 0; margin-top: 2px; color: ${al?.f ?? ""};`)}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                              <path d="M12 9v4" />
                              <path d="M12 17h.01" />
                            </svg>
                          </span>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontWeight: "var(--weight-medium)", fontSize: "var(--text-sm)", color: "#0f172a" }}>{al?.t}</div>
                            <div suppressHydrationWarning style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "2px" }}>{al?.s}</div>
                          </div>
                          <button type="button" className="btn sm" onClick={al?.go}>{al?.btn}</button>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                    {__list(v.scores).map((sc, $index) => (<React.Fragment key={$index}>
                        <section className="tc" style={{ padding: "16px", display: "flex", gap: "18px", alignItems: "center" }}>
                          <div style={{ position: "relative", width: "104px", height: "104px", flexShrink: "0" }}>
                            <svg width="104" height="104" viewBox="0 0 104 104" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
                              <circle cx="52" cy="52" r="42" fill="none" stroke="#eef1f6" strokeWidth="9" />
                              <circle cx="52" cy="52" r="42" fill="none" strokeWidth="9" strokeLinecap="round" strokeDasharray={sc?.da} style={{ stroke: sc?.gc }} />
                            </svg>
                            <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                              <span className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{sc?.q}</span>
                              <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", }}>{sc?.ql}</span>
                            </div>
                          </div>
                          <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <img src={sc?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                              <span style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{sc?.pl}</span>
                            </div>
                            <div>
                              <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)", marginBottom: "4px" }}>
                                <span>Counted once</span>
                                <b className="tn" title={`Counted once: ${sc?.dl ?? ""}`} style={__sx(`display: inline-flex; align-items: center; gap: 4px; font-weight: var(--weight-semibold); color: ${sc?.dc ?? ""};`)}><__Icon name={sc?.di} width="12" height="12" aria-hidden="true" />{sc?.dd}<span className="sr-only"> ({sc?.dl})</span></b>
                              </div>
                              <div style={{ height: "6px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                <div style={__sx(`width: ${sc?.dd ?? ""}; height: 100%; background: ${sc?.dc ?? ""};`)} />
                              </div>
                            </div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}><b className="tn" style={{ color: "#0f172a" }}>{sc?.sent}</b> sent today</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "16px" }}>{sc?.tip}</div>
                          </div>
                        </section>
                      </React.Fragment>))}
                  </div>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div className="eh-bvs" style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Browser vs server · last 24 hours</h2>
                      </div>
                      <div style={{ display: "flex", gap: "14px", fontSize: "var(--text-xs)", color: "#475569" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span aria-hidden="true" style={{ width: "18px", height: "3px", borderRadius: "3px", background: "#2563eb" }} />Server (solid)</span>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span aria-hidden="true" style={{ width: "18px", borderTop: "2px dashed #b45309" }} />Browser (dashed)</span>
                      </div>
                    </div>
                    <div style={{ position: "relative" }}>
                      <svg width="100%" height="160" viewBox="0 0 900 160" preserveAspectRatio="none" role="img" aria-label="Events over the last 24 hours: server (solid line) stays above browser (dashed line)" style={{ display: "block" }}>
                        <defs>
                          <linearGradient id="taSrv" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#2563eb" stopOpacity=".22" />
                            <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                          </linearGradient>
                        </defs>
                        <line x1="0" x2="900" y1="15" y2="15" stroke="#eef1f6" />
                        <line x1="0" x2="900" y1="65" y2="65" stroke="#eef1f6" />
                        <line x1="0" x2="900" y1="115" y2="115" stroke="#eef1f6" />
                        <line x1="0" x2="900" y1="158" y2="158" stroke="#eef1f6" />
                        <path d={v.srvArea} fill="url(#taSrv)" />
                        <path d={v.srvLine} fill="none" stroke="#2563eb" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
                        <path d={v.brwLine} fill="none" stroke="#b45309" strokeWidth="1.8" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                      </svg>
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      <span>11:00 AM</span>
                      <span>5:00 PM</span>
                      <span>11:00 PM</span>
                      <span>5:00 AM</span>
                      <span>now</span>
                    </div>
                  </section>
                  <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                    <section className="tc" style={{ overflow: "hidden", flexGrow: "1", minWidth: "0" }}>
                      <div className="eh-live" style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid #eef1f6" }}>
                        <span className="pulse" role="img" aria-label="Live" title="Live" style={{ width: "9px", height: "9px", borderRadius: "var(--radius-full)", background: "var(--fill-success)", boxShadow: "0 0 0 4px var(--fill-success-soft)" }} />
                        <h2 className="ta-h2" style={{ flexGrow: "1" }}>Live events</h2>
                        <div className="lseg" role="group" aria-label="Filter live events by platform">
                          {__list(v.fOpts).map((fo, $index) => (<React.Fragment key={$index}>
                              <button type="button" onClick={fo?.pick} aria-pressed={fo?.on}>{fo?.l}</button>
                            </React.Fragment>))}
                        </div>
                      </div>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Time</th>
                              <th>Event</th>
                              <th>Platform</th>
                              <th>Browser</th>
                              <th>Server</th>
                              <th>Event ID</th>
                              <th>Status</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.feed).map((fd, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  <td className="tn" style={{ color: "var(--text-muted)", fontSize: "var(--text-xs-plus)" }}>{fd?.t}</td>
                                  <td style={{ fontWeight: "var(--weight-medium)" }}>{fd?.e}</td>
                                  <td>
                                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><img src={fd?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />{fd?.pl}</span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={__sx(`display: inline-flex; width: 22px; height: 22px; border-radius: var(--radius-full); align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${fd?.bb ?? ""}; color: ${fd?.bc ?? ""};`)}><__Icon name={fd?.b} width="14" height="14" role="img" aria-label={fd?.bl} /></span>
                                  </td>
                                  <td style={{ textAlign: "center" }}>
                                    <span style={__sx(`display: inline-flex; width: 22px; height: 22px; border-radius: var(--radius-full); align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${fd?.sb2 ?? ""}; color: ${fd?.sc ?? ""};`)}><__Icon name={fd?.s} width="14" height="14" role="img" aria-label={fd?.sl} /></span>
                                  </td>
                                  <td className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{fd?.id}</td>
                                  <td>
                                    <span className="dl" style={__sx(`background: ${fd?.pb ?? ""}; color: ${fd?.pf ?? ""};`)}><__Icon name={fd?.pi} width="12" height="12" aria-hidden="true" />{fd?.pt}</span>
                                  </td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <div className="gc-side" style={{ width: "360px", flexShrink: "0", display: "flex", flexDirection: "column", gap: "18px" }}>
                      <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <h2 className="ta-h2">Missing details</h2>
                          </div>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                          {__list(v.miss).map((ms, $index) => (<React.Fragment key={$index}>
                              <div style={{ padding: "10px 12px", borderRadius: "var(--radius-lg)", border: "1px solid #fde7c4", background: "#fffaf0" }}>
                                <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{ms?.t}</div>
                                <div style={{ fontSize: "var(--text-xs-plus)", color: "#7a3b04" }}>{ms?.s}</div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                      <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                        <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <h2 className="ta-h2">Waiting to send</h2>
                          </div>
                          <button type="button" className="abtn" onClick={v.retry}>Retry now</button>
                        </div>
                        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                          {__list(v.queues).map((qu, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ flexGrow: "1" }}>
                                  <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{qu?.l}</div>
                                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{qu?.s}</div>
                                </div>
                                <span className="num" style={__sx(`font-size: var(--text-lg); font-weight: var(--weight-semibold); color: ${qu?.c ?? ""};`)}>{qu?.n}</span>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </section>
                    </div>
                  </div>
                </div>
              </>) : null}
              {v.is_priv ? (<>
                <div style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.2fr) minmax(0, 1fr)", gap: "18px", alignItems: "start" }}>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Cookie consent</h2>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl" id="eh-mode">Banner mode</span>
                      <div className="lseg" role="group" aria-labelledby="eh-mode">
                        {__list(v.modes).map((mo, $index) => (<React.Fragment key={$index}>
                            <button type="button" onClick={mo?.pick} aria-pressed={mo?.on}>{mo?.l}</button>
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.modeHelp}</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Google consent mode</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Google still gets anonymous signals when someone says no</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.gcm?.on} aria-label="Google consent mode" className={v.gcm?.cls} onClick={v.gcm?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Show the banner in Bangla too</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>Follows the shopper’s language</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.bn?.on} aria-label="Show the banner in Bangla too" className={v.bn?.cls} onClick={v.bn?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Remember the choice for</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Asked again after</div>
                      </div>
                      <select className="inp" aria-label="Remember" style={{ width: "170px" }}>
                        <option>6 months</option>
                        <option>12 months</option>
                        <option>3 months</option>
                      </select>
                    </div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Preview</h2>
                      </div>
                    </div>
                    <div style={{ borderRadius: "var(--radius-xl)", background: "#e9eef5", padding: "16px", display: "flex", flexDirection: "column", justifyContent: "flex-end", minHeight: "300px" }}>
                      <div style={{ background: "#fff", borderRadius: "var(--radius-xl)", boxShadow: "0 10px 30px -10px rgba(15,23,42,.35)", padding: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
                        <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)" }}>We use cookies</div>
                        <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569", lineHeight: "18px" }}>{v.bText}</div>
                        <div style={{ display: "flex", gap: "8px" }}>
                          <span style={{ flex: "1", height: "var(--control-height)", borderRadius: "var(--radius-lg)", background: "#003087", color: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>Accept all</span>
                          {v.bReject ? (<>
                            <span style={{ flex: "1", height: "var(--control-height)", borderRadius: "var(--radius-lg)", border: "1px solid #cbd5e1", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", display: "flex", alignItems: "center", justifyContent: "center" }}>Only needed</span>
                          </>) : null}
                          <span style={{ height: "var(--control-height)", padding: "0 10px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#003087", display: "flex", alignItems: "center" }}>Settings</span>
                        </div>
                      </div>
                    </div>
                  </section>
                  <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                    <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                      <div style={{ flexGrow: "1", minWidth: "0" }}>
                        <h2 className="ta-h2">Data sharing per platform</h2>
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column" }}>
                      {__list(v.sharing).map((sh, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 0", borderBottom: "1px solid #eef2f6" }}>
                            <span style={{ display: "inline-flex", alignItems: "center", gap: "7px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a", whiteSpace: "nowrap" }}><img src={sh?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />{sh?.pl}</span>
                            <span style={{ flexGrow: "1", fontSize: "var(--text-xs-plus)", color: "#475569" }}>{sh?.s}</span>
                            <button type="button" role="switch" aria-checked={sh?.on} aria-label={sh?.aria} className={sh?.cls} onClick={sh?.tog} />
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                </div>
              </>) : null}
              {v.is_log ? (<>
                <section className="tc" style={{ overflow: "hidden" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #eef2f6", display: "flex", alignItems: "center" }}>
                    <span style={{ flexGrow: "1", fontSize: "var(--text-sm)", color: "#475569" }}>Customer details are shown hashed.</span>
                    <button type="button" className="abtn" onClick={v.csv}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
  <path d="m7 10 5 5 5-5" />
  <path d="M12 15V3" />
</svg>CSV</button>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Sent</th>
                          <th>Order</th>
                          <th>Event</th>
                          <th>Platform</th>
                          <th>Data sent (hashed)</th>
                          <th>Result</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.logs).map((lg, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td className="tn" style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{lg?.t}</td>
                              <td className="mono" style={{ fontWeight: "var(--weight-medium)" }}>{lg?.o}</td>
                              <td>{lg?.e}</td>
                              <td>
                                <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}><img src={lg?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />{lg?.pl}</span>
                              </td>
                              <td className="mono" style={{ fontSize: "var(--text-xs)", color: "#475569" }}>{lg?.d}</td>
                              <td style={__sx(`color: ${lg?.c ?? ""}; font-weight: var(--weight-medium); font-size: var(--text-xs-plus);`)}><span style={{ display: "inline-flex", alignItems: "center", gap: "5px" }}><__Icon name={lg?.ri} width="14" height="14" aria-hidden="true" />{lg?.r}</span></td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </section>
              </>) : null}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
