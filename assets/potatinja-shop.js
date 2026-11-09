// Potatinja — Loja: diamantes (dinheiro real via Google Play Billing), skins lendárias, armas animadas, pets e rastros.
// REGRA: nada aqui dá vantagem na fase (tudo é cosmético), para o ranking continuar justo.
// Compra real só liga quando o app roda como app Android (TWA) com produtos criados no Play Console.
import {drawPotato} from './duck-potato.js';
const KEY='potatinja.shop.v1';
const load=()=>{try{const o=Object.assign({gems:0,owned:{},pet:'',trail:'',firstDone:false,adDay:'',adN:0,adLast:0},JSON.parse(localStorage.getItem(KEY))||{});o.trail='';return o}catch{return{gems:0,owned:{},pet:'',trail:'',firstDone:false}}};
let S=load();const save=()=>{try{localStorage.setItem(KEY,JSON.stringify(S))}catch{}};
const sfx=n=>{try{window.potatinjaSFX?.[n]?.()}catch{}};
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const coins=()=>{try{return globalThis.__bt?.wallet??0}catch{return 0}};

// ---------- catálogo ----------
export const PACKS=[
 {sku:'potatinja_starter',name:'Kit Dragão Negro',gems:120,price:'R$ 19,90',was:'R$ 60,00',once:true,kit:true,tag:'1ª RECARGA'},
 {sku:'potatinja_gems_100',name:'Punhado',gems:100,price:'R$ 4,99'},
 {sku:'potatinja_gems_230',name:'Saquinho',gems:230,price:'R$ 9,99',tag:'+15%'},
 {sku:'potatinja_gems_520',name:'Baú',gems:520,price:'R$ 19,99',tag:'+30%'},
 {sku:'potatinja_gems_1500',name:'Cofre',gems:1500,price:'R$ 49,99',tag:'MELHOR VALOR',best:true}
];
const SKINS=[{id:'pgold',name:'Batata Dourada',gems:400,hair:9},{id:'cosmic',name:'Batata Cósmica',gems:450,hair:10},{id:'royal',name:'Batata Real',gems:500,hair:11},{id:'blackdragon',name:'Armadura do Dragão Negro',hair:12,kit:true}];
const WEAPONS=[{id:'aurora',name:'Katana Aurora',gems:300,cols:['#f0fff9','#7dffd8','#9a6bff'],glow:'#7dffd8'},{id:'galaxy',name:'Katana Galáxia',gems:350,cols:['#ffffff','#7a8cff','#ff5fd2'],glow:'#7a8cff'},{id:'dragon',name:'Machado do Dragão',gems:450,shape:'axe',cols:['#fff3c4','#ffb21a','#e02a2a'],glow:'#ffb21a'},{id:'lotus',name:'Naginata Lótus',gems:450,shape:'naginata',cols:['#fff0f7','#ff9ccb','#d64a8c'],glow:'#ff8fc7'},{id:'reaper',name:'Foice Eclipse',gems:550,shape:'scythe',cols:['#ffd2dc','#ff3b6b','#4b1a7a'],glow:'#ff3b6b'},{id:'shadowfang',name:'Adaga Negra',shape:'dagger',kit:true,cols:['#e8d0ff','#8a2cff','#2a0f4a'],glow:'#8a2cff'}];
const PETS=[{id:'sprout',name:'Brotinho',coins:5000},{id:'star',name:'Shuriken Flutuante',gems:180},{id:'kuro',name:'Mini-Kuro',gems:250},{id:'drago',name:'Dragão Negro',kit:true}];
const TRAILS=[];const _OLD_TRAILS=[{id:'stardust',name:'Poeira de Estrelas',gems:120,cols:['#fff3c4','#ffd23a']},{id:'sakura',name:'Pétalas',gems:140,cols:['#ffd1e6','#ff8fc7']},{id:'flame',name:'Chama',gems:160,cols:['#ffe08a','#ff7a1a']},{id:'rainbow',name:'Arco-Íris',gems:220,cols:['#ff5f5f','#ffd23a','#5fff8a','#5fc8ff','#b06bff']}];

// ---------- anúncio premiado (provedor plugável) ----------
// Para ligar: defina window.potatinjaAds={available:()=>bool, showRewarded:async(placement)=>'done'|'dismissed'|'error'}
const AD={gems:10,perDay:4,cooldown:300000};
const today=()=>new Date().toISOString().slice(0,10);
const adState=()=>{if(S.adDay!==today()){S.adDay=today();S.adN=0}const wait=Math.max(0,(S.adLast||0)+AD.cooldown-Date.now());return{left:AD.perDay-S.adN,wait}};
const adProvider=()=>{const a=window.potatinjaAds;if(a&&a.available?.())return a;if(['localhost','127.0.0.1'].includes(location.hostname)&&location.search.includes('fakeads'))return{showRewarded:async()=>{await new Promise(r=>setTimeout(r,1500));return'done'}};return null};
const owns=id=>!!S.owned[id];
window.potatinjaShop={owns,gems:()=>S.gems,get pet(){return S.pet},get trail(){return S.trail},open:()=>open(),openTab:t=>open(t),kitOwned:()=>!!S.owned.blackdragon,kitPrice:()=>(billing.details.potatinja_starter||'R$ 19,90')};

// ---------- Google Play Billing (Digital Goods API, só no app Android/TWA) ----------
const billing={available:false,svc:null,details:{},
 async init(){try{if(!('getDigitalGoodsService' in window))return;this.svc=await window.getDigitalGoodsService('https://play.google.com/billing');
   const d=await this.svc.getDetails(PACKS.map(p=>p.sku));d.forEach(x=>{this.details[x.itemId]=x.price?.value?new Intl.NumberFormat(undefined,{style:'currency',currency:x.price.currency}).format(+x.price.value):''});
   this.available=d.length>0;this.restore()}catch{this.available=false}},
 tokens(){try{return JSON.parse(localStorage.getItem('potatinja.tok')||'[]')}catch{return[]}},
 mark(t){try{const a=this.tokens();a.push(t);localStorage.setItem('potatinja.tok',JSON.stringify(a.slice(-40)))}catch{}},
 // compras pendentes (ex.: o app fechou no meio da compra): entrega e consome, sem duplicar
 async restore(){try{const l=await this.svc.listPurchases();let any=false;for(const p of l){const pk=PACKS.find(x=>x.sku===p.itemId);if(!pk)continue;if(!this.tokens().includes(p.purchaseToken)){this.mark(p.purchaseToken);grant(pk);any=true}try{await this.svc.consume(p.purchaseToken)}catch{}}if(any)afterKit()}catch{}},
 async buy(pack){if(!this.available)return false;
  const req=new PaymentRequest([{supportedMethods:'https://play.google.com/billing',data:{sku:pack.sku}}]);
  let res;try{res=await req.show()}catch(e){return false}   // cancelado pelo jogador
  const token=res.details?.purchaseToken;
  try{await res.complete('success')}catch{}
  if(token&&this.tokens().includes(token))return true;
  if(token)this.mark(token);
  grant(pack);                                                   // entrega primeiro (o jogador já pagou)
  if(token){try{await this.svc.consume(token)}catch{}}
  return true}};
