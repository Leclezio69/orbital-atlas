// Shared, textured perspective geometry for both learning scenes.
// Geometry and atmospheric presentation are illustrative; mission state comes from callers.
export const V={add:(a,b)=>a.map((v,i)=>v+b[i]),sub:(a,b)=>a.map((v,i)=>v-b[i]),mul:(a,s)=>a.map(v=>v*s),dot:(a,b)=>a.reduce((s,v,i)=>s+v*b[i],0),cross:(a,b)=>[a[1]*b[2]-a[2]*b[1],a[2]*b[0]-a[0]*b[2],a[0]*b[1]-a[1]*b[0]],norm:a=>{let n=Math.hypot(...a);return a.map(v=>v/(n||1))}};
const {add,sub,mul,dot,cross,norm}=V,TAU=Math.PI*2;
export const materials={foil:{color:[207,160,69],tile:0,metal:.65},solar:{color:[26,43,82],tile:1,metal:.8},radiator:{color:[195,203,210],tile:2,metal:.3},carbon:{color:[30,36,44],tile:3,metal:.2},silver:{color:[180,196,209],metal:.9},white:{color:[221,225,229],metal:.25},dark:{color:[32,43,56],metal:.55},lens:{color:[18,78,107],metal:1},gold:{color:[167,125,54],metal:.7}};
export function makeVehicle(){
 let faces=[],part='bus';const face=(p,m,uv=[[0,1],[1,1],[1,0],[0,0]])=>faces.push({p,m,uv,part});
 function quad(p,m,n=1){
  // Continuous shallow folds give the foil actual changing surface normals.
  if(m==='foil')n=8;let normal=norm(cross(sub(p[1],p[0]),sub(p[2],p[0])));
  const point=(a,b)=>{let v=add(add(mul(p[0],(1-a)*(1-b)),mul(p[1],a*(1-b))),add(mul(p[2],a*b),mul(p[3],(1-a)*b)));if(m==='foil'){let fold=Math.sin(a*47+b*19)*Math.sin(b*39-a*13)*.0075*Math.sin(a*Math.PI)*Math.sin(b*Math.PI);v=add(v,mul(normal,fold))}return v};
  for(let y=0;y<n;y++)for(let x=0;x<n;x++){let x0=x/n,y0=y/n,x1=(x+1)/n,y1=(y+1)/n,ps=[point(x0,y0),point(x1,y0),point(x1,y1),point(x0,y1)],uv=[[x0,1-y0],[x1,1-y0],[x1,1-y1],[x0,1-y1]];if(m==='foil'){for(let ids of [[0,1,2],[0,2,3]])face(ids.map(i=>ps[i]),m,ids.map(i=>uv[i]))}else face(ps,m,uv)}
 }
 function box(p,s,m,n=1){let[x,y,z]=p,[a,b,c]=s.map(v=>v/2);quad([[x-a,y-b,z+c],[x+a,y-b,z+c],[x+a,y+b,z+c],[x-a,y+b,z+c]],m,n);quad([[x+a,y-b,z-c],[x-a,y-b,z-c],[x-a,y+b,z-c],[x+a,y+b,z-c]],m,n);quad([[x-a,y+b,z+c],[x+a,y+b,z+c],[x+a,y+b,z-c],[x-a,y+b,z-c]],m,n);quad([[x-a,y-b,z-c],[x+a,y-b,z-c],[x+a,y-b,z+c],[x-a,y-b,z+c]],m,n);quad([[x+a,y-b,z+c],[x+a,y-b,z-c],[x+a,y+b,z-c],[x+a,y+b,z+c]],m,n);quad([[x-a,y-b,z-c],[x-a,y-b,z+c],[x-a,y+b,z+c],[x-a,y+b,z-c]],m,n)}
 function tube(a,b,r0,r1,m,segments=16,cap=true){let d=norm(sub(b,a)),u=norm(cross(d,Math.abs(d[1])>.9?[1,0,0]:[0,1,0])),v=cross(d,u);const p=(base,r,t)=>add(base,add(mul(u,r*Math.cos(t)),mul(v,r*Math.sin(t))));for(let j=0;j<segments;j++){let t=j/segments*TAU,t2=(j+1)/segments*TAU;face([p(a,r0,t),p(a,r0,t2),p(b,r1,t2),p(b,r1,t)],m);if(cap){face([b,p(b,r1,t),p(b,r1,t2)],m,[[.5,.5],[0,0],[1,0]]);face([a,p(a,r0,t2),p(a,r0,t)],m,[[.5,.5],[0,0],[1,0]])}}}
 // Bevelled octagonal spacecraft bus, covered in real material texture.
 const ring=Array.from({length:8},(_,j)=>{let a=(j+.5)*TAU/8;return [Math.cos(a)*.67,Math.sin(a)*.67]});
 for(let j=0;j<8;j++){let[a,z]=ring[j],[b,q]=ring[(j+1)%8];quad([[b,-.55,q],[a,-.55,z],[a,.55,z],[b,.55,q]],j===4||j===5?'radiator':'foil',3)}
 box([0,.58,0],[1.22,.06,1.2],'silver');box([0,-.58,0],[1.22,.06,1.2],'silver');box([0,.625,0],[1.07,.025,1.06],'carbon',2);
 for(let x of [-.53,.53])for(let z of [-.53,.53]){tube([x,-.57,z],[x,.61,z],.023,.023,'silver',8);tube([x,.61,z],[x,.65,z],.046,.046,'dark',8)}
 // Two articulated triple-panel wings. Frames, exposed hinges and support trusses.
 for(let side of [-1,1]){part=side<0?'left':'right';tube([side*.56,0,0],[side*.94,0,0],.065,.065,'silver');for(let j=0;j<3;j++){let x=side*(1.28+j*.76);box([x,.025,0],[.72,.036,1.22],'solar',3);quad([[x-.348,.046,-.597],[x-.348,.046,.597],[x+.348,.046,.597],[x+.348,.046,-.597]],'solar',3);for(let z of [-.619,.619])box([x,.03,z],[.76,.04,.022],'silver');for(let dx of [-.373,.373])box([x+dx,.03,0],[.018,.043,1.24],'silver');for(let z of [-.4,.4]){tube([x-side*.4,-.05,z],[x-side*.34,-.05,z],.045,.045,'silver',8);tube([side*.8,-.08,0],[x,-.045,z],.011,.011,'dark',6)}}}
 part='bus';
 // Exposed gold tanks and machined avionics boxes, cable looms and radiator louvers.
 for(let x of [-.39,.39]){tube([x,-.2,-.63],[x,.28,-.63],.13,.13,'gold',18);tube([x,.28,-.63],[x,.34,-.63],.13,.05,'silver',18)}
 box([-.645,.02,0],[.035,.68,.62],'radiator',2);for(let y=-.24;y<.3;y+=.09)box([-.674,y,0],[.045,.012,.59],'silver');
 for(let x of [-.38,.38]){tube([x,-.56,.52],[x,-.78,.65],.044,.09,'dark',14);tube([x,-.765,.64],[x,-.79,.66],.095,.095,'silver',14,false)}
 // Front-facing optical payload with nested aperture and baffle rings.
 part='payload';box([0,-.17,.66],[.58,.64,.17],'white',2);tube([0,-.17,.73],[0,-.17,1.02],.245,.21,'carbon',32);tube([0,-.17,1.02],[0,-.17,1.045],.215,.215,'silver',32,false);tube([0,-.17,1.03],[0,-.17,1.04],.179,.179,'lens',32);tube([0,-.17,1.045],[0,-.17,1.05],.116,.116,'dark',24);tube([0,-.17,1.052],[0,-.17,1.054],.088,.088,'lens',24);
 for(let x of [-.25,.25])for(let y of [-.43,.09])tube([x,y,.75],[x,y,.77],.021,.021,'silver',8);
 part='avionics';box([-.19,.73,-.12],[.68,.16,.66],'radiator',2);box([-.19,.82,-.12],[.54,.025,.54],'carbon',2);for(let j=0;j<4;j++)box([-.4+j*.14,.84,-.12],[.01,.035,.53],'silver');
 // Mesh-like high-gain dish, feed support struts and navigation antenna.
 part='antenna';tube([.33,.59,.14],[.33,.91,.14],.028,.028,'silver');const center=[.33,.95,.14];for(let ring=0;ring<6;ring++)for(let j=0;j<32;j++){let a=j/32*TAU,b=(j+1)/32*TAU,r=ring*.062,r2=(ring+1)*.062,p=(r,a)=>add(center,[r*Math.cos(a),r*r*1.4,r*Math.sin(a)]);face([p(r,a),p(r2,a),p(r2,b),p(r,b)],'white');face([p(r,b),p(r2,b),p(r2,a),p(r,a)],'silver')}
 for(let a of [0,TAU/3,TAU*2/3])tube(add(center,[.33*Math.cos(a),.16,.33*Math.sin(a)]),[.33,1.36,.14],.009,.009,'carbon',6);tube([.33,1.3,.14],[.33,1.39,.14],.025,.025,'gold',12);tube([-.43,.65,-.38],[-.43,1.54,-.38],.009,.004,'silver',8);box([-.43,1.05,-.38],[.32,.006,.012],'silver');
 return faces;
}
export const vehicle=makeVehicle();
let assetsPromise;
export function loadSpaceAssets(){if(assetsPromise)return assetsPromise;const get=src=>new Promise(resolve=>{let i=new Image();i.onload=()=>resolve(i);i.onerror=()=>resolve(null);i.src=src});assetsPromise=Promise.all([get('assets/space-materials.webp'),get('assets/earth.jpg'),get('assets/earth-clouds.jpg')]).then(([atlas,earth,clouds])=>({atlas,earth,clouds}));return assetsPromise}
export function makeCamera(az,el,distance,w,h,scale=1.3,target=[0,0,0]){let eye=add(target,[distance*Math.cos(el)*Math.sin(az),distance*Math.sin(el),distance*Math.cos(el)*Math.cos(az)]),forward=norm(sub(target,eye)),right=norm(cross(forward,[0,1,0])),up=cross(right,forward),focal=Math.min(w,h)*scale;return {eye,forward,right,up,focal,w,h,project(p){let d=sub(p,eye),z=dot(d,forward);return [w*.5+dot(d,right)*focal/z,h*.5-dot(d,up)*focal/z,z]}}}
function textureTriangle(ctx,img,p,uv){let [a,b,c]=p,[u,v,q]=uv;let den=u[0]*(v[1]-q[1])+v[0]*(q[1]-u[1])+q[0]*(u[1]-v[1]);if(Math.abs(den)<.001)return;let A=(a[0]*(v[1]-q[1])+b[0]*(q[1]-u[1])+c[0]*(u[1]-v[1]))/den,B=(a[1]*(v[1]-q[1])+b[1]*(q[1]-u[1])+c[1]*(u[1]-v[1]))/den,C=(a[0]*(q[0]-v[0])+b[0]*(u[0]-q[0])+c[0]*(v[0]-u[0]))/den,D=(a[1]*(q[0]-v[0])+b[1]*(u[0]-q[0])+c[1]*(v[0]-u[0]))/den,E=(a[0]*(v[0]*q[1]-q[0]*v[1])+b[0]*(q[0]*u[1]-u[0]*q[1])+c[0]*(u[0]*v[1]-v[0]*u[1]))/den,F=(a[1]*(v[0]*q[1]-q[0]*v[1])+b[1]*(q[0]*u[1]-u[0]*q[1])+c[1]*(u[0]*v[1]-v[0]*u[1]))/den;
 ctx.save();ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();ctx.clip();ctx.transform(A,B,C,D,E,F);ctx.drawImage(img,0,0);ctx.restore()}
