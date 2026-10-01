'use client';
// Leads & follow-ups (/sales-leads) — people and shops who might buy (src/lib/leads.js):
//   Follow-ups: overdue, today and coming, with a quick "log the call and set the next one"
//   Pipeline: a board by stage (drag a card to move it) · List: every lead with filters
// A lead opens with its details, history, next follow-up, call / WhatsApp, move stage, won (adds the customer) or lost.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, EmptyState } from '@/components/ui';
import { formatBDT, formatDate, formatTime } from '@/lib/format';
import { USERS, roleOf } from '@/lib/team';
import { STAGES, OPEN_STAGES, SOURCES, KINDS, LOG_KINDS, LOST_REASONS, STAGE_WEIGHT, stageOf, saveLead, logActivity, moveStage, removeLead, followState } from '@/lib/leads';
import { saveTask } from '@/lib/tasks';
import { TeamPage, useMe, useLeads, UserAvatar, userName } from './teamShared';

const money = (n) => formatBDT(Math.round(n || 0));
const CSS = `
.ld-board{display:grid;grid-template-columns:repeat(6,minmax(220px,1fr));gap:var(--space-3);padding:var(--space-4) var(--space-5) var(--space-5);overflow-x:auto}
.ld-col{display:flex;flex-direction:column;gap:var(--space-2);min-height:220px;padding:var(--space-3);border-radius:var(--radius-xl);background:var(--surface-subtle)}
.ld-col.is-over{outline:2px dashed var(--primary);outline-offset:-2px}
.ld-col > header{display:flex;flex-direction:column;gap:2px}
.ld-col > header b{display:flex;justify-content:space-between;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ld-card{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-card);text-align:left;font:inherit;cursor:grab}
.ld-card:hover{border-color:var(--primary)}
.ld-card b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.ld-follow{display:flex;flex-direction:column}
.ld-fu{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-5);border-bottom:1px solid var(--border-subtle)}
.ld-fu__when{width:92px;flex:none;font-size:var(--text-xs)}
.ld-fu__when b{display:block;font-family:var(--font-data);font-size:var(--text-sm);color:var(--text-heading)}
.ld-fu__main{flex:1 1 260px;min-width:0}
.ld-tl{margin:0;padding:0;list-style:none;display:flex;flex-direction:column;gap:var(--space-3)}
.ld-tl li{display:flex;gap:var(--space-3);font-size:var(--text-sm)}
.ld-tl .tm-tile{width:30px;height:30px}
.ld-src{display:grid;grid-template-columns:minmax(0,1fr) 120px 80px;gap:var(--space-3);align-items:center;font-size:var(--text-sm);padding:6px 0}
.ld-src i{display:block;height:6px;border-radius:var(--radius-full);background:var(--primary)}
.ld-split{display:grid;grid-template-columns:minmax(0,2fr) minmax(280px,1fr);gap:var(--space-4);align-items:start}
@media (max-width:1100px){.ld-split{grid-template-columns:minmax(0,1fr)}}
`;
const DAY = 864e5;
const toLocal = (t) => { const d = new Date(t); const p = (n) => String(n).padStart(2, '0'); return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`; };
const waOf = (phone) => 'https://wa.me/88' + String(phone).replace(/\D/g, '');

export default function SalesLeads() {
  const { me } = useMe();
  const { leads, ready } = useLeads();
  const now = Date.now();
  const allSee = roleOf(me).access === '*' || ['online-sales', 'shop-manager'].includes(me.role);
  const [view, setView] = useState('follow');
  const [mine, setMine] = useState(false);
  const [q, setQ] = useState('');
  const [src, setSrc] = useState('');
  const [kind, setKind] = useState('');
  const [openId, setOpenId] = useState('');
  const [draft, setDraft] = useState(null);
  const [over, setOver] = useState('');
  const [lostFor, setLostFor] = useState(null);

  useEffect(() => { if (ready) { setMine(!allSee); const p = new URLSearchParams(window.location.search); if (p.get('lead')) setOpenId(p.get('lead')); if (p.get('view')) setView(p.get('view')); } }, [ready]); // eslint-disable-line react-hooks/exhaustive-deps

  const needle = q.trim().toLowerCase();
  const list = useMemo(() => leads.filter((l) => (!mine || l.owner === me.id) && (!src || l.source === src) && (!kind || l.kind === kind)
    && (!needle || `${l.name} ${l.company} ${l.phone} ${l.interest} ${l.id}`.toLowerCase().includes(needle))), [leads, mine, me.id, src, kind, needle]);
  const open = list.filter((l) => OPEN_STAGES.includes(l.stage));
  const lastWon = (l) => (l.log.filter((x) => x.kind === 'stage' && /Won|customers|Bought/i.test(x.text)).slice(-1)[0] || {}).at || l.at;
  const won = list.filter((l) => l.stage === 'won');
  const closed = list.filter((l) => l.stage === 'won' || l.stage === 'lost');
  const due = open.filter((l) => ['overdue', 'today'].includes(followState(l, now)));
  const lead = leads.find((l) => l.id === openId) || null;

  const move = (l, stage) => {
    if (stage === 'lost') { setLostFor(l); return; }
    const c = moveStage(l.id, stage, { by: me.id });
    toast(stage === 'won' ? `${l.name} won${c ? ' and added to customers' : ''}. Well done!` : `${l.name} moved to ${stageOf(stage)[1]}.`);
  };
  const drop = (stage) => (e) => { e.preventDefault(); setOver(''); const l = leads.find((x) => x.id === e.dataTransfer.getData('text/plain')); if (l && l.stage !== stage) move(l, stage); };
  const create = (e) => {
    e.preventDefault();
    if (!draft.name.trim()) { toast('Enter a name', { tone: 'error' }); return; }
    if (!/^01[3-9]\d{2}-?[\dX]{6}$/.test(draft.phone.replace(/\s/g, ''))) { toast('Phone looks wrong — use 01XXX-XXXXXX', { tone: 'error' }); return; }
    if (leads.some((l) => l.phone.replace(/\D/g, '') === draft.phone.replace(/\D/g, '') && OPEN_STAGES.includes(l.stage))) { toast('This number is already an open lead', { tone: 'error' }); return; }
    const { followAt, followWhat, ...row } = draft;
    const saved = saveLead({ ...row, name: row.name.trim(), next: followAt ? { at: new Date(followAt).getTime(), what: followWhat || 'Follow up' } : null }, me.id);
    toast(`${saved.name} added as ${saved.id}.`);
    setDraft(null);
  };
  const newLead = () => setDraft({ name: '', company: '', phone: '', source: 'Facebook', kind: 'Retail', interest: '', value: '', owner: me.id, area: '', followAt: toLocal(now + 2 * 3600e3), followWhat: 'First call' });

  const sources = SOURCES.map((s) => { const ls = list.filter((l) => l.source === s); return { s, n: ls.length, value: ls.reduce((a, l) => a + l.value, 0), won: ls.filter((l) => l.stage === 'won').length }; }).filter((x) => x.n).sort((a, b) => b.value - a.value);
  const maxSrc = Math.max(1, ...sources.map((x) => x.value));

  return (
    <TeamPage screen="SalesLeads" active="leads" crumb="General" page="Leads & follow-ups" title="Leads & follow-ups" css={CSS}
      description="People and shops who might buy — call them back on time and move them to won."
      actions={<button type="button" className="gc-btn gc-btn--solid" onClick={newLead}><Icon name="plus" width="18" height="18" aria-hidden="true" /> New lead</button>}>
      <div className="gc-kpis">
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-primary-soft)', color: 'var(--primary)' }}><Icon name="target" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Open leads</p><p className="gc-kpi__value">{open.length}<small>{money(open.reduce((a, l) => a + l.value, 0))} in play</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-info-soft)', color: 'var(--text-info)' }}><Icon name="scale" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Likely to win</p><p className="gc-kpi__value">{money(open.reduce((a, l) => a + l.value * STAGE_WEIGHT[l.stage], 0))}<small>weighted by stage</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: due.length ? 'var(--fill-error-soft)' : 'var(--fill-success-soft)', color: due.length ? 'var(--text-danger)' : 'var(--text-success)' }}><Icon name="phone-call" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Follow-ups due</p><p className="gc-kpi__value">{due.length}<small>{open.filter((l) => followState(l, now) === 'overdue').length} overdue</small></p></div></div>
        <div className="gc-kpi"><span className="gc-kpi__icon" style={{ background: 'var(--fill-success-soft)', color: 'var(--text-success)' }}><Icon name="trophy" width="24" height="24" aria-hidden="true" /></span><div className="gc-kpi__text"><p className="gc-kpi__label">Won in 30 days</p><p className="gc-kpi__value">{won.filter((l) => lastWon(l) >= now - 30 * DAY).length}<small>win rate {closed.length ? Math.round((won.length / closed.length) * 100) : 0}% of closed</small></p></div></div>
      </div>

      <section className="gc-card" style={{ padding: 0, overflow: 'hidden' }}>
        <div className="tm-bar">
          <div className="tm-bar__g">
            <div className="gc-seg" role="group" aria-label="View">
              {[['follow', `Follow-ups · ${due.length}`], ['board', 'Pipeline'], ['list', 'List']].map(([k, l]) => <button key={k} type="button" className={'gc-seg__btn' + (view === k ? ' gc-seg__btn--active' : '')} aria-pressed={view === k} onClick={() => setView(k)}>{l}</button>)}
            </div>
            <div className="gc-seg" role="group" aria-label="Whose leads">
              <button type="button" className={'gc-seg__btn' + (mine ? ' gc-seg__btn--active' : '')} aria-pressed={mine} onClick={() => setMine(true)}>Mine</button>
              <button type="button" className={'gc-seg__btn' + (!mine ? ' gc-seg__btn--active' : '')} aria-pressed={!mine} onClick={() => setMine(false)}>Everyone</button>
            </div>
          </div>
          <div className="tm-bar__g">
            <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Source" value={src} onChange={(e) => setSrc(e.target.value)}><option value="">All sources</option>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select>
            <select className="gc-input gc-select" style={{ width: 'auto' }} aria-label="Kind" value={kind} onChange={(e) => setKind(e.target.value)}><option value="">All kinds</option>{KINDS.map((s) => <option key={s}>{s}</option>)}</select>
            <input type="search" className="gc-input" style={{ width: 220 }} placeholder="Name, shop, phone" aria-label="Search leads" value={q} onChange={(e) => setQ(e.target.value)} />
          </div>
        </div>

        {view === 'follow' ? (
          <div className="ld-follow">
            {[['overdue', 'Overdue'], ['today', 'Today'], ['soon', 'Next 2 days'], ['later', 'Later'], ['none', 'No follow-up set']].map(([k, label]) => {
              const rows = open.filter((l) => followState(l, now) === k).sort((a, b) => ((a.next || {}).at || 0) - ((b.next || {}).at || 0));
              if (!rows.length) return null;
              return (
                <div key={k}>
                  <h3 style={{ margin: 0, padding: 'var(--space-3) var(--space-5)', fontSize: 'var(--text-xs)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-label)', textTransform: 'uppercase', color: k === 'overdue' ? 'var(--text-danger)' : 'var(--text-muted)', background: 'var(--surface-subtle)' }}>{label} · {rows.length}</h3>
                  {rows.map((l) => (
                    <div key={l.id} className="ld-fu">
                      <div className="ld-fu__when">{l.next ? <><b className={k === 'overdue' ? 'tm-out' : ''}>{formatTime(l.next.at)}</b><span className="tm-sub">{k === 'today' ? 'Today' : formatDate(l.next.at)}</span></> : <span className="tm-sub">—</span>}</div>
                      <div className="ld-fu__main">
                        <button type="button" className="gc-btn gc-btn--flat" style={{ height: 'auto', minHeight: 32, padding: 0, textAlign: 'left' }} onClick={() => setOpenId(l.id)}><span className="tm-strong">{l.name}{l.company ? ` · ${l.company}` : ''}</span></button>
                        <span className="tm-sub">{l.next ? l.next.what : 'Set a follow-up'} · {stageOf(l.stage)[1]} · {money(l.value)} · {l.source}</span>
                      </div>
                      <UserAvatar id={l.owner} size={28} />
                      <div className="tm-bar__g">
                        <a className="gc-btn gc-btn--sm gc-btn--neutral" href={'tel:' + l.phone.replace(/\D/g, '')} aria-label={`Call ${l.name}`}><Icon name="phone" width="14" height="14" aria-hidden="true" /></a>
                        <a className="gc-btn gc-btn--sm gc-btn--neutral" href={waOf(l.phone)} target="_blank" rel="noreferrer" aria-label={`WhatsApp ${l.name}`}><Icon name="message-circle" width="14" height="14" aria-hidden="true" /></a>
                        <button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={() => setOpenId(l.id)}>Log it</button>
                      </div>
                    </div>
                  ))}
                </div>
              );
            })}
            {!open.length ? <EmptyState icon="target" title="No open leads" body="Add one from a call, a message or a walk-in." actionLabel="New lead" onAction={newLead} /> : null}
          </div>
        ) : view === 'board' ? (
          <div className="ld-board">
            {STAGES.map(([k, label, tone, help]) => {
              const col = list.filter((l) => l.stage === k);
              return (
                <div key={k} className={'ld-col' + (over === k ? ' is-over' : '')} onDragOver={(e) => { e.preventDefault(); setOver(k); }} onDragLeave={() => setOver('')} onDrop={drop(k)}>
                  <header><b><span><span className={'gc-badge gc-badge--' + tone}>{label}</span></span><span className="tm-fig">{col.length}</span></b><span className="tm-sub">{money(col.reduce((a, l) => a + l.value, 0))} · {help}</span></header>
                  {col.map((l) => {
                    const fs = followState(l, now);
                    return (
                      <button key={l.id} type="button" className="ld-card" draggable onDragStart={(e) => e.dataTransfer.setData('text/plain', l.id)} onClick={() => setOpenId(l.id)}>
                        <b>{l.name}</b>
                        {l.company ? <span className="tm-sub">{l.company}</span> : null}
                        <span className="tm-fig tm-strong">{money(l.value)}</span>
                        <span className="tm-sub">{l.kind} · {l.source}</span>
                        {l.next && OPEN_STAGES.includes(l.stage) ? <span className={'tm-sub' + (fs === 'overdue' ? ' tm-out' : fs === 'today' ? ' tm-warn' : '')}><Icon name="clock" width="12" height="12" aria-hidden="true" /> {fs === 'today' ? `Today ${formatTime(l.next.at)}` : formatDate(l.next.at)}</span> : null}
                        {l.stage === 'lost' && l.lost ? <span className="tm-sub">{l.lost}</span> : null}
                        <span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserAvatar id={l.owner} size={22} /><span className="tm-sub">{userName(l.owner).split(' ')[0]}</span></span>
                      </button>
                    );
                  })}
                </div>
              );
            })}
          </div>
        ) : (
          list.length ? (
            <div className="gc-table-wrap">
              <table className="gc-table gc-table--compact gc-table--hoverable">
                <thead><tr><th scope="col">Lead</th><th scope="col">Wants</th><th scope="col">Source</th><th scope="col">Stage</th><th scope="col" className="tm-fig" style={{ textAlign: 'right' }}>Value</th><th scope="col">Next</th><th scope="col">Owner</th></tr></thead>
                <tbody>{list.map((l) => { const [, sl, tone] = stageOf(l.stage); const fs = followState(l, now); return (
                  <tr key={l.id} onClick={() => setOpenId(l.id)} style={{ cursor: 'pointer' }}>
                    <td><span className="tm-strong">{l.name}</span><span className="tm-sub">{l.company || l.kind} · {l.phone}</span></td>
                    <td style={{ maxWidth: 260, whiteSpace: 'normal' }}><span className="tm-sub">{l.interest}</span></td>
                    <td>{l.source}</td>
                    <td><span className={'gc-badge gc-badge--' + tone}>{sl}</span></td>
                    <td className="tm-fig" style={{ textAlign: 'right' }}>{money(l.value)}</td>
                    <td className={fs === 'overdue' ? 'tm-out' : fs === 'today' ? 'tm-warn' : ''}>{l.next && OPEN_STAGES.includes(l.stage) ? formatDate(l.next.at) : '—'}</td>
                    <td><span style={{ display: 'flex', alignItems: 'center', gap: 6 }}><UserAvatar id={l.owner} size={24} />{userName(l.owner).split(' ')[0]}</span></td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          ) : <EmptyState icon="search-x" title="No leads match" body="Try another filter." />
        )}
      </section>

      <div className="ld-split">
        <section className="gc-card" style={{ padding: 0 }}>
          <div className="tm-head"><div><h2>Where leads come from</h2><p>Value of every lead by source, and how many were won.</p></div></div>
          <div style={{ padding: '0 var(--space-5) var(--space-5)' }}>
            {sources.map((x) => <div key={x.s} className="ld-src"><span>{x.s}<span className="tm-sub">{x.n} lead{x.n === 1 ? '' : 's'} · {x.won} won</span></span><span><i style={{ width: `${(x.value / maxSrc) * 100}%` }} /></span><span className="tm-fig" style={{ textAlign: 'right' }}>{money(x.value)}</span></div>)}
          </div>
        </section>
        <section className="gc-card" style={{ padding: 0 }}>
          <div className="tm-head"><div><h2>Team</h2><p>Open leads and follow-ups due per person.</p></div></div>
          <div style={{ padding: '0 var(--space-5) var(--space-5)', display: 'flex', flexDirection: 'column', gap: 'var(--space-2)' }}>
            {USERS.filter((u) => leads.some((l) => l.owner === u.id)).map((u) => { const ls = leads.filter((l) => l.owner === u.id && OPEN_STAGES.includes(l.stage)); return <div key={u.id} style={{ display: 'flex', alignItems: 'center', gap: 'var(--space-2)' }}><UserAvatar id={u.id} /><span style={{ flex: 1, minWidth: 0 }}><span className="tm-strong">{u.name}</span><span className="tm-sub">{roleOf(u).title}</span></span><span className="tm-sub" style={{ textAlign: 'right' }}>{ls.length} open · <span className={ls.some((l) => followState(l, now) === 'overdue') ? 'tm-out' : ''}>{ls.filter((l) => ['overdue', 'today'].includes(followState(l, now))).length} due</span></span></div>; })}
          </div>
        </section>
      </div>

      {lead ? <LeadDialog lead={lead} me={me} onMove={move} onClose={() => setOpenId('')} /> : null}
      <Dialog open={!!lostFor} title={lostFor ? `Lost · ${lostFor.name}` : 'Lost'} onClose={() => setLostFor(null)} width={460}
        footer={null}>
        {lostFor ? (
          <div className="tm-form">
            <p className="gc-help" style={{ margin: 0 }}>Why didn’t they buy? It helps to see patterns later.</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 'var(--space-2)' }}>{LOST_REASONS.map((r) => <button key={r} type="button" className="gc-btn gc-btn--neutral gc-btn--sm" onClick={() => { moveStage(lostFor.id, 'lost', { by: me.id, reason: r }); toast(`${lostFor.name} marked lost · ${r}.`); setLostFor(null); }}>{r}</button>)}</div>
          </div>
        ) : null}
      </Dialog>
      <Dialog open={!!draft} title="New lead" onClose={() => setDraft(null)} width={640}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setDraft(null)}>Cancel</button><button type="submit" form="ld-new" className="gc-btn gc-btn--solid">Add lead</button></>}>
        {draft ? (
          <form id="ld-new" className="tm-form" onSubmit={create}>
            <div className="tm-two">
              <div><label className="gc-label" htmlFor="ld-name">Name</label><input id="ld-name" className="gc-input" value={draft.name} onChange={(e) => setDraft({ ...draft, name: e.target.value })} data-autofocus /></div>
              <div><label className="gc-label" htmlFor="ld-phone">Mobile</label><input id="ld-phone" className="gc-input tm-fig" inputMode="tel" placeholder="01XXX-XXXXXX" value={draft.phone} onChange={(e) => setDraft({ ...draft, phone: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="ld-co">Shop or company</label><input id="ld-co" className="gc-input" value={draft.company} onChange={(e) => setDraft({ ...draft, company: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="ld-area">Area</label><input id="ld-area" className="gc-input" value={draft.area} onChange={(e) => setDraft({ ...draft, area: e.target.value })} /></div>
            </div>
            <div className="tm-three">
              <div><label className="gc-label" htmlFor="ld-src">Came from</label><select id="ld-src" className="gc-input gc-select" value={draft.source} onChange={(e) => setDraft({ ...draft, source: e.target.value })}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="ld-kind">Kind</label><select id="ld-kind" className="gc-input gc-select" value={draft.kind} onChange={(e) => setDraft({ ...draft, kind: e.target.value })}>{KINDS.map((s) => <option key={s}>{s}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="ld-val">Likely value (৳)</label><input id="ld-val" className="gc-input tm-fig" inputMode="numeric" value={draft.value} onChange={(e) => setDraft({ ...draft, value: e.target.value.replace(/\D/g, '') })} /></div>
            </div>
            <div><label className="gc-label" htmlFor="ld-int">What they want</label><input id="ld-int" className="gc-input" value={draft.interest} onChange={(e) => setDraft({ ...draft, interest: e.target.value })} placeholder="e.g. 50 cartons of atta every month" /></div>
            <div className="tm-three">
              <div><label className="gc-label" htmlFor="ld-own">Owner</label><select id="ld-own" className="gc-input gc-select" value={draft.owner} onChange={(e) => setDraft({ ...draft, owner: e.target.value })}>{USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
              <div><label className="gc-label" htmlFor="ld-fat">Follow up</label><input id="ld-fat" type="datetime-local" className="gc-input" value={draft.followAt} onChange={(e) => setDraft({ ...draft, followAt: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="ld-fw">To do</label><input id="ld-fw" className="gc-input" value={draft.followWhat} onChange={(e) => setDraft({ ...draft, followWhat: e.target.value })} /></div>
            </div>
          </form>
        ) : null}
      </Dialog>
    </TeamPage>
  );
}

function LeadDialog({ lead, me, onMove, onClose }) {
  const [log, setLog] = useState({ kind: 'call', text: '', nextAt: toLocal(Date.now() + DAY), nextWhat: '', setNext: true });
  const [edit, setEdit] = useState(null);
  const [, sl, tone] = stageOf(lead.stage);
  const isOpen = OPEN_STAGES.includes(lead.stage);
  const submit = (e) => {
    e.preventDefault();
    if (!log.text.trim()) { toast('Write what happened', { tone: 'error' }); return; }
    logActivity(lead.id, { kind: log.kind, text: log.text.trim(), by: me.id, next: isOpen ? (log.setNext ? { at: new Date(log.nextAt).getTime(), what: log.nextWhat.trim() || 'Follow up' } : null) : undefined });
    toast(log.setNext && isOpen ? `Saved. Next follow-up ${formatDate(new Date(log.nextAt).getTime())} ${formatTime(new Date(log.nextAt).getTime())}.` : 'Saved.');
    setLog({ ...log, text: '', nextWhat: '' });
  };
  const saveEdit = (e) => { e.preventDefault(); saveLead({ id: lead.id, name: edit.name.trim(), company: edit.company, phone: edit.phone, area: edit.area, interest: edit.interest, value: edit.value, kind: edit.kind, source: edit.source, owner: edit.owner }); toast('Lead saved.'); setEdit(null); };
  const task = () => { const t = saveTask({ title: `Follow up ${lead.name}${lead.company ? ' · ' + lead.company : ''}`, assignee: lead.owner, by: me.id, due: lead.next ? new Date(lead.next.at).toISOString().slice(0, 10) : '', priority: 'high', area: 'Sales', notes: lead.next ? lead.next.what : lead.interest, link: { href: `/sales-leads?lead=${lead.id}`, label: lead.id } }); toast(`Task ${t.id} added for ${userName(lead.owner)}.`); };
  const remove = async () => { if (await confirmDialog({ title: `Delete ${lead.name}?`, body: 'The lead and its history go for good.', confirmLabel: 'Delete', tone: 'danger' })) { removeLead(lead.id); toast('Lead deleted.'); onClose(); } };
  return (
    <Dialog open title={`${lead.name}${lead.company ? ' · ' + lead.company : ''}`} onClose={onClose} width={760}
      footer={edit ? <><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button><button type="submit" form="ld-edit" className="gc-btn gc-btn--solid">Save</button></> : <><button type="button" className="gc-btn gc-btn--flat" onClick={remove}><Icon name="trash-2" width="16" height="16" aria-hidden="true" /> Delete</button><button type="button" className="gc-btn gc-btn--neutral" onClick={task}><Icon name="list-plus" width="16" height="16" aria-hidden="true" /> Make a task</button><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit({ ...lead })}><Icon name="pencil" width="16" height="16" aria-hidden="true" /> Edit</button></>}>
      {edit ? (
        <form id="ld-edit" className="tm-form" onSubmit={saveEdit}>
          <div className="tm-two">
            {[['name', 'Name'], ['phone', 'Mobile'], ['company', 'Shop or company'], ['area', 'Area']].map(([k, l]) => <div key={k}><label className="gc-label" htmlFor={'le-' + k}>{l}</label><input id={'le-' + k} className="gc-input" value={edit[k] || ''} onChange={(e) => setEdit({ ...edit, [k]: e.target.value })} /></div>)}
          </div>
          <div className="tm-three">
            <div><label className="gc-label" htmlFor="le-src">Came from</label><select id="le-src" className="gc-input gc-select" value={edit.source} onChange={(e) => setEdit({ ...edit, source: e.target.value })}>{SOURCES.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="le-kind">Kind</label><select id="le-kind" className="gc-input gc-select" value={edit.kind} onChange={(e) => setEdit({ ...edit, kind: e.target.value })}>{KINDS.map((s) => <option key={s}>{s}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="le-val">Likely value (৳)</label><input id="le-val" className="gc-input tm-fig" inputMode="numeric" value={edit.value} onChange={(e) => setEdit({ ...edit, value: e.target.value.replace(/\D/g, '') })} /></div>
          </div>
          <div><label className="gc-label" htmlFor="le-int">What they want</label><input id="le-int" className="gc-input" value={edit.interest} onChange={(e) => setEdit({ ...edit, interest: e.target.value })} /></div>
          <div><label className="gc-label" htmlFor="le-own">Owner</label><select id="le-own" className="gc-input gc-select" value={edit.owner} onChange={(e) => setEdit({ ...edit, owner: e.target.value })}>{USERS.map((u) => <option key={u.id} value={u.id}>{u.name}</option>)}</select></div>
        </form>
      ) : (
        <div className="tm-form">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 'var(--space-2)' }}>
            <span className={'gc-badge gc-badge--' + tone}>{sl}</span>
            <span className="gc-badge gc-badge--slate">{lead.id}</span>
            <span className="tm-fig tm-strong">{formatBDT(lead.value)}</span>
            <span className="tm-sub" style={{ display: 'inline' }}>{lead.kind} · {lead.source} · {lead.area || '—'} · owner {userName(lead.owner)}</span>
          </div>
          <p style={{ margin: 0, fontSize: 'var(--text-sm)' }}>{lead.interest}</p>
          <div className="tm-bar__g">
            <a className="gc-btn gc-btn--sm gc-btn--neutral" href={'tel:' + lead.phone.replace(/\D/g, '')}><Icon name="phone" width="14" height="14" aria-hidden="true" /> {lead.phone}</a>
            <a className="gc-btn gc-btn--sm gc-btn--neutral" href={waOf(lead.phone)} target="_blank" rel="noreferrer"><Icon name="message-circle" width="14" height="14" aria-hidden="true" /> WhatsApp</a>
            {lead.customer ? <Link className="gc-btn gc-btn--sm gc-btn--neutral" href="/all-customers"><Icon name="user-check" width="14" height="14" aria-hidden="true" /> Customer</Link> : null}
          </div>
          <div>
            <span className="gc-label">Stage</span>
            <div role="group" aria-label="Stage" style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
              {STAGES.map(([k, l]) => <button key={k} type="button" className={'gc-btn gc-btn--sm ' + (lead.stage === k ? 'gc-btn--solid' : 'gc-btn--neutral')} aria-pressed={lead.stage === k} onClick={() => onMove(lead, k)}>{l}</button>)}
            </div>
          </div>
          {isOpen ? <div style={{ display: 'flex', gap: 8, alignItems: 'center', padding: 'var(--space-3) var(--space-4)', borderRadius: 'var(--radius-lg)', background: 'var(--fill-info-soft)', color: 'var(--text-info)', fontSize: 'var(--text-sm)' }}><Icon name="clock" width="16" height="16" aria-hidden="true" />{lead.next ? <span>Next: <b>{lead.next.what}</b> · {formatDate(lead.next.at)} {formatTime(lead.next.at)}</span> : <span>No follow-up set — add one below.</span>}</div> : null}
          <form className="gc-card" style={{ padding: 'var(--space-4)', display: 'flex', flexDirection: 'column', gap: 'var(--space-3)', boxShadow: 'none', border: '1px solid var(--border-subtle)' }} onSubmit={submit}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }} role="group" aria-label="What happened">{Object.entries(LOG_KINDS).filter(([k]) => k !== 'stage').map(([k, [l, ic]]) => <button key={k} type="button" className={'gc-btn gc-btn--sm ' + (log.kind === k ? 'gc-btn--solid' : 'gc-btn--neutral')} aria-pressed={log.kind === k} onClick={() => setLog({ ...log, kind: k })}><Icon name={ic} width="14" height="14" aria-hidden="true" /> {l}</button>)}</div>
            <div><label className="gc-label" htmlFor="ld-txt">What happened</label><input id="ld-txt" className="gc-input" value={log.text} onChange={(e) => setLog({ ...log, text: e.target.value })} placeholder="e.g. Called — wants the price for 100 cartons" /></div>
            {isOpen ? (
              <div className="tm-three" style={{ alignItems: 'end' }}>
                <label style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-sm)', minHeight: 44 }}><input type="checkbox" className="gc-check" checked={log.setNext} onChange={(e) => setLog({ ...log, setNext: e.target.checked })} /> Next follow-up</label>
                <div><label className="gc-label" htmlFor="ld-nat">When</label><input id="ld-nat" type="datetime-local" className="gc-input" disabled={!log.setNext} value={log.nextAt} onChange={(e) => setLog({ ...log, nextAt: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="ld-nw">To do</label><input id="ld-nw" className="gc-input" disabled={!log.setNext} value={log.nextWhat} onChange={(e) => setLog({ ...log, nextWhat: e.target.value })} placeholder="Follow up" /></div>
              </div>
            ) : null}
            <button type="submit" className="gc-btn gc-btn--solid" style={{ alignSelf: 'flex-start' }}>Save</button>
          </form>
          <div>
            <span className="gc-label">History</span>
            <ul className="ld-tl">
              {[...lead.log].reverse().map((x, i) => { const [l, ic] = LOG_KINDS[x.kind] || LOG_KINDS.note; return <li key={i}><span className="tm-tile"><Icon name={ic} width="14" height="14" aria-hidden="true" /></span><div style={{ minWidth: 0 }}><span className="tm-strong">{x.text}</span><span className="tm-sub">{l} · {userName(x.by)} · {formatDate(x.at)} {formatTime(x.at)}</span></div></li>; })}
            </ul>
          </div>
        </div>
      )}
    </Dialog>
  );
}
