'use client';
// One theme (/admin/themes/view?id=nokshi) — a record page. Header: status and live version; Release update as the main
// action (or "Review <version>" while one is in the workflow, Enable when it is off), Assign to merchant, and Edit info /
// Disable / Deprecate / Export stores under More. Main column: placeholder preview (Desktop · Tablet · Phone frames with
// the theme's sections as blocks), features, version history with release notes, the stores using it (version, waiting
// for the next visit, change theme) and the update history. Side: overview, compatibility (modules, packages), who may
// edit and publish, and Merchant editing (Planned). Data: lib/admin/themes.js. ?id= is read after mount.

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { confirmDialog, toast } from '@/runtime/ui';
import { StatusBadge, EmptyState, InfoTip } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { dmy } from '@/lib/platform/util';
import {
  itemById, statusOf, liveVersion, releasesOf, pendingReleaseOf, storesOn, logOf, familyBy, packageLabel, rolloutLabel, stageLabel,
  setEnabled, applyPending,
} from '@/lib/admin/themes';
import { AdminShell } from '../AdminShell';
import {
  TH_CSS, useThemes, Skeleton, PreviewFrames, StatusTag, Chips, PkgChips, ModChips, Row, MerchantEditing, when, plural,
  ReleaseSheet, EditSheet, DeprecateSheet, DisableSheet, ChangeSheet,
} from './themeShared';

const CSS = `
.thv-ver b .thm-data{font-weight:var(--weight-semibold)}
.thv-feat{display:flex;flex-direction:column;gap:var(--space-3)}
.thv-feat p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.thv-more{margin-top:var(--space-2)}
`;

const STAGE_TONE = { draft: 'neutral', review: 'warning', approved: 'primary', published: 'success', rolledback: 'error' };
const LOG_ICON = { release: 'rocket', state: 'power', assign: 'store', edit: 'pencil', package: 'package' };

