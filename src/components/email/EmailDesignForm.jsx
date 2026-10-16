'use client';
// EmailDesignForm — the look every email shares (logo, colours, font, header, footer, social links), for the shop
// (/email-design) and super admin (/admin/email-design). Fields from lib/email/emailKit.js › DESIGN_FIELDS.

import React from 'react';
import { DESIGN_FIELDS } from '@/lib/email/emailKit';

const SOCIAL = [['facebook', 'Facebook page'], ['instagram', 'Instagram'], ['youtube', 'YouTube'], ['whatsapp', 'WhatsApp link']];

export function EmailDesignForm({ design, onChange, locked = false }) {
  const set = (k, v) => onChange({ ...design, [k]: v });
  return (
    <div className="ed-form" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill,minmax(220px,1fr))', gap: 'var(--space-3)' }}>
      {DESIGN_FIELDS.map(([k, l, kind, ch]) => {
        const id = 'ed-' + k;
        if (kind === 'color') return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><span style={{ display: 'flex', gap: 6 }}><input type="color" aria-label={l + ' picker'} value={/^#[0-9a-f]{6}$/i.test(design[k]) ? design[k] : '#000000'} disabled={locked} onChange={(e) => set(k, e.target.value)} style={{ width: 44, height: 36, padding: 2, border: '1px solid var(--border-subtle)', borderRadius: 'var(--radius-lg)', background: 'var(--surface-card)' }} /><input id={id} className="gc-input" value={design[k] || ''} disabled={locked} onChange={(e) => set(k, e.target.value.trim())} /></span></div>;
        if (kind === 'choice') return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><select id={id} className="gc-input gc-select" value={design[k]} disabled={locked} onChange={(e) => set(k, e.target.value)}>{ch.map(([v, x]) => <option key={v} value={v}>{x}</option>)}</select></div>;
        if (kind === 'bool') return <label key={k} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 'var(--text-sm)', alignSelf: 'end', minHeight: 36 }}><input type="checkbox" className="gc-check" checked={!!design[k]} disabled={locked} onChange={(e) => set(k, e.target.checked)} />{l}</label>;
        if (kind === 'number') return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} className="gc-input" type="number" min={0} max={24} value={design[k]} disabled={locked} onChange={(e) => set(k, Math.max(0, Math.min(24, Number(e.target.value) || 0)))} /></div>;
        return <div key={k} className="es-field"><label className="gc-label" htmlFor={id}>{l}</label><input id={id} className="gc-input" value={design[k] || ''} placeholder={kind === 'image' ? 'https://… or /assets/…' : ''} disabled={locked} onChange={(e) => set(k, e.target.value)} /></div>;
      })}
      {SOCIAL.map(([k, l]) => <div key={k} className="es-field"><label className="gc-label" htmlFor={'ed-s-' + k}>{l}</label><input id={'ed-s-' + k} className="gc-input" value={(design.social || {})[k] || ''} placeholder="https://…" disabled={locked} onChange={(e) => onChange({ ...design, social: { ...(design.social || {}), [k]: e.target.value } })} /></div>)}
    </div>
  );
}
