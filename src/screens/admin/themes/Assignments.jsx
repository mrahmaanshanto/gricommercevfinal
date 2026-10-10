'use client';
// Assignments (/admin/themes/assignments?view=behind) — who may use which theme, and who uses which. Two cards:
//   Availability by package   themes (or templates) × packages, a switch per cell (setPackage); turning one off asks
//                             first when stores on that package use it (they keep it)
//   Stores                    every store with an online storefront: package, theme, version (older / waiting for the
//                             next visit), assigned by, date; views All · Older version · Next visit · Retired theme ·
//                             No theme (counts on the tabs); Change opens the change-theme panel with what changes
//                             (assignStore); Update now applies a version waiting for the next visit (applyPending)
// Bulk assign gives a theme to the stores of a package (bulkAssign), either only stores without a theme or on a retired
// one, or every store on the package. Data: lib/admin/themes.js over the platform's stores (lib/platform).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { confirmDialog, toast } from '@/runtime/ui';
import { StatusBadge, EmptyState } from '@/components/ui';
import { ShopHeader, MetricStrip, IndexTabs, SearchField, Pager } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { DAY, dmy } from '@/lib/platform/util';
import {
  PACKAGES, itemsOf, itemById, statusOf, liveVersion, assignmentRows, onlineStores, packageLabel, setPackage, applyPending, bulkAssign,
} from '@/lib/admin/themes';
import { AdminShell } from '../AdminShell';
import {
  TH_CSS, useThemes, Skeleton, Thumb, StatusTag, when, plural, FormSheet, Field, ctl, ChangeSheet,
} from './themeShared';

const CSS = `
.tha-mx th,.tha-mx td{text-align:center}
.tha-mx th:first-child,.tha-mx td:first-child{text-align:left}
.tha-mx tbody tr{cursor:default}
.tha-mx .tha-item{display:flex;align-items:center;gap:var(--space-2);min-width:180px}
.tha-mx .tha-item .thm-thumb{flex:none;width:40px}
.tha-mx .tha-item span{display:flex;flex-direction:column;align-items:flex-start;gap:2px;white-space:normal}
.tha-mx .tha-item a,.tha-mx .tha-item b{font-weight:var(--weight-medium);color:var(--text-heading)}
.tha-mx .gc-switch{vertical-align:middle}
.tha-mx .gc-switch:disabled{opacity:.5;cursor:not-allowed}
.tha-seg{margin-left:auto}
.tha-ver{display:inline-flex;align-items:center;gap:var(--space-2)}
.tha-nb{display:flex;flex-direction:column;gap:2px}
.tha-nb small{font-size:var(--text-xs);color:var(--text-muted)}
.tha-count{font-family:var(--font-data);color:var(--text-heading)}
@media (max-width:640px){.tha-seg{margin-left:0}}
`;

const VIEWS = [['all', 'All'], ['behind', 'Older version'], ['waiting', 'Next visit'], ['retired', 'Retired theme'], ['none', 'No theme']];
const PER = 20;

