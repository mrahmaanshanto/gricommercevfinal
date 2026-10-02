'use client';
// ReceiveGoods — scan a supplier delivery against a purchase order and add it to stock.
//   Order chosen -> scan the items -> save and update stock.
// - /receive-goods?po=<no> opens an order made in this browser (src/lib/purchaseOrders.js); otherwise
//   the demo order PO-2609-0020.
// - "Receiving at" is where the stock goes. Saving adds a stock move per product (received − reported).
// - More than still coming: keep the extra (it is received) or return it to the supplier.
// - A barcode that is not on the order: add it to the order, or set it aside (not added to stock).
// - Damaged or wrong items are reported; they are held at Returns & damaged (stock holds), and the
//   report is kept in this browser (gc.receive.reports). Wrong items go back from Supplier return.
// - Saving also adds the supplier's bill for the delivery (src/lib/supplierBills.js): accepted pieces ×
//   order price + extra costs, due after the supplier's credit terms.
// Front end only.

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Dialog, PhoneActionBar, useIsPhone, InfoTip, StatusBadge } from '@/components/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { formatBDT, formatDate } from '@/lib/format';
import { DAMAGED_PLACE, getReceivingPlaces, placeName } from '@/lib/locations';
import { usePlaceList } from '@/lib/usePlaces';
import { productBy, addMove } from '@/lib/stock';
import { addHolds, closeHold } from '@/lib/stockHolds';
import { getPOs, getPO, updatePO, unitCost, lineCost, PO_STATUS_TONE } from '@/lib/purchaseOrders';
import { addBill, findSupplier } from '@/lib/supplierBills';

const ASKS = ['Send replacements', 'Give a credit note', 'Refund the money', 'Take the items back'];
const REPORT_KEY = 'gc.receive.reports';
const RECEIVERS = ['Karim (store)', 'Rafi Ahmed', 'Sadia Akter'];
const DEMO = {
  no: 'PO-2609-0020', supplier: 'Nabil Fashion House', place: 'Central Warehouse', status: 'Partly received', stored: false,
  lines: [
    { name: 'Men’s Polo Shirt · Navy · M', code: '8941200100118', pending: 20 },
    { name: 'Men’s Polo Shirt · Navy · L', code: '8941200100125', pending: 20 },
    { name: 'Denim Jeans · Blue · 32', code: '8941200200214', pending: 10 },
    { name: 'Denim Jeans · Blue · 34', code: '8941200200221', pending: 10 },
    { name: 'Cotton T-shirt · Black · M', code: '8941200300317', pending: 40 },
  ],
};
const DEMO_GOT = [12, 12, 6, 4, 0];
const DEMO_COSTS = [{ label: 'Transport (van from supplier)', amt: 1200, hint: 'From order' }, { label: 'Labour / unloading', amt: 300, hint: '' }];
// barcodes that turn up in a delivery without being on the order
const STRAYS = ['8941100500112', '8941300900014'];
const KNOWN = { '8941100500112': 'Aloe Vera Soothing Gel 300ml', '8941300900014': 'Shipping box · Medium' };
const nameOf = (code) => productBy(code)?.name || KNOWN[code] || '';
const sum = (list) => list.reduce((a, b) => a + (b || 0), 0);
const plural = (n, word) => `${n} ${word}${n === 1 ? '' : 's'}`;

function orderFrom(no) {
  const po = no && no !== DEMO.no ? getPO(no) : null;
  if (!po) return DEMO;
  return { no: po.no, supplier: po.supplier, place: po.place, status: po.status, stored: true, lines: po.lines.map((l) => ({ name: l.name, code: l.code, cost: l.cost, pending: Math.max(0, l.qty - (l.received || 0)) })) };
}

