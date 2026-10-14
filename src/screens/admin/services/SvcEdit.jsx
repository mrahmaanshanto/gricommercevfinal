'use client';
// Services › edit a service (/admin/service-edit?id= ; no id = a new one): name, category, one-time or monthly, the
// short pitch and what you get; packages (name, price before VAT, delivery days, changes included, what it covers);
// add-ons; the brief form builder (each question: label, kind — short / long text, web address, amount, number, pick one,
// files — required or not, help, options; move up and down, remove); questions and sample work; whether the work needs
// store access (what may be opened, how long); who may buy it (editions, plans); On sale / Paused.

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { RecordHeader } from '@/components/ui/IndexKit';
import { serviceById, saveService, CATS, FIELD_TYPES, AREAS } from '@/lib/platform/services';
import { AdminShell } from '../AdminShell';
import { useSvc, qp, SVA_CSS } from './svcAdmin';

const EDITIONS = [['online', 'Online'], ['retail-online', 'Retail + Online'], ['retail-wholesale', 'Retail'], ['comms', 'Connect']];
const PLANS = [['starter', 'Starter'], ['growth', 'Growth'], ['business', 'Business']];
const blank = () => ({ id: '', name: '', cat: 'grow', icon: 'briefcase', cycle: 'oneoff', blurb: '', gets: [], packages: [{ id: 'starter', name: 'Starter', price: '', days: 7, revisions: 1, includes: [] }], addons: [], brief: [{ id: 'goal', label: 'What do you want from this?', type: 'textarea', req: true }], faq: [], samples: [], access: { needed: false, area: 'products', minutes: 60 }, editions: [], plans: [], status: 'paused' });
const lines = (v) => String(v || '').split('\n').map((x) => x.trim()).filter(Boolean);
const toggle = (list, k) => (list.includes(k) ? list.filter((x) => x !== k) : [...list, k]);

