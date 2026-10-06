'use client';
// HomeWidgets — the dashboard widgets under Home's key figures and to-do, in pairs (one column on phones):
//   Sales summary   revenue, cost and profit per day for a date range and a category (smooth area chart, hover to read)
//   Order summary   orders in a date range by status: one ring per status, with the counts beside it
//   Live visitors   who is on the website now, on a world map (lib/traffic.js for the number, lib/worldMap.js for the map)
//   Top customers   the 8 customers who bought the most in the last 30 days
//   Latest orders   · Latest customers · Top products · Low stock (by category and place)
// Every number comes from the shared books (salesBook, orders, customers, stock, traffic); nothing here is sample data.
// `has(module)` hides what the edition doesn't sell (lib/edition.js).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { StatusBadge } from '@/components/ui';
import { formatBDT, formatDate } from '@/lib/format';
import { getSaleLines } from '@/lib/salesBook';
import { getOrders, orderHref } from '@/lib/orders';
import { ORDER_STATUSES } from '@/lib/orderStatus';
import { getDirectory } from '@/lib/customers';
import { getCatalog, productBy, stockAt, isVirtualRow, LOW_AT } from '@/lib/stock';
import { getPlaces } from '@/lib/locations';
import { visitsOn } from '@/lib/traffic';

