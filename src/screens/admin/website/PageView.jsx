'use client';
// Page (/admin/website/pages/view?path=/pricing) — one page of gridcommerce.net (menu: Pages).
//   Header     back to Pages, the title with its status and type, the path; Open live; one main action that follows
//              the workflow (Submit for review → Approve → Publish; Edit details when it is live).
//   Main       Details (title and description as buildMetadata gets them, draft against live), Preview (Desktop /
//              Tablet / Phone, Draft or Published: PreviewFrame), Sections (the content blocks the page shows, English
//              and Bangla, each with its data file; edits happen in Content), Version history (restore as a draft).
//   Side       Publishing (steps and buttons; someone other than the editor approves), Page facts, Activity.
// Data: lib/admin/website.js (pageOf, pageSections, savePageDraft, submitPage, approvePage, sendBackPage, publishPage,
// discardPageDraft, restorePageVersion, seoOf, pageLog). Publishing never changes the live site (a toast says so).

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState, StatusBadge } from '@/components/ui';
import { RecordHeader, KV } from '@/components/ui/IndexKit';
import { dmy, hm } from '@/lib/platform/util';
import {
  pageOf, pageSections, pageLog, seoOf, groupOf, postOf, LIMITS, SITE,
  savePageDraft, submitPage, approvePage, sendBackPage, publishPage, discardPageDraft, restorePageVersion,
} from '@/lib/admin/website';
import { AdminShell } from '../AdminShell';
import { WEB_CSS, useWeb, when, StatusTag, Who, Field, ctl, LenMeter, WorkflowCard, BiText, openLive, pageUrl } from './webShared';
import PreviewFrame from './PreviewFrame';

const CSS = `
.pv-diff{display:flex;flex-direction:column;gap:var(--space-3)}
.pv-diff dl{display:grid;grid-template-columns:110px minmax(0,1fr);gap:var(--space-2) var(--space-3);margin:0;font-size:var(--text-sm)}
.pv-diff dt{color:var(--text-muted);font-size:var(--text-xs);padding-top:2px}
.pv-diff dd{margin:0;color:var(--text-body);overflow-wrap:anywhere}
.pv-diff del{color:var(--text-muted)}
.pv-diff ins{text-decoration:none;background:var(--fill-primary-soft);border-radius:var(--radius-sm);padding:0 2px}
.pv-secs{display:flex;flex-direction:column}
.pv-sec{border-top:1px solid var(--border-subtle)}
.pv-sec:first-child{border-top:0}
.pv-sec>summary{display:flex;align-items:center;gap:var(--space-2);min-height:44px;padding:var(--space-2) var(--space-4);cursor:pointer;list-style:none;font-size:var(--text-sm)}
.pv-sec>summary::-webkit-details-marker{display:none}
.pv-sec>summary b{font-weight:var(--weight-medium);color:var(--text-heading)}
.pv-sec>summary .pv-chev{margin-left:auto;color:var(--text-muted);transition:transform var(--duration-base) var(--ease-out)}
.pv-sec[open]>summary .pv-chev{transform:rotate(180deg)}
.pv-sec>summary:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.pv-sec__src{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:0 var(--space-4) var(--space-2)}
.pv-sec__src a{margin-left:auto;font-size:var(--text-xs);font-weight:var(--weight-medium)}
.pv-row{padding:var(--space-2) var(--space-4);border-top:1px dashed var(--border-subtle)}
.pv-row small{display:block;margin-bottom:4px;font-size:var(--text-xs);color:var(--text-muted)}
.pv-row.is-changed{background:var(--fill-primary-soft)}
.pv-more{padding:var(--space-2) var(--space-4) var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.pv-empty{padding:var(--space-4);font-size:var(--text-sm);color:var(--text-muted)}
.pv-ver .ix-btn{flex:none}
@media (max-width:640px){.pv-diff dl{grid-template-columns:1fr}.pv-diff dt{padding:0}}
`;

const SHOW = 6;

