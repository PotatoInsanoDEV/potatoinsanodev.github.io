// Tela "Criado por DannD" — a batata ninja joga 3 shurikens e corta o nome. Sons sintetizados (WebAudio).
let ctx=null,master=null;
function ac(){if(!ctx){const A=window.AudioContext||window.webkitAudioContext;if(!A)return null;try{ctx=new A();master=ctx.createGain();master.gain.value=.55;master.connect(ctx.destination)}catch{return null}}
 if(ctx.state==='suspended')ctx.resume().catch(()=>{});return ctx}
function mk(vol){
 const tone=(f0,f1,dur,type='sine',g=.3,d=0)=>{const c=ac();if(!c||vol<=0)return;const t=c.currentTime+d,o=c.createOscillator(),n=c.createGain();o.type=type;o.frequency.setValueAtTime(f0,t);if(f1!==f0)o.frequency.exponentialRampToValueAtTime(Math.max(30,f1),t+dur);
  n.gain.setValueAtTime(.0001,t);n.gain.exponentialRampToValueAtTime(g*vol,t+.01);n.gain.exponentialRampToValueAtTime(.0001,t+dur);o.connect(n);n.connect(master);o.start(t);o.stop(t+dur+.03)};
 const noise=(dur,g=.15,hp=2000,d=0,sweep=0)=>{const c=ac();if(!c||vol<=0)return;const t=c.currentTime+d,len=Math.floor(c.sampleRate*dur),b=c.createBuffer(1,len,c.sampleRate),a=b.getChannelData(0);
  for(let i=0;i<len;i++)a[i]=(Math.random()*2-1)*(1-i/len);const s=c.createBufferSource();s.buffer=b;const f=c.createBiquadFilter();f.type='bandpass';f.frequency.setValueAtTime(hp,t);if(sweep)f.frequency.exponentialRampToValueAtTime(Math.max(100,sweep),t+dur);f.Q.value=1.2;
  const n=c.createGain();n.gain.value=g*vol;s.connect(f);f.connect(n);n.connect(master);s.start(t)};
 return{
  swing(){noise(.28,.2,700,0,2600);tone(500,1500,.22,'sawtooth',.05)},
  throw(i=0){noise(.34,.22,1200+i*250,0,4200);tone(1800+i*150,700,.3,'triangle',.1)},
  thunk(){tone(180,70,.14,'triangle',.4);tone(2200,1200,.05,'square',.12);noise(.06,.18,3500)},
  slash(){noise(.36,.38,900,0,6500);tone(2400,260,.32,'sawtooth',.18);tone(3200,600,.2,'triangle',.12,.02);noise(.12,.25,5000,.05)},
  boom(){tone(120,40,.4,'sine',.5);noise(.25,.25,500,0,200)},
  ting(){[1175,1568,2093].forEach((f,i)=>tone(f,f*1.005,.5,'sine',.22,i*.09));noise(.4,.08,6000,.12)},
  land(){tone(220,90,.12,'triangle',.3)}
 }}
