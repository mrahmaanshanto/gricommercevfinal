'use client';
// Generated from design/templates/purchase-stock/Transfers.dc.html by scripts/convert-design.mjs.
// Transfers — Purchase & Stock module — Transfers.
// Edit freely: this file is now the source for the screen.
// Scanning a transfer in records the stock moves (out of the sender, into the receiver). When fewer
// pieces arrive than were sent, each short line is resolved: written off at the sender, claimed from
// the carrier (also taken off the stock), or kept as pending until the pieces are found.
// Laid out like a Shopify list (components/ui/IndexKit.jsx): the views (All, On the way, Received, With a problem,
// Not sent yet) and a compact table (transfer, date, from, to, pieces, status) with the one next step per row
// (Scan in, Send or Resolve). A click on a row opens the transfer: who sent and carried it, the lines, what
// happened to missing pieces, and the next step.
// Front end only: rows come from src/lib/transfers.js.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { Dialog as __Dialog, Sheet as __Sheet, EmptyState as __EmptyState, StatusBadge as __StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, LearnMore, KV } from '@/components/ui/IndexKit';
import { toast as __toast } from '@/runtime/ui';
import { productBy, addMove } from '@/lib/stock';
import { getTransfers, updateTransfer, missingOf, openShort, pendingShort } from '@/lib/transfers';
import { formatBDT, formatDate, formatDateTime } from '@/lib/format';

// ---- logic (from the design's <script type="text/x-dc">) ----

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
var SHOW = { draft: ['Not sent yet', 'neutral'], way: ['On the way', 'primary'], done: ['Received', 'success'] };
class Component extends DCLogic {
  componentDidMount() { this.setState({ list: getTransfers() }); }
  renderVals() {
    var self = this, s = this.state || {}, t = s.t || 'all', list = s.list || [];
    var reload = function (extra) { self.setState(assign({ list: getTransfers() }, extra || {})); };
    var find = function (no) { return list.filter(function (x) { return x.no === no; })[0]; };
    var cnt = { all: list.length, way: 0, done: 0, short: 0, draft: 0 };
    list.forEach(function (r) { var st = stateOf(r); cnt[st === 'pending' ? 'short' : st]++; });
    // the one next step of a transfer: scan it in, send it, or sort out missing pieces
    var nextOf = function (r) {
      var st = stateOf(r), pcs = pcsOf(r);
      if (st === 'way') return { label: 'Scan in', icon: 'scan-barcode', aria: 'Scan in ' + r.no, run: function () { var g = {}; r.lines.forEach(function (l) { g[l.sku] = String(l.qty); }); self.setState({ view: null, recv: { no: r.no, got: g } }); } };
      if (st === 'draft') return { label: 'Send', icon: 'truck', aria: 'Send ' + r.no, run: function () { updateTransfer(r.no, { status: 'way', sentAt: Date.now() }); reload(); __toast(r.no + ' sent · ' + pcs + ' pieces on the way to ' + r.to); } };
      if (st === 'short' || st === 'pending') return { label: 'Resolve', icon: 'circle-alert', aria: 'Resolve missing pieces of ' + r.no, run: function () { self.setState({ view: null, fix: startFix(r) }); } };
      return null;
    };
    var statusOf = function (r) {
      var st = stateOf(r);
      var open = openShort(r).reduce(function (a, l) { return a + missingOf(r, l); }, 0), pend = pendingShort(r).reduce(function (a, l) { return a + missingOf(r, l); }, 0);
      return st === 'short' ? [open + ' missing', 'error'] : st === 'pending' ? [pend + ' pending', 'warning'] : SHOW[st];
    };
    var shown = list.filter(function (r) { var st = stateOf(r); return t === 'all' || st === t || (t === 'short' && st === 'pending'); });
    var rows = shown.map(function (r) {
      var pcs = pcsOf(r), got = gotOf(r), status = statusOf(r);
      return { no: r.no, date: formatDate(r.at), from: r.from, to: r.to, pcs: pcs,
        pieces: r.status === 'received' ? got + ' / ' + pcs : String(pcs),
        status: status[0], tone: status[1], next: nextOf(r),
        open: function () { self.setState({ view: r.no }); },
        onRowClick: function (e) { if (e.target.closest && e.target.closest('a,button,input,select,label')) return; self.setState({ view: r.no }); } };
    });
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

    // ---- one transfer (side panel) ----
    var vw = s.view ? find(s.view) : null;
    var vwStatus = vw ? statusOf(vw) : null;

    return { tabs: TABS.map(function (x) { return { key: x.k, id: 'tf-tab-' + x.k, label: x.label, count: cnt[x.k], on: x.k === t, onClick: function () { self.setState({ t: x.k }); } }; }),
      rows: rows, empty: rows.length === 0,
      foot: (rows.length === 1 ? '1 transfer' : rows.length + ' transfers') + ' · ' + rows.reduce(function (a, r) { return a + r.pcs; }, 0) + ' pcs · ' + formatBDT(shown.reduce(function (a, r) { return a + valueOf(r); }, 0)),
      recvOpen: !!rc, recvTitle: rc ? 'Scan in ' + rc.no : '', recvFacts: rc ? rc.from + ' → ' + rc.to + ' · ' + (rc.carrier || '') : '', recvLines: recvLines, recvShort: recvShort, closeRecv: function () { self.setState({ recv: null }); }, doReceive: doReceive,
      fixOpen: !!fx, fixTitle: fx ? 'Missing pieces · ' + fx.no : '', fixFacts: fx ? fx.from + ' → ' + fx.to + ' · carried by ' + (fx.carrier || '—') : '', fixLines: fixLines, fixBad: fixBad, closeFix: function () { self.setState({ fix: null }); }, doFix: doFix,
      viewOpen: !!vw, viewTitle: vw ? vw.no : '', closeView: function () { self.setState({ view: null }); },
      viewStatus: vwStatus, viewNext: vw ? nextOf(vw) : null,
      viewFacts: vw ? [['From', vw.from], ['To', vw.to], ['Sent', formatDateTime(vw.at) + ' by ' + vw.by], ['Carried by', vw.carrier || '—'], ['Received', vw.receivedAt ? formatDateTime(vw.receivedAt) : 'Not yet']].concat(resText(vw) ? [['Missing pieces', resText(vw)]] : []) : [],
      viewLines: vw ? vw.lines.map(function (l) { var p = productBy(l.sku); return { sku: l.sku, name: p ? p.name : l.sku, variant: p ? p.variant : '', qty: l.qty, got: vw.status === 'received' ? l.got : '—' }; }) : [] };
  }
}

