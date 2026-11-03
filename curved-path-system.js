(function () {
  'use strict';

  // These hazards span enough of the lane surface that pivot-only rotation
  // leaves their edges detached from a curved road. Their vertices and shadow
  // vertices use the same smooth bend; gameplay colliders are never registered
  // here and therefore remain straight in the runtime's CPU coordinate space.
  const SMOOTH_OBSTACLE_TYPES = new Set(['wall', 'low_wall', 'falling_wall', 'slide_barrier', 'high_beam']);

  class ElementalCurvedPathSystem {
    constructor() {
      this.enabled = false;
      this.states = Object.freeze({ STRAIGHT: 'STRAIGHT', LEFT: 'LEFT_CURVE', RIGHT: 'RIGHT_CURVE' });
      this.state = this.states.STRAIGHT;
      this.direction = 0;
      this.targetDirection = 0;
      this.stateStartScore = 0;
      this.nextTransitionScore = 500;
      this.transitionCount = 0;
      this.currentScore = 0;
      this.strength = 0;
      // These are the original Curved Road Test values.  The production-safe
      // version keeps the immediate collision corridor straight, then blends
      // into the same horizontal world bend + spherical vertical drop.
      this.nearStraight = 72;
      this.fullCurveDistance = 684;
      this.maxCurveDistance = 684;
      this.horizontalStrength = 0.00062;
      this.sphereRadius = 1650;
      this.directionBlendSpeed = 0.62;
      // Curvature is a visual camera-space effect. A long frame must not be
      // paid back as one large visible bend on the next rendered frame.
      // Simulation/collisions remain frame-rate independent; the visual curve
      // catches up over subsequent frames instead of snapping the whole world.
      this.maxVisualDelta = 1 / 30;
      this.lastVisualDelta = 0;
      this.activeTransforms = [];
      // r185 optimisation: the curved world is evaluated for hundreds of
      // roots/road vertices per frame. Reuse the frame Set, transform records
      // and spline result instead of producing short-lived objects that force
      // periodic garbage-collector pauses on low-end browsers.
      this._frameSeenObjects = new Set();
      this._transformPool = [];
      this._splineScratch = {
        forward: 0, lateral: 0, vertical: 0, yaw: 0, pitch: 0,
        tangent: { x: 1, y: 0, z: 0 },
        up: { x: 0, y: 1, z: 0 },
        side: { x: 0, y: 0, z: 1 }
      };
      this._scratchEvaluations = 0;
      this._peakFrameTransforms = 0;
      this.lastOffset = 0;
      this.lastDrop = 0;
      this.lastYaw = 0;
      this.lastPitch = 0;
      this.section = 0;
      this._matrixDummy = null;
      this.installedMaterialCount = 0;
      this.installedShadowMaterialCount = 0;
      this.installedMaterialModes = { smooth: 0, rigid: 0, spline: 0, sheet: 0 };
      this._depthMaterialCache = new WeakMap();
      this._distanceMaterialCache = new WeakMap();
      this._visibilityPrepared = new WeakSet();
      this.shaderUniforms = {
        enabledStrength: { value: 0 },
        // The game runs forward on world +X (Three.js examples usually use
        // camera-space -Z). These two shared coefficients are the exact
        // quadratic curved-world controls used by every opted-in material.
        curveX: { value: -this.horizontalStrength },
        curveY: { value: -1 / (2 * this.sphereRadius) },
        originX: { value: 0 },
        nearStraight: { value: this.nearStraight },
        maxDistance: { value: this.maxCurveDistance }
      };
    }

    configure(level) {
      this.enabled = !!level?.curveEnabled;
      this.state = this.states.STRAIGHT;
      this.direction = 0;
      this.targetDirection = 0;
      this.stateStartScore = 0;
      this.nextTransitionScore = this._makeNextTransitionScore(0);
      this.transitionCount = 0;
      this.currentScore = 0;
      this.strength = Math.max(0, Math.min(1, Number(level?.curveStrength) || 0));
      this.lastOffset = 0;
      this.lastDrop = 0;
      this.lastYaw = 0;
      this.lastPitch = 0;
      this.section = 0;
      this.shaderUniforms.enabledStrength.value = this.enabled ? this.strength : 0;
      this.shaderUniforms.curveX.value = this.direction * this.horizontalStrength;
      this.shaderUniforms.curveY.value = -1 / (2 * this.sphereRadius);
      return this.snapshot();
    }

    _makeNextTransitionScore(score) {
      // Every state is held for at least 500 score; the additional random
      // window prevents the course from becoming rhythmically predictable.
      return Math.floor(Math.max(0, Number(score) || 0) + 500 + Math.random() * 301);
    }

    _pickNextState() {
      if (this.state === this.states.STRAIGHT) {
        return Math.random() < 0.5 ? this.states.LEFT : this.states.RIGHT;
      }
      if (this.state === this.states.LEFT) {
        return Math.random() < 0.5 ? this.states.STRAIGHT : this.states.RIGHT;
      }
      return Math.random() < 0.5 ? this.states.STRAIGHT : this.states.LEFT;
    }

    _enterState(nextState, score) {
      this.state = Object.values(this.states).includes(nextState) ? nextState : this.states.STRAIGHT;
      this.targetDirection = this.state === this.states.LEFT ? -1 : (this.state === this.states.RIGHT ? 1 : 0);
      this.stateStartScore = Math.max(0, Number(score) || 0);
      this.nextTransitionScore = this._makeNextTransitionScore(this.stateStartScore);
      this.transitionCount += 1;
    }

    forceState(nextState, score = 0) {
      this._enterState(nextState, score);
      return this.snapshot();
    }

    clear() {
      this.enabled = false;
      this.strength = 0;
      this.shaderUniforms.enabledStrength.value = 0;
      this.restoreObjects();
    }

    // Floating-origin rebases happen after the regular curve update. Keep the
    // shared shader origin in the same coordinate space during that exact frame;
    // otherwise instanced buildings use a pre-rebase origin for one render.
    syncOrigin(playerX = 0) {
      this.shaderUniforms.originX.value = Number(playerX) || 0;
      return this.shaderUniforms.originX.value;
    }

    update(score, realDelta, playerX = 0) {
      if (!this.enabled) return;
      const safeScore = Math.max(0, Number(score) || 0);
      this.currentScore = safeScore;
      // A retry or a new run resets score. Start straight again instead of
      // carrying a previous run's curve threshold into the opening corridor.
      if (safeScore + 1 < this.stateStartScore) {
        this.state = this.states.STRAIGHT;
        this.direction = 0;
        this.targetDirection = 0;
        this.stateStartScore = 0;
        this.nextTransitionScore = this._makeNextTransitionScore(0);
        this.transitionCount = 0;
      }
      if (safeScore >= this.nextTransitionScore && safeScore - this.stateStartScore >= 500) {
        this._enterState(this._pickNextState(), safeScore);
      }
      this.section = this.transitionCount;
      const delta = Math.max(0, Math.min(this.maxVisualDelta, Number(realDelta) || 0));
      this.lastVisualDelta = delta;
      // Exponential lerp cannot overshoot. Capping only the visual delta keeps
      // a dropped frame from becoming a one-frame world warp.
      const blend = 1 - Math.exp(-delta * this.directionBlendSpeed);
      this.direction += (this.targetDirection - this.direction) * blend;
      this.shaderUniforms.enabledStrength.value = this.strength;
      this.shaderUniforms.curveX.value = this.direction * this.horizontalStrength;
      this.shaderUniforms.curveY.value = -1 / (2 * this.sphereRadius);
      this.syncOrigin(playerX);
    }

    installMaterialBend(materials, options = {}) {
      if (!Array.isArray(materials)) return;
      const requestedMode = typeof options === 'string' ? options : options?.mode;
      const mode = requestedMode === 'rigid'
        ? 'rigid'
        : (requestedMode === 'spline' ? 'spline' : (requestedMode === 'sheet' ? 'sheet' : 'smooth'));
      const splineBaseY = Number(typeof options === 'object' ? options.baseY : 0) || 0;
      const splineCenterZ = Number(typeof options === 'object' ? options.centerZ : 0) || 0;
      for (const material of materials) {
        if (!material || material.isShaderMaterial || material.userData?.elementalCurvedPathMaterial) continue;
        material.userData = material.userData || {};
        material.userData.elementalCurvedPathMaterial = true;
        material.userData.elementalCurvedPathMode = mode;
        material.userData.elementalCurveBaseY = splineBaseY;
        material.userData.elementalCurveCenterZ = splineCenterZ;
        this.installedMaterialCount += 1;
        this.installedMaterialModes[mode] += 1;
        const uniforms = this.shaderUniforms;
        const rigidPivotMode = mode === 'rigid';
        const splineMeshMode = mode === 'spline';
        const ambientSheetMode = mode === 'sheet';
        const baseYUniform = { value: splineBaseY };
        const centerZUniform = { value: splineCenterZ };
        const previousCompile = material.onBeforeCompile;
        const previousCacheKey = material.customProgramCacheKey;
        material.onBeforeCompile = function elementalCurvedPathCompile(shader, renderer) {
          if (typeof previousCompile === 'function') previousCompile.call(this, shader, renderer);
          if (!shader?.vertexShader?.includes('#include <project_vertex>')) {
            this.userData.elementalCurvedPathCompileError = 'missing-project-vertex-r185';
            console.error('[CurvedWorld] Required r185 <project_vertex> chunk was not found.', this.type);
            return;
          }
          shader.uniforms.uElementalCurveStrength = uniforms.enabledStrength;
          shader.uniforms.uElementalCurveX = uniforms.curveX;
          shader.uniforms.uElementalCurveY = uniforms.curveY;
          shader.uniforms.uElementalCurveOriginX = uniforms.originX;
          shader.uniforms.uElementalCurveNear = uniforms.nearStraight;
          shader.uniforms.uElementalCurveMax = uniforms.maxDistance;
          shader.uniforms.uElementalCurveBaseY = baseYUniform;
          shader.uniforms.uElementalCurveCenterZ = centerZUniform;
          shader.vertexShader = shader.vertexShader.replace('void main() {', `
            uniform float uElementalCurveStrength;
            uniform float uElementalCurveX;
            uniform float uElementalCurveY;
            uniform float uElementalCurveOriginX;
            uniform float uElementalCurveNear;
            uniform float uElementalCurveMax;
            uniform float uElementalCurveBaseY;
            uniform float uElementalCurveCenterZ;

            float elementalCurveLead(float worldForward) {
              return clamp(worldForward - uElementalCurveOriginX - uElementalCurveNear, 0.0, uElementalCurveMax);
            }

            vec3 elementalCurveWorldPosition(vec3 worldPosition) {
              float lead = elementalCurveLead(worldPosition.x);
              float lead2 = lead * lead * uElementalCurveStrength;
              float derivative = 2.0 * uElementalCurveX * lead * uElementalCurveStrength;
              float inverseNormalLength = inversesqrt(1.0 + derivative * derivative);
              float lateral = worldPosition.z;
              // Forward is +X in Elemental Run. This is the standard runner
              // formula x/z_offset = curve * distance^2, adapted to our axes.
              // Moving the lane offset along the centreline normal keeps wide
              // trains and their ramps centred on a curved lane instead of
              // approaching from outside and snapping inward near the player.
              worldPosition.x -= lateral * derivative * inverseNormalLength;
              worldPosition.z = uElementalCurveX * lead2 + lateral * inverseNormalLength;
              worldPosition.y += uElementalCurveY * lead2;
              return worldPosition;
            }

            vec3 elementalCurveSheetPosition(vec3 worldPosition) {
              float lead = elementalCurveLead(worldPosition.x);
              float lead2 = lead * lead * uElementalCurveStrength;
              // Ambient biome sheets span thousands of lateral world units.
              // Rotating that full width around the road tangent folds distant
              // vertices through the camera. Follow the exact road centreline
              // drop/offset while leaving the sheet's lateral basis stable.
              worldPosition.y += uElementalCurveY * lead2;
              worldPosition.z += uElementalCurveX * lead2;
              return worldPosition;
            }

            void elementalCurveFrame(float worldForward, out vec3 tangent, out vec3 up, out vec3 side) {
              float lead = elementalCurveLead(worldForward);
              float dyDx = 2.0 * uElementalCurveY * lead * uElementalCurveStrength;
              float dzDx = 2.0 * uElementalCurveX * lead * uElementalCurveStrength;
              tangent = normalize(vec3(1.0, dyDx, dzDx));
              side = normalize(vec3(-dzDx, 0.0, 1.0));
              up = normalize(cross(side, tangent));
            }

            vec3 elementalCurveSplinePosition(vec3 worldPosition) {
              float lead = elementalCurveLead(worldPosition.x);
              float lead2 = lead * lead * uElementalCurveStrength;
              vec3 tangent;
              vec3 up;
              vec3 side;
              elementalCurveFrame(worldPosition.x, tangent, up, side);
              vec3 centre = vec3(
                worldPosition.x,
                uElementalCurveBaseY + uElementalCurveY * lead2,
                uElementalCurveX * lead2
              ) + side * uElementalCurveCenterZ;
              return centre
                + up * (worldPosition.y - uElementalCurveBaseY)
                + side * (worldPosition.z - uElementalCurveCenterZ);
            }

            vec3 elementalCurveSplineDirection(vec3 worldDirection, float worldForward) {
              vec3 tangent;
              vec3 up;
              vec3 side;
              elementalCurveFrame(worldForward, tangent, up, side);
              return normalize(
                tangent * worldDirection.x
                + up * worldDirection.y
                + side * worldDirection.z
              );
            }

            vec3 elementalCurveRigidPosition(vec3 worldPosition, vec3 pivotWorldPosition) {
              float lead = elementalCurveLead(pivotWorldPosition.x);
              float lead2 = lead * lead * uElementalCurveStrength;
              vec3 tangent;
              vec3 up;
              vec3 side;
              elementalCurveFrame(pivotWorldPosition.x, tangent, up, side);
              vec3 curvedPivot = vec3(
                pivotWorldPosition.x,
                pivotWorldPosition.y + uElementalCurveY * lead2,
                uElementalCurveX * lead2
              ) + side * pivotWorldPosition.z;
              vec3 relative = worldPosition - pivotWorldPosition;
              return curvedPivot + tangent * relative.x + up * relative.y + side * relative.z;
            }

            vec3 elementalCurveRigidNormal(vec3 worldNormal, vec3 pivotWorldPosition) {
              vec3 tangent;
              vec3 up;
              vec3 side;
              elementalCurveFrame(pivotWorldPosition.x, tangent, up, side);
              return normalize(tangent * worldNormal.x + up * worldNormal.y + side * worldNormal.z);
            }
            void main() {
          `);

          // MeshStandard/Phong/Lambert materials need the inverse-transpose
          // derivative of the bend. Without this, building faces keep their
          // straight-world normals while their vertices move; lighting crawls
          // across the window texture and looks like texture corruption.
          if (shader.vertexShader.includes('#include <defaultnormal_vertex>')) {
            shader.vertexShader = shader.vertexShader.replace('#include <defaultnormal_vertex>', `
              #include <defaultnormal_vertex>
              vec4 elementalNormalLocalPosition = vec4(position, 1.0);
              vec4 elementalNormalPivotLocal = vec4(0.0, 0.0, 0.0, 1.0);
              #ifdef USE_BATCHING
                elementalNormalLocalPosition = batchingMatrix * elementalNormalLocalPosition;
                elementalNormalPivotLocal = batchingMatrix * elementalNormalPivotLocal;
              #endif
              #ifdef USE_INSTANCING
                elementalNormalLocalPosition = instanceMatrix * elementalNormalLocalPosition;
                elementalNormalPivotLocal = instanceMatrix * elementalNormalPivotLocal;
              #endif
              vec3 elementalNormalWorldPosition = (modelMatrix * elementalNormalLocalPosition).xyz;
              vec3 elementalNormalPivotWorldPosition = (modelMatrix * elementalNormalPivotLocal).xyz;
              float elementalNormalLead = elementalCurveLead(elementalNormalWorldPosition.x);
              float elementalDyDx = 2.0 * uElementalCurveY * elementalNormalLead * uElementalCurveStrength;
              float elementalDzDx = 2.0 * uElementalCurveX * elementalNormalLead * uElementalCurveStrength;
              mat3 elementalViewToWorld = mat3(
                vec3(viewMatrix[0][0], viewMatrix[1][0], viewMatrix[2][0]),
                vec3(viewMatrix[0][1], viewMatrix[1][1], viewMatrix[2][1]),
                vec3(viewMatrix[0][2], viewMatrix[1][2], viewMatrix[2][2])
              );
              vec3 elementalWorldNormal = normalize(elementalViewToWorld * transformedNormal);
              ${rigidPivotMode ? `
                // Buildings/vehicles are transformed as one rigid frame around
                // their object or instance pivot. Their opposite edges therefore
                // keep the same distance and their UVs cannot stretch on the
                // outside of a left/right bend.
                elementalWorldNormal = elementalCurveRigidNormal(
                  elementalWorldNormal,
                  elementalNormalPivotWorldPosition
                );
              ` : (splineMeshMode ? `
                elementalWorldNormal = elementalCurveSplineDirection(
                  elementalWorldNormal,
                  elementalNormalWorldPosition.x
                );
              ` : `
                elementalWorldNormal = normalize(vec3(
                  elementalWorldNormal.x - elementalDyDx * elementalWorldNormal.y - elementalDzDx * elementalWorldNormal.z,
                  elementalWorldNormal.y,
                  elementalWorldNormal.z
                ));
              `)}
              transformedNormal = normalize(mat3(viewMatrix) * elementalWorldNormal);
              #ifdef USE_TANGENT
                vec3 elementalWorldTangent = normalize(elementalViewToWorld * transformedTangent);
                ${splineMeshMode ? `
                  elementalWorldTangent = elementalCurveSplineDirection(
                    elementalWorldTangent,
                    elementalNormalWorldPosition.x
                  );
                ` : (rigidPivotMode ? `
                  elementalWorldTangent = elementalCurveRigidNormal(
                    elementalWorldTangent,
                    elementalNormalPivotWorldPosition
                  );
                ` : `
                  elementalWorldTangent = normalize(vec3(
                    elementalWorldTangent.x - elementalDyDx * elementalWorldTangent.y - elementalDzDx * elementalWorldTangent.z,
                    elementalWorldTangent.y,
                    elementalWorldTangent.z
                  ));
                `)}
                transformedTangent = normalize(mat3(viewMatrix) * elementalWorldTangent);
              #endif
            `);
          }
          shader.vertexShader = shader.vertexShader.replace('#include <project_vertex>', `
            vec4 elementalLocal = vec4(transformed, 1.0);
            vec4 elementalPivotLocal = vec4(0.0, 0.0, 0.0, 1.0);
            #ifdef USE_BATCHING
              elementalLocal = batchingMatrix * elementalLocal;
              elementalPivotLocal = batchingMatrix * elementalPivotLocal;
            #endif
            #ifdef USE_INSTANCING
              elementalLocal = instanceMatrix * elementalLocal;
              elementalPivotLocal = instanceMatrix * elementalPivotLocal;
            #endif
            vec4 elementalWorld = modelMatrix * elementalLocal;
            vec3 elementalPivotWorldPosition = (modelMatrix * elementalPivotLocal).xyz;
            elementalWorld.xyz = ${rigidPivotMode
              ? 'elementalCurveRigidPosition(elementalWorld.xyz, elementalPivotWorldPosition)'
              : (splineMeshMode
                ? 'elementalCurveSplinePosition(elementalWorld.xyz)'
                : (ambientSheetMode
                  ? 'elementalCurveSheetPosition(elementalWorld.xyz)'
                  : 'elementalCurveWorldPosition(elementalWorld.xyz)'))};
            vec4 mvPosition = viewMatrix * elementalWorld;
            gl_Position = projectionMatrix * mvPosition;
          `);

          // r185 calculates shadow, transmission, environment and distance-pass
          // coordinates later in <worldpos_vertex>. Reuse the already-bent world
          // position so those effects cannot detach from the visible mesh.
          if (shader.vertexShader.includes('#include <worldpos_vertex>')) {
            shader.vertexShader = shader.vertexShader.replace('#include <worldpos_vertex>', `
              #if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined( USE_SHADOWMAP ) || defined( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
                vec4 worldPosition = elementalWorld;
              #endif
            `);
          }
          this.userData.elementalCurvedPathCompileRevision = 'three-r185.1-project-worldpos-v7';
          delete this.userData.elementalCurvedPathCompileError;
        };
        material.customProgramCacheKey = function elementalCurvedPathCacheKey() {
          const previous = typeof previousCacheKey === 'function' ? previousCacheKey.call(this) : '';
          return `${previous}|elemental-curved-world-r185-v7-${mode}-frenet-frame`;
        };
        material.needsUpdate = true;
      }
    }

    installObjectMaterials(objects, options = {}) {
      const roots = Array.isArray(objects) ? objects : [objects];
      const materials = [];
      const seen = new Set();
      const collect = (material) => {
        if (!material || seen.has(material)) return;
        seen.add(material);
        materials.push(material);
      };
      for (const root of roots) {
        if (!root) continue;
        if (root.material) {
          if (Array.isArray(root.material)) root.material.forEach(collect);
          else collect(root.material);
        }
        if (typeof root.traverse === 'function') {
          root.traverse((child) => {
            if (!child?.material) return;
            if (Array.isArray(child.material)) child.material.forEach(collect);
            else collect(child.material);
          });
        }
      }
      this.installMaterialBend(materials, options);
      return materials.length;
    }

    _getCurvedDepthMaterial(sourceMaterial, options = {}) {
      const source = sourceMaterial || null;
      const requestedMode = typeof options === 'string' ? options : options?.mode;
      const mode = requestedMode === 'rigid'
        ? 'rigid'
        : (requestedMode === 'spline' ? 'spline' : (requestedMode === 'sheet' ? 'sheet' : 'smooth'));
      const depthBaseY = Number(typeof options === 'object' ? options.baseY : 0) || 0;
      const depthCenterZ = Number(typeof options === 'object' ? options.centerZ : 0) || 0;
      const cacheKey = `${mode}|${depthBaseY}|${depthCenterZ}`;
      if (source && this._depthMaterialCache.has(source)) {
        const cachedByMode = this._depthMaterialCache.get(source);
        if (cachedByMode?.has(cacheKey)) return cachedByMode.get(cacheKey);
      }
      const THREE = window.THREE;
      if (!THREE?.MeshDepthMaterial) return null;
      const depth = new THREE.MeshDepthMaterial({
        depthPacking: THREE.RGBADepthPacking,
        side: source?.shadowSide || source?.side || THREE.FrontSide,
        alphaTest: Number(source?.alphaTest) || 0
      });
      if (source?.map && depth.alphaTest > 0) {
        depth.map = source.map;
        depth.alphaMap = source.alphaMap || null;
      }
      this.installMaterialBend([depth], typeof options === 'object' ? { ...options, mode } : { mode });
      this.installedShadowMaterialCount += 1;
      if (source) {
        const cachedByMode = this._depthMaterialCache.get(source) || new Map();
        cachedByMode.set(cacheKey, depth);
        this._depthMaterialCache.set(source, cachedByMode);
      }
      return depth;
    }

    _getCurvedDistanceMaterial(sourceMaterial, options = {}) {
      const source = sourceMaterial || null;
      const requestedMode = typeof options === 'string' ? options : options?.mode;
      const mode = requestedMode === 'rigid'
        ? 'rigid'
        : (requestedMode === 'spline' ? 'spline' : (requestedMode === 'sheet' ? 'sheet' : 'smooth'));
      const distanceBaseY = Number(typeof options === 'object' ? options.baseY : 0) || 0;
      const distanceCenterZ = Number(typeof options === 'object' ? options.centerZ : 0) || 0;
      const cacheKey = `${mode}|${distanceBaseY}|${distanceCenterZ}`;
      if (source && this._distanceMaterialCache.has(source)) {
        const cachedByMode = this._distanceMaterialCache.get(source);
        if (cachedByMode?.has(cacheKey)) return cachedByMode.get(cacheKey);
      }
      const THREE = window.THREE;
      if (!THREE?.MeshDistanceMaterial) return null;
      const distance = new THREE.MeshDistanceMaterial({
        side: source?.shadowSide || source?.side || THREE.FrontSide,
        alphaTest: Number(source?.alphaTest) || 0
      });
      if (source?.map && distance.alphaTest > 0) {
        distance.map = source.map;
        distance.alphaMap = source.alphaMap || null;
      }
      this.installMaterialBend([distance], typeof options === 'object' ? { ...options, mode } : { mode });
      this.installedShadowMaterialCount += 1;
      if (source) {
        const cachedByMode = this._distanceMaterialCache.get(source) || new Map();
        cachedByMode.set(cacheKey, distance);
        this._distanceMaterialCache.set(source, cachedByMode);
      }
      return distance;
    }

    installObjectShadows(objects, options = {}) {
      const roots = Array.isArray(objects) ? objects : [objects];
      let installed = 0;
      for (const root of roots) {
        if (!root?.traverse) continue;
        root.traverse((child) => {
          if (!child?.isMesh || !child.castShadow) return;
          const source = Array.isArray(child.material) ? child.material[0] : child.material;
          const depth = this._getCurvedDepthMaterial(source, options);
          if (!depth) return;
          child.customDepthMaterial = depth;
          const distance = this._getCurvedDistanceMaterial(source, options);
          if (distance) child.customDistanceMaterial = distance;
          installed += 1;
        });
      }
      return installed;
    }

    resolveObstacleCurveMode(type, fallback = 'rigid') {
      return SMOOTH_OBSTACLE_TYPES.has(String(type || '')) ? 'smooth' : fallback;
    }

    installGpuCurvedObject(object, includeShadows = true, options = { mode: 'rigid' }) {
      if (!object) return object;
      this.prepareObjectVisibility(object);
      this.installObjectMaterials(object, options);
      if (includeShadows) this.installObjectShadows(object, options);
      object.userData = object.userData || {};
      object.userData.elementalGpuCurved = true;
      object.userData.elementalCurveMode = typeof options === 'string' ? options : (options?.mode || 'rigid');
      return object;
    }

    prepareObjectVisibility(root) {
      if (!root || this._visibilityPrepared.has(root)) return root;
      root.frustumCulled = false;
      root.traverse?.((child) => {
        if (child?.isMesh || child?.isPoints || child?.isLine || child?.isInstancedMesh) {
          child.frustumCulled = false;
        }
      });
      root.userData = root.userData || {};
      root.userData.elementalCurveCullingStable = true;
      this._visibilityPrepared.add(root);
      return root;
    }

    curveAt(distanceAhead) {
      const dx = Number(distanceAhead) || 0;
      if (!this.enabled || dx <= this.nearStraight) {
        return { offset: 0, drop: 0, yaw: 0, pitch: 0, derivative: 0, normalLength: 1 };
      }
      const lead = Math.min(this.maxCurveDistance, Math.max(0, dx - this.nearStraight));
      const horizontal = this.horizontalStrength * this.strength;
      const offset = this.direction * horizontal * lead * lead;
      const drop = -(lead * lead) / (2 * this.sphereRadius) * this.strength;
      const derivative = this.direction * 2 * horizontal * lead;
      const verticalDerivative = -(lead / this.sphereRadius) * this.strength;
      const normalLength = Math.hypot(1, derivative) || 1;
      const yaw = Math.atan(derivative);
      const pitch = Math.atan(verticalDerivative);
      return { offset, drop, yaw, pitch, derivative, normalLength };
    }

    frameAt(distanceAhead) {
      const curve = this.curveAt(distanceAhead);
      const dy = Math.tan(curve.pitch);
      const dz = curve.derivative;
      const tangentLength = Math.hypot(1, dy, dz) || 1;
      const sideLength = Math.hypot(1, dz) || 1;
      const tangent = { x: 1 / tangentLength, y: dy / tangentLength, z: dz / tangentLength };
      // Forward is +X and the logical lane axis is +Z. tangent x world-up
      // yields a stable, non-flipping lane-right vector for this runner path.
      const side = { x: -dz / sideLength, y: 0, z: 1 / sideLength };
      const up = {
        x: -side.z * tangent.y,
        y: side.z * tangent.x - side.x * tangent.z,
        z: side.x * tangent.y
      };
      const upLength = Math.hypot(up.x, up.y, up.z) || 1;
      up.x /= upLength;
      up.y /= upLength;
      up.z /= upLength;
      return { curve, tangent, up, side };
    }

    splinePointAt(distanceAhead, lateral = 0, vertical = 0, baseY = 0, centerZ = 0) {
      const dx = Number(distanceAhead) || 0;
      const frame = this.frameAt(dx);
      const localSide = (Number(lateral) || 0) - (Number(centerZ) || 0);
      const localUp = (Number(vertical) || 0) - (Number(baseY) || 0);
      const centreSide = Number(centerZ) || 0;
      return {
        forward: dx + frame.side.x * centreSide + frame.side.x * localSide + frame.up.x * localUp,
        vertical: (Number(baseY) || 0) + frame.curve.drop
          + frame.side.y * centreSide + frame.side.y * localSide + frame.up.y * localUp,
        lateral: frame.curve.offset + frame.side.z * centreSide
          + frame.side.z * localSide + frame.up.z * localUp,
        yaw: frame.curve.yaw,
        pitch: frame.curve.pitch,
        tangent: frame.tangent,
        up: frame.up,
        side: frame.side
      };
    }

    pointAt(distanceAhead, lateral = 0) {
      const point = this.splinePointAt(distanceAhead, lateral, 0, 0, 0);
      return {
        // Visual lanes use centreline + laneOffset * normal. Physics and
        // hitboxes remain in the corresponding straight logical lane.
        forward: point.forward,
        lateral: point.lateral,
        vertical: point.vertical,
        yaw: point.yaw,
        pitch: point.pitch
      };
    }

    // Allocation-free equivalent of splinePointAt(). Public helpers keep their
    // original return-object semantics; hot render paths write into one stable
    // result object. The scalar equations intentionally mirror curveAt() and
    // frameAt() exactly so CPU rigid objects still match the GPU shader.
    splinePointAtInto(distanceAhead, lateral = 0, vertical = 0, baseY = 0, centerZ = 0, out = this._splineScratch) {
      const dx = Number(distanceAhead) || 0;
      const curved = this.enabled && dx > this.nearStraight;
      const lead = curved ? Math.min(this.maxCurveDistance, Math.max(0, dx - this.nearStraight)) : 0;
      const strength = curved ? this.strength : 0;
      const horizontal = this.horizontalStrength * strength;
      const offset = curved ? this.direction * horizontal * lead * lead : 0;
      const drop = curved ? -(lead * lead) / (2 * this.sphereRadius) * strength : 0;
      const derivative = curved ? this.direction * 2 * horizontal * lead : 0;
      const verticalDerivative = curved ? -(lead / this.sphereRadius) * strength : 0;
      const yaw = Math.atan(derivative);
      const pitch = Math.atan(verticalDerivative);
      // Keep exact parity with frameAt(): tan(atan(verticalDerivative)). This
      // matters when rigid CPU-curved props are compared with the shader path.
      const dy = Math.tan(pitch);
      const dz = derivative;
      const tangentLength = Math.hypot(1, dy, dz) || 1;
      const sideLength = Math.hypot(1, dz) || 1;
      const tangentX = 1 / tangentLength;
      const tangentY = dy / tangentLength;
      const tangentZ = dz / tangentLength;
      const sideX = -dz / sideLength;
      const sideZ = 1 / sideLength;
      let upX = -sideZ * tangentY;
      let upY = sideZ * tangentX - sideX * tangentZ;
      let upZ = sideX * tangentY;
      const upLength = Math.hypot(upX, upY, upZ) || 1;
      upX /= upLength;
      upY /= upLength;
      upZ /= upLength;

      const localSide = (Number(lateral) || 0) - (Number(centerZ) || 0);
      const localUp = (Number(vertical) || 0) - (Number(baseY) || 0);
      const centreSide = Number(centerZ) || 0;
      out.forward = dx + sideX * centreSide + sideX * localSide + upX * localUp;
      out.vertical = (Number(baseY) || 0) + drop + upY * localUp;
      out.lateral = offset + sideZ * centreSide + sideZ * localSide + upZ * localUp;
      out.yaw = yaw;
      out.pitch = pitch;
      out.tangent.x = tangentX;
      out.tangent.y = tangentY;
      out.tangent.z = tangentZ;
      out.up.x = upX;
      out.up.y = upY;
      out.up.z = upZ;
      out.side.x = sideX;
      out.side.y = 0;
      out.side.z = sideZ;
      this._scratchEvaluations += 1;
      return out;
    }

    pointAtInto(distanceAhead, lateral = 0, out = this._splineScratch) {
      return this.splinePointAtInto(distanceAhead, lateral, 0, 0, 0, out);
    }

    finalizeProceduralGeometry(geometry, options = {}) {
      if (!geometry?.attributes?.position) return geometry;
      geometry.computeVertexNormals?.();
      if (typeof geometry.computeTangents === 'function'
          && geometry.index
          && geometry.attributes.normal
          && geometry.attributes.uv) {
        try { geometry.computeTangents(); } catch (error) {
          // Tangents are optional unless a normal map is present. Keep the
          // correctly recalculated normals instead of failing the whole mesh.
        }
      }
      geometry.computeBoundingBox?.();
      geometry.computeBoundingSphere?.();
      geometry.userData = geometry.userData || {};
      geometry.userData.elementalNormalsReady = !!geometry.attributes.normal;
      geometry.userData.elementalTangentsReady = !!geometry.attributes.tangent;
      geometry.userData.elementalBoundsReady = !!geometry.boundingBox && !!geometry.boundingSphere;
      geometry.userData.elementalCurveSegmentLength = Number(options.segmentLength) || 0;
      return geometry;
    }

    stabilizeObjectBounds(root, options = {}) {
      if (!root?.traverse) return null;
      const THREE = window.THREE;
      if (!THREE?.Box3 || !THREE?.Sphere) return null;
      root.updateMatrixWorld?.(true);
      root.traverse((child) => {
        if (!(child?.isMesh || child?.isPoints || child?.isLine)) return;
        child.geometry?.computeBoundingBox?.();
        child.geometry?.computeBoundingSphere?.();
        child.computeBoundingBox?.();
        child.computeBoundingSphere?.();
        // GPU deformation can move a tunnel well outside its straight-world
        // source sphere. Stable conservative bounds are stored below; disabling
        // per-child frustum tests prevents both the colour and depth pass from
        // dropping a curved section for one frame.
        child.frustumCulled = false;
      });
      const box = new THREE.Box3().setFromObject(root);
      const maxOffset = Math.abs(this.horizontalStrength * this.maxCurveDistance * this.maxCurveDistance)
        + Math.max(0, Number(options.lateralPadding) || 0);
      const maxDrop = (this.maxCurveDistance * this.maxCurveDistance) / (2 * this.sphereRadius)
        + Math.max(0, Number(options.verticalPadding) || 0);
      box.min.x -= 40;
      box.max.x += 40;
      box.min.y -= maxDrop;
      box.max.y += Math.max(20, Number(options.verticalPadding) || 0);
      box.min.z -= maxOffset;
      box.max.z += maxOffset;
      const sphere = box.getBoundingSphere(new THREE.Sphere());
      root.userData = root.userData || {};
      root.userData.elementalStableCurveBounds = {
        min: box.min.toArray(),
        max: box.max.toArray(),
        center: sphere.center.toArray(),
        radius: sphere.radius,
        fixed: true
      };
      return root.userData.elementalStableCurveBounds;
    }

    applyObjects(objects, playerX) {
      this.restoreObjects();
      if (!this.enabled || !Array.isArray(objects)) return;
      const seen = this._frameSeenObjects;
      seen.clear();
      for (const object of objects) {
        if (!object || !object.position || seen.has(object)) continue;
        seen.add(object);
        // Shader/CPU bending can move a visible mesh far outside the straight
        // CPU-side bounding sphere. Prepare each root once so colour and shadow
        // passes cannot independently cull it on a curve.
        this.prepareObjectVisibility(object);
        if (object.visible === false) continue;
        if (object.userData?.elementalGpuCurved) continue;
        const distance = object.position.x - playerX;
        // Match the GPU shader: after the maximum curve distance the shader
        // keeps using its clamped final frame. The old upper-bound early-out
        // left far towers/clouds straight while nearer scenery was curved, so
        // crossing the threshold looked like a random lateral teleport.
        if (distance <= this.nearStraight) continue;
        const point = this.pointAtInto(distance, object.position.z, this._splineScratch);
        const contactSpan = Math.max(0, Number(object.userData?.elementalCurveGroundSpan) || 0);
        const maxContactEmbed = Math.max(0, Number(object.userData?.elementalCurveGroundMaxEmbed) || 0);
        // A rigid footprint is tangent to a curved road only at its pivot. Sink
        // the visual root by the curve sagitta so its outer corners cannot hover
        // above the shader-bent surface. Logical colliders remain straight.
        const groundContactEmbed = contactSpan > 0 && maxContactEmbed > 0
          ? Math.min(maxContactEmbed, (contactSpan * contactSpan) / (8 * this.sphereRadius) * this.strength)
          : 0;
        const slotIndex = this.activeTransforms.length;
        let saved = this._transformPool[slotIndex];
        if (!saved) {
          saved = { object: null, x: 0, y: 0, z: 0, rx: 0, ry: 0, rz: 0 };
          this._transformPool.push(saved);
        }
        saved.object = object;
        saved.x = object.position.x;
        saved.y = object.position.y;
        saved.z = object.position.z;
        saved.rx = object.rotation?.x || 0;
        saved.ry = object.rotation?.y || 0;
        saved.rz = object.rotation?.z || 0;
        this.activeTransforms.push(saved);
        object.position.x = playerX + point.forward;
        object.position.y += point.vertical
          - Math.max(0, Number(object.userData?.elementalCurveGroundEmbed) || 0)
          - groundContactEmbed;
        object.position.z = point.lateral;
        if (object.rotation && !object.userData?.elementalCurveKeepUpright) {
          // Three.js positive Y rotation turns local +X toward -Z. The road
          // derivative is +Z/+X, therefore the visual yaw uses the opposite
          // sign. Using +yaw made barriers and long vehicles appear to turn
          // against the road by themselves.
          object.rotation.y -= point.yaw;
          object.rotation.z += point.pitch;
        }
        this.lastOffset = point.lateral;
        this.lastDrop = point.vertical;
        this.lastYaw = point.yaw;
        this.lastPitch = point.pitch;
      }
      this._peakFrameTransforms = Math.max(this._peakFrameTransforms, this.activeTransforms.length);
    }

    restoreObjects() {
      for (let i = this.activeTransforms.length - 1; i >= 0; i--) {
        const saved = this.activeTransforms[i];
        if (!saved.object?.position) continue;
        saved.object.position.x = saved.x;
        saved.object.position.y = saved.y;
        saved.object.position.z = saved.z;
        if (saved.object.rotation) saved.object.rotation.set(saved.rx, saved.ry, saved.rz);
      }
      this.activeTransforms.length = 0;
    }

    deformRoad(mesh, playerX) {
      const geometry = mesh?.geometry;
      const position = geometry?.attributes?.position;
      if (!position) return;
      if (!geometry.userData.elementalStraightPositions) {
        geometry.userData.elementalStraightPositions = new Float32Array(position.array);
        this.finalizeProceduralGeometry(geometry, { segmentLength: 1500 / 96 });
        const THREE = window.THREE;
        if (THREE?.Box3 && THREE?.Sphere && geometry.boundingBox) {
          const fixedBox = geometry.boundingBox.clone();
          const maxOffset = Math.abs(this.horizontalStrength * this.maxCurveDistance * this.maxCurveDistance) + 32;
          const maxDrop = (this.maxCurveDistance * this.maxCurveDistance) / (2 * this.sphereRadius) + 18;
          // PlaneGeometry is rotated -90deg: local Y is world lateral, local Z
          // is world vertical. Keep one conservative box for the mesh's whole
          // lifetime; changing procedural bounds made shadow/frustum tests pop.
          fixedBox.min.x -= 40;
          fixedBox.max.x += 40;
          fixedBox.min.y -= maxOffset;
          fixedBox.max.y += maxOffset;
          fixedBox.min.z -= maxDrop;
          fixedBox.max.z += 18;
          geometry.userData.elementalStableBoundingBox = fixedBox;
          geometry.userData.elementalStableBoundingSphere = fixedBox.getBoundingSphere(new THREE.Sphere());
        }
      }
      const base = geometry.userData.elementalStraightPositions;
      const meshX = mesh.position?.x || 0;
      const normal = geometry.attributes.normal;
      const tangent = geometry.attributes.tangent;
      for (let i = 0; i < position.count; i++) {
        const localX = base[i * 3];
        const lateral = -base[i * 3 + 1];
        const worldX = meshX + localX;
        const point = this.splinePointAtInto(worldX - playerX, lateral, 0, 0, 0, this._splineScratch);
        position.array[i * 3] = playerX + point.forward - meshX;
        // PlaneGeometry rotates -90 degrees around X: local -Y becomes world
        // +Z and local Z becomes world +Y.
        position.array[i * 3 + 1] = -point.lateral;
        position.array[i * 3 + 2] = base[i * 3 + 2] + point.vertical;

        // PlaneGeometry is rotated -90 degrees around X at the Mesh. Convert
        // the spline frame from world space back to the geometry's local space:
        // world(x,y,z) -> local(x,-z,y). These analytic normals/tangents are
        // stable across segment boundaries and do not change according to
        // triangle evaluation order, preventing one-frame asphalt highlights.
        if (normal) {
          normal.array[i * 3] = point.up.x;
          normal.array[i * 3 + 1] = -point.up.z;
          normal.array[i * 3 + 2] = point.up.y;
        }
        if (tangent) {
          tangent.array[i * 4] = point.tangent.x;
          tangent.array[i * 4 + 1] = -point.tangent.z;
          tangent.array[i * 4 + 2] = point.tangent.y;
          tangent.array[i * 4 + 3] = 1;
        }
      }
      position.needsUpdate = true;
      if (normal) normal.needsUpdate = true;
      if (tangent) tangent.needsUpdate = true;
      const fixedBox = geometry.userData.elementalStableBoundingBox;
      const fixedSphere = geometry.userData.elementalStableBoundingSphere;
      if (fixedBox) geometry.boundingBox = fixedBox;
      if (fixedSphere) geometry.boundingSphere = fixedSphere;
      geometry.userData.elementalNormalsReady = !!geometry.attributes.normal;
      geometry.userData.elementalTangentsReady = !!geometry.attributes.tangent;
      geometry.userData.elementalAnalyticFramesReady = !!normal;
      geometry.userData.elementalBoundsReady = !!fixedBox && !!fixedSphere;
    }

    updateLaneBatch(batch, entries, playerX, dummy) {
      if (!batch || !Array.isArray(entries) || !dummy) return;
      dummy.scale.set(1, 1, 1);
      for (let index = 0; index < entries.length; index++) {
        const entry = entries[index];
        const logicalWorldX = (batch.position.x || 0) + entry.x;
        const point = this.pointAtInto(logicalWorldX - playerX, entry.z, this._splineScratch);
        dummy.position.set(playerX + point.forward - (batch.position.x || 0), entry.y + point.vertical, point.lateral);
        dummy.rotation.set(-Math.PI / 2, point.yaw, point.pitch);
        dummy.updateMatrix();
        batch.setMatrixAt(index, dummy.matrix);
      }
      batch.instanceMatrix.needsUpdate = true;
    }

    updateSegmentedGroup(group, playerX, dummy) {
      const sets = group?.userData?.curvedPathInstanceSets;
      if (!Array.isArray(sets) || !dummy) return;
      for (const set of sets) {
        const mesh = set?.mesh;
        const entries = set?.entries;
        if (!mesh || !Array.isArray(entries)) continue;
        for (let index = 0; index < entries.length; index++) {
          const entry = entries[index];
          const worldX = (group.position.x || 0) + entry.x;
          const logicalLateral = (group.position.z || 0) + (entry.z || 0);
          const point = this.pointAtInto(worldX - playerX, logicalLateral, this._splineScratch);
          dummy.position.set(
            playerX + point.forward - (group.position.x || 0),
            entry.y + point.vertical,
            point.lateral - (group.position.z || 0)
          );
          dummy.rotation.set(entry.rx || 0, (entry.ry || 0) - point.yaw, (entry.rz || 0) + point.pitch);
          dummy.scale.set(entry.sx || 1, entry.sy || 1, entry.sz || 1);
          dummy.updateMatrix();
          mesh.setMatrixAt(index, dummy.matrix);
        }
        mesh.instanceMatrix.needsUpdate = true;
      }
    }

    snapshot() {
      return {
        enabled: this.enabled,
        state: this.state,
        direction: this.targetDirection < 0 ? 'left' : (this.targetDirection > 0 ? 'right' : 'straight'),
        directionBlend: Number(this.direction.toFixed(3)),
        section: this.section,
        stateStartScore: Math.round(this.stateStartScore),
        nextTransitionScore: Math.round(this.nextTransitionScore),
        scoreUntilTransition: Math.max(0, Math.round(this.nextTransitionScore - this.currentScore)),
        transitionCount: this.transitionCount,
        strength: Number(this.strength.toFixed(3)),
        nearStraight: this.nearStraight,
        fullCurveDistance: this.fullCurveDistance,
        maxCurveDistance: this.maxCurveDistance,
        horizontalStrength: this.horizontalStrength,
        sphereRadius: this.sphereRadius,
        originX: Number(this.shaderUniforms.originX.value.toFixed(3)),
        maxVisualDelta: Number(this.maxVisualDelta.toFixed(5)),
        lastVisualDelta: Number(this.lastVisualDelta.toFixed(5)),
        installedMaterials: this.installedMaterialCount,
        installedShadowMaterials: this.installedShadowMaterialCount,
        installedMaterialModes: { ...this.installedMaterialModes },
        horizonOffset: Number(Math.abs(this.curveAt(this.fullCurveDistance).offset).toFixed(2)),
        horizonDrop: Number(Math.abs(this.curveAt(this.fullCurveDistance).drop).toFixed(2)),
        horizonYaw: Number(Math.abs(this.curveAt(this.fullCurveDistance).yaw).toFixed(4)),
        renderedObjects: this.activeTransforms.length,
        allocationReuse: {
          transformPoolCapacity: this._transformPool.length,
          peakFrameTransforms: this._peakFrameTransforms,
          scratchEvaluations: this._scratchEvaluations,
          reusableSeenSet: true,
          reusableSplineFrame: true
        },
        lastOffset: Number(this.lastOffset.toFixed(2)),
        lastDrop: Number(this.lastDrop.toFixed(2)),
        lastYaw: Number(this.lastYaw.toFixed(4)),
        lastPitch: Number(this.lastPitch.toFixed(4))
      };
    }
  }

  Object.defineProperty(window, 'ElementalCurvedPathSystem', {
    value: new ElementalCurvedPathSystem(),
    configurable: false,
    enumerable: false,
    writable: false
  });
})();
