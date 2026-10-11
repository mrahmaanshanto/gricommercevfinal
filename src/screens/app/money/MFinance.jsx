'use client';
// Merchant app · Finance (/m-finance). The web's Money overview + Money + Approvals on a phone, from the same books:
//   hero        money in hand (the shop's own cash, bank and wallet accounts, lib/ledger.js balances), what partners
//               hold for the shop (lib/settlements.js)
//   figures     today's money in and out of the own accounts (moves between them left out) and net profit this month
//               (lib/profit.js profitByChannel; last month early in a month), as on Accounts › Money overview
//   quick       Add expense (/m-expense-new) · Money in · Money out · Move money (the web Money page's forms: over an
//               approval limit nothing is posted, it waits in Approvals — lib/approvals.js needsApproval / submit)
//   Approvals   money waiting for a second person: a sheet with the facts and the limit; Approve posts it, Deny asks a
//               reason (lib/approvalActions.js decide). The person who asked can't decide (financeDuties.canDecide);
//               they can take it back (approvals.cancelRequest)
//   Accounts    each account's balance; a sheet with its latest movements and Move money from it
//   Latest      the last movements in or out of the own accounts
// Everything is read after mount and again when the books change (useAppData listens to gc:ledger).

import React, { useEffect, useMemo, useState } from 'react';
import {
  AppScreen, Content, LargeHeader, TabBar, Section, Card, ListRow, Tile, TileGrid, Stat, StatRow, IconButton, Button,
  Sheet, Field, TextInput, Note, Pill, EmptyState, Skeleton, Segmented, useAppData, refresh, toast, money, ago, dateText,
} from '../kit/AppKit';
import { BrandLogo } from '@/components/BrandLogo';
import { postEntry, transferBetween, balanceOf } from '@/lib/ledger';
import { needsApproval, submit, cancelRequest } from '@/lib/approvals';
import { decide } from '@/lib/approvalActions';
import { canDecide, peopleWith } from '@/lib/financeDuties';
import {
  financeData, accountMoves, accountOptions, allowed, accName, accIcon, whatOf, subOf, safe, KIND_TEXT, limitText, TYPE_LABEL,
} from './moneyData';
import { AccountField, AmountField, ChoiceChips, Lines, HeroCard, Signed, NotHere } from './moneyParts';

const IN_REASONS = [['investment', 'Owner put money in'], ['cash in', 'Other money in']];
const OUT_REASONS = [['owner withdraw', 'Owner took money'], ['expense', 'Bank or wallet charge'], ['paid out', 'Other money out']];
const MODES = [{ key: 'in', label: 'Money in' }, { key: 'out', label: 'Money out' }, { key: 'transfer', label: 'Move' }];
const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** The approval limit a money move or money out passes (as the web Money page), or null. */
function approvalOf(form, amt) {
  if (!(amt > 0) || form.mode === 'in') return null;
  if (form.mode === 'transfer') return needsApproval({ kind: 'move', amount: amt, account: form.account, to: form.to });
  if (form.reason === 'expense') return needsApproval({ kind: 'expense', amount: amt, cat: 'Bank charges', account: form.account });
  return needsApproval({ kind: 'move', amount: amt, account: form.account });
}

