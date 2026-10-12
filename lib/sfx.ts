// Sound effects, synthesized in the browser with the Web Audio API: no audio files to host or download.
//
// The palette follows what makes game-like apps (Duolingo and friends) feel good: a short bright major-interval chime
// for "right", a soft low two-note for "not yet", a coin-like ding when points land, rapid rising ticks while a score
// counts up, a jingle when a lesson ends, a bigger fanfare for a level, a whoosh for a streak. Every sound is built
// from a few oscillators with a quick envelope, scheduled on the audio clock (never with setTimeout), and slightly
// randomised so repeated sounds do not feel mechanical.
//
// Browsers keep audio suspended until the user touches the page, so `unlock()` is called from taps (Session.tsx).
// iPhones are the strict case, and the reason this file has so much unlocking in it:
//   - iOS only counts a tap that has FINISHED (touchend / click) as a gesture, not pointerdown, and it can suspend the
//     context again (app switch, a call), so every tap tries to resume until it is really running;
//   - Web Audio follows the ring/silent switch by default (the "ambient" audio session), so on a muted phone nothing
//     plays. `navigator.audioSession.type = "playback"` (iOS 16.4+) moves it to the media channel; older iPhones get a
//     silent looping <audio> element that does the same. The cost of "playback" is that it can pause music playing in
//     the background, so there is a "polite" mode (profile setting) that keeps the default behaviour.
// Two preferences live in localStorage (per person, per device): sound on/off and sound mode.

const KEY = "fitfam.sound";
const MODE_KEY = "fitfam.sound.mode";

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let noise: AudioBuffer | null = null;
let muted: boolean | null = null;
let polite: boolean | null = null;
let silentAudio: HTMLAudioElement | null = null;

type Voice = {
  type?: OscillatorType;
  peak?: number;
  attack?: number;
  release?: number;
  /** glide to this frequency over the note */
  slideTo?: number;
  /** low-pass cutoff, to soften saw/square into something brass-like */
  lowpass?: number;
  /** how much goes to the shared echo (0..1) */
  echo?: number;
  detune?: number;
};

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  // a new context is often created suspended even inside a tap: ask for it to run right away
  void ctx.resume().catch(() => undefined);
  // tell the app when the engine stops running (iOS suspends it on an app switch or a call), so it can try again on the next tap
  ctx.addEventListener("statechange", () => window.dispatchEvent(new Event("ff-audio-state")));

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.ratio.value = 6;
  master = ctx.createGain();
  master.gain.value = 0.55;
  master.connect(compressor).connect(ctx.destination);

  // one shared echo: a short feedback delay that gives the chimes some air
  const delay = ctx.createDelay(1);
  delay.delayTime.value = 0.18;
  const feedback = ctx.createGain();
  feedback.gain.value = 0.32;
  wet = ctx.createGain();
  wet.gain.value = 0.5;
  wet.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(master);

  // a second of white noise, reused by the whoosh
  noise = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noise.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

function readMuted(): boolean {
  if (muted !== null) return muted;
  try {
    muted = window.localStorage.getItem(KEY) === "off";
  } catch {
    muted = false;
  }
  return muted;
}

export function isMuted(): boolean {
  return typeof window === "undefined" ? false : readMuted();
}

export function setMuted(value: boolean) {
  muted = value;
  try {
    window.localStorage.setItem(KEY, value ? "off" : "on");
  } catch {
    // a remembered choice is only a convenience
  }
}

/** "polite": respect the silent switch and never interrupt the person's music. Default is to always be heard. */
export function isPolite(): boolean {
  if (polite !== null) return polite;
  try {
    polite = window.localStorage.getItem(MODE_KEY) === "polite";
  } catch {
    polite = false;
  }
  return polite;
}

export function setPolite(value: boolean) {
  polite = value;
  try {
    window.localStorage.setItem(MODE_KEY, value ? "polite" : "always");
  } catch {
    // a remembered choice is only a convenience
  }
  routeThroughMediaChannel();
}

/** True once the browser is really letting us play. */
export function isRunning(): boolean {
  return ctx !== null && ctx.state === "running";
}

