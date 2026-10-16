'use client';
// SvcOrderWork — the Batch D parts of a service order in super admin (/admin/service-order):
//   OfferCard    a custom offer waiting for payment: the payment link and code, send it (ShareSheet: email, SMS,
//                WhatsApp, social, copy), where it was sent, valid until (extend), withdraw
//   TeamPick     give the order to a team (its lead becomes the expert) or take the team off
//   TasksCard    the work split into tasks, each for an expert or a team with what they are paid; Done makes the payout
//                owed (Finance approves and pays it to the bank account shown; paid comes back here)
//   UpdatesCard  progress updates with a percent; Share with the store or keep for the team; share / take back later
//   ProfitCard   fees billed, refunds, task payouts, other costs (add / remove) and the profit on this order
// Data: lib/platform/services.js.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { StatusBadge } from '@/components/ui';
import { KV } from '@/components/ui/IndexKit';
import {
  getTeams, getExperts, whoOf, assignTeam, clearTeam, addTask, updateTask, removeTask, addCost, removeCost, postUpdate, publishUpdate,
  profitOf, offerPath, logOfferSent, extendOffer, withdrawOffer, bankText, TASK_STATUS, PAY_STATUS, COST_KINDS, stateOf,
} from '@/lib/platform/services';
import { ShareSheet } from './ShareSheet';
import { tk, dShort, dTime } from './svcAdmin';

const say = (res, ok) => { if (res && res.ok === false) { toast(res.error, { tone: 'error' }); return false; } if (ok) toast(ok); return true; };
const CH = { email: 'Email', sms: 'SMS', whatsapp: 'WhatsApp', facebook: 'Facebook', messenger: 'Messenger', linkedin: 'LinkedIn', x: 'X', telegram: 'Telegram', copy: 'Copied', link: 'Link copied' };

export const WORK_CSS = `
.sow-list{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.sow-list>li{display:flex;flex-wrap:wrap;align-items:center;gap:6px 12px;padding:10px 0;border-top:1px solid var(--border-subtle)}
.sow-list>li:first-child{border-top:0}
.sow-main{flex:1 1 240px;min-width:0;display:flex;flex-direction:column;gap:2px}
.sow-main b{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.sow-main small{font-size:var(--text-xs);color:var(--text-muted)}
.sow-amt{font-family:var(--font-data);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);white-space:nowrap}
.sow-acts{display:flex;align-items:center;gap:4px}
.sow-acts select{width:auto;min-width:110px}
.sow-add{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1.4fr) minmax(0,1fr) auto;gap:var(--space-2);align-items:end;padding-top:var(--space-3);border-top:1px solid var(--border-subtle)}
.sow-code{font-family:var(--font-data);font-size:var(--text-lg);font-weight:var(--weight-semibold);letter-spacing:.08em;color:var(--text-heading)}
.sow-bar{display:block;height:8px;border-radius:var(--radius-full);background:var(--surface-subtle);overflow:hidden}
.sow-bar b{display:block;height:100%;background:var(--success)}
.sow-profit{display:flex;flex-direction:column;gap:6px;font-size:var(--text-sm)}
.sow-profit div{display:flex;justify-content:space-between;gap:var(--space-2)}
.sow-profit div span:last-child{font-family:var(--font-data)}
.sow-profit .is-total{padding-top:6px;border-top:1px solid var(--border-subtle);font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:640px){.sow-add{grid-template-columns:1fr 1fr}.sow-add>:first-child{grid-column:1/-1}}
`;

/** Who options: every active expert and team, grouped. value 'expert:id' | 'team:id' */
function WhoSelect({ value, onChange, id, label = 'Who does it' }) {
  return (
    <select id={id} className="gc-input gc-select" aria-label={label} value={value} onChange={(e) => onChange(e.target.value)}>
      <option value="">Choose…</option>
      <optgroup label="Teams">{getTeams().filter((t) => t.active !== false).map((t) => <option key={t.id} value={'team:' + t.id}>{t.name}</option>)}</optgroup>
      <optgroup label="Experts">{getExperts().filter((e) => e.active).map((e) => <option key={e.id} value={'expert:' + e.id}>{e.name}{e.kind === 'partner' ? ' (partner)' : ''}</option>)}</optgroup>
    </select>
  );
}
const parseWho = (v) => { const [kind, id] = String(v || '').split(':'); return id ? { kind, id } : null; };

