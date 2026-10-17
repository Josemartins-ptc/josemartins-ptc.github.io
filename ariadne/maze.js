// The hero labyrinth: a fixed maze whose golden thread runs from the entrance to the
// spot under the pointer (or to the exit), winding and unwinding like a real thread.
(() => {
  const box = document.getElementById("maze");
  if (!box) return;

  const COLS = 15;
  const ROWS = 11;
  const CELL = 20;
  const PAD = 14;
  const SEED = 63; // a route of 37 cells that crosses the whole maze
  const STEP_MS = 26; // one cell of thread
  const SVG_NS = "http://www.w3.org/2000/svg";
  const W = COLS * CELL + PAD * 2;
  const H = ROWS * CELL + PAD * 2;
  const ENTRANCE = 0;
  const EXIT = ROWS * COLS - 1;

  // Deterministic random numbers: the same maze for every visitor.
  const random = ((seed) => () => {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  })(SEED);

  const id = (r, c) => r * COLS + c;
  const rc = (i) => [Math.floor(i / COLS), i % COLS];
  const open = Array.from({ length: ROWS * COLS }, () => new Set());

  // Carve with a depth-first walk: every cell reachable by exactly one path.
  (() => {
    const seen = new Set([ENTRANCE]);
    const stack = [ENTRANCE];
    while (stack.length) {
      const cur = stack[stack.length - 1];
      const [r, c] = rc(cur);
      const next = [
        [r - 1, c],
        [r + 1, c],
        [r, c - 1],
        [r, c + 1],
      ].filter(([nr, nc]) => nr >= 0 && nr < ROWS && nc >= 0 && nc < COLS && !seen.has(id(nr, nc)));
      if (!next.length) {
        stack.pop();
        continue;
      }
      const [nr, nc] = next[Math.floor(random() * next.length)];
      const n = id(nr, nc);
      open[cur].add(n);
      open[n].add(cur);
      seen.add(n);
      stack.push(n);
    }
  })();

  // Parent of each cell on the way back to the entrance.
  const parent = new Array(ROWS * COLS).fill(-1);
  (() => {
    const queue = [ENTRANCE];
    const seen = new Set([ENTRANCE]);
    while (queue.length) {
      const cur = queue.shift();
      for (const n of open[cur]) {
        if (!seen.has(n)) {
          seen.add(n);
          parent[n] = cur;
          queue.push(n);
        }
      }
    }
  })();

  const pathTo = (cell) => {
    const path = [];
    for (let cur = cell; cur !== -1; cur = parent[cur]) path.push(cur);
    return path.reverse();
  };

  // Walls: draw each cell's closed north and west sides, plus the outer south/east.
  const walls = [];
  for (let r = 0; r < ROWS; r++) {
    for (let c = 0; c < COLS; c++) {
      const x = PAD + c * CELL;
      const y = PAD + r * CELL;
      const i = id(r, c);
      if (r === 0 || !open[i].has(id(r - 1, c))) walls.push(`M${x} ${y}h${CELL}`);
      if (c === 0 ? i !== ENTRANCE : !open[i].has(id(r, c - 1))) walls.push(`M${x} ${y}v${CELL}`);
      if (r === ROWS - 1) walls.push(`M${x} ${y + CELL}h${CELL}`);
      if (c === COLS - 1 && i !== EXIT) walls.push(`M${x + CELL} ${y}v${CELL}`);
    }
  }

  const svg = document.createElementNS(SVG_NS, "svg");
  svg.setAttribute("viewBox", `0 0 ${W} ${H}`);
  svg.setAttribute("aria-hidden", "true");
  const make = (tag, attrs) => {
    const el = document.createElementNS(SVG_NS, tag);
    Object.entries(attrs).forEach(([k, v]) => el.setAttribute(k, v));
    svg.appendChild(el);
    return el;
  };
  make("path", { class: "maze-walls", d: walls.join("") });
  const ring = make("circle", { class: "maze-target", r: 7, cx: -50, cy: -50 });
  const thread = make("path", { class: "maze-thread", d: "" });
  const head = make("circle", { class: "maze-head", r: 4.5, cx: -50, cy: -50 });
  box.prepend(svg);

  const centre = (cell) => {
    const [r, c] = rc(cell);
    return [PAD + c * CELL + CELL / 2, PAD + r * CELL + CELL / 2];
  };
  const START = [PAD - CELL * 0.7, PAD + CELL / 2];
  const OUT = [W - PAD + CELL * 0.7, PAD + (ROWS - 1) * CELL + CELL / 2];

  let shown = []; // cells the thread currently covers
  let goal = pathTo(EXIT);
  let toExit = true;
  let acc = 0;
  let last = 0;
  let running = false;

  const render = (fraction) => {
    const points = [START, ...shown.map(centre)];
    let tip = points[points.length - 1];
    const sharesPrefix = shown.every((cell, k) => goal[k] === cell);
    if (fraction > 0 && sharesPrefix && shown.length < goal.length) {
      const [x2, y2] = centre(goal[shown.length]);
      tip = [tip[0] + (x2 - tip[0]) * fraction, tip[1] + (y2 - tip[1]) * fraction];
      points.push(tip);
    } else if (fraction > 0 && !sharesPrefix && shown.length > 1) {
      const [x1, y1] = centre(shown[shown.length - 2]);
      points[points.length - 1] = tip = [tip[0] + (x1 - tip[0]) * fraction, tip[1] + (y1 - tip[1]) * fraction];
    }
    const done = shown.length === goal.length && sharesPrefix;
    if (done && toExit) points.push(OUT);
    thread.setAttribute("d", "M" + points.map((p) => `${p[0].toFixed(1)} ${p[1].toFixed(1)}`).join(" L"));
    const end = points[points.length - 1];
    head.setAttribute("cx", end[0]);
    head.setAttribute("cy", end[1]);
  };

  const stepOnce = () => {
    const sharesPrefix = shown.every((cell, k) => goal[k] === cell);
    if (!sharesPrefix) shown.pop();
    else if (shown.length < goal.length) shown.push(goal[shown.length]);
  };

  const settled = () => shown.length === goal.length && shown.every((cell, k) => goal[k] === cell);

  const tick = (now) => {
    const dt = last ? Math.min(now - last, 80) : 16;
    last = now;
    acc += dt;
    while (acc >= STEP_MS && !settled()) {
      acc -= STEP_MS;
      stepOnce();
    }
    if (settled()) {
      acc = 0;
      render(0);
      running = false;
      last = 0;
      return;
    }
    render(acc / STEP_MS);
    requestAnimationFrame(tick);
  };

  const reduced = () => window.noshio && window.noshio.reducedMotion();
  const start = () => {
    if (reduced()) {
      shown = goal.slice();
      render(0);
      return;
    }
    if (!running && visible) {
      running = true;
      requestAnimationFrame(tick);
    }
  };

  const aim = (cell, exit) => {
    toExit = exit;
    goal = pathTo(cell);
    if (exit) {
      ring.setAttribute("cx", -50);
    } else {
      const [x, y] = centre(cell);
      ring.setAttribute("cx", x);
      ring.setAttribute("cy", y);
    }
    start();
  };

  const cellAt = (event) => {
    const rect = svg.getBoundingClientRect();
    const x = ((event.clientX - rect.left) / rect.width) * W - PAD;
    const y = ((event.clientY - rect.top) / rect.height) * H - PAD;
    const c = Math.min(COLS - 1, Math.max(0, Math.floor(x / CELL)));
    const r = Math.min(ROWS - 1, Math.max(0, Math.floor(y / CELL)));
    return id(r, c);
  };

  let pointed = -1;
  box.addEventListener("pointermove", (event) => {
    const cell = cellAt(event);
    if (cell === pointed) return;
    pointed = cell;
    aim(cell, cell === EXIT);
  });
  box.addEventListener("pointerleave", () => {
    pointed = -1;
    aim(EXIT, true);
  });

  // Keyboard: arrows move the target, Escape sends the thread to the exit.
  let keyCell = EXIT;
  box.addEventListener("keydown", (event) => {
    const moves = { ArrowUp: [-1, 0], ArrowDown: [1, 0], ArrowLeft: [0, -1], ArrowRight: [0, 1] };
    if (event.key === "Escape") {
      keyCell = EXIT;
      aim(EXIT, true);
      return;
    }
    const move = moves[event.key];
    if (!move) return;
    event.preventDefault();
    const [r, c] = rc(keyCell);
    const nr = Math.min(ROWS - 1, Math.max(0, r + move[0]));
    const nc = Math.min(COLS - 1, Math.max(0, c + move[1]));
    keyCell = id(nr, nc);
    aim(keyCell, keyCell === EXIT);
  });

  // Only animate while on screen.
  let visible = true;
  if ("IntersectionObserver" in window) {
    new IntersectionObserver((entries) => {
      visible = entries[0].isIntersecting;
      if (visible) start();
    }).observe(box);
  }

  render(0);
  setTimeout(start, reduced() ? 0 : 500);
})();
