"use client"

import { useTransition } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/toast"
import { addToCart } from "@/actions/cart"

const PlusIcon = (
  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
  </svg>
)

interface AddToCartButtonProps {
  productId: string
  slug: string
  defaultVariantId: string | null
  hasMultipleVariants: boolean
  stock: number
  iconOnly?: boolean
}

export function AddToCartButton({
  productId,
  slug,
  defaultVariantId,
  hasMultipleVariants,
  stock,
  iconOnly,
}: AddToCartButtonProps) {
  const [isPending, startTransition] = useTransition()
  const { toast } = useToast()

  if (hasMultipleVariants) {
    if (iconOnly) {
      return (
        <Link
          href={`/products/${slug}`}
          className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] transition-all duration-150 hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
          title="View Options"
        >
          {PlusIcon}
        </Link>
      )
    }
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

  if (iconOnly) {
    return (
      <button
        onClick={handleClick}
        disabled={isPending || !canAdd}
        className="flex h-10 w-10 items-center justify-center rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] text-[var(--color-product-btn-text)] transition-all duration-150 hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)] disabled:opacity-50"
        title={!canAdd ? "Out of Stock" : "Add to Cart"}
      >
        {isPending ? (
          <svg className="h-5 w-5 animate-spin" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
          </svg>
        ) : PlusIcon}
      </button>
    )
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
