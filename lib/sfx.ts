// Sound effects, made entirely in code: no audio files to host or download.
//
// Every effect is a small recipe of notes (pitch, start, length, shape). There are two ways to play a recipe:
//
//  "always" (the default): the recipe is rendered to a short WAV file in plain JavaScript (a tiny software synthesizer,
//   no Web Audio involved), and played through a pool of ordinary <audio> elements. This is the dependable path on
//   iPhones: audio elements play on the media channel, so the ring/silent switch does not mute them, and they do not
//   suffer from Web Audio's iOS problems (a context that stays suspended, goes "interrupted", or reports running while
//   silent). The cost is that playing media can pause music playing in the background.
//  "polite": the recipe is played live with the Web Audio API on the ambient channel. It mixes with the person's music
//   and respects the silent switch, but it is the fragile path on iOS, so it is opt-in (profile setting).
//
// Browsers only allow audio after a tap, and iOS only after a FINISHED tap, per element: `unlock()` (called from every
// tap by Session.tsx until it has worked) plays a silent clip on each element of the pool inside the tap, after which
// they can be reused for any effect from timers. `audioStatus()` reports what happened, for the profile's sound test.
//
// Preferences in localStorage (per person, per device): sound on/off and the mode.

const KEY = "fitfam.sound";
const MODE_KEY = "fitfam.sound.mode";

// ---------- preferences ----------

let muted: boolean | null = null;
let polite: boolean | null = null;

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

/** "polite": Web Audio on the ambient channel (mixes with music, obeys the silent switch). Default: always heard. */
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
}

// ---------- notes: the recipe language ----------

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

type NoteEvent = { freq: number; at: number; dur: number; v: Voice };
type NoiseEvent = { at: number; dur: number; from: number; to: number; peak: number };

/** While an effect is being rendered to a file, its notes are collected here instead of being played. */
let recorder: { notes: NoteEvent[]; noises: NoiseEvent[] } | null = null;

// ---------- the software synthesizer (recipe -> WAV) ----------

const RATE = 22050;
const ECHO_DELAY = 0.18;
const ECHO_FEEDBACK = 0.32;
const ECHO_LEVEL = 0.5;
const MASTER = 0.55;
/** Audio elements cannot be turned up from the page (iPhones fix their volume), so the loudness is baked into the files. */
const FILE_BOOST = 3.2;

