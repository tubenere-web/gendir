(function () {
  function syncItemOpen(item, open) {
    item.classList.toggle("is-open", open);
    item.querySelectorAll("[data-acc-toggle]").forEach(function (button) {
      button.setAttribute("aria-expanded", String(open));
    });

    var iconBtn = item.querySelector(".anim-acc__icon-btn");
    if (iconBtn) {
      iconBtn.setAttribute("aria-label", open ? "Свернуть блок" : "Развернуть блок");
    }
  }

  function switchAgent(root, agent) {
    if (!root || !agent) return;
    if (root.getAttribute("data-active-agent") === agent) return;

    root.setAttribute("data-active-agent", agent);

    root.querySelectorAll("[data-agent-tab]").forEach(function (tab) {
      var isActive = tab.getAttribute("data-agent-tab") === agent;
      tab.classList.toggle("is-active", isActive);
      tab.setAttribute("aria-selected", String(isActive));
      tab.setAttribute("tabindex", isActive ? "0" : "0");
    });

    root.querySelectorAll("[data-agent-content]").forEach(function (node) {
      var isActive = node.getAttribute("data-agent-content") === agent;
      if (isActive) {
        node.removeAttribute("hidden");
      } else {
        node.setAttribute("hidden", "");
      }
    });
  }

  function initCursorGlow() {
    var glow = document.querySelector(".cursor-glow");
    if (!glow) return;

    var reduceMotion = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    var hoverCapable = window.matchMedia && window.matchMedia("(hover: hover)").matches;
    if (reduceMotion || !hoverCapable) return;

    var targetX = window.innerWidth / 2;
    var targetY = window.innerHeight / 2;
    var currentX = targetX;
    var currentY = targetY;
    var rafId = null;
    var visible = false;

    function render() {
      currentX += (targetX - currentX) * 0.16;
      currentY += (targetY - currentY) * 0.16;
      glow.style.transform = "translate3d(" + currentX + "px, " + currentY + "px, 0)";

      var dx = targetX - currentX;
      var dy = targetY - currentY;
      if (Math.abs(dx) < 0.3 && Math.abs(dy) < 0.3) {
        rafId = null;
        return;
      }
      rafId = window.requestAnimationFrame(render);
    }

    function schedule() {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(render);
      }
    }

    function updateTarget(x, y) {
      targetX = x;
      targetY = y;
      if (!visible) {
        visible = true;
        glow.classList.add("is-visible");
      }
      schedule();
    }

    window.addEventListener(
      "pointermove",
      function (event) {
        if (event.pointerType && event.pointerType !== "mouse") return;
        updateTarget(event.clientX, event.clientY);
      },
      { passive: true }
    );

    window.addEventListener("pointerleave", function () {
      visible = false;
      glow.classList.remove("is-visible");
    });

    document.addEventListener("mouseleave", function () {
      visible = false;
      glow.classList.remove("is-visible");
    });

    function attachToFrame(frame) {
      try {
        var frameWin = frame.contentWindow;
        var frameDoc = frame.contentDocument;
        if (!frameWin || !frameDoc) return;
        if (frame.__cursorGlowAttached) return;
        frame.__cursorGlowAttached = true;

        frameWin.addEventListener(
          "pointermove",
          function (event) {
            if (event.pointerType && event.pointerType !== "mouse") return;
            var rect = frame.getBoundingClientRect();
            updateTarget(rect.left + event.clientX, rect.top + event.clientY);
          },
          { passive: true }
        );

        frameDoc.addEventListener("mouseleave", function () {
          visible = false;
          glow.classList.remove("is-visible");
        });
      } catch (err) {
        /* cross-origin iframe — ignore */
      }
    }

    function wireFrames() {
      document.querySelectorAll("iframe").forEach(function (frame) {
        var ready =
          frame.contentDocument && frame.contentDocument.readyState === "complete";
        if (ready) {
          attachToFrame(frame);
        } else {
          frame.addEventListener("load", function () {
            attachToFrame(frame);
          });
        }
      });
    }

    wireFrames();
    window.addEventListener("load", wireFrames);
  }

  function initIframeAutoResize() {
    document.querySelectorAll(".external-block__frame").forEach(function (frame) {
      var lastHeight = 0;
      var rafId = 0;
      var resizeTimer = 0;

      function measureAndApplyHeight() {
        try {
          var doc = frame.contentDocument;
          if (!doc || !doc.body) return;
          var h = Math.max(doc.body.scrollHeight, doc.documentElement.scrollHeight);
          if (h <= 0) return;
          if (Math.abs(h - lastHeight) < 2) return;
          frame.style.height = h + "px";
          lastHeight = h;
        } catch (err) {
          /* cross-origin — ignore */
        }
      }

      function scheduleResize() {
        if (rafId) return;
        rafId = window.requestAnimationFrame(function () {
          rafId = 0;
          measureAndApplyHeight();
        });
      }

      frame.addEventListener("load", function () {
        scheduleResize();
        try {
          var ro = new ResizeObserver(scheduleResize);
          ro.observe(frame.contentDocument.documentElement);
          ro.observe(frame.contentDocument.body);
        } catch (err) {
          /* older browsers */
        }
        setTimeout(scheduleResize, 80);
        setTimeout(scheduleResize, 220);
        setTimeout(scheduleResize, 400);
        setTimeout(scheduleResize, 1200);
        setTimeout(scheduleResize, 2200);
      });

      window.addEventListener("resize", function () {
        if (resizeTimer) window.clearTimeout(resizeTimer);
        resizeTimer = window.setTimeout(scheduleResize, 120);
      });

      if (frame.contentDocument && frame.contentDocument.readyState === "complete") {
        scheduleResize();
      }
    });
  }

  function initMobileHeaderMenu() {
    var header = document.querySelector(".main-header");
    if (!header) return;

    var burger = header.querySelector(".main-header__burger");
    if (!burger) return;

    function closeMenu() {
      header.classList.remove("is-open");
      burger.setAttribute("aria-expanded", "false");
    }

    burger.addEventListener("click", function () {
      var isOpen = header.classList.toggle("is-open");
      burger.setAttribute("aria-expanded", String(isOpen));
    });

    document.addEventListener("click", function (event) {
      if (!header.classList.contains("is-open")) return;
      if (header.contains(event.target)) return;
      closeMenu();
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", function () {
      if (window.innerWidth > 768) closeMenu();
    });

    header.querySelectorAll(".main-header__link, .main-header__cta").forEach(function (node) {
      node.addEventListener("click", closeMenu);
    });
  }

  document.addEventListener("DOMContentLoaded", function () {
    initCursorGlow();
    initIframeAutoResize();
    initMobileHeaderMenu();
    document.querySelectorAll("[data-anim-accordion]").forEach(function (root) {
      root.addEventListener("click", function (event) {
        var btn = event.target.closest("[data-acc-toggle]");
        if (!btn || !root.contains(btn)) return;

        var item = btn.closest("[data-acc-item]");
        if (!item) return;

        var willOpen = !item.classList.contains("is-open");
        if (!willOpen) return;

        root.querySelectorAll("[data-acc-item]").forEach(function (other) {
          if (other !== item) syncItemOpen(other, false);
        });

        syncItemOpen(item, true);
      });
    });

    document.querySelectorAll("[data-agent-switch]").forEach(function (root) {
      root.querySelectorAll("[data-agent-tab]").forEach(function (tab) {
        var agent = tab.getAttribute("data-agent-tab");
        var hoverZone = tab.closest(".lead-box--switcher, .about-box--switcher") || tab;

        hoverZone.addEventListener("mouseenter", function () {
          switchAgent(root, agent);
        });

        hoverZone.addEventListener("click", function (event) {
          if (event.target.closest(".agent-mobile-expand")) return;
          switchAgent(root, agent);
          root.classList.add("is-mobile-activated");
        });

        tab.addEventListener("focus", function () {
          switchAgent(root, agent);
        });

        tab.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            switchAgent(root, agent);
            root.classList.add("is-mobile-activated");
          }
        });
      });
    });
  });
})();
