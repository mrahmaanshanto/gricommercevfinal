'use client';
// Small pieces of the super admin's Inbox and Calls, copied from the merchant panel's components/inbox/parts.jsx (same
// look and class names) but fed by lib/admin/inbox, never the merchant libs:
//   useMedia                         a media query (false on the server and the first render)
//   Avatar, StaffAvatar, KindBadge   people: a contact (initials + channel mark), a GridCommerce teammate, Lead / Merchant …
//   Menu, MenuItem                   a small popover menu (closes on outside click and Esc)
//   Sheet                            slide-over (side) or bottom sheet
//   Seg, SearchBox                   segmented control, search box
//   PARTS_CSS                        styles for all of the above (tokens only)

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { ChannelIcon, StatusBadge } from '@/components/ui';
import { staffById, KINDS } from '@/lib/admin/inbox';

/** The channel mark's key for components/ui ChannelIcon. */
export const chIcon = (ch) => (ch === 'messenger' ? 'messenger' : ch);

export function useMedia(query) {
  const [on, setOn] = useState(false);
  useEffect(() => {
    const mq = window.matchMedia(query);
    const set = () => setOn(mq.matches);
    set();
    mq.addEventListener('change', set);
    return () => mq.removeEventListener('change', set);
  }, [query]);
  return on;
}

const toneOf = (name) => { let h = 0; for (const ch of String(name || '')) h = (h * 31 + ch.charCodeAt(0)) >>> 0; return h % 5; };
export const initialsOf = (name) => String(name || '?').replace(/^@/, '').split(/\s+/).filter(Boolean).map((w) => w[0]).slice(0, 2).join('').toUpperCase();

/** A contact: initials, with the channel mark on the corner. */
export function Avatar({ name, ch, size = 40 }) {
  return (
    <span className="ib-av" data-tone={toneOf(name)} style={{ width: size, height: size, fontSize: size < 32 ? 'var(--text-2xs)' : 'var(--text-xs)' }} aria-hidden="true">
      {initialsOf(name)}
      {ch ? <span className="ib-av__ch"><ChannelIcon channel={chIcon(ch)} size={Math.max(16, Math.round(size * 0.42))} decorative /></span> : null}
    </span>
  );
}

/** A teammate's initials; an empty ring when nobody is assigned. */
export function StaffAvatar({ id, size = 22, title }) {
  const s = staffById(id);
  return (
    <span className={'ib-staff' + (s ? '' : ' ib-staff--none')} style={{ width: size, height: size }} title={title || (s ? s.name : 'Unassigned')} aria-label={title || (s ? 'Assigned to ' + s.name : 'Unassigned')} role="img">
      {s ? s.ini : <Icon name="user-round" width={Math.round(size * 0.6)} height={Math.round(size * 0.6)} aria-hidden="true" />}
    </span>
  );
}

export function KindBadge({ kind }) {
  const k = KINDS[kind];
  return k ? <StatusBadge tone={k.tone} icon={{ lead: 'target', merchant: 'store', affiliate: 'handshake', partner: 'building-2' }[kind]}>{k.label}</StatusBadge> : null;
}

/** A popover menu. `button` renders the trigger with ({ open, toggle }); `children` is (close) => items. */
export function Menu({ button, children, align = 'right', up = false, label = 'Menu', wide = false }) {
  const [open, setOpen] = useState(false);
  const box = useRef(null);
  useEffect(() => {
    if (!open) return undefined;
    const away = (e) => { if (box.current && !box.current.contains(e.target)) setOpen(false); };
    const key = (e) => { if (e.key === 'Escape') { e.stopPropagation(); setOpen(false); } };
    document.addEventListener('mousedown', away);
    document.addEventListener('keydown', key, true);
    const first = box.current && box.current.querySelector('.ib-menu__pop button, .ib-menu__pop input');
    if (first) first.focus();
    return () => { document.removeEventListener('mousedown', away); document.removeEventListener('keydown', key, true); };
  }, [open]);
  const close = () => setOpen(false);
  return (
    <span className="ib-menu" ref={box}>
      {button({ open, toggle: () => setOpen((o) => !o) })}
      {open ? (
        <div className={'gc-dropdown ib-menu__pop' + (wide ? ' ib-menu__pop--wide' : '')} data-align={align} data-up={up ? '' : undefined} role="menu" aria-label={label}>
          {children(close)}
        </div>
      ) : null}
    </span>
  );
}
export function MenuItem({ icon, children, onClick, danger, checked, hint }) {
  return (
    <button type="button" role={checked === undefined ? 'menuitem' : 'menuitemcheckbox'} aria-checked={checked} className={'gc-dropdown__item' + (danger ? ' gc-dropdown__item--danger' : '')} onClick={onClick}>
      {icon ? <Icon name={icon} width="16" height="16" aria-hidden="true" /> : null}
      <span className="ib-menu__label">{children}</span>
      {hint ? <span className="ib-menu__hint">{hint}</span> : null}
      {checked ? <Icon name="check" width="16" height="16" aria-hidden="true" className="ib-menu__check" /> : null}
    </button>
  );
}

