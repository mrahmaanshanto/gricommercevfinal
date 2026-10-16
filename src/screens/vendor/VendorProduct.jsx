'use client';
// Vendor portal › a product (/vendor-product?id=; no id = new; Batch E): name, category, unit, short pitch, what it is,
// pictures (uploaded or from the library), the vendor's price, bulk prices and the minimum, stock (or made to order) and
// days to deliver. "Stores will pay ৳x; you get ৳y" follows the price live (gridShop.priceFor with today's rules).
// New, draft and rejected products: Save draft / Send for approval. An approved product: stock saves at once; a change to
// anything else waits for GridCommerce (shown old → new until approved, or withdrawn). Data: lib/platform/gridShop.js.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { EmptyState } from '@/components/ui';
import { productById, saveVendorProduct, submitForReview, setVendorProductStatus, withdrawChange, priceFor, reviewOf, GS_CATS } from '@/lib/platform/gridShop';
import { navigate } from '@/runtime/routes';
import { PicturePicker, MEDIA_CSS } from '../admin/services/SvcMedia';
import { VendorFrame, useVendor, ProductBadge, tk, qp, dTime } from './vendorShared';

const lines = (x) => String(x || '').split('\n').map((y) => y.trim()).filter(Boolean);
const FIELD_NAMES = { name: 'Name', cat: 'Category', icon: 'Icon', blurb: 'Short pitch', details: 'What it is', unit: 'Sold as', price: 'Price', tiers: 'Bulk prices', moq: 'Least a store can buy', days: 'Days to deliver', cover: 'Cover picture', gallery: 'Gallery', madeToOrder: 'Made to order' };
const show = (k, x) => (k === 'price' ? tk(x) : k === 'tiers' ? (x || []).map((t) => `${tk(t.price)} from ${t.qty}`).join(', ') || 'none' : k === 'details' ? (x || []).join(' · ') : k === 'cover' || k === 'gallery' ? 'new pictures' : typeof x === 'boolean' ? (x ? 'yes' : 'no') : String(x));

/** The cover (the card's picture) and up to 6 more pictures, uploaded or picked from the library. */
function Pictures({ f, set }) {
  const [pick, setPick] = useState(null);   // 'cover' | 'gallery'
  const gallery = f.gallery || [];
  return (
    <section className="ix-card vd-pad" aria-labelledby="vp-pics">
      <h2 id="vp-pics">Pictures</h2>
      <div className="vd-row" style={{ alignItems: 'flex-start' }}>
        <span className={'smd-cover__img' + (f.cover ? '' : ' is-tile')} style={f.cover ? { backgroundImage: `url(${f.cover})`, width: 200 } : { width: 200 }} role="img" aria-label={f.cover ? 'Main picture' : 'No picture yet'}>{f.cover ? null : <Icon name="image" width="28" height="28" aria-hidden="true" />}</span>
        <span className="smd-acts" style={{ flexDirection: 'column', alignItems: 'flex-start' }}>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick('cover')}><Icon name="image" width="14" height="14" aria-hidden="true" />{f.cover ? 'Change main picture' : 'Add main picture'}</button>
          {f.cover ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ cover: '' })}>Remove</button> : null}
          <span className="vd-sub">Stores see it on the product card. A square or 4:3 photo on a plain background works best.</span>
        </span>
      </div>
      {gallery.length ? <ul className="smd-gal">{gallery.map((g, i) => (
        <li key={i}><span className="smd-thumb" style={{ backgroundImage: `url(${g.src})` }} role="img" aria-label={'Picture ' + (i + 1)} /><span className="smd-tools"><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove picture ' + (i + 1)} onClick={() => set({ gallery: gallery.filter((_, j) => j !== i) })}><Icon name="trash-2" width="14" height="14" /></button></span></li>
      ))}</ul> : null}
      {gallery.length < 6 ? <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick('gallery')}><Icon name="plus" width="14" height="14" aria-hidden="true" />More pictures ({gallery.length} of 6)</button></div> : null}
      <PicturePicker open={!!pick} title={pick === 'cover' ? 'Main picture' : 'Add a picture'} onPick={({ src }) => { if (pick === 'cover') set({ cover: src }); else set({ gallery: [...gallery, { src, caption: '' }] }); setPick(null); }} onClose={() => setPick(null)} />
    </section>
  );
}

