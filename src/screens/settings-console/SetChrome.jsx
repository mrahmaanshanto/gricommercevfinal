'use client';
// Generated from design/templates/settings-console/SetChrome.dc.html by scripts/convert-design.mjs.
// SetChrome — the frame every settings screen sits in: the main menu, the fluid page layout,
// and the form kit (fields, switches, save bar) the settings screens share.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar } from '@/shell/Shell';
import { toast } from '@/runtime/ui';
import { formatTime } from '@/lib/format';

// ---- form logic shared by the settings screens -------------------------------------------------
// A screen declares `formId` and `fields = { name: { l: label, d: default, req, k: kind } }`.
// `this.f` (passed to the markup as `v.f`) reads and writes the values, tracks what changed,
// validates on save, and moves focus to the first field that needs attention.

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
    this.state = { vals: {}, saved: {}, errs: {}, open: {}, savedAt: '' };
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
  }

  componentWillUnmount() { if (this._key) document.removeEventListener('keydown', this._key); }

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

  save() {
    const errs = {};
    for (const n of Object.keys(this.fields || {})) { const e = this.check(n, this.f.get(n, '')); if (e) errs[n] = e; }
    const bad = Object.keys(errs);
    if (bad.length) {
      this.setState({ errs }, () => this.focusField(bad[0]));
      toast('Could not save. ' + bad.length + (bad.length === 1 ? ' field needs' : ' fields need') + ' attention.', { tone: 'error' });
      return false;
    }
    if (!this.f.dirty()) return true;
    this.setState((st) => ({ saved: { ...st.saved, ...st.vals }, vals: {}, errs: {}, savedAt: formatTime(new Date()) }));
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
export function SetSaveBar({ f, note }) {
  const dirty = f.dirty();
  const changed = f.count();
  const errors = f.errCount();
  const at = f.savedAt();
  let status;
  if (errors) status = <><span className="set-bar__dot set-bar__dot--bad"><__Icon name="triangle-alert" strokeWidth="1.75" width="13" height="13" aria-hidden="true" /></span>{'Could not save: ' + errors + (errors === 1 ? ' field needs' : ' fields need') + ' attention'}</>;
  else if (dirty) status = <><span className="set-bar__dot"><__Icon name="pencil" strokeWidth="1.75" width="13" height="13" aria-hidden="true" /></span>{changed + (changed === 1 ? ' unsaved change' : ' unsaved changes')}</>;
  else status = <><__Icon name="circle-check" strokeWidth="1.75" width="17" height="17" aria-hidden="true" style={{ color: 'var(--text-success)' }} />All changes saved<span className="set-bar__note">{at ? '· ' + at + ' by you' : note || ''}</span></>;
  return (
    <div className="set-bar" data-dirty={dirty ? 'true' : 'false'}>
      <span className="set-bar__status" role="status">{status}</span>
      <span style={{ flex: '1' }} />
      {dirty ? <span className="set-bar__hint">Ctrl or ⌘ + S also saves</span> : null}
      <button type="button" className="set-bar__discard" aria-disabled={dirty ? undefined : 'true'} onClick={dirty ? f.discard : undefined}>Discard</button>
      <button type="submit" className="set-bar__save" aria-disabled={dirty ? undefined : 'true'}>
        {dirty ? <__Icon name="check" strokeWidth="1.75" width="16" height="16" aria-hidden="true" /> : null}Save changes
      </button>
    </div>
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

// ---- styles (from the design's <helmet>) ----
// The settings pages are fluid: the page fills the window and scrolls as one document.
//   >= 1440  main menu · settings nav · form · "On this page"
//   >= 1024  main menu · settings nav · form
//   <  1024  main menu in the top bar's drawer · settings nav as a scrolling strip · form
//   <   768  edge to edge, single column

const CSS = `
.set-shell{display:flex;gap:12px;width:100%;min-height:var(--set-vh,100dvh);padding:12px;background:#eef2f7;font-family:var(--font-sans);color:#475569;box-sizing:border-box}
.set-shell *,.set-shell *::before,.set-shell *::after{box-sizing:border-box}
.set-shell__rail{flex:none;display:flex}
.set-shell__main{flex:1;min-width:0;display:flex;flex-direction:column;overflow:clip;border:1px solid #e2e8f0;border-radius:var(--radius-xl);background:#f8fafc}
.set-shell__body{flex:1;min-width:0;display:flex;align-items:stretch}
.set-shell__col{flex:1;min-width:0;margin:0;display:flex;flex-direction:column;container-type:inline-size;container-name:setcol}
.set-content{flex:1;min-width:0;display:flex;align-items:flex-start;gap:26px;padding:22px 24px 26px}
.set-main{flex:1;min-width:0;display:flex;flex-direction:column;gap:16px}
.set-main>header{flex-wrap:wrap}
.set-main>section{min-width:0;max-width:100%}
.set-main section[id]{scroll-margin-top:calc(var(--header-height,64px) + 16px)}
.set-toc{position:sticky;top:calc(var(--header-height,64px) + 16px);width:186px;flex:none;display:flex;flex-direction:column;gap:8px}
.set-side{position:sticky;top:calc(var(--header-height,64px) + 16px)}
@media (max-width:1439px){.set-toc{display:none!important}}
@container setcol (max-width:903px){.set-toc{display:none!important}}
@container setcol (max-width:1099px){
  .set-content:has(.set-side){flex-direction:column;align-items:stretch}
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
.set-sw:focus-visible,.set-seg button:focus-visible,.set-disc:focus-visible,.set-bar button:focus-visible{outline:3px solid var(--focus-ring,rgba(0,48,135,.5));outline-offset:2px}
@media (prefers-reduced-motion:reduce){.set-sw,.set-sw>span,.set-box{transition:none}}

.set-seg{flex:none;display:inline-flex;align-items:center;gap:2px;height:36px;padding:3px;border:1px solid #e2e8f0;border-radius:var(--radius-lg);background:#f8fafc}
.set-seg button{display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 12px;border:0;border-radius:var(--radius-md);background:none;font-size:var(--text-xs);color:var(--text-muted);cursor:pointer;white-space:nowrap}
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

/* save bar: a status line when nothing changed, a sticky bar once something did */
.set-bar{flex:none;display:flex;flex-wrap:wrap;align-items:center;gap:8px 14px;min-height:64px;padding:10px 24px;border-top:1px solid #e2e8f0;background:#fff}
.set-bar[data-dirty="true"]{position:sticky;bottom:0;z-index:20;box-shadow:0 -8px 22px -14px rgba(15,23,42,.25)}
.set-bar__status{display:inline-flex;align-items:center;gap:8px;font-size:var(--text-xs-plus);color:#475569}
.set-bar[data-dirty="true"] .set-bar__status{font-size:var(--text-sm);font-weight:var(--weight-medium);color:#1e293b}
.set-bar__note{color:var(--text-muted);font-weight:var(--weight-regular)}
.set-bar__dot{display:grid;place-items:center;width:22px;height:22px;border-radius:var(--radius-full);background:rgba(0,156,222,.16);color:var(--accent-text)}
.set-bar__dot--bad{background:rgba(255,87,36,.14);color:var(--text-danger,#c2380f)}
.set-bar__hint{font-size:var(--text-xs);color:var(--text-muted)}
.set-bar button{display:inline-flex;align-items:center;gap:8px;height:44px;border-radius:var(--radius-lg);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);cursor:pointer}
.set-bar__discard{padding:0 14px;border:1px solid #cbd5e1;background:#fff;color:#475569}
.set-bar__discard:hover{background:#f8fafc;color:#1e293b}
.set-bar__save{padding:0 18px;border:0;background:#003087;color:#fff;letter-spacing:.02em}
.set-bar__save:hover{background:#002a77}
.set-bar button[aria-disabled="true"]{cursor:not-allowed;box-shadow:none}
.set-bar__discard[aria-disabled="true"],.set-bar__discard[aria-disabled="true"]:hover{border-color:transparent;background:none;color:var(--text-muted)}
.set-bar__save[aria-disabled="true"],.set-bar__save[aria-disabled="true"]:hover{background:#e2e8f0;color:#475569}
@media (max-width:767px){.set-bar{padding:10px 16px}.set-bar__hint{display:none}}

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
}
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
