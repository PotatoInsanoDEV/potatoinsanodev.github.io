// Potatinja — Ascensão do Dragão Negro: botão de transformação (só visual, não muda física, dano nem ranking).
// Um dragão espectral negro enrola a batata por alguns segundos e depois some.
const TAU=Math.PI*2,COOL=20;
const sfx=n=>{try{window.potatinjaSFX?.[n]?.()}catch{}};
const reduced=()=>{const m=document.getElementById('sMotion');return !!(m&&m.checked)||matchMedia('(prefers-reduced-motion: reduce)').matches};
let btn,box,cv,active=false,t0=0,cdEnd=0,parts=[],raf=0,last=0,burst=false,roar=false;
function build(){
 btn=document.createElement('button');btn.id='pnAsc';btn.type='button';btn.hidden=true;btn.setAttribute('aria-label','Ascensão do Dragão Negro');
 btn.innerHTML='<svg viewBox="0 0 48 48" width="34" height="34" aria-hidden="true"><path d="M6 8l9 7 4-3h10l4 3 9-7-3 14-6 6v8l-6 4-6-3-6 3-6-4v-8l-6-6z" fill="#1a1226" stroke="#e8d0ff" stroke-width="2.2" stroke-linejoin="round"/><path d="M14 24l7 2-2 3zM34 24l-7 2 2 3z" fill="#ff2a4a"/></svg><b>ASCENDER</b>';
 document.body.append(btn);
 ['pointerdown','touchstart','mousedown'].forEach(n=>btn.addEventListener(n,e=>e.stopPropagation(),{passive:true}));
 btn.addEventListener('click',start);
 box=document.createElement('canvas');box.style.cssText='position:fixed;inset:0;width:100%;height:100%;z-index:25;pointer-events:none;display:none';document.body.append(box);cv=box;
}
function heroPos(){const hd=globalThis.__heroDraw,gc=document.getElementById('game');if(hd&&gc&&performance.now()-hd.t<800){const r=gc.getBoundingClientRect(),k=r.width/gc.width;return{x:r.left+hd.x*k,y:r.top+hd.y*k,s:hd.sx*k,f:hd.f||1}}return null}
function start(){
 if(active||performance.now()<cdEnd)return;
 active=true;t0=last=performance.now();burst=false;roar=false;fin=false;bolts=[];ff=heroPos()?.f||1;parts=[];box.style.display='block';sfx('ascCharge');
 const W=innerWidth,H=innerHeight,d=Math.min(1.25,devicePixelRatio||1)*Math.min(1,globalThis.__pnDprK||1);cv.width=W*d;cv.height=H*d;
 cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);
}
const cl=(v,a=0,b=1)=>Math.min(b,Math.max(a,v));
// Ascensão do Dragão Negro: o dragão espectral sai de dentro da batata, enrola em espiral com raios, ruge e some em brasas
function smFs(c,f,lw=5){c.fillStyle=f;c.fill();c.lineWidth=lw;c.strokeStyle='#140a22';c.lineJoin='round';c.stroke()}
function smLg(c,x0,y0,x1,y1,st){const g=c.createLinearGradient(x0,y0,x1,y1);st.forEach(([o,k])=>g.addColorStop(o,k));return g}
let ff=1,bolts=[],fin=false;
const rnd=(a,b)=>a+Math.random()*(b-a);
function bolt(x0,y0,x1,y1,seg,j){const p=[[x0,y0]];for(let i=1;i<seg;i++){const f=i/seg;p.push([x0+(x1-x0)*f+(Math.random()-.5)*j,y0+(y1-y0)*f+(Math.random()-.5)*j])}p.push([x1,y1]);return p}
function drawBolts(c,dt){
 for(let i=bolts.length-1;i>=0;i--){const b=bolts[i];b.l+=dt;if(b.l>b.m){bolts.splice(i,1);continue}const a=1-b.l/b.m;
  c.save();c.globalCompositeOperation='lighter';c.lineJoin='round';c.lineCap='round';c.shadowColor='#a24bff';c.shadowBlur=14;
  c.strokeStyle='rgba(150,70,255,'+.8*a+')';c.lineWidth=b.w*2.6;c.beginPath();b.p.forEach((q,k)=>k?c.lineTo(q[0],q[1]):c.moveTo(q[0],q[1]));c.stroke();
  c.strokeStyle='rgba(245,230,255,'+a+')';c.lineWidth=b.w;c.stroke();c.restore()}}
