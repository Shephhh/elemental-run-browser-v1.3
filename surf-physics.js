/* Surf & Bhop: fixed-step, renderer-independent kinematics. Units: metres, seconds.
 * +X forward, +Y up, +Z right. No curved-world coordinates enter this module. */
(function (scope) {
  'use strict';
  // Workshop-inspired arcade profile, NOT stock CS 1.6/CS2 values. Projection,
  // ramp sliding and friction-free takeoff retain community movement principles;
  // speed/jump/look/auto-forward are deliberately authored for Elemental Run.
  const PROFILE=Object.freeze({id:'workshop-progressive-drive-v5',gravity:23.5,jump:Math.sqrt(2*23.5*57*.029375),surfJumpSpeedScale:.84,
    runSpeed:260*.029375,maxSpeed:Infinity,accelerate:1.6,autoRunResponse:1.8,mouseAccelerate:1.4,airAccelerate:90,airWishCap:.9,runnerAirWishCap:4.5,
    friction:4,stopSpeed:75*.029375,stepSize:.42,yawLimit:Math.PI,pitchLimit:1.05});
  const DT=1/120,GRAVITY=PROFILE.gravity,JUMP=PROFILE.jump,RUN_SPEED=PROFILE.runSpeed,
    MAX_SPEED=PROFILE.maxSpeed,YAW_LIMIT=PROFILE.yawLimit,HX=.38,HY=.85,HZ=.38,SKIN=.002;
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
  function random(seed) { let s=seed>>>0;return()=>{s=(Math.imul(s,1664525)+1013904223)>>>0;return s/4294967296;}; }
  function prism(x0,x1,z0,z1,y=0,sx=0,sz=0,kind='ground',id=0) {
    const bottom=Math.min(y,y+sx*(x1-x0),y+sz*(z1-z0),y+sx*(x1-x0)+sz*(z1-z0))-3;
    const o={x0,x1,z0,z1,y,sx,sz,bottom,kind,id,axes:[]};
    const verts=[];for(const x of [x0,x1])for(const z of [z0,z1]){verts.push([x,bottom,z],[x,y+sx*(x-x0)+sz*(z-z0),z]);}
    for(const n0 of [[1,0,0],[0,1,0],[0,0,1],[-sx,1,-sz],[-sx,1,0],[0,1,-sz]]) {
      const l=Math.hypot(...n0),n=n0.map(v=>v/l);if(o.axes.some(a=>Math.abs(a.n[0]*n[0]+a.n[1]*n[1]+a.n[2]*n[2])>1-1e-12))continue;
      const p=verts.map(v=>v[0]*n[0]+v[1]*n[1]+v[2]*n[2]);
      o.axes.push({n,min:Math.min(...p),max:Math.max(...p),r:Math.abs(n[0])*HX+Math.abs(n[1])*HY+Math.abs(n[2])*HZ});
    }return o;
  }
  function centerAt(o,x){return o.center0===undefined?(o.z0+o.z1)*.5:o.center0+(o.center1-o.center0)*clamp((x-o.x0)/(o.x1-o.x0),0,1);}
  function topAt(o,x,z){if(o.authored)return scope.ElementalSurfMaps.topAt(o,x,z);return o.y+o.sx*(x-o.x0)+o.sz*(z-(o.center0===undefined?o.z0:centerAt(o,x)));}
  function ribbon(x0,x1,zA,zB,width,yA,yB,bank=0,kind='surf',id=0){
    const sx=(yB-yA)/(x1-x0),k=(zB-zA)/(x1-x0),half=width*.5;
    const o={x0,x1,z0:Math.min(zA,zB)-half,z1:Math.max(zA,zB)+half,center0:zA,center1:zB,width,y:yA,sx,sz:bank,kind,id,axes:[]};
    o.bottom=Math.min(yA,yB)-Math.abs(bank)*half-2;
    const verts=corners(o);const candidates=[[1,0,0],[0,1,0],[0,0,1],[-sx+bank*k,1,-bank],[-k,0,1],[0,-k,sx],[-sx,1,0],[0,1,-bank]];
    for(const a of candidates){const l=Math.hypot(...a);if(l<1e-9)continue;const n=a.map(v=>v/l);if(o.axes.some(v=>Math.abs(v.n[0]*n[0]+v.n[1]*n[1]+v.n[2]*n[2])>1-1e-12))continue;
      let min=Infinity,max=-Infinity;for(const v of verts){const q=v[0]*n[0]+v[1]*n[1]+v[2]*n[2];min=Math.min(min,q);max=Math.max(max,q);}o.axes.push({n,min,max});}return o;
  }
  function corners(o){const a=o.center0===undefined?o.z0:o.center0-o.width*.5,b=o.center0===undefined?o.z1:o.center0+o.width*.5,c=o.center1===undefined?o.z0:o.center1-o.width*.5,d=o.center1===undefined?o.z1:o.center1+o.width*.5;
    const top=[[o.x0,topAt(o,o.x0,a),a],[o.x1,topAt(o,o.x1,c),c],[o.x1,topAt(o,o.x1,d),d],[o.x0,topAt(o,o.x0,b),b]];
    return top.concat(top.map(p=>[p[0],o.bottom,p[2]]));}
  function routeAt(data,x){const nodes=data.route||[];let node=nodes[nodes.length-1];for(const n of nodes)if(x<=n.x1){node=n;break;}if(!node)return{x,y:10,z:0,yaw:0};
    const t=clamp((x-node.x0)/(node.x1-node.x0),0,1),offset=(node.safeOffset||0)*Math.sin(t*Math.PI),z=node.z0+(node.z1-node.z0)*t+offset;
    return{x,y:node.y0+(node.y1-node.y0)*t+(node.bank||0)*offset,z,yaw:Math.atan2(node.z1-node.z0+(node.safeOffset||0)*Math.PI*Math.cos(t*Math.PI),node.x1-node.x0),width:node.width,kind:node.kind};}
  // Continuous SAT: AABB against convex wedge, including edge-cross-axis tests.
  function halfHeight(p){return p.slide>0?.46:HY;}
  const sweepScratch={t:0,normal:[0,0,0],obstacle:null};
  function sweep(p,dx,dy,dz,o,out=null) {
    if(Math.max(p.x,p.x+dx)+HX<o.x0||Math.min(p.x,p.x+dx)-HX>o.x1||Math.max(p.z,p.z+dz)+HZ<o.z0||Math.min(p.z,p.z+dz)-HZ>o.z1)return null;
    let enter=-Infinity,exit=Infinity,normal=null,normalSign=1;const hy=halfHeight(p);
    for(const a of o.axes){const n=a.n,q=p.x*n[0]+(p.y+hy)*n[1]+p.z*n[2],d=dx*n[0]+dy*n[1]+dz*n[2],r=Math.abs(n[0])*HX+Math.abs(n[1])*hy+Math.abs(n[2])*HZ;
      // Matching joined ribbons form one continuous surface. Their shared X
      // cross-section is not a wall; broadphase still bounds each actual piece.
      const xAxis=n[0]>.999999&&Math.abs(n[1])+Math.abs(n[2])<1e-8;
      const lo=xAxis&&o.joinPrev?-Infinity:a.min-r,hi=xAxis&&o.joinNext?Infinity:a.max+r;
      if(Math.abs(d)<1e-10){if(q<lo-SKIN||q>hi+SKIN)return null;continue;}
      let t0=(lo-q)/d,t1=(hi-q)/d;const sign=d>0?-1:1;if(t0>t1)[t0,t1]=[t1,t0];
      if(t0>enter){enter=t0;normal=n;normalSign=sign;}exit=Math.min(exit,t1);if(enter>exit)return null;
    }
    if(enter<-.00001||enter>1||exit<0||!normal)return null;
    const hit=out||{normal:[0,0,0]};hit.t=Math.max(0,enter);hit.normal[0]=normal[0]*normalSign;hit.normal[1]=normal[1]*normalSign;hit.normal[2]=normal[2]*normalSign;hit.obstacle=o;return hit;
  }
  function createPlayer(){return{x:4,y:10.004,z:0,vx:0,vy:0,vz:0,momentum:0,slide:0,slideCooldown:0,slideBuffer:0,strafeVelocity:0,steerYaw:0,time:0,grounded:false,surfing:false,surfFlight:false,coyote:0,jumpBuffer:0,landTime:-99,combo:0,maxCombo:0,jumps:0,contact:null,ice:0,dash:0,phase:0,slow:0,glide:false,glideTime:0,landImpact:0,cooldown:0,magnet:0,hotTime:0,coinLo:0,coinHi:0,coins:0};}
  function requestJump(p){p.jumpBuffer=.18;p.bufferImpulse=JUMP;}
  function requestSlide(p){if(p.slideCooldown<=0)p.slideBuffer=.18;}
  // Independent implementation of planar projection / projected wish-speed.
  // Steep contact is airborne, never a friction-bearing walking floor.
  function clipVelocity(p,nx,ny,nz){const d=p.vx*nx+p.vy*ny+p.vz*nz;if(d<0){p.vx-=d*nx;p.vy-=d*ny;p.vz-=d*nz;}}
  // A SAT edge axis can point upwards without being an actual walking face.
  // Treating that transient ramp lip as ground applies friction on takeoff.
  function walkableContact(o,nx,ny,nz){if(ny<.7)return false;if(o.authored)return o.planes.some(a=>a.n[1]>=.7&&a.n[0]*nx+a.n[1]*ny+a.n[2]*nz>.9999);const k=((o.center1??0)-(o.center0??0))/(o.x1-o.x0),x=-o.sx+o.sz*k,z=-o.sz,l=Math.hypot(x,1,z);return 1/l>=.7&&(x*nx+ny+z*nz)/l>.9999;}
  // Source-style candidate-plane / crease resolution. Repeatedly projecting
  // an already clipped vector onto all planes artificially drains tangent
  // momentum at curved ramp seams. Solve from the same incoming vector instead.
  function resolveClipPlanes(p,vx,vy,vz,count){let found=false,cx=0,cy=0,cz=0;for(let i=0;i<count;i++){const nx=clipPlanes[i*3],ny=clipPlanes[i*3+1],nz=clipPlanes[i*3+2],d=Math.min(0,vx*nx+vy*ny+vz*nz);cx=vx-d*nx;cy=vy-d*ny;cz=vz-d*nz;let valid=true;for(let j=0;j<count;j++)if(cx*clipPlanes[j*3]+cy*clipPlanes[j*3+1]+cz*clipPlanes[j*3+2]<-1e-7){valid=false;break;}if(valid){found=true;break;}}
    if(!found&&count===2){const ax=clipPlanes[0],ay=clipPlanes[1],az=clipPlanes[2],bx=clipPlanes[3],by=clipPlanes[4],bz=clipPlanes[5],x=ay*bz-az*by,y=az*bx-ax*bz,z=ax*by-ay*bx,l=x*x+y*y+z*z;if(l>1e-12){const along=(vx*x+vy*y+vz*z)/l;cx=x*along;cy=y*along;cz=z*along;found=true;}}
    if(!found||cx*vx+cy*vy+cz*vz<=0){p.vx=p.vy=p.vz=0;}else{p.vx=cx;p.vy=cy;p.vz=cz;}}
  function airAccelerate(p,wx,wz,dt){
    const speed=Math.hypot(wx,wz);if(speed<1e-9)return;wx/=speed;wz/=speed;
    const strength=Math.min(1,speed),add=Math.min(Math.max(0,PROFILE.airWishCap*strength-p.vx*wx-p.vz*wz),PROFILE.airAccelerate*RUN_SPEED*strength*dt);
    p.vx+=wx*add;p.vz+=wz*add;
  }
  const moveScratch={floor:null,ramp:null,nx:0,ny:1,nz:0},clipPlanes=new Float64Array(15);
  // Strict SAT overlap for the prospective standing body. Contact alone is
  // not overlap. Used only on a candidate step, never on every simulation tick.
  function bodyBlocked(p,x,y,z,solids){const hy=halfHeight(p);for(const o of solids){if(x+HX<=o.x0||x-HX>=o.x1||z+HZ<=o.z0||z-HZ>=o.z1||y>=o.top+.001||y+hy*2<=o.bottom)continue;let overlap=true;for(const a of o.axes){const n=a.n,q=x*n[0]+(y+hy)*n[1]+z*n[2],r=Math.abs(n[0])*HX+Math.abs(n[1])*hy+Math.abs(n[2])*HZ;if(q<=a.min-r+.001||q>=a.max+r-.001){overlap=false;break;}}if(overlap)return true;}return false;}
  function move(p,solids,dt){let remain=dt,count=0,originalX=p.vx,originalY=p.vy,originalZ=p.vz;const result=moveScratch;result.floor=result.ramp=null;
    for(let i=0;i<5&&remain>1e-7;i++){
      const dx=p.vx*remain,dy=p.vy*remain,dz=p.vz*remain;
      let time=Infinity,nx=0,ny=0,nz=0,obstacle=null;
      for(const o of solids){const h=sweep(p,dx,dy,dz,o,sweepScratch);if(h&&(h.t<time-1e-8||Math.abs(h.t-time)<=1e-8&&h.normal[1]>ny)){time=h.t;nx=h.normal[0];ny=h.normal[1];nz=h.normal[2];obstacle=o;}}
      if(!obstacle){p.x+=dx;p.y+=dy;p.z+=dz;break;}
      p.x+=dx*time;p.y+=dy*time;p.z+=dz*time;
      // A closed convex brush has an end cap even when the next brush is a
      // continuation of the same surf plane. Its lateral SAT axis must not
      // erase all tangential speed at that seam. Only a currently supported,
      // near-coplanar receiving ramp and clear full body may accept an 8cm lip.
      const seam=obstacle.authored&&obstacle.kind==='surf'&&p.surfing&&p.contact&&obstacle!==p.contact&&ny<.2?obstacle.planes.find(a=>a.n[1]>.05&&a.n[1]<.7&&a.n[0]*(p.surfaceNX||0)+a.n[1]*(p.surfaceNY||1)+a.n[2]*(p.surfaceNZ||0)>.985):null;
      if((p.grounded||p.vy<=0||seam)&&ny<.2&&(obstacle.kind!=='surf'||seam)){
        const o=obstacle,k=((o.center1??0)-(o.center0??0))/(o.x1-o.x0),rise=seam?(seam.d-seam.n[0]*p.x-seam.n[2]*p.z+Math.abs(seam.n[0])*HX+Math.abs(seam.n[2])*HZ)/seam.n[1]-p.y:topAt(o,p.x,p.z)+Math.abs(o.sx-o.sz*k)*HX+Math.abs(o.sz)*HZ-p.y;
        // A descending foot can graze an 8cm lip between landing surfaces.
        // Do not erase forward momentum for that sub-foot-height seam. Walls,
        // deep misses, upward flight and blocked headroom still collide.
        const limit=seam?.08:p.grounded?PROFILE.stepSize:.08;
        if(rise>=-SKIN*2&&rise<=limit&&!bodyBlocked(p,p.x-nx*SKIN,p.y+rise+SKIN,p.z-nz*SKIN,solids)){p.y+=rise+SKIN;p.x-=nx*SKIN;p.z-=nz*SKIN;remain*=1-time;if(seam){result.ramp=o;[result.nx,result.ny,result.nz]=seam.n;}else result.floor=o;continue;}
      }
      p.x+=nx*SKIN;p.y+=ny*SKIN;p.z+=nz*SKIN;
      const impact=-(p.vx*nx+p.vy*ny+p.vz*nz);
      const k=((obstacle.center1??0)-(obstacle.center0??0))/(obstacle.x1-obstacle.x0),tx=-obstacle.sx+obstacle.sz*k,tz=-obstacle.sz,l=Math.hypot(tx,1,tz);
      // SAT edge-cross axes are separating axes, not walking-face normals.
      // An edge with an upward SAT axis must not turn a steep ramp into ground.
      if(walkableContact(obstacle,nx,ny,nz)){result.floor=obstacle;p.landImpact=Math.max(p.landImpact,impact);}
      else if(obstacle.kind==='surf'&&ny>.05&&ny<.7){result.ramp=obstacle;result.nx=obstacle.authored?nx:tx/l;result.ny=obstacle.authored?ny:1/l;result.nz=obstacle.authored?nz:tz/l;p.landImpact=Math.max(p.landImpact,impact);}
      if(time>1e-7){count=0;originalX=p.vx;originalY=p.vy;originalZ=p.vz;}
      let duplicate=false;for(let j=0;j<count;j++)if(nx*clipPlanes[j*3]+ny*clipPlanes[j*3+1]+nz*clipPlanes[j*3+2]>.999999)duplicate=true;
      if(!duplicate&&count<5){clipPlanes[count*3]=nx;clipPlanes[count*3+1]=ny;clipPlanes[count*3+2]=nz;count++;}
      resolveClipPlanes(p,originalX,originalY,originalZ,count);
      remain*=1-time;
    }return result;
  }
  function step(p,input,solids,dt=DT){
    p.time+=dt;p.landImpact=0;if(p.allowSlide===false)p.slide=p.slideBuffer=p.slideCooldown=0;for(const key of ['vx','vy','vz'])if(!Number.isFinite(p[key]))p[key]=0;p.jumpBuffer=Math.max(0,p.jumpBuffer-dt);p.coyote=Math.max(0,p.coyote-dt);
    p.slide=Math.max(0,(p.slide||0)-dt);p.slideCooldown=Math.max(0,(p.slideCooldown||0)-dt);p.slideBuffer=Math.max(0,(p.slideBuffer||0)-dt);
    if(p.allowSlide!==false&&p.slideBuffer>0&&p.slideCooldown<=0){p.slide=.72;p.slideCooldown=.94;p.slideBuffer=0;
      // Match the normal runner's .8/.85 slam/jump ratio, in metres/second.
      // Descent still uses swept collision; never teleport onto a platform.
      if(!p.grounded&&!p.surfing)p.vy=Math.min(p.vy,-JUMP*(.8/.85));}
    p.dash=Math.max(0,p.dash-dt);p.phase=Math.max(0,p.phase-dt);p.slow=Math.max(0,p.slow-dt);p.ice=Math.max(0,p.ice-dt);
    const wasGrounded=p.grounded,wasSurf=!!p.surfing&&!!p.contact,wasSupported=wasGrounded||wasSurf;let jumped=false;
    if(input.jumpHeld&&wasSupported&&p.jumpBuffer<=0&&p.authored){p.jumpBuffer=.02;p.bufferImpulse=JUMP;}
    if(input.jumpHeld&&wasSupported&&p.jumpBuffer<=0){
      // Auto-bhop may wait a few ticks if its predicted landing is inside a gap.
      // Explicit jump presses remain immediate; this only assists held-jump cadence.
      let edge=p.contact?.x1??p.x;
      // Read the connected support corridor, not a single pad. Never launch
      // an automatic hop whose recovery would land immediately before a gap.
      for(let pass=0;pass<solids.length;pass++){let changed=false;for(const o of solids){if(p.contact?.mainRoute&&!o.mainRoute)continue;const join=Math.max(o.x0,Math.min(edge,o.x1)),centre=centerAt(o,join),half=o.width===undefined?(o.z1-o.z0)*.5:o.width*.5;
        // Follow authored shared ramp seams, even when the distant edge has a
        // different elevation. An internal ribbon seam is not a takeoff edge.
        const connectedSurf=wasSurf&&o.kind==='surf'&&o.joinPrev&&Math.abs(o.x0-edge)<.02;
        if(o.x1>edge&&(connectedSurf||(o.x0<=edge+.02&&p.z>centre-half+HZ&&p.z<centre+half-HZ&&Math.abs(topAt(o,join,p.z)-p.y)<.65))){edge=o.x1;changed=true;}}if(!changed)break;}
      const remaining=edge-p.x;
      const baseHop=p.contact?.hopImpulse||JUMP,assist=p.contact?.airAssist||0;
      // Match the authored hop flight time when Sky's existing held-jump
      // descent assist is active (ascent G, descent G-assist).
      let hop=baseHop*2/(1+Math.sqrt(GRAVITY/(GRAVITY-assist)));
      const edgeWindow=wasSurf?Math.max(HX+.05,p.vx*.06):p.vx*.06;
      if(p.contact&&remaining<edgeWindow){
        // High retained momentum must not turn a short rhythm hop into an
        // unavoidable overshoot. Only held-jump assist targets the next pad;
        // explicit presses keep the full authored jump impulse.
        let next=null;for(const o of solids)if(o.mainRoute&&o.x0>edge+.02&&(!next||o.x0<next.x0))next=o;
        if(next){const target=next.x0+Math.min((next.x1-next.x0)*.5,3),k=((next.center1??0)-(next.center0??0))/(next.x1-next.x0),hull=Math.abs(next.sx-next.sz*k)*HX+Math.abs(next.sz)*HZ,rise=topAt(next,target,centerAt(next,target))+hull+SKIN-p.y;
          const takeoffVX=p.vx*(wasSurf?PROFILE.surfJumpSpeedScale:1);
          const flight=(target-p.x)/Math.max(1,takeoffVX),minImpulse=Math.sqrt(Math.max(0,2*GRAVITY*rise));
          let lo=minImpulse,hi=hop;for(let i=0;i<16&&hi>lo;i++){const v=(lo+hi)*.5,t=v/GRAVITY+Math.sqrt(Math.max(0,(v*v/GRAVITY-2*rise)/(GRAVITY-assist)));if(t<flight)lo=v;else hi=v;}
          hop=Math.min(hop,Math.max(minImpulse,hi));}
      }
      if((p.contact?.kind!=='surf'&&remaining>p.vx*(2*hop/GRAVITY)+3.5)||remaining<edgeWindow){p.jumpBuffer=.02;p.bufferImpulse=hop;}
    }
    if(p.jumpBuffer>0&&(wasSupported||p.coyote>0)){
      const perfect=p.time-p.landTime<=.14; p.slide=0;p.slideBuffer=0;p.vy=p.bufferImpulse||JUMP;p.bufferImpulse=0;p.grounded=false;p.surfing=false;p.coyote=0;p.jumpBuffer=0;p.jumps=1;jumped=true;
      // Only an accepted jump off a steep ramp spends horizontal momentum.
      // Walking/bhop jumps and extra input presses in flight do not pay this cost.
      if(wasSurf){p.vx*=PROFILE.surfJumpSpeedScale;p.vz*=PROFILE.surfJumpSpeedScale;p.momentum=Math.hypot(p.vx,p.vz);p.surfFlight=true;}
      if(perfect){p.combo++;p.maxCombo=Math.max(p.maxCombo,p.combo);}else p.combo=0;
    }
    const airborne=!p.grounded,startX=p.x,strafe=clamp(input.strafe||0,-1,1),yaw=Math.atan2(Math.sin(input.yaw||0),Math.cos(input.yaw||0));
    // yaw is already part of the rewind snapshot. Sample the input once per
    // simulation tick, not once per render frame or from the lagged body yaw.
    const lookDelta=Math.atan2(Math.sin(yaw-(Number.isFinite(p.yaw)?p.yaw:yaw)),Math.cos(yaw-(Number.isFinite(p.yaw)?p.yaw:yaw)));p.yaw=yaw;
    const surfing=wasSurf&&!jumped,inertial=surfing||p.surfFlight;
    const fx=Math.cos(yaw),fz=Math.sin(yaw),fl=Math.hypot(fx,fz),nx=fx/fl,nz=fz/fl;
    const oldStrafe=p.strafeVelocity||0;let motionYaw=yaw;
    if(inertial){
      // Surf uses the camera's horizontal RIGHT vector, not world-Z or pitch.
      // Input accelerates; collision projects it. Never rotate/replace momentum.
      airAccelerate(p,-Math.sin(yaw)*strafe,Math.cos(yaw)*strafe,dt);
      p.strafeVelocity=0;p.surfFlight=true;
    }else{
      // Preserve Elemental Run's established responsive controls off surf.
      if(!airborne){const speed=Math.hypot(p.vx,p.vz),friction=p.ice>0?.18:PROFILE.friction;
        // Auto-run has a continuously held drive. Damp excess momentum, not
        // the startup speed: otherwise a softer drive can never reach RUN_SPEED.
        const scale=speed>0?Math.max(0,speed-Math.max(0,speed-RUN_SPEED)*friction*dt)/speed:0;p.vx*=scale;p.vz*=scale;}
      // Remove yesterday's lateral component in yesterday's camera frame.
      // Subtracting it from world Z (or the newly rotated frame) drained the
      // forward speed on every air-strafe tick, especially around 0/90 degrees.
      const previousYaw=p.steerYaw||0,baseVX=p.vx+Math.sin(previousYaw)*oldStrafe,baseVZ=p.vz-Math.cos(previousYaw)*oldStrafe;
      const prior=Number.isFinite(p.momentum)?p.momentum:Math.hypot(baseVX,baseVZ);
      const baseSpeed=Math.hypot(baseVX,baseVZ);p.momentum=Math.min(MAX_SPEED,baseSpeed<RUN_SPEED?baseSpeed+(RUN_SPEED-baseSpeed)*(1-Math.exp(-PROFILE.autoRunResponse*dt)):baseSpeed);
      // Velocity turns over time rather than snapping with the camera: the body
      // carries weight, while air-strafe inputs remain camera-relative.
      motionYaw=previousYaw+Math.atan2(Math.sin(yaw-previousYaw),Math.cos(yaw-previousYaw))*(1-Math.exp(-(airborne?8:13)*dt));
      const rate=p.ice>0?2.5:strafe?12:16;
      p.strafeVelocity=oldStrafe+(strafe*Math.min(RUN_SPEED,p.momentum)*.24-oldStrafe)*(1-Math.exp(-rate*dt));
      const yawChange=Math.atan2(Math.sin(yaw-(p.steerYaw||0)),Math.cos(yaw-(p.steerYaw||0)));
      if(airborne&&p.allowSlide===false&&p.authored){
        // Keyboardless auto-strafe for our mandatory auto-run controls. Infer
        // A/D from a smooth mouse turn, then use Source's projected-wish-speed
        // budget. This is NOT a bonus per mouse event/pixel. A stationary view,
        // ground turning, opposite A/D and instant 180-degree flicks earn none.
        const signedRate=Number.isFinite(input.turnRate)?input.turnRate:lookDelta/Math.max(1e-6,dt),turnRate=Math.abs(signedRate),side=Math.sign(signedRate),speed=Math.hypot(baseVX,baseVZ);
        if(turnRate>.035&&turnRate<4&&speed>.1&&(!strafe||strafe*side>0)){
          const strength=Math.min(1,(turnRate-.035)/.8)*Math.min(1,(4-turnRate)/1.2),wishCap=39*.029375,
            acceleration=Math.min(wishCap,RUN_SPEED*PROFILE.mouseAccelerate*dt*strength),projection=Math.max(0,wishCap-acceleration),
            along=Math.min(1,projection/speed),across=Math.sqrt(Math.max(0,1-along*along)),
            wx=baseVX/speed*along-baseVZ/speed*across*side,wz=baseVZ/speed*along+baseVX/speed*across*side,
            add=Math.min(acceleration,Math.max(0,wishCap-baseVX*wx-baseVZ*wz));
          p.momentum=Math.max(p.momentum,Math.hypot(baseVX+add*wx,baseVZ+add*wz));
        }
      }else if(airborne&&strafe&&yawChange*strafe>1e-6){const wx=-Math.sin(yaw)*strafe,wz=Math.cos(yaw)*strafe,
        add=Math.min(Math.max(0,PROFILE.runnerAirWishCap-p.vx*wx-p.vz*wz),PROFILE.airAccelerate*RUN_SPEED*dt);
        p.momentum=Math.min(MAX_SPEED,prior+PROFILE.accelerate*dt,Math.max(p.momentum,Math.hypot(baseVX+add*wx,baseVZ+add*wz)));}
      p.vx=Math.cos(motionYaw)*p.momentum-Math.sin(motionYaw)*p.strafeVelocity;p.vz=Math.sin(motionYaw)*p.momentum+Math.cos(motionYaw)*p.strafeVelocity;
    }
    p.steerYaw=motionYaw;
    const horizontal=Math.hypot(p.vx,p.vz);if(horizontal>MAX_SPEED){p.vx*=MAX_SPEED/horizontal;p.vz*=MAX_SPEED/horizontal;}
    const gliding=!surfing&&p.glide&&input.jumpHeld&&p.slide<=0&&(p.glideTime||0)<4;
    if(gliding)p.glideTime=Math.min(4,(p.glideTime||0)+dt);
    const gravity=p.slide>0?GRAVITY:p.dash<=0?GRAVITY*(gliding&&p.vy<0?.23:1):0;
    p.vy-=gravity*dt*.5;if(gliding)p.vy=Math.max(p.vy,-4);
    if(surfing&&p.contact.authored){clipVelocity(p,p.surfaceNX||0,p.surfaceNY||1,p.surfaceNZ||0);}
    else if(surfing){const o=p.contact,k=((o.center1??0)-(o.center0??0))/(o.x1-o.x0),nx=-o.sx+o.sz*k,nz=-o.sz,l=Math.hypot(nx,1,nz);clipVelocity(p,nx/l,1/l,nz/l);}
    const beforeVy=p.vy,result=move(p,solids,dt);let floor=result.floor,ramp=result.ramp,rnx=result.nx,rny=result.ny,rnz=result.nz;
    // Skin-sized contact query, not a magnet. Uphill tangential movement can
    // still touch a steep ramp; positive VY alone is not a jump/leave test.
    if(!floor&&!ramp&&!jumped&&(p.vy<=0||wasSupported)){
      let distance=Infinity,nx=0,ny=0,nz=0,support=null;
      for(const o of solids){const k=((o.center1??0)-(o.center0??0))/(o.x1-o.x0),descent=-(o.sx*p.vx+o.sz*(p.vz-k*p.vx))*dt;
        const probe=wasGrounded&&o.kind!=='surf'?clamp(Math.max(0,descent)+.012,.012,.25):.012;
        const h=sweep(p,0,-probe,0,o,sweepScratch);
        if(h&&(walkableContact(o,...h.normal)||(o.kind==='surf'&&h.normal[1]>.05&&h.normal[1]<.7))&&h.t*probe<distance){distance=h.t*probe;nx=h.normal[0];ny=h.normal[1];nz=h.normal[2];support=o;}}
      if(support){p.y-=distance;p.y+=SKIN;clipVelocity(p,nx,ny,nz);
        const k=((support.center1??0)-(support.center0??0))/(support.x1-support.x0),tx=-support.sx+support.sz*k,tz=-support.sz,l=Math.hypot(tx,1,tz),steep=support.kind==='surf'&&(support.authored?ny<.7:1/l<.7);
        if(walkableContact(support,nx,ny,nz))floor=support;else{ramp=support;rnx=support.authored?nx:tx/l;rny=support.authored?ny:1/l;rnz=support.authored?nz:tz/l;}}
    }
    p.vy-=gravity*dt*.5;if(gliding)p.vy=Math.max(p.vy,-4);
    if(ramp&&!floor)clipVelocity(p,rnx,rny,rnz);
    p.grounded=!!floor;p.surfing=!!ramp&&!floor;p.contact=floor||ramp;if(ramp){p.surfaceNX=rnx;p.surfaceNY=rny;p.surfaceNZ=rnz;}
    if(floor){p.glideTime=0;p.surfFlight=false;p.coyote=.14;p.jumps=0;if(!wasSupported){p.landTime=p.time;p.landImpact=Math.max(p.landImpact,-beforeVy);}if(floor.kind==='ice')p.ice=1.2;}
    else if(ramp){p.glideTime=0;p.surfFlight=true;p.coyote=0;p.jumps=0;}
    if(!p.grounded&&wasGrounded&&p.vy<=0&&!ramp)p.coyote=.14;
    if(inertial||ramp)p.momentum=Math.min(MAX_SPEED,Math.hypot(p.vx,p.vz));
    // World -X is a valid forward direction on an authored room/return route.
    p.vx=clamp(p.vx,-MAX_SPEED,MAX_SPEED);p.vz=clamp(p.vz,-MAX_SPEED,MAX_SPEED);
    return p;
  }
  function solidsAt(data,x){return data.bins?.get(Math.floor((x-data.start)/64))||data.solids;}
  function terrainHeight(data,x){return data.terrainY??0;}
  function hazardPose(h,time){if(h.type==='wall')return{x:h.x,y:h.y,z:h.z,warning:false,active:true};const t=((time+h.offset)%h.period+h.period)%h.period;let lift=10;
    if(t<h.warning)lift=10;else if(t<h.warning+.32)lift=10*(1-(t-h.warning)/.32);
    else if(t<h.warning+1.35)lift=0;else if(t<h.warning+1.8)lift=10*(t-h.warning-1.35)/.45;
    return{x:h.x,y:h.y+Math.max(0,Math.min(10,lift)),z:h.z,warning:t<h.warning,active:t>=h.warning&&t<h.warning+1.8};
  }
  function hazardHit(previous,p,h,t0,t1){
    if(Math.max(previous.x,p.x)+HX<h.x-h.width/2||Math.min(previous.x,p.x)-HX>h.x+h.width/2||Math.max(previous.z,p.z)+HZ<h.z-h.depth/2||Math.min(previous.z,p.z)-HZ>h.z+h.depth/2)return false;
    const a=hazardPose(h,t0),b=hazardPose(h,t1);let enter=0,exit=1;const hy=halfHeight(p);
    for(const [key,half,offset]of [['x',HX+h.width/2,0],['y',hy+h.height/2,hy],['z',HZ+h.depth/2,0]]){
      const centreOffset=key==='y'?h.height/2:0,q=previous[key]+offset-a[key]-centreOffset,d=p[key]-previous[key]-(b[key]-a[key]);
      if(Math.abs(d)<1e-10){if(Math.abs(q)>half)return false;continue;}
      let lo=(-half-q)/d,hi=(half-q)/d;if(lo>hi)[lo,hi]=[hi,lo];enter=Math.max(enter,lo);exit=Math.min(exit,hi);if(enter>exit)return false;
    }return enter<=1&&exit>=0;
  }
  const HISTORY_KEYS=['x','y','z','vx','vy','vz','time','combo','jumps','grounded','coyote','ice','landTime','dash','phase','slow','jumpBuffer','cooldown','magnet','hotTime','coinLo','coinHi','coins','maxCombo','yaw','pitch','strafeVelocity','steerYaw','momentum','slide','slideCooldown','slideBuffer','bufferImpulse','surfing','surfFlight','glideTime'];
  class History{
    constructor(){this.size=151;this.width=HISTORY_KEYS.length;this.data=new Float64Array(this.size*this.width);this.count=0;this.head=0;}
    clear(){this.count=0;this.head=0;}
    push(p){const a=this.data,i=this.head*this.width;for(let k=0;k<this.width;k++)a[i+k]=Number(p[HISTORY_KEYS[k]])||0;this.head=(this.head+1)%this.size;this.count=Math.min(this.size,this.count+1);}
    read(age,out){if(!this.count)return false;const f=clamp(age*60,0,this.count-1),a=Math.floor(f),b=Math.min(this.count-1,a+1),t=f-a;
      const i=((this.head-1-a+this.size)%this.size)*this.width,j=((this.head-1-b+this.size)%this.size)*this.width;
      const discrete=t<.5?i:j;for(let k=0;k<this.width;k++)out[HISTORY_KEYS[k]]=k<7?this.data[i+k]*(1-t)+this.data[j+k]*t:this.data[discrete+k];out.grounded=!!out.grounded;out.surfing=!!out.surfing;out.surfFlight=!!out.surfFlight;return true;
    }
  }
  // Read-only SAT contact query; swept movement and history remain untouched.
  function touchingKind(p,solids,kind){const hy=halfHeight(p),epsilon=SKIN*2;
    for(const o of solids){if(o.kind!==kind||p.x+HX<o.x0-epsilon||p.x-HX>o.x1+epsilon||p.z+HZ<o.z0-epsilon||p.z-HZ>o.z1+epsilon)continue;
      let touch=true;for(const a of o.axes){const n=a.n,q=p.x*n[0]+(p.y+hy)*n[1]+p.z*n[2],r=Math.abs(n[0])*HX+Math.abs(n[1])*hy+Math.abs(n[2])*HZ;
        if(q+r<a.min-epsilon||q-r>a.max+epsilon){touch=false;break;}}
      if(touch)return true;
    }return false;
  }
  // Authored courses are loaded exclusively by surf-maps.js.
  const api={PROFILE,DT,GRAVITY,JUMP,RUN_SPEED,MAX_SPEED,YAW_LIMIT,HX,HY,HZ,clamp,random,prism,ribbon,corners,centerAt,topAt,routeAt,solidsAt,sweep,createPlayer,requestJump,requestSlide,halfHeight,clipVelocity,airAccelerate,step,terrainHeight,hazardPose,hazardHit,touchingKind,HISTORY_KEYS,History};
  scope.ElementalSurfPhysics=api;if(typeof module!=='undefined'&&module.exports)module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
