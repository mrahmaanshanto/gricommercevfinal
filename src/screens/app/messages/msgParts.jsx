'use client';
// msgParts — pieces the app's Calls, Inbox, Chat and GridAI screens share, drawn with the boards' own markup:
//   ChLogo { ch, size }                     a channel mark (the boards' PNGs, else the web's ChannelIcon)
//   Face { name, avatar, pos, size, ch, online, ring }   the boards' .pav: photo or initials, channel badge, online dot
//   XIcon { name, size, stroke }            line icons the kit doesn't have (mic, send, play, keypad, call arrows …)
//   DialPadGlyph                            the green FAB's keypad dots (MCalls board)
//   NoAccess { title }                      one line + Home, for a person or edition without the page
//   SectionLabel { children }               the settings boards' small uppercase group label
//   faceTone(name)                          the boards' initials colours
//   useNow(ms)                              Date.now() that moves (null before mount)

import React, { useEffect, useState } from 'react';
import { ChannelIcon } from '@/components/ui';
import { Card, EmptyState, Icon } from '../kit/AppKit';
import { CHANNEL_LOGO } from './channelLogos';

export function ChLogo({ ch, size = 18, alt = '' }) {
  const src = CHANNEL_LOGO[ch];
  if (src) return <img src={src} alt={alt} style={{ width: size + 'px', height: size + 'px', display: 'block', borderRadius: 'var(--radius-full)' }} />;
  return <ChannelIcon channel={ch} size={size} decorative={!alt} label={alt || undefined} />;
}

const TONES = [['#e7f7f0', '#003087'], ['#fde7ef', '#003087'], ['#e0f3fb', '#003087'], ['#fff4e0', '#003087'], ['#eef3fa', '#003087']];
const hash = (s) => { let h = 7; for (const c of String(s || '')) h = (h * 31 + c.charCodeAt(0)) >>> 0; return h; };
export const faceTone = (name) => TONES[hash(name) % TONES.length];
const inits = (name) => String(name || '?').replace(/^@/, '').split(/[\s._]+/).filter(Boolean).slice(0, 2).map((w) => w[0]).join('').toUpperCase() || '?';

/** The boards' person avatar (.pav) with the channel badge and the online dot. */
export function Face({ name, avatar, pos, size = 52, ch, online, badge }) {
  const [bg, fg] = faceTone(name);
  const b = badge || (size >= 50 ? 22 : size >= 44 ? 18 : 18);
  const fs = size >= 50 ? 'var(--text-lg)' : size >= 44 ? 'var(--text-sm-plus)' : 'var(--text-sm)';
  return (
    <span className="pav" style={{ width: size + 'px', height: size + 'px' }}>
      {avatar
        ? <img className="face" src={avatar} alt="" style={{ width: size + 'px', height: size + 'px', objectPosition: pos || undefined }} />
        : <span className="face" style={{ width: size + 'px', height: size + 'px', background: bg, color: fg, fontSize: fs }}>{/[A-Za-z\u0980-\u09FF]/.test(String(name || '')) ? inits(name) : <Icon name="user" size={Math.round(size * 0.45)} />}</span>}
      {ch ? (
        <span className="pb" style={{ width: b + 'px', height: b + 'px', right: '-3px', bottom: '-3px' }}>
          <ChLogo ch={ch} size={b - 4} />
        </span>
      ) : null}
      {online ? <span className="on" /> : null}
    </span>
  );
}

