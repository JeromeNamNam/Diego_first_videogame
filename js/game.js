// ============================================================
//  Diego's Adventure — game.js  (format vertical 400x580)
// ============================================================
const canvas = document.getElementById('gameCanvas');
const ctx    = canvas.getContext('2d');
const W = 400, H = 580;
canvas.width  = W;
canvas.height = H;

// ── NIVEAUX ─────────────────────────────────────────────────
const LEVELS = [
  {
    name:'GLACE', bgTop:'#b3e8ff', bgBot:'#d0f0ff',
    groundColor:'#aacfdf', platColor:'#8ec8e8', platBorder:'#5ab0d0',
    decorType:'ice', word:'IGLOO', letters:['I','G','L','O','O'],
    hint:'Un abri esquimau dans la neige',
    platforms:[
      {x:0,   y:500,w:200,h:16},{x:230, y:440,w:140,h:16},
      {x:60,  y:380,w:140,h:16},{x:250, y:320,w:140,h:16},
      {x:50,  y:260,w:140,h:16},{x:240, y:200,w:140,h:16},
      {x:60,  y:140,w:280,h:16},
    ],
    stars:[
      {x:130,y:460},{x:310,y:400},{x:140,y:340},
      {x:310,y:280},{x:190,y:100},
    ],
  },
  {
    name:'EAU', bgTop:'#0a3a6e', bgBot:'#1a6ea8',
    groundColor:'#0e4a7a', platColor:'#1a7090', platBorder:'#30b8cc',
    decorType:'water', word:'OCEAN', letters:['O','C','E','A','N'],
    hint:'Grande étendue d\'eau salée',
    platforms:[
      {x:0,  y:500,w:180,h:16},{x:220,y:450,w:160,h:16},
      {x:40, y:390,w:150,h:16},{x:220,y:330,w:150,h:16},
      {x:30, y:270,w:150,h:16},{x:230,y:210,w:150,h:16},
      {x:60, y:140,w:280,h:16},
    ],
    stars:[
      {x:90,y:460},{x:300,y:410},{x:120,y:350},
      {x:300,y:290},{x:190,y:100},
    ],
  },
  {
    name:'TERRE', bgTop:'#3a6e28', bgBot:'#1e4010',
    groundColor:'#4a3010', platColor:'#6a4818', platBorder:'#9a7030',
    decorType:'earth', word:'ARBRE', letters:['A','R','B','R','E'],
    hint:'Il pousse vers le soleil',
    platforms:[
      {x:0,  y:500,w:190,h:16},{x:220,y:440,w:160,h:16},
      {x:40, y:380,w:150,h:16},{x:210,y:320,w:150,h:16},
      {x:50, y:260,w:150,h:16},{x:220,y:200,w:150,h:16},
      {x:60, y:130,w:280,h:16},
    ],
    stars:[
      {x:100,y:460},{x:300,y:400},{x:120,y:340},
      {x:290,y:280},{x:190,y:90},
    ],
  },
  {
    name:'FEU', bgTop:'#3a0a00', bgBot:'#6a1800',
    groundColor:'#4a1000', platColor:'#8a2800', platBorder:'#ff5500',
    decorType:'fire', word:'BRAVO', letters:['B','R','A','V','O'],
    hint:'Tu as tout reussi Diego !',
    platforms:[
      {x:0,  y:500,w:180,h:16},{x:230,y:440,w:150,h:16},
      {x:50, y:380,w:150,h:16},{x:220,y:320,w:150,h:16},
      {x:40, y:260,w:150,h:16},{x:230,y:195,w:150,h:16},
      {x:60, y:130,w:280,h:16},
    ],
    stars:[
      {x:90,y:460},{x:305,y:400},{x:125,y:340},
      {x:295,y:280},{x:190,y:90},
    ],
  },
];

// ── ÉTAT ────────────────────────────────────────────────────
let currentLevel     = 0;
let collectedLetters = [];
let starsCollected   = 0;
let gameState        = 'waiting'; // 'waiting'|'playing'|'overlay'
let stars            = [];
let particles        = [];
let cameraY          = 0;

// ── JOUEUR ───────────────────────────────────────────────────
const GROUND_Y = 516; // y du sol (bas du canvas - hauteur joueur)
const player = { x:60, y:470, w:28, h:32, vx:0, vy:0, onGround:false, facing:1, frame:0, ft:0 };
const GRAVITY=0.55, JUMP=-13, SPEED=3.8;

// ── TOUCHES ─────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  if (gameState !== 'playing') return;
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowLeft','ArrowRight'].includes(e.code)) e.preventDefault();
});
window.addEventListener('keyup', e => { keys[e.code] = false; });

