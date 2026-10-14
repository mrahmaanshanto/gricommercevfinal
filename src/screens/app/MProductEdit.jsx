'use client';
// Merchant app · Product quick edit (/m-product-edit?sku= | ?id=; no query = quick add). The board's layout
// (design/templates/app/MProductEdit.dc.html) with live data. Quick changes only; the full product builder stays on the
// web ("Edit everything on the web" → /add-product?id=).
//   photo      tap the square: the camera or the gallery; the first photo of the product (products.js media), 480px
//   price      selling price and MRP; the help line shows the buying price (productCost) and the profit per piece
//   barcode    type, scan (camera) or make an in-store EAN-13 (starts with 2, barcodeType 'internal', like Add product);
//              a barcode another product uses is refused (products.codeOwner)
//   stock      on hand per place with steppers (the Online edition's one place). A change is a stock adjustment
//              (stockAdjustments.addAdjustment, reason Count correction): a decrease or more than 20 pieces needs a
//              manager's PIN, like Stock adjustments on the web. Variants: chips pick the variant.
//   status     Active switch (off = Draft); Archive in the ⋯ menu
// Quick add: name, price, barcode, photo and opening stock (an 'opening' stock move per place); new products start as
// Draft (AGENTS.md). Saving keeps a product version (products.saveProduct).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppScreen, Content, AppBar, ActionBar, Button, IconButton, Field, TextInput, Stepper, Switch, Chips, Sheet, ListRow, Pill, Note, EmptyState, Skeleton, Icon, useAppData, useQuery, money, toast, refresh } from './kit/AppKit';
import { saveProduct, newProductId, codeOwner, findProduct } from '@/lib/products';
import { getCatalog, stockAt, addMove } from '@/lib/stock';
import { addAdjustment, needsApproval } from '@/lib/stockAdjustments';
import { resolveScan } from '@/lib/identifiers';
import { Thumb, ScanSheet, PinSheet } from './stock/Scanner';
import { placeList, costOf, me, photoFromFile, allowed, safe, onePlace } from './stock/stockData';
import { seesCost } from './kit/appScope';

function inStoreCode() {
  let b = '2';
  for (let i = 0; i < 11; i += 1) b += Math.floor(Math.random() * 10);
  let sum = 0;
  for (let j = 0; j < 12; j += 1) sum += Number(b[11 - j]) * (j % 2 === 0 ? 3 : 1);
  return b + ((10 - (sum % 10)) % 10);
}
const num = (v) => (v === '' || v == null || Number.isNaN(Number(v)) ? null : Number(v));

/** What the screen edits: the product, its catalogue rows (one per variant) and the row in view. */
function load(q) {
  const sku = q.get('sku'), id = q.get('id');
  const rows = safe(() => getCatalog(), []);
  const row = sku ? rows.find((r) => r.sku === sku) : null;
  const product = safe(() => findProduct({ id: id || (row && row.productId), sku: sku || '' }), null);
  if (!product && !row) return null;
  const pid = product ? product.id : '';
  const mine = rows.filter((r) => (pid && r.productId === pid) || (row && r.sku === row.sku));
  return { product, rows: mine.length ? mine : row ? [row] : [], sku: (row && row.sku) || (mine[0] && mine[0].sku) || '' };
}

