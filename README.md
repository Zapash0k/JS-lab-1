# Dogfight — Lab 01: The Event Loop Is the Game Loop

A ship you fly on a canvas, driven by a fixed-timestep simulation (60 steps/s) and rendered with
interpolation on every display frame.

## Run

```bash
npm install
npm run dev      # open the printed URL (http://localhost:5173)
npm run lint
npm run build
```

Controls: `←` / `→` (or `A` / `D`) rotate, `↑` (or `W`) thrust.

## Structure

```txt
src/main.js           wires everything, experiment switches via URL
src/loop.js           createLoop({ step, simulate, render }) — rAF + clamped accumulator
src/input.js          createInput() — closure over key state (isDown, justPressed)
src/sim/ship.js       createShip, integrate(ship, input, dt) — pure, no DOM
src/sim/arena.js      wrap-around
src/render/canvas.js  DPR-aware, resizable canvas
src/render/draw.js    lerp/lerpAngle, background, ship, HUD
scripts/determinism.mjs   offline illustration of experiment 3
```

## Ship tuning

| Constant    | Value | Why                                                      |
| ----------- | ----- | -------------------------------------------------------- |
| `TURN_RATE` | 3.5   | ~0.6 turn/s: responsive without being twitchy            |
| `ACCEL`     | 320   | reaches useful speed in ~1.5 s                           |
| `DRAG`      | 0.7   | ship slowly glides to a stop instead of drifting forever |
| `MAX_SPEED` | 420   | stops the ship from crossing the arena in under 3 s      |

## Design notes

- **Loop**: `requestAnimationFrame` + accumulator; frame delta is clamped to 0.25 s so a long hitch
  never causes a spiral of death. `render` receives `alpha = accumulator / step`.
- **Interpolation**: `previous` and `current` ship states are copied each step; the renderer draws at
  `lerp(previous, current, alpha)`, angle via shortest-arc `lerpAngle`. When the ship wraps around the
  arena, interpolation on that axis is skipped to avoid a streak across the screen.
- **Input**: closure over two private `Set`s; `justPressed` stays true until `endStep()` (called after
  every simulation step).
- **Sim** has no DOM/canvas dependency and is a pure function of state + input + dt.

## Experiments (M4)

HUD shows steps/s, frames/s, frame time and jitter (σ of frame time over the last second).
Switches are URL parameters, so no code edits are needed:

| Experiment | URL                                           |
| ---------- | --------------------------------------------- |
| baseline   | `http://localhost:5173/`                      |
| 1 busy     | `http://localhost:5173/?busy=1`               |
| 2 interval | `http://localhost:5173/?loop=interval`        |
| 3 variable | `http://localhost:5173/?step=variable&auto=1` |
| 3 fixed    | `http://localhost:5173/?auto=1`               |

### Baseline

- Display refresh rate: **\___ Hz**
- steps/s: **\___**, frames/s: **\___**, frame time: **\___ ms**, jitter: **\___ ms**

### Experiment 1 — 100 ms busy-wait in `render` every 60th frame

- Player sees: the ship stutters / freezes for about a tenth of a second once per second.
- HUD: frame time spikes to **\___ ms** on the affected frame; fps dips to **\___**; steps/s stays
  at **\___** because the accumulator catches up with extra fixed steps after the block.
- Why it cannot be worked around: JavaScript runs to completion on one thread. While the
  busy-wait occupies the call stack, the event loop cannot take anything from the task queue,
  drain microtasks, run rAF callbacks or let the browser paint. Nothing on the same thread
  (timers, promises, other callbacks) can run until the function returns.

### Experiment 2 — `setInterval(frame, 16)` instead of rAF

10 s measurement (`?loop=interval`) vs baseline:

|               | rAF | setInterval(16) |
| ------------- | --- | --------------- |
| frames/s      | ___ | ___             |
| jitter σ (ms) | ___ | ___             |

Background tab for 5 s and back: ___ (rAF pauses entirely; timers keep running but are throttled
by the browser, and the clamped delta prevents a jump).

Differences: the timer is not aligned with the display refresh (16 ms ≠ 16.67 ms, so frames are
skipped or doubled and motion judders), it drifts, and it keeps firing in background tabs.

### Experiment 3 — variable timestep vs fixed timestep (CPU 6× throttle)

Position after 5 s of simulated time while holding thrust (`auto=1`, window _**×**_), read from the HUD
or console (`[auto] …`):

| Mode                               | CPU normal | CPU 6× throttle |
| ---------------------------------- | ---------- | --------------- |
| variable (`?step=variable&auto=1`) | x=___      | x=___           |
| fixed (`?auto=1`)                  | x=___      | x=___           |

Expected: variable positions differ between runs, fixed positions match.

Offline reproduction with the real sim code (`npm run determinism`, arena 1920×1080, 5 s of thrust,
different frame times):

```txt
VARIABLE timestep:  8.33 ms -> x=672.803   16.67 ms -> x=667.294   50 ms -> x=651.143   100 ms -> x=615.881
FIXED timestep:     all frame times -> x=666.876 (300 steps)
```

## Checklist

- [x] Vite project, `"type": "module"`, ESLint + Prettier, `.nvmrc`
- [x] `createLoop` with rAF + clamped accumulator; HUD shows steps/s, frames/s, frame time
- [x] `createInput` with `isDown` and `justPressed`
- [x] Pure `integrate`; wrap-around arena; no DOM in `sim/`
- [x] Interpolated rendering, angle lerp, DPR-aware resizable canvas
- [ ] Experiments 1–3 filled in with numbers/screenshots
- [ ] Git tag `lab-01`
