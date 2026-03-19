// ============================================================
//  Diego's Adventure — game.js
//  4 niveaux : Glace, Eau, Terre, Feu
//  Collecter 5 étoiles/lettres par niveau → décrypter le mot
// ============================================================

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const W = canvas.width;
const H = canvas.height;

// ── NIVEAUX ─────────────────────────────────────────────────
// Chaque niveau a : nom, couleurs, plateformes, étoiles, mot-clé
const LEVELS = [
  {
    name: 'GLACE',
    bgTop: '#b3e8ff',
    bgBot: '#e0f7ff',
    groundColor: '#cce9f5',
    platColor: '#aad4ef',
    platBorder: '#7ab8d8',
    decorType: 'ice',
    word: 'IGLOO',
    letters: ['I','G','L','O','O'],
    hint: 'Un abri esquimau …',
    platforms: [
      { x:0,    y:430, w:300, h:20 },
      { x:350,  y:370, w:180, h:20 },
      { x:580,  y:310, w:200, h:20 },
      { x:830,  y:360, w:220, h:20 },
      { x:1100, y:300, w:180, h:20 },
      { x:1330, y:380, w:200, h:20 },
      { x:1580, y:430, w:300, h:20 },
      { x:1900, y:360, w:220, h:20 },
      { x:2170, y:430, w:400, h:20 },
    ],
    stars: [
      { x:200,  y:390 },
      { x:440,  y:330 },
      { x:680,  y:270 },
      { x:1200, y:260 },
      { x:2300, y:390 },
    ],
  },
  {
    name: 'EAU',
    bgTop: '#0a3a6e',
    bgBot: '#1a6ea8',
    groundColor: '#1a5f8a',
    platColor: '#2196a8',
    platBorder: '#38c9d6',
    decorType: 'water',
    word: 'OCEAN',
    letters: ['O','C','E','A','N'],
    hint: 'Immense étendue d\'eau salée …',
    platforms: [
      { x:0,    y:430, w:250, h:20 },
      { x:310,  y:360, w:160, h:20 },
      { x:530,  y:290, w:200, h:20 },
      { x:790,  y:350, w:180, h:20 },
      { x:1030, y:280, w:200, h:20 },
      { x:1290, y:370, w:180, h:20 },
      { x:1530, y:300, w:220, h:20 },
      { x:1810, y:400, w:200, h:20 },
      { x:2060, y:430, w:400, h:20 },
    ],
    stars: [
      { x:160,  y:390 },
      { x:410,  y:320 },
      { x:630,  y:250 },
      { x:1130, y:240 },
      { x:2200, y:390 },
    ],
  },
  {
    name: 'TERRE',
    bgTop: '#4a7c3f',
    bgBot: '#2d5a1b',
    groundColor: '#5c3d1a',
    platColor: '#7b5e2a',
    platBorder: '#a07840',
    decorType: 'earth',
    word: 'ARBRE',
    letters: ['A','R','B','R','E'],
    hint: 'Il pousse vers le soleil …',
    platforms: [
      { x:0,    y:430, w:280, h:20 },
      { x:340,  y:350, w:200, h:20 },
      { x:600,  y:280, w:180, h:20 },
      { x:840,  y:370, w:220, h:20 },
      { x:1120, y:310, w:180, h:20 },
      { x:1360, y:390, w:200, h:20 },
      { x:1620, y:320, w:220, h:20 },
      { x:1900, y:430, w:200, h:20 },
      { x:2160, y:430, w:400, h:20 },
    ],
    stars: [
      { x:180,  y:390 },
      { x:440,  y:310 },
      { x:700,  y:240 },
      { x:1220, y:270 },
      { x:2280, y:390 },
    ],
  },
  {
    name: 'FEU',
    bgTop: '#3a0a00',
    bgBot: '#7a1a00',
    groundColor: '#5a1a00',
    platColor: '#9a3a00',
    platBorder: '#ff6a00',
    decorType: 'fire',
    word: 'BRAVO',
    letters: ['B','R','A','V','O'],
    hint: 'Tu as tout réussi, Diego !',
    platforms: [
      { x:0,    y:430, w:250, h:20 },
      { x:310,  y:360, w:180, h:20 },
      { x:550,  y:290, w:200, h:20 },
      { x:810,  y:350, w:180, h:20 },
      { x:1050, y:270, w:220, h:20 },
      { x:1330, y:370, w:180, h:20 },
      { x:1570, y:300, w:220, h:20 },
      { x:1850, y:420, w:200, h:20 },
      { x:2100, y:430, w:450, h:20 },
    ],
    stars: [
      { x:160,  y:390 },
      { x:410,  y:320 },
      { x:660,  y:250 },
      { x:1150, y:230 },
      { x:2270, y:390 },
    ],
  },
];

