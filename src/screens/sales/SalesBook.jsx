'use client';
// Sales book — every counter memo: what sold when, who sold it and how the money came in. Laid out like Shopify's
// lists (components/ui/IndexKit.jsx): the period, five figures for it (sales with a trend line, memos, profit, sold
// on due, returns), then one card with the payment views, search and the "Sold by" filter, and the memo list. A
// memo opens in a side panel (items, totals, print again, return / exchange, edit, send by SMS). Sales by hour
// are in Reports (hour-weekday-heatmap).
// Real sales: counter sales from the POS register (gc.pos.sales) are listed above the demo memos for the chosen
// dates, go through the same payment and staff filters (their cashiers are added to the staff list), open in the
// same panel, and are added to the figures (sales, memos, profit at cost, sold on due, returns).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sidebar, Topbar } from '@/shell/Shell';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, LearnMore, KV } from '@/components/ui/IndexKit';
import { POS_KEYS, load } from '@/lib/posStore';
import { unitCost } from '@/lib/purchaseOrders';
import { formatBDT, formatDate, groupIndian } from '@/lib/format';

// ---- demo memos (the book before this browser's own POS sales) ----------------------------------------
const PR = {
  rice: ['Power bank 20,000 mAh', 1950], oil: ['20W USB-C fast charger', 890], sugar: ['Lightning cable 1 m', 135],
  lentil: ['Micro-USB cable 1 m', 145], salt: ['SIM ejector pin pack', 42], lux: ['Screen cleaning wipes', 65],
  det: ['Shockproof case A15', 180], sham: ['Cleaning spray 100 ml', 240], bisc: ['Tempered glass 2-pack', 60],
  water: ['Cable protector pack', 35], chana: ['USB-C OTG adapter', 85], polo: ['Polo T-shirt', 550],
  cooker: ['Bluetooth speaker Mini', 3200], blender: ['Blender', 2850],
};
const CU = { walk: ['Walk-in customer', ''], karim: ['Karim Saheb', '01711-234567'], rafiq: ['Rafiq Mia', '01819-445566'], nasrin: ['Nasrin Akter', '01912-778899'], salma: ['Salma Begum', '01556-112233'], jamal: ['Jamal Telecom', '01713-908070'], habib: ['Habib Telecom', '01819-300400'] };
const ST = { rina: 'Rina', babu: 'Babu', sumon: 'Sumon', owner: 'Mostafiz' };
// payment: label, badge tone, badge icon
const PAY = { cash: ['Cash', 'success', 'banknote'], bkash: ['bKash', 'info', 'smartphone'], nagad: ['Nagad', 'info', 'smartphone'], card: ['Card', 'neutral', 'credit-card'], due: ['Due', 'error', 'circle-alert'], other: ['', 'neutral', 'wallet'] };
// [memo no, hour, minute, customer, payment, staff, [[product, qty]…]]
const SETS = {
  today: [
    [1042, 10, 42, 'rafiq', 'cash', 'rina', [['rice', 1], ['sugar', 2], ['lentil', 1], ['chana', 1]]],
    [1041, 10, 35, 'walk', 'bkash', 'babu', [['sham', 1], ['lux', 4], ['det', 2]]],
    [1040, 10, 21, 'karim', 'due', 'sumon', [['rice', 1], ['oil', 2], ['sugar', 5], ['lentil', 5], ['water', 2]]],
    [1039, 10, 8, 'nasrin', 'nagad', 'rina', [['oil', 1], ['det', 1], ['lentil', 1], ['bisc', 1], ['lux', 1]]],
    [1038, 9, 55, 'walk', 'cash', 'babu', [['det', 1], ['lux', 1], ['bisc', 1], ['chana', 1]]],
    [1037, 9, 48, 'salma', 'card', 'owner', [['cooker', 1]]],
    [1036, 9, 31, 'habib', 'bkash', 'sumon', [['rice', 2]]],
    [1035, 9, 12, 'walk', 'cash', 'rina', [['sugar', 1], ['salt', 1]]],
    [1034, 8, 56, 'jamal', 'cash', 'sumon', [['oil', 10]]],
    [1033, 8, 40, 'walk', 'nagad', 'babu', [['bisc', 5]]],
  ],
  yday: [
    [980, 21, 10, 'walk', 'cash', 'rina', [['water', 2], ['bisc', 2], ['chana', 1]]],
    [979, 20, 44, 'salma', 'bkash', 'babu', [['sham', 1], ['oil', 1], ['bisc', 1], ['salt', 1]]],
    [975, 20, 5, 'jamal', 'due', 'sumon', [['rice', 2]]],
    [968, 18, 30, 'rafiq', 'cash', 'rina', [['polo', 2]]],
    [951, 15, 15, 'walk', 'nagad', 'babu', [['blender', 1]]],
    [947, 14, 2, 'habib', 'card', 'owner', [['oil', 4]]],
    [940, 12, 20, 'nasrin', 'cash', 'owner', [['lentil', 2], ['sugar', 2], ['salt', 1], ['lux', 2]]],
    [933, 10, 5, 'walk', 'bkash', 'rina', [['det', 1], ['sham', 1]]],
  ],
  sep15: [
    [596, 20, 50, 'habib', 'due', 'sumon', [['rice', 4], ['oil', 4]]],
    [594, 20, 12, 'walk', 'cash', 'rina', [['sugar', 2], ['det', 1]]],
    [590, 19, 2, 'karim', 'due', 'sumon', [['rice', 1], ['oil', 1], ['lentil', 3]]],
    [583, 17, 40, 'salma', 'bkash', 'babu', [['cooker', 1]]],
    [577, 15, 5, 'walk', 'card', 'owner', [['blender', 1]]],
    [569, 13, 10, 'nasrin', 'nagad', 'rina', [['sham', 1], ['lux', 3]]],
    [561, 11, 30, 'rafiq', 'cash', 'rina', [['rice', 1], ['chana', 2]]],
    [552, 9, 40, 'jamal', 'cash', 'sumon', [['oil', 6]]],
  ],
};
const ALL_SETS = [...SETS.today, ...SETS.yday, ...SETS.sep15];
const HOURS = { today: [1200, 2850, 4100, 3600, 2900, 2100, 1800, 2600, 3400, 4300, 5200, 6100, 5300, 3200], yday: [900, 2400, 3600, 3300, 2500, 1900, 1700, 2300, 3100, 4000, 4700, 5400, 4600, 3000] };
const MONTH = [46550, 48300, 38250, 47300, 52550, 37250, 50050, 38500, 39000, 37250, 43250, 48300, 43250, 40750, 49450, 42200, 43800, 45400, 41650, 39800, 55300, 50000, 38200, 41500, 52800, 44100, 39600, 43400, 48650];
const R = {
  today: { sales: 48650, memos: 62, profit: 9820, due: 5200, dueN: 1, ret: 1130, retN: 3, lbl: 'today', note: 'Tuesday, 29 September', set: 'today', pre: '' },
  yday: { sales: 43400, memos: 55, profit: 8650, due: 3900, dueN: 1, ret: 450, retN: 1, lbl: 'yesterday', note: 'Monday, 28 September', set: 'yday', pre: '' },
  week: { sales: 308250, memos: 402, profit: 61400, due: 28600, dueN: 14, ret: 4380, retN: 9, lbl: 'this week', note: '23 – 29 September', set: 'today', pre: '29 Sep · ' },
  month: { sales: 1286400, memos: 1688, profit: 254800, due: 112300, dueN: 51, ret: 15920, retN: 31, lbl: 'this month', note: '1 – 29 September', set: 'today', pre: '29 Sep · ' },
  custom: { sales: 660000, memos: 865, profit: 131000, due: 51200, dueN: 22, ret: 8150, retN: 16, lbl: 'chosen dates', note: '1 – 15 September', set: 'sep15', pre: '15 Sep · ' },
};
const RANGES = [['today', 'Today'], ['yday', 'Yesterday'], ['week', 'This week'], ['month', 'This month'], ['custom', 'Pick dates']];
const PAY_TABS = [['all', 'All'], ['cash', 'Cash'], ['bkash', 'bKash'], ['nagad', 'Nagad'], ['card', 'Card'], ['due', 'Due']];
const STAFF = [['rina', 'Rina'], ['babu', 'Babu'], ['sumon', 'Sumon'], ['owner', 'Mostafiz']];
const DAYMS = 86400000;

