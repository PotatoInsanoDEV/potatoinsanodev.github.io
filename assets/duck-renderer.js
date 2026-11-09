import {characterPose,drawPersonality} from './duck-performance.js';
import {drawPotato} from './duck-potato.js';
import {drawVeggie} from './duck-veggies.js';
import {duckSettings} from './duck-settings.js';
// New duck character artwork; coordinates follow the existing animated pose rig.
let motionEnabled=true;
let equippedArt=null;
export function setDuckWeaponArt(renderer){equippedArt=renderer}
export function setDuckMotion(enabled){motionEnabled=enabled}
export function duckLook(outfit={}){
 if(outfit.blush)return 'lotus';
 if(outfit.mark==='bolt')return 'storm';
 return ({1:'jade',2:'tide',3:'sun',4:'dawn',5:'raven',6:'silver',7:'dune',8:'moon'})[outfit.hairStyle]||'dawn';
}
export function drawDuck(c,p,original,equippedWeapon=null) {
 const hero=p.kind==='hero', v=p.variant||0;
 if(hero){const m=c.getTransform();globalThis.__heroDraw={x:m.e,y:m.f,sx:Math.hypot(m.a,m.b),f:(p.facing<0||m.a<0)?-1:1,t:performance.now()};if(globalThis.__hideHero)return}
 // Modo Batata Ninja: inimigos viram legumes do mal (mesma pose, armas e colisão).
 if(!hero&&duckSettings.hero){drawVeggie(c,p);return}
 const heavy=!hero&&(v===1||v===6||v===8);
 const purple=!hero&&(v===5||v===7);
 const baseSkin=hero&&(original?.hairStyle===4), outfit=original||{};
 const look=hero?duckLook(outfit):'',metal=look==='sun'?'#f2ca71':look==='silver'?'#dce8f1':'#92bac9';
 if(hero)p=characterPose(p,look,motionEnabled);
 // Visual novo do protagonista (escolhido nos ajustes); a pose e a física continuam as mesmas.
 if(hero&&duckSettings.hero){drawPersonality(c,p,look,outfit.band||'#28c8dd',motionEnabled);c.save();c.globalAlpha*=1-(p.artVanish||0);const ok=drawPotato(c,p,duckSettings.hero,outfit,(x,y,a)=>{if(!(equippedWeapon?.id&&equippedArt))return false;equippedArt(c,equippedWeapon,x,y,a,motionEnabled);return true});c.restore();if(ok)return}
 const weapon=hero?(equippedWeapon||{}):{}, weaponId=weapon.id||'katana';
 const navy=hero?(baseSkin?'#18345f':outfit.body||'#18345f'):purple?'#39234f':heavy?'#343442':'#862435';
 const light=hero?(baseSkin?'#31588d':outfit.bodyLight||'#31588d'):purple?'#65417b':heavy?'#626477':'#bc3b45';
 const band=hero?(outfit.band||'#28c8dd'):purple?'#aa65d2':'#e7434b';
 const feather=hero?(baseSkin?'#fff7e5':outfit.hair||'#fff7e5'):'#393342';
 const line='#101827', orange='#ffa82d';
 const clock=p.t||0, fxClock=motionEnabled?performance.now()/1000:0, motion=motionEnabled?1:0, breath=Math.sin(clock*3.3)*motion, rush=Math.min(1,Math.max(0,p.smear||0)), settle=Math.sin(clock*5)*.025*motion;
 const hairLagX=Math.max(-7,Math.min(7,p.hairX||0))*motion,hairLagY=Math.max(-5,Math.min(5,p.hairY||0))*motion;
 const flutter=(Math.sin(clock*5.5)*2.2-rush*4+(p.artSway||0)+hairLagY*.45)*motion,pull=Math.min(1,Math.max(0,p.pull||0)),focus=hero&&!p.artHappy?Math.max(p.artFocus||0,rush*.85,pull*.85):0;
 if(hero)drawPersonality(c,p,look,band,motionEnabled);
 c.save();c.globalAlpha*=1-(p.artVanish||0);c.scale(1-breath*.012,1+breath*.018);c.lineJoin='round';c.lineCap='round';c.lineWidth=2.1;c.strokeStyle=line;
 function path(points,fill){c.beginPath();for(let i=0;i<points.length;i++){const a=points[i];i?c.lineTo(...a):c.moveTo(...a)}c.closePath();c.fillStyle=fill;c.fill();c.stroke()}
 function oval(x,y,rx,ry,fill,angle=0){c.beginPath();c.ellipse(x,y,rx,ry,angle,0,Math.PI*2);c.fillStyle=fill;c.fill();c.stroke()}
 function box(x,y,w,h,r,fill){c.beginPath();c.roundRect(x,y,w,h,r);c.fillStyle=fill;c.fill();c.stroke()}
 function foot(x,y){path([[x-7,y-2],[x-6,y-6],[x+1,y-6],[x+5,y-1],[x+12,y+2],[x+9,y+4],[x-7,y+4]],orange);c.lineWidth=.8;c.beginPath();c.moveTo(x+1,y);c.lineTo(x+8,y+2);c.stroke();c.lineWidth=2.1}
 function wing(x,y){c.save();c.translate(x,y);c.rotate((Math.sin(clock*4.2+x*.1)*.045+settle-rush*.1)*motion);x=y=0;oval(x,y,6.7,5.3,feather);c.lineWidth=.8;c.beginPath();c.moveTo(x+1,y-2);c.lineTo(x+3,y+1);c.moveTo(x-2,y-1);c.lineTo(x,y+2);c.stroke();if(hero){box(-6,-4,5,8,2,navy);c.strokeStyle=band;c.lineWidth=1;c.beginPath();c.moveTo(-5,-2);c.lineTo(-2,0);c.moveTo(-5,1);c.lineTo(-2,3);c.stroke();c.strokeStyle=line}c.lineWidth=2.1;c.restore()}
 function blade(x,y,a,short=false){
  if(hero&&weapon.id&&equippedArt){equippedArt(c,weapon,x,y,a,motionEnabled);return}
  c.save();c.translate(x,y);c.rotate(a);const id=hero?weaponId:'katana',len=short?23:id==='apoc'?39:35,steel=hero?(weapon.steel||outfit.steel||'#e1f4ff'):'#e1f4ff',glow=hero?(weapon.glow||band):band;
  if(hero&&weapon.glow){c.save();c.shadowColor=glow;c.shadowBlur=7;c.globalAlpha=.25;c.strokeStyle=glow;c.lineWidth=7;c.beginPath();c.moveTo(4,0);c.lineTo(len,-3);c.stroke();c.restore()}
  if(hero&&rush>.12&&motion){c.save();c.globalAlpha=.22*rush;c.strokeStyle=glow;c.lineWidth=7;c.beginPath();c.arc(0,0,len+5,-.85,.25);c.stroke();c.globalAlpha=.7*rush;c.strokeStyle=weapon.edge||'#e8ffff';c.lineWidth=1.5;c.stroke();c.restore()}
  if(id==='apoc')path([[0,-5],[len-8,-7],[len+7,-16],[len+4,3],[10,6],[0,3]],steel);
  else if(id==='frost')path([[0,-3],[len-10,-4],[len-5,-10],[len,-7],[len+8,-14],[len+4,-1],[5,3],[0,2]],steel);
  else path([[0,-3],[len,-4],[len+8,-10],[len+4,-1],[5,3],[0,2]],steel);
  c.strokeStyle=hero?(weapon.edge||'#8bb4cc'):'#8bb4cc';c.lineWidth=1;c.beginPath();c.moveTo(4,-1);c.lineTo(len,-2);c.stroke();
  if(hero&&id!=='katana'){c.save();c.strokeStyle=glow;c.fillStyle=glow;c.lineWidth=1.5;
   if(id==='bolt'){c.beginPath();c.moveTo(8,-3);c.lineTo(18,-7);c.lineTo(15,-1);c.lineTo(30,-5);c.stroke()}
   if(id==='flame'){for(let i=0;i<3;i++){const x=12+i*9,wave=motion?Math.sin(clock*10+i)*2:0;c.beginPath();c.moveTo(x,-4);c.quadraticCurveTo(x+7,-8,x+4,-13+wave);c.quadraticCurveTo(x-4,-7,x,-4);c.fill()}}
   if(id==='venom'){for(let i=0;i<3;i++){c.beginPath();c.arc(11+i*10,-1,1.5,0,Math.PI*2);c.fill()}}
   if(id==='apoc'){c.beginPath();c.moveTo(14,-2);c.lineTo(21,-6);c.lineTo(27,-1);c.stroke()}
   c.restore();
  }
  // Elemental animation lives in blade coordinates, including while standing still.
  if(hero&&id!=='katana'){
   c.save();c.strokeStyle=glow;c.fillStyle=glow;c.shadowColor=glow;c.shadowBlur=8;c.lineWidth=1.2;
   const t=fxClock;
   for(let i=0;i<6;i++){
    const phase=(t*(id==='frost'?.45:.85)+i/6)%1,x=7+phase*(len-5),wave=Math.sin(t*8+i*2);
    c.globalAlpha=.35+.55*Math.sin(phase*Math.PI);
    if(id==='flame'){c.beginPath();c.moveTo(x-3,-3);c.quadraticCurveTo(x-5+wave*2,-9,x+wave*3,-10-7*phase);c.quadraticCurveTo(x+5,-7,x+3,-3);c.fill()}
    else if(id==='bolt'){c.beginPath();c.moveTo(x-5,-2);c.lineTo(x-1,-6-wave*3);c.lineTo(x+2,1);c.lineTo(x+7,-4+wave*2);c.stroke()}
    else if(id==='frost'){const y=-5-6*Math.sin(phase*Math.PI);c.beginPath();c.moveTo(x-2,y);c.lineTo(x+2,y);c.moveTo(x,y-2);c.lineTo(x,y+2);c.stroke()}
    else if(id==='venom'){c.beginPath();c.arc(x,2+phase*6,1+Math.sin(phase*Math.PI),0,Math.PI*2);c.fill()}
    else {c.beginPath();c.arc(x,-2+wave*4,2,.2+t*3,Math.PI*1.5+t*3);c.stroke()}
   }
   c.restore();
  }
  c.strokeStyle=line;c.lineWidth=2;box(-8,-3,11,6,2,'#392a32');box(1,-6,3,12,1,hero&&weapon.glow?glow:'#edbd54');c.restore()
 }

 if(!p.bare){
  if(hero){
   // Overlapping cloth follows the animated pose without moving its joints.
   c.save();c.translate(-15,-3);c.rotate(-rush*.15+settle);
   const cape=['raven','moon','dune','lotus'].includes(look),tip=-31-rush*15;
   if(cape){path([[0,-9],[-11,-7],[tip-4,14+flutter],[tip+7,11+flutter],[tip+12,20+flutter],[-7,19],[4,12]],navy);c.strokeStyle=band;c.lineWidth=1.2;c.beginPath();c.moveTo(-11,-4);c.quadraticCurveTo(-18,8,tip+6,14+flutter);c.stroke();c.strokeStyle=line;c.lineWidth=2.1}
   c.restore();
  }
  // Tail feathers, rear webbed foot and wing retain the original attachment points.
  path([[-15,10],[-31+hairLagX*.45,5+hairLagY*.5],[-28,0],[-32+hairLagX*.5,-6+hairLagY*.6],[-20,-1],[-22,-10+hairLagY*.4],[-10,0]],feather);
  foot(p.fbx,p.fby);if(!p.artAdjust&&!p.artSeal)wing(p.hbx,p.hby);
 }
 // Squat rounded body and scarf, matching the original collision footprint.
 box(-20,-8,40,28,11,navy);
 if(hero){c.fillStyle=outfit.shade||'#10213b';c.beginPath();c.moveTo(-19,3);c.quadraticCurveTo(-7,15,19,9);c.lineTo(17,19);c.lineTo(-15,20);c.closePath();c.fill()}
 c.fillStyle=light;c.beginPath();c.ellipse(-5,5,10,11,-.2,0,Math.PI*2);c.fill();
 path([[-16,-4],[-10,-6],[17,13],[12,18]],band);
 if(hero){
  // Readable seams and layered lapels rather than extra texture noise.
  c.strokeStyle=light;c.lineWidth=1.2;c.beginPath();c.moveTo(-13,-4);c.lineTo(3,9);c.moveTo(-11,8);c.lineTo(-15,14);c.stroke();c.strokeStyle=line;c.lineWidth=2.1;
  if(['sun','silver','storm'].includes(look)){path([[-22,-7],[-11,-10],[-7,-3],[-10,6],[-23,4]],metal);box(-21,4,11,4,1,navy);c.lineWidth=1;c.strokeStyle=band;c.beginPath();c.moveTo(-20,-3);c.lineTo(-11,-5);c.stroke();c.strokeStyle=line;c.lineWidth=2.1}
  if(look==='jade'){path([[-14,-5],[-19,-13],[-10,-9],[-6,-2]],'#6fba87');path([[-15,5],[-24,2],[-21,9],[-13,12]],band)}
  if(look==='tide'||look==='lotus'){for(let i=0;i<3;i++){c.strokeStyle=band;c.lineWidth=1;c.beginPath();c.arc(-9+i*8,8,4,Math.PI,Math.PI*2);c.stroke()}c.strokeStyle=line;c.lineWidth=2.1}
 }
 box(-20,12,40,6,2,hero?(outfit.bandDark||'#1693ac'):'#442336');
 box(0,11,6,8,1,'#f1c65e');
 if(hero){path([[-18,17],[-7,17],[-9,26+breath*.4],[-18,23]],navy);path([[7,17],[17,17],[19,24],[9,26]],light)}
 // Subtle overlapping head motion; the outer pose still owns facing and squash.
 c.save();c.translate(0,breath*1.2);c.rotate(settle*(hero?(p.artAim?.15:1):.6));
 // Hood: large head, pale exposed duck face and protruding bill.
 box(-22,-26,44,35,13,navy);
 c.save();c.beginPath();c.roundRect(-22,-26,44,35,13);c.clip();c.fillStyle=light;c.beginPath();c.ellipse(-10,-18,12,13,-.4,0,Math.PI*2);c.fill();c.restore();
 if(hero&&look==='moon'){
  path([[-20,-24],[-16,-39],[-7,-30],[0,-43],[9,-30],[20,-35],[23,-23]],navy);
 }else if(hero&&look==='silver'){
  path([[-21,-25],[-18,-34],[0,-39],[20,-31],[23,-24]],metal);path([[-7,-32],[-10,-44],[2,-38],[6,-29]],feather);
 }else if(hero&&look==='raven'){
  path([[-18,-24],[-29+flutter,-36],[-13,-32],[-17+flutter,-43],[-2,-34],[2,-44],[15,-30],[16,-24]],feather);
 }else{
  path([[-13,-25],[-17+flutter,-36],[-7,-32],[-7+flutter,-39],[3,-32],[13,-29],[14,-24]],feather);
  if(hero){c.strokeStyle='#ffffff88';c.lineWidth=1.2;c.beginPath();c.moveTo(-10,-30);c.lineTo(-8+flutter,-35);c.moveTo(0,-29);c.lineTo(-4+flutter,-34);c.stroke();c.strokeStyle=line;c.lineWidth=2.1}
 }
 box(-22,-22,45,7,2,band);
 c.strokeStyle='rgba(255,255,255,.5)';c.lineWidth=1;c.beginPath();c.moveTo(-17,-20);c.lineTo(17,-20);c.stroke();c.strokeStyle=line;c.lineWidth=2.1;
 path([[-20,-17],[-29,-20],[-39-rush*9,-14+flutter],[-32,-12],[-24,-14]],band);
 if(hero){path([[-20,-17],[-27,-14],[-39-rush*7,-5-flutter],[-31,-6],[-23,-12]],outfit.bandDark||band)}
 box(-3,-15,25,20,8,hero?'#fff8e8':'#e6d9cb');
 const blink=Math.max(.12,1-(p.blink||0)*.9),wide=(p.eyeWide>.5?1.2:1)*(1-rush*.12-pull*.1);
 for(const [x,rx] of [[5,4.5],[16,4]]){
  if(p.artHappy){c.strokeStyle=line;c.lineWidth=1.8;c.beginPath();c.arc(x,-5,3,Math.PI*1.15,Math.PI*1.85);c.stroke();continue}
  if(focus>.25){
   // Large deliberate eyelids remain readable at the original gameplay zoom.
   const inner=x<10?1:-1,topL=-10-inner*2.2*focus,topR=-10+inner*2.2*focus;
   c.lineWidth=1.2;path([[x-rx,topL],[x+rx,topR],[x+rx,-1.5],[x-rx,-1.5]],'#fff8e9');
   c.save();c.beginPath();c.moveTo(x-rx,topL);c.lineTo(x+rx,topR);c.lineTo(x+rx,-1.5);c.lineTo(x-rx,-1.5);c.closePath();c.clip();
   const pupilX=x+Math.max(-1,Math.min(1,p.lookX||0))*1.3;
   c.fillStyle='#14283d';c.beginPath();c.ellipse(pupilX,-5.5,1.35,3,0,0,Math.PI*2);c.fill();c.fillStyle='#ffffff';c.beginPath();c.arc(pupilX+.3,-6.5,.65,0,Math.PI*2);c.fill();c.restore();
   c.strokeStyle=line;c.lineWidth=2.6;c.beginPath();c.moveTo(x-rx-1,topL-.8);c.lineTo(x+rx+.5,topR-.8);c.stroke();c.lineWidth=2.1;
   continue;
  }
  oval(x,-7,rx,6*blink*wide,'#ffffff');
  oval(x+1+Math.max(-1.4,Math.min(1.4,p.lookX||0))*1.3,-6+(p.lookY||0)*.6,2.4,4*blink,hero?'#193352':'#a62736');
  c.fillStyle='#fff';c.beginPath();c.arc(x+1,-8,1,0,Math.PI*2);c.fill();
 }
 const intense=p.artHappy?-.5:Math.max(rush,pull*.75,focus*2.6);
 if(focus<=.25){c.strokeStyle=line;c.lineWidth=2.7;c.beginPath();c.moveTo(0,-14-intense);c.lineTo(8,-11+intense);c.moveTo(14,-11+intense);c.lineTo(20,-14-intense);c.stroke()}c.lineWidth=2.1;
 c.beginPath();c.moveTo(10,-1);c.quadraticCurveTo(18,-5,25,-2);c.quadraticCurveTo(31,1,37,1);c.quadraticCurveTo(38,6,29,8);c.quadraticCurveTo(17,9,10,5);c.closePath();c.fillStyle=orange;c.fill();c.stroke();
 c.strokeStyle='#bb671f';c.lineWidth=1;c.beginPath();c.moveTo(14,4);c.quadraticCurveTo(27,6,34,3);c.stroke();c.strokeStyle=line;c.lineWidth=2.1;
 if(hero){
  c.fillStyle='#ffe1a0';c.beginPath();c.ellipse(24,0,5.5,1.2,.12,0,Math.PI*2);c.fill();
  // Distinct silhouettes and emblems are shared by shop and gameplay.
  const emblem=(type,x,y)=>{c.save();c.translate(x,y);c.strokeStyle=metal;c.fillStyle=metal;c.lineWidth=1.2;
   if(type==='moon'){c.beginPath();c.arc(0,0,2.5,-1.4,1.4);c.stroke()}
   else if(type==='storm'){c.beginPath();c.moveTo(1,-3);c.lineTo(-2,0);c.lineTo(1,0);c.lineTo(-1,3);c.stroke()}
   else if(type==='lotus'){for(let i=-1;i<=1;i++){c.beginPath();c.ellipse(i*1.7,-.3,1,2.5,i*.6,0,Math.PI*2);c.fill()}}
   else {c.beginPath();c.moveTo(0,-2.7);c.lineTo(2.5,0);c.lineTo(0,2.7);c.lineTo(-2.5,0);c.closePath();c.stroke()}c.restore()};
  if(look==='sun'){path([[-20,-22],[-20,-32],[-13,-28],[-7,-35],[-1,-26],[3,-22]],metal);emblem('sun',-10,-19)}
  else if(look==='silver'){box(-20,-23,19,9,2,metal);c.strokeStyle='#70839a';c.lineWidth=1;c.beginPath();c.moveTo(-18,-18);c.lineTo(-3,-18);c.stroke();c.strokeStyle=line;c.lineWidth=2.1}
  else if(look==='dune'){path([[-24,-19],[-25,-30],[-12,-33],[7,-29],[20,-22]],'#c9a26b');box(-24,-20,25,7,2,band);path([[-22,-8],[-8,0],[0,11],[-16,8],[-24,0]],band)}
  else if(look==='jade'){path([[-21,-23],[-27,-32],[-19,-30],[-12,-21]],'#8dce98');emblem('jade',-10,-19)}
  else if(look==='lotus'){oval(-19,-22,4.2,3.2,'#f9a6cc');oval(-19,-22,1.3,1.3,'#ffe7a1');c.fillStyle='#e58e9c';c.beginPath();c.ellipse(1,1,3,1.4,0,0,Math.PI*2);c.fill()}
  else {box(-16,-23,12,8,2,metal);c.fillStyle=navy;c.beginPath();c.roundRect(-14,-21,8,4,1);c.fill();emblem(look,-10,-19)}
  if(look==='tide'){c.strokeStyle='#9ce7df';c.lineWidth=1.5;c.beginPath();c.moveTo(-19,-9);c.quadraticCurveTo(-15,-14,-11,-9);c.stroke();c.strokeStyle=line;c.lineWidth=2.1}
 }
 if(heavy){
  box(-23,0,11,11,3,'#707381');box(-22,1,10,4,1,'#b08d50');
  path([[-21,-19],[-18,-32],[10,-34],[25,-23],[23,-18]],'#555565');
  box(-19,-24,42,5,2,'#8e8d9d');oval(10,-22,1.1,1.1,'#e3bd60');
 }
 if(!hero&&(v===0||v===4||v===2||v===9)){
  c.save();c.translate(0,-25);c.rotate(p.hat||0);
  path([[-30,3],[-3,-17],[8,-17],[31,3],[8,8],[-11,8]],'#d8b67a');
  path([[-30,3],[31,3],[8,8],[-11,8]],'#9d7949');
  c.lineWidth=1;c.beginPath();c.moveTo(1,-13);c.lineTo(-17,3);c.moveTo(7,-13);c.lineTo(20,3);c.stroke();c.restore();
 }
 c.restore();
 if(!p.bare){
  foot(p.ffx,p.ffy);
  if(hero){if(p.drawn>=.5||(weaponId!=='katana'&&!p.artWin))blade(p.hfx,p.hfy,p.blade);else{c.save();c.translate(-17,4);c.rotate(-1);box(-14,-3,30,6,2,'#15253f');box(14,-4,8,8,1,'#d4ad58');c.restore()}}
  else if(v===1){box(p.hfx-8,p.hfy-16,17,29,5,'#5b6174');box(p.hfx-5,p.hfy-12,11,21,3,'#a3a9ba')}
  else if(v===2){c.save();c.translate(p.hfx,p.hfy);c.rotate(p.blade);c.strokeStyle='#dfbd7f';c.lineWidth=3;c.beginPath();c.arc(0,0,18,-1.4,1.4);c.stroke();c.lineWidth=1;c.beginPath();c.moveTo(3,-18);c.lineTo(3,18);c.stroke();c.restore()}
  else if(v===0||v===4){c.save();c.translate(p.hfx,p.hfy);c.rotate(p.blade+Math.PI/2);c.strokeStyle=line;c.lineWidth=5;c.beginPath();c.moveTo(0,23);c.lineTo(0,-36);c.stroke();c.strokeStyle='#97704c';c.lineWidth=2.5;c.stroke();c.strokeStyle=line;c.lineWidth=2;path([[-5,-34],[0,-47],[5,-34],[0,-28]],'#dae9f5');c.restore()}
  else {blade(p.hfx,p.hfy,p.blade,v===5||v===7);if(v===5)blade(p.hbx,p.hby,p.blade-.6,true)}
  wing(p.hfx,p.hfy);
  if(p.artAdjust||p.artSeal)wing(p.hbx,p.hby);
 }
 if(p.mark>.2){c.font='bold 18px sans-serif';c.textAlign='center';c.strokeStyle=line;c.lineWidth=3;c.strokeText('!',0,-49);c.fillStyle='#ffcf55';c.fillText('!',0,-49)}
 c.restore();
}
