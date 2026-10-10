'use client';
// Website (super admin), part 2 — what Overview, Media, Landing pages and Forms share: the CSS, status badges, a
// file's thumbnail (the real file from gridcommerce.net, an icon when it cannot load), form fields and time text.
// Data: lib/admin/website2.js. Pages / Content / Blog / SEO have their own webShared.jsx.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { StatusBadge } from '@/components/ui';
import { staff as currentStaff } from '@/lib/platform/store';
import { daysBetween, dm, dmy, hm, yearOf } from '@/lib/platform/util';
import { assetUrl, LP_TONE, SUB_TONE, FORM_TONE } from '@/lib/admin/website2';

export const me = () => currentStaff().name;
export const plural = (n, one, many) => n.toLocaleString('en-IN') + ' ' + (n === 1 ? one : many || one + 's');
export const num = (n) => Math.round(Number(n) || 0).toLocaleString('en-IN');

/** "Today 10:02" · "Yesterday 18:40" · "3 days ago" · "02 Sep" · "02 Sep 2025" */
export function when(ms, t) {
  if (!ms) return '—';
  const n = daysBetween(ms, t);
  if (n <= 0) return 'Today ' + hm(ms);
  if (n === 1) return 'Yesterday ' + hm(ms);
  if (n < 7) return n + ' days ago';
  return yearOf(ms) === yearOf(t) ? dm(ms) : dmy(ms);
}
export const stamp = (ms) => (ms ? dmy(ms) + ' · ' + hm(ms) : '—');

export const LpBadge = ({ s }) => <StatusBadge tone={LP_TONE[s] || 'neutral'} icon={s === 'Published' ? 'globe' : s === 'Archived' ? 'archive' : undefined}>{s}</StatusBadge>;
export const SubBadge = ({ s }) => <StatusBadge tone={SUB_TONE[s] || 'neutral'} icon={s === 'New' ? 'sparkles' : s === 'Spam' ? 'ban' : undefined}>{s}</StatusBadge>;
export const FormBadge = ({ s }) => <StatusBadge tone={FORM_TONE[s] || 'neutral'}>{s}</StatusBadge>;

export const TYPE_ICON = { image: 'image', icon: 'shapes', video: 'film', document: 'file-text' };

/** A file's preview: the image from the live site; an icon for video, documents, local uploads or when it fails. */
export function Thumb({ m, size = 40, fit = 'cover', big }) {
  const [bad, setBad] = useState(false);
  const canShow = (m.type === 'image' || m.type === 'icon') && !m.local && !bad;
  return (
    <span className={'w2-thumb' + (big ? ' w2-thumb--big' : '') + (m.type === 'icon' ? ' w2-thumb--icon' : '')} style={big ? undefined : { width: size, height: size }} aria-hidden={big ? undefined : 'true'}>
      {canShow
        ? <img src={assetUrl(m.path)} alt={big ? (m.alt.en || '') : ''} loading="lazy" decoding="async" style={{ objectFit: fit }} onError={() => setBad(true)} />
        : <Icon name={TYPE_ICON[m.type] || 'file'} width={big ? 32 : 18} height={big ? 32 : 18} />}
    </span>
  );
}

/** A label, the control, and its error (or a hint) under it. */
export function Field({ id, label, error, hint, children, tip }) {
  return (
    <div className="gc-field">
      <label className="gc-label" htmlFor={id}>{label}{tip}</label>
      {children}
      {error ? <p className="gc-help gc-help--error" id={id + '-err'} role="alert">{error}</p> : hint ? <p className="gc-help">{hint}</p> : null}
    </div>
  );
}
export const ctl = (error, select) => ({ className: 'gc-input' + (select ? ' gc-select' : '') + (error ? ' gc-input--error' : ''), 'aria-invalid': error ? true : undefined });

/** A switch with its label. */
export function Toggle({ on, onChange, label, hint }) {
  return (
    <div className="w2-toggle">
      <span className="w2-toggle__txt"><span>{label}</span>{hint ? <small>{hint}</small> : null}</span>
      <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" onClick={() => onChange(!on)}><span className="gc-switch__knob" /></button>
    </div>
  );
}

export function Skeleton({ label, tall }) {
  return <div className={'w2-skel' + (tall ? ' w2-skel--tall' : '')} aria-busy="true" aria-label={label} />;
}

