Original prompt: adsense kayıt oldum fakat site için github site sistemini kullan ardından yayınla

- GitHub Pages deployment workflow added for the static browser build.
- The workflow checks out Git LFS assets so GLB models and MP3 audio are included in the deployed game.
- The Pages artifact contains only the browser game runtime, not the previous Sites host wrapper or local test output.
- Relative asset, manifest, and service-worker paths are compatible with a GitHub project Pages subpath.
- Local HTTP smoke test completed: the game runtime loaded and `render_game_to_text` returned the expected paused CITY state with browser features enabled and no client error output.
- Public repository created at https://github.com/Shephhh/elemental-run-browser-v1.3.
- GitHub Pages was enabled with GitHub Actions and the deployment completed successfully.
- Live game verified at https://shephhh.github.io/elemental-run-browser-v1.3/: the v1.3 main menu rendered correctly, the PLAY action entered the game, and no game-origin console errors were reported.
- Search result metadata was tightened so the title/site signals use ELEMENTAL RUN and no longer include "Cyberpunk".
- Browser leaderboard now falls back to 10 realistic nickname entries with country flags when Steam leaderboard APIs are not available.
- Real rewarded ad integration remains wired through Google Ad Manager; activation requires the approved rewarded ad-unit path from the publisher account.
- Google AdSense publisher metadata/script and ads.txt were added for publisher ca-pub-4666514897532022. The GitHub Pages workflow now includes ads.txt in the deployed artifact.
- AdSense setup was advanced in the browser: shephhh.github.io was verified, review was requested, Auto ads were switched ON, and Google's 3-choice CMP consent message was selected. A separate public root GitHub Pages repo, Shephhh/shephhh.github.io, now serves root ads.txt at https://shephhh.github.io/ads.txt.
- Google Ad Manager signup is currently blocked by Google's message: "Google is reviewing your AdSense account application. As soon as you receive an email indicating approval, you can sign in to Ad Manager." Real rewarded ads cannot be activated until AdSense approval allows Ad Manager access and a rewarded ad unit path can be created.
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
  - Removed the routine yellow/blue square `Points` bursts from coin pickup, regular jump pads, the sky launch pad, and water bounce caps. Their sounds, rings, arrows, rewards, and movement behavior are unchanged.
  - The shared particle mesh now becomes invisible whenever the pool has no live slots and is re-enabled only by an intentional effect. This prevents stale colored slots from reappearing after world rebases or later buffer uploads.
  - Redesigned Leaderboard with a stronger top-three podium, aligned scores, fully visible top 10, and responsive mobile rows.
  - Redesigned Upgrades as a denser responsive 4/3/2/1-column grid with clearer icons, descriptions, progression steps, available-state accents, and no desktop scroll at 1440x900.
  - Redesigned Daily Missions with clearer streak summary, objective/progress/reward hierarchy, stronger claim state, and mobile-safe layout.
  - Verification: desktop and 390x844 screenshots were visually inspected with no overflow or console errors. A real 190-score city run collected a coin while `activeGlobalParticles` remained `0`; no yellow/blue square burst reappeared.
- Upgrade purchase alignment update (2026-07-24):
  - Upgrade cards now use a vertical flex layout so every purchase button sits on the same baseline within its row, including cards with no progress bar.
  - Rewarded upgrade ad buttons, when visible in the browser build, sit above the main purchase button and no longer push the main purchase button out of alignment.
  - Slightly increased upgrade title, tag, and purchase button text size for readability.
  - Applied to local browser source, the packaged desktop v1.3 `app.asar`, and the live GitHub Pages site.
  - Verification: local browser, extracted desktop package, mobile viewport, and live Pages measurements all showed matching per-row purchase button bottoms with no console/page errors.
- Progression feedback and control onboarding update (2026-07-24):
  - Daily Missions now shows the same red circular `!` alert language as Upgrades whenever at least one completed reward is waiting to be claimed; it clears after the reward is collected.
  - Claiming a daily reward produces a short gold-coin burst, floating reward value, row highlight, and wallet pulse. The all-daily bonus is included in the displayed gain when applicable.
  - Every gold-funded upgrade purchase now shows the deducted amount, a restrained coin-drain burst, wallet shake, and a brief success highlight on the purchased card. Rewarded-ad upgrades do not show a false gold deduction.
  - Pressing PLAY shows a five-second, non-interactive WASD / Space / mouse control card. The copy is localized for every supported language, respects reduced-motion preferences, and scales without overflow at 390px mobile width.
  - Effects use short-lived DOM nodes only and do not add work to the Three.js render loop.
  - Applied to the local browser build, packaged desktop v1.3 `app.asar`, and live GitHub Pages in commit `4159695`.
  - Verification covered real daily claim and upgrade purchase flows, automatic five-second dismissal, English/Turkish localization, desktop/mobile layouts, packaged desktop extraction, and the deployed site; no new console/page errors were reported.

