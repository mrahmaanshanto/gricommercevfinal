'use client';
// hrShared — what the Staff & HR pages share: the page frame, the hook that reads src/lib/hr.js
// (and re-reads it when HR data, money or liabilities change), avatars, shift chips and the CSS.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Sidebar, Topbar } from '@/shell/Shell';
import { PageHeader } from '@/components/ui';
import { formatBDT } from '@/lib/format';
import { seedSnapshot, loadSnapshot, HR_EVENT, initials, shiftBy, SHIFT_COLORS, t12, STAFF_STATUS, statusOf } from '@/lib/hr';

/**
 * The HR data for a page. The first render (server and browser) uses the demo seed so they match;
 * after mount it reads this browser's data and follows every change.
 */
export function useHr() {
  const [S, setS] = useState(seedSnapshot);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const on = () => setS(loadSnapshot());
    on();
    setReady(true);
    window.addEventListener(HR_EVENT, on);
    window.addEventListener('gc:ledger', on);
    window.addEventListener('storage', on);
    return () => { window.removeEventListener(HR_EVENT, on); window.removeEventListener('gc:ledger', on); window.removeEventListener('storage', on); };
  }, []);
  return { S, ready };
}

export const money = (n) => formatBDT(Math.round(Math.abs(n)));
export const minus = (n) => (n ? '−' + money(n) : '—');
export const dash = (n) => (n ? money(n) : '—');

export const HR_CSS = `
.hr-card{overflow:hidden}
.hr-card .gc-table th,.hr-card .gc-table td{padding-left:var(--space-3);padding-right:var(--space-3)}
.hr-card .gc-table th:first-child,.hr-card .gc-table td:first-child{padding-left:var(--space-5)}
.hr-card .gc-table th:last-child,.hr-card .gc-table td:last-child{padding-right:var(--space-5)}
.hr-head{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
.hr-head>:first-child{flex:1 1 auto;min-width:0}
.hr-head h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.hr-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.hr-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.hr-bar__group{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2)}
.hr-tabsbar{display:flex;flex-wrap:wrap;align-items:flex-end;justify-content:space-between;gap:var(--space-3);padding:0 var(--space-4)}
.hr-tabsbar .gc-tabs{border-bottom:0;flex-wrap:wrap}
.hr-tab b{margin-left:6px;font-weight:var(--weight-medium);color:var(--text-muted);font-variant-numeric:tabular-nums}
.hr-num{text-align:right;font-variant-numeric:tabular-nums;white-space:nowrap}
.hr-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums;white-space:nowrap}
.hr-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.hr-strong{font-weight:var(--weight-medium);color:var(--text-heading)}
.hr-id{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.hr-in{color:var(--text-success)}
.hr-out{color:var(--text-danger)}
.hr-warn{color:var(--text-warning)}
.hr-who{display:flex;align-items:center;gap:var(--space-3);min-width:0}
.hr-who > span:last-child{min-width:0}
.hr-who a{color:var(--text-heading);font-weight:var(--weight-medium);text-decoration:none}
.hr-who a:hover{color:var(--text-link)}
.hr-av{display:inline-flex;flex:none;align-items:center;justify-content:center;width:36px;height:36px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium)}
.hr-av--lg{width:44px;height:44px;font-size:var(--text-sm)}
.hr-actions{display:flex;justify-content:flex-end;flex-wrap:wrap;gap:var(--space-2)}
.hr-form{display:flex;flex-direction:column;gap:var(--space-4)}
.hr-two{display:grid;grid-template-columns:1fr 1fr;gap:var(--space-3)}
.hr-three{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:var(--space-3)}
.hr-chip{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.hr-note{display:flex;gap:var(--space-2);align-items:flex-start;padding:var(--space-3) var(--space-4);border-radius:var(--radius-lg);font-size:var(--text-xs);line-height:1.5}
.hr-note svg{flex:none;margin-top:1px}
.hr-note b{font-weight:var(--weight-semibold)}
.hr-note--ok{background:var(--fill-success-soft);color:var(--text-success)}
.hr-note--warn{background:var(--fill-warning-soft);color:var(--text-warning)}
.hr-note--error{background:var(--fill-error-soft);color:var(--text-danger)}
.hr-note--info{background:var(--fill-info-soft);color:var(--text-info)}
.hr-notes{display:flex;flex-direction:column;gap:var(--space-2)}
.hr-sum{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1px;margin:0;background:var(--border-subtle);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden}
.hr-sum > div{background:var(--surface-card);padding:var(--space-3) var(--space-4);min-width:0}
.hr-sum dt{font-size:var(--text-xs);color:var(--text-muted)}
.hr-sum dd{margin:2px 0 0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);font-family:var(--font-data);font-variant-numeric:tabular-nums}
.hr-sum .is-key{background:var(--fill-primary-soft)}
.hr-sum .is-key dd{color:var(--primary)}
.hr-seg{display:inline-flex;padding:3px;gap:2px;border-radius:var(--radius-full);background:var(--surface-subtle);border:1px solid var(--border-subtle)}
.hr-seg button{height:34px;padding:0 var(--space-4);border:0;border-radius:var(--radius-full);background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);cursor:pointer;white-space:nowrap}
.hr-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--text-heading);box-shadow:0 1px 2px rgba(15,23,42,.08)}
.hr-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.hr-opt{display:flex;align-items:flex-start;gap:var(--space-3);padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);cursor:pointer;background:var(--surface-card)}
.hr-opt input{margin-top:3px;accent-color:var(--primary)}
.hr-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.hr-opt b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.hr-opt small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.hr-check{display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.hr-check input{width:16px;height:16px;accent-color:var(--primary)}
.hr-bar-track{height:6px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.hr-bar-fill{height:100%;border-radius:var(--radius-full);background:var(--primary)}
.hr-mini{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.hr-mini th{font-weight:var(--weight-medium);color:var(--text-muted);text-align:left;padding:6px 8px;border-bottom:1px solid var(--border-subtle)}
.hr-mini td{padding:6px 8px;border-bottom:1px solid var(--border-subtle);color:var(--text-body)}
.hr-mini .hr-num{text-align:right}
.hr-empty{padding:var(--space-6) var(--space-5);text-align:center;font-size:var(--text-sm);color:var(--text-muted)}
.hr-link{font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-link);text-decoration:none}
.hr-link:hover{text-decoration:underline}
.rp-tile{display:grid;place-items:center;width:36px;height:36px;flex:none;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
@media (max-width:640px){.hr-two,.hr-three{grid-template-columns:1fr}.hr-sum{grid-template-columns:1fr 1fr}}
`;

