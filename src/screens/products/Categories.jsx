'use client';
// Generated from design/templates/products/Categories.dc.html by scripts/convert-design.mjs.
// Categories — Products — Categories.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader, Dialog as __Dialog, EmptyState as __EmptyState } from '@/components/ui';
import { toast as __toast } from '@/runtime/ui';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function mkChips(self, list, cur, key) { return list.map(function (x) { var on = x.k === cur; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
var CHN = { sms: ['SMS', '#e7f8f1', '#047857'], wa: ['WhatsApp', '#dcfce7', '#166534'], email: ['Email', '#e0f2fe', '#075985'] };
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function toast(self, m, bad) { __toast(m, bad ? { tone: 'error' } : undefined); }
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? '#fff4e0' : '#e7f8f1', msgFg: s.bad ? '#7a3b04' : '#065f46' }; }
function mkSw(self, key, def) { var s = self.state || {}; var on = s[key] == null ? def : s[key]; return { on: on, cls: on ? 'sw on' : 'sw', toggle: function () { var p = {}; p[key] = !on; self.setState(p); } }; }
function stepN(self, key, def, step, min, max) { var s = self.state || {}; var v = s[key] == null ? def : s[key]; return { v: v, dec: function () { var p = {}; p[key] = Math.max(min, +(v - step).toFixed(2)); self.setState(p); }, inc: function () { var p = {}; p[key] = Math.min(max, +(v + step).toFixed(2)); self.setState(p); } }; }
var T = [
  { id: 'skin', name: 'Skin care', lv: 0, n: 64, kids: ['sun', 'ton', 'cle', 'ser'], tax: 'Standard VAT 15%', wp: 'No warranty', sg: 'No size guide', track: 'Expiry date', unit: 'Piece', comm: '12%' },
  { id: 'sun', name: 'Sunscreen', lv: 1, n: 12, p: 'skin' }, { id: 'ton', name: 'Toner', lv: 1, n: 9, p: 'skin' }, { id: 'cle', name: 'Cleanser', lv: 1, n: 14, p: 'skin' }, { id: 'ser', name: 'Serum', lv: 1, n: 11, p: 'skin', hidden: true },
  { id: 'clo', name: 'Clothing', lv: 0, n: 118, kids: ['men', 'wom'], tax: 'Standard VAT 15%', wp: 'No warranty', sg: 'Men’s shirts and polos', track: 'No tracking', unit: 'Piece', comm: '15%' },
  { id: 'men', name: 'Men', lv: 1, n: 52, p: 'clo', kids: ['polo', 'jean'] }, { id: 'polo', name: 'Polo shirts', lv: 2, n: 18, p: 'men' }, { id: 'jean', name: 'Jeans', lv: 2, n: 21, p: 'men' }, { id: 'wom', name: 'Women', lv: 1, n: 66, p: 'clo' },
  { id: 'ele', name: 'Electronics', lv: 0, n: 41, kids: ['ph', 'lap', 'aud'], tax: 'Standard VAT 15%', wp: '1 year official brand warranty', sg: 'No size guide', track: 'IMEI (phones)', unit: 'Piece', comm: '6%' },
  { id: 'ph', name: 'Phones', lv: 1, n: 18, p: 'ele' }, { id: 'lap', name: 'Laptops', lv: 1, n: 7, p: 'ele' }, { id: 'aud', name: 'Audio', lv: 1, n: 16, p: 'ele' },
  { id: 'gro', name: 'Grocery', lv: 0, n: 89, kids: [], tax: 'No VAT', wp: 'No warranty', sg: 'No size guide', track: 'Expiry date', unit: 'kg', comm: '8%' }
];
var BY = {}; T.forEach(function (t) { BY[t.id] = t; });
var FIELDS = { ele: [['RAM', 'dropdown', true], ['Network', 'dropdown', true], ['Display size', 'number', false], ['Battery', 'number', false], ['PTA approved', 'yes / no', true], ['Country of origin', 'text', false]], skin: [['Skin type', 'dropdown', true], ['Expiry date', 'date', true], ['Key ingredients', 'text', false], ['Volume', 'number', false], ['Country of origin', 'text', true]], clo: [['Material', 'text', true], ['Fit', 'dropdown', false], ['Care instructions', 'text', false]], gro: [['Weight', 'number', true], ['Expiry date', 'date', true]] };
// A category name: required, 2 to 60 letters, and not already used next to it.
function nameError(name, siblings) {
  var n = String(name || '').trim();
  if (!n) return 'Enter a category name.';
  if (n.length < 2) return 'Use at least 2 letters.';
  if (n.length > 60) return 'Keep the name under 60 letters.';
  if (siblings.some(function (x) { return x.toLowerCase() === n.toLowerCase(); })) return 'There is already a category called “' + n + '” here.';
  return '';
}
function focusId(id) { setTimeout(function () { var el = document.getElementById(id); if (el) el.focus(); }, 0); }
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {}, open = s.open || { skin: true, clo: true, ele: true, men: false };
    var names = s.names || {}, all = T.concat(s.extra || []), by = {};
    all.forEach(function (t) { by[t.id] = t; });
    var nm = function (t) { return names[t.id] || t.name; };
    var kidsOf = function (id) { return all.filter(function (x) { return x.p === id; }); };
    var root = function (t) { while (t.p) t = by[t.p]; return t; };
    var sel = by[s.sel || 'ph'] || by.ph;
    // Keep the tree in parent-then-children order so added categories sit under their parent.
    var ordered = []; var walk = function (pid) { all.filter(function (x) { return (x.p || null) === pid; }).forEach(function (x) { ordered.push(x); walk(x.id); }); }; walk(null);
    var cq = (s.cq || '').trim().toLowerCase();
    var visible = cq ? ordered.filter(function (t) { return nm(t).toLowerCase().indexOf(cq) >= 0; })
      : ordered.filter(function (t) { var p = t.p; while (p) { if (!open[p]) return false; p = by[p].p; } return true; });
    var R = root(sel);
    var path = []; var q = sel.p; while (q) { path.unshift(nm(by[q])); q = by[q].p; }
    var name = s.name != null ? s.name : nm(sel);
    var sibNames = function (parentId, exceptId) { return all.filter(function (x) { return (x.p || null) === (parentId || null) && x.id !== exceptId; }).map(nm); };
    var add = s.add || null, imp = s.imp || null;
    var parents = ordered.filter(function (t) { return t.lv < 2; });
    return assign({
      rows: visible.map(function (t) { var on = t.id === sel.id, hk = kidsOf(t.id).length > 0, label = nm(t);
        return { name: label, n: t.n, pad: (10 + (cq ? 0 : t.lv) * 26) + 'px', hasKids: hk && !cq, leaf: !hk || !!cq, isOpen: !!open[t.id], rot: open[t.id] ? '90deg' : '0deg', initial: label.charAt(0), fw: t.lv ? 500 : 600, fg: on ? '#003087' : '#0f172a', bg: on ? 'rgba(0,48,135,.07)' : 'transparent', ibg: on ? '#003087' : (t.lv ? '#eef2f6' : '#e0f3fb'), ifg: on ? '#fff' : '#003087', hidden: !!t.hidden, on: on,
          fold: function () { var o = assign({}, open); o[t.id] = !open[t.id]; self.setState({ open: o }); }, pick: function () { self.setState({ sel: t.id, desc: null, name: null, nameErr: '', inMenu: null, featured: null }); } }; }),
      noRows: !visible.length, cq: s.cq || '', typeCq: function (e) { self.setState({ cq: e.target.value }); }, clearCq: function () { self.setState({ cq: '' }); },
      noRowsTitle: 'No category matches “' + (s.cq || '').trim() + '”',
      allLbl: Object.keys(open).some(function (k) { return open[k]; }) ? 'Close all' : 'Open all',
      toggleAll: function () { var any = Object.keys(open).some(function (k) { return open[k]; }); var o = {}; all.forEach(function (t) { if (kidsOf(t.id).length) o[t.id] = !any; }); self.setState({ open: o }); },
      sel: { id: sel.id, name: nm(sel), initial: nm(sel).charAt(0), n: sel.n, path: path.length ? path.join(' › ') + ' ›' : 'Top level', parent: path.length ? path[path.length - 1] : 'Top level', tax: R.tax || 'Standard VAT 15%', wp: R.wp || 'No warranty', sg: R.sg || 'No size guide', track: R.track || 'No tracking', unit: R.unit || 'Piece', comm: R.comm || '10%', slug: '/collections/' + nm(sel).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') },
      name: name, nameErr: s.nameErr || '', typeName: function (e) { self.setState({ name: e.target.value, nameErr: '' }); },
      desc: s.desc != null ? s.desc : '', typeDesc: function (e) { self.setState({ desc: e.target.value }); },
      aiDesc: function () { self.setState({ desc: 'Shop the latest ' + nm(sel).toLowerCase() + ' in Bangladesh — official products, honest prices and fast delivery all over the country.' }); },
      fields: (FIELDS[R.id] || []).map(function (f) { return { l: f[0], t: f[1], req: f[2] }; }),
      inMenu: mkSw(this, 'inMenu', !sel.hidden), featured: mkSw(this, 'featured', false),
      // ---- edit form ----
      save: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var err = nameError(name, sibNames(sel.p, sel.id));
        if (err) { self.setState({ nameErr: err }); focusId('cat-name'); return; }
        var n2 = assign({}, names); n2[sel.id] = name.trim();
        self.setState({ names: n2, name: null, nameErr: '' }); toast(self, name.trim() + ' saved.');
      },
      del: function () { toast(self, 'Move the ' + sel.n + ' products to another category first.', true); },
      // ---- add category dialog ----
      addOpen: !!add, addName: add ? add.name : '', addParent: add ? add.parent : '', addErr: add ? add.err || '' : '',
      parents: parents.map(function (t) { return { id: t.id, label: (t.lv ? '— ' : '') + nm(t) }; }),
      addCat: function () { self.setState({ add: { name: '', parent: sel.lv < 2 ? sel.id : (sel.p || ''), err: '' } }); },
      closeAdd: function () { self.setState({ add: null }); },
      typeAddName: function (e) { self.setState({ add: assign(assign({}, add), { name: e.target.value, err: '' }) }); },
      setAddParent: function (e) { self.setState({ add: assign(assign({}, add), { parent: e.target.value, err: '' }) }); },
      submitAdd: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        var err = nameError(add.name, sibNames(add.parent || null, null));
        if (err) { self.setState({ add: assign(assign({}, add), { err: err }) }); focusId('cat-add-name'); return; }
        var par = add.parent ? by[add.parent] : null, id = 'new' + ((s.extra || []).length + 1);
        var item = { id: id, name: add.name.trim(), lv: par ? par.lv + 1 : 0, n: 0 }; if (par) item.p = par.id;
        var o = assign({}, open); if (par) { o[par.id] = true; var pp = par.p; while (pp) { o[pp] = true; pp = by[pp].p; } }
        self.setState({ extra: (s.extra || []).concat([item]), open: o, sel: id, add: null, cq: '', desc: null, name: null, nameErr: '', inMenu: null, featured: null });
        toast(self, item.name + ' added' + (par ? ' inside ' + nm(par) : ' at the top level') + '.');
      },
      // ---- import dialog ----
      impOpen: !!imp, impFile: imp ? imp.file || '' : '', impErr: imp ? imp.err || '' : '',
      openImport: function () { self.setState({ imp: { file: '', err: '' } }); }, closeImport: function () { self.setState({ imp: null }); },
      pickFile: function (e) { var fl = e.target.files && e.target.files[0]; self.setState({ imp: { file: fl ? fl.name : '', err: fl && !/\.csv$/i.test(fl.name) ? 'Choose a .csv file.' : '' } }); },
      submitImport: function (e) {
        if (e && e.preventDefault) e.preventDefault();
        if (!imp.file) { self.setState({ imp: { file: '', err: 'Choose a CSV file first.' } }); focusId('cat-import-file'); return; }
        if (!/\.csv$/i.test(imp.file)) { self.setState({ imp: { file: imp.file, err: 'Choose a .csv file.' } }); focusId('cat-import-file'); return; }
        self.setState({ imp: null }); toast(self, 'Importing categories from ' + imp.file + '. New ones appear in the tree when it finishes.');
      },
      downloadTemplate: function () {
        var csv = 'name,parent,description,show_in_menu\nSkin care,,Everyday skin care,yes\nSunscreen,Skin care,SPF 30 and above,yes\n';
        var a = document.createElement('a'); a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' })); a.download = 'categories-template.csv';
        document.body.appendChild(a); a.click(); a.remove(); setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
      }
    }, msgV(s));
  }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `/* phones: rows of label + buttons wrap instead of running out of the card */
@media (max-width:900px){.gc-shell__content [style*="display:flex"]:not([role="tablist"]):not([style*="column"]),.gc-shell__content [style*="display: flex"]:not([role="tablist"]):not([style*="column"]){flex-wrap:wrap}.gc-shell__content select,.gc-shell__content input{min-width:0;max-width:100%}.gc-shell__content .mono,.gc-shell__content [class*="badge"]{overflow-wrap:anywhere}}

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
.cat-tree{min-width:0}
@media (max-width:1023px){.cat-tree{width:100%!important}}
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
`;

