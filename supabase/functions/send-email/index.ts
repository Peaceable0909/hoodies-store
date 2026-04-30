// Supabase Edge Function — send-email
// Sends order confirmation to customer + alert to admin via Resend
// Resend API key lives here on the server — never in browser code

const corsHeaders = {
  'Access-Control-Allow-Origin':  '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
}

const ZONE_LABELS: Record<string, string> = {
  lagos:         '🇳🇬 Lagos (2–3 business days)',
  nigeria:       '🇳🇬 Nigeria (3–7 business days)',
  africa:        '🌍 West Africa (7–14 business days)',
  international: '✈️ International DHL (5–10 business days)',
}

function fmt(n: number) {
  return '₦' + Number(n).toLocaleString('en-NG')
}

function customerEmail(order: any): string {
  const items = (order.items || []).map((i: any) => `
    <tr>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0">
        <strong>${i.name}</strong><br>
        <span style="color:#666;font-size:13px">Size: ${i.size || '—'} &nbsp;|&nbsp; Qty: ${i.qty}</span>
      </td>
      <td style="padding:10px 0;border-bottom:1px solid #f0f0f0;text-align:right;font-weight:700">
        ${fmt(i.subtotal_ngn || i.price_ngn * i.qty)}
      </td>
    </tr>`).join('')

  const shippingCost = order.shipping_cost || 0
  const subtotal     = (order.total_ngn || 0) - shippingCost
  const zoneLabel    = ZONE_LABELS[order.shipping_zone] || order.shipping_zone || 'Standard'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:580px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">

    <!-- Header -->
    <div style="background:#4f1db5;padding:32px 40px;text-align:center">
      <h1 style="color:#fff;margin:0;font-size:28px;letter-spacing:-0.5px">HOODIES</h1>
      <p style="color:rgba(255,255,255,0.8);margin:8px 0 0;font-size:14px">Your order is confirmed ✓</p>
    </div>

    <!-- Body -->
    <div style="padding:40px">
      <h2 style="margin:0 0 8px;font-size:20px;color:#1a1a1a">Hi ${order.customer_name},</h2>
      <p style="color:#555;line-height:1.6;margin:0 0 24px">
        Thank you for your order! We've received your payment and we're getting things ready.
        Your order reference is <strong style="color:#4f1db5">${order.reference}</strong>.
      </p>

      <!-- Order items -->
      <div style="background:#fafafa;border-radius:10px;padding:20px;margin-bottom:24px">
        <h3 style="margin:0 0 16px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#888">Items Ordered</h3>
        <table style="width:100%;border-collapse:collapse">
          <tbody>${items}</tbody>
          <tfoot>
            <tr>
              <td style="padding:10px 0;font-size:13px;color:#666">Subtotal</td>
              <td style="padding:10px 0;text-align:right;font-size:13px">${fmt(subtotal)}</td>
            </tr>
            <tr>
              <td style="padding:4px 0;font-size:13px;color:#666">Shipping (${zoneLabel})</td>
              <td style="padding:4px 0;text-align:right;font-size:13px">${fmt(shippingCost)}</td>
            </tr>
            <tr style="border-top:2px solid #eee">
              <td style="padding:12px 0 0;font-weight:800;font-size:16px;color:#4f1db5">TOTAL</td>
              <td style="padding:12px 0 0;text-align:right;font-weight:800;font-size:16px;color:#4f1db5">${fmt(order.total_ngn)}</td>
            </tr>
          </tfoot>
        </table>
      </div>

      <!-- Delivery info -->
      <div style="background:#f0ebff;border-radius:10px;padding:20px;margin-bottom:24px">
        <h3 style="margin:0 0 12px;font-size:14px;text-transform:uppercase;letter-spacing:1px;color:#888">Delivery Details</h3>
        <p style="margin:0;color:#333;line-height:1.7;font-size:14px">
          <strong>Address:</strong> ${order.customer_address}<br>
          <strong>Shipping:</strong> ${zoneLabel}<br>
          <strong>Phone:</strong> ${order.customer_phone}
        </p>
      </div>

      <p style="color:#555;font-size:14px;line-height:1.6">
        We'll send you another email when your order ships with your tracking information.
        If you have any questions, reply to this email or WhatsApp us at
        <a href="https://wa.me/2348024100995" style="color:#4f1db5">+234 802 410 0995</a>.
      </p>
    </div>

    <!-- Footer -->
    <div style="background:#fafafa;padding:24px 40px;text-align:center;border-top:1px solid #eee">
      <p style="margin:0;color:#999;font-size:12px">
        HOODIES &nbsp;|&nbsp; Crafted with care<br>
        This is an automated email — replies go to our support team.
      </p>
    </div>
  </div>
</body>
</html>`
}

function adminEmail(order: any): string {
  const items = (order.items || []).map((i: any) =>
    `• ${i.name} — Size: ${i.size || '—'} | Qty: ${i.qty} | ${fmt(i.subtotal_ngn || i.price_ngn * i.qty)}`
  ).join('<br>')

  const zoneLabel = ZONE_LABELS[order.shipping_zone] || order.shipping_zone || 'Standard'

  return `
<!DOCTYPE html>
<html>
<head><meta charset="UTF-8"/></head>
<body style="margin:0;padding:0;background:#f5f5f5;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif">
  <div style="max-width:560px;margin:40px auto;background:#fff;border-radius:16px;overflow:hidden;box-shadow:0 2px 20px rgba(0,0,0,0.08)">

    <div style="background:#1a1a1a;padding:24px 32px;display:flex;align-items:center;gap:12px">
      <div style="background:#4f1db5;border-radius:8px;padding:6px 12px">
        <span style="color:#fff;font-weight:800;font-size:14px">HOODIES ADMIN</span>
      </div>
      <span style="color:#fff;font-size:18px;font-weight:700">🛍️ New Order!</span>
    </div>

    <div style="padding:32px">
      <div style="background:#f0ebff;border-radius:10px;padding:20px;margin-bottom:20px">
        <div style="font-size:13px;color:#888;margin-bottom:4px;text-transform:uppercase;letter-spacing:1px">Order Reference</div>
        <div style="font-size:22px;font-weight:900;color:#4f1db5">${order.reference}</div>
        <div style="font-size:20px;font-weight:800;color:#1a1a1a;margin-top:4px">${fmt(order.total_ngn)}</div>
      </div>

      <table style="width:100%;border-collapse:collapse;margin-bottom:20px">
        <tr>
          <td style="padding:10px;background:#fafafa;border-radius:8px;width:50%;vertical-align:top">
            <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Customer</div>
            <div style="font-weight:700;font-size:14px">${order.customer_name}</div>
            <div style="color:#555;font-size:13px">${order.customer_email}</div>
            <div style="color:#555;font-size:13px">${order.customer_phone}</div>
          </td>
          <td style="width:12px"></td>
          <td style="padding:10px;background:#fafafa;border-radius:8px;width:50%;vertical-align:top">
            <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:6px">Delivery</div>
            <div style="font-size:13px;line-height:1.6;color:#333">${order.customer_address}</div>
            <div style="font-size:12px;color:#4f1db5;margin-top:4px;font-weight:600">${zoneLabel}</div>
          </td>
        </tr>
      </table>

      <div style="background:#fafafa;border-radius:10px;padding:16px;margin-bottom:20px">
        <div style="font-size:11px;color:#888;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px">Items</div>
        <div style="font-size:13px;line-height:2;color:#333">${items}</div>
      </div>

      <a href="https://peaceable0909.github.io/hoodies-store/admin/orders.html"
         style="display:block;background:#4f1db5;color:#fff;text-align:center;padding:14px;border-radius:10px;text-decoration:none;font-weight:700;font-size:15px">
        View in Admin Dashboard →
      </a>
    </div>
  </div>
</body>
</html>`
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const RESEND_KEY   = Deno.env.get('RESEND_API_KEY')!
    const ADMIN_EMAIL  = Deno.env.get('ADMIN_EMAIL')!        // your email
    const FROM_EMAIL   = Deno.env.get('FROM_EMAIL')!         // e.g. orders@yourdomain.com

    const order = await req.json()

    // Send both emails in parallel
    const [customerRes, adminRes] = await Promise.all([

      // 1. Order confirmation to customer
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    `HOODIES <${FROM_EMAIL}>`,
          to:      [order.customer_email],
          subject: `Order Confirmed — ${order.reference} | HOODIES`,
          html:    customerEmail(order),
        }),
      }),

      // 2. New order alert to admin
      fetch('https://api.resend.com/emails', {
        method:  'POST',
        headers: { 'Authorization': `Bearer ${RESEND_KEY}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from:    `HOODIES Orders <${FROM_EMAIL}>`,
          to:      [ADMIN_EMAIL],
          subject: `🛍️ New Order ${order.reference} — ${fmt(order.total_ngn)}`,
          html:    adminEmail(order),
        }),
      }),
    ])

    const cJson = await customerRes.json()
    const aJson = await adminRes.json()

    return new Response(JSON.stringify({ customer: cJson, admin: aJson }), {
      status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