// An inexpensive analytic bus occluder keeps the software path usable on modest devices.
function bodyShadow(p,d){let near=.004,far=20;for(let i=0;i<3;i++){if(Math.abs(d[i])<1e-6){if(Math.abs(p[i])>.57)return false;continue}let a=(-.57-p[i])/d[i],b=(.57-p[i])/d[i];near=Math.max(near,Math.min(a,b));far=Math.min(far,Math.max(a,b));if(near>far)return false}return far>near}
export function drawVehicle(ctx,camera,{atlas,transform=p=>p,explode=0,shadow=false,lod=false,sun=norm([-.8,1.4,1.2]),alpha=1}={}){
 let faces=[];const offsets={left:[-.7,0,0],right:[.7,0,0],payload:[0,-.35,.7],avionics:[0,.6,0],antenna:[.25,.5,-.1],bus:[0,0,0]};
 let origin=transform([0,0,0]),axes=[[1,0,0],[0,1,0],[0,0,1]].map(v=>norm(sub(transform(v),origin))),localSun=axes.map(v=>dot(v,sun));
 const earth=norm([-.2,-1,.45]);
 for(let f of vehicle){
  if(lod&&!['foil','solar'].includes(f.m))continue;
  let local=f.p.map(p=>add(p,mul(offsets[f.part],explode))),p=local.map(transform),n=norm(cross(sub(p[1],p[0]),sub(p[2],p[0]))),center=mul(p.reduce(add,[0,0,0]),1/p.length),view=norm(sub(camera.eye,center));
  if(dot(n,view)<-.001)continue;let q=p.map(camera.project);if(q.some(q=>q[2]<=.03))continue;
  let m=materials[f.m],occluded=!lod&&f.part!=='bus'&&bodyShadow(mul(local.reduce(add,[0,0,0]),1/local.length),localSun),direct=shadow||occluded?0:Math.max(0,dot(n,sun)),fill=Math.max(0,dot(n,earth)),fresnel=Math.pow(1-Math.max(0,dot(n,view)),4),rough=f.m==='foil'?20:f.m==='solar'?80:f.m==='lens'?110:38,spec=Math.pow(Math.max(0,dot(n,norm(add(sun,view)))),rough)*m.metal*(shadow||occluded?0:1),shade=(shadow?.12:.13)+direct*.82+fill*.2;
  let tint=[fill*8,fill*20,fill*35],rim=fresnel*m.metal*(shadow?.2:.45);
  faces.push({q,m,uv:f.uv,z:q.reduce((s,q)=>s+q[2],0)/q.length,shade,spec,tint,rim,name:f.m});
 }
 faces.sort((a,b)=>b.z-a.z);ctx.globalAlpha=alpha;
 const path=q=>{ctx.beginPath();q.forEach((p,i)=>i?ctx.lineTo(p[0],p[1]):ctx.moveTo(p[0],p[1]));ctx.closePath()};
 for(let f of faces){let {q,m,shade,spec,tint,rim,name}=f;path(q);ctx.fillStyle=`rgb(${m.color.map((c,i)=>Math.min(255,c*shade+tint[i]+spec*[255,229,184][i]+rim*[80,140,210][i])).join(',')})`;ctx.fill();
  if(atlas&&m.tile!==undefined&&!lod){let sz=atlas.width/2,ox=m.tile%2*sz,oy=Math.floor(m.tile/2)*sz,uv=f.uv.map(p=>[ox+1+p[0]*(sz-2),oy+1+p[1]*(sz-2)]);textureTriangle(ctx,atlas,q.slice(0,3),uv.slice(0,3));if(q.length===4)textureTriangle(ctx,atlas,[q[0],q[2],q[3]],[uv[0],uv[2],uv[3]]);path(q);ctx.fillStyle=`rgba(1,6,14,${Math.max(0,1-shade)})`;ctx.fill();
   if(spec+rim>.012){let xs=q.map(p=>p[0]),ys=q.map(p=>p[1]),gradient=ctx.createLinearGradient(Math.min(...xs),Math.min(...ys),Math.max(...xs)+.1,Math.max(...ys)+.1);gradient.addColorStop(0,`rgba(171,213,255,${Math.min(.5,rim+spec*.28)})`);gradient.addColorStop(.45,`rgba(255,235,196,${Math.min(.7,spec*.75)})`);gradient.addColorStop(1,`rgba(40,90,135,${rim*.3})`);ctx.fillStyle=gradient;ctx.fill()}
  }
 }
 ctx.globalAlpha=1;
}

