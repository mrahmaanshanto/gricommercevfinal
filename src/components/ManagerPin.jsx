'use client';
// ManagerPin — someone who may approve confirms an action with their own PIN (price change, a discount over the
// cashier's limit, return after the return window, stock adjustment, drawer opened without a sale …). The list of
// approvers and each person's PIN come from POS management › Settings (lib/posStore.js: approversFor, pinOf); everyone
// who approves has the demo PIN 1234 until they set their own. `need` narrows the list to people allowed to do the
// action themselves: { perm: 'price' | 'refund' | 'void' | 'drawer' | 'due' | 'discount', pct } (default: anyone who
// approves). Nobody approves their own request (`by`).
// Every PIN tried is written to the audit log (lib/auditLog): approved, or refused when the PIN is wrong.
// Callers may say what it was (`action`), who asked (`by`), the sale or record (`refId`) and the amount;
// otherwise the action is read from the screen and the reason, and on the register `by` is the cashier.
import React, { useEffect, useState } from 'react';
import { Dialog } from '@/components/ui';
import { MANAGERS, POS_KEYS, load, approversFor, checkPin, hasOwnPin, getEmployees, DEMO_PIN as POS_DEMO_PIN } from '@/lib/posStore';
import { logAudit } from '@/lib/auditLog';

export const DEMO_PIN = POS_DEMO_PIN;

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

/** `reason` says what needs approval; `onApprove(approverName)` runs once their PIN is right. */
export function ManagerPin({ open, reason, onApprove, onClose, action, by, refId, amount, need }) {
  const [list, setList] = useState(MANAGERS);
  const [who, setWho] = useState(MANAGERS[0]);
  const [pin, setPin] = useState('');
  const [err, setErr] = useState('');
  const asker = by || ((posShift() || {}).cashier) || '';
  useEffect(() => {
    if (!open) return;
    getEmployees();
    const people = approversFor((need && need.perm) || 'any', { pct: (need && need.pct) || 0 }).filter((n) => n !== asker);
    const next = people.length ? people : MANAGERS.filter((n) => n !== asker);
    setList(next); setWho((w) => (next.includes(w) ? w : next[0] || ''));
    setPin(''); setErr('');
  }, [open]);   // eslint-disable-line react-hooks/exhaustive-deps
  const log = (ok) => {
    const detail = textOf(reason).replace(/\s+/g, ' ').trim();
    const shift = posShift();
    logAudit({ action: action || actionOf(detail), detail, by: by || (shift && shift.cashier) || 'Staff', approvedBy: who, ok, ref: refId || '', ...(amount != null ? { amount } : {}), ...(shift ? { counter: shift.counter } : {}) });
  };
  const submit = (e) => {
    e.preventDefault();
    if (!who) { setErr('Nobody else can approve this. Change the POS limits in POS management.'); return; }
    if (!checkPin(who, pin)) { log(false); setErr(`That is not ${who}’s PIN. Ask them to enter it again.`); setPin(''); return; }
    log(true);
    onApprove(who);
  };
  const demo = who && !hasOwnPin(who);
  return (
    <Dialog open={open} title="Approval" onClose={onClose} width={400}>
      <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <p className="gc-help" style={{ margin: 0 }}>{reason}</p>
        <div><label className="gc-label" htmlFor="mp-who">Approved by</label><select id="mp-who" className="gc-input gc-select" value={who} onChange={(e) => { setWho(e.target.value); setErr(''); }}>{list.map((m) => <option key={m}>{m}</option>)}</select></div>
        <div><label className="gc-label" htmlFor="mp-pin">Their PIN</label><input id="mp-pin" className={'gc-input' + (err ? ' gc-input--error' : '')} type="password" inputMode="numeric" autoComplete="off" maxLength={6} data-autofocus value={pin} onChange={(e) => { setPin(e.target.value.replace(/\D/g, '')); setErr(''); }} aria-describedby={err ? 'mp-err' : 'mp-help'} />{err ? <p id="mp-err" className="gc-help gc-help--error" role="alert">{err}</p> : <p id="mp-help" className="gc-help">{demo ? `Demo PIN: ${DEMO_PIN}` : 'Each person enters their own PIN.'}</p>}</div>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid" disabled={pin.length < 4}>Approve</button></div>
      </form>
    </Dialog>
  );
}