const STYLE=`
.cs-splash{position:fixed;inset:0;z-index:2147483000;overflow:hidden;background:radial-gradient(ellipse at 50% 48%,#1d4658 0%,#0b202f 42%,#040c17 90%);color:#f9f1df;touch-action:none;transition:opacity .55s ease,transform .55s ease;font-family:'Lilita One',Fredoka,'Segoe UI',system-ui,sans-serif}
.cs-splash.creator-exit{opacity:0;transform:scale(1.06)}
.cs-splash .cs-stage{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center}
.cs-splash.shake .cs-stage{animation:cs-shake .45s linear}
@keyframes cs-shake{0%,100%{transform:translate(0)}15%{transform:translate(-9px,5px)}30%{transform:translate(8px,-6px)}45%{transform:translate(-6px,-4px)}60%{transform:translate(5px,5px)}80%{transform:translate(-3px,2px)}}
.cs-splash .cs-rays{position:absolute;left:50%;top:50%;width:150vmax;height:150vmax;margin:-75vmax 0 0 -75vmax;background:repeating-conic-gradient(from 0deg,#4edfc826 0 6deg,transparent 6deg 18deg);animation:cs-spin 22s linear infinite;opacity:0;-webkit-mask:radial-gradient(circle,#000 0,transparent 55%);mask:radial-gradient(circle,#000 0,transparent 55%);transition:opacity .6s}
.cs-splash.hit .cs-rays{opacity:1}
@keyframes cs-spin{to{transform:rotate(360deg)}}
.cs-splash .cs-intro{margin:0 0 .4em;font-size:clamp(13px,3.6vh,22px);letter-spacing:.32em;text-transform:uppercase;color:#9fe9dc;opacity:0;transform:translateY(-14px);transition:all .5s}
.cs-splash.in .cs-intro{opacity:1;transform:none}
.cs-splash .cs-wrap{position:relative;font-size:clamp(64px,24vh,170px);line-height:1.05;letter-spacing:.01em;white-space:nowrap}
.cs-splash .cs-name,.cs-splash .cs-half{display:block;color:#f6e8c9;text-shadow:0 .05em 0 #0a1a26,0 0 .5em #4edfc855}
.cs-splash .cs-name{opacity:0;transform:scale(.6);transition:opacity .3s,transform .4s cubic-bezier(.2,1.6,.4,1)}
.cs-splash.in .cs-name{opacity:1;transform:none}
.cs-splash b{color:#4edfc8;font-weight:inherit}
.cs-splash .cs-half{position:absolute;inset:0;visibility:hidden}
.cs-splash .cs-half.a{clip-path:polygon(-5% -5%,105% -5%,105% 36%,-5% 62%)}
.cs-splash .cs-half.b{clip-path:polygon(-5% 62%,105% 36%,105% 105%,-5% 105%)}
.cs-splash .cs-wrap.cut .cs-name{visibility:hidden}
.cs-splash .cs-wrap.cut .cs-half{visibility:visible}
.cs-splash .cs-wrap.cut .cs-half.a{animation:cs-ha .9s cubic-bezier(.2,1.2,.3,1) forwards}
.cs-splash .cs-wrap.cut .cs-half.b{animation:cs-hb .9s cubic-bezier(.2,1.2,.3,1) forwards}
@keyframes cs-ha{0%{transform:none}25%{transform:translate(-.1em,-.07em) rotate(-2deg)}100%{transform:none}}
@keyframes cs-hb{0%{transform:none}25%{transform:translate(.1em,.07em) rotate(2deg)}100%{transform:none}}
.cs-splash .cs-scratch{position:absolute;left:-6%;top:50%;width:112%;height:.06em;background:linear-gradient(90deg,transparent,#fff 12%,#fff 88%,transparent);box-shadow:0 0 .25em #fff,0 0 .6em #4edfc8;transform-origin:left center;transform:rotate(-11deg) scaleX(0);opacity:0}
.cs-splash .cs-wrap.cut .cs-scratch{animation:cs-sc .75s ease-out forwards}
@keyframes cs-sc{0%{transform:rotate(-11deg) scaleX(0);opacity:1}25%{transform:rotate(-11deg) scaleX(1);opacity:1}100%{transform:rotate(-11deg) scaleX(1);opacity:0}}
.cs-splash .cs-flash{position:absolute;inset:0;background:#fff;opacity:0;pointer-events:none}
.cs-splash.flash .cs-flash{animation:cs-fl .35s ease-out}
@keyframes cs-fl{0%{opacity:.85}100%{opacity:0}}
.cs-splash .cs-rule{width:min(46vw,260px);height:4px;border-radius:4px;margin-top:.9em;background:#ffffff22;overflow:hidden;opacity:0;transition:opacity .4s}
.cs-splash.done .cs-rule{opacity:1}
.cs-splash .cs-rule i{display:block;height:100%;width:0;background:linear-gradient(90deg,#4edfc8,#ffd978);transition:width .9s ease-out}
.cs-splash.done .cs-rule i{width:100%}
.cs-splash .cs-sig{margin-top:.7em;font-size:clamp(12px,3.4vh,20px);letter-spacing:.5em;color:#ffd978;opacity:0;transform:translateY(10px);transition:all .5s .15s;position:relative;overflow:hidden;padding:0 .5em}
.cs-splash.done .cs-sig{opacity:1;transform:none}
.cs-splash.done .cs-sig::after{content:'';position:absolute;top:0;bottom:0;width:30%;left:-40%;background:linear-gradient(100deg,transparent,#ffffffcc,transparent);animation:cs-shine 1.1s .3s ease-out forwards}
@keyframes cs-shine{to{left:120%}}
.cs-splash .cs-hero{position:absolute;width:clamp(90px,26vh,170px);left:0;top:0;pointer-events:none;will-change:transform}
.cs-splash .cs-star{position:absolute;width:clamp(26px,7vh,46px);left:0;top:0;pointer-events:none;will-change:transform;filter:drop-shadow(0 0 6px #fff9)}
.cs-splash canvas{position:absolute;inset:0;width:100%;height:100%;pointer-events:none}
.cs-splash.creator-calm .cs-rays{animation:none}.cs-splash.creator-calm.shake .cs-stage{animation:none}
`;
const STAR='<svg viewBox="0 0 64 64"><path d="M32 2 38 26 62 32 38 38 32 62 26 38 2 32 26 26Z" fill="#eef7ff" stroke="#0a1a26" stroke-width="3" stroke-linejoin="round"/><circle cx="32" cy="32" r="6" fill="#0a1a26"/></svg>';
const HERO='<svg viewBox="-10 0 130 150"><ellipse cx="60" cy="146" rx="30" ry="4" fill="#0004"/><path d="M60 24Q58 8 70 4Q72 18 62 24Z" fill="#6ad06b" stroke="#0a1a26" stroke-width="3"/><path d="M60 142C22 142 14 106 18 78 22 48 40 30 60 30S98 48 102 78C106 106 98 142 60 142Z" fill="#e4a95a" stroke="#0a1a26" stroke-width="4"/><path d="M26 100C44 112 76 112 94 100L96 118C80 130 40 130 24 118Z" fill="#29b7c9" stroke="#0a1a26" stroke-width="3"/><path d="M14 56 106 52 106 70 14 74Z" fill="#29b7c9" stroke="#0a1a26" stroke-width="4"/><path d="M14 58 -4 50 2 68 14 70Z" fill="#29b7c9" stroke="#0a1a26" stroke-width="3"/><rect x="48" y="53" width="24" height="16" rx="3" fill="#cfd8de" stroke="#0a1a26" stroke-width="3"/><circle cx="46" cy="86" r="11" fill="#fff" stroke="#0a1a26" stroke-width="3"/><circle cx="76" cy="86" r="11" fill="#fff" stroke="#0a1a26" stroke-width="3"/><circle cx="49" cy="87" r="5.5" fill="#0a1a26"/><circle cx="79" cy="87" r="5.5" fill="#0a1a26"/><circle cx="51" cy="84" r="2" fill="#fff"/><circle cx="81" cy="84" r="2" fill="#fff"/><path d="M52 104Q61 112 70 104" fill="none" stroke="#0a1a26" stroke-width="3.5" stroke-linecap="round"/><ellipse cx="34" cy="103" rx="6" ry="4" fill="#f08a8a88"/><ellipse cx="88" cy="103" rx="6" ry="4" fill="#f08a8a88"/><circle cx="106" cy="100" r="9" fill="#e4a95a" stroke="#0a1a26" stroke-width="3"/><circle cx="14" cy="104" r="9" fill="#e4a95a" stroke="#0a1a26" stroke-width="3"/></svg>';
export function showCreatorSplash(root,settings={}){
 if(!document.getElementById('cs-style')){const s=document.createElement('style');s.id='cs-style';s.textContent=STYLE;document.head.append(s)}
 const calm=!!settings.lessMotion||matchMedia('(prefers-reduced-motion: reduce)').matches;
 const vol=typeof settings.sfx==='number'?settings.sfx:.9;const S=mk(vol);
 const panel=document.createElement('div');panel.className='cs-splash';panel.setAttribute('role','status');panel.setAttribute('aria-label','Criado por DannD');
 const nm='<b>Dann</b>D';
 panel.innerHTML='<div class="cs-rays"></div><canvas></canvas><div class="cs-stage"><p class="cs-intro">Criado por</p><div class="cs-wrap"><span class="cs-name">'+nm+'</span><span class="cs-half a">'+nm+'</span><span class="cs-half b">'+nm+'</span><i class="cs-scratch"></i></div><div class="cs-rule"><i></i></div><span class="cs-sig">POTATINJA</span></div><div class="cs-hero">'+HERO+'</div><div class="cs-flash"></div>';
 if(calm)panel.classList.add('creator-calm');
 root.append(panel);
 const unlock=()=>ac();['pointerdown','touchstart','keydown','click'].forEach(n=>window.addEventListener(n,unlock,{capture:true,once:true}));
 ac();
 const events=['pointerdown','pointerup','click','touchstart','touchend','keydown','keyup','wheel'];const block=e=>{e.preventDefault();e.stopImmediatePropagation()};events.forEach(n=>window.addEventListener(n,block,{capture:true,passive:false}));
 const hero=panel.querySelector('.cs-hero'),wrap=panel.querySelector('.cs-wrap'),cv=panel.querySelector('canvas'),cx=cv.getContext('2d');
 const stars=[],parts=[];let W=innerWidth,H=innerHeight,alive=true,raf=0;
 const dpr=Math.min(2,devicePixelRatio||1);cv.width=W*dpr;cv.height=H*dpr;cx.setTransform(dpr,0,0,dpr,0,0);
 const T=[];const at=(ms,fn)=>T.push(setTimeout(()=>{if(alive)fn()},ms));
 const hw=()=>hero.offsetWidth||120;
 let hp={x:-200,y:H*.72,r:0};
 const place=()=>{hero.style.transform=`translate(${hp.x-hw()/2}px,${hp.y-hw()*.6}px) rotate(${hp.r}deg)`};
 const ease=t=>t<.5?2*t*t:1-Math.pow(-2*t+2,2)/2;
 const anim=(dur,fn,done)=>{const s=performance.now();const f=()=>{if(!alive)return;const k=Math.min(1,(performance.now()-s)/dur);fn(k);if(k<1)requestAnimationFrame(f);else if(done)done()};f()};
 const spark=(x,y,n,col)=>{for(let i=0;i<n;i++){const a=Math.random()*6.283,v=2+Math.random()*7;parts.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-1,l:1,d:.018+Math.random()*.02,c:col||(Math.random()<.5?'#4edfc8':'#ffe6a0'),s:2+Math.random()*3})}};
 const nameBox=()=>wrap.getBoundingClientRect();
 const loop=()=>{if(!alive)return;cx.clearRect(0,0,W,H);
  for(const p of parts){p.x+=p.vx;p.y+=p.vy;p.vy+=.18;p.vx*=.985;p.l-=p.d;if(p.l>0){cx.globalAlpha=Math.max(0,p.l);cx.fillStyle=p.c;cx.fillRect(p.x,p.y,p.s,p.s)}}
  for(let i=parts.length-1;i>=0;i--)if(parts[i].l<=0)parts.splice(i,1);
  cx.globalAlpha=1;raf=requestAnimationFrame(loop)};loop();
 hp={x:-hw(),y:H*.78,r:-25};place();
 const startX=Math.max(hw()*.7,W*.14),startY=H*.72;
 at(250,()=>panel.classList.add('in'));
 at(300,()=>{S.swing();anim(650,k=>{const e=ease(k);hp.x=-hw()+(startX+hw())*e;hp.y=startY-Math.sin(k*Math.PI)*H*.12;hp.r=-25+25*e-Math.sin(k*Math.PI)*10;place()},()=>{S.land();spark(hp.x,hp.y+hw()*.55,10,'#ffe6a0')})});
 at(1350,()=>{S.swing();const b=nameBox(),x1=b.left-hw()*.2,y1=b.bottom+hw()*.1,x2=b.right+hw()*.2,y2=b.top-hw()*.1,sx=hp.x,sy=hp.y;
  anim(260,k=>{hp.x=sx+(x1-sx)*ease(k);hp.y=sy+(y1-sy)*ease(k);hp.r=-18*k;place()},()=>{
   S.slash();
   anim(300,k=>{const e=k*k;hp.x=x1+(x2-x1)*e;hp.y=y1+(y2-y1)*e;hp.r=-18+55*k;place();spark(hp.x,hp.y+hw()*.5,1,'#fff')});
   at(110,()=>{wrap.classList.add('cut');panel.classList.add('flash','shake','hit');S.boom();const bb=nameBox();for(let i=0;i<46;i++)spark(bb.left+Math.random()*bb.width,bb.top+bb.height*(.7-.4*Math.random()),1,'#fff');spark(bb.left+bb.width/2,bb.top+bb.height/2,40);
    });
   at(700,()=>{S.ting();panel.classList.add('done');
    anim(420,k=>{const e=ease(k);hp.x=x2+(W*.86-x2)*e;hp.y=y2+(H*.78-y2)*e;hp.r=37-37*e;place()})});
  })});
 return new Promise(resolve=>{
  const finish=()=>{alive=false;cancelAnimationFrame(raf);T.forEach(clearTimeout);events.forEach(n=>window.removeEventListener(n,block,true));panel.remove();resolve()};
  setTimeout(()=>panel.classList.add('creator-exit'),3900);setTimeout(finish,4450)});
}
