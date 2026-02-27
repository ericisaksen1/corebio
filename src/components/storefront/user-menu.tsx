"use client"

import { useState, useRef, useEffect } from "react"
import Link from "next/link"
import { logout } from "@/actions/auth"
import type { UserRole } from "@prisma/client"

interface UserMenuProps {
  user: {
    name?: string | null
    email?: string | null
    role: UserRole
  } | null
}

export function UserMenu({ user }: UserMenuProps) {
  const [open, setOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  if (!user) {
    return (
      <Link
        href="/login"
        className="text-sm font-medium text-secondary hover:text-primary"
      >
        Log in
      </Link>
    )
  }

  return (
    <div ref={menuRef} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="ml-1 flex h-8 w-8 items-center justify-center rounded-full text-sm font-medium"
        style={{ backgroundColor: "var(--header-user-bg)", color: "var(--header-user-text)" }}
      >
        {(user.name?.[0] || user.email?.[0] || "U").toUpperCase()}
      </button>

      {open && (
        <div className="absolute right-0 mt-2 w-48 rounded-md border border-border bg-background py-1 shadow-lg">
          <div className="border-b border-border px-4 py-2">
            <p className="text-sm font-medium text-foreground">{user.name || "User"}</p>
            <p className="text-xs text-secondary">{user.email}</p>
          </div>

          <Link
            href="/orders"
            className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            My Orders
          </Link>

          <Link
            href="/account"
            className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
            onClick={() => setOpen(false)}
          >
            Account
          </Link>

          {(user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <Link
              href="/admin"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Admin Dashboard
            </Link>
          )}

          {(user.role === "AFFILIATE" || user.role === "ADMIN" || user.role === "SUPER_ADMIN") && (
            <Link
              href="/affiliate"
              className="block px-4 py-2 text-sm text-foreground hover:bg-muted"
              onClick={() => setOpen(false)}
            >
              Affiliate Dashboard
            </Link>
          )}

          <form action={logout}>
            <button
              type="submit"
              className="block w-full px-4 py-2 text-left text-sm text-foreground hover:bg-muted"
            >
              Log out
            </button>
          </form>
        </div>
      )}
    </div>
  )
}
