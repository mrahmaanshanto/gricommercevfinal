'use client';
// Communications › Templates › one template (/admin/templates/edit?id=) — the editor, copied from the merchant panel's
// Order notifications template sheet: the name, purpose and status; English and Bangla as tabs, each with the subject
// (email) and the text, {{variable}} chips that go in at the cursor, the character and SMS-part count; on the side a live
// preview (a phone bubble for SMS, an email card) for a sample or a real merchant or lead, a test send, where it is used
// and its versions. Save makes a new version. Data: lib/admin/comms.js (saveTemplate, duplicateTemplate, templateUse).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, IndexTabs, KV } from '@/components/ui/IndexKit';
import { templateBy, saveTemplate, duplicateTemplate, templateUse, PURPOSES, purposeLabel, VARIABLES, CH_LABEL, contacts, varsFor, varsIn, validPhone, validEmail, fill } from '@/lib/admin/comms';
import { AdminShell } from '../AdminShell';
import { useComms, COMMS_CSS, Skel, Card, Preview, VarChips, SmsCount, insertAt, whenText } from './commsShared';

const CSS = `
.te-langs{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);padding:0 var(--space-4);border-bottom:1px solid var(--border-subtle)}
.te-body{display:flex;flex-direction:column;gap:var(--space-4);padding:var(--space-4)}
.te-warn{display:flex;align-items:center;gap:6px;margin:0;font-size:var(--text-xs);color:var(--text-warning)}
.te-test{display:flex;gap:var(--space-2)}
.te-test .gc-input{flex:1;min-width:0}
.te-ver{display:flex;flex-direction:column;gap:2px;padding:8px 0;border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-muted)}
.te-ver:first-child{border-top:0}
.te-ver b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.te-bn textarea,.te-bn input{font-family:var(--font-bn)}
`;

const shape = (x) => ({ name: x.name, purpose: x.purpose, status: x.status, en: { subject: '', ...x.en }, bn: { subject: '', body: '', ...(x.bn || {}) } });

export default function TemplateEditor() {
  const router = useRouter();
  const { data, t, live } = useComms();
  const [id, setId] = useState(null);
  useEffect(() => { setId(new URLSearchParams(window.location.search).get('id') || ''); }, []);
  const tpl = live && id ? templateBy(data, id) : null;
  let page;
  if (!live || id === null) page = <Skel label="Loading the template" />;
  else if (!tpl) page = <section className="ix-card"><div className="ix-empty"><EmptyState icon="file-x" title="This template doesn’t exist." actionLabel="All templates" onAction={() => router.push('/admin/templates')} /></div></section>;
  else page = <Editor key={tpl.id} tpl={tpl} data={data} t={t} />;
  return (
    <AdminShell active="templates" title={tpl ? tpl.name : 'Template'}>
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + CSS }} />
      <div className="ix-page">{page}</div>
    </AdminShell>
  );
}

