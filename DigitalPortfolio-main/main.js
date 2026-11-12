(function () {
  "use strict";

  document.documentElement.classList.add("js");

  var EMAIL = "wafiqahoosain7@gmail.com";

  /* ---------- Year ---------- */
  var year = document.getElementById("year");
  if (year) year.textContent = new Date().getFullYear();

  /* ---------- Header state ---------- */
  var header = document.querySelector(".site-header");
  function onScroll() {
    header.classList.toggle("scrolled", window.scrollY > 40);
  }
  window.addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  /* ---------- Living backgrounds ----------
     Continuous motion (breathing, drifting, idle orbit) is pure CSS.
     This script only adds pointer depth and scroll effects, runs only while
     something is changing, and stops as soon as it settles. */
  var reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
  if (!reduceMotion.matches) {
    var hero = document.getElementById("home");
    var parallaxEls = Array.prototype.slice.call(document.querySelectorAll(".section-bg"));
    var target = { x: 0, y: 0 };
    var eased = { x: 0, y: 0 };
    var ticking = false;

    function update() {
      var moving = false;
      if (hero) {
        eased.x += (target.x - eased.x) * 0.08;
        eased.y += (target.y - eased.y) * 0.08;
        moving = Math.abs(target.x - eased.x) > 0.001 || Math.abs(target.y - eased.y) > 0.001;
        var sc = Math.min(Math.max(window.scrollY / hero.offsetHeight, 0), 1);
        hero.style.setProperty("--mx", eased.x.toFixed(4));
        hero.style.setProperty("--my", eased.y.toFixed(4));
        hero.style.setProperty("--sc", sc.toFixed(4));
      }
      var vh = window.innerHeight;
      parallaxEls.forEach(function (el) {
        var r = el.parentNode.getBoundingClientRect();
        if (r.bottom < 0 || r.top > vh) return;
        var limit = r.height * 0.22; // stays inside the -25% overscan
        var offset = (r.top + r.height / 2 - vh / 2) * parseFloat(el.dataset.depth || 0);
        offset = Math.max(-limit, Math.min(limit, offset));
        el.style.transform = "translate3d(0," + offset.toFixed(1) + "px,0)";
      });
      if (moving) {
        requestAnimationFrame(update);
      } else {
        ticking = false;
      }
    }
    function request() {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(update);
      }
    }

    if (hero && window.matchMedia("(pointer: fine)").matches) {
      hero.addEventListener("pointermove", function (e) {
        var r = hero.getBoundingClientRect();
        target.x = ((e.clientX - r.left) / r.width - 0.5) * 2;
        target.y = ((e.clientY - r.top) / r.height - 0.5) * 2;
        request();
      });
      hero.addEventListener("pointerleave", function () {
        target.x = 0;
        target.y = 0;
        request();
      });
    }
    window.addEventListener("scroll", request, { passive: true });
    window.addEventListener("resize", request);
    request();

    // Pause CSS animations for anything off-screen
    if ("IntersectionObserver" in window) {
      var pauseObserver = new IntersectionObserver(
        function (entries) {
          entries.forEach(function (entry) {
            entry.target.classList.toggle("is-paused", !entry.isIntersecting);
          });
        },
        { rootMargin: "100px 0px" }
      );
      if (hero) pauseObserver.observe(hero);
      document.querySelectorAll(".live").forEach(function (el) {
        pauseObserver.observe(el);
      });
    }
  }

  /* ---------- Mobile nav ---------- */
  var toggle = document.getElementById("nav-toggle");
  var nav = document.getElementById("site-nav");
  function setNav(open) {
    toggle.setAttribute("aria-expanded", String(open));
    nav.classList.toggle("open", open);
  }
  toggle.addEventListener("click", function () {
    setNav(toggle.getAttribute("aria-expanded") !== "true");
  });
  nav.addEventListener("click", function (e) {
    if (e.target.closest("a")) setNav(false);
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape") setNav(false);
  });

  /* ---------- Active nav link ---------- */
  var links = Array.prototype.slice.call(nav.querySelectorAll("a"));
  if ("IntersectionObserver" in window) {
    var sectionObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (!entry.isIntersecting) return;
          links.forEach(function (a) {
            a.classList.toggle("active", a.getAttribute("href") === "#" + entry.target.id);
          });
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }
    );
    ["home", "about", "work", "contact"].forEach(function (id) {
      var el = document.getElementById(id);
      if (el) sectionObserver.observe(el);
    });
  }

  /* ---------- Reveal on scroll ---------- */
  var reveals = document.querySelectorAll(".reveal");
  if ("IntersectionObserver" in window) {
    var revealObserver = new IntersectionObserver(
      function (entries) {
        entries.forEach(function (entry) {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
            revealObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12 }
    );
    reveals.forEach(function (el) {
      revealObserver.observe(el);
    });
  } else {
    reveals.forEach(function (el) {
      el.classList.add("visible");
    });
  }

  /* ---------- Work filters ---------- */
  var pieces = Array.prototype.slice.call(document.querySelectorAll(".piece"));
  var filters = Array.prototype.slice.call(document.querySelectorAll(".filter"));
  filters.forEach(function (btn) {
    btn.addEventListener("click", function () {
      var value = btn.dataset.filter;
      filters.forEach(function (b) {
        b.setAttribute("aria-pressed", String(b === btn));
      });
      pieces.forEach(function (p) {
        var cats = p.dataset.cat.split(" ");
        var show = value === "all" || cats.indexOf(value) !== -1;
        p.hidden = !show;
        if (show) p.classList.add("visible");
      });
    });
  });

  /* ---------- Lightbox ---------- */
  var lb = document.getElementById("lightbox");
  var lbImg = document.getElementById("lb-img");
  var lbCap = document.getElementById("lb-cap");
  var current = 0;

  function visiblePieces() {
    return pieces.filter(function (p) {
      return !p.hidden;
    });
  }

  function show(index) {
    var list = visiblePieces();
    if (!list.length) return;
    current = (index + list.length) % list.length;
    var piece = list[current];
    var img = piece.querySelector("img");
    lbImg.src = img.currentSrc || img.src;
    lbImg.alt = img.alt;
    lbCap.innerHTML = piece.querySelector("figcaption").innerHTML;
  }

  if (lb && typeof lb.showModal === "function") {
    pieces.forEach(function (piece) {
      piece.querySelector(".piece-btn").addEventListener("click", function () {
        show(visiblePieces().indexOf(piece));
        lb.showModal();
      });
    });
    lb.querySelector(".lb-close").addEventListener("click", function () {
      lb.close();
    });
    lb.querySelector(".lb-prev").addEventListener("click", function () {
      show(current - 1);
    });
    lb.querySelector(".lb-next").addEventListener("click", function () {
      show(current + 1);
    });
    lb.addEventListener("click", function (e) {
      if (e.target === lb) lb.close();
    });
    lb.addEventListener("keydown", function (e) {
      if (e.key === "ArrowLeft") show(current - 1);
      if (e.key === "ArrowRight") show(current + 1);
    });
  } else {
    // Fallback for browsers without <dialog>: open the image directly.
    pieces.forEach(function (piece) {
      piece.querySelector(".piece-btn").addEventListener("click", function () {
        window.open(piece.querySelector("img").src, "_blank", "noopener");
      });
    });
  }

  /* ---------- Contact form (composes an email) ---------- */
  var form = document.getElementById("contact-form");
  var note = document.getElementById("form-note");
  form.addEventListener("submit", function (e) {
    e.preventDefault();
    var fields = ["cf-name", "cf-email", "cf-message"].map(function (id) {
      return document.getElementById(id);
    });
    var firstInvalid = null;
    fields.forEach(function (f) {
      var ok = f.value.trim() !== "" && f.checkValidity();
      f.setAttribute("aria-invalid", String(!ok));
      if (!ok && !firstInvalid) firstInvalid = f;
    });
    if (firstInvalid) {
      note.textContent = "Please complete each field with a valid email address.";
      firstInvalid.focus();
      return;
    }
    var name = fields[0].value.trim();
    var from = fields[1].value.trim();
    var message = fields[2].value.trim();
    var subject = "Portfolio enquiry from " + name;
    var body = message + "\n\n" + name + "\n" + from;
    window.location.href =
      "mailto:" + EMAIL +
      "?subject=" + encodeURIComponent(subject) +
      "&body=" + encodeURIComponent(body);
    note.textContent = "Your email app should now open with the message ready to send.";
  });
})();
