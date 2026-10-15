'use client';
// The order page's phone sheets for editing an order and its payments (/m-order-detail), the web order page's
// OrderEditDialog and ProofDialogs (src/screens/merchant-orders/) in the app's bottom-sheet look, through the same libs:
//   EditOrderSheet   items (quantity, price, remove, add a product), delivery (zone, charge), discount, address,
//                    order note and a reason; "What changes" is orderEdit.previewEdit (stock held / released, total,
//                    due, COD, refund owed, courier booking, pack again). Save changes = orderEdit.applyEdit (version + 1;
//                    a stale version is refused), Send for review = requestEdit. A waiting edit request opens here with
//                    Apply changes / Decline (applyEditRequest / discardEditRequest). The order note is saved with
//                    orders.patchOrder (it changes nothing else).
//   ProofSheet       review a payment proof (bKash / Nagad / Rocket / bank: transaction ID, amount, screenshot):
//                    Accept posts the money (paymentProof.acceptProof); Reject asks for a reason (rejectProof).
//   AddProofSheet    add a proof the customer sent (submitProof; a transaction ID counts once).
// Front end only, like the libs: nothing checks the wallet or the courier's booking here.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import {
  Sheet, Button, Field, TextInput, Chips, Stepper, Note, Icon, ListRow, SearchField, money, dateText, timeText, toast,
} from '../kit/AppKit';
import { patchOrder, logOrder, findOrder } from '@/lib/orders';
import { deliveryRates } from '@/lib/deliveryRates';
import { orderableItems } from '@/lib/sellable';
import { draftOf, previewEdit, applyEdit, requestEdit, applyEditRequest, discardEditRequest, versionOf } from '@/lib/orderEdit';
import { PROOF_METHODS, REJECT_REASONS, methodLabel, submitProof, acceptProof, rejectProof, txnUsed } from '@/lib/paymentProof';
import { accountBy, accountForMethod } from '@/lib/ledger';
import { shrinkPhoto } from './orderData';

const safe = (fn, fb) => { try { const v = fn(); return v == null ? fb : v; } catch { return fb; } };
const digits = (t) => String(t || '').replace(/[^0-9]/g, '');

export const EDIT_CSS = `
[data-screen="MOrderDetail"] .oe-sec{display:flex;flex-direction:column;gap:12px;padding:0 0 18px}
[data-screen="MOrderDetail"] .oe-sec + .oe-sec{padding-top:16px;border-top:1px solid var(--line)}
[data-screen="MOrderDetail"] .oe-h{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--ink)}
[data-screen="MOrderDetail"] .oe-line{display:flex;flex-direction:column;gap:8px;padding:10px 0}
[data-screen="MOrderDetail"] .oe-line + .oe-line{border-top:1px solid var(--line)}
[data-screen="MOrderDetail"] .oe-line.off .oe-name{color:var(--muted);text-decoration:line-through}
[data-screen="MOrderDetail"] .oe-name{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--ink);line-height:20px}
[data-screen="MOrderDetail"] .oe-name small{display:block;font-size:var(--text-xs);font-weight:var(--weight-regular);color:var(--muted);text-decoration:none}
[data-screen="MOrderDetail"] .oe-ctl{display:flex;align-items:center;gap:10px}
[data-screen="MOrderDetail"] .oe-ctl .inp{flex:1;min-width:0;height:44px}
[data-screen="MOrderDetail"] .oe-ctl .amt{flex:none;min-width:72px;text-align:right;font-size:var(--text-sm);font-weight:var(--weight-medium)}
[data-screen="MOrderDetail"] .oe-hits{border:1px solid var(--line);border-radius:var(--radius-xl);overflow:hidden}
[data-screen="MOrderDetail"] .oe-fx{display:flex;flex-direction:column;border:1px solid var(--line);border-radius:var(--radius-xl);overflow:hidden}
[data-screen="MOrderDetail"] .oe-fx .kv b{font-weight:var(--weight-semibold);color:var(--ink)}
[data-screen="MOrderDetail"] .oe-fx .warn,[data-screen="MOrderDetail"] .oe-fx .warn span{color:#7a3e05}
[data-screen="MOrderDetail"] .oe-chg{margin:0;font-size:var(--text-xs);color:var(--muted);line-height:18px}
[data-screen="MOrderDetail"] .pf-photo{display:block;width:100%;max-height:260px;object-fit:contain;border-radius:var(--radius-lg);background:var(--bg)}
[data-screen="MOrderDetail"] .pf-check{display:flex;align-items:center;gap:8px;margin:0;font-size:var(--text-sm);color:var(--body)}
[data-screen="MOrderDetail"] .pf-check.ok svg{color:var(--ok)}
[data-screen="MOrderDetail"] .pf-check.warn svg{color:var(--warn)}
[data-screen="MOrderDetail"] .pf-pick{display:flex;align-items:center;gap:12px}
[data-screen="MOrderDetail"] .pf-pick img{width:56px;height:56px;object-fit:cover;border-radius:var(--radius-lg);border:1px solid var(--line)}
`;

