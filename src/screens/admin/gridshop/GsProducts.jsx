'use client';
// Grid Shop › Products (/admin/grid-shop/products?view=; Batch D, vendors Batch E): what stores can buy, by view (All · On
// sale · Waiting for approval · Paused · Low stock), each with its picture, who sells it (our stock with the count, or the
// vendor and days), the store price today (gridShop.priceFor), what GridCommerce keeps a unit, units sold and status.
// Waiting for approval: a vendor's new product (Approve / Reject with a reason the vendor sees) or a change to a live one
// (shown old → new; Approve change / Reject). Add stock to our own items, put on sale or pause, Share a product with
// stores, open the editor. Data: lib/platform/gridShop.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { StatusBadge, Sheet, EmptyState } from '@/components/ui';
import { Pic } from '@/components/ui/Pic';
import { staff } from '@/lib/platform/store';
import { getProducts, vendorById, gsCatName, setProductStatus, addStock, report, autoShareText, saveShareText, priceFor, reviewOf, isListed, approveProduct, rejectProduct, approveChange, rejectChange } from '@/lib/platform/gridShop';
import { canUse } from '@/lib/platform/marketAccess';
import { AdminShell } from '../AdminShell';
import { tk, qp, dTime, SVA_CSS } from '../services/svcAdmin';
import { ShareSheet } from '../services/ShareSheet';
import { useGs, GSA_CSS, ReviewBadge, gsPic } from './gsAdmin';

const VIEWS = [['all', 'All'], ['live', 'On sale'], ['review', 'Waiting for approval'], ['paused', 'Paused'], ['low', 'Low stock']];
const waits = (p) => p.vendorId && (reviewOf(p) === 'pending' || !!p.pendingChange);
const inView = (p, v) => (v === 'all' ? reviewOf(p) !== 'draft' : v === 'review' ? waits(p) : v === 'low' ? !p.madeToOrder && p.stock <= 5 && reviewOf(p) === 'live' : v === 'live' ? isListed(p) : reviewOf(p) === 'live' && !isListed(p));
const NAMES = { name: 'Name', cat: 'Category', blurb: 'Short pitch', details: 'What it is', unit: 'Sold as', price: 'Price', tiers: 'Bulk prices', moq: 'Minimum', days: 'Days', cover: 'Cover', gallery: 'Gallery', madeToOrder: 'Made to order', icon: 'Icon' };
const val = (k, x) => (k === 'price' ? tk(x) : k === 'tiers' ? (x || []).map((t) => `${tk(t.price)} from ${t.qty}`).join(', ') || 'none' : k === 'details' ? (x || []).join(' · ') : k === 'cover' || k === 'gallery' ? 'new pictures' : typeof x === 'boolean' ? (x ? 'yes' : 'no') : String(x));

/** A pending change, old → new, one line per field. */
export function ChangeLines({ p }) {
  if (!p.pendingChange) return null;
  return (
    <span className="gsa-change">
      {Object.entries(p.pendingChange.fields).map(([k, x]) => <span key={k}>{NAMES[k] || k}: {val(k, p[k])} → <b>{val(k, x)}</b></span>)}
      <span>{p.pendingChange.by} · {dTime(p.pendingChange.at)}{p.pendingChange.note ? ' · “' + p.pendingChange.note + '”' : ''}</span>
    </span>
  );
}
/** Reject a new product or a change, with the reason the vendor sees. rej = { p, kind: 'product' | 'change' } */
export function RejectSheet({ rej, by, onClose }) {
  const [why, setWhy] = useState('');
  useEffect(() => { setWhy(''); }, [rej]);
  const go = () => { const r = rej.kind === 'change' ? rejectChange(rej.p.id, why, by) : rejectProduct(rej.p.id, why, by); if (r.ok === false) { toast(r.error, { tone: 'error' }); return; } toast('Rejected · the vendor sees why'); onClose(); };
  return (
    <Sheet open={!!rej} title={rej ? (rej.kind === 'change' ? 'Reject the change' : 'Reject ' + rej.p.name) : ''} onClose={onClose}
      footer={rej ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={go}>Reject</button></> : null}>
      {rej ? <form className="sva-form" onSubmit={(e) => { e.preventDefault(); go(); }}>
        {rej.kind === 'change' ? <ChangeLines p={rej.p} /> : null}
        <div><label className="gc-label" htmlFor="gsr-why">Why (the vendor sees this)</label><textarea id="gsr-why" className="gc-input" rows={3} value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. The photo shows another model; add the real one." /></div>
      </form> : null}
    </Sheet>
  );
}

