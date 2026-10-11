'use client';
// Merchant app · Receive goods (/m-receive, ?po=<no>). The web's Receive goods (/receive-goods) on a phone, drawn with
// the purchase boards' cards, rows, steppers, sheets and action bar.
//   no ?po    the orders that can be received (placed orders made here or on the web, and the demo PO-2609-0020 the web
//             opens), and "Bought without an order?" → New purchase (Bought now) when the shop buys direct
//   ?po       receiving at (receiving places), each line's still-coming count with a stepper for what arrived; a tap
//             opens the line: good / damaged pieces and the expiry date for products that track expiry. Scan (camera or
//             typed; /m-scan?for=receive hands back too) adds one per scan, a carton its pieces. Challan no., extra cost.
//   save      the web's logic: a 'receive' stock move per product at the place; damaged pieces go to Returns & damaged
//             and are held there (stockHolds 'damaged'); the order's received counts and delivery (GRN) are updated
//             (purchaseOrders.updatePO, orders made here); the supplier's bill for what was accepted + extra cost
//             (supplierBills.addBill); expiry batches (batches.addBatches).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { AppScreen, Content, AppBar, ActionBar, Button, IconButton, Field, TextInput, Stepper, Segmented, Sheet, Note, Pill, EmptyState, Skeleton, Icon, useAppData, useQuery, money, toast, refresh } from '../kit/AppKit';
import { getPOs, updatePO, unitCost, lineCost, DEMO_POS } from '@/lib/purchaseOrders';
import { addBill, findSupplier } from '@/lib/supplierBills';
import { addMove, productBy } from '@/lib/stock';
import { addHolds } from '@/lib/stockHolds';
import { addBatches } from '@/lib/batches';
import { DAMAGED_PLACE, getReceivingPlaces, onlinePlace } from '@/lib/locations';
import { resolveScan } from '@/lib/identifiers';
import { Thumb, ScanSheet } from './Scanner';
import { PoCard } from './PurchaseParts';
import { takeScan, SCAN_EVENT } from './scanReturn';
import { poRows, buyingMode, RECEIVABLE_DEMO } from './purchaseData';
import { rowBy, tracksExpiry, me, onePlace, safe, plural, fromIso } from './stockData';

/** The order to receive, with what is still coming per line. */
function orderOf(no) {
  const p = safe(() => getPOs(), []).find((x) => x.no === no);
  if (p) return { no: p.no, supplier: p.supplier, place: p.place, stored: true, lines: p.lines.map((l) => ({ name: l.name, code: l.code || '', sku: l.sku || '', cost: l.cost, pending: Math.max(0, l.qty - (l.received || 0)) })) };
  if (no === RECEIVABLE_DEMO) {
    const d = DEMO_POS.find((x) => x.no === no);
    return { no, supplier: d.supplier, place: d.place, stored: false, lines: d.lines.map((l) => ({ name: l.name, code: l.code || '', sku: l.sku || '', cost: l.cost, pending: Math.max(0, l.qty - (l.received || 0)) })) };
  }
  return null;
}
const rowOf = (l) => rowBy(l.sku) || rowBy(l.name) || (l.code ? rowBy(l.code) : null);

