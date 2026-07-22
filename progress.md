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

TODO:
- Create the GitHub repository, push master, enable GitHub Actions as the Pages source, and verify the public game URL.
- For AdSense approval and ads.txt root compliance, a custom domain or root user Pages site is strongly recommended; add the approved Google Ad Manager rewarded ad-unit path after Google supplies it.
