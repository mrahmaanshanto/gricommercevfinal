'use client';
// Loyalty — the loyalty rules and what loyalty means for the books.
//   Top       members, the ৳ value of the points customers hold (a liability until used or expired),
//             this month's loyalty cost (points used + rewards given) and the money in customer wallets.
//   Rules     how points are earned and used, member levels, and what is on or off. "Save rules"
//             keeps them (src/lib/loyalty.js settings); the value of a point also sets the ৳ value of
//             every point customers hold.
//   Side      a worked example and the SMS the customer gets; with expiry on, remove expired points.
// Front end only.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import {
  getLoyaltySettings, saveLoyaltySettings, getMembers, pointsLiability, walletLiability, loyaltyCosts, monthRange, expirePoints, DEFAULT_SETTINGS,
} from '@/lib/loyalty';
import { clockNow } from '@/lib/settlements';
import { LoyPage, Kpi, Stepper, useLoyalty, money, pts, plural } from './loyShared';

const AMTS = [500, 2500, 10000];
const MONTH = (t) => new Date(t).toLocaleString('en', { month: 'long' });

const CSS = `
.lo-split{display:grid;grid-template-columns:minmax(0,1fr) 340px;gap:var(--space-5);align-items:start}
.lo-main{display:flex;flex-direction:column;gap:var(--space-5);min-width:0}
.lo-side{display:flex;flex-direction:column;gap:var(--space-4);position:sticky;top:0}
.lo-sec{padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.lo-sechead{display:flex;align-items:flex-start;gap:var(--space-3)}
.lo-num{flex:none;display:grid;place-items:center;width:28px;height:28px;border-radius:var(--radius-full);background:var(--primary);color:var(--text-inverse);font-size:var(--text-xs);font-weight:var(--weight-semibold)}
.lo-sechead h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lo-sechead p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.lo-sechead > div{flex:1;min-width:0}
.lo-rule{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-subtle)}
.lo-rule > div{flex:1 1 220px;min-width:0}
.lo-rule b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.lo-rule small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.lo-unit{min-width:64px;font-size:var(--text-xs);color:var(--text-muted)}
.lo-tiers{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.lo-tier{display:flex;flex-direction:column;gap:6px;padding:var(--space-4);border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);min-width:0}
.lo-tier h3{margin:0;display:flex;align-items:center;gap:var(--space-2);font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lo-tier p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.lo-mult{font-family:var(--font-data);font-size:var(--text-xl);font-weight:var(--weight-semibold);color:var(--primary)}
.lo-tier label{font-size:var(--text-xs);color:var(--text-muted)}
.lo-count{padding-top:var(--space-2);border-top:1px dashed var(--border-subtle);font-size:var(--text-xs);color:var(--text-body)}
.lo-sw{display:flex;align-items:center;gap:var(--space-3);padding:var(--space-3) 0;border-top:1px solid var(--border-subtle)}
.lo-sw:first-of-type{border-top:0}
.lo-sw > div{flex:1;min-width:0}
.lo-sw b{display:block;font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.lo-sw small{display:block;font-size:var(--text-xs);color:var(--text-muted)}
.lo-card{padding:var(--space-5);display:flex;flex-direction:column;gap:var(--space-3)}
.lo-card h2{margin:0;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lo-result{padding:var(--space-4);border-radius:var(--radius-xl);background:var(--fill-primary-soft);color:var(--primary)}
.lo-result b{display:block;font-family:var(--font-data);font-size:var(--text-2xl);font-weight:var(--weight-semibold)}
.lo-result span{font-size:var(--text-xs)}
.lo-lines{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-body)}
.lo-lines li{display:flex;gap:var(--space-2)}
.lo-lines svg{flex:none;color:var(--text-success);margin-top:1px}
.lo-sms{padding:var(--space-3) var(--space-4);border-radius:var(--radius-xl) var(--radius-xl) var(--radius-xl) var(--radius-sm);background:var(--surface-subtle);font-family:var(--font-bn);font-size:var(--text-sm);line-height:1.6;color:var(--text-heading)}
.lo-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3);padding:var(--space-4) var(--space-5)}
@media (max-width:1100px){.lo-split{grid-template-columns:minmax(0,1fr)}.lo-side{position:static}}
@media (max-width:900px){.lo-tiers{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:480px){.lo-tiers{grid-template-columns:minmax(0,1fr)}}
`;

