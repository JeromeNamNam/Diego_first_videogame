// ============================================================
//  Diego's Adventure — game.js  v1.7
//  9/16 = 360x640 | carte 4x verticale | pièces | timer
// ============================================================
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W = 360, H = 640;
canvas.width = W; canvas.height = H;

// Hauteur totale du monde (4x l'écran)
const WORLD_H = H * 4; // 2560px

const LEVELS = [
  {
    name:'GLACE', bgTop:'#b3e8ff', bgBot:'#8ecfef',
    groundColor:'#aacfdf', platColor:'#8ec8e8', platBorder:'#5ab0d0',
    decorType:'ice', word:'IGLOO', letters:['I','G','L','O','O'],
    hint:'Un abri esquimau dans la neige',
    platforms:[
      {x:0,   y:WORLD_H-80, w:360,h:16}, // sol
      {x:20,  y:2200,w:160,h:16}, {x:190,y:2100,w:160,h:16},
      {x:20,  y:1950,w:160,h:16}, {x:190,y:1850,w:160,h:16},
      {x:20,  y:1700,w:160,h:16}, {x:190,y:1600,w:160,h:16},
      {x:20,  y:1450,w:160,h:16}, {x:190,y:1350,w:160,h:16},
      {x:20,  y:1200,w:160,h:16}, {x:190,y:1100,w:160,h:16},
      {x:20,  y:950, w:160,h:16}, {x:190,y:850, w:160,h:16},
      {x:20,  y:700, w:160,h:16}, {x:190,y:600, w:160,h:16},
      {x:60,  y:430, w:240,h:16}, {x:60, y:250, w:240,h:16},
      {x:80,  y:100, w:200,h:16},
    ],
    stars:[
      {x:100,y:WORLD_H-120}, {x:260,y:2060},
      {x:100,y:1810},        {x:260,y:1310},
      {x:180,y:60},
    ],
  },
  {
    name:'EAU', bgTop:'#0a3a6e', bgBot:'#0d5a9a',
    groundColor:'#0e4a7a', platColor:'#1a7090', platBorder:'#30b8cc',
    decorType:'water', word:'OCEAN', letters:['O','C','E','A','N'],
    hint:"Grande etendue d'eau salee",
    platforms:[
      {x:0,   y:WORLD_H-80, w:360,h:16},
      {x:190,y:2200,w:160,h:16}, {x:20, y:2080,w:160,h:16},
      {x:190,y:1930,w:160,h:16}, {x:20, y:1800,w:160,h:16},
      {x:190,y:1650,w:160,h:16}, {x:20, y:1520,w:160,h:16},
      {x:190,y:1370,w:160,h:16}, {x:20, y:1220,w:160,h:16},
      {x:190,y:1070,w:160,h:16}, {x:20, y:920, w:160,h:16},
      {x:190,y:770, w:160,h:16}, {x:20, y:630, w:160,h:16},
      {x:60, y:460, w:240,h:16}, {x:60, y:270, w:240,h:16},
      {x:80, y:100, w:200,h:16},
    ],
    stars:[
      {x:260,y:WORLD_H-120}, {x:100,y:2040},
      {x:260,y:1760},        {x:100,y:1180},
      {x:180,y:60},
    ],
  },
  {
    name:'TERRE', bgTop:'#3a6e28', bgBot:'#244a14',
    groundColor:'#4a3010', platColor:'#6a4818', platBorder:'#9a7030',
    decorType:'earth', word:'ARBRE', letters:['A','R','B','R','E'],
    hint:'Il pousse vers le soleil',
    platforms:[
      {x:0,   y:WORLD_H-80, w:360,h:16},
      {x:20,  y:2200,w:160,h:16}, {x:190,y:2070,w:160,h:16},
      {x:20,  y:1930,w:160,h:16}, {x:190,y:1800,w:160,h:16},
      {x:20,  y:1650,w:160,h:16}, {x:190,y:1510,w:160,h:16},
      {x:20,  y:1360,w:160,h:16}, {x:190,y:1210,w:160,h:16},
      {x:20,  y:1060,w:160,h:16}, {x:190,y:910, w:160,h:16},
      {x:20,  y:760, w:160,h:16}, {x:190,y:620, w:160,h:16},
      {x:60,  y:460, w:240,h:16}, {x:60, y:270, w:240,h:16},
      {x:80,  y:100, w:200,h:16},
    ],
    stars:[
      {x:100,y:WORLD_H-120}, {x:260,y:2030},
      {x:100,y:1760},        {x:260,y:1170},
      {x:180,y:60},
    ],
  },
  {
    name:'FEU', bgTop:'#3a0a00', bgBot:'#6a1800',
    groundColor:'#4a1000', platColor:'#8a2800', platBorder:'#ff5500',
    decorType:'fire', word:'BRAVO', letters:['B','R','A','V','O'],
    hint:'Tu as tout reussi Diego !',
    platforms:[
      {x:0,   y:WORLD_H-80, w:360,h:16},
      {x:190,y:2200,w:160,h:16}, {x:20, y:2060,w:160,h:16},
      {x:190,y:1920,w:160,h:16}, {x:20, y:1780,w:160,h:16},
      {x:190,y:1640,w:160,h:16}, {x:20, y:1490,w:160,h:16},
      {x:190,y:1350,w:160,h:16}, {x:20, y:1200,w:160,h:16},
      {x:190,y:1060,w:160,h:16}, {x:20, y:910, w:160,h:16},
      {x:190,y:770, w:160,h:16}, {x:20, y:620, w:160,h:16},
      {x:60, y:460, w:240,h:16}, {x:60, y:270, w:240,h:16},
      {x:80, y:100, w:200,h:16},
    ],
    stars:[
      {x:260,y:WORLD_H-120}, {x:100,y:2020},
      {x:260,y:1740},        {x:100,y:1160},
      {x:180,y:60},
    ],
  },
];

