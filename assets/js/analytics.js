// Optional analytics: do not load Google or queue events until the visitor allows it.
(function () {
  'use strict';
  if (window.eazAnalytics) return;
  var measurementId = 'G-5CK2VV2CZW';
  var storageKey = 'eaz-analytics-choice';
  var lifetime = 180 * 24 * 60 * 60 * 1000;
  var enabled = false;
  var started = false;
  var panel;
  var settingsButton;
  window['ga-disable-' + measurementId] = true;

  function readChoice() {
    try {
      var saved = JSON.parse(localStorage.getItem(storageKey));
      if (saved && Date.now() - saved.savedAt < lifetime &&
          (saved.value === 'allowed' || saved.value === 'declined')) return saved.value;
    } catch (_) { /* A blocked preference store must not prevent site use. */ }
    return null;
  }

  function start() {
    if (started || !enabled || !/^(www\.)?eazdrones\.com$/.test(window.location.hostname)) return;
    started = true;
    window['ga-disable-' + measurementId] = false;
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    var referrer = '';
    try { referrer = document.referrer ? new URL(document.referrer).origin + '/' : ''; } catch (_) {}
    window.gtag('consent', 'default', {
      analytics_storage: 'granted', ad_storage: 'denied',
      ad_user_data: 'denied', ad_personalization: 'denied'
    });
    window.gtag('js', new Date());
    window.gtag('config', measurementId, {
      page_location: window.location.origin + window.location.pathname,
      page_referrer: referrer,
      allow_google_signals: false,
      allow_ad_personalization_signals: false,
      cookie_expires: 15552000,
      cookie_update: false,
      cookie_flags: 'SameSite=Lax;Secure'
    });
    var script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + measurementId;
    document.head.appendChild(script);
  }

  function clearCookies() {
    document.cookie.split(';').forEach(function (part) {
      var name = part.trim().split('=')[0];
      if (!/^_ga(?:_|$)/.test(name)) return;
      ['', ';domain=eazdrones.com', ';domain=.eazdrones.com', ';domain=' + window.location.hostname].forEach(function (domain) {
        document.cookie = name + '=;Max-Age=0;path=/' + domain + ';SameSite=Lax;Secure';
      });
    });
  }

  function choose(value) {
    var wasStarted = started;
    enabled = value === 'allowed';
    try { localStorage.setItem(storageKey, JSON.stringify({ value: value, savedAt: Date.now() })); } catch (_) {}
    if (panel) panel.hidden = true;
    if (settingsButton) settingsButton.focus();
    if (enabled) start();
    else {
      window['ga-disable-' + measurementId] = true;
      clearCookies();
      // Unload Google's listeners after withdrawal; the saved choice prevents reloading them.
      if (wasStarted) window.location.reload();
    }
  }

  window.eazAnalytics = {
    isEnabled: function () { return enabled && started; },
    openSettings: function () {
      if (panel) { panel.hidden = false; panel.querySelector('button').focus(); }
    }
  };
  var choice = readChoice();
  enabled = choice === 'allowed';
  if (enabled) start();

  panel = document.createElement('section');
  panel.className = 'analytics-choice';
  panel.setAttribute('aria-label', 'Analytics cookie choice');
  panel.hidden = choice !== null;
  panel.innerHTML = '<div><strong>Help us improve this website?</strong><p>Optional Google Analytics cookies measure visits and use of our quote and contact links. Your choice will not affect booking. <a href="/pages/privacy.html">Privacy details</a></p></div><div class="analytics-choice__actions"><button type="button" data-choice="allowed">Allow analytics</button><button type="button" data-choice="declined">Decline</button></div>';
  panel.querySelectorAll('[data-choice]').forEach(function (button) {
    button.addEventListener('click', function () { choose(button.getAttribute('data-choice')); });
  });
  document.body.appendChild(panel);
  document.querySelectorAll('[data-analytics-settings]').forEach(function (button) {
    if (!settingsButton) settingsButton = button;
    button.hidden = false;
    button.addEventListener('click', window.eazAnalytics.openSettings);
  });
})();
