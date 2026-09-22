'use strict';

(function initElementalGraphicsEngine(global) {
  function create(adapter, options = {}) {
    if (!adapter) throw new TypeError('Graphics adapter is required');
    const state = {
      // Automatic FPS-driven tier/DPR changes are intentionally disabled for
      // this build. The campaign locks High from Level 2 onward in the runtime.
      adaptiveEnabled: options.adaptiveEnabled === true,
      qualityLocked: false,
      dynamicResolutionScale: 1,
      dynamicResolutionTimer: 0,
      performanceLevel: 0,
      qualityIndex: 0,
      qualityCeilingIndex: 2,
      qualityStableSeconds: 0,
      qualityLowSeconds: 0,
      qualityCriticalSeconds: 0,
      qualityCooldown: 0,
      qualityReason: 'startup-low',
      hardwareProfile: options.hardwareProfile || {
        cores: Math.max(0, Number(navigator.hardwareConcurrency) || 0),
        memoryGb: Math.max(0, Number(navigator.deviceMemory) || 0),
        devicePixelRatio: Math.max(1, Number(global.devicePixelRatio) || 1),
        gpu: 'unknown', score: 0, recommendedQuality: 'high'
      },
      lowFpsSeconds: 0,
      criticalFpsSeconds: 0,
      recoverySeconds: 0,
      runSeconds: 0,
      lastLevelChangeAt: 0,
      sceneRefreshPending: false
    };

    function computePixelRatio(preset) {
      if (global.ElementalPixelArt?.enabled) return global.ElementalPixelArt.pixelRatio();
      const native = global.devicePixelRatio || 1;
      const base = preset.pixelRatio <= 1
        ? Math.min(native, preset.pixelRatio)
        : Math.min(preset.maxPixelRatio || preset.pixelRatio, Math.max(native, preset.pixelRatio));
      const absoluteFloor = adapter.isMobile() ? 0.5 : 0.55;
      const presetFloor = 0.6;
      return Math.max(absoluteFloor, Math.max(presetFloor, base) * state.dynamicResolutionScale);
    }

    function updateAdaptiveQualityTier(sampleDelta, rawFrameDelta) {
      // A mobile player selects the named quality preset explicitly. Adapt
      // resolution and expensive transient effects without rewriting that choice.
      if (adapter.isMobile()) return;
      if (!state.adaptiveEnabled || state.qualityLocked) return;
      if (!adapter.isBrowserBuild() || state.runSeconds < options.graceSeconds) return;
      state.qualityCooldown = Math.max(0, state.qualityCooldown - sampleDelta);
      if (rawFrameDelta > 0.18) return;
      const instantFps = 1 / Math.max(0.0001, rawFrameDelta || 0.0167);
      const smoothedFps = adapter.getSmoothedFps();
      if (smoothedFps > options.promoteFps && instantFps > 48) {
        state.qualityStableSeconds += sampleDelta;
        state.qualityLowSeconds = Math.max(0, state.qualityLowSeconds - sampleDelta * 1.5);
        state.qualityCriticalSeconds = Math.max(0, state.qualityCriticalSeconds - sampleDelta * 2);
      } else {
        state.qualityStableSeconds = Math.max(0, state.qualityStableSeconds - sampleDelta * 1.8);
        state.qualityLowSeconds = smoothedFps < options.demoteFps
          ? state.qualityLowSeconds + sampleDelta
          : Math.max(0, state.qualityLowSeconds - sampleDelta);
        state.qualityCriticalSeconds = smoothedFps < 34 || instantFps < 27
          ? state.qualityCriticalSeconds + sampleDelta
          : Math.max(0, state.qualityCriticalSeconds - sampleDelta * 1.5);
      }
      if (state.qualityIndex > 0
          && (state.qualityCriticalSeconds >= 0.35 || (state.qualityCooldown <= 0 && state.qualityLowSeconds >= 1))) {
        adapter.setQualityIndex(state.qualityIndex - 1, state.qualityCriticalSeconds >= 0.35 ? 'critical-fps-drop' : 'sustained-fps-drop');
        return;
      }
      if (state.qualityIndex < state.qualityCeilingIndex && state.qualityCooldown <= 0
          && state.performanceLevel === 0 && state.dynamicResolutionScale >= 0.92 && state.qualityStableSeconds >= 4.5) {
        adapter.setQualityIndex(state.qualityIndex + 1, 'stable-high-fps');
      }
    }

    function updateDynamicResolution(rawFrameDelta) {
      const renderer = adapter.getRenderer();
      if (!renderer || adapter.isPaused() || adapter.isMainMenuVisible() || !adapter.hasRunStarted()) return;
      const sampleDelta = Math.max(0, Math.min(0.25, rawFrameDelta || 0));
      state.runSeconds += sampleDelta;
      if (!state.adaptiveEnabled || state.qualityLocked) {
        state.dynamicResolutionScale = 1;
        state.performanceLevel = 0;
        state.lowFpsSeconds = 0;
        state.criticalFpsSeconds = 0;
        state.recoverySeconds = 0;
        return;
      }
      const mobile = adapter.isMobile();
      const criticalFps = mobile ? 39 : 34;
      const lowFps = mobile ? 53 : 49;
      const recoverFps = mobile ? 58 : 56;
      if (rawFrameDelta > 0.18) {
        state.lowFpsSeconds = Math.max(0, state.lowFpsSeconds - sampleDelta);
        state.criticalFpsSeconds = Math.max(0, state.criticalFpsSeconds - sampleDelta);
        return;
      }
      if (state.runSeconds < 2.5) return;
      updateAdaptiveQualityTier(sampleDelta, rawFrameDelta);
      const fps = adapter.getSmoothedFps();
      if (fps < lowFps) { state.lowFpsSeconds += sampleDelta; state.recoverySeconds = 0; }
      else state.lowFpsSeconds = Math.max(0, state.lowFpsSeconds - sampleDelta * 0.65);
      state.criticalFpsSeconds = fps < criticalFps
        ? state.criticalFpsSeconds + sampleDelta
        : Math.max(0, state.criticalFpsSeconds - sampleDelta);
      if (state.criticalFpsSeconds > 2.2) adapter.setPerformanceLevel(2);
      else if (state.lowFpsSeconds > 1.4 && state.performanceLevel < 1) adapter.setPerformanceLevel(1);
      if (fps > recoverFps) {
        state.recoverySeconds += sampleDelta;
        if (state.performanceLevel > 0 && state.recoverySeconds > 24 && state.runSeconds - state.lastLevelChangeAt > 24) {
          adapter.setPerformanceLevel(state.performanceLevel - 1);
          state.lowFpsSeconds = 0;
          state.criticalFpsSeconds = 0;
        }
      } else state.recoverySeconds = 0;

      state.dynamicResolutionTimer -= sampleDelta;
      if (state.dynamicResolutionTimer > 0) return;
      const floor = mobile ? 0.55 : 0.58;
      let changed = false;
      if (fps < criticalFps && state.dynamicResolutionScale > floor) {
        state.dynamicResolutionScale = Math.max(floor, state.dynamicResolutionScale - (mobile ? 0.16 : 0.18));
        state.dynamicResolutionTimer = 0.28;
        changed = true;
      } else if (fps < lowFps && state.dynamicResolutionScale > floor) {
        state.dynamicResolutionScale = Math.max(floor, state.dynamicResolutionScale - (mobile ? 0.09 : 0.1));
        state.dynamicResolutionTimer = 0.42;
        changed = true;
      } else if (fps > recoverFps && state.performanceLevel === 0 && state.dynamicResolutionScale < 1) {
        state.dynamicResolutionScale = Math.min(1, state.dynamicResolutionScale + (mobile ? 0.02 : 0.025));
        state.dynamicResolutionTimer = 2.8;
        changed = true;
      } else state.dynamicResolutionTimer = 0.35;
      if (changed) {
        renderer.setPixelRatio(computePixelRatio(adapter.getQualityPreset()));
        adapter.resizePipeline();
      }
    }

    function applyQuality(preset) {
      const ctx = adapter.getGraphicsContext();
      const renderer = ctx.renderer;
      if (!renderer) return;
      if (ctx.cinematicColor) renderer.toneMappingExposure = preset.exposure || ctx.defaultExposure;
      const pixelArt = global.ElementalPixelArt?.enabled === true;
      if (renderer.shadowMap) renderer.shadowMap.type = pixelArt ? ctx.three.PCFShadowMap : (preset.softShadows ? ctx.three.PCFSoftShadowMap : ctx.three.PCFShadowMap);
      if (ctx.dirLight && ctx.dirLight.shadow) {
        const size = ctx.getRuntimeShadowMapSize(preset);
        if (ctx.dirLight.shadow.mapSize.width !== size) {
          ctx.dirLight.shadow.mapSize.set(size, size);
          if (ctx.dirLight.shadow.map) { ctx.dirLight.shadow.map.dispose(); ctx.dirLight.shadow.map = null; }
        }
        const halfWidth = Math.max(40, ctx.getRoadHalfWidth() + 28);
        Object.assign(ctx.dirLight.shadow.camera, { left: -halfWidth, right: halfWidth, top: 96, bottom: -72, near: 0.5, far: 650 });
        ctx.dirLight.shadow.camera.updateProjectionMatrix();
        ctx.dirLight.shadow.bias = -0.0003;
        ctx.dirLight.shadow.normalBias = 0.024;
        ctx.dirLight.shadow.radius = Math.max(1, Number(preset.shadowRadius) || 2);
        ctx.invalidateShadowCommit();
      }
      if (preset.envMap) ctx.ensureEnvironment();
      else if (ctx.scene) ctx.scene.environment = null;
      if (typeof ctx.applyMaterialTier === 'function') ctx.applyMaterialTier(preset, state.performanceLevel);
      const allowBloom = !pixelArt && !!preset.bloom && state.performanceLevel === 0;
      const allowAo = !pixelArt && !!preset.ao && state.performanceLevel === 0 && !adapter.isMobile();
      const allowFxaa = !pixelArt && !!preset.antialias && state.performanceLevel < 2;
      // Keep the skill/desaturation pass available; the pixel presentation does
      // tone mapping and palette conversion after the hand overlay instead.
      const wantComposer = pixelArt || allowBloom || allowAo || allowFxaa;
      if (wantComposer) {
        ctx.ensureComposer();
        if (ctx.getBloomPass()) {
          const bloom = ctx.getBloomPass();
          bloom.enabled = allowBloom;
          bloom.radius = preset.bloomRadius;
          ctx.setBloomBase(preset.bloomStrength, preset.bloomThreshold);
          ctx.applyPhaseBloom(ctx.getPhase());
        }
        if (ctx.getAoPass()) {
          const ao = ctx.getAoPass();
          ao.enabled = allowAo;
          if (ao.material?.uniforms?.uIntensity) ao.material.uniforms.uIntensity.value = Number(preset.aoIntensity) || 0;
          if (ao.material?.uniforms?.uRadius) ao.material.uniforms.uRadius.value = Number(preset.aoRadius) || 1;
        }
        if (ctx.getFxaaPass()) ctx.getFxaaPass().enabled = allowFxaa;
        ctx.resize();
      } else {
        if (ctx.getBloomPass()) ctx.getBloomPass().enabled = false;
        if (ctx.getAoPass()) ctx.getAoPass().enabled = false;
        if (ctx.getFxaaPass()) ctx.getFxaaPass().enabled = false;
        if (ctx.getDesatPass()) ctx.getDesatPass().enabled = false;
      }
      ctx.setComposerActive(wantComposer && !!ctx.getComposer());
    }

    function requestShadowMapRefresh(xPos = null, force = false) {
      const ctx = adapter.getShadowContext();
      const renderer = ctx.renderer;
      if (!(renderer && renderer.shadowMap && renderer.shadowMap.enabled)) return;
      if (renderer.shadowMap.autoUpdate || force || xPos === null || !ctx.player) {
        renderer.shadowMap.needsUpdate = true;
        ctx.resetPending(force || !renderer.shadowMap.autoUpdate ? 0.08 : 0);
        return;
      }
      const immediateAhead = Math.min(120, ctx.adaptiveRenderDistance * 0.14);
      if (xPos <= ctx.player.position.x + immediateAhead) {
        renderer.shadowMap.needsUpdate = true;
        ctx.resetPending(0.08);
        return;
      }
      ctx.queuePending(xPos);
    }

    return Object.freeze({ state, computePixelRatio, updateAdaptiveQualityTier, updateDynamicResolution, applyQuality, requestShadowMapRefresh });
  }

  global.ElementalGraphicsEngine = Object.freeze({ create });
})(window);
