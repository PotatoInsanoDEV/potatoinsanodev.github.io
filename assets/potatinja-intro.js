// Potatinja — abertura do menu: a batata pendura na borda da tela, joga 3 shurikens no logo,
// desce e corta o logo num dash. O logo racha, arranha, balança e se recompõe.
// Só visual: não toca na simulação. Toca sons sintetizados de potatinja-ui.js (window.potatinjaSFX).
import {drawPotato} from './duck-potato.js';
const ease=t=>1-Math.pow(1-t,3),clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
let playing=false,lastPlay=-1e9;
const reduced=()=>{const m=document.getElementById('sMotion');return !!(m&&m.checked)||matchMedia('(prefers-reduced-motion: reduce)').matches};
const sfx=n=>{try{window.potatinjaSFX&&window.potatinjaSFX[n]&&window.potatinjaSFX[n]()}catch{}};
function basePose(){return {kind:'hero',x:0,y:0,rot:0,sx:1,sy:1,stretch:1,stretchA:0,facing:1,scale:1,alpha:1,lookX:0,lookY:0,blink:0,brow:.12,eyeGlow:0,eyeWide:0,drawn:0,blade:-.3,hfx:25,hfy:11,hbx:-25,hby:11,ffx:11,ffy:20.5,fbx:-11,fby:20.5,glow:0,smear:0,hat:0,mark:0,hairX:0,hairY:0,bare:false,variant:0,pull:0,mood:0,t:0,duckPreview:true}}
const STAR='<svg viewBox="0 0 40 40" width="40" height="40"><path d="M20 2l4.6 13.4L38 20l-13.4 4.6L20 38l-4.6-13.4L2 20l13.4-4.6z" fill="#eef4fa" stroke="#10202c" stroke-width="3.2" stroke-linejoin="round"/><circle cx="20" cy="20" r="3.6" fill="#1d2a38"/></svg>';
function el(tag,css,parent,html){const e=document.createElement(tag);e.style.cssText=css||'';if(html)e.innerHTML=html;(parent||document.body).append(e);return e}

