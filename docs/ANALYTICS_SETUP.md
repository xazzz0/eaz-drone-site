# Website analytics

The owner supplied the existing Google Analytics web stream `G-5CK2VV2CZW` in an Analytics screenshot on October 27, 2026. The screenshot showed no website data received yet. This identifier is public configuration, not a credential.

`assets/js/analytics.js` loads the Google tag only after a visitor allows analytics, and only on eazdrones.com or www.eazdrones.com. Local previews never send production analytics. A footer control reopens the choice. Declining stops future analytics, removes accessible GA cookies, and reloads if the Google library was already active. The preference expires after 180 days. The site remains usable when analytics or browser storage is blocked.

The configuration strips query strings/fragments from page addresses, sends only the referring origin, and disables Google signals and advertising personalization. Google Analytics receives page views and the existing four contact-intent events after consent. These actions are not verified leads or bookings. Google Forms submission completion remains outside the website's visibility. No customer contact details, inquiry records, or analytics credentials belong in this public repository.

The privacy page describes the actual setup and links to Google's data-use information. Changes to the account's enhanced measurement, data-sharing, retention, or linked advertising destinations were not made by this website release.

## Validation and reporting

Run `npm test` for page/link/sitemap checks and analytics/event tests. Verify a fresh visitor sends no Google Analytics request before consent, then allow analytics on the live domain and check the tag and page-view/event requests. The stream's Realtime or DebugView should be checked separately to confirm Google received events. A deployed script or a successful HTTP response alone does not establish analytics reporting.

The Windsor account list did not include Google Analytics when this work started. Connect the matching property before automated Analytics reports can run. Existing Search Console reporting is independent and remains available.