// ---- markup ----

export default class CategoriesScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Categories">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="products-cats" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Products" page="Categories" placeholder="Search products, SKU or barcode" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Categories" />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Every product sits in one category. Categories set the shop menu, the extra product fields, tax and seller commission.</div>
                <button type="button" className="btn line" onClick={v.openImport} aria-haspopup="dialog">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                    <path d="M17 8 12 3 7 8" />
                    <path d="M12 3v12" />
                  </svg>
                  <span>Import</span>
                </button>
                <button type="button" className="btn solid" onClick={v.addCat} aria-haspopup="dialog">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M5 12h14" />
                    <path d="M12 5v14" />
                  </svg>
                  <span>Add category</span>
                </button>
              </div>
              <div style={{ display: "flex", gap: "20px", alignItems: "flex-start" }}>
                <section className="pcard cat-tree" style={{ width: "470px", maxWidth: "100%", flexShrink: "0", overflow: "hidden", alignSelf: "flex-start" }}>
                  <div style={{ padding: "14px 16px", borderBottom: "1px solid #e6eaf0", display: "flex", gap: "10px" }}>
                    <label style={{ position: "relative", flexGrow: "1" }}>
                      <span style={{ position: "absolute", left: "12px", top: "12px", color: "var(--text-muted)" }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="11" cy="11" r="8" />
                          <path d="m21 21-4.3-4.3" />
                        </svg>
                      </span>
                      <input className="inp" type="search" placeholder="Find a category" aria-label="Find a category" value={v.cq} onChange={v.typeCq} style={{ paddingLeft: "40px" }} />
                    </label>
                    <button type="button" className="abtn" style={{ height: "44px" }} onClick={v.toggleAll}>{v.allLbl}</button>
                  </div>
                  <div style={{ padding: "8px" }}>
                    {v.noRows ? (
                      <__EmptyState title={v.noRowsTitle} body="Check the spelling or clear the search." actionLabel="Clear search" onAction={v.clearCq} />
                    ) : null}
                    {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                        <div style={__sx(`display: flex; align-items: center; gap: 8px; height: 44px; padding: 0 10px 0 ${r?.pad ?? ""}; border-radius: var(--radius-lg); background: ${r?.bg ?? ""};`)}>
                          <span aria-hidden="true" style={{ color: "#cbd5e1" }}>
                            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                              <circle cx="9" cy="12" r="1" />
                              <circle cx="9" cy="5" r="1" />
                              <circle cx="9" cy="19" r="1" />
                              <circle cx="15" cy="12" r="1" />
                              <circle cx="15" cy="5" r="1" />
                              <circle cx="15" cy="19" r="1" />
                            </svg>
                          </span>
                          {r?.hasKids ? (<>
                            <button type="button" className="ib" onClick={r?.fold} aria-expanded={r?.isOpen} aria-label={`Sub-categories of ${r?.name ?? ""}`} style={__sx(`width: 26px; height: 26px; transform: rotate(${r?.rot ?? ""}); transition: transform 200ms;`)}>
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="m9 18 6-6-6-6" />
                              </svg>
                            </button>
                          </>) : null}
                          {r?.leaf ? (<>
                            <span style={{ width: "26px" }} />
                          </>) : null}
                          <button type="button" onClick={r?.pick} aria-current={r?.on ? "true" : undefined} style={{ flexGrow: "1", height: "100%", border: "0", background: "transparent", font: "inherit", textAlign: "left", cursor: "pointer", display: "flex", alignItems: "center", gap: "10px" }}>
                            <span style={__sx(`width: 28px; height: 28px; border-radius: var(--radius-lg); background: ${r?.ibg ?? ""}; color: ${r?.ifg ?? ""}; display: flex; align-items: center; justify-content: center; font-size: var(--text-xs); font-weight: var(--weight-medium);`)}>{r?.initial}</span>
                            <span style={__sx(`font-size: var(--text-sm); font-weight: ${r?.fw ?? ""}; color: ${r?.fg ?? ""};`)}>{r?.name}</span>
                            {r?.hidden ? (<>
                              <span className="badge b-draft">Hidden</span>
                            </>) : null}
                          </button>
                          <span className="num" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{r?.n}</span>
                        </div>
                      </React.Fragment>))}
                  </div>
                </section>
                <section className="pcard" aria-label={`Edit ${v.sel?.name ?? ""}`} style={{ flexGrow: "1", minWidth: "0", padding: "4px 24px 20px", alignSelf: "flex-start" }}>
                 <form key={v.sel?.id} onSubmit={v.save} noValidate>
                  <div style={{ display: "flex", alignItems: "center", gap: "12px", padding: "18px 0", borderBottom: "1px solid #eef2f6" }}>
                    <span style={{ width: "52px", height: "52px", borderRadius: "var(--radius-xl)", background: "linear-gradient(135deg, #0b1733, #0a5bd0)", color: "#fff", fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)", display: "flex", alignItems: "center", justifyContent: "center" }}>{v.sel?.initial}</span>
                    <div style={{ flexGrow: "1" }}>
                      <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.sel?.path}</div>
                      <div style={{ fontSize: "var(--text-xl)", fontWeight: "var(--weight-semibold)" }}>{v.sel?.name}</div>
                    </div>
                    <span className="badge b-approved">{v.sel?.n} products</span>
                    <__Link href="/all-products" className="abtn" style={{ textDecoration: "none" }}>See products</__Link>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div className="psec">Basics</div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <label className="lbl" htmlFor="cat-name">Name <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
                        <input id="cat-name" className="inp" value={v.name} onChange={v.typeName} aria-required="true" aria-invalid={v.nameErr ? "true" : undefined} aria-describedby={v.nameErr ? "cat-name-err" : undefined} style={v.nameErr ? { borderColor: "var(--text-danger)" } : undefined} />
                        {v.nameErr ? (<span id="cat-name-err" className="gc-help gc-help--error" role="alert" style={{ margin: "0", color: "var(--text-danger)" }}>{v.nameErr}</span>) : null}
                      </div>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Inside</span>
                        <select className="inp" aria-label="Parent category">
                          <option>{v.sel?.parent}</option>
                          <option>Top level</option>
                          <option>Skin care</option>
                          <option>Clothing</option>
                          <option>Electronics</option>
                        </select>
                      </label>
                    </div>
                    <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                      <div style={{ display: "flex", alignItems: "center" }}>
                        <span className="lbl" style={{ flexGrow: "1" }}>Description (shown on the category page)</span>
                        <button type="button" className="ai" onClick={v.aiDesc}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M9.937 15.5A2 2 0 0 0 8.5 14.063l-6.135-1.582a.5.5 0 0 1 0-.962L8.5 9.936A2 2 0 0 0 9.937 8.5l1.582-6.135a.5.5 0 0 1 .963 0L14.063 8.5A2 2 0 0 0 15.5 9.937l6.135 1.581a.5.5 0 0 1 0 .964L15.5 14.063a2 2 0 0 0-1.437 1.437l-1.582 6.135a.5.5 0 0 1-.963 0z" />