function pixels(img){if(!img)return null;let c=document.createElement('canvas');c.width=img.width;c.height=img.height;let g=c.getContext('2d');g.drawImage(img,0,0);return {w:c.width,h:c.height,p:g.getImageData(0,0,c.width,c.height).data}}
export function createPlanet(assets){let land=pixels(assets.earth),cloud=pixels(assets.clouds),canvas=document.createElement('canvas'),ctx=canvas.getContext('2d'),cache='';let n=720;canvas.width=canvas.height=n;
 // Bilinear sampling prevents blocky coastlines at close range.
 function sample(t,u,v,k){u=(u%1+1)%1;v=Math.max(0,Math.min(.99999,v));let x=u*t.w,y=v*t.h,x0=Math.floor(x),y0=Math.floor(y),fx=x-x0,fy=y-y0,x1=(x0+1)%t.w,y1=Math.min(t.h-1,y0+1);return (t.p[(y0*t.w+x0)*4+k]*(1-fx)+t.p[(y0*t.w+x1)*4+k]*fx)*(1-fy)+(t.p[(y1*t.w+x0)*4+k]*(1-fx)+t.p[(y1*t.w+x1)*4+k]*fx)*fy}
 return {canvas,paint({az=.4,el=.22,rotation=.55,sun=norm([1,.2,1.3]),night=false,quality=720}={}){if(!land)return;let key=[az.toFixed(2),el.toFixed(2),rotation.toFixed(2),...sun.map(x=>x.toFixed(2)),night,quality].join();if(key===cache)return;cache=key;if(n!==quality){n=quality;canvas.width=canvas.height=n}let view=norm([Math.cos(el)*Math.sin(az),Math.sin(el),Math.cos(el)*Math.cos(az)]),right=norm(cross([0,1,0],view)),up=cross(view,right),half=norm(add(view,sun)),data=ctx.createImageData(n,n),d=data.data,r=n/2-2,cs=Math.cos(-rotation),sn=Math.sin(-rotation);
 for(let y=0;y<n;y++)for(let x=0;x<n;x++){let nx=(x-n/2)/r,ny=-(y-n/2)/r,q=1-nx*nx-ny*ny;if(q<0)continue;let nz=Math.sqrt(q),wx=right[0]*nx+up[0]*ny+view[0]*nz,wy=right[1]*nx+up[1]*ny+view[1]*nz,wz=right[2]*nx+up[2]*ny+view[2]*nz,px=wx*cs+wz*sn,pz=-wx*sn+wz*cs,u=.5+Math.atan2(pz,px)/TAU,v=.5-Math.asin(Math.max(-1,Math.min(1,wy)))/Math.PI;let nd=wx*sun[0]+wy*sun[1]+wz*sun[2],day=Math.max(0,nd),shade=.018+Math.pow(day,.6)*1.02,cloudValue=cloud?Math.pow(sample(cloud,u+rotation*.008,v,0)/255,1.2)*.91:0,cloudShadow=cloud?sample(cloud,u+.002,v+.001,0)/255*.23:0,rim=Math.pow(1-nz,3.2),spec=Math.pow(Math.max(0,wx*half[0]+wy*half[1]+wz*half[2]),70);let rgb=[0,1,2].map(k=>sample(land,u,v,k)),water=rgb[2]>rgb[0]*1.35&&rgb[2]>rgb[1]*1.1;let alpha=Math.min(1,q*r*1.2),i=(y*n+x)*4;for(let k=0;k<3;k++){let base=rgb[k]*(1-cloudShadow)*(1-cloudValue)+[245,248,250][k]*cloudValue,glint=water?spec*(1-cloudValue)*[95,110,125][k]:0,atmos=rim*Math.max(.06,day+.22)*[22,93,184][k];d[i+k]=Math.min(255,base*shade+glint+atmos);if(night)d[i+k]*=.25}d[i+3]=alpha*255;}ctx.putImageData(data,0,0)},draw(ctx,x,y,r,{shadow=false}={}){let glow=ctx.createRadialGradient(x,y,r*.97,x,y,r*1.04);glow.addColorStop(0,'#4399e000');glow.addColorStop(.45,shadow?'#4075b126':'#67b9f77a');glow.addColorStop(.65,'#258af329');glow.addColorStop(1,'#072f6800');ctx.fillStyle=glow;ctx.fillRect(x-r*1.05,y-r*1.05,r*2.1,r*2.1);ctx.drawImage(canvas,x-r,y-r,r*2,r*2)}};
}
export function backdrop(ctx,w,h,az=0,shadow=false){let g=ctx.createRadialGradient(w*.2,h*.12,0,w*.5,h*.5,w);g.addColorStop(0,shadow?'#071020':'#0c1c2f');g.addColorStop(1,'#01030a');ctx.fillStyle=g;ctx.fillRect(0,0,w,h);let seed=136;for(let i=0;i<210;i++){seed=(seed*1664525+1013904223)>>>0;let x=((seed/4294967296*w+az*13)%w+w)%w;seed=(seed*1664525+1013904223)>>>0;let y=seed/4294967296*h;ctx.fillStyle=i%11===0?'#d9e8ff8c':'#a3c0e340';ctx.beginPath();ctx.arc(x,y,i%19===0?1.1:.55,0,TAU);ctx.fill()}let v=ctx.createRadialGradient(w*.5,h*.45,Math.min(w,h)*.35,w*.5,h*.5,Math.max(w,h)*.75);v.addColorStop(0,'#01040a00');v.addColorStop(1,'#01040aaa');ctx.fillStyle=v;ctx.fillRect(0,0,w,h)}
// The WebGL path consumes the same model and texture atlas as the fallback.
export function makeThreeVehicle(T,atlasTexture){let group=new T.Group();for(let [name,m]of Object.entries(materials)){let fs=vehicle.filter(f=>f.m===name),p=[],uv=[],normals=[];for(let f of fs){let normal=norm(cross(sub(f.p[1],f.p[0]),sub(f.p[2],f.p[0])));for(let ids of f.p.length===4?[[0,1,2],[0,2,3]]:[[0,1,2]])for(let i of ids){p.push(...f.p[i]);normals.push(...normal);let q=f.uv[i];uv.push(m.tile===undefined?q[0]:(m.tile%2+q[0])*.5,m.tile===undefined?1-q[1]:1-(Math.floor(m.tile/2)+q[1])*.5)}}let geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uv,2));let mat=new T.MeshStandardMaterial({color:m.tile===undefined?new T.Color(...m.color.map(v=>v/255)):0xffffff,map:m.tile===undefined?null:atlasTexture,metalness:m.metal*.65,roughness:name==='lens'?.1:name==='solar'?.25:.44});group.add(new T.Mesh(geo,mat))}return group}
