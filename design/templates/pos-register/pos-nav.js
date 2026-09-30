// Screen switcher for the POS artboards. Injected once per document (guarded by id),
// mounted on <body> so it sits outside any modal scrim.
(() => {
  const SCREENS = [
    ['01', 'Idle', 'PosIdle.dc.html'],
    ['02', 'Active sale', 'PosActive.dc.html'],
    ['04', 'Payment', 'PosPay.dc.html'],
    ['05', 'Keypad', 'PosKeypad.dc.html'],
    ['06', 'Held / recent', 'PosSales.dc.html'],
    ['07', 'Return', 'PosReturn.dc.html'],
    ['08', 'Open', 'PosOpen.dc.html'],
    ['09', 'Shift close', 'PosClose.dc.html'],
    ['10', 'Offline', 'PosOffline.dc.html'],
    ['··', 'All 12', 'PosRegister.dc.html']
  ];
  const ID = 'pos-screen-nav';
  const mount = () => {
    if (!document.body || document.getElementById(ID)) return;
    const here = decodeURIComponent(location.pathname.split('/').pop() || '');
    const bar = document.createElement('nav');
    bar.id = ID;
    bar.setAttribute('aria-label', 'POS screens');
    bar.style.cssText = 'position:fixed;left:50%;bottom:6px;transform:translateX(-50%);z-index:9999;display:flex;align-items:center;gap:2px;max-width:calc(100vw - 24px);overflow:auto;padding:3px;border-radius:9999px;background:rgba(15,23,42,.92);box-shadow:0 12px 30px -10px rgba(15,23,42,.55);font-family:Poppins,ui-sans-serif,system-ui,sans-serif;-webkit-backdrop-filter:blur(6px);backdrop-filter:blur(6px)';
    SCREENS.forEach(([n, label, file]) => {
      const a = document.createElement('a');
      a.href = file;
      a.title = label;
      const on = here === file;
      a.style.cssText = 'display:inline-flex;align-items:center;gap:6px;height:28px;padding:0 10px;border-radius:9999px;font-size:11.5px;font-weight:500;letter-spacing:.02em;text-decoration:none;white-space:nowrap;transition:background .2s ease-out,color .2s ease-out;' + (on ? 'background:#009CDE;color:#0b1524;font-weight:600' : 'background:transparent;color:#cbd5e1');
      a.innerHTML = '<span style="font-variant-numeric:tabular-nums;opacity:' + (on ? '.75' : '.55') + '">' + n + '</span>' + label;
      if (!on) {
        a.addEventListener('mouseenter', () => { a.style.background = 'rgba(148,163,184,.22)'; a.style.color = '#f8fafc'; });
        a.addEventListener('mouseleave', () => { a.style.background = 'transparent'; a.style.color = '#cbd5e1'; });
      }
      bar.appendChild(a);
    });
    document.body.appendChild(bar);
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', mount);
  else mount();
  setTimeout(mount, 600);
})();
