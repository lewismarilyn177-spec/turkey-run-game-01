// player.js — the turkey: run cycle, jump, double-jump flap, slide,
// hurt blinking, feather particle trail. All authored vector art.

import { particles } from './particles.js';

const GROUND_Y = 500;

export class Turkey {
  constructor() {
    this.reset();
  }

  reset() {
    this.x = 250;            // screen anchor
    this.wx = 0;             // world x (distance)
    this.y = GROUND_Y;
    this.vy = 0;
    this.jumps = 0;
    this.sliding = false;
    this.runPhase = 0;
    this.lives = 3;
    this.hurtT = 0;
    this.onGround = true;
    this.height = 66;        // normal hitbox height
    this.width = 54;
    this.boostT = 0;
  }

  get box() {
    const h = this.sliding ? 34 : this.height;
    return { x: this.wx + this.x - this.width / 2, y: this.y - h, w: this.width, h };
  }

  jump() {
    if (this.jumps < 2) {
      this.vy = this.jumps === 0 ? -560 : -480;
      this.jumps++;
      this.onGround = false;
      this.sliding = false;
      return this.jumps; // 1 = jump, 2 = flap
    }
    return 0;
  }

  slide(on) {
    this.sliding = on && this.onGround;
    if (this.sliding) this.vy = 0;
  }

  hurt(sound) {
    if (this.hurtT > 0) return false;
    this.lives--;
    this.hurtT = 1.4;
    sound.hit();
    spawnFeathers(this, 10);
    return true;
  }

  update(dt, speed, sound) {
    this.wx += speed * dt;
    this.hurtT = Math.max(0, this.hurtT - dt);
    this.boostT = Math.max(0, this.boostT - dt);
    // vertical physics
    this.y += this.vy * dt;
    this.vy += 1700 * dt;
    if (this.y >= GROUND_Y) {
      this.y = GROUND_Y;
      this.vy = 0;
      this.jumps = 0;
      if (!this.onGround) {
        sound.step();
        spawnDust(this, 4);
      }
      this.onGround = true;
    } else {
      this.onGround = false;
    }
    // run cycle + stride sounds + dust
    this.runPhase += dt * (speed / 26);
    if (this.onGround && !this.sliding) {
      const stride = Math.floor(this.runPhase);
      if (stride !== this.lastStride) {
        this.lastStride = stride;
        if (stride % 2 === 0) sound.step();
        if (stride % 3 === 0) spawnDust(this, 1);
      }
    }
    particles.update(dt);
  }

  draw(ctx, t) {
    const blink = this.hurtT > 0 && Math.floor(this.hurtT * 10) % 2 === 0;
    if (blink) return;
    const boost = this.boostT > 0;

    ctx.save();
    ctx.translate(this.x, this.y);

    if (this.sliding) {
      drawTurkeyBody(ctx, t, 'slide');
    } else if (!this.onGround) {
      drawTurkeyBody(ctx, t, this.jumps >= 2 ? 'flap' : 'jump');
    } else {
      drawTurkeyBody(ctx, t, 'run', this.runPhase);
    }

    // speed aura
    if (boost) {
      ctx.strokeStyle = 'rgba(255,220,120,0.7)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.ellipse(0, -30, 48, 44, 0, 0, Math.PI * 2);
      ctx.stroke();
    }
    ctx.restore();
  }
}

function drawTurkeyBody(ctx, t, pose, runPhase = 0) {
  const bob = pose === 'run' ? Math.abs(Math.sin(runPhase * Math.PI)) * 4 : 0;
  const legA = pose === 'run' ? Math.sin(runPhase * Math.PI * 2) * 16 : (pose === 'slide' ? 14 : -10);
  const legB = pose === 'run' ? -legA : (pose === 'slide' ? 16 : 12);

  ctx.save();
  if (pose === 'slide') { ctx.translate(10, 0); ctx.rotate(-0.5); }
  ctx.translate(0, -bob);

  // legs
  ctx.strokeStyle = '#c96a1e';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(-6, -26); ctx.lineTo(-6 + legA, -4); ctx.moveTo(-6 + legA, -4); ctx.lineTo(-6 + legA + 8, -2);
  ctx.moveTo(8, -26); ctx.lineTo(8 + legB, -4); ctx.moveTo(8 + legB, -4); ctx.lineTo(8 + legB + 8, -2);
  ctx.stroke();

  // tail fan
  ctx.save();
  ctx.translate(-26, -52);
  const spread = pose === 'flap' || pose === 'jump' ? 1.15 : 1;
  for (let i = -3; i <= 3; i++) {
    ctx.save();
    ctx.rotate(i * 0.28 * spread);
    ctx.fillStyle = i % 2 ? '#8a4a1e' : '#a85a22';
    ctx.beginPath();
    ctx.ellipse(-16, 0, 18, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
  ctx.restore();

  // body
  const bodyGrad = ctx.createRadialGradient(-4, -60, 8, 0, -50, 40);
  bodyGrad.addColorStop(0, '#c77b3a');
  bodyGrad.addColorStop(1, '#8e4f22');
  ctx.fillStyle = bodyGrad;
  ctx.beginPath();
  ctx.ellipse(0, -50, 28, 26, pose === 'jump' ? -0.15 : 0, 0, Math.PI * 2);
  ctx.fill();

  // wing (flaps in air)
  const wingA = pose === 'flap' ? Math.sin(t * 30) * 0.9 : pose === 'jump' ? 0.5 : Math.sin(runPhase * Math.PI * 2) * 0.25;
  ctx.save();
  ctx.translate(2, -54);
  ctx.rotate(wingA);
  ctx.fillStyle = '#6e3c16';
  ctx.beginPath();
  ctx.ellipse(0, 4, 18, 10, 0.3, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // head + neck
  ctx.fillStyle = '#b06028';
  ctx.beginPath();
  ctx.ellipse(16, -76, 12, 10, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillRect(8, -70, 8, 12);

  // snood
  ctx.fillStyle = '#e0402a';
  ctx.beginPath();
  ctx.ellipse(22, -84, 5, 8, 0.6, 0, Math.PI * 2);
  ctx.fill();

  // beak
  ctx.fillStyle = '#e8b030';
  ctx.beginPath();
  ctx.moveTo(26, -78); ctx.lineTo(40, -74); ctx.lineTo(26, -71);
  ctx.closePath();
  ctx.fill();

  // eye
  ctx.fillStyle = '#241206';
  ctx.beginPath();
  ctx.arc(18, -80, 2.6, 0, Math.PI * 2);
  ctx.fill();
  ctx.fillStyle = '#fff';
  ctx.beginPath();
  ctx.arc(19, -81, 1, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function spawnFeathers(turkey, n) {
  for (let i = 0; i < n; i++) {
    particles.spawn({
      x: turkey.wx + turkey.x + (Math.random() - 0.5) * 30,
      y: turkey.y - 40 + (Math.random() - 0.5) * 30,
      vx: (Math.random() - 0.5) * 220,
      vy: -Math.random() * 180,
      life: 1.2 + Math.random(),
      kind: 'feather',
      rot: Math.random() * Math.PI * 2,
    });
  }
}

function spawnDust(turkey, n) {
  for (let i = 0; i < n; i++) {
    particles.spawn({
      x: turkey.wx + turkey.x - 10,
      y: turkey.y - 4,
      vx: -80 - Math.random() * 60,
      vy: -20 - Math.random() * 40,
      life: 0.5 + Math.random() * 0.4,
      kind: 'dust',
    });
  }
}