function renderRecipe(notes: NoteEvent[], noises: NoiseEvent[]): Int16Array {
  const hasEcho = notes.some((n) => (n.v.echo ?? 0) > 0);
  const end = Math.max(0.05, ...notes.map((n) => n.at + n.dur), ...noises.map((n) => n.at + n.dur)) + (hasEcho ? 0.9 : 0.05);
  const total = Math.min(Math.ceil(end * RATE), RATE * 7);
  const dry = new Float32Array(total);
  const send = new Float32Array(total);

  for (const { freq, at, dur, v } of notes) {
    const start = Math.floor(at * RATE);
    const count = Math.min(Math.floor(dur * RATE), total - start);
    if (count <= 0) continue;
    const peak = v.peak ?? 0.2;
    const attack = Math.min(v.attack ?? 0.004, dur * 0.5);
    const floor = 0.0001;
    const base = freq * Math.pow(2, (v.detune ?? 0) / 1200);
    const cutoff = v.lowpass ? 1 - Math.exp((-2 * Math.PI * v.lowpass) / RATE) : 1;
    const echo = v.echo ?? 0;
    let phase = 0;
    let filtered = 0;
    for (let i = 0; i < count; i++) {
      const t = i / RATE;
      const hz = v.slideTo ? base * Math.pow(v.slideTo / base, t / dur) : base;
      phase += hz / RATE;
      const frac = phase - Math.floor(phase);
      let wave: number;
      switch (v.type ?? "sine") {
        case "triangle":
          wave = 4 * Math.abs(frac - 0.5) - 1;
          break;
        case "square":
          wave = frac < 0.5 ? 1 : -1;
          break;
        case "sawtooth":
          wave = 2 * frac - 1;
          break;
        default:
          wave = Math.sin(2 * Math.PI * phase);
      }
      // the same exponential attack and decay a Web Audio gain node would draw
      const gain = t < attack ? floor * Math.pow(peak / floor, t / attack) : peak * Math.pow(floor / peak, (t - attack) / Math.max(1e-6, dur - attack));
      let x = wave * gain;
      if (v.lowpass) {
        filtered += cutoff * (x - filtered);
        x = filtered;
      }
      dry[start + i] += x;
      if (echo) send[start + i] += x * echo;
    }
  }

  // whooshes: noise through a band-pass filter whose centre glides
  let seed = 12345;
  for (const { at, dur, from, to, peak } of noises) {
    const start = Math.floor(at * RATE);
    const count = Math.min(Math.floor(dur * RATE), total - start);
    let low = 0;
    let band = 0;
    for (let i = 0; i < count; i++) {
      const t = i / RATE;
      seed = (Math.imul(seed, 1664525) + 1013904223) >>> 0;
      const noiseSample = (seed / 4294967296) * 2 - 1;
      const centre = from * Math.pow(to / from, t / dur);
      const f = 2 * Math.sin((Math.PI * centre) / RATE);
      const high = noiseSample - low - band / 1.4;
      band += f * high;
      low += f * band;
      const rise = dur * 0.35;
      const floor = 0.0001;
      const gain = t < rise ? floor * Math.pow(peak / floor, t / rise) : peak * Math.pow(floor / peak, (t - rise) / Math.max(1e-6, dur - rise));
      dry[start + i] += band * gain * 1.6;
    }
  }

  // the shared echo: a feedback delay fed by the sends
  const delay = Math.round(ECHO_DELAY * RATE);
  const echoOut = new Float32Array(total);
  if (hasEcho) {
    for (let i = delay; i < total; i++) echoOut[i] = send[i - delay] * ECHO_LEVEL + echoOut[i - delay] * ECHO_FEEDBACK;
  }

  const out = new Int16Array(total);
  for (let i = 0; i < total; i++) {
    const mixed = (dry[i] + echoOut[i]) * MASTER * FILE_BOOST;
    out[i] = Math.round(Math.tanh(mixed * 1.4) * 0.92 * 32767); // a soft limiter keeps stacked notes from clipping
  }
  return out;
}

function toWavUrl(samples: Int16Array): string {
  const bytes = new Uint8Array(44 + samples.length * 2);
  const view = new DataView(bytes.buffer);
  const text = (offset: number, value: string) => [...value].forEach((ch, k) => view.setUint8(offset + k, ch.charCodeAt(0)));
  text(0, "RIFF");
  view.setUint32(4, 36 + samples.length * 2, true);
  text(8, "WAVEfmt ");
  view.setUint32(16, 16, true);
  view.setUint16(20, 1, true); // PCM
  view.setUint16(22, 1, true); // mono
  view.setUint32(24, RATE, true);
  view.setUint32(28, RATE * 2, true);
  view.setUint16(32, 2, true);
  view.setUint16(34, 16, true);
  text(36, "data");
  view.setUint32(40, samples.length * 2, true);
  for (let i = 0; i < samples.length; i++) view.setInt16(44 + i * 2, samples[i], true);
  return URL.createObjectURL(new Blob([bytes], { type: "audio/wav" }));
}

function silentUrl(): string {
  return toWavUrl(new Int16Array(RATE / 10));
}

// ---------- the audio-element pool ("always" mode) ----------

const POOL_SIZE = 10;
type PoolEl = HTMLAudioElement & { ffUnlocked?: boolean; ffStarted?: number };
const pool: PoolEl[] = [];
const wavCache = new Map<string, string>();
let lastError = "";
let lastPlay = "";
let lastEl: PoolEl | null = null;
let silent: string | null = null;
let warmed = false;

function ensurePool() {
  if (pool.length > 0 || typeof document === "undefined") return;
  for (let i = 0; i < POOL_SIZE; i++) {
    const el = new Audio() as PoolEl;
    el.preload = "auto";
    el.setAttribute("playsinline", "");
    pool.push(el);
  }
}

