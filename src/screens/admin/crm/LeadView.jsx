'use client';
// Lead (/admin/leads/view?id=L-1049&tab=overview) — one sales lead on one page, laid out like the merchant record:
// RecordHeader (stage badge, Call / WhatsApp, the next step for the stage as the main button, everything else under
// More), then the tabs Overview · Activity · Notes · Tasks · Quotations · Meetings · Conversion history.
// Convert to merchant (a side panel prefilled from the lead) runs lib/platform/shops.js › provisionStore via
// crm.convertToMerchant, marks the lead Won with the new store id and links to /admin/merchant?id=.
// Tabs: crmLeadTabs.jsx · side panels: crmLeadSheets.jsx · shared parts: crmShared.jsx · data: lib/admin/crm.js.
// ?id= and ?tab= are read after mount; the tab is kept in the address.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { StatusBadge, EmptyState } from '@/components/ui';
import { RecordHeader, IndexTabs } from '@/components/ui/IndexKit';
import { dmy } from '@/lib/platform/util';
import { leadById, followState, isOpen, moveStage, stageOf } from '@/lib/admin/crm';
import { AdminShell } from '../AdminShell';
import { CRM_CSS, useCrm, StageBadge, LeadFormSheet, LostDialog, nextStep } from './crmShared';
import { LV_CSS, OverviewTab, ActivityTab, NotesTab, TasksTab, QuotesTab, MeetingsTab, HistoryTab } from './crmLeadTabs';
import { LeadSheets, SHEET_CSS } from './crmLeadSheets';

const TABS = [
  ['overview', 'Overview', OverviewTab], ['activity', 'Activity', ActivityTab], ['notes', 'Notes', NotesTab], ['tasks', 'Tasks', TasksTab],
  ['quotes', 'Quotations', QuotesTab], ['meetings', 'Meetings', MeetingsTab], ['history', 'Conversion history', HistoryTab],
];
const TAB_KEYS = TABS.map((x) => x[0]);
const ABOUT = 'One lead on one page: who they are, their business and needs, the package they would take, every call, WhatsApp, email and meeting, notes, tasks and quotations, and how it moved through the stages. The main button is the next step for its stage; Convert to merchant creates the store and marks the lead won.';
const CSS = CRM_CSS + LV_CSS + SHEET_CSS;

function Skeleton() {
  return (
    <div className="ix-page" aria-busy="true" aria-label="Loading the lead">
      <div className="lv-skel lv-skel--head" />
      <div className="lv-skel lv-skel--tabs" />
      <div className="ix-record"><div className="lv-skel" /><div className="lv-skel" /></div>
    </div>
  );
}

