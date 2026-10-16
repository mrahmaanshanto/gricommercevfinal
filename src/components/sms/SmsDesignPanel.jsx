'use client';
// SmsDesignPanel — Communications › Message design › SMS design (/message-design?tab=sms; Batch C step 4). The SMS side
// of every notification in one place: the sender name customers see, and each event's SMS with its length (160 letters
// a part in English, 70 with Bangla), a phone preview filled with sample values, ready-made wordings (Short, Friendly,
// Bangla: lib/smsDesign.js), the shop's own copy, a test to the shop phone and Reset. The texts are the same ones
// Settings › Notifications turns on and off (lib/notifications.js › getNotifySettings), so both pages always agree.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { EVENTS, VARIABLES, CUSTOMER_VARIABLES, getNotifySettings, saveNotifySettings, defaultTemplate, fill, smsParts, NOTIFY_EVENT } from '@/lib/notifications';
import { smsTemplates } from '@/lib/smsDesign';
import { send as sendMessage } from '@/lib/messaging';
import { hasModule } from '@/lib/edition';
import { logChanges } from '@/lib/settingsHistory';

export const SMS_DESIGN_CSS = `
.smd-card>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:44px;padding:var(--space-3) var(--space-4) 0}
.smd-card>header h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.smd-top{display:grid;grid-template-columns:minmax(0,320px) minmax(0,1fr);gap:var(--space-4);align-items:end;padding:var(--space-3) var(--space-4) var(--space-4)}
.smd-grp{margin:var(--space-3) var(--space-4) 0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.smd-list{list-style:none;margin:0;padding:0 var(--space-4) var(--space-3)}
.smd-list li{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding-block:6px;border-top:1px solid var(--border-subtle)}
.smd-list li>span:first-child{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.smd-list b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.smd-list small{font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.smd-n{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.smd-ed{display:flex;flex-direction:column;gap:var(--space-4)}
.smd-chips{display:flex;flex-wrap:wrap;gap:6px}
.smd-chips button{min-height:36px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface);font:inherit;font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.smd-chips button:hover{border-color:var(--primary)}
.smd-vars button{font-family:var(--font-data)}
.smd-count{display:block;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.smd-count.is-many{color:#b45309}
.smd-phone{align-self:center;width:280px;max-width:100%;padding:16px 12px 20px;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:#f1f5f9;color:#0f172a}
.smd-phone__from{display:block;margin-bottom:10px;text-align:center;font-size:var(--text-xs);font-weight:var(--weight-medium);color:#475569}
.smd-bub{max-width:88%;padding:8px 12px;border-radius:var(--radius-xl);border-bottom-left-radius:var(--radius-sm);background:#ffffff;font-size:var(--text-sm);line-height:1.45;white-space:pre-wrap;overflow-wrap:anywhere;box-shadow:0 1px 2px rgba(15,23,42,.08)}
.smd-bub:empty::before{content:"(empty)";color:var(--text-muted)}
@media (max-width:640px){.smd-top{grid-template-columns:minmax(0,1fr)}.smd-n{display:none}}
`;

const SAMPLE = Object.fromEntries([...VARIABLES, ...CUSTOMER_VARIABLES].map(([k, , ex]) => [k, ex]));
const COMMON = ['customer_name', 'store_name', 'support_phone'];
const varsFor = (e) => (e && e.scope === 'customer' ? CUSTOMER_VARIABLES.filter(([k]) => COMMON.includes(k) || (e.vars || []).includes(k)) : VARIABLES);
const inEdition = (e) => hasModule(e.scope === 'customer' ? e.mod : 'online');

