"use client";

// Tiny synthesized sound effects via the Web Audio API — no audio assets to
// upload/host, just oscillator envelopes. Every call is wrapped so a blocked
// AudioContext (autoplay policy, unsupported browser) never breaks the UI.

let ctx: AudioContext | null = null;
function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  const Ctor = window.AudioContext || (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!Ctor) return null;
  if (!ctx) ctx = new Ctor();
  if (ctx.state === "suspended") ctx.resume().catch(() => {});
  return ctx;
}

function tone(freq: number, start: number, duration: number, type: OscillatorType, gain: number, audioCtx: AudioContext) {
  const osc = audioCtx.createOscillator();
  const g = audioCtx.createGain();
  osc.type = type;
  osc.frequency.setValueAtTime(freq, audioCtx.currentTime + start);
  g.gain.setValueAtTime(0, audioCtx.currentTime + start);
  g.gain.linearRampToValueAtTime(gain, audioCtx.currentTime + start + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + start + duration);
  osc.connect(g);
  g.connect(audioCtx.destination);
  osc.start(audioCtx.currentTime + start);
  osc.stop(audioCtx.currentTime + start + duration + 0.05);
}

/** A short burst of filtered white noise — the "fizz" after a cap comes off. */
function fizz(start: number, duration: number, gain: number, audioCtx: AudioContext) {
  const sampleCount = Math.floor(audioCtx.sampleRate * duration);
  const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount) ** 2;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const filter = audioCtx.createBiquadFilter();
  filter.type = "highpass";
  filter.frequency.value = 3500;
  const g = audioCtx.createGain();
  g.gain.setValueAtTime(gain, audioCtx.currentTime + start);
  noise.connect(filter);
  filter.connect(g);
  g.connect(audioCtx.destination);
  noise.start(audioCtx.currentTime + start);
}

function safely(fn: (audioCtx: AudioContext) => void) {
  try {
    const audioCtx = getCtx();
    if (audioCtx) fn(audioCtx);
  } catch {
    // audio is a nice-to-have, never worth surfacing an error for
  }
}

/** A bottle cap popping open (sharp pitch-dropping "pok" + a fizzy tail) —
 * played when a beer is successfully logged. */
export function playBottlePop() {
  safely((audioCtx) => {
    const osc = audioCtx.createOscillator();
    const g = audioCtx.createGain();
    osc.type = "triangle";
    osc.frequency.setValueAtTime(1900, audioCtx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(140, audioCtx.currentTime + 0.055);
    g.gain.setValueAtTime(0.4, audioCtx.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + 0.09);
    osc.connect(g);
    g.connect(audioCtx.destination);
    osc.start();
    osc.stop(audioCtx.currentTime + 0.1);

    fizz(0.02, 0.35, 0.05, audioCtx);
  });
}

/** Two-tone alarm, like a distant siren — played when the volcano popup appears. */
export function playSiren() {
  safely((audioCtx) => {
    for (let i = 0; i < 2; i++) {
      tone(600, i * 0.32, 0.16, "sawtooth", 0.09, audioCtx);
      tone(760, i * 0.32 + 0.16, 0.16, "sawtooth", 0.09, audioCtx);
    }
  });
}

/** Bright ascending fanfare — played when a new leaderboard leader is crowned. */
export function playFanfare() {
  safely((audioCtx) => {
    [523.25, 659.25, 783.99, 1046.5].forEach((freq, i) => {
      tone(freq, i * 0.09, 0.22, "triangle", 0.15, audioCtx);
    });
  });
}