function afterKit(){if(S.owned.blackdragon&&!S._kitReloaded){S._kitReloaded=1;setTimeout(()=>location.reload(),1200)}}
function grant(p){S.gems+=p.gems;if(p.kit){S.owned.blackdragon=S.owned.shadowfang=S.owned.pet_drago=true;if(!S.pet)S.pet='drago'}if(p.coins)try{globalThis.__bt?.addCoins?.(p.coins)}catch{}if(p.once)S.firstDone=true;save();paintWallet()}
billing.init();

// ---------- desenhos (prévia e jogo) ----------
const TAU=Math.PI*2;
function basePose(t=0){return {kind:'hero',x:0,y:0,rot:0,sx:1,sy:1,stretch:1,facing:1,scale:1,alpha:1,lookX:0,lookY:0,blink:0,brow:.12,eyeGlow:0,eyeWide:0,drawn:0,blade:-.3,hfx:25,hfy:11,hbx:-25,hby:11,ffx:11,ffy:20.5,fbx:-11,fby:20.5,glow:0,smear:0,hat:0,mark:0,hairX:0,hairY:0,bare:false,variant:0,pull:0,mood:0,t,duckPreview:true,simNow:t}}
export function drawPet(c,id,x,y,t,s=1,face=1){
 c.save();c.translate(x,y);c.scale(s*face,s);const bob=Math.sin(t*4)*1.6;c.translate(0,bob);c.lineJoin='round';c.lineCap='round';
 const INK='#16121a',fs=(f,w=1.6)=>{c.fillStyle=f;c.fill();c.strokeStyle=INK;c.lineWidth=w;c.stroke()};
 const rg=(cx,cy,r0,r1,stops)=>{const g=c.createRadialGradient(cx,cy,r0,cx,cy,r1);stops.forEach(([o,col])=>g.addColorStop(o,col));return g};
 const blink=((t*.8)%3.1)<.13?.12:1;
 const eye=(ex,ey,rx,ry,iris,glowc)=>{c.save();if(glowc){c.shadowColor=glowc;c.shadowBlur=7}c.beginPath();c.ellipse(ex,ey,rx,ry*blink,0,0,TAU);c.fillStyle=iris;c.fill();c.restore();if(blink>.5){c.fillStyle='#fff';c.beginPath();c.arc(ex+rx*.35,ey-ry*.35,rx*.38,0,TAU);c.fill()}};
 if(id==='sprout'){
  const step=Math.sin(t*9);for(const sx of[-1,1]){c.beginPath();c.ellipse(sx*4.5,10.5+Math.max(0,sx*step)*-1.6,3.2,2,0,0,TAU);fs('#c98a3c',1.3)}
  c.beginPath();c.ellipse(0,0,10.5,11.5,0,0,TAU);c.fillStyle=rg(-3,-5,1,14,[[0,'#ffe29a'],[.55,'#e9b45c'],[1,'#b8822f']]);c.fill();c.strokeStyle=INK;c.lineWidth=1.8;c.stroke();
  c.fillStyle='#a06b2655';for(const[dx,dy]of[[-6,3],[5,5],[7,-4],[-5,-6]]){c.beginPath();c.ellipse(dx,dy,.9,.7,0,0,TAU);c.fill()}
  c.fillStyle='#ff9a8a99';c.beginPath();c.ellipse(-6.2,2.5,2.2,1.3,0,0,TAU);c.ellipse(6.2,2.5,2.2,1.3,0,0,TAU);c.fill();
  eye(-3.6,-1.5,2.2,2.7,'#241418');eye(3.6,-1.5,2.2,2.7,'#241418');
  c.strokeStyle=INK;c.lineWidth=1.2;c.beginPath();c.arc(0,2.2,1.8,.2,Math.PI-.2);c.stroke();
  const w=Math.sin(t*5);c.strokeStyle='#2f7d3c';c.lineWidth=1.8;c.beginPath();c.moveTo(0,-11);c.quadraticCurveTo(1+w,-15,w*1.5,-18);c.stroke();
  for(const sx of[-1,1]){c.save();c.translate(w*1.5,-18);c.rotate(sx*(.55+w*.25)-.15);c.beginPath();c.ellipse(sx*4.6,0,5,2.5,0,0,TAU);fs(sx>0?'#7bd66f':'#5cbf5a',1.2);c.restore()}
  c.beginPath();c.ellipse(w*1.5,-20.5,2.2,3.6,0,0,TAU);fs('#9be58a',1.1)}
 else if(id==='star'){
  const core=.5+.5*Math.sin(t*5);
  c.save();c.globalCompositeOperation='lighter';const hg=rg(0,0,2,22,[[0,'rgba(84,230,210,'+(.55+core*.3)+')'],[1,'rgba(84,230,210,0)']]);c.fillStyle=hg;c.beginPath();c.arc(0,0,22,0,TAU);c.fill();c.restore();
  for(let gI=3;gI>=0;gI--){c.save();c.rotate(t*6-gI*.32);c.globalAlpha=gI?.14:1;c.beginPath();for(let k=0;k<4;k++){const a=k*Math.PI/2;c.moveTo(0,0);c.quadraticCurveTo(Math.cos(a+.2)*7,Math.sin(a+.2)*7,Math.cos(a)*14,Math.sin(a)*14);c.quadraticCurveTo(Math.cos(a-.55)*8,Math.sin(a-.55)*8,0,0)}c.closePath();
   if(!gI){const g=c.createLinearGradient(-12,-12,12,12);g.addColorStop(0,'#ffffff');g.addColorStop(.5,'#b9cbdc');g.addColorStop(1,'#6f8aa6');c.fillStyle=g;c.fill();c.strokeStyle=INK;c.lineWidth=1.6;c.stroke()}else{c.fillStyle='#54e6d2';c.fill()}c.restore()}
  c.beginPath();c.arc(0,0,5.2,0,TAU);c.fillStyle=rg(0,0,1,6,[[0,'#eafffb'],[1,'#54e6d2']]);c.fill();c.strokeStyle=INK;c.lineWidth=1.3;c.stroke();
  eye(-1.9,-.4,1.2,1.5,'#14303a');eye(1.9,-.4,1.2,1.5,'#14303a');
  for(let o=0;o<3;o++){const a=t*3+o*2.094;c.fillStyle='#fff';c.globalAlpha=.85;c.beginPath();c.arc(Math.cos(a)*17,Math.sin(a)*17,1.3,0,TAU);c.fill()}c.globalAlpha=1}
 else if(id==='drago'){ // dragão negro imponente: asas de morcego, cauda com espinhos, cabeça angular
  const fl=Math.sin(t*6),fl2=Math.sin(t*6-.8);c.scale(.8,.8);
  const wing=(far)=>{c.save();c.translate(-3,-5);const a=(far?-.22:0)+fl*.2;c.rotate(a);
   c.beginPath();c.moveTo(0,0);c.lineTo(-10,-27);c.lineTo(-20,-9);c.lineTo(-31,-19);c.lineTo(-27,-1);c.lineTo(-37,6);c.lineTo(-20,6);c.lineTo(-9,9);c.closePath();fs(far?'#2a1048':'#45207a',1.6);
   c.strokeStyle=far?'#7a3fd0':'#b36bff';c.lineWidth=1.3;c.beginPath();c.moveTo(0,0);c.lineTo(-10,-27);c.moveTo(0,0);c.lineTo(-31,-19);c.moveTo(0,0);c.lineTo(-37,6);c.stroke();c.restore()};
  wing(true);
  c.beginPath();c.moveTo(-9,3);c.bezierCurveTo(-19,2,-25,9+fl2*2,-34,5+fl2*3);c.lineTo(-41,9+fl2*3);c.lineTo(-33,12+fl2*3);c.bezierCurveTo(-24,16,-15,12,-8,9);c.closePath();fs('#1a1226',1.5);
  c.fillStyle='#8a2cff';for(const [px,py] of [[-16,5],[-22,7],[-28,8]]){c.beginPath();c.moveTo(px-2,py-1);c.lineTo(px-1,py-6-fl2);c.lineTo(px+2,py-1);c.closePath();c.fill();c.stroke()}
  for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*5-1,10);c.lineTo(sx*5+2,17);c.lineTo(sx*5+5,16);c.lineTo(sx*5+3,9);c.closePath();fs('#1c1226',1.2);c.fillStyle='#e8d8ff';for(const dx of[2,4.2,6.4]){c.beginPath();c.moveTo(sx*5+dx-1,16.2);c.lineTo(sx*5+dx,19.2);c.lineTo(sx*5+dx+1,16.2);c.fill()}}
  c.beginPath();c.moveTo(-10,2);c.bezierCurveTo(-8,-8,6,-9,12,-4);c.bezierCurveTo(16,0,14,9,6,11);c.bezierCurveTo(-3,13,-11,9,-10,2);c.closePath();
  c.fillStyle=rg(-2,-5,1,18,[[0,'#4a3a66'],[.55,'#1f1530'],[1,'#0b0712']]);c.fill();c.strokeStyle=INK;c.lineWidth=1.8;c.stroke();
  c.strokeStyle='#a45bff66';c.lineWidth=.9;for(let k=0;k<4;k++){c.beginPath();c.moveTo(-6+k*1.2,3+k*2.2);c.quadraticCurveTo(2,5+k*2.2,10-k*1.5,2+k*2.2);c.stroke()}
  {const pl=.55+.45*Math.sin(t*4);c.save();c.shadowColor='#ff2a4a';c.shadowBlur=8*pl;c.fillStyle='#ff4a5a';c.beginPath();c.arc(3,3,2.1,0,TAU);c.fill();c.restore()}
  c.fillStyle='#8a2cff';for(let k=0;k<4;k++){const bx=-7+k*4.6,by=-6.4+(k===0?2.6:k===3?3.4:0);c.beginPath();c.moveTo(bx-2.2,by+1);c.lineTo(bx,by-5.6);c.lineTo(bx+2.2,by+1);c.closePath();c.fill();c.strokeStyle=INK;c.lineWidth=1;c.stroke()}
  c.beginPath();c.moveTo(6,-4);c.bezierCurveTo(7,-13,11,-16,14,-17);c.lineTo(17,-12);c.bezierCurveTo(14,-9,13,-5,12,-2);c.closePath();fs('#241a38',1.6);
  for(const [ox,len] of [[0,12],[4.5,9]]){c.beginPath();c.moveTo(11+ox,-17);c.quadraticCurveTo(7+ox,-24,-1+ox,-18-len*.5+ox*.2);c.quadraticCurveTo(7+ox,-18,13+ox,-14);c.closePath();fs('#7a3fd0',1.2)}
  c.beginPath();c.moveTo(11,-18);c.bezierCurveTo(17,-22,27,-19,34,-13);c.lineTo(32,-9);c.lineTo(23,-9);c.lineTo(15,-7);c.bezierCurveTo(11,-9,9,-14,11,-18);c.closePath();fs('#2e2148',1.7);
  c.beginPath();c.moveTo(15,-8);c.lineTo(31,-8.6);c.lineTo(28,-4);c.lineTo(16,-4.4);c.closePath();fs('#1a1226',1.4);
  c.fillStyle='#fff';c.beginPath();for(const tx of [19,23,27]){c.moveTo(tx-1.2,-8.4);c.lineTo(tx,-5.6);c.lineTo(tx+1.2,-8.4)}c.fill();
  c.strokeStyle='#a45bff';c.lineWidth=1;c.beginPath();c.moveTo(14,-17);c.lineTo(10,-23.5);c.moveTo(18,-19.6);c.lineTo(17,-26);c.stroke();
  c.save();c.shadowColor='#ff2a4a';c.shadowBlur=9;c.beginPath();c.moveTo(17,-15.4);c.lineTo(24,-16.8);c.lineTo(22.4,-13.4);c.lineTo(17.4,-13.2);c.closePath();c.fillStyle='#ff2a4a';c.fill();c.restore();
  c.strokeStyle=INK;c.lineWidth=1.3;c.beginPath();c.moveTo(16.4,-17.4);c.lineTo(25,-18.6);c.stroke();
  c.fillStyle='#ff6a3a';c.beginPath();c.arc(31.4,-12,.9,0,TAU);c.fill();
  wing(false)}
 else if(id==='kuro'){
  const fw=Math.sin(t*7);
  c.save();c.globalCompositeOperation='lighter';for(let k=0;k<4;k++){const u=k/3,wx=Math.sin(t*8+k*1.3)*3;c.fillStyle='rgba('+(150-k*20)+',70,'+(255-k*20)+','+(.5-u*.35)+')';c.beginPath();c.ellipse(12+k*5+wx*.3,6-k*4+wx,6-k*1.1,3.4-k*.5,.5,0,TAU);c.fill()}c.restore();
  c.beginPath();c.moveTo(-4,-10);c.bezierCurveTo(-13,-8,-14,5,-6,11);c.bezierCurveTo(0,14,9,12,11,4);c.bezierCurveTo(13,-3,6,-8,4,-10);c.closePath();c.fillStyle=rg(-3,-6,1,18,[[0,'#9a58d6'],[.6,'#5a2a88'],[1,'#32124f']]);c.fill();c.strokeStyle=INK;c.lineWidth=1.7;c.stroke();
  for(const sx of[-1,1]){c.beginPath();c.moveTo(sx*5,-9);c.quadraticCurveTo(sx*11,-10,sx*9.5,-18);c.quadraticCurveTo(sx*7,-12.5,sx*3,-10);c.closePath();fs('#f1e6cf',1.1)}
  c.beginPath();c.moveTo(-5.5,-10.5);c.lineTo(-3.5,-15);c.lineTo(0,-11.5);c.lineTo(3.5,-15);c.lineTo(5.5,-10.5);c.closePath();fs('#ffcf3a',1.1);c.fillStyle='#ff4f6a';c.beginPath();c.arc(0,-12,.9,0,TAU);c.fill();
  eye(-3.4,-1.5,2.1,2.4,'#ff3355','#ff3355');eye(4,-1.5,2.1,2.4,'#ff3355','#ff3355');
  c.strokeStyle=INK;c.lineWidth=1.4;c.beginPath();c.moveTo(-6,-5.2);c.lineTo(-1.5,-3.2);c.moveTo(7,-5.2);c.lineTo(2.5,-3.2);c.stroke();
  c.beginPath();c.moveTo(-2.4,3);c.quadraticCurveTo(.3,5.4,3.2,3);c.stroke();c.fillStyle='#fff';c.beginPath();c.moveTo(-1.6,3.7);c.lineTo(-.9,5.3);c.lineTo(-.2,4.1);c.moveTo(1,4.2);c.lineTo(1.7,5.3);c.lineTo(2.3,3.7);c.fill();
  for(const sx of[-1,1]){c.beginPath();c.ellipse(sx*11,2+fw*sx*1.2,2.6,2,0,0,TAU);fs('#5a2a88',1.2)}}
 c.restore()}
