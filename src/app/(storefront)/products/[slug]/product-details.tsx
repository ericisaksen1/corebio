"use client"

import { useState, useTransition } from "react"
import { VariantSelector } from "@/components/storefront/variant-selector"
import { PriceDisplay } from "@/components/storefront/price-display"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { addToCart } from "@/actions/cart"

interface Variant {
  id: string
  name: string
  price: string
  stock: number
  options: { name: string; value: string }[]
}

interface ProductDetailsProps {
  variants: Variant[]
  productId: string
  productStock?: number
}

export function ProductDetails({ variants, productId, productStock = 0 }: ProductDetailsProps) {
  const hasVariants = variants.length > 0
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(
    variants.length === 1 ? variants[0].id : null
  )
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  const selectedVariant = variants.find((v) => v.id === selectedVariantId)
  const hasMultipleVariants = variants.length > 1

  // Determine if add to cart is possible
  const canAdd = hasVariants
    ? selectedVariant && selectedVariant.stock > 0
    : productStock > 0

  function handleAddToCart() {
    if (!canAdd) return
    startTransition(async () => {
      const result = await addToCart(productId, hasVariants ? selectedVariantId! : null, 1)
      if (result.success) {
        toast("Added to cart!")
      }
    })
  }

  // No variants: simple add to cart
  if (!hasVariants) {
    return (
      <div className="space-y-6">
        <Button
          size="lg"
          className="w-full border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
          disabled={!canAdd || isPending}
          onClick={handleAddToCart}
        >
          {isPending
            ? "Adding..."
            : productStock <= 0
              ? "Out of Stock"
              : "Add to Cart"}
        </Button>
      </div>
    )
  }

  // Has variants: variant selector + add to cart
  return (
    <div className="space-y-6">
      {hasMultipleVariants && (
        <VariantSelector
          variants={variants}
          selectedVariantId={selectedVariantId}
          onSelect={setSelectedVariantId}
        />
      )}

      {selectedVariant && hasMultipleVariants && (
        <PriceDisplay price={selectedVariant.price} size="md" />
      )}

      <Button
        size="lg"
        className="w-full border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
        disabled={!canAdd || isPending}
        onClick={handleAddToCart}
      >
        {isPending
          ? "Adding..."
          : !selectedVariant && hasMultipleVariants
            ? "Select an option"
            : selectedVariant && selectedVariant.stock <= 0
              ? "Out of Stock"
              : "Add to Cart"}
      </Button>
    </div>
  )
}
