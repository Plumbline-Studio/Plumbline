/* Plexus — Ambient, 3D · cylindrical.
   Clustered node cloud on a CYLINDER turning slowly around its vertical axis.
   No pointer coupling: it drifts on its own — a steady slow spin with a very
   gentle breathing tilt — so the page never feels like it is chasing the cursor.
   Nodes orbit the axis so they never leave the frame. Spatial-grid linking +
   adaptive quality. Canvas2D, self-contained. */
(() => {
  const canvas=document.getElementById('plexus');
  const dark=()=>document.documentElement.dataset.theme==='dark'||(document.documentElement.dataset.theme!=='light'&&matchMedia('(prefers-color-scheme: dark)').matches);
  let TH={};
  function theme(){ TH=dark()?{bg0:'#211e1f',bg1:'#171516',line:'214,130,95',node:'232,224,218',ring:'212,130,95',pulse:'212,130,95',dust:'180,170,165'}:{bg0:'#f7f8fa',bg1:'#ecedf0',line:'43,50,61',node:'21,25,32',ring:'40,47,58',pulse:'30,36,46',dust:'60,68,80'}; }
  theme();
  const ctx=canvas.getContext('2d',{alpha:false});
  const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

  const CAM=4.3, FOCAL=2.6;      // camera distance, perspective strength
  const SPIN=0.0005;             // base rotation around the axis (very slow drift)
  const TILT=0.20;               // fixed lean so the cylinder reads as 3D
  const LINK=0.40;
  let W=0,H=0,DPR=1,K=1,R=2.4,HH=1.5;
  let nodes=[], dust=[], clusters=[], pulses=[], adj=[];
  let running=true, t=0, spin=0, spinVel=SPIN, tilt=TILT;
  let quality=2, fpsEMA=60, lastNow=0;
  const rand=(a,b)=>a+Math.random()*(b-a);
  const gauss=()=>{ let u=0,v=0; while(!u)u=Math.random(); while(!v)v=Math.random();
    return Math.sqrt(-2*Math.log(u))*Math.cos(6.2832*v); };

  function build(){
    DPR=Math.min(devicePixelRatio||1,2);
    W=innerWidth; H=innerHeight;
    canvas.width=Math.round(W*DPR); canvas.height=Math.round(H*DPR);
    canvas.style.width=W+'px'; canvas.style.height=H+'px';
    ctx.setTransform(DPR,0,0,DPR,0,0);
    K=Math.min(W,H)*0.62;
    const scaleMid=FOCAL/CAM;
    R =Math.min(CAM-1.05, (0.62*W)/(scaleMid*K));    // fill width, keep depth>0
    HH=(0.58*H)/(scaleMid*K);                        // fill height

    const cores=navigator.hardwareConcurrency||4;
    let target=Math.min(1100, Math.max(380, (W*H)/1500));   // ~3x density
    if(cores<=4) target*=0.8;
    target=Math.round(target*(quality>=2?1:0.6));

    // clusters live on the cylinder (angle, height, radius)
    const K_=Math.round(Math.min(12,Math.max(5,target/44)));
    clusters=[];
    for(let k=0;k<K_;k++) clusters.push({ th:rand(0,6.283), y:rand(-HH*0.9,HH*0.9), r:R*rand(0.55,1.0), w:rand(0.75,1.25) });

    nodes=[];
    for(let i=0;i<target;i++){
      const free=Math.random()<0.5;
      let th,y,r;
      if(free){ th=rand(0,6.283); y=rand(-HH,HH); r=R*Math.sqrt(rand(0.05,1)); }
      else { const c=clusters[(Math.random()*clusters.length)|0];
        th=c.th+gauss()*0.5*c.w; y=c.y+gauss()*0.42*HH*0.6*c.w; r=Math.max(0.15*R,Math.min(R,c.r+gauss()*0.5)); }
      nodes.push(mk(th,y,r,free));
    }
    // hub per cluster (nearest node)
    for(const c of clusters){
      let best=null,bd=1e9;
      for(const n of nodes){ if(n.free) continue;
        const dth=Math.min(Math.abs(n.th0-c.th),6.283-Math.abs(n.th0-c.th));
        const d=dth*dth+(n.y0-c.y)**2+(n.r0-c.r)**2; if(d<bd){bd=d;best=n;} }
      if(best){ best.hub=true; best.rs=1.7; best.tone=1; }
    }

    // outer dust shell (deeper, no links)
    dust=[];
    const dn=Math.round(target*(quality>=2?0.4:0.2));
    for(let i=0;i<dn;i++) dust.push({
      th0:rand(0,6.283), y0:rand(-HH*1.35,HH*1.35), r0:R*rand(1.0,1.6),
      aY:rand(0,0.06), wY:rand(0.0015,0.004), pY:rand(0,6.28), s:rand(0.3,0.9) });

    pulses=[];
    const pn=quality>=2?Math.min(16,Math.round(target/40)):0;
    for(let i=0;i<pn;i++) pulses.push({ a:(Math.random()*nodes.length)|0, b:-1, t:1, sp:rand(0.002,0.005) });
  }
  function mk(th,y,r,free){
    return { th0:th, y0:y, r0:r, free, hub:false, rs:1, tone:rand(0.8,0.97),
      aTh:rand(0.01,0.05), wTh:rand(0.0010,0.0035), pTh:rand(0,6.28),
      aY:rand(0.02,0.07),  wY:rand(0.0010,0.0035), pY:rand(0,6.28),
      aR:rand(0.01,0.05),  wR:rand(0.0010,0.0035), pR:rand(0,6.28),
      wx:0,wy:0,wz:0 };
  }

  // world position (pre-tilt cylinder coords) + tilt applied
  let cT=1,sT=0;
  function worldOf(p){
    const th=p.th0+spin+p.aTh*Math.sin(t*p.wTh+p.pTh);
    const r =p.r0 + p.aR*Math.sin(t*p.wR+p.pR);
    const yy=p.y0 + p.aY*Math.sin(t*p.wY+p.pY);
    const xc=r*Math.cos(th), zc=r*Math.sin(th), yc=yy;
    // tilt (pitch around X) so we look slightly down the axis
    p.wx=xc; p.wy=yc*cT - zc*sT; p.wz=yc*sT + zc*cT;
  }
  function project(p){
    const depth=CAM-p.wz; if(depth<=0.05) return null;
    const s=FOCAL/depth;
    return { sx:W*0.5+p.wx*s*K, sy:H*0.5+p.wy*s*K, depth, s };
  }
  const DFAR=()=>CAM+R, DNEAR=()=>CAM-R;
  function fog(depth){ return Math.min(1,Math.max(0,(depth-DNEAR())/(2*R))); }

  function background(){
    const g=ctx.createRadialGradient(W*0.5,H*0.42,0,W*0.5,H*0.42,Math.hypot(W,H)*0.64);
    g.addColorStop(0,TH.bg0); g.addColorStop(1,TH.bg1);
    ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  }

  function linkAndDraw(P){
    const inv=1/LINK, grid=new Map(), key=(a,b,c)=>a+','+b+','+c;
    for(let i=0;i<nodes.length;i++){ const p=nodes[i];
      const gx=Math.floor(p.wx*inv),gy=Math.floor(p.wy*inv),gz=Math.floor(p.wz*inv);
      const kk=key(gx,gy,gz); let arr=grid.get(kk); if(!arr){arr=[];grid.set(kk,arr);} arr.push(i); }
    adj=new Array(nodes.length); for(let i=0;i<nodes.length;i++) adj[i]=[];
    const L2=LINK*LINK; ctx.lineWidth=1;
    for(let i=0;i<nodes.length;i++){
      const a=nodes[i], pa=P[i]; if(!pa) continue;
      const gx=Math.floor(a.wx*inv),gy=Math.floor(a.wy*inv),gz=Math.floor(a.wz*inv);
      for(let ox=-1;ox<=1;ox++)for(let oy=-1;oy<=1;oy++)for(let oz=-1;oz<=1;oz++){
        const arr=grid.get(key(gx+ox,gy+oy,gz+oz)); if(!arr) continue;
        for(const j of arr){ if(j<=i) continue;
          const b=nodes[j], dx=a.wx-b.wx,dy=a.wy-b.wy,dz=a.wz-b.wz, d2=dx*dx+dy*dy+dz*dz;
          if(d2<L2){
            adj[i].push(j); adj[j].push(i);
            const pb=P[j]; if(!pb) continue;
            const d=Math.sqrt(d2), f=1-fog((pa.depth+pb.depth)*0.5);
            const al=(1-d/LINK)*0.34*f; if(al<0.006) continue;
            ctx.strokeStyle=`rgba(${TH.line},${al})`;
            ctx.beginPath(); ctx.moveTo(pa.sx,pa.sy); ctx.lineTo(pb.sx,pb.sy); ctx.stroke();
          }
        }
      }
    }
  }

  function drawNode(p,pr){
    const rPx=Math.max(0.4,(p.hub?0.014:0.008)*p.rs*pr.s*K);
    const near=CAM-R*0.82;                       // only the frontmost slice blurs
    const blur=pr.depth<near?Math.min(22,(near-pr.depth)*12):0;
    const f=fog(pr.depth), alpha=(0.9-0.5*f)*p.tone;
    if(blur<1.0){
      ctx.fillStyle=`rgba(${TH.node},${alpha})`;
      ctx.beginPath(); ctx.arc(pr.sx,pr.sy,rPx,0,6.2832); ctx.fill();
      if(p.hub){ ctx.strokeStyle=`rgba(${TH.ring},${alpha*0.32})`;
        ctx.beginPath(); ctx.arc(pr.sx,pr.sy,rPx+3,0,6.2832); ctx.stroke(); }
    } else {
      const Rr=rPx+blur, peak=alpha*Math.min(1,1.7*rPx/Rr);
      const g=ctx.createRadialGradient(pr.sx,pr.sy,0,pr.sx,pr.sy,Rr);
      g.addColorStop(0,`rgba(${TH.node},${peak})`); g.addColorStop(0.6,`rgba(${TH.node},${peak*0.5})`); g.addColorStop(1,`rgba(${TH.node},0)`);
      ctx.fillStyle=g; ctx.beginPath(); ctx.arc(pr.sx,pr.sy,Rr,0,6.2832); ctx.fill();
    }
  }
  function drawPulses(P){
    for(const pu of pulses){
      if(pu.b<0||pu.t>=1){ const from=pu.b<0?pu.a:pu.b, nb=adj[from];
        if(nb&&nb.length){ pu.a=from; pu.b=nb[(Math.random()*nb.length)|0]; pu.t=0; }
        else { pu.a=(Math.random()*nodes.length)|0; pu.b=-1; pu.t=1; continue; } }
      pu.t+=pu.sp; const pa=P[pu.a], pb=P[pu.b]; if(!pa||!pb) continue;
      const tt=pu.t, sx=pa.sx+(pb.sx-pa.sx)*tt, sy=pa.sy+(pb.sy-pa.sy)*tt;
      const depth=pa.depth+(pb.depth-pa.depth)*tt, a=0.9-0.55*fog(depth);
      ctx.fillStyle=`rgba(${TH.pulse},${a})`;
      ctx.beginPath(); ctx.arc(sx,sy,1.6*(FOCAL/depth),0,6.2832); ctx.fill();
    }
  }

  function draw(){
    cT=Math.cos(tilt); sT=Math.sin(tilt);
    background();
    // dust
    for(const d of dust){
      const th=d.th0+spin, r=d.r0, yy=d.y0+d.aY*Math.sin(t*d.wY+d.pY);
      const xc=r*Math.cos(th), zc=r*Math.sin(th);
      const wx=xc, wy=yy*cT-zc*sT, wz=yy*sT+zc*cT, depth=CAM-wz; if(depth<=0.05) continue;
      const s=FOCAL/depth, sx=W*0.5+wx*s*K, sy=H*0.5+wy*s*K;
      const f=fog(depth), a=(0.26-0.2*f)*d.s; if(a<0.01) continue;
      ctx.fillStyle=`rgba(${TH.dust},${a})`;
      ctx.beginPath(); ctx.arc(sx,sy,Math.max(0.4,0.5*s),0,6.2832); ctx.fill();
    }
    for(const p of nodes) worldOf(p);
    const P=new Array(nodes.length); for(let i=0;i<nodes.length;i++) P[i]=project(nodes[i]);
    linkAndDraw(P);
    const order=[]; for(let i=0;i<nodes.length;i++) if(P[i]) order.push(i);
    order.sort((i,j)=>P[j].depth-P[i].depth);
    for(const i of order) drawNode(nodes[i],P[i]);
    if(pulses.length) drawPulses(P);
  }

  function tick(now){
    if(!running) return;
    if(lastNow){ const fps=1000/Math.max(1,now-lastNow); fpsEMA=fpsEMA*0.92+fps*0.08; }
    lastNow=now; t+=1;
    spinVel += (SPIN - spinVel)*0.05;                 // steady drift
    spin += spinVel;
    tilt  = TILT + 0.015*Math.sin(t*0.0012);          // slow breathing lean (~90s period)
    draw();
    if(quality>=2 && t>150 && fpsEMA<40){ quality=1; build(); }
    requestAnimationFrame(tick);
  }

  matchMedia('(prefers-color-scheme: dark)').addEventListener('change',()=>{theme(); if(reduce) draw();});
  new MutationObserver(()=>{theme(); if(reduce) draw();}).observe(document.documentElement,{attributes:true,attributeFilter:['data-theme']});

  let rz;
  addEventListener('resize',()=>{clearTimeout(rz);rz=setTimeout(()=>{build(); if(reduce) draw();},150);},{passive:true});
  document.addEventListener('visibilitychange',()=>{
    if(document.hidden) running=false;
    else if(!reduce&&!running){ running=true; lastNow=0; requestAnimationFrame(tick); }
  });

  build();
  if(reduce){ spin=0.6; draw(); } else requestAnimationFrame(tick);
})();
