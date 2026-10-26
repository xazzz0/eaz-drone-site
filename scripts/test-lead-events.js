const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const vm = require('node:vm');

const source = fs.readFileSync(path.join(__dirname, '../assets/js/track.js'), 'utf8');

function page(analytics) {
  let click;
  const observed = [];
  const sent = [];
  const window = {
    location: new URL('https://www.eazdrones.com/pages/booking.html?service=property-media&email=private@example.com'),
    dispatchEvent: (event) => observed.push(event.detail),
  };
  if (analytics === 'gtag') window.gtag = (...args) => sent.push(args);
  if (analytics === 'dataLayer') window.dataLayer = [];
  vm.runInNewContext(source, {
    window, URL, URLSearchParams,
    document: { addEventListener: (name, fn) => { assert.equal(name, 'click'); click = fn; } },
    CustomEvent: class { constructor(name, options) { this.type = name; this.detail = options.detail; } },
    fetch: () => { throw new Error('An unconfigured tracker must not make network requests'); },
    navigator: { sendBeacon: () => { throw new Error('No unconfigured beacon endpoint'); } },
  });
  return {
    window, observed, sent,
    click(href) {
      let prevented = false;
      const link = { href: new URL(href, window.location.href).href };
      click({ target: { closest: () => link }, preventDefault: () => { prevented = true; } });
      assert.equal(prevented, false, 'Tracking must not prevent navigation');
    },
    clickNonLink() { click({ target: { closest: () => null } }); },
  };
}

test('call, email, quote and external form actions remain distinct from submissions', () => {
  const p = page();
  p.click('tel:+18507337033');
  p.click('mailto:info@eazdrones.com?body=private%20project%20details');
  p.click('/pages/booking.html?service=construction-progress');
  p.click('https://forms.gle/As2hiR8MxSg2ZkPt9');
  assert.deepEqual(p.observed.map((x) => x.event), ['click_to_call', 'click_to_email', 'quote_request_click', 'booking_form_open']);
  assert.equal(p.observed[2].parameters.service, 'construction-progress');
  assert.equal(p.observed[3].parameters.service, 'property-media');
  assert.ok(!JSON.stringify(p.observed).includes('private'));
  assert.ok(!JSON.stringify(p.observed).includes('info@'));
  assert.ok(!JSON.stringify(p.observed).includes('+1850'));
  assert.ok(!p.observed.some((x) => x.event === 'generate_lead'));
});

test('events reach an existing gtag or dataLayer without installing analytics', () => {
  const ga = page('gtag');
  ga.click('tel:+18507337033');
  assert.equal(ga.sent.length, 1);
  assert.equal(ga.sent[0][0], 'event');
  assert.equal(ga.sent[0][1], 'click_to_call');
  const dl = page('dataLayer');
  dl.click('mailto:info@eazdrones.com');
  assert.equal(dl.window.dataLayer[0].event, 'click_to_email');
  const none = page();
  none.click('tel:+18507337033');
  assert.equal(none.window.dataLayer, undefined);
});

test('ordinary navigation and unsupported service values do not become lead details', () => {
  const p = page();
  p.click('/pages/about.html');
  p.click('https://example.com/booking.html');
  p.clickNonLink();
  assert.equal(p.observed.length, 0);
  p.window.location = new URL('https://www.eazdrones.com/?service=private-project-name');
  p.click('/pages/booking.html?service=someone@example.com');
  assert.equal(p.observed[0].parameters.service, 'general');
  assert.ok(!JSON.stringify(p.observed).includes('someone@'));
});
