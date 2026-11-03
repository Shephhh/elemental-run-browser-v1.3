/* Reuses the REAL normal-run pause and level-result DOM, not a new menu theme. */
(function(g){'use strict';
class ObbyInterface{
 constructor(run,api){
  this.run=run;this.api=api;this.result=document.getElementById('level-complete-overlay');this.pause=document.getElementById('pause-screen');this.saved=new Map();
  this.nextButton=document.getElementById('level-next-btn');
  this.pause.addEventListener('click',e=>{
   if(!run.active||run.state!=='paused')return;const id=e.target.closest('button')?.id;
   if(id==='pause-continue-btn'||e.target===this.pause){e.preventDefault();e.stopImmediatePropagation();run.resume();}
   if(id==='pause-menu-btn'){e.preventDefault();e.stopImmediatePropagation();run.exit();}
  },true);
  this.result.addEventListener('click',e=>{
   if(!run.active||run.state!=='won')return;const id=e.target.closest('button')?.id;if(!['level-next-btn','level-upgrades-btn','level-menu-btn'].includes(id))return;
   e.preventDefault();e.stopImmediatePropagation();api.interaction?.();
   if(id==='level-next-btn'){api.lock();run.next();}
   if(id==='level-upgrades-btn'){run.next(true);}
   if(id==='level-menu-btn')run.exit();
  },true);
 }
 matchHUD(){
  const copy=(source,target,keys)=>{if(!source||!target)return;const c=getComputedStyle(source);for(const k of keys)target.style.setProperty(k,c.getPropertyValue(k));};
  const panel=['background','border','border-radius','box-shadow','backdrop-filter','color','font-family','font-weight'];
  copy(document.getElementById('ui'),this.run.ui.querySelector('.obby-stats'),panel);
  copy(document.getElementById('level-run-hud'),this.run.ui.querySelector('.obby-route'),panel);
  for(const [source,target]of [['score-container','[data-stat=time]'],['coin-container','[data-stat=gold]'],['speed-indicator','[data-stat=speed]']])copy(document.getElementById(source),this.run.ui.querySelector(target),['color','font-size','font-family','font-weight','line-height','text-shadow']);
 }
 remember(node,content=true){if(node&&!this.saved.has(node))this.saved.set(node,{html:content?node.innerHTML:null,hidden:node.hidden,style:node.getAttribute('style'),aria:node.getAttribute('aria-label'),disabled:node.disabled});return node;}
 field(selector,html){const node=this.remember(this.result.querySelector(selector));if(node)node.innerHTML=html;return node;}
 hide(){
  if(this.run.active||this.ownsPause||this.ownsResult)this.api.pauseUI?.(false);this.ownsPause=false;const tools=this.run.ui.querySelector('.party-round-tools')||this.pause.querySelector('.party-round-tools');if(tools){tools.classList.remove('in-pause');this.run.ui.appendChild(tools);}if(!this.ownsResult)return;
  for(const [node,s]of this.saved){if(s.html!==null)node.innerHTML=s.html;node.hidden=s.hidden;if('disabled'in node)node.disabled=s.disabled;if(s.style===null)node.removeAttribute('style');else node.setAttribute('style',s.style);if(s.aria===null)node.removeAttribute('aria-label');else node.setAttribute('aria-label',s.aria);}
  this.saved.clear();this.result.className=this.oldClass;this.result.hidden=this.oldHidden;this.result.setAttribute('aria-hidden',this.oldAria||'true');this.ownsResult=false;
 }
 showPause(){this.hide();this.ownsPause=true;this.api.pauseUI?.(true,{time:this.run.format(this.run.clock.seconds()),coins:this.api.wallet?.()||0,controls:this.run.ui.querySelector('[data-hint]').textContent});const tools=this.run.ui.querySelector('.party-round-tools'),anchor=this.pause.querySelector('#pause-menu-btn');if(tools&&anchor){tools.classList.add('in-pause');anchor.before(tools);}}
 showResult(){
  this.hide();this.oldClass=this.result.className;this.oldAria=this.result.getAttribute('aria-hidden');this.oldHidden=this.result.hidden;this.result.hidden=false;this.ownsResult=true;
  for(const selector of ['.level-complete-ghost-times','.level-finish-wallet','.level-celebration-confetti','.level-complete-coins','.level-complete-rank']){const n=this.remember(this.result.querySelector(selector));if(n)n.style.display='none';}
  this.field('.level-complete-title',this.api.tr(this.run.qualified?'partyQualified':'gameOver'));
  this.field('.level-complete-kicker',this.api.tr('level')+' '+this.run.level+' · '+this.api.tr(this.run.data.nameKey));
  this.field('.level-complete-reward','<strong>+'+(this.run.rewardCoins||0)+' ◇</strong>');
  this.field('.level-complete-best','<strong>'+this.run.format(this.run.clock.seconds())+'</strong>');
  for(const [id,key]of [['level-next-btn','obbyNext'],['level-upgrades-btn','surfRestart'],['level-menu-btn','surfLobby']]){const b=this.remember(document.getElementById(id));b.innerHTML='<span>'+this.api.tr(key)+'</span>';b.hidden=id==='level-next-btn'&&(this.run.level>=(this.run.roundCount||g.ElementalObbyCourse.ROUND_COUNT)||!this.run.qualified);if(b.hidden)b.style.display='none';}
  if(this.run.level>=(this.run.roundCount||g.ElementalObbyCourse.ROUND_COUNT)||!this.run.qualified){const actions=this.remember(this.result.querySelector('.level-complete-actions'),false);actions.style.setProperty('grid-template-columns','1fr 1fr','important');}
  this.result.classList.remove('is-tutorial-complete','is-run-failed');this.result.classList.add('is-visible');this.result.setAttribute('aria-hidden','false');
 }
 busy(value){this.nextButton.disabled=value;}
}
g.ElementalObbyInterface=ObbyInterface;
})(window);
