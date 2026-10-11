'use client';
// Merchant app · Adjust & count (/m-adjust; ?tab=count, ?sku=, ?place=, ?reason=). The web's Stock adjustments and
// Stock count on a phone, drawn with the boards' segments, cards, steppers, sheets and action bar.
//   Adjust   place, product (search or scan), add or remove, how many, a reason (stockAdjustments.ADJUST_REASONS) and a
//            note. A decrease or more than 20 pieces needs a manager: approve now with the PIN (demo 1234), or save it
//            to wait for approval. Only an approved adjustment changes the stock ('adjust' move keyed by its id).
//            Waiting adjustments are listed; a manager approves or rejects them here.
//   Count    one count session at a time (countSessions.js): Quick / Blind / Cycle / Full, place, area (a category or
//            everything). The snapshot is taken at the start; sales during the count are not differences. Each product
//            gets my count (stepper or scan: /m-scan?for=count hands back too). Finish: a blind count shows its
//            differences and big ones are counted again; then a manager posts the differences ('count' moves).

import React, { useEffect, useMemo, useState } from 'react';
import { AppScreen, Content, AppBar, ActionBar, Button, IconButton, Field, TextInput, Stepper, Segmented, Chips, Sheet, ListRow, Note, Pill, EmptyState, Skeleton, Icon, useAppData, useQuery, toast, confirmDialog, refresh } from '../kit/AppKit';
import { getAdjustments, addAdjustment, approveAdjustment, rejectAdjustment, needsApproval, APPROVAL_LIMIT, ADJUST_REASONS } from '@/lib/stockAdjustments';
import { COUNT_MODES, modeBy, activeSession, startSession, setCount, myCount, summaryOf, askRecounts, revealSession, cancelSession, postSession, COUNT_EVENT } from '@/lib/countSessions';
import { stockAt, productBy } from '@/lib/stock';
import { resolveScan } from '@/lib/identifiers';
import { Thumb, ScanSheet, ProductSheet, PinSheet, Select } from './Scanner';
import { takeScan, SCAN_EVENT } from './scanReturn';
import { placeList, rowsOf, rowBy, me, safe, plural, dayText } from './stockData';

const SH = { approved: ['ok', 'Approved'], waiting: ['warn', 'Waiting'], rejected: ['err', 'Rejected'] };

