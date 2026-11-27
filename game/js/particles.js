// particles.js - shared particle pool (feathers, dust, sparks, leaves)

const MAX_PARTICLES = 220;
const pool = [];

const GRAVITY = {
  feather: 120,
  leaf: 60,
  spark: 340,
  dust: 340
};

function createParticle() {
  return {
    x: 0, y: 0,
    vx: 0, vy: 0,
    life: 0,
    kind: '',
    age: 0,
    rot: 0,
    color: '#ffffff'
  };
}

function getParticle() {
  if (pool.length < MAX_PARTICLES) {
    const p = createParticle();
    pool.push(p);
    return p;
  }
  return pool.find(p => p.age >= p.life) || pool[0];
}

export const particles = {
  spawn(p) {
    const particle = getParticle();
    particle.x = p.x;
    particle.y = p.y;
    particle.vx = p.vx ?? 0;
    particle.vy = p.vy ?? 0;
    particle.life = p.life ?? 1;
    particle.kind = p.kind ?? 'dust';
    particle.age = 0;
    particle.rot = p.rot ?? 0;
    particle.color = p.color ?? '#ffffff';
    return particle;
  },

  update(dt) {
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (p.age >= p.life) continue;

      p.age += dt;
      if (p.age >= p.life) continue;

      const g = GRAVITY[p.kind] ?? 0;
      p.vy += g * dt;

      if (p.kind === 'feather') {
        p.vx *= 0.97;
      }

      p.x += p.vx * dt;
      p.y += p.vy * dt;
    }
  },

  draw(ctx, camX) {
    for (let i = 0; i < pool.length; i++) {
      const p = pool[i];
      if (p.age >= p.life) continue;

      const sx = p.x - camX;
      const sy = p.y;
      const t = 1 - p.age / p.life;
      ctx.globalAlpha = t * 0.9;

      switch (p.kind) {
        case 'feather': {
          ctx.fillStyle = '#f2d9b8';
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, 4.5, 2, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'leaf': {
          ctx.fillStyle = p.color;
          ctx.save();
          ctx.translate(sx, sy);
          ctx.rotate(p.rot);
          ctx.beginPath();
          ctx.ellipse(0, 0, 3.5, 1.75, 0, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
          break;
        }
        case 'spark': {
          ctx.fillStyle = '#ff8800';
          const r = 3 + t * 3;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
        case 'dust': {
          ctx.fillStyle = 'rgba(200, 180, 160, 0.6)';
          const r = 1 + t * 4;
          ctx.beginPath();
          ctx.arc(sx, sy, r, 0, Math.PI * 2);
          ctx.fill();
          break;
        }
      }
    }
    ctx.globalAlpha = 1;
  },

  clear() {
    pool.length = 0;
  }
};