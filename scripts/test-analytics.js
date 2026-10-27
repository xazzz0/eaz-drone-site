const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');
const source = fs.readFileSync(path.join(__dirname, '../assets/js/analytics.js'), 'utf8');
const id = 'G-5CK2VV2CZW';

function browser(options = {}) {
  const requests = [], cookies = [], panels = [];
  let stored = options.choice ? JSON.stringify({ value: options.choice, savedAt: Date.now() - (options.age || 0) }) : null;
  let reloads = 0;
  const settings = { hidden: true, focus() {}, addEventListener(name, callback) { this.click = callback; } };
  function button(value) { return { getAttribute: () => value, focus() {}, addEventListener(name, callback) { this.click = callback; } }; }
  const allow = button('allowed'), decline = button('declined');
  const document = {
    referrer: 'https://example.com/private/customer?email=person@example.com',
    head: { appendChild: script => requests.push(script.src) },
    body: { appendChild: panel => panels.push(panel) },
    createElement(tag) {
      return tag === 'section' ? { setAttribute() {}, querySelectorAll: () => [allow, decline], querySelector: () => allow } : {};
    },
    querySelectorAll: () => [settings],
    get cookie() { return '_ga=old; _ga_5CK2VV2CZW=session; useful=keep'; },
    set cookie(value) { cookies.push(value); }
  };
  const location = new URL(options.url || 'https://www.eazdrones.com/pages/booking.html?email=private@example.com#personal');
  location.reload = () => reloads++;
  const window = { location };
  const context = vm.createContext({ window, document, URL, Date,
    localStorage: {
      getItem() { if (options.storageBlocked) throw Error('Blocked'); return stored; },
      setItem(key, value) { if (options.storageBlocked) throw Error('Blocked'); stored = value; }
    }
  });
  vm.runInContext(source, context);
  return { window, allow, decline, settings, panels, requests, cookies, context,
    get stored() { return stored; }, get reloads() { return reloads; } };
}

test('no Google requests or event queue before consent; decline persists without loading', () => {
  const b = browser();
  assert.equal(b.requests.length, 0);
  assert.equal(b.window.gtag, undefined);
  assert.equal(b.window.eazAnalytics.isEnabled(), false);
  assert.equal(b.panels[0].hidden, false);
  b.decline.click();
  assert.equal(JSON.parse(b.stored).value, 'declined');
  assert.equal(b.requests.length, 0);
  assert.equal(b.panels[0].hidden, true);
  b.settings.click();
  assert.equal(b.panels[0].hidden, false);
});

test('allow initializes the supplied stream once with sanitized URLs and advertising disabled', () => {
  const b = browser();
  b.allow.click();
  b.allow.click();
  vm.runInContext(source, b.context);
  assert.deepEqual(b.requests, ['https://www.googletagmanager.com/gtag/js?id=' + id]);
  const configs = b.window.dataLayer.filter(entry => entry[0] === 'config');
  assert.equal(configs.length, 1);
  assert.equal(configs[0][1], id);
  assert.equal(configs[0][2].page_location, 'https://www.eazdrones.com/pages/booking.html');
  assert.equal(configs[0][2].page_referrer, 'https://example.com/');
  assert.equal(configs[0][2].allow_google_signals, false);
  assert.equal(configs[0][2].allow_ad_personalization_signals, false);
  assert.ok(!JSON.stringify(b.window.dataLayer).includes('private'));
  assert.equal(b.window.eazAnalytics.isEnabled(), true);
});

test('withdrawal disables analytics, clears only GA cookies and reloads without changing the choice', () => {
  const b = browser({ choice: 'allowed' });
  assert.equal(b.requests.length, 1);
  b.decline.click();
  assert.equal(b.window['ga-disable-' + id], true);
  assert.equal(b.window.eazAnalytics.isEnabled(), false);
  assert.equal(b.reloads, 1);
  assert.ok(b.cookies.some(x => x.startsWith('_ga=')));
  assert.ok(b.cookies.some(x => x.startsWith('_ga_5CK2VV2CZW=')));
  assert.ok(!b.cookies.some(x => x.startsWith('useful=')));
  assert.equal(JSON.parse(b.stored).value, 'declined');
  assert.equal(browser({ choice: 'declined' }).requests.length, 0);
});

test('expired/blocked choices default off; local previews never send production analytics', () => {
  for (const options of [{ choice: 'allowed', age: 181 * 86400000 }, { storageBlocked: true }]) {
    const b = browser(options);
    assert.equal(b.requests.length, 0);
    assert.equal(b.panels[0].hidden, false);
  }
  const local = browser({ url: 'http://127.0.0.1:8788/', choice: 'allowed' });
  assert.equal(local.requests.length, 0);
  assert.equal(local.window.eazAnalytics.isEnabled(), false);
});
