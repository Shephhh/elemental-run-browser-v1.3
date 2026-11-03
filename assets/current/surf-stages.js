/* Whole-map navigation. Checkpoint legs are hints, never separate levels. */
(function(scope){'use strict';
const layouts={
 nux:[
  {from:'1',to:'2',box:[-12,103,-24,30,-15,35]},
  {from:'2',to:'3',box:[88,192,-24,30,-15,35]},
  {from:'3',to:'4',box:[175,365,-26,45,-15,190],via:[[286,0,9],[286,0,160]]},
  {from:'4',to:'5',box:[88,365,-55,45,170,335]},
  {from:'5',to:'6',box:[85,165,-28,20,95,245]},
  {from:'6',box:[142,275,-28,20,92,330],via:[[242,-11.28,116],[242,-11.28,295]]}
 ],
 treehouse3:[
  {from:'0',to:'1',gates:[-8],box:[-35,140,-74,65,-195,8],via:[[27.26,6.7,-148],[27.26,6.7,-154],[-3.76,-61,-63]]},
  {from:'1',to:'2',gates:[-11],box:[14,116,-46,28,-161,8]},
  {from:'2',to:'3',gates:[-18],box:[-300,-65,75,180,-181,106],via:[[-181.9,148.53,60],[-181.9,121.27,-85]]},
  {from:'3',aliases:['4'],to:'5',gates:[-22,-27],box:[165,395,48,272,-421,435]},
  {from:'5',aliases:['4'],to:'6',gates:[-45],box:[225,325,170,272,-421,-100]},
  {from:'6',aliases:['7'],to:'8',gates:[-46],box:[-306,-44,-367,-80,-241,461],via:[[-133.01,-125.84,244],[-194.1,-201.98,68],[-173.43,-273.42,35]]},
  {from:'8',aliases:['9','10'],box:[150,400,-232,-105,-482,475],via:[[273.54,-213.26,45]]}
 ],
 beginner:[
  {from:'0',to:'2',gates:[-2],box:[-33,25,-18,27,-66,8]},
  {from:'2',to:'3',gates:[-6,-7],box:[24,123,-12,42,-133,-57]},
  {from:'3',to:'4',gates:[-8],box:[34,113,-12,43,-56,12]},
  {from:'4',to:'5',gates:[-15],box:[-92,86,-29,43,-199,-149]},
  {from:'5',to:'6',gates:[-27],box:[-179,46,-2,97,19,77]},
  {from:'6',to:'7',gates:[-26],box:[-92,-46,-7,92,-139,7]},
  {from:'7',box:[-207,-106,-17,103,-164,-10]}
 ]
};
const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
function projection(points,p){let best=Infinity,along=0,total=0,target=null;for(let i=1;i<points.length;i++){const a=points[i-1],b=points[i],dx=b.x-a.x,dy=b.y-a.y,dz=b.z-a.z,len=Math.hypot(dx,dy,dz);if(len<.001)continue;const t=clamp(((p.x-a.x)*dx+(p.y-a.y)*dy+(p.z-a.z)*dz)/(len*len),0,1),distance=Math.hypot(p.x-a.x-dx*t,(p.y-a.y-dy*t)*1.5,p.z-a.z-dz*t);if(distance<best){best=distance;along=total+len*t;target=(Math.hypot(p.x-b.x,p.y-b.y,p.z-b.z)<2&&i+1<points.length)?points[i+1]:b;}total+=len;}return{along,total,target};}
function setup(data){if(data.route?.length){const lengths=[0];for(let i=1;i<data.route.length;i++){const a=data.route[i-1],b=data.route[i];lengths.push(lengths[i-1]+Math.hypot(a.x-b.x,a.y-b.y,a.z-b.z));}data.nativeNavigation={lengths,legs:data.checkpoints.map((cp,i)=>data.route.slice(cp.routeIndex||0,(data.checkpoints[i+1]?.routeIndex??data.route.length-1)+1))};return;}const spec=layouts[data.baseName];if(!spec)return;const stages=[],aliases=new Map();for(const s of spec){const origin=data.checkpoints.find(p=>p.name===s.from)||data.spawn,next=data.checkpoints.find(p=>p.name===s.to),exits=s.gates?data.triggers.filter(t=>s.gates.includes(t.id)):s.to?[]:data.triggers.filter(t=>t.type==='end_zone'),gate=exits[0],goal=gate?{x:(gate.x0+gate.x1)/2,y:(gate.bottom+gate.top)/2,z:(gate.z0+gate.z1)/2}:next;if(!goal)continue;const index=stages.length,points=[origin,...(s.via||[]).map(([x,y,z])=>({x,y,z})),goal];stages.push({...goal,index,origin,finish:!s.to,trigger:gate?.id??null,points});for(const name of [s.from,...s.aliases||[]]){const cp=data.checkpoints.findIndex(p=>p.name===name);if(cp>=0)aliases.set(cp,index);}}data.guidance={stages,flow:[],models:[],active:-1};data.navigation={stages,aliases};}
function index(data,cp){return data.navigation?.aliases.get(cp)??cp;}
function points(data,cp){if(data.route?.length){return data.nativeNavigation.legs[cp]||data.nativeNavigation.legs[0];}return data.navigation?.stages[index(data,cp)]?.points;}
function target(data,p,cp){const list=points(data,cp);if(!list||list.length<3)return null;const q=projection(list,p),stage=data.guidance.stages[index(data,cp)];return q.target?Object.assign(data.navigationHint||(data.navigationHint={}),q.target,{index:index(data,cp),kind:'map-route',finish:!!stage?.finish&&q.target===list.at(-1)}):null;}
function progress(data,p,cp){if(data.route?.length){const part=points(data,cp),a=data.checkpoints[cp]?.routeIndex??0,lengths=data.nativeNavigation.lengths;return clamp((lengths[a]+projection(part,p).along)/Math.max(1,lengths.at(-1)),0,.985);}const stages=data.navigation?.stages;if(!stages?.length)return null;const at=index(data,cp);let before=0,total=0,local=0;for(const stage of stages){const graph=data.coursePolish?.paths.find(r=>r.stage===stage.index)?.points,list=graph?.length>2?[stage.origin,...graph,stage]:stage.points,q=projection(list,p),weight=Math.max(1,q.total);if(stage.index<at)before+=weight;if(stage.index===at)local=q.along;total+=weight;}return clamp((before+local)/Math.max(1,total),0,.985);}
scope.ElementalSurfNavigation={layouts,setup,index,target,progress};
})(typeof window!=='undefined'?window:globalThis);
