import { redirect } from "next/navigation"
import { auth } from "@/auth"
import { getCart } from "@/actions/cart"
import { cookies } from "next/headers"
import { getSettings } from "@/lib/settings"
import { CheckoutForm } from "./checkout-form"

export const metadata = { title: "Checkout" }

export default async function CheckoutPage() {
  const session = await auth()
  if (!session?.user) redirect("/login?returnUrl=/checkout")

  const [cart, settings] = await Promise.all([
    getCart(),
    getSettings(["shipping_flat_rate", "tax_rate"]),
  ])
  if (!cart || cart.items.length === 0) redirect("/cart")

  // Read affiliate cookie to auto-apply
  const cookieStore = await cookies()
  const affiliateRef = cookieStore.get("affiliate_ref")?.value || null

  const cartItems = cart.items.map((item) => ({
    id: item.id,
    name: item.product.name,
    variantName: item.variant?.name || null,
    price: item.variant ? Number(item.variant.price) : Number(item.product.basePrice),
    quantity: item.quantity,
  }))

  const subtotal = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0)
  const shippingRate = parseFloat(settings.shipping_flat_rate) || 0
  const taxRate = parseFloat(settings.tax_rate) || 0

  return (
    <div className="mx-auto max-w-4xl px-4 py-8 sm:px-6 lg:px-8">
      <h1 className="text-2xl font-bold">Checkout</h1>
      <div className="mt-8">
        <CheckoutForm
          cartItems={cartItems}
          subtotal={subtotal}
          affiliateRef={affiliateRef}
          shippingRate={shippingRate}
          taxRate={taxRate}
        />
      </div>
    </div>
  )
}