export default function MReceive() {
  const q = useQuery();
  const { ready, tick, ctx } = useAppData([SCAN_EVENT]);
  const [order, setOrder] = useState(undefined);
  const [got, setGot] = useState([]);          // good pieces per line
  const [dmg, setDmg] = useState([]);          // damaged pieces per line
  const [exp, setExp] = useState([]);          // expiry date (yyyy-mm-dd) per line
  const [place, setPlace] = useState('');
  const [challan, setChallan] = useState('');
  const [extra, setExtra] = useState('');
  const [open, setOpen] = useState(-1);
  const [scan, setScan] = useState(false);
  const [done, setDone] = useState(null);
  const [busy, setBusy] = useState(false);
  const no = q ? q.get('po') || '' : '';
  const places = useMemo(() => (ready ? (onePlace() ? [safe(() => onlinePlace(), 'Central Warehouse')] : safe(() => getReceivingPlaces(), ['Central Warehouse'])) : []), [ready]);

  useEffect(() => {
    if (!ready || !q) return;
    if (!no) { setOrder(null); return; }
    const o = orderOf(no);
    setOrder(o || false);
    if (o) { setGot(o.lines.map(() => 0)); setDmg(o.lines.map(() => 0)); setExp(o.lines.map(() => '')); setPlace(places.includes(o.place) ? o.place : places[0] || o.place); }
  }, [ready, q, no, places]);

  const lineIndex = (code, sku) => (order && order.lines ? order.lines.findIndex((l) => (sku && l.sku === sku) || (code && l.code === code) || (sku && (rowOf(l) || {}).sku === sku)) : -1);
  const addScan = (code, n = 1, sku = '') => {
    const hit = sku ? { sku, qty: n } : safe(() => resolveScan(code), null);
    const i = lineIndex(code, hit && hit.sku);
    if (i < 0) { toast(`${hit && hit.row ? hit.row.name : code} is not on ${order.no}`, { tone: 'error' }); return; }
    const l = order.lines[i];
    const add = (hit && hit.qty) || n || 1;
    setGot((g) => g.map((x, k) => (k === i ? Math.min(l.pending - (dmg[i] || 0), x + add) : x)));
    if ((got[i] || 0) + (dmg[i] || 0) + add > l.pending) toast(`Only ${l.pending} of ${l.name} still coming`, { tone: 'info' });
    else toast(`+${add} ${l.name}`);
  };
  // a scan from /m-scan?for=receive
  useEffect(() => { if (!order || !order.lines) return; const s = takeScan('receive'); if (s) addScan(s.code, s.qty || 1, s.sku); }, [order, tick]); // eslint-disable-line react-hooks/exhaustive-deps

  const total = got.reduce((a, n) => a + n, 0);
  const totalDmg = dmg.reduce((a, n) => a + n, 0);
  const pend = order && order.lines ? order.lines.reduce((a, l) => a + l.pending, 0) : 0;
  const missingExp = order && order.lines ? order.lines.findIndex((l, i) => got[i] > 0 && tracksExpiry(rowOf(l)) && !exp[i]) : -1;

  const save = () => {
    if (busy) return;
    if (!total && !totalDmg) { toast('Count what arrived first', { tone: 'error' }); return; }
    if (missingExp >= 0) { toast(`Add the expiry date of ${order.lines[missingExp].name}`, { tone: 'error' }); setOpen(missingExp); return; }
    setBusy(true);
    const by = me();
    const grn = 'GRN-' + String(121 + safe(() => getPOs(), []).reduce((a, p) => a + (p.deliveries || []).length, 0)).padStart(4, '0');
    const rows = order.lines.map((l, i) => ({ ...l, toStock: got[i] || 0, dmg: dmg[i] || 0, expiry: fromIso(exp[i]) }));
    rows.forEach((r) => {
      const sku = (productBy(r.sku || r.name) || {}).sku || r.code;
      if (r.toStock) addMove({ sku, place, qty: r.toStock, kind: 'receive', reason: 'Received from ' + order.supplier, by, ref: order.no, op: `${order.no}:${grn}:${sku}` });
      if (r.dmg) {
        addMove({ sku, place: DAMAGED_PLACE, qty: r.dmg, kind: 'receive', reason: 'Damaged on arrival', by, ref: order.no, op: `${order.no}:${grn}:${sku}:dmg` });
        safe(() => addHolds({ type: 'damaged', place: DAMAGED_PLACE, ref: order.no, who: order.supplier, note: 'Arrived damaged · ' + order.no, by }, [{ name: r.name, qty: r.dmg }]), null);
      }
    });
    if (order.stored) {
      updatePO(order.no, (p) => {
        const lines = p.lines.map((l, i) => ({ ...l, received: (l.received || 0) + (rows[i] ? rows[i].toStock : 0) }));
        return { lines, status: lines.every((l) => l.received >= l.qty) ? 'Received' : 'Partly received', deliveries: [{ grn, at: Date.now(), qty: total, place, by }, ...(p.deliveries || [])] };
      });
    }
    const ctot = Math.round(Number(extra) || 0);
    const billLines = rows.filter((r) => r.toStock).map((r) => ({ sku: (productBy(r.sku || r.name) || {}).sku || '', name: r.name, qty: r.toStock, cost: r.cost || lineCost(order.no, r.name) || unitCost(r.name) }));
    const value = billLines.reduce((a, l) => a + l.qty * l.cost, 0) + ctot;
    const bill = value ? addBill({ supplier: order.supplier, po: order.no, grn, ref: challan.trim(), amount: value, lines: billLines, extra: ctot, notes: ctot ? `Extra cost ${money(ctot)}` : '' }) : null;
    safe(() => addBatches(rows.filter((r) => r.toStock && r.expiry).map((r) => ({ sku: (productBy(r.sku || r.name) || {}).sku || r.sku, name: r.name, qty: r.toStock, expiry: r.expiry })), { place, ref: bill ? bill.no : grn, supplier: order.supplier }), null);
    refresh();
    setDone({ grn, total, dmg: totalDmg, bill, sup: safe(() => findSupplier(order.supplier), null) });
    toast(`${plural(total, 'piece')} added to ${place} stock`);
    setBusy(false);
  };

  const list = useMemo(() => (ready && order === null ? poRows().filter((p) => p.receivable) : []), [ready, order, tick]);
  const mode = useMemo(() => (ready ? buyingMode() : { direct: false }), [ready]);
  const line = open >= 0 && order && order.lines ? order.lines[open] : null;
  const title = order && order.no ? 'Receive · ' + order.no : 'Receive goods';

  if (order === null || order === false || order === undefined) {
    return (
      <AppScreen name="MReceive" title="Receive goods">
        <AppBar title="Receive goods" back="/m-more" />
        <Content top={103}>
          {order === false ? <Note tone="warn" icon="alert" style={{ margin: '2px 20px 14px' }}>{no} can’t be received here. Pick an order below.</Note> : null}
          <div className="sec" style={{ marginTop: '2px' }}><h2>Orders to receive</h2></div>
          {order === undefined ? <Skeleton rows={3} /> : list.length ? list.map((p) => <PoCard key={p.no} po={p} href={'/m-receive?po=' + encodeURIComponent(p.no)} />)
            : <div className="card" style={{ margin: '0 20px' }}><EmptyState icon="download" title="No orders are waiting" action={ctx && ctx.ids.has('po-orders') ? { label: 'New purchase order', href: '/m-purchase-new?mode=order' } : null} /></div>}
          {mode.direct ? (
            <Link href="/m-purchase-new?mode=direct" className="card" style={{ display: 'flex', alignItems: 'center', gap: '12px', margin: '12px 20px 0', padding: '14px 16px' }}>
              <span className="ico" style={{ width: '40px', height: '40px' }}><Icon name="bag" /></span>
              <span style={{ flex: '1' }}><span style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>Bought without an order?</span><span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>Enter the purchase: stock comes in at once</span></span>
              <Icon name="chev" size={18} />
            </Link>
          ) : null}
        </Content>
      </AppScreen>
    );
  }

  if (done) {
    return (
      <AppScreen name="MReceive" title="Received">
        <AppBar title={title} back="/m-purchase" />
        <Content top={103} bottom={98} style={{ padding: '2px 20px 0' }} gap={16}>
          <div className="card" style={{ padding: '22px 18px', textAlign: 'center' }}>
            <span className="ico" style={{ width: '56px', height: '56px', margin: '0 auto', background: 'var(--okbg)', color: 'var(--ok)', borderRadius: 'var(--radius-full)' }}><Icon name="check" size={28} stroke={2.4} /></span>
            <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', marginTop: '12px' }}>{plural(done.total, 'piece')} in stock</div>
            <div className="help" style={{ marginTop: '4px' }}>{done.grn} · {place}{done.dmg ? ` · ${done.dmg} damaged held at ${DAMAGED_PLACE}` : ''}</div>
          </div>
          {done.bill ? (
            <div className="card" style={{ padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><span className="mono" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{done.bill.no}</span><span style={{ fontWeight: 'var(--weight-medium)' }}>Bill from {order.supplier}</span></span>
              <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(done.bill.amount)}</span>
            </div>
          ) : null}
        </Content>
        <ActionBar>
          {done.bill ? <Button kind="line" href={'/m-purchase-detail?id=' + encodeURIComponent(done.bill.no)}>Pay supplier</Button> : null}
          <Button href={'/m-purchase-detail?id=' + encodeURIComponent(order.no)} style={{ flex: 2 }}>Done</Button>
        </ActionBar>
      </AppScreen>
    );
  }

  return (
    <AppScreen name="MReceive" title={title}>
      <AppBar title={title} back={'/m-purchase-detail?id=' + encodeURIComponent(order.no)} actions={<IconButton icon="scan" label="Scan items" onClick={() => setScan(true)} />} />
      <Content top={103} bottom={98}>
        <div style={{ padding: '2px 20px 0' }}>
          <div style={{ display: 'flex', gap: '6px' }}><Pill tone="nav">{plural(pend, 'piece')} coming</Pill>{!order.stored ? <Pill tone="grey">Demo order</Pill> : null}</div>
          <div style={{ fontSize: 'var(--text-xl)', fontWeight: 'var(--weight-semibold)', marginTop: '8px' }}>{order.supplier}</div>
        </div>
        {places.length > 1 ? (
          <div className="field" style={{ margin: '16px 20px 0' }}>
            <span className="lab">Receiving at</span>
            <Segmented items={places.map((p) => ({ key: p, label: p.replace(/ branch$/, '') }))} value={place} onChange={setPlace} style={{ margin: 0 }} />
          </div>
        ) : null}
        <div className="sec"><h2>{total + totalDmg} of {pend} counted</h2><button type="button" className="tap" onClick={() => { setGot(order.lines.map((l, i) => Math.max(0, l.pending - (dmg[i] || 0)))); }} style={{ border: 0, background: 'none', padding: 0, fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--brand)', cursor: 'pointer' }}>All arrived</button></div>
        <div className="card" style={{ margin: '0 20px' }}>
          {order.lines.map((l, i) => {
            const row = rowOf(l);
            const c = (got[i] || 0) + (dmg[i] || 0);
            const pct = l.pending ? Math.round((c / l.pending) * 100) : 100;
            return (
              <div key={i} className="lrow">
                <button type="button" onClick={() => setOpen(i)} style={{ display: 'flex', alignItems: 'center', gap: '14px', flex: 1, minWidth: 0, padding: 0, border: 0, background: 'none', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
                  {row ? <Thumb row={row} size={44} /> : <span className="av" style={{ width: '44px', height: '44px', background: '#e0f3fb', color: '#003087' }}>{l.name.charAt(0)}</span>}
                  <span style={{ flex: '1', minWidth: '0' }}>
                    <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{l.name}</span>
                    <span className="num" style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: dmg[i] ? 'var(--err)' : 'var(--muted)' }}>{l.pending} coming{dmg[i] ? ` · ${dmg[i]} damaged` : ''}{tracksExpiry(row) ? (exp[i] ? ' · exp ' + exp[i] : ' · add expiry') : ''}</span>
                    <span className="bar" style={{ display: 'block', marginTop: '7px' }}><i style={{ width: pct + '%', background: c >= l.pending ? '#10b981' : '#003087' }} /></span>
                  </span>
                </button>
                <Stepper value={got[i] || 0} min={0} max={Math.max(0, l.pending - (dmg[i] || 0))} label={'Arrived of ' + l.name} onChange={(n) => setGot((g) => g.map((x, k) => (k === i ? n : x)))} />
              </div>
            );
          })}
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', margin: '16px 20px 0' }}>
          <Field label="Challan no."><TextInput value={challan} onChange={setChallan} placeholder="Optional" /></Field>
          <Field label="Extra cost"><TextInput value={extra} onChange={(v) => setExtra(v.replace(/[^\d]/g, ''))} prefix="৳" inputMode="numeric" placeholder="0" /></Field>
        </div>
        <div style={{ height: '8px' }} />
      </Content>
      <ActionBar><Button icon="download" onClick={save} disabled={busy || !(total + totalDmg)}>{total ? `Add ${plural(total, 'piece')} to stock` : 'Receive'}</Button></ActionBar>

      <Sheet open={!!line} onClose={() => setOpen(-1)} title={line ? line.name : ''} footer={<Button onClick={() => setOpen(-1)}>Done</Button>}>
        {line ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div className="help">{line.pending} still coming · {money(line.cost)} each</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="lab">Good</span><Stepper value={got[open] || 0} min={0} max={Math.max(0, line.pending - (dmg[open] || 0))} onChange={(n) => setGot((g) => g.map((x, k) => (k === open ? n : x)))} /></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}><span className="lab">Damaged</span><Stepper value={dmg[open] || 0} min={0} max={Math.max(0, line.pending - (got[open] || 0))} onChange={(n) => setDmg((g) => g.map((x, k) => (k === open ? n : x)))} /></div>
            {dmg[open] ? <Note tone="warn" icon="alert">Damaged pieces are held at {DAMAGED_PLACE} and not billed. Return them from Supplier return on the web.</Note> : null}
            {tracksExpiry(rowOf(line)) ? <Field label="Expires on" help="Shows in Damaged & expired › Expiry"><TextInput type="date" value={exp[open] || ''} onChange={(v) => setExp((e) => e.map((x, k) => (k === open ? v : x)))} /></Field> : null}
          </div>
        ) : null}
      </Sheet>
      <ScanSheet open={scan} onClose={() => setScan(false)} onCode={(c) => addScan(c)} title="Scan what arrived" hint="Each scan adds one; a carton adds its pieces." />
    </AppScreen>
  );
}
