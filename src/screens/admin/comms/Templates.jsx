'use client';
// Communications › Templates (/admin/templates) — the message library GridCommerce sends from, grouped by purpose
// (onboarding, trial, renewal, payment reminder and confirmation, offers, support, meetings, system notices). Each
// purpose has an SMS and an email, in English and Bangla. Tabs All / SMS / Email (?ch=), search and a purpose filter;
// a row opens the editor (/admin/templates/edit?id=). "New template" asks for the purpose, channel and name.
// Copied from the merchant panel's Messaging campaigns › Templates; data: lib/admin/comms.js (templates, createTemplate).

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, IndexTabs, SearchField } from '@/components/ui/IndexKit';
import { PURPOSES, purposeLabel, CH_LABEL, createTemplate, templateUse, varsIn } from '@/lib/admin/comms';
import { AdminShell } from '../AdminShell';
import { useComms, useQueryState, COMMS_CSS, Skel, LoadError, whenText, plural } from './commsShared';

const CHS = [['all', 'All'], ['sms', 'SMS'], ['email', 'Email']];

const CSS = `
.tp-group th{padding:var(--space-3) var(--space-4) 6px!important;background:var(--surface-card)!important;border-bottom:1px solid var(--border-subtle);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body);text-align:left}
.tp-group:first-child th{padding-top:var(--space-2)!important}
.tp-name{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:420px}
.tp-name a{font-weight:var(--weight-semibold);color:var(--text-heading);text-decoration:none}
.tp-name a:hover{color:var(--primary);text-decoration:underline}
.tp-name small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.tp-langs{display:inline-flex;gap:4px}
.tp-lang{display:inline-flex;align-items:center;height:20px;padding:0 6px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);color:var(--text-body)}
.tp-lang.is-miss{background:var(--fill-warning-soft);color:var(--text-warning)}
.tp-plgroup{padding:var(--space-3) 12px 4px;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-body)}
`;

