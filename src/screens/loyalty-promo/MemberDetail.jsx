'use client';
// MemberDetail — one loyalty member: points (and their ৳ value), level progress, wallet money,
// buying and invites, with the full points and wallet history.
//   Points   give or take points with a reason (the POS counter sees the new balance).
//   Wallet   add money (asks which account received it), pay money back (asks which account pays,
//            up to the balance), or give credit free (a reward cost, no money moves).
// ?phone=<mobile> picks the member (Rakibul Hasan when none is given).
// Front end only: src/lib/loyalty.js.

import React, { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { EmptyState } from '@/components/ui';
import { formatDate, formatTime } from '@/lib/format';
import { findMember, memberHistory, getLoyaltySettings, getReferrers, WALLET_KIND } from '@/lib/loyalty';
import { accName } from '@/screens/accounts/accShared';
import { LoyPage, Kpi, TierBadge, WalletDialog, PointsDialog, useLoyalty, money, pts, plural } from './loyShared';

const DEFAULT_PHONE = '01819072332';
const KIND_WORD = { earn: 'Earned', redeem: 'Used', adjust: 'By hand', expire: 'Expired', welcome: 'Welcome', birthday: 'Birthday', referral: 'Invite', return: 'Return' };
const CSS = `
.md-head{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-4);padding:var(--space-5)}
.md-head .ly-ava{width:56px;height:56px;font-size:var(--text-lg)}
.md-head h2{margin:0;display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);font-size:var(--text-lg);font-weight:var(--weight-semibold);color:var(--text-heading)}
.md-head p{margin:2px 0 0;font-size:var(--text-xs);color:var(--text-muted)}
.md-head > div{flex:1 1 240px;min-width:0}
.md-prog{display:flex;flex-direction:column;gap:6px;padding:0 var(--space-5) var(--space-5)}
.md-prog p{display:flex;flex-wrap:wrap;justify-content:space-between;gap:var(--space-2);margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.md-amt{font-family:var(--font-data);font-variant-numeric:tabular-nums;font-weight:var(--weight-semibold);white-space:nowrap}
`;

export default function MemberDetail() {
  const tick = useLoyalty();
  const [phone, setPhone] = useState('');
  const [tab, setTab] = useState('points');
  const [dialog, setDialog] = useState(null);   // { kind: 'points'|'wallet', mode }

  useEffect(() => {
    const read = () => setPhone(new URLSearchParams(window.location.search).get('phone') || DEFAULT_PHONE);
    read();
    window.addEventListener('gc:route', read);
    return () => window.removeEventListener('gc:route', read);
  }, []);

  const data = useMemo(() => {
    if (!tick || !phone) return null;
    const m = findMember(phone);
    if (!m) return { m: null };
    const s = getLoyaltySettings();
    const next = s.tiers.filter((t) => t.min > m.tierObj.min).sort((a, b) => a.min - b.min)[0] || null;
    const ref = getReferrers().find((r) => r.phone === m.phone) || null;
    return { m, s, next, ref, history: memberHistory(m.phone) };
  }, [tick, phone]);

  const m = data && data.m;
  if (data && !m) {
    return (
      <LoyPage screen="MemberDetail" active="loy-members" crumb="Loyalty & rewards / Members" page="Member" title="Member">
        <section className="gc-card"><EmptyState icon="user-x" title="No member with this number" body={`${phone} is not a loyalty member yet.`} /></section>
        <div><Link href="/members" className="gc-btn gc-btn--neutral"><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /> All members</Link></div>
      </LoyPage>
    );
  }

  const open = (kind, mode) => setDialog({ kind, mode });
  const list = data ? (tab === 'points' ? data.history.points : data.history.wallet) : [];
  const pct = m && data.next ? Math.min(100, Math.round((m.bought / data.next.min) * 100)) : 100;

  return (
    <LoyPage screen="MemberDetail" active="loy-members" crumb="Loyalty & rewards / Members" page={m ? m.name : 'Member'} title={m ? m.name : 'Member'}
      description={m ? `Member since ${formatDate(m.joined)}${m.birthday ? ' · birthday ' + m.birthday : ''}` : ''}
      actions={m ? <>
        <Link href="/members" className="gc-btn gc-btn--neutral"><Icon name="arrow-left" width="18" height="18" aria-hidden="true" /> Members</Link>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={() => open('points', 'give')}><Icon name="star" width="18" height="18" aria-hidden="true" /> Give or take points</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={() => open('wallet', 'topup')}><Icon name="wallet" width="18" height="18" aria-hidden="true" /> Add money</button>
      </> : null}>
      {!m ? <section className="gc-card"><EmptyState icon="loader" title="Reading the member" /></section> : (
        <>
          <section className="gc-card" aria-label="Member">
            <div className="md-head">
              <span className="ly-ava" aria-hidden="true">{m.name.charAt(0)}</span>
              <div><h2>{m.name} <TierBadge m={m} /></h2><p className="ac-fig">{m.phone}{m.code ? ' · invite code ' + m.code : ''}</p></div>
              <div className="ac-row-actions">
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => open('wallet', 'refund')} disabled={!m.wallet}>Pay back wallet</button>
                <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => open('wallet', 'reward')}>Give credit</button>
              </div>
            </div>
            <div className="md-prog">
              <p><span>{data.next ? `To ${data.next.name}: ${money(m.bought)} / ${money(data.next.min)}` : `${m.tierObj.name} is the top level`}</span><span>{data.next ? `Buy ${money(data.next.min - m.bought)} more to get ${data.next.mult}x points` : `${m.tierObj.mult}x points on every buy`}</span></p>
              <div className="gc-progress" role="progressbar" aria-label="Progress to the next level" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct}><div className="gc-progress__fill" style={{ width: pct + '%' }} /></div>
            </div>
          </section>

          <div className="gc-kpis gc-kpis--tight">
            <Kpi icon="star" label="Points now" value={pts(m.points)} sub={`= ${money(m.value)} off`} />
            <Kpi icon="wallet" tone="success" label="Wallet money" value={money(m.wallet)} sub="held for the customer" />
            <Kpi icon="shopping-bag" tone="info" label="Total bought" value={money(m.bought)} sub={m.last ? 'last ' + formatDate(m.last) : ''} />
            <Kpi icon="share-2" tone="warning" label="Friends invited" value={data.ref ? pts(data.ref.joined) : '0'} sub={data.ref ? `${money(data.ref.earned)} earned${data.ref.due ? ' · ' + money(data.ref.due) + ' due' : ''}` : m.code ? 'code ' + m.code : 'no invite code'} />
          </div>

          <section className="gc-card ly-card" aria-label="History">
            <div className="ly-bar">
              <div className="gc-tabs" role="tablist" aria-label="History">
                <button type="button" role="tab" aria-selected={tab === 'points'} className={'gc-tab ly-tab' + (tab === 'points' ? ' gc-tab--active' : '')} onClick={() => setTab('points')}>Points history<b>{data.history.points.length}</b></button>
                <button type="button" role="tab" aria-selected={tab === 'wallet'} className={'gc-tab ly-tab' + (tab === 'wallet' ? ' gc-tab--active' : '')} onClick={() => setTab('wallet')}>Wallet money<b>{data.history.wallet.length}</b></button>
              </div>
            </div>
            {list.length === 0 ? <EmptyState icon="history" title={tab === 'points' ? 'No points yet' : 'No wallet money yet'} body={tab === 'points' ? 'Points show here from the first order.' : 'Top-ups, return credit and rewards show here.'} actionLabel={tab === 'wallet' ? 'Add money' : 'Give points'} onAction={() => (tab === 'wallet' ? open('wallet', 'topup') : open('points', 'give'))} /> : (
              <div className="gc-table-wrap">
                <table className="gc-table gc-table--compact">
                  <thead><tr><th scope="col">Date</th><th scope="col">What happened</th><th scope="col">{tab === 'points' ? 'Channel' : 'Account'}</th><th scope="col" className="ac-num">{tab === 'points' ? 'Points' : 'Amount'}</th><th scope="col" className="ac-num">Balance after</th></tr></thead>
                  <tbody>
                    {list.map((e) => {
                      const v = tab === 'points' ? e.points : e.amount;
                      const up = v > 0;
                      return (
                        <tr key={e.id}>
                          <td>{formatDate(e.at)}<span className="ac-sub">{formatTime(e.at)}</span></td>
                          <td><span className="ac-strong">{e.what}</span><span className="ac-sub">{[tab === 'points' ? KIND_WORD[e.kind] : WALLET_KIND[e.kind], e.sub].filter(Boolean).join(' · ')}{tab === 'points' && e.kind === 'redeem' && e.value ? ` · ${money(e.value)} off` : ''}</span></td>
                          <td>{tab === 'points' ? (e.channel || '—') : e.account ? accName(e.account) : <span className="ac-sub" style={{ display: 'inline' }}>No money moved</span>}</td>
                          <td className={'ac-num md-amt ' + (up ? 'ly-in' : 'ly-out')}>{up ? '+' : '−'}{tab === 'points' ? pts(Math.abs(v)) : money(v)}</td>
                          <td className="ac-num ac-fig">{tab === 'points' ? pts(e.after) : money(e.after)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </section>
          <p className="gc-help" style={{ margin: 0 }}>{plural(m.points, 'point')} are worth {money(m.value)} at {money(data.s.pointValue)} a point. Points and wallet money are money you hold for {m.name}; they show under Accounts › Liabilities.</p>
        </>
      )}
      {dialog && m && dialog.kind === 'points' ? <PointsDialog phone={m.phone} mode={dialog.mode} onClose={() => setDialog(null)} /> : null}
      {dialog && m && dialog.kind === 'wallet' ? <WalletDialog mode={dialog.mode} phone={m.phone} onClose={() => setDialog(null)} /> : null}
    </LoyPage>
  );
}
