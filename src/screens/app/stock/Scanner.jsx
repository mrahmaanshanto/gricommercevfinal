'use client';
// Scanner — the app's barcode reading and the small sheets the stock and POS screens share.
//   useCamera(videoRef, { on, onCode })  the back camera in a <video>; reads codes with the browser's BarcodeDetector
//                     when there is one (Chrome on Android). → { state: 'off'|'starting'|'live'|'nocam', reads (bool),
//                     torch (bool|null: null = no torch), setTorch(on) }. A code read twice within 1.5 s counts once.
//   ScanBox           the dark camera window with the boards' white corners and the orange line (MScan)
//   ScanSheet         { open, onClose, onCode(code), title }  camera + "type or use a USB / Bluetooth scanner" field
//   ProductSheet      { open, onClose, onPick(row), title, place?, filter?(row) }  search the catalogue (name, SKU,
//                     barcode, any identifier) with each row's available stock at `place`
//   PinSheet          { open, onClose, onApprove(manager), reason, action, amount, refId }  a manager's PIN (demo 1234),
//                     every try written to the audit log, like components/ManagerPin.jsx
//   Thumb             { row, size }  the product's photo or its letter on the product's colour (.av)
// A code is resolved by the caller with identifiers.js › resolveScan.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Sheet, Button, Field, TextInput, SearchField, ListRow, EmptyState, Icon, Note } from '../kit/AppKit';
import { MANAGERS } from '@/lib/posStore';
import { logAudit } from '@/lib/auditLog';
import { resolveScan } from '@/lib/identifiers';
import { rowsOf, stockOf, thumbOf, safe } from './stockData';

const FORMATS = ['ean_13', 'ean_8', 'upc_a', 'upc_e', 'code_128', 'code_39', 'qr_code', 'itf'];

/** The back camera, reading barcodes when the browser can. */
export function useCamera(videoRef, { on = true, onCode } = {}) {
  const [state, setState] = useState('off');
  const [torch, setTorchState] = useState(null);
  const [reads, setReads] = useState(false);
  const cb = useRef(onCode);
  cb.current = onCode;
  const track = useRef(null);
  useEffect(() => {
    if (!on) return undefined;
    let stop = false, timer = 0, stream = null, last = { code: '', at: 0 };
    const md = typeof navigator !== 'undefined' && navigator.mediaDevices;
    if (!md || !md.getUserMedia) { setState('nocam'); return undefined; }
    setState('starting');
    md.getUserMedia({ video: { facingMode: { ideal: 'environment' } }, audio: false }).then(async (s) => {
      if (stop) { s.getTracks().forEach((t) => t.stop()); return; }
      stream = s;
      const v = videoRef.current;
      if (v) { v.srcObject = s; v.setAttribute('playsinline', ''); v.muted = true; try { await v.play(); } catch { /* ignore */ } }
      track.current = s.getVideoTracks()[0] || null;
      const caps = safe(() => track.current.getCapabilities(), {});
      setTorchState(caps && caps.torch ? false : null);
      setState('live');
      const Det = typeof window !== 'undefined' ? window.BarcodeDetector : null;
      if (!Det) { setReads(false); return; }
      let det = null;
      try {
        const ok = Det.getSupportedFormats ? await Det.getSupportedFormats() : FORMATS;
        det = new Det({ formats: FORMATS.filter((f) => ok.includes(f)) });
      } catch { det = null; }
      if (!det) { setReads(false); return; }
      setReads(true);
      const tick = async () => {
        if (stop) return;
        const vv = videoRef.current;
        if (vv && vv.readyState >= 2) {
          try {
            const found = await det.detect(vv);
            const code = found && found[0] && String(found[0].rawValue || '').trim();
            const now = Date.now();
            if (code && !(code === last.code && now - last.at < 1500)) { last = { code, at: now }; if (navigator.vibrate) navigator.vibrate(40); if (cb.current) cb.current(code); }
          } catch { /* a frame that could not be read */ }
        }
        timer = window.setTimeout(tick, 250);
      };
      tick();
    }).catch(() => { if (!stop) setState('nocam'); });
    return () => { stop = true; window.clearTimeout(timer); if (stream) stream.getTracks().forEach((t) => t.stop()); track.current = null; };
  }, [on, videoRef]);
  const setTorch = (next) => {
    const t = track.current;
    if (!t) return;
    t.applyConstraints({ advanced: [{ torch: !!next }] }).then(() => setTorchState(!!next)).catch(() => setTorchState(null));
  };
  return { state, reads, torch, setTorch };
}

