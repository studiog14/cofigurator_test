// Mobile fallback system: activate mobile mode within index.html for better responsiveness
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

    // Detection: mobile device
    var isMobileDevice = false;
    try {
      var ua = navigator.userAgent || '';
      var isIOS = /iPhone|iPad|iPod/i.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
      var isAndroid = /Android/i.test(ua);
      var isMobileUA = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(ua) || (navigator.platform==='MacIntel' && navigator.maxTouchPoints>1);
      var hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
      var isNarrow = window.innerWidth <= 820;

      isMobileDevice = isMobileUA || hasTouch || isNarrow;
    } catch (_) { isMobileDevice = false; }

    // Detection: native import map support
    var importMapSupported = false;
    try {
      importMapSupported = (typeof HTMLScriptElement !== 'undefined') &&
        (typeof HTMLScriptElement.supports === 'function') &&
        HTMLScriptElement.supports('importmap');
    } catch (_) { importMapSupported = false; }

    // If mobile device detected, force mobile mode
    if (isMobileDevice) {
      try {
        document.body.classList.add('mobile-mode');
        console.log('📱 iOS Fallback: Mobile device detected, activated mobile mode');
      } catch (_) {
        console.log('📱 iOS Fallback: Could not add mobile-mode class');
      }
    }

    // If import maps not supported on mobile, show warning but don't redirect
    if (!importMapSupported && isMobileDevice) {
      console.log('📱 iOS Fallback: Import maps not supported on mobile device');
      console.log('📱 iOS Fallback: Using fallback rendering mode');

      // Add fallback class for additional mobile adaptations
      try {
        document.body.classList.add('mobile-fallback');
      } catch (_) {}
    }

    // Log detection results for debugging
    if (typeof console !== 'undefined') {
      console.log('📱 iOS Fallback: Detection results:', {
        isMobileDevice,
        importMapSupported,
        userAgent: navigator.userAgent.substring(0, 50),
        screenWidth: window.innerWidth,
        hasTouch: 'ontouchstart' in window || navigator.maxTouchPoints > 0
      });
    }
  } catch (_) {
    // swallow errors
  }
})();
