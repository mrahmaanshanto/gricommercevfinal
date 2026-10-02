'use client';
// Generated from design/templates/purchase-stock/Stock.dc.html by scripts/convert-design.mjs.
// Stock — the stock list, laid out like Shopify's Inventory page (components/ui/IndexKit.jsx): the title row, the
// place picker with that place's key figures, then one card with the views (All, Low stock, Out of stock, Expiring
// soon), search and a compact table: Product · SKU · Damaged · Held · Available · On hand · In transit
// (on hand = damaged + held + available). A click on a row opens the product's stock panel: cost, value, reorder
// level, bins, the stock history and the actions (adjust, move, print a label, open the product).
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { EmptyState as __EmptyState, StatusBadge as __StatusBadge, Sheet as __Sheet } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { CATALOG, getCatalog, stockAt, getMoves, unitValue } from '@/lib/stock';
import { getHolds } from '@/lib/stockHolds';
import { getTransfers } from '@/lib/transfers';
import { STOCK_PLACES, getStockPlaces, getPlaces, placeByName, namesOf } from '@/lib/locations';
import { getRackData, binsFor, SEED as RACK_SEED } from '@/lib/racks';
import { isOnePlace } from '@/lib/stockSetup';
import { StockSetupBanner } from '@/components/StockSetupBanner';

// ---- logic (from the design's <script type="text/x-dc">) ----

