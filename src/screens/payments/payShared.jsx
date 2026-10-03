'use client';
// payShared — the side panels and dialogs of the Payments page (brief #5), kept apart so Order detail and the
// invoice page can open the same ones:
//   PaymentReview   check a manual bKash / Nagad / bank payment: the claim, the duplicate-reference check, verify
//                   (the amount that arrived), needs correction or reject. One checker at a time: opening it takes
//                   the lock (lib/paymentRefs.js) and someone else sees who has it open.
//   RefundPanel     a refund's stage, age and history, and the next step (send, done, failed, retry, cancel)
//   LinkPanel       a payment link: copy it, its payments, "Pay now (demo)", cancel
//   BatchPanel      one terminal's day: card sales vs the batch total, enter or replace the total, explain it
//   LinkDialog · RefundDialog · BatchDialog   create a link, ask for a refund, enter or import batch totals
// Side panels review, the list never decides (AGENTS.md › requests are reviewed in a drawer).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog, Sheet, StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { formatDateTime, formatDate } from '@/lib/format';
import { accountForMethod } from '@/lib/ledger';
import { findOrder } from '@/lib/orders';
import { manualPaymentBy, verifyPayment, askCorrection, rejectPayment, duplicateOf, STATUS as MP_STATUS } from '@/lib/manualPayments';
import { lockOf, takeLock, releaseLock, LOCK_MINUTES } from '@/lib/paymentRefs';
import { refundBy, sendRefund, confirmRefund, failRefund, cancelRefund, requestRefund, ageText, STAGE_LABEL, STAGE_TONE, METHODS } from '@/lib/refunds';
import { linkBy, linkUrl, linkStatus, payLink, cancelLink, createLink, linkTargets, paidOn, STATUS_TEXT, STATUS_TONE, LINK_METHODS, EXPIRY_CHOICES } from '@/lib/paymentLinks';
import { getTerminals, enterBatch, explainBatch, importBatches, batchRows, BATCH_STATUS } from '@/lib/terminalBatches';
import { needsApproval } from '@/lib/approvals';
import { dayKey, clockNow } from '@/lib/settlements';
import { ACC_CSS, AccountSelect, RefField, money, accName, useMe } from '@/screens/accounts/accShared';

export const PAY_CSS = `
.pv{display:flex;flex-direction:column;gap:var(--space-4)}
.pv-sum{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.pv-sum b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pv-sum span{font-size:var(--text-xs);color:var(--text-muted)}
.pv h3{margin:0 0 var(--space-2);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.pv-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.pv-log li{display:flex;justify-content:space-between;gap:var(--space-3);padding:6px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-body)}
.pv-log li:first-child{border-top:0}
.pv-log small{color:var(--text-muted);white-space:nowrap}
.pv-fig{font-family:var(--font-data);font-variant-numeric:tabular-nums}
.pv-url{display:flex;gap:var(--space-2);align-items:center}
.pv-url code{flex:1;min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;padding:6px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs)}
.pv-steps{display:flex;flex-wrap:wrap;gap:6px}
.pv-steps span{display:inline-flex;align-items:center;gap:4px;font-size:var(--text-xs);color:var(--text-muted)}
.pv-steps span.is-on{color:var(--text-heading);font-weight:var(--weight-medium)}
.pv-steps span.is-done{color:var(--text-success)}
.pv-steps span + span::before{content:'›';margin-right:2px;color:var(--text-muted)}
.pv-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);justify-content:flex-end;width:100%}
.pv-foot .pv-left{margin-right:auto}
.pv-area{height:auto;min-height:72px;padding:10px 12px}
`;

const Note = ({ tone = 'info', icon, children }) => (
  <div className={'ac-note ac-note--' + tone} role="status"><Icon name={icon || (tone === 'ok' ? 'circle-check' : tone === 'warn' ? 'triangle-alert' : 'info')} width="16" height="16" aria-hidden="true" /><span>{children}</span></div>
);
const Log = ({ rows }) => (
  <ul className="pv-log">{rows.slice().reverse().map((h, i) => <li key={i}><span>{h.what || h.note || STAGE_LABEL[h.stage] || h.stage}{h.by ? ' · ' + h.by : ''}</span><small>{formatDateTime(h.at)}</small></li>)}</ul>
);
const minsAgo = (t) => Math.max(1, Math.round((Date.now() - t) / 60e3));

