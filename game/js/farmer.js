// farmer.js - the farmer who chases the turkey with a pitchfork.
export class Farmer {
  constructor() {
    this.reset();
  }

  reset() {
    this.gap = 260;
    this.runPhase = 0;
    this.swing = 0;
    this.caughtT = 0;
  }

  update(dt, turkeyWx, speed, difficulty, turkey) {
    const wanted = Math.max(70, 260 - difficulty * 24);
    if (this.gap > wanted) {
      this.gap -= 26 * dt;
    } else {
      this.gap += 18 * dt;
    }
    if (turkey && turkey.boostT > 0) {
      this.gap += 60 * dt;
    }
    this.runPhase += dt * 9;
    this.swing += dt;
    if (this.gap <= 40 && (!turkey || turkey.hurtT <= 0)) {
      this.caughtT = Date.now();
      return true;
    }
    return false;
  }

  draw(ctx, turkeyScreenX, turkeyWx, t) {
    const x = turkeyScreenX - this.gap;
    if (x < -160) return;

    const bob = Math.abs(Math.sin(this.runPhase)) * 4;
    const groundY = 500 + bob;
    const s = Math.sin(this.swing * 4) * 0.25 + 0.5;

    ctx.save();
    ctx.translate(x, groundY);

    // legs striding
    ctx.fillStyle = '#4a3524';
    ctx.lineWidth = 9;
    ctx.lineCap = 'round';
    const stride = Math.sin(this.runPhase) * 12;
    ctx.beginPath();
    ctx.moveTo(-10 + stride, 0);
    ctx.lineTo(-10 + stride, 52);
    ctx.stroke();
    ctx.beginPath();
    ctx.moveTo(10 - stride, 0);
    ctx.lineTo(10 - stride, 52);
    ctx.stroke();

    // overalls
    ctx.fillStyle = '#4a6fa5';
    if (ctx.roundRect) {
      ctx.roundRect(-18, -50, 36, 50, 6);
    } else {
      ctx.beginPath();
      ctx.moveTo(-18, -44);
      ctx.lineTo(-18, 0);
      ctx.arcTo(-18, 6, -12, 6, 6);
      ctx.lineTo(12, 6);
      ctx.arcTo(18, 6, 18, 0, 6);
      ctx.lineTo(18, -44);
      ctx.closePath();
    }
    ctx.fill();

    // red shirt top strip
    ctx.fillStyle = '#c94a3a';
    ctx.fillRect(-18, -60, 36, 10);

    // head
    ctx.fillStyle = '#e8b48c';
    ctx.beginPath();
    ctx.arc(0, -76, 14, 0, Math.PI * 2);
    ctx.fill();

    // angry eye
    ctx.fillStyle = '#222';
    ctx.fillRect(3, -79, 5, 3);

    // grey beard arc
    ctx.strokeStyle = '#8a8a8a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, -62, 10, 0, Math.PI);
    ctx.stroke();

    // straw hat brim ellipse
    ctx.fillStyle = '#d8b25a';
    ctx.beginPath();
    ctx.ellipse(0, -76, 13, 4, 0, 0, Math.PI * 2);
    ctx.fill();
    // crown
    ctx.fillRect(-7, -90, 14, 9);

    // pitchfork
    ctx.save();
    ctx.translate(16, -30);
    ctx.rotate((s - 0.5) * 1.0);
    ctx.strokeStyle = '#6b4a2c';
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 56);
    ctx.stroke();
    ctx.strokeStyle = '#b0b0b0';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(-7, 56);
    ctx.lineTo(-7, 67);
    ctx.moveTo(0, 56);
    ctx.lineTo(0, 67);
    ctx.moveTo(7, 56);
    ctx.lineTo(7, 67);
    ctx.stroke();
    ctx.restore();

    // speech bubble
    if ((t % 6000) < 1000) {
      const bx = -26;
      const by = -118;
      const bw = 52;
      const bh = 20;
      ctx.fillStyle = '#fff';
      if (ctx.roundRect) {
        ctx.roundRect(bx, by, bw, bh, 6);
      } else {
        ctx.beginPath();
        ctx.moveTo(bx + 6, by);
        ctx.lineTo(bx + bw - 6, by);
        ctx.arcTo(bx + bw, by, bx + bw, by + 6, 6);
        ctx.lineTo(bx + bw, by + bh - 6);
        ctx.arcTo(bx + bw, by + bh, bx + bw - 6, by + bh, 6);
        ctx.lineTo(bx + 6, by + bh);
        ctx.arcTo(bx, by + bh, bx, by + bh - 6, 6);
        ctx.lineTo(bx, by + 6);
        ctx.arcTo(bx, by, bx + 6, by, 6);
      }
      ctx.fill();
      ctx.fillStyle = '#222';
      ctx.font = 'bold 15px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('YOOOU!', bx + bw / 2, by + bh / 2 + 1);
    }

    ctx.restore();
  }
}
