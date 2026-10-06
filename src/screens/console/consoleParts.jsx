'use client';
// Small shared pieces of the console screens: the design boards' repeated inline styles, the figure card (kpi) and
// a few icons. Same look as the boards; screens built on live data (lib/platform) use these instead of copies.

import React, { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export const H1 = { margin: '0', fontSize: 'var(--text-2xl)', lineHeight: '1.2', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', color: 'var(--ink)' };
export const SUBT = { margin: '5px 0 0', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' };
export const H2 = { margin: '0', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-semibold)', letterSpacing: '0', color: 'var(--ink)' };
export const PHEAD = { display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', marginBottom: '12px' };
export const PSIDE = { display: 'flex', alignItems: 'center', gap: '10px', fontSize: 'var(--text-xs)', color: 'var(--muted)' };
export const PANEL = { padding: '16px 20px', minWidth: '0' };
export const TH = { gap: '12px', padding: '10px 18px', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--muted)' };
export const CELL = { fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-regular)', color: 'var(--body)' };
export const CELLB = { fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' };
export const KV = { fontSize: 'var(--text-2xl)', lineHeight: '1.2', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', color: 'var(--ink)' };
export const LAB = { fontSize: 'var(--text-xs)', letterSpacing: '0', color: 'var(--ink)' };
export const INP = { width: '100%', height: '40px', fontSize: 'var(--text-sm)' };
export const BTN = { minHeight: '40px', fontSize: 'var(--text-xs-plus)' };
export const SMB = { minHeight: '34px', padding: '0 10px', fontSize: 'var(--text-xs)' };
export const CHK = { width: '18px', height: '18px', accentColor: '#003087' };
export const UPPER = { fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--muted)' };
export const MAIN = { position: 'absolute', left: '272px', right: '0', top: '64px', bottom: '0', display: 'flex', flexDirection: 'column', overflow: 'hidden' };
export const PAGE = { padding: '22px 28px', display: 'flex', flexDirection: 'column', gap: '16px', minHeight: '0' };
export const TITLEROW = { display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: '24px' };
/** A table row (grid) — the first row has no top border. */
export const row = (cols, first, extra) => ({ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: '12px', minHeight: '52px', padding: '0 18px', ...(first ? {} : { borderTop: '1px solid var(--line)' }), ...(extra || {}) });
export const grid = (cols, gap = '12px') => ({ display: 'grid', gridTemplateColumns: cols, gap });

/** The figure card with its sparkline. k: { label, value, note, cls, line?, area?, color? } */
export function Kpi({ k }) {
  return (
    <div className="kpi">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px' }}>
        <span className="kl" title={k.label}>{k.label}</span>
        {k.line ? (
          <svg width="64" height="22" viewBox="0 0 64 22" aria-hidden="true" style={{ flex: 'none' }}>
            <path d={k.area} fill={k.color || '#6683b7'} opacity=".10" />
            <path d={k.line} fill="none" stroke={k.color || '#6683b7'} strokeWidth="1.7" strokeLinejoin="round" />
          </svg>
        ) : null}
      </div>
      <span className="num ell" style={KV} title={String(k.value)}>{k.value}</span>
      <div>{k.note ? <span className={k.cls || 'dpill d-flat'}>{k.note}</span> : null}</div>
    </div>
  );
}

/** The navy square with a store's initials, and its name + a mono line under it. */
export function StoreCell({ ini, name, sub, href, Link }) {
  const nameEl = <span className="ell" style={{ fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', color: 'var(--ink)' }}>{name}</span>;
  return (
    <span style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: '0' }}>
      <span style={{ flex: 'none', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', width: '32px', height: '32px', borderRadius: 'var(--radius-lg)', background: '#003087', color: '#fff', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-medium)' }}>{ini}</span>
      <span style={{ minWidth: '0' }}>
        {href && Link ? <Link href={href} style={{ color: 'inherit', display: 'block' }}>{nameEl}</Link> : nameEl}
        <span className="mono ell" style={{ fontSize: 'var(--text-xs)', color: 'var(--muted)' }}>{sub}</span>
      </span>
    </span>
  );
}

/** A label | bar | value row (bar charts in the panels). */
export function BarRow({ label, width, color, value, cols = '110px minmax(0,1fr) 64px' }) {
  return (
    <div style={{ display: 'grid', gridTemplateColumns: cols, alignItems: 'center', gap: '10px', minHeight: '30px' }}>
      <span style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--ink)' }}>{label}</span>
      <span style={{ height: '10px', borderRadius: 'var(--radius-sm)', background: 'var(--track)' }}>
        <span style={{ display: 'block', width, height: '100%', borderRadius: 'var(--radius-sm)', background: color }} />
      </span>
      <span className="num" style={{ ...CELLB, textAlign: 'right' }}>{value}</span>
    </div>
  );
}

const S = { fill: 'none', stroke: 'currentColor', strokeWidth: '1.75', strokeLinecap: 'round', strokeLinejoin: 'round', 'aria-hidden': 'true' };
export const Plus = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...S}><path d="M12 5v14M5 12h14" /></svg>;
export const Lock = ({ s = 12 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...S}><rect x="4" y="11" width="16" height="10" rx="2" /><path d="M8 11V7a4 4 0 0 1 8 0v4" /></svg>;
export const Phone = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...S}><path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" /></svg>;
export const Chat = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...S}><path d="M21 11.5a8.4 8.4 0 0 1-9 8.4 8.5 8.5 0 0 1-3.9-.9L3 21l1.9-5.1A8.4 8.4 0 0 1 3.5 11.5 8.5 8.5 0 0 1 12 3a8.4 8.4 0 0 1 9 8.5Z" /></svg>;
export const Download = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...S}><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" /></svg>;
export const Send = ({ s = 16 }) => <svg width={s} height={s} viewBox="0 0 24 24" {...S}><path d="m22 2-7 20-4-9-9-4Z" /><path d="M22 2 11 13" /></svg>;
export const Check = ({ s = 14 }) => <svg width={s} height={s} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="M20 6 9 17l-5-5" /></svg>;

/** Download a CSV built from rows (first row = header). */
export function downloadCsv(name, rows) {
  const esc = (x) => `"${String(x ?? '').replace(/"/g, '""')}"`;
  const csv = rows.map((r) => r.map(esc).join(',')).join('\n');
  const a = document.createElement('a');
  a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
  a.download = name;
  a.click();
}

/** Go to another page once `to` is set (class screens use it after a save). */
export function Go({ to }) {
  const router = useRouter();
  useEffect(() => { if (to) router.push(to); }, [to, router]);
  return null;
}