export function OfferCard({ o, by }) {
  const [share, setShare] = useState(false);
  const st = stateOf(o);
  const link = typeof window !== 'undefined' ? window.location.origin + offerPath(o) : offerPath(o);
  const text = `Hello ${o.shopName}, here is your custom offer from GridCommerce:\n${st.svc.name}\n${tk(o.total)} with VAT · ${(st.pkg.days || 0)} days from payment.\nPay to confirm (valid until ${dShort(o.offer.expiresAt)}):\n${link}`;
  const sent = o.offer.sent || [];
  const withdraw = async () => { if (await confirmDialog({ title: 'Withdraw this offer?', body: 'The payment link stops working. The store sees it was withdrawn.', confirmLabel: 'Withdraw', tone: 'danger' })) say(withdrawOffer(o.id, by), 'Offer withdrawn'); };
  return (
    <section className="ix-card sva-pad" aria-labelledby="sow-offer" style={{ borderColor: 'var(--warning)' }}>
      <div className="sva-row" style={{ justifyContent: 'space-between' }}>
        <h2 id="sow-offer">{st.status === 'expired' ? 'The offer has expired' : 'Waiting for the store to pay'}</h2>
        <span className="sow-code" aria-label={'Code ' + o.offer.code}>{o.offer.code}</span>
      </div>
      <p className="gc-help">{st.svc.name} · {tk(o.total)} with VAT · valid until {dTime(o.offer.expiresAt)}. Work starts when the store pays{o.teamId || o.expertId ? ', with the ' + (o.teamId ? 'team' : 'expert') + ' already chosen' : ''}.</p>
      <div className="sva-row">
        <button type="button" className="ix-btn ix-btn--primary" onClick={() => setShare(true)}><Icon name="send" width="16" height="16" aria-hidden="true" />Send the payment link</button>
        <a className="ix-btn" href={offerPath(o)} target="_blank" rel="noopener noreferrer"><Icon name="external-link" width="16" height="16" aria-hidden="true" />Open the link</a>
        <button type="button" className="ix-btn" onClick={() => say(extendOffer(o.id, 7, by), 'Valid for 7 more days')}>7 more days</button>
        <button type="button" className="ix-btn ix-btn--plain" onClick={withdraw}>Withdraw</button>
      </div>
      {sent.length ? (
        <ul className="sow-list" aria-label="Sent">
          {sent.slice().reverse().map((x, i) => <li key={i}><span className="sow-main"><b>{CH[x.ch] || x.ch}{x.to ? ' · ' + x.to : ''}</b><small>{dTime(x.at)} · {x.by}</small></span></li>)}
        </ul>
      ) : <p className="gc-help">Not sent yet.</p>}
      <ShareSheet open={share} onClose={() => setShare(false)} title={st.svc.name} subject={`Your custom offer from GridCommerce · ${st.svc.name}`} autoText={text} link={link} shop={o.shopId}
        onSent={({ ch, to }) => logOfferSent(o.id, { ch, to }, by)} />
    </section>
  );
}

export function TeamPick({ o, by, done }) {
  const [team, setTeam] = useState('');
  const teams = getTeams().filter((t) => t.active !== false);
  if (done) return null;
  return (
    <div className="sva-row">
      <select className="gc-input gc-select" style={{ flex: 1, minWidth: 0 }} aria-label="Give to a team" value={team || o.teamId || ''} onChange={(e) => setTeam(e.target.value)}>
        <option value="">Give to a team…</option>
        {teams.map((t) => <option key={t.id} value={t.id}>{t.name} · {t.members.length} people</option>)}
      </select>
      <button type="button" className="ix-btn ix-btn--sm" disabled={!team || team === o.teamId} onClick={() => { if (say(assignTeam(o.id, team, by), 'Given to the team')) setTeam(''); }}>{o.status === 'brief' ? 'Give and start' : 'Give'}</button>
      {o.teamId ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => say(clearTeam(o.id, by), 'Team taken off')}>Take off</button> : null}
    </div>
  );
}

