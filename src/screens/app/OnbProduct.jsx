'use client';
// Merchant app · First product (/onb-product, after the shop is created; optional): name, price, how many you have now
// and a photo. Saved like the app's quick add (products.saveProduct, an 'opening' stock move at the shop's main place,
// locations.onlinePlace()). New products start as Draft unless "Ready to sell" is on (AGENTS.md). Later / Save → /onb-done.

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button, Field, TextInput, Stepper, Switch, Icon, Note, toast, refresh } from './kit/AppKit';
import { OnbScreen, OnbTitle } from './onb/OnbKit';
import { getOnboarding, noteFirstProduct } from '@/lib/shopOnboarding';
import { saveProduct, newProductId } from '@/lib/products';
import { addMove } from '@/lib/stock';
import { onlinePlace } from '@/lib/locations';
import { photoFromFile, me, safe } from './stock/stockData';

export default function OnbProductScreen() {
  const router = useRouter();
  const fileRef = useRef(null);
  const [rec, setRec] = useState(null);
  const [ready, setReady] = useState(false);
  const [f, setF] = useState({ name: '', price: '', qty: 1, photo: '', active: false });
  const [err, setErr] = useState({});
  useEffect(() => { setRec(getOnboarding()); setReady(true); }, []);
  const up = (p) => setF((x) => ({ ...x, ...p }));

  const pick = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    try { up({ photo: await photoFromFile(file) }); } catch (x) { toast(x.message || 'Could not use that photo', { tone: 'error' }); }
  };
  const save = () => {
    const price = Number(String(f.price).replace(/[^\d.]/g, ''));
    const e = {};
    if (!f.name.trim()) e.name = 'Give the product a name.';
    if (!(price > 0)) e.price = 'Enter the selling price.';
    setErr(e);
    if (Object.keys(e).length) return;
    const by = me();
    const p = saveProduct({ id: newProductId(), name: f.name.trim(), sku: '', price, st: f.active ? 'active' : 'draft', sell: 'retail', inv: 0, loc: 0,
      flags: f.photo ? [] : ['No photo'], media: f.photo ? [{ id: 'm' + Date.now(), src: f.photo, kind: 'image', name: 'photo.jpg', alt: f.name.trim() }] : [] }, { note: 'Added at sign-up', by });
    const qty = Number(f.qty) || 0;
    const place = safe(() => onlinePlace(), 'Central Warehouse');
    if (qty > 0) addMove({ sku: p.sku || p.id, place, qty, kind: 'opening', reason: 'Opening stock', by, ref: p.id, op: p.id + ':opening:' + place + ':' + (p.version || 0) });
    noteFirstProduct(p);
    refresh();
    toast(`${p.name} added`);
    router.push('/onb-done');
  };

  return (
    <OnbScreen name="OnbProduct" title="First product" label="First product · optional" back="/onb-done"
      actions={<><Button kind="line" href="/onb-done">Later</Button><Button style={{ flex: 2 }} onClick={save} disabled={!rec}>Save product</Button></>}>
      <OnbTitle title="Add your first product" sub="Just the basics. You can add details and more products any time." />
      {ready && !rec ? (
        <Note tone="warn" icon="alert" style={{ marginTop: '20px' }}>
          <div>Create your shop first.</div>
          <a href="/onb-phone" style={{ display: 'inline-block', marginTop: '6px', fontWeight: 'var(--weight-medium)', color: 'var(--brand)' }}>Start sign-up</a>
        </Note>
      ) : null}
      <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start', marginTop: '20px' }}>
        <button type="button" onClick={() => fileRef.current && fileRef.current.click()} aria-label={f.photo ? 'Change the photo' : 'Add a photo'}
          style={{ flex: 'none', width: '84px', height: '84px', padding: 0, border: f.photo ? 0 : '1.5px dashed #cbd5e1', borderRadius: 'var(--radius-xl)', background: 'var(--card)', overflow: 'hidden', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '4px', color: 'var(--brand)' }}>
          {f.photo ? <img src={f.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <><Icon name="plus" size={22} /><span style={{ fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>Photo</span></>}
        </button>
        <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={pick} />
        <div style={{ flex: 1, minWidth: 0 }}>
          <Field label="Product name" error={err.name}>
            <TextInput value={f.name} onChange={(v) => { up({ name: v }); setErr((x) => ({ ...x, name: '' })); }} placeholder="Cotton shirt" name="pname" />
          </Field>
        </div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px', marginTop: '14px' }}>
        <Field label="Selling price" error={err.price}>
          <TextInput value={f.price} onChange={(v) => { up({ price: v }); setErr((x) => ({ ...x, price: '' })); }} placeholder="1250" inputMode="decimal" prefix="৳" name="price" />
        </Field>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span><span className="lab" style={{ display: 'block' }}>In stock now</span><span className="help">How many you have to sell</span></span>
          <Stepper value={f.qty} onChange={(n) => up({ qty: n })} min={0} label="In stock now" />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px' }}>
          <span><span className="lab" style={{ display: 'block' }}>Ready to sell</span><span className="help">{f.active ? 'Customers can buy it now' : 'Saved as a draft'}</span></span>
          <Switch on={f.active} onChange={(on) => up({ active: on })} label="Ready to sell" />
        </div>
      </div>
    </OnbScreen>
  );
}