function addBolt(cx,cy,r,n,reach){for(let i=0;i<n&&bolts.length<22;i++){const an=Math.random()*TAU,r0=r*(.3+Math.random()*.5),r1=r*(reach+Math.random()*.9);const x0=cx+Math.cos(an)*r0,y0=cy+Math.sin(an)*r0*1.1,x1=cx+Math.cos(an)*r1,y1=cy+Math.sin(an)*r1*1.1;
  const p=bolt(x0,y0,x1,y1,6,r*.45);bolts.push({p,l:0,m:.1+Math.random()*.12,w:1.3+Math.random()*1.2});
  if(Math.random()<.4){const q=p[3];bolts.push({p:bolt(q[0],q[1],q[0]+Math.cos(an+.9)*r*.7,q[1]+Math.sin(an+.9)*r*.7,4,r*.3),l:0,m:.1,w:1})}}}
function spawn(kind,hp,R,u,k,ox=0,oy=0){
 if(kind==='up'){const sd=(Math.random()*2-1);parts.push({k:'up',x:hp.x+sd*R*.9,y:hp.y+R*(.9-Math.random()*2.2),vx:-sd*8+(Math.random()-.5)*20,vy:-(60+Math.random()*130)*(.5+k),l:0,m:.7+Math.random()*.9,r:R*(.07+Math.random()*.13)})}
 else if(kind==='in'){const an=Math.random()*TAU,rad=R*(2.6+Math.random()*2.6);parts.push({k:'in',a:an,rad,sp:rad*(.9+Math.random()*.8),w:2+Math.random()*2.5,l:0,m:2,r:R*.04,px:hp.x,py:hp.y})}
 else if(kind==='ember'){parts.push({k:'ember',x:ox+rnd(-R*1.4,R*1.4),y:oy+rnd(-R*.2,R*.3),vx:rnd(-14,14),vy:-rnd(40,120),l:0,m:rnd(.9,1.8),r:R*rnd(.03,.075),ph:rnd(0,6),pk:Math.random()<.35})}
 else if(kind==='shard'){const an=Math.random()*TAU,sp=R*rnd(4,10);parts.push({k:'shard',x:ox,y:oy,vx:Math.cos(an)*sp,vy:Math.sin(an)*sp*.8-R*2,rot:Math.random()*TAU,vr:rnd(-9,9),s:R*rnd(.1,.26),l:0,m:rnd(.7,1.3)})}
}
// círculo mágico no chão (runas girando)
const RUNES=Array.from({length:12},(_,i)=>{const r=n=>{const x=Math.sin((i+1)*91.7+n*13.3)*43758.5;return x-Math.floor(x)};return [0,1,2,3,4].map(k=>[(r(k)-.5)*1.1,(r(k+9)-.5)*1.7])});
function magicCircle(c,x,y,R,u,a,k){
 c.save();c.translate(x,y);c.scale(1,.3);c.globalCompositeOperation='lighter';c.shadowColor='#9a3cff';c.shadowBlur=18;c.lineCap='round';c.lineJoin='round';
 const grow=.55+.45*cl(u/1.2),O=R*2.25*grow;c.globalAlpha=a*(.55+.35*k);
 c.strokeStyle='#d8b8ff';c.lineWidth=3.4;c.beginPath();c.arc(0,0,O,0,TAU);c.stroke();c.lineWidth=1.8;c.beginPath();c.arc(0,0,O*.86,0,TAU);c.stroke();
 c.save();c.rotate(u*.45);for(let i=0;i<12;i++){c.save();c.rotate(i*TAU/12);c.translate(O*.93,0);c.rotate(Math.PI/2);c.lineWidth=2;c.beginPath();RUNES[i].forEach((q,j)=>{const px=q[0]*R*.13,py=q[1]*R*.13;j?c.lineTo(px,py):c.moveTo(px,py)});c.stroke();c.restore()}c.restore();
 c.strokeStyle='#9a4cff';c.lineWidth=2.4;c.save();c.rotate(-u*.7);for(const o of [0,Math.PI/3]){c.beginPath();for(let i=0;i<3;i++){const an=o+i*TAU/3-Math.PI/2;const px=Math.cos(an)*O*.7,py=Math.sin(an)*O*.7;i?c.lineTo(px,py):c.moveTo(px,py)}c.closePath();c.stroke()}c.restore();
 c.setLineDash([O*.07,O*.05]);c.lineWidth=2;c.beginPath();c.arc(0,0,O*.5,0,TAU);c.stroke();c.setLineDash([]);
 const g=c.createRadialGradient(0,0,0,0,0,O*.8);g.addColorStop(0,'rgba(170,90,255,'+.5*k+')');g.addColorStop(1,'rgba(170,90,255,0)');c.globalAlpha=a;c.fillStyle=g;c.beginPath();c.arc(0,0,O*.8,0,TAU);c.fill();
 c.restore()}
