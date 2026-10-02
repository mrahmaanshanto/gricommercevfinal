'use client';
// Generated from design/templates/integrations/WooSync.dc.html by scripts/convert-design.mjs.
// WordPress sync — WooCommerce's settings (Storefront › WordPress sync): two-way WordPress and WooCommerce sync over
// the REST API, as a Shopify-style settings page: back to WooCommerce, the sync state in the header, then the API keys
// (with Test connection), what syncs (a switch per data type) and the order status mapping; on the side what needs
// attention and the latest changes; how the connection works and the matching rules are folded away.
// Edit freely: this file is now the source for the screen.

import React from 'react';
import { DCLogic, Icon as __Icon } from '@/runtime/dc';
import { Sidebar as __Sidebar, Topbar as __Topbar } from '@/shell/Shell';
import { toast as uiToast } from '@/runtime/ui';
import { InfoTip } from '@/components/ui';
import { RecordHeader } from '@/components/ui/IndexKit';

// ---- logic (from the design's <script type="text/x-dc">) ----

function assign(a, b) { for (var k in b) a[k] = b[k]; return a; }
function val(e) { return e && e.target ? e.target.value : e; }
/** Feedback as the app's toast; a problem is shown as an error. */
function say(m, bad) { uiToast(m, bad ? { tone: 'error' } : undefined); }

var FIELDS = { url: ['https://gridshop.com.bd', /^https:\/\/[a-z0-9.-]+\.[a-z]{2,}\/?$/i, 'Use the full address starting with https://', 'Store found'],
  ck: ['ck_4f81c0a2e9d7b36158ac04f2d9e1b7c63a50f8e2', /^ck_[a-f0-9]{40}$/, 'Starts with ck_ followed by 40 characters.', 'Read/Write key'],
  cs: ['cs_9a3e71bd02c84f6e5d1a7b39c0e2f8d4b6a15c73', /^cs_[a-f0-9]{40}$/, 'Starts with cs_ followed by 40 characters.', 'Saved encrypted'],
  wpu: ['gridshop-admin', /^[\w.@-]{3,60}$/, 'The WordPress login name of an administrator or editor.', 'Editor access or higher'],
  ap: ['Hq2V k8Pz 3mWt Lr9X c4Bn 7yGs', /^([A-Za-z0-9]{4} ){5}[A-Za-z0-9]{4}$/, 'Six groups of 4 letters or numbers, with spaces.', 'Saved encrypted'] };
var WHAT = [['Products', 'Variants, prices, stock, images', 'Instant', '412', '2 min ago'], ['Orders', 'Status, items, notes, customer', 'Instant', '1,284', '6 min ago'], ['Blog posts', 'Title, content, categories, SEO', 'Every 5 min', '36', '1 h ago'], ['Pages', 'About, policies, landing text', 'Every 5 min', '9', '3 days ago'], ['Customers', 'Name, phone, addresses', 'Instant', '3,902', '14 min ago'], ['Categories', 'Product and blog categories', 'Instant', '28', 'yesterday'], ['Coupons', 'Codes, amounts, limits', 'Instant', '11', '2 days ago']];
var MAP = [['New', 'processing', 'New order arrives here as New'], ['Confirmed, Packed', 'processing', 'No change'], ['With courier, In transit', 'processing', 'No change'], ['On hold', 'on-hold', 'Becomes On hold'], ['Delivered', 'completed', 'Becomes Delivered'], ['Cancelled', 'cancelled', 'Becomes Cancelled'], ['Returned', 'refunded', 'Becomes Returned']];
var LOG = [['GC → WP', 'Stock of 20W USB-C Fast Charger changed 12 → 11', '2 min ago'], ['WP → GC', 'New order #WC-48210 · Nusrat Jahan · ৳2,450', '6 min ago'], ['GC → WP', 'Order #WC-48195 marked completed', '18 min ago'], ['WP → GC', 'Price of MagSafe Clear Case — 15 changed ৳1,150 → ৳1,200', '41 min ago'], ['GC → WP', 'Blog post “Choosing a phone case” updated', '1 h ago'], ['WP → GC', 'Customer Shila Rahman address changed', '2 h ago'], ['GC → WP', 'Coupon PUJA10 created', '2 days ago']];
var FLOW = [['Create a WooCommerce API key', 'Settings, Advanced, REST API. Choose Read/Write.'], ['Create a WordPress application password', 'Users, Profile. Needed for blog posts and pages.'], ['Paste both and test', 'The store address, both keys and the password.'], ['First import', 'Products are matched by SKU; the rest are created.'], ['Live two-way sync', 'WooCommerce webhooks are set up for you, so changes arrive in seconds.']];
var RULES = [['Products are matched by SKU', 'Products without a SKU are listed below instead of being duplicated.'], ['Stock moves both ways', 'A sale on either side lowers stock on both. Online stock comes from Central Warehouse.'], ['Latest change wins', 'The other version is saved in the item’s history for 30 days.'], ['Deleting moves to trash', 'A deleted product or post goes to the trash on the other side, never removed for good.'], ['Prices in BDT', 'Store currency must be BDT (৳) in WooCommerce settings.']];

