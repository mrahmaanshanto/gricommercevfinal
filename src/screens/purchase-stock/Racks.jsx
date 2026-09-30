'use client';
// Generated from design/templates/purchase-stock/Racks.dc.html by scripts/convert-design.mjs.
// Racks & bins — Stocks & Inventory — Racks & bins.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function pTabs(self, list, cur, key, counts) { return mkTabs(self, list, cur, key, counts).map(function (x) { x.pcls = x.on ? 'ptab on' : 'ptab'; return x; }); }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { clearTimeout(self.t); self.setState({ msg: m, bad: !!bad }); self.t = setTimeout(function () { self.setState({ msg: '' }); }, 2800); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
var PRODS = [['Sunscreen SPF50 50ml', 'S'], ['Toner 150ml', 'T'], ['Vitamin C Serum 30ml', 'V'], ['Mango Pickle 400g', 'M'], ['Milk Biscuits 200g', 'B'], ['Galaxy A55 5G', 'G'], ['Redmi Note 13', 'R'], ['Bluetooth speaker', 'P'], ['Honey 500g', 'H'], ['Ghee 400g', 'E'], ['Chanachur 250g', 'C'], ['Cotton kurti', 'K']];
var ZN = { A: 'Storage A', B: 'Storage B', C: 'Cold room', D: 'Dispatch' };
var CFG = { cw: { code: 'CW', n: 'Central Warehouse', aisles: ['A', 'B', 'C', 'D'] }, ctg: { code: 'CH', n: 'Chattogram hub', aisles: ['A', 'B'] } };
function fillOf(seed) { var x = (seed * 37 + 11) % 100; return x < 12 ? 0 : x; }
// Blocked bins are striped and full bins carry a dot, so the states read without colour.
var STRIPES = 'repeating-linear-gradient(45deg, #b91c1c 0 2px, #fee2e2 2px 6px)';
var BIN_BORDER = '#7b8ba1';
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var wh = s.wh || 'cw', C = CFG[wh], q = (s.q || '').toLowerCase().trim(), selB = s.bin || C.code + '-A-03-2-B', blocked = s.blocked || {};
    var binInfo = function (a, r, sh, b) { var seed = a.charCodeAt(0) * 131 + r * 17 + sh * 5 + b.charCodeAt(0) + (wh === 'ctg' ? 7 : 0); var f = fillOf(seed); var items = []; if (f) { items.push(PRODS[seed % PRODS.length]); if (f > 60) items.push(PRODS[(seed * 3) % PRODS.length]); } return { f: f, items: items }; };
    var hits = 0;
    // Arrow-key map: MAP[aisle][shelf row][column] = bin code, POS[code] = [aisle, row, column].
    var MAP = [], POS = {};
    var fb = s.fb && s.fb.indexOf(C.code + '-') === 0 ? s.fb : selB;
    var aisles = C.aisles.map(function (a, ai) { MAP[ai] = [[], [], [], []]; return { a: a, racks: [1, 2, 3, 4, 5, 6].map(function (r) { var rn = (r < 10 ? '0' : '') + r; var bins = [];
      for (var sh = 4; sh >= 1; sh--) ['A', 'B', 'C'].forEach(function (b, bi) { var code = C.code + '-' + a + '-' + rn + '-' + sh + '-' + b; var inf = binInfo(a, r, sh, b); var hit = q && inf.items.some(function (p) { return p[0].toLowerCase().indexOf(q) >= 0; }); if (hit) hits++; var isSel = code === selB; var bl = blocked[code];
        var c = bl ? STRIPES : inf.f === 0 ? '#ffffff' : inf.f < 50 ? '#bfdbfe' : inf.f < 90 ? '#60a5fa' : '#1d4ed8';
        var row = 4 - sh, col = (r - 1) * 3 + bi; MAP[ai][row][col] = code; POS[code] = [ai, row, col];
        var full = !bl && inf.f >= 90;
        var label = 'Bin ' + code + ', ' + (bl ? 'blocked, ' : '') + (inf.f === 0 ? 'empty' : inf.f + '% full') + (hit ? ', has the product you searched' : '');
        bins.push({ code: code, label: label, sel: isSel, full: full, hit: !!hit, tab: code === fb ? 0 : -1, c: bl ? c : hit ? '#f59e0b' : c, bd: isSel ? '#0b1733' : hit ? '#7c2d12' : BIN_BORDER, bw: isSel || hit ? '2px' : '1px', sh: isSel ? '0 0 0 2px rgba(11,23,51,.28)' : hit ? 'inset 0 0 0 2px #fff' : 'none', dot: hit ? '#0b1733' : '#fff', pick: function () { self.setState({ bin: code, fb: code }); } }); });
      return { n: a + '-' + rn, z: ZN[a] ? ZN[a].replace('Storage ', '') : '', bins: bins }; }) }; });
    var parts = selB.split('-'); var sinf = binInfo(parts[1], +parts[2], +parts[3], parts[4]);
    var bA = s.bA != null ? s.bA : 'E', bR = s.bR != null ? s.bR : '6', bS = s.bS != null ? s.bS : '4', bB = s.bB != null ? s.bB : '3';
    var tot = (+bR || 0) * (+bS || 0) * (+bB || 0), last = String.fromCharCode(64 + Math.max(1, Math.min(26, +bB || 1)));
    var ty = function (k) { return function (e) { var p = {}; p[k] = e.target.value; self.setState(p); }; };
    var v = {
      printAll: function () { toast(self, (C.aisles.length * 72) + ' bin labels sent to the label printer.'); },
      openBulk: function () { self.setState({ bulk: true }); }, closeBulk: function () { self.setState({ bulk: false }); }, bulkOn: !!s.bulk,
      bA: bA, bR: bR, bS: bS, bB: bB, typeA: ty('bA'), typeR: ty('bR'), typeS: ty('bS'), typeB: ty('bB'), bTotal: tot,
      bFirst: C.code + '-' + String(bA).toUpperCase() + '-01-1-A', bLast: C.code + '-' + String(bA).toUpperCase() + '-' + ((+bR || 1) < 10 ? '0' : '') + (+bR || 1) + '-' + (+bS || 1) + '-' + last,
      saveBulk: function () { self.setState({ bulk: false }); toast(self, tot + ' bins created in aisle ' + String(bA).toUpperCase() + '. Labels are printing.'); },
      whOpts: segv(self, [['cw', 'Central Warehouse'], ['ctg', 'Chattogram hub']], wh, 'wh').map(function (o, i) { var k = i ? 'ctg' : 'cw'; o.pick = function () { self.setState({ wh: k, bin: CFG[k].code + '-A-03-2-B', fb: null }); }; return o; }),
      q: s.q || '', typeQ: function (e) { self.setState({ q: e.target.value }); }, found: q ? (hits ? 'Found in ' + hits + ' bins — shown in orange' : 'Not in any bin here') : '',
      legend: [['Empty', '#ffffff'], ['Under half', '#bfdbfe'], ['Half to full', '#60a5fa'], ['Full', '#1d4ed8', 1], ['Blocked', STRIPES]].map(function (x) { return { l: x[0], c: x[1], b: BIN_BORDER, full: !!x[2] }; }),
      // Arrow keys move the focus between bins (left/right along the shelf, up/down between shelves and aisles).
      binKey: function (e) { var t = e.target && e.target.closest ? e.target.closest('[data-bin]') : null; if (!t) return; var at = POS[t.getAttribute('data-bin')]; if (!at) return;
        var ai = at[0], row = at[1], col = at[2], k = e.key;
        if (k === 'ArrowRight') col++; else if (k === 'ArrowLeft') col--; else if (k === 'ArrowDown') row++; else if (k === 'ArrowUp') row--; else if (k === 'Home') col = 0; else if (k === 'End') col = 17; else return;
        if (row > 3) { ai++; row = 0; } else if (row < 0) { ai--; row = 3; }
        e.preventDefault();
        var code = MAP[ai] && MAP[ai][row] ? MAP[ai][row][col] : null; if (!code) return;
        self.setState({ fb: code }, function () { var el = document.querySelector('[data-bin="' + code + '"]'); if (el) el.focus(); }); },
      aisles: aisles,
      bCode: selB, bWhere: C.n + ' · ' + (ZN[parts[1]] || 'Storage') + ' · aisle ' + parts[1] + ', rack ' + parts[2] + ', shelf ' + parts[3],
      bFill: blocked[selB] ? 'Blocked · ' + sinf.f + '%' : sinf.f + '%', bBlocked: !!blocked[selB], bFillW: sinf.f + '%', bFillC: sinf.f >= 90 ? '#1d4ed8' : '#60a5fa',
      bItems: sinf.items.map(function (p, i) { return { n: p[0], i: p[1], q: Math.max(1, Math.round(sinf.f * .4 / sinf.items.length)) + ' pcs', m: 'Batch B-0' + (900 + i * 12) + ' · SKU ' + p[1] + '-' + (1040 + i) }; }), bEmpty: !sinf.items.length,
      bCount: '12 Sep 2026 by Tareq Aziz',
      move: function () { toast(self, 'Scan the new bin — stock moves and the bin map updates.'); }, count: function () { toast(self, 'Count started for ' + selB + '.'); }, printOne: function () { toast(self, 'Label ' + selB + ' sent to the printer.'); },
      blockL: blocked[selB] ? 'Unblock bin' : 'Block bin',
      block: function () { var code = selB, was = !!blocked[code];
        var put = function (on) { self.setState(function (p) { var n = assign({}, (p && p.blocked) || {}); n[code] = on; return { blocked: n }; }); };
        if (was) { put(false); __toast(code + ' can be used again.', { undo: function () { put(true); } }); return; }
        __confirm({ title: 'Block bin ' + code + '?', body: 'Nothing can be put away or picked here until you unblock it.' + (sinf.items.length ? ' The stock already in the bin stays where it is.' : ''), confirmLabel: 'Block bin', tone: 'danger' }).then(function (ok) { if (!ok) return; put(true); __toast(code + ' blocked. Nothing can be put away or picked here.', { undo: function () { put(false); } }); }); }
    };
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
.bin{position:relative;width:24px;height:24px;padding:0;border-radius:var(--radius-sm);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;flex:none}
.bin:hover{filter:brightness(.94)}
.bin:focus-visible{outline:3px solid rgba(0,48,135,.6);outline-offset:2px;z-index:1}
.bindot{width:8px;height:8px;border-radius:var(--radius-full);pointer-events:none}
.rackgrid{display:grid;grid-template-columns:repeat(3,24px);gap:4px;justify-content:center}
.aislegrid{flex:1 1 0;min-width:0;display:flex;flex-wrap:wrap;gap:8px}
.rackcard{flex:1 0 94px;border-radius:var(--radius-lg);border:1px solid #e2e8f0;padding:6px;background:#fbfcfe}
.thumb{width:44px;height:44px;flex-shrink:0;border-radius:var(--radius-lg);border:1px solid #e6eaf0;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);color:#003087}
`;

// ---- markup ----

export default class RacksScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Racks">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-racks" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb={"Stocks & Inventory"} page={"Racks & bins"} placeholder="Search product, SKU, rack or bin" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title={"Racks & bins"} />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Every rack has shelves, every shelf has bins. Each bin has a code and a barcode, so staff know exactly where to put and pick. <b>CW-A-03-2-B</b> = warehouse · aisle · rack · shelf · bin.</div>
                <button type="button" className="btn line" onClick={v.printAll}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                    <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                    <rect x="6" y="14" width="12" height="8" rx="1" />
                  </svg>
                  <span>Print bin labels</span>
                </button>
                <button type="button" className="btn solid" onClick={v.openBulk}>
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add racks</span>
                </button>
              </div>
              {v.hasMsg ? (<>
                <div className="fade" role="status" style={__sx(`display: flex; align-items: center; gap: 12px; padding: 12px 16px; border-radius: var(--radius-lg); background: ${v.msgBg ?? ""}; color: ${v.msgFg ?? ""}; font-size: var(--text-sm); font-weight: var(--weight-medium);`)}>
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <circle cx="12" cy="12" r="10" />
                    <path d="m9 12 2 2 4-4" />
                  </svg>
                  <span>{v.msg}</span>
                </div>
              </>) : null}
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
                <div role="group" aria-label="Warehouse" style={{ display: "inline-flex", padding: "3px", borderRadius: "var(--radius-full)", background: "#eef2f6" }}>
                  {__list(v.whOpts).map((wo, $index) => (<React.Fragment key={$index}>
                      <button type="button" onClick={wo?.pick} aria-pressed={wo?.on} style={__sx(`height: 34px; padding: 0 16px; border: 0; border-radius: var(--radius-full); font: inherit; font-size: var(--text-xs-plus); font-weight: var(--weight-medium); cursor: pointer; background: ${wo?.bg ?? ""}; color: ${wo?.fg ?? ""};`)}>{wo?.l}</button>
                    </React.Fragment>))}
                </div>
                <label style={{ position: "relative", flexGrow: "1", display: "block", maxWidth: "460px", minWidth: "240px" }}>
                  <span style={{ position: "absolute", left: "14px", top: "11px", color: "var(--text-muted)" }}>
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="11" cy="11" r="8" />
                      <path d="m21 21-4.3-4.3" />
                    </svg>
                  </span>
                  <input className="inp" value={v.q} onInput={v.typeQ} onChange={v.typeQ} placeholder="Where is it? Type a product — e.g. Sunscreen" aria-label="Find product" style={{ paddingLeft: "44px" }} />
                </label>
                <span role="status" style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{v.found}</span>
                <span style={{ flexGrow: "1" }} />
                <span className="sr-only">Legend:</span>
                {__list(v.legend).map((lg, $index) => (<React.Fragment key={$index}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", fontSize: "var(--text-xs)", color: "#475569", whiteSpace: "nowrap" }}><span aria-hidden="true" style={__sx(`width: 16px; height: 16px; flex: none; border-radius: var(--radius-sm); background: ${lg?.c ?? ""}; border: 1px solid ${lg?.b ?? ""}; display: inline-flex; align-items: center; justify-content: center;`)}>{lg?.full ? (<span className="bindot" style={{ width: "6px", height: "6px", background: "#fff" }} />) : null}</span>{lg?.l}</span>
                  </React.Fragment>))}
              </div>
              {v.bulkOn ? (<>
                <section className="pcard fade" style={{ padding: "20px 22px", display: "flex", flexDirection: "column", gap: "14px", border: "1.5px solid #003087" }}>
                  <div style={{ display: "flex", alignItems: "center" }}>
                    <h2 style={{ margin: "0", fontSize: "var(--text-base)", flexGrow: "1" }}>Add racks in one go</h2>
                    <button type="button" className="ib" onClick={v.closeBulk} aria-label="Close">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M18 6 6 18" />
                        <path d="m6 6 12 12" />
                      </svg>
                    </button>
                  </div>
                  <div className="gc-cols-6" style={{ display: "grid", gridTemplateColumns: "repeat(6, minmax(0, 1fr))", gap: "12px" }}>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Zone</span>
                      <select className="inp" aria-label="Zone" style={{ width: "100%" }}>
                        <option>Storage B</option>
                        <option>Storage A</option>
                        <option>Cold room</option>
                        <option>Dispatch</option>
                      </select>
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Aisle</span>
                      <input className="inp" value={v.bA} onInput={v.typeA} onChange={v.typeA} aria-label="Aisle" style={{ textTransform: "uppercase" }} />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Racks</span>
                      <input className="inp num" value={v.bR} onInput={v.typeR} onChange={v.typeR} aria-label="Racks" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Shelves per rack</span>
                      <input className="inp num" value={v.bS} onInput={v.typeS} onChange={v.typeS} aria-label="Shelves per rack" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Bins per shelf</span>
                      <input className="inp num" value={v.bB} onInput={v.typeB} onChange={v.typeB} aria-label="Bins per shelf" />
                    </label>
                    <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <span className="lbl">Each bin holds</span>
                      <input className="inp" defaultValue="40 units" aria-label="Each bin holds" />
                    </label>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "12px 14px", borderRadius: "var(--radius-xl)", background: "#f5f8ff", fontSize: "var(--text-sm)" }}>
                    <span style={{ flexGrow: "1" }}>Creates <b>{v.bTotal}</b> bins: <span className="mono">{v.bFirst}</span> to <span className="mono">{v.bLast}</span></span>
                    <button type="button" className="btn solid sm" onClick={v.saveBulk}>Create and print labels</button>
                  </div>
                </section>
              </>) : null}
              <div style={{ display: "flex", gap: "18px", alignItems: "flex-start" }}>
                <section className="pcard" role="group" aria-label="Bin map. Arrow keys move between bins, Enter opens one." onKeyDown={v.binKey} style={{ padding: "18px", display: "flex", flexDirection: "column", gap: "16px", flexGrow: "1", minWidth: "0" }}>
                  {__list(v.aisles).map((ai, $index) => (<React.Fragment key={$index}>
                      <div style={{ display: "flex", gap: "12px", alignItems: "stretch" }}>
                        <div className="gc-on-dark" style={{ width: "58px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#0b1733", color: "#fff", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>Aisle</span>
                          <span style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)" }}>{ai?.a}</span>
                        </div>
                        <div className="aislegrid">
                          {__list(ai?.racks).map((rk, $index) => (<React.Fragment key={$index}>
                              <div className="rackcard">
                                <div style={{ display: "flex", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "#334155", marginBottom: "4px" }}>
                                  <span style={{ flexGrow: "1" }}>{rk?.n}</span>
                                  <span style={{ color: "var(--text-muted)", fontWeight: "var(--weight-medium)" }}>{rk?.z}</span>
                                </div>
                                <div className="rackgrid">
                                  {__list(rk?.bins).map((bn, $index) => (<React.Fragment key={$index}>
                                      <button type="button" className="bin" data-bin={bn?.code} tabIndex={bn?.tab} onClick={bn?.pick} aria-label={bn?.label} title={bn?.label} aria-pressed={bn?.sel} style={__sx(`border: ${bn?.bw ?? ""} solid ${bn?.bd ?? ""}; background: ${bn?.c ?? ""}; box-shadow: ${bn?.sh ?? ""};`)}>{bn?.full ? (<span className="bindot" style={__sx(`background: ${bn?.dot ?? ""};`)} />) : null}</button>
                                    </React.Fragment>))}
                                </div>
                              </div>
                            </React.Fragment>))}
                        </div>
                      </div>
                    </React.Fragment>))}
                  <div style={{ display: "flex", alignItems: "center", gap: "10px", paddingTop: "4px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "var(--radius-lg)", background: "#f1f5f9" }}>Receiving<__Icon name="arrow-right" width="14" height="14" aria-hidden="true" /></span>
                    <span style={{ flexGrow: "1", height: "1px", background: "#e2e8f0" }} />
                    <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "6px 10px", borderRadius: "var(--radius-lg)", background: "#f1f5f9" }}><__Icon name="arrow-right" width="14" height="14" aria-hidden="true" />Dispatch</span>
                  </div>
                </section>
                <aside className="pcard gc-side" aria-label="Selected bin" style={{ width: "360px", flexShrink: "0", overflow: "hidden", alignSelf: "flex-start" }}>
                  <div className="gc-on-dark" style={{ padding: "16px 18px", background: "#0b1733", color: "#fff" }}>
                    <div style={{ fontSize: "var(--text-xs)", opacity: ".7" }}>Bin</div>
                    <div className="mono" style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", letterSpacing: ".04em" }}>{v.bCode}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", opacity: ".8" }}>{v.bWhere}</div>
                  </div>
                  <div style={{ padding: "16px 18px", display: "flex", flexDirection: "column", gap: "14px" }}>
                    <div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontSize: "var(--text-xs-plus)", marginBottom: "6px" }}>
                        <span>Filled</span>
                        <b>{v.bFill}</b>
                      </div>
                      <div style={{ height: "10px", borderRadius: "var(--radius-full)", background: "#eef2f6", overflow: "hidden" }}>
                        <div style={__sx(`width: ${v.bFillW ?? ""}; height: 100%; background: ${v.bBlocked ? STRIPES : (v.bFillC ?? "")};`)} />
                      </div>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                      {__list(v.bItems).map((bi, $index) => (<React.Fragment key={$index}>
                          <div style={{ display: "flex", gap: "10px", padding: "10px", borderRadius: "var(--radius-xl)", border: "1px solid #eef2f6" }}>
                            <span className="thumb" style={{ width: "38px", height: "38px", background: "#f1f5f9" }}>{bi?.i}</span>
                            <div style={{ flexGrow: "1", minWidth: "0" }}>
                              <div style={{ fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)" }}>{bi?.n}</div>
                              <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{bi?.m}</div>
                            </div>
                            <span className="num" style={{ fontWeight: "var(--weight-semibold)" }}>{bi?.q}</span>
                          </div>
                        </React.Fragment>))}
                      {v.bEmpty ? (<>
                        <div style={{ padding: "14px", borderRadius: "var(--radius-xl)", background: "#f8fafc", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)", textAlign: "center" }}>Empty — ready for put-away.</div>
                      </>) : null}
                    </div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>Last counted {v.bCount} · holds up to 40 units</div>
                    <div style={{ display: "flex", justifyContent: "center", padding: "12px", borderRadius: "var(--radius-xl)", border: "1px dashed #cbd5e1" }}>
                      <svg width="220" height="48" viewBox="0 0 220 48" aria-hidden="true">
                        <rect x="0" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="5" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="9" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="14" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="16" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="20" y="0" width="3" height="48" fill="#0f172a" />
                        <rect x="26" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="28" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="32" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="34" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="37" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="41" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="46" y="0" width="3" height="48" fill="#0f172a" />
                        <rect x="50" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="53" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="56" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="58" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="60" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="63" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="67" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="72" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="76" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="79" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="82" y="0" width="3" height="48" fill="#0f172a" />
                        <rect x="86" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="90" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="95" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="98" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="100" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="104" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="106" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="109" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="112" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="115" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="117" y="0" width="3" height="48" fill="#0f172a" />
                        <rect x="121" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="123" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="126" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="130" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="133" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="136" y="0" width="3" height="48" fill="#0f172a" />
                        <rect x="141" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="143" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="146" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="149" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="151" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="153" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="155" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="159" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="163" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="166" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="169" y="0" width="3" height="48" fill="#0f172a" />
                        <rect x="173" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="177" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="180" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="183" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="186" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="190" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="192" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="195" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="200" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="202" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="204" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="208" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="212" y="0" width="1" height="48" fill="#0f172a" />
                        <rect x="215" y="0" width="2" height="48" fill="#0f172a" />
                        <rect x="218" y="0" width="1" height="48" fill="#0f172a" />
                      </svg>
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                      <button type="button" className="btn line sm" onClick={v.move}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M8 3 4 7l4 4" />
                          <path d="M4 7h16" />
                          <path d="m16 21 4-4-4-4" />
                          <path d="M20 17H4" />
                        </svg>
                        <span>Move stock</span>
                      </button>
                      <button type="button" className="btn line sm" onClick={v.count}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="8" height="4" x="8" y="2" rx="1" />
                          <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                          <path d="m9 14 2 2 4-4" />
                        </svg>
                        <span>Count bin</span>
                      </button>
                      <button type="button" className="btn line sm" onClick={v.printOne}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                          <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                          <rect x="6" y="14" width="12" height="8" rx="1" />
                        </svg>
                        <span>Print label</span>
                      </button>
                      <button type="button" className="btn line sm" onClick={v.block}>
                        <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="m4.9 4.9 14.2 14.2" />
                        </svg>
                        <span>{v.blockL}</span>
                      </button>
                    </div>
                  </div>
                </aside>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
