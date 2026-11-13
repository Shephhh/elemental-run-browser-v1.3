(function(){'use strict';
let current=null;
function mount({picker,grid,buttons,tr}){
  current?.destroy();
  const root=document.getElementById('loading-screen'),scene=root.querySelector('.boot-mode-scenery');
  buttons.forEach((button,i)=>button.style.setProperty('--arrival',(i*.055).toFixed(3)+'s'));
  const previous=picker.querySelector('.boot-gallery-prev'),next=picker.querySelector('.boot-gallery-next');
  previous.setAttribute('aria-label',tr('back'));next.setAttribute('aria-label',tr('continue'));
  const abort=new AbortController(),signal=abort.signal,reduced=matchMedia('(prefers-reduced-motion: reduce)');
  const posterLayers=window.ElementalBootPosterLayers?.mount({grid,buttons,reduced});
  const dots=picker.querySelector('.boot-gallery-dots');dots.replaceChildren(...buttons.map(()=>document.createElement('i')));
  const halo=document.createElement('div');halo.className='boot-cursor-halo';halo.setAttribute('aria-hidden','true');document.body.appendChild(halo);
  let suspended=false,dead=false,raf=0,x=0,y=0,tx=0,ty=0,located=false,hover=null,drag=null,suppressClick=false,navGoal=null,px=null,py=null;
  const listen=(node,event,fn,options={})=>node.addEventListener(event,fn,{...options,signal});
  const shapes=[
    '<path fill="currentColor" d="m24 2 6 14 15 2-11 10 3 16-13-8-14 8 3-16L2 18l16-2z"/>',
    '<path fill="currentColor" d="m24 2 18 22-18 22L6 24z"/><path fill="none" d="m24 2-7 22 7 22 7-22zM6 24h36"/>',
    '<path fill="currentColor" d="M10 35C-3 32 1 18 12 19 13 3 38 5 38 21c13 0 13 15 1 15z"/>',
    '<ellipse cx="24" cy="24" rx="21" ry="13" fill="none" stroke="currentColor" stroke-width="5" transform="rotate(-35 24 24)"/><circle cx="24" cy="24" r="10" fill="currentColor"/>',
    '<path fill="currentColor" d="M40 5C7 1 0 21 13 34 28 49 47 25 40 5z"/><path fill="none" d="M10 40 32 15"/>',
    '<path fill="currentColor" d="M34 8c-7 0-13 7-13 14S8 37 3 44c14-3 32-9 38-19 6-9 0-17-7-17z"/><path fill="none" d="m8 31 12-3M3 22l12-2"/>'
  ];
  const decor=document.createElement('div');decor.className='boot-stickers';
  for(let i=0;i<16;i++){
    const item=document.createElement('span');item.className='boot-sticker';
    const colors=['#e0b5ff','#9de7ff','#ffd88d','#9df5d7','#ffb2d2'];
    item.style.cssText=`--sx:${(i*29+3)%97}%;--sy:${[2,83,9,64,93,36,16,78][i%8]}%;--ss:${30+(i*17)%55}px;--sc:${colors[i%colors.length]};--sd:${8+i%7*1.7}s;--so:-${i*1.83}s`;
    item.innerHTML='<svg viewBox="0 0 48 48">'+shapes[i%shapes.length]+'</svg>';decor.appendChild(item);
  }
  for(let i=0;i<3;i++){
    const orbit=document.createElement('span');orbit.className='boot-orbit';
    orbit.style.cssText=`--ox:${[2,71,37][i]}%;--oy:${[-20,53,28][i]}%;--os:${[370,300,190][i]}px;--ot:${[28,33,22][i]}s`;decor.appendChild(orbit);
  }
  scene.appendChild(decor);
  const resetHover=()=>{
    if(hover){hover.classList.remove('is-shining');delete hover.dataset.shineFrom;for(const name of ['--tilt-x','--tilt-y','--art-x','--art-y'])hover.style.removeProperty(name);}
    hover=null;halo.classList.remove('is-over','is-red');
    posterLayers?.setActive(null);
  };
  const update=()=>{
    const max=grid.scrollWidth-grid.clientWidth,pos=grid.scrollLeft;
    previous.hidden=pos<3;next.hidden=pos>max-3;
    if(navGoal!==null&&Math.abs(pos-navGoal)<2)navGoal=null;
    let best=0,distance=Infinity;
    buttons.forEach((b,i)=>{const delta=Math.abs(b.offsetLeft-pos);if(delta<distance){distance=delta;best=i;}});
    const focused=buttons.indexOf(document.activeElement);
    if(focused>=0){
      const view=grid.getBoundingClientRect(),card=buttons[focused].getBoundingClientRect();
      if(card.left>=view.left-2&&card.right<=view.right+2)best=focused;
    }
    [...dots.children].forEach((d,i)=>d.classList.toggle('is-current',i===best));
  };
  // Navigate stable layout offsets, never the visually tilted card bounds.
  const navigate=direction=>{
    if(suspended)return;
    const max=grid.scrollWidth-grid.clientWidth,base=buttons[0].offsetLeft;
    const stops=[...new Set(buttons.map(b=>Math.max(0,Math.min(max,b.offsetLeft-base))))];
    const position=navGoal??grid.scrollLeft;
    navGoal=direction>0?(stops.find(v=>v>position+4)??max):([...stops].reverse().find(v=>v<position-4)??0);
    grid.scrollTo({left:navGoal,behavior:reduced.matches?'instant':'smooth'});
  };
  listen(previous,'click',()=>navigate(-1));listen(next,'click',()=>navigate(1));
  listen(grid,'scroll',update,{passive:true});
  listen(grid,'wheel',event=>{
    if(suspended||Math.abs(event.deltaY)<=Math.abs(event.deltaX)||event.ctrlKey)return;
    event.preventDefault();navigate(Math.sign(event.deltaY));
  },{passive:false});
  listen(grid,'keydown',event=>{
    const index=buttons.indexOf(document.activeElement);
    if(index<0||!['ArrowLeft','ArrowRight','Home','End'].includes(event.key))return;
    event.preventDefault();event.stopPropagation();
    navGoal=null;
    const target=event.key==='Home'?0:event.key==='End'?buttons.length-1:Math.max(0,Math.min(buttons.length-1,index+(event.key==='ArrowRight'?1:-1)));
    buttons[target].focus({preventScroll:true});buttons[target].scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest',inline:'nearest'});
  });
  listen(grid,'focusin',event=>{
    if(event.target.matches('.boot-mode')){event.target.scrollIntoView({behavior:reduced.matches?'instant':'smooth',block:'nearest',inline:'nearest'});posterLayers?.setActive(event.target);}
  });
  listen(grid,'focusout',()=>{if(!grid.contains(document.activeElement))posterLayers?.setActive(null);});
  listen(grid,'pointerdown',event=>{
    navGoal=null;
    if(event.pointerType!=='mouse'||event.button!==0||suspended)return;
    drag={id:event.pointerId,x:event.clientX,scroll:grid.scrollLeft,moved:false};
  });
  listen(window,'pointermove',event=>{
    if(!drag||event.pointerId!==drag.id)return;
    const delta=event.clientX-drag.x;
    if(Math.abs(delta)>8)drag.moved=true;
    if(drag.moved){grid.style.scrollSnapType='none';grid.scrollLeft=drag.scroll-delta;resetHover();}
  });
  const endDrag=()=>{
    if(drag?.moved){suppressClick=true;setTimeout(()=>{suppressClick=false;},0);}
    drag=null;grid.style.removeProperty('scroll-snap-type');
  };
  listen(window,'pointerup',endDrag);listen(window,'pointercancel',endDrag);
  listen(window,'blur',()=>{endDrag();halo.classList.remove('is-visible','is-down');resetHover();});
  listen(grid,'click',event=>{if(suppressClick){event.preventDefault();event.stopImmediatePropagation();}},{capture:true});
  const frame=()=>{
    raf=0;if(dead||suspended||document.hidden)return;
    x+=(tx-x)*.34;y+=(ty-y)*.34;halo.style.transform=`translate3d(${x}px,${y}px,0)`;
    if(Math.abs(tx-x)+Math.abs(ty-y)>.1)raf=requestAnimationFrame(frame);
  };
  const shineOnEntry=(button,event,fromX,fromY)=>{
    if(!button||reduced.matches||drag?.moved)return;
    const b=button.getBoundingClientRect(),cx=event.clientX,cy=event.clientY;
    const dx=cx-fromX,dy=cy-fromY,hits=[];
    // Resolve the actual crossed edge, even when a fast pointer skips a few pixels.
    if(fromX!==null&&fromY!==null){
      for(const [side,edge,horizontal] of [['left',b.left,true],['right',b.right,true],['top',b.top,false],['bottom',b.bottom,false]]){
        const delta=horizontal?dx:dy;if(Math.abs(delta)<.001)continue;
        const t=(edge-(horizontal?fromX:fromY))/delta,other=(horizontal?fromY:fromX)+t*(horizontal?dy:dx);
        if(t>=0&&t<=1&&other>=(horizontal?b.top:b.left)-1&&other<=(horizontal?b.bottom:b.right)+1)hits.push({side,t});
      }
    }
    const nearest=[['left',Math.abs(cx-b.left)/b.width],['right',Math.abs(b.right-cx)/b.width],['top',Math.abs(cy-b.top)/b.height],['bottom',Math.abs(b.bottom-cy)/b.height]].sort((a,b)=>a[1]-b[1])[0][0];
    button.dataset.shineFrom=hits.sort((a,b)=>a.t-b.t)[0]?.side||nearest;
    button.classList.add('is-shining');
  };
  listen(root,'pointermove',event=>{
    if(event.pointerType==='touch'||suspended)return;
    tx=event.clientX;ty=event.clientY;
    const fromX=px,fromY=py;px=tx;py=ty;
    if(!located){x=tx;y=ty;located=true;}
    halo.classList.add('is-visible');if(!raf)raf=requestAnimationFrame(frame);
    const button=event.target.closest('.boot-mode');
    if(hover!==button){resetHover();hover=button;shineOnEntry(button,event,fromX,fromY);}
    posterLayers?.setActive(button);
    halo.classList.toggle('is-over',!!event.target.closest('button'));
    halo.classList.toggle('is-red',button?.dataset.mode==='troll');
    if(button&&!reduced.matches&&!drag?.moved){
      const b=button.getBoundingClientRect(),u=(event.clientX-b.left)/b.width-.5,v=(event.clientY-b.top)/b.height-.5;
      button.style.setProperty('--tilt-x',(-v*4).toFixed(2)+'deg');button.style.setProperty('--tilt-y',(u*5).toFixed(2)+'deg');
      button.style.setProperty('--art-x',(u*5).toFixed(1)+'px');button.style.setProperty('--art-y',(v*5).toFixed(1)+'px');
    }
  });
  listen(root,'pointerleave',()=>{halo.classList.remove('is-visible');px=py=null;resetHover();});
  listen(root,'pointerdown',event=>{
    halo.classList.add('is-down');
    const b=event.target.closest('.boot-mode');if(!b||reduced.matches||suspended)return;
    let ripple=b.querySelector('.boot-press-ripple');if(!ripple){ripple=document.createElement('span');ripple.className='boot-press-ripple';b.appendChild(ripple);}
    ripple.getAnimations().forEach(a=>a.cancel());
    ripple.animate([{opacity:.8,transform:'scale(.93)'},{opacity:0,transform:'scale(1.02)'}],{duration:480,easing:'ease-out'});
  });
  listen(window,'pointerup',()=>halo.classList.remove('is-down'));
  const suspend=()=>{suspended=true;posterLayers?.suspend();root.classList.add('boot-gallery-suspended');halo.classList.remove('is-visible');cancelAnimationFrame(raf);raf=0;resetHover();};
  const resume=()=>{suspended=false;posterLayers?.resume();root.classList.remove('boot-gallery-suspended');update();};
  listen(document,'visibilitychange',()=>{if(document.hidden)suspend();else if(picker.getAttribute('aria-busy')!=='true')resume();});
  const observer=new ResizeObserver(update);observer.observe(grid);update();
  current={suspend,resume,snapshot:()=>posterLayers?.snapshot()||null,destroy(){
    if(dead)return;dead=true;suspend();posterLayers?.destroy();abort.abort();observer.disconnect();halo.remove();decor.remove();
    root.classList.remove('boot-gallery-suspended');grid.style.removeProperty('scroll-snap-type');current=null;
  }};
  return current;
}
window.ElementalBootGallery=Object.freeze({mount,destroy:()=>current?.destroy(),snapshot:()=>current?.snapshot()||null});
})();
