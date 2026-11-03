# Elemental Run — Party Run FPS Solo / 1.67.0

## 1.67 — reward balance and shared music

Qualified finish only: floor(activeSeconds*.35) +10 first completion, or +5
for a new PB; max60gold. No level-number payout multiplier. At60seconds this
is31first/21repeat/26PB. Existing attempt receipt idempotency remains; host
validation cap now60. Main3D music shared with other3D modes;2D unchanged.
No course/hazard/physics changes. The lobby guides only to Games, never Party;
unplayed Party portal/columns pulse until a real entry marks it visited.

## 1.65 — demand-only covered preparation

Supersedes1.64's all-mode background queue: Party only prepares when its portal
is committed, under the opaque shared preparation cover. Interactive hall
exploration never builds Party. Existing selected-scene cache/reset remains.
No Party course/art/physics/health/rewards changes. Lobby rendering optimization
was reverted in1.65.1 on user request: full buffer and original desktop MSAA/mobile
FXAA restored. Mode renderer is unchanged.

## 1.64 — prepared scene reuse

Games hall now starts the shared single-owner preparation queue. Party keeps only
the selected round's prepared scene on exit (not all rounds). Re-entry calls the
existing restart path to reset race, moving poses, coins, boost/VFX, clock and runId
before resume, while reusing GPU resources. Selecting another round/invalidating
preparation still disposes the old scene. `ObbyInterface.hide` only closes the
global pause panel when Party owns it, so background prep cannot close Surf/menu
UI. No changes to course placement, difficulty, physics or rewards.

## Authoritative1.63 — gap infill / quick hall / safe return / compact textures

- Existing giant source placement is unchanged. Add medium/small instanced infill
  outside the platform footprint and at least2m from all source/infill reserved
  circles.18–66additional details per inspected map, one draw. No new colliders.
  Source courseVersion14, round sequence1, physics, art collisions, ground and
  permanent arena floor semantics unchanged. No PB invalidation.
- Games entry no longer awaits normal-run Nature/vehicle/gameplay preparation.
  Only room architecture compile/upload is critical. Normal level/endless portals
  still await all their preparation.32px temporary target is disposed immediately.
-2D portal opposite Coming Soon, right X14/Z−22. Shared prefab and7portals remain.
  Unplayed flag also drives full membrane brightness and luminous rim; actual
  start persists visit. Same no-glow rule for Coming Soon and return portal.
- Cube rounded geometry uses same1.7x2x1.7dimensions and controller AABB. Cheap
  dt-independent breath/walk/air/landing/turn animation, no physics changes.
  Stats stand/labels/trigger rotate together toward plaza centre.
- Before run handoff remember area/XY (XZ), camera and avatar heading. Main menu
  return restores Games/plaza and last place, with3.3m portal clearance and.8s
  retrigger guard. Active-lobby menu keeps its current place too. No reload save.
- Same-resolution color/emissive WebP94/98 only, normals/PBR and byte-exact
  compressed geometry retained;12GLB36.06→20.79MB. Music MP3VBRq4, exact durations.
  Output tools/backups excluded. Poki-only external country lookup/debug cheats
  disabled. Official163 desktop/mobile9scenes,12GLBdecode,MP3metadata,SDK/no
  external requests,return/pose/clearance pass; normal tutorial entry smoke passes.
- Do not claim publication rights/approval: source course README still says
  commercial redistribution permission unverified. See POKI_RELEASE_CHECKLIST.md.

## Authoritative1.62 — playlist progression / horizon silhouettes / Games entry

- Raw course(id) remains unchanged (courseVersion14). The active run uses round(level),
  with sourceLevel and fixed order [1,6,2,3,9,4,8,5,7]. Never shuffle on each boot.
  sequenceVersion1 converts PB keys into playlist positions exactly once. Completed
  flags and the first incomplete position determine unlocked; old free selection
  or saved.level alone is not proof of a win. Old valid PBs are retained.
- No ESC/HUD round selector. Party and Surf portal pillars have arrows; only
  already unlocked positions are selectable. next() requires a qualified finish.
  Selected completed rounds have one actual extruded gold star, excluded from
  static architecture merging so its visibility can change. Selection() is cheap
  metadata: MUST NOT generate a course while the lobby refreshes.
- Surf previously returned maxLevels as its unlocked count, incorrectly showing
  a completed star on a fresh save. Its selectedLevel/selectLevel/changeLevel now
  honor unlockedLevel(), the first absent valid completion in saved.levels.
  Portal completed is explicit. This does not change Surf physics/course logic.
- Source scenery circle packing remains. Far Cyber silhouettes use one instanced
  box/window shader batch; Ocean adds two low-poly atoll batches, varied island
  transforms and a separate haze color. Water ground material unchanged. Source
  compound pieces retain identical centered transforms; new far instances shift
  outward to clear source bounds. Trees receive one small canopy-detail batch.
- Hall: level/endless opposite at entry, Surf/Party opposite in middle, 2D at far
  end, inert grey Coming Soon on far left, physical return portal behind spawn.
  Unplayed glow uses elemental-mode-visits-v1 and is set only after actual start.
  Stats stand is beside upgrades. Hall gets cloned themed floor maps and merged
  immutable beams/fins; no new lights, GLBs, physics engine or purchases.
- Startup defers Nature/campaign/gameplay warming until first Games entry. Main
  lobby resources are still warmed before PLAY, textures uploaded in groups of4.
  Games prep is shared/idempotent, small localized spinner layer, compileAsync
  and64px offscreen geometry upload. No simulation/SDK timing inflation.
- CPU162 preserves CPU161 geometry/physics regressions and adds playlist/PB/gate
  checks. Official Playwright162 desktop/mobile exercises portal layout, grey
  coming soon, physical return, unlock/reward idempotency,9 rendered scenes,
  source footprint clearance and shader/page errors. QA catalogue bypass is only
  in output test code; it is not a shipped level selector. Tests do not prove
  all-phase human passability or actual phone60FPS. Source/ZIP stay same folder.

## Authoritative1.61 — footprint packing / material restoration / portal polish

- Large scenery size is retained, NOT blindly reverted. Source combined Box3
  center is removed after Y rotation before positioning. All parts share one
  per-variant placement list. planDecor reserves circumscribed circles at maximum
  instance scale1.05,2m clearance across variants, size-aware longitudinal spacing,
  near/secondary bands and far landmark reservation. Heavy mountains use budget
  without forced minimum6copies; no per-frame repacking/moving on approach.
- Snow repeated source gradient created square seams, while map and PBR repeats
  disagreed. Party-only periodic256² RGBA frost DataTexture/mipmaps replaces that
  gradient; conflicting normal/roughness maps removed. Snow platform quilt-square
  term disabled, phase-aware program cache keys prevent cross-biome reuse bugs.
- Lava original source map image,color,emissive,emissiveIntensity,roughness and
  metalness retained. Remove new orange crust recoloring/emissive fissure overlay;
  only geometric waves and analytic normals remain. Ocean code/appearance intact.
