# VIRASA website

A lightweight, static website for VIRASA’s NFC + QR review card enquiries. It uses HTML, CSS, and vanilla JavaScript; there is no build step, backend, payment processor, analytics or tracking script.

## Project files

```text
VIRASA 17/
├── index.html                 Main landing page, catalogue and enquiry forms
├── styles.css                 Responsive design system and page styles
├── script.js                  Product calculations, validation and WhatsApp flow
├── assets/
│   ├── hero-card-scene.svg     Original illustrative hero mockup
│   ├── product-46.svg          Illustrative 4×6 card mockup
│   ├── product-44.svg          Illustrative 4×4 card mockup
│   ├── product-bundle.svg      Illustrative two-card mockup
│   ├── social-card.svg         Editable social sharing graphic
│   └── favicon.svg             VIRASA typographic brand mark
├── privacy-policy.html        Draft for review
├── terms.html                 Draft for review
├── shipping-policy.html       Draft for review
├── refund-policy.html         Draft for review
├── 404.html                   Not-found page
├── robots.txt                 Domain-independent crawl rule
├── TESTING_REPORT.md          Checks performed and remaining limits
└── tests/smoke.js             Dependency-free JavaScript and link smoke checks
```

The product visuals are custom vector illustrations, **not photographs or verified samples of the supplied cards**. Replace them with approved product photography when available; see “Replacing product visuals” below.

## Preview locally on Windows

1. Open Visual Studio Code. Choose **File → Open Folder…** and select this project folder:

   `C:\Users\Aaryan Sharma\OneDrive\Documents\ChatGPT\VIRASA 17`

2. In VS Code, open **Extensions** from the sidebar (or press `Ctrl+Shift+X`), search for **Live Server**, and install the extension you choose.
3. Open `index.html`. Click **Go Live** in the bottom status bar. Live Server will open the site in your default browser. If it asks for a port, the default is fine.
4. Save changes to `index.html`, `styles.css` or `script.js`; Live Server refreshes the browser after a save. Keep the site’s folder structure intact so relative paths continue to work.
5. You can also open `index.html` directly in a browser. Some browser security features work more consistently through Live Server, so use it when checking links and navigation.

No Node.js, Python, paid hosting or dependencies are required to preview the site.

Node.js is optional. If it is installed and you want to repeat the automated logic and link checks, open a terminal in the project folder and run `node tests/smoke.js`.

## Updating the WhatsApp number

Open `script.js` and edit the `whatsappNumber` value in the `VIRASA_CONFIG` object near the top. Enter country code plus number as digits only, with no `+`, spaces or punctuation. The displayed contact number and all WhatsApp links are generated from that one setting.

The current value is `918090207807` (+91 8090207807). Before launch, click each WhatsApp button and confirm the correct conversation opens. The site prepares a message; a customer must review and send it. No order is submitted or stock reserved by the website itself.

## Updating prices and product options

In `script.js`, edit `singleCardPrice` (currently 599) and `bundlePrice` (currently 899). The landing page’s visible catalogue labels are in `index.html`; update those matching amounts as well. The order summary and WhatsApp message totals are calculated from the JavaScript values. Verify the single-card amount and the bundle amount after any price change.

The product selector supports one 4×6 card, one 4×4 card and bundles with two 4×6 cards, two 4×4 cards or a mixed pair. The quantity field allows 1–10 cards or bundles per enquiry.

## Replacing product visuals

Replace the SVG files in `assets/` with approved product photographs, keeping the same filenames to avoid changing the page. For best results, use compressed WebP or AVIF files sized near the displayed dimensions (hero about 720×620; catalogue images about 560×340), preserve the crop and contrast, and update the file extension in `index.html` if you choose another name. Update each image’s `alt` text to describe the real photo and remove “illustrative mockup” labels only after genuine product photographs are in place. The social graphic is a separate branded illustration in `assets/social-card.svg`.

## Updating the order details

1. Open the site with Live Server and select a catalogue option, or go to **Order now**.
2. Enter a name, business, category and phone number. Choose a product and quantity; the estimated total updates as you change the selection.
3. Enter an HTTPS Google review or Maps URL and a delivery city or area. Try a malformed URL or a plain `http://` link to see the validation message.
4. Continue to WhatsApp. The page prepares a message containing the selections and total. Review it in WhatsApp. To avoid sending a real enquiry during a test, close the WhatsApp tab without pressing Send.
5. The contact enquiry form also prepares a WhatsApp message. It does not store customer data on the site.

Do not test by sending fake or unnecessary personal details to VIRASA. The message is not transmitted until the visitor sends it in WhatsApp.

## Checking mobile layout

In Chrome or Edge, open the local site, press `F12`, then select the **Toggle device toolbar** button. Test widths of 360, 390, 768, 1024 and 1440 pixels. Check the menu, product cards, form summary and footer. Use `Tab`, `Shift+Tab`, `Enter` and `Space` to check keyboard focus and controls. In the browser developer tools, review the **Console** for JavaScript errors and **Network** for missing asset files (404 responses).

If an image is missing, check its spelling and path under `assets/`. If a form or menu stops responding, open the developer tools with `F12`, check **Console**, and confirm `script.js` is saved alongside `index.html`. The files use relative paths, so do not move a single page out of its project folder.

## Configuration checklist before public launch

- [ ] Choose the public domain and replace `YOUR-DOMAIN.example` in the canonical and Open Graph URLs in all HTML pages with the final HTTPS URL.
- [ ] Update or replace `assets/social-card.svg` if the brand’s final social image is different.
- [ ] Replace illustrative card artwork with approved photographs when available.
- [ ] Add the business email and a real response-time expectation; neither has been supplied yet.
- [ ] Confirm supplier availability, product finish, NFC setup, dynamic QR subscription/service duration, QR change process, and whether NFC and QR destinations can be updated separately.
- [ ] Confirm custom branding capability and any related price.
- [ ] Confirm delivery area, courier/fulfilment method, charges and expected timing.
- [ ] Confirm payment options, order acceptance, cancellation, refund, replacement and support terms.
- [ ] Complete the policy drafts with the legal seller identity, appropriate contact details and actual business practices; obtain suitable review before publication.
- [ ] Confirm that the WhatsApp number and click-to-chat link are correct.
- [ ] After the public domain is selected, create `sitemap.xml`, include its full URL in `robots.txt`, and verify both live URLs.

The `sitemap.xml` is intentionally not included yet because the public domain has not been chosen. The policy pages are conspicuously marked as drafts and need review before use as final terms.