// ---- check a manual payment ----------------------------------------------------------------------------
/** The review panel of one manual payment. id: an MP-… id. Closing it decides nothing (and frees the lock). */
export function PaymentReview({ id, onClose }) {
  const me = useMe();
  const [mp, setMp] = useState(() => manualPaymentBy(id));
  const [lock, setLock] = useState(null);     // { ok, lock }
  const [amount, setAmount] = useState(() => String((manualPaymentBy(id) || {}).claimed || ''));
  const [mode, setMode] = useState('');       // '' | 'correction' | 'reject'
  const [why, setWhy] = useState('');
  useEffect(() => {
    if (!me || !mp) return undefined;
    const open = mp.status === 'waiting' || mp.status === 'correction';
    if (open) setLock(takeLock(mp.id, me));
    return () => { if (open) releaseLock(mp.id, me); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [me]);
  if (!mp) return null;
  const order = findOrder(mp.order);
  const owed = order ? Math.max(0, (order.amount || 0) - (order.paid || 0)) : null;
  const dup = duplicateOf(mp);
  const open = mp.status === 'waiting' || mp.status === 'correction';
  const blocked = open && lock && !lock.ok;
  const can = open && lock && lock.ok;
  const amt = Math.round((Number(amount) || 0) * 100) / 100;
  const done = (r) => { if (!r.ok) { toast(r.message, { tone: 'error' }); return; } toast(r.message); setMp(manualPaymentBy(id)); onClose(true); };
  const decide = (e) => {
    e.preventDefault();
    if (mode === 'correction') done(askCorrection(mp.id, why, me));
    else if (mode === 'reject') done(rejectPayment(mp.id, why, me));
    else done(verifyPayment(mp.id, amt, me));
  };
  const footer = !can ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Close</button> : (
    <div className="pv-foot">
      {mode ? <button type="button" className="gc-btn gc-btn--neutral pv-left" onClick={() => { setMode(''); setWhy(''); }}>Back</button> : <>
        <button type="button" className="gc-btn gc-btn--neutral pv-left" onClick={() => setMode('reject')}>Reject</button>
        {mp.status === 'waiting' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('correction')}>Needs correction</button> : null}
      </>}
      <button type="submit" form="pv-mp" className={'gc-btn ' + (mode === 'reject' ? 'gc-btn--solid gc-btn--error' : 'gc-btn--solid')} disabled={!mode && !!dup}>{mode === 'reject' ? 'Reject payment' : mode === 'correction' ? 'Ask to fix' : `Verify ${amt > 0 ? money(amt) : ''}`}</button>
    </div>
  );
  return (
    <Sheet open title={`${mp.method} payment · ${mp.order}`} onClose={() => onClose(false)} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + PAY_CSS }} />
      <form id="pv-mp" className="pv" onSubmit={decide}>
        <div className="pv-sum"><b>{money(mp.claimed)} claimed by {mp.customer}</b><span>Sent {formatDateTime(mp.at)} · <StatusBadge tone={MP_STATUS[mp.status][1]}>{MP_STATUS[mp.status][0]}</StatusBadge></span></div>
        {blocked ? <Note tone="warn" icon="lock">{lock.lock.name} is checking this payment (opened {minsAgo(lock.lock.at)} min ago). You can look; deciding opens when they close it or after {LOCK_MINUTES} minutes.</Note> : null}
        {dup ? <Note tone="warn">{dup}. Check the {mp.method} statement before you decide; this payment can only be rejected or sent back for correction.</Note> : null}
        <KV rows={[
          ['Expected', owed == null ? '—' : <span className="pv-fig">{money(owed)}</span>],
          ['Claimed', <span key="c" className="pv-fig">{money(mp.claimed)}</span>],
          ['Transaction ID', <span key="t" className="pv-fig">{mp.txn}</span>],
          ['Sender', mp.sender],
          ['Pays into', accName(accountForMethod(mp.method === 'Bank transfer' ? 'bank' : mp.method, false) || '')],
          mp.verified ? ['Verified', <span key="v" className="pv-fig">{money(mp.verified)}</span>] : null,
          mp.note ? ['Note', mp.note] : null,
          order ? ['Order', <Link key="o" href={'/order-detail?id=' + encodeURIComponent(mp.order)}>{mp.order} · {order.status}</Link>] : ['Order', mp.order],
        ]} />
        {can && !mode ? (
          <div className="ac-two">
            <div>
              <label className="gc-label" htmlFor="pv-amt">Amount that arrived (৳)</label>
              <input id="pv-amt" className="gc-input ac-fig" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} aria-describedby="pv-amt-help" />
              <p id="pv-amt-help" className="gc-help" style={{ margin: '4px 0 0' }}>{amt && amt !== mp.claimed ? 'A different amount is saved as part verified.' : 'Check it in the wallet or bank first.'}</p>
            </div>
          </div>
        ) : null}
        {can && mode ? (
          <div>
            <label className="gc-label" htmlFor="pv-why">{mode === 'reject' ? 'Why is it rejected?' : 'What must the customer fix?'}</label>
            <textarea id="pv-why" className="gc-input pv-area" value={why} onChange={(e) => setWhy(e.target.value)} placeholder={mode === 'reject' ? (dup ? dup : 'e.g. No such payment in the statement') : 'e.g. Send the full transaction ID'} data-autofocus />
          </div>
        ) : null}
        <div><h3>History</h3><Log rows={mp.history || []} /></div>
      </form>
    </Sheet>
  );
}

