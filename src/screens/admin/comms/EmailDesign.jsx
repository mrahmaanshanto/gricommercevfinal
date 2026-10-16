'use client';
// Communications › Message design › Email design (/admin/message-design?tab=email; Batch B step 1, moved into Message
// design in Batch D; /admin/email-design forwards) — the look of every email GridCommerce sends to
// shops and leads (logo, colours, font, header, footer, social links), a sample, and every email template with its
// designed English and Bangla versions (Design opens /admin/templates/design?id=). Same email kit as the shops'
// emails (lib/email/emailKit.js); data in the comms store (lib/admin/comms.js › emailDesign, template.design).

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { EmailDesignForm } from '@/components/email/EmailDesignForm';
import { saveCommsEmailDesign, purposeLabel } from '@/lib/admin/comms';
import { designOf, PLATFORM_DESIGN, renderTemplate } from '@/lib/admin/emailDesign';
import { previewHtml } from '@/lib/email/emailKit';
import { useComms, Skel, Card } from './commsShared';

const CSS = `
.aed{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:var(--space-4)}
.aed-prev{border:1px solid var(--border-subtle);border-radius:var(--radius-lg);overflow:hidden;background:var(--surface-subtle);height:520px}
.aed-prev iframe{border:0;width:680px;height:1040px;transform:scale(.5);transform-origin:0 0}
.aed-acts{display:flex;flex-wrap:wrap;gap:var(--space-2);margin-top:var(--space-3)}
.aed-list{list-style:none;margin:0;padding:0}
.aed-list li{display:flex;align-items:center;gap:var(--space-3);min-height:48px;border-top:1px solid var(--border-subtle)}
.aed-list li:first-child{border-top:0}
.aed-list li>span:first-child{flex:1;min-width:0;display:flex;flex-direction:column}
.aed-list b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.aed-list small{font-size:var(--text-xs);color:var(--text-muted)}
@media (max-width:1023px){.aed{grid-template-columns:minmax(0,1fr)}.aed-prev{height:420px}}
`;

export const EMAIL_DESIGN_ADMIN_CSS = CSS;
/** The email design card pair (look + every email), used by Message design. */
export function EmailDesignBody() {
  const { data, live } = useComms();
  const [d, setD] = useState(null);
  const [base, setBase] = useState('');
  useEffect(() => { if (live && !d) { const x = designOf(data); setD(x); setBase(JSON.stringify(x)); } }, [live, data, d]);
  const emails = live ? data.templates.filter((x) => x.ch === 'email') : [];
  const sampleTpl = emails.find((x) => x.purpose === 'paid') || emails[0];
  const html = useMemo(() => (d && sampleTpl ? renderTemplate({ ...data, emailDesign: d }, sampleTpl, 'en') : ''), [d, sampleTpl, data]);
  const dirty = !!d && JSON.stringify(d) !== base;
  const save = () => { saveCommsEmailDesign(d); setBase(JSON.stringify(d)); toast('Email design saved. Every GridCommerce email uses it.'); };
  const reset = async () => {
    if (!(await confirmDialog({ title: 'Back to the GridCommerce default?', body: 'Logo, colours, font and footer go back to the default.', confirmLabel: 'Reset' }))) return;
    saveCommsEmailDesign(null); setD({ ...PLATFORM_DESIGN }); setBase(JSON.stringify(PLATFORM_DESIGN)); toast('Back to the default');
  };
  return (<>
    {!live || !d ? <Skel label="Loading the email design" /> : (<>
      <Card title="Look" action={<span style={{ display: 'flex', gap: 'var(--space-2)' }}><Link className="ix-btn ix-btn--sm" href="/admin/templates?ch=email">Templates</Link><button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={!dirty} onClick={save}>Save design</button></span>}>
        <div className="aed">
          <div>
            <EmailDesignForm design={d} onChange={setD} />
            <div className="aed-acts"><button type="button" className="ix-btn" disabled={!dirty} onClick={() => setD(JSON.parse(base))}>Discard</button><button type="button" className="ix-btn ix-btn--plain" onClick={reset}>Back to the default</button></div>
          </div>
          <div className="aed-prev" aria-label="Sample email"><iframe title="Sample email" srcDoc={previewHtml(html)} sandbox="" /></div>
        </div>
      </Card>
      <Card title={`Emails · ${emails.length}`}>
        <ul className="aed-list">
          {emails.map((x) => (
            <li key={x.id}>
              <span><b>{x.name}</b><small>{purposeLabel(x.purpose)} · English{x.bn && x.bn.body ? ' and Bangla' : ''}{x.design ? ' · designed by hand' : ''}</small></span>
              <StatusBadge tone={x.status === 'Active' ? 'success' : 'neutral'}>{x.status}</StatusBadge>
              <Link className="ix-btn ix-btn--sm" href={'/admin/templates/design?id=' + encodeURIComponent(x.id)}>Design</Link>
            </li>
          ))}
        </ul>
      </Card>
    </>)}
  </>);
}
