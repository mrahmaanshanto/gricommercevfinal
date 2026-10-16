'use client';
// Communications › Templates › an email template › Design (/admin/templates/design?id=; Batch B step 1): the designed
// email in English and Bangla, built from parts, with the same editor the shops use (components/email/EmailStudio).
// Save keeps it as a new version of the template (lib/admin/comms.js › saveTemplateDesign); "Make it from the text"
// drops the hand design so the email follows the template's text again.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge, EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { EmailStudio, EMAIL_STUDIO_CSS } from '@/components/email/EmailStudio';
import { templateBy, saveTemplateDesign, VARIABLES, validEmail } from '@/lib/admin/comms';
import { designOf, designedOf, PLATFORM_SAMPLE } from '@/lib/admin/emailDesign';
import { emailProblem } from '@/lib/email/emailKit';
import { AdminShell } from '../AdminShell';
import { useComms, COMMS_CSS, Skel } from './commsShared';

const CSS = EMAIL_STUDIO_CSS + `.tdz{display:flex;flex-direction:column;gap:var(--space-3);min-height:calc(100dvh - 180px)}`;

export default function TemplateDesign() {
  const router = useRouter();
  const { data, live } = useComms();
  const [id, setId] = useState(null);
  const [value, setValue] = useState(null);
  const [base, setBase] = useState('');
  useEffect(() => { setId(new URLSearchParams(window.location.search).get('id') || ''); }, []);
  const tpl = live && id ? templateBy(data, id) : null;
  useEffect(() => { if (tpl && !value) { const v = designedOf(tpl); setValue(v); setBase(JSON.stringify(v)); } }, [tpl, value]);
  const dirty = !!value && JSON.stringify(value) !== base;
  const design = useMemo(() => (live ? designOf(data) : null), [live, data]);
  const save = () => {
    const p = emailProblem(value.en) || emailProblem(value.bn);
    if (p) { toast(p + ' (check both languages)', { tone: 'error' }); return; }
    const r = saveTemplateDesign(tpl.id, { en: { preheader: value.en.preheader, blocks: value.en.blocks }, bn: { preheader: value.bn.preheader, blocks: value.bn.blocks } }, { en: value.en.subject, bn: value.bn.subject });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    setBase(JSON.stringify(value)); toast(`Saved as version ${r.version}`);
  };
  const fromText = async () => {
    if (!(await confirmDialog({ title: 'Make it from the text again?', body: 'Your designed parts are dropped; the email follows the template text.', confirmLabel: 'Use the text' }))) return;
    saveTemplateDesign(tpl.id, null); const v = designedOf({ ...tpl, design: null }); setValue(v); setBase(JSON.stringify(v)); toast('The email follows the text again');
  };
  const test = () => { const to = 'mahin@gridcommerce.com.bd'; if (validEmail(to)) toast(`Test email sent to ${to}${dirty ? ' (unsaved design)' : ''}`); };

  let page;
  if (!live || id === null) page = <Skel label="Loading the email" />;
  else if (!tpl || tpl.ch !== 'email') page = <section className="ix-card"><div className="ix-empty"><EmptyState icon="file-x" title="This email template doesn’t exist." actionLabel="Email templates" onAction={() => router.push('/admin/templates?ch=email')} /></div></section>;
  else page = (
    <div className="tdz">
      <RecordHeader back={'/admin/templates/edit?id=' + encodeURIComponent(tpl.id)} backLabel={tpl.name} title={'Design · ' + tpl.name}
        badges={dirty ? <StatusBadge tone="warning">Not saved</StatusBadge> : tpl.design ? <StatusBadge tone="info">Designed by hand</StatusBadge> : <StatusBadge tone="neutral">Made from the text</StatusBadge>}
        meta={`Version ${tpl.version} · uses Communications › Email design`}
        secondary={[{ label: 'Send test', onClick: test }]}
        more={[{ label: 'Make it from the text', onClick: fromText, disabled: !tpl.design }, { label: 'Message design', href: '/admin/message-design?tab=email' }]}
        primary={{ label: 'Save', onClick: save, disabled: !dirty }} />
      {value && design ? <EmailStudio value={value} onChange={setValue} design={design} vars={VARIABLES} sample={PLATFORM_SAMPLE} data={{ lines: [], products: [] }} kind={tpl.purpose === 'promo' ? 'offer' : 'service'} /> : null}
    </div>
  );
  return (
    <AdminShell active="templates" title={tpl ? 'Design · ' + tpl.name : 'Email design'}>
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + CSS }} />
      <div className="ix-page">{page}</div>
    </AdminShell>
  );
}
