# Obby 1.47.0 — yalnız eklenen/değişen bloklar

Bu bloklar aktif projeye uygulanmıştır; tekrar yapıştırılmaları gerekmez. 120Hz, G/JUMP/SPEED ve swept-AABB değişmedi. Destek probunun temas hesabı korunur; yalnız coyote süre ataması bölüm ayarından alınır.

## 1. obby-course.js

### Sabitlerden sonra: zorluk ayarları

```js
// Difficulty changes layout tolerances, never gravity/jump/swept-AABB.
function difficulty(level){
 const n=Math.max(0,Math.min(1,(level-1)/5)),t=n*n*(3-2*n);
 return{factor:t,stoneW:6.2-1.6*t,stoneD:6.4-2.4*t,tileW:6.4-1.2*t,tileD:6.6-2.5*t,
 moverW:6.8-1.6*t,moverD:8.2-1.5*t,moverAmplitude:1.25+2*t,coyote:.12-.02*t,
 tilePeriod:6.1-.3*t,tileActive:5.15-.55*t,tileWarning:.85-.1*t};
}
```

### course(level) içinde: ayarları kullan

```js
// level 1..6 olarak sınırlandıktan sonra:
const tuning = difficulty(level);

// stones / movers / tiles üretimindeki ölçüler:
if (type === 'stones') for (let j=1;j<=4;j++)
  add(x+Math.sin(j*1.7+level)*2,3+(j%2)*.6,z-j*8,
      tuning.stoneW,tuning.stoneD,{stage});

if (type === 'movers') for (let j=1;j<=3;j++)
  add(x,3,z-j*10,tuning.moverW,tuning.moverD,{
    stage,type:'mover',amplitude:tuning.moverAmplitude,
    rate:.8+level*.025,phase:j*1.8
  });

if (type === 'tiles') for (let j=1;j<=4;j++)
  add(x+(j%2?.7:-.7),3,z-j*8,tuning.tileW,tuning.tileD,{
    stage,type:'tile',phase:j*.7,period:tuning.tilePeriod,
    activeFor:tuning.tileActive,warningFor:tuning.tileWarning
  });

// return nesnesine eklendi:
difficulty: tuning
```

### pose()/step() içindeki değişen atamalar

```js
// pose: tile periyodu artık bölüme göre ayarlanır.
o.active = o.type !== 'tile' || (time+o.phase)%o.period < o.activeFor;
o.warning = o.type === 'tile' &&
  (time+o.phase)%o.period > o.activeFor-o.warningFor;

// step: normal üst teması VE mevcut destek probundaki coyote ataması.
// İki yerde de temas testi/snap hesabı aynı bırakıldı.
p.coyote = data.difficulty?.coyote ?? .12;
```

## 2. obby-run.js

### ElementalObbyRun sınıfından önce: bağımsız yardımcılar

```js
// Active-time clock: no relationship to clamped physics dt/worldTime.
class ActivePlayClock{
 constructor(now=()=>performance.now()){this.now=now;this.reset();}
 reset(){this.started=false;this.totalMs=0;this.anchor=null;}
 start(){this.started=true;this.resume();}
 resume(){if(this.started&&this.anchor===null)this.anchor=this.now();}
 pause(){if(this.anchor!==null){this.totalMs+=Math.max(0,this.now()-this.anchor);this.anchor=null;}}
 seconds(){return(this.totalMs+(this.anchor===null?0:Math.max(0,this.now()-this.anchor)))/1000;}
}
// Finish economy: 15..75 gold, based on this attempt relative to its best.
function finishReward(level,seconds,previousBest){
 if(!Number.isFinite(seconds)||seconds<=0)return 0;
 const old=Number.isFinite(previousBest)&&previousBest>0?previousBest:null;
 const best=old===null?seconds:Math.min(old,seconds),base=25+5*Math.max(1,Math.min(6,level));
 return Math.floor(base*(.5+.5*Math.min(1,best/seconds)))+(old===null?20:seconds<old?10:0);
}
// Reused rays/vectors/hit array; only opaque world meshes belong in solids.
class ObbyCameraCollider{
 constructor(T){this.ray=new T.Raycaster();this.origin=new T.Vector3();this.direction=new T.Vector3();this.goal=new T.Vector3();this.hits=[];this.epsilon=.25;}
 constrain(point,solids,out){
  this.direction.subVectors(point,this.origin);const length=this.direction.length();
  if(length<.0001)return out.copy(point);
  this.direction.multiplyScalar(1/length);this.ray.set(this.origin,this.direction);this.ray.near=.01;this.ray.far=length;
  this.hits.length=0;this.ray.intersectObjects(solids,false,this.hits);
  const distance=this.hits.length?Math.min(length,Math.max(.03,this.hits[0].distance-this.epsilon)):length;
  return out.copy(this.origin).addScaledVector(this.direction,distance);
 }
 update(camera,player,desired,solids,dt){
  this.origin.set(player.x,player.y+.8,player.z);
  this.constrain(desired,solids,this.goal);
  if(dt>0)camera.position.lerp(this.goal,1-Math.exp(-12*dt));else camera.position.copy(this.goal);
  // Lerp may cut across a corner. Final safety clamp keeps it before the wall.
  this.constrain(camera.position,solids,camera.position);
 }
}
```

