'use client';
// ticketParts — the support-ticket screens' shared bits, drawn with the boards' markup (MTickets, MTicketDetail):
// the customer face with its channel badge (.pav / .pb), the priority mark (.sh shape + colour), the owner's initials.

import React from 'react';
import { Icon } from '../kit/AppKit';
import { PRIORITY_MARK, personOf } from '@/lib/supportTickets';

// channel badge: the brand logo where public/assets/brands has one, else the channel colour with a line icon
const LOGO = { instagram: '/assets/brands/instagram.png', linkedin: '/assets/brands/linkedin.png' };
const COLOR = { facebook: '#1877f2', whatsapp: '#128c7e', telegram: '#1c8adb', tiktok: '#0f172a', phone: '#0f9f6e', x: '#0f172a' };
const GLYPH = { whatsapp: 'whatsapp', phone: 'phone', facebook: 'chat', telegram: 'chat', tiktok: 'chat', x: 'chat' };

export function ChannelBadge({ ch, size = 14 }) {
  const inner = Math.max(8, size - 4);
  return (
    <span className="pb" style={{ width: size + 'px', height: size + 'px', right: '-2px', bottom: '-2px', padding: '1px' }}>
      {LOGO[ch]
        ? <img src={LOGO[ch]} alt="" style={{ width: inner + 2 + 'px', height: inner + 2 + 'px' }} />
        : <span style={{ display: 'flex', width: '100%', height: '100%', alignItems: 'center', justifyContent: 'center', borderRadius: 'var(--radius-full)', background: COLOR[ch] || '#475569', color: '#fff' }}><Icon name={GLYPH[ch] || 'chat'} size={Math.max(7, inner - 3)} stroke={2.4} /></span>}
    </span>
  );
}

/** The customer's face (photo or initials) with the channel badge. */
export function Face({ t, size = 30 }) {
  return (
    <span className="pav" style={{ width: size + 'px', height: size + 'px' }}>
      {t.img
        ? <img className="face" src={t.img} alt="" style={{ width: size + 'px', height: size + 'px' }} />
        : <span className="face" style={{ width: size + 'px', height: size + 'px', background: '#fde7ef', color: '#003087', fontSize: 'var(--text-xs)' }}>{t.initials}</span>}
      <ChannelBadge ch={t.ch} size={size > 32 ? 15 : 14} />
    </span>
  );
}

/** "◆ Urgent" in the board's colour and shape. */
export function PriorityMark({ priority }) {
  const [color, shape] = PRIORITY_MARK[priority] || PRIORITY_MARK.Normal;
  return <span style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 'var(--weight-medium)', color }}><span className={'sh ' + shape} aria-hidden="true" />{priority}</span>;
}

/** The owner's initials (round), or nothing. */
export function OwnerDot({ who, size = 28 }) {
  const p = personOf(who);
  if (!p) return null;
  const ini = p.name.split(' ').map((x) => x[0]).slice(0, 2).join('').toUpperCase();
  return <span className="av" style={{ width: size + 'px', height: size + 'px', borderRadius: 'var(--radius-full)', background: p.bg, color: '#fff', fontSize: size < 26 ? 'var(--text-2xs)' : 'var(--text-xs)' }} title={'Assigned to ' + p.name} aria-label={'Assigned to ' + p.name}>{ini}</span>;
}

// a paper clip and a star (not in the kit's icon set)
export const Clip = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m21.4 11.1-9.2 9.2a6 6 0 0 1-8.5-8.5l9.2-9.2a4 4 0 0 1 5.7 5.7l-9.2 9.2a2 2 0 0 1-2.8-2.8l8.5-8.5" /></svg>
);
export const Star = ({ size = 22, on }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill={on ? 'currentColor' : 'none'} stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d="m12 2 3.1 6.3 6.9 1-5 4.9 1.2 6.8L12 17.8 5.8 21l1.2-6.8-5-4.9 6.9-1Z" /></svg>
);

/** File names as small chips (attachments are kept by name in the demo). */
export function FileChips({ files, onRemove }) {
  if (!files || !files.length) return null;
  return (
    <span style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '6px' }}>
      {files.map((f, i) => (
        <span key={f + i} className="pill p-grey" style={{ maxWidth: '100%' }}>
          <Clip size={13} /><span className="ell" style={{ maxWidth: '180px' }}>{f}</span>
          {onRemove ? <button type="button" aria-label={'Remove ' + f} onClick={() => onRemove(i)} style={{ display: 'inline-flex', border: 0, background: 'none', padding: 0, color: 'inherit', cursor: 'pointer' }}><Icon name="x" size={13} stroke={2.2} /></button> : null}
        </span>
      ))}
    </span>
  );
}

/** "Attach a file" — picks files and keeps their names. */
export function AttachButton({ onAdd, label = 'Attach a file' }) {
  const ref = React.useRef(null);
  return (
    <>
      <button type="button" className="btn btnl" style={{ height: '40px', padding: '0 14px' }} onClick={() => ref.current && ref.current.click()}><Clip />{label}</button>
      <input ref={ref} type="file" multiple hidden onChange={(e) => { const names = Array.from(e.target.files || []).map((f) => f.name); if (names.length) onAdd(names); e.target.value = ''; }} />
    </>
  );
}