function pillars(c,x,y,R,u,a,k,Hh){c.save();c.globalCompositeOperation='lighter';
 for(let i=0;i<8;i++){const an=i*TAU/8+u*.55,px=x+Math.cos(an)*R*2*(.6+.4*cl(u/1.2)),py=y+Math.sin(an)*R*2*.3*(.6+.4*cl(u/1.2)),h=Hh*(.25+.75*k)*(.75+.25*Math.sin(u*6+i*2)),w=R*(.1+.08*k);
  const g=c.createLinearGradient(0,py,0,py-h);g.addColorStop(0,'rgba(190,120,255,'+.7*a+')');g.addColorStop(1,'rgba(150,70,255,0)');c.fillStyle=g;c.fillRect(px-w/2,py-h,w,h)}c.restore()}
const EM=.5,ROAR=3.3,DUR=7.8;
// trajetória do dragão: nasce no centro da batata, abre em espiral, sobe e fica voando em volta (sobe e desce)
function dragonPts(hp,R,u){
 const head=(u-EM)*.5,N=150,pts=[];if(head<0)return pts;
 for(let i=0;i<N;i++){const w=head-i*.0068;if(w<0)break;const ww=Math.min(1,w),ang=w*Math.PI*4.2+u*1.1;
  const rad=R*1.3*Math.sin(Math.min(1,w*2.6)*Math.PI/2)*(w>1?1+.07*Math.sin((w-1)*6):1);
  const yo=w<1?R*(.7-2.15*ww):R*(-1.45+2.15*(1-Math.cos((w-1)*4.4))/2);
  pts.push({x:hp.x+Math.cos(ang)*rad,y:hp.y+yo+Math.sin(ang)*rad*.34,z:Math.sin(ang),s:R*(.17+.21*(1-i/N))})}
 return pts}
function heroOver(c,hp,R){const gc=document.getElementById('game');if(!gc)return;const r=gc.getBoundingClientRect(),k=r.width/gc.width,ex=R*1.02,ey=R*1.15,cx=hp.x,cy=hp.y-R*.12;
 c.save();c.beginPath();c.ellipse(cx,cy,ex,ey,0,0,TAU);c.clip();c.globalAlpha=1;try{c.drawImage(gc,(cx-ex-r.left)/k,(cy-ey-r.top)/k,2*ex/k,2*ey/k,cx-ex,cy-ey,2*ex,2*ey)}catch{}c.restore()}
