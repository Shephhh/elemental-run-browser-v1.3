# Troll Obby — v1.89.3

v1.89.3 removes side-mode tutorial cards and help buttons. Troll no longer awards landing/bhop speed bonuses and holding Jump does not repeat jumps; release and press again. Base speed7.0, jump9.5, gravity24, ice launch23.5, reverse pads, geometry, CourseVersion15 and records remain intact. Party/Surf/2D bhop rules unchanged. Full Troll1/2/3 safe route tests pass without bhop.

Camera collision now starts at avatar center instead of a look-ahead target that could enter the maze before the avatar. Maze roof blocks the camera from outside too; final interpolated position is checked against the same authoritative boxes. No hidden route markers, new colliders, or player-physics changes.

## v1.89.1 movement and guide update

Normal Troll walking now targets 7.0 m/s (Party remains 7.5); historical speed values below describe their old builds. Gravity/jump/collision, CourseVersion 15, all geometry/trap timing and the special 23.5 m/s ice launch remain unchanged. Troll 1 safe links, full six-stage Troll 2 and full 711m Troll 3 simulation pass at the new base. Small in-world 3D guide cards and current HUD/gallery ownership are documented in MODE_TUTORIAL_AI_HANDOFF.md.

## 2026-11-10: CourseVersion 15 — phase exit fix and longer sectors

711 m. Sector 2 arms by position on either color and keeps the checkpoint
non-solid/unclaimable until the player waits on the hidden support. The fan
faces across the beam, with 9/5 streaks on desktop/mobile. The bridge and ice
rooms each gain 45 m; the ice launch gap is still 15.5 m. Troll 3 v14 PB is
archived in `legacyTroll3V14Best`. See [layout](TROLL_OBBY_LEVEL_3.md).

## 2026-11-10: CourseVersion 14 — grouped phase lanes and Troll audio

621 m. The traffic sector has lethal full-width bars and paired choke points,
with a single late STOP→GO→STOP feint. Long blue/pink banks alternate together;
the late trap only hides the current collider and briefly draws the incoming
bank without collision. The 3D fan follows the player and switches underneath the
beam. Ice visuals are refreshed without changing the launch physics. Four pairs
share an apparent height before the overhead trigger, then display real heights.
Troll 1–3 use synthesized event sounds through the existing SFX bus. Only the
previous Troll 3 best is archived on upgrade from v13. See [level layout](TROLL_OBBY_LEVEL_3.md).

## 2026-11-09: CourseVersion 13 — Long Cyber course

532 m across five rooms. Section 1 only displays GO/STOP and punches from world left.
Section 2 uses six 70 m parallel runways; section 3 is one narrow hurdle beam.
Section 4 replaces glue with opt-in icy acceleration and low lateral grip. The
15.5 m leap preserves launch momentum, then the dry CP4 deck catches it.
Section 5 uses moving/fake pads and local overhead height illusions without rotating
controls. See [the current layout and tests](TROLL_OBBY_LEVEL_3.md).

## 2026-11-09: CourseVersion 12 — Cyber room redesign

Only Troll 3 changes. Five rooms over 266 m: stoplight and cyber fist, cycling
tiles with invisible solid support, crosswind, sticky ice with a service bypass,
and overhead precision jumps. See [the current room guide](TROLL_OBBY_LEVEL_3.md).
The version 11 migration preserves Troll 1–2 bests and progression, while
archiving the old Troll 3 time in `legacyTroll3Best`.

## 2026-11-07: CourseVersion 11 — Strict checkerboard, boulder coverage, stair fade

Troll 2 has 32 red plates on strict checkerboard parity. On the opposite
parity 16 cells are safe and 16 are bait. Pairs slide laterally, and the safe
route mixes diagonal jumps with straight skips over a full square. The rolling
sphere has smoothed normals and a 3.85 m hit radius; closed cabin mouths are
inside its sweep, while valid shelters are outside. Stair treads fade in
place using shared materials; support and restore timing are unchanged.

## 2026-11-07: CourseVersion 10 — Varied board, smooth stair display and roofs

The 64-cell board mixes straight lanes, two-wide options and a same-row
transfer; 27 visible plates and 14 bait cells remain. The staircase uses a
continuous presentation height for avatar and camera only. Physical risers
and crumble timing are unchanged. The fake exit shows a proximity-triggered
WRONG WAY sign. Six cabins have solid roofs and an interior camera boom.

## 2026-11-07: CourseVersion 9 — Enclosed maze, higher spiral and sliding red plates