// Boutons tactiles
function bindBtn(id, code) {
  const el = document.getElementById(id);
  if (!el) return;
  el.addEventListener('pointerdown',  e => { e.preventDefault(); keys[code]=true;  });
  el.addEventListener('pointerup',    e => { e.preventDefault(); keys[code]=false; });
  el.addEventListener('pointerleave', e => { keys[code]=false; });
}
bindBtn('btn-left',  'ArrowLeft');
bindBtn('btn-right', 'ArrowRight');
bindBtn('btn-jump',  'Space');

// ── START (premier geste → audio) ────────────────────────────
function startGame() {
  document.getElementById('start-screen').style.display = 'none';
  initAudio();
  gameState = 'playing';
  initLevel();
  createMuteButton();
  loop();
}

// ── INIT NIVEAU ─────────────────────────────────────────────
function initLevel() {
  const lvl = LEVELS[currentLevel];
  player.x = 60; player.y = 470;
  player.vx = 0; player.vy = 0;
  collectedLetters = []; starsCollected = 0;
  particles = []; cameraY = 0;
  Object.keys(keys).forEach(k => keys[k] = false);

  stars = lvl.stars.map((s,i) => ({
    x:s.x, y:s.y, letter:lvl.letters[i],
    collected:false, pulse:Math.random()*Math.PI*2,
  }));
  updateUI();
  startMusic(currentLevel);
}

// ── UPDATE ───────────────────────────────────────────────────
function update() {
  if (gameState !== 'playing') return;
  const lvl = LEVELS[currentLevel];

  // Horizontal
  if      (keys['ArrowLeft']  || keys['KeyA']) { player.vx=-SPEED; player.facing=-1; }
  else if (keys['ArrowRight'] || keys['KeyD']) { player.vx= SPEED; player.facing= 1; }
  else    player.vx *= 0.75;

  // Saut
  if ((keys['Space']||keys['ArrowUp']) && player.onGround) {
    player.vy = JUMP; player.onGround = false;
  }

  player.vy = Math.min(player.vy + GRAVITY, 18);
  player.x += player.vx;
  player.y += player.vy;

  // Bords gauche/droite
  if (player.x < 0) player.x = 0;
  if (player.x + player.w > W) player.x = W - player.w;

  // Collision plateformes
  player.onGround = false;
  for (const p of lvl.platforms) {
    if (player.x+player.w > p.x && player.x < p.x+p.w &&
        player.y+player.h > p.y && player.y+player.h < p.y+28 && player.vy >= 0) {
      player.y = p.y - player.h; player.vy = 0; player.onGround = true;
    }
  }

  // Sol absolu
  if (player.y + player.h >= GROUND_Y) {
    player.y = GROUND_Y - player.h; player.vy = 0; player.onGround = true;
  }

  // Tombe hors écran → respawn
  if (player.y > H + 100) { player.x=60; player.y=470; player.vy=0; }

  // Caméra verticale : suit le joueur vers le haut
  const targetY = player.y - H * 0.65;
  cameraY += (targetY - cameraY) * 0.1;
  if (cameraY > 0) cameraY = 0;

  // Étoiles
  for (const s of stars) {
    s.pulse += 0.07;
    if (s.collected) continue;
    const dx = player.x+player.w/2 - s.x, dy = player.y+player.h/2 - s.y;
    if (Math.sqrt(dx*dx+dy*dy) < 26) {
      s.collected = true;
      collectedLetters.push(s.letter);
      starsCollected++;
      spawnParticles(s.x, s.y - cameraY, '#ffd700');
      updateUI();
      if (starsCollected >= 5) setTimeout(showOverlay, 300);
    }
  }

  // Particules
  particles = particles.filter(p => p.life-- > 0);
  particles.forEach(p => { p.x+=p.vx; p.y+=p.vy; p.vy+=0.15; });

  // Anim joueur
  if (++player.ft > 8) { player.frame=(player.frame+1)%2; player.ft=0; }
}

// ── PARTICULES ───────────────────────────────────────────────
function spawnParticles(x, y, color) {
  for (let i=0;i<12;i++) particles.push({
    x,y, vx:(Math.random()-.5)*5, vy:(Math.random()-.5)*5-2,
    life:35, maxLife:35, color, size:3+Math.random()*3,
  });
}

