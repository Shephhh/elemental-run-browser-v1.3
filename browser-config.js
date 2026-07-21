(function () {
  const config = Object.freeze({
    steamUrl: 'https://store.steampowered.com/app/4721080/',
    // Add your Google Ad Manager rewarded ad-unit path to enable live ads
    // on your own domain, for example: '/1234567/elemental_run_rewarded'.
    googleAdManagerRewardedUnitPath: '',
    demoAdsOnLocalhost: true,
    rewardedUpgradeOffersPerDayMin: 1,
    rewardedUpgradeOffersPerDayMax: 2,
    rewardBoostMinutes: 15
  });
  Object.defineProperty(window, 'ELEMENTAL_BROWSER_CONFIG', {
    value: config,
    writable: false,
    configurable: false,
    enumerable: false
  });
})();
