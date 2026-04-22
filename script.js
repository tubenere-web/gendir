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

  document.addEventListener("DOMContentLoaded", function () {
    initCursorGlow();
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

        tab.addEventListener("focus", function () {
          switchAgent(root, agent);
        });

        tab.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            switchAgent(root, agent);
          }
        });
      });
    });
  });
})();
