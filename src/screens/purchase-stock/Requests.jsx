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
import { Dialog, PageHeader, EmptyState } from '@/components/ui';
import { formatDate, formatBDT } from '@/lib/format';
import { STOCK_PLACES } from '@/lib/locations';
import { productBy } from '@/lib/stock';
import { addPOs, unitCost } from '@/lib/purchaseOrders';

const KEY = 'gc.requests';
const TABS = [['waiting', 'Waiting'], ['approved', 'Approved'], ['ordered', 'Turned into orders'], ['rejected', 'Rejected']];
const PRODUCTS = [
  { name: 'Sunscreen SPF 50 · 50ml', code: '8941100500235', stock: 4, supplier: 'Rahman Traders' },
  { name: 'Aloe Vera Soothing Gel 300ml', code: '8941100500112', stock: 9, supplier: 'Rahman Traders' },
  { name: 'Shipping box · Medium', code: '8941300900014', stock: 0, supplier: 'Chattogram Packaging Co.' },
  { name: 'Cotton T-shirt · Black · M', code: '8941200300317', stock: 2, supplier: 'Nabil Fashion House' },
  { name: 'Wireless Earbuds Pro', code: '8941400400025', stock: 9, supplier: 'Techland Imports' },
  { name: 'Steel Water Bottle 750ml', code: '8941500500019', stock: 31, supplier: 'Eastern Electronics' },
  { name: 'Daily Care Shampoo 340ml', code: '8941300300017', stock: 88, supplier: 'Rahman Traders' },
  { name: 'Budget Android Phone 6/128', code: '8941400400018', stock: 5, supplier: 'Dhaka Gadget Hub' },
  { name: 'Premium Miniket Rice 5kg', code: '8941100100011', stock: 12, supplier: 'Meghna Traders' },
  { name: 'Soybean Cooking Oil 2L', code: '8941100100035', stock: 6, supplier: 'Meghna Traders' },
  { name: 'Denim Jeans · Blue · 32', code: '8941200200214', stock: 3, supplier: 'Nabil Fashion House' },
  { name: 'Rice Cooker 1.8L Walton', code: '8941500500026', stock: 2, supplier: 'Eastern Electronics' },
  { name: '20W USB-C fast charger', code: '8941400400032', stock: 0, supplier: 'Techland Imports' },
  { name: 'Tempered glass 2-pack', code: '8941400400049', stock: 14, supplier: 'Mobile Mart' },
  { name: 'Packing tape 2 inch', code: '8941300900021', stock: 8, supplier: 'PackRight Supplies' },
  { name: 'Hyaluronic Toner 150ml', code: '8941300300031', stock: 22, supplier: 'Rahman Traders' },
];
// suppliers a request can be ordered from: the ones on requests plus the regular suppliers
const SUPPLIERS = [...new Set([...PRODUCTS.map((p) => p.supplier), 'Techland Imports', 'Dhaka Gadget Hub', 'Mobile Mart', 'Eastern Electronics', 'PowerCell Traders', 'PackRight Supplies'])];
const PLACES = [...STOCK_PLACES, 'Online orders'];
// online orders ship from the main warehouse, so that is where their stock is delivered
const deliverTo = (place) => (STOCK_PLACES.includes(place) ? place : 'Central Warehouse');
const STAFF = ['Tania', 'Karim', 'Rafi', 'Sadia Akter', 'Moumita Das'];
const day = (d) => new Date(2026, 8, d).getTime();
const SEED = [
  // more requests to try the approve flow with: different branches, suppliers, urgent and routine
  { id: 'RQ-0116', ...PRODUCTS[12], qty: 24, by: 'Moumita Das', place: 'Mirpur branch', need: day(30), status: 'waiting', note: 'Customers asking daily, none left' },
  { id: 'RQ-0115', ...PRODUCTS[12], qty: 36, by: 'Tania', place: 'Dhanmondi branch', need: day(30), status: 'waiting', note: 'Same charger, Dhanmondi also out' },
  { id: 'RQ-0114', ...PRODUCTS[7], qty: 10, by: 'Sadia Akter', place: 'Gulshan-1 branch', need: day(29), status: 'waiting', note: 'Wholesale order from Jamal Telecom needs 8' },
  { id: 'RQ-0113', ...PRODUCTS[8], qty: 40, by: 'Karim', place: 'Central Warehouse', need: day(29), status: 'waiting', note: 'Wholesale buyers want 10-sack lots' },
  { id: 'RQ-0112', ...PRODUCTS[9], qty: 60, by: 'Moumita Das', place: 'Mirpur branch', need: day(27), status: 'waiting', note: '' },
  { id: 'RQ-0111', ...PRODUCTS[10], qty: 30, by: 'Rafi', place: 'Online orders', need: day(26), status: 'waiting', note: 'Size 32 is the best seller online' },
  { id: 'RQ-0110', ...PRODUCTS[11], qty: 8, by: 'Sadia Akter', place: 'Dhanmondi branch', need: day(28), status: 'waiting', note: '' },
  { id: 'RQ-0109', ...PRODUCTS[13], qty: 100, by: 'Tania', place: 'Dhanmondi branch', need: day(24), status: 'waiting', note: 'Offer: free glass with every phone' },
  { id: 'RQ-0108', ...PRODUCTS[14], qty: 50, by: 'Karim', place: 'Chattogram hub', need: day(23), status: 'waiting', note: 'For outgoing parcels' },
  { id: 'RQ-0107', ...PRODUCTS[15], qty: 24, by: 'Moumita Das', place: 'Mirpur branch', need: day(21), status: 'approved', note: '' },
  { id: 'RQ-0106', ...PRODUCTS[9], qty: 40, by: 'Karim', place: 'Chattogram hub', need: day(19), status: 'rejected', reason: 'Price went up this week. Ask again on Sunday.', note: '' },
  { id: 'RQ-0105', ...PRODUCTS[4], qty: 12, by: 'Rafi', place: 'Online orders', need: day(17), status: 'approved', note: 'Flash sale next week' },
  { id: 'RQ-0104', ...PRODUCTS[0], qty: 48, by: 'Tania', place: 'Dhanmondi branch', need: day(22), status: 'waiting', note: 'Selling out every weekend' },
  { id: 'RQ-0103', ...PRODUCTS[1], qty: 36, by: 'Tania', place: 'Dhanmondi branch', need: day(22), status: 'waiting', note: '' },
  { id: 'RQ-0102', ...PRODUCTS[2], qty: 500, by: 'Karim', place: 'Central Warehouse', need: day(20), status: 'waiting', note: 'No boxes left for packing' },
  { id: 'RQ-0101', ...PRODUCTS[3], qty: 60, by: 'Rafi', place: 'Online orders', need: day(25), status: 'waiting', note: '' },
  { id: 'RQ-0100', ...PRODUCTS[4], qty: 20, by: 'Sadia Akter', place: 'Dhanmondi branch', need: day(28), status: 'approved', note: '' },
  { id: 'RQ-0099', ...PRODUCTS[6], qty: 120, by: 'Moumita Das', place: 'Mirpur branch', need: day(18), status: 'ordered', po: 'PO-2609-0021', note: '' },
  { id: 'RQ-0098', ...PRODUCTS[5], qty: 200, by: 'Karim', place: 'Central Warehouse', need: day(15), status: 'rejected', reason: 'Enough stock in Mirpur. Transfer it instead.', note: '' },
];
const BADGE = { waiting: ['Waiting', 'warning'], approved: ['Approved', 'info'], ordered: ['Ordered', 'success'], rejected: ['Rejected', 'error'] };
const num = (v) => Math.max(0, Math.round(Number(v) || 0));

