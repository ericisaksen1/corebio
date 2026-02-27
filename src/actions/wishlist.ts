"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"

export async function toggleWishlist(productId: string) {
  const session = await auth()
  if (!session?.user?.id) return { error: "Not authenticated" }

  const existing = await prisma.wishlistItem.findUnique({
    where: { userId_productId: { userId: session.user.id, productId } },
  })

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } })
  } else {
    await prisma.wishlistItem.create({
      data: { userId: session.user.id, productId },
    })
  }

  revalidatePath("/wishlist")
  return { success: true, wishlisted: !existing }
}

export async function getWishlistIds(): Promise<string[]> {
  const session = await auth()
  if (!session?.user?.id) return []

  const items = await prisma.wishlistItem.findMany({
    where: { userId: session.user.id },
    select: { productId: true },
  })

  return items.map((i) => i.productId)
}