TODO:
- For AdSense approval and ads.txt root compliance, a custom domain or root user Pages site is strongly recommended; add the approved Google Ad Manager rewarded ad-unit path after Google supplies it.
2026-07-24 - Upgrade language + onboarding layout fix
- Fixed upgrade panel language leakage so English/non-TR UI no longer shows Turkish upgrade tag text, and upgrade costs now use the active menu number locale.
- Reworked the play-start how-to card into a compact top-right rectangle with WASD, E, SPACE, an OR divider line, and a mouse icon.
- Applied the same index.html update to the desktop v1.3 app.asar and kept a timestamped app.asar backup.
- Verified with a Playwright smoke test: upgradeHasTurkish=false, the onboarding card appears in the top-right and hides after 5 seconds, with no browser console errors.

2026-07-26 - How-to-play stability + Auto ads check
- Fixed the onboarding card's intermittent nested/overlapping layout: an older global three-column rule was leaking into the new control stack. The card now explicitly uses one vertical control flow with fixed, responsive key groups.
- Replaced the minimal mouse outline with a clearer mouse icon that has separate left/right buttons, a lit scroll wheel, and a lower body detail. The card background is now nearly opaque so HUD text behind it cannot read as part of the card.
- The card is queued after menu teardown and two animation frames, so its five-second display time begins after slow start-up work rather than expiring during it.
- Confirmed that the AdSense publisher script, publisher meta tag, and ads.txt publisher line are present. With Auto ads switched on in AdSense, no additional manual page-level tag or ad unit is required for display Auto ads.

2026-07-27 - Automatic mobile website runtime
- Merged the dedicated mobile runtime into the main GitHub Pages `index.html`; the public game now uses one URL for desktop and mobile.
- Android, iPhone/iPad, other mobile user agents, and iPadOS desktop mode automatically select the touch runtime. Touch-capable Windows laptops remain on the desktop runtime.
- Mobile runtime exposes the two-stick touch controls, safe-area/landscape handling, mobile graphics profile, adaptive resolution/detail, procedural vehicle fallbacks, and skips the large hand/car/train/motor GLB requests.
- Desktop runtime keeps the existing full desktop menu, keyboard/mouse flow, hands, vehicle models, shadows, and graphics settings.
- Bumped the service-worker cache to `elemental-run-browser-v13-shell-4-mobile-auto` so returning visitors receive the new routing code.
- Automated local routing QA passed for Android phone, regular Windows desktop, and touch-capable Windows laptop profiles. Mobile controls stayed inside the viewport, mobile made no heavy GLB requests, and all three profiles reported no runtime/page errors.

2026-07-27 - Mobile onboarding, loading resilience, hand optimization, and rewarded H5 ads
- Added a mobile-specific five-second How to Play card. It explains the left look stick and the right stick's jump, slide, and ability gestures instead of showing desktop keyboard/mouse controls.
- Added a visible loading percentage with progressbar semantics. The percentage now follows world initialization and the critical hand download instead of jumping directly from an indeterminate bar to the menu.
- Optimized `assets/hand.glb` from 19.36 MB / 120k triangles / 2048px textures to 7.55 MB / 36k triangles / 1024px textures. Visual inspection confirmed the hands remain suitable in gameplay.
- Desktop startup no longer blocks on all vehicle models. It waits at most 12 seconds for the hand model, opens the menu if the connection is congested, and finishes the hand request in the background. Car, train, and motor models are deferred until the critical load settles or the browser becomes idle.
- Kept mobile devices on procedural hands/traffic so they avoid all heavy GLB requests.
- Added Google H5 Games rewarded-ad integration through the official `adBreak({ type: "reward" })` callback flow. Rewards are granted only after `adViewed`; dismissals and no-fill statuses do not grant rewards. Localhost retains a deterministic demo provider for QA.
- Bumped the service-worker cache and added an update check/controller refresh so returning mobile visitors receive the new build instead of an older cached shell.
- Automated QA passed for mobile routing, mobile How to Play, loading percentage progression, optimized hand readiness/visibility, delayed-network menu fallback, rewarded demo completion, skipped mobile GLBs, and zero runtime/page errors.

