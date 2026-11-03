/* Isolated Troll Obby adapter: shared 120Hz swept-AABB, UI and host lifecycle. */
(function(g){'use strict';const C=g.ElementalObbyCourse;
// Slab ray vs authoritative boxes. No triangles, instance scans or allocations.
function cameraDistance(data,origin,dir,limit){let nearest=limit;for(const o of data.platforms){if(!o.active||o.triggerOnly||o.trap==='hiddenKill')continue;let enter=0,exit=nearest;
 for(let axis=0;axis<3;axis++){const p=axis===0?origin.x:axis===1?origin.y:origin.z,v=axis===0?dir.x:axis===1?dir.y:dir.z,lo=axis===0?o.x-o.w/2-.12:axis===1?o.y-o.h-.12:o.z-o.d/2-.12,hi=axis===0?o.x+o.w/2+.12:axis===1?o.y+.12:o.z+o.d/2+.12;
 if(Math.abs(v)<1e-9){if(p<lo||p>hi){exit=-1;break;}}else{const a=(lo-p)/v,b=(hi-p)/v;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)break;}}
 if(exit>=enter&&enter>.06)nearest=Math.min(nearest,enter);
 }return nearest;}
function triggerTraps(data,p){for(const o of data.platforms){
 if(o.trap==='approachFake'&&!o.consumed&&Math.abs(p.x-o.x)<o.w/2+1.2&&Math.abs(p.z-o.z)<o.d/2+2&&p.y>o.y-1&&p.y<o.y+4){if(o.triggerAt===null)o.triggerAt=data.time;o.revealed=true;}
 if(o.trap==='approachFake'&&o.triggerAt!==null&&data.time-o.triggerAt>.16){o.active=false;o.consumed=true;}
 if(o.trap==='hiddenKill'&&Math.abs(p.x-o.x)<o.w/2+C.R&&Math.abs(p.z-o.z)<o.d/2+C.R&&p.y<o.y&&p.y+C.H>o.y-o.h){p.dead=true;p.trapEvent='hiddenKill';o.revealed=true;}
 }}
class TrollRace{
 constructor(data){this.data=data;this.time=this.elapsed=0;this.countdown=3;this.started=this.over=false;this.intro={remaining:0,time:0};this.chase={enabled:false};this.failure=null;
  for(const o of data.platforms){o.consumed=false;o.revealed=false;o.revealUntil=0;o.triggerAt=null;if(o.type==='crumble')o.touchAt=null;}C.pose(data,0);
  this.player={p:C.player(data.checkpoints[0]),checkpoint:0,finished:false,falls:0,respawn:0};
 }
 respawn(r=this.player){const stage=r.checkpoint;for(const o of this.data.platforms)if(o.stage===stage){o.consumed=false;o.active=true;o.triggerAt=null;if(o.type==='crumble')o.touchAt=null;}r.p=C.player(this.data.checkpoints[stage]);r.respawn=0;}
 progress(){const r=this.player;if(r.finished)return 1;return Math.min(.999,(r.checkpoint+Math.max(0,Math.min(1,(-r.p.z-r.checkpoint*40)/40)))/(this.data.checkpoints.length-1));}
 step(input){if(this.over)return;this.time+=C.DT;C.pose(this.data,this.time);if(this.countdown>0){this.countdown=Math.max(0,this.countdown-C.DT);if(!this.countdown)this.started=true;return;}this.elapsed+=C.DT;const r=this.player,p=r.p;
  if(r.respawn>0){r.respawn-=C.DT;p.vy-=C.G*C.DT;p.y+=p.vy*C.DT;if(r.respawn<=0)this.respawn();return;}
  triggerTraps(this.data,p);C.step(p,input,this.data);
  // Solid collision handles normal contact; overlap handles spawn/edge contact too.
  for(const o of this.data.platforms)if(o.trap==='gift'&&Math.abs(p.x-o.x)<o.w/2+C.R&&Math.abs(p.z-o.z)<o.d/2+C.R&&p.y<o.y&&p.y+C.H>o.y-o.h){p.dead=true;p.trapEvent='gift';}
  if(p.dead||p.y<this.data.fallY||Math.abs(p.x)>this.data.bounds.x||p.z>this.data.bounds.maxZ||p.z<this.data.bounds.minZ){r.falls++;if(p.trapEvent==='gift'||p.trapEvent==='hiddenKill'){this.respawn();return;}r.respawn=.65;p.dead=true;return;}
  const cp=this.data.checkpoints[r.checkpoint+1];if(cp&&Math.abs(p.x-cp.x)<cp.w/2&&Math.abs(p.z-cp.z)<cp.d/2&&p.y>=cp.y-.1&&p.y<cp.y+3){r.checkpoint++;if(r.checkpoint===this.data.checkpoints.length-1){r.finished=true;this.over=true;}}
 }
 get qualified(){return this.player.finished;}
}
class TrollRun extends g.ElementalObbyRun{
 migrateSequence(){this.roundCount=3;this.saved.completed||={};this.saved.unlocked=1;while(this.saved.unlocked<3&&this.saved.completed[this.saved.unlocked])this.saved.unlocked++;this.level=Math.max(1,Math.min(this.saved.unlocked,this.level));this.saved.level=this.level;this.save();}
 selection(){return{level:this.level,unlocked:this.saved.unlocked,name:this.tr('trollObby'),completed:!!this.saved.completed[this.level]};}
 async build(){const T=this.T,serial=++this.serial;this.clearScene();const own=r=>this.own(r);this.data=C.trollCourse(this.level);const d=this.data;
  this.scene=new T.Scene();this.scene.background=new T.Color(d.theme.sky);this.scene.fog=new T.Fog(d.theme.sky,70,185);this.scene.add(new T.HemisphereLight(0xdaf1ff,0x344047,1.05));const sun=new T.DirectionalLight(0xffffff,1.8);sun.position.set(-18,35,12);this.scene.add(sun);const rim=new T.DirectionalLight(0x9acfe8,.5);rim.position.set(28,14,-35);this.scene.add(rim);this.camera=new T.PerspectiveCamera(60,1,.08,260);
  this.dummy=new T.Object3D();this.aim=new T.Vector3();this.desired=new T.Vector3();this.rayDirection=new T.Vector3();this.cameraReady=false;this.fallAnchor=null;
  const cube=own(g.ElementalCubeAvatar.rounded(T,1,1,1,.065,3));const colors=[d.theme.color,0x51898d,0xd9b568,0x717b98];
  const mat=(color,glow=0)=>own(new T.MeshStandardMaterial({color,roughness:.4,metalness:.12,emissive:color,emissiveIntensity:glow}));
  const white=mat(0xe5dcf0),dark=mat(0x314552),neon=colors.map(c=>mat(c,.1));white.color.setHex(d.theme.phase===0?0x6b8997:d.theme.phase===5?0xd0e0e8:0xc5d9c4);white.roughness=d.theme.phase===5?.48:d.theme.phase===0?.62:.82;white.metalness=d.theme.phase===0?.3:.025;
  const mesh=(geo,m,x,y,z,sx=1,sy=1,sz=1,parent=this.scene)=>{const obj=new T.Mesh(geo,m);obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);parent.add(obj);return obj;};
  this.tiles=[];this.checkRings=[];
  const ribbons=own(new T.BoxGeometry(1,1,1));const geometryCache=new Map(),panel=(w,h,d)=>{const key=[w,h,d].join('/');if(!geometryCache.has(key))geometryCache.set(key,own(g.ElementalCubeAvatar.rounded(T,w,h,d,.12,3)));return geometryCache.get(key);};
  for(const o of d.platforms){const group=new T.Group();group.userData.trollDynamic=['fake','approachFake','wall','shoveWall','hiddenKill'].includes(o.trap)||o.type==='crumble';group.position.set(o.x,o.y-o.h/2,o.z);this.scene.add(group);const color=neon[(o.stage||0)%4];
   const body=mesh(panel(o.w,o.h,o.d),(o.trap==='wall'||o.trap==='shoveWall'||o.trap==='hiddenKill')?own(new T.MeshStandardMaterial({color:0x67ebff,transparent:true,opacity:0,depthWrite:false,roughness:.3})):color,0,0,0,1,1,1,group);
   if(!['wall','shoveWall','hiddenKill'].includes(o.trap)){
    mesh(panel(o.w-.18,.18,o.d-.18),white,0,o.h/2+.02,0,1,1,1,group);
    for(const side of [-1,1])mesh(cube,dark,side*(o.w/2-.13),o.h/2+.13,0,.08,.06,o.d-.35,group);
    if(o.trap==='gift'){mesh(ribbons,neon[2],0,0,0,.22,o.h+.02,o.d+.03,group);mesh(ribbons,neon[2],0,0,0,o.w+.03,o.h+.02,.22,group);mesh(own(new T.TorusGeometry(.38,.09,6,14)),neon[2],0,o.h/2+.2,0,1,1,1,group);}
    if(o.trap==='reversePad'){const pad=mesh(own(new T.CylinderGeometry(1.15,1.3,.22,20)),neon[2],0,o.h/2+.12,0,1,1,1,group);mesh(own(new T.TorusGeometry(.8,.09,6,24)),white,0,o.h/2+.25,0,1,1,1,group).rotation.x=-Math.PI/2;pad.userData.pad=true;}
    this.solids.push(body);
   }
   this.tiles.push({o,group,body});
  }
  for(const cp of d.checkpoints){for(const side of [-1,1])for(const end of [-1,1])mesh(cube,dark,cp.x+side*5.7,2.9,cp.z+end*2.6,.8,10,.8);const ring=mesh(own(new T.TorusGeometry(1.7,.09,6,28)),mat(cp.index?0xffd47f:0x87f0bb,.4),cp.x,cp.y+.06,cp.z);ring.rotation.x=-Math.PI/2;this.checkRings.push(ring);}
  // The same opaque relief floor and complete compound biome models as Party Run.
  // Banners, speaker stacks and party hats share geometry/materials.
  const hat=own(new T.ConeGeometry(1.25,2.8,12));for(const cp of d.checkpoints){for(const side of [-1,1]){mesh(cube,dark,side*8.5,10,cp.z,1.4,4,1.2);mesh(hat,neon[cp.index%4],side*8.5,13.4,cp.z);for(let j=0;j<2;j++){const speaker=mesh(own(new T.CylinderGeometry(.42,.42,.08,14)),neon[(j+cp.index)%4],side*8.5,9+j*1.4,cp.z+.65);speaker.rotation.x=Math.PI/2;}}}
  const finish=d.finish;mesh(cube,neon[2],0,12.8,finish.z-2,15,.5,.6);for(const side of [-1,1])mesh(cube,neon[2],side*7.2,10.3,finish.z-2,.5,5,.6);const star=this.label('★',2.5,0xfff598);star.position.set(0,12.1,finish.z-2);this.scene.add(star);
  const avatar=this.api.hubAvatar(own);this.avatar=avatar.root;this.body=avatar.body;this.avatarMotion=avatar.motion;this.avatarAnimation={body:this.body,avatarMotion:this.avatarMotion,time:0};this.scene.add(this.avatar);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,3,32,32,31);gradient.addColorStop(0,'rgba(4,17,24,.4)');gradient.addColorStop(1,'rgba(4,17,24,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const shadowMat=own(new T.MeshBasicMaterial({map:own(new T.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  this.avatarShadow=mesh(own(new T.PlaneGeometry(3.3,3.3)),shadowMat,0,8.14,0);this.avatarShadow.rotation.x=-Math.PI/2;this.avatarShadow.renderOrder=2;
  await this.buildEnvironment(own);if(serial!==this.serial)return;this.batchStatic();this.venom.replaceChildren();this.ui.querySelector('.obby-reticle').hidden=true;this.ui.querySelector('[data-dive]').hidden=true;this.restart();this.render(0,false,true);
  const r=this.api.renderer();if(r.compileAsync)await g.ElementalGraphicsEngine.compileAsyncSafe(r,this.scene,this.camera);if(serial!==this.serial)return;this.warmTarget=own(new T.WebGLRenderTarget(64,64));this.render(0,true);this.prepared=true;
 }
 restart(){this.nativeUI.hide();this.clock.reset();this.rewardCoins=0;this.runId='troll-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+performance.now());this.race=new TrollRace(this.data);this.p=this.race.player.p;this.checkpoint=this.elapsed=this.worldTime=this.deaths=this.respawnTimer=this.acc=0;this.won=this.qualified=this.resultShown=false;this.yaw=0;this.pitch=.48;this.facing=0;this.keys.clear();this.touchKeys.clear();this.pendingDive=false;this.cameraReady=false;this.fallAnchor=null;this.hudStamp=-1;this.progressPeak=0;this.cameraKick=0;this.handMotion={};this.refresh();}
 async buildEnvironment(own){const T=this.T,d=this.data,theme=d.theme,serial=this.serial;
 this.sky=this.api.sky?.(own);if(this.sky){this.sky.rotation.y=Math.PI/2;const disc=this.sky.userData.sun;if(disc){disc.material.color.setHex([0xff74c8,0xffffb0,0xffffff,0xff9b56,0xffe0a0,0xf3f7ff][theme.phase]);disc.position.set(360,190,180);disc.scale.setScalar(.6);}if(this.sky.userData.stars)this.sky.userData.stars.material.opacity=[0,5].includes(theme.phase)?.55:.22;this.scene.add(this.sky);}this.camera.far=650;this.camera.updateProjectionMatrix();
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
  const rows=Math.max(1,Math.min(wanted,Math.floor((this.api.mobile?65000:110000)/Math.max(1,triangles*2)),variant===3?3:16));
  const radius=Math.hypot(size.x,size.z)*scale*1.05/2,center=bounds.getCenter(new T.Vector3()),plans=window.ElementalPartyEnvironment.planDecor(d,variant,rows,radius,this.sceneryPlacements);
  this.decorStats.push({variant,triangles,instances:plans.length});
  for(const part of parts){if(!part.geometry)continue;const geo=own(part.geometry),mat=own(part.material);for(const tex of part.textures||[])own(tex);
   for(let first=0;first<plans.length;first+=8){const count=Math.min(8,plans.length-first),inst=own(new T.InstancedMesh(geo,mat,count));let i=0,lo=Infinity,hi=-Infinity;
    for(const plan of plans.slice(first,first+count)){
     const {x,z,index:j}=plan,instanceScale=scale*(.87+((j+variant)%3)*.09),yaw=(j*.77+variant)%6.28,c=Math.cos(yaw),s=Math.sin(yaw);
     const island=theme.phase===4&&variant===0,sx=instanceScale*(island?.76+(j%4)*.08:1),sz=instanceScale*(island?.72+((j+2)%4)*.09:1),sy=instanceScale*(island?.78+(j%3)*.11:1);
     const ground=theme.phase===4&&variant!==1?-.5:-2;lo=Math.min(lo,z-radius);hi=Math.max(hi,z+radius);this.dummy.position.set(x-(center.x*c*sx+center.z*s*sz),ground-bounds.min.y*sy,z-(-center.x*s*sx+center.z*c*sz));this.dummy.rotation.set(0,yaw,0);this.dummy.scale.set(sx,sy,sz);this.dummy.updateMatrix();inst.setMatrixAt(i++,this.dummy.matrix);
    }
    inst.instanceMatrix.setUsage(T.StaticDrawUsage);inst.computeBoundingSphere();this.scene.add(inst);this.sceneryCells.push({mesh:inst,lo,hi});
   }
  }await new Promise(resolve=>setTimeout(resolve,0));if(serial!==this.serial)return;
 }
 this.backdrop=window.ElementalPartyEnvironment.backdrop(T,d,this.sceneryPlacements,this.api,own);this.scene.add(this.backdrop);
 if(theme.phase===4)this.scene.fog=new T.Fog(0x6c9ea9,120,330);
 }
 batchStatic(){
  // Bake static transforms once. Original collision proxies retain matrixWorld
  // off-scene; fake tiles and revealing walls stay independently switchable.
  this.scene.updateMatrixWorld(true);const groups=new Map();
  this.scene.traverse(o=>{if(!o.isMesh||o.isInstancedMesh||o===this.avatarShadow)return;for(let p=o;p;p=p.parent)if(p===this.avatar||p===this.avatarShadow||p.userData.trollDynamic)return;
   const key=o.geometry.uuid+'/'+o.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o);
  });
  for(const list of groups.values()){if(list.length<2)continue;const first=list[0],batch=this.own(new this.T.InstancedMesh(first.geometry,first.material,list.length));for(let i=0;i<list.length;i++){batch.setMatrixAt(i,list[i].matrixWorld);list[i].removeFromParent();}batch.instanceMatrix.setUsage(this.T.StaticDrawUsage);batch.computeBoundingSphere();this.scene.add(batch);}
 }
 enter(){super.enter();document.body.classList.add('troll-active');}
 exit(){document.body.classList.remove('troll-active');super.exit();}
 tick(){const falls=this.deaths;super.tick();if(this.deaths>falls)this.api.sound('hit');const moving=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>this.keys.has(k))||['up','down','left','right'].some(k=>this.touchKeys.has(k));if(moving&&Math.hypot(this.p.vx,this.p.vz)>.15){const target=Math.atan2(-this.p.vx,-this.p.vz);this.facing+=Math.atan2(Math.sin(target-this.facing),Math.cos(target-this.facing))*(1-Math.exp(-16*C.DT));}}
 clearScene(){super.clearScene();this.tiles=[];this.sceneryCells=[];this.sceneryPlacements=[];this.checkRings=[];this.avatar=this.body=this.avatarShadow=this.avatarAnimation=this.sky=this.biomeGround=this.backdrop=null;}
 bindLookPad(pad){pad.addEventListener('pointerdown',e=>{if(!this.active||this.state!=='playing'||this.race?.countdown>0||this.lookTouch)return;e.preventDefault();e.stopPropagation();this.api.interaction?.();this.lookTouch={id:e.pointerId,x:e.clientX,y:e.clientY};try{pad.setPointerCapture(e.pointerId);}catch(_){}});pad.addEventListener('pointermove',e=>{const p=this.lookTouch;if(!p||p.id!==e.pointerId||this.state!=='playing')return;e.preventDefault();e.stopPropagation();this.yaw-=Math.max(-40,Math.min(40,e.clientX-p.x))*.005;this.pitch=Math.max(.18,Math.min(.9,this.pitch+Math.max(-40,Math.min(40,e.clientY-p.y))*.004));p.x=e.clientX;p.y=e.clientY;});for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(this.lookTouch?.id===e.pointerId)this.lookTouch=null;});}
 mouse(e){if(this.state!=='playing'||this.race.countdown>0||!document.pointerLockElement)return;this.yaw-=Math.max(-110,Math.min(110,e.movementX||0))*.005;this.yaw=Math.atan2(Math.sin(this.yaw),Math.cos(this.yaw));this.pitch=Math.max(.18,Math.min(.9,this.pitch+Math.max(-110,Math.min(110,e.movementY||0))*.004));}
 respawn(){const yaw=this.yaw,pitch=this.pitch;super.respawn();this.yaw=yaw;this.pitch=pitch;}
 dive(){} // Troll routes never require a dash or glove.
 render(dt,warmup=false,prepareOnly=false){if(!this.scene||!this.p)return;const T=this.T,p=this.p,r=this.api.renderer(),delta=Math.min(.05,Math.max(0,dt)),t=this.worldTime,aspect=r.domElement.clientWidth/Math.max(1,r.domElement.clientHeight);
  for(const {o,group,body}of this.tiles){group.visible=o.active||o.trap==='fake';if(o.trap==='fake'){group.visible=o.active;}if(o.type==='crumble'){group.visible=o.active;group.position.y=o.y-o.h/2-(o.drop||0);group.rotation.z=o.warning?Math.sin(t*25)*.012:0;}if(o.trap==='wall'||o.trap==='shoveWall'){group.visible=o.revealUntil>t;body.material.opacity=group.visible?.38:0;}if(o.trap==='approachFake'){group.visible=o.active;group.rotation.z=o.revealed&&o.active?Math.sin(t*40)*.025:0;}if(o.trap==='hiddenKill'){group.visible=o.revealed;body.material.opacity=o.revealed?.45:0;}}
  this.biomeGround?.update(t);if(this.sky)this.sky.position.copy(this.camera.position);this.avatar.position.set(p.x,p.y+1.08,p.z);this.avatar.rotation.y=this.facing;this.avatarAnimation.time=t;g.ElementalLobbyHub.prototype.animateAvatar.call(this.avatarAnimation,delta,Math.hypot(p.vx,p.vz),p.grounded,p.vy);const support=this.data.platforms[p.support];this.avatarShadow.visible=!!support?.active;this.avatarShadow.position.set(p.x,(support?.y||8)+.145,p.z);this.avatarShadow.material.opacity=.65;
  const falling=this.respawnTimer>0||p.y<6;if(falling&&!this.fallAnchor)this.fallAnchor=new T.Vector3(p.x,8.8,p.z);if(!falling)this.fallAnchor=null;
  this.pitch=Math.max(.18,Math.min(.9,this.pitch));const distance=10.5,centerY=p.y+1.08;
  this.desired.set(p.x+Math.sin(this.yaw)*Math.cos(this.pitch)*distance,centerY+1.15+Math.sin(this.pitch)*distance,p.z+Math.cos(this.yaw)*Math.cos(this.pitch)*distance);
  this.aim.set(p.x-Math.sin(this.yaw)*3.8,centerY+1.35,p.z-Math.cos(this.yaw)*3.8);
  if(this.fallAnchor){this.desired.set(this.fallAnchor.x+Math.sin(this.yaw)*5,this.fallAnchor.y+4,this.fallAnchor.z+Math.cos(this.yaw)*5);this.aim.y=Math.max(p.y+.8,this.fallAnchor.y-9);this.avatar.rotation.z=Math.sin(t*11)*.35;}
  else this.avatar.rotation.z=0;
  const dist=this.desired.distanceTo(this.aim),dir=this.rayDirection.copy(this.desired).sub(this.aim).normalize(),allowed=cameraDistance(this.data,this.aim,dir,dist),hit=allowed<dist;if(hit)this.desired.copy(dir).multiplyScalar(Math.max(.35,allowed-.22)).add(this.aim);
  if(!this.cameraReady||hit){this.camera.position.copy(this.desired);this.cameraReady=true;}else this.camera.position.lerp(this.desired,1-Math.exp(-9*delta));this.camera.lookAt(this.aim);
  if(this.camera.aspect!==aspect){this.camera.aspect=aspect;this.camera.updateProjectionMatrix();}
  for(const cell of this.sceneryCells||[])cell.mesh.visible=p.z>=cell.lo-190&&p.z<=cell.hi+190;
  if(prepareOnly)return;const target=r.getRenderTarget(),auto=r.autoClear;r.setRenderTarget(warmup?this.warmTarget:null);r.autoClear=true;try{if(!warmup&&this.api.renderWorld)this.api.renderWorld(this.scene,this.camera,delta,this.data.theme.phase);else r.render(this.scene,this.camera);}finally{r.autoClear=auto;r.setRenderTarget(target);}
 }
 refresh(){super.refresh();if(this.ui){const hint=this.api.mobile?'':'WASD · Space: '+this.tr('obbyJump')+' · R: ↺';const node=this.ui.querySelector('[data-hint]');if(node.textContent!==hint)node.textContent=hint;}}
 snapshot(){return{mode:'troll',perspective:'third-person',state:this.state,level:this.level,checkpoint:this.checkpoint,time:this.clock.seconds(),deaths:this.deaths,progress:this.progressPeak,player:this.p,modules:this.data?.modules,camera:this.camera?.position.toArray(),traps:this.data?.platforms.filter(o=>o.trap).map(o=>({id:o.id,type:o.trap,x:o.x,y:o.y,z:o.z,active:o.active,revealed:o.revealed})),controls:'WASD camera-relative, Space jump, R checkpoint, Esc pause; +Y up, -Z forward'};}
}
g.ElementalTrollCameraDistance=cameraDistance;g.ElementalTrollTriggerTraps=triggerTraps;g.ElementalTrollRace=TrollRace;g.ElementalTrollRun=TrollRun;
})(window);
