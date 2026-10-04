/* CMB — interações: menu, nav fixa, progresso, revelação no scroll, contadores */
document.documentElement.classList.add("js");

(function () {
  "use strict";

  var reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  var nav = document.querySelector('[data-pencil-name="Nav"]');
  var toggle = document.querySelector(".nav-toggle");
  var menu = document.getElementById("menu-principal");
  var progress = document.querySelector(".scroll-progress span");
  var mobileCta = document.querySelector(".mobile-cta");
  var photo = document.querySelector('[data-pencil-name="Zona Fotográfica"]');

  /* ---------- Menu mobile ---------- */
  if (toggle && nav) {
    toggle.addEventListener("click", function () {
      var open = nav.classList.toggle("nav-open");
      toggle.setAttribute("aria-expanded", open ? "true" : "false");
      toggle.setAttribute("aria-label", open ? "Fechar menu" : "Abrir menu");
    });

    if (menu) {
      menu.addEventListener("click", function (e) {
        if (e.target.closest("a")) {
          nav.classList.remove("nav-open");
          toggle.setAttribute("aria-expanded", "false");
        }
      });
    }

    document.addEventListener("click", function (e) {
      if (nav.classList.contains("nav-open") && !nav.contains(e.target)) {
        nav.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
      }
    });

    document.addEventListener("keydown", function (e) {
      if (e.key === "Escape" && nav.classList.contains("nav-open")) {
        nav.classList.remove("nav-open");
        toggle.setAttribute("aria-expanded", "false");
        toggle.focus();
      }
    });
  }

  /* ---------- Revelação no scroll ---------- */
  var alvos = [];

  function addReveal(el, delay) {
    if (!el) return;
    el.classList.add("reveal");
    if (delay) el.style.setProperty("--d", delay + "ms");
    alvos.push(el);
  }

  document.querySelectorAll("#page-root main > div").forEach(function (sec) {
    if (sec.getAttribute("data-pencil-name") === "Hero") return;
    Array.prototype.slice.call(sec.children).forEach(function (el, i) {
      if (window.getComputedStyle(el).position === "absolute") return;
      addReveal(el, i * 90);
    });
  });

  var heroRow = document.querySelector('[data-pencil-name="Conteúdo do Hero"]');
  if (heroRow) {
    Array.prototype.slice.call(heroRow.children).forEach(function (el, i) {
      addReveal(el, i * 140);
    });
  }

  if ("IntersectionObserver" in window && !reduce) {
    var io = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-in");
            io.unobserve(entry.target);
          }
        });
      },
      { threshold: 0, rootMargin: "0px 0px -8% 0px" }
    );
    alvos.forEach(function (el) {
      io.observe(el);
    });
  } else {
    alvos.forEach(function (el) {
      el.classList.add("is-in");
    });
  }

  /* ---------- Contadores das estatísticas ---------- */
  function animateNumber(el) {
    var raw = el.textContent.trim();
    var match = raw.match(/^(\d+)/);
    if (!match) return;
    var target = parseInt(match[1], 10);
    var suffix = raw.slice(match[1].length);
    var start = null;
    var duration = 900;

    function step(ts) {
      if (start === null) start = ts;
      var p = Math.min(1, (ts - start) / duration);
      var eased = 1 - Math.pow(1 - p, 3);
      el.textContent = Math.round(target * eased) + suffix;
      if (p < 1) requestAnimationFrame(step);
    }
    requestAnimationFrame(step);
  }

  var valores = document.querySelectorAll(
    '[data-pencil-name^="Estatística"] [data-pencil-name="Valor"]'
  );

  if ("IntersectionObserver" in window && !reduce) {
    var ioNum = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            animateNumber(entry.target);
            ioNum.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.6 }
    );
    valores.forEach(function (el) {
      ioNum.observe(el);
    });
  }

  /* ---------- Nav fixa, barra de progresso, CTA e parallax ---------- */
  var ticking = false;

  function onScroll() {
    var y = window.pageYOffset || document.documentElement.scrollTop;

    if (nav) nav.classList.toggle("is-stuck", y > 12);

    if (progress) {
      var doc = document.documentElement;
      var max = doc.scrollHeight - window.innerHeight;
      progress.style.width = (max > 0 ? (y / max) * 100 : 0) + "%";
    }

    if (mobileCta) mobileCta.classList.toggle("is-visible", y > 420);

    if (photo && !reduce) {
      var rect = photo.getBoundingClientRect();
      if (rect.bottom > 0 && rect.top < window.innerHeight) {
        var p = (rect.top + rect.height / 2 - window.innerHeight / 2) / window.innerHeight;
        photo.style.backgroundPosition = "50% " + (50 + p * -14) + "%";
      }
    }

    ticking = false;
  }

  function requestTick() {
    if (!ticking) {
      ticking = true;
      requestAnimationFrame(onScroll);
    }
  }

  window.addEventListener("scroll", requestTick, { passive: true });
  window.addEventListener("resize", requestTick);
  onScroll();
})();
