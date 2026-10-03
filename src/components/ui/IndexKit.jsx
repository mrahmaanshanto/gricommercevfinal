'use client';
// IndexKit — the parts of a Shopify-style page (docs/reference-ux.md › 7): a one-line title row, one strip of key
// figures, and the index card (view tabs, search and filters, bulk bar, a compact table, the pager). A list shows
// only what you act on; the rest is one click away, on the record. Screens keep their own logic and data; these
// only lay it out. Styles: design-system.css › "Index kit".
//
//   <ShopHeader icon title about secondary more primary />   secondary / more / primary: { label, href | onClick, icon }
//   <MetricStrip lead items />                               items: { label, value, sub, href | onClick (+ on), spark: number[], icon }
//   <IndexTabs tabs label />                                 tabs: { key, label, count, on, onClick, id }
//   <SearchField value onChange placeholder onDone />  <Pager label atStart atEnd prev next />  <LearnMore topic />
//   <RecordHeader back | onBack title badges meta secondary more primary />   a record or a form page (onBack: a guarded back)
//   <KV rows />                                                          label / value rows for a side card
// Layout classes (design-system.css): ix-page (one column) · ix-page--narrow (Home, forms, settings: 1040px) ·
// ix-record > ix-main + ix-side (a record: work on the left, facts on the right) · ix-card (+ __head / __body)

