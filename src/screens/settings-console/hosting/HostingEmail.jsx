'use client';
// Hosting › Email — the domain's email DNS: who hosts the mailboxes (Business email, Google Workspace, Microsoft 365, Zoho,
// another provider or none), order emails sent from the shop's own domain through GridCommerce, SPF (built from every
// sender, 10-lookup check), DKIM (GridCommerce's gc1 + the provider's key), DMARC (policy, share, reports, alignment),
// MTA-STS. The records it needs with their state; "Add records for me" on GridCommerce DNS or "Check records" at a
// registrar; a test email (SPF / DKIM / DMARC result) and the DMARC report summary. Mailboxes themselves: Business email.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import {
  emailOf, saveEmail, emailStatus, applyEmailRecords, checkEmail, testEmail, dmarcReport, spfValue, spfLookups, dmarcValue,
  zoneOf, PROVIDERS,
} from '@/lib/hosting';
import { Card, Code, StateBadge, DomainPicker, SwitchRow, done, copy } from './hsShared';

const POLICIES = [['none', 'None', 'Only watch and send reports'], ['quarantine', 'Quarantine', 'Failing mail goes to spam'], ['reject', 'Reject', 'Failing mail is refused']];
const RESULT = { pass: ['Pass', 'success'], fail: ['Fail', 'error'], none: ['Not set', 'neutral'] };

