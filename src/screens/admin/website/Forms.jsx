'use client';
// Website › Forms (/admin/website/forms) — the forms on gridcommerce.net (Trial signup, Demo request, Contact, Lead
// magnet, Newsletter, Free migration request: fields as the site's src/services/*.service.ts send them) and what people
// sent through them. Two tabs in the title row:
//   Forms        each form's fields, where submissions go, submissions in 30 days, conversion and status; a row opens
//                the form in a side panel (fields with type and required, destination, notifications, spam protection,
//                button and thank-you text; a failing form shows its problem and "Send a test").
//   Submissions  views by status (counts on the tabs), filters (form, UTM source, period, page), bulk Send to CRM /
//                Mark spam / Close / Export CSV, and a side panel per submission.
// Data: lib/admin/website2.js (updateForm, setFormStatus, fixForm, formStats; sendToCrm, markSpam, notSpam,
// closeSubmissions, reopen). "Send to CRM" marks the submission and gives it a lead number; the CRM is not touched.
// Address: ?tab=submissions&status=New&form=trial&source=facebook&days=30&page=/lp/…&sub=WS-24001 · ?form=magnet

import React, { useEffect, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast } from '@/runtime/ui';
import { Sheet, EmptyState, InfoTip, StatusBadge } from '@/components/ui';
import { FilterBar } from '@/components/ui/FilterBar';
import { ShopHeader, IndexTabs, Pager, Menu, KV } from '@/components/ui/IndexKit';
import { downloadCsv } from '@/lib/reports/period';
import { DAY } from '@/lib/platform/util';
import { STAFF } from '@/lib/platform/catalogue';
import { useAdminStore } from '@/lib/admin/store';
import {
  webStore, SITE, FIELD_TYPES, DESTINATIONS, FORM_STATUS, CAPTCHA, RATE_LIMITS, SUB_STATUSES, WEB_TEAM,
  formStats, subCounts, updateForm, setFormStatus, fixForm, sendToCrm, markSpam, notSpam, closeSubmissions, reopen, pct, usedLabel,
} from '@/lib/admin/website2';
import { AdminShell } from '../AdminShell';
import { W2_CSS, FormBadge, SubBadge, Field, ctl, Toggle, Skeleton, me, num, plural, when, stamp } from './web2Shared';

const PAGE = 25;
const PERIODS = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['60', 'Last 60 days']];
const PEOPLE = [...new Set([...STAFF.filter((s) => !s.invite && !s.inactive).map((s) => s.name), ...WEB_TEAM.map((w) => w.name)])];
const DEST_ICON = { 'Leads in CRM': 'contact-round', 'Support inbox': 'life-buoy', 'Email list': 'mail' };

