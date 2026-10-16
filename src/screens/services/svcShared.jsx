'use client';
// svcShared — what the merchant's Services pages share (Services area: /services, /service-detail, /service-order,
// /my-services, /my-service): the page frame, useServices() (re-reads lib/platform/services.js on change and from other
// tabs, after mount), money words, the status badge, the steps and a star picker.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { StatusBadge, EmptyState } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { read, EVENT, KEY, STATUS, statusLabel, SELF_SHOP } from '@/lib/platform/services';
import { canUse, MARKET_EVENT, MARKET_KEY } from '@/lib/platform/marketAccess';

export const tk = (n) => formatBDT(Math.round(n || 0));
export const query = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');
export const DAY = 864e5;
export const dateText = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const shortDate = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—');
export const timeText = (ms) => (ms ? new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
export const daysWord = (n) => (n === 1 ? '1 day' : n + ' days');
/** "8 days left", "Due today", "3 days late" */
export function dueWord(ms) {
  if (ms == null) return '';
  const d = Math.ceil(ms / DAY);
  if (d > 1) return d + ' days left';
  if (d === 1) return '1 day left';
  if (d === 0) return 'Due today';
  return Math.abs(d) + (d === -1 ? ' day late' : ' days late');
}

/** The Services data after mount (empty before, so the server render and the first paint agree). */
export function useServices() {
  const [state, setState] = useState({ ready: false, db: null, tick: 0 });
  useEffect(() => {
    const load = () => setState((s) => ({ ready: true, db: read(), tick: s.tick + 1 }));
    load();
    const onStorage = (e) => { if (!e.key || e.key === KEY) load(); };
    window.addEventListener(EVENT, load);
    window.addEventListener('storage', onStorage);
    const iv = window.setInterval(load, 60000);   // deadlines and "closes by itself" move with the clock
    return () => { window.removeEventListener(EVENT, load); window.removeEventListener('storage', onStorage); window.clearInterval(iv); };
  }, []);
  return state;
}

export function SvcStatus({ status, admin }) {
  const s = STATUS[status] || { tone: 'neutral' };
  return <StatusBadge tone={s.tone}>{statusLabel(status, admin)}</StatusBadge>;
}

export function Stars({ value = 0, size = 14 }) {
  const v = Math.round(value);
  return <span className="svc-stars" aria-label={value ? value.toFixed(1) + ' of 5 stars' : 'No rating yet'}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width={size} height={size} aria-hidden="true" style={{ fill: i <= v ? 'currentColor' : 'none' }} />)}</span>;
}
export function StarPicker({ value, onChange, label = 'Your rating' }) {
  return (
    <span className="svc-starpick" role="radiogroup" aria-label={label}>
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={i + (i === 1 ? ' star' : ' stars')} className={i <= value ? 'is-on' : ''} onClick={() => onChange(i)}>
          <Icon name="star" width="24" height="24" aria-hidden="true" style={{ fill: i <= value ? 'currentColor' : 'none' }} />
        </button>
      ))}
    </span>
  );
}

/** The order's road: Brief received → In progress → (Waiting for you) → In review → Delivered → Closed. */
export function Steps({ status }) {
  const order = ['brief', 'progress', 'qa', 'delivered', 'closed'];
  const at = status === 'waiting' ? 1 : Math.max(0, order.indexOf(status));
  const words = { brief: 'Brief received', progress: status === 'waiting' ? 'Waiting for you' : 'In progress', qa: 'In review', delivered: 'Delivered', closed: 'Closed' };
  return (
    <ol className="svc-steps" aria-label="Where your order is">
      {order.map((k, i) => (
        <li key={k} className={(i < at ? 'is-done' : '') + (i === at ? ' is-now' : '') + (i === at && status === 'waiting' ? ' is-wait' : '')} aria-current={i === at ? 'step' : undefined}>
          <span className="svc-steps__dot" aria-hidden="true">{i < at ? <Icon name="check" width="12" height="12" /> : null}</span>
          <span>{words[k]}</span>
        </li>
      ))}
    </ol>
  );
}

