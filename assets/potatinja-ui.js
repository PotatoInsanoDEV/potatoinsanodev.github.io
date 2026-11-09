// Potatinja — som e animação de interface. Sons sintetizados (WebAudio): nenhum arquivo extra.
// Só observa a interface; não toca na lógica do jogo.
let ctx=null,master=null;
const vol=()=>{const r=document.getElementById('sSfx');const m=document.getElementById('mSfx');
 if(m&&m.type==='checkbox'&&m.offsetParent!==null&&!m.checked)return 0;
 const v=r?parseFloat(r.value):NaN;return Number.isFinite(v)?v:.9};
function ac(){if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{ctx=new A();master=ctx.createGain();master.gain.value=.5;master.connect(ctx.destination)}catch{return null}}
 if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx}
function tone(f0,f1,dur,type='sine',gain=.3,delay=0){
 const c=ac();if(!c)return;const v=vol();if(v<=0)return;const t=c.currentTime+delay;
 const o=c.createOscillator(),g=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
 g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(gain*v,t+.012);g.gain.exponentialRampToValueAtTime(.0001,t+dur);
 o.connect(g);g.connect(master);o.start(t);o.stop(t+dur+.03)}
function noise(dur,gain=.15,hp=2000,delay=0){
 const c=ac();if(!c)return;const v=vol();if(v<=0)return;const t=c.currentTime+delay,n=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);
 for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*(1-i/n);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='highpass';f.frequency.value=hp;const g=c.createGain();g.gain.value=gain*v;
 s.connect(f);f.connect(g);g.connect(master);s.start(t)}

// --- Ascensão: sons de carga, explosão, raios e grito ---
function asc(fn){const c=ac();if(!c)return;const v=vol();if(v<=0)return;try{fn(c,v)}catch{}}
function ascCharge(){asc((c,v)=>{const t=c.currentTime,D=2.7;
 const o=c.createOscillator(),o2=c.createOscillator(),g=c.createGain(),f=c.createBiquadFilter();o.type='sawtooth';o2.type='square';o.frequency.setValueAtTime(55,t);o.frequency.exponentialRampToValueAtTime(420,t+D);o2.frequency.setValueAtTime(27,t);o2.frequency.exponentialRampToValueAtTime(210,t+D);
 f.type='lowpass';f.frequency.setValueAtTime(200,t);f.frequency.exponentialRampToValueAtTime(3200,t+D);g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.28*v,t+D);g.gain.exponentialRampToValueAtTime(.0001,t+D+.08);
 o.connect(f);o2.connect(f);f.connect(g);g.connect(master);o.start(t);o2.start(t);o.stop(t+D+.1);o2.stop(t+D+.1);
 const n=Math.floor(c.sampleRate*D),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;
 const s=c.createBufferSource();s.buffer=b;const bp=c.createBiquadFilter();bp.type='bandpass';bp.Q.value=2;bp.frequency.setValueAtTime(300,t);bp.frequency.exponentialRampToValueAtTime(5000,t+D);const ng=c.createGain();ng.gain.setValueAtTime(.0001,t);ng.gain.exponentialRampToValueAtTime(.22*v,t+D);ng.gain.exponentialRampToValueAtTime(.0001,t+D+.05);
 s.connect(bp);bp.connect(ng);ng.connect(master);s.start(t)})}
function ascBoom(){asc((c,v)=>{const t=c.currentTime;
 const o=c.createOscillator(),g=c.createGain();o.type='sine';o.frequency.setValueAtTime(150,t);o.frequency.exponentialRampToValueAtTime(32,t+.7);g.gain.setValueAtTime(.7*v,t);g.gain.exponentialRampToValueAtTime(.0001,t+.8);o.connect(g);g.connect(master);o.start(t);o.stop(t+.85);
 const n=Math.floor(c.sampleRate*.9),b=c.createBuffer(1,n,c.sampleRate),d=b.getChannelData(0);for(let i=0;i<n;i++)d[i]=(Math.random()*2-1)*Math.pow(1-i/n,2);
 const s=c.createBufferSource();s.buffer=b;const lp=c.createBiquadFilter();lp.type='lowpass';lp.frequency.setValueAtTime(5000,t);lp.frequency.exponentialRampToValueAtTime(300,t+.8);const ng=c.createGain();ng.gain.value=.5*v;s.connect(lp);lp.connect(ng);ng.connect(master);s.start(t)});
 tone(1600,300,.35,'sawtooth',.14,.02)}
