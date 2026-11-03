(function(){'use strict';const C=window.ElementalObbyCourse;

// Active-time clock: no relationship to clamped physics dt/worldTime.
class ActivePlayClock{
 constructor(now=()=>performance.now()){this.now=now;this.reset();}
 reset(){this.started=false;this.totalMs=0;this.anchor=null;}
 start(){this.started=true;this.resume();}
 resume(){if(this.started&&this.anchor===null)this.anchor=this.now();}
 pause(){if(this.anchor!==null){this.totalMs+=Math.max(0,this.now()-this.anchor);this.anchor=null;}}
 seconds(){return(this.totalMs+(this.anchor===null?0:Math.max(0,this.now()-this.anchor)))/1000;}
}
// Active-time economy, ~21 gold/minute. No fixed high-level farm multiplier.
// Only a qualified finish pays; first clear/PB bonuses are deliberately small.
function finishReward(level,seconds,previousBest){
 if(!Number.isFinite(seconds)||seconds<=0)return 0;
 const old=Number.isFinite(previousBest)&&previousBest>0?previousBest:null;
 return Math.min(60,Math.floor(seconds*.35)+(old===null?10:seconds<old?5:0));
}
let attemptSequence=0;

class ElementalObbyRun{
 constructor(T,api){this.T=T;this.api=api;this.active=false;this.state='idle';this.keys=new Set();this.owned=new Set();this.serial=0;this.level=1;this.saved={best:{},clockVersion:2};try{const s=JSON.parse(localStorage.getItem(api.storageKey||'elemental-run-party-v1')||'{}');if(s&&s.best&&typeof s.best==='object'){this.saved=s;if(s.clockVersion!==2){this.saved.legacySimulationBest={...s.best};this.saved.best={};this.saved.clockVersion=2;}for(const [key,value]of Object.entries(this.saved.best))if(!Number.isFinite(value)||value<=0)delete this.saved.best[key];}}catch(_){}this.level=Math.max(1,Math.min(C.ROUND_COUNT,Math.floor(Number(this.saved.level)||1)));if(this.saved.courseVersion!==(api.courseVersion||C.COURSE_VERSION)){this.saved.previousCourseBest={...this.saved.best};this.saved.best=[6,7,8,9,10,11,12,13].includes(this.saved.courseVersion)&&C.COURSE_VERSION===14?Object.fromEntries(Object.entries(this.saved.best).filter(([key])=>Number(key)===8||this.saved.courseVersion===13&&Number(key)===7)):{};this.saved.previousCourseLevel=this.saved.level;this.saved.level=this.level=[6,7,8,9,10,11,12,13].includes(this.saved.courseVersion)&&C.COURSE_VERSION===14&&(this.level===8||this.saved.courseVersion===13&&this.level===7)?this.level:1;this.saved.courseVersion=api.courseVersion||C.COURSE_VERSION;}this.yaw=0;this.pitch=.12;this.handMotion={initialized:false};this.handPlayer={};this.cameraKick=0;this.tint=new T.Color();this.clock=new ActivePlayClock(api.now);this.solids=[];this.save();this.createUI();}
 own(r){this.owned.add(r);return r;}tr(k){return this.api.tr(k);}save(){try{localStorage.setItem(this.api.storageKey||'elemental-run-party-v1',JSON.stringify(this.saved));}catch(_){}}
 migrateSequence(){
  if(this.saved.sequenceVersion!==1){const old=this.saved.best;this.level=C.roundOrder.indexOf(this.level)+1;this.saved.best={};this.saved.completed={};for(let i=0;i<C.roundOrder.length;i++){const time=old[C.roundOrder[i]];if(Number.isFinite(time)&&time>0){this.saved.best[i+1]=time;this.saved.completed[i+1]=true;}}this.saved.sequenceVersion=1;}
  if(!this.saved.completed||typeof this.saved.completed!=='object')this.saved.completed={};this.saved.unlocked=1;while(this.saved.unlocked<(this.roundCount||C.ROUND_COUNT)&&this.saved.completed[this.saved.unlocked])this.saved.unlocked++;
  this.level=Math.max(1,Math.min(this.saved.unlocked,this.level));this.saved.level=this.level;this.save();
 }
 selection(){return{level:this.level,unlocked:this.saved.unlocked||1,name:this.tr('partyMap'+C.roundOrder[this.level-1]),completed:!!this.saved.completed[this.level]};}
 selectLobbyLevel(direction){if(this.active||this.preparing)return;const next=Math.max(1,Math.min(this.saved.unlocked||1,this.level+direction));if(next!==this.level){this.clearScene();this.level=next;this.saved.level=next;this.save();}}
 createUI(){
  this.migrateSequence();
  this.ui=document.createElement('section');this.ui.id=this.api.mode==='troll'?'troll-hud':'obby-hud';this.ui.classList.add('obby-mode-hud');this.ui.hidden=true;
  this.ui.innerHTML='<header class="obby-game-hud"><div class="obby-stats"><div data-stat="time"><span data-time-label></span>: <strong data-time>0:00.0</strong></div><div data-stat="gold"><span data-gold-label></span>: <strong data-gold>0</strong></div><div data-stat="speed"><span data-speed-label></span>: <strong data-speed>0</strong> km/h</div></div><div class="obby-route"><div class="level-hud-line"><span data-level></span><span data-stage></span></div><div class="level-hud-track"><i class="level-hud-fill" data-fill></i></div></div><button data-pause aria-label="Pause">Ⅱ</button></header><div class="party-countdown" aria-live="polite"></div><div class="obby-reticle" aria-hidden="true"></div><div class="obby-bhop" aria-hidden="true"></div><div class="obby-damage" aria-hidden="true"></div><div class="obby-toast" role="status"></div><footer data-hint></footer><div class="obby-touch"><div class="obby-look-pad" aria-hidden="true"></div><div class="obby-dpad"><button data-move="up">▲</button><button data-move="left">◀</button><button data-move="down">▼</button><button data-move="right">▶</button></div><button data-jump>↑</button><button data-dive>➜</button></div>';
  document.body.appendChild(this.ui);this.ui.classList.toggle('mobile',!!this.api.mobile);
  this.speedFx=document.createElement('div');this.speedFx.className='party-speed-lines';this.speedFx.setAttribute('aria-hidden','true');let rays='';for(let i=0;i<24;i++){const a=i*Math.PI/12,r=320+(i%3)*35;rays+='<path d="M'+(500+Math.cos(a)*r)+' '+(500+Math.sin(a)*r)+' L'+(500+Math.cos(a)*760)+' '+(500+Math.sin(a)*760)+'" style="animation-delay:'+(-i*.037)+'s"/>';}this.speedFx.innerHTML='<svg viewBox="0 0 1000 1000" preserveAspectRatio="none">'+rays+'</svg>';this.ui.prepend(this.speedFx);this.boostVisual=0;
  this.venom=document.createElement('div');this.venom.className='party-pursuit-edge';this.venom.setAttribute('aria-hidden','true');this.venom.innerHTML='<svg viewBox="0 0 100 100" preserveAspectRatio="none"><defs><path id="party-tendril" d="M0 0H11C4 5 3 9 4 16C5 22 1 23 1 30C1 36 7 36 8 42C4 39 2 42 2 47C2 53 5 56 7 57C2 56 1 58 1 64C1 73 5 73 6 80C3 77 2 80 3 87C4 94 8 98 13 100H0Z"/></defs><use href="#party-tendril"/><use href="#party-tendril" transform="translate(100 0) scale(-1 1)"/></svg>';this.ui.prepend(this.venom);
  // Round navigation lives on the portal pillars, never in ESC or the HUD.
  this.roundSelect=document.createElement('select');
  this.nativeUI=new window.ElementalObbyInterface(this,this.api);this.modal=this.nativeUI.result;
  this.ui.querySelector('[data-pause]').onclick=()=>this.pause();this.touchKeys=new Set();
  for(const b of this.ui.querySelectorAll('[data-move],[data-jump],[data-dive]')){
   b.onpointerdown=e=>{e.preventDefault();e.stopPropagation();this.api.interaction?.();try{b.setPointerCapture(e.pointerId);}catch(_){}if(b.hasAttribute('data-jump')){this.touchKeys.add('jump');this.jump();}else if(b.hasAttribute('data-dive'))this.dive();else this.touchKeys.add(b.dataset.move);};
   for(const type of ['pointerup','pointercancel','lostpointercapture'])b.addEventListener(type,()=>{this.touchKeys.delete(b.hasAttribute('data-jump')?'jump':b.dataset.move);});
  }
  const canvas=this.api.renderer().domElement;canvas.addEventListener('pointerdown',()=>{if(this.active&&this.state==='playing'&&!this.api.mobile)this.api.lock();});
  canvas.addEventListener('wheel',e=>{if(this.active&&this.state==='playing'&&e.deltaY>0){e.preventDefault();this.jump();}},{passive:false});
  this.bindLookPad(this.ui.querySelector('.obby-look-pad'));this.nativeUI.matchHUD();
 }
 // Right-half look pad is a sibling of Jump: a Jump pointer never starts look.
 bindLookPad(pad){
  pad.addEventListener('pointerdown',e=>{
   if(!this.active||this.state!=='playing'||this.race?.countdown>0||this.lookTouch)return;
   e.preventDefault();e.stopPropagation();this.api.interaction?.();
   this.lookTouch={id:e.pointerId,x:e.clientX,y:e.clientY};
   try{pad.setPointerCapture(e.pointerId);}catch(_){}
  });
  pad.addEventListener('pointermove',e=>{
   const p=this.lookTouch;if(this.state!=='playing'||!p||p.id!==e.pointerId)return;
   e.preventDefault();e.stopPropagation();
   this.yaw-=Math.max(-40,Math.min(40,e.clientX-p.x))*.004;
   this.pitch=Math.max(-1.35,Math.min(1.35,this.pitch+(e.clientY-p.y)*.003));
   p.x=e.clientX;p.y=e.clientY;
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(this.lookTouch?.id===e.pointerId)this.lookTouch=null;});
 }
 async prepare(){if(this.prepared)return;if(this.preparing)return this.preparing;this.preparing=this.build().finally(()=>this.preparing=null);return this.preparing;}
 async build(){const T=this.T,serial=++this.serial;this.clearScene();this.data=C.round(this.level);const d=this.data,theme=d.theme,own=r=>this.own(r);this.scene=new T.Scene();this.scene.background=new T.Color(theme.sky);this.scene.fog=new T.Fog(theme.sky,85,240);this.scene.add(new T.HemisphereLight(0xd8edff,0x344654,1.15));const sun=new T.DirectionalLight(0xffe4bc,2.35);sun.position.set(-35,48,18);this.scene.add(sun);const fill=new T.DirectionalLight(0x9bd8ee,.65);fill.position.set(35,15,-30);this.scene.add(fill);this.camera=new T.PerspectiveCamera(82,1,.06,650);this.dummy=new T.Object3D();
 const box=own(new T.BoxGeometry(1,1,1)),light=own(new T.MeshStandardMaterial({color:0xe6be70,roughness:.45,metalness:.3}));
 this.art=new window.ElementalObbyArt(T,d,own);this.scene.add(this.art.root);this.solids.push(...this.art.solids);
 this.sky=this.api.sky?.(own);if(this.sky){this.sky.rotation.y=Math.PI/2;const disc=this.sky.userData.sun;if(disc){disc.material.color.setHex([0xff74c8,0xffffb0,0xffffff,0xff9b56,0xffe0a0,0xf3f7ff][theme.phase]);disc.position.set(360,190,180);disc.scale.setScalar(.6);}if(this.sky.userData.stars)this.sky.userData.stars.material.opacity=[0,5].includes(theme.phase)?.55:.22;this.scene.add(this.sky);}this.camera.far=650;this.camera.updateProjectionMatrix();
 this.checkRings=[];for(const cp of d.checkpoints){const mat=own(new T.MeshBasicMaterial({color:cp.index?0xffd47f:0x87f0bb,side:T.DoubleSide})),ring=new T.Mesh(own(new T.RingGeometry(1.8,2.05,32)),mat);ring.rotation.x=-Math.PI/2;ring.position.set(cp.x,cp.y+.035,cp.z);this.scene.add(ring);this.checkRings.push(ring);if(!cp.index)continue;const label=this.label(String(cp.index+1),1.8,0xe9f7ff);label.position.set(cp.x-6.5,cp.y+1.5,cp.z-1);this.scene.add(label);}
 this.biomeGround=window.ElementalPartyEnvironment.ground(T,d,this.api,own);this.scene.add(this.biomeGround.mesh,this.biomeGround.base);this.solids.push(this.biomeGround.mesh,this.biomeGround.base);
 // Reuse complete normal-game scenery. Batch each source variant; do not
 // split compound snow/tree/rock models into independently moving pieces.
 this.sceneryCells=[];this.decorStats=[];this.sceneryPlacements=[];
 for(const variant of [3,0,1,2]){
  const raw=this.api.decor(theme.phase,variant),parts=Array.isArray(raw)?raw:[{geometry:raw,material:new T.MeshStandardMaterial({vertexColors:true,roughness:.85})}];
  const bounds=new T.Box3();let triangles=0;for(const part of parts){if(!part.geometry)continue;part.geometry.computeBoundingBox();bounds.union(part.geometry.boundingBox);triangles+=(part.geometry.index?.count||part.geometry.attributes.position.count)/3;}
  const height=(theme.phase===0?[52,64,46,72]:theme.phase===4?[30,22,40,62]:[40,36,24,70])[variant],size=bounds.getSize(new T.Vector3()),scale=Math.min(height/Math.max(1,size.y),66/Math.max(1,size.x,size.z));
  const spacingHint=theme.phase===4?[24,32,65,80][variant]:variant===3?52:variant===2?24:15,arenaRows=[[14,12,10,8],[16,14,10,7],[10,8,6,6],[14,12,10,5],[10,8,4,5],[16,6,8,5]];
  const wanted=d.kind==='race'?Math.ceil((d.depth+240)/spacingHint)+1:arenaRows[theme.phase][variant];
  const rows=Math.max(variant===3&&triangles>20000?1:3,Math.min(wanted,Math.floor((this.api.mobile?120000:200000)/Math.max(1,triangles*2)),variant===3?4:52));
  const radius=Math.hypot(size.x,size.z)*scale*1.05/2,center=bounds.getCenter(new T.Vector3()),plans=window.ElementalPartyEnvironment.planDecor(d,variant,rows,radius,this.sceneryPlacements);
  this.decorStats.push({variant,triangles,instances:plans.length});
  for(const part of parts){if(!part.geometry)continue;const geo=own(part.geometry),mat=own(part.material);for(const tex of part.textures||[])own(tex);
   for(let first=0;first<plans.length;first+=8){const count=Math.min(8,plans.length-first),inst=own(new T.InstancedMesh(geo,mat,count));let i=0,lo=Infinity,hi=-Infinity;
    for(const plan of plans.slice(first,first+count)){
     const {x,z,index:j}=plan,instanceScale=scale*(.87+((j+variant)%3)*.09),yaw=(j*.77+variant)%6.28,c=Math.cos(yaw),s=Math.sin(yaw);
     const island=theme.phase===4&&variant===0,sx=instanceScale*(island?.76+(j%4)*.08:1),sz=instanceScale*(island?.72+((j+2)%4)*.09:1),sy=instanceScale*(island?.78+(j%3)*.11:1);
     const ground=theme.phase===4&&variant!==1?-.5:-2;lo=Math.min(lo,z-radius);hi=Math.max(hi,z+radius);this.dummy.position.set(x-(center.x*c*sx+center.z*s*sz),ground-bounds.min.y*sy,z-(-center.x*s*sx+center.z*c*sz));this.dummy.rotation.set(0,yaw,0);this.dummy.scale.set(sx,sy,sz);this.dummy.updateMatrix();inst.setMatrixAt(i++,this.dummy.matrix);
    }
    inst.instanceMatrix.setUsage(T.StaticDrawUsage);inst.computeBoundingSphere();this.scene.add(inst);this.sceneryCells.push({mesh:inst,lo,hi});if(!mat.transparent)this.solids.push(inst);
   }
  }await new Promise(resolve=>setTimeout(resolve,0));if(serial!==this.serial)return;
 }
 this.backdrop=window.ElementalPartyEnvironment.backdrop(T,d,this.sceneryPlacements,this.api,own);this.scene.add(this.backdrop);
 if(theme.phase===4)this.scene.fog=new T.Fog(0x6c9ea9,120,330);
 const finish=d.finish;if(d.kind==='race'){for(const side of [-1,1]){const post=new T.Mesh(box,light);post.scale.set(.5,5,.5);post.position.set(finish.x+side*7,finish.y+2.5,finish.z-2);this.scene.add(post);}const arch=new T.Mesh(box,light);arch.scale.set(14.5,.5,.6);arch.position.set(finish.x,finish.y+5,finish.z-2);this.scene.add(arch);const flag=this.label('★',3.6,0xffd47f);flag.position.set(finish.x,finish.y+4,finish.z-2);this.scene.add(flag);}
 this.spirits=null;if(d.collectibles?.length){this.spirits=own(new T.InstancedMesh(own(new T.TorusGeometry(.7,.16,6,20)),own(new T.MeshStandardMaterial({color:0xffd584,emissive:0xc18c34,emissiveIntensity:.7,roughness:.4})),d.collectibles.length));this.spirits.frustumCulled=false;this.scene.add(this.spirits);}
 this.preparePursuit(own);
 this.confetti=own(new T.InstancedMesh(own(new T.BoxGeometry(.15,.15,.15)),light,32));this.confetti.frustumCulled=false;this.scene.add(this.confetti);this.confetti.visible=false;this.restart();this.render(0,false,true);const r=this.api.renderer();if(r.compileAsync)await window.ElementalGraphicsEngine.compileAsyncSafe(r,this.scene,this.camera);if(serial!==this.serial)return;this.warmTarget=own(new T.WebGLRenderTarget(64,64));this.render(0,true);this.prepared=true;
 }
 label(text,size,color){const T=this.T,c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d');ctx.font='bold 88px sans-serif';ctx.textAlign='center';ctx.textBaseline='middle';ctx.fillStyle='#'+color.toString(16);ctx.fillText(text,64,65);const tex=this.own(new T.CanvasTexture(c));tex.colorSpace=T.SRGBColorSpace;const s=new T.Sprite(this.own(new T.SpriteMaterial({map:tex,depthWrite:false})));s.scale.set(size,size,1);return s;}
 // One shared cutoff uniform erases floor, scenery, unions AND obstacle details.
 // Materials are owned by this isolated scene; normal modes are never patched.
 preparePursuit(own){
  const T=this.T;this.eraseUniform={value:1e6};this.pursuit=null;this.edgeOpacity=0;this.venom.style.opacity=0;if(this.data.kind!=='race')return;
  const mats=new Set();this.scene.traverse(o=>{if(!o.isMesh||this.sky&&this.sky.getObjectById(o.id))return;for(const m of Array.isArray(o.material)?o.material:[o.material])mats.add(m);});
  for(const m of mats){if(m.isShaderMaterial)continue;const old=m.onBeforeCompile,key=m.customProgramCacheKey?.bind(m);m.onBeforeCompile=s=>{old?.call(m,s);s.uniforms.uPartyEraseZ=this.eraseUniform;s.vertexShader='varying float vPartyEraseZ;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 partyEraseP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\npartyEraseP=instanceMatrix*partyEraseP;\n#endif\nvPartyEraseZ=(modelMatrix*partyEraseP).z;');s.fragmentShader='uniform float uPartyEraseZ; varying float vPartyEraseZ;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <clipping_planes_fragment>','#include <clipping_planes_fragment>\nif(vPartyEraseZ>uPartyEraseZ) discard;');};const prefix=key?key():m.type;m.customProgramCacheKey=()=>prefix+'-party-erase-153';m.needsUpdate=true;}
  this.pursuit=window.ElementalPartyEnvironment.surge(T,this.data,own);this.scene.add(this.pursuit);
 }
 async selectRound(level){if(this.active||this.loadingNext||level>(this.saved.unlocked||1))return false;this.clock.pause();this.level=Math.max(1,Math.min(C.ROUND_COUNT,level));this.loadingNext=true;this.state='preparing';this.keys.clear();this.touchKeys.clear();this.nativeUI.hide();this.roundSelect.disabled=true;try{this.prepared=false;await this.prepare();if(this.active)this.enter();}catch(error){console.warn('[Party round]',error);this.state='paused';this.showModal();}finally{this.loadingNext=false;this.roundSelect.disabled=false;}}
 clearScene(){this.cachedAfterExit=false;this.api.stopHeartbeat?.();this.solids.length=0;for(const o of this.owned)o.dispose?.();this.owned.clear();this.scene=null;this.art=null;this.sky=null;this.handMotion={initialized:false};this.race=null;this.prepared=false;}
 enter(){if(!this.prepared)throw Error('Obby not prepared');if(this.cachedAfterExit){this.cachedAfterExit=false;this.restart();}this.active=true;this.state='playing';this.ui.hidden=false;document.body.classList.add('obby-active');this.nativeUI.hide();this.ui.dir=this.api.language?.()==='ar'?'rtl':'ltr';this.keys.clear();this.touchKeys.clear();this.nativeUI.matchHUD();this.clock.resume();this.api.stateChanged('playing');this.api.lock();this.render(0);}
 restart(){this.boostVisual=0;if(this.speedFx)this.speedFx.style.opacity=0;this.nativeUI.hide();this.api.stopHeartbeat?.();this.heartPhase=0;this.ui.querySelector('.obby-damage').getAnimations().forEach(a=>a.cancel());this.ui.querySelector('.obby-damage').style.opacity=0;this.edgeOpacity=0;this.venom.style.opacity=0;if(this.art)this.art.initialized=false;this.pendingDive=false;this.progressPeak=0;this.clock.reset();this.rewardCoins=0;this.runId=(globalThis.crypto?.randomUUID?.()||'party-'+Date.now())+'-'+(++attemptSequence);this.race=new window.ElementalPartyRace(this.data);this.p=this.race.player.p;this.checkpoint=0;this.elapsed=0;this.worldTime=0;this.deaths=0;this.respawnTimer=0;this.acc=0;this.won=false;this.qualified=false;this.resultShown=false;this.yaw=0;this.pitch=.12;this.cameraKick=0;this.handMotion={initialized:false};this.keys.clear();this.touchKeys.clear();C.pose(this.data,0);for(const [i,ring] of this.checkRings.entries())ring.material.color.setHex(i?0xffd47f:0x87f0bb);this.hudStamp=-1;this.ui.querySelector('.obby-toast').getAnimations().forEach(a=>a.cancel());this.ui.querySelector('.obby-toast').style.opacity=0;this.refresh();}
 respawn(){this.pendingDive=false;this.race.respawn(this.race.player);this.p=this.race.player.p;this.respawnTimer=0;this.keys.clear();this.touchKeys.clear();this.yaw=0;this.pitch=.12;this.cameraKick=0;this.handMotion={initialized:false};this.toast('↺ '+(this.checkpoint+1));}
 dive(){if(this.active&&this.state==='playing'&&this.race.countdown<=0&&this.p.diveCooldown<=0&&!this.p.diveUsed)this.pendingDive=true;}
 jump(){if(this.active&&this.state==='playing'&&this.race.countdown<=0)this.p.buffer=.14;}
 key(e,down){if(!this.active||e.target?.tagName==='SELECT')return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Escape','KeyR','KeyE','ShiftLeft','ShiftRight'].includes(e.code))e.preventDefault();if(down)this.keys.add(e.code);else this.keys.delete(e.code);if(!down||e.repeat)return;if(e.code==='Escape'){if(this.state==='playing')this.pause();else if(this.state==='paused'){if(!this.api.closeSettings?.())this.resume();}}if(e.code==='Space')this.jump();if(['KeyE','ShiftLeft','ShiftRight'].includes(e.code))this.dive();if(e.code==='KeyR'&&this.state==='playing'){if(this.data.kind==='race')this.respawn();else{this.restart();this.resume();}}}
 mouse(e){if(this.state!=='playing'||this.race.countdown>0||!document.pointerLockElement)return;this.yaw-=Math.max(-120,Math.min(120,e.movementX||0))*.0025;this.yaw=Math.atan2(Math.sin(this.yaw),Math.cos(this.yaw));this.pitch=Math.max(-1.35,Math.min(1.35,this.pitch+(e.movementY||0)*.002));}
 pause(){if(!this.active||this.state!=='playing')return;this.api.stopHeartbeat?.();this.speedFx.style.opacity=0;this.clock.pause();this.state='paused';this.keys.clear();this.touchKeys.clear();this.lookTouch=null;document.exitPointerLock?.();this.api.stateChanged('paused');this.showModal();}
 resume(){if(!this.active)return;if(!this.prepared){this.next(true);return;}this.nativeUI.hide();this.state='playing';this.clock.resume();this.keys.clear();this.api.stateChanged('playing');this.api.lock();}
 showModal(){if(this.state==='won')this.nativeUI.showResult();else this.nativeUI.showPause();}
 // Finish stores the same active-wall time shown in HUD and pays once per attempt.
 finish(){
  if(this.resultShown)return;this.api.stopHeartbeat?.();this.resultShown=true;this.qualified=this.race.qualified;this.won=this.qualified;this.speedFx.style.opacity=0;this.clock.pause();this.state='won';
  const seconds=this.clock.seconds(),previousBest=this.saved.best[this.level];
  if(this.qualified&&seconds>0&&Number.isFinite(seconds)){this.saved.best[this.level]=Math.min(previousBest||Infinity,seconds);this.saved.completed[this.level]=true;this.saved.unlocked=1;while(this.saved.unlocked<(this.roundCount||C.ROUND_COUNT)&&this.saved.completed[this.saved.unlocked])this.saved.unlocked++;this.saved.level=Math.min(this.saved.unlocked,this.level+1);this.saved.wins=(this.saved.wins||0)+1;}
  this.save();const coins=this.qualified?finishReward(this.level,seconds,previousBest):0;
  this.rewardCoins=0;
  if(coins>0)try{this.rewardCoins=this.api.bank?.({id:this.runId,level:this.level,seconds,best:this.saved.best[this.level]||seconds,coins})||0;}catch(error){console.warn('[Party reward]',error);}
  this.api.sound(this.qualified?'coin':'hit');this.api.stateChanged('won');document.exitPointerLock?.();this.celebrateTime=0;this.showModal();
 }
 async next(retry=false){
  if(this.loadingNext)return;
  if(retry){this.restart();this.resume();return;}
  if(!this.qualified||!this.saved.completed[this.level]||this.level>=(this.roundCount||C.ROUND_COUNT))return;
  this.loadingNext=true;this.nativeUI.busy(true);this.state='preparing';
  try{this.level=Math.min(this.roundCount||C.ROUND_COUNT,this.level+1);this.prepared=false;await this.prepare();if(this.active)this.enter();}
  catch(error){console.warn('[Party preparation]',error);this.state='paused';this.showModal();this.api.notice?.(this.tr('surfError'));}
  finally{this.loadingNext=false;this.nativeUI.busy(false);}
 }
 exit(){this.clock.pause();this.active=false;this.state='idle';this.ui.hidden=true;this.nativeUI.hide();document.body.classList.remove('obby-active');this.cachedAfterExit=!!this.prepared&&!this.preparing;if(!this.cachedAfterExit)this.clearScene();this.keys.clear();this.touchKeys.clear();this.lookTouch=null;this.api.stateChanged('idle');this.api.exit();}
 toast(text){const el=this.ui.querySelector('.obby-toast');el.textContent=text;el.animate([{opacity:0,transform:'translateY(8px)'},{opacity:1,transform:'translateY(0)',offset:.15},{opacity:1,offset:.7},{opacity:0}],{duration:1200,fill:'forwards'});}
 format(v){const t=Math.floor(Math.max(0,Number.isFinite(v)?v:0)*10),s=Math.floor(t/10);return Math.floor(s/60)+':'+String(s%60).padStart(2,'0')+'.'+t%10;}
 tick(){
  const k=this.keys,t=this.touchKeys,input={yaw:this.yaw,dive:this.pendingDive,jumpHeld:k.has('Space')||t.has('jump'),forward:Number(k.has('KeyW')||k.has('ArrowUp')||t.has('up'))-Number(k.has('KeyS')||k.has('ArrowDown')||t.has('down')),strafe:Number(k.has('KeyD')||k.has('ArrowRight')||t.has('right'))-Number(k.has('KeyA')||k.has('ArrowLeft')||t.has('left'))};
  this.pendingDive=false;const oldCP=this.checkpoint,oldP=this.p,oldFall=this.deaths,wasStarting=this.race.countdown>0;
  const grounded=this.p.grounded,oldVy=this.p.vy;
  this.race.step(input);this.worldTime=this.race.time;this.p=this.race.player.p;this.checkpoint=this.race.player.checkpoint;this.deaths=this.race.player.falls;this.respawnTimer=this.race.player.respawn;
  if(this.p.collected){this.p.collected=false;this.api.sound('coin');}
  if(wasStarting&&this.race.countdown===0)this.clock.start();
  if(this.race.countdown<=0)this.elapsed+=C.DT;
  if(oldP!==this.p){this.cameraKick=0;this.handMotion={initialized:false};}
  for(const [flag,sound]of [['jumped','jump'],['bounced','pad'],['hit','hit'],['dived','pad']])if(this.p[flag]){this.p[flag]=false;if(flag==='hit'){this.cameraKick=.16;this.handMotion.landing=-.16;this.ui.querySelector('.obby-damage').animate([{opacity:.75},{opacity:.24,offset:.3},{opacity:0}],{duration:800});}if(!this.p.dead)this.api.sound(sound);}
  if(this.checkpoint!==oldCP){this.checkRings[this.checkpoint].material.color.setHex(0x86f0b7);this.api.sound('coin');}
  if(this.deaths!==oldFall){this.ui.querySelector('.obby-damage').animate([{opacity:.7},{opacity:0}],{duration:280});if(this.data.fallPenalty)this.toast('−'+this.data.fallPenalty+'s');}
  if(!grounded&&this.p.grounded&&oldVy< -2){this.cameraKick=Math.min(.045,-oldVy*.004);this.handMotion.landing=-.07;}
  if(this.race.over)this.finish();
 }
 update(dt){if(!this.active||this.state==='preparing')return;dt=Math.min(.05,Math.max(0,dt));if(this.state==='playing'){this.acc+=dt;while(this.acc>=C.DT&&this.state==='playing'){this.tick();this.acc=Math.max(0,this.acc-C.DT);}}if(this.state==='won')this.celebrateTime+=dt;if(this.state!=='paused')this.render(dt);this.refresh();}
 refresh(){
  if(!this.data)return;const stamp=Math.floor((this.race?.time||0)*10)+this.checkpoint*1e6+(this.resultShown?1e8:0);if(stamp===this.hudStamp)return;this.hudStamp=stamp;
  this.ui.querySelector('[data-level]').textContent=this.tr('level')+' '+this.level+' · '+this.tr(this.data.nameKey);
  this.progressPeak=Math.max(this.progressPeak||0,this.race.progress());
  const left=this.data.duration?Math.ceil(Math.max(0,this.data.duration-this.race.elapsed))+'s':'';
  this.ui.querySelector('[data-stage]').textContent=this.data.kind==='hunt'?left+' · '+this.race.collected+'/'+this.data.target:this.data.kind!=='race'?left:Math.floor(this.progressPeak*100)+'%';
  this.roundSelect.value=this.level;
  this.ui.querySelector('[data-fill]').style.transform='scaleX('+this.progressPeak+')';
  const caption=this.race.intro.remaining>0?'':this.race.countdown>0?String(Math.ceil(this.race.countdown)):this.race.elapsed<.7?this.tr('partyGo'):'';
  const countdown=this.ui.querySelector('.party-countdown');if(countdown.textContent!==caption){countdown.textContent=caption;if(caption)countdown.animate([{opacity:.2,scale:1.35},{opacity:1,scale:1}],{duration:280,easing:'cubic-bezier(.16,1,.3,1)'});}
  this.ui.querySelector('[data-time]').textContent=this.format(this.clock.seconds());this.ui.querySelector('[data-time-label]').textContent=this.tr('surfTimer');
  this.ui.querySelector('[data-gold-label]').textContent=this.tr('gold');this.ui.querySelector('[data-gold]').textContent=this.api.wallet?.()||0;
  this.ui.querySelector('.obby-bhop').textContent=this.p.bhop>0?'x'+(this.p.bhop+1):'';
  this.ui.querySelector('[data-speed-label]').textContent=this.tr('speed');this.ui.querySelector('[data-speed]').textContent=Math.round(Math.hypot(this.p.vx,this.p.vz)*3.6);
  this.ui.querySelector('[data-hint]').textContent=this.api.mobile?'':'WASD · Space: '+this.tr('obbyJump')+' · E: '+this.tr('obbyDive')+' · R: ↺';
 }
 // First-person eye stays inside the collision AABB; no orbit or avatar models.
 render(dt,warmup=false,prepareOnly=false){
  if(!this.scene||!this.p)return;
  const d=this.data,p=this.p,r=this.api.renderer(),canvas=r.domElement,aspect=canvas.clientWidth/Math.max(1,canvas.clientHeight),delta=Math.min(.05,Math.max(0,dt));
  this.art.update(this.worldTime,p.z);this.cameraKick*=Math.exp(-14*delta);
  this.biomeGround?.update(this.worldTime);
  for(const cell of this.sceneryCells||[])cell.mesh.visible=p.z>=cell.lo-245&&p.z<=cell.hi+245;
  if(this.pursuit){
   this.eraseUniform.value=Number.isFinite(d.eraseZ)?d.eraseZ:1e6;this.pursuit.position.z=this.race.chase.z;this.pursuit.scale.set(1.2,1.2,1);this.pursuit.material.uniforms.time.value=this.worldTime;this.pursuit.visible=true;
   const pressure=this.race.chase.pressure,bpm=92+108*pressure;
   if(this.state==='playing'&&!warmup&&!prepareOnly&&this.race.started&&pressure>.08){this.heartPhase+=delta*bpm/60;if(this.heartPhase>=1){this.heartPhase%=1;this.api.heartbeat?.(pressure);}}else{this.heartPhase=0;this.api.stopHeartbeat?.();}
   const pulse=Math.exp(-this.heartPhase*24)+.65*Math.exp(-Math.pow((this.heartPhase-.24)*19,2));
   this.edgeOpacity+=(pressure-this.edgeOpacity)*(1-Math.exp(-8*delta));this.venom.style.opacity=(this.edgeOpacity*(.76+.24*Math.min(1,pulse))).toFixed(3);
   this.venom.style.setProperty('--threat-width',(1+this.edgeOpacity*(.12+.08*Math.sin(this.worldTime*2.2)+.14*pulse)).toFixed(4));this.venom.style.setProperty('--threat-height',(1+this.edgeOpacity*.06*pulse).toFixed(4));
  }
  if(this.spirits){for(const c of d.collectibles){this.dummy.position.set(c.x,c.y+Math.sin(this.worldTime*2+c.id)*.12,c.z);this.dummy.rotation.set(0,this.worldTime*.8+c.id,0);this.dummy.scale.setScalar(c.collected?0:1);this.dummy.updateMatrix();this.spirits.setMatrixAt(c.id,this.dummy.matrix);}this.spirits.instanceMatrix.needsUpdate=true;}
  const speed=Math.hypot(p.vx,p.vz),bob=p.grounded?Math.sin(this.worldTime*12)*.012*Math.min(1,speed/C.SPEED):0;
  const boostTarget=this.state==='playing'&&p.boostTime>0?Math.min(1,p.boostTime*2):0;this.boostVisual+=(boostTarget-this.boostVisual)*(1-Math.exp(-9*delta));this.speedFx.style.opacity=(this.boostVisual*.72).toFixed(3);this.speedFx.style.animationPlayState=this.state==='playing'?'running':'paused';
  const stagger=Math.max(0,Math.min(1,(p.tumble||0)/.9));this.camera.position.set(p.x,p.y+1.58-this.cameraKick-.14*stagger+bob,p.z);
  const intro=this.race.intro;let viewYaw=this.yaw,viewPitch=this.pitch;if(intro.remaining>0){const u=Math.max(0,Math.min(1,(intro.time-1.35)/1.45)),turn=u*u*(3-2*u);viewYaw=Math.PI*(1-turn);viewPitch=-.14+turn*.26;}
  this.camera.rotation.set(-viewPitch+.075*stagger*Math.sin((.9-(p.tumble||0))*18),viewYaw,0,'YXZ');
  const fov=(this.api.mobile&&aspect<1?76:82)+(p.diveTimer>0?3:0)+this.boostVisual*(this.api.mobile?3:5);
  if(this.camera.aspect!==aspect||Math.abs(this.camera.fov-fov)>.01){this.camera.aspect=aspect;this.camera.fov=fov;this.camera.updateProjectionMatrix();}
  if(this.sky)this.sky.position.copy(this.camera.position);
  this.confetti.visible=this.state==='won'&&this.qualified;
  if(this.confetti.visible){for(let i=0;i<32;i++){const t=(this.celebrateTime+i*.07)%2;this.dummy.position.set(p.x+Math.sin(i*2.4)*t*5,p.y+2+8*t-5*t*t,p.z+Math.cos(i*2.4)*t*5);this.dummy.scale.setScalar(1);this.dummy.rotation.set(t*4,i,t*6);this.dummy.updateMatrix();this.confetti.setMatrixAt(i,this.dummy.matrix);}this.confetti.instanceMatrix.needsUpdate=true;}
  if(prepareOnly)return;
  const target=r.getRenderTarget(),auto=r.autoClear;r.setRenderTarget(warmup?this.warmTarget:null);r.autoClear=true;
  try{
   if(!warmup&&this.api.renderWorld)this.api.renderWorld(this.scene,this.camera,delta,d.theme.phase);else r.render(this.scene,this.camera);
   if(!warmup&&this.state==='playing'&&this.respawnTimer<=0&&this.api.renderHands){
    const h=this.handPlayer,scale=this.api.handScale||1;h.vx=p.vx*scale;h.vz=p.vz*scale;h.vy=p.vy*scale;h.grounded=p.grounded;h.dash=p.diveTimer;h.slide=h.phase=h.slow=0;
    h.strafeVelocity=(p.vx*Math.cos(this.yaw)-p.vz*Math.sin(this.yaw))*scale;
    this.handMotion.delta=delta;this.handMotion.yaw=viewYaw;this.handMotion.pitch=viewPitch;this.handMotion.surfSide=0;this.handMotion.allowIdle=true;
    this.handMotion.viewOffsetZ=-Math.max(0,1-aspect)*1.8;this.handMotion.viewOffsetY=-Math.max(0,1-aspect)*.45;this.handMotion.landing=(this.handMotion.landing||0)*Math.exp(-12*delta);
    this.api.renderHands(this.camera,h,this.worldTime,this.handMotion);
   }
  }finally{r.autoClear=auto;r.setRenderTarget(target);}
 }
 snapshot(){return{mode:'party',perspective:'first-person',localAI:false,competitors:0,state:this.state,level:this.level,map:this.data?.name,unlocked:this.saved.unlocked,completedRounds:Object.keys(this.saved.completed).map(Number),sourceRound:this.data?.sourceLevel,roundKind:this.data?.kind,roundCount:C.ROUND_COUNT,railCount:this.data?.rails?.length||0,floorTiles:{total:this.data?.platforms.filter(p=>p.type==='crumble').length||0,missing:this.data?.platforms.filter(p=>p.type==='crumble'&&!p.active).length||0,repairing:this.data?.platforms.filter(p=>p.reforming).length||0},collected:this.race?.collected,target:this.data?.target,remaining:this.data?.duration?Math.max(0,this.data.duration-this.race.elapsed):null,chase:this.race?.chase,failure:this.race?.failure,reference:this.data?.reference,intro:this.race?.intro,viewYaw:this.camera?.rotation.y,countdown:this.race?.countdown,completed:this.qualified,progress:this.progressPeak,checkpoint:this.checkpoint,checkpointCount:this.data?.checkpoints.length,time:this.clock.seconds(),rewardCoins:this.rewardCoins,deaths:this.deaths,player:this.p,controls:'camera-relative WASD; no auto run; hold Space / scroll down bhop; E/Shift dive; R checkpoint (race) / restart (arena); +Y up, race -Z',modules:this.data?.order,platforms:this.data?.platforms.filter(o=>o.active&&Math.abs(o.z-this.p.z)<25).map(o=>({id:o.id,x:o.x,y:o.y,z:o.z,w:o.w,d:o.d,type:o.type||'deck',branch:!!o.branch})),hazards:this.data?.hazards.filter(h=>!h.consumed&&Math.abs((h.currentZ??h.z)-this.p.z)<25).map(h=>({type:h.type,x:h.currentX,y:h.currentY,z:h.currentZ??h.z})),best:this.saved.best[this.level]||null};}
}ElementalObbyRun.ActivePlayClock=ActivePlayClock;ElementalObbyRun.finishReward=finishReward;window.ElementalObbyRun=ElementalObbyRun;})();
