'use client';
// Merchant app · Scan (/m-scan). The board's layout (design/templates/app/MScan.dc.html) with a real camera:
//   camera   the back camera behind the scan frame; codes are read with the browser's BarcodeDetector when there is one
//            (Chrome on Android), else typed (a USB or Bluetooth scanner types too). Torch when the camera has one.
//   result   identifiers.js › resolveScan (SKU, barcode, pack barcode, other codes, scale label, IMEI / serial): price,
//            available (the person's place, else every place), sold in the last 30 days; Adjust stock · Add to order
//            (or Sell, in the Retail edition) · Print label; Open product. An unknown code offers Add product.
//   ?for=order  goes to /m-new-order?code=<code> (that screen adds the product; ?back= is kept as the base when it is
//            /m-new-order…). ?for=pos|receive|count: the item is handed back through sessionStorage
//            (stock/scanReturn.js › putScan) and the app goes back (history, or ?back=, or that screen).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { AppScreen, Button, Icon, Tile, TextInput, useAppData, useQuery, money, toast } from './kit/AppKit';
import { canUse } from './kit/appNav';
import { resolveScan, scanLine } from '@/lib/identifiers';
import { hasModule } from '@/lib/edition';
import { getStockPlaces } from '@/lib/locations';
import { useCamera, ScanFrame, Thumb } from './stock/Scanner';
import { putScan } from './stock/scanReturn';
import { rowsOf, stockOf, sold30, allowed, safe } from './stock/stockData';

const FOR = {
  order: ['Scan to add to the order', '/m-new-order'],
  pos: ['Scan to add to the sale', '/m-pos'],
  receive: ['Scan what arrived', '/m-receive'],
  count: ['Scan to count', '/m-adjust?tab=count'],
};
const glass = { background: 'rgba(255,255,255,.14)', color: '#fff' };