export default function MFinanceScreen() {
  const { ready, tick, ctx } = useAppData(['gc:settle'], { every: 60000 });
  const [data, setData] = useState(null);
  const [form, setForm] = useState(null);       // { mode, account, to, reason, amount, note, tried }
  const [reqId, setReqId] = useState('');
  const [accId, setAccId] = useState('');
  useEffect(() => {
    if (!ready || !ctx) return undefined;
    const id = window.setTimeout(() => setData(safe(() => financeData(), null)), 0);
    return () => window.clearTimeout(id);
  }, [ready, tick, ctx]);

  if (ctx && !allowed('/m-finance', ctx)) return <NotHere name="MFinance" title="Finance" />;
  const me = ctx ? ctx.user : null;
  const can = (r) => !!ctx && allowed(r, ctx);
  const openForm = (mode, from) => {
    const first = from || 'cash-shop';
    setAccId('');
    setForm({ mode, account: first, to: first === 'safe' ? 'brac' : 'safe', reason: mode === 'in' ? 'investment' : 'owner withdraw', amount: '', note: '', tried: false });
  };
  const req = reqId && data ? data.approvals.find((r) => r.id === reqId) || null : null;
  const acc = accId && data ? data.accounts.find((a) => a.id === accId) : null;

  return (
    <AppScreen name="MFinance" title="Finance">
      <Content top={47}>
        <LargeHeader title="Finance" actions={can('/m-expense-new') ? <IconButton icon="plus" label="Add expense" href="/m-expense-new" soft /> : null} />

        <HeroCard
          label="Money in hand"
          value={data ? money(data.total) : '—'}
          pill={data && data.held ? `${money(data.held)} with partners` : null}
          figures={data ? data.groups.map((g) => [money(g.total), g.type === 'Mobile' ? 'Wallets' : g.label]) : [['—', 'Cash'], ['—', 'Banks'], ['—', 'Wallets']]}
        />

        <StatRow cols={3} style={{ padding: '12px 20px 0' }}>
          <Stat tone="ok" label="In today" value={data ? money(data.moneyIn) : '—'} />
          <Stat tone="err" label="Out today" value={data ? money(data.moneyOut) : '—'} />
          <Stat tone="nav" label={data ? `Profit · ${data.profitLabel.replace(' so far', '')}` : 'Profit'} value={data ? money(data.profit) : '—'} />
        </StatRow>

        <TileGrid cols={4}>
          {can('/m-expense-new') ? <Tile href="/m-expense-new" icon="receipt" label="Add expense" /> : null}
          <Tile onClick={() => openForm('in')} icon="plus" label="Money in" />
          <Tile onClick={() => openForm('out')} icon="minus" label="Money out" />
          <Tile onClick={() => openForm('transfer')} icon="arrows" label="Move money" />
        </TileGrid>

        {!data ? <><Section title="Accounts" /><Skeleton rows={4} /></> : (
          <>
            {data.approvals.length ? (
              <Section title="Waiting for approval" action={<Pill tone="warn">{data.approvals.length}</Pill>}>
                <Card>
                  {data.approvals.map((r) => (
                    <ListRow key={r.id} onClick={() => setReqId(r.id)} icon={r.kind === 'move' ? 'arrows' : r.kind === 'refund' ? 'undo' : r.kind === 'write-off' ? 'receipt' : 'cash'}
                      title={r.title} sub={`${KIND_TEXT[r.kind] || r.kind} · ${r.byName} · ${ago(r.at, data.now)}`}
                      end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{money(r.amount)}</span>} />
                  ))}
                </Card>
              </Section>
            ) : null}

            <Section title="Accounts" action={<span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{money(data.total)}</span>}>
              <Card>
                {data.accounts.map((a) => (
                  <ListRow key={a.id} onClick={() => setAccId(a.id)} avatar={<BrandLogo brand={a.brand} size={44} decorative style={{ borderRadius: 'var(--radius-xl)' }} />}
                    title={a.name} sub={TYPE_LABEL[a.type]}
                    end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: a.balance < 0 ? 'var(--err)' : undefined }}>{money(a.balance)}</span>} />
                ))}
              </Card>
            </Section>

            <Section title="Latest movements">
              {data.latest.length ? (
                <Card>
                  {data.latest.map((e) => (
                    <ListRow key={e.id} icon={accIcon((data.accounts.find((a) => a.id === e.account) || {}).type)} title={whatOf(e)}
                      sub={`${accName(e.account)} · ${ago(e.at, data.now)}${subOf(e) ? ' · ' + subOf(e) : ''}`} end={<Signed n={e.amount} />} chevron={false} />
                  ))}
                </Card>
              ) : <Card><EmptyState icon="wallet" title="No money moved yet" /></Card>}
            </Section>

            {can('/m-payouts') || can('/m-dues') || can('/m-reports') ? (
              <Section title="More">
                <Card>
                  {can('/m-payouts') ? <ListRow href="/m-payouts" icon="cash" title="Payouts" sub={data.held ? `${money(data.held)} with gateways and couriers` : 'Gateways and couriers'} /> : null}
                  {can('/m-dues') ? <ListRow href="/m-dues" icon="receipt" title="Dues" sub="Who owes you and what you owe" /> : null}
                  {can('/m-reports') ? <ListRow href="/m-reports" icon="chart" title="Reports" sub="Profit, cash, expenses and more" /> : null}
                </Card>
              </Section>
            ) : null}
          </>
        )}
        <div style={{ height: '8px' }} />
      </Content>
      <TabBar />

      {form ? <MoneySheet form={form} setForm={setForm} me={me} onDone={() => { setForm(null); refresh(); }} /> : null}
      {req ? <ReviewSheet r={req} me={me} limits={data.limits} onClose={() => setReqId('')} /> : null}
      {acc ? (
        <Sheet open title={acc.name} onClose={() => setAccId('')}
          footer={<><Button kind="line" onClick={() => openForm('out', acc.id)}>Money out</Button><Button kind="primary" style={{ flex: 2 }} onClick={() => openForm('transfer', acc.id)}>Move money</Button></>}>
          <AccountMoves acc={acc} now={data.now} />
        </Sheet>
      ) : null}
    </AppScreen>
  );
}

