'use client';
// PosSheets — the register's small child sheets (Nayeem's POS brief #8): serial / IMEI capture, weighed
// item review, fulfil from another place, hardware status, drawer open without a sale and the offline
// sync result. Pos.jsx owns the state and the manager PIN; these only collect and show.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Dialog } from '@/components/ui';
import { formatBDT, formatTime } from '@/lib/format';
import { DEVICE_STATES } from '@/lib/hardware';
import { NO_SALE_REASONS } from '@/lib/posStore';
import { kgText, r3 } from '@/lib/scaleBarcode';

const money = (n) => formatBDT(n, { decimals: 2 });
const STATE_PILL = { ok: '', off: ' is-warn', error: ' is-warn' };

/** Serial / IMEI for one unit. `check(serial)` → { ok, error?, warn? }; `units` = numbers in stock here. */
export function SerialSheet({ open, product, kind, units = [], check, onAdd, onClose }) {
  const [text, setText] = useState('');
  const [res, setRes] = useState(null);
  useEffect(() => { if (open) { setText(''); setRes(null); } }, [open, product]);
  if (!product) return null;
  const label = kind === 'imei' ? 'IMEI' : 'Serial number';
  const submit = (e, value) => {
    if (e) e.preventDefault();
    const r = check(value ?? text);
    setRes(r);
    if (r.ok) onAdd(r.serial);
  };
  return (
    <Dialog open={open} title={`${label} · ${product.name}`} onClose={onClose} width={460}>
      <form className="pos-form" onSubmit={submit}>
        <div>
          <label className="gc-label" htmlFor="pos-serial">{label} *</label>
          <input id="pos-serial" className={'gc-input' + (res && !res.ok ? ' gc-input--error' : '')} inputMode={kind === 'imei' ? 'numeric' : 'text'} autoComplete="off" data-autofocus placeholder={kind === 'imei' ? '15 digits' : 'Scan or type'} value={text} onChange={(e) => { setText(e.target.value); setRes(null); }} aria-describedby="pos-serial-help" />
          <p id="pos-serial-help" className={'gc-help' + (res && !res.ok ? ' gc-help--error' : '')} role={res ? 'alert' : undefined}>{res ? res.error || res.warn || '' : `Scan the ${label} on the box.`}</p>
        </div>
        {units.length ? (
          <div>
            <span className="pos-cap">In stock here</span>
            <div className="pos-snlist">
              {units.slice(0, 8).map((u) => <button key={u.serial} type="button" className="pos-softbtn" onClick={() => { setText(u.serial); submit(null, u.serial); }}>{u.serial}</button>)}
            </div>
          </div>
        ) : null}
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!text.trim()}>Add</button></div>
      </form>
    </Dialog>
  );
}

/** Weighed item: confirm the weight before it goes on the sale. `item` = { p, kg, mode, code, fixed, price }. */
export function WeighSheet({ open, item, onAdd, onClose }) {
  const [kg, setKg] = useState('');
  useEffect(() => { if (open && item) setKg(item.kg ? String(item.kg) : ''); }, [open, item]);
  if (!item) return null;
  const w = r3(kg);
  const per = item.p.price;
  const total = item.mode === 'price' && item.fixed ? item.price : Math.round(w * per * 100) / 100;
  return (
    <Dialog open={open} title={`Weighed item · ${item.p.name}`} onClose={onClose} width={420}>
      <form className="pos-form" onSubmit={(e) => { e.preventDefault(); if (w > 0) onAdd(w); }}>
        {item.code ? <p className="pos-hint"><Icon name="scale" width="14" height="14" aria-hidden="true" /> Scale label <span className="pos-code">{item.code}</span></p> : null}
        <div className="pos-two">
          <div><label className="gc-label" htmlFor="pos-kg">Weight (kg) *</label><input id="pos-kg" className="gc-input pos-bignum" type="number" min="0" step="0.001" inputMode="decimal" data-autofocus readOnly={!!item.fixed} value={kg} onChange={(e) => setKg(e.target.value)} /></div>
          <div><span className="gc-label">Price per kg</span><div className="gc-input pos-bignum pos-ro">{money(per)}</div></div>
        </div>
        <div className="pos-paysum"><span>{w > 0 ? kgText(w) : 'Weight'}</span><b>{money(total)}</b></div>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!(w > 0)}>{item.fixed ? 'Confirm weight' : 'Add'}</button></div>
      </form>
    </Dialog>
  );
}

