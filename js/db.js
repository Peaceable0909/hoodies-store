// ============================================================
//  DB.JS — All Supabase database operations
// ============================================================

// ── PRODUCTS ─────────────────────────────────────────────────
async function dbProducts(category) {
  let q = getSB().from("products").select("*").eq("active", true).order("created_at", { ascending: false });
  if (category && category !== "all") q = q.eq("category", category);
  const { data, error } = await q;
  if (error) { console.error(error); return []; }
  return data || [];
}

async function dbProduct(id) {
  const { data, error } = await getSB().from("products").select("*").eq("id", id).single();
  if (error) { console.error(error); return null; }
  return data;
}

async function dbSaveProduct(p) {
  const sb = getSB();
  if (p.id) {
    const { data, error } = await sb.from("products").update(p).eq("id", p.id).select().single();
    if (error) throw error; return data;
  } else {
    const { data, error } = await sb.from("products").insert(p).select().single();
    if (error) throw error; return data;
  }
}

async function dbDeleteProduct(id) {
  const { error } = await getSB().from("products").update({ active: false }).eq("id", id);
  if (error) throw error;
}

// ── ORDERS ───────────────────────────────────────────────────
async function dbSaveOrder(order) {
  const { data, error } = await getSB().from("orders").insert(order).select().single();
  if (error) throw error; return data;
}

async function dbOrders(filters) {
  let q = getSB().from("orders").select("*").order("created_at", { ascending: false });
  if (filters?.status && filters.status !== "all") q = q.eq("status", filters.status);
  if (filters?.limit) q = q.limit(filters.limit);
  const { data, error } = await q;
  if (error) { console.error(error); return []; }
  return data || [];
}

async function dbUpdateOrderStatus(id, status) {
  const { error } = await getSB().from("orders").update({ status, updated_at: new Date().toISOString() }).eq("id", id);
  if (error) throw error;
}

// ── CUSTOMERS ────────────────────────────────────────────────
async function dbCustomers() {
  const { data, error } = await getSB().from("customers").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// ── CLOSET (saved items per user) ───────────────────────────
async function dbClosetAdd(userId, productId) {
  const { error } = await getSB().from("closet").insert({ user_id: userId, product_id: productId });
  if (error && error.code !== "23505") throw error; // ignore duplicate
}

async function dbClosetGet(userId) {
  const { data, error } = await getSB()
    .from("closet").select("*, products(*)").eq("user_id", userId);
  if (error) { console.error(error); return []; }
  return data || [];
}

async function dbClosetRemove(userId, productId) {
  const { error } = await getSB().from("closet")
    .delete().eq("user_id", userId).eq("product_id", productId);
  if (error) throw error;
}

// ── CUSTOM DESIGN REQUESTS ───────────────────────────────────
async function dbSaveDesignRequest(req) {
  const { data, error } = await getSB().from("design_requests").insert(req).select().single();
  if (error) throw error; return data;
}

async function dbDesignRequests() {
  const { data, error } = await getSB().from("design_requests").select("*").order("created_at", { ascending: false });
  if (error) { console.error(error); return []; }
  return data || [];
}

// ── IMAGE UPLOAD ─────────────────────────────────────────────
async function uploadImage(file, bucket, folder) {
  const ext  = file.name.split(".").pop();
  const name = `${folder}/${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
  const { error } = await getSB().storage.from(bucket).upload(name, file, { cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = getSB().storage.from(bucket).getPublicUrl(name);
  return data.publicUrl;
}

// ── ANALYTICS ────────────────────────────────────────────────
async function dbAnalytics() {
  const [orders, products, customers] = await Promise.all([
    dbOrders({}), dbProducts(), dbCustomers()
  ]);

  const paid    = orders.filter(o => o.status === "paid" || o.status === "completed" || o.status === "shipped");
  const revenue = paid.reduce((s,o) => s + (o.total_ngn || 0), 0);
  const avgOrder = paid.length ? Math.round(revenue / paid.length) : 0;

  // Category popularity
  const catCount = {};
  orders.forEach(o => {
    (o.items || []).forEach(i => { catCount[i.category || "other"] = (catCount[i.category || "other"] || 0) + i.qty; });
  });

  // Revenue last 30 days by day
  const now   = new Date();
  const days  = Array.from({ length: 30 }, (_, i) => {
    const d = new Date(now); d.setDate(d.getDate() - (29 - i));
    return d.toISOString().slice(0, 10);
  });
  const revByDay = {};
  days.forEach(d => revByDay[d] = 0);
  paid.forEach(o => {
    const d = (o.created_at || "").slice(0, 10);
    if (revByDay[d] !== undefined) revByDay[d] += (o.total_ngn || 0);
  });

  return { revenue, avgOrder, totalOrders: orders.length, totalCustomers: customers.length,
           catCount, revByDay, days, orders, products, customers };
}

// ── SEED DEFAULT PRODUCTS ────────────────────────────────────
async function dbSeed() {
  const defaults = [
    { name:"Signature Custom Hoodie", category:"hoodies", price_ngn:15000, description:"450GSM heavyweight cotton. Structured box-fit. Embroidery ready.", colors:JSON.stringify(["#1a1a1a","#5b21b6","#2563eb","#c0392b","#27ae60","#f59e0b","#ffffff"]), sizes:JSON.stringify(["S","M","L","XL","XXL"]), active:true, featured:true, image_url:null, mannequin_url:null },
    { name:"Kinetic Oversized Hoodie", category:"hoodies", price_ngn:45000, description:"400gsm French terry. Oversized drop-shoulder. Ribbed cuffs.", colors:JSON.stringify(["#1a1a1a","#5b21b6","#c0392b"]), sizes:JSON.stringify(["S","M","L","XL","XXL"]), active:true, featured:false, image_url:null, mannequin_url:null },
    { name:"Atelier Piqué Polo", category:"polos", price_ngn:25000, description:"240gsm pique. Woven collar. Corporate and event ready.", colors:JSON.stringify(["#ffffff","#1a1a1a","#2563eb","#c0392b","#27ae60"]), sizes:JSON.stringify(["S","M","L","XL","XXL"]), active:true, featured:true, image_url:null, mannequin_url:null },
    { name:"Atelier Sculpt Tracksuit", category:"tracksuits", price_ngn:25000, description:"Jacket + trousers. 4-way stretch. Sublimation print.", colors:JSON.stringify(["#1a1a1a","#d4c8a8","#2563eb","#c0392b"]), sizes:JSON.stringify(["S","M","L","XL","XXL"]), active:true, featured:true, image_url:null, mannequin_url:null },
    { name:"Kinetic Snapback Cap", category:"caps", price_ngn:6000, description:"Flat brim. 6-panel. Front embroidery up to 10,000 stitches.", colors:JSON.stringify(["#1a1a1a","#ffffff","#c0392b","#2563eb"]), sizes:JSON.stringify(["One Size"]), active:true, featured:false, image_url:null, mannequin_url:null },
    { name:"Performance Gym Set", category:"gymwear", price_ngn:18000, description:"Moisture-wicking. 4-way stretch. Engineered for movement.", colors:JSON.stringify(["#1a1a1a","#5b21b6","#27ae60","#c0392b"]), sizes:JSON.stringify(["XS","S","M","L","XL"]), active:true, featured:false, image_url:null, mannequin_url:null },
  ];
  const { error } = await getSB().from("products").insert(defaults);
  if (error) throw error;
  return true;
}