/** Inside a tap: play a silent clip on every element, which is what lets them play effects later from timers. */
function unlockPool() {
  ensurePool();
  lastError = ""; // the status shows the latest attempt, not an old failure
  silent ??= silentUrl();
  for (const el of pool) {
    if (el.ffUnlocked) continue;
    el.src = silent;
    const started = el.play();
    if (started) {
      started
        .then(() => {
          if (el.src === silent) el.pause(); // not if an effect has already taken this element over
          el.ffUnlocked = true;
        })
        .catch((error: unknown) => {
          const name = error instanceof Error ? error.name : String(error);
          // an effect took the element over mid-clip: the tap still started playback, so it is open
          if (name === "AbortError") el.ffUnlocked = true;
          else lastError = name;
        });
    }
  }
}

function renderSamples(recipe: () => void): Int16Array {
  const rec: { notes: NoteEvent[]; noises: NoiseEvent[] } = { notes: [], noises: [] };
  recorder = rec;
  try {
    recipe();
  } finally {
    recorder = null;
  }
  return renderRecipe(rec.notes, rec.noises);
}

function renderToUrl(recipe: () => void): string {
  return toWavUrl(renderSamples(recipe));
}

/**
 * Diagnostics for a phone that stays silent: plays the same chime three different ways, each called straight from a tap,
 * and reports what the browser said. "pool" = the normal engine, "fresh" = a brand-new audio element, "webaudio" = a
 * Web Audio buffer.
 */
export function testVariant(kind: "pool" | "fresh" | "webaudio"): Promise<string> {
  const wait = (ms: number) => new Promise((resolve) => window.setTimeout(resolve, ms));
  if (kind === "pool") {
    unlockPool();
    playRendered("test:correct", recipes.correct);
    return wait(1200).then(() => audioStatus());
  }
  if (kind === "fresh") {
    const el = new Audio() as HTMLAudioElement;
    el.setAttribute("playsinline", "");
    el.src = toWavUrl(renderSamples(recipes.correct));
    let outcome = "ההפעלה עדיין ממתינה";
    el.play().then(
      () => (outcome = "הנגן אישר שהוא מנגן"),
      (error: unknown) => (outcome = `נדחה: ${error instanceof Error ? error.name : String(error)}`),
    );
    return wait(1200).then(() => `נגן חדש: ${outcome} · זמן ניגון ${el.currentTime.toFixed(2)} ש׳ · מושהה ${el.paused ? "כן" : "לא"} · מוכנות ${el.readyState}`);
  }
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return Promise.resolve("Web Audio לא נתמך");
  const c = new AC();
  void c.resume().catch(() => undefined);
  const samples = renderSamples(recipes.correct);
  const buffer = c.createBuffer(1, samples.length, RATE);
  const channel = buffer.getChannelData(0);
  for (let i = 0; i < samples.length; i++) channel[i] = samples[i] / 32768;
  const source = c.createBufferSource();
  source.buffer = buffer;
  source.connect(c.destination);
  source.start(0);
  const before = c.currentTime;
  return wait(1000).then(() => `Web Audio: מצב ${c.state} · השעון התקדם ${(c.currentTime - before).toFixed(2)} ש׳`);
}

function playRendered(key: string, recipe: () => void) {
  ensurePool();
  if (pool.length === 0) return;
  let url = wavCache.get(key);
  if (!url) {
    url = renderToUrl(recipe);
    wavCache.set(key, url);
  }
  // a free element if there is one, else the one that has been playing longest
  const ready = pool.some((p) => p.ffUnlocked) ? pool.filter((p) => p.ffUnlocked) : pool; // only elements a tap has opened
  const el = ready.find((p) => p.paused || p.ended) ?? [...ready].sort((a, b) => (a.ffStarted ?? 0) - (b.ffStarted ?? 0))[0];
  el.src = url;
  el.currentTime = 0;
  el.ffStarted = performance.now();
  lastEl = el;
  lastPlay = "ביקשנו הפעלה";
  const started = el.play();
  if (started) {
    started
      .then(() => {
        lastPlay = "הנגן אישר שהוא מנגן";
      })
      .catch((error: unknown) => {
        const name = error instanceof Error ? error.name : String(error);
        if (name !== "AbortError") lastError = name; // AbortError = replaced by a newer sound, not a failure
      });
  }
}