export function TasksCard({ o, by }) {
  const [f, setF] = useState({ title: '', who: '', cost: '' });
  const tasks = o.tasks || [];
  const total = tasks.reduce((a, x) => a + (x.cost || 0), 0);
  const closed = ['closed', 'cancelled', 'refunded'].includes(o.status);
  const add = () => { if (say(addTask(o.id, { title: f.title, who: parseWho(f.who), cost: f.cost }, by), 'Task added')) setF({ title: '', who: '', cost: '' }); };
  return (
    <section className="ix-card sva-pad" aria-labelledby="sow-tasks">
      <div className="sva-row" style={{ justifyContent: 'space-between' }}><h2 id="sow-tasks">Tasks · {tasks.filter((x) => x.status === 'done').length} of {tasks.length} done</h2><span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Payouts {tk(total)}</span></div>
      {tasks.length ? (
        <ul className="sow-list" aria-label="Tasks">
          {tasks.map((x) => {
            const w = whoOf(x.who) || { name: '—' };
            const pay = x.pay || { status: 'unpaid' };
            return (
              <li key={x.id}>
                <span className="sow-main">
                  <b>{x.title}</b>
                  <small>{w.kind === 'team' ? 'Team · ' : ''}{w.name}{x.cost ? ' · pays to ' + bankText(pay.to || w.bank) : ' · no payout (staff)'}</small>
                </span>
                <span className="sow-amt">{x.cost ? tk(x.cost) : '—'}</span>
                {x.cost ? <StatusBadge tone={pay.status === 'paid' ? 'success' : pay.status === 'owed' ? 'warning' : 'neutral'}>{pay.status === 'paid' ? 'Paid' + (pay.ref ? ' · ' + pay.ref : '') : PAY_STATUS[pay.status]}</StatusBadge> : null}
                <span className="sow-acts">
                  <select className="gc-input gc-select" aria-label={'Status of ' + x.title} value={x.status} disabled={closed && x.status === 'done'} onChange={(e) => say(updateTask(o.id, x.id, { status: e.target.value }, by), e.target.value === 'done' && x.cost ? 'Done · payout owed, Finance pays it' : 'Updated')}>
                    {TASK_STATUS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  {pay.status === 'unpaid' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + x.title} onClick={() => say(removeTask(o.id, x.id, by), 'Task removed')}><Icon name="trash-2" width="14" height="14" /></button> : null}
                </span>
              </li>
            );
          })}
        </ul>
      ) : <p className="gc-help">No tasks yet. Split the work and set what each expert or team is paid.</p>}
      {!closed ? (
        <div className="sow-add">
          <div><label className="gc-label" htmlFor="sow-tt">Task</label><input id="sow-tt" className="gc-input" value={f.title} onChange={(e) => setF({ ...f, title: e.target.value })} placeholder="e.g. 3 banners" /></div>
          <div><label className="gc-label" htmlFor="sow-tw">For</label><WhoSelect id="sow-tw" value={f.who} onChange={(v) => { const w = parseWho(v); const ex = w && w.kind === 'expert' ? getExperts().find((e) => e.id === w.id) : null; setF({ ...f, who: v, cost: f.cost || (ex && ex.kind === 'partner' && ex.commission ? String(Math.round((o.fee * ex.commission) / 100)) : f.cost) }); }} /></div>
          <div><label className="gc-label" htmlFor="sow-tc">Pays (৳)</label><input id="sow-tc" className="gc-input" inputMode="numeric" value={f.cost} onChange={(e) => setF({ ...f, cost: e.target.value })} placeholder="0 = staff" /></div>
          <button type="button" className="ix-btn" onClick={add}>Add task</button>
        </div>
      ) : null}
      <p className="gc-help">A task’s payout is owed when it is marked done. Finance approves it and pays the bank account shown (Finance › Expenses); the task then shows Paid.</p>
    </section>
  );
}

