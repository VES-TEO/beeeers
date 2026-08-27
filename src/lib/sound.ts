"use client";

// Tiny synthesized sound effects via the Web Audio API — no audio assets to
// upload/host, just oscillator envelopes and filtered noise bursts. Every
// call is wrapped so a blocked AudioContext (autoplay policy, unsupported
// browser) never breaks the UI.

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

/**
 * A burst of white noise shaped by a decay envelope, optionally run through a
 * filter. This is the actual building block for "pop"-type sounds — a real
 * cap/cork pop is acoustically an impulse exciting a resonant air column
 * (the bottle neck), which is exactly what noise-through-a-bandpass models.
 */
function noiseBurst(
  audioCtx: AudioContext,
  opts: {
    start: number;
    duration: number;
    gain: number;
    filterType?: BiquadFilterType;
    filterFreq?: number;
    filterQ?: number;
    curve?: number; // higher = faster initial decay
  }
) {
  const { start, duration, gain, filterType, filterFreq, filterQ, curve = 2 } = opts;
  const sampleCount = Math.max(1, Math.floor(audioCtx.sampleRate * duration));
  const buffer = audioCtx.createBuffer(1, sampleCount, audioCtx.sampleRate);
  const data = buffer.getChannelData(0);
  for (let i = 0; i < sampleCount; i++) {
    data[i] = (Math.random() * 2 - 1) * (1 - i / sampleCount) ** curve;
  }
  const noise = audioCtx.createBufferSource();
  noise.buffer = buffer;
  const g = audioCtx.createGain();
  g.gain.value = gain;
  let node: AudioNode = noise;
  if (filterType) {
    const filter = audioCtx.createBiquadFilter();
    filter.type = filterType;
    filter.frequency.value = filterFreq ?? 1000;
    if (filterQ) filter.Q.value = filterQ;
    node.connect(filter);
    node = filter;
  }
  node.connect(g);
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

/**
 * A cold one getting opened: a sharp broadband "crack" (the cap releasing),
 * immediately followed by the neck's resonant "thock" (bandpass-filtered
 * noise, like tapping a bottle), then a longer, quieter carbonation fizz.
 * Played when a beer is successfully logged.
 */
export function playBottlePop() {
  safely((audioCtx) => {
    // 1) the crack — a few milliseconds of unfiltered noise
    noiseBurst(audioCtx, { start: 0, duration: 0.006, gain: 0.5, curve: 1.2 });

    // 2) the resonant pop — randomized a bit so it doesn't sound identical every time
    const resonantFreq = 190 + Math.random() * 70;
    noiseBurst(audioCtx, {
      start: 0.004,
      duration: 0.05,
      gain: 0.55,
      filterType: "bandpass",
      filterFreq: resonantFreq,
      filterQ: 7,
      curve: 2.5,
    });
    // a faint low thump under the pop, for body
    tone(resonantFreq * 0.7, 0.004, 0.07, "sine", 0.12, audioCtx);

    // 3) the fizz tail — escaping carbonation
    noiseBurst(audioCtx, { start: 0.03, duration: 0.5, gain: 0.045, filterType: "highpass", filterFreq: 4000, curve: 2 });
    noiseBurst(audioCtx, { start: 0.05, duration: 0.35, gain: 0.03, filterType: "bandpass", filterFreq: 6000, filterQ: 0.6, curve: 1.5 });
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
