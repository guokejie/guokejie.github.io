(function () {
  function collapseNavigation() {
    document
      .querySelectorAll(".md-nav:not(.md-nav--secondary) > .md-nav__list input.md-nav__toggle[type='checkbox']:checked")
      .forEach((toggle) => {
        toggle.checked = false;

        const nestedNav = document.querySelector(`nav.md-nav[aria-labelledby="${toggle.id}_label"]`);
        if (nestedNav) {
          nestedNav.setAttribute("aria-expanded", "false");
        }
      });
  }

  function setup() {
    requestAnimationFrame(collapseNavigation);
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(setup);
  } else {
    document.addEventListener("DOMContentLoaded", setup);
  }
})();
