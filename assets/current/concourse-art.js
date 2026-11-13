/* Plaza and Games art: no gameplay, avatar or progression state. */
(function(){'use strict';
// Same phase IDs as the runner. Each skin shares the avenue/portal footprint.
const skins=[
 {id:'cyber',sky:['#764676','#293665','#0c142f'],fog:'#362b54',ground:'#202d44',stone:'#8194bc',edge:'#475a7c',wall:'#28415d',cap:'#446987',line:'#61efff',far:'#54628c',cloud:'#b59dc8',sun:'#c3caff',hemi:'#d1cbff',fill:'#f692d7',light:1.8},
 {id:'nature',sky:null,fog:'#dfb8c6',ground:'#526d4a',stone:'#b4c0c5',edge:'#d2cbb4',wall:'#426345',cap:'#789b56',line:'#ffb642',far:'#8b839c',cloud:'#f5dce4',sun:'#fff0d5',hemi:'#e8e6ff',fill:'#c3d9ff',light:2.85},
 {id:'sky',sky:['#ffefe4','#b8dfff','#769fef'],fog:'#c2dfff',ground:'#8dacce',stone:'#e5efff',edge:'#f2e6dc',wall:'#8eaccd',cap:'#e5f4ff',line:'#ffdd9a',far:'#829bd4',cloud:'#ffffff',sun:'#fff4e3',hemi:'#e7f3ff',fill:'#c8daff',light:2.2},
 {id:'lava',sky:['#c97952','#5e3246','#241627'],fog:'#8e4a4f',ground:'#4c3535',stone:'#a68b8a',edge:'#986a55',wall:'#583b42',cap:'#815044',line:'#ff874c',far:'#674554',cloud:'#bf8582',sun:'#ffd1a7',hemi:'#f2b0ac',fill:'#d6a6cf',light:2.45},
 {id:'water',sky:['#b7eee1','#59aabc','#32638d'],fog:'#71b1c3',ground:'#4c7779',stone:'#afd4ca',edge:'#e2ce9e',wall:'#327478',cap:'#6caa90',line:'#8effde',far:'#588b98',cloud:'#d9f9f2',sun:'#fff0d3',hemi:'#d2fff5',fill:'#a0d7ef',light:2.5},
 {id:'snow',sky:['#c1c8e6','#7d96cc','#39456e'],fog:'#a3b1d2',ground:'#9ab4c8',stone:'#d2e7f0',edge:'#a9c4d9',wall:'#6789a8',cap:'#edf7ff',line:'#a6ebff',far:'#7c95bc',cloud:'#ebf2ff',sun:'#e6edff',hemi:'#d7e7ff',fill:'#d7d2ff',light:2.25}
];
// Independent palette for the main plaza; the Games hall still uses skins.
const plazaProfiles=[
 {id:'cyber',stone:'#778a9e',wall:'#243347',frame:'#263748',metal:'#6f91ac',detail:'#79d5f4',glow:'#48dfff',key:[-21,26,-10],fill:[26,12,16],sun:1.92,ambient:1.18,rim:.72,fog:.0038},
 {id:'nature',stone:'#b6a686',wall:'#556553',frame:'#46594c',metal:'#ae9771',detail:'#b3c977',glow:'#d2ae6f',key:[-22,35,14],fill:[15,9,-20],sun:2.75,ambient:1.43,rim:.48,fog:.0020},
 {id:'sky',stone:'#dfd5bf',wall:'#a3a6b4',frame:'#8999af',metal:'#cba767',detail:'#ffe6b7',glow:'#ffe0a0',key:[12,40,-23],fill:[-19,13,20],sun:2.1,ambient:1.39,rim:.48,fog:.0019},
 {id:'lava',stone:'#75615c',wall:'#483a40',frame:'#493634',metal:'#946551',detail:'#d49168',glow:'#ff8f51',key:[-29,22,-16],fill:[20,9,21],sun:2.2,ambient:1.31,rim:.74,fog:.0034},
 {id:'water',stone:'#83b4ac',wall:'#3d777e',frame:'#365f68',metal:'#8fbaac',detail:'#a8e5ce',glow:'#73decd',key:[17,32,13],fill:[-25,11,-18],sun:2.4,ambient:1.40,rim:.58,fog:.0025},
 {id:'snow',stone:'#b8d2df',wall:'#7394ac',frame:'#567485',metal:'#9cbdd1',detail:'#d7f0fc',glow:'#b6eaff',key:[-18,31,-21],fill:[17,13,13],sun:2.02,ambient:1.42,rim:.57,fog:.0028}
];
const wallHeight=2.22;
// Four cardinal sectors with a local tangent. Start outside the tallest
// walls; all these placements are scenery, never collision or portal targets.
function horizonPoint(sector,along,out,y){
 const a=sector*Math.PI/2,s=Math.sin(a),c=Math.cos(a);
 return {x:s*out+c*along,y,z:-2-c*out+s*along,yaw:-a};
}
function horizonRange(sector){return sector%2?32:43;}
// Scale a whole landmark around one anchor (windows, roofs and signs stay
// attached). Space anchors farther apart without cancelling the size increase.
function monument(sector,u,out,scale=1.65){
 const r=horizonRange(sector),anchorU=u*1.30,anchorOut=r+(out-r)*1.23+7;
 return (du,y,dr,{sx=1,sy=1,sz=1,...detail}={})=>({
  ...horizonPoint(sector,anchorU+du*scale,anchorOut+dr*scale,y*scale),
  sx:sx*scale,sy:sy*scale,sz:sz*scale,...detail
 });
}
const mistPalettes=[
 ['#68698d','#b3b8d0',-14],['#c4b3c9','#f2e4eb',-16],
 ['#a9c9e3','#f0f8ff',-17],['#ad8796','#eac3bd',-15],
 ['#7aabb6','#c9e9e7',-15],['#a5bada','#edf5ff',-16]
];
const mistProfile=`
 uniform float uMistLevel;
 float gamesMistHeight(vec2 p){
   return uMistLevel+sin(p.x*.085+p.y*.067)*cos(p.y*.063-p.x*.043)*.32;
 }
`;
const mistShading=`
 uniform vec3 uMistDeep,uMistLit,uMistHorizon;
 uniform float uMistClock;
 float mistHash(vec2 p){
   vec3 h=fract(vec3(p.xyx)*.1031); h+=dot(h,h.yzx+33.33); return fract((h.x+h.y)*h.z);
 }
 float mistNoise(vec2 p){
   vec2 i=floor(p), f=fract(p); f=f*f*(3.-2.*f);
   return mix(mix(mistHash(i),mistHash(i+vec2(1.,0.)),f.x),mix(mistHash(i+vec2(0.,1.)),mistHash(i+1.),f.x),f.y);
 }
 vec3 gamesMistShade(vec2 p){
   vec2 uv=p*.088+vec2(uMistClock*.013,-uMistClock*.006);
   float b=.68*mistNoise(uv)+.32*mistNoise(uv*2.46+8.4);
   vec3 clouds=mix(uMistDeep,uMistLit,.28+.44*b);
   return mix(clouds,uMistHorizon,smoothstep(60.,128.,distance(cameraPosition.xz,p)));
 }
`;
function cloudSea(h,root){
 const T=h.T,uniforms={uMistDeep:{value:new T.Color()},uMistLit:{value:new T.Color()},uMistHorizon:{value:new T.Color()},
  uMistLevel:{value:-16},uMistClock:{value:0}};
 const divisions=h.mobile?12:20,geometry=new T.PlaneGeometry(310,310,divisions,divisions).rotateX(-Math.PI/2);
 // Like the running Sky floor, the upper layers are pale and translucent.
 // A lower opaque backing only hides the roots of the exterior scenery.
 const group=new T.Group(),layers=[];group.name='garden-cloud-sea';root.add(group);
 const configs=h.mobile?[[-12,1],[-3,.14]]:[[-12,1],[-7,.13],[0,.09]];
 for(const [offset,opacity] of configs){
  const solid=opacity===1;
  const material=h.track(new T.ShaderMaterial({uniforms:{...uniforms,uMistOffset:{value:offset},uMistOpacity:{value:opacity}},
   side:T.DoubleSide,transparent:!solid,depthWrite:solid,
  vertexShader:mistProfile+`
   uniform float uMistOffset;
   varying vec2 vMistXZ;
   void main(){
    vec4 world=modelMatrix*vec4(position,1.);
    vMistXZ=world.xz;world.y=gamesMistHeight(world.xz)+uMistOffset;
    gl_Position=projectionMatrix*viewMatrix*world;
   }`,
  fragmentShader:mistShading+`
   uniform float uMistOpacity;
   varying vec2 vMistXZ;
   void main(){
    gl_FragColor=vec4(gamesMistShade(vMistXZ),uMistOpacity);
    #include <tonemapping_fragment>
    #include <colorspace_fragment>
   }`}));
  const mesh=h.mesh(geometry,material,0,0,-2,group);mesh.raycast=()=>{};
  mesh.name=solid?'garden-cloud-depth':'garden-cloud-veil';
  mesh.renderOrder=solid?1:2+layers.length;
  layers.push(mesh);
 }
 return {mesh:layers[0],layers,uniforms};
}
function fadeIntoMist(material,mist){
 // Use the same color before tone mapping on both the surface and the
 // prop fade. Built-in distance fog would tint the contact line twice.
 material.fog=false;
 material.onBeforeCompile=shader=>{
  Object.assign(shader.uniforms,mist.uniforms);
  shader.vertexShader='varying vec3 vGamesLandWorld;\n'+shader.vertexShader.replace('#include <project_vertex>',`
    #include <project_vertex>
    vec4 gamesLandPos=vec4(transformed,1.);
    #ifdef USE_INSTANCING
     gamesLandPos=instanceMatrix*gamesLandPos;
    #endif
    vGamesLandWorld=(modelMatrix*gamesLandPos).xyz;`);
  shader.fragmentShader=mistProfile+mistShading+'varying vec3 vGamesLandWorld;\n'+shader.fragmentShader.replace('#include <tonemapping_fragment>',`
    vec2 land=vGamesLandWorld.xz;
    float height=vGamesLandWorld.y-gamesMistHeight(land);
    float spread=sin(land.x*.11+land.y*.083)*1.65+cos(land.y*.091-land.x*.039)*1.1;
    float groundHaze=1.-smoothstep(${mist.plaza?'-17.,19.':'-12.,13.'},height+spread);
    float farHaze=.55*smoothstep(48.,151.,distance(cameraPosition,vGamesLandWorld));
    float gamesHaze=1.-(1.-groundHaze)*(1.-farHaze);
    if(gamesHaze>.001)gl_FragColor.rgb=mix(gl_FragColor.rgb,gamesMistShade(vGamesLandWorld.xz),gamesHaze);
    #include <tonemapping_fragment>`);
 };
 material.customProgramCacheKey=()=>mist.plaza?'plaza-landmark-height-mist-v5':'games-landmark-height-mist-v4';
}
function skyDome(h,root){
 const T=h.T,bands=[new T.Color(),new T.Color(),new T.Color()];
 const sky=h.mesh(new T.SphereGeometry(160,32,16),h.track(new T.ShaderMaterial({side:T.BackSide,depthWrite:false,fog:false,
  uniforms:{bands:{value:bands}},vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.);}',
  fragmentShader:'varying vec3 vDir;uniform vec3 bands[3];void main(){float y=normalize(vDir).y;vec3 c=mix(bands[0],bands[1],smoothstep(-.08,.32,y));c=mix(c,bands[2],smoothstep(.28,.95,y));gl_FragColor=vec4(c,1.);\n#include <colorspace_fragment>\n}'})),0,0,-2,root);
 sky.name='garden-gradient-sky';sky.raycast=()=>{};sky.renderOrder=-10;
 return bands;
}
function paintSkyAndMist(phase,bands,mist){
 const colors=skins[phase].sky;
 for(let i=0;i<3;i++){
  if(colors)bands[i].set(colors[i]);else bands[i].setRGB(...[[.96,.76,.66],[.78,.57,.72],[.38,.44,.64]][i]);
 }
 const [deep,lit,height]=mistPalettes[phase],u=mist.uniforms;
 u.uMistDeep.value.set(deep);u.uMistLit.value.set(lit);u.uMistLevel.value=height;u.uMistHorizon.value.copy(bands[0]);
}
function floatingFoundation(h,root,material){
 const corners=[[-18.5,-30.5],[18.5,-30.5],[18.5,30.5],[-18.5,30.5]],vertices=[],indices=[];
 const rings=[[-1.13,1,1,0,0],[-4.2,.96,.96,.15,-.2],[-11.8,.71,.76,-.9,.5],[-20.4,.38,.41,-1.4,.9]];
 rings.forEach(([y,sx,sz,dx,dz],row)=>corners.forEach(([x,z],i)=>vertices.push(x*sx+dx,y+(row>1?((i*7+row)%4-1.5)*.65:0),z*sz+dz)));
 for(let row=0;row<rings.length-1;row++)for(let i=0;i<4;i++){
  const a=row*4+i,b=row*4+(i+1)%4;indices.push(a,b,a+4,b,b+4,a+4);
 }
 indices.push(12,13,14,12,14,15);
 const geo=new h.T.BufferGeometry();geo.setAttribute('position',new h.T.Float32BufferAttribute(vertices,3));geo.setIndex(indices);geo.computeVertexNormals();
 const mesh=h.mesh(geo,material,0,0,-2,root);mesh.name='garden-floating-foundation';mesh.raycast=()=>{};
}
function instances(h,root,name,geometry,material,items,shadows=true){
 const T=h.T,mesh=h.track(new T.InstancedMesh(h.track(geometry),material,items.length)),m=new T.Matrix4(),q=new T.Quaternion(),p=new T.Vector3(),s=new T.Vector3(),e=new T.Euler();
 items.forEach((v,i)=>{p.set(v.x||0,v.y||0,v.z||0);if(v.q)q.copy(v.q);else q.setFromEuler(e.set(v.rx||0,v.yaw||0,v.rz||0,'YXZ'));s.set(v.sx??1,v.sy??1,v.sz??1);m.compose(p,q,s);mesh.setMatrixAt(i,m);if(v.color)mesh.setColorAt(i,new T.Color(v.color));});
 mesh.instanceMatrix.needsUpdate=true;mesh.name=name;mesh.castShadow=shadows;mesh.receiveShadow=true;mesh.computeBoundingSphere();root.add(mesh);return mesh;
}
function rounded(h,w,y,d,r){const node=h.bevelBox(w,y,d,h.concourseStone,0,0,0,h.scene,r);node.removeFromParent();return node.geometry;}
function perimeter(h,root,wall,cap,edge,line){
 // Top is above the normal jump apex (8.5² / (2×22) = 1.64 m).
 // The visible inside face is also the movement boundary.
 const panels=[],tops=[],plinths=[],details=[],leaves=[];
 for(const [x,z,length,yaw] of [[-18,-2,59,Math.PI/2],[18,-2,59,Math.PI/2],[0,-32,37,0],[0,28,37,0]]){
  const at=(u,y,depth=0)=>({x:x+Math.cos(yaw)*u+Math.sin(yaw)*depth,y,z:z-Math.sin(yaw)*u+Math.cos(yaw)*depth,yaw});
  panels.push({...at(0,.88),sx:length+(yaw?.06:0),sy:1.76,sz:.94});
  tops.push({...at(0,1.98),sx:length,sy:.48,sz:1});
  plinths.push({...at(0,.14),sx:length,sy:.28,sz:1});
  const count=Math.ceil(length/3.75),step=length/count;
  for(let i=0;i<count;i++)details.push({...at((i+.5)*step-length/2,1.67,(x<0||z===-32?1:-1)*.478),sx:step*.78,sy:.038,sz:.034});
  const inward=x<0||z===-32?1:-1;
  for(let i=0;i<Math.floor(length/.66);i++)leaves.push({...at(-length/2+.4+i*.66,.62+(i*19%11)*.087,inward*.47),
    sx:.28+(i%4)*.05,sy:.21+(i%5)*.036,sz:.027,rz:(i%5-2)*.17,color:['#72995d','#688a54','#547847','#87a76b'][i%4]});
  h.solids.push({x,z,hx:yaw?.5:length/2,hz:yaw?length/2:.5,perimeter:true});
 }
 const unit=new h.T.BoxGeometry(1,1,1);
 instances(h,root,'garden-boundary-body',unit,wall,panels);
 instances(h,root,'garden-boundary-cap',unit,cap,tops);
 instances(h,root,'garden-boundary-plinth',unit,edge,plinths,false);
 instances(h,root,'garden-boundary-inlay',unit,line,details,false);
 const hedge=instances(h,root,'garden-hedge-leaves',new h.T.OctahedronGeometry(1),h.material('#c2cfb7',{flatShading:true,roughness:1}),leaves,false);
 hedge.raycast=()=>{};return hedge;
}
function biomeLandmarks(h,root,positions,mist){
 const T=h.T,groups=skins.map(s=>{const g=new T.Group();g.name='garden-biome-'+s.id;g.visible=false;root.add(g);return g;});
 const box=new T.BoxGeometry(1,1,1),cone=new T.ConeGeometry(1,1,6),rock=new T.CylinderGeometry(.65,1,1,6),crystal=new T.OctahedronGeometry(1);
 const batch=(phase,name,geo,color,items,extra={},casts=true)=>{
  if(!items.length)return null;
  const mesh=instances(h,groups[phase],name,geo,h.material(color,{flatShading:true,...extra}),items,casts);
  // Landmark decorations are not camera blockers. Collision footprints are
  // the small, stable planted islands shared by all six themes.
  mesh.raycast=()=>{};return mesh;
 };
 const towers=[],windows=[],poles=[],lamps=[];
 for(let sector=0;sector<4;sector++)for(let col=0;col<(h.mobile?5:7);col++){
  const i=sector*7+col,u=(col-(h.mobile?2:3))*9.4+(sector%2?2:-2),out=horizonRange(sector)+8+(i%3)*9,
   sy=11+(i*17%22),sx=4.5+(i%4)*.9,sz=5+(i%3);
  const place=monument(sector,u,out),bottom=-20;
  // Towers continue down below the mist, instead of sitting on visible pads.
  towers.push(place(0,(sy-1.4+bottom)*.5,0,{sx,sy:sy-1.4-bottom,sz,color:i%2?'#c3bddd':'#9daece'}));
  for(let j=2;j<sy-3;j+=h.mobile?4.8:2.4){
   const color=['#67e5ff','#b78cff','#ff83cd'][(i+j*5|0)%3];
   // Front ribbon plus one return along the side, readable from the corners.
   windows.push(place(0,j,-sz*.5-.03,{sx:sx*.66,sy:.54,sz:.045,color}));
   if(!h.mobile)windows.push(place(sx*.5+.03,j,0,{sx:.045,sy:.54,sz:sz*.58,color}));
  }
 }
 positions.forEach(([x,z])=>{poles.push({x,y:1.8,z,sx:.34,sy:3.6,sz:.34});lamps.push({x,y:3.6,z,sx:.57,sy:.5,sz:.57});});
 fadeIntoMist(batch(0,'cyber-skyline',box,'#536487',towers,{metalness:.32},false).material,mist);
 fadeIntoMist(batch(0,'cyber-skyline-windows',box,'#ffffff',windows,{emissive:'#958cbb',emissiveIntensity:.75},false).material,mist);
 batch(0,'cyber-light-posts',box,'#405070',poles);
 batch(0,'cyber-light-heads',box,'#94edff',lamps,{emissive:'#60ddff',emissiveIntensity:.8},false);
 const basalt=[],embers=[],ice=[],firs=[],snow=[],coral=[],buoys=[],spires=[],pools=[],ripples=[];
 positions.forEach(([x,z],i)=>{
  for(let j=0;j<3;j++){
   const angle=j*2.4+i,bx=x+Math.cos(angle)*.8,bz=z+Math.sin(angle)*.8,height=1.4+((i+j)%3)*.72;
   basalt.push({x:bx,y:height/2,z:bz,sx:.55,sy:height,sz:.55,yaw:angle});
   embers.push({x:bx,y:height*.72,z:bz,sx:.24,sy:.55,sz:.24,yaw:angle});
   coral.push({x:bx,y:height*.4,z:bz,sx:.34,sy:height*.8,sz:.34,rz:(j-1)*.3,color:['#f3989a','#8bdac6','#f2c78f'][j]});
   firs.push({x,y:1.27+j*1.08,z,sx:1.52-j*.36,sy:2.45-j*.4,sz:1.52-j*.36,yaw:i*.75});
   snow.push({x,y:1.56+j*1.08,z,sx:1.34-j*.32,sy:1.92-j*.31,sz:1.34-j*.32,yaw:i*.75});
  }
  ice.push({x,y:.58,z:z+.95,sx:.55,sy:1.08,sz:.55,rz:.3});
  spires.push({x,y:1.6,z,sx:.95,sy:1.6,sz:.95,yaw:i*.7},{x:x+.75,y:.65,z:z+.6,sx:.5,sy:.65,sz:.5,rz:-.26});
  pools.push({x,y:.062,z,sx:2.05,sy:.07,sz:1.66,yaw:i*.7});
  for(const side of [-1,1])ripples.push({x:x+side*1.54,y:.102,z:z+.44,sx:.42,sy:.006,sz:.055,yaw:i*.7});
 });
 for(let sector=0;sector<4;sector++)for(let i=0;i<5;i++)buoys.push(monument(sector,(i-2)*8.5,horizonRange(sector)+(i%3)*4)(0,-9.5,0,{sx:.7,sy:2.5,sz:.7,color:i%2?'#ffd79b':'#f2a08c'}));
 batch(2,'sky-cloudstone-spires',crystal,'#cedcff',spires,{metalness:.12,roughness:.39});
 batch(3,'lava-basalt-columns',rock,'#5e424e',basalt);
 batch(3,'lava-embers',crystal,'#ff9f5e',embers,{emissive:'#ff642a',emissiveIntensity:.78},false);
 batch(3,'lava-molten-basins',rock,'#b63b21',pools,{emissive:'#f25e22',emissiveIntensity:.65},false);
 batch(4,'water-coral-gardens',rock,'#ffffff',coral);
 batch(4,'water-tidal-basins',rock,'#4ba7b2',pools,{roughness:.32,metalness:.15},false);
 batch(4,'water-tidal-ripples',box,'#b3eee3',ripples,{emissive:'#83cfc6',emissiveIntensity:.2},false);
 fadeIntoMist(batch(4,'water-harbor-buoys',rock,'#ffffff',buoys,{},false).material,mist);
 batch(5,'snow-pines',cone,'#37626e',firs);
 batch(5,'snow-pine-caps',cone,'#dcefff',snow);
 batch(5,'snow-ice-crystals',crystal,'#8ed3ef',ice,{roughness:.38,metalness:.12});
 biomeHorizon(h,batch,{box,rock,crystal},mist);
 return groups;
}
function biomeHorizon(h,batch,{box,rock,crystal},mist){
 const T=h.T,hills=[],trunks=[],woodland=[],ruins=[],pillars=[],arches=[],volcanoes=[],craters=[],veins=[],
  shores=[],lighthouses=[],stripes=[],beacons=[],boats=[],sails=[],wakes=[],mountains=[],snowcaps=[],glaciers=[];
 for(let s=0;s<4;s++){
  const range=horizonRange(s),offset=(s%2?1:-1)*4;
  for(let n=0;n<3;n++){
   const u=(n-1)*21+offset,r=range+9+(n%2)*10,i=s*3+n;
   const woods=monument(s,u,r+9),sanctuary=monument(s,u,r+5),volcano=monument(s,u,r+13),alpine=monument(s,u,r+12);
   // Raised banks anchor the nearer woods; the second ring is painted by fog.
   const forestTop=1.25+(i%3)*1.25;
   hills.push(woods(0,(forestTop-20)*.5,0,{sx:13.5,sy:forestTop+20,sz:9,color:i%2?'#8c9d63':'#aec086'}));
   for(let j=0;j<(h.mobile?3:5);j++){
    const a=j*2.399+i*.62,px=Math.cos(a)*5.7,pr=Math.sin(a)*3.7,sy=5+(i*3+j*7)%7,groundY=forestTop-.05;
    trunks.push(woods(px,groundY+sy*.23,pr,{sx:.46,sy:sy*.46,sz:.46}));
    woodland.push(woods(px,groundY+sy*.65,pr,{sx:sy*.31,sy:sy*.42,sz:sy*.28,color:['#709451','#4c765c','#a4af65'][j%3],yaw:a}));
   }
   const y=7+(i*3%12),baseY=-20;
   ruins.push(sanctuary(0,(y+baseY)*.5,0,{sx:5+(i%2)*1.8,sy:y-baseY,sz:5}));
   for(const sign of [-1,1])pillars.push(sanctuary(sign*2.25,y+2.6,0,{sx:.72,sy:5.2,sz:.72}));
   if(i%3!==0)arches.push(sanctuary(0,y+5.55,0,{sx:6,sy:.7,sz:1.25}));
   const v=31+(i*5%14);
   volcanoes.push(volcano(0,baseY+v*.5,0,{sx:11+(i%3)*1.8,sy:v,sz:12}));
   craters.push(volcano(0,baseY+v+.03,0,{sx:3,sy:.26,sz:3}));
   // Slanted hot rock facets start at the rim and end on the cone face.
   const dy=v*.60,dz=12*.73*.60;
   veins.push(volcano(-.38,baseY+v*.66,-6.25,{rx:-Math.atan2(dz,dy),sx:.6,sy:Math.hypot(dy,dz)*.5,sz:.55}));
   const height=31+(i*7%15),width=13+(i%3)*2;
   mountains.push(alpine(0,baseY+height/2,0,{sx:width,sy:height,sz:14}));
   snowcaps.push(alpine(0,baseY+.08+height*.83,0,{sx:width*.349,sy:height*.34,sz:14*.349}));
   glaciers.push(monument(s,u+5.4,r-5)(0,-6.8,0,{sx:2.6,sy:12.6+(i%4),sz:2.45,rz:.10,color:i%2?'#95d0ef':'#bae4f0'}));
  }
  const out=range+8,u=offset-8,lighthouse=monument(s,u,out);
  shores.push(lighthouse(0,-9.5,0,{sx:10,sy:21,sz:8}));
  lighthouses.push(lighthouse(0,5.5,0,{sx:1.7,sy:9,sz:1.7}));
  for(const y of [3.7,6.25,8.55])stripes.push(lighthouse(0,y,0,{sx:1.64-(y-3.7)*.067,sy:.98,sz:1.64-(y-3.7)*.067}));
  beacons.push(lighthouse(0,10.35,0,{sx:1.25,sy:1.15,sz:1.25}));
  for(let j=0;j<2;j++){
   const x=offset+9+j*11,r=range+5+j*10,boat=monument(s,x,r);
   // The veils above are air, not a waterline. Anchor hulls on the deeper
   // backing so looking down cannot reveal suspended boats underneath.
   boats.push(boat(0,-16.35,0,{sx:3.3,sy:1.3,sz:1.2,color:j?'#cd8668':'#deac71'}));
   sails.push(boat(0,-13.45,0,{sx:1.8,sy:3.15,sz:.15,rz:j?.19:-.14}));
   for(const q of [-1,1])wakes.push(boat(q*.7,-16.15,q*2,{sx:4.4,sy:.012,sz:.15}));
  }
 }
 const far=(phase,name,geo,color,items,extra={})=>{
  const mesh=batch(phase,name,geo,color,items,extra,false);
  fadeIntoMist(mesh.material,mist);
 };
 const hill=new T.IcosahedronGeometry(1,0),wood=new T.IcosahedronGeometry(1,1),cylinder=new T.CylinderGeometry(.75,1,1,8);
 far(1,'nature-woodland-banks',rock,'#6d845d',hills);
 far(1,'nature-woodland-trunks',cylinder,'#78594a',trunks);
 far(1,'nature-woodland-canopies',wood,'#ced8b3',woodland);
 far(2,'sky-floating-sanctuaries',rock,'#99acce',ruins);
 far(2,'sky-sanctuary-columns',cylinder,'#e9dfd3',pillars);
 far(2,'sky-sanctuary-lintels',box,'#f1dfbf',arches);
 far(3,'lava-volcanoes',new T.CylinderGeometry(.27,1,1,8), '#673d49',volcanoes);
 far(3,'lava-crater-lights',cylinder,'#fa7943',craters,{emissive:'#ff622b',emissiveIntensity:1});
 far(3,'lava-flow-facets',crystal,'#db5b36',veins,{emissive:'#f54719',emissiveIntensity:.8});
 far(4,'water-shore-islands',rock,'#bda688',shores);
 far(4,'water-lighthouse-towers',cylinder,'#f1dbb7',lighthouses);
 far(4,'water-lighthouse-bands',new T.CylinderGeometry(.98,1,1,8),'#c96561',stripes);
 far(4,'water-beacon-lanterns',cylinder,'#fff0b5',beacons,{emissive:'#ffdb86',emissiveIntensity:.85});
 far(4,'water-sailboat-hulls',hill,'#ffffff',boats);
 far(4,'water-sailboat-sails',crystal,'#f8e9ca',sails);
 far(4,'water-harbor-wakes',box,'#a5e2da',wakes);
 const peak=new T.ConeGeometry(1,1,7);
 far(5,'snow-alpine-ridges',peak,'#728eaf',mountains);
 far(5,'snow-alpine-caps',peak,'#eef5ff',snowcaps);
 far(5,'snow-glacier-spires',crystal,'#c3e5f9',glaciers,{roughness:.4});
}
function build(h){
 const T=h.T,root=new T.Group();root.name='games-garden-art';h.scene.add(root);
 const stone=h.concourseStone=h.material('#b4c0c5',{roughness:.68,metalness:.04}),soil=h.material('#526d4a',{roughness:.94}),grass=h.material('#7d9860',{roughness:.93}),edge=h.material('#d2cbb4',{roughness:.72}),base=h.material('#455365',{roughness:.8}),gold=h.material('#ffd68c',{emissive:'#ffb642',emissiveIntensity:.65,roughness:.5});
 const wall=h.material('#426345',{roughness:.94,flatShading:true}),cap=h.material('#789b56',{roughness:.91});
 const hedge=perimeter(h,root,wall,cap,edge,gold);
 h.box(37,1.1,61,base,0,-.58,-2,false,root);h.box(36,.08,60,soil,0,-.055,-2,false,root);h.box(12.6,.05,60,base,0,-.025,-2,false,root);
 const foundation=h.material('#615b65',{roughness:.96,flatShading:true}),mist=cloudSea(h,root);
 floatingFoundation(h,root,foundation);
 // A single instanced paving mesh. Tile tops match the existing y=0 support.
 const slabs=[];for(let row=0;row<20;row++)for(let col=0;col<4;col++)slabs.push({x:(col-1.5)*3.12,y:-.105,z:26.5-row*3,color:['#acb8be','#bbc3c4','#aeb9c1','#bec6c8'][(row*7+col*3)%4]});
 instances(h,root,'garden-paving',rounded(h,3.065,.27,2.95,.055),stone,slabs,false);
 const curbs=[],lights=[],beds=[];
 for(const side of [-1,1]){
  for(let row=0;row<20;row++){const z=26.5-row*3;curbs.push({x:side*6.46,y:.09,z});lights.push({x:side*6.22,y:.044,z:z+.25});}
  for(const z of [20.5,.5,-14.5]){beds.push({x:side*12.15,y:-.025,z});}
 }
 instances(h,root,'garden-curbs',rounded(h,.36,.24,2.94,.035),edge,curbs,false);
 for(let row=0;row<20;row+=2)for(const side of [-1,1])lights.push({x:side*3.12,y:.044,z:26.5-row*3,sx:.8,sz:.55});
 instances(h,root,'garden-guide-inlays',new T.BoxGeometry(.065,.015,1.6),gold,lights,false);
 instances(h,root,'garden-grass-beds',rounded(h,10.5,.12,5.4,.08),grass,beds,false);
 // Portal forecourts sit flush, without steps or raised collision seams.
 const courts=[];for(const side of [-1,1])for(const z of [8,-7,-22])courts.push({x:side*9.5,y:-.075,z});
 instances(h,root,'garden-portal-courts',rounded(h,6,.2,8.8,.06),stone,courts,false);
 const trunks=[],branches=[],crowns=[[],[],[]],stems=[],shadows=[];
 const positions=[[-13,20],[13,20],[-13,.5],[13,.5],[-13,-14.5],[13,-14.5],[-10,-29],[10,-29]];
 const landmarks=biomeLandmarks(h,root,positions,mist),greenery=new T.Group();root.add(greenery);
 positions.forEach(([x,z],i)=>{
  const scale=.88+(i%3)*.11,yaw=i*2.399;
  trunks.push({x,y:1.65*scale,z,sx:.22*scale,sy:3.3*scale,sz:.22*scale,yaw});
  for(const side of [-1,1])branches.push({x:x+side*.43,y:2.8*scale,z,sx:.11,sy:1.65*scale,sz:.11,rz:-side*.6});
  crowns[i%3].push({x:x+.32*Math.sin(yaw),y:4.6*scale,z,sx:scale,sy:scale,sz:scale,yaw});
  stems.push({x,y:.21,z,sx:1.5,sy:.42,sz:1.5});
  h.contactShadow(x,z,7,6,.043,root);shadows.push({x:x+1.8,y:.041,z:z-1.8,sx:4.4,sz:3.2});
  h.solids.push({x,z,hx:1,hz:1});
 });
 instances(h,greenery,'garden-trunks',new T.CylinderGeometry(.62,1,1,7),h.material('#765244',{roughness:.9}),trunks);
 instances(h,greenery,'garden-branches',new T.CylinderGeometry(.5,1,1,6),h.material('#765244',{roughness:.9}),branches);
 instances(h,root,'garden-tree-islands',new T.CylinderGeometry(1,.9,1,10),soil,stems,false);
 const leaf=h.material('#ffffff',{vertexColors:true,roughness:.85,flatShading:true});
 for(let i=0;i<3;i++)instances(h,greenery,'garden-crowns-'+i,window.ElementalTreeCanopy.geometry(T,{seed:17+i*5,radius:2.15,height:3.9,aspect:.86,style:['oak','young','birch'][i],palette:['#436c4d','#74955b','#b2bd70']}),leaf,crowns[i]);
 // Small planting stays in beds, never in the central walkway or trigger pads.
 const shrubs=[],flowers=[];for(let i=0;i<positions.length;i++){const [x,z]=positions[i];for(let j=0;j<3;j++){const a=i+j*2.4;shrubs.push({x:x+Math.cos(a)*2,y:.36,z:z+Math.sin(a)*1.45,sx:.7,sy:.48,sz:.65,yaw:a});flowers.push({x:x+Math.cos(a)*2,y:.75,z:z+Math.sin(a)*1.45,sx:.13,sy:.13,sz:.13,color:i%2?'#ffe0aa':'#eebdcb'});}}
 instances(h,greenery,'garden-shrubs',new T.IcosahedronGeometry(1,0),h.material('#719c70',{roughness:.9}),shrubs,false);
 instances(h,greenery,'garden-flowers',new T.IcosahedronGeometry(1,0),h.material('#ffffff',{roughness:.75}),flowers,false);
 greenery.traverse(o=>{if(!o.isMesh)return;const raycast=o.raycast;o.raycast=function(...args){if(greenery.visible)raycast.apply(this,args);};});
 // Soft directional ground shadows supplement the static desktop shadow map.
 const shadowMaterial=h.track(new T.MeshBasicMaterial({color:'#334351',transparent:true,opacity:.1,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1}));
 const sg=new T.CircleGeometry(1,20);sg.rotateX(-Math.PI/2);instances(h,root,'garden-soft-shadows',sg,shadowMaterial,shadows,false);
 const skyBands=skyDome(h,root);
 const peaks=[],caps=[],clouds=[],hills=[];
 for(let sector=0;sector<4;sector++){
  const r=horizonRange(sector),offset=sector%2?3:-2;
  for(let i=0;i<(h.mobile?2:3);i++){
   const u=[-23,27,5][i]+offset,out=r+[21,34,59][i],y=[14,21,29][i]+(sector%3)*2,size=[5.6,7.5,3.8][i];
   // Only the playable plaza floats. Distant rock stacks rise out of the mist.
   const summit=y*.64,place=monument(sector,u,out),bottom=-20;
   peaks.push(place(0,(summit+bottom)*.5,0,{sx:size,sy:summit-bottom,sz:size*.87}));
   caps.push(place(0,summit+.42,0,{sx:size*.78,sy:1.2,sz:size*.69}));
   for(let j=0;j<3;j++)clouds.push(place((j-1)*2.8,summit+1.35+(j%2)*.75,-2.6,{sx:3.25,sy:1+(j%2)*.48,sz:1.95}));
  }
  // Additional cloud banks at two heights frame all approach angles.
  for(let i=0;i<(h.mobile?3:5);i++){
   const u=(i-(h.mobile?1:2))*19+offset+4,y=6+(i*7+sector*3)%15,out=r+30+(i%3)*13;
   for(let j=0;j<3;j++)clouds.push({...horizonPoint(sector,u+(j-1)*5,out+(j%2)*2,y+(j%2)*1.55),
    sx:6.1+(i%3)*1.3,sy:1.38+(j%2)*1.18,sz:3.8+(i%2)});
  }
  for(let i=0;i<6;i++)hills.push(monument(sector,(i-2.5)*21,r+37+(i%3)*9,1.48)(0,-10,0,{sx:17,sy:12+(i%4)*1.5,sz:14,yaw:i*1.7}));
 }
 const stoneFar=h.material('#8b839c',{roughness:1,flatShading:true}),capMat=h.material('#abb5a0',{roughness:1});
 const peakMesh=instances(h,root,'garden-cloud-peaks',new T.CylinderGeometry(.76,1.39,1,6),stoneFar,peaks,false);peakMesh.raycast=()=>{};
 fadeIntoMist(stoneFar,mist);
 const peakCaps=instances(h,root,'garden-cloud-peak-caps',new T.CylinderGeometry(.85,1,1,6),capMat,caps,false);peakCaps.raycast=()=>{};
 const cloudMesh=instances(h,root,'garden-clouds',new T.SphereGeometry(1,10,6),h.material('#f5dce4',{roughness:1,emissive:'#dfb6ce',emissiveIntensity:.38}),clouds,false);cloudMesh.raycast=()=>{};
 const ridge=h.material('#9d999f',{roughness:1,flatShading:true});
 const ridges=instances(h,root,'garden-distant-ridges',new T.IcosahedronGeometry(1,0),ridge,hills,false);
 ridges.raycast=()=>{};fadeIntoMist(ridge,mist);
 root.userData.decorative=true;
 return {root,skyBands,cloudMesh,peakMesh,peakCaps,landmarks,greenery,hedge,mist,paints:{stone,soil,grass,edge,base,gold,wall,cap,stoneFar,capMat,ridge,foundation}};
}
// The main plaza has its own scenery and palette; its kiosks, controls and
// platform heights stay in lobby-hub.js. Both rooms share the fog/shader code.
function buildPlaza(h){
 const T=h.T,root=new T.Group();root.name='elemental-plaza-art';h.scene.add(root);
 const skyBands=skyDome(h,root),mist=cloudSea(h,root);mist.plaza=true;
 const landmarks=biomeLandmarks(h,root,[],mist);
 const pavement=h.material('#b4c0c5',{roughness:.73,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}),trim=h.material('#edd6ae',{roughness:.57,metalness:.16,emissive:'#ffdba3',emissiveIntensity:.21});
 const tiles=[],inlays=[],caps=[];
 for(const side of [-1,1])for(let i=0;i<16;i++){
  const z=-23.5+i*3;
  // Keep the finish below the existing jelly decal height (.03 + .013).
  tiles.push({x:side*4.28,y:.035,z,color:['#d9dad6','#f6f4ed','#e7e7e4','#e0e3e5'][(i*13+(side+1))%4]});
  inlays.push({x:side*2.91,y:.031,z});
 }
 for(const s of h.wallSides)for(let i=0;i<7;i++){
  const u=(i-3)*s.width/7;
  caps.push({x:s.x+Math.cos(s.yaw)*u,y:h.plazaWallHeight+.12,z:s.z-Math.sin(s.yaw)*u,yaw:s.yaw});
 }
 const tile=instances(h,root,'plaza-avenue-stone',new T.PlaneGeometry(2.65,2.955).rotateX(-Math.PI/2),pavement,tiles,false);
 const seam=instances(h,root,'plaza-avenue-inlays',new T.BoxGeometry(.066,.018,1.85),trim,inlays,false);
 const cornice=instances(h,root,'plaza-wall-cornices',new T.BoxGeometry(2.25,.26,1.28),trim,caps,false);
 tile.raycast=seam.raycast=cornice.raycast=()=>{};
 const puffs=[];
 for(let sector=0;sector<4;sector++)for(let i=0;i<(h.mobile?2:3);i++){
  const u=(i-1)*24+(sector%2?8:-5),out=horizonRange(sector)+27+(i%2)*14,y=17+(i*7+sector*3)%11;
  for(let k=0;k<3;k++)puffs.push({...horizonPoint(sector,u+(k-1)*5.6,out+k%2*1.8,y+k%2*2),sx:6.8,sy:1.7+k%2*.5,sz:4.3});
 }
 const cloudMat=h.material('#ebd7e2',{roughness:1,emissive:'#dbc8de',emissiveIntensity:.27});
 const clouds=instances(h,root,'plaza-distant-clouds',new T.SphereGeometry(1,10,6),cloudMat,puffs,false);
 clouds.raycast=()=>{};
 const architecture=buildPlazaArchitecture(h,root,landmarks);
 buildPlazaPlanters(h,landmarks);
 buildPlazaDressing(h,landmarks);
 return {root,skyBands,mist,landmarks,pavement,trim,architecture,clouds,cloudMat,phase:-1};
}
function plazaFlower(T){
 const g=new T.BufferGeometry(),vertices=[],colors=[],petal=new T.Color('#ffffff'),heart=new T.Color('#ffce49');
 const tri=(a,b,c,tint)=>{vertices.push(...a,...b,...c);for(let i=0;i<3;i++)colors.push(tint.r,tint.g,tint.b);};
 for(let i=0;i<5;i++){
  const a=i*Math.PI*.4,at=(r,w,y)=>[r*Math.cos(a)-w*Math.sin(a),y,r*Math.sin(a)+w*Math.cos(a)];
  const left=at(.57,-.33,.07),right=at(.57,.33,.07),tip=at(1,0,.16),fold=at(.58,0,.15),base=at(.13,0,0);
  tri(base,left,fold,petal);tri(left,tip,fold,petal);tri(tip,right,fold,petal);tri(right,base,fold,petal);
  tri([0,.21,0],at(.23,-.12,.05),at(.23,.12,.05),heart);
 }
 g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.computeVertexNormals();
 return g;
}
function plazaSeed(seed){
 return ()=>{
  seed=(seed+0x6d2b79f5)|0;
  let t=Math.imul(seed^(seed>>>15),seed|1);
  t^=t+Math.imul(t^(t>>>7),t|61);
  return ((t^(t>>>14))>>>0)/4294967296;
 };
}
// Uneven beds in the open spaces, not lane markers. Stable across lobby visits;
// the mobile profile omits some small satellite tufts, not whole new locations.
function plazaGroundBeds(phase,clear){
 const gardens=[
  [-8.9,-20.8,2.6,2.9,3],[-8.0,-9.4,1.6,2.8,2],[-8.7,1,1.5,2.7,2],[-8.5,11.9,2,3.5,3],
  [-19.8,17.9,2.6,3.2,2],[-20.6,-20.8,2.7,2.1,2],[-13.4,23.5,3.5,2.7,2],
  [8.6,-18.0,1.9,3.5,3],[10.6,-6.2,3.6,2.8,3],[7.7,6.6,1.45,4.1,3],[13.6,11.8,3.5,2.7,3],
  [22.8,-19.0,3.6,3.9,3],[20.0,-6.3,2.8,2.3,2],[29.9,7.3,1.6,2.8,2],[24.3,23.0,3.8,2.4,3]
 ];
 // Authored focal areas for each biome. The same courtyard paths stay empty,
 // but the decoration no longer shares Nature's distribution or silhouettes.
 const islands=[
  [[-8.5,11,2.0,4.8,4],[-10.2,-14.6,2.4,5,4],[-19,-4,1.8,5.4,3],[-19.5,22.6,3.2,2.1,3],
   [8.7,-20,1.8,3.3,4],[11,3.3,3.2,4.6,3],[18.5,14.3,3.7,2,4],[23.8,-19,2.6,3.4,3],[29.5,7.2,1.7,3.4,3],[24,23.4,3.5,2.4,3]],
  gardens,
  [[-8.1,15.2,1.5,4.5,3],[-9.2,-5.6,1.6,3.1,3],[-13,-22,3.3,2.9,3],[-19.8,18,2.4,3.2,4],
   [8.4,-17.5,1.4,4.6,3],[8.8,6.3,2.0,4.4,3],[17.8,-9.1,3.5,3.7,4],[19.8,22.8,3.1,3.7,4],[28.6,7.6,2.5,2.7,3],[28,-22.2,2.3,3.5,3]],
  [[-8.7,-15.5,2,5.4,4],[-8.5,8.8,1.8,5.2,3],[-18.9,0.2,1.9,5.4,3],[-18.7,21.8,4.1,2.8,4],
   [9.5,-22.7,2.7,3.7,4],[11.5,1.9,3.3,3.6,3],[13.8,18,3.4,2.4,3],[22.9,-10.6,3.0,3.5,3],[27.8,6.3,3.3,3.3,4],[25.8,25.1,4,2,4]],
  [[-8.1,4.2,1.6,4.4,3],[-10.6,-17.3,3.4,3.8,4],[-18.9,-7.4,1.8,3.9,3],[-20.4,19.5,2.8,3.4,3],
   [8.9,-21.2,1.9,3.1,3],[12.4,-8.9,3.6,3.4,3],[9.4,12.6,2.6,4.0,4],[20.3,6.1,3.9,3.5,4],[26.1,-19.6,3.7,3.3,4],[27.5,24,2.7,2.6,3]],
  [[-8.1,12.9,1.4,4.3,3],[-8.7,-10.2,1.8,4.5,4],[-20.5,-19.8,2.7,3.4,3],[-18.3,22.7,3.8,2.7,4],
   [8.4,-19.2,1.7,3.4,3],[12.5,-1.9,3.5,3.4,4],[14.8,14.7,3.4,4.1,4],[21.0,-14.2,3.4,4.1,3],[29.0,7.1,2.3,3.9,3],[26.1,24.1,4.3,2.1,4]]
 ][phase];
 const random=plazaSeed(1799+phase*619),beds=[];
 for(const [x,z,rx,rz,limit] of islands){
  const count=phase===1?limit:Math.max(1,limit-1)+(random()>.72?1:0);
  for(let j=0;j<count;j++){
   const wide=phase===1?j===0?.66+random()*.27:.33+random()*.34:j===0?.66+random()*.23:.34+random()*.29;
   const footprint=wide+.20;
   for(let retry=0;retry<14;retry++){
    const a=random()*Math.PI*2,d=Math.sqrt(random());
    const p=[x+Math.cos(a)*d*rx,.03,z+Math.sin(a)*d*rz];
    if(!clear(p,footprint)||beds.some(b=>Math.hypot(p[0]-b.p[0],p[2]-b.p[2])<b.radius+wide+.52))continue;
    beds.push({p,radius:wide,major:j===0,seed:1+(random()*0x7fffffff|0)});
    break;
   }
  }
 }
 return beds;
}
function accentPlazaBed(phase,p,r,major,seed,{rod,form,lamp}){
 const rand=plazaSeed(seed),variant=Math.floor(rand()*3),yaw=rand()*Math.PI*2,sn=Math.sin(yaw),cs=Math.cos(yaw);
 const tall=r*(major?1.55:1.08);
 const q=(x,y,z=0)=>[p[0]+(x*cs+z*sn)*r,.03+y*tall,p[2]+(z*cs-x*sn)*r];
 const shape=(x,y,z,sx,sy,sz,color,rz=0)=>form(q(x,y,z),sx*r,sy*tall,sz*r,{yaw,rz,color});
 const light=(x,y,z,sx,sy,sz,color,rz=0)=>lamp(q(x,y,z),sx*r,sy*tall,sz*r,{yaw,rz,color});
 const stem=(x,y,z,tx,ty,tz,radius,color)=>rod(q(x,y,z),q(tx,ty,tz),radius*r,color);
 if(phase===0){
  const height=major?.42:.26,tint=variant===1?'#ff9cff':'#adfaff';
  if(variant===0){
   shape(0,height*.5,0,.70,height,.34,'#bed4f6');
   light(0,height+.016,0,.42,.032,.075,tint);
  }else if(variant===1){
   for(const [x,h] of [[-.26,height],[.19,height*.68]]){
    shape(x,h*.5,0,.24,h,.29,'#a1b5da');light(x,h+.02,0,.16,.05,.19,tint);
   }
  }else{
   shape(0,.065,0,.65,.13,.37,'#c5d5ee');
   shape(-.22,height*.5,0,.22,height,.32,'#a8c5ef');light(-.22,height+.018,0,.15,.035,.14,tint);
   light(.19,.138,.06,.15,.025,.08,'#bcf6ff');
  }
 }else if(phase===2){
  const height=major?.52:.35;
  if(variant===0){
   stem(0,0,0,0,.13,0,.32,'#e9d9b7');
   stem(0,.12,0,0,height,0,.15,'#fff1d8');
   light(0,height,0,.22,.19,.19,'#fffdf3');
  }else if(variant===1){
   shape(-.15,.11,0,.44,.13,.25,'#fff4d7',-.1);
   shape(.20,.065,.14,.31,.075,.27,'#e0d6bb');
   light(.09,.18,-.07,.18,.092,.15,'#fff9dc');
  }else{
   stem(0,0,0,0,.11,0,.3,'#f4e6c3');
   shape(-.16,.21,0,.16,.30,.12,'#f9ead0',-.48);
   shape(.16,.16,0,.13,.26,.11,'#efe0c2',.64);
   light(.06,.35,0,.13,.095,.11,'#fffbe5');
  }
 }else if(phase===3){
  const size=major?.47:.32;
  if(variant===0){
   shape(0,.16,0,.55,.19,.33,'#b1948d');
   light(-.12,.22,.08,.20,.075,.11,'#ffbe89');
  }else if(variant===1){
   for(const [x,z,k] of [[-.22,0,.93],[.17,.12,.56],[.21,-.18,.72]])shape(x,size*k*.64,z,.21,size*k,.18,'#d3aaa0',-.32+x);
   light(-.21,size*.9,.02,.091,.13,.076,'#ffc076',-.28);
  }else{
   stem(0,0,0,0,.17,0,.28,'#b49896');
   shape(0,.21,0,.32,.16,.29,'#d2a9a1');
   light(0,.36,0,.14,.19,.12,'#ffb96c',.22);
  }
 }else if(phase===4){
  const tint=variant===1?'#ffb4ac':'#a9f2d7',height=major?.47:.32;
  if(variant===2){
   for(const [x,y,lean] of [[-.20,.19,-.68],[.04,.23,.15],[.19,.14,.82]])shape(x,y,0,.17,.22,.08,'#bce4d4',lean);
   light(0,.17,.12,.10,.08,.09,'#fff3dc');
  }else{
   const spread=variant===1?.38:.23;
   stem(0,0,0,0,.21,0,.105,tint);
   for(const [x,z,k] of [[-spread,.06,.80],[spread,-.09,1]]){
    stem(0,.16,0,x,height*k,z,.065,tint);
    light(x,height*k,z,.095,.08,.085,variant===1?'#ffd4b8':'#c5f7dd');
   }
  }
 }else{
  const size=major?.52:.32;
  if(variant===0){
   shape(0,.10,0,.47,.12,.34,'#edfcff');
   light(-.04,.18,.05,.26,.088,.22,'#e5fbff');
  }else if(variant===1){
   shape(-.21,size*.49,0,.15,size*.69,.14,'#9fd9ee',-.27);
   shape(.16,size*.34,.11,.15,size*.47,.12,'#c9f4ff',.32);
   light(-.17,size*.74,.02,.085,.14,.079,'#ecfcff',-.27);
  }else{
   stem(0,0,0,0,.12,0,.25,'#bfdcec');
   shape(0,size*.61,0,.20,size*.65,.14,'#c2efff',.10);
   light(.12,size*.77,0,.095,.19,.075,'#f3ffff',.10);
  }
 }
}
function buildPlazaDressing(h,groups){
 const T=h.T,up=new T.Vector3(0,1,0),rodGeo=new T.CylinderGeometry(.73,1,1,6),facets=new T.OctahedronGeometry(1),
  block=new T.BoxGeometry(1,1,1),flowerGeo=plazaFlower(T);
 const leafOutline=[[0,-1],[-.65,-.50],[-1,.05],[-.57,.60],[.16,1],[.70,.44],[1,-.12],[.53,-.63]],leafVerts=[];
 for(let i=0;i<leafOutline.length;i++){
  const a=leafOutline[i],b=leafOutline[(i+1)%leafOutline.length];
  leafVerts.push(0,.08,1,...b,0,...a,0,0,.04,-.7,...a,0,...b,0);
 }
 const leafGeo=new T.BufferGeometry();leafGeo.setAttribute('position',new T.Float32BufferAttribute(leafVerts,3));leafGeo.computeVertexNormals();
 const style=[
  {dark:'#3d5770',body:'#4b607e',light:'#61ebff',glow:'#57daff'},
  {dark:'#63432a',body:'#688641',light:'#ffffff'},
  {dark:'#ad9468',body:'#f6e6bf',light:'#fff1bc'},
  {dark:'#3d292d',body:'#654441',light:'#ff9257',glow:'#ff6528'},
  {dark:'#397773',body:'#7cae9b',light:'#ffe4bf'},
  {dark:'#426f80',body:'#b4e4f4',light:'#eaf7ff'}
 ];
 const wallPoint=(w,u,y,d)=>[w.x+Math.cos(w.yaw)*u+Math.sin(w.yaw)*d,y,w.z-Math.sin(w.yaw)*u+Math.cos(w.yaw)*d];
 const dots=(a,b)=>Math.hypot(a[0]-b.x,a[2]-b.z);
 const clear=(p,r=.52)=>{
  const [x,,z]=p;
  if(Math.abs(x)-r<5.70||Math.abs(x)+r>32.7||z-r< -32||z+r>28.25)return false;
  for(const dx of [-r,0,r])for(const dz of [-r,0,r])if(h.floorHeightAt(x+dx,z+dz)!==0)return false;
  return h.zones.every(z=>dots(p,z)>z.radius+r+.55)
   &&h.solids.every(s=>Math.abs(x-s.x)>s.hx+r||Math.abs(z-s.z)>s.hz+r);
 };
 const point=(p,extra)=>({x:p[0],y:p[1],z:p[2],...extra});
 const wave=(i,s=1)=>Math.sin(i*2.399963+s);
 for(let phase=0;phase<style.length;phase++){
  const rods=[],forms=[],lights=[],s=style[phase];
  const rod=(a,b,r,color)=>{
   const d=new T.Vector3(b[0]-a[0],b[1]-a[1],b[2]-a[2]),length=d.length();
   rods.push({x:(a[0]+b[0])*.5,y:(a[1]+b[1])*.5,z:(a[2]+b[2])*.5,sx:r,sy:length+r*.4,sz:r,q:new T.Quaternion().setFromUnitVectors(up,d.divideScalar(length)),color});
  };
  const path=(controls,r0,r1,steps,color)=>{
   const curve=new T.CatmullRomCurve3(controls.map(p=>new T.Vector3(...p))),samples=[];
   for(let i=0;i<=steps;i++)samples.push(curve.getPoint(i/steps).toArray());
   for(let i=0;i<steps;i++)rod(samples[i],samples[i+1],r0+(r1-r0)*i/steps,color);
   return samples;
  };
  const form=(p,sx,sy,sz,extra)=>forms.push(point(p,{sx,sy,sz,...extra}));
  const lamp=(p,sx,sy,sz,extra)=>lights.push(point(p,{sx,sy,sz,...extra}));
  const wallAnchors=[[-27,-21,-11,10,17,26],[-28,-16,-8,15,24],[-25,-19,-5,14,24],[-26,-13,-3,9,21,26]];
  for(const [wi,w] of h.wallSides.entries()){
   const anchors=wallAnchors[wi],random=plazaSeed(1443+phase*2017+wi*357);
   for(let i=0;i<anchors.length;i++){
    const u=anchors[i]+(random()-.5)*2.65,dir=random()<.5?-1:1;
    const stretch=.72+random()*.57,width=.74+random()*.53,dropBias=random();
    if(h.mobile&&(i+wi+phase)%4===2)continue;
    const wall=(w,x,y,d)=>wallPoint(w,u+(x-u)*width,8.6+(y-8.6)*stretch,d);
    if(phase===1){
     const n=h.mobile?8:11,drop=2.0+dropBias*2.15;
     const hanging=path([[u-dir*.75,8.58,.56],[u,8.43,.83],[u+dir*.62,8.6-drop*.32,.80],[u-dir*.42,8.6-drop*.67,.80],[u+dir*.88,8.55-drop,.83]].map(a=>wall(w,...a)),.077+.026*width,.022,n,'#b7ae79');
     hanging.forEach((p,j)=>{
      const sign=j%2?1:-1,shift=sign*(.21+.12*Math.abs(wave(j+i)));
      const leaf=.78+.31*Math.abs(wave(i*3+j,wi));
      form([p[0]+Math.cos(w.yaw)*shift,p[1]-.14,p[2]-Math.sin(w.yaw)*shift],.24*leaf,.34*leaf,.066,{yaw:w.yaw+.3*sign,rz:sign*.72,color:['#b2d682','#7eab58','#d6e89d'][(j+wi+i)%3]});
      if(j%3!==2||!h.mobile)form([p[0]-Math.cos(w.yaw)*shift,p[1]+.08,p[2]+Math.sin(w.yaw)*shift],.21,.27,.061,{yaw:w.yaw-.22*sign,rz:-sign*.82,color:'#86ac65'});
     });
     if(dropBias<.55){
      const spur=path([[u,8.52,.68],[u+dir*.84,8.45,.85],[u+dir*1.41,8.05,.83],[u+dir*1.48,7.34,.79]].map(a=>wall(w,...a)),.065,.022,6,'#a49e70');
      spur.forEach((p,j)=>form([p[0],p[1]-.12,p[2]],.30,.37,.073,{yaw:w.yaw+wave(j)*.48,rz:wave(j)*1.1,color:j%2?'#83b459':'#a4c973'}));
     }
     continue;
    }
    // Vary silhouettes as well as placement: a bay can hold one tall motif,
    // a paired assembly or a broad cluster, depending on its seeded recipe.
    const variant=Math.floor(dropBias*3);
    const at=(x,y,d=.92)=>wall(w,u+x,y,d);
    if(phase===0){
     if(variant===0){
      const start=at(-1.32,6.47,.80),end=at(1.32,6.47,.80);
      rod(start,end,.12,'#abcde5');
      for(const x of [-1.15,.30,1.13]){
       form(at(x,6.47,.79),.26,.52,.25,{yaw:w.yaw,color:'#c8ddf4'});
       lamp(at(x,6.47,.963),.116,.22,.06,{yaw:w.yaw,color:x>0?'#ef9dff':'#b6f4ff'});
      }
     }else{
      for(const offset of variant===1?[0]:[-.40,.40]){
       const end=variant===1?4.25:5.66;
       const coords=[[u+offset,8.53,.80],[u+offset,7.45,.8],[u+offset+dir*.72,6.71,.8],[u+offset+dir*.72,end,.8]];
       for(let j=0;j<3;j++)rod(wall(w,...coords[j]),wall(w,...coords[j+1]),variant===1?.092:.069,offset<0?'#ce99ef':'#a7deff');
      }
      const y=variant===1?4.49:5.73;
      form(at(dir*.72,y,.81),variant===1?.64:1.22,variant===1?1.12:.56,.20,{yaw:w.yaw});
      lamp(at(dir*.72,y,.948),variant===1?.105:.78,variant===1?.73:.062,.07,{yaw:w.yaw,color:i%2?'#fc7dff':'#affbff'});
     }
    }else if(phase===2){
     const y=variant===0?6.91:variant===1?5.83:7.24;
     form(at(0,y,.69),variant===1?.56:variant===2?1.31:.91,variant===1?1.44:.62,.27,{yaw:w.yaw});
     for(const j of (variant===1?[0]:variant===2?[-2,-1,1,2]:[-1,0,1])){
      lamp(at(j*.38,y-Math.abs(j)*.145,.95),variant===1?.22:.16,variant===1?.67:.50,.085,{yaw:w.yaw,rz:j*(variant===2?.41:.57),color:j?'#f9e9c8':'#ffffff'});
     }
    }else if(phase===3){
     const y=variant===0?7.94:variant===1?5.57:6.89;
     for(const j of (variant===0?[-2,-1,0,1]:variant===1?[0]:[-1,0,1])){
      const h=variant===1?1.39:.61+(.33+dropBias)*Math.abs(wave(j+i)),tilt=variant===1?.68:j*.23;
      form(at(j*.48,y-Math.abs(j)*.19,.62),variant===1?.77:.48,h,.44,{yaw:w.yaw,rz:tilt,color:j%2?'#a78585':'#c19c95'});
      if(j%2===0||variant===2)lamp(at(j*.48,y-.11,.99),variant===1?.15:.08,h*.49,.07,{yaw:w.yaw,rz:tilt+.14});
     }
    }else if(phase===4){
     const y=variant===1?6.87:5.17;
     const p=at(0,y,.89);
     for(const j of (variant===0?[-2,-1,0,1,2]:variant===1?[-1,0,1]:[-1,1])){
      const top=at(j*(variant===0?.42:.64),y+(variant===2?1.40:.81)-Math.abs(j)*.20,.96);
      rod(p,top,variant===0?.067:.10,variant===1?'#ef9eae':'#a7eacb');
      form(top,.24,.37,.14,{yaw:w.yaw,rz:-j*.39,color:variant===1?'#ffc0b3':'#b8ebd4'});
     }
     lamp(at(0,y-.08,1.02),variant===0?.72:.48,.21,.11,{yaw:w.yaw});
    }else{
     for(const j of (variant===0?[-2,-1,0,1,2]:variant===1?[0]:[-1,1])){
      const length=variant===1?1.31:variant===2?.74:.39+.46*Math.abs(wave(i+j,wi));
      form(at(j*.50,8.53,.70),variant===1?.79:.54,.22,.39,{yaw:w.yaw,color:'#ffffff'});
      lamp(at(j*.45,8.46-length*.60,.81),variant===1?.21:.12,length,.16,{yaw:w.yaw,rz:j*.11,color:j?'#d1efff':'#fffaff'});
     }
    }
   }
  }
  for(const side of [-1,1]){
   if(phase===1){
    const main=path([[side*5.93,.10,-24.32],[side*4.96,.65,-25.35],[side*4.21,2.78,-26.22],[side*4.15,5.40,-26.37],[side*3.78,7.15,-26.78],[side*2.47,7.70,-26.66]],.31,.09,15,'#c2ae8c');
    path([[side*6.63,.10,-26.02],[side*5.21,.45,-26.02],[side*4.02,2.55,-26.05],[side*4.5,5.20,-26.52],[side*4.02,6.7,-26.64]],.26,.045,12,'#a38c6a');
    path([[side*4.82,.11,-23.65],[side*4.48,.48,-25.06],[side*4.38,1.83,-25.97],[side*4.44,3.02,-26.25]],.21,.04,9,'#9f876b');
    main.forEach((p,i)=>{if(i%2===0||p[1]>6)form([p[0]+side*.29,p[1]+.06,p[2]+.10],.29,.44,.10,{rz:side*.67,color:i%3?'#8eae62':'#c6d28d'});});
    const crown=path([[side*4.31,6.85,-26.5],[side*3.54,7.67,-26.59],[side*2.33,7.78,-26.53],[side*1.35,7.74,-26.55]],.14,.041,8,'#ac9a71');
    crown.forEach((p,i)=>{if(i<4||i%2===0)form([p[0],p[1]+.21,p[2]+.02],.26,.31,.075,{rz:side*(.7+i*.13),color:i%2?'#95bd68':'#bacf7a'});});
   }else if(phase===0){
    const offsets=side<0?[[.02,.93,1.55],[.48,.49,.72]]:[[0,.62,.94],[.37,1.37,1.40],[.75,.39,.53]];
    for(const [j,[dx,y,height]] of offsets.entries()){
     form([side*(4.55+dx),y,-26.65],.37,height,.52,{rz:-side*.16});
     lamp([side*(4.58+dx),y+.035,-26.36],.13,height*.67,.07,{rz:-side*.16,color:(j+(side>0))%2?'#f990ff':'#e0ffff'});
    }
   }else{
    const heights=side<0?[1,.54]:[.64,.85,.40];
    for(const [j,ratio] of heights.entries()){
     const x=side*(4.34+j*.57),z=-26.53+j*(side>0?.31:.18);
     const height=[0,0,2.9,1.72,1.28,1.43][phase]*ratio;
     rod([x,.04,z],[x+side*.11,height,z],phase===2?.37:.22);
     form([x+side*.11,height-.14,z],phase===2?.43:.37,phase===2?.30:.63,.36,{yaw:j*.31,rz:-side*.18});
     lamp([x+side*.11,height+.18,z],phase===2?.27:.18,.29,.17,{rz:-side*.24,color:j===1?'#e0f5ff':undefined});
    }
   }
  }
  for(const {p,radius,major,seed} of plazaGroundBeds(phase,clear)){
   if(h.mobile&&!major&&seed%4===0)continue;
   if(phase!==1){accentPlazaBed(phase,p,radius,major,seed,{rod,form,lamp});continue;}
   const random=plazaSeed(seed),angle=random()*Math.PI*2,aspect=.48+random()*.49;
   const foliage=major?9+Math.floor(random()*5):3+Math.floor(random()*6);
   const blooms=major?1+Math.floor(random()*4):Math.floor(random()*3);
   const colors=['#fff5dc','#ffd75b','#90c7fd','#ecadba'];
   const base=colors[Math.floor(random()*colors.length)];
   for(let j=0;j<foliage;j++){
    const a=random()*Math.PI*2,k=Math.sqrt(random())*radius,lx=Math.cos(a)*k,lz=Math.sin(a)*k*aspect;
    const x=p[0]+Math.cos(angle)*lx-Math.sin(angle)*lz,z=p[2]+Math.sin(angle)*lx+Math.cos(angle)*lz;
     const blade=.13+random()*(major?.30:.19),width=.042+random()*.043,lean=(random()-.5)*.85,color=random()>.45?'#80ac61':'#c0d786';
     if(!h.mobile||j<blooms||j%3!==2)form([x,.031+blade*.91,z],width,blade,.037,{yaw:a,rz:lean,color});
     if(j<blooms){
      const y=.25+random()*(major?.34:.24),size=.104+random()*.096,dx=Math.cos(a)*y*.24,dz=Math.sin(a)*y*.24;
      rod([x,.036,z],[x+dx,y,z+dz],.012+size*.07,'#9ea85f');
      lamp([x+dx,y,z+dz],size,.14,size,{rx:(random()-.5)*.74,yaw:a,rz:(random()-.5)*.64,color:j===2&&major?'#fff5dc':base});
     }
   }
  }
  if(phase===1){
   const pots=[[-19.55,12.4,1.1,8,'#ffd75b'],[-18.7,6.15,.69,5,'#b8f3f4'],[-20.8,-7.1,.86,6,'#fff5dc'],[-16.7,-18.1,1.19,9,'#ecadba']];
   for(const [i,[x,z,s,count,bloom]] of pots.entries()){
    if(!clear([x,0,z],.57*s))continue;
    rods.push({x,y:.03+.20*s,z,sx:.47*s,sy:.40*s,sz:.47*s,rx:Math.PI,color:i%2?'#dd977c':'#f3ac8a'});
    for(let j=0;j<count;j++){
     if(h.mobile&&j%3===2)continue;
     const a=j*2.399963+i*1.7,dx=Math.cos(a),dz=Math.sin(a),y=(.79+j*.034)*s;
     form([x+dx*.22*s,.03+(.52+(j%3)*.075)*s,z+dz*.22*s],.18*s,.36*s,.058*s,{yaw:-a,rz:wave(j,i)*.88,color:j%2?'#91bc58':'#b0ce77'});
     if((j+i)%3===0){rod([x,.03+.4*s,z],[x+dx*.25*s,y,z+dz*.25*s],.022*s,'#98a971');lamp([x+dx*.25*s,y,z+dz*.25*s],.16*s,.19*s,.16*s,{color:bloom,rz:.25*wave(j,i)});}
    }
   }
  }
  const g=new T.Group();g.name='plaza-dressing-'+plazaProfiles[phase].id;g.visible=false;groups[phase].add(g);
  const mat=(color,extra)=>h.material(color,{roughness:.76,metalness:phase===0?.38:.04,...extra});
  const batch=(name,geo,m,data)=>{const b=instances(h,g,name,geo,m,data,false);b.raycast=()=>{};};
  batch('plaza-dressing-stems',rodGeo,mat(s.dark),rods);
  batch('plaza-dressing-forms',phase===0?block:phase===1?leafGeo:facets,mat(s.body),forms);
  batch('plaza-dressing-accents',phase===1?flowerGeo:phase===0?block:facets,mat(s.light,phase===1?{vertexColors:true,side:T.DoubleSide}:s.glow?{emissive:s.glow,emissiveIntensity:.38}:{}),lights);
  // Group visibility is driven by its parent biome; no per-frame decor animation.
  g.visible=true;
 }
}
function buildPlazaArchitecture(h,root,groups){
 const T=h.T,box=new T.BoxGeometry(1,1,1),shell=[],lamps=[],medallions=[];
 // Flush cladding on the existing collision volumes; no new navigation obstacles.
 const portal=(x,y,sx,sy,sz)=>({x,y,z:-26.8,sx,sy,sz});
 for(const side of [-1,1]){
  shell.push(portal(side*3.24,3.22,1.20,4.35,.22),portal(side*3.24,.88,1.45,.46,.26));
  lamps.push(portal(side*2.82,3.19,.073,3.75,.26));
  shell.push({x:26.54,y:5.3,z:-2+side*6.02,sx:.23,sy:6.5,sz:.37});
  lamps.push({x:26.39,y:5.3,z:-2+side*6.02,sx:.06,sy:5.9,sz:.07});
  shell.push({x:side*2.08,y:.42,z:20.50,sx:1.16,sy:.27,sz:.12});
 }
 shell.push({x:26.53,y:1.23,z:-2,sx:.25,sy:.34,sz:12.16},{x:0,y:.30,z:20.48,sx:4.3,sy:.13,sz:.13});
 lamps.push({x:26.37,y:1.27,z:-2,sx:.06,sy:.053,sz:11.6},{x:0,y:.355,z:20.396,sx:3.75,sy:.056,sz:.052});
 for(const wall of h.wallSides){
  const c=Math.cos(wall.yaw),s=Math.sin(wall.yaw);
  for(const u of (h.mobile?[-22,22]:[-25,-13,13,25])){
   const at=(y,depth)=>({x:wall.x+u*c+s*depth,y,z:wall.z-u*s+c*depth,yaw:wall.yaw});
   shell.push({...at(2.94,.54),sx:3.05,sy:1.9,sz:.26},{...at(1.98,.64),sx:3.34,sy:.13,sz:.27});
   medallions.push(at(2.94,.75));
  }
 }
 const housing=h.material('#7c8d9a',{metalness:.35,roughness:.62});
 const guide=h.material('#ede6ca',{emissive:'#ffce87',emissiveIntensity:.38,roughness:.64});
 const place=(g,name,geo,mat,items)=>{instances(h,g,name,geo,mat,items,false).raycast=()=>{};};
 place(root,'plaza-inset-cladding',box,housing,shell);
 place(root,'plaza-facade-lights',box,guide,lamps);
 const leaf=new T.Shape();leaf.moveTo(0,-.68);leaf.bezierCurveTo(-.8,-.23,-.56,.52,0,.71);leaf.bezierCurveTo(.56,.52,.8,-.23,0,-.68);
 const motif=[
  [box,[-1,0,1].map(i=>({x:i*.58,sx:.24,sy:1.02-Math.abs(i)*.3,sz:.11,rz:-.3}))],
  [new T.ExtrudeGeometry(leaf,{depth:.072,curveSegments:7,bevelEnabled:false}),[-1,0,1].map(i=>({x:i*.59,y:-Math.abs(i)*.14,sx:.71,sy:.9,rz:-i*.55}))],
  [new T.TorusGeometry(.52,.052,6,18),[-1,0,1].map(i=>({x:i*.53,y:.07*(1-Math.abs(i)),sx:1.05,sy:.76,sz:.86}))],
  [new T.OctahedronGeometry(1),[-1,0,1].map(i=>({x:i*.57,y:-Math.abs(i)*.14,sx:.33,sy:.62-Math.abs(i)*.25,sz:.12,rz:i*.25}))],
  [new T.CylinderGeometry(.19,.29,1,10),[{x:0,sy:1.1},{x:0,y:.57,sx:1.4,sy:.15},{x:0,y:-.57,sx:1.65,sy:.19}]],
  [new T.OctahedronGeometry(1),[-1,0,1].map(i=>({x:i*.43,sx:.26,sy:.65-Math.abs(i)*.21,sz:.11,rz:-i*.39}))]
 ];
 motif.forEach(([geo,parts],phase)=>{
  const p=plazaProfiles[phase],mat=h.material(p.detail,{roughness:.67,metalness:phase===0?.43:.13,emissive:p.glow,emissiveIntensity:phase===0||phase===3?.32:.08});
  place(groups[phase],'plaza-wall-relief-'+p.id,geo,mat,medallions.flatMap(v=>parts.map(part=>({
   ...part,x:v.x+Math.cos(v.yaw)*part.x,y:v.y+(part.y||0),z:v.z-Math.sin(v.yaw)*part.x,yaw:v.yaw
  }))));
 });
 return {housing,guide};
}
function buildPlazaPlanters(h,groups){
 const T=h.T,box=new T.BoxGeometry(1,1,1),crystal=new T.OctahedronGeometry(1),
  column=new T.CylinderGeometry(.68,1,1,7),pine=new T.ConeGeometry(1,1,7),
  crown=window.ElementalTreeCanopy.geometry(T,{seed:68,radius:1.13,height:1.7,aspect:.79,style:'young',palette:['#537754','#86a467','#b6c482']});
 const hardware=[],neon=[],branches=[],leaves=[],skyGems=[],halos=[],basalt=[],coals=[],coral=[],pearls=[],firs=[],snow=[],ice=[],skyBases=[],braziers=[];
 const batches=[hardware,neon,branches,leaves,skyGems,halos,basalt,coals,coral,pearls,firs,snow,ice,skyBases,braziers];
 let corner=0;
 for(const x of [-30,30])for(const z of [-28,25]){
  const from=batches.map(b=>b.length);
  const side=x>0?1:-1;
  hardware.push({x,y:2.48,z,sx:1.24,sy:2.7,sz:1.12,yaw:.32*side},{x,y:3.91,z,sx:.91,sy:.16,sz:.86,yaw:.32*side});
  for(const t of [-1,1])neon.push({x:x+t*.34,y:2.63,z:z+.58,sx:.12,sy:1.84,sz:.11,color:t<0?'#56d8ed':'#e085ff'});
  for(const t of [-1,1])hardware.push({x:x+t*.84,y:1.96,z,sx:.27,sy:1.66,sz:.58},{x:x+t*.47,y:4.16,z,sx:.09,sy:.52,sz:.09});
  branches.push({x,y:2.15,z,sx:.27,sy:2.1,sz:.27});
  for(const t of [-1,1])branches.push({x:x+t*.43,y:2.77,z,sx:.13,sy:1.14,sz:.13,rz:-t*.65});
  for(let i=0;i<(h.mobile?3:5);i++){
   const a=i*Math.PI*2/(h.mobile?3:5)+side*.5;
   branches.push({x:x+Math.cos(a)*.43,y:1.35,z:z+Math.sin(a)*.43,sx:.15,sy:.93,sz:.16,rx:Math.PI*.32,yaw:-a+Math.PI/2});
  }
  leaves.push({x:x+side*.22,y:3.56,z,sx:1.04,sy:1.11,sz:1.09,yaw:side});
  if(!h.mobile)leaves.push({x:x-side*.69,y:3.21,z:z-.14,sx:.53,sy:.68,sz:.62,yaw:side+.8,color:'#cbd6ad'});
  skyBases.push({x,y:1.76,z,sx:.64,sy:1.22,sz:.64},{x,y:2.34,z,sx:.74,sy:.16,sz:.74});
  skyGems.push({x,y:2.97,z,sx:.7,sy:1.12,sz:.7,yaw:side*.6});
  for(const tilt of [-.4,.35])halos.push({x,y:2.8,z,rx:Math.PI/2+tilt,rz:side*.3});
  for(let j=0;j<3;j++){
   const bx=x+(j-1)*.54,bz=z+(j%2)*.46-.2,height=1.05+(j===1?1.45:.35);
   basalt.push({x:bx,y:1.13+height*.5,z:bz,sx:.47,sy:height,sz:.46,yaw:j*.8});
   coals.push({x:bx,y:1.13+height,z:bz,sx:.27,sy:.26,sz:.25});
   const y=1.62+j*.28;
   coral.push({x:bx,y,z:bz,sx:.26,sy:2*(y-1.13),sz:.25,rz:(1-j)*.36,color:['#f4b69d','#79d6c5','#dc8a9f'][j]});
   pearls.push({x:bx+(j-1)*.26,y:y+(y-1.13)*.9,z:bz,sx:.23,sy:.24,sz:.22});
   firs.push({x,y:1.98+j*.69,z,sx:1.01-j*.23,sy:1.66-j*.27,sz:1.01-j*.23,yaw:.5});
   snow.push({x,y:2.2+j*.69,z,sx:.77-j*.17,sy:1.25-j*.2,sz:.77-j*.17,yaw:.5});
  }
  braziers.push({x,y:2.29,z:z+.72,sx:.5,sy:.36,sz:.5});
  coals.push({x,y:2.43,z:z+.72,sx:.31,sy:.16,sz:.31});
  for(let j=0;j<(h.mobile?1:2);j++)ice.push({x:x-side*(.39+j*.24),y:1.62+j*.22,z:z+.53,sx:.2+j*.075,sy:.48+j*.24,sz:.22+j*.06,rz:-.28*side});
  ice.push({x:x+side*.68,y:1.82,z:z+.44,sx:.34,sy:.7,sz:.33,rz:.24*side});
  // Vary the complete arrangement together so its pieces stay joined and
  // its centre stays on the existing planter rim.
  const yaw=[.52,-1.13,1.78,-.35][corner],s=[.94,1.10,.82,1.02][corner++],co=Math.cos(yaw),si=Math.sin(yaw);
  batches.forEach((batch,k)=>{
   for(let j=from[k];j<batch.length;j++){
    const v=batch[j],dx=v.x-x,dz=v.z-z;
    v.x=x+(dx*co+dz*si)*s;v.z=z+(dz*co-dx*si)*s;v.y=1.13+(v.y-1.13)*s;v.yaw=(v.yaw||0)+yaw;
    v.sx=(v.sx??1)*s;v.sy=(v.sy??1)*s;v.sz=(v.sz??1)*s;
   }
  });
 }
 const add=(phase,name,geo,color,items,extra={})=>{
  const o=instances(h,groups[phase],'plaza-planter-'+name,geo,h.material(color,extra),items,false);
  o.raycast=()=>{};
 };
 add(0,'circuit',box,'#344b68',hardware,{metalness:.34,roughness:.51});
 add(0,'neon',box,'#ffffff',neon,{emissive:'#7d79ca',emissiveIntensity:.7});
 add(1,'trunk',column,'#81664e',branches);
 add(1,'foliage',crown,'#f4f3e4',leaves,{vertexColors:true,flatShading:true});
 add(2,'alabaster',column,'#e2d9c6',skyBases,{metalness:.08,roughness:.65});
 add(2,'star',crystal,'#e2e9ff',skyGems,{metalness:.17,roughness:.4,emissive:'#b8ceff',emissiveIntensity:.24});
 add(2,'orbits',new T.TorusGeometry(1,.044,6,24),'#e7c997',halos,{metalness:.3});
 add(3,'basalt',column,'#635054',basalt);
 add(3,'brazier',new T.CylinderGeometry(1,.56,1,10),'#785649',braziers,{roughness:.63,metalness:.28});
 add(3,'embers',crystal,'#ffad6a',coals,{emissive:'#ff6930',emissiveIntensity:.58});
 add(4,'coral',column,'#ffffff',coral);
 add(4,'pearls',crystal,'#d2f6e5',pearls,{emissive:'#8fdec8',emissiveIntensity:.24});
 add(5,'pine',pine,'#426779',firs);
 add(5,'snow',pine,'#e0edff',snow);
 add(5,'ice',crystal,'#90d9f4',ice,{roughness:.42});
}
function paintPlaza(h,phase){
 const a=h.plazaArt,s=skins[phase],p=plazaProfiles[phase];if(!a)return;
 if(a.phase!==phase){
  a.phase=phase;a.landmarks.forEach((g,i)=>{g.visible=i===phase;});paintSkyAndMist(phase,a.skyBands,a.mist);
  a.pavement.color.set(p.stone);a.trim.color.set(p.metal);a.trim.emissive.set(p.glow);
  a.cloudMat.color.set(s.cloud);a.cloudMat.emissive.set(s.cloud);
  a.architecture.housing.color.set(p.frame);a.architecture.housing.metalness=phase===0?.55:phase===3?.4:.22;
  a.architecture.guide.color.set(p.detail);a.architecture.guide.emissive.set(p.glow);
  a.architecture.guide.emissiveIntensity=phase===0||phase===3?.55:.22;
 }
 // Reapply on return from Games even when the palette didn't change.
 h.scene.background.set(s.fog);h.scene.fog.color.set(s.fog);h.scene.fog.density=p.fog;
 h.sun.position.set(...p.key);h.sun.color.set(s.sun);h.sun.intensity=p.sun;
 h.hemisphere.color.set(s.hemi);h.hemisphere.groundColor.set(p.stone).multiplyScalar(.58);h.hemisphere.intensity=p.ambient;
 h.fillLight.position.set(...p.fill);h.fillLight.color.set(s.fill);h.fillLight.intensity=p.rim;
 h.archMaterial.color.set(p.wall).multiplyScalar(.78);h.stoneMaterial.color.set(p.stone).multiplyScalar(.86);
 h.wallFrameMaterial.color.set(p.frame);h.wallAccentMaterial.color.set(p.detail);h.wallAccentMaterial.emissive.set(p.glow);
 h.wallMaterial.roughness=phase===0?.63:.88;h.wallMaterial.metalness=phase===0?.43:phase===3?.18:.04;
 h.plazaPlanterMaterial.color.set(p.frame).lerp(a.trim.color,.29);
 h.plazaTrimMaterial.color.set(s.edge).lerp(a.trim.color,.45);h.plazaLampMaterial.color.set(s.line);h.plazaLampMaterial.emissive.set(s.line);
 if(h.sunDisc){h.sunDisc.position.set([-22,-38,26,-38,32,-25][phase],37,-112);h.sunDisc.material.color.set(['#eba1ed','#ffe6ad','#fff8e5','#ff954f','#ffedb0','#e0edff'][phase]);}
}
function portal(h,group,preview,color,accent){
 const T=h.T,glow=preview.edgeMaterial,dark=h.concourseInset||(h.concourseInset=h.material('#213145',{metalness:.18,roughness:.55}));
 preview.hallColor=color;preview.portalMaterial.uniforms.uColor.value.set(color);
 // Front is local +Z. Preserve the old opening, pad, title and selection arrows.
 for(const side of [-1,1]){
  h.bevelBox(.18,5.45,.22,glow,side*3.94,2.96,3.19,group,.035);
  h.bevelBox(.18,5.45,.22,glow,side*2.46,2.96,3.19,group,.035);
  h.bevelBox(1.42,.17,.25,accent,side*3.2,5.68,3.19,group,.035);
  h.bevelBox(2.05,.3,6.65,accent,side*3.2,.18,0,group,.08);
  h.bevelBox(.12,4.7,4.8,dark,side*4.04,2.8,-.15,group,.025);
 }
 h.bevelBox(8.7,.23,6.82,accent,0,7.36,0,group,.065);
 h.bevelBox(8.65,.18,6.8,accent,0,6.04,0,group,.045);
 h.bevelBox(8.2,.65,5.8,dark,0,7.72,-.35,group,.17);
 // A recessed translucent halo costs one small quad, not a fullscreen bloom.
 const canvas=document.createElement('canvas');canvas.width=canvas.height=64;const ctx=canvas.getContext('2d'),gradient=ctx.createRadialGradient(32,32,10,32,32,32);gradient.addColorStop(0,color+'55');gradient.addColorStop(.6,color+'20');gradient.addColorStop(1,color+'00');ctx.fillStyle=gradient;ctx.fillRect(0,0,64,64);
 const texture=h.track(new T.CanvasTexture(canvas));texture.colorSpace=T.SRGBColorSpace;
 const m=h.track(new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false,blending:T.AdditiveBlending}));h.mesh(new T.PlaneGeometry(6,6.7),m,0,2.8,-1.12,group);
}
function paint(a,phase){
 if(a.phase===phase)return;
 const s=skins[phase],p=a.paints,nature=phase===1;
 a.phase=phase;a.id=s.id;
 a.landmarks.forEach((group,i)=>{group.visible=i===phase;});
 a.greenery.visible=nature;
 a.hedge.visible=nature;
 a.peakMesh.visible=a.peakCaps.visible=nature||phase===2;
 paintSkyAndMist(phase,a.skyBands,a.mist);
 for(const [key,color] of Object.entries({stone:s.stone,soil:s.ground,grass:nature?'#7d9860':s.ground,edge:s.edge,
  base:nature?'#455365':s.wall,wall:s.wall,cap:s.cap,stoneFar:s.far,capMat:nature?'#abb5a0':s.cap,ridge:nature?'#9d999f':s.far}))p[key].color.set(color);
 p.foundation.color.set(nature?'#615b65':s.far).lerp(p.wall.color,.36);
 p.gold.color.set(nature?'#ffd68c':s.line);p.gold.emissive.set(s.line);
 a.cloudMesh.material.color.set(s.cloud);a.cloudMesh.material.emissive.set(nature?'#dfb6ce':s.cloud);
 a.shadowReady=false;
}
function atmosphere(h,enabled,phase=h.api.theme?.()??1){
 const a=h.concourse?.hall.art;if(!a)return;
 if(enabled){
  if(a.saved&&a.phase===phase)return;
  const s=skins[phase];paint(a,phase);
  if(!a.saved){a.saved={background:h.scene.background,fog:h.scene.fog,sunColor:h.sun.color.clone(),sunIntensity:h.sun.intensity,sunPosition:h.sun.position.clone(),hemi:h.hemisphere.color.clone(),ground:h.hemisphere.groundColor.clone(),hemiIntensity:h.hemisphere.intensity,fill:h.fillLight.color.clone(),fillPosition:h.fillLight.position.clone(),fillIntensity:h.fillLight.intensity,castShadow:h.sun.castShadow};}
  h.scene.background=a.background||(a.background=new h.T.Color());a.background.set(s.fog);
  h.scene.fog=a.fog||(a.fog=new h.T.Fog(s.fog,65,155));a.fog.color.set(s.fog);
  h.sun.color.set(s.sun);h.sun.intensity=s.light;h.sun.position.set(-22,35,18);h.hemisphere.color.set(s.hemi);h.hemisphere.groundColor.set(phase===1?'#77736a':s.edge);h.hemisphere.intensity=1.25;h.fillLight.position.set(16,10,-18);h.fillLight.color.set(s.fill);h.fillLight.intensity=.5;
  // Static map: rendered once during covered preparation, no per-frame shadow pass.
  if(!h.mobile){const shadow=h.sun.shadow;h.track(shadow);h.sun.castShadow=true;shadow.mapSize.set(1024,1024);Object.assign(shadow.camera,{left:-40,right:40,top:42,bottom:-42,near:1,far:110});shadow.camera.updateProjectionMatrix();shadow.bias=-.0002;shadow.normalBias=.035;shadow.radius=2;shadow.autoUpdate=false;if(!a.shadowReady){shadow.needsUpdate=true;a.shadowReady=true;}}
 }else if(a.saved){const s=a.saved;h.scene.background=s.background;h.scene.fog=s.fog;h.sun.color.copy(s.sunColor);h.sun.intensity=s.sunIntensity;h.sun.position.copy(s.sunPosition);h.hemisphere.color.copy(s.hemi);h.hemisphere.groundColor.copy(s.ground);h.hemisphere.intensity=s.hemiIntensity;h.fillLight.position.copy(s.fillPosition);h.fillLight.color.copy(s.fill);h.fillLight.intensity=s.fillIntensity;h.sun.castShadow=s.castShadow;a.saved=null;}
}
function draw(h,render){
 const a=h.concourse?.hall.art,r=h.api.renderer();if(!a?.saved||h.mobile)return render();
 const s=r.shadowMap,enabled=s.enabled,auto=s.autoUpdate,update=s.needsUpdate;
 try{s.enabled=true;s.autoUpdate=false;s.needsUpdate=!h.sun.shadow.map||h.sun.shadow.needsUpdate;return render();}
 finally{s.enabled=enabled;s.autoUpdate=auto;s.needsUpdate=update;}
}
function update(h){
 const a=h.inConcourse?h.concourse?.hall.art:h.plazaArt;if(!a)return;
 const motion=h.guideMotion.matches?0:h.time;
 (a.cloudMesh||a.clouds).position.x=Math.sin(motion*.035)*1.4;a.mist.uniforms.uMistClock.value=motion;
}
window.ElementalConcourseArt={build,buildPlaza,paintPlaza,portal,atmosphere,draw,update,wallHeight};
})();