/** Not here, but at another place: sell it here and ship it from there. `options` = [{ place, available }]. */
export function FulfilSheet({ open, product, here, options = [], address, onPick, onClose }) {
  const [place, setPlace] = useState('');
  const [addr, setAddr] = useState('');
  useEffect(() => { if (open) { setPlace(options[0] ? options[0].place : ''); setAddr(address || ''); } }, [open, product]);   // eslint-disable-line react-hooks/exhaustive-deps
  if (!product) return null;
  return (
    <Dialog open={open} title={product.name} onClose={onClose} width={460}>
      <form className="pos-form" onSubmit={(e) => { e.preventDefault(); if (place && addr.trim()) onPick(place, addr.trim()); }}>
        <p className="pos-hint">None left at {here}. Sell it here and ship it from another place.</p>
        <ul className="pos-list pos-list--pick" aria-label="Stock at other places">
          {options.map((o) => (
            <li key={o.place}>
              <label className="pos-check" style={{ flex: 1 }}><input type="radio" name="pos-from" checked={place === o.place} onChange={() => setPlace(o.place)} />{o.place}</label>
              <span className="pos-line__amt">{o.available} available</span>
            </li>
          ))}
        </ul>
        <div><label className="gc-label" htmlFor="pos-shipaddr">Delivery address *</label><input id="pos-shipaddr" className="gc-input" placeholder="House, road, area" value={addr} onChange={(e) => setAddr(e.target.value)} /></div>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={!place || !addr.trim()}>Fulfil from {place || 'there'}</button></div>
      </form>
    </Dialog>
  );
}

/** Devices at the counter, each with its state, a demo state switch and Test. */
export function HardwareSheet({ open, counter, devices, onTest, onState, onNoSale, onClose }) {
  return (
    <Dialog open={open} title={`Hardware · ${counter}`} onClose={onClose} width={620}>
      <ul className="pos-list pos-hw">
        {devices.map((d) => (
          <li key={d.key}>
            <span className="pos-hw__ico" aria-hidden="true"><Icon name={d.icon} width="16" height="16" /></span>
            <div>
              <b>{d.label}</b>
              <span className="pos-muted">{d.name}{d.lastSeen ? ` · seen ${formatTime(d.lastSeen)}` : ''}{d.error ? ` · ${d.error}` : ''}</span>
            </div>
            <span className={'pos-pill' + STATE_PILL[d.state]}><i />{DEVICE_STATES[d.state]}</span>
            <select className="pos-in pos-hw__state" aria-label={`Demo state of ${d.label}`} value={d.state} onChange={(e) => onState(d, e.target.value)}>
              {Object.entries(DEVICE_STATES).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
            </select>
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => onTest(d)}>Test</button>
            {d.kind === 'drawer' ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={onNoSale}>Open drawer</button> : null}
          </li>
        ))}
      </ul>
    </Dialog>
  );
}

