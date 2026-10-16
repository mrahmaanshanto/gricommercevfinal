'use client';
// EmailDesignPanel — Communications › Message design › Email design (/message-design?tab=email; moved out of Settings ›
// Notifications in Batch C step 4). The look every email the shop sends shares (logo, colours, font, header, footer,
// social links: lib/email/shopEmails.js › getEmailDesign, filled from Settings › General until changed), which language
// customers get, and every email the shop sends, each with its designed English and Bangla versions: Edit opens
// /email-editor?event=. Test emails sent from the editor are listed with their HTML. The sample is always drawn on
// white (emailKit.previewHtml), whatever mode the computer is in; Light / Dark shows each on purpose.
// Sending stays simulated (the server sends the HTML).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { EmailDesignForm } from '@/components/email/EmailDesignForm';
import { EMAIL_STUDIO_CSS } from '@/components/email/EmailStudio';
import { getEmailDesign, saveEmailDesign, resetEmailDesign, designFromShop, EMAIL_LANGS, getEmailLang, setEmailLang, emailFor, testEmails, EMAIL_EVENT, EVENTS } from '@/lib/email/shopEmails';
import { renderEmail, previewHtml } from '@/lib/email/emailKit';
import { hasModule } from '@/lib/edition';

export const EMAIL_DESIGN_CSS = EMAIL_STUDIO_CSS + `
.ed-card>header{display:flex;align-items:center;justify-content:space-between;gap:var(--space-3);min-height:44px;padding:var(--space-3) var(--space-4) 0}
.ed-card>header h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ed-look{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:var(--space-4);padding:var(--space-3) var(--space-4) var(--space-4)}
.ed-prev{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-subtle);height:520px}
.ed-prev iframe{border:0;width:680px;height:1040px;transform:scale(.5);transform-origin:0 0;background:#fff;color-scheme:light}
.ed-prev.is-dark iframe{background:#0f172a;color-scheme:dark}
.ed-side{display:flex;flex-direction:column;gap:var(--space-2);min-width:0}
.ed-side .gc-seg{align-self:flex-start}
.ed-acts{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:0 var(--space-4) var(--space-4)}
.ed-langs{display:flex;flex-wrap:wrap;gap:var(--space-2);padding:var(--space-3) var(--space-4) var(--space-4)}
.ed-langs label{display:flex;align-items:center;gap:6px;min-height:36px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-sm);cursor:pointer}
.ed-langs label:has(input:checked){border-color:var(--primary);background:var(--primary-50)}
.ed-list{list-style:none;margin:0;padding:0 var(--space-4) var(--space-3)}
.ed-list li{display:flex;align-items:center;gap:var(--space-3);min-height:48px;border-top:1px solid var(--border-subtle)}
.ed-list li>span:first-child{flex:1;min-width:0;display:flex;flex-direction:column}
.ed-list b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ed-list small{font-size:var(--text-xs);color:var(--text-muted)}
.ed-grp{margin:var(--space-3) var(--space-4) 0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
@media (max-width:1023px){.ed-look{grid-template-columns:minmax(0,1fr)}.ed-prev{height:420px}}
`;

const inEdition = (e) => hasModule(e.scope === 'customer' ? e.mod : 'online');