export function SmsDesignPanel() {
  const [s, setS] = useState(null);
  const [sender, setSender] = useState('');
  const [edit, setEdit] = useState(null);
  const [draft, setDraft] = useState(null);
  const [field, setField] = useState('smsText');
  const refs = { smsText: useRef(null), merchantText: useRef(null) };
  useEffect(() => {
    const load = () => { const x = getNotifySettings(); setS(x); setSender(x.senderName || ''); };
    load();
    window.addEventListener(NOTIFY_EVENT, load);
    return () => window.removeEventListener(NOTIFY_EVENT, load);
  }, []);
  const list = useMemo(() => (s ? EVENTS.filter((e) => inEdition(e) && e.owner !== 'loyalty') : []), [s]);
  const groups = [...new Set(list.map((e) => e.group))];
  if (!s) return <div className="ix-card" style={{ minHeight: 300 }} aria-busy="true" />;

  const ev = edit ? EVENTS.find((x) => x.key === edit) : null;
  const saveSender = () => {
    const name = sender.trim();
    if (!name) { toast('Add the name customers see.', { tone: 'error' }); return; }
    const cur = getNotifySettings();
    saveNotifySettings({ ...cur, senderName: name }); setS({ ...cur, senderName: name });
    logChanges({ formId: 'notifications', changes: [{ field: 'senderName', label: 'SMS sender name', from: cur.senderName, to: name }] });
    toast('Sender name saved');
  };
  const open = (key) => { setEdit(key); setDraft({ smsText: s.events[key].smsText || '', merchantText: s.events[key].merchantText || '' }); setField('smsText'); };
  const close = () => { setEdit(null); setDraft(null); };
  const keep = () => {
    if (!draft.smsText.trim()) { toast('The SMS needs some words.', { tone: 'error' }); refs.smsText.current?.focus(); return; }
    const cur = getNotifySettings();
    const next = { ...cur, events: { ...cur.events, [edit]: { ...cur.events[edit], smsText: draft.smsText, merchantText: draft.merchantText } } };
    saveNotifySettings(next); setS(next);
    logChanges({ formId: 'notifications', changes: [{ field: 'event:' + edit, label: (ev ? ev.label : edit) + ' · SMS', from: 'Before', to: 'Changed' }] });
    toast(`${ev ? ev.label : 'SMS'} saved`); close();
  };
  const insert = (k) => {
    const el = refs[field] && refs[field].current;
    const tok = `{{${k}}}`;
    const cur = draft[field] || '';
    const at = el && el.selectionStart != null ? el.selectionStart : cur.length;
    setDraft({ ...draft, [field]: cur.slice(0, at) + tok + cur.slice(el && el.selectionEnd != null ? el.selectionEnd : at) });
    setTimeout(() => { if (el) { el.focus(); el.setSelectionRange(at + tok.length, at + tok.length); } }, 0);
  };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Back to the default SMS?', body: 'Your text for this message is replaced with the built-in one.', confirmLabel: 'Reset' }))) return;
    const d = defaultTemplate(edit); setDraft({ smsText: d.smsText || '', merchantText: d.merchantText || '' });
  };
  const test = () => {
    const r = sendMessage({ source: (ev && ev.source) || 'Orders', event: (ev ? ev.label : 'Message') + ' · test', cls: 'Service', channel: 'sms', to: { name: s.senderName, phone: s.adminPhone }, text: fill(draft.smsText, SAMPLE), internal: true });
    const st = r && r.row ? r.row.status : '';
    if (st === 'Delivered' || st === 'Read') toast(`Test SMS sent to ${s.adminPhone}`);
    else toast(`Test not sent: ${(r && r.row && r.row.reason) || 'check the shop phone'}`, { tone: 'error' });
  };
  const changed = (e) => (s.events[e.key].smsText || '') !== (defaultTemplate(e.key).smsText || '');
  const parts = draft ? smsParts(fill(draft.smsText, SAMPLE)) : null;
  const tf = (k) => ({ ref: refs[k], value: draft[k] || '', onFocus: () => setField(k), onChange: (e) => setDraft({ ...draft, [k]: e.target.value }) });

  return (<>
    <section className="ix-card smd-card" aria-labelledby="smd-who">
      <header><h2 id="smd-who">Sender</h2><Link className="ix-btn ix-btn--sm" href="/set-notifications">Turn messages on or off</Link></header>
      <div className="smd-top">
        <div><label className="gc-label" htmlFor="smd-name">Name customers see (up to 11 letters)</label><input id="smd-name" className="gc-input" maxLength={11} value={sender} onChange={(e) => setSender(e.target.value.replace(/[^A-Za-z0-9 .-]/g, ''))} /></div>
        <div><button type="button" className="ix-btn ix-btn--primary" disabled={sender.trim() === (s.senderName || '')} onClick={saveSender}>Save sender name</button></div>
      </div>
    </section>
    <section className="ix-card smd-card" aria-labelledby="smd-all">
      <header><h2 id="smd-all">SMS templates</h2></header>
      {groups.map((g) => (
        <React.Fragment key={g}>
          <p className="smd-grp">{g}</p>
          <ul className="smd-list">
            {list.filter((e) => e.group === g).map((e) => {
              const t = s.events[e.key];
              const p = smsParts(fill(t.smsText, SAMPLE));
              return (
                <li key={e.key}>
                  <span><b>{e.label}</b><small>{fill(t.smsText, SAMPLE) || '—'}</small></span>
                  {changed(e) ? <span className="gc-badge gc-badge--info">Edited</span> : null}
                  {!t.sms ? <span className="gc-badge gc-badge--neutral">SMS off</span> : null}
                  <span className="smd-n">{p.parts} SMS{p.unicode ? ' · Bangla' : ''}</span>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => open(e.key)}>Edit</button>
                </li>
              );
            })}
          </ul>
        </React.Fragment>
      ))}
    </section>

    <Sheet open={!!edit} title={ev ? ev.label + ' · SMS' : ''} onClose={close}
      footer={<><button type="button" className="gc-btn gc-btn--flat" onClick={reset}>Reset</button><button type="button" className="gc-btn gc-btn--neutral" onClick={test}>Send test</button><button type="button" className="gc-btn gc-btn--solid" onClick={keep}>Save</button></>}>
      {draft ? (
        <div className="smd-ed">
          <div><span className="gc-label">Start from</span><div className="smd-chips">{smsTemplates(edit).map((t) => <button key={t.id} type="button" onClick={() => setDraft({ ...draft, smsText: t.text })}>{t.label}</button>)}</div></div>
          <div><span className="gc-label">Variables</span><div className="smd-chips smd-vars">{varsFor(ev).map(([k, l]) => <button key={k} type="button" title={l} onClick={() => insert(k)}>{`{{${k}}}`}</button>)}</div></div>
          <div>
            <label className="gc-label" htmlFor="smd-sms">To the customer</label>
            <textarea id="smd-sms" className="gc-input" rows={4} {...tf('smsText')} />
            <span className={'smd-count' + (parts.parts > 2 ? ' is-many' : '')}>{parts.chars} letters · {parts.parts} SMS{parts.unicode ? ' (Bangla: 70 letters a part)' : ''}</span>
          </div>
          <div className="smd-phone" aria-label="Phone preview">
            <span className="smd-phone__from">{s.senderName}</span>
            <div className="smd-bub">{fill(draft.smsText, SAMPLE)}</div>
          </div>
          <div><label className="gc-label" htmlFor="smd-shop">To the shop (optional)</label><textarea id="smd-shop" className="gc-input" rows={2} placeholder="Same as the customer's" {...tf('merchantText')} /></div>
        </div>
      ) : null}
    </Sheet>
  </>);
}