/** A slide-over from the right (`side`) or a bottom sheet (`bottom`), with a backdrop. */
export function Sheet({ open, onClose, title, children, variant = 'side', actions, footer }) {
  const ref = useRef(null);
  const close = useRef(onClose);
  close.current = onClose;
  useEffect(() => {
    if (!open) return undefined;
    const back = document.activeElement;
    const key = (e) => { if (e.key === 'Escape' && !document.querySelector('.gc-modal__backdrop')) { e.stopPropagation(); close.current(); } };
    document.addEventListener('keydown', key);
    const first = ref.current && ref.current.querySelector('button, input, a[href], textarea, select');
    if (first) first.focus();
    return () => { document.removeEventListener('keydown', key); if (back && back.focus) back.focus(); };
  }, [open]);
  if (!open) return null;
  return (
    <>
      <div className="ib-backdrop" onMouseDown={onClose} aria-hidden="true" />
      <section ref={ref} className={'ib-sheet ib-sheet--' + variant} role="dialog" aria-modal="true" aria-label={title}>
        {variant === 'bottom' ? <span className="ib-grab" aria-hidden="true" /> : null}
        {title ? (
          <div className="ib-sheet__head">
            <h2 className="ib-sheet__title">{title}</h2>
            {actions}
            <button type="button" className="gc-iconbtn" aria-label="Close" onClick={onClose}><Icon name="x" width="18" height="18" /></button>
          </div>
        ) : null}
        <div className="ib-sheet__body">{children}</div>
        {footer ? <div className="ib-sheet__foot">{footer}</div> : null}
      </section>
    </>
  );
}

/** Segmented control: [[value, label, count?, icon?]]. */
export function Seg({ value, onChange, items, label }) {
  return (
    <div className="ib-seg" role="group" aria-label={label}>
      {items.map(([v, text, count, icon]) => (
        <button key={v} type="button" aria-pressed={value === v} onClick={() => onChange(v)}>
          {icon ? <Icon name={icon} width="15" height="15" aria-hidden="true" /> : null}
          {text}
          {count != null ? <b>{count}</b> : null}
        </button>
      ))}
    </div>
  );
}

export function SearchBox({ value, onChange, placeholder, label, onKeyDown }) {
  return (
    <label className="ib-search">
      <Icon name="search" width="16" height="16" aria-hidden="true" />
      <input className="gc-input" type="search" value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} aria-label={label || placeholder} onKeyDown={onKeyDown} />
    </label>
  );
}

