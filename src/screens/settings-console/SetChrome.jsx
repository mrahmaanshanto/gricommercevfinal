'use client';
// Generated from design/templates/settings-console/SetChrome.dc.html by scripts/convert-design.mjs.
// SetChrome — the frame every settings screen sits in (Shopify's Settings: a settings list on the left, one narrow
// column of cards): the main menu, the page layout, and the form kit (fields, switches, save bar) the settings
// screens share.
// Edit freely: this file is now the source for the screen.

import React, { useEffect, useState } from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar } from '@/shell/Shell';
import { toast, confirmDialog } from '@/runtime/ui';
import { navigate } from '@/runtime/routes';
import { formatTime } from '@/lib/format';
import { Dialog as __Dialog, Sheet as __Sheet } from '@/components/ui';
import { readSettings, writeSettings, simulateOtherSave, SETTINGS_EVENT } from '@/lib/settingsStore';
import { logChanges, getHistory, whoNow, HISTORY_EVENT } from '@/lib/settingsHistory';

// ---- form logic shared by the settings screens -------------------------------------------------
// A screen declares `formId` and `fields = { name: { l: label, d: default, req, k: kind, risky } }`.
// `this.f` (passed to the markup as `v.f`) reads and writes the values, tracks what changed,
// validates on save, and moves focus to the first field that needs attention.
// Saving (Nayeem's brief #16):
//   · values are kept in lib/settingsStore.js with a version; a field someone else saved after the page opened raises
//     "This page changed since you opened it" (keep theirs, or save mine over it) instead of a silent overwrite;
//     ?conflict=1 makes another admin save this page a moment after it opens (demo)
//   · every saved change goes to lib/settingsHistory.js (who, when, old → new); History in the save bar shows them
//   · a field with `risky: { effects: [...] }` (currency, country, timezone) asks for the shop name before saving
//   · leaving the page (a link, the browser) with unsaved changes asks "Leave without saving?"
//   · ?focus=<field> (from the settings search) opens and highlights that field

const CHECKS = {
  email: (x) => (/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x) ? '' : 'Enter a valid email address, like name@shop.com.'),
  tel: (x) => (/^\+?[0-9][0-9\s-]{8,17}$/.test(x) ? '' : 'Enter a phone number with digits only, like +8801811843300.'),
  url: (x) => (/^https?:\/\/[^\s/]+(\/\S*[^\s/])?$/.test(x) ? '' : 'Enter the full address: it must start with https:// and must not end with a slash.'),
  num: (x) => (/^\d+(\.\d+)?$/.test(x.replace(/,/g, '')) ? '' : 'Enter a number using digits only, like 70 or 70.50.'),
  int: (x) => (/^\d+$/.test(x) ? '' : 'Enter a whole number, like 6.'),
};