function drawDragon(c,pts,R,out,rt,hp){
 if(pts.length<3)return;c.save();
 // rastro de luz ao longo do corpo
 c.globalCompositeOperation='lighter';c.globalAlpha=.3*out;c.strokeStyle='#8a2cff';c.lineWidth=R*.55;c.lineJoin='round';c.lineCap='round';c.shadowColor='#9a3cff';c.shadowBlur=22;c.beginPath();pts.forEach((p,i)=>i?c.lineTo(p.x,p.y):c.moveTo(p.x,p.y));c.stroke();c.shadowBlur=0;c.globalCompositeOperation='source-over';
 for(const front of [false,true]){
  if(front&&hp)heroOver(c,hp,R);
  const grp=pts.map((p,k)=>({p,k})).filter(o=>(o.p.z>=0)===front).reverse(),al=(front?1:.6)*out;
  c.globalAlpha=al;c.fillStyle=front?'#b06bff':'#5a2aa0';for(const {p} of grp){c.beginPath();c.arc(p.x,p.y,p.s+2.4,0,TAU);c.fill()}
  for(const {p} of grp){c.beginPath();c.arc(p.x,p.y,p.s,0,TAU);c.fillStyle=front?'#140a26':'#0e0720';c.fill()}
  c.globalCompositeOperation='lighter';c.globalAlpha=al*.45;c.fillStyle='#8a2cff';for(const {p} of grp){c.beginPath();c.arc(p.x,p.y+p.s*.35,p.s*.42,0,TAU);c.fill()}c.globalCompositeOperation='source-over';
  c.globalAlpha=al;for(const {p,k} of grp)if(k%7===3&&k>6){c.beginPath();c.moveTo(p.x-p.s*.4,p.y-p.s*.75);c.lineTo(p.x+p.s*.05,p.y-p.s*1.95);c.lineTo(p.x+p.s*.4,p.y-p.s*.75);c.closePath();c.fillStyle='#d9b8ff';c.fill();c.strokeStyle='#100820';c.lineWidth=1.4;c.stroke()}}
 const h=pts[0],n1=pts[Math.min(4,pts.length-1)],an=Math.atan2(h.y-n1.y,h.x-n1.x),S=R*.62*(1+rt*.3);
 c.globalAlpha=out;c.translate(h.x,h.y);c.rotate(an);
 for(const sg of [-1,1]){c.beginPath();c.moveTo(-S*.1,sg*S*.55);c.quadraticCurveTo(-S*1.0,sg*S*1.1,-S*1.9,sg*S*1.5);c.quadraticCurveTo(-S*.9,sg*S*.7,S*.2,sg*S*.35);c.closePath();smFs(c,'#d9b8ff',3);
  c.beginPath();c.moveTo(S*1.7,sg*S*.15);c.quadraticCurveTo(S*1.5,sg*S*1.0,S*.4,sg*S*1.5);c.lineWidth=2;c.strokeStyle='#e8d0ff';c.stroke()}
 c.beginPath();c.moveTo(-S*.7,-S*.75);c.quadraticCurveTo(S*.6,-S*.95,S*1.9,-S*.25);c.lineTo(S*1.95,S*.15);c.lineTo(S*1.3,S*.45+S*.3*rt);c.quadraticCurveTo(S*.5,S*.85,-S*.7,S*.75);c.closePath();smFs(c,smLg(c,0,-S,0,S,[[0,'#2a1650'],[1,'#0c0616']]),4);
 c.beginPath();c.moveTo(S*1.1,S*.38);c.lineTo(S*1.3,S*.8);c.lineTo(S*1.5,S*.3);c.closePath();smFs(c,'#fff',2.4);
 c.save();c.shadowColor='#ff2a5a';c.shadowBlur=18;c.beginPath();c.moveTo(S*.2,-S*.45);c.lineTo(S*.95,-S*.3);c.lineTo(S*.35,-S*.1);c.closePath();c.fillStyle='#ff3b6b';c.fill();c.restore();
 c.restore()}
