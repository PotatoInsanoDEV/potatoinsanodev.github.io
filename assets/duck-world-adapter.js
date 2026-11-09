// Visual-only bridge: collision geometry and all engine state stay untouched.
import {drawBackdrop,drawPlatform,drawProp} from './tide-world.js';
export function duckRegion(level){const sky=level?.sky;return sky==='frost'?1:sky==='ember'?2:sky==='peak'?3:sky==='fort'||sky==='castle'?4:0}
export function duckBackdrop(ctx,level,view,camX,time=0,reduced=false){drawBackdrop(ctx,view.w,view.h,{x:camX},duckRegion(level),time,reduced)}
const special=new Set(['deck','crate','wood','cloud','puff','void']);
const propTypes={andon:'lamp',lantern:'lamp',torch:'lamp',torii:'banner',shrine:'bell',tower:'mast',hall:'mast',trestle:'post',bridge:'mast',bamboo:'bamboo',reeds:'reeds',sakura:'bamboo',pine:'bamboo',bush:'reeds',barrel:'barrel',chest:'crate',paper:'banner',flag:'banner',wood:'crate',stones:'post',throne:'bell'};
function rectVisible(p,b,margin=0){return p.x+p.w>b.x-margin&&p.x<b.x+b.w+margin&&p.y+p.h>b.y-margin&&p.y<b.y+b.h+margin}
function crate(ctx,p,offset=0){ctx.save();ctx.translate(p.x+offset,p.y);const w=p.w,h=p.h;ctx.fillStyle='#59493f';ctx.fillRect(0,0,w,h);ctx.strokeStyle='#bd9665';ctx.lineWidth=Math.min(5,w/10,h/10);ctx.strokeRect(2,2,Math.max(0,w-4),Math.max(0,h-4));ctx.beginPath();ctx.moveTo(4,4);ctx.lineTo(w-4,h-4);ctx.moveTo(w-4,4);ctx.lineTo(4,h-4);ctx.stroke();ctx.fillStyle='#e7c589';for(const x of [5,w-5])for(const y of [5,h-5])ctx.fillRect(x-1,y-1,2,2);ctx.restore()}
export function duckTerrain(level){const region=duckRegion(level);let clock=0;return {
 setScale(){},
 drawDeck(ctx,p,offset=0){drawPlatform(ctx,{x:p.x,y:p.y+offset,w:p.w,h:p.h,type:'dock'},region,clock)},
 drawCrate:crate,
 draw(ctx,cameraX,cameraY,view){
 const zoom=view.zoom||1,w=view.w/zoom,h=view.h/zoom,b={x:cameraX-w/2,y:cameraY-h/2,w,h};clock=typeof performance!=='undefined'?performance.now()/1000:0;
 ctx.save();ctx.beginPath();ctx.rect(0,0,view.w,view.h);ctx.clip();ctx.translate(view.w/2,view.h/2);ctx.scale(zoom,zoom);ctx.translate(-cameraX,-cameraY);
 for(const d of level.decor||[]){if(Math.abs(d.x-cameraX)>w/2+180||Math.abs(d.y-cameraY)>h/2+240)continue;drawProp(ctx,{x:d.x,y:d.y,scale:Math.min(2,d.s??1),type:propTypes[d.t]||'crate'},clock)}
 for(const p of level.solids||[]){if(special.has(p.mat)||!rectVisible(p,b,16))continue;
 ctx.save();ctx.beginPath();ctx.rect(p.x,p.y,p.w,p.h);ctx.clip();
 // Draw only the visible intersection for deep walls; the real top is never moved.
 const left=Math.max(p.x,b.x-16),right=Math.min(p.x+p.w,b.x+b.w+16),bottom=Math.min(p.y+p.h,b.y+b.h+16),top=Math.max(p.y,b.y-16);
 if(p.y>=b.y-48){drawPlatform(ctx,{x:left,y:p.y,w:right-left,h:Math.max(8,Math.min(76,bottom-p.y)),type:p.mat==='ice'?'roof':undefined},region,clock)}
 const fillTop=p.y>=b.y-48?Math.max(top,p.y+56):top;if(bottom>fillTop){ctx.fillStyle=['#273b43','#29374c','#563d3b','#413c53','#45313e'][region];ctx.fillRect(left,fillTop,right-left,bottom-fillTop);ctx.strokeStyle='#152a35';ctx.lineWidth=2;
 for(let y=Math.ceil(fillTop/48)*48;y<bottom;y+=48){ctx.beginPath();ctx.moveTo(left,y);ctx.lineTo(right,y);ctx.stroke();for(let x=Math.ceil((left-(y/48%2)*48)/96)*96+(y/48%2)*48;x<right;x+=96){ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x,Math.min(bottom,y+48));ctx.stroke()}}
 }
 ctx.restore();
 // Exact edges make the unchanged collision bounds legible.
 ctx.strokeStyle=region===2?'#b17c58':'#628b8e';ctx.lineWidth=1.5;ctx.beginPath();if(p.x>=b.x){ctx.moveTo(p.x,top);ctx.lineTo(p.x,bottom)}if(p.x+p.w<=b.x+b.w){ctx.moveTo(p.x+p.w,top);ctx.lineTo(p.x+p.w,bottom)}ctx.stroke();
 }
 ctx.restore();
 }
}}

