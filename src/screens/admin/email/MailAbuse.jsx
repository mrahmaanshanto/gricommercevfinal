'use client';
// Business email › Abuse & limits (/admin/email/abuse) — the sending caps every mailbox has (mails an hour, a day,
// recipients a mail), spam complaints by domain, and what is suspended now (with who did it and why). Suspending and
// restoring happen on the domain in the Directory; every step is logged and the owner sees the reason.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { toast } from '@/runtime/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { StatusBadge } from '@/components/ui';
import { read, EVENT, saveMailSettings, address } from '@/lib/platform/mail';
import { AdminShell } from '../AdminShell';

const CSS = `.ma-pad{display:flex;flex-direction:column;gap:var(--space-3);padding:var(--space-4)}.ma-pad h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}.ma-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:var(--space-3)}.ma-pad .gc-label{margin-bottom:4px}.ma-row{display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:8px 10px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);font-size:var(--text-sm)}.ma-row small{display:block;font-size:var(--text-xs);color:var(--text-muted)}`;

export default function MailAbuse() {
  const [db, setDb] = useState(null);
  const [caps, setCaps] = useState(null);
  useEffect(() => { const load = () => { const d = read(); setDb(d); setCaps({ ...d.settings.caps }); }; load(); window.addEventListener(EVENT, load); return () => window.removeEventListener(EVENT, load); }, []);
  if (!db) return <AdminShell active="mail-abuse" title="Mail abuse"><div style={{ minHeight: 300 }} aria-busy="true" /></AdminShell>;
  const complaints = db.domains.flatMap((d) => (d.complaints || []).map((c) => ({ ...c, d }))).sort((a, b) => b.at - a.at);
  const susDomains = db.domains.filter((d) => d.state === 'suspended');
  const susBoxes = db.mailboxes.filter((m) => m.status === 'suspended' && m.suspendedBy).map((m) => ({ m, d: db.domains.find((x) => x.id === m.domainId) }));
  const saveCaps = () => { const r = saveMailSettings({ caps: { perHour: Number(caps.perHour) || 1, perDay: Number(caps.perDay) || 1, recipients: Number(caps.recipients) || 1 } }); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast('Sending limits saved'); };
  return (
    <AdminShell active="mail-abuse" title="Mail abuse">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page ix-page--narrow">
        <ShopHeader icon="shield-alert" title="Abuse & limits" about="Sending limits for every mailbox, spam complaints, and what is suspended." secondary={[{ label: 'Directory', href: '/admin/email' }]} />
        <section className="ix-card ma-pad" aria-labelledby="ma-caps">
          <h2 id="ma-caps">Sending limits (every mailbox)</h2>
          <div className="ma-grid">
            <div><label className="gc-label" htmlFor="ma-h">Mails an hour</label><input id="ma-h" className="gc-input" inputMode="numeric" value={caps.perHour} onChange={(e) => setCaps({ ...caps, perHour: e.target.value.replace(/\D/g, '') })} /></div>
            <div><label className="gc-label" htmlFor="ma-d">Mails a day</label><input id="ma-d" className="gc-input" inputMode="numeric" value={caps.perDay} onChange={(e) => setCaps({ ...caps, perDay: e.target.value.replace(/\D/g, '') })} /></div>
            <div><label className="gc-label" htmlFor="ma-r">Recipients a mail</label><input id="ma-r" className="gc-input" inputMode="numeric" value={caps.recipients} onChange={(e) => setCaps({ ...caps, recipients: e.target.value.replace(/\D/g, '') })} /></div>
          </div>
          <p className="gc-help" style={{ margin: 0 }}>Bulk offers go through Communications (campaigns with consent), not mailboxes.</p>
          <div><button type="button" className="ix-btn ix-btn--primary" onClick={saveCaps}>Save limits</button></div>
        </section>
        <section className="ix-card ma-pad" aria-labelledby="ma-c">
          <h2 id="ma-c">Spam complaints</h2>
          {complaints.length ? complaints.map((c, i) => <div key={i} className="ma-row"><StatusBadge tone={c.count >= 20 ? 'error' : 'warning'}>{c.count}</StatusBadge><span>{c.d.domain}<small>{c.d.shopName} · {new Date(c.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}{c.note ? ' · ' + c.note : ''}</small></span></div>) : <p className="ix-muted" style={{ margin: 0 }}>No complaints.</p>}
        </section>
        <section className="ix-card ma-pad" aria-labelledby="ma-s">
          <h2 id="ma-s">Suspended now</h2>
          {susDomains.map((d) => <div key={d.id} className="ma-row"><StatusBadge tone="error">Domain</StatusBadge><span>{d.domain}<small>{d.suspended ? d.suspended.reason + ' · ' + d.suspended.by : ''}</small></span><Link href="/admin/email?tab=suspended" className="bl-link" style={{ marginLeft: 'auto' }}>Open</Link></div>)}
          {susBoxes.map(({ m, d }) => <div key={m.id} className="ma-row"><StatusBadge tone="warning">Mailbox</StatusBadge><span>{address(d, m.local)}<small>{m.suspendReason} · {m.suspendedBy}</small></span></div>)}
          {!susDomains.length && !susBoxes.length ? <p className="ix-muted" style={{ margin: 0 }}>Nothing suspended.</p> : null}
        </section>
      </div>
    </AdminShell>
  );
}
