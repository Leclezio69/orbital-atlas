import {V,loadSpaceAssets,makeCamera,drawVehicle,createPlanet,backdrop} from './space-visuals.js';
const {add,sub,mul,dot,cross,norm}=V,TAU=Math.PI*2;
// Cinematic scene of the authored training timeline; not an orbital propagator.
export function createMissionScene(host,getFrame){
 const canvas=document.createElement('canvas'),ctx=canvas.getContext('2d');host.prepend(canvas);canvas.setAttribute('role','img');canvas.setAttribute('aria-label','Interactive 3D orbital flight: textured Earth, moving spacecraft, eclipse arc and state-linked operational overlays');canvas.setAttribute('aria-description','Drag or use arrow keys to orbit. Plus and minus zoom. Camera buttons switch between orbit, spacecraft and ground link.');canvas.tabIndex=0;
 let w=1,h=1,az=.65,el=.32,zoom=3.3,mode='orbit',drag=null,raf,disposed=false,last=0,lastKey='',assets={},planet=null,revision=0,earthKey='',earthAt=0,explode=0,targetExplode=0,labelBoxes=[];
 const inclination=.78,orbitalRadius=1.2;
 const position=(t,r=orbitalRadius,inc=inclination)=>{let a=t/96*TAU;return [Math.cos(a)*r,Math.sin(a)*Math.sin(inc)*r,Math.sin(a)*Math.cos(inc)*r]};
 const sun=mul(norm(position(47)),-1);
 loadSpaceAssets().then(a=>{if(disposed)return;assets=a;planet=createPlanet(a);revision++});
 function textLabel(x,y,title,detail,color='#d7c0a0'){
  ctx.font='600 11px monospace';let width=Math.max(ctx.measureText(title).width,detail.length*5.6)+22;let xx=Math.max(10,Math.min(w-width-10,x)),yy=Math.max(155,Math.min(h-62,y));let bh=detail?46:28;for(let attempt=0;attempt<8;attempt++){let hit=labelBoxes.find(b=>xx<b.x+b.w+7&&xx+width+7>b.x&&yy<b.y+b.h+7&&yy+bh+7>b.y);if(!hit)break;if(hit.y+hit.h+bh+9<h-57)yy=hit.y+hit.h+9;else{xx=Math.max(10,hit.x-width-10);yy=Math.max(155,Math.min(h-62,y))}}labelBoxes.push({x:xx,y:yy,w:width,h:bh});ctx.fillStyle='#08131ee8';ctx.strokeStyle=color+'55';ctx.lineWidth=.7;ctx.beginPath();ctx.roundRect(xx,yy,width,detail?46:28,4);ctx.fill();ctx.stroke();ctx.fillStyle=color;ctx.fillText(title,xx+10,yy+17);if(detail){ctx.fillStyle='#90a7b7';ctx.font='10px monospace';ctx.fillText(detail,xx+10,yy+34)}
 }
 function line(a,b,color,width=1,dash=[]){ctx.strokeStyle=color;ctx.lineWidth=width;ctx.setLineDash(dash);ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.stroke();ctx.setLineDash([])}
 function dotPoint(p,r,color){ctx.beginPath();ctx.arc(p[0],p[1],r,0,TAU);ctx.fillStyle=color;ctx.fill()}
 function render(now){if(disposed)return;raf=requestAnimationFrame(render);if(now-last<40||document.hidden)return;last=now;let f=getFrame(),t=f.time,shadow=t>=32&&t<62;if(Math.abs(explode-targetExplode)>.008)explode+=(targetExplode-explode)*.18;else explode=targetExplode;
 let key=[w,h,t,mode,az,el,zoom,explode,revision,f.playing,f.burn,f.safe,f.groundContact].join();if(key===lastKey)return;lastKey=key;
 labelBoxes=[];backdrop(ctx,w,h,az,shadow);let haze=ctx.createRadialGradient(w*.68,h*.5,0,w*.5,h*.5,w*.7);haze.addColorStop(0,'#25526c13');haze.addColorStop(1,'#01071100');ctx.fillStyle=haze;ctx.fillRect(0,0,w,h);
 if(mode==='chase'){drawChase(now,f);return}
 const cam=makeCamera(az,el,zoom,w,h,1.22),{eye,project}=cam;
 function visible(p){let q=sub(p,eye),length=Math.hypot(...q),d=mul(q,1/length),b=dot(eye,d),disc=b*b-dot(eye,eye)+1;return disc<0||-b-Math.sqrt(disc)>length-.002}
 // Draw front/back segments separately to preserve globe occlusion.
 function track(front,object=false){for(let j=0;j<256;j++){let t0=j/256*96,t1=(j+1)/256*96,a=position(t0,object?1.25:orbitalRadius,object?1.05:inclination),b=position(t1,object?1.25:orbitalRadius,object?1.05:inclination);if(visible(a)!==front||visible(b)!==front)continue;let sh=t0>=32&&t0<62;line(project(a),project(b),object?(front?'#e499955a':'#e4999515'):sh?(front?'#7398dba8':'#7398db22'):(front?'#dfb87f9c':'#dfb87f23'),object?.75:front?1.4:.65,object?[3,4]:[])}}
 const encounter=t>=50&&t<70;track(false);if(encounter)track(false,true);
 if(planet){let quality=drag?320: f.playing?480:760,ek=[az.toFixed(2),el.toFixed(2),Math.floor(t/3),quality].join();if(ek!==earthKey&&(now-earthAt>(drag?100:700)||!f.playing)){planet.paint({az,el,rotation:.4+t/1440*TAU,sun,quality});earthAt=now;earthKey=ek}let r=cam.focal/Math.sqrt(zoom*zoom-1);planet.draw(ctx,w*.5,h*.5,r*1.008)}
 track(true);if(encounter)track(true,true);
 // Illuminated history trail, and quiet markers at the six decision boundaries.
 for(let j=1;j<36;j++){let a=position(t-j*.19),b=position(t-(j-1)*.19);if(visible(a)&&visible(b))line(project(a),project(b),`rgba(250,201,132,${.8*(1-j/36)})`,3)}
 for(let mark of [0,14,32,50,70,84]){let p=position(mark);if(!visible(p))continue;let q=project(p);dotPoint(q,2.4,mark<=t?'#e5bb81':'#4d6273');if(w>600&&mark!==0){ctx.fillStyle='#8aa0ad';ctx.font='8px monospace';ctx.fillText('T+'+mark,q[0]+8,q[1]+3)}}
 let p=position(t),q=project(p),vis=visible(p),down=mul(norm(p),-1),forward=norm(sub(position(t+.02),p)),right=norm(cross(forward,down)),scale=.087;
 let world=v=>add(p,add(add(mul(right,v[0]*scale),mul(forward,v[1]*scale)),mul(down,v[2]*scale)));
 if(vis){
  let ground=mul(norm(p),1.006),gp=project(ground);
  if((mode==='link'||t>=32&&t<50)&&f.groundContact&&visible(ground)){line(q,gp,'#75d4c199',1,[5,5]);dotPoint(gp,3,'#8ae3cb');ctx.strokeStyle='#75d4c155';ctx.beginPath();ctx.ellipse(gp[0],gp[1],16,7,-.3,0,TAU);ctx.stroke();textLabel(gp[0]+14,gp[1]+12,'GROUND PATH ACQUIRED','Authored contact state','#8bd2c1')}
  if(mode!=='link'&&t>=14&&t<32&&f.dataValue>0&&!f.safe&&visible(ground)){ctx.fillStyle='#60d4df15';ctx.strokeStyle='#7bd2df55';ctx.lineWidth=.7;ctx.beginPath();ctx.moveTo(q[0],q[1]);ctx.lineTo(gp[0]-22,gp[1]-8);ctx.lineTo(gp[0]+28,gp[1]+12);ctx.closePath();ctx.fill();ctx.stroke();ctx.beginPath();ctx.ellipse(gp[0],gp[1],26,10,.45,0,TAU);ctx.stroke();textLabel(gp[0]+20,gp[1]+10,'COLLECTION FOOTPRINT','70% cloud in the case','#8acdd5')}
  drawVehicle(ctx,cam,{atlas:assets.atlas,transform:world,shadow});
  if(f.burn){let e=project(world([0,-1.3,.7]));let g=ctx.createRadialGradient(e[0],e[1],1,e[0],e[1],18);g.addColorStop(0,'#ecfaff');g.addColorStop(.25,'#72cfffaa');g.addColorStop(1,'#3667ff00');ctx.fillStyle=g;ctx.fillRect(e[0]-18,e[1]-18,36,36)}
  line([q[0]+8,q[1]-8],[q[0]+31,q[1]-34],'#dfbd8777',.7);textLabel(q[0]+30,q[1]-63,'ATLAS–01',shadow?'ECLIPSE / BATTERY POWER':'SUNLIT / SOLAR INPUT');
 }else{dotPoint(q,4,'#dfb87f');ctx.strokeStyle='#dfb87f88';ctx.setLineDash([2,4]);ctx.beginPath();ctx.arc(q[0],q[1],12,0,TAU);ctx.stroke();ctx.setLineDash([]);textLabel(q[0]+20,q[1]-35,'ATLAS–01 / FAR SIDE','Position shown through Earth')}
 if(encounter){let p2=position(t+.9,1.25,1.05),q2=project(p2);if(visible(p2)){dotPoint(q2,3,'#edb3a7');ctx.strokeStyle='#e9a79a66';ctx.setLineDash([3,4]);ctx.beginPath();ctx.ellipse(q2[0],q2[1],21,13,-.7,0,TAU);ctx.stroke();ctx.setLineDash([]);textLabel(q2[0]-165,q2[1]+20,'OBJECT B / SCHEMATIC',f.evidence.includes('E5')?'Updated record available':'Tracking record pending','#e5a89c')}}
 if(mode==='link'&&!f.groundContact)textLabel(w*.5-96,h*.72,'NO VERIFIED GROUND PATH','Current telemetry unavailable','#e6a48d');
 drawCompass();ctx.fillStyle='#6f879a';ctx.font='8px monospace';ctx.fillText(w<650?'DRAG / ARROWS: ROTATE · + / −: ZOOM':'DRAG TO ORBIT · ARROW KEYS · + / − TO ZOOM',22,h-53);ctx.textAlign='right';if(w>650)ctx.fillText('SCHEMATIC ORBIT · SCALE ENLARGED',w-22,h-53);ctx.textAlign='left';
 }
 function drawCompass(){let x=34,y=h-88;ctx.strokeStyle='#55738b77';ctx.lineWidth=.7;ctx.beginPath();ctx.arc(x,y,13,0,TAU);ctx.stroke();line([x,y-19],[x,y+19],'#55738b77',.7);line([x-19,y],[x+19,y],'#55738b77',.7);ctx.font='7px monospace';ctx.fillStyle='#85a7bd';ctx.fillText('N',x-2,y-23)}
 function drawChase(now,f){let t=f.time,shadow=t>=32&&t<62;
 if(planet){let quality=drag?320:f.playing?480:800,ek=['chase',Math.floor(t*1.2),quality].join();if(ek!==earthKey&&(now-earthAt>700||!f.playing)){planet.paint({az:.65+t/96*TAU,el:.2,rotation:.5+t*.006,sun:norm([-.6,.5,1.5]),night:shadow,quality});earthAt=now;earthKey=ek}ctx.save();ctx.translate(w*.34,h*1.42);ctx.rotate(-.17);planet.draw(ctx,0,0,h*1.08,{shadow});ctx.restore()}
 let cam=makeCamera(az-.15,el+.16,zoom*((w<600?2.5:1.9)+explode*.35),w,h,1.12,[0,.1,0]),spin=t*.002,transform=p=>[p[0]*Math.cos(spin)+p[2]*Math.sin(spin),p[1],-p[0]*Math.sin(spin)+p[2]*Math.cos(spin)];drawVehicle(ctx,cam,{atlas:assets.atlas,transform,explode,shadow});
 if(f.burn)for(let side of [-1,1]){let p=cam.project(transform([side*.38,-.79,.66])),q=cam.project(transform([side*.38,-1.65,.97])),g=ctx.createLinearGradient(p[0],p[1],q[0],q[1]);g.addColorStop(0,'#e7f7ffed');g.addColorStop(.2,'#6edaffaa');g.addColorStop(1,'#5078ee00');ctx.fillStyle=g;ctx.beginPath();ctx.moveTo(p[0]-4,p[1]);ctx.lineTo(q[0]-12,q[1]);ctx.lineTo(q[0]+12,q[1]);ctx.lineTo(p[0]+4,p[1]);ctx.fill()}
 if(explode>.3){for(let [label,p,dx,dy]of [['PHOTOVOLTAIC ARRAY',[-2.1,.1,0],-110,-30],['OPTICAL PAYLOAD',[0,-.38,1.6],35,30],['AVIONICS',[-.2,1.4,0],-120,-30],['HIGH-GAIN ANTENNA',[.65,1.62,.1],40,-15]]){let q=cam.project(transform(p));line(q,[q[0]+dx,q[1]+dy],'#9cc5d888',.7);textLabel(q[0]+dx,q[1]+dy-20,label,'','#bdd5df')}}
 ctx.fillStyle='#91aabb';ctx.font='8px monospace';ctx.fillText('TRACKING CAMERA / ILLUSTRATIVE ATTITUDE',22,h-53);ctx.textAlign='right';if(w>650)ctx.fillText('DRAG TO INSPECT · + / − TO ZOOM',w-22,h-53);ctx.textAlign='left';
 // Small clock-linked orbital locator keeps the global position visible in close-up.
 let cx=w-64,cy=h-105;ctx.fillStyle='#071521d9';ctx.beginPath();ctx.arc(cx,cy,39,0,TAU);ctx.fill();ctx.strokeStyle='#6988a76b';ctx.lineWidth=.7;ctx.beginPath();ctx.ellipse(cx,cy,32,19,-.45,0,TAU);ctx.stroke();let a=t/96*TAU,xx=Math.cos(a)*32,yy=Math.sin(a)*19;dotPoint([cx+xx*Math.cos(-.45)-yy*Math.sin(-.45),cy+xx*Math.sin(-.45)+yy*Math.cos(-.45)],3,'#e7bd82');dotPoint([cx,cy],11,'#2b5d76');
 }
 const handlers=[];function on(el,type,fn,opt){el.addEventListener(type,fn,opt);handlers.push(()=>el.removeEventListener(type,fn,opt))}
 on(canvas,'pointerdown',e=>{drag=[e.clientX,e.clientY];canvas.setPointerCapture(e.pointerId)});on(canvas,'pointermove',e=>{if(!drag)return;az-=(e.clientX-drag[0])*.006;el=Math.max(-1.15,Math.min(1.3,el+(e.clientY-drag[1])*.006));drag=[e.clientX,e.clientY];earthKey=''});on(canvas,'pointerup',()=>{drag=null;earthKey='';lastKey=''});on(canvas,'pointercancel',()=>{drag=null;lastKey=''});
 on(canvas,'wheel',e=>{e.preventDefault();zoom=Math.max(2.7,Math.min(5.5,zoom+e.deltaY*.002));lastKey=''},{passive:false});on(canvas,'keydown',e=>{if(!['ArrowLeft','ArrowRight','ArrowUp','ArrowDown','+','-','='].includes(e.key))return;e.preventDefault();if(e.key==='ArrowLeft')az-=.12;if(e.key==='ArrowRight')az+=.12;if(e.key==='ArrowUp')el=Math.min(1.3,el+.1);if(e.key==='ArrowDown')el=Math.max(-1.15,el-.1);if(e.key==='+'||e.key==='=')zoom=Math.max(2.7,zoom-.2);if(e.key==='-')zoom=Math.min(5.5,zoom+.2);earthKey=''});
 const observer=new ResizeObserver(()=>{w=host.clientWidth;h=host.clientHeight;let d=Math.min(devicePixelRatio,1.6);canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0);lastKey='';earthKey=''});observer.observe(host);raf=requestAnimationFrame(render);
 return {zoomBy(delta){zoom=Math.max(2.7,Math.min(5.5,zoom+delta));lastKey='';earthKey=''},view(v){mode=v;az=v==='chase'?.55:.65;el=v==='link'?.55:.32;zoom=v==='chase'?3.7:v==='link'?3.1:3.3;explode=targetExplode=0;earthKey='';lastKey=''},explode(v){mode='chase';az=.55;el=.32;zoom=4;targetExplode=v?1:0;if(matchMedia('(prefers-reduced-motion: reduce)').matches)explode=targetExplode;earthKey='';lastKey=''},dispose(){disposed=true;cancelAnimationFrame(raf);observer.disconnect();handlers.forEach(f=>f());canvas.remove()}};
}
