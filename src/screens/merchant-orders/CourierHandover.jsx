'use client';
// CourierHandover — Orders › Courier handover (/courier-handover, ON-F12): the daily hand-over to each courier's rider,
// the proof when a parcel or its cash goes missing. Choose the courier → scan (or tick) its parcels: packed for it, or
// booked with it in the last day and not handed over yet → check the count and the cash to collect → print the
// manifest for the rider to sign → Mark as handed over (a packed parcel is booked with the courier first). Each order
// keeps who handed it over and when; the manifests are listed under the list and can be printed again.
// Logic: src/lib/orderFlow.js › handoverParcels / handOver / handovers.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, LearnMore } from '@/components/ui/IndexKit';
import { BrandLogo } from '@/components/BrandLogo';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { getOrders, orderHref } from '@/lib/orders';
import { COURIERS, handoverParcels, handOver, handovers, syncCourier, HANDOVER_EVENT } from '@/lib/orderFlow';
import { printNode } from '@/lib/printNode';
import { currentUser } from '@/lib/team';
import { MERCHANT } from '@/lib/merchant';

const me = () => { try { return currentUser().name || 'Staff'; } catch { return 'Staff'; } };

const CSS = `
.ch-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ch-scan{display:flex;gap:var(--space-2);flex:1 1 280px;min-width:0}
.ch-scan .gc-input{flex:1;min-width:0;font-family:var(--font-data)}
.ch-id{font-family:var(--font-data)}
.ch-foot{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);background:var(--surface-subtle)}
.ch-foot__sum{margin-right:auto;font-size:var(--text-sm);color:var(--text-body)}
.ch-foot__sum b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.ch-foot .gc-input{width:200px}
.ch-chip-n{font-family:var(--font-data);color:var(--text-muted)}
.ch-paper{display:none}
.ix-pitem.ch-pick{display:grid;grid-template-columns:20px minmax(0,1fr);column-gap:12px;align-items:start;cursor:pointer}
.ix-pitem.ch-pick>input{width:18px;height:18px;margin:2px 0 0;accent-color:var(--primary)}
.ix-pitem.ch-pick>span{display:flex;flex-direction:column;gap:4px;min-width:0}
@media (max-width:640px){.ch-foot .gc-input{width:100%}.ch-foot .gc-btn{flex:1 1 0}}
`;

