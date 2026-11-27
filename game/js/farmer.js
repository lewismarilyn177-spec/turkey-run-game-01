// farmer.js — the farmer who chases the turkey with a pitchfork.
// He trails behind at a gap that shrinks as the run goes on; a hit to the
// turkey lets him close in. If the gap reaches zero, he catches the turkey.

import { particles } from './particles.js';

export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = 260;      // world-distance behind the turkey
    this.runPhase = 0;
    this.swing = 0;
    this.caughtT = 0;
  }

  // returns true when he catches the turkey
  update(dt, turkeyWx, speed, difficulty, turkey) {
    const wanted = Math.max(70, 260 - difficulty * 24);
    if (this.gap > wanted) this.gap -= 26 * dt;
    else this.gap += 18 * dt;            // turkey pulls ahead again
    this.gap += (turkey.boostT > 0 ? 60 : 0) * dt;
    this.runPhase += dt * 9;
    this.swing += dt;
    this.caughtT = Math.max(0, this.caughtT - dt);
    if (this.gap <= 40 && turkey.hurtT <= 0) return true;
    return false;
  }

  scare(sound) {
    sound.blip(90, 0.5, 'sawtooth', 0.18, -30);
  }

  draw(ctx, turkeyScreenX, turkeyWx, t) {
    const x = turkeyScreenX - this.gap;
    if (x < -160) return;
    const bob = Math.abs(Math.sin(this.runPhase)) * 6;
    const legA = Math.sin(this.runPhase * Math.PI) * 18;
    const legB = -legA;

    ctx.save();
    ctx.translate(x, 500 - bob);

    // legs
    ctx.strokeStyle = '#4a3524';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(-4, -30); ctx.lineTo(-4 + legA, -2);
    ctx.moveTo(8, -30); ctx.lineTo(8 + legB, -2);
    ctx.stroke();

    // overalls
    ctx.fillStyle = '#3a5a8c';
    ctx.beginPath();
    ctx.roundRect(-16, -78, 36, 50, 8);
    ctx.fill();
    ctx.fillStyle = '#c94a3a';
    ctx.fillRect(-16, -78, 36, 14);

    // head
    ctx.fillStyle = '#e8b48c';
    ctx.beginPath();
    ctx.arc(2, -92, 14, 0, Math.PI * 2);
    ctx.fill();
    // straw hat
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath();
    ctx.ellipse(2, -102, 26, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.ellipse(2, -110, 14, 9, 0, 0, Math.PI * 2);
    ctx.fill();
    // angry eye
    ctx.fillStyle = '#241206';
    ctx.fillRect(6, -96, 6, 3);

    // beard
    ctx.fillStyle = '#d8d0c0';
    ctx.beginPath();
    ctx.arc(4, -84, 8, 0, Math.PI);
    ctx.fill();

    // pitchfork (raised, swings as he runs)
    const swingA = Math.sin(this.swing * 4) * 0.25 + 0.5;
    ctx.save();
    ctx.translate(14, -70);
    ctx.rotate(swingA);
    ctx.strokeStyle = '#7a5a30';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(0, 0); ctx.lineTo(26, -46);
    ctx.stroke();
    ctx.strokeStyle = '#b8bcc4';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(18, -52); ctx.lineTo(26, -46); ctx.lineTo(34, -52);
    ctx.moveTo(26, -46); ctx.lineTo(26, -58);
    ctx.stroke();
    ctx.restore();

    ctx.restore();

    // "YOOOU!" speech bubble occasionally
    if (Math.floor(t % 6) === 4) {
      ctx.save();
      ctx.font = 'bold 15px "Trebuchet MS"';
      ctx.fillStyle = '#fff';
      ctx.strokeStyle = '#3a2a1a';
      ctx.lineWidth = 2;
      const bx = x + 6, by = 340;
      ctx.beginPath();
      ctx.roundRect(bx - 28, by - 18, 62, 26, 8);
      ctx.fill(); ctx.stroke();
      ctx.fillStyle = '#3a2a1a';
      ctx.fillText('YOOOU!', bx - 20, by);
      ctx.restore();
    }
  }
}