### constructor / build / render bağlantıları

```js
// constructor'a eklendi:
this.clock = new ActivePlayClock(api.now);
this.cameraCollider = new ObbyCameraCollider(T);
this.solids = []; // Yalnız kamera raycast'i için Three.js mesh listesi.

// build: platform batch'i, opak dekor instance'ları, taban ve hazard mesh'leri:
this.solids.push(this.platformBatch);
this.solids.push(floor);
this.solids.push(...group.children);
if (!mat.transparent) this.solids.push(inst);

// clearScene başında:
this.solids.length = 0;

// render'da camGoal hesaplandıktan sonra eski camera lerp yerine:
this.scene.updateMatrixWorld(true);
this.cameraCollider.update(this.camera,p,this.camGoal,this.solids,dt);
this.look.set(p.x,Math.max(p.y,3)+1.4,p.z);
this.camera.lookAt(this.look);
```

### Saatin yaşam döngüsü / HUD bağlantıları

```js
// restart(): fizik elapsed/worldTime sıfırlamasının yanında:
this.clock.reset();
this.rewardCoins = 0;
this.runId = (globalThis.crypto?.randomUUID?.() || 'obby-'+Date.now())
  + '-' + (++attemptSequence);

// tick(): mevcut başlangıç merkezinden 2 birim ayrılma koşulu içinde:
// elapsed fizik/simülasyon teşhisi olarak korunur; HUD ona bağlı değildir.
if (this.elapsed>0 ||
    Math.hypot(this.p.x-this.data.checkpoints[0].x,this.p.z)>2) {
  if (!this.clock.started) this.clock.start();
  this.elapsed += C.DT;
}

// pause() / exit(): state değiştirilmeden önce:
this.clock.pause();

// enter() / resume():
this.clock.resume(); // start koşulu henüz sağlanmadıysa saymaya başlamaz.

// refresh(): HUD ve throttling:
const stamp = Math.floor(this.clock.seconds()*10)+this.checkpoint*1e6;
this.ui.querySelector('[data-time]').textContent =
  this.format(this.clock.seconds());

// snapshot(): time artık HUD ile aynı; eski değer teşhis içindir.
time: this.clock.seconds(),
simulationTime: this.elapsed
```

Pause/preparing/won süreleri sayılmaz. Playing durumundaki respawn beklemesi sayılır. Bu, eski simülasyon kronometresinden bilinçli olarak farklıdır.

### finish() — rekor ve tek seferlik ödül

```js
// Finish stores the same active-wall time shown in HUD and pays once per attempt.
 finish(){
  if(this.won)return;this.won=true;this.clock.pause();this.state='won';
  const seconds=this.clock.seconds(),previousBest=this.saved.best[this.level];
  if(seconds>0&&Number.isFinite(seconds))this.saved.best[this.level]=Math.min(previousBest||Infinity,seconds);
  this.saved.level=Math.min(6,this.level+1);this.save();
  const coins=finishReward(this.level,seconds,previousBest);
  this.rewardCoins=0;
  try{this.rewardCoins=this.api.bank?.({id:this.runId,level:this.level,seconds,best:this.saved.best[this.level],coins})||0;}catch(error){console.warn('[Obby reward]',error);}
  this.api.sound('coin');this.api.stateChanged('won');document.exitPointerLock?.();this.celebrateTime=0;this.showModal();
 }
```

Eski best kayıtları silinmez; legacySimulationBest altında korunur. Yeni best, clockVersion=2 ile aktif gerçek süreyi tutar. Ödül ilk bitirişte50–75, aynı rekorda tekrar bitirişte30–55; yavaş bitiriş daha az, yeni PB ek10 verir. Genel üst sınır75. Bozuk/sıfır süre ödemez.

### createUI() içine: mobil look pad ve ödül göstergesi

```html
<!-- .obby-touch içine, d-pad ve Jump'ın kardeşi olarak eklendi: -->
<div class="obby-look-pad" aria-hidden="true"></div>

<!-- .obby-card içinde süre paragrafından sonra: -->
<strong class="obby-reward" data-reward></strong>
```

```js
// Eski mobil canvas pointermove dinleyicileri kaldırıldı.
// Desktop canvas hâlâ yalnız pointer lock isteyebilir.
const canvas = this.api.renderer().domElement;
canvas.addEventListener('pointerdown',()=>{
  if(this.active && this.state==='playing' && !this.api.mobile)
    this.api.lock();
});
this.bindLookPad(this.ui.querySelector('.obby-look-pad'));

// D-pad/Jump pointerdown içinde ayrıca:
e.preventDefault();
e.stopPropagation();

// showModal():
const reward=this.modal.querySelector('[data-reward]');
reward.hidden=!win;
reward.textContent='+'+(this.rewardCoins||0)+' ◇';
```

### Sınıf içine: yalnız look pad'den kamera girişi

