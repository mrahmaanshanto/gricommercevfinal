'use client';
// Generated from design/templates/automation/WorkflowBuilder.dc.html by scripts/convert-design.mjs.
// Workflow builder — Automation — node-based workflow editor: canvas with trigger, IF branches and action nodes, node panel, test runs and executions.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader } from '@/components/ui';

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
function msgV(s) { return { hasMsg: !!s.msg, msg: s.msg || '', msgBg: s.bad ? 'var(--fill-warning-soft)' : 'var(--fill-success-soft)', msgFg: s.bad ? 'var(--text-warning)' : 'var(--text-success)' }; }
function segv(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#0b1733' : 'transparent', fg: on ? '#fff' : '#475569', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function lseg(self, opts, cur, key) { return opts.map(function (o) { var on = o[0] === cur; return { l: o[1], on: on, bg: on ? '#fff' : 'transparent', fg: on ? '#0b1733' : '#64748b', sh: on ? '0 1px 2px rgba(15,23,42,.08), 0 1px 1px rgba(15,23,42,.04)' : 'none', pick: function () { var p = {}; p[key] = o[0]; self.setState(p); } }; }); }
function ring(pctv, r) { var C = 2 * Math.PI * r; return { da: (C * pctv / 100).toFixed(1) + ' ' + C.toFixed(1) }; }
function curve(pts) { if (!pts.length) return ''; var d = 'M' + pts[0][0].toFixed(1) + ' ' + pts[0][1].toFixed(1); for (var i = 0; i < pts.length - 1; i++) { var p0 = pts[i - 1] || pts[i], p1 = pts[i], p2 = pts[i + 1], p3 = pts[i + 2] || p2; var c1x = p1[0] + (p2[0] - p0[0]) / 6, c1y = p1[1] + (p2[1] - p0[1]) / 6, c2x = p2[0] - (p3[0] - p1[0]) / 6, c2y = p2[1] - (p3[1] - p1[1]) / 6; d += ' C' + c1x.toFixed(1) + ' ' + c1y.toFixed(1) + ' ' + c2x.toFixed(1) + ' ' + c2y.toFixed(1) + ' ' + p2[0].toFixed(1) + ' ' + p2[1].toFixed(1); } return d; }
function pts(vals, w, h, max, min, padT, padB) { padT = padT || 2; padB = padB || 2; min = min == null ? 0 : min; max = max || Math.max.apply(null, vals) || 1; var n = vals.length; return vals.map(function (v, i) { return [n === 1 ? w / 2 : i * w / (n - 1), padT + (h - padT - padB) * (1 - (v - min) / (max - min || 1))]; }); }
function sparkP(vals, w, h) { w = w || 160; h = h || 30; var mn = Math.min.apply(null, vals), mx = Math.max.apply(null, vals); var p = pts(vals, w, h, mx + (mx - mn) * .1, mn - (mx - mn) * .15, 3, 2); var l = curve(p); return { line: l, area: l + ' L' + w + ' ' + h + ' L0 ' + h + ' Z' }; }
function series(n, base, amp, seed, trend) { var out = []; for (var i = 0; i < n; i++) { var s = Math.sin((i + seed) * 1.7) * .5 + Math.sin((i * 3 + seed) * .9) * .3 + Math.cos(i * .45 + seed) * .2; out.push(Math.max(0, base * (1 + (trend || 0) * (i / n - .5)) + amp * s)); } return out; }

function val(e) { return e && e.target ? e.target.value : e; }

// type -> [icon, bg, fg, subtitle]
var SOFT = { primary: ['var(--fill-primary-soft)', 'var(--primary)'], info: ['var(--fill-info-soft)', 'var(--text-info)'], warning: ['var(--fill-warning-soft)', 'var(--text-warning)'], success: ['var(--fill-success-soft)', 'var(--text-success)'], neutral: ['var(--slate-100)', 'var(--slate-600)'], accent: ['var(--fill-accent-soft)', 'var(--accent-text)'], secondary: ['var(--fill-secondary-soft)', 'var(--secondary-focus)'] };
function ty(k, tone, sub) { return [k, SOFT[tone][0], SOFT[tone][1], sub]; }
var TY = { trig: ty('trig', 'primary', 'Trigger'), if: ty('if', 'info', 'IF'), hold: ty('hold', 'warning', 'Orders'), wa: ty('wa', 'success', 'WhatsApp'), wait: ty('wait', 'neutral', 'Wait'), call: ty('call', 'primary', 'AI call'), ok: ty('ok', 'success', 'Orders'), truck: ty('truck', 'accent', 'Courier'), sms: ty('sms', 'secondary', 'SMS'), tag: ty('tag', 'secondary', 'Customers'), bell: ty('bell', 'warning', 'Staff'), split: ty('split', 'info', 'Switch') };
var START = [
  { id: 'n1', ty: 'trig', name: 'Order placed', x: 24, y: 230, p: [['Event', 'New order'], ['Sources', 'Website, Facebook, WhatsApp']] },
  { id: 'n2', ty: 'if', name: 'Big outside-Dhaka COD?', x: 164, y: 230, c: [['Payment method', 'is', 'COD'], ['Order total', 'is more than', '3000'], ['Delivery zone', 'is', 'Outside Dhaka']] },
  { id: 'n3', ty: 'hold', name: 'Hold order', x: 304, y: 120, p: [['Reason', 'Waiting for advance delivery charge']] },
  { id: 'n4', ty: 'wa', name: 'Ask ৳150 advance', x: 444, y: 120, p: [['Template', 'advance_request_bn'], ['Amount', '150'], ['Pay by', 'bKash · 01711-482093']] },
  { id: 'n5', ty: 'wait', name: 'Wait 30 min', x: 584, y: 120, p: [['Wait for', '30 minutes'], ['Or resume when', 'bKash payment arrives']] },
  { id: 'n6', ty: 'if', name: 'Advance paid?', x: 724, y: 120, c: [['bKash payment', 'exists for', 'this order']] },
  { id: 'n8', ty: 'ok', name: 'Release and confirm', x: 864, y: 40, p: [['New status', 'Confirmed'], ['Note', 'Advance ৳150 received']] },
  { id: 'n9', ty: 'call', name: 'AI call customer', x: 864, y: 200, p: [['Script', 'Advance reminder'], ['Language', 'Match customer']] },
  { id: 'n7', ty: 'call', name: 'AI call to confirm', x: 304, y: 340, p: [['Script', 'Standard confirmation'], ['Language', 'Match customer']] },
  { id: 'n10', ty: 'truck', name: 'Book courier', x: 444, y: 340, p: [['Courier', 'Default (Pathao)'], ['Ship from', 'Central Warehouse']] }
];
var EDGES = [['n1', 'n2', ''], ['n2', 'n3', 'true'], ['n2', 'n7', 'false'], ['n3', 'n4', ''], ['n4', 'n5', ''], ['n5', 'n6', ''], ['n6', 'n8', 'true'], ['n6', 'n9', 'false'], ['n7', 'n10', '']];
var CAT = [['Triggers', [['trig', 'Order placed', 'A new order from any channel'], ['trig', 'Order status changed', 'Any move between statuses'], ['trig', 'AI call finished', 'With the call result'], ['trig', 'Parcel delivered', 'From the courier'], ['trig', 'Stock is low', 'Below the alert level'], ['trig', 'On a schedule', 'Every day, week or month']]],
  ['GridCommerce', [['hold', 'Hold order', 'Pause the order'], ['ok', 'Change order status', 'Move it to any status'], ['truck', 'Book courier', 'Pathao, Steadfast, RedX, Carrybee'], ['tag', 'Tag customer', 'Add or remove a tag'], ['bell', 'Notify staff', 'In the app and by SMS']]],
  ['Messages', [['wa', 'WhatsApp message', 'Approved template'], ['sms', 'SMS', 'Masking name GridShop'], ['call', 'AI call', 'Bangla or English']]],
  ['Flow', [['if', 'IF', 'Split into true and false'], ['split', 'Switch', 'Split by value into many paths'], ['wait', 'Wait', 'For a time or an event']]]];
var TEST_PATH = ['n1', 'n2', 'n3', 'n4', 'n5', 'n6', 'n9'];
var OUT = { n1: '{ "order": "#ORD-0929-007", "total": 12400,\n  "payment": "COD", "zone": "Outside Dhaka" }', n2: 'true → 1 item', n3: '{ "status": "On hold" }', n4: '{ "whatsapp": "delivered", "to": "01819-554120" }', n5: 'Resumed after 30 minutes', n6: 'false → 1 item (no bKash payment)', n9: '{ "result": "AI confirmed", "advance": "promised by 6:00 PM" }' };
var NW = 76;
class Component extends DCLogic {
  componentWillUnmount() { clearTimeout(this.t); }
  renderVals() {
    var self = this, s = this.state || {};
    var nodes = s.nodes || START, edges = s.edges || EDGES, sel = s.sel || null, tab = s.tab || 'editor', ran = s.ran || null, z = s.z || 1;
    var byId = {}; nodes.forEach(function (n) { byId[n.id] = n; });
    var outs = function (id) { return edges.filter(function (e) { return e[0] === id; }); };
    function upd(id, fn) { self.setState({ nodes: nodes.map(function (n) { return n.id === id ? fn(JSON.parse(JSON.stringify(n))) : n; }) }); }
    function addAfter(fromId, label, ty, nm) {
      var f = byId[fromId], nx = f.x + 140, ny = f.y + (label === 'false' ? 110 : label === 'true' ? -80 : 0);
      while (nodes.some(function (n) { return Math.abs(n.x - nx) < 60 && Math.abs(n.y - ny) < 60; })) ny += 110;
      ny = Math.max(20, Math.min(ny, 520));
      var id = 'n' + (100 + nodes.length);
      var nn = { id: id, ty: ty, name: nm, x: nx, y: ny, p: ty === 'if' ? undefined : [['Setting', 'Default']], c: ty === 'if' ? [['Field', 'is', 'value']] : undefined };
      self.setState({ nodes: nodes.concat([nn]), edges: edges.concat([[fromId, id, label]]), sel: id, creator: null, ran: null });
      toast(self, nm + ' added. Set it up in the panel on the right.');
    }
    var ranSet = {}; if (ran) ran.forEach(function (id) { ranSet[id] = 1; });
    var pluses = [];
    nodes.forEach(function (n) { var o = outs(n.id);
      if (n.ty === 'if') { ['true', 'false'].forEach(function (lab) { if (!o.some(function (e) { return e[2] === lab; })) pluses.push({ from: n.id, lab: lab, x: n.x + NW + 26, y: n.y + (lab === 'true' ? 14 : 44) }); }); }
      else if (!o.length) pluses.push({ from: n.id, lab: '', x: n.x + NW + 26, y: n.y + 26 }); });
    var v = {
      name: s.name == null ? 'Advance charge for big outside-Dhaka COD orders' : s.name, onName: function (e) { self.setState({ name: val(e) }); },
      nodeCount: nodes.length + ' nodes', layerW: Math.max(960, Math.max.apply(null, nodes.map(function (n) { return n.x; })) + 116),
      active: mkSw(self, 'act', true), actL: (s.act === false) ? 'Inactive' : 'Active', actC: (s.act === false) ? 'var(--text-muted)' : 'var(--text-success)',
      saveL: s.saved ? 'Saved' : 'Save', save: function () { self.setState({ saved: true }); toast(self, 'Workflow saved.'); },
      tabs: [['editor', 'Editor'], ['exec', 'Executions']].map(function (t) { var on = t[0] === tab; return { l: t[1], on: on, cls: on ? 'wtab on' : 'wtab', pick: function () { self.setState({ tab: t[0] }); } }; }),
      isEditor: tab === 'editor', isExec: tab === 'exec',
      runNote: ran ? 'Last test: #ORD-0929-007 · ' + ran.length + ' of ' + nodes.length + ' nodes ran · 1.4 s' : 'Tests run on a real order. Nothing is sent to the customer.',
      test: function () { self.setState({ ran: TEST_PATH.filter(function (id) { return byId[id]; }), tab: 'editor' }); toast(self, 'Test run on #ORD-0929-007 (৳12,400, COD, Chattogram): took the true branch, no advance paid, ended at AI call. Nothing was sent.'); },
      zoom: z, zoomL: Math.round(z * 100) + '%', zIn: function () { self.setState({ z: Math.min(1.2, +(z + .1).toFixed(1)) }); }, zOut: function () { self.setState({ z: Math.max(.6, +(z - .1).toFixed(1)) }); }, zFit: function () { self.setState({ z: 1 }); },
      nodes: nodes.map(function (n) { var t = TY[n.ty], ok = !!ranSet[n.id];
        return { name: n.name, sub: t[3], x: n.x, y: n.y, is_trig: n.ty === 'trig', is_if: n.ty === 'if', is_hold: n.ty === 'hold', is_wa: n.ty === 'wa', is_wait: n.ty === 'wait', is_call: n.ty === 'call', is_ok: n.ty === 'ok', is_truck: n.ty === 'truck', is_sms: n.ty === 'sms', is_tag: n.ty === 'tag', is_bell: n.ty === 'bell', is_split: n.ty === 'split', bg: t[1], fg: t[2], ok: ok, cls: 'node' + (n.ty === 'trig' ? ' trig' : '') + (ok ? ' ok' : '') + (sel === n.id ? ' sel' : ''),
          px: n.x - 6, py: n.y + NW / 2 - 5, inDisp: n.ty === 'trig' ? 'none' : 'block', lx: n.x + NW / 2 - 65, ly: n.y + NW + 6,
          pick: function () { self.setState({ sel: n.id, creator: null }); } }; }),
      edges: edges.map(function (e) { var a = byId[e[0]], b = byId[e[1]]; if (!a || !b) return null;
        var sx = a.x + NW, sy = a.y + NW / 2 + (e[2] === 'true' ? -14 : e[2] === 'false' ? 14 : 0), tx = b.x - 2, ty = b.y + NW / 2;
        var l = Math.min(sx, tx) - 10, t = Math.min(sy, ty) - 10, w = Math.abs(tx - sx) + 20, h = Math.abs(ty - sy) + 20;
        var x1 = sx - l, y1 = sy - t, x2 = tx - l, y2 = ty - t, mx = (x2 - x1) / 2;
        var both = ranSet[e[0]] && ranSet[e[1]];
        var c = both ? 'var(--fill-success)' : 'var(--slate-400)';
        return { l: l, t: t, w: w, h: h, d: 'M' + x1 + ' ' + y1 + ' C' + (x1 + mx) + ' ' + y1 + ' ' + (x2 - mx) + ' ' + y2 + ' ' + (x2 - 6) + ' ' + y2, a: 'M' + (x2 - 7) + ' ' + (y2 - 5) + ' L' + x2 + ' ' + y2 + ' L' + (x2 - 7) + ' ' + (y2 + 5) + ' z', c: c,
          hasLab: !!e[2], lab: e[2], lc: e[2] === 'true' ? 'var(--text-success)' : 'var(--text-danger)', lx: sx + 6, ly: sy - (e[2] === 'true' ? 18 : -4), ran: !!both, ix: (sx + tx) / 2 - 18, iy: (sy + ty) / 2 - 16 }; }).filter(Boolean),
      pluses: pluses.map(function (p) { return { x: p.x - 12, y: p.y, after: byId[p.from].name, hasLab: !!p.lab, lab: p.lab, lc: p.lab === 'true' ? 'var(--text-success)' : 'var(--text-danger)', lx: p.x - 44, ly: p.y + 4, add: function () { self.setState({ creator: { from: p.from, lab: p.lab }, sel: null, q: '' }); } }; }),
      openCreator: function () { var leaf = pluses[pluses.length - 1]; self.setState({ creator: leaf ? { from: leaf.from, lab: leaf.lab } : { from: nodes[nodes.length - 1].id, lab: '' }, sel: null, q: '' }); },
      creatorOpen: !!s.creator && tab === 'editor', ndvOpen: !!sel && !s.creator && tab === 'editor' && !!byId[sel],
      creatorTitle: 'Add a node', creatorSub: s.creator ? 'After “' + (byId[s.creator.from] || {}).name + '”' + (s.creator.lab ? ' · ' + s.creator.lab + ' branch' : '') : '',
      closeDrawer: function () { self.setState({ creator: null, sel: null }); },
      q: s.q || '', onQ: function (e) { self.setState({ q: val(e) }); }
    };
    var q = (s.q || '').toLowerCase();
    v.catalog = CAT.map(function (g) { return { cat: g[0], items: g[1].filter(function (it) { return !q || (it[1] + ' ' + it[2]).toLowerCase().indexOf(q) >= 0; }).filter(function (it) { return g[0] !== 'Triggers'; }).map(function (it) { var t = TY[it[0]]; var tt = it[0]; return { is_trig: tt === 'trig', is_if: tt === 'if', is_hold: tt === 'hold', is_wa: tt === 'wa', is_wait: tt === 'wait', is_call: tt === 'call', is_ok: tt === 'ok', is_truck: tt === 'truck', is_sms: tt === 'sms', is_tag: tt === 'tag', is_bell: tt === 'bell', is_split: tt === 'split', n: it[1], d: it[2], bg: t[1], fg: t[2], add: function () { if (s.creator) addAfter(s.creator.from, s.creator.lab, it[0], it[1]); } }; }) }; }).filter(function (g) { return g.items.length; });
    v.noResults = v.catalog.length === 0;
    if (sel && byId[sel]) { var n = byId[sel], t = TY[n.ty], hasRun = !!ranSet[n.id];
      v.sel = { is_trig: n.ty === 'trig', is_if: n.ty === 'if', is_hold: n.ty === 'hold', is_wa: n.ty === 'wa', is_wait: n.ty === 'wait', is_call: n.ty === 'call', is_ok: n.ty === 'ok', is_truck: n.ty === 'truck', is_sms: n.ty === 'sms', is_tag: n.ty === 'tag', is_bell: n.ty === 'bell', is_split: n.ty === 'split', name: n.name, sub: t[3], bg: t[1], fg: t[2], isIf: n.ty === 'if', inN: n.ty === 'trig' ? 'none' : hasRun ? '1 item' : 'run a test', outN: hasRun ? '1 item' : 'not run yet', outBg: hasRun ? 'var(--fill-success-soft)' : 'var(--slate-100)', outFg: hasRun ? 'var(--text-success)' : 'var(--slate-600)',
        conds: (n.c || []).map(function (c, i) { function f(k) { return function (e) { upd(n.id, function (m) { m.c[i][k] = val(e); return m; }); }; } return { f: c[0], o: c[1], v: c[2], onF: f(0), onO: f(1), onV: f(2) }; }),
        addCond: function () { upd(n.id, function (m) { m.c.push(['Field', 'is', 'value']); return m; }); },
        params: [['Name', n.name, '']].concat((n.p || []).map(function (p) { return [p[0], p[1], p[0] === 'Template' ? 'Approved by WhatsApp · Bangla' : p[0] === 'Wait for' ? 'Customers are never messaged during quiet hours.' : '']; })).map(function (p, i) { return { l: p[0], v: p[1], hasHint: !!p[2], hint: p[2], on: function (e) { upd(n.id, function (m) { if (i === 0) m.name = val(e); else m.p[i - 1][1] = val(e); return m; }); } }; }),
        hasOut: hasRun, out: OUT[n.id] || '1 item' };
    } else v.sel = { name: '', sub: '', bg: '', fg: '', icon: '', isIf: false, conds: [], params: [], hasOut: false, out: '', inN: '', outN: '', outBg: '', outFg: '' };
    v.testStep = function () { if (!sel) return; var r = (ran || []).slice(); if (r.indexOf(sel) < 0) r.push(sel); self.setState({ ran: r }); toast(self, 'Step tested with #ORD-0929-007.'); };
    v.delNode = function () { if (!sel) return; if (byId[sel].ty === 'trig') { toast(self, 'A workflow needs its trigger. Change it instead.', true); return; } if (outs(sel).length) { toast(self, 'Delete the nodes after this one first.', true); return; } var nm = byId[sel].name; self.setState({ nodes: nodes.filter(function (m) { return m.id !== sel; }), edges: edges.filter(function (e) { return e[1] !== sel; }), sel: null }); toast(self, nm + ' deleted.'); };
    v.execs = [['29 Sep, 1:40 PM', '#ORD-0929-007', 'Held · WhatsApp · waited · AI call', '30 min 6 s', 'ok'], ['29 Sep, 11:12 AM', '#ORD-0929-003', 'Held · WhatsApp · paid · confirmed', '12 min 40 s', 'ok'], ['28 Sep, 8:05 PM', '#ORD-0928-041', 'Not a big COD order · AI call · courier', '48 s', 'ok'], ['28 Sep, 4:22 PM', '#ORD-0928-030', 'WhatsApp failed: number not on WhatsApp', '2 s', 'fail'], ['28 Sep, 10:15 AM', '#ORD-0928-012', 'Held · WhatsApp · paid · confirmed', '8 min 2 s', 'ok']].map(function (x) { var ok = x[4] === 'ok'; return { t: x[0], o: x[1], p: x[2], d: x[3], s: ok ? 'Succeeded' : 'Failed', bi: ok ? 'check' : 'triangle-alert', bb: ok ? 'var(--fill-success-soft)' : 'var(--fill-error-soft)', bf: ok ? 'var(--text-success)' : 'var(--text-danger)' }; });
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

.pgc>*{flex-shrink:0}.tb th{white-space:normal}.stp2{flex-shrink:0}.pgc>.fill{flex-shrink:1;min-height:0}
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

.wfbar{display:flex;align-items:center;gap:10px;padding:10px 14px;border-bottom:1px solid var(--slate-200);background:var(--surface-card)}
.wtab{height:36px;padding:0 14px;border:0;border-radius:var(--radius-lg);background:transparent;font:inherit;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--text-muted);cursor:pointer}
.wtab.on{background:var(--slate-100);color:var(--slate-900)}.wtab:focus-visible{outline:3px solid rgba(0,48,135,.5)}
.canvas{position:relative;height:640px;overflow-x:auto;overflow-y:hidden;background-color:var(--slate-50);background-image:radial-gradient(var(--slate-300) 1px,transparent 1px);background-size:20px 20px}
.layer{position:absolute;left:0;top:0;height:640px;transform-origin:0 0;transition:transform 200ms ease}
.node{position:absolute;width:76px;height:76px;border-radius:var(--radius-xl);border:2px solid var(--slate-300);background:var(--surface-card);box-shadow:0 1px 3px rgba(15,23,42,.08);display:flex;align-items:center;justify-content:center;cursor:pointer;padding:0;font:inherit}
.node:hover{border-color:var(--slate-400)}.node.sel{border-color:var(--primary);box-shadow:0 0 0 4px var(--fill-primary-soft-hover)}
.node.ok{border-color:var(--fill-success)}.node.trig{border-radius:38px var(--radius-xl) var(--radius-xl) 38px}
.node:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:3px}
.nlab{position:absolute;width:130px;text-align:center;font-size:var(--text-xs);line-height:17px;font-weight:var(--weight-medium);color:var(--slate-800)}
.nsub{display:block;font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.done{position:absolute;right:-8px;top:-8px;width:20px;height:20px;border-radius:var(--radius-full);background:var(--fill-success);color:var(--text-on-dark);display:flex;align-items:center;justify-content:center;border:2px solid var(--surface-card)}
.port{position:absolute;width:10px;height:10px;border-radius:var(--radius-full);background:var(--slate-400);border:2px solid var(--slate-50)}
.plus{position:absolute;width:24px;height:28px;border-radius:var(--radius-md);border:1.5px solid var(--slate-400);background:var(--surface-card);color:var(--slate-600);cursor:pointer;padding:0;display:inline-flex;align-items:center;justify-content:center}
.plus:hover{border-color:var(--primary);color:var(--primary)}.plus:focus-visible{outline:3px solid rgba(0,48,135,.5)}
.elab{position:absolute;font-size:var(--text-2xs);font-weight:var(--weight-medium);padding:1px 6px;border-radius:var(--radius-full);background:var(--slate-50)}
.items{position:absolute;font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-success);background:var(--slate-50);padding:0 4px}
.sticky{position:absolute;padding:12px 14px;border-radius:var(--radius-lg);background:var(--fill-warning-soft);border:1px solid var(--slate-200);font-size:var(--text-xs);line-height:18px;color:var(--slate-800)}
.zoom{position:absolute;left:14px;bottom:14px;display:flex;gap:6px}
.zoom button{width:36px;height:36px;border-radius:var(--radius-lg);border:1px solid var(--slate-300);background:var(--surface-card);font:inherit;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--slate-700);cursor:pointer;display:inline-flex;align-items:center;justify-content:center;padding:0}
.drawer{position:absolute;top:12px;right:12px;bottom:12px;width:380px;background:var(--surface-card);border-radius:var(--radius-xl);border:1px solid var(--slate-200);box-shadow:0 18px 40px -16px rgba(15,23,42,.35);display:flex;flex-direction:column;overflow:hidden;z-index:5}
.citem{display:flex;align-items:center;gap:12px;width:100%;padding:10px 16px;border:0;background:transparent;font:inherit;text-align:left;cursor:pointer}
.citem:hover{background:var(--slate-50)}.citem:focus-visible{outline:3px solid rgba(0,48,135,.5);outline-offset:-3px}
.ico{width:34px;height:34px;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;flex-shrink:0}
.cond{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:10px;border-radius:var(--radius-lg);background:var(--slate-50)}.cond .inp:first-child{grid-column:1/-1}
.cond .inp{height:36px;font-size:var(--text-xs-plus);padding:0 10px}
.badge.sb::before{display:none}
.wtab{color:var(--slate-600)}
`;

// ---- markup ----

export default class WorkflowBuilderScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="WorkflowBuilder">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "var(--surface-desk)", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="auto-builder" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "var(--slate-50)", borderRadius: "var(--radius-xl)", border: "1px solid var(--slate-200)", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Automation" page="Workflow builder" placeholder="Search" />
            <div className="pgc gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "22px" }}>
              <__PageHeader title="Workflow builder" />
              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <__Link href="/automations" className="abtn" style={{ textDecoration: "none" }}>Rules</__Link>
                <input className="inp" aria-label="Workflow name" value={v.name} onChange={v.onName} style={{ maxWidth: "440px", fontWeight: "var(--weight-semibold)", fontSize: "var(--text-base)" }} />
                <span className="pill">{v.nodeCount}</span>
                <span style={{ flexGrow: "1" }} />
                <span style={__sx(`font-size: var(--text-xs-plus); font-weight: var(--weight-medium); color: ${v.actC ?? ""};`)}>{v.actL}</span>
                <button type="button" className={v.active?.cls} role="switch" aria-checked={v.active?.on} aria-label="Active" onClick={v.active?.toggle} />
                <button type="button" className="btn line sm" onClick={v.save}>{v.saveL}</button>
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
              <section className="tc" style={{ overflow: "hidden" }}>
                <div className="wfbar">
                  <div style={{ display: "flex", gap: "4px" }}>
                    {__list(v.tabs).map((t, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={t?.cls} aria-pressed={t?.on} onClick={t?.pick}>{t?.l}</button>
                      </React.Fragment>))}
                  </div>
                  <span style={{ flexGrow: "1" }} />
                  <span style={{ fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>{v.runNote}</span>
                  <button type="button" className="gc-btn gc-btn--solid gc-btn--sm" onClick={v.test}><__Icon name="play" width="16" height="16" aria-hidden="true" />Test workflow</button>
                  <button type="button" className="btn line sm" onClick={v.openCreator}><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add node</button>
                </div>
                {v.isEditor ? (<>
                  <div style={{ position: "relative" }}>
                    <div className="canvas">
                      <div className="layer" style={__sx(`width: ${v.layerW ?? ""}px; transform: scale(${v.zoom ?? ""});`)}>
                        <div className="sticky" style={{ left: "24px", top: "450px", width: "300px" }}><b>How this works</b><br />Big COD orders going outside Dhaka are held until the customer pays the delivery charge by bKash. If they have not paid after 30 minutes, the AI calls them.</div>
                        {__list(v.edges).map((e, $index) => (<React.Fragment key={$index}>
                            <svg width={e?.w} height={e?.h} style={__sx(`position: absolute; left: ${e?.l ?? ""}px; top: ${e?.t ?? ""}px; overflow: visible; pointer-events: none;`)} aria-hidden="true">
                              <path d={e?.d} fill="none" strokeWidth="2" strokeDasharray={e?.ran ? undefined : "5 4"} style={{ stroke: e?.c }} />
                              <path d={e?.a} style={{ fill: e?.c }} />
                            </svg>
                            {e?.hasLab ? (<>
                              <span className="elab" style={__sx(`left: ${e?.lx ?? ""}px; top: ${e?.ly ?? ""}px; color: ${e?.lc ?? ""};`)}>{e?.lab}</span>
                            </>) : null}
                            {e?.ran ? (<>
                              <span className="items" style={__sx(`left: ${e?.ix ?? ""}px; top: ${e?.iy ?? ""}px;`)}>1 item</span>
                            </>) : null}
                          </React.Fragment>))}
                        {__list(v.nodes).map((n, $index) => (<React.Fragment key={$index}>
                            <button type="button" className={n?.cls} style={__sx(`left: ${n?.x ?? ""}px; top: ${n?.y ?? ""}px;`)} onClick={n?.pick} aria-label={n?.name}>
                              <span className="ico" style={__sx(`width: 42px; height: 42px; background: ${n?.bg ?? ""}; color: ${n?.fg ?? ""};`)}>
                                {n?.is_trig ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
                                  </svg>
                                </>) : null}
                                {n?.is_if ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 3v12" />
                                    <circle cx="18" cy="6" r="3" />
                                    <circle cx="6" cy="18" r="3" />
                                    <path d="M18 9a9 9 0 0 1-9 9" />
                                  </svg>
                                </>) : null}
                                {n?.is_hold ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <rect x="6" y="4" width="4" height="16" rx="1" />
                                    <rect x="14" y="4" width="4" height="16" rx="1" />
                                  </svg>
                                </>) : null}
                                {n?.is_wa ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z" />
                                  </svg>
                                </>) : null}
                                {n?.is_wait ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                    <circle cx="12" cy="12" r="9" />
                                    <path d="M12 7v5l3 3" />
                                  </svg>
                                </>) : null}
                                {n?.is_call ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                                  </svg>
                                </>) : null}
                                {n?.is_ok ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20 6 9 17l-5-5" />
                                  </svg>
                                </>) : null}
                                {n?.is_truck ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 6h11v10H3z" />
                                    <path d="M14 10h4l3 3v3h-7" />
                                    <circle cx="7" cy="18" r="2" />
                                    <circle cx="17" cy="18" r="2" />
                                  </svg>
                                </>) : null}
                                {n?.is_sms ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                  </svg>
                                </>) : null}
                                {n?.is_tag ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
                                    <circle cx="7.5" cy="7.5" r="1.5" />
                                  </svg>
                                </>) : null}
                                {n?.is_bell ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                    <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                                  </svg>
                                </>) : null}
                                {n?.is_split ? (<>
                                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                    <path d="M3 12h6l6-6h6M9 12l6 6h6" />
                                  </svg>
                                </>) : null}
                              </span>
                              {n?.ok ? (<>
                                <span className="done"><__Icon name="check" width="12" height="12" role="img" aria-label="Ran in the last test" /></span>
                              </>) : null}
                            </button>
                            <span className="port" style={__sx(`left: ${n?.px ?? ""}px; top: ${n?.py ?? ""}px; display: ${n?.inDisp ?? ""};`)} />
                            <span className="nlab" style={__sx(`left: ${n?.lx ?? ""}px; top: ${n?.ly ?? ""}px;`)}>{n?.name}<span className="nsub">{n?.sub}</span></span>
                          </React.Fragment>))}
                        {__list(v.pluses).map((p, $index) => (<React.Fragment key={$index}>
                            <button type="button" className="plus" style={__sx(`left: ${p?.x ?? ""}px; top: ${p?.y ?? ""}px;`)} onClick={p?.add} aria-label={`Add a node after ${p?.after ?? ""}${p?.hasLab ? ", " + p.lab + " branch" : ""}`}><__Icon name="plus" width="14" height="14" aria-hidden="true" /></button>
                            {p?.hasLab ? (<>
                              <span className="elab" style={__sx(`left: ${p?.lx ?? ""}px; top: ${p?.ly ?? ""}px; color: ${p?.lc ?? ""};`)}>{p?.lab}</span>
                            </>) : null}
                          </React.Fragment>))}
                      </div>
                    </div>
                    <div className="zoom">
                      <button type="button" onClick={v.zOut} aria-label="Zoom out"><__Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                      <button type="button" onClick={v.zFit} aria-label="Fit to view" style={{ width: "52px", fontSize: "var(--text-xs)" }}>{v.zoomL}</button>
                      <button type="button" onClick={v.zIn} aria-label="Zoom in"><__Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                    </div>
                    {v.creatorOpen ? (<>
                      <div className="drawer" role="region" aria-label="Node panel">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid var(--slate-200)" }}>
                          <div style={{ flexGrow: "1" }}>
                            <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--slate-900)" }}>{v.creatorTitle}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.creatorSub}</div>
                          </div>
                          <button type="button" className="ib" aria-label="Close panel" onClick={v.closeDrawer}><__Icon name="x" width="18" height="18" aria-hidden="true" /></button>
                        </div>
                        <div style={{ padding: "12px 16px" }}>
                          <input className="inp" aria-label="Search nodes" placeholder="Search nodes" value={v.q} onChange={v.onQ} />
                        </div>
                        <div style={{ flexGrow: "1", overflow: "auto" }}>
                          {__list(v.catalog).map((g, $index) => (<React.Fragment key={$index}>
                              <div style={{ padding: "8px 16px 4px", fontSize: "var(--text-xs)", fontWeight: "var(--weight-medium)", color: "var(--text-muted)" }}>{g?.cat}</div>
                              {__list(g?.items).map((it, $index) => (<React.Fragment key={$index}>
                                  <button type="button" className="citem" onClick={it?.add}>
                                    <span className="ico" style={__sx(`background: ${it?.bg ?? ""}; color: ${it?.fg ?? ""};`)}>
                                      {it?.is_trig ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_if ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M6 3v12" />
                                          <circle cx="18" cy="6" r="3" />
                                          <circle cx="6" cy="18" r="3" />
                                          <path d="M18 9a9 9 0 0 1-9 9" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_hold ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                          <rect x="6" y="4" width="4" height="16" rx="1" />
                                          <rect x="14" y="4" width="4" height="16" rx="1" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_wa ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_wait ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                          <circle cx="12" cy="12" r="9" />
                                          <path d="M12 7v5l3 3" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_call ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_ok ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M20 6 9 17l-5-5" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_truck ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M3 6h11v10H3z" />
                                          <path d="M14 10h4l3 3v3h-7" />
                                          <circle cx="7" cy="18" r="2" />
                                          <circle cx="17" cy="18" r="2" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_sms ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_tag ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
                                          <circle cx="7.5" cy="7.5" r="1.5" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_bell ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                          <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                                        </svg>
                                      </>) : null}
                                      {it?.is_split ? (<>
                                        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                          <path d="M3 12h6l6-6h6M9 12l6 6h6" />
                                        </svg>
                                      </>) : null}
                                    </span>
                                    <span style={{ flexGrow: "1", minWidth: "0" }}>
                                      <span style={{ display: "block", fontSize: "var(--text-sm)", fontWeight: "var(--weight-medium)", color: "var(--slate-900)" }}>{it?.n}</span>
                                      <span style={{ display: "block", fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{it?.d}</span>
                                    </span>
                                  </button>
                                </React.Fragment>))}
                            </React.Fragment>))}
                          {v.noResults ? (<>
                            <div style={{ padding: "16px", fontSize: "var(--text-xs-plus)", color: "var(--text-muted)" }}>No node matches that search.</div>
                          </>) : null}
                        </div>
                      </div>
                    </>) : null}
                    {v.ndvOpen ? (<>
                      <div className="drawer" role="region" aria-label="Node panel">
                        <div style={{ display: "flex", alignItems: "center", gap: "10px", padding: "14px 16px", borderBottom: "1px solid var(--slate-200)" }}>
                          <span className="ico" style={__sx(`background: ${v.sel?.bg ?? ""}; color: ${v.sel?.fg ?? ""};`)}>
                            {v.sel?.is_trig ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M13 2 3 14h9l-1 8 10-12h-9z" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_if ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 3v12" />
                                <circle cx="18" cy="6" r="3" />
                                <circle cx="6" cy="18" r="3" />
                                <path d="M18 9a9 9 0 0 1-9 9" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_hold ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <rect x="6" y="4" width="4" height="16" rx="1" />
                                <rect x="14" y="4" width="4" height="16" rx="1" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_wa ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 11.5a8.4 8.4 0 0 1-12.4 7.4L3 21l2.1-5.4A8.5 8.5 0 1 1 21 11.5z" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_wait ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                                <circle cx="12" cy="12" r="9" />
                                <path d="M12 7v5l3 3" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_call ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_ok ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20 6 9 17l-5-5" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_truck ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 6h11v10H3z" />
                                <path d="M14 10h4l3 3v3h-7" />
                                <circle cx="7" cy="18" r="2" />
                                <circle cx="17" cy="18" r="2" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_sms ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_tag ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M20.6 13.4 13.4 20.6a2 2 0 0 1-2.8 0L3 13V3h10l7.6 7.6a2 2 0 0 1 0 2.8z" />
                                <circle cx="7.5" cy="7.5" r="1.5" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_bell ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M6 8a6 6 0 0 1 12 0c0 7 3 9 3 9H3s3-2 3-9" />
                                <path d="M10.3 21a1.9 1.9 0 0 0 3.4 0" />
                              </svg>
                            </>) : null}
                            {v.sel?.is_split ? (<>
                              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                                <path d="M3 12h6l6-6h6M9 12l6 6h6" />
                              </svg>
                            </>) : null}
                          </span>
                          <div style={{ flexGrow: "1", minWidth: "0" }}>
                            <div style={{ fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)", color: "var(--slate-900)" }}>{v.sel?.name}</div>
                            <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{v.sel?.sub}</div>
                          </div>
                          <button type="button" className="ib" aria-label="Close panel" onClick={v.closeDrawer}><__Icon name="x" width="18" height="18" aria-hidden="true" /></button>
                        </div>
                        <div style={{ display: "flex", gap: "6px", padding: "10px 16px", borderBottom: "1px solid var(--slate-100)", fontSize: "var(--text-xs)" }}>
                          <span className="pill">Input · {v.sel?.inN}</span>
                          <span className="pill" style={__sx(`background: ${v.sel?.outBg ?? ""}; color: ${v.sel?.outFg ?? ""};`)}>Output · {v.sel?.outN}</span>
                        </div>
                        <div style={{ flexGrow: "1", overflow: "auto", padding: "14px 16px", display: "flex", flexDirection: "column", gap: "12px" }}>
                          {v.sel?.isIf ? (<>
                            <span className="lbl">Conditions · all must match</span>
                            {__list(v.sel?.conds).map((c, $index) => (<React.Fragment key={$index}>
                                <div className="cond">
                                  <input className="inp" aria-label="Field" value={c?.f} onChange={c?.onF} />
                                  <input className="inp" aria-label="Operator" value={c?.o} onChange={c?.onO} />
                                  <input className="inp" aria-label="Value" value={c?.v} onChange={c?.onV} />
                                </div>
                              </React.Fragment>))}
                            <button type="button" className="abtn" onClick={v.sel?.addCond} style={{ alignSelf: "flex-start" }}><__Icon name="plus" width="14" height="14" aria-hidden="true" />Add condition</button>
                          </>) : null}
                          {__list(v.sel?.params).map((p, $index) => (<React.Fragment key={$index}>
                              <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                                <label className="lbl" htmlFor={`wf-param-${$index}`}>{p?.l}</label>
                                <input className="inp" id={`wf-param-${$index}`} value={p?.v} onChange={p?.on} />
                                {p?.hasHint ? (<>
                                  <span style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{p?.hint}</span>
                                </>) : null}
                              </div>
                            </React.Fragment>))}
                          {v.sel?.hasOut ? (<>
                            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                              <span className="lbl">Last test output</span>
                              <pre className="code mono">{v.sel?.out}</pre>
                            </div>
                          </>) : null}
                        </div>
                        <div style={{ display: "flex", gap: "8px", padding: "12px 16px", borderTop: "1px solid var(--slate-200)" }}>
                          <button type="button" className="btn solid sm" onClick={v.testStep}>Test step</button>
                          <span style={{ flexGrow: "1" }} />
                          <button type="button" className="btn line sm" onClick={v.delNode}>Delete</button>
                        </div>
                      </div>
                    </>) : null}
                  </div>
                </>) : null}
                {v.isExec ? (<>
                  <div className="gc-table-wrap">
                    <table className="tb">
                      <thead>
                        <tr>
                          <th>Started</th>
                          <th>Order</th>
                          <th>Path</th>
                          <th>Took</th>
                          <th>Status</th>
                        </tr>
                      </thead>
                      <tbody>
                        {__list(v.execs).map((x, $index) => (<React.Fragment key={$index}>
                            <tr className="row">
                              <td style={{ whiteSpace: "nowrap", color: "var(--slate-600)" }}>{x?.t}</td>
                              <td className="mono" style={{ fontWeight: "var(--weight-medium)" }}>{x?.o}</td>
                              <td style={{ color: "var(--slate-600)" }}>{x?.p}</td>
                              <td className="tn">{x?.d}</td>
                              <td>
                                <span className="badge sb" style={__sx(`background: ${x?.bb ?? ""}; color: ${x?.bf ?? ""};`)}><__Icon name={x?.bi} width="12" height="12" aria-hidden="true" />{x?.s}</span>
                              </td>
                            </tr>
                          </React.Fragment>))}
                      </tbody>
                    </table>
                  </div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
