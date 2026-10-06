'use client';
// Dialogs used by the Inbox: saved replies, product card, payment link, merge a duplicate,
// start a conversation, snooze until a chosen time, and a photo viewer.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState, ChannelIcon } from '@/components/ui';
import { BrandLogo } from '@/components/BrandLogo';
import { formatBDT } from '@/lib/format';
import { searchProducts, stockAt } from '@/lib/stock';
import { isStatusSellable } from '@/lib/sellable';
import { getReplies, upsertReply, deleteReply, channelName, samePhone, previewOf, lastAny, ago } from '@/lib/inbox';
import { SearchBox, Avatar } from './parts';

const CAT_ICON = { Phones: 'smartphone', Accessories: 'cable', Audio: 'headphones', Wearables: 'watch', 'Power banks': 'battery-charging' };
export const catIcon = (cat) => CAT_ICON[cat] || 'package';

// ---- saved replies ------------------------------------------------------------------------------
const BLANK = { title: '', short: '', lang: 'en', body: '' };
export function SavedRepliesDialog({ open, onClose, onUse }) {
  const [list, setList] = useState([]);
  const [q, setQ] = useState('');
  const [lang, setLang] = useState('all');
  const [edit, setEdit] = useState(null);
  useEffect(() => { if (open) { setList(getReplies()); setEdit(null); setQ(''); } }, [open]);
  const shown = list.filter((r) => (lang === 'all' || r.lang === lang) && (!q || (r.title + ' ' + r.short + ' ' + r.body).toLowerCase().includes(q.toLowerCase())));
  const save = (e) => {
    e.preventDefault();
    if (!edit.title.trim() || !edit.body.trim()) { toast('Give the reply a name and the text', { tone: 'error' }); return; }
    const short = edit.short.trim().replace(/^\//, '').replace(/\s+/g, '-').toLowerCase() || edit.title.trim().split(/\s+/)[0].toLowerCase();
    setList(upsertReply({ ...edit, title: edit.title.trim(), short, body: edit.body.trim() }));
    toast(edit.id ? 'Saved reply updated' : 'Saved reply added');
    setEdit(null);
  };
  const remove = async (r) => {
    if (!(await confirmDialog({ title: `Delete “${r.title}”?`, body: 'The reply is removed for the whole team. Messages already sent keep their text.', confirmLabel: 'Delete', tone: 'danger' }))) return;
    setList(deleteReply(r.id));
    toast('Saved reply deleted');
  };
  return (
    <Dialog open={open} title={edit ? (edit.id ? 'Edit saved reply' : 'New saved reply') : 'Saved replies'} onClose={onClose} width={640}>
      {edit ? (
        <form className="ib-form" onSubmit={save}>
          <div className="ib-two">
            <div><label className="gc-label" htmlFor="sr-title">Name *</label><input id="sr-title" className="gc-input" data-autofocus value={edit.title} onChange={(e) => setEdit({ ...edit, title: e.target.value })} placeholder="Price and COD" /></div>
            <div><label className="gc-label" htmlFor="sr-short">Shortcut</label><input id="sr-short" className="gc-input" value={edit.short} onChange={(e) => setEdit({ ...edit, short: e.target.value })} placeholder="price" /></div>
          </div>
          <div><label className="gc-label" htmlFor="sr-lang">Language</label><select id="sr-lang" className="gc-input gc-select" value={edit.lang} onChange={(e) => setEdit({ ...edit, lang: e.target.value })}><option value="en">English</option><option value="bn">বাংলা (Bangla)</option></select></div>
          <div>
            <label className="gc-label" htmlFor="sr-body">Reply text *</label>
            <textarea id="sr-body" className={'gc-input' + (edit.lang === 'bn' ? ' ib-bn' : '')} rows="5" value={edit.body} onChange={(e) => setEdit({ ...edit, body: e.target.value })} />
            <p className="gc-help">{'{name}'} becomes the customer’s first name and {'{order}'} their latest order number. Type “/” and the shortcut in the composer to use it.</p>
          </div>
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Back</button><button type="submit" className="gc-btn gc-btn--solid">Save reply</button></div>
        </form>
      ) : (
        <div className="ib-form">
          <div className="ib-toolbar">
            <SearchBox value={q} onChange={setQ} placeholder="Search saved replies" />
            <select className="gc-input gc-select ib-fit" aria-label="Language" value={lang} onChange={(e) => setLang(e.target.value)}><option value="all">All languages</option><option value="en">English</option><option value="bn">Bangla</option></select>
            <button type="button" className="gc-btn gc-btn--solid" onClick={() => setEdit({ ...BLANK })}><Icon name="plus" width="18" height="18" aria-hidden="true" />New</button>
          </div>
          {shown.length ? (
            <ul className="ib-replylist">
              {shown.map((r) => (
                <li key={r.id}>
                  <div className="ib-replylist__text">
                    <p className="ib-replylist__title"><span className={r.lang === 'bn' ? 'ib-bn' : ''}>{r.title}</span><span className="gc-badge gc-badge--slate ib-data">/{r.short}</span><span className="gc-badge gc-badge--info">{r.lang === 'bn' ? 'বাংলা' : 'EN'}</span></p>
                    <p className={'ib-replylist__body' + (r.lang === 'bn' ? ' ib-bn' : '')}>{r.body}</p>
                    <span className="ib-sub">Used {r.uses || 0} times</span>
                  </div>
                  <div className="ib-replylist__acts">
                    {onUse ? <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => { onUse(r); onClose(); }}>Use</button> : null}
                    <button type="button" className="gc-iconbtn" aria-label={'Edit ' + r.title} onClick={() => setEdit({ ...r })}><Icon name="pencil" width="16" height="16" /></button>
                    <button type="button" className="gc-iconbtn" aria-label={'Delete ' + r.title} onClick={() => remove(r)}><Icon name="trash-2" width="16" height="16" /></button>
                  </div>
                </li>
              ))}
            </ul>
          ) : <EmptyState icon="zap" title="No saved replies match" body="Try another word, or add a new saved reply for the team." actionLabel="New saved reply" onAction={() => setEdit({ ...BLANK })} />}
        </div>
      )}
    </Dialog>
  );
}

