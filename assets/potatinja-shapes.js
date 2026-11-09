/* Potatinja — formatos de arma (machado, foice, naginata). Cosmético: não muda alcance nem dano.
   Coordenadas: origem na guarda, +x até a ponta (comprimento p), m = unidade de espessura. */
(function(){
 var TAU=Math.PI*2;
 function pole(c,x0,x1,m,glow,line,t){
  var g=c.createLinearGradient(0,-m*.7,0,m*.7);g.addColorStop(0,'#7a5434');g.addColorStop(.5,'#4a2f1c');g.addColorStop(1,'#26160c');
  c.beginPath();c.roundRect(x0,-m*.68,x1-x0,m*1.36,m*.55);c.fillStyle=g;c.fill();c.lineWidth=m*.3;c.strokeStyle=line;c.stroke();
  c.save();c.globalAlpha=.55+.3*Math.sin(t*3);c.strokeStyle=glow;c.lineWidth=m*.2;c.lineCap='round';c.beginPath();c.moveTo(x0+m*.8,0);c.lineTo(x1-m*.8,0);c.stroke();c.restore();
  c.fillStyle='#e6b92e';
  for(var i=0;i<3;i++){var bx=x0+(x1-x0)*(.2+i*.28);c.beginPath();c.roundRect(bx-m*.35,-m*.9,m*.7,m*1.8,m*.25);c.fill();c.lineWidth=m*.2;c.strokeStyle=line;c.stroke()}
 }
 function gem(c,x,y,r,glow){
  c.save();c.shadowColor=glow;c.shadowBlur=r*3;c.beginPath();c.arc(x,y,r,0,TAU);c.fillStyle=glow;c.fill();c.shadowBlur=0;
  c.beginPath();c.arc(x,y,r,0,TAU);c.lineWidth=r*.35;c.strokeStyle='#1a0f2e';c.stroke();
  c.fillStyle='#ffffff';c.globalAlpha=.8;c.beginPath();c.arc(x-r*.3,y-r*.3,r*.32,0,TAU);c.fill();c.restore()
 }
 function lit(h,k){if(!/^#[0-9a-f]{6}$/i.test(h))return h;var n=parseInt(h.slice(1),16),r=n>>16,g=n>>8&255,b=n&255;r=Math.round(r+(255-r)*k);g=Math.round(g+(255-g)*k);b=Math.round(b+(255-b)*k);return '#'+((1<<24)+(r<<16)+(g<<8)+b).toString(16).slice(1)}
 function metalFill(c,cols,x0,y0,x1,y1,glow,shadow){
  var g=c.createLinearGradient(x0,y0,x1,y1);g.addColorStop(0,cols[0]||'#ffffff');g.addColorStop(.5,cols[1]||'#cfd8ea');g.addColorStop(1,lit(cols[2]||'#7a88a8',.35));
  c.shadowColor=glow;c.shadowBlur=shadow;c.fillStyle=g;c.fill();c.shadowBlur=0
 }
 function edgeLine(c,edge,m,fn){c.save();c.strokeStyle=edge;c.globalAlpha=.9;c.lineWidth=m*.3;c.lineCap='round';c.beginPath();fn();c.stroke();c.restore()}

 var S={
  axe:function(c,p,m,o){
   pole(c,0,p*.97,m,o.glow,o.line,o.t);
   c.beginPath();
   c.moveTo(p*.62,-m*.7);
   c.bezierCurveTo(p*.52,-m*2.4,p*.58,-m*5.0,p*.80,-m*6.0);
   c.bezierCurveTo(p*1.00,-m*4.6,p*1.06,-m*2.0,p*.99,-m*.25);
   c.lineTo(p*.99,m*.25);
   c.bezierCurveTo(p*1.06,m*2.0,p*1.00,m*4.6,p*.80,m*6.0);
   c.bezierCurveTo(p*.58,m*5.0,p*.52,m*2.4,p*.62,m*.7);
   c.closePath();
   metalFill(c,o.cols,p*.55,-m*6,p*1.02,m*5,o.glow,m*2*o.v);
   c.lineJoin='round';c.lineWidth=m*.34;c.strokeStyle=o.line;c.stroke();
   edgeLine(c,o.edge,m,function(){c.moveTo(p*.80,-m*5.5);c.bezierCurveTo(p*.98,-m*4.2,p*1.03,-m*2,p*.97,-m*.3);c.moveTo(p*.80,m*5.5);c.bezierCurveTo(p*.98,m*4.2,p*1.03,m*2,p*.97,m*.3)});
   gem(c,p*.78,0,m*1.15,o.glow);
  },
  scythe:function(c,p,m,o){
   pole(c,0,p*.9,m,o.glow,o.line,o.t);
   c.beginPath();
   c.moveTo(p*.90,-m*.7);
   c.bezierCurveTo(p*1.10,-m*2.2,p*1.04,-m*6.4,p*.46,-m*8.2);
   c.bezierCurveTo(p*.76,-m*5.0,p*.74,-m*2.8,p*.70,-m*.7);
   c.closePath();
   metalFill(c,o.cols,p*.5,-m*8,p*1.02,0,o.glow,m*2*o.v);
   c.lineJoin='round';c.lineWidth=m*.34;c.strokeStyle=o.line;c.stroke();
   edgeLine(c,o.edge,m,function(){c.moveTo(p*.52,-m*7.7);c.bezierCurveTo(p*.77,-m*5.5,p*.75,-m*3.2,p*.73,-m*.9)});
   c.beginPath();c.roundRect(p*.70,-m*1.3,p*.07,m*2.6,m*.5);c.fillStyle='#e6b92e';c.fill();c.lineWidth=m*.22;c.strokeStyle=o.line;c.stroke();
   gem(c,p*.84,-m*1.7,m*.95,o.glow);
   c.beginPath();c.moveTo(p*.88,-m*.7);c.lineTo(p*1.01,0);c.lineTo(p*.88,m*.7);c.closePath();metalFill(c,o.cols,p*.88,-m,p*1.01,m,o.glow,0);c.lineWidth=m*.26;c.strokeStyle=o.line;c.stroke();
  },
  dagger:function(c,p,m,o){
   var L=p*.7;
   c.beginPath();c.moveTo(0,-m*1.6);c.quadraticCurveTo(L*.55,-m*2.3,L,-m*.15);c.quadraticCurveTo(L*.6,m*2.0,0,m*1.6);c.closePath();
   metalFill(c,o.cols,0,-m*2,L,m*2,o.glow,m*2.2*o.v);c.lineJoin='round';c.lineWidth=m*.34;c.strokeStyle=o.line;c.stroke();
   c.fillStyle=o.line;for(var i=0;i<4;i++){var x=L*(.2+i*.17);c.beginPath();c.moveTo(x,m*1.45-i*m*.18);c.lineTo(x+L*.07,m*1.0-i*m*.14);c.lineTo(x+L*.12,m*1.35-i*m*.2);c.closePath();c.fill()}
   c.save();c.strokeStyle=o.glow;c.globalAlpha=.8;c.lineWidth=m*.28;c.lineCap='round';c.beginPath();c.moveTo(L*.12,0);c.quadraticCurveTo(L*.5,-m*.4,L*.92,-m*.15);c.stroke();c.restore();
   edgeLine(c,o.edge,m,function(){c.moveTo(L*.1,-m*1.55);c.quadraticCurveTo(L*.55,-m*2.2,L*.98,-m*.2)});
   gem(c,m*1.3,0,m*.8,o.glow);
  },
  naginata:function(c,p,m,o){
   pole(c,0,p*.6,m,o.glow,o.line,o.t);
   c.save();c.strokeStyle=o.cols[1]||o.glow;c.lineWidth=m*.5;c.lineCap='round';c.globalAlpha=.9;c.beginPath();c.moveTo(p*.58,m*.6);
   for(var i=1;i<=6;i++){var u=i/6;c.lineTo(p*.58-u*p*.2,m*.6+Math.sin(o.t*7+u*5)*m*(.6+u*1.2)+u*m*2.4)}c.stroke();c.restore();
   c.beginPath();
   c.moveTo(p*.56,-m*1.1);
   c.bezierCurveTo(p*.72,-m*2.0,p*.88,-m*3.4,p*1.0,-m*5.2);
   c.bezierCurveTo(p*1.0,-m*2.0,p*.94,-m*.4,p*.86,m*.7);
   c.bezierCurveTo(p*.76,m*1.9,p*.64,m*1.6,p*.56,m*1.1);
   c.closePath();
   metalFill(c,o.cols,p*.56,-m*3,p*1.0,m*2,o.glow,m*2.4*o.v);
   c.lineJoin='round';c.lineWidth=m*.34;c.strokeStyle=o.line;c.stroke();
   edgeLine(c,o.edge,m,function(){c.moveTo(p*.6,-m*1.1);c.bezierCurveTo(p*.74,-m*2.0,p*.88,-m*3.3,p*.99,-m*5)});
   c.save();c.strokeStyle=o.line;c.globalAlpha=.55;c.lineWidth=m*.22;c.beginPath();c.moveTo(p*.62,0);c.quadraticCurveTo(p*.82,-m*.5,p*.95,-m*2.8);c.stroke();c.restore();
   c.beginPath();c.roundRect(p*.52,-m*1.6,p*.06,m*3.2,m*.5);c.fillStyle='#e6b92e';c.fill();c.lineWidth=m*.22;c.strokeStyle=o.line;c.stroke();
  }
 };
 window.pnShapeDraw=function(c,shape,p,m,o){var f=S[shape];if(!f)return false;c.save();c.lineJoin='round';c.lineCap='round';f(c,p,m,o);c.restore();return true};
 window.pnShapeFx=function(shape,p,m){
  if(shape==='axe')return[p*.55,p*.45,-m*2,-m*.5];
  if(shape==='scythe')return[p*.5,p*.45,-m*4,-m*6];
  if(shape==='dagger')return[p*.1,p*.6,-m*.3,-m*.6];
  if(shape==='naginata')return[p*.58,p*.42,-m*1.4,-m*4];
  return null};
})();
