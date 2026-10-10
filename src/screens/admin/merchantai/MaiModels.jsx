'use client';
// Merchant AI › Models & cost (/admin/merchant-ai/models) — the AI every store runs on.
//   Providers      status, latency, pause / resume (a paused provider sends every store to its fallback)
//   Routing        the main and fallback model per tier for all stores (a store's own Settings can only pick within it)
//   Releases       a new model version runs the platform test set (Bangla, Banglish, prices, stock, safety, access);
//                  it rolls out to every store only after it passes — a critical failure blocks it
//   Cost           six months of provider cost against what GridCommerce bills for AI
// Data: lib/admin/merchantAi.js. Worked out after loading.

import React, { useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { ShopHeader, MetricStrip } from '@/components/ui/IndexKit';
import { StatusBadge } from '@/components/ui';
import { ColumnChart, Legend, CHART_CSS } from '@/components/charts/DashCharts';
import { BrandLogo } from '@/components/BrandLogo';
import { useAdminStore } from '@/lib/admin/store';
import { merchantAi, usageRows, totals, costHistory, setProvider, setRouting, runRelease, rollOut, addRelease, PROVIDERS, MODELS, TIERS, modelName } from '@/lib/admin/merchantAi';
import { taka, dmy, monthOf } from '@/lib/platform/util';
import { AdminShell, usePlatform } from '../AdminShell';
import { MAI_CSS } from './maiShared';

const REL_TONE = { testing: 'info', passed: 'success', live: 'success', blocked: 'error', replaced: 'neutral' };
const REL_WORD = { testing: 'Waiting for tests', passed: 'Passed · ready to roll out', live: 'Live for every store', blocked: 'Blocked', replaced: 'Replaced' };
const PROV_TONE = { Operational: 'success', Degraded: 'warning', Paused: 'neutral' };

export default function MaiModels() {
  const { db, t, live } = usePlatform();
  const s = useAdminStore(merchantAi);
  const ready = live && s.live;
  const [pick, setPick] = useState('');
  const d = s.data;
  const rows = ready ? usageRows(db, t, d) : [];
  const tot = ready ? totals(rows) : null;
  const hist = ready ? costHistory(t, d, rows) : [];
  const billed = hist.length ? hist[hist.length - 1].billed : 0;
  const act = (r, msg) => { if (!r.ok) { toast(r.error, { tone: 'error' }); return; } toast(typeof msg === 'function' ? msg(r) : msg); };

  return (
    <AdminShell active="mai-models" title="Models & cost">
      <style dangerouslySetInnerHTML={{ __html: MAI_CSS + CHART_CSS }} />
      <div className="ix-page">
        <ShopHeader icon="cpu" title="Models & cost"
          about="The AI providers and models every store's Grid AI runs on. Each tier has a main model and a fallback on another provider; pausing a provider sends every store to its fallback. A new model version must pass the platform test set before it rolls out to every store."
          more={[{ label: 'Usage & credits', href: '/admin/merchant-ai' }, { label: 'AI plans & limits', href: '/admin/merchant-ai/plans' }]} />
        {ready ? <MetricStrip label="This month" items={[
          { label: 'Provider cost', value: taka(tot.cost), icon: 'cpu' },
          { label: 'Billed for AI', value: taka(billed), sub: 'plan share + overage + credits', icon: 'receipt' },
          { label: 'Margin', value: billed ? Math.round(((billed - tot.cost) / billed) * 100) + '%' : '—', icon: 'trending-up' },
          { label: 'Markup', value: d.markup + '%', icon: 'percent' },
        ]} /> : <div className="mai-skel mai-skel--strip" aria-hidden="true" />}

        <div className="mai-grid2">
          <section className="ix-card" aria-labelledby="mm-p">
            <div className="ix-card__head"><h2 id="mm-p">Providers</h2></div>
            {ready ? PROVIDERS.map((p) => { const st = d.providers[p.id]; const status = st.on ? st.status : 'Paused'; return (
              <div key={p.id} className="mai-prov">
                <BrandLogo brand={p.id === 'google' ? 'google' : p.id} size={32} decorative />
                <span><b>{p.name}</b><small>{st.on ? 'Answer time ' + st.latency + ' s' : 'Paused'}{st.note ? ' · ' + st.note : ''}</small></span>
                <StatusBadge tone={PROV_TONE[status] || 'neutral'}>{status}</StatusBadge>
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => act(setProvider(p.id, !st.on, st.on ? 'Paused from Models & cost' : ''), st.on ? p.name + ' paused. Stores use the fallback.' : p.name + ' resumed.')}>{st.on ? 'Pause' : 'Resume'}</button>
              </div>
            ); }) : <div className="mai-skel" />}
          </section>
          <section className="ix-card" aria-labelledby="mm-c">
            <div className="ix-card__head"><h2 id="mm-c">Cost and billing · 6 months</h2></div>
            <div className="mai-card-body">
              {ready ? <>
                <ColumnChart data={hist.map((h) => ({ label: monthOf(h.at), values: [h.cost], line: h.billed }))} series={[{ name: 'Provider cost', color: 'var(--viz-1)' }]} line={{ name: 'Billed for AI', color: 'var(--viz-3)' }} fmt={(v) => taka(v)} tickFmt={(v) => '৳' + Math.round(v / 1000) + 'k'} label="AI cost and billing by month" height={200} />
                <Legend items={[{ name: 'Provider cost', color: 'var(--viz-1)' }, { name: 'Billed for AI', color: 'var(--viz-3)', kind: 'line' }]} />
              </> : null}
            </div>
          </section>
        </div>

        <section className="ix-card" aria-labelledby="mm-r">
          <div className="ix-card__head"><h2 id="mm-r">Models for every store</h2></div>
          {ready ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static gc-table--keep">
                <caption className="sr-only">Models by tier</caption>
                <thead><tr><th scope="col">Tier</th><th scope="col">Main model</th><th scope="col">Fallback</th><th scope="col">Price in / out (per 1M)</th></tr></thead>
                <tbody>{TIERS.map(([tier, name]) => { const r = d.routing[tier]; const m = MODELS.find((x) => x.id === r.main) || {}; return (
                  <tr key={tier}>
                    <td><b style={{ fontWeight: 'var(--weight-medium)' }}>{tier} · {name}</b></td>
                    <td><select className="gc-input gc-select" aria-label={'Main model for tier ' + tier} value={r.main} onChange={(e) => act(setRouting(tier, 'main', e.target.value), 'Saved. Run a release to test it first next time.')}>{MODELS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></td>
                    <td><select className="gc-input gc-select" aria-label={'Fallback model for tier ' + tier} value={r.fallback} onChange={(e) => act(setRouting(tier, 'fallback', e.target.value), 'Fallback saved.')}>{MODELS.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select></td>
                    <td className="ix-muted">${m.in} / ${m.out}</td>
                  </tr>
                ); })}</tbody>
              </table>
            </div>
          ) : null}
        </section>

        <section className="ix-card" aria-labelledby="mm-rel">
          <div className="ix-card__head"><h2 id="mm-rel">Model releases</h2>
            <span className="mai-row" style={{ flexWrap: 'nowrap' }}>
              <select className="ix-pick" aria-label="Model to test" value={pick} onChange={(e) => setPick(e.target.value)}><option value="">New release…</option>{MODELS.map((x) => <option key={x.id} value={x.id}>{x.name} (tier {x.tier})</option>)}</select>
              <button type="button" className="ix-btn ix-btn--sm" disabled={!pick} onClick={() => { act(addRelease(pick), 'Release added. Run the test set next.'); setPick(''); }}>Add</button>
            </span>
          </div>
          {ready ? (
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table ix-table--static">
                <caption className="sr-only">Model releases</caption>
                <thead><tr><th scope="col">Release</th><th scope="col">Test set</th><th scope="col">Status</th><th scope="col"><span className="sr-only">Actions</span></th></tr></thead>
                <tbody>{d.releases.map((r) => (
                  <tr key={r.id}>
                    <td><b style={{ fontWeight: 'var(--weight-medium)' }}>{r.title}</b><span className="mai-sub">{r.id} · {modelName(r.model)} · {r.by} · {dmy(r.at)}</span></td>
                    <td>{r.score == null ? <span className="ix-muted">Not run</span> : <span>{r.score}%{r.critical ? ' · ' + r.critical + ' critical failed' : ''}{r.why ? <span className="mai-sub">{r.why}</span> : null}</span>}</td>
                    <td><StatusBadge tone={REL_TONE[r.status]}>{REL_WORD[r.status]}</StatusBadge></td>
                    <td>{r.status === 'testing' || r.status === 'blocked' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => act(runRelease(r.id), (x) => (x.pass ? 'Passed. Ready to roll out.' : 'Blocked: critical tests failed.'))}><Icon name="flask-conical" width="14" height="14" aria-hidden="true" />Run tests</button>
                      : r.status === 'passed' ? <button type="button" className="ix-btn ix-btn--sm ix-btn--primary" onClick={() => act(rollOut(r.id), 'Rolled out to every store.')}>Roll out</button> : null}</td>
                  </tr>
                ))}</tbody>
              </table>
            </div>
          ) : null}
        </section>
      </div>
    </AdminShell>
  );
}
