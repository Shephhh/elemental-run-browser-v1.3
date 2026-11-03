# Poki session measurement — schema 2 / v1.69.0

## Scope and limits

The game clock previously used clamped simulation dt and returned before sampling
in the lobby, Surf/Bhop, Party and 2D branches. These custom events could severely
undercount a real session. This does **not** prove that Poki computes Player Fit
duration from those custom events, nor that its backend uses the sum of SDK play
intervals. Do not equate these three quantities: video length, active clock, and
Player Fit duration. Historical Poki results cannot be repaired by changing a ZIP.

The new version fixes the verified local defects and provides an independent
cross-check for a newly uploaded/tested version. A remaining backend discrepancy
needs an exact version/session and Poki support, not inflated gameplay signals.

## Ownership

- `play-session.js`: pure monotonic `performance.now()` clock. Tracks active,
  visible-ready diagnostic, per-mode, and normal-level-attempt time separately.
  No simulation delta clamp, timeSlow, rewind, storage, user IDs or new server.
- `game-runtime.js/getPokiGameplayState`: authoritative control-state resolver.
  Side modes own their state even though the normal runner's pause boolean stays
  true. Samples before/after each game step, including early-return branches.
- `poki-bridge.js`: reconciles actual state and de-duplicates SDK calls. A 250ms
  heartbeat and visibility/focus/page lifecycle listeners work independently of
  the render loop. Legacy calls request reconciliation; they cannot leave an
  actively controlled mode incorrectly stopped, or start a paused mode.
- First SDK gameplay requires the actual trusted ready-screen PLAY click.
  Delayed SDK initialization synchronizes once it becomes ready. Loading reports
  are idempotent. Ads force a stop before the SDK ad request, then reconcile.

## Counted as active

Interactive tutorial (not countdown), exploration in lobby/Games, living lobby
Flappy, normal levels/endless, playing Surf/Bhop, Party after countdown, and 2D
after its Play action. A stationary but controllable player remains in gameplay.

Not active: boot/loading, PLAY gate, portal/preparation, tutorial/Party countdown,
pause, reward/settings/shop overlays blocking movement, result/death state, ad,
lost WebGL context, hidden page or lost document focus. Visible-ready time is a
separate diagnostic and is **never** sent as SDK gameplay.

Normal level attempts have an independent serial and only accumulate in the
`levels` mode. Switching to a different mode cannot add to an abandoned attempt.

## New events (existing Poki measure API)

| Path | Meaning |
| --- | --- |
| `telemetry / session-clock / version-2` | New schema active |
| `session-v2 / active-play / reached-60s` | Cumulative real active time across all modes |
| `session-v2 / ready-visible / reached-60s` | Visible time after ready, including menus; diagnostic only |
| `mode-time / surf / reached-60s` | Real active time for that mode |
| `sdk-clock / reached-60s / 60s` | Locally measured duration of successfully invoked SDK play intervals at that active checkpoint |
| `mode-v2 / party / enter` | Actual active mode change, not a temporary preparation state |
| `lifecycle-v2 / surf / stop-pause` | Control interruption and reason |
| `session-exit-v2 / games / playing` | Last mode/control state at pagehide; delivery is best effort |
| `duration-v2 / active-play / 300s` | Active duration at pagehide; delivery is best effort |
| `loading-error / first-tutorial-entry / task-failed` | Loading task failure (no stack or personal data) |
| `runtime-health / webgl / context-lost` | Graphics context failure; `restored` on recovery |

Thresholds: 60/120/180/300/420/600 active seconds, each once per page and per mode.
The old `session / active-play` series is retired so old undercounted values are
not silently mixed with corrected schema 2. Mode keys: tutorial, lobby, games,
flappy, levels, endless, surf, party, runner2d. Event values respect Poki's numeric
value constraints; no per-frame network events are emitted.

## Inspect and validate

In the game iframe console: `ElementalPoki.sessionSnapshot()`.

- `activeSeconds`: expected actual active time.
- `sdkActiveSeconds`: local wall time between SDK start/stop API invocations.
  This is **not** an acknowledgement from Poki's analytics backend.
- `sdkGapSeconds`: positive difference; normally near zero after initialization.
  A late/unavailable SDK can legitimately leave a gap, visible via `initialized`.
- `reportedPlaying`: last successfully invoked SDK state.
- `byMode`, `reason`, `attemptSeconds`: context for diagnosing discrepancies.
- `transitions`: last 96 changes, in memory only. No persistent player identifier.

`render_game_to_text()` includes this diagnostic in every mode. For a comparison,
use the same uploaded version and one exact recording/session. Compare a real
stopwatch, these counters, Inspector events and the recording. Check SDK reported
seconds at the 60/180/300 checkpoints. A sub-second boundary difference is normal;
minutes of drift is not. Pauses/ads/background time must remain excluded.

CPU QA covers 60/10/2/0.2 FPS-equivalent sampling, pause/hidden/ad/page lifecycle,
late SDK, duplicate calls, side-mode ownership, and stale disposed shader polls.
Browser QA uses the official web-game client with a mocked SDK and real prepared
scenes. A QA-only zero-simulation-dt hold prevents unattended character deaths
during clock/pause screenshots; it is not shipped physics. These tests are not a
new live Player Fit result, live ad test, or real-device FPS guarantee.

## Shader safety

Three r185's native compileAsync polls material.currentProgram from a timer. A
scene disposal/context loss can clear that field and throw `isReady` outside the
Promise, leaving preparation unresolved. `graphics-engine.js/compileAsyncSafe`
captures program references immediately, catches polling errors, checks context
loss/cancellation, and bounds polling to 8 seconds. All in-project compile callers
use it. No renderer quality, map geometry, physics or economy was changed.