export default function LeadView() {
  const { t, live, me } = useCrm();
  const [q, setQ] = useState(null);           // { id, tab } from the address, after mount
  const [sheet, setSheet] = useState(null);   // { kind, n, …params }
  const [editing, setEditing] = useState(false);
  const [lostAsk, setLostAsk] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const id = (p.get('id') || '').trim().toUpperCase();
    const tab = TAB_KEYS.includes(p.get('tab')) ? p.get('tab') : 'overview';
    setQ({ id: /^\d+$/.test(id) ? 'L-' + id : id, tab });
  }, []);

  const go = (tab) => {
    setQ((x) => ({ ...x, tab }));
    try {
      const p = new URLSearchParams(window.location.search);
      p.set('id', q.id); p.set('tab', tab);
      window.history.replaceState(null, '', window.location.pathname + '?' + p.toString());
    } catch { /* ignore */ }
  };
  const open = (kind, params = {}) => {
    if (kind === 'edit') { setEditing(true); return; }
    if (kind === 'lost') { setLostAsk(true); return; }
    setSheet({ kind, n: Date.now(), ...params });
  };

  if (!live || !q) {
    return <AdminShell active="leads" title="Lead"><style dangerouslySetInnerHTML={{ __html: CSS }} /><Skeleton /></AdminShell>;
  }

  const l = q.id ? leadById(q.id) : null;
  if (!l) {
    return (
      <AdminShell active="leads" title="Lead">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/leads" backLabel="Back to leads" title="Lead" />
          <section className="ix-card">
            <EmptyState icon="target" title={q.id ? `No lead with the ID ${q.id}` : 'No lead picked'} body="Check the ID, or open the lead from the list." actionLabel="Back to leads" onAction={() => { window.location.href = '/admin/leads'; }} />
          </section>
        </div>
      </AdminShell>
    );
  }

  const ctx = { l, t, me, open, go };
  const fs = followState(l, t);
  const step = nextStep(l);
  const doStep = () => {
    if (!step) return;
    if (step.kind === 'log') { go('activity'); setTimeout(() => { const el = document.getElementById('lv-log-text'); if (el) el.focus(); }, 50); return; }
    if (step.kind === 'stage') {
      const r = moveStage(l.id, step.to);
      if (!r.ok) { toast(r.error); return; }
      toast(l.stage === 'lost' ? 'Lead reopened' : `Moved to ${stageOf(step.to).label}`);
      return;
    }
    if (step.kind === 'meetingDone') {
      const m = l.meetings.find((x) => !x.done);
      if (m) open('meetingDone', { mid: m.id });
      else { const r = moveStage(l.id, 'demodone'); toast(r.ok ? 'Moved to Demo done' : r.error); }
      return;
    }
    open(step.kind);
  };
  const primary = !step ? null
    : step.kind === 'merchant' ? { label: step.label, icon: step.icon, href: '/admin/merchant?id=' + l.merchantId }
      : { label: step.label, icon: step.icon, onClick: doStep };
  const tel = () => { window.location.href = 'tel:' + l.mobile.replace(/\D/g, ''); };
  const wa = () => { window.open('https://wa.me/88' + l.mobile.replace(/\D/g, ''), '_blank', 'noopener'); };
  const secondary = [{ label: 'Call', icon: 'phone', onClick: tel }, { label: 'WhatsApp', icon: 'message-circle', onClick: wa }];
  const canConvert = !l.merchantId && l.stage !== 'lost';
  const more = [
    { label: 'Edit lead', onClick: () => setEditing(true) },
    { label: 'Log activity', onClick: () => go('activity') },
    isOpen(l) ? { label: l.next ? 'Change follow-up' : 'Set follow-up', onClick: () => open('followup') } : null,
    { label: 'Add task', onClick: () => open('task') },
    { label: 'Create quotation', onClick: () => open('quote') },
    { label: 'Schedule meeting', onClick: () => open('meeting') },
    { label: 'Change salesperson', onClick: () => open('owner') },
    l.merchantId ? null : { label: 'Move to stage…', onClick: () => open('stage') },
    canConvert && (!step || step.kind !== 'convert') ? { label: 'Convert to merchant', onClick: () => open('convert') } : null,
    { label: 'Show in pipeline', href: '/admin/pipeline' },
    l.merchantId || l.stage === 'lost' ? null : { label: 'Mark lost', onClick: () => setLostAsk(true), tone: 'danger' },
  ].filter(Boolean);

  const Tab = (TABS.find((x) => x[0] === q.tab) || TABS[0])[2];
  const counts = {
    activity: l.activity.length || null, notes: l.notes.length || null, tasks: l.tasks.filter((x) => !x.done).length || null,
    quotes: l.quotes.length || null, meetings: l.meetings.length || null,
  };

  const lost = (reason, note) => {
    const r = moveStage(l.id, 'lost', { reason, note });
    if (!r.ok) { toast(r.error); return; }
    setLostAsk(false);
    toast(`Marked lost · ${reason}`);
  };
  const closeSheet = (res) => {
    setSheet(null);
    if (res && res.converted) go('history');
  };

  return (
    <AdminShell active="leads" title={l.business}>
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/leads" backLabel="Back to leads" title={l.business} about={ABOUT}
          badges={<>
            <StageBadge stage={l.stage} />
            {fs === 'overdue' ? <StatusBadge tone="warning" icon="clock-alert">Follow-up late</StatusBadge> : null}
          </>}
          meta={<><span className="crm-data">{l.id}</span> · {l.name} · {l.owner}</>}
          secondary={secondary} more={more} primary={primary} />

        {l.merchantId ? (
          <div className="lv-banner lv-banner--ok" role="status">
            <Icon name="store" width="18" height="18" aria-hidden="true" />
            <p>Became merchant <b className="crm-data">#{l.merchantId}</b> on {dmy(l.wonAt)}.</p>
            <Link className="ix-btn ix-btn--sm" href={'/admin/merchant?id=' + l.merchantId}>Open merchant</Link>
          </div>
        ) : l.stage === 'won' ? (
          <div className="lv-banner lv-banner--warn" role="status">
            <Icon name="store" width="18" height="18" aria-hidden="true" />
            <p>Won on {dmy(l.wonAt)}, but the store is not set up yet.</p>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('convert')}>Convert to merchant</button>
          </div>
        ) : l.stage === 'lost' ? (
          <div className="lv-banner lv-banner--err" role="status">
            <Icon name="circle-x" width="18" height="18" aria-hidden="true" />
            <p>Lost on {dmy(l.lostAt)} · {l.lostReason}</p>
          </div>
        ) : null}

        <section className="ix-card lv-tabs" aria-label="Sections">
          <IndexTabs label="Lead sections" tabs={TABS.map(([k, label]) => ({ key: k, id: 'lv-tab-' + k, label, count: counts[k], on: q.tab === k, onClick: () => go(k) }))} />
        </section>

        <div role="tabpanel" aria-labelledby={'lv-tab-' + q.tab} className="ix-page">
          <Tab ctx={ctx} />
        </div>
      </div>

      <LeadSheets sheet={sheet} l={l} t={t} close={closeSheet} askLost={() => setLostAsk(true)} />
      <LeadFormSheet open={editing} lead={l} me={me} t={t} onClose={() => setEditing(false)} />
      <LostDialog open={lostAsk} title={`Lost · ${l.business}`} onClose={() => setLostAsk(false)} onConfirm={lost} />
    </AdminShell>
  );
}