2026-07-27 - Cyber map frame-pacing and weak-PC optimization
- Fixed the graphics-preset shadow bug: the CITY phase no longer turns shadows back on every frame after Performance mode disables them. Shadow maps now update at a quality/FPS-aware cadence instead of every frame.
- Added a hysteresis-based frame-time governor. Sustained low FPS first lowers dynamic resolution, then suspends post-processing/shadows and shortens visible distance; recovery is deliberately slower to prevent quality/FPS oscillation.
- Added lightweight instanced Cyber buildings for Performance/Balanced, retained detailed buildings for High/Ultra, and made building/decor pool density, visibility distance, and update stride quality-aware.
- Disabled the unnecessary desktop logarithmic depth buffer, which was adding fragment cost on older integrated GPUs despite the scene fitting normal 24-bit depth precision.
- Graphics changes now rebuild the Cyber city/decor pools immediately, so switching profiles has a measurable runtime effect without reloading.
- Added runtime diagnostics for adaptive level, resolution scale, Cyber tier/counts, visible buildings/decor, and shadow cadence.
- Representative SwiftShader weak-GPU comparison: Performance mode fell from about 2.28M submitted triangles / 529 draw calls to as low as 64k triangles / 255 draw calls in the same Cyber route. The original 3.5 FPS software-render baseline increased to roughly 22-32 FPS across repeated runs; normal hardware WebGL is substantially faster.
- Automated QA passed for live settings transitions (Performance -> High -> Performance), seven-second Cyber gameplay, adaptive fallback, service-worker update, screenshots, and zero game-origin console/page errors.

2026-07-27 - Cross-platform elemental world refresh
- Rebuilt Lava scenery around larger, wider volcano silhouettes with calderas, crater glow, parasitic cones, smoke, and short slope-following lava channels. The variants are merged during loading and reused at runtime.
- Replaced the weak Water/Snow mountain variants with broad, organic ranges derived from the Nature mountain language. Water receives restrained waterfalls and mist; Snow receives separate caps, drifts, and a very small crystal accent set.
- Added terraced floating foundations, side pods, sky docks, bridges, crowns, and two arcology silhouettes to Sky buildings. Details are baked into the existing material buckets, so the richer skyline does not add per-building draw calls.
- Removed browser-only Steam, 2x reward, and ad bootstrap elements from the packaged desktop HTML. Browser and mobile retain their existing Steam and rewarded-ad flows.
- Added map-specific runtime counts to `render_game_to_text` and a localhost-only forced-map QA hook.
- Bumped the service-worker shell cache so browser/mobile visitors receive the refreshed worlds.
- Automated desktop-browser, mobile Pixel 5, static desktop-package, and real Electron-package runs completed with no page/console errors. The real desktop package confirmed that Steam, reward, and ad elements are absent and that PLAY enters gameplay normally.

2026-07-27 - Upgrade state and onboarding scale refinement
- Reduced ability-card state labels such as LOCKED, OWNED, SELECTED, and ACTIVE to a compact localized chip size without changing numeric upgrade values.
- Reduced the play-start How to Play overlay to a 250px corner hint with compact keys/mouse glyphs, keeping the top of the 3D playfield readable.
- Local visual QA confirmed 12.4px ability states, a 250x154px onboarding hint, correct start flow, and no browser/page errors.

2026-07-27 - Mobile input and landscape recovery
- Fixed phones using a browser's "desktop site" identity being routed to the desktop mouse/pointer-lock runtime. Compact coarse-pointer touch devices now select the mobile runtime even when their user agent claims to be a desktop Mac.
- Preserved the desktop runtime for touch-capable Windows laptops.
- Portrait phones now show the rotate-to-landscape blocker from the main menu onward and the blocker intercepts touches, preventing an unusable portrait run from starting behind it.
- In landscape, the desktop WASD/Space onboarding is hidden, the mobile two-stick onboarding is shown, and tapping PLAY immediately starts the run without pointer-lock.
- Real touch QA passed for tapping PLAY and jumping from the right joystick. Separate profiles passed for Android landscape, Android portrait, a phone using a desktop Mac user agent, and a touch-capable Windows laptop; no page/runtime errors were reported.
- Bumped the service-worker shell cache so returning mobile visitors receive the corrected routing and input behavior.

