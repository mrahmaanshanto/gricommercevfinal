'use client';
// Merchant app · Add expense (/m-expense-new). The web's Record expense (Income & expenses) as a phone form
// (the MPurchaseNew board's layout: fields in the body, Cancel + the main button in the action bar):
//   category      lib/categories.js getCategories('expense'); its sales channel (or Shared) is the default of
//                 "Counts under" (profit by channel files the cost there, categories.homeOf)
//   paid to, amount, paid from (the shop's own accounts with balances, lib/ledger.js), paid on, note
//   receipt photo  a picture from the camera or gallery, kept on the entry as its name and a small thumbnail
// Save posts one ledger entry (kind 'expense', or 'salary' for the Salary category) exactly as the web does. Over an
// approval limit (lib/approvals.js needsApproval) nothing is posted: it waits for a second person (submit) and shows
// in Finance › Waiting for approval and on the web's Approvals page.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  AppScreen, Content, AppBar, ActionBar, Button, Field, TextInput, Note, Segmented, Skeleton, Icon, useAppData, toast, money,
} from '../kit/AppKit';
import { getCategories } from '@/lib/categories';
import { postEntry, balanceOf } from '@/lib/ledger';
import { needsApproval, submit } from '@/lib/approvals';
import { editionChannels } from '@/lib/edition';
import { dayKey, fromKey, clockNow } from '@/lib/settlements';
import { accountOptions, allowed, accName, shortDate, limitText, safe } from './moneyData';
import { AccountField, AmountField, SelectField, NotHere } from './moneyParts';

const r2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

/** A small JPEG of a picked photo (longest side 320 px), for the receipt thumbnail. */
function thumbOf(file) {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new window.Image();
      img.onload = () => {
        const k = Math.min(1, 320 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');
        c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
        c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
        try { resolve(c.toDataURL('image/jpeg', 0.6)); } catch { resolve(''); }
      };
      img.onerror = () => resolve('');
      img.src = reader.result;
    };
    reader.onerror = () => resolve('');
    reader.readAsDataURL(file);
  });
}

