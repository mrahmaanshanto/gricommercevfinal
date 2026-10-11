'use client';
// moneyParts — small pieces the app's money screens share, drawn with the boards' classes (.field, .inp, .chip,
// .card, .row): an account picker (a native select inside .inp, each account with its balance), a taka amount field,
// payment-method chips, label/value lines like the order page's totals, the hero card (MHome's "Sales today" card),
// and a guard for a page the person or the edition can't open.

import React from 'react';
import {
  AppScreen, Content, AppBar, TabBar, Card, EmptyState, Field, Icon, money,
} from '../kit/AppKit';

/** A native select in the boards' input box. options: [{ value, label }] or [{ label, options: [...] }] groups. */
export function SelectField({ label, value, onChange, options, help, error, name }) {
  return (
    <Field label={label} help={help} error={error}>
      <span className="inp" style={{ paddingRight: '10px' }}>
        <select value={value} onChange={(e) => onChange(e.target.value)} name={name} style={{ appearance: 'none', WebkitAppearance: 'none', cursor: 'pointer' }}>
          {options.map((o) => (o.options
            ? <optgroup key={o.label} label={o.label}>{o.options.map((x) => <option key={x.value} value={x.value}>{x.label}</option>)}</optgroup>
            : <option key={o.value} value={o.value}>{o.label}</option>))}
        </select>
        <Icon name="down" size={18} stroke={2} style={{ color: 'var(--muted)', flex: 'none', pointerEvents: 'none' }} />
      </span>
    </Field>
  );
}

const TYPE_GROUP = { Bank: 'Banks', Mobile: 'Mobile wallets', Cash: 'Cash' };
/** Account picker: accounts = [{ id, type, name, balance }] (moneyData.accountOptions). first = an extra first option. */
export function AccountField({ label = 'Account', value, onChange, accounts, help, error, first }) {
  const groups = ['Bank', 'Mobile', 'Cash'].map((t) => ({ label: TYPE_GROUP[t], options: accounts.filter((a) => a.type === t).map((a) => ({ value: a.id, label: `${a.name} · ${money(a.balance)}` })) })).filter((g) => g.options.length);
  return <SelectField label={label} value={value} onChange={onChange} options={first ? [first, ...groups] : groups} help={help} error={error} />;
}

/** Taka amount: digits and one point. */
export const cleanAmount = (v) => String(v).replace(/[^\d.]/g, '').replace(/(\..*)\./g, '$1');
export function AmountField({ label = 'Amount', value, onChange, help, error, autoFocus }) {
  return (
    <Field label={label} help={help} error={error}>
      <span className="inp">
        <span className="pre">৳</span>
        <input value={value} onChange={(e) => onChange(cleanAmount(e.target.value))} inputMode="decimal" placeholder="0" autoFocus={autoFocus} className="num" aria-invalid={error ? true : undefined} />
      </span>
    </Field>
  );
}

/** Choice chips that wrap (payment method, reason). items: [key] or [[key, label]]. */
export function ChoiceChips({ items, value, onChange, label }) {
  return (
    <div role="radiogroup" aria-label={label} style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
      {items.map((it) => {
        const [k, l] = Array.isArray(it) ? it : [it, it];
        return <button key={k} type="button" role="radio" aria-checked={value === k} className={'chip' + (value === k ? ' on' : '')} onClick={() => onChange(k)}>{l}</button>;
      })}
    </div>
  );
}

/** Label / value lines (the order page's totals block). rows: [[label, value, { strong, tone }]] */
export function Lines({ rows, style }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', fontSize: 'var(--text-sm)', ...style }}>
      {rows.filter(Boolean).map(([k, v, o = {}]) => (
        <div key={k} style={{ display: 'flex', justifyContent: 'space-between', gap: '12px', color: o.strong ? 'var(--ink)' : 'var(--body)', fontWeight: o.strong ? 'var(--weight-semibold)' : undefined, fontSize: o.strong ? 'var(--text-base)' : undefined }}>
          <span style={{ minWidth: 0 }}>{k}</span>
          <span className="num" style={{ textAlign: 'right', color: o.tone === 'err' ? 'var(--err)' : o.tone === 'ok' ? 'var(--ok)' : undefined }}>{v}</span>
        </div>
      ))}
    </div>
  );
}

/** The navy figure card (MHome's "Sales today"): label, big figure, a pill, and up to three small figures. */
export function HeroCard({ label, value, pill, figures = [], style }) {
  return (
    <div className="card" style={{ margin: '12px 20px 0', padding: '18px 20px', background: 'linear-gradient(150deg,#012169,#0a4bb5)', color: '#fff', boxShadow: '0 16px 30px -18px rgba(0,48,135,.7)', ...style }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px' }}>
        <span style={{ fontSize: 'var(--text-xs-plus)', opacity: '.8' }}>{label}</span>
        {pill ? <span className="pill" style={{ background: 'rgba(255,255,255,.16)', color: '#fff' }}>{pill}</span> : null}
      </div>
      <div className="num" style={{ fontSize: 'var(--text-3xl)', fontWeight: 'var(--weight-semibold)', letterSpacing: 'var(--tracking-tight)', marginTop: '4px' }}>{value}</div>
      {figures.length ? (
        <div style={{ display: 'flex', gap: '22px', marginTop: '10px', fontSize: 'var(--text-xs-plus)' }}>
          {figures.map(([v, k]) => (
            <span key={k} style={{ minWidth: 0 }}>
              <b className="num" style={{ fontSize: 'var(--text-lg)', display: 'block', whiteSpace: 'nowrap' }}>{v}</b>
              <span style={{ opacity: '.75' }}>{k}</span>
            </span>
          ))}
        </div>
      ) : null}
    </div>
  );
}

/** A signed amount in the ledger's colours: +৳1,200 green, −৳300 red. */
export function Signed({ n, style }) {
  const v = Number(n) || 0;
  return <span className="num" style={{ fontWeight: 'var(--weight-semibold)', color: v > 0 ? 'var(--ok)' : v < 0 ? 'var(--err)' : 'var(--ink)', whiteSpace: 'nowrap', ...style }}>{(v > 0 ? '+' : '') + money(v)}</span>;
}

/** The page for a person or an edition without this area. */
export function NotHere({ name, title }) {
  return (
    <AppScreen name={name} title={title}>
      <AppBar title={title} back="/m-more" />
      <Content top={103}>
        <Card style={{ marginTop: '8px' }}><EmptyState icon="alert" title="This page isn’t open to you here." action={{ label: 'Back to More', href: '/m-more' }} /></Card>
      </Content>
    </AppScreen>
  );
}
