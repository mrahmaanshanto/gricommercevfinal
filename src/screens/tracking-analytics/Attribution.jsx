'use client';
// Generated from design/templates/tracking-analytics/Attribution.dc.html by scripts/convert-design.mjs.
// Attribution & UTM — how sales receive marketing credit, laid out like a Shopify report: the title row (back to
// Reports), the attribution model and window (lib/attribution.js: first click, last click, last non-direct, linear,
// position-based, each with a version; the raw touches of every order are kept and the model is applied on read), key
// figures from the orders' journeys, first click against the chosen model, "how did you hear", creator codes and the UTM
// link builder. A real delivered order's journey (raw UTM values and the cleaned source) is folded under its own heading.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { InfoTip as __InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';
import { MODELS, WINDOWS, modelBy, getSetting, setSetting, creditTable, touchesOf, creditOf, onlineOrders, channelBy, modelLabel } from '@/lib/attribution';
import { logChanges, whoNow } from '@/lib/settingsHistory';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function x2(n) { return (Math.round(n * 100) / 100).toFixed(2) + '×'; }
// 30-day figures per platform: spend, platform-claimed revenue, claimed purchases, GC placed, confirmed, delivered, delivered revenue, returned, new customers, clicks, impressions
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }
var DAY = 864e5;
var CH_LOGO = { meta_ads: 'meta', social: 'meta', google_ads: 'google', google_search: 'google', tiktok_ads: 'tiktok' };
function median(a) { if (!a.length) return 0; var b = a.slice().sort(function (x, y) { return x - y; }); var m = Math.floor(b.length / 2); return b.length % 2 ? b[m] : (b[m - 1] + b[m]) / 2; }
var dshort = function (t) { var d = new Date(t); return d.getDate() + ' ' + ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'][d.getMonth()]; };
/** Everything the page shows from the orders' journeys (last 30 days, delivered basis). */
function readData(set) {
  var now = Date.now(), from = now - 30 * DAY;
  var first = creditTable({ from: from, to: now, model: 'first_click', windowDays: set.windowDays, basis: 'delivered' });
  var chosen = creditTable({ from: from, to: now, model: set.model, windowDays: set.windowDays, basis: 'delivered' });
  var del = onlineOrders().filter(function (o) { return o.times && o.times.delivered && o.times.delivered >= from && o.times.delivered < now; });
  var touches = del.map(function (o) { return touchesOf(o); });
  var known = touches.filter(function (t) { return t.some(function (x) { return x.channel !== 'direct'; }); }).length;
  var counts = touches.map(function (t) { return t.length; });
  var days = del.map(function (o, i) { return touches[i].length ? (o.at - touches[i][0].at) / DAY : 0; });
  // an example: a recent delivered order with the longest journey
  var ex = null;
  del.slice(0, 80).forEach(function (o, i) { if (!ex || touches[i].length > touchesOf(ex).length) ex = o; });
  return { now: now, first: first, chosen: chosen, delivered: del.length, known: known, medTouches: median(counts), medDays: median(days), ex: ex };
}
class Component extends DCLogic {
  componentDidMount() { this.setState({ set: getSetting() }, () => this.setState({ data: readData(this.state.set) })); }
  componentWillUnmount() { clearTimeout(this.t); }
  pickModel(patch) {
    var before = this.state.set || getSetting();
    var next = setSetting(patch, whoNow());
    logChanges({ formId: 'attribution', changes: [{ field: 'model', label: 'Attribution model', from: modelLabel(before), to: modelLabel(next) }] });
    this.setState({ set: next, data: readData(next) });
    toast(this, 'Reports now use ' + modelLabel(next));
  }
  renderVals() {
    var self = this, s = this.state || {};
    var set = s.set || getSetting(), d = s.data;
    var page = s.page || '/offers/eid-gift-box', src = s.src || 'facebook', med = s.med || 'paid', camp = s.camp != null ? s.camp : 'Eid Gift Box 2026';
    var slug = String(camp).toLowerCase().trim().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
    var AVC = [['#fce7f3', '#9d174d'], ['#e0e7ff', '#3730a3'], ['#fff4e0', '#a14f06'], ['#e7f8f1', '#047857']];
    var m = modelBy(set.model);
    var F = d ? d.first.rows : [], L = d ? d.chosen.rows : [];
    var tf = F.reduce(function (a, r) { return a + r.delivered; }, 0) || 1, tl = L.reduce(function (a, r) { return a + r.delivered; }, 0) || 1;
    var ex = d && d.ex, exTouches = ex ? touchesOf(ex) : [], exCredit = ex ? creditOf(ex, set) : [];
    var path = ex ? exTouches.map(function (t, i) {
      var c = channelBy(t.channel), lk = CH_LOGO[t.channel] || '';
      var share = exCredit.filter(function (x) { return x.channel === t.channel; }).reduce(function (a, x) { return a + x.share; }, 0);
      return { lg: lk ? LOGO[lk] : '', hasLg: !!lk, noLg: !lk, i: c.name.charAt(0), t: c.name, s: (t.campaign ? '“' + t.campaign + '” · ' : '') + dshort(t.at) + ' · utm_source=' + t.raw.utm_source, tag: i === 0 ? 'FIRST TOUCH' : i === exTouches.length - 1 ? 'LAST TOUCH' : '', hasTag: i === 0 || i === exTouches.length - 1, b: '#fff', f: 'var(--text-heading)', tb: 'var(--fill-info-soft)', tc: 'var(--text-info)', credit: share ? Math.round(share * 100) + '% credit' : '' };
    }).concat([
      { hasLg: false, noLg: true, i: '৳', t: 'Order placed', s: bdt(ex.subtotal) + ' · ' + (ex.method || 'COD') + ' · ' + dshort(ex.at), tag: '', hasTag: false, b: 'var(--fill-warning-soft)', f: 'var(--text-warning)' },
      { hasLg: false, noLg: true, i: '✓', t: 'Delivered', s: (ex.courier || 'Courier') + ' · ' + dshort(ex.times.delivered), tag: 'COUNTED HERE', hasTag: true, b: 'var(--primary)', f: '#fff', tb: 'var(--primary)', tc: '#fff' },
    ]) : [];
    var v = {
      tiles: d ? [
        { l: 'Orders with a known path', v: d.delivered ? Math.round(d.known / d.delivered * 100) + '%' : '—', s: 'of ' + d.delivered + ' delivered, 30 days' },
        { l: 'Touches before buying', v: String(d.medTouches || '—'), s: 'median' },
        { l: 'Days to decide', v: (Math.round(d.medDays * 10) / 10).toFixed(1), s: 'first touch → order' },
        { l: 'Credited to ads', v: Math.round(L.filter(function (r) { return r.paid; }).reduce(function (a, r) { return a + r.delivered; }, 0) / tl * 100) + '%', s: m.name },
        { l: 'Survey answered', v: '64%', s: 'at checkout' },
      ] : [],
      model: set.model, windowDays: set.windowDays, modelRule: m.rule, modelLabel: modelLabel(set),
      models: MODELS.map(function (x) { return { id: x.id, l: x.name + ' · v' + x.version }; }), windows: WINDOWS,
      setModel: function (e) { self.pickModel({ model: e.target.value }); }, setWindow: function (e) { self.pickModel({ windowDays: Number(e.target.value) }); },
      exTitle: ex ? 'One order, start to finish · ' + ex.id + ' · ' + bdt(ex.subtotal) + ' · ' + (ex.method || 'COD') : 'One order, start to finish',
      path: path,
      chans: L.map(function (r, k) { var fr = F[k] || { delivered: 0 }; var lp = r.delivered / tl * 100, fp = fr.delivered / tf * 100, dd = Math.round(fp - lp); var dl = dd >= 0 ? { d: '+' + dd + ' pts', db: '#f3e8ff', df: '#6d28d9' } : { d: dd + ' pts', db: '#e0f2fe', df: '#1d4ed8' }; return { n: r.name, l: Math.round(lp) + '%', lw: Math.min(100, lp / 60 * 100) + '%', f: Math.round(fp) + '%', fw: Math.min(100, fp / 60 * 100) + '%', d: dl.d, db: dl.db, df: dl.df, o: (Math.round(r.delivered * 10) / 10) + ' orders · ' + bdt(r.deliveredSales) }; }).filter(function (c, i) { return L[i].delivered > 0 || (F[i] && F[i].delivered > 0); }),
      hear: [['Facebook or Instagram', 41, '#2563eb'], ['Friend or family', 22, '#7c3aed'], ['TikTok', 14, '#db2777'], ['Google', 11, '#059669'], ['Creator', 8, '#f59e0b'], ['Walked past', 4, '#94a3b8']].map(function (h) { return { l: h[0], w: h[1] + '%', h: (h[1] / 41 * 88) + '%', c: h[2], n: Math.round(h[1] * 6.48) }; }),
      askHear: mkSw(this, 'askHear', true),
      infl: [['Nadia’s Skin Diary', 'NADIA10', 38, 41200, 4120], ['TechBangla Reviews', 'TBR500', 11, 49400, 5500], ['Dhaka Style Files', 'DSF15', 23, 19800, 3000], ['Mitul Cooks', 'MITUL5', 4, 1400, 1000]].map(function (i2, k) { var x = i2[3] / i2[4]; var sp = sparkP(series(14, i2[2], i2[2] * .3, k * 2 + 1, x > 4 ? .5 : -.4)); var a2 = AVC[k]; var nm = i2[0].split(' '); return { n: i2[0], ini: (nm[0].charAt(0) + nm[1].charAt(0)).toUpperCase(), ab: a2[0], af: a2[1], c: i2[1], o: i2[2], r: bdt(i2[3]), p: bdt(i2[4]), x: x2(x), xb: x >= 4 ? '#e7f8f1' : x >= 2 ? '#fff4e0' : '#ffece6', xf: x >= 4 ? '#047857' : x >= 2 ? '#a14f06' : '#be123c', line: sp.line, area: sp.area, cc: x >= 4 ? '#059669' : x >= 2 ? '#d97706' : '#e11d48' }; }),
      uPage: page, uSrc: src, uMed: med, uCamp: camp, uBase: 'https://gridshop.com.bd' + page, uSlug: slug,
      setPage: function (e) { self.setState({ page: e.target.value }); }, setSrc: function (e) { self.setState({ src: e.target.value }); }, setMed: function (e) { self.setState({ med: e.target.value }); }, typeCamp: function (e) { self.setState({ camp: e.target.value }); },
      copyUrl: function () { toast(self, 'Link copied.'); }, shortUrl: function () { toast(self, 'Short link: gsh.bd/' + slug.slice(0, 8) + ' — clicks are counted too.'); }
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
.at-hlist{display:none}
@media (max-width:640px){
  /* one order, start to finish: a vertical timeline */
  .at-path{grid-template-columns:minmax(0,1fr)!important;gap:14px!important}
  .at-path>.at-line{left:27px!important;right:auto!important;top:28px!important;bottom:28px!important;width:2px!important;height:auto!important;background:linear-gradient(180deg,#db2777,#c026d3,#059669,#f59e0b,#0b1733)!important}
  .at-step{display:grid!important;grid-template-columns:56px minmax(0,1fr);column-gap:14px;row-gap:2px!important;align-items:center!important;justify-items:start;text-align:left!important}
  .at-step>span:first-child{grid-row:1 / span 3;align-self:start}
  .at-step>span:not(:first-child){grid-column:2}
  /* first vs last touch: name + change on one line, the two bars full width below */
  .at-chrow{grid-template-columns:minmax(0,1fr) auto!important;row-gap:6px!important}
  .at-chrow>div{grid-column:1 / -1;order:3}
  .at-legend{flex-wrap:wrap;gap:6px 16px!important}
  /* how did you hear: a list with bars instead of six thin columns */
  .at-hbars,.at-hlabels{display:none!important}
  .at-hlist{display:flex;flex-direction:column;gap:10px}
  .at-hrow{display:grid;grid-template-columns:minmax(0,1fr) 40px;gap:4px 10px;align-items:center;font-size:var(--text-xs-plus)}
  .at-hrow>i{grid-column:1 / -1;display:block;height:8px;border-radius:var(--radius-full);background:#f1f4f9;overflow:hidden}
  .at-hrow>i>b{display:block;height:100%;border-radius:var(--radius-full)}
  .at-utm{grid-template-columns:minmax(0,1fr)!important}
  .at-url{flex-wrap:wrap}
  .at-url>.mono{flex:1 1 100%!important}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class AttributionScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Attribution">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="rep-marketing" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page={"Attribution & UTM"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/reports-centre?group=marketing" title="Attribution & UTM" meta={'How sales receive marketing credit · ' + v.modelLabel}
                about="How delivered orders receive marketing credit under the model you choose (first click, last click, last non-direct, linear or position-based), first click against that model, what buyers say when asked how they heard about the shop, creator codes, and a builder for tagged links (UTM). Every order keeps its raw touches; the model is applied when reports are read, and every attributed figure says which model and version it used."
                more={[{ label: 'Campaigns & creatives', href: '/campaigns' }, { label: 'Analytics hub', href: '/analytics-hub' }]} />
              <div className="ta-tools">
                <select className="ix-pick" aria-label="Attribution model" value={v.model} onChange={v.setModel}>
                  {__list(v.models).map((m) => <option key={m.id} value={m.id}>{m.l}</option>)}
                </select>
                <select className="ix-pick" aria-label="Credit window" value={v.windowDays} onChange={v.setWindow}>
                  {__list(v.windows).map((w) => <option key={w} value={w}>{w === 1 ? '1 day after click' : w + ' days after click'}</option>)}
                </select>
                <__InfoTip text={v.modelRule + ' Reports, Analytics hub and Campaigns use this model.'} label="How the model gives credit" />
              </div>
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, sub: t.s }))} />
              <details className="gc-disclose ix-card ta-more">
                <summary>{v.exTitle}</summary>
                <div className="ta-more__body">
                <div className="gc-cols-5 at-path" style={{ position: "relative", display: "grid", gridTemplateColumns: "repeat(" + Math.max(2, __list(v.path).length) + ", minmax(0, 1fr))", gap: "14px" }}>
                  <div className="at-line" style={{ position: "absolute", left: "10%", right: "10%", top: "27px", height: "2px", background: "linear-gradient(90deg, #db2777, #c026d3, #059669, #f59e0b, #0b1733)" }} />
                  {__list(v.path).map((ph, $index) => (<React.Fragment key={$index}>
                      <div className="at-step" style={{ position: "relative", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", gap: "8px" }}>
                        <span style={__sx(`width: 56px; height: 56px; border-radius: var(--radius-xl); background: ${ph?.b ?? ""}; color: ${ph?.f ?? ""}; box-shadow: 0 0 0 5px var(--surface-card); display: flex; align-items: center; justify-content: center; font-weight: var(--weight-semibold); font-size: var(--text-sm-plus);`)}>
                          {ph?.hasLg ? (<>
                            <img src={ph?.lg} alt="" width="30" height="30" style={{ width: "30px", height: "30px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                          </>) : null}
                          {ph?.noLg ? (<>{ph?.i}</>) : null}
                        </span>
                        <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{ph?.t}</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "16px" }}>{ph?.s}</span>
                        {ph?.hasTag ? (<>
                          <span className="dl" style={__sx(`background: ${ph?.tb ?? ""}; color: ${ph?.tc ?? ""}; letter-spacing: var(--tracking-label);`)}>{ph?.tag}</span>
                        </>) : null}
                        {ph?.credit ? <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-info)" }}>{ph.credit}</span> : null}
                      </div>
                    </React.Fragment>))}
                </div>
                </div>
              </details>
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.35fr) minmax(0, 1fr)", gap: "16px", alignItems: "stretch" }}>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">First click vs {v.modelLabel.split(' · ')[0]} <__InfoTip text="Share of orders delivered in the last 30 days. Channels that introduce buyers often get less credit when the last touch counts." /></h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {__list(v.chans).map((ch, $index) => (<React.Fragment key={$index}>
                        <div className="at-chrow" style={{ display: "grid", gridTemplateColumns: "140px minmax(0, 1fr) 70px", gap: "14px", alignItems: "center" }}>
                          <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--text-heading)" }} title={ch?.o}>{ch?.n}<span style={{ display: "block", fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>{ch?.o}</span></span>
                          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flexGrow: "1", height: "9px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                <div style={__sx(`width: ${ch?.fw ?? ""}; height: 100%; border-radius: var(--radius-full); background: #a78bfa;`)} />
                              </div>
                              <span className="tn" style={{ width: "36px", fontSize: "var(--text-xs)", color: "#6d28d9", textAlign: "right" }}>{ch?.f}</span>
                            </div>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                              <div style={{ flexGrow: "1", height: "9px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                <div style={__sx(`width: ${ch?.lw ?? ""}; height: 100%; border-radius: var(--radius-full); background: #2563eb;`)} />
                              </div>
                              <span className="tn" style={{ width: "36px", fontSize: "var(--text-xs)", color: "#1d4ed8", textAlign: "right" }}>{ch?.l}</span>
                            </div>
                          </div>
                          <span className="dl" style={__sx(`background: ${ch?.db ?? ""}; color: ${ch?.df ?? ""}; justify-content: center;`)}>{ch?.d}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="at-legend" style={{ display: "flex", gap: "16px", fontSize: "var(--text-xs)", color: "#475569" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "8px", borderRadius: "var(--radius-sm)", background: "#a78bfa" }} />First click — who introduced them</span>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "12px", height: "8px", borderRadius: "var(--radius-sm)", background: "#2563eb" }} />{v.modelLabel.split(' · ')[0]} — credit used in reports</span>
                  </div>
                </section>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">“How did you hear about us?” <__InfoTip text="Asked after the address. Catches word of mouth that no pixel can see." /></h2>
                    </div>
                  </div>
                  <div className="at-hbars" style={{ display: "flex", alignItems: "flex-end", gap: "12px", height: "190px", paddingTop: "8px" }}>
                    {__list(v.hear).map((hr2, $index) => (<React.Fragment key={$index}>
                        <div className="tt" style={{ flex: "1", height: "100%", display: "flex", flexDirection: "column", justifyContent: "flex-end", alignItems: "center", gap: "6px" }}>
                          <span className="tn" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{hr2?.w}</span>
                          <div style={__sx(`width: 100%; height: ${hr2?.h ?? ""}; border-radius: var(--radius-lg) var(--radius-lg) var(--radius-sm) var(--radius-sm); background: ${hr2?.c ?? ""};`)} />
                          <span className="tip">{hr2?.n} answers</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div className="at-hlabels" style={{ display: "flex", gap: "12px" }}>
                    {__list(v.hear).map((hl, $index) => (<React.Fragment key={$index}>
                        <span style={{ flex: "1", fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "center", lineHeight: "17px" }}>{hl?.l}</span>
                      </React.Fragment>))}
                  </div>
                  <div className="at-hlist">
                    {__list(v.hear).map((hl, $index) => (
                      <div className="at-hrow" key={$index}>
                        <span style={{ color: "#0f172a" }}>{hl?.l} <span style={{ color: "var(--text-muted)" }}>· {hl?.n} answers</span></span>
                        <span className="tn" style={{ textAlign: "right", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{hl?.w}</span>
                        <i aria-hidden="true"><b style={{ width: hl?.h, background: hl?.c }} /></i>
                      </div>
                    ))}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M7.9 20A9 9 0 1 0 4 16.1L2 22Z" />
                      </svg>
                    </span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Ask at checkout</div>
                      <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "var(--text-muted)" }}>One tap, optional · 64% of buyers answer</div>
                    </div>
                    <button type="button" role="switch" aria-checked={v.askHear?.on} aria-label="Ask at checkout" className={v.askHear?.cls} onClick={v.askHear?.toggle} />
                  </div>
                </section>
              </div>
              <section className="tc" style={{ padding: "16px 0 4px", display: "flex", flexDirection: "column", gap: "12px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "0 16px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 className="ta-h2">Creator and influencer codes <__InfoTip text="A code credits its creator even when nobody clicked a link." /></h2>
                  </div>
                  <__Link href="/new-coupon" className="abtn" style={{ textDecoration: "none" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>New code</__Link>
                </div>
                <div className="gc-table-wrap">
                  <table className="tb">
                    <thead>
                      <tr>
                        <th>Creator</th>
                        <th>Code</th>
                        <th>Trend</th>
                        <th className="r">Orders</th>
                        <th className="r">Delivered revenue</th>
                        <th className="r">Paid</th>
                        <th>Return</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.infl).map((inf, $index) => (<React.Fragment key={$index}>
                          <tr className="row">
                            <td>
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <span style={__sx(`width: 34px; height: 34px; border-radius: var(--radius-full); background: ${inf?.ab ?? ""}; color: ${inf?.af ?? ""}; display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{inf?.ini}</span>
                                <span style={{ fontWeight: "var(--weight-medium)" }}>{inf?.n}</span>
                              </div>
                            </td>
                            <td>
                              <span className="mono" style={{ fontWeight: "var(--weight-semibold)", padding: "4px 8px", borderRadius: "var(--radius-md)", background: "#f1f4f9" }}>{inf?.c}</span>
                            </td>
                            <td style={{ width: "110px" }}>
                              <svg width="100" height="26" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true" style={{ display: "block" }}>
                                <path d={inf?.area} fill={inf?.cc} fillOpacity=".12" />
                                <path d={inf?.line} fill="none" stroke={inf?.cc} strokeWidth="1.6" vectorEffect="non-scaling-stroke" strokeLinejoin="round" />
                              </svg>
                            </td>
                            <td className="r tn">{inf?.o}</td>
                            <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{inf?.r}</td>
                            <td className="r tn" style={{ color: "var(--text-muted)" }}>{inf?.p}</td>
                            <td>
                              <span className="dl" style={__sx(`background: ${inf?.xb ?? ""}; color: ${inf?.xf ?? ""};`)}>{inf?.x}</span>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
              </section>
              <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 className="ta-h2">UTM link builder</h2>
                  </div>
                </div>
                <div className="at-utm" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr 1fr 1.2fr", gap: "12px" }}>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Page</span>
                    <select className="inp" value={v.uPage} onChange={v.setPage} aria-label="Page">
                      <option value="/offers/eid-gift-box">Eid gift box offer</option>
                      <option value="/p/sunscreen-spf50-50ml">Sunscreen SPF50</option>
                      <option value="/lp/kurti-new-drop">Kurti new drop</option>
                      <option value="/">Home page</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Posted on</span>
                    <select className="inp" value={v.uSrc} onChange={v.setSrc} aria-label="Source">
                      <option value="facebook">Facebook</option>
                      <option value="instagram">Instagram</option>
                      <option value="tiktok">TikTok</option>
                      <option value="whatsapp">WhatsApp</option>
                      <option value="sms">SMS</option>
                      <option value="creator">Creator / influencer</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Type</span>
                    <select className="inp" value={v.uMed} onChange={v.setMed} aria-label="Medium">
                      <option value="paid">Paid ad</option>
                      <option value="organic">Organic post</option>
                      <option value="message">Message</option>
                      <option value="bio">Bio link</option>
                    </select>
                  </label>
                  <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <span className="lbl">Campaign</span>
                    <input className="inp" value={v.uCamp} onInput={v.typeCamp} onChange={v.typeCamp} aria-label="Campaign" />
                  </label>
                </div>
                <div className="at-url" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px 18px", borderRadius: "var(--radius-xl)", background: "#0b1733", "--text-muted": "#94a3b8" }}>
                  <div className="mono" style={{ flexGrow: "1", fontSize: "var(--text-xs-plus)", lineHeight: "20px", wordBreak: "break-all", color: "#cbd5e1" }}>
                    <span style={{ color: "#fff" }}>{v.uBase}</span>
                    <span style={{ color: "var(--text-muted)" }}>?utm_source=</span>
                    <span style={{ color: "#fbbf24" }}>{v.uSrc}</span>
                    <span style={{ color: "var(--text-muted)" }}>{"&utm_medium="}</span>
                    <span style={{ color: "#34d399" }}>{v.uMed}</span>
                    <span style={{ color: "var(--text-muted)" }}>{"&utm_campaign="}</span>
                    <span style={{ color: "#93c5fd" }}>{v.uSlug}</span>
                  </div>
                  <button type="button" className="btn sm" onClick={v.copyUrl} style={{ background: "#fff", color: "#0b1733" }}>
                    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="14" height="14" x="8" y="8" rx="2" />
                      <path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2" />
                    </svg>
                    <span>Copy</span>
                  </button>
                  <button type="button" className="btn sm" onClick={v.shortUrl} style={{ background: "rgba(255,255,255,.12)", color: "#fff" }}>Short link</button>
                </div>
                <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Names become lower-case with dashes, so “Eid” and “eid” never split into two campaigns.</div>
              </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