export default function MProductEditScreen() {
  const router = useRouter();
  const q = useQuery();
  const { ready, ctx } = useAppData();
  const [data, setData] = useState(undefined);       // undefined = loading, null = not found
  const [sku, setSku] = useState('');
  const [form, setForm] = useState(null);           // { name, price, mrp, barcode, barcodeType, st, photo }
  const [counts, setCounts] = useState({});         // sku → { place: on hand typed }
  const [scan, setScan] = useState(false);
  const [more, setMore] = useState(false);
  const [pin, setPin] = useState(null);
  const [err, setErr] = useState({});
  const fileRef = useRef(null);
  const places = useMemo(() => (ready ? placeList() : []), [ready]);
  const adding = !!q && !q.get('sku') && !q.get('id');   // ?barcode= prefills the barcode (MScan › Add product)

  useEffect(() => {
    if (!ready || !q) return;
    if (adding) {
      setData({ product: null, rows: [] });
      setForm({ name: '', price: '', mrp: '', barcode: (q.get('barcode') || '').trim(), barcodeType: '', st: 'draft', photo: '' });
      setCounts({ new: Object.fromEntries(places.map((p) => [p, 0])) });
      return;
    }
    const d = load(q);
    setData(d);
    if (!d) return;
    setSku(d.sku);
    const p = d.product || {};
    const row = d.rows.find((r) => r.sku === d.sku) || d.rows[0] || {};
    const v = (p.variants || []).find((x) => x.sku && x.sku === row.sku);
    const media = (p.media || []).filter((m) => m && m.src);
    setForm({ name: p.name || row.name || '', price: String((v ? v.price : p.price) ?? row.price ?? ''), mrp: String((v ? v.mrp : p.mrp) ?? ''), barcode: (v ? v.barcode : p.barcode) || row.barcode || '', barcodeType: p.barcodeType || '', st: p.st || row.st || 'active', photo: media.length ? media[0].src : '' });
    const c = {};
    d.rows.forEach((r) => { c[r.sku] = Object.fromEntries(places.map((pl) => [pl, safe(() => stockAt(r.sku, pl).onHand, 0)])); });
    setCounts(c);
  }, [ready, q, places]); // eslint-disable-line react-hooks/exhaustive-deps

  const set = (patch) => { setForm((f) => ({ ...f, ...patch })); setErr({}); };
  const row = data && data.rows ? data.rows.find((r) => r.sku === sku) || data.rows[0] : null;
  const counted = !row || !(row.format === 'digital' || row.format === 'service' || row.format === 'licence' || (row.bundle && row.bundle.type !== 'kit'));
  const key = adding ? 'new' : sku;
  const before = useMemo(() => {
    if (!data || adding) return {};
    const c = {};
    data.rows.forEach((r) => { c[r.sku] = Object.fromEntries(places.map((pl) => [pl, safe(() => stockAt(r.sku, pl).onHand, 0)])); });
    return c;
  }, [data, places, adding]);
  const mineNow = counts[key] || {};
  const total = Object.values(mineNow).reduce((a, n) => a + (Number(n) || 0), 0);
  // the buying price only for people who may see costs (kit/appScope.js › seesCost)
  const cost = row && ctx && seesCost(ctx.user) ? costOf(row) : 0;
  const price = num(form && form.price);
  const canEditStock = ctx && (ctx.ids.has('stock-adjust') || ctx.ids.has('stock-count') || ctx.ids.has('products-add') || ctx.ids.has('stock-list'));
  const webHref = data && data.product && !String(data.product.id).startsWith('cat-') ? '/add-product?id=' + encodeURIComponent(data.product.id) : row ? '/add-product?sku=' + encodeURIComponent(row.sku) : '/add-product';

  const pickPhoto = async (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    try { set({ photo: await photoFromFile(f) }); } catch (x) { toast(x.message || 'Could not use that photo', { tone: 'error' }); }
  };
  const onScan = (code) => {
    setScan(false);
    const hit = safe(() => resolveScan(code), null);
    if (hit && (!row || hit.sku !== row.sku)) { toast(`That code belongs to ${hit.row ? hit.row.name : hit.sku}`, { tone: 'error' }); return; }
    set({ barcode: code, barcodeType: '' });
  };
  const makeCode = () => {
    let b, i = 0;
    do { b = inStoreCode(); i += 1; } while (safe(() => codeOwner('barcode', b, data && data.product ? data.product.id : ''), null) && i < 50);
    set({ barcode: b, barcodeType: 'internal' });
    toast('New in-store barcode made');
  };

  // stock changes as adjustments: [{ sku, place, qty }]
  const diffs = () => {
    const out = [];
    Object.keys(counts).forEach((s) => Object.keys(counts[s] || {}).forEach((pl) => {
      const d = (Number(counts[s][pl]) || 0) - (((before[s] || {})[pl]) || 0);
      if (d) out.push({ sku: s, place: pl, qty: d });
    }));
    return out;
  };

  const save = (approver) => {
    if (!form) return;
    const e = {};
    if (!form.name.trim()) e.name = 'Give the product a name.';
    if (!(price > 0)) e.price = 'Enter the selling price.';
    if (num(form.mrp) != null && num(form.mrp) > 0 && price > num(form.mrp)) e.mrp = 'MRP is the most it can sell for: at least the price.';
    const owner = form.barcode.trim() ? safe(() => codeOwner('barcode', form.barcode.trim(), data && data.product ? data.product.id : ''), null) : null;
    if (owner && !(row && row.barcode === form.barcode.trim())) e.barcode = `${owner.name} already uses this barcode.`;
    if (Object.keys(e).length) { setErr(e); toast(Object.values(e)[0], { tone: 'error' }); return; }
    const by = me();

    if (adding) {
      const rec = saveProduct({ id: newProductId(), name: form.name.trim(), sku: '', barcode: form.barcode.trim(), barcodeType: form.barcode.trim() ? (form.barcodeType || (/^2\d{12}$/.test(form.barcode.trim()) ? 'internal' : 'gtin')) : '', price, mrp: num(form.mrp), st: form.st, sell: 'retail', inv: 0, loc: 0, flags: form.photo ? [] : ['No photo'], media: form.photo ? [{ id: 'm' + Date.now(), src: form.photo, kind: 'image', name: 'photo.jpg', alt: form.name.trim() }] : [] }, { note: 'Added in the app', by });
      Object.entries(counts.new || {}).forEach(([pl, n]) => { if (Number(n) > 0) addMove({ sku: rec.sku || rec.id, place: pl, qty: Number(n), kind: 'opening', reason: 'Opening stock', by, ref: rec.id, op: rec.id + ':opening:' + pl + ':' + (rec.version || 0) }); });
      refresh();
      toast(`${rec.name} added as ${rec.st === 'active' ? 'active' : 'a draft'}`);
      router.push('/m-product-edit?id=' + encodeURIComponent(rec.id));
      return;
    }

    const changes = canEditStock && counted ? diffs() : [];
    const who = typeof approver === 'string' ? approver : '';
    if (changes.some((c) => needsApproval(c.qty)) && !who) {
      const n = changes.reduce((a, c) => a + Math.abs(c.qty), 0);
      setPin({ reason: `Change on hand by ${n} piece${n === 1 ? '' : 's'} (${changes.map((c) => `${c.place} ${c.qty > 0 ? '+' : '−'}${Math.abs(c.qty)}`).join(', ')}).`, amount: n });
      return;
    }
    setPin(null);
    // the product: a variant keeps its own price and barcode; otherwise the product's
    const p = data.product ? { ...data.product } : null;
    if (p) {
      const vi = (p.variants || []).findIndex((x) => x.sku && row && x.sku === row.sku);
      const bt = form.barcode.trim() ? (form.barcodeType || (/^2\d{12}$/.test(form.barcode.trim()) ? 'internal' : 'gtin')) : '';
      if (vi >= 0) {
        p.variants = p.variants.map((x, i) => (i === vi ? { ...x, price, mrp: num(form.mrp), barcode: form.barcode.trim(), barcodeType: bt } : x));
      } else { p.price = price; p.mrp = num(form.mrp); p.barcode = form.barcode.trim(); p.barcodeType = bt; }
      p.st = form.st;
      const media = (p.media || []).filter((m) => m && m.src);
      if (form.photo && (!media.length || media[0].src !== form.photo)) p.media = [{ id: 'm' + Date.now(), src: form.photo, kind: 'image', name: 'photo.jpg', alt: p.name }, ...media];
      if (form.photo) p.flags = (p.flags || []).filter((f) => f !== 'No photo');
      saveProduct(p, { note: 'Quick edit in the app', by });
    }
    changes.forEach((c) => { addAdjustment({ sku: c.sku, place: c.place, qty: c.qty, reason: 'Count correction', note: 'Quick edit in the app', by }, who || 'Auto'); });
    refresh();
    toast(changes.length ? `Saved · stock changed at ${[...new Set(changes.map((c) => c.place))].join(', ')}` : 'Saved');
    router.push('/m-products');
  };

  const archive = () => { setMore(false); set({ st: form.st === 'archived' ? 'active' : 'archived' }); toast(form.st === 'archived' ? 'Back to active. Save to keep it.' : 'Archived. Save to keep it.'); };
  const title = adding ? 'Add product' : 'Edit product';

  if (data === null) {
    return (
      <AppScreen name="MProductEdit" title={title}>
        <AppBar title={title} back="/m-products" />
        <Content top={103}><div className="card" style={{ margin: '4px 20px 0' }}><EmptyState icon="box" title="This product is not in your catalogue" action={{ label: 'All products', href: '/m-products' }} /></div></Content>
      </AppScreen>
    );
  }

  return (
    <AppScreen name="MProductEdit" title={title}>
      <AppBar title={title} back="/m-products" actions={<IconButton icon="dots" label="More" onClick={() => setMore(true)} />} />
      <Content top={103} bottom={98} style={{ padding: '4px 20px 0' }} gap={16}>
        {!form ? <Skeleton rows={4} card={false} /> : (
          <>
            <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
              <button type="button" onClick={() => fileRef.current && fileRef.current.click()} aria-label={form.photo ? 'Change the photo' : 'Add a photo'} style={{ position: 'relative', padding: 0, border: 0, background: 'none', cursor: 'pointer', flex: 'none' }}>
                {form.photo ? <span className="av" style={{ width: '84px', height: '84px', overflow: 'hidden' }}><img src={form.photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /></span>
                  : row ? <Thumb row={row} size={84} /> : <span className="av" style={{ width: '84px', height: '84px', background: 'var(--soft)', color: 'var(--brand)' }}><Icon name="plus" size={28} /></span>}
                <span className="ib soft" style={{ position: 'absolute', right: '-6px', bottom: '-6px', width: '30px', height: '30px', color: 'var(--brand)' }} aria-hidden="true"><Icon name="edit" size={15} /></span>
              </button>
              <input ref={fileRef} type="file" accept="image/*" capture="environment" onChange={pickPhoto} style={{ display: 'none' }} />
              <div style={{ minWidth: '0', flex: 1 }}>
                {adding ? <Field label="Name" error={err.name}><TextInput value={form.name} onChange={(v) => set({ name: v })} placeholder="e.g. Anker 20W USB-C Charger" /></Field> : (
                  <>
                    <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', lineHeight: '22px' }}>{form.name}</div>
                    <div className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)', marginTop: '4px' }}>{form.barcode || (row && row.sku)}</div>
                    {form.st !== 'active' ? <div style={{ marginTop: '6px' }}><Pill tone={form.st === 'archived' ? 'err' : 'grey'}>{form.st === 'archived' ? 'Archived' : 'Draft'}</Pill></div> : null}
                  </>
                )}
              </div>
            </div>

            {data && data.rows.length > 1 ? (
              <Chips items={data.rows.map((r) => ({ key: r.sku, label: r.variant || r.name.split(' · ').slice(-1)[0] }))} value={sku} onChange={(s) => {
                setSku(s);
                const r = data.rows.find((x) => x.sku === s) || {};
                const v = ((data.product || {}).variants || []).find((x) => x.sku === s) || {};
                set({ price: String(v.price ?? r.price ?? ''), mrp: String(v.mrp ?? ''), barcode: v.barcode || r.barcode || '' });
              }} style={{ padding: 0, overflowX: 'auto' }} />
            ) : null}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
              <Field label="Price" error={err.price}><TextInput value={form.price} onChange={(v) => set({ price: v.replace(/[^\d.]/g, '') })} prefix="৳" inputMode="decimal" /></Field>
              <Field label="MRP" error={err.mrp}><TextInput value={form.mrp === 'null' ? '' : form.mrp} onChange={(v) => set({ mrp: v.replace(/[^\d.]/g, '') })} prefix="৳" inputMode="decimal" placeholder="Optional" /></Field>
            </div>
            {cost && price ? <span className="help" style={{ marginTop: '-8px' }}>Bought at {money(cost)} · profit {money(price - cost)} per piece</span> : null}

            <Field label="Barcode" error={err.barcode}>
              <span style={{ display: 'flex', gap: '8px' }}>
                <span style={{ flex: 1, minWidth: 0 }}><TextInput value={form.barcode} onChange={(v) => set({ barcode: v.trim(), barcodeType: '' })} placeholder="Scan or type" inputMode="numeric" /></span>
                <IconButton icon="scan" label="Scan the barcode" soft onClick={() => setScan(true)} />
              </span>
            </Field>
            {!form.barcode ? <button type="button" className="tap" onClick={makeCode} style={{ marginTop: '-8px', alignSelf: 'flex-start', border: 0, background: 'none', padding: 0, color: 'var(--brand)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}>No barcode? Make one</button> : null}

            {counted && (adding || canEditStock) ? (
              <div className="field">
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                  <span className="lab">{adding ? 'Opening stock' : onePlace() ? 'Stock' : 'Stock by place'}</span>
                  <span className="help num">{total} total</span>
                </div>
                <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
                  {places.map((pl) => (
                    <div key={pl} className="row" style={{ minHeight: '58px' }}>
                      <span className="m"><span className="t" style={{ fontWeight: 'var(--weight-medium)' }}>{pl}</span>
                        {!adding && row ? (() => { const s = safe(() => stockAt(row.sku, pl), null); return s && (s.held || s.transit) ? <span className="s" style={{ display: 'block' }}>{[s.held ? `${s.held} held` : '', s.transit ? `${s.transit} on the way` : ''].filter(Boolean).join(' · ')}</span> : null; })() : null}
                      </span>
                      <Stepper value={mineNow[pl] || 0} min={0} label={'On hand at ' + pl} onChange={(n) => setCounts((c) => ({ ...c, [key]: { ...(c[key] || {}), [pl]: n } }))} />
                    </div>
                  ))}
                </div>
                {!adding ? <span className="help">A change is saved as a stock adjustment. Taking stock off needs a manager.</span> : null}
              </div>
            ) : !counted ? <Note tone="info" icon="box">{row && row.format === 'licence' ? 'Stock is the free licence keys.' : row && row.bundle ? 'Sells as many as its parts allow.' : 'Not counted: a download or a service.'}</Note> : null}

            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              <div className="row">
                <span className="m">
                  <span className="t" style={{ fontWeight: 'var(--weight-medium)', display: 'block' }}>Active</span>
                  <span className="s">{form.st === 'active' ? 'For sale online and at the counter' : form.st === 'archived' ? 'Archived: hidden everywhere' : 'Draft: not for sale yet'}</span>
                </span>
                <Switch on={form.st === 'active'} label="Active" onChange={(on) => set({ st: on ? 'active' : 'draft' })} />
              </div>
              {!adding ? <ListRow href={webHref} icon="globe" title="Edit everything on the web" sub="Descriptions, variants, specs, SEO" /> : null}
            </div>
            <div style={{ height: '4px' }} />
          </>
        )}
      </Content>
      <ActionBar><Button onClick={() => save()} disabled={!form}>{adding ? 'Add product' : 'Save changes'}</Button></ActionBar>

      <Sheet open={more} onClose={() => setMore(false)} title={form ? form.name || title : title}>
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          <ListRow href={webHref} icon="globe" title="Edit everything on the web" />
          {row && ctx && allowed('/m-stock', ctx) ? <ListRow href={'/m-stock?q=' + encodeURIComponent(row.sku)} icon="layers" title="Stock by place" /> : null}
          {row && ctx && allowed('/m-adjust', ctx) ? <ListRow href={'/m-adjust?sku=' + encodeURIComponent(row.sku)} icon="edit" title="Adjust or count stock" /> : null}
          {!adding ? <ListRow onClick={archive} icon="undo" title={form && form.st === 'archived' ? 'Make active again' : 'Archive product'} sub={form && form.st === 'archived' ? '' : 'Hidden everywhere; history kept'} /> : null}
        </div>
      </Sheet>
      <ScanSheet open={scan} onClose={() => setScan(false)} onCode={onScan} title="Scan the barcode" />
      <PinSheet open={!!pin} onClose={() => setPin(null)} reason={pin ? pin.reason : ''} action="Stock adjustment" amount={pin ? pin.amount : undefined} by={me()} onApprove={(m) => save(m)} />
    </AppScreen>
  );
}
