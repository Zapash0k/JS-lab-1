import { createLoop } from "./loop.js";
import { createInput } from "./input.js";
import { createShip, integrate } from "./sim/ship.js";
import { wrap } from "./sim/arena.js";
import { setupCanvas } from "./render/canvas.js";
import { drawBackground, drawHud, drawShip, lerp, lerpAngle, makeStars } from "./render/draw.js";

// Experiment switches (Lab 01, M4), set through the URL:
//   ?busy=1           experiment 1: 100 ms busy-wait in render every 60th frame
//   ?loop=interval    experiment 2: setInterval(frame, 16) instead of requestAnimationFrame
//   ?step=variable    experiment 3: no accumulator, simulate(dt) once per frame
//   ?auto=1           hold "thrust" automatically and report position after 5 s of sim time
const params = new URLSearchParams(location.search);
const busy = params.has("busy");
const mode = params.get("loop") === "interval" ? "interval" : "raf";
const fixed = params.get("step") !== "variable";
const auto = params.has("auto");

const canvas = document.getElementById("game");
const { ctx, size } = setupCanvas(canvas);

const realInput = createInput(window);
const input = auto
  ? { isDown: (code) => code === "ArrowUp", justPressed: () => false, endStep() {} }
  : realInput;

let current = createShip(size.w / 2, size.h / 2);
let previous = { ...current };
let stars = makeStars(140, size.w, size.h);
window.addEventListener("resize", () => {
  stars = makeStars(140, size.w, size.h);
});

let autoResult = null;
let frameCounter = 0;

const loop = createLoop({
  mode,
  fixed,
  simulate(dt) {
    previous = { ...current };
    integrate(current, input, dt);
    wrap(current, size.w, size.h);
    input.endStep();

    if (auto && autoResult === null && loop.stats.simTime + dt >= 5 - 1e-6) {
      autoResult = `x=${current.x.toFixed(3)} y=${current.y.toFixed(3)}`;
      console.log(
        `[auto] ${fixed ? "fixed" : "variable"} step, ${mode}: after ~5 s sim time -> ${autoResult}`,
      );
    }
  },
  render(alpha, stats) {
    frameCounter++;
    if (busy && frameCounter % 60 === 0) {
      const t = performance.now();
      while (performance.now() < t + 100) {
        // deliberate synchronous block (experiment 1)
      }
    }

    // Interpolate between the last two simulation states.
    // Skip an axis when the ship wrapped around the arena (would streak across the screen).
    const wrappedX = Math.abs(current.x - previous.x) > size.w / 2;
    const wrappedY = Math.abs(current.y - previous.y) > size.h / 2;
    const drawn = {
      x: wrappedX ? current.x : lerp(previous.x, current.x, alpha),
      y: wrappedY ? current.y : lerp(previous.y, current.y, alpha),
      angle: lerpAngle(previous.angle, current.angle, alpha),
      thrust: current.thrust,
    };

    drawBackground(ctx, size.w, size.h, stars);
    drawShip(ctx, drawn);
    drawHud(ctx, stats, [
      `pos: ${current.x.toFixed(1)}, ${current.y.toFixed(1)}`,
      ...(auto ? [`auto @5s: ${autoResult ?? "running..."}`] : []),
    ]);
  },
});

loop.start();