// ---- refunds -------------------------------------------------------------------------------------------
const FLOW = ['requested', 'approved', 'sent', 'done'];
export function RefundPanel({ id, onClose }) {
  const me = useMe();
  const [rf, setRf] = useState(() => refundBy(id));
  const [method, setMethod] = useState(() => (refundBy(id) || {}).method || 'bKash');
  const [account, setAccount] = useState(() => (refundBy(id) || {}).account || 'bkash');
  const [ref, setRef] = useState('');
  const [mode, setMode] = useState('');   // '' | 'fail' | 'cancel'
  const [why, setWhy] = useState('');
  if (!rf) return null;
  const refresh = () => setRf(refundBy(id));
  const fin = (ok, msg) => { if (!ok) { toast(msg, { tone: 'error' }); return; } toast(msg); refresh(); onClose(true); };
  const send = (e) => {
    e.preventDefault();
    if (mode === 'fail') { if (!why.trim()) { toast('Say why it failed', { tone: 'error' }); return; } failRefund(rf.id, why.trim(), me); fin(true, `Refund ${rf.id} failed · ${money(rf.amount)} back in ${accName(rf.account)}`); return; }
    if (mode === 'cancel') { if (!why.trim()) { toast('Give a reason', { tone: 'error' }); return; } cancelRefund(rf.id, why.trim(), me); fin(true, `Refund ${rf.id} cancelled`); return; }
    if (method !== 'Cash' && !ref.trim()) { toast('Enter the reference of the refund', { tone: 'error' }); return; }
    const r = sendRefund(rf.id, { providerRef: ref.trim(), account, method }, me);
    fin(r.ok, r.ok ? `${money(rf.amount)} sent to ${rf.customer}` : r.message);
  };
  const canSend = rf.stage === 'approved' || rf.stage === 'failed';
  const at = FLOW.indexOf(rf.stage);
  const footer = (
    <div className="pv-foot">
      {mode ? <button type="button" className="gc-btn gc-btn--neutral pv-left" onClick={() => { setMode(''); setWhy(''); }}>Back</button> : (
        ['requested', 'approved', 'failed'].includes(rf.stage) ? <button type="button" className="gc-btn gc-btn--neutral pv-left" onClick={() => setMode('cancel')}>Cancel refund</button> : <span className="pv-left" />
      )}
      {mode ? <button type="submit" form="pv-rf" className="gc-btn gc-btn--solid gc-btn--error">{mode === 'fail' ? 'Mark failed' : 'Cancel refund'}</button>
        : rf.stage === 'sent' ? <>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('fail')}>It failed</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={() => { confirmRefund(rf.id, me, 'Confirmed'); fin(true, `Refund ${rf.id} done`); }}>Mark done</button>
        </> : canSend ? <button type="submit" form="pv-rf" className="gc-btn gc-btn--solid">{rf.stage === 'failed' ? 'Send again' : 'Send'} {money(rf.amount)}</button>
          : <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Close</button>}
    </div>
  );
  return (
    <Sheet open title={`Refund ${rf.id}`} onClose={() => onClose(false)} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + PAY_CSS }} />
      <form id="pv-rf" className="pv" onSubmit={send}>
        <div className="pv-sum"><b>{money(rf.amount)} to {rf.customer}</b><span>{rf.reason || 'No reason given'} · asked {formatDate(rf.requestedAt)} · {ageText(rf)} old</span></div>
        <div className="pv-steps" aria-label="Stages">{FLOW.map((s, i) => <span key={s} className={rf.stage === s ? 'is-on' : at > i ? 'is-done' : ''}>{STAGE_LABEL[s]}</span>)}{rf.stage === 'failed' || rf.stage === 'cancelled' ? <StatusBadge tone={STAGE_TONE[rf.stage]}>{STAGE_LABEL[rf.stage]}</StatusBadge> : null}</div>
        {rf.stage === 'requested' ? <Note tone="warn" icon="hourglass">Over the refund limit. It waits for an approver. <Link href={'/money-approvals?id=' + encodeURIComponent(rf.approval || '')}>Open the approval</Link></Note> : null}
        {rf.stage === 'failed' ? <Note tone="warn">{rf.failReason}. The money is back in {accName(rf.account)}. Send it again (another number or way), or cancel it.</Note> : null}
        <KV rows={[
          ['For', rf.ref ? (rf.ref.startsWith('#') ? <Link key="r" href={'/order-detail?id=' + encodeURIComponent(rf.ref)}>{rf.ref}</Link> : rf.ref.startsWith('INV') ? <Link key="r" href={'/sales-invoice?id=' + encodeURIComponent(rf.ref)}>{rf.ref}</Link> : rf.ref) : '—'],
          ['Method', rf.method],
          ['From', accName(rf.account)],
          rf.providerRef ? ['Reference', <span key="p" className="pv-fig">{rf.providerRef}</span>] : null,
          ['Asked by', rf.byName],
          ['Tries', String(rf.tries || 0)],
        ]} />
        {canSend && !mode ? (<>
          <div className="ac-two">
            <div><label className="gc-label" htmlFor="pv-rf-m">Send by</label><select id="pv-rf-m" className="gc-input gc-select" value={method} onChange={(e) => { setMethod(e.target.value); const a = accountForMethod(e.target.value === 'Bank transfer' ? 'bank' : e.target.value, false); if (a && a !== 'card') setAccount(a); }}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
            <AccountSelect id="pv-rf-acc" label="From" value={account} onChange={setAccount} />
          </div>
          {method !== 'Cash' ? <RefField id="pv-rf-ref" label="Reference of the refund" value={ref} onChange={setRef} owner={rf.id} required /> : null}
        </>) : null}
        {mode ? (
          <div><label className="gc-label" htmlFor="pv-rf-why">{mode === 'fail' ? 'What happened?' : 'Why cancel it?'}</label><textarea id="pv-rf-why" className="gc-input pv-area" value={why} onChange={(e) => setWhy(e.target.value)} placeholder={mode === 'fail' ? 'e.g. The bKash number is not a personal account' : 'e.g. Customer took store credit instead'} data-autofocus /></div>
        ) : null}
        <div><h3>History</h3><Log rows={rf.history || []} /></div>
      </form>
    </Sheet>
  );
}

