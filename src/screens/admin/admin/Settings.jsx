'use client';
// Settings (/admin/settings) — GridCommerce's own company settings for the super admin:
//   Company            trading and legal name (Grid Technologies Limited), addresses, VAT / BIN, invoice prefix INV-YYYY-,
//                      currency BDT, time zone Asia/Dhaka, languages EN / BN
//   Billing defaults   trial, grace, read-only, adjustment approval threshold, archive — read from lib/platform
//                      (catalogue.js and db().settings); saving records the wish and its history, the platform's rules
//                      stay as they are
//   Notifications      who gets which internal alert, and how
//   Integration keys   masked; Regenerate (asks first) → toast
//   Data & privacy     retention, phone masking, Export all data → toast
//   Demo               Restart demo data (the account menu's action: resetDemo + resetAdminStores)
//   Settings history   who changed what
// One Save for Company, Billing defaults, Notifications and Data & privacy. Data: lib/admin/admin.js (saveSettings,
// regenerateKey, recordExport).

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Sheet, StatusBadge, InfoTip } from '@/components/ui';
import { ShopHeader } from '@/components/ui/IndexKit';
import { ago, dmy, yearOf } from '@/lib/platform/util';
import { resetDemo } from '@/lib/platform/store';
import { resetAdminStores } from '@/lib/admin/store';
import { ADMIN_ROLES } from '@/lib/admin/access';
import {
  CURRENCIES, TIMEZONES, LANGS, CHANNELS, platformDefaults, settingsErrors, settingsChanges, saveSettings, regenerateKey, recordExport,
} from '@/lib/admin/admin';
import { AdminShell } from '../AdminShell';
import { ADX_CSS, useAdmin, Skeleton, Field, CardHead, Note, SaveBar, Switch, clone } from './admShared';

const CSS = `
.st-sec{scroll-margin-top:80px}
.st-jump{display:flex;flex-wrap:wrap;gap:6px}
.st-jump a{display:inline-flex;align-items:center;min-height:32px;padding:0 12px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-card);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body);text-decoration:none}
.st-jump a:hover{border-color:var(--border-strong);color:var(--text-heading)}
.st-num{display:flex;align-items:center;gap:8px}
.st-num .gc-input{max-width:120px}
.st-rows{display:flex;flex-direction:column;margin:0;padding:0;list-style:none}
.st-rows>li{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:var(--space-3);padding:var(--space-3) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.st-rows>li:first-child{border-top:0}
.st-rows>li>span{display:flex;flex-direction:column;min-width:0;color:var(--text-heading)}
.st-rows small{font-size:var(--text-xs);color:var(--text-muted)}
.st-rows small.is-error{color:var(--text-danger)}
.st-keys>li{grid-template-columns:minmax(0,1fr) minmax(0,1fr) auto}
.st-mask{font-family:var(--font-data);font-size:var(--text-sm);letter-spacing:.02em;color:var(--text-body)}
.st-demo{display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:var(--space-3)}
.st-demo p{margin:0;font-size:var(--text-sm);color:var(--text-body)}
.st-checks{display:flex;flex-direction:column;gap:2px}
.st-checks label{display:flex;align-items:center;gap:10px;min-height:40px;font-size:var(--text-sm);color:var(--text-heading);cursor:pointer}
@media (max-width:640px){.st-keys>li{grid-template-columns:minmax(0,1fr)}.st-rows>li{grid-template-columns:auto minmax(0,1fr)}.st-rows>li>button{grid-column:2;justify-self:start}}
`;

const SECTIONS = [['st-company', 'Company'], ['st-billing', 'Billing defaults'], ['st-notify', 'Notifications'], ['st-keys', 'Integration keys'], ['st-privacy', 'Data & privacy'], ['st-demo', 'Demo'], ['st-history', 'History']];
const roleName = (r) => (ADMIN_ROLES[r] || {}).title || r;
const chanName = (c) => (CHANNELS.find((x) => x[0] === c) || [c, c])[1];

