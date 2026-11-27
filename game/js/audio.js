// audio.js - tiny procedural sound engine (WebAudio, no asset files)

const audioCtxCtor =
  typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)
    ? window.AudioContext || window.webkitAudioContext
    : null;

export class SoundKit {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!audioCtxCtor) return null;
    if (!this.ctx) this.ctx = new audioCtxCtor();
    return this.ctx;
  }

  blip(freq, dur, type = 'square', vol = 0.16, slide = 0) {
    const ctx = this.ensure();
    if (!ctx || this.muted || ctx.state === 'suspended') return null;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    if (slide) osc.frequency.exponentialRampToValueAtTime(freq + slide, t + dur);
    osc.start(t);
    osc.stop(t + dur);
    return osc;
  }

  jump() { return this.ctx?.state === 'suspended' ? null : this.blip(340, 0.18, 'square', 0.16, 260); }
  flap() { return this.ctx?.state === 'suspended' ? null : this.blip(500, 0.14, 'triangle', 0.16, 180); }
  slide() { return this.ctx?.state === 'suspended' ? null : this.blip(180, 0.22, 'sawtooth', 0.16, -90); }
  corn() { return this.ctx?.state === 'suspended' ? null : this.blip(760, 0.09, 'square', 0.16, 300); }
  hit() { return this.ctx?.state === 'suspended' ? null : this.blip(140, 0.35, 'sawtooth', 0.2, -70); }

  caught() {
    if (this.muted || (this.ctx && this.ctx.state === 'suspended')) return null;
    this.blip(220, 0.6, 'sawtooth', 0.2, -60);
    const ctx = this.ensure();
    if (!ctx || ctx.state === 'suspended') return null;
    const t = ctx.currentTime + 0.22;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'square';
    osc.frequency.setValueAtTime(150, t);
    osc.connect(gain);
    gain.connect(ctx.destination);
    gain.gain.setValueAtTime(0.16, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + 0.18);
    osc.start(t);
    osc.stop(t + 0.18);
    return osc;
  }

  escaped() {
    if (this.muted || (this.ctx && this.ctx.state === 'suspended')) return null;
    const ctx = this.ensure();
    if (!ctx || ctx.state === 'suspended') return null;
    const t = ctx.currentTime;
    const notes = [523, 659, 784, 1047];
    notes.forEach((f, i) => {
      const tt = t + i * 0.14;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, tt);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.22, tt);
      gain.gain.exponentialRampToValueAtTime(0.001, tt + 0.22);
      osc.start(tt);
      osc.stop(tt + 0.22);
    });
  }

  stage() {
    if (this.muted || (this.ctx && this.ctx.state === 'suspended')) return null;
    const ctx = this.ensure();
    if (!ctx || ctx.state === 'suspended') return null;
    const t = ctx.currentTime;
    [392, 523].forEach((f, i) => {
      const tt = t + i * 0.18;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(f, tt);
      osc.connect(gain);
      gain.connect(ctx.destination);
      gain.gain.setValueAtTime(0.16, tt);
      gain.gain.exponentialRampToValueAtTime(0.001, tt + 0.25);
      osc.start(tt);
      osc.stop(tt + 0.25);
    });
  }

  step() {
    if (this.muted || (this.ctx && this.ctx.state === 'suspended')) return null;
    const freq = 90 + Math.random() * 30;
    return this.blip(freq, 0.05, 'triangle', 0.06, 0);
  }
}
