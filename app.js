(() => {
  const root = document.documentElement;
  const savedTheme = localStorage.getItem("zjy-theme");
  if (savedTheme === "light" || savedTheme === "dark") root.dataset.theme = savedTheme;

  const toggle = document.getElementById("themeToggle");
  const syncToggle = () => {
    if (!toggle) return;
    toggle.textContent = root.dataset.theme === "light" ? "●" : "○";
    toggle.setAttribute("aria-label", root.dataset.theme === "light" ? "Switch to dark theme" : "Switch to light theme");
  };
  syncToggle();

  if (toggle) {
    toggle.addEventListener("click", () => {
      root.dataset.theme = root.dataset.theme === "light" ? "dark" : "light";
      localStorage.setItem("zjy-theme", root.dataset.theme);
      syncToggle();
    });
  }

  const progress = document.querySelector(".progress");
  const onScroll = () => {
    const h = document.documentElement.scrollHeight - window.innerHeight;
    const p = h > 0 ? (window.scrollY / h) * 100 : 0;
    if (progress) progress.style.width = p + "%";
  };
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (entry.isIntersecting) {
        entry.target.classList.add("visible");
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: .12, rootMargin: "0px 0px -40px 0px" });

  document.querySelectorAll(".reveal").forEach((el) => observer.observe(el));

  const counters = document.querySelectorAll("[data-count]");
  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
      if (!entry.isIntersecting) return;
      const el = entry.target;
      const end = Number(el.dataset.count || 0);
      const start = performance.now();
      const duration = 900;
      const tick = (now) => {
        const t = Math.min(1, (now - start) / duration);
        const eased = 1 - Math.pow(1 - t, 3);
        el.textContent = Math.round(end * eased);
        if (t < 1) requestAnimationFrame(tick);
      };
      requestAnimationFrame(tick);
      countObserver.unobserve(el);
    });
  }, { threshold: .6 });
  counters.forEach((el) => countObserver.observe(el));

  if (matchMedia("(hover:hover) and (pointer:fine)").matches) {
    const dot = document.querySelector(".cursor-dot");
    const ring = document.querySelector(".cursor-ring");
    let mx = -100, my = -100, rx = -100, ry = -100;

    window.addEventListener("mousemove", (e) => {
      mx = e.clientX;
      my = e.clientY;
      if (dot) {
        dot.style.left = mx + "px";
        dot.style.top = my + "px";
      }
    }, { passive: true });

    const renderCursor = () => {
      rx += (mx - rx) * .14;
      ry += (my - ry) * .14;
      if (ring) {
        ring.style.left = rx + "px";
        ring.style.top = ry + "px";
      }
      requestAnimationFrame(renderCursor);
    };
    renderCursor();

    document.querySelectorAll("a,button").forEach((el) => {
      el.addEventListener("mouseenter", () => document.body.classList.add("cursor-active"));
      el.addEventListener("mouseleave", () => document.body.classList.remove("cursor-active"));
    });
  }

  const canvas = document.getElementById("field");
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;

  if (canvas && !reduced) {
    const ctx = canvas.getContext("2d");
    let width = 0;
    let height = 0;
    let dpr = 1;
    let pointerX = 0.5;
    let pointerY = 0.5;
    let time = 0;

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (e) => {
      pointerX = e.clientX / Math.max(1, width);
      pointerY = e.clientY / Math.max(1, height);
    }, { passive: true });

    resize();

    const drawWave = (baseY, amp, wavelength, speed, alpha, offset, lineWidth) => {
      const light = root.dataset.theme === "light";
      const rgb = light ? "31,127,147" : "118,200,217";
      ctx.beginPath();

      for (let x = -40; x <= width + 40; x += 7) {
        const drift = (pointerX - .5) * 18;
        const y =
          baseY +
          Math.sin((x + time * speed + offset + drift) / wavelength) * amp +
          Math.sin((x - time * speed * .55 + offset * 1.7) / (wavelength * .47)) * amp * .28;

        if (x === -40) ctx.moveTo(x, y);
        else ctx.lineTo(x, y);
      }

      ctx.strokeStyle = "rgba(" + rgb + "," + alpha + ")";
      ctx.lineWidth = lineWidth;
      ctx.stroke();
    };

    const draw = () => {
      ctx.clearRect(0, 0, width, height);

      const yShift = (pointerY - .5) * 10;
      const center = height * .57 + yShift;

      drawWave(center - 90, 7, 145, .42, .075, 0, .65);
      drawWave(center - 55, 9, 165, .32, .10, 90, .75);
      drawWave(center - 14, 12, 188, .25, .14, 180, .85);
      drawWave(center + 35, 15, 225, .19, .10, 250, .8);
      drawWave(center + 92, 18, 285, .14, .065, 330, .7);

      const light = root.dataset.theme === "light";
      const g = ctx.createLinearGradient(0, center - 180, 0, center + 220);
      g.addColorStop(0, light ? "rgba(31,127,147,0)" : "rgba(118,200,217,0)");
      g.addColorStop(.5, light ? "rgba(31,127,147,.018)" : "rgba(118,200,217,.018)");
      g.addColorStop(1, light ? "rgba(31,127,147,0)" : "rgba(118,200,217,0)");
      ctx.fillStyle = g;
      ctx.fillRect(0, center - 180, width, 400);

      time += .55;
      requestAnimationFrame(draw);
    };

    draw();
  }
})();