/** The shell around an HR page: menu, top bar and page header. */
export function HrPage({ screen, active, page, title, description, about, actions, children, css = '' }) {
  return (
    <div className="dc-screen ds" data-screen={screen}>
      <style dangerouslySetInnerHTML={{ __html: HR_CSS + css }} />
      <div className="gc-shell">
        <Sidebar sticky="" active={active} />
        <main className="gc-shell__main" style={{ background: 'var(--surface-page)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-xl)' }}>
          <Topbar crumb="Staff & HR" page={page} placeholder="Search staff by name, phone or code" />
          <div className="gc-shell__content" style={{ flexGrow: 1, padding: '24px 32px 40px', display: 'flex', flexDirection: 'column', gap: 'var(--space-5)' }}>
            <PageHeader title={title} description={description} about={about} actions={actions} />
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}

const AV_TONES = [
  ['var(--fill-info-soft)', 'var(--text-info)'], ['var(--fill-primary-soft)', 'var(--primary)'], ['var(--fill-warning-soft)', 'var(--text-warning)'],
  ['var(--fill-success-soft)', 'var(--text-success)'], ['var(--fill-error-soft)', 'var(--text-danger)'], ['var(--fill-secondary-soft)', 'var(--secondary)'],
];
const toneOf = (code) => AV_TONES[(Number(String(code).replace(/\D/g, '')) || 0) % AV_TONES.length];
export function Avatar({ st, large }) {
  const [bg, fg] = toneOf(st.code);
  return <span className={'hr-av' + (large ? ' hr-av--lg' : '')} style={{ background: bg, color: fg }} aria-hidden="true">{initials(st.name)}</span>;
}
/** The address of a staff profile (optionally on one tab). */
export const profileHref = (code, tab) => `/staff-profile?code=${encodeURIComponent(code)}${tab ? '&tab=' + tab : ''}`;
/** Avatar + name (to the staff profile) + a second line. */
export function Person({ st, sub }) {
  return (
    <div className="hr-who">
      <Avatar st={st} />
      <span><Link href={profileHref(st.code)}>{st.name}</Link><span className="hr-sub">{sub}</span></span>
    </div>
  );
}
export function ShiftChip({ S, id, time, label }) {
  const sh = shiftBy(S, id);
  if (!sh) return <span className="hr-chip" style={{ background: 'var(--surface-subtle)', color: 'var(--text-muted)' }}>{label || 'No shift'}</span>;
  const [bg, fg] = SHIFT_COLORS[sh.color] || SHIFT_COLORS.slate;
  return <span className="hr-chip" style={{ background: bg, color: fg }}>{sh.name}{time ? ` · ${t12(sh.start)}–${t12(sh.end)}` : ''}</span>;
}
export function StaffStatus({ S, st }) {
  const k = statusOf(S, st);
  const [label, tone] = STAFF_STATUS[k] || STAFF_STATUS.active;
  return <span className={'gc-badge gc-badge--' + tone}>{label}</span>;
}