const money = (n) => (n < 0 ? '−' : '') + formatBDT(Math.round(Math.abs(n)));
const tm = (h, m) => (h > 12 ? h - 12 : h) + ':' + (m < 10 ? '0' : '') + m + (h < 12 ? ' am' : ' pm');
const memoTotal = (m) => m[6].reduce((n, x) => n + PR[x[0]][1] * x[1], 0);
const whenOf = (m) => ({ today: 'Today, 29 Sep', yday: 'Yesterday, 28 Sep', sep15: '15 Sep' }[SETS.today.includes(m) ? 'today' : SETS.yday.includes(m) ? 'yday' : 'sep15']) + ' · ' + tm(m[1], m[2]);
const parseD = (txt) => { const mm = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/.exec(String(txt || '').trim()); return mm ? new Date(+mm[3], +mm[2] - 1, +mm[1]).getTime() : null; };
// a POS sale's payment: its biggest tender, or Due when something is still owed
const tenders = (x) => (x.tenders || []).filter((tn) => tn.amount > 0);
function payKey(x) {
  if (x.due > 0) return 'due';
  const ts = tenders(x).slice().sort((a, b) => b.amount - a.amount);
  const mth = ts.length ? String(ts[0].method).toLowerCase() : 'cash';
  return mth === 'bkash' ? 'bkash' : mth === 'nagad' || mth === 'rocket' ? 'nagad' : mth === 'card' ? 'card' : mth === 'cash' ? 'cash' : 'other';
}
function payLabel(x) {
  const ms = tenders(x).map((tn) => tn.method).filter((mth, j, a) => a.indexOf(mth) === j);
  if (x.due > 0) return ms.length ? 'Part due' : PAY.due[0];
  return ms.length ? ms.join(' + ') : PAY.cash[0];
}
const costOf = (x) => (x.lines || []).reduce((a, l) => a + unitCost(l.name) * l.qty, 0);
const custOf = (x) => (x.customer && x.customer.name) || CU.walk[0];