</svg>Write with AI</button>
                      </div>
                      <textarea className="inp" rows="3" value={v.desc} onInput={v.typeDesc} onChange={v.typeDesc} aria-label="Category description" style={{ height: "auto", padding: "10px 12px", lineHeight: "21px" }} />
                    </div>
                    <div style={{ display: "flex", gap: "14px", alignItems: "center" }}>
                      <div style={{ width: "120px", height: "80px", borderRadius: "var(--radius-xl)", border: "2px dashed #94a3b8", background: "#f8fafc", display: "flex", alignItems: "center", justifyContent: "center", color: "var(--text-muted)" }}>
                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <rect width="18" height="18" x="3" y="3" rx="2" />
                          <circle cx="9" cy="9" r="2" />
                          <path d="m21 15-3.086-3.086a2 2 0 0 0-2.828 0L6 21" />
                        </svg>
                      </div>
                      <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Banner or icon for the menu. 1200 × 400.</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div className="psec">Extra product fields</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>Every product in this category asks for these. Sub-categories get them too.</div>
                    <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                      {__list(v.fields).map((f, $index) => (<React.Fragment key={$index}>
                          <span style={{ height: "32px", padding: "0 12px", borderRadius: "var(--radius-lg)", border: "1px solid #e6eaf0", background: "#fff", fontSize: "var(--text-xs-plus)", display: "inline-flex", alignItems: "center", gap: "8px" }}>
                            <b style={{ fontWeight: "var(--weight-medium)" }}>{f?.l}</b>
                            <span style={{ color: "var(--text-muted)" }}>{f?.t}</span>
                            {f?.req ? (<>
                              <span style={{ color: "#b83210" }}>required</span>
                            </>) : null}
                          </span>
                        </React.Fragment>))}
                      <__Link href="/catalog-setup" className="abtn" style={{ textDecoration: "none" }}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M5 12h14" />
  <path d="M12 5v14" />