/** Ask for a refund (from the Payments page; Return & exchange can call lib/refunds › requestRefund). */
export function RefundDialog({ onClose, start = {} }) {
  const me = useMe();
  const [f, setF] = useState({ ref: start.ref || '', customer: start.customer || '', amount: start.amount ? String(start.amount) : '', method: 'bKash', reason: '' });
  const amt = Number(f.amount) || 0;
  const rule = amt > 0 ? needsApproval({ kind: 'refund', amount: amt, account: accountForMethod(f.method === 'Bank transfer' ? 'bank' : f.method, false) }) : null;
  const save = (e) => {
    e.preventDefault();
    if (!f.customer.trim() || !(amt > 0)) { toast('Enter the customer and the amount', { tone: 'error' }); return; }
    const rf = requestRefund({ ...f, amount: amt, source: 'Payments', account: accountForMethod(f.method === 'Bank transfer' ? 'bank' : f.method, f.method === 'Cash') }, me);
    toast(rf.stage === 'requested' ? `Refund ${rf.id} waits for approval` : `Refund ${rf.id} ready to send`);
    onClose(rf);
  };
  const set = (patch) => setF({ ...f, ...patch });
  return (
    <Dialog open title="Record refund" onClose={() => onClose(null)} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(null)}>Cancel</button><button type="submit" form="pv-rfd" className="gc-btn gc-btn--solid">{rule ? 'Ask for approval' : 'Save refund'}</button></>}>
      <form id="pv-rfd" className="ac-form" onSubmit={save} noValidate>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="pv-rfd-ref">Order or invoice</label><input id="pv-rfd-ref" className="gc-input" value={f.ref} onChange={(e) => set({ ref: e.target.value })} placeholder="#136804 or INV-0231" data-autofocus /></div>
          <div><label className="gc-label" htmlFor="pv-rfd-c">Customer *</label><input id="pv-rfd-c" className="gc-input" value={f.customer} onChange={(e) => set({ customer: e.target.value })} /></div>
        </div>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="pv-rfd-a">Amount (৳) *</label><input id="pv-rfd-a" className="gc-input ac-fig" inputMode="decimal" value={f.amount} onChange={(e) => set({ amount: e.target.value.replace(/[^\d.]/g, '') })} /></div>
          <div><label className="gc-label" htmlFor="pv-rfd-m">Give back by</label><select id="pv-rfd-m" className="gc-input gc-select" value={f.method} onChange={(e) => set({ method: e.target.value })}>{METHODS.map((m) => <option key={m}>{m}</option>)}</select></div>
        </div>
        <div><label className="gc-label" htmlFor="pv-rfd-r">Reason</label><input id="pv-rfd-r" className="gc-input" value={f.reason} onChange={(e) => set({ reason: e.target.value })} placeholder="e.g. Returned without damage" /></div>
        {rule ? <Note tone="warn" icon="hourglass">Over the {money(rule.limit)} refund limit. An approver must approve it before it is sent.</Note> : null}
      </form>
    </Dialog>
  );
}

