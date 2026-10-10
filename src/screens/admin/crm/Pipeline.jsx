'use client';
// Pipeline (/admin/pipeline) — the leads as a board, one column per stage (New → Negotiation, then Won and Lost of the
// last 30 days), adapted from the merchant panel's Leads board. A card shows the business, the expected ৳ a month, the
// salesperson and the next follow-up; drag it to another column, or use its "Move" menu (keyboard and phones).
// Moving to Lost asks why. A compact forecast line sits above the board: open value, weighted forecast, won this month.
// Phones: a stage picker and that stage's cards (the board scrolls sideways inside its own box on wider screens).
// Data: lib/admin/crm.js (moveStage, forecast).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { InfoTip, EmptyState } from '@/components/ui';
import { ShopHeader, Menu } from '@/components/ui/IndexKit';
import { DAY, startOfMonth } from '@/lib/platform/util';
import { STAGES, SALES_NAMES, stageOf, isOpen, followState, forecast, moveStage } from '@/lib/admin/crm';
import { AdminShell } from '../AdminShell';
import { CRM_CSS, useCrm, money, plural, Who, StageBadge, nextText, FOLLOW_CLS, LeadFormSheet, LostDialog } from './crmShared';

const RECENT = 30 * DAY;   // Won and Lost columns show the last 30 days

const CSS = `
.pl-bar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2) var(--space-3);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.pl-fc{display:flex;flex-wrap:wrap;align-items:center;gap:4px var(--space-4);margin-left:auto;font-size:var(--text-sm);color:var(--text-body)}
.pl-fc b{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);color:var(--text-heading)}
.pl-fc>span{display:inline-flex;align-items:center;gap:4px;white-space:nowrap}
.pl-board{display:grid;grid-auto-flow:column;grid-auto-columns:minmax(232px,1fr);gap:var(--space-3);padding:var(--space-3);overflow-x:auto;overscroll-behavior-x:contain}
.pl-col{display:flex;flex-direction:column;gap:var(--space-2);min-height:240px;padding:var(--space-2);border-radius:var(--radius-xl);background:var(--surface-subtle);transition:outline-color .15s}
.pl-col.is-over{outline:2px dashed var(--primary);outline-offset:-2px}
.pl-col__head{display:flex;flex-direction:column;gap:2px;padding:2px 4px 4px}
.pl-col__top{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.pl-col__n{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.pl-col__sum{font-size:var(--text-xs);color:var(--text-muted)}
.pl-col__sum b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.pl-col__empty{margin:0;padding:var(--space-3) var(--space-2);font-size:var(--text-xs);color:var(--text-muted);text-align:center}
.pl-card{display:flex;flex-direction:column;gap:6px;padding:10px 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);box-shadow:var(--shadow-xs);cursor:grab}
.pl-card:hover{border-color:var(--border-strong)}
.pl-card.is-drag{opacity:.5}
.pl-card__top{display:flex;align-items:flex-start;justify-content:space-between;gap:var(--space-2)}
.pl-card__top a{min-width:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);text-decoration:none;overflow-wrap:anywhere}
.pl-card__top a:hover{color:var(--primary);text-decoration:underline}
.pl-card__top a:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.pl-card__val{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.pl-card__meta{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2);font-size:var(--text-xs);color:var(--text-muted)}
.pl-card__meta>span{display:inline-flex;align-items:center;gap:4px;min-width:0}
.pl-card__foot{display:flex;align-items:center;justify-content:space-between;gap:var(--space-2)}
.pl-card .ix-btn--sm{height:26px;padding:0 8px;font-size:var(--text-xs)}
.pl-phone{display:none}
.pl-phone__bar{display:flex;align-items:center;gap:var(--space-2);padding:8px 12px;border-bottom:1px solid var(--border-subtle)}
.pl-phone__bar .ix-pick{flex:1}
.pl-phone__list{display:flex;flex-direction:column;gap:var(--space-2);padding:var(--space-3)}
@media (max-width:640px){
  .pl-board{display:none}
  .pl-phone{display:block}
  .pl-fc{margin-left:0}
  .pl-card{cursor:default}
  .pl-card .ix-btn--sm{height:36px;padding:0 12px}
}
`;

