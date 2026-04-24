// ============================================================
//  HOODIES — CENTRAL CONFIG
//  Edit this file only when you need to change keys or settings
// ============================================================

const CONFIG = {
  SUPABASE_URL:      "https://tssmlgwuzlvaroucunbr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzc21sZ3d1emx2YXJvdWN1bmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDYxMjYsImV4cCI6MjA5MjE4MjEyNn0._Yn9zm3qVZN_A_v25HdKgUWRg90Y9BiLl4zV67yu3Ew",

  // Switch to live key when ready: FLWPUBK-59b3f035001471921a4601a258625a3f-X
  FLW_PUBLIC_KEY:    "FLWPUBK_TEST-afcc1c6ccfcbf26f90c285df1f524ce9-X",

  WHATSAPP:          "2348024100995",
  PAYMENT_OPTIONS:   "card, banktransfer, ussd",
  SITE_NAME:         "HOODIES",
  USD_TO_NGN:        1600,
};

// ── CURRENCY HELPERS ─────────────────────────────────────────
function getCurrency() { return localStorage.getItem("hka_currency") || "NGN"; }
function setCurrencyPref(c) {
  localStorage.setItem("hka_currency", c);
  document.querySelectorAll(".cur-btn").forEach(b => b.classList.toggle("active", b.dataset.c === c));
  document.querySelectorAll("[data-ngn]").forEach(el => el.textContent = fmtPrice(+el.dataset.ngn, c));
}
function fmtPrice(ngn, cur) {
  cur = cur || getCurrency();
  return cur === "USD" ? "$" + (ngn / CONFIG.USD_TO_NGN).toFixed(2) : "₦" + ngn.toLocaleString();
}

// ── SUPABASE CLIENT ──────────────────────────────────────────
// One client using the anon key — RLS handles security via auth session
let _sb = null;
function getSB() {
  if (!_sb) _sb = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  return _sb;
}

// ── AUTH HELPERS ─────────────────────────────────────────────
async function getUser() {
  const { data: { user } } = await getSB().auth.getUser();
  return user;
}
async function signOut() {
  await getSB().auth.signOut();
  window.location.href = "login.html";
}

// ── CART ─────────────────────────────────────────────────────
function getCart()          { return JSON.parse(localStorage.getItem("hka_cart") || "[]"); }
function saveCart(c)        { localStorage.setItem("hka_cart", JSON.stringify(c)); updateCartBadge(); }
function addToCart(item)    { const c = getCart(); c.push(item); saveCart(c); }
function removeCartItem(i)  { const c = getCart(); c.splice(i,1); saveCart(c); }
function clearCart()        { localStorage.removeItem("hka_cart"); updateCartBadge(); }
function cartTotal()        { return getCart().reduce((s,i) => s + i.subtotal_ngn, 0); }
function cartCount()        { return getCart().reduce((s,i) => s + i.qty, 0); }
function updateCartBadge()  {
  const n = cartCount();
  document.querySelectorAll(".cart-badge").forEach(el => {
    el.textContent = n; el.style.display = n > 0 ? "inline-flex" : "none";
  });
}

// ── SECURITY ─────────────────────────────────────────────────
function sanitize(s) {
  if (typeof s !== "string") return "";
  return s.replace(/[<>'"&]/g, c => ({"<":"&lt;",">":"&gt;","'":"&#39;",'"':"&quot;","&":"&amp;"}[c]));
}
function isValidEmail(e) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e); }
function isValidPhone(p) { return /^[\d\s+\-()]{10,15}$/.test(p); }

// ── TOAST ─────────────────────────────────────────────────────
function toast(msg, type) {
  let t = document.getElementById("toast");
  if (!t) { t = document.createElement("div"); t.id = "toast"; document.body.appendChild(t); }
  t.className = "toast show" + (type === "error" ? " terror" : "");
  t.textContent = msg;
  clearTimeout(t._t);
  t._t = setTimeout(() => t.classList.remove("show"), 2800);
}

// ── WHATSAPP ─────────────────────────────────────────────────
function waOrder(order) {
  const items = (order.items||[]).map(i => `${i.name} (${i.size}) x${i.qty}`).join(", ");
  const msg = encodeURIComponent(`NEW ORDER\n\nRef: ${order.reference}\nCustomer: ${order.customer_name}\nPhone: ${order.customer_phone}\nAddress: ${order.customer_address}\nItems: ${items}\nTotal: ₦${(order.total_ngn||0).toLocaleString()}`);
  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${msg}`, "_blank");
}
function waProduct(productName) {
  const msg = encodeURIComponent(`Hi, I'm interested in: ${productName}\n\nCan you help me with more details?`);
  window.open(`https://wa.me/${CONFIG.WHATSAPP}?text=${msg}`, "_blank");
}

document.addEventListener("DOMContentLoaded", () => {
  updateCartBadge();
  setCurrencyPref(getCurrency());
});
