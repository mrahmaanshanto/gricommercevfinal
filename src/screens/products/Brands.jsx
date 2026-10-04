'use client';
// Brands — the makers a product can be tagged with, as a Shopify-style list (docs/shopify-style.md).
//   View   Gallery (default: a logo card per brand with name and product count; no logo = the brand's initials on a
//          soft tint) or List (a table, with the description);
//          the choice is kept per browser ('gc.brands.view'); search by name
//   Panel  Add brand / a row opens it: name (required), description (optional), image (optional: upload, replace,
//          remove); Delete asks first (products keep the name they were saved with)
// Front end only: data from src/lib/brands.js (browser storage), product counts from src/lib/products.js.

import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Icon } from '@/runtime/dc';
import { Sidebar, Topbar } from '@/shell/Shell';
import { EmptyState, Sheet } from '@/components/ui';
import { ShopHeader, SearchField, LearnMore } from '@/components/ui/IndexKit';
import { toast, confirmDialog } from '@/runtime/ui';
import { getBrands, saveBrand, deleteBrand, productCounts, readBrandImage, BRANDS_EVENT, BRAND_NAME_MAX, BRAND_DESC_MAX } from '@/lib/brands';

const CSS = `
.br-who{display:inline-flex;align-items:center;gap:10px;min-width:0;max-width:320px}
.br-who>span{min-width:0;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.br-thumb{overflow:hidden;background:var(--surface-subtle);color:var(--text-muted)}
.br-thumb img{display:block;width:100%;height:100%;object-fit:contain;background:var(--surface-card)}
.br-desc{display:block;max-width:420px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.br-form{display:grid;gap:var(--space-4)}
.br-field{display:flex;flex-direction:column;gap:6px;min-width:0}
.br-field>.gc-label{margin:0}
.br-field .gc-help{margin:0}
.br-opt{font-weight:var(--weight-regular);color:var(--text-muted)}
.br-count{align-self:flex-end;font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
.br-desc-in{min-height:96px;padding-top:10px;padding-bottom:10px;resize:vertical}
.br-img{display:flex;align-items:center;gap:var(--space-3);flex-wrap:wrap}
.br-pic{display:grid;place-items:center;flex:none;width:96px;height:96px;overflow:hidden;border:1px dashed var(--border-strong);border-radius:var(--radius-xl);background:var(--surface-subtle);color:var(--text-muted)}
.br-pic.has{border-style:solid;border-color:var(--border-subtle);background:var(--surface-card)}
.br-pic img{display:block;width:100%;height:100%;object-fit:contain}
.br-acts{display:flex;flex-wrap:wrap;gap:var(--space-2)}
.br-foot{display:flex;align-items:center;gap:var(--space-2);width:100%}
.br-foot>.br-del{margin-right:auto}
.br-bar{display:flex;align-items:center;gap:var(--space-2)}
.br-bar>.ix-search{flex:1;min-width:0}
.br-views{display:inline-flex;flex:none;padding:2px;border:1px solid var(--border-subtle);border-radius:var(--radius-full);background:var(--surface-subtle)}
.br-views button{display:grid;place-items:center;width:32px;height:28px;border:0;border-radius:var(--radius-full);background:none;color:var(--text-muted);cursor:pointer;transition:var(--transition-colors)}
.br-views button:hover{color:var(--text-heading)}
.br-views button[aria-pressed="true"]{background:var(--surface-card);box-shadow:var(--shadow-xs);color:var(--text-heading)}
/* gallery: one logo card per brand */
.br-grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(184px,1fr));gap:var(--space-4);margin:0;padding:var(--space-4);list-style:none}
.br-card{display:flex;flex-direction:column;width:100%;height:100%;overflow:hidden;padding:0;border:1px solid var(--border-subtle);border-radius:var(--radius-xl);background:var(--surface-card);box-shadow:var(--shadow-xs);font:inherit;color:inherit;text-align:left;cursor:pointer;transition:box-shadow .18s ease,transform .18s ease,border-color .18s ease}
.br-card:hover{border-color:var(--border-strong);box-shadow:var(--shadow-card);transform:translateY(-2px)}
.br-card:focus-visible{outline:3px solid var(--focus-ring);outline-offset:2px}
.br-stage{position:relative;display:grid;place-items:center;aspect-ratio:3 / 2;padding:var(--space-5);border-bottom:1px solid var(--border-subtle);background:radial-gradient(120% 90% at 50% 0%,var(--surface-card) 0%,var(--surface-subtle) 100%)}
.br-stage img{display:block;max-width:100%;max-height:100%;object-fit:contain;filter:drop-shadow(0 1px 1px rgba(15,23,42,.06))}
.br-mono{display:grid;place-items:center;width:64px;height:64px;border-radius:var(--radius-full);font-size:var(--text-xl);font-weight:var(--weight-semibold);letter-spacing:.02em;color:var(--text-heading);box-shadow:inset 0 0 0 1px rgba(15,23,42,.06)}
.br-info{display:flex;flex-direction:column;gap:4px;padding:var(--space-3) var(--space-4) var(--space-4)}
.br-info b{overflow:hidden;font-size:var(--text-sm);font-weight:var(--weight-semibold);color:var(--text-heading);text-overflow:ellipsis;white-space:nowrap}
.br-meta{font-size:var(--text-xs);color:var(--text-muted);font-variant-numeric:tabular-nums}
@media (max-width:640px){
  .br-grid{grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3);padding:var(--space-3)}
  .br-stage{padding:var(--space-4)}
  .br-mono{width:52px;height:52px}
  .br-info{padding:var(--space-2) var(--space-3) var(--space-3)}
}
@media (prefers-reduced-motion:reduce){.br-card{transition:none}.br-card:hover{transform:none}}
`;
const VIEW_KEY = 'gc.brands.view';
// a brand without a logo: its initials on one of the soft tints (the same brand always gets the same one)
const TINTS = ['var(--fill-primary-soft)', 'var(--fill-info-soft)', 'var(--fill-success-soft)', 'var(--fill-warning-soft)', 'var(--fill-accent-soft)', 'var(--fill-secondary-soft)'];
const tintOf = (name) => TINTS[[...String(name)].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % TINTS.length];
const initialsOf = (name) => String(name).trim().split(/\s+/).slice(0, 2).map((w) => w.charAt(0).toUpperCase()).join('') || '?';

