// Minimal runtime fallback for older Safari/iOS: redirect to mobile.html when import maps are unsupported.
(function () {
  'use strict';
  try {
    var w = (typeof window !== 'undefined') ? window : null;
    if (!w) return;

    // Helpers once
    const defineOnce = (name, fn) => {
      if (typeof w[name] !== 'function') {
        Object.defineProperty(w, name, { value: fn, configurable: true, enumerable: false, writable: true });
      }
    };
    defineOnce('tryAlternativeLoad', function () {});
    defineOnce('openWebVersion', function () {});
    defineOnce('installPWA', function () {});
    defineOnce('showInstallInstructions', function () {});
    defineOnce('continueToApp', function () {});
    defineOnce('tryAutoInstall', function () {});

    // Detection: native import map support
    var importMapSupported = false;
    try {
      importMapSupported = (typeof HTMLScriptElement !== 'undefined') &&
        (typeof HTMLScriptElement.supports === 'function') &&
        HTMLScriptElement.supports('importmap');
    } catch (_) { importMapSupported = false; }

    // Already on mobile.html? do nothing.
    var href = String(w.location.href || '');
    var onMobileHtml = /mobile\.html(\?|#|$)/i.test(href);

    // If import maps unsupported, go to mobile.html (adds a flag to avoid SW/caching loops)
    if (!importMapSupported && !onMobileHtml) {
      try {
        var url = new URL('mobile.html', w.location.href);
        url.searchParams.set('fallback', '1');
        w.location.replace(url.toString());
        return;
      } catch (_) {
        w.location.href = 'mobile.html?fallback=1';
        return;
      }
    }

    // Log once for visibility
    if (typeof console !== 'undefined') {
      console.log('ios-fallback.js: importmap support =', importMapSupported);
    }
  } catch (_) {
    // swallow
  }
})();
