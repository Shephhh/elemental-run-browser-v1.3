/* Authored Bhop/Surf architecture. No camera-dependent collision mutations. */
(function(scope){'use strict';
const VERSION='workshop-architecture-v1';
const COLORS=[0x34404c,0x575b4e,0x616e78,0x454249,0x3c585b,0x536175];
const ACCENTS=[0x55c9d2,0x83b592,0x71bed3,0xdca46d,0x60b7b5,0x8cbbda];
function isArchitecture(o){return !!(o.biomeWall||o.biomeRoof||o.biomeShell||o.openedShell);}
// A frustum miss is temporary, not proof that geometry may be destroyed. Caps
// are permitted only with a static occlusion + unreachable buried-volume proof.
// Current authored maps provide no such proof and keep their complete hulls.
function canUseHiddenCap(o,proof){return !!(proof&&proof.staticOccluded===true&&proof.outsidePlayableVolume===true&&Number.isFinite(proof.opaqueFloorY)&&Number.isFinite(proof.lowestPlayableY)&&o.top<proof.opaqueFloorY-6&&proof.lowestPlayableY>proof.opaqueFloorY+2);}
function selectVisualHull(o,proof){if(!canUseHiddenCap(o,proof))return o;const bottom=o.top-.55;return{...o,bottom,vertices:o.vertices.map(p=>[p[0],Math.max(bottom,p[1]),p[2]]),visualCap:true};}
function batchCellSize(data,mobile){let size=128;const max=mobile?16:28,objects=data.solids.filter(isArchitecture);while(size<2048){const cells=new Set(objects.map(o=>Math.floor((o.x0+o.x1)*.5/size)+','+Math.floor((o.z0+o.z1)*.5/size)));if(cells.size<=max)break;size*=2;}return size;}
function batchKey(o,size){return 'architecture:'+Math.floor((o.x0+o.x1)*.5/size)+','+Math.floor((o.z0+o.z1)*.5/size);}
function pushTriangle(batch,a,b,c,tint,bounds){for(const p of [a,b,c]){batch.v.push(...p);batch.c.push(...tint);batch.uv.push(p[0]/2,p[2]/2);batch.arch.push(bounds[0],bounds[1]);}}
// Small tapered corner gussets use one existing architecture batch. They sit
// within the original hull, with only a 2cm cosmetic skin outside its edges.
// Never add pillars across a room, underneath a landing path or to the collider.
function appendCornerSupports(batch,o){if(!o.biomeWall&&!o.biomeRoof)return 0;
 // An oblique hull's AABB corners need not lie on the hull. Never put detached
 // gussets there; its complete authored shape already supplies the structure.
 if(o.planes&&o.planes.some(p=>p.n.filter(n=>Math.abs(n)>1e-5).length!==1))return 0;
 const w=o.x1-o.x0,d=o.z1-o.z0,h=o.top-o.bottom;if(Math.min(w,d)<.35||h<.25)return 0;
 const s=Math.min(.6,w*.22,d*.22),rise=Math.min(1.1,h*.42),lo=o.bottom+.025,hi=lo+rise,tint=[.83,.86,.88],bounds=[o.bottom,o.top];let triangles=0;
 for(const [x,z,dx,dz] of [[o.x0,o.z0,1,1],[o.x1,o.z0,-1,1],[o.x1,o.z1,-1,-1],[o.x0,o.z1,1,-1]]){
  const A=[x-dx*.02,lo,z-dz*.02],B=[x+dx*s,lo,z-dz*.02],C=[x-dx*.02,lo,z+dz*s],D=[x+dx*s*.16,hi,z+dz*s*.16];
  const tri=(a,b,c)=>dx*dz>0?pushTriangle(batch,a,b,c,tint,bounds):pushTriangle(batch,a,c,b,tint,bounds);
  tri(A,D,B);tri(A,C,D);tri(B,D,C);triangles+=3;
 }return triangles;
}
function replaceOnce(source,token,replacement){if(!source.includes(token))throw Error('Unsupported Three.js architecture shader chunk: '+token);return source.replace(token,replacement);}
function installTriplanar(material,T,options={}){const phase=options.phase||0;
 const uniforms={uArchScale:{value:1/4},uArchNeon:{value:new T.Color(ACCENTS[phase]||ACCENTS[0])},uArchGlow:{value:phase===0?2:0},uArchNoise:{value:options.mobile?.045:.065}};
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,uniforms);
  shader.vertexShader=replaceOnce(shader.vertexShader,'#include <common>',`#include <common>
attribute vec2 aArchBounds;
varying vec3 vArchWorld;
varying vec3 vArchNormal;
varying vec2 vArchBounds;`);
  shader.vertexShader=replaceOnce(shader.vertexShader,'#include <worldpos_vertex>',`#include <worldpos_vertex>
vec4 archPosition = vec4(transformed, 1.0);
vec4 archLow = vec4(transformed.x, aArchBounds.x, transformed.z, 1.0);
vec4 archHigh = vec4(transformed.x, aArchBounds.y, transformed.z, 1.0);
#ifdef USE_INSTANCING
 archPosition = instanceMatrix * archPosition;
 archLow = instanceMatrix * archLow;
 archHigh = instanceMatrix * archHigh;
#endif
vArchWorld = (modelMatrix * archPosition).xyz;
vArchNormal = inverseTransformDirection(transformedNormal, viewMatrix);
vArchBounds = vec2((modelMatrix * archLow).y, (modelMatrix * archHigh).y);`);
  shader.fragmentShader=replaceOnce(shader.fragmentShader,'#include <common>',`#include <common>
varying vec3 vArchWorld;
varying vec3 vArchNormal;
varying vec2 vArchBounds;
uniform float uArchScale;
uniform vec3 uArchNeon;
uniform float uArchGlow;
uniform float uArchNoise;
float archHash(vec2 p) { vec3 q=fract(vec3(p.xyx)*.1031); q+=dot(q,q.yzx+33.33); return fract((q.x+q.y)*q.z); }
float archNoise(vec2 p) { vec2 i=floor(p),f=fract(p); f=f*f*(3.0-2.0*f); return mix(mix(archHash(i),archHash(i+vec2(1.,0.)),f.x),mix(archHash(i+vec2(0.,1.)),archHash(i+vec2(1.)),f.x),f.y); }`);
  shader.fragmentShader=replaceOnce(shader.fragmentShader,'#include <map_fragment>',`
#ifdef USE_MAP
 vec3 archN = normalize(vArchNormal);
 vec3 archWeights = pow(abs(archN), vec3(4.0));
 archWeights /= max(dot(archWeights, vec3(1.0)), .0001);
 vec3 archP = vArchWorld * uArchScale;
 vec4 archTex = texture2D(map,archP.zy)*archWeights.x + texture2D(map,archP.xz)*archWeights.y + texture2D(map,archP.xy)*archWeights.z;
 diffuseColor *= archTex;
#endif
diffuseColor.rgb *= 1.0 + (archNoise(vArchWorld.xz*.055)-.5)*2.0*uArchNoise;`);
  shader.fragmentShader=replaceOnce(shader.fragmentShader,'#include <emissivemap_fragment>',`#include <emissivemap_fragment>
float archEdge = min(abs(vArchWorld.y-vArchBounds.x), abs(vArchWorld.y-vArchBounds.y));
float archBand = 1.0-smoothstep(.025,.085,archEdge);
float archSide = 1.0-pow(abs(normalize(vArchNormal).y),8.0);
totalEmissiveRadiance += uArchNeon*uArchGlow*archBand*archSide;`);
 };
 material.customProgramCacheKey=()=>VERSION;
 material.userData.architecture={version:VERSION,phase,uniforms,triplanar:true};
 return material;
}
function createMaterial(T,map,own,options={}){const phase=options.phase||0,material=own(new T.MeshStandardMaterial({map,color:COLORS[phase]||COLORS[0],vertexColors:true,metalness:phase===0?.5:.4,roughness:phase===0?.6:.7}));return installTriplanar(material,T,options);}
function attachAttributes(T,geometry,batch){if(batch.arch.length!==batch.v.length/3*2)throw Error('Architecture bounds/vertex mismatch');geometry.setAttribute('aArchBounds',new T.Float32BufferAttribute(batch.arch,2));return geometry;}
scope.ElementalSurfArchitecture={VERSION,COLORS,ACCENTS,isArchitecture,canUseHiddenCap,selectVisualHull,batchCellSize,batchKey,pushTriangle,appendCornerSupports,installTriplanar,createMaterial,attachAttributes};
})(typeof window!=='undefined'?window:globalThis);
