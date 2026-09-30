'use client';
// Generated from design/templates/app/OnbProduct.dc.html by scripts/convert-design.mjs.
// App · Onboarding · Products
// Edit freely: this file is now the source for the screen.

import React from 'react';
import __Link from 'next/link';
import { DCLogic, Icon as __Icon, A as __A, list as __list, sx as __sx } from '@/runtime/dc';

// ---- logic (from the design's <script type="text/x-dc">) ----

class Component extends DCLogic {
  renderVals() { return {}; }
}

// ---- styles (from the design's <helmet>) ----

const CSS = `
*{box-sizing:border-box}
body{margin:0;background:#dfe5ee;font-family:var(--font-sans);-webkit-font-smoothing:antialiased;color:#0f172a}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.bn{font-family:var(--font-bn)}
.mono{font-family:var(--font-data)}
.num{font-variant-numeric:tabular-nums}
.ph{--brand:#003087;--brand2:#0a4bb5;--sky:#009cde;--ink:#0f172a;--body:#475569;--muted:var(--text-muted);--line:#e8edf3;--bg:#f5f7fa;--card:#ffffff;--soft:#eef3fa;
  --ok:#0f9f6e;--okbg:#e7f7f0;--warn:#b45309;--warnbg:#fff4e0;--err:#c2410c;--errbg:#ffece5;
  position:relative;width:min(390px,100%);height:844px;overflow:hidden;background:var(--bg);font-size:var(--text-sm-plus);line-height:1.5;font-family:var(--font-sans)}
.sb{position:absolute;top:0;left:0;right:0;height:47px;display:flex;align-items:center;justify-content:space-between;padding:0 28px 0 34px;font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);z-index:6}
.sb .r{display:flex;gap:6px;align-items:center}
.appbar{position:absolute;top:47px;left:0;right:0;height:56px;display:flex;align-items:center;gap:4px;padding:0 8px;z-index:5;background:var(--bg)}
.appbar h1{flex:1;margin:0;font-size:var(--text-lg);font-weight:var(--weight-semibold);text-align:center;letter-spacing:0}
.ib{width:36px;height:36px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:var(--radius-full);background:transparent;color:var(--ink);position:relative;cursor:pointer}
.ib.soft{background:var(--card);box-shadow:0 1px 2px rgba(15,23,42,.06)}
.dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:var(--radius-full);background:#ff5724;border:2px solid var(--card)}
.big{padding:4px 20px 0}
.big .eyebrow{font-size:var(--text-xs-plus);color:var(--muted)}
.big h1{margin:2px 0 0;font-size:var(--text-3xl);line-height:38px;font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight)}
.content{position:absolute;left:0;right:0;overflow:hidden}
.pad{padding:0 20px}
.card{background:var(--card);border-radius:var(--radius-xl);box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -16px rgba(15,23,42,.18)}
.sec{display:flex;align-items:baseline;justify-content:space-between;margin:24px 20px 10px}
.sec h2{margin:0;font-size:var(--text-base);font-weight:var(--weight-semibold)}
.sec a{font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--brand)}
.row{display:flex;align-items:center;gap:14px;min-height:64px;padding:12px 16px}
.row + .row{border-top:1px solid var(--line)}
.row .t{font-size:var(--text-sm-plus);font-weight:var(--weight-semibold);color:var(--ink);line-height:20px}
.row .s{font-size:var(--text-xs-plus);color:var(--muted);line-height:18px}
.row .m{min-width:0;flex:1}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.av{flex:none;width:44px;height:44px;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);font-size:var(--text-sm-plus)}
.ico{flex:none;width:44px;height:44px;border-radius:var(--radius-xl);display:flex;align-items:center;justify-content:center;background:var(--soft);color:var(--brand)}
.pill{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:var(--radius-full);font-size:var(--text-xs);font-weight:var(--weight-medium);white-space:nowrap}
.p-ok{background:var(--okbg);color:var(--ok)}.p-warn{background:var(--warnbg);color:var(--warn)}.p-err{background:var(--errbg);color:var(--err)}.p-nav{background:var(--soft);color:var(--brand)}.p-grey{background:#eef1f5;color:#475569}
.sh{width:8px;height:8px;flex:none}.sh.ok{border-radius:var(--radius-full);background:currentColor}.sh.warn{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid currentColor}.sh.err{transform:rotate(45deg);width:7px;height:7px;background:currentColor;border-radius:1px}
.chips{display:flex;gap:8px;padding:0 20px;overflow:hidden}
.chip{flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:var(--radius-full);border:1px solid var(--line);background:var(--card);font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--body);white-space:nowrap}
.chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.chip .n{font-size:var(--text-xs);font-weight:var(--weight-medium);opacity:.7}
.seg{display:flex;margin:0 20px;padding:4px;border-radius:var(--radius-xl);background:#e9eef5}
.seg span{flex:1;height:36px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:var(--radius-lg);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body)}
.seg span.on{background:var(--card);color:var(--ink);font-weight:var(--weight-medium);box-shadow:0 1px 3px rgba(15,23,42,.1)}
.srch{display:flex;align-items:center;gap:10px;height:48px;margin:0 20px;padding:0 6px 0 16px;border-radius:var(--radius-xl);background:var(--card);border:1px solid var(--line);color:var(--muted);font-size:var(--text-sm-plus)}
.srch .sc{margin-left:auto;width:36px;height:36px;border-radius:var(--radius-lg);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:44px;padding:0 18px;border:0;border-radius:var(--radius-lg);font-size:var(--text-sm);font-weight:var(--weight-medium);cursor:pointer}
.btnp{background:var(--brand);color:#fff}.btns{background:var(--soft);color:var(--brand)}.btnl{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.btnd{background:var(--errbg);color:var(--err)}
.fab{position:absolute;right:20px;bottom:96px;width:56px;height:56px;border-radius:var(--radius-xl);background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(0,48,135,.55);z-index:5}
.tabfade{position:absolute;left:0;right:0;bottom:0;height:108px;background:linear-gradient(to top,var(--bg) 42%,rgba(245,247,250,0));pointer-events:none;z-index:5}
.tabs{position:absolute;left:28px;right:28px;bottom:24px;height:56px;padding:4px;display:flex;gap:2px;border-radius:28px;background:rgba(255,255,255,.78);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);border:1px solid rgba(255,255,255,.95);box-shadow:0 14px 34px -12px rgba(15,23,42,.30),0 2px 6px -2px rgba(15,23,42,.08),inset 0 0 0 .5px rgba(15,23,42,.05);z-index:6}
.tabs a{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:var(--radius-xl);font-size:var(--text-2xs);line-height:15px;font-weight:var(--weight-medium);color:var(--text-muted);transition:background-color .2s,color .2s}
.tabs a.on{background:rgba(0,48,135,.08);color:var(--brand);font-weight:var(--weight-medium)}
.tabs .tw{position:relative;display:flex}
.cnt{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:var(--radius-lg);background:var(--fill-danger);color:#fff;font-family:var(--font-sans);font-size:var(--text-xs);line-height:1;font-weight:var(--weight-medium);letter-spacing:0;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
.tabs .cnt{position:absolute;top:-6px;left:12px;border:2px solid #fff;min-width:19px;height:17px;padding:0 4px;font-size:var(--text-2xs);border-radius:var(--radius-lg)}
.cnt.nav{background:var(--brand)}
.hi{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;border-radius:var(--radius-full);background:#0f172a;z-index:7}
.actbar{position:absolute;left:0;right:0;bottom:0;padding:12px 20px 34px;display:flex;gap:10px;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-top:1px solid var(--line);z-index:6}
.actbar .btn{flex:1}
.field{display:flex;flex-direction:column;gap:6px}
.lab{font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--ink)}
.inp{height:44px;display:flex;align-items:center;gap:10px;padding:0 14px;border-radius:var(--radius-lg);border:1px solid #dbe2ec;background:var(--card);font-size:var(--text-sm);color:var(--ink)}
.inp.f{border-color:var(--brand);box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.help{font-size:var(--text-xs-plus);color:var(--muted)}
.step{display:inline-flex;align-items:center;border:1px solid #dbe2ec;border-radius:var(--radius-xl);background:var(--card)}
.step b{min-width:34px;text-align:center;font-size:var(--text-sm-plus)}
.step span{width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:var(--brand)}
.sw{position:relative;flex:none;width:50px;height:30px;border-radius:var(--radius-full);background:#cbd5e1}.sw::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:var(--radius-full);background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.sw.on{background:var(--brand)}.sw.on::after{left:23px}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.45);z-index:8}
.sheet{position:absolute;left:0;right:0;bottom:0;background:var(--card);border-radius:28px 28px 0 0;padding:10px 20px 34px;z-index:9}
.grab{width:40px;height:5px;margin:0 auto 14px;border-radius:var(--radius-full);background:#d5dce6}
.k{font-size:var(--text-xs-plus);color:var(--muted)}.v{font-size:var(--text-2xl);font-weight:var(--weight-semibold);letter-spacing:var(--tracking-tight)}
.tile{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:var(--text-xs-plus);font-weight:var(--weight-medium);color:var(--ink);text-align:center}
.tile .ico{width:56px;height:56px;border-radius:var(--radius-xl)}
.note{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:var(--radius-xl);font-size:var(--text-sm);line-height:20px}

.pav{position:relative;flex:none;width:52px;height:52px}
.pav .face{width:52px;height:52px;border-radius:var(--radius-full);object-fit:cover;display:flex;align-items:center;justify-content:center;font-weight:var(--weight-semibold);font-size:var(--text-base)}
.pav .pb{position:absolute;right:-3px;bottom:-3px;width:22px;height:22px;border-radius:var(--radius-full);background:#fff;padding:2px;box-shadow:0 1px 3px rgba(15,23,42,.18)}
.pav .pb img{width:18px;height:18px;display:block;border-radius:var(--radius-full)}
.pav .on{position:absolute;right:1px;top:1px;width:12px;height:12px;border-radius:var(--radius-full);background:#10b981;border:2px solid #fff}
.pchip{flex:none;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 14px 0 8px;border-radius:var(--radius-full);border:1px solid var(--line);background:var(--card);font-size:var(--text-sm);font-weight:var(--weight-medium);color:var(--body);white-space:nowrap}
.pchip img{width:22px;height:22px;border-radius:var(--radius-full)}
.pchip.on{background:var(--ink);color:#fff;border-color:var(--ink);padding-left:14px}
.bar{height:6px;border-radius:var(--radius-full);background:#edf1f6;overflow:hidden}.bar i{display:block;height:100%;border-radius:var(--radius-full)}
.lrow{display:flex;align-items:center;gap:14px;padding:14px 16px}
.lrow + .lrow{border-top:1px solid var(--line)}
`;

