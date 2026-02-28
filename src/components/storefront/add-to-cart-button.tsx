"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { addToCart } from "@/actions/cart"

interface AddToCartButtonProps {
  productId: string
  slug: string
  defaultVariantId: string | null
  hasMultipleVariants: boolean
  stock: number
}

export function AddToCartButton({
  productId,
  slug,
  defaultVariantId,
  hasMultipleVariants,
  stock,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  if (hasMultipleVariants) {
    return (
      <Link href={`/products/${slug}`}>
        <Button className="w-full rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] px-5 py-2.5 text-sm font-medium text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]">
          View Options
        </Button>
      </Link>
    )
  }

  const canAdd = stock > 0

  function handleClick() {
    if (!canAdd) return
    startTransition(async () => {
      const result = await addToCart(productId, defaultVariantId, 1)
      if (result.success) {
        toast("Added to cart!")
      }
    })
  }

  return (
    <Button
      className="w-full rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] px-5 py-2.5 text-sm font-medium text-[var(--color-product-btn-text)] hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
      onClick={handleClick}
      disabled={isPending || !canAdd}
    >
      {isPending ? "Adding..." : !canAdd ? "Out of Stock" : "Add to Cart"}
    </Button>
  )
}
