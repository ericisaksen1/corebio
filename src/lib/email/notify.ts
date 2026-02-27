import { sendEmail } from "./send"
import { getSetting } from "@/lib/settings"
import {
  newUserAdminTemplate,
  affiliateApplicationAdminTemplate,
  lowStockAdminTemplate,
  outOfStockAdminTemplate,
  newOrderAdminTemplate,
  contactMessageAdminTemplate,
  orderConfirmationTemplate,
  orderStatusChangedTemplate,
  shippingConfirmationTemplate,
  passwordChangedTemplate,
  passwordResetTemplate,
} from "./templates"

async function getAdminEmail(): Promise<string> {
  return getSetting("admin_notification_email")
}

// ── Admin Notifications ──

export async function notifyAdminNewUser(userName: string, userEmail: string) {
  const adminEmail = await getAdminEmail()
  if (!adminEmail) return
  const { subject, html } = newUserAdminTemplate(userName, userEmail)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminAffiliateApplication(userName: string, userEmail: string) {
  const adminEmail = await getAdminEmail()
  if (!adminEmail) return
  const { subject, html } = affiliateApplicationAdminTemplate(userName, userEmail)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminLowStock(productName: string, currentStock: number) {
  const adminEmail = await getAdminEmail()
  if (!adminEmail) return
  const { subject, html } = lowStockAdminTemplate(productName, currentStock)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminOutOfStock(productName: string) {
  const adminEmail = await getAdminEmail()
  if (!adminEmail) return
  const { subject, html } = outOfStockAdminTemplate(productName)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminNewOrder(orderNumber: string, total: string, customerName: string) {
  const adminEmail = await getAdminEmail()
  if (!adminEmail) return
  const { subject, html } = newOrderAdminTemplate(orderNumber, total, customerName)
  await sendEmail(adminEmail, subject, html)
}

export async function notifyAdminContactMessage(name: string, email: string, subject: string, message: string) {
  const adminEmail = await getAdminEmail()
  if (!adminEmail) return
  const { subject: emailSubject, html } = contactMessageAdminTemplate(name, email, subject, message)
  await sendEmail(adminEmail, emailSubject, html)
}

// ── Customer Notifications ──

export async function notifyCustomerOrderPlaced(
  customerEmail: string,
  orderNumber: string,
  total: string,
  paymentMethod: string,
  items: { name: string; quantity: number; price: string }[]
) {
  const { subject, html } = orderConfirmationTemplate(orderNumber, total, paymentMethod, items)
  await sendEmail(customerEmail, subject, html)
}

export async function notifyCustomerStatusChanged(
  customerEmail: string,
  orderNumber: string,
  newStatus: string
) {
  const { subject, html } = orderStatusChangedTemplate(orderNumber, newStatus)
  await sendEmail(customerEmail, subject, html)
}

export async function notifyCustomerShipped(
  customerEmail: string,
  orderNumber: string,
  carrier: string,
  service: string,
  trackingNumber: string
) {
  const { subject, html } = shippingConfirmationTemplate(orderNumber, carrier, service, trackingNumber)
  await sendEmail(customerEmail, subject, html)
}

export async function notifyCustomerPasswordChanged(customerEmail: string, userName: string) {
  const { subject, html } = passwordChangedTemplate(userName)
  await sendEmail(customerEmail, subject, html)
}

export async function sendPasswordResetEmail(email: string, resetUrl: string) {
  const { subject, html } = passwordResetTemplate(resetUrl)
  await sendEmail(email, subject, html)
}