const CSS = `
.fm-tabs .ix-tabs{border:0;padding:0}
.fm-name{display:flex;align-items:center;gap:var(--space-2);min-width:0}
.fm-dest{display:inline-flex;align-items:center;gap:6px;white-space:nowrap}
.fm-dest svg{color:var(--text-muted)}
.fm-alert{display:flex;gap:var(--space-3);align-items:flex-start;padding:var(--space-3);border:1px solid color-mix(in srgb,var(--danger) 35%,transparent);border-radius:var(--radius-lg);background:var(--fill-error-soft);font-size:var(--text-sm);color:var(--text-heading)}
.fm-alert svg{flex:none;margin-top:2px;color:var(--text-danger)}
.fm-alert p{margin:0 0 var(--space-2)}
.fm-fields{display:flex;flex-direction:column;gap:var(--space-2);margin:0;padding:0;list-style:none}
.fm-field{display:grid;grid-template-columns:minmax(0,1fr) 128px auto auto;gap:var(--space-2);align-items:center;padding:var(--space-2);border:1px solid var(--border-subtle);border-radius:var(--radius-lg);background:var(--surface-page)}
.fm-req{display:inline-flex;align-items:center;gap:6px;font-size:var(--text-xs);color:var(--text-body);white-space:nowrap}
.fm-opts{grid-column:1/-1;font-size:var(--text-xs);color:var(--text-muted)}
.fm-people{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.fm-people label{display:inline-flex;align-items:center;gap:6px;height:32px;padding:0 var(--space-3);border:1px solid var(--border-subtle);border-radius:var(--radius-full);font-size:var(--text-xs);color:var(--text-body);cursor:pointer}
.fm-people input{accent-color:var(--primary)}
.fm-stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:var(--space-2)}
.fm-stats div{display:flex;flex-direction:column;gap:2px;padding:var(--space-2);border-radius:var(--radius-lg);background:var(--surface-page)}
.fm-stats span{font-size:var(--text-xs);color:var(--text-muted)}
.fm-stats b{font-family:var(--font-data);font-weight:var(--weight-semibold);color:var(--text-heading)}
.fm-msg{margin:0;padding:var(--space-2) var(--space-3);border-radius:var(--radius-lg);background:var(--surface-page);font-size:var(--text-sm);white-space:pre-wrap;overflow-wrap:anywhere}
.fm-chipbar{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-2);padding:var(--space-2) var(--space-3) 0;font-size:var(--text-sm)}
.fm-foot{display:flex;flex-wrap:wrap;gap:var(--space-2);width:100%}
.fm-foot .fm-sp{flex:1}
@media (max-width:640px){
  .fm-field{grid-template-columns:minmax(0,1fr) auto}
  .fm-field select{grid-column:1/2}
  .fm-stats{grid-template-columns:repeat(2,minmax(0,1fr))}
}
`;

function fromUrl() {
  const p = new URLSearchParams(window.location.search);
  return {
    tab: p.get('tab') === 'submissions' || p.get('sub') ? 'submissions' : 'forms',
    status: SUB_STATUSES.includes(p.get('status')) ? p.get('status') : '',
    form: p.get('form') || '',
    source: p.get('source') || '',
    days: PERIODS.some(([k]) => k === p.get('days')) ? p.get('days') : '60',
    page: p.get('page') || '',
    q: p.get('q') || '',
    sub: p.get('sub') || '',
  };
}
function toUrl(s) {
  const p = new URLSearchParams();
  if (s.tab === 'submissions') {
    p.set('tab', 'submissions');
    if (s.status) p.set('status', s.status);
    if (s.form) p.set('form', s.form);
    if (s.source) p.set('source', s.source);
    if (s.days !== '60') p.set('days', s.days);
    if (s.page) p.set('page', s.page);
    if (s.q.trim()) p.set('q', s.q.trim());
    if (s.sub) p.set('sub', s.sub);
  } else if (s.edit) p.set('form', s.edit);
  const q = p.toString();
  window.history.replaceState(window.history.state, '', window.location.pathname + (q ? '?' + q : ''));
}
const srcOf = (s) => s.utm.source || 'direct';

