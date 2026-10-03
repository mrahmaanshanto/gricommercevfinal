'use client';
// ProofDialogs — a manual payment proof (bKash / Nagad / Rocket / bank: transaction ID, amount, optional photo) and its
// review (Accept posts the money; Reject asks for a reason). Logic: src/lib/paymentProof.js.
// Used on the order page and in Order work › Payment to review.

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Dialog } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { accountBy, accountForMethod } from '@/lib/ledger';
import { PROOF_METHODS, REJECT_REASONS, methodLabel, submitProof, acceptProof, rejectProof, txnUsed } from '@/lib/paymentProof';

const CSS = `
.pf-form{display:flex;flex-direction:column;gap:var(--space-4)}
.pf-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.pf-photo{display:block;width:100%;max-height:320px;object-fit:contain;border-radius:var(--radius-lg);background:var(--surface-subtle)}
.pf-check{display:flex;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);color:var(--text-body)}
.pf-check.is-ok svg{color:var(--text-success)}
.pf-check.is-warn svg{color:var(--text-warning)}
.pf-pick{display:flex;align-items:center;gap:var(--space-3)}
.pf-pick img{width:48px;height:48px;object-fit:cover;border-radius:var(--radius-md);border:1px solid var(--border-subtle)}
@media (max-width:640px){.pf-two{grid-template-columns:minmax(0,1fr)}}
`;

const dueOf = (o) => Math.max(0, (o.amount || 0) - (o.paid || 0));

/** Read an image file and make it small (800 px on the long side, JPEG). */
function shrink(file, done) {
  const url = URL.createObjectURL(file);
  const img = new Image();
  img.onload = () => {
    const k = Math.min(1, 800 / Math.max(img.width, img.height));
    const c = document.createElement('canvas');
    c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
    c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
    URL.revokeObjectURL(url);
    done(c.toDataURL('image/jpeg', 0.8));
  };
  img.onerror = () => { URL.revokeObjectURL(url); toast('Could not read this image', { tone: 'error' }); };
  img.src = url;
}