function Editor({ tpl, data, t }) {
  const router = useRouter();
  const [draft, setDraft] = useState(() => shape(tpl));
  const [lang, setLang] = useState('en');
  const [field, setField] = useState('body');
  const [who, setWho] = useState('sample');
  const [testTo, setTestTo] = useState('');
  const [err, setErr] = useState('');
  const bodyRef = useRef(null);
  const subjRef = useRef(null);

  const dirty = JSON.stringify(draft) !== JSON.stringify(shape(tpl));
  useEffect(() => {
    if (!dirty) return undefined;
    const warn = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  const back = async () => {
    if (dirty && !(await confirmDialog({ title: 'Leave without saving?', body: 'Your changes to this template are lost.', confirmLabel: 'Leave', tone: 'danger' }))) return;
    router.push('/admin/templates?ch=' + tpl.ch);
  };

  const ch = tpl.ch;
  const side = draft[lang];
  const setSide = (patch) => { setDraft((d) => ({ ...d, [lang]: { ...d[lang], ...patch } })); setErr(''); };
  const all = contacts();
  const sampleList = [...all.filter((c) => c.k === 'merchant').slice(0, 8), ...all.filter((c) => c.k === 'lead').slice(0, 4)];
  const contact = who === 'sample' ? null : all.find((c) => c.k + c.id === who);
  const vars = varsFor(contact, t);
  const used = varsIn((side.subject || '') + ' ' + side.body);
  const known = VARIABLES.map((v) => v[0]);
  const unknown = used.filter((v) => !known.includes(v));
  const use = templateUse(data, tpl.id);
  const insert = (k) => {
    if (field === 'subject' && ch === 'email') setSide({ subject: insertAt(subjRef.current, side.subject || '', k) });
    else setSide({ body: insertAt(bodyRef.current, side.body || '', k) });
  };
  const save = () => {
    const r = saveTemplate(tpl.id, { ...draft, note: 'Edited' });
    if (!r.ok) { setErr(r.error); toast(r.error, { tone: 'error' }); return; }
    toast(`Saved as version ${r.version}`);
  };
  const dup = () => { const r = duplicateTemplate(tpl.id); if (r.ok) { toast('Copy made'); router.push('/admin/templates/edit?id=' + encodeURIComponent(r.id)); } };
  const testSend = () => {
    const ok = ch === 'sms' ? validPhone(testTo) : validEmail(testTo);
    if (!ok) { toast(ch === 'sms' ? 'Type a Bangladesh mobile number (01XXXXXXXXX).' : 'Type an email address.', { tone: 'error' }); return; }
    toast(`Test ${ch === 'sms' ? 'SMS' : 'email'} sent to ${testTo} in ${lang === 'bn' ? 'Bangla' : 'English'}${dirty ? ' (unsaved text)' : ''}`);
  };
  const bnMissing = !draft.bn.body.trim();
  return (
    <>
      <RecordHeader onBack={back} backLabel="Templates" title={draft.name || 'Untitled'}
        badges={<><StatusBadge tone="neutral">{CH_LABEL[ch]}</StatusBadge><StatusBadge tone={draft.status === 'Active' ? 'success' : 'neutral'}>{draft.status}</StatusBadge></>}
        meta={`${purposeLabel(draft.purpose)} · version ${tpl.version} · ${tpl.by}, ${whenText(tpl.updatedAt, t)}`}
        about="Write the template in English and Bangla. {{Variables}} are filled in for each recipient; the preview shows it for a sample or a real merchant or lead. Saving keeps the old version."
        secondary={[{ label: 'Duplicate', icon: 'copy', onClick: dup }]}
        more={[{ label: draft.status === 'Active' ? 'Set as draft' : 'Make active', onClick: () => setDraft({ ...draft, status: draft.status === 'Active' ? 'Draft' : 'Active' }) }]}
        primary={{ label: dirty ? 'Save' : 'Saved', icon: dirty ? undefined : 'check', onClick: save, disabled: !dirty }} />
      <div className="ix-record">
        <div className="ix-main">
          <Card title="Template">
            <div className="cm-form">
              <div className="cm-two">
                <div className="cm-field"><label className="gc-label" htmlFor="te-name">Name</label><input id="te-name" className="gc-input" value={draft.name} onChange={(e) => { setDraft({ ...draft, name: e.target.value }); setErr(''); }} /></div>
                <div className="cm-field"><label className="gc-label" htmlFor="te-purpose">Purpose</label>
                  <select id="te-purpose" className="gc-input gc-select" value={draft.purpose} onChange={(e) => setDraft({ ...draft, purpose: e.target.value })}>{PURPOSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
              </div>
            </div>
          </Card>
          <section className="ix-card" aria-label="Message">
            <div className="ix-card__head"><h2>{ch === 'sms' ? 'Message' : 'Email'}</h2></div>
            <div className="te-langs">
              <IndexTabs label="Language" tabs={[['en', 'English'], ['bn', 'বাংলা']].map(([k, l]) => ({ key: k, id: 'te-' + k, label: l + (k === 'bn' && bnMissing ? ' · missing' : ''), on: lang === k, onClick: () => setLang(k) }))} />
            </div>
            <div className={'te-body' + (lang === 'bn' ? ' te-bn' : '')} role="tabpanel" aria-labelledby={'te-' + lang}>
              {ch === 'email' ? (
                <div className="cm-field"><label className="gc-label" htmlFor="te-subj">Subject</label>
                  <input id="te-subj" ref={subjRef} className="gc-input" value={side.subject || ''} onFocus={() => setField('subject')} onChange={(e) => setSide({ subject: e.target.value })} /></div>
              ) : null}
              <div className="cm-field">
                <label className="gc-label" htmlFor="te-body">{ch === 'sms' ? 'Text' : 'Body'}{lang === 'bn' ? <InfoTip text="When the Bangla version is empty, recipients who chose Bangla get the English one." /> : null}</label>
                <textarea id="te-body" ref={bodyRef} className="gc-input" rows={ch === 'sms' ? 4 : 10} value={side.body || ''} placeholder={lang === 'bn' ? 'বাংলায় লিখুন…' : 'Write the message…'} onFocus={() => setField('body')} onChange={(e) => setSide({ body: e.target.value })} />
                {ch === 'sms' ? <SmsCount text={fill(side.body, vars)} /> : null}
              </div>
              <div className="cm-field"><span className="gc-label">Variables · tap to insert in the {field === 'subject' && ch === 'email' ? 'subject' : ch === 'sms' ? 'text' : 'body'}</span><VarChips onPick={insert} used={used} /></div>
              {unknown.length ? <p className="te-warn" role="status"><Icon name="triangle-alert" width="14" height="14" aria-hidden="true" />Not a known variable, sent as typed: {unknown.map((v) => `{{${v}}}`).join(', ')}</p> : null}
              {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
            </div>
          </section>
          <Card title="Versions">
            <div>
              {(tpl.history || []).map((h) => <div key={h.v} className="te-ver"><b>Version {h.v}{h.v === tpl.version ? ' · live' : ''}</b><span>{h.note} · {h.by} · {whenText(h.at, t)}</span></div>)}
            </div>
          </Card>
        </div>
        <div className="ix-side">
          <Card title="Preview">
            <div className="cm-form">
              <div className="cm-field"><label className="gc-label" htmlFor="te-who">Show it for</label>
                <select id="te-who" className="gc-input gc-select" value={who} onChange={(e) => setWho(e.target.value)}>
                  <option value="sample">Sample values</option>
                  {sampleList.map((c) => <option key={c.k + c.id} value={c.k + c.id}>{c.org} · {c.k === 'merchant' ? 'merchant' : 'lead'}</option>)}
                </select></div>
              <Preview ch={ch} subject={side.subject} body={side.body} vars={vars} lang={lang} to={contact ? (ch === 'sms' ? contact.phone : contact.email) : undefined} />
            </div>
          </Card>
          <Card title="Send a test">
            <div className="cm-form">
              <div className="te-test">
                <label className="sr-only" htmlFor="te-to">{ch === 'sms' ? 'Number' : 'Email address'}</label>
                <input id="te-to" className="gc-input cm-addr" inputMode={ch === 'sms' ? 'tel' : 'email'} placeholder={ch === 'sms' ? '01XXX-XXXXXX' : 'you@gridcommerce.com.bd'} value={testTo} onChange={(e) => setTestTo(e.target.value)} />
                <button type="button" className="ix-btn" onClick={testSend}>Send test</button>
              </div>
              <p className="gc-help" style={{ margin: 0 }}>Goes out with the values in the preview. Not counted in the history.</p>
            </div>
          </Card>
          <Card title="Used by">
            {use.automations.length || use.campaigns.length ? (
              <KV rows={[
                ...use.automations.map((a, i) => [use.automations.length > 1 ? `Automation ${i + 1}` : 'Automation', <Link key={a.id} href={'/admin/automations/edit?id=' + a.id}>{a.name}</Link>]),
                ...use.campaigns.map((c, i) => [use.campaigns.length > 1 ? `Campaign ${i + 1}` : 'Campaign', <span key={c.id}>{c.name}</span>]),
              ]} />
            ) : <p className="cm-empty">No automation or campaign uses it yet.</p>}
          </Card>
        </div>
      </div>
    </>
  );
}