// ---- product card -------------------------------------------------------------------------------
export function ProductDialog({ open, onClose, onSend }) {
  const [q, setQ] = useState('');
  useEffect(() => { if (open) setQ(''); }, [open]);
  const rows = useMemo(() => (open ? searchProducts(q).filter(isStatusSellable).slice(0, 40).map((p) => ({ ...p, free: stockAt(p.sku, '').available })) : []), [open, q]);
  return (
    <Dialog open={open} title="Send a product card" onClose={onClose} width={560}>
      <SearchBox value={q} onChange={setQ} placeholder="Search by name, SKU or barcode" />
      {rows.length ? (
        <ul className="ib-prodlist">
          {rows.map((p) => (
            <li key={p.sku}>
              <span className="ib-prodlist__tile"><Icon name={catIcon(p.cat)} width="20" height="20" aria-hidden="true" /></span>
              <span className="ib-prodlist__text">
                <span className="ib-prodlist__name">{p.name}</span>
                <span className="ib-sub"><span className="ib-data">{p.sku}</span>{p.variant ? ' · ' + p.variant : ''}</span>
              </span>
              <span className="ib-prodlist__nums">
                <span className="ib-price">{formatBDT(p.price)}</span>
                <span className={'ib-sub' + (p.free ? '' : ' ib-out')}>{p.free ? `${p.free} in stock` : 'Out of stock'}</span>
              </span>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--soft" onClick={() => onSend(p)} aria-label={'Send ' + p.name}>Send</button>
            </li>
          ))}
        </ul>
      ) : <EmptyState icon="package-search" title="No products found" body="Check the spelling or search by SKU." />}
    </Dialog>
  );
}