// ---- styles ----

const CSS = `
.ix-strong.tf-mono{font-family:var(--font-data)}
.tf-mono{font-family:var(--font-data)}
.tf-act{text-align:right}
.tf-dlg{display:flex;flex-direction:column;gap:var(--space-4)}
.tf-dlg .gc-table th,.tf-dlg .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.tf-num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.tf-got{width:88px;text-align:right}
.tf-sub{display:block;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.tf-line{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl)}
.tf-line__head{display:flex;align-items:baseline;justify-content:space-between;gap:var(--space-3)}
.tf-line__head b{font-weight:var(--weight-medium);color:var(--text-heading)}
.tf-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.tf-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer}
.tf-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.tf-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.tf-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.tf-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
@media (max-width:599px){.tf-two{grid-template-columns:1fr}}
`;

// ---- markup ----

export default class TransfersScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Transfers">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-transfers" />
          <main className="gc-shell__main">
            <__Topbar crumb="Stock" page="Transfers" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="arrow-left-right" title="Transfers"
                  about="Stock moving between your warehouses and branches. Send it, scan it in where it arrives, and sort out anything that went missing on the way."
                  more={[{ label: 'Stock list', href: '/stock' }, { label: 'Warehouses', href: '/warehouses' }, { label: 'Branches', href: '/branches' }]}
                  primary={{ label: 'New transfer', href: '/new-transfer' }} />

                <section className="ix-card" aria-label="Transfers">
                  <div className="ix-bar"><IndexTabs tabs={v.tabs} label="Transfer status" /></div>
                  {v.empty ? (
                    <div className="ix-empty"><__EmptyState icon="arrow-left-right" title="No transfers here." /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label="Transfers">
                      {v.rows.map((r) => (
                        <li key={r.no}>
                          <button type="button" className="ix-pitem" onClick={r.open}>
                            <span className="ix-pitem__top"><b className="tf-mono">{r.no}</b><__StatusBadge tone={r.tone}>{r.status}</__StatusBadge></span>
                            <span className="ix-pitem__mid">{r.from} → {r.to} · {`${r.pieces} pcs`} · {r.date}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Transfers</caption>
                        <thead>
                          <tr>
                            <th scope="col">Transfer</th>
                            <th scope="col">Date</th>
                            <th scope="col">From</th>
                            <th scope="col">To</th>
                            <th scope="col" className="ix-num">Pieces</th>
                            <th scope="col">Status</th>
                            <th scope="col"><span className="sr-only">Next step</span></th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.no} onClick={r.onRowClick}>
                              <td><button type="button" className="ix-strong tf-mono" onClick={r.open}>{r.no}</button></td>
                              <td className="ix-muted">{r.date}</td>
                              <td>{r.from}</td>
                              <td>{r.to}</td>
                              <td className="ix-num">{r.pieces}</td>
                              <td><__StatusBadge tone={r.tone}>{r.status}</__StatusBadge></td>
                              <td className="tf-act">{r.next ? <button type="button" className="ix-btn ix-btn--sm" onClick={r.next.run} aria-label={r.next.aria}>{r.next.label}</button> : null}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <div className="ix-foot"><span>{v.foot}</span></div>
                </section>
                <LearnMore topic="transfers" />
              </div>
            </div>
          </main>
        </div>

        {/* one transfer */}
        <__Sheet open={v.viewOpen} title={v.viewTitle} onClose={v.closeView}
          footer={<>
            <button type="button" className={'gc-btn gc-btn--sm ' + (v.viewNext ? 'gc-btn--neutral' : 'gc-btn--solid')} onClick={v.closeView}>Done</button>
            {v.viewNext ? <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.viewNext.run}><__Icon name={v.viewNext.icon} width="16" height="16" aria-hidden="true" /> {v.viewNext.label}</button> : null}
          </>}>
          {v.viewOpen ? (<>
            {v.viewStatus ? <div><__StatusBadge tone={v.viewStatus[1]}>{v.viewStatus[0]}</__StatusBadge></div> : null}
            <KV rows={v.viewFacts} />
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static gc-table--keep">
                <thead><tr><th scope="col">Product</th><th scope="col" className="ix-num">Sent</th><th scope="col" className="ix-num">Arrived</th></tr></thead>
                <tbody>{v.viewLines.map((l) => (<tr key={l.sku}><td>{l.name}<span className="tf-sub">{l.sku}{l.variant ? ' · ' + l.variant : ''}</span></td><td className="ix-num">{l.qty}</td><td className="ix-num">{l.got}</td></tr>))}</tbody>
              </table>
            </div>
          </>) : null}
        </__Sheet>

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
                        <td><div style={{ fontWeight: "var(--weight-medium)" }}>{l.name}</div><span className="tf-sub">{l.sku}</span>{l.short > 0 ? <span className="gc-badge gc-badge--error" style={{ marginTop: 4 }}>{l.short} missing</span> : null}</td>
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
      </div>
    );
  }
}
