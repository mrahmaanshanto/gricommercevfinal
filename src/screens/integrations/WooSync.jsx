'use client';
// Generated from design/templates/integrations/WooSync.dc.html by scripts/convert-design.mjs.
// WordPress sync — Storefront — two-way WordPress and WooCommerce sync over the REST API: keys, what syncs, status mapping, rules and change log.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? '#0b1733' : '#64748b', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }

function val(e) { return e && e.target ? e.target.value : e; }

var FIELDS = { url: ['https://gridshop.com.bd', /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?$/i, 'Use the full address starting with https://', 'Store found'],
  ck: ['ck_4f81c0a2e9d7b36158ac04f2d9e1b7c63a50f8e2', /^ck_[a-f0-9]{40}$/, 'Starts with ck_ followed by 40 characters.', 'Read/Write key'],
  cs: ['cs_9a3e71bd02c84f6e5d1a7b39c0e2f8d4b6a15c73', /^cs_[a-f0-9]{40}$/, 'Starts with cs_ followed by 40 characters.', 'Saved encrypted'],
  wpu: ['gridshop-admin', /^[\w.@-]{3,60}$/, 'The WordPress login name of an administrator or editor.', 'Editor access or higher'],
  ap: ['Hq2V k8Pz 3mWt Lr9X c4Bn 7yGs', /^([A-Za-z0-9]{4} ){5}[A-Za-z0-9]{4}$/, 'Six groups of 4 letters or numbers, with spaces.', 'Saved encrypted'] };
