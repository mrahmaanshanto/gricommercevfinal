'use client';
// Requests — staff ask for stock, the owner approves (or changes the quantity), and approved
// requests become purchase orders, one per supplier. Before the orders are made, a preview shows
// each future order (lines, buying price, where it is delivered and its total).
//   Waiting -> Approved -> Turned into orders, or Rejected (which can be brought back).
// Front end only: requests are kept in this browser and start from demo rows; the orders are saved
// with src/lib/purchaseOrders.js and open on /po-detail?no=….

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { navigate } from '@/runtime/routes';
import { formatDate, formatBDT } from '@/lib/format';
import { getReceivingPlaces, placeName } from '@/lib/locations';
import { usePlaceList } from '@/lib/usePlaces';
import { productBy } from '@/lib/stock';
import { addPOs, unitCost } from '@/lib/purchaseOrders';

const KEY = 'gc.requests';
const TABS = [['waiting', 'Pending'], ['approved', 'Approved'], ['ordered', 'Turned into orders'], ['rejected', 'Rejected']];
const PRODUCTS = [
  { name: 'Anker 20W USB-C Charger', code: '8941100500235', stock: 4, supplier: 'Rahman Telecom' },
  { name: 'Phone Ring Holder', code: '8941100500112', stock: 9, supplier: 'Rahman Telecom' },
  { name: 'Shipping box · Medium', code: '8941300900014', stock: 0, supplier: 'Chattogram Packaging Co.' },
  { name: 'Camera Lens Protector · Clear', code: '8941200300317', stock: 2, supplier: 'Nabil Mobile House' },
  { name: 'Wireless Earbuds Pro', code: '8941400400025', stock: 9, supplier: 'Techland Imports' },
  { name: 'Foldable Phone Stand', code: '8941500500019', stock: 31, supplier: 'Eastern Electronics' },
  { name: 'Lightning Cable 1m', code: '8941300300017', stock: 88, supplier: 'Rahman Telecom' },
  { name: 'Realme Note 50 6/128GB', code: '8941400400018', stock: 5, supplier: 'Dhaka Gadget Hub' },
  { name: 'Baseus USB-C Cable 100W 1m', code: '8941100100011', stock: 12, supplier: 'Meghna Traders' },
  { name: 'Tempered Glass 9H', code: '8941100100035', stock: 6, supplier: 'Meghna Traders' },
  { name: 'Baseus Car Phone Holder', code: '8941200200214', stock: 3, supplier: 'Nabil Mobile House' },
  { name: 'Anker Power Bank 10000mAh', code: '8941500500026', stock: 2, supplier: 'Eastern Electronics' },
  { name: '20W USB-C fast charger', code: '8941400400032', stock: 0, supplier: 'Techland Imports' },
  { name: 'Tempered glass 2-pack', code: '8941400400049', stock: 14, supplier: 'Mobile Mart' },
  { name: 'Packing tape 2 inch', code: '8941300900021', stock: 8, supplier: 'PackRight Supplies' },
  { name: 'Type-C Wired Earphones', code: '8941300300031', stock: 22, supplier: 'Rahman Telecom' },
];
// suppliers a request can be ordered from: the ones on requests plus the regular suppliers
const SUPPLIERS = [...new Set([...PRODUCTS.map((p) => p.supplier), 'Techland Imports', 'Dhaka Gadget Hub', 'Mobile Mart', 'Eastern Electronics', 'PowerCell Traders', 'PackRight Supplies'])];
// online orders ship from the main warehouse, so that is where their stock is delivered
// runs in click handlers only (after mount): the live places that can receive deliveries
const deliverTo = (place) => (getReceivingPlaces().includes(placeName(place)) ? placeName(place) : 'Central Warehouse');
const STAFF = ['Tania', 'Karim', 'Rafi', 'Sadia Akter', 'Moumita Das'];
const day = (d) => new Date(2026, 8, d).getTime();
const SEED = [
  // more requests to try the approve flow with: different branches, suppliers, urgent and routine
  { id: 'RQ-0116', ...PRODUCTS[12], qty: 24, by: 'Moumita Das', place: 'Mirpur branch', need: day(30), status: 'waiting', note: 'Customers asking daily, none left' },
  { id: 'RQ-0115', ...PRODUCTS[12], qty: 36, by: 'Tania', place: 'Dhanmondi branch', need: day(30), status: 'waiting', note: 'Same charger, Dhanmondi also out' },
  { id: 'RQ-0114', ...PRODUCTS[7], qty: 10, by: 'Sadia Akter', place: 'Mirpur branch', need: day(29), status: 'waiting', note: 'Wholesale order from Jamal Telecom needs 8' },
  { id: 'RQ-0113', ...PRODUCTS[8], qty: 40, by: 'Karim', place: 'Central Warehouse', need: day(29), status: 'waiting', note: 'Wholesale buyers want 10-sack lots' },
  { id: 'RQ-0112', ...PRODUCTS[9], qty: 60, by: 'Moumita Das', place: 'Mirpur branch', need: day(27), status: 'waiting', note: '' },
  { id: 'RQ-0111', ...PRODUCTS[10], qty: 30, by: 'Rafi', place: 'Online orders', need: day(26), status: 'waiting', note: 'Size 32 is the best seller online' },
  { id: 'RQ-0110', ...PRODUCTS[11], qty: 8, by: 'Sadia Akter', place: 'Dhanmondi branch', need: day(28), status: 'waiting', note: '' },
  { id: 'RQ-0109', ...PRODUCTS[13], qty: 100, by: 'Tania', place: 'Dhanmondi branch', need: day(24), status: 'waiting', note: 'Offer: free glass with every phone' },
  { id: 'RQ-0108', ...PRODUCTS[14], qty: 50, by: 'Karim', place: 'Central Warehouse', need: day(23), status: 'waiting', note: 'For outgoing parcels' },
  { id: 'RQ-0107', ...PRODUCTS[15], qty: 24, by: 'Moumita Das', place: 'Mirpur branch', need: day(21), status: 'approved', note: '' },
  { id: 'RQ-0106', ...PRODUCTS[9], qty: 40, by: 'Karim', place: 'Central Warehouse', need: day(19), status: 'rejected', reason: 'Price went up this week. Ask again on Sunday.', note: '' },
  { id: 'RQ-0105', ...PRODUCTS[4], qty: 12, by: 'Rafi', place: 'Online orders', need: day(17), status: 'approved', note: 'Flash sale next week' },
  { id: 'RQ-0104', ...PRODUCTS[0], qty: 48, by: 'Tania', place: 'Dhanmondi branch', need: day(22), status: 'waiting', note: 'Selling out every weekend' },
  { id: 'RQ-0103', ...PRODUCTS[1], qty: 36, by: 'Tania', place: 'Dhanmondi branch', need: day(22), status: 'waiting', note: '' },
  { id: 'RQ-0102', ...PRODUCTS[2], qty: 500, by: 'Karim', place: 'Central Warehouse', need: day(20), status: 'waiting', note: 'No boxes left for packing' },
  { id: 'RQ-0101', ...PRODUCTS[3], qty: 60, by: 'Rafi', place: 'Online orders', need: day(25), status: 'waiting', note: '' },
  { id: 'RQ-0100', ...PRODUCTS[4], qty: 20, by: 'Sadia Akter', place: 'Dhanmondi branch', need: day(28), status: 'approved', note: '' },
  { id: 'RQ-0099', ...PRODUCTS[6], qty: 120, by: 'Moumita Das', place: 'Mirpur branch', need: day(18), status: 'ordered', po: 'PO-2609-0021', note: '' },
  { id: 'RQ-0098', ...PRODUCTS[5], qty: 200, by: 'Karim', place: 'Central Warehouse', need: day(15), status: 'rejected', reason: 'Enough stock in Mirpur. Transfer it instead.', note: '' },
];
const BADGE = { waiting: ['Pending', 'warning'], approved: ['Approved', 'info'], ordered: ['Ordered', 'success'], rejected: ['Rejected', 'error'] };
const num = (v) => Math.max(0, Math.round(Number(v) || 0));