2026-07-27 - Organic elemental mountains + complete mobile UI pass
- Replaced the pointed elemental-range peaks with broad irregular summits and layered foothills. Lava ranges now use flatter volcanic crowns instead of needle tips.
- Increased the frequency and variety of Lava, Water, and Snow mountain scenery. Lava ranges gained more emissive slope channels and smoke; Water ranges gained more waterfall ribbons and mist; Snow ranges gained broader multi-peak groups.
- New players now begin on High graphics on both desktop and phone. The mobile High preset is tuned separately for phone GPUs, while the adaptive governor can still reduce resolution and effects if sustained frame time becomes unsafe.
- Reflowed Upgrades, Daily Missions, Leaderboard, Settings, pause, rewarded continue, game-over, HUD, and loading/revive surfaces for phone landscape safe areas. Added a touch pause control and kept every primary action inside the visible viewport.
- Fixed the five-second How to Play card remaining above rewarded-continue or game-over UI when a player died immediately after starting.
- Mobile Pixel 5 landscape QA covered all menu panels, four graphics choices, pause, rewarded continue, and game over with zero horizontal overflow and no browser/page errors. High was selected for a clean first-time save.
- Bumped the service-worker shell cache so returning browser/mobile players receive the new scenery, mobile defaults, and UI layout.

2026-07-27 - Snow/Water terrain separation and organic fluid pass
- Reduced Snow mountain scale, raised the snow coverage and brightness, increased peak radial/detail segments, and replaced obvious geometric rings with a smooth upper snow shell plus irregular slope patches.
- Added late-map side-scenery separation using world-space bounds so Snow/Water mountains are pushed away from neighboring scenery before their transforms are frozen.
- Greatly increased Water mountain density and added more curated mountain placements throughout the opening route.
- Rebuilt Water waterfalls and Lava channels as rounded, beveled, multi-frequency spline ribbons. Waterfalls now reach the ground, terminate in irregular pools, and carry a narrow foam highlight; Lava channels use the same organic silhouette with a hot inner highlight.
- Automated Water QA reported 17 mountains, 34 fluid meshes, minimum fluid height below the terrain surface, and zero mountain overlap pairs. A fresh Snow QA run reported zero mountain overlap pairs. Browser console/page errors remained empty.
- Bumped the service-worker shell cache so returning browser/mobile players receive the terrain and fluid update.
## 2026-07-28 - Mobile control split, portrait runner camera, and mountain seam repair

- Rebuilt elemental mountain peak deformation with periodic seam-safe harmonics, denser capped geometry, regenerated normals, and stable bounds. Duplicate cylinder seam vertices now receive identical offsets, preventing open cracks/backface exposure.
- Re-anchored Water mountain waterfall ribbons to the actual generated peak slope. Top/bottom points, length, angle, foam, and pool placement now follow the mountain silhouette instead of floating as independent vertical strips.
- Raised mobile visual quality without removing the adaptive safety net: quality-aware DPR/render-distance tiers, improved mobile render targets, selective high-quality cyber geometry, and shadows that turn off only when runtime performance pressure is detected.
- Added responsive compact HUD/menu/settings/upgrades/daily/leaderboard/game-over layouts for both phone orientations.
- Split mobile input into independent modules:
  - Portrait: fixed third-person runner camera, lightweight animated runner avatar, swipe lane changes, swipe jump/slide.
  - Landscape: left movement/action joystick and right free-look joystick.
  - Shared double-tap activates only manual `timeSlow` / `magnet` abilities; passive/mechanical `doubleJump` is deliberately excluded.
- Added orientation-safe state resets, mobile layout telemetry, and QA hooks.
- QA:
  - Inline JavaScript parse passed.
  - Playwright desktop, 844×390 mobile landscape, and 390×844 mobile portrait sessions reported no console/page errors.
  - Real pointer drags verified landscape movement/free-look; real portrait swipes verified lane shift and jump.
  - Real double taps activated Time Slow and did not consume Double Jump.
  - Water map screenshot inspection confirmed slope-attached waterfalls and closed mountain surfaces.
  - Official `web_game_playwright_client.js` produced two state snapshots with no `errors-*.json` output.

## 2026-07-28 - First-person mobile controls, desktop-quality tiers, and automatic locale