function petFx(sy,id,x,y,k,dt){
 if(id==='star')sy.rate('pf',22,dt,()=>sy.add({kind:'star',x:x+rnd(-8,8)*k,y:y+rnd(-8,8)*k,vx:rnd(-30,30),vy:rnd(-30,30),size:rnd(2.5,5)*k,max:rnd(.4,.8),col:pick(['#54e6d2','#ffffff','#9ef6ff']),vr:rnd(-4,4),drag:.96}));
 else if(id==='drago')sy.rate('pf',30,dt,()=>sy.add({kind:'dark',x:x+rnd(24,28)*k,y:y+rnd(-12,-8)*k,vx:rnd(15,45)*k,vy:rnd(-30,-6)*k,size:rnd(3,6.5)*k,max:rnd(.4,.8),col:'#0a0610',col2:'#ff3a3a',drag:.97}));
 else if(id==='kuro')sy.rate('pf',26,dt,()=>sy.add({kind:'flame',x:x+rnd(8,18)*k,y:y+rnd(-2,8)*k,vx:rnd(10,40)*k,vy:rnd(-50,-10)*k,size:rnd(4,8)*k,max:rnd(.4,.7),col:'#e9b8ff',mid:'#9b4fe0',col2:'#3a1a5c',drag:.97}));
 else if(id==='sprout')sy.rate('pf',7,dt,()=>sy.add({kind:'petal',x:x+rnd(-6,6)*k,y:y-14*k+rnd(-3,3)*k,vx:rnd(-20,20),vy:rnd(5,25),g:20,size:rnd(2.5,3.8)*k,max:rnd(.8,1.3),col:pick(['#9be58a','#c8f5b0']),col2:'#4fae48',vr:rnd(-4,4),sway:14,drag:.99}))}
