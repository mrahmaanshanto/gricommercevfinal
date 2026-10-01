'use client';
// Generated from design/templates/purchase-stock/Transfers.dc.html by scripts/convert-design.mjs.
// Transfers — Purchase & Stock module — Transfers.
// Edit freely: this file is now the source for the screen.
// Scanning a transfer in records the stock moves (out of the sender, into the receiver). When fewer
// pieces arrive than were sent, each short line is resolved: written off at the sender, claimed from
// the carrier (also taken off the stock), or kept as pending until the pieces are found.
// Front end only: rows come from src/lib/transfers.js.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader, Dialog as __Dialog } from '@/components/ui';
import { toast as __toast } from '@/runtime/ui';
import { productBy, addMove } from '@/lib/stock';
import { getTransfers, updateTransfer, missingOf, openShort, pendingShort } from '@/lib/transfers';
import { formatBDT, formatDate, formatDateTime } from '@/lib/format';

// ---- logic (from the design's <script type="text/x-dc">) ----

function mkTabs(self, list, cur, key, counts) { return list.map(function (x) { var on = x.k === cur; var c = counts ? counts[x.k] : null; return { label: x.label, on: on, cls: on ? 'tab on' : 'tab', hasCount: c != null, count: c, countBg: on ? 'rgba(255,255,255,0.2)' : '#e9eef5', pick: function () { var p = {}; p[key] = x.k; self.setState(p); } }; }); }
function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
var BY = 'Karim';
var TABS = [{ k: 'all', label: 'All' }, { k: 'way', label: 'On the way' }, { k: 'done', label: 'Received' }, { k: 'short', label: 'With a problem' }, { k: 'draft', label: 'Not sent yet' }];
var pcsOf = function (t) { return t.lines.reduce(function (a, l) { return a + l.qty; }, 0); };
var gotOf = function (t) { return t.lines.reduce(function (a, l) { return a + (l.got || 0); }, 0); };
var valueOf = function (t) { return t.lines.reduce(function (a, l) { var p = productBy(l.sku); return a + l.qty * (p ? p.wholesale : 0); }, 0); };
var nameOf = function (sku) { var p = productBy(sku); return p ? p.name : sku; };
/** 'draft' | 'way' | 'short' (missing, nobody decided) | 'pending' (kept as found later) | 'done' */
function stateOf(t) {
  if (t.status !== 'received') return t.status;
  if (openShort(t).length) return 'short';
  if (pendingShort(t).length) return 'pending';
  return 'done';
}
/** "2 written off · claim ৳1,782 from Pathao Courier · 2 pending" */
function resText(t) {
  var out = [];
  t.lines.forEach(function (l) {
    var r = l.res; if (!r) return;
    if (r.kind === 'writeoff') out.push(r.qty + ' written off' + (r.reason ? ' (' + r.reason.toLowerCase() + ')' : ''));
    if (r.kind === 'claim') out.push('claim ' + formatBDT(r.amount) + ' from ' + (t.carrier || 'the carrier') + ' for ' + r.qty);
    if (r.kind === 'pending') out.push(r.qty + ' pending · to be found');
    if (r.kind === 'found') out.push(r.qty + ' found later');
  });
  return out.join(' · ');
}
var SHOW = { draft: ['Not sent yet', 'badge b-draft'], way: ['On the way', 'badge b-ordered'], done: ['Received', 'badge b-received'] };
class Component extends DCLogic {
  componentDidMount() { this.setState({ list: getTransfers() }); }
  renderVals() {
    var self = this, s = this.state || {}, t = s.t || 'all', list = s.list || [];
    var reload = function (extra) { self.setState(assign({ list: getTransfers() }, extra || {})); };
    var find = function (no) { return list.filter(function (x) { return x.no === no; })[0]; };
    var cnt = { all: list.length, way: 0, done: 0, short: 0, draft: 0 };
    list.forEach(function (r) { var st = stateOf(r); cnt[st === 'pending' ? 'short' : st]++; });
    var rows = list.filter(function (r) { var st = stateOf(r); return t === 'all' || st === t || (t === 'short' && st === 'pending'); }).map(function (r) {
      var st = stateOf(r), pcs = pcsOf(r), got = gotOf(r), missing = r.lines.reduce(function (a, l) { return a + missingOf(r, l); }, 0);
      var open = openShort(r).reduce(function (a, l) { return a + missingOf(r, l); }, 0), pend = pendingShort(r).reduce(function (a, l) { return a + missingOf(r, l); }, 0);
      var status = st === 'short' ? open + ' missing' : st === 'pending' ? pend + ' pending' : SHOW[st][0];
      var badge = st === 'short' ? 'badge b-cancelled' : st === 'pending' ? 'badge b-partial' : SHOW[st][1];
      var p = r.status === 'received' ? Math.round(got / pcs * 100) : 0;
      return { no: r.no, date: formatDate(r.at), by: r.by, from: r.from, to: r.to, pcs: pcs, got: r.status === 'received' ? got + ' / ' + pcs : '— / ' + pcs, pct: p + '%', bar: missing ? '#ff5724' : '#10b981',
        status: status, badge: badge, res: resText(r),
        canReceive: st === 'way', canSend: st === 'draft', canResolve: st === 'short' || st === 'pending', canView: st === 'done',
        receive: function () { var g = {}; r.lines.forEach(function (l) { g[l.sku] = String(l.qty); }); self.setState({ recv: { no: r.no, got: g } }); },
        send: function () { updateTransfer(r.no, { status: 'way', sentAt: Date.now() }); reload(); __toast(r.no + ' sent · ' + pcs + ' pieces on the way to ' + r.to); },
        resolve: function () { self.setState({ fix: startFix(r) }); },
        view: function () { self.setState({ view: r.no }); } };
    });
    var way = list.filter(function (r) { return stateOf(r) === 'way'; });
    var recd = list.filter(function (r) { return r.status === 'received'; });
    var probs = list.filter(function (r) { var st = stateOf(r); return st === 'short' || st === 'pending'; });
    var probPcs = probs.reduce(function (a, r) { return a + openShort(r).concat(pendingShort(r)).reduce(function (b, l) { return b + missingOf(r, l); }, 0); }, 0);
    function startFix(r) {
      var picks = {};
      openShort(r).concat(pendingShort(r)).forEach(function (l) { var m = missingOf(r, l), p = productBy(l.sku); picks[l.sku] = { kind: l.res ? 'found' : 'writeoff', reason: 'Lost in transit', amount: String(m * (p ? p.wholesale : 0)), note: '' }; });
      return { no: r.no, picks: picks };
    }

    // ---- receive dialog ----
    var rc = s.recv ? find(s.recv.no) : null;
    var recvLines = rc ? rc.lines.map(function (l) {
      var v = s.recv.got[l.sku], n = Math.max(0, Math.min(l.qty, Math.round(Number(v) || 0)));
      return { sku: l.sku, name: nameOf(l.sku), sent: l.qty, got: v, short: l.qty - n, set: function (e) { var g = assign({}, s.recv.got); g[l.sku] = e.target.value; self.setState({ recv: { no: s.recv.no, got: g } }); } };
    }) : [];
    var recvShort = recvLines.reduce(function (a, l) { return a + l.short; }, 0);
    var doReceive = function (e) {
      e.preventDefault();
      var r = rc, lines = r.lines.map(function (l) { return assign(assign({}, l), { got: Math.max(0, Math.min(l.qty, Math.round(Number(s.recv.got[l.sku]) || 0))) }); });
      lines.forEach(function (l) {
        if (!l.got) return;
        addMove({ sku: l.sku, place: r.from, qty: -l.got, kind: 'transfer', reason: 'Sent to ' + r.to, by: BY, ref: r.no });
        addMove({ sku: l.sku, place: r.to, qty: l.got, kind: 'transfer', reason: 'Received from ' + r.from, by: BY, ref: r.no });
      });
      var list2 = updateTransfer(r.no, { status: 'received', receivedAt: Date.now(), lines: lines });
      var r2 = list2.filter(function (x) { return x.no === r.no; })[0];
      var miss = lines.reduce(function (a, l) { return a + (l.qty - l.got); }, 0);
      if (miss) { reload({ recv: null, fix: startFix(r2) }); __toast(r.no + ' received · ' + miss + ' missing. Choose what to do with them.', { tone: 'info' }); }
      else { reload({ recv: null }); __toast(r.no + ' received · ' + gotOf(r2) + ' pieces added to ' + r.to); }
    };

    // ---- resolve dialog ----
    var fx = s.fix ? find(s.fix.no) : null;
    var setPick = function (sku, patch) { var pk = assign({}, s.fix.picks); pk[sku] = assign(assign({}, pk[sku]), patch); self.setState({ fix: { no: s.fix.no, picks: pk } }); };
    var fixLines = fx ? openShort(fx).concat(pendingShort(fx)).map(function (l) {
      var m = missingOf(fx, l), pk = s.fix.picks[l.sku] || { kind: 'writeoff', reason: '', amount: '0', note: '' }, pend = !!l.res;
      var opts = [['writeoff', 'Write off', 'Take ' + m + ' off the stock at ' + fx.from + '.'], ['claim', 'Claim from carrier', 'Take ' + m + ' off the stock and ask ' + (fx.carrier || 'the carrier') + ' to pay for them.']];
      if (pend) opts.unshift(['found', 'They turned up', 'Add ' + m + ' to ' + fx.to + '.']);
      else opts.push(['pending', 'Found later', 'Keep ' + m + ' as pending. Nothing changes until they turn up.']);
      return { sku: l.sku, name: nameOf(l.sku), m: m, pend: pend, pk: pk,
        opts: opts.map(function (o) { return { k: o[0], label: o[1], help: o[2], on: pk.kind === o[0], pick: function () { setPick(l.sku, { kind: o[0] }); } }; }),
        setReason: function (e) { setPick(l.sku, { reason: e.target.value }); }, setAmount: function (e) { setPick(l.sku, { amount: e.target.value }); }, setNote: function (e) { setPick(l.sku, { note: e.target.value }); } };
    }) : [];
    var doFix = function (e) {
      e.preventDefault();
      var r = fx, done = [];
      var lines = r.lines.map(function (l) {
        var m = missingOf(r, l), pk = s.fix.picks[l.sku];
        if (!m || !pk) return l;
        var at = Date.now();
        if (pk.kind === 'writeoff') { addMove({ sku: l.sku, place: r.from, qty: -m, kind: 'writeoff', reason: 'Missing in ' + r.no + ' · ' + (pk.reason.trim() || 'Lost in transit'), by: BY, ref: r.no }); done.push(m + ' written off'); return assign(assign({}, l), { res: { kind: 'writeoff', qty: m, reason: pk.reason.trim() || 'Lost in transit', at: at, by: BY } }); }
        if (pk.kind === 'claim') { var amt = Math.max(0, Math.round(Number(pk.amount) || 0)); addMove({ sku: l.sku, place: r.from, qty: -m, kind: 'writeoff', reason: 'Missing in ' + r.no + ' · claimed from ' + (r.carrier || 'the carrier'), by: BY, ref: r.no }); done.push('claim ' + formatBDT(amt)); return assign(assign({}, l), { res: { kind: 'claim', qty: m, amount: amt, note: pk.note.trim(), at: at, by: BY } }); }
        if (pk.kind === 'pending') { done.push(m + ' pending'); return assign(assign({}, l), { res: { kind: 'pending', qty: m, note: pk.note.trim(), at: at, by: BY } }); }
        if (pk.kind === 'found') {
          addMove({ sku: l.sku, place: r.from, qty: -m, kind: 'transfer', reason: 'Sent to ' + r.to + ' · found later', by: BY, ref: r.no });
          addMove({ sku: l.sku, place: r.to, qty: m, kind: 'transfer', reason: 'Received from ' + r.from + ' · found later', by: BY, ref: r.no });
          done.push(m + ' found'); return assign(assign({}, l), { got: l.got + m, res: { kind: 'found', qty: m, at: at, by: BY } });
        }
        return l;
      });
      updateTransfer(r.no, { lines: lines });
      reload({ fix: null });
      __toast(r.no + ' · ' + done.join(' · '));
    };
    var fixBad = fixLines.some(function (l) { return l.pk.kind === 'claim' && !(Number(l.pk.amount) > 0); });

    // ---- view dialog ----
    var vw = s.view ? find(s.view) : null;

    return { tabs: mkTabs(this, TABS, t, 't', cnt), rows: rows, empty: rows.length === 0,
      kWay: String(way.length), kWayNote: way.reduce(function (a, r) { return a + pcsOf(r); }, 0) + ' pcs · ' + formatBDT(way.reduce(function (a, r) { return a + valueOf(r); }, 0)),
      kRecd: String(recd.length), kRecdNote: recd.reduce(function (a, r) { return a + gotOf(r); }, 0) + ' pcs scanned in',
      kProb: String(probs.length), kProbNote: probPcs ? probPcs + ' pcs missing on arrival' : 'nothing missing',
      recvOpen: !!rc, recvTitle: rc ? 'Scan in ' + rc.no : '', recvFacts: rc ? rc.from + ' → ' + rc.to + ' · ' + (rc.carrier || '') : '', recvLines: recvLines, recvShort: recvShort, closeRecv: function () { self.setState({ recv: null }); }, doReceive: doReceive,
      fixOpen: !!fx, fixTitle: fx ? 'Missing pieces · ' + fx.no : '', fixFacts: fx ? fx.from + ' → ' + fx.to + ' · carried by ' + (fx.carrier || '—') : '', fixLines: fixLines, fixBad: fixBad, closeFix: function () { self.setState({ fix: null }); }, doFix: doFix,
      viewOpen: !!vw, viewTitle: vw ? vw.no : '', closeView: function () { self.setState({ view: null }); },
      viewFacts: vw ? [['From', vw.from], ['To', vw.to], ['Sent', formatDateTime(vw.at) + ' by ' + vw.by], ['Carried by', vw.carrier || '—'], ['Received', vw.receivedAt ? formatDateTime(vw.receivedAt) : 'Not yet']].concat(resText(vw) ? [['Missing pieces', resText(vw)]] : []) : [],
      viewLines: vw ? vw.lines.map(function (l) { var p = productBy(l.sku); return { sku: l.sku, name: p ? p.name : l.sku, variant: p ? p.variant : '', qty: l.qty, got: vw.status === 'received' ? l.got : '—' }; }) : [] };
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
section.card .td{white-space:normal}
section.card .td .badge,section.card .td .btn{white-space:nowrap}
.tf-res{display:block;margin-top:4px;font-size:var(--text-xs);line-height:16px;color:var(--text-muted)}
.tf-dlg{display:flex;flex-direction:column;gap:var(--space-4)}
.tf-dlg .gc-table th,.tf-dlg .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.tf-num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.tf-got{width:88px;text-align:right}
.tf-line{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.tf-line__head{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-3)}
.tf-line__head b{font-weight:var(--weight-medium);color:var(--text-heading)}
.tf-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.tf-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.tf-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.tf-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tf-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tf-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.tf-facts{display:grid;grid-template-columns:auto 1fr;gap:6px var(--space-4);margin:0;font-size:var(--text-sm)}
.tf-facts dt{color:var(--text-muted)}.tf-facts dd{margin:0;color:var(--text-heading)}
@media (max-width:599px){.tf-two{grid-template-columns:1fr}}
.tf-phone-new{display:none!important}
/* phones: New transfer moves up beside the title, status chips scroll on one row, the From → To arrow cell is dropped */
@media (max-width:640px){
  .tf-phone-new{display:inline-flex!important}
  .tf-intro>.btn{display:none}
  .tf-tabs{flex-wrap:nowrap!important;overflow-x:auto;scrollbar-width:none;padding:12px 14px!important}
  .tf-tabs::-webkit-scrollbar{display:none}
  .tf-tabs>button{flex:none}
  .tf-table>tbody>tr>td:nth-child(3){display:none!important}
}
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
`;

// ---- markup ----

export default class TransfersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Transfers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-transfers" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Stock" page="Transfers" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Transfers" actions={<__Link href="/new-transfer" className="gc-btn gc-btn--solid tf-phone-new"><__Icon name="arrow-left-right" width="18" height="18" aria-hidden="true" /> New transfer</__Link>} />
              <div className="gc-cardrow" style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "rgba(0,48,135,.08)", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
                      <path d="M15 18H9" />
                      <path d="M19 18h2a1 1 0 0 0 1-1v-3.65a1 1 0 0 0-.22-.624l-3.48-4.35A1 1 0 0 0 17.52 8H14" />
                      <circle cx="17" cy="18" r="2" />
                      <circle cx="7" cy="18" r="2" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#003087" }}>{v.kWay}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>On the way</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.kWayNote}</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#e7f8f1", color: "#047857", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <circle cx="12" cy="12" r="10" />
                      <path d="m9 12 2 2 4-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#047857" }}>{v.kRecd}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Received</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.kRecdNote}</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", flexShrink: "0", borderRadius: "var(--radius-xl)", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#b83210" }}>{v.kProb}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>With a problem</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.kProbNote}</div>
                  </div>
                </div>
              </div>
              <div className="tf-intro" style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#475569" }}>Move stock between your warehouses and shops. Scan out when it leaves, scan in when it arrives.</div>
                <__Link href="/new-transfer" className="btn solid">
                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M8 3 4 7l4 4" />
                    <path d="M4 7h16" />
                    <path d="m16 21 4-4-4-4" />
                    <path d="M20 17H4" />
                  </svg>
                  <span>New transfer</span>
                </__Link>
              </div>
              <section className="card" style={{ overflow: "hidden" }}>
                <div className="tf-tabs" style={{ display: "flex", alignItems: "center", gap: "6px", padding: "14px 16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  {__list(v.tabs).map((tb, $index) => (<React.Fragment key={$index}>
                      <button type="button" className={tb?.cls} aria-pressed={tb?.on} onClick={tb?.pick}>{tb?.label}{tb?.hasCount ? (<>
  <span style={__sx(`min-width: 22px; height: 20px; padding: 0 6px; border-radius: var(--radius-full); background: ${tb?.countBg ?? ""}; font-size: var(--text-xs); font-weight: var(--weight-medium); display: inline-flex; align-items: center; justify-content: center;`)}>{tb?.count}</span>
</>) : null}</button>
                    </React.Fragment>))}
                </div>
                <div className="gc-table-wrap">
                  <table className="tf-table" style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th">Transfer</th>
                        <th className="th">From</th>
                        <th className="th" />
                        <th className="th">To</th>
                        <th className="th" style={{ textAlign: "center" }}>Pieces</th>
                        <th className="th">Arrived</th>
                        <th className="th">Status</th>
                        <th className="th" style={{ textAlign: "right" }} />
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                          <tr className="row fade">
                            <td className="td">
                              <div className="mono" style={{ fontWeight: "var(--weight-medium)" }}>{r?.no}</div>
                              <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.date} · by {r?.by}</div>
                            </td>
                            <td className="td" style={{ fontWeight: "var(--weight-medium)" }}>{r?.from}</td>
                            <td className="td" style={{ color: "var(--text-muted)", padding: "0" }}>
                              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                <path d="M5 12h14" />
                                <path d="m12 5 7 7-7 7" />
                              </svg>
                            </td>
                            <td className="td" style={{ fontWeight: "var(--weight-medium)" }}>{r?.to}</td>
                            <td className="td" style={{ textAlign: "center", fontWeight: "var(--weight-medium)" }}>{r?.pcs}</td>
                            <td className="td">
                              <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                                <div style={{ width: "80px", height: "8px", borderRadius: "var(--radius-full)", background: "#e9eef5", overflow: "hidden" }}>
                                  <div style={__sx(`height: 8px; border-radius: var(--radius-full); width: ${r?.pct ?? ""}; background: ${r?.bar ?? ""};`)} />
                                </div>
                                <span style={{ fontSize: "var(--text-xs-plus)", color: "#475569" }}>{r?.got}</span>
                              </div>
                            </td>
                            <td className="td">
                              <span className={r?.badge}>{r?.status}</span>
                              {r?.res ? <span className="tf-res">{r.res}</span> : null}
                            </td>
                            <td className="td" style={{ textAlign: "right" }}>
                              {r?.canReceive ? (<>
                                <button type="button" className="btn solid sm" onClick={r?.receive} aria-label={`Scan in ${r?.no ?? ""}`}>
                                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                    <path d="M8 7v10" />
                                    <path d="M12 7v10" />
                                    <path d="M17 7v10" />
                                  </svg>
                                  <span>Scan in</span>
                                </button>
                              </>) : null}
                              {r?.canSend ? (<button type="button" className="btn solid sm" onClick={r?.send} aria-label={`Send ${r?.no ?? ""}`}>Send</button>) : null}
                              {r?.canResolve ? (<button type="button" className="btn warnbtn sm" onClick={r?.resolve} aria-label={`Resolve missing pieces of ${r?.no ?? ""}`}>Resolve</button>) : null}
                              {r?.canView ? (<button type="button" className="btn line sm" onClick={r?.view} aria-label={`View ${r?.no ?? ""}`}>View</button>) : null}
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                {v.empty ? (<>
                  <div style={{ padding: "40px", textAlign: "center", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>No transfers here.</div>
                </>) : null}
              </section>
            </div>
          </main>
        </div>

        <__Dialog open={v.recvOpen} title={v.recvTitle} onClose={v.closeRecv} width={560}>
          {v.recvOpen ? (
            <form className="tf-dlg" onSubmit={v.doReceive}>
              <p className="gc-help" style={{ margin: 0 }}>{v.recvFacts}. Count what arrived. Anything missing is sorted out next.</p>
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact">
                  <thead><tr><th scope="col">Product</th><th scope="col" className="tf-num">Sent</th><th scope="col" className="tf-num">Arrived</th></tr></thead>
                  <tbody>
                    {v.recvLines.map((l) => (
                      <tr key={l.sku}>
                        <td><div style={{ fontWeight: "var(--weight-medium)" }}>{l.name}</div><div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{l.sku}</div>{l.short > 0 ? <span className="gc-badge gc-badge--error" style={{ marginTop: 4 }}>{l.short} missing</span> : null}</td>
                        <td className="tf-num">{l.sent}</td>
                        <td className="tf-num"><input className="gc-input tf-got" type="number" min="0" max={l.sent} inputMode="numeric" aria-label={`Pieces of ${l.name} that arrived`} value={l.got} onChange={l.set} /></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeRecv}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">{v.recvShort ? `Receive · ${v.recvShort} missing` : "Receive all"}</button></div>
            </form>
          ) : null}
        </__Dialog>

        <__Dialog open={v.fixOpen} title={v.fixTitle} onClose={v.closeFix} width={600}>
          {v.fixOpen ? (
            <form className="tf-dlg" onSubmit={v.doFix}>
              <p className="gc-help" style={{ margin: 0 }}>{v.fixFacts}. Decide for each product what happens to the pieces that did not arrive.</p>
              {v.fixLines.map((l) => (
                <div key={l.sku} className="tf-line">
                  <div className="tf-line__head"><b>{l.name}</b><span className={l.pend ? "gc-badge gc-badge--warning" : "gc-badge gc-badge--error"}>{l.m} {l.pend ? "pending" : "missing"}</span></div>
                  <div className="tf-opts" role="radiogroup" aria-label={`What to do with the missing ${l.name}`}>
                    {l.opts.map((o) => (
                      <label key={o.k} className={"tf-opt" + (o.on ? " is-on" : "")}>
                        <input type="radio" name={"tf-" + l.sku} className="gc-check gc-check--radio" checked={o.on} onChange={o.pick} />
                        <span><b>{o.label}</b><small>{o.help}</small></span>
                      </label>
                    ))}
                  </div>
                  {l.pk.kind === "writeoff" ? <div><label className="gc-label" htmlFor={"tf-rs-" + l.sku}>Reason</label><input id={"tf-rs-" + l.sku} className="gc-input" value={l.pk.reason} onChange={l.setReason} placeholder="Lost in transit" /></div> : null}
                  {l.pk.kind === "claim" ? (
                    <div className="tf-two">
                      <div><label className="gc-label" htmlFor={"tf-am-" + l.sku}>Claim amount (৳) *</label><input id={"tf-am-" + l.sku} className="gc-input" type="number" min="1" inputMode="numeric" value={l.pk.amount} onChange={l.setAmount} /></div>
                      <div><label className="gc-label" htmlFor={"tf-nt-" + l.sku}>Note</label><input id={"tf-nt-" + l.sku} className="gc-input" value={l.pk.note} onChange={l.setNote} placeholder="Claim no. or who you spoke to" /></div>
                    </div>
                  ) : null}
                  {l.pk.kind === "pending" ? <div><label className="gc-label" htmlFor={"tf-pn-" + l.sku}>Note</label><input id={"tf-pn-" + l.sku} className="gc-input" value={l.pk.note} onChange={l.setNote} placeholder="For example: driver will check the van" /></div> : null}
                </div>
              ))}
              {v.fixBad ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>Enter the amount to claim from the carrier.</p> : null}
              <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={v.closeFix}>Decide later</button><button type="submit" className="gc-btn gc-btn--solid" disabled={v.fixBad}>Save</button></div>
            </form>
          ) : null}
        </__Dialog>

        <__Dialog open={v.viewOpen} title={v.viewTitle} onClose={v.closeView} width={560} footer={<button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.closeView}>Done</button>}>
          {v.viewOpen ? (<>
            <dl className="tf-facts">{v.viewFacts.map((f) => (<React.Fragment key={f[0]}><dt>{f[0]}</dt><dd>{f[1]}</dd></React.Fragment>))}</dl>
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact">
                <thead><tr><th scope="col">Product</th><th scope="col" className="tf-num">Sent</th><th scope="col" className="tf-num">Arrived</th></tr></thead>
                <tbody>{v.viewLines.map((l) => (<tr key={l.sku}><td><div style={{ fontWeight: "var(--weight-medium)" }}>{l.name}</div><div className="mono" style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{l.sku} · {l.variant}</div></td><td className="tf-num">{l.qty}</td><td className="tf-num">{l.got}</td></tr>))}</tbody>
              </table>
            </div>
          </>) : null}
        </__Dialog>
      </div>
    );
  }
}