export default function Settings() {
  const { d, t, live, pdb } = useAdmin();
  const [s, setS] = useState(null);
  const [errs, setErrs] = useState({});
  const [edit, setEdit] = useState(null);   // notification being edited: { id, roles, channels }
  const [all, setAll] = useState(false);
  const saved = live ? d.settings : null;
  const dirty = !!(s && saved && settingsChanges(saved, s).length);
  useEffect(() => { if (live && (!s || !dirty)) setS(clone(d.settings)); }, [live, saved]); // eslint-disable-line react-hooks/exhaustive-deps

  if (!live || !s) {
    return <AdminShell active="settings" title="Settings"><style dangerouslySetInnerHTML={{ __html: ADX_CSS + CSS }} /><Skeleton label="Loading settings" /></AdminShell>;
  }

  const defaults = platformDefaults(pdb);
  const put = (sec, k, v) => { setS((x) => ({ ...x, [sec]: { ...x[sec], [k]: v } })); setErrs({}); };
  const co = s.company;
  const text = (k, label, opts = {}) => (
    <Field label={label} htmlFor={'st-' + k} error={errs[k]} help={opts.help} optional={opts.optional}>
      <input id={'st-' + k} className={'gc-input' + (opts.data ? ' adx-fig' : '') + (errs[k] ? ' gc-input--error' : '')} value={co[k]} placeholder={opts.placeholder} onChange={(e) => put('company', k, e.target.value)} />
    </Field>
  );
  const num = (k, label, unit) => {
    const now = defaults[k];
    const asked = +s.billing[k] !== +now;
    return (
      <Field label={label} htmlFor={'st-' + k} error={errs[k]} help={`Platform now: ${unit === '৳' ? '৳' + now : now + ' ' + unit}`}>
        <span className="st-num">
          <input id={'st-' + k} className={'gc-input adx-fig' + (errs[k] ? ' gc-input--error' : '')} inputMode="numeric" value={s.billing[k]}
            onChange={(e) => put('billing', k, e.target.value.replace(/[^\d]/g, '') === '' ? '' : +e.target.value.replace(/[^\d]/g, ''))} />
          <span className="ix-muted">{unit === '৳' ? 'taka' : unit}</span>
          {asked ? <StatusBadge tone="warning">Asked</StatusBadge> : null}
        </span>
      </Field>
    );
  };
  const toggleLang = (l) => put('company', 'langs', co.langs.includes(l) ? co.langs.filter((x) => x !== l) : [...co.langs, l]);
  const setNotify = (id, patch) => { setS((x) => ({ ...x, notify: x.notify.map((n) => (n.id === id ? { ...n, ...patch } : n)) })); setErrs({}); };

  const save = () => {
    const e = settingsErrors(s);
    if (Object.keys(e).length) { setErrs(e); toast(Object.values(e)[0], { tone: 'error' }); return; }
    const res = saveSettings(s);
    if (!res.ok) { toast(res.error, { tone: res.error === 'Nothing changed.' ? 'info' : 'error' }); return; }
    setErrs({});
    const billing = res.changes.some((c) => c[0] === 'Billing defaults');
    toast((res.changes.length === 1 ? 'Saved: ' + res.changes[0][1].replace(/ \(asked;.*\)$/, '') : res.changes.length + ' settings saved') + (billing ? '. Billing defaults are recorded; the platform keeps its rules until they change there.' : ''));
  };
  const discard = async () => {
    const n = settingsChanges(saved, s).length;
    if (n > 2 && !(await confirmDialog({ title: `Discard ${n} changes?`, body: 'The settings go back to what is saved.', confirmLabel: 'Discard', tone: 'danger' }))) return;
    setS(clone(saved)); setErrs({});
  };
  const regen = async (k) => {
    if (!(await confirmDialog({ title: `Regenerate the ${k.label} key?`, body: 'The old key stops working at once. Anything that uses it must get the new one.', confirmLabel: 'Regenerate', tone: 'danger' }))) return;
    const res = regenerateKey(k.id);
    toast(res.ok ? `${k.label}: new key ending ${res.key.last4} (demo: nothing is sent to the provider)` : res.error, res.ok ? {} : { tone: 'error' });
  };
  const exportAll = () => {
    if (d.settings.privacy.exportApproval) {
      recordExport('all data asked (merchants, billing, activity, settings) · waits for a second person');
      toast('Export asked · a second person approves it, then the download link comes by email');
    } else {
      recordExport('all data (merchants, billing, activity, settings) · ZIP');
      toast('Export started · the download link comes by email');
    }
  };
  const restart = async () => {
    if (!(await confirmDialog({ title: 'Restart the demo data?', body: 'Every store, bill, lead, setting and change made in this browser goes back to the demo. This can’t be undone.', confirmLabel: 'Restart', tone: 'danger' }))) return;
    resetDemo();
    resetAdminStores();
    toast('Demo data restarted');
  };
  const saveEdit = () => {
    if (!edit.roles.length || !edit.channels.length) { setEdit({ ...edit, error: 'Pick at least one role and one way to send it.' }); return; }
    setNotify(edit.id, { roles: edit.roles, channels: edit.channels });
    setEdit(null);
  };
  const flip = (list, x) => (list.includes(x) ? list.filter((y) => y !== x) : [...list, x]);

  const hist = all ? d.history : d.history.slice(0, 6);
  const year = yearOf(t);
  const prefixPreview = String(co.invoicePrefix || '').replace('YYYY', String(year)) + '0001';

  return (
    <AdminShell active="settings" title="Settings">
      <style dangerouslySetInnerHTML={{ __html: ADX_CSS + CSS }} />
      <div className="ix-page ix-page--narrow">
        <ShopHeader icon="settings" title="Settings"
          about="GridCommerce's own company details, the billing defaults it asks the platform for, who gets which internal alert, the keys for outside services, how long data is kept, and the demo data. Billing defaults are recorded here; the platform's rules change only on the platform."
          primary={{ label: 'Save', onClick: save, disabled: !dirty }} />

        <nav className="st-jump" aria-label="Sections">{SECTIONS.map(([id, l]) => <a key={id} href={'#' + id}>{l}</a>)}</nav>

        {/* ---- company ---- */}
        <section id="st-company" className="ix-card st-sec" aria-labelledby="st-company-h">
          <CardHead id="st-company-h" title="Company" tip={<InfoTip text="The legal name, address and BIN print on every GridCommerce invoice and receipt." />} />
          <div className="adx-body">
            <div className="adx-row">
              {text('brand', 'Trading name')}
              {text('legal', 'Legal name')}
            </div>
            <div className="adx-row">
              {text('regAddress', 'Registered address')}
              {text('office2', 'Second office', { optional: true })}
            </div>
            <div className="adx-row adx-row--3">
              {text('bin', 'VAT / BIN', { data: true, placeholder: '004561287-0102' })}
              {text('tradeLicence', 'Trade licence', { data: true, optional: true })}
              {text('phone', 'Phone', { data: true })}
            </div>
            <div className="adx-row">
              {text('email', 'Billing email')}
              {text('invoicePrefix', 'Invoice number prefix', { data: true, help: 'YYYY becomes the year. Next: ' + prefixPreview })}
            </div>
            <Field label="Invoice footer" htmlFor="st-footer">
              <textarea id="st-footer" className="gc-input adx-area" rows={2} value={co.invoiceFooter} onChange={(e) => put('company', 'invoiceFooter', e.target.value)} />
            </Field>
            <div className="adx-row adx-row--3">
              <Field label="Currency" htmlFor="st-cur">
                <select id="st-cur" className="gc-input gc-select" value={co.currency} onChange={(e) => put('company', 'currency', e.target.value)}>{CURRENCIES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </Field>
              <Field label="Time zone" htmlFor="st-tz">
                <select id="st-tz" className="gc-input gc-select" value={co.timezone} onChange={(e) => put('company', 'timezone', e.target.value)}>{TIMEZONES.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </Field>
              <Field label="Default language" htmlFor="st-dl" error={errs.defaultLang}>
                <select id="st-dl" className="gc-input gc-select" value={co.defaultLang} onChange={(e) => put('company', 'defaultLang', e.target.value)}>{LANGS.map(([v, l]) => <option key={v} value={v}>{l}</option>)}</select>
              </Field>
            </div>
            <div className="adx-field">
              <span className="gc-label">Languages</span>
              <div className="adx-chips" role="group" aria-label="Languages">{LANGS.map(([v, l]) => <button key={v} type="button" aria-pressed={co.langs.includes(v)} onClick={() => toggleLang(v)}>{l}</button>)}</div>
              {errs.langs ? <p className="gc-help gc-help--error" role="alert">{errs.langs}</p> : null}
            </div>
          </div>
        </section>

        {/* ---- billing defaults ---- */}
        <section id="st-billing" className="ix-card st-sec" aria-labelledby="st-billing-h">
          <CardHead id="st-billing-h" title="Billing defaults" />
          <div className="adx-body">
            <Note>The platform runs on its own rules (plan catalogue and platform settings). A change here is recorded as asked, with its history, until the platform is changed to match.</Note>
            <div className="adx-row">
              {num('trialDays', 'Free trial', 'days')}
              {num('graceDays', 'Grace after a bill is due', 'days')}
            </div>
            <div className="adx-row">
              {num('readOnlyDays', 'Read-only after', 'days overdue')}
              {num('archiveAfter', 'Archive a closed store after', 'days')}
            </div>
            <div className="adx-row">
              {num('adjThreshold', 'Credits and discounts above this need approval', '৳')}
            </div>
          </div>
        </section>

        {/* ---- notifications ---- */}
        <section id="st-notify" className="ix-card st-sec" aria-labelledby="st-notify-h">
          <CardHead id="st-notify-h" title="Notifications" tip={<InfoTip text="Internal alerts for GridCommerce staff. Merchants’ own notifications are set in each store." />} />
          <ul className="st-rows" aria-labelledby="st-notify-h">
            {s.notify.map((n) => (
              <li key={n.id}>
                <Switch on={n.on} label={n.label} onToggle={() => setNotify(n.id, { on: !n.on })} />
                <span>{n.label}<small className={errs['n-' + n.id] ? 'is-error' : ''}>{errs['n-' + n.id] || (n.on ? `${n.roles.map(roleName).join(', ')} · ${n.channels.map(chanName).join(', ')}` : 'Off')}</small></span>
                <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" disabled={!n.on} onClick={() => setEdit({ id: n.id, label: n.label, roles: [...n.roles], channels: [...n.channels], error: '' })}>Edit</button>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- keys ---- */}
        <section id="st-keys" className="ix-card st-sec" aria-labelledby="st-keys-h">
          <CardHead id="st-keys-h" title="Integration keys" tip={<InfoTip text="Keys are never shown in full. Regenerate one when a person who knew it leaves or it may have leaked." />} />
          <ul className="st-rows st-keys" aria-labelledby="st-keys-h">
            {d.keys.map((k) => (
              <li key={k.id}>
                <span>{k.label}<small>Changed {ago(k.at, t)} by {k.by}</small></span>
                <span className="st-mask" aria-label={`${k.label} key ending ${k.last4}`}>{k.prefix}••••••••{k.last4}</span>
                <button type="button" className="ix-btn ix-btn--sm" onClick={() => regen(k)}><Icon name="refresh-cw" width="16" height="16" aria-hidden="true" />Regenerate</button>
              </li>
            ))}
          </ul>
        </section>

        {/* ---- privacy ---- */}
        <section id="st-privacy" className="ix-card st-sec" aria-labelledby="st-privacy-h">
          <CardHead id="st-privacy-h" title="Data & privacy">
            <button type="button" className="ix-btn ix-btn--sm" onClick={exportAll}><Icon name="download" width="16" height="16" aria-hidden="true" />Export all data</button>
          </CardHead>
          <div className="adx-body">
            <div className="adx-row adx-row--3">
              <Field label="Keep the activity log" htmlFor="st-ay">
                <select id="st-ay" className="gc-input gc-select" value={s.privacy.activityYears} onChange={(e) => put('privacy', 'activityYears', +e.target.value)}>{[1, 2, 5, 7].map((n) => <option key={n} value={n}>{n === 1 ? '1 year' : n + ' years'}</option>)}</select>
              </Field>
              <Field label="Keep sign-in history" htmlFor="st-ld">
                <select id="st-ld" className="gc-input gc-select" value={s.privacy.loginDays} onChange={(e) => put('privacy', 'loginDays', +e.target.value)}>{[90, 180, 365].map((n) => <option key={n} value={n}>{n} days</option>)}</select>
              </Field>
              <Field label="Keep call recordings" htmlFor="st-cd">
                <select id="st-cd" className="gc-input gc-select" value={s.privacy.callDays} onChange={(e) => put('privacy', 'callDays', +e.target.value)}>{[30, 90, 180].map((n) => <option key={n} value={n}>{n} days</option>)}</select>
              </Field>
            </div>
            <div>
              <div className="adx-sw"><span>Mask merchant phone numbers in lists<small>The full number shows on the merchant’s page.</small></span><Switch on={s.privacy.maskPhones} label="Mask merchant phone numbers in lists" onToggle={() => put('privacy', 'maskPhones', !s.privacy.maskPhones)} /></div>
              <div className="adx-sw"><span>Exporting all data needs a second person</span><Switch on={s.privacy.exportApproval} label="Exporting all data needs a second person" onToggle={() => put('privacy', 'exportApproval', !s.privacy.exportApproval)} /></div>
            </div>
            <p className="ix-muted" style={{ margin: 0, fontSize: 'var(--text-xs)' }}>A closed store’s data is kept {defaults.archiveAfter} days before it may be archived (platform rule).</p>
          </div>
        </section>

        {/* ---- demo ---- */}
        <section id="st-demo" className="ix-card st-sec" aria-labelledby="st-demo-h">
          <CardHead id="st-demo-h" title="Demo" />
          <div className="adx-body st-demo">
            <p>Every figure here is demo data kept in this browser.</p>
            <button type="button" className="ix-btn ix-btn--danger" onClick={restart}><Icon name="rotate-ccw" width="16" height="16" aria-hidden="true" />Restart demo data</button>
          </div>
        </section>

        {/* ---- history ---- */}
        <section id="st-history" className="ix-card st-sec" aria-labelledby="st-history-h">
          <CardHead id="st-history-h" title="Settings history">
            {d.history.length > 6 ? <button type="button" className="ix-btn ix-btn--sm ix-btn--plain" onClick={() => setAll(!all)}>{all ? 'Show less' : 'Show all ' + d.history.length}</button> : null}
          </CardHead>
          {hist.length ? (
            <ul className="adx-list">
              {hist.map((h) => <li key={h.id}><Icon name="history" width="16" height="16" aria-hidden="true" style={{ marginTop: 2, color: 'var(--text-muted)' }} /><span>{h.what}<small>{h.section} · {h.by} · {ago(h.at, t)} ({dmy(h.at)})</small></span></li>)}
            </ul>
          ) : <p className="adx-body ix-muted" style={{ margin: 0 }}>No changes yet.</p>}
        </section>

        {dirty ? <SaveBar onSave={save} onDiscard={discard} /> : null}
      </div>

      <Sheet open={!!edit} title="Who gets this alert" onClose={() => setEdit(null)}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={() => setEdit(null)}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid" onClick={saveEdit}>Done</button>
        </>}>
        {edit ? (
          <div className="adx-form">
            <p>{edit.label}</p>
            <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
              <legend className="gc-label">Roles</legend>
              <div className="st-checks">
                {Object.keys(ADMIN_ROLES).map((r) => (
                  <label key={r}><input type="checkbox" className="gc-check" checked={edit.roles.includes(r)} onChange={() => setEdit({ ...edit, roles: flip(edit.roles, r), error: '' })} />{roleName(r)}</label>
                ))}
              </div>
            </fieldset>
            <fieldset style={{ margin: 0, padding: 0, border: 0 }}>
              <legend className="gc-label">Send by</legend>
              <div className="st-checks">
                {CHANNELS.map(([c, l]) => (
                  <label key={c}><input type="checkbox" className="gc-check" checked={edit.channels.includes(c)} onChange={() => setEdit({ ...edit, channels: flip(edit.channels, c), error: '' })} />{l}</label>
                ))}
              </div>
            </fieldset>
            {edit.error ? <p className="gc-help gc-help--error" role="alert">{edit.error}</p> : null}
            <p className="ix-muted" style={{ fontSize: 'var(--text-xs)' }}>Saved with the page’s Save.</p>
          </div>
        ) : null}
      </Sheet>
    </AdminShell>
  );
}