function frame(now){
 if(!active)return;const u=(now-t0)/1000,dt=Math.min(.05,(now-last)/1000||.016);last=now;
 const c=cv.getContext('2d'),d=cv.width/innerWidth,W=innerWidth,H=innerHeight;c.setTransform(d,0,0,d,0,0);c.clearRect(0,0,W,H);
 if(u>=DUR||!document.querySelector('#ui .hud:not([hidden])')){active=false;box.style.display='none';cdEnd=performance.now()+COOL*1000;bolts=[];parts=[];return}
 const hp=heroPos(),rm=reduced();
 if(hp){
  const R=Math.max(34,34*hp.s),k=cl(u/EM),out=u>DUR-1.4?cl((DUR-u)/1.4):1,fy=hp.y+R*.85;
  const rt=u>ROAR&&u<ROAR+1.1?1-(u-ROAR)/1.1:0;
  c.save();if(!rm)c.translate((Math.random()-.5)*7*rt,(Math.random()-.5)*5*rt);
  const vg=c.createRadialGradient(hp.x,hp.y,R*2,hp.x,hp.y,Math.max(W,H)*.75),va=(u<EM?k*.4:.4+.12*rt)*out;vg.addColorStop(0,'rgba(10,0,25,0)');vg.addColorStop(1,'rgba(10,0,25,'+va+')');c.fillStyle=vg;c.fillRect(-10,-10,W+20,H+20);
  const ra=Math.min(1,u/.5)*out;magicCircle(c,hp.x,fy,R,u,ra,Math.max(k,.6));pillars(c,hp.x,fy,R,u,ra*.9,Math.max(k,.5),R*5.5);
  // brilho em volta da batata
  const ga=(.25+.35*(u>EM?1:k)+.15*Math.sin(u*7)+rt*.3)*out,gg=c.createRadialGradient(hp.x,hp.y,2,hp.x,hp.y,R*3);gg.addColorStop(0,'rgba(180,100,255,'+ga+')');gg.addColorStop(1,'rgba(120,40,220,0)');c.fillStyle=gg;c.fillRect(hp.x-R*3.2,hp.y-R*3.2,R*6.4,R*6.4);
  const pts=dragonPts(hp,R,u);
  drawDragon(c,pts,R,out,rt,hp);
  const hd=pts[0];
  // raios saindo do corpo do dragão
  if(!rm&&pts.length>8){for(let n=0;n<2;n++)if(Math.random()<.65&&bolts.length<22){const q=pts[Math.floor(Math.random()*pts.length)],an=Math.random()*TAU;bolts.push({p:bolt(q.x,q.y,q.x+Math.cos(an)*R*2.2,q.y+Math.sin(an)*R*1.7,6,R*.65),l:0,m:.1+Math.random()*.1,w:1.6+Math.random()*1.4})}
   if(u>EM+.8&&Math.random()<.07*(1+rt*8)&&bolts.length<20)bolts.push({p:bolt(hd.x,hd.y,hp.x+rnd(-R*2.6,R*2.6),fy,9,R*.8),l:0,m:.14,w:2.4})}
  if(u>.9&&u<EM+.1&&!rm&&Math.random()<.6)addBolt(hp.x,hp.y,R*1.4,1,1.8);
  // nascimento: clarão e anel saindo da batata
  if(u>=EM&&u<EM+.7){const e=(u-EM)/.7;c.save();c.globalAlpha=(1-e)*.9;c.strokeStyle='#e8d0ff';c.shadowColor='#9a3cff';c.shadowBlur=20;c.lineWidth=8*(1-e)+1;c.beginPath();c.arc(hp.x,hp.y,R*(.4+e*5),0,TAU);c.stroke();c.lineWidth=3;c.beginPath();c.ellipse(hp.x,fy,R*(1+e*6),R*(.3+e*1.4),0,0,TAU);c.stroke();c.restore();
   if(!rm){c.fillStyle='rgba(240,225,255,'+.5*(1-e)*(1-e)+')';c.fillRect(-10,-10,W+20,H+20)}
   if(!burst){burst=true;sfx('ascBoom');addBolt(hp.x,hp.y,R*1.2,10,2.6);if(!rm)for(let i=0;i<30;i++)spawn('shard',hp,R,u,1,hp.x,hp.y)}}
  // rugido: anéis a partir da cabeça + clarão + raios no chão
  if(u>=ROAR&&u<ROAR+1.1&&hd){const e=(u-ROAR)/1.1;if(!roar){roar=true;sfx('ascRoar');if(!rm){for(let i=0;i<26;i++)spawn('up',hp,R,u,1);for(let i=0;i<4;i++)bolts.push({p:bolt(hd.x+rnd(-R,R),hd.y,hp.x+rnd(-R*3,R*3),fy,10,R*.9),l:0,m:.2,w:3})}}
   for(let i=0;i<3;i++){const ee=cl(e*1.3-i*.2);if(ee<=0||ee>=1)continue;c.save();c.globalAlpha=(1-ee)*.8;c.strokeStyle=i?'#8a2cff':'#f0e0ff';c.shadowColor='#9a3cff';c.shadowBlur=18;c.lineWidth=6*(1-ee)+1;c.beginPath();c.ellipse(hd.x,hd.y,R*(.5+ee*5),R*(.4+ee*3.4),0,0,TAU);c.stroke();c.restore()}
   if(!rm&&e<.25){c.fillStyle='rgba(190,120,255,'+.25*(1-e/.25)+')';c.fillRect(-10,-10,W+20,H+20)}}
  // final: o dragão se desfaz em brasas
  if(u>DUR-1.4&&!fin){fin=true;if(!rm&&hd)for(let i=0;i<46;i++)spawn('ember',hp,R,u,1,hd.x,hd.y);if(!rm)for(let i=0;i<20;i++)spawn('ember',hp,R,u,1,hp.x,hp.y)}
  c.globalAlpha=1;drawBolts(c,dt);
  if(!rm){if(u<EM){for(let i=0;i<1+k*4;i++)if(Math.random()<.6&&parts.length<230)spawn('up',hp,R,u,k);if(parts.length<230&&Math.random()<.4+k)spawn('in',hp,R,u,k)}
   else if(parts.length<230&&Math.random()<.6&&hd)spawn('ember',hp,R,u,1,hd.x,hd.y)}
  c.restore();parts.hp=hp;
 }
 for(let i=parts.length-1;i>=0;i--){const p=parts[i];p.l+=dt;if(p.l>p.m){parts.splice(i,1);continue}
  if(p.k==='in'){p.rad-=p.sp*dt;p.a+=p.w*dt;const hp2=parts.hp;if(!hp2||p.rad<20){parts.splice(i,1);continue}const nx=hp2.x+Math.cos(p.a)*p.rad,ny=hp2.y+Math.sin(p.a)*p.rad*.7;c.globalCompositeOperation='lighter';c.globalAlpha=.8;c.strokeStyle='#b46bff';c.lineWidth=2;c.beginPath();c.moveTo(p.px,p.py);c.lineTo(nx,ny);c.stroke();c.globalCompositeOperation='source-over';p.px=nx;p.py=ny;continue}
  const q=p.l/p.m;
  if(p.k==='ember'){p.x+=(p.vx+Math.sin(p.l*6+p.ph)*14)*dt;p.y+=p.vy*dt;c.globalCompositeOperation='lighter';c.globalAlpha=(1-q)*.9;const rg2=c.createRadialGradient(p.x,p.y,0,p.x,p.y,p.r*3);rg2.addColorStop(0,p.pk?'rgba(255,120,220,1)':'rgba(220,170,255,1)');rg2.addColorStop(1,'rgba(150,60,255,0)');c.fillStyle=rg2;c.beginPath();c.arc(p.x,p.y,p.r*3,0,TAU);c.fill();c.fillStyle='#fff';c.globalAlpha=(1-q);c.beginPath();c.arc(p.x,p.y,p.r*.5,0,TAU);c.fill();c.globalCompositeOperation='source-over';continue}
  if(p.k==='shard'){p.vy+=260*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;p.rot+=p.vr*dt;c.save();c.globalAlpha=1-q;c.translate(p.x,p.y);c.rotate(p.rot);c.beginPath();c.moveTo(0,-p.s);c.lineTo(p.s*.55,p.s*.7);c.lineTo(-p.s*.55,p.s*.7);c.closePath();c.fillStyle='#c9a0ff';c.fill();c.lineWidth=1.6;c.strokeStyle='#1a0a30';c.stroke();c.restore();continue}
  p.x+=p.vx*dt;p.y+=p.vy*dt;
  c.globalAlpha=(1-q)*.8;c.fillStyle='#0a0610';c.beginPath();c.arc(p.x,p.y,p.r*(1-q*.4),0,TAU);c.fill();c.globalCompositeOperation='lighter';c.globalAlpha=(1-q)*.45;c.fillStyle='#8a2cff';c.beginPath();c.arc(p.x,p.y-3,p.r*.65,0,TAU);c.fill();c.globalCompositeOperation='source-over'}
 c.globalAlpha=1;
 raf=requestAnimationFrame(frame);
}
function tick(){
 if(!btn)return;
 let ok=false;try{ok=globalThis.__bt?.outfit?.()?.hairStyle===12&&window.potatinjaShop?.owns?.('blackdragon')}catch{}
 if(!ok||document.hidden){btn.hidden=true;return}
 const hud=document.querySelector('#ui .hud'),pause=document.querySelector('#ui .pause:not([hidden])'),sheet=document.querySelector('#ui .sheet:not([hidden])'),shop=document.querySelector('.pn-shop:not([hidden])'),ov=document.querySelector('#ui .result:not([hidden]), #ui .win:not([hidden])');
 const show=!!(ok&&hud&&!hud.hidden&&!pause&&!sheet&&!shop&&!ov);
 btn.hidden=!show;if(!show)return;
 const left=Math.max(0,cdEnd-performance.now()),p=active?0:left/(COOL*1000);
 btn.classList.toggle('ready',!active&&left<=0);btn.classList.toggle('on',active);btn.style.setProperty('--p',(p*360)+'deg');
}
build();setInterval(tick,150);
window.potatinjaAscend=start;
