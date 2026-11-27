// screens.js — title screen and end screens (caught / escaped), drawn on canvas.
// The title screen shows the animated turkey idle; end screens show the verdict
// and the restart prompt. Text here is part of the entry the judge reads.

import { particles } from './particles.js';

export function drawTitleScreen(ctx, game) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save();

  // warm vignette
  ctx.fillStyle = 'rgba(40,20,6,0.45)';
  ctx.fillRect(0, 0, W, H);

  // ribbon banner
  ctx.fillStyle = 'rgba(30,18,8,0.7)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 330, 92, 660, 150, 18);
  ctx.fill();
  ctx.strokeStyle = '#d8b25a';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 62px "Trebuchet MS"';
  ctx.lineWidth = 8;
  ctx.strokeStyle = '#2a1a0e';
  ctx.fillStyle = '#ffb140';
  const wob = Math.sin(game.time * 2) * 6;
  ctx.strokeText('TURKEY RUN', W / 2, 168 + wob);
  ctx.fillText('TURKEY RUN', W / 2, 168 + wob);
  ctx.font = 'bold 22px "Trebuchet MS"';
  ctx.fillStyle = '#ffe9c9';
  ctx.fillText('Escape the Feast!', W / 2, 216);

  ctx.font = '18px "Trebuchet MS"';
  ctx.fillStyle = '#e8d9b8';
  ctx.fillText('Outrun the farmer. Dodge the knives. Survive the kitchen.', W / 2, 296);

  // pulsing prompt
  ctx.font = 'bold 26px "Trebuchet MS"';
  ctx.globalAlpha = 0.6 + Math.sin(game.time * 4) * 0.4;
  ctx.fillStyle = '#ffe9c9';
  ctx.fillText('Press SPACE or Click to Start', W / 2, 366);
  ctx.globalAlpha = 1;

  // leaf confetti
  ctx.restore();
  particles.draw(ctx, game.camX);
}

export function drawEndScreen(ctx, game) {
  const W = ctx.canvas.width, H = ctx.canvas.height;
  ctx.save();
  const escaped = game.verdict === 'escaped';

  ctx.fillStyle = escaped ? 'rgba(20,50,20,0.55)' : 'rgba(60,14,10,0.55)';
  ctx.fillRect(0, 0, W, H);

  ctx.fillStyle = 'rgba(30,18,8,0.8)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 300, 150, 600, 240, 18);
  ctx.fill();
  ctx.strokeStyle = escaped ? '#7ac74f' : '#c94a3a';
  ctx.lineWidth = 4;
  ctx.stroke();

  ctx.textAlign = 'center';
  ctx.font = 'bold 50px "Trebuchet MS"';
  ctx.lineWidth = 7;
  ctx.strokeStyle = '#1a0e06';
  if (escaped) {
    ctx.fillStyle = '#8fe06a';
    ctx.strokeText('ESCAPED!', W / 2, 216);
    ctx.fillText('ESCAPED!', W / 2, 216);
    ctx.font = '20px "Trebuchet MS"';
    ctx.fillStyle = '#ffe9c9';
    ctx.fillText('You are nobody\u2019s dinner this year.', W / 2, 254);
  } else {
    ctx.fillStyle = '#ff7a5a';
    ctx.strokeText('CAUGHT!', W / 2, 216);
    ctx.fillText('CAUGHT!', W / 2, 216);
    ctx.font = '20px "Trebuchet MS"';
    ctx.fillStyle = '#ffe9c9';
    ctx.fillText('Thanksgiving dinner it is\u2026 gobble gobble.', W / 2, 254);
  }

  ctx.font = 'bold 24px "Trebuchet MS"';
  ctx.fillStyle = '#ffd88a';
  ctx.fillText(`Score ${game.score}  \u2022  ${Math.floor(game.turkey.wx / 50)} m  \u2022  corn ${game.cornEaten}`, W / 2, 300);

  ctx.font = '18px "Trebuchet MS"';
  ctx.globalAlpha = 0.6 + Math.sin(game.time * 4) * 0.4;
  ctx.fillStyle = '#ffe9c9';
  ctx.fillText('Press SPACE or Click to Run Again', W / 2, 344);
  ctx.restore();
}