function BulkSheet({ close }) {
  const { db, data } = useThemes();
  const themes = itemsOf(data, 'theme').filter((i) => i.state === 'active' && liveVersion(data, i.id));
  const [f, setF] = useState({ themeId: '', pkg: '', replace: false });
  const [err, setErr] = useState(null);
  const item = f.themeId ? itemById(data, f.themeId) : null;
  const stores = f.pkg ? onlineStores(db).filter((r) => r.pkg === f.pkg) : [];
  const live = item ? liveVersion(data, item.id) : null;
  const already = stores.filter((r) => { const a = data.assign[r.shop.id]; return a && item && a.themeId === item.id && a.version === live; }).length;
  const change = stores.filter((r) => {
    const a = data.assign[r.shop.id];
    if (item && a && a.themeId === item.id && a.version === live) return false;
    if (!a || f.replace || (item && a.themeId === item.id)) return true;
    const cur = itemById(data, a.themeId);
    return !cur || cur.state !== 'active';
  }).length;
  const offered = item && f.pkg ? item.packages.includes(f.pkg) : true;
  const set = (k) => (e) => { setErr(null); setF({ ...f, [k]: e.target.value }); };
  const submit = async () => {
    if (!f.themeId) { setErr({ field: 'theme', text: 'Choose a theme.' }); return; }
    if (!f.pkg) { setErr({ field: 'pkg', text: 'Choose a package.' }); return; }
    if (f.replace && change && !(await confirmDialog({ title: `Change the theme of ${plural(change, 'store')}?`, body: `Every store on ${packageLabel(f.pkg)} moves to ${item.name} ${live}. Their products, pages, logo and colours stay.`, confirmLabel: 'Change themes', tone: 'danger' }))) return;
    const r = bulkAssign(f.themeId, f.pkg, { replace: f.replace });
    if (!r.ok) { setErr({ field: 'form', text: r.error }); return; }
    toast(`${plural(r.count, 'store')} now use ${item.name} ${live}`);
    close();
  };
  const offer = () => { const r = setPackage(f.themeId, f.pkg, true); toast(r.ok ? `${item.name} offered on ${packageLabel(f.pkg)}` : r.error); };
  return (
    <FormSheet id="tha-bulk" title="Bulk assign" close={close} onSubmit={submit} submit={change ? `Assign to ${plural(change, 'store')}` : 'Assign'} error={err}>
      <Field id="tha-b-t" label="Theme" error={err && err.field === 'theme' ? err.text : null}>
        <select id="tha-b-t" {...ctl(err && err.field === 'theme', true)} value={f.themeId} onChange={set('themeId')}>
          <option value="">Choose a theme</option>
          {themes.map((i) => <option key={i.id} value={i.id}>{i.name} · {liveVersion(data, i.id)}</option>)}
        </select>
      </Field>
      <Field id="tha-b-p" label="Stores on package" error={err && err.field === 'pkg' ? err.text : null}>
        <select id="tha-b-p" {...ctl(err && err.field === 'pkg', true)} value={f.pkg} onChange={set('pkg')}>
          <option value="">Choose a package</option>
          {PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.label} · {plural(onlineStores(db).filter((r) => r.pkg === p.id).length, 'store')}</option>)}
        </select>
      </Field>
      <fieldset className="thm-radios">
        <legend>Which stores</legend>
        <label className="thm-check"><input type="radio" name="tha-b-r" checked={!f.replace} onChange={() => setF({ ...f, replace: false })} /><span>Only stores with no theme or a retired one</span></label>
        <label className="thm-check"><input type="radio" name="tha-b-r" checked={f.replace} onChange={() => setF({ ...f, replace: true })} /><span>Every store on the package (replaces their theme)</span></label>
      </fieldset>
      {item && f.pkg ? (
        <>
          {!offered ? (
            <p className="thm-note thm-note--warn">{item.name} isn't offered on {packageLabel(f.pkg)}. <button type="button" className="ix-btn ix-btn--sm" onClick={offer}>Offer it there</button></p>
          ) : (
            <p className="thm-note">{stores.length ? `${plural(change, 'store')} will change${already ? ` · ${already} already on ${item.name} ${live}` : ''}.` : `No store is on ${packageLabel(f.pkg)} yet.`} Products, pages, logo and colours stay.</p>
          )}
        </>
      ) : null}
    </FormSheet>
  );
}