function Body({ v }) {
  const { tick } = useVendor();
  const [f, setF] = useState(null);
  const [err, setErr] = useState({});
  const id = (f && f.id) || qp('id');
  const cur = id ? productById(id) : null;
  useEffect(() => {
    if (f && (f.id || !id)) return;
    if (id && !cur) { setF(false); return; }
    setF(cur ? { ...JSON.parse(JSON.stringify(cur)), ...JSON.parse(JSON.stringify((cur.pendingChange && cur.pendingChange.fields) || {})), changeNote: '' }
      : { id: '', name: '', cat: 'pos', icon: 'package', unit: 'piece', blurb: '', details: [], price: '', tiers: [], moq: 1, days: v.days || 3, stock: 0, madeToOrder: false, cover: '', gallery: [] });
  }, [id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const preview = useMemo(() => {
    if (!f) return [];
    const draft = { ...f, id: f.id || 'new', vendorId: v.id, supplierId: v.id, fulfil: 'supplier', price: Math.round(Number(String(f.price).replace(/[^0-9.]/g, '')) || 0), tiers: (f.tiers || []).map((t) => ({ qty: Number(t.qty) || 0, price: Number(t.price) || 0 })).filter((t) => t.qty > 1 && t.price > 0) };
    if (!draft.price) return [];
    return [1, ...draft.tiers.map((t) => t.qty)].map((q) => priceFor(draft, '', q));
  }, [f, v.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  if (f === null) return <div style={{ minHeight: 400 }} aria-busy="true" />;
  if (f === false || (cur && cur.vendorId !== v.id)) return (<><RecordHeader back="/vendor-products" backLabel="Products" title="Product not found" /><section className="ix-card ix-empty"><EmptyState icon="package-x" title="This product is not here" actionLabel="Your products" onAction={() => navigate('/vendor-products')} /></section></>);
  const set = (patch) => setF((x) => ({ ...x, ...patch }));
  const st = cur ? reviewOf(cur) : 'new';
  const isLive = st === 'live';
  const save = (submit) => {
    const r = saveVendorProduct(v.id, f, { submit, by: v.contact });
    if (!r.ok) { setErr(r.field ? { [r.field]: r.error } : {}); toast(r.error, { tone: 'error' }); return; }
    setErr({});
    toast(isLive ? (r.waiting ? 'Saved. The change waits for GridCommerce; stock is updated.' : 'Stock saved') : submit ? 'Sent for approval' : 'Draft saved');
    if (!f.id) { setF({ ...JSON.parse(JSON.stringify(r.product)), changeNote: '' }); navigate('/vendor-product?id=' + r.product.id); }
  };
  const E = (k) => (err[k] ? <p className="gc-help gc-help--error" role="alert">{err[k]}</p> : null);
  const b = preview[0];
  const changes = cur && cur.pendingChange ? Object.entries(cur.pendingChange.fields) : [];
  return (<>
    <RecordHeader back="/vendor-products" backLabel="Products" title={cur ? cur.name : 'New product'} badges={cur ? <ProductBadge p={cur} /> : null}
      meta={cur && cur.review && cur.review.at ? `${st === 'pending' ? 'Sent' : st === 'live' ? 'Approved' : st === 'rejected' ? 'Rejected' : 'Saved'} ${dTime(cur.review.at)}` : 'Approved by GridCommerce first'}
      secondary={[
        !isLive ? { label: 'Save draft', onClick: () => save(false) } : null,
        isLive ? { label: cur.status === 'live' ? 'Pause sales' : 'Put on sale', onClick: () => { const r = setVendorProductStatus(v.id, cur.id, cur.status === 'live' ? 'paused' : 'live'); if (r.ok === false) toast(r.error, { tone: 'error' }); else toast(cur.status === 'live' ? 'Paused: stores no longer see it' : 'On sale again'); } } : null,
      ].filter(Boolean)}
      more={cur && cur.pendingChange ? [{ label: 'Withdraw the change', onClick: () => { withdrawChange(v.id, cur.id); setF(null); toast('Change withdrawn'); } }] : []}
      primary={isLive ? { label: 'Save', icon: 'check', onClick: () => save(false) } : st === 'pending' ? { label: 'Save', icon: 'check', onClick: () => save(false) } : { label: 'Send for approval', icon: 'send', onClick: () => save(true) }} />
    {st === 'rejected' ? <p className="vd-note vd-note--bad"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><span>GridCommerce did not approve it: {cur.review.reason}. Fix it and send it again.</span></p> : null}
    {st === 'pending' ? <p className="vd-note"><Icon name="hourglass" width="16" height="16" aria-hidden="true" />Waiting for GridCommerce. You can still change it; stores see it once it is approved.</p> : null}
    {isLive ? <p className="vd-note"><Icon name="info" width="16" height="16" aria-hidden="true" />On Grid Shop now. Stock saves at once; changes to price, text or pictures wait for GridCommerce to approve them.</p> : null}
    {changes.length ? (
      <section className="ix-card vd-pad" aria-labelledby="vp-ch">
        <h2 id="vp-ch">Change waiting for approval</h2>
        <div className="vd-break">{changes.map(([k, x]) => <div key={k}><span>{FIELD_NAMES[k] || k}</span><span>{show(k, cur[k])} → {show(k, x)}</span></div>)}</div>
        <span className="vd-sub">Sent {dTime(cur.pendingChange.at)}{cur.pendingChange.note ? ' · ' + cur.pendingChange.note : ''}</span>
      </section>
    ) : null}
    {cur && cur.lastChange && cur.lastChange.rejectedAt && !cur.pendingChange ? <p className="vd-note vd-note--warn"><Icon name="circle-x" width="16" height="16" aria-hidden="true" /><span>Your last change was not approved: {cur.lastChange.reason}.</span></p> : null}
    <div className="ix-record">
      <div className="ix-main">
        <section className="ix-card vd-pad" aria-labelledby="vp-b">
          <h2 id="vp-b">Product</h2>
          <div><label className="gc-label" htmlFor="vp-n">Name</label><input id="vp-n" className="gc-input" value={f.name} onChange={(e) => set({ name: e.target.value })} placeholder="Thermal receipt printer 80 mm" />{E('name')}</div>
          <div className="vd-grid2">
            <div><label className="gc-label" htmlFor="vp-c">Category</label><select id="vp-c" className="gc-input gc-select" value={f.cat} onChange={(e) => set({ cat: e.target.value })}>{GS_CATS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>{E('cat')}</div>
            <div><label className="gc-label" htmlFor="vp-u">Sold as</label><input id="vp-u" className="gc-input" value={f.unit} onChange={(e) => set({ unit: e.target.value })} placeholder="piece, pack of 100" /></div>
          </div>
          <div><label className="gc-label" htmlFor="vp-bl">Short pitch</label><input id="vp-bl" className="gc-input" value={f.blurb} onChange={(e) => set({ blurb: e.target.value })} placeholder="What it does for a shop, in one line" />{E('blurb')}</div>
          <div><label className="gc-label" htmlFor="vp-d">What it is (one per line)</label><textarea id="vp-d" className="gc-input" rows={4} key={'d' + (f.id || 'new')} defaultValue={(f.details || []).join('\n')} onChange={(e) => set({ details: lines(e.target.value) })} placeholder={'80 mm thermal\nUSB and Wi-Fi\n1-year warranty'} /></div>
        </section>
        <section className="ix-card vd-pad" aria-labelledby="vp-pr">
          <h2 id="vp-pr">Price</h2>
          <div className="vd-grid2">
            <div><label className="gc-label" htmlFor="vp-p">{v.model === 'markup' ? 'What you get a unit (৳, before VAT)' : 'Your price to stores (৳, before VAT)'}</label><input id="vp-p" className="gc-input" inputMode="numeric" value={f.price} onChange={(e) => set({ price: e.target.value })} />{E('price')}</div>
            <div><label className="gc-label" htmlFor="vp-m">Least a store can buy</label><input id="vp-m" className="gc-input" inputMode="numeric" value={f.moq} onChange={(e) => set({ moq: e.target.value })} /></div>
          </div>
          <span className="gc-label">Bulk prices</span>
          {(f.tiers || []).map((t, i) => (
            <div key={i} className="vd-row" style={{ flexWrap: 'nowrap' }}>
              <span className="ix-muted">From</span><input className="gc-input" style={{ maxWidth: 90 }} inputMode="numeric" aria-label={'Bulk price ' + (i + 1) + ' quantity'} value={t.qty} onChange={(e) => set({ tiers: f.tiers.map((x, j) => (j === i ? { ...x, qty: e.target.value } : x)) })} />
              <span className="ix-muted">each</span><input className="gc-input" style={{ maxWidth: 120 }} inputMode="numeric" aria-label={'Bulk price ' + (i + 1)} value={t.price} onChange={(e) => set({ tiers: f.tiers.map((x, j) => (j === i ? { ...x, price: e.target.value } : x)) })} />
              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove bulk price" onClick={() => set({ tiers: f.tiers.filter((_, j) => j !== i) })}><Icon name="x" width="14" height="14" /></button>
            </div>
          ))}
          {(f.tiers || []).length < 3 ? <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ tiers: [...(f.tiers || []), { qty: '', price: '' }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add bulk price</button></div> : null}
          {isLive ? <div><label className="gc-label" htmlFor="vp-why">Why the change (for GridCommerce, optional)</label><input id="vp-why" className="gc-input" value={f.changeNote || ''} onChange={(e) => set({ changeNote: e.target.value })} placeholder="e.g. The new shipment cost more" /></div> : null}
        </section>
        <Pictures f={f} set={set} />
      </div>
      <aside className="ix-side" aria-label="Stock and what you get">
        <section className="ix-card vd-pad" aria-labelledby="vp-get">
          <h2 id="vp-get">What you get</h2>
          {b ? (<>
            <div className="vd-break" aria-live="polite">
              <div><span>Stores will pay</span><span>{tk(b.storeUnitNet)}{b.discount ? ` (${b.discountPct}% off ${tk(b.storeUnit)})` : ''}</span></div>
              {b.model === 'markup' ? <div><span>Our markup</span><span>{tk(b.markup)}</span></div> : <div><span>Our commission</span><span>−{tk(b.commission)}</span></div>}
              {b.vendorFunded ? <div><span>Discount you pay</span><span>−{tk(b.vendorFunded)}</span></div> : null}
              <div className="is-total"><span>You get a unit</span><span>{tk(b.vendorGets)}</span></div>
            </div>
            {preview.slice(1).map((x) => <span key={x.qty} className="vd-sub">From {x.qty}: stores pay {tk(x.storeUnitNet)}, you get {tk(x.vendorGets)}</span>)}
            <span className="vd-sub">Today’s rates. Your fee per parcel ({tk(v.feePerOrder)}) comes off each delivered parcel; VAT is added for the store.</span>
          </>) : <p className="gc-help" style={{ margin: 0 }}>Enter your price to see what stores pay and what you get.</p>}
        </section>
        <section className="ix-card vd-pad" aria-labelledby="vp-st">
          <h2 id="vp-st">Stock and delivery</h2>
          <label className="gc-label" style={{ display: 'flex', alignItems: 'center', gap: 8 }}><input type="checkbox" className="gc-check" checked={!!f.madeToOrder} onChange={(e) => set({ madeToOrder: e.target.checked })} />Made to order (no stock count)</label>
          {f.madeToOrder ? null : <div><label className="gc-label" htmlFor="vp-s">In stock</label><input id="vp-s" className="gc-input" inputMode="numeric" value={f.stock} onChange={(e) => set({ stock: e.target.value.replace(/[^0-9]/g, '') })} /></div>}
          <div><label className="gc-label" htmlFor="vp-dy">Days to reach the store</label><input id="vp-dy" className="gc-input" inputMode="numeric" value={f.days} onChange={(e) => set({ days: e.target.value })} /></div>
          {cur && st === 'draft' ? <button type="button" className="ix-btn" onClick={() => { const r = submitForReview(v.id, cur.id); if (r.ok === false) toast(r.error, { tone: 'error' }); else toast('Sent for approval'); }}>Send the saved draft</button> : null}
        </section>
      </aside>
    </div>
  </>);
}

export default function VendorProduct() {
  return <VendorFrame active="products" screen="VendorProduct" css={MEDIA_CSS}>{(v) => <Body v={v} />}</VendorFrame>;
}