function Switch({ on, onToggle, label }) {
  return <button type="button" role="switch" aria-checked={!!on} aria-label={label} className="gc-switch" onClick={onToggle}><span className="gc-switch__knob" /></button>;
}

export default function Loyalty() {
  const tick = useLoyalty();
  const [draft, setDraft] = useState(DEFAULT_SETTINGS);
  const [editTiers, setEditTiers] = useState(false);
  const [amt, setAmt] = useState(2500);
  const [tierK, setTierK] = useState('gold');
  const [dirty, setDirty] = useState(false);

  useEffect(() => { if (tick === 1) setDraft(getLoyaltySettings()); }, [tick]);
  const set = (patch) => { setDraft((d) => ({ ...d, ...patch })); setDirty(true); };
  const setOn = (k) => set({ on: { ...draft.on, [k]: !draft.on[k] } });
  const setTier = (i, patch) => set({ tiers: draft.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) });

  const data = useMemo(() => {
    if (!tick) return null;
    const now = clockNow();
    const members = getMembers();
    const [m0, m1] = monthRange(now);
    const [l0, l1] = monthRange(now, -1);
    return {
      now, members, liab: pointsLiability(members), wallets: walletLiability(members),
      month: loyaltyCosts(m0, m1), last: loyaltyCosts(l0, l1), lastLabel: MONTH(l0), monthLabel: MONTH(m0),
      joined: members.filter((m) => m.joined >= m0).length,
      byTier: Object.fromEntries(draft.tiers.map((t) => [t.k, members.filter((m) => m.tier === t.k).length])),
    };
  }, [tick]);   // eslint-disable-line react-hooks/exhaustive-deps

  const heldPoints = data ? data.liab.points : 0;
  const T = draft.tiers.find((t) => t.k === tierK) || draft.tiers[0];
  const exPts = Math.floor(Math.floor(amt / 100) * draft.earnPer100 * T.mult);
  const pointsLine = (c, kind) => c.lines.filter((l) => l.kind === kind).reduce((a, l) => a + l.amount, 0);

  const save = (e) => {
    if (e) e.preventDefault();
    const bad = draft.tiers.find((t, i) => i > 0 && t.min <= draft.tiers[i - 1].min);
    if (bad) { toast(`${bad.name} must start above ${draft.tiers[draft.tiers.indexOf(bad) - 1].name}`, { tone: 'error' }); return; }
    saveLoyaltySettings(draft);
    setDirty(false); setEditTiers(false);
    toast(`Rules saved · points customers hold are now worth ${money(heldPoints * draft.pointValue)}`);
  };
  const reset = () => { setDraft(getLoyaltySettings()); setDirty(false); setEditTiers(false); };
  const runExpiry = async () => {
    if (dirty) { toast('Save the rules first, then remove expired points', { tone: 'error' }); return; }
    if (!(await confirmDialog({ title: 'Remove expired points?', body: `Points not used within ${draft.expiryMonths} months are removed from every member. What you hold for customers goes down by their value.`, confirmLabel: 'Remove expired points', tone: 'danger' }))) return;
    const done = expirePoints(clockNow());
    toast(done.points ? `${pts(done.points)} points removed from ${plural(done.members, 'member')} · ${money(done.value)} less held for customers` : 'No points have expired yet', done.points ? {} : { tone: 'info' });
  };

  return (
    <LoyPage screen="Loyalty" active="loy-home" title="Loyalty & rewards" css={CSS}
      description="Reward loyal customers. They collect points when they buy and use them as money off next time; points they hold are a promise you keep until they are used."
      actions={<>
        <Link href="/members" className="gc-btn gc-btn--neutral"><Icon name="users" width="18" height="18" aria-hidden="true" /> See members</Link>
        <button type="submit" form="lo-form" className="gc-btn gc-btn--solid"><Icon name="check" width="18" height="18" aria-hidden="true" /> Save rules</button>
      </>}>
      <div className="gc-kpis gc-kpis--tight">
        <Kpi icon="users" label="Members" value={data ? pts(data.members.length) : '—'} sub={data ? `+${data.joined} joined in ${data.monthLabel}` : ''} />
        <Kpi icon="star" label="Points customers hold" tone="info" value={data ? money(data.liab.value) : '—'} sub={data ? `${pts(data.liab.points)} points · ${money(data.liab.pointValue)} each` : ''} />
        <Kpi icon="receipt" label={`Loyalty cost · ${data ? data.monthLabel : 'this month'}`} tone="warning" value={data ? money(data.month.total) : '—'} sub={data ? `${data.lastLabel}: ${money(data.last.total)}` : ''} />
        <Kpi icon="wallet" label="Customer wallets" tone="success" value={data ? money(data.wallets.wallets) : '—'} sub={data ? plural(data.wallets.customers.filter((c) => c.wallet > 0).length, 'customer') : ''} />
      </div>

      <section className="gc-card ac-card" aria-labelledby="lo-books">
        <div className="ac-head">
          <div><h2 id="lo-books">In your books</h2><p>Points and wallet money are held for customers (Accounts › Liabilities). Points used and rewards given are costs of the channel (Accounts › Sales &amp; profit).</p></div>
          <div className="ac-row-actions">
            <Link href="/liabilities" className="gc-btn gc-btn--sm gc-btn--neutral">Liabilities</Link>
            <Link href="/sales-profit" className="gc-btn gc-btn--sm gc-btn--neutral">Sales &amp; profit</Link>
          </div>
        </div>
        <div className="ly-books" style={{ borderTop: '1px solid var(--border-subtle)' }}>
          <div><span>Held as points</span><b>{data ? money(data.liab.value) : '—'}</b><span>{data ? plural(data.liab.members, 'member') : ''}</span></div>
          <div><span>Held in wallets</span><b>{data ? money(data.wallets.wallets) : '—'}</b><span>{data && data.wallets.advances ? `+ ${money(data.wallets.advances)} advances on invoices` : 'top-ups, return credit and rewards'}</span></div>
          <div><span>Points used · {data ? data.monthLabel : ''}</span><b>{data ? money(pointsLine(data.month, 'points')) : '—'}</b><span>{data ? `${data.lastLabel}: ${money(pointsLine(data.last, 'points'))}` : ''}</span></div>
          <div><span>Rewards and referral credit · {data ? data.monthLabel : ''}</span><b>{data ? money(pointsLine(data.month, 'reward')) : '—'}</b><span>{data ? `${data.lastLabel}: ${money(pointsLine(data.last, 'reward'))}` : ''}</span></div>
        </div>
      </section>

      <div className="lo-split">
        <form id="lo-form" className="lo-main" onSubmit={save} noValidate>
          <section className="gc-card lo-sec" aria-labelledby="lo-s1">
            <div className="lo-sechead"><span className="lo-num">1</span><div><h2 id="lo-s1">How customers earn points</h2><p>Points are added when the order is delivered, or at the counter when the sale is paid. A returned order takes its points back.</p></div></div>
            <div className="lo-rule"><div><b>For every ৳100 they spend, give</b><small>Example: a ৳2,500 bill gives {25 * draft.earnPer100} points before the level</small></div><Stepper label="points per ৳100" value={draft.earnPer100} min={1} max={20} onChange={(v) => set({ earnPer100: v })} /><span className="lo-unit">points</span></div>
            <div className="lo-rule"><div><b>Welcome gift on the first order</b><small>Given once, when the first order is delivered</small></div><Stepper label="welcome points" value={draft.welcome} step={10} max={1000} onChange={(v) => set({ welcome: v })} /><span className="lo-unit">points</span></div>
            <div className="lo-rule"><div><b>Birthday gift</b><small>Sent by SMS on the customer’s birthday</small></div><Stepper label="birthday points" value={draft.birthday} step={10} max={1000} onChange={(v) => set({ birthday: v })} /><span className="lo-unit">points</span></div>
          </section>

          <section className="gc-card lo-sec" aria-labelledby="lo-s2">
            <div className="lo-sechead"><span className="lo-num">2</span><div><h2 id="lo-s2">How customers use points</h2><p>Points work like money at the counter and on your website.</p></div></div>
            <div className="lo-rule"><div><b>1 point is worth</b><small>So 200 points = {money(200 * draft.pointValue)} off</small></div><Stepper label="taka per point" value={draft.pointValue} step={0.5} min={0.5} max={10} onChange={(v) => set({ pointValue: v })} /><span className="lo-unit">taka</span></div>
            {data ? (
              <div className="ac-note ac-note--info">
                <Icon name="info" width="16" height="16" aria-hidden="true" />
                <span>The {pts(heldPoints)} points customers hold are worth <b>{money(heldPoints * draft.pointValue)}</b> at this value{draft.pointValue !== data.liab.pointValue ? ` (now ${money(data.liab.value)})` : ''}. The POS register uses the same value.</span>
              </div>
            ) : null}
            <div className="lo-rule"><div><b>They can use points after collecting</b><small>Stops very small discounts</small></div><Stepper label="minimum points" value={draft.minUse} step={10} max={1000} onChange={(v) => set({ minUse: v })} /><span className="lo-unit">points</span></div>
            <div className="lo-rule"><div><b>Points can pay up to</b><small>The rest is paid in cash, bKash or card</small></div><Stepper label="percent of the bill" value={draft.maxPct} step={5} min={5} max={100} onChange={(v) => set({ maxPct: v })} /><span className="lo-unit">% of bill</span></div>
          </section>

          <section className="gc-card lo-sec" aria-labelledby="lo-s3">
            <div className="lo-sechead">
              <span className="lo-num">3</span>
              <div><h2 id="lo-s3">Member levels</h2><p>Customers move up by themselves when their total buying crosses the amount.</p></div>
              <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" aria-pressed={editTiers} onClick={() => setEditTiers((v) => !v)}><Icon name={editTiers ? 'check' : 'pencil'} width="16" height="16" aria-hidden="true" /> {editTiers ? 'Done' : 'Change levels'}</button>
            </div>
            <div className="lo-tiers">
              {draft.tiers.map((t, i) => (
                <div key={t.k} className="lo-tier">
                  <h3><Icon name="crown" width="18" height="18" aria-hidden="true" />{t.name}</h3>
                  {editTiers ? (
                    <>
                      {i > 0 ? <><label htmlFor={'lo-min-' + t.k}>From total bought (৳)</label><input id={'lo-min-' + t.k} className="gc-input ac-fig" inputMode="numeric" value={t.min} onChange={(e) => setTier(i, { min: Number(e.target.value.replace(/[^\d]/g, '')) || 0 })} /></> : <p>Everyone who buys once</p>}
                      <label htmlFor={'lo-mult-' + t.k}>Points × </label><input id={'lo-mult-' + t.k} className="gc-input ac-fig" inputMode="decimal" value={t.mult} onChange={(e) => setTier(i, { mult: Number(e.target.value.replace(/[^\d.]/g, '')) || 1 })} />
                      <label htmlFor={'lo-pct-' + t.k}>Member discount %</label><input id={'lo-pct-' + t.k} className="gc-input ac-fig" inputMode="decimal" value={t.pct} onChange={(e) => setTier(i, { pct: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} />
                    </>
                  ) : (
                    <>
                      <p>{i === 0 ? 'Everyone who buys once' : `Bought ${money(t.min)} or more in total`}</p>
                      <span className="lo-mult">{t.mult}x</span>
                      <p>points on every buy{t.pct ? ` · ${t.pct}% off at the counter` : ''}</p>
                    </>
                  )}
                  <span className="lo-count">{data ? plural(data.byTier[t.k] || 0, 'customer') : '—'}</span>
                </div>
              ))}
            </div>
          </section>

          <section className="gc-card lo-sec" aria-labelledby="lo-s4">
            <div className="lo-sechead"><span className="lo-num">4</span><div><h2 id="lo-s4">Turn on or off</h2></div></div>
            <div>
              <div className="lo-sw"><div><b>Reward points</b><small>Customers earn and use points</small></div><Switch on={draft.on.points} onToggle={() => setOn('points')} label="Reward points" /></div>
              <div className="lo-sw"><div><b>Customer wallet</b><small>Customers can keep money with you (bKash, Nagad, bank) and pay from it</small></div><Switch on={draft.on.wallet} onToggle={() => setOn('wallet')} label="Customer wallet" /></div>
              <div className="lo-sw"><div><b>Invite a friend</b><small>{draft.referral.kind === 'comm' ? `The customer gets ${draft.referral.pct}% of the friend’s first order in the wallet; the friend gets ${draft.referral.friendPoints} welcome points` : `Both get ${draft.referral.points} points when the friend’s first order is delivered`}</small></div><Switch on={draft.on.referral} onToggle={() => setOn('referral')} label="Invite a friend" /></div>
              <div className="lo-sw">
                <div><b>Points expire after {draft.expiryMonths} months</b><small>Unused points are removed. Customers get an SMS 7 days before.</small></div>
                {draft.expireOn ? <Stepper label="months before points expire" value={draft.expiryMonths} min={3} max={36} onChange={(v) => set({ expiryMonths: v })} /> : null}
                <Switch on={draft.expireOn} onToggle={() => set({ expireOn: !draft.expireOn })} label="Points expire" />
              </div>
              <div className="lo-sw"><div><b>Also at the POS counter</b><small>The cashier types the phone number; points are added to the same account</small></div><Switch on={draft.on.pos} onToggle={() => setOn('pos')} label="Also at the POS counter" /></div>
            </div>
          </section>

          {dirty ? (
            <div className="gc-card lo-bar" role="status">
              <span className="ac-sub" style={{ display: 'inline' }}>You changed the rules. They work from the next order once saved.</span>
              <span className="ac-row-actions"><button type="button" className="gc-btn gc-btn--neutral" onClick={reset}>Undo changes</button><button type="submit" className="gc-btn gc-btn--solid">Save rules</button></span>
            </div>
          ) : null}
        </form>

        <aside className="lo-side gc-side" aria-label="Example">
          <section className="gc-card lo-card" aria-labelledby="lo-ex">
            <h2 id="lo-ex">See how it works</h2>
            <span className="gc-label" style={{ margin: 0 }}>If a customer buys</span>
            <div className="ly-chips">{AMTS.map((a) => <button key={a} type="button" className="ly-chip" aria-pressed={amt === a} onClick={() => setAmt(a)}>{money(a)}</button>)}</div>
            <span className="gc-label" style={{ margin: 0 }}>and is a</span>
            <div className="ly-chips">{draft.tiers.map((t) => <button key={t.k} type="button" className="ly-chip" aria-pressed={tierK === t.k} onClick={() => setTierK(t.k)}>{t.name}</button>)}</div>
            <div className="lo-result" aria-live="polite"><span>They get</span><b>+{pts(exPts)} points</b><span>worth {money(exPts * draft.pointValue)} on the next buy</span></div>
            <ul className="lo-lines">
              <li><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>{money(amt)} ÷ 100 × {draft.earnPer100} × {T.name} {T.mult}x = {pts(exPts)} points</span></li>
              <li><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>Points can be used after collecting {pts(draft.minUse)}</span></li>
              <li><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>On a {money(amt)} bill, points can pay up to {money(amt * draft.maxPct / 100)}</span></li>
            </ul>
          </section>
          <section className="gc-card lo-card" aria-labelledby="lo-sms">
            <h2 id="lo-sms">SMS the customer gets</h2>
            <div className="lo-sms" lang="bn">ধন্যবাদ! আপনি {exPts} পয়েন্ট পেয়েছেন। মোট পয়েন্ট: {exPts + 180} (৳{Math.round((exPts + 180) * draft.pointValue)} ছাড়)। পরের কেনাকাটায় ব্যবহার করুন।</div>
            <p className="gc-help" style={{ margin: 0 }}>Sent after delivery. 1 SMS per order.</p>
          </section>
          {draft.expireOn ? (
            <section className="gc-card lo-card" aria-labelledby="lo-exp">
              <h2 id="lo-exp">Expired points</h2>
              <p className="gc-help" style={{ margin: 0 }}>{data ? `${pts(data.members.reduce((a, m) => a + m.expiring, 0))} points expire within a month.` : ''} Removing expired points lowers what you hold for customers; it is not income.</p>
              <button type="button" className="gc-btn gc-btn--neutral" onClick={runExpiry}><Icon name="clock-alert" width="18" height="18" aria-hidden="true" /> Remove expired points</button>
            </section>
          ) : null}
        </aside>
      </div>
    </LoyPage>
  );
}
