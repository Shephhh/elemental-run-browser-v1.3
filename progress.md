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
- Daily mission economy update (2026-07-23):
  - Reduced daily mission reward from 400 to 50 gold and the all-daily completion bonus from 600 to 50 gold.
  - Verification: local browser UI showed all three daily mission rewards as `50`; Playwright state reached `main_menu`; console/page errors were empty.
- Daily mission manual claim update (2026-07-23):
  - Completed daily missions no longer grant wallet gold automatically.
  - Finished, unclaimed missions now show a `50 CLAIM` / `50 AL` button in the Daily panel; gold is added only when the player presses it.
  - The all-daily bonus is granted only when the final completed mission reward is claimed, so bonus gold is also player-collected.
  - Verification: seeded browser saves confirmed wallet stayed at `0` before claim, changed to `50` after a single mission claim, and produced no console/page errors.
- Particle pool and progression UI update (2026-07-23):
  - Removed routine yellow/blue square bursts from coin pickup and traversal pads while keeping rewards, sounds, rings, arrows, and movement behavior.
  - The global Points mesh is now disabled whenever no live slot remains and re-enabled only by an intentional effect, preventing stale colored slots from reappearing after later world/buffer updates.
  - Refined Leaderboard with a distinct top-three podium and aligned top 10, Upgrades with a responsive dense 4/3/2/1-column grid, and Daily Missions with clearer streak/objective/progress/reward hierarchy.
  - Desktop and 390x844 browser screenshots passed visual inspection. A real 190-score run collected a coin with `activeGlobalParticles: 0` and no console/page errors.

TODO:
- Create the GitHub repository, push master, enable GitHub Actions as the Pages source, and verify the public game URL.
- For AdSense approval and ads.txt root compliance, a custom domain or root user Pages site is strongly recommended; add the approved Google Ad Manager rewarded ad-unit path after Google supplies it.
