/* Party Run: reference-led gauntlets, FPS movement and deterministic 120Hz simulation. */
(function(g){'use strict';
const DT=1/120,G=24,JUMP=9.5,SPEED=7.5,R=.43,H=1.8,COURSE_VERSION=14,ROUND_COUNT=9;
const themes=[{phase:1,color:0x59bea2,sky:0xa8dce6},{phase:5,color:0x9ac8df,sky:0x7f9fbc},{phase:2,color:0x8baceb,sky:0xc3e4f6},{phase:0,color:0x54b5cf,sky:0x152b46},{phase:3,color:0xe7995c,sky:0x4b2940},{phase:4,color:0x58c5b4,sky:0x8dccdc}];
function difficulty(level){return{factor:(level-1)/5,coyote:.12,crumbleDelay:1.4};}
const layouts=[
 ['sweeper-field','triple-propellers','central-shortcut-or-side-discs','final-windmill'],
 ['snowball-slalom','boxing-gauntlet','wind-and-bounce','punch-stairs','flipper-finish'],
 ['twin-fans','large-and-side-fans','three-to-two-fans','sweeper-fans'],
 ['speed-start','high-beam-low-bumpers','boost-belt','jump-rope-sprint','spring-finish'],
 ['axe-bridge','roller-crossing','pendulum-causeway','timed-drawbridges'],
 ['three-drum-steps','water-drum-crossing','moving-drum-stacks','giant-lilies','high-low-finale']
];
// Stable authored playlist, not a per-session shuffle: progress and PBs stay meaningful.
const roundOrder=[1,6,2,3,9,4,8,5,7];
function round(level=1){level=Math.max(1,Math.min(ROUND_COUNT,level|0));const data=course(roundOrder[level-1]);data.sourceLevel=data.level;data.level=level;return data;}
// Original engine-scale recreations of the documented round FLOW, not imported
// Fall Guys models or claims of pixel/coordinate-identical proprietary levels.
function course(level=1){
 level=Math.max(1,Math.min(ROUND_COUNT,level|0));
 if(level>6)return arena(level);
 const platforms=[],hazards=[],checkpoints=[],route=[],tuning=difficulty(level);
 const add=(x,y,z,w,d,extra={})=>{const p={id:platforms.length,x,y,z,w,d,h:1,baseX:x,baseY:y,baseZ:z,yaw:0,previousYaw:0,active:true,dx:0,dy:0,dz:0,...extra};platforms.push(p);if(!extra.branch&&!extra.triggerOnly&&!extra.fanBlade)route.push(p.id);return p;};
 const deck=(x,z,w,d,y=3,extra={})=>add(x,y,z,w,d,extra);
 const cp=(x,z,y=3,w=18)=>{const i=checkpoints.length,p=deck(x,z,w,10,y,{checkpoint:i});checkpoints.push({x,y:y+.004,z,w,d:10,index:i,platform:p.id});return p;};
 const disc=(x,z,r=6,y=3,extra={})=>deck(x,z,r*2,r*2,y,{shape:'disc',...extra});
 const hz=(type,x,z,props={})=>{const h={id:hazards.length,type,x,z,y:4,phase:0,...props};hazards.push(h);return h;};
 const sweep=(x,z,len=10,y=3,rate=.9)=>hz('sweeper',x,z,{y:y+.65,length:len,thickness:.46,rate});
 const rotor=(x,z,r=4,y=3,rate=.85)=>hz('rotor',x,z,{y:y+r,radius:r,rate,blades:3,thickness:.5});
 const punch=(x,z,side,y=3,phase=0)=>hz('piston',x,z,{y:y+1,side,rate:1.2,phase});
 const pend=(x,z,y=3,phase=0)=>hz('pendulum',x,z,{y:y+6,length:5,radius:1.1,amplitude:1.05,rate:1.1,phase});
 const wind=(x,z,side,y=3)=>hz('wind',x,z,{y:y+1.2,side,strength:28,rate:1.1});
 const ball=(x,near,far,y=3,phase=0)=>hz('ball',x,(near+far)/2,{y:y+1.05,zStart:far,zEnd:near,radius:1.05,speed:6,phase});
 const boost=(x,z,y=3)=>hz('boost',x,z,{y:y+1.8,width:6,height:3.6});
 const drum=(x,z,y,r=3.8,extra={})=>disc(x,z,r,y,{type:'bounce',bounce:18,skin:'drum',...extra});
 const lane=(pts,w=10,extra={})=>{for(let k=0;k<pts.length-1;k++){const a=pts[k],b=pts[k+1],dx=b[0]-a[0],dz=b[1]-a[1],y=a[2]||3,n=Math.max(1,Math.ceil(Math.max(Math.abs(dx),Math.abs(dz))/12));for(let j=0;j<n;j++)deck(a[0]+dx*(j+.5)/n,a[1]+dz*(j+.5)/n,w,Math.max(6,Math.abs(dz)/n+.35),y,{routeYaw:Math.atan2(-dx,-dz),...extra});}};
 const fan=(x,z,r=7,y=3,rate=.28,extra={})=>{const hub=disc(x,z,4.6,y,{skin:'hub',...extra});for(let j=0;j<4;j++)deck(x,z,r-1,6.8,y,{type:'fan',fanHub:hub.id,fanBlade:true,centerX:x,centerZ:z,orbit:(r-1)/2,phase:j*Math.PI/2,rate,skin:'fan',...extra});};
 cp(0,0);
 if(level===1){
  lane([[0,0],[0,-46]],24);sweep(-6,-16,11,3,.65);sweep(6,-24,11,3,-.8);sweep(0,-35,13,3,.9);cp(0,-48);
  lane([[0,-48],[0,-91]],25);for(const x of [-8,0,8])rotor(x,-66,3.5,3,.8+(x?0:.25));
  rotor(0,-83,4.5,3,-.7);cp(0,-95);
  // Center is a fast, narrow propeller route. Both side disc chains are real alternatives.
  lane([[0,-95],[0,-146]],6,{branch:true});rotor(0,-119,3.4,3,2.3);
  for(const side of [-1,1])for(let j=0;j<4;j++){const x=side*(j===0||j===3?8:13),z=-105-j*11;disc(x,z,6,3,{branch:side>0});sweep(x,z,9,3,side*(.7+j*.09));}
  cp(0,-154);disc(0,-169,7);sweep(0,-169,12,3,-.9);disc(0,-185,7);rotor(0,-186,5,3,.55);cp(0,-202);
 }else if(level===2){
  lane([[0,0],[0,-47]],21);for(const [j,x]of [-9,-6,-3,0,3,6,9].entries())ball(x,-10,-43,3,j*.93);cp(0,-50);
  lane([[0,-50],[0,-93]],17);for(let j=0;j<5;j++)punch(j%2?5:-5,-58-j*7,j%2?1:-1,3,j*1.2);cp(0,-98);
  lane([[0,-98],[-12,-111],[-12,-133],[0,-145]],8);wind(-12,-121,-1);
  for(let j=0;j<4;j++)drum(10,-108-j*10,3,4,{branch:true});cp(0,-149);
  for(let j=0;j<6;j++){const y=3+j*.5;deck(j%2?2:-2,-158-j*7,13,6.2,y);punch(j%2?6:-6,-158-j*7,j%2?1:-1,y,j*1.3);}
  cp(0,-202,5.5);lane([[0,-202,5.5],[0,-224,5.5]],17);
  drum(-5,-233,5.5,4.5);drum(5,-233,5.5,4.5,{branch:true});cp(0,-244,7);
 }else if(level===3){
  // Big Fans grammar: pair -> large hub, large+side, three->two, armed finale.
  fan(0,-15,8);fan(-6,-30,8,3,-.25);fan(6,-30,8,3,.25,{branch:true});fan(0,-45,9);cp(0,-58);
  fan(0,-73,10,3,-.25);fan(-11,-89,8);fan(11,-89,8,3,-.28,{branch:true});fan(0,-104,9);cp(0,-118);
  fan(-8,-133,8);fan(8,-133,8,3,-.28,{branch:true});fan(-8,-148,8,3,-.28);fan(8,-148,8,3,.28,{branch:true});fan(0,-163,9);sweep(0,-163,12,3,.8);cp(0,-177);
  fan(-6,-192,8);fan(6,-192,8,3,-.28,{branch:true});fan(0,-207,9,3,-.24);sweep(0,-207,13);cp(0,-222);
 }else if(level===4){
  lane([[0,0],[0,-31]],20,{type:'conveyor',flowZ:-1.8});boost(0,-14);cp(0,-37);
  // Lower wide route remains accessible at base speed; elevated beam rewards momentum.
  lane([[0,-37],[-12,-50],[-12,-89],[0,-105]],10);for(let j=0;j<4;j++)punch(-8,-54-j*10,1,3,j);
  drum(5,-47,3,3.8,{branch:true});for(let j=0;j<5;j++)deck(6+Math.sin(j*1.1)*3,-54-j*10,4.5,8,5.5,{branch:true});boost(7,-71,5.5);cp(0,-110);
  lane([[0,-110],[9,-133],[0,-154]],12,{type:'conveyor',flowZ:1.3});boost(5,-123);boost(6,-143);cp(0,-160);
  lane([[0,-160],[0,-207]],19);for(let j=0;j<4;j++)sweep(j%2?4:-4,-170-j*10,12,3,j%2?1.2:-1.1);boost(0,-201);cp(0,-215);
  drum(0,-226,3,5);deck(0,-240,10,12,5);cp(0,-253,5);
 }else if(level===5){
  lane([[0,0],[0,-40]],16);pend(0,-13,3,.3);pend(0,-27,3,2.1);cp(0,-45);
  // Three narrow turning roller causeways, parallel choice, then the main swinging-log hall.
  for(const x of [-9,0,9]){lane([[x,-48],[x,-90]],5.5,{branch:x!==0,skin:'roller'});for(let j=0;j<3;j++)sweep(x,-57-j*13,5.2,3,(j%2?1:-1)*1.1);}cp(0,-97);
  lane([[0,-97],[0,-143]],22);pend(-3,-111,3,.2);pend(3,-129,3,2);cp(0,-149);
  // Retracting bridges use exact same active shape for rendering and collision.
  for(let j=0;j<5;j++)deck(j%2?4:-4,-159-j*10,11,8,3,{type:'lift',amplitude:.65,rate:.75,phase:j*.8,skin:'bridge'});
  cp(0,-211);
 }else{
  // Lily Leapers: stepped drums, water crossing, moving drums, giant pads, three-way final.
  for(let j=0;j<3;j++)drum(0,-12-j*10,3+j*.8,4.7);cp(0,-45,4.6);
  for(let j=0;j<4;j++)drum(j%2?4:-4,-56-j*10,4.6+(j%2)*.6,4.5);cp(0,-99,4.6);
  for(let j=0;j<4;j++)drum(j%2?3:-3,-111-j*11,4.6+j*.8,4.3,{motion:'sway',amplitude:1.4,rate:.7,phase:j*1.2});cp(0,-156,7);
  for(let j=0;j<4;j++)drum(j%2?3:-3,-167-j*12,7,5.3);cp(0,-212,7);
  for(const side of [-1,1])for(let j=0;j<4;j++)drum(side*(j===0||j===3?6:10),-226-j*9.5,7+j*.4,4.8,{branch:side>0});
  for(let j=0;j<3;j++)drum(j%2?3:-3,-225-j*13,8+j*1.1,3.2,{branch:true});
  cp(0,-267,8.2);
 }
 // Second act: authored escalation, not stretched gaps or copies of the first act.
 // Old finish catches become mid-course checkpoints; only the last catch is finish.
 if(level===1){
  lane([[0,-202],[-10,-225],[-10,-252],[8,-278],[0,-290]],18);
  sweep(-8,-230,15,3,1.2);punch(-5,-250,1,3,.6);sweep(5,-275,17,3,-1.3);cp(0,-296);
  for(let j=0;j<6;j++){const x=j%2?4:-4;deck(x,-308-j*11.5,12,8);if(j%2)hz('hurdle',x,-308-j*11.5,{y:3.5,width:8,height:.5});}cp(0,-378);
  lane([[0,-378],[0,-438]],23);for(const x of [-7,7])rotor(x,-402,4,3,x>0?1.45:-1.35);sweep(0,-423,20,3,1.25);cp(0,-446);
 }else if(level===2){
  for(let j=0;j<5;j++)deck(j%2?4:-4,-258-j*10,14,8,7,{type:'lift',amplitude:.55,rate:.8,phase:j*.9});cp(0,-312,7);
  lane([[0,-312],[-10,-330],[-10,-354],[0,-369]],18);for(const p of platforms)if(p.baseZ< -312&&p.baseZ> -370&&p.baseY===3)p.y=p.baseY=7;
  ball(-8,-322,-354,7,0);ball(0,-332,-365,7,1.3);wind(-10,-346,-1,7);cp(0,-378,7);
  for(let j=0;j<7;j++){const y=7+j*.35;deck(j%2?3:-3,-390-j*7,14,6.3,y);punch(j%2?6:-6,-390-j*7,j%2?1:-1,y,j*.8);}cp(0,-442,9.1);
  drum(-2,-454,9.1,5,{bounce:20.5});drum(2,-465,9.1,5,{bounce:20.5});cp(0,-476,9.1);
 }else if(level===3){
  fan(0,-237,10,3,-.22);fan(-7,-253,9,3,.25);fan(7,-253,9,3,-.25,{branch:true});fan(0,-269,10,3,-.23);cp(0,-284);
  for(let j=0;j<4;j++)deck(j%2?4:-4,-299-j*14,14,10,3,{type:'mover',amplitude:1.4,rate:.5,phase:j*.8});cp(0,-354);
  fan(-4,-370,10);fan(4,-370,10,3,-.24,{branch:true});fan(0,-386,10,3,-.23);sweep(0,-386,15,3,.9);fan(0,-402,10);cp(0,-418);
 }else if(level===4){
  lane([[0,-253,5],[-10,-275,5],[-10,-300,5],[0,-320,5]],18,{type:'conveyor',flowZ:-1.4});boost(-10,-289,5);rotor(-10,-304,4,5,1.3);cp(0,-328,5);
  for(let j=0;j<6;j++){deck(j%2?3:-3,-340-j*11,13,8,5+j*.3);if(j%2)punch(6,-340-j*11,1,5+j*.3,j);}cp(0,-408,6.5);
  lane([[0,-408,6.5],[0,-478,6.5]],20,{type:'conveyor',flowZ:-2});boost(0,-427,6.5);boost(0,-455,6.5);for(let j=0;j<4;j++)sweep(j%2?4:-4,-434-j*11,17,6.5,j%2?1.4:-1.3);cp(0,-486,6.5);
 }else if(level===5){
  lane([[0,-211],[0,-269]],19);for(let j=0;j<4;j++)pend(j%2?3:-3,-222-j*13,3,j*1.1);cp(0,-278);
  for(let j=0;j<6;j++)deck(j%2?4:-4,-291-j*12.5,13,8,3);cp(0,-364);
  for(let j=0;j<5;j++){deck(j%2?4:-4,-376-j*11,14,9,3,{type:'lift',amplitude:.6,rate:.85,phase:j*.7});if(j%2)punch(7,-376-j*11,1,3,j);}cp(0,-433);
  lane([[0,-433],[0,-490]],23);rotor(-6,-460,4,3,1.3);rotor(6,-476,4,3,-1.3);cp(0,-498);
 }else{
  for(let j=0;j<6;j++)drum(j%2?3:-3,-280-j*11,8.2+j*.16,5.4,{bounce:20.5});cp(0,-346,9);
  for(let j=0;j<5;j++)drum(j%2?3:-3,-359-j*11,9+j*.25,5.4,{motion:'sway',amplitude:.8,rate:.7,phase:j*.7,bounce:20.5});cp(0,-414,10);
  for(let j=0;j<5;j++)drum(j%2?3:-3,-427-j*11,10+j*.3,5.4,{bounce:20.5});cp(0,-482,11.2);
  for(let j=0;j<5;j++)drum(j%2?3:-3,-495-j*11,11.2,5.4,{bounce:20.5});cp(0,-550,11.2);
 }
 // Authored obstacle remixes: staggered timing leaves readable escape windows.
 // These are original low-poly machines, not imported proprietary assets.
 const hammer=(x,z,y=3,phase=0)=>hz('hammer',x,z,{y:y+1.15,length:3.8,radius:1.1,rate:1.5,phase});
 const bumper=(x,z,y=3,phase=0)=>hz('bumper',x,z,{y:y+1,radius:1,amplitude:3,rate:1.35,phase});
 const roller=(x,z,y=3,phase=0)=>hz('roller',x,z,{y:y+.7,width:7,radius:.7,rate:2.6,phase});
 const flipper=(x,z,y=3,phase=0)=>hz('flipper',x,z,{y:y+.15,width:3.2,depth:3.4,period:3.2,phase});
 const log=(x,z,y=3,phase=0,width=7)=>hz('swingLog',x,z,{y:y+5,length:4,width,radius:.65,amplitude:.8,rate:.95,phase});
 const shutter=(x,z,y=3,phase=0,width=7)=>hz('shutter',x,z,{y:y+1.75,width,height:3.5,rate:1.2,phase});
 const popper=(x,z,y=3,phase=0)=>hz('popper',x,z,{y:y+.2,radius:1.35,period:3.4,phase});
 if(level===1){hammer(-6,-51);bumper(5,-76);roller(-10,-243);flipper(-5,-395,3,.8);flipper(5,-395,3,2.4);}
 if(level===2){bumper(0,-76,3,.6);hammer(-8,-179,4.5,.8);flipper(0,-218,5.5,1.3);ball(-4,-322,-354,7,.7);ball(4,-332,-365,7,2.1);roller(0,-416,8.4);}
 if(level===3){bumper(0,-73);wind(0,-111,1);hammer(-8.5,-148,3,.7);bumper(0,-269,3,1.4);}
 if(level===4){roller(0,-24);hammer(-12,-76,3,.7);bumper(6,-140);flipper(-4,-185,3,.4);flipper(4,-185,3,2);roller(0,-467,6.5);}
 if(level===5){hammer(-6,-31);roller(0,-76);bumper(4,-134,3,1.2);hz('gate',0,-245,{y:4.4,side:-1,width:4,height:2.8,rate:1.2});hz('gate',0,-253,{y:4.4,side:1,width:4,height:2.8,rate:1.2,phase:Math.PI});flipper(-4,-411,3,.2);flipper(4,-411,3,1.8);}
 if(level===6){bumper(5,-53,4.6);hammer(6,-173,7);wind(0,-205,-1,7);flipper(5,-350,9,.7);bumper(4,-420,10,.9);}
 // Third acts are new authored spaces, not a scaled replay of the first half.
 // Use the former finish as a normal checkpoint; preserve all landing heights.
 const tail=checkpoints.at(-1),endZ=tail.z,y=platforms[tail.platform].baseY;
 const tailLane=(pts,w,extra)=>lane(pts.map(p=>[p[0],p[1],p[2]??y]),w,extra);
 if(level===1){
  tailLane([[0,endZ],[0,endZ-50]],18);log(-4,endZ-17,y,.4);log(4,endZ-37,y,2.1);cp(0,endZ-56,y);
  tailLane([[0,endZ-56],[8,endZ-76],[8,endZ-108],[0,endZ-130]],14);shutter(8,endZ-91,y,.7);bumper(3,endZ-119,y,1.2);cp(0,endZ-136,y);
  tailLane([[0,endZ-136],[0,endZ-194]],20);for(const [i,x]of [-6,0,6].entries())popper(x,endZ-154-i*8,y,i*1.05);roller(0,endZ-182,y);boost(0,endZ-190,y);cp(0,endZ-202,y);
 }else if(level===2){
  tailLane([[0,endZ],[-7,endZ-24],[-7,endZ-56],[0,endZ-70]],16);ball(-10,endZ-24,endZ-54,y,.4);ball(-4,endZ-24,endZ-54,y,2.2);shutter(-7,endZ-42,y,1.1);cp(0,endZ-76,y);
  for(let j=0;j<6;j++){const x=j%2?3:-3,sy=y+j*.2;deck(x,endZ-88-j*10,12,8,sy);if(j%2)popper(x+2,endZ-88-j*10,sy,j*.6);}cp(0,endZ-152,y+1);
  tailLane([[0,endZ-152,y+1],[0,endZ-210,y+1]],18);log(-4,endZ-172,y+1,.4);shutter(4,endZ-194,y+1,2.4);boost(0,endZ-205,y+1);cp(0,endZ-218,y+1);
 }else if(level===3){
  fan(0,endZ-15,9,y,-.28);fan(0,endZ-31,9,y,.25);fan(0,endZ-47,9,y,-.27);cp(0,endZ-62,y);
  tailLane([[0,endZ-62],[-8,endZ-82],[-8,endZ-106],[0,endZ-126]],10);log(-8,endZ-95,y,1.3,6);cp(0,endZ-132,y);
  fan(-7,endZ-148,9,y,.28);fan(7,endZ-148,9,y,-.28,{branch:true});fan(0,endZ-164,9,y,-.3);shutter(0,endZ-180,y,1.8,5);deck(0,endZ-182,12,16,y);cp(0,endZ-196,y);
 }else if(level===4){
  tailLane([[0,endZ,y],[-10,endZ-25,y],[-10,endZ-58,y],[0,endZ-76,y]],16,{type:'conveyor',flowZ:-1.6});shutter(-10,endZ-44,y,.5);boost(-10,endZ-57,y);cp(0,endZ-82,y);
  tailLane([[0,endZ-82,y],[10,endZ-104,y],[10,endZ-129,y],[0,endZ-148,y]],14);log(10,endZ-117,y,1.2);popper(4,endZ-142,y,.9);cp(0,endZ-154,y);
  tailLane([[0,endZ-154,y],[0,endZ-218,y]],18,{type:'conveyor',flowZ:-1.5});for(let j=0;j<3;j++){shutter(j%2?4:-4,endZ-168-j*18,y,j*1.5,6);boost(0,endZ-176-j*18,y);}cp(0,endZ-228,y);
 }else if(level===5){
  tailLane([[0,endZ],[0,endZ-54]],16);log(-3,endZ-17,y,.2,8);log(3,endZ-38,y,1.9,8);cp(0,endZ-62,y);
  for(let j=0;j<6;j++)deck(j%2?4:-4,endZ-76-j*12,11,8,y,{type:'lift',amplitude:.5,rate:.9,phase:j*.8});cp(0,endZ-150,y);
  tailLane([[0,endZ-150],[0,endZ-212]],20);for(let j=0;j<3;j++){popper(j%2?5:-5,endZ-166-j*15,y,j*.9);shutter(j%2?-4:4,endZ-173-j*15,y,j*1.8,6);}boost(0,endZ-208,y);cp(0,endZ-220,y);
 }else{
  for(let j=0;j<5;j++)drum(j%2?3:-3,endZ-13-j*11,y,5.2,{bounce:20.5});cp(0,endZ-68,y);
  tailLane([[0,endZ-68,y],[-8,endZ-89,y],[-8,endZ-112,y],[0,endZ-131,y]],12);log(-8,endZ-99,y,.3,6);shutter(-4,endZ-122,y,2,5);cp(0,endZ-138,y);
  for(let j=0;j<4;j++)drum(j%2?3:-3,endZ-151-j*11,y+j*.2,5.2,{bounce:20.5});cp(0,endZ-196,y+.6);
 }
 // Non-intersecting rotating assemblies. Paired hubs get their own lanes;
 // circumscribed blade radius fits half the closest hub separation.
 const hubs=platforms.filter(o=>o.skin==='hub');
 for(let i=0;i<hubs.length;i++)for(let j=i+1;j<hubs.length;j++)if(Math.abs(hubs[i].z-hubs[j].z)<.01&&Math.abs(hubs[i].x-hubs[j].x)<17){const mid=(hubs[i].x+hubs[j].x)/2;hubs[i].x=hubs[i].baseX=mid-8.5;hubs[j].x=hubs[j].baseX=mid+8.5;}
 for(const hub of hubs){let radius=Infinity;for(const peer of hubs)if(peer!==hub)radius=Math.min(radius,Math.hypot(hub.x-peer.x,hub.z-peer.z)/2-.08);for(const blade of platforms)if(blade.fanHub===hub.id){blade.centerX=hub.x;blade.centerZ=hub.z;blade.w=Math.min(blade.w,Math.floor(Math.sqrt(Math.max(20.25,radius*radius-blade.d*blade.d/4))*4)/4);blade.orbit=blade.w/2;}}
 // Preserve authored narrow links and open edges. The former blanket width
 // multiplier filled the intended gaps and made edge knock-offs meaningless.
 for(const p of platforms)if(p.checkpoint!==undefined)p.w=Math.max(18,p.w);
 // Lift the complete race consistently, including all collider/trigger origins.
 // The biome floor below remains decorative; it is never an invisible catch.
 const elevation=10;
 for(const p of platforms){p.y+=elevation;p.baseY+=elevation;}
 for(const h of hazards)h.y+=elevation;
 for(const p of checkpoints)p.y+=elevation;
 for(const p of checkpoints)p.w=platforms[p.platform].w;
 let length=0;for(let i=0;i<checkpoints.length;i++){const a=checkpoints[i];if(i)length+=Math.hypot(a.x-checkpoints[i-1].x,a.z-checkpoints[i-1].z);a.distance=length;}
 const names=['Rotor Grove','Frostworks','Cloud Cross','Circuit Break','Forge Falls','Tidal Springs'];
 const references=['The Whirlygig','Tundra Run','Big Fans','Track Attack','Knight Fever','Lily Leapers'];
 if(level===6){
  // One readable, forgiving route. Former optional center/side routes occupied
  // the same drum volumes after the previous global X-position override.
  const kept=platforms.filter(p=>!p.branch),ids=new Map(kept.map((p,i)=>[p.id,i]));platforms.splice(0,platforms.length,...kept);for(const p of platforms)p.id=ids.get(p.id);for(const cp of checkpoints)cp.platform=ids.get(cp.platform);route.splice(0,route.length,...route.map(id=>ids.get(id)).filter(id=>id!==undefined));
  let i=0;const pattern=[-2.6,2.6,-3.1,2.9];for(const p of platforms)if(p.type==='bounce'){p.x=p.baseX=pattern[i++%pattern.length];const radius=Math.min(p.w/2,4.3);p.w=p.d=radius*2;if(p.motion)p.amplitude=Math.min(p.amplitude,.45);
   for(const cp of checkpoints)if(Math.abs(p.x-cp.x)<cp.w/2+radius){const distance=Math.abs(p.z-cp.z),required=cp.d/2+radius+.65;if(distance<required)p.z=p.baseZ=cp.z+Math.sign(p.z-cp.z||1)*required;}
  }
 }
 challengeLayout(platforms,hazards,checkpoints,level);separateMachines(platforms,hazards,checkpoints);const barriers=[],rails=guardrails(platforms),extension=endZ-checkpoints.at(-1).z;
 return{version:COURSE_VERSION,level,kind:'race',introDuration:2.8,chaseLead:[108,128,102,134,124,138][level-1]+Math.min(25,extension*.1),chaseSpeed:[7.2,7,5.6,8.4,7,6.6][level-1],fallY:9,nameKey:'partyMap'+level,name:names[level-1],reference:references[level-1],difficulty:tuning,theme:themes[level-1],platforms,hazards,barriers,rails,checkpoints,route:[...new Set(route)].sort((a,b)=>platforms[b].baseZ-platforms[a].baseZ),order:layouts[level-1].concat(['pressure-chicane','precision-crossing','tsunami-finale','log-weave','timing-machines','offset-baffle-slalom','extended-finale']),finish:checkpoints.at(-1),length,depth:-checkpoints.at(-1).z,bounds:{x:58,minZ:checkpoints.at(-1).z-18,maxZ:15}};
}
// Mount machines at the actual supporting surface and constrain their travel.
// Route difficulty now comes from timing/edges, not the removed white walls.
function challengeLayout(platforms,hazards,checkpoints,level){
 const barriers=[];
 const offsets={sweeper:.65,rotor:0,piston:1,pendulum:6,wind:1.2,ball:1.05,boost:1.8,hurdle:.5,hammer:1.15,bumper:1,roller:.7,flipper:.15,swingLog:5,shutter:1.75,popper:.2,gate:1.4};
 for(const h of hazards){
  const ground=h.y-(h.type==='rotor'?h.radius:offsets[h.type]||0);let host=null,score=Infinity;
  for(const p of platforms){if(Math.abs(p.baseZ-h.z)>p.d/2+1)continue;const s=Math.abs(p.baseY-ground)*8+Math.max(0,Math.abs(h.x-p.baseX)-p.w/2)*2+Math.abs(h.z-p.baseZ)*.03;if(s<score){score=s;host=p;}}
  if(!host||Math.abs(host.baseY-ground)>1.2)continue;
  h.host=host.id;
  if(h.type==='rotor')h.y=host.baseY+h.radius+.42;
  if(h.type==='piston'){h.x=host.baseX+h.side*(host.w/2-.8);h.stroke=Math.min(10,Math.max(2.2,host.w-2.4));h.y=host.baseY+1.06;}
  if(h.type==='pendulum'){h.y=Math.max(h.y,host.baseY+h.length+h.radius+.08);h.frameHalf=Math.max(8.2,host.w/2+.8);}
  if(h.type==='roller')h.y=host.baseY+h.radius+.04;
  if(h.type==='shutter'){h.x=host.baseX;h.width=Math.max(5,host.w+.6);}
  if(h.type==='swingLog'){
   h.frameHalf=Math.max(h.width/2+3.4,host.w/2+.8);
   const half=host.w/2-h.width/2-.28;if(Math.min(h.x-(host.baseX-host.w/2),host.baseX+host.w/2-h.x)-h.width/2<2)h.x=host.baseX;
   h.amplitude=Math.min(h.amplitude,Math.asin(Math.min(.99,Math.max(.15,half)/h.length)));
  }
  if(host.type==='lift'||host.type==='mover'||host.motion){h.attached=true;h.anchor=host.id;h.baseX=h.x;h.baseY=h.y;h.baseZ=h.z;}
 }
 return barriers; // White slalom walls removed, including their collision.
}
// Reserve the COMPLETE swept machine envelope, not just its spawn pose. This
// is a deterministic authoring pass, never a per-frame hide/teleport workaround.
function machineEnvelope(h){
 let x0=h.x,x1=h.x,z0=h.z,z1=h.z,y0=h.y-1,y1=h.y+2;
 const expand=(x,z)=>{x0-=x;x1+=x;z0-=z;z1+=z;};
 if(h.type==='sweeper'){expand(h.length/2+.65,h.length/2+.65);y0=h.y-h.thickness;y1=h.y+h.thickness;}
 else if(h.type==='rotor'){expand(h.radius+.8,.85);y0=h.y-h.radius-.2;y1=h.y+h.radius+.8;}
 else if(h.type==='hammer'){expand(h.length+1.5,h.length+1.5);y0=h.y-h.radius;y1=h.y+h.radius;}
 else if(h.type==='pendulum'){expand(Math.max(h.frameHalf||8.2,Math.sin(h.amplitude)*h.length+h.radius),1.25);y0=h.y-h.length-h.radius;y1=h.y+.5;}
 else if(h.type==='swingLog'){expand(Math.max(h.frameHalf||h.width/2+4,Math.sin(h.amplitude)*h.length+h.width/2),1.3);y0=h.y-h.length-h.radius;y1=h.y+.5;}
 else if(h.type==='piston'){const a=-h.side*(h.stroke||4.8),b=h.side*4.8;x0=h.x+Math.min(a,b)-1.3;x1=h.x+Math.max(a,b)+1.3;z0-=1.4;z1+=1.4;}
 else if(h.type==='bumper')expand(h.amplitude+h.radius+.5,h.radius+.5);
 else if(h.type==='ball'){expand(h.radius+.35,h.radius+.5);z0=Math.min(h.zStart,h.zEnd)-h.radius-1.5;z1=Math.max(h.zStart,h.zEnd)+h.radius+1.5;}
 else if(h.type==='shutter'){expand(h.width/2+1,.9);y0=h.y-h.height/2;y1=h.y+6;}
 else if(h.type==='roller'||h.type==='hurdle')expand(h.width/2+.8,(h.radius||.4)+.4);
 else if(h.type==='gate')expand(8.7,.9);
 else if(h.type==='wind'){x0=h.x+h.side*5.4-1.5;x1=x0+3;z0-=1.5;z1+=1.5;}
 else if(h.type==='flipper')expand(h.width/2+.5,h.depth/2+.5);
 else if(h.type==='popper')expand(h.radius+.5,h.radius+.5);
 else if(h.type==='boost')return null;
 return{x0,x1,z0,z1,y0,y1};
}
function separateMachines(platforms,hazards,checkpoints){
 const accepted=[],boxes=[],overlap=(a,b)=>a&&b&&Math.min(a.x1,b.x1)-Math.max(a.x0,b.x0)>.01&&Math.min(a.z1,b.z1)-Math.max(a.z0,b.z0)>-.45&&Math.min(a.y1,b.y1)-Math.max(a.y0,b.y0)>.08;
 for(const h of hazards){
  const original={x:h.x,y:h.y,z:h.z,zStart:h.zStart,zEnd:h.zEnd},base=machineEnvelope(h);let box=base,found=!boxes.some(b=>overlap(box,b));
  if(!found&&h.type!=='ball')for(let distance=2;distance<=36&&!found;distance+=2)for(const sign of [-1,1]){
   const z=original.z+distance*sign;if(checkpoints.some(cp=>Math.abs(cp.z-z)<7))continue;
   const ground=platforms[h.host]?.baseY??original.y-({popper:.2,sweeper:.65,shutter:1.75}[h.type]||1);
   const host=platforms.filter(p=>!p.branch&&!p.motion&&!['fan','lift','mover','bounce'].includes(p.type)&&Math.abs(p.baseY-ground)<.3&&contains(p,original.x,z,-.1)).sort((a,b)=>Math.abs(a.baseZ-z)-Math.abs(b.baseZ-z))[0];
   if(!host)continue;h.z=z;box=machineEnvelope(h);if(boxes.some(b=>overlap(box,b)))continue;h.host=host.id;h.attached=false;h.layoutMoved=z-original.z;found=true;break;
  }
  if(!found){Object.assign(h,original);h.layoutRejected=true;continue;}
  if(h.attached){h.baseX=h.x;h.baseY=h.y;h.baseZ=h.z;}h.id=accepted.length;accepted.push(h);boxes.push(box);
 }
 hazards.splice(0,hazards.length,...accepted);
 // Embedded pads are surface inlays, not a second full platform shell.
 for(const p of platforms)if(p.type==='bounce')p.triggerOnly=platforms.some(q=>q!==p&&Math.abs(q.baseY-p.baseY)<.02&&(!q.type||q.checkpoint!==undefined)&&contains(q,p.x,p.z,-p.w/2-.08));
}
// Side-only exposed perimeter: shared internal seams are subtracted, while
// forward/back jump exits stay open. Never cage drums, moving fans or crumble.
function guardrails(platforms){
 const fixed=platforms.filter(p=>p.shape!=='disc'&&!p.motion&&(!p.type||p.type==='conveyor')),edges=[];
 for(const p of fixed)for(const side of [-1,1]){
  const x=p.x+side*(p.w/2-.09);let spans=[[p.z-p.d/2,p.z+p.d/2]];
  for(const q of platforms){
   if(q===p||q.type==='fan'||q.motion||q.type==='lift'||q.type==='mover'||Math.abs(q.y-p.y)>.4)continue;
   let half=q.d/2;if(q.shape==='disc'){const dx=x-q.x;if(Math.abs(dx)>=q.w/2)continue;half=Math.sqrt((q.w/2)**2-dx*dx);}else if(x<q.x-q.w/2-.01||x>q.x+q.w/2+.01)continue;
   const lo=q.z-half-.12,hi=q.z+half+.12,next=[];for(const [a,b]of spans){if(hi<=a||lo>=b)next.push([a,b]);else{if(lo>a)next.push([a,lo]);if(hi<b)next.push([hi,b]);}}spans=next;if(!spans.length)break;
  }
  for(const [a,b]of spans)if(b-a>.65)edges.push({id:-1,rail:true,owner:p.id,x,y:p.y+1.12,z:(a+b)/2,w:.18,d:b-a,h:1.12,active:true});
 }
 for(const p of platforms)if(p.shape!=='disc'&&(p.type==='lift'||p.type==='mover'||p.motion))for(const side of [-1,1]){const localX=side*(p.w/2-.09);edges.push({id:p.id,rail:true,moving:true,owner:p.id,localX,x:p.x+localX,y:p.y+1.12,z:p.z,w:.18,d:p.d,h:1.12,active:true,dx:0,dy:0,dz:0});}
 // Protection only at the starting apron; all later routes are open-edged.
 return edges.filter(r=>!r.moving).map(r=>{const a=Math.max(-12,r.z-r.d/2),b=Math.min(5,r.z+r.d/2);return{...r,z:(a+b)/2,d:b-a};}).filter(r=>r.d>.65);
}
// Solo adaptations of survival / disappearing-floor / hunt, not multiplayer AI.
function arena(level){
 if(level===9)return spiritHunt();
 const platforms=[],hazards=[],collectibles=[],kind=level===7?'survival':level===8?'collapse':'hunt',duration=level===7?45:level===8?50:75;
 const add=(x,y,z,w,d,extra={})=>{const o={id:platforms.length,x,y,z,w,d,h:1,baseX:x,baseY:y,baseZ:z,yaw:0,previousYaw:0,active:true,dx:0,dy:0,dz:0,...extra};platforms.push(o);return o;};
 if(kind==='collapse'){
  for(let layer=0;layer<3;layer++)for(let x=-4;x<=4;x++)for(let z=-4;z<=4;z++)if(x*x+z*z<=22)add(x*3.6,11-layer*3.4,-24+z*3.6,3.55,3.55,{type:'crumble',touchAt:null,permanent:true,skin:'tile'});
 }else{
  if(kind==='survival'){
   for(let x=-5;x<=5;x++)for(let z=-5;z<=5;z++)if(Math.hypot(Math.abs(x*4.4)+2.2,Math.abs(z*4.4)+2.2)<=25)add(x*4.4,3,-24+z*4.4,4.38,4.38,{type:'crumble',touchAt:null,permanent:true,skin:'arenaTile'});
  }else add(0,3,-24,50,50,{shape:'disc',skin:'arena'});
  if(kind==='survival'){
   hazards.push({id:0,type:'sweeper',x:0,z:-24,y:3.65,phase:0,length:50,thickness:.39,rate:.55,acceleration:.012});
   hazards.push({id:1,type:'sweeper',x:0,z:-24,y:6.1,phase:1.5,length:50,thickness:.45,rate:-.35,acceleration:-.008});
  }else{
   for(let i=0;i<16;i++){const angle=i*Math.PI*2/16,r=i%2?17:10;collectibles.push({id:i,x:Math.cos(angle)*r,y:i%3===0?5.4:4.05,z:-24+Math.sin(angle)*r,collected:false});}
   for(const x of [-10,10]){add(x,3,-24,7,7,{shape:'disc',type:'bounce',bounce:12,skin:'drum'});hazards.push({id:hazards.length,type:'sweeper',x,z:-24,y:3.65,phase:x,length:12,thickness:.26,rate:x>0?.8:-.8});}
  }
 }
 const start={x:0,y:kind==='collapse'?11.004:3.004,z:-10,w:50,d:50,index:0,distance:0,platform:0};
 start.platform=platforms.find(p=>contains(p,start.x,start.z,0))?.id??0;
 return{version:COURSE_VERSION,level,kind,duration,target:12,nameKey:'partyMap'+level,name:['Orbit Survival','Crumble Basin','Spirit Hunt'][level-7],reference:['Jump Club','Hex-A-Gone','Bubble Trouble'][level-7],difficulty:{coyote:.12,crumbleDelay:kind==='survival'?1.15:.85},theme:themes[[0,4,5][level-7]],platforms,hazards,collectibles,rails:[],checkpoints:[start],route:[],order:[kind,kind==='survival'?'permanent-crumbling-floor':'arena'],finish:start,length:1,depth:65,bounds:{x:29,minZ:-52,maxZ:4}};
}
function spiritHunt(){
 const platforms=[],hazards=[],collectibles=[];
 const add=(x,y,z,w,d,extra={})=>{const o={id:platforms.length,x,y,z,w,d,h:1,baseX:x,baseY:y,baseZ:z,yaw:0,previousYaw:0,active:true,dx:0,dy:0,dz:0,...extra};platforms.push(o);return o;};
 const disc=(x,z,y,r,extra={})=>add(x,y,z,r*2,r*2,{shape:'disc',...extra});
 const hz=(type,x,z,y,props)=>hazards.push({id:hazards.length,type,x,z,y,phase:0,...props});
 const coin=(x,y,z)=>collectibles.push({id:collectibles.length,x,y,z,collected:false});
 disc(0,-28,3,10,{skin:'arena'});
 const nodes=[{x:0,z:-28,y:3},{x:-34,z:-18,y:3},{x:-34,z:-56,y:3},{x:0,z:-78,y:3},{x:34,z:-56,y:3},{x:34,z:-18,y:3},{x:0,z:16,y:3}];
 const leg=(a,b)=>{const n=Math.max(1,Math.ceil(Math.hypot(b.x-a.x,b.z-a.z)/7));for(let j=0;j<n;j++){const t=(j+.5)/n,x=a.x+(b.x-a.x)*t,z=a.z+(b.z-a.z)*t,y=a.y+(b.y-a.y)*t;add(x,y,z,a.x===b.x?5.5:Math.abs(b.x-a.x)/n-1.2,a.z===b.z?5.5:Math.abs(b.z-a.z)/n-1.2,{skin:'huntBridge'});}};
 const connect=(a,b)=>{if(a.x===b.x||a.z===b.z){leg(a,b);return;}const m={x:b.x,z:a.z,y:(a.y+b.y)/2};leg(a,m);disc(m.x,m.z,m.y,3.8,{skin:'huntCorner'});leg(m,b);};
 for(let i=1;i<nodes.length;i++){
  const n=nodes[i];disc(n.x,n.z,n.y,8.4,{skin:'huntIsland'});connect(n,nodes[i===6?1:i+1]);if(i%2===1)connect(nodes[0],n);
  disc(n.x+3,n.z+3,n.y+2,3.2,{skin:'huntUpper'});add(n.x+3,n.y+1,n.z+3,1.4,1.4,{skin:'huntSupport'});disc(n.x-3,n.z+2,n.y,2.6,{type:'bounce',bounce:13,skin:'drum'});
  coin(n.x-4,n.y+1.1,n.z-2.5);coin(n.x+4,n.y+1.1,n.z-2.5);coin(n.x+1.8,n.y+3.1,n.z+3);coin(n.x+4.2,n.y+3.1,n.z+3);
  hz('sweeper',n.x,n.z,n.y+.65,{length:14,thickness:.4,rate:(i%2?1:-1)*(.72+i*.04),phase:i});
  hz('popper',n.x+(i%2?-4:4),n.z+3,n.y+.2,{radius:1.35,period:3.4,phase:i*.67});
 }
 for(const [i,x]of [-5,0,5].entries())coin(x,4.1,-28);coin(0,5.5,-21);
 for(const [i,p]of platforms.filter(p=>p.skin==='huntBridge').filter((_,i)=>i%5===2).slice(0,8).entries())coin(p.x,p.y+1.1,p.z);
 const gates=[{x:-34,z:-37,y:3},{x:34,z:-37,y:3},{x:0,z:-57,y:3}];
 for(const [i,g]of gates.entries()){add(g.x,g.y,g.z,8,8,{skin:'huntGate'});hz('shutter',g.x,g.z,g.y+1.75,{width:8.6,height:3.5,rate:1.2,phase:i*1.9});}
 separateMachines(platforms,hazards,[]);
 const start={x:0,y:3.004,z:-20,w:20,d:20,index:0,distance:0,platform:0};
 return{version:COURSE_VERSION,level:9,kind:'hunt',duration:120,target:28,fallPenalty:6,nameKey:'partyMap9',name:'Spirit Hunt',reference:'Bubble Trouble / Stumble Guys route timing',difficulty:{coyote:.12,crumbleDelay:1.1},theme:themes[5],platforms,hazards,barriers:[],collectibles,rails:[],checkpoints:[start],route:[],order:['hub-and-six-islands','narrow-bridges','elevated-spirit-pads','timed-shutters'],finish:start,length:1,depth:112,bounds:{x:62,minZ:-104,maxZ:38}};
}
// All animation is pure worldTime math. No per-frame randomness or timers.
// Authored, learnable traps: no per-frame randomness or changes to Party routes.
function trollCourse(level=1){
 level=Math.max(1,Math.min(3,level|0));const platforms=[],checkpoints=[],route=[],safeRoute=[],modules=[];
 const add=(x,z,w=4,d=4,extra={})=>{const p={id:platforms.length,x,y:8,z,w,d,h:1.25,baseX:x,baseY:8,baseZ:z,yaw:0,previousYaw:0,active:true,dx:0,dy:0,dz:0,...extra};platforms.push(p);return p;};
 const cp=z=>{const p=add(0,z,16,8,{checkpoint:checkpoints.length});checkpoints.push({x:0,y:8.004,z,w:16,d:8,index:checkpoints.length,platform:p.id,distance:-z});safeRoute.push(p.id);};
 cp(0);
 const order=level===1?['fake_stones','invisible_wall','troll_bounce','gift_bricks']:level===2?['gift_bricks','crumble_steps','fake_stones','troll_bounce','invisible_wall']:['invisible_wall','troll_bounce','crumble_steps','gift_bricks','fake_stones','finale'];
 order.forEach((kind,stage)=>{const start=-stage*40,side=(stage+level)%2?1:-1;modules.push({kind,stage,start});
  const safe=(x,z,w,d,extra={})=>{const o=add(x,start-z,w,d,{stage,safeRoute:true,...extra});safeRoute.push(o.id);return o;};
  const trap=(x,z,w,d,type,extra={})=>add(x,start-z,w,d,{stage,trap:type,...extra});
  if(kind==='fake_stones'){
   safe(side*5,11,5,12);safe(side*5,27,5,14);
   for(let j=0;j<4;j++)trap(-side*2,9+j*7,5,5,j===2?'approachFake':'fake',{triggerAt:null});
  }else if(kind==='invisible_wall'){
   safe(0,10,14,9);safe(side*6,21,4,10);safe(0,31,14,9);
   trap(0,16,8,.45,'wall',{y:13,baseY:13,h:5,revealUntil:0});
   trap(-side*5.5,23,3,.45,'shoveWall',{y:12,baseY:12,h:4,revealUntil:0});
  }else if(kind==='troll_bounce'){
   safe(0,9,13,10);safe(side*5.5,20,4.5,12);safe(0,31,13,10);
   trap(-side*2,20,5,7,'reversePad');
  }else if(kind==='gift_bricks'){
   for(let j=0;j<4;j++){const x=[-2,2,-2,0][j]*side;safe(x,10+j*7,6,5);trap(x+side*2.1,10+j*7,1.3,1.6,'gift',{y:9.6,baseY:9.6,h:1.6});}
  }else if(kind==='crumble_steps'){
   for(let j=0;j<4;j++)safe(Math.sin(j*1.2)*2,10+j*7,5.5,5,{type:'crumble',touchAt:null,permanent:true});
   trap(-side*5,19,4.5,8,'fake');
  }else{
   safe(side*4,10,6,10);safe(0,22,8,8);safe(-side*4,32,6,6);
   trap(-side*4,10,5,10,'approachFake',{triggerAt:null});trap(side*6,31,1,1,'hiddenKill',{y:10,baseY:10,h:2});trap(side*3,22,1.4,1.4,'gift',{y:9.6,baseY:9.6,h:1.6});
  }
  cp(start-40);
 });
 const theme=themes[[0,1,3][level-1]];
 return{version:3,troll:true,level,kind:'race',name:'Troll Obby',nameKey:'trollObby',theme,difficulty:{coyote:.12,crumbleDelay:.8},platforms,hazards:[],rails:[],barriers:[],route,safeRoute,modules,checkpoints,finish:checkpoints.at(-1),length:order.length*40,depth:order.length*40,fallY:1,bounds:{x:20,minZ:-order.length*40-12,maxZ:10}};
}
function trollContact(p,o,data,top){
 if(!data.troll||!o.trap)return false;
 if(o.trap==='fake'&&top){o.consumed=true;o.active=false;o.revealed=true;p.grounded=false;p.support=-1;p.coyote=p.buffer=0;p.trapEvent='fake';return true;}
 if(o.trap==='gift'||o.trap==='hiddenKill'){p.dead=true;p.trapEvent=o.trap;o.revealed=true;return true;}
 if(o.trap==='shoveWall'){o.revealUntil=data.time+2;o.active=false;o.consumed=true;p.vy=-12;p.vx=0;p.vz=6;p.stun=.5;p.grounded=false;p.support=-1;p.buffer=p.coyote=0;p.trapEvent='shoveWall';return true;}
 if(o.trap==='wall'){o.revealUntil=data.time+2;p.trapEvent='wall';}
 if(o.trap==='reversePad'&&top&&p.bounceLock<=0){p.vx=0;p.vz=19;p.vy=7;p.bounceLock=.7;p.stun=.6;p.grounded=false;p.support=-1;p.buffer=p.coyote=0;p.bounced=true;p.trapEvent='reversePad';return true;}
 return false;
}
function pose(data,time){
 data.time=time;
 for(const o of data.platforms){
  const x=o.x,y=o.y,z=o.z;o.previousYaw=o.yaw||0;
  o.x=o.baseX+(o.type==='mover'||o.motion==='sway'?Math.sin(time*o.rate+o.phase)*o.amplitude:0);
  o.y=o.baseY+(o.type==='lift'?Math.sin(time*o.rate+o.phase)*o.amplitude:0);o.z=o.baseZ;
  if(o.type==='fan'){o.yaw=time*o.rate+o.phase;o.x=o.centerX+Math.cos(o.yaw)*o.orbit;o.z=o.centerZ-Math.sin(o.yaw)*o.orbit;}
  o.dx=o.x-x;o.dy=o.y-y;o.dz=o.z-z;
  const period=o.period||1,phase=((time+(o.phase||0))%period+period)%period;
  o.active=!o.consumed&&(o.type!=='tile'||phase<o.activeFor);o.warning=o.type==='tile'&&phase>o.activeFor-o.warningFor;o.drop=0;o.reforming=false;
  if(o.type==='crumble'&&o.touchAt!==null){const age=time-o.touchAt,delay=data.difficulty.crumbleDelay,regen=o.regrowAfter||3.6;if(age>=regen&&!o.permanent)o.touchAt=null;else{o.warning=true;o.active=!o.consumed&&age<delay;o.reforming=!o.permanent&&age>regen-.8;o.drop=o.reforming?(regen-age)*5:Math.max(0,age-delay)*3;}}
 }
 for(const rail of data.rails||[]){const owner=data.platforms[rail.owner];rail.active=!!owner?.active;if(rail.moving&&owner){rail.x=owner.x+rail.localX;rail.y=owner.y+1.12;rail.z=owner.z;rail.dx=owner.dx;rail.dy=owner.dy;rail.dz=owner.dz;}}
 for(const b of data.barriers||[])b.active=!!data.platforms[b.owner]?.active;
 for(const h of data.hazards){
  if(h.attached){const p=data.platforms[h.anchor];h.x=h.baseX+p.x-p.baseX;h.y=h.baseY+p.y-p.baseY;h.z=h.baseZ+p.z-p.baseZ;}
  h.angle=time*(h.rate||1)+.5*(h.acceleration||0)*time*time+h.phase;h.currentX=h.x;h.currentY=h.y;h.currentZ=h.z;
  if(h.type==='ball'){const span=Math.abs(h.zEnd-h.zStart),sign=Math.sign(h.zEnd-h.zStart)||1,t=span?((time*h.speed+h.phase*h.speed)%(span*2)+span*2)%(span*2):0;h.currentZ=h.zStart+sign*(t<span?t:span*2-t);h.velocityZ=sign*(t<span?1:-1)*h.speed;h.angle=(h.currentZ-h.zStart)/h.radius;}
  h.push=h.type==='piston'?Math.pow(Math.max(0,Math.sin(h.angle)),3)*(h.stroke||4.8):0;
  if(h.type==='gate'){h.open=.5+.5*Math.sin(h.angle);h.currentX=h.x+h.side*(2+4.5*h.open);h.warning=h.open<.3;}
  if(h.type==='pendulum'){const phase=h.angle;h.angle=Math.sin(phase)*h.amplitude;h.currentX=h.x+Math.sin(h.angle)*h.length;h.currentY=h.y-Math.cos(h.angle)*h.length;h.velocityX=Math.cos(h.angle)*Math.cos(phase)*h.amplitude*h.rate*h.length;h.warning=Math.abs(h.angle)<.35;}
  if(h.type==='wind'){h.gust=.42+.58*Math.pow(.5+.5*Math.sin(h.angle),2);h.warning=h.gust>.65;}
  if(h.type==='hammer'){h.currentX=h.x+Math.sin(h.angle)*h.length;h.currentZ=h.z+Math.cos(h.angle)*h.length;}
  if(h.type==='bumper'){h.currentX=h.x+Math.sin(h.angle)*h.amplitude;h.velocityX=Math.cos(h.angle)*h.rate*h.amplitude;}
  if(h.type==='flipper'){const t=((time+h.phase)%h.period+h.period)%h.period;h.warning=t>h.period-.65;h.strike=t<.24;h.flip=h.strike?Math.sin(t/.24*Math.PI)*1.15:0;}
  if(h.type==='swingLog'){const phase=h.angle;h.angle=Math.sin(phase)*h.amplitude;h.currentX=h.x+Math.sin(h.angle)*h.length;h.currentY=h.y-Math.cos(h.angle)*h.length;h.velocityX=Math.cos(h.angle)*Math.cos(phase)*h.amplitude*h.rate*h.length;}
  if(h.type==='shutter'){h.open=.5+.5*Math.sin(h.angle);h.lift=h.open*h.open*4;h.currentY=h.y+h.lift;h.warning=Math.cos(h.angle)<0&&h.open<.6;}
  if(h.type==='popper'){const t=((time+h.phase)%h.period+h.period)%h.period;h.warning=t>h.period-.65;h.strike=t<.4;h.rise=h.strike?Math.sin(t/.4*Math.PI)*1.8:0;h.currentY=h.y+h.rise;}
  if(h.type==='pulse'){const t=(time+h.phase)%h.period;h.lit=t<h.activeFor;h.warning=!h.lit&&t>h.period-h.warningFor;}
 }
}
function player(cp){return{x:cp.x,y:cp.y,z:cp.z,vx:0,vy:0,vz:0,grounded:false,support:-1,coyote:0,buffer:0,invulnerable:0,bounceLock:0,diveTimer:0,diveUsed:false,diveCooldown:0,tumble:0,stun:0,hitSlow:0,hits:0,speedScale:1,dead:false,airTime:0,landingAge:1,bhop:0,momentum:0,boostTime:0};}
function launchPad(p,o){p.vy=o.bounce||14;p.bounceLock=.3;p.buffer=p.coyote=0;p.grounded=false;p.support=-1;p.bounced=true;p.jumped=false;p.diveTimer=0;}
function impact(p,h,nx,nz){
 if(h.lethal){p.dead=true;return;}
 const incoming=Math.hypot(p.vx,p.vz);if(incoming>.3){nx=nx*.65-p.vx/incoming*.85;nz=nz*.65-p.vz/incoming*.85;}
 const len=Math.max(.01,Math.hypot(nx,nz));p.hit=true;p.hits=(p.hits||0)+1;
 const force=h.type==='hammer'?16:13.5;
 p.vx=nx/len*force;p.vz=nz/len*force;p.vy=h.type==='flipper'||h.type==='popper'?8.5:5.5;p.grounded=false;p.support=-1;
 p.invulnerable=1.25;p.stun=.9;p.tumble=1.1;p.hitSlow=2.2;p.buffer=p.coyote=p.boostTime=p.momentum=p.bhop=p.diveTimer=0;p.diveUsed=true;
}
// Exact round and rotated tops: no invisible square around a disc or static fan collider.
function contains(o,x,z,margin=R-.02){
 const dx=x-o.x,dz=z-o.z;if(o.shape==='disc')return dx*dx+dz*dz<=(o.w/2+margin)*(o.w/2+margin);
 const c=Math.cos(o.yaw||0),s=Math.sin(o.yaw||0);return Math.abs(c*dx-s*dz)<=o.w/2+margin&&Math.abs(s*dx+c*dz)<=o.d/2+margin;
}
const localPlayer={},localSolid={};
function surfaceSweep(p,dx,dy,dz,o){
 if(o.shape==='disc'){
  const top=o.y,bot=o.y-o.h-H;let best=null;
  if(Math.abs(dy)>1e-12){const sign=dy<0?1:-1,t=((dy<0?top:bot)-p.y)/dy;if(t>=0&&t<=1&&contains(o,p.x+dx*t,p.z+dz*t))best={t,axis:1,sign,o};}
  const x=p.x-o.x,z=p.z-o.z,rr=o.w/2+R,a=dx*dx+dz*dz,b=2*(x*dx+z*dz),c=x*x+z*z-rr*rr,disc=b*b-4*a*c;
  if(a>1e-12&&c>=0&&disc>=0){const t=(-b-Math.sqrt(disc))/(2*a),y=p.y+dy*t;if(t>=0&&t<=1&&y<top-.002&&y>bot&&(!best||t<best.t)){const nx=(x+dx*t)/rr,nz=(z+dz*t)/rr;best={t,axis:0,sign:1,nx,nz,o};}}
  return best;
 }
 if(!o.yaw)return sweep(p,dx,dy,dz,o);
 const c=Math.cos(o.yaw),s=Math.sin(o.yaw),x=p.x-o.x,z=p.z-o.z;
 localPlayer.x=c*x-s*z;localPlayer.y=p.y;localPlayer.z=s*x+c*z;
 localSolid.x=localSolid.z=0;localSolid.y=o.y;localSolid.w=o.w;localSolid.d=o.d;localSolid.h=o.h;
 const h=sweep(localPlayer,c*dx-s*dz,dy,s*dx+c*dz,localSolid);if(!h)return null;h.o=o;
 if(h.axis!==1){h.nx=(h.axis===0?c:s)*h.sign;h.nz=(h.axis===0?-s:c)*h.sign;}return h;
}
function sweep(p,dx,dy,dz,o){
 let enter=-Infinity,exit=Infinity,axis=-1,sign=0;
 for(let i=0;i<3;i++){
  const a=i===0?p.x:i===1?p.y:p.z,d=i===0?dx:i===1?dy:dz;
  const lo=i===0?o.x-o.w/2-R:i===1?o.y-o.h-H:o.z-o.d/2-R,hi=i===0?o.x+o.w/2+R:i===1?o.y:o.z+o.d/2+R;
  if(Math.abs(d)<1e-10){if(a<lo||a>hi)return null;continue;}
  let l=(lo-a)/d,r=(hi-a)/d,s=-Math.sign(d);if(l>r){const swap=l;l=r;r=swap;}
  if(l>enter){enter=l;axis=i;sign=s;}exit=Math.min(exit,r);if(enter>exit)return null;
 }
 if(enter< -1e-7||enter>1||exit<0)return null;return{t:Math.max(0,enter),axis,sign,o};
}
// Only rising/falling lift tops need relative-time catching. The existing
// slab sweep remains authoritative for sides/undersides and all other solids.
function movingTop(p,dx,dy,dz,o){
 const top=o.y-o.dy,relative=dy-o.dy;
 if(relative>=0||p.y<top-.002)return null;
 const t=(top-p.y)/relative;if(t<0||t>1)return null;
 if(!contains(o,p.x+dx*t,p.z+dz*t))return null;
 return{t,axis:1,sign:1,o};
}
// OBB-vs-player AABB in the gate plane: identical angle, blade start and width
// to the rendered radial arms (the old polar/sine approximation missed feet).
function rotorContact(p,h){
 if(Math.abs(p.z-h.z)>.325+R)return false;
 const px=p.x-h.x,py=p.y+H/2-h.y;
 if(Math.max(0,Math.abs(px)-R)**2+Math.max(0,Math.abs(py)-H/2)**2<.52**2)return true;
 const half=(h.radius-.45)/2,center=(h.radius+.45)/2;
 for(let i=0;i<h.blades;i++){
  const a=h.angle+i*Math.PI*2/h.blades,c=Math.cos(a),s=Math.sin(a),dx=px-c*center,dy=py-s*center,t=h.thickness;
  if(Math.abs(dx)>R+Math.abs(c)*half+Math.abs(s)*t||Math.abs(dy)>H/2+Math.abs(s)*half+Math.abs(c)*t)continue;
  if(Math.abs(dx*c+dy*s)<=half+R*Math.abs(c)+H/2*Math.abs(s)&&Math.abs(-dx*s+dy*c)<=t+R*Math.abs(s)+H/2*Math.abs(c))return true;
 }
 return false;
}
function step(p,input,data,dt=DT){
 if(p.dead)return;
 let beltX=0,beltZ=0;
 p.coyote=Math.max(0,p.coyote-dt);p.buffer=Math.max(0,p.buffer-dt);p.invulnerable=Math.max(0,p.invulnerable-dt);p.bounceLock=Math.max(0,p.bounceLock-dt);
 p.stun=Math.max(0,(p.stun||0)-dt);p.hitSlow=Math.max(0,(p.hitSlow||0)-dt);
 if(p.support>=0){const o=data.platforms[p.support];if(o?.active){
  if(o.type==='fan'){const a=o.yaw-o.previousYaw,c=Math.cos(a),s=Math.sin(a),x=p.x-o.centerX,z=p.z-o.centerZ;p.x=o.centerX+c*x+s*z;p.z=o.centerZ-s*x+c*z;}
  else{p.x+=o.dx;p.z+=o.dz;}beltX=o.flowX||0;beltZ=o.flowZ||0;p.y+=o.dy||0;
 }else p.grounded=false;}
 const wasGrounded=p.grounded;p.landingAge=p.grounded?p.landingAge+dt:p.landingAge;p.airTime=p.grounded?0:p.airTime+dt;p.boostTime=Math.max(0,p.boostTime-dt);
 if(input.jumpHeld&&p.stun<=0)p.buffer=.14;if(p.stun>0)p.buffer=0;
 p.diveTimer=Math.max(0,(p.diveTimer||0)-dt);p.diveCooldown=Math.max(0,(p.diveCooldown||0)-dt);p.tumble=Math.max(0,(p.tumble||0)-dt);
 if(input.dive&&p.stun<=0&&p.diveCooldown<=0&&!p.diveUsed){p.diveUsed=true;p.diveCooldown=.85;p.diveTimer=.38;p.vy=p.grounded?3:Math.min(p.vy,1.4);p.grounded=false;p.support=-1;p.vx-=Math.sin(input.yaw||0)*2.5;p.vz-=Math.cos(input.yaw||0)*2.5;p.dived=true;}
 const boost=p.diveTimer>0?1.4:1;
 const f=input.forward||(p.diveTimer>0&&!input.strafe?1:0),s=input.strafe||0,len=Math.max(1,Math.hypot(f,s)),c=Math.cos(input.yaw||0),sn=Math.sin(input.yaw||0),moving=Math.abs(f)+Math.abs(s)>.01;
 if(p.grounded&&p.landingAge>.16){p.momentum=Math.max(0,p.momentum-dt*4);if(p.momentum<.05)p.bhop=0;}
 if(!moving&&p.grounded){p.momentum=0;p.bhop=0;}
 const targetSpeed=Math.max(SPEED+p.momentum,p.boostTime>0?12:0)*boost*(p.speedScale||1)*(1-.5*p.hitSlow/2.2),tx=(s*c-f*sn)/len*targetSpeed,tz=(-f*c-s*sn)/len*targetSpeed;
 if(p.stun<=0){
  if(p.grounded){const dx=tx-p.vx,dz=tz-p.vz,k=Math.min(1,(moving?20:50)*dt/Math.max(.00001,Math.hypot(dx,dz)));p.vx+=dx*k;p.vz+=dz*k;}
  else if(moving){const forwardDot=p.vx*tx+p.vz*tz,speed=Math.max(Math.hypot(p.vx,p.vz),Math.min(targetSpeed,Math.hypot(p.vx,p.vz)+12*dt)),k=1-Math.exp(-4*dt);p.vx+=(tx-p.vx)*k;p.vz+=(tz-p.vz)*k;const v=Math.hypot(p.vx,p.vz);if(v>0&&forwardDot>0){p.vx*=speed/v;p.vz*=speed/v;}}
 }else{p.vx*=Math.exp(-.65*dt);p.vz*=Math.exp(-.65*dt);p.momentum=0;p.bhop=0;}
 // Wind is an external displacement, not an input velocity immediately erased
 // by ground braking. Integrate its drag-limited velocity separately.
 let windForce=0;for(const h of data.hazards)if(!h.consumed&&h.type==='wind'&&Math.abs(p.x-h.x)<5.5&&Math.abs(p.z-h.z)<5&&p.y>h.y-1.5&&p.y<h.y+3.3)windForce-=h.side*h.strength*h.gust;
 p.windV=(p.windV||0)*Math.exp(-2.8*dt)+windForce*dt;
 // Pad contact wins over a buffered/held Space jump, including coplanar catches.
 if(p.stun<=0&&p.bounceLock<=0&&(p.grounded||p.vy<=0))for(const o of data.platforms){if(o.active&&o.type==='bounce'&&contains(o,p.x,p.z,-.08)&&p.y>=o.y-.035&&p.y<=o.y+.09){launchPad(p,o);break;}}
 if(p.stun<=0&&p.buffer>0&&(p.grounded||p.coyote>0)){
  if(p.landingAge<=.14&&moving&&Math.hypot(p.vx,p.vz)>4){p.bhop++;p.momentum=Math.min(5,p.momentum+.65);const v=Math.hypot(p.vx,p.vz),gain=Math.min(.65,Math.max(0,SPEED+p.momentum-v));if(v){p.vx*=1+gain/v;p.vz*=1+gain/v;}}
  p.vy=JUMP;p.buffer=0;p.coyote=0;p.grounded=false;p.support=-1;p.jumped=true;p.landingAge=1;
 }
 p.vy-=G*dt;p.grounded=false;p.support=-1;let remaining=dt;
 for(let pass=0;pass<4&&remaining>1e-7;pass++){
  const dx=(p.vx+(p.windV||0)+beltX)*remaining,dy=p.vy*remaining,dz=(p.vz+beltZ)*remaining;let hit=null;
  for(const o of data.platforms){
   const reach=o.yaw?Math.hypot(o.w,o.d)/2:0;
   if(!o.active||o.triggerOnly||Math.abs(o.z-p.z)>Math.abs(dz)+(reach||o.d/2)+R+1||Math.abs(o.x-p.x)>Math.abs(dx)+(reach||o.w/2)+R+1)continue;
   const h=(pass===0&&o.type==='lift'?movingTop(p,dx,dy,dz,o):null)||surfaceSweep(p,dx,dy,dz,o);
   if(h&&(!hit||h.t<hit.t))hit=h;
  }
  for(let layer=0;layer<2;layer++)for(const o of (layer===0?data.rails:data.barriers)||[]){
   if(!o.active||!data.platforms[o.owner]?.active||Math.abs(o.z-p.z)>Math.abs(dz)+o.d/2+R+1||Math.abs(o.x-p.x)>Math.abs(dx)+o.w/2+R+1)continue;
   const h=(pass===0&&o.moving&&data.platforms[o.owner].type==='lift'?movingTop(p,dx,dy,dz,o):null)||sweep(p,dx,dy,dz,o);if(h&&(!hit||h.t<hit.t))hit=h;
  }
  if(!hit){p.x+=dx;p.y+=dy;p.z+=dz;break;}
  p.x+=dx*hit.t;p.y+=dy*hit.t;p.z+=dz*hit.t;
  if(trollContact(p,hit.o,data,hit.axis===1&&hit.sign===1)){
   remaining*=1-hit.t;if(p.dead)break;if(hit.o.trap==='reversePad'){p.y=hit.o.y+.01;break;}continue;
  }
  const key=hit.axis===0?'x':hit.axis===1?'y':'z',v=hit.axis===0?'vx':hit.axis===1?'vy':'vz';
  if(hit.nx!==undefined){p.x+=hit.nx*.002;p.z+=hit.nz*.002;const inward=p.vx*hit.nx+p.vz*hit.nz;if(inward<0){p.vx-=inward*hit.nx;p.vz-=inward*hit.nz;}}
  else{p[key]+=hit.sign*.002;p[v]=0;if(hit.axis===0)p.windV=0;}remaining*=1-hit.t;
  if(hit.axis===1&&hit.sign===1){
   p.y=hit.o.y+.002;p.grounded=true;p.support=hit.o.id;p.diveUsed=false;p.diveTimer=0;
   if(hit.o.type==='crumble'&&hit.o.touchAt===null)hit.o.touchAt=data.time;
   p.coyote=data.difficulty?.coyote??.12;
   if(hit.o.type==='bounce'&&p.bounceLock<=0)launchPad(p,hit.o);
  }
 }
 // Preserve the 2mm skin support probe; it also keeps lift riders attached.
 if(!p.grounded&&p.vy<=0)for(const o of data.platforms){
  if(!o.active||o.triggerOnly||o.type==='bounce'||!contains(o,p.x,p.z))continue;
  if(data.troll&&p.y>=o.y-1e-5&&p.y<=o.y+.006&&trollContact(p,o,data,true))continue;
  if(p.y>=o.y-1e-5&&p.y<=o.y+.006){p.y=o.y+.002;p.vy=0;p.grounded=true;p.support=o.id;p.diveUsed=false;p.diveTimer=0;if(o.type==='crumble'&&o.touchAt===null)o.touchAt=data.time;p.coyote=data.difficulty?.coyote??.12;break;}
 }
 if(p.grounded&&p.bounceLock<=0)for(const o of data.platforms)if(o.triggerOnly&&o.type==='bounce'&&Math.abs(p.x-o.x)<o.w/2&&Math.abs(p.z-o.z)<o.d/2&&Math.abs(p.y-o.y)<.08){launchPad(p,o);break;}
 // The same 2mm resting probe on rail tops avoids grounded/bob flicker if a
 // player deliberately lands on the low barrier instead of jumping past it.
 if(!p.grounded&&p.vy<=0)for(const o of data.rails||[]){if(o.active&&data.platforms[o.owner]?.active&&contains(o,p.x,p.z)&&p.y>=o.y-1e-5&&p.y<=o.y+.006){p.y=o.y+.002;p.vy=0;p.grounded=true;p.support=o.id;p.diveUsed=false;p.coyote=data.difficulty?.coyote??.12;break;}}
 if(p.grounded&&!wasGrounded&&p.airTime>.12){p.landingAge=0;p.airTime=0;}
 for(const h of data.hazards){
  if(h.consumed||h.type==='wind'||Math.abs(p.z-(h.currentZ??h.z))>Math.max(9,(h.length||0)/2+R)||p.invulnerable>0&&!h.lethal)continue;
  let hit=false,nx=0,nz=0;
  if(h.type==='boost'){if(Math.abs(p.x-h.x)<h.width/2&&Math.abs(p.z-h.z)<.7&&p.y>=h.y-h.height/2-.2&&p.y<h.y+h.height/2)p.boostTime=2;continue;}
  if(h.type==='rotor'){
   const dx=p.x-h.x;hit=rotorContact(p,h);
   if(hit)impact(p,h,Math.sign(dx)*.35,1);continue;
  }
  if(h.type==='sweeper'){const c=Math.cos(h.angle),s=Math.sin(h.angle),dx=p.x-h.x,dz=p.z-h.z,u=dx*c+dz*s,v=-dx*s+dz*c;hit=Math.abs(u)<h.length/2+R&&Math.abs(v)<h.thickness+R&&p.y<h.y+h.thickness&&p.y+H>h.y-h.thickness;nx=-s*Math.sign(v||1);nz=c*Math.sign(v||1);}
  else if(h.type==='gate'||h.type==='pulse'||h.type==='hurdle'){const depth=h.type==='hurdle'?.3:.55;hit=(h.type!=='pulse'||h.lit)&&Math.abs(p.x-h.currentX)<h.width/2+R&&Math.abs(p.z-h.z)<depth+R&&p.y<h.y+h.height/2&&p.y+H>h.y-h.height/2;nx=h.type==='gate'?-h.side*.35:0;nz=1;}
  else if(h.type==='ball'){const dx=Math.max(0,Math.abs(p.x-h.currentX)-R),dz=Math.max(0,Math.abs(p.z-h.currentZ)-R),dy=Math.max(p.y-h.currentY,h.currentY-p.y-H,0);hit=dx*dx+dy*dy+dz*dz<h.radius*h.radius;nx=Math.sign(p.x-h.currentX)||1;nz=Math.sign(p.z-h.currentZ)||1;}
  else if(h.type==='bumper'){const dx=Math.max(0,Math.abs(p.x-h.currentX)-R),dz=Math.max(0,Math.abs(p.z-h.z)-R);hit=dx*dx+dz*dz<h.radius*h.radius&&p.y<h.y+h.radius&&p.y+H>h.y-h.radius;nx=Math.sign(p.x-h.currentX)||1;nz=Math.sign(p.z-h.z)||1;}
  else if(h.type==='hammer'){const c=Math.cos(h.angle),s=Math.sin(h.angle),dx=p.x-h.currentX,dz=p.z-h.currentZ,u=dx*c-dz*s,v=dx*s+dz*c,extent=R*(Math.abs(c)+Math.abs(s)),radial=Math.max(0,Math.abs(v)-extent),dy=Math.max(p.y-h.y,h.y-p.y-H,0);hit=Math.abs(u)<1.1+extent&&radial*radial+dy*dy<h.radius*h.radius;nx=Math.sign(dx)||1;nz=Math.sign(dz)||1;}
  else if(h.type==='roller'){const dy=Math.max(p.y-h.y,h.y-p.y-H,0),dz=Math.max(0,Math.abs(p.z-h.z)-R);hit=Math.abs(p.x-h.x)<h.width/2+R&&dy*dy+dz*dz<h.radius*h.radius;nz=1;}
  else if(h.type==='flipper'){hit=h.strike&&Math.abs(p.x-h.x)<h.width/2+R&&Math.abs(p.z-h.z)<h.depth/2+R&&p.y<h.y+1.8&&p.y+H>h.y-.2;nz=1;}
  else if(h.type==='swingLog'){const dy=Math.max(p.y-h.currentY,h.currentY-p.y-H,0),dz=Math.max(0,Math.abs(p.z-h.z)-R);hit=Math.abs(p.x-h.currentX)<h.width/2+R&&dy*dy+dz*dz<h.radius*h.radius;nx=Math.sign(h.velocityX)||1;nz=.35;}
  else if(h.type==='shutter'){hit=Math.abs(p.x-h.x)<h.width/2+R&&Math.abs(p.z-h.z)<.3+R&&p.y<h.currentY+h.height/2&&p.y+H>h.currentY-h.height/2;nz=1;}
  else if(h.type==='popper'){const dx=Math.max(0,Math.abs(p.x-h.x)-R),dz=Math.max(0,Math.abs(p.z-h.z)-R);hit=h.strike&&h.rise>.15&&dx*dx+dz*dz<h.radius*h.radius&&p.y<h.currentY+.3&&p.y+H>h.currentY-.3;nx=Math.sign(p.x-h.x)*.5;nz=1;}
  else if(h.type==='pendulum'){const dx=Math.max(0,Math.abs(p.x-h.currentX)-R),dz=Math.max(0,Math.abs(p.z-h.z)-R),dy=Math.max(p.y-h.currentY,h.currentY-p.y-H,0);hit=dx*dx+dy*dy+dz*dz<h.radius*h.radius;nx=Math.sign(h.velocityX)||1;nz=.15;}
  else if(h.type==='piston'){const x=h.x-h.side*h.push;hit=Math.abs(p.x-x)<1.2+R&&Math.abs(p.z-h.z)<1+R&&p.y<h.y+1&&p.y+H>h.y-1;nx=-h.side;nz=.15;}
  if(hit){impact(p,h,nx,nz);break;}
 }
}
// Advisory landing cue only: current velocity/visible active surfaces, no assist.
function predictLanding(p,data,out){
 out.platform=-1;let nearest=1.25;
 if(p.grounded||p.dead)return out;
 for(const o of data.platforms){
  if(!o.active)continue;const disc=p.vy*p.vy+2*G*(p.y-o.y);if(disc<0)continue;
  const t=(p.vy+Math.sqrt(disc))/G;if(t<.04||t>=nearest)continue;
  const x=p.x+(p.vx+(p.windV||0))*t,z=p.z+p.vz*t;
  if(!contains(o,x,z,-R-.05))continue;
  if(o.type==='tile'&&((data.time+t+o.phase)%o.period+o.period)%o.period>=o.activeFor)continue;
  if(o.type==='crumble'&&o.touchAt!==null&&data.time+t-o.touchAt>=data.difficulty.crumbleDelay)continue;
  nearest=t;out.platform=o.id;out.x=x;out.y=o.y;out.z=z;out.time=t;
 }
 return out;
}
g.ElementalObbyCourse={course,round,trollCourse,trollContact,roundOrder,layouts,difficulty,pose,player,step,sweep,surfaceSweep,contains,movingTop,rotorContact,predictLanding,machineEnvelope,DT,G,JUMP,SPEED,R,H,themes,COURSE_VERSION,ROUND_COUNT};if(typeof module!=='undefined')module.exports=g.ElementalObbyCourse;
})(typeof window!=='undefined'?window:globalThis);