// ---- payment link ---------------------------------------------------------------------------------
const METHODS = [['bkash', 'bKash'], ['nagad', 'Nagad'], ['sslcommerz', 'Card or bank (SSLCOMMERZ)']];
export function PaymentDialog({ open, onClose, onSend, orders }) {
  const unpaid = (orders || []).filter((o) => o.statusKey !== 'cancelled' && o.payment !== 'Paid');
  const [f, setF] = useState({ order: '', amount: '', method: 'bkash', note: '' });
  useEffect(() => {
    if (!open) return;
    const o = unpaid[0];
    setF({ order: o ? o.id : '', amount: o ? String(Math.max(0, o.amount - (o.paid || 0))) : '', method: 'bkash', note: '' });
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const pick = (id) => { const o = unpaid.find((x) => x.id === id); setF({ ...f, order: id, amount: o ? String(Math.max(0, o.amount - (o.paid || 0))) : f.amount }); };
  const send = (e) => {
    e.preventDefault();
    const amount = Math.round(Number(f.amount));
    if (!amount || amount < 1) { toast('Enter the amount to collect', { tone: 'error' }); return; }
    onSend({ amount, order: f.order, method: f.method, note: f.note.trim() });
  };
  return (
    <Dialog open={open} title="Send a payment link" onClose={onClose} width={520}>
      <form className="ib-form" onSubmit={send}>
        <div className="ib-two">
          <div><label className="gc-label" htmlFor="pl-order">For</label><select id="pl-order" className="gc-input gc-select" value={f.order} onChange={(e) => pick(e.target.value)}><option value="">No order (advance or custom)</option>{unpaid.map((o) => <option key={o.id} value={o.id}>{o.id} · {o.total}</option>)}</select></div>
          <div><label className="gc-label" htmlFor="pl-amt">Amount (৳) *</label><input id="pl-amt" className="gc-input ib-data" inputMode="numeric" data-autofocus value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value.replace(/[^0-9]/g, '') })} /></div>
        </div>
        <div role="radiogroup" aria-label="Pay with" className="ib-opts">
          {METHODS.map(([id, label]) => (
            <label key={id} className={'ib-opt' + (f.method === id ? ' is-on' : '')}>
              <input type="radio" name="pl-method" className="gc-check gc-check--radio" checked={f.method === id} onChange={() => setF({ ...f, method: id })} />
              <BrandLogo brand={id} size={28} decorative />
              <span>{label}</span>
            </label>
          ))}
        </div>
        <div><label className="gc-label" htmlFor="pl-note">Message with the link</label><input id="pl-note" className="gc-input" value={f.note} onChange={(e) => setF({ ...f, note: e.target.value })} placeholder="Optional, for example: advance for 2 phones" /></div>
        <p className="gc-help" style={{ margin: 0 }}>The link works for 24 hours. The payment shows on the order once the customer pays.</p>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid"><Icon name="link" width="18" height="18" aria-hidden="true" />Send link</button></div>
      </form>
    </Dialog>
  );
}