/** One second of silence as a tiny WAV, built here instead of shipped as a file. */
function silentWavUrl(): string {
  const samples = 800;
  const bytes = new Uint8Array(44 + samples).fill(128);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((ch, k) => view.setUint8(offset + k, ch.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true);
  view.setUint16(22, 1, true);
  view.setUint32(24, 8000, true);
  view.setUint32(28, 8000, true);
  view.setUint16(32, 1, true);
  view.setUint16(34, 8, true);
  text(36, "data");
  view.setUint32(40, samples, true);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}

/** Moves the page's audio from the ringer channel (muted by the silent switch) to the media channel, unless polite. */
function routeThroughMediaChannel() {
  if (typeof navigator === "undefined") return;
  const session = (navigator as Navigator & { audioSession?: { type: string } }).audioSession;
  if (session) {
    try {
      session.type = isPolite() ? "auto" : "playback";
    } catch {
      // not supported in this version
    }
    return;
  }
  // older iPhones have no audioSession: a silent looping <audio> puts the page on the media channel
  if (/iP(hone|ad|od)/.test(navigator.userAgent)) {
    if (isPolite()) {
      silentAudio?.pause();
      return;
    }
    if (!silentAudio) {
      silentAudio = document.createElement("audio");
      silentAudio.src = silentWavUrl();
      silentAudio.loop = true;
      silentAudio.setAttribute("playsinline", "");
    }
    void silentAudio.play().catch(() => undefined);
  }
}

/**
 * Call from a tap (touchend / click / key). Creates the audio engine if needed, asks it to run, plays one silent sample
 * (the classic iOS unlock) and sets up the media channel. Safe and cheap to call on every tap until it is running.
 */
export function unlock() {
  const c = audio();
  if (!c) return;
  routeThroughMediaChannel();
  if (c.state !== "running") void c.resume().catch(() => undefined);
  try {
    const silent = c.createBufferSource();
    silent.buffer = c.createBuffer(1, 1, 22050);
    silent.connect(c.destination);
    silent.start(0);
  } catch {
    // the resume above is what matters
  }
}

/** Schedules one note `at` seconds from now. */
function note(freq: number, at: number, dur: number, v: Voice = {}) {
  if (readMuted()) return;
  const c = audio();
  if (!c || !master) return;
  if (c.state !== "running") void c.resume().catch(() => undefined); // after an app switch or a call iOS suspends it again
  const t = c.currentTime + at;
  const osc = c.createOscillator();
  const gain = c.createGain();
  osc.type = v.type ?? "sine";
  osc.frequency.setValueAtTime(freq, t);
  if (v.slideTo) osc.frequency.exponentialRampToValueAtTime(v.slideTo, t + dur);
  if (v.detune) osc.detune.value = v.detune;

  const peak = v.peak ?? 0.2;
  const attack = v.attack ?? 0.004;
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + attack);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);

  let out: AudioNode = gain;
  osc.connect(gain);
  if (v.lowpass) {
    const filter = c.createBiquadFilter();
    filter.type = "lowpass";
    filter.frequency.value = v.lowpass;
    gain.connect(filter);
    out = filter;
  }
  out.connect(master);
  if (v.echo && wet) {
    const send = c.createGain();
    send.gain.value = v.echo;
    out.connect(send).connect(wet);
  }
  osc.start(t);
  osc.stop(t + dur + (v.release ?? 0.05));
}

/** A bell-like note: a sine with a quiet octave above it, decaying together. */
function bell(freq: number, at: number, dur: number, peak = 0.2, echo = 0.5) {
  note(freq, at, dur, { type: "sine", peak, echo });
  note(freq * 2, at, dur * 0.6, { type: "sine", peak: peak * 0.35, echo });
  note(freq * 3.01, at, dur * 0.3, { type: "sine", peak: peak * 0.12, echo });
}

function whooshNoise(at: number, dur: number, from: number, to: number, peak = 0.22) {
  if (readMuted()) return;
  const c = audio();
  if (!c || !master || !noise) return;
  if (c.state !== "running") void c.resume().catch(() => undefined);
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noise;
  src.loop = true;
  const band = c.createBiquadFilter();
  band.type = "bandpass";
  band.Q.value = 1.4;
  band.frequency.setValueAtTime(from, t);
  band.frequency.exponentialRampToValueAtTime(to, t + dur);
  const gain = c.createGain();
  gain.gain.setValueAtTime(0.0001, t);
  gain.gain.exponentialRampToValueAtTime(peak, t + dur * 0.35);
  gain.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  src.connect(band).connect(gain).connect(master);
  src.start(t);
  src.stop(t + dur + 0.05);
}

const jitter = (n: number, pct = 0.015) => n * (1 + (Math.random() * 2 - 1) * pct);

// pitches (Hz) used below
const C4 = 261.63, E4 = 329.63, G4 = 392, A4 = 440, C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, B5 = 987.77, C6 = 1046.5, E6 = 1318.51, G6 = 1567.98, C7 = 2093;