const CSS = `
.rg-id{font-family:var(--font-data)}
.rg-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.rg-body{display:flex;flex-direction:column;gap:var(--space-3)}
.rg-h{display:inline-flex;align-items:center;gap:var(--space-2);flex-wrap:wrap}
.rg-scan{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.rg-scan__field{position:relative;flex:1 1 220px;min-width:0}
.rg-scan__field>svg{position:absolute;left:10px;top:50%;transform:translateY(-50%);color:var(--primary);pointer-events:none}
.rg-scan__field>input{padding-left:34px;border-color:var(--primary)}
.rg-count{font-size:var(--text-xs-plus);color:var(--text-muted);white-space:nowrap}
.rg-count b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.rg-msg{display:flex;align-items:center;gap:var(--space-2);padding:6px 10px;border-radius:var(--radius-lg);background:var(--fill-success-soft);color:var(--text-success);font-size:var(--text-xs-plus);font-weight:var(--weight-medium)}
.rg-stray{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3);border:1px solid var(--fill-warning);border-radius:var(--radius-lg);background:var(--fill-warning-soft)}
.rg-stray__head{display:flex;gap:var(--space-2);align-items:flex-start;color:var(--text-warning)}
.rg-stray__head>svg{flex:none;margin-top:2px}
.rg-stray__head b{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold)}
.rg-stray__head span{font-size:var(--text-xs);color:var(--text-body)}
.rg-stray__acts{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-2)}
.rg-stray__note{flex:1 1 220px}
.rg-tw{overflow-x:auto}
.rg-tw .ix-table tbody tr{cursor:default}
.rg-tw .ix-table tbody tr:hover td{background:none}
.rg-tw .ix-table td:first-child{white-space:normal;min-width:180px}
.rg-stepper{display:inline-flex;align-items:center;gap:2px}
.rg-stepper b{min-width:32px;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading);text-align:center}
.rg-check{display:flex;flex-direction:column;align-items:flex-start;gap:6px}
.rg-check .gc-seg{flex-wrap:wrap;gap:var(--space-1)}
.rg-check .gc-seg__btn{height:28px;padding:0 var(--space-2);border:1px solid var(--border-subtle);font-size:var(--text-xs-plus)}
.rg-check .gc-seg__btn--active{border-color:var(--primary)}
.rg-flash td{animation:rgFlash 900ms ease-out}
@keyframes rgFlash{from{background:var(--fill-success-soft)}to{background:transparent}}
.rg-costs{display:flex;flex-direction:column;gap:var(--space-2)}
.rg-cost{display:grid;grid-template-columns:minmax(0,1fr) 140px 32px;gap:var(--space-2);align-items:center}
.rg-cost__amt{position:relative}
.rg-cost__amt>span{position:absolute;left:10px;top:50%;transform:translateY(-50%);font-size:var(--text-sm);color:var(--text-muted)}
.rg-cost__amt>input{padding-left:26px}
.rg-list{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.rg-list li{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm)}
.rg-list li>span{flex:1;min-width:0}
.rg-list li>svg{flex:none;color:var(--text-muted)}
.rg-field{display:flex;flex-direction:column;gap:6px}
.rg-inwrap{position:relative}
.rg-inwrap>input{padding-right:40px}
.rg-inwrap>.ix-btn{position:absolute;right:2px;top:50%;transform:translateY(-50%)}
.rg-box{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border-radius:var(--radius-lg);font-size:var(--text-xs)}
.rg-box b{font-size:var(--text-sm);font-weight:var(--weight-medium)}
.rg-box--warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.rg-box--info{background:var(--surface-subtle);color:var(--text-body)}
.rg-box__acts{display:flex;flex-wrap:wrap;gap:6px;margin-top:4px}
.rg-rule{height:1px;background:var(--border-subtle)}
.rg-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.rg-done ul{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:var(--text-sm);color:var(--text-body)}
.rg-done li{display:flex;gap:var(--space-2)}
.rg-done li>svg{flex:none;margin-top:2px}
.rg-grn{align-self:center;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);text-align:center}
.rg-grn svg{display:block}
.rg-ok{color:var(--text-success)}
.rg-bad{color:var(--text-danger)}
.rg-warnc{color:var(--text-warning)}
.rg-pri{color:var(--primary)}
.rg-pick{display:flex;flex-direction:column;gap:var(--space-2)}
.rg-pick button{display:flex;align-items:center;gap:var(--space-3);width:100%;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-body);text-align:left;cursor:pointer}
.rg-pick button:hover{border-color:var(--primary)}
.rg-pick button[aria-current="true"]{border-color:var(--primary);background:var(--fill-primary-soft)}
.rg-pick button>span{flex:1;min-width:0}
.rg-pick button>svg{flex:none;color:var(--primary)}
.rg-form{display:flex;flex-direction:column;gap:var(--space-4)}
.rg-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.rg-qty{width:72px}
@media (max-width:640px){.rg-cost{grid-template-columns:minmax(0,1fr) 110px 36px}.rg-two{grid-template-columns:minmax(0,1fr)}}
@media (prefers-reduced-motion:reduce){.rg-flash td{animation:none}}
`;

// a simple printed barcode for the goods received note
const BARS = [2, 1, 1, 3, 2, 1, 3, 2, 2, 2, 1, 1, 2, 1, 2, 1, 3, 1, 2, 1, 1, 2, 1, 1, 3, 2, 1, 2, 3, 2, 1, 1, 1, 1, 1, 2, 1, 1, 1, 3, 2, 3, 1, 1, 1, 2, 1];
function Barcode() {
  let x = 0;
  return (
    <svg width="160" height="34" viewBox="0 0 160 34" aria-hidden="true">
      {BARS.map((w, i) => { const r = <rect key={i} x={x} y="0" width={w} height="34" fill="currentColor" />; x += w + (i % 3 === 0 ? 2 : 1.4); return i % 2 === 0 ? r : null; })}
    </svg>
  );
}

