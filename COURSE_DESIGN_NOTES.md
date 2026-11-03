# Bhop/Surf — unified authored campaign and render/collision polish (1.45.0)

## 1.45 — alternating covered/open sections and natural takeoff momentum

`surf-shelters.js` places at most six biome-themed passages per original map, separated by open-air sections. There are55accepted passages across12maps; this is not an exact50%area claim. Open ends, real roof skylights, side windows, grounded supports;20mlanding headroom or46mramp-cluster headroom. Preparation rejects source-brush/portal/standing-jump-body intersections. Original authored vertices andJSON are untouched. Render and convex geometry share transforms; separate structureSolids are indexed with extended playBounds. Three instanced batches maximum, identical desktop/mobile course, generation cancellation and existing resource disposal.

Ramp edge SAT separating axes must not masquerade as upward source support: actual walkable-face alignment is required. Candidate-plane/crease resolution starts from the incoming vector rather than successively losing it. This removes the reproduced one-tick false-ground friction without changing120Hz,36-fieldhistory, movement constants or explicit .84surf-jump penalty. Retain-mode portals restore exactXYZvelocity after placeWorkshop. Surf HUD reports total3Dspeed; Bhop remains horizontal. See progress.md for baseline reproduction and CPU/browser evidence. Reference: [Valve Source SDK movement](https://github.com/ValveSoftware/source-sdk-2013/blob/master/src/game/shared/gamemovement.cpp), [Momentum Surf guide](https://docs.momentum-mod.org/guide/gamemodes/surf/).

## 1.43.1 — Eclipse contact-only failure and grounded coastal landmarks

The indoor experiment was reverted at the user's request. Keep the open world. Eclipse's three full flight-room volumes now constrain terrain below the entire playable space, not merely below individual source brushes. The previous heightfield could kill a recoverable airborne player between brushes. Eclipse alone also disables speculative4s recovery death and refuses trigger.bottom as a virtual return floor when no real convex support exists at the contact XZ. Actual supported returns, terrain and world boundaries remain lethal. Teleport/retry reset fall-probe state explicitly. Exact source geometry and120Hz/history format remain unchanged.

Coastal island/mountain/lighthouse models now sample actual ramp clusters across three height bands, rather than only distant checkpoints. Raised landmarks are connected to terrain by closed tapered rock supports, with full source-hull and portal-sight clearance. Desktop28/mobile16landmarks remain inside the existing104/48total environment-model budget; rock supports add one instanced draw call. No camera-relative skyline, new full floor sheets, per-frame geometry generation or new downloads. Other maps/modes retain their previous behavior.

## 1.43 — grounded world dressing, local terrain and recovery-aware falling

Removed the camera-relative skyline, not just its floor: every non-flying decor
model now sits on the world terrain and shares normal depth testing. The former
global low-floor propagation is replaced with route-near landing/ramp anchors,
bounded stencil smoothing, then conservative whole-cell clearance below all
source solids and known room volumes. Tall ceilings/columns are not accepted as
landing anchors. Terrain steep faces blend to biome rock in one shader; water
and lava maps no longer stretch vertically up cliffs. City ground has readable
world-grid contrast. Buildings/cabins/lighthouses receive bounded batched bases.

Visible terrain is also the fall failure plane. A conservative four-second
ballistic recovery-envelope query handles unsupported falls that have no catch
platform, without changing source gaps, SAT, movement or the rewind format.
Queries run at10Hz only after9m unsupported descent; two misses trigger death.
Real deep catch ramps remain allowed. Recovery faces are prepared in async2ms
slices, not on the first fall. Teleport/reset/rewind reset probe state.

Coins use one instanced draw rather than up to40independent meshes, preserving
exact transforms and collected/rewound/retry visibility. Mobile terrain128grid,
48decor instances; desktop192grid,104instances. No camera skyline draw calls.

Append11Blueshade(Bhop,Nature,T1) and12Paradigm(Surf,Lava,T4). Official template
metadata/hashes were verified before mechanical export. Neither has forward
teleports: reset returns do not get portal models. Keep the previous ten IDs and
records. Targets are provisional; source commercial redistribution permission
is unverified. See assets/courses/README.md. No new public deployment.

## 22 October 2026 — camera-ground audit, real platform collision, ten sources

The1.41hazard sheet removal was necessary but incomplete: a separate camera-Y-38skyline floor remained in every biome, and Sky added five near-camera transparent fog floors. Both are now removed from the Surf adapter. Source floors and world-anchored terrain remain; Sky uses a muted opaque matte cloud texture, not foreground transparency. Normal runner skies are untouched.

All upward source convex faces passed standalone sweep tests. Missing support came from source solidity=never structural decorative volumes: opaque closed material/size/plane-validated shapes now participate in physics/spatial index at their exact visible geometry(62Utopia/46Terra). Liquids/glass/foliage/ground and thin decorative rails excluded. Aztec's10non-solid water volumes and Beginner's8liquid brushes are omitted to avoid flicker against Elemental ground. Explicit portal metadata prevents Aztec's narrow reset wall from appearing as an exit; only its end_zone gets a portal.

Checkpoints accept swept3D airborne passage through floor-4..+14m volumes, not mandatory grounding; stacked rooms remain bounded and old checkpoints cannot overwrite new. Display progress is monotonic within an attempt; checkpoints preserve the peak, full retry/next level resets it. Glide has4s accumulated active flight time; button toggles do not refill, support/teleport does. glideTime is appended to the60Hz History(width36) so rewind restores it;120Hz sweeps and movement acceleration remain unchanged. One configurable Skill row retains backward-compatible timeSlow binding storage, with fixed Space glide/double-jump. Paused settings receive native wheel scrolling.

Ready-source maps Nila(Pcpie) and Eclipse(Paper-Cut) append as9/10without renumbering old records. Exact SMFs/hash/credits recorded in assets/courses/README.md; no public publication/licensing claim. Only supported0/3and0/4actions found. Eclipse stage names sorted naturally; _nomove teleport variants share checkpoint identity. Medal times provisional. All4normal factory variants now participate in every biome skyline with8mobile/12desktop instances per variant; no extra floor plane or dynamic lights.

Below1.41and earlier notes are historical. Latest test/package status: progress.md.

## 22 October 2026 — remove phantom floor sheets

The reported Treehouse3 layered/transparent appearance was reproduced by toggling the added hazard mesh. Trigger -2 starts at Y4.17125 while its real source floor is Y0.94: painting trigger.bottom drew a second floor3.23m above the original, hiding pedestal bottoms. Opaque material flags alone could not fix this. All hazard overlay triangles are now removed, not merely lowered or recolored. Real broad supporting source floor faces use the active biome's normal floor material; lethal/return logic remains unchanged. No red hazard-floor texture/mesh is generated.

The biome material helper is shared with added terrain, with world-space XZ UVs and a fixed theme tile scale. Texture transforms are reset on Surf-owned clones only; normal gameplay's source textures stay untouched. Non-ground foundation sides retain architectural/stone mapping rather than collapsing into horizontal UVs.

Terrain preparation now stamps whole cells beneath every source brush/decor AABB and conservative authored room volume, then only lowers during slope smoothing. All four cell corners stay below the cap, including tiny geometry between vertices; this prevents triangle interpolation from crossing rooms/platforms. Existing first-room terrain was already far below the source floor, so do not present terrain alpha as the sole demonstrated cause of the screenshot. Models use the final constrained floorAt. Asynchronous yields/cancellation and current+next resource lifecycle remain.

QA: eight-map324100cell-corner checks, source hull identity/physics tests, eight desktop/six mobile map browser checks including source-floor raycasts, shared UV/material checks, portals/checkpoints/retry/transitions/stats. Treehouse3 first room, outdoor roof and five upper/lower destination rooms inspected. These are automated fixtures, not full human course completion/device FPS guarantees. Normal Level/Endless/2D untouched. Below1.40and earlier sections are historical.

## 22 October 2026 — one alternating campaign

Active order: Nux(City/Bhop)→Beginner(Water/Surf)→Leaf(Snow/Bhop)→Kitsune(City/Surf)→Aztec(Lava/Bhop)→Utopia(Sky/Surf)→Treehouse3(Nature/Bhop)→Terra(Water/Surf). All six biomes appear; source geometry is unchanged. The old four+four catalogs are legacy save-import identities only. The lobby has one entrance and one eight-card stats tab; the player no longer chooses a discipline. Slide controls/physics follow the current level kind, including automatic boundaries.

elemental-run-workshop-maps-v1 merges old map PBs by stable ID without deleting the old keys or confusing removed/generated/chapter records. Existing clean times and medals remain tied to the same authored map.

True forward teleport triggers/end zones get a shared two-draw-call portal frame/swirl. Death/return volumes never get misleading exit portals. Visuals do not alter collision or trigger logic; shader time is deterministic player.time.

An exact coplanar convex surf join stopped VX18→0 in the reproducer, even with no gap. The receiving end cap now accepts a supported near-coplanar(dot>.985) <=8cm step with full-body clearance. Source-face height is used, not an arbitrary AABB top. 0/1.5/3cm joins preserve speed;9cm/1m lips and genuine walls still block. 120Hz solver/history fields stay intact.

Render-only exact duplicate/internal polygons are removed, including2126duplicates in Utopia and745in Kitsune; collision hulls remain identical. Return-floor paint is deduplicated. World camera depth range is.16..2600; hand-camera state restoration stays separate. Terrain is opaque/double-sided, based below the LOWEST overlapping room floor rather than the highest; the cloned host floor forces output alpha1. Skybox upward collision faces may not be hidden (the eight current maps did not contain such upward faces, so this is a guard, not the diagnosed sole cause).

All actual lethal floor overlays are visibly RED, with biome-specific circuitry/vines/cloud arcs/fissures/ripples/ice-cracks. Safe platforms do not become visually lethal merely because their biome is Lava. Tests/status: progress.md; current architecture: SURF_MODE_AI_HANDOFF.md. Below1.39and earlier notes are historical.

## 21 October 2026 — generated maps rejected/replaced

The user rejected all4original generated layouts. surf-custom-maps.js is removed from source/index/release ZIP. Ready-source replacements use the SAME existing SMF decoder/convex exporter and uniform0.029375scale as Nux/Treehouse/Beginner/Utopia. Downloaded originals' SHA256 matched the official template API. No retiming/stretching of gaps or new custom-course template. Source notices and permission uncertainty remain in assets/courses/README.md; this update does not publish publicly or establish redistribution rights.

| Mode | Current full-map order | Theme | Raw hulls | G/S/B design seconds |
|---|---|---|---|---|
| Bhop1 | Nux | City |1215|60/90/135|
| Bhop2 | Leaf | Snow adaptation |294|45/70/105|
| Bhop3 | Aztec | Lava adaptation |337|60/90/135|
| Bhop4 | Treehouse3 | Nature |834|150/210/300|
| Surf1 | Beginner | Water |491|75/110/165|
| Surf2 | Kitsune | City adaptation |2362|150/220/330|
| Surf3 | Utopia | Sky |3351|180/255/360|
| Surf4 | Terra | Nature |573|90/140/210|

Targets are provisional design values, not measured human clean runs. Classic Rainbow Aux was inspected but excluded because its timed type2gravity changes are not in the current supported physics/history contract; no silently incomplete gravity mechanic ships. Supports/12x10checkpoint zones, ground-only returns, metadata-ID save migration and GPU2/CPULRU2 stay. Old generated-map layout22PBs archive under legacyLevels, never reassign to new sources. Active source maps layout19.

All authored navigation arrows and HUD wayfinder are removed, including booster chevrons (actual pad border remains). course-polish keeps only real wall fixtures; no graph planning/arrow instancing/update. Positional progress/internal portal metadata stay, not rendered as directions. ESC has no level picker; lobby portal/stat selection stays.

Surf brace fingers follow camera heading's tangent on the actual plane, not fixed world+X; adjacent smooth normals latch the arm independently of camera yaw. Existing shortest-path quaternion smoothing/camera restore/Layer1 isolation stay. Actual Three tests rotate camera and plane through360°: camera-local hand quaternion remains invariant; palm stays flush, fingers forward,30/60/120/144FPS agree. No collision/input/History changes.

Below are historical1.38/1.37 notes; the generated layouts and old arrow/ESC features described there are no longer active. Latest QA/package status in progress.md.

## 21 October 2026 — ground-only returns and checkpoint floors

Return volumes are not physical obstacles: Nux-3 is2.82m tall above floorY0, and old body-AABB firing killed feetY2.7. Treehouse-8 is a real forward portal but old height<3.2 rule killed descending entries. Per-map forward portal identities now separate actual teleports from floor returns; checkpoint index and arbitrary height no longer decide lethality. Cached supporting hulls + swept feet crossing determine ground contact, not the top of a trigger. Source launch/push events unchanged. Phase bypass, actual floor/void/lava death remain. Full world geometry is ready before enter; browser regression now tests keeping current geometry during background next preparation and a real loaded/grounded next-map transition.

Generated checkpoint gates/pillars/caps removed. Each earned checkpoint has a flat visible area, normally12x10m, reduced only for standing headroom/walls. Existing support is reused; if the area crosses unsupported local gaps, a.4m solid deck fills just that checkpoint area with a~2.8cm raised top. Checkpoint areas have mint border/soft fill; activated fills gold. Two shared draw calls, no per-checkpoint model/text/animation loop. Grounded swept XZ contact (not3m airborne sphere) records the point. Visiting an earlier point cannot replace the latest respawn. Preparation yields every~3ms and filters headroom to nearby hulls. Raw imported geometry and120Hz/History stay unchanged.

1.38 deliberately adds checkpoint decks; original source counts below exclude those. Native source counts after column removal: Frostline84/Cinder84/Verdant578/Aqueduct630. Additional checkpoint decks: Nux3/Frost2/Treehouse0/Cinder2/Beginner4/Verdant2/Utopia0/Aqueduct3, plus one start deck each. Full rectangular standing-headroom SAT (not only sparse point samples) rejects walls/ceilings across the whole widened area. Source geometry tests explicitly exempt only the newly requested checkpoint decks, not arbitrary source changes. See progress.md for tests and current package status.

## 21 October 2026 — whole maps restored

The user explicitly cancelled level splitting. Catalog expansion, room hull/decor cropping and checkpoint-as-finish logic were removed. Nux, Treehouse3 and Beginner are whole again; Utopia remains continuous. Existing opacity, full collision/render hulls, 8cm landing lip/headroom checks, launch-pad guides, free selection, checkpoint retry and original portal redirects remain. Checkpoints never award a level medal; actual end_zone does.

| Mode/order | Complete course | Theme | Geometry | Target seconds G/S/B |
|---|---|---|---|---|
| Bhop1 | Nux | City | Original source | 60/90/135 |
| Bhop2 | Frostline | Snow | 6 districts, ~495m, 6 checkpoints | 64/88/125 |
| Bhop3 | Treehouse3 | Nature | Original source | 150/210/300 |
| Bhop4 | Cinder Circuit | Lava | 6 districts, ~495m, 6 checkpoints | 72/102/145 |
| Surf1 | Beginner | Water | Original source | 75/110/165 |
| Surf2 | Verdant Flow | Nature | 4 long banked districts, ~735m | 62/90/135 |
| Surf3 | Utopia | Sky | Original source | 180/255/360 |
| Surf4 | Neon Aqueduct | City | 4 banked districts, ~802m, including180-degree sweep | 70/100/150 |

New layouts are original deterministic code-native geometry, not a third-party template or recolored chapter. Frostline uses broad arcs/slalom/ascent/descent; Cinder reverses bend ordering with smaller, tilted landing blocks and alternate ascent placement. Surf routes have different lengths/turn sequences. Each strip uses shared edge coordinates and convex triangular prisms; normal-game biome models and existing platform shaders are reused. No new downloaded bitmap/GLB. Medal targets are provisional design targets, not measured clean-run records.

surf-custom-maps.js generates only during preparation. Same source->convex->merged surfaces lifecycle; two-source CPU LRU and max2owned GPUchunks retained. Explicit native route data supplies path hints, progress, arrows and coin placements without recomputing an all-pairs hop graph. Native leg slices/lengths are cached once, not allocated per frame. surf-stages.js is navigation-only; no section descriptors or finish functions.

Save migration reverses1.36: valid original full-map PBs restored from legacyLevels; layout21 chapter PBs preserved under chapterLevels and never used as whole-map medals. New original maps use layout22. IDs, not numeric positions, own times. Any map remains selectable in lobby, stats and ESC.

QA137 checks all8complete starts/full hulls/source vertices, every native checkpoint, convex halfspaces, explicit route progress and reverse migration.140/140 new Bhop links landed in isolated120Hz physics trials at baseline speed. Browser all8 rendering/pause/selection/retry/stats passed without errors. Not a proof of every full human clean run or medal calibration. See progress.md for final QA/packaging status.

## Historical1.36 notes (splitting below is no longer active)

## 21 October 2026 — chapter/visibility/collision revision

The current catalog has 13 Bhop entries (6 Nux, 7 Treehouse3) and 8 Surf entries (7 Beginner, continuous Utopia). `surf-stages.js` stores source checkpoint names, exact exit trigger IDs, conservative room bounds and explicit medal targets. Treehouse return destinations 4/7/9 are restart aliases, not automatically treated as forward levels. Utopia has no safe authored intermediate start/checkpoint; its continuous course remains intact rather than inventing an untested mid-air start.

All chapters are unlocked. Lobby arrows, clickable Bhop/Surf statistics cards and the normal ESC pause panel can select any chapter. Normal Level/Endless/2D are not changed. Legacy whole-map times are archived in `legacyLevels`; stable chapter `mapId` owns new times, so a 150-second Treehouse PB cannot become a short-stage PB.

Room isolation keeps whole original convex hulls that intersect the active room envelope. Those exact hulls form both visible and collision sets; future teleport rooms do not retain invisible collision. No half-metre shells, vertex repositioning, enlarged jumps or arbitrary platform surgery. Opaque, double-sided, depth-writing materials and rendered collidable tools faces fix missing underside/proxy visibility. Native source visual/death gaps remain gaps, not fake safe floors.

Progress is continuous projection onto the solved local hop polyline or explicit chapter guide, not checkpoint-count steps or elapsed-time simulation. Boundaries use actual portals/end zones/checkpoint positions, not the progress percentage. Physically adjacent chapters carry position/yaw/velocity; source redirect portals retain horizontal speed. Failed return triggers produce visible existing failure feedback instead of silently resetting speed/position; Phase Shift bypasses them.

The step solver accepts only an 8cm descending landing lip (normal grounded steps remain .42m), after strict standing-body headroom SAT. Higher walls, ascending impacts and blocked ceilings still stop movement. Simultaneous SAT contacts prioritize the floor before walls. 120Hz stepping and 35-field/60Hz history schema are unchanged.

The route HUD shows up/down direction as well as metres; real source launch/push volumes receive one merged mint outline/chevron mesh (max12 per active chapter), no collider or dynamic light. Only actual source pad faces are marked. Existing floor arrows/physical exit frames remain bounded. These are advisory hints, not a proof that every authored route is solvable at every entry speed.

Source fetch/convex parsing uses a 2-source CPU LRU; chapter metadata is copied, immutable vertex/plane arrays are reused. GPU ownership and active+next 2-chunk generation/disposal stay independent. No new bitmap/GLB assets are added.

Tests: `output/test-surf-136.cjs`, `output/test-surf-136-transitions.cjs`, `output/test-surf-136-browser.cjs` (desktop+portrait), existing129/132 physics/history/revive/hazard regressions, official skill input/compositor client. QA fixtures test entry/selection/boundaries/render/retry; they do NOT claim clean human completion of every map.

## Historical 1.35 design notes

Research / implementation date: 20 October 2026. Only the separate Bhop/Surf modes are changed. Normal Level, Endless, 2D, source course layouts and collision algorithms are not redesigned.

## Reference and ordering

Primary sources: [Strafes.io](https://strafes.io/), [official public map catalog](https://api.strafes.io/maps), [official editor template metadata](https://api.strafes.io/maps/templates). The public site build inspected was `ff283fa1`. No third-party game source, textures or new map layouts were copied into this update.

| Mode / level | Map | Official tier | Local learning order rationale |
| --- | --- | ---: | --- |
| Bhop1 | Nux | 1 | Shorter, basic staged bhop before advanced elevated routes |
| Bhop2 | Treehouse3 | 3 | Elevated wooden landings, larger vertical changes and more technical stages |
| Surf1 | Beginner | 1 | Staged learning and intermediate restart/checkpoint opportunities |
| Surf2 | Utopia | 1 | Long continuous endurance run with no intermediate authored checkpoint |

The old per-mode sequence was already correct. It is now explicit `progressionRank` ordering in the catalog, with source `tier` shown as T1/T3 in the HUD. Utopia is **not** falsely relabelled Tier2; putting it after Beginner is our endurance/learning judgment within the same official tier. Bhop and Surf are not merged into one campaign.

Save records now carry map identity (`mapName`); `mapOrder` and `selectedMap` preserve time/medal/selection ownership if a catalog is reordered later. Legacy numeric saves migrate using the documented legacy order without wiping player progress.

## Gentler acceleration, retained momentum

The reference site's exposed movement defaults include gravity800, jumpHeight57, friction4, stopSpeed75, accelerate5, maxSpeed260 and airSpeedCap39; Surf air acceleration150, Bhop1000. These are observed configuration values, not a claim of identical player feel or a license to copy the implementation. The site's normal key-driven startup is different from Elemental Run's mandatory continuously held auto-forward drive. A headless UI probe only reached its animated splash; interactive reference movement was not benchmarked. API/configuration inspection succeeded.

The old automatic `RUN_SPEED*5` push reached speed too abruptly. New `PROFILE`:

```text
autoRunResponse = 1.8 / second
mouseAccelerate = 1.4     (old implicit multiplier5)
accelerate = 1.6          (old2.4 in the non-inertial Surf branch)
target baseline = 260 * .029375 = 7.6375m/s
MAX_SPEED = Infinity
```

Below baseline: `v += (RUN_SPEED-v) * (1-exp(-1.8*dt))`. Ground friction damps **excess** momentum rather than fighting startup speed; otherwise a softer auto-drive could never reach baseline. Startup A/D correction amplitude scales with actual forward momentum, avoiding a separate instant sideways speed burst. Collision-reduced velocity remains authoritative; no spawn-age timer or stale velocity restoration is used.

Measured straight, flat startup:

| Time | New speed, m/s |
| ---: | ---: |
| .25s | 2.768 |
| .50s | 4.532 |
| 1.00s | 6.375 |
| 2.00s | 7.429 |

Old .25s measurement was5.979m/s. A two-second airborne mouse-strace fixture starting at10m/s now reaches11.203m/s rather than13.588; matched A/D still helps, opposing input/flicks/stationary view do not generate free speed. Existing jump height/gravity, inertial surf projection, accepted surf-jump speed cost, no maximum speed and the35field60Hz History format stay intact. Simulation remains120Hz.

## Physical signs, not straight lines through rooms

`surf-course-polish.js` handles bounded advisory navigation:

- Every stage has a departure arrow fitted to a real supporting surface, oriented by its authored spawn/checkpoint yaw.
- Bhop graph nodes are real non-hazard landing tops. Candidate links use actual height/spacing, a parabolic jump at design speed1.65×baseline, and10swept-body clearance segments against the logical hulls. This is a route hint at momentum, not proof of a standing jump or a substitute controller.
- Conservative graph search found two Nux stage routes and one Treehouse route. These create turn/landing arrows; the HUD follows the next connected segment when close to a solved route. Other stages keep authored departure/real objective signs, rather than fabricating a trail through a wall.
- Surf uses nearby actual ramp hints. Arrow orientation is projected onto the true ramp normal, so it does not remain a horizontal plane floating through a banked ramp. It is a local approach cue, not a full Utopia completion path.
- Loaded marker counts: Nux44, Treehouse17, Beginner7, Utopia1, plus the local Surf marker when applicable. Only the active stage and nearby signs are drawn: at most4mobile/8desktop in one InstancedMesh; depth testing stays on.
- Matrix updates run at8Hz or on a stage/large-position change. Rewind derives visibility from restored position/stage; signs have no collectible/progression state.
- Planning yields between small work batches and caches CPU-only marker data by map. It keeps no mesh/material/texture references. Retries reuse the prepared course; no new planning is needed for a normal fast retry.

There is deliberately no claim that a complete verified navmesh exists for all rooms or that every layout was completed by a human. Further authored waypoints can be added where conservative graph search cannot prove a route.

## Visual/detail pass

- Real wall-mounted frames, vent slats and small light strips:8mobile/24desktop maximum fixtures, two shared InstancedMeshes. Candidates are fitted to actual vertical faces, distributed across eligible stage anchors; no floating AABB-corner props.
- Fixture centres are approximately4.4m above the nearest anchor, with a thin cosmetic projection from the wall. Low mounts that could enter normal jump headroom are rejected. No extra collision, platform, lethal surface or dynamic light is added. Nature uses timber-colored, rougher frames; other biomes use their existing architecture palette/metal response.
- City hemisphere light changes.48→.66, ambient.28→.38 within Surf mode only, improving dark-wall readability without removing the night atmosphere or neon contrast.
- Existing complete source architecture, triplanar world texture mapping, safe/surf/danger material semantics, model factories and ownership/disposal remain in place. No new downloaded GLB/bitmap payload.

## QA

`output/test-surf-135.cjs`: startup curve, identity-safe save migration/reorder, official tier/order metadata, sign surface attachment, route/hint bounds/cache and source geometry invariance.

`output/test-surf-135-browser.cjs` / `--mobile`: four-map spawn/stage renders, signs/fixtures budget, actual WebGL compile, retry button lifecycle and screenshot inspection. Existing129tuning assertion is updated to the intentionally slower10.5–12m/s range; its motion/flick/FPS/history/uncapped sweep guards remain.

Normal host/mode scope and source course JSON hashes must match the previous package. Real-device FPS and complete-room human playtests are still recommended; no zero-drop guarantee is made.
