// Wrap-around arena. Returns true if the ship crossed an edge this call.
export function wrap(ship, width, height) {
  const x = ((ship.x % width) + width) % width;
  const y = ((ship.y % height) + height) % height;
  const wrapped = x !== ship.x || y !== ship.y;
  ship.x = x;
  ship.y = y;
  return wrapped;
}
