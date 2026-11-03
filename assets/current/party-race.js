/* Fixed-step solo rounds: chase race, survival, collapse and hunt. */
(function(g){'use strict';const C=g.ElementalObbyCourse;
class PartyRace{
 constructor(data){
  this.data=data;this.countdown=3;this.time=0;this.over=false;this.started=false;this.elapsed=0;this.collected=0;this.failure=null;
  this.intro={duration:data.introDuration||0,remaining:data.introDuration||0,time:0};
  this.chase={enabled:data.kind==='race',lead:data.chaseLead||105,speed:data.chaseSpeed||8.3,z:0,gap:data.chaseLead||105,pressure:0};this.chase.z=this.chase.lead+20;data.eraseZ=Infinity;
  for(const p of data.platforms){p.consumed=false;if(p.type==='crumble')p.touchAt=null;}
  for(const h of data.hazards)h.consumed=false;
  for(const c of data.collectibles||[])c.collected=false;
  C.pose(data,0);
  this.player={p:C.player(data.checkpoints[0]),checkpoint:0,finished:false,falls:0,respawn:0};
 }
 progress(){
  const r=this.player,cps=this.data.checkpoints;if(r.finished)return 1;
  if(this.data.kind==='hunt')return Math.min(1,this.collected/this.data.target);
  if(this.data.kind!=='race')return Math.min(1,this.elapsed/this.data.duration);
  const a=cps[r.checkpoint],b=cps[r.checkpoint+1];if(!b)return 1;
  const dx=b.x-a.x,dz=b.z-a.z,len=Math.hypot(dx,dz),t=Math.max(0,Math.min(.999,((r.p.x-a.x)*dx+(r.p.z-a.z)*dz)/(len*len)));
  return(a.distance+len*t)/this.data.length;
 }
 respawn(r=this.player){const cp=this.data.checkpoints[r.checkpoint];if(this.chase.enabled&&cp.z>this.chase.z-2){this.fail('caught');return;}r.p=C.player(cp);r.respawn=0;}
 fail(reason){this.failure=reason;this.over=true;this.player.p.dead=true;this.player.respawn=0;}
 win(){this.player.finished=true;this.over=true;}
 step(input){
  if(this.over)return;const dt=C.DT;this.time+=dt;C.pose(this.data,this.time);
  // The visible wall must travel during BOTH the reveal and 3-2-1, not freeze
  // for the entire countdown. This motion never consumes the starting deck.
  if(this.intro.remaining>0||this.countdown>0)this.chase.z=this.chase.lead+20*Math.max(0,1-this.time/(this.intro.duration+3));
  if(this.intro.remaining>0){this.intro.remaining=Math.max(0,this.intro.remaining-dt);this.intro.time=this.intro.duration-this.intro.remaining;return;}
  if(this.countdown>0){this.countdown=Math.max(0,this.countdown-dt);if(!this.countdown)this.started=true;return;}
  this.elapsed+=dt;
  if(this.chase.enabled){
   // Fixed world-speed threat, never rubber-bands to or pushes the player.
   const t=Math.max(0,this.elapsed-.25),ramp=20,v0=this.chase.speed*.78,acc=(this.chase.speed-v0)/ramp,u=Math.min(t,ramp);
   this.chase.z=this.chase.lead-(v0*u+.5*acc*u*u+Math.max(0,t-ramp)*this.chase.speed);this.data.eraseZ=this.chase.z;
   for(const o of this.data.platforms)if(!o.consumed&&o.z-o.d/2>this.chase.z){o.consumed=true;o.active=false;}
   for(const h of this.data.hazards)h.consumed=h.consumed||(h.currentZ??h.z)-Math.max(2,(h.length||0)/2)>this.chase.z;
  }
  const r=this.player;if(r.respawn>0){r.respawn-=dt;if(r.respawn<=0)this.respawn(r);return;}
  const beforeX=r.p.x,beforeY=r.p.y,beforeZ=r.p.z;
  C.step(r.p,input,this.data);const p=r.p,last=this.data.checkpoints.length-1;
  if(this.chase.enabled){this.chase.gap=this.chase.z-p.z;this.chase.pressure=Math.max(0,Math.min(1,1-(this.chase.gap-2)/42));if(this.chase.gap<.45){this.fail('caught');return;}}
  const fell=p.dead||p.y<(this.data.fallY??.2)||Math.abs(p.x)>this.data.bounds.x||p.z>this.data.bounds.maxZ||p.z<this.data.bounds.minZ;
  if(fell){r.falls++;if(this.data.kind==='survival'||this.data.kind==='collapse'){this.fail('fall');return;}this.elapsed+=this.data.fallPenalty||0;if(this.data.kind==='hunt'&&this.elapsed>=this.data.duration){this.fail('time');return;}r.respawn=.45;p.tumble=.45;return;}
  if(this.data.kind==='hunt'){
   if(this.elapsed>=this.data.duration){this.fail('time');return;}
   for(const c of this.data.collectibles)if(!c.collected&&Math.hypot(p.x-c.x,p.z-c.z)<1.4&&p.y<c.y+1&&p.y+C.H>c.y-1){c.collected=true;this.collected++;p.collected=true;}
   if(this.collected>=this.data.target)this.win();else if(this.elapsed>=this.data.duration)this.fail('time');return;
  }
  if(this.data.kind==='survival'||this.data.kind==='collapse'){if(this.elapsed>=this.data.duration)this.win();return;}
  // Swept gates cover the actual approach, not a tiny grounded-only volume.
  // A legitimate jump/dive through the drawn finish line must qualify too.
  while(r.checkpoint<last){
   const cp=this.data.checkpoints[r.checkpoint+1],finish=r.checkpoint+1===last,line=cp.z-(finish?2.25:0),dz=p.z-beforeZ;
   const swept=dz<0&&beforeZ>=line&&p.z<=line,t=swept?(line-beforeZ)/dz:1,x=beforeX+(p.x-beforeX)*t,y=beforeY+(p.y-beforeY)*t;
   const near=p.z<=line&&p.z>=line-5&&beforeZ>=line-5;
   let lo=cp.x-cp.w/2,hi=cp.x+cp.w/2;
   for(const o of this.data.platforms)if(Math.abs(o.baseZ-line)<o.d/2+2&&Math.abs(o.baseY-cp.y)<3){lo=Math.min(lo,o.baseX-o.w/2);hi=Math.max(hi,o.baseX+o.w/2);}
   if(!(swept||near)||x<lo-C.R||x>hi+C.R||y<cp.y-1||y>cp.y+25)break;
   r.checkpoint++;if(r.checkpoint===last){this.win();break;}
  }
 }
 get qualified(){return this.player.finished;}
}
g.ElementalPartyRace=PartyRace;if(typeof module!=='undefined')module.exports=PartyRace;
})(typeof window!=='undefined'?window:globalThis);
