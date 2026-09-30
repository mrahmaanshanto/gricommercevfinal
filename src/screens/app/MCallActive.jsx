'use client';
// Generated from design/templates/app/MCallActive.dc.html by scripts/convert-design.mjs.
// Merchant app · On a call
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
  position:relative;width:390px;height:844px;overflow:hidden;background:var(--bg);font-size:var(--text-sm-plus);line-height:1.5;font-family:var(--font-sans)}
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

export default class MCallActiveScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MCallActive">
        <style dangerouslySetInnerHTML={{ __html: CSS }} />
        <div className="ph">
          <div className="sb" style={{ color: "#fff" }}>
            <span className="num">2:32</span>
            <span className="r">
              <svg width="18" height="12" viewBox="0 0 18 12" aria-hidden="true" fill="#fff">
                <rect x="0" y="8" width="3" height="4" rx="1" />
                <rect x="5" y="5" width="3" height="7" rx="1" />
                <rect x="10" y="2.5" width="3" height="9.5" rx="1" />
                <rect x="15" y="0" width="3" height="12" rx="1" />
              </svg>
              <span style={{ fontSize: "var(--text-xs-plus)", fontWeight: "var(--weight-medium)" }}>4G</span>
              <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
                <rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#fff" opacity=".4" />
                <rect x="2" y="2" width="17" height="9" rx="2" fill="#fff" />
                <path d="M25 4.5v4" stroke="#fff" strokeWidth="1.5" opacity=".5" />
              </svg>
            </span>
          </div>
          <div style={{ position: "absolute", inset: "0", background: "linear-gradient(170deg,#0b1f4d 0%,#012169 45%,#0a1633 100%)" }} />
          <div style={{ position: "absolute", top: "47px", left: "0", right: "0", display: "flex", justifyContent: "space-between", padding: "6px 16px", zIndex: "5" }}>
            <__Link href="/m-calls" className="ib" aria-label="Minimise" style={{ color: "#fff" }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m6 9 6 6 6-6" />
              </svg>
            </__Link>
            <span className="pill" style={{ alignSelf: "center", background: "rgba(16,185,129,.18)", color: "#9ff0cf" }}><span className="sh ok" />Recording</span>
            <span style={{ width: "44px" }} />
          </div>
          <div style={{ position: "absolute", top: "118px", left: "0", right: "0", display: "flex", flexDirection: "column", alignItems: "center", color: "#fff" }}>
            <span style={{ padding: "5px", borderRadius: "var(--radius-full)", background: "rgba(255,255,255,.08)", boxShadow: "0 0 0 12px rgba(255,255,255,.04)" }}>
              <span className="pav" style={{ width: "96px", height: "96px" }}>
                <img className="face" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABwAHADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6bpMU6koATFGKWs3xH4i0zwpot3rOsXaWtlapvkkb9AB3YngDuaANA1x3iH4v+A/C5dNT8U6YsydYIJfPl+m1M/rXyb8V/j54k+I15LZ2s0+maDnEVjDJtMg/vTMPvn2+6PfrXnthpz3BBDQqg5IBz+goA+wYf2qPA1zeCCK21sxZwZzajb+QbNM1L9qjwVpl+bY2ur3EY/5bRQqFP0DMDXzdoVst3f21nAqqobLsBtY1QlSNJp7SbAlDlUJwT+ZpX1sVy6XPs7wh8a/AnjV1g07XYIbtuBa3n7iVvoG4b8Ca7qvzbu9JmibdLlV652ZA/Ku3+HPx78Y/Dy5gt0vpNU0hGG/T7xy67e/lueUPpg49qZJ93UVi+EfFul+N/D9prujT+baXS5APDRsPvIw7MDwR/Q1tDigAopaTrQAtFOpDQAx3WNGd2VVUZLMcADuTXw38ffjDN8S/EDWljI6eH9PdltIs/wDHw3QzsPU/wjsPcmvpX9o/xifCPwv1AQvsutVYafEQeQHBLsPogYfjXwptaWQIilmY4CqOvsKAH2xAkDMu/HY9DXa6Ha3ur4iitiEGAAB3rofAHwxhCLea1Hvlblbcnhf973r2PS9HtLWJY7e3ijUDACqAK4K2OUHyxPTw+Xua5p6HnPhzwld6ddpcyIxUDoSeKz9c+Ht2bya8hUsCcjHBFe42+ls3G0YqK70kqckcd+K4/rdS/Md31KlblPl/XPNsS0F5buGHCs1clO29s19U694ZsNTtnhvLeOUMOpHIrwTxz4ButAma4tEeW15J7lB6+4ruw+LVTSW55uKwLpe9HVHR/AH4vyfDLxH9m1CR30DUXVLtOvkN0WZR6jOG9V9wK+5EdJUWSN1dGAZWU5DA9CD6V+YqHB5r7k/Zm8Xv4p+F9pbXEm+60eQ2DknkxgZjJ/4Ccf8AAa7TgPWAOaXFFFABRS4pKAPlj9s/WnOo+G9FBOyOCa8YZ6szBB+it+deQfDTQUuL7+0pRu8tgsYPY9zXeftczST/ABQiib/VwaZAE/FnY/rVP4daU1tpcEhH3/mA+tc2JlaDsdWEhzVFfoei6bAMLhcCut0qAM65wBWPptqjIMsqkds10ul25DDJA9K8RJ8yPoG0om/aQRLHgrzUN7axujYHbrWjCkSqBuB+lNu0iMZw6g+5rucFY4FN3ucHqVsAWGa5jW7GG4geKRAwIwQa7rU7VFLb5FUeua5nUord0dIpo5XxkhWBNcKTT0O9yTjZnzF428PJoOqsIM+S/wAwFe8/sYakwu/E+ml/leK3uVXPcMyk/qK4D4oaSJ7I3Ma5MfX6VsfskXZs/idLbM2Bc6dMmPUgqw/9BP6171CfPBM+cxNPkqNI+ys0UAUtbGAUhpaDQB8i/tXWtrdeNrW9tZ453NvHaTqp5idXbIP4MP1qxaac1vYQW0UptiQq7wOVHfHvWd8b/D11aeObyPMsiyXrTqCchQ7Kw/A/0rrH0eS+Z1V9jR4VfwFefiKnu3Z6eGpWk0is3hix25GpXIlPRmkAyfzqS1XxFoVwpN9JLa5Aw5Dr+Y6Vzd94V1SZNT/064jvePsojYqBg9z646Z4rovDuha99mkmv77zbqSYFbUMNixYAxkkkHOT1P8AhgleO9zqbXN8LR3mjaybyEESZcdaq+IdckgRo4nPmkHBJ6VH4c08Wury25YNHu4OKg1HTHvNSmKkZjQlQeNxrjT1sdVjl00XUtWnae/1CcwrztL449h/Wpm0DQpIXWGeZJlH31lyy1m+I/C+vXMETaXqr+cUlS5iZ8Lk/dZeeo9Tz3qPTfCV5Dd2iw3kx2whZ/NO4M+OSM8ge1dUr8t+Y5ofFblI9Z0n7TpFxE7ecwibLkfe46msb9mlrPTPGdtq1+5iS3gliMmONzkIme+OvNd9eaX9mgMAILMjKT+FeefCnwjPe69FDMjGOWeNFC9CfM3HP0wa3oVWqbaOfEUeaok9j7Q6cUUp6n60V6R5ImaPekozQI8T/aI09Y203UUhBeRWjLDqSh3D9G/Ss3SJ1kuXJIw+1x7hgCK9W+JHh0+I/Ct1DFEZLu3/ANItwOpYDkD6qSK8L0eae0SzecFW2eU4IxgqSBx24xXmYyD1t6nr4GotE/Q9Di0aC7bdsUn1qw1jDp0TMqJux1AqDS70EKQc+1XNXlX+zpnAxtQsa4IP3fM9KS94xdNmD6mWXt3qZpBHqb5654qnoF7psOpNBJcRuyANIiONwz6jtSalqNg+pyRRXUSTKu9Yy437c9cdSKnldi7q9jpP7Etr0BzEmW68VWudMt9P4RFH0FX7K6MVuNwKnaDz6Vmapfbg7sauo1y+ZlBPm8jldcuVjuNwI2xI8jfQKTV34FWYk1cGSHEkFuZjlehIAB/HccVzuoRXGryXS2qPIxURqEUscEjPA9hXsXws8Oz6LoklzfW5hvLxwzB/vBAOAfTucV14WDfKvmcWMqJKX3Ha0o6UlLXrHjDKKKKACvIfjVpxi1OyvlHyzRlTgfxKf8CK9e5rmPiL4ebxB4dlSBN1zbHzogOpwPmH5fyrOtDmi0a0J8s0zyvQ9R/cqGPIro21CKW3aCTGxlKkf3geK4TS5fLlMTHvzVnWYNSjjW4sLyNQDhlkjLceoIPWvA5bSsfSJpxNMeDdIkmeeAtbzqOJUb5/oT1I+tWIvCOjWsyzvCs0uAzSMfnY+56/hXP6fp+p3Q82HWLcsOcvGwwfwNLe6dqdsPNuNZgDHkGGNmJP4mtuR23L9k9ztZtURl2owOBXP63qJ8hgp5NU9Jt72OLz769EzPwFWLYFHbuTmquqTh5dinKjpWLjeVib2idf8GLJptburwg4t4cZ/wBpjj+QNew5rk/hp4dfQfDqtOu25vCJnB6quPlH5c/jXWdK96jHlgkfNV5c1RsBTqbmnDpWpkMoopcUAJS/zopKAPnz4mz2WkfEG506KNbYyxR3EeOEcsOR7HOaSxulmARzweCDVP4+WgvfHrBRylnCpx9Cf61xOmeILvR3EV0GniHAOfmX8e9eTiIKUnbc9rCzcYLseqxeF4bsl4rp7f8A65nFLL4dhsTua4acju5zXPaV45sZAAbgIcdH4NLqPjSxjVv9ID+yfMTXLaVrHbzx3uX7+7SFWAOD0AFZPhbUo7rx9omm7Vnaa7QS91RRyR7k4/CuW1HxBe605itUa3hPV8/O3+Fbvwy08ab450GRv+foAk+pBH9a2owUGrnNXqOUXbY+pM5opBwKK9o8EWlBpBS0Af/Z" alt="" style={{ width: "96px", height: "96px" }} />
              </span>
            </span>
            <div style={{ fontSize: "var(--text-2xl)", fontWeight: "var(--weight-semibold)", marginTop: "16px", letterSpacing: "var(--tracking-tight)" }}>Nusrat Jahan</div>
            <div className="num" style={{ fontSize: "var(--text-sm)", opacity: ".75" }}>01711-234567 · via “Order status”</div>
            <div className="num" style={{ fontSize: "var(--text-lg)", fontWeight: "var(--weight-semibold)", marginTop: "8px", color: "#7fd4f5" }}>02:14</div>
          </div>
          <div style={{ position: "absolute", top: "356px", left: "20px", right: "20px", borderRadius: "var(--radius-xl)", background: "rgba(255,255,255,.07)", border: "1px solid rgba(255,255,255,.1)", color: "#fff", zIndex: "4" }}>
            <div style={{ display: "flex", justifyContent: "space-between", padding: "12px 14px 4px", fontSize: "var(--text-xs-plus)", color: "#cbd8ee" }}>
              <span>6 orders · ৳14,200 spent</span>
              <__Link href="/m-chat" style={{ color: "#7fd4f5", fontWeight: "var(--weight-medium)" }}>Open chat</__Link>
            </div>
            <div className="lrow" style={{ padding: "12px 14px" }}>
              <span style={{ flex: "1" }}>
                <span className="mono" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#cbd8ee" }}>#136812</span>
                <span className="num" style={{ display: "block", fontSize: "var(--text-sm)", color: "#fff" }}>3 items · ৳2,450</span>
              </span>
              <span className="pill p-nav">New</span>
            </div>
            <div className="lrow" style={{ padding: "12px 14px" }}>
              <span style={{ flex: "1" }}>
                <span className="mono" style={{ display: "block", fontSize: "var(--text-xs-plus)", color: "#cbd8ee" }}>#136440</span>
                <span className="num" style={{ display: "block", fontSize: "var(--text-sm)", color: "#fff" }}>1 item · ৳940</span>
              </span>
              <span className="pill p-ok">Delivered</span>
            </div>
          </div>
          <div style={{ position: "absolute", top: "548px", left: "0", right: "0", display: "grid", gridTemplateColumns: "repeat(4,1fr)", padding: "0 20px", zIndex: "4" }}>
            <a href="#" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#fff" }}><span style={{ width: "62px", height: "62px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.14)", color: "#fff" }}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M2 2l20 20M9 9v3a3 3 0 0 0 5.1 2.1M15 9.3V5a3 3 0 0 0-5.9-.7M19 10v2a7 7 0 0 1-.8 3.3M5 10v2a7 7 0 0 0 11.4 5.4M12 19v3" />
  </svg>
</span>Mute</a>
            <a href="#" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#fff" }}><span style={{ width: "62px", height: "62px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.14)", color: "#fff" }}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <rect x="6" y="4" width="4" height="16" rx="1" />
    <rect x="14" y="4" width="4" height="16" rx="1" />
  </svg>
</span>Hold</a>
            <a href="#" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#fff" }}><span style={{ width: "62px", height: "62px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: "#fff", color: "#003087" }}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M11 5 6 9H2v6h4l5 4Z" />
    <path d="M15.5 8.5a5 5 0 0 1 0 7M19 5a10 10 0 0 1 0 14" />
  </svg>
</span>Speaker</a>
            <a href="#" style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: "8px", fontSize: "var(--text-xs-plus)", color: "#fff" }}><span style={{ width: "62px", height: "62px", borderRadius: "var(--radius-full)", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(255,255,255,.14)", color: "#fff" }}>
  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.9" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
    <path d="M17 3l4 4-4 4M21 7H9M7 21l-4-4 4-4M3 17h12" />
  </svg>
</span>Transfer</a>
          </div>
          <div style={{ position: "absolute", left: "20px", right: "20px", bottom: "44px", display: "flex", gap: "12px", alignItems: "center", zIndex: "4" }}>
            <__Link href="/m-ticket-new" className="btn" style={{ flex: "1", height: "56px", background: "rgba(255,255,255,.12)", color: "#fff", fontSize: "var(--text-sm-plus)" }}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
  <path d="M13 5v2M13 17v2M13 11v2" />
</svg>Create ticket</__Link>
            <__Link href="/m-calls" aria-label="End call" style={{ width: "72px", height: "72px", borderRadius: "var(--radius-full)", background: "#ef4444", display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", boxShadow: "0 12px 24px -8px rgba(239,68,68,.7)" }}>
              <svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ transform: "rotate(135deg)" }} aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
              </svg>
            </__Link>
          </div>
          <div className="hi" aria-hidden="true" style={{ background: "#fff" }} />
        </div>
      </div>
    );
  }
}
