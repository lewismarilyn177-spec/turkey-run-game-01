// engine.js - game loop, state machine, input, collisions
import { Turkey } from './player.js';
import { Farmer } from './farmer.js';
import { HazardField } from './hazards.js';
import { PickupField } from './pickups.js';
import { particles } from './particles.js';
import { SoundKit } from './audio.js';
import { drawHUD } from './hud.js';
import { drawTitleScreen, drawEndScreen } from './screens.js';
import { drawWorld, stageFor } from './world.js';

const ESCAPE_METRES = 6000;
const LEAF_COLORS = ['#b74b1a', '#d89434', '#a04010', '#c87a2a'];

export class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.turkey = new Turkey();
    this.farmer = new Farmer();
    this.hazards = new HazardField();
    this.pickups = new PickupField();
    this.sound = new SoundKit();
    this.state = 'title';
    this.frozen = false;
    this.time = 0;
    this.camX = 0;
    this.score = 0;
    this.cornEaten = 0;
    this.speed = 320;
    this.stage = stageFor(0);
    this.stageBannerT = 0;
    this.verdict = null;
    this.leafTimer = 0;
    this.bindInput(canvas);
    this.last = performance.now();
    this._raf = () => this.frame();
    requestAnimationFrame(this._raf);
  }

  bindInput(canvas) {
    const start = () => {
      this.sound.ensure();
      if (this.state === 'title' || this.state === 'end') this.startRun();
    };
    window.addEventListener('keydown', (e) => {
      if ([' ', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) e.preventDefault();
      if (e.key === ' ' || e.key === 'Enter') { start(); return; }
      if (e.key === 'p' || e.key === 'P') {
        if (this.state === 'playing') this.state = 'paused';
        else if (this.state === 'paused') this.state = 'playing';
        return;
      }
      if (this.state !== 'playing') return;
      if (e.key === 'ArrowUp') {
        const jump = this.turkey.jump();
        if (jump === 1) this.sound.jump();
        else if (jump === 2) this.sound.flap();
      } else if (e.key === 'ArrowDown') {
        if (!this.turkey.sliding) this.sound.slide();
        this.turkey.slide(true);
      }
    });
    window.addEventListener('keyup', (e) => {
      if (e.key === 'ArrowDown') this.turkey.slide(false);
    });
    canvas.addEventListener('click', () => {
      if (this.state === 'title' || this.state === 'end') start();
      else if (this.state === 'playing') {
        const jump = this.turkey.jump();
        if (jump === 1) this.sound.jump();
        else if (jump === 2) this.sound.flap();
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
    this.frozen = false;
    this.time = 0;
    this.camX = 0;
    this.score = 0;
    this.cornEaten = 0;
    this.speed = 320;
    this.stage = stageFor(0);
    this.stageBannerT = 0;
    this.verdict = null;
    this.leafTimer = 0;
  }

  endRun(verdict) {
    this.state = 'end';
    this.verdict = verdict;
    if (verdict === 'caught') this.sound.caught();
    if (verdict === 'escaped') this.sound.escaped();
  }

  frame() {
    const now = performance.now();
    let dt = (now - this.last) / 1000;
    this.last = now;
    dt = Math.min(dt, 0.033);
    this.time += dt;
    if (this.frozen) {
      this.render();
      requestAnimationFrame(this._raf);
      return;
    }
    if (this.state === 'playing') this.update(dt);
    else if (this.state === 'title' || this.state === 'end') {
      particles.update(dt);
      this.spawnAmbientLeaves(dt);
    }
    this.render();
    requestAnimationFrame(this._raf);
  }

  update(dt) {
    const difficulty = Math.min(1, this.turkey.wx / 300000);
    let speed = 320 + difficulty * 190;
    if (this.turkey.boostT > 0) speed *= 1.25;
    this.speed = speed;
    this.turkey.update(dt, speed, this.sound);
    this.camX = this.turkey.wx;
    if (this.farmer.update(dt, this.turkey.wx, speed, difficulty, this.turkey)) {
      this.endRun('caught');
      return;
    }
    const nextStage = stageFor(this.turkey.wx / 50);
    if (nextStage.name !== this.stage.name) {
      this.stage = nextStage;
      this.stageBannerT = 2.2;
      this.sound.stage();
      this.hazards.nextSpawn += 700;
    }
    this.stageBannerT = Math.max(0, this.stageBannerT - dt);
    this.hazards.spawnAhead(this.turkey.wx, difficulty, this.stage.name);
    for (const item of this.hazards.items) {
      const deadly = this.hazards.isDeadly(item, dt);
      if (deadly && overlap(this.turkey.box, this.hazards.hitBox(item)) && this.turkey.hurt(this.sound)) {
        this.farmer.gap -= 130;
        if (this.turkey.lives <= 0) { this.endRun('caught'); return; }
      }
    }
    this.pickups.spawnAhead(this.turkey.wx, this.hazards);
    for (const item of this.pickups.items) {
      if (item.taken || !overlap(this.turkey.box, { x: item.x - 18, y: item.y - 22, w: 36, h: 44 })) continue;
      item.taken = true;
      this.cornEaten++;
      this.score += item.golden ? 50 : 10;
      this.sound.corn();
      if (item.golden) {
        this.turkey.boostT = 3;
        this.turkey.lives = Math.min(3, this.turkey.lives + 1);
        this.sound.escaped();
      }
    }
    this.score += speed * dt / 10;
    particles.update(dt);
    this.spawnAmbientLeaves(dt);
    if (this.turkey.wx / 50 >= ESCAPE_METRES) { this.endRun('escaped'); return; }
    this.hazards.cull(this.turkey.wx);
    this.pickups.cull(this.turkey.wx);
  }

  spawnAmbientLeaves(dt) {
    this.leafTimer += dt;
    if (this.leafTimer < 0.06) return;
    this.leafTimer = 0;
    const kitchen = this.stage && this.stage.name === 'Kitchen';
    particles.spawn({
      x: this.camX + this.canvas.width + 40,
      y: Math.random() * 480,
      vx: -40 - Math.random() * 50,
      vy: 20 + Math.random() * 40,
      life: 2 + Math.random(),
      kind: 'leaf',
      rot: Math.random() * Math.PI * 2,
      color: kitchen ? '#e8842a' : LEAF_COLORS[Math.floor(Math.random() * LEAF_COLORS.length)]
    });
  }

  render() {
    drawWorld(this.ctx, this.camX, this.turkey.wx / 50, this.stage, this.time);
    particles.draw(this.ctx, this.camX);
    this.farmer.draw(this.ctx, this.turkey.x, this.turkey.wx, this.time);
    this.turkey.draw(this.ctx, this.time);
    this.hazards.draw(this.ctx, this.camX, this.time);
    this.pickups.draw(this.ctx, this.camX, this.time);
    if (this.state === 'playing' || this.state === 'paused') {
      drawHUD(this.ctx, this);
      if (this.state === 'paused') {
        this.ctx.fillStyle = 'rgba(0,0,0,0.45)';
        this.ctx.fillRect(0, 0, this.ctx.canvas.width, this.ctx.canvas.height);
        this.ctx.fillStyle = '#fff';
        this.ctx.font = 'bold 40px sans-serif';
        this.ctx.textAlign = 'center';
        this.ctx.fillText('PAUSED', this.ctx.canvas.width / 2, this.ctx.canvas.height / 2);
        this.ctx.textAlign = 'start';
      }
    } else if (this.state === 'title') drawTitleScreen(this.ctx, this);
    else if (this.state === 'end') drawEndScreen(this.ctx, this);
  }
}

function overlap(a, b) {
  return a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;
}
