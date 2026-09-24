(function () {
  'use strict';

  // Isolated straight-world scene. The runner supplies business operations;
  // this module owns only lobby geometry, input, presentation and movement.
  class LobbyHub {
    constructor(THREE, api) {
      this.T = THREE; this.api = api; this.active = false; this.visited = false;
      this.mobile = api.mobile || window.matchMedia('(pointer:coarse)').matches;
      this.keys = new Set(); this.zones = []; this.solids = []; this.clickable = [];
      this.resources = new Set(); this.labels = []; this.models = new Map();
      this.pendingModels = new Map(); this.failedModels = new Set(); this.modelEpoch = 0;
      this.time = 0; this.hold = 0; this.zone = null; this.latched = null;
      this.yaw = 0; this.pitch = 0.48; this.velocity = new THREE.Vector2();
      this.touchMove = new THREE.Vector2(); this.temp = new THREE.Vector3();
      this.look = new THREE.Vector3(); this.desiredCamera = new THREE.Vector3();
      this.ray = new THREE.Raycaster(); this.ndc = new THREE.Vector2();
      this.state = 'gate'; this.serial = 0; this.lastUi = '';
      this.createUi(); this.bindInput();
    }

    copy(en, tr) { return this.api.language() === 'tr' ? tr : en; }
    track(resource) { this.resources.add(resource); return resource; }
    material(color, extra) {
      return this.track(new this.T.MeshStandardMaterial({ color, roughness: .82, metalness: .08, ...extra }));
    }
    mesh(geometry, material, x = 0, y = 0, z = 0, parent = this.scene) {
      const mesh = new this.T.Mesh(this.track(geometry), material);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    }
    box(w, h, d, material, x, y, z, solid = false) {
      const object = this.mesh(new this.T.BoxGeometry(w, h, d), material, x, y, z);
      if (solid) this.solids.push({ x, z, hx: w / 2, hz: d / 2 });
      return object;
    }
    text(text, width, x, y, z, color = '#eff5ee', size = 46) {
      const canvas = document.createElement('canvas'); canvas.width = 768; canvas.height = 128;
      const ctx = canvas.getContext('2d');
      const texture = this.track(new this.T.CanvasTexture(canvas)); texture.colorSpace = this.T.SRGBColorSpace;
      const material = this.track(new this.T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: this.T.DoubleSide, toneMapped: false }));
      const mesh = this.mesh(new this.T.PlaneGeometry(width, width / 6), material, x, y, z);
      const label = { mesh, canvas, ctx, texture, value: '', color, size };
      label.set = (value) => {
        if (value === label.value) return;
        label.value = value; ctx.clearRect(0, 0, 768, 128);
        ctx.font = `700 ${size}px system-ui, sans-serif`; ctx.textAlign = 'center'; ctx.textBaseline = 'middle';
        ctx.shadowColor = '#071723'; ctx.shadowBlur = 8; ctx.fillStyle = color;
        ctx.fillText(value, 384, 64, 746); texture.needsUpdate = true;
      };
      label.set(text); this.labels.push(label); return label;
    }
    pad(id, x, z, color, action, title, subtitle) {
      const base = this.mesh(new this.T.CylinderGeometry(1.45, 1.65, .14, 32), this.material(color, { emissive: color, emissiveIntensity: .13 }), x, .08, z);
      const rim = this.mesh(new this.T.RingGeometry(1.38, 1.49, 48), this.track(new this.T.MeshBasicMaterial({ color, side: this.T.DoubleSide })), x, .165, z);
      rim.rotation.x = -Math.PI / 2;
      const zone = { id, x, z, radius: 1.5, action, title, subtitle, base };
      this.zones.push(zone); return zone;
    }

    build() {
      if (this.scene) return;
      const T = this.T;
      this.scene = new T.Scene(); this.scene.background = new T.Color('#17283c');
      this.scene.fog = new T.Fog('#17283c', 42, 100);
      this.camera = new T.PerspectiveCamera(60, 1, .1, 130);
      this.scene.add(new T.HemisphereLight('#e4efff', '#73604d', 2.1));
      const sun = new T.DirectionalLight('#ffe2b0', 2.8); sun.position.set(-12, 22, 8); this.scene.add(sun);
      const stone = this.material('#6c7c86'), dark = this.material('#263b4b'), floor = this.material('#415766');
      const trim = this.material('#d1b987', { metalness: .3 });
      this.box(48, 1.2, 48, dark, 0, -.65, -4);
      this.box(46, .14, 46, floor, 0, -.1, -4);
      // Inlaid grid and paths are geometry, with deterministic depth separation.
      for (let i = -20; i <= 20; i += 4) {
        this.box(.025, .012, 44, stone, i, -.014, -4);
        this.box(44, .012, .025, stone, 0, -.014, i - 4);
      }
      this.box(4.4, .035, 31, stone, 0, .005, 0);
      for (const side of [-1, 1]) {
        this.box(.08, .04, 29, trim, side * 2.25, .015, 0);
        for (const z of [-24, 14]) {
          this.mesh(new T.CylinderGeometry(1.35, 1.5, .75, 10), dark, side * 19, .38, z);
          this.mesh(new T.DodecahedronGeometry(1.25, 0), this.material('#477e73'), side * 19, 1.45, z);
          this.mesh(new T.DodecahedronGeometry(.85, 0), this.material('#72a28a'), side * 19 + .6, 1.9, z);
        }
      }
      for (const side of [-1, 1]) {
        this.box(.45, .7, 46, dark, side * 23, .3, -4, true);
        this.box(.47, .08, 46, trim, side * 23, .69, -4);
        for (const z of [-22, -10, 2, 15]) {
          this.box(.65, 4.5, .65, dark, side * 21.8, 2.2, z);
          this.mesh(new T.SphereGeometry(.4, 12, 8), this.material('#f6d395', { emissive: '#f6d395', emissiveIntensity: 1 }), side * 21.8, 4.5, z);
        }
      }
      this.box(46, .7, .45, dark, 0, .3, 18, true);
      this.box(46, 2, .45, dark, 0, 1, -27, true);
      // Distant sculpted silhouettes keep the courtyard readable without a skybox asset.
      for (let i = 0; i < 14; i++) {
        const angle = i * Math.PI * 2 / 14;
        this.mesh(new T.ConeGeometry(7 + i % 3, 12 + i % 5, 5), this.material(i % 2 ? '#253e4e' : '#304b5a'), Math.sin(angle) * 57, -5, Math.cos(angle) * 57 - 4);
      }
      this.text('ELEMENTAL RUN', 15, 0, 11, -23, '#f4d59d', 62);
      this.avatar = new T.Group(); this.scene.add(this.avatar);
      this.body = this.mesh(new T.BoxGeometry(1.25, 1.55, 1.25), this.material('#73d2bd', { metalness: .15 }), 0, 0, 0, this.avatar);
      const edges = new T.LineSegments(this.track(new T.EdgesGeometry(this.body.geometry)), this.track(new T.LineBasicMaterial({ color: '#d6fff1' })));
      this.body.add(edges);
      const eyeMat = this.material('#122b36');
      this.mesh(new T.BoxGeometry(.13, .18, .025), eyeMat, -.24, .12, -.638, this.avatar);
      this.mesh(new T.BoxGeometry(.13, .18, .025), eyeMat, .24, .12, -.638, this.avatar);
      const shadowMat = this.track(new T.MeshBasicMaterial({ color: '#08151c', transparent: true, opacity: .3, depthWrite: false }));
      this.shadow = this.mesh(new T.CircleGeometry(.95, 24), shadowMat, 0, .03, 9); this.shadow.rotation.x = -Math.PI / 2;
      this.progressRing = this.mesh(new T.RingGeometry(1.05, 1.19, 64), this.track(new T.MeshBasicMaterial({ color: '#fff0b7', side: T.DoubleSide, transparent: true, opacity: .9, depthWrite: false })), 0, 1.9, 0);
      this.progressRing.rotation.x = -Math.PI / 2; this.progressRing.visible = false;

      this.api.skins().forEach((skin, index) => {
        const side = index < 4 ? -1 : 1, x = side * 17.7, z = 6 - (index % 4) * 7;
        this.mesh(new T.CylinderGeometry(1.65, 1.85, 1.5, 8), dark, x, .75, z);
        this.mesh(new T.CylinderGeometry(1.72, 1.72, .12, 32), this.material(skin.accent), x, 1.56, z);
        this.solids.push({ x, z, hx: 1.8, hz: 1.8 });
        const label = this.text(skin.name, 5, x, 4.9, z, skin.edge, 36);
        const price = this.text('', 4.6, x, 4.25, z, '#f3dfb0', 32);
        const preview = this.track(new T.TextureLoader().load(skin.preview)); preview.colorSpace = T.SRGBColorSpace;
        const placeholder = this.mesh(new T.PlaneGeometry(2.2, 2.7), this.track(new T.MeshBasicMaterial({ map: preview, transparent: true, alphaTest: .03, side: T.DoubleSide, toneMapped: false })), x, 2.95, z);
        const zone = this.pad('hand:' + skin.id, side * 13.8, z, skin.accent, () => this.api.equip(skin.id), skin.name, () => this.api.handStatus(skin));
        Object.assign(zone, { skin, pedestal: { x, z }, placeholder, price, label });
      });
      this.buildMonitor(dark, trim);
      this.buildWheel(dark, trim);
      this.buildPortal('endless', -7, '#65d9bd', dark, trim);
      this.buildPortal('level', 7, '#e6bc6e', dark, trim);
      this.pad('ad', -7.5, 7.5, '#e8bf68', () => this.api.rewardSpeed(), '2× SPEED', () => this.api.adsAvailable() ? this.copy('Watch an ad · 5 min boost', 'Reklam izle · 5 dk hız') : this.copy('Available on Poki', 'Poki üzerinde kullanılabilir'));
      this.box(3.5, 1, 2, dark, -7.5, .5, 4.3, true);
      const bolt = new T.Shape(); bolt.moveTo(.2, 1); bolt.lineTo(-.6, -.05); bolt.lineTo(-.05, -.05); bolt.lineTo(-.35, -1); bolt.lineTo(.65, .2); bolt.lineTo(.15, .2); bolt.closePath();
      this.adIcon = this.mesh(new T.ExtrudeGeometry(bolt, { depth: .16, bevelEnabled: false }), this.material('#f6d58e', { emissive: '#df9b39', emissiveIntensity: .25 }), -7.5, 2.2, 4.3);
      this.text('2× SPEED', 4.3, -7.5, 4, 4.3, '#ffe097');
      this.text(this.api.adsAvailable() ? this.copy('WATCH AD', 'REKLAM İZLE') : 'POKI', 3.4, -7.5, 3.35, 4.3, '#e5eaf0', 34);
      this.monitorDirty = true;
    }

    buildPortal(mode, x, color, dark, trim) {
      this.box(1.3, 6, 7, dark, x - 3.1, 3, -21, true);
      this.box(1.3, 6, 7, dark, x + 3.1, 3, -21, true);
      this.box(7.5, 1, 7, dark, x, 6.3, -21);
      for (let z = -18; z >= -24; z -= 2) {
        const mat = this.material(color, { emissive: color, emissiveIntensity: .6 });
        this.box(.13, 5.3, .13, mat, x - 2.35, 2.65, z);
        this.box(.13, 5.3, .13, mat, x + 2.35, 2.65, z);
        this.box(4.8, .13, .13, mat, x, 5.3, z);
      }
      this.box(4.8, .05, 11, trim, x, .035, -19);
      const title = this.text('', 8, x, 7.3, -18, color, 44);
      const zone = this.pad(mode, x, -20.8, color, () => this.transition(mode), '', () => '');
      zone.portal = true; zone.titleLabel = title;
      if (mode === 'level') {
        this.levelTitle = title;
        for (const direction of [-1, 1]) {
          const button = this.text(direction < 0 ? '◀' : '▶', 1.9, x + direction * 1.65, 2.5, -16.8, '#ffffff', 64).mesh;
          button.userData.click = () => { this.api.selectLevel(direction); this.refresh(true); };
          this.clickable.push(button);
        }
        this.text(this.copy('CHOOSE LEVEL', 'BÖLÜM SEÇ'), 4.3, x, 1.8, -16.8, '#efdbb4', 29);
      } else title.set('ENDLESS RUN');
    }

    buildMonitor(dark, trim) {
      const T = this.T;
      this.box(1, 2, 1, dark, 0, 1, -7, true);
      this.box(7, 4.4, .45, dark, 0, 3.3, -7, true);
      this.box(7.1, .1, .5, trim, 0, 5.55, -7);
      const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 640;
      this.monitorCanvas = canvas; this.monitorCtx = canvas.getContext('2d');
      this.monitorTexture = this.track(new T.CanvasTexture(canvas)); this.monitorTexture.colorSpace = T.SRGBColorSpace;
      const screen = this.mesh(new T.PlaneGeometry(6.65, 4.16), this.track(new T.MeshBasicMaterial({ map: this.monitorTexture, toneMapped: false })), 0, 3.3, -6.75);
      screen.userData.click = (hit) => {
        const y = (1 - hit.uv.y) * 640;
        const index = Math.floor((y - 136) / 108);
        if (index >= 0 && index < 4 && y < 568) { this.api.buyUpgrade(index); this.refresh(true); }
        else if (y >= 574) this.api.openPanel('upgrades');
      };
      this.clickable.push(screen);
      this.text(this.api.tr('upgrades').toLocaleUpperCase(), 7, 0, 6.25, -7, '#bce9df', 34);
    }

    buildWheel(dark, trim) {
      const T = this.T, x = 7.5, z = 4.3;
      this.box(.5, 4.3, .6, dark, x, 2, z, true);
      const canvas = document.createElement('canvas'); canvas.width = canvas.height = 512;
      const ctx = canvas.getContext('2d'), colors = ['#ca825a', '#588990', '#c8a85d', '#687fb0', '#8a688a', '#76a28e', '#c5a372', '#648eac'];
      const labels = ['100', '2×', '50', '2×', '75', '2×', '25', '2×'];
      for (let i = 0; i < 8; i++) {
        const a = i * Math.PI / 4;
        ctx.beginPath(); ctx.moveTo(256, 256); ctx.arc(256, 256, 247, a, a + Math.PI / 4); ctx.closePath();
        ctx.fillStyle = colors[i]; ctx.fill(); ctx.lineWidth = 4; ctx.strokeStyle = '#eed9ab'; ctx.stroke();
        ctx.save(); ctx.translate(256, 256); ctx.rotate(a + Math.PI / 8); ctx.textAlign = 'center'; ctx.fillStyle = '#fff'; ctx.font = 'bold 36px system-ui'; ctx.fillText(labels[i], 168, 12); ctx.restore();
      }
      const texture = this.track(new T.CanvasTexture(canvas)); texture.colorSpace = T.SRGBColorSpace;
      this.wheel = this.mesh(new T.CircleGeometry(1.9, 64), this.track(new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide, toneMapped: false })), x, 3.5, z + .1);
      this.mesh(new T.TorusGeometry(1.98, .12, 8, 64), trim, x, 3.5, z + .1);
      this.mesh(new T.ConeGeometry(.2, .55, 3), this.material('#fff0bd'), x, 5.65, z + .2).rotation.z = Math.PI;
      this.wheelLabel = this.text('', 5, x, 6.5, z, '#f9dfa2', 36);
      this.pad('wheel', x, 8, '#bf93e1', () => this.api.spin(), this.copy('LUCKY WHEEL', 'ŞANS ÇARKI'), () => this.api.wheelStatus());
    }

    createUi() {
      this.gate = document.createElement('section'); this.gate.id = 'hub-play-gate'; this.gate.hidden = true;
      this.gate.innerHTML = '<div class="hub-wordmark">ELEMENTAL <span>RUN</span></div><button id="hub-play" type="button">PLAY <span aria-hidden="true">➜</span></button>';
      document.body.appendChild(this.gate);
      this.hud = document.createElement('section'); this.hud.id = 'hub-hud'; this.hud.hidden = true;
      this.hud.innerHTML = '<header><div class="hub-brand">ELEMENTAL <b>RUN</b><small>LOBBY</small></div><div class="hub-tools"><span id="hub-wallet"></span><button id="hub-settings" type="button" aria-label="Settings">⚙</button></div></header><div id="hub-message" role="status" aria-live="polite"></div><div id="hub-prompt"><strong></strong><span></span><progress max="1.5" value="0"></progress></div><footer id="hub-hint"></footer><div id="hub-stick" aria-label="Move"><i></i></div><button id="hub-home" type="button" aria-label="Recenter camera">⌖</button>';
      document.body.appendChild(this.hud);
      this.prompt = this.hud.querySelector('#hub-prompt'); this.message = this.hud.querySelector('#hub-message');
      this.gate.querySelector('button').onclick = () => this.enter();
      this.hud.querySelector('#hub-settings').onclick = () => this.api.openPanel('settings');
      this.hud.querySelector('#hub-home').onclick = () => { this.yaw = 0; this.pitch = .48; };
    }

    show() {
      if (this.visited) { this.enter(); return; }
      this.state = 'gate'; this.gate.hidden = false;
      document.body.classList.add('hub-gate-active');
      this.gate.querySelector('button').focus({ preventScroll: true });
    }
    enter() {
      this.clearHandoff();
      this.build(); this.visited = true; this.active = true; this.state = 'exploring'; this.serial++;
      this.gate.hidden = true; this.hud.hidden = false;
      document.body.classList.remove('hub-gate-active'); document.body.classList.add('hub-active');
      this.avatar.position.set(0, .85, 11); this.avatar.rotation.set(0, 0, 0);
      this.avatar.visible = true;
      if (this.savedPixelRatio == null) this.savedPixelRatio = this.api.renderer().getPixelRatio();
      this.api.renderer().setPixelRatio(Math.min(window.devicePixelRatio || 1, this.mobile ? 1 : 1.25));
      this.velocity.set(0, 0); this.yaw = 0; this.pitch = .48;
      this.keys.clear(); this.hold = 0; this.zone = null; this.latched = null;
      this.api.onEnter(); this.refresh(true); this.updateCamera(1, true);
    }
    exit() {
      this.active = false; this.state = 'inactive'; this.serial++; this.modelEpoch++;
      this.keys.clear(); this.touchMove.set(0, 0); this.velocity.set(0, 0);
      this.hud.hidden = true; this.gate.hidden = true;
      document.body.classList.remove('hub-active', 'hub-gate-active');
      if (this.savedPixelRatio != null) { this.api.renderer().setPixelRatio(this.savedPixelRatio); this.savedPixelRatio = null; }
      // Free the heavy display copies; the runner's own selected-hand cache is separate.
      for (const id of [...this.models.keys()]) this.releaseModel(id);
    }
    blocked() { return this.api.blocked() || document.hidden || this.state !== 'exploring'; }
    notify(text) { this.message.textContent = text; this.messageUntil = this.time + 3.5; }

    bindInput() {
      const movement = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      window.addEventListener('keydown', (event) => {
        if (this.state === 'gate' && !this.gate.hidden && ['Enter', 'Space'].includes(event.code) && !event.repeat) {
          event.preventDefault(); event.stopImmediatePropagation(); this.enter(); return;
        }
        if (!this.active) return;
        if (event.code === 'Escape') { this.keys.clear(); this.api.escape(); event.preventDefault(); event.stopImmediatePropagation(); return; }
        if (event.target.matches?.('input,select,textarea')) return;
        if (movement.includes(event.code)) {
          if (!this.blocked()) this.keys.add(event.code);
          event.preventDefault(); event.stopImmediatePropagation();
        }
      }, true);
      window.addEventListener('keyup', (event) => { this.keys.delete(event.code); }, true);
      window.addEventListener('blur', () => { this.keys.clear(); this.touchMove.set(0, 0); this.pointer = null; });
      document.addEventListener('visibilitychange', () => { this.keys.clear(); this.touchMove.set(0, 0); });
      window.addEventListener('pointerdown', (event) => {
        if (!this.active || this.blocked() || event.target !== this.api.renderer().domElement) return;
        this.pointer = { id: event.pointerId, x: event.clientX, y: event.clientY, sx: event.clientX, sy: event.clientY };
        event.target.setPointerCapture?.(event.pointerId); event.preventDefault(); event.stopImmediatePropagation();
      }, true);
      window.addEventListener('pointermove', (event) => {
        const p = this.pointer;
        if (!p || event.pointerId !== p.id || !this.active || this.blocked()) return;
        this.yaw -= (event.clientX - p.x) * .005;
        this.pitch = Math.max(.18, Math.min(.9, this.pitch + (event.clientY - p.y) * .004));
        p.x = event.clientX; p.y = event.clientY; event.preventDefault(); event.stopImmediatePropagation();
      }, true);
      window.addEventListener('pointerup', (event) => {
        const p = this.pointer; if (!p || p.id !== event.pointerId) return;
        this.pointer = null;
        if (this.active && !this.blocked() && Math.hypot(event.clientX - p.sx, event.clientY - p.sy) < 8) this.pick(event.clientX, event.clientY);
        event.stopImmediatePropagation();
      }, true);
      window.addEventListener('pointercancel', () => { this.pointer = null; this.touchMove.set(0, 0); });
      const stick = this.hud.querySelector('#hub-stick');
      const move = (event) => {
        if (this.stickPointer !== event.pointerId) return;
        const r = stick.getBoundingClientRect(), dx = (event.clientX - r.left - r.width / 2) / (r.width * .35), dy = (event.clientY - r.top - r.height / 2) / (r.height * .35);
        this.touchMove.set(dx, dy); if (this.touchMove.length() > 1) this.touchMove.normalize();
        stick.firstElementChild.style.transform = `translate(${this.touchMove.x * 25}px,${this.touchMove.y * 25}px)`;
        event.preventDefault();
      };
      stick.onpointerdown = (event) => { this.stickPointer = event.pointerId; stick.setPointerCapture(event.pointerId); move(event); };
      stick.onpointermove = move;
      stick.onpointerup = stick.onpointercancel = () => { this.stickPointer = null; this.touchMove.set(0, 0); stick.firstElementChild.style.transform = ''; };
    }

    pick(x, y) {
      const r = this.api.renderer().domElement.getBoundingClientRect();
      this.ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1);
      this.ray.setFromCamera(this.ndc, this.camera);
      const hit = this.ray.intersectObjects(this.clickable, false)[0];
      if (!hit) return;
      if (this.avatar.position.distanceTo(hit.point) > 15) { this.notify(this.copy('Walk closer to the screen', 'Ekrana biraz yaklaş')); return; }
      hit.object.userData.click(hit);
    }
    canMove(x, z) {
      const radius = .65;
      if (x < -22.1 || x > 22.1 || z < -25.8 || z > 17.1) return false;
      return !this.solids.some((s) => Math.abs(x - s.x) < s.hx + radius && Math.abs(z - s.z) < s.hz + radius);
    }
    updateCamera(dt, instant = false) {
      const p = this.avatar.position, distance = 13;
      this.desiredCamera.set(p.x + Math.sin(this.yaw) * Math.cos(this.pitch) * distance, 2 + Math.sin(this.pitch) * distance, p.z + Math.cos(this.yaw) * Math.cos(this.pitch) * distance);
      // Shorten the camera boom at the courtyard walls. Never place it outside the floor.
      this.desiredCamera.x = Math.max(-22.7, Math.min(22.7, this.desiredCamera.x));
      this.desiredCamera.z = Math.max(-26.4, Math.min(17.8, this.desiredCamera.z));
      this.camera.position.lerp(this.desiredCamera, instant ? 1 : 1 - Math.exp(-9 * dt));
      this.look.set(p.x - Math.sin(this.yaw) * 3.8, 2.2, p.z - Math.cos(this.yaw) * 3.8); this.camera.lookAt(this.look);
    }

    update(dt) {
      if (!this.active) return;
      dt = Math.max(0, Math.min(.05, dt)); this.time += dt;
      if (this.state === 'transition') this.updateTransition(dt);
      else {
        const blocked = this.blocked();
        if (blocked) { this.keys.clear(); this.touchMove.set(0, 0); this.hold = 0; }
        const pad = navigator.getGamepads?.()?.[0];
        const stick = (index) => Math.abs(pad?.axes[index] || 0) > .18 ? pad.axes[index] : 0;
        const start = !!pad?.buttons[9]?.pressed;
        if (start && !this.gamepadStartHeld) this.api.escape();
        this.gamepadStartHeld = start;
        if (!blocked) { this.yaw -= stick(2) * dt * 2.1; this.pitch = Math.max(.18, Math.min(.9, this.pitch + stick(3) * dt * 1.3)); }
        const axisX = blocked ? 0 : Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft')) + this.touchMove.x + stick(0);
        const axisZ = blocked ? 0 : Number(this.keys.has('KeyS') || this.keys.has('ArrowDown')) - Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) + this.touchMove.y + stick(1);
        const length = Math.max(1, Math.hypot(axisX, axisZ)), c = Math.cos(this.yaw), s = Math.sin(this.yaw);
        const tx = (axisX * c + axisZ * s) / length * 7.5, tz = (axisZ * c - axisX * s) / length * 7.5;
        const damping = 1 - Math.exp(-16 * dt);
        this.velocity.x += (tx - this.velocity.x) * damping; this.velocity.y += (tz - this.velocity.y) * damping;
        const p = this.avatar.position, nx = p.x + this.velocity.x * dt, nz = p.z + this.velocity.y * dt;
        if (this.canMove(nx, p.z)) p.x = nx; else this.velocity.x = 0;
        if (this.canMove(p.x, nz)) p.z = nz; else this.velocity.y = 0;
        const speed = this.velocity.length(); p.y = .85 + Math.abs(Math.sin(this.time * 9)) * Math.min(.08, speed * .012);
        if (speed > .2) {
          const target = Math.atan2(-this.velocity.x, -this.velocity.y);
          const diff = Math.atan2(Math.sin(target - this.avatar.rotation.y), Math.cos(target - this.avatar.rotation.y));
          this.avatar.rotation.y += diff * damping;
        }
        this.body.rotation.z = Math.sin(this.time * 9) * Math.min(.055, speed * .008);
        this.shadow.position.set(p.x, .03, p.z);
        this.updateCamera(dt); this.updateZones(dt, blocked);
      }
      this.refresh();
      this.wheel.rotation.z = -(this.api.wheelRotation() || 0) * Math.PI / 180;
      this.adIcon.position.y = 2.2 + Math.sin(this.time * 1.8) * .1;
      this.adIcon.rotation.y = Math.sin(this.time * .6) * .25;
      if (this.messageUntil < this.time) this.message.textContent = '';
      const r = this.api.renderer(), canvas = r.domElement;
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      if (this.camera.aspect !== aspect) { this.camera.aspect = aspect; this.camera.updateProjectionMatrix(); }
      const target = r.getRenderTarget(), auto = r.autoClear;
      r.info.reset(); r.setRenderTarget(null); r.autoClear = true; r.render(this.scene, this.camera); r.autoClear = auto; r.setRenderTarget(target);
    }

    updateZones(dt, blocked) {
      // A modal/ad must not re-arm the pad while the cube is still standing on it.
      if (blocked) { this.prompt.hidden = true; this.progressRing.visible = false; return; }
      const p = this.avatar.position;
      const zone = this.zones.find((z) => Math.hypot(p.x - z.x, p.z - z.z) < z.radius);
      if (zone !== this.zone) { this.zone = zone; this.hold = 0; }
      if (!zone) { this.latched = null; this.prompt.hidden = true; this.progressRing.visible = false; return; }
      this.prompt.hidden = false;
      this.prompt.querySelector('strong').textContent = zone.portal ? (zone.id === 'level' ? this.api.levelLabel() : 'ENDLESS RUN') : zone.title;
      this.prompt.querySelector('span').textContent = zone.portal ? this.copy('Entering…', 'Giriliyor…') : zone.subtitle();
      if (this.latched === zone.id) { this.progressRing.visible = false; return; }
      this.hold += dt;
      this.prompt.querySelector('progress').value = this.hold;
      this.progressRing.visible = true; this.progressRing.position.set(zone.x, .25, zone.z);
      this.progressRing.geometry.setDrawRange(0, Math.floor(Math.min(1, this.hold / 1.5) * 64) * 6);
      if (this.hold >= 1.5) {
        this.latched = zone.id; this.progressRing.visible = false;
        Promise.resolve(zone.action()).then((message) => { if (message && this.active) this.notify(message); this.refresh(true); }).catch(() => this.notify(this.copy('Please try again', 'Lütfen tekrar dene')));
      }
    }

    refresh(force = false) {
      if (!this.scene) return;
      if (!force && this.nextRefresh > this.time) return;
      this.nextRefresh = this.time + .25;
      const wallet = this.api.wallet(), upgrades = this.api.upgrades();
      this.hud.querySelector('#hub-wallet').textContent = `◈ ${wallet.toLocaleString()}`;
      this.hud.querySelector('#hub-hint').textContent = this.mobile
        ? this.copy('Left stick: move · Drag to look · Stand on a pad', 'Sol kontrol: yürü · Sürükle: bak · Pedin üzerinde bekle')
        : this.copy('WASD / Arrows: move · Drag mouse: orbit · Stand on a pad for 1.5s · ESC: settings', 'WASD / Oklar: yürü · Fareyi sürükle: bak · Pedin üzerinde 1,5 sn bekle · ESC: ayarlar');
      this.levelTitle.set(this.api.levelLabel()); this.wheelLabel.set(this.api.wheelStatus());
      for (const z of this.zones) if (z.skin) {
        z.price.set(this.api.handStatus(z.skin));
        z.placeholder.quaternion.copy(this.camera.quaternion);
        z.label.mesh.quaternion.copy(this.camera.quaternion); z.price.mesh.quaternion.copy(this.camera.quaternion);
      }
      const signature = JSON.stringify(upgrades) + ':' + wallet + ':' + this.api.language();
      if (signature !== this.lastUi || force) {
        this.lastUi = signature;
        const ctx = this.monitorCtx;
        ctx.fillStyle = '#122330'; ctx.fillRect(0, 0, 1024, 640);
        ctx.fillStyle = '#d8f0e9'; ctx.font = 'bold 48px system-ui'; ctx.fillText(this.api.tr('upgrades').toLocaleUpperCase(), 42, 76);
        ctx.textAlign = 'right'; ctx.fillStyle = '#f0cc82'; ctx.font = 'bold 34px system-ui'; ctx.fillText(`◈ ${wallet}`, 974, 72); ctx.textAlign = 'left';
        upgrades.forEach((u, i) => {
          const y = 136 + i * 108; ctx.fillStyle = u.canBuy ? '#284d57' : '#21333f'; ctx.fillRect(28, y, 968, 92);
          ctx.fillStyle = '#fff'; ctx.font = 'bold 32px system-ui'; ctx.fillText(u.name, 55, y + 39, 550);
          ctx.fillStyle = '#a5b9c4'; ctx.font = '24px system-ui'; ctx.fillText(`${this.copy('Level', 'Seviye')} ${u.level} / ${u.max}`, 55, y + 73);
          ctx.textAlign = 'right'; ctx.fillStyle = u.canBuy ? '#f4d496' : '#a6b5bb'; ctx.font = 'bold 32px system-ui'; ctx.fillText(u.maxed ? 'MAX' : `◈ ${u.cost}`, 958, y + 55); ctx.textAlign = 'left';
        });
        ctx.fillStyle = '#a9c9ce'; ctx.font = '24px system-ui'; ctx.textAlign = 'center'; ctx.fillText(this.copy('All upgrades & hands  ↗', 'Tüm yükseltmeler ve eller  ↗'), 512, 611); ctx.textAlign = 'left';
        this.monitorTexture.needsUpdate = true;
      }
      if (this.state === 'exploring' && !this.blocked()) this.streamModels();
    }

    streamModels() {
      // One GLB at a time, at most two resident stand models. Baked billboard
      // placeholders remain for distant stands, avoiding eight simultaneous parses.
      const p = this.avatar.position;
      const nearest = this.zones.filter((z) => z.skin).sort((a, b) => Math.hypot(a.x - p.x, a.z - p.z) - Math.hypot(b.x - p.x, b.z - p.z));
      const wanted = nearest.filter((z) => Math.hypot(z.x - p.x, z.z - p.z) < 11).slice(0, 2);
      for (const id of this.models.keys()) if (!wanted.some((z) => z.skin.id === id)) this.releaseModel(id);
      if (this.pendingModels.size || this.velocity.length() > 1) return;
      const zone = wanted.find((z) => !this.models.has(z.skin.id) && !this.failedModels.has(z.skin.id));
      if (!zone) return;
      const id = zone.skin.id, epoch = this.modelEpoch;
      const loader = new this.T.GLTFLoader(); if (this.T.MeshoptDecoder) loader.setMeshoptDecoder(this.T.MeshoptDecoder);
      this.pendingModels.set(id, true);
      loader.load(this.api.handPath(id), (gltf) => {
        this.pendingModels.delete(id);
        const root = gltf.scene;
        if (!this.active || epoch !== this.modelEpoch) { this.disposeModel(root); return; }
        const bounds = new this.T.Box3().setFromObject(root), size = bounds.getSize(new this.T.Vector3()), center = bounds.getCenter(new this.T.Vector3());
        const wrapper = new this.T.Group(), fit = 2.5 / Math.max(size.x, size.y, size.z, .01);
        root.position.sub(center); wrapper.add(root); wrapper.scale.setScalar(fit);
        wrapper.position.set(zone.pedestal.x, 2.8, zone.pedestal.z);
        root.traverse((node) => {
          if (!node.isMesh) return;
          node.castShadow = node.receiveShadow = false; node.layers.set(0);
          for (const mat of (Array.isArray(node.material) ? node.material : [node.material])) {
            if (mat.map) mat.map.colorSpace = this.T.SRGBColorSpace;
            if (mat.emissiveMap) mat.emissiveMap.colorSpace = this.T.SRGBColorSpace;
            mat.envMapIntensity = .25; mat.roughness = Math.max(.5, mat.roughness || .5);
          }
        });
        this.scene.add(wrapper); this.models.set(id, wrapper); zone.placeholder.visible = false;
      }, undefined, () => { this.pendingModels.delete(id); this.failedModels.add(id); });
    }
    disposeModel(root) {
      const geometries = new Set(), materials = new Set(), textures = new Set();
      root.traverse((n) => {
        if (n.geometry) geometries.add(n.geometry);
        for (const m of (Array.isArray(n.material) ? n.material : [n.material])) if (m) materials.add(m);
      });
      for (const m of materials) { for (const value of Object.values(m)) if (value?.isTexture) textures.add(value); m.dispose(); }
      for (const g of geometries) g.dispose();
      for (const t of textures) { t.source?.data?.close?.(); t.dispose(); }
    }
    releaseModel(id) {
      const root = this.models.get(id); if (!root) return;
      this.scene.remove(root); this.disposeModel(root); this.models.delete(id);
      const zone = this.zones.find((z) => z.skin?.id === id); if (zone) zone.placeholder.visible = true;
    }

    async transition(mode) {
      if (this.state !== 'exploring') return;
      this.state = 'preparing'; this.keys.clear(); this.touchMove.set(0, 0);
      this.velocity.set(0, 0);
      const serial = this.serial;
      this.notify(this.copy('Preparing your run…', 'Koşun hazırlanıyor…'));
      try {
        await this.api.prepare(mode);
        if (!this.active || this.serial !== serial) return;
        this.state = 'transition'; this.transitionTime = 0; this.transitionMode = mode;
        this.transitionOrigin = this.camera.position.clone(); this.transitionRotation = this.camera.quaternion.clone();
        this.transitionTarget = this.avatar.position.clone().add(new this.T.Vector3(0, .65, 0));
        this.camera.lookAt(this.temp.copy(this.transitionTarget).add(new this.T.Vector3(0, 0, -10)));
        this.transitionTargetRotation = this.camera.quaternion.clone(); this.camera.quaternion.copy(this.transitionRotation);
        this.prompt.hidden = true; this.message.textContent = '';
      } catch (error) { console.warn('[Lobby preparation]', error); this.state = 'exploring'; this.notify(this.copy('Could not prepare the run. Step off and retry.', 'Koşu hazırlanamadı. Pedden çıkıp tekrar dene.')); }
    }
    updateTransition(dt) {
      this.transitionTime += dt;
      const t = Math.min(1, this.transitionTime / 1.15), eased = t * t * (3 - 2 * t);
      this.camera.position.lerpVectors(this.transitionOrigin, this.transitionTarget, eased);
      this.camera.quaternion.slerpQuaternions(this.transitionRotation, this.transitionTargetRotation, eased);
      this.avatar.visible = t < .8;
      if (t >= 1) { const mode = this.transitionMode; this.captureHandoff(); this.exit(); this.api.start(mode); }
    }
    captureHandoff() {
      this.clearHandoff();
      const T = this.T, renderer = this.api.renderer(), size = renderer.getDrawingBufferSize(new T.Vector2());
      const scale = Math.min(1, 1280 / size.x);
      const target = new T.WebGLRenderTarget(Math.max(1, Math.round(size.x * scale)), Math.max(1, Math.round(size.y * scale)), { depthBuffer: true });
      const previous = renderer.getRenderTarget(); renderer.setRenderTarget(target); renderer.render(this.scene, this.camera); renderer.setRenderTarget(previous);
      const scene = new T.Scene(), camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      const material = new T.MeshBasicMaterial({ map: target.texture, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
      const plane = new T.Mesh(new T.PlaneGeometry(2, 2), material); scene.add(plane);
      this.handoff = { target, scene, camera, plane, material, elapsed: 0 };
    }
    renderHandoff(dt) {
      const h = this.handoff; if (!h) return;
      h.elapsed += Math.min(.05, Math.max(0, dt));
      const amount = Math.min(1, h.elapsed / .38);
      h.material.opacity = 1 - amount * amount * (3 - 2 * amount);
      const renderer = this.api.renderer(), previous = renderer.getRenderTarget(), auto = renderer.autoClear;
      renderer.setRenderTarget(null); renderer.autoClear = false; renderer.render(h.scene, h.camera);
      renderer.autoClear = auto; renderer.setRenderTarget(previous);
      if (amount >= 1) this.clearHandoff();
    }
    clearHandoff() {
      if (!this.handoff) return;
      this.handoff.target.dispose(); this.handoff.plane.geometry.dispose(); this.handoff.material.dispose(); this.handoff = null;
    }
    snapshot() {
      return { active: this.active, state: this.state, handoffActive: !!this.handoff, player: this.avatar ? { x: +this.avatar.position.x.toFixed(2), y: +this.avatar.position.y.toFixed(2), z: +this.avatar.position.z.toFixed(2) } : null,
        coordinateSystem: 'Lobby: X right, Y up, -Z forward (independent of runner)', zone: this.zone?.id || null, hold: +this.hold.toFixed(2), residentModels: [...this.models.keys()], pendingModels: [...this.pendingModels.keys()], zones: this.zones.map((z) => ({ id: z.id, x: z.x, z: z.z })) };
    }
    dispose() {
      this.exit(); this.clearHandoff(); for (const resource of this.resources) resource.dispose?.(); this.resources.clear();
      this.scene?.clear(); this.scene = null;
    }
  }
  window.ElementalLobbyHub = LobbyHub;
})();