export default function Forms() {
  const { data, t, live } = useAdminStore(webStore);
  const [ready, setReady] = useState(false);
  const [tab, setTab] = useState('forms');
  const [status, setStatus] = useState('');
  const [fForm, setFForm] = useState('');
  const [source, setSource] = useState('');
  const [days, setDays] = useState('60');
  const [onPage, setOnPage] = useState('');
  const [q, setQ] = useState('');
  const [pg0, setPage] = useState(0);
  const [sel, setSel] = useState(() => new Set());
  const [subId, setSubId] = useState('');
  const [editState, setEdit] = useState(null);   // the open form's draft ({ id, pending } until the data is there)
  let edit = editState;
  const first = useRef(true);

  useEffect(() => {
    const s = fromUrl();
    setTab(s.tab); setStatus(s.status); setSource(s.source); setDays(s.days); setOnPage(s.page); setQ(s.q); setSubId(s.sub);
    if (s.tab === 'submissions') setFForm(s.form);
    else if (s.form) setEdit({ id: s.form, pending: true });
    setReady(true);
  }, []);
  useEffect(() => {
    if (!ready) return;
    toUrl({ tab, status, form: fForm, source, days, page: onPage, q, sub: subId, edit: edit && edit.id });
    if (first.current) { first.current = false; return; }
    setPage(0);
  }, [ready, tab, status, fForm, source, days, onPage, q, subId, edit && edit.id]); // eslint-disable-line react-hooks/exhaustive-deps

  const forms = live ? data.forms : [];
  const formOf = (id) => forms.find((f) => f.id === id) || null;
  const who = me();

  function draftOf(f) {
    return { id: f.id, name: f.name, status: f.status, fields: f.fields.map((x) => ({ ...x })), destination: f.destination, notify: { ...f.notify, staff: [...f.notify.staff] }, spam: { ...f.spam }, submitLabel: f.submitLabel, success: f.success, error: '', field: '' };
  }

  // ---- submissions ----
  const subs = live ? data.submissions : [];
  const s = q.trim().toLowerCase();
  const since = t - Number(days) * DAY;
  const scoped = subs.filter((x) => {
    if (x.at < since) return false;
    if (fForm && x.formId !== fForm) return false;
    if (source && srcOf(x) !== source) return false;
    if (onPage && x.page !== onPage) return false;
    if (s && ![x.id, x.name, x.business, x.phone, x.email, x.page, x.utm.campaign, x.message].join(' ').toLowerCase().includes(s)) return false;
    return true;
  });
  const counts = subCounts(scoped);
  const filtered = scoped.filter((x) => !status || x.status === status);
  const pages = Math.max(1, Math.ceil(filtered.length / PAGE));
  const pg = Math.min(pg0, pages - 1);
  const rows = filtered.slice(pg * PAGE, pg * PAGE + PAGE);
  const selRows = filtered.filter((x) => sel.has(x.id));
  const allOnPage = rows.length > 0 && rows.every((x) => sel.has(x.id));
  const toggle = (id) => setSel((old) => { const n = new Set(old); if (n.has(id)) n.delete(id); else n.add(id); return n; });
  const toggleAll = () => setSel((old) => { const n = new Set(old); if (allOnPage) rows.forEach((x) => n.delete(x.id)); else rows.forEach((x) => n.add(x.id)); return n; });
  const clearSel = () => setSel(new Set());
  const sources = [...new Set(subs.map(srcOf))].sort();
  const openSub = subs.find((x) => x.id === subId) || null;

  const report = (res, verb, ids) => {
    const skipped = res.skipped || [];
    const spam = skipped.filter((x) => x === 'spam').length;
    const msg = res.n ? `${plural(res.n, 'submission')} ${verb}` : 'Nothing changed';
    toast(msg + (spam ? ` · ${spam} spam left out` : '') + (skipped.length - spam ? ` · ${skipped.length - spam} already done` : ''));
    if (ids && ids.length > 1) clearSel();
  };
  const bulk = (fn, verb) => { const ids = selRows.map((x) => x.id); if (!ids.length) return; report(fn(ids, who), verb, ids); };
  const exportCsv = (which, name) => {
    if (!which.length) { toast('Nothing to export'); return; }
    downloadCsv(name, [
      ['ID', 'Received', 'Form', 'Name', 'Business', 'Phone', 'Email', 'District', 'Page', 'UTM source', 'UTM medium', 'UTM campaign', 'Status', 'Lead', 'Message', 'Answers'],
      ...which.map((x) => [x.id, stamp(x.at), (formOf(x.formId) || {}).name || x.formId, x.name, x.business, x.phone, x.email, x.district, x.page, x.utm.source, x.utm.medium, x.utm.campaign, x.status, x.leadRef, x.message,
        Object.entries(x.answers || {}).map(([k, v]) => k + ': ' + v).join(' | ')]),
    ]);
    toast(plural(which.length, 'submission') + ' exported');
  };

  // ---- forms ----
  const saveForm = () => {
    const res = updateForm(edit.id, edit, who);
    if (!res.ok) { setEdit({ ...edit, error: res.error, field: res.field || '' }); return; }
    const f = formOf(edit.id);
    if (f && f.status !== edit.status) setFormStatus(edit.id, edit.status, who);
    setEdit(null);
    toast('Form saved. The live site is not changed in this demo.');
  };
  const setE = (patch) => setEdit({ ...edit, ...patch, error: '', field: '' });
  const setField = (i, patch) => setE({ fields: edit.fields.map((f, k) => (k === i ? { ...f, ...patch } : f)) });

  const headTabs = (
    <span className="fm-tabs">
      <IndexTabs label="Forms and submissions" tabs={[
        { key: 'forms', id: 'fm-tab-forms', label: 'Forms', count: live ? forms.length : null, on: tab === 'forms', onClick: () => setTab('forms') },
        { key: 'submissions', id: 'fm-tab-subs', label: 'Submissions', count: live ? subs.filter((x) => x.status === 'New').length || null : null, on: tab === 'submissions', onClick: () => setTab('submissions') },
      ]} />
    </span>
  );
  const header = (
    <ShopHeader icon="clipboard-list" title="Forms" middle={headTabs}
      about="The forms on gridcommerce.net and what people sent through them. Each form sends to the CRM's leads, the support inbox or the email list. New submissions wait in Submissions until someone sends them to the CRM, closes them or marks them as spam. Changes here do not change the live site in this demo."
      secondary={[{ label: 'Export', icon: 'download', onClick: () => exportCsv(tab === 'submissions' ? filtered : subs, 'gridcommerce-website-submissions.csv') }]}
      more={[{ label: 'Landing pages', href: '/admin/website/landing-pages' }, { label: 'Leads in CRM', href: '/admin/leads' }]}
      primary={tab === 'forms' ? { label: 'New submissions', icon: 'inbox', onClick: () => { setTab('submissions'); setStatus('New'); } } : null} />
  );

  let body;
  if (!live) {
    body = <Skeleton label="Loading forms" />;
  } else if (tab === 'forms') {
    const stats = Object.fromEntries(forms.map((f) => [f.id, formStats(data, f, t)]));
    body = (
      <section className="ix-card" aria-label="Forms">
        <ul className="ix-plist" aria-label="Forms">
          {forms.map((f) => (
            <li key={f.id}>
              <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setEdit(draftOf(f))}>
                <span className="ix-pitem__top"><b>{f.name}</b>{f.health && !f.health.ok ? <StatusBadge tone="error">Failing</StatusBadge> : <FormBadge s={f.status} />}</span>
                <span className="ix-pitem__mid">{plural(f.fields.length, 'field')} · {f.destination}</span>
                <span className="ix-pitem__mid">{num(stats[f.id].d30)} in 30 days · {pct(stats[f.id].rate)} conversion · {stats[f.id].fresh} new</span>
              </button>
            </li>
          ))}
        </ul>
        <div className="ix-table-wrap">
          <table className="ix-table gc-table--keep">
            <caption className="sr-only">Forms</caption>
            <thead>
              <tr>
                <th scope="col">Form</th><th scope="col" className="ix-num">Fields</th><th scope="col">Goes to</th>
                <th scope="col" className="ix-num">Submissions · 30 days</th>
                <th scope="col" className="ix-num">Conversion <InfoTip text="Submissions (spam left out) divided by the people who saw the form, over 60 days." /></th>
                <th scope="col" className="ix-num">New</th><th scope="col">Status</th>
              </tr>
            </thead>
            <tbody>
              {forms.map((f) => {
                const st = stats[f.id];
                return (
                  <tr key={f.id} tabIndex={0} onClick={() => setEdit(draftOf(f))} onKeyDown={(e) => { if (e.key === 'Enter') setEdit(draftOf(f)); }}>
                    <td><span className="w2-two w2-cell"><span className="ix-strong">{f.name}</span><small>{f.placements.map(usedLabel).join(' · ')}</small></span></td>
                    <td className="ix-num w2-data">{f.fields.length}</td>
                    <td><span className="fm-dest"><Icon name={DEST_ICON[f.destination] || 'send'} width="14" height="14" aria-hidden="true" />{f.destination}</span></td>
                    <td className="ix-num w2-data">{num(st.d30)}</td>
                    <td className="ix-num w2-data">{pct(st.rate)}</td>
                    <td className="ix-num w2-data">{st.fresh ? <button type="button" className="ix-btn ix-btn--sm" onClick={(e) => { e.stopPropagation(); setTab('submissions'); setFForm(f.id); setStatus('New'); }}>{st.fresh}</button> : <span className="ix-muted">0</span>}</td>
                    <td>{f.health && !f.health.ok ? <StatusBadge tone="error">Failing</StatusBadge> : <FormBadge s={f.status} />}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    );
  } else {
    const tabs = [['', 'All'], ...SUB_STATUSES.map((x) => [x, x])].map(([k, label]) => ({ key: k || 'all', id: 'sb-tab-' + (k || 'all').replace(/\s/g, '-'), label, count: k ? counts[k] : counts.all, on: status === k, onClick: () => setStatus(k) }));
    const filters = [
      { key: 'form', label: 'Form', all: 'All forms', value: fForm, options: forms.map((f) => [f.id, f.name]), onChange: setFForm },
      { key: 'source', label: 'UTM source', all: 'All sources', value: source, options: sources.map((x) => [x, x === 'direct' ? 'Direct (no UTM)' : x]), onChange: setSource },
      { key: 'days', label: 'Period', value: days, empty: '60', options: PERIODS, onChange: setDays },
    ];
    const chips = onPage ? [{ key: 'page', text: 'Page: ' + onPage, clear: () => setOnPage('') }] : [];
    const filtersOn = !!(s || fForm || source || onPage || days !== '60');
    body = (
      <section className="ix-card" aria-label="Submissions">
        {selRows.length ? (
          <div className="ix-bulk" role="toolbar" aria-label="Selected submissions">
            <input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every submission on this page" style={{ width: 16, height: 16, margin: '0 6px', accentColor: 'var(--primary)' }} />
            <span className="ix-bulk__n">{selRows.length} selected</span>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => bulk(sendToCrm, 'sent to Leads in CRM')}><Icon name="contact-round" width="16" height="16" aria-hidden="true" />Send to CRM</button>
            <button type="button" className="ix-btn ix-btn--sm" onClick={() => bulk(markSpam, 'marked as spam')}><Icon name="ban" width="16" height="16" aria-hidden="true" />Mark spam</button>
            <Menu label="" icon="ellipsis" cls="ix-btn ix-btn--sm ix-btn--icon" align="start" items={[
              { label: 'Close', onClick: () => bulk(closeSubmissions, 'closed') },
              { label: 'Not spam', onClick: () => bulk(notSpam, 'moved back to New') },
              { label: 'Export selected', onClick: () => exportCsv(selRows, 'gridcommerce-submissions-selected.csv') },
              { label: 'Clear selection', onClick: clearSel },
            ]} />
          </div>
        ) : (
          <div className="ix-bar"><IndexTabs tabs={tabs} label="Submission status" /></div>
        )}
        <div className="w2-filters">
          <FilterBar label="Filter submissions" filters={filters} chips={chips} onClear={() => setQ('')}
            search={{ value: q, onChange: setQ, placeholder: 'Search name, phone, email or campaign' }} />
        </div>
        {!filtered.length ? (
          <div className="ix-empty">
            {filtersOn
              ? <EmptyState title="No submissions match these filters." actionLabel="Clear filters" onAction={() => { setQ(''); setFForm(''); setSource(''); setOnPage(''); setDays('60'); }} />
              : <EmptyState icon="inbox" title={status ? `No ${status.toLowerCase()} submissions.` : 'No submissions yet.'} actionLabel="Show all" onAction={() => setStatus('')} />}
          </div>
        ) : (
          <>
            <ul className="ix-plist" aria-label="Submissions">
              {rows.map((x) => (
                <li key={x.id}>
                  <button type="button" className="ix-pitem" style={{ width: '100%', border: 0, background: 'none', textAlign: 'left', font: 'inherit' }} onClick={() => setSubId(x.id)}>
                    <span className="ix-pitem__top"><b>{x.name}</b><span className="w2-muted">{when(x.at, t)}</span></span>
                    <span className="ix-pitem__mid">{(formOf(x.formId) || {}).name} · {x.page} · {srcOf(x)}</span>
                    <span className="ix-pitem__tags"><SubBadge s={x.status} /></span>
                  </button>
                </li>
              ))}
            </ul>
            <div className="ix-table-wrap">
              <table className="ix-table gc-table--keep">
                <caption className="sr-only">Submissions</caption>
                <thead>
                  <tr>
                    <th scope="col" className="ix-check"><input type="checkbox" checked={allOnPage} onChange={toggleAll} aria-label="Select every submission on this page" /></th>
                    <th scope="col">Name</th><th scope="col">Contact</th><th scope="col">Form</th><th scope="col">Page</th><th scope="col">Source</th><th scope="col">Status</th><th scope="col">Received</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((x) => (
                    <tr key={x.id} className={sel.has(x.id) ? 'is-sel' : ''} tabIndex={0} onClick={() => setSubId(x.id)} onKeyDown={(e) => { if (e.key === 'Enter' && e.target === e.currentTarget) setSubId(x.id); }}>
                      <td className="ix-check" onClick={(e) => e.stopPropagation()}><input type="checkbox" checked={sel.has(x.id)} onChange={() => toggle(x.id)} aria-label={'Select ' + x.name} /></td>
                      <td><span className="w2-two w2-cell"><span className="ix-strong">{x.name}</span><small>{x.business || '—'}</small></span></td>
                      <td><span className="w2-two w2-cell"><span className="w2-data">{x.phone || '—'}</span><small>{x.email || ''}</small></span></td>
                      <td className="ix-muted ix-nowrap">{(formOf(x.formId) || {}).name}</td>
                      <td><span className="w2-data">{x.page}</span></td>
                      <td><span className="w2-two"><span>{srcOf(x) === 'direct' ? 'Direct' : srcOf(x)}</span>{x.utm.campaign ? <small>{x.utm.campaign}</small> : null}</span></td>
                      <td><SubBadge s={x.status} /></td>
                      <td className="ix-muted ix-nowrap">{when(x.at, t)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}
        <Pager label={filtered.length ? `${pg * PAGE + 1}–${pg * PAGE + rows.length} of ${filtered.length}` : '0 submissions'} atStart={pg === 0} atEnd={pg >= pages - 1} prev={() => setPage(pg - 1)} next={() => setPage(pg + 1)} />
      </section>
    );
  }

  // the open form (one named in the address starts from what is saved, once the data is there)
  const ef = edit ? formOf(edit.id) : null;
  if (edit && edit.pending && ef) edit = draftOf(ef);
  const est = ef ? formStats(data, ef, t) : null;
  const subForm = openSub ? formOf(openSub.formId) : null;

  return (
    <AdminShell active="web-forms" title="Forms">
      <style dangerouslySetInnerHTML={{ __html: W2_CSS + CSS }} />
      <div className="ix-page">
        {header}
        {body}
      </div>

      <Sheet open={!!ef} title={ef ? ef.name : ''} onClose={() => setEdit(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={saveForm}>Save form</button>
        </>}>
        {ef && edit ? (
          <div className="w2-form">
            {ef.health && !ef.health.ok ? (
              <div className="fm-alert" role="alert">
                <Icon name="circle-alert" width="18" height="18" aria-hidden="true" />
                <div>
                  <p>{ef.health.error} Since {when(ef.health.since, t)}.</p>
                  <button type="button" className="ix-btn ix-btn--sm" onClick={() => { const r = fixForm(ef.id, who); if (r.ok) toast('Test submission went through. The form is working again.'); }}>Send a test</button>
                </div>
              </div>
            ) : null}
            <div className="fm-stats">
              <div><span>30 days</span><b>{num(est.d30)}</b></div>
              <div><span>Conversion</span><b>{pct(est.rate)}</b></div>
              <div><span>New</span><b>{num(est.fresh)}</b></div>
              <div><span>Spam stopped</span><b>{num(est.spam)}</b></div>
            </div>
            <div className="w2-form__two">
              <Field id="fe-name" label="Name" error={edit.field === 'name' ? edit.error : ''}>
                <input id="fe-name" {...ctl(edit.field === 'name')} value={edit.name} onChange={(e) => setE({ name: e.target.value })} />
              </Field>
              <Field id="fe-status" label="Status">
                <select id="fe-status" {...ctl(false, true)} value={edit.status} onChange={(e) => setE({ status: e.target.value })}>
                  {FORM_STATUS.map((x) => <option key={x} value={x}>{x}</option>)}
                </select>
              </Field>
            </div>
            <KV rows={[['On', ef.placements.map(usedLabel).join(' · ')], ['Sends with', <span key="s" className="w2-data">{ef.service}</span>], ef.download ? ['Download', ef.download.split('/').pop()] : null]} />

            <h3 className="w2-sec">Fields</h3>
            {edit.field === 'fields' ? <p className="w2-formerr" role="alert">{edit.error}</p> : null}
            <ul className="fm-fields">
              {edit.fields.map((f, i) => (
                <li key={i} className="fm-field">
                  <input className="gc-input" aria-label={'Field ' + (i + 1) + ' label'} value={f.label} onChange={(e) => setField(i, { label: e.target.value })} />
                  <select className="gc-input gc-select" aria-label={'Field ' + (i + 1) + ' type'} value={f.type} onChange={(e) => setField(i, { type: e.target.value })}>
                    {FIELD_TYPES.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
                  </select>
                  <label className="fm-req"><input type="checkbox" className="gc-check" checked={!!f.required} onChange={(e) => setField(i, { required: e.target.checked })} />Required</label>
                  <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" aria-label={'Remove ' + (f.label || 'field')} onClick={() => setE({ fields: edit.fields.filter((_, k) => k !== i) })}><Icon name="x" width="14" height="14" aria-hidden="true" /></button>
                  {f.type === 'select' && f.options ? <span className="fm-opts">Choices: {f.options.join(' · ')}</span> : null}
                </li>
              ))}
            </ul>
            <div><button type="button" className="ix-btn ix-btn--sm" onClick={() => setE({ fields: [...edit.fields, { key: '', label: '', type: 'text', required: false }] })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Add field</button></div>

            <h3 className="w2-sec">Where submissions go</h3>
            <Field id="fe-dest" label="Destination" error={edit.field === 'destination' ? edit.error : ''}>
              <select id="fe-dest" {...ctl(false, true)} value={edit.destination} onChange={(e) => setE({ destination: e.target.value })}>
                {DESTINATIONS.map((x) => <option key={x} value={x}>{x}</option>)}
              </select>
            </Field>
            <div className="w2-form__two">
              <Field id="fe-btn" label="Button text"><input id="fe-btn" {...ctl(false)} value={edit.submitLabel} onChange={(e) => setE({ submitLabel: e.target.value })} /></Field>
              <Field id="fe-ok" label="Thank-you message"><input id="fe-ok" {...ctl(false)} value={edit.success} onChange={(e) => setE({ success: e.target.value })} /></Field>
            </div>

            <h3 className="w2-sec">Notifications</h3>
            <div className="fm-people" role="group" aria-label="Tell these people">
              {PEOPLE.map((p) => (
                <label key={p}><input type="checkbox" checked={edit.notify.staff.includes(p)} onChange={(e) => setE({ notify: { ...edit.notify, staff: e.target.checked ? [...edit.notify.staff, p] : edit.notify.staff.filter((x) => x !== p) } })} />{p}</label>
              ))}
            </div>
            <Toggle on={edit.notify.email} onChange={(v) => setE({ notify: { ...edit.notify, email: v } })} label="Email each submission" />
            <Toggle on={edit.notify.sms} onChange={(v) => setE({ notify: { ...edit.notify, sms: v } })} label="SMS each submission" hint="For forms that need a call back fast" />
            <Toggle on={edit.notify.daily} onChange={(v) => setE({ notify: { ...edit.notify, daily: v } })} label="Daily summary at 9:00" />

            <h3 className="w2-sec">Spam protection</h3>
            <Field id="fe-cap" label="Bot check">
              <select id="fe-cap" {...ctl(false, true)} value={edit.spam.captcha} onChange={(e) => setE({ spam: { ...edit.spam, captcha: e.target.value } })}>
                {CAPTCHA.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Field id="fe-rate" label="Limit">
              <select id="fe-rate" {...ctl(false, true)} value={edit.spam.rateLimit} onChange={(e) => setE({ spam: { ...edit.spam, rateLimit: Number(e.target.value) } })}>
                {RATE_LIMITS.map(([k, l]) => <option key={k} value={k}>{l}</option>)}
              </select>
            </Field>
            <Toggle on={edit.spam.honeypot} onChange={(v) => setE({ spam: { ...edit.spam, honeypot: v } })} label="Hidden trap field" hint="Bots fill it in, people never see it" />
            <Toggle on={edit.spam.blockDisposable} onChange={(v) => setE({ spam: { ...edit.spam, blockDisposable: v } })} label="Block throwaway email addresses" />
            <Toggle on={edit.spam.blockLinks} onChange={(v) => setE({ spam: { ...edit.spam, blockLinks: v } })} label="Block messages with links" />
            {edit.error && !edit.field ? <p className="w2-formerr" role="alert">{edit.error}</p> : null}
          </div>
        ) : null}
      </Sheet>

      <Sheet open={!!openSub} title={openSub ? openSub.name : ''} onClose={() => setSubId('')}
        footer={openSub ? (
          <span className="fm-foot">
            {openSub.status === 'Spam'
              ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => report(notSpam([openSub.id], who), 'moved back to New')}>Not spam</button>
              : <button type="button" className="gc-btn gc-btn--neutral" onClick={() => report(markSpam([openSub.id], who), 'marked as spam')}>Mark spam</button>}
            {openSub.status === 'Closed' || openSub.status === 'Sent to CRM'
              ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => report(reopen([openSub.id], who), 'reopened')}>Reopen</button>
              : openSub.status !== 'Spam' ? <button type="button" className="gc-btn gc-btn--neutral" onClick={() => report(closeSubmissions([openSub.id], who), 'closed')}>Close</button> : null}
            <span className="fm-sp" />
            {openSub.status !== 'Spam' && openSub.status !== 'Sent to CRM'
              ? <button type="button" className="gc-btn gc-btn--solid" onClick={() => report(sendToCrm([openSub.id], who), 'sent to Leads in CRM')}>Send to CRM</button> : null}
          </span>
        ) : null}>
        {openSub ? (
          <div className="w2-form">
            <p><SubBadge s={openSub.status} />{openSub.leadRef && openSub.status === 'Sent to CRM' ? <span className="w2-muted"> · lead <span className="w2-data">{openSub.leadRef}</span></span> : null}</p>
            <KV rows={[
              ['Form', subForm ? subForm.name : openSub.formId],
              ['Received', stamp(openSub.at)],
              ['Page', <a key="p" href={SITE + openSub.page} target="_blank" rel="noreferrer" className="w2-data">{openSub.page}</a>],
              ['Business', openSub.business],
              ['Phone', openSub.phone ? <a key="ph" href={'tel:' + openSub.phone} className="w2-data">{openSub.phone}</a> : ''],
              ['Email', openSub.email ? <a key="em" href={'mailto:' + openSub.email}>{openSub.email}</a> : ''],
              ['District', openSub.district],
              ['UTM source', openSub.utm.source || 'Direct'],
              openSub.utm.medium ? ['UTM medium', openSub.utm.medium] : null,
              openSub.utm.campaign ? ['UTM campaign', openSub.utm.campaign] : null,
              ...Object.entries(openSub.answers || {}).map(([k, v]) => [((subForm && subForm.fields.find((f) => f.key === k)) || {}).label || k, v]),
            ]} />
            {openSub.message ? <><h3 className="w2-sec">Message</h3><p className="fm-msg">{openSub.message}</p></> : null}
            <h3 className="w2-sec">History</h3>
            <ul className="w2-hist">
              {openSub.history.slice().reverse().map((h, i) => <li key={i}><span>{h.text}<small>{h.by} · {stamp(h.at)}</small></span></li>)}
            </ul>
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
