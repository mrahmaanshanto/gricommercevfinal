'use client';
// careerShared — what every Grid Career screen shares (merchant Staff & HR › Hiring, the super admin's Grid Career area and
// the public pages): useCareer() (lib/platform/career.js after mount, re-read on change and from other tabs), the badges,
// words for dates and file sizes, the star picker and the CSS. Data: lib/platform/career.js.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { StatusBadge } from '@/components/ui';
import { read, CAREER_EVENT, CAREER_KEY, JOB_STATUS, jobState, stageLabel, stageTone } from '@/lib/platform/career';

export const qp = (k) => (typeof window === 'undefined' ? '' : new URLSearchParams(window.location.search).get(k) || '');
export const dShort = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' }) : '—');
export const dLong = (ms) => (ms ? new Date(ms).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '—');
export const dTime = (ms) => (ms ? new Date(ms).toLocaleString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', hour: 'numeric', minute: '2-digit' }) : '—');
export const sizeText = (b) => (!b ? '' : b >= 1048576 ? (b / 1048576).toFixed(1) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
export const ago = (ms) => {
  if (!ms) return '';
  const d = Math.floor((Date.now() - ms) / 864e5);
  if (d <= 0) { const h = Math.floor((Date.now() - ms) / 3600e3); return h <= 0 ? 'just now' : h + ' h ago'; }
  return d === 1 ? 'yesterday' : d + ' days ago';
};
/** 'YYYY-MM-DDTHH:mm' in this browser's time for a datetime-local input, and back. */
export const toLocalInput = (ms) => { if (!ms) return ''; const d = new Date(ms); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
export const toDateInput = (ms) => (ms ? toLocalInput(ms).slice(0, 10) : '');
export const fromInput = (v) => (v ? new Date(v).getTime() || 0 : 0);

/** The Grid Career data after mount (empty before, so the server render and the first paint agree). */
export function useCareer() {
  const [s, set] = useState({ ready: false, db: null, tick: 0 });
  useEffect(() => {
    const load = () => set((x) => ({ ready: true, db: read(), tick: x.tick + 1 }));
    load();
    const onStorage = (e) => { if (!e.key || e.key === CAREER_KEY) load(); };
    window.addEventListener(CAREER_EVENT, load);
    window.addEventListener('storage', onStorage);
    return () => { window.removeEventListener(CAREER_EVENT, load); window.removeEventListener('storage', onStorage); };
  }, []);
  return s;
}

export function JobBadge({ job }) {
  const k = jobState(job);
  const s = JOB_STATUS[k] || JOB_STATUS.draft;
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}
export function StageBadge({ stage }) {
  return <StatusBadge tone={stageTone(stage)}>{stageLabel(stage)}</StatusBadge>;
}
export function Stars({ value = 0, size = 14 }) {
  return <span className="cr-stars" aria-label={value ? value + ' of 5 stars' : 'Not rated'}>{[1, 2, 3, 4, 5].map((i) => <Icon key={i} name="star" width={size} height={size} aria-hidden="true" style={{ fill: i <= value ? 'currentColor' : 'none', opacity: i <= value ? 1 : 0.35 }} />)}</span>;
}
export function StarPicker({ value, onChange }) {
  return (
    <span className="cr-starpick" role="radiogroup" aria-label="Rating">
      {[1, 2, 3, 4, 5].map((i) => (
        <button key={i} type="button" role="radio" aria-checked={value === i} aria-label={i + (i === 1 ? ' star' : ' stars')} className={i <= value ? 'is-on' : ''} onClick={() => onChange(value === i ? 0 : i)}>
          <Icon name="star" width="20" height="20" aria-hidden="true" style={{ fill: i <= value ? 'currentColor' : 'none' }} />
        </button>
      ))}
    </span>
  );
}
/** Stage counts as a row of small chips (jobs lists). */
export function StageChips({ counts }) {
  const keys = [['new', 'New'], ['shortlisted', 'Shortlisted'], ['interview', 'Interview'], ['offer', 'Offer'], ['hired', 'Hired']];
  return <span className="cr-chips">{keys.map(([k, l]) => <span key={k} className={'cr-chip' + (counts[k] ? ' is-on' : '')} title={l}><b>{counts[k] || 0}</b> {l}</span>)}</span>;
}

export const CAREER_CSS = `
.cr-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.cr-stars{display:inline-flex;gap:1px;color:var(--warning, #d97706);vertical-align:middle}
.cr-starpick{display:inline-flex;gap:2px}
.cr-starpick button{display:grid;place-items:center;width:36px;height:36px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer}
.cr-starpick button.is-on{color:var(--warning, #d97706)}
.cr-starpick button:hover{background:var(--surface-subtle)}
.cr-chips{display:flex;flex-wrap:wrap;gap:4px}
.cr-chip{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.cr-chip b{font-weight:var(--weight-semibold);font-family:var(--font-data)}
.cr-chip.is-on{background:var(--fill-primary-soft);color:var(--primary)}
.cr-form{display:flex;flex-direction:column;gap:var(--space-4)}
.cr-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.cr-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.cr-form textarea.gc-input{height:auto;min-height:96px;padding:var(--space-2) var(--space-3);line-height:1.5;resize:vertical}
.cr-check{display:flex;align-items:center;gap:var(--space-2);min-height:36px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.cr-check input{width:16px;height:16px;accent-color:var(--primary)}
.cr-note{display:flex;gap:8px;align-items:flex-start;padding:10px 12px;border-radius:var(--radius-lg);background:var(--fill-info-soft);font-size:var(--text-xs);color:var(--text-body);line-height:1.5}
.cr-note svg{flex:none;margin-top:1px;color:var(--text-info)}
.cr-note--warn{background:var(--fill-warning-soft)}
.cr-note--warn svg{color:var(--text-warning)}
.cr-note--error{background:var(--fill-error-soft)}
.cr-note--error svg{color:var(--text-danger)}
.cr-err{margin:4px 0 0;font-size:var(--text-xs);color:var(--text-danger)}
.cr-list{list-style:none;margin:0;padding:0}
.cr-list>li{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-2) 0;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.cr-list>li:first-child{border-top:0}
.cr-list>li>span:first-child{flex:1;min-width:0}
.cr-row{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.cr-link{display:flex;gap:var(--space-2);align-items:center}
.cr-link input{font-family:var(--font-data);font-size:var(--text-xs)}
.cr-filters{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center;padding:var(--space-2) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.cr-filters select{width:auto;min-width:140px}
.cr-filters .ix-search{flex:1 1 220px;min-width:0}
@media (max-width:640px){
  .cr-two,.cr-three{grid-template-columns:minmax(0,1fr)}
  .cr-filters{padding:var(--space-2) var(--space-3)}
  .cr-filters select{flex:1 1 140px;min-width:0}
}
`;