// ── ÉTAT DU JEU ─────────────────────────────────────────────
let currentLevel = 0;
let collectedLetters = [];
let starsCollected = 0;
let gameState = 'playing'; // 'playing' | 'overlay'

// ── JOUEUR ───────────────────────────────────────────────────
const player = {
  x: 80,
  y: 380,
  w: 28,
  h: 36,
  vx: 0,
  vy: 0,
  onGround: false,
  facing: 1, // 1=droite, -1=gauche
  animFrame: 0,
  animTimer: 0,
};

const GRAVITY    = 0.55;
const JUMP_FORCE = -13;
const SPEED      = 4.5;
const GROUND_Y   = 450; // sol absolu du canvas

// ── CAMÉRA ───────────────────────────────────────────────────
let cameraX = 0;

// ── CLAVIER ─────────────────────────────────────────────────
const keys = {};
window.addEventListener('keydown', e => {
  // Premier geste : initialiser l'audio
  initAudio();
  if (!musicPlaying) startMusic(currentLevel);

  // Ne pas bloquer la saisie dans l'input de l'overlay
  if (gameState === 'overlay') return;
  keys[e.code] = true;
  if (['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)) {
    e.preventDefault();
  }
});
window.addEventListener('keyup', e => {
  keys[e.code] = false;
});
// Init audio aussi sur clic canvas (mobile / souris)
canvas.addEventListener('click', () => {
  initAudio();
  if (!musicPlaying) startMusic(currentLevel);
});

// ── ÉTOILES RUNTIME ─────────────────────────────────────────
let stars = [];

function buildLevelStars() {
  const lvl = LEVELS[currentLevel];
  stars = lvl.stars.map((s, i) => ({
    x: s.x,
    y: s.y,
    letter: lvl.letters[i],
    collected: false,
    pulse: Math.random() * Math.PI * 2,
  }));
}

// ── PARTICULES ───────────────────────────────────────────────
let particles = [];
function spawnParticles(x, y, color) {
  for (let i = 0; i < 14; i++) {
    particles.push({
      x, y,
      vx: (Math.random() - 0.5) * 5,
      vy: (Math.random() - 0.5) * 5 - 2,
      life: 40,
      maxLife: 40,
      color,
      size: 3 + Math.random() * 4,
    });
  }
}

// ── INIT NIVEAU ─────────────────────────────────────────────
function initLevel() {
  player.x = 80;
  player.y = 380;
  player.vx = 0;
  player.vy = 0;
  cameraX = 0;
  collectedLetters = [];
  starsCollected = 0;
  particles = [];
  gameState = 'playing';
  buildLevelStars();
  updateUI();
  // Redémarrer la musique du nouveau niveau si audio déjà initialisé
  if (audioCtx) startMusic(currentLevel);
}

// ── UPDATE ───────────────────────────────────────────────────
function update() {
  if (gameState !== 'playing') return;
  const lvl = LEVELS[currentLevel];

  // Mouvement horizontal
  if (keys['ArrowLeft'] || keys['KeyA']) {
    player.vx = -SPEED;
    player.facing = -1;
  } else if (keys['ArrowRight'] || keys['KeyD']) {
    player.vx = SPEED;
    player.facing = 1;
  } else {
    player.vx *= 0.78;
  }

  // Saut (Space ou ArrowUp)
  if ((keys['Space'] || keys['ArrowUp']) && player.onGround) {
    player.vy = JUMP_FORCE;
    player.onGround = false;
  }

  // Gravité
  player.vy += GRAVITY;
  if (player.vy > 18) player.vy = 18;

  player.x += player.vx;
  player.y += player.vy;

  // Limite gauche
  if (player.x < 10) { player.x = 10; player.vx = 0; }

  // ── Collision plateformes
  player.onGround = false;
  for (const p of lvl.platforms) {
    if (
      player.x + player.w > p.x &&
      player.x            < p.x + p.w &&
      player.y + player.h > p.y &&
      player.y + player.h < p.y + 30 &&
      player.vy >= 0
    ) {
      player.y = p.y - player.h;
      player.vy = 0;
      player.onGround = true;
    }
  }

  // Sol absolu
  if (player.y + player.h >= GROUND_Y) {
    player.y = GROUND_Y - player.h;
    player.vy = 0;
    player.onGround = true;
  }

  // Tombe dans le vide → respawn sur la dernière plateforme
  if (player.y > H + 100) {
    player.x = 80;
    player.y = 380;
    player.vy = 0;
  }

  // ── Collecte étoiles
  for (const star of stars) {
    if (star.collected) continue;
    const dx = player.x + player.w/2 - star.x;
    const dy = player.y + player.h/2 - star.y;
    if (Math.sqrt(dx*dx + dy*dy) < 28) {
      star.collected = true;
      collectedLetters.push(star.letter);
      starsCollected++;
      spawnParticles(star.x - cameraX, star.y, '#ffd700');
      updateUI();
      if (starsCollected >= 5) showOverlay();
    }
    star.pulse += 0.07;
  }

  // ── Particules
  for (const p of particles) {
    p.x += p.vx;
    p.y += p.vy;
    p.vy += 0.15;
    p.life--;
  }
  particles = particles.filter(p => p.life > 0);

  // Animation joueur
  player.animTimer++;
  if (player.animTimer > 8) { player.animFrame = (player.animFrame + 1) % 2; player.animTimer = 0; }

  // Caméra suit le joueur
  const targetCam = player.x - W * 0.35;
  cameraX += (targetCam - cameraX) * 0.12;
  if (cameraX < 0) cameraX = 0;
}

// ── DRAW HELPERS ─────────────────────────────────────────────
function drawBackground() {
  const lvl = LEVELS[currentLevel];
  const grad = ctx.createLinearGradient(0, 0, 0, H);
  grad.addColorStop(0, lvl.bgTop);
  grad.addColorStop(1, lvl.bgBot);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);
}