export default function ThemeView() {
  const { db, t, data, ready } = useThemes();
  const [id, setId] = useState(null);
  const [sheet, setSheet] = useState(null);   // { kind, n, shopId? }
  const [allStores, setAllStores] = useState(false);
  const [allLog, setAllLog] = useState(false);

  useEffect(() => { setId((new URLSearchParams(window.location.search).get('id') || '').trim()); }, []);

  if (!ready || id === null) {
    return <AdminShell active="themes" title="Theme"><style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} /><Skeleton label="Loading the theme" /></AdminShell>;
  }
  const item = id ? itemById(data, id) : null;
  if (!item || item.kind !== 'theme') {
    const tpl = item && item.kind === 'template';
    return (
      <AdminShell active="themes" title="Theme">
        <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
        <div className="ix-page">
          <RecordHeader back="/admin/themes" backLabel="Back to the theme library" title="Theme" />
          <section className="ix-card">
            <EmptyState icon="palette" title={tpl ? `${item.name} is a landing page template` : id ? 'This theme no longer exists' : 'No theme picked'}
              actionLabel={tpl ? 'Open templates' : 'Back to the theme library'} onAction={() => { window.location.href = tpl ? '/admin/themes/templates?id=' + item.id : '/admin/themes'; }} />
          </section>
        </div>
      </AdminShell>
    );
  }

  const status = statusOf(data, item);
  const live = liveVersion(data, item.id);
  const rels = releasesOf(data, item.id);
  const pending = pendingReleaseOf(data, item.id);
  const stores = storesOn(data, db, item.id);
  const log = logOf(data, item.id);
  const fam = familyBy(item.family);
  const rep = item.replacement ? itemById(data, item.replacement) : null;
  const open = (kind, extra) => setSheet({ kind, n: Date.now(), ...extra });
  const close = () => setSheet(null);
  const off = item.state === 'disabled';
  const canAssign = item.state === 'active' && !!live;

  const enable = async () => {
    if (!(await confirmDialog({ title: `Turn ${item.name} on again?`, body: item.state === 'deprecated' ? 'New stores can pick it again and the replacement note goes away.' : 'It can be given to stores and released again.', confirmLabel: 'Turn on' }))) return;
    const r = setEnabled(item.id, true);
    toast(r.ok ? `${item.name} is on` : r.error);
  };
  const apply = async (s) => {
    if (!(await confirmDialog({ title: `Update ${s.shop.name} to ${s.pending} now?`, body: 'Normally it updates the next time the owner opens the panel.', confirmLabel: 'Update now' }))) return;
    const r = applyPending(s.shop.id);
    toast(r.ok ? `${s.shop.name} updated to ${r.version}` : r.error);
  };
  const exportStores = () => {
    downloadCsv(`${item.id}-stores.csv`, [['Store ID', 'Store', 'Package', 'Version', 'Waiting', 'Assigned by', 'Assigned'], ...stores.map((s) => [s.shop.id, s.shop.name, packageLabel(s.pkg), s.version, s.pending || '', s.by, dmy(s.at)])]);
    toast('Stores exported');
  };

  const primary = off ? { label: 'Turn on', icon: 'power', onClick: enable }
    : pending ? { label: `Review ${pending.version}`, icon: 'git-branch', href: '/admin/themes/releases?id=' + pending.id }
      : { label: 'Release update', icon: 'rocket', onClick: () => open('release') };
  const secondary = canAssign ? [{ label: 'Assign to merchant', icon: 'store', onClick: () => open('assign') }] : [];
  const more = [
    { label: 'Edit info', onClick: () => open('edit') },
    pending && !off ? { label: 'Release update', onClick: () => open('release') } : null,
    item.state === 'deprecated' ? { label: 'Bring back', onClick: enable } : null,
    item.state === 'active' && live ? { label: 'Deprecate', onClick: () => open('deprecate') } : null,
    !off ? { label: 'Disable', tone: 'danger', onClick: () => open('disable') } : null,
    stores.length ? { label: 'Export stores', onClick: exportStores } : null,
    { label: 'Open Releases', href: '/admin/themes/releases' },
  ].filter(Boolean);

  const shownStores = allStores ? stores : stores.slice(0, 8);
  const shownLog = allLog ? log : log.slice(0, 8);
  const behind = stores.filter((s) => s.behind).length;

  return (
    <AdminShell active="themes" title={item.name}>
      <style dangerouslySetInnerHTML={{ __html: TH_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/themes" backLabel="Back to the theme library" title={item.name}
          about="One storefront theme: its placeholder preview, features, versions, the stores using it and everything that changed. A new version goes through Releases, where someone other than the uploader approves it."
          badges={<><StatusTag status={status} />{live ? <span className="thm-chip"><span className="thm-data">{live}</span></span> : null}</>}
          meta={<>{item.category} · {fam ? fam.name : 'No family'} · {plural(stores.length, 'store')} · updated {when(item.updatedAt, t)}</>}
          secondary={secondary} more={more} primary={primary} />

        {item.state !== 'active' ? (
          <p className="thm-note thm-note--warn">
            {item.state === 'disabled' ? 'Disabled' : 'Deprecated'}: {item.stateReason}
            {rep ? <> · replaced by <Link href={'/admin/themes/view?id=' + rep.id}>{rep.name}</Link></> : null}
          </p>
        ) : null}

        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card" aria-labelledby="thv-prev">
              <div className="ix-card__head"><h2 id="thv-prev">Preview</h2><StatusBadge tone="neutral">Placeholder</StatusBadge></div>
              <div className="ix-card__body"><PreviewFrames item={item} /></div>
            </section>

            <section className="ix-card" aria-labelledby="thv-feat">
              <div className="ix-card__head"><h2 id="thv-feat">Features</h2></div>
              <div className="ix-card__body thv-feat">
                {item.tagline ? <p>{item.tagline}</p> : null}
                <Chips items={item.features} soft />
              </div>
            </section>

            <section className="ix-card" aria-labelledby="thv-vers">
              <div className="ix-card__head">
                <h2 id="thv-vers">Versions</h2>
                {!off && !pending ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('release')}>Release update</button> : null}
              </div>
              <div className="ix-card__body">
                {rels.length ? rels.map((r) => (
                  <Row key={r.id}
                    title={<span className="thv-ver"><b><span className="thm-data">{r.version}</span></b> · {r.notes}</span>}
                    sub={[
                      r.stage === 'published' || r.stage === 'rolledback' ? `Published ${when(r.publishedAt, t)} by ${r.publishedBy}` : `Uploaded ${when(r.uploadedAt, t)} by ${r.uploadedBy}`,
                      r.stage === 'published' ? rolloutLabel(r.rollout) : null,
                      r.stage === 'rolledback' ? `Rolled back by ${r.rolledBackBy}: ${r.rollbackReason}` : null,
                      r.rejected && r.stage === 'draft' ? `Sent back by ${r.rejected.by}: ${r.rejected.reason}` : null,
                      r.scheduledAt && r.stage === 'approved' ? `Goes out ${when(r.scheduledAt, t)}` : null,
                    ].filter(Boolean).join(' · ')}
                    end={r.version === live ? <StatusBadge tone="success">Live</StatusBadge>
                      : r.stage === 'published' ? <span className="thm-muted thm-small">Earlier</span>
                        : <Link href={'/admin/themes/releases?id=' + r.id} aria-label={`Open ${r.version} on Releases`}><StatusBadge tone={STAGE_TONE[r.stage]}>{stageLabel(r.stage)}</StatusBadge></Link>} />
                )) : <p className="thm-empty">No versions yet.</p>}
              </div>
            </section>

            <section className="ix-card" aria-labelledby="thv-stores">
              <div className="ix-card__head">
                <h2 id="thv-stores">Stores using it · {stores.length}</h2>
                {canAssign ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('assign')}>Assign to merchant</button> : null}
              </div>
              <div className="ix-card__body">
                {behind ? <p className="thm-small thm-muted" style={{ marginBottom: 'var(--space-2)' }}>{plural(behind, 'store')} on an older version.</p> : null}
                {stores.length ? (
                  <>
                    {shownStores.map((s) => (
                      <Row key={s.shop.id}
                        title={<Link href={'/admin/merchant?id=' + s.shop.id}>{s.shop.name}</Link>}
                        sub={`#${s.shop.id} · ${packageLabel(s.pkg)} · ${s.by === 'Store owner · setup' ? 'picked at setup' : 'set by ' + s.by} · ${when(s.at, t)}`}
                        end={<>
                          {s.pending ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => apply(s)} title="Waiting for the next visit">{s.pending} next visit</button> : null}
                          <StatusBadge tone={s.behind && !s.pending ? 'warning' : 'neutral'}><span className="thm-data">{s.version}</span></StatusBadge>
                          <button type="button" className="ix-btn ix-btn--sm" onClick={() => open('change', { shopId: s.shop.id })} aria-label={`Change the theme of ${s.shop.name}`}>Change</button>
                        </>} />
                    ))}
                    {stores.length > 8 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain thv-more" onClick={() => setAllStores(!allStores)}>{allStores ? 'Show fewer' : `Show all ${stores.length}`}</button> : null}
                  </>
                ) : <p className="thm-empty">No store uses it yet.</p>}
              </div>
            </section>

            <section className="ix-card" aria-labelledby="thv-log">
              <div className="ix-card__head"><h2 id="thv-log">Update history</h2></div>
              <div className="ix-card__body">
                {shownLog.length ? shownLog.map((l) => (
                  <Row key={l.id} title={<><Icon name={LOG_ICON[l.kind] || 'dot'} width="14" height="14" aria-hidden="true" /> {l.text}</>} sub={`${l.by} · ${when(l.at, t)}`} />
                )) : <p className="thm-empty">Nothing yet.</p>}
                {log.length > 8 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain thv-more" onClick={() => setAllLog(!allLog)}>{allLog ? 'Show fewer' : `Show all ${log.length}`}</button> : null}
              </div>
            </section>
          </div>

          <div className="ix-side">
            <section className="ix-card" aria-labelledby="thv-ov">
              <div className="ix-card__head"><h2 id="thv-ov">Overview</h2></div>
              <div className="ix-card__body">
                <KV rows={[
                  ['Status', <StatusTag key="s" status={status} />],
                  ['Live version', live ? <span key="v" className="thm-data">{live}</span> : 'Not published'],
                  ['Category', item.category],
                  ['Family', fam ? `${fam.name} · ${fam.label}` : 'No family'],
                  ['Accent', <span key="a" style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}><span aria-hidden="true" style={{ width: 12, height: 12, borderRadius: 'var(--radius-full)', background: item.accent }} /><span className="thm-data">{item.accent}</span></span>],
                  ['Author', item.author],
                  ['File', item.file ? <span key="f" className="thm-data">{item.file}</span> : null],
                  ['Created', dmy(item.createdAt)],
                  ['Updated', when(item.updatedAt, t)],
                  rep ? ['Replaced by', <Link key="r" href={'/admin/themes/view?id=' + rep.id}>{rep.name}</Link>] : null,
                ]} />
              </div>
            </section>

            <section className="ix-card" aria-labelledby="thv-cmp">
              <div className="ix-card__head">
                <h2 id="thv-cmp">Compatibility</h2>
                <Link href="/admin/themes/assignments">Packages</Link>
              </div>
              <div className="ix-card__body thv-feat">
                <div><p className="thm-sec" style={{ marginTop: 0, marginBottom: 6 }}>Modules it has blocks for</p><ModChips codes={item.modules} /></div>
                <div><p className="thm-sec" style={{ marginTop: 0, marginBottom: 6 }}>Offered on</p><PkgChips ids={item.packages} /></div>
              </div>
            </section>

            <section className="ix-card" aria-labelledby="thv-acc">
              <div className="ix-card__head">
                <h2 id="thv-acc">Access</h2>
                <InfoTip label="About access" text="Which GridCommerce teams may change this theme's files and details, and which may publish its versions. The person who uploads a version never approves it." />
              </div>
              <div className="ix-card__body">
                <KV rows={[['Can edit', item.access.edit.join(', ')], ['Can publish', item.access.publish.join(', ')]]} />
              </div>
            </section>

            <MerchantEditing item={item} data={data} />
          </div>
        </div>
      </div>

      {sheet && sheet.kind === 'release' ? <ReleaseSheet key={sheet.n} item={item} close={close} /> : null}
      {sheet && sheet.kind === 'edit' ? <EditSheet key={sheet.n} item={item} close={close} /> : null}
      {sheet && sheet.kind === 'deprecate' ? <DeprecateSheet key={sheet.n} item={item} close={close} /> : null}
      {sheet && sheet.kind === 'disable' ? <DisableSheet key={sheet.n} item={item} close={close} /> : null}
      {sheet && sheet.kind === 'assign' ? <ChangeSheet key={sheet.n} themeId={item.id} close={close} /> : null}
      {sheet && sheet.kind === 'change' ? <ChangeSheet key={sheet.n} shopId={sheet.shopId} close={close} /> : null}
    </AdminShell>
  );
}
