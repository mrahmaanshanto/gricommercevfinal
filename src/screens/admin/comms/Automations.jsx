'use client';
// Communications › Automations (/admin/automations) — the messages that go out by themselves, laid out like the merchant
// panel's Rules list (Shopify Flow): title row (Recent runs, New automation), four key figures, then one card with the
// kinds as tabs (Event-based · Scheduled · Sequences), search and filters, bulk on / off and a compact table with an
// on / off switch per row. A row opens the editor (/admin/automations/edit?id=, AutomationEditor.jsx).
// Data: lib/admin/comms.js (automations, setAutomationOn, createAutomation, automationRuns, sendCounts). UI only.

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Menu } from '@/components/ui/IndexKit';
import { AUTO_KINDS, triggerLabel, setAutomationOn, createAutomation, automationRuns, sendCounts, stepTitle } from '@/lib/admin/comms';
import { dm, addMonths, startOfMonth } from '@/lib/platform/util';
import { AdminShell } from '../AdminShell';
import { useComms, COMMS_CSS, Skel, num, plural, whenText } from './commsShared';

const CSS = `
.au-name{display:flex;flex-direction:column;gap:2px;min-width:0;max-width:380px}
.au-name a{font-weight:var(--weight-semibold);color:var(--text-heading);text-decoration:none}
.au-name a:hover{color:var(--primary);text-decoration:underline}
.au-name small{overflow:hidden;font-size:var(--text-xs);color:var(--text-muted);text-overflow:ellipsis;white-space:nowrap}
.au-steps{display:inline-flex;align-items:center;gap:4px;color:var(--text-muted)}
.au-steps span{font-family:var(--font-data);font-size:var(--text-xs)}
.au-fail{color:var(--text-danger)}
.au-runs{display:flex;flex-direction:column}
.au-run{display:flex;flex-direction:column;gap:4px;padding:10px 0;border-top:1px solid var(--border-subtle)}
.au-run:first-child{border-top:0}
.au-run__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.au-run__text{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
`;

const KIND_ICON = { sms: 'message-square', email: 'mail', wait: 'clock', condition: 'git-branch', notify: 'bell' };

