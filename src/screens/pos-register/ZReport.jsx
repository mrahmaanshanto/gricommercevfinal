'use client';
// ZReport — the shift's Z-report on paper: the shop's letterhead (Settings › General), the counter, cashier and times,
// what was sold (sales, units, discounts, refunds, money by method, dues collected), the drawer (opening cash, cash
// taken, refunded, pickups, paid out, expected, counted, difference) and, for a closed shift, who approved it.
// Two sizes: '80' (thermal roll, 80 mm) and 'a4'. It is kept off screen and printed on its own (lib/printNode).
//   <ZReport shift report size innerRef />   shift: { id?, cashier, counter, openedAt, closedAt?, float, counted?, diff?, approvedBy? }
//                                            report: shiftReport() numbers (or a closed shift record, which has them)
//   printZ(node, size, title)

import React from 'react';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { invoiceIdentity } from '@/lib/businessProfile';
import { printNode } from '@/lib/printNode';

const money = (n) => formatBDT(Number(n) || 0, { decimals: Number.isInteger(Math.round((Number(n) || 0) * 100) / 100) ? 0 : 2 });

export function ZReport({ shift, report, size = '80', innerRef }) {
  if (!shift || !report) return null;
  const id = (() => { try { return invoiceIdentity(); } catch { return {}; } })();
  const a4 = size === 'a4';
  const box = { fontFamily: a4 ? 'var(--font-sans)' : 'var(--font-data)', fontSize: a4 ? 'var(--text-sm)' : 'var(--text-xs)', color: 'var(--text-heading)', width: a4 ? '180mm' : '72mm', padding: a4 ? '4mm' : '2mm', display: 'flex', flexDirection: 'column', gap: a4 ? '3mm' : '2mm' };
  const row = { display: 'flex', justifyContent: 'space-between', gap: '4mm' };
  const hr = { border: 0, borderTop: '1px dashed var(--text-heading)', margin: 0 };
  const cap = { fontWeight: 'var(--weight-semibold)', textTransform: 'uppercase', letterSpacing: 'var(--tracking-label)' };
  const R = ([k, v]) => <div key={k} style={row}><span>{k}</span><span>{v}</span></div>;
  const closed = !!shift.closedAt;
  const diff = shift.diff != null ? shift.diff : null;
  const sold = [
    ['Sales', `${report.count} · ${report.units} ${report.units === 1 ? 'unit' : 'units'}`],
    ['Sold, VAT included', money(report.sold)],
    ['Discounts given', '−' + money(report.discounts || 0)],
    ['Refunds and exchanges', '−' + money(report.refunds || 0)],
    ...Object.entries(report.byMethod || {}).map(([m, v]) => ['Taken by ' + m, money(v)]),
    report.collected ? ['Old dues collected', money(report.collected)] : null,
  ].filter(Boolean);
  const drawer = [
    ['Opening cash', money(shift.float)],
    ['Cash taken', money(((report.byMethod || {}).Cash || 0) + (report.cashCollected || 0))],
    ['Cash refunded', '−' + money(report.cashRefunds || 0)],
    ['Cash pickups', '−' + money(report.pickups || 0)],
    report.paidOut ? ['Paid out', '−' + money(report.paidOut)] : null,
    report.added ? ['Cash added', money(report.added)] : null,
    ['Expected in drawer', money(report.expected)],
    closed ? ['Counted', money(shift.counted)] : null,
    closed && diff != null ? ['Difference', diff === 0 ? 'Matches' : (diff > 0 ? '+' : '−') + money(Math.abs(diff))] : null,
  ].filter(Boolean);
  return (
    <div style={{ position: 'absolute', left: '-10000px', top: 0 }} aria-hidden="true">
      <div ref={innerRef} style={box}>
        <div style={{ textAlign: 'center' }}>
          <b style={{ fontSize: a4 ? 'var(--text-lg)' : 'var(--text-sm)' }}>{id.tradingName || id.name || ''}</b>
          {id.address ? <div>{id.address}</div> : null}
          {id.bin ? <div>BIN {id.bin}</div> : null}
        </div>
        <hr style={hr} />
        <div style={{ ...cap, textAlign: 'center' }}>{closed ? 'Z-report · shift closed' : 'X-report · shift still open'}</div>
        {R(['Shift', shift.id || '—'])}
        {R(['Counter', shift.counter])}
        {R(['Cashier', shift.cashier])}
        {R(['Opened', formatDate(shift.openedAt) + ', ' + formatTime(shift.openedAt)])}
        {R([closed ? 'Closed' : 'Printed', formatDate(shift.closedAt || Date.now()) + ', ' + formatTime(shift.closedAt || Date.now())])}
        <hr style={hr} />
        <div style={cap}>Sold</div>
        {sold.map(R)}
        <hr style={hr} />
        <div style={cap}>Cash drawer</div>
        {drawer.map(R)}
        {(shift.byAccount || []).length > 1 ? <>
          <hr style={hr} />
          <div style={cap}>By account · expected / counted</div>
          {shift.byAccount.map((a) => R([a.label || a.account, money(a.expected) + ' / ' + money(a.counted)]))}
        </> : null}
        {shift.approvedBy ? <><hr style={hr} />{R(['Approved by', shift.approvedBy])}</> : null}
        {shift.note ? <div>Note: {shift.note}</div> : null}
        <hr style={hr} />
        <div style={{ ...row, marginTop: a4 ? '10mm' : '6mm' }}><span>Cashier’s signature</span><span>Manager’s signature</span></div>
      </div>
    </div>
  );
}

/** Print the report: '80' on the thermal roll, 'a4' on a page. */
export const printZ = (node, size, title) => printNode(node, { title: title || 'Shift report', css: size === 'a4' ? '@page{size:A4;margin:12mm}' : '@page{size:80mm auto;margin:3mm}' });