const corner = (pos) => {
  const b = '4px solid #fff';
  const st = { position: 'absolute', width: '34px', height: '34px' };
  if (pos.includes('t')) { st.top = '-2px'; st.borderTop = b; } else { st.bottom = '-2px'; st.borderBottom = b; }
  if (pos.includes('l')) { st.left = '-2px'; st.borderLeft = b; } else { st.right = '-2px'; st.borderRight = b; }
  st.borderRadius = { tl: 'var(--radius-xl) 0 0 0', tr: '0 var(--radius-xl) 0 0', bl: '0 0 0 var(--radius-xl)', br: '0 0 var(--radius-xl) 0' }[pos];
  return <span key={pos} style={st} />;
};
/** The scan window: white corners and the orange line, over the camera picture when there is one. */
export function ScanFrame({ style }) {
  return (
    <div style={{ position: 'absolute', width: '280px', height: '170px', borderRadius: 'var(--radius-xl)', boxShadow: '0 0 0 999px rgba(11,18,32,.45)', ...style }} aria-hidden="true">
      {['tl', 'tr', 'bl', 'br'].map(corner)}
      <span className="scanline" style={{ position: 'absolute', left: '24px', right: '24px', top: '84px', height: '2px', background: '#ff5724', boxShadow: '0 0 14px #ff5724' }} />
    </div>
  );
}

/** The camera window used inside a sheet (dark, rounded, the frame in the middle). */
export function ScanBox({ on, onCode, height = 220 }) {
  const ref = useRef(null);
  const cam = useCamera(ref, { on, onCode });
  return (
    <div style={{ position: 'relative', height: height + 'px', borderRadius: 'var(--radius-xl)', overflow: 'hidden', background: 'radial-gradient(120% 80% at 50% 35%,#3b4a61,#0b1220)' }}>
      <video ref={ref} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', display: cam.state === 'live' ? 'block' : 'none' }} muted playsInline aria-hidden="true" />
      <ScanFrame style={{ left: '50%', top: '50%', width: '240px', height: '130px', transform: 'translate(-50%,-50%)' }} />
      <div style={{ position: 'absolute', left: 0, right: 0, bottom: '10px', textAlign: 'center', color: '#cbd5e1', fontSize: 'var(--text-xs-plus)', padding: '0 16px' }}>
        {cam.state === 'nocam' ? 'No camera here. Type the code below.' : cam.state === 'live' && !cam.reads ? 'This browser can’t read codes. Type the code below.' : cam.state === 'starting' ? 'Starting the camera…' : 'Hold the barcode in the frame'}
      </div>
    </div>
  );
}

/** Camera + typed field in a bottom sheet. */
export function ScanSheet({ open, onClose, onCode, title = 'Scan a barcode', hint }) {
  const [text, setText] = useState('');
  useEffect(() => { if (open) setText(''); }, [open]);
  const submit = (e) => { e.preventDefault(); const c = text.trim(); if (!c) return; setText(''); onCode(c); };
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <ScanBox on={open} onCode={onCode} />
      <form onSubmit={submit} style={{ display: 'flex', gap: '8px', marginTop: '14px' }}>
        <span style={{ flex: 1, minWidth: 0 }}><TextInput value={text} onChange={setText} placeholder="Type a barcode, SKU or IMEI" inputMode="text" autoFocus={false} /></span>
        <Button type="submit" kind="soft">Add</Button>
      </form>
      <div className="help" style={{ marginTop: '8px' }}>{hint || 'A USB or Bluetooth scanner types here too.'}</div>
    </Sheet>
  );
}