// ---------- Web Audio ("polite" mode) ----------

let ctx: AudioContext | null = null;
let master: GainNode | null = null;
let wet: GainNode | null = null;
let noiseBuffer: AudioBuffer | null = null;

function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const AC = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  ctx = new AC();
  void ctx.resume().catch(() => undefined);

  const compressor = ctx.createDynamicsCompressor();
  compressor.threshold.value = -14;
  compressor.ratio.value = 6;
  master = ctx.createGain();
  master.gain.value = MASTER;
  master.connect(compressor).connect(ctx.destination);

  const delay = ctx.createDelay(1);
  delay.delayTime.value = ECHO_DELAY;
  const feedback = ctx.createGain();
  feedback.gain.value = ECHO_FEEDBACK;
  wet = ctx.createGain();
  wet.gain.value = ECHO_LEVEL;
  wet.connect(delay);
  delay.connect(feedback).connect(delay);
  delay.connect(master);

  noiseBuffer = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate);
  const data = noiseBuffer.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = Math.random() * 2 - 1;
  return ctx;
}

function liveNote(freq: number, at: number, dur: number, v: Voice) {
  const c = audio();
  if (!c || !master) return;
  if (c.state !== "running") void c.resume().catch(() => undefined);
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

function liveWhoosh(at: number, dur: number, from: number, to: number, peak: number) {
  const c = audio();
  if (!c || !master || !noiseBuffer) return;
  if (c.state !== "running") void c.resume().catch(() => undefined);
  const t = c.currentTime + at;
  const src = c.createBufferSource();
  src.buffer = noiseBuffer;
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

/** Schedules one note `at` seconds from now: recorded when an effect is being rendered, played live otherwise. */
function note(freq: number, at: number, dur: number, v: Voice = {}) {
  if (recorder) recorder.notes.push({ freq, at, dur, v });
  else liveNote(freq, at, dur, v);
}

function whooshNoise(at: number, dur: number, from: number, to: number, peak = 0.22) {
  if (recorder) recorder.noises.push({ at, dur, from, to, peak });
  else liveWhoosh(at, dur, from, to, peak);
}

/** A bell-like note: a sine with a quiet octave above it, decaying together. */
function bell(freq: number, at: number, dur: number, peak = 0.2, echo = 0.5) {
  note(freq, at, dur, { type: "sine", peak, echo });
  note(freq * 2, at, dur * 0.6, { type: "sine", peak: peak * 0.35, echo });
  note(freq * 3.01, at, dur * 0.3, { type: "sine", peak: peak * 0.12, echo });
}

// ---------- unlocking and status ----------

/** Call from a tap (touchend / click / key). Safe and cheap to repeat until it has worked. */
export function unlock() {
  if (isPolite()) {
    const c = audio();
    if (!c) return;
    if (c.state !== "running") void c.resume().catch(() => undefined);
    try {
      const quiet = c.createBufferSource();
      quiet.buffer = c.createBuffer(1, 1, 22050);
      quiet.connect(c.destination);
      quiet.start(0);
    } catch {
      // the resume above is what matters
    }
    return;
  }
  unlockPool();
  // get the big effects ready now, a few at a time, so the first level-up does not stutter while it is being rendered
  if (!warmed) {
    warmed = true;
    const early: [string, () => void][] = [
      ["workoutComplete", recipes.workoutComplete],
      ["levelUp", levelUpRecipe],
      ["challengePass", recipes.challengePass],
      ["coin", recipes.coin],
      ["correct", recipes.correct],
      ["streak", recipes.streak],
      ["go", recipes.go],
      ["step", recipes.step],
      ["tap", recipes.tap],
      ["setDone", recipes.setDone],
    ];
    early.forEach(([name, recipe], i) => {
      window.setTimeout(() => {
        const key = `${name}:`;
        if (!wavCache.has(key)) wavCache.set(key, renderToUrl(recipe));
      }, 300 + i * 120);
    });
  }
}

/** True once the browser is really letting us play. */
export function isRunning(): boolean {
  if (isPolite()) return ctx !== null && ctx.state === "running";
  return pool.some((el) => el.ffUnlocked);
}

/** A readable status for the profile's sound test: which engine, whether it is unlocked, and the last error. */
export function audioStatus(): string {
  if (isPolite()) {
    return `מצב מכבד: Web Audio · מצב המנוע ${ctx ? ctx.state : "לא נוצר"}${lastError ? ` · שגיאה ${lastError}` : ""}`;
  }
  if (isMuted()) return "הצלילים כבויים (המתג בכותרת או בפרופיל). הפעילו אותם ונסו שוב.";
  const open = pool.filter((el) => el.ffUnlocked).length;
  const detail = lastEl
    ? ` · ${lastPlay} · משך ${Number.isFinite(lastEl.duration) ? lastEl.duration.toFixed(1) : "?"} ש׳ · עוצמה ${lastEl.volume} · מושתק ${lastEl.muted ? "כן" : "לא"} · מוכנות ${lastEl.readyState}`
    : " · עוד לא הושמע צליל";
  return `מצב רגיל: נגן אודיו · נפתחו ${open} מתוך ${pool.length || POOL_SIZE}${lastError ? ` · שגיאה אחרונה ${lastError}` : " · אין שגיאות"}${detail}`;
}

const jitter = (n: number, pct = 0.015) => n * (1 + (Math.random() * 2 - 1) * pct);

// pitches (Hz) used below
const C4 = 261.63, E4 = 329.63, G4 = 392, A4 = 440, C5 = 523.25, E5 = 659.25, G5 = 783.99, A5 = 880, B5 = 987.77, C6 = 1046.5, E6 = 1318.51, G6 = 1567.98, C7 = 2093;

// ---------- the effects ----------

/** the account levels up: a thump, a brassy rising fanfare, a chord, and showers of sparkle */
function levelUpRecipe() {
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
}

const recipes = {
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

  levelUp: levelUpRecipe,

  /** a level challenge passed: the level fanfare, then a second, higher burst */
  challengePass() {
    levelUpRecipe();
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

/** Plays one effect through whichever engine the person's mode asks for. */
function play<A extends unknown[]>(name: string, recipe: (...args: A) => void, ...args: A) {
  if (isMuted()) return;
  if (isPolite()) {
    recipe(...args);
    return;
  }
  playRendered(`${name}:${args.join(",")}`, () => recipe(...args));
}

export const sfx = {
  unlock,
  tap: () => play("tap", recipes.tap),
  step: () => play("step", recipes.step),
  back: () => play("back", recipes.back),
  countdown: () => play("countdown", recipes.countdown),
  go: () => play("go", recipes.go),
  timerDone: () => play("timerDone", recipes.timerDone),
  setDone: () => play("setDone", recipes.setDone),
  correct: () => play("correct", recipes.correct),
  pointTick: (index: number) => play("pointTick", recipes.pointTick, index),
  coin: () => play("coin", recipes.coin),
  workoutComplete: () => play("workoutComplete", recipes.workoutComplete),
  levelUp: () => play("levelUp", recipes.levelUp),
  challengePass: () => play("challengePass", recipes.challengePass),
  streak: () => play("streak", recipes.streak),
  whoosh: () => play("whoosh", recipes.whoosh),
  fill: (durationSec: number) => play("fill", recipes.fill, Math.round(durationSec * 10) / 10),
  sparkle: () => play("sparkle", recipes.sparkle),
  notYet: () => play("notYet", recipes.notYet),
};

/** A short buzz on phones that support it, to go with the big moments (iPhones do not support vibration in the browser). */
export function haptic(pattern: number | number[]) {
  try {
    if (!readMuted()) navigator.vibrate?.(pattern);
  } catch {
    // haptics are a nicety
  }
}