// ── DRAW ────────────────────────────────────────────────────
function draw() {
  ctx.clearRect(0,0,W,H);
  ctx.save();
  ctx.translate(0, -cameraY);

  drawBg();
  drawDecors();
  drawGround();
  drawPlatforms();
  drawStars();
  drawParticles();
  drawPlayer();

  ctx.restore();
  drawHUD();
}

function drawBg() {
  const lvl = LEVELS[currentLevel];
  const worldH = H - cameraY;
  const g = ctx.createLinearGradient(0, cameraY, 0, cameraY + H);
  g.addColorStop(0, lvl.bgTop); g.addColorStop(1, lvl.bgBot);
  ctx.fillStyle = g;
  ctx.fillRect(0, cameraY, W, H);
}

function drawGround() {
  const lvl = LEVELS[currentLevel];
  ctx.fillStyle = lvl.groundColor;
  ctx.fillRect(0, GROUND_Y+32, W, 60);
  ctx.fillStyle = lvl.platBorder;
  ctx.fillRect(0, GROUND_Y+32, W, 4);
}

function drawPlatforms() {
  const lvl = LEVELS[currentLevel];
  for (const p of lvl.platforms) {
    ctx.fillStyle = 'rgba(0,0,0,0.2)';
    ctx.fillRect(p.x+4, p.y+6, p.w, 12);
    ctx.fillStyle = lvl.platColor;
    ctx.fillRect(p.x, p.y, p.w, p.h);
    ctx.fillStyle = lvl.platBorder;
    ctx.fillRect(p.x, p.y, p.w, 4);
    ctx.fillStyle = 'rgba(255,255,255,0.1)';
    for (let bx=p.x+8; bx<p.x+p.w-8; bx+=22) ctx.fillRect(bx, p.y+6, 12, 5);
  }
}

function drawStars() {
  for (const s of stars) {
    if (s.collected) continue;
    const p = 1 + Math.sin(s.pulse)*0.12, r = 16*p;
    ctx.save();
    ctx.globalAlpha = 0.25 + Math.sin(s.pulse)*0.1;
    ctx.fillStyle='#ffd700';
    ctx.beginPath(); ctx.arc(s.x,s.y,r+7,0,Math.PI*2); ctx.fill();
    ctx.restore();
    drawStarShape(s.x, s.y, r*0.5, r, '#ffd700','#ffec5c');
    ctx.save();
    ctx.fillStyle='#2a0a00';
    ctx.font=`bold ${13*p}px Courier New`;
    ctx.textAlign='center'; ctx.textBaseline='middle';
    ctx.fillText(s.letter, s.x, s.y);
    ctx.restore();
  }
}

function drawStarShape(cx,cy,r1,r2,c1,c2) {
  const g=ctx.createRadialGradient(cx,cy-r2*.2,0,cx,cy,r2);
  g.addColorStop(0,c2); g.addColorStop(1,c1);
  ctx.fillStyle=g; ctx.beginPath();
  for(let i=0;i<10;i++){
    const r=i%2===0?r2:r1, a=i*Math.PI/5-Math.PI/2;
    i===0?ctx.moveTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r):ctx.lineTo(cx+Math.cos(a)*r,cy+Math.sin(a)*r);
  }
  ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#ffec5c'; ctx.lineWidth=1.5; ctx.stroke();
}

function drawParticles() {
  for (const p of particles) {
    ctx.save(); ctx.globalAlpha=p.life/p.maxLife;
    ctx.fillStyle=p.color;
    ctx.beginPath(); ctx.arc(p.x, p.y+cameraY, p.size*(p.life/p.maxLife),0,Math.PI*2); ctx.fill();
    ctx.restore();
  }
}

function drawPlayer() {
  const px=player.x, py=player.y, pw=player.w, ph=player.h;
  ctx.save();
  ctx.translate(px+pw/2, py+ph/2);
  ctx.scale(player.facing,1);
  ctx.fillStyle='#cc1111';
  ctx.fillRect(-pw/2,-ph/2,pw,ph);
  ctx.fillStyle='rgba(255,255,255,0.15)';
  ctx.fillRect(-pw/2,-ph/2,pw*.4,ph*.5);
  ctx.fillStyle='#fff'; ctx.fillRect(3,-ph/2+5,7,7);
  ctx.fillStyle='#111'; ctx.fillRect(5+(player.frame?1:0),-ph/2+7,4,4);
  ctx.fillStyle='#880000'; ctx.fillRect(2,-ph/2+16,9,3);
  const lo=player.onGround&&Math.abs(player.vx)>.5?(player.frame?3:-3):0;
  ctx.fillStyle='#aa0a0a';
  ctx.fillRect(-pw/2, ph/2-8, 9, 8+lo);
  ctx.fillRect(pw/2-9, ph/2-8, 9, 8-lo);
  ctx.restore();
}

