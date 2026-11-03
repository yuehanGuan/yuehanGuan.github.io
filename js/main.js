/* ===================================================
   管越涵 · 个人主页交互脚本
   原生 JavaScript，无任何第三方依赖。
   =================================================== */
(function () {
  "use strict";

  /* ---------- 1. 主题切换（记忆用户选择） ---------- */
  var root = document.documentElement;
  var themeBtn = document.getElementById("themeBtn");
  var saved = null;
  try { saved = localStorage.getItem("theme"); } catch (e) {}

  var prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
  setTheme(saved || (prefersDark ? "dark" : "light"));

  function setTheme(name) {
    root.setAttribute("data-theme", name);
    if (themeBtn) themeBtn.textContent = name === "dark" ? "☀️" : "🌙";
    try { localStorage.setItem("theme", name); } catch (e) {}
  }

  if (themeBtn) {
    themeBtn.addEventListener("click", function () {
      setTheme(root.getAttribute("data-theme") === "dark" ? "light" : "dark");
    });
  }

  /* ---------- 2. 导航：滚动状态 / 移动端抽屉 / 高亮当前区块 ---------- */
  var nav = document.getElementById("nav");
  var navLinks = document.getElementById("navLinks");
  var navToggle = document.getElementById("navToggle");
  var links = navLinks ? Array.prototype.slice.call(navLinks.querySelectorAll("a")) : [];

  function onScroll() {
    if (nav) nav.classList.toggle("scrolled", window.scrollY > 12);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", function () {
      var open = navLinks.classList.toggle("open");
      navToggle.classList.toggle("open", open);
    });
    links.forEach(function (a) {
      a.addEventListener("click", function () {
        navLinks.classList.remove("open");
        navToggle.classList.remove("open");
      });
    });
  }

  // 当前区块高亮（IntersectionObserver，避免 scroll 里做布局计算）
  var sections = links
    .map(function (a) { return document.querySelector(a.getAttribute("href")); })
    .filter(Boolean);

  if ("IntersectionObserver" in window && sections.length) {
    var navObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var id = "#" + en.target.id;
          links.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    sections.forEach(function (s) { navObserver.observe(s); });
  }

  /* ---------- 3. 滚动进入动画 + 技能条填充 ---------- */
  var revealEls = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var io = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          var el = en.target;
          // 同屏元素做轻微错峰，视觉更自然
          var delay = Number(el.dataset.delay || 0);
          setTimeout(function () { el.classList.add("in"); }, delay);
          if (el.classList.contains("skill-card")) el.classList.add("in");
          obs.unobserve(el);
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -40px 0px" }
    );
    revealEls.forEach(function (el, i) {
      el.dataset.delay = String((i % 4) * 70);
      io.observe(el);
    });
  } else {
    revealEls.forEach(function (el) { el.classList.add("in"); });
  }

  /* ---------- 4. 数字滚动 ---------- */
  function animateCount(el) {
    var target = Number(el.dataset.count || 0);
    var duration = 1100;
    var start = performance.now();
    function tick(now) {
      var p = Math.min((now - start) / duration, 1);
      var eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      el.textContent = Math.round(target * eased);
      if (p < 1) requestAnimationFrame(tick);
      else el.textContent = target;
    }
    requestAnimationFrame(tick);
  }

  var counters = document.querySelectorAll("[data-count]");
  if ("IntersectionObserver" in window) {
    var co = new IntersectionObserver(
      function (entries, obs) {
        entries.forEach(function (en) {
          if (!en.isIntersecting) return;
          animateCount(en.target);
          obs.unobserve(en.target);
        });
      },
      { threshold: 0.6 }
    );
    counters.forEach(function (c) { co.observe(c); });
  } else {
    counters.forEach(function (c) { c.textContent = c.dataset.count; });
  }

  /* ---------- 5. 打字机效果 ---------- */
  var typedEl = document.getElementById("typed");
  var phrases = [
    "算法与数据结构爱好者",
    "Web 前端开发者",
    "蓝桥杯省级二等奖",
    "ACM 参赛队员"
  ];
  var pi = 0, ci = 0, deleting = false;

  function typeLoop() {
    if (!typedEl) return;
    var text = phrases[pi];
    if (!deleting) {
      ci++;
      typedEl.textContent = text.slice(0, ci);
      if (ci === text.length) {
        deleting = true;
        return setTimeout(typeLoop, 1800);
      }
      return setTimeout(typeLoop, 90);
    }
    ci--;
    typedEl.textContent = text.slice(0, ci);
    if (ci === 0) {
      deleting = false;
      pi = (pi + 1) % phrases.length;
      return setTimeout(typeLoop, 320);
    }
    setTimeout(typeLoop, 45);
  }
  typeLoop();

  /* ---------- 6. Canvas 粒子背景 ---------- */
  var canvas = document.getElementById("canvas");
  if (canvas && !window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    var ctx = canvas.getContext("2d");
    var particles = [];
    var dpr = Math.min(window.devicePixelRatio || 1, 2);
    var w = 0, h = 0, rafId = null;
    var pointer = { x: -9999, y: -9999 };

    function resize() {
      var box = canvas.parentElement.getBoundingClientRect();
      w = box.width;
      h = box.height;
      canvas.width = Math.floor(w * dpr);
      canvas.height = Math.floor(h * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);

      // 数量随面积自适应，兼顾低端设备性能
      var count = Math.min(90, Math.max(24, Math.round((w * h) / 19000)));
      particles = [];
      for (var i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          vx: (Math.random() - 0.5) * 0.35,
          vy: (Math.random() - 0.5) * 0.35,
          r: Math.random() * 1.7 + 0.7
        });
      }
    }

    function accentColor() {
      return getComputedStyle(root).getPropertyValue("--accent").trim() || "#2f6fed";
    }

    function draw() {
      ctx.clearRect(0, 0, w, h);
      var color = accentColor();
      var maxDist = 130;

      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.x += p.vx;
        p.y += p.vy;

        if (p.x < -20) p.x = w + 20;
        if (p.x > w + 20) p.x = -20;
        if (p.y < -20) p.y = h + 20;
        if (p.y > h + 20) p.y = -20;

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = color;
        ctx.globalAlpha = 0.5;
        ctx.fill();

        // 连附近点；鼠标附近的点连线更明显
        for (var j = i + 1; j < particles.length; j++) {
          var q = particles[j];
          var dx = p.x - q.x, dy = p.y - q.y;
          var d2 = dx * dx + dy * dy;
          var near = Math.hypot(p.x - pointer.x, p.y - pointer.y) < 170;
          if (d2 < maxDist * maxDist) {
            var alpha = (1 - Math.sqrt(d2) / maxDist) * (near ? 0.4 : 0.14);
            ctx.globalAlpha = alpha;
            ctx.strokeStyle = color;
            ctx.lineWidth = 1;
            ctx.beginPath();
            ctx.moveTo(p.x, p.y);
            ctx.lineTo(q.x, q.y);
            ctx.stroke();
          }
        }
      }
      ctx.globalAlpha = 1;
      rafId = requestAnimationFrame(draw);
    }

    function start() {
      resize();
      if (rafId) cancelAnimationFrame(rafId);
      draw();
    }

    var rt = null;
    window.addEventListener("resize", function () {
      clearTimeout(rt);
      rt = setTimeout(resize, 180);
    });

    canvas.parentElement.addEventListener("mousemove", function (e) {
      var b = canvas.getBoundingClientRect();
      pointer.x = e.clientX - b.left;
      pointer.y = e.clientY - b.top;
    });
    canvas.parentElement.addEventListener("mouseleave", function () {
      pointer.x = pointer.y = -9999;
    });

    start();

    // 页面不可见时暂停动画，节省电量
    document.addEventListener("visibilitychange", function () {
      if (document.hidden) {
        if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
      } else if (!rafId) {
        draw();
      }
    });
  }

  /* ---------- 7. 复制邮箱 ---------- */
  var copyBtn = document.getElementById("copyBtn");
  var copyTip = document.getElementById("copyTip");
  if (copyBtn && copyTip) {
    copyBtn.addEventListener("click", function () {
      var text = copyBtn.dataset.copy || "";
      var done = function () {
        copyTip.textContent = "已复制到剪贴板：" + text;
        copyTip.classList.add("show");
        setTimeout(function () { copyTip.classList.remove("show"); }, 2200);
      };
      if (navigator.clipboard && window.isSecureContext) {
        navigator.clipboard.writeText(text).then(done).catch(fallback);
      } else {
        fallback();
      }
      function fallback() {
        var ta = document.createElement("textarea");
        ta.value = text;
        ta.style.position = "fixed";
        ta.style.opacity = "0";
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand("copy"); done(); } catch (e) {}
        document.body.removeChild(ta);
      }
    });
  }

  /* ---------- 8. 页脚年份 ---------- */
  var yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