/** The manifest the rider signs (printed on its own with printNode). */
function Manifest({ doc, innerRef }) {
  if (!doc) return <div ref={innerRef} />;
  const cell = { padding: '2mm', borderBottom: '1px solid #cbd5e1', textAlign: 'left', fontSize: 'var(--text-xs)' };
  return (
    <div ref={innerRef} style={{ fontFamily: 'var(--font-sans)', color: '#0f172a', padding: '6mm', display: 'flex', flexDirection: 'column', gap: '4mm' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', borderBottom: '2px solid #0f172a', paddingBottom: '2mm' }}>
        <b style={{ fontSize: 'var(--text-xl)' }}>Pickup manifest · {doc.courier}</b>
        <span>{MERCHANT.name}</span>
      </div>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6mm', fontSize: 'var(--text-sm)' }}>
        <span>{doc.id ? 'Manifest ' + doc.id : 'Draft'}</span><span>{formatDate(doc.at)}, {formatTime(doc.at)}</span><span>{doc.parcels.length} {doc.parcels.length === 1 ? 'parcel' : 'parcels'}</span><span>COD {formatBDT(doc.cod)}</span>
      </div>
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
        <thead><tr>{['#', 'Order', 'Tracking ID', 'Customer', 'Area', 'COD'].map((h) => <th key={h} style={{ ...cell, fontWeight: 'var(--weight-semibold)' }}>{h}</th>)}</tr></thead>
        <tbody>{doc.parcels.map((p, i) => <tr key={p.id}><td style={cell}>{i + 1}</td><td style={{ ...cell, fontFamily: 'var(--font-data)' }}>{p.id}</td><td style={{ ...cell, fontFamily: 'var(--font-data)' }}>{p.tracking && p.tracking !== '—' ? p.tracking : 'Booked on handover'}</td><td style={cell}>{p.customer}</td><td style={cell}>{p.area}</td><td style={{ ...cell, textAlign: 'right' }}>{formatBDT(p.cod)}</td></tr>)}</tbody>
      </table>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10mm', marginTop: '12mm', fontSize: 'var(--text-sm)' }}>
        <div style={{ borderTop: '1px solid #0f172a', paddingTop: '2mm' }}>Handed over by: {doc.by}</div>
        <div style={{ borderTop: '1px solid #0f172a', paddingTop: '2mm' }}>Rider{doc.rider ? ': ' + doc.rider : ''} · signature</div>
      </div>
    </div>
  );
}

export default function CourierHandover() {
  const [ready, setReady] = useState(false);
  const [tick, setTick] = useState(0);
  const [courier, setCourier] = useState(COURIERS[0]);
  const [sel, setSel] = useState({});
  const [scan, setScan] = useState('');
  const [rider, setRider] = useState('');
  const [paper, setPaper] = useState(null);   // the manifest being printed
  const paperRef = useRef(null);
  const scanRef = useRef(null);

  useEffect(() => {
    syncCourier();
    setReady(true);
    const again = () => setTick((t) => t + 1);
    window.addEventListener(HANDOVER_EVENT, again);
    return () => window.removeEventListener(HANDOVER_EVENT, again);
  }, []);
  useEffect(() => {
    if (!paper) return undefined;
    const t = setTimeout(() => { printNode(paperRef.current, { title: 'Manifest ' + (paper.id || paper.courier), css: '@page{size:A4;margin:10mm}' }); setPaper(null); }, 50);
    return () => clearTimeout(t);
  }, [paper]);

  const all = useMemo(() => (ready ? getOrders() : []), [ready, tick]);
  const byCourier = useMemo(() => Object.fromEntries(COURIERS.map((c) => [c, ready ? handoverParcels(c, all) : []])), [ready, all]);
  const list = byCourier[courier] || [];
  const picked = list.filter((o) => sel[o.id]);
  const cod = picked.reduce((a, o) => a + o.cod, 0);
  const past = useMemo(() => (ready ? handovers().slice(0, 6) : []), [ready, tick]);
  const allOn = list.length > 0 && list.every((o) => sel[o.id]);

  const pickCourier = (c) => { setCourier(c); setSel({}); };
  const doScan = (e) => {
    e.preventDefault();
    const x = scan.trim().toUpperCase();
    if (!x) return;
    const id = x.replace(/^#?/, '#');
    const hit = list.find((o) => o.id.toUpperCase() === id || (o.consignment && o.consignment.toUpperCase() === x));
    if (!hit) {
      const other = COURIERS.find((c) => c !== courier && (byCourier[c] || []).some((o) => o.id.toUpperCase() === id || (o.consignment && o.consignment.toUpperCase() === x)));
      toast(other ? `${scan.trim()} goes with ${other}` : `${scan.trim()} is not waiting for ${courier}`, { tone: 'error' });
    } else if (sel[hit.id]) toast(hit.id + ' is already ticked', { tone: 'info' });
    else { setSel({ ...sel, [hit.id]: true }); toast(hit.id + ' ticked'); }
    setScan('');
    if (scanRef.current) scanRef.current.focus();
  };
  const draftDoc = () => ({ id: '', at: Date.now(), by: me(), courier, rider: rider.trim(), cod, parcels: picked.map((o) => ({ id: o.id, tracking: o.consignment, customer: o.customer, area: [o.thana, o.district].filter(Boolean).join(', ') || o.zone || '', cod: o.cod })) });
  const print = () => { if (!picked.length) { toast('Tick the parcels first', { tone: 'error' }); return; } setPaper(draftDoc()); };
  const give = () => {
    if (!picked.length) { toast('Tick the parcels first', { tone: 'error' }); return; }
    const r = handOver(picked, { courier, rider: rider.trim(), by: me() });
    setSel({}); setTick((t) => t + 1);
    if (!r.ok) { toast(r.failed.length ? r.failed[0].id + ': ' + r.failed[0].error : 'Nothing was handed over', { tone: 'error' }); return; }
    toast(`${r.manifest.parcels.length} ${r.manifest.parcels.length === 1 ? 'parcel' : 'parcels'} handed to ${courier} · ${r.manifest.id}` + (r.failed.length ? ` · ${r.failed.length} not booked` : ''), r.failed.length ? { tone: 'info' } : undefined);
    if (r.failed.length) r.failed.forEach((f) => toast(f.id + ': ' + f.error, { tone: 'error' }));
  };

  return (
    <div className="dc-screen ds" data-screen="CourierHandover">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="orders-handover" />
        <main className="gc-shell__main">
          <Topbar crumb="Orders" page="Courier handover" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="hand-helping" title="Courier handover"
                about="Hand the day's parcels to each courier's rider: scan or tick them, check the count and the cash on delivery, print the manifest for the rider to sign, then mark them handed over. Packed parcels not booked yet are booked with the courier as they go."
                secondary={[{ label: 'Courier statement', href: '/courier-statement' }]}
                more={[{ label: 'All orders', href: '/merchant-orders?status=processing' }, { label: 'Courier returns', href: '/courier-returns' }]} />

              <section className="ix-card" aria-label={'Parcels for ' + courier}>
                <div className="ch-bar">
                  <div className="ix-chips" role="group" aria-label="Courier">
                    {COURIERS.map((c) => <button key={c} type="button" className="ix-chip" aria-pressed={courier === c} onClick={() => pickCourier(c)}><BrandLogo brand={c.toLowerCase()} size={16} decorative />{c}<span className="ch-chip-n">{ready ? (byCourier[c] || []).length : ''}</span></button>)}
                  </div>
                  <form className="ch-scan" onSubmit={doScan}>
                    <input ref={scanRef} className="gc-input" value={scan} onChange={(e) => setScan(e.target.value)} placeholder="Scan or type order no. or tracking ID" aria-label="Scan or type order number or tracking ID" autoComplete="off" />
                    <button type="submit" className="gc-btn gc-btn--neutral">Tick</button>
                  </form>
                </div>
                {!ready ? <div style={{ minHeight: 160 }} aria-busy="true" /> : list.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="package-check" title={`No parcels waiting for ${courier}`} /></div>
                ) : (
                  <>
                  <ul className="ix-plist" aria-label={'Parcels for ' + courier}>
                    {list.map((o) => (
                      <li key={o.id}>
                        <label className="ix-pitem ch-pick">
                          <input type="checkbox" checked={!!sel[o.id]} onChange={() => setSel({ ...sel, [o.id]: !sel[o.id] })} />
                          <span>
                            <span className="ix-pitem__top"><b className="ch-id">{o.id}</b><span>{formatBDT(o.cod)}</span></span>
                            <span className="ix-pitem__mid">{o.customer} · {[o.thana, o.district].filter(Boolean).join(', ') || o.zone}</span>
                            <span className="ix-pitem__tags">{o.booked ? <span className="ch-id ix-muted">{o.consignment}</span> : <StatusBadge tone="neutral">Booked on handover</StatusBadge>}</span>
                          </span>
                        </label>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep gc-table--scroll">
                      <caption className="sr-only">Parcels for {courier}</caption>
                      <thead><tr>
                        <th scope="col" className="ix-check"><input type="checkbox" checked={allOn} onChange={() => setSel(allOn ? {} : Object.fromEntries(list.map((o) => [o.id, true])))} aria-label="Tick every parcel" /></th>
                        <th scope="col">Order</th><th scope="col">Tracking ID</th><th scope="col">Customer</th><th scope="col">Area</th><th scope="col" className="ix-num">COD</th>
                      </tr></thead>
                      <tbody>
                        {list.map((o) => (
                          <tr key={o.id} className={sel[o.id] ? 'is-sel' : ''} onClick={(e) => { if (!e.target.closest('a,input')) setSel({ ...sel, [o.id]: !sel[o.id] }); }}>
                            <td className="ix-check"><input type="checkbox" checked={!!sel[o.id]} onChange={() => setSel({ ...sel, [o.id]: !sel[o.id] })} aria-label={'Tick ' + o.id} /></td>
                            <td><Link href={orderHref(o.id)} className="ix-strong ch-id">{o.id}</Link></td>
                            <td>{o.booked ? <span className="ch-id">{o.consignment}</span> : <StatusBadge tone="neutral">Booked on handover</StatusBadge>}</td>
                            <td>{o.customer}</td>
                            <td className="ix-muted">{[o.thana, o.district].filter(Boolean).join(', ') || o.zone}</td>
                            <td className="ix-num">{formatBDT(o.cod)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  </>
                )}
                <div className="ch-foot">
                  <span className="ch-foot__sum"><b>{picked.length}</b> of {list.length} parcels · COD <b>{formatBDT(cod)}</b></span>
                  <input className="gc-input" value={rider} onChange={(e) => setRider(e.target.value)} placeholder="Rider name (optional)" aria-label="Rider name" />
                  <button type="button" className="gc-btn gc-btn--neutral" onClick={print} disabled={!picked.length}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print manifest</button>
                  <button type="button" className="gc-btn gc-btn--solid" onClick={give} disabled={!picked.length}>Mark handed over</button>
                </div>
              </section>

              {past.length ? (
                <section className="ix-card" aria-labelledby="ch-past">
                  <header className="ix-card__head"><h2 id="ch-past">Recent manifests</h2></header>
                  <ul className="ix-plist" aria-label="Recent manifests">
                    {past.map((m) => (
                      <li key={m.id}>
                        <button type="button" className="ix-pitem" onClick={() => setPaper(m)} aria-label={'Print manifest ' + m.id}>
                          <span className="ix-pitem__top"><b className="ch-id">{m.id} · {m.courier}</b><span>{formatBDT(m.cod)}</span></span>
                          <span className="ix-pitem__mid">{formatDate(m.at)}, {formatTime(m.at)} · {m.parcels.length} {m.parcels.length === 1 ? 'parcel' : 'parcels'}{m.rider ? ' · ' + m.rider : ''}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep gc-table--scroll">
                      <caption className="sr-only">Recent manifests</caption>
                      <thead><tr><th scope="col">Manifest</th><th scope="col">When</th><th scope="col">Courier</th><th scope="col">Rider</th><th scope="col" className="ix-num">Parcels</th><th scope="col" className="ix-num">COD</th><th scope="col"><span className="sr-only">Print</span></th></tr></thead>
                      <tbody>
                        {past.map((m) => (
                          <tr key={m.id}>
                            <td className="ch-id ix-strong">{m.id}</td>
                            <td className="ix-muted">{formatDate(m.at)}, {formatTime(m.at)}</td>
                            <td>{m.courier}</td>
                            <td>{m.rider || '—'}</td>
                            <td className="ix-num">{m.parcels.length}</td>
                            <td className="ix-num">{formatBDT(m.cod)}</td>
                            <td className="ix-num"><button type="button" className="ix-btn ix-btn--sm" onClick={() => setPaper(m)}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print</button></td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </section>
              ) : null}
              <LearnMore topic="courier handover" />
            </div>
          </div>
        </main>
      </div>
      <div className="ch-paper" aria-hidden="true"><Manifest doc={paper} innerRef={paperRef} /></div>
    </div>
  );
}