function drawDecors() {
  const type = LEVELS[currentLevel].decorType;
  ctx.save();
  ctx.translate(-cameraX * 0.4, 0); // parallax lent

  if (type === 'ice') drawIceDecors();
  else if (type === 'water') drawWaterDecors();
  else if (type === 'earth') drawEarthDecors();
  else if (type === 'fire') drawFireDecors();

  ctx.restore();
}

// GLACE : stalactites et stalagmites, flocons
function drawIceDecors() {
  const positions = [80,200,400,620,850,1050,1300,1550,1800,2050,2300];
  ctx.fillStyle = 'rgba(180,230,255,0.55)';
  for (const px of positions) {
    // stalactite (haut)
    ctx.beginPath();
    ctx.moveTo(px, 0);
    ctx.lineTo(px - 18, 70 + Math.sin(px*0.02)*20);
    ctx.lineTo(px + 18, 70 + Math.sin(px*0.02)*20);
    ctx.closePath();
    ctx.fill();
    // stalagmite (bas)
    ctx.beginPath();
    ctx.moveTo(px + 60, GROUND_Y);
    ctx.lineTo(px + 42, GROUND_Y - 55 - Math.cos(px*0.03)*15);
    ctx.lineTo(px + 78, GROUND_Y - 55 - Math.cos(px*0.03)*15);
    ctx.closePath();
    ctx.fill();
  }
  // flocons
  ctx.fillStyle = 'rgba(220,245,255,0.7)';
  const flakePos = [130,310,510,710,960,1160,1410,1680,1900,2150];
  for (const fp of flakePos) {
    const y = 60 + Math.sin(fp * 0.015 + Date.now()*0.0008) * 30;
    drawSnowflake(fp, y, 10);
  }
}