- Removed the portrait third-person camera, runner avatar, free-look state, and right joystick. Both phone orientations now use the original first-person camera and first-person hands.
- Portrait retains lane-based horizontal swipes plus vertical jump/slide swipes. Landscape uses one left joystick for unrestricted lateral movement; horizontal swipes are ignored and vertical swipes jump/slide.
- Mobile Balanced, High, and Ultra now use the matching desktop presets, cyber density, draw distance, shadows, post-processing, map particles, vehicle models, and hand model. Only Performance keeps the reduced mobile presentation.
- Reflowed the landscape menu to the viewport center, made the Steam link a third circular reward-dock item, and normalized score/gold panel columns and icon sizing.
- Added navigator-locale detection plus country refinement through the CORS-enabled country.is endpoint. Manual language selection remains authoritative.
- Completed all six daily-mission templates and reward/status copy for every one of the 30 supported languages; number formatting now follows the active locale.
- QA:
  - Inline JavaScript parse and `git diff --check` passed.
  - 390×844 and 844×390 mobile sessions had no page or console errors.
  - Landscape horizontal swipe produced no lane target; the joystick moved freely and vertical swipe jumped. Portrait horizontal swipe still selected the next lane.
  - High mobile reported 1120 draw distance, detailed cyber buildings, shadows, desktop-density cyber decor, and ready/visible first-person hands.
  - Localization audit reported 30 supported languages with zero missing UI, onboarding, daily-mission, or browser copy packs.
  - Official `web_game_playwright_client.js` completed with a main-menu state snapshot and no error report.

## 2026-07-28 - Prevent random loading screen during an active run

- Traced the intermittent loading screen to the service-worker `controllerchange` handler: every newly activated deployment called `location.reload()` even while the player was running.
- Removed the automatic page reload. A newly controlling worker is now marked as ready and supplies the fresh shell on the player's next natural navigation without interrupting the current run.
- Added `serviceWorkerUpdateReady` and `loadingScreenVisible` runtime diagnostics plus a localhost QA hook.
- QA:
  - Both the direct update hook and a real synthetic `controllerchange` event were triggered during active gameplay.
  - The run continued, score advanced, URL/navigation count stayed unchanged, and the loading overlay remained `display:none` / opacity `0`.
  - No page or console errors were reported. Official `web_game_playwright_client.js` also completed without an error report.

## 2026-07-28 - Stable moving shadows and floating landscape joystick

- Fixed detached/frozen mobile shadows by restoring a quality-aware shadow-map refresh cadence on Balanced, High, and Ultra. Performance mode still keeps shadows disabled for speed, and the adaptive governor may still suspend them only under sustained GPU pressure.
- Removed the extreme `1000` shadow bias used during phase transitions. All transitions now retain a stable acne-resistant bias/normal-bias pair, preventing the first refreshed shadow frame from rendering incorrectly.
- Replaced the fixed pink landscape joystick with a smaller, minimal white floating stick.
- Added a dedicated left-half touch zone: touching anywhere on the landscape screen's left half places the joystick directly under the thumb; dragging controls free lateral movement and releasing immediately returns movement to zero.
- Kept the right half available for vertical jump/slide swipes and excluded joystick drags from double-tap skill detection.
- QA:
  - Real CDP touch sequences at `(110,72)` and `(220,310)` placed the joystick at those exact centers and produced `moveX` values of `1` and `-1`; release cleared both the active visual and movement input.
  - A right-side upward swipe still triggered jump without activating the joystick.
  - High mobile reported live shadow refresh intervals while shadows were enabled; adaptive shadow shutdown remained functional under software-GPU pressure.
  - Mobile gameplay screenshot was visually inspected, inline JavaScript parsed successfully, and no page/console errors were reported.
  - Official `web_game_playwright_client.js` completed with a valid state snapshot and no error report.

## 2026-07-28 - Stable shadow lifetime and frame-pacing pass