function drawBlade(c,x,y,len,w,cols,glow,t,shape){c.save();c.translate(x,y);c.rotate(-.7);
 if(shape&&window.pnShapeDraw){c.fillStyle='#1d1b22';c.beginPath();c.roundRect(-len*.3,-5,len*.3,10,4);c.fill();window.pnShapeDraw(c,shape,len*.9,len/17.5,{cols,glow,edge:cols[0],line:'#1a0f2e',t,v:.8+.2*Math.sin(t*3)});c.restore();return}
c.shadowColor=glow;c.shadowBlur=14+Math.sin(t*5)*4;
 const g=c.createLinearGradient(0,0,len,0);cols.forEach((col,i)=>g.addColorStop(i/(cols.length-1),col));
 c.beginPath();c.moveTo(0,-w);c.lineTo(len,-w*.6);c.lineTo(len+w*2.2,0);c.lineTo(len,w*.6);c.lineTo(0,w);c.closePath();c.fillStyle=g;c.fill();c.strokeStyle='#10202c';c.lineWidth=2;c.stroke();c.shadowBlur=0;
 c.fillStyle='#e1b84e';c.fillRect(-4,-w*1.6,4,w*3.2);c.fillStyle='#1d1b22';c.fillRect(-20,-w*.7,16,w*1.4);
 for(let i=0;i<7;i++){const u=(t*.8+i/7)%1;c.globalAlpha=1-u;c.fillStyle=cols[i%cols.length];c.beginPath();c.arc(u*len,Math.sin(u*9+i)*w*1.6,2.2*(1-u)+.5,0,TAU);c.fill()}c.restore()}
function drawTrailSample(c,id,x0,y0,x1,y1,t,cols){const N=22;for(let i=0;i<N;i++){const u=i/(N-1),x=x0+(x1-x0)*u,y=y0+(y1-y0)*u+Math.sin(u*6+t*3)*5;c.globalAlpha=u*.9;
  if(id==='stardust'){c.fillStyle=cols[i%2];c.beginPath();c.arc(x,y,1+u*3,0,TAU);c.fill();if(i%4===0){c.fillStyle='#fff';c.fillRect(x-1,y-5*u,2,10*u)}}
  else if(id==='sakura'){c.fillStyle=cols[i%2];c.beginPath();c.ellipse(x,y+Math.sin(i)*4,2+u*3,1+u*1.6,i,0,TAU);c.fill()}
  else if(id==='flame'){c.fillStyle=cols[i%2];c.beginPath();c.arc(x,y-u*4,1+u*5,0,TAU);c.fill()}
  else{c.fillStyle=cols[i%cols.length];c.beginPath();c.arc(x,y,2+u*3,0,TAU);c.fill()}}c.globalAlpha=1}
