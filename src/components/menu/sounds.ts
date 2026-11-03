/** Synthesised sound effects, so the menu has no audio files to download. */

// Keep these timings in step with the animations in globals.css.
const POUR_SECONDS = 1.3;
const FLIP_SECONDS = 1.4;
const FLIP_TOSS_AT = 0.3;
const FLIP_LAND_AT = 0.99;
const SHISHA_SECONDS = 1.35;

let ctx: AudioContext | null = null;
let stopCurrent: (() => void) | null = null;

export const playPourSound = () => play(schedulePour);
export const playFlipSound = () => play(scheduleFlip);
export const playShishaSound = () => play(scheduleShisha);

function play(schedule: (audio: AudioContext) => () => void) {
  try {
    ctx ??= new AudioContext();
    // Browsers keep audio suspended until a tap; this always runs from one.
    if (ctx.state === "suspended") void ctx.resume();
    stopCurrent?.();
    stopCurrent = schedule(ctx);
  } catch {
    // Sound is decoration: never let it get in the way of adding to the order.
  }
}

function schedulePour(audio: AudioContext) {
  const now = audio.currentTime;
  const end = now + POUR_SECONDS;

  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.5, now + 0.08);
  master.gain.setValueAtTime(0.5, end - 0.35);
  master.gain.exponentialRampToValueAtTime(0.0001, end);
  master.connect(audio.destination);

  // The stream of liquid: filtered noise that rises in pitch as the cup fills.
  const noise = noiseSource(audio, POUR_SECONDS);
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
    const at = now + 0.1 + Math.random() * (POUR_SECONDS - 0.4);
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
  return fadeOut(audio, master);
}

function scheduleFlip(audio: AudioContext) {
  const now = audio.currentTime;
  const toss = now + FLIP_TOSS_AT;
  const land = now + FLIP_LAND_AT;
  const end = now + FLIP_SECONDS;

  const master = audio.createGain();
  master.gain.value = 0.5;
  master.connect(audio.destination);

  // A soft sizzle underneath, picking up briefly when the pancake lands.
  const sizzle = noiseSource(audio, FLIP_SECONDS);
  const sizzleTone = audio.createBiquadFilter();
  sizzleTone.type = "highpass";
  sizzleTone.frequency.value = 5000;
  const sizzleLevel = audio.createGain();
  sizzleLevel.gain.setValueAtTime(0.0001, now);
  sizzleLevel.gain.exponentialRampToValueAtTime(0.05, now + 0.15);
  sizzleLevel.gain.setValueAtTime(0.05, land);
  sizzleLevel.gain.exponentialRampToValueAtTime(0.16, land + 0.03);
  sizzleLevel.gain.exponentialRampToValueAtTime(0.0001, end);
  sizzle.connect(sizzleTone).connect(sizzleLevel).connect(master);
  sizzle.start(now);
  sizzle.stop(end);

  // The whoosh of the toss.
  const whoosh = noiseSource(audio, 0.45);
  const whooshTone = audio.createBiquadFilter();
  whooshTone.type = "bandpass";
  whooshTone.Q.value = 0.9;
  whooshTone.frequency.setValueAtTime(350, toss);
  whooshTone.frequency.exponentialRampToValueAtTime(1500, toss + 0.2);
  whooshTone.frequency.exponentialRampToValueAtTime(450, toss + 0.45);
  const whooshLevel = audio.createGain();
  whooshLevel.gain.setValueAtTime(0.0001, toss);
  whooshLevel.gain.exponentialRampToValueAtTime(0.9, toss + 0.16);
  whooshLevel.gain.exponentialRampToValueAtTime(0.0001, toss + 0.45);
  whoosh.connect(whooshTone).connect(whooshLevel).connect(master);
  whoosh.start(toss);

  // A soft thud as it lands back in the pan.
  const thud = audio.createOscillator();
  thud.frequency.setValueAtTime(170, land);
  thud.frequency.exponentialRampToValueAtTime(70, land + 0.12);
  const thudLevel = audio.createGain();
  thudLevel.gain.setValueAtTime(0.0001, land);
  thudLevel.gain.exponentialRampToValueAtTime(0.7, land + 0.012);
  thudLevel.gain.exponentialRampToValueAtTime(0.0001, land + 0.16);
  thud.connect(thudLevel).connect(master);
  thud.start(land);
  thud.stop(land + 0.17);

  sizzle.onended = () => master.disconnect();
  return fadeOut(audio, master);
}

function scheduleShisha(audio: AudioContext) {
  const now = audio.currentTime;
  const end = now + SHISHA_SECONDS;

  const master = audio.createGain();
  master.gain.setValueAtTime(0.0001, now);
  master.gain.exponentialRampToValueAtTime(0.5, now + 0.12);
  master.gain.setValueAtTime(0.5, end - 0.3);
  master.gain.exponentialRampToValueAtTime(0.0001, end);
  master.connect(audio.destination);

  // The breath drawn through the hose: quiet, muffled noise.
  const breath = noiseSource(audio, SHISHA_SECONDS);
  const breathTone = audio.createBiquadFilter();
  breathTone.type = "lowpass";
  breathTone.frequency.value = 700;
  const breathLevel = audio.createGain();
  breathLevel.gain.value = 0.12;
  breath.connect(breathTone).connect(breathLevel).connect(master);
  breath.start(now);
  breath.stop(end);

  // Water bubbling in the base: a quick, uneven run of low, rising blips.
  for (let at = now + 0.1; at < end - 0.2; at += 0.05 + Math.random() * 0.07) {
    const pitch = 130 + Math.random() * 170;
    const bubble = audio.createOscillator();
    bubble.frequency.setValueAtTime(pitch, at);
    bubble.frequency.exponentialRampToValueAtTime(pitch * 1.9, at + 0.06);
    const level = audio.createGain();
    level.gain.setValueAtTime(0.0001, at);
    level.gain.exponentialRampToValueAtTime(0.5, at + 0.012);
    level.gain.exponentialRampToValueAtTime(0.0001, at + 0.08);
    bubble.connect(level).connect(master);
    bubble.start(at);
    bubble.stop(at + 0.09);
  }

  breath.onended = () => master.disconnect();
  return fadeOut(audio, master);
}

/** Cuts a sound off quickly when another item is added while it plays. */
function fadeOut(audio: AudioContext, master: GainNode) {
  return () => {
    const t = audio.currentTime;
    master.gain.cancelScheduledValues(t);
    master.gain.setTargetAtTime(0.0001, t, 0.015);
  };
}

function noiseSource(audio: AudioContext, seconds: number) {
  const buffer = audio.createBuffer(1, Math.ceil(audio.sampleRate * seconds), audio.sampleRate);
  const samples = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) samples[i] = Math.random() * 2 - 1;
  const source = audio.createBufferSource();
  source.buffer = buffer;
  return source;
}
