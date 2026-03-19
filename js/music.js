// ============================================================
//  Diego's Adventure — music.js
//  Web Audio API — démarre UNIQUEMENT après geste utilisateur
// ============================================================
let audioCtx = null;
let musicPlaying = false;
let currentMusicLevel = -1;
let musicNodes = [];

const MUSIC = [
  { bpm:160, notes:[1047,1175,1319,1568,1760,1568,1319,1175,1047,880,1047,1319,1760,1319,1047,880], type:'triangle', gain:0.15, echo:true  },
  { bpm:100, notes:[261,294,330,349,392,349,330,294,261,220,247,294,392,330,294,261],               type:'sine',     gain:0.18, echo:true  },
  { bpm:180, notes:[523,587,659,698,784,698,659,587,523,659,784,880,784,659,523,440],               type:'square',   gain:0.08, echo:false },
  { bpm:200, notes:[440,466,494,523,554,587,622,659,698,659,622,587,554,523,466,440],               type:'sawtooth', gain:0.08, echo:false },
];

function initAudio() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
  if (audioCtx.state === 'suspended') audioCtx.resume();
}

function startMusic(levelIdx) {
  if (!audioCtx || audioCtx.state === 'suspended') return;
  if (currentMusicLevel === levelIdx && musicPlaying) return;
  stopMusic();

  currentMusicLevel = levelIdx;
  musicPlaying = true;
  const m = MUSIC[levelIdx];
  const beatDur = 60 / m.bpm;
  const noteDur = beatDur * 0.82;

  const masterGain = audioCtx.createGain();
  masterGain.gain.setValueAtTime(m.gain, audioCtx.currentTime);
  masterGain.connect(audioCtx.destination);
  musicNodes.push(masterGain);

  if (m.echo) {
    const delay  = audioCtx.createDelay(0.5);
    const fbGain = audioCtx.createGain();
    delay.delayTime.value = 0.2;
    fbGain.gain.value = 0.25;
    delay.connect(fbGain);
    fbGain.connect(delay);
    masterGain.connect(delay);
    delay.connect(audioCtx.destination);
    musicNodes.push(delay, fbGain);
  }

  let noteIndex = 0;
  let nextTime  = audioCtx.currentTime + 0.05;

  function schedule() {
    if (!musicPlaying || currentMusicLevel !== levelIdx) return;
    while (nextTime < audioCtx.currentTime + 0.4) {
      const freq    = m.notes[noteIndex % m.notes.length];
      noteIndex++;
      const osc     = audioCtx.createOscillator();
      const envGain = audioCtx.createGain();
      osc.type = m.type;
      osc.frequency.setValueAtTime(freq, nextTime);
      envGain.gain.setValueAtTime(0, nextTime);
      envGain.gain.linearRampToValueAtTime(1, nextTime + 0.012);
      envGain.gain.setValueAtTime(1, nextTime + noteDur * 0.6);
      envGain.gain.linearRampToValueAtTime(0, nextTime + noteDur);
      osc.connect(envGain);
      envGain.connect(masterGain);
      osc.start(nextTime);
      osc.stop(nextTime + noteDur + 0.02);
      nextTime += beatDur;
    }
    setTimeout(schedule, 150);
  }
  schedule();
}

function stopMusic() {
  musicPlaying = false;
  musicNodes.forEach(n => { try { n.disconnect(); } catch(_){} });
  musicNodes = [];
  currentMusicLevel = -1;
}

function createMuteButton() {
  const btn = document.createElement('button');
  btn.id = 'mute-btn';
  btn.textContent = '🔊';
  let muted = false;
  Object.assign(btn.style, {
    position:'fixed', bottom:'12px', right:'12px',
    background:'rgba(0,0,0,0.6)', color:'#fff',
    border:'2px solid #ffd700', borderRadius:'50%',
    width:'40px', height:'40px', fontSize:'18px',
    cursor:'pointer', zIndex:'9998',
  });
  btn.addEventListener('click', () => {
    muted = !muted;
    btn.textContent = muted ? '🔇' : '🔊';
    if (muted) stopMusic();
    else { audioCtx && audioCtx.resume(); startMusic(currentLevel); }
  });
  document.body.appendChild(btn);
}
