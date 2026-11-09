import {setDuckWeaponArt} from './duck-renderer.js';

// Use the shop's actual artwork factory, with its complete particle simulation.
// Render offscreen because that factory clears its own canvas each frame.
export function bindDuckWeaponArt(factory){
 const cache=new Map();
 setDuckWeaponArt((ctx,weapon,x,y,angle,motion)=>{
  let entry=cache.get(weapon.id);
  if(!entry){const canvas=document.createElement('canvas');canvas.width=canvas.height=512;entry={canvas,ctx:canvas.getContext('2d'),paint:factory(weapon,0),last:null};cache.set(weapon.id,entry)}
  const now=performance.now()/1000,dt=motion&&entry.last!==null?Math.min(.05,Math.max(0,now-entry.last)):0;
  entry.last=now;const time=motion?now:0;
  entry.paint(entry.ctx,512,512,time,dt);
  const length=512*.72,gripX=256-length*.24,gripY=512*.54+Math.sin(time*2)*512*.012;
  // Anchor the guard at the original hand joint; only presentation changes.
  const ratio=44/(length*.74);
  ctx.save();ctx.translate(x,y);ctx.rotate(angle);ctx.scale(ratio,ratio);ctx.drawImage(entry.canvas,-gripX,-gripY);ctx.restore();
 });
}
