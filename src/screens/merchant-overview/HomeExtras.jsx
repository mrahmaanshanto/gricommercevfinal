'use client';
// HomeExtras — the small parts the Homes share (brief #10):
//   <AsOf at onRefresh />          "As of 10:42 PM" and a refresh button: when the figures were worked out
//   <Readiness ed />               first run: a short setup checklist on a new or empty shop (add products, connect a
//                                  payment, set up a courier or a counter, invite staff) until done or dismissed
//   isNewShop()                    a shop with no products and no sales yet, or the demo's first-run view
//                                  (?firstrun=1 starts it, ?firstrun=0 ends it; kept in gc.home.firstrun)
//   <InsightsCard items scope />   2–3 observations with their numbers (not to-dos), apart from the to-do pills
// In the first-run view a step counts as done when the merchant does it in this browser after the view started
// (a product saved, a gateway or courier set up, a counter or staff list saved); a real empty shop reads the books.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { formatTime } from '@/lib/format';
import { hasModule } from '@/lib/edition';
import { allProducts, getSavedProducts } from '@/lib/products';
import { getSales } from '@/lib/salesBook';
import { getAllPartners, getConfig } from '@/lib/settlements';
import { getCounters, POS_KEYS } from '@/lib/posStore';

export const EXTRAS_CSS = `
.hx-asof{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.hx-asof button{display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.hx-asof button:hover{background:var(--surface-subtle);color:var(--text-heading)}
.hx-ready .ix-card__head span{font-size:var(--text-xs);color:var(--text-muted)}
.hx-bar{height:6px;margin-bottom:var(--space-3);border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.hx-bar i{display:block;height:100%;border-radius:var(--radius-full);background:var(--primary)}
.hx-steps{display:flex;flex-direction:column}
.hx-step{display:flex;align-items:center;gap:var(--space-3);min-height:44px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm);color:var(--text-heading)}
.hx-step:first-child{border-top:0}
.hx-step>svg{flex:none;color:var(--text-muted)}
.hx-step.is-done>svg{color:var(--text-success)}
.hx-step.is-done .hx-step__t{color:var(--text-muted);text-decoration:line-through}
.hx-step__t{flex:1;min-width:0}
.hx-ins{display:flex;flex-direction:column}
.hx-in{display:flex;align-items:flex-start;gap:var(--space-2);padding:8px 0;border-top:1px solid var(--border-subtle);color:inherit;text-decoration:none}
.hx-in:first-child{border-top:0}
.hx-in>svg{flex:none;margin-top:2px;color:var(--text-muted)}
.hx-in.is-up>svg{color:var(--text-success)}
.hx-in.is-down>svg{color:var(--text-warning)}
.hx-in span{display:flex;flex-direction:column;gap:2px;min-width:0}
.hx-in b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hx-in small{font-size:var(--text-xs);color:var(--text-muted)}
a.hx-in:hover b{color:var(--primary)}
.hx-scope{font-size:var(--text-xs);color:var(--text-muted)}
.hx-empty{margin:0;padding:var(--space-2) 0;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:640px){.hx-asof button{width:36px;height:36px}}
`;

/** "As of 10:42 PM" with a refresh button. */
export function AsOf({ at, onRefresh }) {
  if (!at) return null;
  return (
    <span className="hx-asof" role="status">
      As of {formatTime(at)}
      {onRefresh ? <button type="button" onClick={onRefresh} aria-label="Refresh" title="Refresh"><Icon name="refresh-cw" width="14" height="14" aria-hidden="true" /></button> : null}
    </span>
  );
}

// ---- first run ---------------------------------------------------------------------------------------------
const FIRST_KEY = 'gc.home.firstrun';
const READY_KEY = 'gc.home.readiness';
const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const raw = (k) => safe(() => window.localStorage.getItem(k), null);
const readJson = (k) => safe(() => JSON.parse(window.localStorage.getItem(k)), null);
const writeJson = (k, v) => { try { if (v == null) window.localStorage.removeItem(k); else window.localStorage.setItem(k, JSON.stringify(v)); } catch { /* ignore */ } };

/** The demo's first-run view: ?firstrun=1 starts it (noting what the shop has now), ?firstrun=0 ends it. */
function firstRun() {
  if (typeof window === 'undefined') return null;
  const q = new URLSearchParams(window.location.search).get('firstrun');
  if (q === '0') { writeJson(FIRST_KEY, null); writeJson(READY_KEY, null); return null; }
  if (q === '1' && !readJson(FIRST_KEY)) {
    writeJson(READY_KEY, null);
    writeJson(FIRST_KEY, { at: Date.now(), products: safe(() => getSavedProducts().length, 0), counters: raw(POS_KEYS.counters), staff: raw('gc.hr.staff') });
  }
  return readJson(FIRST_KEY);
}
/** A new or empty shop: the demo's first-run view, or no products and no sales yet. */
export function isNewShop() {
  if (firstRun()) return true;
  return safe(() => allProducts().length === 0 && getSales().length === 0, false);
}