function bdt(n) { var neg = n < 0; var s = String(Math.round(Math.abs(n))); var last = s.slice(-3); var rest = s.slice(0, -3); if (rest) { rest = rest.replace(/\B(?=(\d{2})+(?!\d))/g, ','); s = rest + ',' + last; } else { s = last; } return (neg ? '−' : '') + '৳' + s; }
var MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
// Products come from the catalogue (src/lib/stock.js getCatalog: the demo list plus products saved in
// Products; a new product starts with 0 on hand everywhere); the numbers per place come from stockAt():
// on hand, held for orders (stock holds), damaged, available to sell and in transit (transfers on the way).
// Reorder level and cost are this screen's demo data. Bins come from Racks & bins (src/lib/racks.js binsFor).
// Places are the live list (getStockPlaces) after mount, the built-in list on the first render.
var INFO = {
  'GR-RICE-5': [60, 'G-1', 612], 'GR-DAL-1': [40, 'G-2', 130], 'GR-SOY-2': [30, 'G-3', 331], 'GR-MUS-1': [20, 'G-3', 262], 'GR-ATTA-2': [40, 'G-4', 118, true],
  'CL-TEE-BM': [20, 'C-3', 436.2], 'CL-LEG-CL': [10, 'C-4', 980], 'CL-SNK-42': [8, 'C-6', 2150], 'CL-JNS-32': [15, 'C-5', 748],
  'SK-SHA-340': [30, 'A-5', 290], 'SK-SUN-50': [24, 'A-2', 561.6, true], 'SK-TON-150': [20, 'A-3', 455],
  'EL-PHN-128': [6, 'E-1', 11800], 'EL-EAR-PRO': [10, 'E-2', 2210], 'HM-BTL-750': [30, 'H-2', 310], 'HM-RCK-18': [5, 'H-4', 2050]
};
function info(p) { var i = INFO[p.sku] || [10, '—', unitValue(p)]; return { re: i[0], rack: i[1], cost: i[2], exp: !!i[3] }; }
function setQuery(key, value) { if (typeof window === 'undefined') return; var u = new URL(window.location.href); if (value) u.searchParams.set(key, value); else u.searchParams.delete(key); window.history.replaceState(window.history.state, '', u.pathname + u.search + u.hash); }
function getQuery(key) { if (typeof window === 'undefined') return ''; return new URLSearchParams(window.location.search).get(key) || ''; }
var WHS = STOCK_PLACES;
function whKey(w) { return w.toLowerCase().replace(/[^a-z0-9]+/g, '-'); }
var HIST = [['29 Sep', 'Sold', -2, 'POS · Dhanmondi'], ['27 Sep', 'Sold', -5, 'Online orders'], ['24 Sep', 'Received', 24, 'PO-1042 · Dhaka Gadget Hub'], ['20 Sep', 'Stock count', -1, 'Counted by Suman'], ['14 Sep', 'Moved', -6, 'To Dhanmondi branch']];
var KIND = { adjust: 'Adjusted', count: 'Stock count', transfer: 'Transfer', receive: 'Received', sale: 'Sold', delivery: 'Delivered', return: 'Returned', writeoff: 'Written off' };
var FL = [{ k: 'all', label: 'All' }, { k: 'low', label: 'Low stock' }, { k: 'out', label: 'Out of stock' }, { k: 'exp', label: 'Expiring soon' }];
class Component extends DCLogic {
  componentDidMount() {
    var p = { holds: getHolds(), moves: getMoves(), transfers: getTransfers(), catalog: getCatalog(), whs: getStockPlaces(), plist: getPlaces(), racks: getRackData(), one: isOnePlace() }, f = getQuery('filter'), w = getQuery('warehouse'), q = getQuery('q'), sku = getQuery('sku');
    if (FL.some(function (x) { return x.k === f; })) p.f = f;
    if (p.whs.some(function (x) { return whKey(x) === w; })) p.wh = w;
    if (q) p.q = q;
    // ?sku=<sku> opens that product's stock panel (the product page's "Stock history" link)
    if (sku && p.catalog.some(function (x) { return x.sku === sku; })) p.hist = sku;
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
    // the products at the chosen place (every product for All places); the views and the figures count these
    var here = all.filter(function (r) { return !place || baseAt(r.p, place) || r.n.onHand || r.n.transit; });
    var rows = here.filter(function (r) {
      if (q && [r.p.name, r.p.sku, r.p.barcode, r.p.variant].concat(r.bins.map(function (b) { return b.code; })).join(' ').toLowerCase().indexOf(q) < 0) return false;
      if (f === 'low') return isLow(r); if (f === 'out') return isOut(r); if (f === 'exp') return r.i.exp; return true;
    }).map(function (r) {
      var p = r.p, n = r.n, out = isOut(r), low = isLow(r);
      return { sku: p.sku, name: p.name, variant: p.variant || '', initial: p.name.charAt(0),
        onHand: n.onHand, held: n.held, damaged: n.damaged, available: n.available, transit: n.transit,
        tone: out ? 'ix-bad' : low ? 'ix-warn' : '',
        flag: out ? ['Out of stock', 'error'] : low ? ['Low stock', 'warning'] : r.i.exp ? ['Expiring soon', 'warning'] : null,
        open: function () { self.setState({ hist: p.sku }); },
        onRowClick: function (e) { if (e.target.closest && e.target.closest('a,button,input,select,label')) return; self.setState({ hist: p.sku }); } };
    });
    var value = here.reduce(function (a, r) { return a + r.n.onHand * r.i.cost; }, 0);
    var inStock = here.filter(function (r) { return r.n.onHand > 0; }).length;
    var lowN = here.filter(isLow).length, outN = here.filter(isOut).length, expN = here.filter(function (r) { return r.i.exp; }).length;
    var counts = { all: here.length, low: lowN, out: outN, exp: expN };
    // the stock panel of one product (row click): its numbers here, cost, bins and history
    var hr = st.hist ? all.filter(function (r) { return r.p.sku === st.hist; })[0] : null;
    var mine = hr ? moves.filter(function (m) { return m.sku === hr.p.sku && m.status === 'done' && (!place || m.place === place); }) : [];
    var liveRows = mine.map(function (m) { var d = new Date(m.at); return { d: d.getDate() + ' ' + MONTHS[d.getMonth()], what: KIND[m.kind] || 'Stock change', qty: (m.qty > 0 ? '+' : '−') + Math.abs(m.qty), up: m.qty > 0, note: [m.reason, m.place, m.by].filter(Boolean).join(' · ') }; });
    var link = hr ? '?sku=' + encodeURIComponent(hr.p.sku) + (place ? '&place=' + encodeURIComponent(place) : '') : '';
    var sheet = hr ? {
      title: hr.p.name, code: [hr.p.sku, hr.p.variant].filter(Boolean).join(' · '), where: place || 'All places',
      onHand: hr.n.onHand, held: hr.n.held, damaged: hr.n.damaged, available: hr.n.available, transit: hr.n.transit, reorder: hr.i.re,
      cost: '৳' + hr.i.cost.toFixed(2), value: bdt(hr.n.onHand * hr.i.cost),
      wh: place || (hr.places + (hr.places === 1 ? ' place' : ' places')),
      rack: !hr.bins.length ? 'Not in a bin' : place ? hr.bins.map(function (b) { return b.code + ' · ' + b.qty; }).join(', ') : 'In ' + hr.bins.length + (hr.bins.length === 1 ? ' bin · ' : ' bins · ') + hr.bins.reduce(function (a, b) { return a + b.qty; }, 0) + ' pcs',
      adjustHref: '/stock-adjustments' + link, transferHref: '/new-transfer' + (place ? '?from=' + encodeURIComponent(place) : ''),
      productHref: hr.p.productId ? '/add-product?id=' + encodeURIComponent(hr.p.productId) : '',
      history: liveRows.concat(HIST.map(function (h) { return { d: h[0], what: h[1], qty: (h[2] > 0 ? '+' : '−') + Math.abs(h[2]), up: h[2] > 0, note: h[3] }; }))
    } : null;
    var closeFind = function () { self.setState({ find: false, q: '' }); setQuery('q', ''); };
    return { rows: rows, empty: rows.length === 0, one: !!st.one, place: place,
      kValue: bdt(value), kInStock: String(inStock), kPlaces: place ? 'at ' + place : 'in ' + whl.length + ' places',
      kHeld: String(here.reduce(function (a, r) { return a + r.n.held; }, 0)), kTransit: String(here.reduce(function (a, r) { return a + r.n.transit; }, 0)),
      kBuy: lowN + outN, showLow: function () { self.setState({ f: 'low' }); setQuery('filter', 'low'); },
      wh: wh, whOpts: [{ k: 'all', l: 'All places' }].concat(whl.map(function (x) { return { k: whKey(x), l: x }; })),
      onWh: function (e) { var k = e.target.value; self.setState({ wh: k }); setQuery('warehouse', k === 'all' ? '' : k); },
      q: st.q || '', onQ: function (e) { var x = e.target.value; self.setState({ q: x }); setQuery('q', x.trim()); },
      find: !!(st.find || q), openFind: function () { self.setState({ find: true }); }, closeFind: closeFind,
      emptyTitle: q ? 'No products match “' + (st.q || '').trim() + '”' : 'No products match these filters',
      clearAll: function () { self.setState({ f: 'all', wh: 'all', q: '', find: false }); setQuery('filter', ''); setQuery('warehouse', ''); setQuery('q', ''); },
      sheet: sheet, closeHist: function () { self.setState({ hist: null }); },
      countLabel: rows.length === 1 ? '1 product' : rows.length + ' products',
      tabs: FL.map(function (x) { return { key: x.k, id: 'st-tab-' + x.k, label: x.label, count: counts[x.k], on: x.k === f, onClick: function () { self.setState({ f: x.k }); setQuery('filter', x.k === 'all' ? '' : x.k); } }; }) };
  }
}

