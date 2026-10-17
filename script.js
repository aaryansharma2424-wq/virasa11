/* Update the WhatsApp number here. Use digits only: country code + local number. */
const VIRASA_CONFIG = Object.freeze({
  whatsappNumber: "918090207807",
  singleCardPrice: 599,
  bundlePrice: 899,
  currencySymbol: "₹"
});

const formatINR = (amount) => `${VIRASA_CONFIG.currencySymbol}${Number(amount).toLocaleString("en-IN")}`;
const get = (selector, root = document) => root.querySelector(selector);
const getAll = (selector, root = document) => [...root.querySelectorAll(selector)];

function whatsappUrl(message = "") {
  const url = new URL(`https://wa.me/${VIRASA_CONFIG.whatsappNumber}`);
  if (message) url.searchParams.set("text", message);
  return url.toString();
}

function setWhatsAppLinks() {
  getAll("[data-whatsapp-link]").forEach((link) => {
    const product = link.dataset.whatsappProduct;
    const message = product
      ? `Hello VIRASA, I would like to enquire about ${product}. Please confirm availability and delivery details.`
      : "Hello VIRASA, I would like to enquire about NFC + QR review cards.";
    link.href = whatsappUrl(message);
  });
  const whatsappDisplay = `+${VIRASA_CONFIG.whatsappNumber.slice(0, 2)} ${VIRASA_CONFIG.whatsappNumber.slice(2)}`;
  getAll("[data-whatsapp-display]").forEach((node) => {
    node.textContent = whatsappDisplay;
  });
}

function closeMobileMenu() {
  const menu = get("#primary-nav");
  const toggle = get(".menu-toggle");
  if (!menu || !toggle) return;
  menu.classList.remove("is-open");
  toggle.setAttribute("aria-expanded", "false");
  toggle.setAttribute("aria-label", "Open navigation menu");
}

function setupNavigation() {
  const menu = get("#primary-nav");
  const toggle = get(".menu-toggle");
  if (!menu || !toggle) return;
  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    toggle.setAttribute("aria-label", isOpen ? "Open navigation menu" : "Close navigation menu");
    menu.classList.toggle("is-open", !isOpen);
  });
  menu.addEventListener("click", (event) => {
    if (event.target.closest("a")) closeMobileMenu();
  });
  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeMobileMenu();
  });
  window.addEventListener("resize", () => {
    if (window.innerWidth > 820) closeMobileMenu();
  });
}

const orderFields = {
  form: get("#order-form"),
  product: get("#product-type"),
  sizeOne: get("#first-size"),
  sizeTwo: get("#second-size"),
  sizeTwoWrap: get("#second-size-field"),
  quantity: get("#quantity"),
  reviewUrl: get("#review-url"),
  customerPhone: get("#customer-phone"),
  summaryProduct: get("#summary-product"),
  summaryUnitLabel: get("#summary-unit-label"),
  summaryUnitPrice: get("#summary-unit-price"),
  summaryTotal: get("#summary-total"),
  urlError: get("#url-error"),
  status: get("#order-status")
};

const sizeLabel = (value) => value === "44" ? "4×4" : "4×6";

function readOrderSelection() {
  const isBundle = orderFields.product.value === "bundle";
  const quantity = Math.min(10, Math.max(1, Number.parseInt(orderFields.quantity.value, 10) || 1));
  const firstSize = orderFields.sizeOne.value;
  const secondSize = orderFields.sizeTwo.value;
  const unitPrice = isBundle ? VIRASA_CONFIG.bundlePrice : VIRASA_CONFIG.singleCardPrice;
  const sizes = isBundle ? `${sizeLabel(firstSize)} + ${sizeLabel(secondSize)}` : sizeLabel(firstSize);
  const productName = isBundle ? "Two-card bundle" : `${sizeLabel(firstSize)} review card`;
  return { isBundle, quantity, firstSize, secondSize, unitPrice, total: unitPrice * quantity, sizes, productName };
}

function updateOrderSummary() {
  if (!orderFields.form) return;
  const selection = readOrderSelection();
  orderFields.sizeTwoWrap.hidden = !selection.isBundle;
  orderFields.sizeTwo.disabled = !selection.isBundle;
  orderFields.sizeTwo.required = selection.isBundle;
  orderFields.summaryProduct.textContent = selection.isBundle
    ? `${selection.quantity} × two-card bundle (${selection.sizes})`
    : `${selection.quantity} × ${selection.productName}`;
  orderFields.summaryUnitLabel.textContent = selection.isBundle ? "Unit price · per two-card bundle" : "Unit price · per card";
  orderFields.summaryUnitPrice.textContent = formatINR(selection.unitPrice);
  orderFields.summaryTotal.textContent = formatINR(selection.total);
}

function validateHttpsUrl(input, errorNode) {
  const value = input.value.trim();
  let message = "";
  if (!value) {
    message = "Enter the Google review or Maps URL you want customers to reach.";
  } else {
    try {
      const parsed = new URL(value);
      if (parsed.protocol !== "https:" || !parsed.hostname.includes(".")) {
        message = "Enter a valid HTTPS link, including its domain.";
      }
    } catch {
      message = "Enter a complete link, such as https://...";
    }
  }
  input.setCustomValidity(message);
  input.setAttribute("aria-invalid", String(Boolean(message)));
  if (errorNode) errorNode.textContent = message;
  return !message;
}