const CSS = `
.rq-flow{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-4);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);font-size:var(--text-xs);color:var(--text-muted)}
.rq-flow b{display:inline-flex;align-items:center;gap:8px;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.rq-flow b svg{color:var(--primary)}
.rq-flow i{flex:none;width:20px;height:1px;background:var(--border-strong)}
.rq-card{overflow:hidden}
.rq-card .gc-table th,.rq-card .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.rq-card .gc-table th:first-child,.rq-card .gc-table td:first-child{padding-left:var(--space-5)}
.rq-card .gc-table th:last-child,.rq-card .gc-table td:last-child{padding-right:var(--space-4)}
.rq-card .gc-badge,.rq-card .gc-btn,.rq-num{white-space:nowrap}
.rq-bar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4)}
.rq-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.rq-search{position:relative;flex:0 1 280px;margin-bottom:var(--space-2)}
.rq-search svg{position:absolute;left:12px;top:13px;color:var(--text-muted);pointer-events:none}
.rq-search input{padding-left:38px}
.rq-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rq-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.rq-code{font-family:var(--font-data)}
.rq-num{text-align:right;font-variant-numeric:tabular-nums}
.rq-low{color:var(--text-danger);font-weight:var(--weight-medium)}
.rq-qty{width:84px;text-align:right}
.rq-actions{display:flex;justify-content:flex-end;gap:var(--space-2)}
.rq-pick{position:sticky;bottom:0;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-4);padding:var(--space-3) var(--space-5);background:var(--primary);color:#fff;font-size:var(--text-sm)}
.rq-pick span:first-child{font-weight:var(--weight-medium)}
.rq-pick__sups{flex:1;min-width:0;opacity:.85;font-size:var(--text-xs)}
.rq-pick .gc-btn{background:#fff;color:var(--primary)}
.rq-pick .gc-btn--flat{background:none;color:#fff}
.rq-form{display:flex;flex-direction:column;gap:var(--space-4)}
.rq-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.rq-made{align-items:flex-start}
.rq-made a{font-family:var(--font-data);font-weight:var(--weight-medium);color:inherit;text-decoration:underline;text-underline-offset:3px}
.rq-made p{margin:0}
.rq-made__text{flex:1;min-width:0;display:flex;flex-direction:column;gap:var(--space-1)}
.rq-made__list{display:flex;flex-wrap:wrap;gap:var(--space-1) var(--space-4);font-size:var(--text-xs)}
.rq-sum{display:flex;flex-wrap:wrap;align-items:baseline;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-sm)}
.rq-sum b{font-weight:var(--weight-semibold)}
.rq-po{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);overflow:hidden}
.rq-po__head{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-4);background:var(--surface-subtle)}
.rq-po__head h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rq-po__place{min-width:200px;flex:0 1 240px}
.rq-po .gc-table th,.rq-po .gc-table td{padding-left:var(--space-2);padding-right:var(--space-2);white-space:normal}
.rq-po .gc-table th:first-child,.rq-po .gc-table td:first-child{padding-left:var(--space-4)}
.rq-po .gc-table th:last-child,.rq-po .gc-table td:last-child{padding-right:var(--space-4)}
.rq-po__total td{font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:599px){.rq-two{grid-template-columns:1fr}}
`;

