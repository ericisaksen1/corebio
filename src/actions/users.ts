"use server"

import { prisma } from "@/lib/prisma"
import { auth } from "@/auth"
import { revalidatePath } from "next/cache"
import type { UserRole } from "@prisma/client"

async function requireSuperAdmin() {
  const session = await auth()
  if (session?.user?.role !== "SUPER_ADMIN") {
    throw new Error("Unauthorized")
  }
  return session
}

const ASSIGNABLE_ROLES: UserRole[] = ["CUSTOMER", "AFFILIATE", "ADMIN"]

export async function updateUserRole(userId: string, newRole: UserRole) {
  const session = await requireSuperAdmin()

  // Cannot change own role
  if (userId === session.user.id) {
    return { error: "You cannot change your own role" }
  }

  // Cannot assign SUPER_ADMIN
  if (newRole === "SUPER_ADMIN") {
    return { error: "Cannot assign SUPER_ADMIN role" }
  }

  if (!ASSIGNABLE_ROLES.includes(newRole)) {
    return { error: "Invalid role" }
  }

  const user = await prisma.user.findUnique({ where: { id: userId } })
  if (!user) {
    return { error: "User not found" }
  }

  // Cannot demote another SUPER_ADMIN
  if (user.role === "SUPER_ADMIN") {
    return { error: "Cannot change another super admin's role" }
  }

  await prisma.user.update({
    where: { id: userId },
    data: { role: newRole },
  })

  revalidatePath("/admin/customers")
  return { success: true }
}
