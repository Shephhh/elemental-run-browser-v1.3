/* Alternating open-air and covered workshop passages. No source hull carving. */
(function(scope){'use strict';
const THEMES=[{body:0x344754,frame:0x202e39,light:0x55c9d2},{body:0x66765a,frame:0x554536,light:0xc4df93},{body:0xb3c1c7,frame:0x536e7a,light:0xffdfa0},{body:0x625047,frame:0x352e2c,light:0xffa265},{body:0x567e82,frame:0x304e58,light:0x81dfd5},{body:0xa5b8c7,frame:0x53677b,light:0xb7e7ff}];
const pause=()=>new Promise(r=>setTimeout(r,0));
function intersects(a,b,pad=.2){return a.x1>b.x0-pad&&a.x0<b.x1+pad&&a.z1>b.z0-pad&&a.z0<b.z1+pad&&a.top>b.bottom+pad&&a.bottom<b.top-pad;}
function pointInsideXZ(M,o,x,z,y){return x>=o.x0&&x<=o.x1&&z>=o.z0&&z<=o.z1&&M.contains(o,[x,y,z],.03);}
function footing(data,x,z,y){const M=scope.ElementalSurfMaps;let floor=data.biomeTerrain?.floorAt(x,z)??data.terrainY;for(const o of data.solids){if(x<o.x0||x>o.x1||z<o.z0||z>o.z1)continue;const top=M.topAt(o,x,z);if(top<=y+.12&&top>floor&&pointInsideXZ(M,o,x,z,top-.02))floor=top;}return floor+.04;}
function nativeCover(data,p){const M=scope.ElementalSurfMaps;return data.solids.some(o=>o.bottom>p.y+4&&o.bottom<p.y+32&&pointInsideXZ(M,o,p.x,p.z,o.bottom+.03));}
function makePart(T,M,anchor,along,side,y,length,height,width,role,id){const f=Math.cos(anchor.yaw),s=Math.sin(anchor.yaw),x=anchor.x+f*along-s*side,z=anchor.z+s*along+f*side,matrix=new T.Matrix4().makeRotationY(-anchor.yaw);matrix.scale(new T.Vector3(length,height,width));matrix.setPosition(x,y,z);const v=[];for(const yy of [.5,-.5])for(const [xx,zz]of [[-.5,-.5],[.5,-.5],[.5,.5],[-.5,.5]])v.push(new T.Vector3(xx,yy,zz).applyMatrix4(matrix).toArray());const faces=[[0,3,2,1],[4,5,6,7],[0,1,5,4],[1,2,6,5],[2,3,7,6],[3,0,4,7]].map(i=>({i,m:'workshop/shelter'})),hull=M.convex({v,f:faces},id);hull.structure=true;hull.mainRoute=false;return{matrix,hull,role};}
function panelMaterial(T,theme,own){const material=own(new T.MeshStandardMaterial({color:theme.body,roughness:.68,metalness:.32,side:T.DoubleSide}));material.onBeforeCompile=s=>{s.vertexShader='varying vec3 vShelterP;varying vec3 vShelterN;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <begin_vertex>',`#include <begin_vertex>
 vec4 shelterP=vec4(transformed,1.);vec3 shelterN=normal;
 #ifdef USE_INSTANCING
 shelterP=instanceMatrix*shelterP;shelterN=mat3(instanceMatrix)*shelterN;
 #endif
 vShelterP=(modelMatrix*shelterP).xyz;vShelterN=normalize(mat3(modelMatrix)*shelterN);`);s.fragmentShader='varying vec3 vShelterP;varying vec3 vShelterN;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <map_fragment>',`#include <map_fragment>
 vec3 sn=abs(normalize(vShelterN));vec2 sp=sn.y>.6?vShelterP.xz:(sn.x>.6?vShelterP.zy:vShelterP.xy);vec2 edge=abs(fract(sp/4.+.5)-.5)*4.;float aa=max(.01,max(fwidth(sp.x),fwidth(sp.y)));float seam=1.-smoothstep(.02,.055+aa,min(edge.x,edge.y));float tint=.94+.06*sin(dot(floor(sp/4.),vec2(1.83,2.37)));diffuseColor.rgb*=tint*(1.-seam*.36);`);};material.customProgramCacheKey=()=> 'workshop-mixed-shelter-v1';return material;}
