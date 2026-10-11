'use client';
// settingsParts — the settings screens' rows, in the boards' settings look (design/templates/app/MCallSettings.dc.html):
// an upper-case group label, then a card of .lrow rows — a label with a value on the right (a link or a button that
// opens a sheet) or a title + help line with a switch.

import React from 'react';
import Link from 'next/link';
import { Icon, Switch } from '../kit/AppKit';

export const SETTINGS_CSS = `
[data-screen] .set-group{margin:22px 24px 8px;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);letter-spacing:var(--tracking-label);text-transform:uppercase;color:var(--muted)}
[data-screen] button.lrow{width:100%;border:0;background:none;font:inherit;color:inherit;text-align:left;cursor:pointer}
[data-screen] .lrow + button.lrow,[data-screen] button.lrow + .lrow,[data-screen] a.lrow + .lrow,[data-screen] .lrow + a.lrow{border-top:1px solid var(--line)}
[data-screen] .lrow:focus-visible{outline:2px solid var(--brand);outline-offset:-2px}
[data-screen] .set-ico{flex:none;width:36px;height:36px;border-radius:var(--radius-lg);display:flex;align-items:center;justify-content:center;background:var(--soft);color:var(--brand)}
[data-screen] .opt{display:flex;align-items:center;gap:12px;width:100%;min-height:56px;padding:10px 2px;border:0;border-bottom:1px solid var(--line);background:none;font:inherit;color:var(--ink);text-align:left;cursor:pointer}
[data-screen] .opt:last-child{border-bottom:0}
[data-screen] .kv{display:flex;align-items:baseline;gap:12px;padding:11px 0;border-bottom:1px solid var(--line);font-size:var(--text-sm)}
[data-screen] .kv:last-child{border-bottom:0}
[data-screen] .kv > span:first-child{width:110px;flex:none;font-size:var(--text-xs-plus);color:var(--muted)}
[data-screen] .kv > span:last-child{flex:1;min-width:0;text-align:right;color:var(--ink);overflow-wrap:anywhere}
`;

/** The upper-case group label above a card. */
export const GroupLabel = ({ children }) => <div className="set-group">{children}</div>;

const Chev = () => <Icon name="chev" size={18} stroke={2} style={{ color: 'var(--text-muted)', flex: 'none' }} />;

/** A row: optional icon, the label (and a help line), the value on the right, a chevron when it opens something. */
export function SetRow({ icon, label, sub, value, href, onClick, end, danger }) {
  const inner = (
    <>
      {icon ? <span className="set-ico" style={danger ? { background: 'var(--errbg)', color: 'var(--err)' } : undefined}><Icon name={icon} size={20} /></span> : null}
      <span style={{ flex: '1', minWidth: '0' }}>
        <span className="ell" style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)', color: danger ? 'var(--err)' : undefined }}>{label}</span>
        {sub ? <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', lineHeight: '18px' }}>{sub}</span> : null}
      </span>
      {value != null && value !== '' ? <span className="ell" style={{ maxWidth: '50%', fontSize: 'var(--text-sm)', color: 'var(--muted)', whiteSpace: 'nowrap' }}>{value}</span> : null}
      {end}
      {href || onClick ? <Chev /> : null}
    </>
  );
  if (href) {
    const external = /^(https?:|tel:|sms:|mailto:)/.test(href);
    return external ? <a className="lrow" href={href}>{inner}</a> : <Link className="lrow" href={href}>{inner}</Link>;
  }
  if (onClick) return <button type="button" className="lrow" onClick={onClick}>{inner}</button>;
  return <div className="lrow">{inner}</div>;
}

/** A title + help line with a switch on the right. */
export function SwitchRow({ icon, label, sub, on, onChange, disabled }) {
  return (
    <div className="lrow" style={disabled ? { opacity: 0.5 } : undefined}>
      {icon ? <span className="set-ico"><Icon name={icon} size={20} /></span> : null}
      <span style={{ flex: '1', minWidth: '0' }}>
        <span style={{ display: 'block', fontSize: 'var(--text-sm-plus)', fontWeight: 'var(--weight-medium)' }}>{label}</span>
        {sub ? <span style={{ display: 'block', fontSize: 'var(--text-xs-plus)', color: 'var(--muted)', lineHeight: '18px' }}>{sub}</span> : null}
      </span>
      <Switch on={on} onChange={disabled ? () => {} : onChange} label={label} />
    </div>
  );
}

/** A read-only fact (label · value) inside a sheet. */
export const KV = ({ k, children }) => <div className="kv"><span>{k}</span><span>{children}</span></div>;