/** The product's photo or letter. */
export function Thumb({ row, size = 44 }) {
  const t = thumbOf(row);
  const st = { width: size + 'px', height: size + 'px', background: t.bg, color: '#003087', fontSize: size >= 52 ? 'var(--text-lg)' : undefined, overflow: 'hidden' };
  if (size >= 80) st.fontSize = 'var(--text-3xl)';
  return <span className="av" style={st}>{t.src ? <img src={t.src} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : t.letter}</span>;
}

/** Search the catalogue and pick a product. */
export function ProductSheet({ open, onClose, onPick, title = 'Add a product', place = '', filter, showStock = true }) {
  const [q, setQ] = useState('');
  useEffect(() => { if (open) setQ(''); }, [open]);
  const all = useMemo(() => (open ? rowsOf() : []), [open]);
  const list = useMemo(() => {
    const k = q.trim().toLowerCase();
    let out = all.filter((r) => (!filter || filter(r)));
    if (k) {
      const hit = safe(() => resolveScan(q.trim()), null);
      out = out.filter((r) => (hit && hit.sku === r.sku) || [r.name, r.sku, r.barcode, r.variant].some((x) => String(x || '').toLowerCase().includes(k)));
    }
    return out.slice(0, 40);
  }, [all, q, filter]);
  return (
    <Sheet open={open} onClose={onClose} title={title}>
      <SearchField value={q} onChange={setQ} placeholder="Name, SKU or barcode" style={{ margin: '0 0 10px' }} />
      {list.length ? (
        <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
          {list.map((r) => {
            const st = showStock ? stockOf(r.sku, place) : null;
            return (
              <ListRow key={r.sku} compact onClick={() => onPick(r)} avatar={<Thumb row={r} size={40} />} title={r.name}
                sub={<><span className="mono">{r.barcode || r.sku}</span>{st && !st.untracked ? ` · ${st.available} available` : ''}</>}
                end={<span className="num" style={{ fontWeight: 'var(--weight-medium)' }}>{'৳' + Math.round(r.price || 0).toLocaleString('en-IN')}</span>} chevron={false} />
            );
          })}
        </div>
      ) : <EmptyState icon="search" title={q ? `Nothing matches “${q}”` : 'No products'} />}
    </Sheet>
  );
}

/** A manager approves with their PIN (demo 1234). */
export function PinSheet({ open, onClose, onApprove, reason, action = 'Manager approval', amount, refId, by }) {
  const [who, setWho] = useState(MANAGERS[0]);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setPin(''); setErr(''); } }, [open]);
  const submit = (e) => {
    if (e) e.preventDefault();
    const ok = pin === '1234';
    safe(() => logAudit({ action, detail: String(reason || ''), by: by || 'Staff', approvedBy: who, ok, ref: refId || '', ...(amount != null ? { amount } : {}) }), null);
    if (!ok) { setErr('That PIN is not right. Ask the manager to enter it again.'); setPin(''); return; }
    onApprove(who);
  };
  return (
    <Sheet open={open} onClose={onClose} title="Manager approval" footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button onClick={submit} disabled={pin.length < 4} style={{ flex: 2 }}>Approve</Button></>}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Note tone="warn" icon="alert">{reason}</Note>
        <Field label="Manager">
          <span className="inp"><select value={who} onChange={(e) => setWho(e.target.value)} aria-label="Manager">{MANAGERS.map((m) => <option key={m}>{m}</option>)}</select><Icon name="down" size={18} /></span>
        </Field>
        <Field label="PIN" error={err} help="Demo PIN: 1234">
          <span className="inp"><input type="password" inputMode="numeric" autoComplete="off" maxLength={6} value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} aria-label="PIN" /></span>
        </Field>
      </form>
    </Sheet>
  );
}

/** A select in the boards' .inp box. */
export function Select({ value, onChange, options, label }) {
  return (
    <span className="inp" style={{ paddingRight: '10px' }}>
      <select value={value} onChange={(e) => onChange(e.target.value)} aria-label={label} style={{ appearance: 'none', WebkitAppearance: 'none' }}>
        {options.map((o) => (Array.isArray(o) ? <option key={o[0]} value={o[0]}>{o[1]}</option> : <option key={o} value={o}>{o}</option>))}
      </select>
      <Icon name="down" size={18} />
    </span>
  );
}
