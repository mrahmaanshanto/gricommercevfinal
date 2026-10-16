'use client';
// Vendor portal › Products (/vendor-products; Batch E): the vendor's products by view (All · On sale · Waiting for
// approval · Drafts and rejected), each with its picture, status (a rejected one shows GridCommerce's reason; a live one
// with a change waiting says so), the vendor's price, what stores pay and what the vendor gets (gridShop.priceFor for one
// unit), and the stock, edited in the row (stock changes need no approval). A row opens the editor.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { getProducts, reviewOf, priceFor, setStock, gsCatName } from '@/lib/platform/gridShop';
import { navigate } from '@/runtime/routes';
import { VendorFrame, useVendor, ProductBadge, productState, tk, qp, picOf } from './vendorShared';

const VIEWS = [['all', 'All'], ['live', 'On sale'], ['pending', 'Waiting for approval'], ['draft', 'Drafts and rejected']];
const inView = (p, v) => { const r = reviewOf(p); return v === 'all' ? true : v === 'live' ? r === 'live' : v === 'pending' ? r === 'pending' || !!p.pendingChange : ['draft', 'rejected'].includes(r); };

function StockCell({ v, p }) {
  const [val, setVal] = useState(String(p.stock));
  useEffect(() => { setVal(String(p.stock)); }, [p.stock]);
  if (p.madeToOrder) return <span className="ix-muted">Made to order</span>;
  const save = () => {
    if (String(p.stock) === val.trim()) return;
    const r = setStock(v.id, p.id, val.trim());
    if (r.ok === false) { toast(r.error, { tone: 'error' }); setVal(String(p.stock)); } else toast(`Stock of ${p.name}: ${val.trim()}`);
  };
  return <input className="gc-input vd-stock" inputMode="numeric" aria-label={'Stock of ' + p.name} value={val} onChange={(e) => setVal(e.target.value.replace(/[^0-9]/g, ''))} onBlur={save} onKeyDown={(e) => { if (e.key === 'Enter') e.currentTarget.blur(); }} />;
}

function Body({ v }) {
  const { tick } = useVendor();
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  useEffect(() => { const x = qp('view'); if (VIEWS.some((y) => y[0] === x)) setView(x); }, []);
  const rows = useMemo(() => getProducts().filter((p) => p.vendorId === v.id), [v.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = rows.filter((p) => inView(p, view) && (!q.trim() || p.name.toLowerCase().includes(q.trim().toLowerCase())));
  const tabs = VIEWS.map(([k, l]) => ({ key: k, id: 'vp-' + k, label: l, count: rows.filter((p) => inView(p, k)).length, on: view === k, onClick: () => setView(k) }));
  const pb = (p) => priceFor(p, '', 1);
  return (<>
    <ShopHeader icon="package" title="Products" about="What you sell on Grid Shop. New products and changes to price, name, text or pictures wait for GridCommerce to approve them (usually within a working day); stock changes at once. Stores pay the store price; you get your price less our commission (or, on markup pricing, your price and we add our markup)."
      primary={{ label: 'Add product', icon: 'plus', href: '/vendor-product' }} />
    <section className="ix-card" aria-label="Products">
      <div className="ix-bar"><IndexTabs tabs={tabs} label="Products" /></div>
      <div style={{ padding: 'var(--space-2) var(--space-4)', borderBottom: '1px solid var(--border-subtle)' }}><SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search your products" /></div>
      {shown.length ? (<>
        <ul className="ix-plist">{shown.map((p) => { const b = pb(p); const s = productState(p); return (
          <li key={p.id}><Link href={'/vendor-product?id=' + p.id} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={picOf(p)} name={p.name} kind="item" /></span><span className="ix-pitem__top"><b>{p.name}</b><span><ProductBadge p={p} /></span></span><span className="ix-pitem__mid">{s.sub ? s.sub : `Stores pay ${tk(b.storeUnitNet)} · you get ${tk(b.vendorGets)} · ${p.madeToOrder ? 'made to order' : p.stock + ' in stock'}`}</span></Link></li>
        ); })}</ul>
        <div className="ix-table-wrap">
          <table className="ix-table">
            <caption className="sr-only">Your products</caption>
            <thead><tr><th scope="col">Product</th><th scope="col">Status</th><th scope="col" className="ix-num">Your price</th><th scope="col" className="ix-num">Stores pay</th><th scope="col" className="ix-num">You get</th><th scope="col" className="ix-num">Stock</th></tr></thead>
            <tbody>{shown.map((p) => { const b = pb(p); const s = productState(p); return (
              <tr key={p.id} onClick={(e) => { if (!e.target.closest('a,button,input')) navigate('/vendor-product?id=' + p.id); }}>
                <td><span className="gc-picrow"><Pic src={picOf(p)} name={p.name} kind="item" size={32} /><span><Link href={'/vendor-product?id=' + p.id} className="ix-strong">{p.name}</Link><span className="vd-sub">{gsCatName(p.cat)} · a {p.unit}</span></span></span></td>
                <td><ProductBadge p={p} />{s.sub ? <span className="vd-sub" style={{ color: 'var(--text-danger)', maxWidth: 260, whiteSpace: 'normal' }}>{s.sub}</span> : p.pendingChange && p.pendingChange.fields.price ? <span className="vd-sub">Price {tk(p.price)} → {tk(p.pendingChange.fields.price)}</span> : null}</td>
                <td className="ix-num">{tk(p.price)}</td>
                <td className="ix-num">{tk(b.storeUnitNet)}{b.discount ? <span className="vd-sub">{b.discountPct}% off</span> : null}</td>
                <td className="ix-num">{tk(b.vendorGets)}</td>
                <td className="ix-num"><StockCell v={v} p={p} /></td>
              </tr>
            ); })}</tbody>
          </table>
        </div>
      </>) : <div className="ix-empty"><EmptyState icon="package-plus" title={rows.length ? 'Nothing here' : 'No products yet'} body={rows.length ? 'Try another view.' : 'Add your first product; GridCommerce approves it before stores see it.'} actionLabel={rows.length ? undefined : 'Add product'} onAction={rows.length ? undefined : () => navigate('/vendor-product')} /></div>}
      <div className="ix-foot"><span>{shown.length === 1 ? '1 product' : shown.length + ' products'}</span></div>
    </section>
  </>);
}

export default function VendorProducts() {
  return <VendorFrame active="products" screen="VendorProducts">{(v) => <Body v={v} />}</VendorFrame>;
}
