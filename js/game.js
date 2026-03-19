// ============================================================
//  Diego's Adventure — game.js  (9/16 = 360x640)
// ============================================================
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W = 360, H = 640;
canvas.width = W; canvas.height = H;

// Les étoiles sont placées de BAS en HAUT dans l'ordre des lettres
// pour que Diego les collecte dans l'ordre en montant
const LEVELS = [
  {
    name:'GLACE', bgTop:'#b3e8ff', bgBot:'#d0f0ff',
    groundColor:'#aacfdf', platColor:'#8ec8e8', platBorder:'#5ab0d0',
    decorType:'ice', word:'IGLOO', letters:['I','G','L','O','O'],
    hint:'Un abri esquimau dans la neige',
    platforms:[
      {x:0,  y:560,w:220,h:16}, {x:180,y:490,w:160,h:16},
      {x:20, y:420,w:160,h:16}, {x:190,y:350,w:160,h:16},
      {x:20, y:280,w:160,h:16}, {x:190,y:210,w:160,h:16},
      {x:60, y:140,w:240,h:16},
    ],
    // étoile 1=I (bas), 2=G, 3=L, 4=O, 5=O (haut)
    stars:[
      {x:110,y:520}, {x:260,y:450}, {x:100,y:380},
      {x:270,y:310}, {x:180,y:100},
    ],
  },
  {
    name:'EAU', bgTop:'#0a3a6e', bgBot:'#1a6ea8',
    groundColor:'#0e4a7a', platColor:'#1a7090', platBorder:'#30b8cc',
    decorType:'water', word:'OCEAN', letters:['O','C','E','A','N'],
    hint:'Grande etendue d\'eau salee',
    platforms:[
      {x:0,  y:560,w:200,h:16}, {x:170,y:490,w:170,h:16},
      {x:20, y:420,w:160,h:16}, {x:190,y:350,w:160,h:16},
      {x:20, y:280,w:160,h:16}, {x:190,y:210,w:160,h:16},
      {x:60, y:140,w:240,h:16},
    ],
    stars:[
      {x:100,y:520}, {x:255,y:450}, {x:100,y:380},
      {x:270,y:310}, {x:180,y:100},
    ],
  },
  {
    name:'TERRE', bgTop:'#3a6e28', bgBot:'#1e4010',
    groundColor:'#4a3010', platColor:'#6a4818', platBorder:'#9a7030',
    decorType:'earth', word:'ARBRE', letters:['A','R','B','R','E'],
    hint:'Il pousse vers le soleil',
    platforms:[
      {x:0,  y:560,w:210,h:16}, {x:170,y:490,w:170,h:16},
      {x:20, y:420,w:160,h:16}, {x:185,y:350,w:160,h:16},
      {x:20, y:280,w:160,h:16}, {x:185,y:210,w:160,h:16},
      {x:60, y:140,w:240,h:16},
    ],
    stars:[
      {x:105,y:520}, {x:250,y:450}, {x:100,y:380},
      {x:265,y:310}, {x:180,y:100},
    ],
  },
  {
    name:'FEU', bgTop:'#3a0a00', bgBot:'#6a1800',
    groundColor:'#4a1000', platColor:'#8a2800', platBorder:'#ff5500',
    decorType:'fire', word:'BRAVO', letters:['B','R','A','V','O'],
    hint:'Tu as tout reussi Diego !',
    platforms:[
      {x:0,  y:560,w:200,h:16}, {x:175,y:490,w:165,h:16},
      {x:20, y:420,w:160,h:16}, {x:185,y:350,w:160,h:16},
      {x:20, y:280,w:160,h:16}, {x:185,y:210,w:160,h:16},
      {x:60, y:140,w:240,h:16},
    ],
    // B=bas R G A V O=haut — collectable de bas en haut
    stars:[
      {x:100,y:520}, {x:255,y:450}, {x:100,y:380},
      {x:265,y:310}, {x:180,y:100},
    ],
  },
];

// ── ÉTAT ────────────────────────────────────────────────────
let currentLevel=0, collectedLetters=[], starsCollected=0;
let gameState='waiting', stars=[], particles=[], cameraY=0;

const GROUND_Y = 576;
const player = {x:60,y:520,w:28,h:32,vx:0,vy:0,onGround:false,facing:1,frame:0,ft:0};
const GRAVITY=0.55, JUMP=-13;
const keys={};