import React, { useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';

/** A button or a link, the same size and look. */
export function Act({ a, cls = 'ix-btn', role, onDone }) {
  if (!a) return null;
  const inner = <>{a.icon ? <Icon name={a.icon} width="16" height="16" aria-hidden="true" /> : null}{a.label ? <span>{a.label}</span> : null}</>;
  const click = (e) => { if (a.onClick) a.onClick(e); if (onDone) onDone(); };
  if (a.href) return <Link href={a.href} className={cls} role={role} onClick={onDone} aria-label={a.aria}>{inner}</Link>;
  return <button type="button" className={cls} role={role} onClick={click} disabled={a.disabled} aria-label={a.aria}>{inner}</button>;
}

/** A small menu under a button; closes on a pick, Escape, a click outside, a scroll or a resize. The list is drawn
 *  on the page body at a fixed position, so a card, a table strip or a dialog never cuts it off; it opens upward when
 *  there is no room below. align: 'end' (right edges line up) or 'start'. */
export function Menu({ label = 'More actions', icon, items, cls = 'ix-btn', align = 'end' }) {
  const [at, setAt] = useState(null);   // where the open list sits, or null when closed
  const btn = useRef(null);
  const pop = useRef(null);
  const open = !!at;
  const place = () => {
    const r = btn.current.getBoundingClientRect();
    const up = r.bottom + 260 > window.innerHeight && r.top > 260;
    setAt({
      ...(up ? { bottom: window.innerHeight - r.top + 4 } : { top: r.bottom + 4 }),
      ...(align === 'start' ? { left: Math.max(8, r.left) } : { right: Math.max(8, window.innerWidth - r.right) }),
    });
  };
  useEffect(() => {
    if (!open) return undefined;
    const off = (e) => { if (!(btn.current && btn.current.contains(e.target)) && !(pop.current && pop.current.contains(e.target))) setAt(null); };
    const key = (e) => { if (e.key === 'Escape') { setAt(null); if (btn.current) btn.current.focus(); } };
    const shut = (e) => { if (!(pop.current && e.target instanceof Node && pop.current.contains(e.target))) setAt(null); };
    document.addEventListener('mousedown', off); document.addEventListener('keydown', key);
    window.addEventListener('scroll', shut, true); window.addEventListener('resize', shut);
    return () => {
      document.removeEventListener('mousedown', off); document.removeEventListener('keydown', key);
      window.removeEventListener('scroll', shut, true); window.removeEventListener('resize', shut);
    };
  }, [open]);
  if (!items || !items.length) return null;
  return (
    <span className="ix-menu">
      <button type="button" ref={btn} className={cls} aria-haspopup="menu" aria-expanded={open} aria-label={label || 'More actions'} onClick={() => (open ? setAt(null) : place())}>
        {icon ? <Icon name={icon} width="16" height="16" aria-hidden="true" /> : null}{label ? <span>{label}</span> : null}
        {label ? <Icon name="chevron-down" width="14" height="14" aria-hidden="true" /> : null}
      </button>
      {open ? createPortal(
        <span ref={pop} className="ix-menu__pop ix-menu__pop--fixed" role="menu" style={at}>
          {items.map((a, i) => <Act key={a.label + i} a={a} cls={'ix-menu__item' + (a.only ? ' ix-' + a.only : '') + (a.tone === 'danger' ? ' is-danger' : '')} role="menuitem" onDone={() => setAt(null)} />)}
        </span>, document.body) : null}
    </span>
  );
}

/** The title row: a small icon and the title, quiet buttons, "More actions", one primary button. On a phone the
 *  quiet buttons move into "More actions", so the title shares its row with the primary button. */
export function ShopHeader({ icon, title, about, secondary = [], more = [], primary, middle }) {
  const menu = [...secondary.map((a) => ({ ...a, only: 'phone' })), ...more];
  // `middle` sits in the title row between the title and the actions (e.g. the Inbox's Chats / Comments / Mentions tabs)
  return (
    <header className={'ix-head' + (middle ? ' ix-head--mid' : '')}>
      <h1 className="ix-head__title">{icon ? <Icon name={icon} width="18" height="18" aria-hidden="true" /> : null}<span>{title}</span></h1>
      {middle ? <div className="ix-head__mid">{middle}</div> : null}
      {about ? <span className="gc-pagehead__about" hidden>{about}</span> : null}
      <div className="ix-head__actions">
        {secondary.map((a) => <Act key={a.label} a={a} cls="ix-btn ix-head__sec" />)}
        <span className={more.length ? '' : 'ix-phone'}><Menu items={menu} icon="ellipsis" /></span>
        {primary ? <Act a={primary} cls="ix-btn ix-btn--primary" /> : null}
      </div>
    </header>
  );
}

/** A tiny trend line for a figure. No values (or all the same) draws a flat dashed line. */
export function Spark({ values }) {
  const v = (values || []).map((x) => Number(x) || 0);
  const W = 64, H = 24, P = 3;
  if (v.length < 2 || Math.max(...v) === Math.min(...v)) {
    return <svg className="ix-spark" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true"><path d={`M${P} ${H - P}H${W - P}`} stroke="currentColor" strokeWidth="1.5" strokeDasharray="2 3" fill="none" opacity=".45" /></svg>;
  }
  const lo = Math.min(...v), hi = Math.max(...v);
  const pts = v.map((x, i) => [P + (i * (W - 2 * P)) / (v.length - 1), H - P - ((x - lo) / (hi - lo)) * (H - 2 * P)]);
  return (
    <svg className="ix-spark" width={W} height={H} viewBox={`0 0 ${W} ${H}`} aria-hidden="true">
      <polyline points={pts.map((p) => p.join(',')).join(' ')} fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round" strokeLinecap="round" />
    </svg>
  );
}

// The icon a key figure gets from its label (an item's own `icon` wins; icon: false shows none). First match wins.
const FIG_ICONS = [
  [/return|refund|came back/i, 'undo-2'], [/overdue|late|breach|failed|fail/i, 'clock-alert'], [/rate|conversion|%|share|margin/i, 'percent'],
  [/courier|transit|on the way|delivery|deliver|ship/i, 'truck'], [/visitor|view|session|traffic/i, 'eye'], [/call/i, 'phone'],
  [/chat|message|unread|sms|whatsapp|comment|repl/i, 'messages-square'], [/ticket/i, 'life-buoy'], [/review|rating/i, 'star'],
  [/customer|member|buyer|people|staff|present|absent|leave|friend|invite|author|agent|team/i, 'users'],
  [/point|reward|loyal/i, 'gift'], [/coupon|offer|discount|promo/i, 'ticket-percent'], [/cart/i, 'shopping-cart'],
  [/order|sale|sold|bill|invoice|purchase/i, 'receipt'], [/stock|product|item|piece|pcs|inventory|bin|hold|damag|expir/i, 'package'],
  [/payout|partner|withdraw|settle/i, 'hourglass'], [/bank|wallet|cash|money|hand|balance|credit|paid|pay|due|owe|spend|spent|cost|value|profit|income|expense|vat|tax|total|৳/i, 'wallet'],
  [/today|week|month|year|day|date|since|next|schedul/i, 'calendar'], [/rule|run|automation|workflow/i, 'zap'], [/report/i, 'file-bar-chart'],
];
export const figIcon = (label) => { const t = String(label || ''); const hit = FIG_ICONS.find(([re]) => re.test(t)); return hit ? hit[1] : 'chart-column'; };

/** One card of key figures in a row (a period picker may lead), each with a small icon. On a phone it scrolls sideways. */
export function MetricStrip({ lead, items, label = 'Key figures' }) {
  return (
    <section className="ix-card ix-metrics" aria-label={label}>
      {lead ? <div className="ix-metric ix-metric--lead">{lead}</div> : null}
      {items.filter(Boolean).map((m) => {
        const body = (<>
          {m.icon === false ? null : <span className="ix-metric__icon" aria-hidden="true"><Icon name={m.icon || figIcon(m.label)} width="16" height="16" /></span>}
          <span className="ix-metric__text">
            <span className="ix-metric__label">{m.label}</span>
            <span className="ix-metric__value">{m.value}{m.sub ? <small className="ix-metric__sub">{m.sub}</small> : null}</span>
          </span>
          {m.spark !== undefined ? <Spark values={m.spark} /> : null}
        </>);
        if (m.href) return <Link key={m.label} href={m.href} className="ix-metric">{body}</Link>;
        if (m.onClick) return <button key={m.label} type="button" className={'ix-metric' + (m.on ? ' is-on' : '')} aria-pressed={m.on == null ? undefined : !!m.on} onClick={m.onClick}>{body}</button>;
        return <div key={m.label} className="ix-metric">{body}</div>;
      })}
    </section>
  );
}

/** The views of a list as small tabs (arrow keys move between them). */
export function IndexTabs({ tabs, label }) {
  const onKey = (e) => {
    const i = tabs.findIndex((t) => t.on);
    const n = e.key === 'ArrowRight' ? (i + 1) % tabs.length : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : -1;
    if (n < 0) return;
    e.preventDefault();
    tabs[n].onClick();
    const id = tabs[n].id;
    if (id) setTimeout(() => { const el = document.getElementById(id); if (el) el.focus(); }, 0);
  };
  return (
    <div className="ix-tabs" role="tablist" aria-label={label} onKeyDown={onKey}>
      {tabs.map((t) => (
        <button key={t.key} id={t.id} type="button" role="tab" className="ix-tab" aria-selected={!!t.on} tabIndex={t.on ? 0 : -1} onClick={t.onClick}>
          {t.label}{t.count != null ? <span className="ix-tab__n">{t.count}</span> : null}
        </button>
      ))}
    </div>
  );
}

/** The list's search box. */
export function SearchField({ value, onChange, placeholder, onDone, autoFocus }) {
  return (
    <label className="ix-search">
      <Icon name="search" width="16" height="16" aria-hidden="true" />
      <input type="search" value={value} onChange={onChange} placeholder={placeholder} aria-label={placeholder} autoFocus={autoFocus}
        onKeyDown={(e) => { if (e.key === 'Escape' && onDone) onDone(); }} />
    </label>
  );
}

/** "1–20 of 46" and the previous / next buttons, at the foot of the card. */
export function Pager({ label, atStart, atEnd, prev, next }) {
  return (
    <div className="ix-foot">
      <span>{label}</span>
      <span className="ix-pager">
        <button type="button" className="ix-btn ix-btn--icon" aria-label="Previous page" disabled={atStart} onClick={prev}><Icon name="chevron-left" width="16" height="16" aria-hidden="true" /></button>
        <button type="button" className="ix-btn ix-btn--icon" aria-label="Next page" disabled={atEnd} onClick={next}><Icon name="chevron-right" width="16" height="16" aria-hidden="true" /></button>
      </span>
    </div>
  );
}

/** "Learn more about orders" under the card: opens the page's Help. */
export function LearnMore({ topic }) {
  return <button type="button" className="ix-learn" onClick={() => window.dispatchEvent(new CustomEvent('gc:help'))}>Learn more about {topic}</button>;
}

/** The title row of a record or a form (Shopify's order / product page): a back arrow to its list, the title, small
 *  status badges, an optional meta line, quiet buttons, "More actions" and one primary button. */
export function RecordHeader({ back, onBack, backLabel = 'Back', title, badges, meta, about, secondary = [], more = [], primary }) {
  const menu = [...secondary.map((a) => ({ ...a, only: 'phone' })), ...more];
  return (
    <header className="ix-head ix-head--record">
      {onBack ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={backLabel} onClick={onBack}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /></button>
        : back ? <Link href={back} className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={backLabel}><Icon name="arrow-left" width="16" height="16" aria-hidden="true" /></Link> : null}
      <div className="ix-head__text">
        <h1 className="ix-head__title"><span>{title}</span>{badges ? <span className="ix-head__badges">{badges}</span> : null}</h1>
        {meta ? <p className="ix-head__meta">{meta}</p> : null}
      </div>
      {about ? <span className="gc-pagehead__about" hidden>{about}</span> : null}
      <div className="ix-head__actions">
        {secondary.map((a) => <Act key={a.label} a={a} cls="ix-btn ix-head__sec" />)}
        <span className={more.length ? '' : 'ix-phone'}><Menu items={menu} icon="ellipsis" /></span>
        {primary ? <Act a={primary} cls="ix-btn ix-btn--primary" /> : null}
      </div>
    </header>
  );
}

/** Label / value rows (a side card's facts). rows: [[label, value], …]; a falsy row is skipped. */
export function KV({ rows }) {
  return (
    <dl className="ix-kv">
      {rows.filter(Boolean).map(([k, val]) => <React.Fragment key={k}><dt>{k}</dt><dd>{val == null || val === '' ? '—' : val}</dd></React.Fragment>)}
    </dl>
  );
}