export class SettingsLogic extends DCLogic {
  constructor(p) {
    super(p);
    this.state = { vals: {}, saved: {}, errs: {}, open: {}, savedAt: '', savedBy: '', version: 0, guard: null };
    this.off = {};
    this.formRef = React.createRef();
    const self = this;
    const def = (n) => (self.fields && self.fields[n]) || null;
    const base = (st, n) => (n in st.saved ? st.saved[n] : def(n) ? def(n).d : undefined);
    this.f = {
      id: (n) => 'sf-' + (self.formId || 'set') + '-' + n,
      def,
      get(n, fallback) {
        const st = self.state;
        if (n in st.vals) return st.vals[n];
        const b = base(st, n);
        return b === undefined ? fallback : b;
      },
      set(n, value) {
        self.setState((st) => {
          const vals = { ...st.vals };
          if (value === base(st, n)) delete vals[n]; else vals[n] = value;
          let errs = st.errs;
          if (errs[n]) { errs = { ...errs }; const e = self.check(n, value); if (e) errs[n] = e; else delete errs[n]; }
          return { vals, errs };
        });
      },
      on: (n) => (e) => self.f.set(n, e && e.target ? (e.target.type === 'checkbox' ? e.target.checked : e.target.value) : e),
      err: (n) => self.state.errs[n] || '',
      errCount: () => Object.keys(self.state.errs).length,
      count: () => Object.keys(self.state.vals).length,
      dirty: () => Object.keys(self.state.vals).length > 0,
      savedAt: () => self.state.savedAt,
      setOff(n, isOff) { self.off[n] = !!isOff; },
      submit(e) { if (e && e.preventDefault) e.preventDefault(); self.save(); },
      discard() {
        const before = self.state.vals;
        if (!Object.keys(before).length) return;
        self.setState({ vals: {}, errs: {} });
        toast('Changes discarded', { tone: 'info', undo: () => self.setState({ vals: before }) });
      },
      // disclosure sections: <button {...f.disc('id', openByDefault)}> + <div {...f.panel('id', openByDefault)}>
      isOpen(id, d) { const o = self.state.open; return id in o ? o[id] : !!d; },
      toggle(id, d) { self.setState((st) => ({ open: { ...st.open, [id]: !(id in st.open ? st.open[id] : !!d) } })); },
      disc: (id, d) => ({ type: 'button', 'aria-expanded': self.f.isOpen(id, d), 'aria-controls': self.f.id('panel-' + id), onClick: () => self.f.toggle(id, d) }),
      panel: (id, d) => ({ id: self.f.id('panel-' + id), hidden: !self.f.isOpen(id, d), 'data-disc': id }),
      // small real actions for the buttons around a field
      copy: (n, what) => () => {
        const text = String(def(n) ? self.f.get(n, '') : n);
        const done = () => toast((what || (def(n) ? def(n).l : 'Value')) + ' copied');
        if (typeof navigator !== 'undefined' && navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(text).then(done, () => toast('Could not copy. Select the text and copy it by hand.', { tone: 'error' }));
        else toast('Could not copy. Select the text and copy it by hand.', { tone: 'error' });
      },
      say: (message, tone) => () => toast(message, { tone: tone || 'info' }),
      focus: (n) => self.focusField(n),
      // save guards (rendered by SetSaveBar): risky change, version conflict; the page's history
      guard: () => self.state.guard,
      closeGuard: () => self.setState({ guard: null }),
      confirmRisk: () => { self.setState({ guard: null }); self.save({ riskOk: true }); },
      keepTheirs: () => self.keepTheirs(),
      saveMine: () => { self.setState({ guard: null }); self.save({ riskOk: true, force: true }); },
      formId: () => self.formId || 'set',
      savedBy: () => self.state.savedBy,
      shopName: () => String(readSettings('general').values.store_name || 'Dazzle Shop'),
    };
  }

  componentDidMount() {
    if (this.props.embedded) return;
    this._key = (e) => {
      if ((e.metaKey || e.ctrlKey) && String(e.key).toLowerCase() === 's' && this.fields && !this.noSave) {
        e.preventDefault();
        if (this.f.dirty()) this.save();
      }
    };
    document.addEventListener('keydown', this._key);
    if (!this.fields || this.noSave) return;
    this.loadSaved();
    // saved in another tab (another admin in the demo): reload what isn't being edited here
    this._sync = (e) => { if (!e || !e.detail || e.detail.formId === this.formId || e.type === 'storage') this.loadSaved(true); };
    window.addEventListener(SETTINGS_EVENT, this._sync);
    window.addEventListener('storage', this._sync);
    // leaving with unsaved changes: the browser asks on close / reload, links ask here
    this._unload = (e) => { if (this.f.dirty()) { e.preventDefault(); e.returnValue = ''; } };
    window.addEventListener('beforeunload', this._unload);
    this._leave = (e) => {
      if (!this.f.dirty() || e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
      const a = (e.composedPath ? e.composedPath() : [e.target]).find((el) => el && el.tagName === 'A' && el.getAttribute && el.getAttribute('href'));
      if (!a || a.target === '_blank' || a.hasAttribute('download')) return;
      const url = new URL(a.href, window.location.href);
      if (url.origin !== window.location.origin || (url.pathname === window.location.pathname && url.search === window.location.search)) return;
      e.preventDefault(); e.stopPropagation();
      confirmDialog({ title: 'Leave without saving?', body: 'Your changes on this page will be lost.', confirmLabel: 'Leave page', tone: 'danger' }).then((ok) => {
        if (!ok) return;
        this.setState({ vals: {}, errs: {} }, () => navigate(url.pathname + url.search + url.hash));
      });
    };
    document.addEventListener('click', this._leave, true);
    // from the settings search: open and highlight one field
    this._focus = (e) => { if (e.detail && this.fields[e.detail]) this.highlight(e.detail); };
    window.addEventListener('gc:set-focus', this._focus);
    try {
      const q = new URLSearchParams(window.location.search);
      const focus = q.get('focus');
      if (focus && this.fields[focus]) setTimeout(() => this.highlight(focus), 250);
      // demo: another admin saves this page a few seconds after it opens
      if (q.get('conflict') === '1') this._conflictT = setTimeout(() => this.otherAdminSaves(), 4000);
    } catch { /* ignore */ }
  }

  componentWillUnmount() {
    if (this._key) document.removeEventListener('keydown', this._key);
    if (this._sync) { window.removeEventListener(SETTINGS_EVENT, this._sync); window.removeEventListener('storage', this._sync); }
    if (this._unload) window.removeEventListener('beforeunload', this._unload);
    if (this._leave) document.removeEventListener('click', this._leave, true);
    if (this._focus) window.removeEventListener('gc:set-focus', this._focus);
    clearTimeout(this._conflictT);
  }

  /** Read the saved values (and their version). `quiet`: a save elsewhere; keep what is being edited here. */
  loadSaved(quiet) {
    const rec = readSettings(this.formId || 'set');
    const known = Object.fromEntries(Object.entries(rec.values).filter(([n]) => this.fields[n]));
    this.setState((st) => {
      if (quiet && rec.version === st.version) return null;
      const vals = { ...st.vals };
      Object.keys(vals).forEach((n) => { if (n in known && vals[n] === known[n]) delete vals[n]; });
      // a quiet reload keeps the version this page started from, so a save over someone else's change is caught
      return { saved: { ...st.saved, ...known }, vals, ...(quiet ? {} : { version: rec.version }), savedAt: rec.savedAt ? formatTime(new Date(rec.savedAt)) : st.savedAt, savedBy: rec.savedBy || st.savedBy };
    });
  }

  /** Open and highlight one field (from the settings search). */
  highlight(n) {
    this.focusField(n);
    setTimeout(() => {
      const el = document.getElementById(this.f.id(n));
      const box = el && (el.closest('.set-box') || el.closest('label') || el);
      if (!box) return;
      box.setAttribute('data-set-hl', '');
      setTimeout(() => box.removeAttribute('data-set-hl'), 2600);
    }, 60);
  }

  /** Demo (?conflict=1): another admin changes the first text field of this page. */
  otherAdminSaves() {
    const n = Object.keys(this.fields).find((k) => typeof this.fields[k].d === 'string' && !this.fields[k].k);
    if (!n) return;
    const base = n in this.state.saved ? this.state.saved[n] : this.fields[n].d;
    const who = 'Tanvir Hossain (CTO)';
    simulateOtherSave(this.formId, { [n]: String(base).trim() + ' (updated)' }, who);
    toast(who + ' saved ' + this.fields[n].l + ' on this page', { tone: 'info' });
  }

  /** The conflict dialog's "Keep their changes": take the saved values, drop mine for the fields they saved. */
  keepTheirs() {
    const g = this.state.guard || {};
    const rec = readSettings(this.formId || 'set');
    this.setState((st) => {
      const vals = { ...st.vals };
      (g.fields || []).forEach((n) => { delete vals[n]; });
      return { guard: null, vals, saved: { ...st.saved, ...rec.values }, version: rec.version, savedAt: rec.savedAt ? formatTime(new Date(rec.savedAt)) : st.savedAt, savedBy: rec.savedBy };
    });
    toast('Their changes are on the page now');
  }

  /** The error for one field, or '' when it is fine. */
  check(n, value) {
    const d = this.fields && this.fields[n];
    if (!d || this.off[n]) return '';
    if (typeof value === 'boolean') return '';
    const x = String(value == null ? '' : value).trim();
    const req = typeof d.req === 'function' ? d.req(this.f) : d.req;
    if (!x) return req ? d.l + ' is required.' : '';
    if (d.k && CHECKS[d.k]) { const e = CHECKS[d.k](x); if (e) return e; }
    if (d.check) return d.check(x, this.f) || '';
    return '';
  }

  focusField(n) {
    const find = () => (typeof document === 'undefined' ? null : document.getElementById(this.f.id(n)));
    const el = find();
    if (!el) return;
    // a field inside a closed section: open the section first
    const open = {};
    for (let p = el.closest('[data-disc]'); p; p = p.parentElement && p.parentElement.closest('[data-disc]')) if (p.hidden) open[p.getAttribute('data-disc')] = true;
    const go = () => { const t = find(); if (t) { t.focus({ preventScroll: true }); t.scrollIntoView({ block: 'center', behavior: 'auto' }); } };
    if (Object.keys(open).length) this.setState((st) => ({ open: { ...st.open, ...open } }), () => setTimeout(go, 30));
    else go();
  }

  save(opts = {}) {
    const errs = {};
    for (const n of Object.keys(this.fields || {})) { const e = this.check(n, this.f.get(n, '')); if (e) errs[n] = e; }
    const bad = Object.keys(errs);
    if (bad.length) {
      this.setState({ errs }, () => this.focusField(bad[0]));
      toast('Could not save. ' + bad.length + (bad.length === 1 ? ' field needs' : ' fields need') + ' attention.', { tone: 'error' });
      return false;
    }
    if (!this.f.dirty()) return true;
    const vals = { ...this.state.vals };
    const before = (n) => (n in this.state.saved ? this.state.saved[n] : this.fields[n] ? this.fields[n].d : undefined);
    // currency, country, timezone: explain what changes and ask for the shop name first
    const risky = Object.keys(vals).filter((n) => this.fields[n] && this.fields[n].risky);
    if (risky.length && !opts.riskOk) {
      this.setState({ guard: { kind: 'risk', fields: risky.map((n) => ({ n, l: this.fields[n].l, from: before(n), to: vals[n], effects: this.fields[n].risky.effects || [] })) } });
      return false;
    }
    if (!this.noStore && !this.props.embedded) {
      const by = whoNow();
      const res = writeSettings(this.formId || 'set', vals, { baseVersion: this.state.version, by, force: !!opts.force });
      if (res.conflict) {
        const c = res.conflict;
        this.setState({ guard: { kind: 'conflict', by: c.savedBy, at: c.savedAt, fields: c.fields, rows: c.fields.map((n) => ({ n, l: (this.fields[n] || {}).l || n, theirs: c.values[n], mine: vals[n] })) } });
        return false;
      }
      logChanges({ formId: this.formId || 'set', changes: Object.keys(vals).map((n) => ({ field: n, label: (this.fields[n] || {}).l || n, from: before(n), to: vals[n], secret: (this.fields[n] || {}).k === 'secret' })) });
      this.setState({ version: res.version, savedBy: by });
    }
    this.setState((st) => ({ saved: { ...st.saved, ...vals }, vals: {}, errs: {}, savedAt: formatTime(new Date()) }));
    if (this.afterSave) this.afterSave(vals);
    toast(this.savedMessage || 'Settings saved');
    return true;
  }
}

// ---- form controls ------------------------------------------------------------------------------

/** The control inside a field box: <input>, <select> or <textarea>, bound to the screen's form. */
export function SetIn({ f, n, labelled, desc, opts, dis, rows, className, ...rest }) {
  const d = f.def(n) || { l: n, d: '' };
  f.setOff(n, dis);
  const err = dis ? '' : f.err(n);
  const id = f.id(n);
  const value = f.get(n, '');
  const common = {
    id, name: n, value: value == null ? '' : value, onChange: f.on(n), disabled: dis || undefined,
    className: 'set-in' + (className ? ' ' + className : ''),
    'aria-label': labelled ? undefined : d.l,
    'aria-required': (typeof d.req === 'function' ? d.req(f) : d.req) ? 'true' : undefined,
    'aria-invalid': err ? 'true' : undefined,
    'aria-describedby': [desc ? id + '-help' : '', err ? id + '-err' : ''].filter(Boolean).join(' ') || undefined,
    ...rest,
  };
  if (opts) {
    const list = opts.includes(value) ? opts : [value, ...opts];
    return <select {...common}>{list.map((o) => <option key={o} value={o}>{o}</option>)}</select>;
  }
  if (d.k === 'area') return <textarea {...common} rows={rows || 3} className={common.className + ' set-in--area'} />;
  const type = d.k === 'email' ? 'email' : d.k === 'tel' ? 'tel' : d.k === 'url' ? 'url' : d.k === 'time' ? 'time' : 'text';
  const mode = d.k === 'num' ? 'decimal' : d.k === 'int' ? 'numeric' : undefined;
  return <input {...common} type={type} inputMode={mode} autoComplete="off" />;
}

/** The message under a field. Shown only after a save attempt found a problem with it. */
export function SetErr({ f, n }) {
  const err = f.err(n);
  if (!err) return null;
  return (
    <span id={f.id(n) + '-err'} role="alert" className="set-err">
      <__Icon name="circle-alert" strokeWidth="1.75" width="14" height="14" aria-hidden="true" />{err}
    </span>
  );
}

/** On/off switch. */
export function SetSw({ f, n, l, dis }) {
  const d = f.def(n) || { l: l || n };
  const on = !!f.get(n, false);
  return (
    <button type="button" role="switch" id={f.id(n)} className="set-sw" aria-checked={on} aria-label={l || d.l} disabled={dis || undefined} onClick={() => f.set(n, !on)}>
      <span aria-hidden="true" />
    </button>
  );
}

/** A small either/or choice. `opts` are strings or { v, icon }. */
export function SetSeg({ f, n, opts, tone }) {
  const d = f.def(n) || { l: n };
  const value = f.get(n, '');
  return (
    <span role="group" aria-label={d.l} className={'set-seg' + (tone ? ' set-seg--' + tone : '')}>
      {opts.map((o) => {
        const val = typeof o === 'string' ? o : o.v;
        return (
          <button key={val} type="button" aria-pressed={value === val} onClick={() => f.set(n, val)}>
            {o.icon ? <__Icon name={o.icon} strokeWidth="1.75" width="14" height="14" aria-hidden="true" /> : null}{val}
          </button>
        );
      })}
    </span>
  );
}

/** A tick box drawn as a card (title + description) or, with `chip`, as a compact pill. */
export function SetChk({ f, n, title, desc, chip, dis }) {
  const on = !!f.get(n, false);
  return (
    <label className={'set-chk' + (chip ? ' set-chk--chip' : '')} data-on={on ? 'true' : 'false'}>
      <input type="checkbox" className="sr-only" checked={on} disabled={dis || undefined} onChange={f.on(n)} />
      <span className="set-chk__box" aria-hidden="true">{on ? <__Icon name="check" strokeWidth="2" width={chip ? 10 : 12} height={chip ? 10 : 12} /> : null}</span>
      {chip ? title : (
        <span style={{ display: 'block', flex: '1', minWidth: '0' }}>
          <span className="set-chk__title">{title}</span>
          {desc ? <span className="set-chk__desc">{desc}</span> : null}
        </span>
      )}
    </label>
  );
}

/** One card in a pick-one group (storage driver, AI model). The children are the card's content. */
export function SetPick({ f, n, val, children, style }) {
  const on = f.get(n, '') === val;
  return (
    <label className="set-pick" data-on={on ? 'true' : 'false'} style={style}>
      <input type="radio" className="sr-only" name={f.id(n)} checked={on} onChange={() => f.set(n, val)} />
      {children}
    </label>
  );
}

/** The save bar. It is a quiet status line until something changes; then it sticks to the bottom. */
/**
 * Field tips: help under each field is hidden until asked for (UI/UX audit: descriptions only where they prevent an
 * error). Help that prevents a mistake (`set-help--keep`: formats, limits, keys, backups, what customers see) always
 * shows. The choice is kept in this browser and marked on <html data-set-tips>.
 */
export function SetTips() {
  const [on, setOn] = useState(false);
  useEffect(() => { try { setOn(window.localStorage.getItem('gc.set.tips') === '1'); } catch { /* ignore */ } }, []);
  useEffect(() => { document.documentElement.toggleAttribute('data-set-tips', on); }, [on]);
  const flip = () => { const n = !on; setOn(n); try { window.localStorage.setItem('gc.set.tips', n ? '1' : '0'); } catch { /* ignore */ } };
  return (
    <button type="button" className="set-tips" aria-pressed={on} onClick={flip}>
      <__Icon name="info" width="14" height="14" aria-hidden="true" />{on ? 'Hide field tips' : 'Show field tips'}
    </button>
  );
}

export function SetSaveBar({ f, note }) {
  const [hist, setHist] = useState(false);
  const dirty = f.dirty();
  const changed = f.count();
  const errors = f.errCount();
  const at = f.savedAt();
  const by = f.savedBy ? f.savedBy() : '';
  let status;
  if (errors) status = <><span className="set-bar__dot set-bar__dot--bad"><__Icon name="triangle-alert" strokeWidth="1.75" width="13" height="13" aria-hidden="true" /></span>{'Could not save: ' + errors + (errors === 1 ? ' field needs' : ' fields need') + ' attention'}</>;
  else if (dirty) status = <><span className="set-bar__dot"><__Icon name="pencil" strokeWidth="1.75" width="13" height="13" aria-hidden="true" /></span>{changed + (changed === 1 ? ' unsaved change' : ' unsaved changes')}</>;
  else status = <><__Icon name="circle-check" strokeWidth="1.75" width="16" height="16" aria-hidden="true" style={{ color: 'var(--text-success)' }} />All changes saved<span className="set-bar__note">{at ? '· ' + at + ' by ' + (by || 'you') : note || ''}</span></>;
  return (
    <div className="set-bar" data-dirty={dirty ? 'true' : 'false'}>
      <span className="set-bar__status" role="status">{status}</span>
      {f.formId ? <button type="button" className="set-bar__hist" onClick={() => setHist(true)}><__Icon name="history" width="14" height="14" aria-hidden="true" />History</button> : null}
      <span style={{ flex: '1' }} />
      {dirty ? <span className="set-bar__hint">Ctrl or ⌘ + S also saves</span> : null}
      <button type="button" className="ix-btn set-bar__discard" aria-disabled={dirty ? undefined : 'true'} onClick={dirty ? f.discard : undefined}>Discard</button>
      <button type="submit" className="ix-btn ix-btn--primary set-bar__save" aria-disabled={dirty ? undefined : 'true'}>Save changes</button>
      {f.guard ? <SetGuards f={f} /> : null}
      {f.formId ? <SetHistorySheet formId={f.formId()} open={hist} onClose={() => setHist(false)} /> : null}
    </div>
  );
}

/** The dialogs a save can stop at: a risky change (type the shop name) or a version conflict. */
function SetGuards({ f }) {
  const g = f.guard();
  const [typed, setTyped] = useState('');
  useEffect(() => { setTyped(''); }, [g && g.kind]);
  if (!g) return null;
  if (g.kind === 'risk') {
    const name = f.shopName();
    const ok = typed.trim().toLowerCase() === name.trim().toLowerCase();
    return (
      <__Dialog open title={g.fields.length === 1 ? 'Change ' + g.fields[0].l.toLowerCase() + '?' : 'Change these settings?'} onClose={f.closeGuard}
        footer={<>
          <button type="button" className="gc-btn gc-btn--neutral" onClick={f.closeGuard}>Cancel</button>
          <button type="button" className="gc-btn gc-btn--solid gc-btn--error" disabled={!ok} onClick={ok ? f.confirmRisk : undefined}>Change and save</button>
        </>}>
        <div className="set-guard">
          {g.fields.map((x) => (
            <div key={x.n} className="set-guard__item">
              <p className="set-guard__change"><b>{x.l}</b><span>{String(x.from || '—')}</span><__Icon name="arrow-right" width="14" height="14" aria-hidden="true" /><span>{String(x.to || '—')}</span></p>
              <ul className="set-guard__list">{x.effects.map((t) => <li key={t}>{t}</li>)}</ul>
            </div>
          ))}
          <label className="set-guard__type">
            <span>Type <b>{name}</b> to confirm</span>
            <input className="gc-input" value={typed} autoComplete="off" data-autofocus onChange={(e) => setTyped(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (ok) f.confirmRisk(); } }} />
          </label>
        </div>
      </__Dialog>
    );
  }
  const when = g.at ? formatTime(new Date(g.at)) : '';
  return (
    <__Dialog open title="This page changed since you opened it" onClose={f.closeGuard}
      footer={<>
        <button type="button" className="gc-btn gc-btn--neutral" onClick={f.keepTheirs}>Keep their changes</button>
        <button type="button" className="gc-btn gc-btn--solid" onClick={f.saveMine}>Save mine over theirs</button>
      </>}>
      <div className="set-guard">
        <p className="set-guard__note">{(g.by || 'Someone') + (when ? ' saved at ' + when : ' saved this page') + '. You both changed:'}</p>
        <table className="set-guard__table">
          <thead><tr><th scope="col">Setting</th><th scope="col">Theirs</th><th scope="col">Yours</th></tr></thead>
          <tbody>{g.rows.map((r) => <tr key={r.n}><th scope="row">{r.l}</th><td>{fmtVal(r.theirs)}</td><td>{fmtVal(r.mine)}</td></tr>)}</tbody>
        </table>
      </div>
    </__Dialog>
  );
}
const fmtVal = (v) => (v === true ? 'On' : v === false ? 'Off' : v == null || v === '' ? '—' : String(v).length > 60 ? String(v).slice(0, 57) + '…' : String(v));

/** This page's change history in a side panel. */
export function SetHistorySheet({ formId, open, onClose }) {
  const [rows, setRows] = useState([]);
  useEffect(() => {
    if (!open) return undefined;
    const read = () => setRows(getHistory({ formId, limit: 60 }));
    read();
    window.addEventListener(HISTORY_EVENT, read);
    return () => window.removeEventListener(HISTORY_EVENT, read);
  }, [open, formId]);
  return (
    <__Sheet open={open} title="Change history" onClose={onClose}>
      {rows.length ? (
        <ol className="set-hist">
          {rows.map((r) => (
            <li key={r.id} className="set-hist__row">
              <span className="set-hist__what"><b>{r.label}</b><span>{r.from}</span><__Icon name="arrow-right" width="12" height="12" aria-hidden="true" /><span>{r.to}</span></span>
              <span className="set-hist__who">{r.by} · {formatTime(new Date(r.at))} · {new Date(r.at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</span>
            </li>
          ))}
        </ol>
      ) : <p className="set-hist__empty">No changes saved on this page yet.</p>}
      <__Link className="set-hist__all" href="/settings-history">All settings history</__Link>
    </__Sheet>
  );
}

/** A layout part of Settings (main menu, section menu, top bar) opened on its own, as the design boards do.
 *  On a wide window it shows the part; on a phone, where the part alone is blank or meaningless, it says
 *  what it is and links to Settings. */
const FRAG_CSS = `
.set-frag,.set-frag__part{display:contents}
.set-frag__note{display:none}
@media (max-width:767px){
  .set-frag__part{display:none}
  .set-frag__note{display:flex;flex-direction:column;align-items:flex-start;gap:var(--space-3);min-height:100dvh;padding:var(--space-8) var(--space-4);background:var(--surface-page,#f8fafc);font-family:var(--font-sans);color:var(--text-muted);box-sizing:border-box}
  .set-frag__title{margin:0;font-size:var(--text-xl);line-height:var(--text-xl-lh);font-weight:var(--weight-semibold);color:var(--text-heading,#0f172a)}
  .set-frag__body{margin:0;max-width:44ch;font-size:var(--text-sm);line-height:20px}
  .set-frag__link{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border-radius:var(--radius-lg);background:#003087;color:#fff;font-size:var(--text-sm);font-weight:var(--weight-medium);text-decoration:none}
}`;
export function SetFragment({ name, children }) {
  return (
    <div className="set-frag">
      <style dangerouslySetInnerHTML={{ __html: FRAG_CSS }} />
      <div className="set-frag__part">{children}</div>
      <div className="set-frag__note">
        <h1 className="set-frag__title">{name}</h1>
        <p className="set-frag__body">This is a layout part of Settings, shown on its own for the design boards. Open Settings to use it.</p>
        <__Link className="set-frag__link" href="/set-general">Open Settings<__Icon name="arrow-right" strokeWidth="1.75" width="16" height="16" aria-hidden="true" /></__Link>
      </div>
    </div>
  );
}

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic { renderVals() { return {}; } }

// ---- styles ----
// Settings look like Shopify's Settings (docs/shopify-style.md): the app frame (main menu, top bar), the settings
// list on the left, and one narrow column of cards (ix-card) with a sticky save bar.
//   >= 1024  main menu · settings list · cards
//   <  1024  main menu in the top bar's drawer · settings list as a scrolling strip · cards
//   <   768  edge to edge, single column

const CSS = `
.set-shell{display:flex;gap:var(--shell-inset);width:100%;min-height:var(--set-vh,100dvh);padding:var(--shell-inset);background:var(--surface-desk);font-family:var(--font-sans);color:var(--text-body);box-sizing:border-box}
.set-shell *,.set-shell *::before,.set-shell *::after{box-sizing:border-box}
.set-shell__rail{flex:none;display:flex}
.set-shell__main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:clip;border:1px solid var(--border-subtle);border-radius:var(--radius-2xl);background:var(--surface-page)}
.set-shell__body{flex:1;min-width:0;display:flex;align-items:stretch}
.set-shell__col{flex:1;min-width:0;margin:0;display:flex;flex-direction:column;container-type:inline-size;container-name:setcol}
.set-content{flex:1;min-width:0;display:flex;align-items:flex-start;justify-content:center;gap:var(--space-4);padding:20px 24px 32px}
.set-main{flex:1;min-width:0;max-width:840px;display:flex;flex-direction:column;gap:var(--space-4)}
html:not([data-set-tips]) .set-main .set-help:not(.set-help--keep){display:none}
.set-tips{display:inline-flex;align-items:center;gap:6px;min-height:24px;padding:0;border:0;background:none;font:inherit;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-link);cursor:pointer}
@media (max-width:640px){.set-tips{min-height:36px}}
.set-tips:hover{text-decoration:underline}
/* the title row: the page title (20px) with "Show field tips" under it, the page's status on the right */
.set-pagehead{display:flex;flex-wrap:wrap;align-items:flex-start;gap:var(--space-2) var(--space-4)}
.set-pagehead__text{display:flex;flex-direction:column;align-items:flex-start;gap:2px;min-width:0}
.set-pagehead .ix-head__title{flex:none}
.set-main>header{flex-wrap:wrap}
.set-main>section{min-width:0;max-width:100%}
.set-main section[id]{scroll-margin-top:calc(var(--header-height,64px) + 16px)}
/* a card: the title row (an h2 and its count or actions), then the fields */
.set-head{display:flex;align-items:center;gap:var(--space-3);min-height:44px;padding:var(--space-3) var(--space-4) 0}
.set-head--top{align-items:flex-start}
.set-title{margin:0;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading)}
.set-side{position:sticky;top:calc(var(--header-height,64px) + 16px)}
@container setcol (max-width:1099px){
  .set-content:has(.set-side){flex-direction:column;align-items:stretch}
  .set-content:has(.set-side) .set-main{max-width:none}
  .set-side{position:static!important;width:100%!important;max-width:none!important}
}
@container setcol (max-width:759px){
  .set-split{grid-template-columns:minmax(0,1fr)!important}
  .set-shell .gc-cols-4{grid-template-columns:repeat(2,minmax(0,1fr))!important}
  .set-main>section{overflow-x:auto}
}
@container setcol (max-width:559px){
  .set-shell .gc-cols-2,.set-shell .gc-cols-3{grid-template-columns:minmax(0,1fr)!important}
  .set-wrap{flex-wrap:wrap!important}
  .set-wrap>*{max-width:100%}
}
@media (max-width:1023px){
  .set-shell{gap:0}
  .set-shell__body{flex-direction:column}
  .set-shell__main{border-radius:var(--radius-lg)}
}
@media (max-width:767px){
  .set-shell{padding:0}
  .set-shell__main{border:0;border-radius:0}
  .set-content{padding:16px}
}

/* fields */
.set-box{min-width:0;max-width:100%;transition:border-color .15s,box-shadow .15s}
.set-box:focus-within{border-color:#003087!important;box-shadow:0 0 0 3px rgba(0,48,135,.14)}
.set-box:has(.set-in[aria-invalid="true"]){border-color:var(--text-danger,#c2380f)!important}
.set-box:has(.set-in[aria-invalid="true"]):focus-within{box-shadow:0 0 0 3px rgba(194,56,15,.16)}
.set-box:has(.set-in:disabled){background:#f1f5f9!important;border-color:#e2e8f0!important}
.set-in{flex:1;min-width:0;width:100%;height:100%;margin:0;padding:0;border:0;outline:0;background:transparent;color:inherit;font:inherit;letter-spacing:inherit;font-variant-numeric:inherit;text-overflow:ellipsis}
.set-in:disabled{color:var(--text-muted);cursor:not-allowed}
.set-in::placeholder{color:var(--text-muted)}
select.set-in{appearance:none;-webkit-appearance:none;padding-right:26px;margin-right:-24px;cursor:pointer}
select.set-in~svg{flex:none;pointer-events:none}
textarea.set-in{display:block;height:auto;min-height:60px;line-height:20px;resize:vertical}
input[type="time"].set-in{min-width:96px}
.set-err{display:flex;align-items:flex-start;gap:6px;font-size:var(--text-xs);line-height:17px;color:var(--text-danger,#c2380f)}
.set-err>svg{flex:none;margin-top:1px}
.set-req{color:var(--text-danger,#c2380f)}

.set-sw{position:relative;flex:none;display:inline-flex;align-items:center;justify-content:flex-start;width:38px;height:22px;margin:0;padding:2px;border:0;border-radius:var(--radius-full);background:#64748b;cursor:pointer;transition:background-color .15s}
.set-sw::after{content:"";position:absolute;inset:-7px -3px}
.set-sw>span{width:18px;height:18px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 2px 0 rgba(15,23,42,.3);transition:transform .15s}
.set-sw[aria-checked="true"]{background:#003087}
.set-sw[aria-checked="true"]>span{transform:translateX(16px)}
.set-sw:disabled{opacity:.55;cursor:not-allowed}
.set-sw:focus-visible,.set-seg button:focus-visible,.set-disc:focus-visible{outline:3px solid var(--focus-ring,rgba(0,48,135,.5));outline-offset:2px}
@media (prefers-reduced-motion:reduce){.set-sw,.set-sw>span,.set-box{transition:none}}

.set-seg{flex:none;display:inline-flex;align-items:center;gap:2px;height:32px;padding:3px;border:1px solid #e2e8f0;border-radius:var(--radius-lg);background:#f8fafc}
.set-seg button{display:inline-flex;align-items:center;gap:6px;height:24px;padding:0 10px;border:0;border-radius:var(--radius-md);background:none;font-size:var(--text-xs);color:var(--text-muted);cursor:pointer;white-space:nowrap}
.set-seg button[aria-pressed="true"]{background:#fff;font-weight:var(--weight-medium);color:#1e293b;box-shadow:0 1px 2px 0 rgba(48,46,56,.1)}
.set-seg--warn{background:#fff}
.set-seg--warn button[aria-pressed="true"]{background:#8a5200;color:#fff;box-shadow:none}

.set-chk{display:flex;align-items:flex-start;gap:9px;flex:1;min-width:0;padding:10px 12px;border:1px solid #e2e8f0;border-radius:var(--radius-lg);background:#fff;cursor:pointer}
.set-chk[data-on="true"]{border-color:#003087;background:rgba(0,48,135,.05)}
.set-chk:focus-within{outline:3px solid var(--focus-ring,rgba(0,48,135,.5));outline-offset:2px}
.set-chk__box{display:grid;place-items:center;width:16px;height:16px;flex:none;margin-top:1px;border:1.5px solid #64748b;border-radius:var(--radius-sm);background:#fff;color:#fff}
.set-chk[data-on="true"] .set-chk__box{border-color:#003087;background:#003087}
.set-chk__title{display:block;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:#1e293b}
.set-chk__desc{display:block;padding-top:2px;font-size:var(--text-xs);line-height:16px;color:var(--text-muted)}
.set-chk--chip{display:inline-flex;align-items:center;flex:none;gap:7px;height:30px;padding:0 10px;font-size:var(--text-xs);color:#475569}
.set-chk--chip[data-on="true"]{background:rgba(0,48,135,.06);font-weight:var(--weight-medium);color:#003087}
.set-chk--chip .set-chk__box{width:14px;height:14px;margin-top:0}

.set-pick{cursor:pointer}
.set-pick:focus-within{outline:3px solid var(--focus-ring,rgba(0,48,135,.5));outline-offset:2px}
.set-pick__dot{flex:none;width:18px;height:18px;border:1.5px solid #64748b;border-radius:var(--radius-full);background:#fff}
.set-pick[data-on="true"]{border-color:#003087!important;background:rgba(0,48,135,.04)!important}
.set-pick[data-on="true"] .set-pick__dot{border:5px solid #003087}

.set-disc{display:flex;align-items:center;width:100%;margin:0;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
.set-disc[aria-expanded="false"] .set-disc__chev{transform:rotate(-90deg)}
.set-disc__chev{flex:none;transition:transform .15s}
.set-chev{transition:transform .15s}
[aria-expanded="true"]>.set-chev{transform:rotate(180deg)}
.set-side[hidden],tr[hidden]{display:none!important}
@container setcol (max-width:559px){.set-row__text{flex:1 1 170px!important}}
[data-disc][hidden]{display:none!important}

/* save bar: a status line when nothing changed, a sticky bar once something did (Shopify's contextual save bar) */
.set-bar{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px 12px;min-height:52px;padding:8px 24px;border-top:1px solid var(--border-subtle);background:var(--surface-card)}
.set-bar[data-dirty="true"]{position:sticky;bottom:0;z-index:20;box-shadow:0 -8px 22px -14px rgba(15,23,42,.25)}
.set-bar__status{display:inline-flex;align-items:center;gap:8px;font-size:var(--text-xs);color:var(--text-body)}
.set-bar[data-dirty="true"] .set-bar__status{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--text-heading)}
.set-bar__note{color:var(--text-muted);font-weight:var(--weight-regular)}
.set-bar__dot{display:grid;place-items:center;width:20px;height:20px;border-radius:var(--radius-full);background:var(--fill-info-soft);color:var(--text-info)}
.set-bar__dot--bad{background:var(--fill-error-soft);color:var(--text-danger)}
.set-bar__hint{font-size:var(--text-xs);color:var(--text-muted)}
.set-bar button[aria-disabled="true"]{cursor:not-allowed;box-shadow:none;opacity:.55}
@media (max-width:767px){.set-bar{padding:8px 16px}.set-bar__hint{display:none}.set-bar .ix-btn{height:44px}.set-seg{height:40px}.set-seg button{height:32px}}

/* phone layout (desktop unchanged). Hooks the settings screens carry:
   .set-head   card head: title + description, then the actions (chips, selects, buttons)
   .set-flow   a row that wraps on a phone; .set-grow is its text part (keeps ~200px before wrapping) */
@media (max-width:767px){
  .set-head{flex-wrap:wrap}
  .set-head>span:first-child{flex:1 1 240px;min-width:0}
}
@media (max-width:640px){
  .set-head>span:last-child{flex:1 1 100%!important;margin-left:0!important;justify-content:flex-start;flex-wrap:wrap}
  .set-head>span:last-child:empty{display:none}
  .set-head .set-box{flex:1 1 140px;width:auto!important}
  .set-flow{flex-wrap:wrap!important;row-gap:6px!important}
  .set-flow>.set-grow{flex:1 1 200px!important}
  /* pills stay one line; button labels do not break inside the button */
  .set-main [style*="--radius-full"][style*="inline-flex"]{white-space:nowrap}
  .set-main button:not(.set-disc):not([role="switch"]){white-space:nowrap}
  /* reveal / copy / replace buttons inside a key field are 36px to tap (the field itself is 44px) */
  .set-box>button{min-width:36px;min-height:36px}
}

/* save guards, history and the field highlighted by the settings search */
.set-bar__hist{display:inline-flex;align-items:center;gap:4px;height:28px;padding:0 6px;border:0;border-radius:var(--radius-md);background:none;font:inherit;font-size:var(--text-xs);color:var(--text-link);cursor:pointer}
.set-bar__hist:hover{background:var(--surface-subtle)}
[data-set-hl]{outline:2px solid var(--primary);outline-offset:2px;background:var(--fill-primary-soft)!important;transition:outline-color .4s,background-color .4s}
.set-guard{display:flex;flex-direction:column;gap:var(--space-3);font-size:var(--text-sm);color:var(--text-body)}
.set-guard__item{display:flex;flex-direction:column;gap:6px;padding-bottom:var(--space-3);border-bottom:1px solid var(--border-subtle)}
.set-guard__change{display:flex;flex-wrap:wrap;align-items:center;gap:6px;margin:0}
.set-guard__change b{font-weight:var(--weight-semibold);color:var(--text-heading);margin-right:4px}
.set-guard__change svg{color:var(--text-muted)}
.set-guard__list{margin:0;padding-left:18px;display:flex;flex-direction:column;gap:4px;font-size:var(--text-xs);color:var(--text-body)}
.set-guard__type{display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);color:var(--text-body)}
.set-guard__type b{font-weight:var(--weight-semibold);color:var(--text-heading)}
.set-guard__note{margin:0}
.set-guard__table{width:100%;border-collapse:collapse;font-size:var(--text-xs)}
.set-guard__table th,.set-guard__table td{padding:6px 8px;border-bottom:1px solid var(--border-subtle);text-align:left;vertical-align:top;overflow-wrap:anywhere}
.set-guard__table thead th{color:var(--text-muted);font-weight:var(--weight-medium)}
.set-guard__table tbody th{font-weight:var(--weight-medium);color:var(--text-heading)}
.set-hist{list-style:none;margin:0;padding:0;display:flex;flex-direction:column}
.set-hist__row{display:flex;flex-direction:column;gap:2px;padding:10px 0;border-bottom:1px solid var(--border-subtle)}
.set-hist__what{display:flex;flex-wrap:wrap;align-items:center;gap:6px;font-size:var(--text-sm);color:var(--text-body);overflow-wrap:anywhere}
.set-hist__what b{font-weight:var(--weight-medium);color:var(--text-heading)}
.set-hist__what svg{color:var(--text-muted)}
.set-hist__who{font-size:var(--text-xs);color:var(--text-muted)}
.set-hist__empty{margin:0;font-size:var(--text-sm);color:var(--text-muted)}
.set-hist__all{display:inline-block;margin-top:var(--space-3);font-size:var(--text-sm);color:var(--text-link)}
`;

// ---- markup ----

export default class SetChromeScreen extends Component {
  render() {
    const screen = (
      <div className="dc-screen ds" data-screen="SetChrome">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        {/* the main menu: full panel on wide windows, icon rail from 1024 to 1279px, and below
            1024px a drawer opened by the menu button in the top bar */}
        <__Sidebar sticky="" active="settings" />
      </div>
    );
    return this.props.embedded ? screen : <SetFragment name="Settings main menu">{screen}</SetFragment>;
  }
}
