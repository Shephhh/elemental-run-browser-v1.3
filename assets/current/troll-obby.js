/* Isolated Troll Obby adapter: shared 120Hz swept-AABB, UI and host lifecycle. */
(function(g){'use strict';const C=g.ElementalObbyCourse;
// Slab ray vs authoritative boxes. No triangles, instance scans or allocations.
function cameraDistance(data,origin,dir,limit,insideMaze=false,insideCabin=false){let nearest=limit;for(const o of data.platforms){if(!o.active||o.cyberHidden||o.triggerOnly||o.walkSurface||o.trap==='hiddenKill'||o.hideReveal&&!(o.look==='mazeRoof'||insideMaze&&o.cameraMaze)&&!(insideCabin&&(o.look==='iceCabinRoof'||o.look==='iceCabinWall'))||o.look==='ghost'||o.look==='ghostBrown')continue;let enter=0,exit=nearest;
 for(let axis=0;axis<3;axis++){const p=axis===0?origin.x:axis===1?origin.y:origin.z,v=axis===0?dir.x:axis===1?dir.y:dir.z,lo=axis===0?o.x-o.w/2-.12:axis===1?o.y-o.h-.12:o.z-o.d/2-.12,hi=axis===0?o.x+o.w/2+.12:axis===1?o.y+.12:o.z+o.d/2+.12;
 if(Math.abs(v)<1e-9){if(p<lo||p>hi){exit=-1;break;}}else{const a=(lo-p)/v,b=(hi-p)/v;enter=Math.max(enter,Math.min(a,b));exit=Math.min(exit,Math.max(a,b));if(enter>exit)break;}}
 if(exit>=enter&&enter>.06)nearest=Math.min(nearest,enter);
 }return nearest;}
// Walking collision still uses real 19 cm risers. The avatar and the camera
// share a continuous, phase-aligned display height across their boundaries.
function stairDisplayY(p,support,prev,wasOnStairs=false,dt=C.DT){
 const stairs=p.grounded&&support?.walkSurface==='sector';
 if(!p.grounded||!stairs&&!wasOnStairs)return p.y;
 let target=p.y;
 if(stairs){
  const angle=Math.atan2(p.z-support.z,p.x-support.x)-support.arcStart;
  const phase=Math.max(-.035,Math.min(1.035,Math.atan2(Math.sin(angle),Math.cos(angle))/support.arcSpan));
  target+=.19*(.5-phase);
 }
 const from=Math.max(p.y-.16,Math.min(p.y+.13,prev??p.y));
 return from+(target-from)*(1-Math.exp(-23*dt));
}
function triggerTraps(data,p){
 const s=data.shift;
 if(s&&p.vz<-.35&&!p.grounded&&p.y>(s.y??8)+.24&&p.y<(s.y??8)+2.4&&Math.abs(p.x)<3.05){
  if(s.firstAt==null&&p.z<=s.firstZ&&p.z>s.firstZ-1.45)s.firstAt=data.time;
  if(s.lastAt==null&&p.z<=s.lastZ&&p.z>s.lastZ-2)s.lastAt=data.time;
 }
 for(const o of data.platforms){
 if(o.trap==='slideFake'&&o.triggerAt==null&&Math.abs(p.x-o.baseX-o.slideX/2)<o.w/2+o.slideX/2+.8&&Math.abs(p.z-o.z)<o.d/2+2.65&&p.y>o.y-.25&&p.y<o.y+3)o.triggerAt=data.time;
 if(o.trap==='approachFake'&&!o.consumed&&Math.abs(p.x-o.x)<o.w/2+1.2&&Math.abs(p.z-o.z)<o.d/2+2&&p.y>o.y-1&&p.y<o.y+4){if(o.triggerAt===null)o.triggerAt=data.time;o.revealed=true;}
 if(o.trap==='approachFake'&&o.triggerAt!==null&&data.time-o.triggerAt>.16){o.active=false;o.consumed=true;}
 if(o.trap==='hiddenKill'&&Math.abs(p.x-o.x)<o.w/2+C.R&&Math.abs(p.z-o.z)<o.d/2+C.R&&p.y<o.y&&p.y+C.H>o.y-o.h){p.dead=true;p.trapEvent='hiddenKill';o.revealed=true;}
 }}
const SPIKE_SLIDE=.16,SPIKE_HOLD=.54,SPIKE_RETURN=.24,SPIKE_CYCLE=SPIKE_SLIDE+SPIKE_HOLD+SPIKE_RETURN;
const STAIR_FADE_IN=.28,STAIR_FADE_OUT=.42,STAIR_FADE_STEPS=32;
function stairOpacity(o,time){
 if(o.touchAt==null)return 1;
 const remaining=o.touchAt+o.crumbleDelay-time;
 const k=Math.max(0,Math.min(1,(remaining+STAIR_FADE_OUT)/(STAIR_FADE_IN+STAIR_FADE_OUT)));
 return k*k*(3-2*k);
}
function spikeOffset(o,time){
 if(o.spikeAt==null)return 0;
 const age=Math.max(0,time-o.spikeAt);
 if(age<SPIKE_SLIDE)return o.slideX*(1-(1-age/SPIKE_SLIDE)**2);
 const t=Math.max(0,Math.min(1,(age-SPIKE_SLIDE-SPIKE_HOLD)/SPIKE_RETURN));
 return o.slideX*(1-t*t*(3-2*t));
}
function boardSpikes(data,p){
 const board=data.spikeBoard;
 if(!board||p.dead||p.z>board.zFront+4||p.z<board.zFront-board.rows*board.size-4||p.y<board.y-.02)return;
 // Remaining flight from y + vy*t - .5*g*t² = tile top. Read the
 // predicted square, but never hit a player who steers off it in the air.
 const height=p.y-board.y,t=p.grounded?0:p.vy<=0?(p.vy+Math.sqrt(Math.max(0,p.vy*p.vy+2*C.G*height)))/C.G:Infinity;
 if(t<0||t>.29)return;
 const x=p.x+p.vx*t,z=p.z+p.vz*t,col=Math.floor((x-board.xMin)/board.size),row=Math.floor((board.zFront-z)/board.size);
 if(col<0||col>=board.columns||row<0||row>=board.rows)return;
 const o=data.platforms[board.cells[row*board.columns+col]];
 if(!o.spikeHome&&!o.spikeBait)return; // Authored route: no blade crosses these squares.
 const source=o.spikeHome?o:data.platforms[o.spikeSource];
 if(o.spikeBait&&(source.spikeAt==null||data.time-source.spikeAt>=SPIKE_CYCLE))source.spikeAt=data.time;
 if(p.grounded&&height<.11){
  const center=source.x+spikeOffset(source,data.time);
  if(Math.abs(p.x-center)<board.size*.475+C.R&&Math.abs(p.z-source.z)<board.size*.475+C.R){
   p.dead=true;p.trapEvent='spikeTile';
  }else if(o.spikeBait){
   // A late steer onto bait starts the visible slide too. Prevent a held
   // jump from skipping the brief wind-up before the teeth reach the feet.
   p.buffer=p.coyote=0;p.stun=Math.max(p.stun,SPIKE_SLIDE+.01);
  }
 }
}
// Room clocks use simulation time. Retry restarts the pattern; pause never
// advances it. Geometry and effects read the same small state object.
function cyberZone(zone,p){return p.z<=zone.front&&p.z>=zone.back;}
function cyberCycle(phases,t){let total=0;for(const [duration] of phases)total+=duration;t%=total;for(const [duration,value] of phases){if(t<duration)return value;t-=duration;}return phases[0][1];}
function setPhaseExit(data,open){
 const exit=data.platforms[data.checkpoints[data.cyber.sequence.exit].platform];
 exit.active=open;exit.consumed=!open;
}
function resetCyber(race){
 if(!race.data.cyber)return;
 race.cyber={since:race.time,entered:false,signal:null,strike:null,feintAt:null,signalFeint:false,seqBank:0,seqAt:null,seqKeep:-1,seqFlash:false,seqDwell:0,seqResolved:false,wind:0,fanX:null,overhead:false};
 setPhaseExit(race.data,race.player.checkpoint!==1);
 for(const id of race.data.cyber.sequence.lanes){
  const lane=race.data.platforms[id];
  lane.cyberHidden=false;lane.cyberFlash=false;lane.cyberFeint=false;lane.cyberFade=1;lane.warning=false;lane.cyberBreakAt=null;
  // The first color is already established when the room is seen from CP0.
  lane.active=race.player.checkpoint>1||lane.cyberTile%2===0;lane.consumed=!lane.active;
 }
}
function cyberInput(race,p,input){
 const d=race.data,c=d.cyber,s=race.cyber,stage=race.player.checkpoint,time=race.time;
 if(!c)return input;
 let controls=input;
 s.signal=null;s.wind=0;s.overhead=false;
 if(stage===0&&cyberZone(c.signal,p)&&Math.abs(p.x)<c.signal.width/2+C.R&&p.y>=7.5){
  if(!s.entered){s.entered=true;s.since=time;}
  const span=c.signal.cycles.reduce((n,[a,b,r])=>n+a+b+r,0);
  let t=(time-s.since)%span;
  for(const [go,warn,stop] of c.signal.cycles){
   if(t<go+warn+stop){s.signal=t<go?'go':t<go+warn?'warn':'stop';break;}t-=go+warn+stop;
  }
  if(p.z<=c.signal.feintZ&&s.feintAt===null&&s.signal==='stop')s.feintAt=time;
  if(s.feintAt!==null){
   const [red,blink,tail]=c.signal.feint,age=time-s.feintAt;
   s.signalFeint=age<red+blink+tail;
   if(s.signalFeint)s.signal=age>=red&&age<red+blink?'go':'stop';
  }
  const strike=s.strike;
  if(s.signal==='stop'||strike&&!strike.hit){
   // Read intent BEFORE suppressing inputs; a tiny rest jitter isn't a foul.
   const moving=Math.abs(input.forward||0)+Math.abs(input.strafe||0)>.05||input.jumpHeld||p.buffer>0||p.vy>.65||Math.hypot(p.vx,p.vz)>.65;
   if(!strike&&moving){s.strike={at:time,x:p.x,y:p.y+1,z:p.z,side:-1,hit:false};}
   controls={yaw:input.yaw};
   if(!strike?.hit){p.vx=p.vz=p.windV=p.buffer=p.coyote=0;}
  }
 }
 if(s.strike&&!s.strike.hit){
  const f=s.strike;
  if(time-f.at>=.24){
   f.hit=true;p.vx=-f.side*23;p.vy=9.5;p.vz=0;p.stun=1.25;p.grounded=false;p.support=-1;p.coyote=p.buffer=p.windV=0;p.hit=true;p.trapEvent='cyberFist';
   controls={yaw:input.yaw};
  }
 }
 const seq=c.sequence;
 if(stage===1){
  const elapsed=time-s.since,bank=Math.floor(elapsed/seq.period)%2,age=elapsed%seq.period;
  const support=d.platforms[p.support];
  // Position arms the trick on either bank, independent of the global beat.
  if(s.seqAt===null&&p.z<=seq.commitZ&&p.grounded&&support?.cyberLane){
   s.seqAt=time;s.seqKeep=support.id;s.seqTrapBank=1-support.cyberTile%2;
  }
  s.seqBank=bank;
  const trapAge=s.seqAt===null?-1:time-s.seqAt,warningTime=seq.trapWarning??.62;
  const feintAge=trapAge-warningTime;
  if(s.seqAt!==null&&!s.seqResolved){
   const waiting=feintAge>=seq.flashUntil&&p.grounded&&p.support===s.seqKeep&&Math.hypot(p.vx,p.vz)<=1.1;
   s.seqDwell=waiting?s.seqDwell+C.DT:0;
   if(feintAge>=seq.restore&&s.seqDwell>=seq.standTime)s.seqResolved=true;
  }
  const trapLive=s.seqAt!==null&&!s.seqResolved;
  s.seqFlash=trapLive&&feintAge>=seq.flashFrom&&feintAge<seq.flashUntil;
  setPhaseExit(d,s.seqResolved);
  for(const id of seq.lanes){
   const o=d.platforms[id],pink=o.cyberTile%2,arrival=pink===bank;
   const wasVisible=o.active&&!o.cyberHidden||!!o.cyberFlash,wasFeint=!!o.cyberFeint;
   o.cyberHidden=false;o.cyberFlash=false;o.cyberFeint=false;o.cyberFade=1;
   if(trapLive&&feintAge>=0){
    // The occupied lane only PRETENDS to break: retain its original opaque
    // mesh and support; the reusable fragment pool chips away at its edges.
    o.active=id===s.seqKeep;o.cyberFeint=o.active;
    o.cyberFlash=s.seqFlash&&pink===s.seqTrapBank;
    o.warning=false;
   }else{
    o.active=s.seqResolved||arrival||elapsed>=seq.period&&age<seq.overlap;
    o.warning=!s.seqResolved&&(arrival&&age>seq.period-seq.fade||!arrival&&elapsed>=seq.period&&age<seq.overlap);
    // The end trick must warn on the exact support before the feint; retain
    // that support through any normal bank transition during this lead-in.
    if(trapLive){if(id===s.seqKeep)o.active=true;if(o.active)o.warning=true;}
    if(o.warning)o.cyberFade=.6;
   }
   const visible=o.active&&!o.cyberHidden||!!o.cyberFlash;
   if(wasVisible&&!visible||o.cyberFeint&&!wasFeint)o.cyberBreakAt=time;
   else if(visible&&!wasVisible||wasFeint&&!o.cyberFeint)o.cyberBreakAt=null;
   o.consumed=!o.active;
  }
 }else for(const id of seq.lanes){const o=d.platforms[id];o.cyberHidden=false;o.cyberFlash=false;o.cyberFeint=false;o.cyberFade=1;o.warning=false;o.cyberBreakAt=null;}
 if(stage===2&&cyberZone(c.wind,p)&&Math.abs(p.x)<c.wind.width/2&&p.y>6&&p.y<12){
  const requested=cyberCycle(c.wind.phases,time-s.since),target=-Math.sign(requested)*4.65;
  if(s.fanX===null)s.fanX=target;
  s.fanX+=Math.max(-21*C.DT,Math.min(21*C.DT,target-s.fanX));
  s.wind=Math.sign(s.fanX)===Math.sign(target)?requested*Math.min(1,Math.abs(s.fanX)/3.65):0;
  controls={...controls,cyberWind:s.wind};
 }else s.fanX=null;
 if(stage===4&&cyberZone(c.overhead,p)){s.overhead=true;controls={...controls,yaw:0};}
 return controls;
}
class TrollRace{
 constructor(data){this.data=data;this.time=this.elapsed=0;this.countdown=3;this.started=this.over=false;this.intro={remaining:0,time:0};this.chase={enabled:false};this.failure=null;
  if(data.shift)Object.assign(data.shift,{firstAt:null,lastAt:null,offset:0});
  for(const o of data.platforms){o.consumed=false;o.revealed=false;o.revealUntil=0;o.triggerAt=null;if(o.type==='crumble')o.touchAt=null;if(o.spikeHome)o.spikeAt=null;}C.pose(data,0);
  this.player={p:C.player(data.checkpoints[0]),checkpoint:0,finished:false,falls:0,respawn:0};resetCyber(this);
 }
 respawn(r=this.player){const stage=r.checkpoint,d=this.data;
  if(d.shift&&d.modules[stage]?.shift===d.shift)Object.assign(d.shift,{firstAt:null,lastAt:null,offset:0});
  for(const o of d.platforms)if(o.stage===stage){o.consumed=false;o.active=true;o.triggerAt=null;if(o.trap==='slideFake'){o.x=o.baseX;o.dx=0;}if(o.shiftGroup){o.z=o.baseZ;o.dz=0;}if(o.type==='crumble')o.touchAt=null;if(o.spikeHome)o.spikeAt=null;}r.p=C.player(d.checkpoints[stage]);r.respawn=0;resetCyber(this);}
 progress(){const r=this.player;if(r.finished)return 1;const a=this.data.checkpoints[r.checkpoint].distance,b=this.data.checkpoints[r.checkpoint+1].distance;return Math.min(.999,Math.max(a,Math.min(b,-r.p.z))/this.data.length);}
 step(input){if(this.over)return;this.time+=C.DT;C.pose(this.data,this.time);if(this.countdown>0){this.countdown=Math.max(0,this.countdown-C.DT);if(!this.countdown)this.started=true;return;}this.elapsed+=C.DT;const r=this.player,p=r.p;
  if(r.respawn>0){r.respawn-=C.DT;p.vy-=C.G*C.DT;p.y+=p.vy*C.DT;if(r.respawn<=0)this.respawn();return;}
  triggerTraps(this.data,p);C.step(p,cyberInput(this,p,input),this.data);boardSpikes(this.data,p);
  // Solid collision handles normal contact; overlap handles spawn/edge contact too.
  for(const o of this.data.platforms)if(o.trap==='gift'&&Math.abs(p.x-o.x)<o.w/2+C.R&&Math.abs(p.z-o.z)<o.d/2+C.R&&p.y<o.y&&p.y+C.H>o.y-o.h){p.dead=true;p.trapEvent='gift';}
  if(p.dead||p.y<this.data.fallY||Math.abs(p.x)>this.data.bounds.x||p.z>this.data.bounds.maxZ||p.z<this.data.bounds.minZ){r.falls++;if(p.trapEvent==='gift'||p.trapEvent==='hiddenKill'||p.trapEvent==='boulder'){this.respawn();return;}r.respawn=.65;p.dead=true;return;}
  const cp=this.data.checkpoints[r.checkpoint+1];if(cp&&this.data.platforms[cp.platform]?.active&&Math.abs(p.x-cp.x)<cp.w/2&&Math.abs(p.z-cp.z)<cp.d/2&&p.y>=cp.y-.1&&p.y<cp.y+3){r.checkpoint++;resetCyber(this);if(r.checkpoint===this.data.checkpoints.length-1){r.finished=true;this.over=true;}}
 }
 get qualified(){return this.player.finished;}
}
class TrollRun extends g.ElementalObbyRun{
 createUI(){
  super.createUI();
  const status=this.cyberStatus=document.createElement('div');status.className='troll-cyber-status';status.setAttribute('role','status');status.hidden=true;this.ui.appendChild(status);
  this.deathBurst=document.createElement('div');
  this.deathBurst.className='troll-death-burst';
  this.deathBurst.setAttribute('aria-hidden','true');
  this.ui.appendChild(this.deathBurst);
  this.deathStamps=[];
  if(!this.api.mobile)return;
  const warning=this.mazeTouchWarning=document.createElement('div');
  warning.className='troll-maze-warning';warning.textContent='WRONG WAY';
  warning.setAttribute('role','status');warning.hidden=true;this.ui.appendChild(warning);
 }
 migrateSequence(){this.roundCount=3;this.saved.completed||={};this.saved.unlocked=1;while(this.saved.unlocked<3&&this.saved.completed[this.saved.unlocked])this.saved.unlocked++;this.level=Math.max(1,Math.min(this.saved.unlocked,this.level));this.saved.level=this.level;this.save();}
 selection(){return{level:this.level,unlocked:this.saved.unlocked,name:this.tr('trollObby'),completed:!!this.saved.completed[this.level]};}
 async build(){const T=this.T,serial=++this.serial;this.clearScene();const own=r=>this.own(r);this.data=C.trollCourse(this.level);const d=this.data;
  this.scene=new T.Scene();this.scene.background=new T.Color(d.theme.sky);this.scene.fog=new T.Fog(d.theme.sky,70,185);this.scene.add(new T.HemisphereLight(0xdaf1ff,0x344047,1.05));const sun=new T.DirectionalLight(0xffffff,1.8);sun.position.set(-18,35,12);this.scene.add(sun);const rim=new T.DirectionalLight(0x9acfe8,.5);rim.position.set(28,14,-35);this.scene.add(rim);this.camera=new T.PerspectiveCamera(60,1,.08,260);
  this.dummy=new T.Object3D();this.aim=new T.Vector3();this.desired=new T.Vector3();this.rayDirection=new T.Vector3();this.cyberAim=d.cyber?new T.Vector3():null;this.cameraReady=false;this.fallAnchor=null;
  const cube=own(g.ElementalCubeAvatar.rounded(T,1,1,1,.065,3));const colors=[d.theme.color,0x51898d,0xd9b568,0x717b98];
  const mat=(color,glow=0)=>own(new T.MeshStandardMaterial({color,roughness:.4,metalness:.12,emissive:color,emissiveIntensity:glow}));
  const white=mat(0xe5dcf0),dark=mat(0x314552),neon=colors.map(c=>mat(c,.1));white.color.setHex(d.theme.phase===0?0x6b8997:d.theme.phase===5?0xd0e0e8:0xc5d9c4);white.roughness=d.theme.phase===5?.48:d.theme.phase===0?.62:.82;white.metalness=d.theme.phase===0?.3:.025;
  const mesh=(geo,m,x,y,z,sx=1,sy=1,sz=1,parent=this.scene)=>{const obj=new T.Mesh(geo,m);obj.position.set(x,y,z);obj.scale.set(sx,sy,sz);parent.add(obj);return obj;};
  this.tiles=[];this.checkRings=[];this.hazardMeshes=[];
  const specials=new Map(),special=look=>{if(!specials.has(look))specials.set(look,this.cyberMaterial(look)||this.trollCourseMaterial(look));return specials.get(look);};
  const ghostMat=color=>own(new T.MeshStandardMaterial({color,emissive:color,emissiveIntensity:.45,transparent:true,opacity:.01,depthWrite:false,roughness:.56}));
  const ghost=ghostMat(0xf1de8a),ghostBrown=ghostMat(0x986044),danger=mat(0xbe241b,1.7);
  const stairMats=d.walkSurfaces?.some(o=>o.look==='spiralStep')
   ?Array.from({length:STAIR_FADE_STEPS+1},(_,i)=>{
    if(i===0)return null;
    const solid=special('spiralStep');if(i===STAIR_FADE_STEPS)return solid;
    const faded=own(solid.clone());
    faded.setValues({transparent:true,depthWrite:false,opacity:i/STAIR_FADE_STEPS});return faded;
   }):null;
  // Emissive border remains readable without enabling global bloom on low/mobile.
  if(d.platforms.some(o=>o.checker&&o.look==='danger')){
   const size=32,pixels=new Uint8Array(size*size*4);
   for(let y=0;y<size;y++)for(let x=0;x<size;x++){const edge=Math.min(x,y,size-1-x,size-1-y),v=Math.round(115+140*Math.max(0,1-edge/5)**2),i=(y*size+x)*4;pixels[i]=pixels[i+1]=pixels[i+2]=v;pixels[i+3]=255;}
   const mask=own(new T.DataTexture(pixels,size,size));mask.magFilter=mask.minFilter=T.LinearFilter;mask.needsUpdate=true;danger.emissiveMap=mask;
  }
  const ribbons=own(new T.BoxGeometry(1,1,1));const geometryCache=new Map(),panel=(w,h,d,flush=false)=>{const key=[w,h,d,flush].join('/');if(!geometryCache.has(key))geometryCache.set(key,own(flush?new T.BoxGeometry(w,h,d):g.ElementalCubeAvatar.rounded(T,w,h,d,.12,3)));return geometryCache.get(key);};
  const gradeBox=(w,h,d,grade,topGrade=grade)=>{
   if(!grade&&!topGrade)return panel(w,h,d,true);
   const key='grade/'+[w,h,d,grade,topGrade].join('/');
   if(!geometryCache.has(key)){
    const geo=new T.BoxGeometry(w,h,d),p=geo.attributes.position;
    for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+(p.getY(i)>0?topGrade:grade)*p.getZ(i));
    geo.computeVertexNormals();geometryCache.set(key,own(geo));
   }
   return geometryCache.get(key);
  };
  const wedge=(inner,outer,span,h)=>{
   const key='wedge/'+[inner,outer,span,h].join('/');
   if(!geometryCache.has(key)){
    const shape=new T.Shape();shape.moveTo(outer,0);
    for(let i=1;i<=4;i++){const a=span*i/4;shape.lineTo(outer*Math.cos(a),outer*Math.sin(a));}
    for(let i=4;i>=0;i--){const a=span*i/4;shape.lineTo(inner*Math.cos(a),inner*Math.sin(a));}
    shape.closePath();
    const geo=new T.ExtrudeGeometry(shape,{depth:h,bevelEnabled:false}).rotateX(Math.PI/2).translate(0,h/2,0);
    const p=geo.attributes.position,n=geo.attributes.normal,colors=new Float32Array(p.count*3);
    for(let i=0;i<p.count;i++){
     const r=Math.hypot(p.getX(i),p.getZ(i)),edge=r<inner+.18||r>outer-.2,top=n.getY(i)>.7,k=top?(edge?.83:.96):.61;
     colors[i*3]=k*(top?.76:.73);colors[i*3+1]=k*(top?.91:.59);colors[i*3+2]=k*(top?1:.37);
    }
    geo.setAttribute('color',new T.BufferAttribute(colors,3));geometryCache.set(key,own(geo));
   }
   return geometryCache.get(key);
  };
  for(const o of d.platforms){
   // No draw calls/materials for permanently invisible collision-only walls.
   if(o.look==='closedCabin'||o.look==='mazeExitBlock')continue;
   const group=new T.Group(),faint=o.look==='ghost'||o.look==='ghostBrown',fixedWall=['mazeGlass','mazeRoof','mazeExterior','iceBank','iceCabinWall','iceCabinRoof'].includes(o.look),custom=special(o.look);
   group.userData.trollDynamic=(!fixedWall&&['fake','approachFake','wall','shoveWall','hiddenKill','slideFake'].includes(o.trap))||o.type==='crumble'||o.type==='mover'||faint||!!o.shiftGroup||o.cyberTile!=null||o.cyberPair!=null||o.cyberExit;
   group.userData.fixedWall=fixedWall;
   const displayH=o.displayH??(o.displayY!=null?.88:o.h);
   group.position.set(o.x,o.displayY!=null?o.displayY+displayH*.5:o.y-o.h/2,o.z);this.scene.add(group);const color=o.look==='danger'?danger:neon[(o.stage||0)%4];
   const slope=o.displayGrade||o.grade||0;
   const geo=o.walkSurface==='sector'?wedge(o.inner,o.outer,o.arcSpan,o.h):slope?gradeBox(o.w,displayH,o.d,slope,o.displayTopFlat?0:slope):panel(o.w,displayH,o.d,o.checker||fixedWall||o.look==='neonKill');
   if(o.walkSurface==='sector')group.rotation.y=-o.arcStart;
   const body=mesh(geo,custom||((o.trap==='wall'||o.trap==='shoveWall'||o.trap==='hiddenKill')?own(new T.MeshStandardMaterial({color:0x67ebff,transparent:true,opacity:0,depthWrite:false,roughness:.3})):faint?(o.look==='ghostBrown'?ghostBrown:ghost):color),0,0,0,1,1,1,group);
   if(o.look==='neonKill')mesh(cube,custom,0,o.h/2-.13,0,o.w+.10,.12,o.d+.04,group);
   if(o.look==='iceBank'||o.look==='iceCabinWall')mesh(gradeBox(o.w+.08,.12,Math.max(.1,o.d-.035),o.displayTopFlat?0:slope),white,0,displayH/2-.11,0,1,1,1,group);
   if(o.look==='iceCabinRoof'){
    for(const side of [-1,1])mesh(cube,white,side*(o.w/2-.11),o.h/2+.025,0,.20,.075,o.d-.16,group);
    mesh(cube,neon[2],-Math.sign(o.x)*(o.w/2-.14),.017,0,.29,.31,o.d-.12,group);
   }
   if(o.look==='mazeExterior'){
    mesh(cube,white,0,displayH/2-.19,0,o.w+.14,.21,o.d+.08,group);
    const long=o.d>o.w,span=long?o.d:o.w,count=Math.ceil(span/5);
    for(let i=0;i<count;i++){
     const t=-span/2+(i+.5)*span/count;
     mesh(cube,dark,long?0:t,0,long?t:0,long?o.w+.12:.29,displayH-.25,long?.29:o.d+.12,group);
    }
   }
   if(o.grade&&o.look==='iceTread'){
    for(const x of [-1,1])mesh(gradeBox(.12,.025,o.d-.04,slope),white,x*(o.w/2-.22),o.h/2+.013,0,1,1,1,group);
    for(let z=-(o.d/2)+4;z<o.d/2-2;z+=5)
     mesh(cube,dark,0,o.h/2+.02+slope*z,z,.16,.027,1.35,group).rotation.x=-Math.atan(slope);
   }
   if(o.look==='iceCabin'){
    const rim=Math.sign(o.x)*(o.w/2-.26);
    for(const end of [-1,1])mesh(cube,dark,rim,o.h/2+1.44+slope*end*(o.d/2-.3),end*(o.d/2-.3),.27,2.85,.28,group);
    mesh(gradeBox(.84,.29,o.d-.08,slope),neon[2],rim,o.h/2+2.88,0,1,1,1,group);
   }
   if(!['wall','shoveWall','hiddenKill'].includes(o.trap)){
    if(d.cyber&&o.look?.startsWith('cyber')){
     const lethal=o.trap==='gift',accent=special(lethal?'cyberTrimHot':o.look==='cyberSequencePink'?'cyberTrimViolet':o.look==='cyberWindBar'?'cyberTrimAmber':'cyberTrimBlue');
     if(o.look!=='cyberSignal')for(const side of [-1,1])mesh(cube,accent,side*(o.w/2-.085),o.h/2+.014,0,.15,.038,o.d-.16,group);
     if(o.cyberTile!=null||lethal||o.look==='cyberWindBar')for(const side of [-1,1])mesh(cube,accent,0,o.h/2+.019,side*(o.d/2-.09),Math.max(.07,o.w-.27),.043,.13,group);
     if(o.look==='cyberCrystal'||o.look==='cyberSignalColumn'){
      const darkCore=special('cyberArmor');
      for(const side of [-1,1]){
       mesh(cube,darkCore,side*o.w*.42,-displayH*.15,o.d/2-.09,o.w*.14,displayH*.64,.24,group);
       mesh(cube,accent,side*o.w*.25,.02,o.d/2+.019,.08,displayH*.70,.085,group);
       mesh(cube,accent,side*(o.w/2-.095),displayH*.21,0,.16,.13,o.d*.82,group);
      }
     }
     if(o.look==='cyberLethalStrip')for(let z=-o.d/2+.36;z<o.d/2;z+=.72)mesh(cube,white,0,o.h/2+.046,z,o.w*.81,.029,.19,group).rotation.y=.42;
    }else if(!faint&&!o.checker&&o.look!=='neonKill'){
    mesh(panel(o.w-.18,.18,o.d-.18),white,0,o.h/2+.02,0,1,1,1,group);
    for(const side of [-1,1])mesh(cube,dark,side*(o.w/2-.13),o.h/2+.13,0,.08,.06,o.d-.35,group);
    if(o.trap==='gift'&&o.look!=='plain'){mesh(ribbons,neon[2],0,0,0,.22,o.h+.02,o.d+.03,group);mesh(ribbons,neon[2],0,0,0,o.w+.03,o.h+.02,.22,group);mesh(own(new T.TorusGeometry(.38,.09,6,14)),neon[2],0,o.h/2+.2,0,1,1,1,group);}
    if(o.trap==='reversePad'&&o.look!=='plainPad'){const pad=mesh(own(new T.CylinderGeometry(1.15,1.3,.22,20)),neon[2],0,o.h/2+.12,0,1,1,1,group);mesh(own(new T.TorusGeometry(.8,.09,6,24)),white,0,o.h/2+.25,0,1,1,1,group).rotation.x=-Math.PI/2;pad.userData.pad=true;}
    }
    this.solids.push(body);
   }
   this.tiles.push({o,group,body,fade:o.look==='spiralStep'?stairMats:null});
  }
  this.spikeMesh=this.spikeBases=null;this.spikeTiles=[];
  if(d.spikeBoard){
   const b=d.spikeBoard,teeth=5;this.spikeTiles=d.platforms.filter(o=>o.spikeHome);
   this.spikePositions=new Float64Array(this.spikeTiles.length).fill(NaN);
   const batch=this.spikeMesh=own(new T.InstancedMesh(own(new T.ConeGeometry(1,1,5)),special('spike'),this.spikeTiles.length*teeth*teeth));
   batch.name='troll-spikes';batch.instanceMatrix.setUsage(T.DynamicDrawUsage);batch.frustumCulled=false;this.scene.add(batch);
   const bases=this.spikeBases=own(new T.InstancedMesh(cube,mat(0x8e242b,.17),this.spikeTiles.length));
   bases.name='troll-spike-plates';bases.instanceMatrix.setUsage(T.DynamicDrawUsage);bases.frustumCulled=false;this.scene.add(bases);
   const lines=[],zEnd=b.zFront-b.rows*b.size,xEnd=b.xMin+b.columns*b.size;
   const y=b.y+.014;
   for(let i=0;i<=b.columns;i++){const x=b.xMin+i*b.size;lines.push(x,y,b.zFront,x,y,zEnd);}
   for(let i=0;i<=b.rows;i++){const z=b.zFront-i*b.size;lines.push(b.xMin,y,z,xEnd,y,z);}
   const grid=own(new T.BufferGeometry());grid.setAttribute('position',new T.Float32BufferAttribute(lines,3));
   this.scene.add(new T.LineSegments(grid,own(new T.LineBasicMaterial({color:0x6a8b9b}))));
  }
  const spiral=d.walkSurfaces?.filter(o=>o.walkSurface==='sector');
  if(spiral?.length){
   const center=spiral[0],top=spiral.at(-1).y;
   mesh(own(new T.CylinderGeometry(.65,.9,top,12)),dark,center.x,top/2,center.z);
   const collar=own(new T.CylinderGeometry(.79,.79,.18,12));
   for(let i=0;i<spiral.length;i+=8){
    const o=spiral[i],angle=o.arcStart+o.arcSpan*.5,reach=o.inner+1.1;
    mesh(collar,white,center.x,o.y-.48,center.z);
    mesh(cube,dark,center.x+Math.cos(angle)*reach*.5,o.y-.55,center.z+Math.sin(angle)*reach*.5,reach,.39,.36).rotation.y=-angle;
   }
  }
  this.maze=d.modules.find(m=>m.maze)?.maze;this.mazeLight=this.mazeWrongWay=null;
  this.cabinRoofs=d.platforms.filter(o=>o.look==='iceCabinRoof');
  if(this.maze){
   const m=this.maze,span=m.a-m.b,mid=(m.a+m.b)/2,lamp=mat(0x8beeff,2.25);
   mesh(cube,dark,0,7.34,mid,m.w-.04,.62,span-.03); // closed base under the transparent floor
   for(let z=m.a-2.4;z>m.b;z-=6.2){
    mesh(cube,dark,0,13.32,z,m.w,.24,.29);
    for(const x of [-m.w/3,0,m.w/3]){
     mesh(cube,dark,x,13.08,z,2.65,.23,.71);
     mesh(cube,lamp,x,12.94,z,2.48,.083,.54);
    }
    for(const x of [-1,1])mesh(cube,lamp,x*(m.w/2-.61),8.04,z,.32,.055,2.5);
   }
   // Framed, illuminated "exit", with no visible obstacle across the opening.
   for(const x of [-2.28,2.28])mesh(cube,lamp,x,10.5,m.b+.57,.12,4.8,.15);
   mesh(cube,lamp,0,12.86,m.b+.57,4.62,.14,.17);
   const wrong=this.mazeWrongWay=this.courseSign('WRONG WAY',4.22,.92,true);
   // Put the message just under the lintel, above the runner and their hat.
   wrong.position.set(0,12.33,m.b+.82);wrong.visible=false;this.scene.add(wrong);
   this.mazeLight=new T.PointLight(0x8de5ff,0,15,2);this.scene.add(this.mazeLight);
  }
  for(const {sign} of d.modules)if(sign){const node=this.courseSign(this.tr(sign.key),5.6,1.4);node.position.set(sign.x,sign.y,sign.z);this.scene.add(node);}
  for(const hazard of d.hazards)if(hazard.look==='trollBoulder'){
   const radius=hazard.radius,geo=own(new T.SphereGeometry(radius,this.api.mobile?28:44,this.api.mobile?18:28));
   const v=geo.attributes.position,n=geo.attributes.normal,colors=new Float32Array(v.count*3);
   for(let i=0;i<v.count;i++){
    const x=v.getX(i)/radius,y=v.getY(i)/radius,z=v.getZ(i)/radius;
    const wave=x*5.4+y*4.2-z*3.1,bands=x*6.3-y*2.7+z*4.8;
    const k=.986+.009*Math.sin(wave)+.005*Math.cos(bands);
    v.setXYZ(i,x*radius*k,y*radius*k,z*radius*k);
    // Radial surface gradient: smooth normals on the UV seam and both poles.
    const a=.009*Math.cos(wave),b=-.005*Math.sin(bands);
    const gx=5.4*a+6.3*b,gy=4.2*a-2.7*b,gz=-3.1*a+4.8*b,f=k+x*gx+y*gy+z*gz;
    const nx=x*f-gx,ny=y*f-gy,nz=z*f-gz,len=Math.hypot(nx,ny,nz);
    n.setXYZ(i,nx/len,ny/len,nz/len);
    const frost=Math.max(0,Math.min(1,.43+.19*Math.sin(x*3.7+z*3.1)+.13*Math.cos(bands)+y*.38));
    colors[i*3]=.50+.44*frost;colors[i*3+1]=.61+.36*frost;colors[i*3+2]=.73+.27*frost;
   }
   geo.setAttribute('color',new T.BufferAttribute(colors,3));
   geo.computeBoundingSphere();
   const rock=mesh(geo,special('boulder'),hazard.x,hazard.y,hazard.z);rock.name='troll-rolling-boulder';this.hazardMeshes.push({hazard,rock});
  }
  for(const cp of d.checkpoints){const rise=cp.y-8.004;for(const side of [-1,1])for(const end of [-1,1])mesh(cube,dark,cp.x+side*Math.max(.65,cp.w/2-.6),2.9+rise/2,cp.z+end*Math.max(.8,cp.d/2-.7),.5,10+rise,.5);const ring=mesh(own(new T.TorusGeometry(1.7,.09,6,28)),mat(cp.index?0xffd47f:0x87f0bb,.4),cp.x,cp.y+.06,cp.z);ring.rotation.x=-Math.PI/2;this.checkRings.push(ring);}
  // The same opaque relief floor and complete compound biome models as Party Run.
  // Banners, speaker stacks and party hats share geometry/materials.
  if(d.cyber)this.buildCyberArt(cube,mesh,mat,own);
  else{
   const hat=own(new T.ConeGeometry(1.25,2.8,12));for(const cp of d.checkpoints){const rise=cp.y-8.004;for(const side of [-1,1]){mesh(cube,dark,side*8.5,10+rise,cp.z,1.4,4,1.2);mesh(hat,neon[cp.index%4],side*8.5,13.4+rise,cp.z);for(let j=0;j<2;j++){const speaker=mesh(own(new T.CylinderGeometry(.42,.42,.08,14)),neon[(j+cp.index)%4],side*8.5,9+j*1.4+rise,cp.z+.65);speaker.rotation.x=Math.PI/2;}}}
  }
  const finish=d.finish,gateHalf=Math.max(1.7,Math.min(7.2,finish.w*.5)),gateRise=finish.y-8.004;mesh(cube,neon[2],finish.x,12.8+gateRise,finish.z-2,gateHalf*2+.6,.5,.6);for(const side of [-1,1])mesh(cube,neon[2],finish.x+side*gateHalf,10.3+gateRise,finish.z-2,.5,5,.6);const star=this.label('★',2.5,0xfff598);star.position.set(finish.x,12.1+gateRise,finish.z-2);this.scene.add(star);
  const avatar=this.api.hubAvatar(own);this.avatar=avatar.root;this.body=avatar.body;this.avatarMotion=avatar.motion;this.jellyFace=avatar.face;this.scene.add(this.avatar);
  this.jellyReduced ||= g.matchMedia('(prefers-reduced-motion: reduce)');
  this.jellyTrail=g.ElementalCubeAvatar.createJellyTrail(T,own,this.scene,this.api.mobile);
  this.jellySurface=(x,z)=>g.ElementalCubeAvatar.jellyPlatformHeight(this.jellySupport,x,z);
  const shadowCanvas=document.createElement('canvas');shadowCanvas.width=shadowCanvas.height=64;const ctx=shadowCanvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,3,32,32,31);gradient.addColorStop(0,'rgba(4,17,24,.4)');gradient.addColorStop(1,'rgba(4,17,24,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
  const shadowMat=own(new T.MeshBasicMaterial({map:own(new T.CanvasTexture(shadowCanvas)),transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
  this.avatarShadow=mesh(own(new T.PlaneGeometry(3.3,3.3)),shadowMat,0,8.14,0);this.avatarShadow.rotation.x=-Math.PI/2;this.avatarShadow.renderOrder=2;
  if(this.hazardMeshes.length){
   const geo=own(new T.PlaneGeometry(5.8,5.8)),treads=d.platforms.filter(o=>o.look==='iceTread'&&o.grade);
   for(const item of this.hazardMeshes){item.shadow=mesh(geo,shadowMat,0,0,0);item.shadow.rotation.x=-Math.PI/2;item.treads=treads;}
  }
  await this.buildEnvironment(own);if(serial!==this.serial)return;this.batchStatic();this.venom.replaceChildren();this.ui.querySelector('.obby-reticle').hidden=true;this.ui.querySelector('[data-dive]').hidden=true;this.restart();this.render(0,false,true);
  const r=this.api.renderer();if(r.compileAsync)await g.ElementalGraphicsEngine.compileAsyncSafe(r,this.scene,this.camera);if(serial!==this.serial)return;this.warmTarget=own(new T.WebGLRenderTarget(64,64));this.render(0,true);this.prepared=true;
 }
 cyberMaterial(look){
  const palette={cyberSignal:[0x34496b,0x3270c1],cyberSequence:[0x3673b8,0x3fa9ef],cyberSequencePink:[0x9b3e81,0xfa55ae],cyberPair:[0x486481,0x73a0e4],cyberArmor:[0x322941,0x523045],cyberSignalBar:[0xae1b39,0xff254b],cyberSignalColumn:[0x801732,0xf22749],cyberLethalStrip:[0xa31332,0xfa255c],cyberWind:[0x294e66,0x41b9d8],cyberOverhead:[0x465782,0x8caaff],cyberPivot:[0x56538e,0xa798ff],cyberIce:[0xbdefff,0x5fb7dd],cyberHurdle:[0x573e65,0x6850aa],cyberWindBar:[0x52606a,0xd98b52],cyberCrystal:[0x511c4a,0xb8124a],cyberLaser:[0x98174d,0xf62a5c],cyberTrimBlue:[0x78efff,0x45c9ff],cyberTrimViolet:[0xffa6e4,0xff57af],cyberTrimAmber:[0xffd38a,0xf39d51],cyberTrimHot:[0xff6481,0xff1649]};
  const colors=palette[look];if(!colors||!this.data.cyber)return null;const ice=look==='cyberIce',trim=look.startsWith('cyberTrim');
  const T=this.T;let map=null;
  if(look.startsWith('cyberSequence')){
   if(!this.cyberLanePattern){
    const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;const ctx=canvas.getContext('2d');
    ctx.fillStyle='#edf3ff';ctx.fillRect(0,0,128,256);
    ctx.fillStyle='#bacbeb38';ctx.fillRect(13,0,102,256);
    ctx.strokeStyle='#a3bad260';ctx.lineWidth=1.4;
    for(let i=0;i<4;i++){
     const y=28+i*64;
     ctx.beginPath();ctx.moveTo(56,y);ctx.lineTo(64,y-8);ctx.lineTo(72,y);ctx.lineTo(64,y+8);ctx.closePath();ctx.stroke();
     ctx.beginPath();ctx.moveTo(16,y);ctx.lineTo(34,y);ctx.moveTo(94,y);ctx.lineTo(112,y);ctx.stroke();
    }
    this.cyberLanePattern=this.own(new T.CanvasTexture(canvas));this.cyberLanePattern.colorSpace=T.SRGBColorSpace;
    this.cyberLanePattern.wrapT=T.RepeatWrapping;this.cyberLanePattern.repeat.y=5;
   }
   map=this.cyberLanePattern;
  }
  if(ice){
   // Frost and refracted facets over an opaque slab, matching the runner's
   // pale ice palette without its transparent road overlay.
   const canvas=document.createElement('canvas');canvas.width=128;canvas.height=256;
   const ctx=canvas.getContext('2d'),light=ctx.createLinearGradient(0,0,128,256);
   light.addColorStop(0,'#c2e3f6');light.addColorStop(.54,'#7eb3da');light.addColorStop(1,'#e6f6ff');
   ctx.fillStyle=light;ctx.fillRect(0,0,128,256);
   for(let i=0;i<12;i++){
    const y=(i*53)%258,x=(i*37)%115;
    ctx.fillStyle=i%3===0?'#ffffff30':'#effcff48';
    ctx.beginPath();ctx.moveTo(0,y+38);ctx.lineTo(x,y+4);ctx.lineTo(128,y-33);ctx.lineTo(x+13,y+12);ctx.closePath();ctx.fill();
    ctx.strokeStyle='#f4fdff9c';ctx.lineWidth=i%3===0?1.3:.63;
    ctx.beginPath();ctx.moveTo(-6,y+37);ctx.lineTo(x,y+5);ctx.lineTo(x+19,y+1);ctx.lineTo(133,y-33);ctx.stroke();
   }
   map=this.own(new T.CanvasTexture(canvas));map.colorSpace=T.SRGBColorSpace;map.wrapT=T.MirroredRepeatWrapping;map.repeat.y=5;
  }
  return this.own(new T.MeshStandardMaterial({map,color:colors[0],emissive:colors[1],emissiveIntensity:trim?.76:['cyberLaser','cyberSignalBar','cyberSignalColumn','cyberLethalStrip'].includes(look)?.88:ice?.23:.16,roughness:ice?.13:.44,metalness:ice?.08:.30}));
 }
 buildCyberArt(cube,mesh,mat,own){
  const T=this.T,d=this.data,c=d.cyber;
  const steel=mat(0x192536),trim=mat(0x37cfff,.72),magenta=mat(0xf159b4,.75),red=mat(0xe32443,.56),hot=mat(0xff5c74,1.4),titles=[];
  // Checkpoint bays and holographic sector numbers are visual only.
  for(const cp of d.checkpoints.slice(0,-1)){
   for(const side of [-1,1]){
    mesh(cube,steel,side*6.4,8.7,cp.z,1.15,5.4,1.15);
    mesh(cube,cp.index%2?magenta:trim,side*6.4,9.35,cp.z+.61,.26,3.85,.11);
    mesh(cube,steel,side*6.4,11.35,cp.z,1.62,.29,1.62);
   }
   if(cp.index!==1){
    mesh(cube,steel,0,12.15,cp.z,13.5,.38,1.08);
    mesh(cube,cp.index%2?magenta:trim,0,12.14,cp.z+.57,12.75,.085,.08);
   }
   const title=this.courseSign('0'+(cp.index+1)+' / 05',2.65,.66);title.name='troll-sector-marker';title.material.depthWrite=false;title.position.set(0,12.86,cp.z);this.scene.add(title);titles.push(title);
  }
  const lamp=mat(0x79ffd2,1.05);
  const signalDeck=d.platforms.find(o=>o.look==='cyberSignal');
  for(const side of [-1,1])mesh(cube,lamp,side*(signalDeck.w/2-.11),8.021,signalDeck.z,.115,.044,signalDeck.d-.24);
  for(let z=c.signal.front-4;z>c.signal.back;z-=9){
   for(const side of [-1,1]){
    mesh(cube,steel,side*4.68,7.29,z,.56,3.5,.65);
    mesh(cube,lamp,side*4.54,8.88,z,.24,.31,.49);
   }
  }
  const fin=own(new T.CylinderGeometry(.72,1.04,.63,16)),ring=own(new T.TorusGeometry(.80,.055,6,18));
  for(const tile of this.tiles.filter(t=>t.o.cyberLane)){
   const {o,group}=tile,glow=o.cyberTile%2?magenta:trim;
   mesh(cube,steel,0,-o.h/2-.27,0,o.w*.72,.53,o.d-.8,group);
   mesh(cube,glow,0,-o.h/2-.53,0,.10,.13,o.d-1.35,group);
   // Lane pods hide with their lane; nothing below them can be stood on.
   for(const z of [-o.d*.40,o.d*.40]){
    mesh(fin,steel,0,-o.h/2-.73,z,1,1,1,group);
    mesh(ring,glow,0,-o.h/2-.76,z,1,1,1,group).rotation.x=-Math.PI/2;
   }
   for(const [mat,dy,dz,sx,sy,sz] of [[steel,-.37,0,.96,.71,1.43],[glow,-.38,.7,.66,.18,.074]]){
    const batch=own(new T.InstancedMesh(cube,mat,5)),m=new T.Matrix4();
    for(let i=0;i<5;i++){m.makeScale(sx,sy,sz);m.setPosition(0,-o.h*.5+dy,(i-2)*o.d/5+dz);batch.setMatrixAt(i,m);}
    batch.computeBoundingSphere();group.add(batch);
   }
  }
  const seq=d.platforms[c.sequence.lanes[0]];
  const arcGeo=own(new T.TorusGeometry(1,.052,7,34,.92*Math.PI));
  for(const [i,unit] of [-.43,-.26,-.09,.09,.26,.43].entries()){
   const z=seq.z+unit*seq.d;
   for(const side of [-1,1]){
    const x=side*12.8;
    mesh(cube,steel,x,7.08,z,.83,2.8,1.05);
    mesh(fin,steel,x,8.46,z,1.3,1,1.3);
    const hoop=mesh(arcGeo,i%2?trim:magenta,x,9.52,z,1.35,1.35,1);
    hoop.rotation.z=side*.22+.1;
    mesh(ring,i%2?magenta:trim,x,7.48,z,1.10,1.10,1).rotation.x=-Math.PI/2;
    mesh(cube,steel,x-side*1.15,7.24,z,2.17,.21,.56).rotation.z=side*.25;
   }
  }
  const ice=d.platforms[c.ice.slab],iceFrost=mat(0x98d9ef,.28),iceLine=mat(0xc5f2ff,.36),launch=mat(0xe9b66d,.55);
  for(const side of [-1,1]){
   mesh(cube,iceFrost,side*(ice.w/2-.19),7.89,ice.z,.36,.20,ice.d-.12);
   for(let i=0;i<13;i++){
    const z=ice.z+(i/12-.5)*(ice.d-12),x=side*(ice.w/2-.19);
    mesh(fin,iceFrost,x,7.95,z,.27,.49,.65);
    mesh(cube,steel,x,7.18,z,.45,.28,1.6).rotation.z=side*.24;
    mesh(cube,iceLine,x+side*.27,7.34,z,.11,.11,.96).rotation.z=side*.24;
   }
  }
  for(let i=0;i<34;i++){
   const z=c.ice.front-4.5-i*(ice.d-10)/33,x=Math.sin(i*2.399)*3.1;
   mesh(cube,iceLine,x,8.017,z,.026,.013,1.75+(i%5)*.68).rotation.y=.18*Math.cos(i*1.63);
  }
  for(const z of [c.ice.lip+3.1,c.ice.lip+1.75,c.ice.lip+.48]){
   for(const side of [-1,1])mesh(cube,launch,side*.56,8.024,z,.093,.024,1.46).rotation.y=side*.96;
  }
  for(const side of [-1,1]){
   mesh(cube,steel,side*5.15,8.6,c.ice.lip+1.2,.47,2.1,.60);
   mesh(cube,launch,side*5.15,9.58,c.ice.lip+1.2,.58,.21,.75);
  }
  const h=d.hazards.find(o=>o.look==='cyberScanner'),scanner=new T.Group();scanner.userData.trollDynamic=true;this.scene.add(scanner);
  mesh(own(new T.SphereGeometry(h.radius,16,12)),red,0,0,0,1,1,1,scanner);
  const scannerRing=new T.Group();scanner.add(scannerRing);
  mesh(ring,hot,0,0,0,.99,.99,1,scannerRing).rotation.x=Math.PI/2;
  mesh(ring,steel,0,0,0,.89,.89,1,scannerRing).rotation.y=Math.PI/2;
  for(const [dx,dy,dz] of [[0,0,-.68],[0,0,.68],[.68,0,0],[-.68,0,0]])mesh(cube,hot,dx,dy,dz,.23,.22,.23,scannerRing);
  for(const side of [-1,1]){
   mesh(cube,steel,side*4.84,8.44,h.z,.36,1.1,.73);
   mesh(cube,red,side*4.84,9.02,h.z,.43,.17,.7);
  }
  // One reusable left-side punch; no shadow or new lights.
  const fist=new T.Group();fist.userData.trollDynamic=true;fist.visible=false;this.scene.add(fist);
  mesh(cube,red,.14,0,0,2.35,1.37,1.93,fist);
  for(let i=0;i<4;i++)mesh(cube,i%2?red:hot,-1.05,-.025,(i-1.5)*.47,.76,1.12,.405,fist);
  for(let i=0;i<3;i++)mesh(cube,steel,-.62,.657,(i-1)*.47,.93,.10,.095,fist);
  mesh(cube,red,-.42,-.5,.92,1.41,.61,.72,fist).rotation.z=-.24;
  mesh(cube,steel,1.29,0,0,.94,1.25,1.66,fist);
  for(const x of [1.10,1.50])mesh(cube,hot,x,0,0,.085,1.30,1.73,fist);
  const fan=new T.Group(),rotor=new T.Group();fan.name='troll-follow-fan';fan.userData.trollDynamic=true;fan.visible=false;fan.add(rotor);this.scene.add(fan);
  const fanCase=own(new T.CylinderGeometry(1.28,1.31,.48,24,1,true)),fanHoop=own(new T.TorusGeometry(1.29,.105,8,26)),fanHub=own(new T.CylinderGeometry(.28,.44,.68,16));
  mesh(fanCase,mat(0x49627f,.17),0,0,0).rotation.z=Math.PI/2;
  for(const x of [-.25,.24])mesh(fanHoop,x>0?trim:steel,x,0,0).rotation.y=Math.PI/2;
  mesh(fanHub,steel,0,0,0).rotation.z=Math.PI/2;
  mesh(cube,trim,.35,0,0,.11,.24,.24,rotor);
  for(let i=0;i<6;i++){
   const angle=i*Math.PI/3,blade=new T.Group();blade.rotation.x=angle;rotor.add(blade);
   mesh(cube,i%2?trim:steel,.055,.69,.08,.14,.83,.34,blade).rotation.x=-.45;
   mesh(cube,trim,.105,1.02,.04,.085,.21,.25,blade);
  }
  mesh(cube,steel,-.18,-1.28,0,.64,.28,1.17,fan);
  fan.scale.setScalar(1.13);
  const count=this.api.mobile?5:9,streaks=own(new T.InstancedMesh(own(new T.BoxGeometry(1,1,1)),own(new T.MeshBasicMaterial({color:0x8fedff,transparent:true,opacity:.30,depthWrite:false})),count));
  streaks.instanceMatrix.setUsage(T.DynamicDrawUsage);streaks.frustumCulled=false;streaks.visible=false;this.scene.add(streaks);
  const phaseFx=own(new T.InstancedMesh(own(new T.BoxGeometry(1,1,1)),own(new T.MeshBasicMaterial({color:0xffffff,transparent:true,opacity:.69,depthWrite:false})),24));
  phaseFx.instanceMatrix.setUsage(T.DynamicDrawUsage);phaseFx.frustumCulled=false;phaseFx.visible=false;this.scene.add(phaseFx);
  // Fixed pools: one draw for warnings and one for all falling lane pieces.
  // No new meshes/materials or random values are allocated when a lane breaks.
  const warningCanvas=document.createElement('canvas');warningCanvas.width=warningCanvas.height=64;
  const ctx=warningCanvas.getContext('2d');ctx.fillStyle='#ffdc58';ctx.strokeStyle='#26152d';ctx.lineWidth=4;
  ctx.beginPath();ctx.moveTo(32,4);ctx.lineTo(61,58);ctx.lineTo(3,58);ctx.closePath();ctx.fill();ctx.stroke();
  ctx.fillStyle='#26152d';ctx.fillRect(29,22,6,19);ctx.beginPath();ctx.arc(32,49,3.2,0,Math.PI*2);ctx.fill();
  const warningMap=own(new T.CanvasTexture(warningCanvas));warningMap.colorSpace=T.SRGBColorSpace;
  const laneWarnings=own(new T.InstancedMesh(own(new T.PlaneGeometry(1,1)),own(new T.MeshBasicMaterial({map:warningMap,transparent:true,opacity:.94,depthWrite:false,side:T.DoubleSide})),18));
  laneWarnings.name='troll-lane-warning-icons';laneWarnings.count=0;laneWarnings.visible=false;laneWarnings.frustumCulled=false;laneWarnings.renderOrder=3;laneWarnings.instanceMatrix.setUsage(T.DynamicDrawUsage);this.scene.add(laneWarnings);
  const breakRows=this.api.mobile?12:20,breakMax=c.sequence.lanes.length*2*breakRows;
  const laneFragments=own(new T.InstancedMesh(cube,own(new T.MeshStandardMaterial({color:0xffffff,roughness:.44,metalness:.3})),breakMax));
  const fragmentWhite=new T.Color(0xffffff);for(let i=0;i<breakMax;i++)laneFragments.setColorAt(i,fragmentWhite);
  laneFragments.instanceColor.setUsage(T.DynamicDrawUsage);
  laneFragments.name='troll-lane-fragments';laneFragments.count=0;laneFragments.visible=false;laneFragments.frustumCulled=false;laneFragments.instanceMatrix.setUsage(T.DynamicDrawUsage);this.scene.add(laneFragments);
  const breakSeeds=new Float32Array(breakMax*4);let seed=19313;
  for(let i=0;i<breakSeeds.length;i++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;breakSeeds[i]=seed/4294967296;}
  this.cyberArt={lamp,fist,streaks,phaseFx,laneWarnings,laneFragments,breakRows,breakSeeds,titles,lampState:null,scanner,scannerRing,h,fan,rotor,fanZ:null,launch,blue:new T.Color(0xa6fbff),pink:new T.Color(0xffa7e9),breakBlue:new T.Color(0x477bd1),breakPink:new T.Color(0xdd54b2)};
 }
 renderCyberLanes(p,t){
  const a=this.cyberArt,d=this.dummy,seq=this.data.cyber.sequence,reduce=this.jellyReduced?.matches;
  let warnings=0,fragments=0;
  if(this.checkpoint===1)for(const id of seq.lanes){
   const o=this.data.platforms[id];
   if(o.warning&&o.active&&!o.cyberHidden){
    for(const offset of [-3.2,0,3.2]){
     const z=Math.max(o.z-o.d/2+.8,Math.min(o.z+o.d/2-.8,p.z+offset));
     d.position.set(o.x,o.y+.065,z);d.rotation.set(-Math.PI/2,0,0);d.scale.setScalar(1.05);
     d.updateMatrix();a.laneWarnings.setMatrixAt(warnings++,d.matrix);
    }
   }
   const age=o.cyberBreakAt==null?Infinity:t-o.cyberBreakAt,duration=seq.breakDuration??.64;
   if(age<0||age>=duration)continue;
   const motion=reduce?age*.35:age,shrink=Math.max(0,1-Math.max(0,(age-.26)/(duration-.26))**2),rows=a.breakRows,cell=o.d/rows;
   for(let row=0;row<rows;row++)for(let col=0;col<2;col++){
    const k=(o.cyberTile*rows*2+row*2+col)*4,s=a.breakSeeds;
    const feint=!!o.cyberFeint,side=col===0?-1:1;
    d.position.set(o.x+(feint?side*(o.w/2-.18)+side*motion*1.7:(col-.5)*o.w/2)+(s[k]-.5)*motion*4,o.y+(feint?.09:-.14)+(1+s[k+1]*1.6)*motion-13*motion*motion,o.z+(row+.5-rows*.5)*cell+(s[k]-.5)*motion);
    d.rotation.set((s[k+2]-.5)*motion*4,0,(s[k+3]-.5)*motion*4);
    d.scale.set((o.w/2-.035)*shrink*(feint?.35:1),(feint?.12:.28)*shrink,(cell-.05)*shrink*(feint?.18:1));d.updateMatrix();
    a.laneFragments.setMatrixAt(fragments,d.matrix);a.laneFragments.setColorAt(fragments++,o.cyberTile%2?a.breakPink:a.breakBlue);
   }
  }
  a.laneWarnings.count=warnings;a.laneWarnings.visible=warnings>0;
  a.laneWarnings.material.opacity=reduce?.94:.84+.15*(.5+.5*Math.sin(t*14));
  if(warnings)a.laneWarnings.instanceMatrix.needsUpdate=true;
  a.laneFragments.count=fragments;a.laneFragments.visible=fragments>0;
  if(fragments){a.laneFragments.instanceMatrix.needsUpdate=true;a.laneFragments.instanceColor.needsUpdate=true;}
  d.rotation.set(0,0,0);
 }
 renderCyberArt(p,t,dt){
  const a=this.cyberArt,s=this.race.cyber;if(!a||!s)return;
  this.renderCyberLanes(p,t);
  const phase=s.signal==='stop'?'stop':'go';
  if(a.lampState!==phase){const color=phase==='stop'?0xff3250:0x58f4c0;a.lamp.color.setHex(color);a.lamp.emissive.setHex(color);a.lampState=phase;}
  // Green lamps dim gently before red, but the only instructions are GO/STOP.
  a.lamp.emissiveIntensity=s.signal==='warn'&&!(this.jellyReduced?.matches) ? .64+.33*Math.cos(t*18):1.05;
  const h=a.h;
  a.scanner.position.set(h.currentX??h.x,h.y,h.z);a.scannerRing.rotation.set(t*1.9,0,t*2);
  const launched=p.iceAir&&-p.vz>17,nearLip=this.checkpoint===3&&p.z<this.data.cyber.ice.lip+16;
  a.launch.emissiveIntensity=nearLip?(launched?1.06:.55)+.18*Math.sin(t*6):.55;
  const reduce=this.jellyReduced?.matches,fx=a.phaseFx;
  fx.visible=false;
  if(!reduce&&(this.checkpoint===1||this.checkpoint===3&&launched)){
   const d=this.dummy;d.rotation.set(0,0,0);let j=0;
   if(this.checkpoint===1){
    for(const {o} of this.tiles){
     if(!o.cyberLane||!o.cyberFlash&&(!o.active||o.cyberHidden||o.cyberFade>.88))continue;
     const lo=Math.max(o.z-o.d*.5,p.z-37),hi=Math.min(o.z+o.d*.5,p.z+9);
     for(let k=0;k<3&&j<24;k++){
      const phase=(t*1.9+k*.329)%1;
      d.position.set(o.x,8.042,lo+(hi-lo)*phase);d.scale.set(o.w*.88,.035,.13+phase*.18);
      d.updateMatrix();fx.setMatrixAt(j,d.matrix);fx.setColorAt(j++,o.cyberTile%2?a.pink:a.blue);
     }
    }
   }else if(nearLip){
    const lip=this.data.cyber.ice.lip;
    for(let k=0;k<12;k++){
     const drift=(t*2.7+k*.618)%1;
     d.position.set(Math.sin(k*2.395)*(1.3+drift*2),8.02+drift*.32,lip+.45+drift*9.5);d.scale.set(.025,.025,.4+(1-drift)*1.3);
     d.updateMatrix();fx.setMatrixAt(j,d.matrix);fx.setColorAt(j++,a.blue);
    }
   }
   fx.count=j;fx.visible=j>0;
   if(j){fx.instanceMatrix.needsUpdate=true;fx.instanceColor.needsUpdate=true;}
  }
  const f=s.strike,age=f?t-f.at:Infinity;
  a.fist.visible=age<.54;
  if(a.fist.visible){
   const reach=Math.min(1,age/.24),release=Math.max(0,(age-.24)/.30);
   a.fist.position.set(f.x+f.side*(1.05+8.6*(1-reach)**2-3*release),f.y+.22*(1-reach),f.z);
   a.fist.rotation.y=f.side>0?0:Math.PI;
   a.fist.rotation.z=f.side*-.14;
   a.fist.scale.setScalar(reduce?1.12:1.32*Math.min(1,.15+age*11)*(1-release*.78));
  }
  a.fan.visible=s.fanX!=null&&!p.dead;
  if(a.fan.visible){
   const z=p.z-2.3,x=s.fanX,under=1-Math.min(1,Math.abs(x)/4.65);
   a.fanZ=a.fanZ===null||Math.abs(a.fanZ-z)>11?z:a.fanZ+(z-a.fanZ)*(1-Math.exp(-10*dt));
   a.fan.position.set(x,7.12-under*2.8,a.fanZ);
   // The rotor's local +X axis points across the beam, never at the camera.
   a.fan.rotation.y=x<=0?0:Math.PI;
   a.rotor.rotation.x=t*(reduce?4:18);
  }else a.fanZ=null;
  a.streaks.visible=!!s.wind&&!p.dead&&!reduce;
  if(a.streaks.visible){
   const d=this.dummy;
   d.rotation.set(0,0,0);
   for(let i=0;i<a.streaks.count;i++){
    const drift=(t*.93+i*.61803399)%1;
    d.position.set(s.fanX+Math.sign(s.wind)*(1.10+drift*7.7),7.25+(i%4)*.22,a.fanZ+Math.sin(i*2.39)*(.46+drift*1.90));
    d.scale.set(.61+(i%3)*.25+drift*.68,.022,.036);d.updateMatrix();a.streaks.setMatrixAt(i,d.matrix);
   }
   a.streaks.instanceMatrix.needsUpdate=true;
  }
 }
 restart(){this.clearDeathBurst();if(this.active)g.ElementalAudio?.stopTrollLaugh();this.resetAvatarJelly();this.nativeUI.hide();this.clock.reset();this.rewardCoins=0;this.runId='troll-'+(globalThis.crypto?.randomUUID?.()||Date.now()+'-'+performance.now());this.race=new TrollRace(this.data);this.p=this.race.player.p;this.checkpoint=this.elapsed=this.worldTime=this.deaths=this.respawnTimer=this.acc=0;this.won=this.qualified=this.resultShown=false;this.yaw=0;this.pitch=.48;this.facing=0;this.keys.clear();this.touchKeys.clear();this.pendingDive=false;this.cameraReady=false;this.fallAnchor=null;this.hudStamp=-1;this.progressPeak=0;this.cameraKick=0;this.handMotion={};this.refresh();}
 async buildEnvironment(own){const T=this.T,d=this.data,theme=d.theme,serial=this.serial;
 this.sky=this.api.sky?.(own);if(this.sky){this.sky.rotation.y=Math.PI/2;const disc=this.sky.userData.sun;if(disc){disc.material.color.setHex([0xff74c8,0xffffb0,0xffffff,0xff9b56,0xffe0a0,0xf3f7ff][theme.phase]);disc.position.set(360,190,180);disc.scale.setScalar(.6);}if(this.sky.userData.stars)this.sky.userData.stars.material.opacity=[0,5].includes(theme.phase)?.55:.22;this.scene.add(this.sky);}this.camera.far=650;this.camera.updateProjectionMatrix();
 this.biomeGround=window.ElementalPartyEnvironment.ground(T,d,this.api,own);this.scene.add(this.biomeGround.mesh,this.biomeGround.base);this.solids.push(this.biomeGround.mesh,this.biomeGround.base);
 // Reuse complete normal-game scenery. Batch each source variant; do not
 // split compound snow/tree/rock models into independently moving pieces.
 this.sceneryCells=[];this.decorStats=[];this.sceneryPlacements=[];
 for(const variant of [3,0,1,2]){
  if(theme.phase===1&&variant<2){if(variant===0)window.ElementalPartyEnvironment.plantNatureTrees(T,d,this.api,own,this.sceneryPlacements,this.scene,this.sceneryCells,this.decorStats);continue;}
  const raw=this.api.decor(theme.phase,variant),parts=Array.isArray(raw)?raw:[{geometry:raw,material:new T.MeshStandardMaterial({vertexColors:true,roughness:.85})}];
  const bounds=new T.Box3();let triangles=0;for(const part of parts){if(!part.geometry)continue;part.geometry.computeBoundingBox();bounds.union(part.geometry.boundingBox);triangles+=(part.geometry.index?.count||part.geometry.attributes.position.count)/3;}
  const height=(theme.phase===0?[30,38,25,46]:theme.phase===4?[30,22,40,62]:[40,36,24,70])[variant],size=bounds.getSize(new T.Vector3()),scale=Math.min(height/Math.max(1,size.y),(theme.phase===0?38:66)/Math.max(1,size.x,size.z));
  const spacingHint=theme.phase===4?[24,32,65,80][variant]:variant===3?52:variant===2?24:15,arenaRows=[[14,12,10,8],[16,14,10,7],[10,8,6,6],[14,12,10,5],[10,8,4,5],[16,6,8,5]];
  const wanted=d.kind==='race'?Math.ceil((d.depth+240)/spacingHint)+1:arenaRows[theme.phase][variant];
  const rows=Math.max(1,Math.min(wanted,Math.floor((this.api.mobile?65000:110000)/Math.max(1,triangles*2)),theme.phase===0?12:variant===3?3:16));
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
 if(theme.phase===4)this.scene.fog=new T.Fog(0x6c9ea9,120,330);if(theme.phase===0)this.scene.fog=new T.Fog(theme.sky,80,260);
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
 enter(){super.enter();document.body.classList.add('troll-active');this.warmDeathBurst();g.ElementalAudio?.prepareTrollLaugh();}
 exit(){this.clearDeathBurst();this.resetAvatarJelly();document.body.classList.remove('troll-active');super.exit();}
 pause(){super.pause();if(this.state==='paused')this.clearDeathBurst();}
 warmDeathBurst(){
  if(this.deathStamps.length)return;
  const nodes=document.createDocumentFragment();
  for(let i=0,n=this.api.mobile?10:16;i<n;i++){
   const img=document.createElement('img');
   img.alt='';img.draggable=false;img.decoding='async';img.src='assets/cosmetics/troll-laugh-cat.webp';
   nodes.appendChild(img);this.deathStamps.push({img,animation:null});
  }
  this.deathBurst.appendChild(nodes);
 }
 clearDeathBurst(){
  for(const item of this.deathStamps){item.animation?.cancel();item.animation=null;}
 }
 showDeathBurst(){
  if(document.hidden)return;
  this.warmDeathBurst();this.clearDeathBurst();
  const reduced=this.jellyReduced?.matches,n=reduced?6:this.deathStamps.length;
  const portrait=this.deathBurst.clientHeight>this.deathBurst.clientWidth;
  const columns=this.api.mobile?(portrait?2:5):4,rows=Math.ceil(n/columns);
  for(let i=0;i<n;i++){
   const item=this.deathStamps[i],img=item.img,r=Math.random;
   // Fewer, larger cutouts spread over the viewport; keep the central view open.
   const column=i%columns,row=Math.floor(i/columns);
   let left=6+88*(column+.18+r()*.64)/columns;
   if(columns===4&&row>0&&row<rows-1&&(column===1||column===2))left+=column===1?-6:6;
   img.style.left=left+'%';
   img.style.top=(7+86*(row+.18+r()*.64)/rows)+'%';
   img.style.setProperty('--stamp-size',(.92+r()*.22).toFixed(2));
   const flip=i%2?-1:1,tilt=(r()-.5)*35,dx=(r()-.5)*56,dy=-12-r()*22;
   const pose=(s,x,y,a)=>`translate(calc(-50% + ${x}px),calc(-50% + ${y}px)) rotate(${a}deg) scale(${flip*s},${s})`;
   item.animation=img.animate([
    {opacity:0,transform:pose(reduced?1:.48,0,0,tilt)},
    {opacity:.9,transform:pose(reduced?1:1.12,0,0,tilt),offset:.17},
    {opacity:.8,transform:pose(1,0,0,tilt),offset:.49},
    {opacity:0,transform:pose(reduced?1:.84,reduced?0:dx,reduced?0:dy,tilt)}
   ],{duration:1260+r()*510,delay:r()*170,easing:'ease-out'});
  }
 }
 finish(){if(!this.resultShown&&this.race?.qualified)this.api.sound('finish');super.finish();}
 resetAvatarJelly(){this.jellyTrail?.clear();this.jellySupport=this.stairActor=null;this.stairY=null;this.stairBlend=false;this.pairReveal=0;if(this.mazeTouchWarning)this.mazeTouchWarning.hidden=true;if(this.cyberStatus)this.cyberStatus.hidden=true;if(this.body&&this.avatarMotion)g.ElementalCubeAvatar.resetJelly(this.body,this.avatarMotion);}
 tick(){
  const falls=this.deaths,previous=this.p,airborne=!previous.grounded,vy=previous.vy;
  super.tick();
  const p=this.p,speed=Math.hypot(p.vx,p.vz),before=this.facing;
  this.updateTrollSounds(p,previous,falls,airborne,vy,speed);
  if(this.active&&this.deaths>falls){this.showDeathBurst();this.api.sound('laugh');}
  if(this.deaths>falls||previous!==p)this.resetAvatarJelly();
  const moving=['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].some(k=>this.keys.has(k))||['up','down','left','right'].some(k=>this.touchKeys.has(k));
  if(moving&&speed>.35){const target=Math.atan2(-p.vx,-p.vz);this.facing+=Math.atan2(Math.sin(target-this.facing),Math.cos(target-this.facing))*(1-Math.exp(-14*C.DT));}
  const support=this.data.platforms[p.support],grounded=p.grounded&&!p.dead,visibleTop=support?C.walkTopY(support,p.z)+(support.checker||support.cyberTile!=null||support.look?.startsWith('cyber')||support.look==='ghost'||support.look==='ghostBrown'?0:.11):p.y;
  const onStairs=grounded&&support?.walkSurface==='sector',sameActor=this.stairActor===p,wasOnStairs=sameActor&&this.stairBlend;
  this.stairY=stairDisplayY(p,support,sameActor?this.stairY:p.y,wasOnStairs);
  this.stairActor=p;this.stairBlend=onStairs||grounded&&wasOnStairs&&Math.abs(this.stairY-p.y)>.003;
  const impact=previous===p&&airborne&&grounded?Math.max(0,-vy):0,reduced=this.jellyReduced.matches;
  this.avatarMotion.turn=(this.facing-before)/C.DT;
  g.ElementalCubeAvatar.animateJelly(this.body,this.avatarMotion,C.DT,speed,grounded,p.vy,visibleTop-p.y-1.08,reduced,impact,onStairs);
  const face=this.jellyFace;if(face.smile&&face.surprise){face.smile.visible=grounded||this.race.countdown>0;face.surprise.visible=!face.smile.visible;}
  const blink=this.avatarMotion.time%3.7;for(const eye of face.eyes)eye.scale.y=.16*(blink<3.54?1:1-.88*Math.sin((blink-3.54)/.16*Math.PI));
  this.jellySupport=support;
  const permitted=this.active&&this.state==='playing'&&this.race.countdown<=0&&grounded&&support?.cyberTile==null&&g.ElementalCubeAvatar.jellyPlatformHeight(support,p.x,p.z)!=null;
  this.jellyTrail.update(C.DT,p.x,p.z,permitted?support.id:null,this.jellySurface,speed>.22,impact,reduced);
 }
 updateTrollSounds(p,previous,falls,airborne,vy,speed){
  const r=this.race,time=r.time,d=this.data,s=r.cyber,phase=this.checkpoint;
  if(this.state!=='playing')return;
  if(!this.trollSfx||this.trollSfx.race!==r)this.trollSfx={race:r,beat:-1,foot:0,scan:-1,stage:-1,objects:[],stamps:new Map(),signal:null,bank:null,flash:false,fanSide:0,overhead:false,scanner:false};
  const a=this.trollSfx,sound=this.api.sound;
  const count=Math.ceil(r.countdown);
  if(count!==a.beat){if(count>0)sound('count',.74);else if(a.beat>0)sound('ready');a.beat=count;}
  if(count>0)return;
  if(this.deaths>falls){const event=previous.trapEvent;sound(event==='spikeTile'?'spike':event==='boulder'?'rock':'fail',1);a.foot=0;}
  else if(previous!==p){sound('retry');a.foot=0;}
  else if(airborne&&p.grounded&&vy< -1.8)sound('land',Math.min(1.15,.38-vy*.052));
  const ice=p.iceAir&&phase===3;
  if(p.grounded&&!p.dead&&speed>1.4){
   a.foot+=speed*C.DT;
   if(a.foot>(ice?2.85:1.52)){a.foot=0;sound(ice?'iceStep':'foot',ice?.66:.58,p.vx*.035);}
  }else a.foot=0;
  if(ice&&!p.grounded&&!airborne&&p.vy>5&&p.z<d.cyber.ice.lip+8)sound('iceLaunch',1);
  const signal=s?.signal==='warn'?'go':s?.signal;
  if(signal!==a.signal&&signal)sound(signal);
  a.signal=signal;
  if(phase===1&&s&&a.bank!==s.seqBank&&a.bank!==null)sound('phasing');
  a.bank=phase===1?s?.seqBank??null:null;
  if(s?.seqFlash&&!a.flash)sound('flash');a.flash=!!s?.seqFlash;
  if(s?.seqResolved&&!a.phaseReady)sound('ready',.68);a.phaseReady=!!s?.seqResolved;
  const fanSide=Math.sign(s?.fanX||0);
  if(fanSide&&fanSide!==a.fanSide)sound('fanFlip',.70,fanSide*.78);
  a.fanSide=fanSide;
  if(s?.overhead&&!a.overhead)sound('perspective');
  a.overhead=!!s?.overhead;
  const scan=Math.floor(time*24);
  if(a.scan===scan)return;a.scan=scan;
  if(a.stage!==phase||previous!==p){a.stage=phase;a.stamps.clear();a.objects=d.platforms.filter(o=>o.stage===phase&&(o.trap||o.spikeHome||o.type==='crumble'));}
  for(const o of a.objects){
   if(Math.abs(o.z-p.z)>15)continue;
   const old=a.stamps.get(o.id)??0,stamp=o.spikeAt??o.triggerAt??o.touchAt??(o.revealUntil>time?1:0);
   const current=o.type==='crumble'&&!o.active&&o.touchAt!=null?-stamp:stamp;
   if(current!==old){
    a.stamps.set(o.id,current);
    if(current)sound(o.spikeHome?'spike':o.type==='crumble'?(current<0?'crumble':'warning'):o.trap==='slideFake'?'shift':'trigger',.56,Math.max(-.8,Math.min(.8,(o.x-p.x)*.12)));
   }
  }
  const shift=d.shift,shiftStamp=shift?.lastAt??shift?.firstAt??0;
  if(shiftStamp&&shiftStamp!==a.shift)sound('shift',.82);a.shift=shiftStamp;
  const rock=d.hazards.find(h=>h.look==='trollBoulder'),scanner=d.hazards.find(h=>h.look==='cyberScanner');
  const scannerClose=!!(scanner&&Math.abs(scanner.z-p.z)<8&&phase===3);
  if(scannerClose&&!a.scanner)sound('scanner',.73,Math.max(-1,Math.min(1,(scanner.currentX-p.x)*.2)));
  a.scanner=scannerClose;
  if(p.dead)this.api.soundBed?.(null);
  else if(fanSide)this.api.soundBed?.('wind',.28+Math.abs(s.wind)*.064,fanSide*.65);
  else if(ice)this.api.soundBed?.('ice',Math.min(1,speed/24),p.vx*.06);
  else if(rock&&Math.abs(p.z-rock.currentZ)<17&&phase===3)this.api.soundBed?.('rock',1-Math.abs(p.z-rock.currentZ)/18);
  else this.api.soundBed?.(null);
 }
 clearScene(){super.clearScene();this.cyberArt=this.cyberAim=this.cyberLanePattern=null;if(this.cyberStatus)this.cyberStatus.hidden=true;this.tiles=[];this.hazardMeshes=[];this.spikeMesh=this.spikeBases=this.spikePositions=this.maze=this.mazeLight=this.mazeWrongWay=null;this.cabinRoofs=[];this.stairActor=null;this.stairBlend=false;this.spikeTiles=[];this.sceneryCells=[];this.sceneryPlacements=[];this.checkRings=[];this.avatar=this.body=this.avatarShadow=this.avatarMotion=this.jellyFace=this.jellyTrail=this.jellySurface=this.jellySupport=this.sky=this.biomeGround=this.backdrop=null;}
 bindLookPad(pad){pad.addEventListener('pointerdown',e=>{if(!this.active||this.state!=='playing'||this.race?.countdown>0||this.lookTouch)return;e.preventDefault();e.stopPropagation();this.api.interaction?.();this.lookTouch={id:e.pointerId,x:e.clientX,y:e.clientY};try{pad.setPointerCapture(e.pointerId);}catch(_){}});pad.addEventListener('pointermove',e=>{const p=this.lookTouch;if(!p||p.id!==e.pointerId||this.state!=='playing')return;e.preventDefault();e.stopPropagation();if(!this.race.cyber?.overhead){this.yaw-=Math.max(-40,Math.min(40,e.clientX-p.x))*.005;this.pitch=Math.max(.18,Math.min(.9,this.pitch+Math.max(-40,Math.min(40,e.clientY-p.y))*.004));}p.x=e.clientX;p.y=e.clientY;});for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(this.lookTouch?.id===e.pointerId)this.lookTouch=null;});}
 mouse(e){if(this.state!=='playing'||this.race.countdown>0||this.race.cyber?.overhead||!document.pointerLockElement)return;this.yaw-=Math.max(-110,Math.min(110,e.movementX||0))*.005;this.yaw=Math.atan2(Math.sin(this.yaw),Math.cos(this.yaw));this.pitch=Math.max(.18,Math.min(.9,this.pitch+Math.max(-110,Math.min(110,e.movementY||0))*.004));}
 respawn(){const yaw=this.yaw,pitch=this.pitch;super.respawn();this.resetAvatarJelly();this.api.soundBed?.(null);this.api.sound('retry');this.yaw=yaw;this.pitch=pitch;}
 dive(){} // Troll routes never require a dash or glove.
 render(dt,warmup=false,prepareOnly=false){if(!this.scene||!this.p)return;const T=this.T,p=this.p,r=this.api.renderer(),delta=Math.min(.05,Math.max(0,dt)),t=this.worldTime,aspect=r.domElement.clientWidth/Math.max(1,r.domElement.clientHeight);
  const revealTarget=this.race.cyber?.overhead&&!p.dead?1:0;
  this.pairReveal=(this.pairReveal||0)+(revealTarget-(this.pairReveal||0))*(this.jellyReduced?.matches?1:1-Math.exp(-11*delta));
  for(const {o,group,body,fade}of this.tiles){
   // The 3-2 destination stays readable even while its collision is locked.
   group.visible=!!o.cyberExit||o.active&&!o.cyberHidden||!!o.cyberFlash;
   if(o.cyberTile!=null){
    group.position.set(o.x,o.y-o.h*.5,o.z);group.scale.set(1,1,1);
    group.rotation.z=o.warning&&!this.jellyReduced?.matches?Math.sin(t*42)*.006:0;
   }
   if(o.cyberPair!=null)group.position.y=o.apparentTop+(o.y-o.apparentTop)*this.pairReveal-o.h/2;
   if(fade){
    const alpha=Math.round(stairOpacity(o,t)*STAIR_FADE_STEPS);
    group.visible=alpha>0;
    if(alpha>0&&body.material!==fade[alpha])body.material=fade[alpha];
   }else if(o.type==='crumble'){
    group.position.y=o.y-o.h/2-(o.drop||0);group.rotation.z=o.warning&&!o.walkSurface?Math.sin(t*25)*.012:0;
   }
   if(o.trap==='slideFake'||o.type==='mover')group.position.x=o.x;if(o.shiftGroup)group.position.z=o.z;
   if((o.trap==='wall'||o.trap==='shoveWall')&&!group.userData.fixedWall){group.visible=!o.hideReveal&&o.revealUntil>t;body.material.opacity=group.visible?.38:0;}
   if(o.trap==='approachFake')group.rotation.z=o.revealed&&o.active?Math.sin(t*40)*.025:0;
   if(o.trap==='hiddenKill'){group.visible=o.revealed;body.material.opacity=o.revealed?.45:0;}
  }
  if(this.spikeMesh){
   let changed=false;
   for(let i=0;i<this.spikeTiles.length;i++){
    const o=this.spikeTiles[i],cx=o.x+spikeOffset(o,t);
    if(this.spikePositions[i]===cx)continue;
    this.spikePositions[i]=cx;changed=true;
    const spikeHeight=.92,spacing=o.w/5,dummy=this.dummy;dummy.rotation.set(0,0,0);dummy.scale.set(o.w*.98,.09,o.d*.98);
    dummy.position.set(cx,o.y+.047,o.z);dummy.updateMatrix();this.spikeBases.setMatrixAt(i,dummy.matrix);
    dummy.rotation.y=Math.PI/5;dummy.scale.set(spacing*.43,spikeHeight,spacing*.43);
    let index=i*25;
    for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){
     dummy.position.set(cx+x*spacing,o.y+.083+spikeHeight*.5,o.z+z*spacing);dummy.updateMatrix();this.spikeMesh.setMatrixAt(index++,dummy.matrix);
    }
   }
   if(changed){this.spikeMesh.instanceMatrix.needsUpdate=true;this.spikeBases.instanceMatrix.needsUpdate=true;}
  }
  for(const {hazard,rock,shadow,treads} of this.hazardMeshes){
   const z=hazard.currentZ;rock.position.set(hazard.currentX,hazard.currentY,z);rock.rotation.x=hazard.angle;
   const tread=treads.find(o=>Math.abs(z-o.z)<=o.d/2);shadow.visible=!!tread;if(tread){shadow.position.set(0,C.walkTopY(tread,z)+.016,z);shadow.rotation.x=-Math.PI/2-Math.atan(tread.grade);}
  }
  const displayY=this.stairActor===p?(this.stairY??p.y):p.y;
  this.renderCyberArt(p,t,delta);
  if(this.data.cyber){
   const idx=this.data.cyber.sequence.exit,ring=this.checkRings[idx],open=this.data.platforms[this.data.checkpoints[idx].platform].active;
   const tint=this.checkpoint>=idx?0x86f0b7:open?0xffd47f:0xe58c88;
   ring.material.color.setHex(tint);ring.material.emissive.setHex(tint);ring.material.emissiveIntensity=open?.4:.15;
  }
  this.biomeGround?.update(t);if(this.sky)this.sky.position.copy(this.camera.position);this.avatar.position.set(p.x,displayY+1.08,p.z);this.avatar.rotation.y=this.facing;const support=this.data.platforms[p.support];this.avatarShadow.visible=!!support?.active&&!support.cyberHidden;this.avatarShadow.position.set(p.x,support?C.walkTopY(support,p.z)+.145:8.145,p.z);this.avatarShadow.rotation.x=-Math.PI/2-Math.atan(support?.grade||0);this.avatarShadow.material.opacity=.65;
  const inside=!!(this.maze&&Math.abs(p.x)<this.maze.w/2-.22&&p.z<this.maze.a-.08&&p.z>this.maze.b&&p.y<13.45&&p.y>=7.9);
  if(this.mazeLight){this.mazeLight.intensity=inside?108:0;if(inside)this.mazeLight.position.set(p.x,12.42,p.z-1.8);}
  const wrongWay=inside&&p.z<this.maze.b+9&&Math.abs(p.x)<8;
  if(this.mazeWrongWay)this.mazeWrongWay.visible=wrongWay&&!this.mazeTouchWarning;
  // On short touch screens the level bar can overlap the in-world sign.
  if(this.mazeTouchWarning&&!prepareOnly&&!warmup&&this.mazeTouchWarning.hidden===wrongWay)this.mazeTouchWarning.hidden=!wrongWay;
  const inCabin=this.cabinRoofs.some(o=>Math.abs(p.x-o.x)<o.w*.5-.09&&Math.abs(p.z-o.z)<o.d*.5-.09&&p.y<o.y-o.h-.15&&p.y>o.y-4.6);
  const falling=this.respawnTimer>0||p.y<this.data.fallY+2;if(falling&&!this.fallAnchor)this.fallAnchor=new T.Vector3(p.x,Math.max(8.8,p.y+1.08),p.z);if(!falling)this.fallAnchor=null;
  const enclosed=inside||inCabin;
  this.pitch=Math.max(.18,Math.min(.9,this.pitch));const distance=inside?5.45:inCabin?4.35:10.5,centerY=displayY+1.08,pitch=enclosed?Math.min(inCabin?.24:.40,this.pitch):this.pitch,lookAhead=enclosed?0:3.8;
  this.desired.set(p.x+Math.sin(this.yaw)*Math.cos(pitch)*distance,centerY+(enclosed?.37:1.15)+Math.sin(pitch)*distance,p.z+Math.cos(this.yaw)*Math.cos(pitch)*distance);
  this.aim.set(p.x-Math.sin(this.yaw)*lookAhead,centerY+(enclosed?.22:1.35),p.z-Math.cos(this.yaw)*lookAhead);
  if(this.fallAnchor){this.desired.set(this.fallAnchor.x+Math.sin(this.yaw)*5,this.fallAnchor.y+4,this.fallAnchor.z+Math.cos(this.yaw)*5);this.aim.y=Math.max(p.y+.8,this.fallAnchor.y-9);this.avatar.rotation.z=Math.sin(t*11)*.35;}
  else this.avatar.rotation.z=0;
  const overhead=this.race.cyber?.overhead&&!falling;
  if(overhead){
   // The tiny +Z offset fixes north on screen at the vertical pole, with
   // forward/left/right locked to the matching world axes in the simulator.
   let distance=aspect<1?21:15.8;
   if(!this.jellyReduced?.matches)for(const {z,span,lift} of this.data.cyber.overhead.zoom){
    const f=Math.max(0,1-Math.abs(z-p.z)/span);distance+=lift*f*f*(3-2*f);
   }
   this.desired.set(p.x,centerY+distance,p.z-1.9);
   this.aim.set(p.x,centerY,p.z-1.93);
  }
  // Collision starts at the avatar, never at the look-ahead point (which can
  // already be inside the maze while the avatar is still outside).
  const anchor=this.cameraAnchor||(this.cameraAnchor=new T.Vector3());
  anchor.set(p.x,centerY+.22,p.z);
  const dist=this.desired.distanceTo(anchor),dir=this.rayDirection.copy(this.desired).sub(anchor).normalize(),allowed=overhead?dist:cameraDistance(this.data,anchor,dir,dist,inside,inCabin),hit=allowed<dist;if(hit)this.desired.copy(dir).multiplyScalar(Math.max(.12,allowed-.28)).add(anchor);
  const blend=1-Math.exp(-9*delta);
  if(this.cyberAim){if(!this.cameraReady||hit||falling)this.cyberAim.copy(this.aim);else this.cyberAim.lerp(this.aim,blend);}
  if(!this.cameraReady||hit){this.camera.position.copy(this.desired);this.cameraReady=true;}else this.camera.position.lerp(this.desired,blend);
  // Orbit interpolation itself may cross a corner, even if both endpoints
  // were clear. Clamp the actual final position, not only the desired one.
  if(!overhead){const d=this.camera.position.distanceTo(anchor);dir.copy(this.camera.position).sub(anchor).normalize();const safe=cameraDistance(this.data,anchor,dir,d,inside,inCabin);if(safe<d)this.camera.position.copy(dir).multiplyScalar(Math.max(.12,safe-.28)).add(anchor);}
  this.camera.lookAt(this.cyberAim||this.aim);
  if(this.camera.aspect!==aspect){this.camera.aspect=aspect;this.camera.updateProjectionMatrix();}
  if(this.data.cyber){
   const intensity=p.iceAir&&!p.dead&&!this.jellyReduced?.matches?Math.max(0,Math.min(1,(-p.vz-13)/10.5)):0;
   const fov=this.camera.fov+(60+intensity*5-this.camera.fov)*blend;
   if(Math.abs(fov-this.camera.fov)>.018){this.camera.fov=fov;this.camera.updateProjectionMatrix();}
   if(this.speedFx)this.speedFx.style.opacity=intensity>.01?(intensity*.39).toFixed(2):'0';
  }
  for(const title of this.cyberArt?.titles||[]){
   // Fade an approaching hologram before the camera could pass through it.
   const distance=this.camera.position.z-title.position.z;
   const opacity=Math.max(0,Math.min(1,(distance-9)/7,(105-distance)/28));
   title.material.opacity=opacity;title.visible=!overhead&&opacity>.04;
  }
  for(const cell of this.sceneryCells||[])cell.mesh.visible=p.z>=cell.lo-190&&p.z<=cell.hi+190;
  if(prepareOnly)return;const target=r.getRenderTarget(),auto=r.autoClear;r.setRenderTarget(warmup?this.warmTarget:null);r.autoClear=true;try{if(!warmup&&this.api.renderWorld)this.api.renderWorld(this.scene,this.camera,delta,this.data.theme.phase);else r.render(this.scene,this.camera);}finally{r.autoClear=auto;r.setRenderTarget(target);}
 }
 refresh(){super.refresh();if(this.ui){const hint=this.api.mobile?'':'WASD · Space: '+this.tr('obbyJump')+' · R: ↺';const node=this.ui.querySelector('[data-hint]');if(node.textContent!==hint)node.textContent=hint;}
  const node=this.cyberStatus,s=this.race?.cyber,tag=this.state==='playing'&&(s?.strike||s?.signal==='stop'?'stop':s?.signal?'go':s?.overhead&&!this.respawnTimer?'overhead':null);
  if(!node)return;
  if(!tag){node.hidden=true;return;}
  const caption=tag==='go'?'GO':tag==='stop'?'STOP':this.tr('trollTopView');
  if(node.hidden||node.dataset.phase!==tag||node.textContent!==caption){
   node.hidden=false;node.dataset.phase=tag;node.textContent=caption;
   if(!this.jellyReduced?.matches)node.animate(tag==='overhead'?[{opacity:.35,scale:.94},{opacity:1,scale:1}]:[{opacity:.84,scale:.78},{opacity:1,scale:1.09,offset:.53},{opacity:1,scale:1}],{duration:tag==='overhead'?210:168,easing:'cubic-bezier(.2,.8,.25,1)'});
  }
 }
 snapshot(){const data=this.data,s=this.race?.cyber;return{mode:'troll',perspective:'third-person',state:this.state,level:this.level,checkpoint:this.checkpoint,time:this.clock.seconds(),deaths:this.deaths,progress:this.progressPeak,player:this.p,visualY:this.stairActor===this.p?this.stairY:this.p?.y,wrongWay:!!(this.mazeWrongWay?.visible||this.mazeTouchWarning?.hidden===false),modules:data?.modules,camera:this.camera?.position.toArray(),cyber:s?{signal:s.signal,fist:!!this.cyberArt?.fist.visible,fistSide:s.strike?.side,feint:s.signalFeint,bank:s.seqBank,flash:s.seqFlash,laneEffects:{warnings:this.cyberArt?.laneWarnings.count||0,fragments:this.cyberArt?.laneFragments.count||0},exitReady:this.checkpoint===1?s.seqResolved:undefined,hiddenLane:s.seqKeep>=0&&data.platforms[s.seqKeep]?.cyberHidden?s.seqKeep:undefined,retainedLane:s.seqKeep>=0?s.seqKeep:undefined,fanX:s.fanX,wind:s.wind,overhead:s.overhead,pairReveal:this.pairReveal,ice:!!(this.p?.iceAir||data.platforms[this.p?.support]?.cyberIce),iceSpeed:this.checkpoint===3?Math.max(0,-this.p.vz):undefined,launchLip:this.checkpoint===3?data.cyber.ice.lip:undefined,tiles:this.checkpoint===1?data.platforms.filter(o=>o.cyberTile!=null).map(o=>({id:o.id,x:o.x,z:o.z,visible:o.active&&!o.cyberHidden||!!o.cyberFlash,solid:o.active,warning:!!o.warning,feint:!!o.cyberFeint,breaking:o.cyberBreakAt!=null&&this.worldTime-o.cyberBreakAt<(data.cyber.sequence.breakDuration??.64)})):undefined}:undefined,traps:data?.platforms.filter(o=>o.trap).map(o=>({id:o.id,type:o.trap,x:o.x,y:o.y,z:o.z,active:o.active,revealed:o.revealed})),movingBlocks:data?.shift?data.platforms.filter(o=>o.shiftGroup).map(o=>({id:o.id,z:o.z})):undefined,hazards:data?.hazards.map(h=>({type:h.type,x:h.currentX,y:h.currentY,z:h.currentZ,radius:h.radius})),spikes:data?.spikeBoard?this.spikeTiles.filter(o=>Math.abs(o.z-this.p.z)<25).map(o=>({x:o.x+spikeOffset(o,this.worldTime),homeX:o.x,z:o.z})):undefined,controls:this.p?.iceAir?'Ice: W accelerates, S brakes, A/D steers, Space jumps; +Y up, -Z forward':s?.overhead?'WASD screen-relative, Space jump, R checkpoint, Esc pause; +Y up, -Z forward':'WASD camera-relative, Space jump, R checkpoint, Esc pause; +Y up, -Z forward'};}
}
g.ElementalTrollCameraDistance=cameraDistance;g.ElementalTrollStairDisplayY=stairDisplayY;g.ElementalTrollStairOpacity=stairOpacity;g.ElementalTrollTriggerTraps=triggerTraps;g.ElementalTrollRace=TrollRace;g.ElementalTrollRun=TrollRun;
})(window);
