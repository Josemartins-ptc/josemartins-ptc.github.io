// Ariadne — the "Measured" section: results of dev-docs/eval (2026-10-18), medians per arm.
(() => {
  const RESULTS = {
    opus: {
      label: "Claude Opus",
      tasks: [
        ["Go · price quote", 28, 10], ["Go · log stats", 18, 10], ["TypeScript · signup form", 20, 8],
        ["TypeScript · order states", 18, 3], ["JavaScript · Markdown", 16, 9], ["Rust · config parser", 21, 11],
      ],
      after: { without: [18.5, 21], with: [9.5, 10], overWithout: 18, overWith: 5 },
      tokens: { without: 163, with: 165 },
      tokensText: "About the same. Opus mostly wrote small functions from the start, so Ariadne rarely had to step in (3 of 18 runs).",
    },
    sonnet: {
      label: "Claude Sonnet",
      tasks: [
        ["Go · price quote", 28, 12], ["Go · log stats", 27, 10], ["TypeScript · signup form", 36, 9],
        ["TypeScript · order states", 18, 8], ["JavaScript · Markdown", 17, 7], ["Rust · config parser", 26, 9],
      ],
      after: { without: [26.5, 28.5], with: [9, 10], overWithout: 18, overWith: 8 },
      tokens: { without: 104, with: 195 },
      tokensText: "About twice as many. Sonnet usually wrote one long function first; Ariadne sent it back to split it (16 of 18 runs), and that takes extra turns.",
    },
  };
  const ORDER = ["opus", "sonnet"];
  const tabs = document.getElementById("m-model");
  if (!tabs) return;

  function bar(cls, value, max, text) {
    return `<span class="m-bar ${cls}" style="--w:${(value / max) * 100}%"><b>${text}</b></span>`;
  }

  function renderTasks(r) {
    const max = Math.max(...r.tasks.map((t) => t[1]));
    document.getElementById("m-tasks").innerHTML = r.tasks.map(([name, without, withA]) =>
      `<div class="m-row"><span class="m-label">${name}</span><span class="m-pair">` +
      bar("m-without", without, max, without) + bar("m-with", withA, max, withA) + `</span></div>`).join("");
  }

  function slope(name, cls, [before, after], max) {
    const y = (v) => 8 + (1 - v / max) * 84;
    return `<g class="${cls}"><line x1="20" y1="${y(before)}" x2="180" y2="${y(after)}"/>` +
      `<circle cx="20" cy="${y(before)}" r="4"/><circle cx="180" cy="${y(after)}" r="4"/>` +
      `<text x="14" y="${y(before) + 4}" text-anchor="end">${before}</text>` +
      `<text x="186" y="${y(after) + 4}">${after} · ${name}</text></g>`;
  }

  function renderAfter(r) {
    const a = r.after;
    const max = Math.max(...a.without, ...a.with) * 1.1;
    document.getElementById("m-after").innerHTML =
      `<svg viewBox="-24 0 360 110" role="img" aria-label="Worst function before and after a later change">` +
      `<text class="m-axis" x="20" y="108" text-anchor="middle">before</text>` +
      `<text class="m-axis" x="180" y="108" text-anchor="middle">after</text>` +
      slope("started without", "m-without", a.without, max) + slope("started with Ariadne", "m-with", a.with, max) + `</svg>`;
    document.getElementById("m-after-text").innerHTML =
      `Claude follows the code it finds: complex functions got more complex, simple ones stayed simple. After the change, <strong>${a.overWithout} of 18</strong> results that started without Ariadne had a function over complexity 10, against <strong>${a.overWith} of 18</strong> that started with it.`;
  }

  function renderTokens(r) {
    const t = r.tokens;
    const max = Math.max(t.without, t.with);
    document.getElementById("m-tokens").innerHTML =
      `<div class="m-row"><span class="m-label">without Ariadne</span><span class="m-pair">${bar("m-without", t.without, max, t.without + "k")}</span></div>` +
      `<div class="m-row"><span class="m-label">with Ariadne</span><span class="m-pair">${bar("m-with", t.with, max, t.with + "k")}</span></div>`;
    document.getElementById("m-tokens-text").textContent = r.tokensText;
  }

  function select(key) {
    tabs.querySelectorAll("button").forEach((b) => b.setAttribute("aria-selected", String(b.dataset.key === key)));
    const r = RESULTS[key];
    renderTasks(r);
    renderAfter(r);
    renderTokens(r);
  }

  tabs.innerHTML = ORDER.map((k) => `<button type="button" role="tab" data-key="${k}">${RESULTS[k].label}</button>`).join("");
  tabs.addEventListener("click", (e) => {
    const b = e.target.closest("button");
    if (b) select(b.dataset.key);
  });
  select("opus");
})();