export function UpdatesCard({ o, by }) {
  const [f, setF] = useState({ text: '', progress: '', shared: true });
  const ups = (o.updates || []).slice().reverse();
  const last = (o.updates || []).filter((u) => u.shared).slice(-1)[0];
  const post = () => { if (say(postUpdate(o.id, { ...f, progress: f.progress === '' ? (last ? last.progress : 0) : f.progress }, by), f.shared ? 'Shared with the store' : 'Saved for the team')) setF({ text: '', progress: '', shared: f.shared }); };
  return (
    <section className="ix-card sva-pad" aria-labelledby="sow-up">
      <div className="sva-row" style={{ justifyContent: 'space-between' }}><h2 id="sow-up">Progress updates</h2>{last ? <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>The store sees {last.progress}%</span> : <span className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Nothing shared yet</span>}</div>
      {last ? <span className="sow-bar" aria-hidden="true"><b style={{ width: last.progress + '%' }} /></span> : null}
      {ups.length ? (
        <ul className="sow-list" aria-label="Updates">
          {ups.map((u) => (
            <li key={u.id}>
              <span className="sow-main"><b style={{ fontWeight: 'var(--weight-regular)' }}>{u.text}</b><small>{u.by} · {dTime(u.at)} · {u.progress}%</small></span>
              <StatusBadge tone={u.shared ? 'success' : 'neutral'}>{u.shared ? 'Store sees it' : 'Team only'}</StatusBadge>
              <button type="button" className="ix-btn ix-btn--sm" onClick={() => say(publishUpdate(o.id, u.id, !u.shared, by), u.shared ? 'Taken back from the store' : 'Shared with the store')}>{u.shared ? 'Take back' : 'Share'}</button>
            </li>
          ))}
        </ul>
      ) : null}
      {!['closed', 'cancelled', 'refunded'].includes(o.status) ? (
        <div className="sva-form" style={{ paddingTop: 'var(--space-3)', borderTop: '1px solid var(--border-subtle)' }}>
          <div><label className="gc-label" htmlFor="sow-ut">New update</label><textarea id="sow-ut" className="gc-input" rows={2} value={f.text} onChange={(e) => setF({ ...f, text: e.target.value })} placeholder="What is done and what is next" /></div>
          <div className="sva-row">
            <label className="gc-label" htmlFor="sow-up-p" style={{ margin: 0 }}>Done</label>
            <input id="sow-up-p" className="gc-input" style={{ width: 90 }} inputMode="numeric" value={f.progress} onChange={(e) => setF({ ...f, progress: e.target.value })} placeholder={last ? String(last.progress) : '0'} aria-describedby="sow-up-pct" /><span id="sow-up-pct" className="ix-muted">%</span>
            <label className="sva-chk"><input type="checkbox" className="gc-check" checked={f.shared} onChange={(e) => setF({ ...f, shared: e.target.checked })} />The store sees it</label>
            <button type="button" className="ix-btn ix-btn--primary" style={{ marginLeft: 'auto' }} onClick={post}>{f.shared ? 'Share update' : 'Save for the team'}</button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

export function ProfitCard({ o, by }) {
  const [f, setF] = useState(null);
  const p = profitOf(o);
  return (
    <section className="ix-card sva-pad" aria-labelledby="sow-pr">
      <h2 id="sow-pr">Profit on this order</h2>
      <div className="sow-profit">
        <div><span>Fees billed (no VAT)</span><span>{tk(p.revenue)}</span></div>
        {p.refunds ? <div><span>Refunds</span><span>−{tk(p.refunds)}</span></div> : null}
        <div><span>Task payouts</span><span>−{tk(p.tasks)}</span></div>
        <div><span>Other costs</span><span>−{tk(p.costs)}</span></div>
        <div className="is-total"><span>Profit{p.margin != null ? ` · ${p.margin}%` : ''}</span><span style={{ color: p.profit < 0 ? 'var(--text-danger)' : undefined }}>{tk(p.profit)}</span></div>
      </div>
      <KV rows={[['Paid out', tk(p.paidOut)], ['Owed (in Finance)', tk(p.owed)]]} />
      {(o.costs || []).length ? (
        <ul className="sow-list" aria-label="Other costs">
          {o.costs.map((c) => <li key={c.id}><span className="sow-main"><b>{c.label}</b><small>{(COST_KINDS.find((k) => k[0] === c.kind) || ['', c.kind])[1]} · {dShort(c.at)} · {c.by}</small></span><span className="sow-amt">{tk(c.amount)}</span><button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + c.label} onClick={() => say(removeCost(o.id, c.id, by), 'Cost removed')}><Icon name="trash-2" width="14" height="14" /></button></li>)}
        </ul>
      ) : null}
      {f ? (
        <div className="sva-form">
          <div><label className="gc-label" htmlFor="sow-cl">What for</label><input id="sow-cl" className="gc-input" value={f.label} onChange={(e) => setF({ ...f, label: e.target.value })} placeholder="e.g. Stock photo licence" /></div>
          <div className="sva-grid2">
            <div><label className="gc-label" htmlFor="sow-ck">Kind</label><select id="sow-ck" className="gc-input gc-select" value={f.kind} onChange={(e) => setF({ ...f, kind: e.target.value })}>{COST_KINDS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
            <div><label className="gc-label" htmlFor="sow-ca">Amount (৳)</label><input id="sow-ca" className="gc-input" inputMode="numeric" value={f.amount} onChange={(e) => setF({ ...f, amount: e.target.value })} /></div>
          </div>
          <div className="sva-row"><button type="button" className="ix-btn ix-btn--primary" onClick={() => { if (say(addCost(o.id, f, by), 'Cost added')) setF(null); }}>Add cost</button><button type="button" className="ix-btn" onClick={() => setF(null)}>Cancel</button></div>
        </div>
      ) : <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => setF({ label: '', kind: 'tools', amount: '' })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add a cost</button></div>}
      <p className="gc-help">Staff time counts as ৳0 unless a task pays it. <Link href="/admin/services/reports">Profit by service</Link></p>
    </section>
  );
}

