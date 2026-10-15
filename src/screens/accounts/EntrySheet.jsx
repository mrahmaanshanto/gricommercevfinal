'use client';
// EntrySheet — one money movement opened from a list (Money, Income & expenses): when, which account, how much,
// what for, the channel it counts under, the place, who recorded it, what it is linked to (order, invoice, bill,
// payout, the entry it reverses or the one that reversed it), its note and its receipts.
//   Edit note      the note can be changed (the old one is kept in the entry's history, lib/ledger.js setEntryNote)
//   Receipts       add a photo (made small first, like an order item's photo) or remove one
//   Reverse        asks why, then confirms; posts the mirror entry (lib/ledger.js reverseEntry). Rows that belong to
//                  another record say where they are put right instead (reverseCheck)
//   Repeats        an expense that repeats every month shows its rule with Stop repeating
// Front end only: everything is kept in this browser with the books.

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { formatDate, formatTime } from '@/lib/format';
import { KIND_LABEL, entryBy, getEntries, reverseCheck, reverseEntry, pairOf, setEntryNote, addEntryFile, removeEntryFile, getRecurring, stopRecurring, nextRun } from '@/lib/ledger';
import { homeOf } from '@/lib/categories';
import { orderHref, invoiceHref, findOrder } from '@/lib/orders';
import { money, signed, accName, useBooks, useMe } from './accShared';

const CSS = `
.es-amt{margin:0;font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);font-variant-numeric:tabular-nums}
.es-amt.is-in{color:var(--text-success)}.es-amt.is-out{color:var(--text-danger)}
.es-tags{display:flex;flex-wrap:wrap;gap:var(--space-1)}
.es-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.es-sec h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:var(--tracking-label)}
.es-sec p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.es-row{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.es-files{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.es-file{position:relative;width:88px;height:88px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-subtle)}
.es-file img{display:block;width:100%;height:100%;object-fit:cover}
.es-file button{position:absolute;top:4px;right:4px;display:grid;place-items:center;width:28px;height:28px;border:0;border-radius:var(--radius-full);background:var(--surface-card);color:var(--text-body);box-shadow:var(--shadow-card);cursor:pointer}
.es-add{display:inline-flex;align-items:center;justify-content:center;gap:var(--space-1);width:88px;height:88px;border:1px dashed var(--border-strong);border-radius:var(--radius-lg);background:none;color:var(--text-body);font:inherit;font-size:var(--text-xs);cursor:pointer;flex-direction:column}
.es-add:hover{border-color:var(--primary);color:var(--primary)}
.es-why{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);color:var(--text-body)}
.es-why a{font-weight:var(--weight-medium)}
.es-link{padding:0;border:0;background:none;font:inherit;font-weight:var(--weight-medium);color:var(--text-link);text-decoration:underline;cursor:pointer;text-align:left}
@media (max-width:640px){.es-file,.es-add{width:76px;height:76px}}
`;

/** A picked image as a small JPEG data URL (480 px on the long side), like an order item's photo. */
export function shrinkImage(file, max = 480) {
  return new Promise((resolve, reject) => {
    if (!file || !/^image\//.test(file.type)) { reject(new Error('Choose a photo')); return; }
    if (file.size > 15 * 1024 * 1024) { reject(new Error('The photo is too large (15 MB at most)')); return; }
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, max / Math.max(img.width, img.height));
      const c = document.createElement('canvas');
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      resolve(c.toDataURL('image/jpeg', 0.8));
    };
    img.onerror = () => { URL.revokeObjectURL(url); reject(new Error('That photo could not be read')); };
    img.src = url;
  });
}

const whatOf = (e) => e.cat || KIND_LABEL[e.kind] || e.kind;
/** What the entry is linked to: [label, href] rows. */
function linksOf(e) {
  const out = [];
  if (e.liab) out.push(['Bill to pay', '/liabilities']);
  if (e.ref && (e.kind === 'order payment' || e.kind === 'refund') && findOrder(e.ref)) out.push(['Order ' + e.ref, orderHref(e.ref)]);
  if (e.ref && e.kind === 'invoice payment') out.push(['Invoice ' + e.ref, invoiceHref(e.ref)]);
  if (e.kind === 'supplier payment') out.push(['Supplier bills' + (e.ref ? ' · ' + e.ref : ''), '/dues?tab=owe']);
  if (['settlement', 'collected', 'partner fee', 'courier charge', 'settlement difference', 'withdraw'].includes(e.kind)) out.push(['Payouts', '/settlements']);
  if (e.kind === 'sale' && e.ref) out.push(['Sale ' + e.ref, '/sales-book']);
  return out;
}

