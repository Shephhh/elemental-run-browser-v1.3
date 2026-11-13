# Mode tutorial cards REMOVED — v1.89.3

Current decision (2026-11-13): remove all five side-mode tutorial cards and pause/Flappy question-mark buttons. Their controller, media component, translation extension, stylesheet and 24 clip/poster pairs are no longer loaded or shipped. The seven-card MODE SELECTION GALLERY and the lobby's cards icon are deliberately retained. Levels/Endless playable tutorials are unchanged.

Initial boot no longer prepares the lobby or the first tutorial/Nature corridor before mode choice. Lobby uses its existing `prepareForEntry` gate on entry; the first Levels tutorial uses `prepareBootTutorialEntry` under the existing level preparation overlay. The simulation/clock loading-fade guard is now `bootModeRevealPending`, independent of tutorials. Do not reintroduce card-specific SDK, rewards or input pause hooks.

Everything below is ARCHIVED v1.89.2 documentation, not the current implementation.

---

# Archived real-gameplay mode guides — v1.89.2

## Current UX (supersedes 1.89.1)

The five side modes use real recordings of this game's actual renderer/controller/physics, not a separate 3D showcase or generated animation. The second WebGL preview context and mode-tutorial-3d.js are removed. The right-side card is 64vw × 80vh on desktop (a little over half the viewport area); responsive 65vw short-landscape / 94vw portrait layouts preserve room for the outside prompt.

"Tap to continue" is below and **outside** the article, localized in 30 languages. Clicking that prompt or outside the card advances; X/Escape dismisses immediately in the current game. No Next/Back/Skip/Play buttons or forced wait. Clicking inside the card does not advance. Normal Levels/Endless tutorials remain their existing playable education; this module does not replace them.

## Goals and lessons

- Troll: ordered checkpoints/finish and watch for tricks; movement/camera; jump; fall/return checkpoint. No hidden route or trap solution is explained.
- Party: selected race/wave, survival timer or collection objective first; movement/look; jump/dive.
- Surf/Bhop: finish quickly, keep momentum and use checkpoints; camera/steering; landing jumps; surf ramp contact.
- 2D: dodge/collect/record and one-hit death; jump; slide/jump cancel; pad/shield/equipped glove. The passive-revive goal omits the unqualified one-hit sentence. Glide/double jump use actual jump binding, revive never teaches an active skill key.
- Flappy: gaps/record/retry goal; tap/release flight; gap/collision/retry.

Troll, Surf and 2D have four pages; Party and Flappy three. Goals plus current controls are translated in all 30 languages. Existing custom key labels and mobile touch labels remain. Objectives explain rules, not puzzle answers.

## Assets and ownership

mode-tutorial-video.js wraps exactly one reused native muted/playsinline/loop video element. The 24 H.264 baseline fast-start silent clips and 24 WebP posters live in assets/tutorials/ (about 3.9MB total; largest clip about 352KB). See its README for provenance. Only the active lesson's video/poster loads; no video enters initial boot/preload. Hidden tabs pause video, reduced motion uses the poster, close pauses, removes src and calls load to release decoder state. No tutorial RAF, Canvas, texture/material generation or WebGL context. Media failure does not block dismissal.

Goal pages reuse appropriate clips. Party supports its three goal types; 2D has eight equipped-glove variants. The Surf clip contains verified actual surf-contact frames and ends before falling. Real-game recordings are staged in representative existing areas using real physics, not new gameplay geometry. Capture/encoding tools and raw frames are output/ development artifacts and are excluded from release.

mode-tutorial.js keeps the singleton needs/open/active/mode/snapshot API; open returns close. mode-tutorial.css owns responsive layout, outside prompt, pause ? and lobby cards icon styling. Existing storage remains elemental-mode-tutorial-v1, version 2; returning users are not forced through the revised guide again. Help shows the latest version.

## Entry, pause and SDK

Prepared mode entry happens first. The original loader fade finishes, the actual world is rendered, then the pending guide opens once. Boot cards, Games portals and the Flappy stand share that host gate. In-guide simulation, countdown, ActivePlayClock, rewards and boost duration freeze; Flappy's worker pauses separately. Input buffers clear on open/close. Closing an initial card requests desktop pointer lock in the trusted click; closing Help stays paused.

Poki stays inactive/reason mode-tutorial while teaching. Loading and video viewing are not fake gameplay. The boot simulation gate also returns while bootModeStarting; background preparation cannot advance the old world. Existing ? icon on pause and Flappy header remain. Lobby cards icon/gallery cleanup/return pose remain as in 1.89.1.

## Level entry and retention tuning

The original small campaign preparation panel is visible above the gallery/portal handoff on Levels entry. Warm entry has a 180ms minimum readable response; real preparation determines longer duration. First-time playable tutorial uses localized Tutorial label, not a misleading Level 1 map label. Continuous boundaries and tutorial→level1 are unchanged; there is no added inter-level loading corridor.

Only normal Level 1/2 coefficients change: traffic .44/.47, spawn interval 1.72/1.68, density .66/.76 and safe opening 6.2/6.0. Original targets and Levels 3–120 are identical. This is a testable early-difficulty hypothesis, not a promised playtime improvement. Troll base speed 7.0, other mode physics, rewards, records, CourseVersion and cache layout remain unchanged.

## Verification

Official develop-web-game client wrapper: output/run-1884-official.mjs, QA_RELEASE=18920. Five actual mode entry/help paths pass, including 640×360 2D and portrait Flappy. World/reward/clock freeze, goal-first, large card, outside prompt, native playback/time advancement and close/source cleanup are checked with screenshots. Normal first tutorial and returning Level1 loading, and Endless entry pass. Component test output/test-video-guide-18920.mjs covers 54 responsive/RTL pages, eight glove clips, three Party goals, trusted close, 30 reuse cycles, active-page media requests, reduced motion and visibility pause. All 30 goal/prompt translations are complete. No new page/WebGL errors in these tests.

The refreshed private Player Fit findings and scope/cause caveats are in output/PLAYER_FIT_RETENTION_2026-11-13.md (not shipped). Latest completed test is still Nov11, not a measurement of this local build. No test settings, SDK timings or live release were changed.

Update the same existing local Poki folder/ZIP to 1.89.2, including all video/poster assets and excluding the obsolete 3D preview. No live upload or Steam/Pixel edits.
