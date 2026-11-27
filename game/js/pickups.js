// pickups.js — corn (score), golden corn (lives/boost), floating placement.

export class PickupField {
  constructor() {
    this.reset();
  }

  reset() {
    this.items = [];
    this.nextSpawn = 400;
  }

  spawnAhead(turkeyWx, hazards) {
    const horizon = turkeyWx + 1400;
    while (this.nextSpawn < horizon) {
      // avoid spawning inside a hazard
      const clash = hazards.items.some((h) => Math.abs(h.x - this.nextSpawn) < 130);
      if (!clash) {
        const golden = Math.random() < 0.12;
        this.items.push({
          x: this.nextSpawn,
          y: 500 - 60 - Math.random() * 110,
          golden,
          t: Math.random() * 6,
          taken: false,
        });
        this.nextSpawn += 150 + Math.random() * 120;
      } else {
        this.nextSpawn += 90;
      }
    }
  }

  draw(ctx, camX, t) {
    for (const c of this.items) {
      if (c.taken) continue;
      const x = c.x - camX;
      if (x < -40 || x > ctx.canvas.width + 40) continue;
      const bobY = c.y + Math.sin(t * 3 + c.t) * 6;
      ctx.save();
      ctx.translate(x, bobY);
      // glow for golden
      if (c.golden) {
        ctx.fillStyle = 'rgba(255,220,120,0.25)';
        ctx.beginPath();
        ctx.arc(0, 0, 26, 0, Math.PI * 2);
        ctx.fill();
      }
      // cob
      ctx.fillStyle = c.golden ? '#ffdf70' : '#f2c14e';
      ctx.beginPath();
      ctx.ellipse(0, 0, 12, 19, 0.2, 0, Math.PI * 2);
      ctx.fill();
      // kernel grid
      ctx.strokeStyle = c.golden ? 'rgba(200,150,20,0.7)' : 'rgba(190,130,20,0.7)';
      ctx.lineWidth = 1;
      for (let r = -12; r <= 12; r += 6) {
        ctx.beginPath();
        ctx.moveTo(-9, r); ctx.lineTo(9, r);
        ctx.stroke();
      }
      // husk leaves
      ctx.fillStyle = '#5e8c3a';
      ctx.beginPath();
      ctx.moveTo(-6, 12);
      ctx.quadraticCurveTo(-18, 20, -12, 34);
      ctx.quadraticCurveTo(-4, 24, -2, 14);
      ctx.fill();
      ctx.restore();
    }
  }

  cull(turkeyWx) {
    this.items = this.items.filter((c) => !c.taken && c.x > turkeyWx - 200);
  }
}
