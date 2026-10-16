'use client';
// Communications › Message design (/admin/message-design?tab=email|sms; Batch D step 1) — how every message GridCommerce
// sends to shops and leads looks, in one place, like the shops' own Message design:
//   Email design  the shared look (logo, colours, font, header, footer) and every email with its designed English and
//                 Bangla versions (EmailDesign.jsx › EmailDesignBody; the old /admin/email-design forwards here)
//   SMS design    the sender the SMS go out from (the main SMS provider), and every SMS template with its length, a phone
//                 preview in English or Bangla, and a quick edit (the full editor stays at /admin/templates/edit)
// Data: lib/admin/comms.js (templates, providers, saveTemplate).

import React, { useMemo, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge } from '@/components/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { saveTemplate, purposeLabel, primaryProvider, smsParts, fill, varsFor, PURPOSES } from '@/lib/admin/comms';
import { AdminShell } from '../AdminShell';
import { useComms, useQueryState, COMMS_CSS, Skel, Card, Preview, VarChips, SmsCount } from './commsShared';
import { EmailDesignBody, EMAIL_DESIGN_ADMIN_CSS } from './EmailDesign';

const TABS = [['email', 'Email design'], ['sms', 'SMS design']];
const CSS = `
.amd-tabs{margin-bottom:var(--space-3)}
.amd-who{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-4);font-size:var(--text-sm)}
.amd-who b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.amd-grp{margin:var(--space-3) 0 0;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-muted)}
.amd-list{list-style:none;margin:0;padding:0}
.amd-list li{display:flex;align-items:center;gap:var(--space-3);min-height:56px;padding-block:6px;border-top:1px solid var(--border-subtle)}
.amd-list li>span:first-child{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.amd-list b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.amd-list small{font-size:var(--text-xs);color:var(--text-muted);overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.amd-n{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap}
.amd-ed{display:flex;flex-direction:column;gap:var(--space-4)}
.amd-ed textarea{min-height:96px;height:auto;padding:var(--space-2) var(--space-3)}
@media (max-width:640px){.amd-n{display:none}}
`;

function SmsDesign({ data, t }) {
  const sender = primaryProvider(data, 'sms');
  const sms = data.templates.filter((x) => x.ch === 'sms');
  const vars = useMemo(() => varsFor(null, t), [t]);
  const [open, setOpen] = useState(null);     // the template being looked at
  const [lang, setLang] = useState('en');
  const [draft, setDraft] = useState(null);
  const pick = (x) => { setOpen(x); setLang('en'); setDraft({ en: x.en.body || '', bn: (x.bn && x.bn.body) || '' }); };
  const save = () => {
    const r = saveTemplate(open.id, { name: open.name, en: { ...open.en, body: draft.en }, bn: { ...(open.bn || {}), body: draft.bn }, note: 'Edited in SMS design' });
    if (r && r.ok === false) { toast(r.error || 'Not saved', { tone: 'error' }); return; }
    toast(`${open.name} saved`); setOpen(null);
  };
  const groups = PURPOSES.map(([k]) => k).filter((k) => sms.some((x) => x.purpose === k));
  return (<>
    <Card title="Sender" action={<Link className="ix-btn ix-btn--sm" href="/admin/sms?tab=provider">SMS providers</Link>}>
      <div className="amd-who">
        {sender ? <span>Shops and leads see <b>{sender.sender}</b></span> : <span>No SMS provider is on.</span>}
        {sender ? <span className="ix-muted">{sender.name} · {sender.kind}</span> : null}
      </div>
    </Card>
    <Card title={`SMS templates · ${sms.length}`} action={<Link className="ix-btn ix-btn--sm" href="/admin/templates?ch=sms">All templates</Link>}>
      {groups.map((g) => (
        <React.Fragment key={g}>
          <p className="amd-grp">{purposeLabel(g)}</p>
          <ul className="amd-list">
            {sms.filter((x) => x.purpose === g).map((x) => {
              const p = smsParts(fill(x.en.body, vars));
              return (
                <li key={x.id}>
                  <span><b>{x.name}</b><small>{fill(x.en.body, vars) || '—'}</small></span>
                  <StatusBadge tone={x.status === 'Active' ? 'success' : 'neutral'}>{x.status}</StatusBadge>
                  <span className="amd-n">{p.parts} SMS{x.bn && x.bn.body ? ' · EN + BN' : ''}</span>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => pick(x)}>Edit</button>
                </li>
              );
            })}
          </ul>
        </React.Fragment>
      ))}
    </Card>
    <Sheet open={!!open} title={open ? open.name : ''} onClose={() => setOpen(null)}
      footer={open ? <><Link className="gc-btn gc-btn--flat" href={'/admin/templates/edit?id=' + encodeURIComponent(open.id)}>Full editor</Link><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setOpen(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={save}>Save</button></> : null}>
      {open && draft ? (
        <div className="amd-ed">
          <div className="gc-seg" role="group" aria-label="Language">
            {[['en', 'English'], ['bn', 'Bangla']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (lang === k ? ' gc-seg__btn--active' : '')} aria-pressed={lang === k} onClick={() => setLang(k)}>{l}</button>)}
          </div>
          <VarChips onPick={(k) => setDraft({ ...draft, [lang]: (draft[lang] || '') + `{{${k}}}` })} />
          <div><label className="gc-label" htmlFor="amd-body">{lang === 'bn' ? 'Bangla text' : 'English text'}</label><textarea id="amd-body" className="gc-input" lang={lang} value={draft[lang]} onChange={(e) => setDraft({ ...draft, [lang]: e.target.value })} /><SmsCount text={fill(draft[lang], vars)} /></div>
          <Preview ch="sms" body={draft[lang]} vars={vars} lang={lang} from={sender ? sender.sender : 'GridCommerce'} />
        </div>
      ) : null}
    </Sheet>
  </>);
}

export default function MessageDesign() {
  const { data, t, live } = useComms();
  const [tab, setTab] = useQueryState('tab', TABS.map(([k]) => k), 'email');
  return (
    <AdminShell active="email-design" title="Message design">
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + EMAIL_DESIGN_ADMIN_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="palette" title="Message design"
          about="How every email and SMS GridCommerce sends to shops and leads looks. Email design: logo, colours, font, header and footer for every email, and each email in English and Bangla. SMS design: the sender and every SMS with a phone preview. Sending and history stay in Communications › Email and SMS."
          more={[{ label: 'Templates', href: '/admin/templates' }, { label: 'Email', href: '/admin/comms/email' }, { label: 'SMS', href: '/admin/sms' }]} />
        <div className="amd-tabs"><IndexTabs tabs={TABS.map(([k, l]) => ({ key: k, id: 'amd-tab-' + k, label: l, on: tab === k, onClick: () => setTab(k) }))} label="Message design" /></div>
        {tab === 'email' ? <EmailDesignBody /> : !live ? <Skel label="Loading the SMS templates" /> : <SmsDesign data={data} t={t} />}
      </div>
    </AdminShell>
  );
}
