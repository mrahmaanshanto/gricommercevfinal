'use client';
// Generated from design/templates/tracking-analytics/AnalyticsHub.dc.html by scripts/convert-design.mjs.
// Analytics hub — ad spend against delivered revenue, laid out like Shopify's Analytics (docs/shopify-style.md):
// the title row (back to Reports), platform and period pickers, five key figures with trend lines, the day's alerts as
// pills, then one chart and one short list (where the money went). The deeper analysis (claims against deliveries,
// money leaks, new and repeat buyers, messages) is folded under "More analysis".
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { TA_CSS, TA_PHONE_CSS } from './taPhone';
import { toast as __toast } from '@/runtime/ui';
import { InfoTip as __InfoTip } from '@/components/ui';
import { RecordHeader, MetricStrip } from '@/components/ui/IndexKit';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function toast(self, m, bad) { __toast(m, bad ? { tone: 'info' } : undefined); }
var PL = { meta: ['Meta', '#e7efff', '#1d4ed8'], google: ['Google', '#e7f8f1', '#047857'], tiktok: ['TikTok', '#f1f5f9', '#0f172a'], gc: ['GridCommerce', '#fff4e0', '#a14f06'] };
var LOGO = { meta: '/assets/41f77fbf774c3a1c10208ca2b086bc14.png', google: '/assets/85e4f9f412e9d0859b3e4e19309ccb4d.png', tiktok: '/assets/57bb10142b6017571910098da3778028.png' };
function pct(n) { return (Math.round(n * 10) / 10) + '%'; }
function x2(n) { return (Math.round(n * 100) / 100).toFixed(2) + '×'; }
var PERIOD = [['7', '7 days'], ['30', '30 days'], ['90', '90 days']];
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
function delta(p, good) { var up = p >= 0; var ok = good === 'down' ? !up : up; return { up: up, ok: ok, dir: (up ? 'Up ' : 'Down ') + Math.abs(p) + '%' + (ok ? ', good' : ', worse'), d: Math.abs(p) + '%' }; }
function tile(l, v, s, c, vals, dp, good) { var sp = sparkP(vals); var dl = delta(dp, good); return { l: l, v: v, s: s, c: c, vals: vals.map(function (x) { return Math.round(x * 100) / 100; }), line: sp.line, area: sp.area, d: dl.d, up: dl.up, ok: dl.ok, dir: dl.dir }; }
function dseg(self, opts, cur, key) { return opts.map(function (o) { return { l: o[1], on: o[0] === cur, pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function kfmt(n) { return n >= 100000 ? '৳' + (n / 100000).toFixed(n >= 1000000 ? 1 : 2) + 'L' : n >= 1000 ? '৳' + Math.round(n / 1000) + 'k' : '৳' + Math.round(n); }
var DAYS = []; (function () { for (var i = 0; i < 90; i++) { var d = new Date(Date.UTC(2026, 5, 22 + i)); DAYS.push(d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()]); } })();
// Non-colour cues: each platform / cost part also gets its own fill pattern, shown in the legends too.
var PAT = [null, ['repeating-linear-gradient(45deg, rgba(255,255,255,.5) 0 2px, transparent 2px 6px)', 'auto'], ['radial-gradient(rgba(255,255,255,.7) 1.2px, transparent 1.6px)', '5px 5px'], ['repeating-linear-gradient(-45deg, rgba(255,255,255,.5) 0 2px, transparent 2px 6px)', 'auto']];
function fillOf(c, i) { var pt = PAT[i]; return pt ? { backgroundColor: c, backgroundImage: pt[0], backgroundSize: pt[1] } : { backgroundColor: c }; }
var RC = function (r) { return r >= 4 ? 'var(--text-success)' : r >= 2.5 ? 'var(--text-warning)' : 'var(--text-danger)'; };
var RL = function (r) { return r >= 4 ? 'strong' : r >= 2.5 ? 'fair' : 'weak'; };
var RI = function (r) { return r >= 4 ? 'trending-up' : r >= 2.5 ? 'minus' : 'trending-down'; };
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var per = s.per || '30', pv = s.pv || this.props.platform || 'all';
    var keys = pv === 'all' ? ['meta', 'google', 'tiktok'] : [pv];
    var f = per === '7' ? .24 : per === '90' ? 2.9 : 1, n = +per;
    var a = agg(keys).map(function (x) { return Math.round(x * f); });
    var nrv = netRev(a), real = nrv / a[0], blended = a[6] / a[0];
    var rev = series(n, a[6] / n, a[6] / n * .28, keys.length * 3 + 1, .35), sp = series(n, a[0] / n, a[0] / n * .18, keys.length + 5, .15), prev = series(n, a[6] / n * .86, a[6] / n * .22, 9, .1);
    var mx = Math.max.apply(null, rev.concat(prev)) * 1.12, W = 760, Hc = 230;
    var rp = pts(rev, W, Hc, mx, 0, 10, 0), pp = pts(prev, W, Hc, mx, 0, 10, 0);
    var bw = W / n * .56, bars = sp.map(function (v, i) { var x = n === 1 ? W / 2 : i * W / (n - 1), h = v / mx * (Hc - 10); return 'M' + (x - bw / 2).toFixed(1) + ' ' + Hc + ' v-' + h.toFixed(1) + ' h' + bw.toFixed(1) + ' v' + h.toFixed(1) + ' Z'; }).join(' ');
    var rl = curve(rp);
    var off = 90 - n;
    var PS = { meta: agg(['meta']), google: agg(['google']), tiktok: agg(['tiktok']) };
    var tot = agg(['meta', 'google', 'tiktok'])[0], C = 2 * Math.PI * 58, acc = 0;
    var dn = ['meta', 'google', 'tiktok'].map(function (k) { var share = PS[k][0] / tot, len = C * share; var o = { da: (Math.max(0, len - 3)).toFixed(1) + ' ' + C.toFixed(1), off: (-acc).toFixed(1) }; acc += len; return o; });
    var v = {
      perL: 'last ' + per + ' days', headline: kfmt(a[6]) + ' delivered from ' + kfmt(a[0]) + ' of ads',
      periods: dseg(self, PERIOD, per, 'per'), ptabs: dseg(self, [['all', 'All'], ['meta', 'Meta'], ['google', 'Google'], ['tiktok', 'TikTok']], pv, 'pv'),
      pdf: function () { toast(self, 'Branded PDF for the last ' + per + ' days is ready.'); },
      tiles: [tile('Ad spend', bdt(a[0]), 'vs previous', '#fbbf24', sp.slice(-14), 8, 'down'), tile('Delivered revenue', bdt(a[6]), a[5] + ' orders', '#60a5fa', rev.slice(-14), 14), tile('Blended return', x2(blended), 'platforms say ' + x2(a[1] / a[0]), '#a78bfa', series(14, 5, .6, 3, .2), 6), tile('Real return', x2(real), 'after courier, returns', '#34d399', series(14, 4.6, .5, 4, .25), 9), tile('Cost / confirmed', bdt(a[0] / a[4]), a[4] + ' confirmed', '#f472b6', series(14, 160, 14, 6, -.2), -4, 'down'), tile('Cost / delivered', bdt(a[0] / a[5]), 'return rate ' + pct(a[7] / a[5] * 100), '#fb923c', series(14, 185, 16, 8, -.15), -3, 'down')],
      alerts: [['Meta spend passed ৳4,000 today', 'Daily limit alert · 9:12 AM', 'var(--fill-warning-soft)', 'var(--text-warning)'], ['Sylhet returns up to 18%', 'Consider prepaid-only there', 'var(--fill-error-soft)', 'var(--text-danger)'], ['Merchant Center: 12 warnings', 'Missing GTIN on 12 products', 'var(--fill-info-soft)', 'var(--text-info)']].map(function (x) { return { t: x[0], s: x[1], b: x[2], f: x[3] }; }),
      yax: [mx, mx * .66, mx * .33, 0].map(function (y) { return { t: kfmt(y) }; }),
      revLine: rl, revArea: rl + ' L' + W + ' ' + Hc + ' L0 ' + Hc + ' Z', prevLine: curve(pp), spBars: bars,
      revPts: (function () { var k = Math.max(1, Math.round(n / 7)); var out = []; for (var i = Math.floor(k / 2); i < n; i += k) out.push({ x: (rp[i][0] / W * 100).toFixed(2) + '%', y: rp[i][1].toFixed(1) + 'px' }); return out; })(),
      cols: rev.map(function (r, i) { return { dt: DAYS[off + i], r: bdt(r), s: bdt(sp[i]), x: x2(r * .9 / sp[i]) }; }),
      xax: [0, .25, .5, .75, 1].map(function (q) { return { t: DAYS[off + Math.min(n - 1, Math.round(q * (n - 1)))] }; }),
      annX: ((n - (per === '7' ? 3 : 12)) / (n - 1) * 100).toFixed(1) + '%',
      d0: dn[0], d1: dn[1], d2: dn[2], mixTot: kfmt(tot * f),
      mix: ['meta', 'google', 'tiktok'].map(function (k, i) { return { lg: LOGO[k], l: PL[k][0], c: PC[k], sw: fillOf(PC[k], i), v: bdt(PS[k][0] * f), p: Math.round(PS[k][0] / tot * 100) + '%' }; }),
      bullets: ['meta', 'google', 'tiktok'].map(function (k) { var p = PS[k], r = netRev(p) / p[0], cl = p[1] / p[0]; return { lg: LOGO[k], l: PL[k][0], c: PC[k], r: x2(r), cl: x2(cl), w: Math.min(100, r / 12 * 100) + '%', cw: Math.min(99, cl / 12 * 100) + '%', rc: RC(r), ri: RI(r), rl: RL(r) }; }),
      cmp: ['meta', 'google', 'tiktok'].filter(function (k) { return pv === 'all' || pv === k; }).map(function (k) { var p = PF[k].map(function (x) { return Math.round(x * f); }); var r = netRev(p) / p[0]; var M = 1000000 * f; return { lg: LOGO[k], pl: PL[k][0], c: PC[k], a: (p[6] / M * 100) + '%', b: (p[1] / M * 100) + '%', gw: ((p[1] - p[6]) / M * 100) + '%', dl: bdt(p[6]), cl: bdt(p[1]), gap: '+' + Math.round((p[1] / p[6] - 1) * 100) + '%', roas: x2(r), rc: RC(r), ri: RI(r), rl: RL(r) }; }),
      leak: [['Orders placed', a[3]], ['Confirmed', a[4]], ['Shipped', Math.round(a[4] * .97)], ['Delivered', a[5]], ['Kept', a[5] - a[7]]].map(function (x, i, arr) { var prevV = i ? arr[i - 1][1] : x[1]; var lost = prevV - x[1]; return { l: x[0], n: x[1].toLocaleString('en-IN'), w: Math.max(18, x[1] / a[3] * 100) + '%', c: ['#1e3a8a', '#1d4ed8', '#2563eb', '#047857', '#065f46'][i], hasStep: i > 0, step: lost + ' lost', stepL: ['', 'not confirmed by phone', 'cancelled before pickup', 'failed or refused at door', 'returned after delivery'][i], sc: lost / prevV > .12 ? 'var(--text-danger)' : 'var(--text-warning)' }; }),
      split: (function () { var R = a[6]; var parts = [['Ad spend', a[0], '#b45309', 0], ['Courier', a[5] * COST.courier, '#475569', 1], ['Returns', a[7] * COST.ret, '#be123c', 2], ['Packing', a[4] * COST.pack, '#64748b', 3]]; var used = 0; parts.forEach(function (p) { used += p[1]; }); parts.push(['Left for you', R - used, '#047857', 0]); return parts.map(function (p) { var w = p[1] / R * 100; return { l: p[0], c: p[2], sw: fillOf(p[2], p[3]), w: w + '%', t: w > 6 ? '৳' + Math.round(w) : '', v: bdt(p[1]) }; }); })(),
      nrep: ['meta', 'google', 'tiktok'].map(function (k) { var p = PF[k]; var nn = p[8] / p[5] * 100; return { lg: LOGO[k], pl: PL[k][0], c: PC[k], nw: nn + '%', rw: (100 - nn) + '%', rsw: { width: (100 - nn) + '%', backgroundColor: PC[k], opacity: .45, backgroundImage: PAT[1][0] }, t: Math.round(nn) + '% new · ' + (100 - Math.round(nn)) + '% repeat' }; }),
      mRing: ring(16.7, 44),
      msgs: [['1,284', 'New conversations'], ['214', 'Became orders'], ['4 min', 'Average reply'], ['৳48', 'Cost per conversation']].map(function (m) { return { v: m[0], l: m[1] }; })
    };
    return v;
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = TA_CSS + `
@media (max-width:1100px){.ah-2{grid-template-columns:minmax(0,1fr)!important}.ah-3{grid-template-columns:minmax(0,1fr)!important}}
.ah-cmp{min-width:760px}
.pm{position:absolute;width:9px;height:9px;margin:-4.5px 0 0 -4.5px;border-radius:var(--radius-full);background:#fff;border:2px solid #2563eb;pointer-events:none}
.ah-split>:first-child{border-radius:var(--radius-lg) 0 0 var(--radius-lg)}.ah-split>:last-child{border-radius:0 var(--radius-lg) var(--radius-lg) 0}
.lg{display:inline-flex;align-items:center;gap:6px}
` + TA_PHONE_CSS;

// ---- markup ----

export default class AnalyticsHubScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="AnalyticsHub">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="rep-marketing" />
          <main className="gc-shell__main">
            <__Topbar crumb={"Tracking & analytics"} page="Analytics hub" placeholder="Search campaign, event or product" />
            <div className="gc-shell__content">
              <div className="ix-page ta">
              <RecordHeader back="/reports-centre?group=marketing" title="Analytics hub" meta={v.headline + ' · ' + v.perL}
                about="Delivered revenue against ad spend for Meta, Google and TikTok: what each platform claims and what the courier delivered, where the money leaks, new against repeat buyers and the messages that became orders."
                secondary={[{ label: 'Download PDF', onClick: v.pdf }]}
                more={[{ label: 'Campaigns & creatives', href: '/campaigns' }, { label: 'Attribution & UTM', href: '/attribution' }, { label: 'Products & traffic', href: '/products-traffic' }, { label: 'Reports & alerts', href: '/reports-alerts' }]} />
              <div className="ta-tools">
                <div className="lseg" role="group" aria-label="Platform">
                  {__list(v.ptabs).map((pv) => <button key={pv.l} type="button" onClick={pv.pick} aria-pressed={pv.on}>{pv.l}</button>)}
                </div>
                <div className="lseg" role="group" aria-label="Period">
                  {__list(v.periods).map((pd) => <button key={pd.l} type="button" onClick={pd.pick} aria-pressed={pd.on}>{pd.l}</button>)}
                </div>
              </div>
              <MetricStrip label={'Key figures, ' + v.perL} items={__list(v.tiles).filter((t) => t.l !== 'Blended return').map((t) => ({
                label: t.l, value: t.v, spark: t.vals,
                sub: <span className="dl" title={t.dir + ' · ' + t.s} style={{ background: t.ok ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', color: t.ok ? 'var(--text-success)' : 'var(--text-danger)' }}><__Icon name={t.up ? 'arrow-up' : 'arrow-down'} width="12" height="12" aria-label={t.up ? 'Up' : 'Down'} role="img" />{t.d}</span>,
              }))} />
              {__list(v.alerts).length ? (
                <nav className="ta-todo" aria-label="Alerts">
                  {__list(v.alerts).map((at) => <__Link key={at.t} href="/reports-alerts" title={at.s}><i aria-hidden="true" style={{ background: at.f }} />{at.t}</__Link>)}
                </nav>
              ) : null}
              <div className="ah-2" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.75fr) minmax(0, 1fr)", gap: "16px", alignItems: "stretch" }}>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "8px 12px", flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 220px", minWidth: "0" }}>
                      <h2 className="ta-h2">Delivered revenue and ad spend</h2>
                    </div>
                    <div aria-label="Chart legend" role="list" style={{ display: "flex", flexWrap: "wrap", gap: "6px 14px", fontSize: "var(--text-xs)", color: "var(--text-body)", alignItems: "center" }}>
                      <span className="lg" role="listitem"><svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true"><line x1="0" y1="5" x2="26" y2="5" stroke="#2563eb" strokeWidth="2.2" /><circle cx="13" cy="5" r="3.5" fill="#fff" stroke="#2563eb" strokeWidth="2" /></svg>Delivered revenue (line with points)</span>
                      <span className="lg" role="listitem"><svg width="14" height="12" viewBox="0 0 14 12" aria-hidden="true"><rect x="0" y="5" width="3" height="7" fill="#b45309" /><rect x="5" y="1" width="3" height="11" fill="#b45309" /><rect x="10" y="4" width="3" height="8" fill="#b45309" /></svg>Ad spend (bars)</span>
                      <span className="lg" role="listitem"><svg width="26" height="10" viewBox="0 0 26 10" aria-hidden="true"><line x1="0" y1="5" x2="26" y2="5" stroke="#64748b" strokeWidth="1.6" strokeDasharray="4 4" /></svg>Previous period (dashed)</span>
                    </div>
                  </div>
                  <div style={{ position: "relative", height: "262px" }}>
                    <div style={{ position: "absolute", left: "0", top: "0", bottom: "32px", width: "48px", display: "flex", flexDirection: "column", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)", textAlign: "right", paddingRight: "8px" }}>
                      {__list(v.yax).map((ya, $index) => (<React.Fragment key={$index}>
                          <span className="tn">{ya?.t}</span>
                        </React.Fragment>))}
                    </div>
                    <div style={{ position: "absolute", left: "52px", right: "0", top: "0", height: "230px" }}>
                      <svg width="100%" height="230" viewBox="0 0 760 230" preserveAspectRatio="none" role="img" aria-label="Chart of delivered revenue (line with points), ad spend (bars) and the previous period (dashed line) by day" style={{ display: "block", overflow: "visible" }}>
                        <defs>
                          <linearGradient id="taRevG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#2563eb" stopOpacity=".28" />
                            <stop offset="1" stopColor="#2563eb" stopOpacity="0" />
                          </linearGradient>
                          <linearGradient id="taSpG" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="0" stopColor="#b45309" stopOpacity=".9" />
                            <stop offset="1" stopColor="#b45309" stopOpacity=".6" />
                          </linearGradient>
                        </defs>
                        <line x1="0" x2="760" y1="10" y2="10" stroke="#eef1f6" strokeWidth="1" />
                        <line x1="0" x2="760" y1="65" y2="65" stroke="#eef1f6" strokeWidth="1" />
                        <line x1="0" x2="760" y1="120" y2="120" stroke="#eef1f6" strokeWidth="1" />
                        <line x1="0" x2="760" y1="175" y2="175" stroke="#eef1f6" strokeWidth="1" />
                        <line x1="0" x2="760" y1="230" y2="230" stroke="#dfe5ee" strokeWidth="1" />
                        <path d={v.spBars} fill="url(#taSpG)" />
                        <path d={v.revArea} fill="url(#taRevG)" />
                        <path d={v.revLine} fill="none" stroke="#2563eb" strokeWidth="2.2" strokeLinejoin="round" strokeLinecap="round" vectorEffect="non-scaling-stroke" />
                        <path d={v.prevLine} fill="none" stroke="#64748b" strokeWidth="1.6" strokeDasharray="5 5" vectorEffect="non-scaling-stroke" />
                      </svg>
                      {__list(v.revPts).map((pt, $index) => (<span key={$index} className="pm" aria-hidden="true" style={{ left: pt?.x, top: pt?.y }} />))}
                      <div style={{ position: "absolute", inset: "0", display: "flex" }}>
                        {__list(v.cols).map((cl, $index) => (<React.Fragment key={$index}>
                            <div className="col tt">
                              <span className="cl" />
                              <div className="tip">
                                <div style={{ fontWeight: "var(--weight-semibold)", marginBottom: "4px" }}>{cl?.dt}</div>
                                <div style={{ display: "flex", gap: "10px" }}>
                                  <span style={{ color: "#93c5fd" }}>Revenue {cl?.r}</span>
                                  <span style={{ color: "#fcd34d" }}>Spend {cl?.s}</span>
                                </div>
                                <div style={{ color: "#cbd5e1", marginTop: "2px" }}>Real return {cl?.x}</div>
                              </div>
                            </div>
                          </React.Fragment>))}
                      </div>
                      <div style={__sx(`position: absolute; left: ${v.annX ?? ""}; top: 6px; transform: translateX(-50%); display: flex; flex-direction: column; align-items: center; pointer-events: none;`)}>
                        <span style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#0b1733", background: "#fff", border: "1px solid #e2e8f0", borderRadius: "var(--radius-full)", padding: "2px 8px", whiteSpace: "nowrap" }}>Eid gift box launched</span>
                        <span style={{ width: "1px", height: "190px", background: "repeating-linear-gradient(#94a3b8 0 3px, transparent 3px 6px)" }} />
                      </div>
                    </div>
                    <div style={{ position: "absolute", left: "52px", right: "0", bottom: "0", height: "22px", display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>
                      {__list(v.xax).map((xa, $index) => (<React.Fragment key={$index}>
                          <span>{xa?.t}</span>
                        </React.Fragment>))}
                    </div>
                  </div>
                </section>
                <section className="tc" style={{ padding: "16px", display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">Where the money went</h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ position: "relative", width: "150px", height: "150px", flexShrink: "0" }}>
                      <svg width="150" height="150" viewBox="0 0 150 150" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
                        <defs>
                          <pattern id="ahPat1" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
                            <rect width="6" height="6" fill="#059669" />
                            <rect width="2" height="6" fill="#fff" fillOpacity=".5" />
                          </pattern>
                          <pattern id="ahPat2" width="5" height="5" patternUnits="userSpaceOnUse">
                            <rect width="5" height="5" fill="#db2777" />
                            <circle cx="2.5" cy="2.5" r="1.2" fill="#fff" fillOpacity=".7" />
                          </pattern>
                        </defs>
                        <circle cx="75" cy="75" r="58" fill="none" stroke="#eef1f6" strokeWidth="16" />
                        <circle cx="75" cy="75" r="58" fill="none" stroke="#2563eb" strokeWidth="16" strokeDasharray={v.d0?.da} strokeDashoffset={v.d0?.off} />
                        <circle cx="75" cy="75" r="58" fill="none" stroke="url(#ahPat1)" strokeWidth="16" strokeDasharray={v.d1?.da} strokeDashoffset={v.d1?.off} />
                        <circle cx="75" cy="75" r="58" fill="none" stroke="url(#ahPat2)" strokeWidth="16" strokeDasharray={v.d2?.da} strokeDashoffset={v.d2?.off} />
                      </svg>
                      <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span className="ey" style={{ fontSize: "var(--text-xs)" }}>Spend</span>
                        <span className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.mixTot}</span>
                      </div>
                    </div>
                    <div style={{ flexGrow: "1", display: "flex", flexDirection: "column", gap: "10px" }}>
                      {__list(v.mix).map((mx, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)" }}>
                            <span aria-hidden="true" style={{ width: "14px", height: "14px", borderRadius: "var(--radius-sm)", flexShrink: "0", ...(mx?.sw || {}) }} />
                            <img src={mx?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                            <span style={{ flexGrow: "1", color: "#334155" }}>{mx?.l}</span>
                            <span className="tn" style={{ fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{mx?.v}</span>
                            <span className="tn" style={{ width: "38px", textAlign: "right", color: "var(--text-muted)", fontSize: "var(--text-xs)" }}>{mx?.p}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </div>
                  <div style={{ height: "1px", background: "#eef1f6" }} />
                  <div className="ey">Real return by platform</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {__list(v.bullets).map((bu, $index) => (<React.Fragment key={$index}>
                        <div>
                          <div style={{ display: "flex", alignItems: "baseline", gap: "8px", marginBottom: "6px" }}>
                            <img src={bu?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a", flexGrow: "1" }}>{bu?.l}</span>
                            <span style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>claims {bu?.cl}</span>
                            <span className="tn" title={`Real return is ${bu?.rl ?? ""}`} style={__sx(`display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-sm); font-weight: var(--weight-semibold); color: ${bu?.rc ?? ""};`)}><__Icon name={bu?.ri} width="14" height="14" aria-hidden="true" />{bu?.r}<span className="sr-only"> ({bu?.rl})</span></span>
                          </div>
                          <div style={{ position: "relative", height: "10px", borderRadius: "var(--radius-full)", background: "#f1f4f9" }}>
                            <div style={__sx(`position: absolute; left: 0; top: 0; bottom: 0; width: ${bu?.w ?? ""}; border-radius: var(--radius-full); background: ${bu?.c ?? ""};`)} />
                            <span style={__sx(`position: absolute; top: -3px; bottom: -3px; left: ${bu?.cw ?? ""}; width: 2px; border-radius: 2px; background: #0f172a;`)} />
                          </div>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>Bar = real return · black tick = what the platform claims · scale 0 to 12x</div>
                </section>
              </div>
              <details className="gc-disclose ix-card ta-more">
                <summary>More analysis: claims against deliveries, money leaks, new and repeat buyers, messages</summary>
                <div className="ta-more__body">
              <section className="ta-block">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <h2 className="ta-h2">What platforms claim vs what was delivered <__InfoTip text="Platforms count an order the moment it is placed. We count it when the courier delivers." /></h2>
                  </div>
                </div>
                <div className="gc-table-wrap"><div className="ah-cmp" style={{ display: "flex", flexDirection: "column", gap: "4px", fontSize: "var(--text-sm)" }}>
                  {__list(v.cmp).map((cp, $index) => (<React.Fragment key={$index}>
                      <div className="row" style={{ display: "grid", gridTemplateColumns: "120px minmax(0, 1fr) 110px 110px 110px 96px", alignItems: "center", gap: "16px", padding: "14px 8px", borderRadius: "var(--radius-xl)" }}>
                        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <img src={cp?.lg} alt="" width="20" height="20" style={{ width: "20px", height: "20px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                          <span style={{ fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{cp?.pl}</span>
                        </div>
                        <div style={{ position: "relative", height: "28px" }}>
                          <div style={{ position: "absolute", left: "0", right: "0", top: "13px", height: "2px", background: "#eef1f6" }} />
                          <div style={__sx(`position: absolute; left: ${cp?.a ?? ""}; width: ${cp?.gw ?? ""}; top: 12px; height: 4px; background: linear-gradient(90deg, ${cp?.c ?? ""}, #cbd5e1); border-radius: var(--radius-sm);`)} />
                          <span className="tt" style={__sx(`position: absolute; left: ${cp?.a ?? ""}; top: 6px; width: 16px; height: 16px; margin-left: -8px; border-radius: var(--radius-full); background: ${cp?.c ?? ""}; box-shadow: 0 0 0 3px #fff;`)}>
                            <span className="tip">Delivered {cp?.dl}</span>
                          </span>
                          <span className="tt" style={__sx(`position: absolute; left: ${cp?.b ?? ""}; top: 6px; width: 16px; height: 16px; margin-left: -8px; border-radius: var(--radius-full); background: #fff; border: 2px solid #64748b;`)}>
                            <span className="tip">Platform claims {cp?.cl}</span>
                          </span>
                        </div>
                        <div className="r">
                          <div className="tn" style={{ fontWeight: "var(--weight-semibold)" }}>{cp?.dl}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>delivered</div>
                        </div>
                        <div className="r">
                          <div className="tn" style={{ fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{cp?.cl}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>platform says</div>
                        </div>
                        <div className="r">
                          <span className="dl" style={{ background: "var(--fill-warning-soft)", color: "var(--text-warning)" }}>{cp?.gap}</span>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)", marginTop: "3px" }}>overstated</div>
                        </div>
                        <div className="r">
                          <div className="tn" title={`Real return is ${cp?.rl ?? ""}`} style={__sx(`display: inline-flex; align-items: center; gap: 4px; font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${cp?.rc ?? ""};`)}><__Icon name={cp?.ri} width="16" height="16" aria-hidden="true" />{cp?.roas}<span className="sr-only"> ({cp?.rl})</span></div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>real return</div>
                        </div>
                      </div>
                    </React.Fragment>))}
                </div></div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 16px", fontSize: "var(--text-xs)", color: "var(--text-muted)", padding: "0 8px" }}>
                  <span className="lg"><span aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "var(--radius-full)", background: "#2563eb" }} />Filled dot: delivered revenue (GridCommerce)</span>
                  <span className="lg"><span aria-hidden="true" style={{ width: "12px", height: "12px", borderRadius: "var(--radius-full)", border: "2px solid #64748b" }} />Hollow ring: revenue the platform claims</span>
                </div>
              </section>
              <div className="ah-3" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1.25fr) minmax(0, 1fr) minmax(0, 1fr)", gap: "16px", alignItems: "start" }}>
                <section className="ta-block">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">Where money leaks</h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "0" }}>
                    {__list(v.leak).map((lk, $index) => (<React.Fragment key={$index}>
                        <div>
                          {lk?.hasStep ? (<>
                            <div style={{ display: "flex", alignItems: "center", gap: "8px", padding: "4px 0 4px 132px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>
                              <span style={{ width: "1px", height: "14px", background: "#cbd5e1", marginLeft: "6px" }} />
                              <span className="tn" style={__sx(`display: inline-flex; align-items: center; gap: 3px; font-weight: var(--weight-semibold); color: ${lk?.sc ?? ""};`)}><__Icon name="arrow-down" width="12" height="12" aria-hidden="true" />{lk?.step}</span>
                              <span>{lk?.stepL}</span>
                            </div>
                          </>) : null}
                          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                            <span style={{ width: "120px", fontSize: "var(--text-xs-plus)", color: "#334155", textAlign: "right" }}>{lk?.l}</span>
                            <div style={{ flexGrow: "1", height: "30px" }}>
                              <div style={__sx(`width: ${lk?.w ?? ""}; height: 100%; border-radius: var(--radius-lg); background: ${lk?.c ?? ""}; display: flex; align-items: center; justify-content: flex-end; padding-right: 10px;`)}>
                                <span className="tn" style={{ color: "#fff", fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-semibold)" }}>{lk?.n}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div style={{ height: "1px", background: "#eef1f6" }} />
                  <div className="ey">Every ৳100 of delivered revenue</div>
                  <div role="img" aria-label={"Split of every 100 taka: " + __list(v.split).map((q) => q.l + " " + q.v).join(", ")} className="ah-split" style={{ display: "flex", height: "34px" }}>
                    {__list(v.split).map((sq, $index) => (<React.Fragment key={$index}>
                        <div className="tt" style={{ width: sq?.w, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", ...(sq?.sw || {}) }}>
                          {sq?.t ? <span style={{ background: sq?.c, padding: "0 4px", borderRadius: "var(--radius-sm)" }}>{sq.t}</span> : null}
                          <span className="tip">{sq?.l} · {sq?.v}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: "6px 12px", fontSize: "var(--text-xs)", color: "var(--text-body)" }}>
                    {__list(v.split).map((sl, $index) => (<React.Fragment key={$index}>
                        <span className="lg"><span aria-hidden="true" style={{ width: "14px", height: "14px", borderRadius: "var(--radius-sm)", ...(sl?.sw || {}) }} />{sl?.l} · {sl?.v}</span>
                      </React.Fragment>))}
                  </div>
                </section>
                <section className="ta-block">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">New vs repeat buyers</h2>
                      <p className="ix-card__sub">Solid = first order ever · striped = came back</p>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                    {__list(v.nrep).map((nr, $index) => (<React.Fragment key={$index}>
                        <div>
                          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "7px" }}>
                            <img src={nr?.lg} alt="" width="16" height="16" style={{ width: "16px", height: "16px", objectFit: "contain", flexShrink: "0", display: "block" }} />
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", flexGrow: "1" }}>{nr?.pl}</span>
                            <span className="tn" style={{ fontSize: "var(--text-sm)", color: "var(--text-body)" }}>{nr?.t}</span>
                          </div>
                          <div style={{ display: "flex", height: "12px", borderRadius: "var(--radius-full)", overflow: "hidden", background: "#f1f4f9" }}>
                            <div style={__sx(`width: ${nr?.nw ?? ""}; background: ${nr?.c ?? ""};`)} />
                            <div style={nr?.rsw} />
                          </div>
                        </div>
                      </React.Fragment>))}
                  </div>
                </section>
                <section className="ta-block">
                  <div style={{ display: "flex", alignItems: "flex-start", gap: "12px" }}>
                    <div style={{ flexGrow: "1", minWidth: "0" }}>
                      <h2 className="ta-h2">Messages that became orders</h2>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "18px" }}>
                    <div style={{ position: "relative", width: "108px", height: "108px", flexShrink: "0" }}>
                      <svg width="108" height="108" viewBox="0 0 108 108" aria-hidden="true" style={{ transform: "rotate(-90deg)" }}>
                        <circle cx="54" cy="54" r="44" fill="none" stroke="#eef1f6" strokeWidth="10" />
                        <circle cx="54" cy="54" r="44" fill="none" stroke="#7c3aed" strokeWidth="10" strokeLinecap="round" strokeDasharray={v.mRing?.da} />
                      </svg>
                      <div style={{ position: "absolute", inset: "0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                        <span className="tn" style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>16.7%</span>
                        <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>to order</span>
                      </div>
                    </div>
                    <div className="gc-cols-2" style={{ flexGrow: "1", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                      {__list(v.msgs).map((mg, $index) => (<React.Fragment key={$index}>
                          <div>
                            <div className="tn" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{mg?.v}</div>
                            <div style={{ fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{mg?.l}</div>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </div>
                </section>
                  </div>
                </div>
              </details>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
