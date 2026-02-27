import { getSettings } from "@/lib/settings"
import { type ReactNode } from "react"
import Image from "next/image"
import Link from "next/link"

export default async function AuthLayout({ children }: { children: ReactNode }) {
  const settings = await getSettings(["theme_mode", "store_name", "site_logo_url", "logo_height"])
  const isDark = settings.theme_mode === "dark"
  const storeName = settings.store_name || "Store"
  const logoUrl = settings.site_logo_url
  const logoHeight = settings.logo_height

  return (
    <div className={`flex min-h-screen flex-col items-center justify-center bg-gray-50 px-4 dark:bg-gray-950 ${isDark ? "dark" : ""}`}>
      <Link href="/" className="mb-8">
        {logoUrl ? (
          <Image
            src={logoUrl}
            alt={storeName}
            width={200}
            height={Number(logoHeight) || 40}
            style={{ height: logoHeight ? `${logoHeight}px` : "40px", width: "auto" }}
            priority
          />
        ) : (
          <span className="text-2xl font-bold text-gray-900 dark:text-white">{storeName}</span>
        )}
      </Link>
      <div className="w-full max-w-md">{children}</div>
    </div>
  )
}
