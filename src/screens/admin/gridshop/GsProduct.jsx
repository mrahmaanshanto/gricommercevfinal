'use client';
// Grid Shop › a product (/admin/grid-shop/product?id=; no id = new; Batch D): name, category, icon, the short pitch and
// what it is (one per line), the unit it is sold in; price before VAT, our cost (margin shown), bulk prices and the
// minimum; who sells it — our stock (count, days) or a vendor (who, their price, stock, days; the store price and what we
// keep follow from their pricing model and the pricing rules, shown as a breakdown) — and pictures (cover and gallery,
// uploaded or from the library). On sale / Paused, Share. A vendor's own product waiting for approval says so (approve it
// in Products › Waiting for approval or on the vendor's page). Data: lib/platform/gridShop.js.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { productById, saveProduct, getVendors, GS_CATS, autoShareText, saveShareText, priceFor } from '@/lib/platform/gridShop';
import { canUse } from '@/lib/platform/marketAccess';
import { AdminShell } from '../AdminShell';
import { qp, tk, SVA_CSS } from '../services/svcAdmin';
import { ServicePictures, MEDIA_CSS } from '../services/SvcMedia';
import { ShareSheet } from '../services/ShareSheet';
import { useGs, GSA_CSS, ReviewBadge, Breakdown } from './gsAdmin';

const ICONS = ['package', 'mail', 'layers', 'scroll', 'printer', 'scan-barcode', 'archive', 'tablet-smartphone', 'tag', 'sticky-note', 'sticker', 'receipt', 'store', 'box'];
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const blank = () => ({ id: '', name: '', cat: 'packaging', icon: 'package', blurb: '', details: [], unit: 'piece', price: '', cost: '', tiers: [], moq: 1, fulfil: 'stock', stock: 0, supplierId: '', vendorId: '', days: 2, cover: '', gallery: [], status: 'paused' });

