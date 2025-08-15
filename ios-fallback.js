// Deprecated/no-op: mobile fallback removed; desktop UI is used on all devices
(function () {
  'use strict';
  try {
    if (typeof window !== 'undefined') {
      const defineOnce = (name, fn) => {
        if (typeof window[name] !== 'function') {
          Object.defineProperty(window, name, { value: fn, configurable: true, enumerable: false, writable: true });
        }
      };

      // Safe no-op stubs (do not override if real ones exist elsewhere)
      defineOnce('tryAlternativeLoad', function () {});
      defineOnce('openWebVersion', function () {});
      defineOnce('installPWA', function () {});
      defineOnce('showInstallInstructions', function () {});
      defineOnce('continueToApp', function () {});
      defineOnce('tryAutoInstall', function () {});
    }
    // Log once for visibility
    if (typeof console !== 'undefined') {
      console.log('ios-fallback.js: deprecated/no-op loaded');
    }
  } catch (_) {
    // swallow
  }
})();
