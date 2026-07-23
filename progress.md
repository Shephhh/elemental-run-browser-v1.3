Original prompt: adsense kayıt oldum fakat site için github site sistemini kullan ardından yayınla

- GitHub Pages deployment workflow added for the static browser build.
- The workflow checks out Git LFS assets so GLB models and MP3 audio are included in the deployed game.
- The Pages artifact contains only the browser game runtime, not the previous Sites host wrapper or local test output.
- Relative asset, manifest, and service-worker paths are compatible with a GitHub project Pages subpath.
- Local HTTP smoke test completed: the game runtime loaded and `render_game_to_text` returned the expected paused CITY state with browser features enabled and no client error output. Automated WebGL screenshots were black in both headless and headed capture, so final visual verification will be done on the deployed URL in Chrome.
- Search result metadata was tightened so the title/site signals use ELEMENTAL RUN and no longer include "Cyberpunk".
- Browser leaderboard now falls back to 10 realistic nickname entries with country flags when Steam leaderboard APIs are not available.
- Real rewarded ad integration remains wired through Google Ad Manager; activation requires the approved rewarded ad-unit path from the publisher account.
- Google AdSense publisher metadata/script and ads.txt were added for publisher ca-pub-4666514897532022. The GitHub Pages workflow now includes ads.txt in the deployed artifact.
- Browser leaderboard friends tab was removed entirely; the browser leaderboard now shows only the global board.
- Web runtime optimization (2026-07-23):
  - Fixed the global one-shot particle pool's final-frame GPU upload. Expired particles are now hidden immediately instead of freezing on screen and appearing again on a later spawn.
  - Main menu no longer renders the fully covered Three.js world, shadows, particles, and post-processing every frame. Controller input and audio mixing remain active.
  - `hand.glb` loading now begins near the start of the loading pipeline and the loading screen waits for the enabled hand model to settle, so hands are ready before PLAY.
  - Added concise runtime diagnostics for hand readiness, active global particles, and renderer frame count to `render_game_to_text`.
  - Automated verification: hand state was ready before main menu display; renderer frame remained 186 across 7.5 seconds in the menu; no new console errors.

TODO:
- Create the GitHub repository, push master, enable GitHub Actions as the Pages source, and verify the public game URL.
- For AdSense approval and ads.txt root compliance, a custom domain or root user Pages site is strongly recommended; add the approved Google Ad Manager rewarded ad-unit path after Google supplies it.
