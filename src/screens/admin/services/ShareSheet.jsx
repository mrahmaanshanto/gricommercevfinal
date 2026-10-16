'use client';
// ShareSheet — offer something to merchants (Batch D): a service, a Grid Shop product or a custom offer's payment link.
// The text starts automatic (a short summary with the price and the link) and can be edited; "Save as this item's
// text" keeps the edit (onSaveText), "Automatic text" goes back. Then:
//   To stores   email or SMS through Communications (lib/admin/comms.js › sendMessage: logged there with cost and status)
//               to one store (`shop`) or to stores picked here (search, or every store that may use it);
//               WhatsApp opens one chat per store with the text filled in.
//   Post it     WhatsApp (status or a group), Facebook, Messenger, LinkedIn, X, Telegram, or copy the text.
// onSent({ ch, to }) is called for each send (custom offers log it on the order). Front end only: social buttons open
// the network's own share page in a new tab; nothing is posted without the person pressing Post there.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { contacts, contactBy, sendMessage } from '@/lib/admin/comms';

const SHARE_CSS = `
.shs{display:flex;flex-direction:column;gap:var(--space-4)}
.shs textarea{min-height:150px;height:auto;padding:var(--space-2) var(--space-3);line-height:1.5}
.shs-row{display:flex;flex-wrap:wrap;gap:var(--space-2);align-items:center}
.shs-row .gc-help{margin:0}
.shs-link{display:flex;gap:var(--space-2);align-items:center}
.shs-link input{font-family:var(--font-data)}
.shs-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:var(--space-2)}
.shs-grid a,.shs-grid button{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 12px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-decoration:none;cursor:pointer}
.shs-grid a:hover,.shs-grid button:hover{border-color:var(--primary)}
.shs-list{max-height:220px;overflow:auto;margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.shs-list li{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 10px;border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.shs-list li:first-child{border-top:0}
.shs-list li small{margin-left:auto;font-size:var(--text-xs);color:var(--text-muted)}
.shs-wa{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none}
.shs-wa li{display:flex;align-items:center;justify-content:space-between;gap:8px;font-size:var(--text-sm)}
.shs-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.shs-sec>b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
`;

const digits = (p) => String(p || '').replace(/\D/g, '').replace(/^0/, '880');
const enc = encodeURIComponent;

/**
 * open, onClose · title (what is shared) · autoText (the automatic text, link included) · savedText (the item's own text,
 * or '') · link (full address) · subject (email) · shop (a store id: send to that store only) · eligible(shopId) (which
 * stores may be picked; others are left out) · onSaveText(text|'') · onSent({ ch, to })
 */
