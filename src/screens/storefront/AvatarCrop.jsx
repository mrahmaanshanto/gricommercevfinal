'use client';
// AvatarCrop — the shopper's profile picture in My account › Profile (Batch C step 3). Pick a photo, move and zoom it
// inside a square (drag, the slider, or the arrow keys and + / −), then Save: the square is drawn at AVATAR_SIZE px
// (256) and kept on the account as a small JPEG (lib/storefront/account.js › setAvatar). Remove takes it off; the
// header's account button and the account page show initials then. Nothing leaves the browser in the demo.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { setAvatar, removeAvatar, initialsOf, AVATAR_SIZE } from '@/lib/storefront/account';

const BOX = 280;                // the crop square on screen
const MAX_BYTES = 10 * 1024 * 1024;

export const AVATAR_CSS = `
.sav{display:inline-flex;align-items:center;justify-content:center;flex:none;border-radius:var(--radius-full);overflow:hidden;background:var(--sf-soft);color:var(--sf-primary);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.sav img{width:100%;height:100%;object-fit:cover;display:block}
.sav-row{display:flex;flex-wrap:wrap;align-items:center;gap:12px 16px}
.sav-scrim{position:fixed;inset:0;z-index:1000;display:flex;align-items:center;justify-content:center;padding:16px;background:rgba(15,23,42,.55)}
.sav-dlg{display:flex;flex-direction:column;gap:14px;width:min(100%,360px);padding:20px;border-radius:var(--sf-radius-card);background:var(--sf-surface);color:var(--sf-text);box-shadow:0 20px 50px rgba(15,23,42,.3)}
.sav-dlg h2{font-size:var(--sf-fs-h3)}
.sav-box{position:relative;width:${BOX}px;max-width:100%;aspect-ratio:1/1;margin:0 auto;border-radius:var(--sf-radius);overflow:hidden;background:#0f172a;touch-action:none;cursor:grab}
.sav-box:active{cursor:grabbing}
.sav-box canvas{display:block;width:100%;height:100%}
.sav-box::after{content:"";position:absolute;inset:0;border-radius:50%;box-shadow:0 0 0 400px rgba(15,23,42,.45);pointer-events:none}
.sav-zoom{display:flex;align-items:center;gap:10px}
.sav-zoom input{flex:1;accent-color:var(--sf-primary)}
.sav-acts{display:flex;justify-content:flex-end;gap:8px}
`;

/** The round picture (or initials) used by the account page and the header. */
export function Avatar({ acc, size = 40 }) {
  return (
    <span className="sav" style={{ width: size, height: size, fontSize: Math.round(size * 0.38) }} aria-hidden="true">
      {acc && acc.avatar ? <img src={acc.avatar} alt="" /> : initialsOf(acc)}
    </span>
  );
}

