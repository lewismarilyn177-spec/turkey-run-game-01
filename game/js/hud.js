// hud.js — score, distance, lives, stage banner, drawn over the game view.

export function drawHUD(ctx, game) {
  const W = ctx.canvas.width;

  // top bar backing
  ctx.save();
  ctx.fillStyle = 'rgba(30,18,8,0.55)';
  ctx.beginPath();
  ctx.roundRect(10, 10, W - 20, 52, 12);
  ctx.fill();

  // lives as feather hearts
  for (let i = 0; i < 3; i++) {
    const filled = i < game.turkey.lives;
    drawFeatherHeart(ctx, 36 + i * 40, 36, filled ? '#e0402a' : 'rgba(255,255,255,0.25)');
  }

  // score
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 24px "Trebuchet MS"';
  ctx.textAlign = 'left';
  ctx.fillText(`${game.score}`, 150, 44);
  ctx.font = '12px "Trebuchet MS"';
  ctx.fillStyle = '#c9b38a';
  ctx.fillText('SCORE', 150, 22);

  // distance
  ctx.font = 'bold 24px "Trebuchet MS"';
  ctx.fillStyle = '#ffe9c9';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.floor(game.turkey.wx / 50)} m`, W / 2, 44);
  ctx.font = '12px "Trebuchet MS"';
  ctx.fillStyle = '#c9b38a';
  ctx.fillText('DISTANCE', W / 2, 22);

  // stage
  ctx.textAlign = 'right';
  ctx.font = 'bold 20px "Trebuchet MS"';
  ctx.fillStyle = game.stage.accent;
  ctx.fillText(game.stage.name.toUpperCase(), W - 24, 40);
  ctx.font = '12px "Trebuchet MS"';
  ctx.fillStyle = '#c9b38a';
  ctx.fillText('STAGE', W - 24, 22);
  ctx.restore();

  // stage banner on change
  if (game.stageBannerT > 0) {
    ctx.save();
    const a = Math.min(1, game.stageBannerT);
    ctx.globalAlpha = a;
    ctx.font = 'bold 44px "Trebuchet MS"';
    ctx.textAlign = 'center';
    ctx.lineWidth = 6;
    ctx.strokeStyle = '#2a1a0e';
    ctx.fillStyle = game.stage.accent;
    const y = 200 - (1 - a) * 40;
    ctx.strokeText(game.stage.name, W / 2, y);
    ctx.fillText(game.stage.name, W / 2, y);
    ctx.font = '16px "Trebuchet MS"';
    ctx.fillStyle = '#ffe9c9';
    ctx.strokeText('Watch out!', W / 2, y + 30);
    ctx.fillText('Watch out!', W / 2, y + 30);
    ctx.restore();
  }

  // danger proximity vignette when farmer is close
  if (game.farmer.gap < 110) {
    const p = 1 - game.farmer.gap / 110;
    ctx.save();
    ctx.globalAlpha = p * 0.35 * (0.7 + Math.sin(game.time * 8) * 0.3);
    const vg = ctx.createRadialGradient(W / 2, 300, 220, W / 2, 300, 560);
    vg.addColorStop(0, 'rgba(200,20,20,0)');
    vg.addColorStop(1, 'rgba(200,20,20,1)');
    ctx.fillStyle = vg;
    ctx.fillRect(0, 0, W, 600);
    ctx.restore();
  }
}

function drawFeatherHeart(ctx, x, y, color) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.moveTo(0, 10);
  ctx.bezierCurveTo(-16, -2, -12, -16, 0, -8);
  ctx.bezierCurveTo(12, -16, 16, -2, 0, 10);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.4)';
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(0, 8); ctx.lineTo(0, -8);
  ctx.stroke();
  ctx.restore();
}