// ---------- motor de efeitos (VFX): partículas aditivas, estrelas, pétalas, chamas, fita arco-íris ----------
const glowCache={};
function glow(col){return glowCache[col]||(glowCache[col]=(()=>{const c=document.createElement('canvas');c.width=c.height=48;const g=c.getContext('2d'),r=g.createRadialGradient(24,24,0,24,24,24);r.addColorStop(0,col);r.addColorStop(.38,col+'99');r.addColorStop(1,col+'00');g.fillStyle=r;g.fillRect(0,0,48,48);return c})())}
const rnd=(a,b)=>a+Math.random()*(b-a),pick=a=>a[(Math.random()*a.length)|0];
const hsl2hex=(h,s=1,l=.6)=>{h=((h%360)+360)%360/360;const f=n=>{const k=(n+h*12)%12,a=s*Math.min(l,1-l);const v=l-a*Math.max(-1,Math.min(k-3,9-k,1));return Math.round(v*255).toString(16).padStart(2,'0')};return '#'+f(0)+f(8)+f(4)};
class Sys{
 constructor(){this.p=[];this.acc={};this.hist=[]}
 add(o){if(this.p.length<380)this.p.push(Object.assign({life:0,max:1,x:0,y:0,vx:0,vy:0,g:0,drag:.99,size:6,rot:0,vr:0,col:'#ffffff',col2:'#ffffff',kind:'glow',seed:Math.random()*6.28,sway:0},o))}
 rate(key,perSec,dt,fn){const a=(this.acc[key]||0)+perSec*dt;let n=Math.floor(a);this.acc[key]=a-n;while(n-->0)fn()}
 draw(ctx,dt){const P=this.p;ctx.save();
  for(let i=P.length-1;i>=0;i--){const q=P[i];q.life+=dt;if(q.life>=q.max){P.splice(i,1);continue}
   const u=q.life/q.max;q.vy+=q.g*dt;q.vx*=Math.pow(q.drag,dt*60);q.vy*=Math.pow(q.drag,dt*60);q.x+=(q.vx+Math.sin(q.life*5+q.seed)*q.sway)*dt;q.y+=q.vy*dt;q.rot+=q.vr*dt;
   const fade=u<.12?u/.12:1-(u-.12)/.88;
   if(q.kind==='petal'){ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.max(0,fade)*.95;ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.scale(1,Math.cos(q.life*6+q.seed));ctx.fillStyle=q.col;ctx.beginPath();ctx.ellipse(0,0,q.size,q.size*.55,0,0,6.283);ctx.fill();ctx.fillStyle=q.col2;ctx.beginPath();ctx.ellipse(-q.size*.2,0,q.size*.45,q.size*.25,0,0,6.283);ctx.fill();ctx.restore();continue}
   if(q.kind==='dark'){const sz=q.size*(1-u*.35);ctx.globalCompositeOperation='source-over';ctx.globalAlpha=Math.max(0,fade)*.85;ctx.drawImage(glow(q.col),q.x-sz*1.3,q.y-sz*1.3,sz*2.6,sz*2.6);ctx.globalCompositeOperation='lighter';ctx.globalAlpha=Math.max(0,fade)*.35;ctx.drawImage(glow(q.col2),q.x-sz*.8,q.y-sz*1.5,sz*1.6,sz*1.6);continue}
   ctx.globalCompositeOperation='lighter';
   if(q.kind==='star'){const tw=.65+.35*Math.sin(q.life*22+q.seed),sz=q.size*tw*(1-u*.4);ctx.globalAlpha=Math.max(0,fade);ctx.drawImage(glow(q.col),q.x-sz*1.6,q.y-sz*1.6,sz*3.2,sz*3.2);
    ctx.save();ctx.translate(q.x,q.y);ctx.rotate(q.rot);ctx.fillStyle='#ffffff';ctx.beginPath();for(let k=0;k<8;k++){const a=k*Math.PI/4,r=k%2?sz*.28:sz;ctx.lineTo(Math.cos(a)*r,Math.sin(a)*r)}ctx.closePath();ctx.fill();ctx.restore()}
   else if(q.kind==='flame'){const col=u<.3?q.col:u<.65?q.mid||q.col2:q.col2,sz=q.size*(u<.25?.6+u*1.6:1.0-(u-.25)*.9);ctx.globalAlpha=Math.max(0,fade)*.9;ctx.drawImage(glow(col),q.x-sz,q.y-sz,sz*2,sz*2)}
   else{const sz=q.size*(1-u*.5);ctx.globalAlpha=Math.max(0,fade);ctx.drawImage(glow(q.col),q.x-sz,q.y-sz,sz*2,sz*2)}}
  ctx.restore()}}
// fita do arco-íris (desenhada a partir do histórico de posições)
function ribbon(ctx,hist,k,now,af=1){const N=hist.length;if(N<3)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';
 for(let pass=0;pass<2;pass++)for(let i=1;i<N;i++){const u=i/(N-1),a=hist[i-1],b=hist[i];ctx.strokeStyle=`hsl(${(now*160+i*16)%360} 100% ${pass?78:58}%)`;ctx.globalAlpha=(pass?.9:.3)*u*af;ctx.lineWidth=(pass?1.5+u*4:5+u*13)*k;ctx.beginPath();ctx.moveTo(a[0],a[1]+Math.sin(i*.7+now*9)*2*k*u);ctx.lineTo(b[0],b[1]+Math.sin((i+1)*.7+now*9)*2*k*u);ctx.stroke()}ctx.restore()}
// emissores de rastro: x,y = posição; vx,vy = velocidade (px/s); mv = está se movendo rápido
function glowRibbon(ctx,h,k,cols,af=1){const N=h.length-5;if(N<3)return;ctx.save();ctx.globalCompositeOperation='lighter';ctx.lineCap='round';const dy=9*k;
 for(const [col,w,a] of [[cols[1],15,.3],[cols[0],6,.55]]){for(let i=1;i<N;i++){const u=i/(N-1);ctx.strokeStyle=col;ctx.globalAlpha=af*a*Math.sin(Math.min(1,u*1.15)*Math.PI*.5)*(u<.2?u/.2:1);ctx.lineWidth=Math.max(1,w*(.25+.75*u)*k);ctx.beginPath();ctx.moveTo(h[i-1][0],h[i-1][1]+dy);ctx.lineTo(h[i][0],h[i][1]+dy);ctx.stroke()}}ctx.restore()}
function trailEmit(sy,id,x,y,vx,vy,k,dt,mv,rf=1){const m=(mv?1:.18)*rf;
 if(id==='stardust'){sy.rate('s',70*m,dt,()=>sy.add({kind:'star',x:x+rnd(-5,5)*k,y:y+rnd(-5,5)*k,vx:rnd(-30,30)*k-vx*.05,vy:rnd(-35,15)*k-vy*.05,size:rnd(3,6.5)*k,max:rnd(.5,1),col:pick(['#ffd23a','#fff3c4','#ffb347']),vr:rnd(-4,4),drag:.96}));
  sy.rate('g',55*m,dt,()=>sy.add({kind:'glow',x:x+rnd(-4,4)*k,y:y+rnd(-4,4)*k,vx:rnd(-12,12)*k,vy:rnd(-12,12)*k,size:rnd(5,10)*k,max:rnd(.35,.6),col:'#ffd23a'}))}
 else if(id==='sakura'){sy.rate('p',38*m,dt,()=>sy.add({kind:'petal',x:x+rnd(-6,6)*k,y:y+rnd(-6,6)*k,vx:rnd(-22,22)*k-vx*.08,vy:rnd(-15,10)*k-vy*.05,g:50*k,size:rnd(3.5,6.5)*k,max:rnd(1,1.7),col:pick(['#ffd1e6','#ff9ccb','#ffffff']),col2:'#ff6fb0',vr:rnd(-5,5),sway:30*k,drag:.985}));
  sy.rate('g',14*m,dt,()=>sy.add({kind:'glow',x,y,size:rnd(8,14)*k,max:.4,col:'#ff9ccb'}))}
 else if(id==='flame'){sy.rate('f',130*m,dt,()=>sy.add({kind:'flame',x:x+rnd(-5,5)*k,y:y+rnd(-4,5)*k,vx:rnd(-22,22)*k-vx*.06,vy:rnd(-85,-25)*k-vy*.04,size:rnd(8,15)*k,max:rnd(.32,.6),col:'#fff2a8',mid:'#ff9a1a',col2:'#c8210a',drag:.95}));
  sy.rate('e',22*m,dt,()=>sy.add({kind:'glow',x,y,vx:rnd(-70,70)*k,vy:rnd(-90,-10)*k,g:140*k,size:rnd(2,3.5)*k,max:rnd(.5,.9),col:'#ffcf5a'}))}
 else if(id==='rainbow'){sy.rate('r',60*m,dt,()=>sy.add({kind:'star',x:x+rnd(-7,7)*k,y:y+rnd(-7,7)*k,vx:rnd(-25,25)*k,vy:rnd(-25,25)*k,size:rnd(2.5,5)*k,max:rnd(.4,.8),col:hsl2hex(performance.now()/6+rnd(0,120)),vr:rnd(-5,5)}))}}