- Frostworks front7lanes atX−9,−6,−3,0,3,6,9. Removed duplicate4supplemental lanes,
  tightened conservative ball envelope to radius+.35;2.7m cannon hoods fit3m gaps.
  No physical sphere overlap.42total hazards. Piston tip z-fight: gold/front dark
  pads formerly shared outward plane1.225m; now foam1.20,gold1.28,dark1.315m,
  studs1.335m centers. All remain one rigid animated head/merged assemblies.
- Speed gates keep actual2s boost; edge SVG streams +smoothed FOV3°mobile/5°desktop.
  No center text or new UI theme. Pause/selector/retry hide/reset effect, reduced
  motion disables line animation. Normal active-time clock/physics unchanged.
- Tidal6 easier: remove7overlaid optional branch platforms, rebuild all IDs,
  checkpoint.platform and route references;49primary drums,68total surfaces.
  X±2.6/±3.1/2.9m, radius up to4.3, sway capped.45m. CP gaps.65m, no disc overlaps
  across180 sampled motion phases. Same pad strengths, chase7.1→6.6. Straight
  opening W+Space now deliberately survives10s; old hard-mode fall assertion
  superseded, not a regression. Full746m race remains, not certified autopass.
- Course14 invalidates changed race/hunt PBs, preserves8 and7 only from13.
- Lobby: remove4retired wall halos. mode-concourse placePortal helper uses EXACT
  Games prefab; remove forward membrane overrides. Five modes+sixthplaza return,
  transformed solids correct for90°AND180°, backing/tunnel/labels align. Return
  invokes setArea without loading a game; label uses existing localized surfLobby.
  SpawnZ8 keeps follow camera ahead of return sign; FrontSide titles prevent
  mirrored back text, hall-only Raycaster boom shortening prevents arch clipping.
  Flappy stays main plaza. Main host/audio/3D/Surf/2D untouched.
- QA161: six graph/finish/pad/9machine-reservation regressions plus7front balls,
  easier opening,180drum-pair phases,9round large scenery circle packing, permanent
  floor, restart/expanded arm contacts. Browser9rounds validates source lava values,
  seamless snow map, actual instance reservations, speed effect gate/pause/retry,
  native UI/touch/audio/wallet/disposal/no shader errors. Dedicated hub official
  wrapper tests retired halos,6shared portal layouts, return invocation, reentry,
  spawn/camera and screenshots. No all-timing playthrough/real-deviceFPS guarantee.

## Authoritative1.60 — relief biomes / themed surge / permanent survival

- Latest user: much larger scenery, depth in water/lava/etc, no regrowth in
  Orbit Survival7, intersecting yellow platform trims, thicker rotating arms,
  biome-matched pursuit shape/color. Scope only Party, shared host untouched.
- Scenery heights ~1.6x: city52/64/46/72m, water30/22/40/62m,
  others40/36/24/70m; max lateral size66m. Same instance counts/triangle budgets,
  radius-aware positions remain outside playable area, compound source preserved.
- New isolated party-environment.js before obby-run.js. Ground factory uses
  opaque standard material with vertex height + analytic gradient normal;
  ocean animated1.8m amplitude profile, lava1.4m, snow/forest drifts, sky clouds,
  cyber low terraces. Fragment foam/current/crust/emissive fissure detail.
  Six profiles, lazy per-round compileAsync lifecycle unchanged. No transparency,
  second coplanar sheet or gameplay floor collider. Base is a7m-thick body centered
  atY−11, below worst wave trough; top at−2. Width900m, arena depth900m, race
  depth+650; edges beyond full fog. Desktop18,193/mobile7,081 vertices, only time
  uniform per frame. Pause holds worldTime, no per-frame geometry allocation.
- Pursuit factory uses same400m full-width opaque front and unchanged race time,
  but phase-specific crest geometry, colors and fragment behavior: circuit-grid
  magenta/cyan, green leaf/vine storm, pale billowing clouds, dark molten fissures,
  turquoise foamy ocean, angular pale ice facets. No change to chase speed/kill
  scalarZ/retry/countdown. Shader/geometry owned/disposed with current scene.
- Survival7:73 permanent tiles,1.15s contact collapse, NEVER regrow in an attempt.
  Rewind not added. Restart resets touchAt explicitly.45s objective/two rotating
  arms remain. Old1.57 circle controller depended on regrowth and is NOT evidence
  of a45s completion now. Exploratory nearest-tile QA best19s; do not present that
  obsolete/autopilot route as a full balance proof. Human timing validation remains.
- Sweeper radii .46 regular, .39/.45 survival low/high, .4hunt; rotor blade half
  thickness .5. Render cylinder/rings and endcaps use h.thickness. Sweeper Y
  collision previously fixed±.35, now uses actual radius in both axes. Existing
  full-motion clearance envelopes also use thickness. Core swept movement intact.
- Static trim rebuilt from the complete cap polygon union. Segment clipping
  removes portions buried inside other same-height shapes; stable owner resolves
  coincident boundaries. Single flat opaque-colored ribbon batch (.15m wide,
  Y+.047), depth-tested/polygon-offset; no lit tube fighting a duplicate tube.
  Old per-box shellRails disabled; static disc torus disabled, outside outline
  replaces it. Dynamic/embedded pad indicator rings intentionally remain.
- Course13: archive changed7/race/hunt times, preserve collapse8 from prior6–12.
  No user wallet changes. CPU160 retains159regressions and tests permanent floor
  after1.2/8.6/20/1000s + fresh-attempt reset, enlarged arm inside/outside contact.
  Official160 wrapper validates buried-outline absence, opaque relief mesh budget,
  all six themed fronts, no double cap coverage, permanent7 after1000s, native
  pause/retry/touch/audio/wallet/disposal and shader errors; captures ground5/6,
  surge1–6, enlarged scenes and machinery closeups. No real-device FPS guarantee.

## Authoritative1.59 — overlap audit / continuous caps / art direction

Latest user: intermittent machine interpenetration, empty surrounds, flat/poor
ground/model graphics; explicitly remove the white wall obstacle.

- White static slalom walls removed from generator, renderer and collision data.
  No invisible baffles left. Course12 archives changed races/hunt PBs, keeps7/8
  from eligible prior versions. Other modes, audio, wallet and UI source unchanged.
- Deterministic authoring-time machineEnvelope/separateMachines reserves full
  rotating/sweeping/stroking travel, including frame widths; no per-frame hiding
  of intersections. Searches same-height fixed floor within36m in2m steps,
  avoids7m CP centers, retains host and timing. Infeasible extra machines removed,
  not compressed into their neighbor. Race counts41/38/9/37/37/7, hunt15. Broad
  reservation is conservative, not a general-purpose physical mesh solver.
- Supports: pendulum/log frame feet outside host width; full-height grounded
  gantries. Punch housing, roller legs, sweeper pedestal, bumper rail clear the
  walk surface. No breathing scale on bumper (collider/render mismatch removed).
  Rotors raised .42m to clear ring below the floor. Fan top/rim layered lower at
  shared hub/catch joins; collision deck stays unchanged, no risky swept rewrite.
- buildContinuousCaps convex polygon subtraction unifies static circles AND
  rectangles. Only one opaque top triangle covers an overlapping area. Existing
  safe collision overlaps retained, static rectangular shell side union retained.
  Fully embedded pads render a thin raised inlay, not a second complete body.