// ---- payment links ---------------------------------------------------------------------------------------
async function copy(text) {
  try { await navigator.clipboard.writeText(text); toast('Link copied'); } catch { toast('Could not copy. Select the link and copy it.', { tone: 'error' }); }
}
export function LinkPanel({ id, onClose }) {
  const me = useMe();
  const [link, setLink] = useState(() => linkBy(id));
  const [method, setMethod] = useState('bKash');
  const [txn, setTxn] = useState('');
  const [paying, setPaying] = useState(false);
  if (!link) return null;
  const st = linkStatus(link);
  const pay = (e) => {
    e.preventDefault();
    const r = payLink(link.id, { method, txn }, me);
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    toast(r.message); setLink(linkBy(id)); setPaying(false); setTxn('');
  };
  const footer = (
    <div className="pv-foot">
      {st === 'active' ? <button type="button" className="gc-btn gc-btn--neutral pv-left" onClick={() => { cancelLink(link.id); toast('Link cancelled'); onClose(true); }}>Cancel link</button> : <span className="pv-left" />}
      {st === 'active' && paying ? <button type="submit" form="pv-pay" className="gc-btn gc-btn--solid">Record payment</button>
        : st === 'active' ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => setPaying(true)}>Pay now (demo)</button>
          : <button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Close</button>}
    </div>
  );
  return (
    <Sheet open title={`Payment link · ${link.ref}`} onClose={() => onClose(false)} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + PAY_CSS }} />
      <form id="pv-pay" className="pv" onSubmit={pay}>
        <div className="pv-sum"><b>{money(link.amount)} · {link.reusable ? 'Reusable' : 'One-time'}</b><span>{link.customer} · <StatusBadge tone={STATUS_TONE[st]}>{STATUS_TEXT[st]}</StatusBadge></span></div>
        <div className="pv-url"><code>{linkUrl(link)}</code><button type="button" className="ix-btn ix-btn--sm" onClick={() => copy(linkUrl(link))}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy</button></div>
        <KV rows={[
          ['For', link.refKind === 'invoice' ? <Link key="r" href={'/sales-invoice?id=' + encodeURIComponent(link.ref)}>{link.ref}</Link> : <Link key="r" href={'/order-detail?id=' + encodeURIComponent(link.ref)}>{link.ref}</Link>],
          ['Made', `${formatDateTime(link.createdAt)} · ${link.by}`],
          ['Expires', formatDateTime(link.expiresAt)],
          ['Paid so far', <span key="p" className="pv-fig">{money(paidOn(link))}</span>],
        ]} />
        {paying ? (
          <div className="ac-two">
            <div><label className="gc-label" htmlFor="pv-pay-m">Paid by</label><select id="pv-pay-m" className="gc-input gc-select" value={method} onChange={(e) => setMethod(e.target.value)}>{LINK_METHODS.map(([m]) => <option key={m}>{m}</option>)}</select></div>
            <RefField id="pv-pay-txn" value={txn} onChange={setTxn} owner={link.ref} required />
          </div>
        ) : null}
        <div><h3>Payments</h3>{(link.payments || []).length ? <ul className="pv-log">{link.payments.map((p, i) => <li key={i}><span>{money(p.amount)} · {p.method} · <span className="pv-fig">{p.txn}</span></span><small>{formatDateTime(p.at)}</small></li>)}</ul> : <p className="gc-help" style={{ margin: 0 }}>Not paid yet.</p>}</div>
      </form>
    </Sheet>
  );
}