export function EmailDesignPanel() {
  const [d, setD] = useState(null);
  const [saved, setSaved] = useState('');
  const [lang, setLang] = useState('en');
  const [list, setList] = useState([]);
  const [tests, setTests] = useState([]);
  const [open, setOpen] = useState(null);
  const [dark, setDark] = useState(false);
  useEffect(() => {
    const load = () => { setList(EVENTS.filter((e) => inEdition(e) && e.owner !== 'loyalty').map((e) => ({ ...e, custom: emailFor(e.key).custom }))); setTests(testEmails()); };
    const x = getEmailDesign(); setD(x); setSaved(JSON.stringify(x)); setLang(getEmailLang()); load();
    window.addEventListener(EMAIL_EVENT, load);
    return () => window.removeEventListener(EMAIL_EVENT, load);
  }, []);
  const dirty = !!d && JSON.stringify(d) !== saved;
  const sample = useMemo(() => (d ? previewHtml(renderEmail({ design: d, blocks: emailFor('approved').en.blocks, vars: { customer_name: 'Nusrat Jahan', order_id: '#136829', store_name: d.brandName, support_phone: d.phone }, subject: 'Order #136829 confirmed', dark }), dark) : ''), [d, dark]);
  const save = () => { saveEmailDesign(d); setSaved(JSON.stringify(d)); toast('Email design saved. Every email uses it.'); };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Back to your shop details?', body: 'The logo, colours, address and phone come from Settings › General again.', confirmLabel: 'Reset' }))) return;
    resetEmailDesign(); const x = designFromShop(); setD(x); setSaved(JSON.stringify(x)); toast('Email design reset');
  };
  const groups = [...new Set(list.map((e) => e.group))];

  return (<>
    {!d ? <div style={{ minHeight: 300 }} aria-busy="true" /> : (<>
                    <section className="ix-card ed-card" aria-labelledby="ed-look">
                      <header><h2 id="ed-look">Look</h2></header>
                      <div className="ed-look">
                        <EmailDesignForm design={d} onChange={setD} />
                        <div className="ed-side">
                          <div className="gc-seg" role="group" aria-label="Preview">
                            <button type="button" className={'gc-seg__btn' + (!dark ? ' gc-seg__btn--active' : '')} aria-pressed={!dark} onClick={() => setDark(false)}>Light</button>
                            <button type="button" className={'gc-seg__btn' + (dark ? ' gc-seg__btn--active' : '')} aria-pressed={dark} onClick={() => setDark(true)}>Dark</button>
                          </div>
                          <div className={'ed-prev' + (dark ? ' is-dark' : '')} aria-label="Sample email"><iframe title="Sample email" srcDoc={sample} sandbox="" /></div>
                        </div>
                      </div>
                      <div className="ed-acts">
                        <button type="button" className="ix-btn ix-btn--primary" disabled={!dirty} onClick={save}>Save design</button>
                        <button type="button" className="ix-btn" disabled={!dirty} onClick={() => setD(JSON.parse(saved))}>Discard</button>
                        <button type="button" className="ix-btn ix-btn--plain" onClick={reset}>Use my shop details</button>
                      </div>
                    </section>

                    <section className="ix-card ed-card" aria-labelledby="ed-lang">
                      <header><h2 id="ed-lang">Language customers get</h2></header>
                      <div className="ed-langs" role="radiogroup" aria-labelledby="ed-lang">
                        {EMAIL_LANGS.map(([k, l]) => <label key={k}><input type="radio" name="ed-lang" checked={lang === k} onChange={() => { setLang(k); setEmailLang(k); toast('Language saved'); }} />{l}</label>)}
                      </div>
                    </section>

                    <section className="ix-card ed-card" aria-labelledby="ed-all">
                      <header><h2 id="ed-all">Emails</h2><Link className="ix-btn ix-btn--sm" href="/set-notifications">Turn emails on or off</Link></header>
                      {groups.map((g) => (
                        <React.Fragment key={g}>
                          <p className="ed-grp">{g}</p>
                          <ul className="ed-list">
                            {list.filter((e) => e.group === g).map((e) => (
                              <li key={e.key}>
                                <span><b>{e.label}</b><small>{e.when} · English and Bangla{e.custom ? ' · changed by you' : ''}</small></span>
                                {e.custom ? <span className="gc-badge gc-badge--info">Edited</span> : null}
                                <Link className="ix-btn ix-btn--sm" href={'/email-editor?event=' + encodeURIComponent(e.key)}>Edit</Link>
                              </li>
                            ))}
                          </ul>
                        </React.Fragment>
                      ))}
                    </section>

                    <section className="ix-card ed-card" aria-labelledby="ed-tests">
                      <header><h2 id="ed-tests">Test emails</h2></header>
                      {tests.length ? (
                        <ul className="ed-list">
                          {tests.map((t) => <li key={t.id}><span><b>{t.subject}</b><small>{t.lang === 'bn' ? 'Bangla' : 'English'} · to {t.to} · {new Date(t.at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })} · {t.status}</small></span><button type="button" className="ix-btn ix-btn--sm" onClick={() => setOpen(t)}>Open</button></li>)}
                        </ul>
                      ) : <p className="sfb-muted" style={{ padding: '0 var(--space-4) var(--space-4)', margin: 0 }}>None yet. Send one from an email's editor.</p>}
                    </section>
                  </>)}
      <Sheet open={!!open} title={open ? open.subject : ''} onClose={() => setOpen(null)}>
        {open ? <iframe title="Test email" srcDoc={previewHtml(open.html)} sandbox="" style={{ width: '100%', height: 640, border: 0, borderRadius: 'var(--radius-lg)', background: '#fff', colorScheme: 'light' }} /> : null}
      </Sheet>
  </>);
}