- Rounded model meshes now explicit nonuniform edge loops at a fixed physical
  bevel width; old scaled/uniform cube samples made long pieces look flat.
  Hero pads/cushions use extra loops; small repeated instances retain108triangles
  rather than300. Spheres24x16/cylinders20, static/rigid merge still active.
- World-space satin quilt panel seams, anti-aliased grain, derivative normal
  relief on floors; no new downloaded bitmaps or per-frame geometry. Softer foam
  side/padded border contrast. Radial contact shadows use one64px texture and
  one instanced batch, projected only when an actual platform is below a machine.
  Hemisphere1.15 + key2.35 + cool fill.65 replaces washed-out2.1 hemisphere.
- Main-game scenery previously10m tall BELOW a13m track: empty sky at eye height.
  Now principal trees22–24m, buildings28–42m, landmarks role/biome sized. More
  cheap vegetation/building cells, less repeated lighthouse/huge mountain content.
  Static world transforms, compound parts remain together; same GPU buffers and
  full-fog cell culling. Source meshes are not proprietary Fall Guys assets.
  Ground repeat set from physical width/depth, anisotropy capped8/hardware max.
- QA: CPU159 passes all9 full-travel envelope pairs,360 pose samples, no baffles,
  support frame clearance, preserved finish/Space-pad/wind/impact/chase/survival/
  collapse/hunt/retry tests and six route graphs. Official Playwright159 wrapper
  captures9FPS rounds, machine closeups, sky fans, welded caps and timer; samples
  cap triangle interior coverage (no double coplanar draw), plus existing touch,
  pause/reward/audio/disposal integration. No claim of every human timing route
  or guaranteed hardware FPS. Historical1.58 scene counts/visuals superseded here.

## Authoritative 1.58 — readable timing gauntlets / island hunt / soft pads

Supersedes historical rail coverage and Spirit Hunt9 below. Current user requested
start-only rails, fixed finish/pad priority, harder authored placement, larger hunt,
denser scenery, soft Fall Guys-inspired platforms and quiet Surf MP3.

- Course11. Archive changed race/hunt PBs, preserve8, preserve7 only from course10.
  Wallet unchanged. Rails only static start segments intersecting Z[-12,5].
- Finish/checkpoint detection uses ordered swept forward plane crossings, width
  from the actual approach deck, interpolated height up to25m above the marker.
  No grounded requirement; pad/jump/dive finishes qualify. No distant arbitrary
  teleport qualification. All six race finish planes tested at0/5/12m height.
- Grounded pad contact precedes buffered Space. Shared launch consumes the jump
  buffer, sets bounceLock, resets dive; held Space no longer steals pad launch.
- Alternating3.5..2.9m slalom openings in2.6m padded walls, solid swept AABBs,
 12/8/0/12/12/4 pieces across six races. Avoid CPs and moving-hazard envelopes.
 Shutters span track width; pistons stroke across usable lanes; swing logs fit
 platform envelope. Threat lead receives authored waiting budget, no rubberband.
- Tidal6 pads shift left/right, radii3.65..3.95; direct W+Space fails instead of
  auto-completing. Existing bounce strengths retained. All CP route graphs connect.
- Hazard floor mounting is corrected before animation; lifts/movers own hazard
  anchor offsets. Render assemblies and collider positions share the same pose.
  Pendulum lowest sphere, roller and punch head stay above host across80 samples.
  Conveyor flow is swept displacement, not direct X/Z addition (a test exposed
  direct belt movement pushing through new walls; fixed rather than bypassed).
- Hunt9: six islands+hub, thin segmented ring/spokes, genuine gaps, six raised
  decks with small supporting pillars and pads.36 spirits,28 target,120s; fall
  keeps collections, respawns hub, costs6s.15 hazards: six sweepers, six poppers,
  three timing shutters. 106 platforms, boundsX62/Z[-104,38]. All platform/upper
  routes connected in ballistic graph; this is not a full120s timing playthrough.
- Softer mat foam shell, reduced tread contrast, continuous cream padding;
  machines retain readable dark mechanisms. Static details merged, disc/fan/pad
  instancing retained. No external art dependency/download or new UI theme.
- Real main-game biome GLBs decorate all sides of arenas and race sidelines.
  Source compound transforms preserved. Four-row instanced cells; only full-fog
  distant cells culled, fixed world placement (no approach-dependent rearranging).
  Desktop230k/mobile150k per-variant triangle budget limits heavy landmarks;
  shared geometry/materials and per-cell matrices, no per-frame allocations.
- Quiet user-supplied Coastal Chiptune is Surf/Bhop only, lazy HTMLAudio loop,
  volume .17*master*music (~.0934 default), pause/hidden/ad/mute/exit lifecycle.
  Surf physics/maps untouched. Shared jump-pad synth now smooth sine235→470→360Hz,
  .26s envelope, .09s debounce and8voice cap, existing SFX/master bus.
