// Fits a POS screen to the window. The screen is a fixed-height stage (880px of design
// height, 768 on the tablet frame) that is scaled to the window height and widened by the
// inverse of that scale, so it fills the width exactly — fixed height, no page scrolling,
// no empty bands at the sides. Applied through an injected stylesheet (not inline styles)
// because the DC runtime owns the element's style prop.
(() => {
  const BAND = 58; // clear strip at the bottom for the review switcher
  const ID = 'pos-fit-style';
  const apply = () => {
    const stages = document.querySelectorAll('[data-pos-fit]');
    if (!stages.length || stages.length > 3) return; // >3 = the contact sheet, which owns its own frames
    const [dw, dh] = (stages[0].dataset.posFit || '1380x880').split('x').map(Number);
    let tag = document.getElementById(ID);
    if (!tag) {
      tag = document.createElement('style');
      tag.id = ID;
      document.head.appendChild(tag);
    }
    tag.textContent = 'html,body{overflow:hidden!important;height:100%;margin:0;background:#0f172a}' +
      '[data-pos-fit]{position:fixed!important;left:0!important;top:0!important;' +
      'width:calc(var(--pos-stage-w,' + dw + ') * 1px)!important;min-width:calc(var(--pos-stage-w,' + dw + ') * 1px)!important;' +
      'height:calc(var(--pos-stage-h,' + dh + ') * 1px)!important;min-height:calc(var(--pos-stage-h,' + dh + ') * 1px)!important;' +
      'max-height:none!important;transform-origin:0 0!important;' +
      'transform:scale(var(--pos-fit-scale,1))!important}' +
      // an overlay board mounts the base screen inside itself: that nested stage must not re-fit
      '[data-pos-fit] [data-pos-fit]{position:static!important;width:100%!important;min-width:0!important;height:100%!important;min-height:0!important;transform:none!important}';
    const fit = () => {
      const vp = window.visualViewport;
      const vh = Math.min(window.innerHeight || Infinity, document.documentElement.clientHeight || Infinity, vp ? vp.height : Infinity);
      const vw = Math.min(window.innerWidth || Infinity, document.documentElement.clientWidth || Infinity, vp ? vp.width : Infinity);
      const availH = Math.max(320, vh - BAND);
      let s = Math.min(1, availH / dh);
      if (vw / s < dw) s = vw / dw; // never let the chrome fall below its intrinsic width
      const root = document.documentElement.style;
      root.setProperty('--pos-fit-scale', String(s));
      root.setProperty('--pos-stage-w', String(Math.max(dw, Math.round(vw / s))));
      root.setProperty('--pos-stage-h', String(Math.round(availH / s)));
    };
    fit();
    if (!window.__posFitBound) {
      window.__posFitBound = true;
      window.addEventListener('resize', fit);
      if (window.ResizeObserver) new ResizeObserver(fit).observe(document.documentElement);
    }
  };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', apply);
  else apply();
  setTimeout(apply, 400);
  setTimeout(apply, 1500);
})();