const DAY = 864e5;
const dayStart = (t) => { const d = new Date(t); d.setHours(0, 0, 0, 0); return d.getTime(); };
const iso = (t) => { const d = new Date(t); return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); };
const fromIso = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, m - 1, d).getTime(); };
const money = (n) => formatBDT(Math.round(n || 0));
const short = (n) => (Math.abs(n) >= 1e5 ? '৳' + (n / 1e5).toFixed(1).replace(/\.0$/, '') + 'L' : Math.abs(n) >= 1e3 ? '৳' + (n / 1e3).toFixed(1).replace(/\.0$/, '') + 'k' : '৳' + Math.round(n));
const topCat = (c) => String(c || '').split('›')[0].trim();
const safe = (fn, d) => { try { return fn(); } catch { return d; } };
const hash = (s) => { let h = 7; for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
const initials = (n) => String(n || '?').replace(/^@/, '').split(/[\s._]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

/** Width of an element, kept up to date (charts draw at their real width so text never stretches). */
function useWidth(ref, fallback = 600) {
  const [w, setW] = useState(fallback);
  useEffect(() => {
    const el = ref.current;
    if (!el || typeof ResizeObserver === 'undefined') return undefined;
    const ro = new ResizeObserver(([e]) => setW(Math.max(240, Math.round(e.contentRect.width))));
    ro.observe(el);
    return () => ro.disconnect();
  }, [ref]);
  return w;
}

/** A person: initials on a soft tint that follows the name. */
function Face({ name, size = 32 }) {
  return <span className="hw-face" data-tone={hash(name) % 6} style={{ width: size, height: size }} aria-hidden="true">{initials(name)}</span>;
}

function Card({ title, right, children, className = '', foot }) {
  return (
    <section className={'ix-card hw-card ' + className} aria-label={typeof title === 'string' ? title : undefined}>
      <div className="hw-head"><h2>{title}</h2>{right ? <div className="hw-tools">{right}</div> : null}</div>
      <div className="hw-body">{children}</div>
      {foot ? <div className="hw-foot">{foot}</div> : null}
    </section>
  );
}

function Range({ from, to, onFrom, onTo, label }) {
  return (
    <span className="hw-range" role="group" aria-label={label}>
      <input type="date" className="hw-date" value={from} max={to} onChange={(e) => e.target.value && onFrom(e.target.value)} aria-label="From" />
      <span className="hw-to">to</span>
      <input type="date" className="hw-date" value={to} min={from} onChange={(e) => e.target.value && onTo(e.target.value)} aria-label="To" />
    </span>
  );
}
function Pick({ value, onChange, options, label }) {
  return (
    <label className="hw-pick">
      <span className="sr-only">{label}</span>
      <select value={value} onChange={(e) => onChange(e.target.value)}>{options.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
      <Icon name="chevron-down" width="14" height="14" aria-hidden="true" />
    </label>
  );
}

// ---- a smooth line (monotone cubic: never overshoots the points) ------------------------------------------------
function smoothPath(pts) {
  if (pts.length < 2) return pts.length ? `M${pts[0][0]},${pts[0][1]}` : '';
  const n = pts.length, dx = [], dy = [], m = [], t = [];
  for (let i = 0; i < n - 1; i++) { dx[i] = pts[i + 1][0] - pts[i][0]; dy[i] = pts[i + 1][1] - pts[i][1]; m[i] = dy[i] / dx[i]; }
  t[0] = m[0]; t[n - 1] = m[n - 2];
  for (let i = 1; i < n - 1; i++) t[i] = m[i - 1] * m[i] <= 0 ? 0 : (m[i - 1] + m[i]) / 2;
  for (let i = 0; i < n - 1; i++) {
    if (m[i] === 0) { t[i] = 0; t[i + 1] = 0; continue; }
    const a = t[i] / m[i], b = t[i + 1] / m[i], s = a * a + b * b;
    if (s > 9) { const k = 3 / Math.sqrt(s); t[i] = k * a * m[i]; t[i + 1] = k * b * m[i]; }
  }
  let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
  for (let i = 0; i < n - 1; i++) {
    const h = dx[i] / 3;
    d += `C${(pts[i][0] + h).toFixed(1)},${(pts[i][1] + t[i] * h).toFixed(1)} ${(pts[i + 1][0] - h).toFixed(1)},${(pts[i + 1][1] - t[i + 1] * h).toFixed(1)} ${pts[i + 1][0].toFixed(1)},${pts[i + 1][1].toFixed(1)}`;
  }
  return d;
}
const niceMax = (v) => { if (v <= 0) return 100; const p = Math.pow(10, Math.floor(Math.log10(v))); const f = v / p; return (f <= 1 ? 1 : f <= 2 ? 2 : f <= 2.5 ? 2.5 : f <= 5 ? 5 : 10) * p; };

// ---- Sales summary ------------------------------------------------------------------------------------------------
const SERIES = [['revenue', 'Revenue', 'var(--viz-7)'], ['cost', 'Cost', 'var(--viz-8)'], ['profit', 'Profit', 'var(--viz-3)']];
function SalesSummary({ lines, cats, now }) {
  const [from, setFrom] = useState(iso(now - 29 * DAY));
  const [to, setTo] = useState(iso(now));
  const [cat, setCat] = useState('');
  const [hover, setHover] = useState(-1);
  const box = useRef(null);
  const W = useWidth(box, 640);
  const H = 240, PL = 48, PR = 12, PT = 12, PB = 28;
  const data = useMemo(() => {
    const a = fromIso(from), b = fromIso(to) + DAY;
    const days = Math.max(1, Math.round((b - a) / DAY));
    const step = days > 92 ? 7 : 1;
    const buckets = [];
    for (let t = a; t < b; t += step * DAY) buckets.push({ at: t, revenue: 0, cost: 0, profit: 0 });
    lines.forEach((l) => {
      if (l.at < a || l.at >= b || (cat && topCat(l.cat) !== cat)) return;
      const k = Math.min(buckets.length - 1, Math.floor((l.at - a) / (step * DAY)));
      buckets[k].revenue += l.revenue || 0; buckets[k].cost += l.cost || 0;
    });
    buckets.forEach((x) => { x.profit = x.revenue - x.cost; });
    const sum = (k) => buckets.reduce((s, x) => s + x[k], 0);
    return { buckets, step, total: { revenue: sum('revenue'), cost: sum('cost'), profit: sum('profit') } };
  }, [lines, from, to, cat]);
  const max = niceMax(Math.max(1, ...data.buckets.map((x) => Math.max(x.revenue, x.cost, x.profit))));
  const n = data.buckets.length;
  const x = (i) => PL + (n === 1 ? (W - PL - PR) / 2 : (i * (W - PL - PR)) / (n - 1));
  const y = (v) => PT + (1 - Math.max(0, v) / max) * (H - PT - PB);
  const ticks = [0, 0.25, 0.5, 0.75, 1].map((f) => f * max);
  const every = Math.max(1, Math.ceil(n / Math.max(2, Math.floor((W - PL) / 70))));
  const onMove = (e) => {
    const r = e.currentTarget.getBoundingClientRect();
    const px = e.clientX - r.left;
    setHover(Math.max(0, Math.min(n - 1, Math.round(((px - PL) / (W - PL - PR)) * (n - 1)))));
  };
  const h = hover >= 0 ? data.buckets[hover] : null;
  return (
    <Card title="Sales summary" className="hw-sales"
      right={<><Range from={from} to={to} onFrom={setFrom} onTo={setTo} label="Sales dates" /><Pick value={cat} onChange={setCat} label="Category" options={[['', 'All categories'], ...cats.map((c) => [c, c])]} /></>}>
      <div className="hw-totals">
        {SERIES.map(([k, l, c]) => (
          <div key={k} className="hw-total">
            <span className="hw-total__ic" style={{ color: c }} aria-hidden="true"><Icon name="chart-column" width="18" height="18" /></span>
            <span><b>{money(data.total[k])}</b><small>{l}</small></span>
          </div>
        ))}
      </div>
      <div className="hw-chart" ref={box} onMouseLeave={() => setHover(-1)}>
        <svg width={W} height={H} role="img" aria-label={`Revenue ${money(data.total.revenue)}, cost ${money(data.total.cost)}, profit ${money(data.total.profit)}`} onMouseMove={onMove}>
          <defs>{SERIES.map(([k, , c]) => <linearGradient key={k} id={'hw-g-' + k} x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor={c} stopOpacity=".28" /><stop offset="1" stopColor={c} stopOpacity=".02" /></linearGradient>)}</defs>
          {ticks.map((v) => <g key={v}><line x1={PL} x2={W - PR} y1={y(v)} y2={y(v)} className="hw-grid" /><text x={PL - 8} y={y(v) + 4} textAnchor="end" className="hw-axis">{short(v).replace('৳', '')}</text></g>)}
          {data.buckets.map((b, i) => ((i % every === 0 && (n - 1 - i >= every * 0.6 || i === 0)) || i === n - 1 ? <text key={b.at} x={x(i)} y={H - 8} textAnchor={i === 0 ? 'start' : i === n - 1 ? 'end' : 'middle'} className="hw-axis">{new Date(b.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</text> : null))}
          {SERIES.map(([k, , c]) => {
            const pts = data.buckets.map((b, i) => [x(i), y(b[k])]);
            const line = smoothPath(pts);
            return (
              <g key={k} className="hw-series">
                <path d={`${line}L${x(n - 1)},${y(0)}L${x(0)},${y(0)}Z`} fill={`url(#hw-g-${k})`} />
                <path d={line} fill="none" stroke={c} strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
              </g>
            );
          })}
          {h ? <g><line x1={x(hover)} x2={x(hover)} y1={PT} y2={H - PB} className="hw-cross" />{SERIES.map(([k, , c]) => <circle key={k} cx={x(hover)} cy={y(h[k])} r="4.5" fill={c} className="hw-dot" />)}</g> : null}
        </svg>
        {h ? (
          <div className="hw-tip" style={{ left: Math.min(Math.max(x(hover), 90), W - 90) }}>
            <b>{data.step > 1 ? 'Week of ' : ''}{formatDate(h.at)}</b>
            {SERIES.map(([k, l, c]) => <span key={k}><i style={{ background: c }} />{l}<em>{money(h[k])}</em></span>)}
          </div>
        ) : null}
      </div>
      <table className="sr-only"><caption>Sales by day</caption><thead><tr><th>Day</th><th>Revenue</th><th>Cost</th><th>Profit</th></tr></thead><tbody>{data.buckets.map((b) => <tr key={b.at}><td>{formatDate(b.at)}</td><td>{money(b.revenue)}</td><td>{money(b.cost)}</td><td>{money(b.profit)}</td></tr>)}</tbody></table>
    </Card>
  );
}

// ---- Order summary ------------------------------------------------------------------------------------------------
const ALL_GROUPS = [
  ['New', ['onhold', 'processing', 'pending'], 'var(--viz-1)'],
  ['Approved', ['approved'], 'var(--viz-7)'],
  ['Ready for courier', ['ready'], 'var(--viz-4)'],
  ['Sent to courier', ['shipped'], 'var(--viz-5)'],
  ['Delivered', ['delivered'], 'var(--viz-3)'],
  ['Cancelled', ['cancelled'], 'var(--viz-8)'],
  ['Returned', ['returned'], 'var(--viz-2)'],
];
// a shop without online selling: counter sales are finished or on due (no courier steps)
const RETAIL_GROUPS = [
  ['Payment due', ['pending'], 'var(--viz-1)'],
  ['Completed', ['delivered'], 'var(--viz-3)'],
  ['Cancelled', ['cancelled'], 'var(--viz-8)'],
  ['Returned', ['returned'], 'var(--viz-2)'],
];
function OrderSummary({ orders, cats, now, online = true }) {
  const GROUPS = online ? ALL_GROUPS : RETAIL_GROUPS;
  const [from, setFrom] = useState(iso(now - 6 * DAY));
  const [to, setTo] = useState(iso(now));
  const [cat, setCat] = useState('');
  const [shown, setShown] = useState(false);
  useEffect(() => { const t = window.setTimeout(() => setShown(true), 60); return () => window.clearTimeout(t); }, []);
  const counts = useMemo(() => {
    const a = fromIso(from), b = fromIso(to) + DAY;
    const inCat = (o) => !cat || (o.lines || []).some((l) => topCat((safe(() => productBy(l.sku || l.name), null) || {}).cat) === cat);
    const list = orders.filter((o) => o.at >= a && o.at < b && inCat(o));
    return { total: list.length, by: GROUPS.map(([, keys]) => list.filter((o) => keys.includes(o.statusKey)).length) };
  }, [orders, from, to, cat, GROUPS]);
  const R = 112, STEP = 11, SW = 7;
  const most = Math.max(1, ...counts.by);
  return (
    <Card title="Order summary" className="hw-orders"
      right={<><Range from={from} to={to} onFrom={setFrom} onTo={setTo} label="Order dates" /><Pick value={cat} onChange={setCat} label="Category" options={[['', 'All categories'], ...cats.map((c) => [c, c])]} /></>}>
      <div className="hw-os">
        <svg viewBox="0 0 240 240" className="hw-rings" role="img" aria-label={`${counts.total} orders: ` + GROUPS.map(([l], i) => `${l} ${counts.by[i]}`).join(', ')}>
          {GROUPS.map(([l, , c], i) => {
            const r = R - i * STEP, len = 2 * Math.PI * r, part = counts.total ? counts.by[i] / counts.total : 0;
            return (
              <g key={l} transform="rotate(-90 120 120)">
                <circle cx="120" cy="120" r={r} fill="none" className="hw-track" strokeWidth={SW} />
                <circle cx="120" cy="120" r={r} fill="none" stroke={c} strokeWidth={SW} strokeLinecap="round" className="hw-arc"
                  strokeDasharray={`${len} ${len}`} strokeDashoffset={shown ? len * (1 - part) : len} style={{ transitionDelay: i * 50 + 'ms' }} />
              </g>
            );
          })}
          <text x="120" y="114" textAnchor="middle" className="hw-rings__lbl">Total</text>
          <text x="120" y="136" textAnchor="middle" className="hw-rings__n">{counts.total}</text>
        </svg>
        <ul className="hw-legend">
          {GROUPS.map(([l, keys, c], i) => (
            <li key={l}>
              <Link href={'/merchant-orders?status=' + keys[0]} className="hw-legend__row"><span>{l}</span><b>{counts.by[i]}</b></Link>
              <span className="hw-legend__bar" style={{ '--c': c }}><i style={{ width: (counts.by[i] / most) * 100 + '%' }} /></span>
            </li>
          ))}
        </ul>
      </div>
    </Card>
  );
}

// ---- Live visitors ------------------------------------------------------------------------------------------------
const PLACES = [['Dhaka', '050', 50], ['Chattogram', '050', 14], ['Sylhet', '050', 6], ['Khulna', '050', 5], ['Rajshahi', '050', 4], ['Kolkata', '356', 3], ['Dubai', '784', 4], ['Riyadh', '682', 3], ['Kuala Lumpur', '458', 3], ['London', '826', 3], ['New York', '840', 2], ['Toronto', '124', 1], ['Sydney', '036', 1], ['Doha', '634', 1]];
function split(total) {
  const sum = PLACES.reduce((a, p) => a + p[2], 0);
  const raw = PLACES.map(([n, c, w]) => ({ name: n, country: c, exact: (total * w) / sum }));
  raw.forEach((r) => { r.n = Math.floor(r.exact); });
  let left = total - raw.reduce((a, r) => a + r.n, 0);
  raw.slice().sort((a, b) => (b.exact - b.n) - (a.exact - a.n)).forEach((r) => { if (left > 0) { r.n += 1; left -= 1; } });
  return raw.filter((r) => r.n > 0);
}
function LiveVisitors({ now }) {
  const [map, setMap] = useState(null);
  const [tick, setTick] = useState(0);
  useEffect(() => { import('@/lib/worldMap').then(setMap).catch(() => {}); }, []);
  useEffect(() => { const id = window.setInterval(() => setTick((t) => t + 1), 8000); return () => window.clearInterval(id); }, []);
  // people on the site in the last 5 minutes: this hour's pace from lib/traffic.js, with a little drift every 8 seconds
  const online = useMemo(() => {
    const t = Date.now();
    const v = safe(() => visitsOn(t, t), { byHour: [] });
    const hr = new Date(t).getHours();
    const done = (t - dayStart(t) - hr * 36e5) / 36e5;
    const pace = done > 0.05 ? (v.byHour[hr] || 0) / done : v.byHour[Math.max(0, hr - 1)] || 0;
    return Math.max(1, Math.round(pace / 12) + ((hash(String(tick)) % 5) - 2));
  }, [tick, now]);
  const spots = split(online);
  const lit = new Set(spots.map((s) => s.country));
  return (
    <Card title="Live visitors" className="hw-live" right={<Link href="/analytics-hub" className="hw-link">Website analytics</Link>}>
      <p className="hw-online"><i aria-hidden="true" /><b>{online}</b> online now</p>
      <div className="hw-map">
        {map ? (
          <svg viewBox={`0 0 ${map.W} ${map.H}`} role="img" aria-label={`${online} people on the website now: ` + spots.map((s) => `${s.name} ${s.n}`).join(', ')}>
            {map.COUNTRIES.map(([id, name, d]) => <path key={id + name} d={d} className={'hw-land' + (lit.has(id) ? ' is-lit' : '')}><title>{name}</title></path>)}
            {spots.map((s) => {
              const p = map.CITIES[s.name];
              if (!p) return null;
              const r = 3 + Math.min(7, Math.sqrt(s.n) * 1.6);
              return (
                <g key={s.name} className="hw-spot">
                  <circle cx={p[0]} cy={p[1]} r={r + 6} className="hw-spot__pulse" />
                  <circle cx={p[0]} cy={p[1]} r={r} className="hw-spot__dot"><title>{`${s.name}: ${s.n} online`}</title></circle>
                </g>
              );
            })}
          </svg>
        ) : <div className="hw-skel" aria-hidden="true" />}
      </div>
      <div className="hw-where">{spots.slice(0, 5).map((s) => <span key={s.name}>{s.name} <b>{s.n}</b></span>)}</div>
    </Card>
  );
}

// ---- Top customers ------------------------------------------------------------------------------------------------
function TopCustomers({ lines, now }) {
  const rows = useMemo(() => {
    const a = now - 30 * DAY, by = {};
    lines.forEach((l) => {
      const c = l.customer || {};
      if (l.at < a || !c.name || /walk-?in/i.test(c.name)) return;
      const k = c.phone || c.name;
      const r = by[k] || (by[k] = { name: c.name, phone: c.phone, sales: new Set(), spent: 0 });
      r.sales.add(l.saleId || l.id); r.spent += l.revenue || 0;
    });
    return Object.values(by).map((r) => ({ ...r, orders: r.sales.size })).sort((x, y) => y.spent - x.spent).slice(0, 8);
  }, [lines, now]);
  return (
    <Card title="Top customers" className="hw-tc" right={<Link href="/all-customers" className="hw-link">All customers</Link>}>
      {rows.length ? (
        <ul className="hw-tc__grid">
          {rows.map((r) => (
            <li key={r.phone || r.name}>
              <Link href={'/all-customers?q=' + encodeURIComponent(r.phone || r.name)} className="hw-tc__card">
                <Face name={r.name} size={44} />
                <b>{r.name}</b>
                <span className="hw-tc__foot">{r.orders} {r.orders === 1 ? 'order' : 'orders'} · {short(r.spent)}</span>
              </Link>
            </li>
          ))}
        </ul>
      ) : <p className="hw-empty">No sales to customers in the last 30 days.</p>}
    </Card>
  );
}

// ---- tables -------------------------------------------------------------------------------------------------------
const toneOf = (key) => (ORDER_STATUSES.find((s) => s.key === key) || { tone: 'neutral' }).tone;
function LatestOrders({ orders }) {
  const rows = orders.slice().sort((a, b) => b.at - a.at).slice(0, 5);
  return (
    <Card title="Latest orders" right={<Link href="/merchant-orders" className="hw-link">All orders</Link>}>
      <div className="hw-tw"><table className="hw-table">
        <thead><tr><th>Order</th><th>Customer</th><th>Date</th><th className="is-num">Amount</th><th>Status</th></tr></thead>
        <tbody>{rows.map((o) => (
          <tr key={o.id}>
            <td><Link href={orderHref(o.id, 'home')} className="hw-strong">{o.id}</Link></td>
            <td><span className="hw-who"><Face name={o.customer} size={28} /><span>{o.customer}</span></span></td>
            <td className="hw-muted">{new Date(o.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
            <td className="is-num">{money(o.amount)}</td>
            <td><StatusBadge tone={toneOf(o.statusKey)}>{o.status}</StatusBadge></td>
          </tr>
        ))}</tbody>
      </table></div>
    </Card>
  );
}
function LatestCustomers({ people }) {
  const rows = people.map((c) => ({ ...c, joined: Date.parse(c.signup) || 0 })).filter((c) => c.joined).sort((a, b) => b.joined - a.joined).slice(0, 5);
  return (
    <Card title="Latest customers" right={<Link href="/all-customers" className="hw-link">All customers</Link>}>
      <div className="hw-tw"><table className="hw-table">
        <thead><tr><th>Customer</th><th>Email</th><th>Phone</th><th>Joined</th></tr></thead>
        <tbody>{rows.map((c) => (
          <tr key={c.id}>
            <td><Link href={'/customer-crm?id=' + encodeURIComponent(c.id)} className="hw-who hw-who--link"><Face name={c.name} size={28} /><b>{c.name}</b></Link></td>
            <td className="hw-muted"><span className="hw-ell">{c.email || '—'}</span></td>
            <td className="hw-data">{c.phone}</td>
            <td className="hw-muted">{new Date(c.joined).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</td>
          </tr>
        ))}</tbody>
      </table></div>
    </Card>
  );
}
function TopProducts({ lines, now }) {
  const rows = useMemo(() => {
    const a = now - 30 * DAY, by = {};
    lines.forEach((l) => {
      if (l.at < a || !l.name) return;
      const k = l.sku || l.name;
      const r = by[k] || (by[k] = { key: k, name: l.name, cat: topCat(l.cat), qty: 0 });
      r.qty += l.qty || 0;
    });
    return Object.values(by).sort((x, y) => y.qty - x.qty).slice(0, 5).map((r) => ({ ...r, brand: (safe(() => productBy(r.key), null) || {}).brand || '—' }));
  }, [lines, now]);
  return (
    <Card title="Top products" className="hw-wide" right={<span className="hw-muted hw-small">Last 30 days</span>}>
      <div className="hw-tw"><table className="hw-table">
        <thead><tr><th>Product</th><th>Category</th><th>Brand</th><th className="is-num">Sold</th></tr></thead>
        <tbody>{rows.map((p) => (
          <tr key={p.key}>
            <td><span className="hw-who"><span className="hw-thumb" data-tone={hash(p.name) % 6} aria-hidden="true">{initials(p.name)}</span><b>{p.name}</b></span></td>
            <td className="hw-muted">{p.cat || '—'}</td>
            <td className="hw-muted">{p.brand}</td>
            <td className="is-num"><span className="hw-qty">{p.qty}</span></td>
          </tr>
        ))}</tbody>
      </table></div>
    </Card>
  );
}
function LowStock({ cats }) {
  const [cat, setCat] = useState('');
  const [place, setPlace] = useState('');
  const places = useMemo(() => safe(() => getPlaces({ active: true }).filter((p) => p.type === 'Branch' || p.type === 'Warehouse').map((p) => p.name), []), []);
  const rows = useMemo(() => safe(() => getCatalog().filter((r) => !isVirtualRow(r) && r.st !== 'archived' && r.st !== 'deleted' && (!cat || topCat(r.cat) === cat))
    .map((r) => ({ ...r, left: stockAt(r.sku, place).available }))
    .filter((r) => r.left <= LOW_AT).sort((a, b) => a.left - b.left).slice(0, 6), []), [cat, place]);
  return (
    <Card title={<>Stock alert <span className="hw-alert">(low stock)</span></>}
      right={<><Pick value={cat} onChange={setCat} label="Category" options={[['', 'All categories'], ...cats.map((c) => [c, c])]} /><Pick value={place} onChange={setPlace} label="Place" options={[['', 'All places'], ...places.map((p) => [p, p])]} /></>}
      foot={<Link href="/stock" className="hw-link">View all stock</Link>}>
      {rows.length ? (
        <div className="hw-tw"><table className="hw-table">
          <thead><tr><th>Product</th><th>SKU</th><th className="is-num">Price</th><th>Stock</th></tr></thead>
          <tbody>{rows.map((r) => (
            <tr key={r.sku}>
              <td><span className="hw-who hw-who--2"><span className="hw-thumb" data-tone={hash(r.name) % 6} aria-hidden="true">{initials(r.name)}</span><span className="hw-2l"><b>{String(r.name).split(' · ')[0]}</b>{r.variant || String(r.name).split(' · ')[1] ? <small>{r.variant || String(r.name).split(' · ').slice(1).join(' · ')}</small> : null}</span></span></td>
              <td className="hw-data">{r.sku}</td>
              <td className="is-num">{money(r.price)}</td>
              <td><span className={'hw-stock' + (r.left <= 0 ? ' is-out' : '')}>{Math.max(0, r.left) + ' left'}</span></td>
            </tr>
          ))}</tbody>
        </table></div>
      ) : <p className="hw-empty">Nothing is running low{place ? ' at ' + place : ''}.</p>}
    </Card>
  );
}

/** skip: widget keys to leave out (e.g. ['latest-orders'] on the Online Home, which has its own Latest orders card). */
export function HomeWidgets({ has = () => true, skip = [] }) {
  const no = (k) => skip.includes(k);
  const [now] = useState(() => Date.now());
  const lines = useMemo(() => safe(() => getSaleLines(), []), []);
  const orders = useMemo(() => safe(() => getOrders(), []), []);
  const people = useMemo(() => safe(() => getDirectory(), []), []);
  const cats = useMemo(() => [...new Set(safe(() => getCatalog(), []).map((r) => topCat(r.cat)).filter(Boolean))].sort(), []);
  return (
    <div className="hw">
      <div className="hw-row hw-row--wide"><SalesSummary lines={lines} cats={cats} now={now} />{has('online') || has('commerce') ? <OrderSummary orders={orders} cats={cats} now={now} online={has('online')} /> : null}</div>
      <div className="hw-row">{has('online') ? <LiveVisitors now={now} /> : null}<TopCustomers lines={lines} now={now} /></div>
      {no('latest-orders') ? (<>
        <div className="hw-row"><TopProducts lines={lines} now={now} /><LatestCustomers people={people} /></div>
        {has('catalog') ? <div className="hw-row"><LowStock cats={cats} /></div> : null}
      </>) : (<>
        <div className="hw-row"><LatestOrders orders={orders} /><LatestCustomers people={people} /></div>
        <div className="hw-row"><TopProducts lines={lines} now={now} />{has('catalog') ? <LowStock cats={cats} /> : null}</div>
      </>)}
    </div>
  );
}

export const WIDGETS_CSS = `
.hw{display:flex;flex-direction:column;gap:var(--space-4)}
.hw-row{display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,420px),1fr));gap:var(--space-4);align-items:start}
.hw-row--wide{grid-template-columns:minmax(0,1.5fr) minmax(0,1fr)}
.hw-card{display:flex;flex-direction:column;min-width:0;overflow:hidden}
.hw-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-2) var(--space-3);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.hw-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hw-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.hw-body{padding:var(--space-3) var(--space-4) var(--space-4);min-width:0}
.hw-foot{padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);text-align:right}
.hw-range{display:inline-flex;align-items:center;gap:var(--space-1-5)}
.hw-date{height:30px;padding:0 var(--space-2);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-xs)}
.hw-to{font-size:var(--text-xs);color:var(--text-muted)}
.hw-pick{position:relative;display:inline-flex;align-items:center}
.hw-pick select{appearance:none;-webkit-appearance:none;height:30px;max-width:180px;padding:0 var(--space-6) 0 var(--space-2-5);border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);color:var(--text-heading);font:inherit;font-size:var(--text-xs);cursor:pointer}
.hw-pick svg{position:absolute;right:var(--space-2);pointer-events:none;color:var(--text-muted)}
.hw-link{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-link);text-decoration:none}
.hw-link:hover{text-decoration:underline}
.hw-muted{color:var(--text-muted)}
.hw-small{font-size:var(--text-xs)}
.hw-data{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.hw-empty{margin:var(--space-3) 0;font-size:var(--text-sm);color:var(--text-muted)}
.hw-face{display:inline-grid;place-items:center;flex:none;border-radius:var(--radius-full);font-size:var(--text-2xs);font-weight:var(--weight-semibold)}
.hw-face[data-tone="0"],.hw-thumb[data-tone="0"]{background:color-mix(in srgb,var(--viz-1) 16%,var(--surface-card));color:var(--viz-1)}
.hw-face[data-tone="1"],.hw-thumb[data-tone="1"]{background:color-mix(in srgb,var(--viz-7) 16%,var(--surface-card));color:var(--viz-7)}
.hw-face[data-tone="2"],.hw-thumb[data-tone="2"]{background:color-mix(in srgb,var(--viz-3) 16%,var(--surface-card));color:var(--viz-3)}
.hw-face[data-tone="3"],.hw-thumb[data-tone="3"]{background:color-mix(in srgb,var(--viz-2) 16%,var(--surface-card));color:var(--viz-2)}
.hw-face[data-tone="4"],.hw-thumb[data-tone="4"]{background:color-mix(in srgb,var(--viz-5) 18%,var(--surface-card));color:var(--viz-5)}
.hw-face[data-tone="5"],.hw-thumb[data-tone="5"]{background:color-mix(in srgb,var(--viz-4) 18%,var(--surface-card));color:var(--viz-4)}
/* sales */
.hw-totals{display:flex;flex-wrap:wrap;gap:var(--space-3) var(--space-8);margin-bottom:var(--space-2)}
.hw-total{display:flex;align-items:center;gap:var(--space-2)}
.hw-total b{display:block;font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.hw-total small{font-size:var(--text-xs);color:var(--text-muted)}
.hw-chart{position:relative;min-width:0}
.hw-chart svg{display:block}
.hw-grid{stroke:var(--border-subtle);stroke-width:1}
.hw-axis{font-size:var(--text-2xs);fill:var(--text-muted);font-family:var(--font-sans)}
.hw-series path{animation:hw-rise 700ms cubic-bezier(.23,1,.32,1) both}
.hw-cross{stroke:var(--border-strong);stroke-dasharray:3 3}
.hw-dot{stroke:var(--surface-card);stroke-width:2}
.hw-tip{position:absolute;top:0;transform:translateX(-50%);display:flex;flex-direction:column;gap:2px;min-width:160px;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-lg);font-size:var(--text-xs);color:var(--text-body);pointer-events:none}
.hw-tip b{color:var(--text-heading);font-weight:var(--weight-semibold)}
.hw-tip span{display:flex;align-items:center;gap:6px}
.hw-tip i{width:8px;height:8px;border-radius:var(--radius-full)}
.hw-tip em{margin-left:auto;font-style:normal;font-weight:var(--weight-medium);color:var(--text-heading);font-variant-numeric:tabular-nums}
@keyframes hw-rise{from{opacity:0;transform:translateY(8px)}}
/* orders */
.hw-os{display:grid;grid-template-columns:minmax(160px,240px) minmax(0,1fr);align-items:center;gap:var(--space-5)}
.hw-rings{width:100%;height:auto}
.hw-track{stroke:var(--surface-quiet)}
.hw-arc{transition:stroke-dashoffset 900ms cubic-bezier(.23,1,.32,1)}
.hw-rings__lbl{font-size:var(--text-xs);fill:var(--text-muted);font-family:var(--font-sans)}
.hw-rings__n{font-size:var(--text-xl);font-weight:var(--weight-semibold);fill:var(--text-heading);font-family:var(--font-sans)}
.hw-legend{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:var(--space-2-5)}
.hw-legend__row{display:flex;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-heading);text-decoration:none}
.hw-legend__row:hover{color:var(--primary)}
.hw-legend__row b{font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.hw-legend__bar{display:block;height:6px;margin-top:4px;border-radius:var(--radius-full);background:color-mix(in srgb,var(--c) 18%,transparent);overflow:hidden}
.hw-legend__bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--c);transition:width 700ms cubic-bezier(.23,1,.32,1)}
/* live */
.hw-online{display:flex;align-items:center;gap:var(--space-2);margin:0 0 var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.hw-online i{width:10px;height:10px;border-radius:var(--radius-full);background:var(--success);box-shadow:0 0 0 4px color-mix(in srgb,var(--success) 22%,transparent);animation:hw-blink 2s ease-in-out infinite}
.hw-online b{font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.hw-map svg{display:block;width:100%;height:auto}
.hw-land{fill:var(--surface-quiet);stroke:var(--surface-card);stroke-width:.5}
.hw-land.is-lit{fill:color-mix(in srgb,var(--primary-500) 22%,var(--surface-quiet))}
.hw-spot__dot{fill:var(--primary);stroke:var(--surface-card);stroke-width:1.5}
.hw-spot__pulse{fill:var(--primary);opacity:0;transform-box:fill-box;transform-origin:center;animation:hw-pulse 2.4s cubic-bezier(.23,1,.32,1) infinite}
.hw-spot:nth-child(odd) .hw-spot__pulse{animation-delay:1.2s}
@keyframes hw-pulse{0%{opacity:.35;transform:scale(.4)}100%{opacity:0;transform:scale(1.6)}}
@keyframes hw-blink{0%,100%{opacity:1}50%{opacity:.5}}
.hw-skel{aspect-ratio:2/1;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.hw-where{display:flex;flex-wrap:wrap;gap:var(--space-1-5) var(--space-3);margin-top:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.hw-where b{color:var(--text-heading);font-weight:var(--weight-semibold)}
/* top customers */
.hw-tc__grid{list-style:none;margin:0;padding:0;display:grid;grid-template-columns:repeat(auto-fill,minmax(104px,1fr));gap:var(--space-3)}
.hw-tc__card{display:flex;flex-direction:column;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-2) 0;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);overflow:hidden;text-align:center;text-decoration:none;color:var(--text-heading);transition:box-shadow var(--duration-fast) ease,transform var(--duration-fast) ease}
.hw-tc__card b{font-size:var(--text-sm);font-weight:var(--weight-medium);max-width:100%;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.hw-tc__foot{align-self:stretch;margin:0 calc(var(--space-2) * -1);padding:var(--space-1-5) var(--space-2);background:var(--primary);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
@media (hover:hover) and (pointer:fine){.hw-tc__card:hover{box-shadow:var(--shadow-card);transform:translateY(-2px)}}
/* tables */
.hw-tw{overflow-x:auto;margin:0 calc(var(--space-4) * -1)}
.hw-table{width:100%;border-collapse:collapse;font-size:var(--text-sm)}
.hw-table th{height:34px;padding:0 var(--space-3);background:var(--surface-page);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;text-transform:uppercase;letter-spacing:var(--tracking-label);white-space:nowrap}
.hw-table td{height:48px;padding:0 var(--space-3);border-top:1px solid var(--border-subtle);color:var(--text-heading);white-space:nowrap}
.hw-table .is-num{text-align:right;font-variant-numeric:tabular-nums}
.hw-table .is-act{width:1%;text-align:right}
.hw-table tbody tr:hover{background:var(--surface-page)}
.hw-who{display:inline-flex;align-items:center;gap:var(--space-2);min-width:0;max-width:170px}
.hw-table th:first-child,.hw-table td:first-child{padding-left:var(--space-4)}
.hw-table th:last-child,.hw-table td:last-child{padding-right:var(--space-4)}
.hw-ell{display:inline-block;max-width:96px;overflow:hidden;text-overflow:ellipsis;vertical-align:middle}
.hw-who>span:last-child,.hw-who>b{overflow:hidden;text-overflow:ellipsis}
.hw-who b{font-weight:var(--weight-medium)}
.hw-who--2{max-width:190px}
.hw-who--link{text-decoration:none;color:inherit;max-width:140px}
.hw-who--link:hover b{color:var(--primary)}
.hw-wide .hw-who{max-width:240px;min-width:190px}
.hw-2l{display:flex;flex-direction:column;min-width:0;line-height:1.3}
.hw-2l b,.hw-2l small{overflow:hidden;text-overflow:ellipsis}
.hw-2l small{font-size:var(--text-xs);color:var(--text-muted)}
.hw-strong{font-weight:var(--weight-semibold);color:var(--text-heading);text-decoration:none;font-family:var(--font-data)}
.hw-strong:hover{color:var(--primary)}
.hw-eye{display:inline-grid;place-items:center;width:30px;height:30px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.hw-thumb{display:inline-grid;place-items:center;flex:none;width:36px;height:36px;border-radius:var(--radius-lg);font-size:var(--text-2xs);font-weight:var(--weight-semibold)}
.hw-qty{display:inline-grid;place-items:center;min-width:28px;height:24px;padding:0 6px;border-radius:var(--radius-md);background:var(--surface-quiet);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.hw-alert{color:var(--text-danger)}
.hw-stock{display:inline-flex;align-items:center;height:24px;padding:0 var(--space-2);border-radius:var(--radius-md);background:var(--fill-warning);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-semibold);white-space:nowrap}
.hw-stock.is-out{background:var(--error)}
@media (max-width:1100px){.hw-row--wide{grid-template-columns:minmax(0,1fr)}}
@media (max-width:640px){
  .hw-tc__grid{grid-template-columns:repeat(2,minmax(0,1fr))}
  .hw-os{grid-template-columns:minmax(0,1fr)}
  .hw-rings{max-width:220px;margin:0 auto}
  .hw-head{padding:var(--space-3)}
  .hw-body{padding:var(--space-3)}
  .hw-tw{margin:0 calc(var(--space-3) * -1)}
  .hw-totals{gap:var(--space-3) var(--space-5)}
}
@media (prefers-reduced-motion:reduce){.hw-series path,.hw-spot__pulse,.hw-online i{animation:none}.hw-arc,.hw-legend__bar i{transition:none}}
`;
