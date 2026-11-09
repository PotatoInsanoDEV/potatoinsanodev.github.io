// Legumes do mal — inimigos do modo Batata Ninja. Usam o mesmo esqueleto de pose dos inimigos originais
// (mãos, pés, ângulo da arma, alerta "!"), então lutam e morrem exatamente como antes.
const TAU=Math.PI*2,LINE='#16121a';
function fs(c,fill,w=2.1){if(fill){c.fillStyle=fill;c.fill()}c.strokeStyle=LINE;c.lineWidth=w;c.stroke()}
function ell(c,x,y,rx,ry,a=0){c.beginPath();c.ellipse(x,y,rx,ry,a,0,TAU)}
function blob(c,cx,cy,rx,ry,b=.04,ph=0){c.beginPath();for(let i=0;i<=36;i++){const a=i/36*TAU,k=1+b*Math.sin(3*a+ph)+b*.6*Math.sin(5*a+ph*2);const x=cx+Math.cos(a)*rx*k,y=cy+Math.sin(a)*ry*k;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath()}
function shade(c,col,dx=-8,dy=10,r=20){c.fillStyle=col;ell(c,dx,dy,r,r);c.fill()}

// Rosto bravo: sobrancelhas em V, olhos com íris colorida, boca de desdém ou dentes.
function face(c,p,x,y,s=1,iris='#d81f2a',mouth='grin',dark=false){
 c.save();c.translate(x,y);c.scale(s,s);
 const blink=Math.max(.15,1-(p.blink||0)*.9),wide=p.eyeWide>.5?1.2:1,lx=Math.max(-1,Math.min(1,p.lookX||0))*1.1;
 for(const ex of [0,9]){c.beginPath();c.moveTo(ex-3.6,-1);c.quadraticCurveTo(ex,-4.6*blink*wide,ex+3.6,-1.8);c.quadraticCurveTo(ex,2.6*blink,ex-3.6,-1);c.closePath();fs(c,dark?'#ffe9a8':'#fff6e8',1.4);
  c.fillStyle=iris;ell(c,ex+lx+.6,-.9,1.7,2*blink);c.fill();c.fillStyle='#120a0e';ell(c,ex+lx+.7,-.8,.8,1.2*blink);c.fill()}
 c.strokeStyle=LINE;c.lineWidth=2.4;c.beginPath();c.moveTo(-4.4,-6.4);c.lineTo(2.6,-3.4);c.moveTo(6.4,-3.4);c.lineTo(13.4,-6.6);c.stroke();
 if(mouth==='grin'){c.beginPath();c.moveTo(1,5);c.quadraticCurveTo(5,7.8,10,4.4);c.lineTo(9.4,6.4);c.quadraticCurveTo(5,9.6,1.4,6.8);c.closePath();fs(c,'#ffffff',1.3);c.lineWidth=.8;c.beginPath();c.moveTo(4,5.8);c.lineTo(4,8);c.moveTo(7,5.6);c.lineTo(7,7.8);c.stroke()}
 else if(mouth==='frown'){c.lineWidth=1.8;c.beginPath();c.moveTo(1.5,7);c.quadraticCurveTo(5,4.6,9.5,6.8);c.stroke()}
 else if(mouth==='fang'){c.beginPath();c.moveTo(1,4.8);c.quadraticCurveTo(5,6.4,10,4.4);c.stroke();c.beginPath();c.moveTo(3,5.4);c.lineTo(3.8,8);c.lineTo(4.8,5.6);c.closePath();fs(c,'#fff',1)}
 c.restore();
}
function mitt(c,x,y,col){ell(c,x,y,4.4,4.2);fs(c,col,1.7)}
function feet(c,p,col){for(const [x,y] of [[p.fbx,p.fby],[p.ffx,p.ffy]]){c.beginPath();c.moveTo(x-5,y+3);c.quadraticCurveTo(x-6,y-3,x,y-3);c.quadraticCurveTo(x+6,y-3,x+8,y+3);c.closePath();fs(c,col,1.6)}}
function leafTuft(c,x,y,col='#3f9f4a',n=3,len=10,sp=.5){for(let i=0;i<n;i++){const a=-Math.PI/2+(i-(n-1)/2)*sp;c.save();c.translate(x,y);c.rotate(a+Math.PI/2);c.beginPath();c.ellipse(0,-len/2,2.6,len/2,0,0,TAU);fs(c,col,1.4);c.restore()}}


// Braços: faltavam (só as mãos flutuavam). Parte do ombro até a mão, com contorno.
const ARM={tomato:'#a82029',eggplant:'#4a2166',carrot:'#c96a12',onion:'#8a6fb0',radish:'#b8305f',chili:'#8a0f19',pumpkin:'#c4601a',broccoli:'#6f9f45',corn:'#d49a1c',cauli:'#3f8a3c'};
function arm(c,sx,sy,x,y,col,w=3.6){const mx=(sx+x)/2,my=(sy+y)/2+4;c.strokeStyle=LINE;c.lineWidth=w+2.6;c.beginPath();c.moveTo(sx,sy);c.quadraticCurveTo(mx,my,x,y);c.stroke();c.strokeStyle=col;c.lineWidth=w;c.stroke()}

// ---------- corpos ----------
const BODIES={
 tomato(c,p){blob(c,0,-3,20,19,.03);fs(c,'#d8323a',2.3);c.save();blob(c,0,-3,20,19,.03);c.clip();shade(c,'#a82029');c.fillStyle='#d8323a';ell(c,4,-6,17,17);c.fill();c.fillStyle='#ff8a7a';ell(c,8,-14,5,3,-.4);c.fill();c.restore();
  c.beginPath();for(let i=0;i<5;i++){const a=-Math.PI/2+i*TAU/5;c.lineTo(Math.cos(a)*9,-21+Math.sin(a)*4);c.lineTo(Math.cos(a+.6)*3,-21+Math.sin(a+.6)*1.5)}c.closePath();fs(c,'#3f9f4a',1.4);face(c,p,2,-4,1,'#ffd23a','grin')},
 eggplant(c,p,royal){c.beginPath();c.moveTo(-6,-22);c.bezierCurveTo(-20,-18,-24,8,-12,19);c.bezierCurveTo(-2,25,16,22,19,8);c.bezierCurveTo(22,-6,10,-14,6,-22);c.closePath();fs(c,royal?'#3b1a52':'#5b2a7a',2.3);
  c.fillStyle=royal?'#5a2c7a':'#7d42a3';ell(c,6,-2,7,12,-.3);c.fill();c.beginPath();c.moveTo(-9,-21);c.lineTo(-4,-29);c.lineTo(0,-24);c.lineTo(5,-30);c.lineTo(8,-22);c.quadraticCurveTo(0,-17,-9,-21);c.closePath();fs(c,'#3f8f45',1.6);face(c,p,0,-3,royal?1.25:1.05,royal?'#ff3355':'#ffd23a','fang',royal);if(royal){c.strokeStyle='#ff3355';c.lineWidth=1;c.shadowColor='#ff3355';c.shadowBlur=8;c.beginPath();c.moveTo(-5,-8);c.lineTo(5,2);c.stroke();c.shadowBlur=0}},
 carrot(c,p){c.beginPath();c.moveTo(-15,-18);c.quadraticCurveTo(0,-26,15,-18);c.quadraticCurveTo(14,4,2,24);c.quadraticCurveTo(-1,26,-3,22);c.quadraticCurveTo(-15,2,-15,-18);c.closePath();fs(c,'#f28a1e',2.3);
  c.strokeStyle='#b85d0e';c.lineWidth=1.2;for(const y of [-6,3,12]){c.beginPath();c.moveTo(-10+y*.2,y);c.lineTo(-4+y*.2,y+1);c.stroke()}leafTuft(c,0,-22,'#3f9f4a',4,12,.45);face(c,p,0,-4,.95,'#2a8f3a','frown')},
 onion(c,p){c.beginPath();c.moveTo(0,-27);c.quadraticCurveTo(4,-20,16,-10);c.quadraticCurveTo(24,6,10,18);c.quadraticCurveTo(0,23,-10,18);c.quadraticCurveTo(-24,6,-16,-10);c.quadraticCurveTo(-4,-20,0,-27);c.closePath();fs(c,'#b9a0d8',2.3);
  c.strokeStyle='#8a6fb0';c.lineWidth=1.1;for(const k of [-8,8]){c.beginPath();c.moveTo(0,-24);c.quadraticCurveTo(k*1.8,0,k*.6,19);c.stroke()}c.strokeStyle='#e9e2f2';c.lineWidth=1;c.beginPath();c.moveTo(-3,-26);c.lineTo(-5,-31);c.moveTo(1,-26);c.lineTo(2,-32);c.stroke();face(c,p,0,-2,1,'#d81f2a','grin')},
 radish(c,p){blob(c,0,-1,17,17,.02);fs(c,'#e2457a',2.3);c.save();blob(c,0,-1,17,17,.02);c.clip();c.fillStyle='#fff0f4';ell(c,2,16,16,8);c.fill();c.restore();c.strokeStyle=LINE;c.lineWidth=1.6;c.beginPath();c.moveTo(2,16);c.quadraticCurveTo(3,24,1,28);c.stroke();leafTuft(c,0,-17,'#4fae52',3,13,.5);face(c,p,0,-3,1,'#ffd23a','frown')},
 chili(c,p){c.beginPath();c.moveTo(-12,-16);c.quadraticCurveTo(10,-22,16,-6);c.quadraticCurveTo(18,10,6,20);c.quadraticCurveTo(-2,26,-8,22);c.quadraticCurveTo(4,14,2,4);c.quadraticCurveTo(-4,-6,-12,-16);c.closePath();fs(c,'#b5121f',2.3);
  c.fillStyle='#ff5a62';ell(c,8,-10,4,2,-.5);c.fill();c.beginPath();c.moveTo(-12,-16);c.quadraticCurveTo(-16,-24,-8,-28);c.stroke();ell(c,-11,-17,5,3,-.4);fs(c,'#3f8f45',1.5);
  // máscara ninja
  c.fillStyle='#16121a';c.beginPath();c.moveTo(-6,-9);c.quadraticCurveTo(6,-12,17,-8);c.lineTo(17,-2);c.quadraticCurveTo(6,-5,-4,-3);c.closePath();c.fill();face(c,p,3,-5,.9,'#ffe14a','none',true)},
 pumpkin(c,p){for(const [x,rx] of [[-11,11],[11,11],[0,13]]){ell(c,x,-1,rx,19);fs(c,x?'#e2701c':'#f08a2a',2.3)}c.beginPath();c.moveTo(-2,-19);c.quadraticCurveTo(-1,-27,4,-29);c.lineTo(6,-26);c.quadraticCurveTo(2,-24,2,-19);c.closePath();fs(c,'#5a7a2e',1.5);
  // rosto entalhado com brilho
  c.fillStyle='#ffd23a';c.shadowColor='#ff8a2a';c.shadowBlur=6;for(const ex of [-3,9]){c.beginPath();c.moveTo(ex-4,-8);c.lineTo(ex+4,-5);c.lineTo(ex-3,-3);c.closePath();c.fill()}c.beginPath();c.moveTo(-6,4);c.lineTo(15,3);c.lineTo(12,9);c.lineTo(9,6);c.lineTo(6,10);c.lineTo(3,6);c.lineTo(0,10);c.lineTo(-4,8);c.closePath();c.fill();c.shadowBlur=0},
 broccoli(c,p){c.beginPath();c.moveTo(-7,4);c.lineTo(-6,20);c.lineTo(8,20);c.lineTo(9,4);c.closePath();fs(c,'#9bc96a',2.1);for(const [x,y,r] of [[-12,-8,9],[0,-15,11],[12,-8,9],[-6,-2,8],[7,-2,8]]){ell(c,x,y,r,r*.9);fs(c,'#3f8a3c',2)}
  c.fillStyle='#2c6a2c';for(const [x,y] of [[-12,-10],[-2,-18],[10,-12],[4,-6]]){ell(c,x,y,2,1.6);c.fill()}
  // máscara tengu vermelha com nariz longo
  c.beginPath();c.moveTo(-4,-8);c.quadraticCurveTo(6,-12,15,-7);c.lineTo(15,4);c.quadraticCurveTo(6,7,-4,3);c.closePath();fs(c,'#d0303a',1.6);c.beginPath();c.moveTo(12,-2);c.lineTo(27,-4);c.lineTo(13,2);c.closePath();fs(c,'#d0303a',1.4);face(c,p,1,-3,.8,'#ffe14a','none',true)},
 corn(c,p){c.beginPath();c.moveTo(-12,-20);c.quadraticCurveTo(0,-30,12,-20);c.lineTo(13,14);c.quadraticCurveTo(0,22,-13,14);c.closePath();fs(c,'#f2c43a',2.3);
  c.save();c.clip();c.strokeStyle='#d49a1c';c.lineWidth=1;for(let x=-12;x<14;x+=4.5){c.beginPath();c.moveTo(x,-26);c.lineTo(x,20);c.stroke()}for(let y=-22;y<20;y+=4.5){c.beginPath();c.moveTo(-14,y);c.lineTo(14,y);c.stroke()}c.restore();
  // palha como armadura
  for(const s of [-1,1]){c.beginPath();c.moveTo(s*13,-6);c.quadraticCurveTo(s*24,4,s*12,22);c.quadraticCurveTo(s*6,10,s*8,-4);c.closePath();fs(c,'#7fae4a',1.6)}
  c.beginPath();c.moveTo(-14,-20);c.lineTo(14,-20);c.lineTo(10,-27);c.lineTo(-10,-27);c.closePath();fs(c,'#2b2a36',1.5);face(c,p,0,-8,.95,'#d81f2a','frown')},
 cauli(c,p){c.beginPath();c.moveTo(-14,0);c.quadraticCurveTo(-18,18,0,20);c.quadraticCurveTo(18,18,14,0);c.closePath();fs(c,'#5cae5a',2.1);for(const [x,y,r] of [[-11,-6,9],[0,-12,11],[11,-6,9],[-5,1,8],[6,1,8]]){ell(c,x,y,r,r*.85);fs(c,'#f3ecd8',1.9)}face(c,p,0,-4,.95,'#d81f2a','grin')}
};
const BY_VARIANT={0:'tomato',1:'eggplant',2:'carrot',3:'onion',4:'radish',5:'chili',6:'pumpkin',7:'broccoli',8:'corn',9:'cauli'};
const HAT=new Set([0,2,4,9]);

function spear(c,p){c.save();c.translate(p.hfx,p.hfy);c.rotate(p.blade+Math.PI/2);c.strokeStyle=LINE;c.lineWidth=5;c.beginPath();c.moveTo(0,23);c.lineTo(0,-36);c.stroke();c.strokeStyle='#97704c';c.lineWidth=2.5;c.stroke();c.beginPath();c.moveTo(-5,-34);c.lineTo(0,-47);c.lineTo(5,-34);c.lineTo(0,-28);c.closePath();fs(c,'#dae9f5',2);c.restore()}
function bow(c,p){c.save();c.translate(p.hfx,p.hfy);c.rotate(p.blade);c.strokeStyle='#8a5a2a';c.lineWidth=3;c.beginPath();c.arc(0,0,18,-1.4,1.4);c.stroke();c.strokeStyle='#e9e2d0';c.lineWidth=1;c.beginPath();c.moveTo(3,-18);c.lineTo(3-(p.pull||0)*8,0);c.lineTo(3,18);c.stroke();c.restore()}
function shield(c,p){c.beginPath();c.roundRect(p.hfx-9,p.hfy-17,19,31,6);fs(c,'#4a3a5c',2);c.beginPath();c.roundRect(p.hfx-6,p.hfy-13,13,23,4);fs(c,'#8a7aa8',1.4);c.fillStyle='#3f8f45';c.beginPath();c.ellipse(p.hfx+.5,p.hfy-1,3,4,0,0,TAU);c.fill()}
function blade(c,x,y,a,short){c.save();c.translate(x,y);c.rotate(a);const len=short?23:34;c.beginPath();c.moveTo(3,-2.2);c.quadraticCurveTo(len*.55,-2.9,len,-2.4);c.lineTo(len+6,-.6);c.lineTo(len+1.5,1.8);c.quadraticCurveTo(len*.55,1.6,5,2.4);c.closePath();fs(c,'#e1ecf4',1.5);c.beginPath();c.roundRect(-1,-4.5,3,9,1);fs(c,'#e1b84e',1.2);c.beginPath();c.roundRect(-10,-2.4,10,4.8,2);fs(c,'#2b1f2a',1.2);c.restore()}
function kasa(c,p){c.save();c.translate(0,-24);c.rotate(p.hat||0);c.beginPath();c.moveTo(-28,3);c.lineTo(-3,-15);c.lineTo(8,-15);c.lineTo(29,3);c.lineTo(8,8);c.lineTo(-11,8);c.closePath();fs(c,'#d8b67a',2);c.beginPath();c.moveTo(-28,3);c.lineTo(29,3);c.lineTo(8,8);c.lineTo(-11,8);c.closePath();fs(c,'#9d7949',2);c.restore()}


// Kuro / chefe: berinjela imponente — aura, chifres, ombreiras e braceletes.
function aura(c,p){const t=p.t||0,k=.55+.25*Math.sin(t*3);c.save();const g=c.createRadialGradient(0,-2,6,0,-2,40);g.addColorStop(0,'rgba(255,40,90,'+(.38*k)+')');g.addColorStop(1,'rgba(120,0,60,0)');c.fillStyle=g;c.beginPath();c.arc(0,-2,40,0,TAU);c.fill();c.restore()}
function horns(c){for(const s of [-1,1]){c.beginPath();c.moveTo(s*9,-24);c.quadraticCurveTo(s*22,-26,s*21,-44);c.quadraticCurveTo(s*16,-33,s*5,-27);c.closePath();fs(c,'#e9dcc4',1.8);c.strokeStyle='#9c8a6a';c.lineWidth=1;c.beginPath();c.moveTo(s*13,-28);c.lineTo(s*17,-34);c.stroke()}}
function bracers(c,p){for(const [x,y] of [[p.hfx,p.hfy],[p.hbx,p.hby]]){c.save();c.translate(x,y);c.fillStyle='#f2b632';c.strokeStyle=LINE;c.lineWidth=1.3;c.beginPath();c.roundRect(-5,-8,10,4,1.5);c.fill();c.stroke();c.restore()}
 for(const s of [-1,1]){c.beginPath();c.moveTo(s*13,-9);c.lineTo(s*22,-15);c.lineTo(s*20,-4);c.lineTo(s*14,0);c.closePath();fs(c,'#2c1840',1.6);c.fillStyle='#f2b632';c.beginPath();c.moveTo(s*21,-15);c.lineTo(s*26,-21);c.lineTo(s*23,-12);c.closePath();c.fill()}}

export function drawVeggie(c,p){
 const v=p.variant||0,kind=BY_VARIANT[v]||'tomato',royal=!!p.royal&&v===1,ac=royal?'#34174a':(ARM[kind]||'#2b2430');
 c.save();c.lineJoin='round';c.lineCap='round';
 const b=Math.sin((p.t||0)*3.3);c.scale(1-b*.012,1+b*.018);
 if(royal)aura(c,p);
 if(royal)horns(c);
 if(!p.bare){arm(c,p.side?-17:-8,p.side?11:2,p.hbx,p.hby,ac);mitt(c,p.hbx,p.hby,'#2b2430');if(v===5)blade(c,p.hbx,p.hby,(p.blade||0)-.6,true)}
 feet(c,p,'#2b2430');
 BODIES[kind](c,p,p.royal);
 if(HAT.has(v)&&!p.bare)kasa(c,p);
 if(v===1&&!p.bare&&!p.royal){c.beginPath();c.moveTo(-16,-14);c.quadraticCurveTo(0,-30,17,-14);c.lineTo(15,-10);c.quadraticCurveTo(0,-22,-14,-10);c.closePath();fs(c,'#8e8d9d',1.8)}
 if(p.royal){c.beginPath();c.moveTo(-10,-24);c.lineTo(-11,-35);c.lineTo(-5,-29);c.lineTo(0,-38);c.lineTo(5,-29);c.lineTo(11,-35);c.lineTo(10,-24);c.closePath();fs(c,'#f2b632',1.6);c.fillStyle='#ff3355';c.beginPath();c.arc(0,-28,1.8,0,TAU);c.fill()}
 if(!p.bare){
  if(v===1&&!royal)shield(c,p);else if(v===2)bow(c,p);else if(v===0||v===4)spear(c,p);else blade(c,p.hfx,p.hfy,p.blade||0,v===5||v===7);
  arm(c,p.side?17:9,p.side?11:2,p.hfx,p.hfy,ac);mitt(c,p.hfx,p.hfy,'#2b2430');
  if(royal)bracers(c,p);
 }
 if(p.mark>.2){c.font='bold 18px sans-serif';c.textAlign='center';c.strokeStyle=LINE;c.lineWidth=3;c.strokeText('!',0,-49);c.fillStyle='#ffcf55';c.fillText('!',0,-49)}
 c.restore();
}
export const VEGGIE_NAMES={tomato:'Tomate',eggplant:'Berinjela',carrot:'Cenoura',onion:'Cebola',radish:'Rabanete',chili:'Pimenta',pumpkin:'Abóbora',broccoli:'Brócolis',corn:'Milho',cauli:'Couve-flor'};
export {BY_VARIANT};
