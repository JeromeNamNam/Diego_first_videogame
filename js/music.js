
// ── MUSIQUE WEB AUDIO ────────────────────────────────────────
// Mélodies thématiques par niveau, générées procéduralement
// Pas de fichier externe — 100% Web Audio API

let audioCtx = null;
let musicNodes = [];      // oscillateurs / gain actifs
let musicPlaying = false;
let currentMusicLevel = -1;

// Gammes et rythmes par niveau
const MUSIC = [
  // 0 — GLACE : pentatonique aiguë, son de clochettes
  {
    bpm: 160,
    notes: [1047, 1175, 1319, 1568, 1760, 1568, 1319, 1175,
            1047, 880,  1047, 1319, 1760, 1319, 1047, 880],
    type: 'triangle',
    gain: 0.18,
    echo: true,
  },
  // 1 — EAU : ondulante, notes graves douces
  {
    bpm: 100,
    notes: [261, 294, 330, 349, 392, 349, 330, 294,
            261, 220, 247, 294, 392, 330, 294, 261],
    type: 'sine',
    gain: 0.20,
    echo: true,
  },
  // 2 — TERRE : joyeuse, gamme majeure rythmée
  {
    bpm: 180,
    notes: [523, 587, 659, 698, 784, 698, 659, 587,
            523, 659, 784, 880, 784, 659, 523, 440],
    type: 'square',
    gain: 0.10,
    echo: false,
  },
  // 3 — FEU : urgente, chromatique percussive
  {
    bpm: 200,
    notes: [440, 466, 494, 523, 554, 587, 622, 659,
            698, 659, 622, 587, 554, 523, 466, 440],
    type: 'sawtooth',
    gain: 0.10,
    echo: false,
  },
];

function startMusic(levelIdx) {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  // Reprendre si suspendu (politique autoplay des browsers)
  if (audioCtx.state === 'suspended') audioCtx.resume();

  if (currentMusicLevel === levelIdx && musicPlaying) return;
  stopMusic();

  currentMusicLevel = levelIdx;
  musicPlaying = true;

  const m = MUSIC[levelIdx];
  const beatDur = 60 / m.bpm;
  const noteDur = beatDur * 0.85;

  // Gain master
  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(m.gain, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  musicNodes.push(masterGain);

  // Echo léger sur Glace et Eau
  let target = masterGain;
  if (m.echo) {
    const delay = audioCtx.createDelay(0.5);
    delay.delayTime.value = 0.22;
    const fbGain = audioCtx.createGain();
    fbGain.gain.value = 0.28;
    delay.connect(fbGain);
    fbGain.connect(delay);
    masterGain.connect(delay);
    delay.connect(audioCtx.destination);
    musicNodes.push(delay, fbGain);
  }

  // Boucle infinie via scheduleur récursif
  let noteIndex = 0;
  let nextTime = audioCtx.currentTime + 0.05;

  function scheduleNotes() {
    if (!musicPlaying || currentMusicLevel !== levelIdx) return;

    // Pré-remplir 0.4 secondes d'avance
    while (nextTime < audioCtx.currentTime + 0.4) {
      const freq = m.notes[noteIndex % m.notes.length];
      noteIndex++;

      const osc = audioCtx.createOscillator();
      const envGain = audioCtx.createGain();

      osc.type = m.type;
      osc.frequency.setValueAtTime(freq, nextTime);

      // Enveloppe attaque/relâche
      envGain.gain.setValueAtTime(0, nextTime);
      envGain.gain.linearRampToValueAtTime(1, nextTime + 0.015);
      envGain.gain.setValueAtTime(1, nextTime + noteDur * 0.6);
      envGain.gain.linearRampToValueAtTime(0, nextTime + noteDur);

      osc.connect(envGain);
      envGain.connect(masterGain);

      osc.start(nextTime);
      osc.stop(nextTime + noteDur + 0.02);

      nextTime += beatDur;
    }

    // Rappel dans 150ms
    setTimeout(scheduleNotes, 150);
  }

  scheduleNotes();
}

function stopMusic() {
  musicPlaying = false;
  // Couper les nodes encore actifs
  for (const node of musicNodes) {
    try { node.disconnect(); } catch(_) {}
  }
  musicNodes = [];
  currentMusicLevel = -1;
}

// Bouton mute flottant
function createMuteButton() {
  const btn = document.createElement('button');
  btn.id = 'mute-btn';
  btn.textContent = '🔊';
  btn.title = 'Couper / activer la musique';
  Object.assign(btn.style, {
    position: 'fixed', bottom: '16px', right: '16px',
    background: 'rgba(0,0,0,0.55)', color: '#fff',
    border: '2px solid #ffd700', borderRadius: '50%',
    width: '44px', height: '44px', fontSize: '20px',
    cursor: 'pointer', zIndex: '999',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
  });
  let muted = false;
  btn.addEventListener('click', () => {
    muted = !muted;
    btn.textContent = muted ? '🔇' : '🔊';
    if (audioCtx) audioCtx.suspend();
    if (!muted && audioCtx) {
      audioCtx.resume();
      startMusic(currentLevel);
    }
  });
  document.body.appendChild(btn);
}