</svg>Add field</__Link>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div className="psec">Defaults for new products</div>
                    <div className="gc-cols-3" style={{ display: "grid", gridTemplateColumns: "repeat(3, minmax(0, 1fr))", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">VAT / tax</span>
                        <select className="inp" aria-label="Tax">
                          <option>{v.sel?.tax}</option>
                          <option>Standard VAT 15%</option>
                          <option>Reduced 7.5%</option>
                          <option>No VAT</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Warranty policy</span>
                        <select className="inp" aria-label="Warranty">
                          <option>{v.sel?.wp}</option>
                          <option>No warranty</option>
                          <option>7-day replacement only</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Size guide</span>
                        <select className="inp" aria-label="Size guide">
                          <option>{v.sel?.sg}</option>
                          <option>Men’s shirts and polos</option>
                          <option>Women’s kurti</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Track by</span>
                        <select className="inp" aria-label="Tracking">
                          <option>{v.sel?.track}</option>
                          <option>No tracking</option>
                          <option>Serial number</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Unit</span>
                        <select className="inp" aria-label="Unit">
                          <option>{v.sel?.unit}</option>
                          <option>kg</option>
                          <option>Litre</option>
                        </select>
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Seller commission</span>
                        <input className="inp num" defaultValue={v.sel?.comm} aria-label="Seller commission" />
                        <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>For marketplace sellers</span>
                      </label>
                    </div>
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "12px", padding: "18px 0", borderBottom: "1px solid #eef2f6" }}>
                    <div className="psec">Showing in the shop</div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <circle cx="12" cy="12" r="10" />
                          <path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" />
                          <path d="M2 12h20" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Show in the shop menu</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.inMenu?.on} aria-label="Show in the shop menu" className={v.inMenu?.cls} onClick={v.inMenu?.toggle} />
                    </div>
                    <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 0", borderBottom: "1px solid #eef2f6" }}>
                      <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                          <path d="M11.525 2.295a.53.53 0 0 1 .95 0l2.31 4.679a2.123 2.123 0 0 0 1.595 1.16l5.166.756a.53.53 0 0 1 .294.904l-3.736 3.638a2.123 2.123 0 0 0-.611 1.878l.882 5.14a.53.53 0 0 1-.771.56l-4.618-2.428a2.122 2.122 0 0 0-1.973 0L6.396 21.01a.53.53 0 0 1-.77-.56l.881-5.139a2.122 2.122 0 0 0-.611-1.879L2.16 9.795a.53.53 0 0 1 .294-.906l5.165-.755a2.122 2.122 0 0 0 1.597-1.16z" />
                        </svg>
                      </span>
                      <div style={{ flexGrow: "1" }}>
                        <div style={{ fontSize: "var(--text-sm)", lineHeight: "20px", fontWeight: "var(--weight-medium)", color: "#0f172a" }}>Feature on the home page</div>
                      </div>
                      <button type="button" role="switch" aria-checked={v.featured?.on} aria-label="Feature on the home page" className={v.featured?.cls} onClick={v.featured?.toggle} />
                    </div>
                    <div className="gc-cols-2" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "14px" }}>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Web address</span>
                        <input className="inp mono" defaultValue={v.sel?.slug} aria-label="Web address" />
                      </label>
                      <label style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                        <span className="lbl">Sort products by</span>
                        <select className="inp" aria-label="Sort">
                          <option>Best selling</option>
                          <option>Newest</option>
                          <option>Price, low to high</option>
                        </select>
                      </label>
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: "10px", paddingTop: "18px" }}>
                    <button type="button" className="btn line" onClick={v.del} style={{ color: "#b83210", borderColor: "#f5b5a3" }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 6h18" />
                        <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
                        <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2" />
                      </svg>
                      <span>Delete</span>
                    </button>
                    <span style={{ flexGrow: "1" }} />
                    <button type="submit" className="btn solid">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M20 6 9 17l-5-5" />
                      </svg>
                      <span>Save category</span>
                    </button>
                  </div>
                 </form>
                </section>
              </div>
              <__Dialog open={v.addOpen} title="Add category" onClose={v.closeAdd} footer={<>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeAdd}>Cancel</button>
                <button type="submit" form="cat-add-form" className="gc-btn gc-btn--solid">Add category</button>
              </>}>
                <form id="cat-add-form" onSubmit={v.submitAdd} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="cat-add-name">Name <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
                    <input id="cat-add-name" className="inp" value={v.addName} onChange={v.typeAddName} placeholder="For example: Face wash" aria-required="true" aria-invalid={v.addErr ? "true" : undefined} aria-describedby={v.addErr ? "cat-add-name-err" : undefined} style={v.addErr ? { borderColor: "var(--text-danger)" } : undefined} />
                    {v.addErr ? (<span id="cat-add-name-err" className="gc-help gc-help--error" role="alert" style={{ margin: "0", color: "var(--text-danger)" }}>{v.addErr}</span>) : null}
                  </div>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="cat-add-parent">Inside</label>
                    <select id="cat-add-parent" className="inp" value={v.addParent} onChange={v.setAddParent}>
                      <option value="">Top level</option>
                      {__list(v.parents).map((pc) => (<option key={pc.id} value={pc.id}>{pc.label}</option>))}
                    </select>
                    <span style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>It takes the tax, extra fields and commission from the category it sits in.</span>
                  </div>
                </form>
              </__Dialog>
              <__Dialog open={v.impOpen} title="Import categories" onClose={v.closeImport} width={520} footer={<>
                <button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeImport}>Cancel</button>
                <button type="submit" form="cat-import-form" className="gc-btn gc-btn--solid">Import</button>
              </>}>
                <form id="cat-import-form" onSubmit={v.submitImport} noValidate style={{ display: "flex", flexDirection: "column", gap: "14px", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#334155" }}>
                  <p style={{ margin: "0" }}>Upload a CSV file with one category per row. The first row is the header. List a parent before the categories inside it.</p>
                  <div className="gc-table-wrap">
                    <table style={{ width: "100%", borderCollapse: "collapse" }}>
                      <thead>
                        <tr>
                          <th className="th" scope="col">Column</th>
                          <th className="th" scope="col">What goes in it</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td className="td mono">name</td><td className="td">Category name. Required.</td></tr>
                        <tr><td className="td mono">parent</td><td className="td">Name of the category it sits inside. Leave empty for the top level.</td></tr>
                        <tr><td className="td mono">description</td><td className="td">Text for the category page. Optional.</td></tr>
                        <tr><td className="td mono">show_in_menu</td><td className="td">yes or no. Empty means yes.</td></tr>
                      </tbody>
                    </table>
                  </div>
                  <button type="button" className="abtn" onClick={v.downloadTemplate} style={{ alignSelf: "flex-start" }}>
                    <__Icon name="download" width="14" height="14" aria-hidden="true" />Download a template
                  </button>
                  <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                    <label className="lbl" htmlFor="cat-import-file">CSV file <span aria-hidden="true" style={{ color: "var(--text-danger)" }}>*</span></label>
                    <input id="cat-import-file" type="file" accept=".csv,text/csv" onChange={v.pickFile} aria-required="true" aria-invalid={v.impErr ? "true" : undefined} aria-describedby={v.impErr ? "cat-import-err" : "cat-import-help"} style={{ fontSize: "var(--text-sm)" }} />
                    {v.impErr ? (<span id="cat-import-err" className="gc-help gc-help--error" role="alert" style={{ margin: "0", color: "var(--text-danger)" }}>{v.impErr}</span>) : (<span id="cat-import-help" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>Categories that already exist are skipped, not duplicated.</span>)}
                  </div>
                </form>
              </__Dialog>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
