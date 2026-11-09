// Potatinja — final cinematic (Kuro, the five seals and the return of dawn).
// Standalone: it reads no campaign/physics/aiming state. The bundle injects the
// character drawing helpers so heroes and foes look exactly like in the game.
export const ENDING_DURATION=26;
export const ENDING_LINES=[
 [1.2,5.0,'KURO','Impossível… o último selo se partiu. Fui vencido por uma simples batata?'],
 [5.2,9.2,'POTATINJA','Simples, não. Eu sou o Potatinja. E o amanhecer não é seu para apagar.'],
 [9.6,13.4,'KURO','Meu clã foi esquecido nas sombras. Eu só queria que alguém lembrasse do nosso nome.'],
 [13.8,17.6,'POTATINJA','Então lembraremos. Mas à luz do sol, Kuro. Não no escuro.']
];
const clamp=(x,a=0,b=1)=>Math.min(b,Math.max(a,x));
const lerp=(a,b,t)=>a+(b-a)*t;
const ease=t=>t*t*(3-2*t);

export function createPotatinjaEnding(sound=()=>{},reduced=false,strings={},deps={}){
 const {yi,Yi,Pi,hero,foe}=deps;
 let elapsed=0,finished=false;const fired=new Set();
 const cue=(name,at)=>{if(elapsed>=at&&!fired.has(name)){fired.add(name);sound(name.split(':')[0])}};
 const kuro=yi?yi('foe'):{},spud=yi?yi('hero'):{};
 const place=(p,kind,x,y,facing,extra)=>{Object.assign(p,yi(kind),{x,y,facing},extra||{});return p};
 return {kind:'ending',get done(){return finished},skip(){finished=true},
 update(dt){if(finished)return;elapsed+=Math.max(0,dt);
  cue('anger',.4);cue('heart',9.4);cue('slow',13.6);cue('poof',18.2);cue('end',19.4);
  if(elapsed>=ENDING_DURATION)finished=true},
 draw(c,n){
  const t=elapsed,W=900,scale=c.canvas.width/W,H=c.canvas.height/scale;
  c.save();c.setTransform(1,0,0,1,0,0);c.scale(scale,scale);
  const bar0=Math.min(34,H*.06);
  const dawn=ease(clamp((t-9)/9));                 // 0 = eclipse night, 1 = sunrise
  const g=c.createLinearGradient(0,0,0,H);
  const mix=(a,b)=>a.map((v,i)=>Math.round(lerp(v,b[i],dawn)));
  const top=mix([8,10,26],[255,168,96]),mid=mix([36,18,52],[255,214,150]),low=mix([10,14,30],[120,180,200]);
  g.addColorStop(0,`rgb(${top})`);g.addColorStop(.55,`rgb(${mid})`);g.addColorStop(1,`rgb(${low})`);
  c.fillStyle=g;c.fillRect(0,0,W,H);
  const gy=Math.min(H*.6,H-bar0-175),sx=690,sy=gy-150-dawn*70;
  // Sun with the black eclipse disc sliding away as the seals fade.
  const glow=c.createRadialGradient(sx,sy,10,sx,sy,260);glow.addColorStop(0,`rgba(255,${Math.round(lerp(60,236,dawn))},${Math.round(lerp(90,160,dawn))},${lerp(.35,.9,dawn)})`);glow.addColorStop(1,'rgba(255,120,60,0)');
  c.fillStyle=glow;c.fillRect(0,0,W,H);
  c.fillStyle=`rgb(255,${Math.round(lerp(70,226,dawn))},${Math.round(lerp(90,150,dawn))})`;c.beginPath();c.arc(sx,sy,78,0,Math.PI*2);c.fill();
  const cover=1-ease(clamp((t-11)/6));
  if(cover>0){c.fillStyle='#050812';c.beginPath();c.arc(sx-(1-cover)*190,sy+(1-cover)*20,80,0,Math.PI*2);c.fill()}
  // Rooftops, five broken seals on the horizon.
  for(let i=0;i<11;i++){const x=i*100-40,y=gy-30+Math.sin(i*7)*24;c.fillStyle=dawn>.5?(i%2?'#4b3a52':'#3c2d44'):(i%2?'#101b2b':'#0a1423');c.fillRect(x,y,110,H);c.beginPath();c.moveTo(x-22,y);c.lineTo(x+55,y-44);c.lineTo(x+132,y);c.fill()}
  for(let i=0;i<5;i++){const x=110+i*150,y=gy-72-(i%2)*18,broken=t>1.6+i*.5;c.save();c.translate(x,y);c.globalAlpha=broken?clamp(1-(t-1.6-i*.5)/1.4)*.9:.9;c.strokeStyle=dawn>.4?'#ffb25a':'#ff4a78';c.lineWidth=3;c.beginPath();c.arc(0,0,16,0,Math.PI*2);c.moveTo(-10,0);c.lineTo(10,0);c.moveTo(0,-10);c.lineTo(0,10);c.stroke();c.restore()}
  c.fillStyle=dawn>.5?'#2c2130':'#0a1018';c.fillRect(0,gy,W,H-gy);
  c.fillStyle=dawn>.5?'#5a4466':'#18222f';c.fillRect(0,gy,W,5);
  // Falling petals during the dawn.
  if(!reduced&&dawn>.2){c.fillStyle='#ffc1d9';for(let i=0;i<22;i++){const px=((i*97+t*(24+i%5*7))%1000)-50,py=((i*53+t*(36+i%4*9))%(H+40))-20;c.globalAlpha=.55*dawn;c.beginPath();c.ellipse(px,py,4,2,t+i,0,Math.PI*2);c.fill()}c.globalAlpha=1}
  // Characters (if the bundle supplied its drawing helpers).
  if(Yi&&yi){
   const bob=reduced?0:Math.sin(t*3)*2;
   const kneel=ease(clamp((t-4.0)/1.4))*(1-ease(clamp((t-14.4)/1.4)));
   place(kuro,'foe',215,gy-74+kneel*16+bob*.4,1,{variant:1,royal:1,drawn:1,blade:-.5,hfx:t<4?24:16,hfy:t<4?2:12,hbx:-22,hby:6,brow:t<9?1:.2,eyeGlow:t<9?1:0,mood:+(t>9.4)});
   place(spud,'hero',520+Math.min(0,Math.sin(t*2))*0,gy-52+bob,-1,{drawn:t<18?.2:1,mood:+(t>13.6),eyeWide:+(t<5)});
   c.save();c.translate(kuro.x,kuro.y);c.scale(3.2,3.2);c.rotate(kneel*.28);c.translate(-kuro.x,-kuro.y);Yi(c,kuro,foe||{},Pi?Pi(kuro,t,1.5):null);c.restore();
   c.save();c.translate(spud.x,spud.y);c.scale(2.3,2.3);c.translate(-spud.x,-spud.y);Yi(c,spud,hero||{},Pi?Pi(spud,t):null);c.restore();
  }
  // Letterbox, subtitles, title card and the sequel hook.
  const bar=Math.min(34,H*.06);c.fillStyle='#030710';c.fillRect(0,0,W,bar);c.fillRect(0,H-bar,W,bar);
  c.textAlign='left';c.textBaseline='top';c.font='700 15px system-ui';c.fillStyle='#ffd9a8';c.fillText('EPÍLOGO  /  O AMANHECER',35,bar+16);
  const line=ENDING_LINES.find(([a,b])=>t>=a&&t<b);
  if(line){const topY=H-bar-132;c.fillStyle='#040a15ed';c.fillRect(24,topY,852,124);c.fillStyle=line[2]==='POTATINJA'?'#72e5d0':'#ff8dac';c.font='800 17px system-ui';c.fillText(line[2],44,topY+15);c.fillStyle='#fff2e5';c.font='500 23px system-ui';let row='',y=topY+45;for(const word of line[3].split(' ')){const next=row?row+' '+word:word;if(c.measureText(next).width>805&&row){c.fillText(row,44,y);row=word;y+=29}else row=next}c.fillText(row,44,y)}
  if(t>=18.2){
   const k=clamp((t-18.2)/1.2);c.fillStyle=`rgba(3,7,16,${.88*k})`;c.fillRect(0,0,W,H);
   c.textAlign='center';c.textBaseline='middle';c.fillStyle=`rgba(255,226,150,${k})`;c.font='900 68px system-ui';c.fillText(strings.end||'Fim',W/2,H*.34);
   c.fillStyle=`rgba(255,242,229,${clamp((t-19.4)/1)})`;c.font='600 24px system-ui';c.fillText(strings.thanks||'Obrigado por jogar!',W/2,H*.34+64);
   c.fillStyle=`rgba(255,200,120,${clamp((t-20.4)/1)})`;c.font='700 20px system-ui';c.fillText('Criado por DannD',W/2,H*.34+104);
   const hook=clamp((t-22)/1.2);
   if(hook>0){c.fillStyle=`rgba(255,120,150,${hook})`;c.font='italic 500 20px system-ui';c.fillText('Mas o selo que se partiu… não era o último.',W/2,H*.78);
    c.fillStyle=`rgba(255,40,80,${hook*(.6+.4*Math.sin(t*4))})`;for(const dx of[-24,24]){c.beginPath();c.ellipse(W/2+dx,H*.88,9,4,dx<0?.2:-.2,0,Math.PI*2);c.fill()}}
  }
  const fade=t<.6?1-t/.6:t>ENDING_DURATION-.6?(t-(ENDING_DURATION-.6))/.6:0;if(fade>0){c.globalAlpha=fade;c.fillStyle='#030710';c.fillRect(0,0,W,H)}
  c.restore();
 }};
}