export function ShareSheet({ open, onClose, title, autoText, savedText = '', link, subject, shop, eligible, onSaveText, onSent }) {
  const [text, setText] = useState('');
  const [pick, setPick] = useState([]);
  const [q, setQ] = useState('');
  useEffect(() => { if (open) { setText(savedText || autoText || ''); setPick(shop ? [shop] : []); setQ(''); } }, [open]); // eslint-disable-line react-hooks/exhaustive-deps
  const stores = useMemo(() => (open ? contacts().filter((c) => c.k === 'merchant' && (!eligible || eligible(c.id))) : []), [open, eligible]);
  const one = shop ? contactBy('m', shop) : null;
  const chosen = shop ? (one ? [one] : []) : stores.filter((c) => pick.includes(c.id));
  const found = stores.filter((c) => !q.trim() || (c.org + ' ' + c.name + ' ' + c.id).toLowerCase().includes(q.trim().toLowerCase())).slice(0, 60);
  const edited = text !== (savedText || autoText);
  const body = text.trim();

  const send = (ch) => {
    if (!chosen.length) { toast('Pick at least one store.', { tone: 'error' }); return; }
    const r = sendMessage({ ch, recipients: chosen, body, subject: subject || title, name: (subject || title) + (chosen.length > 1 ? ` · ${chosen.length} stores` : '') });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    chosen.forEach((c) => onSent && onSent({ ch, to: ch === 'sms' ? c.phone : c.email, shopId: c.id }));
    toast(`${ch === 'sms' ? 'SMS' : 'Email'} sent to ${chosen.length === 1 ? chosen[0].org : chosen.length + ' stores'}${r.failed ? ` · ${r.failed} failed (see Communications)` : ''}`);
  };
  const copy = async () => {
    try { await navigator.clipboard.writeText(body); toast('Text copied'); } catch { toast('Copy did not work: select the text and copy it.', { tone: 'error' }); }
    onSent && onSent({ ch: 'copy', to: '' });
  };
  const social = [
    ['whatsapp', 'WhatsApp', 'message-circle', `https://wa.me/?text=${enc(body)}`],
    ['facebook', 'Facebook', 'facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(link || '')}&quote=${enc(body)}`],
    ['messenger', 'Messenger', 'send', `https://www.facebook.com/dialog/send?link=${enc(link || '')}&redirect_uri=${enc(link || '')}`],
    ['linkedin', 'LinkedIn', 'linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(link || '')}`],
    ['x', 'X', 'twitter', `https://twitter.com/intent/tweet?text=${enc(body)}`],
    ['telegram', 'Telegram', 'send-horizontal', `https://t.me/share/url?url=${enc(link || '')}&text=${enc(body)}`],
  ];

  return (
    <Sheet open={open} title={'Share · ' + title} onClose={onClose} footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Done</button>}>
      <style dangerouslySetInnerHTML={{ __html: SHARE_CSS }} />
      {open ? (
        <div className="shs">
          <div>
            <label className="gc-label" htmlFor="shs-text">Message</label>
            <textarea id="shs-text" className="gc-input" value={text} onChange={(e) => setText(e.target.value)} />
            <div className="shs-row" style={{ marginTop: 6 }}>
              <span className="gc-help">{savedText ? 'This item’s own text' : 'Written automatically'}{edited ? ' · edited' : ''} · {body.length} characters</span>
              {edited || savedText ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setText(autoText); if (savedText && onSaveText) { onSaveText(''); toast('Back to the automatic text'); } }}>Automatic text</button> : null}
              {onSaveText && edited ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { onSaveText(text); toast('Saved: sharing uses this text from now on'); }}>Save as this item’s text</button> : null}
            </div>
          </div>
          {link ? (
            <div className="shs-link">
              <input className="gc-input" readOnly value={link} aria-label="Link" onFocus={(e) => e.target.select()} />
              <button type="button" className="ix-btn" onClick={async () => { try { await navigator.clipboard.writeText(link); toast('Link copied'); onSent && onSent({ ch: 'link', to: '' }); } catch { toast('Copy did not work.', { tone: 'error' }); } }}>Copy link</button>
            </div>
          ) : null}

          <div className="shs-sec">
            <b>Send to {shop ? (one ? one.org : 'the store') : 'stores'}</b>
            {shop ? (
              <span className="gc-help" style={{ margin: 0 }}>{one ? `${one.name} · ${one.phone} · ${one.email}` : 'No owner contact on this store.'}</span>
            ) : (<>
              <div className="shs-row">
                <input className="gc-input" style={{ flex: '1 1 200px' }} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search stores" aria-label="Search stores" />
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => setPick(stores.map((c) => c.id))}>All {stores.length}</button>
                {pick.length ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setPick([])}>Clear</button> : null}
              </div>
              <ul className="shs-list" aria-label="Stores">
                {found.map((c) => <li key={c.id}><input type="checkbox" className="gc-check" id={'shs-' + c.id} checked={pick.includes(c.id)} onChange={() => setPick((p) => (p.includes(c.id) ? p.filter((x) => x !== c.id) : [...p, c.id]))} /><label htmlFor={'shs-' + c.id}>{c.org}</label><small>{c.name}</small></li>)}
              </ul>
              <span className="gc-help" style={{ margin: 0 }}>{pick.length} picked{eligible ? ' · only stores that may use it are listed' : ''}</span>
            </>)}
            <div className="shs-row">
              <button type="button" className="ix-btn" disabled={!chosen.length} onClick={() => send('email')}><Icon name="mail" width="16" height="16" aria-hidden="true" />Email{chosen.length > 1 ? ' ' + chosen.length : ''}</button>
              <button type="button" className="ix-btn" disabled={!chosen.length} onClick={() => send('sms')}><Icon name="message-square" width="16" height="16" aria-hidden="true" />SMS{chosen.length > 1 ? ' ' + chosen.length : ''}</button>
            </div>
            {chosen.length && chosen.length <= 12 ? (
              <ul className="shs-wa" aria-label="WhatsApp each store">
                {chosen.map((c) => <li key={c.id}><span>{c.org} · {c.phone}</span><a className="ix-btn ix-btn--sm" href={`https://wa.me/${digits(c.phone)}?text=${enc(body)}`} target="_blank" rel="noopener noreferrer" onClick={() => onSent && onSent({ ch: 'whatsapp', to: c.phone, shopId: c.id })}><Icon name="message-circle" width="14" height="14" aria-hidden="true" />WhatsApp</a></li>)}
              </ul>
            ) : chosen.length ? <span className="gc-help" style={{ margin: 0 }}>WhatsApp opens one chat at a time: pick 12 stores or fewer to see them.</span> : null}
            <span className="gc-help" style={{ margin: 0 }}>Email and SMS go out through Communications, with the cost and delivery status there.</span>
          </div>

          <div className="shs-sec">
            <b>Post or share</b>
            <div className="shs-grid">
              {social.map(([k, l, ic, href]) => <a key={k} href={href} target="_blank" rel="noopener noreferrer" onClick={() => onSent && onSent({ ch: k, to: '' })}><Icon name={ic} width="16" height="16" aria-hidden="true" />{l}</a>)}
              <button type="button" onClick={copy}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy text</button>
            </div>
            <span className="gc-help" style={{ margin: 0 }}>Each opens the network’s own share page; nothing is posted until you press Post there.</span>
          </div>
        </div>
      ) : null}
    </Sheet>
  );
}