/** A label · value row (the order page's .kv look). */
const KV = ({ k, children, warn }) => <div className={'kv' + (warn ? ' warn' : '')}><span>{k}</span><span>{children}</span></div>;

// ---- edit order -----------------------------------------------------------------------------------------------
export function EditOrderSheet({ open, order, request, by, onClose }) {
  const [draft, setDraft] = useState(null);
  const [note, setNote] = useState('');
  const [q, setQ] = useState('');
  const [items, setItems] = useState([]);
  useEffect(() => {
    if (!open || !order) return;
    setDraft(request ? { ...draftOf(order), ...request.draft, baseVersion: versionOf(order) } : draftOf(order));
    setNote(order.note || '');
    setQ('');
    setItems(safe(() => orderableItems({ channel: 'online' }), []));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, order && order.id, request && request.at]);
  const pv = useMemo(() => (open && order && draft ? safe(() => previewEdit(order, draft), null) : null), [open, order, draft]);
  if (!open || !order || !draft || !pv) return null;

  const noteChanged = String(note || '').trim() !== String(order.note || '').trim();
  const m = pv.money;
  const setLine = (i, patch) => { const lines = draft.lines.slice(); lines[i] = { ...lines[i], ...patch }; setDraft({ ...draft, lines }); };
  const addItem = (it) => {
    const at = draft.lines.findIndex((l) => (l.sku && l.sku === it.sku) || (!l.sku && l.name === it.name));
    const lines = draft.lines.slice();
    if (at >= 0) lines[at] = { ...lines[at], qty: (Number(lines[at].qty) || 0) + 1 };
    else lines.push({ name: it.name, qty: 1, price: it.price, listPrice: it.listPrice, sku: it.sku, variant: it.variant === 'Single' ? '' : it.variant, productId: it.productId });
    setDraft({ ...draft, lines });
    setQ('');
  };
  const DELIVERY_RATES = deliveryRates();   // Settings › Delivery's charges
  const zones = [...DELIVERY_RATES.map((r) => r.label), ...(DELIVERY_RATES.some((r) => r.label === order.zone) || !order.zone ? [] : [order.zone])];
  const setZone = (z) => { const r = DELIVERY_RATES.find((x) => x.label === z); setDraft({ ...draft, zone: z, shipping: r ? r.fee : draft.shipping }); };
  const needle = q.trim().toLowerCase();
  const hits = needle ? items.filter((it) => (it.name + ' ' + it.sku + ' ' + it.variant).toLowerCase().includes(needle)).slice(0, 6) : [];
  // nothing in the order changed but the note: the note is saved on its own
  const onlyNote = pv.empty && noteChanged;
  const blocked = pv.error && !onlyNote;

  const saveNote = (fresh) => {
    if (!noteChanged) return;
    const text = String(note || '').trim();
    patchOrder(fresh, { note: text });
    logOrder(order.id, 'sticky-note', 'Order note changed', text ? (text.length > 60 ? text.slice(0, 60) + '…' : text) : 'Removed');
  };
  const save = () => {
    if (onlyNote) { saveNote(findOrder(order.id) || order); onClose(); toast('Note saved'); return; }
    const r = request ? applyEditRequest(order, by, draft) : applyEdit(order, draft, by);
    if (!r.ok) {
      toast(r.error, { tone: 'error' });
      // changed somewhere else meanwhile: close, so the order is read again before editing
      if (r.conflict) onClose();
      return;
    }
    saveNote(findOrder(order.id) || order);
    onClose();
    toast(`Order updated · version ${r.version}`);
  };
  const sendForReview = () => {
    const r = requestEdit(order, draft, { by });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    saveNote(findOrder(order.id) || order);
    onClose();
    toast('Sent for review');
  };
  const decline = () => { discardEditRequest(order, '', by); onClose(); toast('Edit request declined'); };

  const footer = request
    ? <><Button kind="line" onClick={decline}>Decline</Button><Button kind="primary" style={{ flex: '2' }} disabled={!!blocked} onClick={save}>Apply changes</Button></>
    : <><Button kind="line" style={{ flex: '1' }} disabled={!!pv.error} onClick={sendForReview}>Send for review</Button><Button kind="primary" style={{ flex: '1' }} disabled={!!blocked} onClick={save}>Save changes</Button></>;

  return (
    <Sheet open={open} onClose={onClose} title={`Edit ${order.id}`} footer={footer}>
      {request ? (
        <Note tone="info" icon="edit" style={{ marginBottom: '14px' }}>
          <b>{request.by}{request.from === 'Customer' ? ' (customer)' : ''}</b> asked {timeText(request.at)}, {dateText(request.at)}{request.note ? ': ' + request.note : ''}
        </Note>
      ) : null}

      <div className="oe-sec">
        <h3 className="oe-h">Items</h3>
        <div>
          {draft.lines.map((l, i) => {
            const qty = Number(l.qty) || 0;
            return (
              <div key={(l.orig != null ? 'o' + l.orig : 'n' + i) + l.name} className={'oe-line' + (qty ? '' : ' off')}>
                <span className="oe-name">{l.name}{l.variant || l.orig == null ? <small>{[l.variant, l.orig == null ? 'New' : ''].filter(Boolean).join(' · ')}</small> : null}</span>
                <span className="oe-ctl">
                  <span className="inp"><span className="pre">৳</span><input type="text" inputMode="numeric" aria-label={'Price: ' + l.name} value={l.price} onChange={(e) => setLine(i, { price: e.target.value === '' ? '' : Number(digits(e.target.value)) })} /></span>
                  <Stepper value={qty} min={0} label={'Quantity: ' + l.name} onChange={(n) => setLine(i, { qty: n })} />
                  <span className="amt num">{qty ? money((Number(l.price) || 0) * qty) : 'Removed'}</span>
                </span>
              </div>
            );
          })}
        </div>
        <SearchField value={q} onChange={setQ} placeholder="Add a product: name or SKU" style={{ margin: '0' }} />
        {hits.length ? (
          <div className="oe-hits">
            {hits.map((it) => <ListRow key={it.sku} compact icon="plus" title={it.name + (it.variant && it.variant !== 'Single' ? ' · ' + it.variant : '')} sub={`${money(it.price)} · ${it.stock} free`} onClick={() => addItem(it)} chevron={false} />)}
          </div>
        ) : needle ? <span className="help">No product matches “{q}”.</span> : null}
      </div>

      <div className="oe-sec">
        <h3 className="oe-h">Delivery</h3>
        <div className="field"><span className="lab">Zone</span><Chips value={draft.zone} onChange={setZone} items={zones.map((z) => ({ key: z, label: z }))} /></div>
        <Field label="Delivery charge"><TextInput value={String(draft.shipping)} onChange={(t) => setDraft({ ...draft, shipping: digits(t) })} prefix="৳" inputMode="numeric" /></Field>
        <Field label="Address"><TextInput multiline value={draft.address} onChange={(t) => setDraft({ ...draft, address: t })} /></Field>
      </div>

      <div className="oe-sec">
        <h3 className="oe-h">Money and notes</h3>
        <Field label="Discount" help="The whole order’s discount"><TextInput value={String(draft.discount == null ? '' : draft.discount)} onChange={(t) => setDraft({ ...draft, discount: digits(t) })} prefix="৳" inputMode="numeric" /></Field>
        <Field label="Order note" help="Seen by the courier and on the invoice"><TextInput multiline value={note} onChange={setNote} /></Field>
        <Field label="Reason"><TextInput value={draft.reason} onChange={(t) => setDraft({ ...draft, reason: t })} placeholder="e.g. Customer changed the size" /></Field>
      </div>

      <div className="oe-sec" aria-live="polite">
        <h3 className="oe-h">What changes</h3>
        {onlyNote ? <span className="help">Only the order note changes.</span>
          : pv.error ? <span className="help" role={pv.empty ? undefined : 'alert'} style={pv.empty ? undefined : { color: 'var(--err)' }}>{pv.error}</span> : (
            <>
              <div className="oe-fx">
                <KV k="Total"><b className="num">{money(m.before)} → {money(m.after)}</b></KV>
                {m.paid ? <KV k="Paid"><span className="num">{money(m.paid)}</span></KV> : null}
                <KV k="Due"><span className="num">{money(m.dueBefore)} → {money(m.due)}</span></KV>
                {m.wasCod ? <KV k="COD"><span className="num">{money(m.codBefore)} → {money(m.codAfter)}</span></KV> : null}
                {m.refund ? <KV k="Refund owed" warn><span className="num">{money(m.refund)}</span></KV> : null}
                <KV k="Stock">{pv.stockMode === 'none' ? (['onhold', 'processing', 'pending'].includes(order.statusKey) ? 'Held when approved' : 'No stock held')
                  : pv.stock.length ? pv.stock.map((s) => `${{ hold: 'Hold', release: 'Release', take: 'Take out', return: 'Put back' }[s.action]} ${Math.abs(s.delta)} × ${s.name}${s.short ? ` (${s.free} free)` : ''}`).join(' · ') + ' · ' + pv.place
                  : 'No change'}</KV>
                <KV k="Courier" warn={pv.courier.action !== 'none'}>{pv.courier.text}</KV>
                {pv.repack ? <KV k="Packing" warn>{pv.repack}</KV> : null}
              </div>
              <p className="oe-chg">{pv.changes.join(' · ')} · saves as version {versionOf(order) + 1}</p>
            </>
          )}
      </div>
    </Sheet>
  );
}

