// ============================================================
//  Diego's Adventure — music.js  v1.8
//  iOS Safari : unlock synchrone dans le geste bouton JOUER
// ============================================================
let audioCtx=null, musicPlaying=false, currentMusicLevel=-1, musicNodes=[];

const MUSIC=[
  {bpm:160,notes:[1047,1175,1319,1568,1760,1568,1319,1175,1047,880,1047,1319,1760,1319,1047,880],type:'triangle',gain:0.15,echo:true},
  {bpm:100,notes:[261,294,330,349,392,349,330,294,261,220,247,294,392,330,294,261],              type:'sine',    gain:0.18,echo:true},
  {bpm:180,notes:[523,587,659,698,784,698,659,587,523,659,784,880,784,659,523,440],              type:'square',  gain:0.08,echo:false},
  {bpm:200,notes:[440,466,494,523,554,587,622,659,698,659,622,587,554,523,466,440],              type:'sawtooth',gain:0.08,echo:false},
];

function initAudio(){
  if(!audioCtx) audioCtx=new(window.AudioContext||window.webkitAudioContext)();
  // Unlock iOS : buffer silencieux synchrone dans le geste utilisateur
  try {
    const buf=audioCtx.createBuffer(1,1,22050);
    const src=audioCtx.createBufferSource();
    src.buffer=buf; src.connect(audioCtx.destination); src.start(0);
  } catch(e){}
  if(audioCtx.state==='suspended') audioCtx.resume();
}

function startMusic(idx){
  if(!audioCtx) return;
  if(audioCtx.state==='suspended') audioCtx.resume();
  if(currentMusicLevel===idx&&musicPlaying) return;
  stopMusic();
  currentMusicLevel=idx; musicPlaying=true;
  const m=MUSIC[idx];
  const beatDur=60/m.bpm, noteDur=beatDur*0.82;
  const master=audioCtx.createGain();
  master.gain.setValueAtTime(m.gain,audioCtx.currentTime);
  master.connect(audioCtx.destination);
  musicNodes.push(master);
  if(m.echo){
    const delay=audioCtx.createDelay(0.5);
    const fb=audioCtx.createGain();
    delay.delayTime.value=0.2; fb.gain.value=0.25;
    delay.connect(fb); fb.connect(delay);
    master.connect(delay); delay.connect(audioCtx.destination);
    musicNodes.push(delay,fb);
  }
  let ni=0, nt=audioCtx.currentTime+0.05;
  function sched(){
    if(!musicPlaying||currentMusicLevel!==idx) return;
    while(nt<audioCtx.currentTime+0.4){
      const freq=m.notes[ni++%m.notes.length];
      const osc=audioCtx.createOscillator();
      const env=audioCtx.createGain();
      osc.type=m.type; osc.frequency.setValueAtTime(freq,nt);
      env.gain.setValueAtTime(0,nt);
      env.gain.linearRampToValueAtTime(1,nt+0.012);
      env.gain.setValueAtTime(1,nt+noteDur*0.6);
      env.gain.linearRampToValueAtTime(0,nt+noteDur);
      osc.connect(env); env.connect(master);
      osc.start(nt); osc.stop(nt+noteDur+0.02);
      nt+=beatDur;
    }
    setTimeout(sched,150);
  }
  sched();
}

function stopMusic(){
  musicPlaying=false;
  musicNodes.forEach(n=>{try{n.disconnect();}catch(_){}});
  musicNodes=[]; currentMusicLevel=-1;
}

function createMuteButton(){
  const btn=document.createElement('button');
  btn.id='mute-btn'; btn.textContent='🔊';
  let muted=false;
  Object.assign(btn.style,{
    position:'fixed',bottom:'12px',right:'12px',
    background:'rgba(0,0,0,0.6)',color:'#fff',
    border:'2px solid #ffd700',borderRadius:'50%',
    width:'40px',height:'40px',fontSize:'18px',
    cursor:'pointer',zIndex:'9998',
  });
  btn.addEventListener('click',()=>{
    muted=!muted; btn.textContent=muted?'🔇':'🔊';
    if(muted) stopMusic();
    else { initAudio(); startMusic(currentLevel); }
  });
  document.body.appendChild(btn);
}
