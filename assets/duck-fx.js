// Bounded, frame-rate-independent duck effects, driven by simulation events.
const particles=[],rings=[],trail=[],slashes=[];let lastX=0,lastY=0,sample=0,seed=7391;
const random=()=>{seed=(Math.imul(seed,1664525)+1013904223)|0;return(seed>>>0)/4294967296};
function burst(x,y,count,color,force=150,feathers=false){for(let i=0;i<count;i++){if(particles.length>=130)particles.shift();const a=random()*Math.PI*2,v=force*(.35+random()*.65);particles.push({x,y,vx:Math.cos(a)*v,vy:Math.sin(a)*v-45,age:0,life:.25+random()*.4,size:feathers?3+random()*3:1.2+random()*2,color,feather:feathers,a:random()*6,spin:(random()-.5)*12})}}
export const duckFX={
 tint:'',ink:false,
 reset(){particles.length=rings.length=trail.length=slashes.length=0;sample=0},
 event(e){const tint=this.tint||'#65d9ed',red=this.ink?'#1b1230':'#c52842',dark=this.ink?'#0d0820':'#7e1932';
 if(e.t==='launch'){burst(e.x,e.y,10,this.tint||'#8cecf4',90);rings.push({x:e.x,y:e.y,age:0,life:.3,r:30,color:this.tint||'#82eaf5'});if(e.power>.5){burst(e.x,e.y,5,'#fff4ce',100,true);rings.push({x:e.x,y:e.y,age:0,life:.18,r:46,color:'#ffffff'})}}
 else if(e.t==='kill'){burst(e.ex,e.ey,18,red,260,false);burst(e.ex,e.ey,7,dark,180,false);burst(e.ex,e.ey,9,tint,240);burst(e.ex,e.ey,8,'#f4efe8',210,true);
  rings.push({x:e.ex,y:e.ey,age:0,life:.24,r:44,color:'#fff0ab'});rings.push({x:e.ex,y:e.ey,age:0,life:.34,r:70,color:tint});
  const a=Math.atan2(e.vy||0,e.vx||1);slashes.push({x:e.ex,y:e.ey,a,age:0,life:.2,len:70});slashes.push({x:e.ex,y:e.ey,a:a+Math.PI/2.6,age:0,life:.16,len:44})}
 else if(e.t==='land'&&e.speed>70){burst(e.x,e.y-2,Math.min(7,Math.floor(e.speed/140)+3),'#d9d4c5',Math.min(100,e.speed*.14));if(e.speed>160)rings.push({x:e.x,y:e.y,age:0,life:.2,r:20,color:'#d9d4c5',flat:true})}
 if(rings.length>14)rings.shift();if(slashes.length>6)slashes.shift()},
 frame(c,dt,body,project,active,reduced,quality){
 dt=Math.max(0,Math.min(.05,dt));if(!active){this.reset();return}const speed=Math.hypot(body.vx,body.vy),fast=body.alive&&speed>420&&(body.dash>0||body.empowered);const [x,y]=project(body.x,body.y),[unit]=project(body.x+1,body.y),scale=Math.abs(unit-x)||1;
 if(Math.hypot(body.x-lastX,body.y-lastY)>350)trail.length=0;lastX=body.x;lastY=body.y;
 for(let i=trail.length-1;i>=0;i--){trail[i].age+=dt;if(trail[i].age>.17)trail.splice(i,1)}sample+=dt;
 if(fast&&dt>0&&sample>=1/90){sample=0;trail.push({x:body.x,y:body.y,age:0});if(trail.length>14)trail.shift()}
 c.save();c.lineCap='round';c.lineJoin='round';
 if(!reduced&&quality!==2&&trail.length>1){for(let i=1;i<trail.length;i++){const a=trail[i-1],b=trail[i],[ax,ay]=project(a.x,a.y),[bx,by]=project(b.x,b.y);c.globalAlpha=(1-b.age/.17)*.28;c.strokeStyle=this.tint||'#43d9e9';c.lineWidth=(6+7*i/trail.length)*scale;c.beginPath();c.moveTo(ax,ay+4*scale);c.lineTo(bx,by+4*scale);c.stroke();c.globalAlpha=(1-b.age/.17)*.65;c.strokeStyle='#d8ffff';c.lineWidth=1.4*scale;c.beginPath();c.moveTo(ax,ay+6*scale);c.lineTo(bx,by+6*scale);c.stroke()}}
 for(let i=rings.length-1;i>=0;i--){const p=rings[i];p.age+=dt;if(p.age>=p.life){rings.splice(i,1);continue}if(reduced)continue;const t=p.age/p.life,[px,py]=project(p.x,p.y);c.globalAlpha=(1-t)**2*.7;c.strokeStyle=p.color;c.lineWidth=(2.5-1.5*t)*scale;c.beginPath();c.ellipse(px,py,p.r*(.25+.75*t)*scale,p.r*(.25+.75*t)*scale*(p.flat?.24:1),0,0,Math.PI*2);c.stroke()}
 for(let i=slashes.length-1;i>=0;i--){const p=slashes[i];p.age+=dt;if(p.age>=p.life){slashes.splice(i,1);continue}if(reduced)continue;const t=p.age/p.life,[px,py]=project(p.x,p.y),L=p.len*scale*(.5+.7*t),dx=Math.cos(p.a)*L,dy=Math.sin(p.a)*L;c.globalAlpha=(1-t)**1.5;c.strokeStyle='#ffffff';c.lineWidth=(4.2-3*t)*scale;c.beginPath();c.moveTo(px-dx,py-dy);c.lineTo(px+dx,py+dy);c.stroke();c.globalAlpha=(1-t)*.6;c.strokeStyle=this.tint||'#9ff3ff';c.lineWidth=(9-6*t)*scale;c.beginPath();c.moveTo(px-dx*.8,py-dy*.8);c.lineTo(px+dx*.8,py+dy*.8);c.stroke()}
 for(let i=particles.length-1;i>=0;i--){const p=particles[i];p.age+=dt;if(p.age>=p.life){particles.splice(i,1);continue}p.x+=p.vx*dt;p.y+=p.vy*dt;p.vx*=Math.exp(-3*dt);p.vy+=180*dt;p.a+=p.spin*dt;if(quality===2&&i%2||reduced&&i%3)continue;const [px,py]=project(p.x,p.y);c.save();c.translate(px,py);c.rotate(p.a);c.globalAlpha=Math.min(1,(1-p.age/p.life)*2)*.8;c.fillStyle=p.color;c.beginPath();c.ellipse(0,0,p.size*scale,p.size*(p.feather?.32:.7)*scale,0,0,Math.PI*2);c.fill();if(p.feather){c.strokeStyle='#8a9cad';c.lineWidth=.6*scale;c.beginPath();c.moveTo(-p.size*scale,0);c.lineTo(p.size*scale,0);c.stroke()}c.restore()}
 c.restore()
 }
};
