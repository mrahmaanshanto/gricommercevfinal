'use client';
// Generated from design/templates/purchase-stock/Stock.dc.html by scripts/convert-design.mjs.
// Stock — Purchase & Stock module — Stock list.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar, PosSwitcher as __PosSwitcher, SettingsSwitcher as __SettingsSwitcher, PosFit as __PosFit } from '@/shell/Shell';
import { PageHeader as __PageHeader, EmptyState as __EmptyState, Dialog as __Dialog } from '@/components/ui';
import { CATALOG, getCatalog, stockAt, getMoves } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { getTransfers } from '@/lib/transfers';
import { STOCK_PLACES, getStockPlaces, getPlaces, placeByName, namesOf } from '@/lib/locations';
import { getRackData, binsFor, SEED as RACK_SEED } from '@/lib/racks';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
function fmtDate(d) { return d.getDate() + ' ' + MONTHS[d.getMonth()] + ' ' + d.getFullYear(); }
// Products come from the catalogue (src/lib/stock.js getCatalog: the demo list plus products saved in
// Products; a new product starts with 0 on hand everywhere); the numbers per place come from stockAt():
// on hand, held for orders (stock holds), available to sell and in transit (transfers on the way).
// Reorder level and cost are this screen's demo data. The bin column comes from Racks & bins (src/lib/racks.js binsFor).
// Places are the live list (getStockPlaces) after mount, the built-in list on the first render.
var INFO = {
  'GR-RICE-5': [60, 'G-1', 612], 'GR-DAL-1': [40, 'G-2', 130], 'GR-SOY-2': [30, 'G-3', 331], 'GR-MUS-1': [20, 'G-3', 262], 'GR-ATTA-2': [40, 'G-4', 118, true],
  'CL-TEE-BM': [20, 'C-3', 436.2], 'CL-LEG-CL': [10, 'C-4', 980], 'CL-SNK-42': [8, 'C-6', 2150], 'CL-JNS-32': [15, 'C-5', 748],
  'SK-SHA-340': [30, 'A-5', 290], 'SK-SUN-50': [24, 'A-2', 561.6, true], 'SK-TON-150': [20, 'A-3', 455],
  'EL-PHN-128': [6, 'E-1', 11800], 'EL-EAR-PRO': [10, 'E-2', 2210], 'HM-BTL-750': [30, 'H-2', 310], 'HM-RCK-18': [5, 'H-4', 2050]
};
function info(p) { var i = INFO[p.sku] || [10, '—', p.wholesale * 0.8]; return { re: i[0], rack: i[1], cost: i[2], exp: !!i[3] }; }
function setQuery(key, value) { if (typeof window === 'undefined') return; var u = new URL(window.location.href); if (value) u.searchParams.set(key, value); else u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
function getQuery(key) { if (typeof window === 'undefined') return ''; return new URLSearchParams(window.location.search).get(key) || ''; }
var WHS = STOCK_PLACES;
function whKey(w) { return w.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
var HIST = [['29 Sep', 'Sold', -2, 'POS · Dhanmondi'], ['27 Sep', 'Sold', -5, 'Online orders'], ['24 Sep', 'Received', 24, 'PO-1042 · Dhaka Gadget Hub'], ['20 Sep', 'Stock count', -1, 'Counted by Suman'], ['14 Sep', 'Moved', -6, 'To Dhanmondi branch']];
var KIND = { adjust: 'Adjusted', count: 'Stock count', transfer: 'Transfer', receive: 'Received', sale: 'Sold', delivery: 'Delivered', return: 'Returned', writeoff: 'Written off' };
var FL = [{ k: 'all', label: 'All' }, { k: 'low', label: 'Low stock' }, { k: 'out', label: 'Out of stock' }, { k: 'exp', label: 'Expiring soon' }];
class Component extends DCLogic {
  componentDidMount() {
    var p = { holds: getHolds(), moves: getMoves(), transfers: getTransfers(), catalog: getCatalog(), whs: getStockPlaces(), plist: getPlaces(), racks: getRackData() }, f = getQuery('filter'), w = getQuery('warehouse'), q = getQuery('q');
    if (FL.some(function (x) { return x.k === f; })) p.f = f;
    if (p.whs.some(function (x) { return whKey(x) === w; })) p.wh = w;
    if (q) p.q = q;
    this.setState(p);
  }
  renderVals() {
    var self = this, st = this.state || {}, f = st.f || 'all', wh = st.wh || 'all', q = (st.q || '').trim().toLowerCase();
    var whl = st.whs || WHS, plist = st.plist || getPlaces({ saved: [] }), racks = st.racks || RACK_SEED;
    var whName = wh === 'all' ? 'All places' : whl.filter(function (x) { return whKey(x) === wh; })[0];
    var place = wh === 'all' ? '' : whName;
    var placeId = place ? (placeByName(place, plist) || {}).id : '';
    // base count at a place under every name it has had (a renamed place keeps its stock)
    var baseAt = function (p, x) { return (st.whs ? namesOf(x) : [x]).reduce(function (a, n) { return a + ((p.on || {})[n] || 0); }, 0); };
    // before the browser data is read, show the catalogue's own numbers (same on the server and in the browser)
    var holds = st.holds || [], moves = st.moves || [], transfers = st.transfers || null;
    var all = (st.catalog || CATALOG).map(function (p) {
      var n = stockAt(p.sku, place, holds, moves, transfers), i = info(p);
      var places = whl.filter(function (x) { return baseAt(p, x) > 0; }).length;
      // bins from Racks & bins: at the chosen place, or every place
      var bins = place ? binsFor(placeId, p.sku, racks) : plist.reduce(function (a, pl) { return a.concat(binsFor(pl.id, p.sku, racks)); }, []);
      return { p: p, n: n, i: i, places: places, bins: bins };
    });
    var isOut = function (r) { return r.n.available === 0; }, isLow = function (r) { return r.n.available > 0 && r.n.available < r.i.re; };
    var rows = all.filter(function (r) {
      if (place && !baseAt(r.p, place) && !r.n.onHand && !r.n.transit) return false;
      if (q && [r.p.name, r.p.sku, r.p.barcode, r.p.variant].concat(r.bins.map(function (b) { return b.code; })).join(' ').toLowerCase().indexOf(q) < 0) return false;
      if (f === 'low') return isLow(r); if (f === 'out') return isOut(r); if (f === 'exp') return r.i.exp; return true;
    }).map(function (r) {
      var p = r.p, n = r.n, out = isOut(r), low = isLow(r);
      var link = '?sku=' + encodeURIComponent(p.sku) + (place ? '&place=' + encodeURIComponent(place) : '');
      return { name: p.name, code: [p.sku, p.variant].filter(Boolean).join(' · '), initial: p.name.charAt(0),
        wh: place || (r.places + (r.places === 1 ? ' place' : ' places')), rack: !r.bins.length ? 'Not in a bin' : place ? r.bins.map(function (b) { return b.code + ' · ' + b.qty; }).join(', ') : 'In ' + r.bins.length + (r.bins.length === 1 ? ' bin · ' : ' bins · ') + r.bins.reduce(function (a, b) { return a + b.qty; }, 0) + ' pcs',
        onHand: n.onHand, held: n.held, heldHref: '/stock-holds', available: n.available, transit: n.transit, reorder: r.i.re,
        qtyColor: out ? '#b83210' : (low ? '#b4410c' : '#0f172a'), flag: out || low || r.i.exp,
        flagCls: out ? 'badge b-cancelled' : (low ? 'badge b-partial' : 'badge b-approval'), flagText: out ? 'Out' : (low ? 'Low' : 'Expires in 20 days'),
        cost: '৳' + r.i.cost.toFixed(2) + ' each', value: bdt(n.onHand * r.i.cost),
        adjustHref: '/stock-adjustments' + link, transferHref: '/new-transfer',
        history: function () { self.setState({ hist: p.sku }); } };
    });
    var value = all.reduce(function (a, r) { return a + r.n.onHand * r.i.cost; }, 0);
    var inStock = all.filter(function (r) { return r.n.onHand > 0; }).length;
    var lowN = all.filter(isLow).length, outN = all.filter(isOut).length;
    var hr = st.hist ? all.filter(function (r) { return r.p.sku === st.hist; })[0] : null;
    var mine = hr ? moves.filter(function (m) { return m.sku === hr.p.sku && m.status === 'done' && (!place || m.place === place); }) : [];
    var liveRows = mine.map(function (m) { var d = new Date(m.at); return { d: d.getDate() + ' ' + MONTHS[d.getMonth()], what: KIND[m.kind] || 'Stock change', qty: (m.qty > 0 ? '+' : '−') + Math.abs(m.qty), col: m.qty > 0 ? 'var(--text-success)' : 'var(--text-danger)', note: [m.reason, m.place, m.by].filter(Boolean).join(' · ') }; });
    return { rows: rows, empty: rows.length === 0,
      kValue: bdt(value), kInStock: String(inStock), kPlaces: place ? 'at ' + place : 'in ' + whl.length + ' places', kLow: String(lowN), kOut: String(outN), kBuy: lowN + outN,
      wh: wh, whOn: wh !== 'all', whOpts: [{ k: 'all', l: 'All places' }].concat(whl.map(function (x) { return { k: whKey(x), l: x }; })),
      onWh: function (e) { var k = e.target.value; self.setState({ wh: k }); setQuery('warehouse', k === 'all' ? '' : k); },
      q: st.q || '', onQ: function (e) { var x = e.target.value; self.setState({ q: x }); setQuery('q', x.trim()); },
      emptyTitle: q ? 'No products match “' + (st.q || '').trim() + '”' : 'No products match these filters',
      emptyBody: whName + ' · ' + FL.filter(function (x) { return x.k === f; })[0].label + '. Clear the filters to see every product.',
      clearAll: function () { self.setState({ f: 'all', wh: 'all', q: '' }); setQuery('filter', ''); setQuery('warehouse', ''); setQuery('q', ''); },
      histOpen: !!hr, histTitle: hr ? 'Stock history · ' + hr.p.name : '', histNow: hr ? hr.n.onHand + ' on hand · ' + hr.n.held + ' held · ' + hr.n.available + ' available ' + (place ? 'at ' + place : 'across all places') : '', closeHist: function () { self.setState({ hist: null }); },
      histRows: liveRows.concat(HIST.map(function (h) { return { d: h[0], what: h[1], qty: (h[2] > 0 ? '+' : '−') + Math.abs(h[2]), col: h[2] > 0 ? 'var(--text-success)' : 'var(--text-danger)', note: h[3] }; })),
      filters: FL.map(function (x) { var on = x.k === f; return { label: x.label, on: on, cls: on ? 'chip on' : 'chip', pick: function () { self.setState({ f: x.k }); setQuery('filter', x.k === 'all' ? '' : x.k); } }; }) };
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
@media (prefers-reduced-motion:reduce){*{animation-duration:1ms!important;animation-iteration-count:1!important;transition-duration:1ms!important}}
.st-wh{position:relative;padding:0 10px 0 12px;gap:6px}
.st-wh:focus-within{outline:3px solid rgba(0,48,135,.5);outline-offset:2px}
.st-wh__sel{appearance:none;-webkit-appearance:none;border:0;background:transparent;font:inherit;color:inherit;height:34px;padding:0 22px 0 0;margin-right:-22px;cursor:pointer;outline:none;position:relative;z-index:1}
.st-wh__chev{pointer-events:none}
.st-num{text-align:right;white-space:nowrap;font-variant-numeric:tabular-nums}
.st-held{display:inline-flex;align-items:center;justify-content:center;min-width:32px;height:24px;padding:0 8px;border-radius:var(--radius-full);background:var(--fill-warning-soft);color:var(--text-warning);font-weight:var(--weight-medium);text-decoration:none}
.st-held:hover{color:var(--text-warning);text-decoration:underline}
section.card .td{white-space:normal;padding-left:12px;padding-right:12px}
section.card .th{padding-left:12px;padding-right:12px}
section.card .td:first-child,section.card .th:first-child{padding-left:16px}
section.card .td .badge{white-space:nowrap}
/* phones: search on its own row, then the filters, then the two page actions on a row of their own */
@media (max-width:640px){
  .st-filters{gap:8px!important;padding:12px 14px!important}
  .st-filters>label{max-width:none!important}
  .st-filters>div[style*="flex-grow"]{flex:1 1 100%!important;height:1px;margin:4px 0;background:var(--border-subtle)}
  .st-filters>a.btn{flex:1 1 0}
}
`;

// ---- markup ----

export default class StockScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="Stock">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell" style={{ background: "#eef2f7", padding: "12px", display: "flex", gap: "12px" }}>
          <__Sidebar sticky="" active="stock-list" />
          <main className="gc-shell__main" style={{ flexGrow: "1", minWidth: "0", background: "#f8fafc", borderRadius: "var(--radius-xl)", border: "1px solid #e2e8f0", display: "flex", flexDirection: "column" }}>
            <__Topbar crumb="Stock" page="Stock list" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content" style={{ flexGrow: "1", padding: "28px", display: "flex", flexDirection: "column", gap: "24px" }}>
              <__PageHeader title="Stock list" actions={<>
                <__Link href="/stock-holds" className="gc-btn gc-btn--neutral"><__Icon name="lock" width="18" height="18" aria-hidden="true" /> Stock holds</__Link>
                <__Link href="/stock-adjustments" className="gc-btn gc-btn--solid"><__Icon name="sliders-horizontal" width="18" height="18" aria-hidden="true" /> Stock adjustments</__Link>
              </>} />
              <div className="gc-cardrow" style={{ display: "flex", gap: "16px" }}>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M19 7V4a1 1 0 0 0-1-1H5a2 2 0 0 0 0 4h15a1 1 0 0 1 1 1v4h-3a2 2 0 0 0 0 4h3a1 1 0 0 0 1-1v-2a1 1 0 0 0-1-1" />
                      <path d="M3 5v14a2 2 0 0 0 2 2h15a1 1 0 0 0 1-1v-4" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.kValue}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Stock value</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>at real cost</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#e0f3fb", color: "var(--accent-text)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
                      <path d="m3.3 7 8.7 5 8.7-5" />
                      <path d="M12 22V12" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#0f172a" }}>{v.kInStock}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Products in stock</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{v.kPlaces}</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#fff1e6", color: "#b4410c", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                      <path d="M16 17h6v-6" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#b4410c" }}>{v.kLow}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Low stock</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>available below reorder level</div>
                  </div>
                </div>
                <div className="card" style={{ flexGrow: "1", flexBasis: "0", padding: "20px", display: "flex", alignItems: "center", gap: "16px" }}>
                  <span style={{ width: "48px", height: "48px", borderRadius: "var(--radius-xl)", background: "#ffece6", color: "#b83210", display: "flex", alignItems: "center", justifyContent: "center" }}>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3" />
                      <path d="M12 9v4" />
                      <path d="M12 17h.01" />
                    </svg>
                  </span>
                  <div>
                    <div style={{ fontSize: "var(--text-2xl)", lineHeight: "34px", fontWeight: "var(--weight-semibold)", color: "#b83210" }}>{v.kOut}</div>
                    <div style={{ fontSize: "var(--text-xs-plus)", lineHeight: "18px", color: "#475569" }}>Out of stock</div>
                    <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>none free to sell</div>
                  </div>
                </div>
              </div>
              {v.kBuy ? (
              <div style={{ display: "flex", alignItems: "center", gap: "14px", padding: "14px 18px", borderRadius: "var(--radius-xl)", background: "#fff1e6" }}>
                <span style={{ color: "#b4410c" }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M22 17 13.5 8.5 8.5 13.5 2 7" />
                    <path d="M16 17h6v-6" />
                  </svg>
                </span>
                <div style={{ flexGrow: "1", fontSize: "var(--text-sm)", lineHeight: "20px", color: "#5c2303" }}><strong style={{ fontWeight: "var(--weight-medium)" }}>{v.kBuy} {v.kBuy === 1 ? "product needs" : "products need"} buying.</strong> We filled in quantities from the last 30 days of sales.</div>
                <__Link href="/new-po" className="btn solid sm">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
                    <path d="M10 9H8" />
                    <path d="M16 13H8" />
                    <path d="M16 17H8" />
                  </svg>
                  <span>Make purchase order</span>
                </__Link>
              </div>
              ) : null}
              <section className="card" style={{ overflow: "hidden" }}>
                <div className="st-filters" style={{ display: "flex", alignItems: "center", gap: "12px", padding: "16px", borderBottom: "1px solid #e2e8f0", flexWrap: "wrap" }}>
                  <label style={{ position: "relative", width: "100%", maxWidth: "320px" }}>
                    <span style={{ position: "absolute", left: "14px", top: "12px", color: "#003087" }}>
                      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                        <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                        <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                        <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                        <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                        <path d="M8 7v10" />
                        <path d="M12 7v10" />
                        <path d="M17 7v10" />
                      </svg>
                    </span>
                    <input className="inp" type="search" placeholder="Scan or search a product" aria-label="Scan or search a product" value={v.q} onChange={v.onQ} style={{ paddingLeft: "44px" }} />
                  </label>
                  <span className={v.whOn ? "chip on st-wh" : "chip st-wh"}>
                    <__Icon name="store" width="16" height="16" aria-hidden="true" />
                    <select className="st-wh__sel" aria-label="Warehouse or branch" value={v.wh} onChange={v.onWh}>
                      {__list(v.whOpts).map((o) => (<option key={o.k} value={o.k}>{o.l}</option>))}
                    </select>
                    <__Icon name="chevron-down" width="16" height="16" aria-hidden="true" className="st-wh__chev" />
                  </span>
                  <div role="group" aria-label="Stock level" style={{ display: "contents" }}>
                    {__list(v.filters).map((f, $index) => (<React.Fragment key={$index}>
                        <button type="button" className={f?.cls} aria-pressed={f?.on} onClick={f?.pick}>{f?.label}</button>
                      </React.Fragment>))}
                  </div>
                  <div style={{ flexGrow: "1" }} />
                  <__Link href="/stock-count" className="btn line sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <rect width="8" height="4" x="8" y="2" rx="1" />
                      <path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2" />
                      <path d="m9 14 2 2 4-4" />
                    </svg>
                    <span>Stock count</span>
                  </__Link>
                  <__Link href="/barcode-labels" className="btn line sm">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                      <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2" />
                      <path d="M6 9V3a1 1 0 0 1 1-1h10a1 1 0 0 1 1 1v6" />
                      <rect x="6" y="14" width="12" height="8" rx="1" />
                    </svg>
                    <span>Print labels</span>
                  </__Link>
                </div>
                <div className="gc-table-wrap">
                  <table style={{ width: "100%", borderCollapse: "collapse" }}>
                    <thead>
                      <tr>
                        <th className="th">Product</th>
                        <th className="th">Where · bin</th>
                        <th className="th" style={{ textAlign: "right" }}>On hand</th>
                        <th className="th" style={{ textAlign: "right" }}>Held</th>
                        <th className="th" style={{ textAlign: "right" }}>Available</th>
                        <th className="th" style={{ textAlign: "right" }}>In transit</th>
                        <th className="th" style={{ textAlign: "right" }}>Buy again at</th>
                        <th className="th" style={{ textAlign: "right" }}>Value</th>
                        <th className="th" style={{ textAlign: "right" }}>Quick actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {__list(v.rows).map((r, $index) => (<React.Fragment key={$index}>
                          <tr className="row fade">
                            <td className="td">
                              <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                                <span style={{ width: "40px", height: "40px", flexShrink: "0", borderRadius: "var(--radius-lg)", background: "#e0f3fb", color: "#003087", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "var(--weight-medium)" }}>{r?.initial}</span>
                                <div>
                                  <div style={{ fontWeight: "var(--weight-medium)" }}>{r?.name}</div>
                                  <div className="mono" style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.code}</div>
                                </div>
                              </div>
                            </td>
                            <td className="td">
                              <div>{r?.wh}</div>
                              <div style={{ fontSize: "var(--text-xs)", lineHeight: "16px", color: "var(--text-muted)" }}>{r?.rack}</div>
                            </td>
                            <td className="td st-num" style={{ fontWeight: "var(--weight-medium)" }}>{r?.onHand}</td>
                            <td className="td st-num">{r?.held ? <__Link href={r.heldHref} className="st-held" aria-label={`${r.held} held for orders · open stock holds`}>{r.held}</__Link> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                            <td className="td st-num">
                              <div style={__sx(`font-size: var(--text-base); font-weight: var(--weight-semibold); color: ${r?.qtyColor ?? ""};`)}>{r?.available}</div>
                              {r?.flag ? (<>
                                <span className={r?.flagCls}>{r?.flagText}</span>
                              </>) : null}
                            </td>
                            <td className="td st-num">{r?.transit ? <span style={{ color: "var(--text-info)", fontWeight: "var(--weight-medium)" }}>+{r.transit}</span> : <span style={{ color: "var(--text-muted)" }}>—</span>}</td>
                            <td className="td st-num" style={{ color: "#475569" }}>{r?.reorder}</td>
                            <td className="td st-num" style={{ fontWeight: "var(--weight-medium)" }}>{r?.value}<div style={{ fontSize: "var(--text-xs)", fontWeight: "var(--weight-regular)", color: "var(--text-muted)" }}>{r?.cost}</div></td>
                            <td className="td" style={{ textAlign: "right" }}>
                              <div style={{ display: "inline-flex", gap: "2px" }}>
                                <__Link href={r?.adjustHref} className="ib" aria-label={`Adjust stock of ${r?.name ?? ""}`}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M21 4h-7" />
                                    <path d="M10 4H3" />
                                    <path d="M21 12h-9" />
                                    <path d="M8 12H3" />
                                    <path d="M21 20h-5" />
                                    <path d="M12 20H3" />
                                    <path d="M14 2v4" />
                                    <path d="M8 10v4" />
                                    <path d="M16 18v4" />
                                  </svg>
                                </__Link>
                                <__Link href={r?.transferHref} className="ib" aria-label={`Move ${r?.name ?? ""} to another warehouse`}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M8 3 4 7l4 4" />
                                    <path d="M4 7h16" />
                                    <path d="m16 21 4-4-4-4" />
                                    <path d="M20 17H4" />
                                  </svg>
                                </__Link>
                                <__Link href="/barcode-labels" className="ib" aria-label={`Print barcode label for ${r?.name ?? ""}`}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <path d="M3 7V5a2 2 0 0 1 2-2h2" />
                                    <path d="M17 3h2a2 2 0 0 1 2 2v2" />
                                    <path d="M21 17v2a2 2 0 0 1-2 2h-2" />
                                    <path d="M7 21H5a2 2 0 0 1-2-2v-2" />
                                    <path d="M8 7v10" />
                                    <path d="M12 7v10" />
                                    <path d="M17 7v10" />
                                  </svg>
                                </__Link>
                                <button type="button" className="ib" aria-label={`Stock history of ${r?.name ?? ""}`} onClick={r?.history}>
                                  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" />
                                    <path d="M12 6v6l4 2" />
                                  </svg>
                                </button>
                              </div>
                            </td>
                          </tr>
                        </React.Fragment>))}
                    </tbody>
                  </table>
                </div>
                {v.empty ? (
                  <__EmptyState icon="package-search" title={v.emptyTitle} body={v.emptyBody} actionLabel="Clear filters" onAction={v.clearAll} />
                ) : null}
              </section>
              <__Dialog open={v.histOpen} title={v.histTitle} onClose={v.closeHist} footer={<button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.closeHist}>Done</button>}>
                <p style={{ margin: "0 0 12px", fontSize: "var(--text-sm)", color: "var(--text-muted)" }}>{v.histNow}</p>
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr>
                      <th className="th">Date</th>
                      <th className="th">What happened</th>
                      <th className="th" style={{ textAlign: "right" }}>Change</th>
                    </tr>
                  </thead>
                  <tbody>
                    {__list(v.histRows).map((h, i) => (
                      <tr key={i}>
                        <td className="td" style={{ whiteSpace: "nowrap" }}>{h.d}</td>
                        <td className="td">
                          <div>{h.what}</div>
                          <div style={{ fontSize: "var(--text-xs)", color: "var(--text-muted)" }}>{h.note}</div>
                        </td>
                        <td className="td" style={{ textAlign: "right", fontFamily: "var(--font-data)", fontWeight: "var(--weight-medium)", color: h.col }}>{h.qty}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </__Dialog>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