export function EntrySheet({ id, onClose, onOpen }) {
  const tick = useBooks();
  const me = useMe();
  const [noteEdit, setNoteEdit] = useState(null);   // text while editing
  const [why, setWhy] = useState(null);              // reason while reversing
  const [tried, setTried] = useState(false);
  const fileRef = useRef(null);
  const data = useMemo(() => {
    if (!tick || !id) return null;
    const all = getEntries();
    const e = entryBy(id, all);
    if (!e) return null;
    return { e, pair: pairOf(e, all), rule: e.recurring ? getRecurring().find((r) => r.id === e.recurring) : null, check: reverseCheck(e) };
  }, [tick, id]);
  if (!id) return null;
  const close = () => { setNoteEdit(null); setWhy(null); setTried(false); onClose(); };
  if (!data) return <Sheet open title="Money movement" onClose={close}><p className="gc-help">Loading…</p></Sheet>;
  const { e, pair, rule, check } = data;
  const by = (me && me.name) || 'Staff';
  const open = (x) => { setNoteEdit(null); setWhy(null); setTried(false); if (onOpen) onOpen(x); };

  const saveNote = () => { setEntryNote(e.id, noteEdit, by); setNoteEdit(null); toast('Note saved'); };
  const pickFile = async (ev) => {
    const f = ev.target.files && ev.target.files[0];
    ev.target.value = '';
    if (!f) return;
    try {
      const url = await shrinkImage(f);
      if (addEntryFile(e.id, { name: f.name, url }, by)) toast('Receipt added');
      else toast('This browser has no room left for photos', { tone: 'error' });
    } catch (err) { toast(err.message, { tone: 'error' }); }
  };
  const doReverse = async () => {
    setTried(true);
    if (!String(why || '').trim()) return;
    const ok = await confirmDialog({ title: `Reverse ${money(e.amount)}?`, body: pair ? `A mirror entry puts ${money(e.amount)} back on both sides of the move. Both entries stay in the books.` : `A mirror entry puts ${money(e.amount)} back ${e.amount < 0 ? 'into' : 'out of'} ${accName(e.account)}. Both entries stay in the books.`, confirmLabel: 'Reverse', tone: 'danger' });
    if (!ok) return;
    const res = reverseEntry(e.id, why, by);
    toast(res.message, { tone: res.ok ? 'success' : 'error' });
    if (res.ok) { setWhy(null); setTried(false); }
  };
  const stop = async () => {
    const ok = await confirmDialog({ title: 'Stop repeating?', body: `${rule.cat} won’t be added again. Months already added stay.`, confirmLabel: 'Stop repeating', tone: 'danger' });
    if (!ok) return;
    stopRecurring(rule.id, by);
    toast('It won’t repeat any more');
  };

  const channel = e.channel || (['expense', 'salary', 'commission', 'affiliate payout', 'promotion'].includes(e.kind) && e.cat ? homeOf(e.cat) : '');
  const links = linksOf(e);
  const files = e.files || [];
  const canFile = !e.auto && !e.live;
  const next = rule ? nextRun(rule) : null;

  const footer = check.ok ? (why == null
    ? <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={close}>Close</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setWhy('')}><Icon name="undo-2" width="16" height="16" aria-hidden="true" />Reverse</button></>
    : <><button type="button" className="gc-btn gc-btn--neutral" style={{ marginRight: 'auto' }} onClick={() => { setWhy(null); setTried(false); }}>Cancel</button><button type="button" className="gc-btn gc-btn--solid gc-btn--error" onClick={doReverse}>Reverse {money(e.amount)}</button></>)
    : <button type="button" className="gc-btn gc-btn--neutral" onClick={close}>Close</button>;

  return (
    <Sheet open title={whatOf(e)} onClose={close} footer={footer}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <p className={'es-amt ' + (e.amount < 0 ? 'is-out' : 'is-in')}>{signed(e.amount)}</p>
      {e.reverses || e.reversedBy || e.recurring || e.auto ? (
        <div className="es-tags">
          {e.reversedBy ? <StatusBadge tone="warning">Reversed</StatusBadge> : null}
          {e.reverses ? <StatusBadge tone="info">Reversal</StatusBadge> : null}
          {e.recurring ? <StatusBadge tone="neutral">Repeats monthly</StatusBadge> : null}
          {e.auto ? <StatusBadge tone="neutral">Added by GridCommerce</StatusBadge> : null}
        </div>
      ) : null}
      <KV rows={[
        ['Date', `${formatDate(e.at)}, ${formatTime(e.at)}`],
        ['Account', accName(e.account)],
        ['Kind', KIND_LABEL[e.kind] || e.kind],
        e.cat ? ['Category', e.cat] : null,
        channel ? ['Counts under', channel === 'Shared' ? 'Whole shop' : channel] : null,
        e.place ? ['Place', e.place] : null,
        [e.amount < 0 ? 'Paid to' : 'From', e.party || '—'],
        e.vat ? ['VAT on the bill', money(e.vat)] : null,
        ['Recorded by', e.by || '—'],
        e.ref && !links.length ? ['Reference', e.ref] : null,
        pair ? ['Other side', <button key="p" type="button" className="es-link" onClick={() => open(pair.id)}>{accName(pair.account)} · {signed(pair.amount)}</button>] : null,
        ...links.map(([l, href]) => ['Linked', <Link key={href + l} href={href}>{l}</Link>]),
      ]} />

      {e.reverses ? (
        <div className="es-why">Reverses an entry: <button type="button" className="es-link" onClick={() => open(e.reverses)}>open it</button>. Why: {e.note || '—'}</div>
      ) : null}
      {e.reversedBy ? (
        <div className="es-why">Reversed {formatDate(e.reversedAt)} by {e.reversedByName || 'staff'}: {e.reversedWhy}. <button type="button" className="es-link" onClick={() => open(e.reversedBy)}>Open the reversal</button></div>
      ) : null}

      {!e.reverses ? (
        <section className="es-sec" aria-labelledby="es-note">
          <div className="es-row"><h3 id="es-note">Note</h3>{noteEdit == null && !e.auto && !e.live ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setNoteEdit(e.note || '')}>Edit note</button> : null}</div>
          {noteEdit == null ? <p>{e.note || 'No note'}</p> : (
            <>
              <label className="sr-only" htmlFor="es-note-in">Note</label>
              <textarea id="es-note-in" className="gc-input" rows={3} value={noteEdit} onChange={(ev) => setNoteEdit(ev.target.value)} autoFocus />
              <div className="es-row" style={{ justifyContent: 'flex-end' }}><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setNoteEdit(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveNote}>Save note</button></div>
            </>
          )}
          {e.noteAt ? <p className="gc-help">Changed {formatDate(e.noteAt)} by {e.noteBy}</p> : null}
        </section>
      ) : null}

      {canFile ? (
        <section className="es-sec" aria-labelledby="es-files">
          <h3 id="es-files">Receipts</h3>
          <div className="es-files">
            {files.map((f) => (
              <span key={f.id || f.url} className="es-file">
                <a href={f.url} target="_blank" rel="noreferrer" aria-label={'Open ' + (f.name || 'receipt')}><img src={f.url} alt={f.name || 'Receipt'} /></a>
                {f.id ? <button type="button" aria-label="Remove photo" onClick={() => removeEntryFile(e.id, f.id)}><Icon name="x" width="14" height="14" aria-hidden="true" /></button> : null}
              </span>
            ))}
            <button type="button" className="es-add" onClick={() => fileRef.current && fileRef.current.click()}><Icon name="camera" width="18" height="18" aria-hidden="true" />Add photo</button>
            <input ref={fileRef} type="file" accept="image/*" capture="environment" hidden onChange={pickFile} />
          </div>
        </section>
      ) : null}

      {rule ? (
        <section className="es-sec" aria-labelledby="es-rule">
          <h3 id="es-rule">Repeats monthly</h3>
          <p>{money(rule.amount)} on day {rule.day} of every month from {accName(rule.account)}.{rule.stoppedAt ? ` Stopped ${formatDate(rule.stoppedAt)}.` : next ? ` Next: ${formatDate(next)}.` : ''}</p>
          {!rule.stoppedAt ? <div><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={stop}>Stop repeating</button></div> : null}
        </section>
      ) : null}

      {check.ok && why != null ? (
        <section className="es-sec" aria-labelledby="es-rev">
          <h3 id="es-rev">Reverse this entry</h3>
          <label className="gc-label" htmlFor="es-why-in">Why is it wrong?</label>
          <textarea id="es-why-in" className={'gc-input' + (tried && !why.trim() ? ' gc-input--error' : '')} rows={2} value={why} onChange={(ev) => setWhy(ev.target.value)} placeholder="e.g. Entered twice" autoFocus aria-describedby="es-why-help" />
          <p id="es-why-help" className={'gc-help' + (tried && !why.trim() ? ' gc-help--error' : '')}>{tried && !why.trim() ? 'Say why it is reversed.' : 'Nothing is deleted: a mirror entry puts the money back and both stay in the books.'}</p>
        </section>
      ) : null}
      {!check.ok && !e.reverses && !e.reversedBy ? (
        <div className="es-why">{check.why}{check.href ? <> <Link href={check.href}>{check.label}</Link></> : null}</div>
      ) : null}
    </Sheet>
  );
}
