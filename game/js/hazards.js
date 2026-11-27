// hazards.js — oven bursts and carving knives, spawned ahead of the turkey
// with difficulty scaling; collision handled by engine.js calling hitBox().

import { particles } from './particles.js';

const GROUND_Y = 500;

export class HazardField {
  constructor() {
    this.reset();
  }

  reset() {
    this.items = [];
    this.nextSpawn = 600;   // world-x of next hazard
  }

  spawnAhead(turkeyWx, difficulty, stage) {
    const horizon = turkeyWx + 1400;
    while (this.nextSpawn < horizon) {
      const d = difficulty; // 0..1+
      const roll = Math.random();
      if (stage === 'Kitchen' && roll < 0.45) {
        this.items.push(this.makeOven(this.nextSpawn));
      } else if (roll < 0.75) {
        // carving knife: low slide (duck) or high arc (jump under/slide)
        const high = Math.random() < 0.5;
        this.items.push(this.makeKnife(this.nextSpawn, high));
      } else {
        this.items.push(this.makePumpkin(this.nextSpawn));
      }
      this.nextSpawn += 380 + Math.random() * 320 - d * 140;
    }
  }

  makeKnife(x, high) {
    return { kind: 'knife', x, high, y: high ? GROUND_Y - 118 : GROUND_Y, state: 0, t: Math.random() * 6 };
  }

  makeOven(x) {
    return { kind: 'oven', x, state: 0, t: Math.random() * 3, burst: 0 };
  }

  makePumpkin(x) {
    return { kind: 'pumpkin', x, state: 0, t: 0 };
  }

  hitBox(item) {
    if (item.kind === 'knife') {
      return { x: item.x - 18, y: item.y - 96, w: 36, h: 92 };
    }
    if (item.kind === 'oven') {
      // flame burst is the danger, not the oven body
      return { x: item.x - 40, y: GROUND_Y - 150, w: 80, h: 146 };
    }
    return { x: item.x - 24, y: GROUND_Y - 40, w: 48, h: 40 };
  }

  // is this hazard actively dangerous right now?
  isDeadly(item, dt) {
    item.t += dt;
    if (item.kind === 'oven') {
      const cycle = item.t % 2.4;
      item.burst = cycle < 0.9 ? cycle / 0.9 : 0;
      return item.burst > 0;
    }
    if (item.kind === 'knife') {
      item.state = item.high
        ? Math.sin(item.t * 2.4) * 44            // arcing blade
        : 0;
      return true;
    }
    return true; // pumpkin roams
  }

  draw(ctx, camX, t) {
    for (const item of this.items) {
      const x = item.x - camX;
      if (x < -140 || x > ctx.canvas.width + 140) continue;
      if (item.kind === 'knife') drawKnife(ctx, x, item);
      else if (item.kind === 'oven') drawOven(ctx, x, item, t);
      else drawRoamPumpkin(ctx, x, item, t);
    }
  }

  cull(turkeyWx) {
    this.items = this.items.filter((it) => it.x > turkeyWx - 300);
  }
}

function drawKnife(ctx, x, item) {
  ctx.save();
  ctx.translate(x, item.y - 96 + (item.state || 0) * (item.high ? 1 : 0));
  // handle
  ctx.fillStyle = '#2e2620';
  ctx.beginPath();
  ctx.roundRect(-10, 60, 20, 34, 5);
  ctx.fill();
  // blade with shine
  const g = ctx.createLinearGradient(-14, 0, 14, 0);
  g.addColorStop(0, '#dfe4ea');
  g.addColorStop(0.5, '#ffffff');
  g.addColorStop(1, '#b8c0c8');
  ctx.fillStyle = g;
  ctx.beginPath();
  ctx.moveTo(-16, 62);
  ctx.lineTo(16, 62);
  ctx.lineTo(0, -2);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.9)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-8, 54); ctx.lineTo(-2, 14);
  ctx.stroke();
  ctx.restore();
}

function drawOven(ctx, x, item, t) {
  ctx.save();
  ctx.translate(x, GROUND_Y);
  // oven body
  ctx.fillStyle = '#43464d';
  ctx.beginPath();
  ctx.roundRect(-44, -62, 88, 62, 6);
  ctx.fill();
  ctx.fillStyle = '#2c2e33';
  ctx.beginPath();
  ctx.roundRect(-36, -52, 72, 34, 4);
  ctx.fill();
  // glowing window
  const glow = 0.5 + Math.sin(t * 5) * 0.2;
  ctx.fillStyle = `rgba(255,140,40,${glow})`;
  ctx.beginPath();
  ctx.roundRect(-30, -46, 60, 22, 3);
  ctx.fill();
  // knobs
  ctx.fillStyle = '#d8b25a';
  for (const kx of [-26, -10, 6, 22]) {
    ctx.beginPath();
    ctx.arc(kx, -58, 4, 0, Math.PI * 2);
    ctx.fill();
  }
  // flame burst
  if (item.burst > 0) {
    const h = item.burst * 150;
    for (let i = -2; i <= 2; i++) {
      const fh = h * (0.7 + Math.sin(t * 18 + i) * 0.3) * (1 - Math.abs(i) * 0.22);
      const fg = ctx.createLinearGradient(0, 0, 0, -fh);
      fg.addColorStop(0, '#ff5a1e');
      fg.addColorStop(0.6, '#ffb140');
      fg.addColorStop(1, '#fff3c4');
      ctx.fillStyle = fg;
      ctx.beginPath();
      ctx.moveTo(i * 16 - 10, 0);
      ctx.quadraticCurveTo(i * 16, -fh * 1.2, i * 16 + 10, 0);
      ctx.fill();
      if (Math.random() < 0.3) {
        particles.spawn({ x: item.x + i * 16, y: GROUND_Y - fh, vx: (Math.random() - 0.5) * 60, vy: -140, life: 0.5, kind: 'spark', color: '#ffb140' });
      }
    }
  }
  ctx.restore();
}

function drawRoamPumpkin(ctx, x, item, t) {
  ctx.save();
  ctx.translate(x, GROUND_Y - 20 + Math.sin(t * 6 + item.x) * 4);
  ctx.fillStyle = '#d8641f';
  ctx.beginPath();
  ctx.ellipse(0, 0, 24, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(120,50,10,0.5)';
  ctx.lineWidth = 2;
  for (const ox of [-9, 0, 9]) {
    ctx.beginPath();
    ctx.ellipse(0, 0, 24 - Math.abs(ox), 21, 0, -Math.PI / 2, Math.PI / 2);
    ctx.stroke();
  }
  // menacing face
  ctx.fillStyle = '#2a1408';
  ctx.beginPath();
  ctx.moveTo(-12, -8); ctx.lineTo(-4, -4); ctx.lineTo(-12, -1);
  ctx.moveTo(12, -8); ctx.lineTo(4, -4); ctx.lineTo(12, -1);
  ctx.fill();
  ctx.beginPath();
  ctx.moveTo(-10, 6); ctx.lineTo(10, 6); ctx.lineTo(4, 12); ctx.lineTo(-4, 12);
  ctx.fill();
  ctx.restore();
}