// ---- styles ----

const CSS = `
.st-thumb{background:var(--fill-primary-soft);color:var(--primary)}
.st-name{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.st-prod{max-width:420px}
.st-prod .gc-badge{flex:none}
.st-sku{font-family:var(--font-data);font-size:var(--text-xs)}
.st-held{color:var(--text-warning);font-weight:var(--weight-medium);text-decoration:none}
.st-held:hover{text-decoration:underline}
.st-place{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);white-space:nowrap}
.st-place svg{color:var(--text-muted)}
.st-buy{display:flex;flex-wrap:wrap;align-items:center;gap:6px var(--space-3);margin:0;font-size:var(--text-sm);color:var(--text-body)}
.st-buy svg{flex:none;color:var(--text-warning)}
.st-buy button{padding:0;border:0;background:none;font:inherit;font-weight:var(--weight-medium);color:var(--text-heading);cursor:pointer}
.st-buy button:hover{color:var(--primary);text-decoration:underline}
.st-buy a{font-weight:var(--weight-medium)}
.st-sub{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.st-sub .st-sku{color:var(--text-body)}
.st-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.st-hist{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.st-hist li{display:grid;grid-template-columns:52px minmax(0,1fr) auto;gap:var(--space-3);padding:var(--space-2) 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.st-hist li:last-child{border-bottom:0}
.st-hist small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.st-hist b{font-family:var(--font-data);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums}
.st-up{color:var(--text-success)}.st-down{color:var(--text-danger)}
`;