export default function Templates() {
  const router = useRouter();
  const { data, t, live } = useComms();
  const [ch, setCh] = useQueryState('ch', ['sms', 'email'], 'all');
  const [q, setQ] = useState('');
  const [purpose, setPurpose] = useState('');
  const [add, setAdd] = useState(null);   // { purpose, ch, name, error }
  const [retry, setRetry] = useState(0);

  const make = () => {
    if (!add.name.trim()) { setAdd({ ...add, error: 'Name the template.' }); return; }
    const r = createTemplate({ purpose: add.purpose, ch: add.ch, name: add.name });
    if (!r.ok) { setAdd({ ...add, error: r.error }); return; }
    setAdd(null); toast('Template made. Write the message, then save.');
    router.push('/admin/templates/edit?id=' + encodeURIComponent(r.id));
  };

  const header = (
    <ShopHeader icon="file-text" title="Templates"
      about="The SMS and emails GridCommerce sends to merchants and leads, by purpose, each in English and Bangla with {{variables}} filled in per recipient. Automations, campaigns and the Send SMS / Compose sheets use them. Editing one keeps its old versions."
      more={[{ label: 'Automations', href: '/admin/automations' }, { label: 'SMS', href: '/admin/sms' }, { label: 'Email', href: '/admin/email' }]}
      primary={{ label: 'New template', icon: 'plus', onClick: () => setAdd({ purpose: purpose || 'promo', ch: ch === 'email' ? 'email' : 'sms', name: '', error: '' }) }} />
  );

  let body;
  let list = null;
  if (live) { try { list = data.templates; } catch { list = null; } }
  if (!live) body = <Skel label="Loading templates" strip={false} />;
  else if (!list) body = <LoadError onRetry={() => setRetry((n) => n + 1)} />;
  else {
    const s = q.trim().toLowerCase();
    const rows = list.filter((x) => (ch === 'all' || x.ch === ch) && (!purpose || x.purpose === purpose)
      && (!s || [x.name, x.en.subject, x.en.body, x.bn && x.bn.body, purposeLabel(x.purpose)].join(' ').toLowerCase().includes(s)));
    const groups = PURPOSES.map(([k, l]) => ({ k, l, rows: rows.filter((x) => x.purpose === k) })).filter((g) => g.rows.length);
    const tabs = CHS.map(([k, l]) => ({ key: k, id: 'tp-tab-' + k, label: l, count: list.filter((x) => k === 'all' || x.ch === k).length, on: ch === k, onClick: () => setCh(k) }));
    const filtersOn = !!(s || purpose);
    const use = (x) => { const u = templateUse(data, x.id); const n = u.automations.length + u.campaigns.length; return n ? `${plural(u.automations.length, 'automation')}${u.campaigns.length ? ' · ' + plural(u.campaigns.length, 'campaign') : ''}` : 'Not used'; };
    const langs = (x) => (
      <span className="tp-langs">
        <span className="tp-lang">EN</span>
        <span className={'tp-lang' + (x.bn && x.bn.body ? '' : ' is-miss')} title={x.bn && x.bn.body ? 'Bangla written' : 'Bangla missing: English is sent instead'}>BN{x.bn && x.bn.body ? '' : ' missing'}</span>
      </span>
    );
    const href = (x) => '/admin/templates/edit?id=' + encodeURIComponent(x.id);
    body = (
      <section className="ix-card" aria-label="Templates">
        <div className="ix-bar"><IndexTabs tabs={tabs} label="Templates by channel" /></div>
        <div className="cm-filters" role="group" aria-label="Filter templates">
          <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name or text" />
          <select aria-label="Purpose" className={'ix-filter' + (purpose ? ' is-set' : '')} value={purpose} onChange={(e) => setPurpose(e.target.value)}><option value="">Purpose</option>{PURPOSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
          {filtersOn ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => { setQ(''); setPurpose(''); }}>Clear all</button> : null}
        </div>
        {!groups.length ? (
          <div className="ix-empty"><EmptyState title="No templates match." actionLabel="Clear filters" onAction={() => { setQ(''); setPurpose(''); setCh('all'); }} /></div>
        ) : (
          <>
            <ul className="ix-plist" aria-label="Templates">
              {groups.map((g) => (
                <React.Fragment key={g.k}>
                  <li className="tp-plgroup" aria-hidden="true">{g.l}</li>
                  {g.rows.map((x) => (
                    <li key={x.id}><Link href={href(x)} className="ix-pitem">
                      <span className="ix-pitem__top"><b>{x.name}</b><StatusBadge tone={x.status === 'Active' ? 'success' : 'neutral'}>{x.status}</StatusBadge></span>
                      <span className="ix-pitem__mid">{CH_LABEL[x.ch]} · {x.ch === 'email' ? x.en.subject : x.en.body}</span>
                      <span className="ix-pitem__tags">{langs(x)}<span className="ix-pitem__mid">{use(x)}</span></span>
                    </Link></li>
                  ))}
                </React.Fragment>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Templates by purpose</caption>
                <thead><tr><th scope="col">Template</th><th scope="col">Channel</th><th scope="col">Languages</th><th scope="col">Variables</th><th scope="col">Used by</th><th scope="col">Status</th><th scope="col">Updated</th></tr></thead>
                {groups.map((g) => (
                  <tbody key={g.k}>
                    <tr className="tp-group"><th scope="rowgroup" colSpan={7}>{g.l}</th></tr>
                    {g.rows.map((x) => (
                      <tr key={x.id} tabIndex={0} onClick={(e) => { if (!e.target.closest('a')) router.push(href(x)); }} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) router.push(href(x)); }}>
                        <td><span className="tp-name"><Link href={href(x)}>{x.name}</Link><small>{x.ch === 'email' ? x.en.subject : x.en.body}</small></span></td>
                        <td>{CH_LABEL[x.ch]}</td>
                        <td>{langs(x)}</td>
                        <td className="ix-muted"><span className="cm-fig">{varsIn((x.en.subject || '') + x.en.body).length}</span></td>
                        <td className="ix-muted">{use(x)}</td>
                        <td><StatusBadge tone={x.status === 'Active' ? 'success' : 'neutral'}>{x.status}</StatusBadge></td>
                        <td className="ix-muted" style={{ whiteSpace: 'nowrap' }}>v{x.version} · {whenText(x.updatedAt, t)}</td>
                      </tr>
                    ))}
                  </tbody>
                ))}
              </table>
            </div>
          </>
        )}
        <div className="ix-foot"><span>{plural(rows.length, 'template')} · {plural(groups.length, 'purpose')}</span></div>
      </section>
    );
  }

  return (
    <AdminShell active="templates" title="Templates">
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      <Sheet open={!!add} title="New template" onClose={() => setAdd(null)}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setAdd(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={make}>Make template</button></>}>
        {add ? (
          <div className="cm-form">
            <div className="cm-field"><label className="gc-label" htmlFor="tp-name">Name</label>
              <input id="tp-name" data-autofocus className={'gc-input' + (add.error ? ' gc-input--error' : '')} value={add.name} placeholder="e.g. Puja offer SMS" onChange={(e) => setAdd({ ...add, name: e.target.value, error: '' })} />
              {add.error ? <p className="gc-help gc-help--error" role="alert">{add.error}</p> : null}</div>
            <div className="cm-field"><label className="gc-label" htmlFor="tp-purpose">Purpose</label>
              <select id="tp-purpose" className="gc-input gc-select" value={add.purpose} onChange={(e) => setAdd({ ...add, purpose: e.target.value })}>{PURPOSES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div className="cm-field"><span className="gc-label">Channel</span>
              <div className="ix-chips" role="group" aria-label="Channel">{[['sms', 'SMS'], ['email', 'Email']].map(([k, l]) => <button key={k} type="button" className="ix-chip" aria-pressed={add.ch === k} onClick={() => setAdd({ ...add, ch: k })}>{l}</button>)}</div></div>
            <p className="gc-help" style={{ margin: 0 }}>It starts as a draft: automations and campaigns can pick it once it is active.</p>
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
