"use client"

import { useState, useTransition } from "react"
import { toggleWishlist } from "@/actions/wishlist"

interface WishlistButtonProps {
  productId: string
  isWishlisted: boolean
  size?: "sm" | "md"
}

export function WishlistButton({ productId, isWishlisted: initial, size = "sm" }: WishlistButtonProps) {
  const [wishlisted, setWishlisted] = useState(initial)
  const [isPending, startTransition] = useTransition()

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWishlisted(!wishlisted)
    startTransition(async () => {
      const result = await toggleWishlist(productId)
      if (result.error) setWishlisted(wishlisted)
    })
  }

  const sizeClasses = size === "md" ? "h-9 w-9" : "h-7 w-7"
  const iconSize = size === "md" ? "h-5 w-5" : "h-4 w-4"

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isPending}
      className={`${sizeClasses} flex items-center justify-center rounded-full bg-background/80 backdrop-blur-sm transition-colors hover:bg-background disabled:opacity-50`}
      aria-label={wishlisted ? "Remove from wishlist" : "Add to wishlist"}
    >
      <svg
        className={`${iconSize} ${wishlisted ? "fill-red-500 text-red-500" : "fill-none text-foreground"}`}
        viewBox="0 0 24 24"
        stroke="currentColor"
        strokeWidth={2}
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          d="M21 8.25c0-2.485-2.099-4.5-4.688-4.5-1.935 0-3.597 1.126-4.312 2.733-.715-1.607-2.377-2.733-4.313-2.733C5.1 3.75 3 5.765 3 8.25c0 7.22 9 12 9 12s9-4.78 9-12z"
        />
      </svg>
    </button>
  )
}