const CSS = `
.rq-id{font-family:var(--font-data)}
.rq-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rq-name{display:block;max-width:280px;overflow:hidden;text-overflow:ellipsis}
.rq-low{color:var(--text-danger);font-weight:var(--weight-medium)}
.rq-reason{display:block;max-width:260px;overflow:hidden;text-overflow:ellipsis;color:var(--text-body)}
.rq-pbtn{width:100%;border-top:0;border-left:0;border-right:0;background:none;font:inherit;text-align:left;cursor:pointer}
.rq-bulk-sups{flex:1;min-width:0;overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.rq-form{display:flex;flex-direction:column;gap:var(--space-4)}
.rq-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.rq-made{align-items:flex-start}
.rq-made a{font-family:var(--font-data);font-weight:var(--weight-medium);color:inherit;text-decoration:underline;text-underline-offset:3px}
.rq-made p{margin:0}
.rq-made__text{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-1)}
.rq-made__list{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-4);font-size:var(--text-xs)}
.rq-sum{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-2);padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-sm)}
.rq-sum b{font-weight:var(--weight-semibold)}
.rq-po{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.rq-po__head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:var(--space-3);background:var(--surface-subtle)}
.rq-po__head h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rq-po__place{min-width:200px;flex:0 1 240px}
.rq-po .gc-table th,.rq-po .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.rq-po .gc-table th:first-child,.rq-po .gc-table td:first-child{padding-left:var(--space-3)}
.rq-po .gc-table th:last-child,.rq-po .gc-table td:last-child{padding-right:var(--space-3)}
.rq-num{text-align:right;font-variant-numeric:tabular-nums}
.rq-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.rq-po__total td{font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:599px){.rq-two{grid-template-columns:1fr}}
`;

