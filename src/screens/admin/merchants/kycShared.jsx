'use client';
// Business verification (KYC, SA-F3) in the super admin — the parts the review queue (/admin/kyc, Verification.jsx) and
// the merchant profile's Overview share:
//   KycBadge      the state as a badge (Not verified · To review · Verified · Rejected)
//   KycSheet      one store's verification: the numbers, the documents, its history, and Approve / Reject (a reason the
//                 owner sees) while it waits for review; "Ask the owner" sends the store a notice when nothing was sent
//   KycCard       the profile's side card: state, licence and TIN, Review / Ask the owner
//   askOwnerToVerify(shop)  a notice to that store with a link to Settings › Business verification
// Data: lib/platform/shops.js (kycOf, reviewKyc) and lib/platform/notices.js (noticeToStore).

import React, { useState } from 'react';
import { Sheet, StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import { toast } from '@/runtime/ui';
import { dmy, hm } from '@/lib/platform/util';
import { staff } from '@/lib/platform/store';
import { kycOf, reviewKyc, KYC_STATES, KYC_DOCS, KYC_REJECT_REASONS } from '@/lib/platform/shops';
import { noticeToStore } from '@/lib/platform/notices';

export const kycDocName = (kind) => (KYC_DOCS.find((d) => d[0] === kind) || [kind, kind])[1];
export function KycBadge({ shop, k }) {
  const s = KYC_STATES[(k || kycOf(shop)).state] || KYC_STATES.none;
  return <StatusBadge tone={s.tone}>{s.label}</StatusBadge>;
}

/** Send the store a notice asking the owner to verify the business. */
export function askOwnerToVerify(shop) {
  const r = noticeToStore(shop.id, {
    title: 'Verify your business',
    text: 'Send your trade licence, TIN and the owner’s NID so your own SMS sender name and online payments can be turned on.',
    link: { label: 'Verify now', href: '/set-verification' }, days: 14, by: staff().name,
  });
  toast(r.ok ? `Notice sent to ${shop.name}` : r.error, r.ok ? undefined : { tone: 'error' });
  return r;
}

export function KycSheet({ shop, close }) {
  const k = kycOf(shop);
  const [mode, setMode] = useState('');          // '' | 'reject'
  const [pick, setPick] = useState('');
  const [note, setNote] = useState('');
  const [err, setErr] = useState('');
  const reason = pick === 'Other' ? note.trim() : [pick, note.trim()].filter(Boolean).join(' · ');
  const decide = (decision) => {
    if (decision === 'reject' && !pick) { setErr('Pick a reason.'); return; }
    if (decision === 'reject' && pick === 'Other' && !note.trim()) { setErr('Say why.'); return; }
    const r = reviewKyc(shop.id, decision, reason);
    if (!r.ok) { setErr(r.error); return; }
    toast(decision === 'reject' ? `${shop.name}: verification rejected` : `${shop.name} is verified`);
    close();
  };
  const waiting = k.state === 'submitted';
  const footer = waiting ? (mode === 'reject' ? (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => { setMode(''); setErr(''); }}>Back</button>
      <button type="button" className="gc-btn gc-btn--solid gc-btn--error" onClick={() => decide('reject')}>Reject</button>
    </>
  ) : (
    <>
      <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setMode('reject')}>Reject</button>
      <button type="button" className="gc-btn gc-btn--solid" onClick={() => decide('verify')}>Approve</button>
    </>
  )) : k.state === 'none' || k.state === 'rejected' ? (
    <button type="button" className="gc-btn gc-btn--solid" onClick={() => { askOwnerToVerify(shop); close(); }}>Ask the owner</button>
  ) : null;
  return (
    <Sheet open title={`Verification · ${shop.name}`} onClose={close} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-4)' }}>
        <div><KycBadge k={k} /></div>
        {k.state === 'none' ? <p className="gc-help" style={{ margin: 0 }}>The owner hasn’t sent anything yet. They do it from Settings › Business verification.</p> : (
          <KV rows={[
            ['Trade licence', <span key="l" className="mp-data" style={{ fontFamily: 'var(--font-data)' }}>{k.licence}</span>],
            ['TIN', <span key="t" style={{ fontFamily: 'var(--font-data)' }}>{k.tin}</span>],
            k.bin ? ['BIN', <span key="b" style={{ fontFamily: 'var(--font-data)' }}>{k.bin}</span>] : null,
            ['Owner', k.ownerName],
            ['NID', <span key="n" style={{ fontFamily: 'var(--font-data)' }}>{k.nid}</span>],
            ['Documents', k.docs.length ? k.docs.map((d) => `${kycDocName(d.kind)} (${d.name})`).join(', ') : '—'],
            ['Sent', k.submittedAt ? `${dmy(k.submittedAt)} ${hm(k.submittedAt)} · ${k.submittedBy}` : '—'],
            k.reviewedAt ? [k.state === 'rejected' ? 'Rejected' : 'Verified', `${dmy(k.reviewedAt)} · ${k.reviewedBy}`] : null,
            k.reason ? ['Reason', k.reason] : null,
          ]} />
        )}
        {waiting ? <p className="gc-help" style={{ margin: 0 }}>Check the numbers against the photos. The demo keeps only the file names; the live system shows the photos here.</p> : null}
        {waiting && mode === 'reject' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
            <div>
              <label className="gc-label" htmlFor="kyc-r">Reason (the owner sees it)</label>
              <select id="kyc-r" className={'gc-input gc-select' + (err && !pick ? ' gc-input--error' : '')} value={pick} data-autofocus onChange={(e) => { setPick(e.target.value); setErr(''); }}>
                <option value="">Pick a reason</option>
                {KYC_REJECT_REASONS.map((x) => <option key={x}>{x}</option>)}
              </select>
            </div>
            <div>
              <label className="gc-label" htmlFor="kyc-n">{pick === 'Other' ? 'Say why' : 'Note (optional)'}</label>
              <textarea id="kyc-n" rows={2} className="gc-input" value={note} onChange={(e) => { setNote(e.target.value); setErr(''); }} />
            </div>
          </div>
        ) : null}
        {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
        {k.log && k.log.length ? (
          <div>
            <p className="gc-label" style={{ margin: '0 0 var(--space-2)' }}>History</p>
            <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--text-sm)' }}>
              {k.log.map((l, i) => <li key={i}>{l.text}<span style={{ display: 'block', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{dmy(l.at)} {hm(l.at)} · {l.by}</span></li>)}
            </ul>
          </div>
        ) : null}
      </div>
    </Sheet>
  );
}

/** The merchant profile's Verification card. */
export function KycCard({ shop, Card, Row }) {
  const [open, setOpen] = useState(false);
  const k = kycOf(shop);
  const sub = k.state === 'verified' ? `Verified ${dmy(k.reviewedAt)} by ${k.reviewedBy}` : k.state === 'submitted' ? `Sent ${dmy(k.submittedAt)} · waiting for review`
    : k.state === 'rejected' ? `Rejected: ${k.reason}` : 'Nothing sent yet';
  const action = k.state === 'submitted' ? 'Review' : k.state === 'verified' ? 'View' : 'Ask the owner';
  return (
    <>
      <Card title="Verification" action={<button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => (k.state === 'none' ? askOwnerToVerify(shop) : setOpen(true))}>{action}</button>}>
        <Row icon={k.state === 'verified' ? 'shield-check' : k.state === 'rejected' ? 'shield-alert' : 'shield'} title={<KycBadge k={k} />} sub={sub} />
        {k.licence ? <KV rows={[['Trade licence', k.licence], ['TIN', k.tin]]} /> : null}
      </Card>
      {open ? <KycSheet shop={shop} close={() => setOpen(false)} /> : null}
    </>
  );
}
