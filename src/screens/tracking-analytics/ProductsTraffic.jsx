'use client';
// Generated from design/templates/tracking-analytics/ProductsTraffic.dc.html by scripts/convert-design.mjs.
// Products & traffic — profit after ads per product and where the visitors come from, laid out like a Shopify report:
// the title row (back to Reports), five key figures, then one card with the views (profit after ads, traffic and
// funnel, organic social, Google search).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { toast as __toast } from '@/runtime/ui';
import { RecordHeader, MetricStrip, IndexTabs } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function pct(n) { return (Math.round(n * 10) / 10) + '%'; }
// 30-day figures per platform: spend, platform-claimed revenue, claimed purchases, GC placed, confirmed, delivered, delivered revenue, returned, new customers, clicks, impressions
var PC = { meta: '#2563eb', google: '#059669', tiktok: '#db2777' };
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }
function delta(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { up: up, ok: ok, dir: (up ? 'Up ' : 'Down ') + Math.abs(p) + '%' + (ok ? ', good' : ', worse'), d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', df: ok ? 'var(--text-success)' : 'var(--text-danger)' }; }
function deltaL(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { d: (up ? '▲ ' : '▼ ') + Math.abs(p) + '%', db: ok ? '#e7f8f1' : '#ffece6', df: ok ? '#047857' : '#be123c' }; }
function tile(l, v, s, c, vals, dp, good) { var dl = delta(dp, good); return { l: l, v: v, s: s, c: c, vals: vals.map(function (x) { return Math.round(x * 100) / 100; }), d: dl.d, up: dl.up, ok: dl.ok, dir: dl.dir, db: dl.db, df: dl.df }; }
// name, initial, ad spend, delivered, revenue, cogs, delivery+returns
var PR = [['Eid gift box · skincare', 'E', 38400, 236, 231000, 118000, 21700], ['Sunscreen SPF50 50ml', 'S', 23200, 198, 138600, 59400, 16400], ['Galaxy A55 5G · 8/256', 'G', 31800, 42, 1848000, 1722000, 5200], ['Cotton kurti · new drop', 'K', 23500, 119, 116200, 52300, 12900], ['Vitamin C Serum 30ml', 'V', 12600, 74, 70300, 31800, 6100], ['Redmi Note 13', 'R', 16000, 21, 399000, 374000, 3600], ['Bluetooth speaker', 'P', 9100, 38, 57000, 38800, 4400], ['Mango Pickle 400g', 'M', 5400, 61, 21350, 11590, 5200]];
var TT = [['#fff4e0', '#a14f06'], ['#e0f3fb', '#075985'], ['#e0e7ff', '#3730a3'], ['#fce7f3', '#9d174d']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var tab = s.tab || this.props.tab || 'prod';
    var FUN = [['Sessions', 62400], ['Viewed a product', 28100], ['Added to cart', 5480], ['Started checkout', 2710], ['Placed order', 1420], ['Delivered', 1012]];
    var fp = (function () { var W = 720, Hh = 220, sw = W / 6, top = [], bot = []; FUN.forEach(function (f, k) { var h = Math.max(14, Math.sqrt(f[1] / 62400) * Hh); var y0 = (Hh - h) / 2; top.push([k * sw, y0], [(k + 1) * sw, y0]); bot.push([k * sw, y0 + h], [(k + 1) * sw, y0 + h]); }); var d = 'M' + top.map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L'); d += ' L' + bot.reverse().map(function (p) { return p[0].toFixed(1) + ' ' + p[1].toFixed(1); }).join(' L') + ' Z'; return d; })();
    var gc = series(30, 330, 60, 3, .25), gi = series(30, 13700, 2600, 7, .35);
    var gp = pts(gc, 900, 180, 480, 0, 20, 10), ip = pts(gi, 900, 180, 21000, 0, 20, 10), gl = curve(gp);
    var v = {
      headline: '৳2,38,060 profit after ads from 8 products',
      tiles: [tile('Sessions', '62,400', 'last 30 days', '#60a5fa', series(14, 2080, 260, 1, .2), 11), tile('Store conversion', '2.28%', 'placed ÷ sessions', '#34d399', series(14, 2.2, .2, 3, .2), 4), tile('Best product', 'Galaxy A55', '৳89,000 profit', '#fbbf24', series(14, 1700, 300, 4, .6), 38), tile('No-result searches', '628', '3 terms', '#fb7185', series(14, 20, 5, 6, .2), 9, 'down'), tile('New followers', '8,330', 'Facebook, Instagram, TikTok', '#a78bfa', series(14, 270, 50, 8, .3), 16)],
      tabs: pTabs(self, [{ k: 'prod', label: 'Profit after ads' }, { k: 'traf', label: 'Traffic & funnel' }, { k: 'soc', label: 'Organic social' }, { k: 'seo', label: 'Google search' }], tab, 'tab'),
      is_prod: tab === 'prod', is_traf: tab === 'traf', is_soc: tab === 'soc', is_seo: tab === 'seo',
      leg: [['Product cost', '#cbd5e1'], ['Delivery & returns', '#94a3b8'], ['Ads', '#f59e0b'], ['Profit', '#10b981']].map(function (x) { return { l: x[0], c: x[1] }; }),
      prods: PR.map(function (p, i) { return [p, i, p[4] - p[5] - p[6] - p[2]]; }).sort(function (a, b) { return b[2] - a[2]; }).map(function (x) { var p = x[0], pr = x[2], t = TT[x[1] % 4], R = p[4]; var vd = pr > 40000 ? ['Scale up', '#e7f8f1', '#047857'] : pr > 0 ? ['Keep', '#e0f2fe', '#075985'] : ['Losing money', '#ffece6', '#be123c'];
        var seg = [['Product cost', p[5], '#cbd5e1'], ['Delivery & returns', p[6], '#94a3b8'], ['Ads', p[2], '#f59e0b'], ['Profit', Math.max(0, pr), '#10b981']].map(function (q) { return { l: q[0], v: bdt(q[1]), c: q[2], w: (q[1] / R * 100) + '%' }; });
        return { n: p[0], i: p[1], tb: t[0], tf: t[1], d: p[3], ad: bdt(p[2]), rev: bdt(R), p: bdt(pr), m: Math.round(pr / R * 100) + '%', pc: pr > 0 ? '#047857' : '#be123c', vt: vd[0], vb: vd[1], vf: vd[2], seg: seg }; }),
      funPath: fp,
      fun: FUN.map(function (f, i2) { var dr = i2 ? 1 - f[1] / FUN[i2 - 1][1] : 0; return { l: f[0], n: f[1].toLocaleString('en-IN'), drop: i2 ? '−' + Math.round(dr * 100) + '% from previous' : '100%', dc: dr > .6 ? '#be123c' : '#64748b' }; }),
      srcs: [['Facebook / Instagram ads', 24800, 692], ['TikTok ads', 11200, 148], ['Google Shopping + Search', 9300, 298], ['Google organic', 8600, 171], ['Direct', 5100, 82], ['Messenger / WhatsApp links', 3400, 29]].map(function (r) { var c = r[2] / r[1] * 100; return { s: r[0], v: r[1].toLocaleString('en-IN'), w: r[1] / 24800 * 100 + '%', c: pct(c), cc: c >= 2.5 ? '#047857' : c >= 1.5 ? '#334155' : '#be123c' }; }),
      lps: [['/offers/eid-gift-box', '8,420', 38, '241'], ['/', '7,960', 44, '122'], ['/p/sunscreen-spf50-50ml', '5,110', 31, '176'], ['/c/phones', '3,880', 52, '58'], ['/lp/kurti-new-drop', '3,240', 41, '97']].map(function (l) { return { p: l[0], s: l[1], b: l[2] + '%', bc: l[2] > 45 ? '#f43f5e' : '#94a3b8', o: l[3] }; }),
      srch: [['sunscreen', 1240, '32 results'], ['kurti', 402, '46 results'], ['a55', 610, '3 results'], ['niacinamide', 288, 'No results'], ['cosrx snail', 196, 'No results'], ['power bank', 144, 'No results']].map(function (q) { var z = q[2] === 'No results'; return { t: q[0], n: q[1], r: q[2], c: z ? '#be123c' : '#047857', bg: z ? '#fff5f5' : '#fff', bd: z ? '#fecdd3' : '#e7ebf2' }; }),
      socs: [['meta', 'Facebook Page', '48,210', 'followers', '+4.6%', [['1.2 M', 'Reach'], ['6.8%', 'Engagement'], ['3,410', 'Website taps'], ['214 / day', 'Profile visits']], 1], ['meta', 'Instagram', '21,630', 'followers', '+6.8%', [['640 K', 'Reach'], ['4.1%', 'Engagement'], ['38', 'Reels'], ['18–24 · 46%', 'Top age']], 4], ['tiktok', 'TikTok', '33,900', 'followers', '+16.5%', [['2.4 M', 'Video views'], ['11 s', 'Average watch'], ['62%', 'From For You'], ['1,120', 'Profile clicks']], 7]].map(function (x) { var sp = sparkP(series(30, 100, 8, x[6], .6)); return { lg: x[1] === 'Instagram' ? '' : LOGO[x[0]], hasLg: x[1] !== 'Instagram', noLg: x[1] === 'Instagram', c: x[1] === 'Instagram' ? '#c026d3' : PC[x[0]], acc: x[1], f: x[2], fl: x[3], g: x[4], line: sp.line, area: sp.area, m: x[5].map(function (y) { return { v: y[0], l: y[1] }; }) }; }),
      gLine: gl, gArea: gl + ' L900 180 L0 180 Z', iLine: curve(ip),
      gsc: [['Clicks', '9,840', 12], ['Impressions', '412 K', 21], ['Click-through', '2.4%', -8], ['Average position', '14.8', 12]].map(function (g) { var d = deltaL(g[2]); return { l: g[0], v: g[1], d: d.d, db: d.db, df: d.df }; }),
      qs: [['gridshop', '2,210', '4,800', '46%', 1.1], ['sunscreen price in bd', '640', '38,200', '1.7%', 6.4], ['eid gift box for her', '302', '8,900', '3.4%', 4.2], ['vitamin c serum bd', '164', '12,700', '1.3%', 8.9], ['korean skincare bd', '410', '29,100', '1.4%', 9.2], ['samsung a55 price in bangladesh', '388', '61,400', '0.6%', 12.8], ['kurti online bd', '210', '22,300', '0.9%', 15.6]].map(function (q) { var top = q[4] <= 3, pg1 = q[4] <= 10; return { q: q[0], c: q[1], i: q[2], r: q[3], p: q[4], pb: top ? '#e7f8f1' : pg1 ? '#e0f2fe' : '#fff4e0', pf: top ? '#047857' : pg1 ? '#075985' : '#a14f06' }; })
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
@media (max-width:640px){
  /* legend under the tabs: caption on its own line, the colour keys wrap below */
  .pt-leg{flex-wrap:wrap;height:auto!important;padding:14px 16px 6px!important;gap:6px 14px!important}
  .pt-leg>.ey{flex:1 1 100%;margin-right:0!important}
  .pt-leg>span:not(.ey){white-space:nowrap}
}
` + TA_PHONE_CSS;

// ---- markup ----

export default class ProductsTrafficScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="ProductsTraffic">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="rep-marketing" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page={"Products & traffic"} placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/reports-centre?group=marketing" title="Products & traffic" meta={v.headline + ' · last 30 days'}
                about="Profit after ads for each product, the shopping funnel and where visitors come from (Google Analytics 4), top landing pages and site search, organic social posts, and Google Search clicks and queries."
                more={[{ label: 'Analytics hub', href: '/analytics-hub' }, { label: 'Campaigns & creatives', href: '/campaigns' }]} />
              <MetricStrip label="Key figures" items={__list(v.tiles).map((t) => ({ label: t.l, value: t.v, spark: t.vals, sub: <span className="dl" title={t.s} style={{ background: t.db, color: t.df }}>{t.d}</span> }))} />
              <section className="tc" style={{ overflow: "hidden" }}>
                <div className="ix-bar"><IndexTabs label="Products and traffic views" tabs={__list(v.tabs).map((tb) => ({ key: tb.label, label: tb.label, count: tb.hasCount ? tb.count : null, on: tb.on, onClick: tb.pick }))} /></div>
                {v.is_prod ? (<>
                  <div className="pt-leg" style={{ padding: "8px 16px 0", display: "flex", gap: "16px", fontSize: "var(--text-xs)", color: "#475569", alignItems: "center", height: "var(--control-height)" }}>
                    <span className="ey" style={{ marginRight: "6px" }}>Each ৳100 of revenue goes to</span>
                    {__list(v.leg).map((lg, $index) => (<React.Fragment key={$index}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={__sx(`width: 10px; height: 10px; border-radius: 3px; background: ${lg?.c ?? ""};`)} />{lg?.l}</span>
                      </React.Fragment>))}
                  </div>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Product</th>
                          <th>Where revenue goes</th>
                          <th className="r">Revenue</th>
                          <th className="r">Ad spend</th>
                          <th className="r">Profit after ads</th>
                          <th>Verdict</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.prods).map((pr, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td style={{ width: "260px" }}>
                                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                  <span className="thumb" style={__sx(`background: ${pr?.tb ?? ""}; color: ${pr?.tf ?? ""}; border: 0;`)}>{pr?.i}</span>
                                  <div>
                                    <div style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{pr?.n}</div>
                                    <div className="tn" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{pr?.d} delivered</div>
                                  </div>
                                </div>
                              </td>
                              <td>
                                <div style={{ display: "flex", height: "14px", borderRadius: "var(--radius-full)", overflow: "hidden", background: "#f1f4f9" }}>
                                  {__list(pr?.seg).map((sg, $index) => (<React.Fragment key={$index}>
                                      <div className="tt" style={__sx(`width: ${sg?.w ?? ""}; background: ${sg?.c ?? ""};`)}>
                                        <span className="tip">{sg?.l} · {sg?.v}</span>
                                      </div>
                                    </React.Fragment>))}
                                </div>
                              </td>
                              <td className="r tn">{pr?.rev}</td>
                              <td className="r tn" style={{ color: "#b45309" }}>{pr?.ad}</td>
                              <td className="r">
                                <span className="tn" style={__sx(`font-size: var(--text-sm-plus); font-weight: var(--weight-semibold); color: ${pr?.pc ?? ""};`)}>{pr?.p}</span>
                                <div className="tn" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{pr?.m} margin</div>
                              </td>
                              <td>
                                <span className="dl" style={__sx(`background: ${pr?.vb ?? ""}; color: ${pr?.vf ?? ""};`)}>{pr?.vt}</span>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </>) : null}
                {v.is_traf ? (<>
                  <div style={{ padding: "16px", display: "grid", gridTemplateColumns: "minmax(0, 1.45fr) minmax(0, 1fr)", gap: "18px" }}>
                    <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 className="ta-h2">Shopping funnel · Analytics 4</h2>
                          <p className="ix-card__sub">Biggest leak: product view → add to cart</p>
                        </div>
                      </div>
                      <div>
                        <svg width="100%" height="220" viewBox="0 0 720 220" preserveAspectRatio="none" aria-label="Funnel" style={{ display: "block" }}>
                          <defs>
                            <linearGradient id="taFunG" x1="0" y1="0" x2="1" y2="0">
                              <stop offset="0" stopColor="#1e3a8a" />
                              <stop offset="1" stopColor="#059669" />
                            </linearGradient>
                          </defs>
                          <path d={v.funPath} fill="url(#taFunG)" fillOpacity=".92" />
                          <line x1="120" x2="120" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="240" x2="240" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="360" x2="360" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="480" x2="480" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                          <line x1="600" x2="600" y1="0" y2="220" stroke="#fff" strokeWidth="2" />
                        </svg>
                        <div className="gc-cols-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", marginTop: "10px" }}>
                          {__list(v.fun).map((fn, $index) => (<React.Fragment key={$index}>
                              <div style={{ padding: "0 6px" }}>
                                <div className="tn" style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{fn?.n}</div>
                                <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", lineHeight: "17px" }}>{fn?.l}</div>
                                <div className="tn" style={__sx(`font-size: var(--text-xs); font-weight: var(--weight-medium); color: ${fn?.dc ?? ""}; margin-top: 3px;`)}>{fn?.drop}</div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </section>
                    <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 className="ta-h2">Where visitors come from</h2>
                        </div>
                        <span className="ey">Sessions · conv.</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                        {__list(v.srcs).map((sr, $index) => (<React.Fragment key={$index}>
                            <div>
                              <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "5px", fontSize: "var(--text-xs-plus)" }}>
                                <span style={{ flexGrow: "1", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{sr?.s}</span>
                                <span className="tn" style={{ color: "var(--text-muted)" }}>{sr?.v}</span>
                                <span className="tn" style={__sx(`width: 44px; text-align: right; font-weight: var(--weight-semibold); color: ${sr?.cc ?? ""};`)}>{sr?.c}</span>
                              </div>
                              <div style={{ height: "7px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                <div style={__sx(`width: ${sr?.w ?? ""}; height: 100%; background: #2563eb; border-radius: var(--radius-full);`)} />
                              </div>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                    <section className="tc" style={{ padding: "16px 0 4px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "0 16px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 className="ta-h2">Top landing pages</h2>
                        </div>
                      </div>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Page</th>
                              <th className="r">Sessions</th>
                              <th>Bounce</th>
                              <th className="r">Orders</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.lps).map((lp, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  <td className="mono" style={{ fontSize: "var(--text-xs-plus)", color: "#0f172a" }}>{lp?.p}</td>
                                  <td className="r tn">{lp?.s}</td>
                                  <td style={{ width: "130px" }}>
                                    <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                                      <div style={{ flexGrow: "1", height: "6px", borderRadius: "var(--radius-full)", background: "#f1f4f9", overflow: "hidden" }}>
                                        <div style={__sx(`width: ${lp?.b ?? ""}; height: 100%; background: ${lp?.bc ?? ""};`)} />
                                      </div>
                                      <span className="tn" style={{ fontSize: "var(--text-xs)", width: "32px", textAlign: "right" }}>{lp?.b}</span>
                                    </div>
                                  </td>
                                  <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{lp?.o}</td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                    <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 className="ta-h2">Site search</h2>
                        </div>
                        <span className="ey">Red = no results</span>
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
                        {__list(v.srch).map((sq, $index) => (<React.Fragment key={$index}>
                            <span className="tt" style={__sx(`display: inline-flex; align-items: center; gap: 8px; height: 36px; padding: 0 12px; border-radius: var(--radius-lg); border: 1px solid ${sq?.bd ?? ""}; background: ${sq?.bg ?? ""}; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); color: #0f172a;`)}>{sq?.t}<span className="tn" style={__sx(`font-size: var(--text-xs); color: ${sq?.c ?? ""}; font-weight: var(--weight-medium);`)}>{sq?.n}</span><span className="tip">{sq?.r}</span></span>
                          </React.Fragment>))}
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#fff5f5", color: "#9f1239", fontSize: "var(--text-xs-plus)" }}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                        <span><b>3 searches found nothing</b> — 628 people looked for niacinamide, COSRX snail and power banks.</span>
                      </div>
                    </section>
                  </div>
                </>) : null}
                {v.is_soc ? (<>
                  <div className="gc-cols-3" style={{ padding: "16px", display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "16px" }}>
                    {__list(v.socs).map((so, $index) => (<React.Fragment key={$index}>
                        <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                            {so?.hasLg ? (<>
                              <img src={so?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                            </>) : null}
                            {so?.noLg ? (<>
                              <span style={{ width: "20px", height: "20px", borderRadius: "var(--radius-md)", background: "linear-gradient(45deg,#f59e0b,#db2777 55%,#7c3aed)", flexShrink: "0" }} />
                            </>) : null}
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)", flexGrow: "1" }}>{so?.acc}</span>
                            <span className="dl" style={{ background: "#e7f8f1", color: "#047857" }}>{so?.g}</span>
                          </div>
                          <div>
                            <div className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a", lineHeight: "28px" }}>{so?.f}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{so?.fl}</div>
                          </div>
                          <svg width="100%" height="70" viewBox="0 0 160 30" preserveAspectRatio="none" aria-hidden="true">
                            <path d={so?.area} fill={so?.c} fillOpacity=".12" />
                            <path d={so?.line} fill="none" stroke={so?.c} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                          </svg>
                          <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "1px", background: "#eef1f6", borderRadius: "var(--radius-xl)", overflow: "hidden" }}>
                            {__list(so?.m).map((sm, $index) => (<React.Fragment key={$index}>
                                <div style={{ padding: "10px 12px", background: "#fff" }}>
                                  <div className="tn" style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>{sm?.v}</div>
                                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{sm?.l}</div>
                                </div>
                              </React.Fragment>))}
                          </div>
                        </section>
                      </React.Fragment>))}
                  </div>
                </>) : null}
                {v.is_seo ? (<>
                  <div style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px" }}>
                    <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 className="ta-h2">Google Search · clicks and impressions</h2>
                        </div>
                        <div style={{ display: "flex", gap: "14px", fontSize: "var(--text-xs)", color: "#475569" }}>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", height: "3px", background: "#059669", borderRadius: "3px" }} />Clicks</span>
                          <span style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}><span style={{ width: "14px", borderTop: "2px dashed #7c3aed" }} />Impressions</span>
                        </div>
                      </div>
                      <div style={{ position: "relative" }}>
                        <svg width="100%" height="180" viewBox="0 0 900 180" preserveAspectRatio="none" aria-label="Search trend" style={{ display: "block" }}>
                          <defs>
                            <linearGradient id="taGsc" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0" stopColor="#059669" stopOpacity=".22" />
                              <stop offset="1" stopColor="#059669" stopOpacity="0" />
                            </linearGradient>
                          </defs>
                          <line x1="0" x2="900" y1="20" y2="20" stroke="#eef1f6" />
                          <line x1="0" x2="900" y1="70" y2="70" stroke="#eef1f6" />
                          <line x1="0" x2="900" y1="120" y2="120" stroke="#eef1f6" />
                          <line x1="0" x2="900" y1="170" y2="170" stroke="#eef1f6" />
                          <path d={v.gArea} fill="url(#taGsc)" />
                          <path d={v.gLine} fill="none" stroke="#059669" strokeWidth="2.2" vectorEffect="non-scaling-stroke" />
                          <path d={v.iLine} fill="none" stroke="#7c3aed" strokeWidth="1.6" strokeDasharray="5 4" vectorEffect="non-scaling-stroke" />
                        </svg>
                      </div>
                      <div className="gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "12px" }}>
                        {__list(v.gsc).map((gs, $index) => (<React.Fragment key={$index}>
                            <div>
                              <div className="ey">{gs?.l}</div>
                              <div className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{gs?.v}</div>
                              <span className="dl" style={__sx(`background: ${gs?.db ?? ""}; color: ${gs?.df ?? ""};`)}>{gs?.d}</span>
                            </div>
                          </React.Fragment>))}
                      </div>
                    </section>
                    <section className="tc" style={{ padding: "16px 0 0", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                      <div style={{ display: "flex", alignItems: "flex-start", gap: "12px", padding: "0 16px" }}>
                        <div style={{ flexGrow: "1", minWidth: "0" }}>
                          <h2 className="ta-h2">Search queries</h2>
                        </div>
                      </div>
                      <div className="gc-table-wrap">
                        <table className="tb">
                          <thead>
                            <tr>
                              <th>Query</th>
                              <th className="r">Clicks</th>
                              <th className="r">Impressions</th>
                              <th className="r">CTR</th>
                              <th>Position</th>
                            </tr>
                          </thead>
                          <tbody>
                            {__list(v.qs).map((gq, $index) => (<React.Fragment key={$index}>
                                <tr className="row">
                                  <td style={{ fontWeight: "var(--weight-medium)" }}>{gq?.q}</td>
                                  <td className="r tn" style={{ fontWeight: "var(--weight-semibold)" }}>{gq?.c}</td>
                                  <td className="r tn" style={{ color: "var(--text-muted)" }}>{gq?.i}</td>
                                  <td className="r tn">{gq?.r}</td>
                                  <td>
                                    <span className="dl" style={__sx(`background: ${gq?.pb ?? ""}; color: ${gq?.pf ?? ""}; min-width: 56px; justify-content: center;`)}>#{gq?.p}</span>
                                  </td>
                                </tr>
                              </React.Fragment>))}
                          </tbody>
                        </table>
                      </div>
                      <div style={{ display: "flex", alignItems: "center", gap: "10px", margin: "0 16px 16px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#fff7ed", color: "#9a3412", fontSize: "var(--text-xs-plus)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                          <path d="M12 9v4" />
                          <path d="M12 17h.01" />
                        </svg>
                        <span style={{ flexGrow: "1" }}>7 pages are not indexed — 5 “Crawled, not indexed”, 2 “Duplicate without canonical”.</span>
                        <__Link href="/set-seo" style={{ fontWeight: "var(--weight-semibold)", color: "#9a3412" }}>Fix in SEO</__Link>
                      </div>
                    </section>
                  </div>
                </>) : null}
              </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
