# Troll Obby — v1.74.0

## 2026-11-03: hub avatar, decoupled orbit, bounded render cost

- Actual hub avatar hierarchy is cloned with cloneHub; geometry/material/texture
  ownership is isolated. Same1.7x2x1.7 rounded body, face, owned hat, no limbs.
  Same hub animation helper. Hub itself is not mutated. Missing clone host
  dependencies surface as readiness errors, never as a different fallback model.
- FOV60,10.5m boom,.48 default pitch,.18-.9 limits,9/s follow and ahead3.8 look
  match LobbyHub. Mouse .005/.004 and mobile drag use the same sensitivity.
  Avatar facing follows movement input/velocity only, NOT orbit yaw. R preserves
  orbit instead of resetting to an unrelated low angle. Fall camera anchor remains.
- Camera collision uses an allocation-free slab segment test against active course
  AABBs; decorative instanced triangles and shader-deformed terrain never enter the
  camera query. No forced scene.updateMatrixWorld(true) per render. Matrices update
  normally in renderer; static batching does its single build-time bake.
- ALL Troll confetti allocation/render updates removed. Cheap radial contact shadow
  replaces particles/shadow maps; hemisphere ground tint and cool rim light give depth.
  Cyber metal/ice roughness tuned without raising global resolution or shadow cost.
- Environment retains actual Party biome assets, with per-variant65k mobile/110k
  desktop triangle budgets, no forced minimum of3heavy instances, row caps and fog
  hidden cell culling. No new downloads. Shared Party code/visuals untouched.
- Full scene references and owned GPU resources released on mode replacement.
  HUD control text uses compare-before-write, while retaining native UI localization.
- Extra deterministic traps: approachFake (proximity +.16s wobble before collision
  loss); shoveWall (contact releases wall, pushes down at-12Y/brief recoil);
  hiddenKill (invisible AABB; revealed on death for learning). Safe routes retained.
  Per-stage trigger/consumed timers reset at retry. CourseVersion3 archives old PBs.

