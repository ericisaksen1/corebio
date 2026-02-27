const ORDER_STATUS_LABELS: Record<string, string> = {
  AWAITING_PAYMENT: "Awaiting Payment",
  PAYMENT_COMPLETE: "Payment Complete",
  ORDER_COMPLETE: "Order Complete",
  CANCELLED: "Cancelled",
}

function layout(title: string, body: string): string {
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head>
<body style="margin:0;padding:0;background:#f7f7f7;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif">
<table width="100%" cellpadding="0" cellspacing="0" style="background:#f7f7f7;padding:32px 0">
<tr><td align="center">
<table width="600" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:8px;overflow:hidden;max-width:100%">
<tr><td style="padding:32px 40px 24px;border-bottom:1px solid #eee">
  <h1 style="margin:0;font-size:20px;color:#111">${title}</h1>
</td></tr>
<tr><td style="padding:24px 40px 32px;font-size:15px;line-height:1.6;color:#333">
  ${body}
</td></tr>
<tr><td style="padding:16px 40px;border-top:1px solid #eee;font-size:12px;color:#999;text-align:center">
  This is an automated message. Please do not reply.
</td></tr>
</table>
</td></tr>
</table>
</body>
</html>`
}

// ── Admin Templates ──

export function newUserAdminTemplate(userName: string, userEmail: string) {
  return {
    subject: `New User Registration: ${userName}`,
    html: layout("New User Registration", `
      <p>A new user has registered:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Name</td><td style="padding:8px 12px">${userName}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Email</td><td style="padding:8px 12px">${userEmail}</td></tr>
      </table>
    `),
  }
}

export function affiliateApplicationAdminTemplate(userName: string, userEmail: string) {
  return {
    subject: `New Affiliate Application: ${userName}`,
    html: layout("Affiliate Application", `
      <p>A user has applied to become an affiliate:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Name</td><td style="padding:8px 12px">${userName}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Email</td><td style="padding:8px 12px">${userEmail}</td></tr>
      </table>
      <p>Please review this application in the admin panel.</p>
    `),
  }
}

export function lowStockAdminTemplate(productName: string, currentStock: number) {
  return {
    subject: `Low Stock Alert: ${productName}`,
    html: layout("Low Stock Alert", `
      <p style="color:#b45309;font-weight:600">A product is running low on stock:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Product</td><td style="padding:8px 12px">${productName}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Stock</td><td style="padding:8px 12px;color:#b45309;font-weight:600">${currentStock} remaining</td></tr>
      </table>
    `),
  }
}

export function outOfStockAdminTemplate(productName: string) {
  return {
    subject: `Out of Stock: ${productName}`,
    html: layout("Out of Stock Alert", `
      <p style="color:#dc2626;font-weight:600">A product is now out of stock:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Product</td><td style="padding:8px 12px">${productName}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Stock</td><td style="padding:8px 12px;color:#dc2626;font-weight:600">0 — Sold Out</td></tr>
      </table>
      <p>This product can no longer be purchased until stock is replenished.</p>
    `),
  }
}

export function contactMessageAdminTemplate(name: string, email: string, subject: string, message: string) {
  const esc = (s: string) => s.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;")
  return {
    subject: `New Contact Message: ${subject}`,
    html: layout("New Contact Message", `
      <p>You have received a new contact form submission:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Name</td><td style="padding:8px 12px">${esc(name)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Email</td><td style="padding:8px 12px">${esc(email)}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Subject</td><td style="padding:8px 12px">${esc(subject)}</td></tr>
      </table>
      <p style="margin:16px 0;padding:16px;background:#f9f9f9;border-radius:4px;white-space:pre-wrap">${esc(message)}</p>
      <p style="color:#999;font-size:13px">You can view and manage all messages in the admin panel.</p>
    `),
  }
}

export function newOrderAdminTemplate(orderNumber: string, total: string, customerName: string) {
  return {
    subject: `New Order #${orderNumber}`,
    html: layout("New Order Received", `
      <p>A new order has been placed:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Order</td><td style="padding:8px 12px">#${orderNumber}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Customer</td><td style="padding:8px 12px">${customerName}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Total</td><td style="padding:8px 12px;font-weight:600">${total}</td></tr>
      </table>
    `),
  }
}

