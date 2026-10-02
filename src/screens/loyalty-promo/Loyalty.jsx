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
import { LoyPage, Stepper, Switch, useLoyalty, money, pts, plural } from './loyShared';
import { InfoTip } from '@/components/ui';
import { MetricStrip, KV } from '@/components/ui/IndexKit';

const AMTS = [500, 2500, 10000];
const MONTH = (t) => new Date(t).toLocaleString('en', { month: 'long' });

const CSS = `
.lo-tiers{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-3)}
.lo-tier{display:flex;flex-direction:column;gap:4px;padding:var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);min-width:0}
.lo-tier h3{margin:0;display:flex;align-items:center;gap:6px;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.lo-tier h3 svg{color:var(--text-muted)}
.lo-tier p{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.lo-tier label{font-size:var(--text-xs);color:var(--text-muted)}
.lo-mult{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--primary)}
.lo-count{margin-top:auto;padding-top:var(--space-2);border-top:1px solid var(--border-subtle);font-size:var(--text-xs);color:var(--text-body)}
.lo-result{display:flex;flex-direction:column;gap:2px;padding:var(--space-3);border-radius:var(--radius-lg);background:var(--fill-primary-soft);color:var(--primary);font-size:var(--text-xs)}
.lo-result b{font-family:var(--font-data);font-size:var(--text-sm-plus);font-weight:var(--weight-semibold)}
.lo-lines{display:flex;flex-direction:column;gap:6px;margin:0;padding:0;list-style:none;font-size:var(--text-xs);color:var(--text-body)}
.lo-lines li{display:flex;gap:var(--space-2)}
.lo-lines svg{flex:none;margin-top:1px;color:var(--text-success)}
.lo-sms{padding:var(--space-3);border-radius:var(--radius-lg) var(--radius-lg) var(--radius-lg) var(--radius-sm);background:var(--surface-subtle);font-family:var(--font-bn);font-size:var(--text-sm);line-height:1.6;color:var(--text-heading)}
.lo-bar{display:flex;flex-wrap:wrap;align-items:center;justify-content:space-between;gap:var(--space-3)}
.lo-side .ix-card__body{display:flex;flex-direction:column;gap:var(--space-3)}
@media (max-width:900px){.lo-tiers{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media (max-width:480px){.lo-tiers{grid-template-columns:minmax(0,1fr)}}
`;

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

  const exp = data && draft.expireOn ? data.members.reduce((a, m) => a + m.expiring, 0) : 0;

  return (
    <LoyPage screen="Loyalty" active="loy-home" title="Loyalty & rewards" icon="crown" css={CSS}
      about="Reward loyal customers. They collect points when they buy and use them as money off next time; points they hold are a promise you keep until they are used."
      secondary={[{ label: 'See members', href: '/members' }]}
      more={[{ label: 'Product points', href: '/product-points' }, { label: 'Customer wallet', href: '/wallet' }, { label: 'Invite a friend', href: '/referrals' }, { label: 'Bills to pay', href: '/liabilities' }, { label: 'Sales & profit', href: '/sales-profit' }]}
      primary={{ label: 'Save rules', onClick: save }}>
      <MetricStrip items={[
        { label: 'Members', value: data ? pts(data.members.length) : '—', sub: data ? `+${data.joined} joined in ${data.monthLabel}` : '', href: '/members' },
        { label: 'Points customers hold', value: data ? money(data.liab.value) : '—', sub: data ? `${pts(data.liab.points)} points` : '' },
        { label: `Loyalty cost · ${data ? data.monthLabel : 'this month'}`, value: data ? money(data.month.total) : '—', sub: data ? `${data.lastLabel}: ${money(data.last.total)}` : '' },
        { label: 'Customer wallets', value: data ? money(data.wallets.wallets) : '—', sub: data ? plural(data.wallets.customers.filter((c) => c.wallet > 0).length, 'customer') : '', href: '/wallet' },
      ]} />

      <div className="ix-record">
        <form id="lo-form" className="ix-main" onSubmit={save} noValidate>
          <section className="ix-card" aria-labelledby="lo-s1">
            <header className="ix-card__head"><h2 id="lo-s1">How customers earn points <InfoTip text="Points are added when the order is delivered, or at the counter when the sale is paid. A returned order takes its points back." /></h2></header>
            <div className="ix-card__body">
              <div className="ly-set"><div><b>For every ৳100 they spend, give <InfoTip text={`Example: a ৳2,500 bill gives ${25 * draft.earnPer100} points before the level`} /></b></div><Stepper label="points per ৳100" value={draft.earnPer100} min={1} max={20} onChange={(v) => set({ earnPer100: v })} /><span className="ly-sub">points</span></div>
              <div className="ly-set"><div><b>Welcome gift on the first order <InfoTip text="Given once, when the first order is delivered" /></b></div><Stepper label="welcome points" value={draft.welcome} step={10} max={1000} onChange={(v) => set({ welcome: v })} /><span className="ly-sub">points</span></div>
              <div className="ly-set"><div><b>Birthday gift <InfoTip text="Sent by SMS on the customer’s birthday" /></b></div><Stepper label="birthday points" value={draft.birthday} step={10} max={1000} onChange={(v) => set({ birthday: v })} /><span className="ly-sub">points</span></div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="lo-s2">
            <header className="ix-card__head"><h2 id="lo-s2">How customers use points <InfoTip text="Points work like money at the counter and on your website." /></h2></header>
            <div className="ix-card__body">
              <div className="ly-set"><div><b>1 point is worth <InfoTip text={`So 200 points = ${money(200 * draft.pointValue)} off`} /></b>{data && draft.pointValue !== data.liab.pointValue ? <small>The {pts(heldPoints)} points customers hold are worth {money(heldPoints * draft.pointValue)} at this value (now {money(data.liab.value)}).</small> : null}</div><Stepper label="taka per point" value={draft.pointValue} step={0.5} min={0.5} max={10} onChange={(v) => set({ pointValue: v })} /><span className="ly-sub">taka</span></div>
              <div className="ly-set"><div><b>They can use points after collecting <InfoTip text="Stops very small discounts" /></b></div><Stepper label="minimum points" value={draft.minUse} step={10} max={1000} onChange={(v) => set({ minUse: v })} /><span className="ly-sub">points</span></div>
              <div className="ly-set"><div><b>Points can pay up to <InfoTip text="The rest is paid in cash, bKash or card" /></b></div><Stepper label="percent of the bill" value={draft.maxPct} step={5} min={5} max={100} onChange={(v) => set({ maxPct: v })} /><span className="ly-sub">% of bill</span></div>
            </div>
          </section>

          <section className="ix-card" aria-labelledby="lo-s3">
            <header className="ix-card__head">
              <h2 id="lo-s3">Member levels <InfoTip text="Customers move up by themselves when their total buying crosses the amount." /></h2>
              <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" aria-pressed={editTiers} onClick={() => setEditTiers((v) => !v)}>{editTiers ? 'Done' : 'Change levels'}</button>
            </header>
            <div className="ix-card__body">
              <div className="lo-tiers">
                {draft.tiers.map((t, i) => (
                  <div key={t.k} className="lo-tier">
                    <h3><Icon name="crown" width="16" height="16" aria-hidden="true" />{t.name}</h3>
                    {editTiers ? (
                      <>
                        {i > 0 ? <><label htmlFor={'lo-min-' + t.k}>From total bought (৳)</label><input id={'lo-min-' + t.k} className="gc-input ly-fig" inputMode="numeric" value={t.min} onChange={(e) => setTier(i, { min: Number(e.target.value.replace(/[^\d]/g, '')) || 0 })} /></> : <p>Everyone who buys once</p>}
                        <label htmlFor={'lo-mult-' + t.k}>Points × </label><input id={'lo-mult-' + t.k} className="gc-input ly-fig" inputMode="decimal" value={t.mult} onChange={(e) => setTier(i, { mult: Number(e.target.value.replace(/[^\d.]/g, '')) || 1 })} />
                        <label htmlFor={'lo-pct-' + t.k}>Member discount %</label><input id={'lo-pct-' + t.k} className="gc-input ly-fig" inputMode="decimal" value={t.pct} onChange={(e) => setTier(i, { pct: Number(e.target.value.replace(/[^\d.]/g, '')) || 0 })} />
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
            </div>
          </section>

          <section className="ix-card" aria-labelledby="lo-s4">
            <header className="ix-card__head"><h2 id="lo-s4">Turn on or off</h2></header>
            <div className="ix-card__body">
              <div className="ly-set"><div><b>Reward points <InfoTip text="Customers earn and use points" /></b></div><Switch on={draft.on.points} onToggle={() => setOn('points')} label="Reward points" /></div>
              <div className="ly-set"><div><b>Customer wallet <InfoTip text="Customers can keep money with you (bKash, Nagad, bank) and pay from it" /></b></div><Switch on={draft.on.wallet} onToggle={() => setOn('wallet')} label="Customer wallet" /></div>
              <div className="ly-set"><div><b>Invite a friend <InfoTip text={draft.referral.kind === 'comm' ? `The customer gets ${draft.referral.pct}% of the friend’s first order in the wallet; the friend gets ${draft.referral.friendPoints} welcome points` : `Both get ${draft.referral.points} points when the friend’s first order is delivered`} /></b></div><Switch on={draft.on.referral} onToggle={() => setOn('referral')} label="Invite a friend" /></div>
              <div className="ly-set">
                <div><b>Points expire after {draft.expiryMonths} months <InfoTip text="Unused points are removed. Customers get an SMS 7 days before." /></b></div>
                {draft.expireOn ? <Stepper label="months before points expire" value={draft.expiryMonths} min={3} max={36} onChange={(v) => set({ expiryMonths: v })} /> : null}
                <Switch on={draft.expireOn} onToggle={() => set({ expireOn: !draft.expireOn })} label="Points expire" />
              </div>
              <div className="ly-set"><div><b>Also at the POS counter <InfoTip text="The cashier types the phone number; points are added to the same account" /></b></div><Switch on={draft.on.pos} onToggle={() => setOn('pos')} label="Also at the POS counter" /></div>
            </div>
          </section>

          {dirty ? (
            <div className="ix-card ix-card--pad lo-bar" role="status">
              <span className="ly-note">You changed the rules. They work from the next order once saved.</span>
              <span className="ac-row-actions"><button type="button" className="ix-btn" onClick={reset}>Undo changes</button><button type="submit" className="ix-btn ix-btn--primary">Save rules</button></span>
            </div>
          ) : null}
        </form>

        <aside className="ix-side lo-side" aria-label="Example">
          <section className="ix-card" aria-labelledby="lo-ex">
            <header className="ix-card__head"><h2 id="lo-ex">See how it works</h2></header>
            <div className="ix-card__body">
              <span className="ly-sub">If a customer buys</span>
              <div className="ix-chips">{AMTS.map((a) => <button key={a} type="button" className="ix-chip" aria-pressed={amt === a} onClick={() => setAmt(a)}>{money(a)}</button>)}</div>
              <span className="ly-sub">and is a</span>
              <div className="ix-chips">{draft.tiers.map((t) => <button key={t.k} type="button" className="ix-chip" aria-pressed={tierK === t.k} onClick={() => setTierK(t.k)}>{t.name}</button>)}</div>
              <div className="lo-result" aria-live="polite"><span>They get</span><b>+{pts(exPts)} points</b><span>worth {money(exPts * draft.pointValue)} on the next buy</span></div>
              <ul className="lo-lines">
                <li><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>{money(amt)} ÷ 100 × {draft.earnPer100} × {T.name} {T.mult}x = {pts(exPts)} points</span></li>
                <li><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>Points can be used after collecting {pts(draft.minUse)}</span></li>
                <li><Icon name="circle-check" width="16" height="16" aria-hidden="true" /><span>On a {money(amt)} bill, points can pay up to {money(amt * draft.maxPct / 100)}</span></li>
              </ul>
            </div>
          </section>
          <section className="ix-card" aria-labelledby="lo-sms">
            <header className="ix-card__head"><h2 id="lo-sms">SMS the customer gets <InfoTip text="Sent after delivery. 1 SMS per order." /></h2></header>
            <div className="ix-card__body">
              <div className="lo-sms" lang="bn">ধন্যবাদ! আপনি {exPts} পয়েন্ট পেয়েছেন। মোট পয়েন্ট: {exPts + 180} (৳{Math.round((exPts + 180) * draft.pointValue)} ছাড়)। পরের কেনাকাটায় ব্যবহার করুন।</div>
            </div>
          </section>
          <section className="ix-card" aria-labelledby="lo-books">
            <header className="ix-card__head"><h2 id="lo-books">In your books <InfoTip text="Points and wallet money are held for customers (Accounts › Liabilities). Points used and rewards given are costs of the channel (Accounts › Sales & profit)." /></h2><Link href="/liabilities">Bills to pay</Link></header>
            <div className="ix-card__body">
              <KV rows={[
                ['Held as points', data ? money(data.liab.value) : '—'],
                ['Held in wallets', data ? money(data.wallets.wallets) + (data.wallets.advances ? ` + ${money(data.wallets.advances)} advances on invoices` : '') : '—'],
                [`Points used · ${data ? data.monthLabel : ''}`, data ? money(pointsLine(data.month, 'points')) : '—'],
                [`Rewards and referral credit · ${data ? data.monthLabel : ''}`, data ? money(pointsLine(data.month, 'reward')) : '—'],
              ]} />
            </div>
          </section>
          {draft.expireOn ? (
            <section className="ix-card" aria-labelledby="lo-exp">
              <header className="ix-card__head"><h2 id="lo-exp">Expired points <InfoTip text="Removing expired points lowers what you hold for customers; it is not income." /></h2></header>
              <div className="ix-card__body">
                {data ? <p className="ly-note">{pts(exp)} points expire within a month.</p> : null}
                <button type="button" className="ix-btn" onClick={runExpiry}><Icon name="clock-alert" width="16" height="16" aria-hidden="true" />Remove expired points</button>
              </div>
            </section>
          ) : null}
        </aside>
      </div>
    </LoyPage>
  );
}
