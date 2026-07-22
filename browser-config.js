(function () {
  const config = Object.freeze({
    steamUrl: 'https://store.steampowered.com/app/4721080/',
    googleAdsensePublisherId: 'ca-pub-4666514897532022',
    // Real rewarded ads start only after you paste the approved Google Ad
    // Manager rewarded ad-unit path, for example: '/1234567/elemental_run_rewarded'.
    // GitHub Pages cannot invent this; it must come from the publisher account.
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
