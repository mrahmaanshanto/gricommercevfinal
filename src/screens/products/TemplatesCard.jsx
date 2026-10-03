'use client';
// TemplatesCard — Catalog setup › Product templates (Nayeem's Product brief #1 › "19 Grid templates + Custom"): the
// shop's default template (business → category → product), the 20 templates, and the price-change limit above which
// a manager approves (productVersions.js). A template opens in a side panel with its groups and fields: Grid fields can
// be turned off, the shop adds its own fields (reused by every product on that template), and Custom is built from
// the shop's own fields only. The product form shows a template's key features and keeps the rest behind "View all".

import React, { useEffect, useState } from 'react';
import { Icon as __Icon } from '@/runtime/dc';
import { InfoTip as __InfoTip, Sheet as __Sheet, StatusBadge as __StatusBadge } from '@/components/ui';
import { toast as __toast, confirmDialog as __confirm } from '@/runtime/ui';
import { TEMPLATES, groupsOf, businessTemplate, setBusinessTemplate, CAP_LABEL, tplBy, fieldCount, categoriesUsing, templateExtras, hiddenKeys,
  FIELD_TYPES, FLAG_LABEL, fieldProblem, addTemplateField, removeTemplateField, setFieldFlag, setFieldHidden, resetTemplate } from '@/lib/productTemplates';
import { priceLimit, setPriceLimit } from '@/lib/productVersions';

const CSS = `
.tc-body{display:grid;gap:var(--space-3);font-size:var(--text-sm)}
.tc-row{display:flex;flex-wrap:wrap;align-items:flex-end;gap:var(--space-3)}
.tc-row label{display:flex;flex-direction:column;gap:6px;min-width:0}
.tc-row .gc-input{width:auto;min-width:220px}
.tc-row .tc-num{min-width:0;width:96px}
.tc-list{margin:0;padding:0;list-style:none;display:grid;grid-template-columns:repeat(2,minmax(0,1fr));column-gap:var(--space-4)}
.tc-list li{border-top:1px solid var(--border-subtle)}
.tc-list li:nth-child(-n+2){border-top:0}
.tc-item{display:grid;grid-template-columns:minmax(0,1fr) auto auto;align-items:center;gap:2px var(--space-2);width:100%;padding:var(--space-2) 0;border:0;background:none;text-align:left;font:inherit;color:inherit;cursor:pointer;min-height:44px}
.tc-item:hover .tc-name{color:var(--primary)}
.tc-item:focus-visible{outline:2px solid var(--primary);outline-offset:2px;border-radius:var(--radius-md)}
.tc-name{font-weight:var(--weight-medium);color:var(--text-heading);min-width:0}
.tc-meta{grid-column:1 / 2;font-size:var(--text-xs);color:var(--text-muted)}
.tc-item .tc-chev{grid-row:1 / 3;grid-column:3;color:var(--text-muted)}
.tc-item .tc-badge{grid-row:1 / 3;grid-column:2}
.tc-sheet{display:grid;gap:var(--space-4);font-size:var(--text-sm)}
.tc-facts{display:grid;gap:6px;margin:0}
.tc-facts div{display:grid;grid-template-columns:120px minmax(0,1fr);gap:var(--space-2)}
.tc-facts dt{color:var(--text-muted);font-size:var(--text-xs);padding-top:1px}
.tc-facts dd{margin:0}
.tc-group h3{margin:0 0 var(--space-1);font-size:var(--text-xs);font-weight:var(--weight-semibold);color:var(--text-muted);text-transform:uppercase;letter-spacing:.04em}
.tc-fields{margin:0;padding:0;list-style:none;border:1px solid var(--border-subtle);border-radius:var(--radius-lg)}
.tc-fields li{display:grid;grid-template-columns:minmax(0,1fr) auto;align-items:center;gap:2px var(--space-3);padding:var(--space-2) var(--space-3);border-top:1px solid var(--border-subtle)}
.tc-fields li:first-child{border-top:0}
.tc-fields li.is-off .tc-fl{color:var(--text-muted);text-decoration:line-through}
.tc-fl{font-weight:var(--weight-medium);color:var(--text-heading);min-width:0}
.tc-fs{grid-column:1 / 2;font-size:var(--text-xs);color:var(--text-muted)}
.tc-flags{display:inline-flex;flex-wrap:wrap;gap:4px;margin-left:var(--space-1)}
.tc-flag{font-size:var(--text-xs);color:var(--primary);background:var(--primary-50);border-radius:var(--radius-full);padding:0 6px;line-height:18px;font-weight:var(--weight-medium)}
.tc-ctl{grid-row:1 / 3;grid-column:2;display:flex;align-items:center;gap:var(--space-2)}
.tc-add{display:grid;gap:var(--space-2);padding:var(--space-3);border:1px dashed var(--border-strong);border-radius:var(--radius-lg)}
.tc-add__row{display:grid;grid-template-columns:minmax(0,2fr) minmax(0,1fr);gap:var(--space-2)}
.tc-add label{display:flex;flex-direction:column;gap:4px;min-width:0}
.tc-checks{display:flex;flex-wrap:wrap;gap:var(--space-3)}
.tc-checks label{flex-direction:row;align-items:center;gap:6px;font-size:var(--text-sm)}
.tc-err{margin:0;font-size:var(--text-xs);color:var(--error)}
.tc-foot{display:flex;justify-content:space-between;gap:var(--space-2);width:100%}
@media (max-width:640px){
  .tc-list{grid-template-columns:minmax(0,1fr)}
  .tc-list li:nth-child(2){border-top:1px solid var(--border-subtle)}
  .tc-row .gc-input:not(.tc-num){min-width:0;width:100%}
  .tc-row label{flex:1 1 100%}
  .tc-facts div{grid-template-columns:minmax(0,1fr)}
  .tc-add__row{grid-template-columns:minmax(0,1fr)}
}
`;

