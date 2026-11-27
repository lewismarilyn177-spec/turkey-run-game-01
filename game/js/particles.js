// particles.js — shared particle pool (feathers, dust, sparks, leaves).

const pool = [];

export const particles = {
  spawn(p) {
    if (pool.length < 220) pool.push({ ...p, age: 0 });
  },

  update(dt) {
    for (let i = pool.length - 1; i >= 0; i--) {
      const p = pool[i];
      p.age += dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.vy += (p.kind === 'feather' ? 120 : p.kind === 'leaf' ? 60 : 340) * dt;
      if (p.kind === 'feather') p.vx *= 0.97;
      if (p.age >= p.life) pool.splice(i, 1);
    }
  },

  draw(ctx, camX) {
    for (const p of pool) {
      const a = 1 - p.age / p.life;
      ctx.save();
      ctx.globalAlpha = a * 0.9;
      const sx = p.x - camX;
      if (p.kind === 'feather') {
        ctx.translate(sx, p.y);
        ctx.rotate(p.rot + p.age * 3);
        ctx.fillStyle = '#f2d9b8';
        ctx.beginPath();
        ctx.ellipse(0, 0, 9, 4, 0, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'leaf') {
        ctx.translate(sx, p.y);
        ctx.rotate(p.rot + p.age * 4);
        ctx.fillStyle = p.color || '#d8741f';
        ctx.beginPath();
        ctx.ellipse(0, 0, 7, 3.5, 0.6, 0, Math.PI * 2);
        ctx.fill();
      } else if (p.kind === 'spark') {
        ctx.fillStyle = p.color || '#ffb140';
        ctx.beginPath();
        ctx.arc(sx, p.y, 3 + a * 3, 0, Math.PI * 2);
        ctx.fill();
      } else { // dust
        ctx.fillStyle = 'rgba(214,194,160,0.8)';
        ctx.beginPath();
        ctx.arc(sx, p.y, 5 + p.age * 6, 0, Math.PI * 2);
        ctx.fill();
      }
      ctx.restore();
    }
  },

  clear() { pool.length = 0; },
};
