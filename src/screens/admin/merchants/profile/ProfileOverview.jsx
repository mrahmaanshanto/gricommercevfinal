'use client';
// Merchant 360° profile › Overview: five key facts, what needs someone for this store (at most five rows), notes, and
// on the right the owner with call / WhatsApp / email, the account manager and the store's facts.

import React, { useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { MetricStrip, KV } from '@/components/ui/IndexKit';
import { dm, dmy, daysBetween, taka, lastSeen } from '@/lib/platform/util';
import { PLAN_IDS, PLAN_NAME } from '@/lib/platform/catalogue';
import { openInvoices, balance } from '@/lib/platform/billing';
import { addNote, pinNote, toggleTask, sendReset } from '@/lib/platform/shops';
import { ownerOf, walletOf, usageOf } from '@/lib/admin/merchants';
import { Card, Row, Empty, when, dueText } from './profileShared';

/** The next plan up the ladder, or null on the top plan. */
export const nextPlan = (plan) => PLAN_IDS[PLAN_IDS.indexOf(plan) + 1] || null;

/** What needs someone for this store now, most urgent first (at most five). */
export function attentionOf(ctx) {
  const { db, t, shop, sub, st, view, open, go } = ctx;
  const out = [];
  const bills = openInvoices(db, shop.id);
  const late = bills.filter((i) => daysBetween(i.dueAt, t) > 0);
  if (st.key === 'suspended') out.push({ key: 'susp', icon: 'circle-alert', tone: 'err', title: shop.control === 'suspended' ? 'Suspended by staff' : `Suspended · unpaid ${st.days} days`, sub: 'Admin and storefront are off', act: { label: 'Reactivate', onClick: () => (shop.control === 'suspended' ? open('control', { action: 'unsuspend' }) : open('pay')) } });
  if (st.key === 'failed') {
    const run = (db.runs || []).find((r) => r.shopId === shop.id);
    out.push({ key: 'run', icon: 'circle-alert', tone: 'err', title: st.label, sub: (run && run.error) || 'The store is not live yet', act: { label: 'Onboarding', href: '/admin/onboarding' } });
  }
  if (late.length) {
    const sum = late.reduce((s, i) => s + balance(db, i), 0);
    out.push({ key: 'late', icon: 'clock-alert', tone: 'err', title: late.length === 1 ? `${late[0].id} overdue ${daysBetween(late[0].dueAt, t)} days` : `${late.length} bills overdue`, sub: `${taka(sum)} owed · ${st.label}`, act: { label: 'Record payment', onClick: () => open('pay', { invoiceId: late[0].id }) } });
  } else if (bills.length) {
    out.push({ key: 'due', icon: 'receipt', tone: 'warn', title: `${bills[0].id} due ${dueText(bills[0].dueAt, t)}`, sub: `${taka(balance(db, bills[0]))} · ${sub.autoCharge ? 'charged automatically' : 'collected by hand'}`, act: { label: 'Billing', onClick: () => go('billing') } });
  }
  if (st.key === 'trial' && st.left <= 3) out.push({ key: 'trial', icon: 'hourglass', tone: 'warn', title: st.left > 0 ? `Trial ends in ${st.left} day${st.left === 1 ? '' : 's'}` : 'Trial ends today', sub: `${PLAN_NAME[sub.plan]} plan from then`, act: { label: 'Extend trial', onClick: () => open('trial') } });
  const pending = db.adjustments.filter((a) => a.shopId === shop.id && a.status === 'pending');
  if (pending.length) out.push({ key: 'adj', icon: 'scale', tone: 'warn', title: `${pending[0].id} waiting for a second approval`, sub: `${pending[0].type} ${taka(pending[0].amount)}${pending.length > 1 ? ` · ${pending.length - 1} more` : ''}`, act: { label: 'View', onClick: () => go('billing') } });
  const tickets = view.support.tickets.filter((x) => x.open);
  if (tickets.length) out.push({ key: 'tix', icon: 'life-buoy', tone: 'err', title: tickets.length === 1 ? `${tickets[0].id} · ${tickets[0].subject}` : `${tickets.length} open tickets`, sub: tickets[0].status, act: { label: 'Support', onClick: () => go('support') } });
  const working = ['active', 'grace', 'pastdue', 'trial'].includes(st.key);
  const failing = working ? view.overview.integrations.filter((i) => /err/.test(i.shp)) : [];
  if (failing.length) out.push({ key: 'int', icon: 'plug-zap', tone: 'err', title: `${failing[0].name}: ${failing[0].text}`, sub: failing.length > 1 ? `${failing.length - 1} more failing` : 'Connection failing', act: { label: 'Activity', onClick: () => go('business') } });
  // a connection or seat count at its limit is normal; volumes at 90% (or anything over) are worth an upgrade call
  const near = working ? usageOf(db, shop, t).resources.filter((r) => !r.unlimited && r.limit && (r.used > r.limit || (!['couriers', 'seats', 'pages'].includes(r.key) && r.used / r.limit >= 0.9))) : [];
  if (near.length) {
    const up = nextPlan(sub.plan);
    out.push({ key: 'lim', icon: 'gauge', tone: 'warn', title: near.length === 1 ? `${near[0].label}: ${Math.round((near[0].used / near[0].limit) * 100)}% of the limit` : `${near.length} limits nearly used up`, sub: near.map((r) => r.label).slice(0, 3).join(', '), act: up ? { label: 'Offer upgrade', onClick: () => open('plan', { plan: up }) } : { label: 'Resources', onClick: () => go('resources') } });
  }
  const w = walletOf(db, shop.id, t);
  if ((st.key === 'trial' || ['active', 'grace', 'pastdue'].includes(st.key)) && w.balance < 300) out.push({ key: 'cr', icon: 'wallet', tone: 'warn', title: `Credits low · ${taka(w.balance)}`, sub: 'SMS and WhatsApp stop at zero', act: { label: 'Add credits', onClick: () => open('credits') } });
  const idle = ctx.row ? ctx.row.lastActive : 0;
  if (idle >= 7 && !['cancelled', 'archived', 'paused'].includes(st.key)) out.push({ key: 'idle', icon: 'moon', tone: 'warn', title: `No sign-in for ${idle} days`, sub: 'Worth a call', act: { label: 'Log a call', onClick: () => open('call') } });
  return out.slice(0, 5);
}

function Notes({ ctx }) {
  const { shop, view } = ctx;
  const notes = view.overview.notes;
  const [all, setAll] = useState(false);
  const [text, setText] = useState('');
  const [pin, setPin] = useState(false);
  const [err, setErr] = useState(null);
  const shown = all ? notes : notes.filter((n) => n.pinned || (n.kind === 'task' && !n.done)).slice(0, 4);
  const list = shown.length ? shown : notes.slice(0, 2);
  const add = (e) => {
    e.preventDefault();
    const r = addNote(shop.id, { text, pinned: pin });
    if (!r.ok) { setErr(r.error); return; }
    setText(''); setPin(false); setErr(null);
    toast(pin ? 'Note pinned' : 'Note added');
  };
  return (
    <Card title="Notes" action={notes.length > list.length || all ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `All ${notes.length}`}</button> : null}>
      {list.length ? (
        <div className="mp-notes">
          {list.map((n) => (
            <div key={n.id} className={'mp-note' + (n.pinned ? ' mp-note--pin' : '') + (n.done ? ' is-done' : '')}>
              {n.kind === 'task' ? <input type="checkbox" className="gc-check" checked={!!n.done} aria-label={n.done ? 'Mark not done' : 'Mark done'} onChange={() => toggleTask(n.id)} /> : null}
              <div><p>{n.text}</p><small>{n.head.replace(/^Pinned · /, '')}</small></div>
              {n.kind === 'note' ? (
                <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={n.pinned ? 'Unpin note' : 'Pin note'} aria-pressed={!!n.pinned} title={n.pinned ? 'Unpin' : 'Pin'} onClick={() => pinNote(n.id)}>
                  <Icon name={n.pinned ? 'pin-off' : 'pin'} width="16" height="16" aria-hidden="true" />
                </button>
              ) : null}
            </div>
          ))}
        </div>
      ) : <p className="mp-empty">No notes yet.</p>}
      <form className="mp-add" onSubmit={add}>
        <label className="gc-label" htmlFor="mp-note" style={{ margin: 0 }}>Add a note</label>
        <textarea id="mp-note" rows={2} className={'gc-input' + (err ? ' gc-input--error' : '')} aria-invalid={err ? true : undefined} value={text} onChange={(e) => { setText(e.target.value); setErr(null); }} placeholder="Best time to call, what was agreed …" />
        {err ? <p className="gc-help gc-help--error" role="alert" style={{ margin: 0 }}>{err}</p> : null}
        <div className="mp-add__bar">
          <label><input type="checkbox" className="gc-check" checked={pin} onChange={(e) => setPin(e.target.checked)} />Pin to the top</label>
          <button type="submit" className="ix-btn ix-btn--sm">Add note</button>
        </div>
      </form>
    </Card>
  );
}