Troll 2 is now 381 m. The maze has 91 connected cells and a collidable but
unrendered exit. The 96 sector steps have a single authoritative ground snap
when walking; airborne landings still use the sweep. CP3 is elevated and the
77 m ramp rises another 8 m. Three refuge pairs have three modeled walls each.
The 16×4 checkerboard uses permanent visible red spike plates that slide into
predicted bait landings. Lethality follows the plate position, and the authored
safe route is outside their movement. The four shifting blocks keep their
relative coordinates/timing at the new elevation.

## 2026-11-07: CourseVersion 8 — Walkable spiral and predictive spike board

Troll 2 is 327 m with old opening dimensions, opaque shell/translucent maze
interior, 32 contiguous low risers, and an elevated CP3. The single 77 m ramp
shares its grade with six refuge pairs and the 17/13 m/s boulder path.
The four-block room is unchanged in local coordinates. In the 12×3 flush grid,
the descending ballistic endpoint activates only the expected wrong tile,
and lethality checks the actual landing tile. Correct tiles remain flat.

## 2026-11-07: CourseVersion 7 — Troll 2 rebuilt in six rooms

Snow course is now 240 m with CP0–6. Lethal emissive panels; closed-roof 1%
glass dead end (walk outside the two side walls); an ascending crumble spiral
ending in a plain-looking reverse pad; a slope of ice terraces with three
opposite refuge pairs and one blocked mouth per pair; four synchronized
Z-shifting stones; and five offset spike rows. The boulder shares the existing
ball vs player AABB test, with separate uphill/downhill speeds. Geometry data
is in `obby-course.js`; `troll-obby.js` owns state, trigger and rendering;
`obby-run.js` owns sign/material helpers and migration. Hidden cabin blockers
need no meshes; all spike teeth share one instanced batch. No new assets.
Troll 1/3 records and unlocks persist; old Troll 2 best is archived.

## 2026-11-05: CourseVersion 5 — Troll 1 sketch rebuild

Troll 1 uses five 32 m rooms: slide, invisible bridge, reversed bridge, deadly
checkerboard, and invisible-wall maze. Source `TROLL_ONE_LAYOUT` is JSON-compatible;
`LEVELS_TROLL_PARTY.md` has actual world coordinates and validated safe path. Troll
render/trigger logic remains isolated in `troll-obby.js`; shared physics pose and
save migration remain in `obby-course.js` / `obby-run.js`. Slider syncs collision
and mesh at fixed time, ghosts use 0.1 opacity without depth write, and checker
kill tiles hide their gift decoration. v4→v5 archives only the changed level's
best; Troll 2/3 layouts and bests are retained. Nature trees mix by family.

## 2026-11-03: CourseVersion 4 — authored paranoia rooms

Current route inventory and full JSON arrays: LEVELS_TROLL_PARTY.md. This section
supersedes historical CourseVersion3 coordinates below. Same160/200/240m lengths,
4/5/6ordered checkpoints,120Hz physics and limbless independent-orbit avatar.

- Nature: easy jump into invisible wall, always-present1.8m bypass, broad centre
  shove/gift traps and reverse-pad decoys. Snow: five paired-gift corridors,
  seven contact-timed collapsing landings, reverse pad throwing+19Z/+7Y and
  approachFake at the final CP. Cyber: all3obvious upper stones fake, real
  Y4/W1 lower shelf with1.4m ascent risers, single solid maze deck,3revealing
  hiddenKill walls, left X=-6/W3 finish with central lethal gift.
- safePath lists actual waypoints; repeated platform IDs encode maze corners.
  safeRoute true means route traverses the solid, not that every point is safe.
  Traps remain in platforms[].trap; hazards=[] prevents duplicate collisions.
  Stage retry resets contact/crumble/approach consumption, reveal helps learning.
- TROLL_COURSE_VERSION exported and used by host. Old PBs archived, completed
  accesses preserved. CP support/finish rendering follows actual x/w/d instead
  of fixed centre positions. Y4 grounded shelf does not trigger death-camera mode.
- Cyber ground cube infill removed; true normal-game textured buildings remain,
  resized to25–46m and38m footprint, no115m distant-only landmark offset. Nearer
  window skyline and80–260fog. Triangle budgets/cache/instancing unchanged.
- output/troll-176-test.cjs:88real physics links, continuous hiddenKill maze,
  all7traps, crumble reset, no CP skip, left finish and zero coplanar overlap.
  Official desktop/mobile lifecycle and screenshots checked. Party162 and
  horizon176 regressions pass. No real-phone FPS guarantee or live publication.

## Historical 1.74.0: hub avatar, decoupled orbit, bounded render cost

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

`trollCourse(level)` builds three authored courses with 5/6/6 modules, 160/381/240m.
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
