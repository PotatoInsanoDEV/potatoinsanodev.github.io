// Potatinja — qualidade adaptativa: se o aparelho não segura a taxa de quadros, reduz a resolução do desenho (só visual).
const KEY='potatinja.q',MIN=.6;
let frames=0,sum=0,last=0,cool=0;
function setK(k){globalThis.__pnDprK=k;try{localStorage.setItem(KEY,String(k))}catch{}try{globalThis.__pnRefit&&globalThis.__pnRefit()}catch{}}
function playing(){const h=document.querySelector('#ui .hud');return !!(h&&!h.hidden&&!document.hidden&&!document.querySelector('#ui .pause:not([hidden]), .pn-shop:not([hidden]), #ui .sheet:not([hidden])'))}
function f(t){
 if(last&&playing()){const d=t-last;
  if(d<250){frames++;sum+=d;
   if(frames>=100){const avg=sum/frames;frames=0;sum=0;
    if(t>cool&&avg>25&&(globalThis.__pnDprK||1)>MIN+.01){setK(Math.max(MIN,(globalThis.__pnDprK||1)-.15));cool=t+4000}}}}
 else if(!playing()){frames=0;sum=0}
 last=t;requestAnimationFrame(f)}
requestAnimationFrame(f);