function drawSnowflake(x, y, r) {
  ctx.save();
  ctx.translate(x, y);
  ctx.strokeStyle = 'rgba(200,235,255,0.9)';
  ctx.lineWidth = 1.5;
  for (let i = 0; i < 6; i++) {
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -r);
    ctx.stroke();
    ctx.rotate(Math.PI / 3);
  }
  ctx.restore();
}

// EAU : bulles, algues, coraux
function drawWaterDecors() {
  // algues
  const alguePos = [100,280,480,700,920,1120,1380,1620,1860,2100];
  for (const ap of alguePos) {
    const h2 = 60 + Math.sin(ap * 0.02) * 20;
    ctx.strokeStyle = 'rgba(38,180,100,0.7)';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(ap, GROUND_Y);
    for (let seg = 0; seg < 5; seg++) {
      const cx = ap + Math.sin(seg * 1.2 + Date.now()*0.001) * 15;
      ctx.lineTo(cx, GROUND_Y - seg * (h2/5));
    }
    ctx.stroke();
  }
  // bulles
  const bubblePos = [160,360,580,800,1040,1260,1500,1740,1980,2220];
  for (const bp of bubblePos) {
    const by = 80 + Math.sin(Date.now()*0.0012 + bp*0.01) * 40;
    ctx.strokeStyle = 'rgba(120,210,255,0.5)';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.arc(bp, by, 8, 0, Math.PI*2);
    ctx.stroke();
  }
}

