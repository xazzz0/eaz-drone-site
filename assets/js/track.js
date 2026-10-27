// Lead-intent actions only. External form submissions are not observable here.
// No requests to an unconfigured /collect endpoint, and no personal data or query strings.
(function () {
  'use strict';

  function track(eventName, link) {
    var service = new URLSearchParams(window.location.search).get('service');
    var destination = new URL(link.href, window.location.href);
    var destinationService = destination.searchParams.get('service');
    var allowedServices = ['construction-progress', 'property-media'];
    var params = {
      page_path: window.location.pathname,
      destination_type: eventName,
      service: allowedServices.indexOf(destinationService) !== -1 ? destinationService :
        (allowedServices.indexOf(service) !== -1 ? service : 'general')
    };

    // Lets a configured analytics tag consume the event; does not install a tag.
    if (window.eazAnalytics && !window.eazAnalytics.isEnabled()) {
      // The visitor has not allowed analytics. Do not queue their actions for later.
    } else if (typeof window.gtag === 'function') {
      window.gtag('event', eventName, params);
    } else if (window.dataLayer && Array.isArray(window.dataLayer)) {
      window.dataLayer.push(Object.assign({ event: eventName }, params));
    }
    window.dispatchEvent(new CustomEvent('eaz:lead-action', {
      detail: { event: eventName, parameters: params }
    }));
  }

  document.addEventListener('click', function (event) {
    var link = event.target.closest && event.target.closest('a[href]');
    if (!link) return;
    var url = new URL(link.href, window.location.href);
    var name;
    if (url.protocol === 'tel:') name = 'click_to_call';
    else if (url.protocol === 'mailto:') name = 'click_to_email';
    else if (url.hostname === 'forms.gle' ||
      (url.hostname === 'docs.google.com' && url.pathname.indexOf('/forms/') === 0)) name = 'booking_form_open';
    else if (url.origin === window.location.origin && url.pathname === '/pages/booking.html') name = 'quote_request_click';
    if (name) track(name, link);
  });
})();
