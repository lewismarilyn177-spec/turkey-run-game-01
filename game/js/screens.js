// screens.js - title screen and end screens (caught / escaped)
import { particles } from './particles.js';

export function drawTitleScreen(ctx, game) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;

  // overlay
  ctx.fillStyle = 'rgba(40,20,6,0.45)';
  ctx.fillRect(0, 0, W, H);

  // ribbon panel
  ctx.fillStyle = 'rgba(30,18,8,0.7)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 330, 92, 660, 150, 16);
  ctx.fill();
  ctx.strokeStyle = '#d8b25a';
  ctx.lineWidth = 3;
  ctx.stroke();

  // title with wobble
  const wobble = Math.sin(game.time * 2) * 6;
  ctx.save();
  ctx.translate(W / 2, 120 + wobble);
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 8;
  ctx.font = 'bold 62px sans-serif';
  ctx.textAlign = 'center';
  ctx.strokeText('TURKEY RUN', 0, 0);
  ctx.fillStyle = '#ffb140';
  ctx.fillText('TURKEY RUN', 0, 0);
  ctx.restore();

  // subtitle
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 22px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText('Escape the Feast!', W / 2, 170);

  // tagline
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '18px sans-serif';
  ctx.fillText('Outrun the farmer. Dodge the knives. Survive the kitchen.', W / 2, 200);

  // press start pulsing
  const pressAlpha = 0.6 + Math.sin(game.time * 4) * 0.4;
  ctx.save();
  ctx.globalAlpha = pressAlpha;
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 26px sans-serif';
  ctx.fillText('Press SPACE or Click to Start', W / 2, 280);
  ctx.restore();

  // confetti
  particles.draw(ctx, game.camX);
}

export function drawEndScreen(ctx, game) {
  const W = ctx.canvas.width;
  const H = ctx.canvas.height;
  const escaped = game.escaped;

  // overlay
  ctx.fillStyle = escaped ? 'rgba(20,50,20,0.55)' : 'rgba(60,14,10,0.55)';
  ctx.fillRect(0, 0, W, H);

  // panel
  const strokeColor = escaped ? '#8fe06a' : '#ff7a5a';
  ctx.fillStyle = 'rgba(30,18,8,0.85)';
  ctx.beginPath();
  ctx.roundRect(W / 2 - 300, 150, 600, 240, 16);
  ctx.fill();
  ctx.strokeStyle = strokeColor;
  ctx.lineWidth = 4;
  ctx.stroke();

  // verdict
  ctx.save();
  ctx.translate(W / 2, 200);
  ctx.textAlign = 'center';
  ctx.strokeStyle = 'rgba(0,0,0,0.6)';
  ctx.lineWidth = 6;
  ctx.font = 'bold 50px sans-serif';
  ctx.strokeText(escaped ? 'ESCAPED!' : 'CAUGHT!', 0, 0);
  ctx.fillStyle = escaped ? '#8fe06a' : '#ff7a5a';
  ctx.fillText(escaped ? 'ESCAPED!' : 'CAUGHT!', 0, 0);
  ctx.restore();

  // subtitle
  ctx.fillStyle = '#ffe9c9';
  ctx.font = 'bold 18px sans-serif';
  ctx.textAlign = 'center';
  ctx.fillText(escaped ? 'You are nobody\'s dinner this year.' : 'Thanksgiving dinner it is... gobble gobble.', W / 2, 250);

  // stats
  const dist = Math.floor(game.turkey.wx / 50);
  const corn = game.cornEaten || 0;
  ctx.fillStyle = '#ffd88a';
  ctx.font = 'bold 24px sans-serif';
  ctx.fillText(`Score ${game.score}  -  ${dist} m  -  corn ${corn}`, W / 2, 295);

  // press again pulsing
  const pressAlpha = 0.6 + Math.sin(game.time * 4) * 0.4;
  ctx.save();
  ctx.globalAlpha = pressAlpha;
  ctx.fillStyle = '#ffe9c9';
  ctx.font = '18px sans-serif';
  ctx.fillText('Press SPACE or Click to Run Again', W / 2, 350);
  ctx.restore();
}