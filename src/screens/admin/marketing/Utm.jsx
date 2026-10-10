'use client';
// Marketing › UTM links (/admin/utm) — every tracked link to gridcommerce.net that GridCommerce's marketing uses, with
// what each brought: clicks → leads → trials → paid stores. Laid out like the other lists: the title row (Export, New
// link), one card with Active / Archived as tabs (counts on the tabs), search and filters (source, medium, campaign),
// the table (a two-line list on phones) and the pager. New link is the builder side panel: a real website page, source,
// medium, campaign, term and content, the full link as you type, Copy, and a gc.link short link on save. Archive keeps
// a link's results but takes it off the list. Campaign links take their share of that campaign channel's results.
// Data: lib/admin/marketing.js (utmRows, saveUtm, archiveUtm, restoreUtm).

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { EmptyState } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, Menu } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy, ago } from '@/lib/platform/util';
import { utmRows, archiveUtm, restoreUtm, pageLabel } from '@/lib/admin/marketing';
import { AdminShell } from '../AdminShell';
import { useMarketing, MK_CSS, Skel, UtmSheet, copyText, num, pct, plural } from './mkShared';

const PAGE = 25;
const TABS = [['active', 'Active'], ['archived', 'Archived']];
const FILTER_KEYS = ['src', 'med', 'mc'];

const CSS = `
.ut-filters{padding:8px;border-bottom:1px solid var(--border-subtle)}
.ut-filters .gc-filterbar__search{max-width:320px}
.ut-short{display:inline-flex;align-items:center;gap:4px;padding:0;border:0;background:none;font:inherit;font-family:var(--font-data);font-size:var(--text-xs);color:var(--primary);cursor:pointer}
.ut-short:hover{text-decoration:underline}
.ut-short:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-sm)}
.ut-tag{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.ut-flow{display:inline-flex;align-items:center;gap:4px;font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-muted)}
.ut-flow b{font-weight:var(--weight-semibold);color:var(--text-heading)}
@media (max-width:640px){.ut-filters{padding:6px}}
`;

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  const f = {};
  for (const k of FILTER_KEYS) f[k] = p.get(k) || '';
  return { tab: p.get('tab') === 'archived' ? 'archived' : 'active', q: p.get('q') || '', f };
}
function toUrl({ tab, q, f }) {
  const p = new URLSearchParams();
  if (tab !== 'active') p.set('tab', tab);
  if (q.trim()) p.set('q', q.trim());
  for (const k of FILTER_KEYS) if (f[k]) p.set(k, f[k]);
  const s = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
}

const csv = (rows) => [
  ['Link ID', 'Name', 'Short link', 'Full link', 'Page', 'Source', 'Medium', 'Campaign', 'Term', 'Content', 'Marketing campaign', 'Clicks', 'Leads', 'Trials', 'Paid', 'Made by', 'Made on', 'Archived'],
  ...rows.map((l) => [l.id, l.name, l.short, l.url, l.page, l.source, l.medium, l.campaign, l.term, l.content, l.mc ? l.mc.name : '', Math.round(l.m.clicks), Math.round(l.m.leads), Math.round(l.m.trials), Math.round(l.m.paid), l.by, dmy(l.createdAt), l.archived ? 'Yes' : 'No']),
];

