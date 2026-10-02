'use client';
// SetNotifications — Settings › Notifications › Order notifications (/set-notifications).
// For every order event (src/lib/notifications.js › EVENTS): SMS on/off, email on/off, to the customer, to the
// shop; and its template (SMS text, the shop's SMS, email subject and body, sender name, reply-to) with the
// {{variables}}, a live preview and a test send. The sender details apply to every message.
// Saved in this browser (gc.notify.settings); orders send through notify(). Text stays short (Shopify style).

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { SettingsSwitcher } from '@/shell/Shell';
import { Sheet } from '@/components/ui';
import SetChrome from '@/screens/settings-console/SetChrome';
import SetRail from '@/screens/settings-console/SetRail';
import SetTopbar from '@/screens/settings-console/SetTopbar';
import { EVENTS, VARIABLES, getNotifySettings, saveNotifySettings, defaultTemplate, fill, smsParts } from '@/lib/notifications';

const GROUPS = [...new Set(EVENTS.map((e) => e.group))];
const SAMPLE = Object.fromEntries(VARIABLES.map(([k, , ex]) => [k, ex]));

const CSS = `
.sn-card{border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card)}
.sn-card>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.sn-card>header h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.sn-card>header p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.sn-fields{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-4);padding:var(--space-5)}
.sn-head,.sn-row{display:grid;grid-template-columns:minmax(0,1fr) 64px 64px 84px 64px 96px;align-items:center;gap:var(--space-3);padding:0 var(--space-5)}
.sn-head{min-height:40px;background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.sn-head span:not(:first-child){text-align:center}
.sn-row{min-height:60px;border-top:1px solid var(--border-subtle)}
.sn-row:first-of-type{border-top:0}
.sn-ev{display:flex;flex-direction:column;min-width:0}
.sn-ev b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sn-ev small{font-size:var(--text-xs);color:var(--text-muted)}
.sn-cell{display:flex;justify-content:center}
.sn-cell input[type=checkbox]{width:20px;height:20px;accent-color:var(--primary);cursor:pointer}
.sn-row.is-off .sn-ev b{color:var(--text-muted)}
.sn-cap{display:none}
.sn-vars{display:flex;flex-wrap:wrap;gap:6px}
.sn-vars button{height:32px;padding:0 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font:inherit;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.sn-vars button:hover{border-color:var(--primary);color:var(--primary)}
.sn-ed{display:flex;flex-direction:column;gap:var(--space-4)}
.sn-ed h3{margin:0;font-size:var(--text-xs);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--text-muted)}
.sn-count{display:block;margin-top:4px;font-size:var(--text-xs);color:var(--text-muted)}
.sn-prev{padding:var(--space-3);border-radius:var(--radius-lg);background:var(--surface-subtle);font-size:var(--text-sm);line-height:1.5;color:var(--text-body);white-space:pre-wrap;overflow-wrap:anywhere}
.sn-prev b{display:block;margin-bottom:4px;color:var(--text-heading)}
.sn-bar{position:sticky;bottom:0;z-index:5;display:flex;align-items:center;justify-content:flex-end;gap:var(--space-2);padding:var(--space-3) var(--space-5);border-top:1px solid var(--border-subtle);background:var(--surface-header);backdrop-filter:blur(8px)}
.sn-bar span{margin-right:auto;font-size:var(--text-sm);color:var(--text-muted)}
@media (max-width:767px){
  .sn-fields{grid-template-columns:minmax(0,1fr);padding:var(--space-4)}
  .sn-head{display:none}
  .sn-row{grid-template-columns:repeat(4,minmax(0,1fr));row-gap:var(--space-2);padding:var(--space-3) var(--space-4)}
  .sn-ev{grid-column:1 / -1}
  .sn-cell{flex-direction:column;align-items:center;gap:2px}
  .sn-cap{display:block;font-size:var(--text-xs);color:var(--text-muted)}
  .sn-row>.sn-edit{grid-column:1 / -1;justify-self:start}
  .sn-card>header{padding:var(--space-3) var(--space-4)}
}
`;