// ---- merge duplicate contact ----------------------------------------------------------------------
export function MergeDialog({ open, onClose, conv, convs, onMerge, now }) {
  const [pick, setPick] = useState('');
  const [q, setQ] = useState('');
  const others = useMemo(() => {
    if (!conv) return [];
    const first = (conv.name || '').replace(/^@/, '').split(/\s+/)[0].toLowerCase();
    return convs.filter((c) => c.id !== conv.id).map((c) => ({ c, same: samePhone(c.phone, conv.phone), like: first && c.name.toLowerCase().includes(first) }))
      .sort((x, y) => (y.same - x.same) || (y.like - x.like) || ((lastAny(y.c) || { at: 0 }).at - (lastAny(x.c) || { at: 0 }).at));
  }, [conv, convs]);
  useEffect(() => { if (open) { setQ(''); setPick(others.find((o) => o.same || o.like) ? others[0].c.id : ''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const shown = others.filter(({ c }) => !q || (c.name + ' ' + c.phone + ' ' + c.handle).toLowerCase().includes(q.toLowerCase())).slice(0, 8);
  return (
    <Dialog open={open && !!conv} title="Merge a duplicate contact" onClose={onClose} width={560}>
      {conv ? (
        <div className="ib-form">
          <p className="gc-help" style={{ margin: 0 }}>Pick the other conversation of {conv.name}. Its messages move into this one in time order, with the channel shown on each message, and the duplicate disappears from the list.</p>
          <SearchBox value={q} onChange={setQ} placeholder="Search name, phone or handle" />
          {shown.length ? (
            <div role="radiogroup" aria-label="Duplicate conversation" className="ib-opts">
              {shown.map(({ c, same, like }) => (
                <label key={c.id} className={'ib-opt' + (pick === c.id ? ' is-on' : '')}>
                  <input type="radio" name="merge" className="gc-check gc-check--radio" checked={pick === c.id} onChange={() => setPick(c.id)} />
                  <Avatar name={c.name} avatar={c.avatar} pos={c.pos} ch={c.ch} size={32} />
                  <span className="ib-opt__text"><b>{c.name}</b><span className="ib-sub">{channelName(c.ch)}{c.phone ? ' · ' + c.phone : ''} · {ago(lastAny(c)?.at || 0, now)} · {previewOf(lastAny(c))}</span></span>
                  {same ? <span className="gc-badge gc-badge--success">Same phone</span> : like ? <span className="gc-badge gc-badge--info">Similar name</span> : null}
                </label>
              ))}
            </div>
          ) : <EmptyState icon="users" title="No other conversations match" />}
          <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" disabled={!pick} onClick={() => onMerge(pick)}><Icon name="merge" width="18" height="18" aria-hidden="true" />Merge into this conversation</button></div>
        </div>
      ) : null}
    </Dialog>
  );
}

// ---- start a conversation ---------------------------------------------------------------------------
export function NewConversationDialog({ open, onClose, onCreate }) {
  const [f, setF] = useState({ ch: 'whatsapp', name: '', phone: '', text: '' });
  useEffect(() => { if (open) setF({ ch: 'whatsapp', name: '', phone: '', text: 'Assalamu alaikum! This is GridCommerce. ' }); }, [open]);
  const submit = (e) => {
    e.preventDefault();
    const digits = f.phone.replace(/[^0-9]/g, '').replace(/^88/, '');
    if (!/^01[3-9]\d{8}$/.test(digits)) { toast('Enter an 11-digit mobile number, for example 01712345678', { tone: 'error' }); return; }
    if (!f.text.trim()) { toast('Write the first message', { tone: 'error' }); return; }
    onCreate({ ch: f.ch, name: f.name.trim() || digits, phone: digits, text: f.text.trim() });
  };
  return (
    <Dialog open={open} title="New conversation" onClose={onClose} width={520}>
      <form className="ib-form" onSubmit={submit}>
        <div role="radiogroup" aria-label="Channel" className="ib-opts ib-opts--row">
          {['whatsapp', 'telegram'].map((ch) => (
            <label key={ch} className={'ib-opt' + (f.ch === ch ? ' is-on' : '')}>
              <input type="radio" name="nc-ch" className="gc-check gc-check--radio" checked={f.ch === ch} onChange={() => setF({ ...f, ch })} />
              <ChannelIcon channel={ch} size={24} decorative /><span>{channelName(ch)}</span>
            </label>
          ))}
        </div>
        <div className="ib-two">
          <div><label className="gc-label" htmlFor="nc-phone">Mobile number *</label><input id="nc-phone" className="gc-input ib-data" inputMode="tel" data-autofocus value={f.phone} onChange={(e) => setF({ ...f, phone: e.target.value })} placeholder="01712345678" /></div>
          <div><label className="gc-label" htmlFor="nc-name">Name</label><input id="nc-name" className="gc-input" value={f.name} onChange={(e) => setF({ ...f, name: e.target.value })} /></div>
        </div>
        <div><label className="gc-label" htmlFor="nc-text">First message *</label><textarea id="nc-text" className="gc-input" rows="3" value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} /></div>
        <p className="gc-help" style={{ margin: 0 }}>Facebook, Instagram, TikTok and LinkedIn only allow you to reply once the customer has written first.{f.ch === 'whatsapp' ? ' On WhatsApp the first message goes out as the approved “hello” template.' : ''}</p>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid"><Icon name="send" width="18" height="18" aria-hidden="true" />Start conversation</button></div>
      </form>
    </Dialog>
  );
}

// ---- snooze until a chosen time ----------------------------------------------------------------------
const localInput = (t) => { const d = new Date(t - new Date(t).getTimezoneOffset() * 60000); return d.toISOString().slice(0, 16); };
export function SnoozeDialog({ open, onClose, onSnooze }) {
  const [val, setVal] = useState('');
  useEffect(() => { if (open) setVal(localInput(Date.now() + 2 * 3600000)); }, [open]);
  const submit = (e) => {
    e.preventDefault();
    const t = new Date(val).getTime();
    if (!t || t <= Date.now()) { toast('Pick a time in the future', { tone: 'error' }); return; }
    onSnooze(t);
  };
  return (
    <Dialog open={open} title="Snooze until" onClose={onClose} width={420}>
      <form className="ib-form" onSubmit={submit}>
        <div><label className="gc-label" htmlFor="sz-at">Date and time</label><input id="sz-at" type="datetime-local" className="gc-input" data-autofocus value={val} min={localInput(Date.now())} onChange={(e) => setVal(e.target.value)} /></div>
        <p className="gc-help" style={{ margin: 0 }}>The conversation leaves Open and comes back by itself at this time, or sooner if the customer writes.</p>
        <div className="gc-modal__foot" style={{ marginTop: 0 }}><button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Cancel</button><button type="submit" className="gc-btn gc-btn--solid">Snooze</button></div>
      </form>
    </Dialog>
  );
}

// ---- photo viewer ---------------------------------------------------------------------------------------
export function Lightbox({ src, onClose }) {
  return (
    <Dialog open={!!src} title="Photo" onClose={onClose} width={720}>
      {src ? <img src={src} alt="Photo sent in the conversation" className="ib-lightbox" /> : null}
    </Dialog>
  );
}

export const DIALOGS_CSS = `
.ib-form{display:flex;flex-direction:column;gap:var(--space-4)}
.ib-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
@media (max-width:599px){.ib-two{grid-template-columns:minmax(0,1fr)}}
.ib-toolbar{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.ib-fit{width:auto;flex:none}
.ib-opts{display:flex;flex-direction:column;gap:var(--space-2)}
.ib-opts--row{flex-direction:row;flex-wrap:wrap}
.ib-opts--row .ib-opt{flex:1 1 160px}
.ib-opt{display:flex;align-items:center;gap:var(--space-3);min-height:52px;padding:var(--space-2) var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm);color:var(--text-heading);cursor:pointer;transition:var(--transition-colors)}
.ib-opt:hover{border-color:var(--border-strong)}
.ib-opt.is-on{border-color:var(--primary);background:var(--fill-primary-soft)}
.ib-opt__text{flex:1;min-width:0}
.ib-opt__text b{display:block;font-weight:var(--weight-medium);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ib-opt__text .ib-sub{overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ib-replylist,.ib-prodlist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.ib-replylist li{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-3) 0;border-bottom:1px solid var(--border-subtle)}
.ib-replylist li:last-child{border-bottom:0}
.ib-replylist__text{flex:1;min-width:0}
.ib-replylist__title{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);margin:0;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ib-replylist__body{margin:var(--space-1) 0;font-size:var(--text-sm);color:var(--text-body);display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden}
.ib-replylist__acts{display:flex;align-items:center;gap:var(--space-1);flex:none}
.ib-prodlist{margin-top:var(--space-3);max-height:min(420px,55dvh);overflow-y:auto}
.ib-prodlist li{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-2-5) var(--space-1);border-bottom:1px solid var(--border-subtle)}
.ib-prodlist li:last-child{border-bottom:0}
.ib-prodlist__tile{display:grid;place-items:center;flex:none;width:40px;height:40px;border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary)}
.ib-prodlist__text{flex:1;min-width:0}
.ib-prodlist__name{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.ib-prodlist__nums{flex:none;text-align:right}
.ib-price{display:block;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);font-variant-numeric:tabular-nums}
.ib-out{color:var(--text-danger)}
@media (max-width:479px){.ib-prodlist li{flex-wrap:wrap}.ib-prodlist__text{flex-basis:calc(100% - 56px)}.ib-prodlist__nums{margin-left:52px;text-align:left;flex:1}}
.ib-lightbox{display:block;width:100%;height:auto;max-height:70dvh;object-fit:contain;border-radius:var(--radius-xl);background:var(--surface-subtle)}
`;