class Component extends DCLogic {
  renderVals() {
    var self = this, s = this.state || {};
    var F = s.F || {}, shown = s.shown || {}, fixed = s.fixed || {};
    var v = {}, ok = {};
    Object.keys(FIELDS).forEach(function (k) {
      var d = FIELDS[k], x = F[k] == null ? d[0] : F[k]; ok[k] = d[1].test(x); var sh = !!shown[k];
      v['f_' + k] = { v: x, type: (k === 'cs' || k === 'ap') && !sh ? 'password' : 'text', aria: sh ? 'Hide' : 'Show', shown: sh, state: ok[k] ? 'ok' : x ? 'bad' : 'idle', note: ok[k] ? d[3] : d[2],
        toggle: function () { var n = assign({}, shown); n[k] = !sh; self.setState({ shown: n }); },
        onC: function (e) { var n = assign({}, F); n[k] = String(val(e) || '').trim(); self.setState({ F: n, tested: false }); } };
    });
    var allOk = Object.keys(ok).every(function (k) { return ok[k]; });
    var wooOk = ok.url && ok.ck && ok.cs, wpOk = ok.wpu && ok.ap;
    var tested = s.tested !== false;
    var syn = s.syn || {};
    var issues = [['sku', '3 WooCommerce products have no SKU', 'They cannot be matched. Add a SKU on either side.', 'Add SKUs'], ['img', 'Image over 5 MB on “Braided Lightning Cable 1 m”', 'Skipped. Upload a smaller image in WordPress or here.', 'Replace']].filter(function (i) { return !fixed[i[0]]; });
    var nOn = WHAT.filter(function (w) { return syn[w[0]] !== false; }).length;
    var live = tested && allOk;
    return assign(v, {
      live: live,
      headline: live ? 'gridshop.com.bd is in sync · ' + nOn + ' of 7 data types on' : 'Check the API keys and test the connection',
      flow: FLOW.map(function (x, i) { return { n: i + 1, t: x[0], d: x[1], done: i < 2 || live }; }),
      testConn: function () {
        if (!wooOk) { say('Check the store address and the WooCommerce key and secret.', true); return; }
        if (!wpOk) { say('WooCommerce connected. Add the WordPress username and application password to sync blog posts and pages.', true); return; }
        self.setState({ tested: true }); say('Connected. WooCommerce REST API and WordPress REST API both answered, 412 products and 36 posts found.');
      },
      connNote: live ? 'Connected · webhooks active for orders, products, customers and coupons' : 'Not tested yet',
      what: WHAT.map(function (w) { var on = syn[w[0]] !== false; return { n: w[0], d: w[1], how: w[2], c: w[3], l: on ? w[4] : 'Paused', on: on, toggle: function () { var n = assign({}, syn); n[w[0]] = !on; self.setState({ syn: n }); say(w[0] + (on ? ' sync paused. Changes are kept and sent when it is turned back on.' : ' sync is back on.')); } }; }),
      map: MAP.map(function (m) { return { g: m[0], w: m[1], b: m[2] }; }),
      rules: RULES.map(function (r) { return { t: r[0], d: r[1] }; }),
      issues: issues.map(function (i) { return { t: i[1], d: i[2], b: i[3], fix: function () { var n = assign({}, fixed); n[i[0]] = 1; self.setState({ fixed: n }); say(i[0] === 'sku' ? 'SKUs added and the 3 products synced.' : 'New image uploaded and synced.'); } }; }),
      log: LOG.map(function (l) { return { dir: l[0], t: l[1], w: l[2], out: l[0] === 'GC → WP' }; })
    });
  }
}

