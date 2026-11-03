/* Obby obstacle kit: reusable rounded shells, readable pads and animated machinery. */
(function(g){'use strict';
class ObbyArt{
 constructor(T,data,own){
  this.T=T;this.data=data;this.own=own;this.root=new T.Group();this.dummy=new T.Object3D();this.tint=new T.Color();this.white=new T.Color(0xffffff);this.warningTint=new T.Color(0xeb9c55);this.actors=[];this.solids=[];
  // Explicit edge loops keep bevel width constant even on a 20m platform.
  // Uniformly subdivided/scaled cubes stretched a tiny bevel into a flat slab.
  const geoCache=new Map(),rounded=(w,h,d,r=.15)=>{const key=[w,h,d,r].join('/');if(geoCache.has(key))return geoCache.get(key);const half=[w/2,h/2,d/2];r=Math.max(.001,Math.min(r,...half.map(v=>v-.001)));const p=[],n=[],uv=[],v=new T.Vector3();
   const hero=r>=.15&&Math.max(w,h,d)<=4,steps=half.map(a=>hero?[-a,-a+r*.3,-a+r,a-r,a-r*.3,a]:[-a,-a+r,a-r,a]);
   const vertex=(axis,sign,u,z)=>{const a=[0,0,0];a[axis]=half[axis]*sign;a[(axis+1)%3]=u;a[(axis+2)%3]=z;const core=a.map((b,i)=>Math.max(-half[i]+r,Math.min(half[i]-r,b)));v.set(a[0]-core[0],a[1]-core[1],a[2]-core[2]).normalize();p.push(core[0]+v.x*r,core[1]+v.y*r,core[2]+v.z*r);n.push(v.x,v.y,v.z);uv.push(u,z);};
   for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){const a=steps[(axis+1)%3],b=steps[(axis+2)%3];for(let i=0;i<a.length-1;i++)for(let j=0;j<b.length-1;j++){const q=[[a[i],b[j]],[a[i+1],b[j]],[a[i+1],b[j+1]],[a[i],b[j+1]]];for(const k of sign>0?[0,1,2,0,2,3]:[0,2,1,0,3,2])vertex(axis,sign,...q[k]);}}
   const geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(n,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.computeBoundingSphere();geoCache.set(key,geo);return geo;};
  this.unit=rounded(1,1,1,.045);this.metal=own(new T.MeshStandardMaterial({color:0x405768,roughness:.43,metalness:.42}));
  this.plastic=own(new T.MeshStandardMaterial({color:0xf5eee1,roughness:.54,metalness:.035}));
  this.gold=own(new T.MeshStandardMaterial({color:0xe2bb72,roughness:.46,metalness:.32}));
  this.red=own(new T.MeshStandardMaterial({color:0xd85a61,roughness:.44,metalness:.025}));this.dark=own(new T.MeshStandardMaterial({color:0x20374b,roughness:.61}));
  this.foam=own(new T.MeshStandardMaterial({color:new T.Color(data.theme.color).lerp(new T.Color(0x466278),.24),roughness:.86,metalness:.015}));
  const softTrim=this.softTrim=own(new T.MeshStandardMaterial({color:0xffe6a8,roughness:.78,metalness:.015}));
  const batch=(geo,mat,n)=>{const m=own(new T.InstancedMesh(geo,mat,n));m.instanceMatrix.setUsage(T.DynamicDrawUsage);m.frustumCulled=false;this.root.add(m);return m;},n=data.platforms.length;
  this.bases=batch(this.unit,this.foam,n);this.rims=batch(this.unit,this.plastic,n);this.tops=batch(this.unit,this.plastic,n);
  // Soft tread microdetail in world units: no stretched bitmap or extra texture fetch.
  const tread=own(this.plastic.clone());tread.roughness=.61;tread.metalness=.025;
  tread.onBeforeCompile=s=>{
   s.vertexShader='varying vec3 vPartySurface;\n'+s.vertexShader;
   s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 partyP=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\npartyP=instanceMatrix*partyP;\n#endif\nvPartySurface=(modelMatrix*partyP).xyz;');
   s.fragmentShader='varying vec3 vPartySurface;\n'+s.fragmentShader;
   s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>','#include <color_fragment>\nvec2 q=vPartySurface.xz;vec2 fw=max(fwidth(q),vec2(.001));vec2 panel=abs(fract((q+vec2(.31,.73))/3.6)-.5)*3.6;float seam=1.-smoothstep(.012,.012+max(fw.x,fw.y),min(panel.x,panel.y));float quilt=pow(max(0.,sin(q.x*.87266)*sin(q.y*.87266)),2.);float weave=sin(q.x*145.)*sin(q.y*145.)/(1.+dot(fw,vec2(220.)));float grain=sin(dot(floor(q*40.),vec2(12.9898,78.233)))*.008;diffuseColor.rgb*=1.-seam*.075-quilt*.035+weave*.012+grain;');
   s.fragmentShader=s.fragmentShader.replace('#include <normal_fragment_begin>','#include <normal_fragment_begin>\nfloat relief=sin(vPartySurface.x*1.7453)*sin(vPartySurface.z*1.7453)*.012;vec3 px=dFdx(-vViewPosition),py=dFdy(-vViewPosition);vec3 rx=cross(py,normal),ry=cross(normal,px);float det=dot(px,rx);normal=normalize(abs(det)*normal-sign(det)*(dFdx(relief)*rx+dFdy(relief)*ry));');
   if(data.theme.phase===5)s.fragmentShader=s.fragmentShader.replace('seam*.075-quilt*.035','0.');
  };tread.customProgramCacheKey=()=> 'party-quilted-satin-161-'+data.theme.phase;this.tops.material=tread;
  const round=own(new T.CylinderGeometry(.5,.5,1,32));
  this.roundBases=batch(round,this.foam,n);this.roundRims=batch(round,this.plastic,n);this.roundTops=batch(round,tread,n);
  this.trims=batch(this.unit,softTrim,n*4);this.vents=batch(this.unit,this.foam,n*4);
  this.bolts=batch(own(new T.CylinderGeometry(.08,.09,.045,7)),this.gold,n*4);
  const arrow=own(new T.BufferGeometry());arrow.setAttribute('position',new T.Float32BufferAttribute([-.32,0,.25,0,0,-.3,.32,0,.25,.17,0,.25,0,0,-.03,-.17,0,.25],3));arrow.computeVertexNormals();
  this.markers=batch(arrow,own(new T.MeshBasicMaterial({color:0x294b59,side:T.DoubleSide})),n*3);
  this.solids.push(this.bases);
  // Three instanced batches for the entire exposed side perimeter. End faces
  // stay open for jumps; these coordinates are also the physics rail AABBs.
  const lineUnit=own(new T.BoxGeometry(1,1,1)),rails=data.rails||[],posts=rails.reduce((n,r)=>n+Math.max(2,Math.ceil(r.d/3)+1),0);
  if(rails.length){
   const tops=batch(lineUnit,this.gold,rails.length),mids=batch(lineUnit,this.plastic,rails.length),uprights=batch(lineUnit,this.metal,posts*2);let pi=0;this.guardrails={tops,mids,uprights,segments:rails.length,moving:[]};
   for(const [i,r]of rails.entries()){
    const count=Math.max(2,Math.ceil(r.d/3)+1),row={r,i,start:pi,count};this.railPose(row);pi+=count*2;if(r.moving)this.guardrails.moving.push(row);
   }for(const m of [tops,mids,uprights])m.instanceMatrix.needsUpdate=true;
   this.solids.push(tops,mids,uprights);
  }
  // Curved inner boundary, not four boxes buried inside the hub. Shared by
  // equal-size blade instances; collision remains the union of hub + blades.
  this.fanSets=[];const bladeGeo=(length,width,inset=0)=>{
   const pos=[],normal=[],half=width/2-inset,inner=4.625+inset,outer=length-inset,steps=18;
   const face=(a,b,c,d,n)=>{for(const p of [a,b,c,a,c,d]){pos.push(...p);normal.push(...n);}};
   for(let i=0;i<steps;i++){const v0=-half+2*half*i/steps,v1=-half+2*half*(i+1)/steps,u0=Math.sqrt(Math.max(0,inner*inner-v0*v0)),u1=Math.sqrt(Math.max(0,inner*inner-v1*v1));
    face([u0,.5,v0],[u1,.5,v1],[outer,.5,v1],[outer,.5,v0],[0,1,0]);face([u0,-.5,v0],[outer,-.5,v0],[outer,-.5,v1],[u1,-.5,v1],[0,-1,0]);face([u0,-.5,v0],[u1,-.5,v1],[u1,.5,v1],[u0,.5,v0],[-1,0,0]);
   }
   face([outer,-.5,-half],[outer,.5,-half],[outer,.5,half],[outer,-.5,half],[1,0,0]);for(const sign of [-1,1]){const v=sign*half,u=Math.sqrt(Math.max(0,inner*inner-v*v));if(sign<0)face([u,-.5,v],[u,.5,v],[outer,.5,v],[outer,-.5,v],[0,0,-1]);else face([u,-.5,v],[outer,-.5,v],[outer,.5,v],[u,.5,v],[0,0,1]);}
   const geo=own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geo.computeBoundingSphere();return geo;
  };
  const fans=data.platforms.filter(o=>o.type==='fan'),sizes=[...new Set(fans.map(o=>o.w))];for(const length of sizes){const blades=fans.filter(o=>o.w===length),geo=bladeGeo(length,6.8),topGeo=bladeGeo(length,6.8,.075);this.fanSets.push({blades,base:batch(geo,this.metal,blades.length),rim:batch(geo,this.plastic,blades.length),top:batch(topGeo,tread,blades.length)});}
  const mesh=(group,geo,mat,x,y,z,sx=1,sy=1,sz=1)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);m.scale.set(sx,sy,sz);group.add(m);return m;};
  const box=(group,w,h,d,mat,x,y,z,r=.12)=>mesh(group,rounded(w,h,d,r),mat,x,y,z);
  const cylinder=(group,r,h,mat,x,y,z)=>mesh(group,own(new T.CylinderGeometry(r,r,h,20)),mat,x,y,z);
  const foam=rounded(2.4,2,2,.25),cap=own(new T.SphereGeometry(.32,10,8));
  // White slalom walls were removed from both authoring and rendering.
  for(const h of data.hazards){
   const group=new T.Group();group.position.set(h.x,h.y,h.z);this.root.add(group);const actor={h,group};
   if(h.type==='rotor'){
    mesh(group,own(new T.TorusGeometry(h.radius+.2,.16,8,40)),this.gold,0,0,0);
    for(const side of [-1,1])box(group,.48,h.radius*2+.7,.65,this.metal,side*(h.radius+.4),0,0);
    actor.rotor=new T.Group();group.add(actor.rotor);
    for(let i=0;i<h.blades;i++){const arm=new T.Group();arm.rotation.z=i*Math.PI*2/h.blades;actor.rotor.add(arm);box(arm,h.radius-.45,h.thickness*2,.65,this.red,(h.radius+.45)/2,0,0,.2);box(arm,.18,h.thickness*1.8,.69,this.gold,h.radius-.4,0,0,.04);}
    const hub=cylinder(actor.rotor,.52,.8,this.metal,0,0,0);hub.rotation.x=Math.PI/2;mesh(group,cap,this.gold,0,0,.5);
   }else if(h.type==='swingLog'){
    const half=h.frameHalf||h.width/2+3.4,supportHeight=h.y+2.25;for(const side of [-1,1]){box(group,.4,supportHeight,.7,this.metal,side*half,.25-supportHeight/2,0);box(group,.8,.18,1.2,this.gold,side*half,-h.y-1.9,0);}
    box(group,half*2+.4,.35,.7,this.gold,0,.15,0);
    actor.chain=own(new T.InstancedMesh(own(new T.CylinderGeometry(.065,.065,1,8)),this.metal,2));group.add(actor.chain);
    actor.head=new T.Group();group.add(actor.head);const body=cylinder(actor.head,h.radius,h.width,this.red,0,0,0);body.rotation.z=Math.PI/2;
    for(let j=0;j<7;j++){const ring=mesh(actor.head,own(new T.TorusGeometry(h.radius+.01,.035,5,14)),j%2?this.gold:this.dark,-h.width/2+.25+j*(h.width-.5)/6,0,0);ring.rotation.y=Math.PI/2;}
    for(const side of [-1,1]){const face=cylinder(actor.head,h.radius*.92,.12,this.gold,side*h.width/2,0,0);face.rotation.z=Math.PI/2;}
   }else if(h.type==='shutter'){
    for(const side of [-1,1]){box(group,.6,7.5,1.1,this.metal,side*(h.width/2+.5),2,0);for(let j=0;j<5;j++)box(group,.66,.1,1.16,this.gold,side*(h.width/2+.5),-.8+j*1.25,0,.025);}
    box(group,h.width+1.6,.5,1.1,this.metal,0,5.65,0);
    actor.head=new T.Group();group.add(actor.head);box(actor.head,h.width,h.height,.55,this.red,0,0,0,.18);
    for(let j=0;j<5;j++){box(actor.head,h.width-.3,.09,.59,this.gold,0,-h.height/2+.3+j*(h.height-.6)/4,0,.025);}
    actor.lamp=mesh(group,cap,own(new T.MeshStandardMaterial({color:0x8ce3bd,emissive:0x284f42,emissiveIntensity:.8})),0,5.65,.6,.65,.65,.45);
   }else if(h.type==='popper'){
    cylinder(group,h.radius+.25,.25,this.metal,0,-.2,0);const rim=mesh(group,own(new T.TorusGeometry(h.radius+.12,.09,6,20)),this.gold,0,-.04,0);rim.rotation.x=Math.PI/2;
    actor.head=new T.Group();group.add(actor.head);cylinder(actor.head,h.radius,.5,this.red,0,0,0);cylinder(actor.head,h.radius*.82,.035,this.gold,0,.27,0);
    for(let j=0;j<6;j++){const a=j*Math.PI/3;box(actor.head,.12,.035,.6,this.dark,Math.cos(a)*.6,.295,Math.sin(a)*.6,.025).rotation.y=-a+Math.PI/2;}
    actor.shaft=cylinder(group,.55,1,this.metal,0,-.35,0);
    actor.lamp=mesh(group,cap,own(new T.MeshStandardMaterial({color:0x8ce3bd,emissive:0x284f42,emissiveIntensity:.7})),0,.12,h.radius+.16,.38,.38,.38);
   }else if(h.type==='hammer'){
    cylinder(group,.52,1.6,this.metal,0,-.2,0);cylinder(group,.8,.2,this.gold,0,-1.02,0);
    actor.rotor=new T.Group();group.add(actor.rotor);
    box(actor.rotor,.26,.3,h.length,this.metal,0,0,h.length/2);
    actor.head=new T.Group();actor.head.position.z=h.length;actor.rotor.add(actor.head);
    const head=cylinder(actor.head,h.radius,2.2,this.red,0,0,0);head.rotation.z=Math.PI/2;
    for(const s of [-1,1]){const face=cylinder(actor.head,h.radius*.9,.16,this.gold,s*1.12,0,0);face.rotation.z=Math.PI/2;}
    for(let j=0;j<4;j++)box(actor.rotor,.3,.34,.09,this.gold,0,0,.6+j*.7,.025);
   }else if(h.type==='bumper'){
    box(group,h.amplitude*2+2,.22,2.4,this.dark,0,-.85,0);box(group,h.amplitude*2+2,.08,.12,this.gold,0,-.7,0);
    actor.head=new T.Group();group.add(actor.head);
    cylinder(actor.head,h.radius,2,this.red,0,0,0);for(const y of [-.75,.75])cylinder(actor.head,h.radius+.035,.12,this.gold,0,y,0);
    cylinder(actor.head,.32,.18,this.metal,0,1.08,0);
   }else if(h.type==='roller'){
    for(const s of [-1,1]){box(group,.4,1.3,1.8,this.metal,s*(h.width/2+.3),-.05,0);mesh(group,cap,this.gold,s*(h.width/2+.3),.2,.7);}
    actor.rotor=new T.Group();group.add(actor.rotor);
    const roll=cylinder(actor.rotor,h.radius,h.width,this.red,0,0,0);roll.rotation.z=Math.PI/2;
    for(let j=0;j<9;j++){const band=mesh(actor.rotor,own(new T.TorusGeometry(h.radius+.01,.045,5,14)),j%2?this.dark:this.gold,-h.width/2+.3+j*(h.width-.6)/8,0,0);band.rotation.y=Math.PI/2;}
    for(let j=0;j<4;j++){const a=j*Math.PI/2;box(actor.rotor,h.width,.1,.1,this.gold,0,Math.cos(a)*h.radius,Math.sin(a)*h.radius,.03);}
   }else if(h.type==='flipper'){
    box(group,h.width+.5,.3,h.depth+.35,this.metal,0,-.22,0);for(const s of [-1,1])box(group,.22,.12,h.depth,this.gold,s*(h.width/2+.13),-.03,0);
    actor.rotor=new T.Group();actor.rotor.position.z=h.depth/2;group.add(actor.rotor);
    box(actor.rotor,h.width,.22,h.depth,this.red,0,0,-h.depth/2,.1);
    for(let j=0;j<4;j++)box(actor.rotor,h.width*.8,.035,.06,this.gold,0,.13,-.4-j*.7,.015);
    const hinge=cylinder(group,.19,h.width+.5,this.gold,0,-.03,h.depth/2);hinge.rotation.z=Math.PI/2;
    actor.lamp=mesh(group,cap,own(new T.MeshStandardMaterial({color:0x87d8b0,emissive:0x22583e,emissiveIntensity:.8})),0,.12,h.depth/2+.22,.45,.45,.45);
   }else if(h.type==='boost'){
    const arch=new T.Mesh(own(new T.TorusGeometry(3.3,.22,8,32,Math.PI)),this.gold);group.add(arch);arch.position.y=-1.4;
    for(const side of [-1,1]){box(group,.65,2.2,.9,this.metal,side*3.3,-.7,0);box(group,.18,1.9,.98,this.plastic,side*3.3,-.6,0);}
    for(let i=0;i<3;i++){const chevron=box(group,.15,.7,.18,this.plastic,(i-1)*.65,1.5,0);chevron.rotation.z=-.6;}
   }else if(h.type==='ball'){
    actor.ball=mesh(group,own(new T.SphereGeometry(h.radius,24,16)),this.red,0,0,0);
    for(const angle of [0,Math.PI/2]){const stripe=mesh(group,own(new T.TorusGeometry(h.radius+.005,.055,5,18)),this.gold,0,0,0);actor.ball.add(stripe);stripe.position.set(0,0,0);stripe.rotation.y=angle;}
    const hood=new T.Group();hood.position.set(h.x,h.y,h.zStart-1);this.root.add(hood);
    box(hood,2.7,.4,3,this.dark,0,1.4,0);for(const side of [-1,1])box(hood,.3,2.8,3,this.metal,side*1.3,0,0);
   }else if(h.type==='sweeper'){
    const radius=h.thickness||.4,bar=cylinder(group,radius,h.length,this.red,0,0,0);actor.armRadius=radius;bar.rotation.z=Math.PI/2;
    for(const side of [-1,1]){mesh(group,cap,this.gold,side*(h.length/2-.15),0,0,radius/.32,radius/.32,radius/.32);const collar=mesh(group,own(new T.TorusGeometry(radius+.015,.055,6,16)),this.dark,side*h.length*.24,0,0);collar.rotation.y=Math.PI/2;}
    cylinder(group,.52,.64,this.metal,0,-.32,0);cylinder(group,.72,.18,this.gold,0,-.55,0);cylinder(group,.23,.18,this.gold,0,.25,0);
    if(data.kind==='survival'&&h.y>4.5)cylinder(group,.22,h.y-3,this.metal,0,-(h.y-3)/2,0);
   }else if(h.type==='gate'){
    const panel=box(group,4,2.8,.85,this.red,0,0,0,.24);box(group,3.5,.15,.96,this.gold,0,1.05,0,.04);box(group,3.5,.15,.96,this.gold,0,-1.05,0,.04);
    for(const sy of [-1,1])box(group,.18,.7,.94,this.dark,h.side*1.2,sy*.5,0,.04);
    if(h.side<0){const frame=new T.Group();frame.position.set(h.x,h.y-h.height/2,h.z);this.root.add(frame);for(const side of [-1,1])box(frame,.45,4,.8,this.metal,side*6.5,2,0);box(frame,13.5,.45,.8,this.metal,0,4,0);actor.lamp=cylinder(frame,.2,.16,own(this.gold.clone()),0,4.28,0);for(const m of frame.children)if(m.isMesh)this.solids.push(m);}
   }else if(h.type==='pendulum'){
    const half=h.frameHalf||8.2,height=h.y+2;for(const side of [-1,1])box(group,.4,height,.65,this.metal,side*half,-height/2,0,.08);
    box(group,half*2+.4,.4,.8,this.gold,0,0,0,.1);
    actor.swing=new T.Group();group.add(actor.swing);
    cylinder(actor.swing,.1,h.length,this.metal,0,-h.length/2,0);
    actor.head=mesh(actor.swing,own(new T.SphereGeometry(h.radius,14,10)),this.red,0,-h.length,0);
    const band=mesh(actor.swing,own(new T.TorusGeometry(h.radius,.07,6,18)),this.gold,0,-h.length,0);band.rotation.x=Math.PI/2;
   }else if(h.type==='wind'){
    group.position.x=h.x+h.side*5.4;group.rotation.y=-h.side*Math.PI/2;
    // Open intake: the old opaque cylinder cap hid the moving fan blades.
    const housing=mesh(group,own(new T.CylinderGeometry(1.25,1.25,.6,20,1,true)),this.dark,0,0,-.15);housing.rotation.x=Math.PI/2;
    for(const z of [-.48,.22])mesh(group,own(new T.TorusGeometry(1.24,.1,7,20)),this.metal,0,0,z);
    actor.rotor=new T.Group();group.add(actor.rotor);
    for(let i=0;i<4;i++){const arm=new T.Group();arm.rotation.z=i*Math.PI/2;actor.rotor.add(arm);box(arm,.38,.92,.12,this.gold,0,.59,.24,.1);}
    mesh(group,cap,this.gold,0,0,.3);const stand=h.y+2;box(group,.5,stand,.7,this.metal,0,-stand/2,-.15);box(group,1.8,.3,1.8,this.metal,0,-h.y-1.85,-.15);
    actor.jet=own(new T.InstancedMesh(this.unit,own(new T.MeshBasicMaterial({color:0x92dbd5,transparent:true,opacity:.22,depthWrite:false})),6));actor.jet.frustumCulled=false;group.add(actor.jet);
   }else if(h.type==='pulse'){
    for(const side of [-1,1]){box(group,.45,3.4,.8,this.metal,side*(h.width/2+.25),.1,0,.1);box(group,.7,.25,1.1,this.gold,side*(h.width/2+.25),-1.45,0,.08);}
    box(group,h.width+1,.3,.7,this.metal,0,1.8,0,.08);
    actor.energy=own(new T.MeshBasicMaterial({color:0xec9b65,transparent:true,opacity:.8,depthWrite:false,toneMapped:false}));
    actor.beams=new T.Group();group.add(actor.beams);
    for(let i=0;i<5;i++)box(actor.beams,h.width,.08,.06,actor.energy,0,-1.2+i*.6,0,.01);
    actor.veil=mesh(group,own(new T.PlaneGeometry(h.width,h.height)),own(new T.MeshBasicMaterial({color:0xe8a36c,transparent:true,opacity:.12,side:T.DoubleSide,depthWrite:false})),0,0,0);
    const lampMaterial=own(new T.MeshStandardMaterial({color:0xecc183,emissive:0x926342,emissiveIntensity:.7,roughness:.5}));actor.lamp=cylinder(group,.25,.15,lampMaterial,0,2.02,0);
    for(const side of [-1,1])mesh(group,cap,lampMaterial,side*(h.width/2+.25),.3,.46,.65,.65,.65);
   }else if(h.type==='hurdle'){
    const bar=cylinder(group,.33,h.width,this.red,0,0,0);bar.rotation.z=Math.PI/2;
    for(const side of [-1,1]){cylinder(group,.17,.9,this.metal,side*(h.width/2+.1),0,0);mesh(group,cap,this.gold,side*(h.width/2+.1),.42,0);}
    for(const x of [-2,0,2]){const band=mesh(group,own(new T.TorusGeometry(.34,.06,5,12)),this.gold,x,0,0);band.rotation.y=Math.PI/2;}
   }else{
    actor.head=new T.Group();group.add(actor.head);mesh(actor.head,foam,this.red,0,0,0);actor.facePlate=box(actor.head,.12,1.5,1.5,this.gold,-h.side*1.22,0,0,.045);
    actor.shaft=cylinder(group,.32,3.4,this.metal,h.side*2.4,0,0);actor.shaft.rotation.z=Math.PI/2;
    for(const z of [-.65,.65])box(group,3.4,.22,.22,this.dark,h.side*2.7,-.6,z,.05);
    box(group,1.1,2.05,2.4,this.metal,h.side*4.1,0,0,.16);
   }
   // Individually authored mechanical detail. All rigid detail is merged below,
   // so bolts/grilles/padding do not become a draw call each.
   const bolt=(parent,x,y,z)=>mesh(parent,cap,this.gold,x,y,z,.26,.26,.18);
   if(h.type==='rotor'){
    mesh(group,own(new T.TorusGeometry(h.radius+.43,.065,6,40)),this.dark,0,0,.12);
    for(let j=0;j<8;j++){const a=j*Math.PI/4;bolt(group,Math.cos(a)*(h.radius+.2),Math.sin(a)*(h.radius+.2),.18);}
    for(let j=0;j<h.blades;j++){const p=new T.Group();p.rotation.z=j*Math.PI*2/h.blades;actor.rotor.add(p);box(p,h.radius*.62,.1,.025,this.dark,h.radius*.57,0,.344,.025);for(const s of [-1,1])box(p,h.radius*.60,.045,.03,this.gold,h.radius*.57,s*h.thickness*.67,.35,.02);}
    for(let j=0;j<6;j++){const a=j*Math.PI/3;bolt(actor.rotor,Math.cos(a)*.32,Math.sin(a)*.32,.43);}
   }else if(h.type==='sweeper'){
    for(let j=-3;j<=3;j++){const x=j*h.length/8,ring=mesh(group,own(new T.TorusGeometry(.255,.035,5,10)),this.dark,x,0,0);ring.rotation.y=Math.PI/2;}
    for(let j=0;j<6;j++){const a=j*Math.PI/3;bolt(group,Math.cos(a)*.48,.26,Math.sin(a)*.48);}
   }else if(h.type==='ball'){
    const belt=mesh(actor.ball,own(new T.TorusGeometry(h.radius+.008,.025,5,24)),this.dark,0,0,0);belt.rotation.x=Math.PI/2;
    for(const s of [-1,1]){const plug=mesh(actor.ball,own(new T.CylinderGeometry(.22,.22,.035,10)),this.metal,0,s*(h.radius-.01),0);for(let j=0;j<4;j++){const a=j*Math.PI/2;bolt(actor.ball,Math.cos(a)*h.radius*.7,Math.sin(a)*h.radius*.7,h.radius*.68);}}
   }else if(h.type==='pendulum'){
    for(let j=0;j<5;j++){const link=mesh(actor.swing,own(new T.TorusGeometry(.16,.045,5,9)),this.gold,0,-.35-j*(h.length-1.7)/5,0);link.rotation.y=j%2?Math.PI/2:0;}
    for(const a of [0,Math.PI/2]){const band=mesh(actor.swing,own(new T.TorusGeometry(h.radius+.01,.045,5,20)),this.dark,0,-h.length,0);band.rotation.y=a;}
    for(const side of [-1,1]){box(group,.55,.22,.9,this.gold,side*(h.frameHalf||8.2),-h.y-1.85,0,.06);for(let j=0;j<4;j++)box(group,.5,.08,.72,this.dark,side*(h.frameHalf||8.2),-1.3-j*2.2,0,.025);}
   }else if(h.type==='piston'){
    for(const y of [-.5,.5])for(const z of [-.5,.5]){box(actor.head,.04,.65,.65,this.dark,-h.side*1.295,y,z,.015);mesh(actor.head,cap,this.gold,-h.side*1.335,y*.8,z*.8,.18,.18,.18);}
    for(let j=0;j<5;j++){const collar=mesh(group,own(new T.TorusGeometry(.345,.035,5,12)),this.gold,h.side*(1.4+j*.42),0,0);collar.rotation.y=Math.PI/2;}
    for(let j=0;j<5;j++)box(group,.04,.14,1.45,this.dark,h.side*4.67,-.65+j*.32,0,.02);
   }else if(h.type==='wind'){
    for(let j=0;j<8;j++){const bar=box(group,.035,2.15,.045,this.metal,0,0,.38,.01);bar.rotation.z=j*Math.PI/8;}
    for(let j=0;j<4;j++){const a=j*Math.PI/2;bolt(group,Math.cos(a)*1.12,Math.sin(a)*1.12,.36);}
    box(group,1.3,.14,.4,this.gold,0,-5.82,-.15,.03);
   }else if(h.type==='boost'){
    for(let j=0;j<7;j++){const a=j*Math.PI/6,plate=box(group,.24,.5,.25,this.metal,Math.cos(a)*3.3,Math.sin(a)*3.3-1.4,0,.05);plate.rotation.z=a-Math.PI/2;}
    for(const side of [-1,1]){box(group,1,.28,1.4,this.gold,side*3.3,-1.65,0,.1);for(let j=0;j<4;j++)bolt(group,side*3.3,-1.25+j*.35,.48);}
   }else if(h.type==='hurdle'){
    for(const side of [-1,1]){box(group,.72,.16,.85,this.metal,side*(h.width/2+.1),-.43,0,.06);bolt(group,side*(h.width/2+.1),.24,.22);}
    for(let j=-2;j<=2;j++)box(group,.045,.36,.04,this.dark,j*h.width/6,0,.315,.015);
   }else if(h.type==='gate'){
    for(const x of [-1.5,1.5])for(const y of [-1,1])bolt(group,x,y,.45);
    for(let j=0;j<4;j++)box(group,2.2,.055,.025,this.dark,0,-.7+j*.45,.44,.01);
   }else if(h.type==='pulse'){
    for(const side of [-1,1])for(let j=0;j<4;j++)bolt(group,side*(h.width/2+.25),-.8+j*.65,.44);
   }
   this.actors.push(actor);group.traverse(m=>{if(m.isMesh)this.solids.push(m);});
  }
  this.springs=data.platforms.filter(o=>o.type==='bounce');
  if(this.springs.length){
   const points=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*6;points.push(new T.Vector3(Math.cos(a)*.65,i/40*1.1-1.1,Math.sin(a)*.65));}
   this.coils=batch(own(new T.TubeGeometry(new T.CatmullRomCurve3(points),40,.07,5,false)),this.gold,this.springs.length);
   this.coilFeet=batch(own(new T.CylinderGeometry(1.1,1.1,.18,12)),this.metal,this.springs.length);
  }
  this.padRings=batch(own(new T.TorusGeometry(.5,.018,6,32)),softTrim,n);
  this.padInlays=batch(own(new T.TorusGeometry(.5,.006,5,32)),this.dark,n*2);
  this.crumbling=data.platforms.filter(p=>p.type==='crumble');
  if(this.crumbling.length)this.cracks=batch(lineUnit,this.dark,this.crumbling.length*3);
  this.lifts=[];
  for(const o of data.platforms)if(o.type==='lift'){
   const group=new T.Group();group.position.set(o.x,0,o.z);this.root.add(group);
   cylinder(group,.75,.5,this.metal,0,-1.75,0);
   cylinder(group,.58,1.6,this.metal,0,-.8,0);for(let j=0;j<4;j++){const seal=mesh(group,own(new T.TorusGeometry(.59,.045,5,14)),j%2?this.gold:this.dark,0,-1.42+j*.37,0);seal.rotation.x=Math.PI/2;}
   const shaft=cylinder(group,.23,1,this.gold,0,0,0);this.lifts.push({o,shaft});
  }
  // Start/finish markings read from a distance without another screen of text.
  const checks=batch(this.unit,this.plastic,72);let ci=0;
  for(const cp of data.kind==='race'?[data.checkpoints[0],data.finish]:[])for(let row=0;row<2;row++)for(let col=0;col<18;col++){
   this.set(checks,ci,cp.x-8.5+col,cp.y+.025,cp.z-2.5+row*.5,.98,.025,.49);
   checks.setColorAt(ci++,this.tint.setHex((row+col)%2?0x30475b:0xf5e4b3));
  }checks.count=ci;checks.instanceMatrix.needsUpdate=true;
  // Ground the major catches and elevated shortcut decks in the scenery.
  // These thin supports stay OUTSIDE the playable top, not invisible blockers.
  for(const o of data.platforms)if(o.checkpoint!==undefined||o.skin==='hub'){
   const legs=new T.Group();this.root.add(legs);const height=o.y+.9;
   for(const side of [-1,1])box(legs,.38,height,.55,this.metal,o.x+side*(o.w/2-.5),-2+height/2,o.z,.07);
   box(legs,o.w-.5,.28,.6,this.gold,o.x,o.y-1.1,o.z,.06);
  }
  this.buildSurfaceUnion(tread);
  this.buildContinuousCaps(tread);
  const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,2,32,32,31);gradient.addColorStop(0,'rgba(20,35,48,.24)');gradient.addColorStop(.5,'rgba(20,35,48,.12)');gradient.addColorStop(1,'rgba(20,35,48,0)');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);const shadowTex=own(new T.CanvasTexture(canvas));this.contactShadows=batch(own(new T.PlaneGeometry(1,1)),own(new T.MeshBasicMaterial({map:shadowTex,transparent:true,depthWrite:false,toneMapped:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1})),this.actors.length);
  if(!data.platforms.some(o=>o.shape!=='disc'&&!o.renderUnion&&o.type!=='fan'))for(const mesh of [this.bases,this.rims,this.tops])mesh.count=0;
  if(!data.platforms.some(o=>o.shape==='disc'))for(const mesh of [this.roundBases,this.roundRims,this.roundTops])mesh.count=0;
  // Bake details into each rigid animated assembly BEFORE global static merge.
  for(const a of this.actors){if(a.h.type==='sweeper')this.mergeAssembly(a.group);if(a.rotor)this.mergeAssembly(a.rotor);if(a.swing)this.mergeAssembly(a.swing);if(a.head?.isGroup)this.mergeAssembly(a.head);if(a.ball)this.mergeAssembly(a.ball);}
  this.batchStatic();
 }
  // Collision decks overlap for safe seams; complete visible prisms are welded.
  // Subtract covered faces on all 3 axes, across base/rim/top material layers.
 buildSurfaceUnion(tread){
  const T=this.T,rects=this.data.platforms.filter(o=>o.shape!=='disc'&&!o.yaw&&!o.motion&&!['fan','lift','mover','tile','crumble','bounce'].includes(o.type)).sort((a,b)=>(b.checkpoint!==undefined?2:b.branch?1:0)-(a.checkpoint!==undefined?2:a.branch?1:0));
  const boxes=[],buffers=Array.from({length:3},()=>({p:[],n:[],c:[]}));this.capPatches=[];
  const subtract=(pieces,c)=>{const out=[];for(const a of pieces){const x0=Math.max(a.x0,c.x0),x1=Math.min(a.x1,c.x1),z0=Math.max(a.z0,c.z0),z1=Math.min(a.z1,c.z1);if(x1<=x0+1e-7||z1<=z0+1e-7){out.push(a);continue;}if(a.x0<x0)out.push({...a,x1:x0});if(x1<a.x1)out.push({...a,x0:x1});if(a.z0<z0)out.push({x0,x1,z0:a.z0,z1:z0});if(z1<a.z1)out.push({x0,x1,z0:z1,z1:a.z1});}return out;};
  for(const [order,o]of rects.entries()){
   o.renderUnion=true;o.renderOrder=order;
   const tint=o.branch?0xe1ba71:o.type==='conveyor'?0x73a3ba:o.checkpoint!==undefined?0x79b9a5:this.data.theme.color;
   for(let layer=0;layer<3;layer++){const inset=layer===0?.02:layer===1?-.01:.08,lo=layer===0?-1:layer===1?-.26:-.01,hi=layer===0?-.26:layer===1?-.01:.006;
    boxes.push({min:[o.x-o.w/2+inset,o.y+lo,o.z-o.d/2+inset],max:[o.x+o.w/2-inset,o.y+hi,o.z+o.d/2-inset],layer,color:layer===0?new T.Color(0xffffff):new T.Color(tint).lerp(this.white,layer===2?.14:0)});
   }
   o.detailVisible=[];for(const sx of [-1,1])for(const sz of [-1,1]){const x=o.x+sx*(o.w/2-.32),z=o.z+sz*(o.d/2-.32);o.detailVisible.push(!rects.slice(0,order).some(q=>Math.abs(q.y-o.y)<.05&&Math.abs(x-q.x)<q.w/2&&Math.abs(z-q.z)<q.d/2));}
   o.markerVisible=!rects.slice(0,order).some(q=>Math.abs(q.y-o.y)<.05&&Math.abs(o.x-q.x)<q.w/2&&Math.abs(o.z-q.z)<q.d/2);
  }
  const rails=[];
  for(let i=0;i<boxes.length;i++){const box=boxes[i],buf=buffers[box.layer];
   for(let axis=0;axis<3;axis++)for(const sign of [-1,1]){
    const u=(axis+1)%3,v=(axis+2)%3,plane=sign>0?box.max[axis]:box.min[axis];let pieces=[{x0:box.min[u],x1:box.max[u],z0:box.min[v],z1:box.max[v]}];
    for(let j=0;j<boxes.length&&pieces.length;j++){if(j===i)continue;const q=boxes[j],probe=plane+sign*1e-5,duplicate=j<i&&Math.abs((sign>0?q.max[axis]:q.min[axis])-plane)<1e-7;
     if(!(q.min[axis]<probe&&q.max[axis]>probe)&&!duplicate)continue;
     pieces=subtract(pieces,{x0:q.min[u],x1:q.max[u],z0:q.min[v],z1:q.max[v]});
    }
    for(const part of pieces){const corners=[[part.x0,part.z0],[part.x1,part.z0],[part.x1,part.z1],[part.x0,part.z1]],indices=sign>0?[0,1,2,0,2,3]:[0,2,1,0,3,2];
     for(const k of indices){const p=[0,0,0],n=[0,0,0];p[axis]=plane;p[u]=corners[k][0];p[v]=corners[k][1];n[axis]=sign;buf.p.push(...p);buf.n.push(...n);buf.c.push(box.color.r,box.color.g,box.color.b);}
     if(axis===1&&sign===1&&box.layer===2)this.capPatches.push({x0:part.z0,x1:part.z1,z0:part.x0,z1:part.x1,y:plane});
     if(box.layer===1&&axis!==1){const len=axis===0?part.z1-part.z0:part.x1-part.x0;if(len>1.2){const count=Math.ceil(len/4.5);for(let k=0;k<count;k++)rails.push({x:axis===0?plane+sign*.022:part.x0+len*(k+.5)/count,y:axis===0?(part.x0+part.x1)/2:(part.z0+part.z1)/2,z:axis===2?plane+sign*.022:part.z0+len*(k+.5)/count,len:len/count*1.002,axis});}}
    }
   }
  }
  const materials=[this.foam.clone(),this.plastic.clone(),tread.clone()];this.surfaceMeshes=[];
  for(let i=0;i<3;i++){const buf=buffers[i],geo=this.own(new T.BufferGeometry()),mat=this.own(materials[i]);mat.vertexColors=true;if(i===2){mat.onBeforeCompile=tread.onBeforeCompile;mat.customProgramCacheKey=()=> 'party-solid-union-161-'+this.data.theme.phase;}geo.setAttribute('position',new T.Float32BufferAttribute(buf.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(buf.n,3));geo.setAttribute('color',new T.Float32BufferAttribute(buf.c,3));geo.computeBoundingSphere();const mesh=new T.Mesh(geo,mat);mesh.name='party-welded-shell-'+i;this.root.add(mesh);this.surfaceMeshes.push(mesh);if(i===2)this.surfaceMesh=mesh;}
  this.shellRails=this.own(new T.InstancedMesh(this.unit,this.softTrim,rails.length));this.shellVents=this.own(new T.InstancedMesh(this.unit,this.foam,rails.length));this.shellVents.count=0;this.root.add(this.shellRails,this.shellVents);
  // Visible edge ribbons are generated from the complete disc/rectangle union
  // below. Per-box cream bars double-lined seams and cut through round pads.
  this.shellRails.count=0;
 }
 // Convex polygon subtraction welds disc/rectangle contacts too. Physics
 // overlaps remain for forgiving seams; only ONE top surface is drawn there.
 buildContinuousCaps(tread){
  const T=this.T,items=this.data.platforms.filter(o=>!o.motion&&!o.yaw&&!['fan','lift','mover','tile','crumble','bounce'].includes(o.type)),pos=[],normal=[],color=[],seen=[];
  const poly=o=>o.shape==='disc'?Array.from({length:40},(_,i)=>{const a=i*Math.PI/20;return[o.x+Math.cos(a)*(o.w/2-.035),o.z+Math.sin(a)*(o.w/2-.035)];}):[[o.x-o.w/2+.035,o.z-o.d/2+.035],[o.x+o.w/2-.035,o.z-o.d/2+.035],[o.x+o.w/2-.035,o.z+o.d/2-.035],[o.x-o.w/2+.035,o.z+o.d/2-.035]];
  const clip=(points,a,b,inside)=>{const out=[],value=p=>(b[0]-a[0])*(p[1]-a[1])-(b[1]-a[1])*(p[0]-a[0]);for(let i=0;i<points.length;i++){const p=points[i],q=points[(i+1)%points.length],vp=value(p),vq=value(q),ip=inside?vp>=-1e-7:vp<=1e-7,iq=inside?vq>=-1e-7:vq<=1e-7;if(ip)out.push(p);if(ip!==iq){const t=vp/(vp-vq);out.push([p[0]+(q[0]-p[0])*t,p[1]+(q[1]-p[1])*t]);}}return out;};
  const difference=(shape,cover)=>{let remain=shape;const out=[];for(let i=0;i<cover.length&&remain.length>=3;i++){const a=cover[i],b=cover[(i+1)%cover.length],outside=clip(remain,a,b,false);if(outside.length>=3)out.push(outside);remain=clip(remain,a,b,true);}return out;};
  for(const o of items){const shape=poly(o);let pieces=[shape];for(const q of seen){if(Math.abs(q.o.y-o.y)>.015||Math.abs(q.o.x-o.x)>(q.o.w+o.w)/2||Math.abs(q.o.z-o.z)>(q.o.d+o.d)/2)continue;pieces=pieces.flatMap(p=>difference(p,q.shape));}
   const tint=new T.Color(o.branch?0xe1ba71:o.type==='conveyor'?0x579fc3:o.checkpoint!==undefined?0x64b7a6:this.data.theme.color).lerp(this.white,.09);
   for(const p of pieces)for(let j=1;j<p.length-1;j++)for(const k of [0,j+1,j]){pos.push(p[k][0],o.y+.009,p[k][1]);normal.push(0,1,0);color.push(tint.r,tint.g,tint.b);}o.renderCapUnion=true;seen.push({o,shape});
  }
  const geo=this.own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normal,3));geo.setAttribute('color',new T.Float32BufferAttribute(color,3));geo.computeBoundingSphere();const mat=this.own(tread.clone());mat.vertexColors=true;mat.onBeforeCompile=tread.onBeforeCompile;mat.customProgramCacheKey=()=> 'party-disc-rect-quilt-161-'+this.data.theme.phase;this.continuousCap=new T.Mesh(geo,mat);this.continuousCap.name='party-continuous-deck';this.root.add(this.continuousCap);if(this.surfaceMesh)this.surfaceMesh.visible=false;this.capTriangles=pos.length/9;
  this.buildUnionOutline(seen);
 }
 buildUnionOutline(shapes){
  const positions=[],segments=[],T=this.T;
  for(let i=0;i<shapes.length;i++){const {o,shape}=shapes[i];for(let e=0;e<shape.length;e++){
   const a=shape[e],b=shape[(e+1)%shape.length],dx=b[0]-a[0],dz=b[1]-a[1],length=Math.hypot(dx,dz);if(length<.01)continue;let spans=[[0,1]];
   for(let j=0;j<shapes.length&&spans.length;j++){if(i===j)continue;const q=shapes[j];if(Math.abs(o.y-q.o.y)>.015)continue;let lo=0,hi=1,valid=true,boundary=false;
    for(let k=0;k<q.shape.length;k++){const p=q.shape[k],r=q.shape[(k+1)%q.shape.length],c=(r[0]-p[0])*(a[1]-p[1])-(r[1]-p[1])*(a[0]-p[0]),v=(r[0]-p[0])*dz-(r[1]-p[1])*dx;
     if(Math.abs(v)<1e-9){if(c< -1e-6){valid=false;break;}if(Math.abs(c)<1e-6)boundary=true;}else if(v>0)lo=Math.max(lo,-c/v);else hi=Math.min(hi,-c/v);
    }
    if(!valid||lo>=hi-1e-7||boundary&&j>i)continue;const next=[];for(const [s,t]of spans){if(hi<=s||lo>=t){next.push([s,t]);continue;}if(lo>s)next.push([s,lo]);if(hi<t)next.push([hi,t]);}spans=next;
   }
   for(const [s,t]of spans){if((t-s)*length<.03)continue;const x0=a[0]+dx*s,z0=a[1]+dz*s,x1=a[0]+dx*t,z1=a[1]+dz*t,nx=-dz/length*.075,nz=dx/length*.075,y=o.y+.047;
    const points=[[x0+nx,y,z0+nz],[x1+nx,y,z1+nz],[x1-nx,y,z1-nz],[x0-nx,y,z0-nz]];for(const k of [0,1,2,0,2,3])positions.push(...points[k]);segments.push({x0,z0,x1,z1,y,owner:o.id});
   }
  }}
  const geo=this.own(new T.BufferGeometry());geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.computeVertexNormals();geo.computeBoundingSphere();const mat=this.own(new T.MeshBasicMaterial({color:0xf1d8a0,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));this.outline=new T.Mesh(geo,mat);this.outline.name='party-single-union-outline';this.root.add(this.outline);this.outlineSegments=segments;
 }
 mergeAssembly(root){
  const T=this.T,groups=new Map();root.updateMatrixWorld(true);const inverse=root.matrixWorld.clone().invert();
  root.traverse(m=>{if(m!==root&&m.isMesh&&!m.isInstancedMesh){if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(m);}});
  for(const [material,meshes]of groups){if(meshes.length<2)continue;const parts=[];let count=0;
   for(const m of meshes){const geo=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(inverse.clone().multiply(m.matrixWorld));parts.push(geo);count+=geo.attributes.position.count;}
   const geo=this.own(new T.BufferGeometry()),positions=new Float32Array(count*3),normals=new Float32Array(count*3);let offset=0;
   for(const part of parts){positions.set(part.attributes.position.array,offset*3);normals.set(part.attributes.normal.array,offset*3);offset+=part.attributes.position.count;part.dispose();}
   geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('normal',new T.BufferAttribute(normals,3));geo.computeBoundingSphere();root.add(new T.Mesh(geo,material));for(const m of meshes)m.removeFromParent();
  }
 }
 // Bake only genuinely stationary parts. Animated parents/heads/shafts are
 // excluded, preserving exact visual/collider motion while cutting draw calls.
 batchStatic(){
  const T=this.T,dynamic=new Set(),groups=new Map();
  for(const a of this.actors){
   const type=a.h.type;if(a.h.attached||['sweeper','gate','ball'].includes(type))dynamic.add(a.group);
   for(const n of [a.swing,a.rotor,a.head,a.shaft,a.jet,a.chain])if(n)dynamic.add(n);
   if(a.lamp)dynamic.add(a.lamp);
  }
  for(const l of this.lifts)dynamic.add(l.shaft);
  this.root.updateMatrixWorld(true);
  this.root.traverse(m=>{
   if(!m.isMesh||m.isInstancedMesh||Array.isArray(m.material))return;
   for(let p=m;p&&p!==this.root;p=p.parent)if(dynamic.has(p))return;
   if(!groups.has(m.material))groups.set(m.material,[]);groups.get(m.material).push(m);
  });
  const removed=new Set();
  for(const [material,meshes]of groups){
   if(meshes.length<3)continue;let count=0;const parts=[];
   for(const m of meshes){const geo=(m.geometry.index?m.geometry.toNonIndexed():m.geometry.clone()).applyMatrix4(m.matrixWorld);parts.push(geo);count+=geo.attributes.position.count;}
   const geo=this.own(new T.BufferGeometry()),positions=new Float32Array(count*3),normals=new Float32Array(count*3),uv=new Float32Array(count*2);let offset=0;
   for(const p of parts){positions.set(p.attributes.position.array,offset*3);normals.set(p.attributes.normal.array,offset*3);if(p.attributes.uv)uv.set(p.attributes.uv.array,offset*2);offset+=p.attributes.position.count;p.dispose();}
   geo.setAttribute('position',new T.BufferAttribute(positions,3));geo.setAttribute('normal',new T.BufferAttribute(normals,3));geo.setAttribute('uv',new T.BufferAttribute(uv,2));geo.computeBoundingSphere();
   const merged=new T.Mesh(geo,material);this.root.add(merged);this.solids.push(merged);
   for(const m of meshes){removed.add(m);m.removeFromParent();}
  }
  this.solids=this.solids.filter(m=>!removed.has(m));
 }
 set(batch,i,x,y,z,sx,sy,sz,yaw=0){this.dummy.position.set(x,y,z);this.dummy.rotation.set(0,yaw,0);this.dummy.scale.set(sx,sy,sz);this.dummy.updateMatrix();batch.setMatrixAt(i,this.dummy.matrix);}
 railPose(row){const {r,i,start,count}=row,{tops,mids,uprights}=this.guardrails,base=r.y-r.h,s=r.active?1:0;this.set(tops,i,r.x,base+1.06,r.z,.18*s,.12*s,r.d*s);this.set(mids,i,r.x,base+.55,r.z,.12*s,.09*s,r.d*s);for(let j=0;j<count;j++){const z=r.z-r.d/2+.09+(r.d-.18)*j/(count-1);this.set(uprights,start+j*2,r.x,base+.55,z,.15*s,1.1*s,.15*s);this.set(uprights,start+j*2+1,r.x,base+.045,z,.3*s,.09*s,.3*s);}}
 update(time,viewZ=null){
  if(this.guardrails?.moving.length){for(const row of this.guardrails.moving)this.railPose(row);for(const m of [this.guardrails.tops,this.guardrails.mids,this.guardrails.uprights])m.instanceMatrix.needsUpdate=true;}
  for(const o of this.data.platforms){
   if(this.initialized&&!o.motion&&(!o.type||o.type==='crumble'&&o.touchAt===null||o.artHidden&&!o.active&&o.drop>=4))continue;
   const visible=o.active||o.drop>0&&o.drop<4,scale=visible?Math.max(0,1-(o.drop||0)/4):0,y=o.y-(o.drop||0)+(o.triggerOnly?.035:0);o.artHidden=!visible;
   const warning=o.type==='crumble'&&o.touchAt!==null&&!o.reforming?Math.max(0,Math.min(1,(time-o.touchAt)/this.data.difficulty.crumbleDelay)):0;
   const col=o.branch?0xe1ba71:o.type==='bounce'?0x65cbb5:o.type==='conveyor'?0x73a3ba:o.type==='lift'?0xa49bc3:o.type==='mover'?0x8298be:o.skin==='arenaTile'?this.data.theme.color:o.type==='crumble'?0xc89e79:o.checkpoint!==undefined?0x79b9a5:this.data.theme.color;
   const round=o.shape==='disc',base=round?this.roundBases:this.bases,rim=round?this.roundRims:this.rims,top=round?this.roundTops:this.tops,yaw=o.yaw||0,c=Math.cos(yaw),s=Math.sin(yaw);
   for(const b of round?[this.bases,this.rims,this.tops]:[this.roundBases,this.roundRims,this.roundTops])this.set(b,o.id,0,0,0,0,0,0);
   const shellScale=o.renderUnion||o.type==='fan'||o.triggerOnly?0:scale;this.set(base,o.id,o.x,y-.53,o.z,o.w*shellScale,.94*shellScale,o.d*shellScale,yaw);
   this.set(rim,o.id,o.x,y-.15,o.z,(o.w+.02)*shellScale,.22*shellScale,(o.d+.02)*shellScale,yaw);rim.setColorAt(o.id,this.tint.setHex(col).lerp(this.warningTint,warning));
   const capScale=o.renderUnion||o.renderCapUnion||o.type==='fan'?0:scale,fanTrim=0;
   this.set(top,o.id,o.x+c*fanTrim/2,y-(o.triggerOnly?.008:.045),o.z-s*fanTrim/2,(o.w-.16-fanTrim)*capScale,(o.triggerOnly?.025:.09)*capScale,(o.d-.16)*capScale,yaw);top.setColorAt(o.id,this.tint.setHex(col).lerp(this.white,o.type==='bounce'?.30:.14).lerp(this.warningTint,warning*.7));
   this.dummy.position.set(o.x,y+.028,o.z);this.dummy.rotation.set(Math.PI/2,0,0);this.dummy.scale.setScalar(round&&!o.renderCapUnion?(o.w-.45)*scale:0);this.dummy.updateMatrix();this.padRings.setMatrixAt(o.id,this.dummy.matrix);
   for(let j=0;j<2;j++){this.dummy.scale.setScalar(round&&o.type==='bounce'?(o.w-.5)*(j?.6:.82)*scale:0);this.dummy.updateMatrix();this.padInlays.setMatrixAt(o.id*2+j,this.dummy.matrix);}
   let k=0;for(const a of [-1,1])for(const b of [-1,1]){const x=a*(o.w/2-.32)*(round?.66:1),z=b*(o.d/2-.32)*(round?.66:1),bs=o.type==='fan'&&a<0||o.detailVisible&&!o.detailVisible[k]?0:scale;this.set(this.bolts,o.id*4+k++,o.x+c*x+s*z,y+.012,o.z-s*x+c*z,bs,bs,bs);}
   for(let j=0;j<4;j++){
    const angle=j*Math.PI/2+yaw,wx=Math.cos(angle),wz=-Math.sin(angle),rx=round?o.w*.38:(j%2?0:o.w*.43),rz=round?o.d*.38:(j%2?o.d*.43:0);
    this.set(this.trims,o.id*4+j,o.x+wx*(rx||rz),y-.34,o.z+wz*(rx||rz),shellScale*(round?.65:1.1),.075*shellScale,.16*shellScale,angle+Math.PI/2);
    this.set(this.vents,o.id*4+j,o.x+wx*(rx||rz),y-.62,o.z+wz*(rx||rz),shellScale*.8,.17*shellScale,.12*shellScale,angle+Math.PI/2);
   }
   for(let j=0;j<3;j++){
    const flow=o.type==='conveyor'?((time*(o.flowZ||0)+j*1.4)%4+4)%4-2:(j-1)*.65;
    const ms=this.data.kind!=='race'||o.skin==='hub'||o.type==='fan'||o.markerVisible===false?0:scale;this.set(this.markers,o.id*3+j,o.x+Math.sin(yaw)*flow,y+.008,o.z+Math.cos(yaw)*flow,ms*(o.checkpoint!==undefined?1.8:1),ms,ms*(o.checkpoint!==undefined?1.8:1),o.type==='conveyor'?Math.atan2(-o.flowX,-o.flowZ):yaw+(o.routeYaw||0));
   }
  }
  this.initialized=true;
  for(const set of this.fanSets){for(const [i,o]of set.blades.entries()){const s=o.active?1:0;this.set(set.base,i,o.centerX,o.y-.63,o.centerZ,s,.74*s,s,o.yaw);this.set(set.rim,i,o.centerX,o.y-.18,o.centerZ,s,.25*s,s,o.yaw);set.rim.setColorAt(i,this.tint.setHex(this.data.theme.color));this.set(set.top,i,o.centerX,o.y-.037,o.centerZ,s,.016*s,s,o.yaw);set.top.setColorAt(i,this.tint.setHex(this.data.theme.color).lerp(this.white,.1));}for(const mesh of [set.base,set.rim,set.top]){mesh.instanceMatrix.needsUpdate=true;if(mesh.instanceColor)mesh.instanceColor.needsUpdate=true;}}
  for(const batch of [this.bases,this.rims,this.tops,this.roundBases,this.roundRims,this.roundTops,this.trims,this.vents,this.bolts,this.markers,this.padRings,this.padInlays]){batch.instanceMatrix.needsUpdate=true;if(batch.instanceColor)batch.instanceColor.needsUpdate=true;}
  for(const a of this.actors){
   const h=a.h;
   if(h.attached)a.group.position.set(h.x+(h.type==='wind'?h.side*5.4:0),h.y,h.z);
   // Fully fogged beyond210m: skip dynamic draw calls only beyond240m (+bound).
   // Static structure stays merged; no model pops inside the visible fog range.
   a.group.visible=viewZ===null||Math.abs((h.currentZ??h.z)-viewZ)<240+Math.max(h.radius||0,(h.length||0)/2);
   if(h.type==='rotor')a.rotor.rotation.z=h.angle;
   else if(h.type==='swingLog'){
    a.head.position.set(h.currentX-h.x,h.currentY-h.y,0);
    for(let j=0;j<2;j++){this.dummy.position.set((j?1:-1)*h.width*.4+(h.currentX-h.x)/2,(h.currentY-h.y)/2,0);this.dummy.rotation.set(0,0,h.angle);this.dummy.scale.set(1,h.length,1);this.dummy.updateMatrix();a.chain.setMatrixAt(j,this.dummy.matrix);}a.chain.instanceMatrix.needsUpdate=true;
   }else if(h.type==='shutter'){a.head.position.y=h.lift;a.lamp.material.color.setHex(h.warning?0xf0b864:h.open>.65?0x8ce3bd:0xeb8975);}
   else if(h.type==='popper'){a.head.position.y=h.rise;a.shaft.position.y=(h.rise-.5)/2;a.shaft.scale.y=.5+h.rise;a.lamp.material.color.setHex(h.strike?0xf08b68:h.warning?0xf0c269:0x8ce3bd);}
   else if(h.type==='hammer')a.rotor.rotation.y=h.angle;
   else if(h.type==='bumper'){a.head.position.x=h.currentX-h.x;}
   else if(h.type==='roller')a.rotor.rotation.x=h.angle;
   else if(h.type==='flipper'){a.rotor.rotation.x=h.flip;a.lamp.material.color.setHex(h.strike?0xf18c65:h.warning?0xffd37a:0x87d8b0);}
   else if(h.type==='ball'){a.group.position.z=h.currentZ;a.ball.rotation.x=h.angle;}
   else if(h.type==='sweeper')a.group.rotation.y=-h.angle;
   else if(h.type==='gate'){a.group.position.x=h.currentX;if(a.lamp)a.lamp.material.color.setHex(h.warning?0xe28365:0x8ac7ac);}
   else if(h.type==='pendulum')a.swing.rotation.z=h.angle;
   else if(h.type==='wind'){
    a.rotor.rotation.z=time*11-1.5*Math.cos(time*h.rate+h.phase);a.jet.visible=true;a.jet.material.opacity=.2+h.gust*.24;
    for(let i=0;i<6;i++){const z=(time*7+i*1.75)%10.5+.5;this.set(a.jet,i,Math.sin(i*2.1)*.65,Math.cos(i*2.1)*.65,z,.035,.035,.9);}
    a.jet.instanceMatrix.needsUpdate=true;
   }else if(h.type==='pulse'){
    a.beams.visible=h.lit||h.warning;a.energy.opacity=h.lit?.9:.2+Math.sin(time*12)*.1;a.energy.color.setHex(h.lit?0xf3a26b:0xe7d38d);
    a.veil.visible=h.lit;a.lamp.material.color.setHex(h.lit?0xe98b68:h.warning?0xe5c371:0x82c4ae);
   }else if(h.type==='piston'){a.head.position.x=-h.side*h.push;a.shaft.position.x=h.side*(2.4-h.push*.5);a.shaft.scale.y=(3.4+h.push)/3.4;}
  }
  for(const [i,a]of this.actors.entries()){const h=a.h,x=h.currentX??h.x,z=h.currentZ??h.z;let floor=null;for(const p of this.data.platforms)if(p.active&&p.y<=h.y+.5&&g.ElementalObbyCourse.contains(p,x,z,0)&&(!floor||p.y>floor.y))floor=p;const size=floor?Math.min(7,Math.max(2.4,(h.radius||1)*3)):0;this.dummy.position.set(x,(floor?.y||0)+.023,z);this.dummy.rotation.set(-Math.PI/2,0,0);this.dummy.scale.set(size,size,1);this.dummy.updateMatrix();this.contactShadows.setMatrixAt(i,this.dummy.matrix);}this.contactShadows.instanceMatrix.needsUpdate=true;
  for(let i=0;i<this.springs.length;i++){const o=this.springs[i];this.set(this.coils,i,o.x,o.y-1.1,o.z,1,1+Math.sin(time*4)*.035,1);this.set(this.coilFeet,i,o.x,o.y-2.3,o.z,1,1,1);}
  if(this.cracks){for(const [i,o]of this.crumbling.entries()){const age=o.touchAt===null?0:Math.max(0,time-o.touchAt),warning=Math.min(1,age/this.data.difficulty.crumbleDelay),s=age>0&&(o.active||(o.drop||0)<4)?Math.max(0,1-(o.drop||0)/4):0;for(let j=0;j<3;j++){const angle=j*2.1+.4;this.set(this.cracks,i*3+j,o.x+Math.sin(angle)*o.w*.11,o.y-(o.drop||0)+.008,o.z+Math.cos(angle)*o.d*.11,.025*warning*s,.012*s,o.w*.42*warning*s,angle);}}this.cracks.instanceMatrix.needsUpdate=true;}
  if(this.coils){this.coils.instanceMatrix.needsUpdate=true;this.coilFeet.instanceMatrix.needsUpdate=true;}
  for(const lift of this.lifts){const length=Math.max(.1,lift.o.y+.8);lift.shaft.scale.y=length;lift.shaft.position.y=-1.6+length/2;}
 }
}
g.ElementalObbyArt=ObbyArt;
})(window);
