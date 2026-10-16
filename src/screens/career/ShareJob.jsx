'use client';
// ShareJob — share a job post (Batch F), like the super admin's ShareSheet but to social networks and copy only. The text
// starts automatic (job, place, type, salary when shown, the link) and can be edited; "Save as this job's text" keeps it.
// Each network gets the job link with its own ?src= (facebook, whatsapp, linkedin), so the applicants board shows where
// each candidate came from. Nothing is posted until the person presses Post on the network's own page.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet } from '@/components/ui';
import { jobLink, shareText, autoShareText, saveShareText } from '@/lib/platform/career';

const CSS = `
.sj{display:flex;flex-direction:column;gap:var(--space-4)}
.sj textarea{min-height:170px;height:auto;padding:var(--space-2) var(--space-3);line-height:1.5}
.sj-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(140px,1fr));gap:var(--space-2)}
.sj-grid a,.sj-grid button{display:flex;align-items:center;gap:8px;min-height:40px;padding:0 12px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-card);font:inherit;font-size:var(--text-sm);color:var(--text-heading);text-decoration:none;cursor:pointer}
.sj-grid a:hover,.sj-grid button:hover{border-color:var(--primary)}
.sj-sec{display:flex;flex-direction:column;gap:var(--space-2)}
.sj-sec>b{font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
`;
const enc = encodeURIComponent;

export function ShareJob({ job, open, onClose }) {
  const [text, setText] = useState('');
  const base = job ? jobLink(job) : '';
  const auto = job ? autoShareText(job, base) : '';
  const saved = job && job.share && job.share.text ? shareText(job, base) : '';
  useEffect(() => { if (open && job) setText(saved || auto); }, [open, job && job.id]); // eslint-disable-line react-hooks/exhaustive-deps
  if (!job) return null;
  const edited = text !== (saved || auto);
  // the text carries the plain link; each network swaps in its own tracked one
  const withSrc = (src) => text.split(base).join(jobLink(job, src));
  const copy = async (what, value) => { try { await navigator.clipboard.writeText(value); toast(what + ' copied'); } catch { toast('Copy did not work: select it and copy.', { tone: 'error' }); } };
  const nets = [
    ['facebook', 'Facebook', 'facebook', `https://www.facebook.com/sharer/sharer.php?u=${enc(jobLink(job, 'facebook'))}&quote=${enc(withSrc('facebook'))}`],
    ['whatsapp', 'WhatsApp', 'message-circle', `https://wa.me/?text=${enc(withSrc('whatsapp'))}`],
    ['linkedin', 'LinkedIn', 'linkedin', `https://www.linkedin.com/sharing/share-offsite/?url=${enc(jobLink(job, 'linkedin'))}`],
  ];
  return (
    <Sheet open={open} title={'Share · ' + job.title} onClose={onClose} footer={<button type="button" className="gc-btn gc-btn--neutral" onClick={onClose}>Done</button>}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="sj">
        {job.status !== 'open' ? <p className="cr-note cr-note--warn" style={{ margin: 0 }}><Icon name="triangle-alert" width="16" height="16" aria-hidden="true" />This job is not open yet: people who tap the link can’t apply until you publish it.</p> : null}
        <div>
          <label className="gc-label" htmlFor="sj-text">Post text</label>
          <textarea id="sj-text" className="gc-input" value={text} onChange={(e) => setText(e.target.value)} />
          <div className="cr-row" style={{ marginTop: 6 }}>
            <span className="gc-help" style={{ margin: 0 }}>{saved ? 'This job’s own text' : 'Written automatically'}{edited ? ' · edited' : ''}</span>
            {edited || saved ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setText(auto); if (saved) { saveShareText(job.id, ''); toast('Back to the automatic text'); } }}>Automatic text</button> : null}
            {edited ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => { const r = saveShareText(job.id, text); if (r.ok === false) toast(r.error, { tone: 'error' }); else toast('Saved: sharing uses this text from now on'); }}>Save as this job’s text</button> : null}
          </div>
        </div>
        <div className="cr-link">
          <input className="gc-input" readOnly value={base} aria-label="Job link" onFocus={(e) => e.target.select()} />
          <button type="button" className="ix-btn" onClick={() => copy('Link', base)}>Copy link</button>
        </div>
        <div className="sj-sec">
          <b>Post it</b>
          <div className="sj-grid">
            {nets.map(([k, l, ic, href]) => <a key={k} href={href} target="_blank" rel="noopener noreferrer"><Icon name={ic} width="16" height="16" aria-hidden="true" />{l}</a>)}
            <button type="button" onClick={() => copy('Text', text)}><Icon name="copy" width="16" height="16" aria-hidden="true" />Copy text</button>
          </div>
          <span className="gc-help" style={{ margin: 0 }}>Each link remembers where it was shared, so you see which post brought each applicant.</span>
        </div>
      </div>
    </Sheet>
  );
}