const EMPTY = { label: '', type: 'text', unit: '', options: '', key: true, filter: false, compare: false };

/** The short line under a field: type, unit or choices, and the template default. */
function fieldLine(fd) {
  const t = fd.t === 'select' ? 'List: ' + (fd.o || []).slice(0, 4).join(', ') + ((fd.o || []).length > 4 ? ' …' : '') : FIELD_TYPES[fd.t] || 'Text';
  return [t, fd.u && fd.t === 'number' ? 'in ' + fd.u : '', fd.d ? 'Default: ' + fd.d : ''].filter(Boolean).join(' · ');
}
const flagsOf = (fd) => Object.keys(FLAG_LABEL).filter((f) => fd[f]);

function TemplateSheet({ id, biz, onClose, onDefault }) {
  const [, setTick] = useState(0);
  const [form, setForm] = useState(EMPTY);
  const [err, setErr] = useState('');
  useEffect(() => { const on = () => setTick((n) => n + 1); window.addEventListener('gc:templates', on); return () => window.removeEventListener('gc:templates', on); }, []);
  useEffect(() => { setForm(EMPTY); setErr(''); }, [id]);
  const t = tplBy(id);
  const custom = id === 'custom';
  const groups = groupsOf(id, { all: true });
  const own = custom ? (groups[0] || { fields: [] }).fields : templateExtras(id);
  const off = hiddenKeys(id);
  const cats = categoriesUsing(id);
  const n = fieldCount(id);
  const changed = !custom && (own.length || off.length);
  const set = (k) => (e) => { const val = e.target.type === 'checkbox' ? e.target.checked : e.target.value; setForm((f) => ({ ...f, [k]: val })); setErr(''); };
  const add = (e) => {
    e.preventDefault();
    const p = fieldProblem(id, form);
    if (p) { setErr(p); return; }
    const fd = addTemplateField(id, form);
    setForm(EMPTY);
    __toast('“' + fd.l + '” added to ' + t.name);
  };
  const remove = async (fd) => {
    if (!(await __confirm({ title: 'Remove “' + fd.l + '”?', body: 'Products keep the values they have. Add the field again to see them.', confirmLabel: 'Remove', tone: 'danger' }))) return;
    removeTemplateField(id, fd.k);
    __toast('“' + fd.l + '” removed');
  };
  const reset = async () => {
    if (!(await __confirm({ title: 'Reset ' + t.name + '?', body: 'Your own fields are removed and every Grid field is shown again. Products keep their values.', confirmLabel: 'Reset' }))) return;
    resetTemplate(id);
    __toast(t.name + ' is back to the Grid template');
  };
  const isOwn = (fd) => custom || own.some((x) => x.k === fd.k);
  return (
    <__Sheet open title={t.no + '. ' + t.name} onClose={onClose}
      footer={<div className="tc-foot">
        {changed ? <button type="button" className="ix-btn" onClick={reset}>Reset to Grid template</button> : <span />}
        <span className="tc-row" style={{ alignItems: 'center' }}>
          {id === biz ? null : <button type="button" className="ix-btn" onClick={() => onDefault(id)}>Make shop default</button>}
          <button type="button" className="ix-btn ix-btn--primary" onClick={onClose}>Done</button>
        </span>
      </div>}>
      <div className="tc-sheet">
        <dl className="tc-facts">
          <div><dt>For</dt><dd>{t.who}</dd></div>
          <div><dt>Fields</dt><dd>{n.fields + ' in ' + n.groups + (n.groups === 1 ? ' group' : ' groups') + ' · ' + n.key + ' key features'}</dd></div>
          <div><dt>Turns on</dt><dd>{(t.caps || []).length ? t.caps.map((c) => CAP_LABEL[c]).join(', ') : 'Nothing extra'}</dd></div>
          <div><dt>Used by</dt><dd>{[id === biz ? 'Shop default' : '', cats.length ? cats.join(', ') : ''].filter(Boolean).join(' · ') || 'No category yet'}</dd></div>
        </dl>

        {groups.length && groups.some((g) => g.fields.length) ? groups.map((g) => (
          <section key={g.name} className="tc-group" aria-label={g.name}>
            <h3>{g.name}</h3>
            <ul className="tc-fields">
              {g.fields.map((fd) => (
                <li key={fd.k} className={fd.hidden ? 'is-off' : ''}>
                  <span className="tc-fl">{fd.l}{flagsOf(fd).length && !fd.hidden ? <span className="tc-flags">{flagsOf(fd).map((f) => <span key={f} className="tc-flag">{FLAG_LABEL[f]}</span>)}</span> : null}</span>
                  <span className="tc-fs">{fd.hidden ? 'Turned off · products keep their values' : fieldLine(fd)}</span>
                  <span className="tc-ctl">
                    {isOwn(fd) ? (
                      <>
                        <label className="tc-checks" style={{ fontSize: 'var(--text-xs)' }}><input type="checkbox" className="gc-check" checked={!!fd.key} onChange={(e) => setFieldFlag(id, fd.k, 'key', e.target.checked)} />Key</label>
                        <button type="button" className="ix-btn ix-btn--sm ix-btn--plain ix-btn--icon" aria-label={'Remove ' + fd.l} onClick={() => remove(fd)}><__Icon name="trash-2" width="16" height="16" aria-hidden="true" /></button>
                      </>
                    ) : (
                      <button type="button" role="switch" aria-checked={!fd.hidden} aria-label={(fd.hidden ? 'Show ' : 'Hide ') + fd.l} className="gc-switch" onClick={() => setFieldHidden(id, fd.k, !fd.hidden)}><span className="gc-switch__knob" /></button>
                    )}
                  </span>
                </li>
              ))}
            </ul>
          </section>
        )) : <p className="tc-fs" style={{ margin: 0 }}>No fields yet. Add the first one below.</p>}

        <form className="tc-add" onSubmit={add} aria-label="Add a field">
          <b style={{ fontWeight: 'var(--weight-medium)' }}>{custom ? 'Add a field' : 'Add your own field to ' + t.name}</b>
          <div className="tc-add__row">
            <label><span className="gc-label">Field name</span><input className="gc-input" value={form.label} onChange={set('label')} placeholder="e.g. Dealer model code" /></label>
            <label><span className="gc-label">Type</span>
              <select className="gc-input gc-select" value={form.type} onChange={set('type')}>{Object.entries(FIELD_TYPES).map(([k, l]) => <option key={k} value={k}>{l}</option>)}</select>
            </label>
          </div>
          {form.type === 'number' ? <label><span className="gc-label">Unit</span><input className="gc-input" value={form.unit} onChange={set('unit')} placeholder="e.g. kg, inch, months" /></label> : null}
          {form.type === 'select' ? <label><span className="gc-label">Choices, separated by commas</span><input className="gc-input" value={form.options} onChange={set('options')} placeholder="e.g. Small, Medium, Large" /></label> : null}
          <div className="tc-checks">
            <label><input type="checkbox" className="gc-check" checked={form.key} onChange={set('key')} />Key feature</label>
            <label><input type="checkbox" className="gc-check" checked={form.filter} onChange={set('filter')} />Filter</label>
            <label><input type="checkbox" className="gc-check" checked={form.compare} onChange={set('compare')} />Compare</label>
          </div>
          {err ? <p className="tc-err" role="alert">{err}</p> : null}
          <div><button type="submit" className="ix-btn ix-btn--sm"><__Icon name="plus" width="16" height="16" aria-hidden="true" />Add field</button></div>
        </form>
      </div>
    </__Sheet>
  );
}