// ---- styles ----

const CSS = `
.ws-body{display:flex;flex-direction:column;gap:var(--space-3)}
.ws-two{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:var(--space-3)}
.ws-field{display:flex;flex-direction:column;gap:var(--space-1);min-width:0}
.ws-field .gc-input{font-family:var(--font-data)}
.ws-secret{position:relative}
.ws-secret .gc-input{padding-right:40px}
.ws-secret .ix-btn{position:absolute;top:50%;right:2px;transform:translateY(-50%)}
.ws-note{margin:0;font-size:var(--text-xs);color:var(--text-muted)}
.ws-note--ok{color:var(--text-success)}.ws-note--bad{color:var(--text-danger)}
.ws-test{display:flex;flex-wrap:wrap;align-items:center;gap:var(--space-3);font-size:var(--text-xs);color:var(--text-muted)}
.ws-test--live{color:var(--text-success)}
.ws-h2{display:inline-flex;align-items:center;gap:4px}
.ws-rows{display:flex;flex-direction:column;margin-top:var(--space-2)}
.ws-row{display:flex;align-items:center;gap:var(--space-3);min-height:48px;padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ws-rows>.ws-row:first-child{border-top:0}
.ws-row__text{display:flex;flex-direction:column;flex:1;min-width:0}
.ws-row__text b{font-weight:var(--weight-medium);color:var(--text-heading)}
.ws-row__text small{font-size:var(--text-xs);color:var(--text-muted)}
.ws-row__meta{font-size:var(--text-xs);color:var(--text-muted);white-space:nowrap;font-variant-numeric:tabular-nums}
.ix-card__head+.ix-table-wrap{margin-top:var(--space-2)}
.ws-code{font-family:var(--font-data);font-size:var(--text-xs)}
.ws-log{display:flex;flex-direction:column}
.ws-log li{display:flex;align-items:flex-start;gap:var(--space-2);padding:var(--space-2) var(--space-4);border-top:1px solid var(--border-subtle);font-size:var(--text-sm)}
.ws-log li:first-child{border-top:0}
.ws-log li>span:last-child{display:flex;flex-direction:column;min-width:0}
.ws-log small{font-size:var(--text-xs);color:var(--text-muted)}
.ws-log .gc-badge{flex:none;white-space:nowrap}
.ws-list{display:flex;flex-direction:column;gap:var(--space-2);margin:0!important;padding:0 var(--space-4) var(--space-4)!important;list-style:none}
.ws-list li{display:flex;align-items:flex-start;gap:var(--space-2);font-size:var(--text-sm)}
.ws-list li>span:last-child{display:flex;flex-direction:column}
.ws-list small{font-size:var(--text-xs);color:var(--text-muted)}
.ws-step{display:grid;place-items:center;flex:none;width:20px;height:20px;border-radius:var(--radius-full);background:var(--surface-subtle);font-size:var(--text-xs);font-weight:var(--weight-medium);color:var(--text-body)}
.ws-step--done{background:var(--fill-success-soft);color:var(--text-success)}
.ws-ok{display:flex;align-items:center;gap:var(--space-2);margin:0;padding:var(--space-3) var(--space-4);font-size:var(--text-sm);color:var(--text-success)}
@media (max-width:640px){.ws-two{grid-template-columns:minmax(0,1fr)}.ws-row{flex-wrap:wrap}}
`;