/** Make a payment link for an order or an invoice that still owes money. */
export function LinkDialog({ onClose, start = '' }) {
  const me = useMe();
  const targets = useMemo(() => linkTargets(), []);
  const [ref, setRef] = useState(start && targets.some((t) => t.ref === start) ? start : (targets[0] || {}).ref || '');
  const t = targets.find((x) => x.ref === ref);
  const [amount, setAmount] = useState(t ? String(t.owed) : '');
  const [days, setDays] = useState(3);
  const [reusable, setReusable] = useState(false);
  const pick = (v) => { setRef(v); const x = targets.find((y) => y.ref === v); if (x) setAmount(String(x.owed)); };
  const save = (e) => {
    e.preventDefault();
    const amt = Number(amount) || 0;
    if (!t) { toast('Pick an order or invoice', { tone: 'error' }); return; }
    if (!(amt > 0) || amt > t.owed + 0.001) { toast(`Enter up to ${money(t.owed)}`, { tone: 'error' }); return; }
    const link = createLink({ ref: t.ref, refKind: t.refKind, customer: t.customer, phone: t.phone, amount: amt, days, reusable }, me);
    toast(`Link made for ${t.ref}`);
    onClose(link);
  };
  return (
    <Dialog open title="Create payment link" onClose={() => onClose(null)} width={520}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(null)}>Cancel</button><button type="submit" form="pv-ld" className="gc-btn gc-btn--solid">Create link</button></>}>
      <form id="pv-ld" className="ac-form" onSubmit={save} noValidate>
        <div>
          <label className="gc-label" htmlFor="pv-ld-ref">For</label>
          <select id="pv-ld-ref" className="gc-input gc-select" value={ref} onChange={(e) => pick(e.target.value)} data-autofocus>
            {['order', 'invoice'].map((k) => { const g = targets.filter((x) => x.refKind === k); return g.length ? <optgroup key={k} label={k === 'order' ? 'Orders' : 'Invoices'}>{g.map((x) => <option key={x.ref} value={x.ref}>{x.ref} · {x.customer} · {money(x.owed)} owed</option>)}</optgroup> : null; })}
          </select>
        </div>
        <div className="ac-two">
          <div><label className="gc-label" htmlFor="pv-ld-a">Amount (৳)</label><input id="pv-ld-a" className="gc-input ac-fig" inputMode="decimal" value={amount} onChange={(e) => setAmount(e.target.value.replace(/[^\d.]/g, ''))} /></div>
          <div><label className="gc-label" htmlFor="pv-ld-d">Expires after</label><select id="pv-ld-d" className="gc-input gc-select" value={days} onChange={(e) => setDays(Number(e.target.value))}>{EXPIRY_CHOICES.map(([d, l]) => <option key={d} value={d}>{l}</option>)}</select></div>
        </div>
        <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-sm)' }}><input type="checkbox" checked={reusable} onChange={(e) => setReusable(e.target.checked)} /> Reusable (the customer can pay in parts)</label>
      </form>
    </Dialog>
  );
}

