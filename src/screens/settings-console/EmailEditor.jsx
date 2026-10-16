'use client';
// EmailEditor — one designed email of the shop (/email-editor?event=<key>; Batch B step 1): English and Bangla
// versions built from parts, live preview on a computer or a phone, light or dark (components/email/EmailStudio).
// Save keeps the shop's version (lib/email/shopEmails.js › saveEmail); Reset goes back to the default; Send test logs
// the email to the shop's address with its HTML (Email design › Test emails). Fills the window like Customize.

import React, { useEffect, useMemo, useState } from 'react';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge, EmptyState } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmailStudio, EMAIL_STUDIO_CSS } from '@/components/email/EmailStudio';
import { emailFor, saveEmail, resetEmail, getEmailDesign, emailVarsFor, sampleVars, sendTestEmail } from '@/lib/email/shopEmails';
import { eventBy, eventClass, getNotifySettings } from '@/lib/notifications';
import { emailProblem, SAMPLE_DATA } from '@/lib/email/emailKit';

const CSS = EMAIL_STUDIO_CSS + `
body:has(.eme) .gc-ai{display:none}
.eme .gc-shell__main.eme-main{height:calc(100dvh - var(--shell-inset) * 2);min-height:640px}
.eme .gc-shell__content.eme-content{flex:1;min-height:0;display:flex;flex-direction:column;padding:var(--space-3) var(--space-4)!important}
.eme-page{flex:1;min-height:0;max-width:none;gap:var(--space-3);display:flex;flex-direction:column}
@media (max-width:1023px){.eme .gc-shell__main.eme-main{height:auto}}
`;

export default function EmailEditor() {
  const [key, setKey] = useState('');
  const [value, setValue] = useState(null);
  const [saved, setSaved] = useState('');
  const [custom, setCustom] = useState(false);
  const [missing, setMissing] = useState(false);
  useEffect(() => {
    const k = new URLSearchParams(window.location.search).get('event') || '';
    if (!eventBy(k)) { setMissing(true); return; }
    const e = emailFor(k);
    const v = { en: e.en, bn: e.bn };
    setKey(k); setValue(v); setSaved(JSON.stringify(v)); setCustom(e.custom);
  }, []);
  const dirty = !!value && JSON.stringify(value) !== saved;
  useEffect(() => {
    const on = (e) => { if (dirty) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', on);
    return () => window.removeEventListener('beforeunload', on);
  }, [dirty]);
  const ev = key ? eventBy(key) : null;
  const design = useMemo(() => (key ? getEmailDesign() : null), [key]);
  const vars = useMemo(() => (key ? emailVarsFor(key) : []), [key]);
  const sample = useMemo(() => (key ? sampleVars(key) : {}), [key]);

  const save = () => {
    const p = emailProblem(value.en) || emailProblem(value.bn);
    if (p) { toast(p + ' (check both languages)', { tone: 'error' }); return; }
    saveEmail(key, value); setSaved(JSON.stringify(value)); setCustom(true); toast(`${ev.label} email saved`);
  };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Back to the default email?', body: 'Your English and Bangla versions are replaced with the default.', confirmLabel: 'Reset' }))) return;
    resetEmail(key); const e = emailFor(key); const v = { en: e.en, bn: e.bn }; setValue(v); setSaved(JSON.stringify(v)); setCustom(false); toast('Back to the default');
  };
  const test = (lang) => {
    const to = getNotifySettings().adminEmail || 'orders@dazzleshop.com.bd';
    const t = sendTestEmail(key, lang, to, value[lang]);
    toast(`${lang === 'bn' ? 'Bangla' : 'English'} test sent to ${to}. It's in Message design › Test emails.`, { tone: t.status === 'Delivered' ? undefined : 'error' });
  };

  if (missing) return <div className="dc-screen ds" data-screen="EmailEditor"><div style={{ padding: 40 }}><EmptyState icon="mail" title="This email doesn't exist" actionLabel="All emails" onAction={() => { window.location.href = '/message-design?tab=email'; }} /></div></div>;
  return (
    <div className="dc-screen ds eme" data-screen="EmailEditor">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="msg-design" />
        <main className="gc-shell__main eme-main">
          <Topbar crumb="Communications" page="Email" />
          <div className="gc-shell__content eme-content">
            <div className="ix-page eme-page">
              <RecordHeader back="/message-design?tab=email" backLabel="Message design" title={ev ? ev.label + ' email' : 'Email'}
                badges={!value ? null : dirty ? <StatusBadge tone="warning">Not saved</StatusBadge> : custom ? <StatusBadge tone="info">Your version</StatusBadge> : <StatusBadge tone="neutral">Default</StatusBadge>}
                meta={ev ? `${ev.when} · ${eventClass(key) === 'Marketing' ? 'Offer (unsubscribe link added)' : 'Sent to ' + (ev.customer ? 'the customer' : 'the shop')}` : null}
                about="Build the email from parts in English and Bangla. The preview shows it with sample values on a computer or a phone, light or dark. Save keeps your version; Send test sends it to your shop email."
                secondary={[{ label: 'Send test', onClick: () => test('en'), disabled: !value }]}
                more={[{ label: 'Send the Bangla test', onClick: () => test('bn') }, { label: 'Back to the default', onClick: reset, disabled: !custom }, { label: 'SMS design', href: '/message-design?tab=sms' }, { label: 'Turn messages on or off', href: '/set-notifications' }]}
                primary={{ label: 'Save', icon: 'check', onClick: save, disabled: !dirty }} />
              {value && design ? <EmailStudio value={value} onChange={setValue} design={design} vars={vars} sample={sample} data={SAMPLE_DATA} kind={eventClass(key) === 'Marketing' ? 'offer' : 'service'} /> : <div style={{ minHeight: 400 }} aria-busy="true" />}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