function Section({ s, open }) {
  const [all, setAll] = useState(false);
  const changed = s.fields.filter((f) => f.edit).length;
  const list = all ? s.fields : s.fields.slice(0, SHOW);
  const g = s.group ? groupOf(s.group) : null;
  return (
    <details className="pv-sec" open={open}>
      <summary>
        <Icon name="rows-3" width="16" height="16" aria-hidden="true" />
        <b>{s.label}</b>
        <span className="ix-muted">{s.fields.length} text{s.fields.length === 1 ? '' : 's'}</span>
        {changed ? <StatusBadge tone="primary">{changed} in draft</StatusBadge> : null}
        <Icon name="chevron-down" width="16" height="16" className="pv-chev" aria-hidden="true" />
      </summary>
      <div className="pv-sec__src">
        <span className="wb-src">{s.source}</span>
        {g ? <Link href={`/admin/website/content?group=${g.id}&block=${encodeURIComponent(s.id)}`}>Edit in Content · {g.label}</Link> : null}
      </div>
      {list.map((f) => (
        <div key={f.key} className={'pv-row' + (f.edit ? ' is-changed' : '')}>
          <small>{f.label}{f.edit ? ' · draft by ' + f.edit.by : ''}</small>
          <BiText en={f.value.en} bn={f.value.bn} one={f.one} />
        </div>
      ))}
      {s.fields.length > SHOW ? <div className="pv-more"><button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAll(!all)}>{all ? 'Show fewer' : `Show all ${s.fields.length}`}</button></div> : null}
    </details>
  );
}

