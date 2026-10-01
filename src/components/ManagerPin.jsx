'use client';
// ManagerPin — a manager confirms an action with their PIN (price change, return after the return
// window, stock adjustment, posting a stock count difference). Demo: every manager's PIN is 1234.
// Every PIN tried is written to the audit log (lib/auditLog): approved, or refused when the PIN is wrong.
// Callers may say what it was (`action`), who asked (`by`), the sale or record (`refId`) and the amount;
// otherwise the action is read from the screen and the reason, and on the register `by` is the cashier.
import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui';
import { MANAGERS, POS_KEYS, load } from '@/lib/posStore';
import { logAudit } from '@/lib/auditLog';

export const DEMO_PIN = '1234';

/** Plain text of a reason that may be a string or React elements. */
function textOf(node) {
  if (node == null || typeof node === 'boolean') return '';
  if (typeof node === 'string' || typeof node === 'number') return String(node);
  if (Array.isArray(node)) return node.map(textOf).join('');
  return node.props ? textOf(node.props.children) + ' ' : '';
}
/** What is being approved, from the page and the reason. */
function actionOf(text) {
  const path = typeof window === 'undefined' ? '' : window.location.pathname;
  if (/credit limit/i.test(text)) return 'Credit limit';
  if (/lower the price/i.test(text)) return 'Price override';
  if (/discount/i.test(text)) return 'Line discount';
  if (/stock-count/.test(path) || /\bcount/i.test(text)) return 'Stock count';
  if (/stock-adjust/.test(path) || /pieces|on hand/i.test(text)) return 'Stock adjustment';
  if (/return-exchange/.test(path) || /return window|return|exchange/i.test(text)) return 'Late return';
  return 'Manager approval';
}
/** The register's open shift, when this is the POS: who is on the counter. */
const posShift = () => (typeof window !== 'undefined' && /^\/pos\/?$/.test(window.location.pathname) ? load(POS_KEYS.shift, null) : null);

/** `reason` says what needs approval; `onApprove(managerName)` runs once the PIN is right. */
export function ManagerPin({ open, reason, onApprove, onClose, action, by, refId, amount }) {
  const [who, setWho] = useState(MANAGERS[0]);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  useEffect(() => { if (open) { setPin(''); setErr(''); } }, [open]);
  const log = (ok) => {
    const detail = textOf(reason).replace(/\s+/g, ' ').trim();
    const shift = posShift();
    logAudit({ action: action || actionOf(detail), detail, by: by || (shift && shift.cashier) || 'Staff', approvedBy: who, ok, ref: refId || '', ...(amount != null ? { amount } : {}), ...(shift ? { counter: shift.counter } : {}) });
  };
  const submit = (e) => {
    e.preventDefault();
    if (pin !== DEMO_PIN) { log(false); setErr('That PIN is not right. Ask the manager to enter it again.'); setPin(''); return; }
    log(true);
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
