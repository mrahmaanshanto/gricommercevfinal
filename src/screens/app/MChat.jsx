'use client';
// Generated from design/templates/app/MChat.dc.html by scripts/convert-design.mjs.
// Merchant app · Chat
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
body{margin:0;background:#dfe5ee;font-family:'Poppins',system-ui,sans-serif;-webkit-font-smoothing:antialiased;color:#0f172a}
a{color:inherit;text-decoration:none}
button{font:inherit;color:inherit}
.bn{font-family:'Hind Siliguri','Poppins',sans-serif}
.mono{font-family:'JetBrains Mono',ui-monospace,monospace}
.num{font-variant-numeric:tabular-nums}
.ph{--brand:#003087;--brand2:#0a4bb5;--sky:#009cde;--ink:#0f172a;--body:#475569;--muted:#64748b;--line:#e8edf3;--bg:#f5f7fa;--card:#ffffff;--soft:#eef3fa;
  --ok:#0f9f6e;--okbg:#e7f7f0;--warn:#b45309;--warnbg:#fff4e0;--err:#c2410c;--errbg:#ffece5;
  position:relative;width:390px;height:844px;overflow:hidden;background:var(--bg);font-size:15px;line-height:1.5;font-family:'Poppins','Hind Siliguri',system-ui,sans-serif}
.sb{position:absolute;top:0;left:0;right:0;height:47px;display:flex;align-items:center;justify-content:space-between;padding:0 28px 0 34px;font-size:15px;font-weight:600;z-index:6}
.sb .r{display:flex;gap:6px;align-items:center}
.appbar{position:absolute;top:47px;left:0;right:0;height:56px;display:flex;align-items:center;gap:4px;padding:0 8px;z-index:5;background:var(--bg)}
.appbar h1{flex:1;margin:0;font-size:17px;font-weight:600;text-align:center;letter-spacing:-.01em}
.ib{width:44px;height:44px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:14px;background:transparent;color:var(--ink);position:relative;cursor:pointer}
.ib.soft{background:var(--card);box-shadow:0 1px 2px rgba(15,23,42,.06)}
.dot{position:absolute;top:9px;right:10px;width:8px;height:8px;border-radius:99px;background:#ff5724;border:2px solid var(--card)}
.big{padding:4px 20px 0}
.big .eyebrow{font-size:13px;color:var(--muted)}
.big h1{margin:2px 0 0;font-size:28px;line-height:34px;font-weight:700;letter-spacing:-.025em}
.content{position:absolute;left:0;right:0;overflow:hidden}
.pad{padding:0 20px}
.card{background:var(--card);border-radius:20px;box-shadow:0 1px 2px rgba(15,23,42,.04),0 8px 24px -16px rgba(15,23,42,.18)}
.sec{display:flex;align-items:baseline;justify-content:space-between;margin:24px 20px 10px}
.sec h2{margin:0;font-size:16px;font-weight:600}
.sec a{font-size:14px;font-weight:500;color:var(--brand)}
.row{display:flex;align-items:center;gap:14px;min-height:64px;padding:12px 16px}
.row + .row{border-top:1px solid var(--line)}
.row .t{font-size:15px;font-weight:600;color:var(--ink);line-height:20px}
.row .s{font-size:13px;color:var(--muted);line-height:18px}
.row .m{min-width:0;flex:1}
.ell{white-space:nowrap;overflow:hidden;text-overflow:ellipsis}
.av{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:15px}
.ico{flex:none;width:44px;height:44px;border-radius:14px;display:flex;align-items:center;justify-content:center;background:var(--soft);color:var(--brand)}
.pill{display:inline-flex;align-items:center;gap:5px;height:24px;padding:0 9px;border-radius:99px;font-size:12px;font-weight:600;white-space:nowrap}
.p-ok{background:var(--okbg);color:var(--ok)}.p-warn{background:var(--warnbg);color:var(--warn)}.p-err{background:var(--errbg);color:var(--err)}.p-nav{background:var(--soft);color:var(--brand)}.p-grey{background:#eef1f5;color:#475569}
.sh{width:8px;height:8px;flex:none}.sh.ok{border-radius:99px;background:currentColor}.sh.warn{width:0;height:0;border-left:5px solid transparent;border-right:5px solid transparent;border-bottom:8px solid currentColor}.sh.err{transform:rotate(45deg);width:7px;height:7px;background:currentColor;border-radius:1px}
.chips{display:flex;gap:8px;padding:0 20px;overflow:hidden}
.chip{flex:none;display:inline-flex;align-items:center;gap:6px;height:36px;padding:0 14px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:14px;font-weight:500;color:var(--body);white-space:nowrap}
.chip.on{background:var(--ink);border-color:var(--ink);color:#fff}
.chip .n{font-size:12px;font-weight:600;opacity:.7}
.seg{display:flex;margin:0 20px;padding:4px;border-radius:14px;background:#e9eef5}
.seg span{flex:1;height:36px;display:flex;align-items:center;justify-content:center;gap:6px;border-radius:10px;font-size:14px;font-weight:500;color:var(--body)}
.seg span.on{background:var(--card);color:var(--ink);font-weight:600;box-shadow:0 1px 3px rgba(15,23,42,.1)}
.srch{display:flex;align-items:center;gap:10px;height:48px;margin:0 20px;padding:0 6px 0 16px;border-radius:16px;background:var(--card);border:1px solid var(--line);color:var(--muted);font-size:15px}
.srch .sc{margin-left:auto;width:36px;height:36px;border-radius:11px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center}
.btn{display:inline-flex;align-items:center;justify-content:center;gap:8px;height:52px;padding:0 20px;border:0;border-radius:16px;font-size:16px;font-weight:600;cursor:pointer}
.btnp{background:var(--brand);color:#fff}.btns{background:var(--soft);color:var(--brand)}.btnl{background:var(--card);color:var(--ink);border:1px solid var(--line)}
.btnd{background:var(--errbg);color:var(--err)}
.fab{position:absolute;right:20px;bottom:96px;width:56px;height:56px;border-radius:20px;background:var(--brand);color:#fff;display:flex;align-items:center;justify-content:center;box-shadow:0 12px 24px -8px rgba(0,48,135,.55);z-index:5}
.tabfade{position:absolute;left:0;right:0;bottom:0;height:108px;background:linear-gradient(to top,var(--bg) 42%,rgba(245,247,250,0));pointer-events:none;z-index:5}
.tabs{position:absolute;left:28px;right:28px;bottom:24px;height:56px;padding:4px;display:flex;gap:2px;border-radius:28px;background:rgba(255,255,255,.78);backdrop-filter:blur(20px) saturate(1.6);-webkit-backdrop-filter:blur(20px) saturate(1.6);border:1px solid rgba(255,255,255,.95);box-shadow:0 14px 34px -12px rgba(15,23,42,.30),0 2px 6px -2px rgba(15,23,42,.08),inset 0 0 0 .5px rgba(15,23,42,.05);z-index:6}
.tabs a{flex:1;min-width:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:1px;border-radius:24px;font-size:10px;line-height:12px;font-weight:500;color:#64748b;transition:background-color .2s,color .2s}
.tabs a.on{background:rgba(0,48,135,.08);color:var(--brand);font-weight:600}
.tabs .tw{position:relative;display:flex}
.cnt{box-sizing:border-box;display:inline-flex;align-items:center;justify-content:center;min-width:20px;height:20px;padding:0 6px;border-radius:10px;background:#ff5724;color:#fff;font-family:'Poppins',system-ui,sans-serif;font-size:11px;line-height:1;font-weight:700;letter-spacing:0;font-variant-numeric:tabular-nums lining-nums;white-space:nowrap}
.tabs .cnt{position:absolute;top:-6px;left:12px;border:2px solid #fff;min-width:19px;height:17px;padding:0 4px;font-size:9.5px;border-radius:9px}
.cnt.nav{background:var(--brand)}
.hi{position:absolute;bottom:8px;left:50%;transform:translateX(-50%);width:134px;height:5px;border-radius:99px;background:#0f172a;z-index:7}
.actbar{position:absolute;left:0;right:0;bottom:0;padding:12px 20px 34px;display:flex;gap:10px;background:rgba(255,255,255,.96);backdrop-filter:blur(12px);border-top:1px solid var(--line);z-index:6}
.actbar .btn{flex:1}
.field{display:flex;flex-direction:column;gap:6px}
.lab{font-size:13px;font-weight:600;color:var(--ink)}
.inp{height:52px;display:flex;align-items:center;gap:10px;padding:0 16px;border-radius:14px;border:1px solid #dbe2ec;background:var(--card);font-size:16px;color:var(--ink)}
.inp.f{border-color:var(--brand);box-shadow:0 0 0 3px rgba(0,48,135,.12)}
.help{font-size:12.5px;color:var(--muted)}
.step{display:inline-flex;align-items:center;border:1px solid #dbe2ec;border-radius:12px;background:var(--card)}
.step b{min-width:34px;text-align:center;font-size:15px}
.step span{width:36px;height:36px;display:flex;align-items:center;justify-content:center;color:var(--brand)}
.sw{position:relative;flex:none;width:50px;height:30px;border-radius:99px;background:#cbd5e1}.sw::after{content:"";position:absolute;top:3px;left:3px;width:24px;height:24px;border-radius:99px;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.2)}
.sw.on{background:var(--brand)}.sw.on::after{left:23px}
.scrim{position:absolute;inset:0;background:rgba(15,23,42,.45);z-index:8}
.sheet{position:absolute;left:0;right:0;bottom:0;background:var(--card);border-radius:28px 28px 0 0;padding:10px 20px 34px;z-index:9}
.grab{width:40px;height:5px;margin:0 auto 14px;border-radius:99px;background:#d5dce6}
.k{font-size:12.5px;color:var(--muted)}.v{font-size:22px;font-weight:700;letter-spacing:-.02em}
.tile{display:flex;flex-direction:column;align-items:center;gap:8px;font-size:12.5px;font-weight:500;color:var(--ink);text-align:center}
.tile .ico{width:56px;height:56px;border-radius:18px}
.note{display:flex;gap:12px;align-items:flex-start;padding:14px 16px;border-radius:18px;font-size:14px;line-height:20px}

.pav{position:relative;flex:none;width:52px;height:52px}
.pav .face{width:52px;height:52px;border-radius:99px;object-fit:cover;display:flex;align-items:center;justify-content:center;font-weight:600;font-size:16px}
.pav .pb{position:absolute;right:-3px;bottom:-3px;width:22px;height:22px;border-radius:99px;background:#fff;padding:2px;box-shadow:0 1px 3px rgba(15,23,42,.18)}
.pav .pb img{width:18px;height:18px;display:block;border-radius:99px}
.pav .on{position:absolute;right:1px;top:1px;width:12px;height:12px;border-radius:99px;background:#10b981;border:2px solid #fff}
.pchip{flex:none;display:inline-flex;align-items:center;gap:7px;height:38px;padding:0 14px 0 8px;border-radius:99px;border:1px solid var(--line);background:var(--card);font-size:14px;font-weight:500;color:var(--body);white-space:nowrap}
.pchip img{width:22px;height:22px;border-radius:99px}
.pchip.on{background:var(--ink);color:#fff;border-color:var(--ink);padding-left:14px}
.bar{height:6px;border-radius:99px;background:#edf1f6;overflow:hidden}.bar i{display:block;height:100%;border-radius:99px}
.lrow{display:flex;align-items:center;gap:14px;padding:14px 16px}
.lrow + .lrow{border-top:1px solid var(--line)}
`;

// ---- markup ----

export default class MChatScreen extends Component {
  render() {
    const v = this.renderVals() || {};
    return (
      <div className="dc-screen" data-screen="MChat">
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
              <span style={{ fontSize: "13px", fontWeight: "600" }}>4G</span>
              <svg width="27" height="13" viewBox="0 0 27 13" aria-hidden="true">
                <rect x=".5" y=".5" width="23" height="12" rx="3.5" fill="none" stroke="#0f172a" opacity=".4" />
                <rect x="2" y="2" width="17" height="9" rx="2" fill="#0f172a" />
                <path d="M25 4.5v4" stroke="#0f172a" strokeWidth="1.5" opacity=".5" />
              </svg>
            </span>
          </div>
          <header className="appbar" style={{ height: "64px", background: "rgba(255,255,255,.9)", backdropFilter: "blur(12px)", borderBottom: "1px solid var(--line)" }}>
            <__Link href="/m-inbox" className="ib" aria-label="Back">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="m15 18-6-6 6-6" />
              </svg>
            </__Link>
            <span className="pav" style={{ width: "42px", height: "42px" }}>
              <img className="face" src="data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wBDAAYEBAUEBAYFBQUGBgYHCQ4JCQgICRINDQoOFRIWFhUSFBQXGiEcFxgfGRQUHScdHyIjJSUlFhwpLCgkKyEkJST/2wBDAQYGBgkICREJCREkGBQYJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCQkJCT/wAARCABwAHADASIAAhEBAxEB/8QAHwAAAQUBAQEBAQEAAAAAAAAAAAECAwQFBgcICQoL/8QAtRAAAgEDAwIEAwUFBAQAAAF9AQIDAAQRBRIhMUEGE1FhByJxFDKBkaEII0KxwRVS0fAkM2JyggkKFhcYGRolJicoKSo0NTY3ODk6Q0RFRkdISUpTVFVWV1hZWmNkZWZnaGlqc3R1dnd4eXqDhIWGh4iJipKTlJWWl5iZmqKjpKWmp6ipqrKztLW2t7i5usLDxMXGx8jJytLT1NXW19jZ2uHi4+Tl5ufo6erx8vP09fb3+Pn6/8QAHwEAAwEBAQEBAQEBAQAAAAAAAAECAwQFBgcICQoL/8QAtREAAgECBAQDBAcFBAQAAQJ3AAECAxEEBSExBhJBUQdhcRMiMoEIFEKRobHBCSMzUvAVYnLRChYkNOEl8RcYGRomJygpKjU2Nzg5OkNERUZHSElKU1RVVldYWVpjZGVmZ2hpanN0dXZ3eHl6goOEhYaHiImKkpOUlZaXmJmaoqOkpaanqKmqsrO0tba3uLm6wsPExcbHyMnK0tPU1dbX2Nna4uPk5ebn6Onq8vP09fb3+Pn6/9oADAMBAAIRAxEAPwD6bpMU6koATFGKWs3xH4i0zwpot3rOsXaWtlapvkkb9AB3YngDuaANA1x3iH4v+A/C5dNT8U6YsydYIJfPl+m1M/rXyb8V/j54k+I15LZ2s0+maDnEVjDJtMg/vTMPvn2+6PfrXnthpz3BBDQqg5IBz+goA+wYf2qPA1zeCCK21sxZwZzajb+QbNM1L9qjwVpl+bY2ur3EY/5bRQqFP0DMDXzdoVst3f21nAqqobLsBtY1QlSNJp7SbAlDlUJwT+ZpX1sVy6XPs7wh8a/AnjV1g07XYIbtuBa3n7iVvoG4b8Ca7qvzbu9JmibdLlV652ZA/Ku3+HPx78Y/Dy5gt0vpNU0hGG/T7xy67e/lueUPpg49qZJ93UVi+EfFul+N/D9prujT+baXS5APDRsPvIw7MDwR/Q1tDigAopaTrQAtFOpDQAx3WNGd2VVUZLMcADuTXw38ffjDN8S/EDWljI6eH9PdltIs/wDHw3QzsPU/wjsPcmvpX9o/xifCPwv1AQvsutVYafEQeQHBLsPogYfjXwptaWQIilmY4CqOvsKAH2xAkDMu/HY9DXa6Ha3ur4iitiEGAAB3rofAHwxhCLea1Hvlblbcnhf973r2PS9HtLWJY7e3ijUDACqAK4K2OUHyxPTw+Xua5p6HnPhzwld6ddpcyIxUDoSeKz9c+Ht2bya8hUsCcjHBFe42+ls3G0YqK70kqckcd+K4/rdS/Md31KlblPl/XPNsS0F5buGHCs1clO29s19U694ZsNTtnhvLeOUMOpHIrwTxz4ButAma4tEeW15J7lB6+4ruw+LVTSW55uKwLpe9HVHR/AH4vyfDLxH9m1CR30DUXVLtOvkN0WZR6jOG9V9wK+5EdJUWSN1dGAZWU5DA9CD6V+YqHB5r7k/Zm8Xv4p+F9pbXEm+60eQ2DknkxgZjJ/4Ccf8AAa7TgPWAOaXFFFABRS4pKAPlj9s/WnOo+G9FBOyOCa8YZ6szBB+it+deQfDTQUuL7+0pRu8tgsYPY9zXeftczST/ABQiib/VwaZAE/FnY/rVP4daU1tpcEhH3/mA+tc2JlaDsdWEhzVFfoei6bAMLhcCut0qAM65wBWPptqjIMsqkds10ul25DDJA9K8RJ8yPoG0om/aQRLHgrzUN7axujYHbrWjCkSqBuB+lNu0iMZw6g+5rucFY4FN3ucHqVsAWGa5jW7GG4geKRAwIwQa7rU7VFLb5FUeua5nUord0dIpo5XxkhWBNcKTT0O9yTjZnzF428PJoOqsIM+S/wAwFe8/sYakwu/E+ml/leK3uVXPcMyk/qK4D4oaSJ7I3Ma5MfX6VsfskXZs/idLbM2Bc6dMmPUgqw/9BP6171CfPBM+cxNPkqNI+ys0UAUtbGAUhpaDQB8i/tXWtrdeNrW9tZ453NvHaTqp5idXbIP4MP1qxaac1vYQW0UptiQq7wOVHfHvWd8b/D11aeObyPMsiyXrTqCchQ7Kw/A/0rrH0eS+Z1V9jR4VfwFefiKnu3Z6eGpWk0is3hix25GpXIlPRmkAyfzqS1XxFoVwpN9JLa5Aw5Dr+Y6Vzd94V1SZNT/064jvePsojYqBg9z646Z4rovDuha99mkmv77zbqSYFbUMNixYAxkkkHOT1P8AhgleO9zqbXN8LR3mjaybyEESZcdaq+IdckgRo4nPmkHBJ6VH4c08Wury25YNHu4OKg1HTHvNSmKkZjQlQeNxrjT1sdVjl00XUtWnae/1CcwrztL449h/Wpm0DQpIXWGeZJlH31lyy1m+I/C+vXMETaXqr+cUlS5iZ8Lk/dZeeo9Tz3qPTfCV5Dd2iw3kx2whZ/NO4M+OSM8ge1dUr8t+Y5ofFblI9Z0n7TpFxE7ecwibLkfe46msb9mlrPTPGdtq1+5iS3gliMmONzkIme+OvNd9eaX9mgMAILMjKT+FeefCnwjPe69FDMjGOWeNFC9CfM3HP0wa3oVWqbaOfEUeaok9j7Q6cUUp6n60V6R5ImaPekozQI8T/aI09Y203UUhBeRWjLDqSh3D9G/Ss3SJ1kuXJIw+1x7hgCK9W+JHh0+I/Ct1DFEZLu3/ANItwOpYDkD6qSK8L0eae0SzecFW2eU4IxgqSBx24xXmYyD1t6nr4GotE/Q9Di0aC7bdsUn1qw1jDp0TMqJux1AqDS70EKQc+1XNXlX+zpnAxtQsa4IP3fM9KS94xdNmD6mWXt3qZpBHqb5654qnoF7psOpNBJcRuyANIiONwz6jtSalqNg+pyRRXUSTKu9Yy437c9cdSKnldi7q9jpP7Etr0BzEmW68VWudMt9P4RFH0FX7K6MVuNwKnaDz6Vmapfbg7sauo1y+ZlBPm8jldcuVjuNwI2xI8jfQKTV34FWYk1cGSHEkFuZjlehIAB/HccVzuoRXGryXS2qPIxURqEUscEjPA9hXsXws8Oz6LoklzfW5hvLxwzB/vBAOAfTucV14WDfKvmcWMqJKX3Ha0o6UlLXrHjDKKKKACvIfjVpxi1OyvlHyzRlTgfxKf8CK9e5rmPiL4ebxB4dlSBN1zbHzogOpwPmH5fyrOtDmi0a0J8s0zyvQ9R/cqGPIro21CKW3aCTGxlKkf3geK4TS5fLlMTHvzVnWYNSjjW4sLyNQDhlkjLceoIPWvA5bSsfSJpxNMeDdIkmeeAtbzqOJUb5/oT1I+tWIvCOjWsyzvCs0uAzSMfnY+56/hXP6fp+p3Q82HWLcsOcvGwwfwNLe6dqdsPNuNZgDHkGGNmJP4mtuR23L9k9ztZtURl2owOBXP63qJ8hgp5NU9Jt72OLz769EzPwFWLYFHbuTmquqTh5dinKjpWLjeVib2idf8GLJptburwg4t4cZ/wBpjj+QNew5rk/hp4dfQfDqtOu25vCJnB6quPlH5c/jXWdK96jHlgkfNV5c1RsBTqbmnDpWpkMoopcUAJS/zopKAPnz4mz2WkfEG506KNbYyxR3EeOEcsOR7HOaSxulmARzweCDVP4+WgvfHrBRylnCpx9Cf61xOmeILvR3EV0GniHAOfmX8e9eTiIKUnbc9rCzcYLseqxeF4bsl4rp7f8A65nFLL4dhsTua4acju5zXPaV45sZAAbgIcdH4NLqPjSxjVv9ID+yfMTXLaVrHbzx3uX7+7SFWAOD0AFZPhbUo7rx9omm7Vnaa7QS91RRyR7k4/CuW1HxBe605itUa3hPV8/O3+Fbvwy08ab450GRv+foAk+pBH9a2owUGrnNXqOUXbY+pM5opBwKK9o8EWlBpBS0Af/Z" alt="" style={{ width: "42px", height: "42px" }} />
              <span className="pb" style={{ width: "18px", height: "18px", right: "-3px", bottom: "-3px" }}>
                <img src="data:image/png;base64,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" alt="Facebook" style={{ width: "14px", height: "14px" }} />
              </span>
              <span className="on" />
            </span>
            <span style={{ flex: "1", minWidth: "0", paddingLeft: "8px" }}>
              <span style={{ display: "block", fontSize: "16px", fontWeight: "600" }}>Nusrat Jahan</span>
              <span style={{ display: "flex", alignItems: "center", gap: "6px", fontSize: "12px", color: "var(--muted)" }}><span style={{ width: "7px", height: "7px", borderRadius: "99px", background: "#10b981" }} />Active now · Facebook</span>
            </span>
            <__Link href="/m-call-active" className="ib" aria-label="Call">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2Z" />
              </svg>
            </__Link>
            <__Link href="/m-ticket-new" className="ib" aria-label="Create ticket">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2Z" />
                <path d="M13 5v2M13 17v2M13 11v2" />
              </svg>
            </__Link>
          </header>
          <div style={{ position: "absolute", top: "111px", left: "0", right: "0", padding: "10px 16px", zIndex: "4" }}>
            <div style={{ display: "flex", gap: "8px", alignItems: "center", padding: "8px 8px 8px 14px", borderRadius: "16px", background: "var(--card)", boxShadow: "0 1px 2px rgba(15,23,42,.05)", fontSize: "12.5px" }}>
              <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}><b className="num" style={{ color: "var(--ink)" }}>6</b> orders</span>
              <span style={{ color: "#cbd5e1" }}>|</span>
              <span style={{ color: "var(--muted)", whiteSpace: "nowrap" }}><b className="num" style={{ color: "var(--ink)" }}>৳14,200</b> spent</span>
              <__Link href="/m-new-order" className="btn btnp" style={{ marginLeft: "auto", height: "32px", padding: "0 12px", fontSize: "12.5px", borderRadius: "10px" }}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M12 5v14M5 12h14" />
</svg>Order</__Link>
            </div>
          </div>
          <div className="content" style={{ top: "170px", bottom: "156px", padding: "6px 16px", display: "flex", flexDirection: "column", gap: "8px", justifyContent: "flex-end" }}>
            <div style={{ alignSelf: "center", fontSize: "11.5px", fontWeight: "500", color: "var(--muted)", background: "#e9eef5", padding: "3px 10px", borderRadius: "99px" }}>Today</div>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ maxWidth: "76%", padding: "10px 14px 7px", borderRadius: "22px 22px 22px 6px", background: "var(--card)", color: "var(--ink)", fontSize: "15px", lineHeight: "21px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>Assalamu alaikum. Is the sunscreen original?<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: "11px", opacity: ".7", marginTop: "2px" }}>2:21 pm</div></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div style={{ maxWidth: "76%", padding: "10px 14px 7px", borderRadius: "22px 22px 6px 22px", background: "linear-gradient(160deg,#0a4bb5,#003087)", color: "#fff", fontSize: "15px", lineHeight: "21px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>Wa alaikum assalam. Yes, 100% original, imported from Korea. Batch expires Jun 2027.<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: "11px", opacity: ".7", marginTop: "2px" }}>2:22 pm<svg width="16" height="10" viewBox="0 0 16 10" aria-label="Seen" style={{ marginLeft: "4px" }}>
  <path d="M1 5l3 3 6-7M6 8l1 1 7-8" fill="none" stroke="#7fd4f5" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
</svg></div></div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-end" }}>
              <div className="card" style={{ width: "76%", overflow: "hidden", borderRadius: "22px 22px 6px 22px" }}>
                <div style={{ height: "76px", background: "linear-gradient(135deg,#fff4e0,#ffe0b8)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "40px", fontWeight: "700", color: "#003087" }}>S</div>
                <div style={{ padding: "10px 14px 12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: "600" }}>Sunscreen SPF 50 · 50ml</div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "4px" }}>
                    <span className="num" style={{ fontSize: "15px", fontWeight: "700" }}>৳940 <s style={{ fontWeight: "400", color: "var(--muted)", fontSize: "12.5px" }}>৳1,250</s></span>
                    <span className="pill p-warn"><span className="sh warn" aria-hidden="true" />12 left</span>
                  </div>
                </div>
              </div>
            </div>
            <div style={{ display: "flex", justifyContent: "flex-start" }}>
              <div style={{ maxWidth: "76%", padding: "10px 14px 7px", borderRadius: "22px 22px 22px 6px", background: "var(--card)", color: "var(--ink)", fontSize: "15px", lineHeight: "21px", boxShadow: "0 1px 2px rgba(15,23,42,.06)" }}>Need 2 pcs. Dhanmondi delivery kobe?<div style={{ display: "flex", justifyContent: "flex-end", alignItems: "center", fontSize: "11px", opacity: ".7", marginTop: "2px" }}>2:30 pm</div></div>
            </div>
            <div style={{ display: "flex", gap: "4px", padding: "10px 14px", borderRadius: "22px 22px 22px 6px", background: "var(--card)", alignSelf: "flex-start" }} aria-label="Typing">
              <span style={{ width: "7px", height: "7px", borderRadius: "99px", background: "#94a3b8" }} />
              <span style={{ width: "7px", height: "7px", borderRadius: "99px", background: "#b8c2d0" }} />
              <span style={{ width: "7px", height: "7px", borderRadius: "99px", background: "#d5dce6" }} />
            </div>
          </div>
          <div style={{ position: "absolute", left: "0", right: "0", bottom: "0", padding: "10px 0 34px", background: "linear-gradient(to top,var(--bg) 70%,rgba(245,247,250,0))", zIndex: "6" }}>
            <div className="chips" style={{ padding: "0 12px" }}>
              <span className="chip" style={{ borderColor: "#cfe0f7", color: "var(--brand)" }}><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
  <path d="M4 14a1 1 0 0 1-.78-1.63l9.9-10.2a.5.5 0 0 1 .86.46l-1.92 6.02A1 1 0 0 0 13 10h7a1 1 0 0 1 .78 1.63l-9.9 10.2a.5.5 0 0 1-.86-.46l1.92-6.02A1 1 0 0 0 11 14z" />
</svg>Delivery in 24 h</span>
              <span className="chip">Send price list</span>
              <span className="chip">Share product</span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px", margin: "10px 12px 0", padding: "6px", borderRadius: "26px", background: "var(--card)", boxShadow: "0 6px 20px -10px rgba(15,23,42,.25),0 0 0 1px var(--line)" }}>
              <a className="ib" href="#" aria-label="Add" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "var(--soft)", color: "var(--brand)" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="M12 5v14M5 12h14" />
                </svg>
              </a>
              <span style={{ flex: "1", color: "var(--muted)", fontSize: "15px", paddingLeft: "4px" }}>Reply on Facebook…</span>
              <a className="ib" href="#" aria-label="Voice message" style={{ width: "40px", height: "40px" }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <rect x="9" y="2" width="6" height="12" rx="3" />
                  <path d="M19 10v2a7 7 0 0 1-14 0v-2M12 19v3" />
                </svg>
              </a>
              <a className="ib" href="#" aria-label="Send" style={{ width: "40px", height: "40px", borderRadius: "99px", background: "var(--brand)", color: "#fff" }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
                  <path d="m22 2-7 20-4-9-9-4Z" />
                  <path d="M22 2 11 13" />
                </svg>
              </a>
            </div>
          </div>
          <div className="hi" aria-hidden="true" />
        </div>
      </div>
    );
  }
}
