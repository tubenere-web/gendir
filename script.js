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

  document.addEventListener("DOMContentLoaded", function () {
    var teamSection = document.querySelector(".team-section");
    var teamHero = teamSection ? teamSection.querySelector(":scope > .hero") : null;
    if (teamSection && teamHero && !document.querySelector(".hero.hero--primary")) {
      var primaryHero = teamHero.cloneNode(true);
      primaryHero.classList.add("hero--primary");

      var idMap = {};
      primaryHero.querySelectorAll("[id]").forEach(function (node) {
        var oldId = node.id;
        var newId = oldId + "-primary";
        idMap[oldId] = newId;
        node.id = newId;
      });

      primaryHero.querySelectorAll("[aria-controls]").forEach(function (node) {
        var oldControls = node.getAttribute("aria-controls");
        if (oldControls && idMap[oldControls]) {
          node.setAttribute("aria-controls", idMap[oldControls]);
        }
      });

      primaryHero.querySelectorAll("[aria-labelledby]").forEach(function (node) {
        var oldLabelledBy = node.getAttribute("aria-labelledby");
        if (oldLabelledBy && idMap[oldLabelledBy]) {
          node.setAttribute("aria-labelledby", idMap[oldLabelledBy]);
        }
      });

      teamSection.parentNode.insertBefore(primaryHero, teamSection);
    }

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
  });
})();
