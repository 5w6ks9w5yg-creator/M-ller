document.getElementById('y').textContent=new Date().getFullYear();
document.querySelectorAll('.nav ul a').forEach(a=>a.addEventListener('click',()=>document.getElementById('nav').classList.remove('open')));
document.querySelectorAll('dialog').forEach(d=>d.addEventListener('click',e=>{if(e.target===d)d.close()}));
/* Bewertungs-Laufband */
(()=>{
  const mq=document.getElementById('marquee'), track=document.getElementById('track');
  const originals=[...track.children];
  const SPEED=40; // px pro Sekunde
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches;
  let x=0, setW=0, last=performance.now(), openCard=null, hover=false, drag=null;

  // Kopien für nahtlose Schleife
  function build(){
    track.querySelectorAll('.clone').forEach(c=>c.remove());
    const gap=parseFloat(getComputedStyle(track).columnGap)||20;
    setW=originals.reduce((s,c)=>s+c.offsetWidth+gap,0);
    let copies=Math.max(1,Math.ceil(mq.offsetWidth/setW)+1);
    for(let i=0;i<copies;i++)originals.forEach(c=>{const k=c.cloneNode(true);k.classList.add('clone');k.setAttribute('aria-hidden','true');k.querySelectorAll('button').forEach(b=>b.tabIndex=-1);track.appendChild(k)});
  }
  function wrap(){ if(setW){ x=((x%setW)-setW)%setW; } }
  function apply(){ track.style.transform=`translate3d(${x}px,0,0)`; }

  function collapse(){
    if(!openCard)return;
    openCard.classList.remove('open');
    const b=openCard.querySelector('.more'); if(b)b.textContent='Weiterlesen';
    openCard=null;
  }
  function toggle(card){
    if(openCard===card){collapse();return}
    collapse();
    card.classList.add('open'); card.querySelector('.more').textContent='Weniger anzeigen';
    openCard=card;
    // Karte vollständig ins Bild holen
    const mr=mq.getBoundingClientRect(), cr=card.getBoundingClientRect();
    const pad=40; let dx=0;
    if(cr.left<mr.left+pad)dx=mr.left+pad-cr.left; else if(cr.right>mr.right-pad)dx=mr.right-pad-cr.right;
    if(dx){track.style.transition='transform .45s ease';x+=dx;apply();setTimeout(()=>{track.style.transition='';wrap();apply()},460)}
  }
  track.addEventListener('click',e=>{const b=e.target.closest('.more'); if(b&&!mq.dataset.moved)toggle(b.closest('.review'))});

  // Wischen / Ziehen
  mq.addEventListener('pointerdown',e=>{if(e.button!==0)return;drag={sx:e.clientX,sy:e.clientY,x0:x,active:false,id:e.pointerId};delete mq.dataset.moved});
  mq.addEventListener('pointermove',e=>{
    if(!drag)return;
    const dx=e.clientX-drag.sx, dy=e.clientY-drag.sy;
    if(!drag.active){
      if(Math.abs(dx)>8&&Math.abs(dx)>Math.abs(dy)){drag.active=true;mq.dataset.moved='1';mq.classList.add('dragging');mq.setPointerCapture(drag.id);collapse();}
      else if(Math.abs(dy)>10){drag=null;return}
      else return;
    }
    x=drag.x0+dx;wrap();apply();
  });
  const end=()=>{if(drag&&drag.active){mq.classList.remove('dragging');last=performance.now();setTimeout(()=>delete mq.dataset.moved,0)}drag=null};
  mq.addEventListener('pointerup',end);mq.addEventListener('pointercancel',end);
  mq.addEventListener('wheel',e=>{if(Math.abs(e.deltaX)>Math.abs(e.deltaY)&&Math.abs(e.deltaX)>2){e.preventDefault();collapse();x-=e.deltaX;wrap();apply()}},{passive:false});
  mq.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse')hover=true});
  mq.addEventListener('pointerleave',()=>hover=false);

  function tick(now){
    const dt=Math.min(.05,(now-last)/1000);last=now;
    if(!reduced&&!openCard&&!drag&&!hover&&!document.hidden){x-=SPEED*dt;wrap();apply()}
    requestAnimationFrame(tick);
  }
  let rt;addEventListener('resize',()=>{clearTimeout(rt);rt=setTimeout(()=>{collapse();build();wrap();apply()},200)});
  build();apply();requestAnimationFrame(tick);
})();
/* Werk-Rad: Ring im Ruhezustand, beim Drehen eine senkrechte Trommel (Vanilla-Port von WorksWheel) */
(()=>{
  const root=document.getElementById('wheel'); if(!root)return;
  const stage=document.getElementById('wh-stage'), wheel=document.getElementById('wh-wheel');
  const cards=[...wheel.querySelectorAll('.wh-card')], faces=cards.map(c=>c.firstElementChild);
  const label=document.getElementById('wh-label'), title=document.getElementById('wh-title');
  const nameEl=document.getElementById('wh-name'), numEl=document.getElementById('wh-num'), hint=document.getElementById('wh-hint');
  const idxBtns=[...document.querySelectorAll('#wh-index button')];
  const names=cards.map(c=>c.querySelector('img').alt);
  const N=cards.length, LAST=N-1;
  const CARD_H=.38, CARD_MAX_W=.34, RATIO=1.4, STEP=40, DRUM=2.22, LENS=2.7, RING_R=1.14, BOW=1.82, CULL=1.6;
  const WHEEL_UNITS=900, DRAG_UNITS=420, SETTLE=140;
  const reduced=matchMedia('(prefers-reduced-motion: reduce)').matches, EASE=reduced?1:.12;
  const clamp=(v,a,b)=>Math.min(b,Math.max(a,v)), lerp=(a,b,t)=>a+(b-a)*t, rad=d=>d*Math.PI/180;
  let turn=0, target=0, active=-1, M={}, settle=0;

  function measure(){
    const w=stage.clientWidth,h=stage.clientHeight, mobile=w<760;
    const cardW=Math.min(h*CARD_H*RATIO*(mobile?1.05:1), w*(mobile?.72:CARD_MAX_W)), cardH=cardW/RATIO;
    const ringR=Math.min(cardH*RING_R,h*.34,w*(mobile?.37:.34));
    M={cardW,cardH,ringR,drumR:cardH*DRUM,bow:cardH*BOW*(mobile?.55:1),
       ringScale:clamp((2*Math.PI*ringR/N)*.82/cardW,.16,1)};
    stage.style.perspective=(cardH*LENS)+'px';
    cards.forEach(c=>{c.style.width=cardW+'px';c.style.height=cardH+'px';c.style.marginLeft=(-cardW/2)+'px';c.style.marginTop=(-cardH/2)+'px'});
    label.style.fontSize=Math.max(26,ringR*.26)+'px'; M.mobile=mobile;
    title.style.fontSize=Math.max(22,cardH*(mobile?.13:.14))+'px';
  }
  function place(ringDeg,drumDeg,m){
    const bowX=-M.bow*(1-Math.cos(rad(drumDeg)));
    return `translateX(${m*bowX}px) rotateZ(${(1-m)*ringDeg}deg) translateY(${-(1-m)*M.ringR}px) rotateX(${m*drumDeg}deg) translateZ(${m*M.drumR}px)`;
  }
  function draw(){
    requestAnimationFrame(draw);
    const gap=target-turn;
    if(Math.abs(gap)<.0005){ if(turn===target&&draw.done)return; turn=target; draw.done=true; } else { turn+=gap*EASE; draw.done=false; }
    const m=clamp(turn,0,1), pos=Math.max(0,turn-1);
    wheel.style.transform=`translateZ(${-m*M.drumR}px)`;
    wheel.style.top=(M.mobile?lerp(50,43,m):50)+'%';
    for(let i=0;i<N;i++){
      const d=i-pos, c=cards[i];
      c.style.transform=place(d*(360/N),d*STEP,m);
      c.style.opacity=(m>.5&&Math.abs(d)>CULL)?'0':'1';
      c.style.zIndex=String(Math.round(100-Math.abs(d)*2));
      faces[i].style.transform=`scale(${lerp(M.ringScale,1,m)})`;
    }
    label.style.opacity=String(1-m); title.style.opacity=String(m);
    hint.style.opacity=String(1-m);
    const near=clamp(Math.round(pos),0,LAST);
    if(near!==active){
      active=near; nameEl.textContent=names[near].replace(/verkleidung/g,'\u00ADverkleidung').replace('Werkstatt','Werk\u00ADstatt'); numEl.textContent=String(near+1).padStart(2,'0')+' / '+String(N).padStart(2,'0');
      idxBtns.forEach((b,i)=>b.classList.toggle('on',i===near));
      cards.forEach((c,i)=>c.setAttribute('aria-selected',i===near));
      stage.setAttribute('aria-activedescendant','wh-'+near);
    }
    cards.forEach((c,i)=>c.classList.toggle('front',m>.98&&i===near&&Math.abs(i-pos)<.05));
  }
  const to=v=>{target=clamp(v,0,LAST+1);draw.done=false};

  stage.addEventListener('wheel',e=>{
    const dy=Math.abs(e.deltaY)>=Math.abs(e.deltaX)?e.deltaY:e.deltaX;
    const next=target+dy/WHEEL_UNITS;
    if(next>0&&next<LAST+1)e.preventDefault(); else return;
    to(next); clearTimeout(settle); settle=setTimeout(()=>to(Math.round(target)),SETTLE);
  },{passive:false});

  // Maus: senkrecht ziehen. Touch: waagerecht wischen (senkrecht bleibt Seiten-Scroll).
  let drag=null;
  stage.addEventListener('pointerdown',e=>{if(e.button)return;drag={x:e.clientX,y:e.clientY,lx:e.clientX,ly:e.clientY,moved:0,touch:e.pointerType!=='mouse',card:e.target.closest('.wh-card'),id:e.pointerId,cap:false}});
  stage.addEventListener('pointermove',e=>{
    if(!drag)return;
    const d=drag.touch?(drag.lx-e.clientX)*1.4:(drag.ly-e.clientY);
    drag.moved+=Math.abs(e.clientX-drag.lx)+Math.abs(e.clientY-drag.ly);
    if(drag.touch&&Math.abs(e.clientY-drag.y)>Math.abs(e.clientX-drag.x)+6&&!drag.cap){drag=null;return}
    if(drag.moved>6&&!drag.cap){stage.setPointerCapture(drag.id);drag.cap=true}
    if(drag.cap)to(target+d/DRAG_UNITS);
    drag.lx=e.clientX;drag.ly=e.clientY;
  });
  const up=()=>{
    if(!drag)return;
    if(drag.moved<=6&&drag.card){
      const i=+drag.card.dataset.i;
      if(drag.card.classList.contains('front'))openLightbox(i); else to(i+1);
    } else to(Math.round(target));
    drag=null;
  };
  stage.addEventListener('pointerup',up); stage.addEventListener('pointercancel',()=>{drag=null;to(Math.round(target))});
  stage.addEventListener('keydown',e=>{
    if(e.key==='ArrowDown'||e.key==='ArrowRight')to(Math.round(target)+1);
    else if(e.key==='ArrowUp'||e.key==='ArrowLeft')to(Math.round(target)-1);
    else if(e.key==='Enter'&&target>=1)openLightbox(active);
    else return; e.preventDefault();
  });
  idxBtns.forEach(b=>b.addEventListener('click',()=>to(+b.dataset.i+1)));
  document.getElementById('wh-next').addEventListener('click',()=>to(Math.round(target)+1));
  document.getElementById('wh-prev').addEventListener('click',()=>to(Math.round(target)-1));

  function openLightbox(i){const lb=document.getElementById('lightbox'),img=cards[i].querySelector('img');lb.querySelector('img').src=img.src;lb.querySelector('p').textContent=img.alt;lb.showModal()}

  new ResizeObserver(()=>{measure();draw.done=false}).observe(stage);
  if(matchMedia('(pointer:coarse)').matches)hint.querySelector('span').textContent='Seitlich wischen, um das Rad zu drehen';
  measure(); requestAnimationFrame(draw);
})();
const lb=document.getElementById('lightbox');
document.querySelectorAll('.gallery figure').forEach(f=>f.addEventListener('click',()=>{const i=f.querySelector('img');lb.querySelector('img').src=i.src;lb.querySelector('p').textContent=i.alt;lb.showModal()}));
const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.12});
document.querySelectorAll('.reveal').forEach(el=>io.observe(el));
