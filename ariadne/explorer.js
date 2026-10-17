// Score explorer: shows, line by line, where a function's scores come from. All numbers
// are Ariadne's own output for these files (window.ARIADNE_DATA.samples).
(() => {
  const samples = window.ARIADNE_DATA && window.ARIADNE_DATA.samples;
  const codeEl = document.getElementById("code");
  if (!samples || !codeEl) return;

  const tabsEl = document.getElementById("lang-tabs");
  const fileEl = document.getElementById("code-file");
  const switchEl = document.getElementById("refactored-switch");
  const fnListEl = document.getElementById("fn-list");
  const metersEl = document.getElementById("meters");
  const verdictEl = document.getElementById("verdict");
  const playEl = document.getElementById("explore-play");
  const STEP_MS = 650;
  const METRICS = [
    ["cyclomatic", "Cyclomatic"],
    ["cognitive", "Cognitive"],
    ["length", "Length"],
    ["parameters", "Parameters"],
    ["nesting", "Nesting"],
  ];
  const KEYWORDS = {
    go: "break case const continue default defer else for func go if import interface map package range return struct switch type var",
    ts: "async await break case catch class const continue default else export extends for function if import in instanceof let new of return switch throw try type typeof while",
    js: "async await break case catch class const continue default else export extends for function if import in instanceof let new of return switch throw try typeof while",
    rust: "as break const continue else enum fn for if impl in let loop match mod move mut pub ref return self Self struct trait type use where while Ok Err Some None",
  };

  let lang = 0;
  let refactored = false;
  let fnIndex = 0;
  let run = 0;

  const reduced = () => window.noshio && window.noshio.reducedMotion();
  const escape = (s) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

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

  const version = () => (refactored ? samples[lang].refactored : samples[lang].tangled);
  const fn = () => version().functions[fnIndex];

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
        fnIndex = 0;
        renderAll(false);
      });
      tabsEl.appendChild(b);
    });
  };

  const renderCode = () => {
    const sample = samples[lang];
    const v = version();
    const f = fn();
    fileEl.textContent = sample.file;
    const byLine = new Map();
    f.increments.forEach((inc) => {
      if (!byLine.has(inc.line)) byLine.set(inc.line, []);
      byLine.get(inc.line).push(inc);
    });
    codeEl.innerHTML = "";
    v.code.replace(/\n$/, "").split("\n").forEach((text, i) => {
      const n = i + 1;
      const row = document.createElement("div");
      row.className = "code-line";
      row.dataset.line = String(n);
      if (v.functions.length > 1 && (n < f.span.start || n > f.span.end)) row.classList.add("dim");
      const incs = (byLine.get(n) || [])
        .map(
          (inc, k) =>
            `<span class="badge" data-line="${n}" data-k="${k}" title="cognitive +${inc.cognitive} · cyclomatic +${inc.cyclomatic}">${escape(inc.construct)} +${inc.cognitive}</span>`,
        )
        .join("");
      row.innerHTML = `<span class="ln">${n}</span><span class="src">${highlight(text, sample.key) || " "}</span><span class="inc">${incs}</span>`;
      codeEl.appendChild(row);
    });
  };

  const renderFns = () => {
    const v = version();
    fnListEl.innerHTML = "";
    v.functions.forEach((f, i) => {
      const b = document.createElement("button");
      b.type = "button";
      b.setAttribute("aria-pressed", String(i === fnIndex));
      b.innerHTML = `${escape(f.name)} <span class="${f.pass ? "ok" : "no"}">${f.pass ? "✓" : "✗"}</span>`;
      b.addEventListener("click", () => {
        fnIndex = i;
        renderAll(false);
      });
      fnListEl.appendChild(b);
    });
  };

  const meterHtml = () =>
    METRICS.map(
      ([key, label]) => `<div class="meter" data-metric="${key}">
        <div class="meter-top"><span>${label}</span><b><span class="val">0</span> <span class="muted">/ ${fn().limits[key]}</span></b></div>
        <div class="meter-track"><div class="meter-fill"></div><div class="meter-limit"></div></div>
      </div>`,
    ).join("");

  const setMeter = (key, value) => {
    const f = fn();
    const limit = f.limits[key];
    const scale = Math.max(limit, f[key]) * 1.25;
    const meter = metersEl.querySelector(`[data-metric="${key}"]`);
    meter.querySelector(".val").textContent = String(value);
    const over = value > limit;
    meter.querySelector(".val").className = `val ${over ? "over" : value ? "under" : ""}`;
    const fill = meter.querySelector(".meter-fill");
    fill.style.width = `${(value / scale) * 100}%`;
    fill.classList.toggle("over", over);
    meter.querySelector(".meter-limit").style.left = `${(limit / scale) * 100}%`;
  };

  const renderVerdict = (final) => {
    const f = fn();
    const v = version();
    if (!final) {
      verdictEl.className = "verdict";
      verdictEl.textContent = "Counting…";
      return;
    }
    const over = METRICS.filter(([key]) => f[key] > f.limits[key]).map(([key, label]) => `${label.toLowerCase()} ${f[key]} > ${f.limits[key]}`);
    if (over.length) {
      verdictEl.className = "verdict fail";
      verdictEl.textContent = `✗ ${f.name}: ${over.join(", ")}. Ariadne blocks the turn.`;
    } else if (v.functions.length > 1) {
      const all = v.functions.every((x) => x.pass);
      verdictEl.className = `verdict ${all ? "pass" : "fail"}`;
      verdictEl.textContent = all
        ? `✓ All ${v.functions.length} functions within limits. Same behavior, easier to read.`
        : `✗ Some functions are over a limit.`;
    } else {
      verdictEl.className = "verdict pass";
      verdictEl.textContent = `✓ ${f.name} is within every limit.`;
    }
  };

  const showFinal = () => {
    const f = fn();
    METRICS.forEach(([key]) => setMeter(key, f[key]));
    codeEl.querySelectorAll(".badge").forEach((b) => b.classList.add("on"));
    renderVerdict(true);
  };

  const wait = (ms, token) =>
    new Promise((resolve, reject) => setTimeout(() => (token === run ? resolve() : reject(new Error("cancelled"))), ms));

  const play = async () => {
    const token = ++run;
    const f = fn();
    if (reduced()) {
      showFinal();
      return;
    }
    codeEl.querySelectorAll(".badge").forEach((b) => b.classList.remove("on"));
    codeEl.querySelectorAll(".code-line").forEach((r) => r.classList.remove("hot"));
    let cyc = 1;
    let cog = 0;
    let deepest = 0;
    setMeter("cyclomatic", cyc);
    setMeter("cognitive", cog);
    setMeter("length", f.length);
    setMeter("parameters", f.parameters);
    setMeter("nesting", 0);
    renderVerdict(false);
    playEl.disabled = true;
    try {
      const ordered = f.increments.map((inc, i) => ({ inc, i })).sort((a, b) => a.inc.line - b.inc.line || a.i - b.i);
      const seen = new Map();
      for (const { inc } of ordered) {
        await wait(STEP_MS, token);
        const k = seen.get(inc.line) || 0;
        seen.set(inc.line, k + 1);
        const row = codeEl.querySelector(`.code-line[data-line="${inc.line}"]`);
        codeEl.querySelectorAll(".code-line.hot").forEach((r) => r.classList.remove("hot"));
        if (row) {
          row.classList.add("hot");
          row.scrollIntoView({ block: "nearest", behavior: "smooth" });
          const badge = row.querySelector(`.badge[data-k="${k}"]`);
          if (badge) badge.classList.add("on");
        }
        cyc += inc.cyclomatic;
        cog += inc.cognitive;
        if (!inc.construct.endsWith("sequence") && inc.construct !== "case" && inc.construct !== "labeled jump") {
          deepest = Math.max(deepest, inc.nesting + 1);
        }
        setMeter("cyclomatic", cyc);
        setMeter("cognitive", cog);
        setMeter("nesting", Math.min(deepest, f.nesting));
      }
      await wait(STEP_MS, token);
      codeEl.querySelectorAll(".code-line.hot").forEach((r) => r.classList.remove("hot"));
      showFinal();
    } catch {
      /* a newer run took over */
    } finally {
      if (token === run) playEl.disabled = false;
    }
  };

  const renderAll = (animate) => {
    run++;
    playEl.disabled = false;
    renderTabs();
    renderFns();
    renderCode();
    metersEl.innerHTML = meterHtml();
    if (animate) play();
    else showFinal();
  };

  switchEl.addEventListener("change", () => {
    refactored = switchEl.checked;
    fnIndex = 0;
    renderAll(false);
  });
  playEl.addEventListener("click", () => play());

  renderAll(false);
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