export function Problem({ text, onRetry }) {
  return (
    <section className="ix-card w2-err" role="alert">
      <Icon name="triangle-alert" width="22" height="22" aria-hidden="true" />
      <p>{text}</p>
      {onRetry ? <button type="button" className="ix-btn" onClick={onRetry}>Try again</button> : null}
    </section>
  );
}

export const W2_CSS = `
.w2-skel{height:320px;border-radius:var(--radius-xl);background:linear-gradient(90deg,var(--surface-card),var(--surface-subtle),var(--surface-card));background-size:200% 100%;animation:w2-sk 1.4s ease infinite}
.w2-skel--tall{height:520px}
@keyframes w2-sk{from{background-position:100% 0}to{background-position:-100% 0}}
.w2-err{display:flex;flex-direction:column;align-items:center;gap:var(--space-3);padding:var(--space-8) var(--space-4);text-align:center;font-size:var(--text-sm);color:var(--text-body)}
.w2-err svg{color:var(--text-danger)}
.w2-err p{margin:0}
.w2-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.w2-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);color:var(--text-heading)}
.w2-muted{color:var(--text-muted)}
.w2-bn{font-family:var(--font-bn)}
.w2-body{padding:var(--space-3) var(--space-4) var(--space-4)}
.w2-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.w2-filters .gc-filterbar__search{max-width:320px}
.w2-two{display:flex;flex-direction:column;min-width:0}
.w2-two>span,.w2-two>a{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.w2-two small{overflow:hidden;text-overflow:ellipsis;white-space:nowrap;font-size:var(--text-xs);color:var(--text-muted)}
.w2-two small.w2-data{font-family:var(--font-data)}
.w2-cell{max-width:280px}
.w2-thumb{display:grid;flex:none;place-items:center;overflow:hidden;border:1px solid var(--border-subtle);border-radius:var(--radius-md);background:var(--surface-subtle);color:var(--text-muted)}
.w2-thumb img{width:100%;height:100%;display:block}
.w2-thumb--icon{background:var(--surface-card)}
.w2-thumb--icon img{padding:4px;object-fit:contain!important}
.w2-thumb--big{width:100%;aspect-ratio:16/10;border-radius:var(--radius-lg);background:repeating-conic-gradient(var(--surface-subtle) 0 25%,var(--surface-card) 0 50%) 0 0/16px 16px}
.w2-thumb--big img{object-fit:contain!important}
.w2-form{display:flex;flex-direction:column;gap:var(--space-3)}
.w2-form p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.w2-form__two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.w2-form textarea.gc-input{height:auto;min-height:88px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.w2-formerr{margin:0;font-size:var(--text-sm);color:var(--text-danger)}
.w2-sec{margin:var(--space-2) 0 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading);text-transform:none}
.w2-toggle{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px}
.w2-toggle__txt{display:flex;flex-direction:column;min-width:0;font-size:var(--text-sm);color:var(--text-heading)}
.w2-toggle__txt small{font-size:var(--text-xs);color:var(--text-muted)}
.w2-copy{display:flex;align-items:center;gap:var(--space-2);min-width:0;padding:6px var(--space-2) 6px var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.w2-copy code{flex:1;min-width:0;overflow-wrap:anywhere;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-heading)}
.w2-list{margin:0;padding:0;list-style:none}
.w2-list li{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:40px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.w2-list li:first-child{border-top:0}
.w2-hist{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-2)}
.w2-hist li{display:grid;grid-template-columns:8px minmax(0,1fr);gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body)}
.w2-hist li::before{content:'';width:8px;height:8px;margin-top:6px;border-radius:var(--radius-full);background:var(--border-strong)}
.w2-hist small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.w2-chip{display:inline-flex;align-items:center;gap:4px;height:24px;padding:0 var(--space-2);border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.w2-chips{display:flex;flex-wrap:wrap;gap:4px}
.ix-table tbody tr:focus-visible td{background:var(--surface-subtle)}
.ix-table tbody tr:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
@media (max-width:640px){
  .w2-form__two{grid-template-columns:minmax(0,1fr)}
  .w2-filters{padding:6px}
  .w2-cell{max-width:none}
}
@media (prefers-reduced-motion:reduce){.w2-skel{animation:none}}
`;
