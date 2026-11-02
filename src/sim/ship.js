// Pure simulation: no DOM, no canvas.

export const TURN_RATE = 3.5; // rad/s
export const ACCEL = 320; // px/s^2
export const DRAG = 0.7; // 1/s
export const MAX_SPEED = 420; // px/s

export function createShip(x = 0, y = 0) {
  return { x, y, vx: 0, vy: 0, angle: 0, thrust: false };
}

export function integrate(ship, input, dt) {
  if (input.isDown("ArrowLeft") || input.isDown("KeyA")) ship.angle -= TURN_RATE * dt;
  if (input.isDown("ArrowRight") || input.isDown("KeyD")) ship.angle += TURN_RATE * dt;

  ship.thrust = input.isDown("ArrowUp") || input.isDown("KeyW");
  if (ship.thrust) {
    ship.vx += Math.cos(ship.angle) * ACCEL * dt;
    ship.vy += Math.sin(ship.angle) * ACCEL * dt;
  }

  const k = Math.max(0, 1 - DRAG * dt);
  ship.vx *= k;
  ship.vy *= k;

  const speed = Math.hypot(ship.vx, ship.vy);
  if (speed > MAX_SPEED) {
    ship.vx *= MAX_SPEED / speed;
    ship.vy *= MAX_SPEED / speed;
  }

  ship.x += ship.vx * dt;
  ship.y += ship.vy * dt;
}
