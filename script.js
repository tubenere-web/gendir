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

  document.addEventListener("DOMContentLoaded", function () {
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
      root.addEventListener("click", function (event) {
        var tab = event.target.closest("[data-agent-tab]");
        if (!tab || !root.contains(tab)) return;
        switchAgent(root, tab.getAttribute("data-agent-tab"));
      });

      root.querySelectorAll("[data-agent-tab]").forEach(function (tab) {
        tab.addEventListener("keydown", function (event) {
          if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            switchAgent(root, tab.getAttribute("data-agent-tab"));
          }
        });
      });
    });
  });
})();
