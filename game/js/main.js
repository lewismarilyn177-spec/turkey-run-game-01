// main.js - entry module and screenshot harness setup
import { Game } from './engine.js';
import { stageFor } from './world.js';

window.game = new Game(document.getElementById('game-canvas'));
const g = window.game;
if (new URLSearchParams(location.search).get('autostart') === '1') {
  g.startRun();
}
const shot = new URLSearchParams(location.search).get('shot');

if (shot === 'start') {
  g.state = 'title';
} else if (shot === 'play') {
  const wx = 220000;
  g.startRun();
  g.turkey.wx = wx;
  g.camX = wx;
  g.score = 1240;
  g.cornEaten = 31;
  g.stage = stageFor(4400);
  g.stageBannerT = 0;
  g.turkey.vy = -320;
  g.turkey.y = 430;
  g.turkey.onGround = false;
  g.farmer.gap = 110;
  g.hazards.items.push(
    g.hazards.makeOven(wx + 420),
    g.hazards.makeKnife(wx + 760, true),
    g.hazards.makeKnife(wx + 1000, false)
  );
  g.hazards.items[0].t = 0.5;
  g.hazards.items[0].burst = 0.8;
  g.hazards.items[1].state = 34;
  for (let i = 0; i < 5; i++) {
    g.pickups.items.push({ x: wx + 520 + i * 90, y: 380 + (i % 2) * 30, golden: false, t: i, taken: false });
  }
  g.pickups.items.push({ x: wx + 640, y: 340, golden: true, t: 1, taken: false });
  g.frozen = true;
} else if (shot === 'end') {
  g.startRun();
  g.score = 880;
  g.cornEaten = 23;
  g.turkey.wx = 80000;
  g.camX = g.turkey.wx;
  g.endRun('caught');
}
