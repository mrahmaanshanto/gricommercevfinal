'use client';
// ApiKeysCard — named API keys with limited access, on Settings › API Security (lib/apiKeys.js). Create a key with a
// name, what it may do and when it expires; the key is shown once, then only its first and last characters. Revoke
// stops it at once. Each key shows when it was last used.

import React, { useEffect, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { toast, confirmDialog } from '@/runtime/ui';
import { Dialog, StatusBadge } from '@/components/ui';
import { listKeys, createKey, revokeKey, maskOf, scopeLabel, SCOPES, EXPIRY, APIKEYS_EVENT } from '@/lib/apiKeys';

const CSS = `
.ak-list{list-style:none;margin:0;padding:0}
.ak-row{display:flex;align-items:center;gap:var(--space-3);padding:10px 16px;border-top:1px solid var(--border-subtle)}
.ak-row__main{flex:1;min-width:0;display:flex;flex-direction:column;gap:2px}
.ak-row__top{display:flex;flex-wrap:wrap;align-items:center;gap:8px;font-size:var(--text-sm);color:var(--text-heading)}
.ak-row__top b{font-weight:var(--weight-medium)}
.ak-key{font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-body)}
.ak-row__sub{font-size:var(--text-xs);color:var(--text-muted);overflow-wrap:anywhere}
.ak-form{display:flex;flex-direction:column;gap:var(--space-3)}
.ak-lbl{display:flex;flex-direction:column;gap:6px;font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-heading)}
.ak-scopes{display:grid;grid-template-columns:1fr 1fr;gap:6px 12px}
.ak-scope{display:flex;align-items:center;gap:8px;min-height:32px;font-size:var(--text-sm);color:var(--text-body);cursor:pointer}
.ak-scope input{width:16px;height:16px;accent-color:var(--primary)}
.ak-err{margin:0;font-size:var(--text-xs);color:var(--text-danger)}
.ak-secret{display:flex;align-items:center;gap:8px;padding:10px 12px;border:1px solid var(--border-field);border-radius:var(--radius-lg);background:var(--surface-subtle);font-family:var(--font-data);font-size:var(--text-xs);color:var(--text-heading);overflow-wrap:anywhere}
.ak-secret span{flex:1;min-width:0}
.ak-warn{margin:0;font-size:var(--text-xs);color:var(--text-warning)}
@media (max-width:640px){.ak-row{flex-wrap:wrap}.ak-scopes{grid-template-columns:minmax(0,1fr)}}
`;

const day = (t) => (t ? new Date(t).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' }) : '');
function ago(t, now) {
  if (!t) return 'Never used';
  const m = Math.round((now - t) / 60000);
  if (m < 60) return `Used ${Math.max(1, m)} min ago`;
  const h = Math.round(m / 60);
  if (h < 24) return `Used ${h} h ago`;
  return 'Used ' + day(t);
}
const STATUS = { active: ['Active', 'success'], expired: ['Expired', 'warning'], revoked: ['Revoked', 'neutral'] };

export default function ApiKeysCard() {
  const [keys, setKeys] = useState([]);
  const [now, setNow] = useState(0);
  const [form, setForm] = useState(null);      // { name, scopes, days, err }
  const [shown, setShown] = useState(null);    // { name, secret } — once
  useEffect(() => {
    const read = () => { setNow(Date.now()); setKeys(listKeys()); };
    read();
    window.addEventListener(APIKEYS_EVENT, read);
    return () => window.removeEventListener(APIKEYS_EVENT, read);
  }, []);

  const create = () => {
    const res = createKey(form);
    if (res.error) { setForm({ ...form, err: res.error }); return; }
    setForm(null);
    setShown({ name: res.key.name, secret: res.secret });
  };
  const revoke = async (k) => {
    if (await confirmDialog({ title: `Revoke “${k.name}”?`, body: 'Anything using this key stops working at once. Other keys keep working.', confirmLabel: 'Revoke key', tone: 'danger' })) {
      revokeKey(k.id);
      toast('Key revoked');
    }
  };
  const copy = () => {
    const done = () => toast('Key copied');
    if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(shown.secret).then(done, () => toast('Could not copy. Select the key and copy it by hand.', { tone: 'error' }));
  };
  const flip = (id) => setForm((f) => ({ ...f, err: '', scopes: f.scopes.includes(id) ? f.scopes.filter((x) => x !== id) : [...f.scopes, id] }));
  const live = keys.filter((k) => k.status === 'active').length;

  return (
    <section id="keys" className="ix-card set-card" aria-label="API keys">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="set-head set-head--top">
        <span style={{ display: 'block' }}><h2 className="set-title">API keys</h2></span>
        <span style={{ marginLeft: 'auto', flex: 'none', display: 'inline-flex', alignItems: 'center', gap: 'var(--space-2)' }}>
          <span style={{ fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>{live} active</span>
          <button type="button" className="ix-btn ix-btn--sm" onClick={() => setForm({ name: '', scopes: ['read_orders'], days: 90, err: '' })}><Icon name="plus" width="14" height="14" aria-hidden="true" />Create key</button>
        </span>
      </div>
      <p className="set-help set-help--keep" style={{ margin: 0, padding: '4px 16px 10px', fontSize: 'var(--text-xs)', color: 'var(--text-muted)' }}>One key per app. Give each only what it needs, so a leaked key can be revoked without breaking the others.</p>
      <ul className="ak-list">
        {keys.map((k) => (
          <li key={k.id} className="ak-row">
            <div className="ak-row__main">
              <span className="ak-row__top"><b>{k.name}</b><span className="ak-key">{maskOf(k)}</span><StatusBadge tone={STATUS[k.status][1]}>{STATUS[k.status][0]}</StatusBadge></span>
              <span className="ak-row__sub">{k.scopes.map(scopeLabel).join(', ')}</span>
              <span className="ak-row__sub">{k.status === 'revoked' ? 'Revoked ' + day(k.revokedAt) : ago(k.lastUsedAt, now)} · {k.expiresAt ? (k.status === 'expired' ? 'Expired ' : 'Expires ') + day(k.expiresAt) : 'No expiry'} · Made by {k.createdBy}</span>
            </div>
            {k.status === 'active' ? <button type="button" className="ix-btn ix-btn--sm" onClick={() => revoke(k)}>Revoke</button> : null}
          </li>
        ))}
      </ul>

      <Dialog open={!!form} title="Create API key" onClose={() => setForm(null)}
        footer={<><button type="button" className="gc-btn gc-btn--neutral" onClick={() => setForm(null)}>Cancel</button><button type="button" className="gc-btn gc-btn--solid" onClick={create}>Create key</button></>}>
        {form ? (
          <div className="ak-form">
            <label className="ak-lbl">Name<input className="gc-input" value={form.name} data-autofocus placeholder="Accounting export" onChange={(e) => setForm({ ...form, name: e.target.value, err: '' })} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); create(); } }} /></label>
            <div className="ak-lbl" role="group" aria-label="What the key may do">What it may do
              <div className="ak-scopes">
                {SCOPES.map((s) => <label key={s.id} className="ak-scope"><input type="checkbox" checked={form.scopes.includes(s.id)} onChange={() => flip(s.id)} />{s.label}</label>)}
              </div>
            </div>
            <label className="ak-lbl">Expires
              <select className="gc-input" value={form.days} onChange={(e) => setForm({ ...form, days: Number(e.target.value) })}>
                {EXPIRY.map(([d, l]) => <option key={d} value={d}>{l}</option>)}
              </select>
            </label>
            {form.err ? <p className="ak-err" role="alert">{form.err}</p> : null}
          </div>
        ) : null}
      </Dialog>

      <Dialog open={!!shown} title={shown ? `Key for ${shown.name}` : 'New key'} onClose={() => setShown(null)}
        footer={<button type="button" className="gc-btn gc-btn--solid" onClick={() => setShown(null)}>Done</button>}>
        {shown ? (
          <div className="ak-form">
            <p className="ak-warn">Copy it now. You won’t see it again.</p>
            <div className="ak-secret"><span>{shown.secret}</span><button type="button" className="ix-btn ix-btn--sm" onClick={copy}>Copy</button></div>
          </div>
        ) : null}
      </Dialog>
    </section>
  );
}