export default function Requests() {
  const [rows, setRows] = useState([]);
  const [tab, setTab] = useState('waiting');
  const [q, setQ] = useState('');
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
    return rows.filter((r) => r.status === tab && (!text || (r.name + ' ' + r.code + ' ' + r.by + ' ' + r.supplier).toLowerCase().includes(text)));
  }, [rows, tab, q]);
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

  return (
    <div className="dc-screen ds" data-screen="Requests">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-requests" />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Purchase" page="Staff requests" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
            <PageHeader
              title="Staff requests"
              description="What the shops and the warehouse are asking you to buy."
              actions={<>
                <Link href="/purchase-orders" className="gc-btn gc-btn--neutral"><Icon name="file-text" width="18" height="18" aria-hidden="true" /> Purchase orders</Link>
                <button type="button" className="gc-btn gc-btn--solid" onClick={() => setForm({ product: PRODUCTS[0].name, supplier: PRODUCTS[0].supplier, qty: '', by: STAFF[0], place: PLACES[0], need: '2026-10-05', note: '' })}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New request</button>
              </>}
            />

            <div className="rq-flow">
              <b><Icon name="user-round" width="16" height="16" aria-hidden="true" />Staff asks</b><i />
              <b><Icon name="shield-check" width="16" height="16" aria-hidden="true" />You approve</b><span>or change the quantity</span><i />
              <b><Icon name="file-text" width="16" height="16" aria-hidden="true" />Becomes a purchase order</b><span>one order per supplier</span>
            </div>

            {made ? (
              <div className="gc-alert gc-alert--soft gc-alert--success rq-made" role="status">
                <Icon name="circle-check" width="20" height="20" aria-hidden="true" />
                <div className="rq-made__text">
                  <p><b>{made.length} purchase order{made.length === 1 ? '' : 's'} made as draft{made.length === 1 ? '' : 's'}.</b> Check each one and send it to the supplier.</p>
                  <div className="rq-made__list">{made.map((o) => <span key={o.no}><Link href={`/po-detail?no=${o.no}`}>{o.no}</Link> · {o.supplier} · {formatBDT(o.total)}</span>)}</div>
                </div>
                <button type="button" className="gc-iconbtn" aria-label="Close this message" onClick={() => setMade(null)}><Icon name="x" width="18" height="18" /></button>
              </div>
            ) : null}

            <section className="gc-card rq-card">
              <div className="rq-bar">
                <div className="gc-tabs" role="tablist" aria-label="Requests by status" style={{ borderBottom: 0, overflow: 'visible', flexWrap: 'wrap' }}>
                  {TABS.map(([k, label]) => <button key={k} type="button" role="tab" aria-selected={tab === k} className={'gc-tab rq-tab' + (tab === k ? ' gc-tab--active' : '')} onClick={() => pickTab(k)}>{label}<b>{counts[k]}</b></button>)}
                </div>
                <label className="rq-search"><Icon name="search" width="18" height="18" aria-hidden="true" /><input className="gc-input" type="search" placeholder="Search product, staff or supplier" aria-label="Search product, staff or supplier" value={q} onChange={(e) => setQ(e.target.value)} /></label>
              </div>

              {shown.length === 0 ? <EmptyState icon="clipboard-list" title={q ? 'No request matches that search' : `No ${BADGE[tab][0].toLowerCase()} request`} body={tab === 'waiting' && !q ? 'Every request has been answered.' : 'Nothing is in this group right now.'} /> : (
                <div className="gc-table-wrap">
                  <table className="gc-table gc-table--compact gc-table--hoverable">
                    <thead><tr>
                      {canPick ? <th scope="col"><input type="checkbox" className="gc-check" aria-label="Select all requests" checked={picked.length === shown.length} onChange={(e) => setSel(e.target.checked ? Object.fromEntries(shown.map((r) => [r.id, true])) : {})} /></th> : null}
                      <th scope="col">Product</th><th scope="col">In stock</th><th scope="col" className="rq-num">Asked for</th><th scope="col">Asked by</th><th scope="col">Needed by</th><th scope="col">Buy from</th>
                      <th scope="col">{tab === 'ordered' ? 'Purchase order' : tab === 'rejected' ? 'Reason' : <span className="sr-only">Actions</span>}</th>
                    </tr></thead>
                    <tbody>
                      {shown.map((r) => (
                        <tr key={r.id}>
                          {canPick ? <td><input type="checkbox" className="gc-check" aria-label={`Select ${r.name}`} checked={!!sel[r.id]} onChange={(e) => setSel({ ...sel, [r.id]: e.target.checked })} /></td> : null}
                          <td><span className="rq-strong">{r.name}</span><span className="rq-sub"><span className="rq-code">{r.code}</span>{r.note ? ' · ' + r.note : ''}</span></td>
                          <td className={r.stock < 10 ? 'rq-low' : ''}>{r.stock === 0 ? 'Out' : r.stock + ' left'}</td>
                          <td className="rq-num">{tab === 'waiting' ? <input className="gc-input rq-qty" type="number" min="1" inputMode="numeric" aria-label={`Quantity to buy of ${r.name}`} value={r.qty} onChange={(e) => patch([r.id], { qty: num(e.target.value) })} /> : <span className="rq-strong">{r.qty}</span>}</td>
                          <td>{r.by}<span className="rq-sub">{r.place}</span></td>
                          <td>{formatDate(r.need)}</td>
                          <td>{r.supplier}</td>
                          <td>
                            {tab === 'waiting' ? <div className="rq-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => openApprove(r)}><Icon name="check" width="16" height="16" aria-hidden="true" /> Approve</button><button type="button" className="gc-iconbtn" aria-label={`Reject the request for ${r.name}`} onClick={() => setReject({ id: r.id, name: r.name, reason: '' })}><Icon name="x" width="18" height="18" /></button></div> : null}
                            {tab === 'approved' ? <div className="rq-actions"><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => patch([r.id], { status: 'waiting' })}>Back to waiting</button></div> : null}
                            {tab === 'ordered' ? <Link href={`/po-detail?no=${r.po}`} className="rq-code rq-strong">{r.po}</Link> : null}
                            {tab === 'rejected' ? <><span className="rq-sub" style={{ color: 'var(--text-body)' }}>{r.reason}</span><button type="button" className="gc-btn gc-btn--sm gc-btn--flat" style={{ padding: 0, height: 'auto' }} onClick={() => patch([r.id], { status: 'waiting', reason: undefined })}>Bring back</button></> : null}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {canPick && picked.length ? (
                <div className="rq-pick" role="status">
                  <span>{picked.length} selected</span>
                  <span className="rq-pick__sups">{pickedSuppliers.join(' · ')}</span>
                  {tab === 'waiting' ? <button type="button" className="gc-btn gc-btn--flat" onClick={() => approve(picked.map((r) => r.id))}>Approve only</button> : null}
                  <button type="button" className="gc-btn" onClick={openPreview}><Icon name="file-text" width="18" height="18" aria-hidden="true" /> Make {pickedSuppliers.length} purchase order{pickedSuppliers.length === 1 ? '' : 's'}</button>
                </div>
              ) : null}
            </section>
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
              <div><label className="gc-label" htmlFor="rq-place">For</label><select id="rq-place" className="gc-input gc-select" value={form.place} onChange={(e) => setForm({ ...form, place: e.target.value })}>{PLACES.map((x) => <option key={x}>{x}</option>)}</select></div>
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
                    <div className="rq-po__place"><label className="gc-label" htmlFor={`rq-deliver-${gi}`}>Deliver to</label><select id={`rq-deliver-${gi}`} className="gc-input gc-select" value={g.place} onChange={(e) => setPreview(preview.map((x, i) => (i === gi ? { ...x, place: e.target.value } : x)))}>{STOCK_PLACES.map((x) => <option key={x}>{x}</option>)}</select></div>
                  </div>
                  <div className="gc-table-wrap">
                    <table className="gc-table gc-table--compact">
                      <thead><tr><th scope="col">Product</th><th scope="col" className="rq-num">Qty</th><th scope="col" className="rq-num">Unit cost</th><th scope="col" className="rq-num">Line total</th></tr></thead>
                      <tbody>
                        {g.lines.map((l) => (
                          <tr key={l.name}>
                            <td><span className="rq-strong">{l.name}</span><span className="rq-sub"><span className="rq-code">{l.code}</span> · {l.ids.join(', ')}</span></td>
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
            <p className="gc-help" style={{ margin: 0 }}>{ap.row.by} asked for {ap.row.qty} pcs for {ap.row.place} · {ap.row.stock === 0 ? 'out of stock now' : ap.row.stock + ' left now'}{ap.row.note ? ` · “${ap.row.note}”` : ''}</p>
            <div className="rq-two">
              <div><label className="gc-label" htmlFor="ap-qty">Quantity to buy</label><input id="ap-qty" className="gc-input" type="number" min="1" inputMode="numeric" data-autofocus value={ap.qty} onChange={(e) => setAp({ ...ap, qty: e.target.value })} />{num(ap.qty) !== ap.row.qty ? <p className="gc-help">Changed from {ap.row.qty} pcs</p> : null}</div>
              <div><label className="gc-label" htmlFor="ap-cost">Unit cost (৳)</label><input id="ap-cost" className="gc-input" type="number" min="0" step="0.01" inputMode="decimal" value={ap.cost} onChange={(e) => setAp({ ...ap, cost: e.target.value })} /></div>
            </div>
            <div className="rq-two">
              <div><label className="gc-label" htmlFor="ap-sup">Supplier</label><select id="ap-sup" className="gc-input gc-select" value={ap.supplier} onChange={(e) => setAp({ ...ap, supplier: e.target.value })}>{SUPPLIERS.map((x) => <option key={x}>{x}</option>)}</select>{ap.supplier !== ap.row.supplier ? <p className="gc-help">Staff suggested {ap.row.supplier}</p> : null}</div>
              <div><label className="gc-label" htmlFor="ap-place">Deliver to</label><select id="ap-place" className="gc-input gc-select" value={ap.place} onChange={(e) => setAp({ ...ap, place: e.target.value })}>{STOCK_PLACES.map((x) => <option key={x}>{x}</option>)}</select></div>
            </div>
            <div className="rq-sum" role="status"><span>{num(ap.qty)} pcs × {formatBDT(Math.max(0, Number(ap.cost) || 0))} from <b>{ap.supplier}</b></span><span>Order total <b>{formatBDT(num(ap.qty) * Math.max(0, Number(ap.cost) || 0))}</b></span></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => setAp(null)}>Cancel</button>
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