export default function Utm() {
  const { data, t, live } = useMarketing();
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('active');
  const [q, setQ] = useState('');
  const [f, setF] = useState({ src: '', med: '', mc: '' });
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(false);
  const first = useRef(true);

  useEffect(() => { const s = fromUrl(); setTab(s.tab); setQ(s.q); setF(s.f); setReady(true); }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ tab, q, f });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, tab, q, f]);

  const all = live ? utmRows(data, t) : [];
  const s = q.trim().toLowerCase();
  const base = all.filter((l) => {
    if (f.src && l.source !== f.src) return false;
    if (f.med && l.medium !== f.med) return false;
    if (f.mc && (f.mc === 'none' ? l.mcId : l.mcId !== f.mc)) return false;
    if (s && ![l.name, l.short, l.campaign, l.source, l.medium, l.content, l.term, l.page].join(' ').toLowerCase().includes(s)) return false;
    return true;
  });
  const counts = { active: live ? base.filter((l) => !l.archived).length : null, archived: live ? base.filter((l) => l.archived).length : null };
  const filtered = base.filter((l) => (tab === 'archived' ? l.archived : !l.archived));
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(page, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const filtersOn = !!s || FILTER_KEYS.some((k) => f[k]);
  const clear = () => { setQ(''); setF({ src: '', med: '', mc: '' }); };
  const setFilter = (k) => (v) => setF((o) => ({ ...o, [k]: v }));
  const tot = filtered.reduce((a, l) => ({ clicks: a.clicks + l.m.clicks, leads: a.leads + l.m.leads, paid: a.paid + l.m.paid }), { clicks: 0, leads: 0, paid: 0 });

  const uniq = (k) => [...new Set(all.map((l) => l[k]))].sort().map((x) => [x, x]);
  const mcs = [...new Map(all.filter((l) => l.mc).map((l) => [l.mc.id, l.mc.name])).entries()];
  const filters = [
    { key: 'src', label: 'Source', all: 'All sources', value: f.src, options: uniq('source'), onChange: setFilter('src') },
    { key: 'med', label: 'Medium', all: 'All mediums', value: f.med, options: uniq('medium'), onChange: setFilter('med') },
    { key: 'mc', label: 'Campaign', all: 'All campaigns', value: f.mc, options: [['none', 'Not linked'], ...mcs], onChange: setFilter('mc') },
  ];

  const archive = (l) => {
    const r = l.archived ? restoreUtm(l.id) : archiveUtm(l.id);
    if (!r.ok) { toast(r.error, { tone: 'error' }); return; }
    toast(l.archived ? 'Link restored' : 'Link archived · gc.link keeps working');
  };
  const exportCsv = () => {
    if (!filtered.length) { toast('Nothing to export'); return; }
    downloadCsv(`gridcommerce-utm-links-${tab}.csv`, csv(filtered));
    toast(plural(filtered.length, 'link') + ' exported');
  };
  const actions = (l) => [
    { label: 'Copy full link', onClick: () => copyText(l.url, 'Full link') },
    { label: 'Copy short link', onClick: () => copyText('https://' + l.short, 'Short link') },
    l.mc ? { label: 'Open campaign', href: '/admin/campaigns/view?id=' + l.mc.id } : null,
    { label: l.archived ? 'Restore' : 'Archive', onClick: () => archive(l) },
  ].filter(Boolean);

  let body;
  if (!live) body = <Skel label="Loading UTM links" strip={false} />;
  else {
    body = (
      <section className="ix-card" aria-label={tab === 'archived' ? 'Archived links' : 'Active links'}>
        <div className="ix-bar"><IndexTabs label="Link views" tabs={TABS.map(([k, l]) => ({ key: k, id: 'ut-tab-' + k, label: l, count: counts[k], on: tab === k, onClick: () => setTab(k) }))} /></div>
        <div className="ut-filters">
          <FilterBar label="Filter links" filters={filters} onClear={() => setQ('')} search={{ value: q, onChange: setQ, placeholder: 'Search name, gc.link, campaign or page' }} />
        </div>
        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn ? <EmptyState title="No links match these filters." actionLabel="Clear filters" onAction={clear} />
              : tab === 'archived' ? <EmptyState icon="archive" title="No archived links." actionLabel="Show active links" onAction={() => setTab('active')} />
                : <EmptyState icon="link" title="No UTM links yet." actionLabel="New link" onAction={() => setSheet({ n: Date.now() })} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label="UTM links">
              {rows.map((l) => (
                <li key={l.id}><div className="ix-pitem">
                  <span className="ix-pitem__top"><b>{l.name}</b><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={actions(l)} /></span>
                  <span className="ix-pitem__mid"><button type="button" className="ut-short" onClick={() => copyText('https://' + l.short, 'Short link')}>{l.short}</button> · {l.source} / {l.medium} → {l.page}</span>
                  <span className="ut-flow"><b>{num(l.m.clicks)}</b> clicks → <b>{num(l.m.leads)}</b> leads → <b>{num(l.m.trials)}</b> trials → <b>{num(l.m.paid)}</b> paid</span>
                </div></li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table ix-table--static gc-table--keep">
                <caption className="sr-only">UTM links</caption>
                <thead><tr>
                  <th scope="col">Link</th><th scope="col">Opens</th><th scope="col">Source / medium</th><th scope="col">Campaign</th>
                  <th scope="col" className="ix-num">Clicks</th><th scope="col" className="ix-num">Leads</th><th scope="col" className="ix-num">Trials</th><th scope="col" className="ix-num">Paid</th><th scope="col" className="ix-num">Lead rate</th>
                  <th scope="col">Made</th><th scope="col"><span className="sr-only">Actions</span></th>
                </tr></thead>
                <tbody>
                  {rows.map((l) => (
                    <tr key={l.id}>
                      <td><span className="mk-name"><b title={l.url}>{l.name}</b><span><button type="button" className="ut-short" onClick={() => copyText('https://' + l.short, 'Short link')} aria-label={'Copy ' + l.short}>{l.short}<Icon name="copy" width="14" height="14" aria-hidden="true" /></button></span></span></td>
                      <td className="ix-muted" title={l.page}>{pageLabel(l.page)}</td>
                      <td><span className="ut-tag">{l.source} / {l.medium}</span>{l.content || l.term ? <small className="mk-sub">{[l.term, l.content].filter(Boolean).join(' · ')}</small> : null}</td>
                      <td>{l.mc ? <span className="mk-name"><Link href={'/admin/campaigns/view?id=' + l.mc.id}>{l.mc.name}</Link><small className="mk-sub">{l.campaign}</small></span> : <span className="ut-tag">{l.campaign}</span>}</td>
                      <td className="ix-num mk-fig">{num(l.m.clicks)}</td>
                      <td className="ix-num mk-fig">{num(l.m.leads)}</td>
                      <td className="ix-num mk-fig">{num(l.m.trials)}</td>
                      <td className="ix-num mk-fig">{num(l.m.paid)}</td>
                      <td className="ix-num mk-fig">{pct(l.leadRate)}</td>
                      <td className="ix-muted"><span className="mk-name"><span>{ago(l.createdAt, t)}</span><small className="mk-sub">{l.by}</small></span></td>
                      <td className="mk-acts"><Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" items={actions(l)} /></td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={<span className="mk-foot"><span>{filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 links'}</span><span>Clicks<b>{num(tot.clicks)}</b></span><span>Leads<b>{num(tot.leads)}</b></span><span>Paid<b>{num(tot.paid)}</b></span></span>}
          atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  return (
    <AdminShell active="utm" title="UTM links">
      <style dangerouslySetInnerHTML={{ __html: MK_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="link" title="UTM links"
          about="Tracked links to gridcommerce.net for ads, emails, SMS, events, partners and the team’s own posts: the page each opens, its UTM source, medium, campaign, term and content, a gc.link short link, and the clicks, leads, trials and paid stores it brought. A link made for a campaign gets its share of that campaign channel’s results. Archived links keep working and keep their results."
          secondary={[{ label: 'Export', icon: 'download', onClick: exportCsv }]}
          more={[{ label: 'Campaigns', href: '/admin/campaigns' }, { label: 'Marketing overview', href: '/admin/marketing' }]}
          primary={{ label: 'New link', icon: 'plus', onClick: () => setSheet({ n: Date.now() }) }} />
        {body}
      </div>
      <UtmSheet open={sheet} data={data} onClose={() => setSheet(false)} />
    </AdminShell>
  );
}