// ---- review a payment proof -------------------------------------------------------------------------------------
const dueOf = (o) => Math.max(0, (o.amount || 0) - (o.paid || 0));

export function ProofSheet({ open, order, proof, by, onClose }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [note, setNote] = useState('');
  const [big, setBig] = useState(false);
  useEffect(() => { if (open) { setRejecting(false); setReason(REJECT_REASONS[0]); setNote(''); setBig(false); } }, [open, proof && proof.id]);
  if (!open || !order || !proof) return null;
  const due = dueOf(order);
  const used = safe(() => txnUsed(proof.txn, order.id).filter((h) => h.proof.id !== proof.id), []);
  const usedOk = used.some((h) => h.proof.state === 'accepted');
  const acc = safe(() => accountBy(accountForMethod(proof.method, false)), null);
  const match = proof.amount === due ? ['ok', 'Matches the amount due'] : proof.amount > due ? ['warn', `${money(proof.amount - due)} more than due`] : ['warn', `${money(due - proof.amount)} less than due: the rest stays due`];

  const accept = () => {
    const r = acceptProof(order, proof.id, by);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    onClose();
    toast(r.full ? 'Payment accepted · paid in full' : 'Payment accepted');
  };
  const reject = () => {
    const why = reason === 'Other' ? note.trim() || 'Other' : reason + (note.trim() ? ' · ' + note.trim() : '');
    const r = rejectProof(order, proof.id, why, by);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    onClose();
    toast('Payment rejected');
  };
  const footer = rejecting
    ? <><Button kind="line" onClick={() => setRejecting(false)}>Back</Button><Button kind="danger" style={{ flex: '2' }} onClick={reject}>Reject payment</Button></>
    : <><Button kind="line" onClick={() => setRejecting(true)}>Reject</Button><Button kind="primary" icon="check" style={{ flex: '2' }} disabled={usedOk} onClick={accept}>Accept</Button></>;

  return (
    <Sheet open={open} onClose={onClose} title="Review payment" footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="oe-fx">
          <KV k="Paid by">{safe(() => methodLabel(proof.method), proof.method)}</KV>
          <KV k="Transaction ID"><span className="mono">{proof.txn}</span></KV>
          <KV k="Amount"><b className="num">{money(proof.amount)}</b></KV>
          <KV k="Due now"><span className="num">{money(due)}</span></KV>
          <KV k="Added by">{proof.from === 'Customer' ? `${proof.by} (customer)` : proof.by}</KV>
          {proof.sender ? <KV k="Sent from"><span className="num">{proof.sender}</span></KV> : null}
          <KV k="Added">{timeText(proof.at)}, {dateText(proof.at)}</KV>
        </div>
        <p className={'pf-check ' + match[0]}><Icon name={match[0] === 'ok' ? 'check' : 'alert'} size={18} />{match[1]}</p>
        {used.length ? <p className="pf-check warn"><Icon name="alert" size={18} />Same transaction ID on {used.map((h) => h.order.id).join(', ')}{usedOk ? ' (already accepted)' : ''}</p> : null}
        {proof.photo ? (
          <button type="button" onClick={() => setBig(!big)} aria-label={big ? 'Show the screenshot smaller' : 'Show the screenshot bigger'} style={{ border: 0, padding: 0, background: 'none', cursor: 'zoom-in' }}>
            <img className="pf-photo" src={proof.photo} alt="Payment screenshot" style={big ? { maxHeight: 'none' } : undefined} />
          </button>
        ) : null}
        {acc && !rejecting ? <span className="help">Accept adds {money(proof.amount)} to {acc.name}.</span> : null}
        {rejecting ? (
          <>
            <div className="field"><span className="lab">Reason</span><Chips value={reason} onChange={setReason} items={REJECT_REASONS.map((x) => ({ key: x, label: x }))} /></div>
            <Field label="Note"><TextInput value={note} onChange={setNote} placeholder={reason === 'Other' ? 'What is wrong?' : 'Optional'} /></Field>
          </>
        ) : null}
      </div>
    </Sheet>
  );
}

