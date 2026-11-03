/* Shared, code-native rounded cube and lightweight secondary motion. */
(function(g){'use strict';
function rounded(T,w=1,h=1,d=1,r=.16,segments=5){
 r=Math.min(r,w/2-.001,h/2-.001,d/2-.001);
 const geo=new T.BoxGeometry(w,h,d,segments,segments,segments),p=geo.attributes.position,normals=geo.attributes.normal,n=new T.Vector3();
 const hx=w/2-r,hy=h/2-r,hz=d/2-r;
 for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),cx=Math.max(-hx,Math.min(hx,x)),cy=Math.max(-hy,Math.min(hy,y)),cz=Math.max(-hz,Math.min(hz,z));n.set(x-cx,y-cy,z-cz).normalize();p.setXYZ(i,cx+n.x*r,cy+n.y*r,cz+n.z*r);normals.setXYZ(i,n.x,n.y,n.z);}
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
// Clone the actual hub hierarchy, including owned cosmetic; never share disposal.
function cloneHub(T,hub,own){
 if(!hub?.avatar||!hub.body)throw Error('Hub avatar must be prepared first');
 const root=hub.avatar.clone(true),geometries=new Map(),materials=new Map(),textures=new Map();
 root.traverse(o=>{if(!o.isMesh)return;if(!geometries.has(o.geometry))geometries.set(o.geometry,own(o.geometry.clone()));o.geometry=geometries.get(o.geometry);
  const material=m=>{if(!materials.has(m)){const copy=own(m.clone());for(const key of ['map','normalMap','roughnessMap','metalnessMap','emissiveMap','aoMap'])if(copy[key]){const tex=copy[key];if(!textures.has(tex))textures.set(tex,own(tex.clone()));copy[key]=textures.get(tex);}materials.set(m,copy);}return materials.get(m);};
  o.material=Array.isArray(o.material)?o.material.map(material):material(o.material);
 });
 root.position.set(0,0,0);root.rotation.set(0,0,0);root.visible=true;
 const body=root.children[hub.avatar.children.indexOf(hub.body)];body.position.set(0,0,0);body.scale.set(1,1,1);body.rotation.set(0,0,0);
 return{root,body,motion:{phase:0,move:0,landing:0,wasGrounded:true,vy:0}};
}
g.ElementalCubeAvatar={rounded,limbs,animate,cloneHub};
})(window);