export default function SvcEdit() {
  const { ready } = useSvc();
  const router = useRouter();
  const [s, setS] = useState(null);
  const [isNew, setNew] = useState(true);
  useEffect(() => {
    if (!ready || s) return;
    const found = qp('id') ? serviceById(qp('id')) : null;
    setS(found ? JSON.parse(JSON.stringify(found)) : blank());
    setNew(!found);
  }, [ready, s]);
  if (!s) return <AdminShell active="svc-edit" title="Service"><div style={{ minHeight: 400 }} aria-busy="true" /></AdminShell>;

  const set = (patch) => setS((x) => ({ ...x, ...patch }));
  const setPkg = (i, patch) => set({ packages: s.packages.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const setAdd = (i, patch) => set({ addons: s.addons.map((p, j) => (j === i ? { ...p, ...patch } : p)) });
  const setQ = (i, patch) => set({ brief: s.brief.map((f, j) => (j === i ? { ...f, ...patch } : f)) });
  const moveQ = (i, d) => { const b = s.brief.slice(); const j = i + d; if (j < 0 || j >= b.length) return; [b[i], b[j]] = [b[j], b[i]]; set({ brief: b }); };
  const save = () => {
    const r = saveService({ ...s, brief: s.brief.map((f, i) => ({ ...f, id: f.id || 'q' + (i + 1) + Date.now().toString(36).slice(-3) })), addons: s.addons.filter((a) => String(a.name || '').trim()).map((a, i) => ({ ...a, id: a.id || 'add' + (i + 1), price: Number(a.price) || 0 })) });
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(isNew ? 'Service added' + (r.service.status === 'live' ? '' : ' (paused until you put it on sale)') : 'Saved');
    if (isNew) router.replace('/admin/service-edit?id=' + r.service.id);
    setS(JSON.parse(JSON.stringify(r.service))); setNew(false);
  };

  return (
    <AdminShell active="svc-edit" title={s.name || 'New service'}>
      <style dangerouslySetInnerHTML={{ __html: SVA_CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/services/catalogue" backLabel="Catalogue" title={s.name || 'New service'}
          badges={<span className={'gc-badge gc-badge--' + (s.status === 'live' ? 'success' : 'slate')}>{s.status === 'live' ? 'On sale' : 'Paused'}</span>}
          secondary={[{ label: s.status === 'live' ? 'Pause' : 'Put on sale', onClick: () => set({ status: s.status === 'live' ? 'paused' : 'live' }) }]}
          primary={{ label: 'Save', icon: 'check', onClick: save }} />
        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card sva-pad" aria-labelledby="se-basic">
              <h2 id="se-basic">Service</h2>
              <div className="sva-grid2">
                <div><label className="gc-label" htmlFor="se-name">Name</label><input id="se-name" className="gc-input" value={s.name} onChange={(e) => set({ name: e.target.value })} /></div>
                <div><label className="gc-label" htmlFor="se-cat">Category</label><select id="se-cat" className="gc-input gc-select" value={s.cat} onChange={(e) => set({ cat: e.target.value })}>{CATS.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="se-cyc">Billing</label><select id="se-cyc" className="gc-input gc-select" value={s.cycle} onChange={(e) => set({ cycle: e.target.value })}><option value="oneoff">One-time</option><option value="monthly">Monthly (a report each month)</option></select></div>
              </div>
              <div><label className="gc-label" htmlFor="se-blurb">Short pitch (one sentence)</label><input id="se-blurb" className="gc-input" value={s.blurb} onChange={(e) => set({ blurb: e.target.value })} /></div>
              <div><label className="gc-label" htmlFor="se-gets">What you get (one per line)</label><textarea id="se-gets" className="gc-input" rows={4} key={'g' + s.id} defaultValue={(s.gets || []).join('\n')} onChange={(e) => set({ gets: lines(e.target.value) })} /></div>
            </section>

            <section className="ix-card sva-pad" aria-labelledby="se-pk">
              <h2 id="se-pk">Packages</h2>
              {s.packages.map((p, i) => (
                <div key={i} className="sva-form" style={{ padding: 'var(--space-3)', border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)' }}>
                  <div className="sva-grid2">
                    <div><label className="gc-label" htmlFor={'se-pn' + i}>Name</label><input id={'se-pn' + i} className="gc-input" value={p.name} onChange={(e) => setPkg(i, { name: e.target.value })} /></div>
                    <div><label className="gc-label" htmlFor={'se-pp' + i}>Price before VAT (৳){s.cycle === 'monthly' ? ' a month' : ''}</label><input id={'se-pp' + i} className="gc-input" inputMode="numeric" value={p.price} onChange={(e) => setPkg(i, { price: e.target.value })} /></div>
                    <div><label className="gc-label" htmlFor={'se-pd' + i}>{s.cycle === 'monthly' ? 'Days to the first report' : 'Delivery days'}</label><input id={'se-pd' + i} className="gc-input" inputMode="numeric" value={p.days} onChange={(e) => setPkg(i, { days: e.target.value })} /></div>
                    <div><label className="gc-label" htmlFor={'se-pr' + i}>Changes included</label><input id={'se-pr' + i} className="gc-input" inputMode="numeric" value={p.revisions} onChange={(e) => setPkg(i, { revisions: e.target.value })} /></div>
                  </div>
                  <div><label className="gc-label" htmlFor={'se-pi' + i}>What it covers (one per line)</label><textarea id={'se-pi' + i} className="gc-input" rows={3} key={'i' + s.id + i} defaultValue={(p.includes || []).join('\n')} onChange={(e) => setPkg(i, { includes: lines(e.target.value) })} /></div>
                  {s.packages.length > 1 ? <div><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => set({ packages: s.packages.filter((_, j) => j !== i) })}><Icon name="trash-2" width="14" height="14" aria-hidden="true" />Remove package</button></div> : null}
                </div>
              ))}
              {s.packages.length < 4 ? <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ packages: [...s.packages, { id: ['starter', 'standard', 'pro', 'max'][s.packages.length], name: ['Starter', 'Standard', 'Pro', 'Max'][s.packages.length], price: '', days: 7, revisions: 1, includes: [] }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add package</button></div> : null}
              <h2>Add-ons</h2>
              {s.addons.map((a, i) => (
                <div key={i} className="sva-row" style={{ flexWrap: 'nowrap' }}>
                  <input className="gc-input" aria-label={'Add-on ' + (i + 1)} placeholder="e.g. 2 extra blog posts a month" value={a.name} onChange={(e) => setAdd(i, { name: e.target.value })} />
                  <input className="gc-input" style={{ maxWidth: 120 }} aria-label={'Add-on ' + (i + 1) + ' price'} inputMode="numeric" placeholder="৳" value={a.price} onChange={(e) => setAdd(i, { price: e.target.value })} />
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove add-on" onClick={() => set({ addons: s.addons.filter((_, j) => j !== i) })}><Icon name="x" width="14" height="14" /></button>
                </div>
              ))}
              <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ addons: [...s.addons, { id: '', name: '', price: '' }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add add-on</button></div>
            </section>

            <section className="ix-card sva-pad" aria-labelledby="se-brief">
              <h2 id="se-brief">Brief (what the store is asked when it orders)</h2>
              <ul className="sva-builder">
                {s.brief.map((f, i) => (
                  <li key={i}>
                    <input className="gc-input" aria-label={'Question ' + (i + 1)} placeholder="Question" value={f.label} onChange={(e) => setQ(i, { label: e.target.value })} />
                    <select className="gc-input gc-select" aria-label={'Question ' + (i + 1) + ' kind'} value={f.type} onChange={(e) => setQ(i, { type: e.target.value })}>{FIELD_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
                    <label className="sva-chk"><input type="checkbox" className="gc-check" checked={!!f.req} onChange={(e) => setQ(i, { req: e.target.checked })} />Required</label>
                    <span className="sva-row" style={{ flexWrap: 'nowrap', gap: 2 }}>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move up" disabled={!i} onClick={() => moveQ(i, -1)}><Icon name="arrow-up" width="14" height="14" /></button>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Move down" disabled={i === s.brief.length - 1} onClick={() => moveQ(i, 1)}><Icon name="arrow-down" width="14" height="14" /></button>
                      <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label="Remove question" onClick={() => set({ brief: s.brief.filter((_, j) => j !== i) })}><Icon name="trash-2" width="14" height="14" /></button>
                    </span>
                    <input className="gc-input sva-opts" aria-label={'Question ' + (i + 1) + (f.type === 'select' ? ' options' : ' help')} placeholder={f.type === 'select' ? 'Options, separated by commas' : 'Help under the question (optional)'} key={'o' + i + f.type + f.label} defaultValue={f.type === 'select' ? (f.options || []).join(', ') : f.help || ''} onChange={(e) => setQ(i, f.type === 'select' ? { options: e.target.value.split(',').map((x) => x.trim()).filter(Boolean) } : { help: e.target.value })} />
                  </li>
                ))}
              </ul>
              <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => set({ brief: [...s.brief, { id: '', label: '', type: 'text', req: false }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add question</button></div>
              <p className="gc-help">For ads services, ask the ad budget with an “Amount” question whose label says the store pays it to the platform: it is never in our charge.</p>
            </section>

            <section className="ix-card sva-pad" aria-labelledby="se-more">
              <h2 id="se-more">Questions and sample work</h2>
              <div><label className="gc-label" htmlFor="se-faq">Questions (a line “Q: …” then a line “A: …”)</label><textarea id="se-faq" className="gc-input" rows={4} key={'f' + s.id} defaultValue={(s.faq || []).map((f) => `Q: ${f.q}\nA: ${f.a}`).join('\n')} onChange={(e) => { const out = []; lines(e.target.value).forEach((l) => { if (/^q:/i.test(l)) out.push({ q: l.replace(/^q:\s*/i, ''), a: '' }); else if (/^a:/i.test(l) && out.length) out[out.length - 1].a = l.replace(/^a:\s*/i, ''); }); set({ faq: out }); }} /></div>
              <div><label className="gc-label" htmlFor="se-sam">Sample work (one per line)</label><textarea id="se-sam" className="gc-input" rows={2} key={'s' + s.id} defaultValue={(s.samples || []).join('\n')} onChange={(e) => set({ samples: lines(e.target.value) })} /></div>
            </section>
          </div>

          <aside className="ix-side" aria-label="Who and how">
            <section className="ix-card sva-pad">
              <h2>Who may buy it</h2>
              <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">Editions (none ticked = all)</legend>{EDITIONS.map(([k, l]) => <label key={k} className="sva-chk"><input type="checkbox" className="gc-check" checked={s.editions.includes(k)} onChange={() => set({ editions: toggle(s.editions, k) })} />{l}</label>)}</fieldset>
              <fieldset style={{ border: 0, margin: 0, padding: 0, display: 'flex', flexDirection: 'column', gap: 6 }}><legend className="gc-label">Plans (none ticked = all)</legend>{PLANS.map(([k, l]) => <label key={k} className="sva-chk"><input type="checkbox" className="gc-check" checked={s.plans.includes(k)} onChange={() => set({ plans: toggle(s.plans, k) })} />{l}</label>)}</fieldset>
            </section>
            <section className="ix-card sva-pad">
              <h2>Store access</h2>
              <label className="sva-chk"><input type="checkbox" className="gc-check" checked={!!(s.access && s.access.needed)} onChange={(e) => set({ access: { ...(s.access || {}), needed: e.target.checked, area: (s.access && s.access.area) || 'products', minutes: (s.access && s.access.minutes) || 60 } })} />The work is done inside the store</label>
              {s.access && s.access.needed ? (<>
                <div><label className="gc-label" htmlFor="se-area">What the expert asks to open</label><select id="se-area" className="gc-input gc-select" value={s.access.area} onChange={(e) => set({ access: { ...s.access, area: e.target.value } })}>{AREAS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select></div>
                <div><label className="gc-label" htmlFor="se-min">For up to</label><select id="se-min" className="gc-input gc-select" value={s.access.minutes} onChange={(e) => set({ access: { ...s.access, minutes: Number(e.target.value) } })}>{[15, 30, 60].map((m) => <option key={m} value={m}>{m} minutes</option>)}</select></div>
                <p className="gc-help">The owner approves each time in their panel; every change is logged.</p>
              </>) : null}
            </section>
          </aside>
        </div>
      </div>
    </AdminShell>
  );
}