// ---- add a payment proof ----------------------------------------------------------------------------------------
export function AddProofSheet({ open, order, by, onClose }) {
  const [f, setF] = useState({ method: 'bkash', txn: '', amount: '', sender: '', photo: '' });
  const [err, setErr] = useState('');
  const file = useRef(null);
  useEffect(() => { if (open && order) { setF({ method: 'bkash', txn: '', amount: String(dueOf(order) || ''), sender: '', photo: '' }); setErr(''); } }, [open, order && order.id]);   // eslint-disable-line react-hooks/exhaustive-deps
  if (!open || !order) return null;
  const onFile = async (e) => {
    const x = e.target.files && e.target.files[0];
    if (!x) return;
    try { const url = await shrinkPhoto(x); setF((s) => ({ ...s, photo: url })); } catch (er) { toast(er.message, { tone: 'error' }); }
  };
  const save = () => {
    const r = submitProof(order, { ...f, from: 'Customer', by: order.customer || by });
    if (!r.ok) { setErr(r.error); return; }
    onClose();
    toast('Payment proof added');
  };
  return (
    <Sheet open={open} onClose={onClose} title="Add payment proof"
      footer={<><Button kind="line" onClick={onClose}>Cancel</Button><Button kind="primary" style={{ flex: '2' }} onClick={save}>Add proof</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div className="field"><span className="lab">Paid by</span><Chips value={f.method} onChange={(k) => setF({ ...f, method: k })} items={PROOF_METHODS.map(([k, l]) => ({ key: k, label: l }))} /></div>
        <Field label="Transaction ID" error={err || undefined}><TextInput value={f.txn} onChange={(t) => { setF({ ...f, txn: t }); setErr(''); }} placeholder="e.g. BK8H2KQ7TX" /></Field>
        <Field label="Amount"><TextInput value={f.amount} onChange={(t) => setF({ ...f, amount: digits(t) })} prefix="৳" inputMode="numeric" /></Field>
        <Field label="Sent from"><TextInput value={f.sender} onChange={(t) => setF({ ...f, sender: t })} placeholder="Optional" inputMode="tel" type="tel" /></Field>
        <div className="pf-pick">
          {f.photo ? <img src={f.photo} alt="Payment screenshot" /> : null}
          <Button kind="soft" icon="plus" style={{ height: '40px' }} onClick={() => { if (file.current) { file.current.value = ''; file.current.click(); } }}>{f.photo ? 'Change screenshot' : 'Add screenshot'}</Button>
          {f.photo ? <Button kind="line" style={{ height: '40px' }} onClick={() => setF({ ...f, photo: '' })}>Remove</Button> : null}
          <input ref={file} type="file" accept="image/*" hidden onChange={onFile} />
        </div>
      </div>
    </Sheet>
  );
}
