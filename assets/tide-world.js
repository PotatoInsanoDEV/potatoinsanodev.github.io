// Original canvas scenery for Pato Ninja. No bitmap dependencies.
const TAU=Math.PI*2;
const palettes=[
 ['#0b3448','#216676','#68b7b5','#144b5b','#113a4c','#e9ac58'],
 ['#10182e','#343a67','#7483a4','#242b50','#172039','#f2bc69'],
 ['#301f31','#7b4140','#cf8564','#573639','#342731','#ffcc72'],
 ['#1c193b','#4a3d73','#9690bd','#34315a','#252443','#c6f2c8'],
 ['#29182c','#663547','#c06c6f','#422d40','#2d2035','#ffad60']
];
const mod=(n,m)=>((n%m)+m)%m;
function poly(c,pts,color){c.beginPath();pts.forEach((p,i)=>i?c.lineTo(...p):c.moveTo(...p));c.closePath();c.fillStyle=color;c.fill()}
function ellipse(c,x,y,rx,ry,color){c.beginPath();c.ellipse(x,y,rx,ry,0,0,TAU);c.fillStyle=color;c.fill()}
function line(c,x,y,x2,y2,color,width=1){c.beginPath();c.moveTo(x,y);c.lineTo(x2,y2);c.strokeStyle=color;c.lineWidth=width;c.stroke()}
function duckMark(c,x,y,s,col){c.save();c.translate(x,y);c.scale(s,s);ellipse(c,0,1,10,7,col);ellipse(c,5,-7,6,6,col);poly(c,[[9,-8],[18,-5],[9,-3]],col);poly(c,[[-7,0],[-15,-5],[-12,5]],col);c.restore()}
export function drawBackdrop(c,w,h,camera={},region=0,time=0,reduced=false){
 const r=mod(region,5),p=palettes[r],t=reduced?0:time,ox=camera.x||0;
 c.save();const sky=c.createLinearGradient(0,0,0,h);sky.addColorStop(0,p[0]);sky.addColorStop(.7,p[1]);sky.addColorStop(1,p[2]);c.fillStyle=sky;c.fillRect(0,0,w,h);
 const moonX=w*.77-ox*.015;ellipse(c,moonX,h*.21,38,38,r===0?'#f6e4ad':'#e7dbc5');c.globalAlpha=.07;ellipse(c,moonX,h*.21,70,70,'#fff5c9');c.globalAlpha=1;
 // Long low clouds keep the playfield uncluttered.
 for(let i=0;i<8;i++){let x=mod(i*269-ox*.035+t*(r===4?13:3),w+430)-215;let y=h*(.11+(i%3)*.095);c.globalAlpha=.12;ellipse(c,x,y,100+i%3*34,12+i%2*7,p[2]);ellipse(c,x+57,y-9,57,16,p[2]);}c.globalAlpha=1;
 for(let layer=0;layer<3;layer++){
  let step=layer===0?192:260,base=h*(.63+layer*.105),par=.08+layer*.09;
  c.fillStyle=layer===0?p[1]:layer===1?p[3]:p[4];
  for(let i=-1;i<Math.ceil(w/step)+2;i++){
   let idx=Math.floor(ox*par/step)+i,x=i*step-mod(ox*par,step),bh=65+mod(idx*53+layer*37,100),bw=step*.7;
   c.fillRect(x,base-bh,bw,bh+30);
   if(r===2){c.fillRect(x+bw*.18,base-bh-53,14,54);poly(c,[[x-10,base-bh],[x+bw/2,base-bh-30],[x+bw+10,base-bh]],layer?p[4]:p[1]);if(!reduced){c.globalAlpha=.12;for(let k=0;k<3;k++)ellipse(c,x+bw*.22+Math.sin(t*.3+k)*14,base-bh-60-k*22-mod(t*9,22),18+k*7,9+k*3,p[2]);c.globalAlpha=1}}
   else if(r===3){poly(c,[[x-18,base-bh],[x+bw*.45,base-bh-45],[x+bw+18,base-bh]],layer?p[4]:p[1]);line(c,x+bw*.5,base-bh-38,x+bw*.5+8,base-bh-83,p[4],3)}
   else {poly(c,[[x-16,base-bh],[x+bw*.3,base-bh-27],[x+bw*.77,base-bh-27],[x+bw+17,base-bh]],layer?p[4]:p[1]);if(r===4){c.fillRect(x+10,base-bh-36,16,37);c.fillRect(x+bw-26,base-bh-36,16,37)}}
   c.globalAlpha=.32;for(let j=0;j<4;j++)c.fillStyle=p[5],c.fillRect(x+18+j*29,base-bh+18,6,12);c.globalAlpha=1;c.fillStyle=layer===0?p[1]:layer===1?p[3]:p[4];
  }
 }
 let water=h*.83;const sea=c.createLinearGradient(0,water,0,h);sea.addColorStop(0,p[3]);sea.addColorStop(1,p[0]);c.fillStyle=sea;c.fillRect(0,water,w,h-water);
 for(let i=0;i<38;i++){let x=mod(i*113-ox*.13+Math.sin(t*.6+i)*12,w+110)-55,y=water+10+mod(i*31,h-water);c.globalAlpha=.1+(i%4)*.035;line(c,x,y,x+15+i%5*12,y,p[2],1.5)}c.globalAlpha=1;
 // Foreground rigging forms a harbor skyline well below action.
 for(let i=0;i<5;i++){let x=mod(i*370-ox*.3,w+380)-190;line(c,x,h*.75,x,h, p[0],7);line(c,x-70,h*.86,x+70,h*.86,p[0],4);c.beginPath();c.moveTo(x-70,h*.86);c.quadraticCurveTo(x,h*.91,x+70,h*.86);c.strokeStyle=p[0];c.lineWidth=2;c.stroke()}
 if(r===1&&!reduced){c.globalAlpha=.13;for(let i=0;i<25;i++){let x=mod(i*101+t*60,w+30),y=mod(i*73+t*240,h);line(c,x,y,x-5,y+15,'#c3d2f2',1)}c.globalAlpha=1}
 if(r===3){for(let i=0;i<15;i++){c.globalAlpha=.25+.2*Math.sin(t*1.8+i);ellipse(c,mod(i*137-ox*.12,w),h*.65+Math.sin(t*.4+i)*45,1.4,1.4,'#b6ffc8')}}
 c.restore();
}
export function drawPlatform(c,p,region=0,time=0){
 const r=mod(region,5),x=p.x,y=p.y,w=p.w,h=p.h||24;c.save();
 // The lit top line is the collision edge, kept exact.
 if(p.type==='ship'){
 poly(c,[[x,y],[x+w,y],[x+w-14,y+h+16],[x+w-38,y+h+31],[x+32,y+h+31],[x+10,y+h+13]],'#37464c');
 poly(c,[[x+6,y+12],[x+w-7,y+12],[x+w-24,y+h+11],[x+w-40,y+h+22],[x+34,y+h+22],[x+17,y+h+7]],'#775346');
 line(c,x+16,y+22,x+w-23,y+22,'#b0875b',3);line(c,x+30,y+h+18,x+w-36,y+h+18,'#303d45',3);
 c.fillStyle='#c19966';c.fillRect(x,y,w,4);c.fillStyle='#916f50';c.fillRect(x,y+4,w,5);
 for(let a=13;a<w-15;a+=41){ellipse(c,x+a,y+16,3,3,'#d6b777');line(c,x+a,y+1,x+a,y+8,'#57463e',1)}
 }else if(p.type==='roof'){
 const roof=r===2?'#876651':r===4?'#784654':'#486773';
 c.fillStyle='#253744';c.fillRect(x,y,w,h);c.fillStyle=roof;c.fillRect(x,y,w,5);
 for(let a=0;a<w;a+=23){poly(c,[[x+a,y+5],[x+Math.min(w,a+22),y+5],[x+Math.min(w,a+25),y+17],[x+a,y+17]],roof);line(c,x+a+3,y+6,x+Math.min(w,a+21),y+6,'#a6b8b2',1)}
 line(c,x,y+18,x+w,y+18,'#172b38',4);
 }else if(r===0||p.type==='dock'){
 c.fillStyle='#273b43';c.fillRect(x,y,w,h);c.fillStyle='#8e6553';c.fillRect(x,y,w,9);c.fillStyle='#c08f65';c.fillRect(x,y,w,3);
 for(let a=7;a<w;a+=28){line(c,x+a,y+2,x+a,y+h,'#423e3e',2);ellipse(c,x+a+5,y+6,1.1,1.1,'#efd199')}
 line(c,x+5,y+h-4,x+w-5,y+h-4,'#102b38',4);
 for(let a=18;a<w;a+=95){c.fillStyle='#334047';c.fillRect(x+a,y+h,9,20);line(c,x+a-2,y+h+5,x+a+11,y+h+2,'#a28868',3)}
 }else if(r===1){
 c.fillStyle='#2c324f';c.fillRect(x,y,w,h);c.fillStyle='#647d91';c.fillRect(x,y,w,4);
 for(let a=0;a<w;a+=25){poly(c,[[x+a,y+4],[x+Math.min(w,a+24),y+4],[x+Math.min(w,a+29),y+16],[x+a-4,y+16]],a%50?'#394e68':'#465c75');line(c,x+a,y+5,x+a+19,y+5,'#849caf',1)}
 line(c,x,y+h,x+w,y+h,'#111c34',4);
 }else{
 const base=r===2?'#634a43':r===3?'#51475e':'#57414b',top=r===2?'#d19a67':r===3?'#a2a2a4':'#cf8f78';c.fillStyle=base;c.fillRect(x,y,w,h);c.fillStyle=top;c.fillRect(x,y,w,4);
 for(let row=0;row<Math.ceil(h/17);row++){line(c,x,y+row*17+5,x+w,y+row*17+5,'#282936',2);for(let a=(row%2)*26;a<w;a+=52)line(c,x+a,y+row*17+5,x+a,y+Math.min(h,(row+1)*17+5),'#302c37',2)}
 if(r===2){for(let a=13;a<w;a+=55){c.fillStyle='#303943';c.fillRect(x+a,y+6,24,9);ellipse(c,x+a+4,y+10,1,1,'#e2ac68');ellipse(c,x+a+20,y+10,1,1,'#e2ac68')}}
 if(r===3){for(let a=9;a<w;a+=42){poly(c,[[x+a,y+3],[x+a+12,y+3],[x+a+9,y+10],[x+a+4,y+8]],'#6d9982')}}
 }
 c.restore();
}
export function drawProp(c,p,time=0){c.save();c.translate(p.x,p.y);const t=time,s=p.scale||1;c.scale(s,s);c.lineJoin='round';
 switch(p.type){
 case 'lantern':
 case 'lamp':{line(c,0,0,0,-64,'#223746',5);line(c,0,-62,18,-62,'#b39060',3);const g=c.createRadialGradient(18,-44,0,18,-44,48);g.addColorStop(0,'#ffc56d55');g.addColorStop(1,'#ffc56d00');c.fillStyle=g;c.fillRect(-32,-94,100,100);poly(c,[[8,-61],[28,-61],[32,-53],[29,-32],[7,-32],[4,-53]],'#26384b');c.fillStyle='#ffd58b';c.fillRect(11,-53,14,17);line(c,18,-53,18,-36,'#a56f45',2);poly(c,[[1,-61],[18,-70],[35,-61]],'#476779');break}
 case 'post':c.fillStyle='#5f5148';c.fillRect(-7,-32,14,32);ellipse(c,0,-32,8,3,'#b6986e');for(let i=0;i<4;i++)line(c,-10,-22+i*4,10,-25+i*4,'#c2a37b',3);c.beginPath();c.moveTo(7,-20);c.bezierCurveTo(30,-18,16,-4,35,-5);c.strokeStyle='#a98d6b';c.lineWidth=3;c.stroke();break;
 case 'bamboo':for(let i=0;i<5;i++){let bx=(i-2)*9,bh=62+(i%3)*13,bend=Math.sin(t*1.3+i)*3;line(c,bx,0,bx+bend,-bh,'#4c847c',4);for(let j=15;j<bh;j+=19){line(c,bx-3,-j,bx+4,-j,'#8eb2a1',2);poly(c,[[bx,-j],[bx+(i%2?23:-22)+bend,-j-15],[bx+(i%2?10:-10),-j+1]],'#4c7e75')}}break;
 case 'furnace':{const g=c.createRadialGradient(0,-19,2,0,-19,56);g.addColorStop(0,'#ffad4b66');g.addColorStop(1,'#ff9b3000');c.fillStyle=g;c.fillRect(-60,-80,120,100);poly(c,[[-24,0],[-24,-40],[-14,-47],[14,-47],[24,-40],[24,0]],'#3b4149');c.fillStyle='#1c2833';c.fillRect(-16,-29,32,22);c.fillStyle='#fa8f3f';c.fillRect(-13,-25,26,15);for(let i=0;i<4;i++){let yy=-10-mod(t*19+i*13,48);ellipse(c,Math.sin(t*2+i)*10,yy,1.3,2,'#ffd380')}line(c,-24,-36,24,-36,'#b28057',3);line(c,-24,-4,24,-4,'#b28057',3);c.fillStyle='#59616b';c.fillRect(8,-70,10,24);break}
 case 'bell':line(c,-20,0,-20,-76,'#3b4d55',5);line(c,-20,-75,16,-75,'#aa8e65',4);line(c,8,-75,8,-63,'#dbc489',2);c.save();c.translate(8,-60);c.rotate(Math.sin(t*1.7)*.07);poly(c,[[-10,-1],[-8,-12],[8,-12],[10,-1],[15,6],[-15,6]],'#caa263');ellipse(c,0,6,15,3,'#efd298');ellipse(c,0,10,3,4,'#745b43');line(c,-4,15,-4,33,'#bba17c',2);c.restore();break;
 case 'mast':line(c,0,0,0,-137,'#4d5050',6);line(c,-38,-111,43,-111,'#aa956e',4);line(c,0,-135,-51,0,'#7a8d8c',1);line(c,0,-135,53,0,'#7a8d8c',1);{let billow=Math.sin(t*1.3+p.x)*5;c.beginPath();c.moveTo(-33,-108);c.lineTo(36,-108);c.quadraticCurveTo(43+billow,-75,28,-43);c.quadraticCurveTo(0,-51,-30,-43);c.quadraticCurveTo(-22+billow,-74,-33,-108);c.fillStyle='#b3b7a3';c.fill();line(c,2,-108,2,-49,'#7c9390',1);duckMark(c,3,-78,.82,'#3d777d')}break;
 case 'banner':line(c,0,0,0,-83,'#3b424d',4);line(c,-2,-81,37,-81,'#c4a36c',3);{let sway=Math.sin(t*2+p.x)*3;poly(c,[[5,-78],[34,-78],[35+sway,-25],[20+sway,-33],[7+sway,-25]],p.color||'#2b9fa9');duckMark(c,20+sway*.3,-58,.55,'#e8d9ac')}break;
 case 'reeds':for(let i=0;i<7;i++){const bend=Math.sin(t*1.5+i*.8)*3; c.beginPath();c.moveTo(i*4-12,0);c.quadraticCurveTo(i*6-18+bend,-18,i*5-15+bend,-39-i%3*8);c.strokeStyle=i%2?'#507e75':'#729183';c.lineWidth=2;c.stroke();if(i%2===0)ellipse(c,i*5-15+bend,-39-i%3*8,2,6,'#a49173')}break;
 case 'barrel':ellipse(c,0,-4,17,7,'#182d38');c.fillStyle='#906748';c.fillRect(-15,-32,30,29);ellipse(c,0,-32,15,6,'#b98f5e');ellipse(c,0,-4,15,6,'#806047');line(c,-16,-25,16,-25,'#334952',4);line(c,-16,-10,16,-10,'#334952',4);line(c,-5,-29,-5,-6,'#654f40',1);line(c,6,-29,6,-6,'#654f40',1);break;
 default:c.fillStyle='#765b46';c.fillRect(-18,-36,36,36);c.strokeStyle='#bc9260';c.lineWidth=4;c.strokeRect(-16,-34,32,32);line(c,-14,-31,14,-5,'#ba8a58',5);line(c,14,-31,-14,-5,'#ba8a58',5);duckMark(c,0,-18,.42,'#e1b77b');break;
 }c.restore()}
