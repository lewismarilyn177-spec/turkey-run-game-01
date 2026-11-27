// world.js - parallax background layers and stage theming

const GROUND_Y = 500;
const W = 960;

export const STAGES = [
  { name: 'Farmyard', end: 1600, sky: ['#8fc4e8', '#dfe9c8'], hill: '#6f9e52', hill2: '#56813f', ground: '#8a5a2b', grass: '#6f9e52', accent: '#b34a2e', dust: '#c9b38a' },
  { name: 'Orchard', end: 3400, sky: ['#e8a45f', '#f6d59a'], hill: '#a26a3a', hill2: '#7c4f2c', ground: '#6e4a26', grass: '#b5722f', accent: '#c96b1e', dust: '#e0b06a' },
  { name: 'Kitchen', end: 99999, sky: ['#4a2c34', '#8a4a3a'], hill: '#5a3540', hill2: '#3d2430', ground: '#c9c2b8', grass: '#e0d8cc', accent: '#e8842a', dust: '#f2e6da' }
];

export function stageFor(metres) {
  return STAGES.find((stage) => stage.end > metres) || STAGES[STAGES.length - 1];
}

function screenX(worldX, camX, depth) {
  return worldX - camX * depth + W / 2;
}

function drawHills(ctx, camX, stage) {
  const draw = (color, depth, base, amp, step) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(0, GROUND_Y);
    for (let x = -step; x <= W + step; x += step) {
      const wx = camX * depth + x - W / 2;
      ctx.lineTo(x, base - Math.sin(wx / 180) * amp - Math.sin(wx / 83) * amp * 0.25);
    }
    ctx.lineTo(W, GROUND_Y);
    ctx.closePath();
    ctx.fill();
  };
  draw(stage.hill2, 0.18, 395, 38, 70);
  draw(stage.hill, 0.32, 430, 28, 65);
}

function drawBarn(ctx, x, stage) {
  ctx.fillStyle = stage.accent;
  ctx.fillRect(x, 350, 150, 150);
  ctx.fillStyle = '#6d3023';
  ctx.beginPath();
  ctx.moveTo(x - 14, 350); ctx.lineTo(x + 75, 285); ctx.lineTo(x + 164, 350); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#39231c';
  ctx.fillRect(x + 56, 414, 38, 86);
  ctx.strokeStyle = '#d8a16e'; ctx.lineWidth = 4;
  ctx.beginPath(); ctx.moveTo(x + 58, 416); ctx.lineTo(x + 92, 450); ctx.moveTo(x + 92, 416); ctx.lineTo(x + 58, 450); ctx.stroke();
  ctx.fillStyle = '#d9e8db';
  ctx.fillRect(x + 18, 390, 25, 25); ctx.fillRect(x + 107, 390, 25, 25);
  ctx.strokeStyle = '#6d3023'; ctx.lineWidth = 3;
  ctx.strokeRect(x + 18, 390, 25, 25); ctx.strokeRect(x + 107, 390, 25, 25);
}

function drawFarmProps(ctx, camX, stage) {
  const barnStart = Math.floor((camX - 1000) / 900) * 900;
  for (let wx = barnStart; wx < camX + 1200; wx += 900) drawBarn(ctx, screenX(wx, camX, 0.5), stage);
  ctx.strokeStyle = '#70451f'; ctx.lineWidth = 5;
  const fenceStart = Math.floor((camX - 1000) / 260) * 260;
  for (let wx = fenceStart; wx < camX + 1200; wx += 260) {
    const x = screenX(wx, camX, 0.75);
    ctx.beginPath(); ctx.moveTo(x, 458); ctx.lineTo(x, 505); ctx.moveTo(x + 55, 458); ctx.lineTo(x + 55, 505); ctx.moveTo(x, 470); ctx.lineTo(x + 55, 470); ctx.moveTo(x, 490); ctx.lineTo(x + 55, 490); ctx.stroke();
  }
}

