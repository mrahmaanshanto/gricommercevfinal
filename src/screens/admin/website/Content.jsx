'use client';
// Content (/admin/website/content) — the text of gridcommerce.net, grouped as on the site: Homepage, Product &
// features, Pricing, FAQs, Testimonials, Company information, Navigation menu, Footer and Other pages. Each group is
// the site's typed data files (English + Bangla through loc()); every field shows both languages side by side.
//   Left      the groups with their status and how many texts wait in draft (a select on phones).
//   Right     Publishing for the group (Submit for review → Approve (not the editor) → Publish), the section picker
//             and a search across the group, then the fields: Edit opens English and Bangla boxes; Save keeps a draft.
// ?group=pricing&block=pricing.faq opens that section. Data: lib/admin/website.js (contentGroups, blockFields,
// saveField, discardField, submitGroup, approveGroup, sendBackGroup, publishGroup). The live site is never changed.

import React, { useEffect, useMemo, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, EmptyState } from '@/components/ui';
import { ShopHeader, SearchField } from '@/components/ui/IndexKit';
import {
  contentGroups, groupOf, groupState, blockOf, blockFields, blockEdits, groupEdits, LIVE_HOST,
  submitGroup, approveGroup, sendBackGroup, publishGroup, discardField,
} from '@/lib/admin/website';
import { AdminShell } from '../AdminShell';
import { WEB_CSS, useWeb, when, StatusTag, Who, Field, ctl, WorkflowCard, FieldEditor, plural } from './webShared';

const ICONS = { homepage: 'house', features: 'blocks', pricing: 'tag', faqs: 'circle-help', testimonials: 'quote', company: 'building-2', navigation: 'menu', footer: 'panel-bottom', pages: 'files' };
const CSS = `
.ct-grid{display:grid;grid-template-columns:260px minmax(0,1fr);gap:var(--space-4);align-items:start}
.ct-groups{display:flex;flex-direction:column;padding:var(--space-2)}
.ct-group{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:var(--space-2) var(--space-3);border:0;border-radius:var(--radius-lg);background:none;font:inherit;font-size:var(--text-sm);color:var(--text-body);text-align:left;cursor:pointer}
.ct-group:hover{background:var(--surface-subtle)}
.ct-group[aria-current="true"]{background:var(--fill-primary-soft);color:var(--text-heading);font-weight:var(--weight-medium)}
.ct-group:focus-visible{outline:2px solid var(--primary);outline-offset:-2px}
.ct-group>svg{flex:none;color:var(--text-muted)}
.ct-group__text{flex:1;min-width:0;display:flex;flex-direction:column}
.ct-group__text small{font-size:var(--text-xs);color:var(--text-muted);font-weight:var(--weight-regular)}
.ct-phonepick{display:none}
.ct-main{display:flex;flex-direction:column;gap:var(--space-4);min-width:0}
.ct-tools{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-bottom:1px solid var(--border-subtle)}
.ct-tools select{flex:1 1 240px;min-width:0}
.ct-tools .ix-search{flex:1 1 220px}
.ct-blockhead{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-3) var(--space-4) 0}
.ct-blockhead h2{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.ct-blockhead .wb-src{flex-basis:100%}
.ct-fields{display:flex;flex-direction:column;margin-top:var(--space-2)}
.ct-hits h3{margin:0;padding:var(--space-3) var(--space-4) 0;font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted)}
.ct-nav{display:flex;justify-content:space-between;gap:var(--space-2);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle)}
@media (max-width:1023px){.ct-grid{grid-template-columns:minmax(0,1fr)}.ct-side{display:none}.ct-phonepick{display:block}}
`;

