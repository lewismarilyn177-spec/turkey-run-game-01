// main.js — entry module: boots the Game on the canvas and exposes a small
// hook the screenshot harness uses (?shot=start|play|end forces a state).

import { Game } from './engine.js';
import { stageFor } from './world.js';

const canvas = document.getElementById('game-canvas');
window.game = new Game(canvas);

// Screenshot harness support: /?shot=start|play|end puts the game into a
// fixed state immediately so a headless browser captures a clean frame.
const params = new URLSearchParams(location.search);
const shot = params.get('shot');
if (shot) {
  const force = () => {
    const g = window.game;
    if (shot === 'start') g.state = 'title';
    if (shot === 'play') {
      g.startRun();
      // pre-set a lively mid-run scene for the capture: kitchen stage,
      // oven burst firing, farmer breathing down the turkey's neck
      g.turkey.wx = 220000;           // ~4400 m, kitchen stage
      g.camX = g.turkey.wx;
      g.score = 1240;
      g.cornEaten = 31;
      g.stage = stageFor(4400);
      g.stageBannerT = 0;
      g.turkey.vy = -320; g.turkey.y = 430; g.turkey.onGround = false;
      g.farmer.gap = 110;
      // compose the frame: oven mid-burst, arcing knife, corn trail
      g.hazards.items.push(
        g.hazards.makeOven(g.turkey.wx + 420),
        g.hazards.makeKnife(g.turkey.wx + 760, true),
        g.hazards.makeKnife(g.turkey.wx + 1000, false),
      );
      g.hazards.items[0].t = 0.5;     // burst active
      g.hazards.items[0].burst = 0.8; // flame height for the frozen frame
      g.hazards.items[1].state = 34;  // arcing blade
      for (let i = 0; i < 5; i++) {
        g.pickups.items.push({ x: g.turkey.wx + 520 + i * 90, y: 380 + (i % 2) * 30, golden: false, t: i, taken: false });
      }
      g.pickups.items.push({ x: g.turkey.wx + 640, y: 340, golden: true, t: 1, taken: false });
      g.frozen = true;                // hold this exact frame for the shot
    }
    if (shot === 'end') {
      g.startRun();
      g.endRun(shot === 'end' ? 'caught' : 'escaped');
      g.score = 880;
      g.cornEaten = 23;
      g.turkey.wx = 80000;
    }
    window.removeEventListener('load', force);
  };
  force();
}