export default function Automations() {
  const router = useRouter();
  const { data, t, live } = useComms();
  const [kind, setKind] = useState('all');
  const [q, setQ] = useState('');
  const [aud, setAud] = useState('');
  const [onf, setOnf] = useState('');
  const [sel, setSel] = useState(() => new Set());
  const [runs, setRuns] = useState(false);

  const flip = (ids, on) => {
    let n = 0; let err = '';
    for (const id of ids) { const r = setAutomationOn(id, on); if (r.ok) n++; else err = r.error; }
    if (err && !n) { toast(err, { tone: 'error' }); return; }
    toast(ids.length === 1 ? `“${data.automations.find((a) => a.id === ids[0]).name}” is ${on ? 'on. It runs from the next matching event.' : 'off.'}` : `${plural(n, 'automation')} turned ${on ? 'on' : 'off'}`);
    setSel(new Set());
  };
  const make = () => { const r = createAutomation(); if (r.ok) { toast('New automation made. Set its trigger and steps.'); router.push('/admin/automations/edit?id=' + r.id); } };

  const header = (
    <ShopHeader icon="zap" title="Automations"
      about="The SMS and emails GridCommerce sends by itself: trial check-ins on day 7, 13 and 15, renewal reminders 7, 3 and 1 day before, overdue invoice follow-ups, thank-yous for payments, welcome messages for new leads and stores, demo reminders, rating requests after a ticket is solved, the monthly summary and lead nurturing sequences. Turn each on or off, or open it to change its steps."
      secondary={[{ label: 'Recent runs', icon: 'history', onClick: () => setRuns(true) }]}
      more={[{ label: 'Templates', href: '/admin/templates' }]}
      primary={{ label: 'New automation', icon: 'plus', onClick: make }} />
  );

  let body;
  if (!live) body = <Skel label="Loading automations" />;
  else {
    const list = data.automations.map((a) => ({ ...a, c: sendCounts(data, a, t) }));
    const s = q.trim().toLowerCase();
    const rows = list.filter((a) => (kind === 'all' || a.kind === kind) && (!aud || a.audience === aud) && (!onf || (onf === 'on') === a.on)
      && (!s || [a.name, triggerLabel(a.trigger), a.steps[0].when].join(' ').toLowerCase().includes(s)));
    const tabs = AUTO_KINDS.map(([k, l]) => ({ key: k, id: 'au-tab-' + k, label: l, count: list.filter((a) => k === 'all' || a.kind === k).length, on: kind === k, onClick: () => { setKind(k); setSel(new Set()); } }));
    const on = list.filter((a) => a.on);
    const sent7 = list.reduce((x, a) => x + a.c.d7, 0);
    const fail7 = list.reduce((x, a) => x + a.c.f7, 0);
    const monthly = list.find((a) => a.kind === 'schedule' && a.on);
    const selRows = rows.filter((a) => sel.has(a.id));
    const allChecked = rows.length > 0 && rows.every((a) => sel.has(a.id));
    const toggleAll = () => setSel(allChecked ? new Set() : new Set(rows.map((a) => a.id)));
    const toggle = (id) => setSel((old) => { const n = new Set(old); if (n.has(id)) n.delete(id); else n.add(id); return n; });
    const filtersOn = !!(s || aud || onf);
    const clear = () => { setQ(''); setAud(''); setOnf(''); };
    const href = (a) => '/admin/automations/edit?id=' + a.id;
    const kinds = (a) => [...new Set(a.steps.filter((x) => x.type !== 'trigger' && x.type !== 'stop').map((x) => x.type))];
    body = (
      <>
        <MetricStrip label="Automations at a glance" items={[
          { label: 'Automations on', value: `${on.length} / ${list.length}`, icon: 'zap', onClick: () => setOnf(onf === 'on' ? '' : 'on'), on: onf === 'on' },
          { label: 'Sent, 7 days', value: num(sent7), icon: 'send' },
          { label: 'Failed, 7 days', value: num(fail7), onClick: () => setRuns(true) },
          monthly ? { label: 'Next scheduled', value: dm(addMonths(startOfMonth(t), 1, 1)), sub: monthly.name, icon: 'calendar' } : null,
        ]} />
        <section className="ix-card" aria-label="Automations">
          {selRows.length ? (
            <div className="ix-bulk" role="toolbar" aria-label="Selected automations">
              <input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select every automation shown" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
              <span className="ix-bulk__n">{selRows.length} selected</span>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => flip(selRows.map((a) => a.id), true)}>Turn on</button>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => flip(selRows.map((a) => a.id), false)}>Turn off</button>
              <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[{ label: 'Clear selection', onClick: () => setSel(new Set()) }]} />
            </div>
          ) : <div className="ix-bar"><IndexTabs tabs={tabs} label="Automation kinds" /></div>}
          <div className="cm-filters" role="group" aria-label="Filter automations">
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search automations" />
            <select aria-label="Sends to" className={'ix-filter' + (aud ? ' is-set' : '')} value={aud} onChange={(e) => setAud(e.target.value)}><option value="">Sends to</option><option value="merchants">Merchants</option><option value="leads">Leads</option></select>
            <select aria-label="Status" className={'ix-filter' + (onf ? ' is-set' : '')} value={onf} onChange={(e) => setOnf(e.target.value)}><option value="">Status</option><option value="on">On</option><option value="off">Off</option></select>
            {filtersOn ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={clear}>Clear all</button> : null}
          </div>
          {!rows.length ? (
            <div className="ix-empty">{filtersOn ? <EmptyState icon="workflow" title="No automations match these filters." actionLabel="Clear filters" onAction={clear} /> : <EmptyState icon="workflow" title="No automations of this kind." actionLabel="New automation" onAction={make} />}</div>
          ) : (
            <>
              <ul className="ix-plist" aria-label="Automations">
                {rows.map((a) => (
                  <li key={a.id}><Link href={href(a)} className="ix-pitem">
                    <span className="ix-pitem__top"><b>{a.name}</b><StatusBadge tone={a.on ? 'success' : 'neutral'}>{a.on ? 'On' : 'Off'}</StatusBadge></span>
                    <span className="ix-pitem__mid">{a.steps[0].when} · {a.audience === 'leads' ? 'Leads' : 'Merchants'}</span>
                    <span className="ix-pitem__mid">{plural(a.steps.length - 1, 'step')} · {num(a.c.d30)} sent in 30 days{a.c.f7 ? ` · ${a.c.f7} failed this week` : ''}</span>
                  </Link></li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Automations</caption>
                  <thead><tr>
                    <th scope="col" className="ix-check"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label="Select every automation shown" /></th>
                    <th scope="col">Automation</th><th scope="col">Sends to</th><th scope="col">Steps</th><th scope="col">Last run</th><th scope="col" className="ix-num">Sent, 30 days</th><th scope="col" className="ix-num">Failed, 7 days</th><th scope="col">On</th>
                  </tr></thead>
                  <tbody>
                    {rows.map((a) => (
                      <tr key={a.id} className={sel.has(a.id) ? 'is-sel' : ''} onClick={(e) => { if (e.target.closest('a,button,input')) return; router.push(href(a)); }} title={a.steps.map((x) => stepTitle(data, x)).join(' → ')}>
                        <td className="ix-check"><input type="checkbox" checked={sel.has(a.id)} onChange={() => toggle(a.id)} aria-label={'Select ' + a.name} /></td>
                        <td><span className="au-name"><Link href={href(a)}>{a.name}</Link><small>{a.kind === 'schedule' ? 'Scheduled · ' + a.value : a.kind === 'sequence' ? 'Sequence · ' + a.steps[0].when : a.steps[0].when}</small></span></td>
                        <td className="ix-muted">{a.audience === 'leads' ? 'Leads' : 'Merchants'}</td>
                        <td><span className="au-steps" title={plural(a.steps.length - 1, 'step')}><span>{a.steps.length - 1}</span>{kinds(a).map((k) => <Icon key={k} name={KIND_ICON[k]} width="14" height="14" aria-label={k} />)}</span></td>
                        <td className="ix-muted" style={{ whiteSpace: 'nowrap' }}>{a.lastRun ? whenText(a.lastRun, t) : 'Never'}</td>
                        <td className="ix-num"><span className="cm-fig">{num(a.c.d30)}</span></td>
                        <td className="ix-num"><span className={'cm-fig' + (a.c.f7 ? ' au-fail' : '')}>{a.c.f7 || '—'}</span></td>
                        <td><button type="button" role="switch" aria-checked={a.on} aria-label={(a.on ? 'Turn off ' : 'Turn on ') + a.name} className="gc-switch" onClick={() => flip([a.id], !a.on)}><span className="gc-switch__knob" /></button></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot"><span>{plural(rows.length, 'automation')} · {on.length} on</span></div>
        </section>
      </>
    );
  }

  const recent = live && runs ? data.automations.flatMap((a) => automationRuns(data, a, t).slice(0, 4).map((r) => ({ ...r, name: a.name, aid: a.id }))).sort((a, b) => b.at - a.at).slice(0, 25) : [];
  return (
    <AdminShell active="automations" title="Automations">
      <style dangerouslySetInnerHTML={{ __html: COMMS_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>
      <Sheet open={runs} title="Recent runs" onClose={() => setRuns(false)}>
        <div className="au-runs">
          {recent.length ? recent.map((r) => (
            <Link key={r.id} href={'/admin/automations/edit?id=' + r.aid + '&tab=runs'} className="au-run" style={{ textDecoration: 'none' }}>
              <span className="au-run__top"><span>{r.name}</span><StatusBadge tone={r.ok ? 'success' : 'error'}>{r.ok ? 'Sent' : 'Failed'}</StatusBadge></span>
              <span className="au-run__text">{whenText(r.at, t)} · {r.who} · {r.ok ? r.path : r.note}</span>
            </Link>
          )) : <p className="cm-empty">Nothing has run yet.</p>}
        </div>
      </Sheet>
    </AdminShell>
  );
}