function drawDecors() {
  const t = LEVELS[currentLevel].decorType;
  ctx.save();
  if (t==='ice')   drawIceDecors();
  if (t==='water') drawWaterDecors();
  if (t==='earth') drawEarthDecors();
  if (t==='fire')  drawFireDecors();
  ctx.restore();
}

function drawIceDecors() {
  ctx.fillStyle='rgba(180,225,255,0.45)';
  [60,160,270,350].forEach(x=>{
    ctx.beginPath(); ctx.moveTo(x,cameraY); ctx.lineTo(x-14,cameraY+55); ctx.lineTo(x+14,cameraY+55); ctx.closePath(); ctx.fill();
  });
  ctx.strokeStyle='rgba(200,240,255,0.8)'; ctx.lineWidth=1.5;
  [90,200,300,380].forEach(x=>{
    const y=cameraY+40+Math.sin(x*.02+Date.now()*.001)*20;
    ctx.save(); ctx.translate(x,y);
    for(let i=0;i<6;i++){ ctx.beginPath(); ctx.moveTo(0,0); ctx.lineTo(0,-9); ctx.stroke(); ctx.rotate(Math.PI/3); }
    ctx.restore();
  });
}

function drawWaterDecors() {
  [70,190,310].forEach(x=>{
    ctx.strokeStyle='rgba(38,180,100,0.65)'; ctx.lineWidth=3;
    ctx.beginPath(); ctx.moveTo(x, GROUND_Y+32);
    for(let i=0;i<5;i++) ctx.lineTo(x+Math.sin(i*1.2+Date.now()*.001)*12, GROUND_Y+32-i*14);
    ctx.stroke();
  });
  [120,250,370].forEach(x=>{
    const by=cameraY+60+Math.sin(Date.now()*.0012+x*.01)*30;
    ctx.strokeStyle='rgba(120,210,255,0.45)'; ctx.lineWidth=1.5;
    ctx.beginPath(); ctx.arc(x,by,7,0,Math.PI*2); ctx.stroke();
  });
}