```js
// Right-half look pad is a sibling of Jump: a Jump pointer never starts look.
 bindLookPad(pad){
  pad.addEventListener('pointerdown',e=>{
   if(!this.active||this.state!=='playing'||this.lookTouch)return;
   e.preventDefault();e.stopPropagation();this.api.interaction?.();
   this.lookTouch={id:e.pointerId,x:e.clientX,y:e.clientY};
   try{pad.setPointerCapture(e.pointerId);}catch(_){}
  });
  pad.addEventListener('pointermove',e=>{
   const p=this.lookTouch;if(this.state!=='playing'||!p||p.id!==e.pointerId)return;
   e.preventDefault();e.stopPropagation();
   this.yaw-=Math.max(-40,Math.min(40,e.clientX-p.x))*.004;
   this.pitch=Math.max(.1,Math.min(.85,this.pitch+(e.clientY-p.y)*.003));
   p.x=e.clientX;p.y=e.clientY;
  });
  for(const type of ['pointerup','pointercancel','lostpointercapture'])pad.addEventListener(type,e=>{if(this.lookTouch?.id===e.pointerId)this.lookTouch=null;});
 }
```

Pointer kimliği tutulur; Jump ikinci parmağı look kontrolünü çalamaz. Jump ve look pad kardeşlerdir; Jump üzerinde başlayan pointer, capture yüzünden dışarı sürüklense de look pad'e devredilmez.

## 3. obby-run.css — dosya sonuna eklenen katmanlar

```css
/* Touch look is a right-half sibling, never the ancestor of Jump or d-pad. */
#obby-hud .obby-look-pad{position:absolute;left:50%;right:0;top:0;bottom:0;z-index:1;pointer-events:auto;touch-action:none;user-select:none;-webkit-user-select:none}
#obby-hud header{z-index:5}
#obby-hud .obby-dpad,#obby-hud [data-jump]{z-index:3}
#obby-hud .obby-modal{z-index:10}
#obby-hud .obby-reward{color:#f2d38a;font-size:26px;font-variant-numeric:tabular-nums}
/* Keep all finish/pause actions visible on short landscape phones. */
@media(max-height:500px){
 #obby-hud .obby-card{gap:5px;padding:12px}
 #obby-hud .obby-card h2{font-size:20px;margin:2px}
 #obby-hud .obby-card p{font-size:13px;margin:4px}
 #obby-hud .obby-card button{margin:0;padding:8px 14px;min-height:34px;line-height:1.15}
 #obby-hud .obby-card .obby-trophy{font-size:24px}
 #obby-hud .obby-reward{font-size:22px}
}
```

Look pad sağ yarıyı kaplar fakat z-index ile Jump/d-pad ve HUD düğmelerinin altında kalır; modal ise hepsinin üstündedir.

## 4. game-runtime.js — ana cüzdan bağdaştırıcısı

```js
// obbyRun değişkeninin yanına:
const obbyRewardReceipts = new Set();

// ensureObbyRun() API nesnesine eklendi:
bank: result => {
  if (!result || typeof result.id !== 'string' ||
      result.id.length > 160 || obbyRewardReceipts.has(result.id)) return 0;
  if (!Number.isFinite(result.seconds) || result.seconds <= 0 ||
      !Number.isInteger(result.level) ||
      result.level < 1 || result.level > 6) return 0;
  if (!Number.isInteger(result.coins) ||
      result.coins < 1 || result.coins > 75) return 0;

  obbyRewardReceipts.add(result.id);
  if (obbyRewardReceipts.size > 128)
    obbyRewardReceipts.delete(obbyRewardReceipts.values().next().value);

  menuState.walletCoins =
    Math.max(0, Math.floor(menuState.walletCoins) || 0) + result.coins;
  noteDailyMissionEvent('collectCoins', result.coins);
  noteDailyMissionEvent('playRuns', 1);
  saveMainMenuState();
  if (!obbyRun?.active) {
    updateMainMenuStats();
    lobbyRewards?.refresh();
  }
  return result.coins;
},
```

Bu yerel tekrar-ödeme korumasıdır; sunucu taraflı anti-cheat değildir. Finish won koruması ve host receipt kontrolü birlikte kullanılır.

## Doğrulama

- Eski ve yeni altı parkur fizik testleri geçti.
- Swept-AABB fonksiyonu birebir aynı; destek probu yalnız coyote parametresi dışında aynı.
- Kamera: gerçek Three.js duvar raycast'i, hareket eden engel ve dışarı yumuşak dönüş testi.
- Saat: .5s update .05s fiziğe clamp edilirken HUD5s, pause sonrası8s doğru.
- Cüzdan: bir finish +50; tekrar finish/aynı receipt ikinci ödeme yapmadı.
- Mobil: gerçek çoklu touch protokolünde Jump sürüklemesi yaw değiştirmedi; ayrı look pad ve ikinci Jump parmağı birlikte çalıştı.
- Browser testleri SDK stub kullanır; gerçek telefon veya canlı Poki sertifikası iddia edilmez.