// ---- markup ----

export default class StockScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    const s = v.sheet;
    const more = v.one
      ? [{ label: 'Damaged & expired', href: '/expiry-disposal' }]
      : [{ label: 'Stock holds', href: '/stock-holds' }, { label: 'Transfers', href: '/transfers' }, { label: 'Damaged & expired', href: '/expiry-disposal' }, { label: 'Racks & bins', href: '/racks' }];
    return (
      <div className="dc-screen ds" data-screen="Stock">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="stock-list" />
          <main className="gc-shell__main">
            <__Topbar crumb="Stock" page="Stock list" placeholder="Search or scan any barcode" />
            <div className="gc-shell__content">
              <div className="ix-page">
                <ShopHeader icon="boxes" title="Stock list"
                  about="How many of each product you have at each place: damaged, held for orders, available to sell and on hand. Open a product to see its cost, bins and stock history."
                  secondary={v.one ? [{ label: 'Print labels', href: '/barcode-labels' }] : [{ label: 'Stock count', href: '/stock-count' }, { label: 'Print labels', href: '/barcode-labels' }]}
                  more={more}
                  primary={v.one ? { label: 'New purchase', href: '/buy-goods' } : { label: 'Stock adjustments', href: '/stock-adjustments' }} />
                <StockSetupBanner />

                <MetricStrip label={'Stock at ' + (v.place || 'all places')}
                  lead={v.one
                    ? <span className="st-place"><__Icon name="store" width="16" height="16" aria-hidden="true" />{v.kPlaces}</span>
                    : <select className="ix-pick" aria-label="Warehouse or branch" value={v.wh} onChange={v.onWh}>{v.whOpts.map((o) => <option key={o.k} value={o.k}>{o.l}</option>)}</select>}
                  items={[
                    { label: 'Stock value', value: v.kValue, sub: 'at cost' },
                    { label: 'Products in stock', value: v.kInStock },
                    { label: 'Held for orders', value: v.kHeld, href: v.one ? undefined : '/stock-holds' },
                    { label: 'In transit', value: v.kTransit, href: v.one ? undefined : '/transfers' },
                  ]} />

                {v.kBuy ? (
                  <p className="st-buy" role="status">
                    <__Icon name="trending-down" width="16" height="16" aria-hidden="true" />
                    <button type="button" onClick={v.showLow}>{v.kBuy === 1 ? '1 product needs buying' : `${v.kBuy} products need buying`}</button>
                    <__Link href="/new-po">Make purchase order</__Link>
                  </p>
                ) : null}

                <section className="ix-card" aria-label="Stock list">
                  <div className="ix-bar">
                    {v.find ? (<>
                      <SearchField value={v.q} onChange={v.onQ} placeholder="Scan or search a product" onDone={v.closeFind} autoFocus />
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={v.closeFind}>Cancel</button>
                    </>) : (<>
                      <IndexTabs tabs={v.tabs} label="Stock level" />
                      <span className="ix-tools">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={v.openFind}><__Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                      </span>
                    </>)}
                  </div>

                  {v.empty ? (
                    <div className="ix-empty"><__EmptyState icon="package-search" title={v.emptyTitle} actionLabel="Clear filters" onAction={v.clearAll} /></div>
                  ) : (<>
                    <ul className="ix-plist" aria-label="Stock list">
                      {v.rows.map((r) => (
                        <li key={r.sku}>
                          <button type="button" className="ix-pitem" onClick={r.open}>
                            <span className="ix-pitem__top"><b>{r.name}</b><span className={r.tone}>{`${r.available} available`}</span></span>
                            <span className="ix-pitem__mid">{[r.sku, r.variant].filter(Boolean).join(' · ')}</span>
                            {r.flag ? <span className="ix-pitem__tags"><__StatusBadge tone={r.flag[1]}>{r.flag[0]}</__StatusBadge></span> : null}
                          </button>
                        </li>
                      ))}
                    </ul>
                    <div className="ix-table-wrap">
                      <table className="ix-table gc-table--keep">
                        <caption className="sr-only">Stock at {v.place || 'all places'}, {v.countLabel}</caption>
                        <thead>
                          <tr>
                            <th scope="col">Product</th>
                            <th scope="col">SKU</th>
                            <th scope="col" className="ix-num">Damaged</th>
                            <th scope="col" className="ix-num">Held</th>
                            <th scope="col" className="ix-num">Available</th>
                            <th scope="col" className="ix-num">On hand</th>
                            <th scope="col" className="ix-num">In transit</th>
                          </tr>
                        </thead>
                        <tbody>
                          {v.rows.map((r) => (
                            <tr key={r.sku} onClick={r.onRowClick}>
                              <td>
                                <span className="ix-prod st-prod">
                                  <span className="ix-thumb st-thumb" aria-hidden="true">{r.initial}</span>
                                  <button type="button" className="ix-strong st-name" onClick={r.open}>{r.name}{r.variant ? <span className="ix-muted"> · {r.variant}</span> : null}</button>
                                  {r.flag ? <__StatusBadge tone={r.flag[1]}>{r.flag[0]}</__StatusBadge> : null}
                                </span>
                              </td>
                              <td className="ix-muted st-sku">{r.sku}</td>
                              <td className={'ix-num' + (r.damaged ? '' : ' ix-muted')}>{r.damaged}</td>
                              <td className={'ix-num' + (r.held ? '' : ' ix-muted')}>{r.held && !v.one ? <__Link href="/stock-holds" className="st-held" aria-label={`${r.held} held for orders · open stock holds`}>{r.held}</__Link> : r.held}</td>
                              <td className={'ix-num ix-strong ' + r.tone}>{r.available}</td>
                              <td className="ix-num">{r.onHand}</td>
                              <td className={'ix-num' + (r.transit ? '' : ' ix-muted')}>{r.transit}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </>)}
                  <div className="ix-foot"><span>{v.countLabel}</span></div>
                </section>
                <LearnMore topic="stock" />
              </div>
            </div>
          </main>
        </div>

        <__Sheet open={!!s} title={s ? s.title : ''} onClose={v.closeHist}
          footer={<button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={v.closeHist}>Done</button>}>
          {s ? (<>
            <p className="st-sub"><span className="st-sku">{s.code}</span> · {s.where}</p>
            <KV rows={[
              ['On hand', s.onHand],
              ['Damaged', s.damaged],
              ['Held for orders', s.held],
              ['Available', <b key="a">{s.available}</b>],
              ['In transit', s.transit],
              ['Buy again at', s.reorder],
              ['Cost', s.cost + ' each'],
              ['Stock value', s.value],
              v.one ? null : ['Where', s.wh],
              v.one ? null : ['Bins', s.rack],
            ]} />
            <div className="st-acts">
              {v.one ? null : <__Link href={s.adjustHref} className="ix-btn ix-btn--sm"><__Icon name="sliders-horizontal" width="16" height="16" aria-hidden="true" />Adjust stock</__Link>}
              {v.one ? null : <__Link href={s.transferHref} className="ix-btn ix-btn--sm"><__Icon name="arrow-left-right" width="16" height="16" aria-hidden="true" />Move</__Link>}
              <__Link href="/barcode-labels" className="ix-btn ix-btn--sm"><__Icon name="printer" width="16" height="16" aria-hidden="true" />Print label</__Link>
              {s.productHref ? <__Link href={s.productHref} className="ix-btn ix-btn--sm"><__Icon name="package" width="16" height="16" aria-hidden="true" />Open product</__Link> : null}
            </div>
            <h3 className="ix-section-title">Stock history</h3>
            <ul className="st-hist">
              {s.history.map((h, i) => (
                <li key={i}>
                  <span className="ix-muted">{h.d}</span>
                  <span>{h.what}<small>{h.note}</small></span>
                  <b className={h.up ? 'st-up' : 'st-down'}>{h.qty}</b>
                </li>
              ))}
            </ul>
          </>) : null}
        </__Sheet>
      </div>
    );
  }
}