export default function HostingEmail({ domains, host, setHost, now, goTab }) {
  const saved = emailOf(host);
  const [e, setE] = useState(saved);
  const [err, setErr] = useState({});
  const [test, setTest] = useState(null);
  useEffect(() => { setE(emailOf(host)); setErr({}); setTest(null); }, [host]);   // eslint-disable-line react-hooks/exhaustive-deps
  const dirty = JSON.stringify({ ...e, checks: 0 }) !== JSON.stringify({ ...saved, checks: 0 });
  const z = zoneOf(host);
  const status = emailStatus(host, now);
  const bad = status.filter((s) => ['missing', 'wrong', 'needs-value'].includes(s.state)).length;
  const report = dmarcReport(host);
  const look = spfLookups(host, e);
  const set = (patch) => { setE((c) => ({ ...c, ...patch, dmarc: { ...c.dmarc, ...(patch.dmarc || {}) } })); setErr({}); };
  const save = () => {
    const { biz, checks, ...rest } = e;   // eslint-disable-line no-unused-vars
    const res = saveEmail(host, rest);
    if (res.ok === false) { setErr({ [res.field || 'all']: res.error }); toast(res.error, { tone: 'error' }); return; }
    toast(z.mode === 'gc' ? 'Saved. Press Add records for me to update DNS.' : 'Saved. Update the records at your registrar.');
  };
  const p = PROVIDERS[e.provider] || PROVIDERS.none;

  return (
    <>
      <Card title="Mailboxes" id="hs-mail-box" sub="Who receives mail for this domain. Mailboxes themselves are made in your provider.">
        <DomainPicker domains={domains} host={host} onChange={setHost} />
        {saved.biz ? (
          <div className="hs-row" style={{ borderTop: 0 }}>
            <span className="hs-row__text">GridCommerce Business email runs on {host}<small>Its records are added for you.</small></span>
            <Link href="/email" className="ix-btn ix-btn--sm">Manage mailboxes</Link>
          </div>
        ) : (
          <>
            <select className="gc-input gc-select" aria-label="Mailbox provider" value={e.provider} onChange={(ev) => set({ provider: ev.target.value })}>
              {Object.entries(PROVIDERS).map(([k, v]) => <option key={k} value={k}>{v.label}</option>)}
            </select>
            {e.provider === 'gc' ? <p className="hs-sub">Set up <Link href="/email" className="bl-link">Business email</Link> to make mailboxes like sales@{host}.</p> : null}
            {e.provider === 'other' ? (
              <div><label className="gc-label" htmlFor="hs-mx">Mail servers (one per line: priority and host)</label>
                <textarea id="hs-mx" className="gc-input" rows={3} placeholder="10 mail.example.com" value={e.otherMx} aria-invalid={!!err.otherMx || undefined} onChange={(ev) => set({ otherMx: ev.target.value })} />
                {err.otherMx ? <p className="hs-err">{err.otherMx}</p> : null}</div>
            ) : null}
            {p.dkim && p.dkim.paste ? (
              <div><label className="gc-label" htmlFor="hs-dkimv">{p.short} DKIM key</label>
                <textarea id="hs-dkimv" className="gc-input" rows={3} placeholder="v=DKIM1; k=rsa; p=…" value={e.dkimValue} onChange={(ev) => set({ dkimValue: ev.target.value })} />
                <p className="hs-sub" style={{ marginTop: 4 }}>Find it in {p.dkim.where}.</p></div>
            ) : null}
          </>
        )}
      </Card>

      <Card title="Order emails" id="hs-mail-send">
        <SwitchRow label={'Send order emails from orders@' + host} help={e.gcSending ? 'GridCommerce signs them for your domain, so they reach the inbox.' : 'They are sent from noreply@gridcommerce.com.bd.'} on={e.gcSending} onChange={(v) => set({ gcSending: v })} />
      </Card>

      <Card title="SPF · who may send" id="hs-mail-spf">
        <Code text={spfValue(host, e)} label="SPF record" />
        <div className="hs-two">
          <div><label className="gc-label" htmlFor="hs-spfx">Other services that send for you</label>
            <input id="hs-spfx" className="gc-input" placeholder="sendgrid.net, mailchimp.com" value={e.spfExtra} aria-invalid={!!err.spfExtra || undefined} onChange={(ev) => set({ spfExtra: ev.target.value })} />
            {err.spfExtra ? <p className="hs-err">{err.spfExtra}</p> : null}</div>
          <div><label className="gc-label" htmlFor="hs-spfall">Mail from anyone else</label>
            <select id="hs-spfall" className="gc-input gc-select" value={e.spfAll} onChange={(ev) => set({ spfAll: ev.target.value })}><option value="~all">Mark it (soft fail)</option><option value="-all">Refuse it (fail)</option></select></div>
        </div>
        <p className={look > 10 ? 'hs-err' : 'hs-sub'}>{look} of 10 lookups used{look > 10 ? '. Too many: receivers ignore the record. Remove a sender.' : '.'}</p>
      </Card>

      <Card title="DMARC · fake mail in your name" id="hs-mail-dmarc">
        <div className="hs-seg" role="group" aria-label="DMARC policy">
          {POLICIES.map(([k, l]) => <button key={k} type="button" aria-pressed={e.dmarc.policy === k} onClick={() => set({ dmarc: { policy: k } })}>{l}</button>)}
        </div>
        <p className="hs-sub">{(POLICIES.find((x) => x[0] === e.dmarc.policy) || POLICIES[0])[2]}. {e.dmarc.policy === 'none' ? 'Start here, then move to Quarantine when the reports look clean.' : ''}</p>
        <div className="hs-two">
          <div><label className="gc-label" htmlFor="hs-rua">Send reports to</label>
            <input id="hs-rua" className="gc-input" type="email" value={e.dmarc.rua} aria-invalid={!!err.rua || undefined} onChange={(ev) => set({ dmarc: { rua: ev.target.value } })} />
            {err.rua ? <p className="hs-err">{err.rua}</p> : null}</div>
          <div><label className="gc-label" htmlFor="hs-pct">Apply to (% of failing mail)</label>
            <input id="hs-pct" className="gc-input" inputMode="numeric" value={e.dmarc.pct} aria-invalid={!!err.pct || undefined} onChange={(ev) => set({ dmarc: { pct: Number(ev.target.value.replace(/\D/g, '')) || '' } })} />
            {err.pct ? <p className="hs-err">{err.pct}</p> : null}</div>
        </div>
        <details className="gc-disclose">
          <summary>More options</summary>
          <div className="hs-two" style={{ marginTop: 'var(--space-3)' }}>
            <div><label className="gc-label" htmlFor="hs-adkim">DKIM match</label><select id="hs-adkim" className="gc-input gc-select" value={e.dmarc.adkim} onChange={(ev) => set({ dmarc: { adkim: ev.target.value } })}><option value="r">Relaxed (subdomains count)</option><option value="s">Strict (exact domain)</option></select></div>
            <div><label className="gc-label" htmlFor="hs-aspf">SPF match</label><select id="hs-aspf" className="gc-input gc-select" value={e.dmarc.aspf} onChange={(ev) => set({ dmarc: { aspf: ev.target.value } })}><option value="r">Relaxed (subdomains count)</option><option value="s">Strict (exact domain)</option></select></div>
            <div><label className="gc-label" htmlFor="hs-sp">Subdomains</label><select id="hs-sp" className="gc-input gc-select" value={e.dmarc.sp} onChange={(ev) => set({ dmarc: { sp: ev.target.value } })}><option value="">Same as the domain</option><option value="none">None</option><option value="quarantine">Quarantine</option><option value="reject">Reject</option></select></div>
          </div>
        </details>
        <Code text={dmarcValue(host, e)} label="DMARC record" />
        {report ? <p className="hs-sub">Last 7 days: {report.passed.toLocaleString('en-IN')} of {report.total.toLocaleString('en-IN')} messages passed ({Math.round((report.passed / report.total) * 1000) / 10}%). Failing: {report.sources.filter((x) => x[1] === 'fail').map((x) => x[0]).join(', ')}.</p> : null}
      </Card>

      <Card title="Extra protection" id="hs-mail-extra">
        <SwitchRow label="MTA-STS" help="Asks senders to deliver your mail only over encryption, with reports when it fails." on={e.mtasts} disabled={e.provider === 'none'} onChange={(v) => set({ mtasts: v })} />
      </Card>

      {dirty ? (
        <div className="hs-acts" style={{ marginTop: 'var(--space-3)' }}>
          <button type="button" className="ix-btn ix-btn--primary" onClick={save}>Save email settings</button>
          <button type="button" className="ix-btn" onClick={() => { setE(saved); setErr({}); }}>Discard</button>
          <span className="hs-sub">The records below change after you save.</span>
        </div>
      ) : null}

      <Card title={'Email records · ' + host} id="hs-mail-recs"
        actions={<StatusBadge tone={bad ? 'warning' : 'success'}>{bad ? (bad === 1 ? '1 needs fixing' : bad + ' need fixing') : status.some((s) => s.state === 'unknown') ? 'Not checked' : 'All working'}</StatusBadge>}>
        <div className="hs-list" role="table" aria-label="Email records">
          {status.map((s) => (
            <div key={s.key} className="hs-rec" role="row" style={{ gridTemplateColumns: '64px minmax(90px,150px) minmax(0,1fr) 110px auto' }}>
              <b role="cell">{s.type}</b>
              <span role="cell" className="hs-rec__name">{s.name}</span>
              <span role="cell" className="hs-rec__val">{s.type === 'MX' ? s.priority + ' ' : ''}{s.value || '—'}<small>{s.why}</small></span>
              <span role="cell" className="hs-rec__state"><StateBadge state={s.state} /></span>
              <span role="cell" className="hs-rec__acts">{s.value ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon" aria-label={'Copy ' + s.type + ' ' + s.name} title="Copy" onClick={() => copy(s.value)}><Icon name="copy" width="14" height="14" aria-hidden="true" /></button> : null}</span>
            </div>
          ))}
          {!status.length ? <p className="hs-sub">No email on this domain, so no records are needed.</p> : null}
        </div>
        <div className="hs-acts">
          {z.mode === 'gc'
            ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={dirty || !bad} onClick={() => { const r = applyEmailRecords(host); done(r, r.count === 1 ? '1 record updated. It goes live in a few seconds.' : r.count + ' records updated. They go live in a few seconds.'); }}>Add records for me</button>
            : <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" disabled={dirty} onClick={() => done(checkEmail(host), 'Checking the records at your registrar…')}>Check records</button>}
          <button type="button" className="ix-btn ix-btn--sm" disabled={dirty} onClick={() => setTest(testEmail(host))}>Send a test email</button>
          {z.mode !== 'gc' ? <span className="hs-sub">Add them at your registrar, or switch to <button type="button" className="bl-link" onClick={() => goTab('dns')}>GridCommerce DNS</button>.</span> : null}
        </div>
        {test ? (
          <div className="hs-row">
            <span className="hs-row__text">Test from {test.from}<small>Lands in: {test.inbox}</small></span>
            <span className="hs-acts">{['spf', 'dkim', 'dmarc'].map((k) => <StatusBadge key={k} tone={RESULT[test[k]][1]}>{k.toUpperCase() + ' ' + RESULT[test[k]][0].toLowerCase()}</StatusBadge>)}</span>
          </div>
        ) : null}
      </Card>
    </>
  );
}