- Traced the intermittent shadow disappearance to the adaptive governor reaching level 2, disabling the shadow renderer, then recovering quickly enough to enable it again. Adaptive levels now change refresh cadence and scene workload without switching High/Balanced/Ultra shadows off mid-run.
- Added shader-warmup and interruption filtering, sustained-pressure thresholds, and 24-second recovery hysteresis. This prevents a single compile/download/tab-restoration stall from changing quality and prevents repeated render-target rebuilds on borderline hardware.
- Capped runtime shadow maps at 2048, or 1024 on low-power/mobile non-Ultra hardware, and introduced stable quality/hardware/adaptive refresh intervals. Performance mode remains the explicit no-shadow option.
- Reduced frame spikes without changing the selected visual preset: low-power procedural traffic avoids GLB download/decode, heavy vehicle loading waits for an idle menu, mobile uses mobile decor budgets, low-power High uses lite cyber geometry, distant Nature/Sky content is culled more aggressively under sustained pressure, and particle/HUD work is spread across frames.
- Corrected renderer diagnostics so world, post-processing, and viewmodel passes are measured together rather than reporting only the final hand overlay.
- Synchronized the Browser and Mobile v1.3 folders. Rebuilt the Desktop v1.3 Electron `app.asar` with the same runtime fixes while keeping AdSense, manifest, and browser-only scripts out of the desktop package; the previous desktop archive and loose index were backed up.
- QA:
  - Forced adaptive levels `0 -> 1 -> 2 -> 1 -> 0`; shadows stayed enabled throughout and only refresh interval changed (`4 -> 7 -> 10 -> 7 -> 4`).
  - Full City, Nature, Sky, Lava, Water, and Snow scans completed with no console/page errors.
  - A spoofed 4-core/4-GB mobile profile kept shadows stable at adaptive level 2 with a 1024 shadow map, used lite cyber geometry, and requested none of the car/train/motor GLBs.
  - Official `web_game_playwright_client.js` completed with a valid menu state, visually inspected screenshot, and no `errors-*.json` output.

## 2026-07-28 - Remove the transient rectangular road shadow

- Reproduced the reported hard-edged road shadow with a controlled City falling-wall scenario. The wall spawned 35 world units above the road while its 20-unit box frame already cast a shadow; because it descended in only a few frames, the detached projection appeared and disappeared like a random dark slab.
- Falling-wall frames now keep `castShadow=false` throughout the airborne/descent state and enable their real shadow only on touchdown. Pool reuse explicitly resets the caster so a previously landed wall cannot bring the bug back on its next spawn.
- Shifted the directional shadow camera focus 78 units ahead while preserving the original light vector. Obstacles now enter the shadow volume while still distant instead of crossing its boundary close to the player.
- Synchronized Browser and Mobile v1.3, rebuilt Desktop v1.3 `app.asar`, and retained the previous desktop archive/loose index as rollback backups.
- QA:
  - Deterministic probe reported `y=35, landed=false, castShadow=false`, then `y=14, landed=false, castShadow=false`, and finally `y=0, landed=true, castShadow=true`.
  - Gameplay screenshot inspection confirmed the landed wall remains fully visible without a detached rectangle in front of the player.
  - Inline JavaScript parsing passed; controlled gameplay produced no page/console errors.
  - Official `web_game_playwright_client.js` completed without an `errors-*.json` report.

## 2026-07-28 - Detailed trains and stable near-field visibility

- Moved the detailed train GLB into the priority loading pipeline. High, Balanced, and Ultra now prepare it before gameplay instead of waiting for menu idle time, so an early spawn cannot silently use the legacy box train.
- Kept the train detailed on low-power computers while retaining procedural cars and motorcycles there. The train is a single instanced runtime mesh, making this a much smaller gameplay cost than the auxiliary vehicle models.
- Added a model spawn gate with capped background retries: if the train request is downloading, decoding, or temporarily failed, that spawn is postponed instead of displaying the old train. No graphics tier or platform can now fall back to the obsolete train.
- Stabilized adaptive Cyber decor thinning. FPS-level changes may still reduce distant signs, chevrons, and flying traffic, but never hide objects inside the player's visible near field. This removes the obstacle/shadow vanish-and-return impression without increasing the full scene budget.
- QA:
  - Normal High and spoofed 2-core/2-GB High profiles both loaded exactly one `train.glb` request before the menu completed.
  - A mobile Performance profile also loaded only `train.glb` (not car/motor GLBs) and reported the detailed train ready, preserving the low-cost tier without the obsolete model.
  - The low-power profile kept car and motorcycle GLBs unloaded while a controlled train spawn reported `detailed=true`, `visible=true`, and `castsShadow=true`.
  - Forced adaptive levels `0 -> 2` across 52 nearby Cyber objects produced zero visibility changes.
  - Inline JavaScript parsing and `git diff --check` passed; controlled gameplay produced no page/console errors.
  - Official `web_game_playwright_client.js` generated five state/screenshot samples without an `errors-*.json` report.
