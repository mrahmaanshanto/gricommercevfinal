'use client';
// Workflow builder — the node editor in Shopify density (components/ui/IndexKit.jsx RecordHeader): back to Rules,
// the workflow's name with its Active badge, Turn on / off, Save. One card holds the Editor / Executions views, the
// test-run note, Add node and Test workflow, then the canvas (trigger, IF branches, actions; the node panel slides in
// on the right) or the run list. Rename is under More actions.
// Edit freely: this file is the source for the screen.

import React from 'react';
import { DCLogic, Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { RecordHeader, IndexTabs } from '@/components/ui/IndexKit';

// ---- logic ----

function val(e) { return e && e.target ? e.target.value : e; }

// type -> [type, bg, fg, subtitle]
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
var NODE_ICON = { trig: 'zap', if: 'git-branch', hold: 'pause', wa: 'message-circle', wait: 'clock', call: 'phone', ok: 'check', truck: 'truck', sms: 'message-square', tag: 'tag', bell: 'bell', split: 'split' };
class Component extends DCLogic {
  // phones: open the canvas at 100% so labels stay readable; it pans inside a box about 70% of the screen tall.
  // The % button still zooms to fit the whole drawing.
  componentDidMount() {
    if (typeof window === 'undefined' || !window.matchMedia || !window.matchMedia('(max-width:640px)').matches) return;
    var nodes = (this.state && this.state.nodes) || START;
    var w = Math.max(960, Math.max.apply(null, nodes.map(function (n) { return n.x; })) + 116);
    var cw = this.canvasEl ? this.canvasEl.clientWidth : window.innerWidth - 32;
    var fit = Math.min(1, Math.max(.3, Math.floor((cw - 8) / w * 100) / 100));
    this.setState({ z: 1, fitZ: fit });
  }
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
      toast(nm + ' added. Set it up in the panel on the right.');
    }
    var ranSet = {}; if (ran) ran.forEach(function (id) { ranSet[id] = 1; });
    var pluses = [];
    nodes.forEach(function (n) { var o = outs(n.id);
      if (n.ty === 'if') { ['true', 'false'].forEach(function (lab) { if (!o.some(function (e) { return e[2] === lab; })) pluses.push({ from: n.id, lab: lab, x: n.x + NW + 26, y: n.y + (lab === 'true' ? 14 : 44) }); }); }
      else if (!o.length) pluses.push({ from: n.id, lab: '', x: n.x + NW + 26, y: n.y + 26 }); });
    var v = {
      name: s.name == null ? 'Advance charge for big outside-Dhaka COD orders' : s.name, onName: function (e) { self.setState({ name: val(e) }); },
      nodeCount: nodes.length + ' nodes', layerW: Math.max(960, Math.max.apply(null, nodes.map(function (n) { return n.x; })) + 116),
      canvasH: Math.round(Math.max(570, Math.max.apply(null, nodes.map(function (n) { return n.y; })) + 140) * z + 64) + 'px',
      active: s.act !== false, toggleActive: function () { var on = s.act === false; self.setState({ act: on }); toast(on ? 'Workflow turned on.' : 'Workflow turned off. It stops at the next matching event.'); },
      saveL: s.saved ? 'Saved' : 'Save', save: function () { self.setState({ saved: true }); toast('Workflow saved.'); },
      tabs: [['editor', 'Editor'], ['exec', 'Executions']].map(function (t) { var on = t[0] === tab; return { key: t[0], label: t[1], id: 'wf-tab-' + t[0], on: on, onClick: function () { self.setState({ tab: t[0] }); } }; }),
      isEditor: tab === 'editor', isExec: tab === 'exec',
      runNote: ran ? 'Last test: #ORD-0929-007 · ' + ran.length + ' of ' + nodes.length + ' nodes ran · 1.4 s' : 'Tests run on a real order. Nothing is sent to the customer.',
      test: function () { self.setState({ ran: TEST_PATH.filter(function (id) { return byId[id]; }), tab: 'editor' }); toast('Test run on #ORD-0929-007 (৳12,400, COD, Chattogram): took the true branch, no advance paid, ended at AI call. Nothing was sent.'); },
      zoom: z, zoomL: Math.round(z * 100) + '%', zIn: function () { self.setState({ z: Math.min(1.2, +(z + .1).toFixed(1)) }); }, zOut: function () { self.setState({ z: Math.max(Math.min(.6, s.fitZ || .6), +(z - .1).toFixed(1)) }); }, zFit: function () { self.setState({ z: s.fitZ || 1 }); },
      nodes: nodes.map(function (n) { var t = TY[n.ty], ok = !!ranSet[n.id];
        return { name: n.name, sub: t[3], x: n.x, y: n.y, icon: NODE_ICON[n.ty], bg: t[1], fg: t[2], ok: ok, cls: 'node' + (n.ty === 'trig' ? ' trig' : '') + (ok ? ' ok' : '') + (sel === n.id ? ' sel' : ''),
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
    v.catalog = CAT.map(function (g) { return { cat: g[0], items: g[1].filter(function (it) { return !q || (it[1] + ' ' + it[2]).toLowerCase().indexOf(q) >= 0; }).filter(function (it) { return g[0] !== 'Triggers'; }).map(function (it) { var t = TY[it[0]]; var tt = it[0]; return { icon: NODE_ICON[tt], n: it[1], d: it[2], bg: t[1], fg: t[2], add: function () { if (s.creator) addAfter(s.creator.from, s.creator.lab, it[0], it[1]); } }; }) }; }).filter(function (g) { return g.items.length; });
    v.noResults = v.catalog.length === 0;
    if (sel && byId[sel]) { var n = byId[sel], t = TY[n.ty], hasRun = !!ranSet[n.id];
      v.sel = { icon: NODE_ICON[n.ty], name: n.name, sub: t[3], bg: t[1], fg: t[2], isIf: n.ty === 'if', inN: n.ty === 'trig' ? 'none' : hasRun ? '1 item' : 'run a test', outN: hasRun ? '1 item' : 'not run yet', ran: hasRun,
        conds: (n.c || []).map(function (c, i) { function f(k) { return function (e) { upd(n.id, function (m) { m.c[i][k] = val(e); return m; }); }; } return { f: c[0], o: c[1], v: c[2], onF: f(0), onO: f(1), onV: f(2) }; }),
        addCond: function () { upd(n.id, function (m) { m.c.push(['Field', 'is', 'value']); return m; }); },
        params: [['Name', n.name, '']].concat((n.p || []).map(function (p) { return [p[0], p[1], p[0] === 'Template' ? 'Approved by WhatsApp · Bangla' : p[0] === 'Wait for' ? 'Customers are never messaged during quiet hours.' : '']; })).map(function (p, i) { return { l: p[0], v: p[1], hasHint: !!p[2], hint: p[2], on: function (e) { upd(n.id, function (m) { if (i === 0) m.name = val(e); else m.p[i - 1][1] = val(e); return m; }); } }; }),
        hasOut: hasRun, out: OUT[n.id] || '1 item' };
    } else v.sel = { name: '', sub: '', bg: '', fg: '', icon: '', isIf: false, conds: [], params: [], hasOut: false, out: '', inN: '', outN: '', ran: false };
    v.testStep = function () { if (!sel) return; var r = (ran || []).slice(); if (r.indexOf(sel) < 0) r.push(sel); self.setState({ ran: r }); toast('Step tested with #ORD-0929-007.'); };
    v.delNode = function () { if (!sel) return; if (byId[sel].ty === 'trig') { toast('A workflow needs its trigger. Change it instead.', { tone: 'error' }); return; } if (outs(sel).length) { toast('Delete the nodes after this one first.', { tone: 'error' }); return; } var nm = byId[sel].name; self.setState({ nodes: nodes.filter(function (m) { return m.id !== sel; }), edges: edges.filter(function (e) { return e[1] !== sel; }), sel: null }); toast(nm + ' deleted.'); };
    v.execs = [['29 Sep, 1:40 PM', '#ORD-0929-007', 'Held · WhatsApp · waited · AI call', '30 min 6 s', 'ok'], ['29 Sep, 11:12 AM', '#ORD-0929-003', 'Held · WhatsApp · paid · confirmed', '12 min 40 s', 'ok'], ['28 Sep, 8:05 PM', '#ORD-0928-041', 'Not a big COD order · AI call · courier', '48 s', 'ok'], ['28 Sep, 4:22 PM', '#ORD-0928-030', 'WhatsApp failed: number not on WhatsApp', '2 s', 'fail'], ['28 Sep, 10:15 AM', '#ORD-0928-012', 'Held · WhatsApp · paid · confirmed', '8 min 2 s', 'ok']].map(function (x) { var ok = x[4] === 'ok'; return { t: x[0], o: x[1], p: x[2], d: x[3], s: ok ? 'Succeeded' : 'Failed', bi: ok ? 'check' : 'triangle-alert', tone: ok ? 'success' : 'error' }; });
    return v;
  }
}

// ---- styles ----

const CSS = `
.wf-card{overflow:clip}
.wfbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);min-height:44px;padding:6px 8px;border-bottom:1px solid var(--border-subtle)}
.wfbar .ix-tabs{flex:none}
.wf-note{flex:1;min-width:0;font-size:var(--text-xs);color:var(--text-muted);text-align:right}
.wf-rename{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2)}
.wf-rename>div{flex:1 1 280px;min-width:0}
.canvas{position:relative;height:640px;overflow-x:auto;overflow-y:hidden;background-color:var(--slate-50);background-image:radial-gradient(var(--slate-300) 1px,transparent 1px);background-size:20px 20px}
.layer{position:absolute;left:0;top:0;height:640px;transform-origin:0 0;transition:transform 200ms ease}
.node{position:absolute;display:flex;align-items:center;justify-content:center;width:76px;height:76px;padding:0;border:2px solid var(--slate-300);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;cursor:pointer}
.node:hover{border-color:var(--slate-400)}
.node.sel{border-color:var(--primary);box-shadow:0 0 0 4px var(--fill-primary-soft-hover)}
.node.ok{border-color:var(--fill-success)}
.node.trig{border-radius:38px var(--radius-xl) var(--radius-xl) 38px}
.node:focus-visible{outline:2px solid var(--primary);outline-offset:3px}
.ico{display:flex;flex:none;align-items:center;justify-content:center;width:32px;height:32px;border-radius:var(--radius-lg)}
.node .ico{width:40px;height:40px}
.nlab{position:absolute;width:130px;text-align:center;font-size:var(--text-xs);line-height:16px;font-weight:var(--weight-medium);color:var(--slate-800)}
.nsub{display:block;font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.done{position:absolute;right:-8px;top:-8px;display:flex;align-items:center;justify-content:center;width:20px;height:20px;border:2px solid var(--surface-card);border-radius:var(--radius-full);background:var(--fill-success);color:var(--text-on-dark)}
.port{position:absolute;width:10px;height:10px;border:2px solid var(--slate-50);border-radius:var(--radius-full);background:var(--slate-400)}
.plus{position:absolute;display:inline-flex;align-items:center;justify-content:center;width:24px;height:28px;padding:0;border:1.5px solid var(--slate-400);border-radius:var(--radius-md);background:var(--surface-card);color:var(--slate-600);cursor:pointer}
.plus:hover{border-color:var(--primary);color:var(--primary)}
.plus:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.elab{position:absolute;padding:1px 6px;border-radius:var(--radius-full);background:var(--slate-50);font-size:var(--text-2xs);font-weight:var(--weight-medium)}
.items{position:absolute;padding:0 4px;background:var(--slate-50);font-size:var(--text-2xs);font-weight:var(--weight-medium);color:var(--text-success)}
.sticky{position:absolute;padding:10px 12px;border:1px solid var(--slate-200);border-radius:var(--radius-lg);background:var(--fill-warning-soft);font-size:var(--text-xs);line-height:18px;color:var(--slate-800)}
.zoom{position:absolute;left:12px;bottom:12px;display:flex;gap:6px}
.zoom .ix-btn{background:var(--surface-card)}
.drawer{position:absolute;top:10px;right:10px;bottom:10px;z-index:5;display:flex;flex-direction:column;width:360px;overflow:hidden;border:1px solid var(--slate-200);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-lg)}
.drawer__head{display:flex;align-items:center;gap:10px;padding:10px 12px 10px 16px;border-bottom:1px solid var(--border-subtle)}
.drawer__head>div{flex:1;min-width:0}
.drawer__title{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.drawer__sub{font-size:var(--text-xs);color:var(--text-muted)}
.drawer__search{padding:10px 16px}
.drawer__list{flex:1;overflow:auto}
.drawer__cat{padding:8px 16px 4px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.drawer__pills{display:flex;gap:6px;padding:8px 16px;border-bottom:1px solid var(--border-subtle)}
.drawer__body{display:flex;flex:1;flex-direction:column;gap:var(--space-3);padding:12px 16px;overflow:auto}
.drawer__body .gc-label{margin-bottom:6px}
.drawer__foot{display:flex;justify-content:space-between;gap:8px;padding:10px 16px;border-top:1px solid var(--border-subtle)}
.drawer__none{padding:16px;font-size:var(--text-xs-plus);color:var(--text-muted)}
.citem{display:flex;align-items:center;gap:12px;width:100%;padding:8px 16px;border:0;background:transparent;font:inherit;text-align:left;cursor:pointer}
.citem:hover{background:var(--slate-50)}
.citem:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.citem b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.citem small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cond{display:grid;grid-template-columns:1fr 1fr;gap:6px;padding:8px;border-radius:var(--radius-lg);background:var(--slate-50)}
.cond .gc-input:first-child{grid-column:1/-1}
.wf-pill{display:inline-flex;align-items:center;height:20px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.wf-pill.is-ok{background:var(--fill-success-soft);color:var(--text-success)}
.wf-addcond{align-self:flex-start}
.wf-hint{display:block;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.wf-out{margin:0;padding:10px 12px;border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-code);font-size:var(--text-xs);line-height:18px;color:var(--text-heading);white-space:pre-wrap}
.wf-id{font-family:var(--font-data)}
/* phones: the toolbar wraps; the canvas opens at 100% and pans inside a box at most 70% of the screen tall (never
   taller than the drawing); the node panel sits under the canvas */
.wf-pan{display:none}
@media (max-width:640px){
  .wf-note{flex:1 1 100%;text-align:left}
  .canvas{height:min(70vh,var(--wf-ch,640px));overflow:auto;-webkit-overflow-scrolling:touch}
  .zoom{bottom:auto;top:calc(min(70vh,var(--wf-ch,640px)) - 46px)}
  .wf-pan{position:absolute;right:12px;top:12px;display:block;padding:4px 10px;border:1px solid var(--slate-200);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-muted);pointer-events:none}
  .drawer{position:relative;top:auto;right:auto;bottom:auto;width:auto;max-height:75vh;margin:0 12px 12px}
}
`;

// ---- markup ----

export default class WorkflowBuilderScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const st = this.state || {};
    const renaming = !!st.renaming;
    return (
      <div className="dc-screen ds" data-screen="WorkflowBuilder">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <Sidebar sticky="" active="auto-builder" />
          <main className="gc-shell__main">
            <Topbar crumb="Automation" page="Workflow builder" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <RecordHeader back="/automations" backLabel="Rules" title={v.name || 'Workflow builder'}
                  badges={v.active ? <StatusBadge tone="success">Active</StatusBadge> : <StatusBadge tone="neutral">Inactive</StatusBadge>}
                  meta={v.nodeCount}
                  about="Build a workflow on the canvas: a trigger, IF branches and actions. Test it on a real order (nothing is sent to the customer), then save it and turn it on. Executions lists every run."
                  secondary={[{ label: v.active ? 'Turn off' : 'Turn on', onClick: v.toggleActive }]}
                  more={[{ label: 'Rename', onClick: () => this.setState({ renaming: !renaming }) }, { label: 'Workflow settings', href: '/workflow-settings' }]}
                  primary={{ label: v.saveL, onClick: v.save }} />

                {renaming ? (
                  <section className="ix-card ix-card--pad">
                    <div className="wf-rename">
                      <div><label className="gc-label" htmlFor="wf-name">Workflow name</label><input id="wf-name" className="gc-input" value={v.name} onChange={v.onName} autoFocus /></div>
                      <button type="button" className="ix-btn" onClick={() => this.setState({ renaming: false })}>Done</button>
                    </div>
                  </section>
                ) : null}

                <section className="ix-card wf-card" aria-label="Workflow">
                  <div className="wfbar">
                    <IndexTabs tabs={v.tabs} label="Workflow view" />
                    <span className="wf-note">{v.runNote}</span>
                    <button type="button" className="ix-btn ix-btn--sm" onClick={v.openCreator}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add node</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={v.test}><Icon name="play" width="16" height="16" aria-hidden="true" />Test workflow</button>
                  </div>
                  {v.isEditor ? (
                    <div style={{ position: 'relative', '--wf-ch': v.canvasH }}>
                      <div className="canvas" ref={(el) => { this.canvasEl = el; }}>
                        <div className="layer" style={{ width: v.layerW + 'px', transform: 'scale(' + v.zoom + ')' }}>
                          <div className="sticky" style={{ left: 24, top: 450, width: 300 }}><b>How this works</b><br />Big COD orders going outside Dhaka are held until the customer pays the delivery charge by bKash. If they have not paid after 30 minutes, the AI calls them.</div>
                          {v.edges.map((e, i) => (
                            <React.Fragment key={'e' + i}>
                              <svg width={e.w} height={e.h} style={{ position: 'absolute', left: e.l, top: e.t, overflow: 'visible', pointerEvents: 'none' }} aria-hidden="true">
                                <path d={e.d} fill="none" strokeWidth="2" strokeDasharray={e.ran ? undefined : '5 4'} style={{ stroke: e.c }} />
                                <path d={e.a} style={{ fill: e.c }} />
                              </svg>
                              {e.hasLab ? <span className="elab" style={{ left: e.lx, top: e.ly, color: e.lc }}>{e.lab}</span> : null}
                              {e.ran ? <span className="items" style={{ left: e.ix, top: e.iy }}>1 item</span> : null}
                            </React.Fragment>
                          ))}
                          {v.nodes.map((n, i) => (
                            <React.Fragment key={'n' + i}>
                              <button type="button" className={n.cls} style={{ left: n.x, top: n.y }} onClick={n.pick} aria-label={n.name}>
                                <span className="ico" style={{ background: n.bg, color: n.fg }}><Icon name={n.icon} width="20" height="20" aria-hidden="true" /></span>
                                {n.ok ? <span className="done"><Icon name="check" width="12" height="12" role="img" aria-label="Ran in the last test" /></span> : null}
                              </button>
                              <span className="port" style={{ left: n.px, top: n.py, display: n.inDisp }} />
                              <span className="nlab" style={{ left: n.lx, top: n.ly }}>{n.name}<span className="nsub">{n.sub}</span></span>
                            </React.Fragment>
                          ))}
                          {v.pluses.map((p, i) => (
                            <React.Fragment key={'p' + i}>
                              <button type="button" className="plus" style={{ left: p.x, top: p.y }} onClick={p.add} aria-label={`Add a node after ${p.after}${p.hasLab ? ', ' + p.lab + ' branch' : ''}`}><Icon name="plus" width="14" height="14" aria-hidden="true" /></button>
                              {p.hasLab ? <span className="elab" style={{ left: p.lx, top: p.ly, color: p.lc }}>{p.lab}</span> : null}
                            </React.Fragment>
                          ))}
                        </div>
                      </div>
                      <span className="wf-pan" aria-hidden="true">Swipe to move around</span>
                      <div className="zoom">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" onClick={v.zOut} aria-label="Zoom out"><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                        <button type="button" className="ix-btn ix-btn--sm" onClick={v.zFit} aria-label="Fit to view">{v.zoomL}</button>
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" onClick={v.zIn} aria-label="Zoom in"><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                      </div>
                      {v.creatorOpen ? (
                        <div className="drawer" role="region" aria-label="Node panel">
                          <div className="drawer__head">
                            <div><div className="drawer__title">{v.creatorTitle}</div><div className="drawer__sub">{v.creatorSub}</div></div>
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Close panel" onClick={v.closeDrawer}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                          <div className="drawer__search"><input className="gc-input" aria-label="Search nodes" placeholder="Search nodes" value={v.q} onChange={v.onQ} /></div>
                          <div className="drawer__list">
                            {v.catalog.map((g) => (
                              <React.Fragment key={g.cat}>
                                <div className="drawer__cat">{g.cat}</div>
                                {g.items.map((it) => (
                                  <button key={it.n} type="button" className="citem" onClick={it.add}>
                                    <span className="ico" style={{ background: it.bg, color: it.fg }}><Icon name={it.icon} width="16" height="16" aria-hidden="true" /></span>
                                    <span><b>{it.n}</b><small>{it.d}</small></span>
                                  </button>
                                ))}
                              </React.Fragment>
                            ))}
                            {v.noResults ? <div className="drawer__none">No node matches that search.</div> : null}
                          </div>
                        </div>
                      ) : null}
                      {v.ndvOpen ? (
                        <div className="drawer" role="region" aria-label="Node panel">
                          <div className="drawer__head">
                            <span className="ico" style={{ background: v.sel.bg, color: v.sel.fg }}><Icon name={v.sel.icon} width="16" height="16" aria-hidden="true" /></span>
                            <div><div className="drawer__title">{v.sel.name}</div><div className="drawer__sub">{v.sel.sub}</div></div>
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Close panel" onClick={v.closeDrawer}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                          <div className="drawer__pills">
                            <span className="wf-pill">Input · {v.sel.inN}</span>
                            <span className={'wf-pill' + (v.sel.ran ? ' is-ok' : '')}>Output · {v.sel.outN}</span>
                          </div>
                          <div className="drawer__body">
                            {v.sel.isIf ? (<>
                              <span className="gc-label">Conditions · all must match</span>
                              {v.sel.conds.map((c, i) => (
                                <div key={i} className="cond">
                                  <input className="gc-input" aria-label="Field" value={c.f} onChange={c.onF} />
                                  <input className="gc-input" aria-label="Operator" value={c.o} onChange={c.onO} />
                                  <input className="gc-input" aria-label="Value" value={c.v} onChange={c.onV} />
                                </div>
                              ))}
                              <button type="button" className="ix-btn ix-btn--sm wf-addcond" onClick={v.sel.addCond}><Icon name="plus" width="16" height="16" aria-hidden="true" />Add condition</button>
                            </>) : null}
                            {v.sel.params.map((p, i) => (
                              <div key={i}>
                                <label className="gc-label" htmlFor={`wf-param-${i}`}>{p.l}</label>
                                <input className="gc-input" id={`wf-param-${i}`} value={p.v} onChange={p.on} />
                                {p.hasHint ? <span className="wf-hint">{p.hint}</span> : null}
                              </div>
                            ))}
                            {v.sel.hasOut ? (
                              <div><span className="gc-label">Last test output</span><pre className="wf-out">{v.sel.out}</pre></div>
                            ) : null}
                          </div>
                          <div className="drawer__foot">
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={v.testStep}>Test step</button>
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={v.delNode}>Delete</button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  ) : null}
                  {v.isExec ? (
                    <div className="ix-table-wrap ix-table-wrap--show">
                      <table className="ix-table ix-table--static gc-table--keep">
                        <caption className="sr-only">Executions</caption>
                        <thead><tr><th scope="col">Started</th><th scope="col">Order</th><th scope="col">Path</th><th scope="col">Took</th><th scope="col">Status</th></tr></thead>
                        <tbody>
                          {v.execs.map((x) => (
                            <tr key={x.t + x.o}>
                              <td className="ix-muted">{x.t}</td>
                              <td className="ix-strong wf-id">{x.o}</td>
                              <td className="ix-muted">{x.p}</td>
                              <td>{x.d}</td>
                              <td><StatusBadge tone={x.tone} icon={x.bi}>{x.s}</StatusBadge></td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : null}
                </section>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