const CSS = `
.sb-period{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.sb-period label{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-body)}
.sb-date{width:116px;height:32px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading)}
.sb-date:focus-visible{outline:2px solid var(--primary);outline-offset:2px}
.sb-note{font-size:var(--text-sm);color:var(--text-muted)}
.sb-no{padding:0;border:0;background:none;font:inherit;font-family:var(--font-data);cursor:pointer}
.sb-pbtn{width:100%;border:0;background:none;font:inherit;text-align:left;cursor:pointer}
.sb-lines{display:flex;flex-direction:column;margin-top:4px}
.sb-line{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;padding:6px 0;border-bottom:1px solid var(--border-subtle);font-size:var(--text-sm)}
.sb-line>span:first-child{display:flex;flex-direction:column;min-width:0}
.sb-line b{font-weight:var(--weight-medium);color:var(--text-heading)}
.sb-line small{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.sb-line>span:last-child{flex:none;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
.sb-sum{display:grid;grid-template-columns:1fr auto;gap:6px var(--space-3);margin:0;font-size:var(--text-sm);font-variant-numeric:tabular-nums}
.sb-sum dt{color:var(--text-body)}
.sb-sum dd{margin:0;text-align:right;color:var(--text-heading)}
.sb-sum .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold)}
.sb-sum .is-due{font-weight:var(--weight-semibold);color:var(--text-danger)}
.sb-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
@media (max-width:640px){.sb-period label{flex:1 1 40%}.sb-date{flex:1;width:auto;height:36px}}
`;