export const SVC_CSS = `
.svc-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(260px,1fr));gap:var(--space-3)}
.svc-card{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);color:inherit;text-decoration:none;box-shadow:0 1px 2px rgba(15,23,42,.04)}
.svc-card:hover,.svc-card:focus-visible{border-color:var(--primary)}
.svc-card--pic{padding:0;overflow:hidden}
.svc-card--pic>*:not(.svc-cover){margin-inline:var(--space-4)}
.svc-card--pic>.svc-card__foot{margin-bottom:var(--space-4)}
.svc-cover{display:grid;place-items:center;aspect-ratio:16/9;background:var(--surface-subtle) top center/cover no-repeat;border-bottom:1px solid var(--border-subtle);color:var(--primary)}
.svc-cover.is-tile{background:linear-gradient(135deg,var(--fill-primary-soft),var(--surface-subtle))}
.svc-card__top{display:flex;align-items:center;gap:var(--space-2)}
.svc-ico{display:grid;place-items:center;flex:none;width:36px;height:36px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.svc-card b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-card p{margin:0;font-size:var(--text-sm);color:var(--text-body);line-height:1.5}
.svc-card__foot{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;margin-top:auto;font-size:var(--text-xs);color:var(--text-muted)}
.svc-price{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-stars{display:inline-flex;gap:1px;color:var(--warning);vertical-align:middle}
.svc-starpick{display:inline-flex;gap:4px}
.svc-starpick button{display:grid;place-items:center;width:40px;height:40px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.svc-starpick button.is-on{color:var(--warning)}
.svc-starpick button:focus-visible{outline:2px solid var(--primary)}
.svc-steps{display:flex;flex-wrap:wrap;gap:6px 0;margin:0;padding:0;list-style:none}
.svc-steps li{display:flex;align-items:center;gap:6px;flex:1;min-width:110px;font-size:var(--text-xs);color:var(--text-muted)}
.svc-steps li::after{content:'';flex:1;height:2px;margin:0 6px;background:var(--border-subtle)}
.svc-steps li:last-child::after{display:none}
.svc-steps__dot{display:grid;place-items:center;flex:none;width:20px;height:20px;border-radius:var(--radius-full);border:2px solid var(--border-field);background:var(--surface-card);color:var(--text-on-dark)}
.svc-steps li.is-done .svc-steps__dot{background:var(--success);border-color:var(--success)}
.svc-steps li.is-done::after{background:var(--success)}
.svc-steps li.is-now{color:var(--text-heading);font-weight:var(--weight-medium)}
.svc-steps li.is-now .svc-steps__dot{border-color:var(--primary);box-shadow:0 0 0 3px var(--fill-primary-soft)}
.svc-steps li.is-wait .svc-steps__dot{border-color:var(--warning)}
.svc-pkgs{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:var(--space-3)}
.svc-pkg{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.svc-pkg.is-on{border-color:var(--primary);box-shadow:0 0 0 1px var(--primary)}
.svc-pkg h3{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-pkg__price{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-pkg__price small{font-family:var(--font-sans);font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--text-muted)}
.svc-pkg ul,.svc-list{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:6px;font-size:var(--text-sm);color:var(--text-body)}
.svc-pkg li,.svc-list li{display:flex;gap:6px;align-items:flex-start}
.svc-pkg li svg,.svc-list li svg{flex:none;margin-top:3px;color:var(--text-success)}
.svc-howto{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:6px;font-size:var(--text-sm);color:var(--text-body)}
.svc-meta{display:flex;flex-wrap:wrap;gap:4px 12px;font-size:var(--text-xs);color:var(--text-muted)}
.svc-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.svc-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-pad p{margin:0}
.svc-need{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4);border:1px solid var(--warning);border-radius:var(--radius-xl);background:var(--fill-warning-soft)}
.svc-need h2{margin:0;display:flex;align-items:center;gap:8px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-need p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.svc-row{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.svc-thread{display:flex;flex-direction:column;gap:var(--space-3);max-height:520px;overflow-y:auto;padding:var(--space-4)}
.svc-msg{display:flex;flex-direction:column;gap:4px;max-width:78%;align-self:flex-start}
.svc-msg.is-me{align-self:flex-end;align-items:flex-end}
.svc-msg.is-sys{align-self:center;max-width:92%;align-items:center;text-align:center}
.svc-msg.is-note .svc-bubble{background:var(--fill-warning-soft);border:1px dashed var(--warning)}
.svc-bubble{padding:8px 12px;border-radius:var(--radius-xl);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.svc-msg.is-me .svc-bubble{background:var(--primary);color:var(--text-on-dark)}
.svc-msg.is-sys .svc-bubble{background:none;padding:0;color:var(--text-muted);font-size:var(--text-xs)}
.svc-msg small{font-size:var(--text-xs);color:var(--text-muted)}
.svc-compose{display:flex;gap:var(--space-2);align-items:flex-end;padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.svc-compose textarea{flex:1;min-height:40px;resize:vertical}
.svc-files{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.svc-files li{display:flex;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.svc-files li b{font-weight:var(--weight-medium);color:var(--text-heading);overflow-wrap:anywhere}
.svc-files li small{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.svc-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(140px,1fr));gap:var(--space-2)}
.svc-kpi{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.svc-kpi span{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.svc-kpi b{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-field{display:flex;flex-direction:column;gap:4px}
.svc-field .gc-label{margin:0}
.svc-sum{display:flex;flex-direction:column;gap:6px;font-size:var(--text-sm)}
.svc-sum div{display:flex;justify-content:space-between;gap:var(--space-2)}
.svc-sum div span:last-child{font-family:var(--font-data)}
.svc-sum .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
.svc-pay{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:var(--space-2)}
.svc-pay label{display:flex;align-items:center;gap:8px;min-height:44px;padding:0 12px;border:1px solid var(--border-field);border-radius:var(--radius-lg);font-size:var(--text-sm);cursor:pointer}
.svc-pay label.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.svc-bar{display:block;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.svc-bar b{display:block;height:100%;border-radius:var(--radius-full);background:var(--success)}
.svc-upd{display:flex;flex-direction:column;gap:var(--space-3);margin:0;padding:0 0 0 18px;list-style:none;border-left:2px solid var(--border-subtle)}
.svc-upd li{position:relative;display:flex;flex-direction:column;gap:2px;font-size:var(--text-sm);color:var(--text-body)}
.svc-upd li::before{content:'';position:absolute;left:-24px;top:5px;width:10px;height:10px;border-radius:var(--radius-full);background:var(--surface-card);border:2px solid var(--primary)}
.svc-upd small{font-size:var(--text-xs);color:var(--text-muted)}
.svc-note{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-sm);color:var(--text-body)}
.svc-note svg{flex:none;margin-top:2px;color:var(--text-info)}
@media (max-width:640px){.svc-msg{max-width:92%}.svc-steps{flex-wrap:nowrap}.svc-steps li{flex:1 1 auto;min-width:0}.svc-steps li span:last-child{display:none}.svc-steps li.is-now{flex:0 0 auto}.svc-steps li.is-now span:last-child{display:inline;white-space:nowrap}}
`;

