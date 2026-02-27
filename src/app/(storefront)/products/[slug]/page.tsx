import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { getSettings } from "@/lib/settings"
import { ProductGallery } from "@/components/storefront/product-gallery"
import { PriceDisplay } from "@/components/storefront/price-display"
import { SetAdminEdit } from "@/components/storefront/admin-toolbar"
import { WishlistButton } from "@/components/storefront/wishlist-button"
import { ProductReviews } from "@/components/storefront/product-reviews"
import { ProductDetails } from "./product-details"
import type { Metadata } from "next"

interface Props {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const product = await prisma.product.findUnique({
    where: { slug },
    select: { name: true, metaTitle: true, metaDescription: true, shortDescription: true },
  })

  if (!product) return { title: "Product Not Found" }

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || undefined,
  }
}

export default async function ProductPage({ params }: Props) {
  const { slug } = await params

  const [session, settings] = await Promise.all([
    auth(),
    getSettings(["enable_wishlist", "enable_reviews"]),
  ])

  const wishlistEnabled = settings.enable_wishlist !== "false"
  const reviewsEnabled = settings.enable_reviews !== "false"

  const product = await prisma.product.findUnique({
    where: { slug, isActive: true },
    include: {
      images: { orderBy: { sortOrder: "asc" } },
      variants: {
        where: { isActive: true },
        orderBy: { sortOrder: "asc" },
      },
      categories: {
        include: { category: true },
      },
    },
  })

  if (!product) notFound()

  const totalStock = product.variants.length > 0
    ? product.variants.reduce((sum, v) => sum + v.stock, 0)
    : product.stock

  // Wishlist check
  let isWishlisted = false
  if (wishlistEnabled && session?.user?.id) {
    const item = await prisma.wishlistItem.findUnique({
      where: { userId_productId: { userId: session.user.id, productId: product.id } },
    })
    isWishlisted = !!item
  }

  // Reviews
  let reviews: any[] = []
  let averageRating = 0
  let hasReviewed = false
  if (reviewsEnabled) {
    const rawReviews = await prisma.productReview.findMany({
      where: { productId: product.id, isApproved: true },
      orderBy: { createdAt: "desc" },
      include: { user: { select: { name: true } } },
    })
    reviews = rawReviews.map((r) => ({
      id: r.id,
      rating: r.rating,
      title: r.title,
      content: r.content,
      createdAt: r.createdAt.toISOString(),
      userName: r.user.name,
    }))
    if (rawReviews.length > 0) {
      averageRating = rawReviews.reduce((sum, r) => sum + r.rating, 0) / rawReviews.length
    }
    if (session?.user?.id) {
      const userReview = await prisma.productReview.findUnique({
        where: { userId_productId: { userId: session.user.id, productId: product.id } },
      })
      hasReviewed = !!userReview
    }
  }

  return (
    <div className="container-subpages px-4 py-12 sm:px-6 lg:px-8">
      <SetAdminEdit href={`/admin/products/${product.id}`} label="Edit Product" />
      <div className="grid grid-cols-1 gap-12 lg:grid-cols-2 lg:gap-16">
        {/* Image Gallery */}
        <ProductGallery images={product.images} />

        {/* Product Info */}
        <div>
          {product.categories.length > 0 && (
            <p className="text-sm text-secondary">
              {product.categories.map((pc) => pc.category.name).join(", ")}
            </p>
          )}

          <div className="mt-1 flex items-center gap-3">
            <h1 className="text-4xl font-semibold tracking-tight">{product.name}</h1>
            {wishlistEnabled && (
              <WishlistButton productId={product.id} isWishlisted={isWishlisted} size="md" />
            )}
          </div>

          <div className="mt-4">
            <PriceDisplay
              price={product.basePrice.toString()}
              compareAtPrice={product.compareAtPrice?.toString()}
              size="lg"
            />
          </div>

          {product.shortDescription && (
            <p className="mt-4 text-secondary">{product.shortDescription}</p>
          )}

          <div className="mt-2">
            {totalStock > 0 ? (
              <span className="text-sm text-green-600">In stock</span>
            ) : (
              <span className="text-sm text-red-600">Out of stock</span>
            )}
          </div>

          {/* Variant selector + Add to cart */}
          <div className="mt-6">
            <ProductDetails
              variants={product.variants.map((v) => ({
                id: v.id,
                name: v.name,
                price: v.price.toString(),
                stock: v.stock,
                options: v.options as { name: string; value: string }[],
              }))}
              productId={product.id}
              productStock={product.stock}
            />
          </div>

          {/* Description */}
          {product.description && (
            <div className="mt-8 border-t border-black/5 pt-8">
              <h2 className="text-lg font-semibold tracking-tight">Description</h2>
              <div className="prose mt-4 text-sm text-secondary">
                {product.description.split("\n").map((paragraph, i) => (
                  <p key={i}>{paragraph}</p>
                ))}
              </div>
            </div>
          )}

          {/* SKU */}
          {product.sku && (
            <p className="mt-6 text-xs text-secondary">SKU: {product.sku}</p>
          )}
        </div>
      </div>

      {/* Reviews */}
      {reviewsEnabled && (
        <ProductReviews
          productId={product.id}
          reviews={reviews}
          averageRating={averageRating}
          isAuthenticated={!!session?.user}
          hasReviewed={hasReviewed}
        />
      )}
    </div>
  )
}
