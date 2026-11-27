// hazards.js - oven bursts and carving knives
import { particles } from './particles.js';

const GROUND_Y = 500;

export class HazardField {
  constructor() {
    this.reset();
  }

  reset() {
    this.items = [];
    this.nextSpawn = 600;
  }

  spawnAhead(turkeyWx, difficulty, stage) {
    while (this.nextSpawn < turkeyWx + 1400) {
      const roll = Math.random();
      let item;
      if (roll < 0.45) {
        item = this.makeOven(this.nextSpawn);
      } else if (roll < 0.75) {
        item = this.makeKnife(this.nextSpawn, Math.random() < 0.5);
      } else {
        item = this.makePumpkin(this.nextSpawn);
      }
      this.items.push(item);
      this.nextSpawn += 380 + Math.random() * 320 - difficulty * 140;
    }
  }

  makeKnife(x, high) {
    return { kind: 'knife', x, y: high ? GROUND_Y - 118 : GROUND_Y, high, t: Math.random(), state: 0 };
  }

  makeOven(x) {
    return { kind: 'oven', x, y: GROUND_Y, burst: 0 };
  }

  makePumpkin(x) {
    return { kind: 'pumpkin', x, y: GROUND_Y };
  }

  hitBox(item) {
    if (item.kind === 'knife') {
      return { x: item.x - 18, y: item.y - 96, w: 36, h: 92 };
    }
    if (item.kind === 'oven') {
      return { x: item.x - 40, y: GROUND_Y - 150, w: 80, h: 146 };
    }
    if (item.kind === 'pumpkin') {
      return { x: item.x - 24, y: GROUND_Y - 40, w: 48, h: 40 };
    }
    return { x: item.x, y: item.y, w: 0, h: 0 };
  }

  isDeadly(item, dt) {
    if (item.kind === 'oven') {
      item.burst = (item.burst + dt) % 2.4;
      return item.burst < 0.9;
    }
    if (item.kind === 'knife' && item.high) {
      item.state = Math.sin(item.t * 2.4) * 44;
      return Math.sin(item.t * 2.4) > 0;
    }
    return true;
  }

  draw(ctx, camX, t) {
    for (const item of this.items) {
      const sx = item.x - camX;
      if (item.kind === 'knife') {
        const oy = item.high ? item.state : 0;
        const bladeX = sx;
        const bladeY = item.y - 24 + oy;
        const hx = sx;
        const hy = item.y - 18 + oy;

        // handle
        ctx.fillStyle = '#4a3a32';
        ctx.beginPath();
        ctx.roundRect(hx - 6, hy - 6, 12, 12, 4);
        ctx.fill();

        // blade
        const grad = ctx.createLinearGradient(bladeX - 10, bladeY, bladeX + 10, bladeY + 60);
        grad.addColorStop(0, '#dfe4ea');
        grad.addColorStop(0.5, '#fff');
        grad.addColorStop(1, '#b8c0c8');
        ctx.fillStyle = grad;
        ctx.beginPath();
        ctx.moveTo(bladeX - 10, bladeY);
        ctx.lineTo(bladeX + 10, bladeY);
        ctx.lineTo(bladeX, bladeY + 60);
        ctx.closePath();
        ctx.fill();

        // shine line
        ctx.strokeStyle = 'rgba(255,255,255,0.5)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(bladeX - 6, bladeY + 8);
        ctx.lineTo(bladeX - 2, bladeY + 44);
        ctx.stroke();
      } else if (item.kind === 'oven') {
        const ox = sx;
        const oy = item.y;

        // body
        ctx.fillStyle = '#4a4a4a';
        ctx.fillRect(ox - 44, oy - 62, 88, 62);

        // glow window pulsing
        const pulse = Math.sin(t * 3) * 0.3 + 0.7;
        ctx.fillStyle = `rgba(255,140,40,${0.6 * pulse})`;
        ctx.fillRect(ox - 20, oy - 42, 40, 22);

        // knobs
        ctx.fillStyle = '#d8b25a';
        for (const kx of [ox - 22, ox + 22]) {
          ctx.beginPath();
          ctx.arc(kx, oy - 14, 4, 0, Math.PI * 2);
          ctx.fill();
        }

        if (item.burst > 0) {
          const flameLen = item.burst * 150;
          const fGrad = ctx.createLinearGradient(oy - 62, oy - 62 - flameLen, oy - 62, oy - 62);
          fGrad.addColorStop(0, '#ff5a1e');
          fGrad.addColorStop(0.5, '#ffb140');
          fGrad.addColorStop(1, '#fff3c4');
          ctx.fillStyle = fGrad;
          ctx.beginPath();
          ctx.moveTo(ox - 30, oy - 62);
          ctx.quadraticCurveTo(ox - 10, oy - 62 - flameLen * 0.9, ox, oy - 62);
          ctx.quadraticCurveTo(ox + 10, oy - 62 - flameLen * 0.7, ox + 30, oy - 62);
          ctx.lineTo(ox + 20, oy - 62 + flameLen * 0.2);
          ctx.lineTo(ox - 20, oy - 62 + flameLen * 0.2);
          ctx.closePath();
          ctx.fill();

          // spark particles
          if (Math.random() < 0.3) {
            particles.spawn({
              x: ox + (Math.random() - 0.5) * 60,
              y: oy - 62 - flameLen,
              vx: (Math.random() - 0.5) * 80,
              vy: -120,
              life: 0.5,
              kind: 'spark',
              color: '#ffb140'
            });
          }
        }
      } else if (item.kind === 'pumpkin') {
        const px = sx;
        const py = item.y + Math.sin(t * 2) * 4;

        ctx.fillStyle = '#e86a10';
        ctx.beginPath();
        ctx.ellipse(px, py, 24, 21, 0, 0, Math.PI * 2);
        ctx.fill();

        // ribs
        ctx.strokeStyle = '#c94a08';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(px - 16, py);
        ctx.lineTo(px - 10, py - 8);
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - 16);
        ctx.moveTo(px + 16, py);
        ctx.lineTo(px + 10, py - 8);
        ctx.stroke();

        // face
        ctx.fillStyle = '#1a1a1a';
        ctx.beginPath();
        ctx.moveTo(px - 8, py - 6);
        ctx.lineTo(px - 4, py - 2);
        ctx.lineTo(px - 4, py - 10);
        ctx.closePath();
        ctx.fill();
        ctx.beginPath();
        ctx.moveTo(px + 4, py - 6);
        ctx.lineTo(px + 8, py - 2);
        ctx.lineTo(px + 4, py - 10);
        ctx.closePath();
        ctx.fill();

        // jagged mouth
        ctx.beginPath();
        ctx.moveTo(px - 10, py + 6);
        ctx.lineTo(px - 6, py + 10);
        ctx.lineTo(px - 2, py + 6);
        ctx.lineTo(px + 2, py + 10);
         ctx.lineTo(px + 6, py + 6);
         ctx.lineTo(px + 10, py + 10);
         ctx.strokeStyle = '#1a1a1a';
         ctx.lineWidth = 2;
         ctx.stroke();
      }
    }
  }

  cull(turkeyWx) {
    this.items = this.items.filter(item => item.x >= turkeyWx - 300);
  }
}
