import Link from "next/link"
import Image from "next/image"
import { formatCurrency } from "@/lib/utils"
import { WishlistButton } from "./wishlist-button"
import { StarRating } from "./star-rating"

export type ProductCardStyle = "standard" | "bordered" | "minimal" | "overlay"

interface ProductCardProps {
  product: {
    slug: string
    name: string
    basePrice: any
    compareAtPrice: any | null
    shortDescription: string | null
    images: { url: string; alt: string | null; isPrimary: boolean }[]
    id?: string
    stock?: number
    defaultVariantId?: string | null
    hasMultipleVariants?: boolean
    hasVariantPricing?: boolean
  }
  horizontal?: boolean
  cardStyle?: ProductCardStyle
  wishlistEnabled?: boolean
  isWishlisted?: boolean
  reviewData?: { avgRating: number; count: number }
}

export function ProductCard({
  product,
  horizontal,
  cardStyle = "standard",
  wishlistEnabled,
  isWishlisted,
  reviewData,
}: ProductCardProps) {
  const primaryImage = product.images.find((i) => i.isPrimary) || product.images[0]
  const isOnSale = product.compareAtPrice && Number(product.compareAtPrice) > Number(product.basePrice)
  const showFromPrefix = product.hasVariantPricing

  const wishlistBtn = wishlistEnabled && product.id && (
    <WishlistButton productId={product.id} isWishlisted={isWishlisted ?? false} />
  )

  const saleBadge = isOnSale && (
    <span className="absolute left-2 top-2 rounded-full bg-red-500 px-2.5 py-1 text-[11px] font-medium text-white">
      Sale
    </span>
  )

  const reviewBlock = reviewData && reviewData.count > 0 && (
    <div className="mt-1">
      <StarRating rating={Math.round(reviewData.avgRating)} count={reviewData.count} size="sm" />
    </div>
  )

  // Horizontal layout (list view)
  if (horizontal) {
    return (
      <div className="group overflow-hidden rounded-3xl bg-background transition-shadow hover:shadow-md">
        <div className="flex">
          <Link href={`/products/${product.slug}`} className="relative w-40 shrink-0 sm:w-48">
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              {primaryImage ? (
                <Image
                  src={primaryImage.url}
                  alt={primaryImage.alt || product.name}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
                  sizes="192px"
                />
              ) : (
                <div className="flex h-full items-center justify-center text-secondary">
                  No image
                </div>
              )}
              {saleBadge}
              {wishlistBtn && (
                <div className="absolute right-2 top-2">{wishlistBtn}</div>
              )}
            </div>
          </Link>
          <div className="flex min-w-0 flex-1 flex-col justify-between p-4">
            <Link href={`/products/${product.slug}`}>
              <h3 className="text-sm font-semibold text-foreground leading-tight sm:text-base">
                {product.name}
              </h3>
              <p className="mt-1 text-sm">
                {showFromPrefix && <><span className="text-xs text-secondary">From</span>{" "}</>}
                <span className="font-semibold">{formatCurrency(product.basePrice.toString())}</span>
              </p>
              {reviewBlock}
            </Link>
            <div className="mt-3 max-w-48">
              <Link
                href={`/products/${product.slug}`}
                className="inline-block rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] px-5 py-2.5 text-center text-sm font-medium text-[var(--color-product-btn-text)] transition-all duration-150 hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
              >
                View
              </Link>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Overlay card style
  if (cardStyle === "overlay" && primaryImage) {
    return (
      <div className="group relative overflow-hidden rounded-2xl">
        <Link href={`/products/${product.slug}`}>
          <div className="relative aspect-square bg-muted">
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-4 text-white">
              <h3 className="text-sm font-semibold">{product.name}</h3>
              <div className="mt-1 flex items-center gap-2">
                <span className="text-sm font-bold">
                  {formatCurrency(product.basePrice.toString())}
                </span>
                {isOnSale && (
                  <span className="text-xs line-through opacity-75">
                    {formatCurrency(product.compareAtPrice!.toString())}
                  </span>
                )}
              </div>
            </div>
            {saleBadge}
          </div>
        </Link>
        {wishlistBtn && (
          <div className="absolute right-2 top-2">{wishlistBtn}</div>
        )}
      </div>
    )
  }

  // Minimal card style
  if (cardStyle === "minimal") {
    return (
      <div className="group relative">
        <Link href={`/products/${product.slug}`}>
          {primaryImage ? (
            <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
              <Image
                src={primaryImage.url}
                alt={primaryImage.alt || product.name}
                fill
                className="object-cover transition-opacity group-hover:opacity-90"
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
              />
              {saleBadge}
            </div>
          ) : null}
          <div className="mt-4">
            <h3 className="text-sm font-semibold tracking-tight text-foreground leading-tight group-hover:text-primary">
              {product.name}
            </h3>
            <p className="mt-1 text-sm">
              {showFromPrefix && <><span className="text-xs text-secondary">From</span>{" "}</>}
              <span className="font-semibold">{formatCurrency(product.basePrice.toString())}</span>
            </p>
          </div>
          {reviewBlock}
        </Link>
        {wishlistBtn && (
          <div className="absolute right-2 top-2">{wishlistBtn}</div>
        )}
      </div>
    )
  }

  // Standard and bordered (default)
  return (
    <div className="group flex h-full flex-col">
      <Link href={`/products/${product.slug}`} className="block">
        <div className="relative aspect-square overflow-hidden rounded-2xl bg-muted">
          {primaryImage ? (
            <Image
              src={primaryImage.url}
              alt={primaryImage.alt || product.name}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
            />
          ) : (
            <div className="flex h-full items-center justify-center text-secondary">
              No image
            </div>
          )}
          {saleBadge}
          {wishlistBtn && (
            <div className="absolute right-2 top-2">{wishlistBtn}</div>
          )}
        </div>
      </Link>

      <div className="mt-4 flex flex-1 flex-col">
        <h3 className="text-sm font-semibold tracking-tight text-foreground leading-tight">
          {product.name}
        </h3>
        <p className="mt-1 text-sm">
          {showFromPrefix && <><span className="text-xs text-secondary">From</span>{" "}</>}
          <span className="font-semibold">{formatCurrency(product.basePrice.toString())}</span>
        </p>
        {reviewBlock}

        <div className="mt-3 flex gap-2">
          <Link
            href={`/products/${product.slug}`}
            className="flex-1 rounded-full border border-[var(--color-product-btn-border)] bg-[var(--color-product-btn-bg)] px-5 py-2.5 text-center text-sm font-medium text-[var(--color-product-btn-text)] transition-all duration-150 hover:bg-[var(--color-product-btn-hover-bg)] hover:text-[var(--color-product-btn-hover-text)]"
          >
            View
          </Link>
        </div>
      </div>
    </div>
  )
}
