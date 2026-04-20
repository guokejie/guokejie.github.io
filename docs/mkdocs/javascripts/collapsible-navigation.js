(function () {
  const storageKey = "mkdocs.navigation.expanded";

  function readState() {
    try {
      return JSON.parse(sessionStorage.getItem(storageKey) || "{}");
    } catch {
      return {};
    }
  }

  function writeState(state) {
    try {
      sessionStorage.setItem(storageKey, JSON.stringify(state));
    } catch {
      // Ignore storage failures, e.g. private browsing restrictions.
    }
  }

  function setExpanded(toggle, expanded) {
    toggle.checked = expanded;

    const nestedNav = toggle.closest("li.md-nav__item")?.querySelector(":scope > nav.md-nav");
    if (nestedNav) {
      nestedNav.setAttribute("aria-expanded", String(expanded));
    }
  }

  function setupNavigation() {
    const state = readState();

    document
      .querySelectorAll(".md-nav:not(.md-nav--secondary) > .md-nav__list input.md-nav__toggle[type='checkbox']")
      .forEach((toggle) => {
        setExpanded(toggle, state[toggle.id] === true);

        if (toggle.dataset.collapsibleNavigation === "true") {
          return;
        }

        toggle.dataset.collapsibleNavigation = "true";
        toggle.addEventListener("change", () => {
          const nextState = readState();
          nextState[toggle.id] = toggle.checked;
          writeState(nextState);
        });
      });
  }

  function setup() {
    requestAnimationFrame(setupNavigation);
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(setup);
  } else {
    document.addEventListener("DOMContentLoaded", setup);
  }
})();
