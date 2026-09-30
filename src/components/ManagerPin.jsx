'use client';
// ManagerPin — a manager confirms an action with their PIN (price change, return after the return
// window, stock adjustment, posting a stock count difference). Demo: every manager's PIN is 1234.
import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui';
import { MANAGERS } from '@/lib/posStore';

export const DEMO_PIN = '1234';

/** `reason` says what needs approval; `onApprove(managerName)` runs once the PIN is right. */
export function ManagerPin({ open, reason, onApprove, onClose }) {
  const [who, setWho] = useState(MANAGERS[0]);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setPin(''); setErr(''); } }, [open]);
  const submit = (e) => {
    e.preventDefault();
    if (pin !== DEMO_PIN) { setErr('That PIN is not right. Ask the manager to enter it again.'); setPin(''); return; }
    onApprove(who);
  };
  return (
    <Dialog open={open} title="Manager approval" onClose={onClose} width={400}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p className="gc-help" style={{ margin: 0 }}>{reason}</p>
        <div><label className="gc-label" htmlFor="mp-who">Manager</label><select id="mp-who" className="gc-input gc-select" value={who} onChange={(e) => setWho(e.target.value)}>{MANAGERS.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="mp-pin">PIN</label><input id="mp-pin" className={'gc-input' + (err ? ' gc-input--error' : '')} type="password" inputMode="numeric" autoComplete="off" maxLength={6} data-autofocus value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} aria-describedby={err ? 'mp-err' : 'mp-help'} />{err ? <p id="mp-err" className="gc-help gc-help--error" role="alert">{err}</p> : <p id="mp-help" className="gc-help">Demo PIN: 1234</p>}</div>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={pin.length < 4}>Approve</button></div>
      </form>
    </Dialog>
  );
}