function validateContactNumber(input) {
  const digits = input.value.replace(/\D/g, "");
  const message = digits.length < 8 || digits.length > 15
    ? "Enter a phone number with 8 to 15 digits, including country code if needed."
    : "";
  input.setCustomValidity(message);
  input.setAttribute("aria-invalid", String(Boolean(message)));
  return !message;
}

function buildOrderMessage() {
  const formData = new FormData(orderFields.form);
  const selection = readOrderSelection();
  const lines = [
    "Hello VIRASA! I would like to enquire about an NFC + QR review card.",
    "",
    `Name: ${formData.get("customerName").trim()}`,
    `Business: ${formData.get("businessName").trim()}`,
    `Category: ${formData.get("businessCategory")}`,
    `WhatsApp contact: ${formData.get("customerPhone").trim()}`,
    `Product: ${selection.productName}`,
    `Card sizes: ${selection.sizes}`,
    `Quantity: ${selection.quantity}${selection.isBundle ? ` bundle${selection.quantity === 1 ? "" : "s"} (${selection.quantity * 2} cards total)` : ` card${selection.quantity === 1 ? "" : "s"}`}`,
    `Unit price: ${formatINR(selection.unitPrice)}${selection.isBundle ? " per two-card bundle" : " per card"}`,
    `Estimated total: ${formatINR(selection.total)}`,
    `Google review URL: ${formData.get("reviewUrl").trim()}`,
    `Delivery area: ${formData.get("deliveryArea").trim()}`
  ];
  const customisation = formData.get("customisation").trim();
  const additionalMessage = formData.get("additionalMessage").trim();
  if (customisation) lines.push(`Customisation requirements: ${customisation}`);
  if (additionalMessage) lines.push(`Additional message: ${additionalMessage}`);
  lines.push("", "Please confirm availability, delivery charges and expected delivery time.");
  lines.push("I understand the order is confirmed only after VIRASA replies.");
  return lines.join("\n");
}

function openWhatsAppMessage(message) {
  const link = document.createElement("a");
  link.href = whatsappUrl(message);
  link.target = "_blank";
  link.rel = "noopener noreferrer";
  link.setAttribute("aria-hidden", "true");
  link.tabIndex = -1;
  document.body.append(link);
  link.click();
  link.remove();
}

function submitToWhatsApp(form, statusNode, message) {
  statusNode.textContent = "";
  const invalid = form.querySelector(":invalid");
  if (invalid) {
    form.reportValidity();
    statusNode.textContent = "Please check the highlighted fields and try again.";
    return false;
  }
  openWhatsAppMessage(message);
  statusNode.textContent = "WhatsApp should open in a new tab or app. Review the message and send it to contact VIRASA.";
  return true;
}

function setupOrderForm() {
  if (!orderFields.form) return;
  [orderFields.product, orderFields.sizeOne, orderFields.sizeTwo, orderFields.quantity].forEach((field) => {
    field.addEventListener("input", updateOrderSummary);
    field.addEventListener("change", updateOrderSummary);
  });
  orderFields.reviewUrl.addEventListener("input", () => validateHttpsUrl(orderFields.reviewUrl, orderFields.urlError));
  orderFields.customerPhone.addEventListener("input", () => validateContactNumber(orderFields.customerPhone));
  updateOrderSummary();

  getAll("[data-select-product]").forEach((button) => {
    button.addEventListener("click", () => {
      const bundle = button.dataset.selectProduct === "bundle";
      orderFields.product.value = bundle ? "bundle" : "single";
      if (button.dataset.cardSize) orderFields.sizeOne.value = button.dataset.cardSize;
      updateOrderSummary();
      get("#order").scrollIntoView({ behavior: matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth" });
      window.setTimeout(() => get("#product-type").focus({ preventScroll: true }), 250);
    });
  });

  orderFields.form.addEventListener("submit", (event) => {
    event.preventDefault();
    validateHttpsUrl(orderFields.reviewUrl, orderFields.urlError);
    validateContactNumber(orderFields.customerPhone);
    if (!submitToWhatsApp(orderFields.form, orderFields.status, buildOrderMessage())) {
      const invalidField = orderFields.form.querySelector(":invalid");
      if (invalidField) invalidField.focus();
    }
  });
}

function setupEnquiryForm() {
  const form = get("#enquiry-form");
  if (!form) return;
  const phone = get("#enquiry-phone");
  const status = get("#enquiry-status");
  phone.addEventListener("input", () => validateContactNumber(phone));
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    validateContactNumber(phone);
    const data = new FormData(form);
    const message = [
      "Hello VIRASA! I have a business enquiry.",
      "",
      `Name: ${data.get("name").trim()}`,
      `Business: ${data.get("business").trim()}`,
      `WhatsApp contact: ${data.get("phone").trim()}`,
      `Enquiry: ${data.get("message").trim()}`
    ].join("\n");
    if (submitToWhatsApp(form, status, message)) form.reset();
  });
}

function setupDemo() {
  const dialog = get("#demo-dialog");
  if (!dialog) return;
  get("[data-open-demo]")?.addEventListener("click", () => dialog.showModal());
  getAll("[data-close-demo]", dialog).forEach((button) => button.addEventListener("click", () => dialog.close()));
  dialog.addEventListener("click", (event) => {
    if (event.target === dialog) dialog.close();
  });
}

setWhatsAppLinks();
setupNavigation();
setupOrderForm();
setupEnquiryForm();
setupDemo();
const yearNode = get("#copyright-year");
if (yearNode) yearNode.textContent = String(new Date().getFullYear());
