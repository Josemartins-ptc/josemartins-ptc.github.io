// noshio — shared behaviour for every page: theme switch, scroll reveals, copy buttons.
(() => {
  const THEME_KEY = "noshio-theme";
  const root = document.documentElement;
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  const darkSystem = window.matchMedia("(prefers-color-scheme: dark)");

  window.noshio = {
    reducedMotion: () => reducedMotion.matches,
  };

  // Theme: follows the system until the visitor picks one.
  const readTheme = () => {
    try {
      return localStorage.getItem(THEME_KEY);
    } catch {
      return null;
    }
  };
  const saveTheme = (value) => {
    try {
      localStorage.setItem(THEME_KEY, value);
    } catch {
      /* private mode: the choice lasts for this page only */
    }
  };
  const stored = readTheme();
  if (stored === "light" || stored === "dark") root.dataset.theme = stored;
  const isDark = () => (root.dataset.theme ? root.dataset.theme === "dark" : darkSystem.matches);

  const SUN =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></svg>';
  const MOON =
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8z"/></svg>';

  const paintToggle = (button) => {
    const dark = isDark();
    button.innerHTML = dark ? SUN : MOON;
    button.setAttribute("aria-label", dark ? "Switch to light mode" : "Switch to dark mode");
  };

  document.querySelectorAll("[data-theme-toggle]").forEach((button) => {
    paintToggle(button);
    button.addEventListener("click", () => {
      const next = isDark() ? "light" : "dark";
      root.dataset.theme = next;
      saveTheme(next);
      paintToggle(button);
      document.dispatchEvent(new CustomEvent("noshio:theme"));
    });
  });
  darkSystem.addEventListener("change", () => {
    document.querySelectorAll("[data-theme-toggle]").forEach(paintToggle);
    document.dispatchEvent(new CustomEvent("noshio:theme"));
  });

  // Reveal sections as they scroll into view.
  const revealed = document.querySelectorAll(".reveal");
  if (reducedMotion.matches || !("IntersectionObserver" in window)) {
    revealed.forEach((el) => el.classList.add("in"));
  } else {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("in");
            io.unobserve(entry.target);
          }
        });
      },
      { rootMargin: "0px 0px -8% 0px", threshold: 0.12 },
    );
    revealed.forEach((el) => io.observe(el));
  }

  // Copy buttons: <button class="copy" data-copy="text">.
  document.querySelectorAll("[data-copy]").forEach((button) => {
    button.addEventListener("click", async () => {
      const text = button.dataset.copy;
      let ok = false;
      try {
        await navigator.clipboard.writeText(text);
        ok = true;
      } catch {
        const area = document.createElement("textarea");
        area.value = text;
        area.setAttribute("readonly", "");
        area.style.position = "absolute";
        area.style.left = "-9999px";
        document.body.appendChild(area);
        area.select();
        ok = document.execCommand("copy");
        area.remove();
      }
      const label = button.textContent;
      button.textContent = ok ? "Copied" : "Press ⌘C";
      button.classList.toggle("done", ok);
      setTimeout(() => {
        button.textContent = label;
        button.classList.remove("done");
      }, 1600);
    });
  });

  const year = document.querySelector("[data-year]");
  if (year) year.textContent = String(new Date().getFullYear());
})();