export default function MScanScreen() {
  const router = useRouter();
  const q = useQuery();
  const { ready, ctx } = useAppData();
  const videoRef = useRef(null);
  const [code, setCode] = useState('');
  const [typed, setTyped] = useState('');
  const forKey = q && FOR[q.get('for')] ? q.get('for') : '';
  const back = (q && q.get('back')) || (forKey ? FOR[forKey][1] : '/m-home');

  const leave = () => {
    if (typeof window !== 'undefined' && window.history.length > 1) router.back();
    else router.push(back);
  };
  const handle = (raw) => {
    const c = String(raw || '').trim();
    if (!c) return;
    const hit = safe(() => resolveScan(c), null);
    // an order: /m-new-order adds the product itself from ?code= (the caller's other query is kept)
    if (forKey === 'order') {
      const u = new URL(back.startsWith('/m-new-order') ? back : '/m-new-order', 'http://x');
      u.searchParams.set('code', c);
      router.replace(u.pathname + u.search);
      return;
    }
    if (forKey && hit) {
      putScan(forKey, { code: c, sku: hit.sku, name: hit.row ? hit.row.name : '', qty: hit.qty || 1, serial: hit.serial || '', pack: hit.pack ? hit.pack.name : '' });
      toast(`${hit.row ? hit.row.name : hit.sku}${hit.qty > 1 ? ' × ' + hit.qty : ''} added`);
      leave();
      return;
    }
    setCode(c);
  };
  const cam = useCamera(videoRef, { on: ready && !code, onCode: handle });

  const hit = useMemo(() => (ready && code ? safe(() => resolveScan(code), null) : null), [ready, code]);
  const row = useMemo(() => (hit ? rowsOf().find((r) => r.sku === hit.sku) || hit.row : null), [hit]);
  const myPlace = useMemo(() => { const u = ctx && ctx.user; const pl = u && u.place; return pl && safe(() => getStockPlaces(), []).includes(pl) ? pl : ''; }, [ctx]);
  const st = row ? stockOf(row.sku, myPlace) : null;
  const sold = row ? sold30()[row.sku] || 0 : 0;

  const addTo = (key, route) => { putScan(key, { code, sku: row.sku, name: row.name, qty: hit.qty || 1, serial: hit.serial || '' }); router.push(route); };
  const online = ctx ? hasModule('online', ctx.ed) : true;
  const sellTile = !row ? null : ctx && online && canUse('/m-new-order', ctx) ? { label: 'Add to order', icon: 'bag', run: () => router.push('/m-new-order?code=' + encodeURIComponent(code)) }
    : ctx && allowed('/m-pos', ctx) ? { label: 'Sell', icon: 'cart', run: () => addTo('pos', '/m-pos') } : null;
  const adjustHref = row ? (ctx && allowed('/m-adjust', ctx) ? '/m-adjust?sku=' + encodeURIComponent(row.sku) + (myPlace ? '&place=' + encodeURIComponent(myPlace) : '') : '/m-product-edit?sku=' + encodeURIComponent(row.sku)) : '';
  const submit = (e) => { e.preventDefault(); const c = typed.trim(); setTyped(''); handle(c); };

  return (
    <AppScreen name="MScan" title="Scan a barcode" statusTone="light" tabs={false}>
      <h1 style={{ position: 'absolute', width: '1px', height: '1px', margin: '-1px', overflow: 'hidden', clip: 'rect(0 0 0 0)', whiteSpace: 'nowrap' }}>Scan a barcode</h1>
      <div style={{ position: 'absolute', inset: '0', background: 'radial-gradient(120% 80% at 50% 35%,#3b4a61,#0b1220)' }} />
      <video ref={videoRef} muted playsInline aria-hidden="true" style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: cam.state === 'live' && !code ? 'block' : 'none' }} />
      <div style={{ position: 'absolute', top: '47px', left: '0', right: '0', display: 'flex', justifyContent: 'space-between', padding: '6px 16px', zIndex: '6' }}>
        <button type="button" className="ib" aria-label="Close" style={glass} onClick={leave}><Icon name="x" size={22} stroke={2} /></button>
        <span style={{ alignSelf: 'center', color: '#fff', fontWeight: 'var(--weight-medium)' }}>{forKey ? FOR[forKey][0] : 'Scan a barcode'}</span>
        <button type="button" className="ib" aria-label="Torch" aria-pressed={!!cam.torch} style={{ ...glass, opacity: cam.torch === null ? 0.5 : 1, background: cam.torch ? '#fff' : glass.background, color: cam.torch ? '#0b1220' : '#fff' }}
          onClick={() => (cam.torch === null ? toast('This camera has no torch', { tone: 'info' }) : cam.setTorch(!cam.torch))}>
          <Icon name="zap" size={20} stroke={2} />
        </button>
      </div>
      <ScanFrame style={{ top: '210px', left: '50%', marginLeft: '-140px' }} />
      <div style={{ position: 'absolute', top: '396px', left: '0', right: '0', padding: '0 40px', textAlign: 'center', color: '#cbd5e1', fontSize: 'var(--text-sm)' }}>
        {cam.state === 'nocam' ? 'No camera here. Type the code below.' : cam.state === 'live' && !cam.reads ? 'This browser can’t read codes from the camera. Type the code below.' : 'Hold steady. Works with a USB or Bluetooth scanner too.'}
      </div>

      {!code ? (
        <div className="sheet" style={{ paddingTop: '10px' }}>
          <div className="grab" />
          <form onSubmit={submit} style={{ display: 'flex', gap: '8px' }}>
            <span style={{ flex: 1, minWidth: 0 }}><TextInput value={typed} onChange={setTyped} placeholder="Type a barcode, SKU or IMEI" autoFocus={!forKey} /></span>
            <Button type="submit" kind="soft">Find</Button>
          </form>
        </div>
      ) : row ? (
        <div className="sheet" style={{ paddingTop: '10px' }}>
          <div className="grab" />
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <Thumb row={row} size={60} />
            <div style={{ flex: '1', minWidth: '0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)', color: 'var(--ok)' }}><Icon name="check" size={14} stroke={3} />Found{hit.type !== 'barcode' && hit.type !== 'sku' ? ' · ' + scanLine(hit) : ''}</div>
              <div className="ell" style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{row.name}</div>
              <div className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{code}</div>
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '16px', padding: '14px', borderRadius: 'var(--radius-xl)', background: 'var(--bg)' }}>
            <div><div className="k">Price</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(row.price)}</div></div>
            <div><div className="k">{myPlace ? 'Here' : 'In stock'}</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{st && st.untracked ? '—' : st ? st.available : 0}</div></div>
            <div><div className="k">Sold · 30 d</div><div className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{sold}</div></div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: '10px', marginTop: '14px' }}>
            <Link href={adjustHref} className="tile"><span className="ico" style={{ width: '52px', height: '52px' }}><Icon name="edit" /></span>Adjust stock</Link>
            {sellTile ? <Tile onClick={sellTile.run} icon={sellTile.icon} label={sellTile.label} /> : <Tile onClick={() => setCode('')} icon="scan" label="Scan again" />}
            <Tile onClick={() => toast('Labels print from the web: Products › Barcode labels', { tone: 'info' })} icon="tag" label="Print label" />
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            {sellTile ? <Button kind="line" onClick={() => setCode('')} style={{ flex: 1 }}>Scan again</Button> : null}
            <Button href={'/m-product-edit?sku=' + encodeURIComponent(row.sku)} style={{ flex: 2 }}>Open product</Button>
          </div>
        </div>
      ) : (
        <div className="sheet" style={{ paddingTop: '10px' }}>
          <div className="grab" />
          <div style={{ display: 'flex', gap: '14px', alignItems: 'center' }}>
            <span className="av" style={{ width: '60px', height: '60px', background: 'var(--errbg)', color: 'var(--err)' }}><Icon name="alert" /></span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>No product has this code</div>
              <div className="mono" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{code}</div>
            </div>
          </div>
          <div style={{ display: 'flex', gap: '10px', marginTop: '18px' }}>
            <Button kind="line" onClick={() => setCode('')} style={{ flex: 1 }}>Scan again</Button>
            {ctx && ctx.ids.has('products-add') ? <Button href={'/m-product-edit?barcode=' + encodeURIComponent(code)} style={{ flex: 2 }}>Add product</Button> : null}
          </div>
        </div>
      )}
    </AppScreen>
  );
}
