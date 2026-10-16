'use client';
// Services › Experts (/admin/services/experts) — who does the work: GridCommerce staff and outside partners, their
// skills (services), how many orders they can hold and hold now, rating, and a partner's commission (what they earn of
// each fee; it is booked in Finance as owed when the work is approved). Add or edit one in a side panel; switch one off
// to stop new orders reaching them.
// Batch D: each expert has a payout account (bank, bKash or Nagad) that task payouts go to; Teams (tab) group experts
// under a lead with their own payout account, so an order or a task can go to a team.

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { Sheet, StatusBadge } from '@/components/ui';
import { getExperts, getServices, getTeams, loadOf, saveExpert, saveTeam, bankText, BANK_METHODS } from '@/lib/platform/services';
import { AdminShell } from '../AdminShell';
import { useSvc, SVA_CSS } from './svcAdmin';
import { Pic, PicStack } from '@/components/ui/Pic';

/** Payout account fields (bank, bKash or Nagad). */
function BankFields({ value, onChange, id }) {
  const b = value || { method: 'bank', name: '', account: '', branch: '' };
  const set = (p) => onChange({ ...b, ...p });
  return (
    <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
      <legend className="gc-label">Payout account (task payouts are paid here)</legend>
      <div className="sva-grid2">
        <div><label className="gc-label" htmlFor={id + '-m'}>Paid by</label><select id={id + '-m'} className="gc-input gc-select" value={b.method} onChange={(e) => set({ method: e.target.value })}>{BANK_METHODS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
        {b.method === 'bank' ? <div><label className="gc-label" htmlFor={id + '-b'}>Bank</label><input id={id + '-b'} className="gc-input" value={b.name || ''} onChange={(e) => set({ name: e.target.value })} placeholder="City Bank" /></div> : null}
        <div><label className="gc-label" htmlFor={id + '-a'}>{b.method === 'bank' ? 'Account number' : 'Number'}</label><input id={id + '-a'} className="gc-input" value={b.account || ''} onChange={(e) => set({ account: e.target.value })} inputMode={b.method === 'bank' ? undefined : 'tel'} /></div>
        {b.method === 'bank' ? <div><label className="gc-label" htmlFor={id + '-r'}>Branch</label><input id={id + '-r'} className="gc-input" value={b.branch || ''} onChange={(e) => set({ branch: e.target.value })} /></div> : null}
      </div>
    </fieldset>
  );
}

export default function SvcExperts() {
  const { ready, tick } = useSvc();
  const [tab, setTab] = useState('all');
  const [ed, setEd] = useState(null);
  const [tm, setTm] = useState(null);   // the team being edited
  const teams = ready ? getTeams() : [];
  const rows = useMemo(() => (ready ? getExperts().map((e) => ({ e, load: loadOf(e.id) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const svcs = ready ? getServices().filter((s) => !s.custom) : [];
  const name = (id) => (svcs.find((s) => s.id === id) || { name: id }).name;
  const shown = rows.filter((x) => tab === 'all' || x.e.kind === tab);
  const tabs = [['all', 'All'], ['staff', 'Staff'], ['partner', 'Partners'], ['teams', 'Teams']].map(([k, l]) => ({ key: k, id: 'se-tab-' + k, label: l, count: ready ? (k === 'teams' ? teams.length : rows.filter((x) => k === 'all' || x.e.kind === k).length) : null, on: tab === k, onClick: () => setTab(k) }));
  const save = () => { const r = saveExpert(ed); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast('Saved'); setEd(null); };
  const saveT = () => { const r = saveTeam(tm); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast('Team saved'); setTm(null); };
  const exName = (id) => (rows.find((x) => x.e.id === id) || { e: { name: id } }).e.name;
  const exPic = (id) => (rows.find((x) => x.e.id === id) || { e: {} }).e.photo || '';
  const bar = (x) => { const pct = Math.min(100, Math.round((x.load / Math.max(1, x.e.capacity)) * 100)); return <span className="sva-load"><i aria-hidden="true"><b className={x.load >= x.e.capacity ? 'is-full' : ''} style={{ width: pct + '%' }} /></i>{x.load} of {x.e.capacity}</span>; };

  return (
    <AdminShell active="svc-experts" title="Experts">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="users-round" title="Experts"
          about="GridCommerce staff and outside partners who deliver services. New orders are suggested to the expert with the skill and the most room. A partner earns their commission on each approved order or month; it is booked in Finance as owed."
          secondary={[{ label: 'Orders', href: '/admin/services' }]} primary={tab === 'teams' ? { label: 'Add team', onClick: () => setTm({ name: '', lead: '', members: [], skills: [], bank: null, active: true }) } : { label: 'Add expert', onClick: () => setEd({ name: '', kind: 'partner', skills: [], capacity: 5, commission: 60, rating: 0, phone: '', email: '', active: true, bank: null }) }} />
        <section className="ix-card" aria-label="Experts">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Experts" /></div>
          {ready && tab === 'teams' ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table">
                <caption className="sr-only">Teams</caption>
                <thead><tr><th scope="col">Team</th><th scope="col">People</th><th scope="col">Skills</th><th scope="col">Payout account</th><th scope="col">Status</th></tr></thead>
                <tbody>{teams.map((t) => (
                  <tr key={t.id} onClick={() => setTm(JSON.parse(JSON.stringify(t)))}>
                    <td><span className="gc-picrow"><PicStack items={(t.members || []).map((m) => ({ name: exName(m), src: exPic(m) }))} /><span><button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit' }} onClick={() => setTm(JSON.parse(JSON.stringify(t)))}>{t.name}</button><span className="sva-sub">Lead {exName(t.lead)}</span></span></span></td>
                    <td className="ix-muted">{t.members.map(exName).join(', ')}</td>
                    <td className="ix-muted" title={(t.skills || []).map(name).join(', ')}>{(t.skills || []).length ? `${(t.skills || []).length} service${(t.skills || []).length === 1 ? '' : 's'}` : '—'}</td>
                    <td className="ix-muted">{bankText(t.bank)}</td>
                    <td><StatusBadge tone={t.active !== false ? 'success' : 'neutral'}>{t.active !== false ? 'Taking orders' : 'Off'}</StatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : !ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : (<>
            <ul className="ix-plist">{shown.map((x) => <li key={x.e.id}><button type="button" className="ix-pitem ix-pitem--thumb" onClick={() => setEd({ ...x.e })}><span style={{ gridRow: 'span 2', alignSelf: 'center', display: 'flex' }}><Pic src={x.e.photo || ''} name={x.e.name} kind="person" /></span><span className="ix-pitem__top"><b>{x.e.name}</b><StatusBadge tone={x.e.active ? 'success' : 'neutral'}>{x.e.active ? (x.e.kind === 'partner' ? 'Partner' : 'Staff') : 'Off'}</StatusBadge></span><span className="ix-pitem__mid">{x.load} of {x.e.capacity} orders · {x.e.skills.map(name).join(', ')}</span></button></li>)}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Experts</caption>
                <thead><tr><th scope="col">Expert</th><th scope="col">Skills</th><th scope="col">Load</th><th scope="col">Rating</th><th scope="col">Usual share</th><th scope="col">Payout account</th><th scope="col">Status</th></tr></thead>
                <tbody>{shown.map((x) => (
                  <tr key={x.e.id} onClick={() => setEd({ ...x.e })}>
                    <td><span className="gc-picrow"><Pic src={x.e.photo || ''} name={x.e.name} kind="person" /><span><button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit' }} onClick={() => setEd({ ...x.e })}>{x.e.name}</button><span className="sva-sub">{x.e.kind === 'partner' ? 'Partner' : 'GridCommerce staff'} · {x.e.email}</span></span></span></td>
                    <td className="ix-muted">{x.e.skills.map(name).join(', ') || '—'}</td>
                    <td>{bar(x)}</td>
                    <td>{x.e.rating ? x.e.rating.toFixed(1) + '★' : '—'}</td>
                    <td>{x.e.kind === 'partner' ? x.e.commission + '%' : '—'}</td>
                    <td className="ix-muted">{bankText(x.e.bank)}</td>
                    <td><StatusBadge tone={x.e.active ? 'success' : 'neutral'}>{x.e.active ? 'Taking orders' : 'Off'}</StatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{tab === 'teams' ? teams.length + ' teams' : shown.length + ' experts'}</span></div>
        </section>
      </div>
      <Sheet open={!!ed} title={ed && ed.id ? ed.name : 'Add expert'} onClose={() => setEd(null)} footer={ed ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEd(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Save</button></> : null}>
        {ed ? (
          <form className="sva-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div><label className="gc-label" htmlFor="ex-n">Name</label><input id="ex-n" className="gc-input" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} data-autofocus /></div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', gap: 12 }}><legend className="gc-label">Who</legend>{[['staff', 'GridCommerce staff'], ['partner', 'Outside partner']].map(([k, l]) => <label key={k} className="sva-chk"><input type="radio" name="ex-k" className="gc-check gc-check--radio" checked={ed.kind === k} onChange={() => setEd({ ...ed, kind: k })} />{l}</label>)}</fieldset>
            <div className="sva-grid2">
              <div><label className="gc-label" htmlFor="ex-c">Orders at a time</label><input id="ex-c" className="gc-input" inputMode="numeric" value={ed.capacity} onChange={(e) => setEd({ ...ed, capacity: e.target.value })} /></div>
              {ed.kind === 'partner' ? <div><label className="gc-label" htmlFor="ex-m">Usual share (% of the fee; suggested for their tasks)</label><input id="ex-m" className="gc-input" inputMode="numeric" value={ed.commission} onChange={(e) => setEd({ ...ed, commission: e.target.value })} /></div> : null}
              <div><label className="gc-label" htmlFor="ex-p">Phone</label><input id="ex-p" className="gc-input" value={ed.phone || ''} onChange={(e) => setEd({ ...ed, phone: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="ex-e">Email</label><input id="ex-e" className="gc-input" value={ed.email || ''} onChange={(e) => setEd({ ...ed, email: e.target.value })} /></div>
            </div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">Skills</legend>{svcs.map((s) => <label key={s.id} className="sva-chk"><input type="checkbox" className="gc-check" checked={ed.skills.includes(s.id)} onChange={() => setEd({ ...ed, skills: ed.skills.includes(s.id) ? ed.skills.filter((x) => x !== s.id) : [...ed.skills, s.id] })} />{s.name}</label>)}</fieldset>
            <BankFields id="ex-bank" value={ed.bank} onChange={(b) => setEd({ ...ed, bank: b })} />
            <label className="sva-chk"><input type="checkbox" className="gc-check" checked={ed.active !== false} onChange={(e) => setEd({ ...ed, active: e.target.checked })} />Taking new orders</label>
            {ed.kind === 'partner' ? <p className="gc-help"><Icon name="shield-check" width="14" height="14" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> Partners see a store only through an access session the owner approves, for the time and part of the store asked; every change is logged.</p> : null}
          </form>
        ) : null}
      </Sheet>
      <Sheet open={!!tm} title={tm && tm.id ? tm.name : 'Add team'} onClose={() => setTm(null)} footer={tm ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setTm(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={saveT}>Save</button></> : null}>
        {tm ? (
          <form className="sva-form" onSubmit={(e) => { e.preventDefault(); saveT(); }}>
            <div><label className="gc-label" htmlFor="tm-n">Team name</label><input id="tm-n" className="gc-input" value={tm.name} onChange={(e) => setTm({ ...tm, name: e.target.value })} /></div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">People</legend>{rows.filter((x) => x.e.active).map((x) => <label key={x.e.id} className="sva-chk"><input type="checkbox" className="gc-check" checked={tm.members.includes(x.e.id)} onChange={() => setTm({ ...tm, members: tm.members.includes(x.e.id) ? tm.members.filter((y) => y !== x.e.id) : [...tm.members, x.e.id], lead: tm.lead === x.e.id && tm.members.includes(x.e.id) ? '' : tm.lead })} />{x.e.name}<span className="ix-muted"> · {x.e.kind === 'partner' ? 'partner' : 'staff'}</span></label>)}</fieldset>
            <div><label className="gc-label" htmlFor="tm-l">Lead (the order’s expert)</label><select id="tm-l" className="gc-input gc-select" value={tm.lead} onChange={(e) => setTm({ ...tm, lead: e.target.value })}><option value="">Choose…</option>{tm.members.map((id) => <option key={id} value={id}>{exName(id)}</option>)}</select></div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">Services it does</legend>{svcs.map((s) => <label key={s.id} className="sva-chk"><input type="checkbox" className="gc-check" checked={(tm.skills || []).includes(s.id)} onChange={() => setTm({ ...tm, skills: (tm.skills || []).includes(s.id) ? tm.skills.filter((x) => x !== s.id) : [...(tm.skills || []), s.id] })} />{s.name}</label>)}</fieldset>
            <BankFields id="tm-bank" value={tm.bank} onChange={(b) => setTm({ ...tm, bank: b })} />
            <label className="sva-chk"><input type="checkbox" className="gc-check" checked={tm.active !== false} onChange={(e) => setTm({ ...tm, active: e.target.checked })} />Taking new orders</label>
          </form>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
