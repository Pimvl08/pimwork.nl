/**
 * A short synthesised paper fold (filtered noise burst). Only used when the
 * visitor switched sound on; never plays on its own.
 */
let audio: AudioContext | null = null;

/** Call inside the click that starts the intro, so the browser allows audio. */
export function primeFoldSound() {
  try {
    const Ctor = window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!Ctor) return;
    audio ??= new Ctor();
    if (audio.state === "suspended") void audio.resume();
  } catch {
    audio = null;
  }
}

export function playFoldSound() {
  const ctx = audio;
  if (!ctx || ctx.state === "closed") return;
  try {
    const duration = 0.42;
    const buffer = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * duration), ctx.sampleRate);
    const data = buffer.getChannelData(0);
    // Crinkly noise: random grains, denser at the start of the fold.
    for (let i = 0; i < data.length; i++) {
      const t = i / data.length;
      const grain = Math.random() < 0.12 + 0.5 * (1 - t) ? 1 : 0.35;
      data[i] = (Math.random() * 2 - 1) * grain;
    }
    const source = ctx.createBufferSource();
    source.buffer = buffer;
    const filter = ctx.createBiquadFilter();
    filter.type = "bandpass";
    filter.Q.value = 0.9;
    const now = ctx.currentTime;
    filter.frequency.setValueAtTime(2600, now);
    filter.frequency.exponentialRampToValueAtTime(700, now + duration);
    const gain = ctx.createGain();
    gain.gain.setValueAtTime(0.0001, now);
    gain.gain.exponentialRampToValueAtTime(0.16, now + 0.012);
    gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
    source.connect(filter).connect(gain).connect(ctx.destination);
    source.start(now);
    source.stop(now + duration);
  } catch {
    // Audio is a nicety; ignore failures.
  }
}
