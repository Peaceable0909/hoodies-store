// ============================================================
//  HOODIES KINETIC ATELIER — CENTRAL CONFIG
//  Edit this file whenever you need to update keys or settings
// ============================================================

const CONFIG = {

  // ── SUPABASE ─────────────────────────────────────────────
  SUPABASE_URL: "https://tssmlgwuzlvaroucunbr.supabase.co",
  SUPABASE_ANON_KEY: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InRzc21sZ3d1emx2YXJvdWN1bmJyIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY2MDYxMjYsImV4cCI6MjA5MjE4MjEyNn0._Yn9zm3qVZN_A_v25HdKgUWRg90Y9BiLl4zV67yu3Ew",

  // ── FLUTTERWAVE ──────────────────────────────────────────
  // Use TEST keys while testing. Switch to LIVE key when ready to go live:
  // LIVE: FLWPUBK-59b3f035001471921a4601a258625a3f-X
  FLW_PUBLIC_KEY: "FLWPUBK_TEST-afcc1c6ccfcbf26f90c285df1f524ce9-X",

  // ── CURRENCIES ───────────────────────────────────────────
  CURRENCIES: {
    NGN: { symbol: "₦", label: "Nigerian Naira" },
    USD: { symbol: "$", label: "US Dollars" }
  },
  DEFAULT_CURRENCY: "NGN",

  // ── WHATSAPP ─────────────────────────────────────────────
  WHATSAPP_NUMBER: "2348024100995",  // international format, no +

  // ── SITE ─────────────────────────────────────────────────
  SITE_NAME: "HOODIES",
  SITE_TAGLINE: "Kinetic Atelier",

  // ── PAYMENT OPTIONS ──────────────────────────────────────
  PAYMENT_OPTIONS: "card, banktransfer, ussd",

};

// USD to NGN rate (update this periodically)
const USD_TO_NGN = 1600;

function formatPrice(amountNGN, currency) {
  currency = currency || CONFIG.DEFAULT_CURRENCY;
  if (currency === "USD") {
    return "$" + (amountNGN / USD_TO_NGN).toFixed(2);
  }
  return "₦" + amountNGN.toLocaleString();
}
