// Score explorer: shows, line by line, where each function's scores come from. All numbers
// are Ariadne's own output for these files (window.ARIADNE_DATA.samples).
(() => {
  const samples = window.ARIADNE_DATA && window.ARIADNE_DATA.samples;
  const codeEl = document.getElementById("code");
  if (!samples || !codeEl) return;

  const tabsEl = document.getElementById("lang-tabs");
  const fileEl = document.getElementById("code-file");
  const switchEl = document.getElementById("refactored-switch");
  const compareEl = document.getElementById("compare");
  const metersHeadEl = document.getElementById("meters-head");
  const metersEl = document.getElementById("meters");
  const tableEl = document.getElementById("fn-table");
  const verdictEl = document.getElementById("verdict");
  const playEl = document.getElementById("explore-play");
  const STEP_MS = 600;
  const BETWEEN_FUNCTIONS_MS = 700;
  const METRICS = [
    ["cyclomatic", "Cyclomatic", "cyc"],
    ["cognitive", "Cognitive", "cog"],
    ["length", "Length", "len"],
    ["parameters", "Parameters", "par"],
    ["nesting", "Nesting", "nest"],
  ];
  const KEYWORDS = {
    go: "break case const continue default defer else for func go if import interface map package range return struct switch type var",
    ts: "async await break case catch class const continue default else export extends for function if import in instanceof let new of return switch throw try type typeof while",
    js: "async await break case catch class const continue default else export extends for function if import in instanceof let new of return switch throw try typeof while",
    rust: "as break const continue else enum fn for if impl in let loop match mod move mut pub ref return self Self struct trait type use where while Ok Err Some None",
  };
  // Constructs that do not deepen nesting (metrics.md, Code smells: Nesting).
  const FLAT = (construct) => construct.endsWith("sequence") || construct === "case" || construct === "labeled jump";

  let lang = 0;
  let refactored = false;
  let active = 0;
  let run = 0;

  const reduced = () => window.noshio && window.noshio.reducedMotion();
  const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  const version = () => (refactored ? samples[lang].refactored : samples[lang].tangled);
  const fns = () => version().functions;
  const overLimit = (f) => METRICS.filter(([key]) => f[key] > f.limits[key]);

  const highlight = (line, key) => {
    const words = new Set(KEYWORDS[key].split(" "));
    const pattern = /(\/\/.*$)|("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)|(\b\d+\b)|([A-Za-z_][A-Za-z0-9_]*)/g;
    let out = "";
    let lastIndex = 0;
    for (const m of line.matchAll(pattern)) {
      out += escape(line.slice(lastIndex, m.index));
      if (m[1]) out += `<span class="tok-c">${escape(m[1])}</span>`;
      else if (m[2]) out += `<span class="tok-s">${escape(m[2])}</span>`;
      else if (m[3]) out += `<span class="tok-n">${m[3]}</span>`;
      else out += words.has(m[4]) ? `<span class="tok-k">${m[4]}</span>` : escape(m[4]);
      lastIndex = m.index + m[0].length;
    }
    return out + escape(line.slice(lastIndex));
  };

  // ---- Code: lines outside functions as they are, each function in its own framed block.

  // A badge shows what the construct adds to cognitive; one that adds only to cyclomatic
  // (a case) says so.
  const badgeText = (inc) =>
    inc.cognitive > 0 ? `${escape(inc.construct)} +${inc.cognitive}` : `${escape(inc.construct)} · cyc +${inc.cyclomatic}`;

  const lineRow = (n, text, key, incs, fnIndex) => {
    const row = document.createElement("div");
    row.className = "code-line";
    row.dataset.line = String(n);
    const badges = incs
      .map(
        (inc, k) =>
          `<span class="badge" data-fn="${fnIndex}" data-line="${n}" data-k="${k}" title="cognitive +${inc.cognitive} · cyclomatic +${inc.cyclomatic}">${badgeText(inc)}</span>`,
      )
      .join("");
    row.innerHTML = `<span class="ln">${n}</span><span class="src">${highlight(text, key) || " "}</span>${badges ? `<span class="inc">${badges}</span>` : ""}`;
    return row;
  };

  const scoreText = (f) => `cyc ${f.cyclomatic} · cog ${f.cognitive} · ${f.length} ${f.length === 1 ? "line" : "lines"}`;

  const renderCode = () => {
    const sample = samples[lang];
    const v = version();
    const lines = v.code.replace(/\n$/, "").split("\n");
    fileEl.textContent = sample.file;
    codeEl.innerHTML = "";
    const owner = new Map();
    v.functions.forEach((f, i) => {
      for (let n = f.span.start; n <= f.span.end; n++) owner.set(n, i);
    });
    let n = 1;
    while (n <= lines.length) {
      if (!owner.has(n)) {
        codeEl.appendChild(lineRow(n, lines[n - 1], sample.key, [], -1));
        n++;
        continue;
      }
      const i = owner.get(n);
      const f = v.functions[i];
      const block = document.createElement("div");
      block.className = "fn-block";
      block.dataset.fn = String(i);
      const head = document.createElement("button");
      head.type = "button";
      head.className = "fn-head";
      head.innerHTML = `<span class="fn-name">${escape(f.name)}</span><span class="fn-scores">${scoreText(f)} <span class="${f.pass ? "ok" : "no"}">${f.pass ? "✓" : "✗"}</span></span>`;
      head.addEventListener("click", () => select(i));
      block.appendChild(head);
      for (; n <= f.span.end; n++) {
        const incs = f.increments.filter((inc) => inc.line === n);
        block.appendChild(lineRow(n, lines[n - 1], sample.key, incs, i));
      }
      codeEl.appendChild(block);
    }
    layoutBadges();
  };

  // Gutter, block margins and padding around the widest line, in pixels.
  const CODE_CHROME_PX = 44 + 20 + 2 + 16;

  // The code area is at least as wide as its longest line (the panel scrolls sideways), and
  // badges that do not fit beside their line go on their own row under it.
  const layoutBadges = () => {
    codeEl.style.minWidth = "";
    const widest = Math.max(0, ...[...codeEl.querySelectorAll(".src")].map((src) => src.offsetWidth));
    codeEl.style.minWidth = `${widest + CODE_CHROME_PX}px`;
    codeEl.querySelectorAll(".code-line").forEach((row) => {
      const inc = row.querySelector(".inc");
      if (!inc) return;
      row.classList.remove("wrapped");
      const src = row.querySelector(".src");
      // On the same row the badges start right of the code; wrapped, they start left of its end.
      if (inc.offsetLeft < src.offsetLeft + src.offsetWidth) row.classList.add("wrapped");
    });
  };

  // ---- Scoreboard

  const renderCompare = () => {
    const before = samples[lang].tangled.functions;
    const after = samples[lang].refactored.functions;
    const max = (list) => Math.max(...list.map((f) => f.cognitive));
    const side = (label, list, current) => {
      const ok = list.every((f) => f.pass);
      const count = `${list.length} ${list.length === 1 ? "function" : "functions"}`;
      return `<div class="side ${current ? "current" : ""}">
        <span class="side-label">${label}</span>
        <strong class="${ok ? "ok" : "no"}">${ok ? "✓" : "✗"} ${count}</strong>
        <span class="muted">highest cognitive ${max(list)}</span>
      </div>`;
    };
    compareEl.innerHTML = side("Before", before, !refactored) + '<span class="arrow" aria-hidden="true">→</span>' + side("After", after, refactored);
  };

  const renderTable = () => {
    const head = `<thead><tr><th>Function</th>${METRICS.map(([, , short]) => `<th>${short}</th>`).join("")}<th></th></tr></thead>`;
    const rows = fns()
      .map(
        (f, i) => `<tr data-fn="${i}" tabindex="0" class="${i === active ? "active" : ""}">
          <td>${escape(f.name)}</td>
          ${METRICS.map(([key]) => `<td class="${f[key] > f.limits[key] ? "no" : ""}">${f[key]}</td>`).join("")}
          <td class="${f.pass ? "ok" : "no"}">${f.pass ? "✓" : "✗"}</td>
        </tr>`,
      )
      .join("");
    tableEl.innerHTML = head + `<tbody>${rows}</tbody>`;
    tableEl.querySelectorAll("tbody tr").forEach((tr) => {
      const go = () => {
        select(Number(tr.dataset.fn));
        const block = codeEl.querySelector(`.fn-block[data-fn="${tr.dataset.fn}"]`);
        if (block) block.scrollIntoView({ block: "nearest", behavior: reduced() ? "auto" : "smooth" });
      };
      tr.addEventListener("click", go);
      tr.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          go();
        }
      });
    });
  };

  const renderMeters = () => {
    const f = fns()[active];
    metersHeadEl.innerHTML = `<span>${escape(f.name)}</span><span class="${f.pass ? "ok" : "no"}">${f.pass ? "within limits" : "over a limit"}</span>`;
    metersEl.innerHTML = METRICS.map(
      ([key, label]) => `<div class="meter" data-metric="${key}">
        <div class="meter-top"><span>${label}</span><b><span class="val">0</span> <span class="muted">/ ${f.limits[key]}</span></b></div>
        <div class="meter-track"><div class="meter-fill"></div><div class="meter-limit"></div></div>
      </div>`,
    ).join("");
  };

  const setMeter = (key, value) => {
    const f = fns()[active];
    const limit = f.limits[key];
    const scale = Math.max(limit, f[key]) * 1.25;
    const meter = metersEl.querySelector(`[data-metric="${key}"]`);
    const over = value > limit;
    const val = meter.querySelector(".val");
    val.textContent = String(value);
    val.className = `val ${over ? "over" : value ? "under" : ""}`;
    const fill = meter.querySelector(".meter-fill");
    fill.style.width = `${(value / scale) * 100}%`;
    fill.classList.toggle("over", over);
    meter.querySelector(".meter-limit").style.left = `${(limit / scale) * 100}%`;
  };

  const fillMeters = () => {
    const f = fns()[active];
    METRICS.forEach(([key]) => setMeter(key, f[key]));
  };

  const renderVerdict = (counting) => {
    if (counting) {
      verdictEl.className = "verdict";
      verdictEl.textContent = "Counting…";
      return;
    }
    const list = fns();
    const failing = list.filter((f) => !f.pass);
    if (failing.length) {
      const f = failing[0];
      const over = overLimit(f).map(([key, label]) => `${label.toLowerCase()} ${f[key]} > ${f.limits[key]}`);
      verdictEl.className = "verdict fail";
      verdictEl.textContent = `✗ ${f.name}: ${over.join(", ")}. Ariadne blocks the turn.`;
    } else {
      verdictEl.className = "verdict pass";
      verdictEl.textContent =
        list.length > 1
          ? `✓ All ${list.length} functions within every limit. Same behavior, easier to read.`
          : `✓ ${list[0].name} is within every limit.`;
    }
  };

  const markActive = () => {
    codeEl.querySelectorAll(".fn-block").forEach((b) => b.classList.toggle("active", Number(b.dataset.fn) === active));
    tableEl.querySelectorAll("tbody tr").forEach((tr) => tr.classList.toggle("active", Number(tr.dataset.fn) === active));
  };

  const select = (i) => {
    run++;
    playEl.disabled = false;
    active = i;
    markActive();
    renderMeters();
    fillMeters();
    codeEl.querySelectorAll(".badge").forEach((b) => b.classList.add("on"));
    codeEl.querySelectorAll(".code-line.hot").forEach((r) => r.classList.remove("hot"));
    renderVerdict(false);
  };

  // ---- Playing the count, function after function

  const wait = (ms, token) =>
    new Promise((resolve, reject) => setTimeout(() => (token === run ? resolve() : reject(new Error("cancelled"))), ms));

  const countFunction = async (i, token) => {
    active = i;
    markActive();
    renderMeters();
    const f = fns()[i];
    const block = codeEl.querySelector(`.fn-block[data-fn="${i}"]`);
    if (block) block.scrollIntoView({ block: "nearest", behavior: "smooth" });
    let cyc = 1;
    let cog = 0;
    let deepest = 0;
    setMeter("cyclomatic", cyc);
    setMeter("cognitive", cog);
    setMeter("length", f.length);
    setMeter("parameters", f.parameters);
    setMeter("nesting", 0);
    const ordered = f.increments.map((inc, k) => ({ inc, k })).sort((a, b) => a.inc.line - b.inc.line || a.k - b.k);
    const seen = new Map();
    for (const { inc } of ordered) {
      await wait(STEP_MS, token);
      const k = seen.get(inc.line) || 0;
      seen.set(inc.line, k + 1);
      codeEl.querySelectorAll(".code-line.hot").forEach((r) => r.classList.remove("hot"));
      const row = block && block.querySelector(`.code-line[data-line="${inc.line}"]`);
      if (row) {
        row.classList.add("hot");
        row.scrollIntoView({ block: "nearest", behavior: "smooth" });
        const badge = row.querySelector(`.badge[data-k="${k}"]`);
        if (badge) badge.classList.add("on");
      }
      cyc += inc.cyclomatic;
      cog += inc.cognitive;
      if (!FLAT(inc.construct)) deepest = Math.max(deepest, inc.nesting + 1);
      setMeter("cyclomatic", cyc);
      setMeter("cognitive", cog);
      setMeter("nesting", Math.min(deepest, f.nesting));
    }
    await wait(STEP_MS, token);
    codeEl.querySelectorAll(".code-line.hot").forEach((r) => r.classList.remove("hot"));
    fillMeters();
  };

  const play = async () => {
    const token = ++run;
    if (reduced()) {
      select(active);
      return;
    }
    codeEl.querySelectorAll(".badge").forEach((b) => b.classList.remove("on"));
    renderVerdict(true);
    playEl.disabled = true;
    try {
      const list = fns();
      for (let i = 0; i < list.length; i++) {
        if (i > 0) await wait(BETWEEN_FUNCTIONS_MS, token);
        await countFunction(i, token);
      }
      const firstFailing = list.findIndex((f) => !f.pass);
      active = firstFailing >= 0 ? firstFailing : 0;
      markActive();
      renderMeters();
      fillMeters();
      renderVerdict(false);
    } catch {
      /* a newer run took over */
    } finally {
      if (token === run) playEl.disabled = false;
    }
  };

  // ---- Wiring

  const renderTabs = () => {
    tabsEl.innerHTML = "";
    samples.forEach((sample, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.role = "tab";
      b.textContent = sample.name;
      b.setAttribute("aria-selected", String(i === lang));
      b.addEventListener("click", () => {
        lang = i;
        renderAll();
      });
      tabsEl.appendChild(b);
    });
  };

  const renderAll = () => {
    run++;
    active = 0;
    renderTabs();
    renderCompare();
    renderTable();
    renderCode();
    select(0);
  };

  switchEl.addEventListener("change", () => {
    refactored = switchEl.checked;
    renderAll();
  });
  playEl.addEventListener("click", () => play());
  window.addEventListener("resize", () => layoutBadges());

  renderAll();
  if ("IntersectionObserver" in window && !reduced()) {
    const io = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          io.disconnect();
          play();
        }
      },
      { threshold: 0.4 },
    );
    io.observe(codeEl);
  }
})();