function Cropper({ src, onCancel, onSave }) {
  const cv = useRef(null);
  const [img, setImg] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [off, setOff] = useState({ x: 0, y: 0 });
  const drag = useRef(null);
  useEffect(() => { const i = new Image(); i.onload = () => setImg(i); i.onerror = () => { toast('That picture could not be opened.', { tone: 'error' }); onCancel(); }; i.src = src; }, [src]); // eslint-disable-line react-hooks/exhaustive-deps
  // the image covers the square at zoom 1; offsets are kept inside so the square never shows an empty edge
  const base = img ? Math.max(BOX / img.width, BOX / img.height) : 1;
  const clamp = (o, z) => {
    if (!img) return o;
    const w = img.width * base * z, h = img.height * base * z;
    const mx = (w - BOX) / 2, my = (h - BOX) / 2;
    return { x: Math.max(-mx, Math.min(mx, o.x)), y: Math.max(-my, Math.min(my, o.y)) };
  };
  const draw = (ctx, size) => {
    const k = size / BOX, s = base * zoom * k;
    const w = img.width * s, h = img.height * s;
    ctx.fillStyle = '#ffffff'; ctx.fillRect(0, 0, size, size);
    ctx.imageSmoothingQuality = 'high';
    ctx.drawImage(img, (size - w) / 2 + off.x * k, (size - h) / 2 + off.y * k, w, h);
  };
  useEffect(() => {
    if (!img || !cv.current) return;
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    cv.current.width = BOX * dpr; cv.current.height = BOX * dpr;
    draw(cv.current.getContext('2d'), BOX * dpr);
  }); // redraw on every change
  const setZ = (z) => { const nz = Math.max(1, Math.min(4, z)); setZoom(nz); setOff((o) => clamp(o, nz)); };
  const scale = () => (cv.current ? BOX / cv.current.getBoundingClientRect().width : 1);
  const down = (e) => { drag.current = { x: e.clientX, y: e.clientY, o: off }; e.currentTarget.setPointerCapture(e.pointerId); };
  const move = (e) => { const d = drag.current; if (!d) return; const k = scale(); setOff(clamp({ x: d.o.x + (e.clientX - d.x) * k, y: d.o.y + (e.clientY - d.y) * k }, zoom)); };
  const up = () => { drag.current = null; };
  const key = (e) => {
    const step = e.shiftKey ? 20 : 6;
    const m = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }[e.key];
    if (m) { e.preventDefault(); setOff((o) => clamp({ x: o.x + m[0], y: o.y + m[1] }, zoom)); }
    else if (e.key === '+' || e.key === '=') { e.preventDefault(); setZ(zoom + 0.1); }
    else if (e.key === '-') { e.preventDefault(); setZ(zoom - 0.1); }
  };
  const save = () => {
    const c = document.createElement('canvas');
    c.width = AVATAR_SIZE; c.height = AVATAR_SIZE;
    draw(c.getContext('2d'), AVATAR_SIZE);
    onSave(c.toDataURL('image/jpeg', 0.85));
  };
  useEffect(() => { const esc = (e) => { if (e.key === 'Escape') onCancel(); }; window.addEventListener('keydown', esc); return () => window.removeEventListener('keydown', esc); }, [onCancel]);
  return (
    <div className="sav-scrim" onMouseDown={(e) => { if (e.target === e.currentTarget) onCancel(); }}>
      <div className="sav-dlg" role="dialog" aria-modal="true" aria-labelledby="sav-t">
        <h2 id="sav-t">Your picture</h2>
        <div className="sav-box" tabIndex={0} role="img" aria-label="Picture to crop. Drag or use the arrow keys to move it, + and − to zoom." onPointerDown={down} onPointerMove={move} onPointerUp={up} onPointerCancel={up} onKeyDown={key}
          onWheel={(e) => setZ(zoom - Math.sign(e.deltaY) * 0.1)}>
          <canvas ref={cv} />
        </div>
        <label className="sav-zoom"><Icon name="zoom-out" width="16" height="16" aria-hidden="true" /><span className="sr-only">Zoom</span><input type="range" min="1" max="4" step="0.01" value={zoom} onChange={(e) => setZ(Number(e.target.value))} aria-label="Zoom" /><Icon name="zoom-in" width="16" height="16" aria-hidden="true" /></label>
        <div className="sav-acts">
          <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={onCancel}>Cancel</button>
          <button type="button" className="sf-btn sf-btn--sm sf-btn--fill" disabled={!img} onClick={save}>Save picture</button>
        </div>
      </div>
    </div>
  );
}

/** Picture row for My account › Profile: the picture, Upload / Replace and Remove. */
export function AvatarField({ acc }) {
  const input = useRef(null);
  const [src, setSrc] = useState('');
  useEffect(() => () => { if (src) URL.revokeObjectURL(src); }, [src]);
  const pick = (e) => {
    const f = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!f) return;
    if (!/^image\/(jpeg|png|webp|gif)$/.test(f.type)) { toast('Choose a JPG, PNG or WebP picture.', { tone: 'error' }); return; }
    if (f.size > MAX_BYTES) { toast('That picture is over 10 MB. Choose a smaller one.', { tone: 'error' }); return; }
    setSrc(URL.createObjectURL(f));
  };
  const save = (url) => { const r = setAvatar(acc.phone, url); setSrc(''); if (!r.ok) toast(r.error, { tone: 'error' }); else toast('Picture saved'); };
  const remove = () => { const r = removeAvatar(acc.phone); if (r.ok) toast('Picture removed'); };
  return (
    <div className="sav-row">
      <Avatar acc={acc} size={72} />
      <span className="sac-acts">
        <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={() => input.current && input.current.click()}><Icon name="camera" width="16" height="16" aria-hidden="true" />{acc.avatar ? 'Replace picture' : 'Add a picture'}</button>
        {acc.avatar ? <button type="button" className="sf-btn sf-btn--sm sf-btn--line" onClick={remove}><Icon name="trash-2" width="16" height="16" aria-hidden="true" />Remove</button> : null}
      </span>
      <input ref={input} type="file" accept="image/jpeg,image/png,image/webp,image/gif" hidden onChange={pick} aria-label="Choose a picture" />
      {src ? <Cropper src={src} onCancel={() => setSrc('')} onSave={save} /> : null}
    </div>
  );
}