export function drawPortal(c,x,y,open,time=0){c.save();c.translate(x,y);const pulse=.5+.5*Math.sin(time*2);ellipse(c,0,2,43,10,'#10222a88');
 const glow=c.createRadialGradient(0,-43,4,0,-43,70);glow.addColorStop(0,open?'#7eead455':'#ae735522');glow.addColorStop(1,'#00000000');c.fillStyle=glow;c.fillRect(-75,-118,150,150);
 c.beginPath();c.arc(0,-44,34,0,TAU);c.fillStyle=open?'#164e58':'#26343e';c.fill();c.strokeStyle='#29363d';c.lineWidth=15;c.stroke();c.strokeStyle='#c9a067';c.lineWidth=8;c.stroke();c.strokeStyle='#f1d190';c.lineWidth=1.5;c.stroke();
 for(let i=0;i<10;i++){let a=i*TAU/10-Math.PI/2;ellipse(c,Math.cos(a)*34,-44+Math.sin(a)*34,2,2,'#493c3a')}
 if(open){c.save();c.globalAlpha=.4+pulse*.3;c.strokeStyle='#77e8d7';c.lineWidth=2;for(let i=0;i<3;i++){c.beginPath();c.ellipse(0,-44,10+i*6,25,Math.sin(time*.6+i)*.6,0,TAU);c.stroke()}c.restore();duckMark(c,0,-44,1,'#c3fff0')}else duckMark(c,0,-44,1,'#917f62');
 poly(c,[[-35,0],[-28,-17],[-21,-13],[-23,0]],'#7f6e57');poly(c,[[35,0],[28,-17],[21,-13],[23,0]],'#7f6e57');c.fillStyle='#c5a570';c.fillRect(-39,-3,78,6);c.restore()}