function ascZap(){noise(.09,.16,3000);tone(2400+Math.random()*1800,500,.07,'square',.07)}
function ascRoar(){asc((c,v)=>{const t=c.currentTime,D=1.5;
 const mk=(type,f0,f1)=>{const o=c.createOscillator();o.type=type;o.frequency.setValueAtTime(f0,t);o.frequency.exponentialRampToValueAtTime(f1,t+D);return o};
 const a=mk('sawtooth',170,85),b=mk('sawtooth',172.5,86),lfo=c.createOscillator(),lg=c.createGain();lfo.frequency.value=22;lg.gain.value=9;lfo.connect(lg);lg.connect(a.frequency);lg.connect(b.frequency);
 const ws=c.createWaveShaper(),cv=new Float32Array(256);for(let i=0;i<256;i++){const x=i/128-1;cv[i]=Math.tanh(x*5)}ws.curve=cv;
 const f1=c.createBiquadFilter(),f2=c.createBiquadFilter();f1.type='bandpass';f1.Q.value=4;f1.frequency.setValueAtTime(600,t);f1.frequency.linearRampToValueAtTime(950,t+.35);f1.frequency.linearRampToValueAtTime(480,t+D);
 f2.type='bandpass';f2.Q.value=5;f2.frequency.setValueAtTime(1500,t);f2.frequency.linearRampToValueAtTime(2300,t+.35);f2.frequency.linearRampToValueAtTime(1100,t+D);
 const g=c.createGain();g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.8*v,t+.12);g.gain.setValueAtTime(.7*v,t+.7);g.gain.exponentialRampToValueAtTime(.0001,t+D);
 a.connect(ws);b.connect(ws);ws.connect(f1);ws.connect(f2);f1.connect(g);f2.connect(g);g.connect(master);[a,b,lfo].forEach(o=>{o.start(t);o.stop(t+D+.05)});
 const n=Math.floor(c.sampleRate*D),nb=c.createBuffer(1,n,c.sampleRate),d=nb.getChannelData(0);for(let i=0;i<n;i++)d[i]=Math.random()*2-1;const s=c.createBufferSource();s.buffer=nb;const nf=c.createBiquadFilter();nf.type='bandpass';nf.frequency.value=1800;nf.Q.value=.8;const ng=c.createGain();ng.gain.setValueAtTime(.0001,t);ng.gain.exponentialRampToValueAtTime(.3*v,t+.15);ng.gain.exponentialRampToValueAtTime(.0001,t+D);s.connect(nf);nf.connect(ng);ng.connect(master);s.start(t)});
 setTimeout(ascBoom,40)}