function AccountMoves({ acc, now }) {
  const moves = useMemo(() => accountMoves(acc.id, 12), [acc.id]);
  return (
    <>
      <div className="k">{TYPE_LABEL[acc.type]}</div>
      <div className="v num" style={{ marginBottom: '12px' }}>{money(acc.balance)}</div>
      {moves.length ? (
        <div className="card" style={{ margin: 0, boxShadow: 'none', border: '1px solid var(--line)' }}>
          {moves.map((e) => (
            <ListRow key={e.id} compact title={whatOf(e)} sub={`${dateText(e.at, { time: true })}${subOf(e) ? ' · ' + subOf(e) : ''}`} end={<Signed n={e.amount} />} chevron={false} />
          ))}
        </div>
      ) : <EmptyState icon="wallet" title="No money moved here yet" />}
      <div className="help" style={{ marginTop: '8px' }}>{moves.length ? `Last ${moves.length} · ${ago(moves[moves.length - 1].at, now)} to now` : ''}</div>
    </>
  );
}

/** Money in · Money out · Move money between two accounts (the web Money page's form). */
function MoneySheet({ form, setForm, me, onDone }) {
  const accounts = useMemo(() => accountOptions(null, form.account), [form.account]);
  const amt = r2(form.amount);
  const rule = approvalOf(form, amt);
  const bal = balanceOf(form.account);
  const set = (patch) => setForm({ ...form, ...patch });
  const reasons = form.mode === 'in' ? IN_REASONS : OUT_REASONS;
  const err = form.tried && !(amt > 0) ? 'Enter an amount.' : '';
  const save = () => {
    if (!(amt > 0)) { set({ tried: true }); return; }
    if (form.mode === 'transfer' && form.account === form.to) { toast('Pick two different accounts', { tone: 'error' }); return; }
    const meta = { note: form.note.trim(), by: (me && me.name) || 'Staff' };
    if (rule) {
      const label = form.mode === 'transfer' ? `${accName(form.account)} to ${accName(form.to)}` : (OUT_REASONS.find((r) => r[0] === form.reason) || [])[1];
      const payload = form.mode === 'transfer'
        ? { transfer: true, from: form.account, to: form.to, amount: amt, party: accName(form.to), note: meta.note || `${accName(form.account)} → ${accName(form.to)}` }
        : { ...meta, account: form.account, amount: -amt, kind: form.reason, party: form.reason === 'owner withdraw' ? 'Owner' : label, ...(form.reason === 'expense' ? { cat: 'Bank charges' } : {}) };
      const today = dateText(Date.now());
      const r = submit({ kind: form.reason === 'expense' && form.mode === 'out' ? 'expense' : 'move', title: label + (meta.note ? ' · ' + meta.note : ''), amount: amt, payload, rule, user: me,
        facts: form.mode === 'transfer' ? [['From', accName(form.account)], ['To', accName(form.to)], ['Date', today]] : [['From', accName(form.account)], ['What', label], ['Date', today]] });
      toast(`${money(amt)} waits for approval (${r.id})`);
      onDone();
      return;
    }
    if (form.mode === 'transfer') {
      transferBetween(form.account, form.to, amt, { ...meta, party: accName(form.to), note: meta.note || `${accName(form.account)} → ${accName(form.to)}` });
      toast(`${money(amt)} moved from ${accName(form.account)} to ${accName(form.to)}`);
    } else {
      const sign = form.mode === 'in' ? 1 : -1;
      const label = reasons.find((r) => r[0] === form.reason)[1];
      postEntry({ ...meta, account: form.account, amount: sign * amt, kind: form.reason, party: form.reason === 'investment' || form.reason === 'owner withdraw' ? 'Owner' : label, ...(form.reason === 'expense' ? { cat: 'Bank charges' } : {}) });
      toast(`${money(amt)} ${form.mode === 'in' ? 'added to' : 'taken out of'} ${accName(form.account)}`);
    }
    onDone();
  };
  const switchMode = (mode) => set({ mode, reason: mode === 'in' ? 'investment' : 'owner withdraw', tried: false });
  const title = form.mode === 'transfer' ? 'Move money' : form.mode === 'in' ? 'Money in' : 'Money out';
  return (
    <Sheet open title={title} onClose={() => setForm(null)}
      footer={<><Button kind="line" onClick={() => setForm(null)}>Cancel</Button><Button kind="primary" style={{ flex: 2 }} onClick={save}>{rule ? 'Ask for approval' : form.mode === 'transfer' ? 'Move' : 'Save'}{amt > 0 ? ' ' + money(amt) : ''}</Button></>}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <Segmented items={MODES} value={form.mode} onChange={switchMode} style={{ margin: 0 }} />
        {form.mode === 'transfer' ? (
          <>
            <AccountField label="From" value={form.account} onChange={(v) => set({ account: v, to: v === form.to ? (v === 'safe' ? 'brac' : 'safe') : form.to })} accounts={accounts} />
            <AccountField label="To" value={form.to} onChange={(v) => set({ to: v })} accounts={accounts.filter((a) => a.id !== form.account)} />
          </>
        ) : (
          <>
            <AccountField label={form.mode === 'in' ? 'Into' : 'From'} value={form.account} onChange={(v) => set({ account: v })} accounts={accounts} />
            <div className="field"><span className="lab">What is it</span><ChoiceChips label="What is it" items={reasons} value={form.reason} onChange={(v) => set({ reason: v })} /></div>
          </>
        )}
        <AmountField value={form.amount} onChange={(v) => set({ amount: v })} error={err}
          help={form.mode === 'in' ? '' : amt > bal ? `${accName(form.account)} holds only ${money(bal)}.` : `${money(Math.max(0, bal - amt))} will be left.`} />
        {rule ? <Note tone="warn" icon="clock"><b>{limitText(rule)}.</b> It waits for approval and moves when someone else approves it.</Note> : null}
        <Field label="Note"><TextInput value={form.note} onChange={(v) => set({ note: v })} placeholder={form.mode === 'transfer' ? 'e.g. Cash deposit, slip 4471' : 'Optional'} /></Field>
      </div>
    </Sheet>
  );
}