/** May this store use a GridCommerce offer (Batch D, lib/platform/marketAccess.js)? { ready, ok, why, code } after mount. */
export function useMarket(module) {
  const [st, setSt] = useState({ ready: false, ok: true, why: '', code: '' });
  useEffect(() => {
    const load = () => setSt({ ready: true, ...canUse(module, SELF_SHOP) });
    load();
    const onStorage = (e) => { if (!e.key || e.key === MARKET_KEY) load(); };
    window.addEventListener(MARKET_EVENT, load); window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(MARKET_EVENT, load); window.removeEventListener('storage', onStorage); };
  }, [module]);
  return st;
}
/** What a store sees when GridCommerce has closed a module to it. */
export function MarketClosed({ title, why, mine }) {
  return <section className="ix-card" style={{ padding: 'var(--space-6) var(--space-4)' }}><EmptyState icon="lock" title={title} body={why} actionLabel={mine ? mine[0] : undefined} onAction={mine ? () => { window.location.href = mine[1]; } : undefined} /></section>;
}

/** The merchant page frame (shell + Services crumb). `gate` = a module in marketAccess: closed stores see why instead. */
export function SvcFrame({ screen, active, page, css = '', narrow, after, children, gate, crumb = 'Services' }) {
  const m = useMarket(gate || 'services');
  const closed = !!gate && m.ready && !m.ok;
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: SVC_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main">
          <Topbar crumb={crumb} page={page} />
          <div className="gc-shell__content">
            <div className={'ix-page' + (narrow ? ' ix-page--narrow' : '')}>{closed ? <MarketClosed title={gate === 'shop' ? 'Grid Shop isn’t open for your store' : gate === 'partners' ? 'Grid Partners isn’t open for your store' : 'Expert help isn’t open for your store'} why={m.why} mine={gate === 'services' ? ['My services', '/my-services'] : null} /> : children}</div>
          </div>
        </main>
      </div>
      {closed ? null : after}
    </div>
  );
}