export default function PageView() {
  const { t, live, me } = useWeb();
  const [path, setPath] = useState(null);
  const [edit, setEdit] = useState(null);     // { title, description, error }
  const [back, setBack] = useState(null);     // { reason, error }

  useEffect(() => { setPath(new URLSearchParams(window.location.search).get('path') || '/'); }, []);

  const pg = live && path ? pageOf(path) : null;
  const title = pg ? pg.working.title : 'Page';

  if (!live || !path) {
    return (
      <AdminShell active="web-pages" title="Page">
        <style dangerouslySetInnerHTML={{ __html: WEB_CSS }} />
        <div className="ix-page"><div className="wb-skel wb-skel--head" /><div className="wb-skel" aria-busy="true" aria-label="Loading the page" /></div>
      </AdminShell>
    );
  }
  if (!pg) {
    return (
      <AdminShell active="web-pages" title="Page">
        <div className="ix-page"><section className="ix-card"><EmptyState icon="file-x" title={`${path} isn’t a page on gridcommerce.net.`} actionLabel="All pages" onAction={() => { window.location.href = '/admin/website/pages'; }} /></section></div>
      </AdminShell>
    );
  }

  const sections = pageSections(path);
  const seo = seoOf(path);
  const log = pageLog(path);
  const post = path.startsWith('/blog/') ? postOf(path.slice(6)) : null;
  const hasDraft = !!pg.draft;
  const done = (r, msg) => { if (!r.ok) { toast(r.error); return false; } toast(msg); return true; };

  const startEdit = () => setEdit({ title: pg.working.title, description: pg.working.description, error: '' });
  const saveEdit = () => {
    const r = savePageDraft(path, edit, me);
    if (!r.ok) { setEdit({ ...edit, error: r.error }); return; }
    setEdit(null); toast('Saved as a draft');
  };
  const doSendBack = () => {
    const r = sendBackPage(path, me, back.reason);
    if (!r.ok) { setBack({ ...back, error: r.error }); return; }
    setBack(null); toast('Sent back to ' + (pg.editor || 'the editor'));
  };
  const discard = async () => {
    if (!(await confirmDialog({ title: 'Discard the draft?', body: 'The page goes back to what is published. The draft stays in the version history.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    done(discardPageDraft(path, me), 'Draft discarded');
  };
  const restore = async (v) => {
    if (!(await confirmDialog({ title: `Restore ${v.id}?`, body: `“${v.title}” becomes a new draft. It goes live only after review and approval.`, confirmLabel: 'Restore as draft' }))) return;
    done(restorePageVersion(path, v.id, me), `${v.id} restored as a draft`);
  };

  const primary = pg.status === 'Draft' ? { label: 'Submit for review', icon: 'send', onClick: () => done(submitPage(path, me), 'Sent for review') }
    : pg.status === 'In review' ? { label: 'Approve', icon: 'badge-check', onClick: () => done(approvePage(path, me), 'Approved') }
      : pg.status === 'Approved' ? { label: 'Publish', icon: 'globe', onClick: () => done(publishPage(path, me), 'Published. The live site is not changed in this demo.') }
        : { label: 'Edit details', icon: 'pencil', onClick: startEdit };

  const changed = (k) => hasDraft && pg.draft[k] !== pg.live[k];
  const fullTitle = (x) => (path === '/' ? x : `${x} | ${SITE.name}`);

  return (
    <AdminShell active="web-pages" title={title}>
      <style dangerouslySetInnerHTML={{ __html: WEB_CSS + CSS }} />
      <div className="ix-page">
        <RecordHeader back="/admin/website/pages" backLabel="All pages" title={title}
          badges={<><StatusTag s={pg.status} /><StatusBadge tone="neutral">{pg.type}</StatusBadge></>}
          meta={<><span className="wb-path">{path}</span> · edited {when(pg.updatedAt, t)} by {pg.editor}</>}
          about="One page of gridcommerce.net. Its title and description are what the page's code passes to buildMetadata; its sections are the typed content files it reads. Edit the details here, the sections in Content."
          secondary={[{ label: 'Open live', icon: 'external-link', onClick: () => openLive(path) }]}
          more={[
            pg.status !== 'Published' ? { label: 'Edit details', onClick: startEdit } : null,
            { label: 'SEO for this page', href: '/admin/website/seo?path=' + encodeURIComponent(path) },
            hasDraft ? { label: 'Discard draft', onClick: discard, tone: 'danger' } : null,
          ].filter(Boolean)}
          primary={primary} />

        <div className="ix-record">
          <div className="ix-main">
            <section className="ix-card" aria-label="Details">
              <div className="ix-card__head"><h2>Details</h2><button type="button" className="ix-btn ix-btn--sm" onClick={startEdit}><Icon name="pencil" width="14" height="14" aria-hidden="true" />Edit</button></div>
              <div className="ix-card__body pv-diff">
                <dl>
                  <dt>Title</dt>
                  <dd>{changed('title') ? <><ins>{pg.draft.title}</ins><br /><del>{pg.live.title}</del></> : pg.working.title}</dd>
                  <dt>Description</dt>
                  <dd>{changed('description') ? <><ins>{pg.draft.description}</ins><br /><del>{pg.live.description}</del></> : pg.working.description || <span className="ix-muted">None</span>}</dd>
                  <dt>Shown as</dt>
                  <dd>{fullTitle(pg.working.title)}</dd>
                </dl>
                {hasDraft ? <p className="wb-small">Highlighted text is the draft; struck-through text is live.</p> : null}
              </div>
            </section>

            <PreviewFrame path={path} title={pg.working.title} description={pg.working.description} sections={sections} draftable={hasDraft || sections.some((s) => s.fields.some((f) => f.edit))} status={pg.status} />

            <section className="ix-card" aria-label="Sections">
              <div className="ix-card__head"><h2>Sections</h2><span className="ix-muted">{sections.length}</span></div>
              {sections.length ? (
                <div className="pv-secs">{sections.map((s, i) => <Section key={s.id} s={s} open={i === 0} />)}</div>
              ) : post ? (
                <p className="pv-empty">This page is the blog post “{post.title.en}”. <Link href={'/admin/website/blog/edit?slug=' + post.slug}>Edit it in Blog</Link></p>
              ) : (
                <p className="pv-empty">This page is a form; its labels live in the site’s dictionaries, not in a content file.</p>
              )}
            </section>

            <section className="ix-card" aria-label="Version history">
              <div className="ix-card__head"><h2>Version history</h2><span className="ix-muted">{pg.versions.length}</span></div>
              <div className="ix-card__body">
                <ul className="wb-hist pv-ver">
                  {pg.versions.map((v, i) => (
                    <li key={v.id}>
                      <Who name={v.by} />
                      <span className="wb-hist__text">
                        <b>{v.id} · {v.kind}</b>{i === 0 ? <span className="ix-muted"> · current</span> : null}
                        <small>{v.title} · {dmy(v.at)} {hm(v.at)} · {v.by}</small>
                        <small>{v.description}</small>
                      </span>
                      {i > 0 ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => restore(v)}><Icon name="history" width="14" height="14" aria-hidden="true" />Restore</button> : null}
                    </li>
                  ))}
                </ul>
              </div>
            </section>
          </div>

          <aside className="ix-side">
            <WorkflowCard status={pg.status} editor={pg.editor} submittedBy={pg.submittedBy} approvedBy={pg.approvedBy} note={pg.note} me={me}
              acts={{ submit: () => submitPage(path, me), approve: () => approvePage(path, me), sendBack: () => setBack({ reason: '', error: '' }), publish: () => publishPage(path, me), discard: hasDraft ? discard : null }} />
            <section className="ix-card" aria-label="Page facts">
              <div className="ix-card__head"><h2>Page</h2></div>
              <div className="ix-card__body">
                <KV rows={[
                  ['Address', <a key="u" href={pageUrl(path)} target="_blank" rel="noopener noreferrer" className="wb-path">{pageUrl(path).replace('https://', '')}</a>],
                  ['Type', pg.type],
                  ['Code', <span key="c" className="wb-src">{pg.file}</span>],
                  ['Canonical', <span key="k" className="wb-src">{seo.canonical}</span>],
                  ['Search', seo.index ? 'Indexed' : 'Hidden (noindex)'],
                  ['Sitemap', seo.inSitemap ? 'Listed' : 'Not listed'],
                  ['Sections', String(sections.length)],
                ]} />
              </div>
            </section>
            <section className="ix-card" aria-label="Activity">
              <div className="ix-card__head"><h2>Activity</h2></div>
              <div className="ix-card__body">
                {log.length ? (
                  <ul className="wb-hist">
                    {log.map((x, i) => <li key={i}><Who name={x.by} /><span className="wb-hist__text">{x.text}<small>{x.by} · {when(x.at, t)}</small></span></li>)}
                  </ul>
                ) : <p className="wb-small">No changes since the page was imported from the site’s code.</p>}
              </div>
            </section>
          </aside>
        </div>
      </div>

      <Sheet open={!!edit} title="Edit details" onClose={() => setEdit(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={saveEdit}>Save draft</button>
        </>}>
        {edit ? (
          <div className="wb-flow">
            <Field id="pv-title" label="Title" error={edit.error} hint={'Shown as “' + fullTitle(edit.title || '…') + '”'}>
              <input id="pv-title" {...ctl(edit.error)} value={edit.title} data-autofocus onChange={(e) => setEdit({ ...edit, title: e.target.value, error: '' })} maxLength={120} />
              <LenMeter len={fullTitle(edit.title).length} range={LIMITS.title} />
            </Field>
            <Field id="pv-desc" label="Description" tip="The meta description search engines and social apps show under the title.">
              <textarea id="pv-desc" {...ctl(false)} rows={4} value={edit.description} onChange={(e) => setEdit({ ...edit, description: e.target.value })} maxLength={320} />
              <LenMeter len={edit.description.trim().length} range={LIMITS.desc} />
            </Field>
            <p className="wb-small">Saving makes a draft. It goes live after someone else approves it and it is published.</p>
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!back} title="Send back to the editor" onClose={() => setBack(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBack(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doSendBack}>Send back</button>
        </>}>
        {back ? (
          <Field id="pv-reason" label="What needs to change" error={back.error}>
            <textarea id="pv-reason" {...ctl(back.error)} rows={4} data-autofocus value={back.reason} onChange={(e) => setBack({ reason: e.target.value, error: '' })} placeholder="e.g. Keep the description under 160 characters" />
          </Field>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