// ── CLAVIER ─────────────────────────────────────────────────
window.addEventListener('keydown', e=>{
  if (gameState!=='playing') return;
  keys[e.code]=true;
  if(['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e=>{ keys[e.code]=false; });

// ── PAD TACTILE UNIQUE ───────────────────────────────────────
// Position X du doigt → vitesse et direction
// Moitié gauche = gauche, moitié droite = droite
// Tap rapide au centre (< 200ms) = saut
const pad = document.getElementById('touch-pad');
const padCursor = document.getElementById('pad-cursor');
let padActive=false, padX=0, padTapStart=0;
const PAD_MAX_SPEED = 8.5; // vitesse max en bord de pad

function padToSpeed(clientX) {
  const rect = pad.getBoundingClientRect();
  const cx = rect.left + rect.width / 2;
  const half = rect.width / 2;
  const dx = clientX - cx;               // négatif=gauche, positif=droite
  const ratio = Math.max(-1, Math.min(1, dx / half)); // -1..1
  return ratio; // on mulitplie par PAD_MAX_SPEED dans update()
}

pad.addEventListener('pointerdown', e=>{
  e.preventDefault();
  if (gameState!=='playing') return;
  padActive=true; padX=e.clientX;
  padCursor.style.display='block';
  updateCursor(e);
  pad.setPointerCapture(e.pointerId);
  // Saut immédiat au toucher — direction lue en continu pendant le saut
  if (player.onGround) { player.vy=JUMP; player.onGround=false; }
});
pad.addEventListener('pointermove', e=>{
  if (!padActive) return;
  e.preventDefault();
  padX = e.clientX;
  updateCursor(e);
});
pad.addEventListener('pointerup', e=>{
  e.preventDefault();
  padActive=false;
  padCursor.style.display='none';
});
pad.addEventListener('pointercancel', ()=>{
  padActive=false;
  padCursor.style.display='none';
});

function updateCursor(e) {
  const rect = pad.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  padCursor.style.left = x+'px';
  padCursor.style.top  = y+'px';
}

// ── START ────────────────────────────────────────────────────
const VERSION = 'v1.5';

function startGame() {
  document.getElementById('start-screen').style.display='none';
  initAudio(); gameState='playing';
  initLevel(); createMuteButton(); loop();
}

// ── INIT NIVEAU ─────────────────────────────────────────────
function initLevel() {
  player.x=60; player.y=520; player.vx=0; player.vy=0;
  collectedLetters=[]; starsCollected=0; particles=[]; cameraY=0;
  Object.keys(keys).forEach(k=>keys[k]=false);
  stars=LEVELS[currentLevel].stars.map((s,i)=>({
    x:s.x,y:s.y,letter:LEVELS[currentLevel].letters[i],
    collected:false,pulse:Math.random()*Math.PI*2,
  }));
  updateUI(); startMusic(currentLevel);
}

// ── UPDATE ───────────────────────────────────────────────────
function update() {
  if (gameState!=='playing') return;
  const lvl=LEVELS[currentLevel];

  // Vitesse depuis pad tactile — direction active en l'air aussi
  let speed = 0;
  if (padActive) {
    const ratio = padToSpeed(padX);
    if (Math.abs(ratio) > 0.04) {
      speed = ratio * PAD_MAX_SPEED;
      player.facing = ratio>0?1:-1;
    }
  }
  // Clavier physique override
  if      (keys['ArrowLeft'] ||keys['KeyA']) { speed=-PAD_MAX_SPEED; player.facing=-1; }
  else if (keys['ArrowRight']||keys['KeyD']) { speed= PAD_MAX_SPEED; player.facing= 1; }
  if ((keys['Space']||keys['ArrowUp']) && player.onGround) {
    player.vy=JUMP; player.onGround=false;
  }

  player.vx = speed===0 ? player.vx*0.72 : speed;
  player.vy = Math.min(player.vy+GRAVITY, 18);
  player.x += player.vx;
  player.y += player.vy;
  player.x = Math.max(0, Math.min(W-player.w, player.x));

  // Collision plateformes
  player.onGround=false;
  for (const p of lvl.platforms) {
    if (player.x+player.w>p.x && player.x<p.x+p.w &&
        player.y+player.h>p.y && player.y+player.h<p.y+28 && player.vy>=0) {
      player.y=p.y-player.h; player.vy=0; player.onGround=true;
    }
  }
  if (player.y+player.h>=GROUND_Y) {
    player.y=GROUND_Y-player.h; player.vy=0; player.onGround=true;
  }
  if (player.y>H+100) { player.x=60; player.y=520; player.vy=0; }

  // Caméra verticale
  const ty=player.y-H*0.65;
  cameraY+=(ty-cameraY)*0.1;
  if (cameraY>0) cameraY=0;

  // Étoiles
  for (const s of stars) {
    s.pulse+=0.07;
    if (s.collected) continue;
    const dx=player.x+player.w/2-s.x, dy=player.y+player.h/2-s.y;
    if (Math.sqrt(dx*dx+dy*dy)<26) {
      s.collected=true; collectedLetters.push(s.letter); starsCollected++;
      spawnParticles(s.x, s.y-cameraY, '#ffd700');
      updateUI();
      if (starsCollected>=5) setTimeout(showOverlay,300);
    }
  }

  particles=particles.filter(p=>p.life-->0);
  particles.forEach(p=>{p.x+=p.vx;p.y+=p.vy;p.vy+=0.15;});
  if(++player.ft>8){player.frame=(player.frame+1)%2;player.ft=0;}
}

// ── PARTICULES ───────────────────────────────────────────────
function spawnParticles(x,y,color){
  for(let i=0;i<12;i++) particles.push({
    x,y,vx:(Math.random()-.5)*5,vy:(Math.random()-.5)*5-2,
    life:35,maxLife:35,color,size:3+Math.random()*3,
  });
}

// ── DRAW ────────────────────────────────────────────────────
function draw(){
  ctx.clearRect(0,0,W,H);
  ctx.save(); ctx.translate(0,-cameraY);
  drawBg(); drawDecors(); drawGround(); drawPlatforms();
  drawStars(); drawParticles(); drawPlayer();
  ctx.restore(); drawHUD();
}

function drawBg(){
  const lvl=LEVELS[currentLevel];
  const g=ctx.createLinearGradient(0,cameraY,0,cameraY+H);
  g.addColorStop(0,lvl.bgTop); g.addColorStop(1,lvl.bgBot);
  ctx.fillStyle=g; ctx.fillRect(0,cameraY,W,H);
}
function drawGround(){
  const lvl=LEVELS[currentLevel];
  ctx.fillStyle=lvl.groundColor; ctx.fillRect(0,GROUND_Y+32,W,80);
  ctx.fillStyle=lvl.platBorder;  ctx.fillRect(0,GROUND_Y+32,W,4);
}
function drawPlatforms(){
  const lvl=LEVELS[currentLevel];
  for(const p of lvl.platforms){
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(p.x+4,p.y+6,p.w,12);
    ctx.fillStyle=lvl.platColor;     ctx.fillRect(p.x,p.y,p.w,p.h);
    ctx.fillStyle=lvl.platBorder;    ctx.fillRect(p.x,p.y,p.w,4);
    ctx.fillStyle='rgba(255,255,255,0.1)';
    for(let bx=p.x+8;bx<p.x+p.w-8;bx+=22) ctx.fillRect(bx,p.y+6,12,5);
  }
}
function drawStars(){
  for(const s of stars){
    if(s.collected) continue;
    const p=1+Math.sin(s.pulse)*.12, r=16*p;
    ctx.save(); ctx.globalAlpha=.25+Math.sin(s.pulse)*.1;
    ctx.fillStyle='#ffd700'; ctx.beginPath(); ctx.arc(s.x,s.y,r+7,0,Math.PI*2); ctx.fill();
    ctx.restore();
    drawStarShape(s.x,s.y,r*.5,r,'#ffd700','#ffec5c');
    ctx.save(); ctx.fillStyle='#2a0a00';
    ctx.font=`bold ${13*p}px Courier New`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(s.letter,s.x,s.y); ctx.restore();
  }
}
function drawStarShape(cx,cy,r1,r2,c1,c2){
  const g=ctx.createRadialGradient(cx,cy-r2*.2,0,cx,cy,r2);
  g.addColorStop(0,c2); g.addColorStop(1,c1);
  ctx.fillStyle=g; ctx.beginPath();
  for(let i=0;i<10;i++){
    const r=i%2===0?r2:r1,a=i*Math.PI/5-Math.PI/2;
    i===0?ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#ffec5c'; ctx.lineWidth=1.5; ctx.stroke();
}
function drawParticles(){
  for(const p of particles){
    ctx.save(); ctx.globalAlpha=p.life/p.maxLife; ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x,p.y+cameraY,p.size*(p.life/p.maxLife),0,Math.PI*2);
    ctx.fill(); ctx.restore();
  }
}
function drawPlayer(){
  const {x,y,w,h,facing,frame,onGround,vx}=player;
  ctx.save(); ctx.translate(x+w/2,y+h/2); ctx.scale(facing,1);
  ctx.fillStyle='#cc1111'; ctx.fillRect(-w/2,-h/2,w,h);
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(-w/2,-h/2,w*.4,h*.5);
  ctx.fillStyle='#fff'; ctx.fillRect(3,-h/2+5,7,7);
  ctx.fillStyle='#111'; ctx.fillRect(5+(frame?1:0),-h/2+7,4,4);
  ctx.fillStyle='#880000'; ctx.fillRect(2,-h/2+16,9,3);
  const lo=onGround&&Math.abs(vx)>.5?(frame?3:-3):0;
  ctx.fillStyle='#aa0a0a';
  ctx.fillRect(-w/2,h/2-8,9,8+lo); ctx.fillRect(w/2-9,h/2-8,9,8-lo);
  ctx.restore();
}
function drawDecors(){
  const t=LEVELS[currentLevel].decorType;
  ctx.save();
  if(t==='ice')   drawIce();
  if(t==='water') drawWater();
  if(t==='earth') drawEarth();
  if(t==='fire')  drawFire();
  ctx.restore();
}
function drawIce(){
  ctx.fillStyle='rgba(180,225,255,0.4)';
  [50,140,240,330].forEach(x=>{
    ctx.beginPath();ctx.moveTo(x,cameraY);ctx.lineTo(x-13,cameraY+50);ctx.lineTo(x+13,cameraY+50);ctx.closePath();ctx.fill();
  });
  ctx.strokeStyle='rgba(200,240,255,0.75)'; ctx.lineWidth=1.5;
  [80,180,280,340].forEach(x=>{
    const y=cameraY+35+Math.sin(x*.02+Date.now()*.001)*18;
    ctx.save(); ctx.translate(x,y);
    for(let i=0;i<6;i++){ctx.beginPath();ctx.moveTo(0,0);ctx.lineTo(0,-9);ctx.stroke();ctx.rotate(Math.PI/3);}
    ctx.restore();
  });
}
function drawWater(){
  [60,180,300].forEach(x=>{
    ctx.strokeStyle='rgba(38,180,100,0.6)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x,GROUND_Y+32);
    for(let i=0;i<5;i++) ctx.lineTo(x+Math.sin(i*1.2+Date.now()*.001)*11,GROUND_Y+32-i*14);
    ctx.stroke();
  });
  [110,230,340].forEach(x=>{
    const by=cameraY+55+Math.sin(Date.now()*.0012+x*.01)*28;
    ctx.strokeStyle='rgba(120,210,255,0.4)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(x,by,7,0,Math.PI*2); ctx.stroke();
  });
}
function drawEarth(){
  [45,170,300].forEach(x=>{
    ctx.fillStyle='#4a2008'; ctx.fillRect(x-5,GROUND_Y+32-48,10,48);
    ctx.fillStyle='rgba(35,110,35,0.8)'; ctx.beginPath(); ctx.arc(x,GROUND_Y+32-58,25,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(55,150,55,0.55)';
    ctx.beginPath(); ctx.arc(x-15,GROUND_Y+32-46,17,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+16,GROUND_Y+32-48,15,0,Math.PI*2); ctx.fill();
  });
  [120,245,350].forEach(x=>{
    ctx.fillStyle='#bb2020'; ctx.beginPath(); ctx.arc(x,GROUND_Y+32-16,12,Math.PI,0); ctx.fill();
    ctx.fillStyle='#fff'; ctx.fillRect(x-4,GROUND_Y+32-16,8,15);
  });
}
function drawFire(){
  [55,180,305].forEach(x=>{
    const f=Math.sin(Date.now()*.007+x*.01)*7;
    const g=ctx.createRadialGradient(x,GROUND_Y+32-8,0,x,GROUND_Y+32,18+f);
    g.addColorStop(0,'#ff8800'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(x,GROUND_Y+32-(13+f)*.4,(11+f)*.4,13+f,0,0,Math.PI*2); ctx.fill();
  });
  [90,220,330].forEach(x=>{
    const by=cameraY+70+Math.abs(Math.sin(Date.now()*.0015+x*.012))*90;
    ctx.fillStyle=`rgba(255,${80+Math.random()*70|0},0,0.7)`;
    ctx.beginPath(); ctx.arc(x,by,2.5,0,Math.PI*2); ctx.fill();
  });
}

// ── HUD ──────────────────────────────────────────────────────
function drawHUD(){
  ctx.fillStyle='rgba(0,0,0,0.45)'; ctx.fillRect(0,0,W,28);
  ctx.fillStyle='#ffd700'; ctx.font='bold 12px Courier New';
  ctx.textAlign='left';  ctx.fillText(`Niv.${currentLevel+1} ${LEVELS[currentLevel].name}`,8,19);
  ctx.textAlign='right'; ctx.fillText(`⭐${starsCollected}/5`,W-8,19);
}
function updateUI(){
  const lvl=LEVELS[currentLevel];
  document.getElementById('ui-level').textContent=currentLevel+1;
  document.getElementById('ui-levelname').textContent=lvl.name;
  document.getElementById('ui-stars').textContent=`${starsCollected}/5`;
  const s=Array(5).fill('_'); collectedLetters.forEach((l,i)=>s[i]=l);
  document.getElementById('ui-letters').textContent=s.join(' ');
}

// ── INPUT NATIF & OVERLAY ────────────────────────────────────
function showOverlay(){
  gameState='overlay';
  Object.keys(keys).forEach(k=>keys[k]=false);
  const lvl=LEVELS[currentLevel];
  document.getElementById('overlay-title').textContent='Niveau '+(currentLevel+1)+' termine !';
  document.getElementById('overlay-hint').textContent='Indice : '+lvl.hint;
  document.getElementById('overlay-error').textContent='';
  document.getElementById('overlay-letters').innerHTML=
    collectedLetters.map(l=>'<div class="letter-slot found">'+l+'</div>').join('');
  const inp=document.getElementById('native-input');
  if(inp){ inp.value=''; }
  document.getElementById('validate-btn').disabled=false;
  document.getElementById('message-overlay').classList.add('active');
  // Focus input apres un court delai (iOS a besoin de ca)
  setTimeout(()=>{ if(inp) inp.focus(); }, 200);
}

window.checkAnswer=function(){
  const lvl=LEVELS[currentLevel];
  const inp=document.getElementById('native-input');
  const typed=(inp?inp.value:'').trim().toUpperCase();
  if(typed===lvl.word){
    document.getElementById('message-overlay').classList.remove('active');
    if(inp) inp.blur();
    if(currentLevel<LEVELS.length-1){ currentLevel++; initLevel(); gameState='playing'; }
    else showWin();
  } else {
    document.getElementById('overlay-error').textContent='Pas le bon mot !';
    if(inp){ inp.value=''; inp.focus(); }
  }
};

function showWin(){
  document.getElementById('overlay-title').textContent='Bravo Diego !';
  document.getElementById('overlay-letters').innerHTML=
    ['B','R','A','V','O'].map(l=>'<div class="letter-slot found">'+l+'</div>').join('');
  document.getElementById('overlay-hint').textContent='Tu as tout reussi !';
  const inp=document.getElementById('native-input');
  if(inp) inp.style.display='none';
  const btn=document.getElementById('validate-btn');
  btn.disabled=false; btn.textContent='Rejouer';
  btn.onclick=()=>{
    if(inp){ inp.style.display=''; inp.value=''; }
    btn.textContent='VALIDER →'; btn.onclick=window.checkAnswer;
    document.getElementById('message-overlay').classList.remove('active');
    currentLevel=0; initLevel(); gameState='playing';
  };
}

// ── START SCREEN iOS fix ──────────────────────────────────────
document.addEventListener('DOMContentLoaded', ()=>{
  const btn = document.getElementById('play-btn');
  if (!btn) return;
  let started = false;
  function doStart(e) {
    if (started) return; started = true;
    e.preventDefault(); e.stopPropagation();
    startGame();
  }
  // Un seul listener sur le vrai bouton — iOS respecte le geste sur <button>
  btn.addEventListener('touchend', doStart, {passive:false});
  btn.addEventListener('click',    doStart);
});

// ── BOUCLE ───────────────────────────────────────────────────
function loop(){ update(); draw(); requestAnimationFrame(loop); }
