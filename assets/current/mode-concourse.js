/* A lightweight room behind the plaza's single Games portal. */
(function(){'use strict';
const fields=['zones','solids','clickable','portalPreviews'];
let playedModes={};try{playedModes=JSON.parse(localStorage.getItem('elemental-mode-visits-v1')||'{}');}catch(_){}
if(!playedModes||typeof playedModes!=='object'||Array.isArray(playedModes))playedModes={};
function played(mode){return playedModes[mode]===true;}
function markPlayed(mode){playedModes[mode]=true;try{localStorage.setItem('elemental-mode-visits-v1',JSON.stringify(playedModes));}catch(_){} }
// One GPU preparation owner. Portal demand reuses/promotes the same work rather
// than cancelling a ready scene and rebuilding it at the doorway.
class PreparationQueue{
 constructor(api){this.api=api;this.jobs=new Map();this.pending=[];this.active=null;this.enabled=false;this.foreground=null;this.serial=0;this.demandSerial=0;}
 request(mode,priority=10){const key=this.api.key(mode);if(this.api.ready(mode))return Promise.resolve(true);let job=this.jobs.get(key);if(job?.state==='failed'&&performance.now()<job.retryAt)return Promise.reject(Error(job.error));if(job&&['queued','working'].includes(job.state)){job.priority=Math.min(job.priority,priority);this.pump();return job.promise;}
  job={key,mode,priority,state:'queued',order:++this.serial};job.promise=new Promise((resolve,reject)=>Object.assign(job,{resolve,reject}));this.jobs.set(key,job);if(this.jobs.size>24)for(const [id,old]of this.jobs){if(this.jobs.size<=24)break;if(!['queued','working'].includes(old.state))this.jobs.delete(id);}this.pending.push(job);this.pump();return job.promise;
 }
 pump(){if(this.active||!this.enabled)return;this.pending.sort((a,b)=>a.priority-b.priority||a.order-b.order);const index=this.foreground?this.pending.findIndex(j=>j.mode===this.foreground):0;if(index<0||!this.pending.length)return;const [job]=this.pending.splice(index,1);if(job.key!==this.api.key(job.mode)){job.state='stale';job.resolve(false);this.pump();return;}this.active=job;job.state='working';job.started=performance.now();
  Promise.resolve().then(()=>this.api.prepare(job.mode)).then(()=>{job.state=this.api.ready(job.mode)?'ready':'cancelled';job.resolve(job.state==='ready');},error=>{job.state='failed';job.error=String(error?.message||error);job.retryAt=performance.now()+3000;job.reject(error);}).finally(()=>{job.ms=performance.now()-job.started;this.active=null;this.pump();});
 }
 async demand(mode){const ticket=++this.demandSerial;this.enabled=true;this.foreground=mode;const work=this.request(mode,-100);work.catch(()=>{});const active=this.active;
  try{if(active&&active.mode!==mode){if(['surf','obby','troll'].includes(active.mode)&&!this.api.ready(active.mode))await this.api.cancel(active.mode);else await active.promise.catch(()=>{});}const ready=await work;if(!ready)throw Error('Mode preparation did not complete: '+mode);}finally{if(ticket===this.demandSerial){this.foreground=null;this.enabled=false;}}
 }
 async cancelDemand(mode){if(this.foreground===mode){++this.demandSerial;this.foreground=null;}this.enabled=false;this.pending=this.pending.filter(job=>{if(job.mode!==mode)return true;job.state='cancelled';job.resolve(false);return false;});const active=this.active;if(active?.mode===mode){await this.api.cancel(mode);await active.promise.catch(()=>{});}}
 snapshot(){return{active:this.active?.mode||null,foreground:this.foreground,enabled:this.enabled,jobs:[...this.jobs.values()].map(j=>({mode:j.mode,key:j.key,state:j.state,ms:Math.round(j.ms||0)}))};}
}
function queue(h){return h.modePreparation||(h.modePreparation=new PreparationQueue({key:mode=>mode==='surf'?'surf:'+h.api.surfSelection().level:mode==='obby'?'obby:'+h.api.partySelection().level:mode==='troll'?'troll:'+h.api.trollSelection().level:mode==='level'?'level:'+h.api.warmKey():mode,ready:mode=>!!h.api.preparationReady?.(mode),prepare:mode=>h.api.prepare(mode),cancel:mode=>h.api.cancelWarmup?.(mode)}));}

// A room is not a mode choice. Do not make every Party/Surf/2D player wait for
// Nature Level 1 first. Each actual portal owns its covered, cached preparation.
async function seed(h){const q=queue(h);try{await q.demand('runner2d');}finally{q.enabled=false;}}
function updateWarm(){} // Exploring must never start a GPU build/compile job.
async function drainGpu(h){const gl=h.api.renderer().getContext();if(gl.isContextLost())throw Error('WebGL context lost during preparation');if(!gl.fenceSync)return;const sync=gl.fenceSync(gl.SYNC_GPU_COMMANDS_COMPLETE,0);if(!sync)return;gl.flush();const deadline=performance.now()+250;h.gpuDrainDeferred=false;try{let status;while((status=gl.clientWaitSync(sync,0,0))===gl.TIMEOUT_EXPIRED){if(gl.isContextLost())throw Error('WebGL context lost during preparation');if(performance.now()>deadline){h.gpuDrainDeferred=true;return;}await new Promise(r=>setTimeout(r,16));}if(status===gl.WAIT_FAILED)throw Error('GPU preparation fence failed');}finally{gl.deleteSync(sync);}}
async function covered(h,work){const curtain=document.createElement('div');curtain.className='hub-hall-loading';curtain.setAttribute('role','status');curtain.innerHTML='<i></i><span></span>';curtain.querySelector('span').textContent=h.api.tr('loadingWorld');
 // Escape cancellation still works, but the entry screen has no exit prompt.
 h.hud.appendChild(curtain);h.renderSuspended=(h.renderSuspended||0)+1;document.body.classList.add('hub-preparing');
 try{await new Promise(resolve=>{let done=false;const finish=()=>{if(done)return;done=true;clearTimeout(timer);resolve();},timer=setTimeout(finish,80);requestAnimationFrame(()=>requestAnimationFrame(finish));});return await work();}
 finally{try{await drainGpu(h);}finally{h.renderSuspended=Math.max(0,(h.renderSuspended||1)-1);if(!h.renderSuspended)document.body.classList.remove('hub-preparing');curtain.remove();}}
}
async function prepareMode(h,mode){const q=queue(h);if(q.api.ready(mode))return q.demand(mode);return covered(h,()=>q.demand(mode));}
async function cancelMode(h,mode){await queue(h).cancelDemand(mode);while(h.renderSuspended)await new Promise(r=>setTimeout(r,16));}
function build(h){if(h.concourse)return;const T=h.T,main={};for(const k of fields){main[k]=h[k];h[k]=[];}const before=new Set(h.scene.children),root=new T.Group(),dark=h.material('#26364c',{roughness:.57,metalness:.18}),trim=h.material('#dabf7a',{metalness:.25});
 root.name='games-garden';const art=window.ElementalConcourseArt.build(h);
 // First pair at the entrance; 2D owns the far end. Mirrored rooms stay readable.
 const configs=[['level',-1,8,'#e6bc6e'],['endless',1,8,'#65d9bd'],['surf',-1,-7,'#78d6ff'],['obby',1,-7,'#b2e6a1'],['soon',-1,-22,'#858b92'],['runner2d',1,-22,'#e99e85']];
 const placePortal=(mode,x,z,yaw,color)=>{const nodes=new Set(h.scene.children),si=h.solids.length,accent=h.material(color,{metalness:.22,roughness:.55});h.buildPortal(mode,0,color,dark,accent);const group=new T.Group();group.name='garden-portal-'+mode;for(const node of [...h.scene.children])if(!nodes.has(node)){h.scene.remove(node);node.position.z+=30;group.add(node);}window.ElementalConcourseArt.portal(h,group,h.portalPreviews[h.portalPreviews.length-1],color,accent);group.rotation.y=yaw;group.position.set(x,0,z);h.scene.add(group);
 const zone=h.zones.find(q=>q.id===mode),pos=new T.Vector3(zone.x,0,zone.z+30).applyAxisAngle(new T.Vector3(0,1,0),yaw);zone.x=x+pos.x;zone.z=z+pos.z;zone.entryTarget=new T.Vector3(x+Math.sin(yaw)*-1.65,2.1,z);zone.entryForward=new T.Vector3(-Math.sin(yaw),0,-Math.cos(yaw));zone.titleLabel.mesh.material.side=T.FrontSide;
 for(let i=si;i<h.solids.length;i++){const s=h.solids[i],p=new T.Vector3(s.x,0,s.z+30).applyAxisAngle(new T.Vector3(0,1,0),yaw),c=Math.abs(Math.cos(yaw)),n=Math.abs(Math.sin(yaw)),hx=s.hx,hz=s.hz;s.x=x+p.x;s.z=z+p.z;s.hx=hx*c+hz*n;s.hz=hx*n+hz*c;}return zone;
 };
 for(const [mode,side,z,color]of configs)placePortal(mode,side*14,z,side<0?Math.PI/2:-Math.PI/2,color);
 placePortal('troll',0,-28,0,'#ff62d5');
 const returnZone=placePortal('plaza',0,23,Math.PI,'#f3d899'),heading=h.text(h.api.tr('hubGames'),13,0,11.2,-27,'#f3d899',60);
 for(const node of [...h.scene.children])if(!before.has(node)){h.scene.remove(node);root.add(node);}h.scene.add(root);
 root.updateMatrixWorld(true);root.traverse(node=>{if(node.isMesh&&!node.isInstancedMesh&&node.material.isMeshStandardMaterial){node.receiveShadow=true;node.castShadow=node.getWorldPosition(new T.Vector3()).y>.5;}});
 root.visible=false;h.batchStaticArchitecture(root);const hall={root,heading,art,returnLabel:returnZone.titleLabel};for(const k of fields){hall[k]=h[k];h[k]=main[k];}h.concourse={main,hall};
 const b=document.createElement('button');b.id='hub-mode-back';b.textContent='↩ '+h.api.tr('surfLobby');b.hidden=true;b.style.cssText='position:absolute;left:24px;top:100px;pointer-events:auto;padding:12px 18px;border-radius:12px;background:#132938ed;color:#f1d790;border:1px solid #b9a76b;font:700 14px Rajdhani,system-ui;width:auto;min-width:160px;white-space:nowrap';b.onclick=()=>h.transition('plaza');h.hud.appendChild(b);h.concourse.back=b;
}
async function prepare(h){
 if(h.hallPreparing)return h.hallPreparing;
 const job=covered(h,async()=>{build(h);window.ElementalConcourseArt.atmosphere(h,true);try{const r=h.api.renderer(),hall=h.concourse.hall.root;if(!h.concourse.prepared){hall.visible=true;let compiling;try{compiling=window.ElementalGraphicsEngine.compileAsyncSafe(r,hall,h.camera,h.scene);}finally{hall.visible=false;}if(compiling)await compiling;
 const target=new h.T.WebGLRenderTarget(32,32),previous=r.getRenderTarget(),auto=r.autoClear,culling=[],visibility=[];hall.traverse(n=>{if(n.isMesh){culling.push([n,n.frustumCulled]);n.frustumCulled=false;}});for(const n of h.scene.children)if(n!==hall&&!n.isLight){visibility.push([n,n.visible]);n.visible=false;}hall.visible=true;try{r.setRenderTarget(target);r.autoClear=true;window.ElementalConcourseArt.draw(h,()=>r.render(h.scene,h.camera));}finally{hall.visible=false;for(const [n,v]of visibility)n.visible=v;for(const [n,v]of culling)n.frustumCulled=v;r.setRenderTarget(previous);r.autoClear=auto;target.dispose();}h.concourse.prepared=true;}
 await seed(h);
 // Warm the actual hall camera + composer path BEFORE revealing it. A tiny
 // render target alone does not warm display/HDR/post-process shader variants.
 const visibility=new Map(h.scene.children.map(n=>[n,n.visible])),cameraPosition=h.camera.position.clone(),cameraRotation=h.camera.quaternion.clone(),avatarPosition=h.avatar.position.clone(),wasHall=h.inConcourse,yaw=h.yaw,pitch=h.pitch,previous=r.getRenderTarget(),auto=r.autoClear;
 try{for(const n of h.scene.children)n.visible=n===hall||n===h.avatar||n===h.shadow||n.isLight;hall.visible=true;h.inConcourse=true;h.avatar.position.set(0,h.avatarHalfHeight,8);h.yaw=0;h.pitch=.34;h.updateCamera(1,true);h.ensureLobbyRenderer();r.setRenderTarget(null);r.autoClear=true;window.ElementalConcourseArt.draw(h,()=>h.composer.render(0));}
 finally{for(const [n,v]of visibility)n.visible=v;h.inConcourse=wasHall;h.yaw=yaw;h.pitch=pitch;h.avatar.position.copy(avatarPosition);h.camera.position.copy(cameraPosition);h.camera.quaternion.copy(cameraRotation);r.setRenderTarget(previous);r.autoClear=auto;}
 }finally{if(!h.inConcourse)window.ElementalConcourseArt.atmosphere(h,false);}
 });h.hallPreparing=job;try{await job;}finally{h.hallPreparing=null;}
}
function setArea(h,open){build(h);const a=h.concourse;if(open===!!h.inConcourse)return;h.inConcourse=open;h.resetAvatarJelly();h.clearMovement();h.zone=null;h.latched=null;h.prompt.hidden=true;h.hold=0;h.state='exploring';h.guideArrows.visible=h.guideOutline.visible=h.guideGoal.visible=false;
 if(h.modePreparation)h.modePreparation.enabled=false;
 if(open){a.visible=new Map();for(const node of h.scene.children)if(node!==a.hall.root&&node!==h.avatar&&node!==h.shadow&&node!==h.jellyTrail?.mesh&&!node.isLight){a.visible.set(node,node.visible);node.visible=false;}a.hall.root.visible=true;for(const k of fields)h[k]=a.hall[k];}
 else{a.hall.root.visible=false;for(const [node,v]of a.visible||[])node.visible=v;for(const k of fields)h[k]=a.main[k];}
 window.ElementalConcourseArt.atmosphere(h,open);if(!open)h.applyTheme(true);
 h.hallCameraProbe=null;document.body.classList.toggle('mode-concourse-active',open);a.back.hidden=!open;h.avatar.position.set(0,h.avatarHalfHeight,open?8:-22);h.avatar.visible=true;h.yaw=0;h.pitch=open?.34:.48;h.updateCamera(1,true);h.refresh(true);h.api.renderer().domElement.animate?.([{opacity:.2},{opacity:1}],{duration:350});h.queuePointerRestore();
 h.api.measure?.('hub-area',open?'games':'plaza','enter');
}
window.ElementalModeConcourse={build,setArea,prepare,prepareMode,cancelMode,updateWarm,seed,played,markPlayed,drainGpu,PreparationQueue};})();
