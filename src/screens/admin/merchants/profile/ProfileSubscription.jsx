'use client';
// Merchant 360° profile › Subscription: the package and what is on the bill (end an add-on, add one), module trials,
// the upgrade / downgrade simulation, automatic charging, and the subscription's history.

import React from 'react';
import { StatusBadge, InfoTip } from '@/components/ui';
import { confirmDialog, toast } from '@/runtime/ui';
import { KV } from '@/components/ui/IndexKit';
import { dm, dmy, taka } from '@/lib/platform/util';
import { PLAN_NAME, ladderLabel } from '@/lib/platform/catalogue';
import { endItem, setAutoCharge, planOf, priceOf, mrrOf } from '@/lib/platform/billing';
import { activityOf } from '@/lib/admin/merchants';
import { Card, Row, Empty, when, dueText } from './profileShared';
import { PlanSimulator } from './ProfileActions';

const SUB_EVENTS = /plan|trial|cycle|charge|pause|resum|cancel|restor|archiv|added to the bill|ended|suspend|access restored|read-only|grace/i;
const TYPE_TONE = { Plan: 'primary', Module: 'success', Credits: 'neutral', 'One-off': 'neutral' };

export function SubscriptionTab({ ctx }) {
  const { db, t, shop, sub, st, row, view, open } = ctx;
  const plan = planOf(db, sub);
  const planPrice = priceOf(db, sub, { kind: 'plan', code: sub.plan });
  const monthly = mrrOf(db, sub, t);
  const items = view.billing.rows;
  const trials = view.modules.history;
  const history = activityOf(db, shop.id).filter((e) => SUB_EVENTS.test(e.text)).slice(0, 8);
  const closed = ['cancelled', 'archived'].includes(st.key);

  const end = async (it) => {
    const yes = await confirmDialog({ title: `End ${it.name}?`, body: 'It stops at once and is not billed from the next bill. What was billed already stays.', confirmLabel: 'End it', tone: 'danger' });
    if (!yes) return;
    const r = endItem(shop.id, it.id);
    toast(r.ok ? `${it.name} ended` : r.error);
  };
  const auto = async () => {
    const on = !sub.autoCharge;
    if (on && !(await confirmDialog({ title: 'Charge this store automatically?', body: `Each bill is charged to the saved ${sub.payMethod} on its due day, then retried after 1 and 3 days.`, confirmLabel: 'Turn on' }))) return;
    setAutoCharge(shop.id, on);
    toast(on ? 'Automatic charge on' : 'Automatic charge off · collected by hand');
  };

  return (
    <div className="ix-record">
      <div className="ix-main">
        <Card title="On the bill" action={closed ? null : <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('item')}>Add a module or item</button>} flush>
          {items.length ? items.map((it) => (
            <Row key={it.id} title={it.name}
              sub={`${it.trial ? it.since : it.period === 'Once' ? 'Once · ' + it.since : it.period + ' · since ' + it.since}${it.next && it.next !== '—' ? ' · next bill ' + it.next : ''}`}
              end={<>
                <StatusBadge tone={it.trial ? 'primary' : TYPE_TONE[it.type] || 'neutral'}>{it.trial ? 'After trial' : it.done ? 'Billed' : it.type}</StatusBadge>
                <span className="mp-fig">{it.price}</span>
                {!it.plan && !it.trial && !it.done && it.raw ? <button type="button" className="ix-btn ix-btn--sm ix-btn--danger" onClick={() => end(it)}>End</button> : null}
              </>} />
          )) : <Empty text={st.key === 'trial' ? 'Nothing is billed during the trial.' : 'Nothing is billed.'} action={closed ? null : { label: 'Add an item', onClick: () => open('item') }} />}
        </Card>

        <Card title="Change package" action={<InfoTip label="About plan changes" text="The new price starts now. For the days left until the next bill, the difference (up or down) is added to that bill." />}>
          {closed ? <Empty text="The store is closed. Restore it to change its package." /> : <PlanSimulator ctx={ctx} idp="sub" />}
        </Card>

        <Card title="Module trials" action={closed ? null : <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('modtrial')}>Start a module trial</button>} flush>
          {trials.length ? trials.map((m) => (
            <Row key={m.id} title={m.name} sub={`${m.trial} · ${m.use}${m.by ? ' · ' + m.by : ''}`}
              end={<StatusBadge tone={/Running/.test(m.result) ? 'primary' : /Became|Converted/.test(m.result) ? 'success' : 'neutral'}>{m.result}</StatusBadge>} />
          )) : <Empty text="No module trials yet." />}
        </Card>

        <Card title="History" flush>
          {history.length ? history.map((e) => <Row key={e.id} title={e.text} sub={`${when(e.at, t)}${e.by && !e.text.includes(e.by) ? ' · ' + e.by : ''}`} />)
            : <Empty text="No changes yet." />}
        </Card>
      </div>

      <div className="ix-side">
        <Card title="Package">
          <KV rows={[
            ['Package', `${ladderLabel(sub.ladder)} · ${PLAN_NAME[sub.plan]}`],
            ['Plan version', 'v' + plan.version],
            ['Billing', sub.cycle === 'yearly' ? 'Yearly' : 'Monthly'],
            ['Plan price', <span key="p" className="mp-data">{taka(planPrice)} a month</span>],
            ['Monthly total', <span key="m" className="mp-data">{taka(monthly || planPrice)}</span>],
            st.key === 'trial' ? ['Trial', `Day ${st.days} of ${sub.trialDays} · ends ${dm(sub.trialStart + sub.trialDays * 864e5)}`] : null,
            ['Next bill', row.renewal ? `${dm(row.renewal)} · ${dueText(row.renewal, t)}` : '—'],
            ['Customer since', dmy(shop.createdAt)],
          ]} />
        </Card>
        <Card title="Payment">
          <div className="mp-row" style={{ borderTop: 0 }}>
            <span className="mp-row__main"><b id="mp-auto">Charge automatically</b><small>{sub.autoCharge ? `Saved ${sub.payMethod}, on the due day` : 'Owner pays from the panel or on a call'}</small></span>
            <button type="button" role="switch" aria-checked={!!sub.autoCharge} aria-labelledby="mp-auto" className="gc-switch" onClick={auto} disabled={closed}><span className="gc-switch__knob" /></button>
          </div>
        </Card>
      </div>
    </div>
  );
}
