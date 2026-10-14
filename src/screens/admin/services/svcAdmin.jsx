'use client';
// svcAdmin — what the super admin's Services pages share: useSvc() (lib/platform/services.js after mount, re-read on
// change and from other tabs, every minute for the deadlines), the status badge, money and time words, and the CSS.

import React, { useEffect, useState } from 'react';
import { StatusBadge } from '@/components/ui';
import { read, EVENT, KEY, STATUS, statusLabel } from '@/lib/platform/services';

export const tk = (n) => '৳' + Math.round(n || 0).toLocaleString('en-IN');
export const DAY = 864e5;
export const dShort = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—');
export const dTime = (ms) => (ms ? new Date(ms).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
export const qp = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');
/** "3 d 4 h left" · "2 d late" · "paused" */
export function slaWord(st) {
  if (!st.due || !['brief', 'progress', 'qa', 'waiting'].includes(st.status)) return '';
  if (st.waiting) return 'Paused · waiting for the merchant';
  const ms = st.left;
  const abs = Math.abs(ms), d = Math.floor(abs / DAY), h = Math.floor((abs % DAY) / 3600e3);
  const w = d ? `${d} d ${h} h` : `${h} h`;
  return ms >= 0 ? w + ' left' : w + ' late';
}

export function useSvc() {
  const [s, set] = useState({ ready: false, db: null, tick: 0 });
  useEffect(() => {
    const load = () => set((x) => ({ ready: true, db: read(), tick: x.tick + 1 }));
    load();
    const onStorage = (e) => { if (!e.key || e.key === KEY) load(); };
    window.addEventListener(EVENT, load);
    window.addEventListener('storage', onStorage);
    const iv = window.setInterval(load, 60000);
    return () => { window.removeEventListener(EVENT, load); window.removeEventListener('storage', onStorage); window.clearInterval(iv); };
  }, []);
  return s;
}

export function OrderStatus({ status }) {
  const x = STATUS[status] || { tone: 'neutral' };
  return <StatusBadge tone={x.tone}>{statusLabel(status, true)}</StatusBadge>;
}

export const SVA_CSS = `
.sva-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}
.sva-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sva-pad p{margin:0}
.sva-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.sva-late{color:var(--text-danger)}
.sva-paused{color:var(--text-warning)}
.sva-row{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.sva-filters{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.sva-filters select{width:auto;min-width:160px}
.sva-load{display:flex;align-items:center;gap:8px;font-size:var(--text-xs);color:var(--text-muted)}
.sva-load i{width:80px;height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.sva-load i b{display:block;height:100%;background:var(--primary)}
.sva-load i b.is-full{background:var(--error)}
.sva-thread{display:flex;flex-direction:column;gap:var(--space-3);max-height:520px;overflow-y:auto;padding:var(--space-4)}
.sva-msg{display:flex;flex-direction:column;gap:3px;max-width:80%;align-self:flex-start}
.sva-msg.is-us{align-self:flex-end;align-items:flex-end}
.sva-msg.is-sys{align-self:center;align-items:center;text-align:center;max-width:92%}
.sva-msg .sva-b{padding:8px 12px;border-radius:var(--radius-xl);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-heading);white-space:pre-wrap;overflow-wrap:anywhere}
.sva-msg.is-us .sva-b{background:var(--fill-primary-soft)}
.sva-msg.is-note .sva-b{background:var(--fill-warning-soft);border:1px dashed var(--warning)}
.sva-msg.is-sys .sva-b{background:none;padding:0;font-size:var(--text-xs);color:var(--text-muted)}
.sva-msg small{font-size:var(--text-xs);color:var(--text-muted)}
.sva-compose{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
.sva-files{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.sva-files li{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}
.sva-files li small{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted)}
.sva-form{display:flex;flex-direction:column;gap:var(--space-3)}
.sva-form .gc-label{margin-bottom:4px}
.sva-grid2{display:grid;grid-template-columns:repeat(auto-fit,minmax(160px,1fr));gap:var(--space-3)}
.sva-builder{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.sva-builder li{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr) auto auto;gap:var(--space-2);align-items:start;padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.sva-builder li .sva-opts{grid-column:1/-1}
.sva-chk{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-sm);white-space:nowrap}
.sva-kpis{display:grid;grid-template-columns:repeat(auto-fit,minmax(120px,1fr));gap:var(--space-2)}
@media (max-width:640px){.sva-builder li{grid-template-columns:1fr 1fr}.sva-msg{max-width:94%}}
`;
