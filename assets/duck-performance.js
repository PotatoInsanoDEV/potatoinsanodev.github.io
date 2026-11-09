// Read-only presentation state. Never writes to the simulation or original pose rig.
let scene={active:false,time:0,idle:0,vx:0,vy:0,grounded:true,aim:false,aimTime:0,charge:0,win:0,landing:0};
const clamp=x=>Math.max(0,Math.min(1,x));
const pulse=(t,start,duration)=>t>=start&&t<start+duration?Math.sin((t-start)/duration*Math.PI):0;
export function updateDuckScene(body,aim,phase,dt,active=true){
 dt=Math.max(0,Math.min(.05,dt));
 const ground=!!body.grounded,reset=!active||!scene.active||Math.hypot(body.x-(scene.x??body.x),body.y-(scene.y??body.y))>350;
 const idle=active&&phase==='play'&&ground&&!aim&&Math.hypot(body.vx,body.vy)<12;
 scene={active,time:reset?0:scene.time+dt,idle:idle?(reset?0:scene.idle+dt):0,vx:body.vx,vy:body.vy,grounded:ground,aim:!!aim,aimTime:aim?(reset?0:scene.aimTime+dt):0,charge:clamp(Number(aim?.power)||0),
  win:active&&phase==='exit'?(reset?0:scene.win+dt):0,landing:!reset&&ground&&!scene.grounded?.22:Math.max(0,scene.landing-dt),x:body.x,y:body.y,aimDx:aim?(Number(aim.dx)||0):0,aimDy:aim?(Number(aim.dy)||0):0};
}
export function duckPreviewPose(time,mode='idle',reduced=false){
 const t=reduced?({jump:.55,attack:.3,aim:1,victory:.8}[mode]||0):time,u=t%2.6,jump=mode==='jump'?Math.sin(Math.min(1,u/1.45)*Math.PI):0;
 return {kind:'hero',x:0,y:-jump*20,rot:mode==='attack'?-.15*Math.sin(t*5):0,sx:1,sy:1,scale:1,alpha:1,facing:1,stretch:1,stretchA:0,
  hfx:25,hfy:11,hbx:-25,hby:11,ffx:11+ jump*4,ffy:20-jump*6,fbx:-11-jump*3,fby:20-jump*9,
  drawn:mode==='attack'?1:0,blade:mode==='attack'?-.6+Math.sin(t*5)*1.4:-.3,lookX:0,lookY:0,brow:.12,
  blink:t%4.6>4.42?Math.sin((t%4.6-4.42)/.18*Math.PI):0,eyeWide:0,glow:0,smear:mode==='attack'?.8:0,
  pull:mode==='aim'?1:0,aimDx:mode==='aim'?Math.cos(Math.sin(t*.9)*1.05):0,aimDy:mode==='aim'?Math.sin(Math.sin(t*.9)*1.05):0,t,duckPreview:true,previewMode:mode,previewCharge:mode==='aim'?clamp(u/1.2):0,previewJump:jump};
}
export function characterPose(p,look,motion=true){
 if(p.duckStill||(!p.duckPreview&&!scene.active))return p;
 const preview=p.duckPreview,mode=p.previewMode||'idle',t=p.t||0;
 const idle=preview?(mode==='idle'?t:0):scene.idle,win=preview?(mode==='victory'?t%3.5:0):scene.win;
 const airborne=preview?(p.previewJump||0)>0:!scene.grounded;
 const aiming=preview?mode==='aim':scene.aim,rush=clamp(p.smear||0),cycle=idle%9;
 const adjust=motion?pulse(cycle,2.2,1.2):0,spin=motion&&cycle>=4.4&&cycle<5.8?(cycle-4.4)/1.4:0;
 const focus=aiming?.75+.25*Math.max(preview?p.previewCharge||0:scene.charge,preview?0:clamp(scene.aimTime/1.2)):rush*.9;
 const pose={...p,artAim:aiming,artFocus:focus,artRage:rush>.35,artHappy:win>0,artAir:airborne,artWin:win,artSmoke:0,artVanish:0,artSway:0,artParticles:false,artAmbient:!airborne&&rush<.2,artAdjust:adjust};
 if(motion){
  pose.artSway=Math.sin(t*5)*.5+(airborne?Math.max(-3,Math.min(3,(preview?-Math.cos(t*4)*140:scene.vy)*.008)):0);
  if(idle>0){pose.lookX=(p.lookX||0)+pulse(cycle,.5,1.4)*-1.4+pulse(cycle,6.5,1.4)*1;pose.hbx=(p.hbx??-25)*(1-adjust)+(-16)*adjust;pose.hby=(p.hby??11)*(1-adjust)+(-20)*adjust}
  if(spin>0){pose.drawn=1;pose.hfx=23;pose.hfy=4;pose.blade=(p.blade||0)+Math.PI*4*spin;pose.artSpin=true}
  if(!preview&&scene.landing>0)pose.artSway+=Math.sin(scene.landing/.22*Math.PI)*2;
  pose.artParticles=true;
 }
 if(aiming){const dx=preview?p.aimDx:scene.aimDx,dy=preview?p.aimDy:scene.aimDy;pose.pull=Math.max(.8,p.pull||0);pose.blink=0;pose.aimDx=dx;pose.aimDy=dy;pose.aimPow=Math.max(.35,preview?p.previewCharge||0:scene.charge);pose.artSway*=.4}
 if(motion){if(!preview&&scene.landing>0){const u=1-scene.landing/.22;pose.landU=u;pose.landSq=Math.pow(Math.max(0,1-u),1.25)}
  if(airborne&&!preview)pose.artFall=clamp(scene.vy/380)}
 if(win>0){
  pose.smear=0;pose.lookX=.2;pose.blink=0;
  if(['raven','moon','dune'].includes(look)){
   pose.hfx=5;pose.hfy=0;pose.hbx=-3;pose.hby=0;pose.drawn=0;
   if(motion){pose.artSmoke=clamp((win-.55)*2);pose.artVanish=clamp((win-1.05)*3)}
  }else if(['jade','tide','lotus'].includes(look)){
   pose.hfx=4;pose.hfy=-5;pose.hbx=-2;pose.hby=-6;pose.drawn=0;pose.artSeal=true;
  }else{pose.drawn=win<.65?1:0;pose.blade=-.8-clamp(win/.65)*1.8;pose.hfx=25-clamp(win/.65)*15;pose.hfy=11-clamp(win/.65)*5}
 }
 return pose;
}
export function drawPersonality(c,p,look,band,motion){
 if(!motion)return;
 const t=p.t||0;
 if(p.artParticles)for(let i=0,count=p.artAim?2:p.artAmbient?3:5;i<count;i++){
  const u=(t*(p.artAmbient?.36:.8)+i/count)%1,x=-26-u*29,y=5+Math.sin(t*2+i)*8-u*23;
  c.save();c.globalAlpha*=Math.sin(u*Math.PI)*(p.artAim?.6:.85);c.translate(x,y);c.rotate(Math.sin(t*2+i)*.7-u);
  const color=({raven:'#8999c0',moon:'#e3c9ff',jade:'#99e2a1',lotus:'#ffc2df',dune:'#e4c591',silver:'#cbe8ff',sun:'#ffe3a0',storm:'#89e5ff',tide:'#9cedea',dawn:'#b8f6ff'})[look]||band;
  c.fillStyle=color;c.strokeStyle=color;c.lineWidth=1.1;
  c.beginPath();
  if(look==='moon'){c.arc(0,0,4,-1.4,1.4);c.stroke()}
  else if(['raven','jade','lotus'].includes(look)){c.ellipse(0,0,look==='raven'?5.5:4.3,look==='lotus'?2.7:1.9,0,0,Math.PI*2);c.fill();c.strokeStyle=band;c.beginPath();c.moveTo(-4,0);c.lineTo(4,0);c.stroke()}
  else if(look==='storm'){c.moveTo(1,-4);c.lineTo(-2,0);c.lineTo(1,0);c.lineTo(-1,4);c.stroke()}
  else if(look==='tide'){c.moveTo(0,-4);c.quadraticCurveTo(-5,1,0,3);c.quadraticCurveTo(5,1,0,-4);c.fill()}
  else{c.moveTo(0,-3);c.lineTo(2.4,0);c.lineTo(0,3);c.lineTo(-2.4,0);c.closePath();c.fill()}
  c.restore();
 }
 {const acc=({raven:'#8999c0',moon:'#e3c9ff',jade:'#99e2a1',lotus:'#ffc2df',dune:'#e4c591',silver:'#cbe8ff',sun:'#ffe3a0',storm:'#89e5ff',tide:'#9cedea',dawn:'#b8f6ff',gold:'#ffd23a',cosmic:'#ff9cf0',royal:'#ffd23a',blackdragon:'#b06bff'})[look]||band;const r=clamp(p.smear||0);if(r>.22){c.save();c.lineCap='round';for(let i=0;i<6;i++){const y=-16+i*8.5,len=16+r*38+(i*7%11),x0=-20-(i%3)*3;c.globalAlpha=.6*r;c.strokeStyle=i%2?acc:'#ffffff';c.lineWidth=2.4-(i%2)*.7;c.beginPath();c.moveTo(x0,y);c.lineTo(x0-len,y+(i-2.5)*1.4);c.stroke()}
  if(p.drawn){const a=p.blade||0;for(const [w,col,al] of [[7,acc,.55],[2.6,'#ffffff',.9]]){c.globalAlpha=al*r;c.strokeStyle=col;c.lineWidth=w*r+1;c.beginPath();c.arc(12,4,36,a-1.45,a+.05);c.stroke()}}c.restore()}}
 if(p.landU>0){const u=p.landU;c.save();c.fillStyle='#e6edf4';for(let i=0;i<6;i++){const sg=i%2?1:-1,d=(6+u*(16+(i>>1)*8))*sg;c.globalAlpha=(1-u)*.65;c.beginPath();c.arc(d,25-(i>>1)*u*3,2.6+u*3.6-(i>>1)*.6,0,Math.PI*2);c.fill()}c.restore()}
 if(p.artSmoke>0)for(let i=0;i<8;i++){
  const u=p.artSmoke;c.save();c.globalAlpha*=(1-u*.55)*.65;c.fillStyle='#b4b5cb';c.beginPath();c.arc(Math.cos(i*2.4)*(8+u*26),5+Math.sin(i*2.4)*(8+u*16)-u*12,3+u*9,0,Math.PI*2);c.fill();c.restore();
 }
}

// Velocidade atual do herói (só leitura), usada no movimento secundário de faixas e cabelo.
export function duckMotion(){return scene}