// ---- card batches -----------------------------------------------------------------------------------------
export function BatchPanel({ rowKey, onClose }) {
  const me = useMe();
  const row = batchRows().find((r) => r.key === rowKey);
  const [total, setTotal] = useState(row && row.batch ? String(row.batch.total) : '');
  const [why, setWhy] = useState('');
  if (!row) return null;
  const [label, tone] = BATCH_STATUS[row.status];
  const save = (e) => {
    e.preventDefault();
    if (row.diff && !row.batch.explained && why.trim() && String(row.batch.total) === total) {
      const r = explainBatch(row.terminal, row.day, why, (me || {}).name);
      if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
      toast('Difference explained'); onClose(true); return;
    }
    const r = enterBatch({ terminal: row.terminal, day: row.day, total }, (me || {}).name);
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    const diff = Math.round((r.batch.total - row.grid) * 100) / 100;
    toast(diff ? `Batch saved · ${money(Math.abs(diff))} ${diff < 0 ? 'short' : 'over'}` : 'Batch saved · matches');
    onClose(true);
  };
  return (
    <Sheet open title={`${row.terminal} · ${formatDate(new Date(row.day + 'T12:00:00').getTime())}`} onClose={() => onClose(false)}
      footer={<div className="pv-foot"><button type="button" className="gc-btn gc-btn--neutral pv-left" onClick={() => onClose(false)}>Close</button><button type="submit" form="pv-bt" className="gc-btn gc-btn--solid">Save</button></div>}>
      <style dangerouslySetInnerHTML={{ __html: ACC_CSS + PAY_CSS }} />
      <form id="pv-bt" className="pv" onSubmit={save}>
        <div className="pv-sum"><b>{row.term ? row.term.name : row.terminal}</b><span>{row.term ? row.term.branch : ''} · <StatusBadge tone={tone}>{label}</StatusBadge></span></div>
        <dl className="ix-sum">
          <dt>Card sales in GridCommerce</dt><dd className="pv-fig">{money(row.grid)}</dd>
          <dt>Batch total on the machine</dt><dd className="pv-fig">{row.batch ? money(row.batch.total) : '—'}</dd>
          <dt className="is-total">Difference</dt><dd className="is-total pv-fig">{row.diff == null ? '—' : (row.diff < 0 ? '−' : row.diff > 0 ? '+' : '') + money(row.diff)}</dd>
        </dl>
        {row.batch && row.batch.explained ? <Note tone="info">{row.batch.explained} · {row.batch.explainedBy}</Note> : null}
        <div className="ac-two"><div><label className="gc-label" htmlFor="pv-bt-t">Batch total (৳)</label><input id="pv-bt-t" className="gc-input ac-fig" inputMode="decimal" value={total} onChange={(e) => setTotal(e.target.value.replace(/[^\d.]/g, ''))} placeholder="From the settlement slip" /></div></div>
        {row.diff && row.batch && !row.batch.explained ? <div><label className="gc-label" htmlFor="pv-bt-w">Why is it different?</label><input id="pv-bt-w" className="gc-input" value={why} onChange={(e) => setWhy(e.target.value)} placeholder="e.g. A ৳500 sale was keyed on the other machine" /></div> : null}
        <div><h3>Card sales ({row.count})</h3>{row.items.length ? <ul className="pv-log">{row.items.map((i) => <li key={i.id}><span>{i.ref} · {i.party}</span><small className="pv-fig">{money(i.gross)}</small></li>)}</ul> : <p className="gc-help" style={{ margin: 0 }}>No card sales recorded on this terminal that day.</p>}</div>
        {row.batch && (row.batch.history || []).length ? <div><h3>Earlier totals</h3><ul className="pv-log">{row.batch.history.map((h, i) => <li key={i}><span className="pv-fig">{money(h.total)} · {h.source}</span><small>{formatDateTime(h.at)}</small></li>)}</ul></div> : null}
      </form>
    </Sheet>
  );
}

