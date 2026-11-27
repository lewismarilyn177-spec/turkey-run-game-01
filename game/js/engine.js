// engine.js — game loop, state machine, input, collisions.
// States: 'title' | 'playing' | 'paused' | 'end'

import { Turkey } from './player.js';
import { Farmer } from './farmer.js';
import { HazardField } from './hazards.js';
import { PickupField } from './pickups.js';
import { SoundKit } from './audio.js';
import { particles } from './particles.js';
import { drawWorld, stageFor } from './world.js';
import { drawHUD } from './hud.js';
import { drawTitleScreen, drawEndScreen } from './screens.js';

const ESCAPE_METRES = 6000; // reach this distance to win (escaped)

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.sound = new SoundKit();
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.hazards = new HazardField();
    this.pickups = new PickupField();
    this.state = 'title';
    this.time = 0;
    this.camX = 0;
    this.score = 0;
    this.cornEaten = 0;
    this.speed = 320;
    this.stage = stageFor(0);
    this.stageBannerT = 0;
    this.verdict = null;
    this.shotMode = null; // set by query ?shot=... for deterministic screenshots

    this.bindInput();
    this.last = performance.now();
    requestAnimationFrame(() => this.frame());
  }

  bindInput() {
    const startOrRestart = () => {
      this.sound.ensure();
      if (this.state === 'title' || this.state === 'end') this.startRun();
    };
    window.addEventListener('keydown', (e) => {
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' '].includes(e.key)) e.preventDefault();
      if (e.key === ' ' || e.key === 'Enter') startOrRestart();
      if (this.state !== 'playing') return;
      if (e.key === 'ArrowUp') {
        const n = this.turkey.jump();
        if (n === 1) this.sound.jump();
        if (n === 2) this.sound.flap();
      }
      if (e.key === 'ArrowDown') { this.turkey.slide(true); this.sound.slide(); }
      if (e.key === 'p' || e.key === 'P') this.state = this.state === 'playing' ? 'paused' : 'playing';
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowDown') this.turkey.slide(false);
    });
    this.canvas.addEventListener('mousedown', () => {
      startOrRestart();
      if (this.state === 'playing') {
        const n = this.turkey.jump();
        if (n === 1) this.sound.jump();
        if (n === 2) this.sound.flap();
      }
    });
  }

  startRun() {
    this.turkey.reset();
    this.farmer.reset();
    this.hazards.reset();
    this.pickups.reset();
    particles.clear();
    this.state = 'playing';
    this.score = 0;
    this.cornEaten = 0;
    this.speed = 320;
    this.stage = stageFor(0);
    this.stageBannerT = 0;
    this.verdict = null;
    this.time = 0;
  }

  endRun(verdict) {
    this.state = 'end';
    this.verdict = verdict;
    if (verdict === 'caught') {
      this.sound.caught();
      this.farmer.caughtT = 1.2;
    } else {
      this.sound.escaped();
    }
  }

  frame() {
    const now = performance.now();
    let dt = Math.min(0.033, (now - this.last) / 1000);
    this.last = now;
    this.time += dt;

    if (this.frozen) { this.render(); return; }
    if (this.state === 'playing') this.update(dt);
    else if (this.state === 'title' || this.state === 'end') {
      // gentle drift so backgrounds feel alive behind menus
      this.camX += 30 * dt;
      particles.update(dt);
      spawnAmbientLeaves(this, dt);
    }
    this.render();

    if (this.shotMode === 'single') {
      // screenshot helper: stop animating after first stable frame
      this.shotMode = 'done';
    }
    requestAnimationFrame(() => this.frame());
  }

  update(dt) {
    const difficulty = Math.min(1, this.turkey.wx / (ESCAPE_METRES * 50));
    // speed grows over the run
    this.speed = 320 + difficulty * 190;
    if (this.turkey.boostT > 0) this.speed *= 1.25;

    this.turkey.update(dt, this.speed, this.sound);
    this.camX = this.turkey.wx;

    const caughtByFarmer = this.farmer.update(dt, this.turkey.wx, this.speed, difficulty, this.turkey);
    if (caughtByFarmer) return this.endRun('caught');

    const newStage = stageFor(this.turkey.wx / 50);
    if (newStage.name !== this.stage.name) {
      this.stage = newStage;
      this.stageBannerT = 2.2;
      this.sound.stage();
      // breathing room after each stage change
      this.hazards.nextSpawn = this.turkey.wx + 700;
    }
    this.stageBannerT = Math.max(0, this.stageBannerT - dt);

    this.hazards.spawnAhead(this.turkey.wx, difficulty, this.stage.name);
    for (const h of this.hazards.items) this.hazards.isDeadly(h, dt);
    this.pickups.spawnAhead(this.turkey.wx, this.hazards);

    // collisions: hazards
    const tb = this.turkey.box;
    for (const h of this.hazards.items) {
      if (overlap(tb, this.hazards.hitBox(h))) {
        if (this.turkey.hurt(this.sound)) {
          this.farmer.gap = Math.max(50, this.farmer.gap - 130);
          if (this.turkey.lives <= 0) return this.endRun('caught');
        }
      }
    }

    // collisions: pickups
    for (const c of this.pickups.items) {
      if (c.taken) continue;
      if (overlap(tb, { x: c.x - 16, y: c.y - 22, w: 32, h: 44 })) {
        c.taken = true;
        this.cornEaten++;
        if (c.golden) {
          this.score += 50;
          this.turkey.boostT = 3;
          if (this.turkey.lives < 3) this.turkey.lives++;
          this.sound.escaped();
        } else {
          this.score += 10;
          this.sound.corn();
        }
      }
    }

    // distance score + win check
    this.score += Math.floor(this.speed * dt / 10);
    if (this.turkey.wx / 50 >= ESCAPE_METRES) return this.endRun('escaped');

    this.hazards.cull(this.turkey.wx);
    this.pickups.cull(this.turkey.wx);
    spawnAmbientLeaves(this, dt);
  }

  render() {
    const ctx = this.ctx;
    drawWorld(ctx, this.camX, this.turkey.wx / 50, this.stage, this.time);
    particles.draw(ctx, this.camX);

    // farmer behind turkey
    this.farmer.draw(ctx, this.turkey.x, this.turkey.wx, this.time);
    this.turkey.draw(ctx, this.time);
    this.hazards.draw(ctx, this.camX, this.time);
    this.pickups.draw(ctx, this.camX, this.time);

    if (this.state === 'playing' || this.state === 'paused') {
      drawHUD(ctx, this);
      if (this.state === 'paused') {
        ctx.save();
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, 0, ctx.canvas.width, 600);
        ctx.fillStyle = '#ffe9c9';
        ctx.font = 'bold 40px "Trebuchet MS"';
        ctx.textAlign = 'center';
        ctx.fillText('PAUSED', ctx.canvas.width / 2, 300);
        ctx.restore();
      }
    }
    if (this.state === 'title') drawTitleScreen(ctx, this);
    if (this.state === 'end') drawEndScreen(ctx, this);
  }
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}

function spawnAmbientLeaves(game, dt) {
  if (Math.random() < dt * 6) {
    particles.spawn({
      x: game.camX + 960 + Math.random() * 100,
      y: -10,
      vx: -60 - Math.random() * 60,
      vy: 40 + Math.random() * 40,
      life: 3 + Math.random() * 2,
      kind: 'leaf',
      rot: Math.random() * Math.PI * 2,
      color: game.stage.name === 'Kitchen' ? '#e8842a' : ['#d8741f', '#c96b1e', '#b58a2f'][Math.floor(Math.random() * 3)],
    });
  }
}