export function AddProofDialog({ open, order, onClose, onDone }) {
  const [f, setF] = useState({ method: 'bkash', txn: '', amount: '', sender: '', from: 'Customer', photo: '' });
  const [err, setErr] = useState('');
  const file = useRef(null);
  useEffect(() => { if (open && order) { setF({ method: 'bkash', txn: '', amount: String(dueOf(order) || ''), sender: '', from: 'Customer', photo: '' }); setErr(''); } }, [open, order && order.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  if (!order) return null;
  const set = (k) => (e) => setF({ ...f, [k]: e.target.value });
  const onFile = (e) => {
    const x = e.target.files && e.target.files[0];
    if (!x) return;
    if (!/^image\//.test(x.type)) { toast('Choose an image', { tone: 'error' }); return; }
    shrink(x, (url) => setF((s) => ({ ...s, photo: url })));
  };
  const save = (e) => {
    e.preventDefault();
    const r = submitProof(order, { ...f, by: f.from === 'Customer' ? order.customer : 'Staff' });
    if (!r.ok) { setErr(r.error); return; }
    toast('Payment proof added');
    onDone && onDone();
  };
  return (
    <Dialog open={open} title="Add payment proof" onClose={onClose} width={480}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <form className="pf-form" onSubmit={save}>
        <div className="pf-two">
          <div><label className="gc-label" htmlFor="pf-method">Paid by</label><select id="pf-method" className="gc-input gc-select" data-autofocus value={f.method} onChange={set('method')}>{PROOF_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="pf-amount">Amount (৳)</label><input id="pf-amount" className="gc-input" type="number" min="1" inputMode="numeric" value={f.amount} onChange={set('amount')} /></div>
        </div>
        <div><label className="gc-label" htmlFor="pf-txn">Transaction ID</label><input id="pf-txn" className="gc-input ix-id" value={f.txn} onChange={set('txn')} placeholder="e.g. BK8H2KQ7TX" autoComplete="off" aria-invalid={!!err} /></div>
        <div className="pf-two">
          <div><label className="gc-label" htmlFor="pf-sender">Sent from</label><input id="pf-sender" className="gc-input" value={f.sender} onChange={set('sender')} placeholder="Optional" inputMode="tel" /></div>
          <div><label className="gc-label" htmlFor="pf-from">Added by</label><select id="pf-from" className="gc-input gc-select" value={f.from} onChange={set('from')}><option value="Customer">Customer</option><option value="Staff">Staff</option></select></div>
        </div>
        <div className="pf-pick">
          {f.photo ? <img src={f.photo} alt="Payment screenshot" /> : null}
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => { if (file.current) { file.current.value = ''; file.current.click(); } }}><Icon name="image-plus" width="16" height="16" aria-hidden="true" />{f.photo ? 'Change photo' : 'Add photo'}</button>
          {f.photo ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setF({ ...f, photo: '' })}>Remove</button> : null}
          <input ref={file} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
        {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Add proof</button></div>
      </form>
    </Dialog>
  );
}

export function ReviewProofDialog({ open, order, proof, onClose, onDone }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [note, setNote] = useState('');
  useEffect(() => { if (open) { setRejecting(false); setReason(REJECT_REASONS[0]); setNote(''); } }, [open, proof && proof.id]);
  if (!order || !proof) return null;
  const due = dueOf(order);
  const used = txnUsed(proof.txn, order.id).filter((h) => h.proof.id !== proof.id);
  const acc = accountBy(accountForMethod(proof.method, false));
  const match = proof.amount === due ? ['ok', 'Matches the amount due'] : proof.amount > due ? ['warn', `${formatBDT(proof.amount - due)} more than due`] : ['warn', `${formatBDT(due - proof.amount)} less than due: the rest stays due`];
  const accept = () => {
    const r = acceptProof(order, proof.id);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(r.full ? 'Payment accepted · paid in full' : 'Payment accepted');
    onDone && onDone();
  };
  const reject = (e) => {
    e.preventDefault();
    const why = reason === 'Other' ? note.trim() || 'Other' : reason + (note.trim() ? ' · ' + note.trim() : '');
    const r = rejectProof(order, proof.id, why);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast('Payment rejected');
    onDone && onDone();
  };
  return (
    <Dialog open={open} title={`Review payment · ${order.id}`} onClose={onClose} width={500}
      footer={rejecting ? null : <>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRejecting(true)}>Reject</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={accept} disabled={used.some((h) => h.proof.state === 'accepted')}>Accept</button>
      </>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="pf-form">
        <KV rows={[
          ['Paid by', methodLabel(proof.method)],
          ['Transaction ID', <span key="t" className="ix-id">{proof.txn}</span>],
          ['Amount', formatBDT(proof.amount)],
          ['Due now', formatBDT(due)],
          ['Added by', proof.from === 'Customer' ? `${proof.by} (customer)` : proof.by],
          proof.sender ? ['Sent from', proof.sender] : null,
          ['Added', `${formatTime(proof.at)}, ${formatDate(proof.at)}`],
        ]} />
        <p className={'pf-check is-' + match[0]}><Icon name={match[0] === 'ok' ? 'circle-check' : 'circle-alert'} width="16" height="16" aria-hidden="true" />{match[1]}</p>
        {used.length ? <p className="pf-check is-warn"><Icon name="circle-alert" width="16" height="16" aria-hidden="true" />Same transaction ID on {used.map((h) => h.order.id).join(', ')}</p> : null}
        {proof.photo ? <img className="pf-photo" src={proof.photo} alt="Payment screenshot" /> : null}
        {acc ? <p className="gc-help" style={{ margin: 0 }}>Accept adds {formatBDT(proof.amount)} to {acc.name}.</p> : null}
        {rejecting ? (
          <form className="pf-form" onSubmit={reject}>
            <div><label className="gc-label" htmlFor="pf-reason">Reason</label><select id="pf-reason" className="gc-input gc-select" data-autofocus value={reason} onChange={(e) => setReason(e.target.value)}>{REJECT_REASONS.map((x) => <option key={x}>{x}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="pf-note">Note</label><input id="pf-note" className="gc-input" value={note} onChange={(e) => setNote(e.target.value)} placeholder="Optional" /></div>
            <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setRejecting(false)}>Back</button><button type="submit" className="gc-btn gc-btn--solid gc-btn--error">Reject payment</button></div>
          </form>
        ) : null}
      </div>
    </Dialog>
  );
}