/** Open the drawer without a sale: a reason, and a manager's PIN unless the cashier may do it. */
export function NoSaleSheet({ open, allowed, onDone, onClose }) {
  const [reason, setReason] = useState(NO_SALE_REASONS[0]);
  const [note, setNote] = useState('');
  useEffect(() => { if (open) { setReason(NO_SALE_REASONS[0]); setNote(''); } }, [open]);
  const needNote = reason === 'Other';
  return (
    <Dialog open={open} title="Open drawer · no sale" onClose={onClose} width={420}>
      <form className="pos-form" onSubmit={(e) => { e.preventDefault(); if (!needNote || note.trim()) onDone({ reason, note: note.trim() }); }}>
        <div><label className="gc-label" htmlFor="pos-nsreason">Reason *</label><select id="pos-nsreason" className="gc-input gc-select" value={reason} onChange={(e) => setReason(e.target.value)}>{NO_SALE_REASONS.map((r) => <option key={r}>{r}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="pos-nsnote">{needNote ? 'Note *' : 'Note'}</label><input id="pos-nsnote" className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} /></div>
        {!allowed ? <p className="pos-hint">A manager approves with their PIN.</p> : null}
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={needNote && !note.trim()}>{allowed ? 'Open drawer' : 'Manager approval'}</button></div>
      </form>
    </Dialog>
  );
}

const CONFLICT = {
  stock: (c) => [`${c.name}: ${c.qty} sold, ${c.avail} left at ${c.place}`, { accept: 'Sell anyway', adjust: 'Stock was there' }],
  price: (c) => [`${c.name}: price changed ${money(c.was)} → ${money(c.now)}`, c.now > c.was ? { accept: 'Keep price paid', adjust: 'Book as discount' } : { accept: 'Keep price paid' }],
  serial: (c) => [`${c.name}: ${c.serial} already sold on ${c.saleId}`, { accept: 'Keep number', adjust: 'Use another' }],
};

/** What the last sync posted, and the sales that wait for a decision. */
export function SyncSheet({ open, result, review, offline, onResolve, onSync, onClose }) {
  const [other, setOther] = useState({});   // conflict id → another serial typed
  const synced = (result && result.synced) || [];
  return (
    <Dialog open={open} title="Sync" onClose={onClose} width={640}>
      <div className="pos-form">
        {offline ? <p className="pos-banner" role="status"><Icon name="wifi-off" width="16" height="16" aria-hidden="true" />Offline. Sales sync when you go online.</p> : null}
        {result ? <p className="pos-hint" role="status">{synced.length} synced · {review.length} need review</p> : null}
        {synced.length ? (
          <ul className="pos-paid" aria-label="Synced">
            {synced.map((s) => <li key={s.id}><span>{s.id} · {formatTime(s.at)}</span><span>{money(s.totals.total)}</span></li>)}
          </ul>
        ) : null}
        {review.map((s) => (
          <section key={s.id} className="pos-sync">
            <div className="pos-sync__head"><b>{s.id}</b><span className="pos-muted">{formatTime(s.at)} · {money(s.totals.total)}</span>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--flat gc-btn--error" onClick={() => onResolve(s, null, 'void')}>Void sale</button></div>
            <ul className="pos-list">
              {(s.conflicts || []).map((c) => {
                const [text, acts] = CONFLICT[c.type](c);
                return (
                  <li key={c.id}>
                    <div><span>{text}</span>{c.resolved ? <span className="pos-muted">Done · {acts[c.resolved] || c.resolved}</span> : null}</div>
                    {!c.resolved ? <>
                      {c.type === 'serial' ? <input className="pos-in pos-sync__sn" aria-label="Other number" placeholder="Other number" value={other[c.id] || ''} onChange={(e) => setOther({ ...other, [c.id]: e.target.value })} /> : null}
                      <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => onResolve(s, c, 'accept')}>{acts.accept}</button>
                      {acts.adjust ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" disabled={c.type === 'serial' && !(other[c.id] || '').trim()} onClick={() => onResolve(s, c, 'adjust', { serial: (other[c.id] || '').trim().toUpperCase() })}>{acts.adjust}</button> : null}
                    </> : null}
                  </li>
                );
              })}
            </ul>
          </section>
        ))}
        {!synced.length && !review.length ? <p className="pos-empty"><Icon name="cloud" width="28" height="28" aria-hidden="true" />Nothing waiting to sync.</p> : null}
        <div className="gc-modal__foot" style={{ marginTop: 0 }}>
          {!offline ? <button type="button" className="gc-btn gc-btn--neutral" onClick={onSync}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" /> Sync now</button> : null}
          <button type="button" className="gc-btn gc-btn--solid" onClick={onClose}>Done</button>
        </div>
      </div>
    </Dialog>
  );
}