function drawEarthDecors() {
  [50,180,320].forEach(x=>{
    ctx.fillStyle='#4a2008';
    ctx.fillRect(x-5, GROUND_Y+32-50, 10, 50);
    ctx.fillStyle='rgba(35,110,35,0.8)';
    ctx.beginPath(); ctx.arc(x, GROUND_Y+32-60, 26,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='rgba(55,150,55,0.55)';
    ctx.beginPath(); ctx.arc(x-16, GROUND_Y+32-48, 18,0,Math.PI*2); ctx.fill();
    ctx.beginPath(); ctx.arc(x+16, GROUND_Y+32-50, 16,0,Math.PI*2); ctx.fill();
  });
  [130,260,380].forEach(x=>{
    ctx.fillStyle='#bb2020';
    ctx.beginPath(); ctx.arc(x, GROUND_Y+32-18, 13, Math.PI,0); ctx.fill();
    ctx.fillStyle='#fff'; ctx.fillRect(x-4, GROUND_Y+32-18, 8, 16);
  });
}

function drawFireDecors() {
  [60,190,320].forEach(x=>{
    const f=Math.sin(Date.now()*.007+x*.01)*8;
    const g=ctx.createRadialGradient(x,GROUND_Y+32-10,0,x,GROUND_Y+32,20+f);
    g.addColorStop(0,'#ff8800'); g.addColorStop(1,'transparent');
    ctx.fillStyle=g;
    ctx.beginPath(); ctx.ellipse(x, GROUND_Y+32-(15+f)*.4, (12+f)*.4, 15+f,0,0,Math.PI*2); ctx.fill();
  });
  [100,240,360].forEach(x=>{
    const by=cameraY+80+Math.abs(Math.sin(Date.now()*.0015+x*.012))*100;
    ctx.fillStyle=`rgba(255,${80+Math.random()*80|0},0,0.75)`;
    ctx.beginPath(); ctx.arc(x,by,2.5,0,Math.PI*2); ctx.fill();
  });
}

// ── HUD ──────────────────────────────────────────────────────
function drawHUD() {
  ctx.fillStyle='rgba(0,0,0,0.5)';
  ctx.fillRect(0,0,W,30);
  ctx.fillStyle='#ffd700'; ctx.font='bold 13px Courier New';
  ctx.textAlign='left';
  ctx.fillText(`Niv.${currentLevel+1} ${LEVELS[currentLevel].name}`,10,20);
  ctx.textAlign='right';
  ctx.fillText(`⭐${starsCollected}/5`,W-10,20);
}

// ── UI DOM ───────────────────────────────────────────────────
function updateUI() {
  const lvl=LEVELS[currentLevel];
  document.getElementById('ui-level').textContent    = currentLevel+1;
  document.getElementById('ui-levelname').textContent= lvl.name;
  document.getElementById('ui-stars').textContent    = `${starsCollected}/5`;
  const s=Array(5).fill('_'); collectedLetters.forEach((l,i)=>s[i]=l);
  document.getElementById('ui-letters').textContent  = s.join(' ');
}

// ── CLAVIER VIRTUEL & OVERLAY ────────────────────────────────
const KB_ROWS = ['AZERTYUIOP','QSDFGHJKLM','WXCVBN'];
let answerLetters = [];

function buildKeyboard() {
  const kb = document.getElementById('virtual-keyboard');
  kb.innerHTML = '';
  KB_ROWS.forEach(row => {
    const div = document.createElement('div');
    div.className = 'kb-row';
    [...row].forEach(letter => {
      const btn = document.createElement('button');
      btn.className = 'kb-key'; btn.textContent = letter;
      btn.addEventListener('click', () => kbPress(letter));
      div.appendChild(btn);
    });
    if (row === KB_ROWS[KB_ROWS.length-1]) {
      const back = document.createElement('button');
      back.className = 'kb-key kb-backspace'; back.textContent = '⌫';
      back.addEventListener('click', kbBack);
      div.appendChild(back);
    }
    kb.appendChild(div);
  });
}

function kbPress(l) {
  if (answerLetters.length >= 5) return;
  answerLetters.push(l); refreshAnswer();
}

function kbBack() {
  if (!answerLetters.length) return;
  answerLetters.pop(); refreshAnswer();
}

function refreshAnswer() {
  document.querySelectorAll('.answer-slot').forEach((s,i) => s.textContent=answerLetters[i]||'');
  document.getElementById('validate-btn').disabled = answerLetters.length < 5;
  document.getElementById('overlay-error').textContent = '';
}

function showOverlay() {
  gameState = 'overlay';
  answerLetters = [];
  Object.keys(keys).forEach(k=>keys[k]=false);
  const lvl = LEVELS[currentLevel];

  document.getElementById('overlay-title').textContent = `Niveau ${currentLevel+1} termine !`;
  document.getElementById('overlay-hint').textContent  = `Indice : ${lvl.hint}`;
  document.getElementById('overlay-error').textContent = '';

  // Lettres trouvées
  document.getElementById('overlay-letters').innerHTML =
    collectedLetters.map(l=>`<div class="letter-slot found">${l}</div>`).join('');

  // Cases réponse
  const ad = document.getElementById('answer-display');
  ad.innerHTML = Array(5).fill('<div class="answer-slot"></div>').join('');
  ad.querySelectorAll('.answer-slot').forEach(s=>s.addEventListener('click',kbBack));

  document.getElementById('validate-btn').disabled = true;
  buildKeyboard();
  document.getElementById('message-overlay').classList.add('active');
}

window.checkAnswer = function() {
  const lvl = LEVELS[currentLevel];
  if (answerLetters.join('') === lvl.word) {
    document.getElementById('message-overlay').classList.remove('active');
    if (currentLevel < LEVELS.length-1) { currentLevel++; initLevel(); gameState='playing'; }
    else showWin();
  } else {
    document.getElementById('overlay-error').textContent = 'Pas le bon mot !';
    answerLetters = []; refreshAnswer();
  }
};

function showWin() {
  document.getElementById('overlay-title').textContent = 'Bravo Diego !';
  document.getElementById('overlay-letters').innerHTML =
    ['B','R','A','V','O'].map(l=>`<div class="letter-slot found">${l}</div>`).join('');
  document.getElementById('overlay-hint').textContent  = 'Tu as tout reussi !';
  document.getElementById('answer-display').innerHTML  = '';
  document.getElementById('virtual-keyboard').innerHTML= '';
  const btn = document.getElementById('validate-btn');
  btn.disabled=false; btn.textContent='Rejouer';
  btn.onclick=()=>{
    btn.textContent='VALIDER ->'; btn.onclick=window.checkAnswer;
    document.getElementById('message-overlay').classList.remove('active');
    currentLevel=0; initLevel(); gameState='playing';
  };
}

// ── BOUCLE ───────────────────────────────────────────────────
function loop() { update(); draw(); requestAnimationFrame(loop); }
