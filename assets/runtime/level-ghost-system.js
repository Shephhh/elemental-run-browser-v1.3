(function () {
  'use strict';

  const LANES = Object.freeze([-10.5, -3.5, 3.5, 10.5]);

  const GHOST_CONFIGS = Object.freeze({
    gold: {
      id: 'gold',
      color: 0xffd365,
      glowColor: 0xffc844,
      opacity: 0.28,
      cadence: 12.8,
      lanes: [0, 1, 2, 1, 0, 2, 3, 2, 1, 0, 3, 1],
      interval: 2.9,
      transition: 0.72
    },
    silver: {
      id: 'silver',
      color: 0xe5f0ff,
      glowColor: 0x99ccff,
      opacity: 0.24,
      cadence: 8.5,
      lanes: [3, 2, 1, 2, 3, 2, 1, 0, 1, 2, 3],
      interval: 4.4,
      transition: 0.85
    },
    bronze: {
      id: 'bronze',
      color: 0xc88863,
      glowColor: 0xcc7744,
      opacity: 0.24,
      cadence: 6.6,
      lanes: [2, 1, 2, 3, 2, 1, 2, 0, 1, 2],
      interval: 5.8,
      transition: 0.95
    }
  });

  // Cosmetic competitors only. Their X coordinates live in the same straight
  // logical world as the runner; the curved-world renderer bends their roots.
  class LevelGhostSystem {
    constructor() {
      this.scene = null;
      this.ghosts = [];
      this.renderRoots = [];
      this.startVirtualX = 0;
      this.courseDistance = 0;
      this.raceTimes = null;
      this.active = false;
      this.bodyGeometry = null;
      this.bodyEdges = null;
      this.handGeometry = null;
    }

    makeHandGeometry(THREE) {
      const shape = new THREE.Shape();
      shape.moveTo(-0.16, -0.26);
      shape.lineTo(-0.21, 0.08);
      shape.quadraticCurveTo(-0.23, 0.16, -0.16, 0.18);
      shape.lineTo(-0.11, 0.15);
      shape.lineTo(-0.11, 0.37);
      shape.quadraticCurveTo(-0.10, 0.44, -0.05, 0.44);
      shape.quadraticCurveTo(0, 0.44, 0, 0.36);
      shape.lineTo(0, 0.15);
      shape.lineTo(0.035, 0.44);
      shape.quadraticCurveTo(0.045, 0.50, 0.095, 0.49);
      shape.quadraticCurveTo(0.14, 0.48, 0.13, 0.42);
      shape.lineTo(0.10, 0.13);
      shape.lineTo(0.18, 0.37);
      shape.quadraticCurveTo(0.21, 0.43, 0.25, 0.40);
      shape.quadraticCurveTo(0.29, 0.38, 0.26, 0.32);
      shape.lineTo(0.17, 0.07);
      shape.lineTo(0.22, -0.25);
      shape.closePath();
      const geometry = new THREE.ExtrudeGeometry(shape, { depth: 0.09, bevelEnabled: true, bevelSegments: 1, steps: 1, bevelSize: 0.025, bevelThickness: 0.025, curveSegments: 2 });
      geometry.computeVertexNormals();
      return geometry;
    }

    start(THREE, scene, level, playerX, worldScrollX, roadY) {
      this.stop();
      if (!THREE || !scene || !level) return;
      this.scene = scene;
      this.active = true;
      this.startVirtualX = playerX + worldScrollX;
      // The runner advances at RUNNER_FRAME_BASELINE=120 units per speed-second,
      // while score advances at SCORE_RATE_PER_SPEED=46. Keep the race endpoint
      // in the same logical distance scale as the real finish gate.
      this.courseDistance = level.targetScore * (120 / 46) + (level.finishLead || 190);
      this.raceTimes = level.ghostTimes;

      // Full runner proportions: width 2.1, height 3.1, depth 1.8
      this.bodyGeometry ||= new THREE.BoxGeometry(2.1, 3.1, 1.8);
      this.bodyEdges ||= new THREE.EdgesGeometry(this.bodyGeometry);
      this.handGeometry ||= this.makeHandGeometry(THREE);

      const presetKeys = ['gold', 'silver', 'bronze'];
      for (const key of presetKeys) {
        const cfg = GHOST_CONFIGS[key];
        const startLaneZ = LANES[cfg.lanes[0]];
        const root = new THREE.Group();
        root.name = `level-ghost-${cfg.id}`;
        root.userData.levelGhost = true;
        root.position.set(playerX, roadY + 2.5, startLaneZ);

        const material = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: cfg.opacity,
          depthWrite: false,
          side: THREE.FrontSide
        });
        const handMaterial = new THREE.MeshBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: cfg.opacity + 0.12,
          depthWrite: false,
          side: THREE.DoubleSide
        });
        const body = new THREE.Mesh(this.bodyGeometry, material);
        body.renderOrder = 2;
        root.add(body);

        const edgeMaterial = new THREE.LineBasicMaterial({
          color: cfg.color,
          transparent: true,
          opacity: cfg.opacity + 0.14,
          depthWrite: false
        });
        const edges = new THREE.LineSegments(this.bodyEdges, edgeMaterial);
        edges.renderOrder = 3;
        root.add(edges);

        const hands = [];
        for (const side of [-1, 1]) {
          const hand = new THREE.Mesh(this.handGeometry, handMaterial);
          hand.position.set(0.38, -0.30, side * 1.52);
          hand.scale.setScalar(1.85);
          hand.rotation.y = Math.PI * 0.5 + side * 0.2;
          hand.renderOrder = 2;
          root.add(hand);
          hands.push(hand);
        }

        let glow = null;
        if (cfg.id === 'gold') {
          glow = new THREE.Mesh(this.bodyGeometry, new THREE.ShaderMaterial({
            uniforms: { glowColor: { value: new THREE.Color(cfg.glowColor) }, pulse: { value: 0 } },
            vertexShader: 'varying vec3 vNormal; varying vec3 vView; void main(){ vec4 viewPos=modelViewMatrix*vec4(position,1.0); vNormal=normalize(normalMatrix*normal); vView=normalize(-viewPos.xyz); gl_Position=projectionMatrix*viewPos; }',
            fragmentShader: 'uniform vec3 glowColor; uniform float pulse; varying vec3 vNormal; varying vec3 vView; void main(){ float edge=pow(1.0-abs(dot(normalize(vNormal),normalize(vView))),2.0); gl_FragColor=vec4(glowColor,edge*(0.24+0.08*sin(pulse))); }',
            transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide
          }));
          glow.scale.setScalar(1.14);
          glow.renderOrder = 3;
          root.add(glow);
        }

        root.traverse((object) => {
          object.castShadow = false;
          object.receiveShadow = false;
          object.frustumCulled = false;
        });
        scene.add(root);
        this.ghosts.push({
          id: cfg.id,
          config: cfg,
          root,
          hands,
          body,
          material,
          handMaterial,
          edgeMaterial,
          glow,
          z: startLaneZ
        });
        this.renderRoots.push(root);
      }
    }

    calculateLanePosition(t, cfg) {
      const { lanes, interval, transition } = cfg;
      const step = Math.floor(t / interval);
      const curIdx = lanes[step % lanes.length];
      const nextIdx = lanes[(step + 1) % lanes.length];
      const local = t % interval;
      const stayTime = interval - transition;
      if (local < stayTime) {
        return { z: LANES[curIdx], bank: 0 };
      }
      const u = (local - stayTime) / transition;
      const smooth = u * u * (3 - 2 * u);
      const z = LANES[curIdx] + (LANES[nextIdx] - LANES[curIdx]) * smooth;
      const dir = Math.sign(LANES[nextIdx] - LANES[curIdx]);
      const bank = dir * Math.sin(u * Math.PI) * 0.16;
      return { z, bank };
    }

    update(elapsed, playerX, worldScrollX, roadY) {
      if (!this.active || !this.raceTimes) return;
      const t = Math.max(0, elapsed || 0);
      for (const ghost of this.ghosts) {
        const duration = this.raceTimes[ghost.id];
        const progress = Math.min(1, t / duration);
        ghost.root.visible = progress < 1;
        ghost.root.position.x = this.startVirtualX + this.courseDistance * progress - worldScrollX;

        // Dynamic racer lane switching across LANES
        const laneState = this.calculateLanePosition(t, ghost.config);
        ghost.root.position.z = laneState.z;
        ghost.z = laneState.z;

        const cycle = t * ghost.config.cadence;
        const hop = ghost.id === 'gold'
          ? Math.pow(Math.max(0, Math.sin(cycle)), 1.2) * 0.72
          : Math.sin(cycle * 2) * 0.055;
        ghost.root.position.y = roadY + 2.5 + hop;

        // Running roll/banking when changing lanes
        ghost.body.rotation.z = Math.sin(cycle) * (ghost.id === 'gold' ? 0.045 : 0.025) - laneState.bank;
        ghost.body.rotation.y = laneState.bank * 0.8;

        // Arm swing rhythm
        ghost.hands[0].position.y = -0.30 + Math.sin(cycle) * 0.22;
        ghost.hands[1].position.y = -0.30 - Math.sin(cycle) * 0.22;
        ghost.hands[0].position.x = 0.38 + Math.cos(cycle) * 0.18;
        ghost.hands[1].position.x = 0.38 - Math.cos(cycle) * 0.18;

        if (ghost.glow) ghost.glow.material.uniforms.pulse.value = t * 3.5;
      }
    }

    roots() { return this.renderRoots; }

    snapshot(elapsed) {
      if (!this.active || !this.raceTimes) return { active: false };
      return {
        active: true,
        times: this.raceTimes,
        progress: Object.fromEntries(this.ghosts.map((ghost) => [ghost.id, Math.min(1, Math.max(0, elapsed / this.raceTimes[ghost.id]))])),
        x: Object.fromEntries(this.ghosts.map((ghost) => [ghost.id, Math.round(ghost.root.position.x * 10) / 10])),
        z: Object.fromEntries(this.ghosts.map((ghost) => [ghost.id, Math.round(ghost.root.position.z * 10) / 10]))
      };
    }

    stop() {
      for (const ghost of this.ghosts) {
        ghost.root.parent?.remove(ghost.root);
        ghost.material.dispose();
        ghost.handMaterial.dispose();
        ghost.edgeMaterial.dispose();
        ghost.glow?.material.dispose();
      }
      this.ghosts.length = 0;
      this.renderRoots.length = 0;
      this.active = false;
      this.scene = null;
      this.raceTimes = null;
    }
  }

  window.ElementalLevelGhostSystem = LevelGhostSystem;
})();
