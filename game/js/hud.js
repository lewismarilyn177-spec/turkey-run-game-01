// hud.js - score, distance, lives, stage banner

export function drawHUD(ctx, game) {
  const W = ctx.canvas.width;
  const GROUND_Y = 500;

  // Top bar
  ctx.fillStyle = 'rgba(30,18,8,0.55)';
  ctx.beginPath();
  ctx.roundRect(10, 10, W - 20, 52, 12);
  ctx.fill();

  // Lives: feather-heart shapes
  const lives = game.turkey.lives || 3;
  for (let i = 0; i < 3; i++) {
    const hx = 36 + i * 40;
    const hy = 36;
    ctx.fillStyle = i < lives ? '#e0402a' : 'rgba(255,255,255,0.2)';
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.bezierCurveTo(hx - 14, hy - 14, hx - 14, hy + 6, hx, hy + 12);
    ctx.bezierCurveTo(hx + 14, hy + 6, hx + 14, hy - 14, hx, hy);
    ctx.fill();
    // center vein line
    ctx.strokeStyle = 'rgba(0,0,0,0.3)';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.moveTo(hx, hy);
    ctx.lineTo(hx, hy + 12);
    ctx.stroke();
  }

  // Score
  ctx.fillStyle = '#c9b38a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('SCORE', 150, 26);
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(game.score, 150, 48);

  // Distance centered
  const dist = Math.floor(game.turkey.wx / 50) + ' m';
  ctx.fillStyle = '#c9b38a';
  ctx.font = 'bold 12px sans-serif';
  const distCapW = ctx.measureText('DISTANCE').width;
  ctx.fillText('DISTANCE', W / 2 - distCapW / 2, 26);
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 24px sans-serif';
  const distW = ctx.measureText(dist).width;
  ctx.fillText(dist, W / 2 - distW / 2, 48);

  // Stage right-aligned
  ctx.fillStyle = '#c9b38a';
  ctx.font = 'bold 12px sans-serif';
  ctx.fillText('STAGE', W - 160, 26);
  ctx.fillStyle = game.stage.accent || '#ffe9c9';
  ctx.font = 'bold 20px sans-serif';
  ctx.fillText(game.stage.name, W - 160, 48);

  // Stage banner
  if (game.stageBannerT > 0) {
    const alpha = Math.min(1, game.stageBannerT);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.fillStyle = game.stage.accent || '#ffe9c9';
    ctx.font = 'bold 44px sans-serif';
    const bannerW = ctx.measureText(game.stage.name).width;
    ctx.strokeStyle = 'rgba(0,0,0,0.5)';
    ctx.lineWidth = 4;
    ctx.strokeText(game.stage.name, W / 2 - bannerW / 2, 110 + (1 - alpha) * 40);
    ctx.fillText(game.stage.name, W / 2 - bannerW / 2, 110 + (1 - alpha) * 40);
    ctx.fillStyle = '#ffe9c9';
    ctx.font = 'bold 18px sans-serif';
    const capW = ctx.measureText('Watch out!').width;
    ctx.fillText('Watch out!', W / 2 - capW / 2, 140 + (1 - alpha) * 40);
    ctx.restore();
  }

  // Danger vignette
  if (game.farmer && game.farmer.gap < 110) {
    const vignetteAlpha = (1 - game.farmer.gap / 110) * 0.35 * (0.7 + 0.3 * Math.sin(game.time * 8));
    const grad = ctx.createRadialGradient(W / 2, GROUND_Y / 2, 0, W / 2, GROUND_Y / 2, W);
    grad.addColorStop(0, `rgba(120,0,0,${vignetteAlpha})`);
    grad.addColorStop(1, 'rgba(120,0,0,0)');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, ctx.canvas.height);
  }
}