function drawOrchard(ctx, camX, stage, t) {
  const start = Math.floor((camX - 700) / 420) * 420;
  for (let wx = start; wx < camX + 1100; wx += 420) {
    const x = screenX(wx, camX, 0.6);
    const sway = Math.sin(t * 2 + wx * 0.01) * 5;
    ctx.fillStyle = '#513522'; ctx.fillRect(x - 9, 390, 18, 112);
    ctx.fillStyle = stage.grass;
    ctx.beginPath(); ctx.arc(x + sway, 350, 56, 0, Math.PI * 2); ctx.arc(x - 40 + sway, 375, 38, 0, Math.PI * 2); ctx.arc(x + 42 + sway, 378, 40, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = stage.accent;
    for (let i = 0; i < 5; i++) { const px = x - 35 + ((i * 29) % 70); const py = 335 + ((i * 23) % 55); ctx.beginPath(); ctx.arc(px + sway, py, 6, 0, Math.PI * 2); ctx.fill(); }
    ctx.fillStyle = '#d97820'; ctx.beginPath(); ctx.ellipse(x + 75, 487, 18, 14, 0, 0, Math.PI * 2); ctx.fill();
  }
}

function drawKitchenInterior(ctx, camX, stage) {
  ctx.fillStyle = '#d8b6a9'; ctx.fillRect(0, 170, W, 330);
  ctx.strokeStyle = 'rgba(90,45,45,.25)'; ctx.lineWidth = 2;
  for (let x = -((camX * 0.2) % 80); x < W; x += 80) { ctx.beginPath(); ctx.moveTo(x, 170); ctx.lineTo(x, 500); ctx.stroke(); }
  for (let y = 170; y < 500; y += 55) { ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke(); }
  const cabinetOffset = -((camX * 0.35) % 220);
  for (let x = cabinetOffset - 220; x < W + 220; x += 220) {
    ctx.fillStyle = '#8d5542'; ctx.fillRect(x, 205, 185, 105); ctx.strokeStyle = '#4d2b2d'; ctx.strokeRect(x, 205, 185, 105);
    ctx.fillStyle = '#e4b77c'; ctx.beginPath(); ctx.arc(x + 92, 258, 5, 0, Math.PI * 2); ctx.fill();
  }
  const counterOffset = -((camX * 0.55) % 250);
  ctx.fillStyle = '#563538'; ctx.fillRect(0, 382, W, 20);
  for (let x = counterOffset - 250; x < W + 250; x += 250) {
    ctx.fillStyle = '#7b4a3c'; ctx.fillRect(x, 402, 210, 84);
    ctx.fillStyle = '#e3b778'; ctx.fillRect(x + 28, 350, 26, 36); ctx.fillStyle = '#b8d0b0'; ctx.fillRect(x + 32, 342, 18, 9);
    ctx.fillStyle = '#d6a35d'; ctx.fillRect(x + 90, 360, 28, 26); ctx.fillStyle = '#e56f4c'; ctx.fillRect(x + 95, 353, 18, 8);
  }
}

function drawKitchenFloor(ctx, camX, stage) {
  ctx.fillStyle = stage.ground; ctx.fillRect(0, GROUND_Y, W, 100);
  const size = 48; const offset = -((camX * 0.9) % size);
  for (let row = 0; row < 3; row++) for (let col = -1; col < 22; col++) {
    if ((row + col) % 2) { ctx.fillStyle = 'rgba(80,65,65,.12)'; ctx.fillRect(offset + col * size, GROUND_Y + row * size, size, size); }
  }
}

function drawGround(ctx, camX, stage) {
  ctx.fillStyle = stage.ground; ctx.fillRect(0, GROUND_Y, W, 100);
  ctx.fillStyle = stage.grass; ctx.fillRect(0, GROUND_Y, W, 14);
  ctx.strokeStyle = stage.dust; ctx.lineWidth = 2;
  const offset = -((camX * 0.95) % 42);
  for (let x = offset; x < W; x += 42) { ctx.beginPath(); ctx.moveTo(x, 530); ctx.lineTo(x + 6, 536); ctx.moveTo(x + 18, 570); ctx.lineTo(x + 24, 563); ctx.stroke(); }
}

export function drawWorld(ctx, camX, metres, stage, t) {
  stage = stage || stageFor(metres);
  const sky = ctx.createLinearGradient(0, 0, 0, GROUND_Y);
  sky.addColorStop(0, stage.sky[0]); sky.addColorStop(1, stage.sky[1]);
  ctx.fillStyle = sky; ctx.fillRect(0, 0, W, GROUND_Y);
  ctx.fillStyle = stage.name === 'Kitchen' ? '#ffd98a' : '#fff0a6';
  ctx.globalAlpha = 0.72 + Math.sin(t * 2) * 0.12;
  ctx.beginPath(); ctx.arc(stage.name === 'Kitchen' ? 790 : 780, 92, stage.name === 'Kitchen' ? 34 : 42, 0, Math.PI * 2); ctx.fill(); ctx.globalAlpha = 1;
  if (stage.name === 'Kitchen') drawKitchenInterior(ctx, camX, stage);
  else { drawHills(ctx, camX, stage); if (stage.name === 'Farmyard') drawFarmProps(ctx, camX, stage); else drawOrchard(ctx, camX, stage, t); }
  if (stage.name === 'Kitchen') {
    ctx.strokeStyle = '#302126'; ctx.lineWidth = 7;
    const rail = -((camX * 0.45) % 420);
    for (let x = rail - 420; x < W + 420; x += 420) { ctx.beginPath(); ctx.moveTo(x, 135); ctx.lineTo(x + 230, 135); ctx.stroke(); ctx.beginPath(); ctx.moveTo(x + 48, 135); ctx.lineTo(x + 48, 170); ctx.stroke(); ctx.fillStyle = '#b7a79c'; ctx.beginPath(); ctx.arc(x + 48, 185 + Math.sin(t * 2 + x) * 5, 16, 0, Math.PI * 2); ctx.fill(); }
    drawKitchenFloor(ctx, camX, stage);
  } else drawGround(ctx, camX, stage);
}
