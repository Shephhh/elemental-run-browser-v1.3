/* Independent, alpha-backed key-art layers. No duplicate hero in the base plate. */
(function(){'use strict';
const roles=['base','b','a','hero'];
const lights={
 troll:[[.59,.37,'#7bffe1'],[.24,.30,'#ff3f6c'],[.43,.57,'#ce80ff']],
 level:[[.47,.55,'#75ffce'],[.73,.49,'#ffe26b'],[.81,.10,'#b9fffa']],
 endless:[[.45,.53,'#74ffdc'],[.82,.57,'#ffd763'],[.16,.24,'#72edff']],
 surf:[[.50,.34,'#85ffdf'],[.48,.47,'#8bffe9'],[.70,.40,'#76dfff']],
 obby:[[.47,.36,'#87ffdb'],[.86,.43,'#ffce74'],[.12,.42,'#ff86d1']],
 runner2d:[[.39,.44,'#80ffcb'],[.71,.60,'#ffce74'],[.73,.36,'#ffec79']],
 flappy:[[.53,.36,'#ffdd7b'],[.52,.18,'#bcff7d'],[.52,.57,'#aeff9d']]
};
const modeOrder=['level','troll','endless','surf','obby','runner2d','flappy'];
const initialModes=()=>modeOrder.slice(0,innerHeight>innerWidth?2:4);
let preparation=null;
async function decodeImage(img,url,priority='low',timeout=5000){
 let timer;img.decoding='async';img.fetchPriority=priority;img.src=url;
 try{
  await Promise.race([img.decode(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('Menu image timeout')),timeout);})]);
 }finally{clearTimeout(timer);}
}
function prepareInitial(){
 if(preparation)return preparation.promise;
 const state=preparation={requested:initialModes(),ready:[],failed:0,images:[],released:false,done:false,promise:null};
 const urls=state.requested.map(mode=>'assets/mode-cards/'+mode+'-art.webp');
 urls.push('assets/mode-cards/canyon.webp');
 let cursor=0;
 const worker=async()=>{
  while(cursor<urls.length){
   const url=urls[cursor++],img=new Image();if(!state.released)state.images.push(img);
   try{await decodeImage(img,url,'low',4000);state.ready.push(url);}
   catch(_){state.failed++;img.removeAttribute('src');}
   await new Promise(resolve=>setTimeout(resolve,0));
  }
 };
 const font=document.fonts?.load('600 30px ElementalMenu').catch(()=>null);
 state.promise=Promise.allSettled([worker(),worker(),font]).then(()=>{state.done=true;});
 return state.promise;
}
async function readyForMenu(){
 let timer;
 try{await Promise.race([prepareInitial(),new Promise(resolve=>{timer=setTimeout(resolve,1200);})]);}
 finally{clearTimeout(timer);}
}
function releaseInitial(){if(preparation){preparation.released=true;preparation.images.length=0;}}
function preparationSnapshot(){return preparation?{requested:preparation.requested,ready:preparation.ready.length,failed:preparation.failed,done:preparation.done,heldImages:preparation.images.length}:null;}
function mount({grid,buttons,reduced}){
 let dead=false,suspended=false,stamp=0,live=null,busy=false,scheduled=0;
 let decodes=0,peakDecodes=0;
 const queue=new Set();
 const coarse=matchMedia('(pointer:coarse)').matches,limit=coarse?3:4;
 const cards=buttons.map(button=>({button,mode:button.dataset.mode,seen:false,generation:0,loading:false,ready:false,scene:null,timer:0,stamp:0,retryAt:0}));
 const ensureFlat=card=>{
  const img=card.button.querySelector('.boot-mode-photo');
  if(!img.getAttribute('src')&&img.dataset.src)img.src=img.dataset.src;
 };
 const clear=card=>{
  queue.delete(card);
  clearTimeout(card.timer);card.timer=0;card.generation++;card.ready=false;card.loading=false;
  card.button.classList.remove('has-poster-layers','is-poster-live');
  card.scene?.querySelectorAll('img').forEach(img=>img.removeAttribute('src'));
  card.scene?.remove();card.scene=null;
 };
 const trim=()=>{
  const loaded=cards.filter(c=>c.scene),view=grid.getBoundingClientRect(),mid=(view.left+view.right)*.5;
  const distance=c=>Math.abs(c.button.getBoundingClientRect().left+c.button.clientWidth*.5-mid);
  for(const card of loaded.filter(c=>c!==live).sort((a,b)=>Number(a.seen)-Number(b.seen)||distance(b)-distance(a))){
   if(cards.filter(c=>c.scene).length<=limit)break;clear(card);
  }
 };
 const schedule=()=>{
  if(dead||suspended||document.hidden||busy||scheduled||!queue.size)return;
  scheduled=setTimeout(pump,32);
 };
 function request(card){
  clearTimeout(card.timer);
  if(dead||card.scene||performance.now()<card.retryAt)return;
  queue.add(card);schedule();
 }
 async function pump(){
  scheduled=0;
  if(dead||suspended||document.hidden||busy)return;
  const waiting=[...queue].filter(c=>c.seen);
  const card=waiting.find(c=>c===live)||waiting[0];
  if(!card){queue.clear();return;}
  queue.delete(card);busy=true;
  try{await load(card);}finally{busy=false;schedule();}
 }
 async function load(card){
  card.stamp=++stamp;clearTimeout(card.timer);
  if(dead||card.scene)return;
  const serial=++card.generation,scene=document.createElement('span');scene.className='boot-layer-scene';scene.setAttribute('aria-hidden','true');
  card.scene=scene;card.loading=true;
  ensureFlat(card);
  const images=roles.map(role=>{
   const layer=document.createElement('span');layer.className='boot-art-layer boot-art-'+role;
   const image=document.createElement('img');image.alt='';image.draggable=false;image.decoding='async';
   layer.appendChild(image);scene.appendChild(layer);return {image,role};
  });
  const fx=document.createElement('span');fx.className='boot-art-effects';
  lights[card.mode].forEach(([x,y,color],i)=>{
   const glow=document.createElement('i');glow.className='boot-art-light';glow.style.cssText=`--lx:${x*100}%;--ly:${y*100}%;--lc:${color};--ld:${i*.43}s`;fx.appendChild(glow);
   const star=document.createElement('i');star.className='boot-art-twinkle';star.style.cssText=`--lx:${x*100+5}%;--ly:${y*100-5}%;--lc:${color};--ld:${i*.53}s`;fx.appendChild(star);
  });scene.appendChild(fx);
  // Keep the original flattened illustration visible until every layer decodes.
  card.button.insertBefore(scene,card.button.querySelector('.boot-mode-caption')||card.button.querySelector('.boot-mode-name'));
  trim();
  try{
   for(const {image,role} of images){
    if(dead||serial!==card.generation)return;
    decodes++;peakDecodes=Math.max(peakDecodes,decodes);
    try{await decodeImage(image,'assets/mode-cards/layers/'+card.mode+'-'+role+'.webp');}
    finally{decodes--;}
    await new Promise(resolve=>setTimeout(resolve,0));
   }
   if(dead||serial!==card.generation)return;
   card.loading=false;card.ready=true;card.button.classList.add('has-poster-layers');sync();trim();
  }catch(_){if(!dead&&serial===card.generation){card.retryAt=performance.now()+15000;clear(card);}}
 }
 function sync(){
  for(const c of cards)c.button.classList.toggle('is-poster-live',!suspended&&!document.hidden&&!reduced.matches&&c===live&&c.ready&&c.seen);
 }
 const observer=new IntersectionObserver(entries=>{
  for(const entry of entries){
   const card=cards.find(c=>c.button===entry.target);card.seen=entry.isIntersecting&&entry.intersectionRatio>.035;
   if(card.seen){ensureFlat(card);request(card);}
   else{
    card.button.classList.remove('is-poster-live');
    clearTimeout(card.timer);card.timer=setTimeout(()=>{if(!card.seen&&!dead)clear(card);},1200);
   }
  }sync();trim();
 },{root:grid,threshold:[0,.04]});
 cards.forEach(c=>observer.observe(c.button));
 // Only flat artwork one short step beyond the viewport is fetched ahead.
 // Expensive alpha-layer decode stays in the single-card visible queue above.
 const flatObserver=new IntersectionObserver(entries=>{
  for(const entry of entries)if(entry.isIntersecting)ensureFlat(cards.find(c=>c.button===entry.target));
 },{root:grid,rootMargin:'0px 180px'});
 cards.forEach(c=>flatObserver.observe(c.button));releaseInitial();
 const change=()=>sync();reduced.addEventListener('change',change);
 return{
  setActive(button){const next=cards.find(c=>c.button===button)||null;if(live===next&&(!live||live.scene))return;live=next;if(live){live.stamp=++stamp;if(live.seen)request(live);}sync();},
  suspend(){suspended=true;clearTimeout(scheduled);scheduled=0;queue.clear();cards.filter(c=>c.loading).forEach(clear);sync();},
  resume(){suspended=false;cards.filter(c=>c.seen).forEach(request);sync();},
  snapshot(){return{resident:cards.filter(c=>c.scene).length,ready:cards.filter(c=>c.ready).map(c=>c.mode),active:cards.find(c=>c.button.classList.contains('is-poster-live'))?.mode||null,queued:queue.size,decoding:decodes,peakDecodes,failed:cards.filter(c=>c.retryAt>performance.now()).map(c=>c.mode)};},
  destroy(){if(dead)return;dead=true;clearTimeout(scheduled);queue.clear();observer.disconnect();flatObserver.disconnect();reduced.removeEventListener('change',change);cards.forEach(clear);live=null;releaseInitial();}
 };
}
window.ElementalBootPosterLayers=Object.freeze({mount,prepareInitial,readyForMenu,initialModes,preparationSnapshot});
})();