export default function GsProduct() {
  const { ready } = useGs();
  const router = useRouter();
  const [p, setP] = useState(null);
  const [isNew, setNew] = useState(true);
  const [share, setShare] = useState(false);
  useEffect(() => { if (!ready || p) return; const f = qp('id') ? productById(qp('id')) : null; setP(f ? JSON.parse(JSON.stringify(f)) : blank()); setNew(!f); }, [ready, p]);
  if (!p) return <AdminShell active="gshop-product" title="Product"><div style={{ minHeight: 400 }} aria-busy="true" /></AdminShell>;
  const set = (patch) => setP((x) => ({ ...x, ...patch }));
  const price = Number(p.price) || 0, cost = Number(p.cost) || 0;
  const save = () => {
    const r = saveProduct({ ...p, share: p.id ? (productById(p.id) || {}).share || null : null });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(isNew ? 'Product added' + (r.product.status === 'live' ? '' : ' (paused until you put it on sale)') : 'Saved');
    if (isNew) router.replace('/admin/grid-shop/product?id=' + r.product.id);
    setP(JSON.parse(JSON.stringify(r.product))); setNew(false);
  };
  const cur = !isNew ? productById(p.id) || p : p;
  const link = typeof window !== 'undefined' ? window.location.origin + '/grid-shop-item?id=' + p.id : '';
  return (
    <AdminShell active="gshop-product" title={p.name || 'New product'}>
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS + MEDIA_CSS + GSA_CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/grid-shop/products" backLabel="Products" title={p.name || 'New product'}
          badges={<><span className={'gc-badge gc-badge--' + (p.status === 'live' ? 'success' : 'slate')}>{p.status === 'live' ? 'On sale' : 'Paused'}</span>{!isNew ? <ReviewBadge p={cur} /> : null}</>}
          secondary={[{ label: p.status === 'live' ? 'Pause' : 'Put on sale', onClick: () => set({ status: p.status === 'live' ? 'paused' : 'live' }) }, !isNew && cur.status === 'live' ? { label: 'Share', icon: 'share-2', onClick: () => setShare(true) } : null].filter(Boolean)}
          primary={{ label: 'Save', icon: 'check', onClick: save }} />
        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card sva-pad" aria-labelledby="gp-b">
              <h2 id="gp-b">Product</h2>
              <div><label className="gc-label" htmlFor="gp-n">Name</label><input id="gp-n" className="gc-input" value={p.name} onChange={(e) => set({ name: e.target.value })} placeholder="Mailer boxes, small (pack of 100)" /></div>
              <div className="sva-grid2">
                <div><label className="gc-label" htmlFor="gp-c">Category</label><select id="gp-c" className="gc-input gc-select" value={p.cat} onChange={(e) => set({ cat: e.target.value })}>{GS_CATS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="gp-u">Sold as</label><input id="gp-u" className="gc-input" value={p.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="pack of 100" /></div>
                <div><label className="gc-label" htmlFor="gp-i">Icon (when there is no picture)</label><select id="gp-i" className="gc-input gc-select" value={p.icon} onChange={(e) => set({ icon: e.target.value })}>{ICONS.map((i) => <option key={i}>{i}</option>)}</select></div>
              </div>
              <div><label className="gc-label" htmlFor="gp-bl">Short pitch</label><input id="gp-bl" className="gc-input" value={p.blurb} onChange={(e) => set({ blurb: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="gp-d">What it is (one per line)</label><textarea id="gp-d" className="gc-input" rows={4} key={'d' + p.id} defaultValue={(p.details || []).join('\n')} onChange={(e) => set({ details: lines(e.target.value) })} /></div>
            </section>
            <section className="ix-card sva-pad" aria-labelledby="gp-pr">
              <h2 id="gp-pr">Price</h2>
              <div className="sva-grid2">
                <div><label className="gc-label" htmlFor="gp-p">{p.fulfil === 'supplier' ? 'Vendor’s price before VAT (৳)' : 'Price before VAT (৳)'}</label><input id="gp-p" className="gc-input" inputMode="numeric" value={p.price} onChange={(e) => set({ price: e.target.value })} /></div>
                {p.fulfil === 'supplier' ? null : <div><label className="gc-label" htmlFor="gp-k">Our cost (৳)</label><input id="gp-k" className="gc-input" inputMode="numeric" value={p.cost} onChange={(e) => set({ cost: e.target.value })} /></div>}
                <div><label className="gc-label" htmlFor="gp-m">Least a store can buy</label><input id="gp-m" className="gc-input" inputMode="numeric" value={p.moq} onChange={(e) => set({ moq: e.target.value })} /></div>
              </div>
              {p.fulfil === 'supplier' && price && p.supplierId ? <Breakdown b={priceFor({ ...p, id: p.id || 'new', price, cost: 0, vendorId: p.supplierId, tiers: [] }, '', 1)} vendor={(getVendors().find((x) => x.id === p.supplierId) || {}).name} />
                : <p className="gc-help" style={{ margin: 0 }}>{price ? `Margin ${tk(price - cost)} (${Math.round(((price - cost) / price) * 100)}%) on each.` : 'VAT 15% is added at checkout.'}</p>}
              <span className="gc-label">Bulk prices</span>
              {(p.tiers || []).map((t, i) => (
                <div key={i} className="sva-row" style={{ flexWrap: 'nowrap' }}>
                  <span className="ix-muted">From</span><input className="gc-input" style={{ maxWidth: 90 }} inputMode="numeric" aria-label={'Bulk price ' + (i + 1) + ' quantity'} value={t.qty} onChange={(e) => set({ tiers: p.tiers.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)) })} />
                  <span className="ix-muted">each</span><input className="gc-input" style={{ maxWidth: 120 }} inputMode="numeric" aria-label={'Bulk price ' + (i + 1)} value={t.price} onChange={(e) => set({ tiers: p.tiers.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })} />
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove bulk price" onClick={() => set({ tiers: p.tiers.filter((_, j) => j !== i) })}><Icon name="x" width="14" height="14" /></button>
                </div>
              ))}
              {(p.tiers || []).length < 3 ? <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ tiers: [...(p.tiers || []), { qty: '', price: '' }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add bulk price</button></div> : null}
            </section>
            <ServicePictures s={p} set={set} proofs={false} />
          </div>
          <aside className="ix-side" aria-label="Ships from">
            <section className="ix-card sva-pad">
              <h2>Sold by</h2>
              <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}>
                <legend className="sr-only">Sold by</legend>
                <label className="sva-chk" style={{ whiteSpace: 'normal' }}><input type="radio" name="gp-f" className="gc-check gc-check--radio" checked={p.fulfil === 'stock'} onChange={() => set({ fulfil: 'stock' })} />Our stock: we pack and ship it</label>
                <label className="sva-chk" style={{ whiteSpace: 'normal' }}><input type="radio" name="gp-f" className="gc-check gc-check--radio" checked={p.fulfil === 'supplier'} onChange={() => set({ fulfil: 'supplier' })} />A vendor sells it and ships it to the store</label>
              </fieldset>
              {p.fulfil === 'supplier' ? (
                <div><label className="gc-label" htmlFor="gp-sp">Vendor</label><select id="gp-sp" className="gc-input gc-select" value={p.supplierId || ''} onChange={(e) => { const s = getVendors().find((x) => x.id === e.target.value); set({ supplierId: e.target.value, vendorId: e.target.value, days: s ? s.days : p.days }); }}><option value="">Choose…</option>{getVendors().filter((s) => s.status !== 'paused' || s.id === p.supplierId).map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}</select></div>
              ) : null}
              {p.fulfil === 'supplier' && p.madeToOrder ? null : <div><label className="gc-label" htmlFor="gp-s">{p.fulfil === 'supplier' ? 'Vendor’s stock now' : 'In stock now'}</label><input id="gp-s" className="gc-input" inputMode="numeric" value={p.stock} onChange={(e) => set({ stock: e.target.value })} /></div>}
              <div><label className="gc-label" htmlFor="gp-dy">Days to reach the store</label><input id="gp-dy" className="gc-input" inputMode="numeric" value={p.days} onChange={(e) => set({ days: e.target.value })} /></div>
              <p className="gc-help">{p.fulfil === 'stock' ? 'Ordering takes it out of stock at once; cancelling puts it back.' : 'The vendor packs and ships it from their portal; once delivered we owe them what they get, paid in their next payout. Vendors usually edit their own products; a change here applies at once.'}</p>
            </section>
          </aside>
        </div>
      </div>
      {share ? <ShareSheet open onClose={() => setShare(false)} title={cur.name} subject={`${cur.name} · Grid Shop`} link={link} autoText={autoShareText(cur, link)} savedText={cur.share && cur.share.text ? cur.share.text : ''} eligible={(id) => canUse('shop', id).ok} onSaveText={(t) => saveShareText(cur.id, t)} /> : null}
    </AdminShell>
  );
}