function playIntro(){
 if(playing||reduced())return;
 const logo=document.querySelector('#ui .title .potatinja-logo');const title=logo&&logo.closest('.title');
 if(!logo||!title||title.hidden||!logo.getClientRects().length){return}
 const hud=document.querySelector('#ui .hud');if(hud&&!hud.hidden)return;
 const lb=logo.getBoundingClientRect();if(lb.width<80)return;
 playing=true;lastPlay=performance.now();
 // a batata do menu (a que está no chão) é a protagonista da intro: usa a skin equipada e a mesma posição/tamanho
 const bt=globalThis.__bt||{},outfit=(bt.outfit&&bt.outfit())||{};
 const hd=globalThis.__heroDraw,gc=document.getElementById('game');
 let hx=innerWidth*.8,hy=innerHeight-60,hsc=0;
 if(hd&&gc&&performance.now()-hd.t<800){const r=gc.getBoundingClientRect(),k=r.width/gc.width;hx=r.left+hd.x*k;hy=r.top+hd.y*k;hsc=hd.sx*k}
 globalThis.__hideHero=true;
 const W=innerWidth,H=innerHeight,dpr=Math.min(2,devicePixelRatio||1);
 const box=el('div','position:fixed;inset:0;z-index:60;pointer-events:none;overflow:hidden',document.body);
 const cv=el('canvas','position:absolute;inset:0;width:100%;height:100%',box);cv.width=W*dpr;cv.height=H*dpr;const c=cv.getContext('2d');
 const S=clamp(lb.height/46,1.5,3.1),wallX=18*S,hangY=Math.max(60*S,lb.top-6*S),landY=Math.min(H-40*S,lb.bottom+26*S);
 // linha do corte: de baixo-esquerda para cima-direita, atravessando o logo
 const sx0=lb.left-46,sy0=lb.top+lb.height*.86,sx1=lb.right+60,sy1=lb.top+lb.height*.12;
 const targets=[.2,.5,.8].map(k=>({x:lb.left+lb.width*k,y:lb.top+lb.height*(.3+.35*Math.abs(k-.5))}));
 const HS=hsc>0.3?hsc:S,T0=performance.now(),stars=[];let raw=0,landed=false,returned=false,thrown=0,cut=false,hit=[false,false,false],finished=false;
 const shake=(amp,ms)=>{const t=performance.now();logo.style.willChange='transform';const f=()=>{const u=(performance.now()-t)/ms;if(u>=1){logo.style.transform='';return}
   logo.style.transform=`translate(${(Math.random()-.5)*amp*(1-u)}px,${(Math.random()-.5)*amp*(1-u)}px) rotate(${(Math.random()-.5)*amp*.15*(1-u)}deg)`;requestAnimationFrame(f)};f()};
 function spark(x,y,n=8,col='#fff5c2'){for(let i=0;i<n;i++){const a=Math.random()*6.28,v=40+Math.random()*90,p=el('i',`position:absolute;left:${x}px;top:${y}px;width:4px;height:4px;border-radius:50%;background:${col};box-shadow:0 0 8px ${col};transition:transform .45s cubic-bezier(.1,.8,.3,1),opacity .45s;opacity:1`,box);
   requestAnimationFrame(()=>{p.style.transform=`translate(${Math.cos(a)*v}px,${Math.sin(a)*v+20}px) scale(.2)`;p.style.opacity='0'});setTimeout(()=>p.remove(),520)}}
 function scratch(x,y,ang,len,delay){const s=el('i',`position:absolute;left:${x}px;top:${y}px;width:${len}px;height:3px;transform-origin:0 50%;transform:rotate(${ang}rad) scaleX(0);background:linear-gradient(90deg,#fff,#fff0);box-shadow:0 0 10px #ffd27a;border-radius:3px;transition:transform .12s ease-out ${delay}ms,opacity .6s ease ${delay+260}ms;opacity:1`,box);
   requestAnimationFrame(()=>{s.style.transform=`rotate(${ang}rad) scaleX(1)`;setTimeout(()=>{s.style.opacity='0'},20)});setTimeout(()=>s.remove(),1400)}
 function throwStar(i,ox,oy){const tg=targets[i];sfx('whoosh');stars.push({x0:ox,y0:oy,x1:tg.x,y1:tg.y,t0:performance.now(),i,el:el('i','position:absolute;left:0;top:0;will-change:transform',box,STAR),stuck:false})}
 function doCut(){
  cut=true;sfx('slash');
  const ang=Math.atan2(sy1-sy0,sx1-sx0),len=Math.hypot(sx1-sx0,sy1-sy0);
  // rastro do corte
  const sl=el('i',`position:absolute;left:${sx0}px;top:${sy0}px;width:${len}px;height:8px;margin-top:-4px;transform-origin:0 50%;transform:rotate(${ang}rad) scaleX(0);background:linear-gradient(90deg,#fff0,#fff 20%,#fff 80%,#fff0);box-shadow:0 0 22px #ffffff,0 0 40px #54e6d2;border-radius:8px;transition:transform .16s ease-out,opacity .5s ease .12s`,box);
  requestAnimationFrame(()=>{sl.style.transform=`rotate(${ang}rad) scaleX(1)`;setTimeout(()=>sl.style.opacity='0',20)});setTimeout(()=>sl.remove(),900);
  // arranhões paralelos
  for(let k=1;k<=3;k++)scratch(sx0+(k*7),sy0+(k*5)-12,ang,len*(.55+k*.1),k*35);
  // logo dividido em duas metades ao longo da linha
  const a=(sy0-lb.top)/lb.height*100,b=(sy1-lb.top)/lb.height*100;
  const clipA=`polygon(-10% -10%,110% -10%,110% ${b}%,-10% ${a}%)`,clipB=`polygon(-10% ${a}%,110% ${b}%,110% 110%,-10% 110%)`;
  const nx=Math.sin(ang),ny=-Math.cos(ang);
  const mk=(clip,dir)=>{const im=new Image();im.src=logo.currentSrc||logo.src;im.style.cssText=`position:absolute;left:${lb.left}px;top:${lb.top}px;width:${lb.width}px;height:${lb.height}px;clip-path:${clip};transform-origin:50% 50%;will-change:transform;filter:drop-shadow(0 0 6px #fff)`;box.append(im);return {im,dir}};
  const halves=[mk(clipA,1),mk(clipB,-1)];logo.style.visibility='hidden';
  const t0=performance.now();
  (function anim(){const u=(performance.now()-t0)/1250;
   if(u>=1){halves.forEach(h=>h.im.remove());logo.style.visibility='';box.querySelectorAll('.pn-halves').forEach(n=>n.remove());return}
   // separa rápido, balança, volta com mola
   const sep=u<.18?ease(u/.18):Math.max(0,1-ease((u-.18)/.7)),wob=Math.sin(u*26)*(1-u)*2;
   halves.forEach(h=>{const d=sep*14*h.dir;h.im.style.transform=`translate(${nx*d*-1+wob*h.dir}px,${ny*d*-1}px) rotate(${sep*2.2*h.dir}deg)`;h.im.style.filter=`drop-shadow(0 0 ${6+sep*10}px #ffffff)`});
   requestAnimationFrame(anim)})();
  spark(lb.left+lb.width*.5,lb.top+lb.height*.5,16,'#ffffff');shake(10,320);
  stars.forEach((s,i)=>{s.cutAt=performance.now()+i*40;s.dir=i%2?1:-1})}
 const ringY=hangY-4*HS,ringX=30*HS,L=36*HS; // kunai cravada na borda da tela: a batata se pendura no anel
 const kn={on:false,fly:false,t0:0};
 const live=()=>{const h=globalThis.__heroDraw;if(h&&gc&&performance.now()-h.t<800){const r=gc.getBoundingClientRect(),k=r.width/gc.width;return {x:r.left+h.x*k,y:r.top+h.y*k}}return {x:hx,y:hy}};
 const lerp=(a,b,k)=>a+(b-a)*k,sm=k=>k*k*(3-2*k),inq=k=>k*k,outq=k=>1-(1-k)*(1-k);
 const TT=[2.25,2.75,3.25],T_RUN=1.0,T_CRO=1.2,T_LEAP=1.8,T_HANG=3.7,T_FALL=4.05,T_DASH=4.5,T_RET=5.7,T_END=6.0;
 let tossed=[false,false,false],lastDust=0,dir=1;
 function drawKunai(x,y,ang){c.save();c.translate(x,y);c.rotate(ang||0);c.scale(HS,HS);c.lineJoin='round';
  c.fillStyle='#d5dde3';c.strokeStyle='#10202c';c.lineWidth=2;c.beginPath();c.moveTo(-34,0);c.lineTo(-8,-6);c.lineTo(8,-3.5);c.lineTo(8,3.5);c.lineTo(-8,6);c.closePath();c.fill();c.stroke();
  c.fillStyle='#6b3a14';c.fillRect(8,-3.5,14,7);c.strokeRect(8,-3.5,14,7);c.beginPath();c.arc(29,0,7,0,6.283);c.lineWidth=3.4;c.strokeStyle='#10202c';c.stroke();c.lineWidth=1.8;c.strokeStyle='#e9eef2';c.stroke();c.restore()}
 function frame(now){
  const t=raw=(now-T0)/1000;c.setTransform(dpr,0,0,dpr,0,0);c.clearRect(0,0,W,H);
  let x=hx,y=hy,p=basePose();p.t=raw;p.simNow=raw;let ghost=false;
  const lv=live();
  if(raw<T_CRO){ // vira para a esquerda e corre (aceleração e freada suaves)
   const k=clamp((raw-.12)/(T_RUN-.12)),gx=ringX+110*HS;dir=-1;const e=sm(k);x=lerp(hx,gx,e);y=hy;
   const dist=Math.abs(x-hx),ph=dist/(20*HS)*Math.PI,sw=Math.sin(ph),spd=Math.sin(k*Math.PI);
   if(raw<.12){p.sy=.97;p.hbx=-18;p.hfx=16}else if(raw<T_RUN){
    p.hfx=14-sw*13*spd;p.hfy=10;p.hbx=-14+sw*13*spd;p.hby=10;p.ffx=11+sw*13*spd;p.ffy=20.5-Math.max(0,sw)*7*spd;p.fbx=-11-sw*13*spd;p.fby=20.5-Math.max(0,-sw)*7*spd;p.rot=.16*spd;y-=Math.abs(Math.sin(ph))*3.5*HS*spd;p.smear=.5*spd;
    if(now-lastDust>110&&spd>.25){lastDust=now;spark(x+6*HS,y+20*HS,2,'#d9cfbb')}if(Math.floor(ph/Math.PI)!==tossed.step){tossed.step=Math.floor(ph/Math.PI);if(spd>.2)sfx('tick')}}
   else{p.sy=.86+.14*0;p.rot=.1} // fim da corrida: já entra em agachamento
   if(raw>=T_RUN){const u=clamp((raw-T_RUN)/(T_CRO-T_RUN)),q=Math.sin(u*Math.PI/2);p.sy=1-.16*q;p.sx=1+.1*q;y+=4*HS*q;p.hbx=-20;p.hby=14;p.hfx=-8;p.hfy=14;p.rot=.2*q}
  }
  else if(raw<T_LEAP){ // salto em parábola até a parede; joga a kunai no meio do salto
   const k=(raw-T_CRO)/(T_LEAP-T_CRO),gx=ringX+110*HS;dir=-1;
   const tx=ringX+4*HS,ty=ringY+L;x=lerp(gx,tx,outq(k)*.5+k*.5);y=lerp(hy,ty,k)-Math.sin(k*Math.PI)*H*.17;
   const rise=k<.5;p.sy=rise?1.1:1.0;p.sx=rise?.94:1;p.stretch=1;
   p.rot=(k<.85?Math.sin(k/.85*Math.PI/2)*Math.PI*2:Math.PI*2)*-1; // pirueta
   p.hfx=rise?18:6;p.hfy=rise?-26:-30;p.hbx=-12;p.hby=-28;p.ffx=10;p.ffy=12;p.fbx=-8;p.fby=14;
   if(k>.34&&!kn.on){kn.on=true;kn.fly=true;kn.t0=now;kn.sx=x-14*HS;kn.sy=y-18*HS;sfx('whoosh')}
   if(k>.86){p.rot=0;p.hbx=-6;p.hby=-33;p.hfx=8;p.hfy=-30}
  }
  else if(raw<T_HANG){ // pendurado na kunai: balanço de pêndulo + arremessos
   const u=raw-T_LEAP,A=.55*Math.exp(-u*1.25),th=A*Math.sin(u*5.2)+.05*Math.sin(u*2.3);dir=1;
   x=ringX+Math.sin(th)*L+8*HS;y=ringY+Math.cos(th)*L;p.rot=th*.9;p.hbx=-4;p.hby=-33;p.hfx=10;p.hfy=-31;
   p.ffx=8+Math.sin(u*5.2+1)*4;p.ffy=26;p.fbx=-8+Math.sin(u*5.2)*4;p.fby=27;p.lookX=1;p.artAim=1;p.pull=.3;
   for(let i=0;i<3;i++){const w=raw-TT[i];if(w>-.3&&w<.35){const g=clamp((w+.3)/.3);if(w<0){p.hfx=lerp(10,-6,sm(g));p.hfy=lerp(-31,-6,sm(g))}else{const f=clamp(w/.2);p.hfx=lerp(-6,36,outq(f));p.hfy=lerp(-6,4,f)}}
    if(!tossed[i]&&raw>=TT[i]){tossed[i]=true;throwStar(i,x+30*HS,y-8*HS)}}
  }
  else if(raw<T_FALL){ // solta a kunai e cai com gravidade
   const k=(raw-T_HANG)/(T_FALL-T_HANG),hx0=ringX+8*HS,hy0=ringY+L;dir=1;
   x=lerp(hx0,sx0,outq(k));y=lerp(hy0,sy0,inq(k));p.drawn=1;p.blade=.9;p.rot=.2*k;p.eyeWide=1;p.stretch=1+.12*k;p.hfx=14;p.hfy=-6;p.hbx=-16;p.hby=-4;p.ffx=6;p.ffy=24;p.fbx=-8;p.fby=26;
   if(kn.on&&k>.05)kn.fade=clamp(k*4);
  }
  else if(raw<T_DASH){ // dash cortando o logo
   const lk=clamp((raw-T_FALL)/(T_DASH-T_FALL)),e=sm(lk);dir=1;x=lerp(sx0,sx1,e);y=lerp(sy0,sy1,e);ghost=true;
   p.smear=1;p.drawn=1;p.blade=.4;p.artRage=1;p.rot=Math.atan2(sy1-sy0,sx1-sx0)*.4;p.hfx=30;p.hfy=-2;p.hbx=-20;p.hby=6;p.ffx=-6;p.ffy=22;p.fbx=-20;p.fby=18;
   if(!cut&&x>lb.left+lb.width*.1)doCut();
  }
  else if(raw<T_RET){ // volta pulando em arco e pousa onde a batata do menu está
   const k=(raw-T_DASH)/(T_RET-T_DASH),x0=sx1+40,y0=sy1;dir=-1;
   x=lerp(x0,lv.x,sm(k));y=lerp(y0,lv.y,inq(k)*.35+k*.65)-Math.sin(Math.min(1,k*1.05)*Math.PI)*H*.16;
   p.rot=k<.8?-Math.sin(k/.8*Math.PI/2)*Math.PI*2:0;p.drawn=k<.5?1:0;p.blade=.6;
   if(!returned&&k>0){returned=true;sfx('whoosh')}
   p.hfx=10;p.hfy=-10;p.hbx=-12;p.hby=-8;p.ffx=8;p.ffy=14+(k>.8?8:0);p.fbx=-8;p.fby=14+(k>.8?8:0);
   if(k>.88){const sq=Math.sin(clamp((k-.88)/.12)*Math.PI);p.sy=1-sq*.16;p.sx=1+sq*.1;if(!landed){landed=true;sfx('tap');spark(lv.x,lv.y+18*HS,8,'#d9cfbb')}}
  }
  else{x=lv.x;y=lv.y;dir=1}
  if(ghost){for(let i=1;i<=4;i++){c.save();c.globalAlpha=.1+i*.04;c.translate(x-i*28*S,y+(i*6));c.scale(HS,HS);c.translate(0,-22);drawPotato(c,{...p,artVanish:0},'cute',outfit,null);c.restore()}
   c.strokeStyle='#ffffffaa';c.lineWidth=3;for(let i=0;i<6;i++){const yy=y-26*S+i*10*S;c.beginPath();c.moveTo(Math.max(0,x-300-i*30),yy);c.lineTo(x-70,yy);c.stroke()}}
  // kunai (voando, cravada, some quando solta)
  if(kn.on){let kx=0,ky=ringY,ang=0,al=1;if(kn.fly){const f=clamp((now-kn.t0)/150);kx=lerp(kn.sx,0,f);ky=lerp(kn.sy,ringY,f);if(f>=1){kn.fly=false;sfx('hit');spark(2,ringY,6,'#fff5c2');shake(5,150)}}
   if(kn.fade!==undefined)al=1-kn.fade;if(al>0){c.save();c.globalAlpha=al;drawKunai(kx,ky,ang);c.restore()}}
  {c.save();c.translate(x,y);c.scale(dir,1);c.scale(HS,HS);c.translate(0,-22);try{drawPotato(c,p,'cute',outfit,null)}catch(e){}c.restore()}
  for(const s of stars){const k=clamp((now-s.t0)/240);let xx,yy,rot;
   if(!s.cutAt){xx=s.x0+(s.x1-s.x0)*k;yy=s.y0+(s.y1-s.y0)*k-Math.sin(k*Math.PI)*34*S;rot=now*1.6;
    if(k>=1&&!s.stuck){s.stuck=true;sfx('hit');spark(s.x1,s.y1,7);scratch(s.x1-18,s.y1-10+s.i*2,.6,36,0);scratch(s.x1-10,s.y1-14,.5,30,60);shake(6,180)}
    if(k>=1){xx=s.x1;yy=s.y1;rot=20+s.i*40}}
   else{const u=(now-s.cutAt)/1000;xx=s.x1+u*130*s.dir;yy=s.y1+u*u*800;rot=20+u*900;s.el.style.opacity=String(Math.max(0,1-u*1.4))}
   s.el.style.transform=`translate(${xx}px,${yy}px) translate(-50%,-50%) rotate(${rot}deg) scale(${S/2.2})`}
  const tt=document.querySelector('#ui .title'),hh=document.querySelector('#ui .hud'),gone=!tt||tt.hidden||!tt.getClientRects().length||(hh&&!hh.hidden);
  if(raw<T_END&&!gone)requestAnimationFrame(frame);else{finished=true;globalThis.__hideHero=false;box.remove();logo.style.visibility='';logo.style.transform='';playing=false}
 }
 requestAnimationFrame(frame);
 // segurança: nunca deixa o logo escondido
 setTimeout(()=>{if(!finished){globalThis.__hideHero=false;try{box.remove()}catch{}logo.style.visibility='';logo.style.transform='';playing=false}},12000);
}
// dispara quando o menu aparece
let shown=false;
function watch(){
 const t=document.querySelector('#ui .title');const hud=document.querySelector('#ui .hud');
 const vis=!!(t&&!t.hidden&&t.getClientRects().length&&getComputedStyle(t).visibility!=='hidden'&&(!hud||hud.hidden)&&!document.querySelector('#ui .sheet:not([hidden])')?.matches?.('.skins'));
 if(vis&&!shown&&performance.now()-lastPlay>45000)setTimeout(function go(){
   if(document.querySelector('.cs-splash'))return setTimeout(go,250); // espera a tela 'Criado por' terminar
   const t2=document.querySelector('#ui .title');if(!(t2&&!t2.hidden&&t2.getClientRects().length))return;
   const S=window.potatinjaSFX;
   if(S&&S.unlocked&&!S.unlocked()){ // navegador bloqueia som até o 1º toque: espera o toque para a intro ter som
     const once=()=>{removeEventListener('pointerdown',once,true);setTimeout(()=>{const t3=document.querySelector('#ui .title');if(t3&&!t3.hidden&&t3.getClientRects().length&&!playing)playIntro()},450)};
     addEventListener('pointerdown',once,true);return}
   playIntro()},1200);
 shown=vis}
const ui=document.getElementById('ui');
if(ui){new MutationObserver(()=>watch()).observe(ui,{subtree:true,attributes:true,attributeFilter:['class','hidden'],childList:true});setTimeout(watch,600)}
window.potatinjaIntro=playIntro;
