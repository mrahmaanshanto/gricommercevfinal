'use client';
// Services › Experts (/admin/services/experts) — who does the work: GridCommerce staff and outside partners, their
// skills (services), how many orders they can hold and hold now, rating, and a partner's commission (what they earn of
// each fee; it is booked in Finance as owed when the work is approved). Add or edit one in a side panel; switch one off
// to stop new orders reaching them.

import React, { useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ShopHeader, IndexTabs } from '@/components/ui/IndexKit';
import { Sheet, StatusBadge } from '@/components/ui';
import { getExperts, getServices, loadOf, saveExpert } from '@/lib/platform/services';
import { AdminShell } from '../AdminShell';
import { useSvc, SVA_CSS } from './svcAdmin';

export default function SvcExperts() {
  const { ready, tick } = useSvc();
  const [tab, setTab] = useState('all');
  const [ed, setEd] = useState(null);
  const rows = useMemo(() => (ready ? getExperts().map((e) => ({ e, load: loadOf(e.id) })) : []), [ready, tick]); // eslint-disable-line react-hooks/exhaustive-deps
  const svcs = ready ? getServices() : [];
  const name = (id) => (svcs.find((s) => s.id === id) || { name: id }).name;
  const shown = rows.filter((x) => tab === 'all' || x.e.kind === tab);
  const tabs = [['all', 'All'], ['staff', 'Staff'], ['partner', 'Partners']].map(([k, l]) => ({ key: k, id: 'se-tab-' + k, label: l, count: ready ? rows.filter((x) => k === 'all' || x.e.kind === k).length : null, on: tab === k, onClick: () => setTab(k) }));
  const save = () => { const r = saveExpert(ed); if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast('Saved'); setEd(null); };
  const bar = (x) => { const pct = Math.min(100, Math.round((x.load / Math.max(1, x.e.capacity)) * 100)); return <span className="sva-load"><i aria-hidden="true"><b className={x.load >= x.e.capacity ? 'is-full' : ''} style={{ width: pct + '%' }} /></i>{x.load} of {x.e.capacity}</span>; };

  return (
    <AdminShell active="svc-experts" title="Experts">
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="users-round" title="Experts"
          about="GridCommerce staff and outside partners who deliver services. New orders are suggested to the expert with the skill and the most room. A partner earns their commission on each approved order or month; it is booked in Finance as owed."
          secondary={[{ label: 'Orders', href: '/admin/services' }]} primary={{ label: 'Add expert', onClick: () => setEd({ name: '', kind: 'partner', skills: [], capacity: 5, commission: 60, rating: 0, phone: '', email: '', active: true }) }} />
        <section className="ix-card" aria-label="Experts">
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Experts" /></div>
          {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : (<>
            <ul className="ix-plist">{shown.map((x) => <li key={x.e.id}><button type="button" className="ix-pitem" onClick={() => setEd({ ...x.e })}><span className="ix-pitem__top"><b>{x.e.name}</b><StatusBadge tone={x.e.active ? 'success' : 'neutral'}>{x.e.active ? (x.e.kind === 'partner' ? 'Partner' : 'Staff') : 'Off'}</StatusBadge></span><span className="ix-pitem__mid">{x.load} of {x.e.capacity} orders · {x.e.skills.map(name).join(', ')}</span></button></li>)}</ul>
            <div className="ix-table-wrap">
              <table className="ix-table">
                <caption className="sr-only">Experts</caption>
                <thead><tr><th scope="col">Expert</th><th scope="col">Skills</th><th scope="col">Load</th><th scope="col">Rating</th><th scope="col">Commission</th><th scope="col">Status</th></tr></thead>
                <tbody>{shown.map((x) => (
                  <tr key={x.e.id} onClick={() => setEd({ ...x.e })}>
                    <td><button type="button" className="ix-strong" style={{ border: 0, background: 'none', padding: 0, font: 'inherit', cursor: 'pointer', color: 'inherit' }} onClick={() => setEd({ ...x.e })}>{x.e.name}</button><span className="sva-sub">{x.e.kind === 'partner' ? 'Partner' : 'GridCommerce staff'} · {x.e.email}</span></td>
                    <td className="ix-muted">{x.e.skills.map(name).join(', ') || '—'}</td>
                    <td>{bar(x)}</td>
                    <td>{x.e.rating ? x.e.rating.toFixed(1) + '★' : '—'}</td>
                    <td>{x.e.kind === 'partner' ? x.e.commission + '%' : '—'}</td>
                    <td><StatusBadge tone={x.e.active ? 'success' : 'neutral'}>{x.e.active ? 'Taking orders' : 'Off'}</StatusBadge></td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          </>)}
          <div className="ix-foot"><span>{shown.length} experts</span></div>
        </section>
      </div>
      <Sheet open={!!ed} title={ed && ed.id ? ed.name : 'Add expert'} onClose={() => setEd(null)} footer={ed ? <><button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => setEd(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--sm gc-btn--solid" onClick={save}>Save</button></> : null}>
        {ed ? (
          <form className="sva-form" onSubmit={(e) => { e.preventDefault(); save(); }}>
            <div><label className="gc-label" htmlFor="ex-n">Name</label><input id="ex-n" className="gc-input" value={ed.name} onChange={(e) => setEd({ ...ed, name: e.target.value })} data-autofocus /></div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', gap: 12 }}><legend className="gc-label">Who</legend>{[['staff', 'GridCommerce staff'], ['partner', 'Outside partner']].map(([k, l]) => <label key={k} className="sva-chk"><input type="radio" name="ex-k" className="gc-check gc-check--radio" checked={ed.kind === k} onChange={() => setEd({ ...ed, kind: k })} />{l}</label>)}</fieldset>
            <div className="sva-grid2">
              <div><label className="gc-label" htmlFor="ex-c">Orders at a time</label><input id="ex-c" className="gc-input" inputMode="numeric" value={ed.capacity} onChange={(e) => setEd({ ...ed, capacity: e.target.value })} /></div>
              {ed.kind === 'partner' ? <div><label className="gc-label" htmlFor="ex-m">Commission (% of the fee)</label><input id="ex-m" className="gc-input" inputMode="numeric" value={ed.commission} onChange={(e) => setEd({ ...ed, commission: e.target.value })} /></div> : null}
              <div><label className="gc-label" htmlFor="ex-p">Phone</label><input id="ex-p" className="gc-input" value={ed.phone || ''} onChange={(e) => setEd({ ...ed, phone: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="ex-e">Email</label><input id="ex-e" className="gc-input" value={ed.email || ''} onChange={(e) => setEd({ ...ed, email: e.target.value })} /></div>
            </div>
            <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">Skills</legend>{svcs.map((s) => <label key={s.id} className="sva-chk"><input type="checkbox" className="gc-check" checked={ed.skills.includes(s.id)} onChange={() => setEd({ ...ed, skills: ed.skills.includes(s.id) ? ed.skills.filter((x) => x !== s.id) : [...ed.skills, s.id] })} />{s.name}</label>)}</fieldset>
            <label className="sva-chk"><input type="checkbox" className="gc-check" checked={ed.active !== false} onChange={(e) => setEd({ ...ed, active: e.target.checked })} />Taking new orders</label>
            {ed.kind === 'partner' ? <p className="gc-help"><Icon name="shield-check" width="14" height="14" aria-hidden="true" style={{ verticalAlign: 'middle' }} /> Partners see a store only through an access session the owner approves, for the time and part of the store asked; every change is logged.</p> : null}
          </form>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
