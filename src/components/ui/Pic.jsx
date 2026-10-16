'use client';
// Pic — the small picture at the start of a table row (Batch E picture columns; rule: only rows you recognise faster by
// sight — a product, a person, a company or visual content). 32px by default.
//   kind 'item'   a product or thing: rounded square, the photo, else the first letter on a soft tile
//   kind 'person' a circle: the photo, else initials on a colour that stays the same for that name
//   kind 'logo'   a company or brand: rounded square, the logo contained, else initials
//   kind 'cover'  visual content (a service, page, post, theme): a 4:3 rounded thumbnail, else the icon
// Decorative by default (the name is in the row next to it); pass `alt` when the picture is the only label.
// <PicStack items={[{src,name}]} max={3} /> overlaps a few people (a team).

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { initialsOf, toneOf } from '@/lib/pictures';

// The same rules live at the end of styles/design-system.css (loaded everywhere); kept here for pages outside it.
export const PIC_CSS = `
.gc-pic{display:inline-grid;place-items:center;flex:none;overflow:hidden;border:1px solid var(--border-subtle);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);line-height:1;vertical-align:middle}
.gc-pic img{display:block;width:100%;height:100%;object-fit:cover}
.gc-pic--item,.gc-pic--logo{border-radius:var(--radius-md)}
.gc-pic--logo{background:var(--surface-card)}
.gc-pic--logo img{object-fit:contain;padding:3px}
.gc-pic--person{border-radius:var(--radius-full)}
.gc-pic--cover{border-radius:var(--radius-md)}
.gc-pic--cover.is-empty{color:var(--primary);background:var(--fill-primary-soft)}
.gc-picrow{display:flex;align-items:center;gap:10px;min-width:0}
.gc-picrow>span:last-child,.gc-picrow>a:last-child{min-width:0}
.gc-picstack{display:inline-flex;align-items:center}
.gc-picstack>.gc-pic{box-shadow:0 0 0 2px var(--surface-card)}
.gc-picstack>.gc-pic+.gc-pic{margin-left:-8px}
`;

export function Pic({ src, name, kind = 'item', size = 32, icon, alt, title }) {
  const [bad, setBad] = useState(false);
  const w = kind === 'cover' ? Math.round(size * 1.33) : size;
  const style = { width: w, height: size };
  const has = src && !bad;
  if (has) {
    return (
      <span className={'gc-pic gc-pic--' + kind} style={style} title={title} aria-hidden={alt ? undefined : 'true'}>
        <img src={src} alt={alt || ''} loading="lazy" decoding="async" onError={() => setBad(true)} />
      </span>
    );
  }
  if (kind === 'cover' || icon) {
    return <span className={'gc-pic gc-pic--' + kind + ' is-empty'} style={style} title={title} aria-hidden={alt ? undefined : 'true'} role={alt ? 'img' : undefined} aria-label={alt}><Icon name={icon || 'image'} width={Math.round(size / 2)} height={Math.round(size / 2)} aria-hidden="true" /></span>;
  }
  const [bg, fg] = toneOf(name);
  return (
    <span className={'gc-pic gc-pic--' + kind} style={{ ...style, background: bg, color: fg, borderColor: 'transparent', fontSize: size >= 40 ? 'var(--text-sm)' : undefined }} title={title} aria-hidden={alt ? undefined : 'true'} role={alt ? 'img' : undefined} aria-label={alt}>
      {initialsOf(name, kind === 'item' ? 1 : 2)}
    </span>
  );
}

/** A few people overlapped (a team's members), with "+n" when there are more. */
export function PicStack({ items = [], max = 3, size = 28 }) {
  const shown = items.slice(0, max);
  const more = items.length - shown.length;
  return (
    <span className="gc-picstack" aria-hidden="true">
      {shown.map((p, i) => <Pic key={i} src={p.src} name={p.name} kind="person" size={size} />)}
      {more > 0 ? <span className="gc-pic gc-pic--person" style={{ width: size, height: size, color: 'var(--text-muted)' }}>+{more}</span> : null}
    </span>
  );
}

/** A picture and the row's name side by side (the first cell). */
export function PicRow({ children, ...pic }) {
  return <span className="gc-picrow"><Pic {...pic} />{children}</span>;
}
