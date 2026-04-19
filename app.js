// ============================================================
//  APP.JS — Cart, utilities, security, currency switcher
// ============================================================

// ── CART (localStorage) ──────────────────────────────────────
function getCart() { return JSON.parse(localStorage.getItem("hka_cart")) || []; }
function saveCart(c) { localStorage.setItem("hka_cart", JSON.stringify(c)); }
function addToCart(item) { const c = getCart(); c.push(item); saveCart(c); updateCartBadge(); }
function removeFromCart(i) { const c = getCart(); c.splice(i, 1); saveCart(c); updateCartBadge(); }
function clearCart() { localStorage.removeItem("hka_cart"); updateCartBadge(); }
function getCartTotal() { return getCart().reduce((s, i) => s + i.subtotal_ngn, 0); }
function getCartCount() { return getCart().reduce((s, i) => s + i.qty, 0); }

function updateCartBadge() {
  const n = getCartCount();
  document.querySelectorAll(".cart-badge").forEach(el => {
    el.textContent = n;
    el.style.display = n > 0 ? "inline-block" : "none";
  });
}

// ── CURRENCY ─────────────────────────────────────────────────
function getCurrentCurrency() {
  return localStorage.getItem("hka_currency") || CONFIG.DEFAULT_CURRENCY;
}
function setCurrency(c) {
  localStorage.setItem("hka_currency", c);
  document.querySelectorAll(".price-display").forEach(el => {
    const ngn = parseFloat(el.dataset.ngn);
    if (!isNaN(ngn)) el.textContent = formatPrice(ngn, c);
  });
  document.querySelectorAll(".currency-btn").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.currency === c);
  });
}

// ── TOAST ────────────────────────────────────────────────────
function showToast(msg, type) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  t.className = "toast show" + (type === "error" ? " toast-error" : "");
  clearTimeout(t._timer);
  t._timer = setTimeout(() => t.classList.remove("show"), 2500);
}

// ── SECURITY: Input sanitization ─────────────────────────────
function sanitize(str) {
  if (typeof str !== "string") return "";
  return str.replace(/[<>'"&]/g, c => ({ "<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;","&":"&amp;" }[c]));
}

function validateEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function validatePhone(p) { return /^[\d\s\+\-]{10,15}$/.test(p); }

// ── WHATSAPP ORDER NOTIFICATION ──────────────────────────────
function sendWhatsAppAlert(order) {
  const items = order.items.map(i => `${i.name} (${i.size}) x${i.qty}`).join(", ");
  const msg = encodeURIComponent(
    `🛍 NEW ORDER!\n\nRef: ${order.reference}\nCustomer: ${order.customer_name}\nPhone: ${order.customer_phone}\nAddress: ${order.customer_address}\n\nItems: ${items}\n\nTotal: ₦${order.total_ngn.toLocaleString()}`
  );
  window.open(`https://wa.me/${CONFIG.WHATSAPP_NUMBER}?text=${msg}`, "_blank");
}

// ── INIT ─────────────────────────────────────────────────────
document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  // Apply saved currency
  const saved = getCurrentCurrency();
  setTimeout(() => setCurrency(saved), 100);
});
