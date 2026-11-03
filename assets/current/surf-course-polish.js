/* Bhop/Surf wall detail only. No navigation arrows or route HUD. */
(function(scope){'use strict';
const dot=(a,b)=>a[0]*b[0]+a[1]*b[1]+a[2]*b[2],clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
async function plan(data,valid=()=>true){if(valid())data.coursePolish={arrows:[],routes:[],paths:[],ramps:[],visible:0,fixtures:0};}
function boxTransform(T,x,y,z,w,h,d,normal){const q=new T.Quaternion().setFromUnitVectors(new T.Vector3(0,0,1),new T.Vector3(...normal)),pos=new T.Vector3(x,y,z);return new T.Matrix4().compose(pos,q,new T.Vector3(w,h,d));}
async function build(T,data,group,own,api,valid){const state=data.coursePolish,M=scope.ElementalSurfMaps;if(!state)return;
 // Route-independent fixtures sit ON actual vertical wall faces, not random
 // room AABB corners. Clear jumping headroom and no extra collision/light.
 const anchors=[data.spawn,...data.checkpoints],fixtures=[],candidates=[],limit=api.mobile?8:24;let stamp=performance.now();
 for(const o of data.biome.walls){if(candidates.length>=limit*8)break;if(o.top-o.bottom<5)continue;let selected=null;
  for(const f of o.faces){const a=o.vertices[f.i[0]],b=o.vertices[f.i[1]],c=o.vertices[f.i[2]],u=b.map((n,i)=>n-a[i]),v=c.map((n,i)=>n-a[i]),n=[u[1]*v[2]-u[2]*v[1],u[2]*v[0]-u[0]*v[2],u[0]*v[1]-u[1]*v[0]],l=Math.hypot(...n);if(l<1e-6||Math.abs(n[1]/l)>.01)continue;for(let i=0;i<3;i++)n[i]/=l;const centre=[0,0,0];for(const k of f.i)for(let i=0;i<3;i++)centre[i]+=o.vertices[k][i]/f.i.length;
   for(let anchor=0;anchor<anchors.length;anchor++){const p=anchors[anchor],delta=[p.x-centre[0],p.y-centre[1],p.z-centre[2]],distance=dot(delta,n);if(distance<1||distance>28)continue;const x=p.x-n[0]*distance,z=p.z-n[2]*distance,y=clamp(p.y+4.4,o.bottom+1.2,o.top-.8);if(y-.75<p.y+3.5||!M.contains(o,[x-n[0]*.02,y,z-n[2]*.02],.03))continue;
    if(candidates.some(q=>Math.hypot(q.x-x,q.y-y,q.z-z)<5)||data.solids.some(s=>s!==o&&M.contains(s,[x+n[0]*.15,y,z+n[2]*.15],.15)))continue;selected={x:x+n[0]*.045,y,z:z+n[2]*.045,n,anchor};break;}
   if(selected)break;
  }if(selected)candidates.push(selected);if(performance.now()-stamp>3){await new Promise(r=>setTimeout(r,0));stamp=performance.now();if(!valid())return;}
 }
 for(let round=0;round<limit&&fixtures.length<limit;round++)for(let anchor=0;anchor<anchors.length&&fixtures.length<limit;anchor++){const f=candidates.filter(f=>f.anchor===anchor)[round];if(f)fixtures.push(f);}
 if(fixtures.length){const geometry=own(new T.BoxGeometry(1,1,1)),colors=scope.ElementalSurfArchitecture.COLORS,accents=scope.ElementalSurfArchitecture.ACCENTS,bodyMat=own(new T.MeshStandardMaterial({color:data.phase===1?0x725637:colors[data.phase],metalness:data.phase===1?.08:.55,roughness:data.phase===1?.85:.48})),lightMat=own(new T.MeshBasicMaterial({color:accents[data.phase],toneMapped:false})),body=own(new T.InstancedMesh(geometry,bodyMat,fixtures.length*6)),light=own(new T.InstancedMesh(geometry,lightMat,fixtures.length));let index=0;
  for(let i=0;i<fixtures.length;i++){const f=fixtures[i],right=[f.n[2],0,-f.n[0]];for(const [dx,dy,w,h]of [[-.5,0,.12,1.5],[.5,0,.12,1.5],[0,-.72,1.12,.12],[0,.72,1.12,.12],[0,-.2,.82,.12],[0,.2,.82,.12]])body.setMatrixAt(index++,boxTransform(T,f.x+right[0]*dx,f.y+dy,f.z+right[2]*dx,w,h,.09,f.n));light.setMatrixAt(i,boxTransform(T,f.x+f.n[0]*.06,f.y+.48,f.z+f.n[2]*.06,.76,.08,.035,f.n));}
  body.computeBoundingSphere();light.computeBoundingSphere();body.userData.courseWallDetails=light.userData.courseWallDetails=true;group.add(body,light);
 }state.fixtures=fixtures.length;state.fixturePositions=fixtures.map(({x,y,z,anchor})=>({x,y,z,anchor}));
}
function update(){}
function routeTarget(){return null;}
scope.ElementalSurfCoursePolish={plan,build,update,routeTarget};
})(typeof window!=='undefined'?window:globalThis);
