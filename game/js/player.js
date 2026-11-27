// player.js - the turkey: run cycle, jump, double-jump flap, slide, hurt blinking, feather trail.
import { particles } from './particles.js';

const PI = Math.PI;

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 250;
    this.wx = 0;
    this.y = 500;
    this.vy = 0;
    this.jumps = 0;
    this.sliding = false;
    this.runPhase = 0;
    this.lives = 3;
    this.hurtT = 0;
    this.onGround = true;
    this.height = 66;
    this.width = 54;
    this.boostT = 0;
    this._lastStride = 0;
    this._evenStrides = 0;
  }

  get box() {
    return {
      x: this.wx + this.x - this.width / 2,
      y: this.y - (this.sliding ? 34 : this.height),
      w: this.width,
      h: this.height
    };
  }

  jump() {
    if (this.jumps >= 2) return 0;
    this.vy = this.jumps === 0 ? -560 : -480;
    this.jumps++;
    this.onGround = false;
    return this.jumps;
  }

  slide(on) {
    this.sliding = on && this.onGround;
  }

  hurt(sound) {
    if (this.hurtT > 0) return false;
    this.lives--;
    this.hurtT = 1.4;
    sound.hit();
    for (let i = 0; i < 10; i++) {
      particles.spawn({
        x: this.wx + this.x,
        y: this.y - 40,
        vx: (Math.random() - 0.5) * 220,
        vy: -Math.random() * 180,
        life: 1.2 + Math.random() * 1.0,
        kind: 'feather',
        rot: Math.random() * PI * 2
      });
    }
    return true;
  }

  update(dt, speed, sound) {
    this.wx += speed * dt;
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.boostT = Math.max(0, this.boostT - dt);

    this.y += this.vy * dt;
    this.vy += 1700 * dt;

    if (this.y >= 500) {
      this.y = 500;
      this.vy = 0;
      this.jumps = 0;
      this.onGround = true;
      for (let i = 0; i < 5; i++) {
        particles.spawn({
          x: this.wx + this.x - 10,
          y: this.y - 4,
          vx: (Math.random() - 0.5) * 60 - 40,
          vy: -Math.random() * 60,
          life: 0.5 + Math.random() * 0.4,
          kind: 'dust'
        });
      }
      sound.step();
    }

    this.runPhase += dt * speed / 26;

    const running = this.onGround && !this.sliding;
    if (running) {
      const cur = Math.floor(this.runPhase);
      if (cur > this._lastStride) {
        for (let s = this._lastStride + 1; s <= cur; s++) {
          if (s % 2 === 0) {
            sound.step();
            this._evenStrides++;
            if (this._evenStrides % 3 === 0) {
              particles.spawn({
                x: this.wx + this.x - 10,
                y: this.y - 4,
                vx: -80 - Math.random() * 60,
                vy: -Math.random() * 40,
                life: 0.5 + Math.random() * 0.4,
                kind: 'dust'
              });
            }
          }
        }
        this._lastStride = cur;
      }
    } else {
      this._lastStride = Math.floor(this.runPhase);
    }
  }

  draw(ctx, t) {
    if (this.hurtT > 0 && Math.floor(this.hurtT * 10) % 2 === 0) return;

    const running = this.onGround && !this.sliding;
    const bob = running ? Math.abs(Math.sin(this.runPhase * PI)) * 4 : 0;

    ctx.save();
    ctx.translate(this.x, this.y);
    if (this.sliding) {
      ctx.translate(10, 0);
      ctx.rotate(-0.5);
    }
    ctx.translate(0, -bob);

    if (this.boostT > 0) {
      ctx.strokeStyle = 'rgba(255,220,120,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -50, 48, 44, 0, 0, PI * 2);
      ctx.stroke();
    }

    // legs
    ctx.strokeStyle = '#c96a1e';
    ctx.lineWidth = 6;
    ctx.lineCap = 'round';
    let legA;
    if (!this.onGround) {
      legA = this.jumps === 1 ? -14 : 14;
    } else if (this.sliding) {
      legA = 10;
    } else {
      legA = Math.sin(this.runPhase * 2 * PI) * 16;
    }
    ctx.beginPath();
    ctx.moveTo(-6, -26);
    ctx.lineTo(-6 + legA, 8);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(8, -26);
    ctx.lineTo(8 - legA, 8);
    ctx.stroke();

    // tail fan
    const spread = this.onGround ? 1 : 1.15;
    for (let i = 0; i < 7; i++) {
      ctx.save();
      ctx.translate(-26, -52);
      ctx.rotate(i * 0.28 * spread);
      ctx.fillStyle = i % 2 === 0 ? '#8a4a1e' : '#a85a22';
      ctx.beginPath();
      ctx.ellipse(0, 0, 18, 9, 0, 0, PI * 2);
      ctx.fill();
      ctx.restore();
    }

    // body
    const grad = ctx.createRadialGradient(0, -50, 2, 0, -50, 28);
    grad.addColorStop(0, '#c77b3a');
    grad.addColorStop(1, '#8e4f22');
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(0, -50, 28, 26, 0, 0, PI * 2);
    ctx.fill();

    // wing
    let wingA;
    if (!this.onGround) {
      wingA = 0.5;
    } else if (running) {
      wingA = Math.sin(t * 15) * 0.4;
    } else {
      wingA = Math.sin(t * 30) * 0.9;
    }
    ctx.save();
    ctx.translate(2, -54);
    ctx.rotate(wingA);
    ctx.fillStyle = '#6e3c16';
    ctx.beginPath();
    ctx.ellipse(0, 0, 18, 10, 0, 0, PI * 2);
    ctx.fill();
    ctx.restore();

    // neck
    ctx.fillStyle = '#b06028';
    ctx.fillRect(6, -70, 18, 14);

    // head
    ctx.beginPath();
    ctx.ellipse(16, -76, 12, 10, 0, 0, PI * 2);
    ctx.fill();

    // snood
    ctx.fillStyle = '#e0402a';
    ctx.beginPath();
    ctx.ellipse(22, -84, 10, 8, 0, 0, PI * 2);
    ctx.fill();

    // beak
    ctx.fillStyle = '#e8b030';
    ctx.beginPath();
    ctx.moveTo(26, -78);
    ctx.lineTo(40, -74);
    ctx.lineTo(26, -71);
    ctx.closePath();
    ctx.fill();

    // eye
    ctx.fillStyle = '#222';
    ctx.beginPath();
    ctx.arc(18, -80, 2.6, 0, PI * 2);
    ctx.fill();
    ctx.fillStyle = '#fff';
    ctx.beginPath();
    ctx.arc(17.5, -80.6, 1, 0, PI * 2);
    ctx.fill();

    ctx.restore();
  }
}
