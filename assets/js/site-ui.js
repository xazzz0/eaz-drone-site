(function () {
  "use strict";

  function hasWrappedRows(element) {
    if (!element || element.children.length < 2) return false;

    var firstTop = element.children[0].getBoundingClientRect().top;
    for (var index = 1; index < element.children.length; index += 1) {
      if (element.children[index].getBoundingClientRect().top > firstTop + 1) return true;
    }

    return false;
  }

  function updateHeaderDensity() {
    var header = document.getElementById("header");
    if (!header) return;

    var nav = header.querySelector(".site-nav");
    var actions = header.querySelector(".site-header__actions");
    var scale = window.matchMedia("(max-width: 1080px)").matches ? 0.9 : 1;
    var compactScale = window.matchMedia("(max-width: 720px)").matches ? 0.8 : 0.82;

    if (hasWrappedRows(nav) || hasWrappedRows(actions)) scale = Math.min(scale, compactScale);

    header.style.setProperty("--header-scale", scale.toFixed(2));
    header.classList.toggle("site-header--compact", scale < 0.9);
  }

  document.addEventListener("DOMContentLoaded", function () {
    updateHeaderDensity();
    window.addEventListener("resize", updateHeaderDensity, { passive: true });
    window.addEventListener("orientationchange", updateHeaderDensity, { passive: true });

    if (window.ResizeObserver) {
      var header = document.getElementById("header");
      if (header) new ResizeObserver(updateHeaderDensity).observe(header);
    }
  });
})();
