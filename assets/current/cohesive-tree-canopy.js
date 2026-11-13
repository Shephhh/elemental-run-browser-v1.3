/* Single connected angular crowns. Species silhouettes, not overlapping spheres. */
(function(g){'use strict';
const profiles=Object.freeze({
 oak:{rings:[.14,.68,.94,1,.91,.55,.06],power:.62,lean:.03,skew:.1},
 young:{rings:[.08,.6,1,.86,.61,.28,.02],power:1,lean:-.06,skew:.07},
 birch:{rings:[.08,.7,1,.92,.7,.32,.03],power:.88,lean:.1,skew:.05},
 twin:{rings:[.12,.62,.9,1,.84,.44,.05],power:.72,lean:-.1,skew:.14},
 autumn:{rings:[.1,.67,.93,1,.87,.57,.07],power:.57,lean:.22,skew:.18},
 apple:{rings:[.2,.84,1,.98,.86,.52,.1],power:.48,lean:-.02,skew:.06}
});
function geometry(T,{seed=1,radius=6,height=6,aspect=1,palette,style='oak'}){
 seed=seed>>>0;
 const profile=profiles[style]||profiles.oak,segments=12,rings=profile.rings,levels=[0,.13,.32,.52,.73,.9,1],pos=[],colors=[],uv=[],indices=[];
 const outline=[.92,1.09,.85,.96,1.06,.82,1.02,.91,1.12,.88,.98,.84];
 const peaks=[-.07,.08,.04,-.1,.1,-.03,.06,-.08,.05,.09,-.05,0],phase=seed*.731;
 const low=new T.Color(palette[0]),mid=new T.Color(palette[1]),high=new T.Color(palette[2]),tint=new T.Color();
 const angular=v=>Math.sign(v)*Math.pow(Math.abs(v),profile.power);
 for(let j=0;j<rings.length;j++)for(let i=0;i<=segments;i++){
  const k=i%segments,a=k/segments*Math.PI*2,c=Math.cos(a),s=Math.sin(a),l=levels[j],shape=outline[(k+seed)%segments];
  const ridge=1+.04*Math.sin(k*1.7+j*1.9+phase),r=radius*rings[j]*shape*ridge;
  const y=(l-.45)*height+(peaks[(k+seed*3)%segments]+profile.skew*c)*height*Math.sin(l*Math.PI);
  // Large angular planes + offset shoulders create a connected, irregular crown.
  pos.push(angular(c)*r+radius*profile.lean*l*l,y,angular(s)*r*aspect);uv.push(i/segments,l);
  if(l<.55)tint.copy(low).lerp(mid,l/.55);else tint.copy(mid).lerp(high,(l-.55)/.45);
  tint.multiplyScalar(.95+.045*Math.sin(k*2.3+phase));colors.push(tint.r,tint.g,tint.b);
 }
 for(let j=0;j<rings.length-1;j++)for(let i=0;i<segments;i++){const a=j*(segments+1)+i,b=a+segments+1;indices.push(a,b,a+1,b,b+1,a+1);}
 const bottom=pos.length/3;pos.push(0,-.45*height,0);colors.push(low.r,low.g,low.b);uv.push(.5,0);
 const top=pos.length/3;pos.push(radius*profile.lean,.55*height,0);colors.push(high.r,high.g,high.b);uv.push(.5,1);
 for(let i=0;i<segments;i++){indices.push(bottom,i,i+1);const a=(rings.length-1)*(segments+1)+i;indices.push(top,a+1,a);}
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(pos,3));geo.setAttribute('color',new T.Float32BufferAttribute(colors,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));geo.setIndex(indices);geo.computeVertexNormals();geo.computeBoundingBox();geo.computeBoundingSphere();
 geo.userData.cohesiveCanopy=true;geo.userData.canopyStyle=style;geo.userData.canopySegments=segments;geo.userData.canopyRings=rings.length;return geo;
}
const families=Object.freeze(['oak','oak','pine','pine','birch','birch','autumn','apple']);
// Compare accepted trees on either side of the new slot, including staged chunks.
function pickRoadTree(x,side,neighbors,random=Math.random,other=[]){
 let before=null,after=null,mirror=null,left=Infinity,right=Infinity,across=12;
 for(const list of [neighbors,other])for(const n of list){
  const family=n.userData?.treeClass;if(!family)continue;
  const dx=n.position.x-x;
  if(n.userData.roadSide!==side){if(Math.abs(dx)<across){across=Math.abs(dx);mirror=family;}continue;}
  if(dx<=0&&-dx<left){left=-dx;before=family;}
  if(dx>0&&dx<right){right=dx;after=family;}
 }
 const eligible=[];for(let i=0;i<families.length;i++){const f=families[i];if(f!==before&&f!==after&&f!==mirror)eligible.push(i);}
 return eligible[Math.floor(random()*eligible.length)];
}
g.ElementalTreeCanopy=Object.freeze({geometry,families,pickRoadTree});
})(typeof window!=='undefined'?window:globalThis);