// ── ÉTAT ────────────────────────────────────────────────────
let currentLevel=0, collectedLetters=[], starsCollected=0;
let gameState='waiting', stars=[], particles=[], cameraY=0;
let coins=[], coinsCollected=0, coinSpawnTimer=0;
let timeLeft=60, timerInterval=null;

const GROUND_Y = WORLD_H - 80;
const player = {x:60, y:WORLD_H-120, w:28,h:32,vx:0,vy:0,onGround:false,facing:1,frame:0,ft:0};
const GRAVITY=0.55, JUMP=-13;
const keys={};

// ── CLAVIER ─────────────────────────────────────────────────
window.addEventListener('keydown', e=>{
  if (gameState!=='playing') return;
  keys[e.code]=true;
  if(['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e=>{ keys[e.code]=false; });

// ── PAD TACTILE ──────────────────────────────────────────────
const pad = document.getElementById('touch-pad');
const padCursor = document.getElementById('pad-cursor');
let padActive=false, padX=0;
const PAD_MAX_SPEED = 8.5;

function padRatio(clientX) {
  const rect = pad.getBoundingClientRect();
  const dx = clientX - (rect.left + rect.width/2);
  return Math.max(-1, Math.min(1, dx / (rect.width/2)));
}
pad.addEventListener('pointerdown', e=>{
  e.preventDefault();
  if (gameState!=='playing') return;
  padActive=true; padX=e.clientX;
  padCursor.style.display='block'; updateCursor(e);
  pad.setPointerCapture(e.pointerId);
  if (player.onGround) { player.vy=JUMP; player.onGround=false; }
});
pad.addEventListener('pointermove', e=>{
  if (!padActive) return; e.preventDefault();
  padX=e.clientX; updateCursor(e);
});
pad.addEventListener('pointerup',     ()=>{ padActive=false; padCursor.style.display='none'; });
pad.addEventListener('pointercancel', ()=>{ padActive=false; padCursor.style.display='none'; });
function updateCursor(e){
  const r=pad.getBoundingClientRect();
  padCursor.style.left=(e.clientX-r.left)+'px';
  padCursor.style.top=(e.clientY-r.top)+'px';
}

// ── MUSIQUE iOS ──────────────────────────────────────────────
// Le canvas lui-même reçoit le premier touch → unlock audio
canvas.addEventListener('pointerdown', ()=>{
  initAudio(); if(!musicPlaying) startMusic(currentLevel);
}, {once:true});

// ── START ────────────────────────────────────────────────────
function startGame() {
  document.getElementById('start-screen').style.display='none';
  initAudio();
  gameState='playing';
  initLevel(); createMuteButton(); loop();
}

// ── TIMER ────────────────────────────────────────────────────
function startTimer() {
  timeLeft = 60;
  clearInterval(timerInterval);
  timerInterval = setInterval(()=>{
    if (gameState!=='playing') return;
    timeLeft--;
    if (timeLeft <= 0) {
      timeLeft = 0;
      clearInterval(timerInterval);
      // Temps écoulé → respawn au bas du niveau
      player.x=60; player.y=WORLD_H-120; player.vx=0; player.vy=0; cameraY=0;
      timeLeft=60;
      startTimer();
    }
  }, 1000);
}

// ── PIÈCES D'OR ──────────────────────────────────────────────
function spawnCoin() {
  coins.push({
    x: 20 + Math.random()*(W-40),
    y: cameraY - 20,          // juste au-dessus de l'écran
    vy: 0,
    vx: (Math.random()-0.5)*1.2,
    onPlat: false,
    life: 600,                // disparaît après ~10s
    pulse: Math.random()*Math.PI*2,
  });
}

function updateCoins() {
  coinSpawnTimer++;
  if (coinSpawnTimer >= 60) { coinSpawnTimer=0; spawnCoin(); } // 1 par seconde

  const lvl = LEVELS[currentLevel];
  for (const c of coins) {
    if (c.onPlat) {
      // Glisse sur la plateforme avec friction
      c.vx *= 0.96;
      c.x  += c.vx;
      // Vérifier si toujours sur une plateforme
      let still = false;
      for (const p of lvl.platforms) {
        if (c.x>p.x && c.x<p.x+p.w && Math.abs(c.y-p.y)<4) { still=true; break; }
      }
      if (!still) { c.onPlat=false; } // tombe dans le vide
    } else {
      c.vy += GRAVITY * 0.7;
      c.y  += c.vy;
      c.x  += c.vx;
      // Collision plateformes
      for (const p of lvl.platforms) {
        if (c.x>p.x && c.x<p.x+p.w && c.y>p.y-4 && c.y<p.y+10 && c.vy>0) {
          c.y=p.y; c.vy *= -0.25; c.onPlat=true; break;
        }
      }
      // Sol
      if (c.y >= GROUND_Y) { c.y=GROUND_Y; c.vy*=-0.2; c.onPlat=true; }
    }
    c.pulse += 0.08;
    c.life--;
    // Disparaît si hors écran ou vie écoulée
    if (c.x<-20||c.x>W+20) c.life=0;

    // Collecte par joueur
    if (!c.collected) {
      const dx=player.x+player.w/2-c.x, dy=player.y+player.h/2-c.y;
      if (Math.sqrt(dx*dx+dy*dy)<22) {
        c.collected=true; c.life=0;
        coinsCollected++;
        spawnParticles(c.x, c.y-cameraY, '#ffd700');
        updateUI();
      }
    }
  }
  coins = coins.filter(c=>c.life>0 && !c.collected);
}

// ── INIT NIVEAU ─────────────────────────────────────────────
function initLevel() {
  const lvl = LEVELS[currentLevel];
  player.x=60; player.y=WORLD_H-120; player.vx=0; player.vy=0;
  collectedLetters=[]; starsCollected=0; particles=[];
  coins=[]; coinsCollected=0; coinSpawnTimer=0; cameraY=WORLD_H-H;
  Object.keys(keys).forEach(k=>keys[k]=false);
  stars=lvl.stars.map((s,i)=>({
    x:s.x,y:s.y,letter:lvl.letters[i],collected:false,pulse:Math.random()*Math.PI*2,
  }));
  updateUI(); startTimer(); startMusic(currentLevel);
}

// ── UPDATE ───────────────────────────────────────────────────
function update() {
  if (gameState!=='playing') return;
  const lvl=LEVELS[currentLevel];

  // Direction pad
  let speed=0;
  if (padActive) {
    const r=padRatio(padX);
    if (Math.abs(r)>0.04) { speed=r*PAD_MAX_SPEED; player.facing=r>0?1:-1; }
  }
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

  // Collisions plateformes
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
  // Tombe dans le vide → respawn
  if (player.y>WORLD_H+100) { player.x=60; player.y=WORLD_H-120; player.vy=0; }

  // Caméra verticale — suit le joueur
  const ty = player.y - H*0.65;
  cameraY += (ty-cameraY)*0.1;
  cameraY = Math.max(0, Math.min(WORLD_H-H, cameraY));

  // Étoiles
  for (const s of stars) {
    s.pulse+=0.07;
    if (s.collected) continue;
    const dx=player.x+player.w/2-s.x, dy=player.y+player.h/2-s.y;
    if (Math.sqrt(dx*dx+dy*dy)<26) {
      s.collected=true; collectedLetters.push(s.letter); starsCollected++;
      spawnParticles(s.x, s.y-cameraY, '#ffd700');
      updateUI();
      if (starsCollected>=5) { clearInterval(timerInterval); setTimeout(showOverlay,300); }
    }
  }

  updateCoins();

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
  drawCoins(); drawStars(); drawParticles(); drawPlayer();
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
  ctx.fillStyle=lvl.groundColor; ctx.fillRect(0,GROUND_Y+16,W,WORLD_H-GROUND_Y);
  ctx.fillStyle=lvl.platBorder;  ctx.fillRect(0,GROUND_Y+16,W,4);
}
function drawPlatforms(){
  const lvl=LEVELS[currentLevel];
  for(const p of lvl.platforms){
    // Culling — ne dessiner que si visible
    if(p.y+30<cameraY || p.y>cameraY+H) continue;
    ctx.fillStyle='rgba(0,0,0,0.2)'; ctx.fillRect(p.x+4,p.y+6,p.w,12);
    ctx.fillStyle=lvl.platColor;     ctx.fillRect(p.x,p.y,p.w,p.h);
    ctx.fillStyle=lvl.platBorder;    ctx.fillRect(p.x,p.y,p.w,4);
    ctx.fillStyle='rgba(255,255,255,0.1)';
    for(let bx=p.x+8;bx<p.x+p.w-8;bx+=22) ctx.fillRect(bx,p.y+6,12,5);
  }
}

// Pièces d'or
function drawCoins(){
  for(const c of coins){
    if(c.y<cameraY-20||c.y>cameraY+H+20) continue;
    const pulse=1+Math.sin(c.pulse)*.1, r=8*pulse;
    // Halo
    ctx.save(); ctx.globalAlpha=0.3;
    ctx.fillStyle='#ffd700';
    ctx.beginPath(); ctx.arc(c.x,c.y,r+4,0,Math.PI*2); ctx.fill();
    ctx.restore();
    // Corps doré
    const g=ctx.createRadialGradient(c.x-r*.3,c.y-r*.3,0,c.x,c.y,r);
    g.addColorStop(0,'#fff8a0'); g.addColorStop(0.5,'#ffd700'); g.addColorStop(1,'#b8860b');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.arc(c.x,c.y,r,0,Math.PI*2); ctx.fill();
    // Reflet
    ctx.fillStyle='rgba(255,255,255,0.5)';
    ctx.beginPath(); ctx.arc(c.x-r*.25,c.y-r*.25,r*.3,0,Math.PI*2); ctx.fill();
  }
}

function drawStars(){
  for(const s of stars){
    if(s.collected) continue;
    if(s.y<cameraY-40||s.y>cameraY+H+40) continue;
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
    ctx.beginPath(); ctx.moveTo(x,GROUND_Y+16);
    for(let i=0;i<5;i++) ctx.lineTo(x+Math.sin(i*1.2+Date.now()*.001)*11,GROUND_Y+16-i*14);
    ctx.stroke();
  });
}
function drawEarth(){
  [45,170,300].forEach(x=>{
    ctx.fillStyle='#4a2008'; ctx.fillRect(x-5,GROUND_Y+16-48,10,48);
    ctx.fillStyle='rgba(35,110,35,0.8)'; ctx.beginPath(); ctx.arc(x,GROUND_Y+16-58,25,0,Math.PI*2); ctx.fill();
  });
}
function drawFire(){
  [55,180,305].forEach(x=>{
    const f=Math.sin(Date.now()*.007+x*.01)*7;
    const g=ctx.createRadialGradient(x,GROUND_Y-8,0,x,GROUND_Y+16,18+f);
    g.addColorStop(0,'#ff8800'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(x,GROUND_Y+16-(13+f)*.4,(11+f)*.4,13+f,0,0,Math.PI*2); ctx.fill();
  });
}

// ── HUD ──────────────────────────────────────────────────────
function drawHUD(){
  // Fond HUD
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,32);

  ctx.fillStyle='#ffd700'; ctx.font='bold 13px Courier New';
  ctx.textAlign='left';
  ctx.fillText(`Niv.${currentLevel+1} ${LEVELS[currentLevel].name}`, 8, 21);

  // Timer — rouge si < 15s
  const mm=String(Math.floor(timeLeft/60)).padStart(1,'0');
  const ss=String(timeLeft%60).padStart(2,'0');
  ctx.fillStyle = timeLeft<=15 ? '#ff4444' : '#ffd700';
  ctx.textAlign='center';
  ctx.fillText(`⏱ ${mm}:${ss}`, W/2, 21);

  // Pièces et étoiles
  ctx.fillStyle='#ffd700';
  ctx.textAlign='right';
  ctx.fillText(`🪙${coinsCollected}  ⭐${starsCollected}/5`, W-8, 21);
}

function updateUI(){
  const lvl=LEVELS[currentLevel];
  document.getElementById('ui-level').textContent=currentLevel+1;
  document.getElementById('ui-levelname').textContent=lvl.name;
  document.getElementById('ui-stars').textContent=`${starsCollected}/5`;
  document.getElementById('ui-coins').textContent=coinsCollected;
  const s=Array(5).fill('_'); collectedLetters.forEach((l,i)=>s[i]=l);
  document.getElementById('ui-letters').textContent=s.join(' ');
}

// ── OVERLAY & CLAVIER NATIF ──────────────────────────────────
function showOverlay(){
  gameState='overlay';
  Object.keys(keys).forEach(k=>keys[k]=false);
  const lvl=LEVELS[currentLevel];
  document.getElementById('overlay-title').textContent=`Niveau ${currentLevel+1} termine !`;
  document.getElementById('overlay-hint').textContent=`Indice : ${lvl.hint}`;
  document.getElementById('overlay-error').textContent='';
  document.getElementById('overlay-coins').textContent=`🪙 Pièces collectées : ${coinsCollected}`;
  document.getElementById('overlay-letters').innerHTML=
    collectedLetters.map(l=>`<div class="letter-slot found">${l}</div>`).join('');
  const inp=document.getElementById('native-input');
  if(inp){ inp.value=''; }
  document.getElementById('validate-btn').disabled=false;
  document.getElementById('message-overlay').classList.add('active');
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
    ['B','R','A','V','O'].map(l=>`<div class="letter-slot found">${l}</div>`).join('');
  document.getElementById('overlay-hint').textContent='Tu as tout reussi !';
  document.getElementById('overlay-coins').textContent=`🪙 Total pièces : ${coinsCollected}`;
  const inp=document.getElementById('native-input');
  if(inp) inp.style.display='none';
  const btn=document.getElementById('validate-btn');
  btn.disabled=false; btn.textContent='Rejouer';
  btn.onclick=()=>{
    if(inp){ inp.style.display=''; inp.value=''; }
    btn.textContent='VALIDER →'; btn.onclick=window.checkAnswer;
    document.getElementById('message-overlay').classList.remove('active');
    currentLevel=0; coinsCollected=0; initLevel(); gameState='playing';
  };
}

// ── START SCREEN ─────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', ()=>{
  const btn=document.getElementById('play-btn');
  if(!btn) return;
  let started=false;
  function doStart(e){
    if(started) return; started=true;
    e.preventDefault(); e.stopPropagation();
    startGame();
  }
  btn.addEventListener('touchend', doStart, {passive:false});
  btn.addEventListener('click',    doStart);
});

// ── BOUCLE ───────────────────────────────────────────────────
function loop(){ update(); draw(); requestAnimationFrame(loop); }