export default function GsProducts() {
  const { ready, tick } = useGs();
  const router = useRouter();
  const [view, setView] = useState('all');
  const [share, setShare] = useState(null);
  const [rej, setRej] = useState(null);
  const by = (() => { try { return staff().name; } catch { return 'Staff'; } })();
  useEffect(() => { const v = qp('view'); if (VIEWS.some((x) => x[0] === v)) setView(v); }, []);
  const rows = useMemo(() => (ready ? getProducts() : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const sold = useMemo(() => (ready ? Object.fromEntries(report(0).byProduct.map((r) => [r.id, r])) : {}), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = rows.filter((p) => inView(p, view));
  const tabs = VIEWS.map(([k, l]) => ({ key: k, id: 'gsp-' + k, label: l, count: ready ? rows.filter((p) => inView(p, k)).length : null, on: view === k, onClick: () => setView(k) }));
  const restock = (p) => { const r = addStock(p.id, 20); if (r.ok === false) toast(r.error, { tone: 'error' }); else toast(`+20 ${p.name} in stock`); };
  const ok = (r, msg) => { if (r.ok === false) toast(r.error, { tone: 'error' }); else toast(msg); };
  const cur = share ? rows.find((p) => p.id === share) : null;
  const link = cur && typeof window !== 'undefined' ? window.location.origin + '/grid-shop-item?id=' + cur.id : '';
  const seller = (p) => (p.vendorId ? (vendorById(p.vendorId) || { name: 'Vendor' }).name : 'Our stock');
  const status = (p) => (isListed(p) ? <StatusBadge tone="success">On sale</StatusBadge> : reviewOf(p) === 'live' ? <StatusBadge tone="neutral">{p.vendorId && (vendorById(p.vendorId) || {}).status === 'paused' ? 'Vendor paused' : 'Paused'}</StatusBadge> : null);
  return (
    <AdminShell active="gshop-products" title="Grid Shop products">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + GSA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="package" title="Grid Shop products" about="What stores can buy in Grid Shop. Our own items ship from our stock (stock goes down when ordered); vendor items are sold and shipped by the vendor, at the store price their pricing model and the pricing rules make. A vendor's new product, and any change to price, text or pictures, waits here for approval before stores see it. Prices are before VAT; bulk prices apply from a quantity."
          secondary={[{ label: 'Pricing rules', href: '/admin/grid-shop/pricing' }]} more={[{ label: 'Orders', href: '/admin/grid-shop' }, { label: 'Vendors', href: '/admin/grid-shop/vendors' }, { label: 'Who may buy', href: '/admin/services/access?m=shop' }]} primary={{ label: 'Add product', href: '/admin/grid-shop/product' }} />
        <section className="ix-card" aria-label="Products">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Products" /></div>
          {!ready ? <div style={{ minHeight: 240 }} aria-busy="true" /> : shown.length ? (<>
            <ul className="ix-plist">{shown.map((p) => { const b = priceFor(p, '', 1); return <li key={p.id}><Link href={'/admin/grid-shop/product?id=' + p.id} className="ix-pitem ix-pitem--thumb"><span style={{ gridRow: 'span 2' }}><Pic src={gsPic(p)} name={p.name} kind="item" /></span><span className="ix-pitem__top"><b>{p.name}</b><span>{waits(p) ? <ReviewBadge p={p} /> : status(p)}</span></span><span className="ix-pitem__mid">{tk(b.storeUnitNet)} · {seller(p)}{p.fulfil === 'stock' ? ' · ' + p.stock + ' in stock' : ''}</span></Link></li>; })}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Grid Shop products</caption>
                <thead><tr><th scope="col">Product</th><th scope="col">Sold by</th><th scope="col" className="ix-num">Store price</th><th scope="col" className="ix-num">We keep</th><th scope="col" className="ix-num">Sold</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{shown.map((p) => { const b = priceFor(p, '', 1); const r = reviewOf(p); return (
                  <tr key={p.id} onClick={(e) => { if (!e.target.closest('a,button')) router.push('/admin/grid-shop/product?id=' + p.id); }}>
                    <td><span className="gc-picrow"><Pic src={gsPic(p)} name={p.name} kind="item" size={32} /><span><Link href={'/admin/grid-shop/product?id=' + p.id} className="ix-strong">{p.name}</Link><span className="sva-sub">{gsCatName(p.cat)} · a {p.unit}</span></span></span></td>
                    <td>{p.vendorId ? <Link href={'/admin/grid-shop/vendor?id=' + p.vendorId}>{seller(p)}</Link> : <span className={p.stock <= 5 ? 'gsa-low' : ''}>Our stock · {p.stock}</span>}<span className="sva-sub">{p.vendorId && !p.madeToOrder ? p.stock + ' in stock · ' : ''}{p.days} day{p.days === 1 ? '' : 's'} to the store</span></td>
                    <td className="ix-num">{tk(b.storeUnitNet)}{b.discount ? <span className="sva-sub">{b.discountPct}% off {tk(b.storeUnit)}</span> : (p.tiers || []).length ? <span className="sva-sub">bulk from {p.tiers[0].qty}</span> : null}</td>
                    <td className="ix-num">{tk(b.gcKeeps)}<span className="sva-sub">{b.storeUnitNet ? Math.round((b.gcKeeps / b.storeUnitNet) * 100) : 0}%{b.model === 'commission' ? ' commission' : b.model === 'markup' ? ' markup' : ' margin'}</span></td>
                    <td className="ix-num">{sold[p.id] ? sold[p.id].units : 0}</td>
                    <td>{waits(p) ? <ReviewBadge p={p} /> : status(p)}{p.pendingChange ? <ChangeLines p={p} /> : r === 'rejected' ? <span className="sva-sub">Rejected: {p.review.reason}</span> : null}</td>
                    <td style={{ textAlign: 'right', whiteSpace: 'nowrap' }}>
                      {r === 'pending' ? <><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => ok(approveProduct(p.id, by), 'Approved: stores see it now')}>Approve</button>{' '}<button type="button" className="ix-btn ix-btn--sm" onClick={() => setRej({ p, kind: 'product' })}>Reject</button></>
                        : p.pendingChange ? <><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => ok(approveChange(p.id, by), 'Change approved')}>Approve change</button>{' '}<button type="button" className="ix-btn ix-btn--sm" onClick={() => setRej({ p, kind: 'change' })}>Reject</button></>
                        : (<>
                          {p.fulfil === 'stock' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => restock(p)}>+20 stock</button> : null}{' '}
                          <button type="button" className="ix-btn ix-btn--sm" disabled={!isListed(p)} onClick={() => setShare(p.id)}>Share</button>{' '}
                          {r === 'live' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { setProductStatus(p.id, p.status === 'live' ? 'paused' : 'live'); toast(p.status === 'live' ? 'Paused: stores no longer see it' : 'On sale'); }}>{p.status === 'live' ? 'Pause' : 'Put on sale'}</button> : null}
                        </>)}
                    </td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          </>) : <div className="ix-empty"><EmptyState icon={view === 'review' ? 'circle-check' : 'package'} title={view === 'review' ? 'Nothing waiting for approval' : 'Nothing here'} body={view === 'review' ? 'Vendors’ new products and changes show here.' : 'Try another view.'} /></div>}
          <div className="ix-foot"><span>{shown.length} products</span></div>
        </section>
      </div>
      <RejectSheet rej={rej} by={by} onClose={() => setRej(null)} />
      {cur ? <ShareSheet open onClose={() => setShare(null)} title={cur.name} subject={`${cur.name} · Grid Shop`} link={link} autoText={autoShareText(cur, link)} savedText={cur.share && cur.share.text ? cur.share.text : ''} eligible={(id) => canUse('shop', id).ok} onSaveText={(t) => saveShareText(cur.id, t)} /> : null}
    </AdminShell>
  );
}
