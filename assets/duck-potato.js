// Batata Ninja — protagonista alternativo. Usa o mesmo esqueleto de pose do jogo
// (mãos hf/hb, pés ff/fb, lâmina, piscada, olhar). Cores chapadas + uma sombra, como os inimigos.
import {duckMotion} from './duck-performance.js';
const TAU=Math.PI*2,LINE='#16121a';
// Movimento secundário (mola amortecida): faixa e broto atrasam em relação ao corpo.
// Subindo no pulo, eles caem para baixo; caindo, sobem; correndo, esticam para trás; ao pousar, balançam.
const springs={game:{y:0,vy:0,x:0,vx:0,last:0,wasGround:true,sq:0},preview:{y:0,vy:0,x:0,vx:0,last:0,wasGround:true,sq:0}};
function secondary(p,c){
 // O fantasma (desenhado bem transparente) não usa a mola do jogador.
 if(!p.duckPreview&&c.globalAlpha<.5)return {y:0,x:0,sq:0,st:0};
 const spring=p.duckPreview?springs.preview:springs.game;
 const now=p.simNow??performance.now()/1000,dt=Math.min(.05,Math.max(0,now-(spring.last||now)));spring.last=now;
 let vy=0,vx=0,ground=true;
 if(p.duckPreview){const j=p.previewJump||0;vy=p.previewMode==='jump'?-Math.cos(((p.t||0)%2.6)/1.45*Math.PI)*600:0;ground=!j;vx=p.previewMode==='attack'?900:0}
 else{const m=duckMotion();if(m&&m.active){vy=m.vy||0;vx=Math.abs(m.vx||0);ground=!!m.grounded}}
 const ty=Math.max(-14,Math.min(14,-vy*.02)),tx=Math.min(10,vx*.008);
 if(ground&&!spring.wasGround){spring.vy+=55;spring.sq=1} // pouso: faixa chicoteia e o corpo amassa
 spring.wasGround=ground;
 const k=120,d=11;spring.vy+=(k*(ty-spring.y)-d*spring.vy)*dt;spring.y+=spring.vy*dt;spring.vx+=(k*(tx-spring.x)-d*spring.vx)*dt;spring.x+=spring.vx*dt;
 spring.sq=Math.max(0,spring.sq-dt*5);
 // Estica com a velocidade vertical (subindo ou caindo) e amassa só no pouso.
 const st=Math.min(.12,Math.abs(vy)*.00012)-.16*Math.sin(Math.min(1,1-spring.sq)*Math.PI)*spring.sq;
 return {y:Math.max(-16,Math.min(16,spring.y)),x:Math.max(-2,Math.min(12,spring.x)),st};
}
const STYLES={
 // 1 · fiel à referência
 classic:{skin:'#c98a3e',shade:'#9c6528',light:'#e2a75a',dots:'#7d4e1e',band:'#2a2730',plate:'#c3cad2',tail:'#d0303a',tailD:'#8e1d27',mask:'#2a2730',sash:'#d0303a',sashD:'#8e1d27',glove:'#3b3743',swords:2,iris:'#3a2414'},
 // 2 · batata fofa (turquesa, sem máscara, broto)
 cute:{skin:'#e3ad55',shade:'#b8822f',light:'#f6cd7c',dots:'#a06b26',band:'#1f6f86',plate:'#d6e2ea',tail:'#28c8dd',tailD:'#168da5',mask:null,sash:'#28c8dd',sashD:'#168da5',glove:'#5fa8d0',shoe:'#3b7aa0',swords:0,iris:'#173a52',sprout:true,blush:true},
 // 3 · batata elite (assada, capuz, olhos que brilham)
 elite:{skin:'#b0703a',shade:'#7f4c22',light:'#cf8e52',dots:'#5c3414',band:'#25222c',plate:'#d8b04e',tail:'#28c8dd',tailD:'#168da5',mask:'#25222c',hood:true,sash:'#d8b04e',sashD:'#9c7a26',glove:'#35313d',swords:2,iris:'#9ff6ff',glow:true}
};
export const POTATO_STYLES=Object.keys(STYLES);
// Contorno de batata: elipse com calombos fixos.
function blob(c,cx,cy,rx,ry){c.beginPath();for(let i=0;i<=40;i++){const a=i/40*TAU,k=1+.035*Math.sin(3*a+.6)+.025*Math.sin(5*a+2.1)+.015*Math.sin(9*a);const x=cx+Math.cos(a)*rx*k,y=cy+Math.sin(a)*ry*k;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}
function fillStroke(c,fill,w=2.2){if(fill){c.fillStyle=fill;c.fill()}c.strokeStyle=LINE;c.lineWidth=w;c.stroke()}
let PLATE=false,CUFF=null;
function boot(c,x,y,col,back=false,sl=null){
 // Perninha curta + sapatinho de perfil (calcanhar atrás, bico arredondado para a frente).
 y+=3;c.strokeStyle=LINE;c.lineWidth=5.6;c.beginPath();c.moveTo(x-1.5,y-9);c.lineTo(x-.8,y-5);c.stroke();c.strokeStyle=sl?(back?sl.legB:sl.leg):(back?'#8a5a24':'#b8822f');c.lineWidth=3.2;c.stroke();
 const fill=back?(sl?sl.b:'#24465e'):col;
 c.beginPath();c.moveTo(x-5.5,y+1.5);c.bezierCurveTo(x-7,y-3,x-5,y-6.5,x-.5,y-6.5);c.bezierCurveTo(x+3,y-6.5,x+5,y-4.5,x+7,y-3.5);c.bezierCurveTo(x+10,y-2.5,x+10.5,y+1.5,x+8,y+1.5);c.closePath();fillStroke(c,fill,1.7);
 c.fillStyle=sl?sl.sole:(back?'#1a3346':'#24465e');c.beginPath();c.moveTo(x-5.3,y+1.5);c.lineTo(x+8,y+1.5);c.lineTo(x+8.6,y-.2);c.lineTo(x-5.8,y-.2);c.closePath();c.fill();
 c.fillStyle='#ffffff40';c.beginPath();c.ellipse(x-1,y-4.6,2.6,1,-.15,0,TAU);c.fill();if(!back){c.fillStyle='#00000024';c.beginPath();c.ellipse(x+6,y-.8,3,1.7,0,0,TAU);c.fill();c.fillStyle='#ffffff38';c.beginPath();c.ellipse(x+5,y-3.2,2.2,.8,.25,0,TAU);c.fill()}
 c.strokeStyle=sl?sl.acc:'#28c8dd';c.lineWidth=1.1;c.beginPath();c.moveTo(x-3.5,y-6);c.lineTo(x-2.5,y-1.2);c.stroke();
 if(sl&&sl.claw&&!back){ // bota de dragão: garras no bico, cano com espinho e friso roxo
  c.fillStyle='#e8d8ff';c.strokeStyle=LINE;c.lineWidth=.8;for(const [dy,l] of [[-2.6,3.4],[-.6,3.8],[1.2,3.2]]){c.beginPath();c.moveTo(x+8.6,y+dy-1);c.lineTo(x+8.6+l,y+dy+.5);c.lineTo(x+8.4,y+dy+1.2);c.closePath();c.fill();c.stroke()}
  c.beginPath();c.moveTo(x-5.4,y-5.6);c.lineTo(x-9,y-9.5);c.lineTo(x-2,y-6.8);c.closePath();c.fillStyle=sl.acc;c.fill();c.stroke();
  c.strokeStyle=sl.acc;c.lineWidth=1;c.beginPath();c.moveTo(x-5,y-.9);c.lineTo(x+7.5,y-.9);c.stroke()}}
// Fita da bandana: faixa com largura (w0→w1) ao longo de uma curva cúbica, ponta em V.
function ribbon(c,p0,p1,p2,p3,w0,w1,col){const N=12,L=[],R=[];
 for(let i=0;i<=N;i++){const t=i/N,u=1-t,x=u*u*u*p0[0]+3*u*u*t*p1[0]+3*u*t*t*p2[0]+t*t*t*p3[0],y=u*u*u*p0[1]+3*u*u*t*p1[1]+3*u*t*t*p2[1]+t*t*t*p3[1];
  const dx=3*u*u*(p1[0]-p0[0])+6*u*t*(p2[0]-p1[0])+3*t*t*(p3[0]-p2[0]),dy=3*u*u*(p1[1]-p0[1])+6*u*t*(p2[1]-p1[1])+3*t*t*(p3[1]-p2[1]),l=Math.hypot(dx,dy)||1,w=w0+(w1-w0)*t,nx=-dy/l*w,ny=dx/l*w;
  L.push([x+nx,y+ny]);R.push([x-nx,y-ny])}
 const e=L[N],f=R[N],tip=[(e[0]+f[0])/2+(p3[0]-p2[0])*.08,(e[1]+f[1])/2+(p3[1]-p2[1])*.08];
 c.beginPath();L.forEach((q,i)=>i?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.lineTo(e[0]-(p3[0]-p2[0])*.12,e[1]-(p3[1]-p2[1])*.12);c.lineTo(tip[0]-(p3[0]-p2[0])*.25,tip[1]-(p3[1]-p2[1])*.25);c.lineTo(f[0]-(p3[0]-p2[0])*.12,f[1]-(p3[1]-p2[1])*.12);for(let i=N;i>=0;i--)c.lineTo(R[i][0],R[i][1]);c.closePath();fillStroke(c,col,1.5)}
function arm(c,sx,sy,x,y,col){c.strokeStyle=LINE;c.lineWidth=6.4;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo((sx+x)/2,(sy+y)/2+3,x,y);c.stroke();c.strokeStyle=col;c.lineWidth=3.6;c.stroke();
 if(CUFF){const cx=(sx+x)/2,cy=(sy+y)/2+3,q=u=>[(1-u)*(1-u)*sx+2*u*(1-u)*cx+u*u*x,(1-u)*(1-u)*sy+2*u*(1-u)*cy+u*u*y],a=q(.7),b=q(.86);c.lineCap='butt';for(const [w,k] of [[7.4,LINE],[5,CUFF]]){c.strokeStyle=k;c.lineWidth=w;c.beginPath();c.moveTo(a[0],a[1]);c.lineTo(b[0],b[1]);c.stroke()}c.lineCap='round'}}
function hand(c,x,y,col){c.save();c.translate(x,y);if(PLATE){c.fillStyle='#241a38';c.strokeStyle=LINE;c.lineWidth=1.2;c.beginPath();c.roundRect(-8.2,-4,5,8,2);c.fill();c.stroke();c.strokeStyle='#8a2cff';c.lineWidth=1.1;c.beginPath();c.moveTo(-5.2,-3);c.lineTo(-5.2,3);c.stroke();c.fillStyle='#8a2cff';c.beginPath();c.moveTo(-7.5,-3.6);c.lineTo(-10.5,-7.4);c.lineTo(-4.6,-4);c.closePath();c.fill();c.stroke()}c.beginPath();c.arc(0,0,5.6,0,TAU);c.fillStyle='#ffffff30';c.fill();c.beginPath();c.ellipse(0,.3,4.9,4.5,0,0,TAU);fillStroke(c,col,1.8);c.beginPath();c.ellipse(2.7,-3.5,1.9,2.9,.5,0,TAU);fillStroke(c,col,1.5);c.strokeStyle='#00000045';c.lineWidth=.8;c.beginPath();c.moveTo(-.5,1.2);c.lineTo(-.5,4.2);c.moveTo(1.7,1.2);c.lineTo(1.7,4.2);c.stroke();c.fillStyle='#00000022';c.beginPath();c.ellipse(1.4,2.6,3.2,1.7,0,0,TAU);c.fill();c.fillStyle='#ffffff60';c.beginPath();c.ellipse(-1.7,-1.5,1.7,1.1,-.5,0,TAU);c.fill();c.restore()}
function sword(c,x,y,a,len=33,glow){c.save();c.translate(x,y);c.rotate(a);
 c.beginPath();c.moveTo(3,-2.3);c.lineTo(len,-2.3);c.lineTo(len+7.5,.1);c.lineTo(len+.5,2.3);c.lineTo(5,2.3);c.closePath();fillStroke(c,'#e9f3fa',1.5);
 c.strokeStyle='#9bb7c9';c.lineWidth=.8;c.beginPath();c.moveTo(6,.4);c.lineTo(len,.4);c.lineTo(len+5,.1);c.stroke();c.beginPath();c.moveTo(len,-2.3);c.lineTo(len+.5,2.3);c.stroke();
 if(glow){c.save();c.globalAlpha*=.35;c.strokeStyle=glow;c.lineWidth=5;c.beginPath();c.moveTo(6,0);c.lineTo(len+3,-.5);c.stroke();c.restore()}
 c.beginPath();c.roundRect(-1,-4.5,3,9,1);fillStroke(c,'#e1b84e',1.2);
 c.beginPath();c.roundRect(-11,-2.4,11,4.8,2);fillStroke(c,'#1d1b22',1.2);
 c.strokeStyle='#d0303a';c.lineWidth=1;for(let i=-9;i<-1;i+=3){c.beginPath();c.moveTo(i,-2);c.lineTo(i+1.5,2);c.stroke()}
 c.restore()}
function backSword(c,x,y,a){c.save();c.translate(x,y);c.rotate(a);c.beginPath();c.roundRect(-2.6,-4,5.2,34,2.6);fillStroke(c,'#1d1b22',1.5);c.beginPath();c.roundRect(-3.4,-8,6.8,4.5,1.5);fillStroke(c,'#e1b84e',1.1);c.beginPath();c.roundRect(-2.4,-20,4.8,12.5,2);fillStroke(c,'#1d1b22',1.1);c.strokeStyle='#d0303a';c.lineWidth=1;for(let i=-18;i<-9;i+=3){c.beginPath();c.moveTo(-2,i);c.lineTo(2,i+1.5);c.stroke()}c.restore()}
function emblem(c,x,y,col){ // broto de batata estilizado (emblema próprio)
 c.save();c.translate(x,y);c.strokeStyle=col;c.fillStyle=col;c.lineWidth=1.1;c.beginPath();c.moveTo(0,2.6);c.lineTo(0,-.5);c.stroke();
 c.beginPath();c.ellipse(-1.7,-1.2,1.8,1,-.5,0,TAU);c.fill();c.beginPath();c.ellipse(1.7,-1.2,1.8,1,.5,0,TAU);c.fill();c.restore()}


// ---------- Skins da batata (seguem os visuais da loja: cada um com roupa e cabelo próprios) ----------
const SKINS={
 dawn:{},
 jade:{band:'#2f8a45',plate:'#d9e6d2',tail:'#5cc46a',tailD:'#2f8a45',sash:'#5cc46a',sashD:'#2f8a45',glove:'#2c5a3a',shoe:'#3f7d4f',hair:'leaves'},
 tide:{band:'#127a80',plate:'#d6f0ee',tail:'#1fbfb3',tailD:'#128078',sash:'#1fbfb3',sashD:'#128078',glove:'#1d4a55',shoe:'#26707a',hair:'wave',hairCol:'#1fbfb3',scarf:'#1fbfb3'},
 storm:{band:'#0b73c9',plate:'#e8f6ff',tail:'#18d0ff',tailD:'#0b73c9',sash:'#18d0ff',sashD:'#0b73c9',glove:'#1a2a5c',shoe:'#2b4aa0',hair:'spiky',hairCol:'#2f86ff',bolt:true},
 raven:{top:'hood',hoodCol:'#23263a',band:'#dfe5f0',plate:'#9aa6bf',tail:'#dfe5f0',tailD:'#9aa6bf',sash:'#3a3f5c',sashD:'#23263a',glove:'#23263a',shoe:'#2f3450',mask:'#23263a',hair:'none',cape:'#2f3450'},
 sun:{top:'helmet',helmCol:'#f2b632',helmD:'#b07d14',band:'#b07d14',tail:'#f2b632',tailD:'#b07d14',sash:'#f2b632',sashD:'#b07d14',glove:'#3a2c14',shoe:'#5a4220',hair:'none',armor:'#f2ca71'},
 silver:{band:'#5a6b8c',plate:'#eef3fa',tail:'#b9c6d8',tailD:'#5a6b8c',sash:'#5a6b8c',sashD:'#38445d',glove:'#2f3646',shoe:'#4a5568',hair:'wolf',hairCol:'#dfe5ee',armor:'#c9d3e0'},
 dune:{top:'turban',turbCol:'#e2c58f',turbD:'#b08e55',band:'#c9a26b',tail:'#e2c58f',tailD:'#b08e55',sash:'#c9a26b',sashD:'#8e6a3c',glove:'#5b4126',shoe:'#7a5a36',hair:'none',faceWrap:'#e2c58f'},
 lotus:{band:'#ff8fc0',plate:'#fff0f6',tail:'#ffb6d6',tailD:'#d65b95',sash:'#ff8fc0',sashD:'#d65b95',glove:'#6a3a58',shoe:'#c0507e',hair:'long',hairCol:'#5a2a40',flower:'#ff8fc0',lashes:true},
 gold:{top:'helmet',prem:'gold',skin:'#ffcf3a',shade:'#d68f14',light:'#fff6bf',dots:'#f0b323',helmCol:'#fff0a8',helmD:'#c48a1a',band:'#c48a1a',plate:'#fff3c4',tail:'#ffd86b',tailD:'#c48a1a',sash:'#ff4f3a',sashD:'#8e1a14',glove:'#6b4a10',shoe:'#a8741a',hair:'none',armor:'#fff0a8'},
 cosmic:{prem:'cosmic',halo:'#ffd1f5',skin:'#9b78ff',shade:'#5a3cc0',light:'#e6d8ff',dots:'#ffffff',glow:true,iris:'#ff8fe6',band:'#6a2fd0',plate:'#f0dcff',tail:'#ff5fd2',tailD:'#6a2fd0',sash:'#ff5fd2',sashD:'#6a2fd0',glove:'#2a1a60',shoe:'#4a2fa0',hair:'spiky',hairCol:'#ff5fd2',bolt:true,scarf:'#b06bff'},
 blackdragon:{top:'helmet',horns:true,prem:'dragon',skin:'#3a2f4d',shade:'#150e20',light:'#7a68a0',dots:'#7a2fd0',glow:true,iris:'#ff2a4a',helmCol:'#1c1428',helmD:'#7a2fd0',band:'#7a2fd0',plate:'#2a1a3d',tail:'#8a2cff',tailD:'#3a0f6b',sash:'#8a2cff',sashD:'#3a0f6b',glove:'#120c1c',shoe:'#1a1228',hair:'none',armor:'#1f1630',cape:'#150e20',capeTrim:'#8a2cff',plate:'#2a1a3d',sl:{b:'#120c1c',sole:'#06030a',acc:'#b36bff',leg:'#2a2038',legB:'#16101f',claw:true}},
 royal:{prem:'royal',crown:true,collar:true,band:'#ffd23a',plate:'#ffe9a8',skin:'#f5d9a0',shade:'#d9a85c',light:'#fff3d6',tail:'#e8344f',tailD:'#8e1a2e',sash:'#e8344f',sashD:'#8e1a2e',glove:'#ffd23a',shoe:'#8e1a2e',hair:'none',cape:'#e8344f',capeTrim:'#ffd23a'},
 moon:{band:'#7c69d8',plate:'#efe8ff',tail:'#b9a6ff',tailD:'#7c69d8',sash:'#b9a6ff',sashD:'#7c69d8',glove:'#3a3466',shoe:'#5a4ea0',hair:'bun',hairCol:'#3e3a82',crescent:true}
};
function skinLook(o={}){if(o.blush)return 'lotus';if(o.mark==='bolt')return 'storm';return ({1:'jade',2:'tide',3:'sun',4:'dawn',5:'raven',6:'silver',7:'dune',8:'moon',9:'gold',10:'cosmic',11:'royal',12:'blackdragon'})[o.hairStyle]||'dawn'}
export const POTATO_SKINS=Object.keys(SKINS);
// Cabelo/topo da cabeça. sec = mola (pulo), ext = corrida.
function drawHair(c,S,t,sec,ext,layer){
 const sway=Math.sin(t*2)*.08-ext*.03+sec.y*.012,lag=Math.max(-.9,Math.min(.9,sec.y*.09)),k=S.hair||'sprout',col=S.hairCol||'#5cbf5a';
 if(layer==='back'){
  if(k==='long'){c.beginPath();c.moveTo(-14,-22);c.quadraticCurveTo(-26-ext*.6,-6+sec.y*.6,-22-ext*.8,14+sec.y);c.quadraticCurveTo(-16,18+sec.y*.8,-12,12);c.quadraticCurveTo(-16,-4,-6,-22);c.closePath();fillStroke(c,col,1.6)}
  if(k==='wolf'){for(let i=0;i<3;i++){const y=-18+i*7;c.beginPath();c.moveTo(-14,y);c.lineTo(-28-ext*.6-i*2,y+3+sec.y*.5);c.lineTo(-14,y+6);c.closePath();fillStroke(c,col,1.4)}}
  if(S.cape){c.beginPath();c.moveTo(-12,-6);c.quadraticCurveTo(-26-ext,6+sec.y*.6,-30-ext*1.2,20+sec.y);c.lineTo(-10,20);c.closePath();fillStroke(c,S.cape,1.6);if(S.capeTrim){c.strokeStyle=S.capeTrim;c.lineWidth=2;c.beginPath();c.moveTo(-30-ext*1.2,20+sec.y);c.lineTo(-10,20);c.stroke()}}
  return}
 c.save();c.translate(-2,-24);c.rotate(sway);
 if(k==='sprout'||k==='leaves'){c.scale(1,1-Math.max(-.25,Math.min(.25,sec.y*.025)));c.strokeStyle='#2f7d3c';c.lineWidth=1.8;c.beginPath();c.moveTo(0,1);c.quadraticCurveTo(1,-4,0,-7);c.stroke();
  c.beginPath();c.ellipse(-4,-8+lag*2,4.5,2.4,-.5-lag,0,TAU);fillStroke(c,'#5cbf5a',1.4);c.beginPath();c.ellipse(4,-9+lag*2,4.5,2.4,.5+lag,0,TAU);fillStroke(c,'#5cbf5a',1.4);
  if(k==='leaves'){c.beginPath();c.ellipse(0,-12+lag,3.4,5.4,0,0,TAU);fillStroke(c,'#7bd66f',1.3);c.beginPath();c.ellipse(-7,-4+lag*2,3.6,1.9,-.9-lag,0,TAU);fillStroke(c,'#3f9f4a',1.2)}}
 else if(k==='wave'){c.beginPath();c.moveTo(-8,3);c.quadraticCurveTo(-10,-8+lag*2,0,-11+lag*3);c.quadraticCurveTo(10,-12+lag*2,9,-4);c.quadraticCurveTo(5,-9,1,-5);c.quadraticCurveTo(4,-3,6,-5);c.quadraticCurveTo(3,1,-2,-2);c.quadraticCurveTo(-4,0,-2,3);c.closePath();fillStroke(c,col,1.5);c.strokeStyle='#d9fff9';c.lineWidth=1;c.beginPath();c.moveTo(-5,-4);c.quadraticCurveTo(-4,-8,1,-9);c.stroke()}
 else if(k==='spiky'){c.beginPath();c.moveTo(-14,4);const sp=[[-16,-9],[-9,-3],[-7,-17],[-1,-5],[3,-19],[6,-4],[13,-14],[11,0],[18,-4],[14,5]];for(const [x,y] of sp)c.lineTo(x-ext*.2,y+(y<-8?lag*3:lag));c.closePath();fillStroke(c,col,1.5);
  if(S.bolt){c.strokeStyle='#c4f6ff';c.lineWidth=1.2;c.beginPath();c.moveTo(3,-15);c.lineTo(0,-9);c.lineTo(3,-9);c.lineTo(0,-3);c.stroke()}}
 else if(k==='wolf'){c.beginPath();c.moveTo(-12,4);for(const [x,y] of [[-15,-6],[-8,-2],[-5,-12],[1,-4],[6,-13],[9,-2],[15,-6],[13,4]])c.lineTo(x,y+lag*(y<-8?2.5:1));c.closePath();fillStroke(c,col,1.5);c.strokeStyle='#a9b4c4';c.lineWidth=.9;c.beginPath();c.moveTo(-5,-9);c.lineTo(-3,-2);c.moveTo(6,-10);c.lineTo(5,-2);c.stroke()}
 else if(k==='long'){c.beginPath();c.moveTo(-14,6);c.quadraticCurveTo(-16,-10,0,-9);c.quadraticCurveTo(16,-10,18,4);c.quadraticCurveTo(8,-3,0,-1);c.quadraticCurveTo(-8,-3,-14,6);c.closePath();fillStroke(c,col,1.5);
  if(S.flower){c.save();c.translate(12,-7);for(let i=0;i<5;i++){c.rotate(TAU/5);c.beginPath();c.ellipse(0,-2.8,1.8,2.8,0,0,TAU);fillStroke(c,S.flower,1)}c.beginPath();c.arc(0,0,1.4,0,TAU);fillStroke(c,'#ffe27a',.9);c.restore()}}
 else if(k==='bun'){c.beginPath();c.moveTo(-14,5);c.quadraticCurveTo(-14,-9,1,-8);c.quadraticCurveTo(16,-8,17,5);c.quadraticCurveTo(2,-2,-14,5);c.closePath();fillStroke(c,col,1.5);
  c.beginPath();c.arc(-1+lag,-13+lag*2,5.5,0,TAU);fillStroke(c,col,1.5);c.strokeStyle='#efe8ff';c.lineWidth=1.4;c.beginPath();c.moveTo(-8,-17);c.lineTo(6,-9);c.stroke();c.fillStyle='#b9a6ff';c.beginPath();c.arc(-8,-17,1.6,0,TAU);c.fill()}
 c.restore();
}
function drawHeadwear(c,S,t,sec){
 // Faixa padrão com placa.
 if(S.top==='helmet'){
  c.beginPath();c.moveTo(-19,-12);c.quadraticCurveTo(-19,-30,1,-30);c.quadraticCurveTo(20,-30,20,-12);c.lineTo(15,-12);c.quadraticCurveTo(2,-15,-14,-11);c.closePath();fillStroke(c,S.helmCol,1.7);
  c.fillStyle=S.helmD;c.fillRect(-18,-14.5,37,2.6);c.strokeStyle=LINE;c.lineWidth=1.2;c.strokeRect(-18,-14.5,37,2.6);
  if(S.horns){ // armadura do dragão negro: chifres, crista e gema
   for(const sx of [-1,1]){const bx=sx*13;c.beginPath();c.moveTo(bx,-22);c.quadraticCurveTo(sx*25,-26+sec.y*.2,sx*26,-44+sec.y*.3);c.quadraticCurveTo(sx*17,-34,sx*7,-27);c.closePath();fillStroke(c,'#1b1226',1.6);
    c.strokeStyle='#a45bff';c.lineWidth=1.1;c.globalAlpha=.8;c.beginPath();c.moveTo(sx*13,-24);c.quadraticCurveTo(sx*23,-28,sx*25,-41+sec.y*.3);c.stroke();c.globalAlpha=1}
   for(const [x,h] of [[-6,9],[0,12],[6,9]]){c.beginPath();c.moveTo(x-3.2,-28);c.lineTo(x,-28-h+sec.y*.2);c.lineTo(x+3.2,-28);c.closePath();fillStroke(c,'#2a1a3d',1.2)}
   c.save();c.shadowColor='#ff2a4a';c.shadowBlur=6;c.beginPath();c.arc(1,-22,2.4,0,TAU);fillStroke(c,'#ff2a4a',1.1);c.restore();return}
  // Crista em V (kuwagata).
  c.beginPath();c.moveTo(4,-26);c.quadraticCurveTo(-6,-36,-10,-44+sec.y*.3);c.quadraticCurveTo(-2,-36,6,-29);c.quadraticCurveTo(14,-36,22,-42+sec.y*.3);c.quadraticCurveTo(16,-33,8,-26);c.closePath();fillStroke(c,S.armor||'#f2ca71',1.4);
  c.beginPath();c.arc(6,-24,2.6,0,TAU);fillStroke(c,'#c23634',1.1);return}
 if(S.top==='turban'){
  c.beginPath();c.moveTo(-19,-11);c.quadraticCurveTo(-21,-29,0,-30);c.quadraticCurveTo(20,-30,20,-11);c.quadraticCurveTo(2,-16,-19,-11);c.closePath();fillStroke(c,S.turbCol,1.7);
  c.strokeStyle=S.turbD;c.lineWidth=1.3;for(const y of [-24,-19,-15]){c.beginPath();c.moveTo(-17,y+3);c.quadraticCurveTo(0,y-3,18,y+1);c.stroke()}
  c.beginPath();c.arc(9,-21,2.4,0,TAU);fillStroke(c,'#c23634',1);return}
 if(S.top==='hood'){
  c.beginPath();c.moveTo(-20,-6);c.quadraticCurveTo(-22,-31,1,-31);c.quadraticCurveTo(21,-31,21,-12);c.lineTo(20,-11);c.quadraticCurveTo(2,-14,-17,-10);c.quadraticCurveTo(-18,-7,-20,-6);c.closePath();fillStroke(c,S.hoodCol,1.7);
  c.strokeStyle=S.band;c.lineWidth=1.6;c.beginPath();c.moveTo(-15,-17);c.quadraticCurveTo(2,-21,19,-15.5);c.stroke();return}
 c.beginPath();c.moveTo(-17.5,-17);c.quadraticCurveTo(0,-21,18.5,-16);c.lineTo(19,-10);c.quadraticCurveTo(0,-15,-18,-10.5);c.closePath();fillStroke(c,S.band,1.6);c.strokeStyle='#ffffff40';c.lineWidth=.9;c.beginPath();c.moveTo(-16,-16.2);c.quadraticCurveTo(0,-19.8,17,-15);c.stroke();
 c.beginPath();c.roundRect(2,-19.5,12,7,1.6);fillStroke(c,S.plate,1.3);c.fillStyle='#ffffff55';c.fillRect(3.2,-18.6,9.6,1.2);
 for(const [x,y] of [[3.6,-14],[12.4,-14],[3.6,-18],[12.4,-18]]){c.fillStyle='#6d747c';c.beginPath();c.arc(x,y,.5,0,TAU);c.fill()}
 if(S.crescent){c.strokeStyle='#7c69d8';c.lineWidth=1.3;c.beginPath();c.arc(8,-16,2.4,-1.3,1.3);c.stroke()}else emblem(c,8,-16,'#4a5058');
 if(S.crown){c.beginPath();c.moveTo(-12,-17);c.lineTo(-13,-31+sec.y*.2);c.lineTo(-6.5,-24);c.lineTo(0,-34+sec.y*.3);c.lineTo(6.5,-24);c.lineTo(13,-32+sec.y*.2);c.lineTo(12,-16);c.quadraticCurveTo(0,-20,-12,-17);c.closePath();fillStroke(c,'#ffd23a',1.7);
  c.fillStyle='#fff3a8';c.fillRect(-11,-21,23,2.2);for(const [x,y,col] of [[0,-27,'#e8344f'],[-8,-24,'#3fb6ff'],[8,-24,'#3fe0a0']]){c.beginPath();c.arc(x,y,1.9,0,TAU);fillStroke(c,col,1)}
  c.fillStyle='#fff';c.globalAlpha=.5+.5*Math.sin(t*5);c.beginPath();c.arc(-13,-31,1.6,0,TAU);c.arc(13,-32,1.6,0,TAU);c.fill();c.globalAlpha=1}
 if(S.halo){c.save();c.translate(2,-36+sec.y*.2);c.globalCompositeOperation='lighter';for(let k=0;k<2;k++){c.strokeStyle=k?S.halo:'#b06bff';c.globalAlpha=k?.95:.5;c.lineWidth=k?2:5;c.beginPath();c.ellipse(0,0,15,4.4,0,0,TAU);c.stroke()}c.globalAlpha=1;c.fillStyle='#fff';for(let i=0;i<3;i++){const a=t*2+i*2.09;c.beginPath();c.arc(Math.cos(a)*15,Math.sin(a)*4.4,1.5,0,TAU);c.fill()}c.restore()}
}

export function drawPotato(c,p,style='classic',outfit={},blade=null){
 const base=STYLES[style];if(!base)return false;
 // Na batata fofa, a skin da loja muda roupa e cabelo.
 const S=style==='cute'?{...base,...(SKINS[skinLook(outfit)]||{})}:base;PLATE=S.prem==='dragon';CUFF=S.sashD||null;
 const mir=(p.facing<0||c.getTransform().a<0)?-1:1,aimFx=(p.aimDx||0)*mir,aimFy=p.aimDy||0;
 const t=p.t||0,rush=Math.min(1,Math.max(0,p.smear||0)),pull=Math.min(1,Math.max(0,p.pull||0)),focus=Math.max(pull*.9,rush);
 const breath=Math.sin(t*3.3),sec=secondary(p,c),fl=Math.sin(t*5.5)*2.2*(1-Math.min(1,Math.abs(sec.y)/8))-rush*6+sec.y,ext=sec.x;
 const pmode=(p.artHappy||p.artWin>0)?'win':(rush>.35||p.artRage)?'attack':(pull>.2||p.artAim)?'aim':'idle';
 const aimPow=pmode==='aim'?Math.max(.35,Math.min(1,p.aimPow||.6)):0,aimOn=pmode==='aim'&&(p.aimDx||p.aimDy);
 if(aimOn){const nl=Math.hypot(aimFx,aimFy)||1,fx=aimFx/nl,fy=aimFy/nl,dn=Math.max(0,fy);p=Object.assign({},p,{drawn:1,blade:Math.atan2(fy,fx),hfx:16+fx*9,hfy:5+fy*12,ffx:13+aimPow*3+dn*4,fbx:-13-aimPow*3-dn*4,lookX:Math.max(-1.4,Math.min(1.4,fx*1.4)),lookY:fy*2.2-.1})}
 c.save();c.lineJoin='round';c.lineCap='round';
 if(pmode==='attack'){c.translate(0,6);c.rotate(.2+rush*.07);c.translate(0,-6)}else if(pmode==='aim'){const up=Math.max(0,-aimFy),dn=Math.max(0,aimFy);c.translate(0,22);c.rotate(-.09*aimPow+aimFy*.2);c.scale(1.04+.06*dn*aimPow,.95-.1*dn*aimPow+.04*up);c.translate(0,-22)}else if(pmode==='win'){c.translate(0,-Math.abs(Math.sin(t*6))*2.5)}
 {const st=sec.st||0;c.translate(0,22);c.scale(1-st*.6,1+st);c.translate(0,-22)}
 if(p.landSq>0){c.translate(0,22);c.scale(1+.17*p.landSq,1-.21*p.landSq);c.translate(0,-22)}
 if(pmode==='idle'&&!p.artAir){c.translate(0,22);c.rotate(Math.sin(t*1.3)*.02);c.translate(0,-22)}
 // 12% maior só no desenho (a caixa de colisão é a mesma) e rotação limitada na parede.
 {c.translate(0,22);c.scale(1.12,1.12);c.translate(0,-22);const r=p.rot||0,lim=1.05;if(Math.abs(r)>lim){c.translate(0,-2);c.rotate(-(r-Math.sign(r)*lim));c.translate(0,2)}}
 c.scale(1-breath*.018,1+breath*.026);
 // Espadas nas costas (cabos sobre os ombros).
 if(S.swords===2){backSword(c,-9,-6,-.65);if(!p.drawn)backSword(c,-3,-8,.35)}else if(S.swords===1&&!p.drawn)backSword(c,-7,-7,-.5);
 // Pontas da faixa ao vento (atrás da cabeça).
  const wv=Math.sin(t*7)*1.6,wv2=Math.sin(t*7+1.4)*1.6;
 ribbon(c,[-14,-12.5],[-22-ext*.3,-15+fl*.5+wv],[-29-ext*.7,-10+fl*.9-wv],[-37-rush*8-ext,-12+fl*1.3+wv2],3,2.4,S.tail);
 ribbon(c,[-14,-10.5],[-20-ext*.3,-8+fl*.4-wv2],[-25-ext*.6,-3+fl*.8+wv],[-32-rush*6-ext*.8,-1+fl*1.1-wv2],2.8,2.2,S.tailD);
 drawHair(c,S,t,sec,ext,'back');
 boot(c,p.fbx,p.fby,S.shoe||S.glove,true,S.sl);
 arm(c,-14,7,p.hbx,p.hby,S.shade);hand(c,p.hbx,p.hby,S.glove);
 // Corpo de batata.
 blob(c,0,-3,18.5,22);fillStroke(c,S.skin,2.4);
 c.save();blob(c,0,-3,18.5,22);c.clip();
 c.fillStyle=S.shade;c.beginPath();c.ellipse(-8,10,20,20,0,0,TAU);c.fill();c.fillStyle=S.skin;c.beginPath();c.ellipse(3,0,17,22,0,0,TAU);c.fill();
 c.fillStyle=S.light;c.globalAlpha*=.8;c.beginPath();c.ellipse(5,-15,6,4,-.4,0,TAU);c.fill();c.globalAlpha/=.8;
 c.fillStyle=S.dots;for(const [x,y,r] of [[-10,-12,1.3],[-5,-19,1],[9,-19,.9],[-13,0,1.1],[13,6,1],[-6,14,1.2],[8,15,.9],[-14,10,.8],[2,-21,.8]]){c.beginPath();c.ellipse(x,y,r*1.4,r,0,0,TAU);c.fill()}
 {const g=c.createLinearGradient(-14,-22,16,20);g.addColorStop(0,'#ffffff24');g.addColorStop(.45,'#ffffff00');g.addColorStop(1,'#00000034');c.fillStyle=g;c.fillRect(-24,-30,48,60);
  c.strokeStyle='#ffffff5a';c.lineWidth=1.7;c.beginPath();c.ellipse(-.5,-3,17.3,21.4,0,-1.0,.5);c.stroke();
  for(const [x,y] of [[-9,-13],[10,-19],[-12,3],[12,5],[-3,15]]){c.fillStyle='#00000026';c.beginPath();c.ellipse(x,y,1.9,1.2,.3,0,TAU);c.fill();c.fillStyle='#ffffff40';c.beginPath();c.ellipse(x-.4,y+.9,1.5,.5,.3,0,TAU);c.fill()}}
 if(S.prem){const ph=(t*.55)%1;c.save();c.globalCompositeOperation='lighter';c.rotate(.55);const gx=-42+ph*96,gr=c.createLinearGradient(gx,0,gx+16,0);gr.addColorStop(0,'rgba(255,255,255,0)');gr.addColorStop(.5,S.prem==='cosmic'?'rgba(255,200,250,.5)':'rgba(255,255,255,.55)');gr.addColorStop(1,'rgba(255,255,255,0)');c.fillStyle=gr;c.fillRect(gx,-50,16,100);c.restore();
  if(S.prem==='cosmic'){c.fillStyle='#fff';for(let i=0;i<10;i++){const x=Math.sin(i*12.9898)*13,y=Math.cos(i*7.233)*17-3,tw=.45+.55*Math.sin(t*3.2+i*2.1),r=(.7+(i%3)*.5)*tw;c.globalAlpha=tw;c.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*.3:r*1.8;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}c.globalAlpha=1}
  if(S.prem==='dragon'){c.strokeStyle='rgba(160,90,255,.38)';c.lineWidth=.9;for(let r=0;r<7;r++)for(let q=-3;q<=3;q++){const x=q*6+(r%2?3:0),y=-14+r*5;c.beginPath();c.arc(x,y,3.1,.15,Math.PI-.15);c.stroke()}
   const fl=.5+.5*Math.sin(t*3);c.fillStyle='rgba(255,40,70,'+(.25+.3*fl)+')';for(let i=0;i<5;i++){const x=Math.sin(i*4.1)*11,y=Math.cos(i*2.7)*14;c.beginPath();c.arc(x,y,1.1+fl*.5,0,TAU);c.fill()}}
  if(S.prem==='gold'){c.fillStyle='#fff';for(let i=0;i<4;i++){const x=Math.sin(i*5.3+1)*11,y=Math.cos(i*3.7)*14,tw=Math.max(0,Math.sin(t*4+i*1.7));c.globalAlpha=tw;c.beginPath();c.moveTo(x,y-3*tw);c.lineTo(x+.8,y-.8);c.lineTo(x+3*tw,y);c.lineTo(x+.8,y+.8);c.lineTo(x,y+3*tw);c.lineTo(x-.8,y+.8);c.lineTo(x-3*tw,y);c.lineTo(x-.8,y-.8);c.closePath();c.fill()}c.globalAlpha=1}}
 // Capuz (elite) cobre a parte de cima.
 if(S.hood){c.fillStyle=S.mask;c.beginPath();c.moveTo(-22,-26);c.lineTo(22,-26);c.lineTo(22,-12);c.quadraticCurveTo(2,-15,-22,-9);c.closePath();c.fill()}
 // Faixa da cintura.
 c.fillStyle=S.sash;c.beginPath();c.moveTo(-20,7.5);c.quadraticCurveTo(0,11.5,20,6.5);c.lineTo(20,11.5);c.quadraticCurveTo(0,16.5,-20,12.5);c.closePath();c.fill();
 c.fillStyle=S.sashD;c.beginPath();c.moveTo(-20,12.5);c.quadraticCurveTo(0,16.5,20,11.5);c.lineTo(20,13.1);c.quadraticCurveTo(0,18.1,-20,14.1);c.closePath();c.fill();
 // Máscara.
 if(S.faceWrap&&!S.mask)S.mask=S.faceWrap;
 if(S.mask){c.fillStyle=S.mask;c.beginPath();c.moveTo(-20,-3.5);c.quadraticCurveTo(4,-5.5,21,-4.5);c.lineTo(21,3.5);c.quadraticCurveTo(2,6.5,-20,4);c.closePath();c.fill();
  c.strokeStyle='#ffffff1c';c.lineWidth=1;c.beginPath();c.moveTo(-6,1);c.quadraticCurveTo(6,-1,16,0);c.stroke()}
 c.restore();
 blob(c,0,-3,18.5,22);c.strokeStyle=LINE;c.lineWidth=2.4;c.stroke();
 if(S.collar){for(let i=0;i<7;i++){const x=-15+i*5;c.beginPath();c.arc(x+1.5,7.2+Math.sin(i*1.1)*.8,3.3,0,TAU);fillStroke(c,'#fffaf0',1.2)}c.fillStyle='#2a1a28';for(const x of [-10,-1,8,15]){c.beginPath();c.ellipse(x,8.2,.7,1.3,0,0,TAU);c.fill()}}
 // Laço da faixa da cintura.
 if(S.armor){for(let i=0;i<3;i++){c.beginPath();c.ellipse(-12,0+i*3.4,8-i*.6,3.4,-.15,Math.PI,TAU);c.lineTo(-4,1+i*3.4);c.closePath();fillStroke(c,S.armor,1.3)}}

 if(S.prem==='dragon'){ // armadura do dragão negro: peitoral em lâminas, gema, ombreiras com espinhos e cinto
  c.beginPath();c.moveTo(-17,5);c.quadraticCurveTo(0,9.5,17,5);c.lineTo(14,16.5);c.quadraticCurveTo(0,20.5,-14,16.5);c.closePath();
  {const g=c.createLinearGradient(0,4,0,19);g.addColorStop(0,'#7a68a8');g.addColorStop(.5,'#3a2d58');g.addColorStop(1,'#1a1228');c.fillStyle=g;c.fill();c.lineWidth=1.8;c.strokeStyle=LINE;c.stroke()}
  c.strokeStyle='#a45bff';c.lineWidth=.9;for(let i=0;i<3;i++){const y=8.6+i*3.4;c.beginPath();c.moveTo(-15+i*1.3,y);c.quadraticCurveTo(0,y+3.4,15-i*1.3,y);c.stroke()}
  {const pl=.6+.4*Math.sin(t*4);c.save();c.shadowColor='#ff2a4a';c.shadowBlur=7*pl;c.beginPath();c.moveTo(0,6.4);c.lineTo(3.4,10.8);c.lineTo(0,15.6);c.lineTo(-3.4,10.8);c.closePath();fillStroke(c,'#ff2a4a',1.2);c.restore()}
  for(const sx of [-1,1]){c.beginPath();c.moveTo(sx*10,2.5);c.quadraticCurveTo(sx*24,-3,sx*23,9);c.quadraticCurveTo(sx*17,8.4,sx*10,9.4);c.closePath();fillStroke(c,'#4a3a70',1.6);
   c.strokeStyle='#a45bff';c.lineWidth=1;c.beginPath();c.moveTo(sx*12,3.6);c.quadraticCurveTo(sx*21,.2,sx*21.4,7.4);c.stroke();
   for(const [bx,by,tx,ty] of [[sx*17,.4,sx*21.5,-6.5],[sx*21,3.6,sx*27,-1.4]]){c.beginPath();c.moveTo(bx-2,by+1.6);c.lineTo(tx,ty);c.lineTo(bx+2.2,by+3);c.closePath();fillStroke(c,'#8a2cff',1.1)}}
  c.beginPath();c.moveTo(-19,15.2);c.quadraticCurveTo(0,19.4,19,15.2);c.lineTo(19,17.6);c.quadraticCurveTo(0,21.8,-19,17.6);c.closePath();fillStroke(c,'#1a1228',1.4);
  c.beginPath();c.moveTo(0,15.2);c.lineTo(3.2,18.4);c.lineTo(0,21.6);c.lineTo(-3.2,18.4);c.closePath();fillStroke(c,'#e6b92e',1.1)}
 // Laço da faixa: duas alças, nó central e pontinhas curtas.
 c.beginPath();c.moveTo(6.5,11);c.quadraticCurveTo(4.5,14.5,4,16.5);c.lineTo(6.6,15.6);c.quadraticCurveTo(7,13.5,7.6,11.6);c.closePath();fillStroke(c,S.sashD,1.1);
 c.beginPath();c.moveTo(8.6,11);c.quadraticCurveTo(10.8,14,11.6,16);c.lineTo(9.2,15.6);c.quadraticCurveTo(8.4,13.4,7.8,11.6);c.closePath();fillStroke(c,S.sashD,1.1);
 c.beginPath();c.ellipse(4.4,9.8,3.4,2.1,-.25,0,TAU);fillStroke(c,S.sash,1.2);c.beginPath();c.ellipse(11.6,9.6,3.4,2.1,.25,0,TAU);fillStroke(c,S.sash,1.2);
 c.beginPath();c.arc(8,10.2,1.9,0,TAU);fillStroke(c,S.sashD,1.2);
 if(S.prem!=='dragon'){c.beginPath();c.roundRect(-16,7.6,6,6.4,1.6);fillStroke(c,'#3a3340',1.2);c.fillStyle='#ffffff2c';c.fillRect(-15,8.5,4,.9);c.fillStyle=S.sash;c.beginPath();c.arc(-13,11.2,.9,0,TAU);c.fill()}
 if(S.mask){c.strokeStyle=LINE;c.lineWidth=1.6;c.beginPath();c.moveTo(-18,-4.2);c.quadraticCurveTo(4,-6.2,19.5,-5.2);c.stroke()}
 // Cabelo/broto e o que vai na cabeça.
 if(S.sprout||S.hair)drawHair(c,S,t,sec,ext,'front');
 drawHeadwear(c,S,t,sec);
 // Expressões: parado, mira (concentrada), ataque (grito) e vitória (feliz).
 const mode=(p.artHappy||p.artWin>0)?'win':(rush>.35||p.artRage)?'attack':(pull>.2||p.artAim)?'aim':(p.artAir&&p.artFall>.25)?'fall':'idle';
 const blink=Math.max(.1,1-(p.blink||0)*.92),lx=Math.max(-1.2,Math.min(1.2,p.lookX||0))*1.2,ly=(p.lookY||0)*.6;
 for(const [x,rx] of [[3.5,3.6],[13,3.2]]){
  const y=-7.2;
  if(mode==='win'){c.strokeStyle=LINE;c.lineWidth=2.2;c.beginPath();c.arc(x,y+1.6,2.9,Math.PI*1.1,Math.PI*1.9);c.stroke();continue}
  const h=4.4*blink*(mode==='aim'?.62:mode==='attack'?1.08:mode==='fall'?1.22:1);
  c.beginPath();c.ellipse(x,y,rx,h,0,0,TAU);fillStroke(c,S.glow?'#0b1018':'#ffffff',1.6);
  c.save();c.beginPath();c.ellipse(x,y,rx,h,0,0,TAU);c.clip();
  if(S.glow){c.shadowColor=S.iris;c.shadowBlur=6}
  const pr=mode==='attack'?.75:mode==='aim'?.85:1;
  c.fillStyle=S.iris;c.beginPath();c.ellipse(x+lx+.7,y+ly+.4,rx*.66*pr,3.2*pr,0,0,TAU);c.fill();c.strokeStyle='#00000066';c.lineWidth=.7;c.stroke();c.shadowBlur=0;
  if(!S.glow){c.fillStyle='#0b0a0f';c.beginPath();c.ellipse(x+lx+.8,y+ly+.6,rx*.36*pr,1.9*pr,0,0,TAU);c.fill()}
  c.fillStyle='#fff';c.beginPath();c.arc(x+lx+1.6,y+ly-1.2,S.glow?.6:1.05,0,TAU);c.fill();if(!S.glow){c.globalAlpha*=.75;c.beginPath();c.arc(x+lx-.3,y+ly+1.7,.55,0,TAU);c.fill();c.globalAlpha/=.75}
  // Pálpebra de cima na mira (olhar semicerrado).
  if(mode==='aim'){c.fillStyle=S.skin;c.beginPath();c.ellipse(x,y-h*.95,rx+1,h*.55,0,0,TAU);c.fill()}
  // Ataque: pálpebra em V (olhar furioso).
  if(mode==='attack'){c.fillStyle=S.skin;const inner=x<8?1:-1;c.beginPath();c.moveTo(x-rx-1,y-h-1);c.lineTo(x+rx+1,y-h-1);c.lineTo(x+rx+1,y-h+(inner>0?4.2:1.2));c.lineTo(x-rx-1,y-h+(inner>0?1.2:4.2));c.closePath();c.fill()}
  c.restore();
  if(mode!=='aim'&&mode!=='attack'){c.strokeStyle=LINE;c.lineWidth=1.9;c.beginPath();c.ellipse(x,y,rx+.2,h+.2,0,Math.PI*1.1,Math.PI*1.9);c.stroke()}
  if(S.lashes&&mode!=='aim'){c.strokeStyle=LINE;c.lineWidth=1.3;c.beginPath();c.moveTo(x+rx-.5,y-h+1);c.lineTo(x+rx+1.8,y-h-.6);c.moveTo(x+rx,y-h+2.4);c.lineTo(x+rx+2.2,y-h+1.6);c.stroke()}
  if(mode==='aim'){c.strokeStyle=LINE;c.lineWidth=2;c.beginPath();c.moveTo(x-rx-.3,y-h*.45);c.lineTo(x+rx+.3,y-h*.55);c.stroke()}
  if(mode==='attack'){const inner=x<8?1:-1;c.strokeStyle=LINE;c.lineWidth=2;c.beginPath();c.moveTo(x-rx-1,y-h+(inner>0?1.2:4.2));c.lineTo(x+rx+1,y-h+(inner>0?4.2:1.2));c.stroke()}
 }
 // Sobrancelhas.
 c.strokeStyle=LINE;c.lineWidth=2.4;c.beginPath();
 if(mode==='attack'){c.lineWidth=3;c.moveTo(-1.5,-15);c.lineTo(7.5,-10.5);c.moveTo(9.5,-10.5);c.lineTo(17.5,-15.2)}
 else if(mode==='aim'){c.lineWidth=2.8;c.moveTo(-.5,-11.8);c.lineTo(6.5,-11);c.moveTo(10,-11);c.lineTo(16.5,-11.9)}
 else if(mode==='aim'){c.moveTo(-.5,-12.6);c.lineTo(6.5,-11.6);c.moveTo(10,-11.6);c.lineTo(16.5,-12.8)}
 else if(mode==='fall'){c.lineWidth=2.4;c.moveTo(-.5,-14.4);c.quadraticCurveTo(3,-16,6.5,-14.2);c.moveTo(10,-14.2);c.quadraticCurveTo(13.5,-16,16.5,-14.4)}
 else if(mode==='win'){c.moveTo(0,-13.5);c.quadraticCurveTo(3.5,-15.5,7,-13.8);c.moveTo(10,-13.8);c.quadraticCurveTo(13.5,-15.5,16.5,-13.6)}
 else{c.moveTo(-.5,-12.6+(S.cute?.4:0));c.quadraticCurveTo(3,-13.6,6.5,-12.6);c.moveTo(10,-12.6);c.quadraticCurveTo(13.5,-13.6,16.5,-12.6)}
 c.stroke();
 // Bochechas.
 if(S.blush&&!S.mask){c.fillStyle='#ff8f8f';c.globalAlpha*=mode==='win'?.75:.45;c.beginPath();c.ellipse(1,-1,2.8,1.5,0,0,TAU);c.ellipse(16,-1.5,2.3,1.3,0,0,TAU);c.fill();c.globalAlpha/=mode==='win'?.75:.45}
 // Boca (só sem máscara).
 if(!S.mask){c.strokeStyle=LINE;c.lineWidth=1.5;
  if(mode==='idle'){c.beginPath();c.arc(9,-2,2.2,.25,Math.PI-.25);c.stroke()}
  else if(mode==='aim'){c.beginPath();c.moveTo(6.8,-.6);c.quadraticCurveTo(9,-1.2,11.2,-.9);c.stroke()}
  else if(mode==='fall'){c.beginPath();c.ellipse(9,.4,2.3,2.9,0,0,TAU);fillStroke(c,'#4a1620',1.4)}
  else if(mode==='attack'){c.beginPath();c.moveTo(4.5,-2);c.lineTo(14,-2.6);c.quadraticCurveTo(13.6,2.6,9.2,2.8);c.quadraticCurveTo(5,2.6,4.5,-2);c.closePath();fillStroke(c,'#ffffff',1.5);
   c.strokeStyle=LINE;c.lineWidth=.9;c.beginPath();c.moveTo(4.8,.2);c.lineTo(13.8,-.3);for(const x of [7,9.3,11.6]){c.moveTo(x,-2.3);c.lineTo(x,2.4)}c.stroke()}
  else{c.beginPath();c.moveTo(5.2,-2.2);c.quadraticCurveTo(9,-1.6,13,-2.4);c.quadraticCurveTo(12,3.4,9,3.4);c.quadraticCurveTo(6,3.2,5.2,-2.2);c.closePath();fillStroke(c,'#4a1620',1.4);c.fillStyle='#ff7d8c';c.beginPath();c.ellipse(9,2,2.2,1,0,0,TAU);c.fill()}
 }
 // Gota de concentração na mira; brilhinhos na vitória.
 if(mode==='win'){c.fillStyle='#ffe27a';for(const [x,y,r] of [[-17,-24,2.6],[21,-26,2],[24,-14,1.6]]){c.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,rr=k%2?r*.35:r;c.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr)}c.closePath();c.fill()}}
 boot(c,p.ffx,p.ffy,S.shoe||S.glove,false,S.sl);
 // Na vitória sem espada, a mão da frente sobe num soquinho no ar.
 let hx=p.hfx,hy=p.hfy;if(pmode==='win'&&!p.drawn){hx=25;hy=-17+Math.sin(t*6)*1.5}
 arm(c,15,7,hx,hy,S.skin);
 if(p.drawn&&!(blade&&blade(p.hfx,p.hfy,p.blade||0)))sword(c,p.hfx,p.hfy,p.blade||0,33,S.glow?S.iris:null);
 hand(c,hx,hy,S.glove);
 c.restore();
 return true;
}
