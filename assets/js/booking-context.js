(function () {
  'use strict';
  var service = new URLSearchParams(window.location.search).get('service');
  if (service !== 'construction-progress' && service !== 'property-media') return;
  document.querySelectorAll('[data-quote-context]').forEach(function (section) {
    section.hidden = section.getAttribute('data-quote-context') !== service;
  });
})();