export function OverviewTab({ ctx }) {
  const { db, t, shop, sub, st, row, owed, open, go } = ctx;
  const o = ownerOf(shop);
  const todo = attentionOf(ctx);
  const digits = String(o.phone || '').replace(/\D/g, '');
  const reset = () => {
    const r = sendReset(shop.id);
    toast(r && r.ok ? `Reset link sent to ${r.phone || 'the owner'} by SMS` : 'The link could not be sent');
  };
  const late = openInvoices(db, shop.id).filter((i) => daysBetween(i.dueAt, t) > 0);
  return (
    <div className="ix-record">
      <div className="ix-main">
        <MetricStrip label="Key facts" items={[
          { label: 'Monthly amount', value: taka(row.monthly || 0), sub: row.monthly ? (sub.cycle === 'yearly' ? 'paid yearly' : null) : st.key === 'trial' ? 'on trial' : 'not billed', icon: 'repeat' },
          { label: 'Owed', value: taka(owed), sub: late.length ? `${daysBetween(late[0].dueAt, t)} days late` : owed ? 'not due yet' : null, icon: 'wallet', onClick: () => go('billing') },
          { label: st.key === 'trial' ? 'Trial ends' : 'Renewal', value: row.renewal ? dm(row.renewal) : '—', sub: row.renewal ? dueText(row.renewal, t) : null, icon: 'calendar' },
          { label: 'Health', value: String(row.health), sub: row.healthBand, icon: 'heart-pulse' },
          { label: 'Last active', value: lastSeen(row.lastActive), icon: 'clock' },
        ]} />

        <Card title="Needs attention" flush>
          {todo.length ? todo.map((x) => (
            <Row key={x.key} icon={x.icon} title={x.title} sub={x.sub}
              end={x.act.href ? <Link className="ix-btn ix-btn--sm" href={x.act.href}>{x.act.label}</Link>
                : <button type="button" className={'ix-btn ix-btn--sm' + (x.tone === 'err' ? ' ix-btn--danger' : '')} onClick={x.act.onClick}>{x.act.label}</button>} />
          )) : <Empty text="Nothing needs attention for this store." />}
        </Card>

        <Notes ctx={ctx} />
      </div>

      <div className="ix-side">
        <Card title="Owner">
          <KV rows={[['Name', o.name || '—'], ['Phone', o.phone ? <span key="p" className="mp-data">{o.phone}</span> : '—'], ['Email', o.email || '—'], shop.owner && shop.owner.lang ? ['Language', shop.owner.lang] : null]} />
          <div className="mp-contact">
            {digits ? <a className="ix-btn ix-btn--sm" href={'tel:+' + digits}><Icon name="phone" width="16" height="16" aria-hidden="true" />Call</a> : null}
            {digits ? <a className="ix-btn ix-btn--sm" href={'https://wa.me/' + digits} target="_blank" rel="noreferrer"><Icon name="message-circle" width="16" height="16" aria-hidden="true" />WhatsApp</a> : null}
            {o.email ? <a className="ix-btn ix-btn--sm" href={'mailto:' + o.email}><Icon name="mail" width="16" height="16" aria-hidden="true" />Email</a> : null}
            <button type="button" className="ix-btn ix-btn--sm" onClick={reset}><Icon name="key-round" width="16" height="16" aria-hidden="true" />Reset password</button>
          </div>
        </Card>

        <Card title="Account manager" action={<button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => open('manager')}>{shop.am ? 'Change' : 'Assign'}</button>}>
          {shop.am ? <Row icon="user-round" title={shop.am} sub={`Onboarded by ${shop.by}${shop.helper && shop.helper !== shop.by ? ' · helper ' + shop.helper : ''}`} />
            : <Empty text="Nobody yet." action={{ label: 'Assign', onClick: () => open('manager') }} />}
        </Card>

        <Card title="Store" action={<button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => open('edit')}>Edit</button>}>
          <KV rows={[
            ['Store ID', <span key="i" className="mp-data">#{shop.id}</span>],
            ['Package', row.packageName],
            ['Registered', dmy(shop.createdAt)],
            ['Came from', shop.src],
            ['Category', shop.cat],
            ['District', shop.dist],
            shop.address ? ['Address', shop.address] : null,
            ['Domain', <a key="d" href={'https://' + row.domain} target="_blank" rel="noreferrer">{row.domain}</a>],
            shop.resetAt ? ['Reset link sent', when(shop.resetAt, t)] : null,
          ]} />
        </Card>
      </div>
    </div>
  );
}
