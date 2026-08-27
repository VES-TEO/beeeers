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

function safely(fn: (audioCtx: AudioContext) => void) {
  try {
    const audioCtx = getCtx();
    if (audioCtx) fn(audioCtx);
  } catch {
    // audio is a nice-to-have, never worth surfacing an error for
  }
}

/** Short descending "glug" — played when a beer is successfully logged. */
export function playGlug() {
  safely((audioCtx) => {
    tone(520, 0, 0.12, "sine", 0.18, audioCtx);
    tone(390, 0.09, 0.14, "sine", 0.16, audioCtx);
    tone(300, 0.18, 0.16, "sine", 0.14, audioCtx);
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