const blank = () => ({ id: '', name: '', description: '', image: '', err: '', busy: false });

function Thumb({ brand, size = 32 }) {
  return (
    <span className="ix-thumb br-thumb" style={{ ...(size !== 32 ? { width: size, height: size } : null), ...(brand.image ? null : { background: tintOf(brand.name), color: 'var(--text-heading)' }) }} aria-hidden="true">
      {brand.image ? <img src={brand.image} alt="" /> : initialsOf(brand.name)}
    </span>
  );
}

export default function Brands() {
  const [ready, setReady] = useState(false);
  const [brands, setBrands] = useState([]);
  const [counts, setCounts] = useState({});
  const [q, setQ] = useState('');
  const [edit, setEdit] = useState(null);     // null closed · the form (id '' = new brand)
  const [view, setView] = useState('gallery');
  const fileRef = useRef(null);

  // the list lives in browser storage: read after mount, so the first render matches the server
  useEffect(() => {
    const load = () => { setBrands(getBrands()); setCounts(productCounts()); };
    load(); setReady(true);
    try { if (window.localStorage.getItem(VIEW_KEY) === 'list') setView('list'); } catch { /* ignore */ }
    window.addEventListener(BRANDS_EVENT, load); window.addEventListener('storage', load);
    return () => { window.removeEventListener(BRANDS_EVENT, load); window.removeEventListener('storage', load); };
  }, []);

  const term = q.trim().toLowerCase();
  const shown = useMemo(() => (term ? brands.filter((b) => b.name.toLowerCase().includes(term)) : brands), [brands, term]);
  const countOf = (b) => counts[b.name.toLowerCase()] || 0;
  const productsText = (n) => (n === 1 ? '1 product' : n + ' products');

  const pickView = (v) => { setView(v); try { window.localStorage.setItem(VIEW_KEY, v); } catch { /* ignore */ } };
  const openNew = () => setEdit(blank());
  const openEdit = (b) => setEdit({ ...blank(), id: b.id, name: b.name, description: b.description || '', image: b.image || '' });
  const close = () => setEdit(null);
  const put = (k, v) => setEdit((e) => ({ ...e, [k]: v, err: k === 'name' ? '' : e.err }));

  const pickImage = async (e) => {
    const file = e.target.files && e.target.files[0];
    e.target.value = '';
    if (!file) return;
    setEdit((x) => ({ ...x, busy: true }));
    try { const url = await readBrandImage(file); setEdit((x) => (x ? { ...x, image: url, busy: false } : x)); }
    catch (err) { setEdit((x) => (x ? { ...x, busy: false } : x)); toast(err.message, { tone: 'error' }); }
  };

  const save = (e) => {
    if (e && e.preventDefault) e.preventDefault();
    const res = saveBrand({ id: edit.id || undefined, name: edit.name, description: edit.description, image: edit.image });
    if (!res.ok) {
      if (/name|brand called/.test(res.error)) { setEdit((x) => ({ ...x, err: res.error })); setTimeout(() => { const el = document.getElementById('br-name'); if (el) el.focus(); }, 0); }
      else toast(res.error, { tone: 'error' });
      return;
    }
    toast(edit.id ? res.brand.name + ' saved.' : res.brand.name + ' added.');
    setEdit(null);
  };

  const remove = async () => {
    const n = counts[edit.name.trim().toLowerCase()] || 0;
    const ok = await confirmDialog({
      title: 'Delete ' + edit.name.trim() + '?',
      body: n ? productsText(n) + ' keep the brand name, but it will no longer be in the brand list.' : 'It will no longer be in the brand list.',
      confirmLabel: 'Delete', tone: 'danger',
    });
    if (!ok) return;
    deleteBrand(edit.id);
    toast(edit.name.trim() + ' deleted.');
    setEdit(null);
  };

  const descLeft = edit ? BRAND_DESC_MAX - edit.description.length : 0;

  return (
    <div className="dc-screen ds" data-screen="Brands">
      <style dangerouslySetInnerHTML={{ __html: CSS }} />
      <div className="gc-shell">
        <Sidebar sticky="" active="products-brands" />
        <main className="gc-shell__main">
          <Topbar crumb="Products" page="Brands" />
          <div className="gc-shell__content">
            <div className="ix-page">
              <ShopHeader icon="tag" title="Brands"
                about="The brands you sell. Each brand has a name, and can have a short description and an image (its logo). Pick a brand on a product in Add product; customers can see it on the product page."
                more={[{ label: 'All products', href: '/all-products' }, { label: 'Categories', href: '/categories' }]}
                primary={{ label: 'Add brand', onClick: openNew }} />

              <section className="ix-card" aria-label="Brands">
                {ready && brands.length ? (
                  <div className="ix-bar br-bar">
                    <SearchField value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search brands" onDone={() => setQ('')} />
                    <span className="br-views" role="group" aria-label="View">
                      <button type="button" aria-pressed={view === 'gallery'} aria-label="Gallery" title="Gallery" onClick={() => pickView('gallery')}><Icon name="layout-grid" width="16" height="16" aria-hidden="true" /></button>
                      <button type="button" aria-pressed={view === 'list'} aria-label="List" title="List" onClick={() => pickView('list')}><Icon name="list" width="16" height="16" aria-hidden="true" /></button>
                    </span>
                  </div>
                ) : null}
                {!ready ? <div style={{ minHeight: 200 }} aria-busy="true" /> : !shown.length ? (
                  <div className="ix-empty">
                    {brands.length
                      ? <EmptyState icon="search" title={'No brand matches “' + q.trim() + '”'} actionLabel="Clear search" onAction={() => setQ('')} />
                      : <EmptyState icon="tag" title="No brands yet" actionLabel="Add brand" onAction={openNew} />}
                  </div>
                ) : view === 'gallery' ? (
                  <ul className="br-grid" aria-label="Brands">
                    {shown.map((b) => (
                      <li key={b.id}>
                        <button type="button" className="br-card" onClick={() => openEdit(b)} aria-label={b.name + ', ' + productsText(countOf(b))}>
                          <span className="br-stage">
                            {b.image ? <img src={b.image} alt="" /> : <span className="br-mono" style={{ background: tintOf(b.name) }} aria-hidden="true">{initialsOf(b.name)}</span>}
                          </span>
                          <span className="br-info">
                            <b>{b.name}</b>
                            <span className="br-meta">{productsText(countOf(b))}</span>
                          </span>
                        </button>
                      </li>
                    ))}
                  </ul>
                ) : (<>
                  <ul className="ix-plist" aria-label="Brands">
                    {shown.map((b) => (
                      <li key={b.id}>
                        <button type="button" className="ix-pitem ix-pitem--thumb" onClick={() => openEdit(b)}>
                          <Thumb brand={b} />
                          <span className="ix-pitem__top"><b>{b.name}</b><span className="ix-muted">{productsText(countOf(b))}</span></span>
                          <span className="ix-pitem__mid">{b.description || 'No description'}</span>
                        </button>
                      </li>
                    ))}
                  </ul>
                  <div className="ix-table-wrap">
                    <table className="ix-table">
                      <caption className="sr-only">Brands</caption>
                      <thead><tr><th scope="col">Brand</th><th scope="col">Description</th><th scope="col" className="ix-num">Products</th></tr></thead>
                      <tbody>
                        {shown.map((b) => (
                          <tr key={b.id} onClick={(e) => { if (!e.target.closest('a,button')) openEdit(b); }}>
                            <td><span className="br-who"><Thumb brand={b} /><button type="button" className="ix-strong" onClick={() => openEdit(b)}>{b.name}</button></span></td>
                            <td className="ix-muted"><span className="br-desc">{b.description || '—'}</span></td>
                            <td className="ix-num">{countOf(b)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>)}
                <div className="ix-foot"><span>{ready ? (shown.length === 1 ? '1 brand' : shown.length + ' brands') : ''}</span></div>
              </section>
              <LearnMore topic="brands" />
            </div>
          </div>
        </main>
      </div>

      <Sheet open={!!edit} title={edit && edit.id ? 'Edit brand' : 'Add brand'} onClose={close}
        footer={edit ? (
          <div className="br-foot">
            {edit.id ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral br-del" onClick={remove}>Delete</button> : null}
            <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={close}>Cancel</button>
            <button type="submit" form="br-form" className="gc-btn gc-btn--sm gc-btn--solid" disabled={edit.busy}>{edit.id ? 'Save' : 'Add brand'}</button>
          </div>
        ) : null}>
        {edit ? (
          <form id="br-form" className="br-form" onSubmit={save} noValidate>
            <div className="br-field">
              <label className="gc-label" htmlFor="br-name">Brand name</label>
              <input id="br-name" className={'gc-input' + (edit.err ? ' gc-input--error' : '')} value={edit.name} maxLength={BRAND_NAME_MAX} autoFocus
                aria-invalid={!!edit.err} aria-describedby={edit.err ? 'br-name-err' : undefined}
                onChange={(e) => put('name', e.target.value)} placeholder="For example Samsung" />
              {edit.err ? <p id="br-name-err" className="gc-help gc-help--error" role="alert">{edit.err}</p> : null}
            </div>

            <div className="br-field">
              <label className="gc-label" htmlFor="br-desc">Brand description <span className="br-opt">(optional)</span></label>
              <textarea id="br-desc" className="gc-input br-desc-in" value={edit.description} maxLength={BRAND_DESC_MAX} rows={4}
                onChange={(e) => put('description', e.target.value)} placeholder="A line or two about the brand" />
              <span className="br-count" aria-live="polite">{descLeft} left</span>
            </div>

            <div className="br-field">
              <span className="gc-label" id="br-img-lbl">Brand image <span className="br-opt">(optional)</span></span>
              <div className="br-img" role="group" aria-labelledby="br-img-lbl">
                <span className={'br-pic' + (edit.image ? ' has' : '')}>
                  {edit.image ? <img src={edit.image} alt={(edit.name.trim() || 'Brand') + ' image'} /> : <Icon name="image" width="24" height="24" aria-hidden="true" />}
                </span>
                <div className="br-acts">
                  <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" disabled={edit.busy} onClick={() => fileRef.current && fileRef.current.click()}>
                    {edit.busy ? 'Loading…' : edit.image ? 'Replace' : 'Upload image'}
                  </button>
                  {edit.image ? <button type="button" className="gc-btn gc-btn--sm gc-btn--neutral" onClick={() => put('image', '')}>Remove</button> : null}
                </div>
                <input ref={fileRef} type="file" accept="image/png,image/jpeg,image/webp" hidden onChange={pickImage} />
              </div>
              <p className="gc-help">JPG, PNG or WebP. A square logo looks best.</p>
            </div>
          </form>
        ) : null}
      </Sheet>
    </div>
  );
}