export const PARTS_CSS = `
.ib-av{position:relative;display:inline-grid;place-items:center;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-weight:var(--weight-medium);letter-spacing:0;line-height:1}
.ib-av[data-tone="1"]{background:var(--fill-success-soft);color:var(--text-success)}
.ib-av[data-tone="2"]{background:var(--fill-info-soft);color:var(--text-info)}
.ib-av[data-tone="3"]{background:var(--fill-warning-soft);color:var(--text-warning)}
.ib-av[data-tone="4"]{background:var(--surface-quiet);color:var(--text-body)}
.ib-av__ch{position:absolute;right:-4px;bottom:-4px;display:grid;border-radius:var(--radius-full);box-shadow:0 0 0 2px var(--surface-card)}
.ib-staff{display:inline-grid;place-items:center;flex:none;border-radius:var(--radius-full);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-2xs);font-weight:var(--weight-medium);line-height:1;letter-spacing:0}
.ib-staff--none{background:none;border:1px dashed var(--border-strong);color:var(--text-muted)}
.ib-menu{position:relative;display:inline-flex}
.ib-menu__pop{top:100%;right:0;width:max-content;min-width:220px;max-width:min(320px,calc(100vw - 32px));max-height:min(420px,60vh);overflow:auto}
.ib-menu__pop--wide{min-width:280px}
.ib-menu__pop[data-align="left"]{right:auto;left:0}
.ib-menu__pop[data-up]{top:auto;bottom:100%;margin-top:0;margin-bottom:8px}
.ib-menu__label{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ib-menu__hint{flex:none;font-size:var(--text-xs);color:var(--text-muted)}
.ib-menu__check{flex:none;color:var(--primary)}
.ib-menu__head{margin:0;padding:var(--space-2) var(--space-3) var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.ib-menu__note{margin:0;padding:0 var(--space-3) var(--space-2);max-width:280px;font-size:var(--text-xs);color:var(--text-muted);white-space:normal}
.ib-menu__form{display:flex;gap:var(--space-2);padding:var(--space-2) var(--space-3)}
.ib-menu__form .gc-input{height:36px;padding:0 var(--space-3)}
.ib-backdrop{position:fixed;inset:0;z-index:var(--z-drawer);background:rgba(15,23,42,.45);animation:ib-fade .2s var(--ease-out)}
.ib-sheet{position:fixed;z-index:calc(var(--z-drawer) + 1);display:flex;flex-direction:column;background:var(--surface-card);box-shadow:var(--shadow-xl)}
.ib-sheet--side{top:0;right:0;bottom:0;width:min(420px,92vw);border-radius:var(--radius-2xl) 0 0 var(--radius-2xl);animation:ib-in-right .22s var(--ease-out)}
.ib-sheet--bottom{left:0;right:0;bottom:0;max-height:92dvh;border-radius:var(--radius-2xl) var(--radius-2xl) 0 0;animation:ib-in-up .22s var(--ease-out)}
@media (max-width:767px){.ib-sheet--side{width:100%;border-radius:0}}
.ib-grab{align-self:center;width:40px;height:4px;margin-top:var(--space-2);border-radius:var(--radius-full);background:var(--border-strong)}
.ib-sheet__head{display:flex;align-items:center;gap:var(--space-2);min-height:56px;padding:var(--space-2) var(--space-3) var(--space-2) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.ib-sheet__title{flex:1;min-width:0;margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ib-sheet__body{flex:1;min-height:0;overflow-y:auto;overscroll-behavior:contain}
.ib-sheet__foot{display:flex;justify-content:flex-end;gap:var(--space-2);flex:none;padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle)}
body:has(#nl-badge-frame) .ib-sheet__foot{padding-bottom:calc(var(--space-3) + var(--host-badge))}
@keyframes ib-fade{from{opacity:0}to{opacity:1}}
@keyframes ib-in-right{from{transform:translateX(24px);opacity:0}to{transform:none;opacity:1}}
@keyframes ib-in-up{from{transform:translateY(24px);opacity:0}to{transform:none;opacity:1}}
@media (prefers-reduced-motion:reduce){.ib-backdrop,.ib-sheet{animation:none}}
.ib-seg{display:inline-flex;flex:none;gap:2px;padding:3px;border-radius:var(--radius-full);background:var(--surface-quiet)}
.ib-seg button{display:inline-flex;align-items:center;gap:6px;height:30px;padding:0 var(--space-3);border:0;border-radius:var(--radius-full);background:none;color:var(--text-body);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;cursor:pointer;transition:var(--transition-base)}
.ib-seg button:hover{color:var(--text-heading)}
.ib-seg button[aria-pressed="true"]{background:var(--surface-card);color:var(--primary);box-shadow:var(--shadow-sm)}
.ib-seg b{font-weight:var(--weight-medium);font-variant-numeric:tabular-nums;color:var(--text-muted)}
.ib-seg button[aria-pressed="true"] b{color:var(--primary)}
.ib-search{position:relative;display:block;flex:1;min-width:0}
.ib-search>svg{position:absolute;left:12px;top:50%;transform:translateY(-50%);color:var(--text-muted);pointer-events:none}
.ib-search .gc-input{padding-left:36px;background:var(--surface-card)}
.ib-chip{display:inline-flex;flex:none;align-items:center;gap:6px;height:32px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-body);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap;cursor:pointer;transition:var(--transition-base)}
.ib-chip:hover{border-color:var(--border-strong);color:var(--text-heading)}
.ib-chip[aria-pressed="true"]{border-color:color-mix(in srgb,var(--primary) 40%,transparent);background:var(--fill-primary-soft);color:var(--primary)}
.ib-count{display:inline-grid;place-items:center;flex:none;min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);font-size:var(--text-2xs);font-weight:var(--weight-medium);font-variant-numeric:tabular-nums;line-height:1}
.ib-dot{display:inline-block;flex:none;width:8px;height:8px;border-radius:var(--radius-full);background:var(--slate-300)}
.ib-dot--success{background:var(--success)}.ib-dot--info{background:var(--info)}.ib-dot--warning{background:var(--warning)}.ib-dot--error{background:var(--error)}
.ib-scroll-x{display:flex;gap:var(--space-2);overflow-x:auto;scrollbar-width:none;-webkit-overflow-scrolling:touch}
.ib-scroll-x::-webkit-scrollbar{display:none}
.ib-h2{margin:0;font-size:var(--text-sm-plus);line-height:var(--text-sm-plus-lh);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ib-h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.ib-muted{color:var(--text-muted)}
.ib-sub{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.ib-data{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.ib-link{color:var(--primary);font-weight:var(--weight-medium);text-decoration:none}
.ib-link:hover{text-decoration:underline}
.ib-bn{font-family:var(--font-bn)}
.ib-form{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-5)}
.ib-form .gc-label{margin-bottom:6px}
.ib-form textarea.gc-input{height:auto;min-height:88px;padding:var(--space-2) var(--space-3);resize:vertical;line-height:1.5}
.ib-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ib-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
@media (max-width:640px){.ib-two{grid-template-columns:minmax(0,1fr)}}
.sr-only{position:absolute;width:1px;height:1px;padding:0;margin:-1px;overflow:hidden;clip:rect(0,0,0,0);white-space:nowrap;border:0}
`;