// auras das skins premium (cabelo/corpo soltando efeitos)
function auraEmit(sy,hair,x,y,k,dt,vx,vy){
 if(hair===12){ // dragão negro: chamas negras com borda roxa e brasas vermelhas
  sy.rate('a',30,dt,()=>sy.add({kind:'dark',x:x+rnd(-12,12)*k,y:y+rnd(-8,16)*k,vx:rnd(-10,10)*k-vx*.1,vy:rnd(-55,-20)*k-vy*.05,size:rnd(6,11)*k,max:rnd(.5,.9),col:'#0a0610',col2:'#8a2cff',drag:.97,sway:8*k}));
  sy.rate('b',12,dt,()=>sy.add({kind:'glow',x:x+rnd(-14,14)*k,y:y+rnd(-20,14)*k,vx:rnd(-8,8)*k,vy:rnd(-30,-8)*k,size:rnd(3,5.5)*k,max:rnd(.5,.9),col:pick(['#b36bff','#ff2a4a'])}));return}
 if(hair===10){ // cósmica: cabelo soltando brilhos rosa/violeta como crina mágica
  sy.rate('a',46,dt,()=>sy.add({kind:'glow',x:x+rnd(-14,14)*k,y:y-rnd(18,34)*k,vx:rnd(-12,12)*k-vx*.12,vy:rnd(-30,-6)*k-vy*.1,size:rnd(5,10)*k,max:rnd(.6,1.1),col:pick(['#ff7bd5','#c58bff','#7ad7ff','#ff9ee8']),drag:.97}));
  sy.rate('b',16,dt,()=>sy.add({kind:'star',x:x+rnd(-16,16)*k,y:y-rnd(14,40)*k,vx:rnd(-20,20)*k-vx*.15,vy:rnd(-28,-4)*k-vy*.12,size:rnd(3,5.5)*k,max:rnd(.6,1.1),col:pick(['#ff7bd5','#c58bff','#ffffff']),vr:rnd(-3,3),drag:.97}))}
 else if(hair===9){ // dourada: brilhos dourados no corpo
  sy.rate('a',20,dt,()=>sy.add({kind:'star',x:x+rnd(-14,14)*k,y:y+rnd(-30,14)*k,vx:rnd(-8,8)*k,vy:rnd(-16,-2)*k,size:rnd(3,6.5)*k,max:rnd(.35,.7),col:'#ffd23a',vr:rnd(-2,2)}));
  sy.rate('b',24,dt,()=>sy.add({kind:'glow',x:x+rnd(-12,12)*k,y:y+rnd(-26,12)*k,size:rnd(4,8)*k,max:rnd(.4,.8),col:'#ffcf5a'}))}
 else if(hair===11){ // real: brasas vermelhas e douradas subindo da coroa
  sy.rate('a',34,dt,()=>sy.add({kind:'flame',x:x+rnd(-12,12)*k,y:y-rnd(14,34)*k,vx:rnd(-10,10)*k-vx*.1,vy:rnd(-45,-15)*k,size:rnd(5,9)*k,max:rnd(.5,.9),col:'#ffe08a',mid:'#ff4b4b',col2:'#7a0f2a',drag:.97,sway:10*k}));
  sy.rate('b',10,dt,()=>sy.add({kind:'star',x:x+rnd(-10,10)*k,y:y-rnd(28,40)*k,size:rnd(3,5)*k,max:.6,col:'#ffd23a',vr:rnd(-2,2)}))}}
// ---------- cosméticos dentro do jogo (pet + rastro) ----------
const hist=[];let petX=0,petY=0,petInit=false,lastT=0;
const GS=new Sys();let gsT=0;
window.potatinjaCosmetics={frame(ctx,body,toScreen,active,reduced){
 const hair=(()=>{try{return globalThis.__bt?.outfit?.()?.hairStyle}catch{return 0}})(),auraOn=hair===9||hair===10||hair===11||hair===12;
 if(!active||!body||(!S.pet&&!auraOn))return;
 const p=toScreen(body.x,body.y),q=toScreen(body.x+100,body.y),k=Math.max(.4,Math.hypot(q[0]-p[0],q[1]-p[1])/100*1.0),now=performance.now()/1000,dt=Math.min(.05,Math.max(.001,now-lastT||.016));lastT=now;
 hist.push([p[0],p[1],now]);while(hist.length>26||(hist.length&&now-hist[0][2]>.5))hist.shift();
 const a=hist[0],b=hist[hist.length-1],span=Math.max(.016,b[2]-a[2]),vx=(b[0]-a[0])/span,vy=(b[1]-a[1])/span,sp=Math.hypot(vx,vy),moving=sp>45*k;
 const tr=S.trail&&TRAILS.find(t=>t.id===S.trail);
 if(tr){if(tr.id==='rainbow'&&moving)ribbon(ctx,hist,k*.4,now,.35);else if(moving)glowRibbon(ctx,hist,k*.4,tr.cols,.4);if(!reduced||Math.random()<.5){{const L=Math.hypot(vx,vy)||1,ex=p[0]-vx/L*(moving?26:10)*k,ey=p[1]+10*k;trailEmit(GS,tr.id,ex,ey,vx,vy,k*.6,dt,moving,.3)}}}
 if(auraOn&&!reduced)auraEmit(GS,hair,p[0],p[1],k,dt,vx,vy);
 GS.draw(ctx,dt);
 if(S.pet){const tx=p[0]-30*k,ty=p[1]-34*k+Math.sin(now*3)*3*k;if(!petInit){petX=tx;petY=ty;petInit=true}petX+=(tx-petX)*Math.min(1,dt*7);petY+=(ty-petY)*Math.min(1,dt*7);drawPet(ctx,S.pet,petX,petY,now,1.1*k,1);if(!reduced)petFx(GS,S.pet,petX,petY,k,dt)}}};

// ---------- interface ----------
let root=null,tab='gems',msg='',confirmItem=null,raf=0;
const gemIco='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M6 3h12l4 6-10 12L2 9z" fill="#54e6d2" stroke="#0b3b36" stroke-width="1.5" stroke-linejoin="round"/><path d="M2 9h20M9 3l-2 6 5 12 5-12-2-6" fill="none" stroke="#0b3b36" stroke-width="1" opacity=".5"/></svg>';
const coinIco='<svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><circle cx="12" cy="12" r="9" fill="#ffcf5a" stroke="#6a3d00" stroke-width="2"/><path d="M12 7l2 4-2 5-2-5z" fill="#fff0a8" stroke="#6a3d00" stroke-width="1"/></svg>';
function ensure(){if(root)return root;root=document.createElement('div');root.className='pn-rank pn-shop';root.hidden=true;document.body.append(root);root.addEventListener('click',onClick);['pointerdown','touchstart','keydown'].forEach(n=>root.addEventListener(n,e=>e.stopPropagation(),{passive:true}));return root}
function open(t){ensure();if(t)tab=t;root.hidden=false;sfx('open');render()}
function close(){if(root)root.hidden=true;cancelAnimationFrame(raf);sfx('close')}
function paintWallet(){if(!root||root.hidden)return;const w=root.querySelector('.pn-wallet');if(w)w.innerHTML=walletHtml()}
const walletHtml=()=>`<span class="pill gem">${gemIco}<b>${S.gems}</b></span><span class="pill coin">${coinIco}<b>${coins().toLocaleString('pt-BR')}</b></span>`;
function card(it,kind){
 const own=kind==='pet'?(!!S.owned['pet_'+it.id]||(!it.gems&&!it.coins&&!it.kit)):kind==='trail'?!!S.owned['trail_'+it.id]:owns(it.id);
 const eq=(kind==='pet'&&S.pet===it.id)||(kind==='trail'&&S.trail===it.id);
 let btn;
 if(kind==='skin'||kind==='weapon')btn=own?`<button class="buy owned" disabled>✓ Seu · equipe em ${kind==='skin'?'Visuais':'Armas'}</button>`:`<button class="buy" data-buy="${kind}:${it.id}">${gemIco}${it.gems}</button>`;
 else btn=own?`<button class="buy ${eq?'on':''}" data-equip="${kind}:${it.id}">${eq?'Equipado ✓':'Equipar'}</button>`:`<button class="buy" data-buy="${kind}:${it.id}">${it.coins?coinIco+it.coins.toLocaleString('pt-BR'):gemIco+it.gems}</button>`;
 return `<div class="pn-item ${own?'own':''}"><canvas width="220" height="170" data-kind="${kind}" data-id="${it.id}"></canvas><b>${esc(it.name)}</b>${btn}</div>`}