- Research informed timing/surface variety and flow, not copied proprietary maps:
  [Stumble physics](https://stumbleguys.helpshift.com/hc/en/4-stumble-guys/faq/221-how-do-game-physics-work/),
  [official map catalog](https://stumbleguys.helpshift.com/hc/en/4-stumble-guys/faq/103-what-are-the-available-maps/?han=1),
  [Fall Force](https://www.fallguys.com/news/fall-guys-fall-force-update),
  [Fall Forever](https://www.fallguys.com/news/fall-forever-update?lang=en-US).
- QA: output/party-158-test.cjs retains wave/impact/survival/collapse/determinism
  regressions and tests finish/pad/rails, six route graphs, solid openings, motion
  clearance, Tidal fall risk, hunt penalty/timeout/pickup/goal/retry. Official client
  wrapper output/run-party-158-official.mjs tests9scenes, jump finish, audio waveform,
  actual quiet MP3 playback/pause/exit, touch controls, wallet, retry and disposal.
  No claim of all-phase mathematical solvability, all nine full manual completions
  or guaranteed60FPS on every phone. No production auto-pilot or QA files shipped.

Historical1.57 and earlier sections below are superseded by1.58.

## Authoritative 1.57 — guarded straight decks, third acts, hybrid survival

Latest user: guardrails on flat platform edges, more obstacle forms and longer
rounds, crumbling floor in Orbit Survival. Party-only; unchanged native UI/controls.

- Course10, nine rounds. Archive race and changed round7 PBs; preserve8/9 PBs from
  versions6–9. Saved wallets and the other game modes are untouched.
- Side guardrails cover exposed left/right edges of static rectangular decks,
  conveyors, lifts and movers, including catches and shortcuts. Subtract static coplanar neighbor spans,
  including disc intersections, to avoid internal blockers. No end rails across
  forward/back exits; drums, fans and crumbling tiles remain unrailed.
  Height1.12m,thickness.18m; physical continuous swept AABBs, not decoration only.
  Low enough to jump over. Owner consumption disables colliders, retry restores.
  Three instanced render batches (top/mid/post+feet) using12-triangle unit boxes,
  no per-frame geometry rebuild. Only moving rows refresh matrices; collider,
  rail-top support/carry and render follow the same owner. Resting rail-top probe
  prevents grounded flicker. Counts122/140/44/154/150/38 (0/10/8/0/32/0 moving).
  Shared static seams are not double-lined.
- New third acts add202/218/196/228/220/196m. Final depths648/694/614/714/718/746m,
  36–48% longer than1.56. Distinct slaloms, stair crossings, log galleries, fan
  transfers, drum chains and timing fields. Every new lane inherits prior finish
  height (especially raised Snow/Water). Six extended ballistic surface graphs
  pass. Sky final catch length16 fixes an excessive jump gap found in testing.
  Threat cruise unchanged; starts gain only19.6–22.8m to budget extra timing,
  capped25m. No player-relative rubberband or loading/black-screen transitions.
- Three new original obstacle forms:
  swingLog: twin cable suspended wide horizontal padded cylinder, pure-time
  pendulum translation, separate non-rotating head and instanced cables; circular
  YZ collision cross-section. Tall frames anchor down to the biome floor.
  shutter: vertically raised slatted gate with readable lamp/opening,3.5m panel,
  4m lift; visible position/currentY also drive the damage test.
  popper: warning hydraulic impact disk, .65s warning/.4s strike,1.8m rise,
  vertical launch8.5m/s on impact. Telegraph itself never deals damage.
  Counts41/44/9/40/37/7 hazards in six races. No new words/localization/assets.
- Orbit Survival7 replaces the single solid50m disc with73 independent4.38m
  square tiles arranged inside the same circular footprint. BOTH rotating arms
  and45s goal remain. First contact starts1.15s cracking, then collider is disabled;
  tile sinks and disappears. Regrowth only8.5s after touch, last.8s visible repair
  from4m below, collision only when fully returned. No hidden base platform.
  Original collapse8 remains permanent, unchanged. Fresh restart clears every
  tile state. Shared instanced dark crack marks on both crumble arenas.
- CPU output/party-157-test.cjs: actual45.008s no-hit hybrid survival via movement
  and timed jumping, actual8/9 completion,6 connected extended graphs, CP safety,
  3 new colliders, side blocking/open exits/jump-over, rail ownership/reset,
  tile crack/disappearance/repair/reset; retained wind/recoil/chase/determinism.
  output/party-157-circle-test.cjs is QA only, no shipped controller.
  Geometric connectivity is not proof of all race timing combinations; the old
 155 autopilot is not current full-race qualification evidence.
- Required official Playwright wrapper: output/run-party-157-official.mjs,
 9 scenes + new family closeups, actual rendered side contact, arena crack/hole,
 retry, PB migration8/9, touch-look/jump separation, wave/fans/audio/wallet/disposal.
 No real-device60FPS guarantee or public upload claim.

Historical1.56 and earlier sections below are superseded by1.57.

## Authoritative 1.56 — elevated gauntlets, real wind and visible pursuit

Party-only scope; normal run, Surf/Bhop,2D,lobby,SDK/wallet untouched.

- Course version9: preserve arena7–9 PBs from course6/7/8, archive invalidated
  race PBs. Nine rounds, native menu/HUD and no-auto-run controls remain.
- All six race solids, hazards and checkpoint heights raised coherently10m;
  start13m, fall plane9m. Decorative biome floor at−2m is never a collider.
  No blanket width multiplier: original narrow links/gaps survive; catches18m.
- Pursuit starts90–120m behind, not140–270m. It visibly travels throughout
  reveal AND321 (old countdown froze it). Fixed world-space speed, no rubberband:
  cruise7.2/7/5.6/8.4/7/7.4m/s,20s ramp from78%,.25s grace. This closer threat
  reaches the course much earlier; speeds budget the actual platform routes.
  Wave scale fixed1.2 instead of being inflated proportionally to start distance.
  Erased moving hazards remain consumed and cannot bounce back through the wave.
- General impact13.5m/s, hammer16m/s; lift5.5m/s (flipper8.5),stun.9s,
  damping.65/s,grace1.25s,recovery2.2s. Measured8.40m displacement over.8s
  with held forward/jump/dive. Combo/boost loss and recoil remain native.
- Wind blower: removed opaque front cylinder cap that hid animated blades.
  Open intake/grille, deterministic changing rotor angle and11m flow trails.
  Gust never silently zeroes for half a cycle. Separate drag-limited windV is
  integrated THROUGH the swept displacement (not unswept teleport), so input
  braking no longer cancels the effect; decay after leaving and on fresh player.
- Five additional live families: rotating mallet hammer, moving cylindrical
  bumper, striped jump roller, timed flipper with.65s warning/.24s strike, and
  sliding gate (previously unused). Local meshes/colliders share worldTime.
  Roller uses circular YZ cross-section, bumper a vertical cylinder rather than
  sphere, mallet a local-axis cylinder envelope. Flipper hinge is at the rear edge and raises toward the player. Rigid components
  still merge per material; animated groups stay excluded from static baking.
- Snow's original3 ball lanes now have4 staggered interleaved lanes, plus2 extra
  late balls. Total race hazard counts32/35/7/30/28/5. Do not put moving damaging
  centers directly on checkpoint spawn positions; all checkpoints checked at
  five worldTime samples. No new UI text, downloads or third-party models.
- Research: official Fall Force update (fans, barriers, speed arches, punchers):
  https://www.fallguys.com/news/fall-guys-fall-force-update?lang=en-US
  Official Big Fans announcement (rotating surfaces, checkpoints, narrow links):
  https://store.steampowered.com/news/posts/?appids=1097150&enddate=1626800939&feed=steam_community_announcements
- QA: output/party-156-test.cjs validates all6 ballistic surface graphs, real edge
  falls, wave movement/reveal/countdown/catch/reset, strong knockback, wind/decay,
  every new hazard collider, non-damaging telegraph and a timed normal roller jump;
  existing arena success/failure/reward/determinism regressions retained.
  output/run-party-156-official.mjs wraps the required official Playwright client,
  verifies9 scenes, actual rendered wave position, fan instance matrix movement,
  visible wind rotation, edge falls, real HUD, audio, touch isolation and disposal.
  Old155 autopilot does not solve the new hazards; do NOT report its route timings
  as current balance/qualification evidence. Graph validation is geometric, not
  proof that every timing combination can be passed. No universal60FPS claim.

Historical sections below are superseded by1.56 above.

## Authoritative 1.55 — impact punishment, welded kit and anchored VFX

Latest request: left dark-edge gap, faster tsunami, hits must punish, platforms
intersect, independently improve every obstacle/platform model. Party-only scope.

- Edge SVG root no longer translates/scales. Mirrored child silhouettes scale from
  the fixed outer edges;2px seals guarantee both edges. Root rectangle and left child
  stay at viewportX0 through heartbeat animation; breathing/width pulse retained.
- Unified hazard impact biases impulse against incoming momentum (not forward boost
  when the beam hits from behind).5.8m/s knockback,3.2m/s lift,.78s input lock,.9s
  visible stagger,2s recovery slow,.95s rehit grace. Jump/dive held cannot cancel it;
  buffer/coyote, boost, dive and bhop bonus are cleared. Small eye/hand dip and pitch
  recoil,800ms native damage tint, never camera roll. Retry cancels damage animations.
- Tide speeds8.3/8.8/7.9/10.3/8.9/9.8m/s, ~26% above1.54. Ramp8s from88%,.75s grace.
  Fixed authored leads270/220/140/200/240/245m budget longer paths and stronger penalties.
  Lead is not rubberbanding or player-relative teleport. Bigger physically scaled wave
  and floor reach preserve the initial reveal. Parkour depth unchanged418–550m.
- Static platform render is a3D Boolean-style rectangular-prism union, all six faces
  on base/rim/cap, not only a top overlay. Covered/duplicate/internal faces eliminated
  across neighboring parts and material layers. Exposed-only side rail/inset panels,
  owner-aware bolts/markers, stronger seamless grip/panel/wear shading. All opaque.
  Original overlapping swept collision boxes and2mm support remain for safe seams.
- Fan assemblies:4.6m-radius hubs, paired lanes spaced17m, blade circumscribed radii
  below half closest-center distance. Annular curved inner profile4.625m fits hub rather
  than burying rectangular boxes inside it. Equal sizes share instanced geometry.
  Round hubs/rotating sides no longer intersect. Two optional drums moved out of catches.
- Individually modeled hardware: rotor guards/bolts/blade padding/inlays; sweeper foam
  collars/motor; ball panel seams/plugs/cannon frame; pendulum links/bands/supports;
  piston face pads/bolts/shaft seals/vents; fan grille/radial blades; reinforced boost
  arch/feet; hurdle ribs/feet. Legacy gate/pulse fixtures also receive fasteners.
  Drum concentric grip rings, hydraulic lift seals, exposed platform edge panels.
  Rigid details merged per material, repeated bodies/rings/springs/blades instanced.
- Course version8 archives changed race PBs; unchanged7–9 arenas retain PBs/selection
  from catalog6or7. Main wallet/other modes untouched. No new asset downloads/modules.
- QA: output/party-155-test.cjs covers actual no-glove six-race runs with tide+punishment,
  all3arenas, input-lock/recovery, boost/combo loss, deterministic state and fan bounding
  circles. CPU pilot times~72–87s with0–2falls; pilot now walks to fan edges and times
  jumps instead of blind held-hop, never shipped AI. output/run-party-155-official.mjs
  captures every active model family, verifies cap ownership/no overlap, anchored edge
  animation, actual impact under held input, audio/mute/pause,9rounds/reward and disposal.
  Desktop/mobile outcomes and device limits in progress.md. Older sections historical.

## Authoritative 1.54 — longer races, tsunami and threat feedback

Latest user: races too short/easy; much faster tsunami; show it behind the player,
turn to face the course then3-2-1; animate screen-edge tendrils with fast heartbeats.
Normal Level/Endless/Surf/2D and lobby stay unchanged. Same existing source folder/ZIP.

- Course version7. Six race depths now446/476/418/486/498/550m, formerly
  202/244/222/253/211/267m. Each has an authored second act: chicanes, hurdle rhythm,
  moving catches, ball/punch stairs, boost gauntlets, pendulum halls, extended drum
  sequences. Original finish becomes a checkpoint, one final arch at the actual end.
  No global distance stretch or unreachable scaled jumps. New drums20.5m/s at11m
  intervals; original18m/s drums, basic9.5jump and24gravity unchanged.
- Deterministic fixed wave cruise by race6.6/7/6.3/8.2/7.1/7.8m/s (old3.2).
  Fixed initial leads72/72/100/72/76/80m reflect course pacing, not player position.
  Wait2s afterGO, ramp from76% cruise to full over16s. No rubberband or auto-run.
  Existing erase cutoff, lethal catch and consumed-checkpoint behavior retained.
- Race intro2.8s: face backward1.35s, smooth yaw180->0 over1.45s, then3s countdown.
  Wave visibly advances20m during reveal. Player physics/control and active clock
  start only atGO; mouse/touch-look locked during reveal/countdown. Pause freezes all.
- One opaque sculpted400m-wide/38m-high wave mesh (96x24), rolling belly/lip and
  time-based shader foam/flow. Extra backdrop-floor reach prevents floating base.
  No new textures, image assets, physics engine or external audio samples.
- Proximity range42m drives SVG sway/scale + double-pulse dark vignette, BPM92–200.
  First-person hands and ordinary HUD retained. Heartbeat uses two short sine thuds
  via existing audio-system.js SFX/master gain. Finite strength, max bounded voices,
  .26s minimum scheduling; no new context or interval. Stop fades once on pause/retry/
  exit, ads/hidden/focus-loss/mute/zero volume; onended disconnects every voice.
- `ElementalAudio.playPartyHeartbeat/stopPartyHeartbeat`, host callbacks only for
  Party. Shared ordinary sounds/mix unchanged apart from stopping this new voice set.
  snapshot reports beat/voice counts. No sound is synthesized during prewarm.
- Dynamic hazard groups beyond240m(+radius), past full210m fog, skip draw calls.
  Static architecture stays merged and collision stays active; no popping in view.
  Tile/fan batching and per-round dispose/retry reuse retained.
- Race PBs archived because route length changed; unchanged arena7–9 PBs and selected
  arena survive the6->7 migration. Wallet never reset. Survival/collapse/hunt rules
  unchanged from1.53. No new meta-progression or reward multiplier.
- QA: output/party-154-test.cjs actual-input six long races qualify71.8–86.5s,
  no gloves,0–6falls depending route. End gap~29–52m. All3arenas and original obstacle
  regressions pass. Intro lock/321/clock, deterministic repeated inputs, length/speed
  bounds tested. Browser output/run-party-154-official.mjs covers reveal/turn/countdown,
  nonzero SFX waveform, mute/block/pause, retry/selection,9scenes, wallet and disposal.
  Final outcomes/known device limits recorded in progress.md. Older sections historical.

## Authoritative 1.53 update — round catalog, pursuit and obstacle audit

Only the internal obby/Party FPS mode changed. No bots, multiplayer, external physics,
3D-run/Surf/2D merging or meta-progression. Course version6 archives incompatible old
PBs; wallet is untouched. Existing source folder and existing ZIP stay the same.

- Nine selectable rounds (`ROUND_COUNT`): six broadened race courses; round7 rotating
  beam survival45s; round8 permanent collapsing tiles across3layers50s; round9 hunt12
  spirits within75s. Selector also lives in native ESC menu while paused, then returns
  to HUD. All tours use normal FPS hands and the real normal pause/result panels.
- Normal inputs remain camera-relative WASD, holdSpace/ScrollDown bhop, E/Shift dive.
  No automatic movement. Arena R restarts the whole attempt; race R recovers current
  checkpoint only if not consumed. Initial countdown3s, original120Hz slab/skin retained.
- Obstacle audit: ball route span now absolute + signed direction, preventing invalid
  negative modulo behavior. Rotor narrowphase now blade OBB versus full player AABB
  in gate plane, including hub, exactly matching art. Long sweepers no longer silently
  miss outside hardcoded9m center range. Wind height follows its own origin. Hits clear
  bhop bonus. Race decks/checkpoints/fan hubs and blades widened, gaps unchanged.
- Pursuit is race-only, not a forced forward velocity: starts30m behind, waits6s after
  GO, moves3.2m/s. `eraseZ` world-space shader discard consumes every owned world mesh
  material (floor, scene dressing, top unions and obstacle details); sky/hands excluded.
  CPU consumes complete solids behind it; partial solids match the front cutoff until
  catch. GPU resources stay bounded to this one round and are reused on retry, all
  disposed on rebuild/exit. Not unlimited streaming or per-frame disposal.
- Gap24m->2m drives a shared pressure value; SVG organic black tendrils and vignette
  interpolate at exp(-8dt),0 far away. Looking backward reveals one cheap animated ink
  front plane. No flashing, per-frame RNG, expensive post-process or branded Venom asset.
- Catch/arena fall/timeout shows failure title, no Next, no coins. Race ordinary falls
  retain CP respawn unless consumed. Win pays once via existing wallet token; no new
  economy system. Retry resets front, tiles, pickups, effects and momentum.
- Survival has upper/lower rotating bars accelerating deterministically by worldTime.
  Collapse tiles break after.85s and never regenerate until retry;3layers69tiles each.
  Hunt uses16reachable rotating rings,goal12, optional bounce pads and sweepers.
  Round objective is in existing progress line (remaining seconds or collected/12).
- Collapse surfaces warm toward amber before breaking (no flashes), untouched and fully
  hidden tiles skip matrix recomputation. Retry invalidates their cache. Arena tiles do
  not display race direction arrows. Upper survival motor has a grounded support shaft.
- Host wallet validation uses `ROUND_COUNT`, not the old hardcoded6. This is the only
  gameplay change in game-runtime.js; all normal modes' movement/level paths unchanged.
- Selector labels have30locale strings; proper map names retain English except Turkish.
  Scene uses existing biome art. No exact Fall Guys coordinates/models, crowd physics,
  grabs or online team modes are claimed.

Research: [official Season5](https://www.fallguys.com/news/fall-guys-season-5-blog?lang=en-US),
[Epic course design](https://dev.epicgames.com/documentation/en-us/fortnite/fall-guys-designing-an-obstacle-course-in-fortnite-creative).
Jump Club/Hex-A-Gone/Slime Climb reference imagery was reviewed for spatial grammar;
new arenas are original solo adaptations, not proprietary map copies.

QA: `output/party-153-test.cjs`, `output/run-party-153-official.mjs`. Detailed final
browser/mobile/package outcome in progress.md; prior sections are historical.

## Authoritative 1.52 update (overrides the historical section below)

User: improve platforms/model quality, research Fall Guys deeply, eliminate same-looking levels,
add bhop and acceleration. The mode remains FIRST PERSON, SOLO, no AI/rivals.
Same source folder/ZIP/internal obby portal. Normal Level/Endless/Surf/2D/lobby physics unchanged.

### Reference scope and limitations

Researched official releases, Epic's obstacle-course design guidance, round descriptions,
and screenshots/overview references. Built engine-scale recreations of their recognizable
section sequences, not imported map files or exact proprietary coordinates/assets. No
Fall Guys code, logos, Beans, textures, multiplayer service or map data is included.
The original game has third-person movement, grabbing, crowd physics and different jump units;
our actual geometry is calibrated to this game's 120Hz FPS player. Do not claim exact parity.

Primary design references:

- https://www.fallguys.com/news/fall-guys-season-2---out-now?lang=en-US
  Knight Fever's obstacle gauntlet and medieval machine theme.
- https://www.fallguys.com/news/fall-guys-season-3-is-out-now
  Winter obstacle theme and Tundra context.
- https://www.fallguys.com/news/fall-guys-season-5-blog?lang=en-US
  Lily Leapers' layered drum-to-drum traversal.
- https://dev.epicgames.com/documentation/en-us/fortnite/fall-guys-designing-an-obstacle-course-in-fortnite-creative
  Graybox against actual jump envelopes, readable section escalation, staggered moving obstacles.

Round-flow/visual references (readable search excerpts where full pages were restricted):

- https://fallguysultimateknockout.fandom.com/wiki/The_Whirlygig
- https://fallguysultimateknockout.fandom.com/wiki/Tundra_Run
- https://fallguysultimateknockout.fandom.com/wiki/Big_Fans
- https://fallguysultimateknockout.fandom.com/wiki/Track_Attack
- https://fallguysultimateknockout.fandom.com/wiki/Knight_Fever
- https://fallguysultimateknockout.fandom.com/wiki/Lily_Leapers

### Six distinct course blueprints

`obby-course.js`, COURSE_VERSION=5, level1..6. These are explicit blueprints, not
randomly reordered copies. Same localized map names, new authored structures.

| Level / theme | Reference flow | Engine recreation |
| --- | --- | --- |
| Rotor Grove / Nature | Whirlygig | offset sweeper field; three parallel vertical propellers; fast center rotor vs both side disc chains; final windmill jump |
| Frostworks / Snow | Tundra Run | snowball slalom; staggered punch alley; wind detour/bouncer shortcut; ascending punch steps; spring finish |
| Cloud Cross / Sky | Big Fans | twin fans to a large hub; central/side fan choice; three-to-two transfers; sweeper-armed fan finale |
| Circuit Break / City | Track Attack | boost start; narrow elevated beams above slower lower punch route; conveyor/boost section; jump-rope sprint; spring finish |
| Forge Falls / Lava | Knight Fever | pendulum approach; three narrow roller-style causeways; swinging-log hall; timed moving bridge islands |
| Tidal Springs / Water | Lily Leapers | stepped drums; water-crossing drums; swaying rising stacks; giant staggered pads; high center vs lower side finish routes |

Depth202–267m,4–5 sections,5–6 checkpoints. Some references use physics that are
intentionally adapted: Knight bridge islands lift rather than physically hinge;
roller-style causeways are flat contact tops with spinning hazards, not rolling cylinders.
No false sloped visual surface over a flat collider. Do not label these as exact copies.

Checkpoint metadata supplies actual Y, width, depth, index, cumulative distance.
Progress projects onto the current checkpoint segment and HUD max-holds it; finish
requires grounded crossing of the visible stripe. Optional branches do not bypass
mandatory ordered checkpoints. `route` is editor/QA metadata only, no production pilot.

### Movement / bhop

- Physics120Hz, gravity24m/s², normal jump9.5m/s, base run7.5m/s, R.43/H1.8 unchanged.
- Ground approaches desired velocity at20m/s² (diagonal input normalized).
- Landing window140ms, buffer140ms, coyote120ms. Hold Space/mobile Jump to auto-hop,
  or use repeated Space/scroll-down. Holding jump during the countdown does not move
  the player; gameplay starts after3s as before.
- A moving hop within the landing window adds.65m/s bonus, capped at+5m/s. It needs
  a genuine airborne landing, so key spam/standing still cannot farm speed.
- Staying grounded beyond160ms decays bonus4m/s². Releasing movement on ground
  clears chain and brakes50m/s². A hit/fall/checkpoint reset clears momentum.
- Air steering preserves aligned forward speed, while opposing input can brake.
  The bonus cap is not a universal speed cap: dive/wind/external impulses still exist.
- Boost arches set a12m/s target for2s; they do not compound multiply velocity.
- Drum bounce18m/s is separate from the normal jump and supports authored vertical routes.
- Normal real glove render adapter remains isolated. Small xN HUD uses the familiar
  combo appearance, no new menu design. E/Shift dive remains available.

### Geometry and deterministic contact

Original `sweep` rectangular slab and2mm support probe remain; `surfaceSweep`
wraps them for the new shapes. Discs have radial top/side tests, excluding the invisible
corners of their broad-phase square. Rotating rectangular fans transform the contact
query into local coordinates and transform the contact normal back. Broad phase expands
by the rotated diagonal. Supports carry a standing player by a rigid rotation about
the SAME hub/angle used in art. No camera rotation is applied by platform carrying.

`pose(data, worldTime)` drives fan rotation, sway, lifts, rotor blades, balls and gates.
No RNG in physics/render loops. Checkpoint reset creates a fresh player, not a stale
support or speed state. Existing retry reuses the scene; Next disposes and rebuilds.

### Platform and obstacle art

- Opaque, narrow-bevel layered shells, rim/cap surfaces, bolts, side inset panels,
  concentric pad rings, scaffolded major catches and fan hubs.
- Separate instanced round/rectangular batches; circle art agrees with circular contact.
- World-position tread shader with derivative antialiasing gives consistent-size grip
  detail instead of stretched bitmap tiles. Standard material roughness/lighting retained.
- Real rotating gate housings/padded blades, speed arches, coil-supported drum pads.
- Rigid animated subassemblies merge by material in their own local space. Static scenery
  kit merges separately, excluding rotating actors. Coils/feet are shared instanced batches.
- Static platform matrices are cached. Dynamic platforms update with their physical pose.
- Overlap-safe collision decks are not rendered as overlapping coplanar caps. A build-time
  rectangle subtraction pass gives checkpoint/branch/deck tops unique surface ownership;
  one opaque vertex-colored mesh covers the union. No depth-write workaround or alpha fade.
  Fan arm caps end outside their circular hub cap, avoiding hub/arm Z fighting.
- Normal game's complete biome scenery factories stay intact. Multipart assemblies share
  one bound/transform. Ground is opaque, Sky uses the existing cloud floor.

### Verification

`output/party-152-test.cjs`: all6full attempts completed via actual input, no gloves or
teleport-to-win.35–70s,0–9falls depending on route. Big Fans controller uses held-jump bhop.
This is NOT a no-fall/every-input success claim. Round corners,1800-tick rotating carry,
drums, bounded bhop gain/release, determinism and elevated checkpoint reset passed.

`output/run-party-152-official.mjs` wraps the REQUIRED develop-web-game Playwright client.
Desktop: real mode entry, FPS/normal hands, borrowed host state restoration, all6maps,
actual first route, native pause/finish/reward once/retry reuse/Next, isolated disposal,
original Flappy, and actual2D/Surf/Endless/tutorial return all passed. Held Space and
scroll-down verified. Stage screenshots and debug overhead cameras inspected; overhead
cameras are QA-only, never gameplay. Mobile result recorded in progress.md when complete.

Sampled desktop draw calls after reset (including seam-free cap union):89,74,43,73,82,39.
Water's existing scenery remains triangle-heavy; real low-end phone profiling still matters.
Do not promise60FPS on all devices or claim live Poki Inspector/public upload was tested.

## Historical 1.51.0 documentation

Everything below describes the PREVIOUS layouts. Use1.52above and current source for work.

## Latest user decision

"first person devam etsin oyun diğer oyuncuları kaldır maplari internetten araştırıp kur."

This overrides the previous1.50 third-person eight-runner race. Party Run is now
a **solo first-person obstacle gauntlet**. There are no rivals, AI runners,
placement counter, first-five qualification, crowd impulses or race timeout.
The classic lobby cube stays unchanged. Flappy remains the original lobby machine.
The mode still occupies the SAME internal `obby` portal. Do not add a duplicate.

## Source ownership / lifecycle

- `obby-course.js`: authored map registry (courseVersion4), 120Hz simulation,
  original swept slab AABB and 2mm skin support, moving lift catcher/carry.
- `party-race.js`: legacy class name ElementalPartyRace, now single-player
  attempt state only: three-second start, checkpoint, falls, completion/progress.
  There is NO racers array, botInput or rival update loop.
- `obby-run.js`: actual first-person camera at feet+1.58m, YXZ yaw/pitch,
  no roll, no orbit boom, near.06, FOV82/portrait76, tiny damped landing response.
  Borrows the NORMAL real hand viewmodel/animation through the existing isolated
  host renderHands adapter, with portrait-only transient offsets. No new glove
  pose or geometry was invented. The main camera/rig state must be restored.
- `obby-art.js`: instanced padded decks/rims/bolts/chevrons; reused animated
  obstacle kit. Stationary machinery/supports are merged by shared material.
  Animated parents, heads, shafts, rotor, swing and lamp subtrees are excluded.
- `obby-interface.js`: REAL native pause/result DOM with original node/listener
  identity restored. Solo completion, no ranking/elimination labels.
- `obby-run.css`: normal menu palette/fonts; compact progress/time, crosshair,
  separate mobile look/jump/dive areas. No standings panel.
- `party-avatar.js` was deleted, removed from HTML and the existing release ZIP.
  No competitor geometry, shadow, capsule rig or avatar resource is loaded.
- `lobby-hub.js` and `mode-concourse.js` have NOT been changed in1.51.
- Normal Level/Endless/Surf/2D course/physics sources are untouched.
- `game-runtime.js` changed only build version text; the existing hand, wallet,
  pointer-lock, audio, SDK and mode host integration are reused.

The internal class/file/CSS names with "obby" remain compatibility identifiers,
not an instruction to restore old precision Obby or third-person AI racing.

## Research and original layouts

Read official Fall Guys and Epic obstacle-course documentation, plus visual
Whirlygig/Tundra Run overview references. Important motifs: readable catches,
rotating-arm timing, staggered punches, multiple choices at a fork, and rhythmic
spring-pad routes. References informed ORIGINAL layouts in this project's units.
No Fall Guys files, branded models, textures, code, exact map import or multiplayer
service is used. Do not describe this as a licensed/binary map conversion.

Primary references:
- https://www.fallguys.com/news/fall-guys-season-5-blog?lang=en-US
  Treetop Tumble's branch/layer choices and Lily Leapers' drum-to-drum rhythm.
- https://www.fallguys.com/news/fall-guys-season-3-is-out-now
  Winter gauntlet and snowball obstacle context.
- https://dev.epicgames.com/documentation/fortnite/fall-guys-designing-an-obstacle-course-in-fortnite-creative
  Nonlethal moving props, staggered timing, jump envelope and graybox testing.
- https://dev.epicgames.com/documentation/en-us/fortnite/fall-guys-obstacle-course-assets-in-fortnite-creative
  Distinct start/checkpoint/finish, floor/edge treatment and scaffold supports.

## Six maps — authored geometry, NOT six shuffled32m-slot playlists

Coordinates are [X,Z]; feet Y=3.004 on catches. +Y up, progression generally -Z.
Checkpoint arrays define progress and recovery; actual walkways can branch outside
the checkpoint centerline. All catches are18x10m. Most routes are8–20m wide.
Flat AABB tops are rendered flat: do not add fake decorative slopes that disagree
with the collider.

| Map / biome | Checkpoints after start [0,0] | Main ideas |
| --- | --- | --- |
| Rotor Grove / Nature | [0,-42],[-6,-88],[8,-132],[0,-184],[0,-232] | two offset sweeper yards, safe left grove vs fast right shortcut, hop islands, three rolling lanes, final shortcut/detour |
| Frostworks / Snow | [0,-52],[10,-98],[-9,-142],[0,-196],[0,-248] | wide ball slalom, staggered punchers, moving bridges, two timed door rows, alternating winds + pendulum |
| Cloud Cross / Sky | [-8,-38],[8,-80],[0,-126],[-8,-174],[0,-220] | cloud hops, long safe left crossing vs short movers, crosswinds, lift islands, rotor finale |
| Circuit Break / City | [7,-46],[-8,-96],[8,-146],[0,-202],[0,-252] | timed gate court, opposing parallel conveyors, jump-door rhythm, moving crossing, blade/fan finish |
| Forge Falls / Lava | [-8,-46],[8,-98],[0,-152],[-8,-202],[0,-256] | alternating punches, safe outside detour vs hop shortcut, pendulum hall, belt/fan route choice, catch islands |
| Tidal Springs / Water | [0,-48],[10,-96],[-8,-148],[0,-200],[0,-248] | optional spring garden, low easy lane vs gold elevated route, rolling river, safe harbour detour, spring catches |

Bodies/rims/caps are opaque. The ground uses the existing biome material; Sky
retains its cloud ground. Compound scenic meshes share ONE assembly bound and
transform, preserving snow caps/neon trims. Placement follows local route edge
clearance and covers the full authored depth. Checkpoint/elevated-branch support
frames are baked, not new physics blockers. The scaffolds are outside the top.

`plans`, `layouts`, and each explicit level branch are the authoritative map
blueprints. Helpers:
- `lane(points,width,extra)`: overlap-tolerant flat decks along an authored bend.
- `islands(section,count,width,extra)`:1.5m logical edge gaps, optional movers/lifts.
- `spring`: flush trigger over a real supporting deck, or existing solid bouncer.
- `route`: sorted main-route platform IDs for authoring QA, not a shipped AI.
- `branch`: optional shortcut/secondary route, marked gold by the renderer.
- `routeYaw`: chevrons follow the actual bend, not always global -Z.

## Physics and flow invariants

120Hz, G24, jump9.5, speed7.5, R.43,H1.8 remain unchanged.
The existing slab sweep and support math are preserved; no physics engine added.
Moving X platforms carry riders; lifts use relative-time top catching.
Finite E/Shift ground/air dive (.85s cooldown) and Space jump remain responsive.

Pads are flush trigger-only geometry over solid decks, excluded from solid
sweep and skin support. Their .035m render offset avoids top overlap. Raised
overlapping pad colliders previously caused an invisible lip—do not restore them.

Rolling balls now use continuous ping-pong motion with currentZ/velocity shared
by the visual and collider; there is no recycle teleport. All animation uses
worldTime, no per-frame randomness.

Three-second countdown -> active play -> final grounded catch -> completion.
Falling below.2m or outside authored bounds returns to the latest checkpoint
after.45s. Falls do not open an elimination screen and there is no match cutoff.
Final checkpoint is dynamic `checkpoints.length-1`, NOT legacy index6.
Completion requires crossing the visible checkered stripe at finalCP.z-2.25m,
grounded between the arch posts. Merely entering the last catch is not a win.

Progress uses accumulated lengths between authored checkpoint centers plus
projection on the CURRENT segment. HUD holds a monotonic peak on recovery.
Do not reinstate `-z/32/6` or previous first-five / distance-rank logic.

## Time / wallet / save / UI

ActivePlayClock uses performance.now, starts at GO, freezes on pause/preparation/
result, and includes active checkpoint recovery. Physics time remains fixed-step.
Successful course completion pays once through the existing bounded<=75 host
bank. Attempt UUID/result guard/host receipts prevent duplicate rewards.
No losing-to-bots reward path is reachable; there are no other racers.

Save stays `elemental-run-party-v1`. courseVersion4 archives the preceding PBs,
records previousCourseLevel and resets the new map catalog to level1.
Main wallet, old Obby/FPS save and other mode saves are untouched.
Map titles are original proper names, with explicit Turkish display titles;
normal shared buttons use the existing30-language localization.

Next loads/warm-compiles the next course. Retry reuses the current resources
without rebuild. R recovers this attempt at its checkpoint. Pause/settings/result
use actual normal-game DOM and preserve host listeners; do not restore ancestor
innerHTML and silently detach buttons.

## Performance / tests

Only one player is simulated, no competitor resources or collision pairs.
Existing platform instancing/static batching and compileAsync +64px warm render
are retained. Exit/next dispose owned geometries/materials/textures/RT/buffers.
Decor uses four normal-game factories with mobile-lite selection and shared
compound transforms. Real low-end phone thermal/GPU still needs device profiling.

`output/party-151-test.cjs` contains a QA-only follower, never shipped in HTML.
It completed all six main routes with real hazards/default controls/no gloves,
zero falls in the recorded CPU run, in37–48simulated seconds. It also checks no
rival state, no150s timeout, checkpoint returns, valid progress and continuous
ball motion. This proves tested routes, not every possible human input/shortcut.

`output/run-party-151-official.mjs` imports the REAL develop-web-game client.
QA-only exposure/SDK stub allows portal/FPS/real-hands/control/pause/ground-dive/
full-first-course/finish/wallet/Next/retry/six-map/modal/disposal/Flappy tests.
Mobile uses actual CDP touches for jump-vs-look isolation plus portrait screenshots.
Final desktop/mobile151 runs passed, including15FPS view angles, idle/run hand
phase, borrowed normal camera/rig restoration and native DOM identity.
Desktop also opened real2D/Surf/Endless/tutorial modes and returned. Nine protected
normal-mode/lobby source hashes match1.50. No rival geometry/standings remain.
Sample frame calls: desktop43–74,mobile44–75; Water mobile~588ktriangles still
requires actual-device profiling. Main routes/shortcuts are not exhaustive human QA.
When testing return from normal Endless, wait until asynchronous preparation
overlay is hidden; do not artificially return while that transition is active.
Use renderer.info.reset before sampling, otherwise composer counters accumulate.
Do not run two heavy WebGL QA browsers concurrently on this workstation; it can
starve mobile boot prewarm and create a QA-only timeout. After resize with the
QA's stopped RAF, wait and explicitly redraw before screenshot capture.
After testing Flappy, remove only its hidden canvas in the QA page so the official
largest-canvas picker captures the actual WebGL game. Production Flappy is intact.

Real Poki Inspector embedding, low-power phones and exhaustive human shortcut
playthrough remain manual. No universal60FPS or bug-free claim.

## Release

Build/cache1.51.0 in the same canonical source and EXISTING Poki ZIP.
No Steam/Pixel copy change, public hosting upload or new project folder.
Version1.50 AI-race notes in progress.md are historical and overridden here.
