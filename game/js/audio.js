// audio.js — tiny procedural sound engine (WebAudio, no asset files).
// Every effect is synthesised: no network fetch, everything ships in game/.

export class SoundKit {
  constructor() {
    this.ctx = null;
    this.muted = false;
  }

  ensure() {
    if (!this.ctx) {
      const AC = window.AudioContext || window.webkitAudioContext;
      if (!AC) return null;
      this.ctx = new AC();
    }
    if (this.ctx.state === 'suspended') this.ctx.resume();
    return this.ctx;
  }

  // one enveloped oscillator blip
  blip(freq, dur, type = 'square', vol = 0.16, slide = 0) {
    const ctx = this.ensure();
    if (!ctx || this.muted) return;
    const t = ctx.currentTime;
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, t);
    if (slide) osc.frequency.exponentialRampToValueAtTime(Math.max(40, freq + slide), t + dur);
    gain.gain.setValueAtTime(vol, t);
    gain.gain.exponentialRampToValueAtTime(0.001, t + dur);
    osc.connect(gain).connect(ctx.destination);
    osc.start(t);
    osc.stop(t + dur + 0.02);
  }

  jump()     { this.blip(340, 0.18, 'square', 0.14, 260); }
  flap()     { this.blip(500, 0.14, 'triangle', 0.12, 180); }
  slide()    { this.blip(180, 0.22, 'sawtooth', 0.10, -90); }
  corn()     { this.blip(760, 0.09, 'square', 0.12, 300); }
  hit()      { this.blip(140, 0.35, 'sawtooth', 0.2, -70); }
  caught()   { this.blip(220, 0.6, 'sawtooth', 0.22, -140); setTimeout(() => this.blip(150, 0.5, 'square', 0.18, -60), 220); }
  escaped()  { [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => this.blip(f, 0.22, 'triangle', 0.16), i * 140)); }
  stage()    { [392, 523].forEach((f, i) => setTimeout(() => this.blip(f, 0.2, 'triangle', 0.13), i * 120)); }

  // running footsteps: quick low ticks, called on stride
  step() {
    this.blip(90 + Math.random() * 30, 0.05, 'triangle', 0.05);
  }
}
