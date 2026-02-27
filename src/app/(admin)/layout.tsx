import { AdminSidebar } from "@/components/admin/sidebar"
import { AdminTopbar } from "@/components/admin/topbar"
import { auth } from "@/auth"
import { redirect } from "next/navigation"
import { getSettings } from "@/lib/settings"
import { type ReactNode } from "react"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const session = await auth()

  if (!session?.user || (session.user.role !== "ADMIN" && session.user.role !== "SUPER_ADMIN")) {
    redirect("/login")
  }

  const isSuperAdmin = session.user.role === "SUPER_ADMIN"
  const settings = await getSettings(["enable_affiliates"])
  const affiliatesEnabled = settings.enable_affiliates !== "false"

  const adminTheme: React.CSSProperties & Record<string, string> = {
    "--color-background": "#ffffff",
    "--color-foreground": "#171717",
    "--color-primary": "#000000",
    "--color-secondary": "#4b5563",
    "--color-accent": "#2563eb",
    "--color-muted": "#f3f4f6",
    "--color-border": "#e5e7eb",
    "--color-button-bg": "#000000",
    "--color-button-text": "#ffffff",
    "--font-heading": "'Inter', sans-serif",
    "--font-body": "'Inter', sans-serif",
    "--radius": "8px",
    "--shadow": "0 1px 2px rgba(0, 0, 0, 0.05)",
    colorScheme: "light",
  }

  return (
    <div className="min-h-screen bg-muted text-foreground" style={adminTheme}>
      <AdminSidebar isSuperAdmin={isSuperAdmin} affiliatesEnabled={affiliatesEnabled} />
      <div className="pl-64">
        <AdminTopbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  )
}