// TERRE : arbres simples, champignons
function drawEarthDecors() {
  const treePos = [60,260,500,740,980,1220,1460,1700,1950,2200];
  for (const tp of treePos) {
    // tronc
    ctx.fillStyle = '#5a3010';
    ctx.fillRect(tp - 6, GROUND_Y - 70, 12, 70);
    // feuillage
    ctx.fillStyle = 'rgba(40,120,40,0.8)';
    ctx.beginPath();
    ctx.arc(tp, GROUND_Y - 85, 32, 0, Math.PI*2);
    ctx.fill();
    ctx.fillStyle = 'rgba(60,160,60,0.6)';
    ctx.beginPath();
    ctx.arc(tp - 20, GROUND_Y - 70, 22, 0, Math.PI*2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(tp + 22, GROUND_Y - 72, 20, 0, Math.PI*2);
    ctx.fill();
  }
  // champignons
  const mushPos = [170,420,680,900,1150,1380,1620,1870,2110];
  for (const mp of mushPos) {
    ctx.fillStyle = '#cc2222';
    ctx.beginPath();
    ctx.arc(mp, GROUND_Y - 20, 16, Math.PI, 0);
    ctx.fill();
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(mp - 5, GROUND_Y - 20, 10, 18);
  }
}

// FEU : flammes, braises
function drawFireDecors() {
  const firePos = [100,300,540,780,1020,1260,1500,1740,1980,2220];
  for (const fp of firePos) {
    const flicker = Math.sin(Date.now()*0.006 + fp*0.01) * 10;
    drawFlame(fp, GROUND_Y, 20 + flicker, '#ff6a00', '#ff2200');
    drawFlame(fp + 40, GROUND_Y - 5, 14 + flicker*0.5, '#ff9900', '#ff4400');
  }
  // braises flottantes
  const braisePos = [180,380,620,860,1100,1340,1580,1820,2060];
  for (const bp of braisePos) {
    const by = GROUND_Y - 40 - Math.abs(Math.sin(Date.now()*0.0015 + bp*0.012)) * 120;
    ctx.fillStyle = `rgba(255,${100 + Math.floor(Math.random()*80)},0,0.8)`;
    ctx.beginPath();
    ctx.arc(bp, by, 3, 0, Math.PI*2);
    ctx.fill();
  }
}

function drawFlame(x, baseY, size, col1, col2) {
  const grad = ctx.createRadialGradient(x, baseY - size*0.5, 0, x, baseY, size*1.2);
  grad.addColorStop(0, col1);
  grad.addColorStop(1, 'transparent');
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.ellipse(x, baseY - size*0.4, size*0.5, size, 0, 0, Math.PI*2);
  ctx.fill();
}

// ── DRAW PLATEFORMES ────────────────────────────────────────
function drawPlatforms() {
  const lvl = LEVELS[currentLevel];
  for (const p of lvl.platforms) {
    const sx = p.x - cameraX;
    if (sx + p.w < -20 || sx > W + 20) continue;

    // Ombre
    ctx.fillStyle = 'rgba(0,0,0,0.25)';
    ctx.fillRect(sx + 4, p.y + 6, p.w, 14);

    // Corps
    ctx.fillStyle = lvl.platColor;
    ctx.fillRect(sx, p.y, p.w, p.h);

    // Bord supérieur brillant
    ctx.fillStyle = lvl.platBorder;
    ctx.fillRect(sx, p.y, p.w, 4);

    // Détail texture
    ctx.fillStyle = 'rgba(255,255,255,0.12)';
    for (let bx = sx + 8; bx < sx + p.w - 8; bx += 24) {
      ctx.fillRect(bx, p.y + 6, 14, 6);
    }
  }
}

// ── DRAW SOL ─────────────────────────────────────────────────
function drawGround() {
  const lvl = LEVELS[currentLevel];
  ctx.fillStyle = lvl.groundColor;
  ctx.fillRect(0, GROUND_Y, W, H - GROUND_Y);
  ctx.fillStyle = lvl.platBorder;
  ctx.fillRect(0, GROUND_Y, W, 4);
}

// ── DRAW ÉTOILES ────────────────────────────────────────────
function drawStars() {
  for (const star of stars) {
    if (star.collected) continue;
    const sx = star.x - cameraX;
    if (sx < -30 || sx > W + 30) continue;

    const pulse = 1 + Math.sin(star.pulse) * 0.12;
    const r = 18 * pulse;

    // Halo
    ctx.save();
    ctx.globalAlpha = 0.3 + Math.sin(star.pulse) * 0.15;
    ctx.fillStyle = '#ffd700';
    ctx.beginPath();
    ctx.arc(sx, star.y, r + 8, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();

    // Étoile à 5 branches
    drawStarShape(sx, star.y, r * 0.55, r, '#ffd700', '#ffec5c');

    // Lettre
    ctx.save();
    ctx.fillStyle = '#3a1a00';
    ctx.font = `bold ${14 * pulse}px 'Courier New'`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(star.letter, sx, star.y);
    ctx.restore();
  }
}

function drawStarShape(cx, cy, r1, r2, col1, col2) {
  const spikes = 5;
  const step = Math.PI / spikes;
  const grad = ctx.createRadialGradient(cx, cy - r2*0.2, 0, cx, cy, r2);
  grad.addColorStop(0, col2);
  grad.addColorStop(1, col1);
  ctx.fillStyle = grad;
  ctx.beginPath();
  for (let i = 0; i < spikes * 2; i++) {
    const r = i % 2 === 0 ? r2 : r1;
    const angle = i * step - Math.PI / 2;
    if (i === 0) ctx.moveTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
    else ctx.lineTo(cx + Math.cos(angle)*r, cy + Math.sin(angle)*r);
  }
  ctx.closePath();
  ctx.fill();

  ctx.strokeStyle = '#ffec5c';
  ctx.lineWidth = 1.5;
  ctx.stroke();
}

// ── DRAW JOUEUR ─────────────────────────────────────────────
function drawPlayer() {
  const sx = player.x - cameraX;
  ctx.save();
  ctx.translate(sx + player.w / 2, player.y + player.h / 2);
  ctx.scale(player.facing, 1);

  // Corps
  ctx.fillStyle = '#cc1111';
  ctx.fillRect(-player.w/2, -player.h/2, player.w, player.h);

  // Reflet
  ctx.fillStyle = 'rgba(255,255,255,0.18)';
  ctx.fillRect(-player.w/2, -player.h/2, player.w * 0.4, player.h * 0.5);

  // Yeux
  ctx.fillStyle = '#fff';
  ctx.fillRect(4, -player.h/2 + 6, 7, 7);
  ctx.fillStyle = '#111';
  ctx.fillRect(6 + (player.animFrame === 1 ? 1 : 0), -player.h/2 + 8, 4, 4);

  // Bouche
  ctx.fillStyle = '#880000';
  ctx.fillRect(2, -player.h/2 + 17, 10, 3);

  // Jambes (animation course)
  if (player.onGround && Math.abs(player.vx) > 0.5) {
    const legOff = player.animFrame === 0 ? 4 : -4;
    ctx.fillStyle = '#aa0a0a';
    ctx.fillRect(-player.w/2,      player.h/2 - 8, 10, 8 + legOff);
    ctx.fillRect(player.w/2 - 10, player.h/2 - 8, 10, 8 - legOff);
  } else {
    ctx.fillStyle = '#aa0a0a';
    ctx.fillRect(-player.w/2,      player.h/2 - 8, 10, 8);
    ctx.fillRect(player.w/2 - 10, player.h/2 - 8, 10, 8);
  }

  ctx.restore();
}

// ── DRAW PARTICULES ─────────────────────────────────────────
function drawParticles() {
  for (const p of particles) {
    const alpha = p.life / p.maxLife;
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = p.color;
    ctx.beginPath();
    ctx.arc(p.x, p.y, p.size * alpha, 0, Math.PI*2);
    ctx.fill();
    ctx.restore();
  }
}

// ── DRAW HUD ────────────────────────────────────────────────
function drawHUD() {
  const lvl = LEVELS[currentLevel];
  // Bandeau niveau
  ctx.save();
  ctx.fillStyle = 'rgba(0,0,0,0.45)';
  ctx.fillRect(0, 0, W, 34);
  ctx.fillStyle = '#ffd700';
  ctx.font = 'bold 15px Courier New';
  ctx.textAlign = 'left';
  ctx.fillText(`NIVEAU ${currentLevel + 1} — ${lvl.name}`, 14, 22);
  ctx.textAlign = 'right';
  ctx.fillText(`⭐ ${starsCollected}/5`, W - 14, 22);
  ctx.restore();
}

// ── DRAW PRINCIPAL ───────────────────────────────────────────
function draw() {
  ctx.clearRect(0, 0, W, H);
  drawBackground();
  drawDecors();
  drawGround();
  drawPlatforms();
  drawStars();
  drawParticles();
  drawPlayer();
  drawHUD();
}

// ── UI DOM ───────────────────────────────────────────────────
function updateUI() {
  const lvl = LEVELS[currentLevel];
  document.getElementById('ui-level').textContent   = `${currentLevel + 1} — ${lvl.name}`;
  document.getElementById('ui-stars').textContent   = `${starsCollected}/5`;
  const slots = Array(5).fill('_');
  collectedLetters.forEach((l, i) => { slots[i] = l; });
  document.getElementById('ui-letters').textContent = slots.join(' ');
}

// ── BLAGUES PAR NIVEAU ──────────────────────────────────────
const JOKES = [
  // Niveau 1 - Glace
  "Pourquoi les plongeurs plongent-ils toujours en arrière ?
Parce que sinon ils tomberaient dans le bateau ! 🤿",
  // Niveau 2 - Eau
  "Qu'est-ce qu'un crocodile qui surveille les valises ?
Un bag-arre ! 🐊",
  // Niveau 3 - Terre
  "Pourquoi les arbres sont-ils sur Internet ?
Pour trouver leurs raci-net ! 🌳",
  // Niveau 4 - Feu
  "Qu'est-ce qu'un pompier qui s'appelle Rémi ?
Rémi l'extincteur ! 🚒",
];

// ── CLAVIER VIRTUEL & OVERLAY ───────────────────────────────
const KB_ROWS = ['AZERTYUIOP', 'QSDFGHJKLM', 'WXCVBN'];
let answerLetters = [];

function buildKeyboard() {
  const kb = document.getElementById('virtual-keyboard');
  kb.innerHTML = '';
  KB_ROWS.forEach(row => {
    const div = document.createElement('div');
    div.className = 'kb-row';
    [...row].forEach(letter => {
      const btn = document.createElement('button');
      btn.className = 'kb-key';
      btn.textContent = letter;
      btn.dataset.letter = letter;
      btn.addEventListener('click', () => kbPress(letter));
      div.appendChild(btn);
    });
    if (row === KB_ROWS[KB_ROWS.length - 1]) {
      const back = document.createElement('button');
      back.className = 'kb-key kb-backspace';
      back.textContent = String.fromCharCode(9003); // ⌫
      back.addEventListener('click', kbBackspace);
      div.appendChild(back);
    }
    kb.appendChild(div);
  });
}

function kbPress(letter) {
  if (answerLetters.length >= 5) return;
  answerLetters.push(letter);
  updateAnswerDisplay();
}

function kbBackspace() {
  if (answerLetters.length === 0) return;
  answerLetters.pop();
  updateAnswerDisplay();
}

function updateAnswerDisplay() {
  const slots = document.querySelectorAll('.answer-slot');
  slots.forEach((slot, i) => { slot.textContent = answerLetters[i] || ''; });
  document.getElementById('validate-btn').disabled = (answerLetters.length < 5);
  document.getElementById('overlay-error').textContent = '';
}

function showOverlay() {
  gameState = 'overlay';
  answerLetters = [];
  Object.keys(keys).forEach(k => keys[k] = false);

  const lvl = LEVELS[currentLevel];
  document.getElementById('overlay-title').textContent = '\u2b50 Niveau ' + (currentLevel + 1) + ' termine !';
  document.getElementById('overlay-hint').textContent  = 'Indice : ' + lvl.hint;
  document.getElementById('overlay-error').textContent = '';

  const lettersEl = document.getElementById('overlay-letters');
  lettersEl.innerHTML = collectedLetters.map(l =>
    '<div class="letter-slot found">' + l + '</div>'
  ).join('');

  const answerEl = document.getElementById('answer-display');
  answerEl.innerHTML = Array(5).fill('<div class="answer-slot"></div>').join('');
  answerEl.querySelectorAll('.answer-slot').forEach(slot => {
    slot.addEventListener('click', kbBackspace);
  });

  document.getElementById('validate-btn').disabled = true;

  const jokeEl = document.getElementById('overlay-joke');
  if (jokeEl) jokeEl.textContent = JOKES[currentLevel] || '';

  buildKeyboard();
  document.getElementById('message-overlay').classList.add('active');
}

window.checkAnswer = function () {
  const lvl = LEVELS[currentLevel];
  const typed = answerLetters.join('');
  if (typed === lvl.word) {
    document.getElementById('message-overlay').classList.remove('active');
    if (currentLevel < LEVELS.length - 1) {
      currentLevel++;
      initLevel();
    } else {
      showWin();
    }
  } else {
    document.getElementById('overlay-error').textContent = 'Pas le bon mot — reessaie !';
    answerLetters = [];
    updateAnswerDisplay();
  }
};

function showWin() {
  answerLetters = [];
  document.getElementById('message-overlay').classList.add('active');
  document.getElementById('overlay-title').textContent = '\ud83c\udfc6 Bravo Diego ! Tu as tout reussi !';
  document.getElementById('overlay-letters').innerHTML =
    ['B','R','A','V','O'].map(l => '<div class="letter-slot found">' + l + '</div>').join('');
  document.getElementById('overlay-hint').textContent  = 'Tu es un vrai aventurier !';
  document.getElementById('overlay-joke').textContent  = '';
  document.getElementById('virtual-keyboard').innerHTML = '';
  document.getElementById('answer-display').innerHTML  = '';
  const btn = document.getElementById('validate-btn');
  btn.disabled    = false;
  btn.textContent = 'Rejouer';
  btn.onclick = () => {
    currentLevel = 0;
    btn.textContent = 'VALIDER ->';
    btn.onclick = window.checkAnswer;
    document.getElementById('message-overlay').classList.remove('active');
    initLevel();
  };
}

// ── BOUCLE PRINCIPALE ────────────────────────────────────────
function loop() {
  update();
  draw();
  requestAnimationFrame(loop);
}

// ── START ────────────────────────────────────────────────────
initLevel();
loop();