const P = {
  mic: <><rect x="9" y="2" width="6" height="12" rx="3" /><path d="M5 10a7 7 0 0 0 14 0M12 17v4" /></>,
  micOff: <path d="M2 2l20 20M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.7M19 10v2a7 7 0 0 1-.8 3.3M5 10v2a7 7 0 0 0 11.4 5.4M12 19v3" />,
  send: <><path d="M22 2 11 13" /><path d="M22 2 15 22l-4-9-9-4Z" /></>,
  play: <path d="M7 4v16l13-8Z" />,
  pause: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  image: <><rect x="3" y="3" width="18" height="18" rx="2" /><circle cx="9" cy="9" r="2" /><path d="m21 15-3.1-3.1a2 2 0 0 0-2.8 0L6 21" /></>,
  incoming: <path d="M17 7 7 17M7 8v9h9" />,
  outgoing: <path d="M7 17 17 7M8 7h9v9" />,
  missed: <path d="m3 7 7 7 4-4 7 7" />,
  voicemail: <><circle cx="6" cy="12" r="4" /><circle cx="18" cy="12" r="4" /><path d="M6 16h12" /></>,
  hold: <><rect x="6" y="4" width="4" height="16" rx="1" /><rect x="14" y="4" width="4" height="16" rx="1" /></>,
  speaker: <><path d="M11 5 6 9H2v6h4l5 4Z" /><path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" /></>,
  transfer: <path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" />,
  reply: <><path d="M9 17 4 12l5-5" /><path d="M20 18v-2a4 4 0 0 0-4-4H4" /></>,
  copy: <><rect x="9" y="9" width="13" height="13" rx="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></>,
  trash: <><path d="M3 6h18M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" /></>,
  thumbsUp: <><path d="M7 10v12M15 5.9 14 10h5.8a2 2 0 0 1 1.9 2.6l-2.3 7A2 2 0 0 1 17.5 21H7V10l4-8a3.1 3.1 0 0 1 4 3.9Z" /></>,
  thumbsDown: <><path d="M17 14V2M9 18.1 10 14H4.2a2 2 0 0 1-1.9-2.6l2.3-7A2 2 0 0 1 6.5 3H17v11l-4 8a3.1 3.1 0 0 1-4-3.9Z" /></>,
  note: <><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8Z" /><path d="M14 2v6h6M16 13H8M16 17H8M10 9H8" /></>,
  link: <><path d="M10 13a5 5 0 0 0 7.5.5l3-3a5 5 0 0 0-7-7l-1.7 1.7" /><path d="M14 11a5 5 0 0 0-7.5-.5l-3 3a5 5 0 0 0 7 7l1.7-1.7" /></>,
  heart: <path d="M19 14c1.5-1.5 3-3.2 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.8 0-3 .5-4.5 2-1.5-1.5-2.7-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.5 4 3 5.5l7 7Z" />,
  eyeOff: <><path d="M9.9 4.2A10 10 0 0 1 12 4c7 0 10 8 10 8a13 13 0 0 1-1.7 2.7M6.6 6.6A13.5 13.5 0 0 0 2 12s3 8 10 8a9.7 9.7 0 0 0 5.4-1.6" /><path d="M2 2l20 20M9.9 9.9a3 3 0 0 0 4.2 4.2" /></>,
  at: <><circle cx="12" cy="12" r="4" /><path d="M16 8v5a3 3 0 0 0 6 0v-1a10 10 0 1 0-4 8" /></>,
  hand: <><path d="M18 11V6a2 2 0 0 0-4 0v5M14 10V4a2 2 0 0 0-4 0v6M10 10.5V6a2 2 0 0 0-4 0v8" /><path d="M18 8a2 2 0 1 1 4 0v6a8 8 0 0 1-8 8h-2c-2.8 0-4.5-.9-6-2.4l-3.6-3.6a2 2 0 0 1 2.8-2.8L7 15" /></>,
  book: <><path d="M4 19.5v-15A2.5 2.5 0 0 1 6.5 2H20v20H6.5a2.5 2.5 0 0 1 0-5H20" /></>,
  shield: <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10Z" />,
  del: <><path d="M21 4H8l-7 8 7 8h13a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2Z" /><path d="m18 9-6 6M12 9l6 6" /></>,
  smile: <><circle cx="12" cy="12" r="10" /><path d="M8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01" /></>,
};
/** Extra line icons in the boards' style. */
export function XIcon({ name, size = 20, stroke = 1.8, style, fill }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={fill || 'none'} stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" style={style}>
      {P[name] || null}
    </svg>
  );
}

/** The keypad dots on the MCalls board's green FAB. */
export function DialPadGlyph({ size = 26 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      {[[6, 5], [12, 5], [18, 5], [6, 11], [12, 11], [18, 11], [6, 17], [12, 17], [18, 17]].map(([x, y]) => <circle key={x + '-' + y} cx={x} cy={y} r="1.8" />)}
      <circle cx="12" cy="22" r="1.6" />
    </svg>
  );
}

/** The settings boards' group label. */
export function SectionLabel({ children, style }) {
  return <div style={{ margin: '22px 24px 8px', fontSize: 'var(--text-xs-plus)', fontWeight: 'var(--weight-medium)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: 'var(--muted)', ...style }}>{children}</div>;
}

export function NoAccess({ title = 'This page isn’t part of your access.' }) {
  return <Card style={{ marginTop: '8px' }}><EmptyState icon="alert" title={title} action={{ label: 'Go to Home', href: '/m-home' }} /></Card>;
}

/** Date.now() that moves every `ms` (null before mount). */
export function useNow(ms = 30000) {
  const [now, setNow] = useState(null);
  useEffect(() => {
    setNow(Date.now());
    const id = window.setInterval(() => setNow(Date.now()), ms);
    return () => window.clearInterval(id);
  }, [ms]);
  return now;
}