export default function Content() {
  const { t, live, me } = useWeb();
  const groups = contentGroups();
  const [gid, setGid] = useState('homepage');
  const [bid, setBid] = useState('');
  const [q, setQ] = useState('');
  const [back, setBack] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const p = new URLSearchParams(window.location.search);
    const g = groupOf(p.get('group')) ? p.get('group') : 'homepage';
    setGid(g);
    const b = p.get('block');
    setBid(b && groupOf(g).blocks.includes(b) ? b : groupOf(g).blocks[0]);
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    const p = new URLSearchParams({ group: gid });
    if (bid) p.set('block', bid);
    window.history.replaceState(window.history.state, '', window.location.pathname + '?' + p.toString());
  }, [ready, gid, bid]);

  const g = groupOf(gid);
  const pickGroup = (id) => { setGid(id); setBid(groupOf(id).blocks[0]); setQ(''); };
  const st = live ? groupState(gid) : { status: 'Published', history: [] };
  const block = blockOf(bid) || blockOf(g.blocks[0]);
  const s = q.trim().toLowerCase();
  const hits = useMemo(() => {
    if (!live || !s) return [];
    return g.blocks.map((b) => ({ b: blockOf(b), fields: blockFields(b).filter((f) => [f.label, f.value.en, f.value.bn || ''].join(' ').toLowerCase().includes(s)) })).filter((x) => x.fields.length);
  }, [live, g, s, st]); // eslint-disable-line react-hooks/exhaustive-deps

  const idx = g.blocks.indexOf(block.id);
  const doSendBack = () => {
    const r = sendBackGroup(gid, me, back.reason);
    if (!r.ok) { setBack({ ...back, error: r.error }); return; }
    setBack(null); toast('Sent back');
  };
  const discardAll = async () => {
    const n = groupEdits(gid);
    if (!(await confirmDialog({ title: `Discard ${plural(n, 'change')}?`, body: `Every draft text in ${g.label} goes back to what is live.`, confirmLabel: 'Discard', tone: 'danger' }))) return;
    g.blocks.forEach((b) => blockFields(b).forEach((f) => { if (f.edit) discardField(f.key, me); }));
    toast('Changes discarded');
  };

  const editsHere = live ? groupEdits(gid) : 0;
  let body;
  if (!live) body = <div className="wb-skel" aria-busy="true" aria-label="Loading content" />;
  else {
    const fields = blockFields(block.id);
    body = (
      <div className="ct-main">
        <WorkflowCard status={st.status} editor={st.by} submittedBy={st.submittedBy} approvedBy={st.approvedBy} note={st.note} me={me}
          extra={<p className="wb-small">{editsHere ? <><b>{plural(editsHere, 'text')}</b> in draft in {g.label}.</> : <>No draft changes in {g.label}.</>} Last change {when(st.at, t)} by {st.by}.</p>}
          acts={{ submit: () => submitGroup(gid, me), approve: () => approveGroup(gid, me), sendBack: () => setBack({ reason: '', error: '' }), publish: () => publishGroup(gid, me), discard: editsHere ? discardAll : null }} />

        <section className="ix-card" aria-label={g.label + ' text'}>
          <div className="ct-tools">
            <select className="gc-input gc-select" aria-label="Section" value={block.id} onChange={(e) => { setBid(e.target.value); setQ(''); }}>
              {g.blocks.map((b) => { const x = blockOf(b); const n = blockEdits(b); return <option key={b} value={b}>{x.label}{n ? ` · ${n} in draft` : ''}</option>; })}
            </select>
            <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder={'Search text in ' + g.label} onDone={() => setQ('')} />
          </div>
          {s ? (
            <div className="ct-hits">
              {hits.length ? hits.map(({ b, fields: fs }) => (
                <div key={b.id}>
                  <h3>{b.label}</h3>
                  <div className="ct-fields">{fs.map((f) => <FieldEditor key={f.key} f={f} me={me} />)}</div>
                </div>
              )) : <div className="ix-empty"><EmptyState title={`No text in ${g.label} matches “${q.trim()}”.`} actionLabel="Clear search" onAction={() => setQ('')} /></div>}
            </div>
          ) : (
            <>
              <div className="ct-blockhead">
                <h2>{block.label}</h2>
                <span className="ix-muted">{plural(fields.length, 'text')}</span>
                <span className="wb-src">{block.source}</span>
              </div>
              <div className="ct-fields">{fields.map((f) => <FieldEditor key={f.key} f={f} me={me} />)}</div>
              {g.blocks.length > 1 ? (
                <div className="ct-nav">
                  <button type="button" className="ix-btn ix-btn--sm" disabled={idx <= 0} onClick={() => setBid(g.blocks[idx - 1])}><Icon name="chevron-left" width="14" height="14" aria-hidden="true" />Previous section</button>
                  <span className="ix-muted wb-data">{idx + 1} / {g.blocks.length}</span>
                  <button type="button" className="ix-btn ix-btn--sm" disabled={idx >= g.blocks.length - 1} onClick={() => setBid(g.blocks[idx + 1])}>Next section<Icon name="chevron-right" width="14" height="14" aria-hidden="true" /></button>
                </div>
              ) : null}
            </>
          )}
        </section>

        <details className="ix-card gc-disclose">
          <summary>History · {g.label}</summary>
          <div className="ix-card__body">
            <ul className="wb-hist">
              {st.history.slice(0, 12).map((h, i) => <li key={i}><Who name={h.by} /><span className="wb-hist__text">{h.text}<small>{h.by} · {when(h.at, t)}</small></span></li>)}
            </ul>
          </div>
        </details>
      </div>
    );
  }

  return (
    <AdminShell active="web-content" title="Content">
      <style dangerouslySetInnerHTML={{ __html: WEB_CSS + CSS }} />
      <div className="ix-page">
        <ShopHeader icon="type" title="Content"
          about="The words on gridcommerce.net, grouped as on the site. Each text comes from the website's typed data files (src/data/copy and src/data/sample) and has an English and a Bangla version. Edit a text to save a draft; send the group for review; someone other than the editor approves; then publish. Fields marked To be confirmed are PENDING in the site's site.ts and show a 'to be confirmed' state on the site. Publishing here does not change the live site in this demo."
          secondary={[{ label: 'Pages', icon: 'files', href: '/admin/website/pages' }]}
          more={[{ label: 'View site', onClick: () => window.open(LIVE_HOST, '_blank', 'noopener') }]} />
        <div className="ct-phonepick">
          <select className="gc-input gc-select" aria-label="Content group" value={gid} onChange={(e) => pickGroup(e.target.value)}>
            {groups.map((x) => <option key={x.id} value={x.id}>{x.label}{live && groupEdits(x.id) ? ` · ${groupEdits(x.id)} in draft` : ''}{live ? ' · ' + groupState(x.id).status : ''}</option>)}
          </select>
        </div>
        <div className="ct-grid">
          <nav className="ix-card ct-side" aria-label="Content groups">
            <div className="ct-groups">
              {groups.map((x) => {
                const n = live ? groupEdits(x.id) : 0;
                const s2 = live ? groupState(x.id).status : '';
                return (
                  <button key={x.id} type="button" className="ct-group" aria-current={gid === x.id} onClick={() => pickGroup(x.id)}>
                    <Icon name={ICONS[x.id] || 'file-text'} width="16" height="16" aria-hidden="true" />
                    <span className="ct-group__text"><span>{x.label}</span><small>{n ? plural(n, 'text') + ' in draft' : plural(x.blocks.length, 'section')}</small></span>
                    {s2 && s2 !== 'Published' ? <StatusTag s={s2} /> : null}
                  </button>
                );
              })}
            </div>
          </nav>
          {body}
        </div>
      </div>

      <Sheet open={!!back} title={'Send back · ' + g.label} onClose={() => setBack(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setBack(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={doSendBack}>Send back</button>
        </>}>
        {back ? (
          <Field id="ct-reason" label="What needs to change" error={back.error}>
            <textarea id="ct-reason" {...ctl(back.error)} rows={4} data-autofocus value={back.reason} onChange={(e) => setBack({ reason: e.target.value, error: '' })} placeholder="e.g. The Bangla quote needs the same wording as the English" />
          </Field>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
