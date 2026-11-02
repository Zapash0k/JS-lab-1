export const lerp = (a, b, t) => a + (b - a) * t;

// Shortest-arc interpolation, safe across the ±PI seam and for unbounded angles.
export function lerpAngle(a, b, t) {
  const TAU = Math.PI * 2;
  const d = ((((b - a + Math.PI) % TAU) + TAU) % TAU) - Math.PI;
  return a + d * t;
}

export function makeStars(count, w, h) {
  let seed = 12345;
  const rnd = () => {
    seed = (seed * 1664525 + 1013904223) >>> 0;
    return seed / 4294967296;
  };
  return Array.from({ length: count }, () => ({
    x: rnd() * w,
    y: rnd() * h,
    r: rnd() * 1.4 + 0.3,
    a: rnd() * 0.6 + 0.3,
  }));
}

export function drawBackground(ctx, w, h, stars) {
  ctx.fillStyle = "#05060a";
  ctx.fillRect(0, 0, w, h);

  ctx.strokeStyle = "rgba(80, 110, 160, 0.12)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  for (let x = 0; x <= w; x += 80) {
    ctx.moveTo(x + 0.5, 0);
    ctx.lineTo(x + 0.5, h);
  }
  for (let y = 0; y <= h; y += 80) {
    ctx.moveTo(0, y + 0.5);
    ctx.lineTo(w, y + 0.5);
  }
  ctx.stroke();

  for (const s of stars) {
    ctx.fillStyle = `rgba(255,255,255,${s.a})`;
    ctx.beginPath();
    ctx.arc((s.x / 1) % w, (s.y / 1) % h, s.r, 0, Math.PI * 2);
    ctx.fill();
  }
}

// The ship is drawn at the origin pointing right (+x); the canvas is moved/rotated.
export function drawShip(ctx, { x, y, angle, thrust }) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(angle);

  if (thrust) {
    ctx.fillStyle = "#ff9d2e";
    ctx.beginPath();
    ctx.moveTo(-10, -5);
    ctx.lineTo(-10 - 12 - Math.random() * 10, 0);
    ctx.lineTo(-10, 5);
    ctx.closePath();
    ctx.fill();
  }

  ctx.fillStyle = "#e8f1ff";
  ctx.strokeStyle = "#6aa8ff";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(16, 0);
  ctx.lineTo(-12, -9);
  ctx.lineTo(-7, 0);
  ctx.lineTo(-12, 9);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

export function drawHud(ctx, stats, extra = []) {
  const lines = [
    `steps/s: ${stats.stepsPerSec}`,
    `frames/s: ${stats.fps}`,
    `frame time: ${stats.frameMs.toFixed(1)} ms`,
    `jitter (σ): ${stats.jitterMs.toFixed(2)} ms`,
    `loop: ${stats.mode}, ${stats.fixed ? "fixed" : "variable"} step`,
    ...extra,
  ];
  ctx.save();
  ctx.font = "14px ui-monospace, Consolas, monospace";
  ctx.textBaseline = "top";
  ctx.fillStyle = "rgba(0,0,0,0.5)";
  ctx.fillRect(8, 8, 330, lines.length * 20 + 12);
  ctx.fillStyle = "#9dffb0";
  lines.forEach((line, i) => ctx.fillText(line, 16, 14 + i * 20));
  ctx.restore();
}
