(function () {
  const expandedClass = "toc-collapsible__item--expanded";

  function setExpanded(item, expanded) {
    const childNav = item.querySelector(":scope > nav.md-nav");
    const toggle = item.querySelector(":scope > .toc-collapsible__toggle");

    if (!childNav || !toggle) {
      return;
    }

    item.classList.toggle(expandedClass, expanded);
    childNav.hidden = !expanded;
    toggle.setAttribute("aria-expanded", String(expanded));
  }

  function expandActiveBranch(toc) {
    const hash = decodeURIComponent(window.location.hash || "");

    if (!hash) {
      return;
    }

    const activeLink = Array.from(toc.querySelectorAll("a.md-nav__link")).find(
      (link) => link.getAttribute("href") === hash,
    );

    if (!activeLink) {
      return;
    }

    activeLink.closest("li.md-nav__item")?.classList.add("toc-collapsible__item--current");

    let parent = activeLink.parentElement;
    while (parent && parent !== toc) {
      if (parent.matches("li.md-nav__item")) {
        setExpanded(parent, true);
      }
      parent = parent.parentElement;
    }
  }

  function setupCollapsibleToc(toc, tocIndex) {
    if (toc.dataset.collapsibleToc === "true") {
      return;
    }

    toc.dataset.collapsibleToc = "true";
    toc.classList.add("toc-collapsible");

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
        setExpanded(item, !item.classList.contains(expandedClass));
      });

      link.insertAdjacentElement("afterend", toggle);
      setExpanded(item, false);
    });

    expandActiveBranch(toc);
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

  window.addEventListener("hashchange", () => {
    document.querySelectorAll(".md-nav--secondary [data-md-component='toc']").forEach(expandActiveBranch);
  });
})();
