'use strict';

(function initElementalMapEnvironments(global) {
  const config = global.ElementalGameConfig;
  if (!config) throw new Error('game-config.js must load before map-environments.js');

  const PHASES = Object.freeze([
    Object.freeze({ id: 0, key: 'cyber', targetScore: config.NATURE_SCORE }),
    Object.freeze({ id: 1, key: 'nature', targetScore: config.SKY_SCORE }),
    Object.freeze({ id: 2, key: 'sky', targetScore: config.LAVA_SCORE }),
    Object.freeze({ id: 3, key: 'lava', targetScore: config.WATER_SCORE }),
    Object.freeze({ id: 4, key: 'water', targetScore: config.SNOW_SCORE }),
    Object.freeze({ id: 5, key: 'snow', targetScore: config.SNOW_SCORE })
  ]);

  function descriptor(phase) {
    return PHASES[Math.max(0, Math.min(PHASES.length - 1, Math.floor(Number(phase) || 0)))];
  }

  function createController(adapter) {
    if (!adapter || typeof adapter.getState !== 'function') throw new TypeError('Map environment adapter is required');

    function updatePhaseState(delta) {
      let state = adapter.getState();
      adapter.updateProgress(descriptor(state.phase).targetScore, state.phase);

      if (!state.campaignLocked) {
        if (state.phase === 0 && state.score >= config.NATURE_SCORE - 650 && !state.naturePreloaded) {
          adapter.prewarmNature(delta);
          state = adapter.getState();
        }
        if (state.phase === 0 && state.score >= config.NATURE_SCORE) adapter.transitionTo('nature');
        state = adapter.getState();
        if (state.phase === 1 && state.score >= config.SKY_SCORE) adapter.transitionTo('sky');
        state = adapter.getState();
        if (state.phase === 2 && state.score >= config.LAVA_SCORE && state.onSkyLayer && !state.lavaDropTransitionActive && !state.lavaMapActivated) {
          adapter.transitionTo('lava');
        }
        state = adapter.getState();
        if (state.phase === 3 && state.score >= config.WATER_SCORE && state.lavaMapActivated && !state.waterMapActivated) {
          adapter.transitionTo('water');
        }
        state = adapter.getState();
        if (state.phase === 4 && state.score >= config.SNOW_SCORE && state.waterMapActivated && !state.snowMapActivated) {
          adapter.transitionTo('snow');
        }
      }

      adapter.syncPhaseGraphics();
      updateTransitionVisuals(delta, adapter.getState());
    }

    function updateTransitionVisuals(delta, state) {
      let factor = state.transitionFactor;
      if (state.phase === 1 && factor < 1) {
        factor = Math.min(1, factor + delta);
        adapter.setTransitionFactor(factor);
        adapter.updateEnvironmentColors(factor, 1);
        return;
      }
      if (state.phase === 2) {
        if (state.lavaDropTransitionActive) {
          const lavaBlend = state.lavaDropStarted
            ? Math.max(state.lavaPreviewReveal, Math.min(1, Math.max(0, (state.skyLayerY - state.playerY) / 180)))
            : 0;
          adapter.updateEnvironmentColors(lavaBlend > 0.01 ? lavaBlend : 1, lavaBlend > 0.01 ? 3 : 2);
        } else if (state.isSkyFading || state.onSkyLayer) {
          factor = Math.min(1, factor + delta * 0.2);
          adapter.setTransitionFactor(factor);
          adapter.updateEnvironmentColors(factor, 2);
        } else {
          adapter.updateEnvironmentColors(1, 1);
        }
        return;
      }
      const speeds = { 3: 0.45, 4: 0.18, 5: 0.14 };
      if (speeds[state.phase]) {
        factor = Math.min(1, factor + delta * speeds[state.phase]);
        adapter.setTransitionFactor(factor);
        const eased = state.phase >= 4 ? factor * factor * (3 - 2 * factor) : factor;
        adapter.updateEnvironmentColors(eased, state.phase);
      }
    }

    function updateActiveWorld(delta) {
      const phase = adapter.getState().phase;
      adapter.updateCyber(delta);
      if (phase >= 1) adapter.updateNature(delta);
      if (phase === 2) adapter.updateSky(delta);
      else if (phase >= 3) adapter.updateLateWorld(delta);
    }

    return Object.freeze({ updatePhaseState, updateActiveWorld, descriptor });
  }

  global.ElementalMapEnvironments = Object.freeze({ PHASES, descriptor, createController });
})(window);