export default function TemplatesCard() {
  const [biz, setBiz] = useState('general');
  const [limit, setLimit] = useState('20');
  const [open, setOpen] = useState('');
  const [ready, setReady] = useState(false);   // the shop's own fields live in this browser: count them after mounting
  const [, setTick] = useState(0);
  useEffect(() => {
    setBiz(businessTemplate()); setLimit(String(priceLimit())); setReady(true);
    const on = () => setTick((n) => n + 1);
    window.addEventListener('gc:templates', on);
    return () => window.removeEventListener('gc:templates', on);
  }, []);
  const makeDefault = (id) => { setBiz(id); setBusinessTemplate(id); __toast('New products start with ' + tplBy(id).name + ' unless their category has its own.'); };
  const pick = (e) => makeDefault(e.target.value);
  const saveLimit = () => { const n = Math.max(1, Math.round(Number(limit) || 20)); setPriceLimit(n); setLimit(String(n)); __toast('Price changes over ' + n + '% now need a manager.'); };
  return (
    <section className="ix-card" aria-labelledby="tc-h">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="ix-card__head"><h2 id="tc-h">Product templates</h2><__InfoTip text="A template decides which details a product shows. Your shop’s default applies first, a category can choose its own, and a product can choose again. Open a template to see its fields, turn fields off or add your own." /></div>
      <div className="ix-card__body tc-body">
        <div className="tc-row">
          <label><span className="gc-label">Shop default</span>
            <select className="gc-input gc-select" value={biz} onChange={pick}>{TEMPLATES.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}</select>
          </label>
          <label><span className="gc-label">Manager approves price changes over</span>
            <span className="tc-row" style={{ alignItems: 'center', gap: 'var(--space-2)' }}>
              <input className="gc-input tc-num" inputMode="numeric" value={limit} onChange={(e) => setLimit(e.target.value.replace(/\D/g, ''))} onBlur={saveLimit} aria-label="Price change limit in percent" />%
            </span>
          </label>
        </div>
        <ul className="tc-list" aria-label="Product templates">
          {TEMPLATES.map((t) => {
            const n = ready ? fieldCount(t.id) : { fields: t.groups.reduce((a, g) => a + g.fields.length, 0) };
            const caps = (t.caps || []).map((c) => CAP_LABEL[c]);
            return (
              <li key={t.id}>
                <button type="button" className="tc-item" aria-haspopup="dialog" onClick={() => setOpen(t.id)}>
                  <span className="tc-name">{t.no + '. ' + t.name}</span>
                  <span className="tc-meta">{(n.fields ? n.fields + ' fields' : 'Your own fields') + (caps.length ? ' · ' + caps.join(', ') : '')}</span>
                  {t.id === biz ? <span className="tc-badge"><__StatusBadge tone="info">Shop default</__StatusBadge></span> : null}
                  <__Icon name="chevron-right" width="16" height="16" aria-hidden="true" className="tc-chev" />
                </button>
              </li>
            );
          })}
        </ul>
      </div>
      {open ? <TemplateSheet id={open} biz={biz} onClose={() => setOpen('')} onDefault={(id) => makeDefault(id)} /> : null}
    </section>
  );
}