var WHAT = [['Products', 'Variants, prices, stock, images', 'Instant', '412', '2 min ago'], ['Orders', 'Status, items, notes, customer', 'Instant', '1,284', '6 min ago'], ['Blog posts', 'Title, content, categories, SEO', 'Every 5 min', '36', '1 h ago'], ['Pages', 'About, policies, landing text', 'Every 5 min', '9', '3 days ago'], ['Customers', 'Name, phone, addresses', 'Instant', '3,902', '14 min ago'], ['Categories', 'Product and blog categories', 'Instant', '28', 'yesterday'], ['Coupons', 'Codes, amounts, limits', 'Instant', '11', '2 days ago']];
var MAP = [['New', 'processing', 'New order arrives here as New'], ['Confirmed, Packed', 'processing', 'No change'], ['With courier, In transit', 'processing', 'No change'], ['On hold', 'on-hold', 'Becomes On hold'], ['Delivered', 'completed', 'Becomes Delivered'], ['Cancelled', 'cancelled', 'Becomes Cancelled'], ['Returned', 'refunded', 'Becomes Returned']];
var LOG = [['GC → WP', 'Stock of 20W USB-C Fast Charger changed 12 → 11', '2 min ago'], ['WP → GC', 'New order #WC-48210 · Nusrat Jahan · ৳2,450', '6 min ago'], ['GC → WP', 'Order #WC-48195 marked completed', '18 min ago'], ['WP → GC', 'Price of MagSafe Clear Case — 15 changed ৳1,150 → ৳1,200', '41 min ago'], ['GC → WP', 'Blog post “Choosing a phone case” updated', '1 h ago'], ['WP → GC', 'Customer Shila Rahman address changed', '2 h ago'], ['GC → WP', 'Coupon PUJA10 created', '2 days ago']];
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var F = s.F || {}, shown = s.shown || {}, fixed = s.fixed || {};
    var v = {}, ok = {};
    Object.keys(FIELDS).forEach(function (k) {
      var d = FIELDS[k], x = F[k] == null ? d[0] : F[k]; ok[k] = d[1].test(x); var sh = !!shown[k];
      v['f_' + k] = { v: x, type: (k === 'cs' || k === 'ap') && !sh ? 'password' : 'text', aria: sh ? 'Hide' : 'Show', bd: ok[k] || !x ? '#cbd5e1' : '#e11d48', nc: ok[k] ? '#047857' : x ? '#b83210' : '#64748b', note: ok[k] ? d[3] : d[2],
        toggle: function () { var n = assign({}, shown); n[k] = !sh; self.setState({ shown: n }); },
        onC: function (e) { var n = assign({}, F); n[k] = String(val(e) || '').trim(); self.setState({ F: n, tested: false }); } };
    });
    var allOk = Object.keys(ok).every(function (k) { return ok[k]; });
    var wooOk = ok.url && ok.ck && ok.cs, wpOk = ok.wpu && ok.ap;
    var tested = s.tested !== false;
    var syn = s.syn || {};
    var issues = [['sku', '3 WooCommerce products have no SKU', 'They cannot be matched. Add a SKU on either side.', 'Add SKUs'], ['img', 'Image over 5 MB on “Braided Lightning Cable 1 m”', 'Skipped. Upload a smaller image in WordPress or here.', 'Replace']].filter(function (i) { return !fixed[i[0]]; });
    var nOn = WHAT.filter(function (w) { return syn[w[0]] !== false; }).length;
    assign(v, {
      headline: tested && allOk ? 'gridshop.com.bd is in sync · ' + nOn + ' of 7 data types on' : 'Check the API keys and test the connection',
      tiles: [{ l: 'Products', v: '412', s: 'matched by SKU', c: '#34d399' }, { l: 'Orders this year', v: '1,284', s: 'arrive within seconds', c: '#60a5fa' }, { l: 'Blog posts', v: '36', s: 'edited here or in WordPress', c: '#a78bfa' }, { l: 'Last change', v: '2 min ago', s: 'stock sent to WooCommerce', c: '#fbbf24' }],
      flow: [['Create a WooCommerce API key', 'Settings, Advanced, REST API. Choose Read/Write.', true], ['Create a WordPress application password', 'Users, Profile. Needed for blog posts and pages.', true], ['Paste both and test', 'The store address, both keys and the password.', tested && allOk], ['First import', 'Products are matched by SKU; the rest are created.', tested && allOk], ['Live two-way sync', 'WooCommerce webhooks are set up for you, so changes arrive in seconds.', tested && allOk]].map(function (x, i) { return { n: x[2] ? '✓' : String(i + 1), t: x[0], d: x[1], nb: x[2] ? '#e7f8f1' : '#f1f4f9', nf: x[2] ? '#047857' : '#475569', bd: x[2] ? '#bfe8d6' : '#e7ebf2', bg: x[2] ? '#f6fcf9' : '#fff' }; }),
      testConn: function () {
        if (!wooOk) { toast(self, 'Check the store address and the WooCommerce key and secret.', true); return; }
        if (!wpOk) { toast(self, 'WooCommerce connected. Add the WordPress username and application password to sync blog posts and pages.', true); return; }
        self.setState({ tested: true }); toast(self, 'Connected. WooCommerce REST API and WordPress REST API both answered, 412 products and 36 posts found.');
      },
      connC: tested && allOk ? '#047857' : '#64748b', connNote: tested && allOk ? 'Connected · webhooks active for orders, products, customers and coupons' : 'Not tested yet',
      what: WHAT.map(function (w) { var on = syn[w[0]] !== false; return { n: w[0], d: w[1], how: w[2], c: w[3], l: on ? w[4] : 'Paused', on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var n = assign({}, syn); n[w[0]] = !on; self.setState({ syn: n }); toast(self, w[0] + (on ? ' sync paused. Changes are kept and sent when it is turned back on.' : ' sync is back on.')); } }; }),
      map: MAP.map(function (m) { return { g: m[0], w: m[1], b: m[2] }; }),
      rules: [{ t: 'Products are matched by SKU', d: 'Products without a SKU are listed below instead of being duplicated.' }, { t: 'Stock moves both ways', d: 'A sale on either side lowers stock on both. Online stock comes from Central Warehouse.' }, { t: 'Latest change wins', d: 'The other version is saved in the item’s history for 30 days.' }, { t: 'Deleting moves to trash', d: 'A deleted product or post goes to the trash on the other side, never removed for good.' }, { t: 'Prices in BDT', d: 'Store currency must be BDT (৳) in WooCommerce settings.' }],
      issues: issues.map(function (i) { return { t: i[1], d: i[2], b: i[3], fix: function () { var n = assign({}, fixed); n[i[0]] = 1; self.setState({ fixed: n }); toast(self, i[0] === 'sku' ? 'SKUs added and the 3 products synced.' : 'New image uploaded and synced.'); } }; }),
      issueCount: String(issues.length), noIssues: issues.length === 0,
      log: LOG.map(function (l) { var gc = l[0] === 'GC → WP'; return { dir: l[0], t: l[1], w: l[2], bg: gc ? 'rgba(0,48,135,.08)' : '#f3e8ff', fg: gc ? '#003087' : '#6b21a8' }; })
    });
    return assign(v, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
body{margin:0;font-family:var(--font-sans);background:#e9eef5;color:#1e293b;-webkit-font-smoothing:antialiased}
*{box-sizing:border-box}
a{color:#003087}a:hover{color:#002a77}
.card{background:#ffffff;border-radius:var(--radius-xl);box-shadow:0 3px 10px 0 rgba(48,46,56,.06)}
.nav{display:flex;align-items:center;gap:12px;height:40px;padding:0 12px;border-radius:var(--radius-lg);color:#475569;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:.01em;text-decoration:none;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 300ms ease-in-out}
.nav:hover{background:#f1f5f9;color:#0f172a;text-decoration:none}
.nav.on{background:rgba(0,48,135,.08);color:#003087}
.navh{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);color:var(--text-muted);padding:18px 12px 6px}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);border:0;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);cursor:pointer;text-decoration:none;white-space:nowrap;transition:background-color 200ms cubic-bezier(0,0,.2,1),color 200ms,border-color 200ms}
.btn:hover{text-decoration:none}
.btn:focus-visible,.nav:focus-visible,.ib:focus-visible,.tab:focus-visible,.chip:focus-visible,.step:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.solid{background:#003087;color:#fff}.solid:hover{background:#002a77;color:#fff}
.soft{background:rgba(0,48,135,.08);color:#003087}.soft:hover{background:rgba(0,48,135,.16);color:#003087}
.line{background:#fff;color:#1e293b;border:1px solid #cbd5e1}.line:hover{background:#f1f5f9;color:#1e293b}
.warnbtn{background:#b45309;color:#fff}.warnbtn:hover{background:#92400e;color:#fff}
.big{height:52px;padding:0 24px;font-size:var(--text-sm-plus)}
.sm{height:36px;padding:0 12px;font-size:var(--text-xs-plus)}
.ib{width:36px;height:36px;border-radius:var(--radius-full);border:0;background:transparent;color:#475569;display:inline-flex;align-items:center;justify-content:center;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.ib:hover{background:rgba(203,213,225,.35);color:#0f172a}
.inp{width:100%;height:44px;padding:0 14px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;transition:border-color 200ms}
.inp:hover{border-color:#94a3b8}.inp:focus{outline:none;border-color:#003087}
.inp::placeholder{color:var(--text-muted)}
.lbl{font-size:var(--text-sm);line-height:18px;font-weight:var(--weight-medium);color:#334155}
.tab{height:36px;padding:0 14px;border-radius:var(--radius-full);border:0;background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#475569;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,color 200ms}
.tab:hover{background:#f1f5f9;color:#0f172a}
.tab.on{background:#003087;color:#fff}
.chip{height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap;transition:background-color 200ms,border-color 200ms,color 200ms}
.chip:hover{border-color:#94a3b8}
.chip.on{border-color:#003087;background:rgba(0,48,135,.08);color:#003087}
.th{font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-wide);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #e2e8f0;white-space:nowrap}
.td{padding:14px 16px;border-bottom:1px solid #eef2f6;font-size:var(--text-sm);line-height:20px;vertical-align:middle}
.row{transition:background-color 200ms}.row:hover{background:#f8fafc}
.badge{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.badge::before{content:"";width:6px;height:6px;border-radius:var(--radius-full);background:currentColor}
.b-draft{background:#eef2f6;color:#475569}.b-approval{background:#fff4e0;color:#a14f06}.b-approved{background:#e0f2fe;color:#075985}
.b-ordered{background:rgba(0,48,135,.08);color:#003087}.b-partial{background:#fff1e6;color:#b4410c}.b-received{background:#e7f8f1;color:#047857}
.b-closed{background:#e2e8f0;color:#334155}.b-cancelled{background:#ffece6;color:#b83210}.b-over{background:#ffece6;color:#b83210}
.mono{font-family:var(--font-data);letter-spacing:.02em}
.fade{animation:gcFade 260ms cubic-bezier(0,0,.2,1)}
@keyframes gcFade{from{opacity:0;transform:translateY(4px)}to{opacity:1;transform:none}}
.flash{animation:gcFlash 900ms ease-out}
@keyframes gcFlash{from{background:#e7f8f1}to{background:transparent}}
.scanline{animation:gcScan 1.8s ease-in-out infinite alternate}
@keyframes gcScan{from{transform:translateY(0)}to{transform:translateY(150px)}}

.sw{position:relative;width:48px;height:28px;border-radius:var(--radius-full);border:0;background:#cbd5e1;cursor:pointer;flex-shrink:0;transition:background-color 200ms}
.sw::after{content:"";position:absolute;top:3px;left:3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(15,23,42,.25);transition:transform 200ms cubic-bezier(0,0,.2,1)}
.sw.on{background:#003087}.sw.on::after{transform:translateX(20px)}
.sw:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.b-live{background:#e7f8f1;color:#047857}.b-sched{background:#e0f2fe;color:#075985}.b-ended{background:#eef2f6;color:#475569}.b-paused{background:#fff4e0;color:#a14f06}
.t-member{background:#eef2f6;color:#475569}.t-silver{background:#e2e8f0;color:#334155}.t-gold{background:#fff4e0;color:#a14f06}.t-plat{background:rgba(0,48,135,.08);color:#003087}
.actc{border:1px solid transparent;transition:border-color 200ms,box-shadow 200ms}.actc:hover{border-color:#003087;box-shadow:0 6px 18px rgba(0,48,135,.12)}
.bn{font-family:var(--font-bn)}
.pulse{animation:gcPulse 1.6s ease-in-out infinite}
@keyframes gcPulse{0%,100%{opacity:1}50%{opacity:.45}}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.pcard{background:#fff;border:1px solid #e6eaf0;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -14px rgba(15,23,42,.10)}
.psec{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.num{font-variant-numeric:tabular-nums}
.ai{height:28px;padding:0 10px;border-radius:var(--radius-lg);border:1px solid #d9d2fb;background:linear-gradient(135deg,#f5f3ff,#eef6ff);color:#5b21b6;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;gap:6px;cursor:pointer;transition:box-shadow 200ms,border-color 200ms}
.ai:hover{border-color:#a78bfa;box-shadow:0 4px 12px -6px rgba(91,33,182,.5)}
.ai:focus-visible{outline:3px solid rgba(124,58,237,.4);outline-offset:2px}
.abtn{height:32px;padding:0 12px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;background:#fff;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#334155;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.abtn:hover{background:#f1f5f9}
.ptabs{display:flex;gap:2px;padding:0 16px;border-bottom:1px solid #e6eaf0}
.ptab{position:relative;height:52px;padding:0 12px;border:0;background:transparent;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer;display:inline-flex;align-items:center;gap:8px;white-space:nowrap}
.ptab:hover{color:#0f172a}.ptab.on{color:#003087;font-weight:var(--weight-medium)}
.ptab.on::after{content:"";position:absolute;left:8px;right:8px;bottom:-1px;height:2.5px;border-radius:3px 3px 0 0;background:#003087}
.pcnt{min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:#eef2f6;color:#475569;font-size:var(--text-xs);font-weight:var(--weight-medium);display:inline-flex;align-items:center;justify-content:center}
.ptab.on .pcnt{background:rgba(0,48,135,.1);color:#003087}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}

.tc{background:#fff;border:1px solid #e7ebf2;border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 12px 32px -20px rgba(15,23,42,.18)}
.ey{font-size:var(--text-xs);line-height:17px;font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ey-d{color:rgba(203,216,238,.7)}
.tn{font-variant-numeric:tabular-nums;font-feature-settings:"tnum" 1;letter-spacing:0}
.dl{display:inline-flex;align-items:center;gap:3px;height:22px;padding:0 8px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.hero{position:relative;overflow:hidden;border-radius:var(--radius-xl);background:#0b1733;color:#fff;padding:24px 26px;--accent-text:#7fcff0;--text-success:#6ee7b7;--text-warning:#fcd34d;--text-danger:#fda4af;--text-info:#7dd3fc}
.hero::before{content:"";position:absolute;inset:0;background-image:linear-gradient(rgba(255,255,255,.035) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.035) 1px,transparent 1px);background-size:32px 32px;pointer-events:none}
.hero>*{position:relative}
.ht{border-radius:var(--radius-xl);background:rgba(255,255,255,.055);border:1px solid rgba(255,255,255,.09);padding:14px 16px;display:flex;flex-direction:column;gap:6px;min-width:0}
.dseg{display:inline-flex;padding:3px;border-radius:var(--radius-full);background:rgba(255,255,255,.08);border:1px solid rgba(255,255,255,.1)}
.dseg button{height:32px;padding:0 14px;border:0;border-radius:var(--radius-full);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.lseg{display:inline-flex;padding:3px;border-radius:var(--radius-xl);background:#f1f4f9;border:1px solid #e7ebf2}
.lseg button{height:32px;padding:0 13px;border:0;border-radius:var(--radius-lg);font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer;transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease,box-shadow 200ms ease}
button:active,.btn:active,.abtn:active{transform:scale(.97)}
.btn,.abtn{transition:transform 160ms cubic-bezier(.23,1,.32,1),background-color 200ms ease}
.st>*{animation:taUp 420ms cubic-bezier(.23,1,.32,1) both}
.st>*:nth-child(2){animation-delay:40ms}.st>*:nth-child(3){animation-delay:80ms}.st>*:nth-child(4){animation-delay:120ms}.st>*:nth-child(5){animation-delay:160ms}.st>*:nth-child(6){animation-delay:200ms}.st>*:nth-child(7){animation-delay:240ms}.st>*:nth-child(8){animation-delay:280ms}
@keyframes taUp{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.gr{transform-origin:left center;animation:taGrow 700ms cubic-bezier(.23,1,.32,1) both}
@keyframes taGrow{from{transform:scaleX(.35);opacity:0}to{transform:none;opacity:1}}
.draw{stroke-dasharray:1600;stroke-dashoffset:0;animation:taDraw 1100ms cubic-bezier(.77,0,.175,1) both}
@keyframes taDraw{from{stroke-dashoffset:1600}to{stroke-dashoffset:0}}
.fadein{animation:taFade 600ms ease both 200ms}@keyframes taFade{from{opacity:0}to{opacity:1}}
.tt{position:relative}
.tt .tip{position:absolute;bottom:calc(100% + 8px);left:50%;transform:translate(-50%,4px) scale(.97);transform-origin:bottom center;opacity:0;pointer-events:none;transition:opacity 125ms ease-out,transform 125ms ease-out;background:#0b1733;color:#fff;border-radius:var(--radius-lg);padding:8px 10px;font-size:var(--text-xs);white-space:nowrap;box-shadow:0 10px 24px -8px rgba(15,23,42,.45);z-index:5}
.col{position:relative;flex:1;height:100%;border-radius:var(--radius-md);transition:background-color 150ms ease}
.col .tip{bottom:auto;top:6px}
.col .cl{position:absolute;top:0;bottom:0;left:50%;width:1px;background:rgba(15,23,42,.18);opacity:0;transition:opacity 125ms ease}
@media (hover:hover) and (pointer:fine){.tt:hover .tip,.col:hover .tip{opacity:1;transform:translate(-50%,0) scale(1)}.col:hover .cl{opacity:1}.row:hover{background:#f7f9fd}.tc.lift{transition:box-shadow 200ms ease,transform 200ms cubic-bezier(.23,1,.32,1)}.tc.lift:hover{box-shadow:0 1px 2px rgba(15,23,42,.05),0 18px 40px -20px rgba(15,23,42,.3)}}
.tb{width:100%;border-collapse:separate;border-spacing:0}
.tb th{font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted);text-align:left;padding:12px 16px;border-bottom:1px solid #eef1f6;background:#fbfcfe;white-space:nowrap}
.tb td{padding:13px 16px;border-bottom:1px solid #f1f4f8;font-size:var(--text-sm);vertical-align:middle}
.tb tr:last-child td{border-bottom:0}
.tb .r{text-align:right}
@media (prefers-reduced-motion:reduce){.st>*,.gr,.draw,.fadein{animation:none}}

.sec{display:flex;flex-direction:column;gap:14px;padding:20px 22px}
.h2{margin:0;font-size:var(--text-base);line-height:22px;font-weight:var(--weight-semibold);color:#0f172a;letter-spacing:0}
.sub{margin:2px 0 0;font-size:var(--text-xs-plus);line-height:18px;color:var(--text-muted)}
.row2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.chk{display:flex;align-items:center;gap:14px;padding:12px 16px;border-bottom:1px solid #f1f4f8}
.chk:last-child{border-bottom:0}
.pill{display:inline-flex;align-items:center;height:24px;padding:0 9px;border-radius:var(--radius-full);background:#f1f4f9;font-size:var(--text-xs);color:#334155;white-space:nowrap}
.amt{height:36px;padding:0 16px;border-radius:var(--radius-lg);border:1px solid #cbd5e1;background:#fff;font:inherit;font-size:var(--text-sm);font-weight:var(--weight-medium);color:#1e293b;cursor:pointer;font-variant-numeric:tabular-nums}
.amt.on{border-color:#003087;background:rgba(0,48,135,.06);color:#003087}
.amt:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.stp2{display:inline-flex;align-items:center;border:1px solid #cbd5e1;border-radius:var(--radius-lg);overflow:hidden;height:40px}
.stp2 button{width:38px;height:100%;border:0;background:#f8fafc;font:inherit;font-size:var(--text-base);cursor:pointer;color:#334155}
.stp2 span{min-width:64px;text-align:center;font-size:var(--text-sm);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.sel{height:44px;padding:0 12px;border:1px solid #cbd5e1;border-radius:var(--radius-lg);background:#fff;font:inherit;font-size:var(--text-sm);color:#1e293b;width:100%}
.msgb{max-width:78%;padding:10px 14px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}
.code{margin:0;padding:12px 14px;border-radius:var(--radius-lg);background:#0b1733;color:#cbd8ee;font-size:var(--text-xs);line-height:18px;white-space:pre-wrap;--text-muted:#94a3b8}
.lrow{display:flex;align-items:center;gap:12px;width:100%;padding:12px 16px;border:0;border-bottom:1px solid #f1f4f8;background:transparent;font:inherit;text-align:left;cursor:pointer}
.lrow:hover{background:#f7f9fd}.lrow.on{background:rgba(0,48,135,.05)}
.lrow:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
`;

// ---- markup ----

export default class WooSyncScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="WooSync">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="storefront-wp" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Storefront" page="WordPress sync" placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <section className="hero st">
                <div style={{ display: "flex", alignItems: "flex-start", gap: "20px" }}>
                  <div style={{ flexGrow: "1", minWidth: "0" }}>
                    <div className="ey ey-d">Storefront · WordPress sync</div>
                    <h1 style={{ margin: "6px 0 0", fontSize: "var(--text-2xl)", lineHeight: "32px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>{v.headline}</h1>
                    <p style={{ margin: "6px 0 0", fontSize: "var(--text-sm)", lineHeight: "20px", color: "rgba(226,232,240,.78)", maxWidth: "680px" }}>Two-way sync with a WooCommerce store over its API. A change on either side appears on the other, and products, orders and blog posts can be edited here as if in WordPress.</p>
                  </div>
                  <__Link href="/blog-posts" className="btn sm" style={{ background: "#fff", color: "#0b1733", height: "38px", flexShrink: "0" }}>Blog posts</__Link>
                </div>
                <div className="st gc-cols-4" style={{ display: "grid", gridTemplateColumns: "repeat(4, minmax(0, 1fr))", gap: "10px", marginTop: "20px" }}>
                  {__list(v.tiles).map((ht, $index) => (<React.Fragment key={$index}>
                      <div className="ht">
                        <div style={{ display: "flex", alignItems: "center", gap: "6px" }}>
                          <span style={__sx(`width: 7px; height: 7px; border-radius: var(--radius-full); background: ${ht?.c ?? ""};`)} />
                          <span style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.85)" }}>{ht?.l}</span>
                        </div>
                        <div className="tn" style={{ fontSize: "var(--text-2xl)", lineHeight: "30px", fontWeight: "var(--weight-semibold)", color: "#fff" }}>{ht?.v}</div>
                        <div style={{ fontSize: "var(--text-xs)", color: "rgba(203,216,238,.7)" }}>{ht?.s}</div>
                      </div>
                    </React.Fragment>))}
                </div>
              </section>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <section className="tc sec">
                <div>
                  <h2 className="h2">How the connection works</h2>
                  <p className="sub">No plugin to install. Two API keys from WordPress are enough.</p>
                </div>
                <ol style={{ margin: "0", padding: "0", listStyle: "none", display: "grid", gridTemplateColumns: "repeat(5, minmax(0, 1fr))", gap: "10px" }}>
                  {__list(v.flow).map((fl, $index) => (<React.Fragment key={$index}>
                      <li style={__sx(`display: flex; flex-direction: column; gap: 6px; padding: 14px; border-radius: var(--radius-xl); border: 1px solid ${fl?.bd ?? ""}; background: ${fl?.bg ?? ""};`)}>
                        <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                          <span style={__sx(`width: 24px; height: 24px; border-radius: var(--radius-full); display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium); background: ${fl?.nb ?? ""}; color: ${fl?.nf ?? ""};`)}>{fl?.n}</span>
                          <span style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{fl?.t}</span>
                        </span>
                        <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "#475569" }}>{fl?.d}</span>
                      </li>
                    </React.Fragment>))}
                </ol>
              </section>
              <div className="gc-split" style={{ display: "grid", gridTemplateColumns: "minmax(0, 1fr) 400px", gap: "16px", alignItems: "start" }}>
                <div style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">API keys</h2>
                      <p className="sub">WooCommerce: Settings, Advanced, REST API, Add key, Read/Write. WordPress: Users, Profile, Application passwords.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                      <label className="lbl" htmlFor="url">Store address</label>
                      <div style={{ position: "relative" }}>
                        <input id="url" className="inp mono" type={v.f_url?.type} autoComplete="off" placeholder="https://yourstore.com" value={v.f_url?.v} onChange={v.f_url?.onC} style={__sx(`border-color: ${v.f_url?.bd ?? ""};`)} />
                      </div>
                      <span style={__sx(`font-size: var(--text-xs); color: ${v.f_url?.nc ?? ""};`)}>{v.f_url?.note}</span>
                    </div>
                    <div className="row2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="ck">WooCommerce consumer key</label>
                        <div style={{ position: "relative" }}>
                          <input id="ck" className="inp mono" type={v.f_ck?.type} autoComplete="off" placeholder="ck_…" value={v.f_ck?.v} onChange={v.f_ck?.onC} style={__sx(`border-color: ${v.f_ck?.bd ?? ""};`)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs); color: ${v.f_ck?.nc ?? ""};`)}>{v.f_ck?.note}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="cs">WooCommerce consumer secret</label>
                        <div style={{ position: "relative" }}>
                          <input id="cs" className="inp mono" type={v.f_cs?.type} autoComplete="off" placeholder="cs_…" value={v.f_cs?.v} onChange={v.f_cs?.onC} style={__sx(`border-color: ${v.f_cs?.bd ?? ""}; padding-right: 52px;`)} />
                          <button type="button" className="ib" onClick={v.f_cs?.toggle} aria-label={v.f_cs?.aria} style={{ position: "absolute", right: "2px", top: "2px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                        <span style={__sx(`font-size: var(--text-xs); color: ${v.f_cs?.nc ?? ""};`)}>{v.f_cs?.note}</span>
                      </div>
                    </div>
                    <div className="row2">
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="wpu">WordPress username</label>
                        <div style={{ position: "relative" }}>
                          <input id="wpu" className="inp mono" type={v.f_wpu?.type} autoComplete="off" placeholder="admin user" value={v.f_wpu?.v} onChange={v.f_wpu?.onC} style={__sx(`border-color: ${v.f_wpu?.bd ?? ""};`)} />
                        </div>
                        <span style={__sx(`font-size: var(--text-xs); color: ${v.f_wpu?.nc ?? ""};`)}>{v.f_wpu?.note}</span>
                      </div>
                      <div style={{ display: "flex", flexDirection: "column", gap: "8px", minWidth: "0" }}>
                        <label className="lbl" htmlFor="ap">Application password</label>
                        <div style={{ position: "relative" }}>
                          <input id="ap" className="inp mono" type={v.f_ap?.type} autoComplete="off" placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" value={v.f_ap?.v} onChange={v.f_ap?.onC} style={__sx(`border-color: ${v.f_ap?.bd ?? ""}; padding-right: 52px;`)} />
                          <button type="button" className="ib" onClick={v.f_ap?.toggle} aria-label={v.f_ap?.aria} style={{ position: "absolute", right: "2px", top: "2px" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12Z" />
                              <circle cx="12" cy="12" r="3" />
                            </svg>
                          </button>
                        </div>
                        <span style={__sx(`font-size: var(--text-xs); color: ${v.f_ap?.nc ?? ""};`)}>{v.f_ap?.note}</span>
                      </div>
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                      <button type="button" className="btn solid sm" onClick={v.testConn}>Test connection</button>
                      <span style={__sx(`font-size: var(--text-xs-plus); color: ${v.connC ?? ""};`)}>{v.connNote}</span>
                    </div>
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "18px 20px 12px" }}>
                      <h2 className="h2">What syncs</h2>
                      <p className="sub">Both directions for everything that is on. If both sides change the same item, the latest change wins and the older version is kept in history.</p>
                    </div>
                    <div className="gc-table-wrap">
                      <table className="tb">
                        <thead>
                          <tr>
                            <th>Data</th>
                            <th>How fast</th>
                            <th className="r">Items</th>
                            <th>Last change</th>
                            <th style={{ textAlign: "center" }}>Sync</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.what).map((w, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td>
                                  <div style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{w?.n}</div>
                                  <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{w?.d}</div>
                                </td>
                                <td style={{ color: "#475569" }}>{w?.how}</td>
                                <td className="r tn">{w?.c}</td>
                                <td style={{ color: "#475569", whiteSpace: "nowrap" }}>{w?.l}</td>
                                <td style={{ textAlign: "center" }}>
                                  <button type="button" className={w?.cls} role="switch" aria-checked={w?.on} aria-label={`Sync ${w?.n ?? ""}`} onClick={w?.toggle} />
                                </td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "18px 20px 12px" }}>
                      <h2 className="h2">Order status mapping</h2>
                      <p className="sub">WooCommerce has fewer order statuses. The GridCommerce status is also written as an order note, so nothing is lost.</p>
                    </div>
                    <div className="gc-table-wrap">
                      <table className="tb">
                        <thead>
                          <tr>
                            <th>GridCommerce status</th>
                            <th>Shows in WooCommerce as</th>
                            <th>From WooCommerce</th>
                          </tr>
                        </thead>
                        <tbody>
                          {__list(v.map).map((m, $index) => (<React.Fragment key={$index}>
                              <tr className="row">
                                <td style={{ fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{m?.g}</td>
                                <td>
                                  <span className="pill mono">{m?.w}</span>
                                </td>
                                <td style={{ color: "#475569" }}>{m?.b}</td>
                              </tr>
                            </React.Fragment>))}
                        </tbody>
                      </table>
                    </div>
                  </section>
                </div>
                <aside style={{ display: "flex", flexDirection: "column", gap: "16px", minWidth: "0" }}>
                  <section className="tc sec">
                    <div>
                      <h2 className="h2">Matching rules</h2>
                      <p className="sub">Used on the first import and for new items.</p>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", borderTop: "1px solid #f1f4f8" }}>
                      {__list(v.rules).map((r, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", flexDirection: "column", gap: "2px", padding: "9px 0", borderBottom: "1px solid #f1f4f8" }}>
                            <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{r?.t}</span>
                            <span style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{r?.d}</span>
                          </div>
                        </React.Fragment>))}
                    </div>
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px 10px", display: "flex", alignItems: "center", gap: "10px" }}>
                      <h2 className="h2" style={{ flexGrow: "1" }}>Needs attention</h2>
                      <span className="badge b-partial">{v.issueCount}</span>
                    </div>
                    {__list(v.issues).map((i, $index) => (<React.Fragment key={$index}>
                        <div className="chk">
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>{i?.t}</div>
                            <div style={{ fontSize: "var(--text-xs)", lineHeight: "17px", color: "var(--text-muted)" }}>{i?.d}</div>
                          </div>
                          <button type="button" className="abtn" onClick={i?.fix}>{i?.b}</button>
                        </div>
                      </React.Fragment>))}
                    {v.noIssues ? (<>
                      <div style={{ padding: "0 18px 16px", fontSize: "var(--text-xs-plus)", color: "#047857" }}>Everything is in sync.</div>
                    </>) : null}
                  </section>
                  <section className="tc" style={{ overflow: "hidden" }}>
                    <div style={{ padding: "16px 18px 10px" }}>
                      <h2 className="h2">Latest changes</h2>
                    </div>
                    {__list(v.log).map((g, $index) => (<React.Fragment key={$index}>
                        <div className="chk" style={{ gap: "10px", padding: "10px 18px" }}>
                          <span className="pill" style={__sx(`background: ${g?.bg ?? ""}; color: ${g?.fg ?? ""};`)}>{g?.dir}</span>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-xs-plus)", color: "#0f172a", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>{g?.t}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{g?.w}</div>
                          </div>
                        </div>
                      </React.Fragment>))}
                  </section>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