export default function SalesBook() {
  const [pos, setPos] = useState([]);
  const [rng, setRng] = useState('today');
  const [payF, setPayF] = useState('all');
  const [stF, setStF] = useState('all');
  const [fromTxt, setFromTxt] = useState('01/09/2026');
  const [toTxt, setToTxt] = useState('15/09/2026');
  const [find, setFind] = useState(false);
  const [q, setQ] = useState('');
  const [sel, setSel] = useState(0);   // a demo memo no, or 'pos:<id>' for a sale from this browser

  useEffect(() => { setPos(load(POS_KEYS.sales, [])); }, []);

  // ---- the period: demo figures plus this browser's POS sales in it --------------------------------
  const base = R[rng];
  const d0 = new Date(); d0.setHours(0, 0, 0, 0); const today0 = d0.getTime();
  const inRange = (at) => {
    if (rng === 'today') return at >= today0;
    if (rng === 'yday') return at >= today0 - DAYMS && at < today0;
    if (rng === 'week') return at >= today0 - 6 * DAYMS;
    if (rng === 'month') { const m0 = new Date(today0); m0.setDate(1); return at >= m0.getTime(); }
    const f = parseD(fromTxt), t = parseD(toTxt);
    return f != null && t != null && at >= f && at < t + DAYMS;
  };
  const liveAll = pos.filter((x) => inRange(x.at)).sort((a, b) => b.at - a.at);
  const lv = liveAll.reduce((a, x) => {
    const tot = (x.totals && x.totals.total) || 0;
    const refs = (x.refunds || []).filter((rf) => rf.amount > 0);
    return {
      sales: a.sales + tot, memos: a.memos + 1, profit: a.profit + Math.max(0, tot - costOf(x)),
      due: a.due + Math.max(0, x.due || 0), dueN: a.dueN + (x.due > 0 ? 1 : 0),
      ret: a.ret + refs.reduce((n, rf) => n + rf.amount, 0), retN: a.retN + refs.length,
    };
  }, { sales: 0, memos: 0, profit: 0, due: 0, dueN: 0, ret: 0, retN: 0 });
  const r = { ...base, sales: base.sales + lv.sales, memos: base.memos + lv.memos, profit: base.profit + lv.profit, due: base.due + lv.due, dueN: base.dueN + lv.dueN, ret: base.ret + lv.ret, retN: base.retN + lv.retN };
  // the Sales figure's trend line: by hour for one day, by day for longer periods
  const trend = rng === 'today' || rng === 'yday' ? HOURS[rng] : rng === 'week' ? MONTH.slice(22) : rng === 'month' ? MONTH : MONTH.slice(0, 15);

  // ---- the memos: payment view, staff filter and search ---------------------------------------------
  const needle = q.trim().toLowerCase().replace(/^#/, '');
  const match = (no, cust) => !needle || String(no).toLowerCase().replace(/^#/, '').includes(needle) || String(cust).toLowerCase().includes(needle);
  const live = liveAll.filter((x) => (payF === 'all' || payKey(x) === payF || tenders(x).some((tn) => String(tn.method).toLowerCase() === payF))
    && (stF === 'all' || 'pos:' + x.cashier === stF) && match(x.id, custOf(x))).slice(0, 20);
  const demo = SETS[base.set].filter((m) => (payF === 'all' || m[4] === payF) && (stF === 'all' || m[5] === stF) && match(m[0], CU[m[3]][0])).slice(0, 8);
  const cashiers = pos.map((x) => x.cashier).filter((n, j, a) => n && a.indexOf(n) === j);
  const rows = [
    ...live.map((x) => {
      const n = (x.lines || []).length, k = payKey(x);
      return { key: 'pos:' + x.id, no: x.id, time: (rng === 'today' || rng === 'yday' ? '' : formatDate(x.at).replace(/ \d{4}$/, '') + ' · ') + tm(new Date(x.at).getHours(), new Date(x.at).getMinutes()), cust: custOf(x), items: n + (n === 1 ? ' item' : ' items'), pay: payLabel(x), tone: PAY[k][1], icon: PAY[k][2], amt: money((x.totals && x.totals.total) || 0), staff: x.cashier || '—' };
    }),
    ...demo.map((m) => ({ key: m[0], no: '#' + m[0], time: base.pre + tm(m[1], m[2]), cust: CU[m[3]][0], items: m[6].length + (m[6].length === 1 ? ' item' : ' items'), pay: PAY[m[4]][0], tone: PAY[m[4]][1], icon: PAY[m[4]][2], amt: money(memoTotal(m)), staff: ST[m[5]] })),
  ];

  // ---- the memo in the side panel -------------------------------------------------------------------
  const selPos = typeof sel === 'string' && sel.indexOf('pos:') === 0 ? pos.find((x) => 'pos:' + x.id === sel) || null : null;
  const dm = ALL_SETS.find((m) => m[0] === sel) || SETS.today[0];
  const d = selPos ? (() => {
    const tt = selPos.totals || {};
    const disc = (tt.lineDisc || 0) + (tt.cartDisc || 0) + (tt.couponDisc || 0) + (tt.memberDisc || 0) + (tt.pointsDisc || 0);
    const n = (selPos.lines || []).length;
    return {
      title: 'Memo ' + selPos.id, when: formatDate(selPos.at) + ' · ' + tm(new Date(selPos.at).getHours(), new Date(selPos.at).getMinutes()) + (selPos.counter ? ' · ' + selPos.counter : ''),
      pay: payLabel(selPos), cust: custOf(selPos), mobile: (selPos.customer && selPos.customer.phone) || 'No mobile number', staff: selPos.cashier || '—', itemsN: n + (n === 1 ? ' item' : ' items'),
      lines: (selPos.lines || []).map((l) => ({ name: l.name, qp: l.qty + ' × ' + money(l.price), total: money(l.price * l.qty - (l.disc || 0)) })),
      sub: money(tt.gross || 0), disc: money(disc), grand: money(tt.total || 0), paid: money(Math.max(0, (tt.total || 0) - Math.max(0, selPos.due || 0))),
      isDue: selPos.due > 0, due: money(Math.max(0, selPos.due || 0)),
    };
  })() : (() => {
    const tot = memoTotal(dm), paid = dm[4] === 'due' ? 0 : tot;
    return {
      title: 'Memo #' + dm[0], when: whenOf(dm), pay: PAY[dm[4]][0], cust: CU[dm[3]][0], mobile: CU[dm[3]][1] || 'No mobile number', staff: ST[dm[5]], itemsN: dm[6].length + (dm[6].length === 1 ? ' item' : ' items'),
      lines: dm[6].map((x) => ({ name: PR[x[0]][0], qp: x[1] + ' × ' + money(PR[x[0]][1]), total: money(PR[x[0]][1] * x[1]) })),
      sub: money(tot), disc: money(0), grand: money(tot), paid: money(paid), isDue: tot - paid > 0, due: money(tot - paid),
    };
  })();
  const retHref = selPos ? '/return-exchange?ref=' + encodeURIComponent(selPos.id) : '/return-exchange';
  const reprint = () => toast(selPos ? 'Printing memo ' + selPos.id + ' again.' : 'Printing memo #' + dm[0] + ' again.');
  const editMemo = () => toast('Opening the memo for editing. The old version stays marked as "edited".');
  const sendSms = () => {
    const ph = selPos ? selPos.customer && selPos.customer.phone : CU[dm[3]][1];
    toast(ph ? 'Memo sent by SMS to ' + ph : 'This customer has no mobile number.');
  };
  const excel = () => toast('Building the Excel file — ' + base.note + ', ' + groupIndian(r.memos) + ' memos. Check your downloads.');

  const searching = find || !!q || stF !== 'all';
  const closeFind = () => { setFind(false); setQ(''); setStF('all'); };
  const tabs = PAY_TABS.map(([k, label]) => ({ key: k, id: 'sb-tab-' + k, label, on: payF === k, onClick: () => setPayF(k) }));

  return (
    <div className="dc-screen ds" data-screen="SalesBook">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="rep-sales" />
        <main className="gc-shell__main">
          <Topbar crumb="Sales" page="Sales book" placeholder="Search products, customers or memo no." />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="book-open" title="Sales book"
                about="What sold when, who sold it and how the money came in — all in one place. Click any memo to see it in full."
                secondary={[{ label: 'Export', onClick: excel }]}
                more={[{ label: 'Sales by hour', href: '/report?id=hour-weekday-heatmap' }, { label: 'Return & exchange', href: '/return-exchange' }]}
                primary={{ label: 'New sale', href: '/pos' }} />

              <div className="sb-period">
                <select className="ix-pick" aria-label="Date" value={rng} onChange={(e) => { setRng(e.target.value); setSel(0); }}>
                  {RANGES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                </select>
                {rng === 'custom' ? (<>
                  <label>From<input className="sb-date" value={fromTxt} onChange={(e) => setFromTxt(e.target.value)} inputMode="numeric" aria-label="From" /></label>
                  <label>To<input className="sb-date" value={toTxt} onChange={(e) => setToTxt(e.target.value)} inputMode="numeric" aria-label="To" /></label>
                </>) : <span className="sb-note">{base.note}</span>}
              </div>

              <MetricStrip label={'Sales, ' + r.lbl} items={[
                { label: 'Total sales', value: money(r.sales), spark: trend },
                { label: 'Memos', value: groupIndian(r.memos), sub: 'avg ' + money(Math.round(r.sales / Math.max(1, r.memos))) },
                { label: 'Profit', value: money(r.profit), sub: Math.round((r.profit / Math.max(1, r.sales)) * 100) + '% margin' },
                { label: 'Sold on due', value: money(r.due), sub: r.dueN + (r.dueN === 1 ? ' customer' : ' customers') },
                { label: 'Returns', value: money(r.ret), sub: r.retN + (r.retN === 1 ? ' return' : ' returns') },
              ]} />

              <section className="ix-card" aria-label="Memos">
                <div className="ix-bar">
                  {searching ? (<>
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search memo no. or customer" onDone={closeFind} autoFocus />
                    <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={closeFind}>Cancel</button>
                  </>) : (<>
                    <IndexTabs tabs={tabs} label="Payment" />
                    <span className="ix-tools">
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label="Search and filter" onClick={() => setFind(true)}><Icon name="search" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </>)}
                </div>
                {searching ? (
                  <div className="ix-filters" role="group" aria-label="Filters">
                    <select aria-label="Sold by" className={'ix-filter' + (stF !== 'all' ? ' is-set' : '')} value={stF} onChange={(e) => setStF(e.target.value)}>
                      <option value="all">Sold by</option>
                      {STAFF.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                      {cashiers.map((n) => <option key={'pos:' + n} value={'pos:' + n}>{n}</option>)}
                    </select>
                    {payF !== 'all' ? <select aria-label="Payment" className="ix-filter is-set" value={payF} onChange={(e) => setPayF(e.target.value)}>{PAY_TABS.map(([k, l]) => <option key={k} value={k}>{k === 'all' ? 'Payment' : l}</option>)}</select> : null}
                    {q || stF !== 'all' || payF !== 'all' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setStF('all'); setPayF('all'); }}>Clear all</button> : null}
                  </div>
                ) : null}

                {rows.length === 0 ? (
                  <div className="ix-empty"><EmptyState icon="receipt-text" title="No memos match this filter. Try another payment or staff." /></div>
                ) : (<>
                  <ul className="ix-plist" aria-label="Memos">
                    {rows.map((m) => (
                      <li key={m.key}>
                        <button type="button" className="ix-pitem sb-pbtn" onClick={() => setSel(m.key)}>
                          <span className="ix-pitem__top"><b className="sb-no">{m.no}</b><span>{m.amt}</span></span>
                          <span className="ix-pitem__mid">{m.cust} · {m.time} · {m.staff}</span>
                          <span className="ix-pitem__tags"><StatusBadge tone={m.tone} icon={m.icon}>{m.pay}</StatusBadge></span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table gc-table--keep">
                      <caption className="sr-only">Memos, newest first</caption>
                      <thead><tr><th scope="col">Memo no.</th><th scope="col">Time</th><th scope="col">Customer</th><th scope="col">Items</th><th scope="col">Payment</th><th scope="col" className="ix-num">Amount</th><th scope="col">Sold by</th></tr></thead>
                      <tbody>
                        {rows.map((m) => (
                          <tr key={m.key} className={m.key === sel ? 'is-sel' : ''} onClick={() => setSel(m.key)}>
                            <td><button type="button" className="sb-no ix-strong" onClick={() => setSel(m.key)}>{m.no}</button></td>
                            <td className="ix-muted">{m.time}</td>
                            <td>{m.cust}</td>
                            <td className="ix-muted">{m.items}</td>
                            <td><StatusBadge tone={m.tone} icon={m.icon}>{m.pay}</StatusBadge></td>
                            <td className="ix-num">{m.amt}</td>
                            <td className="ix-muted">{m.staff}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{rows.length} shown · {groupIndian(r.memos)} memos in all · newest first</span></div>
              </section>
              <LearnMore topic="the sales book" />
            </div>
          </div>
        </main>
      </div>

      <Sheet open={!!sel} title={d.title} onClose={() => setSel(0)}
        footer={<>
          <Link href={retHref} className="gc-btn gc-btn--neutral"><Icon name="undo-2" width="16" height="16" aria-hidden="true" />Return / exchange</Link>
          <button type="button" className="gc-btn gc-btn--solid" onClick={reprint}><Icon name="printer" width="16" height="16" aria-hidden="true" />Print again</button>
        </>}>
        <p className="sb-note" style={{ margin: 0 }}>{d.when}</p>
        <KV rows={[['Customer', d.cust], ['Mobile number', d.mobile], ['Sold by', d.staff], ['Payment', d.pay]]} />
        <div>
          <h3 className="ix-section-title">Items bought · {d.itemsN}</h3>
          <div className="sb-lines">
            {d.lines.map((ln, i) => <div key={i} className="sb-line"><span><b>{ln.name}</b><small>{ln.qp}</small></span><span>{ln.total}</span></div>)}
          </div>
        </div>
        <dl className="sb-sum">
          <dt>Subtotal</dt><dd>{d.sub}</dd>
          <dt>Discount</dt><dd>{d.disc}</dd>
          <dt className="is-total">Grand total</dt><dd className="is-total">{d.grand}</dd>
          <dt>Received ({d.pay})</dt><dd>{d.paid}</dd>
          {d.isDue ? <><dt className="is-due">Left as due</dt><dd className="is-due">{d.due}</dd></> : null}
        </dl>
        <div className="sb-acts">
          <button type="button" className="ix-btn ix-btn--sm" onClick={editMemo}><Icon name="pencil" width="16" height="16" aria-hidden="true" />Edit memo</button>
          <button type="button" className="ix-btn ix-btn--sm" onClick={sendSms}><Icon name="send" width="16" height="16" aria-hidden="true" />Send by SMS</button>
        </div>
      </Sheet>
    </div>
  );
}
