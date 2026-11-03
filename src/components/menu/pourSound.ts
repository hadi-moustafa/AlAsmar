/** Synthesised coffee-pour sound, so the menu has no audio file to download. */

const DURATION = 1.3; // seconds; keep close to the pour animation in globals.css

let ctx: AudioContext | null = null;
let stopCurrent: (() => void) | null = null;

export function playPourSound() {
  try {
    ctx ??= new AudioContext();
    // Browsers keep audio suspended until a tap; this always runs from one.
    if (ctx.state === "suspended") void ctx.resume();
    stopCurrent?.();
    stopCurrent = schedulePour(ctx);
  } catch {
    // Sound is decoration: never let it get in the way of adding to the order.
  }
}

function schedulePour(audio: AudioContext) {
  const now = audio.currentTime;
  const end = now + DURATION;

  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.5, now + 0.08);
  master.gain.setValueAtTime(0.5, end - 0.35);
  master.gain.exponentialRampToValueAtTime(0.0001, end);
  master.connect(audio.destination);

  // The stream of liquid: filtered noise that rises in pitch as the cup fills.
  const noise = audio.createBufferSource();
  noise.buffer = whiteNoise(audio);
  const stream = audio.createBiquadFilter();
  stream.type = "bandpass";
  stream.Q.value = 1.2;
  stream.frequency.setValueAtTime(550, now);
  stream.frequency.exponentialRampToValueAtTime(1500, end);
  noise.connect(stream).connect(master);
  noise.start(now);
  noise.stop(end);

  // Small bubbles popping on the surface.
  for (let i = 0; i < 12; i++) {
    const at = now + 0.1 + Math.random() * (DURATION - 0.4);
    const pitch = 500 + Math.random() * 700;
    const bubble = audio.createOscillator();
    bubble.frequency.setValueAtTime(pitch, at);
    bubble.frequency.exponentialRampToValueAtTime(pitch * 1.7, at + 0.05);
    const level = audio.createGain();
    level.gain.setValueAtTime(0.0001, at);
    level.gain.exponentialRampToValueAtTime(0.1, at + 0.01);
    level.gain.exponentialRampToValueAtTime(0.0001, at + 0.06);
    bubble.connect(level).connect(master);
    bubble.start(at);
    bubble.stop(at + 0.07);
  }

  noise.onended = () => master.disconnect();

  // Cuts this pour off quickly when another item is added mid-pour.
  return () => {
    const t = audio.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(0.0001, t, 0.015);
  };
}

function whiteNoise(audio: AudioContext) {
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * DURATION), audio.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  return buffer;
}
