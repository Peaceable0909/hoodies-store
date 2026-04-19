// ============================================================
//  SUPABASE DATABASE LAYER
//  Handles all reads/writes to the database
// ============================================================

// Load Supabase client (included via CDN in HTML)
let _supabase = null;

function getSupabase() {
  if (!_supabase) {
    _supabase = supabase.createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
  }
  return _supabase;
}

// ── PRODUCTS ─────────────────────────────────────────────────

async function dbGetProducts(category) {
  const sb = getSupabase();
  let query = sb.from("products").select("*").eq("active", true).order("created_at", { ascending: false });
  if (category && category !== "all") {
    query = query.eq("category", category);
  }
  const { data, error } = await query;
  if (error) { console.error("DB products error:", error); return []; }
  return data || [];
}

async function dbGetProduct(id) {
  const sb = getSupabase();
  const { data, error } = await sb.from("products").select("*").eq("id", id).single();
  if (error) { console.error("DB product error:", error); return null; }
  return data;
}

async function dbSaveProduct(product) {
  const sb = getSupabase();
  if (product.id) {
    const { data, error } = await sb.from("products").update(product).eq("id", product.id).select().single();
    if (error) throw error;
    return data;
  } else {
    const { data, error } = await sb.from("products").insert(product).select().single();
    if (error) throw error;
    return data;
  }
}

async function dbDeleteProduct(id) {
  const sb = getSupabase();
  // Soft delete — set active = false
  const { error } = await sb.from("products").update({ active: false }).eq("id", id);
  if (error) throw error;
}

// ── ORDERS ───────────────────────────────────────────────────

async function dbSaveOrder(order) {
  const sb = getSupabase();
  const { data, error } = await sb.from("orders").insert(order).select().single();
  if (error) { console.error("DB save order error:", error); throw error; }
  return data;
}

async function dbGetOrders() {
  const sb = getSupabase();
  const { data, error } = await sb.from("orders").select("*").order("created_at", { ascending: false });
  if (error) { console.error("DB orders error:", error); return []; }
  return data || [];
}

async function dbUpdateOrderStatus(id, status) {
  const sb = getSupabase();
  const { error } = await sb.from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// ── SEED DEFAULT PRODUCTS (run once from admin) ──────────────

async function dbSeedProducts() {
  const defaults = [
    {
      name: "Signature Custom Hoodie",
      category: "hoodies",
      price_ngn: 15000,
      emoji: "🧥",
      description: "450GSM heavyweight cotton. Structured box-fit. Embroidery ready. Ships in 3–5 days.",
      colors: JSON.stringify(["#1a1a1a","#2563eb","#c0392b","#27ae60","#d4c8a8","#8e44ad","#f59e0b","#ffffff"]),
      sizes: JSON.stringify(["S","M","L","XL","XXL"]),
      active: true,
      featured: true
    },
    {
      name: "Kinetic Oversized Hoodie",
      category: "hoodies",
      price_ngn: 45000,
      emoji: "🧥",
      description: "400gsm French terry. Oversized drop-shoulder. Ribbed cuffs and hem.",
      colors: JSON.stringify(["#1a1a1a","#2563eb","#8e44ad","#c0392b"]),
      sizes: JSON.stringify(["S","M","L","XL","XXL"]),
      active: true,
      featured: false
    },
    {
      name: "Atelier Piqué Polo",
      category: "polos",
      price_ngn: 25000,
      emoji: "👕",
      description: "240gsm pique. Woven collar. Chest logo or full-back print. Corporate ready.",
      colors: JSON.stringify(["#ffffff","#1a1a1a","#2563eb","#c0392b","#27ae60"]),
      sizes: JSON.stringify(["S","M","L","XL","XXL"]),
      active: true,
      featured: true
    },
    {
      name: "Performance Polo",
      category: "polos",
      price_ngn: 9000,
      emoji: "👕",
      description: "Moisture-wicking polyester. Breathable. Great for sports teams.",
      colors: JSON.stringify(["#1a1a1a","#2563eb","#c0392b","#27ae60","#ffffff"]),
      sizes: JSON.stringify(["S","M","L","XL","XXL"]),
      active: true,
      featured: false
    },
    {
      name: "Atelier Sculpt Tracksuit",
      category: "tracksuits",
      price_ngn: 25000,
      emoji: "🩱",
      description: "Jacket + trousers. 4-way stretch. Sublimation or embroidery print.",
      colors: JSON.stringify(["#1a1a1a","#d4c8a8","#2563eb","#c0392b"]),
      sizes: JSON.stringify(["S","M","L","XL","XXL"]),
      active: true,
      featured: true
    },
    {
      name: "Kinetic Snapback Cap",
      category: "caps",
      price_ngn: 6000,
      emoji: "🧢",
      description: "Flat brim. 6-panel. Front embroidery up to 10,000 stitches.",
      colors: JSON.stringify(["#1a1a1a","#ffffff","#c0392b","#2563eb","#f59e0b"]),
      sizes: JSON.stringify(["One Size"]),
      active: true,
      featured: false
    },
    {
      name: "Core Dad Cap",
      category: "caps",
      price_ngn: 5000,
      emoji: "🎩",
      description: "Unstructured soft crown. Curved brim. Embroidered front.",
      colors: JSON.stringify(["#d4c8a8","#1a1a1a","#f59e0b","#27ae60"]),
      sizes: JSON.stringify(["One Size"]),
      active: true,
      featured: false
    }
  ];

  const sb = getSupabase();
  const { error } = await sb.from("products").insert(defaults);
  if (error) throw error;
  return true;
}
