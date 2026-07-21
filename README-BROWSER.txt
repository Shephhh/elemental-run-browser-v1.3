ELEMENTAL RUN - Browser v1.3
================================

LOCAL TEST
1. Double-click START_BROWSER.bat.
2. The game opens at http://127.0.0.1:4173.
3. Localhost uses a clearly labeled 3-second demo rewarded ad so every reward path can be tested.

DEPLOYMENT
- Upload the complete folder to an HTTPS static host. Keep all folders and filenames intact.
- Do not open index.html directly for production; GLB/audio loading requires an HTTP(S) server.
- The build is static and does not need Electron, Steam DLLs, Node modules, or a backend.
- A service worker caches the shell and then caches game assets as they are requested.

REAL REWARDED ADS
No publisher/network key was supplied, so production ads are intentionally provider-neutral.
The build automatically supports:
- CrazyGames HTML5 SDK: window.CrazyGames.SDK.ad.requestAd('rewarded', callbacks)
- Poki HTML5 SDK: PokiSDK.rewardedBreak(...)
- Google Ad Manager rewarded web ads (set googleAdManagerRewardedUnitPath in browser-config.js)
- A custom bridge named window.ElementalAdProvider

For your own ad network, expose this before browser-platform.js loads:

window.ElementalAdProvider = {
  async showRewarded({ placement }) {
    // Open the provider's rewarded ad and await its verified completion.
    // Return true only after the provider confirms the video was completed.
    return true;
  }
};

If no supported SDK/bridge exists on a public domain, reward buttons stay safe: no reward is granted and the player sees an unavailable message.

CONFIGURATION
Edit browser-config.js to change the Steam URL, reward boost duration, or daily rewarded-upgrade offer count.

REWARDED FEATURES
- Continue after death: a 1.1-second impact beat, explicit opt-in, then safe revive after confirmed completion.
- 2x score for 15 minutes.
- 2x gold for 15 minutes.
- 1-2 random daily upgrade offers, each claimable once after a completed rewarded ad.

BROWSER SAVE / CONSOLE HARDENING
- Production game state and gameplay functions are private to the game closure, not writable window globals.
- Browser saves carry an integrity seal. Edited values are rejected and reset on the next load.
- Ad/config bridge objects are non-writable, and a custom ad provider is captured only during page boot.
- Test mutation hooks exist only on localhost/file builds and are absent on a public host.
- No client-only browser game can be absolutely tamper-proof. Any future public leaderboard or valuable account inventory should be verified by a server-authoritative API.

STEAM STORE
The main-menu Steam button points to App ID 4721080.
