// world.js — parallax background layers and stage theming.
// Three stages: FARMYARD -> ORCHARD -> KITCHEN, each with its own palette,
// backdrop art and ground styling. All drawing is authored canvas art.

export const STAGES = [
  { name: 'Farmyard',   end: 1600, sky: ['#8fc4e8', '#dfe9c8'], hill: '#6f9e52', hill2: '#56813f', ground: '#8a5a2b', grass: '#6f9e52', accent: '#b34a2e', dust: '#c9b38a' },
  { name: 'Orchard',    end: 3400, sky: ['#e8a45f', '#f6d59a'], hill: '#a26a3a', hill2: '#7c4f2c', ground: '#6e4a26', grass: '#b5722f', accent: '#c96b1e', dust: '#e0b06a' },
  { name: 'Kitchen',    end: 99999, sky: ['#4a2c34', '#8a4a3a'], hill: '#5a3540', hill2: '#3d2430', ground: '#c9c2b8', grass: '#e0d8cc', accent: '#e8842a', dust: '#f2e6da' },
];

export function stageFor(metres) {
  for (const s of STAGES) if (metres < s.end) return s;
  return STAGES[STAGES.length - 1];
}

// deterministic pseudo-random per index so backdrops are stable per frame
function rand(seed) {
  let x = Math.sin(seed * 127.1) * 43758.5453;
  return x - Math.floor(x);
}

export function drawWorld(ctx, camX, metres, stage, t) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  const groundY = 500;

  // sky gradient
  const grad = ctx.createLinearGradient(0, 0, 0, groundY);
  grad.addColorStop(0, stage.sky[0]);
  grad.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, W, H);

  // sun / kitchen lamp glow
  ctx.save();
  ctx.globalAlpha = stage.name === 'Kitchen' ? 0.5 : 0.85;
  ctx.fillStyle = stage.name === 'Kitchen' ? '#ffb35a' : '#fff3c4';
  ctx.beginPath();
  ctx.arc(W - 170, 110, 60 + Math.sin(t * 0.7) * 4, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  if (stage.name === 'Kitchen') {
    drawKitchenInterior(ctx, camX, t, groundY, W);
  } else {
    // far hills (slow parallax)
    ctx.fillStyle = stage.hill2;
    drawHills(ctx, camX * 0.15, groundY - 60, 260, 90, W);

    // mid hills
    ctx.fillStyle = stage.hill;
    drawHills(ctx, camX * 0.3, groundY - 20, 200, 70, W);
  }

  if (stage.name === 'Farmyard') drawFarmProps(ctx, camX);
  if (stage.name === 'Orchard') drawOrchard(ctx, camX, t);
  if (stage.name === 'Kitchen') drawKitchen(ctx, camX, t);

  // ground slab
  ctx.fillStyle = stage.ground;
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.fillStyle = stage.grass;
  ctx.fillRect(0, groundY, W, 14);
  if (stage.name === 'Kitchen') drawKitchenFloor(ctx, camX, groundY, W, H);
  // ground texture ticks
  ctx.fillStyle = 'rgba(0,0,0,0.12)';
  const tickStart = Math.floor(camX / 48) * 48;
  for (let x = tickStart; x < camX + W + 48; x += 48) {
    const sx = x - camX;
    ctx.fillRect(sx + 8, groundY + 24 + (x % 96 ? 0 : 12), 26, 4);
    ctx.fillRect(sx + 30, groundY + 46, 12, 3);
  }
}

// Interior of the farmhouse kitchen: tile wall, cabinets, counters.
function drawKitchenInterior(ctx, camX, t, groundY, W) {
  const ts = 90;
  const off = (camX * 0.25) % ts;
  ctx.strokeStyle = 'rgba(255,255,255,0.10)';
  ctx.lineWidth = 2;
  for (let x = -off; x < W + ts; x += ts) {
    ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, groundY - 130); ctx.stroke();
  }
  for (let y = 60; y < groundY - 130; y += ts) {
    ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
  }

  // upper cabinets (parallax 0.35)
  const cs = 210;
  const cstart = Math.floor(camX * 0.35 / cs) * cs;
  for (let wx = cstart - cs; wx < camX * 0.35 + W + cs; wx += cs) {
    const x = wx - camX * 0.35;
    ctx.fillStyle = '#6b3f2a';
    ctx.fillRect(x, 120, 190, 110);
    ctx.fillStyle = '#8a5233';
    ctx.fillRect(x + 8, 128, 84, 94);
    ctx.fillRect(x + 98, 128, 84, 94);
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath(); ctx.arc(x + 80, 176, 4, 0, Math.PI * 2); ctx.fill();
    ctx.beginPath(); ctx.arc(x + 110, 176, 4, 0, Math.PI * 2); ctx.fill();
  }

  // counter line (parallax 0.55) with jars
  const ks = 320;
  const kstart = Math.floor(camX * 0.55 / ks) * ks;
  for (let wx = kstart - ks; wx < camX * 0.55 + W + ks; wx += ks) {
    const x = wx - camX * 0.55;
    ctx.fillStyle = '#5a3524';
    ctx.fillRect(x, groundY - 150, 300, 26);
    ctx.fillStyle = '#3d2418';
    ctx.fillRect(x, groundY - 124, 300, 24);
    ctx.fillStyle = '#c9d8c0';
    ctx.fillRect(x + 40, groundY - 196, 26, 46);
    ctx.fillStyle = '#a8c096';
    ctx.fillRect(x + 96, groundY - 182, 30, 32);
    ctx.fillStyle = '#e8c88a';
    ctx.beginPath();
    ctx.roundRect(x + 170, groundY - 178, 22, 28, 6);
    ctx.fill();
  }
}