const kitCard=live=>{if(S.firstDone||S.owned.blackdragon)return '';const pk=PACKS.find(p=>p.kit);return `<div class="pn-kit"><canvas width="340" height="200" data-kind="kit" data-id="kit"></canvas><div class="info"><i class="tg">1ª RECARGA · SKIN ASCENDIDA</i><h3>KIT DRAGÃO NEGRO</h3><ul><li>Skin Ascendida: Armadura do Dragão Negro</li><li>Poder de transformação (Ascender)</li><li>Adaga Negra</li><li>Dragão Negro (pet imponente)</li><li>+${pk.gems} diamantes</li></ul><div class="pr"><s>${pk.was}</s><b>${(live&&billing.details[pk.sku])||pk.price}</b><em>-67%</em></div><button class="buy real" data-pack="${pk.sku}" ${live?'':'disabled'}>${live?'Comprar':'Em breve'}</button></div></div>`};
function render(){
 const r=ensure();const tabs=[['gems','Diamantes'],['skin','Visuais'],['weapon','Armas'],['pet','Pets']].map(([k,l])=>`<button class="${tab===k?'on':''}" data-tab="${k}">${l}</button>`).join('');
 let body='';
 if(tab==='gems'){const live=billing.available;
  body=`${kitCard(live)}<div class="pn-packs">${(()=>{const st=adState(),pv=adProvider();const dis=!pv||st.left<=0||st.wait>0;const lbl=!pv?'Em breve':st.left<=0?'Volte amanhã':st.wait>0?`Aguarde ${Math.ceil(st.wait/60000)} min`:'Assistir';return `<div class="pn-pack"><b class="gm">${gemIco}${AD.gems}</b><small>grátis · ${Math.max(0,st.left)}/${AD.perDay} hoje</small><span class="nm">Assistir e ganhar</span><button class="buy" data-act="ad" ${dis?'disabled':''}>${lbl}</button></div>`})()}${PACKS.filter(p=>!p.kit&&!(p.once&&S.firstDone)).map(p=>`<div class="pn-pack ${p.best?'best':''} ${p.once?'first':''}">${p.tag?`<i class="tag">${p.tag}</i>`:''}<b class="gm">${gemIco}${p.gems}</b>${p.coins?`<small>+ ${p.coins.toLocaleString('pt-BR')} moedas</small>`:'<small>diamantes</small>'}<span class="nm">${p.name}</span><button class="buy real" data-pack="${p.sku}" ${live?'':'disabled'}>${live?(billing.details[p.sku]||p.price):'Em breve'}</button></div>`).join('')}</div>
  <p class="pn-note">${live?'Compra segura pela Google Play.':'Compras de diamante serão liberadas no app da Google Play. Tudo na loja é cosmético: nada dá vantagem nas fases ou no ranking.'}</p>`}
 else{const list={skin:SKINS,weapon:WEAPONS,pet:PETS,trail:TRAILS}[tab];body=`<div class="pn-grid">${list.filter(it=>!it.kit||(tab==='pet'?S.owned['pet_'+it.id]:S.owned[it.id])).map(it=>card(it,tab)).join('')}</div>`}
 r.innerHTML=`<div class="pn-card"><header><button class="pn-x" data-act="close" aria-label="Fechar">✕</button><h2>${gemIco} LOJA</h2><div class="pn-wallet">${walletHtml()}</div></header><div class="pn-tabs">${tabs}</div><div class="pn-body">${body}</div>${msg?`<p class="pn-msg">${esc(msg)}</p>`:''}${confirmItem?confirmHtml():''}</div>`;
 msg='';animate()}