// ---- markup ----

function Field({ id, label, f, placeholder, secret }) {
  return (
    <div className="ws-field">
      <label className="gc-label" htmlFor={id} style={{ margin: 0 }}>{label}</label>
      <div className={secret ? 'ws-secret' : undefined}>
        <input id={id} className={'gc-input' + (f.state === 'bad' ? ' gc-input--error' : '')} type={f.type} autoComplete="off" placeholder={placeholder} value={f.v} onChange={f.onC} aria-invalid={f.state === 'bad'} aria-describedby={id + '-note'} />
        {secret ? <button type="button" className="ix-btn ix-btn--sm ix-btn--icon ix-btn--plain" onClick={f.toggle} aria-label={f.aria}><__Icon name={f.shown ? 'eye-off' : 'eye'} width="16" height="16" aria-hidden="true" /></button> : null}
      </div>
      <p id={id + '-note'} className={'ws-note' + (f.state === 'ok' ? ' ws-note--ok' : f.state === 'bad' ? ' ws-note--bad' : '')}>{f.note}</p>
    </div>
  );
}

export default class WooSyncScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen ds" data-screen="WooSync">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="gc-shell">
          <__Sidebar sticky="" active="storefront-wp" />
          <main className="gc-shell__main">
            <__Topbar crumb="Storefront" page="WordPress sync" placeholder="Search" />
            <div className="gc-shell__content">
              <div className="ix-page ix-page--narrow">
                <RecordHeader back="/woocommerce" backLabel="WooCommerce" title="WordPress sync"
                  badges={v.live ? <span className="gc-badge gc-badge--success">Connected</span> : <span className="gc-badge gc-badge--slate">Not tested yet</span>}
                  meta={v.headline}
                  about="Two-way WordPress and WooCommerce sync over the REST API: keys, what syncs, status mapping, rules and change log. No plugin to install. Two API keys from WordPress are enough."
                  more={[{ label: 'WooCommerce products', href: '/woocommerce' }, { label: 'Blog posts', href: '/blog-posts' }]} />

                <div className="ix-record">
                  <div className="ix-main">
                    <section className="ix-card ix-card--open" aria-labelledby="ws-keys">
                      <header className="ix-card__head"><h2 id="ws-keys" className="ws-h2">API keys <InfoTip text="WooCommerce: Settings, Advanced, REST API, Add key, Read/Write. WordPress: Users, Profile, Application passwords." /></h2></header>
                      <div className="ix-card__body ws-body">
                        <Field id="url" label="Store address" f={v.f_url} placeholder="https://yourstore.com" />
                        <div className="ws-two">
                          <Field id="ck" label="WooCommerce consumer key" f={v.f_ck} placeholder="ck_…" />
                          <Field id="cs" label="WooCommerce consumer secret" f={v.f_cs} placeholder="cs_…" secret />
                        </div>
                        <div className="ws-two">
                          <Field id="wpu" label="WordPress username" f={v.f_wpu} placeholder="admin user" />
                          <Field id="ap" label="Application password" f={v.f_ap} placeholder="xxxx xxxx xxxx xxxx xxxx xxxx" secret />
                        </div>
                        <div className={'ws-test' + (v.live ? ' ws-test--live' : '')}>
                          <button type="button" className="ix-btn ix-btn--primary" onClick={v.testConn}>Test connection</button>
                          <span role="status">{v.connNote}</span>
                        </div>
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ws-what">
                      <header className="ix-card__head"><h2 id="ws-what">What syncs</h2></header>
                      <div className="ws-rows">
                        {(v.what || []).map((w) => (
                          <div key={w.n} className="ws-row">
                            <span className="ws-row__text"><b>{w.n}</b><small>{w.d}</small></span>
                            <span className="ws-row__meta">{w.how} · {w.c} items · {w.l}</span>
                            <button type="button" className="gc-switch" role="switch" aria-checked={w.on} aria-label={`Sync ${w.n}`} onClick={w.toggle}><span className="gc-switch__knob" /></button>
                          </div>
                        ))}
                      </div>
                    </section>

                    <section className="ix-card" aria-labelledby="ws-map">
                      <header className="ix-card__head"><h2 id="ws-map">Order status mapping</h2></header>
                      <div className="ix-table-wrap ix-table-wrap--show">
                        <table className="ix-table ix-table--static gc-table--keep">
                          <caption className="sr-only">Order status mapping</caption>
                          <thead><tr><th scope="col">GridCommerce status</th><th scope="col">Shows in WooCommerce as</th><th scope="col">From WooCommerce</th></tr></thead>
                          <tbody>
                            {(v.map || []).map((m) => (
                              <tr key={m.g}>
                                <td className="ix-strong">{m.g}</td>
                                <td><span className="gc-badge gc-badge--slate ws-code">{m.w}</span></td>
                                <td className="ix-muted">{m.b}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </section>
                  </div>

                  <div className="ix-side">
                    <section className="ix-card" aria-labelledby="ws-att">
                      <header className="ix-card__head"><h2 id="ws-att">Needs attention</h2>{v.issues && v.issues.length ? <span className="gc-badge gc-badge--warning">{v.issues.length}</span> : null}</header>
                      {v.issues && v.issues.length ? (
                        <div className="ws-rows">
                          {v.issues.map((i) => (
                            <div key={i.t} className="ws-row">
                              <span className="ws-row__text"><b>{i.t}</b><small>{i.d}</small></span>
                              <button type="button" className="ix-btn ix-btn--sm" onClick={i.fix}>{i.b}</button>
                            </div>
                          ))}
                        </div>
                      ) : <p className="ws-ok"><__Icon name="circle-check" width="16" height="16" aria-hidden="true" />Everything is in sync.</p>}
                    </section>

                    <section className="ix-card" aria-labelledby="ws-log">
                      <header className="ix-card__head"><h2 id="ws-log">Latest changes</h2></header>
                      <ul className="ws-log" style={{ margin: 'var(--space-2) 0 0', padding: 0, listStyle: 'none' }}>
                        {(v.log || []).map((g) => (
                          <li key={g.t}>
                            <span className={'gc-badge ' + (g.out ? 'gc-badge--primary' : 'gc-badge--info')}>{g.dir}</span>
                            <span><span>{g.t}</span><small>{g.w}</small></span>
                          </li>
                        ))}
                      </ul>
                    </section>

                    <details className="ix-card gc-disclose">
                      <summary>How the connection works</summary>
                      <ol className="ws-list">
                        {(v.flow || []).map((f) => (
                          <li key={f.n}>
                            <span className={'ws-step' + (f.done ? ' ws-step--done' : '')}>{f.done ? <__Icon name="check" width="12" height="12" aria-hidden="true" /> : f.n}</span>
                            <span><b className="ix-strong" style={{ fontWeight: 'var(--weight-medium)' }}>{f.t}</b><small>{f.d}</small></span>
                          </li>
                        ))}
                      </ol>
                    </details>

                    <details className="ix-card gc-disclose">
                      <summary>Matching rules</summary>
                      <ul className="ws-list">
                        {(v.rules || []).map((r) => (
                          <li key={r.t}><span><b className="ix-strong" style={{ fontWeight: 'var(--weight-medium)' }}>{r.t}</b><small>{r.d}</small></span></li>
                        ))}
                      </ul>
                    </details>
                  </div>
                </div>
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }
}
