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
      mx = e.clientX; my = e.clientY;
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
    let width = 0, height = 0, dpr = 1;
    let points = [];
    let mouse = { x: -9999, y: -9999 };

    const resize = () => {
      dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;
      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + "px";
      canvas.style.height = height + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const count = Math.min(75, Math.max(28, Math.floor(width / 20)));
      points = Array.from({ length: count }, () => ({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - .5) * .12,
        vy: (Math.random() - .5) * .12,
        r: Math.random() * 1.1 + .4
      }));
    };

    window.addEventListener("resize", resize, { passive: true });
    window.addEventListener("mousemove", (e) => { mouse.x = e.clientX; mouse.y = e.clientY; }, { passive: true });
    window.addEventListener("mouseleave", () => { mouse.x = -9999; mouse.y = -9999; }, { passive: true });
    resize();

    const draw = () => {
      ctx.clearRect(0, 0, width, height);
      const light = root.dataset.theme === "light";
      const dotColor = light ? "rgba(55,48,120,.20)" : "rgba(200,194,255,.18)";
      const lineColor = light ? "rgba(73,62,150," : "rgba(169,157,255,";

      for (const p of points) {
        p.x += p.vx;
        p.y += p.vy;
        if (p.x < -10) p.x = width + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.y < -10) p.y = height + 10;
        if (p.y > height + 10) p.y = -10;

        const mdx = mouse.x - p.x;
        const mdy = mouse.y - p.y;
        const md = Math.hypot(mdx, mdy);
        if (md < 150) {
          p.x -= mdx * .0006;
          p.y -= mdy * .0006;
        }

        ctx.beginPath();
        ctx.fillStyle = dotColor;
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fill();
      }

      for (let i = 0; i < points.length; i++) {
        for (let j = i + 1; j < points.length; j++) {
          const a = points[i], b = points[j];
          const d = Math.hypot(a.x - b.x, a.y - b.y);
          if (d < 115) {
            ctx.beginPath();
            ctx.strokeStyle = lineColor + ((1 - d / 115) * .13).toFixed(3) + ")";
            ctx.lineWidth = .55;
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      requestAnimationFrame(draw);
    };
    draw();
  }
})();