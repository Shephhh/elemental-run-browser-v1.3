(function () {
  'use strict';

  // A small, shared façade for Browser, CrazyGames, Poki and the desktop
  // wrapper. Gameplay only talks to this object; each platform bridge remains
  // responsible for its own SDK details and event de-duplication.
  const noop = Object.freeze({
    kind: 'browser',
    ready: Promise.resolve(),
    loadingStart() {}, loadingStop() {},
    gameplayStart() {}, gameplayStop() {}, measure() {},
    setContext() {}, clearContext() {}, reportCompletion() {},
    commercialBreak: async () => false,
    rewardedBreak: async () => false,
    getSystemInfo: () => ({}),
    isMuted: () => false
  });

  function kind() {
    if (window.ELEMENTAL_POKI_BUILD === true) return 'poki';
    if (window.ELEMENTAL_CRAZYGAMES_BUILD === true) return 'crazygames';
    if (window.ELEMENTAL_STEAM_BUILD === true || window.elementalRunDesktop || window.elementalRunShell) return 'steam';
    return 'browser';
  }

  function current() {
    const activeKind = kind();
    if (activeKind === 'poki' && window.ElementalPoki) return window.ElementalPoki;
    if (activeKind === 'crazygames' && window.ElementalCrazyGames) return window.ElementalCrazyGames;
    return noop;
  }

  const adapter = Object.freeze({
    kind,
    current,
    is: (name) => kind() === name,
    isHosted: () => {
      const activeKind = kind();
      return activeKind === 'poki' || activeKind === 'crazygames';
    }
  });

  Object.defineProperty(window, 'ElementalPlatform', {
    value: adapter,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