function drawKitchenFloor(ctx, camX, groundY, W, H) {
  const size = 60;
  const off = camX % (size * 2);
  ctx.save();
  for (let r = 0; r < 3; r++) {
    for (let x = -off - size * 2; x < W + size * 2; x += size) {
      ctx.fillStyle = (Math.round((x + off) / size) + r) % 2 ? '#b9b1a4' : '#d5cec2';
      ctx.fillRect(x, groundY + 14 + r * size, size, size);
    }
  }
  const vg = ctx.createLinearGradient(0, groundY, 0, H);
  vg.addColorStop(0, 'rgba(0,0,0,0)');
  vg.addColorStop(1, 'rgba(0,0,0,0.25)');
  ctx.fillStyle = vg;
  ctx.fillRect(0, groundY, W, H - groundY);
  ctx.restore();
}

function drawHills(ctx, offset, baseY, wavelength, amp, W) {
  ctx.beginPath();
  ctx.moveTo(0, baseY + 200);
  for (let x = -wavelength; x <= W + wavelength; x += 8) {
    const phase = ((x + offset) / wavelength) * Math.PI * 2;
    ctx.lineTo(x, baseY - Math.abs(Math.sin(phase)) * amp - Math.cos(phase * 0.5) * amp * 0.3);
  }
  ctx.lineTo(W, baseY + 200);
  ctx.closePath();
  ctx.fill();
}

function drawFarmProps(ctx, camX) {
  const groundY = 500;
  const W = ctx.canvas.width;
  // barn every ~900 px (parallax 0.5)
  const spacing = 900;
  const start = Math.floor(camX * 0.5 / spacing) * spacing;
  for (let wx = start - spacing; wx < camX * 0.5 + W + spacing; wx += spacing) {
    const x = wx - camX * 0.5;
    drawBarn(ctx, x, groundY - 150);
  }
  // fences (parallax 0.75)
  const fs = 260;
  const fstart = Math.floor(camX * 0.75 / fs) * fs;
  ctx.fillStyle = '#c9a26a';
  for (let wx = fstart - fs; wx < camX * 0.75 + W + fs; wx += fs) {
    const x = wx - camX * 0.75;
    ctx.fillRect(x, groundY - 42, 8, 42);
    ctx.fillRect(x + 60, groundY - 42, 8, 42);
    ctx.fillRect(x, groundY - 34, 70, 6);
    ctx.fillRect(x, groundY - 16, 70, 6);
  }
}

function drawBarn(ctx, x, y) {
  ctx.fillStyle = '#a33226';
  ctx.fillRect(x, y + 40, 150, 110);
  ctx.beginPath();
  ctx.moveTo(x - 12, y + 44);
  ctx.lineTo(x + 75, y);
  ctx.lineTo(x + 162, y + 44);
  ctx.closePath();
  ctx.fill();
  ctx.fillStyle = '#6e221a';
  ctx.fillRect(x + 55, y + 90, 44, 60);
  ctx.strokeStyle = '#f2e2c0';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(x + 55, y + 90); ctx.lineTo(x + 99, y + 150);
  ctx.moveTo(x + 99, y + 90); ctx.lineTo(x + 55, y + 150);
  ctx.stroke();
  ctx.fillStyle = '#f2e2c0';
  ctx.fillRect(x + 20, y + 60, 26, 26);
}

function drawOrchard(ctx, camX, t) {
  const groundY = 500;
  const W = ctx.canvas.width;
  const spacing = 420;
  const start = Math.floor(camX * 0.6 / spacing) * spacing;
  for (let wx = start - spacing; wx < camX * 0.6 + W + spacing; wx += spacing) {
    const x = wx - camX * 0.6;
    const sway = Math.sin(t * 1.2 + wx) * 3;
    ctx.fillStyle = '#5e3d20';
    ctx.fillRect(x + 30, groundY - 90, 14, 90);
    ctx.fillStyle = '#c96b1e';
    ctx.beginPath();
    ctx.arc(x + 37 + sway, groundY - 110, 52, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#e0802c';
    ctx.beginPath();
    ctx.arc(x + 20 + sway, groundY - 120, 30, 0, Math.PI * 2);
    ctx.arc(x + 56 + sway, groundY - 122, 28, 0, Math.PI * 2);
    ctx.fill();
    // pumpkins on ground
    ctx.fillStyle = '#d8641f';
    ctx.beginPath();
    ctx.arc(x + 120, groundY - 12, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#3e6e2a';
    ctx.fillRect(x + 116, groundY - 34, 8, 10);
  }
}

function drawKitchen(ctx, camX, t) {
  const groundY = 500;
  const W = ctx.canvas.width;
  // tiled wall
  ctx.fillStyle = 'rgba(255,255,255,0.08)';
  const ts = 80;
  const tstart = Math.floor(camX * 0.4 / ts) * ts;
  for (let wx = tstart - ts; wx < camX * 0.4 + W + ts; wx += ts) {
    for (let y = 80; y < groundY - 120; y += ts) {
      ctx.fillRect(wx - camX * 0.4, y, ts - 6, ts - 6);
    }
  }
  // hanging pots (parallax 0.6)
  const ps = 300;
  const pstart = Math.floor(camX * 0.6 / ps) * ps;
  for (let wx = pstart - ps; wx < camX * 0.6 + W + ps; wx += ps) {
    const x = wx - camX * 0.6;
    ctx.fillStyle = '#2a2028';
    ctx.fillRect(x, 90, 90, 6);
    ctx.fillStyle = '#555a63';
    const swing = Math.sin(t * 1.5 + wx) * 6;
    ctx.beginPath();
    ctx.arc(x + 20 + swing, 130, 24, 0, Math.PI);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(x + 60 + swing, 125, 20, 0, Math.PI);
    ctx.fill();
  }
}
