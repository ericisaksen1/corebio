"use server"

import { prisma } from "@/lib/prisma"
import { revalidatePath } from "next/cache"
import { auth } from "@/auth"
import { notifyAdminContactMessage } from "@/lib/email/notify"

export async function submitContactMessage(formData: FormData) {
  const name = (formData.get("name") as string || "").trim()
  const email = (formData.get("email") as string || "").trim()
  const subject = (formData.get("subject") as string || "").trim()
  const message = (formData.get("message") as string || "").trim()

  if (!name) return { error: "Name is required" }
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return { error: "Valid email is required" }
  if (!subject) return { error: "Subject is required" }
  if (!message || message.length < 10) return { error: "Message must be at least 10 characters" }

  await prisma.contactMessage.create({
    data: { name, email, subject, message },
  })

  // Fire-and-forget email notification
  notifyAdminContactMessage(name, email, subject, message)

  revalidatePath("/admin/messages")
  return { success: true }
}

export async function markMessageRead(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: true },
  })

  revalidatePath("/admin/messages")
  return { success: true }
}

export async function markMessageUnread(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  await prisma.contactMessage.update({
    where: { id },
    data: { isRead: false },
  })

  revalidatePath("/admin/messages")
  return { success: true }
}

export async function deleteContactMessage(id: string) {
  const session = await auth()
  if (session?.user?.role !== "ADMIN" && session?.user?.role !== "SUPER_ADMIN") {
    return { error: "Unauthorized" }
  }

  await prisma.contactMessage.delete({ where: { id } })
  revalidatePath("/admin/messages")
  return { success: true }
}