function Card({ l, t, onMove, dragging, setDragging }) {
  const fs = followState(l, t);
  const items = STAGES.filter((s) => s.key !== l.stage).map((s) => ({ label: s.label, onClick: () => onMove(l, s.key), tone: s.key === 'lost' ? 'danger' : undefined }));
  return (
    <article className={'pl-card' + (dragging === l.id ? ' is-drag' : '')} draggable={!l.merchantId} aria-label={l.business}
      onDragStart={(e) => { e.dataTransfer.setData('text/plain', l.id); e.dataTransfer.effectAllowed = 'move'; setDragging(l.id); }}
      onDragEnd={() => setDragging('')}>
      <div className="pl-card__top">
        <Link href={'/admin/leads/view?id=' + l.id}>{l.business}</Link>
        <span className="pl-card__val">{money(l.value)}<span className="crm-sub" style={{ display: 'inline' }}>/mo</span></span>
      </div>
      <div className="pl-card__meta">
        <Who name={l.owner} />
        {isOpen(l) ? (
          <span className={FOLLOW_CLS[fs] || ''}><Icon name="clock" width="12" height="12" aria-hidden="true" />{l.next ? nextText(l, t) : 'No follow-up'}</span>
        ) : l.stage === 'won' ? (
          <span>{l.merchantId ? <>Store <span className="crm-data">#{l.merchantId}</span></> : 'Not set up yet'}</span>
        ) : <span title={l.lostReason || ''}>{(l.lostReason || '').split(' · ')[0]}</span>}
      </div>
      {l.merchantId ? null : (
        <div className="pl-card__foot">
          <span className="crm-sub ix-id">{l.id}</span>
          <Menu label="Move" icon="arrow-right-left" cls="ix-btn ix-btn--sm ix-btn--plain" items={items} />
        </div>
      )}
    </article>
  );
}

export default function Pipeline() {
  const router = useRouter();
  const { leads, t, live, me } = useCrm();
  const [owner, setOwner] = useState('');            // '' = everyone
  const [over, setOver] = useState('');
  const [dragging, setDragging] = useState('');
  const [lostFor, setLostFor] = useState(null);
  const [adding, setAdding] = useState(false);
  const [phoneStage, setPhoneStage] = useState('new');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const o = p.get('owner');
    if (o && SALES_NAMES.includes(o)) setOwner(o);
  }, []);
  const pickOwner = (o) => {
    setOwner(o);
    const p = new URLSearchParams(window.location.search);
    if (o) p.set('owner', o); else p.delete('owner');
    const s = p.toString();
    window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
  };

  const mine = leads.filter((l) => !owner || l.owner === owner);
  const shown = mine.filter((l) => isOpen(l) || (l.stage === 'won' ? l.wonAt : l.lostAt) >= t - RECENT);
  const cols = STAGES.map((s) => {
    const list = shown.filter((l) => l.stage === s.key).sort((a, b) => (isOpen(a)
      ? ((a.next || {}).at || Infinity) - ((b.next || {}).at || Infinity)
      : (b.wonAt || b.lostAt || 0) - (a.wonAt || a.lostAt || 0)));
    return { ...s, list, value: list.reduce((x, l) => x + (l.value || 0), 0) };
  });
  const fc = forecast(mine);
  const m0 = startOfMonth(t);
  const wonMonth = mine.filter((l) => l.stage === 'won' && l.wonAt >= m0);

  const move = (l, stage) => {
    if (stage === 'lost') { setLostFor(l); return; }
    const res = moveStage(l.id, stage);
    if (!res.ok) { toast(res.error); return; }
    toast(stage === 'won' ? `${l.business} won. Convert it to a merchant from its page.` : `${l.business} moved to ${stageOf(stage).label}`);
  };
  const drop = (stage) => (e) => {
    e.preventDefault();
    setOver(''); setDragging('');
    const id = e.dataTransfer.getData('text/plain');
    const l = leads.find((x) => x.id === id);
    if (l && l.stage !== stage) move(l, stage);
  };
  const lost = (reason, note) => {
    const res = moveStage(lostFor.id, 'lost', { reason, note });
    if (!res.ok) { toast(res.error); return; }
    toast(`${lostFor.business} marked lost · ${reason}`);
    setLostFor(null);
  };

  const ownerOptions = [['', 'Everyone'], ...SALES_NAMES.map((n) => [n, n === me ? n + ' (me)' : n])];
  const phoneCol = cols.find((c) => c.key === phoneStage) || cols[0];

  let body;
  if (!live) {
    body = <div className="crm-skel" aria-busy="true" aria-label="Loading the pipeline" />;
  } else {
    body = (
      <section className="ix-card" aria-label="Pipeline">
        <div className="pl-bar">
          <span className="ix-chips" role="group" aria-label="Whose leads" style={{ flexWrap: 'nowrap' }}>
            <button type="button" className="ix-chip" aria-pressed={owner === me && !!me} onClick={() => pickOwner(me && SALES_NAMES.includes(me) ? me : '')} disabled={!SALES_NAMES.includes(me)}>Mine</button>
            <select className="ix-pick" aria-label="Salesperson" value={owner} onChange={(e) => pickOwner(e.target.value)}>
              {ownerOptions.map(([v, label]) => <option key={v} value={v}>{label}</option>)}
            </select>
          </span>
          <div className="pl-fc" aria-label="Forecast">
            <span>Open <b>{money(fc.value)}</b>/mo · {plural(fc.count, 'lead')}</span>
            <span>Forecast <b>{money(fc.weighted)}</b>/mo<InfoTip label="How the forecast is worked out" text="Each open lead’s expected subscription × its stage’s chance: New 5%, Contacted 10%, Qualified 20%, Demo scheduled 30%, Demo done 45%, Proposal sent 60%, Negotiation 75%." /></span>
            <span>Won this month <b>{money(wonMonth.reduce((x, l) => x + l.value, 0))}</b>/mo · {wonMonth.length}</span>
          </div>
        </div>

        <div className="pl-board" role="list" aria-label="Stages">
          {cols.map((c) => (
            <div key={c.key} role="listitem" className={'pl-col' + (over === c.key ? ' is-over' : '')} aria-label={`${c.label}, ${plural(c.list.length, 'lead')}`}
              onDragOver={(e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; if (over !== c.key) setOver(c.key); }}
              onDragLeave={(e) => { if (!e.currentTarget.contains(e.relatedTarget)) setOver(''); }}
              onDrop={drop(c.key)}>
              <header className="pl-col__head">
                <span className="pl-col__top"><StageBadge stage={c.key} /><span className="pl-col__n">{c.list.length}</span></span>
                <span className="pl-col__sum"><b>{money(c.value)}</b>/mo{isOpen({ stage: c.key }) ? '' : ' · last 30 days'}</span>
              </header>
              {c.list.length ? c.list.map((l) => <Card key={l.id} l={l} t={t} onMove={move} dragging={dragging} setDragging={setDragging} />)
                : <p className="pl-col__empty">{isOpen({ stage: c.key }) ? 'Drop a lead here' : 'None in 30 days'}</p>}
            </div>
          ))}
        </div>

        <div className="pl-phone">
          <div className="pl-phone__bar">
            <label className="sr-only" htmlFor="pl-stage">Stage</label>
            <select id="pl-stage" className="ix-pick" value={phoneStage} onChange={(e) => setPhoneStage(e.target.value)}>
              {cols.map((c) => <option key={c.key} value={c.key}>{c.label} · {c.list.length} · {money(c.value)}/mo</option>)}
            </select>
          </div>
          {phoneCol.list.length ? (
            <div className="pl-phone__list">{phoneCol.list.map((l) => <Card key={l.id} l={l} t={t} onMove={move} dragging="" setDragging={() => {}} />)}</div>
          ) : <div className="ix-empty"><EmptyState icon="kanban" title={`No leads in ${phoneCol.label}.`} actionLabel="Add lead" onAction={() => setAdding(true)} /></div>}
        </div>
      </section>
    );
  }

  return (
    <AdminShell active="pipeline" title="Pipeline">
      <style dangerouslySetInnerHTML={{ __html: CRM_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="kanban" title="Pipeline"
          about="Every open lead by stage, with the expected subscription a month. Drag a card to the next stage or use its Move menu; Won and Lost show the last 30 days. The forecast weighs each lead by how likely its stage is to close."
          secondary={[{ label: 'List view', icon: 'list', href: '/admin/leads' }]}
          primary={{ label: 'Add lead', icon: 'plus', onClick: () => setAdding(true) }} />
        {body}
      </div>
      <LeadFormSheet open={adding} me={me} t={t} onClose={() => setAdding(false)} onDone={(l) => router.push('/admin/leads/view?id=' + l.id)} />
      <LostDialog open={!!lostFor} title={lostFor ? `Lost · ${lostFor.business}` : 'Lost'} onClose={() => setLostFor(null)} onConfirm={lost} />
    </AdminShell>
  );
}