export default function Assignments() {
  const { db, t, data, ready } = useThemes();
  const [kind, setKind] = useState('theme');
  const [view, setView] = useState('all');
  const [q, setQ] = useState('');
  const [pkgF, setPkgF] = useState('');
  const [themeF, setThemeF] = useState('');
  const [page, setPage] = useState(0);
  const [sheet, setSheet] = useState(null);   // { kind: 'bulk' | 'change' | 'assign', shopId?, n }

  useEffect(() => {
    const v = new URLSearchParams(window.location.search).get('view');
    if (v && VIEWS.some((x) => x[0] === v)) setView(v);
  }, []);
  const go = (k) => {
    setView(k); setPage(0);
    try {
      const p = new URLSearchParams(window.location.search);
      if (k === 'all') p.delete('view'); else p.set('view', k);
      const s = p.toString();
      window.history.replaceState(window.history.state, '', window.location.pathname + (s ? '?' + s : ''));
    } catch { /* ignore */ }
  };

  const header = (
    <ShopHeader icon="arrow-right-left" title="Assignments"
      about="Which packages each theme and template is offered on, and which theme every store with an online storefront uses. Turning a package off only stops new picks: stores keep what they have. Change a store's theme with a preview of what changes, or give a theme to every store on a package with Bulk assign."
      secondary={ready ? [{ label: 'Export', icon: 'download', onClick: () => exportCsv() }] : []}
      more={ready ? [{ label: 'Assign a theme to a store', onClick: () => setSheet({ kind: 'assign', n: Date.now() }) }] : []}
      primary={ready ? { label: 'Bulk assign', icon: 'users', onClick: () => setSheet({ kind: 'bulk', n: Date.now() }) } : null} />
  );

  if (!ready) {
    return (
      <AdminShell active="theme-assign" title="Assignments">
        <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
        <Skeleton label="Loading assignments" header={header} />
      </AdminShell>
    );
  }

  const rows = assignmentRows(data, db).sort((a, b) => a.shop.name.localeCompare(b.shop.name));
  const inView = (r, v) => (v === 'behind' ? r.behind && !(r.a && r.a.pending) : v === 'waiting' ? !!(r.a && r.a.pending) : v === 'retired' ? !!(r.item && r.item.state !== 'active') : v === 'none' ? !r.a : true);
  const counts = Object.fromEntries(VIEWS.map(([k]) => [k, rows.filter((r) => inView(r, k)).length]));
  const s = q.trim().toLowerCase();
  const shown = rows.filter((r) => inView(r, view) && (!pkgF || r.pkg === pkgF) && (!themeF || (r.a && r.a.themeId === themeF))
    && (!s || `${r.shop.name} ${r.shop.id} ${r.item ? r.item.name : ''}`.toLowerCase().includes(s)));
  const pages = Math.max(1, Math.ceil(shown.length / PER));
  const pg = Math.min(page, pages - 1);
  const slice = shown.slice(pg * PER, pg * PER + PER);
  const filtersOn = !!(s || pkgF || themeF);
  const items = itemsOf(data, kind);
  const usersOn = (item, pkg) => (item.kind === 'theme'
    ? rows.filter((r) => r.pkg === pkg && r.a && r.a.themeId === item.id).length
    : new Set(data.pages.filter((p) => p.templateId === item.id && (onlineStores(db).find((x) => x.shop.id === p.shopId) || {}).pkg === pkg).map((p) => p.shopId)).size);
  const onOffer = itemsOf(data, 'theme').filter((i) => i.state === 'active' && liveVersion(data, i.id)).length;
  const changes30 = data.log.filter((l) => l.kind === 'assign' && l.at > t - 30 * DAY).length;

  const flip = async (item, pkg) => {
    const on = !item.packages.includes(pkg);
    if (!on) {
      const n = usersOn(item, pkg);
      if (n && !(await confirmDialog({ title: `Stop offering ${item.name} on ${packageLabel(pkg)}?`, body: `${plural(n, 'store')} on ${packageLabel(pkg)} use it and keep it; new stores on that package can't pick it.`, confirmLabel: 'Stop offering' }))) return;
    }
    const r = setPackage(item.id, pkg, on);
    toast(r.ok ? `${item.name} ${on ? 'offered on' : 'taken off'} ${packageLabel(pkg)}` : r.error);
  };
  const apply = async (r) => {
    if (!(await confirmDialog({ title: `Update ${r.shop.name} to ${r.a.pending} now?`, body: 'Normally it updates the next time the owner opens the panel.', confirmLabel: 'Update now' }))) return;
    const x = applyPending(r.shop.id);
    toast(x.ok ? `${r.shop.name} updated to ${x.version}` : x.error);
  };

  function exportCsv() {
    downloadCsv('gridcommerce-theme-assignments.csv', [
      ['Store ID', 'Store', 'Package', 'Theme', 'Version', 'Latest', 'Waiting for next visit', 'Assigned by', 'Assigned'],
      ...rows.map((r) => [r.shop.id, r.shop.name, packageLabel(r.pkg), r.item ? r.item.name : '', r.a ? r.a.version : '', r.live || '', r.a && r.a.pending ? r.a.pending : '', r.a ? r.a.by : '', r.a ? dmy(r.a.at) : '']),
    ]);
    toast('Assignments exported');
  }

  const versionCell = (r) => {
    if (!r.a) return <span className="ix-muted">—</span>;
    return (
      <span className="tha-ver">
        <StatusBadge tone={r.behind && !r.a.pending ? 'warning' : 'neutral'}><span className="thm-data">{r.a.version}</span></StatusBadge>
        {r.a.pending ? <span className="thm-small thm-muted">{r.a.pending} next visit</span> : r.behind ? <span className="thm-small thm-muted">latest {r.live}</span> : null}
      </span>
    );
  };
  const actions = (r) => (
    <span className="thm-headact">
      {r.a && r.a.pending ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={(e) => { e.stopPropagation(); apply(r); }}>Update now</button> : null}
      <button type="button" className="ix-btn ix-btn--sm" aria-label={`Change the theme of ${r.shop.name}`} onClick={(e) => { e.stopPropagation(); setSheet({ kind: 'change', shopId: r.shop.id, n: Date.now() }); }}>{r.a ? 'Change' : 'Assign'}</button>
    </span>
  );

  return (
    <AdminShell active="theme-assign" title="Assignments">
      <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
      <div className="ix-page">
        {header}
        <MetricStrip items={[
          { label: 'Themes on offer', value: onOffer, icon: 'palette', href: '/admin/themes?tab=published' },
          { label: 'Stores with a storefront', value: rows.length, icon: 'store' },
          { label: 'Theme changes · 30 days', value: changes30, icon: 'arrow-right-left' },
        ]} />

        <section className="ix-card" aria-labelledby="tha-mx-h">
          <div className="ix-card__head">
            <h2 id="tha-mx-h">Availability by package</h2>
            <div className="thm-seg tha-seg" role="group" aria-label="Show">
              <button type="button" className="thm-seg__b" aria-pressed={kind === 'theme'} onClick={() => setKind('theme')}>Themes</button>
              <button type="button" className="thm-seg__b" aria-pressed={kind === 'template'} onClick={() => setKind('template')}>Templates</button>
            </div>
          </div>
          <div className="ix-card__body" style={{ padding: 'var(--space-3) 0 0' }}>
            <div className="ix-table-wrap ix-table-wrap--show">
              <table className="ix-table tha-mx gc-table--keep gc-table--scroll">
                <caption className="sr-only">{kind === 'theme' ? 'Themes' : 'Templates'} offered on each package</caption>
                <thead>
                  <tr>
                    <th scope="col">{kind === 'theme' ? 'Theme' : 'Template'}</th>
                    {PACKAGES.map((p) => <th key={p.id} scope="col">{p.label}</th>)}
                    <th scope="col" className="ix-num">Stores</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => {
                    const st = statusOf(data, item);
                    const n = PACKAGES.reduce((x, p) => x + usersOn(item, p.id), 0);
                    return (
                      <tr key={item.id}>
                        <th scope="row" style={{ fontWeight: 'var(--weight-regular)' }}>
                          <span className="tha-item">
                            <Thumb item={item} small />
                            <span>
                              {item.kind === 'theme' ? <Link href={'/admin/themes/view?id=' + item.id}>{item.name}</Link> : <Link href={'/admin/themes/templates?id=' + item.id}>{item.name}</Link>}
                              {st !== 'Published' ? <StatusTag status={st} /> : null}
                            </span>
                          </span>
                        </th>
                        {PACKAGES.map((p) => {
                          const on = item.packages.includes(p.id);
                          return (
                            <td key={p.id}>
                              <button type="button" role="switch" className="gc-switch" aria-checked={on} aria-label={`${item.name} on ${p.label}`} onClick={() => flip(item, p.id)}><span className="gc-switch__knob" /></button>
                            </td>
                          );
                        })}
                        <td className="ix-num"><span className="tha-count">{n}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        <section className="ix-card" aria-label="Stores">
          <div className="ix-bar"><IndexTabs label="Store views" tabs={VIEWS.map(([k, l]) => ({ key: k, id: 'tha-tab-' + k, label: l, count: counts[k], on: view === k, onClick: () => go(k) }))} /></div>
          <div className="thm-tools">
            <SearchField value={q} onChange={(e) => { setQ(e.target.value); setPage(0); }} placeholder="Search store, ID or theme" onDone={() => setQ('')} />
            <select className="gc-input gc-select" aria-label="Package" value={pkgF} onChange={(e) => { setPkgF(e.target.value); setPage(0); }}>
              <option value="">All packages</option>
              {PACKAGES.map((p) => <option key={p.id} value={p.id}>{p.label}</option>)}
            </select>
            <select className="gc-input gc-select" aria-label="Theme" value={themeF} onChange={(e) => { setThemeF(e.target.value); setPage(0); }}>
              <option value="">All themes</option>
              {itemsOf(data, 'theme').map((i) => <option key={i.id} value={i.id}>{i.name}</option>)}
            </select>
          </div>
          {!shown.length ? (
            <div className="ix-empty">
              {filtersOn
                ? <EmptyState title="No stores match." actionLabel="Clear filters" onAction={() => { setQ(''); setPkgF(''); setThemeF(''); }} />
                : <EmptyState icon="store" title={view === 'none' ? 'Every store has a theme.' : 'No stores in this view.'} actionLabel="Show all stores" onAction={() => go('all')} />}
            </div>
          ) : (
            <>
              <ul className="ix-plist">
                {slice.map((r) => (
                  <li key={r.shop.id}>
                    <div className="ix-pitem">
                      <span className="ix-pitem__top"><b><Link href={'/admin/merchant?id=' + r.shop.id}>{r.shop.name}</Link></b>{versionCell(r)}</span>
                      <span className="ix-pitem__mid">{r.item ? r.item.name : 'No theme'} · {packageLabel(r.pkg)}{r.a ? ` · ${when(r.a.at, t)}` : ''}</span>
                      <span>{actions(r)}</span>
                    </div>
                  </li>
                ))}
              </ul>
              <div className="ix-table-wrap">
                <table className="ix-table gc-table--keep">
                  <caption className="sr-only">Stores and their themes</caption>
                  <thead>
                    <tr>
                      <th scope="col">Store</th><th scope="col">Package</th><th scope="col">Theme</th><th scope="col">Version</th>
                      <th scope="col">Assigned by</th><th scope="col">Date</th><th scope="col"><span className="sr-only">Actions</span></th>
                    </tr>
                  </thead>
                  <tbody>
                    {slice.map((r) => (
                      <tr key={r.shop.id} tabIndex={0} onClick={() => setSheet({ kind: 'change', shopId: r.shop.id, n: Date.now() })} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setSheet({ kind: 'change', shopId: r.shop.id, n: Date.now() }); }}>
                        <td><span className="tha-nb"><Link className="ix-strong" href={'/admin/merchant?id=' + r.shop.id} onClick={(e) => e.stopPropagation()}>{r.shop.name}</Link><small>#{r.shop.id}</small></span></td>
                        <td className="ix-muted">{packageLabel(r.pkg)}</td>
                        <td>{r.item ? <span className="tha-nb"><Link href={'/admin/themes/view?id=' + r.item.id} onClick={(e) => e.stopPropagation()}>{r.item.name}</Link>{r.item.state !== 'active' ? <small>{r.item.state}</small> : null}</span> : <span className="ix-muted">No theme</span>}</td>
                        <td>{versionCell(r)}</td>
                        <td className="ix-muted">{r.a ? (r.a.by === 'Store owner · setup' ? 'Owner, at setup' : r.a.by) : '—'}</td>
                        <td className="ix-muted">{r.a ? when(r.a.at, t) : '—'}</td>
                        <td className="ix-num">{actions(r)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </>
          )}
          <div className="ix-foot">
            <span>{plural(shown.length, 'store')}{shown.length !== rows.length ? ` of ${rows.length}` : ''}{pages > 1 ? ` · page ${pg + 1} of ${pages}` : ''}</span>
            {pages > 1 ? <Pager label="Stores" atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} /> : null}
          </div>
        </section>
      </div>

      {sheet && sheet.kind === 'bulk' ? <BulkSheet key={sheet.n} close={() => setSheet(null)} /> : null}
      {sheet && sheet.kind === 'change' ? <ChangeSheet key={sheet.n} shopId={sheet.shopId} close={() => setSheet(null)} /> : null}
      {sheet && sheet.kind === 'assign' ? <ChangeSheet key={sheet.n} close={() => setSheet(null)} /> : null}
    </AdminShell>
  );
}
