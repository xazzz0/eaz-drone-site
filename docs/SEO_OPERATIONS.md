# SEO and local visibility operations

## Source and deployment

The live site uses `xazzz0/eaz-drone-site`, branch `test`. The most recent successful GitHub Pages run inspected on October 26, 2026 was [32222436600](https://github.com/xazzz0/eaz-drone-site/actions/runs/32222436600), deploying commit `fa8c20ed06ea167faac74a018832ea4e99c2050e`. Its domain file points to `www.eazdrones.com`, and its page content matches the live website. The similarly named `eaz-drone-site-test` repository has older deployments and is not the source used for this work.

`seo-aeo-growth` is based on that deployed `test` commit. Review changes against `test`, not the older `main` branch. Do not push directly to `test`, merge the unrelated existing Test PR, change the default branch, or alter Pages settings as part of this work. Merging this work into `test` can publish it, so review locally first.

## Local checks and preview

Run `npm test` with Node.js 18 or newer. The validation and event tests use Node built-ins and do not require installing the image-processing dependencies. The existing optional image pipeline still uses Sharp.

The checks cover production-page metadata, canonical URLs, a single main heading, JSON-LD syntax, duplicate IDs, local links and anchors, image srcsets, CSS image/font dependencies, and matching XML/text sitemaps. Event tests verify lead-intent classification, optional analytics integration, and exclusion of query strings and contact details from the event payload.

For local review, serve the repository root using `python3 -m http.server 8000` (Windows: `py -m http.server 8000`) and open `http://localhost:8000/`. Check the home page and both new pages:

- `/pages/construction-progress.html`
- `/pages/real-estate-photography.html`

Follow each quote button to verify the relevant project checklist appears. Check at desktop and phone widths. Open the Google Form from the booking page without sending a test inquiry to the business unless intentionally testing receipt.

The Site checks workflow runs `npm test` on pushes and PRs. It does not publish the website or change hosting settings. The existing PowerShell build preserves the event script and shared footer links.

## Content standards

Priority work is recurring construction-progress coverage and real estate/vacation-rental media in Navarre, Gulf Breeze, Pensacola, and Pensacola Beach. Aerial photos/video and ground interior/exterior photography are confirmed offerings.

The current original-work example is roofing documentation supplied by EAZ Drones, not a completed construction-progress project. Preserve that label. Add a construction case study only after a real project exists and permission to show it is established. Do not imply that stock service imagery shows EAZ client work.

The city pages describe service coverage under one business identity, not separate offices. Homepage business coordinates were removed because a precise public business location was not verified. Do not insert invented office addresses, project counts, reviews, or technical accuracy claims.

Published service prices, package quantities, and turnaround commitments were preserved in this change. Check them with the owner before advertising a new offer or changing scope. Existing technical claims such as thermal capture, RTK/GCP accuracy, and mapping products should be confirmed independently before new promotion.

## Measurement

The event bridge forwards these actions to an already configured `gtag` or `dataLayer`, and exposes `eaz:lead-action` for local QA:

| Event | Meaning |
| --- | --- |
| `click_to_call` | A telephone link was clicked, not proof of a completed call |
| `click_to_email` | An email link was clicked, not proof of a sent message |
| `quote_request_click` | A visitor followed a link to the booking page |
| `booking_form_open` | A visitor followed a link to the external Google Form |

No analytics property or backend collector is installed by this change. Without a configured analytics tag, these events are not stored in a reporting service. No full page URL, contact details, or mailto body is included. External Google Form completion cannot be inferred from a click or iframe load. Count actual form responses, qualified inquiries, and recurring agreements from verified records separately.

After a GA4 property is selected and the tag is configured, confirm real events in its debugging/realtime tools before reporting conversions. Review the site's actual privacy requirements before adding new tracking.

## Review cadence

Use the existing EAZ Drones Growth Manager, not a duplicate schedule. Monday reviews compare the latest complete 28-day search window with the previous 28 days, then prepare the highest-value supported improvement on an isolated branch. Friday reviews distinguish changes prepared, deployed changes, observed search clicks, lead-intent events, actual inquiries, and signed recurring business.

Keep profile descriptions, service lists, public contact details, and service pages consistent. Recheck Google Business Profile pending edits and post moderation state before claiming public visibility. Avoid repeating posts or changing location/category settings casually. AEO work follows current search-engine guidance; no special file or markup guarantees AI recommendations.

Additional paid services are not enabled by this change. The additional monthly budget ceiling is $25, with no purchase authorized solely by that ceiling.

## Primary technical references

- [Google AI features and websites](https://developers.google.com/search/docs/appearance/ai-features)
- [Google LocalBusiness structured data](https://developers.google.com/search/docs/appearance/structured-data/local-business)
- [Google guidance on generative AI content](https://developers.google.com/search/docs/fundamentals/using-gen-ai-content)

The existing Anton, Inter, and JetBrains Mono typefaces are self-hosted to remove the external font stylesheet request. Their licenses are included in `assets/fonts`.
