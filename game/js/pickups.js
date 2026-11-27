// pickups.js - corn (score), golden corn (lives/boost)

const GROUND_Y = 500;

export class PickupField {
  constructor() {
    this.reset();
  }

  reset() {
    this.items = [];
    this.nextSpawn = 400;
  }

  spawnAhead(turkeyWx, hazards) {
    while (this.nextSpawn < turkeyWx + 1400) {
      const x = this.nextSpawn;
      let clash = false;
      for (const h of hazards.items) {
        if (Math.abs(h.x - x) < 130) {
          clash = true;
          break;
        }
      }
      if (clash) {
        this.nextSpawn += 90;
        continue;
      }
      this.items.push({
        x,
        y: GROUND_Y - 60 - Math.random() * 110,
        golden: Math.random() < 0.12,
        t: Math.random() * 6,
        taken: false,
      });
      this.nextSpawn += 150 + Math.random() * 120;
    }
  }

  draw(ctx, camX, t) {
    for (const p of this.items) {
      if (p.taken) continue;
      const sx = p.x - camX;
      const sy = p.y + Math.sin(t * 3 + p.t) * 6;

      if (p.golden) {
        ctx.fillStyle = 'rgba(255,220,120,0.25)';
        ctx.beginPath();
        ctx.arc(sx, sy, 26, 0, Math.PI * 2);
        ctx.fill();
      }

      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(0.2);
      ctx.fillStyle = p.golden ? '#ffdf70' : '#f2c14e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 19, 0, 0, Math.PI * 2);
      ctx.fill();

      // kernel grid lines
      ctx.strokeStyle = 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 1;
      for (let i = -2; i <= 2; i++) {
        ctx.beginPath();
        ctx.moveTo(i * 4, -8);
        ctx.lineTo(i * 4, 8);
        ctx.stroke();
      }
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(-6, i * 6);
        ctx.lineTo(6, i * 6);
        ctx.stroke();
      }

      // husk leaf
      ctx.fillStyle = '#6a9a2e';
      ctx.beginPath();
      ctx.moveTo(-10, -4);
      ctx.quadraticCurveTo(-20, -14, -12, -20);
      ctx.lineTo(-6, -16);
      ctx.quadraticCurveTo(-8, -10, -10, -4);
      ctx.fill();

      ctx.restore();
    }
  }

  cull(turkeyWx) {
    this.items = this.items.filter(item => item.x >= turkeyWx - 300);
  }
}