export const SFX={
 tap(){tone(520,380,.07,'triangle',.28);tone(980,760,.05,'sine',.1)},
 primary(){tone(440,660,.09,'square',.12);tone(660,990,.12,'triangle',.26,.05);noise(.05,.05,5000)},
 back(){tone(520,330,.1,'triangle',.26)},
 tab(){tone(700,900,.06,'triangle',.22);tone(1050,1250,.05,'sine',.1,.03)},
 on(){tone(480,760,.09,'triangle',.28);tone(760,1140,.08,'sine',.16,.05)},
 off(){tone(620,380,.1,'triangle',.26)},
 tick(){tone(1250,1100,.025,'square',.06)},
 open(){noise(.14,.08,1500);tone(300,620,.16,'sine',.2)},
 close(){noise(.1,.06,1800);tone(560,260,.14,'sine',.18)},
 locked(){tone(190,120,.16,'sawtooth',.18);tone(160,100,.16,'sawtooth',.16,.09)},
 equip(){[523,659,784,1047].forEach((f,i)=>tone(f,f,.16,'triangle',.26,i*.06));noise(.12,.06,6000,.18)},
 select(){tone(600,720,.07,'triangle',.24);tone(900,1050,.06,'sine',.12,.04)},
 whoosh(){noise(.22,.12,900);tone(900,300,.2,'sawtooth',.06)},
 hit(){tone(1800,900,.05,'square',.14);tone(300,150,.08,'triangle',.2);noise(.04,.1,4000)},
 slash(){noise(.3,.22,700);tone(1400,200,.28,'sawtooth',.12);tone(2200,500,.18,'triangle',.1,.03)},
 ascCharge,ascBoom,ascZap,ascRoar,
 star(){[880,1175,1568].forEach((f,i)=>tone(f,f*1.01,.14,'sine',.22,i*.07))}
};
SFX.unlocked=()=>!!ctx&&ctx.state==='running';window.potatinjaSFX=SFX;
const reduced=()=>{const m=document.getElementById('sMotion');return !!(m&&m.checked)||matchMedia('(prefers-reduced-motion: reduce)').matches};
const buzz=ms=>{try{if(navigator.vibrate&&vol()>0)navigator.vibrate(ms)}catch{}};
function ripple(el,ev){
 if(reduced())return;const r=el.getBoundingClientRect(),s=Math.max(r.width,r.height)*2.2;
 const d=document.createElement('span');d.className='pn-rip';d.style.width=d.style.height=s+'px';
 d.style.left=((ev.clientX||r.left+r.width/2)-r.left)+'px';d.style.top=((ev.clientY||r.top+r.height/2)-r.top)+'px';
 const cs=getComputedStyle(el);if(cs.position==='static')el.style.position='relative';
 el.appendChild(d);setTimeout(()=>d.remove(),560)}
const PRESS='#ui button,#ui .sk,#ui .wp,#ui [role=tab]';
let lastTick=0;
document.addEventListener('pointerdown',ev=>{
 const el=ev.target.closest&&ev.target.closest(PRESS);if(!el||el.disabled)return;
 if(el.closest('#bThrow')||el.id==='bThrow')return; // o botão de arremesso tem seu próprio som
 if(el.classList.contains('shut')){SFX.locked();buzz([12,40,12]);return}
 if(el.matches('.wtabs button,.duck-preview-controls button,[role=tab]'))SFX.tab();
 else if(el.matches('.sk,.wp'))SFX.select();
 else if(el.id==='bEquip')SFX.equip();
 else if(el.matches('.btn.x,.btn.ico,#bSkinsBack,[aria-label=Voltar]'))SFX.back();
 else if(el.matches('.btn.primary'))SFX.primary();
 else SFX.tap();
 buzz(el.matches('.btn.primary,#bEquip')?16:8);ripple(el,ev)
},{capture:true,passive:true});
document.addEventListener('change',ev=>{const t=ev.target;if(t&&t.type==='checkbox'){t.checked?SFX.on():SFX.off();buzz(10)}},true);
document.addEventListener('input',ev=>{const t=ev.target;if(t&&t.type==='range'){const n=performance.now();if(n-lastTick>55){lastTick=n;SFX.tick()}}},true);
// painéis: som e animação de entrada/saída
const ui=document.getElementById('ui');
if(ui){
 const state=new WeakMap();
 const check=()=>{ui.querySelectorAll('.sheet').forEach(s=>{
  const cs=getComputedStyle(s),vis=!s.hidden&&cs.display!=='none'&&cs.visibility!=='hidden',prev=state.get(s);
  const anim=()=>{s.classList.remove('pn-in');void s.offsetWidth;s.classList.add('pn-in')};
  if(prev===undefined){state.set(s,vis);if(vis)anim()}
  else if(vis&&!prev){anim();SFX.open();state.set(s,true)}
  else if(!vis&&prev){SFX.close();state.set(s,false)}
 })};
 new MutationObserver(check).observe(ui,{subtree:true,attributes:true,attributeFilter:['class','hidden','style'],childList:true});
 setTimeout(check,400);
}
// modo "reduzir movimento": classe no <html>
const syncMotion=()=>document.documentElement.classList.toggle('pn-reduced',reduced());
document.addEventListener('change',syncMotion,true);setTimeout(syncMotion,500);
// primeiro toque libera o áudio no celular
addEventListener('pointerdown',()=>ac(),{once:true,passive:true,capture:true});