// a gateway or courier set up (in the first-run view: set up after it started)
const partnerSet = (kind, base) => {
  const cfg = safe(() => getConfig(), {});
  const list = safe(() => getAllPartners(cfg), []).filter((p) => p.kind === kind);
  if (!base) return list.length > 0;
  return list.some((p) => ((cfg.setup || {})[p.id] || {}).at >= base.at);
};
const STEPS = [
  { id: 'products', module: 'catalog', label: 'Add your products', href: '/add-product', done: (b) => (b ? safe(() => getSavedProducts().length, 0) > b.products : safe(() => allProducts().length, 0) > 0) },
  { id: 'payment', module: 'commerce', label: 'Connect a payment', href: '/connections?group=payments', done: (b) => partnerSet('Gateway', b) },
  { id: 'courier', module: 'online', label: 'Set up a courier', href: '/connections?group=delivery', done: (b) => partnerSet('Courier', b) },
  { id: 'counter', module: 'pos', label: 'Set up a counter', href: '/pos-manage', done: (b) => (b ? raw(POS_KEYS.counters) !== b.counters : safe(() => getCounters().length, 0) > 0) },
  { id: 'staff', module: 'hr', label: 'Invite your staff', href: '/staff-create', done: (b) => (b ? raw('gc.hr.staff') !== b.staff : true) },
];

/** The setup checklist on a new shop's Home; null when the shop is set up, or once dismissed or done. */
export function Readiness({ ed }) {
  const [state, setState] = useState(null);
  useEffect(() => {
    const read = () => {
      if (!isNewShop() || (readJson(READY_KEY) || {}).dismissed) { setState(null); return; }
      const base = firstRun();
      const steps = STEPS.filter((s) => hasModule(s.module, ed)).map((s) => ({ ...s, ok: safe(() => s.done(base), false) }));
      setState(steps.every((s) => s.ok) ? null : steps);
    };
    read();
    ['focus', 'storage', 'gc:connections', 'gc:ledger'].forEach((e) => window.addEventListener(e, read));
    return () => ['focus', 'storage', 'gc:connections', 'gc:ledger'].forEach((e) => window.removeEventListener(e, read));
  }, [ed]);
  if (!state) return null;
  const done = state.filter((s) => s.ok).length;
  const hide = () => { writeJson(READY_KEY, { dismissed: true, at: Date.now() }); setState(null); };
  return (
    <section className="ix-card hx-ready" aria-labelledby="hx-ready-h">
      <header className="ix-card__head"><h2 id="hx-ready-h">Set up your shop</h2><span>{done} of {state.length} done</span></header>
      <div className="ix-card__body">
        <div className="hx-bar" aria-hidden="true"><i style={{ width: `${Math.round((done / state.length) * 100)}%` }} /></div>
        <div className="hx-steps">
          {state.map((s) => (
            <div key={s.id} className={'hx-step' + (s.ok ? ' is-done' : '')}>
              <Icon name={s.ok ? 'circle-check' : 'circle'} width="18" height="18" aria-hidden="true" />
              <span className="hx-step__t">{s.label}{s.ok ? <span className="sr-only"> (done)</span> : null}</span>
              {s.ok ? null : <Link href={s.href} className="ix-btn ix-btn--sm">Start</Link>}
            </div>
          ))}
        </div>
        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" style={{ marginTop: 'var(--space-2)' }} onClick={hide}>Dismiss</button>
      </div>
    </section>
  );
}

/** Small observations with their numbers, kept apart from the to-do. items: { key, text, evidence, href, dir: 'up' | 'down' }. */
export function InsightsCard({ items, scope }) {
  return (
    <section className="ix-card" aria-labelledby="hx-ins-h">
      <header className="ix-card__head"><h2 id="hx-ins-h">Insights</h2>{scope ? <span className="hx-scope">{scope}</span> : null}</header>
      <div className="ix-card__body">
        {items && items.length ? (
          <div className="hx-ins">
            {items.slice(0, 3).map((x) => {
              const body = (<><Icon name={x.dir === 'down' ? 'trending-down' : 'trending-up'} width="16" height="16" aria-hidden="true" /><span><b>{x.text}</b><small>{x.evidence}</small></span></>);
              return x.href ? <Link key={x.key} href={x.href} className={'hx-in is-' + x.dir}>{body}</Link> : <div key={x.key} className={'hx-in is-' + x.dir}>{body}</div>;
            })}
          </div>
        ) : <p className="hx-empty">No big changes this week.</p>}
      </div>
    </section>
  );
}

/** "Sales up 18% vs last Friday" from two amounts; null when the change is small or there is nothing to compare. */
export function changeInsight({ key, what, now, before, vs, evidence, href, min = 10 }) {
  if (!before || before <= 0 || now == null) return null;
  const p = Math.round(((now - before) / before) * 100);
  if (Math.abs(p) < min) return null;
  return { key, text: `${what} ${p >= 0 ? 'up' : 'down'} ${Math.abs(p)}% vs ${vs}`, evidence, href, dir: p >= 0 ? 'up' : 'down' };
}