// ── Customer Templates ──

export function orderConfirmationTemplate(
  orderNumber: string,
  total: string,
  paymentMethod: string,
  items: { name: string; quantity: number; price: string }[]
) {
  const itemRows = items
    .map(
      (item) =>
        `<tr><td style="padding:8px 12px;border-bottom:1px solid #eee">${item.name}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:center">${item.quantity}</td><td style="padding:8px 12px;border-bottom:1px solid #eee;text-align:right">${item.price}</td></tr>`
    )
    .join("")

  return {
    subject: `Order Confirmation #${orderNumber}`,
    html: layout("Order Confirmation", `
      <p>Thank you for your order! Here's your order summary:</p>
      <p style="font-size:18px;font-weight:600;margin:16px 0">Order #${orderNumber}</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr style="background:#f9f9f9"><th style="padding:8px 12px;text-align:left">Item</th><th style="padding:8px 12px;text-align:center">Qty</th><th style="padding:8px 12px;text-align:right">Price</th></tr>
        ${itemRows}
      </table>
      <p style="font-size:16px;font-weight:600;text-align:right">Total: ${total}</p>
      <p style="margin-top:24px">Payment method: <strong>${paymentMethod}</strong></p>
      <p>You will receive payment instructions shortly. Once your payment is confirmed, we'll prepare your order for shipping.</p>
    `),
  }
}

export function orderStatusChangedTemplate(orderNumber: string, newStatus: string) {
  const statusLabel = ORDER_STATUS_LABELS[newStatus] || newStatus
  return {
    subject: `Order #${orderNumber} — ${statusLabel}`,
    html: layout("Order Status Update", `
      <p>Your order status has been updated:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Order</td><td style="padding:8px 12px">#${orderNumber}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Status</td><td style="padding:8px 12px;font-weight:600">${statusLabel}</td></tr>
      </table>
    `),
  }
}

export function shippingConfirmationTemplate(
  orderNumber: string,
  carrier: string,
  service: string,
  trackingNumber: string
) {
  return {
    subject: `Order #${orderNumber} Shipped!`,
    html: layout("Your Order Has Shipped", `
      <p>Great news! Your order has been shipped:</p>
      <table style="width:100%;border-collapse:collapse;margin:16px 0">
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600;width:100px">Order</td><td style="padding:8px 12px">#${orderNumber}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Carrier</td><td style="padding:8px 12px">${carrier}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Service</td><td style="padding:8px 12px">${service}</td></tr>
        <tr><td style="padding:8px 12px;background:#f9f9f9;font-weight:600">Tracking</td><td style="padding:8px 12px;font-family:monospace">${trackingNumber}</td></tr>
      </table>
    `),
  }
}

export function passwordResetTemplate(resetUrl: string) {
  return {
    subject: "Reset Your Password",
    html: layout("Reset Your Password", `
      <p>We received a request to reset your password. Click the button below to choose a new one:</p>
      <p style="text-align:center;margin:32px 0">
        <a href="${resetUrl}" style="display:inline-block;padding:12px 32px;background:#111;color:#fff;text-decoration:none;border-radius:6px;font-weight:600;font-size:15px">Reset Password</a>
      </p>
      <p style="color:#999;font-size:13px">This link will expire in 1 hour. If you didn't request a password reset, you can safely ignore this email.</p>
      <p style="color:#999;font-size:13px;word-break:break-all">If the button doesn't work, copy and paste this URL into your browser:<br>${resetUrl}</p>
    `),
  }
}

export function passwordChangedTemplate(userName: string) {
  return {
    subject: "Your Password Was Changed",
    html: layout("Password Changed", `
      <p>Hi ${userName},</p>
      <p>This is a confirmation that the password for your account was recently changed.</p>
      <p>If you did not make this change, please contact us immediately.</p>
    `),
  }
}
