'use client';
// Merchant app · "Today's cash" (AP-F6) — where today's money is, for managers, on Home and Finance:
//   drawers   each counter with a shift open now (posStore.getOpenShifts, on any device): the cashier, since when, and the
//             cash the drawer should hold (posStore.shiftReport: float + cash sales − refunds − pickups − paid out). A shift
//             open on another device only knows the sales this device has seen; its float comes from the counter.
//   pickups   cash taken out of the drawers today (posStore cash moves of type pickup) and where it went (safe, bank)
//   closed    shifts closed today and the cash counted at closing
//   couriers  cash on delivery the couriers still hold for the shop (settlements.heldBy for each courier)
// Shown to people who see the whole shop (the web Dashboard or Finance). Everything is read after mount (useAppData).

import React from 'react';
import { Section, Card, ListRow, Pill, money, timeText } from '../kit/AppKit';
import { POS_KEYS, load, getOpenShifts, getCounters, getShifts, getCash, shiftReport } from '@/lib/posStore';
import { getPartners, heldBy, clockNow, startOfDay } from '@/lib/settlements';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** Today's cash, worked out from the POS books and the couriers' holding accounts. */
export function todayCash() {
  const now = clockNow();
  const day = startOfDay(now);
  const sales = safe(() => load(POS_KEYS.sales, []), []);
  const cash = safe(() => getCash(), []);
  const counters = safe(() => getCounters(), []);
  const mine = safe(() => load(POS_KEYS.shift, null), null);
  const drawers = safe(() => getOpenShifts(), []).map((o) => {
    const own = mine && mine.counter === o.counter ? mine : null;
    const float = own ? Number(own.float) || 0 : Number((counters.find((c) => c.id === o.counterId || c.name === o.counter) || {}).float) || 0;
    const rep = safe(() => shiftReport({ counter: o.counter, openedAt: o.openedAt, float }, sales, cash, now), null);
    return { key: o.counterId || o.counter, counter: o.counter, cashier: o.cashier, since: o.openedAt, device: own ? 'This phone' : o.deviceName || '', expected: rep ? rep.expected : float, sales: rep ? rep.count : 0 };
  });
  const pickups = cash.filter((m) => m.type === 'pickup' && m.at >= day && m.at <= now);
  const closed = safe(() => getShifts(), []).filter((s) => s.closedAt && s.closedAt >= day && s.closedAt <= now);
  const couriers = safe(() => getPartners().filter((p) => p.kind === 'Courier'), []).map((p) => ({ id: p.id, name: p.short || p.name, held: r2(safe(() => heldBy(p.id), 0)) })).filter((p) => p.held > 0);
  return {
    drawers, drawerTotal: r2(drawers.reduce((a, d) => a + d.expected, 0)),
    pickups, pickupTotal: r2(pickups.reduce((a, m) => a + m.amount, 0)),
    closed, closedTotal: r2(closed.reduce((a, s) => a + (Number(s.counted) || 0), 0)),
    couriers, courierTotal: r2(couriers.reduce((a, c) => a + c.held, 0)),
  };
}

const plural = (n, one, many) => `${n} ${n === 1 ? one : many || one + 's'}`;

/** The card: one row per place the money is, with the detail under each. */
export function TodayCashCard({ data, style }) {
  if (!data) return null;
  const { drawers, drawerTotal, pickups, pickupTotal, closed, closedTotal, couriers, courierTotal } = data;
  const nothing = !drawers.length && !pickups.length && !closed.length && !couriers.length;
  const total = r2(drawerTotal + courierTotal);
  return (
    <Section title="Today’s cash" action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{money(total)}</span>} style={style}>
      <Card>
        {nothing ? <ListRow icon="cash" title="No drawer open and nothing with couriers" chevron={false} /> : null}
        {drawers.map((d) => (
          <ListRow key={d.key} icon="cart" title={d.counter} chevron={false}
            sub={`${d.cashier} · since ${timeText(d.since)}${d.device ? ' · ' + d.device : ''}`}
            end={<span style={{ textAlign: 'right' }}><span className="num" style={{ display: 'block', fontWeight: 'var(--weight-semibold)' }}>{money(d.expected)}</span><span style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>in the drawer</span></span>} />
        ))}
        {pickups.length ? (
          <ListRow icon="download" title="Cash picked up" chevron={false}
            sub={`${plural(pickups.length, 'pickup')} · ${[...new Set(pickups.map((m) => m.to).filter(Boolean))].join(', ')}`}
            end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(pickupTotal)}</span>} />
        ) : null}
        {closed.length ? (
          <ListRow icon="check" title="Shifts closed today" chevron={false}
            sub={`${plural(closed.length, 'shift')} · counted at closing`}
            end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(closedTotal)}</span>} />
        ) : null}
        {couriers.length ? (
          <ListRow href="/m-payouts" icon="truck" title="COD with couriers"
            sub={couriers.map((c) => `${c.name} ${money(c.held)}`).join(' · ')}
            end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(courierTotal)}</span>} />
        ) : null}
        {drawers.length ? <div style={{ padding: '0 16px 12px' }}><Pill tone="grey">{`${plural(drawers.length, 'drawer')} open · ${money(drawerTotal)} expected`}</Pill></div> : null}
      </Card>
    </Section>
  );
}
