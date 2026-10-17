// "Watch a turn": replays a recorded Claude Code session with Ariadne. Every message comes
// from window.ARIADNE_DATA.turn, which holds the recorded text verbatim.
(() => {
  const term = document.getElementById("term");
  const data = window.ARIADNE_DATA && window.ARIADNE_DATA.turn;
  if (!term || !data) return;

  const toggle = document.getElementById("demo-toggle");
  const replay = document.getElementById("demo-replay");
  const steps = [...document.querySelectorAll("#demo-steps .chip")];
  const PROMPT = "Create cart.go in package shop with exactly this function, then finish the task.";
  const HOOK = "PostToolUse:Write hook blocking error";

  let run = 0;
  let paused = false;
  let started = false;

  const reduced = () => window.noshio && window.noshio.reducedMotion();

  const wait = async (ms, token) => {
    let left = ms;
    while (left > 0) {
      if (token !== run) throw new Error("cancelled");
      const slice = Math.min(left, 40);
      await new Promise((resolve) => setTimeout(resolve, slice));
      if (!paused) left -= slice;
    }
    if (token !== run) throw new Error("cancelled");
  };

  const add = (className, text = "") => {
    const el = document.createElement("div");
    el.className = className;
    el.textContent = text;
    term.appendChild(el);
    term.scrollTop = term.scrollHeight;
    return el;
  };

  const mark = (index) => steps.forEach((chip, i) => chip.classList.toggle("active", i <= index));

  const typeText = async (el, text, token, perChar) => {
    const caret = document.createElement("span");
    caret.className = "caret";
    for (let i = 1; i <= text.length; i++) {
      el.textContent = text.slice(0, i);
      el.appendChild(caret);
      await wait(perChar, token);
    }
    caret.remove();
  };

  const streamLines = async (el, text, token, perLine) => {
    const lines = text.replace(/\n$/, "").split("\n");
    for (let i = 0; i < lines.length; i++) {
      el.textContent = lines.slice(0, i + 1).join("\n");
      term.scrollTop = term.scrollHeight;
      await wait(perLine, token);
    }
  };

  const showAll = () => {
    term.textContent = "";
    add("term-line term-user", PROMPT);
    add("term-line term-tool", "Write(cart.go)");
    add("term-code", data.tangled.trimEnd());
    const block = add("term-block");
    const hook = document.createElement("span");
    hook.className = "hook";
    hook.textContent = HOOK;
    block.append(hook, data.block);
    add("term-line term-claude", data.quote);
    add("term-line term-tool", "Write(cart.go)");
    add("term-code", data.refactored.trimEnd());
    add("term-line term-status", data.status);
    mark(3);
    term.scrollTop = 0;
  };

  const play = async () => {
    const token = ++run;
    started = true;
    paused = false;
    toggle.textContent = "Pause";
    term.textContent = "";
    mark(-1);
    if (reduced()) {
      showAll();
      return;
    }
    try {
      mark(0);
      await typeText(add("term-line term-user"), PROMPT, token, 18);
      await wait(500, token);
      add("term-line term-tool", "Write(cart.go)");
      await wait(300, token);
      await streamLines(add("term-code"), data.tangled, token, 45);
      await wait(700, token);

      mark(1);
      const block = add("term-block");
      const hook = document.createElement("span");
      hook.className = "hook";
      hook.textContent = HOOK;
      const body = document.createElement("span");
      block.append(hook, body);
      for (const line of data.block.split("\n")) {
        body.textContent += (body.textContent ? "\n" : "") + line;
        term.scrollTop = term.scrollHeight;
        await wait(line.trim() ? 110 : 60, token);
      }
      await wait(1400, token);

      mark(2);
      await typeText(add("term-line term-claude"), data.quote, token, 16);
      await wait(500, token);
      add("term-line term-tool", "Write(cart.go)");
      await wait(300, token);
      await streamLines(add("term-code"), data.refactored, token, 40);
      await wait(900, token);

      mark(3);
      await typeText(add("term-line term-status"), data.status, token, 22);
      toggle.textContent = "Pause";
    } catch {
      /* replaced by a newer run */
    }
  };

  toggle.addEventListener("click", () => {
    if (!started) {
      play();
      return;
    }
    paused = !paused;
    toggle.textContent = paused ? "Resume" : "Pause";
  });
  replay.addEventListener("click", play);

  if ("IntersectionObserver" in window && !reduced()) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !started) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.35 },
    );
    io.observe(term);
  } else {
    showAll();
    started = true;
  }
})();
