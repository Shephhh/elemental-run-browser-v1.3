/* User-provided branching-tree study, adapted to two cached instanced parts.
 * Optional old study only via ?trees=study; default uses the current angular family. */
(function(g){'use strict';
const enabled=new URLSearchParams(g.location?.search||'').get('trees')==='study';
const profiles=Object.freeze([
 {name:'meadow',height:12,radius:1.25,arms:5,spread:1,leaf:0x487530,bark:0x543823},
 {name:'young',height:10,radius:1,arms:4,spread:.85,leaf:0x658b39,bark:0x63432c},
 {name:'spire',height:14,radius:1.15,arms:5,spread:.65,leaf:0x2d5435,bark:0x493326},
 {name:'forest',height:12.8,radius:1.3,arms:6,spread:.82,leaf:0x365e2c,bark:0x493120},
 {name:'silver',height:12,radius:.95,arms:4,spread:.9,leaf:0x779458,bark:0xbcb29b},
 {name:'sage',height:13,radius:1.1,arms:5,spread:1,leaf:0x537e69,bark:0x938470},
 {name:'copper',height:11,radius:1.2,arms:5,spread:1.1,leaf:0xbd6e30,bark:0x563b2b},
 {name:'orchard',height:9,radius:1.2,arms:4,spread:1.15,leaf:0x77963c,bark:0x68482c}
]);
function createParts(T,index,materials){
 const profile=profiles[index%profiles.length];let seed=9173+index*101;
 const rnd=()=>((seed=(Math.imul(seed,1664525)+1013904223)>>>0)/4294967296);
 const data={wood:{p:[],n:[],c:[]},foliage:{p:[],n:[],c:[]}},up=new T.Vector3(0,1,0),dir=new T.Vector3(),mid=new T.Vector3(),q=new T.Quaternion(),matrix=new T.Matrix4(),unit=new T.Vector3(1,1,1);
 let branches=0,leaves=0;
 const bake=(geometry,bucket,color)=>{const geo=geometry.index?geometry.toNonIndexed():geometry,p=geo.attributes.position,n=geo.attributes.normal,base=new T.Color(color);for(let i=0;i<p.count;i++){bucket.p.push(p.getX(i),p.getY(i),p.getZ(i));bucket.n.push(n.getX(i),n.getY(i),n.getZ(i));const tint=.94+.06*Math.sin(p.getX(i)*1.3+p.getZ(i)*.7+p.getY(i)*.21);bucket.c.push(base.r*tint,base.g*tint,base.b*tint);}if(geo!==geometry)geo.dispose();geometry.dispose();};
 const branch=(a,b,r0,r1)=>{dir.copy(b).sub(a);const length=dir.length();q.setFromUnitVectors(up,dir.normalize());mid.copy(a).add(b).multiplyScalar(.5);matrix.compose(mid,q,unit);const geo=new T.CylinderGeometry(r1,r0,length,7,1);geo.applyMatrix4(matrix);bake(geo,data.wood,profile.bark);branches++;};
 const leaf=(at,size)=>{const geo=new T.IcosahedronGeometry(size,1),p=geo.attributes.position;
  // Equal positions receive equal distortion, so duplicated triangle vertices
  // cannot pull apart into the cracks caused by independent per-vertex noise.
  const sx=(1.05+rnd()*.13)*profile.spread,sy=.7+rnd()*.12,sz=(1.03+rnd()*.12)*profile.spread;
  for(let i=0;i<p.count;i++){const x=p.getX(i),y=p.getY(i),z=p.getZ(i),w=1+.045*Math.sin(x*2.7+y*1.2+z*3.1+index);p.setXYZ(i,at.x+x*sx*w,at.y+y*sy*w,at.z+z*sz*w);}
  geo.computeVertexNormals();bake(geo,data.foliage,profile.leaf);leaves++;
 };
 const v=(x,y,z)=>new T.Vector3(x,y,z),h=profile.height,r=profile.radius;
 const base=v(0,0,0),shoulder=v((rnd()-.5)*.7,h,0),crown=v((rnd()-.5)*1.6,h*1.58,(rnd()-.5)*1.2),top=v(crown.x+.3,h*1.95,crown.z-.2);
 branch(base,shoulder,r,r*.64);branch(shoulder,crown,r*.64,r*.32);branch(crown,top,r*.32,.08);
 for(let j=0;j<5;j++){const a=j*Math.PI*2/5+.17*rnd(),length=r*(2.4+rnd()*.7);branch(v(0,.8,0),v(Math.cos(a)*length,-.15,Math.sin(a)*length),r*.55,.08);}
 for(let j=0;j<profile.arms;j++){
  const a=j*Math.PI*2/profile.arms+index*.43,from=v(shoulder.x*.7,h*(.59+j/profile.arms*.38),0),reach=h*(.28+rnd()*.12)*profile.spread;
  const fork=v(from.x+Math.cos(a)*reach,from.y+h*(.25+rnd()*.12),Math.sin(a)*reach),tip=v(fork.x+Math.cos(a+.2)*h*.12,fork.y+h*(.17+rnd()*.12),fork.z+Math.sin(a+.2)*h*.12);
  branch(from,fork,r*.38,r*.18);branch(fork,tip,r*.18,.045);
  const twig=v(fork.x+Math.cos(a+1)*h*.11,fork.y+h*.17,fork.z+Math.sin(a+1)*h*.11);branch(fork,twig,r*.13,.035);
  leaf(tip,h*(.20+rnd()*.025));
 }
 leaf(top,h*.21);
 const parts=[];for(const key of ['wood','foliage']){const d=data[key],geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(d.p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(d.n,3));geo.setAttribute('color',new T.Float32BufferAttribute(d.c,3));geo.computeBoundingBox();geo.computeBoundingSphere();parts.push({geo,mat:materials[key]});}
 return{parts,stats:{name:profile.name,branches,leafClusters:leaves,triangles:parts.reduce((n,p)=>n+p.geo.attributes.position.count/3,0)}};
}
g.ElementalTreeStudy=Object.freeze({enabled,profiles,createParts});
})(typeof window!=='undefined'?window:globalThis);