async function plan(T,data,valid=()=>true){const M=scope.ElementalSurfMaps,P=scope.ElementalSurfPhysics,candidates=[{...data.spawn,landing:true},...data.checkpoints.filter((_,i)=>i%2===0).map(p=>({...p,landing:true}))],cells=new Set(),bodies=[];let budgetTime=performance.now();
 // Protect standing and ordinary jump headroom above the actual source faces,
 // not merely the source brush volume. A non-overlapping roof can still crush
 // the player's body above a valid original landing.
 for(const o of data.solids){if(o.biomeShell||o.biomeFloor)continue;for(const f of o.faces){const a=o.vertices[f.i[0]],b=o.vertices[f.i[1]],c=o.vertices[f.i[2]],ux=b[0]-a[0],uy=b[1]-a[1],uz=b[2]-a[2],vx=c[0]-a[0],vy=c[1]-a[1],vz=c[2]-a[2],nx=uy*vz-uz*vy,ny=uz*vx-ux*vz,nz=ux*vy-uy*vx;if(ny/Math.hypot(nx,ny,nz)<.15)continue;let x=0,y=0,z=0;for(const i of f.i){x+=o.vertices[i][0]/f.i.length;y+=o.vertices[i][1]/f.i.length;z+=o.vertices[i][2]/f.i.length;}bodies.push(x,y+(Math.abs(nx)*P.HX+Math.abs(nz)*P.HZ)/ny+.04,z);}if(performance.now()-budgetTime>2){await pause();if(!valid())return null;budgetTime=performance.now();}}
 // Source landing/ramp clusters, not a +X corridor or a camera-following box.
 for(const o of data.solids){if(o.biomeShell||o.biomeFloor||o.kind==='hot'||o.top-o.bottom>80||Math.min(o.x1-o.x0,o.z1-o.z0)<2||Math.max(o.x1-o.x0,o.z1-o.z0)>100)continue;const x=(o.x0+o.x1)/2,z=(o.z0+o.z1)/2,y=M.topAt(o,x,z);if(!Number.isFinite(y)||!pointInsideXZ(M,o,x,z,y-.02))continue;const key=[Math.floor(x/70),Math.floor(y/70),Math.floor(z/70)].join(',');if(cells.has(key))continue;cells.add(key);let nearest=data.spawn,distance=Infinity;for(const p of data.checkpoints){const d=Math.hypot(x-p.x,y-p.y,z-p.z);if(d<distance){nearest=p;distance=d;}}candidates.push({x,y,z,yaw:nearest.yaw||0});if(candidates.length>=90)break;}
 const covered=[],native=[],accepted=[],colliders=[];let stamp=performance.now(),serial=-3000000;
 for(const point of candidates){if(covered.length>=6)break;if(nativeCover(data,point)){native.push(point);continue;}if(covered.some(a=>Math.hypot(a.x-point.x,a.z-point.z)<85&&Math.abs(a.y-point.y)<90))continue;const anchor={...point,yaw:point.yaw||0},length=36+(covered.length%3)*6,width=data.courseMode==='surf'?44:32,roof=anchor.y+(data.courseMode==='surf'&&!anchor.landing?46:20),parts=[];let failed=false;
  // Roof skylights are actual gaps, not transparent floor/roof sheets. Ends
  // remain open, and the side walls alternate solid panels with large windows.
  for(let i=0;i<3;i++)parts.push(makePart(T,M,anchor,(i+.5)*length/3,0,roof,length/3-2.5,.65,width,'body',serial--));
  for(const side of [-1,1])for(const along of [length*.25,length*.75])parts.push(makePart(T,M,anchor,along,side*width/2,(anchor.y+.4+roof)/2,length*.28,roof-anchor.y-.4,.55,'body',serial--));
  for(const along of [0,length])for(const side of [-1,1]){const x=anchor.x+Math.cos(anchor.yaw)*along-Math.sin(anchor.yaw)*side*width/2,z=anchor.z+Math.sin(anchor.yaw)*along+Math.cos(anchor.yaw)*side*width/2,bottom=footing(data,x,z,anchor.y);if(roof-bottom>220||bottom>anchor.y+1){failed=true;break;}parts.push(makePart(T,M,anchor,along,side*width/2,(bottom+roof)/2,1,roof-bottom,1,'frame',serial--));}
  if(failed)continue;for(const along of [0,length*.5,length])parts.push(makePart(T,M,anchor,along,0,roof-.6,.75,.7,width+1,'frame',serial--));
  // Test the complete physical panels/posts. No roof may cut an authored
  // ramp, standing body, existing ceiling, portal or teleport landing point.
  for(const p of parts){if(data.solids.some(o=>intersects(p.hull,o))||colliders.some(o=>intersects(p.hull,o,1))||data.triggers.some(t=>(t.interaction==='portal'||t.type==='end_zone')&&intersects(p.hull,t,2))||[data.spawn,...data.checkpoints,...data.destinations].some(q=>q.x>p.hull.x0-.5&&q.x<p.hull.x1+.5&&q.z>p.hull.z0-.5&&q.z<p.hull.z1+.5&&q.y+2>p.hull.bottom&&q.y<p.hull.top)){failed=true;break;}const body={x:0,y:0,z:0,slide:0},one=[p.hull];for(let j=0;j<bodies.length;j+=3){body.x=bodies[j];body.z=bodies[j+2];if(body.x+.38<p.hull.x0||body.x-.38>p.hull.x1||body.z+.38<p.hull.z0||body.z-.38>p.hull.z1)continue;for(const lift of [0,1.7]){body.y=bodies[j+1]+lift;if(P.touchingKind(body,one,'ground')){failed=true;break;}}if(failed)break;}if(failed)break;}
  if(!failed){for(const p of parts){accepted.push(p);colliders.push(p.hull);}for(const along of [length*.12,length*.5,length*.88])accepted.push(makePart(T,M,anchor,along,0,roof-.95,2.8,.08,width*.55,'light',serial--));covered.push({...anchor,length,width,roof});}
  if(performance.now()-stamp>2){await pause();if(!valid())return null;stamp=performance.now();}
 }return{areas:covered,nativeCovered:native.length,parts:accepted,colliders};
}
// The planner uses the same transforms for render matrices and convex hulls.
// Kept as an explicit argument binding rather than a second geometry pipeline.
// No mutable planner globals: simultaneous current/next preparation is safe.
async function build(T,data,group,own,valid){const result=await plan(T,data,valid);if(!result||!valid())return;const theme=THEMES[data.phase],geometry=own(new T.BoxGeometry(1,1,1)),materials={body:panelMaterial(T,theme,own),frame:own(new T.MeshStandardMaterial({color:theme.frame,roughness:.6,metalness:data.phase===1?.1:.55})),light:own(new T.MeshBasicMaterial({color:theme.light}))};let draws=0;
 for(const role of ['body','frame','light']){const list=result.parts.filter(p=>p.role===role);if(!list.length)continue;const mesh=own(new T.InstancedMesh(geometry,materials[role],list.length));list.forEach((p,i)=>mesh.setMatrixAt(i,p.matrix));mesh.computeBoundingBox();mesh.computeBoundingSphere();mesh.userData.workshopShelter=role;group.add(mesh);draws++;await pause();if(!valid())return;}
 scope.ElementalSurfMaps.registerStructures(data,result.colliders);data.mixedAreas={areas:result.areas,nativeCovered:result.nativeCovered,drawCalls:draws,panels:result.colliders.length,openEnds:true,skylights:true};return result;
}
scope.ElementalSurfShelters={build,plan,THEMES};
})(typeof window!=='undefined'?window:globalThis);