const find=(kind,id)=>({skin:SKINS,weapon:WEAPONS,pet:PETS,trail:TRAILS}[kind]||[]).find(x=>x.id===id);
const confirmHtml=()=>{const it=confirmItem.it;return `<div class="pn-confirm"><div><b>Comprar ${esc(it.name)}?</b><p>${it.coins?coinIco+it.coins.toLocaleString('pt-BR')+' moedas':gemIco+it.gems+' diamantes'}</p><div class="row"><button class="buy" data-act="cancel">Cancelar</button><button class="buy yes" data-act="yes">Comprar</button></div></div></div>`};
const psys=new WeakMap();
function animate(){cancelAnimationFrame(raf);if(!root||root.hidden)return;const cvs=[...root.querySelectorAll('canvas')];if(!cvs.length)return;let last=performance.now()/1000;
 const frame=()=>{if(root.hidden)return;const t=performance.now()/1000;if(document.hidden||t-last<.03){raf=requestAnimationFrame(frame);return}const dt=Math.min(.05,t-last);last=t;
  for(const cv of cvs){const rc=cv.getBoundingClientRect();if(rc.bottom<0||rc.top>innerHeight)continue;const c=cv.getContext('2d'),k=cv.dataset.kind,id=cv.dataset.id,W=cv.width,H=cv.height;c.clearRect(0,0,W,H);
   let sy=psys.get(cv);if(!sy){sy=new Sys();psys.set(cv,sy)}
   const g=c.createRadialGradient(W/2,H*.6,5,W/2,H*.6,W*.6);g.addColorStop(0,'#54e6d233');g.addColorStop(1,'#0000');c.fillStyle=g;c.fillRect(0,0,W,H);
   if(k==='kit'){const bg=c.createLinearGradient(0,0,W,H);bg.addColorStop(0,'#2a1250');bg.addColorStop(.6,'#120a22');bg.addColorStop(1,'#07040c');c.fillStyle=bg;c.fillRect(0,0,W,H);
    const pu=.5+.5*Math.sin(t*2.4),rg2=c.createRadialGradient(W*.42,H*.62,4,W*.42,H*.62,W*.5);rg2.addColorStop(0,'rgba(160,80,255,'+(.5+pu*.25)+')');rg2.addColorStop(1,'rgba(138,44,255,0)');c.fillStyle=rg2;c.fillRect(0,0,W,H);
    auraEmit(sy,12,W*.42,H*.62-8,1.6,dt,0,0);sy.draw(c,dt);
    c.save();c.translate(W*.4,H*.78);c.scale(2.05,2.05);c.shadowColor='#b36bff';c.shadowBlur=7;try{drawPotato(c,basePose(t),'cute',{hairStyle:12},null)}catch{}c.restore();
    drawBlade(c,W*.08,H*.9,W*.34,9,['#e8d0ff','#8a2cff','#2a0f4a'],'#8a2cff',t,'dagger');
    petFx(sy,'drago',W*.72,H*.4+Math.sin(t*3)*5,1.6,dt);drawPet(c,'drago',W*.72,H*.4+Math.sin(t*3)*5,t,2.3)}
   else if(k==='skin'){const it=find(k,id),sc=2.7,cy=H*.66;c.save();c.translate(W/2,cy);c.scale(sc,sc);try{drawPotato(c,basePose(t),'cute',{hairStyle:it.hair},null)}catch{}c.restore();auraEmit(sy,it.hair,W/2,cy-8*sc,sc*.75,dt,0,0);sy.draw(c,dt)}
   else if(k==='weapon'){const it=find(k,id);drawBlade(c,W*.22,H*.82,W*.5,9,it.cols,it.glow,t,it.shape);const tx=W*.22+Math.cos(-.7)*W*.5,ty=H*.82+Math.sin(-.7)*W*.5;
    sy.rate('w',60,dt,()=>sy.add(id==='dragon'?{kind:'flame',x:tx+rnd(-8,8),y:ty+rnd(-8,8),vx:rnd(-20,20),vy:rnd(-60,-15),size:rnd(7,13),max:rnd(.35,.6),col:'#fff2a8',mid:'#ffb02e',col2:'#c8210a',drag:.96}:id==='galaxy'?{kind:'star',x:tx+rnd(-30,10),y:ty+rnd(-10,30),vx:rnd(-30,10),vy:rnd(-10,25),size:rnd(3,6),max:rnd(.5,.9),col:pick(['#7a8cff','#ff5fd2','#ffffff']),vr:rnd(-4,4)}:{kind:'glow',x:tx+rnd(-40,10),y:ty+rnd(-6,30),vx:rnd(-50,-10),vy:rnd(0,30),size:rnd(5,10),max:rnd(.4,.8),col:pick(it.cols)}));sy.draw(c,dt)}
   else if(k==='pet'){petFx(sy,id,W/2,H/2,2.4,dt);sy.draw(c,dt);drawPet(c,id,W/2,H/2,t,3.4)}
   else if(k==='trail'){const it=find(k,id),u=(t*.55)%1,x=W*.12+u*W*.76,y=H*.72-Math.sin(u*Math.PI)*H*.38+Math.sin(u*14)*4;const vx=W*.76*.55,vy=0;
    sy.hist.push([x,y,t]);while(sy.hist.length>26)sy.hist.shift();if(u<.02)sy.hist.length=0;
    if(id==='rainbow')ribbon(c,sy.hist,1.1,t);trailEmit(sy,id,x,y,vx,vy,1.1,dt,true);sy.draw(c,dt);
    c.save();c.globalCompositeOperation='lighter';c.drawImage(glow(it.cols[1]),x-14,y-14,28,28);c.restore()}}
  raf=requestAnimationFrame(frame)};frame()}
function afterBuy(kind,it){sfx('equip');if(kind==='pet'){S.owned['pet_'+it.id]=true;S.pet=it.id}else if(kind==='trail'){S.owned['trail_'+it.id]=true;S.trail=it.id}else S.owned[it.id]=true;save();if(kind==='skin'||kind==='weapon')setTimeout(()=>location.reload(),1600);msg=kind==='skin'||kind==='weapon'?`${it.name} é seu! ${kind==='skin'?'Atualizando o jogo… depois equipe em Visuais.':'Equipe em Armas.'}`:`${it.name} equipado!`}
async function onClick(e){
 const b=e.target.closest('button');if(!b){return}
 if(b.dataset.act==='ad'){const st=adState(),pv=adProvider();if(!pv||st.left<=0||st.wait>0)return;b.disabled=true;let r='error';try{r=await pv.showRewarded('shop_gems')}catch{}
  if(r==='done'){S.gems+=AD.gems;S.adN++;S.adLast=Date.now();save();sfx('star');msg=`+${AD.gems} diamantes!`;paintWallet()}else{msg=r==='dismissed'?'Assista até o fim para ganhar.':'Anúncio indisponível agora.'}render();return}
 if(b.dataset.tab){tab=b.dataset.tab;render();return}
 const a=b.dataset.act;
 if(a==='close'){close();return}
 if(a==='cancel'){confirmItem=null;render();return}
 if(a==='yes'&&confirmItem){const {kind,it}=confirmItem;confirmItem=null;
   if(it.coins){if(globalThis.__bt?.spend?.(it.coins))afterBuy(kind,it);else{msg='Moedas insuficientes.';sfx('locked')}}
   else if(S.gems>=it.gems){S.gems-=it.gems;afterBuy(kind,it)}
   else{msg='Diamantes insuficientes. Veja os pacotes!';sfx('locked');tab='gems'}
   render();return}
 if(b.dataset.buy){const [kind,id]=b.dataset.buy.split(':');const it=find(kind,id);if(it){confirmItem={kind,it};render()}return}
 if(b.dataset.equip){const [kind,id]=b.dataset.equip.split(':');if(kind==='pet')S.pet=S.pet===id?'':id;else S.trail=S.trail===id?'':id;save();sfx('select');render();return}
 if(b.dataset.pack){const p=PACKS.find(x=>x.sku===b.dataset.pack);if(!p||!billing.available)return;b.disabled=true;try{const ok=await billing.buy(p);if(ok){sfx('star');msg=p.kit?'Kit Dragão Negro liberado!':`+${p.gems} diamantes!`;if(p.kit)setTimeout(()=>location.reload(),1600)}}catch{msg='Compra cancelada.'}render()}}
// botão da loja no menu
function injectTabs(){const w=document.querySelector('#ui .skins .wtabs');if(!w||w.querySelector('.pn-tab'))return;for(const [t,l] of [['pet','Pets']]){const b=document.createElement('button');b.type='button';b.className='pn-tab';b.textContent=l;b.addEventListener('click',ev=>{ev.stopPropagation();open(t)});w.append(b)}}
function inject(){injectTabs();const sec=document.querySelector('#ui .title-secondary');if(sec&&!sec.querySelector('.pn-shop-btn')){const b=document.createElement('button');b.type='button';b.className='btn pn-shop-btn';b.innerHTML=gemIco+'<span>Loja</span>';b.addEventListener('click',ev=>{ev.stopPropagation();open()});sec.prepend(b)}}
const ui=document.getElementById('ui');if(ui){let f=0;new MutationObserver(()=>{if(!f)f=requestAnimationFrame(()=>{f=0;inject()})}).observe(ui,{subtree:true,childList:true,attributes:true,attributeFilter:['hidden']});setTimeout(inject,500)}
