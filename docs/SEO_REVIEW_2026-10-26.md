# Organic search implementation review

## State and scope

Repository and deployment rechecked October 26, 2026: `xazzz0/eaz-drone-site`; latest successful Pages run `32222436600` deployed branch `test`, commit `fa8c20e`. PR #5 is open on `seo-aeo-growth`. This work extends that review branch and does not deploy. It executes the regular website SEO prompt; no separate AEO campaign was run.

## Search-informed priorities

The current Search Console review supports improving the existing Pensacola city page and the staged construction and property service paths. Private query/page metrics and comparisons are kept in the owner's separate Organic Search Review, not this public repository. The city page remains the local overview; the service pages explain buyer-specific scope and quoting. No new near-duplicate city pages were created.

The service pages are still staged and have no deployed performance to evaluate. Search data does not establish inquiries, sales, or results caused by these changes.

## Implemented in this follow-up

- Rewrote the existing Pensacola page title, description, main heading, and substantive construction/property sections around observed search intent. Updated its social metadata and service schema to agree with the focused content.
- Added useful descriptive links to the existing staged service pages and published package anchors. Replaced broad technical claims in the rewritten sections with confirmed photography offerings. No published price or package commitment was changed.
- Made the service-page headings describe the actual services. Removed duplicate skip links on those pages.
- Expanded the original roofing example with visible observations and an honest explanation of what it does and does not demonstrate. Linked it from the property and Pensacola pages. No new project, client, permission, or construction history was invented.
- Added a [project write-up workflow](PROJECT_WRITEUP_TEMPLATE.md) and prepared four researched local link opportunities with unsent drafts in the separate owner report.

## Measurement setup and remaining dependency

The existing event bridge is implemented and tested. It supports `click_to_call`, `click_to_email`, `quote_request_click`, and `booking_form_open`. These are intent actions, not completed calls, sent emails, form submissions, or qualified inquiries. Reporting requires a selected GA4 property and a configured tag. The event bridge by itself does not store analytics reports.

Once Andrew supplies the web stream's nonsecret G- measurement ID and selects the property:

1. Configure a single tag for that property on the review branch. Avoid a duplicate existing tag. Configure page-location/referrer handling to avoid forwarding contact details or sensitive query strings. Review actual privacy and consent requirements for the chosen setup.
2. Run page and event checks, inspect tag requests, and verify real events in the selected property's realtime/debug tools. Confirm each click action appears once and navigation still works.
3. Keep click actions separate from an actual lead event. The external Google Form's submission is not observable from this website's iframe. Do not fire `generate_lead` on a form open, page load, or quote click.
4. Reconcile actual form/email inquiries in private business records. Record received date, stated source (unknown when absent), requested service/city, qualified status, quote status, booking status, and recurring agreement status. Do not put customer records in this public repository.

There is no verified qualified-inquiry or signed-recurring-agreement baseline. Do not enter zero for unknown outcomes. The existing form response count is not an attributed SEO lead count.

After deployment, record the actual release date and commit. Compare complete 28-day periods with comparable filters and reporting lag, inspect the same queries and destination pages, and allow several weeks before drawing conclusions. Check whether the city page and new service page share impressions rather than assuming the new page will instantly replace it. Use the existing Growth Manager review cadence, not a new automation.

## Owner actions

Test PR #5 before authorizing a merge. Supply a GA4 web-stream G- ID and connect the matching property if analytics collection is wanted. Confirm real project facts and publication permissions before a case study. Review link-inquiry drafts before any send; memberships and costs require a separate decision. No paid services were started.

## Validation

`npm test` passes for all 15 production pages and three lead-event tests. Browser checks passed for the 15 pages at 1440px and 390px, with no local request failures, broken loaded images, JavaScript errors, or horizontal overflow. Service-specific booking guidance and real-browser lead-event dispatch passed. The revised construction and property headings were visually inspected. Published service pricing was left unchanged. No form submission, phone call, or email was sent.

## Primary references checked

- https://developers.google.com/search/docs/fundamentals/seo-starter-guide
- https://developers.google.com/search/docs/appearance/title-link
- https://developers.google.com/search/docs/crawling-indexing/links-crawlable
- https://developers.google.com/search/docs/essentials/spam-policies

The guidance supports useful original content, descriptive titles and links, accessible pages, and avoiding manipulative link schemes. None guarantees first place.
