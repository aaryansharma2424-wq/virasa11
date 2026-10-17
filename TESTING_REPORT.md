# VIRASA website testing report

Checks run on 17 October 2026 after the implementation was completed.

## Verified with the dependency-free smoke checks

`node tests/smoke.js` passes. It checks the product pricing and calculation functions, mixed bundle sizes, quantity multiplication, WhatsApp destination and URL-encoded message, optional fields, HTTPS/contact-number validation, duplicate page IDs, form label targets, catalogue WhatsApp links, and all local page, stylesheet, script and image references.

`node --check script.js` passes. The smoke check also scans all project text files for trailing whitespace; `git diff --check` is clean.

| Check | Result | Evidence / limit |
|---|---|---|
| One 4×6 card | Pass | Smoke check: ₹599 |
| One 4×4 card | Pass | Smoke check: ₹599 |
| Two-card bundle | Pass | Smoke check: ₹899 |
| Mixed-size bundle | Pass | Smoke check: `4×6 + 4×4`, total ₹899 |
| Quantity multiplication | Pass | Two bundles total ₹1,798 |
| Order-message fields and optional fields | Pass | Generated message includes selections and omits empty optional fields |
| WhatsApp address and URL encoding | Pass | Destination resolves to `https://wa.me/918090207807`; decoded query matches generated message |
| URL validation | Pass | Accepts HTTPS; rejects HTTP and `javascript:` URLs |
| Contact-number validation | Pass | Accepts a normal +91 number; rejects a short number |
| Local page and asset links | Pass | Smoke check found no missing local targets or anchors |
| JavaScript syntax | Pass | `node --check script.js` |
| Whitespace check | Pass | Smoke check scans project text files; `git diff --check` is also clean |

## Browser checks not completed

I could not perform the visual/browser checks in this environment. The in-app browser timed out when opening the local preview server, and it rejected the `file://` page under its URL policy. I stopped browser attempts at that boundary.

As a result, the following still need a manual pass in Live Server: menu and FAQ interaction in the rendered browser, visual layout and overflow at 360, 390, 768, 1024 and 1440 pixels, image rendering, keyboard/focus appearance, reduced-motion behavior, and browser-console inspection. See the README for the local preview steps.

## Implementation limits and launch configuration

- The site has no backend, order database, checkout or payment processing. The order form prepares a WhatsApp message; the visitor must send it and VIRASA must confirm the order manually.
- Supplier-dependent details remain unverified: product finish, NFC/QR destination settings, dynamic QR subscription and change policy, and custom branding.
- Delivery availability, charges, timing, payment options, response time and business email were not provided.
- Privacy, terms, shipping and cancellation/refund pages are drafts. Complete and review them for the business’s actual practices before publication.
- The public domain is unknown. Canonical and Open Graph URLs use `YOUR-DOMAIN.example`; create a sitemap after the domain is final.
- The product images are illustrative vector mockups, not photographs of the supplied product.