/** Enter one batch total, or import a file of them. */
export function BatchDialog({ onClose, importing = false }) {
  const me = useMe();
  const terms = useMemo(() => getTerminals(), []);
  const [mode, setMode] = useState(importing ? 'import' : 'one');
  const [f, setF] = useState({ terminal: (terms[0] || {}).id || '', day: dayKey(clockNow() - 864e5), total: '', count: '' });
  const [text, setText] = useState('');
  const save = (e) => {
    e.preventDefault();
    const by = (me || {}).name;
    if (mode === 'import') {
      const r = importBatches(text, by);
      if (!r.added && !r.replaced) { toast(r.bad ? 'No line could be read. Use: terminal, date, total' : 'Paste the batch lines first', { tone: 'error' }); return; }
      toast(`${r.added} added${r.replaced ? `, ${r.replaced} replaced` : ''}${r.bad ? `, ${r.bad} skipped` : ''}`);
      onClose(true); return;
    }
    const r = enterBatch({ ...f, source: 'Typed' }, by);
    if (!r.ok) { toast(r.message, { tone: 'error' }); return; }
    toast(r.replaced ? 'Batch total replaced' : 'Batch total saved');
    onClose(true);
  };
  const onFile = (e) => { const file = e.target.files && e.target.files[0]; if (!file) return; const rd = new FileReader(); rd.onload = () => setText(String(rd.result || '')); rd.readAsText(file); };
  return (
    <Dialog open title="Card batch totals" onClose={() => onClose(false)} width={540}
      footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => onClose(false)}>Cancel</button><button type="submit" form="pv-bd" className="gc-btn gc-btn--solid">{mode === 'import' ? 'Import' : 'Save'}</button></>}>
      <form id="pv-bd" className="ac-form" onSubmit={save} noValidate>
        <div className="ac-seg" role="group" aria-label="How"><button type="button" aria-pressed={mode === 'one'} onClick={() => setMode('one')}>Enter one</button><button type="button" aria-pressed={mode === 'import'} onClick={() => setMode('import')}>Import a file</button></div>
        {mode === 'one' ? (<>
          <div className="ac-two">
            <div><label className="gc-label" htmlFor="pv-bd-t">Terminal</label><select id="pv-bd-t" className="gc-input gc-select" value={f.terminal} onChange={(e) => setF({ ...f, terminal: e.target.value })}>{terms.map((t) => <option key={t.id} value={t.id}>{t.id} · {t.bank} · {t.branch}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="pv-bd-d">Day</label><input id="pv-bd-d" type="date" className="gc-input" value={f.day} max={dayKey(clockNow())} onChange={(e) => setF({ ...f, day: e.target.value })} /></div>
          </div>
          <div className="ac-two">
            <div><label className="gc-label" htmlFor="pv-bd-a">Batch total (৳)</label><input id="pv-bd-a" className="gc-input ac-fig" inputMode="decimal" value={f.total} onChange={(e) => setF({ ...f, total: e.target.value.replace(/[^\d.]/g, '') })} data-autofocus /></div>
            <div><label className="gc-label" htmlFor="pv-bd-c">Number of payments</label><input id="pv-bd-c" className="gc-input ac-fig" inputMode="numeric" value={f.count} onChange={(e) => setF({ ...f, count: e.target.value.replace(/\D/g, '') })} placeholder="Optional" /></div>
          </div>
        </>) : (<>
          <div><label className="gc-label" htmlFor="pv-bd-f">Batch file (CSV)</label><input id="pv-bd-f" type="file" accept=".csv,.txt,text/csv,text/plain" className="gc-input" onChange={onFile} /></div>
          <div><label className="gc-label" htmlFor="pv-bd-x">Or paste the lines</label><textarea id="pv-bd-x" className="gc-input pv-area ac-fig" rows={5} value={text} onChange={(e) => setText(e.target.value)} placeholder={'terminal, date, total, count\nCBL-DHN-01, 2026-10-01, 18400, 6'} /></div>
          <p className="gc-help" style={{ margin: 0 }}>The same terminal and day again replaces the earlier total.</p>
        </>)}
      </form>
    </Dialog>
  );
}
