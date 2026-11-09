// Potatinja — banner animado do Kit Dragão Negro no menu (oferta de 1ª recarga). Só cosmético.
import {drawPotato} from './duck-potato.js';
import {drawPet} from './potatinja-shop.js';
const pose=t=>({kind:'hero',x:0,y:0,rot:0,sx:1,sy:1,stretch:1,stretchA:0,facing:1,scale:1,alpha:1,lookX:0,lookY:0,blink:0,brow:.12,eyeGlow:0,eyeWide:0,drawn:0,blade:-.3,hfx:25,hfy:11,hbx:-25,hby:11,ffx:11,ffy:20.5,fbx:-11,fby:20.5,glow:0,smear:0,hat:0,mark:0,hairX:0,hairY:0,bare:false,variant:0,pull:0,mood:0,t,duckPreview:true});
const shop=()=>window.potatinjaShop;
let btn=null,cv=null,raf=0,parts=[];
function build(){
 btn=document.createElement('button');btn.id='pnKit';btn.type='button';btn.hidden=true;btn.setAttribute('aria-label','Kit Dragão Negro');
 btn.innerHTML='<i class="rb">1ª RECARGA</i><canvas width="240" height="190"></canvas><span class="t">DRAGÃO NEGRO</span><span class="it">Skin Ascendida + Adaga + Pet</span><span class="pr"><s>R$ 60</s><b></b></span>';
 document.body.append(btn);cv=btn.querySelector('canvas');
 ['pointerdown','touchstart'].forEach(n=>btn.addEventListener(n,e=>e.stopPropagation(),{passive:true}));
 btn.addEventListener('click',()=>{try{window.potatinjaSFX?.tap?.()}catch{}shop()?.openTab?.('gems')});
}
function draw(now){
 raf=requestAnimationFrame(draw);if(btn.hidden||document.hidden||now-(draw.l||0)<30)return;draw.l=now;
 const t=now/1000,c=cv.getContext('2d'),W=cv.width,H=cv.height;c.clearRect(0,0,W,H);
 const bg=c.createRadialGradient(W*.5,H*.7,5,W*.5,H*.7,W*.7);bg.addColorStop(0,'#5a1fb0');bg.addColorStop(.5,'#1c0c36');bg.addColorStop(1,'#07040c');c.fillStyle=bg;c.fillRect(0,0,W,H);
 if(parts.length<26&&Math.random()<.6)parts.push({x:W*.5+(Math.random()-.5)*80,y:H*.95,vx:(Math.random()-.5)*14,vy:-(40+Math.random()*50),l:0,m:.7+Math.random()*.6,r:8+Math.random()*10});
 for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l+=1/30;if(p.l>p.m){parts.splice(i,1);continue}p.x+=p.vx/30;p.y+=p.vy/30;const u=p.l/p.m;
  c.globalAlpha=(1-u)*.85;c.fillStyle='#0a0610';c.beginPath();c.arc(p.x,p.y,p.r*(1-u*.4),0,6.283);c.fill();c.globalCompositeOperation='lighter';c.globalAlpha=(1-u)*.3;c.fillStyle='#8a2cff';c.beginPath();c.arc(p.x,p.y-3,p.r*.6,0,6.283);c.fill();c.globalCompositeOperation='source-over'}
 c.globalAlpha=1;
 c.save();c.translate(W*.42,H*.86);c.scale(1.85,1.85);c.shadowColor='#b36bff';c.shadowBlur=6;try{drawPotato(c,pose(t),'cute',{hairStyle:12},null)}catch{}c.restore();
 drawPet(c,'drago',W*.7,H*.3+Math.sin(t*3)*4,t,1.35);
}
function tick(){
 if(!btn)return;const s=shop();
 const title=document.querySelector('#ui .title'),hud=document.querySelector('#ui .hud'),sheet=document.querySelector('#ui .sheet:not([hidden])'),shopOpen=document.querySelector('.pn-shop:not([hidden])'),splash=document.querySelector('.cs-splash');
 const mb=document.querySelector('#ui .title .pn-rank-btn'),menuOn=!!(mb&&mb.getClientRects().length&&getComputedStyle(mb).visibility!=='hidden'&&+getComputedStyle(mb).opacity>.5);
 const on=menuOn&&!!(s&&s.kitOwned&&!s.kitOwned()&&title&&!title.hidden&&title.getClientRects().length&&(!hud||hud.hidden)&&!sheet&&!shopOpen&&!splash&&!(window.potatinjaSFX?.unlocked&&!window.potatinjaSFX.unlocked()));
 if(on){btn.querySelector('.pr b').textContent=s.kitPrice();btn.hidden=false;requestAnimationFrame(()=>btn.classList.remove('off'))}
 else if(!btn.hidden){btn.classList.add('off');setTimeout(()=>{if(btn.classList.contains('off'))btn.hidden=true},260)}
}
build();raf=requestAnimationFrame(draw);setInterval(tick,400);