export default function Requests() {
  const stockPlaces = usePlaceList('stock');       // live places after mount (built-in list first)
  const receiving = usePlaceList('receiving');
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('waiting');
  const [q, setQ] = useState('');
  const [sup, setSup] = useState('');            // supplier filter
  const [find, setFind] = useState(false);       // search and filters open
  const [sel, setSel] = useState({});
  const [form, setForm] = useState(null);      // new request
  const [reject, setReject] = useState(null);  // { id, reason }
  const [preview, setPreview] = useState(null); // future purchase orders, one per supplier
  const [made, setMade] = useState(null);       // orders just made: [{ no, supplier, total }]
  const [ap, setAp] = useState(null);           // approving one request: { row, qty, supplier, cost, place }

  useEffect(() => {
    // saved requests are kept; demo requests added since they were saved are brought in too
    let saved = null;
    try { saved = JSON.parse(window.localStorage.getItem(KEY)); } catch { /* ignore */ }
    if (!saved) { setRows(SEED); return; }
    const have = new Set(saved.map((r) => r.id));
    setRows([...SEED.filter((r) => !have.has(r.id)), ...saved].sort((a, b) => b.id.localeCompare(a.id)));
  }, []);
  const save = (next) => { setRows(next); try { window.localStorage.setItem(KEY, JSON.stringify(next)); } catch { /* ignore */ } };
  const patch = (ids, change) => save(rows.map((r) => (ids.includes(r.id) ? { ...r, ...change } : r)));

  const counts = Object.fromEntries(TABS.map(([k]) => [k, rows.filter((r) => r.status === k).length]));
  const shown = useMemo(() => {
    const text = q.trim().toLowerCase();
    return rows.filter((r) => r.status === tab && (!sup || r.supplier === sup) && (!text || (r.name + ' ' + r.code + ' ' + r.by + ' ' + r.supplier).toLowerCase().includes(text)));
  }, [rows, tab, q, sup]);
  const picked = shown.filter((r) => sel[r.id]);
  const pickedSuppliers = [...new Set(picked.map((r) => r.supplier))];
  const canPick = tab === 'waiting' || tab === 'approved';
  const pickTab = (k) => { setTab(k); setSel({}); };

  // Approve one request: adjust the quantity, pick the supplier, then approve it or order it straight away
  const openApprove = (r) => setAp({ row: r, qty: String(r.qty), supplier: r.supplier, cost: String(unitCost(r.name)), place: deliverTo(r.place) });
  const approveOne = (order) => {
    const qty = num(ap.qty), cost = Math.max(0, Number(ap.cost) || 0);
    if (!qty) { toast('Enter how many to buy', { tone: 'error' }); return; }
    if (!order) {
      patch([ap.row.id], { status: 'approved', qty, supplier: ap.supplier });
      toast(`${ap.row.name} approved · ${qty} pcs from ${ap.supplier}`); setAp(null); return;
    }
    if (!cost) { toast('Enter the unit cost for the order', { tone: 'error' }); return; }
    const [po] = addPOs([{ supplier: ap.supplier, place: ap.place, from: [ap.row.id], lines: [{ name: ap.row.name, code: ap.row.code, sku: productBy(ap.row.name)?.sku || '', qty, cost }] }]);
    patch([ap.row.id], { status: 'ordered', qty, supplier: ap.supplier, po: po.no });
    setMade([{ no: po.no, supplier: po.supplier, total: po.total }]);
    toast(`Request approved and ${po.no} created for ${ap.supplier} · ${formatBDT(po.total)}`);
    setAp(null);
  };
  const approve = (ids) => { patch(ids, { status: 'approved' }); setSel({}); toast(ids.length === 1 ? 'Request approved' : `${ids.length} requests approved`); };
  // preview: one purchase order per supplier; the same product asked twice becomes one line
  const openPreview = () => {
    const none = picked.find((r) => !r.qty);
    if (none) { toast(`Enter how many pieces of ${none.name} to buy`, { tone: 'error' }); return; }
    setPreview(pickedSuppliers.map((supplier) => {
      const list = picked.filter((r) => r.supplier === supplier);
      const counts = list.reduce((m, r) => ({ ...m, [deliverTo(r.place)]: (m[deliverTo(r.place)] || 0) + 1 }), {});
      const lines = [];
      list.forEach((r) => {
        const same = lines.find((l) => l.name === r.name);
        if (same) { same.qty += r.qty; same.ids.push(r.id); same.places.push(r.place); } else lines.push({ name: r.name, code: r.code, qty: r.qty, cost: unitCost(r.name), ids: [r.id], places: [r.place] });
      });
      return { supplier, lines, asked: [...new Set(list.map((r) => r.place))], place: Object.keys(counts).sort((a, b) => counts[b] - counts[a])[0] };
    }));
  };
  const makeOrders = () => {
    const orders = addPOs(preview.map((g) => ({
      supplier: g.supplier, place: g.place, from: g.lines.flatMap((l) => l.ids),
      lines: g.lines.map((l) => ({ name: l.name, code: l.code, sku: productBy(l.name)?.sku || '', qty: l.qty, cost: l.cost })),
    })));
    const poOf = Object.fromEntries(orders.map((o) => [o.supplier, o.no]));
    const ids = preview.flatMap((g) => g.lines.flatMap((l) => l.ids));
    save(rows.map((r) => (ids.includes(r.id) ? { ...r, status: 'ordered', po: poOf[r.supplier] } : r)));
    setSel({}); setPreview(null);
    setMade(orders.map((o) => ({ no: o.no, supplier: o.supplier, total: o.total })));
    toast(`${orders.length} purchase order${orders.length === 1 ? '' : 's'} made as drafts: ${orders.map((o) => o.no).join(', ')}`);
  };
  const previewTotal = preview ? preview.reduce((a, g) => a + g.lines.reduce((b, l) => b + l.qty * l.cost, 0), 0) : 0;
  const doReject = (e) => {
    e.preventDefault();
    patch([reject.id], { status: 'rejected', reason: reject.reason.trim() || 'No reason given' });
    setReject(null); toast('Request rejected. The person who asked will see the reason.');
  };
  const addRequest = (e) => {
    e.preventDefault();
    if (!num(form.qty)) { toast('Enter how many pieces are needed', { tone: 'error' }); return; }
    const p = PRODUCTS.find((x) => x.name === form.product);
    const id = 'RQ-' + String(rows.reduce((m, r) => Math.max(m, Number(r.id.split('-')[1])), 0) + 1).padStart(4, '0');
    save([{ id, ...p, supplier: form.supplier, qty: num(form.qty), by: form.by, place: form.place, need: new Date(form.need).getTime(), status: 'waiting', note: form.note.trim() }, ...rows]);
    setForm(null); pickTab('waiting'); toast(`Request ${id} added · waiting for approval`);
  };

  const searching = find || !!q || !!sup;
  const hasFilters = !!(q || sup);
  const closeFind = () => { setFind(false); setQ(''); setSup(''); };
  const clearFilters = () => { setQ(''); setSup(''); };
  const supplierList = [...new Set(rows.map((r) => r.supplier))].sort();
  // a request opens its review (approve, order, reject); an ordered one opens its purchase order
  const openRow = (r) => { if (r.status === 'waiting' || r.status === 'approved') openApprove(r); else if (r.status === 'ordered' && r.po) navigate(`/po-detail?no=${encodeURIComponent(r.po)}`); };
  const allPicked = shown.length > 0 && picked.length === shown.length;
  const toggleAll = () => setSel(allPicked ? {} : Object.fromEntries(shown.map((r) => [r.id, true])));
  const reviewToReject = () => { const r = ap.row; setAp(null); setReject({ id: r.id, name: r.name, reason: '' }); };
  const reviewToWaiting = () => { patch([ap.row.id], { status: 'waiting' }); setAp(null); toast('Moved back to Pending'); };

  return (
    <div className="dc-screen ds" data-screen="Requests">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-requests" />
        <main className="gc-shell__main">
          <Topbar crumb="Purchase" page="Staff requests" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="clipboard-list" title="Staff requests"
                about="What the shops and the warehouse are asking you to buy. Staff asks, you approve or change the quantity, and it becomes a purchase order — one order per supplier."
                more={[{ label: 'Purchase orders', href: '/purchase-orders' }]}
                primary={{ label: 'New request', onClick: () => setForm({ product: PRODUCTS[0].name, supplier: PRODUCTS[0].supplier, qty: '', by: STAFF[0], place: stockPlaces[0], need: '2026-10-05', note: '' }) }} />

              {made ? (
                <div className="gc-alert gc-alert--soft gc-alert--success rq-made" role="status">
                  <Icon name="circle-check" width="16" height="16" aria-hidden="true" />
                  <div className="rq-made__text">
                    <p><b>{made.length} purchase order{made.length === 1 ? '' : 's'} made as draft{made.length === 1 ? '' : 's'}.</b> Check each one and send it to the supplier.</p>
                    <div className="rq-made__list">{made.map((o) => <span key={o.no}><Link href={`/po-detail?no=${o.no}`}>{o.no}</Link> · {o.supplier} · {formatBDT(o.total)}</span>)}</div>
                  </div>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Close this message" onClick={() => setMade(null)}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                </div>
              ) : null}

              <section className="ix-card" aria-label="Staff requests">
                {canPick && picked.length ? (
                  <div className="ix-bulk" role="toolbar" aria-label="Selected requests">
                    <input type="checkbox" checked={allPicked} onChange={toggleAll} aria-label="Select all requests" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
                    <span className="ix-bulk__n">{picked.length} selected</span>
                    <span className="rq-bulk-sups">{pickedSuppliers.join(' · ')}</span>
                    {tab === 'waiting' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => approve(picked.map((r) => r.id))}><Icon name="check" width="16" height="16" aria-hidden="true" />Approve only</button> : null}
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={openPreview}><Icon name="file-text" width="16" height="16" aria-hidden="true" />Make {pickedSuppliers.length} purchase order{pickedSuppliers.length === 1 ? '' : 's'}</button>
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setSel({})}>Clear selection</button>
                  </div>
                ) : (
                  <div className="ix-bar">
                    {searching ? (<>
                      <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search product, staff or supplier" onDone={closeFind} autoFocus />
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                    </>) : (<>
                      <IndexTabs label="Requests by status" tabs={TABS.map(([k, label]) => ({ key: k, id: 'rq-tab-' + k, label, count: counts[k], on: tab === k, onClick: () => pickTab(k) }))} />
                      <span className="ix-tools">
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                      </span>
                    </>)}
                  </div>
                )}
                {searching && !(canPick && picked.length) ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Buy from" className={'ix-filter' + (sup ? ' is-set' : '')} value={sup} onChange={(e) => setSup(e.target.value)}>
                      <option value="">Buy from</option>
                      {supplierList.map((x) => <option key={x}>{x}</option>)}
                    </select>
                    {hasFilters ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clearFilters}>Clear all</button> : null}
                  </div>
                ) : null}

                {shown.length === 0 ? (
                  <div className="ix-empty">
                    <EmptyState icon="clipboard-list" title={hasFilters ? 'No request matches that search' : tab === 'waiting' ? 'Every request has been answered.' : `No ${BADGE[tab][0].toLowerCase()} request`}
                      actionLabel={hasFilters ? 'Clear filters' : undefined} onAction={hasFilters ? clearFilters : undefined} />
                  </div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Staff requests">
                    {shown.map((r) => (
                      <li key={r.id}>
                        <button type="button" className="ix-pitem rq-pbtn" onClick={() => openRow(r)}>
                          <span className="ix-pitem__top"><b>{r.name}</b><span>{r.qty} pcs</span></span>
                          <span className="ix-pitem__mid">{r.by} · {r.place} · {formatDate(r.need)}</span>
                          <span className="ix-pitem__tags">
                            <StatusBadge tone={r.stock < 10 ? 'error' : 'neutral'}>{r.stock === 0 ? 'Out' : r.stock + ' left'}</StatusBadge>
                            {r.status === 'ordered' && r.po ? <span className="gc-badge gc-badge--success rq-id">{r.po}</span> : null}
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Staff requests</caption>
                      <thead><tr>
                        {canPick ? <th scope="col" className="ix-check"><input type="checkbox" aria-label="Select all requests" checked={allPicked} onChange={toggleAll} /></th> : null}
                        <th scope="col">Product</th><th scope="col">Asked by</th><th scope="col">Needed by</th><th scope="col">Buy from</th><th scope="col" className="ix-num">Asked for</th><th scope="col">In stock</th>
                        {tab === 'ordered' ? <th scope="col">Purchase order</th> : null}
                        {tab === 'rejected' ? <th scope="col">Reason</th> : null}
                        {tab === 'rejected' ? <th scope="col"><span className="sr-only">Actions</span></th> : null}
                      </tr></thead>
                      <tbody>
                        {shown.map((r) => (
                          <tr key={r.id} className={sel[r.id] ? 'is-sel' : ''} onClick={(e) => { if (!e.target.closest('a,button,input,label')) openRow(r); }} style={r.status === 'rejected' ? { cursor: 'default' } : undefined}>
                            {canPick ? <td className="ix-check"><input type="checkbox" aria-label={`Select ${r.name}`} checked={!!sel[r.id]} onChange={(e) => setSel({ ...sel, [r.id]: e.target.checked })} /></td> : null}
                            <td><span className="ix-strong rq-name">{r.name}</span></td>
                            <td>{r.by}</td>
                            <td className="ix-muted">{formatDate(r.need)}</td>
                            <td>{r.supplier}</td>
                            <td className="ix-num">{r.qty}</td>
                            <td className={r.stock < 10 ? 'rq-low' : 'ix-muted'}>{r.stock === 0 ? 'Out' : r.stock + ' left'}</td>
                            {tab === 'ordered' ? <td>{r.po ? <Link href={`/po-detail?no=${r.po}`} className="ix-strong rq-id">{r.po}</Link> : '—'}</td> : null}
                            {tab === 'rejected' ? <td><span className="rq-reason" title={r.reason}>{r.reason}</span></td> : null}
                            {tab === 'rejected' ? <td><button type="button" className="ix-btn ix-btn--sm" onClick={() => patch([r.id], { status: 'waiting', reason: undefined })}>Bring back</button></td> : null}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{shown.length} {shown.length === 1 ? 'request' : 'requests'}</span></div>
              </section>
              <LearnMore topic="staff requests" />
            </div>
          </div>
        </main>
      </div>

      <Dialog open={!!form} title="New request" onClose={() => setForm(null)} width={520}>
        {form ? (
          <form className="rq-form" onSubmit={addRequest}>
            <div><label className="gc-label" htmlFor="rq-product">Product *</label><select id="rq-product" className="gc-input gc-select" value={form.product} onChange={(e) => setForm({ ...form, product: e.target.value, supplier: PRODUCTS.find((p) => p.name === e.target.value).supplier })}>{PRODUCTS.map((p) => <option key={p.code} value={p.name}>{p.name} · {p.stock === 0 ? 'out of stock' : p.stock + ' left'}</option>)}</select></div>
            <div className="rq-two">
              <div><label className="gc-label" htmlFor="rq-qty">How many *</label><input id="rq-qty" className="gc-input" type="number" min="1" inputMode="numeric" aria-required="true" data-autofocus value={form.qty} onChange={(e) => setForm({ ...form, qty: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="rq-need">Needed by</label><input id="rq-need" className="gc-input" type="date" value={form.need} onChange={(e) => setForm({ ...form, need: e.target.value })} /></div>
            </div>
            <div className="rq-two">
              <div><label className="gc-label" htmlFor="rq-by">Asked by</label><select id="rq-by" className="gc-input gc-select" value={form.by} onChange={(e) => setForm({ ...form, by: e.target.value })}>{STAFF.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="rq-place">For</label><select id="rq-place" className="gc-input gc-select" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}>{[...stockPlaces, 'Online orders'].map((x) => <option key={x}>{x}</option>)}</select></div>
            </div>
            <div><label className="gc-label" htmlFor="rq-sup">Buy from</label><select id="rq-sup" className="gc-input gc-select" value={form.supplier} onChange={(e) => setForm({ ...form, supplier: e.target.value })}>{SUPPLIERS.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="rq-note">Why it is needed</label><input id="rq-note" className="gc-input" placeholder="Optional" value={form.note} onChange={(e) => setForm({ ...form, note: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Add request</button></div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!preview} title="Make purchase orders" onClose={() => setPreview(null)} width={760}>
        {preview ? (
          <div className="rq-form">
            <div className="rq-sum" role="status"><span><b>This makes {preview.length} purchase order{preview.length === 1 ? '' : 's'}</b> · one per supplier, saved as drafts</span><span>Total <b>{formatBDT(previewTotal)}</b></span></div>
            {preview.map((g, gi) => {
              const total = g.lines.reduce((a, l) => a + l.qty * l.cost, 0);
              return (
                <section key={g.supplier} className="rq-po" aria-label={`Purchase order for ${g.supplier}`}>
                  <div className="rq-po__head">
                    <div><h3>{g.supplier}</h3><span className="rq-sub">{g.lines.length} product{g.lines.length === 1 ? '' : 's'} · asked for {g.asked.join(', ')}</span></div>
                    <div className="rq-po__place"><label className="gc-label" htmlFor={`rq-deliver-${gi}`}>Deliver to</label><select id={`rq-deliver-${gi}`} className="gc-input gc-select" value={g.place} onChange={(e) => setPreview(preview.map((x, i) => (i === gi ? { ...x, place: e.target.value } : x)))}>{receiving.map((x) => <option key={x}>{x}</option>)}</select></div>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="gc-table gc-table--compact">
                      <thead><tr><th scope="col">Product</th><th scope="col" className="rq-num">Qty</th><th scope="col" className="rq-num">Unit cost</th><th scope="col" className="rq-num">Line total</th></tr></thead>
                      <tbody>
                        {g.lines.map((l) => (
                          <tr key={l.name}>
                            <td><span className="rq-strong">{l.name}</span><span className="rq-sub"><span className="rq-id">{l.code}</span> · {l.ids.join(', ')}</span></td>
                            <td className="rq-num">{l.qty}</td>
                            <td className="rq-num">{formatBDT(l.cost)}</td>
                            <td className="rq-num rq-strong">{formatBDT(l.qty * l.cost)}</td>
                          </tr>
                        ))}
                        <tr className="rq-po__total"><td colSpan={3}>Order total</td><td className="rq-num">{formatBDT(total)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                </section>
              );
            })}
            <p className="gc-help" style={{ margin: 0 }}>Unit cost is the usual buying price from this supplier. Each order is saved as a draft for you to check and send.</p>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setPreview(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={makeOrders}><Icon name="file-text" width="18" height="18" aria-hidden="true" /> Make {preview.length} purchase order{preview.length === 1 ? '' : 's'}</button></div>
          </div>
        ) : null}
      </Dialog>

      <Dialog open={!!ap} title={ap ? `Approve · ${ap.row.name}` : 'Approve'} onClose={() => setAp(null)} width={520}>
        {ap ? (
          <form className="rq-form" onSubmit={(e) => { e.preventDefault(); approveOne(true); }}>
            <p className="gc-help" style={{ margin: 0 }}><span className="rq-id">{ap.row.id} · {ap.row.code}</span> · {ap.row.by} asked for {ap.row.qty} pcs for {ap.row.place} · needed by {formatDate(ap.row.need)} · {ap.row.stock === 0 ? 'out of stock now' : ap.row.stock + ' left now'}{ap.row.note ? ` · “${ap.row.note}”` : ''}</p>
            <div className="rq-two">
              <div><label className="gc-label" htmlFor="ap-qty">Quantity to buy</label><input id="ap-qty" className="gc-input" type="number" min="1" inputMode="numeric" data-autofocus value={ap.qty} onChange={(e) => setAp({ ...ap, qty: e.target.value })} />{num(ap.qty) !== ap.row.qty ? <p className="gc-help">Changed from {ap.row.qty} pcs</p> : null}</div>
              <div><label className="gc-label" htmlFor="ap-cost">Unit cost (৳)</label><input id="ap-cost" className="gc-input" type="number" min="0" step="0.01" inputMode="decimal" value={ap.cost} onChange={(e) => setAp({ ...ap, cost: e.target.value })} /></div>
            </div>
            <div className="rq-two">
              <div><label className="gc-label" htmlFor="ap-sup">Supplier</label><select id="ap-sup" className="gc-input gc-select" value={ap.supplier} onChange={(e) => setAp({ ...ap, supplier: e.target.value })}>{SUPPLIERS.map((x) => <option key={x}>{x}</option>)}</select>{ap.supplier !== ap.row.supplier ? <p className="gc-help">Staff suggested {ap.row.supplier}</p> : null}</div>
              <div><label className="gc-label" htmlFor="ap-place">Deliver to</label><select id="ap-place" className="gc-input gc-select" value={ap.place} onChange={(e) => setAp({ ...ap, place: e.target.value })}>{receiving.map((x) => <option key={x}>{x}</option>)}</select></div>
            </div>
            <div className="rq-sum" role="status"><span>{num(ap.qty)} pcs × {formatBDT(Math.max(0, Number(ap.cost) || 0))} from <b>{ap.supplier}</b></span><span>Order total <b>{formatBDT(num(ap.qty) * Math.max(0, Number(ap.cost) || 0))}</b></span></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              {ap.row.status === 'approved'
                ? <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={reviewToWaiting}>Back to waiting</button>
                : <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto', color: 'var(--text-danger)' }} onClick={reviewToReject}>Reject</button>}
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAp(null)}>Cancel</button>
              <button type="button" className="gc-btn gc-btn--soft" onClick={() => approveOne(false)}>Approve only</button>
              <button type="submit" className="gc-btn gc-btn--solid"><Icon name="file-plus" width="18" height="18" aria-hidden="true" /> Create order and approve</button>
            </div>
          </form>
        ) : null}
      </Dialog>

      <Dialog open={!!reject} title="Reject this request?" onClose={() => setReject(null)} width={440}>
        {reject ? (
          <form className="rq-form" onSubmit={doReject}>
            <p className="gc-help" style={{ margin: 0 }}>{reject.name}. It moves to Rejected and can be brought back later.</p>
            <div><label className="gc-label" htmlFor="rq-reason">Reason for the person who asked</label><input id="rq-reason" className="gc-input" data-autofocus placeholder="For example: enough stock in another branch" value={reject.reason} onChange={(e) => setReject({ ...reject, reason: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setReject(null)}>Keep it</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Reject request</button></div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
