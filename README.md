

---

## STEP 1 — Set Up Your Database (do this first)

1. Go to https://supabase.com and log in
2. Open your project: tssmlgwuzlvaroucunbr
3. Click **SQL Editor** in the left sidebar
4. Click **New Query**
5. Open the file `setup.sql` from this folder
6. Copy ALL the contents and paste into the SQL editor
7. Click **Run** (green button)
8. You should see "Success. No rows returned"

That creates your products and orders tables.

---

## STEP 2 — Fix Supabase Permissions (important)

Because your admin dashboard reads ALL products (including hidden ones), you need to allow that:

1. In Supabase, go to **Table Editor → products**
2. Click the **RLS** button at the top right
3. Add a new policy:
   - Policy name: `Admin can read all products`
   - Target roles: Leave empty (applies to anon)
   - Using expression: `true`
   - For operation: SELECT
4. Save the policy

Alternatively, the simplest approach: go to **Authentication → Policies → products** and temporarily disable RLS for development, then re-enable it when you go live.

---

## STEP 3 — Deploy to GitHub Pages

1. Create a GitHub account at github.com (free)
2. Click **New Repository**
3. Name it: `hoodies-store`
4. Make it **Public**
5. Upload ALL these files keeping the same folder structure
6. Go to **Settings → Pages**
7. Source: Deploy from branch → main → / (root)
8. Click Save
9. Your site goes live at: `https://YOURUSERNAME.github.io/hoodies-store`

---

## STEP 4 — Add Your Products

1. Go to `yoursite.com/admin/login.html`
2. Enter password: `Peaceable@Son`
3. Click **Products** in the sidebar
4. Click **Seed Default Products** to add the starter catalog
5. Edit any product to change prices, colors, or sizes
6. Click **Add New Product** to add your own items

To update a product later:
- Go to Admin → Products → Edit
- Change whatever you need
- Click Save — it updates instantly on your store

---

## STEP 5 — Switch to LIVE Payments

When you're ready to take real money:

1. Open `js/config.js`
2. Change `FLW_PUBLIC_KEY` from:
   `FLWPUBK_TEST-afcc1c6ccfcbf26f90c285df1f524ce9-X`
   to your live key:
   `FLWPUBK-59b3f035001471921a4601a258625a3f-X`
3. Save and re-upload to GitHub

---

## FILE STRUCTURE

```
hoodies-website/
├── index.html          Homepage
├── products.html       Shop with filters (pulls from database)
├── product.html        Product detail + customization
├── cart.html           Cart page
├── checkout.html       Flutterwave payment
├── success.html        Order confirmation
├── setup.sql           Run this in Supabase SQL Editor ONCE
│
├── css/style.css       All styling
│
├── js/
│   ├── config.js       All your keys and settings HERE
│   ├── db.js           Supabase database functions
│   └── app.js          Cart, currency, utilities
│
└── admin/
    ├── login.html      Admin login (password: Peaceable@Son)
    ├── index.html      Dashboard with stats
    ├── orders.html     All orders — update status, view details
    └── products.html   Add / edit / delete products
```

---

## HOW TO UPDATE YOUR PRODUCT LISTING

This is the easy part. Go to Admin → Products → Edit any product.

You can change:
- Name
- Price (in NGN — site shows both NGN and USD automatically)
- Description
- Colors (paste hex codes like #c0392b, #2563eb)
- Sizes
- Active/Hidden (toggle to hide without deleting)
- Featured (shows on homepage)

Changes go live immediately on your store.

---

## SECURITY NOTES

- Your Flutterwave secret key is NOT in any frontend file (it should never be)
- Admin session expires after 8 hours automatically
- All customer inputs are sanitized before saving
- Supabase Row Level Security is enabled
- Never share your service_role key publicly

---

## ORDER FLOW

1. Customer selects product and customizes it
2. Adds to cart (stored in browser)
3. Goes to checkout, fills in details
4. Flutterwave popup opens (card/bank/USSD)
5. Payment completes
6. Order saved to Supabase instantly
7. WhatsApp notification sent to you
8. Customer sees confirmation page
9. You log into Admin → Orders to fulfill