/** One waiting request: facts, the limit, who asked; Approve / Deny (with a reason) or Take back. */
function ReviewSheet({ r, me, limits, onClose }) {
  const [deny, setDeny] = useState(false);
  const [why, setWhy] = useState('');
  const may = me ? canDecide(me, r) : { ok: false, why: '' };
  const mine = !!me && r.by === me.id;
  const rule = (limits || []).find((x) => x.id === r.rule);
  const others = safe(() => peopleWith('approver').filter((u) => u.id !== r.by).map((u) => u.name.split(' ')[0]), []);
  const act = (verdict) => {
    const res = decide(r.id, verdict, me, why);
    if (!res.ok) { toast(res.message, { tone: 'error' }); return; }
    toast(res.message);
    refresh();
    onClose();
  };
  const takeBack = () => { if (cancelRequest(r.id, me)) { toast('Request taken back'); refresh(); onClose(); } };
  let footer;
  if (!may.ok) footer = <>{mine ? <Button kind="danger" onClick={takeBack}>Take back</Button> : null}<Button kind="line" onClick={onClose}>Close</Button></>;
  else if (deny) footer = <><Button kind="line" onClick={() => setDeny(false)}>Back</Button><Button kind="danger" style={{ flex: 2 }} onClick={() => act('deny')}>Deny</Button></>;
  else footer = <><Button kind="line" onClick={() => setDeny(true)}>Deny</Button><Button kind="primary" style={{ flex: 2 }} onClick={() => act('approve')}>Approve {money(r.amount)}</Button></>;
  return (
    <Sheet open title={r.title} onClose={onClose} footer={footer}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div>
          <div className="v num">{money(r.amount)}</div>
          <div className="k">{KIND_TEXT[r.kind] || r.kind} · asked by {r.byName} · {dateText(r.at, { time: true })}</div>
        </div>
        {!may.ok ? <Note tone="warn" icon="user">{may.why}{others.length ? ` ${others.join(', ')} can approve it.` : ''}</Note> : null}
        <div className="card" style={{ margin: 0, padding: '14px 16px', boxShadow: 'none', border: '1px solid var(--line)' }}>
          <Lines rows={[...(r.facts || []).map(([k, v]) => [k, v]), rule ? ['Limit', limitText(rule)] : null, r.note ? ['Note', r.note] : null]} />
        </div>
        {deny ? <Field label="Why is it denied?"><TextInput multiline value={why} onChange={setWhy} placeholder="e.g. Use the City Bank account for ads" autoFocus /></Field>
          : may.ok ? <div className="help">{r.kind === 'expense' || r.kind === 'move' ? 'Approving posts it to the books now.' : r.kind === 'refund' ? 'Approving makes the refund ready to send.' : 'Approving lowers what the invoice still owes. No money moves.'}</div> : null}
      </div>
    </Sheet>
  );
}
