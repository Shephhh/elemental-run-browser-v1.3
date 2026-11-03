(function () {
  'use strict';
  const COPY_KEYS={
    'LEVEL':'level','Level':'level','STATS':'hubStats','Best times & medals':'hubBestTimes',
    'HANDS':'hands','UPGRADES':'upgrades','Open upgrade panel':'upgrades','ENDLESS RUN':'hubEndless',
    'LUCKY WHEEL':'hubWheel','Settings':'settings','Recenter camera':'hubRecenter','ELEMENTAL PLAZA':'hubPlaza',
    'Watch an ad':'hubWatchAd','WATCH AD':'hubWatchAd','Available on Poki':'hubOnPoki',
    'Walk closer to the screen':'hubApproach','Entering…':'hubEntering','Please try again':'retry',
    'Preparing your run…':'preparing','Could not prepare the run. Step off and retry.':'hubPrepareFailed'
  };

  // Isolated straight-world scene. The runner supplies business operations;
  // this module owns only lobby geometry, input, presentation and movement.
  class LobbyHub {
    constructor(THREE, api) {
      this.T = THREE; this.api = api; this.active = false; this.visited = false;
      this.mobile = api.mobile || window.matchMedia('(pointer:coarse)').matches;
      this.keys = new Set(); this.zones = []; this.solids = []; this.clickable = [];
      this.resources = new Set(); this.labels = []; this.models = new Map();
      this.pendingModels = new Map(); this.failedModels = new Set(); this.modelEpoch = 0;
      this.nextModelLoadAt = 0; this.jumpVelocity = 0;
      // Circumscribed footprint includes the corners during turns and the cosmetic lean.
      this.avatarHalfHeight = 1.08; this.avatarRadius = 1.28;
      this.animatedDecor = [];
      this.time = 0; this.hold = 0; this.zone = null; this.latched = null;
      this.yaw = 0; this.pitch = 0.48; this.velocity = new THREE.Vector2();
      this.touchMove = new THREE.Vector2(); this.temp = new THREE.Vector3();
      this.look = new THREE.Vector3(); this.desiredCamera = new THREE.Vector3();
      this.ray = new THREE.Raycaster(); this.ndc = new THREE.Vector2();
      this.state = 'menu'; this.serial = 0; this.lastUi = '';
      this.pointerLockWanted = true; this.pointerRestoreQueued = false; this.pointerWasBlocked = false;
      this.createUi(); this.bindInput();
    }

    copy(en, tr) { return COPY_KEYS[en]?this.api.tr(COPY_KEYS[en]):this.api.language() === 'tr' ? tr : en; }
    levelName() { return this.api.levelLabel().replace(/^LEVEL\b/,this.copy('LEVEL','SEVİYE')); }
    track(resource) { this.resources.add(resource); return resource; }
    material(color, extra) {
      return this.track(new this.T.MeshStandardMaterial({ color, roughness: .82, metalness: .08, ...extra }));
    }
    mesh(geometry, material, x = 0, y = 0, z = 0, parent = this.scene) {
      const mesh = new this.T.Mesh(this.track(geometry), material);
      mesh.position.set(x, y, z); parent.add(mesh); return mesh;
    }
    box(w, h, d, material, x, y, z, solid = false, parent = this.scene) {
      const object = this.mesh(new this.T.BoxGeometry(w, h, d), material, x, y, z, parent);
      if (solid) this.solids.push({ x, z, hx: w / 2, hz: d / 2 });
      return object;
    }
    bevelBox(w, h, d, material, x, y, z, parent = this.scene, bevel = .1) {
      const T=this.T, shape=new T.Shape(), b=Math.min(bevel,w/8,h/8,d/4);
      shape.moveTo(-w/2+b,-h/2+b);shape.lineTo(w/2-b,-h/2+b);
      shape.lineTo(w/2-b,h/2-b);shape.lineTo(-w/2+b,h/2-b);shape.closePath();
      const geometry=new T.ExtrudeGeometry(shape,{depth:d-2*b,bevelEnabled:true,bevelThickness:b,bevelSize:b,bevelSegments:2,steps:1,curveSegments:1});
      geometry.translate(0,0,-d/2+b);
      return this.mesh(geometry,material,x,y,z,parent);
    }
    contactShadow(x,z,width,depth,y=.055,parent=this.scene) {
      if(!this.contactMaterial){
        const c=document.createElement('canvas');c.width=c.height=64;const ctx=c.getContext('2d'),g=ctx.createRadialGradient(32,32,8,32,32,32);
        g.addColorStop(0,'rgba(4,10,18,.5)');g.addColorStop(.55,'rgba(4,10,18,.26)');g.addColorStop(1,'rgba(4,10,18,0)');ctx.fillStyle=g;ctx.fillRect(0,0,64,64);
        this.contactMaterial=this.track(new this.T.MeshBasicMaterial({map:this.track(new this.T.CanvasTexture(c)),transparent:true,depthWrite:false,toneMapped:false}));
      }
      const shadow=this.mesh(new this.T.PlaneGeometry(width,depth),this.contactMaterial,x,y,z,parent);shadow.rotation.x=-Math.PI/2;return shadow;
    }
    text(text, width, x, y, z, color = '#eff5ee', size = 46, parent = this.scene) {
      const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 160;
      const ctx = canvas.getContext('2d');
      const texture = this.track(new this.T.CanvasTexture(canvas)); texture.colorSpace = this.T.SRGBColorSpace;
      texture.anisotropy=Math.min(4,this.api.renderer().capabilities.getMaxAnisotropy());
      const material = this.track(new this.T.MeshBasicMaterial({ map: texture, transparent: true, depthWrite: false, side: this.T.DoubleSide, toneMapped: false }));
      const mesh = this.mesh(new this.T.PlaneGeometry(width, width / 6.4), material, x, y, z, parent);
      const label = { mesh, canvas, ctx, texture, value: '', color, size };
      label.set = (value) => {
        if (value === label.value) return;
        label.value = value; ctx.clearRect(0, 0, 1024, 160);
        if(value){
          const fontSize=Math.min(82,Math.max(54,size*1.4));
          ctx.font = `750 ${fontSize}px system-ui, sans-serif`;ctx.textAlign='center';ctx.textBaseline='middle';
          const panelWidth=Math.min(1008,ctx.measureText(value).width+76),left=(1024-panelWidth)/2;
          ctx.fillStyle=label.hologram?'#122b4438':'#101e2bee';ctx.beginPath();ctx.roundRect(left,17,panelWidth,126,18);ctx.fill();
          ctx.strokeStyle=color;ctx.lineWidth=2;ctx.globalAlpha=.5;ctx.stroke();ctx.globalAlpha=1;
          if(label.hologram){ctx.shadowColor=color;ctx.shadowBlur=14;}
          ctx.fillStyle=color;ctx.fillText(value,512,81,940);ctx.shadowBlur=0;
          if(label.hologram){ctx.fillStyle=color;ctx.globalAlpha=.1;for(let y=25;y<140;y+=8)ctx.fillRect(left+6,y,panelWidth-12,1);ctx.globalAlpha=1;}
        }
        texture.needsUpdate = true;
      };
      label.set(text); this.labels.push(label); return label;
    }
    pad(id, x, z, color, action, title, subtitle, floorY = 0) {
      const base = this.mesh(new this.T.CylinderGeometry(1.45, 1.65, .14, 32), this.material('#233444', { emissive: color, emissiveIntensity: .045,metalness:.25 }), x, floorY + .08, z);
      const rim = this.mesh(new this.T.RingGeometry(1.38, 1.49, 48), this.track(new this.T.MeshBasicMaterial({ color, side: this.T.DoubleSide })), x, floorY + .165, z);
      rim.rotation.x = -Math.PI / 2;
      const zone = { id, x, z, floorY, radius: 1.5, action, title, subtitle, base, rim };
      base.userData.click=()=>this.invokeZone(zone);this.clickable.push(base);
      this.zones.push(zone); return zone;
    }
    invokeZone(zone) {
      if(this.state!=='exploring'||this.blocked())return;
      // The originating pointer/key event already records user interaction.
      this.latched=zone.id;
      Promise.resolve(zone.action()).then(message=>{if(message&&this.active)this.notify(message);this.refresh(true);}).catch(()=>this.notify(this.api.tr('retry')));
    }
    buildGuidance() {
      // Filled arrowhead + short stem, shared by both instanced layers.
      // Native geometry only: no textures, curved-world patch or per-frame allocation.
      const T=this.T,shape=new T.Shape();shape.moveTo(0,-.58);shape.lineTo(.45,-.04);shape.lineTo(.17,-.04);shape.lineTo(.17,.46);shape.lineTo(-.17,.46);shape.lineTo(-.17,-.04);shape.lineTo(-.45,-.04);shape.closePath();
      const geometry=this.track(new T.ShapeGeometry(shape));geometry.rotateX(-Math.PI/2);
      this.guideArrows=new T.InstancedMesh(geometry,this.track(new T.MeshBasicMaterial({color:'#ffe193',transparent:true,opacity:.96,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-2,polygonOffsetUnits:-2,toneMapped:false,fog:false})),24);
      this.guideOutline=new T.InstancedMesh(geometry,this.track(new T.MeshBasicMaterial({color:'#0b1827',depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1,toneMapped:false,fog:false})),24);
      this.track(this.guideArrows);this.track(this.guideOutline);
      this.guideOutline.renderOrder=7;this.guideOutline.frustumCulled=false;this.guideOutline.visible=false;this.scene.add(this.guideOutline);
      this.guideGoal=this.mesh(new T.RingGeometry(1.62,1.76,48),this.track(new T.MeshBasicMaterial({color:'#ffe193',transparent:true,opacity:.75,depthWrite:false,toneMapped:false,fog:false})),0,.3,0);
      this.guideGoal.rotation.x=-Math.PI/2;this.guideGoal.renderOrder=8;this.guideGoal.visible=false;
      this.guideMotion=window.matchMedia('(prefers-reduced-motion: reduce)');
      this.guideArrows.instanceMatrix.setUsage(T.DynamicDrawUsage);this.guideOutline.instanceMatrix.setUsage(T.DynamicDrawUsage);
      // Keep USE_INSTANCING_COLOR stable even before onboarding's first tick.
      this.guideArrows.setColorAt(0, new T.Color('#ffffff'));
      this.guideArrows.instanceColor.setUsage(T.DynamicDrawUsage);
      this.guideArrows.renderOrder=8;
      this.guideArrows.frustumCulled=false;this.guideArrows.visible=false;this.guideDummy=new T.Object3D();this.guideTint=new T.Color();this.scene.add(this.guideArrows);
      this.celebration=new T.InstancedMesh(this.track(new T.OctahedronGeometry(.12,0)),this.track(new T.MeshBasicMaterial({color:'#ffe19b',transparent:true,depthWrite:false,toneMapped:false})),24);
      this.celebration.visible=false;this.celebration.frustumCulled=false;this.scene.add(this.celebration);this.celebrationAge=2;
      this.guideNote=this.hud.querySelector('#hub-guide-note');
    }
    celebrate(origin = 'monitor') {
      if(!this.active||!this.celebration)return;
      this.celebrationOrigin = origin === 'avatar' ? this.avatar.position.clone().add(new this.T.Vector3(0,1.5,0)) : new this.T.Vector3(25,4.6,-2);
      this.celebrationAge=0;this.hud.querySelector('#hub-wallet').animate([{transform:'scale(1)'},{transform:'scale(1.13)'},{transform:'scale(1)'}],{duration:500});
      this.monitorTitle.mesh.userData.pulse=this.time;
    }
    updateGuidance(dt) {
      const stage=this.state==='exploring'&&!this.inConcourse?this.api.guideStage?.():null,zone=this.zones.find(zone=>zone.id===stage);
      const note=this.guideNote,language=this.api.language();note.hidden=!zone||this.blocked();
      if(zone&&(stage!==this.lastGuideStage||language!==this.lastGuideLanguage))note.textContent=this.api.guideLabel?.()||zone.title;
      this.lastGuideStage=stage;this.lastGuideLanguage=language;
      this.guideArrows.visible=!!zone&&!this.blocked();
      this.guideOutline.visible=this.guideGoal.visible=this.guideArrows.visible;
      if(this.guideArrows.visible){
        // Anchor spacing at the destination, not at the moving player. No
        // modulo translation, bouncing or synchronous size pumping: only a
        // soft brightness wave moves towards the goal along the straight route.
        const p=this.avatar.position,dx=zone.x-p.x,dz=zone.z-p.z,total=Math.hypot(dx,dz),start=2.1,end=1.3;
        const count=Math.min(this.guideArrows.instanceMatrix.count,Math.max(0,Math.floor((total-start-end)/1.85)+1));
        this.guideArrows.count=this.guideOutline.count=count;
        const spacing=count===this.guideArrows.instanceMatrix.count ? Math.max(1.85,(total-start-end)/Math.max(1,count-1)) : 1.85;
        const yaw=Math.atan2(dx,dz);
        const animated=!this.guideMotion.matches;
        this.guideGoal.position.set(zone.x,zone.floorY+.3,zone.z);
        this.guideGoal.material.opacity=animated ? .67+.13*Math.sin(this.time*2) : .8;
        for(let i=0;i<count;i++){
          const remaining=end+(count-1-i)*spacing,distance=total-remaining,u=distance/Math.max(.01,total),d=this.guideDummy;
          const x=p.x+dx*u,z=p.z+dz*u,y=this.floorHeightAt(x,z)+.29;
          d.position.set(x,y-.025,z);d.rotation.set(0,yaw,0);d.scale.set(1.42,1,1.54);d.updateMatrix();this.guideOutline.setMatrixAt(i,d.matrix);
          d.position.y=y;d.scale.set(1.2,1,1.3);d.updateMatrix();this.guideArrows.setMatrixAt(i,d.matrix);
          const wave=animated ? .5+.5*Math.sin(-remaining*1.05-this.time*3) : 1;
          this.guideTint.setRGB(.83+.17*wave,.83+.17*wave,.78+.22*wave);
          this.guideArrows.setColorAt(i,this.guideTint);
        }this.guideArrows.instanceMatrix.needsUpdate=true;this.guideArrows.instanceColor.needsUpdate=true;this.guideOutline.instanceMatrix.needsUpdate=true;
      }
      for(const mesh of this.clickable)this.updatePulse(mesh);
      this.updatePulse(this.monitorTitle.mesh);
      if(this.celebrationAge<1.1){
        this.celebrationAge+=dt;this.celebration.visible=true;this.celebration.material.opacity=Math.max(0,1-this.celebrationAge/1.1);
        const p=this.celebrationOrigin;
        for(let i=0;i<24;i++){const d=this.guideDummy,t=this.celebrationAge,a=i*2.39996;d.position.set(p.x+Math.cos(a)*t*3.5,p.y+Math.sin(i)*.6+t*3-t*t*3,p.z+Math.sin(a)*t*3.5);d.rotation.set(t*3,a,t*2);d.scale.setScalar(1-t*.5);d.updateMatrix();this.celebration.setMatrixAt(i,d.matrix);}this.celebration.instanceMatrix.needsUpdate=true;
      }else this.celebration.visible=false;
    }
    updatePulse(mesh) {
      if(mesh.userData.pulse==null)return;
      const age=this.time-mesh.userData.pulse;mesh.scale.setScalar(age<.45?1+Math.sin(age/.45*Math.PI)*.12:1);if(age>=.45)delete mesh.userData.pulse;
    }

    build() {
      if (this.scene) return;
      const T = this.T;
      this.scene = new T.Scene(); this.scene.background = new T.Color('#081726');
      this.scene.fog = new T.FogExp2('#081726', .006);
      this.camera = new T.PerspectiveCamera(60, 1, .1, 185);
      this.hemisphere = new T.HemisphereLight('#e4efff', '#283746', 1.65); this.scene.add(this.hemisphere);
      this.sun = new T.DirectionalLight('#ffe2b0', 2.6); this.sun.position.set(-12, 22, 8); this.scene.add(this.sun);
      this.fillLight=new T.DirectionalLight('#bedfff',.8);this.fillLight.position.set(16,10,-18);this.scene.add(this.fillLight);
      const stone = this.material('#80909c'), dark = this.material('#263746',{metalness:.24,roughness:.65}), floor = this.material('#415766');
      this.archMaterial=dark;this.stoneMaterial=stone;
      this.floorMaterial = floor;
      this.buildSurfaceDetails();
      const trim = this.material('#d1b987', { metalness: .3 });
      this.box(70, 1.2, 64, dark, 0, -.65, -2);
      this.floorSurface = this.box(68, .14, 62, floor, 0, -.04, -2);
      this.buildCarpet();
      for (const side of [-1, 1]) {
        this.box(.45, .7, 62, dark, side * 34, .3, -2, true);
        this.box(.47, .08, 62, trim, side * 34, .69, -2);
        for (const z of [-28, -14, 0, 14, 25]) {
          this.box(.65, 4.5, .65, dark, side * 33, 2.2, z);
          this.mesh(new T.SphereGeometry(.4, 12, 8), this.material('#f6d395', { emissive: '#f6d395', emissiveIntensity: 1 }), side * 33, 4.5, z);
        }
      }
      this.box(68, .7, .45, dark, 0, .3, 29, true);
      this.box(68, 2, .45, dark, 0, 1, -33, true);
      this.buildEnclosure();
      this.themeLabel = this.text('', 15, 0, 11.1, -31.84, '#edf5ee', 48);
      // Reuse the runner's actual celestial meshes and point field. Shared
      // geometries remain cached; only their light, straight-lobby materials
      // are cloned so map updates cannot mutate the lobby.
      const sky = this.api.themeSkyObjects?.();
      if (sky?.sun) {
        this.sunDisc = sky.sun.clone();
        this.sunDisc.material = this.track(sky.sun.material.clone());
        this.sunDisc.position.set(0, 14, -115);
        this.sunDisc.rotation.set(0, 0, 0);
        this.sunDisc.scale.setScalar(.075);
        this.sunDisc.frustumCulled = false;
        this.scene.add(this.sunDisc);
      }
      if (sky?.stars) {
        this.starField = sky.stars.clone();
        this.starField.material = this.track(sky.stars.material.clone());
        this.starField.scale.setScalar(.09);
        this.starField.frustumCulled = false;
        this.scene.add(this.starField);
      }
      this.avatar = new T.Group(); this.scene.add(this.avatar);
      // Restore the classic lobby cube; the race avatar belongs to its own mode.
      this.body = this.mesh(window.ElementalCubeAvatar.rounded(T,1.7,2,1.7,.17,8),this.material('#73d2bd',{metalness:.15,roughness:.5}),0,0,0,this.avatar);
      this.avatarMotion={phase:0,move:0,landing:0,wasGrounded:true,vy:0};
      // User-supplied PBR cosmetic, loaded once behind the initial loading UI.
      this.avatarHat = new T.Group(); this.avatarHat.position.y = 1.04; this.body.add(this.avatarHat);
      this.avatarHat.visible=!!this.api.hatOwned?.();
      const eyeMat = this.material('#122b36');
      this.faceEyes=[];this.faceBrows=[];
      for (const side of [-1, 1]) {
        const eye=this.mesh(new T.SphereGeometry(1,12,8),eyeMat,side*.32,.16,-.866,this.body);eye.scale.set(.105,.16,.035);this.faceEyes.push(eye);
        this.mesh(new T.SphereGeometry(.029,8,6),this.material('#f2fffa'),-.22,.3,-.95,eye).scale.set(1/.105,1/.16,1/.035);
        this.faceBrows.push(this.bevelBox(.24,.055,.025,eyeMat,side*.32,.43,-.867,this.body,.009));
      }
      const smile=new T.TorusGeometry(.23,.035,5,20,Math.PI);this.faceSmile=this.mesh(smile,eyeMat,0,-.13,-.875,this.body);this.faceSmile.rotation.z=Math.PI;
      this.faceSurprise=this.mesh(new T.TorusGeometry(.105,.03,6,16),eyeMat,0,-.17,-.876,this.body);this.faceSurprise.visible=false;
      this.faceBlinkAt=2.8;this.faceBlinkTime=0;this.faceExcitement=0;
      this.bevelBox(.62,.62,.035,this.material('#d0fff0',{emissive:'#6ac5af',emissiveIntensity:.2}),0,0,.861,this.body,.008).rotation.z=Math.PI/4;
      const shadowCanvas = document.createElement('canvas'); shadowCanvas.width = shadowCanvas.height = 64;
      const shadowCtx = shadowCanvas.getContext('2d'), gradient = shadowCtx.createRadialGradient(32,32,4,32,32,31);
      gradient.addColorStop(0,'rgba(5,14,24,.42)'); gradient.addColorStop(1,'rgba(5,14,24,0)');
      shadowCtx.fillStyle = gradient; shadowCtx.fillRect(0,0,64,64);
      const shadowMat = this.track(new T.MeshBasicMaterial({ map: this.track(new T.CanvasTexture(shadowCanvas)), transparent: true, depthWrite: false, polygonOffset: true, polygonOffsetFactor: -1, polygonOffsetUnits: -2 }));
      this.shadow = this.mesh(new T.PlaneGeometry(3.3, 3.3), shadowMat, 0, .18, 5); this.shadow.rotation.x = -Math.PI / 2;
      this.shadow.renderOrder = 3;
      this.progressRing = this.mesh(new T.RingGeometry(1.05, 1.19, 64), this.track(new T.MeshBasicMaterial({ color: '#fff0b7', side: T.DoubleSide, transparent: true, opacity: .9, depthWrite: false })), 0, 1.9, 0);
      this.progressRing.rotation.x = -Math.PI / 2; this.progressRing.visible = false;

      // Two columns along the left wall. The outer column has stairs only
      // at its two short ends; visual steps and controller share these bounds.
      const tier = this.handTier = { x: -27, z: -2, width: 10, length: 30, height: 3.1, stairWidth: 7, steps: 6, tread: 1.12 };
      this.box(tier.width, tier.height - .1, tier.length, dark, tier.x, (tier.height - .1) / 2, tier.z);
      this.box(tier.width, .07, tier.length, stone, tier.x, tier.height - .035, tier.z);
      for (const side of [-1, 1]) {
        const end = tier.z + side * tier.length / 2;
        for (let step = 0; step < tier.steps; step++) {
          const height = (step + 1) * tier.height / tier.steps;
          const z = end + side * (tier.steps - step - .5) * tier.tread;
          this.box(tier.stairWidth, height - .1, tier.tread, dark, tier.x, (height - .1) / 2, z);
          this.box(tier.stairWidth, .07, tier.tread, stone, tier.x, height - .035, z);
          this.box(tier.stairWidth, .018, .09, trim, tier.x, height + .009, z + side * (tier.tread / 2 - .045));
        }
      }
      this.box(.2, .38, tier.length, trim, tier.x - tier.width / 2, tier.height + .19, tier.z);
      this.api.skins().forEach((skin, index) => {
        const rear = index >= 4, x = rear ? -29 : -16, z = 10 - (index % 4) * 8;
        const floorY = rear ? tier.height : 0;
        this.buildHandPedestal(x,z,floorY,skin,dark,trim);
        const collar = this.mesh(new T.TorusGeometry(2.07,.055,6,32), trim, x, floorY + .3, z); collar.rotation.x = Math.PI / 2;
        this.solids.push({ x, z, hx: 2, hz: 2 });
        const label = this.text(skin.name, 6.4, x, floorY + 6.35, z, skin.edge, 48);
        const skillLabel = this.text(this.api.tr('handSkill_'+skin.skill),6.4,x,floorY+7.24,z,skin.edge,39);
        const price = this.text('', 6, x, floorY + 5.48, z, '#f3dfb0', 40);
        const zone = this.pad('hand:' + skin.id, x + 4.3, z, skin.accent, () => this.api.equip(skin.id), skin.name, () => this.api.handStatus(skin), floorY);
        Object.assign(zone, { skin, pedestal: { x, z, floorY, yaw: Math.PI / 2 }, price, label, skillLabel });
        for(const entry of [label,price,skillLabel]){entry.mesh.userData.click=()=>this.invokeZone(zone);this.clickable.push(entry.mesh);}
      });
      this.buildMonitor(dark, trim);
      this.buildWheel(dark, trim);
      this.buildFlappyStand(dark, trim);
      this.buildPortal('games', 0, '#e6bc6e', dark, trim);
      this.adIcons = [];
      this.buildAdStand(dark, 'rebirth', -9, 22, 'REBIRTH', () => this.api.openPanel('rebirth'));
      this.buildAdStand(dark, 'missions', -16, 22, this.api.tr('hubMissions'), () => this.api.openPanel('missions'));
      this.buildAdStand(dark, 'ad-score', 9, 22, '2× SCORE', () => this.api.rewardScore());
      this.buildAdStand(dark, 'ad-speed', 16, 22, '2× SPEED', () => this.api.rewardSpeed());
      this.buildPlazaDetails(trim, dark);
      this.buildGuidance();
      this.buildWayfinding();
      this.buildCourtyardFurnishings(dark,trim);
      this.batchStaticArchitecture();
      this.buildPlayfulDecor();
      this.monitorDirty = true;
    }

    buildPlayfulDecor() {
      // Shared geometry + instancing: four draw calls, no new lights, GLBs or
      // per-frame garbage. Friendly elemental companions stay above the paths.
      const T = this.T, count = this.mobile ? 8 : 12;
      this.companionCount = count;
      this.companionDummy = new T.Object3D();
      this.companionBodies = new T.InstancedMesh(this.track(new T.IcosahedronGeometry(.74, 1)),
        this.material('#ffffff', { roughness: .62, metalness: .04 }), count);
      this.companionEyes = new T.InstancedMesh(this.track(new T.SphereGeometry(.085, 6, 4)),
        this.track(new T.MeshBasicMaterial({ color: '#152333' })), count * 2);
      this.companionWings = new T.InstancedMesh(this.track(new T.OctahedronGeometry(.3, 0)),
        this.material('#fff1c6', { roughness: .85 }), count * 2);
      this.companionPositions = [];
      const colors = ['#ffbc58', '#67dfc9', '#c6a2ff', '#7acbff', '#ff96b3', '#d5ed80'];
      for (let i = 0; i < count; i++) {
        this.companionPositions.push(i < 4
          ? { x: [-22, -15, 15, 22][i], z: -27, y: 7.3 + i % 2 * .35, facing: 0 }
          : { x: i % 2 ? 26 : -26, z: -10 + Math.floor((i - 4) / 2) * 9, y: 7.4 + (i % 3) * .6, facing: i % 2 ? -Math.PI / 2 : Math.PI / 2 });
        this.companionBodies.setColorAt(i, new T.Color(colors[i % colors.length]));
      }
      for (const mesh of [this.companionBodies, this.companionEyes, this.companionWings]) {
        mesh.instanceMatrix.setUsage(T.DynamicDrawUsage); mesh.frustumCulled = false;
        mesh.name = 'lobby-elemental-companions'; this.scene.add(mesh);
      }
      const flagGeometry = this.track(new T.BufferGeometry());
      flagGeometry.setAttribute('position', new T.Float32BufferAttribute([-.42, .35, 0, .42, .35, 0, 0, -.5, 0], 3));
      this.festivalFlags = new T.InstancedMesh(flagGeometry,
        this.track(new T.MeshBasicMaterial({ color: '#ffffff', side: T.DoubleSide, toneMapped: false })), 24);
      this.festivalFlags.frustumCulled = false;
      for (let i = 0; i < 24; i++) {
        this.companionDummy.position.set(-23 + i * 2, 10 - Math.sin(i / 23 * Math.PI) * 1.1, -28);
        this.companionDummy.rotation.set(0, 0, Math.cos(i / 23 * Math.PI) * -.13);
        this.companionDummy.scale.setScalar(1); this.companionDummy.updateMatrix();
        this.festivalFlags.setMatrixAt(i, this.companionDummy.matrix);
        this.festivalFlags.setColorAt(i, new T.Color(colors[i % colors.length]));
      }
      this.scene.add(this.festivalFlags);
      this.updatePlayfulDecor();
    }

    updatePlayfulDecor() {
      const d = this.companionDummy;
      if (!d) return;
      for (let i = 0; i < this.companionCount; i++) {
        const p = this.companionPositions[i], t = this.time * 1.25 + i * 1.7;
        const x = p.x + Math.sin(t * .6) * .35, y = p.y + Math.sin(t) * .42;
        const facing = p.facing;
        d.position.set(x, y, p.z); d.rotation.set(0, facing, Math.sin(t) * .1); d.scale.set(1, 1 + Math.sin(t * 2) * .025, 1);
        d.updateMatrix(); this.companionBodies.setMatrixAt(i, d.matrix);
        for (let j = 0; j < 2; j++) {
          const side = j ? 1 : -1, blink = Math.sin(t * .41) > .995 ? .14 : 1;
          d.position.set(x + Math.sin(facing) * .68 + Math.cos(facing) * side * .2, y + .1, p.z + Math.cos(facing) * .68 - Math.sin(facing) * side * .2);
          d.rotation.set(0, facing, 0); d.scale.set(1, blink * 1.45, .65); d.updateMatrix();
          this.companionEyes.setMatrixAt(i * 2 + j, d.matrix);
          d.position.set(x + Math.cos(facing) * side * .86, y + Math.sin(t * 3.2) * .11, p.z - Math.sin(facing) * side * .86);
          d.rotation.set(0, facing, side * (.3 + Math.sin(t * 3.2) * .35)); d.scale.set(.55, 1.3, .6); d.updateMatrix();
          this.companionWings.setMatrixAt(i * 2 + j, d.matrix);
        }
      }
      this.companionBodies.instanceMatrix.needsUpdate = true;
      this.companionEyes.instanceMatrix.needsUpdate = true;
      this.companionWings.instanceMatrix.needsUpdate = true;
    }

    async prepareForEntry() {
      if (this.entryPreparation) return this.entryPreparation;
      this.entryPreparation = this.prepareEntryResources();
      try { await this.entryPreparation; }
      finally { this.entryPreparation = null; }
    }

    async loadTutorialHat() {
      if (this.hatLoaded) return;
      if (this.hatLoading) return this.hatLoading;
      this.hatLoading = (async () => {
        const T = this.T, loader = new T.GLTFLoader();
        if (T.MeshoptDecoder) loader.setMeshoptDecoder(T.MeshoptDecoder);
        const root = (await loader.loadAsync('assets/cosmetics/tutorial-hat.glb?v=1.7.29')).scene;
        if (this.disposed) { this.disposeModel(root); return; }
        const box = new T.Box3().setFromObject(root), size = box.getSize(new T.Vector3());
        const scale = 2.25 / Math.max(size.x, size.z, .001);
        root.scale.setScalar(scale);
        root.position.set(-(box.min.x + box.max.x) * .5 * scale, .015 - box.min.y * scale, -(box.min.z + box.max.z) * .5 * scale);
        const orientation = new T.Group(); orientation.rotation.y = Math.PI; orientation.add(root);
        root.traverse(node => {
          if (!node.isMesh) return;
          this.track(node.geometry); node.castShadow = false; node.receiveShadow = false;
          for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
            this.track(material);
            material.roughness = Math.max(.75, material.roughness); material.envMapIntensity = .2;
            if (material.map) material.map.colorSpace = T.SRGBColorSpace;
            for (const value of Object.values(material)) if (value?.isTexture) this.track(value);
          }
        });
        this.avatarHat.add(orientation); this.hatLoaded = true;
      })();
      try { await this.hatLoading; } finally { this.hatLoading = null; }
    }

    async prepareEntryResources() {
      const started = performance.now(), r = this.api.renderer();
      const yieldBatch = () => new Promise(resolve => setTimeout(resolve, 16));
      this.preparingEntry = true; this.entryPrepared = false;
      try {
        this.build(); this.applyTheme(); this.refresh(true);
        // A transient cosmetic request must not strand the whole lobby. The
        // failed load releases hatLoading in finally; a later entry can retry.
        try { await window.ElementalPreparation.run('lobby-hat-model', () => this.loadTutorialHat()); }
        catch (_) { /* The earned hat/claim remain saved; only its 3D display is unavailable. */ }
        this.avatar.position.set(0, this.avatarHalfHeight, 5); this.updateCamera(1, true);
        await yieldBatch();
        // Only the first affordable display is on the critical boot path.
        // The other seven small stand LODs stream one at a time in the lobby.
        while (!this.models.size && this.zones.some(z => z.skin && !this.failedModels.has(z.skin.id))) {
          await this.streamModels(true); await yieldBatch();
        }
        // The run biome is not part of the first lobby frame. Prepare it only
        // after entering Games, while keeping the plaza's own GPU warmup here.
        if (this.savedPixelRatio == null) this.savedPixelRatio = r.getPixelRatio();
        const ratio = Math.min(window.devicePixelRatio || 1, this.mobile ? 1 : 1.25);
        if (r.getPixelRatio() !== ratio) r.setPixelRatio(ratio);
        this.camera.aspect = r.domElement.clientWidth / Math.max(1, r.domElement.clientHeight); this.camera.updateProjectionMatrix();
        const textures = new Set();
        this.scene.traverse(node => {
          for (const material of (Array.isArray(node.material) ? node.material : [node.material])) {
            if (material) for (const value of Object.values(material)) if (value?.isTexture) textures.add(value);
          }
        });
        let uploaded=0;for (const texture of textures) { r.initTexture(texture); if(++uploaded%4===0)await yieldBatch(); }
        // Prepare the exact first-frame instancing/color shader variant too.
        // An inactive menu normally hides guidance; visibility during compile
        // is temporary and cannot enable controls or emit a lifecycle event.
        const state = this.state;
        this.state = 'exploring'; this.updateGuidance(0); this.state = state;
        const warmOnly = [this.guideArrows, this.guideOutline, this.guideGoal, this.celebration, this.progressRing, this.avatarHat];
        const visibility = warmOnly.map(mesh => mesh.visible);
        for (const mesh of warmOnly) mesh.visible = true;
        this.scene.updateMatrixWorld(true);
        // Upload even off-camera stand buffers, behind the loading screen.
        const culling = [], target = r.getRenderTarget(), auto = r.autoClear;
        this.scene.traverse(node => { if (node.isMesh || node.isPoints) { culling.push([node, node.frustumCulled]); node.frustumCulled = false; } });
        try {
          if (r.compileAsync) await window.ElementalGraphicsEngine.compileAsyncSafe(r, this.scene, this.camera);
          else r.compile(this.scene, this.camera);
          r.autoClear = true; this.ensureLobbyRenderer(); this.composer.render(0);
          // EffectComposer swaps targets even when the final pass writes to
          // screen. Warm its other ping-pong buffer before the first live frame.
          await yieldBatch(); this.composer.render(0);
        }
        finally { for (const [node, culled] of culling) node.frustumCulled = culled; warmOnly.forEach((mesh, index) => { mesh.visible = visibility[index]; }); r.autoClear = auto; r.setRenderTarget(target); }
        // Rendering has already submitted both display buffers. A driver fence
        // is only a best-effort drain, not an extra eight-second loading gate.
        await window.ElementalModeConcourse.drainGpu(this);
        this.entryPrepared = true;
        this.entryPreparationMs = Math.round(performance.now() - started);
      } finally { this.preparingEntry = false; }
    }

    buildSurfaceDetails() {
      this.courtyardMaps=new Map();this.floorMaterial.roughness=.93;
    }

    courtyardTexture(phase) {
      if(this.courtyardMaps.has(phase))return this.courtyardMaps.get(phase);
      const T=this.T,size=512,count=size*size;
      const color=new Uint8Array(count*4),normal=new Uint8Array(count*4),roughness=new Uint8Array(count*4),height=new Float32Array(count);
      // Periodic value noise: every octave and its finite-difference normals wrap.
      // Each tile covers ~5 metres, rather than stretching 512px over the courtyard.
      const hash=(x,y)=>{let n=Math.imul(x+139,374761393)^Math.imul(y+phase*31,668265263);n=Math.imul(n^(n>>>13),1274126177);return ((n^(n>>>16))>>>0)/4294967295;};
      const noise=(u,v,cells)=>{const x=u*cells,y=v*cells,ix=Math.floor(x),iy=Math.floor(y),x0=ix%cells,y0=iy%cells,x1=(ix+1)%cells,y1=(iy+1)%cells;let a=x-ix,b=y-iy;a=a*a*(3-2*a);b=b*b*(3-2*b);return (hash(x0,y0)*(1-a)+hash(x1,y0)*a)*(1-b)+(hash(x0,y1)*(1-a)+hash(x1,y1)*a)*b;};
      const palettes=[[[8,12,27],[26,39,64]],[[75,83,67],[114,124,93]],[[174,179,188],[221,225,224]],[[47,44,45],[81,69,63]],[[55,86,95],[102,137,139]],[[174,192,203],[230,239,241]]];
      const [low,high]=palettes[phase],warm=[180,58,12];
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const i=y*size+x,u=x/size,v=y/size;
        const coarse=noise(u,v,8),fine=noise(u,v,32),grit=hash(x,y);
        const sx=u*7,sy=v*7,cx=Math.floor(sx),cy=Math.floor(sy);let nearest=100,second=100,stoneShade=0;
        for(let oy=-1;oy<=1;oy++)for(let ox=-1;ox<=1;ox++){
          const gx=cx+ox,gy=cy+oy,wx=(gx+7)%7,wy=(gy+7)%7;
          const dx=gx+.18+hash(wx,wy)*.64-sx,dy=gy+.18+hash(wx+67,wy+31)*.64-sy,d=dx*dx+dy*dy;
          if(d<nearest){second=nearest;nearest=d;stoneShade=hash(wx+83,wy+91);}else if(d<second)second=d;
        }
        const border=Math.sqrt(second)-Math.sqrt(nearest),seam=Math.max(0,1-border/.045),lip=Math.min(1,border/.095);
        const wave=Math.sin(u*Math.PI*8+Math.sin(v*Math.PI*4)*1.4+coarse*2.5);
        const vein=Math.pow(Math.max(0,1-Math.abs(wave)),14);
        let tone=coarse*.57+fine*.25+grit*.18,h=coarse*.35+fine*.22+grit*.09;
        if(phase===2){tone=.68+tone*.22-vein*.19;h=vein*.08+fine*.06;}
        if(phase===4){tone=tone*.78+vein*.22;h=wave*.1+fine*.08;}
        if(phase===5){tone=.45+tone*.52;h=coarse*.18+fine*.16+grit*.09;}
        if(phase===0){tone=.3+fine*.25+grit*.13;h=fine*.06+grit*.025;}
        if(phase>0&&phase!==5){tone=tone*.6+stoneShade*.24+lip*.13;h=h*.35+lip*.16;}
        height[i]=h;
        for(let c=0;c<3;c++){
          let value=low[c]+(high[c]-low[c])*tone;
          if(phase===3)value=value*(1-seam*.75)+seam*warm[c];
          else if(phase>0&&phase!==5)value*=1-seam*(phase===1?.48:.3);
          if(phase===2)value-=vein*12;
          color[i*4+c]=value;
        }
        color[i*4+3]=255;
        const r=Math.round((phase===0?.7:phase===2?.65:phase===4?.78:.89)*255+fine*17);
        roughness[i*4]=roughness[i*4+1]=roughness[i*4+2]=r;roughness[i*4+3]=255;
      }
      for(let y=0;y<size;y++)for(let x=0;x<size;x++){
        const i=y*size+x,dx=(height[y*size+(x+1)%size]-height[y*size+(x+size-1)%size])*4;
        const dy=(height[((y+1)%size)*size+x]-height[((y+size-1)%size)*size+x])*4,len=Math.hypot(dx,dy,1);
        normal[i*4]=(-dx/len*.5+.5)*255;normal[i*4+1]=(-dy/len*.5+.5)*255;normal[i*4+2]=(1/len*.5+.5)*255;normal[i*4+3]=255;
      }
      const texture=(pixels,srgb)=>{const t=this.track(new T.DataTexture(pixels,size,size,T.RGBAFormat));t.colorSpace=srgb?T.SRGBColorSpace:T.NoColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(13.6,12.4);t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.anisotropy=Math.min(8,this.api.renderer().capabilities.getMaxAnisotropy());t.needsUpdate=true;return t;};
      let glow=null;
      if(phase===0){
        const canvas=document.createElement('canvas');canvas.width=canvas.height=size;
        const ctx=canvas.getContext('2d');ctx.putImageData(new ImageData(new Uint8ClampedArray(color),size,size),0,0);
        const emission=document.createElement('canvas');emission.width=emission.height=size;
        const e=emission.getContext('2d');e.fillStyle='#000';e.fillRect(0,0,size,size);
        // Seamless neon grid, matching the Cyber track. Baked once, no line meshes.
        for(const target of [ctx,e])for(let i=0;i<=512;i+=64){
          target.strokeStyle=i%128?'#08455f':'#00b9da';target.lineWidth=i%128?1:2;
          target.beginPath();target.moveTo(i,0);target.lineTo(i,512);target.stroke();
          target.strokeStyle=i%128?'#482057':'#b723b3';
          target.beginPath();target.moveTo(0,i);target.lineTo(512,i);target.stroke();
        }
        color.set(ctx.getImageData(0,0,size,size).data);
        glow=this.track(new T.CanvasTexture(emission));glow.colorSpace=T.SRGBColorSpace;glow.wrapS=glow.wrapT=T.RepeatWrapping;glow.repeat.set(13.6,12.4);
      }
      const maps={map:texture(color,true),normalMap:texture(normal,false),roughnessMap:texture(roughness,false),emissiveMap:glow};
      this.courtyardMaps.set(phase,maps);return maps;
    }

    buildCarpet() {
      const T=this.T,c=document.createElement('canvas');c.width=256;c.height=1024;const ctx=c.getContext('2d');
      ctx.fillStyle='#244957';ctx.fillRect(0,0,256,1024);
      for(let y=0;y<1024;y+=3){ctx.fillStyle=y%6?'#2b505c':'#294b57';ctx.fillRect(0,y,256,1);}
      for(let x=0;x<256;x+=4){ctx.fillStyle='rgba(190,204,186,.08)';ctx.fillRect(x,0,1,1024);}
      ctx.strokeStyle='#d2ba83';ctx.lineWidth=4;ctx.strokeRect(10,10,236,1004);ctx.lineWidth=1;ctx.strokeRect(20,20,216,984);
      for(let y=45;y<1000;y+=34)for(const x of [31,225]){ctx.beginPath();ctx.moveTo(x,y-7);ctx.lineTo(x+5,y);ctx.lineTo(x,y+7);ctx.lineTo(x-5,y);ctx.closePath();ctx.stroke();}
      for(const y of [165,515,860]){ctx.save();ctx.translate(128,y);ctx.strokeStyle='#a9c9bb';ctx.lineWidth=3;ctx.beginPath();ctx.moveTo(0,-38);ctx.lineTo(30,0);ctx.lineTo(0,38);ctx.lineTo(-30,0);ctx.closePath();ctx.stroke();ctx.restore();}
      const map=this.track(new T.CanvasTexture(c));map.colorSpace=T.SRGBColorSpace;map.anisotropy=Math.min(8,this.api.renderer().capabilities.getMaxAnisotropy());
      this.carpetMaterial=this.material('#ffffff',{map,roughness:1,metalness:0});
      this.carpet=this.mesh(new T.PlaneGeometry(5.6,49),this.carpetMaterial,0,.073,-1);this.carpet.rotation.x=-Math.PI/2;
    }

    buildHandPedestal(x,z,y,skin,dark,trim) {
      const T=this.T,accent=this.material(skin.accent,{emissive:skin.accent,emissiveIntensity:.28,metalness:.35,roughness:.48});
      this.contactShadow(x,z,6.5,6.5,y+.052);
      const profile=[[0,0],[1.85,0],[2.05,.16],[2.05,.28],[1.8,.42],[1.65,1.4],[1.92,1.56],[1.92,1.72],[1.75,1.82],[0,1.82]].map(([r,h])=>new T.Vector2(r,h));
      this.mesh(new T.LatheGeometry(profile,24),dark,x,y,z);
      this.mesh(new T.CylinderGeometry(1.7,1.7,.045,32),this.material('#71828d',{metalness:.42,roughness:.4}),x,y+1.83,z);
      const ring=this.mesh(new T.TorusGeometry(1.85,.055,6,32),accent,x,y+1.69,z);ring.rotation.x=Math.PI/2;
      // Radial metal fins add a clear silhouette without extra texture assets.
      const batch=new T.InstancedMesh(this.track(new T.BoxGeometry(.075,.95,.15)),trim,8),dummy=new T.Object3D();
      for(let i=0;i<8;i++){const a=i*Math.PI/4;dummy.position.set(x+Math.sin(a)*1.78,y+.91,z+Math.cos(a)*1.78);dummy.rotation.y=a;dummy.updateMatrix();batch.setMatrixAt(i,dummy.matrix);}
      batch.computeBoundingSphere();this.track(batch);this.scene.add(batch);
    }

    buildCourtyardFurnishings(dark,trim) {
      const T=this.T;
      // Set dressing stays against the perimeter, outside stair/portal routes.
      for(const z of [-17,14]) {
        this.contactShadow(30,z,5,8);
        this.bevelBox(1.8,.55,5.6,this.stoneMaterial,30,.8,z);
        for(const end of [-1,1])this.bevelBox(1.5,.65,.55,dark,30,.33,z+end*2.1);
        this.solids.push({x:30,z,hx:1,hz:2.9});
      }
      this.planterLeaves=[];
      const leafMat=this.material('#5d967b',{roughness:.82}),potMat=this.material('#536b78',{roughness:.65,metalness:.16});
      for(const x of [-30,30])for(const z of [-28,25]){
        this.contactShadow(x,z,5.3,5.3);
        this.mesh(new T.CylinderGeometry(1.3,1.05,1.1,8),potMat,x,.55,z);
        this.mesh(new T.CylinderGeometry(1.21,1.21,.05,12),dark,x,1.13,z);
        const foliage=new T.Group();foliage.position.set(x,1.1,z);this.scene.add(foliage);
        for(let i=0;i<5;i++){
          const leaf=this.mesh(new T.SphereGeometry(1,6,4),leafMat,Math.sin(i*2.4)*.6,.6+(i%2)*.45,Math.cos(i*2.4)*.6,foliage);
          leaf.scale.set(.45,1.2,.23);leaf.rotation.set(.3*Math.cos(i),i*2.4,.3*Math.sin(i));
        }
        this.planterLeaves.push(foliage);this.solids.push({x,z,hx:1.35,hz:1.35});
      }
      this.foliageMaterial=leafMat;
      // Keep the central approach to the single Games portal unobstructed.
      const statsGroup=new T.Group();statsGroup.position.set(24,0,-13);statsGroup.rotation.y=-Math.atan2(24,13);this.scene.add(statsGroup);
      const statsBefore=new Set(this.scene.children);
      const crest=this.mesh(new T.OctahedronGeometry(.72),trim,24,2.35,-13);
      this.animatedDecor.push({mesh:crest,y:2.35,phase:0,spin:.32});
      this.mesh(new T.CylinderGeometry(.9,1.1,.65,8),dark,24,.325,-13);
      this.mesh(new T.CylinderGeometry(1.25,1.5,.28,12),trim,24,.14,-13);
      this.mesh(new T.TorusGeometry(.76,.07,6,24),trim,24,1.25,-13).rotation.x=Math.PI/2;
      for(const side of [-1,1]){this.bevelBox(.26,3.3,.4,dark,24+side*1.7,1.7,-13,this.scene,.07);this.box(.08,2.6,.08,trim,24+side*1.7,1.9,-12.76);}
      this.contactShadow(24,-13,3.4,3.4);
      this.solids.push({x:24,z:-13,hx:1.1,hz:1.1});
      this.statsTitle=this.text(this.copy('STATS','İSTATİSTİKLER'),6.5,24,4.15,-13,'#efd598',48);
      this.pad('stats',22,-9.5,'#e5c27b',()=>this.api.openPanel('stats'),this.copy('STATS','İSTATİSTİKLER'),()=>this.copy('Best times & medals','En iyi süreler ve madalyalar'));
      for(const node of [...this.scene.children])if(!statsBefore.has(node)){node.position.x-=24;node.position.z+=13;statsGroup.add(node);}
      const statsZone=this.zones.find(z=>z.id==='stats'),turn=new T.Vector3(statsZone.x-24,0,statsZone.z+13).applyAxisAngle(new T.Vector3(0,1,0),statsGroup.rotation.y);statsZone.x=24+turn.x;statsZone.z=-13+turn.z;this.statsGroup=statsGroup;
    }

    batchStaticArchitecture(root = this.scene) {
      // Merge only immutable, opaque architecture. Interactive meshes, theme
      // switches, canvas labels, the cube and animations keep their own nodes.
      const excluded=new Set([this.body,this.floorSurface,this.wheel,this.sunDisc,...this.clickable,...this.adIcons,...this.portalHalos,...this.animatedDecor.map(d=>d.mesh)]);
      for(const portal of this.portalPreviews||[])if(portal.completionLabel)excluded.add(portal.completionLabel.mesh);
      for(const zone of this.zones){excluded.add(zone.base);excluded.add(zone.rim);}
      const buckets=new Map();this.scene.updateMatrixWorld(true);
      root.traverse(node=>{
        if(!node.isMesh || node.isInstancedMesh || excluded.has(node) || Array.isArray(node.material) || node.material.transparent || !node.geometry.attributes.normal || !node.geometry.attributes.uv)return;
        for(let p=node.parent;p;p=p.parent)if(p===this.avatar)return;
        const list=buckets.get(node.material)||[];list.push(node);buckets.set(node.material,list);
      });
      let removed=0;
      for(const [material,nodes] of buckets){
        if(nodes.length<3)continue;
        const geometries=nodes.map(n=>{const g=n.geometry.index?n.geometry.toNonIndexed():n.geometry.clone();g.applyMatrix4(n.matrixWorld);return g;});
        const count=geometries.reduce((sum,g)=>sum+g.attributes.position.count,0),merged=new this.T.BufferGeometry();
        for(const [name,size] of [['position',3],['normal',3],['uv',2]]){
          const data=new Float32Array(count*size);let offset=0;
          for(const g of geometries){data.set(g.attributes[name].array,offset);offset+=g.attributes[name].array.length;}
          merged.setAttribute(name,new this.T.BufferAttribute(data,size));
        }
        merged.computeBoundingSphere();const mesh=new this.T.Mesh(this.track(merged),material);mesh.name='batched-lobby-architecture';root.add(mesh);
        for(const node of nodes)node.removeFromParent();for(const g of geometries)g.dispose();removed+=nodes.length-1;
      }
      this.staticDrawCallsSaved=(this.staticDrawCallsSaved||0)+removed;
    }

    buildEnclosure() {
      const T = this.T;
      this.wallTextureCache = new Map();
      this.wallMaterial = this.material('#ffffff', { roughness: .94 });
      this.wallFrameMaterial = this.material('#314b60');
      this.wallAccentMaterial = this.material('#79d9cf', { emissive: '#79d9cf', emissiveIntensity: .35 });
      this.enclosure = new T.Group(); this.enclosure.name = 'themed-courtyard-walls'; this.scene.add(this.enclosure);
      // Full opaque walls, including both formerly empty ends. Portals trigger
      // inside the courtyard; their tunnels terminate against the rear wall.
      this.wallSides = [
        { x: 0, z: -33, yaw: 0, width: 69 },
        { x: 0, z: 29, yaw: Math.PI, width: 69 },
        { x: -34, z: -2, yaw: Math.PI / 2, width: 63 },
        { x: 34, z: -2, yaw: -Math.PI / 2, width: 63 }
      ];
      const instances = [], accents = [];
      for (const side of this.wallSides) {
        const group = new T.Group(); group.position.set(side.x, 0, side.z); group.rotation.y = side.yaw; this.enclosure.add(group);
        this.box(side.width, 13.4, .9, this.wallMaterial, 0, 6.7, 0, false, group);
        for (const y of [.55, 9.5, 13.35]) this.box(side.width, .32, 1.06, this.wallFrameMaterial, 0, y, 0, false, group);
        this.box(side.width, .085, .09, this.wallAccentMaterial, 0, 9.72, .56, false, group);
        const count = Math.round(side.width / 8);
        for (let i = 0; i <= count; i++) {
          const x = -side.width / 2 + i * side.width / count;
          const transform = (y, z) => new T.Vector3(x, y, z).applyAxisAngle(new T.Vector3(0,1,0), side.yaw).add(group.position);
          instances.push({ p: transform(6.7, .53), yaw: side.yaw });
          accents.push({ p: transform(7.8, 1.02), yaw: side.yaw });
        }
      }
      // One draw call for all buttresses, one for all inset lamps.
      for (const [list, geometry, material] of [
        [instances, new T.BoxGeometry(.65,13.4,.85), this.wallFrameMaterial],
        [accents, new T.BoxGeometry(.22,1.9,.12), this.wallAccentMaterial]
      ]) {
        const batch = new T.InstancedMesh(this.track(geometry), material, list.length), dummy = new T.Object3D();
        list.forEach((item,i) => { dummy.position.copy(item.p); dummy.rotation.y=item.yaw; dummy.updateMatrix(); batch.setMatrixAt(i,dummy.matrix); });
        batch.instanceMatrix.needsUpdate=true; batch.computeBoundingSphere(); this.track(batch); this.enclosure.add(batch);
      }
      // Distinct architectural crests, cached per theme and shown one at a time.
      this.wallCrests = Array.from({length:6}, (_,phase) => {
        const group = new T.Group(); this.enclosure.add(group);
        const leaf=new T.Shape();leaf.moveTo(0,-1);leaf.bezierCurveTo(-1.1,-.1,-.75,.9,0,1.15);leaf.bezierCurveTo(.75,.9,1.1,-.1,0,-1);
        const geo = phase===0 ? new T.BoxGeometry(1.5,1.5,.25)
          : phase===1 ? new T.ExtrudeGeometry(leaf,{depth:.18,bevelEnabled:true,bevelSize:.055,bevelThickness:.04,bevelSegments:1,curveSegments:6,steps:1})
          : phase===2 ? new T.TorusGeometry(.8,.15,6,24)
          : phase===3 ? new T.OctahedronGeometry(.95)
          : phase===4 ? new T.TorusGeometry(.75,.24,6,20)
          : new T.IcosahedronGeometry(.9,0);
        const geometry=this.track(geo), dummy=new T.Object3D();
        const batch=new T.InstancedMesh(geometry,this.wallAccentMaterial,8);
        let index=0;
        for(const side of this.wallSides) for(const x of [-22,22]) {
          dummy.position.set(x,11.55,.68).applyAxisAngle(new T.Vector3(0,1,0),side.yaw);
          dummy.position.x+=side.x; dummy.position.z+=side.z;
          dummy.rotation.set(0,side.yaw,phase===0?Math.PI/4:0); dummy.updateMatrix(); batch.setMatrixAt(index++,dummy.matrix);
        }
        batch.computeBoundingSphere(); this.track(batch); group.add(batch); return group;
      });
    }

    wallTexture(phase) {
      if (this.wallTextureCache.has(phase)) return this.wallTextureCache.get(phase);
      if(phase===0)return this.cyberWallTexture();
      const canvas=document.createElement('canvas'); canvas.width=canvas.height=512;
      const ctx=canvas.getContext('2d');
      const palettes=[['#213342','#405564','#58d5dd'],['#475b59','#738481','#9fbc70'],['#afb8c3','#dce5ec','#e5be74'],['#302e32','#514448','#f89946'],['#284e60','#467c88','#78d4cc'],['#748d9e','#b7d1dc','#d6f5ff']];
      const [base,edge,accent]=palettes[phase];
      ctx.fillStyle=base; ctx.fillRect(0,0,512,512);
      let seed=phase+39; const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)>>>0;return seed/4294967296;};
      for(let row=0;row<8;row++) for(let col=-1;col<5;col++) {
        const x=col*128+(row%2)*64, y=row*64;
        ctx.fillStyle=edge; ctx.globalAlpha=.22+random()*.2; ctx.fillRect(x+2,y+2,124,60);
        ctx.globalAlpha=.45; ctx.fillStyle='#101921';ctx.fillRect(x,y,128,2);
        ctx.globalAlpha=.18;ctx.fillStyle='#ffffff';ctx.fillRect(x+3,y+3,120,1);
      }
      for(let i=0;i<3800;i++) {ctx.globalAlpha=random()*.085;ctx.fillStyle=i%2?'#ffffff':'#000000';ctx.fillRect(random()*512,random()*512,1+random()*3,1+random()*2);}
      ctx.globalAlpha=.7;ctx.strokeStyle=accent;ctx.lineWidth=2;
      if(phase===0) {
        ctx.globalAlpha=1;
        for(let row=0;row<2;row++)for(let col=0;col<2;col++){
          const x=col*256+12,y=row*256+12;
          const g=ctx.createLinearGradient(x,y,x+232,y+232);g.addColorStop(0,'#536474');g.addColorStop(.12,'#2c3c4b');g.addColorStop(1,'#1a2937');
          ctx.fillStyle=g;ctx.beginPath();ctx.roundRect(x,y,232,232,18);ctx.fill();ctx.strokeStyle='#78909c';ctx.globalAlpha=.6;ctx.lineWidth=1;ctx.stroke();ctx.globalAlpha=1;
          ctx.fillStyle='#0e1d29';ctx.fillRect(x+24,y+152,136,45);
          for(let vent=0;vent<6;vent++){ctx.fillStyle='#647783';ctx.fillRect(x+30,y+157+vent*6,122,2);}
          for(const sx of [12,219])for(const sy of [12,219]){ctx.fillStyle='#80929c';ctx.beginPath();ctx.arc(x+sx,y+sy,3,0,Math.PI*2);ctx.fill();}
          ctx.fillStyle=accent;ctx.fillRect(x+182,y+28,5,64);ctx.fillStyle='#9279b6';ctx.fillRect(x+195,y+28,5,38);
          ctx.font='bold 12px monospace';ctx.fillStyle='#afc5d0';ctx.fillText('ER / 0'+(row*2+col+1),x+25,y+40);
        }
        ctx.strokeStyle=accent;ctx.globalAlpha=.6;
        for(let x=32;x<512;x+=128){ctx.beginPath();ctx.moveTo(x,0);ctx.lineTo(x,100);ctx.lineTo(x+32,132);ctx.lineTo(x+32,350);ctx.lineTo(x,382);ctx.lineTo(x,512);ctx.stroke();}
      } else if(phase===1) {
        for(let i=0;i<100;i++){const x=random()*512,y=random()*512;ctx.fillStyle=i%2?'#637d43':'#93aa61';ctx.globalAlpha=.3;ctx.beginPath();ctx.ellipse(x,y,4+random()*9,2+random()*4,random()*6,0,Math.PI*2);ctx.fill();}
      } else if(phase===3 || phase===5) {
        for(let i=0;i<8;i++){let x=random()*512,y=0;ctx.beginPath();ctx.moveTo(x,y);while(y<512){x+=(random()-.5)*65;y+=25+random()*50;ctx.lineTo(x,y);}ctx.stroke();}
      } else {
        ctx.globalAlpha=.28;
        for(let y=32;y<512;y+=64){ctx.beginPath();for(let x=0;x<=512;x+=8)ctx.lineTo(x,y+Math.sin(x/40)*12);ctx.stroke();}
      }
      ctx.globalAlpha=1;
      const texture=this.track(new this.T.CanvasTexture(canvas));texture.colorSpace=this.T.SRGBColorSpace;
      texture.wrapS=texture.wrapT=this.T.RepeatWrapping;texture.repeat.set(8,2);
      texture.anisotropy=Math.min(4,this.api.renderer().capabilities.getMaxAnisotropy());
      this.wallTextureCache.set(phase,texture);return texture;
    }

    cyberWallTexture() {
      const T=this.T,c=document.createElement('canvas'),g=document.createElement('canvas');c.width=c.height=g.width=g.height=512;
      const ctx=c.getContext('2d'),glow=g.getContext('2d');ctx.fillStyle='#060b20';ctx.fillRect(0,0,512,512);glow.fillStyle='#000';glow.fillRect(0,0,512,512);
      // The same cyan/magenta window rhythm as Cyber's buildings, integrated into the enclosing walls.
      for(let tower=0;tower<4;tower++){
        const x=tower*128;
        ctx.fillStyle=tower%2?'#10162e':'#0b203a';ctx.fillRect(x+9,12,108,488);
        ctx.fillStyle='#304566';ctx.fillRect(x+7,0,3,512);ctx.fillRect(x+116,0,3,512);
        for(let row=0;row<14;row++)for(let col=0;col<3;col++){
          const px=x+18+col*31,py=24+row*33,active=(row*7+col*3+tower)%7!==0;
          const tint=(row+tower*2)%6===0?'#fa20cf':(row+col)%3===0?'#0481d4':'#00cbdf';
          ctx.fillStyle=active?tint:'#112b45';ctx.fillRect(px,py,23,22);
          if(active){glow.fillStyle=tint;glow.fillRect(px,py,23,22);}
          ctx.fillStyle='#426180';ctx.fillRect(px,py+24,23,2);
        }
        const tint=tower%2?'#ff23ce':'#00e3ff';
        for(const target of [ctx,glow]){target.fillStyle=tint;target.fillRect(x+4,0,2,512);}
      }
      const texture=canvas=>{const t=this.track(new T.CanvasTexture(canvas));t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.repeat.set(8,1);t.anisotropy=Math.min(4,this.api.renderer().capabilities.getMaxAnisotropy());return t;};
      const map=texture(c);this.cyberWallGlow=texture(g);this.wallTextureCache.set(0,map);return map;
    }

    buildWayfinding() {
      const T=this.T;
      // Broad, legible signs above shops, facing the centre instead of the camera.
      const hands=this.text(this.copy('HANDS','ELLER'),15,-32.85,10.7,-2,'#a9def5',54);hands.mesh.rotation.y=Math.PI/2;
      const upgrades=this.text('',18,32.85,11.3,-2,'#c0ecdd',50);upgrades.mesh.rotation.y=-Math.PI/2;
      this.wayfindingLabels={hands,upgrades};
      this.text('ELEMENTAL RUN',23,0,10.8,27.84,'#f2dfba',58).mesh.rotation.y=Math.PI;
      this.portalHalos=[];
      // The four retired mode portals no longer leave floating wall halos.
    }

    buildAdStand(dark, id, x, z, title, action) {
      const T = this.T;
      const group = new T.Group(); group.position.set(x, 0, z);
      group.rotation.y = Math.PI; this.scene.add(group);
      group.scale.setScalar(1.2);
      this.contactShadow(0,0,5.2,4.2,.055,group);
      this.bevelBox(3.5,1,2.2,dark,0,.5,0,group,.15);
      this.bevelBox(3.2,.14,2,this.material('#d7b575',{metalness:.4}),0,1.06,0,group,.04);
      this.bevelBox(2.6,2.65,.38,dark,0,2.1,-.5,group,.12);
      this.solids.push({ x, z, hx: 2.2, hz: 1.6 });
      const bolt = new T.Shape(); bolt.moveTo(.2, 1); bolt.lineTo(-.6, -.05); bolt.lineTo(-.05, -.05); bolt.lineTo(-.35, -1); bolt.lineTo(.65, .2); bolt.lineTo(.15, .2); bolt.closePath();
      if(id==='rebirth'){
        const emblem=new T.Group();emblem.position.y=2.2;group.add(emblem);
        this.mesh(new T.TorusGeometry(.73,.12,8,40,Math.PI*1.72),this.material('#c4b7ee',{emissive:'#8964c1',emissiveIntensity:.3}),0,0,0,emblem);
        this.mesh(new T.ConeGeometry(.24,.48,3),this.material('#e6d5ff'),.63,-.37,0,emblem).rotation.z=-.7;
        this.adIcons.push(emblem);
      }else if(id==='missions'){
        const emblem=new T.Group();emblem.position.y=2.2;group.add(emblem);
        this.bevelBox(1.35,1.75,.16,this.material('#d9ecd8'),0,0,0,emblem,.06);
        for(let i=0;i<3;i++)this.box(.82,.09,.04,this.material('#497d69'),.08,.45-i*.4,.11,false,emblem);
        this.adIcons.push(emblem);
      }else this.adIcons.push(this.mesh(new T.ExtrudeGeometry(bolt, { depth: .16, bevelEnabled: false }), this.material('#f6d58e', { emissive: '#df9b39', emissiveIntensity: .25 }), 0, 2.2, 0, group));
      const adTitle=this.text(title, 5.2, 0, 4.15, 0, '#ffe097', 54, group);
      this.adLabels ||= [];this.adLabels.push({id,label:adTitle});
      const status=this.text('',4.6,0,3.35,0,'#e5eaf0',34,group);
      this.adLabels[this.adLabels.length-1].status=status;
      const normal = new T.Vector3(0, 0, 1).applyEuler(group.rotation);
      const zone=this.pad(id, x + normal.x * 4.5, z + normal.z * 4.5, '#e8bf68', action, title, () => id==='missions'?this.api.tr('hubDaily'):id==='rebirth'?this.api.rebirthStatus():this.api.adsAvailable() ? this.copy('Watch an ad', 'Reklam izle') : this.copy('Available on Poki', 'Poki üzerinde kullanılabilir'));
      adTitle.mesh.userData.click=()=>this.invokeZone(zone);this.clickable.push(adTitle.mesh);
    }

    buildFlappyStand(dark, trim) {
      const T=this.T,x=26,z=12,group=new T.Group();
      group.position.set(x,0,z);group.rotation.y=Math.atan2(-x,5-z);this.scene.add(group);
      this.contactShadow(0,0,5,4,.055,group);
      this.bevelBox(3.8,.6,2.8,dark,0,.3,0,group,.15);
      this.bevelBox(3.3,4.8,2,dark,0,2.9,0,group,.16);
      const accent=this.material('#89d8b9',{emissive:'#57b58c',emissiveIntensity:.25});
      this.bevelBox(3.55,.3,2.2,trim,0,5.3,0,group,.07);
      this.bevelBox(3.6,.75,.55,accent,0,1.55,1.08,group,.1);
      this.mesh(new T.CylinderGeometry(.15,.15,.23,12),trim,-.85,2.03,1.1,group);
      for(let i=0;i<2;i++)this.mesh(new T.CylinderGeometry(.12,.12,.1,12),accent,.55+i*.4,1.98,1.1,group);
      const canvas=document.createElement('canvas');canvas.width=512;canvas.height=384;const ctx=canvas.getContext('2d');
      const sky=ctx.createLinearGradient(0,0,0,384);sky.addColorStop(0,'#163044');sky.addColorStop(1,'#335248');ctx.fillStyle=sky;ctx.fillRect(0,0,512,384);
      ctx.fillStyle='#244739';ctx.beginPath();ctx.moveTo(0,330);ctx.lineTo(110,280);ctx.lineTo(260,345);ctx.lineTo(400,275);ctx.lineTo(512,323);ctx.lineTo(512,384);ctx.lineTo(0,384);ctx.fill();
      for(const [px,top]of [[330,106],[460,142]]){ctx.fillStyle='#70583a';ctx.fillRect(px,0,46,top);ctx.fillRect(px,top+142,46,384-top-142);ctx.fillStyle='#79af8b';ctx.fillRect(px-5,top-12,56,12);ctx.fillRect(px-5,top+142,56,12);}
      ctx.shadowColor='#ffab48';ctx.shadowBlur=25;const flame=ctx.createRadialGradient(193,165,3,200,182,36);flame.addColorStop(0,'#fff7b0');flame.addColorStop(.5,'#ffb644');flame.addColorStop(1,'#e25943');ctx.fillStyle=flame;ctx.beginPath();ctx.ellipse(200,182,30,34,-.15,0,Math.PI*2);ctx.fill();ctx.shadowBlur=0;ctx.fillStyle='#183045';ctx.beginPath();ctx.arc(211,172,5,0,Math.PI*2);ctx.fill();
      const texture=this.track(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;
      this.arcadeScreen=this.mesh(new T.PlaneGeometry(2.75,2.06),this.track(new T.MeshBasicMaterial({map:texture,toneMapped:false})),0,3.55,1.015,group);
      this.arcadeTitle=this.text('FLAPPY',5,0,6.15,.1,'#a9ead0',52,group);
      this.arcadeStatus=this.text('',4.4,0,.8,1.43,'#f4db9c',38,group);
      this.solids.push({x,z,hx:2.2,hz:2.2});
      const normal=new T.Vector3(0,0,1).applyEuler(group.rotation);
      const zone=this.pad('flappy',x+normal.x*4.5,z+normal.z*4.5,'#80dab6',()=>this.api.openFlappy(),'FLAPPY',()=>this.api.tr('play'));
      for(const mesh of [this.arcadeScreen,this.arcadeTitle.mesh,this.arcadeStatus.mesh]){mesh.userData.click=()=>this.invokeZone(zone);this.clickable.push(mesh);}
    }

    buildPlazaDetails(trim, dark) {
      const T = this.T;
      // Lightweight kinetic sculptures frame the portals without obstructing
      // any approach/pad. Geometry-only animation adds no texture downloads.
      const gemMaterial = this.material('#86ead9', { emissive: '#36b89f', emissiveIntensity: .45, metalness: .28 });
      for (const x of [-3.8, 3.8]) {
        this.mesh(new T.CylinderGeometry(.7,1,.8,8), dark, x,.4,-22);
        const gem = this.mesh(new T.OctahedronGeometry(.65), gemMaterial, x,2,-22);
        this.animatedDecor.push({ mesh: gem, y: 2, phase: x, spin: .45 });
        const orbit = this.mesh(new T.TorusGeometry(1,.035,6,32), trim, x,2,-22);
        orbit.rotation.x = .8;
        this.animatedDecor.push({ mesh: orbit, y: 2, phase: x, spin: -.24 });
      }
      const motes = new Float32Array(32 * 3);
      for (let i=0;i<32;i++) { const angle=i*2.39996; const r=5.8+(i%3)*.4; motes[i*3]=Math.cos(angle)*r; motes[i*3+1]=.4+(i%5)*.13; motes[i*3+2]=Math.sin(angle)*r; }
      const geometry=this.track(new T.BufferGeometry()); geometry.setAttribute('position',new T.BufferAttribute(motes,3));
      this.plazaMotes=new T.Points(geometry,this.track(new T.PointsMaterial({color:'#ffe0a0',size:.065,transparent:true,opacity:.65,depthWrite:false})));
      this.plazaMotes.position.set(0,0,5); this.scene.add(this.plazaMotes);
    }


    applyTheme(force = false) {
      if (!this.scene) return;
      const phase = Math.max(0, Math.min(5, Math.floor(Number(this.api.theme?.()) || 0)));
      if (!force && phase === this.themePhase) return;
      this.themePhase = phase;
      this.wallMaterial.map=this.wallTexture(phase);this.wallMaterial.needsUpdate=true;
      this.wallMaterial.emissiveMap=phase===0?this.cyberWallGlow:null;
      this.wallMaterial.emissive.set(phase===0?'#ffffff':'#000000');this.wallMaterial.emissiveIntensity=.55;
      this.wallFrameMaterial.color.set(['#263b4b','#334c4b','#b1b5b6','#372e32','#294a58','#6b8498'][phase]);
      const accent=['#16e1ff','#a2bf75','#ecc778','#f29a54','#76d4c9','#bcf0ff'][phase];
      this.wallAccentMaterial.color.set(accent);this.wallAccentMaterial.emissive.set(accent);
      this.wallCrests.forEach((group,index)=>{group.visible=index===phase;});
      if(this.foliageMaterial)this.foliageMaterial.color.set(['#648ca8','#63a77c','#d4dfc1','#9f624e','#61b6ac','#adc7dd'][phase]);
      if(this.portalPreviews)for(const preview of this.portalPreviews)this.updatePortalTheme(preview,phase);
      // Match the runner's environment colors, not a separate lobby palette.
      const colors = ['#081726', '#87ceeb', '#ddeeff', '#2a0904', '#12383d', '#18294a'];
      const lights = ['#ffe2b0', '#fff0c6', '#ffffff', '#ffad73', '#d4f7ff', '#e9f6ff'];
      const sunColors = ['#ff00aa', '#ffff88', '#ffffff', '#ff7a1a', '#ffd45a', '#fff1a8'];
      const labels = ['CITY', 'NATURE', 'SKY', 'LAVA', 'WATER', 'SNOW'];
      this.scene.background.set(colors[phase]); this.scene.fog.color.set(colors[phase]);
      this.scene.fog.density = [.006, .002, .0012, .0085, .0026, .0048][phase];
      this.floorMaterial.color.set('#ffffff');Object.assign(this.floorMaterial,this.courtyardTexture(phase));this.floorMaterial.normalScale.set(.45,.45);this.floorMaterial.needsUpdate=true;
      this.floorMaterial.roughness=1;this.floorMaterial.metalness=phase===0?.22:.025;this.sun.color.set(lights[phase]);
      this.floorMaterial.emissive.set(phase===0?'#ffffff':'#000000');this.floorMaterial.emissiveIntensity=.6;
      this.sun.intensity=phase===0?1.5:2.6;this.hemisphere.intensity=phase===0?1.05:1.65;
      this.fillLight.color.set(phase===0?'#d557ff':'#bedfff');
      this.carpetMaterial.color.set(['#abd4e1','#bdd3a8','#fff0cd','#dfaf92','#a6e2db','#d2eaff'][phase]);
      this.hemisphere.color.set(lights[phase]);
      this.hemisphere.groundColor.set(['#263848','#405448','#667487','#382b32','#294c5a','#485b7c'][phase]);
      if (this.sunDisc) this.sunDisc.material.color.set(sunColors[phase]);
      if (this.starField) { this.starField.visible = phase === 0 || phase >= 3; this.starField.material.opacity = phase === 5 ? .55 : .38; }
      this.floorSurface.material = this.floorMaterial;
      this.themeLabel.set(labels[phase]);
      // Run assets are prepared by their own portal, never by entering a room.
    }

    buildPortal(mode, x, color, dark, trim) {
      const T=this.T;
      const frameMaterial=this.track(dark.clone());frameMaterial.emissive.set(color);
      frameMaterial.emissiveIntensity=0;
      this.contactShadow(x,-28,11,10);
      for(const side of [-1,1]){
        this.bevelBox(1.6,6.3,6.2,frameMaterial,x+side*3.2,3.15,-30,this.scene,.17);
        this.solids.push({x:x+side*3.2,z:-30,hx:.8,hz:3.1});
        this.bevelBox(2, .55,6.5,trim,x+side*3.2,.3,-30,this.scene,.1);
        this.bevelBox(1.8,.32,6.4,trim,x+side*3.2,5.8,-30,this.scene,.08);
      }
      this.bevelBox(8.5,1.35,6.6,dark,x,6.7,-30,this.scene,.2);
      this.bevelBox(8.8,.25,6.8,trim,x,7.37,-30,this.scene,.07);
      for (let z = -27; z >= -33; z -= 2) {
        const mat = this.material(color, { emissive: color, emissiveIntensity: .6 });
        this.box(.13, 5.3, .13, mat, x - 2.35, 2.65, z);
        this.box(.13, 5.3, .13, mat, x + 2.35, 2.65, z);
        this.box(4.8, .13, .13, mat, x, 5.3, z);
      }
      this.box(4.8, .05, 11, trim, x, .035, -28);
      const title = this.text('', 10, x, 6.8, -26.53, color, 62);
      const recordLabel = mode === 'level' ? this.text('', 10, x, 8.1, -26.53, '#f2d790', 44) : null;
      this.portalPreviews ||= [];
      const preview={mode,recordLabel,frameMaterial};this.portalPreviews.push(preview);
      // The camera approaches this backing wall before the handoff. A solid
      // black material cannot turn into a magnified/pixelated road illustration.
      preview.backing=this.mesh(new T.PlaneGeometry(4.65,5.3),this.track(new T.MeshBasicMaterial({color:0x000000,side:T.DoubleSide,toneMapped:false})),x,2.75,-32.35);
      const portalMaterial=this.track(new T.ShaderMaterial({
        uniforms:{uTime:{value:0},uColor:{value:new T.Color(color)},uEntry:{value:0},uUnplayed:{value:0}},
        vertexShader:'varying vec2 vUv; void main(){vUv=uv;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
        fragmentShader:`uniform float uTime;uniform vec3 uColor;uniform float uEntry;uniform float uUnplayed;varying vec2 vUv;
          void main(){vec2 p=(vUv-.5)*2.;float r=length(p);if(r>1.)discard;
          float a=atan(p.y,p.x);float spiral=.5+.5*sin(a*4.-r*16.+uTime*2.4);
          float ring=pow(.5+.5*sin(r*32.-uTime*3.),6.);
          float rim=smoothstep(.78,.98,r);float core=exp(-r*5.);
          vec3 col=mix(vec3(.012,.023,.045),uColor,.14+spiral*.16+ring*.12+rim*.65);
          col+=uColor*core*(.5+uEntry);col*=1.+uUnplayed*(1.4+.22*sin(uTime*2.1));gl_FragColor=vec4(col,1.);
          #include <tonemapping_fragment>
          #include <colorspace_fragment>
        }`,side:T.DoubleSide}));
      const surface=this.mesh(new T.PlaneGeometry(4.5,5.1),portalMaterial,x,2.75,-31.25);
      const ring=this.mesh(new T.TorusGeometry(1,.045,8,64),this.material(color,{emissive:color,emissiveIntensity:.6}),x,2.75,-31.18);ring.scale.set(2.25,2.55,1);
      preview.surface=surface;preview.portalMaterial=portalMaterial;preview.ring=ring;
      this.updatePortalTheme(preview,0);
      const zone = this.pad(mode, x, -29.8, color, () => this.transition(mode), '', () => '');
      zone.portal = true; zone.titleLabel = title;
      title.mesh.userData.click=()=>this.transition(mode);this.clickable.push(title.mesh);
      if (['games','obby','troll','flappy','plaza','soon'].includes(mode)) { title.set(mode==='games'?this.api.tr('hubGames'):mode==='obby'?'PARTY RUN':mode==='troll'?this.api.tr('trollObby'):mode==='plaza'?this.api.tr('surfLobby'):mode==='soon'?this.api.tr('comingSoon'):'FLAPPY'); if(mode==='games')this.gamesTitle=title;
        if(mode==='soon'){zone.portal=false;zone.radius=0;zone.action=()=>{};title.mesh.userData.click=()=>{};preview.disabled=true;}
        if(mode==='obby'||mode==='troll'){
          preview.levelLabel=this.text('',8,x,4.7,-26.53,'#dbf0df',36);preview.completionLabel=this.portalStar(x,8.5,-26.53);preview.levelArrows=[];
          for(const direction of [-1,1]){const a=this.portalArrow(direction,x+direction*3.2,3.2,-26.7);a.mesh.userData.click=()=>{(mode==='troll'?this.api.selectTrollLevel:this.api.selectPartyLevel)?.(direction);a.mesh.scale.setScalar(1.12);this.refresh(true);};this.clickable.push(a.mesh);preview.levelArrows.push({direction,arrow:a});}
        }
      } else if (mode === 'level') {
        this.levelTitle = title;
        preview.completionLabel=this.portalStar(x,9.1,-26.53);
      } else if (mode === 'runner2d') {
        title.set('2D RUN');
        const badge=this.text('',10,x,8.2,-26.53,'#a8f0e8',40);badge.hologram=true;
        preview.highScoreLabel=badge;preview.hologramY=8.2;
        badge.mesh.userData.click=()=>this.transition(mode);this.clickable.push(badge.mesh);
      } else if (mode === 'surf') {
        title.set('SURF & BHOP');
        preview.titleLabel=title;
        preview.levelLabel=this.text('',7.5,x,4.7,-26.53,'#dbf0ff',36);
        preview.levelArrows=[];
        preview.completionLabel=this.portalStar(x,9.1,-26.53);
        for(const direction of [-1,1]){
          const shape=new T.Shape();shape.moveTo(-.38,.72);shape.lineTo(.32,0);shape.lineTo(-.38,-.72);shape.lineTo(-.62,-.48);shape.lineTo(-.14,0);shape.lineTo(-.62,.48);shape.closePath();
          const arrow={mesh:this.mesh(new T.ShapeGeometry(shape),this.track(new T.MeshBasicMaterial({color:'#dbf0ff',transparent:true,opacity:1,side:T.DoubleSide,toneMapped:false})),x+direction*3.2,3.2,-26.7)};
          if(direction<0)arrow.mesh.rotation.z=Math.PI;
          arrow.mesh.userData.click=()=>{this.api.selectSurfLevel?.(direction);this.refresh(true);arrow.mesh.scale.setScalar(1.12);};this.clickable.push(arrow.mesh);preview.levelArrows.push({direction,arrow});
        }
        const badge=this.text('',10,x,8.2,-26.53,'#78d6ff',40);badge.hologram=true;
        preview.highScoreLabel=badge;preview.hologramY=8.2;
        badge.mesh.userData.click=()=>this.transition(mode);this.clickable.push(badge.mesh);
        for(let i=0;i<3;i++){const m=this.box(.8,.25+i*.18,1.1,trim,x-1.5+i*1.5,.35+i*.09,-25.7);m.rotation.z=-.12;}
      } else {this.endlessTitle=title;title.set(this.copy('ENDLESS RUN','SONSUZ KOŞU'));}
    }

    portalStar(x,y,z){
      const T=this.T,s=new T.Shape();for(let i=0;i<10;i++){const a=Math.PI/2+i*Math.PI/5,r=i%2?.31:.69,px=Math.cos(a)*r,py=Math.sin(a)*r;if(i)s.lineTo(px,py);else s.moveTo(px,py);}s.closePath();return{mesh:this.mesh(new T.ExtrudeGeometry(s,{depth:.06,bevelEnabled:true,bevelSize:.025,bevelThickness:.025,bevelSegments:1,steps:1}),this.material('#ffda7f',{emissive:'#b78636',emissiveIntensity:.65,metalness:.4}),x,y,z)};
    }
    portalArrow(direction,x,y,z){const T=this.T,s=new T.Shape();s.moveTo(-.38,.72);s.lineTo(.32,0);s.lineTo(-.38,-.72);s.lineTo(-.62,-.48);s.lineTo(-.14,0);s.lineTo(-.62,.48);s.closePath();const mesh=this.mesh(new T.ShapeGeometry(s),this.track(new T.MeshBasicMaterial({color:'#d9efdf',transparent:true,side:T.DoubleSide,toneMapped:false})),x,y,z);if(direction<0)mesh.rotation.z=Math.PI;return{mesh};}
    updatePortalTheme(preview,phase) {
      if(preview.phase===phase)return;preview.phase=phase;
      if(preview.portalMaterial)preview.portalMaterial.uniforms.uColor.value.set(preview.mode==='troll'?'#ff62d5':preview.mode==='soon'?'#858b92':preview.mode==='surf'?'#78d6ff':preview.mode==='runner2d'?'#e99e85':['#65d9bd','#a8da87','#efc77d','#ff9659','#68d8dc','#a8dfff'][phase]);
    }

    buildMonitor(dark, trim) {
      const T = this.T, x = 27, z = -2;
      const group = new T.Group(); group.position.set(x, 0, z);
      group.rotation.y = -Math.PI / 2; this.scene.add(group);
      group.scale.setScalar(1.3);
      this.contactShadow(0,0,12,5,.055,group);
      this.bevelBox(8.5,.45,2.5,dark,0,.25,0,group,.12);
      for(const side of [-1,1])this.bevelBox(.55,2.7,.55,trim,side*3.5,1.5,-.35,group,.08);
      this.bevelBox(9.5,6,.65,dark,0,4.1,0,group,.16);
      this.box(9.6, .1, .5, trim, 0, 7.15, 0, false, group);
      this.solids.push({ x, z, hx: 1.1, hz: 6.3 });
      const canvas = document.createElement('canvas'); canvas.width = 1024; canvas.height = 640;
      this.monitorCanvas = canvas; this.monitorCtx = canvas.getContext('2d');
      this.monitorTexture = this.track(new T.CanvasTexture(canvas)); this.monitorTexture.colorSpace = T.SRGBColorSpace;
      const screen = this.mesh(new T.PlaneGeometry(9.05, 5.67), this.track(new T.MeshBasicMaterial({ map: this.monitorTexture, toneMapped: false })), 0, 4.1, .34, group);
      screen.userData.click = (hit) => {
        const y = (1 - hit.uv.y) * 640;
        const index = Math.floor((y - 136) / 108);
        if (index >= 0 && index < 4 && y < 568) { this.api.buyUpgrade(index); this.refresh(true); }
        else if (y >= 574) this.api.openPanel('upgrades');
      };
      this.clickable.push(screen);
      this.monitorTitle=this.text(this.api.tr('upgrades').toLocaleUpperCase(), 10, 0, 7.65, .4, '#bce9df', 58, group);
      const normal = new T.Vector3(0, 0, 1).applyEuler(group.rotation);
      this.pad('upgrades', x + normal.x * 6.5, z + normal.z * 6.5, '#bce9df', () => this.api.openPanel('upgrades'), this.copy('UPGRADES', 'YÜKSELTMELER'), () => this.copy('Open upgrade panel', 'Yükseltmeleri aç'));
    }

    buildWheel(dark, trim) {
      const T = this.T, x = 0, z = 22;
      const group = new T.Group(); group.position.set(x, 0, z);
      group.rotation.y = Math.atan2(-x, 5 - z); this.scene.add(group);
      group.scale.setScalar(1.35);
      this.contactShadow(0,0,7,5,.055,group);
      this.bevelBox(4.3,.45,2.2,dark,0,.25,0,group,.14);
      for(const side of [-1,1])this.bevelBox(.42,3.7,.5,dark,side*1.1,2.1,-.45,group,.08);
      this.solids.push({ x, z, hx: 1.1, hz: 1.1 });
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
      this.wheel = this.mesh(new T.CircleGeometry(1.9, 64), this.track(new T.MeshBasicMaterial({ map: texture, side: T.DoubleSide, toneMapped: false })), 0, 3.5, .1, group);
      this.mesh(new T.TorusGeometry(1.98, .12, 8, 64), trim, 0, 3.5, .1, group);
      this.mesh(new T.CircleGeometry(.34,24),trim,0,3.5,.16,group);
      this.mesh(new T.OctahedronGeometry(.21),this.material('#f5edd9'),0,3.5,.35,group);
      const lamps=new T.InstancedMesh(this.track(new T.SphereGeometry(.055,6,4)),this.material('#ffe4ac',{emissive:'#ffe4ac',emissiveIntensity:.65}),24),dummy=new T.Object3D();
      for(let i=0;i<24;i++){const a=i*Math.PI/12;dummy.position.set(Math.sin(a)*1.99,3.5+Math.cos(a)*1.99,.22);dummy.updateMatrix();lamps.setMatrixAt(i,dummy.matrix);}lamps.computeBoundingSphere();this.track(lamps);group.add(lamps);
      this.mesh(new T.ConeGeometry(.2, .55, 3), this.material('#fff0bd'), 0, 5.65, .2, group).rotation.z = Math.PI;
      this.wheelTitle=this.text(this.copy('LUCKY WHEEL','ŞANS ÇARKI'),6.7,0,6.55,.1,'#f9dfa2',54,group);
      // A separate front fascia stays clear of the rim and pointer at every camera angle.
      this.wheelLabel = this.text('', 6.3, 0, 1.0, .62, '#eee6da', 44, group);
      const normal = new T.Vector3(0, 0, 1).applyEuler(group.rotation);
      this.pad('wheel', x + normal.x * 5, z + normal.z * 5, '#bf93e1', () => this.api.spin(), this.copy('LUCKY WHEEL', 'ŞANS ÇARKI'), () => this.api.wheelStatus());
      this.wheel.userData.click=()=>this.invokeZone(this.zones.find(z=>z.id==='wheel'));this.clickable.push(this.wheel);
    }

    createUi() {
      this.hud = document.createElement('section'); this.hud.id = 'hub-hud'; this.hud.hidden = true;
      this.hud.innerHTML = '<header><div class="hub-brand">ELEMENTAL <b>RUN</b><small>LOBBY</small></div><div id="hub-location"><span></span><strong></strong></div><div class="hub-tools"><span id="hub-wallet"></span><button id="hub-settings" type="button" aria-label="Settings">⚙</button></div></header><div id="hub-reticle" aria-hidden="true"></div><div id="hub-message" role="status" aria-live="polite"></div><div id="hub-prompt"><strong></strong><span></span><progress max="1.5" value="0"></progress></div><footer id="hub-hint"></footer><div id="hub-stick" aria-label="Move"><i></i></div><button id="hub-home" type="button" aria-label="Recenter camera">⌖</button>';
      document.body.appendChild(this.hud);
      const guide=document.createElement('button');guide.type='button';guide.id='hub-guide-note';guide.hidden=true;
      guide.addEventListener('click',event=>{this.api.onInteraction?.(event);if(this.lastGuideStage==='upgrades')this.api.openPanel('upgrades');else if(this.lastGuideStage==='games')this.transition('games');});this.hud.appendChild(guide);
      this.prompt = this.hud.querySelector('#hub-prompt'); this.message = this.hud.querySelector('#hub-message');
      this.entryCancel=document.createElement('button');this.entryCancel.id='hub-entry-cancel';this.entryCancel.type='button';this.entryCancel.hidden=true;this.entryCancel.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();this.cancelSurfEntry();});this.prompt.append(this.entryCancel);
      this.hud.querySelector('#hub-settings').onclick = (event) => { this.api.onInteraction?.(event); this.api.openPanel('settings'); };
      if (this.api.fullscreenAvailable?.()) {
        const fullscreen=document.createElement('button');fullscreen.id='hub-fullscreen';fullscreen.type='button';fullscreen.dataset.pokiFullscreen='';
        fullscreen.innerHTML='<svg viewBox="0 0 24 24" width="22" height="22" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H3v5m13-5h5v5M3 16v5h5m13-5v5h-5"/></svg>';
        fullscreen.addEventListener('click',event=>{event.preventDefault();event.stopPropagation();this.api.onInteraction?.(event);this.api.toggleFullscreen?.();});
        this.hud.querySelector('.hub-tools').insertBefore(fullscreen,this.hud.querySelector('#hub-settings'));
        this.api.syncFullscreenControls?.();
      }
      this.hud.querySelector('#hub-home').onclick = () => { this.yaw = 0; this.pitch = .48; };
      this.api.refreshRewards?.(this.hud);
    }

    show() {
      this.active = false; this.state = 'menu'; this.hud.hidden = true;
      this.api.refreshRewards?.(this.hud);
      document.body.classList.remove('hub-active', 'hub-gate-active');
    }
    rememberPosition(){if(!this.avatar)return;this.returnPose={hall:!!this.inConcourse,x:this.avatar.position.x,z:this.avatar.position.z,yaw:this.yaw,pitch:this.pitch,facing:this.avatar.rotation.y};}
    enter() {
      this.clearHandoff();
      this.pointer=null;
      try { if(!this.pointerLockWanted&&document.pointerLockElement)document.exitPointerLock(); } catch (_) {}
      this.build();const restore=this.returnPose;if(!!this.inConcourse!==!!restore?.hall)window.ElementalModeConcourse.setArea(this,!!restore?.hall);this.visited = true; this.active = true; this.state = 'exploring'; this.serial++;
      this.hud.hidden = false;
      this.prompt.classList.remove('is-surf-preparing');this.prompt.querySelector('progress').max=1.5;this.entryCancel.hidden=true;
      document.body.classList.remove('hub-gate-active'); document.body.classList.add('hub-active');
      const rx=restore?.x??0,rz=restore?.z??5;this.avatar.position.set(rx,this.floorHeightAt(rx,rz)+this.avatarHalfHeight,rz);this.avatar.rotation.set(0,restore?.facing??0,0);
      this.avatar.visible = true;
      if (this.savedPixelRatio == null) this.savedPixelRatio = this.api.renderer().getPixelRatio();
      const ratio = Math.min(window.devicePixelRatio || 1, this.mobile ? 1 : 1.25);
      if (this.api.renderer().getPixelRatio() !== ratio) this.api.renderer().setPixelRatio(ratio);
      this.velocity.set(0, 0); this.jumpVelocity = 0; this.yaw = restore?.yaw??0; this.pitch = restore?.pitch??.48;this.portalReentryUntil=this.time+.8;
      if(this.avatarMotion)Object.assign(this.avatarMotion,{move:0,landing:0,wasGrounded:true,vy:0,turn:0});
      this.keys.clear(); this.hold = 0; this.zone = null; this.latched = null;
      this.api.onEnter(); this.applyTheme(); this.refresh(); this.updateCamera(1, true);
      this.focusSurface();
      this.queuePointerRestore();
    }
    exit(options = {}) {
      this.active = false; this.state = 'inactive'; this.serial++; this.modelEpoch++;
      this.entryPrepared = false;
      this.keys.clear(); this.touchMove.set(0, 0); this.velocity.set(0, 0);
      this.hud.hidden = true;
      this.api.refreshRewards?.(this.hud);
      document.body.classList.remove('hub-active', 'hub-gate-active');
      const releaseRenderer = () => {
        this.releaseLobbyRenderer();
        if (this.savedPixelRatio != null) { this.api.renderer().setPixelRatio(this.savedPixelRatio); this.savedPixelRatio = null; }
      };
      // Free the heavy display copies; the runner's own selected-hand cache is separate.
      const ids = [...this.models.keys()];
      if (options.deferModels) {
        // One GLB per task, under the opaque runner preparation screen. Avoid
        // eight simultaneous texture/geometry deletions on the first run frame.
        const epoch = this.modelEpoch;
        this.modelReleasePromise = (async () => {
          // Let the opaque entry UI paint before changing the drawing buffer or
          // deleting the lobby's render targets (both can stall a weak driver).
          await new Promise(resolve => {
            const fallback = setTimeout(resolve, 80);
            requestAnimationFrame(() => requestAnimationFrame(() => { clearTimeout(fallback); resolve(); }));
          });
          if (this.active || this.modelEpoch !== epoch) return;
          releaseRenderer();
          for (const id of ids) {
            if (this.active || this.modelEpoch !== epoch) break;
            this.releaseModel(id);
            await new Promise(resolve => setTimeout(resolve, 0));
          }
        })();
      } else { releaseRenderer(); for (const id of ids) this.releaseModel(id); }
    }
    clearMovement() { this.keys.clear(); this.touchMove.set(0, 0); this.velocity.set(0, 0); }
    focusSurface() {
      // preventDefault on pointerdown suppresses the iframe's default focus.
      const surface = this.api.renderer().domElement;
      surface.tabIndex = 0;
      try { surface.focus({ preventScroll: true }); } catch (_) { surface.focus(); }
    }
    ensureLobbyRenderer() {
      const T=this.T,r=this.api.renderer();
      this.renderSize ||= new T.Vector2();r.getDrawingBufferSize(this.renderSize);
      const width=Math.max(1,this.renderSize.x),height=Math.max(1,this.renderSize.y);
      if(!this.composer){
        const target=new T.WebGLRenderTarget(width,height,{type:T.HalfFloatType,depthBuffer:true,samples:this.mobile?0:Math.min(2,r.capabilities.maxSamples)});
        this.composer=new T.EffectComposer(r,target);this.composer.setPixelRatio(1);
        this.composer.addPass(new T.RenderPass(this.scene,this.camera));
        this.composer.addPass(new T.OutputPass());
        if(!target.samples){this.lobbyFxaa=new T.ShaderPass(T.FXAAShader);this.composer.addPass(this.lobbyFxaa);}
        this.composerWidth=0;this.composerHeight=0;
      }
      if(this.composerWidth!==width||this.composerHeight!==height){
        this.composer.setSize(width,height);this.lobbyFxaa?.uniforms.resolution.value.set(1/width,1/height);this.composerWidth=width;this.composerHeight=height;
      }
    }
    releaseLobbyRenderer() {
      if(!this.composer)return;
      for(const pass of this.composer.passes)pass.dispose?.();this.composer.dispose();this.composer=null;this.lobbyFxaa=null;
    }
    blocked() { return this.api.blocked() || document.hidden || this.state !== 'exploring'; }
    queuePointerRestore() {
      if (this.pointerRestoreQueued || this.mobile || !this.active || !this.pointerLockWanted) return;
      this.pointerRestoreQueued = true;
      // Close handlers may stop propagation or temporarily close one panel
      // before opening another. Inspect the final state after the whole event.
      queueMicrotask(() => {
        this.pointerRestoreQueued = false;
        if (this.disposed || !this.active || this.mobile || !this.pointerLockWanted
            || this.blocked() || !document.hasFocus()
            || document.pointerLockElement === this.api.renderer().domElement) return;
        this.pointer = null;
        this.api.lockPointer?.();
      });
    }
    notify(text) { this.message.textContent = text; this.messageUntil = this.time + 3.5; }

    bindInput() {
      const movement = ['KeyW', 'KeyA', 'KeyS', 'KeyD', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'];
      // Capture before DOM close handlers; their stopPropagation must not hide
      // the gesture needed to restore lock after upgrades/rewards/stats close.
      for (const type of ['click', 'keyup']) window.addEventListener(type, event => {
        if (event.isTrusted) this.queuePointerRestore();
      }, true);
      window.addEventListener('focus', () => this.queuePointerRestore());
      window.addEventListener('keydown', (event) => {
        if (!this.active) return;
        if (event.isTrusted) this.queuePointerRestore();
        if (this.api.arcadeActive?.()) return;
        if (event.target.matches?.('input,select,textarea,[contenteditable="true"]')) return;
        if (event.target.closest?.('button') && ['Space','Enter'].includes(event.code)) return;
        if (!event.repeat && (movement.includes(event.code) || ['Space','Escape','ControlLeft','ControlRight'].includes(event.code))) this.api.onInteraction?.(event);
        if (event.code === 'Escape') { this.keys.clear();if(this.state==='transition')this.cancelSurfEntry();else if(this.state!=='cancelling')this.api.escape(); event.preventDefault(); event.stopImmediatePropagation(); return; }
        if((event.code==='ControlLeft'||event.code==='ControlRight')&&!event.repeat&&!this.blocked()){
          this.pointerLockWanted = !this.pointerLockWanted;
          if (!this.pointerLockWanted) {
            this.pointer = null;
            if(document.pointerLockElement)document.exitPointerLock();
          } else this.api.lockPointer?.();
          event.preventDefault();event.stopImmediatePropagation();return;
        }
        if (movement.includes(event.code)) {
          if (!this.blocked()) this.keys.add(event.code);
          event.preventDefault(); event.stopImmediatePropagation();
        }
        if (event.code === 'Space' && !event.repeat && !this.blocked()) {
          if (this.avatar.position.y <= this.floorHeightAt(this.avatar.position.x, this.avatar.position.z) + this.avatarHalfHeight + .04) this.jumpVelocity = 8.5;
          event.preventDefault(); event.stopImmediatePropagation();
        }
      }, true);
      window.addEventListener('keyup', (event) => {
        this.keys.delete(event.code);
        if (!this.keys.size && this.touchMove.lengthSq() < .01) this.velocity.set(0, 0);
        if (this.active && movement.includes(event.code)) {
          event.preventDefault(); event.stopImmediatePropagation();
        }
      }, true);
      window.addEventListener('blur', () => { this.keys.clear(); this.touchMove.set(0, 0); this.pointer = null; });
      document.addEventListener('visibilitychange', () => { this.keys.clear(); this.touchMove.set(0, 0); if (!document.hidden) this.queuePointerRestore(); });
      window.addEventListener('pointerdown', (event) => {
        if (!this.active || this.blocked() || event.target !== this.api.renderer().domElement) return;
        if(event.button!==0&&event.button!==2)return;
        this.focusSurface();
        this.api.onInteraction?.(event);
        this.pointer = { id: event.pointerId, button:event.button, orbit:event.pointerType==='touch'||event.button===2, x: event.clientX, y: event.clientY, sx: event.clientX, sy: event.clientY };
        // Pointer capture is forbidden while pointer lock is active. Lock may
        // also arrive between this check and the capture call in a Poki iframe.
        if (!document.pointerLockElement) {
          try { event.target.setPointerCapture?.(event.pointerId); } catch (_) {}
        }
        event.preventDefault(); event.stopImmediatePropagation();
      }, true);
      window.addEventListener('pointermove', (event) => {
        if (this.active && !this.blocked() && document.pointerLockElement === this.api.renderer().domElement) {
          this.yaw -= Math.max(-110, Math.min(110, event.movementX || 0)) * .005;
          this.pitch = Math.max(.18, Math.min(.9, this.pitch + Math.max(-110, Math.min(110, event.movementY || 0)) * .004));
          event.stopImmediatePropagation(); return;
        }
        const p = this.pointer;
        if (!p || event.pointerId !== p.id || !this.active || this.blocked()) return;
        if(!p.orbit)return;
        this.yaw -= (event.clientX - p.x) * .005;
        this.pitch = Math.max(.18, Math.min(.9, this.pitch + (event.clientY - p.y) * .004));
        p.x = event.clientX; p.y = event.clientY; event.preventDefault(); event.stopImmediatePropagation();
      }, true);
      window.addEventListener('pointerup', (event) => {
        const p = this.pointer; if (!p || p.id !== event.pointerId) return;
        this.pointer = null;
        if (p.button===0 && this.active && !this.blocked() && Math.hypot(event.clientX - p.sx, event.clientY - p.sy) < 8) this.pick(event.clientX, event.clientY);
        event.stopImmediatePropagation();
      }, true);
      window.addEventListener('pointercancel', () => { this.pointer = null; this.touchMove.set(0, 0); });
      window.addEventListener('contextmenu',event=>{if(this.active&&event.target===this.api.renderer().domElement){event.preventDefault();event.stopImmediatePropagation();}},true);
      const stick = this.hud.querySelector('#hub-stick');
      const move = (event) => {
        if (this.stickPointer !== event.pointerId) return;
        const r = stick.getBoundingClientRect(), dx = (event.clientX - r.left - r.width / 2) / (r.width * .35), dy = (event.clientY - r.top - r.height / 2) / (r.height * .35);
        this.touchMove.set(dx, dy); if (this.touchMove.length() > 1) this.touchMove.normalize();
        stick.firstElementChild.style.transform = `translate(${this.touchMove.x * 25}px,${this.touchMove.y * 25}px)`;
        event.preventDefault();
      };
      stick.onpointerdown = (event) => { if(this.blocked())return;this.focusSurface();this.api.onInteraction?.(event);this.stickPointer = event.pointerId; try { if (!document.pointerLockElement) stick.setPointerCapture(event.pointerId); } catch (_) {} move(event); };
      stick.onpointermove = move;
      stick.onpointerup = stick.onpointercancel = () => { this.stickPointer = null; this.touchMove.set(0, 0); stick.firstElementChild.style.transform = ''; };
    }

    pick(x, y) {
      const r = this.api.renderer().domElement.getBoundingClientRect();
      this.ndc.set((x - r.left) / r.width * 2 - 1, -(y - r.top) / r.height * 2 + 1);
      if(document.pointerLockElement===this.api.renderer().domElement)this.ndc.set(0,0);
      this.ray.setFromCamera(this.ndc, this.camera);
      const hit = this.ray.intersectObjects(this.clickable, false)[0];
      if (!hit) return;
      hit.object.userData.click(hit);
    }
    canMove(x, z) {
      const radius = this.avatarRadius;
      if (x < -33.04+radius || x > 33.04-radius || z < -32.55+radius || z > 28.55-radius) return false;
      // No snapping up the 3.1 m platform from its long face. A normal
      // step is reachable, but the raised showroom is entered via its stairs.
      if (this.avatar && this.floorHeightAt(x, z) > this.avatar.position.y - this.avatarHalfHeight + .56) return false;
      return !this.solids.some((s) => Math.abs(x - s.x) < s.hx + radius && Math.abs(z - s.z) < s.hz + radius);
    }
    floorHeightAt(x, z) {
      const tier = this.inConcourse?null:this.handTier;
      if (!tier) return 0;
      const dx = Math.abs(x - tier.x), distance = Math.abs(z - tier.z) - tier.length / 2;
      if (dx <= tier.width / 2 && distance <= 0) return tier.height;
      if (dx <= tier.stairWidth / 2 && distance > 0 && distance < tier.steps * tier.tread) {
        return (tier.steps - Math.floor(distance / tier.tread)) * tier.height / tier.steps;
      }
      return 0;
    }
    updateCamera(dt, instant = false) {
      const p = this.avatar.position, distance = 10.5;
      this.desiredCamera.set(p.x + Math.sin(this.yaw) * Math.cos(this.pitch) * distance, p.y + 1.15 + Math.sin(this.pitch) * distance, p.z + Math.cos(this.yaw) * Math.cos(this.pitch) * distance);
      // Shorten the camera boom at the courtyard walls. Never place it outside the floor.
      this.desiredCamera.x = Math.max(-32.9, Math.min(32.9, this.desiredCamera.x));
      this.desiredCamera.z = Math.max(-31.9, Math.min(27.9, this.desiredCamera.z));
      if(this.inConcourse){
        this.hallCameraRay ||= new this.T.Raycaster();this.hallCameraOrigin ||= new this.T.Vector3();this.hallCameraDirection ||= new this.T.Vector3();this.hallCameraHits ||= [];
        const cache=this.hallCameraProbe;
        if(cache&&cache.x===p.x&&cache.y===p.y&&cache.z===p.z&&cache.yaw===this.yaw&&cache.pitch===this.pitch)this.desiredCamera.copy(cache.position);
        else{const origin=this.hallCameraOrigin.copy(p);origin.y+=1.2;const direction=this.hallCameraDirection.copy(this.desiredCamera).sub(origin),distance=direction.length();direction.normalize();this.concourse.hall.root.updateMatrixWorld(true);this.hallCameraRay.set(origin,direction);this.hallCameraRay.near=.05;this.hallCameraRay.far=distance;this.hallCameraHits.length=0;this.hallCameraRay.intersectObject(this.concourse.hall.root,true,this.hallCameraHits);
          if(this.hallCameraHits.length)this.desiredCamera.copy(origin).addScaledVector(direction,Math.max(2,this.hallCameraHits[0].distance-.3));
          const next=cache||(this.hallCameraProbe={position:new this.T.Vector3()});Object.assign(next,{x:p.x,y:p.y,z:p.z,yaw:this.yaw,pitch:this.pitch});next.position.copy(this.desiredCamera);
        }
      }
      this.camera.position.lerp(this.desiredCamera, instant ? 1 : 1 - Math.exp(-9 * dt));
      this.look.set(p.x - Math.sin(this.yaw) * 3.8, p.y + 1.35, p.z - Math.cos(this.yaw) * 3.8); this.camera.lookAt(this.look);
    }

    update(dt) {
      if (!this.active) return;
      // The 2D arcade owns rendering while open. Keep the last lobby frame
      // behind its modal instead of spending GPU time drawing an unseen scene.
      if(this.api.arcadeActive?.()){this.pointerWasBlocked=true;this.clearMovement();this.pointer=null;this.prompt.hidden=true;this.progressRing.visible=false;return;}
      dt = Math.max(0, Math.min(.05, dt)); this.time += dt;
      if (this.state === 'transition') this.updateTransition(dt);
      else {
        const blocked = this.blocked();
        if (this.pointerWasBlocked && !blocked) this.queuePointerRestore();
        this.pointerWasBlocked = blocked;
        if (blocked) { this.keys.clear(); this.touchMove.set(0, 0); this.hold = 0; }
        const pad = navigator.getGamepads?.()?.[0];
        const stick = (index) => Math.abs(pad?.axes[index] || 0) > .18 ? pad.axes[index] : 0;
        const start = !!pad?.buttons[9]?.pressed;
        if (start && !this.gamepadStartHeld) this.api.escape();
        this.gamepadStartHeld = start;
        if (!blocked) { this.yaw -= stick(2) * dt * 2.1; this.pitch = Math.max(.18, Math.min(.9, this.pitch + stick(3) * dt * 1.3)); }
        const axisX = blocked ? 0 : Number(this.keys.has('KeyD') || this.keys.has('ArrowRight')) - Number(this.keys.has('KeyA') || this.keys.has('ArrowLeft')) + this.touchMove.x + stick(0);
        const axisZ = blocked ? 0 : Number(this.keys.has('KeyS') || this.keys.has('ArrowDown')) - Number(this.keys.has('KeyW') || this.keys.has('ArrowUp')) + this.touchMove.y + stick(1);
        // Polled axes and synthetic keys are not browser user gestures.
        if(!blocked&&document.hasFocus()&&navigator.userActivation?.hasBeenActive&&(stick(0)||stick(1)||stick(2)||stick(3)))this.api.onInteraction?.();
        if (!axisX && !axisZ) this.velocity.set(0, 0);
        const length = Math.max(1, Math.hypot(axisX, axisZ)), c = Math.cos(this.yaw), s = Math.sin(this.yaw);
        const tx = (axisX * c + axisZ * s) / length * 7.5, tz = (axisZ * c - axisX * s) / length * 7.5;
        const damping = 1 - Math.exp(-16 * dt);
        this.velocity.x += (tx - this.velocity.x) * damping; this.velocity.y += (tz - this.velocity.y) * damping;
        const p = this.avatar.position, nx = p.x + this.velocity.x * dt, nz = p.z + this.velocity.y * dt;
        if (this.canMove(nx, p.z)) p.x = nx; else this.velocity.x = 0;
        if (this.canMove(p.x, nz)) p.z = nz; else this.velocity.y = 0;
        const speed = this.velocity.length();
        const groundY = this.floorHeightAt(p.x, p.z), floorY = groundY + this.avatarHalfHeight;
        this.jumpVelocity = (this.jumpVelocity || 0) - 22 * dt;
        p.y = Math.max(floorY, p.y + this.jumpVelocity * dt);
        if (p.y === floorY) this.jumpVelocity = 0;
        this.avatarMotion.turn=0;
        if (speed > .2) {
          const target = Math.atan2(-this.velocity.x, -this.velocity.y);
          const diff = Math.atan2(Math.sin(target - this.avatar.rotation.y), Math.cos(target - this.avatar.rotation.y));
          this.avatar.rotation.y += diff * damping;
          this.avatarMotion.turn=dt?diff*damping/dt:0;
        }
        this.animateAvatar(dt,speed,p.y===floorY,this.jumpVelocity);
        this.shadow.position.set(p.x, groundY + .19, p.z);
        this.shadow.material.opacity = Math.max(.25, 1 - (p.y - floorY) * .15);
        this.updateCamera(dt); this.updateZones(dt, blocked);
      }
      this.refresh();
      this.updateGuidance(dt);
      this.updateFace(dt);
      for(const portal of this.portalPreviews){
        portal.portalMaterial.uniforms.uTime.value=this.time;
        portal.portalMaterial.uniforms.uUnplayed.value=portal.unplayed?1:0;
        portal.portalMaterial.uniforms.uEntry.value=this.state==='transition'&&this.transitionMode===portal.mode?Math.min(1,this.transitionTime/1.15):portal.unplayed?.55+.35*Math.sin(this.time*2.1):0;
        // Gentle continuous pulse, never a harsh on/off flash. Reduced motion
        // keeps a steady highlight. Reuse column meshes, no extra lights/FX.
        const pulse=this.guideMotion.matches?.75:.5+.5*Math.sin(this.time*2.1);
        if(portal.frameMaterial)portal.frameMaterial.emissiveIntensity=portal.unplayed?.03+pulse*.23:0;
        if(portal.ring){portal.ring.material.emissiveIntensity=portal.unplayed?1.3+2.8*pulse:.6;portal.ring.material.color.set(portal.unplayed?'#effff2':portal.portalMaterial.uniforms.uColor.value);}
        if(portal.highScoreLabel){portal.highScoreLabel.mesh.position.y=portal.hologramY+Math.sin(this.time*1.6)*.12;portal.highScoreLabel.mesh.material.opacity=.9+Math.sin(this.time*2)*.06;}
      }
      this.wheel.rotation.z = -(this.api.wheelRotation() || 0) * Math.PI / 180;
      for (const icon of this.adIcons) {
        icon.position.y = 2.2 + Math.sin(this.time * 1.8) * .1;
        icon.rotation.y = Math.sin(this.time * .6) * .25;
      }
      for (const decor of this.animatedDecor) {
        decor.mesh.position.y = decor.y + Math.sin(this.time * 1.35 + decor.phase) * .13;
        decor.mesh.rotation.y = this.time * decor.spin;
      }
      this.plazaMotes.rotation.y = this.time * .06;
      this.updatePlayfulDecor();
      for(const halo of this.portalHalos){halo.rotation.z=this.time*.2;halo.scale.setScalar(1+Math.sin(this.time*1.4)*.025);}
      for (const hand of this.models.values()) hand.rotation.y = hand.userData.baseYaw + this.time * .19;
      for(const zone of this.zones)if(zone.skin){zone.label.mesh.quaternion.copy(this.camera.quaternion);zone.price.mesh.quaternion.copy(this.camera.quaternion);zone.skillLabel.mesh.quaternion.copy(this.camera.quaternion);}
      if (this.messageUntil < this.time) this.message.textContent = '';
      // GPU work is restricted to a covered transition. Keep the previous
      // canvas frame under that DOM layer; never throttle interactive hall FPS.
      if(this.renderSuspended)return;
      const r = this.api.renderer(), canvas = r.domElement;
      const aspect = canvas.clientWidth / Math.max(1, canvas.clientHeight);
      if (this.camera.aspect !== aspect) { this.camera.aspect = aspect; this.camera.updateProjectionMatrix(); }
      const target = r.getRenderTarget(), auto = r.autoClear;
      r.info.reset();window.ElementalGraphicsEngine.prepareDisplay(r,this.T);r.autoClear = true;
      try{this.ensureLobbyRenderer();this.composer.render(dt);}
      finally{r.autoClear=auto;r.setRenderTarget(target);}
    }

    animateAvatar(dt,speed,grounded,vy){
      const m=this.avatarMotion,k=1-Math.exp(-12*dt);m.move+=(Math.min(1,speed/7.5)-m.move)*k;m.phase+=dt*(2+speed*1.55);
      if(grounded&&!m.wasGrounded)m.landing=Math.min(.13,Math.abs(m.vy)*.012);m.landing*=Math.exp(-12*dt);m.wasGrounded=grounded;m.vy=vy;
      const breath=Math.sin(this.time*2.1)*.006,step=grounded?Math.abs(Math.sin(m.phase))*.065*m.move:0,stretch=grounded?0:Math.min(.045,Math.abs(vy)*.004);
      this.body.position.y=breath+step-m.landing*.3;this.body.scale.set(1+m.landing*.42-stretch*.35,1-m.landing+stretch,1+m.landing*.42-stretch*.35);
      const lean=grounded?-.095*m.move:Math.max(-.08,Math.min(.08,-vy*.006)),bank=Math.max(-.07,Math.min(.07,-(m.turn||0)*.012))+(grounded?Math.sin(m.phase)*.025*m.move:0);
      this.body.rotation.x+=(lean-this.body.rotation.x)*k;this.body.rotation.z+=(bank-this.body.rotation.z)*k;
    }
    updateFace(dt) {
      if(this.time>=this.faceBlinkAt){this.faceBlinkTime=.18;this.faceBlinkAt=this.time+3.2+Math.sin(this.time*1.7)*.8;}
      this.faceBlinkTime=Math.max(0,this.faceBlinkTime-dt);
      const blink=this.faceBlinkTime>0?1-Math.sin(this.faceBlinkTime/.18*Math.PI)*.94:1;
      const air=this.avatar.position.y>this.floorHeightAt(this.avatar.position.x,this.avatar.position.z)+this.avatarHalfHeight+.2;
      const excited=this.state==='preparing'||this.state==='transition'||!!this.zone;
      this.faceExcitement+=(Number(excited)-this.faceExcitement)*(1-Math.exp(-8*dt));
      for(let i=0;i<2;i++){
        const side=i?1:-1,eye=this.faceEyes[i];
        eye.scale.y=.16*blink*(1+this.faceExcitement*.12);
        eye.position.x=side*.32+Math.sin(this.time*.65)*.025;
        this.faceBrows[i].position.y=.43+(air?.075:this.faceExcitement*.055);
        this.faceBrows[i].rotation.z=side*(air?-.12:.06+this.faceExcitement*.1);
      }
      this.faceSmile.visible=!air;this.faceSurprise.visible=air;
      this.faceSmile.scale.set(1+this.faceExcitement*.18,1+this.faceExcitement*.22,1);
    }

    prepareHandAppearance(root) {
      root.userData.appearanceMaterials=[];
      const seen=new Set();
      root.traverse(node=>{
        for(const material of (Array.isArray(node.material)?node.material:[node.material])){
          if(!material||seen.has(material))continue;seen.add(material);
          const state={saturation:{value:1},brightness:{value:1}};
          const compile=material.onBeforeCompile,cacheKey=material.customProgramCacheKey();
          material.onBeforeCompile=(shader,renderer)=>{
            compile.call(material,shader,renderer);
            shader.uniforms.hubSaturation=state.saturation;shader.uniforms.hubBrightness=state.brightness;
            shader.fragmentShader='uniform float hubSaturation;uniform float hubBrightness;\n'+shader.fragmentShader;
            shader.fragmentShader=shader.fragmentShader.replace('#include <opaque_fragment>',
              'float hubGray=dot(outgoingLight,vec3(.2126,.7152,.0722)); outgoingLight=mix(vec3(.09+hubGray*.8),outgoingLight,hubSaturation)*hubBrightness;\n#include <opaque_fragment>');
          };
          material.customProgramCacheKey=()=>cacheKey+'-lobby-ownership-v1';material.needsUpdate=true;
          root.userData.appearanceMaterials.push(state);
        }
      });
    }

    updateHandAppearance(zone) {
      const state=this.api.handState(zone.skin.id),root=this.models.get(zone.skin.id);
      const key=state.selected?'selected':state.owned?'owned':'locked';
      zone.rim.material.color.set(state.selected?'#fff0a3':state.owned?zone.skin.accent:'#89949e');
      zone.base.material.emissive.set(state.selected?zone.skin.accent:'#000000');zone.base.material.emissiveIntensity=state.selected?.42:0;
      if(!root||root.userData.appearance===key)return;
      root.userData.appearance=key;
      for(const uniforms of root.userData.appearanceMaterials){uniforms.saturation.value=state.owned||state.selected?1:0;uniforms.brightness.value=state.selected?1.4:1;}
    }

    updateZones(dt, blocked) {
      // A modal/ad must not re-arm the pad while the cube is still standing on it.
      if (blocked) { this.prompt.hidden = true; this.progressRing.visible = false; return; }
      const p = this.avatar.position;
      if(this.time<(this.portalReentryUntil||0)){this.prompt.hidden=true;this.progressRing.visible=false;return;}
      window.ElementalModeConcourse.updateWarm(this);
      const zone = this.zones.find((z) => Math.abs(p.y - this.avatarHalfHeight - z.floorY) < .6 && Math.hypot(p.x - z.x, p.z - z.z) < z.radius);
      if (zone !== this.zone) { this.zone = zone; this.hold = 0; }
      if (!zone) { this.latched = null; this.prompt.hidden = true; this.progressRing.visible = false; return; }
      this.prompt.hidden = false;
      this.prompt.querySelector('strong').textContent = zone.portal ? zone.titleLabel.value : zone.title;
      this.prompt.querySelector('span').textContent = zone.portal ? this.copy('Entering…', 'Giriliyor…') : zone.subtitle();
      if (this.latched === zone.id) { this.progressRing.visible = false; return; }
      if(zone.portal){this.latched=zone.id;this.prompt.hidden=true;this.progressRing.visible=false;zone.action();return;}
      this.hold += dt;
      this.prompt.querySelector('progress').value = this.hold;
      this.progressRing.visible = true; this.progressRing.position.set(zone.x, zone.floorY + .25, zone.z);
      this.progressRing.geometry.setDrawRange(0, Math.floor(Math.min(1, this.hold / 1.5) * 64) * 6);
      if (this.hold >= 1.5) {
        this.latched = zone.id; this.progressRing.visible = false;
        Promise.resolve(zone.action()).then((message) => { if (message && this.active) this.notify(message); this.refresh(true); }).catch(() => this.notify(this.copy('Please try again', 'Lütfen tekrar dene')));
      }
    }

    refresh(force = false) {
      if (!this.scene) return;
      this.applyTheme();
      if (this.state === 'exploring' && !this.blocked()) this.streamModels();
      if (!force && this.nextRefresh > this.time) return;
      this.nextRefresh = this.time + .25;
      this.api.refreshRewards?.(this.hud);
      const wallet = this.api.wallet(), upgrades = this.api.upgrades();
      this.avatarHat.visible=!!this.api.hatOwned?.();
      const themeNames=['city','hubNature','sky','hubLava','hubWater','hubSnow'].map(key=>this.api.tr(key).toLocaleUpperCase());
      this.themeLabel.set(themeNames[this.themePhase]);
      this.hud.querySelector('#hub-location span').textContent=themeNames[this.themePhase];
      this.hud.querySelector('#hub-location strong').textContent=this.levelName();
      this.hud.querySelector('#hub-reticle').hidden=this.mobile||this.blocked()||document.pointerLockElement!==this.api.renderer().domElement;
      this.hud.querySelector('#hub-settings').setAttribute('aria-label',this.copy('Settings','Ayarlar'));
      this.api.syncFullscreenControls?.();
      this.hud.querySelector('#hub-home').setAttribute('aria-label',this.copy('Recenter camera','Kamerayı ortala'));
      this.hud.querySelector('.hub-brand small').textContent=this.inConcourse?this.api.tr('hubGames'):this.copy('ELEMENTAL PLAZA','ELEMENTAL MEYDANI');
      if(this.concourse){this.concourse.hall.heading.set(this.api.tr('hubGames'));this.concourse.hall.returnLabel?.set(this.api.tr('surfLobby'));this.concourse.back.textContent='↩ '+this.api.tr('surfLobby');}
      this.hud.querySelector('#hub-wallet').textContent = `◈ ${wallet.toLocaleString()}`;
      this.hud.querySelector('#hub-hint').textContent = this.mobile
        ? `◉ · ↔ ${this.api.tr('hubLook')} · ${this.api.tr('hubPad')}`
        : `WASD · ${this.api.tr('hubHoldRmb')}: ${this.api.tr('hubLook')} · Ctrl: ${this.api.tr('hubMouseLock')} · Space: ${this.api.tr('jump')}`;
      this.levelTitle?.set(this.levelName()); this.gamesTitle?.set(this.api.tr('hubGames')); this.wheelLabel.set(this.api.wheelStatus());
      this.arcadeStatus?.set(`🏆 ${this.api.flappyBest?.() || 0} · ${this.api.tr('play')}`);
      this.endlessTitle?.set(this.copy('ENDLESS RUN','SONSUZ KOŞU'));
      for (const portal of this.portalPreviews) {
        if(portal.mode==='soon')this.zones.find(z=>z.id==='soon')?.titleLabel.set(this.api.tr('comingSoon'));
        if(portal.mode==='level')portal.completionLabel.mesh.visible=(this.api.bestReachedLevel?.()||0)>1;
        portal.unplayed=!['games','plaza','soon'].includes(portal.mode)&&!window.ElementalModeConcourse?.played(portal.mode);
        if(portal.mode==='obby'||portal.mode==='troll'){const s=portal.mode==='troll'?this.api.trollSelection?.():this.api.partySelection?.();if(s){portal.levelLabel?.set(`${s.level} · ${s.name}`);portal.completionLabel.mesh.visible=s.completed;for(const nav of portal.levelArrows){nav.arrow.mesh.material.opacity=(nav.direction<0?s.level>1:s.level<s.unlocked)?1:.22;const scale=nav.arrow.mesh.scale;scale.setScalar(scale.x+(1-scale.x)*.3);}}}
        if(portal.mode==='surf'){const selection=this.api.surfSelection?.()||{level:1,unlocked:1,mode:'bhop'};portal.titleLabel?.set(selection.mode.toUpperCase());portal.levelLabel?.set(`${selection.level} · ${selection.kind?.toUpperCase()||''} · ${selection.name||''}`);portal.completionLabel.mesh.visible=!!selection.completed;for(const nav of portal.levelArrows||[]){nav.arrow.mesh.visible=true;nav.arrow.mesh.material.opacity=(nav.direction<0?selection.level>1:selection.level<selection.unlocked)?1:.25;const scale=nav.arrow.mesh.scale;scale.setScalar(scale.x+(1-scale.x)*.3);}}
        portal.recordLabel?.set(`🏆 ${this.api.tr('level')} ${this.api.bestReachedLevel?.() || 0}`);
        if(portal.highScoreLabel){
          // Cache parsing; same-tab results refresh on hub entry too. Treat save
          // data as data, with a safe zero-record fallback if storage is denied.
          const surf=portal.mode==='surf';let raw='';try{raw=localStorage.getItem(surf?(this.api.surfSelection?.().key||'elemental-run-bhop-v1'):'elemental-run-2d-v1')||'';}catch(_){}
          if(raw!==portal.recordRaw){portal.recordRaw=raw;let record={};try{record=JSON.parse(raw||'{}');}catch(_){}const distance=Number(record?.distance)||0,level=Number(record?.best)||0;portal.best2D=Number.isFinite(distance)?Math.max(0,Math.min(1e9,Math.floor(distance))):0;portal.bestSurfLevel=Number.isFinite(level)?Math.max(0,Math.min(120,Math.floor(level))):0;}
          portal.highScoreLabel.set(surf?`${(this.api.surfSelection?.().mode||'bhop').toUpperCase()} · ${this.api.tr('surfLevel')} ${portal.bestSurfLevel||0}`:`2D · ${this.api.tr('highScore')}: ${portal.best2D||0}m`);
        }
      }
      for(const ad of this.adLabels){
        const title=ad.id==='missions'?this.api.tr('hubMissions').toLocaleUpperCase():ad.id==='rebirth'?this.api.tr('rebirth').toLocaleUpperCase():'2× '+this.api.tr(ad.id==='ad-speed'?'speed':'score').toLocaleUpperCase();
        ad.label.set(title);const zone=this.zones.find(z=>z.id===ad.id);if(zone)zone.title=title;
        ad.status.set(ad.id==='missions'?this.api.tr('hubDaily'):ad.id==='rebirth'?this.api.rebirthStatus():this.api.adsAvailable()?this.copy('WATCH AD','REKLAM İZLE'):'POKI');
      }
      this.statsTitle.set(this.copy('STATS','İSTATİSTİKLER'));
      this.wayfindingLabels.hands.set(this.copy('HANDS','ELLER'));
      this.monitorTitle.set(this.api.tr('upgrades').toLocaleUpperCase());
      this.wheelTitle.set(this.copy('LUCKY WHEEL','ŞANS ÇARKI'));
      for(const [id,key]of [['stats','hubStats'],['wheel','hubWheel'],['upgrades','upgrades']]){const zone=this.zones.find(z=>z.id===id);if(zone)zone.title=this.api.tr(key);}
      for (const z of this.zones) if (z.skin) {
        z.price.set(this.api.handStatus(z.skin));
        z.skillLabel.set(this.api.tr('handSkill_'+z.skin.skill));
        this.updateHandAppearance(z);
      }
      const signature = JSON.stringify(upgrades) + ':' + wallet + ':' + this.api.language();
      if (signature !== this.lastUi || force) {
        this.lastUi = signature;
        const ctx = this.monitorCtx;
        const backdrop=ctx.createLinearGradient(0,0,1024,640);backdrop.addColorStop(0,'#173744');backdrop.addColorStop(1,'#0c1827');ctx.fillStyle=backdrop;ctx.fillRect(0,0,1024,640);
        ctx.fillStyle = '#d8f0e9'; ctx.font = 'bold 48px system-ui'; ctx.fillText(this.api.tr('upgrades').toLocaleUpperCase(), 42, 76);
        ctx.textAlign = 'right'; ctx.fillStyle = '#f0cc82'; ctx.font = 'bold 34px system-ui'; ctx.fillText(`◈ ${wallet}`, 974, 72); ctx.textAlign = 'left';
        upgrades.forEach((u, i) => {
          const y = 136 + i * 108; ctx.fillStyle = u.canBuy ? '#254c53' : '#21333f';ctx.beginPath();ctx.roundRect(28,y,968,92,12);ctx.fill();
          ctx.fillStyle=['#8bd9d1','#f1d088','#b6bae8','#a8d49b'][i];ctx.font='bold 44px system-ui';ctx.fillText(['✦','◈','↑','»'][i],53,y+59);
          ctx.fillStyle='#f6faf5';ctx.font='bold 36px system-ui';ctx.fillText(u.name,124,y+40,560);
          ctx.fillStyle='#afc3cb';ctx.font='23px system-ui';ctx.fillText(`${this.copy('Level','Seviye')} ${u.level} / ${u.max}`,126,y+75);
          const segments=Math.min(8,Math.max(1,u.max));
          for(let j=0;j<segments;j++){ctx.fillStyle=(j+1)/segments<=u.level/u.max?'#92ddbc':'#0f2530';ctx.fillRect(360+j*31,y+61,25,10);}
          ctx.fillStyle=u.canBuy?'#a28244':'#324553';ctx.beginPath();ctx.roundRect(754,y+18,220,57,9);ctx.fill();
          ctx.textAlign='center';ctx.fillStyle=u.canBuy?'#fff1c5':'#c4d2d9';ctx.font='bold 32px system-ui';ctx.fillText(u.maxed?'MAX':`◈ ${u.cost}`,864,y+55,204);ctx.textAlign='left';
        });
        ctx.fillStyle = '#a9c9ce'; ctx.font = '24px system-ui'; ctx.textAlign = 'center'; ctx.fillText(this.api.tr('upgrades')+' / '+this.api.tr('hands')+' ↗', 512, 611,920); ctx.textAlign = 'left';
        this.monitorTexture.needsUpdate = true;
      }
    }

    streamModels(preload = false) {
      // Continue streaming while walking. Limit concurrency instead of
      // starving all displays until the player stands still.
      if (preload && this.pendingModels.size) return Promise.all([...this.pendingModels.values()]);
      if (!preload && (this.pendingModels.size >= 1 || this.time < this.nextModelLoadAt)) return;
      const zone = this.zones.find((z) => z.skin && !this.models.has(z.skin.id) && !this.pendingModels.has(z.skin.id) && !this.failedModels.has(z.skin.id));
      if (!zone) return;
      const id = zone.skin.id, epoch = this.modelEpoch;
      const loader = new this.T.GLTFLoader(); if (this.T.MeshoptDecoder) loader.setMeshoptDecoder(this.T.MeshoptDecoder);
      let settled;
      const pending = new Promise(resolve => { settled = resolve; });
      this.pendingModels.set(id, pending);
      this.nextModelLoadAt = this.time + .5;
      loader.load(this.api.lobbyHandPath?.(id) || this.api.handPath(id), (gltf) => {
        this.pendingModels.delete(id);
        const root = gltf.scene;
        if ((!this.active && !this.preparingEntry) || epoch !== this.modelEpoch) { this.disposeModel(root); settled(); return; }
        try {
          root.updateMatrixWorld(true);
          this.api.optimizeHandModel?.(root, id);
          let source = null; root.traverse((node) => { if (!source && node.isMesh) source = node; });
          if (!source?.geometry) throw new Error('Missing hand mesh');
          const geometry = this.singleHandGeometry(source.geometry, source.matrixWorld);
          const bounds = geometry.boundingBox, size = bounds.getSize(new this.T.Vector3()), center = bounds.getCenter(new this.T.Vector3());
          const wrapper = new this.T.Group(), mesh = new this.T.Mesh(geometry, source.material);
          mesh.position.sub(center); mesh.castShadow = false; mesh.receiveShadow = false;
          wrapper.add(mesh); wrapper.scale.setScalar(3.2 / Math.max(size.x, size.y, size.z, .01));
          wrapper.position.set(zone.pedestal.x, zone.pedestal.floorY + 3.5, zone.pedestal.z);
          wrapper.userData.index = this.api.skins().findIndex((skin) => skin.id === id);
          wrapper.userData.baseYaw = zone.pedestal.yaw;
          wrapper.rotation.y = zone.pedestal.yaw;
          root.traverse((node) => node.geometry?.dispose());
          this.scene.add(wrapper); this.models.set(id, wrapper);
          mesh.userData.click=()=>this.invokeZone(zone);
          if(this.inConcourse){wrapper.visible=false;this.concourse.visible.set(wrapper,true);this.concourse.main.clickable.push(mesh);}else this.clickable.push(mesh);
          this.prepareHandAppearance(wrapper);this.updateHandAppearance(zone);
        } catch (error) { this.failedModels.add(id); this.disposeModel(root); console.warn('[LobbyHand]', id, error); }
        settled();
      }, undefined, (error) => { this.pendingModels.delete(id); this.failedModels.add(id); console.warn('[LobbyHand]', id, error); settled(); });
      return pending;
    }
    singleHandGeometry(source, matrix) {
      const T = this.T, geometry = source.clone();
      // Never transform normalized integer GLB attributes in place: the
      // transformed coordinates clamp at +/-1 and visibly cut the glove.
      for (const name of ['position', 'normal', 'tangent']) {
        const attribute = geometry.getAttribute(name);
        if (!attribute || (attribute.array instanceof Float32Array && !attribute.normalized)) continue;
        const values = new Float32Array(attribute.count * attribute.itemSize);
        for (let vertex = 0; vertex < attribute.count; vertex++) {
          for (let component = 0; component < attribute.itemSize; component++) {
            values[vertex * attribute.itemSize + component] = attribute.getComponent(vertex, component);
          }
        }
        geometry.setAttribute(name, new T.BufferAttribute(values, attribute.itemSize));
      }
      geometry.applyMatrix4(matrix);
      const pos = geometry.getAttribute('position'), src = geometry.index?.array;
      const total = src ? src.length : pos.count, picked = [];
      // Keep each connected finger/thumb shell on its original hand. A face
      // centroid split can transplant the inward thumb onto the other glove.
      const parent = src ? new Int32Array(pos.count) : null;
      const rank = src ? new Uint8Array(pos.count) : null;
      const used = src ? new Uint8Array(pos.count) : null;
      if (parent) for (let i = 0; i < parent.length; i++) parent[i] = i;
      const rootOf = (v) => {
        let root = v;
        while (parent[root] !== root) root = parent[root];
        while (parent[v] !== v) { const next = parent[v]; parent[v] = root; v = next; }
        return root;
      };
      const join = (a, b) => {
        a = rootOf(a); b = rootOf(b); if (a === b) return;
        if (rank[a] < rank[b]) { const swap = a; a = b; b = swap; }
        parent[b] = a; if (rank[a] === rank[b]) rank[a]++;
      };
      if (src) for (let i = 0; i < total; i += 3) {
        const a = src[i], b = src[i + 1], c = src[i + 2];
        used[a] = used[b] = used[c] = 1; join(a, b); join(b, c);
      }
      const sums = src ? new Float64Array(pos.count) : null;
      const counts = src ? new Uint32Array(pos.count) : null;
      if (src) for (let i = 0; i < pos.count; i++) {
        if (!used[i]) continue;
        const root = rootOf(i); sums[root] += pos.getX(i); counts[root]++;
      }
      for (let i = 0; i < total; i += 3) {
        const a = src ? src[i] : i, b = src ? src[i + 1] : i + 1, c = src ? src[i + 2] : i + 2;
        const right = src ? sums[rootOf(a)] / Math.max(1, counts[rootOf(a)]) >= 0
          : pos.getX(a) + pos.getX(b) + pos.getX(c) >= 0;
        if (right) picked.push(a, b, c);
      }
      if (picked.length < 3) { geometry.dispose(); throw new Error('No right-hand triangles'); }
      const compact = new T.BufferGeometry(), remap = new Map(), indices = [];
      for (const index of picked) {
        if (!remap.has(index)) remap.set(index, remap.size);
        indices.push(remap.get(index));
      }
      for (const [name, attribute] of Object.entries(geometry.attributes)) {
        // KHR_mesh_quantization uses normalized integer attributes. Copying
        // their decoded float components back into an integer array rounds the
        // entire glove to the origin, leaving apparently empty pedestals.
        const itemSize = attribute.itemSize, values = new Float32Array(remap.size * itemSize);
        for (const [oldIndex, newIndex] of remap) {
          for (let c = 0; c < itemSize; c++) values[newIndex * itemSize + c] = attribute.getComponent(oldIndex, c);
        }
        compact.setAttribute(name, new T.BufferAttribute(values, itemSize, false));
      }
      compact.setIndex(indices); compact.computeBoundingBox(); compact.computeBoundingSphere(); geometry.dispose();
      return compact;
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
      for(const list of new Set([this.clickable,this.concourse?.main.clickable,this.concourse?.hall.clickable]))if(list)for(let i=list.length-1;i>=0;i--)if(list[i].parent===root)list.splice(i,1);
      this.concourse?.visible?.delete(root);
      this.scene.remove(root); this.disposeModel(root); this.models.delete(id);
    }

    async transition(mode) {
      if (this.state !== 'exploring' || this.api.blocked()) return;
      if(mode==='soon')return;
      if(mode==='plaza'&&!this.inConcourse)return;
      if(mode==='flappy'){this.api.openFlappy();return;}
      this.api.measure?.('portal-intent',mode,'enter');
      this.portalIntentAt=performance.now();
      if(mode!=='games'&&mode!=='plaza'){
        const p=this.avatar.position,z=this.zones.find(z=>z.id===mode);let x=p.x,depth=p.z;
        if(z&&Math.hypot(x-z.x,depth-z.z)<3.3){x=z.x-(z.entryForward?.x||0)*3.3;depth=z.z-(z.entryForward?.z||-1)*3.3;}
        this.returnPose={hall:!!this.inConcourse,x,z:depth,yaw:this.yaw,pitch:this.pitch,facing:this.avatar.rotation.y};
      }
      // Capture only once the portal pad commits, before asynchronous map preparation.
      if(!this.mobile&&mode!=='runner2d')this.api.lockPointer?.({ forRun: true });
      this.state = 'transition'; this.keys.clear(); this.touchMove.set(0, 0);
      this.velocity.set(0, 0);
      const serial = this.serial;
      this.transitionTime=0;this.transitionLastAt=performance.now();this.transitionMode=mode;this.transitionReady=false;
      this.transitionOrigin=this.camera.position.clone();this.transitionRotation=this.camera.quaternion.clone();
      const portal=this.zones.find(zone=>zone.id===mode);
      this.transitionAvatarOrigin=this.avatar.position.clone();this.transitionTarget=portal.entryTarget?.clone()||new this.T.Vector3(portal.x,2.1,-31.65);
      this.camera.lookAt(this.temp.copy(this.transitionTarget).add(portal.entryForward?.clone().multiplyScalar(10)||new this.T.Vector3(0,0,-10)));
      this.transitionTargetRotation=this.camera.quaternion.clone();this.camera.quaternion.copy(this.transitionRotation);
      this.prompt.hidden=mode!=='surf';this.prompt.classList.toggle('is-surf-preparing',mode==='surf');this.entryCancel.hidden=true;
      if(mode==='surf'){this.prompt.querySelector('strong').textContent=(this.api.surfSelection?.().mode||'bhop').toUpperCase();this.prompt.querySelector('span').textContent=this.copy('Preparing your run…','Koşu hazırlanıyor…');this.prompt.querySelector('progress').max=1;this.entryCancel.textContent=this.api.tr('surfLobby')+(this.mobile?'':' · Esc');}
      try {
        if(mode==='games')await window.ElementalModeConcourse.prepare(this);else if(mode!=='plaza')await window.ElementalModeConcourse.prepareMode(this,mode);
        if (!this.active || this.serial !== serial) return;
        this.api.measure?.('portal-ready',mode,Math.min(120,Math.ceil((performance.now()-this.portalIntentAt)/1000))+'s');
        this.transitionReady=true;
        this.entryCancel.hidden=true;this.prompt.hidden=mode!=='surf';this.message.textContent = '';
      } catch (error) { if(!this.active||this.serial!==serial)return;console.warn('[Lobby preparation]', error);if(mode==='surf')this.cancelSurfEntry();else{this.state='exploring';this.clearMovement();this.avatar.position.copy(this.transitionAvatarOrigin);const portal=this.zones.find(z=>z.id===mode);if(portal&&Math.hypot(this.avatar.position.x-portal.x,this.avatar.position.z-portal.z)<portal.radius+1){this.avatar.position.x=portal.x-(portal.entryForward?.x||0)*(portal.radius+1.2);this.avatar.position.z=portal.z-(portal.entryForward?.z||-1)*(portal.radius+1.2);}this.avatar.visible=true;this.zone=null;this.latched=null;this.prompt.hidden=true;this.entryCancel.hidden=true;this.portalReentryUntil=this.time+.8;this.updateCamera(1,true);this.queuePointerRestore();}this.notify(this.copy('Could not prepare the run. Step off and retry.', 'Koşu hazırlanamadı. Pedden çıkıp tekrar dene.')); }
    }
    cancelSurfEntry(){
      if(!this.active||this.state!=='transition'||this.transitionMode!=='surf')return false;
      const serial=++this.serial;this.state='cancelling';this.transitionReady=false;this.keys.clear();this.velocity.set(0,0);this.touchMove.set(0,0);
      this.avatar.position.copy(this.transitionAvatarOrigin);const portal=this.zones.find(z=>z.id==='surf');if(portal&&Math.hypot(this.avatar.position.x-portal.x,this.avatar.position.z-portal.z)<portal.radius+1){this.avatar.position.x=portal.x-(portal.entryForward?.x||0)*(portal.radius+1.2);this.avatar.position.z=portal.z-(portal.entryForward?.z||-1)*(portal.radius+1.2);}this.avatar.visible=true;this.zone=null;this.latched=null;
      this.prompt.hidden=true;this.prompt.classList.remove('is-surf-preparing');this.prompt.querySelector('progress').max=1.5;this.entryCancel.hidden=true;this.updateCamera(1,true);
      void window.ElementalModeConcourse.cancelMode(this,'surf').catch(error=>console.warn('[Surf cancellation]',error)).finally(()=>{if(this.active&&this.serial===serial){this.state='exploring';this.portalReentryUntil=this.time+.8;this.queuePointerRestore();}});return true;
    }
    updateTransition(dt) {
      // This is a camera cinematic, not fixed-step gameplay. A clamped physics
      // delta stretched an .8s portal tween into many seconds on slow devices.
      const now=performance.now(),elapsed=Math.max(0,(now-(this.transitionLastAt??now))/1000);this.transitionLastAt=now;
      this.transitionTime += Math.max(dt,elapsed);
      if(this.transitionMode==='surf'){
        // Do not put the camera against the opaque backing wall while assets
        // are still preparing. Resume the remaining camera tween only when ready.
        if(!this.transitionReady)this.transitionTime=Math.min(.28,this.transitionTime);
        this.prompt.querySelector('progress').value=this.transitionReady?1:Math.max(.01,Math.min(.99,this.api.preparationProgress?.('surf')||0));
        this.prompt.querySelector('span').textContent=this.transitionReady?this.copy('Entering…','Giriliyor…'):this.copy('Preparing your run…','Koşu hazırlanıyor…');
      }
      const t = Math.min(this.transitionReady?1:.94, this.transitionTime / .8), eased = t * t * (3 - 2 * t);
      this.camera.position.lerpVectors(this.transitionOrigin, this.transitionTarget, eased);
      this.camera.quaternion.slerpQuaternions(this.transitionRotation, this.transitionTargetRotation, eased);
      this.avatar.position.x=this.transitionAvatarOrigin.x+(this.transitionTarget.x-this.transitionAvatarOrigin.x)*eased;
      this.avatar.position.z=this.transitionAvatarOrigin.z+(this.transitionTarget.z-this.transitionAvatarOrigin.z)*eased;
      this.avatar.rotation.y=0;this.avatar.visible = t < .72;
      if (t >= 1) { const mode = this.transitionMode;if(mode==='games'||mode==='plaza'){window.ElementalModeConcourse.setArea(this,mode==='games');this.portalReentryUntil=this.time+.8;return;}if(mode==='surf'&&this.api.surfPrepared&&!this.api.surfPrepared()){this.cancelSurfEntry();this.notify(this.copy('Could not prepare the run. Step off and retry.','Koşu hazırlanamadı. Pedden çıkıp tekrar dene.'));return;}this.api.guideEntered?.(mode);this.captureHandoff();this.exit({ deferModels: true });try{this.api.start(mode);window.ElementalModeConcourse.markPlayed(mode);}catch(error){if(mode!=='surf')throw error;console.warn('[Surf entry]',error);this.api.abortSurfEntry?.();if(!this.active)this.enter();this.notify(this.copy('Could not prepare the run. Step off and retry.','Koşu hazırlanamadı. Pedden çıkıp tekrar dene.'));} }
    }
    captureHandoff() {
      this.clearHandoff();
      const T = this.T;
      const scene = new T.Scene(), camera = new T.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      // A clean black cut/fade replaces the low-resolution captured lobby frame.
      // No render target or texture upload is needed at the handoff.
      const material = new T.MeshBasicMaterial({ color: 0x000000, transparent: true, depthTest: false, depthWrite: false, toneMapped: false });
      const plane = new T.Mesh(new T.PlaneGeometry(2, 2), material); scene.add(plane);
      this.handoff = { scene, camera, plane, material, elapsed: 0 };
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
      this.handoff.plane.geometry.dispose(); this.handoff.material.dispose(); this.handoff = null;
    }
    snapshot() {
      return { active: this.active, state: this.state, handoffActive: !!this.handoff, player: this.avatar ? { x: +this.avatar.position.x.toFixed(2), y: +this.avatar.position.y.toFixed(2), z: +this.avatar.position.z.toFixed(2) } : null,
        pointerCapture: { wanted: this.pointerLockWanted, locked: document.pointerLockElement === this.api.renderer().domElement, suspended: this.blocked(), restoreQueued: this.pointerRestoreQueued },
        coordinateSystem: 'Lobby: X right, Y up, -Z forward (independent of runner)', themePhase: this.themePhase, themeWarm: !!this.themeWarmPromise,
        enclosure: { walls: this.wallSides?.length || 0, height: 13.4, theme: this.themePhase, cachedTextures: this.wallTextureCache?.size || 0 },
        graphics: { staticDrawCallsSaved: this.staticDrawCallsSaved || 0, portalPreviews: this.portalPreviews?.length || 0, themedFloor: this.themePhase, grid: this.themePhase===0, entryPrepared: !!this.entryPrepared, preparationMs: this.entryPreparationMs || 0, companions: this.companionCount || 0 },
        modePreparation: this.modePreparation?.snapshot() || null,
        guide:this.api.guide?.()||null,
        guideRoute: { visible: !!this.active && !!this.guideArrows?.visible, arrows: this.guideArrows?.count || 0, target: this.lastGuideStage || null, reducedMotion: !!this.guideMotion?.matches },
        flappy: window.ElementalFlappyArcade?.getState?.() || null,
        handDisplays: [...this.models].map(([id,model])=>({id,state:model.userData.appearance})),
        hat: !!this.avatarHat?.visible,
        area:this.inConcourse?'modes':'plaza', portalRun: { startLevel: 1, bestReachedLevel: this.api.bestReachedLevel?.() || 0 },
        hatModel: this.hatLoaded ? 'tutorial-hat.glb' : null,
        realMapModels: this.themeModelCounts?.slice() || [], zone: this.zone?.id || null, hold: +this.hold.toFixed(2), residentModels: [...this.models.keys()], pendingModels: [...this.pendingModels.keys()], zones: this.zones.map((z) => ({ id: z.id, x: z.x, y: z.floorY, z: z.z })) };
    }
    dispose() {
      this.disposed = true;
      this.exit(); this.clearHandoff(); for (const resource of this.resources) resource.dispose?.(); this.resources.clear();
      this.scene?.clear(); this.scene = null;
    }
  }
  window.ElementalLobbyHub = LobbyHub;
})();