Research: [Roblox environment construction](https://create.roblox.com/docs/tutorials/curriculums/environmental-art/construct-your-world),
[Three Raycaster docs](https://threejs.org/docs/pages/Raycaster.html),
[Cat Mario trap breakdown](https://www.drop-the-cat.com/catgames/cat-mario/level-1),
[Roblox Troll Obby](https://www.roblox.com/games/13189735542/Troll-Obby).
Interpretation: background reinforces space, route silhouette stays clear, and traps
have deterministic triggers/tells/counters. No external game assets/code copied.

Diagnostics: isolated software-Chromium80-render sample before had41.7ms total and
2.4ms triangle-query time; after samples61-110ms total with0triangle queries.
Different random scenery/real hub hat and driver warm-up make total samples NOT a
valid FPS improvement claim. Camera query cost is removed; the initial hypothesis
was NOT established as the sole source of all lag. No universal60FPS claim.
CPU fixed step remains120Hz with existing .05s update cap (max6steps), not an
unbounded catch-up loop. Real-device GPU/frame-time profiling is still required.
Browser checks: exact hub geometry/color, orbit without avatar rotation, movement
rotation, no confetti, analytic camera obstruction, touch jump/look isolation,
all3courses/CP/restart/finish/Party disposal. CPU62safe links plus7trap variants.

## Historical v1.73.1

## Current revision: biome rooms, not repeated stone rows

The v1.73.0 design below is historical where contradicted here. Course version2
archives incompatible old bests independently from Party Run. Three courses use
Nature / Snow / Cyber, respectively, via the EXACT Party Run sky, ground relief,
complete compound decor factories, planDecor and backdrop. Environment instance
budgets and yielding are copied from Party; no replacement neon-column landscape.
Shared source geometries/materials are cloned and scene-owned, not globally disposed.

Six spatial families replace the repeated two-row layout: broken center bridge +
long side ledge; broad room + invisible central wall + narrow side balcony;
reverse-pad decoy + real wraparound route; zigzag gift gallery; contact-timed
permanent crumble stairs; mixed offset final crossing. Four/five/six rooms per
course retain safe checkpoints40m apart. Platform widths, depths and sideways
travel differ per room; fake side is not always a mirror of four safe stones.
Crumble timers reset on local retry, never invalidate later checkpoints.

Body and cap geometries use physical dimensions with cached rounded geometry,
not anisotropically stretched rounded unit boxes. Mat caps use biome tints; raised
edge strips avoid coplanar flicker. Checkpoint decks have real support columns.
Dynamic crumble tiles are excluded from static batching, keeping visual loss of
support aligned with collision. Third-person camera and native UI remain.

Research: [Level Devil/Poki](https://poki.com/en/g/level-devil) describes short
trap-themed stages and learning through retries. [Epic obstacle design](https://dev.epicgames.com/documentation/fortnite/fall-guys-designing-an-obstacle-course-in-fortnite-creative?lang=en-US)
uses explicitly paired moving props and forces. Our interpretation: one core trick
per room, a consistent learnable solution, then mixed final challenge. No copied
map coordinates/assets and no claim to have played the external game interactively.

CPU test now verifies62actual safe-route links, all four original traps, crumble
collapse/retry, ordered CP, all finishes and Party regression. Official client tests
cover three biome builds, real portal/UI input, camera, traps, finish/next/restart,
Party isolation and mobile jump/look. Real-phone performance remains unverified.

## Historical v1.73.0 baseline

Date: 2026-11-02. Separate third-person mode; existing Party Run remains first-person.
The old `OBBY_MODE_AI_HANDOFF.md` is historical. Its shared 120Hz swept-AABB and
2mm support probe remain authoritative; no external physics library was added.

## Research / design decisions

- [Roblox / Randomizers X Troll Obby](https://www.roblox.com/games/13189735542/Troll-Obby): unconventional solutions rather than an ordinary obstacle course.
- [Roblox / Crazy Troll Obby](https://www.roblox.com/games/106255300925714/Crazy-Troll-Obby): hidden surprises and visual illusions.
- [Poki / Unept Level Devil](https://poki.com/en/g/level-devil): contact-triggered disappearing floors and fake safe paths. We use predictable authored tricks, not random deaths.
- [Apple editorial on Level Devil](https://apps.apple.com/us/iphone/story/id1732098061): humor through subverted platformer expectations.

Search terms covered Roblox Troll Obby mechanics, fake obby traps and unexpected
platformer traps. No third-party models, maps, textures or code were copied.
Research inspired the mechanics, not a claim of identical Roblox physics.

## Changed / added blocks

### obby-course.js

`trollCourse(level)` builds three authored courses with 4/5/6 modules, 160/200/240m.
`fake_stones`, `invisible_wall`, `troll_bounce`, `gift_bricks` are stage data.
Platform fields `trap`, `stage`, `consumed`, `revealUntil` hold deterministic state.

`trollContact(player, platform, data, topContact)` is called at the swept impact
and the existing resting support probe. It is a no-op unless `data.troll` is true.

```js
if (trollContact(p, hit.o, data, hit.axis === 1 && hit.sign === 1)) {
  remaining *= 1 - hit.t;
  if (p.dead) break;
  if (hit.o.trap === 'reversePad') { p.y = hit.o.y + .01; break; }
  continue;
}
```

- Fake stone: top contact consumes the collider immediately; clears support,
  jump buffer and coyote, preserving falling velocity and unused sweep time.
- Invisible wall: real swept solid, visually hidden until hit, then visible for2s.
- Reverse pad: top contact gives +Z19 and +Y7, .6s brief impulse stun and .7s pad lock.
  Forward travel in these maps is -Z. No changing global movement constants.
- Gift: every face is lethal; a small overlap guard also handles starting inside.

Every module has a genuine safe side. 4.5m stones with7m center spacing have2.5m
gaps. Checkpoints are15m wide. Base jump is9.5, gravity24, walking7.5; no glove,
dash or bhop is required. Module order and safe side change between courses.
No per-frame randomness. Hazards do not move or change their solution after death.

### troll-obby.js (new)

`TrollRace` owns countdown, ordered checkpoints, trap reset, fall recovery and finish.
It calls `ElementalObbyCourse.step` at1/120s. No tsunami/automatic forward push.
Gifts respawn immediately; ordinary falls briefly show the tumbling cube, then
respawn at the last earned checkpoint. R returns to that checkpoint; whole-course
restart is available in the result UI. Elapsed time continues through checkpoint deaths.

`ElementalTrollRun extends ElementalObbyRun` reuses existing controls, touch pad,
pause/settings/results, active-time clock, finish economy and host lifecycle.
It overrides scene build, race restart, third-person rendering, selection and snapshot.
Third-person camera targets feet+.8, follows with exponential delta-time damping,
and raycasts toward the desired position. It retracts immediately at obstruction
and eases outward. Falling latches an elevated camera anchor rather than diving
down after the avatar. Raycasters/vectors are reused; no physics mutation.

Rounded cube, limbs, party hat, speaker towers, neon platform bodies, magenta/cyan/
lime decorations and48mobile/96desktop instanced confetti. Confetti has no physics.
Static compatible meshes are baked into InstancedMesh batches once. Camera proxies
retain their baked world matrices off-scene. Fake tiles/revealing walls are excluded
from static batches so visibility and collision remain in sync. Surface caps are
above body tops, not coplanar. Shared normal render pipeline supplies display surface
restoration and postprocessing; normal scene/materials are never modified.

### obby-run.js / obby-interface.js / CSS

Optional `api.storageKey`, `api.courseVersion`, `api.mode` and `roundCount` allow
reuse without altering Party courses. Independent HUD IDs share `.obby-mode-hud`
styling (including small Poki embeds). Native pause/result handlers act only for
their active owner. Troll has no FPS hands, reticle, dive or chase overlay.

### Host, lobby, loading

`game-runtime.js`: mode registry retains lightweight controllers, only the selected
Obby-family scene is prepared. Selecting another disposes inactive owned scene
resources; no duplicate downloads or second renderer/RAF. Current `obbyRun` pointer
routes existing input/audio/pause/blur/context-loss/SDK/render logic to the active
controller. Background loading and countdown are not counted as gameplay.

`mode-concourse.js` + `lobby-hub.js`: extra magenta portal on the far wall, between
Coming Soon and2D. Existing portals remain. Three-level arrows, completed star and
unplayed glow use the same lobby mechanism. `lobby-onboarding.js` recognizes troll
as a played mode, so Games guidance does not repeat after it.

`index.html`: new script immediately after obby-run, before host runtime.
`game-localization.js`: TROLL OBBY is the invariant mode title across30languages;
all action, timer, pause, next/retry/result strings reuse existing localized keys.

## Persistence / rewards

`elemental-run-troll-v1`, independent courseVersion1, best/completed/unlocked/level.
Party remains `elemental-run-party-v1`, courseVersion14. Switching modes does not
rewrite either record. Finish uses existing active-time-based bounded reward and
host receipt guard; repeated checkpoint death has no coin payout. No new metaprogression.

## Validation

- `output/troll-175-test.cjs`:75adjacent safe-route links solved with actual120Hz
  physics, all4trap contacts, fake persistence, reverse impulse, immediate gift
  checkpoint, no checkpoint skipping, all3finishes and Party skin-support regression.
- `output/run-troll-175-official.mjs`: official develop-web-game Playwright client,
  local Poki stub, real portal entry, keyboard release, traps, camera/fall, pause,
  reward/next, Party first-person isolation, disposal, re-entry and mobile touch.
- Screenshots are opened and visually checked. Initial QA found/fixed script
  ordering during integration and coplanar platform caps; these are not pending bugs.
- Local software-WebGL / emulated touch tests are not certification of low-end
  phone60FPS or live Poki SDK/Player Fit approval. No automatic Poki upload.

Same canonical source and existing release ZIP; output/QA files are not packaged.
