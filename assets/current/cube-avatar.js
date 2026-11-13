/* Shared, code-native rounded cube and lightweight secondary motion. */
(function(g){'use strict';
function rounded(T,w=1,h=1,d=1,r=.16,segments=5){
 r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);
 const geo=new T.BoxGeometry(w,h,d,segments,segments,segments),p=geo.attributes.position,normals=geo.attributes.normal,n=new T.Vector3();
 const hx=w/2-r,hy=h/2-r,hz=d/2-r;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),cx=Math.max(-hx,Math.min(hx,x)),cy=Math.max(-hy,Math.min(hy,y)),cz=Math.max(-hz,Math.min(hz,z));n.set(x-cx,y-cy,z-cz).normalize();p.setXYZ(i,cx+n.x*r,cy+n.y*r,cz+n.z*r);normals.setXYZ(i,n.x,n.y,n.z);}
 geo.userData.roundedCore={x:hx,y:hy,z:hz,r};
 geo.computeBoundingBox();geo.computeBoundingSphere();return geo;
}
function limbs(T,own,parent,scale=1){
 const mat=own(new T.MeshStandardMaterial({color:0x71c9b3,roughness:.5,metalness:.08})),sole=own(new T.MeshStandardMaterial({color:0x284957,roughness:.65}));
 const hands=[],feet=[];
 for(const side of [-1,1]){const hand=new T.Mesh(own(rounded(T,.28,.38,.3,.12,3)),mat);hand.position.set(side*.76,.65,0);parent.add(hand);hands.push(hand);const foot=new T.Mesh(own(rounded(T,.38,.23,.55,.09,3)),sole);foot.position.set(side*.3,.12,.05);parent.add(foot);feet.push(foot);}
 for(const m of [...hands,...feet]){m.position.multiplyScalar(scale);m.scale.setScalar(scale);m.userData.restY=m.position.y;m.userData.restZ=m.position.z;}
 return{hands,feet,landing:0,vy:0,lastGrounded:true,scale};
}
function animate(rig,body,time,dt,speed,grounded,vy=0,diving=false,baseY=.8){
 if(!rig)return;const s=rig.scale,k=1-Math.exp(-16*Math.min(.05,dt||0));
 if(grounded&&!rig.lastGrounded)rig.landing=Math.min(.22,Math.abs(rig.vy)*.012);
 rig.landing*=Math.exp(-11*Math.min(.05,dt||0));rig.lastGrounded=grounded;rig.vy=vy;
 const stride=time*(6+Math.min(speed,10)*1.25),blend=Math.min(1,speed/4),bob=grounded?Math.abs(Math.sin(stride))*.035*blend:0;
 body.position.y=baseY+bob-rig.landing*.35;
 body.scale.set(1+rig.landing*.3,1-rig.landing+(grounded?0:.035),1+rig.landing*.3);
 const lean=diving?-.9:Math.max(-.1,Math.min(.1,-vy*.006));body.rotation.x+=(lean-body.rotation.x)*k;
 body.rotation.z=grounded?Math.sin(stride)*.018*blend:Math.sin(time*2)*.012;
 rig.hands.forEach((m,i)=>{const phase=stride+i*Math.PI;m.position.y=m.userData.restY+Math.sin(phase)*.08*blend*s;m.position.z=m.userData.restZ+(diving?-.44:Math.cos(phase)*.22*blend)*s;m.rotation.x=diving?-1.15:Math.sin(phase)*.45*blend;});
 rig.feet.forEach((m,i)=>{const phase=stride+i*Math.PI;m.position.y=m.userData.restY+(grounded?Math.max(0,Math.sin(phase))*.1*blend:.14)*s;m.position.z=m.userData.restZ+Math.cos(phase)*.15*blend*s;m.rotation.x=grounded?Math.sin(phase)*.28*blend:.15;});
}
const clamp=(v,a,b)=>Math.max(a,Math.min(b,v));
function jellyMaterial(T){
 const material=new T.MeshPhysicalMaterial({color:0x6ee2b8,metalness:0,roughness:.28,clearcoat:.8,clearcoatRoughness:.24,
  emissive:0x349f7c,emissiveIntensity:.23,transparent:true,opacity:.89,depthWrite:false});
 material.name='mint-jelly';return material;
}
function resetJelly(body,m){
 Object.assign(m,{time:0,phase:0,move:0,speed:0,landing:0,age:1,wasGrounded:true,vy:0,turn:0,
  push:0,flexX:0,flexZ:0,flexVX:0,flexVZ:0,stretch:0,turnBlend:0});
 body.position.y=0;body.scale.set(1,1,1);body.rotation.set(0,0,0);
 body.matrixAutoUpdate=false;body.updateMatrix();
}
// Exact damped oscillator for the crown's lag. The base, face and hat share
// one affine transform, so attachments cannot separate or need GPU skinning.
function flexStep(m,axis,velocity,target,dt){
 const d=(m[axis]||0)-target,v=m[velocity]||0,w=13,k=7,phase=w*dt;
 const c=Math.cos(phase),s=Math.sin(phase),e=Math.exp(-k*dt),u=(v+k*d)/w;
 m[axis]=target+e*(d*c+u*s);m[velocity]=e*((u*w-k*d)*c-(d*w+k*u)*s);
}
function animateJelly(body,m,dt,speed,grounded,vy,foot=-1,reduced=false,impact=0,quietGround=false){
 dt=clamp(dt,0,.05);
 const k=1-Math.exp(-13*dt),accel=dt?clamp((speed-(m.speed||0))/dt/25,-1,1):0;
 m.time=(m.time||0)+dt;m.phase=(m.phase||0)+dt*(3.2+speed*.82);
 m.speed=speed;m.move=(m.move||0)+(Math.min(1,speed/7.5)-(m.move||0))*k;
 if(grounded&&(impact>0||!m.wasGrounded)){m.landing=Math.min(.22,Math.max(impact,-(m.vy||0))*.018)*(reduced?.43:1);m.age=0;}
 else m.age=(m.age??1)+dt;
 m.wasGrounded=grounded;m.vy=vy;
 const wobble=(m.landing||0)*Math.exp(-(reduced?12:5.8)*m.age)*Math.cos(17.5*m.age);
 const breathe=reduced?0:Math.sin(m.time*2.6)*.027*(1-m.move);
 const stride=reduced||!grounded?0:Math.sin(m.phase)*.031*m.move*(quietGround?.24:1);
 const stretch=grounded?0:Math.min(.17,.033+Math.abs(vy)*.014)*(reduced?.44:1);
 m.stretch=grounded?0:(m.stretch||0)+(stretch-(m.stretch||0))*(1-Math.exp(-19*dt));
 const sy=clamp(1+breathe+stride+m.stretch-wobble,.78,1.2),xz=1/Math.sqrt(sy);
 body.scale.set(xz,sy,xz);
 m.push=(m.push||0)+(accel-(m.push||0))*(1-Math.exp(-14*dt));
 const strength=reduced?.25:quietGround?.52:1,lean=(grounded?-.046*m.move:clamp(-vy*.006,-.065,.065))*strength;
 const turn=clamp(m.turn||0,-8,8)*Math.min(1,speed/3.5);
 m.turnBlend=(m.turnBlend||0)+(turn-(m.turnBlend||0))*(1-Math.exp(-10*dt));
 // Keep the stride's squash vertical. Lean sideways only on a real,
 // sustained turn; avoid alternating bank and spring overshoot each step.
 const bank=-m.turnBlend*.0038*strength,targetX=m.turnBlend*.0075*strength;
 m.flexX=(m.flexX||0)+(targetX-(m.flexX||0))*(1-Math.exp(-11*dt));
 flexStep(m,'flexZ','flexVZ',(grounded?.073*m.move+.17*m.push:clamp(-vy*.01,-.11,.1))*strength,dt);
 body.rotation.x+=(lean-body.rotation.x)*k;body.rotation.z+=(bank-body.rotation.z)*k;
 body.matrixAutoUpdate=false;body.updateMatrix();
 const a=body.matrix.elements,shape=body.geometry.userData.roundedCore;
 const h=shape.y+shape.r;
 // Shear around the underside. Compute its support height in the full
 // transformed space to keep the visual base on the rendered ground.
 for(let i=0;i<3;i++){const lag=m.flexX*a[i]+m.flexZ*a[i+8];a[i+4]+=lag;a[i+12]+=h*lag;}
 const nx=Math.abs(a[1]),ny=Math.abs(a[5]),nz=Math.abs(a[9]);
 body.position.y=grounded?foot+shape.x*nx+shape.y*ny+shape.z*nz+shape.r*Math.hypot(nx,ny,nz):h*(sy-1);
 a[13]=body.position.y;
}
function jellyPlatformHeight(s,x,z){
 if(!s?.active||s.trap||s.triggerOnly||s.shiftGroup||s.walkSurface||s.boardTile||s.look==='mazeFloor'||s.look==='ghost'||s.look==='ghostBrown'||s.type==='crumble')return null;
 if(Math.abs(x-s.x)>s.w/2-.16||Math.abs(z-s.z)>s.d/2-.16)return null;
 return s.y+(s.checker?0:.11);
}
function createJellyTrail(T,own,scene,mobile=false){
 const limit=mobile?24:48,lifetime=mobile?1.4:1.8,spacing=mobile?.62:.51,stride=3;
 const data=new Float32Array(limit*stride),geometry=own(new T.PlaneGeometry(1,1));
 geometry.rotateX(-Math.PI/2);geometry.setAttribute('stampUV',geometry.attributes.uv);
 const stamps=new T.InstancedBufferAttribute(data,stride).setUsage(T.DynamicDrawUsage);geometry.setAttribute('stampInfo',stamps);
 const clock={value:0},material=own(new T.MeshBasicMaterial({color:0x58dfaa,transparent:true,depthWrite:false,polygonOffset:true,polygonOffsetFactor:-1,polygonOffsetUnits:-1}));
 material.onBeforeCompile=s=>{
  s.uniforms.uJellyTime=clock;s.uniforms.uJellyLife={value:lifetime};
  s.vertexShader='attribute vec2 stampUV;attribute vec3 stampInfo;varying vec2 vStampUV;varying vec3 vStampInfo;\n'+s.vertexShader.replace('#include <begin_vertex>','#include <begin_vertex>\nvStampUV=stampUV;vStampInfo=stampInfo;');
  s.fragmentShader='uniform float uJellyTime;uniform float uJellyLife;varying vec2 vStampUV;varying vec3 vStampInfo;\n'+s.fragmentShader.replace('#include <color_fragment>',`#include <color_fragment>
   vec2 q=vStampUV*2.0-1.0;float phase=vStampInfo.z;
   vec2 blob=q+vec2(.12*sin(q.y*4.8+phase),.13*sin(q.x*5.7-phase))*(1.0-dot(q,q)*.3);
   float r=length(blob)+.037*sin(q.y*9.0+phase)*sin(q.x*7.0);
   float age=smoothstep(.19,uJellyLife,uJellyTime-vStampInfo.x);
   float coverage=1.0-smoothstep(.73,.88,r+age*.12);
   float wet=smoothstep(.52,.72,r)*(1.0-smoothstep(.72,.87,r))*(.55+.45*q.x);
   float gleam=1.0-smoothstep(.11,.51,length((q-vec2(-.27,-.26))*vec2(2.3,1.25)));
   diffuseColor.rgb=mix(diffuseColor.rgb,vec3(.64,1.,.89),.62*wet+.29*gleam);
   diffuseColor.a*=coverage*vStampInfo.y*(1.0-age);`);
 };
 material.customProgramCacheKey=()=> 'elemental-jelly-trail-v2';
 const mesh=own(new T.InstancedMesh(geometry,material,limit)),dummy=new T.Object3D(),matrix=new T.Matrix4();
 mesh.name='jelly-trail';mesh.instanceMatrix.setUsage(T.DynamicDrawUsage);mesh.frustumCulled=false;mesh.count=0;mesh.renderOrder=1;scene.add(mesh);
 let lastX=0,lastZ=0,key=null,carry=0,dirty=false,serial=0,next=spacing;
 function clear(){mesh.count=0;clock.value=0;key=null;carry=0;dirty=false;serial=0;next=spacing;}
 function write(x,z,w,d,yaw,alpha,heightAt,phase){
  const y=heightAt(x,z);if(!Number.isFinite(y))return;
  const c=Math.cos(yaw),s=Math.sin(yaw);
  // Check all corners against the same surface height; reject prints spanning an edge or stair.
  for(let a=-.5;a<=.5;a++)for(let b=-.5;b<=.5;b++){
   const h=heightAt(x+a*w*c+b*d*s,z-a*w*s+b*d*c);if(!Number.isFinite(h)||Math.abs(h-y)>.003)return;
  }
  let i=mesh.count;if(i<limit)mesh.count++;else{ i=0;for(let j=1;j<limit;j++)if(data[j*stride]<data[i*stride])i=j; }
  dummy.position.set(x,y+.013,z);dummy.rotation.y=yaw;dummy.scale.set(w,1,d);dummy.updateMatrix();mesh.setMatrixAt(i,dummy.matrix);
  const at=i*stride;data[at]=clock.value;data[at+1]=alpha;data[at+2]=phase;dirty=true;
 }
 function update(dt,x,z,surfaceKey,heightAt,moving=false,impact=0,reduced=false){
  if(dt<=0)return;
  clock.value+=dt;
  for(let i=0;i<mesh.count;){
   if(clock.value-data[i*stride]<lifetime){i++;continue;}
   const j=--mesh.count;if(j!==i){mesh.getMatrixAt(j,matrix);mesh.setMatrixAt(i,matrix);for(let k=0;k<stride;k++)data[i*stride+k]=data[j*stride+k];dirty=true;}
  }
  const dx=x-lastX,dz=z-lastZ,distance=Math.hypot(dx,dz);
  if(surfaceKey!=null){
   if(impact>=6&&!reduced){
    for(let i=0;i<6;i++){const a=i*Math.PI/3+.28,r=.39+(i%3)*.17;write(x+Math.cos(a)*r,z+Math.sin(a)*r,.22+(i%2)*.1,.27+(i%3)*.07,a,.63,heightAt,a);}
   }
   if(moving&&key===surfaceKey&&distance>.0001&&distance<1.3){
    const yaw=Math.atan2(dx,dz),sideX=dz/distance,sideZ=-dx/distance;let offset=next-carry;
    while(offset<=distance){
     // Stable low-discrepancy phases: no per-frame randomness, mirrored tracks,
     // or equally spaced chain. Larger puddles mingle with smaller droplets.
     const n=++serial,phase=(n*2.39996323)%(2*Math.PI),side=.235*Math.sin(phase)+.05*Math.sin(phase*2);
     const t=offset/distance,cx=lastX+dx*t,cz=lastZ+dz*t;
     const size=.43+.29*(.5+.5*Math.sin(phase+.8));
     write(cx+sideX*side,cz+sideZ*side,size,size*(.57+.29*(.5+.5*Math.cos(phase))),yaw+.76*Math.sin(phase+.4),.45+size*.22,heightAt,phase);
     if(n%(mobile?5:3)===0){
      const s=-Math.sign(side)*(.29+.11*Math.abs(Math.sin(phase))),r=.14+.08*Math.abs(Math.sin(phase));
      write(cx+sideX*s-dx/distance*.12,cz+sideZ*s-dz/distance*.12,r,r*.73,yaw-phase,.49,heightAt,phase+1);
     }
     next=spacing*(.77+.49*(.5+.5*Math.sin(phase+1.3)));offset+=next;
    }
    carry=distance-offset+next;
   }else carry=0;
  }else carry=0;
  key=surfaceKey;lastX=x;lastZ=z;
  if(dirty){stamps.needsUpdate=true;mesh.instanceMatrix.needsUpdate=true;dirty=false;}
 }
 return{mesh,limit,lifetime,clear,update};
}
// Clone the actual hub hierarchy, including owned cosmetic; never share disposal.
function cloneHub(T,hub,own){
 if(!hub?.avatar||!hub.body)throw Error('Hub avatar must be prepared first');
 const root=hub.avatar.clone(true),geometries=new Map(),materials=new Map(),textures=new Map();
 root.traverse(o=>{if(!o.isMesh)return;if(!geometries.has(o.geometry))geometries.set(o.geometry,own(o.geometry.clone()));o.geometry=geometries.get(o.geometry);
  const material=m=>{if(!materials.has(m)){const copy=own(m.clone());for(const key of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'])if(copy[key]){const tex=copy[key];if(!textures.has(tex))textures.set(tex,own(tex.clone()));copy[key]=textures.get(tex);}materials.set(m,copy);}return materials.get(m);};
  o.material=Array.isArray(o.material)?o.material.map(material):material(o.material);
 });
 root.position.set(0,0,0);root.rotation.set(0,0,0);root.visible=true;
 const body=root.children[hub.avatar.children.indexOf(hub.body)],motion={};resetJelly(body,motion);
 const facePart=o=>o?body.children[hub.body.children.indexOf(o)]:null;
 return{root,body,motion,
  face:{eyes:(hub.faceEyes||[]).map(facePart),smile:facePart(hub.faceSmile),surprise:facePart(hub.faceSurprise)}};
}
g.ElementalCubeAvatar={rounded,limbs,animate,cloneHub,jellyMaterial,resetJelly,animateJelly,jellyPlatformHeight,createJellyTrail};
})(window);