export default function SetNotifications() {
  const [saved, setSaved] = useState(null);
  const [s, setS] = useState(null);
  const [edit, setEdit] = useState(null);       // event key being edited
  const [draft, setDraft] = useState(null);     // its template while editing
  const [field, setField] = useState('smsText'); // where a variable chip goes
  const refs = { smsText: useRef(null), merchantText: useRef(null), subject: useRef(null), body: useRef(null) };

  useEffect(() => { const x = getNotifySettings(); setSaved(x); setS(x); }, []);
  const dirty = useMemo(() => !!(s && saved && JSON.stringify(s) !== JSON.stringify(saved)), [s, saved]);

  if (!s) return <div className="dc-screen ds" data-screen="SetNotifications" />;

  const setEv = (key, patch) => setS((x) => ({ ...x, events: { ...x.events, [key]: { ...x.events[key], ...patch } } }));
  const setTop = (k) => (e) => setS((x) => ({ ...x, [k]: e.target.value }));
  const save = () => { saveNotifySettings(s); setSaved(s); toast('Notifications saved'); };
  const discard = () => setS(saved);

  const openEdit = (key) => { setEdit(key); setDraft({ ...s.events[key] }); setField('smsText'); };
  const closeEdit = () => { setEdit(null); setDraft(null); };
  const keepEdit = () => { setEv(edit, draft); closeEdit(); };
  const insert = (k) => {
    const el = refs[field] && refs[field].current;
    const tok = `{{${k}}}`;
    const cur = draft[field] || '';
    const at = el && el.selectionStart != null ? el.selectionStart : cur.length;
    const next = cur.slice(0, at) + tok + cur.slice(el && el.selectionEnd != null ? el.selectionEnd : at);
    setDraft({ ...draft, [field]: next });
    setTimeout(() => { if (el) { el.focus(); el.setSelectionRange(at + tok.length, at + tok.length); } }, 0);
  };
  const reset = async () => {
    const ok = await confirmDialog({ title: 'Reset this template?', body: 'Your text is replaced with the default.', confirmLabel: 'Reset' });
    if (ok) setDraft({ ...draft, ...defaultTemplate(edit), sms: draft.sms, email: draft.email, customer: draft.customer, merchant: draft.merchant });
  };
  const ev = edit ? EVENTS.find((x) => x.key === edit) : null;
  const sms = draft ? smsParts(fill(draft.smsText, SAMPLE)) : null;
  const tf = (k) => ({ ref: refs[k], value: draft[k] || '', onFocus: () => setField(k), onChange: (e) => setDraft({ ...draft, [k]: e.target.value }) });

  return (
    <div className="dc-screen ds" data-screen="SetNotifications">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <SettingsSwitcher />
      <div className="set-shell">
        <div className="set-shell__rail"><SetChrome embedded /></div>
        <div className="set-shell__main">
          <div className="set-shell__top"><SetTopbar embedded crumb="Order notifications" /></div>
          <div className="set-shell__body">
            <div className="set-shell__nav"><SetRail embedded active="notifications" /></div>
            <div className="set-shell__col">
              <div className="set-content">
                <main className="set-main">
                  <header>
                    <h1 style={{ margin: '0 0 4px', fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: 'var(--text-heading)' }}>Order notifications</h1>
                    <p style={{ margin: 0, fontSize: 'var(--text-sm)', color: 'var(--text-muted)' }}>SMS and email for each order event.</p>
                  </header>

                  <section className="sn-card" aria-labelledby="sn-sender">
                    <header><div><h2 id="sn-sender">Sender</h2></div></header>
                    <div className="sn-fields">
                      <div><label className="gc-label" htmlFor="sn-name">SMS sender name</label><input id="sn-name" className="gc-input" maxLength={11} value={s.senderName} onChange={setTop('senderName')} /></div>
                      <div><label className="gc-label" htmlFor="sn-from">Email from</label><input id="sn-from" className="gc-input" value={s.emailFrom} onChange={setTop('emailFrom')} /></div>
                      <div><label className="gc-label" htmlFor="sn-reply">Reply-to email</label><input id="sn-reply" className="gc-input" type="email" value={s.replyTo} onChange={setTop('replyTo')} /></div>
                      <div><label className="gc-label" htmlFor="sn-aphone">Shop phone (alerts)</label><input id="sn-aphone" className="gc-input" inputMode="tel" value={s.adminPhone} onChange={setTop('adminPhone')} /></div>
                      <div><label className="gc-label" htmlFor="sn-aemail">Shop email (alerts)</label><input id="sn-aemail" className="gc-input" type="email" value={s.adminEmail} onChange={setTop('adminEmail')} /></div>
                    </div>
                  </section>

                  {GROUPS.map((g) => (
                    <section key={g} className="sn-card" aria-labelledby={'sn-g-' + g}>
                      <header><h2 id={'sn-g-' + g}>{g}</h2></header>
                      <div className="sn-head" aria-hidden="true"><span>Event</span><span>SMS</span><span>Email</span><span>Customer</span><span>Shop</span><span /></div>
                      {EVENTS.filter((e) => e.group === g).map((e) => {
                        const t = s.events[e.key];
                        const off = !(t.sms || t.email) || !(t.customer || t.merchant);
                        return (
                          <div key={e.key} className={'sn-row' + (off ? ' is-off' : '')}>
                            <span className="sn-ev"><b>{e.label}</b><small>{e.when}{e.note ? ' · ' + e.note : ''}</small></span>
                            <span className="sn-cell"><button type="button" role="switch" className="set-sw" aria-checked={!!t.sms} aria-label={`${e.label}: SMS`} onClick={() => setEv(e.key, { sms: !t.sms })}><span aria-hidden="true" /></button><span className="sn-cap" aria-hidden="true">SMS</span></span>
                            <span className="sn-cell"><button type="button" role="switch" className="set-sw" aria-checked={!!t.email} aria-label={`${e.label}: Email`} onClick={() => setEv(e.key, { email: !t.email })}><span aria-hidden="true" /></button><span className="sn-cap" aria-hidden="true">Email</span></span>
                            <span className="sn-cell"><input type="checkbox" checked={!!t.customer} aria-label={`${e.label}: to customer`} onChange={() => setEv(e.key, { customer: !t.customer })} /><span className="sn-cap" aria-hidden="true">Customer</span></span>
                            <span className="sn-cell"><input type="checkbox" checked={!!t.merchant} aria-label={`${e.label}: to shop`} onChange={() => setEv(e.key, { merchant: !t.merchant })} /><span className="sn-cap" aria-hidden="true">Shop</span></span>
                            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral sn-edit" onClick={() => openEdit(e.key)}><Icon name="pencil" width="15" height="15" aria-hidden="true" /> Edit</button>
                          </div>
                        );
                      })}
                    </section>
                  ))}
                </main>
              </div>
              {dirty ? (
                <div className="sn-bar" role="region" aria-label="Unsaved changes">
                  <span>Unsaved changes</span>
                  <button type="button" className="gc-btn gc-btn--neutral" onClick={discard}>Discard</button>
                  <button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save</button>
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>

      <Sheet open={!!edit} title={ev ? ev.label : ''} onClose={closeEdit}
        footer={<><button type="button" className="gc-btn gc-btn--flat" onClick={reset}>Reset</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => toast(`Test sent to ${s.adminPhone}`)}>Send test</button><button type="button" className="gc-btn gc-btn--solid" onClick={keepEdit}>Done</button></>}>
        {draft ? (
          <div className="sn-ed">
            <div>
              <span className="gc-label">Variables</span>
              <div className="sn-vars">{VARIABLES.map(([k, l]) => <button key={k} type="button" title={l} onClick={() => insert(k)}>{`{{${k}}}`}</button>)}</div>
            </div>
            <h3>SMS</h3>
            <div><label className="gc-label" htmlFor="sn-sms">To customer</label><textarea id="sn-sms" className="gc-input" rows={3} {...tf('smsText')} /><span className="sn-count">{sms.chars} characters · {sms.parts} SMS{sms.unicode ? ' (Bangla)' : ''}</span></div>
            <div><label className="gc-label" htmlFor="sn-msms">To shop</label><textarea id="sn-msms" className="gc-input" rows={2} placeholder="Same as customer" {...tf('merchantText')} /></div>
            <div className="sn-prev"><b>Preview · from {s.senderName}</b>{fill(draft.smsText, SAMPLE)}</div>
            <h3>Email</h3>
            <div><label className="gc-label" htmlFor="sn-sub">Subject</label><input id="sn-sub" className="gc-input" {...tf('subject')} /></div>
            <div><label className="gc-label" htmlFor="sn-body">Body</label><textarea id="sn-body" className="gc-input" rows={7} {...tf('body')} /></div>
            <div className="gc-cols-2 gc-cols--keep" style={{ display: 'grid', gridTemplateColumns: 'repeat(2,minmax(0,1fr))', gap: 'var(--space-3)' }}>
              <div><label className="gc-label" htmlFor="sn-sname">Sender name</label><input id="sn-sname" className="gc-input" placeholder={s.emailFrom} value={draft.fromName || ''} onChange={(e) => setDraft({ ...draft, fromName: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="sn-rto">Reply-to</label><input id="sn-rto" className="gc-input" type="email" placeholder={s.replyTo} value={draft.replyTo || ''} onChange={(e) => setDraft({ ...draft, replyTo: e.target.value })} /></div>
            </div>
            <div className="sn-prev"><b>{fill(draft.subject, SAMPLE)}</b>{fill(draft.body, SAMPLE)}</div>
          </div>
        ) : null}
      </Sheet>
    </div>
  );
}
