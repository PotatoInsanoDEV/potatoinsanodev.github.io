import {drawDuck} from './duck-renderer.js';
import {drawVeggie} from './duck-veggies.js';

export const ECLIPSE_DURATION=19;
export const ECLIPSE_LINES=[
 [1,4.4,'KURO · SENHOR DO ECLIPSE','Meu clã foi esquecido nas sombras. Agora o mundo conhecerá o meu nome.'],
 [4.4,8.4,'KURO · SENHOR DO ECLIPSE','Vou romper os cinco selos do amanhecer e apagar o sol para sempre!'],
 [8.4,12.2,'KURO · SENHOR DO ECLIPSE','Quando o último selo cair, este mundo será destruído. Tente me impedir, pequeno ninja.'],
 [15.2,19,'POTATINJA','Os cinco selos… Preciso alcançá-lo antes do eclipse. Meu treinamento começa agora.']
];

// Standalone cinematic: consumes no campaign, physics or aiming state.
export function createDuckIntro(sound=()=>{},reduced=false){
 let elapsed=0,finished=false;const fired=new Set();
 const cue=(name,at)=>{if(elapsed>=at&&!fired.has(name)){fired.add(name);sound(name.split(':')[0])}};
 return {kind:'intro',get done(){return finished},skip(){finished=true},
 update(dt){if(finished)return;elapsed+=Math.max(0,dt);cue('anger',.7);cue('dash',12.3);cue('dash:2',13.1);cue('poof',14.3);if(elapsed>=ECLIPSE_DURATION)finished=true},
 draw(c){
  const t=elapsed,phase=Math.min(1,Math.max(0,(t-12.2)/2.6));
  c.save();c.setTransform(1,0,0,1,0,0);
  const scale=c.canvas.width/900,H=c.canvas.height/scale,W=900;
  c.scale(scale,scale);
  const cy=H*.44,scene=Math.min(H,600),g=c.createLinearGradient(0,0,W,H);
  g.addColorStop(0,'#060b17');g.addColorStop(.55,'#24152f');g.addColorStop(1,'#060c19');c.fillStyle=g;c.fillRect(0,0,W,H);
  // Blood moon, distant rooftops and wind-driven feathers.
  c.fillStyle='#ae4765';c.globalAlpha=.45;c.beginPath();c.arc(690,cy-scene*.18,80,0,Math.PI*2);c.fill();c.globalAlpha=1;
  for(let i=0;i<11;i++){let x=i*100-50,y=cy+scene*.24+Math.sin(i*7)*25;c.fillStyle=i%2?'#101b2b':'#0a1423';c.fillRect(x,y,110,H);c.beginPath();c.moveTo(x-22,y);c.lineTo(x+55,y-48);c.lineTo(x+132,y);c.fill()}
  c.strokeStyle='#b988bc';c.lineWidth=1;
  for(let i=0;i<32;i++){const x=((i*137-(reduced?0:t*90))%1000+1000)%1000-50,y=(i*73)%Math.max(1,H);c.globalAlpha=.12+(i%3)*.07;c.beginPath();c.moveTo(x,y);c.lineTo(x+20,y-4);c.stroke()}
  c.globalAlpha=1;
  if(t<12.2){
   // Kuro: a berinjela imperial (a mesma do epílogo) em close extremo, com aura roxa.
   const zoom=reduced?1:1+Math.min(t,10)*.012;
   c.save();c.translate(450,cy+30);c.scale(zoom,zoom);
   const au=c.createRadialGradient(0,-20,20,0,-20,300);au.addColorStop(0,'rgba(160,60,255,.45)');au.addColorStop(1,'rgba(160,60,255,0)');c.fillStyle=au;c.fillRect(-340,-320,680,640);
   c.scale(4.1,4.1);drawVeggie(c,{variant:1,royal:1,t,drawn:1,brow:1,eyeGlow:1,mood:0,facing:1,x:0,y:0,side:1,hbx:-27,hby:17,hfx:29,hfy:17,fbx:-10,fby:22,ffx:10,ffy:22,blade:-1.0});
   c.restore();
   if(!reduced){c.strokeStyle='#ff718b';c.globalAlpha=.2;for(let i=0;i<18;i++){const y=cy-scene*.3+i*18;c.beginPath();c.moveTo(i%2?0:900,y);c.lineTo(i%2?160:740,y-5);c.stroke()}c.globalAlpha=1}
  }else if(t<14.8){
   // Backflip, rooftop rebound, then a diagonal dash with afterimages.
   const u=phase,x=u<.5?450-u*290:305+(u-.5)*1550,y=cy+60-Math.sin(u*Math.PI)*160;
   for(let i=3;i>=0;i--){c.save();c.globalAlpha=i?.12/i:1;c.translate(x-i*35,y+i*13);c.rotate(reduced?0:-u*Math.PI*4);c.scale(2.4,2.4);drawDuck(c,{kind:'hero',t,fbx:-12,fby:23,ffx:14,ffy:15,hbx:-24,hby:4,hfx:24,hfy:0,blade:-.5,smear:1,drawn:1},{},null);c.restore()}
  }
  if(t>14&&t<15.4){const u=(t-14)/1.4;c.fillStyle='#b5a4be';for(let i=0;i<9;i++){c.globalAlpha=(1-u)*.6;c.beginPath();c.arc(680+Math.cos(i*2.4)*u*140,cy+20+Math.sin(i*2.4)*u*75,12+u*22,0,Math.PI*2);c.fill()}c.globalAlpha=1}
  // Letterbox and responsive subtitles remain in screen space.
  const bar=Math.min(34,H*.06);c.fillStyle='#030710';c.fillRect(0,0,W,bar);c.fillRect(0,H-bar,W,bar);
  c.textAlign='left';c.textBaseline='top';c.font='700 15px system-ui';c.fillStyle='#d9a3bd';c.fillText('PRÓLOGO  /  O ÚLTIMO AMANHECER',35,bar+16);
  const line=ECLIPSE_LINES.find(([a,b])=>t>=a&&t<b);
  if(line){const top=H-bar-132;c.fillStyle='#040a15ed';c.fillRect(24,top,852,124);c.fillStyle=line[2]==='POTATINJA'?'#72e5d0':'#ff8dac';c.font='800 17px system-ui';c.fillText(line[2],44,top+15);c.fillStyle='#fff2e5';c.font='500 23px system-ui';let row='',y=top+45;for(const word of line[3].split(' ')){const next=row?row+' '+word:word;if(c.measureText(next).width>805&&row){c.fillText(row,44,y);row=word;y+=29}else row=next}c.fillText(row,44,y)}
  const fade=t<.65?1-t/.65:t>18.5?(t-18.5)/.5:0;if(fade>0){c.globalAlpha=fade;c.fillStyle='#030710';c.fillRect(0,0,W,H)}
  c.restore();
 }
 };
}
