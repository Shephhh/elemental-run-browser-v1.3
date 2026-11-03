/* Isolated Party biome relief and pursuit art. No gameplay colliders. */
(function(g){'use strict';
const profiles=[
 {name:'circuit',height:35,rough:.72,amplitude:.45,body:0x091127,crest:0xff71c4,accent:0x28d6ec},
 {name:'forest',height:39,rough:.9,amplitude:1.1,body:0x123b29,crest:0xa0d779,accent:0x46aa69},
 {name:'cloud',height:43,rough:.91,amplitude:2,body:0x849dcf,crest:0xf6fbff,accent:0xc9b8ef},
 {name:'lava',height:37,rough:.6,amplitude:1.4,body:0x230d0a,crest:0xffc46a,accent:0xff4c12},
 {name:'ocean',height:39,rough:.3,amplitude:1.8,body:0x073748,crest:0xc6f5ee,accent:0x1da7bc},
 {name:'ice',height:41,rough:.65,amplitude:1.2,body:0x305b83,crest:0xe8f9ff,accent:0x78c9e6}
];
const waves=`uniform float partyTime;uniform float partyPhase;uniform float partyAmplitude;
float partyHeight(vec2 p){float t=partyTime;
 if(partyPhase>3.5&&partyPhase<4.5)return partyAmplitude*(sin(p.x*.12+t*.72)*.56+sin(p.y*.21-t*.95)*.3+sin((p.x+p.y)*.065+t*.36)*.4);
 if(partyPhase>2.5&&partyPhase<3.5)return partyAmplitude*(sin(p.x*.095+t*.18)*.45+cos(p.y*.13-t*.25)*.4+sin((p.x-p.y)*.28+t*.23)*.18);
 if(partyPhase>1.5&&partyPhase<2.5)return partyAmplitude*(sin(p.x*.065)*.5+cos(p.y*.08)*.42+sin((p.x+p.y)*.12)*.2);
 if(partyPhase<.5)return .22*sin(p.x*.075)*cos(p.y*.055);
 return partyAmplitude*(sin(p.x*.055)*cos(p.y*.08)*.65+sin((p.x+p.y)*.12)*.3);
}`;
// Repeated source snow maps have a directional gradient at their tile edge.
// Periodic grain replaces that seam in Party only, not the normal game's map.
function snowMap(T,own){const size=256,bytes=new Uint8Array(size*size*4);for(let y=0;y<size;y++)for(let x=0;x<size;x++){const u=x/size*Math.PI*2,v=y/size*Math.PI*2,n=Math.sin(u*7+v*3)*.48+Math.cos(u*17-v*11)*.26+Math.sin(u*37+v*23)*.15;const i=(y*size+x)*4;bytes[i]=221+n*6;bytes[i+1]=237+n*5;bytes[i+2]=246+n*4;bytes[i+3]=255;}const t=own(new T.DataTexture(bytes,size,size,T.RGBAFormat));t.colorSpace=T.SRGBColorSpace;t.wrapS=t.wrapT=T.RepeatWrapping;t.magFilter=T.LinearFilter;t.minFilter=T.LinearMipmapLinearFilter;t.generateMipmaps=true;t.needsUpdate=true;return t;}
function planDecor(data,variant,rows,radius,occupied){
 const race=data.kind==='race',plans=[],ext=data.platforms.reduce((a,p)=>({x:Math.max(a.x,Math.abs(p.x)+p.w/2),lo:Math.min(a.lo,p.z-p.d/2),hi:Math.max(a.hi,p.z+p.d/2)}),{x:0,lo:Infinity,hi:-Infinity});
 const scenicDepth=race?data.depth+240:data.depth;
 const count=race?Math.max(1,Math.min(rows,Math.ceil(scenicDepth/(radius*1.9+4))+1)):Math.min(rows,Math.max(1,Math.floor(Math.PI*Math.max(ext.x,(ext.hi-ext.lo)/2)/(radius*1.8+3))));
 for(let j=0;j<count;j++)for(const side of [-1,1]){let chosen=null;for(let band=0;band<(variant===0?1:5)&&!chosen;band++)for(let attempt=0;attempt<7&&!chosen;attempt++){
  const landmark=variant===3?115:0;let x,z;if(race){z=-(count===1?scenicDepth*.5:j*scenicDepth/(count-1))-variant*5+(attempt?Math.ceil(attempt/2)*(attempt%2?1:-1)*(radius*.8+3):0);if(z>25||z< -scenicDepth-35)continue;let edge=9;for(const p of data.platforms)if(Math.abs(p.z-z)<p.d/2+radius*.4)edge=Math.max(edge,Math.abs(p.x)+p.w/2);x=side*(edge+radius+3+landmark+band*(radius*2.2+10));}
  else{const a=(j*2+(side>0?1:0))*Math.PI/count+variant*.31+attempt*.11;x=Math.cos(a)*(ext.x+radius+6+landmark+band*(radius*2.2+10));z=(ext.lo+ext.hi)/2+Math.sin(a)*((ext.hi-ext.lo)/2+radius+6+landmark+band*(radius*2.2+10));}
  if(Math.abs(x)+radius>235||occupied.some(p=>Math.hypot(x-p.x,z-p.z)<radius+p.radius+2))continue;chosen={x,z,radius,index:j,variant,side};
 }if(chosen){occupied.push(chosen);plans.push(chosen);}}
 return plans;
}
function ground(T,data,api,own){
 const phase=data.theme.phase,profile=profiles[phase],race=data.kind==='race',width=900,depth=race?data.depth+800:900,z=-data.depth/2;
 const mat=phase===2?g.ElementalSurfBiomes.groundMaterial(T,{phase:2},own,api):api.floorMaterial(phase,own,300),time={value:0};
 if(mat.map){mat.map.repeat.set(width/(phase===4?55:32),depth/(phase===4?55:32));mat.map.anisotropy=Math.min(8,api.renderer().capabilities.getMaxAnisotropy());}
 if(phase!==3){mat.roughness=profile.rough;mat.metalness=phase===4?.18:.025;}
 if(phase===4)mat.color.multiplyScalar(.85);
 if(phase===5){mat.map=snowMap(T,own);mat.map.repeat.set(width/32,depth/32);mat.normalMap=null;mat.roughnessMap=null;mat.emissiveMap=mat.map;}
 const previous=mat.onBeforeCompile;mat.onBeforeCompile=s=>{previous?.call(mat,s);Object.assign(s.uniforms,{partyTime:time,partyPhase:{value:phase},partyAmplitude:{value:profile.amplitude}});
  s.vertexShader=waves+'\nvarying vec3 vPartyGround;\n'+s.vertexShader;
  s.vertexShader=s.vertexShader.replace('#include <beginnormal_vertex>','#include <beginnormal_vertex>\nvec2 gp=position.xz;float e=.4;float hx=(partyHeight(gp+vec2(e,0.))-partyHeight(gp-vec2(e,0.)))/(2.*e);float hz=(partyHeight(gp+vec2(0.,e))-partyHeight(gp-vec2(0.,e)))/(2.*e);objectNormal=normalize(vec3(-hx,1.,-hz));');
  s.vertexShader=s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\ntransformed.y+=partyHeight(position.xz);vPartyGround=(modelMatrix*vec4(transformed,1.)).xyz;');
  s.fragmentShader='uniform float partyTime;uniform float partyPhase;varying vec3 vPartyGround;\n'+s.fragmentShader;
  s.fragmentShader=s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
vec2 p=vPartyGround.xz;float h=vPartyGround.y+2.;
if(partyPhase>3.5&&partyPhase<4.5){float crest=smoothstep(.65,1.13,h);float ripples=.5+.5*sin(p.x*.9+p.y*.6-partyTime*1.9);diffuseColor.rgb=mix(diffuseColor.rgb*vec3(.58,.82,.94),vec3(.53,.85,.86),crest*(.2+.22*ripples));}
else if(partyPhase<2.5||partyPhase>4.5){diffuseColor.rgb*=.87+.13*smoothstep(-1.,1.,h);}`);
 };mat.customProgramCacheKey=()=> 'party-biome-relief-161-'+phase;
 const geo=own(new T.PlaneGeometry(width,depth,api.mobile?72:112,api.mobile?96:160));geo.rotateX(-Math.PI/2);geo.computeBoundingBox();geo.boundingBox.min.y=-profile.amplitude*1.5;geo.boundingBox.max.y=profile.amplitude*1.5;geo.computeBoundingSphere();geo.boundingSphere.radius+=profile.amplitude*1.5;
 const mesh=new T.Mesh(geo,mat);mesh.position.set(0,-2,z);mesh.name='party-relief-'+profile.name;
 const base=new T.Mesh(own(new T.BoxGeometry(width,7,depth)),own(new T.MeshStandardMaterial({color:phase===3?0x24130e:phase===4?0x103b49:0x425653,roughness:.96})));base.position.set(0,-11,z);base.name='party-biome-depth-body';
 return{mesh,base,profile,vertices:geo.attributes.position.count,update:t=>{time.value=t;}};
}
// Far-field silhouettes fill the horizon, not the playable corridor. Shared
// low-poly instancing keeps this independent of expensive source GLB counts.
function backdrop(T,data,placements,api,own){
 const root=new T.Group(),phase=data.theme.phase,dummy=new T.Object3D(),race=data.kind==='race',depth=race?data.depth+240:240,points=[];
 const reserve=p=>{const r=Math.hypot(p.w,p.d)*.55;for(let tries=0;tries<10&&placements.some(q=>Math.hypot(p.x-q.x,p.z-q.z)<r+q.radius+2);tries++)p.x+=Math.sign(p.x||1)*12;return p;};
 const batch=(geometry,material,items)=>{if(!items.length)return;const mesh=own(new T.InstancedMesh(own(geometry),own(material),items.length));for(let i=0;i<items.length;i++){const p=items[i];dummy.position.set(p.x,p.y,p.z);dummy.rotation.set(0,p.yaw||0,0);dummy.scale.set(p.w,p.h,p.d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);}mesh.computeBoundingSphere();root.add(mesh);};
 if(phase===0){
  for(let i=0;i<Math.ceil(depth/32)+10;i++)for(const side of [-1,1]){const h=24+(i*17%49),z=80-i*32;points.push(reserve({x:side*(177+(i%3)*15),y:-2+h/2,z,w:10+i%4*3,h,d:14+i%3*3}));}
  const mat=new T.MeshStandardMaterial({color:0x1c3c59,roughness:.62,metalness:.35,emissive:0x143e56,emissiveIntensity:.6,fog:true});
  mat.onBeforeCompile=s=>{s.vertexShader='varying vec3 skylineP;\n'+s.vertexShader;s.vertexShader=s.vertexShader.replace('#include <project_vertex>','#include <project_vertex>\nvec4 skyP=instanceMatrix*vec4(transformed,1.);skylineP=(modelMatrix*skyP).xyz;');s.fragmentShader='varying vec3 skylineP;\n'+s.fragmentShader;s.fragmentShader=s.fragmentShader.replace('#include <emissivemap_fragment>','#include <emissivemap_fragment>\nfloat win=step(.38,fract(skylineP.y*.33))*step(.54,fract((skylineP.x+skylineP.z)*.28));totalEmissiveRadiance+=mix(vec3(.02,.3,.42),vec3(.35,.04,.25),step(.5,fract(skylineP.z*.053)))*win;');};mat.customProgramCacheKey=()=> 'party-skyline-162';batch(new T.BoxGeometry(1,1,1),mat,points);
 }else if(phase===4){
  // Differently sized rocky atolls, behind the safely packed authored islands.
  for(let i=0;i<Math.ceil(depth/55)+7;i++)for(const side of [-1,1]){const h=9+(i*7%17);points.push(reserve({x:side*(158+i%3*18),y:-4+h*.3,z:80-i*55,w:22+i%4*6,h,d:15+i%3*7,yaw:i*.73}));}
  batch(new T.IcosahedronGeometry(.5,1),new T.MeshStandardMaterial({color:0x477c75,roughness:.92}),points);
  batch(new T.IcosahedronGeometry(.5,1),new T.MeshStandardMaterial({color:0x6d975a,roughness:.97}),points.map(p=>({...p,y:p.y+p.h*.43,w:p.w*.78,h:p.h*.19,d:p.d*.8})));
 }
 if(phase===1||phase===5){
  const leaves=[];for(const p of placements){if(p.variant>1||phase===5&&p.variant!==0)continue;for(let k=0;k<5;k++){const angle=k*2.4+p.index*.4;leaves.push({x:p.x+Math.cos(angle)*2.6,y:phase===5?20+k*2.2:23+k*1.8,z:p.z+Math.sin(angle)*2.6,w:2.8+k%2*.5,h:3.2,d:2.7,yaw:angle});}}
  batch(new T.IcosahedronGeometry(1,1),new T.MeshStandardMaterial({color:phase===5?0xc2dfed:0x4c8756,roughness:.92}),leaves);
 }
 // A second scale of scenery fills gaps between the giant source models.
 // Respect both the playable footprint and every accepted source/infill circle.
 const infill=[],reserved=placements.slice(),rows=race?Math.ceil(depth/19):26;
 for(let i=0;i<rows;i++)for(const side of [-1,1]){const radius=4.4+(i%3)*.5,z=race?12-i*19:-data.depth/2+Math.sin(i*2.399)*95;let edge=12;for(const p of data.platforms)if(Math.abs(p.z-z)<p.d/2+radius+2)edge=Math.max(edge,Math.abs(p.x)+p.w/2);for(let band=0;band<7;band++){const x=side*(edge+radius+5+band*12);if(reserved.some(p=>Math.hypot(x-p.x,z-p.z)<radius+p.radius+2))continue;const h=phase===0?5+i%3*2:phase===1?3+i%3*.8:phase===5?3.5+i%3:3+i%4;infill.push({x,y:phase===4?-.7:-2+h*.32,z,w:radius*1.35,h,d:radius*1.1,yaw:i*.87});reserved.push({x,z,radius});break;}}
 batch(phase===0?new T.BoxGeometry(1,1,1):new T.IcosahedronGeometry(.5,1),new T.MeshStandardMaterial({color:[0x29465c,0x427e50,0xc5d8eb,0x443e48,0x5c8b82,0xc5e4f0][phase],roughness:.87,metalness:phase===0?.3:0}),infill);
 root.name='party-horizon-detail';root.userData.instances=points.length;root.userData.infill=infill.length;root.userData.infillBounds=reserved.slice(placements.length);return root;
}
function surge(T,data,own){
 const phase=data.theme.phase,p=profiles[phase],geo=own(new T.PlaneGeometry(400,1,96,24)),a=geo.attributes.position,uv=geo.attributes.uv;
 for(let i=0;i<a.count;i++){const u=uv.getX(i),v=uv.getY(i);let edge=Math.sin(u*19)*2+Math.sin(u*43)*.8;
  if(phase===0)edge=Math.floor(u*28)%3*.9;else if(phase===1)edge=2*Math.sin(u*31)+3*Math.pow(.5+.5*Math.sin(u*47),3);else if(phase===2)edge=3*Math.sin(u*23)+1.5*Math.sin(u*47);else if(phase===3)edge=4*Math.pow(.5+.5*Math.sin(u*29),4);else if(phase===5)edge=4*(1-Math.abs((u*32)%2-1));
  a.setXYZ(i,a.getX(i),-3+v*(p.height+edge),9*Math.sin(v*Math.PI)-Math.max(0,v-.76)*(phase===2?21:phase===1?14:17));
 }geo.computeVertexNormals();geo.computeBoundingSphere();
 const mat=own(new T.ShaderMaterial({side:T.DoubleSide,fog:false,uniforms:{time:{value:0},phase:{value:phase},body:{value:new T.Color(p.body)},crest:{value:new T.Color(p.crest)},accent:{value:new T.Color(p.accent)}},vertexShader:`varying vec2 vUv;varying vec3 vN;uniform float time;uniform float phase;void main(){vUv=uv;vN=normal;vec3 p=position;p.y+=pow(uv.y,3.)*(.65*sin(uv.x*41.+time*2.)+.3*sin(uv.x*85.-time*3.));gl_Position=projectionMatrix*modelViewMatrix*vec4(p,1.);}`,fragmentShader:`varying vec2 vUv;varying vec3 vN;uniform float time;uniform float phase;uniform vec3 body;uniform vec3 crest;uniform vec3 accent;
void main(){float flow=sin(vUv.y*72.-time*5.+sin(vUv.x*42.+time)*2.);float strands=pow(.5+.5*sin(vUv.x*180.+sin(vUv.y*18.-time*2.)*2.),7.);float cap=smoothstep(.82,.97,vUv.y+flow*.012);vec3 c=mix(body,accent,vUv.y*.3+strands*.2);
if(phase<.5){float grid=step(.87,fract(vUv.x*44.))*step(.25,fract(vUv.y*24.-time*.25));c=mix(body,accent,grid*.65);cap*=.7+.3*step(.4,fract(vUv.x*38.));}
else if(phase>2.5&&phase<3.5){float fissure=pow(.5+.5*sin(vUv.x*94.+sin(vUv.y*33.-time)*3.),12.);c=mix(body,accent,fissure*.8+strands*.16);c+=crest*pow(fissure,3.)*.32;}
else if(phase>.5&&phase<1.5){float vine=.5+.5*sin(vUv.x*40.+vUv.y*12.-time*1.2);float leaves=pow(max(0.,cos(vUv.x*90.+vUv.y*22.+time)),10.)*pow(sin(vUv.y*30.-time),2.);c=body+accent*(vine*.3+leaves*.35);}
else if(phase>4.5){float facets=floor(vUv.x*48.+vUv.y*12.);c=mix(body,accent,.15+.25*fract(facets*.618));}
else if(phase>1.5&&phase<2.5)c=mix(body,crest,.25+.35*sin(vUv.x*28.+sin(vUv.y*12.)+time*.5));
else c+=accent*flow*.09;c=mix(c,crest,cap*(.6+.4*pow(.5+.5*sin(vUv.x*265.+time*2.),2.)));c*=.8+.2*abs(vN.z);gl_FragColor=vec4(c,1.);}` }));
 const mesh=new T.Mesh(geo,mat);mesh.name='party-pursuit-'+p.name;mesh.frustumCulled=false;mesh.userData.biome=p.name;return mesh;
}
g.ElementalPartyEnvironment={ground,surge,profiles,planDecor,backdrop};
})(window);