export const sfx = {
  unlock,

  /** a button or tap: tiny and soft */
  tap() {
    note(jitter(680), 0, 0.05, { type: "sine", peak: 0.11, slideTo: 520 });
  },

  /** next step in the guided player: two quick rising notes */
  step() {
    note(C5, 0, 0.07, { type: "triangle", peak: 0.13 });
    note(E5, 0.055, 0.09, { type: "triangle", peak: 0.13 });
  },

  /** back one step: the same two notes, falling and quieter */
  back() {
    note(E5, 0, 0.06, { type: "triangle", peak: 0.09 });
    note(C5, 0.05, 0.08, { type: "triangle", peak: 0.09 });
  },

  /** rest countdown: one beep per second for the last three, then `go` */
  countdown() {
    note(880, 0, 0.1, { type: "sine", peak: 0.2 });
  },
  go() {
    note(1174.66, 0, 0.12, { type: "sine", peak: 0.22 });
    note(1567.98, 0.1, 0.22, { type: "sine", peak: 0.24, echo: 0.4 });
  },

  /** a timer on a timed exercise reaching zero */
  timerDone() {
    [0, 0.16, 0.32].forEach((t) => note(1046.5, t, 0.11, { type: "triangle", peak: 0.22 }));
  },

  /** a set finished: a small bell */
  setDone() {
    bell(G5, 0, 0.28, 0.16, 0.3);
  },

  /** "right": the short bright two-note chime, a major third apart */
  correct() {
    bell(E6, 0, 0.22, 0.2, 0.5);
    bell(jitter(1661.22, 0.004), 0.085, 0.38, 0.22, 0.55);
  },

  /** one tick while a score counts up: pitch climbs with the count */
  pointTick(index: number) {
    note(620 * Math.pow(2, Math.min(index, 36) / 18), 0, 0.035, { type: "square", peak: 0.05, lowpass: 3200 });
  },

  /** the points land: a coin and a sparkle */
  coin() {
    note(B5, 0, 0.09, { type: "square", peak: 0.11, lowpass: 5200, echo: 0.3 });
    note(E6, 0.07, 0.34, { type: "square", peak: 0.13, lowpass: 5200, echo: 0.4 });
    bell(C7, 0.12, 0.3, 0.07, 0.6);
  },

  /** a workout is done: the lesson-complete jingle, a rising run that resolves on a held chord */
  workoutComplete() {
    [C5, E5, G5, C6].forEach((f, i) => {
      note(f, i * 0.085, 0.16, { type: "triangle", peak: 0.2, echo: 0.35 });
      note(f * 2, i * 0.085, 0.1, { type: "sine", peak: 0.05, echo: 0.4 });
    });
    const t = 0.4;
    [C5, E5, G5, C6].forEach((f) => note(f, t, 0.95, { type: "triangle", peak: 0.15, echo: 0.5, detune: Math.random() * 6 - 3 }));
    bell(E6, t + 0.05, 0.8, 0.12, 0.6);
    bell(G6, t + 0.2, 0.7, 0.08, 0.6);
  },

  /** the account levels up: a thump, a brassy rising fanfare, a chord, and showers of sparkle */
  levelUp() {
    note(110, 0, 0.45, { type: "sine", peak: 0.5, slideTo: 42 });
    const run: [number, number][] = [[G4, 0.12], [C5, 0.12], [E5, 0.12], [G5, 0.12], [C6, 0.5]];
    let t = 0.1;
    run.forEach(([f, d], i) => {
      note(f, t, d + 0.08, { type: "sawtooth", peak: 0.17, lowpass: 2600, echo: 0.35 });
      note(f * 1.005, t, d + 0.08, { type: "square", peak: 0.06, lowpass: 2000 });
      t += i < run.length - 2 ? 0.115 : 0.14;
    });
    const chordAt = 0.78;
    [C5, E5, G5, C6, E6].forEach((f) => note(f, chordAt, 1.5, { type: "sawtooth", peak: 0.11, lowpass: 2400, echo: 0.55, detune: Math.random() * 8 - 4 }));
    note(C4, chordAt, 1.5, { type: "triangle", peak: 0.2 });
    for (let i = 0; i < 9; i++) bell(jitter([E6, G6, C7, A5 * 2, B5 * 2][i % 5], 0.01), chordAt + 0.1 + i * 0.12, 0.35, 0.06, 0.7);
  },

  /** a level challenge passed: the level fanfare, then a second, higher burst */
  challengePass() {
    this.levelUp();
    [G5, C6, E6, G6].forEach((f, i) => note(f, 1.5 + i * 0.09, 0.2, { type: "triangle", peak: 0.16, echo: 0.5 }));
    bell(C7, 1.9, 0.9, 0.12, 0.7);
  },

  /** the streak is alive: a whoosh and a warm chord, like a flame catching */
  streak() {
    whooshNoise(0, 0.55, 380, 3400, 0.2);
    [A4 / 2, E4, A4].forEach((f) => note(f, 0.1, 0.7, { type: "triangle", peak: 0.12, echo: 0.4 }));
    bell(E6, 0.32, 0.4, 0.08, 0.5);
  },

  /** generic "something big appears": a short rising whoosh */
  whoosh() {
    whooshNoise(0, 0.35, 300, 2200, 0.14);
  },

  /** the progress bar fills: a rising glide that lasts as long as the fill */
  fill(durationSec: number) {
    note(300, 0, durationSec, { type: "sine", peak: 0.07, slideTo: 960 });
  },

  /** sparkles on their own (the level number lands, the rank is revealed) */
  sparkle() {
    for (let i = 0; i < 5; i++) bell(jitter([C6, E6, G6, C7, E6][i], 0.012), i * 0.07, 0.25, 0.06, 0.6);
  },

  /** "not yet": two soft falling notes, never harsh */
  notYet() {
    note(E4, 0, 0.16, { type: "triangle", peak: 0.15 });
    note(C4 + 6, 0.13, 0.28, { type: "triangle", peak: 0.15 });
  },
};

/** A short buzz on phones that support it, to go with the big moments. */
export function haptic(pattern: number | number[]) {
  try {
    if (!readMuted()) navigator.vibrate?.(pattern);
  } catch {
    // haptics are a nicety
  }
}