// ---- markup ----

export default class OnbProductScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="OnbProduct">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ph">
          <div className="sb" style={{ color: "#0f172a" }}>
            <span className="num">2:32</span>
            <span className="r">
              <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" fill="#0f172a">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5" width="3" height="7" rx="1" />
                <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>4G</span>
              <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
                <rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#0f172a" opacity=".4" />
                <rect x="2" y="2" width="17" height="9" rx="2" fill="#0f172a" />
                <path d="M25 4.5v4" stroke="#0f172a" strokeWidth="1.5" opacity=".5" />
              </svg>
            </span>
          </div>
          <header style={{ position: "absolute", top: "47px", left: "0", right: "0", display: "flex", alignItems: "center", gap: "10px", padding: "6px 16px 0 8px", zIndex: "5" }}>
            <__Link href="/onb-channels" className="ib" aria-label="Back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </__Link>
            <div style={{ flex: "1", display: "flex", gap: "6px" }}>
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#003087" }} />
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#003087" }} />
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#003087" }} />
              <span style={{ flex: "1", height: "5px", borderRadius: "var(--radius-full)", background: "#003087" }} />
            </div>
            <span className="num" style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)", color: "var(--muted)", width: "44px", textAlign: "right" }}>4/4</span>
          </header>
          <div className="content" style={{ top: "103px", bottom: "98px", padding: "14px 24px 0" }}>
            <h1 style={{ margin: "0", fontSize: "var(--text-3xl)", lineHeight: "38px", fontWeight: "var(--weight-semibold)", letterSpacing: "var(--tracking-tight)" }}>Add your first products</h1>
            <p style={{ margin: "8px 0 0", fontSize: "var(--text-sm-plus)", color: "var(--body)" }}>Pick the easiest way. You can add more any time.</p>
            <div className="card" style={{ marginTop: "22px" }}>
              <a href="#" className="lrow" style={{ background: "#f3f7fd" }}>
                <span className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
                    <circle cx="12" cy="13" r="3" />
                  </svg>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Take photos</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Snap a product, we fill the rest</span>
                </span>
                <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", flex: "none", background: "var(--brand)", boxShadow: "inset 0 0 0 6px var(--brand),inset 0 0 0 9px #fff" }} />
              </a>
              <a href="#" className="lrow">
                <span className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M3 7V5a2 2 0 0 1 2-2h2M17 3h2a2 2 0 0 1 2 2v2M21 17v2a2 2 0 0 1-2 2h-2M7 21H5a2 2 0 0 1-2-2v-2M7 8v8M10 8v8M14 8v8M17 8v8" />
                  </svg>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Scan barcodes</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>For boxed and branded items</span>
                </span>
                <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", flex: "none", border: "2px solid #cbd5e1" }} />
              </a>
              <a href="#" className="lrow">
                <img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADAAAAAwCAYAAABXAvmHAAAJeUlEQVR42s1aW4ydVRX+1tr7n3PmnLmcUukdjaCo0JAUBLk0Sgw+mPjgbQaJkPCgNmqgAaEtBjPpA7dpsSkkJkSfCDF1JsEXfZEHJEGLYK2YAkZqCem0zLT2Mpdz/f+9Ph/+c+Z6ZnrOoVx2sifnnPn3v9e37mvtLWh3DFFxNQSDEho/rX+o8nkIt9J4I2ibIbyMREFg3QBAaFmA8xCMQdwRgb3CYC+PD/e9NfveETq8AWK3WDvkSOuPUjACbRC+cUdxU3AYAPBt0K4Tn+uGCGABtBigpRMARAFRiHpAPUDCknJZxB0C5HkXwuiJ4fzYLJBBGCC8eACGqA3OrNl1/nLV7P0A79SubD8DwbgEWDAICEIgEEAWvZus/zf9q04lykGcwKrlKYE+F1h58tTjhWOL93x/AEboMCgBP/p7tG71VTsh8qBG2T6rlgBLEgDanOALSjQFBBjUe83kYHFlCuSe8aPHhjG6uTa7d8cAhuixW5I1D5y9xmVyv5Yoc4NVioCFBALXPtErgglQ5zWbR6hVX7Py5A9P71v7eoOG9gHUF6598PztGnX/Bs73sDqdQOQiEt4MCINkej1CMmNx+QcTewq/WwmErEj8jsl7NdOzn3EFsDhA1OHDGLQAjZxEWVh1ZvvEcP9Ty4GQlYh33X37rTITQBOIaKf0iAAqc5tx0cZMeQ/jAmEYVKmZHhdmzm2fePKSpiCkmcGue/DMgGRXjbBWSsDgIJ2pjABwClQToBQDSSCkDqRBdApOkPFA1qe/zwNBiAvSlfOsTA2O7ymMLjZsWewq1+44c7X43Kswy8JigWhHxKsAiQFTFWJTQcKXPu14zQbF+oIiUrgkIJmsUE5NgyfOB3lrnPL2KXPepcDmqROhEaFaYVK6YWJ49RvzXazMBqkB6HW3Qcfemf6bRvktrE53rPNOgVINyHfR7r8tE75/faRrelVXcBp84a0Y33ymLKtygmBLbUIyvc7i4uHVmd4b33wTAaNpsEv1egSKUQknjk7udNneLaxMJ50SrwIUa8CmAsKf7snbfV/NRGt61RkhiaVSmT+rCRAMEtsKeirqWJlOXHfvlrOlyR0YlYARKAAohqgYhK3fWfokXfSQVUoGFdepsSYG9HbRnt+W4xfWOx+HVCVUAK/Np9MWIqqKs3LJ4KNd63ee/SQGYRiipokZhIZ4l8vmcrDEOvXzToCpMvHw17PhM5emxEfLRA0jEGxuGltgjyWmmVze4HaludKfUwO99IGZdc7jKCA5MEEnAESAOABreiW8urMH3RGcoGlGBMhSjr/4nwTf+FUJTW1g/mrxAFkMAZ89vbdn3AOAc+EOzfblrTSVQMR3rPtV4NZrHfNdcMEAXRQ5OAeI/z0dwsQUNaGoCnD4uMHrIg/UXAqJ5vp6UJ66A8C+OrEywGDs1N833JmR+OKnHNgkF7a6HYydC+GnByp85Z2g1QRCEYCEU0G+Sy6sSgJhMIIyAGCf37Br8spAXIu4LAA6jrYEECm5qSCQZfxlMPAnByr84xHz6/oF3s1R1QhsLbBKGZeFgi0bdk1eqTT5ikb5TGq86FgCJKAqko3gsAz3j/0vhIPHgq7vT2sd49xsjfg6WktMo3w2oXxZKbgprZiEuAhDmkTuBnHjU3RxgJKLUob2NyFEocDNSmIzLAGIDyhFnr/vReISIbAEAK72IthEi5FWVe25zcXfW3EBjedkGSm1qESS1t28zJNcJbS2fX8SFqqB1uPASoSQ6TNxWBq4tJ5yt8w+GihS8CLIzHYP2hiFnKSRah4B2SiNvMuNyAGf6BH0zHOXjdqgHBOVuA020iBkVtbtmAztFiuBwB9+nMOVa3XWwzSo6ckK/DJvSwyYqXCB/pgBqsL7Rsth9B+JL+SwQiReIlLzFFRFtLtdKRRygkJ3e3bvNV3XbJycNHHahi2IgghVFeI8RNs1o9QG6gkZOTdbiReN2fD/0xXj2Hki8q26VxLiIJBzCpHjohHqPZq2vFCz2c66xvdT0+TZGZOoVQkQFPUAOKYgjkB9I5q3FXmbzbYkUJfeu+fIYo2i2rIbZdqilCMqgoNpH5NtKXSXT7nntHMJ+Hqt8O6ZgFpow5OQAhqMOOjV+FISFyuiPgsaW82HTk4S+S4u8EIEsTqvyCyTkFcT4EzRZmNmsJQB/xyrG3CrcVi9WlysROBLAgBrd079RbvyN7E2Y0Br5WSXX4g0rYWJ32/L4+bL3Sxx8wn967GAbz1TXJI210I7LoRBunrUasWDE0/03eIBQMlRcXoz2XpGVImXRtJSLY0RK8WPUi19dj6Atho3BMWpKDmKRv6fmDtgleIMdElXZsX6t9mUCzW6mqxpy3Wod1YpziTmDtS7Ei/603t7xmnhWc3mBERotYBpNjtZ1wb3g2ZzQgvPnt7bM46hF70CtxpAcVH0uFVLRajXdoPahzOYGm+1VHRR9DhAAW61tEU3Aj35SO44QvyYZnMKY/jY0W8Mms0pQvzYyUdyxzECxW6x1E8MwjBAt/GK/uFQmT4s2V4P2scHBC1ItteH0vThjVf0D2OgcY42W8QLcRV4aJvEIriToVaCRgJ2kGdffM0xaCQMtRIQ33Vom8S4aq7xMRf8dothhG78sb43EZfulqhbIc7Aj9Ae0va6SdStiKt3TwyvfgMjdPMP/xZG70EJGKIf37N61MpT92o276FqH4kk0gMO02zeW23q3vE9hVEM0S8+9FuafuyWBEP0E3sLT4fyue0S5RzU64dqE7QA9SpRzoXy1PaJJwpPL3fE1Dx/aoAYvuQpq07fLupmJNPrQEs+WBdLgpZIpteJ+hmrTH9vpfMxrNiJmwVRGAm10i2w+FXN9XuIE5AXGQgJMoE40Vy/R4hfS8rnt17ohBIXbCXulgQjdKf2XvKv904f2Wq18sNQP6ndfR7i60AQOgNDgrSUcC/a3eehbsqq5V+89/bRraf3rX29brDJimXqBfdJDVuxW+Jx4JG1Pzv3WyPuh8hdmuubu2rAenGZ1hXN2qNMPVo9ZRSn0pUTcaJWK09aXH7OrPbLBVcNLnBKD7yPyx6bfl7cGOi+S4bvALzOdXXnZqqCF+4RXL9x4VFq4/NrJ4CvPW3oyQChVi5B3SGBPO8QRscezZ8A0PZljzbOAoQYRGhctxkblBMA9gPYv+Hhyuck1LZazW5kktkMuMvMsMopsvXWScUpzjEJYxZXj4jjKyL+5fcezf579vWN6zYtcH3++D8ZTj+fqKWvjgAAAABJRU5ErkJggg==" alt="" style={{ width: "44px", height: "44px", borderRadius: "var(--radius-xl)" }} />
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Import from Facebook</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Copy products from your page shop</span>
                </span>
                <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", flex: "none", border: "2px solid #cbd5e1" }} />
              </a>
              <a href="#" className="lrow">
                <span className="ico">
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                    <path d="M15 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V7Z" />
                    <path d="M14 2v5h5M9 13h6M9 17h4" />
                  </svg>
                </span>
                <span style={{ flex: "1", minWidth: "0" }}>
                  <span style={{ display: "block", fontSize: "var(--text-sm-plus)", fontWeight: "var(--weight-semibold)" }}>Upload a sheet</span>
                  <span style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "var(--muted)" }}>Excel or CSV from your old system</span>
                </span>
                <span style={{ width: "22px", height: "22px", borderRadius: "var(--radius-full)", flex: "none", border: "2px solid #cbd5e1" }} />
              </a>
            </div>
            <p style={{ margin: "16px 0 0", fontSize: "var(--text-sm)", color: "var(--muted)", textAlign: "center" }}>Need help? Our team can add your first 50 products for free. <a href="#" style={{ color: "var(--brand)", fontWeight: "var(--weight-medium)" }}>Ask us</a></p>
          </div>
          <div className="actbar">
            <__Link href="/onb-done" className="btn btnl">Skip</__Link>
            <__Link href="/onb-done" className="btn btnp" style={{ flex: "2" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3z" />
  <circle cx="12" cy="13" r="3" />
</svg>Open camera</__Link>
          </div>
        </div>
      </div>
    );
  }
}
