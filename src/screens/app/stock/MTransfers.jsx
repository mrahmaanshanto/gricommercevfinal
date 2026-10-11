'use client';
// Merchant app · Transfers (/m-transfers; ?new=1[&from=&sku=] opens a new transfer). The web's Transfers and New
// transfer (/transfers, /new-transfer) on a phone, drawn with the boards' chips, cards, sheets and action bar.
//   list      All · On the way · Received · With a problem · Not sent yet (transfers.js), a card per transfer
//   a card    opens the transfer: lines and the one next step —
//               Send          a draft goes on the way (status 'way': shows as in transit at the place it goes to)
//               Receive       count what arrived per line; stock moves out of the sender and into the receiver
//                             ('transfer' moves keyed by transfer + line, so a second receive changes nothing)
//               Resolve       missing pieces: write off, claim from the carrier, keep as found later, or they turned up
//   new       from / to (stock places), items by search or scan with what the sender has (stock.stockAt available),
//             who carries it; Send now or Save for later (transfers.addTransfer). Stock stays on the sender's books
//             until the transfer is received, as on the web.

import React, { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppScreen, Content, AppBar, ActionBar, Fab, Button, IconButton, Field, TextInput, Stepper, Segmented, Chips, Sheet, Note, Pill, EmptyState, Skeleton, Icon, useAppData, useQuery, money, toast, refresh } from '../kit/AppKit';
import { getTransfers, addTransfer, updateTransfer, missingOf, openShort, pendingShort } from '@/lib/transfers';
import { addMove, productBy, stockAt } from '@/lib/stock';
import { resolveScan } from '@/lib/identifiers';
import { Thumb, ScanSheet, ProductSheet, Select } from './Scanner';
import { placeList, me, rowBy, safe, plural, dayText } from './stockData';

const TABS = [['all', 'All'], ['way', 'On the way'], ['done', 'Received'], ['short', 'With a problem'], ['draft', 'Not sent yet']];
const pcsOf = (t) => t.lines.reduce((a, l) => a + l.qty, 0);
const gotOf = (t) => t.lines.reduce((a, l) => a + (l.got || 0), 0);
const nameOf = (sku) => { const p = productBy(sku); return p ? p.name : sku; };
function stateOf(t) {
  if (t.status !== 'received') return t.status;
  if (openShort(t).length) return 'short';
  if (pendingShort(t).length) return 'pending';
  return 'done';
}
const PILL = { draft: ['grey', 'Not sent yet'], way: ['nav', 'On the way'], done: ['ok', 'Received'] };
function pillOf(t) {
  const st = stateOf(t);
  if (st === 'short') return ['err', openShort(t).reduce((a, l) => a + missingOf(t, l), 0) + ' missing'];
  if (st === 'pending') return ['warn', pendingShort(t).reduce((a, l) => a + missingOf(t, l), 0) + ' pending'];
  return PILL[st] || ['grey', st];
}