export default function MAdjust() {
  const q = useQuery();
  const { ready, tick } = useAppData([COUNT_EVENT, SCAN_EVENT]);
  const [tab, setTab] = useState('adjust');
  const places = useMemo(() => (ready ? placeList() : []), [ready]);
  // adjust
  const [place, setPlace] = useState('');
  const [sku, setSku] = useState('');
  const [dir, setDir] = useState('add');
  const [qty, setQty] = useState(1);
  const [reason, setReason] = useState('Count correction');
  const [note, setNote] = useState('');
  const [pick, setPick] = useState(false);
  const [scan, setScan] = useState(false);
  const [pin, setPin] = useState(null);         // { kind: 'new' } | { kind: 'approve', id }
  const [open, setOpen] = useState('');         // adjustment id in the sheet
  // count
  const [cMode, setCMode] = useState('quick');
  const [cArea, setCArea] = useState('all');
  const [cq, setCq] = useState('');
  const [post, setPost] = useState(false);

  useEffect(() => {
    if (!ready || !q) return;
    if (q.get('tab') === 'count') setTab('count');
    const pl = q.get('place');
    setPlace(places.includes(pl) ? pl : places[0] || '');
    const r = q.get('sku') ? rowBy(q.get('sku')) : null;
    if (r) setSku(r.sku);
    const why = q.get('reason');
    if (why && ADJUST_REASONS.includes(why)) { setReason(why); if (['Damaged', 'Lost', 'Expired', 'Gift/sample'].includes(why)) setDir('remove'); }
  }, [ready, q, places]);

  const row = sku ? rowBy(sku) : null;
  const st = row && place ? safe(() => stockAt(row.sku, place), null) : null;
  const change = dir === 'add' ? qty : -qty;
  const approval = needsApproval(change);
  const adjustments = useMemo(() => (ready ? safe(() => getAdjustments(), []) : []), [ready, tick]);
  const waiting = adjustments.filter((a) => a.status === 'waiting');
  const sel = open ? adjustments.find((a) => a.id === open) : null;

  const check = () => {
    if (!row) { toast('Choose the product', { tone: 'error' }); setPick(true); return false; }
    if (!(qty > 0)) { toast('Enter how many', { tone: 'error' }); return false; }
    if (reason === 'Other' && !note.trim()) { toast('Write what happened', { tone: 'error' }); return false; }
    return true;
  };
  const payload = () => ({ sku: row.sku, place, qty: change, reason, note: note.trim(), by: me() });
  const done = (r) => { refresh(); setQty(1); setNote(''); toast(r.status === 'approved' ? `${row.name}: ${change > 0 ? '+' : '−'}${Math.abs(change)} at ${place}` : `${r.id} is waiting for a manager`); };
  const save = () => { if (!check()) return; if (approval) { setPin({ kind: 'new' }); return; } done(addAdjustment(payload(), 'Auto').row); };
  const saveWaiting = () => { if (!check()) return; done(addAdjustment(payload()).row); };
  const approved = (manager) => {
    if (pin.kind === 'new') { const { row: r } = addAdjustment(payload(), manager); setPin(null); done(r); return; }
    approveAdjustment(pin.id, manager); setPin(null); setOpen(''); refresh(); toast(`${pin.id} approved by ${manager}`);
  };
  const reject = async (a) => {
    const ok = await confirmDialog({ title: `Reject ${a.id}?`, body: 'The stock does not change.', confirmLabel: 'Reject', tone: 'danger' });
    if (!ok) return;
    rejectAdjustment(a.id, me(), ''); setOpen(''); refresh(); toast(`${a.id} rejected`);
  };
  const onScanAdjust = (code) => { setScan(false); const h = safe(() => resolveScan(code), null); if (!h) { toast(`No product for “${code}”`, { tone: 'error' }); return; } setSku(h.sku); if (h.qty > 1) setQty(h.qty); };

  // ---- count ----
  const ses = useMemo(() => (ready ? safe(() => activeSession(), null) : null), [ready, tick]);
  const who = me();
  const sum = useMemo(() => (ses ? safe(() => summaryOf(ses), null) : null), [ses]);
  const md = ses ? modeBy(ses.mode) : null;
  const hidden = md && md.blind && !ses.revealed;
  const cats = useMemo(() => (ready ? [...new Set(rowsOf().map((r) => r.cat).filter(Boolean))] : []), [ready]);
  const countOne = (s, add = 1, serial = '') => {
    if (!ses) return;
    const cur = myCount(ses, s, who) || 0;
    setCount(ses.id, s, cur + add, who, serial);
    refresh();
  };
  const onScanCount = (code) => {
    const h = safe(() => resolveScan(code), null);
    if (!h) { toast(`No product for “${code}”`, { tone: 'error' }); return; }
    countOne(h.sku, h.qty || 1, h.serial || '');
    toast(`+${h.qty || 1} ${h.row ? h.row.name : h.sku}`);
  };
  useEffect(() => { if (!ses) return; const s = takeScan('count'); if (s) { countOne(s.sku, s.qty || 1, s.serial || ''); toast(`+${s.qty || 1} ${s.name || s.sku}`); } }, [ses && ses.id, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const start = () => {
    if (!place) return;
    const s = startSession({ mode: cMode, place, area: cArea, pause: true, by: who });
    refresh();
    toast(`${modeBy(cMode).label} started at ${place} · ${plural(s.skus.length, 'product')}`);
  };
  const finish = () => {
    if (!sum || !sum.counted) { toast('Count at least one product first', { tone: 'error' }); return; }
    if (md.blind && !ses.revealed) {
      revealSession(ses.id);
      const n = askRecounts(ses.id);
      refresh();
      if (n) { toast(`${plural(n, 'product needs', 'products need')} a recount. Count them again, then finish.`, { tone: 'info' }); return; }
    } else if (md.recount && sum.recounts.length) {
      const m = askRecounts(ses.id); refresh();
      toast(`${plural(m, 'product needs', 'products need')} a recount first.`, { tone: 'info' }); return;
    }
    if (!sum.diffs.length && !(ses.mode === 'full' && ses.uncounted === 'zero' && sum.total > sum.counted)) { postSession(ses.id, who); refresh(); toast(`Count finished · everything matched at ${ses.place}`); return; }
    setPost(true);
  };
  const cancelCount = async () => {
    const ok = await confirmDialog({ title: 'Cancel this count?', body: 'Nothing changes in stock. The counts are dropped.', confirmLabel: 'Cancel count', cancelLabel: 'Keep counting', tone: 'danger' });
    if (!ok) return;
    cancelSession(ses.id, who); refresh(); toast('Count cancelled');
  };
  const short = sum ? sum.diffs.filter((l) => l.diff < 0) : [];
  const over = sum ? sum.diffs.filter((l) => l.diff > 0) : [];
  const ck = cq.trim().toLowerCase();
  const countLines = sum ? sum.lines.filter((l) => { if (!ck) return true; const p = productBy(l.sku); return p && [p.name, p.sku, p.barcode].some((x) => String(x || '').toLowerCase().includes(ck)); }) : [];

  return (
    <AppScreen name="MAdjust" title="Adjust & count">
      <AppBar title={tab === 'count' ? 'Stock count' : 'Adjust stock'} back="/m-stock" actions={<IconButton icon="scan" label="Scan" onClick={() => setScan(true)} />} />
      <Content top={103} bottom={tab === 'adjust' || ses ? 98 : 0}>
        <Segmented items={[{ key: 'adjust', label: 'Adjust' }, { key: 'count', label: 'Count' }]} value={tab} onChange={setTab} style={{ marginTop: '2px' }} />
        {!ready ? <div style={{ marginTop: '16px' }}><Skeleton rows={3} /></div> : tab === 'adjust' ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px 0' }}>
            {places.length > 1 ? <Field label="Place"><Select value={place} onChange={setPlace} options={places} label="Place" /></Field> : null}
            <div className="field">
              <span className="lab">Product</span>
              <button type="button" className="card" onClick={() => setPick(true)} style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '10px 14px', boxShadow: 'none', border: '1px solid var(--line)', textAlign: 'left', font: 'inherit', color: 'inherit', cursor: 'pointer', background: 'var(--card)' }}>
                {row ? <Thumb row={row} size={44} /> : <span className="ico"><Icon name="box" /></span>}
                <span style={{ flex: 1, minWidth: 0 }}>
                  <span className="ell" style={{ display: 'block', fontWeight: 'var(--weight-medium)' }}>{row ? row.name : 'Choose a product'}</span>
                  <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{st ? `${st.onHand} on hand · ${st.available} available` : 'Search or scan'}</span>
                </span>
                <Icon name="chev" size={18} />
              </button>
            </div>
            <Segmented items={[{ key: 'add', label: 'Add stock' }, { key: 'remove', label: 'Take off' }]} value={dir} onChange={setDir} style={{ margin: 0 }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span><span className="lab" style={{ display: 'block' }}>How many</span>{st ? <span className="help">On hand after: {st.onHand + change}</span> : null}</span>
              <Stepper value={qty} min={1} onChange={setQty} />
            </div>
            <div className="field"><span className="lab">Reason</span><Chips items={ADJUST_REASONS.map((r) => ({ key: r, label: r }))} value={reason} onChange={setReason} style={{ padding: 0, flexWrap: 'wrap', overflow: 'visible' }} /></div>
            <Field label="Note"><TextInput value={note} onChange={setNote} placeholder={reason === 'Other' ? 'What happened?' : 'Optional'} multiline /></Field>
            {approval && row ? <Note tone="warn" icon="alert">{change < 0 ? 'It lowers the stock' : `It adds more than ${APPROVAL_LIMIT} pieces`}: a manager approves it.</Note> : null}
            {waiting.length ? (
              <>
                <div className="sec" style={{ margin: '8px 0 0' }}><h2>Waiting for approval</h2><span className="pill p-warn">{waiting.length}</span></div>
                <div className="card">
                  {waiting.map((a) => { const p = productBy(a.sku); return <ListRow key={a.id} onClick={() => setOpen(a.id)} compact title={p ? p.name : a.sku} sub={`${a.reason} · ${a.place} · ${a.by}`} end={<span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: a.qty < 0 ? 'var(--err)' : 'var(--ok)' }}>{a.qty > 0 ? '+' : '−'}{Math.abs(a.qty)}</span>} />; })}
                </div>
              </>
            ) : null}
            <div className="sec" style={{ margin: '8px 0 0' }}><h2>Recent</h2><a href="/stock-adjustments" className="tap">On the web</a></div>
            <div className="card">
              {adjustments.filter((a) => a.status !== 'waiting').slice(0, 5).map((a) => { const p = productBy(a.sku); const [tone, label] = SH[a.status] || ['grey', a.status]; return <ListRow key={a.id} compact title={p ? p.name : a.sku} sub={`${dayText(a.at)} · ${a.reason} · ${a.place}`} end={<span style={{ display: 'flex', gap: '8px', alignItems: 'center' }}><span className="num" style={{ fontWeight: 'var(--weight-semibold)' }}>{a.qty > 0 ? '+' : '−'}{Math.abs(a.qty)}</span><Pill tone={tone}>{label}</Pill></span>} chevron={false} />; })}
            </div>
            <div style={{ height: '4px' }} />
          </div>
        ) : ses ? (
          <>
            <div className="card" style={{ margin: '16px 20px 0', padding: '16px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}><Pill tone="nav">{md.label}</Pill><span className="mono" style={{ marginLeft: 'auto', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{ses.id}</span></div>
              <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)', marginTop: '6px' }}>{ses.place}</div>
              <div className="help">{ses.area === 'all' ? 'Everything' : ses.area} · started {dayText(ses.snapshotAt)} by {ses.createdBy}{hidden ? ' · system numbers hidden' : ''}</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginTop: '12px' }}>
                <span className="bar" style={{ flex: 1 }}><i style={{ width: (sum && sum.total ? Math.round((sum.counted / sum.total) * 100) : 0) + '%', background: '#003087' }} /></span>
                <span className="num" style={{ fontSize: 'var(--text-xs-plus)', color: 'var(--muted)' }}>{sum ? `${sum.counted}/${sum.total} counted` : ''}</span>
              </div>
              {sum && sum.recounts.length && ses.status === 'recount' ? <Note tone="warn" icon="alert" style={{ marginTop: '12px' }}>Count the marked products again.</Note> : null}
            </div>
            <div className="srch" style={{ marginTop: '14px' }}><Icon name="search" size={20} /><input type="search" value={cq} onChange={(e) => setCq(e.target.value)} placeholder="Find a product" aria-label="Find a product" /><button type="button" className="sc" aria-label="Scan a barcode" onClick={() => setScan(true)}><Icon name="scan" size={20} /></button></div>
            <div className="card" style={{ margin: '14px 20px 0' }}>
              {countLines.slice(0, 120).map((l) => {
                const p = rowBy(l.sku), mine = myCount(ses, l.sku, who);
                const showDiff = !hidden && l.counted != null && l.diff !== 0;
                return (
                  <div key={l.sku} className="lrow">
                    {p ? <Thumb row={p} size={44} /> : null}
                    <span style={{ flex: 1, minWidth: 0 }}>
                      <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{p ? p.name : l.sku}</span>
                      <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: l.needsRecount || (ses.recount || {})[l.sku] ? 'var(--warn)' : showDiff ? 'var(--err)' : 'var(--muted)' }}>
                        {hidden ? (l.counted == null ? 'Not counted' : `Counted ${l.counted}`) : `Expected ${l.expected}${l.counted == null ? '' : ` · counted ${l.counted}`}${showDiff ? ` (${l.diff > 0 ? '+' : '−'}${Math.abs(l.diff)})` : ''}`}{(ses.recount || {})[l.sku] ? ' · recount' : ''}
                      </span>
                    </span>
                    <Stepper value={mine || 0} min={0} label={'My count of ' + (p ? p.name : l.sku)} onChange={(n) => { setCount(ses.id, l.sku, n, who); refresh(); }} />
                  </div>
                );
              })}
              {!countLines.length ? <EmptyState icon="search" title="No product matches" /> : null}
            </div>
            <div style={{ textAlign: 'center', margin: '16px 0 4px' }}><button type="button" className="tap" onClick={cancelCount} style={{ border: 0, background: 'none', color: 'var(--err)', fontSize: 'var(--text-sm)', fontWeight: 'var(--weight-medium)', cursor: 'pointer' }}>Cancel this count</button></div>
          </>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '16px 20px 0' }}>
            <div className="field"><span className="lab">Kind of count</span><Chips items={COUNT_MODES.map((m) => ({ key: m.k, label: m.label }))} value={cMode} onChange={setCMode} style={{ padding: 0, flexWrap: 'wrap', overflow: 'visible' }} /><span className="help">{modeBy(cMode).hint}</span></div>
            {places.length > 1 ? <Field label="Place"><Select value={place} onChange={setPlace} options={places} label="Place" /></Field> : null}
            <Field label="What to count"><Select value={cArea} onChange={setCArea} options={[['all', 'Everything at the place'], ...cats.map((c) => [c, c])]} label="What to count" /></Field>
            <Button icon="clipboard" onClick={start}>Start counting</Button>
            <span className="help" style={{ textAlign: 'center' }}>The system takes a snapshot now. Sales while you count are not differences.</span>
          </div>
        )}
      </Content>
      {tab === 'adjust' && ready ? (
        <ActionBar>
          {approval && row ? <Button kind="line" onClick={saveWaiting}>Ask later</Button> : null}
          <Button onClick={save} style={{ flex: 2 }}>{approval && row ? 'Approve with PIN' : 'Save'}</Button>
        </ActionBar>
      ) : tab === 'count' && ses ? <ActionBar><Button onClick={finish}>Finish count</Button></ActionBar> : null}

      <ProductSheet open={pick} onClose={() => setPick(false)} onPick={(r) => { setSku(r.sku); setPick(false); }} place={place} title="Choose a product" filter={(r) => r.format !== 'digital' && r.format !== 'service' && r.format !== 'licence' && !(r.bundle && r.bundle.type !== 'kit')} />
      <ScanSheet open={scan} onClose={() => setScan(false)} onCode={tab === 'count' && ses ? onScanCount : onScanAdjust} title={tab === 'count' && ses ? 'Scan to count' : 'Scan a product'} hint={tab === 'count' && ses ? 'Each scan counts one; a carton counts its pieces.' : undefined} />
      <PinSheet open={!!pin} onClose={() => setPin(null)} action="Stock adjustment" by={me()}
        reason={pin && pin.kind === 'approve' && sel ? `Approve ${sel.id}: ${sel.qty > 0 ? '+' : '−'}${Math.abs(sel.qty)} at ${sel.place} (${sel.reason}).` : row ? `${row.name}: ${change > 0 ? '+' : '−'}${Math.abs(change)} at ${place} (${reason}).` : ''}
        amount={Math.abs(pin && pin.kind === 'approve' && sel ? sel.qty : change)} refId={pin && pin.id} onApprove={approved} />
      <PinSheet open={post} onClose={() => setPost(false)} action="Stock count" by={who} refId={ses ? ses.id : ''}
        reason={sum ? `Post the count at ${ses.place}: short ${short.length} lines (−${short.reduce((a, l) => a - l.diff, 0)} pcs), over ${over.length} lines (+${over.reduce((a, l) => a + l.diff, 0)} pcs).` : ''}
        onApprove={(m) => { const r = postSession(ses.id, m); setPost(false); refresh(); toast(`${r && r.result ? r.result.lines : sum.diffs.length} count differences posted at ${ses.place} · approved by ${m}`); }} />
      <Sheet open={!!sel && !pin} onClose={() => setOpen('')} title={sel ? sel.id : ''} footer={sel ? <><Button kind="danger" onClick={() => reject(sel)}>Reject</Button><Button onClick={() => setPin({ kind: 'approve', id: sel.id })} style={{ flex: 2 }}>Approve</Button></> : null}>
        {sel ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <div style={{ fontSize: 'var(--text-lg)', fontWeight: 'var(--weight-semibold)' }}>{(productBy(sel.sku) || {}).name || sel.sku}</div>
            <div className="help">{sel.place} · {sel.reason}{sel.note ? ' · ' + sel.note : ''} · by {sel.by}, {dayText(sel.at)}</div>
            <div className="num" style={{ fontSize: 'var(--text-2xl)', fontWeight: 'var(--weight-semibold)', color: sel.qty < 0 ? 'var(--err)' : 'var(--ok)' }}>{sel.qty > 0 ? '+' : '−'}{Math.abs(sel.qty)}</div>
          </div>
        ) : null}
      </Sheet>
    </AppScreen>
  );
}
