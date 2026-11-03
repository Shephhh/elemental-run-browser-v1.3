(function () {
  'use strict';

  Object.defineProperty(window, 'ELEMENTAL_BROWSER_BUILD', {
    value: true,
    writable: false,
    configurable: false,
    enumerable: false
  });

  let busy = false;

  function unavailable(error) {
    return { status: 'unavailable', provider: 'poki', error: error ? String(error.message || error) : '' };
  }

  function rewardSizeForPlacement(placement) {
    if (placement === 'continue_after_death') return 'large';
    if (String(placement || '').indexOf('upgrade') !== -1) return 'medium';
    return 'small';
  }

  async function showRewarded(options) {
    if (busy) return { status: 'busy', provider: 'poki' };
    busy = true;
    const request = options || {};
    const onStart = typeof request.onStart === 'function' ? request.onStart : function () {};
    const onFinish = typeof request.onFinish === 'function' ? request.onFinish : function () {};
    let result;
    try {
      const bridge = window.ElementalPoki;
      if (!bridge) {
        result = unavailable('Poki bridge is not ready.');
      } else {
        await bridge.ready;
        if (!bridge.isActive() || typeof bridge.rewardedBreak !== 'function') {
          result = unavailable('Poki rewarded video is unavailable.');
        } else {
          const rewarded = await bridge.rewardedBreak({
            size: rewardSizeForPlacement(request.placement),
            onStart: () => {
              try { onStart(); } catch (error) {}
            }
          });
          result = rewarded
            ? { status: 'completed', provider: 'poki' }
            : { status: 'skipped', provider: 'poki' };
        }
      }
    } catch (error) {
      result = unavailable(error);
    }
    busy = false;
    try { onFinish(result); } catch (error) {}
    return result;
  }

  async function showCommercial(options) {
    if (busy) return { status: 'busy', provider: 'poki' };
    busy = true;
    const request = options || {};
    const onStart = typeof request.onStart === 'function' ? request.onStart : function () {};
    const onFinish = typeof request.onFinish === 'function' ? request.onFinish : function () {};
    let result;
    try {
      const bridge = window.ElementalPoki;
      if (!bridge) {
        result = unavailable('Poki bridge is not ready.');
      } else {
        await bridge.ready;
        if (!bridge.isActive() || typeof bridge.commercialBreak !== 'function') {
          result = unavailable('Poki commercial break is unavailable.');
        } else {
          const completed = await bridge.commercialBreak(onStart);
          result = completed
            ? { status: 'completed', provider: 'poki' }
            : { status: 'unavailable', provider: 'poki' };
        }
      }
    } catch (error) {
      result = unavailable(error);
    }
    busy = false;
    try { onFinish(result); } catch (error) {}
    return result;
  }

  Object.defineProperty(window, 'ElementalBrowserAds', {
    value: Object.freeze({
      showRewarded,
      showCommercial,
      isBusy: () => busy,
      provider: () => 'poki'
    }),
    writable: false,
    configurable: false,
    enumerable: false
  });

  // The game checks for this optional helper only in legacy UI paths. Keeping
  // a harmless implementation avoids a platform-specific UI dependency.
  window.ElementalFeedback = Object.freeze({
    show: function () {},
    hide: function () {},
    transaction: function () {}
  });
})();