export default function MTransfers() {
  const router = useRouter();
  const q = useQuery();
  const { ready, tick } = useAppData(['gc:stock']);
  const [tab, setTab] = useState('all');
  const [view, setView] = useState('');        // transfer no in the sheet
  const [recv, setRecv] = useState(null);      // { no, got: { sku: n } }
  const [fix, setFix] = useState(null);        // { no, picks: { sku: { kind, amount } } }
  const [draft, setDraft] = useState(null);    // the new transfer: { from, to, lines: [{ sku, qty }], carrier }
  const [pick, setPick] = useState(false);
  const [scan, setScan] = useState(false);
  const [busy, setBusy] = useState(false);
  const places = useMemo(() => (ready ? placeList() : []), [ready]);

  useEffect(() => {
    if (!ready || !q || q.get('new') !== '1') return;
    const from = places.includes(q.get('from')) ? q.get('from') : places[0] || '';
    const to = places.find((p) => p !== from) || '';
    const row = q.get('sku') ? rowBy(q.get('sku')) : null;
    setDraft({ from, to, carrier: '', lines: row ? [{ sku: row.sku, qty: 1 }] : [] });
  }, [ready, q, places]);

  const list = useMemo(() => (ready ? safe(() => getTransfers(), []) : null), [ready, tick]);
  const counts = useMemo(() => {
    const c = { all: 0, way: 0, done: 0, short: 0, draft: 0 };
    (list || []).forEach((t) => { c.all++; const s = stateOf(t); c[s === 'pending' ? 'short' : s] = (c[s === 'pending' ? 'short' : s] || 0) + 1; });
    return c;
  }, [list]);
  const shown = (list || []).filter((t) => { const s = stateOf(t); return tab === 'all' || s === tab || (tab === 'short' && s === 'pending'); });
  const sel = view && list ? list.find((t) => t.no === view) : null;
  const reload = () => refresh();
  const by = () => me().split(' ')[0];

  // ---- next steps (the web's Transfers logic) ----
  const send = (t) => { updateTransfer(t.no, { status: 'way', sentAt: Date.now() }); reload(); setView(''); toast(`${t.no} sent · ${pcsOf(t)} pieces on the way to ${t.to}`); };
  const startRecv = (t) => { const g = {}; t.lines.forEach((l) => { g[l.sku] = l.qty; }); setView(''); setRecv({ no: t.no, got: g }); };
  const startFix = (t) => {
    const picks = {};
    openShort(t).concat(pendingShort(t)).forEach((l) => { const m = missingOf(t, l), p = productBy(l.sku); picks[l.sku] = { kind: l.res ? 'found' : 'writeoff', amount: String(m * (p ? p.wholesale || p.price : 0)) }; });
    setView(''); setFix({ no: t.no, picks });
  };
  const doReceive = () => {
    const fresh = safe(() => getTransfers(), []).find((x) => x.no === recv.no);
    if (!fresh) return;
    if (fresh.status === 'received') { setRecv(null); reload(); toast(`${fresh.no} was already received. Nothing changed.`, { tone: 'info' }); return; }
    const who = by();
    const lines = fresh.lines.map((l) => ({ ...l, got: Math.max(0, Math.min(l.qty, Math.round(Number(recv.got[l.sku]) || 0))) }));
    lines.forEach((l) => {
      if (!l.got) return;
      addMove({ sku: l.sku, place: fresh.from, qty: -l.got, kind: 'transfer', reason: 'Sent to ' + fresh.to, by: who, ref: fresh.no, op: fresh.no + ':out:' + l.sku });
      addMove({ sku: l.sku, place: fresh.to, qty: l.got, kind: 'transfer', reason: 'Received from ' + fresh.from, by: who, ref: fresh.no, op: fresh.no + ':in:' + l.sku });
    });
    const after = updateTransfer(fresh.no, { status: 'received', receivedAt: Date.now(), lines }).find((x) => x.no === fresh.no);
    const miss = lines.reduce((a, l) => a + (l.qty - l.got), 0);
    setRecv(null); reload();
    if (miss) { toast(`${fresh.no} received · ${miss} missing. Choose what to do with them.`, { tone: 'info' }); startFix(after); } else toast(`${fresh.no} received · ${gotOf(after)} pieces added to ${fresh.to}`);
  };
  const doFix = () => {
    const r = safe(() => getTransfers(), []).find((x) => x.no === fix.no);
    if (!r) return;
    const who = by(), done = [];
    const lines = r.lines.map((l) => {
      const m = missingOf(r, l), pk = fix.picks[l.sku];
      if (!m || !pk) return l;
      const at = Date.now();
      if (pk.kind === 'writeoff') { addMove({ sku: l.sku, place: r.from, qty: -m, kind: 'writeoff', reason: 'Missing in ' + r.no + ' · Lost in transit', by: who, ref: r.no, op: r.no + ':writeoff:' + l.sku }); done.push(m + ' written off'); return { ...l, res: { kind: 'writeoff', qty: m, reason: 'Lost in transit', at, by: who } }; }
      if (pk.kind === 'claim') { const amt = Math.max(0, Math.round(Number(pk.amount) || 0)); addMove({ sku: l.sku, place: r.from, qty: -m, kind: 'writeoff', reason: 'Missing in ' + r.no + ' · claimed from ' + (r.carrier || 'the carrier'), by: who, ref: r.no, op: r.no + ':claim:' + l.sku }); done.push('claim ' + money(amt)); return { ...l, res: { kind: 'claim', qty: m, amount: amt, note: '', at, by: who } }; }
      if (pk.kind === 'pending') { done.push(m + ' pending'); return { ...l, res: { kind: 'pending', qty: m, note: '', at, by: who } }; }
      if (pk.kind === 'found') {
        addMove({ sku: l.sku, place: r.from, qty: -m, kind: 'transfer', reason: 'Sent to ' + r.to + ' · found later', by: who, ref: r.no, op: r.no + ':found-out:' + l.sku });
        addMove({ sku: l.sku, place: r.to, qty: m, kind: 'transfer', reason: 'Received from ' + r.from + ' · found later', by: who, ref: r.no, op: r.no + ':found-in:' + l.sku });
        done.push(m + ' found'); return { ...l, got: l.got + m, res: { kind: 'found', qty: m, at, by: who } };
      }
      return l;
    });
    updateTransfer(r.no, { lines });
    setFix(null); reload();
    toast(`${r.no} · ${done.join(' · ')}`);
  };

  // ---- new transfer ----
  const haveOf = (sku) => safe(() => stockAt(sku, draft.from).available, 0);
  const addLine = (row, n = 1) => {
    setPick(false);
    if (haveOf(row.sku) <= 0) { toast(`${row.name}: none available at ${draft.from}`, { tone: 'error' }); return; }
    setDraft((d) => ({ ...d, lines: d.lines.some((l) => l.sku === row.sku) ? d.lines.map((l) => (l.sku === row.sku ? { ...l, qty: l.qty + n } : l)) : [...d.lines, { sku: row.sku, qty: n }] }));
  };
  const onScan = (code) => { const h = safe(() => resolveScan(code), null); if (!h || !h.row) { toast(`No product matches “${code}”`, { tone: 'error' }); return; } addLine(h.row, h.qty || 1); toast(`${h.row.name} +${h.qty || 1}`); };
  const tooMany = draft ? draft.lines.find((l) => l.qty > haveOf(l.sku)) : null;
  const submit = (status) => {
    if (busy) return;
    if (!draft.from || !draft.to || draft.from === draft.to) { toast('Choose two different places', { tone: 'error' }); return; }
    if (!draft.lines.length) { toast('Add at least one item', { tone: 'error' }); return; }
    if (status === 'way' && tooMany) { toast(`Only ${haveOf(tooMany.sku)} of ${nameOf(tooMany.sku)} at ${draft.from}`, { tone: 'error' }); return; }
    if (status === 'way' && !draft.carrier.trim()) { toast('Enter who is carrying the items', { tone: 'error' }); return; }
    setBusy(true);
    const t = addTransfer({ from: draft.from, to: draft.to, by: me(), carrier: draft.carrier.trim(), status, lines: draft.lines.map((l) => ({ sku: l.sku, qty: l.qty })) });
    reload(); setDraft(null); setBusy(false);
    router.replace('/m-transfers');
    toast(status === 'way' ? `${t.no} sent · ${pcsOf(t)} pieces on the way to ${t.to}` : `${t.no} saved. Send it when the items are packed.`);
  };

  if (draft) {
    const pcs = draft.lines.reduce((a, l) => a + l.qty, 0);
    return (
      <AppScreen name="MTransfers" title="New transfer">
        <AppBar title="New transfer" onBack={() => { setDraft(null); router.replace('/m-transfers'); }} />
        <Content top={103} bottom={98} style={{ padding: '2px 20px 0' }} gap={16}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto 1fr', gap: '8px', alignItems: 'end' }}>
            <Field label="From"><Select value={draft.from} onChange={(v) => setDraft((d) => ({ ...d, from: v }))} options={places} label="From" /></Field>
            <IconButton icon="arrows" label="Swap the places" soft onClick={() => setDraft((d) => ({ ...d, from: d.to, to: d.from }))} />
            <Field label="To"><Select value={draft.to} onChange={(v) => setDraft((d) => ({ ...d, to: v }))} options={places} label="To" /></Field>
          </div>
          {draft.from === draft.to ? <Note tone="err" icon="alert">Choose a different place to send to.</Note> : null}
          <div className="field">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="lab">Items</span>
              <span style={{ display: 'flex', gap: '6px' }}><IconButton icon="scan" label="Scan an item" soft onClick={() => setScan(true)} /><IconButton icon="plus" label="Add an item" soft onClick={() => setPick(true)} /></span>
            </div>
            {draft.lines.length ? (
              <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
                {draft.lines.map((l) => {
                  const row = rowBy(l.sku), have = haveOf(l.sku), short = l.qty > have;
                  return (
                    <div key={l.sku} className="lrow">
                      {row ? <Thumb row={row} size={44} /> : null}
                      <span style={{ flex: '1', minWidth: '0' }}>
                        <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{nameOf(l.sku)}</span>
                        <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: short ? 'var(--err)' : 'var(--muted)' }}>{have} at {draft.from.replace(/ branch$/, '')}{short ? ' · too many' : ` · ${have - l.qty} left after`}</span>
                      </span>
                      <Stepper value={l.qty} min={0} label={'Quantity of ' + nameOf(l.sku)} onChange={(n) => setDraft((d) => ({ ...d, lines: n ? d.lines.map((x) => (x.sku === l.sku ? { ...x, qty: n } : x)) : d.lines.filter((x) => x.sku !== l.sku) }))} />
                    </div>
                  );
                })}
              </div>
            ) : <button type="button" className="card" onClick={() => setPick(true)} style={{ boxShadow: 'none', border: '1px dashed #cbd5e1', padding: '18px', textAlign: 'center', color: 'var(--brand)', font: 'inherit', fontWeight: 'var(--weight-medium)', cursor: 'pointer', background: 'var(--card)' }}>Add the first item</button>}
          </div>
          <Field label="Carried by" help="The driver, staff member or courier"><TextInput value={draft.carrier} onChange={(v) => setDraft((d) => ({ ...d, carrier: v }))} placeholder="e.g. Jamal (van driver)" /></Field>
          <div className="card" style={{ padding: '14px 16px', boxShadow: 'none', background: '#eef3fa', display: 'flex', justifyContent: 'space-between', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-semibold)' }}>
            <span>{plural(draft.lines.length, 'product')}</span><span className="num">{plural(pcs, 'piece')}</span>
          </div>
          <div style={{ height: '4px' }} />
        </Content>
        <ActionBar>
          <Button kind="line" onClick={() => submit('draft')} disabled={busy}>Save for later</Button>
          <Button icon="truck" onClick={() => submit('way')} disabled={busy || !!tooMany} style={{ flex: 2 }}>Send</Button>
        </ActionBar>
        <ProductSheet open={pick} onClose={() => setPick(false)} onPick={(r) => addLine(r)} place={draft.from} title={'Add from ' + draft.from} filter={(r) => r.format !== 'digital' && r.format !== 'service' && !(r.bundle && r.bundle.type !== 'kit')} />
        <ScanSheet open={scan} onClose={() => setScan(false)} onCode={onScan} title="Scan items to send" hint="Each scan adds one; a carton adds its pieces." />
      </AppScreen>
    );
  }

  const rc = recv && list ? list.find((t) => t.no === recv.no) : null;
  const fx = fix && list ? list.find((t) => t.no === fix.no) : null;
  const fixLines = fx ? openShort(fx).concat(pendingShort(fx)) : [];
  return (
    <AppScreen name="MTransfers" title="Transfers">
      <AppBar title="Transfers" back="/m-stock" />
      <Content top={103} bottom={0}>
        <Chips items={TABS.map(([k, label]) => ({ key: k, label, n: counts[k] || undefined }))} value={tab} onChange={setTab} style={{ marginTop: '2px', overflowX: 'auto' }} />
        <div style={{ height: '14px' }} />
        {!list ? <Skeleton rows={3} /> : shown.length ? shown.map((t) => {
          const [tone, text] = pillOf(t), pcs = pcsOf(t), got = gotOf(t);
          return (
            <button key={t.no} type="button" className="card" onClick={() => setView(t.no)} style={{ display: 'block', margin: '0 20px 12px', padding: '16px', width: 'calc(100% - 40px)', border: 0, textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <span className="mono" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{t.no}</span>
                <span style={{ marginLeft: 'auto' }}><Pill tone={tone} shape={tone !== 'nav' && tone !== 'grey'}>{text}</Pill></span>
              </div>
              <div className="ell" style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: 'var(--text-base)', fontWeight: 'var(--weight-semibold)', marginTop: '6px' }}>{t.from.replace(/ branch$/, '')} <Icon name="chev" size={16} /> {t.to.replace(/ branch$/, '')}</div>
              <div style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{dayText(t.at)}{t.carrier ? ' · ' + t.carrier : ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <span className="bar" style={{ flex: '1' }}><i style={{ width: (t.status === 'received' ? Math.round((got / Math.max(1, pcs)) * 100) : t.status === 'way' ? 50 : 0) + '%', background: t.status === 'received' && got >= pcs ? '#10b981' : '#003087' }} /></span>
                <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', flex: 'none' }}>{t.status === 'received' ? `${got}/${pcs} arrived` : plural(pcs, 'piece')}</span>
              </div>
            </button>
          );
        }) : <div className="card" style={{ margin: '0 20px' }}><EmptyState icon="arrows" title="No transfers here" /></div>}
      </Content>
      {places.length > 1 ? <Fab onClick={() => setDraft({ from: places[0], to: places[1], carrier: '', lines: [] })} label="New transfer" /> : null}

      <Sheet open={!!sel} onClose={() => setView('')} title={sel ? sel.no : ''}
        footer={sel ? (stateOf(sel) === 'draft' ? <Button icon="truck" onClick={() => send(sel)}>Send</Button> : stateOf(sel) === 'way' ? <Button icon="download" onClick={() => startRecv(sel)}>Receive</Button> : ['short', 'pending'].includes(stateOf(sel)) ? <Button onClick={() => startFix(sel)}>Sort out missing pieces</Button> : null) : null}>
        {sel ? (
          <>
            <div className="help" style={{ marginTop: '-8px', marginBottom: '12px' }}>{sel.from} → {sel.to} · {dayText(sel.at)}{sel.carrier ? ' · ' + sel.carrier : ''}</div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              {sel.lines.map((l) => {
                const m = missingOf(sel, l);
                return (
                  <div key={l.sku} className="row" style={{ minHeight: '56px' }}>
                    <span className="m"><span className="t ell" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{nameOf(l.sku)}</span>
                      <span className="s" style={{ display: 'block', color: m && !l.res ? 'var(--err)' : undefined }}>{sel.status === 'received' ? `${l.got} of ${l.qty} arrived` : `${l.qty} sent`}{l.res ? ' · ' + ({ writeoff: 'written off', claim: 'claimed', pending: 'pending', found: 'found later' }[l.res.kind] || '') : m ? ` · ${m} missing` : ''}</span></span>
                    <span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{l.qty}</span>
                  </div>
                );
              })}
            </div>
          </>
        ) : null}
      </Sheet>

      <Sheet open={!!rc} onClose={() => setRecv(null)} title={rc ? 'Receive ' + rc.no : ''} footer={<><Button kind="line" onClick={() => setRecv(null)}>Cancel</Button><Button onClick={doReceive} style={{ flex: 2 }}>Add to {rc ? rc.to.replace(/ branch$/, '') : ''}</Button></>}>
        {rc ? (
          <>
            <div className="help" style={{ marginTop: '-8px', marginBottom: '12px' }}>Count what arrived. Fewer than sent? The rest is sorted out next.</div>
            <div className="card" style={{ boxShadow: 'none', border: '1px solid var(--line)' }}>
              {rc.lines.map((l) => (
                <div key={l.sku} className="row" style={{ minHeight: '58px' }}>
                  <span className="m"><span className="t ell" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{nameOf(l.sku)}</span><span className="s">{l.qty} sent</span></span>
                  <Stepper value={recv.got[l.sku] ?? l.qty} min={0} max={l.qty} label={'Arrived of ' + nameOf(l.sku)} onChange={(n) => setRecv((r) => ({ ...r, got: { ...r.got, [l.sku]: n } }))} />
                </div>
              ))}
            </div>
          </>
        ) : null}
      </Sheet>

      <Sheet open={!!fx} onClose={() => setFix(null)} title="Missing pieces" footer={<Button onClick={doFix}>Save</Button>}>
        {fx ? fixLines.map((l) => {
          const m = missingOf(fx, l), pk = fix.picks[l.sku] || { kind: 'writeoff', amount: '0' };
          const opts = l.res ? [['found', 'Turned up'], ['writeoff', 'Write off'], ['claim', 'Claim']] : [['writeoff', 'Write off'], ['claim', 'Claim'], ['pending', 'Found later']];
          const set = (patch) => setFix((f) => ({ ...f, picks: { ...f.picks, [l.sku]: { ...pk, ...patch } } }));
          return (
            <div key={l.sku} style={{ marginBottom: '16px' }}>
              <div style={{ fontWeight: 'var(--weight-medium)' }}>{nameOf(l.sku)} · <span style={{ color: 'var(--err)' }}>{m} missing</span></div>
              <Segmented items={opts.map(([k, label]) => ({ key: k, label }))} value={pk.kind} onChange={(k) => set({ kind: k })} style={{ margin: '8px 0 0' }} />
              <div className="help" style={{ marginTop: '6px' }}>{pk.kind === 'writeoff' ? `Takes ${m} off the stock at ${fx.from}.` : pk.kind === 'claim' ? `Takes ${m} off the stock and asks ${fx.carrier || 'the carrier'} to pay.` : pk.kind === 'pending' ? 'Nothing changes until they turn up.' : `Adds ${m} to ${fx.to}.`}</div>
              {pk.kind === 'claim' ? <div style={{ marginTop: '8px' }}><Field label="Claim amount"><TextInput value={pk.amount} onChange={(v) => set({ amount: v.replace(/[^\d]/g, '') })} prefix="৳" inputMode="numeric" /></Field></div> : null}
            </div>
          );
        }) : null}
      </Sheet>
    </AppScreen>
  );
}