export default function ReceiveGoods() {
  const phone = useIsPhone();
  const [order, setOrder] = useState(DEMO);
  const [got, setGot] = useState(DEMO_GOT);
  const [extra, setExtra] = useState({});        // line index -> 'return' (default keeps the extra)
  const [place, setPlace] = useState(DEMO.place);
  const places = usePlaceList('receiving');   // live places that can receive deliveries (built-in list first)
  const [n, setN] = useState(0);                 // scans so far (drives the simulation)
  const [flash, setFlash] = useState(null);
  const [msg, setMsg] = useState('');
  const [code, setCode] = useState('');
  const [stray, setStray] = useState(null);      // { code, name, note } barcode not on this order
  const [aside, setAside] = useState([]);        // [{ code, name, qty, note }]
  const [costs, setCosts] = useState(DEMO_COSTS);
  const [challan, setChallan] = useState('NF-2231-B');
  const [photo, setPhoto] = useState(false);
  const [by, setBy] = useState(RECEIVERS[0]);
  const [rep, setRep] = useState(null);          // report being edited
  const [report, setReport] = useState(null);    // saved report
  const [done, setDone] = useState(null);        // summary after saving
  const [picking, setPicking] = useState(false);
  const timer = useRef(null);

  const load = (no) => {
    const o = orderFrom(no);
    setOrder(o); setGot(o === DEMO ? DEMO_GOT.slice() : o.lines.map(() => 0)); setExtra({});
    setPlace(getReceivingPlaces().includes(placeName(o.place)) ? placeName(o.place) : 'Central Warehouse');
    setN(0); setFlash(null); setMsg(''); setCode(''); setStray(null); setAside([]);
    setCosts(o === DEMO ? DEMO_COSTS : [{ label: 'Transport (van from supplier)', amt: 0, hint: '' }]);
    setChallan(o === DEMO ? 'NF-2231-B' : ''); setPhoto(false); setRep(null); setReport(null); setDone(null);
    return o;
  };
  useEffect(() => {
    load(new URLSearchParams(window.location.search).get('po'));
    return () => clearTimeout(timer.current);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // ---- per line: what arrived, what is kept, what goes back, what goes to stock
  const rows = order.lines.map((l, i) => {
    const g = got[i] || 0, over = l.added ? 0 : Math.max(0, g - l.pending);
    const returned = extra[i] === 'return' ? over : 0;
    const dmg = Math.min(report ? report.dmg[i] || 0 : 0, g);
    const wrong = Math.min(report ? report.wrong[i] || 0 : 0, g - dmg);
    let state;
    if (l.added) state = ['Added to order', 'primary'];
    else if (g === 0) state = ['Not scanned', 'slate'];
    else if (g < l.pending) state = [`${l.pending - g} short`, 'warning'];
    else if (g === l.pending) state = ['All here', 'success'];
    else state = [`${over} extra`, 'error'];
    return { ...l, i, got: g, over, returned, dmg, wrong, toStock: Math.max(0, g - returned - dmg - wrong), state };
  });
  const total = sum(got);
  const pend = sum(order.lines.filter((l) => !l.added).map((l) => l.pending));
  const toStock = sum(rows.map((r) => r.toStock));
  const goingBack = rows.filter((r) => r.returned);
  const shortBy = Math.max(0, pend - sum(rows.filter((r) => !r.added).map((r) => Math.min(r.got, r.pending))));
  const ctot = sum(costs.map((c) => +c.amt || 0));
  const kept = total - sum(goingBack.map((r) => r.returned));
  const nd = report ? sum(rows.map((r) => r.dmg)) : 0, nw = report ? sum(rows.map((r) => r.wrong)) : 0;

  // ---- scanning
  const bump = (i, lines = order.lines) => {
    setGot((g) => { const x = g.slice(); x[i] = (x[i] || 0) + 1; return x; });
    setFlash(i); setMsg('Beep · +1 ' + lines[i].name);
    clearTimeout(timer.current); timer.current = setTimeout(() => setFlash(null), 900);
  };
  const handleCode = (raw) => {
    const c = String(raw).trim();
    if (!c) return;
    const known = nameOf(c);
    const i = order.lines.findIndex((l) => l.code === c || (known && l.name === known));
    if (i >= 0) { bump(i); return; }
    setMsg(''); setStray({ code: c, name: known, note: `Not on ${order.no} · ask the manager` });
  };
  const scan = () => {
    const base = order.lines.map((l, i) => (l.added ? -1 : i)).filter((i) => i >= 0);
    setN(n + 1);
    if (n % 6 === 5) { handleCode(STRAYS[Math.floor(n / 6) % STRAYS.length]); return; }
    const seq = order === DEMO ? [4, 0, 1, 2, 3, 4] : base;
    bump(seq[n % seq.length]);
  };
  const onCodeKey = (e) => { if (e.key === 'Enter') { e.preventDefault(); handleCode(code); setCode(''); } };
  const change = (i, by1) => setGot((g) => { const x = g.slice(); x[i] = Math.max(0, (x[i] || 0) + by1); return x; });

  // ---- a barcode that is not on the order
  const addStray = () => {
    const name = stray.name || `Item ${stray.code}`;
    const lines = [...order.lines, { name, code: stray.code, pending: 0, added: true }];
    setOrder({ ...order, lines }); setGot([...got, 1]);
    setStray(null); setMsg(`Beep · +1 ${name} · added to ${order.no}`);
    toast(`${name} added to ${order.no} with 1 received`);
  };
  const setStrayAside = () => {
    const name = stray.name || 'Unknown item';
    const same = aside.find((a) => a.code === stray.code);
    setAside(same ? aside.map((a) => (a === same ? { ...a, qty: a.qty + 1, note: stray.note.trim() || a.note } : a)) : [...aside, { code: stray.code, name, qty: 1, note: stray.note.trim() }]);
    setStray(null);
    toast(`${name} set aside · not added to stock`);
  };

  // ---- extra costs
  const setCost = (i, patch) => setCosts(costs.map((c, k) => (k === i ? { ...c, ...patch } : c)));

  // ---- damaged or wrong items
  const openReport = () => {
    const z = order.lines.map(() => 0);
    setRep(report
      ? { dmg: z.map((_, i) => report.dmg[i] || 0), wrong: z.map((_, i) => report.wrong[i] || 0), ask: report.ask, note: report.note, photo: report.photo }
      : { dmg: z, wrong: z.slice(), ask: ASKS[0], note: '', photo: false });
  };
  const setRepCount = (k, i, v) => {
    const d = { ...rep, [k]: rep[k].slice() };
    const g = got[i] || 0;
    d[k][i] = Math.max(0, Math.min(g, Math.round(+v || 0)));
    const other = k === 'dmg' ? 'wrong' : 'dmg';
    if (d.dmg[i] + d.wrong[i] > g) { d[other] = d[other].slice(); d[other][i] = g - d[k][i]; }
    setRep(d);
  };
  const saveReport = (e) => {
    e.preventDefault();
    const rd = sum(rep.dmg), rw = sum(rep.wrong);
    if (!rd && !rw) { toast('Enter how many pieces are damaged or wrong', { tone: 'error' }); return; }
    // hold the reported pieces at Returns & damaged; when a count changes, the old hold ends and a new one starts
    let holds = report ? report.holds.slice() : [];
    order.lines.forEach((l, i) => {
      [['dmg', 'Arrived damaged · ' + order.no], ['wrong', 'Wrong item · return to ' + order.supplier]].forEach(([k, note]) => {
        const before = report ? report[k][i] || 0 : 0, now = rep[k][i] || 0;
        if (before === now) return;
        holds.filter((h) => h.i === i && h.k === k).forEach((h) => closeHold(h.id, 'released', 'Report changed'));
        holds = holds.filter((h) => !(h.i === i && h.k === k));
        if (now) holds.push({ i, k, id: addHolds({ type: 'damaged', place: DAMAGED_PLACE, ref: order.no, who: order.supplier, note, by: by.replace(/ \(.*\)$/, '') }, [{ name: l.name, qty: now }])[0].id });
      });
    });
    const rec = {
      id: report ? report.id : 'RPT-' + String(Date.now()).slice(-5), po: order.no, supplier: order.supplier, at: Date.now(),
      dmg: rep.dmg, wrong: rep.wrong, ask: rep.ask, note: rep.note, photo: rep.photo, nd: rd, nw: rw, holds,
      items: order.lines.map((l, i) => (rep.dmg[i] || rep.wrong[i] ? l.name + ': ' + [rep.dmg[i] ? rep.dmg[i] + ' damaged' : '', rep.wrong[i] ? rep.wrong[i] + ' wrong' : ''].filter(Boolean).join(', ') : '')).filter(Boolean),
    };
    try { const all = JSON.parse(window.localStorage.getItem(REPORT_KEY)) || []; window.localStorage.setItem(REPORT_KEY, JSON.stringify([rec, ...all.filter((x) => x.po !== rec.po)])); } catch { /* ignore */ }
    setReport(rec); setRep(null);
    toast(`Report ${rec.id} saved · ${rd} damaged, ${rw} wrong · kept at ${DAMAGED_PLACE}`);
  };
  const removeReport = async () => {
    const ok = await confirmDialog({ title: 'Remove this report?', body: `The ${plural(report.nd + report.nw, 'piece')} held at ${DAMAGED_PLACE} are released and counted as good stock again.`, confirmLabel: 'Remove report', tone: 'danger' });
    if (!ok) return;
    report.holds.forEach((h) => closeHold(h.id, 'released', 'Report removed'));
    try { const all = JSON.parse(window.localStorage.getItem(REPORT_KEY)) || []; window.localStorage.setItem(REPORT_KEY, JSON.stringify(all.filter((x) => x.po !== report.po))); } catch { /* ignore */ }
    setReport(null); toast('Report removed');
  };

  // ---- save the delivery
  const save = () => {
    if (!total) { toast('Scan at least one item first', { tone: 'error' }); return; }
    const grn = 'GRN-' + String(121 + getPOs().reduce((a, p) => a + (p.deliveries || []).length, 0)).padStart(4, '0');
    const who = by.replace(/ \(.*\)$/, '');
    rows.forEach((r) => {
      const sku = productBy(r.name)?.sku || r.code;
      if (r.toStock) addMove({ sku, place, qty: r.toStock, kind: 'receive', reason: 'Received from ' + order.supplier, by: who, ref: order.no });
      // reported pieces are in the building too, at the damaged bay, and held there
      if (r.dmg + r.wrong) addMove({ sku, place: DAMAGED_PLACE, qty: r.dmg + r.wrong, kind: 'receive', reason: 'Damaged or wrong on arrival', by: who, ref: order.no });
    });
    if (order.stored) {
      updatePO(order.no, (p) => {
        const lines = p.lines.map((l, i) => ({ ...l, received: (l.received || 0) + (rows[i] ? rows[i].toStock : 0) }));
        rows.slice(p.lines.length).forEach((r) => lines.push({ name: r.name, code: r.code, sku: productBy(r.name)?.sku || '', qty: r.toStock, cost: unitCost(r.name), received: r.toStock }));
        return { lines, status: lines.every((l) => l.received >= l.qty) ? 'Received' : 'Partly received', deliveries: [{ grn, at: Date.now(), qty: toStock, place, by: who }, ...(p.deliveries || [])] };
      });
    }
    // the supplier's bill for this delivery: what was accepted at the order's price, plus the extra costs
    const billLines = rows.filter((r) => r.toStock).map((r) => ({ name: r.name, qty: r.toStock, cost: r.cost || lineCost(order.no, r.name) }));
    const value = billLines.reduce((a, l) => a + l.qty * l.cost, 0) + ctot;
    const bill = value ? addBill({
      supplier: order.supplier, po: order.no, grn, ref: challan.trim(), amount: value, lines: billLines,
      extra: ctot, notes: costs.filter((c) => +c.amt).map((c) => `${c.label || 'Extra cost'} ${formatBDT(+c.amt)}`).join(' · '),
    }) : null;
    const sup = bill ? findSupplier(bill.supplier) : null;
    setDone({ grn, place, toStock, nd, nw, back: goingBack.map((r) => ({ name: r.name, qty: r.returned })), aside: aside.slice(), ctot, short: shortBy, bill, supId: sup ? sup.id : '' });
    setStray(null);
    toast(`${plural(toStock, 'piece')} added to ${place} stock`);
  };

  const pick = (no) => {
    load(no);
    try { const u = new URL(window.location.href); if (no === DEMO.no) u.searchParams.delete('po'); else u.searchParams.set('po', no); window.history.replaceState(window.history.state, '', u.pathname + u.search); } catch { /* ignore */ }
    setPicking(false);
  };
  const choices = [...getPOs().filter((p) => p.status !== 'Received'), null];

  const pct = pend ? Math.min(100, Math.round((total / pend) * 100)) : 100;

  return (
    <div className="dc-screen ds" data-screen="ReceiveGoods">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="po-receive" />
        <main className="gc-shell__main">
          <Topbar crumb="Purchase" page="Receive goods" placeholder="Search or scan any barcode" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="scan-barcode" title="Receive goods" about="Scan what the supplier delivered. Saving adds it to stock where you receive it."
                more={[{ label: 'Purchase orders', href: '/purchase-orders' }, { label: 'Return to supplier', href: '/supplier-return' }, { label: 'See in stock holds', href: '/stock-holds?tab=damaged' }]} />

              <div className="ix-record">
                <div className="ix-main">
                  <section className="ix-card" aria-labelledby="rg-order">
                    <div className="ix-card__head">
                      <h2 id="rg-order" className="rg-h"><span className="rg-id">{order.no}</span><StatusBadge tone={PO_STATUS_TONE[order.status] || 'warning'}>{order.status}</StatusBadge></h2>
                      <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPicking(true)}>Choose another order</button>
                    </div>
                    <div className="ix-card__body"><span className="ix-muted">{order.supplier} · deliver to {order.place} · {plural(pend, 'piece')} still coming</span></div>
                  </section>

                  <section className="ix-card" aria-labelledby="rg-scan">
                    <div className="ix-card__head">
                      <h2 id="rg-scan">Scan each item as you unpack it <InfoTip text="Each scan adds one piece. Use + and − for more." /></h2>
                      <span className="rg-count"><b>{total}</b> of {pend} pieces still coming</span>
                    </div>
                    <div className="ix-card__body rg-body">
                      <div className="gc-progress" role="progressbar" aria-label="Pieces scanned" aria-valuenow={pct} aria-valuemin={0} aria-valuemax={100}><div className="gc-progress__fill" style={{ width: pct + '%' }} /></div>
                      <div className="rg-scan">
                        <label className="rg-scan__field">
                          <Icon name="scan-barcode" width="16" height="16" aria-hidden="true" />
                          <input className="gc-input" type="text" inputMode="numeric" placeholder={phone ? 'Scan or type a barcode' : 'Ready · scan or type a barcode and press Enter'} aria-label="Scan a barcode" value={code} disabled={!!done} onChange={(e) => setCode(e.target.value)} onKeyDown={onCodeKey} />
                        </label>
                        <button type="button" className="ix-btn" onClick={scan} disabled={!!done}><Icon name="camera" width="16" height="16" aria-hidden="true" /><span>Scan with camera</span></button>
                      </div>
                      {msg && !stray ? <div className="rg-msg" role="status"><Icon name="scan-barcode" width="16" height="16" aria-hidden="true" /><span>{msg}</span></div> : null}
                      {stray ? (
                        <div className="rg-stray" role="alert">
                          <div className="rg-stray__head">
                            <Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />
                            <div><b>Barcode <span className="rg-id">{stray.code}</span> is not on this order</b><span>{stray.name ? `${stray.name}. ` : ''}Add it to {order.no} if the supplier sent it for you, or set it aside and tell the manager.</span></div>
                          </div>
                          <div className="rg-stray__acts">
                            <div className="rg-stray__note"><label className="gc-label" htmlFor="rg-stray-note">Note if you set it aside</label><input id="rg-stray-note" className="gc-input" value={stray.note} onChange={(e) => setStray({ ...stray, note: e.target.value })} /></div>
                            <button type="button" className="ix-btn" onClick={addStray}><Icon name="package-plus" width="16" height="16" aria-hidden="true" /><span>Add to this order</span></button>
                            <button type="button" className="ix-btn" onClick={setStrayAside}><Icon name="archive" width="16" height="16" aria-hidden="true" /><span>Set aside</span></button>
                          </div>
                        </div>
                      ) : null}
                    </div>
                  </section>

                  <section className="ix-card" aria-label="Products on this order">
                    <div className="rg-tw">
                      <table className="ix-table">
                        <caption className="sr-only">Products on {order.no}</caption>
                        <thead><tr><th scope="col">Product</th><th scope="col" className="ix-num">Still coming</th><th scope="col">In this delivery</th><th scope="col">Check</th></tr></thead>
                        <tbody>
                          {rows.map((r) => (
                            <tr key={r.code + r.i} className={flash === r.i ? 'rg-flash' : ''}>
                              <td><span className="ix-strong">{r.name}</span><span className="rg-sub rg-id">{r.code}</span></td>
                              <td className="ix-num">{r.added ? '—' : r.pending}</td>
                              <td>
                                <span className="rg-stepper">
                                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={`One less ${r.name}`} disabled={!!done} onClick={() => change(r.i, -1)}><Icon name="minus" width="16" height="16" aria-hidden="true" /></button>
                                  <b>{r.got}</b>
                                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={`One more ${r.name}`} disabled={!!done} onClick={() => change(r.i, 1)}><Icon name="plus" width="16" height="16" aria-hidden="true" /></button>
                                </span>
                              </td>
                              <td>
                                <div className="rg-check">
                                  <StatusBadge tone={r.state[1]}>{r.state[0]}</StatusBadge>
                                  {r.over ? (
                                    <div className="gc-seg" role="group" aria-label={`What to do with the ${r.over} extra ${r.name}`}>
                                      <button type="button" className={'gc-seg__btn' + (extra[r.i] !== 'return' ? ' gc-seg__btn--active' : '')} aria-pressed={extra[r.i] !== 'return'} disabled={!!done} onClick={() => setExtra({ ...extra, [r.i]: 'keep' })}>Keep the extra</button>
                                      <button type="button" className={'gc-seg__btn' + (extra[r.i] === 'return' ? ' gc-seg__btn--active' : '')} aria-pressed={extra[r.i] === 'return'} disabled={!!done} onClick={() => setExtra({ ...extra, [r.i]: 'return' })}>Return to supplier</button>
                                    </div>
                                  ) : null}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </section>

                  {report && report.nw ? (
                    <section className="ix-card" aria-labelledby="rg-wrong">
                      <div className="ix-card__head"><h2 id="rg-wrong">Wrong items</h2><Link href="/supplier-return">Return to supplier</Link></div>
                      <div className="ix-card__body rg-body">
                        <p className="rg-note" style={{ color: 'var(--text-body)', fontSize: 'var(--text-sm)' }}><b className="ix-strong">{plural(report.nw, 'piece')}</b> kept at {DAMAGED_PLACE}, to go back to {order.supplier}.</p>
                        <ul className="rg-list">{rows.filter((r) => report.wrong[r.i]).map((r) => <li key={r.i}><Icon name="package-x" width="16" height="16" aria-hidden="true" /><span>{report.wrong[r.i]} × {r.name}</span></li>)}</ul>
                        <span className="rg-sub">Asked the supplier to: {report.ask.toLowerCase()}</span>
                      </div>
                    </section>
                  ) : null}

                  {aside.length ? (
                    <section className="ix-card" aria-labelledby="rg-aside">
                      <div className="ix-card__head"><h2 id="rg-aside">Set aside <InfoTip text="Items that are not on this order. They are not added to stock." /></h2></div>
                      <div className="ix-card__body">
                        <ul className="rg-list">
                          {aside.map((a) => (
                            <li key={a.code}>
                              <Icon name="archive" width="16" height="16" aria-hidden="true" />
                              <span><span className="ix-strong">{a.qty} × {a.name}</span><span className="rg-sub"><span className="rg-id">{a.code}</span>{a.note ? ' · ' + a.note : ''}</span></span>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={`Take ${a.name} off the set-aside list`} disabled={!!done} onClick={() => { setAside(aside.filter((x) => x !== a)); toast(`${a.name} taken off the set-aside list`); }}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </section>
                  ) : null}

                  <section className="ix-card" aria-labelledby="rg-costs">
                    <div className="ix-card__head">
                      <h2 id="rg-costs">Extra costs for this delivery <InfoTip text="Transport, labour or anything you paid to bring these goods in. It is added to the real cost of each piece." /></h2>
                      <span className="rg-count"><b>{formatBDT(ctot)}</b> {kept ? `+৳${(ctot / kept).toFixed(2)} per piece` : 'Scan items first'}</span>
                    </div>
                    <div className="ix-card__body rg-costs">
                      {costs.map((c, i) => (
                        <div key={i} className="rg-cost">
                          <input className="gc-input" type="text" value={c.label} onChange={(e) => setCost(i, { label: e.target.value, hint: '' })} aria-label="Cost name" placeholder="What was it for? e.g. Van rent" />
                          <div className="rg-cost__amt"><span>৳</span><input className="gc-input" type="text" inputMode="numeric" value={c.amt} onChange={(e) => { const v = e.target.value.replace(/[^0-9]/g, ''); setCost(i, { amt: v === '' ? 0 : +v }); }} aria-label={`Amount for ${c.label || 'this cost'}`} /></div>
                          <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove this cost" onClick={() => setCosts(costs.filter((_, k) => k !== i))}><Icon name="x" width="16" height="16" aria-hidden="true" /></button>
                        </div>
                      ))}
                      <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={() => setCosts([...costs, { label: '', amt: 0, hint: '' }])}><Icon name="plus" width="16" height="16" aria-hidden="true" /><span>Add another cost</span></button>
                    </div>
                  </section>
                </div>

                <div className="ix-side">
                  {!done ? (
                    <section className="ix-card" aria-labelledby="rg-details">
                      <div className="ix-card__head"><h2 id="rg-details">Delivery details</h2></div>
                      <div className="ix-card__body rg-body">
                        <div className="rg-field">
                          <label className="gc-label" htmlFor="rg-place">Receiving at</label>
                          <select id="rg-place" className="gc-input gc-select" value={place} onChange={(e) => setPlace(e.target.value)}>{places.map((x) => <option key={x}>{x}</option>)}</select>
                          {place !== order.place ? <span className="gc-help">The order said {order.place}.</span> : null}
                        </div>
                        <div className="rg-field">
                          <label className="gc-label" htmlFor="rg-ch">Supplier challan / invoice no.</label>
                          <div className="rg-inwrap">
                            <input id="rg-ch" className="gc-input" type="text" value={challan} onChange={(e) => setChallan(e.target.value)} />
                            <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Scan challan" onClick={() => { const c = challan || 'CH-' + order.no.slice(-4) + '-A'; setChallan(c); toast(`Challan ${c} read`); }}><Icon name="scan-barcode" width="16" height="16" aria-hidden="true" /></button>
                          </div>
                        </div>
                        <div className="rg-field">
                          <span className="gc-label">Photo of challan</span>
                          <button type="button" className="ix-btn" onClick={() => { setPhoto(true); toast('Challan photo attached'); }}><Icon name="camera" width="16" height="16" aria-hidden="true" /><span>{photo ? 'Photo attached · take again' : 'Take photo'}</span></button>
                        </div>
                        <div className="rg-field">
                          <label className="gc-label" htmlFor="rg-by">Received by</label>
                          <select id="rg-by" className="gc-input gc-select" value={by} onChange={(e) => setBy(e.target.value)}>{RECEIVERS.map((x) => <option key={x}>{x}</option>)}</select>
                        </div>
                        {report ? (
                          <div className="rg-box rg-box--warn" role="status">
                            <b>Report {report.id} · {report.nd} damaged, {report.nw} wrong</b>
                            {report.items.map((x) => <span key={x}>{x}</span>)}
                            <span>Kept at {DAMAGED_PLACE}, not for sale.</span>
                            <span>Asked the supplier to: {report.ask.toLowerCase()}{report.photo ? ' · photo attached' : ''}</span>
                            <span className="rg-box__acts">
                              <button type="button" className="ix-btn ix-btn--sm" onClick={() => toast(`Report ${report.id} sent to ${order.supplier} by SMS and email`)}>Send to supplier</button>
                              <button type="button" className="ix-btn ix-btn--sm" onClick={openReport}>Edit</button>
                              <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={removeReport}>Remove</button>
                            </span>
                          </div>
                        ) : (
                          <button type="button" className="ix-btn ix-btn--sm" style={{ alignSelf: 'flex-start' }} onClick={openReport}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" /><span>Report damaged or wrong items</span></button>
                        )}
                        {goingBack.length ? (
                          <div className="rg-box rg-box--info">
                            <b>Going back to {order.supplier}</b>
                            {goingBack.map((r) => <span key={r.i}>{r.returned} extra × {r.name}</span>)}
                          </div>
                        ) : null}
                        <div className="rg-rule" />
                        <p className="rg-note">{plural(toStock, 'piece')} will be added to {place} stock.{shortBy > 0 ? ` ${plural(shortBy, 'piece')} are still missing. You can save now; the order stays “Partly received” until the rest arrive.` : ''}</p>
                        <button type="button" className="gc-btn gc-btn--solid gc-btn--block" onClick={save}><Icon name="check" width="16" height="16" aria-hidden="true" /> Save delivery</button>
                        <PhoneActionBar note={plural(toStock, 'piece') + ' to stock'}><button type="button" className="gc-btn gc-btn--solid" onClick={save}><Icon name="check" width="16" height="16" aria-hidden="true" /> Save delivery</button></PhoneActionBar>
                      </div>
                    </section>
                  ) : (
                    <section className="ix-card rg-done" role="status" aria-labelledby="rg-saved">
                      <div className="ix-card__head"><h2 id="rg-saved" className="rg-h"><Icon name="circle-check" width="16" height="16" aria-hidden="true" className="rg-ok" />Delivery saved</h2></div>
                      <div className="ix-card__body rg-body">
                        <ul>
                          <li><Icon name="package-check" width="16" height="16" aria-hidden="true" className="rg-ok" /><span>{plural(done.toStock, 'piece')} added to {done.place} stock.</span></li>
                          {done.nd + done.nw ? <li><Icon name="package-x" width="16" height="16" aria-hidden="true" className="rg-bad" /><span>{plural(done.nd + done.nw, 'reported piece')} kept at {DAMAGED_PLACE}{done.nw ? `; ${done.nw} wrong to go back to the supplier` : ''}.</span></li> : null}
                          {done.back.map((b) => <li key={b.name}><Icon name="undo-2" width="16" height="16" aria-hidden="true" className="ix-muted" /><span>{b.qty} extra × {b.name} going back to {order.supplier}.</span></li>)}
                          {done.aside.length ? <li><Icon name="archive" width="16" height="16" aria-hidden="true" className="ix-muted" /><span>{plural(sum(done.aside.map((a) => a.qty)), 'item')} set aside, not in stock.</span></li> : null}
                          <li><Icon name="receipt" width="16" height="16" aria-hidden="true" className="ix-muted" /><span>Real cost updated with {formatBDT(done.ctot)} extra costs.</span></li>
                          {done.bill ? <li><Icon name="file-text" width="16" height="16" aria-hidden="true" className="rg-pri" /><span>Bill {done.bill.no} for {formatBDT(done.bill.amount)} added to {order.supplier}’s payables, due {formatDate(done.bill.due)}.</span></li> : null}
                          {done.short ? <li><Icon name="truck" width="16" height="16" aria-hidden="true" className="rg-warnc" /><span>{plural(done.short, 'piece')} still to come.</span></li> : null}
                        </ul>
                        <div className="rg-grn"><Barcode /><div>{done.grn}</div></div>
                        <button type="button" className="gc-btn gc-btn--solid gc-btn--block" onClick={() => toast(`${plural(done.toStock, 'barcode label')} sent to the printer`)}><Icon name="printer" width="16" height="16" aria-hidden="true" /> Print barcode labels ({done.toStock})</button>
                        <button type="button" className="gc-btn gc-btn--neutral gc-btn--block" onClick={() => load(order.no)}>Receive another delivery</button>
                        {done.supId ? <Link href={`/supplier-detail?id=${encodeURIComponent(done.supId)}`} className="gc-btn gc-btn--neutral gc-btn--block">Open supplier ledger</Link> : null}
                        <Link href={`/po-detail?no=${encodeURIComponent(order.no)}`} className="gc-btn gc-btn--neutral gc-btn--block">Back to order</Link>
                      </div>
                    </section>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Dialog open={picking} title="Choose an order to receive" onClose={() => setPicking(false)} width={560}>
        <div className="rg-pick">
          {choices.map((p) => {
            const o = p ? { no: p.no, supplier: p.supplier, place: p.place, status: p.status, coming: sum(p.lines.map((l) => Math.max(0, l.qty - (l.received || 0)))) } : { ...DEMO, coming: sum(DEMO.lines.map((l) => l.pending)) };
            return (
              <button key={o.no} type="button" aria-current={o.no === order.no} onClick={() => pick(o.no)}>
                <Icon name="file-text" width="16" height="16" aria-hidden="true" />
                <span><span className="ix-strong rg-id">{o.no}</span><span className="rg-sub">{o.supplier} · {o.place} · {plural(o.coming, 'piece')} still coming</span></span>
                <StatusBadge tone={PO_STATUS_TONE[o.status] || 'warning'}>{o.status}</StatusBadge>
              </button>
            );
          })}
        </div>
      </Dialog>

      <Dialog open={!!rep} title="Report damaged or wrong items" onClose={() => setRep(null)} width={620}>
        {rep ? (
          <form className="rg-form" onSubmit={saveReport}>
            <p className="gc-help" style={{ margin: 0 }}>{order.no} · {order.supplier}. Count only pieces scanned in this delivery. Reported pieces are kept at {DAMAGED_PLACE} and not added to the stock that can be sold.</p>
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact">
                <thead><tr><th scope="col">Product</th><th scope="col" className="ix-num">Received</th><th scope="col">Damaged</th><th scope="col">Wrong item</th></tr></thead>
                <tbody>
                  {order.lines.map((l, i) => (
                    <tr key={l.code + i}>
                      <td>{l.name}</td>
                      <td className="ix-num">{got[i] || 0}</td>
                      <td><input className="gc-input rg-qty" type="number" min="0" max={got[i] || 0} inputMode="numeric" disabled={!got[i]} aria-label={'Damaged pieces of ' + l.name} value={rep.dmg[i] || 0} onChange={(e) => setRepCount('dmg', i, e.target.value)} /></td>
                      <td><input className="gc-input rg-qty" type="number" min="0" max={got[i] || 0} inputMode="numeric" disabled={!got[i]} aria-label={'Wrong pieces of ' + l.name} value={rep.wrong[i] || 0} onChange={(e) => setRepCount('wrong', i, e.target.value)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="rg-two">
              <div><label className="gc-label" htmlFor="rp-ask">What should the supplier do?</label><select id="rp-ask" className="gc-input gc-select" value={rep.ask} onChange={(e) => setRep({ ...rep, ask: e.target.value })}>{ASKS.map((x) => <option key={x}>{x}</option>)}</select></div>
              <div><span className="gc-label">Photo of the problem</span><button type="button" className="gc-btn gc-btn--neutral gc-btn--block" onClick={() => { setRep({ ...rep, photo: true }); toast('Photo attached to the report'); }}><Icon name="camera" width="16" height="16" aria-hidden="true" />{rep.photo ? 'Photo attached' : 'Take photo'}</button></div>
            </div>
            <div><label className="gc-label" htmlFor="rp-note">What is wrong</label><textarea id="rp-note" className="gc-input" rows="2" placeholder="For example: 3 shirts torn at the seam, 2 jeans are size 36 instead of 34" value={rep.note} onChange={(e) => setRep({ ...rep, note: e.target.value })} /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}>
              <span style={{ marginRight: 'auto', fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>{plural(sum(rep.dmg) + sum(rep.wrong), 'piece')} reported</span>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRep(null)}>Cancel</button>
              <button type="submit" className="gc-btn gc-btn--solid">Save report</button>
            </div>
          </form>
        ) : null}
      </Dialog>
    </div>
  );
}