export default function MExpenseNewScreen() {
  const router = useRouter();
  const { ready, ctx } = useAppData();
  const [today, setToday] = useState('');
  const [cat, setCat] = useState('');
  const [home, setHome] = useState('');
  const [party, setParty] = useState('');
  const [amount, setAmount] = useState('');
  const [account, setAccount] = useState('cash-shop');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');
  const [photo, setPhoto] = useState(null);   // { name, thumb }
  const [tried, setTried] = useState(false);
  const [busy, setBusy] = useState(false);
  useEffect(() => { const t = dayKey(clockNow()); setToday(t); setDate(t); }, []);

  const categories = useMemo(() => (ready ? safe(() => getCategories('expense').filter((c) => !/^platform-/.test(c.id)), []) : []), [ready]);
  const accounts = useMemo(() => (ready ? safe(() => accountOptions(null, account), []) : []), [ready, account]);
  const homes = useMemo(() => (ready ? ['Shared', ...safe(() => editionChannels(), ['Online', 'Retail']).filter((c) => c !== 'Wholesale')] : ['Shared']), [ready]);

  if (ctx && !allowed('/m-expense-new', ctx)) return <NotHere name="MExpenseNew" title="Add expense" />;
  const me = ctx ? ctx.user : null;
  const back = ctx && allowed('/m-finance', ctx) ? '/m-finance' : '/m-more';
  const picked = categories.find((c) => c.name === cat);
  const isSalary = !!picked && picked.id === 'salary';
  const amt = r2(amount);
  const balance = ready ? balanceOf(account) : 0;
  const errors = {
    cat: cat ? '' : 'Choose what the money was for.',
    amount: amt > 0 ? '' : 'Enter the amount paid.',
    date: !date ? 'Pick the day it was paid.' : date > today ? 'The date can’t be in the future.' : '',
  };
  const show = (f) => (tried ? errors[f] : '');
  const rule = ready && amt > 0 && cat ? safe(() => needsApproval({ kind: 'expense', amount: amt, cat, account }), null) : null;
  const pickCat = (v) => { setCat(v); const c = categories.find((x) => x.name === v); setHome(c ? (homes.includes(c.home) ? c.home : 'Shared') : ''); };

  const pickPhoto = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setPhoto({ name: file.name, thumb: '' });
    const thumb = await thumbOf(file);
    setPhoto({ name: file.name, thumb });
  };

  const save = () => {
    setTried(true);
    if (Object.values(errors).some(Boolean) || busy) return;
    setBusy(true);
    const entry = {
      account, amount: -amt, kind: isSalary ? 'salary' : 'expense', cat,
      party: party.trim() || cat, note: note.trim(), by: (me && me.name) || 'Staff',
      ...(picked && home && home !== (picked.home || 'Shared') ? { channel: home } : {}),
      ...(photo ? { receipt: photo.name, receiptThumb: photo.thumb || '' } : {}),
      ...(date !== today ? { at: fromKey(date) + 12 * 3600e3 } : {}),
    };
    if (rule) {
      const req = submit({ kind: 'expense', title: `${cat}${note.trim() ? ' · ' + note.trim() : ''}`, amount: amt, payload: entry, rule, user: me || undefined,
        facts: [['Category', cat], ['Paid from', accName(account)], ['Paid to', entry.party], ['Paid on', shortDate(fromKey(date))], ...(photo ? [['Receipt', photo.name]] : [])] });
      toast(`${money(amt)} for ${cat.toLowerCase()} waits for approval (${req.id})`);
      router.push(back);
      return;
    }
    const row = postEntry(entry);
    if (!row) { setBusy(false); toast('That account could not be found', { tone: 'error' }); return; }
    toast(`${money(amt)} for ${cat.toLowerCase()} recorded from ${accName(account)}`);
    router.push(back);
  };

  return (
    <AppScreen name="MExpenseNew" title="Add expense">
      <AppBar title="Add expense" back={back} />
      <Content top={103} bottom={98} pad gap={16} style={{ paddingTop: '2px' }}>
        {!ready ? <Skeleton rows={4} card={false} /> : (
          <>
            <SelectField label="Category" value={cat} onChange={pickCat} error={show('cat')}
              options={[{ value: '', label: 'Choose…' }, ...categories.map((c) => ({ value: c.name, label: c.name }))]} />
            {picked ? (
              <div className="field">
                <span className="lab">Counts under</span>
                <Segmented items={homes.map((h) => ({ key: h, label: h }))} value={home} onChange={setHome} style={{ margin: 0 }} />
                <span className="help">{home === 'Shared' ? 'A cost of the whole shop.' : `Comes off ${home} profit.`}</span>
              </div>
            ) : null}
            <AmountField value={amount} onChange={setAmount} error={show('amount')} />
            <AccountField label="Paid from" value={account} onChange={setAccount} accounts={accounts}
              help={amt > balance ? undefined : `${money(balance)} in this account`} />
            {amt > balance ? <Note tone="warn" icon="alert"><b>{accName(account)} has {money(balance)}.</b> Paying {money(amt)} takes it below zero. Save anyway if the money did go out.</Note> : null}
            {rule ? <Note tone="warn" icon="clock"><b>{limitText(rule)}.</b> It waits for approval and is recorded when someone else approves it.</Note> : null}
            <Field label="Paid to"><TextInput value={party} onChange={setParty} placeholder={isSalary ? 'Staff name' : 'Shop, person or company'} /></Field>
            <Field label="Paid on" error={show('date')}>
              <span className="inp"><input type="date" value={date} max={today} onChange={(e) => setDate(e.target.value)} /></span>
            </Field>
            <Field label="Note"><TextInput value={note} onChange={setNote} placeholder="Optional, e.g. October rent" /></Field>
            <div className="field">
              <span className="lab">Receipt photo</span>
              {photo ? (
                <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
                  <div className="lrow">
                    {photo.thumb
                      ? <img src={photo.thumb} alt="Receipt" style={{ width: '52px', height: '52px', objectFit: 'cover', borderRadius: 'var(--radius-lg)', flex: 'none' }} />
                      : <span className="ico"><Icon name="receipt" /></span>}
                    <span className="ell" style={{ flex: 1, minWidth: 0, fontSize: 'var(--text-sm)' }}>{photo.name}</span>
                    <button type="button" className="ib" aria-label="Remove the photo" onClick={() => setPhoto(null)}><Icon name="x" size={20} /></button>
                  </div>
                </div>
              ) : (
                <label className="btn btns" style={{ width: '100%', cursor: 'pointer' }}>
                  <Icon name="scan" size={20} stroke={2} />Take or add a photo
                  <input type="file" accept="image/*" capture="environment" onChange={pickPhoto} style={{ position: 'absolute', width: '1px', height: '1px', opacity: 0, pointerEvents: 'none' }} />
                </label>
              )}
            </div>
          </>
        )}
      </Content>
      <ActionBar>
        <Button kind="line" href={back}>Cancel</Button>
        <Button kind="primary" style={{ flex: 2 }} onClick={save} disabled={!ready || busy}>{rule ? 'Ask for approval' : amt > 0 ? `Save ${money(amt)}` : 'Save expense'}</Button>
      </ActionBar>
    </AppScreen>
  );
}
