(function () {
  const expandedClass = "toc-collapsible__item--expanded";
  const storageKey = "mkdocs.toc.expanded";

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

  function itemKey(item) {
    const link = item.querySelector(":scope > a.md-nav__link");
    return `${location.pathname}#${link?.getAttribute("href") || ""}`;
  }

  function setExpanded(item, expanded, save) {
    const childNav = item.querySelector(":scope > nav.md-nav");
    const toggle = item.querySelector(":scope > .toc-collapsible__toggle");

    if (!childNav || !toggle) {
      return;
    }

    item.classList.toggle(expandedClass, expanded);
    childNav.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));

    if (save) {
      const state = readState();
      state[itemKey(item)] = expanded;
      writeState(state);
    }
  }

  function setupCollapsibleToc(toc, tocIndex) {
    if (toc.dataset.collapsibleToc === "true") {
      return;
    }

    toc.dataset.collapsibleToc = "true";
    toc.classList.add("toc-collapsible");

    const state = readState();

    toc.querySelectorAll("li.md-nav__item").forEach((item, itemIndex) => {
      const childNav = item.querySelector(":scope > nav.md-nav");
      const link = item.querySelector(":scope > a.md-nav__link");

      if (!childNav || !link) {
        return;
      }

      item.classList.add("toc-collapsible__item");
      childNav.classList.add("toc-collapsible__children");
      childNav.id = childNav.id || `toc-collapsible-${tocIndex}-${itemIndex}`;

      const toggle = document.createElement("button");
      toggle.type = "button";
      toggle.className = "toc-collapsible__toggle";
      toggle.setAttribute("aria-controls", childNav.id);
      toggle.setAttribute("aria-expanded", "false");
      toggle.setAttribute("aria-label", `展开或收起 ${link.textContent.trim()}`);
      toggle.innerHTML = '<span class="toc-collapsible__chevron" aria-hidden="true"></span>';

      toggle.addEventListener("click", (event) => {
        event.preventDefault();
        event.stopPropagation();
        setExpanded(item, !item.classList.contains(expandedClass), true);
      });

      link.insertAdjacentElement("afterend", toggle);
      setExpanded(item, state[itemKey(item)] === true, false);
    });
  }

  function setup() {
    document
      .querySelectorAll(".md-nav--secondary [data-md-component='toc']")
      .forEach(setupCollapsibleToc);
  }

  if (typeof document$ !== "undefined") {
    document$.subscribe(setup);
  } else {
    document.addEventListener("DOMContentLoaded", setup);
  }
})();
